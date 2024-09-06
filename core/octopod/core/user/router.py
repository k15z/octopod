from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from octopod.core.auth import (
    Token,
    TokenKind,
    TokenData,
    decode_user_token,
    create_token,
)
from octopod.database import get_db
from octopod.core.user.schema import UserProfile, RegisterUserRequest
from octopod.models import User

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register")
async def user_register(
    request: RegisterUserRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = User(email=request.email, nwc_string=request.nwc_string)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_token(TokenData(id=user.id, kind=TokenKind.User))
    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.post("/token")
async def user_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
) -> Token:
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    token = create_token(TokenData(id=user.id, kind=TokenKind.User))
    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.get("/profile")
async def user_profile(
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
) -> UserProfile:
    result = await db.execute(select(User).where(User.id == token.id))
    user = result.scalar()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    return UserProfile(id=user.id, email=user.email, nwc_string=user.nwc_string)
