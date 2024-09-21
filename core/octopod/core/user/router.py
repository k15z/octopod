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
    UpdateUserRequest,
)
from octopod.models import User, Podcast

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/register")
async def user_register(
    request: RegisterUserRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = User(
        email=request.email,
        nwc_string=request.nwc_string,
        first_name=request.first_name,
        last_name=request.last_name,
        picture_url=request.picture_url,
        nwc_refresh_token=request.nwc_refresh_token,
        nwc_expires_at=request.nwc_expires_at,
        access_token_expires_at=request.access_token_expires_at,
    )
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
    return UserProfile(
        id=user.id,
        email=user.email,
        nwc_string=user.nwc_string,
        first_name=user.first_name,
        last_name=user.last_name,
        picture_url=user.picture_url,
    )


@router.post("/profile")
async def update_user_profile(
    request: UpdateUserRequest,
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
    if request.first_name is not None:
        user.first_name = request.first_name
    if request.last_name is not None:
        user.last_name = request.last_name
    if request.picture_url is not None:
        user.picture_url = request.picture_url
    if request.nwc_string is not None:
        user.nwc_string = request.nwc_string
    if request.nwc_refresh_token is not None:
        user.nwc_refresh_token = request.nwc_refresh_token
    if request.nwc_expires_at is not None:
        user.nwc_expires_at = request.nwc_expires_at
    if request.access_token_expires_at is not None:
        user.access_token_expires_at = request.access_token_expires_at
    await db.commit()
    return UserProfile(
        id=user.id,
        email=user.email,
        nwc_string=user.nwc_string,
        first_name=user.first_name,
        last_name=user.last_name,
        picture_url=user.picture_url,
    )


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
        lifetime_spend, weekly_spend = 0, 0
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
        COUNT(*) as num_plays,
        sum(podcast.duration-podclip.duration) as seconds_saved
    FROM play_event
    JOIN podclip ON play_event.podclip_id = podclip.id
    JOIN podcast ON play_event.podcast_id = podcast.id
    WHERE user_id = :user_id
    """
    row = (await db.execute(text(query), {"user_id": token.id})).fetchone()
    if row is None:
        num_plays, seconds_saved = (0, 0)
    else:
        num_plays, seconds_saved = row

    query = """
    SELECT
        creator_id,
        creator.name,
        SUM(amount) as amount
    FROM payment
    JOIN creator ON payment.creator_id = creator.id
    WHERE user_id = :user_id
    GROUP BY creator_id, creator.name
    ORDER BY amount DESC
    LIMIT 5
    """
    result = (await db.execute(text(query), {"user_id": token.id})).fetchall()
    creator_amounts = []
    for row in result:
        if row is None:
            continue
        example = (
            (await db.execute(select(Podcast).where(Podcast.creator_id == row[0])))
            .scalars()
            .first()
        )
        if example is None or example.cover_url is None:
            continue
        creator_amounts.append(
            CreatorAmount(
                creator=row[1],
                amount=row[2],
                cover_url=example.cover_url,
            )
        )

    query = """
    SELECT
        COUNT(*) as num_tips
    FROM tip_event
    WHERE user_id = :user_id
    """
    result = (await db.execute(text(query), {"user_id": token.id})).scalar_one()
    num_tips = int(result) if result is not None else 0

    return UserStatistics(
        weekly_spend=weekly_spend or 0,
        lifetime_spend=lifetime_spend or 0,
        seconds_listened=seconds_listened or 0,
        seconds_saved=seconds_saved or 0,
        creator_amounts=creator_amounts,
        num_plays=num_plays or 0,
        num_tips=num_tips or 0,
    )
