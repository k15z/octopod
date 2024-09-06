from typing import List

from pydub import AudioSegment  # type: ignore

from octopod.ai.transcribe import transcribe
from octopod.ai.podclip import segments_to_podclips, Podclip


def extract_podclips(source: AudioSegment) -> List[Podclip]:
    """Extract podclips from an audio file."""
    segments = transcribe(source)
    return segments_to_podclips(segments)


if __name__ == "__main__":
    from pydub import AudioSegment

    source = AudioSegment.from_file("../examples/big_ideas.mp3")
    print(extract_podclips(source))
