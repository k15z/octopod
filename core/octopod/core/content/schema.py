from typing import List, Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field


class Podcast(BaseModel):

    id: UUID
    title: str = Field(description="Title of the podcast.")
    description: str = Field(description="Description of the podcast.")
    creator_name: str = Field(description="Name of the creator.")
    published_at: Optional[datetime] = Field(
        description="Date and time of publication."
    )
    duration: float = Field(description="Duration in seconds.")
    cover_url: Optional[str] = Field(description="URL to the podcast cover image.")
    audio_url: Optional[str] = Field(description="Audio file with the full podcast.")


class Podclip(BaseModel):

    id: UUID
    title: str = Field(description="Title of the podclip.")
    description: str = Field(description="Description of the podclip.")
    audio_url: str = Field(description="Audio file with intro/outro.")
    duration: int = Field(description="Duration in seconds including intro/outro.")

    podcast: Podcast = Field(
        description="The podcast that the clip was extracted from."
    )
    start_time: float = Field(
        description="Start time in seconds in the parent podcast."
    )
    end_time: float = Field(description="End time in seconds in the parent podcast.")


class ListPodcastsResponse(BaseModel):
    results: List[Podcast]


class ListPodclipsResponse(BaseModel):
    results: List[Podclip]


class MakePlaylistRequest(BaseModel):
    duration: int = Field(description="Target duration in seconds for the playlist.")


class MakePlaylistResponse(BaseModel):
    duration: int
    source: str
    results: List[Podclip]


class CreatePodcastRequest(BaseModel):
    title: str = Field(description="Title of the podcast.")
    description: str = Field(description="Description of the podcast.")
    published_at: Optional[datetime] = Field(
        description="Date and time of publication."
    )
    cover_url: Optional[str] = Field(description="URL to the podcast cover image.")
    audio_url: str = Field(description="Audio file with the full podcast.")


class UpdatePodcastRequest(BaseModel):
    title: Optional[str] = Field(description="Title of the podcast.")
    description: Optional[str] = Field(description="Description of the podcast.")
    published_at: Optional[datetime] = Field(
        description="Date and time of publication."
    )
    cover_url: Optional[str] = Field(description="URL to the podcast cover image.")


class UpdatePodclipRequest(BaseModel):
    title: str = Field(description="Title of the podclip.")
    description: str = Field(description="Description of the podclip.")


class PresignedUrlResponse(BaseModel):
    file_url: str = Field(description="URL to access the file after uploading.")
    presigned_url: str = Field(description="Presigned URL to upload the file.")
