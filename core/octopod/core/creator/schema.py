from pydantic import BaseModel


class CreatorProfile(BaseModel):
    name: str
    email: str
    uma_address: str


class RegisterCreatorRequest(BaseModel):
    email: str
    name: str
    uma_address: str
