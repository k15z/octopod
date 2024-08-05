import os
import json
import shutil
import dirtyjson
from typing import List
from dataclasses import dataclass

from openai import OpenAI

from mako.template import Template
from pydub import AudioSegment


client = OpenAI()

@dataclass
class Segment:
    start: float
    end: float
    text: str


def load_segments(path_to_transcript: str) -> List[Segment]:
    with open(path_to_transcript, "rt") as fin:
        return [
            Segment(x["start"], x["end"], x["text"]) for x in json.load(fin)["segments"]
        ]


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
class MediaCard:
    title: str
    description: str
    start_time: float
    end_time: float
    full_text: str


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

    def media_card(self, topic: Topic) -> MediaCard:
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
        print(prompt)
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

        print(indices)
        start, end = indices["start"], indices["end"]
        try:
            start_ts, end_ts = lines[start].start, lines[end].end
        except IndexError:
            print(indices)
            raise ValueError("Invalid indices provided")

        return MediaCard(
            title=topic.title,
            description=topic.description,
            start_time=start_ts,
            end_time=end_ts,
            full_text=" ".join(x.text for x in lines[start:end]),
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


shutil.rmtree("output", ignore_errors=True)
os.makedirs("output", exist_ok=True)

sound = AudioSegment.from_mp3("content/browser.mp3")
segments = load_segments("content/browser.json")
windows = segments_to_windows(segments)
for window in windows:
    for topic in window.topics():
        media_card = window.media_card(topic)
        key = "-".join(media_card.title.lower().split())
        excerpt = sound[media_card.start_time*1000:media_card.end_time*1000].fade_in(1_000).fade_out(1_000)
        excerpt.export(f"output/{key}.mp3", format="mp3")
        with open(f"output/{key}.json", "wt") as fout:
            json.dump(
                {
                    "title": media_card.title,
                    "description": media_card.description,
                    "start_time": media_card.start_time,
                    "end_time": media_card.end_time,
                    "text": media_card.full_text,
                },
                fout,
                indent=4,
            )
        print(f"Exported {key}")
        print("\n"*10)
