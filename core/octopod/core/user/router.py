from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from octopod.core.auth import (
    Token,
    TokenKind,
    TokenData,
    decode_user_token,
    create_token,
)
from octopod.database import get_db
from octopod.core.user.schema import (
    UserProfile,
    RegisterUserRequest,
    UserStatistics,
    CreatorAmount,
)
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


@router.get("/statistics")
async def user_statistics(
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
) -> UserStatistics:
    query = """
    SELECT
        SUM(amount) AS lifetime_spend,
        SUM(CASE WHEN created_at < NOW() - INTERVAL '7 DAYS' THEN 0 ELSE amount END) AS weekly_spend
    FROM payment
    WHERE user_id = :user_id
    """
    row = (await db.execute(text(query), {"user_id": token.id})).fetchone()
    if row is None:
        lifetime_spend = weekly_spend = 0
    else:
        lifetime_spend, weekly_spend = row

    query = """
    SELECT
        sum(podclip.duration) as seconds_listened
    FROM play_event
    JOIN podclip ON play_event.podclip_id = podclip.id
    WHERE user_id = :user_id
    """
    result = (await db.execute(text(query), {"user_id": token.id})).scalar_one()
    if result is None:
        seconds_listened = 0
    else:
        seconds_listened = result

    query = """
    SELECT
        sum(podcast.duration-podclip.duration) as seconds_listened
    FROM play_event
    JOIN podclip ON play_event.podclip_id = podclip.id
    JOIN podcast ON play_event.podcast_id = podcast.id
    WHERE user_id = :user_id
    """
    result = (await db.execute(text(query), {"user_id": token.id})).scalar_one()
    if result is None:
        seconds_saved = 0
    else:
        seconds_saved = int(result)

    query = """
    SELECT
        creator.name,
        SUM(amount) as amount
    FROM payment
    JOIN creator ON payment.creator_id = creator.id
    WHERE user_id = :user_id
    GROUP BY creator.name
    """
    result = (await db.execute(text(query), {"user_id": token.id})).fetchall()
    creator_amounts = [
        CreatorAmount(
            creator=row[0],
            amount=row[1],
        )
        for row in result
    ]

    return UserStatistics(
        weekly_spend=weekly_spend,
        lifetime_spend=lifetime_spend,
        seconds_listened=seconds_listened,
        seconds_saved=seconds_saved,
        creator_amounts=creator_amounts,
    )
