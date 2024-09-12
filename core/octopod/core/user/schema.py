from uuid import UUID
from typing import List
from pydantic import BaseModel


class UserProfile(BaseModel):
    id: UUID
    email: str
    nwc_string: str


class CreateUserRequest(BaseModel):
    email: str
    nwc_string: str


class GetUserInfoResponse(BaseModel):
    user: UserProfile


class RegisterUserRequest(BaseModel):
    email: str
    nwc_string: str


class CreatorAmount(BaseModel):
    creator: str
    amount: int
    cover_url: str


class UserStatistics(BaseModel):

    weekly_spend: int
    lifetime_spend: int
    seconds_listened: int
    seconds_saved: int
    num_tips: int
    num_plays: int
    creator_amounts: List[CreatorAmount]
