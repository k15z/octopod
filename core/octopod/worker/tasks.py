from uuid import UUID, uuid4
import requests
import tempfile
import random

import boto3
from tqdm import tqdm
from pydub import AudioSegment  # type: ignore
from sqlalchemy import select

from octopod.config import config
from octopod.database import SessionLocal
from octopod.models import Podcast, PodcastStatus, Podclip
from octopod.ai import extract_podclips
from octopod.ai.podclip import podclip_intro


def download_mp3(url: str) -> str:
    # Send a GET request to download the file
    response = requests.get(url, stream=True)
    response.raise_for_status()  # Raise an exception for bad responses

    # Create a temporary file
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
        # Write the content to the temporary file
        for chunk in tqdm(response.iter_content(chunk_size=1_048_576)):
            temp_file.write(chunk)

        # Return the path of the temporary file
        return temp_file.name
    
def get_background_music() -> AudioSegment:
    s3 = boto3.resource("s3")
    bucket = s3.Bucket(config.AWS_S3_BUCKET)
    objects = bucket.objects.filter(Prefix="background/")

    songs = [object.key for object in objects if object.key.endswith(".mp3")]

    song = random.choice(songs)

    return AudioSegment.from_file(download_mp3(f"https://{config.AWS_S3_BUCKET}.s3.amazonaws.com/{song}"))


async def set_podcast_status(podcast_id: UUID, status: PodcastStatus) -> Podcast:
    async with SessionLocal() as session:
        result = await session.execute(select(Podcast).where(Podcast.id == podcast_id))
        podcast = result.scalar()
        if not podcast:
            raise ValueError(f"Podcast with id {podcast_id} not found")

        podcast.status = status
        await session.commit()
    return podcast


async def set_podcast_duration(podcast_id: UUID, duration: float) -> Podcast:
    async with SessionLocal() as session:
        result = await session.execute(select(Podcast).where(Podcast.id == podcast_id))
        podcast = result.scalar()
        if not podcast:
            raise ValueError(f"Podcast with id {podcast_id} not found")

        podcast.duration = duration
        await session.commit()
    return podcast


async def handle_podcast(podcast_id: UUID):
    podcast = await set_podcast_status(podcast_id, PodcastStatus.Processing)

    path_to_mp3 = download_mp3(podcast.audio_url)
    audio = AudioSegment.from_file(path_to_mp3)
    podcast = await set_podcast_duration(
        podcast_id, len(audio) / 1000
    )  # Duration in seconds

    try:
        podclips = extract_podclips(audio)
        for podclip in podclips:
            async with SessionLocal() as session:
                intro_text = await podclip_intro(podclip, podcast_id)
            intro_text += AudioSegment.silent(duration=2000)
            intro_length = len(intro_text)

            intro_music = get_background_music()[:intro_length]

            target_loudness = -32
            intro_music = intro_music.apply_gain(target_loudness - intro_music.dBFS)
            intro_music = intro_music.fade_out(3000)

            intro = intro_text.overlay(intro_music)
            sound = audio[int(podclip.start_time * 1000) : int(podclip.end_time * 1000)].fade_in(2000)
            sound = intro + sound

            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                sound.export(temp_file.name, format="mp3")

                key = f"{uuid4()}.mp3"
                boto3.client("s3").upload_file(
                    temp_file.name,
                    config.AWS_S3_BUCKET,
                    key,
                )

                audio_url = f"https://{config.AWS_S3_BUCKET}.s3.amazonaws.com/{key}"
                print(audio_url)

            async with SessionLocal() as session:
                session.add(
                    Podclip(
                        podcast_id=podcast_id,
                        title=podclip.title,
                        description=podclip.description,
                        audio_url=audio_url,
                        duration=podclip.end_time - podclip.start_time,
                        start_time=podclip.start_time,
                        end_time=podclip.end_time,
                        embedding=podclip.embedding,
                    )
                )
                await session.commit()
    except Exception as e:
        print(e)
        await set_podcast_status(podcast_id, PodcastStatus.Error)

    await set_podcast_status(podcast_id, PodcastStatus.Ready)


if __name__ == "__main__":
    import asyncio

    asyncio.run(handle_podcast(UUID("0191c5b2-0041-3e9b-a103-b5ba127bd715")))
