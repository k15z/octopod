from enum import Enum
from typing import Annotated
from uuid import UUID
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

from octopod.config import config

user_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="user/token", scheme_name="user_oauth2"
)
creator_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="creator/token", scheme_name="creator_oauth2"
)


class TokenKind(str, Enum):
    User = "user"
    Creator = "creator"


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: UUID
    kind: TokenKind


def create_token(data: TokenData, expires_delta: timedelta = timedelta(days=30)) -> str:
    to_encode = jsonable_encoder(data)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_user_token(token: Annotated[str, Depends(user_oauth2_scheme)]) -> TokenData:
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])
        token_data = TokenData(**payload)
        return token_data
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_creator_token(
    token: Annotated[str, Depends(creator_oauth2_scheme)]
) -> TokenData:
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])
        token_data = TokenData(**payload)
        return token_data
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
