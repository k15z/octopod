"""
curl -s http://192.168.1.110:8000/v1/audio/transcriptions -F "file=@content/browser.mp3" -F "language=en" -F "response_format=verbose_json" -F "stream=true" -F "model=Systran/faster-whisper-small"
"""
from time import time
from openai import OpenAI

start = time()
stt_client = OpenAI(base_url="http://192.168.1.110:8000/v1/")
with open("output/challenging-expert-predictions.mp3", "rb") as audio_file:
    response = stt_client.audio.transcriptions.create(
        file=audio_file,
        model="Systran/faster-whisper-small",
        response_format="verbose_json",
        timestamp_granularities=["segment"],
    )
print(response)
print(f"Transcribed in {time() - start:.2f}s")
quit()
