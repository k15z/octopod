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


class UserStatistics(BaseModel):

    weekly_spend: int
    lifetime_spend: int
    seconds_listened: int
    seconds_saved: int
    creator_amounts: List[CreatorAmount]
