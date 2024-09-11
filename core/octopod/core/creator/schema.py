from uuid import UUID
from datetime import datetime

from pydantic import BaseModel


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
    amount: int
