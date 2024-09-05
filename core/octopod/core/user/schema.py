from uuid import UUID
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
