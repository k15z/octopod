import tempfile
import shutil
import hashlib
from typing import List
from uuid import UUID

import boto3
from pydub import AudioSegment
from fastapi import FastAPI, Depends, File, HTTPException, UploadFile
from sqlalchemy import select, text
from redis import Redis
from rq import Queue
from pydantic import BaseModel

from octopod.worker import handle
from octopod.config import config
from octopod.database import AsyncSession, get_db, Submission, Run


app = FastAPI(
    title="Octopod",
    description="Octopod is an API for extracting highlights from podcast-like audio files.",
)
queue = Queue(connection=Redis(host=config.REDIS_HOST))


def get_md5_hash(file_path):
    md5 = hashlib.md5()
    with open(file_path, "rb") as file:
        while chunk := file.read(4096):
            md5.update(chunk)
    return md5.hexdigest()


class HighlightResponse(BaseModel):
    id: UUID
    start_time: float
    end_time: float
    title: str
    description: str
    text: str


class SubmissionResponse(BaseModel):
    id: UUID
    duration: float
    status: str
    progress: float


class SubmissionWithHighlightsResponse(SubmissionResponse):
    highlights: List[HighlightResponse]


class ListSubmissionResponse(BaseModel):
    submissions: List[SubmissionResponse]


@app.post("/api/v1/submit")
async def submit(
    file: UploadFile = File(),
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """Submit an audio file for processing.

    Example:
    ```
    curl -s http://localhost:8000/api/v1/submit -F "file=@examples/pharma.mp3"
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
        title="",
        description="",
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
        s3.create_bucket(Bucket="uploads")
    except Exception:
        pass
    s3.upload_file(local_file, config.S3_UPLOAD_BUCKET, destination)
    print(f"Uploaded to S3: {destination}")

    queue.enqueue(handle, submission.id, job_timeout=600)
    return SubmissionResponse(
        id=submission.id,
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
    """
    )

    result = await db.execute(q)
    rows = result.fetchall()

    return ListSubmissionResponse(
        submissions=[
            SubmissionResponse(
                id=id,
                duration=duration,
                status=status or "IN_QUEUE",
                progress=progress or 0.0,
            )
            for id, duration, status, progress in rows
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
        duration=submission.duration,
        status=most_recent_run.status,
        progress=most_recent_run.progress if most_recent_run else 0.0,
        highlights=(
            [
                HighlightResponse(
                    id=highlight.id,
                    start_time=highlight.start_time,
                    end_time=highlight.end_time,
                    title=highlight.title,
                    description=highlight.description,
                    text=highlight.text,
                )
                for highlight in most_recent_run.highlights
            ]
            if most_recent_run
            else []
        ),
    )
