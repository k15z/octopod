from uuid import UUID
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from octopod.core.content.schema import Podcast, Podclip
from octopod.core.auth import (
    Token,
    TokenData,
    TokenKind,
    create_token,
    decode_creator_token,
)
from octopod.database import get_db
from octopod.models import Creator, Payment, PlayEvent, SkipEvent, TipEvent
from octopod.core.creator.schema import (
    RegisterCreatorRequest,
    CreatorProfile,
    PaymentResponse,
    DashboardReponse,
    CreatorStatistics,
    PodcastAnalytics,
    PodclipAnalytics,
)
from octopod.core.content.router import get_podcast
from octopod.models import Podclip as PodclipModel, Podcast as PodcastModel

router = APIRouter(prefix="/creator", tags=["creator"])


@router.post("/register")
async def creator_register(
    request: RegisterCreatorRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    creator = Creator(
        name=request.name,
        email=request.email,
        uma_address=request.uma_address,
    )
    db.add(creator)
    await db.commit()
    await db.refresh(creator)
    token = create_token(TokenData(id=creator.id, kind=TokenKind.Creator))
    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.post("/token")
async def creator_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
) -> Token:
    result = await db.execute(
        select(Creator).where(Creator.email == form_data.username)
    )
    creator = result.scalar()
    if not creator:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    token = create_token(TokenData(id=creator.id, kind=TokenKind.Creator))
    return Token(
        access_token=token,
        token_type="bearer",
    )


@router.get("/profile")
async def creator_profile(
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> CreatorProfile:
    result = await db.execute(select(Creator).where(Creator.id == token.id))
    creator = result.scalar()
    if not creator:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
        )
    return CreatorProfile(
        name=creator.name,
        email=creator.email,
        uma_address=creator.uma_address,
    )


@router.get("/payments")
async def creator_payments(
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> List[PaymentResponse]:
    result = await db.execute(
        select(Payment)
        .where(Payment.creator_id == token.id)
        .order_by(Payment.created_at.desc())
    )
    payments = []
    for payment in result.scalars().all():
        await db.refresh(payment, ["user"])
        payments.append(
            PaymentResponse(
                id=payment.id,
                created_at=payment.created_at,
                sender_id=payment.user_id,
                sender_email=payment.user.email,
                amount=payment.amount,
            )
        )
    return payments


@router.get("/dashboard")
async def creator_dashboard(
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> DashboardReponse:
    # TODO: Make this less dumb.
    num_plays = (
        await db.execute(
            select(func.count(PlayEvent.id))
            .join(PodclipModel, PlayEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, PlayEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0

    num_skips = (
        await db.execute(
            select(func.count(SkipEvent.id))
            .join(PodclipModel, SkipEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, SkipEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0
    skip_rate = num_skips / (num_skips + num_plays) if num_skips + num_plays > 0 else 0

    num_listeners = (
        await db.execute(
            select(func.count(distinct(PlayEvent.user_id)))
            .join(PodclipModel, PlayEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, PlayEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0

    tip_revenue = (
        await db.execute(
            select(func.sum(Payment.amount))
            .select_from(TipEvent)
            .join(Payment)
            .join(PodclipModel, TipEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, TipEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0

    stream_revenue = (
        await db.execute(
            select(func.sum(Payment.amount))
            .select_from(PlayEvent)
            .join(Payment, PlayEvent.payment_id == Payment.id)
            .join(PodclipModel, PlayEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, PlayEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0

    seconds_listened = (
        await db.execute(
            select(func.sum(PodclipModel.duration))
            .select_from(PlayEvent)
            .join(PodclipModel, PlayEvent.podclip_id == PodclipModel.id)
            .join(PodcastModel, PlayEvent.podcast_id == PodcastModel.id)
            .where(PodcastModel.creator_id == token.id)
        )
    ).scalar_one_or_none() or 0

    podcasts = (
        (
            await db.execute(
                select(PodcastModel)
                .options(selectinload(PodcastModel.creator))
                .join(PlayEvent, PlayEvent.podcast_id == PodcastModel.id)
                .group_by(PodcastModel.id)
                .order_by(func.count().desc())
                .limit(3)
            )
        )
        .scalars()
        .all()
    )
    top_podcasts = [
        Podcast(
            id=content.id,
            title=content.title,
            description=content.description,
            creator_name=content.creator.name,
            published_at=content.published_at,
            duration=content.duration,
            cover_url=content.cover_url,
            audio_url=content.audio_url,
        )
        for content in podcasts
    ]

    podclips = (
        (
            await db.execute(
                select(PodclipModel)
                .options(
                    selectinload(PodclipModel.podcast).selectinload(
                        PodcastModel.creator
                    )
                )
                .join(PlayEvent, PlayEvent.podclip_id == PodclipModel.id)
                .group_by(PodclipModel.id)
                .order_by(func.count().desc())
                .limit(10)
            )
        )
        .scalars()
        .all()
    )
    top_podclips = [
        Podclip(
            id=content.id,
            title=content.title,
            description=content.description,
            audio_url=content.audio_url,
            duration=content.duration,
            start_time=content.start_time,
            end_time=content.end_time,
            podcast=Podcast(
                id=content.podcast.id,
                title=content.podcast.title,
                description=content.podcast.description,
                creator_name=content.podcast.creator.name,
                published_at=content.podcast.published_at,
                duration=content.podcast.duration,
                cover_url=content.podcast.cover_url,
                audio_url=content.podcast.audio_url,
            ),
        )
        for content in podclips
    ]

    return DashboardReponse(
        statistics=CreatorStatistics(
            stream_revenue=int(stream_revenue),
            tip_revenue=int(tip_revenue),
            num_plays=num_plays,
            skip_rate=skip_rate,
            seconds_played=seconds_listened,
            num_listeners=num_listeners,
        ),
        top_podcasts=top_podcasts,
        top_podclips=top_podclips,
    )


@router.get("/podcast/{podcast_id}")
async def podcast_breakdown(
    podcast_id: UUID,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> PodcastAnalytics:
    podcast = await get_podcast(podcast_id, db)
    # assert token.id == podcast.creator_id

    query = (
        select(PodclipModel)
        .where(PodclipModel.podcast_id == podcast_id)
        .order_by(PodclipModel.start_time.desc())
    )

    podclips = []
    for content in (await db.execute(query)).scalars().all():
        # TODO: Make this less inefficient.
        num_plays = (
            await db.execute(
                select(func.count(PlayEvent.id)).where(
                    PlayEvent.podclip_id == content.id
                )
            )
        ).scalar_one_or_none() or 0

        num_skips = (
            await db.execute(
                select(func.count(SkipEvent.id)).where(
                    SkipEvent.podclip_id == content.id
                )
            )
        ).scalar_one_or_none() or 0
        skip_rate = (
            num_skips / (num_skips + num_plays) if num_skips + num_plays > 0 else 0
        )

        num_listeners = (
            await db.execute(
                select(func.count(distinct(PlayEvent.user_id))).where(
                    PlayEvent.podclip_id == content.id
                )
            )
        ).scalar_one_or_none() or 0

        tip_revenue = (
            await db.execute(
                select(func.sum(Payment.amount))
                .select_from(TipEvent)
                .join(Payment)
                .where(TipEvent.podclip_id == content.id)
            )
        ).scalar_one_or_none() or 0

        stream_revenue = (
            await db.execute(
                select(func.sum(Payment.amount))
                .select_from(PlayEvent)
                .join(Payment)
                .where(PlayEvent.podclip_id == content.id)
            )
        ).scalar_one_or_none() or 0

        podclips.append(
            PodclipAnalytics(
                id=content.id,
                title=content.title,
                description=content.description,
                audio_url=content.audio_url,
                duration=content.duration,
                start_time=content.start_time,
                end_time=content.end_time,
                podcast=podcast,
                num_plays=num_plays,
                skip_rate=skip_rate,
                num_listeners=num_listeners,
                tip_revenue=int(tip_revenue),
                stream_revenue=int(stream_revenue),
            )
        )

    return PodcastAnalytics(
        podcast=podcast,
        podclips=podclips,
    )
