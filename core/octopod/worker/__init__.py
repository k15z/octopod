import asyncio
from uuid import UUID
from typing import List
from dataclasses import dataclass

import boto3
import dirtyjson
from openai import OpenAI
from mako.template import Template
from sqlalchemy.sql.expression import select

from octopod.config import config
from octopod.database import SessionLocal, Submission, Run, Segment, Highlight


client = OpenAI()


@dataclass
class Topic:
    title: str
    description: str


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
        prompt = TOPICS_PROMPT.render(transcript=self.text())
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
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
        return [Topic(x["title"], x["description"]) for x in response]

    def highlight(self, topic: Topic) -> Highlight:
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
            model="gpt-3.5-turbo",
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

        return Highlight(
            title=topic.title,
            description=topic.description,
            start_time=start_ts,
            end_time=end_ts,
            text=" ".join(x.text for x in lines[start:end]),
        )


def segments_to_windows(
    segments: List[Segment], window_size: int = 100, context_size: int = 25
) -> Window:
    windows = []
    for i in range(0, len(segments), window_size):
        window = segments[i : i + window_size]
        pre_context = segments[max(0, i - context_size) : i]
        post_context = segments[i + window_size : i + window_size + context_size]
        windows.append(Window(window, pre_context, post_context))
    return windows


async def handle(submission_id: UUID):
    # Load submission from database/S3
    async with SessionLocal() as session:
        submission = await session.execute(
            select(Submission).filter(Submission.id == submission_id)
        )
        submission = submission.scalars().first()
        s3 = boto3.client(
            "s3",
            endpoint_url=config.S3_ENDPOINT_URL,
            aws_access_key_id=config.S3_ACCESS_KEY_ID,
            aws_secret_access_key=config.S3_SECRET_ACCESS_KEY,
        )
        s3.download_file(config.S3_UPLOAD_BUCKET, submission.audio_uri, "/tmp/tmp.mp3")
        print(f"Downloaded {submission.audio_uri}")

        # Create a run
        run = Run(
            submission_id=submission_id, status="TRANSCRIBE", version=0, progress=0.0
        )
        session.add(run)
        await session.commit()
        await session.refresh(run)
        print(f"Created run {run.id}")

        # Transcribe audio
        print("Transcribing audio")
        stt_client = OpenAI(base_url="http://70.228.65.239:8000/v1/")
        with open("/tmp/tmp.mp3", "rb") as audio_file:
            response = stt_client.audio.transcriptions.create(
                file=audio_file,
                model="Systran/faster-whisper-small",
                response_format="verbose_json",
                timestamp_granularities=["segment"],
            )
        print("Transcription complete")

        segments = [
            Segment(
                run_id=run.id,
                start_time=segment["start"],
                end_time=segment["end"],
                text=segment["text"],
            )
            for segment in response.segments
        ]
        run.status = "ANALYZE"
        session.add_all(segments)
        await session.commit()

        # Extract topics and highlights
        windows = segments_to_windows(segments)
        for window in windows:
            for topic in window.topics():
                print(f"Extracting highlight for {topic.title}")
                highlight = window.highlight(topic)
                if not highlight:
                    continue
                highlight.run_id = run.id
                session.add(highlight)
                await session.commit()
        
        run.status = "COMPLETE"
        await session.commit()


if __name__ == "__main__":
    asyncio.run(handle("3429418f-9123-4e1d-8ec1-182b69c9df66"))
