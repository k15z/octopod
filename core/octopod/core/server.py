import tempfile
import shutil
import hashlib
from typing import Annotated, List, Optional, Tuple
from datetime import datetime
from uuid import UUID
from random import shuffle

import boto3
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from fastapi import FastAPI, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select, text
from redis import Redis
from rq import Queue
from pydantic import BaseModel

from octopod.worker import handle
from octopod.config import config
from octopod.database import AsyncSession, get_db, Submission, Run, Highlight


app = FastAPI(
    title="Octopod",
    description="Octopod is an API for extracting highlights from podcast-like audio files.",
    generate_unique_id_function=lambda route: route.endpoint.__name__,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

queue = Queue(connection=Redis(host=config.REDIS_HOST))


def get_md5_hash(file_path):
    md5 = hashlib.md5()
    with open(file_path, "rb") as file:
        while chunk := file.read(4096):
            md5.update(chunk)
    return md5.hexdigest()


class HighlightSourceResponse(BaseModel):
    id: UUID
    title: str
    description: str


class HighlightResponse(BaseModel):
    id: UUID
    start_time: float
    end_time: float
    title: str
    description: str
    text: str

    source: Optional[HighlightSourceResponse] = None


class SubmissionResponse(BaseModel):
    id: UUID
    created_at: datetime
    title: str
    description: str
    duration: float
    status: str
    progress: float


class SubmissionWithHighlightsResponse(SubmissionResponse):
    highlights: List[HighlightResponse]


class ListSubmissionResponse(BaseModel):
    submissions: List[SubmissionResponse]


class ListHighlightResponse(BaseModel):
    highlights: List[HighlightResponse]


class MakePlaylistResponse(BaseModel):
    playlist: List[HighlightResponse]


@app.post("/api/v1/submit")
async def submit(
    title: Annotated[str, Form()],
    description: Annotated[str, Form()],
    file: UploadFile = File(),
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """Submit an audio file for processing.

    Example:
    ```
    curl -s http://localhost:8000/api/v1/submit \
        -F "file=@examples/big_ideas.mp3" \
        -F "title=Big ideas" \
        -F "description=Big ideas is a podcast about..."
    ```
    """
    # Write to a temporary file
    local_file = tempfile.NamedTemporaryFile(delete=False).name
    with open(local_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    print(f"Saved to {local_file}")

    # Validate with pydub and transcode to MP3
    sound = AudioSegment.from_file(local_file)
    print(f"Loaded {sound.duration_seconds} seconds of audio")
    """
    sound.export(local_file, format="mp3")
    print(f"Transcoded to MP3")
    """

    # Generate a unique submission ID
    submission_hash = get_md5_hash(local_file)
    destination = f"{submission_hash}.mp3"
    print(f"Submission ID: {submission_hash}")

    # Return submission ID + metadata
    submission = Submission(
        audio_uri=destination,
        duration=sound.duration_seconds,
        title=title,
        description=description,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    print(f"Saved to database: {submission.id}")

    # Upload to S3 in background thread and launch a run.
    s3 = boto3.client(
        "s3",
        endpoint_url=config.S3_ENDPOINT_URL,
        aws_access_key_id=config.S3_ACCESS_KEY_ID,
        aws_secret_access_key=config.S3_SECRET_ACCESS_KEY,
    )
    try:
        s3.create_bucket(Bucket=config.S3_UPLOAD_BUCKET)
    except Exception:
        pass
    s3.upload_file(local_file, config.S3_UPLOAD_BUCKET, destination)
    print(f"Uploaded to S3: {destination}")

    queue.enqueue(handle, submission.id, job_timeout=600)
    return SubmissionResponse(
        id=submission.id,
        created_at=submission.created_at,
        title=submission.title,
        description=submission.description,
        duration=submission.duration,
        status="IN_QUEUE",
        progress=0.0,
    )


@app.get("/api/v1/")
async def list_submissions(
    db: AsyncSession = Depends(get_db),
) -> ListSubmissionResponse:
    """List all submission IDs."""
    # Raw SQL since I can't be bothered to figure out how to do this with SQLAlchemy
    q = text(
        """
    WITH most_recent_run AS (
        SELECT
            submission_id,
            MAX(created_at) AS created_at
        FROM
            run
        GROUP BY
            submission_id
    )
         
    SELECT
        submission.id,
        submission.created_at,
        submission.title,
        submission.description,
        submission.duration,
        run.status,
        run.progress
    FROM
        submission
    LEFT JOIN
        run ON submission.id = run.submission_id
    LEFT JOIN
        most_recent_run ON submission.id = most_recent_run.submission_id
    WHERE run.created_at = most_recent_run.created_at OR run.created_at IS NULL
    ORDER BY
        submission.created_at DESC
    """
    )

    result = await db.execute(q)
    rows = result.fetchall()

    return ListSubmissionResponse(
        submissions=[
            SubmissionResponse(
                id=id,
                created_at=created_at,
                title=title,
                description=description,
                duration=duration,
                status=status or "IN_QUEUE",
                progress=progress or 0.0,
            )
            for id, created_at, title, description, duration, status, progress in rows
        ]
    )


@app.get("/api/v1/submission/{submission_id}")
async def get_submission(
    submission_id: str,
    db: AsyncSession = Depends(get_db),
) -> SubmissionWithHighlightsResponse:
    """Get the most recent run for a submission."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    most_recent_run = await db.execute(
        select(Run)
        .filter(Run.submission_id == submission_id)
        .order_by(Run.created_at.desc())
        .limit(1)
    )
    most_recent_run = most_recent_run.scalars().first()
    if most_recent_run:
        await db.refresh(most_recent_run, ["highlights"])

    return SubmissionWithHighlightsResponse(
        id=submission.id,
        created_at=submission.created_at,
        title=submission.title,
        description=submission.description,
        duration=submission.duration,
        status=most_recent_run.status,
        progress=most_recent_run.progress if most_recent_run else 0.0,
        highlights=(
            list(
                sorted(
                    [
                        HighlightResponse(
                            id=highlight.id,
                            start_time=highlight.start_time,
                            end_time=highlight.end_time,
                            title=highlight.title,
                            description=highlight.description,
                            text=highlight.text,
                            source=None,
                        )
                        for highlight in most_recent_run.highlights
                    ],
                    key=lambda x: x.start_time,
                )
            )
            if most_recent_run
            else []
        ),
    )


@app.get("/api/v1/highlight/{highlight_id}")
def get_highlight(highlight_id: UUID):
    """Return the MP3 from S3."""
    key = f"{str(highlight_id)}.mp3"
    s3 = boto3.client(
        "s3",
        endpoint_url=config.S3_ENDPOINT_URL,
        aws_access_key_id=config.S3_ACCESS_KEY_ID,
        aws_secret_access_key=config.S3_SECRET_ACCESS_KEY,
    )
    try:
        s3.download_file(config.S3_HIGHLIGHT_BUCKET, key, "/tmp/tmp.mp3")
    except Exception:
        raise HTTPException(status_code=404, detail="Highlight not found")
    return FileResponse("/tmp/tmp.mp3")


@app.get("/api/v1/highlight/")
async def list_highlight(
    db: AsyncSession = Depends(get_db),
) -> ListHighlightResponse:
    """List all highlights."""
    highlights = await db.execute(select(Highlight))
    highlights = highlights.scalars().all()
    for highlight in highlights:
        await db.refresh(highlight, ["run"])
        await db.refresh(highlight.run, ["submission"])

    return ListHighlightResponse(
        highlights=[
            HighlightResponse(
                id=highlight.id,
                start_time=highlight.start_time,
                end_time=highlight.end_time,
                title=highlight.title,
                description=highlight.description,
                text=highlight.text,
                source=HighlightSourceResponse(
                    id=highlight.run.submission.id,
                    title=highlight.run.submission.title,
                    description=highlight.run.submission.description,
                ),
            )
            for highlight in highlights
        ]
    )


@app.get("/api/v1/playlist/")
async def make_playlist(
    length: int,
    db: AsyncSession = Depends(get_db),
) -> ListHighlightResponse:
    """Make a playlist of the target length."""
    highlights = await db.execute(select(Highlight))
    highlights = highlights.scalars().all()
    for highlight in highlights:
        await db.refresh(highlight, ["run"])
        await db.refresh(highlight.run, ["submission"])

    # For now, we'll just shuffle them and pop them until we reach the target length. But
    # eventually this should be ranked by user preferences.
    highlights = [
        HighlightResponse(
            id=highlight.id,
            start_time=highlight.start_time,
            end_time=highlight.end_time,
            title=highlight.title,
            description=highlight.description,
            text=highlight.text,
            source=HighlightSourceResponse(
                id=highlight.run.submission.id,
                title=highlight.run.submission.title,
                description=highlight.run.submission.description,
            ),
        )
        for highlight in highlights
    ]
    shuffle(highlights)

    current = 0
    playlist = []
    source_to_windows = {}

    def _overlap(windows: List[Tuple[int, int]], candidate: Tuple[int, int]):
        """
        Example:
            windows = [(1,5), (10,15)]
            candidate = (4,8)
            overlap = 1 # 4-5 is the only overlap
        """
        overlap = 0
        c_low, c_up = candidate
        for w_low, w_up in windows:
            if w_low >= c_up or w_up <= c_low:
                # 0 overlap, no worries
                continue
            overlap += min(w_up, c_up) - max(w_low, c_low)
        return overlap / (c_up - c_low)

    for _ in range(100):
        candidate = highlights.pop()
        if (
            _overlap(
                source_to_windows.get(candidate.source_id, []),
                (candidate.start_time, candidate.end_time),
            )
            > 0.1
        ):
            continue  # Reject candidates who overlap signifiacntly with other chosen highlights from the same source.
        if current + candidate.end_time - candidate.start_time <= length:
            playlist.append(candidate)
            current += candidate.end_time - candidate.start_time
            source_to_windows.setdefault(candidate.source_id, []).append(
                (candidate.start_time, candidate.end_time)
            )

    return MakePlaylistResponse(playlist=playlist)
