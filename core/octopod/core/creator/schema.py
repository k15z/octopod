from uuid import UUID
from datetime import datetime
from typing import List

from pydantic import BaseModel
from octopod.core.content.schema import Podcast, Podclip


class CreatorProfile(BaseModel):
    name: str
    email: str
    uma_address: str


class RegisterCreatorRequest(BaseModel):
    email: str
    name: str
    uma_address: str


class PaymentResponse(BaseModel):
    id: UUID
    created_at: datetime
    sender_id: UUID
    sender_email: str
    amount: float


class CreatorStatistics(BaseModel):

    num_plays: int
    skip_rate: float
    num_listeners: int
    seconds_played: int
    tip_revenue: int
    stream_revenue: int


class DashboardReponse(BaseModel):

    statistics: CreatorStatistics
    top_podcasts: List[Podcast]
    top_podclips: List[Podclip]


class PodclipAnalytics(Podclip):

    num_plays: int
    skip_rate: float
    num_listeners: int
    tip_revenue: int
    stream_revenue: int


class PodcastAnalytics(BaseModel):

    podcast: Podcast
    podclips: List[PodclipAnalytics]
