from typing import List, Optional
from dataclasses import dataclass
import tempfile

from sqlalchemy import select
from uuid import UUID

import concurrent.futures

import dirtyjson  # type: ignore
from openai import OpenAI
from pydub import AudioSegment
from mako.template import Template  # type: ignore

from octopod.config import config
from octopod.ai.transcribe import Segment
from octopod.database import SessionLocal
from octopod.models import Podcast, Creator

MAX_WORKERS = 4

MIN_PODCLIP_SECONDS = 60


@dataclass
class Topic:
    title: str
    description: str


@dataclass
class Podclip:
    title: str
    description: str
    start_time: float
    end_time: float
    text: str
    embedding: List[float]


TOPICS_PROMPT = Template(
    """
Here is a partial transcript of a podcast:
                         
```
${transcript}
```
                         
Given the above transcript, generate a JSON object describing interesting topics which were 
discussed in the podcast. Only include topics which were discussed in detail and not just
mentioned in passing. Further, ensure that the topics are distinct and do not overlap with
each other.

Each topic should be represented as an object with a short title and a longer description 
containing several sentences. Here is an example of how the JSON should be structured:

Example JSON:                         
{
    "topics": [
        {"title": "Topic 1", "description": "Description of topic 1"}
    ]
}
                         
Response JSON:
"""
)

EXCERPT_PROMPT = Template(
    """
Here is a partial transcript of a podcast:
                         
```
${transcript}
```
                         
Given the above transcript, specify the starting and ending line numbers to select passage of
text most relevant to the following topic:

```
${topic_title}
-----
${topic_description}
```

The passage should be a contiguous range of lines from the transcript and may include some 
context before and after the relevant lines so that it makes sense to the reader when read in
isolation. Here is an example of how the JSON should be structured:

Example JSON:                         
{
    "start": 10,
    "end": 100
}

Response:
"""
)


@dataclass
class Window:
    segments: List[Segment]
    pre_context: List[Segment]
    post_context: List[Segment]

    def text(self, context: bool = False) -> str:
        if context:
            return " ".join(
                x.text for x in self.pre_context + self.segments + self.post_context
            )
        return " ".join(x.text for x in self.segments)

    def topics(self) -> List[Topic]:
        client = OpenAI(api_key=config.OPENAI_API_KEY)
        prompt = TOPICS_PROMPT.render(transcript=self.text())
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Your task is to generate a JSON array describing interesting topics discussed in the podcast.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        try:
            response = dirtyjson.loads(response.choices[0].message.content)["topics"]
        except Exception:
            print(response.choices[0].message.content)
            raise ValueError("Failed to parse topics from response")
        return [Topic(x["title"], x["description"]) for x in response]  # type: ignore

    def podclip(self, topic: Topic) -> Optional[Podclip]:
        client = OpenAI(api_key=config.OPENAI_API_KEY)

        lines = []
        for segment in self.pre_context + self.segments + self.post_context:
            lines.append(segment)

        numbered_transcript = ""
        for i, line in enumerate(lines):
            numbered_transcript += f"{i}: {line.text}\n"

        prompt = EXCERPT_PROMPT.render(
            transcript=numbered_transcript,
            topic_title=topic.title,
            topic_description=topic.description,
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Your task is to generate a JSON array describing interesting topics discussed in the podcast.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
        try:
            indices = dirtyjson.loads(response.choices[0].message.content)
        except Exception:
            print(response.choices[0].message.content)
            raise ValueError("Failed to parse indices from response")

        start, end = indices["start"], indices["end"]
        try:
            start_ts, end_ts = lines[start].start_time, lines[end].end_time
        except IndexError:
            print(indices)
            return None

        embed = client.embeddings.create(
            model="text-embedding-3-small",
            input=topic.description,
        )

        return Podclip(
            title=topic.title,
            description=topic.description,
            start_time=start_ts,
            end_time=end_ts,
            text=" ".join(x.text for x in lines[start:end]),
            embedding=embed.data[0].embedding,
        )


def segments_to_windows(
    segments: List[Segment], window_size: int = 100, context_size: int = 25
) -> List[Window]:
    windows = []
    for i in range(0, len(segments), window_size):
        window = segments[i : i + window_size]
        pre_context = segments[max(0, i - context_size) : i]
        post_context = segments[i + window_size : i + window_size + context_size]
        windows.append(Window(window, pre_context, post_context))
    return windows


def _podclips(window: Window) -> List[Podclip]:
    podclips = []
    for topic in window.topics():
        podclip = window.podclip(topic)
        if (
            podclip is not None
            and podclip.end_time - podclip.start_time > MIN_PODCLIP_SECONDS
        ):
            print(
                f"Found podclip: {topic.title} ({podclip.start_time} -> {podclip.end_time})"
            )
            podclips.append(podclip)
    return podclips


def segments_to_podclips(segments: List[Segment]) -> List[Podclip]:
    windows = segments_to_windows(segments)
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        results = list(executor.map(_podclips, windows))
    return [podclip for result in results for podclip in result]

async def podclip_intro(clip: Podclip, podcast_uuid: UUID) -> AudioSegment:
    """Creates an intro for a podclip"""
    print(f"Looking up podclip information for {clip.title}")
    async with SessionLocal() as session:
        result = await session.execute(select(Creator.name).join(Podcast, Podcast.creator_id == Creator.id).where(Podcast.id == podcast_uuid))
        creator = result.scalar()
        if not creator:
            raise ValueError(f"Creator for podcast {podcast_uuid} not found")

    print("Generating intro for podclip")
    client = OpenAI(api_key=config.OPENAI_API_KEY)
    intro = f"From {creator}, on {clip.title}"

    response = client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=intro,
    )

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
        response.stream_to_file(temp_file.name)

        return AudioSegment.from_file(temp_file.name)
    
