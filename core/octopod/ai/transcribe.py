from typing import List
from pydantic import BaseModel
from pydub import AudioSegment  # type: ignore
from octopod.config import config
from openai import OpenAI
import concurrent.futures

CHUNK_MS = 5 * 60 * 1000
MAX_WORKERS = 4


class Segment(BaseModel):
    start_time: float
    end_time: float
    text: str


def _transcribe(path_to_file: str, offset_secs: float) -> List[Segment]:
    """Transcibe a single audio file.

    Args:
        path_to_file (str): Path to the audio file.
        offset_secs (float): Offset to add to the start and end times of the segments.
    """
    print(f"Transcribing {path_to_file} with offset {offset_secs}")
    client = OpenAI(
        api_key=config.OPENAI_API_KEY,
    )
    with open(path_to_file, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-1",
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )
    print(f"Finished transcribing {path_to_file}")
    return [
        Segment(
            start_time=segment["start"] + offset_secs,
            end_time=segment["end"] + offset_secs,
            text=segment["text"],
        )
        for segment in response.segments  # type: ignore
    ]


def transcribe(source: AudioSegment) -> List[Segment]:
    """Transcribe an audio file.

    Chunk the audio file into smaller segments and transcribe each segment in parallel.
    """
    print(f"Chunking audio file into {CHUNK_MS} ms segments")
    offset_ms = 0
    queue = []
    for i in range(0, len(source), CHUNK_MS):
        chunk_file = f"/tmp/tmp_{i}.mp3"
        chunk = source[i : i + CHUNK_MS]
        chunk.export(chunk_file, format="mp3")
        queue.append((chunk_file, offset_ms / 1000))
        offset_ms += CHUNK_MS
    print(f"Transcribing {len(queue)} segments in parallel")

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = list(executor.map(lambda x: _transcribe(x[0], x[1]), queue))
    return [segment for result in results for segment in result]
