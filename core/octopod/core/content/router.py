from typing import Literal, Optional
from uuid import UUID
from random import choice

import boto3
from botocore.config import Config as BotocoreConfig
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from octopod.core.auth import TokenData, decode_user_token, decode_creator_token
from octopod.core.content.filter import ContentFilter
from octopod.database import get_db
from octopod.config import config
from octopod.models import generate_uuid
from octopod.core.content.schema import (
    Podcast,
    CreatePodcastRequest,
    UpdatePodcastRequest,
    MakePlaylistResponse,
    ListPodcastsResponse,
    Podclip,
    ListPodclipsResponse,
    UpdatePodclipRequest,
    PresignedUrlResponse,
)
from octopod.models import (
    Podcast as PodcastModel,
    PodcastStatus,
    Podclip as PodclipModel,
    SkipEvent,
    TipEvent,
    PlayEvent,
    Payment,
)
from octopod.queue import worker_queue
from octopod.worker import tasks

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/podcast")
async def list_podcasts(
    q: str = "",
    db: AsyncSession = Depends(get_db),
) -> ListPodcastsResponse:
    query = select(PodcastModel)
    if q:
        query = query.where(
            PodcastModel.title.ilike(f"%{q}%")
            | PodcastModel.description.ilike(f"%{q}%")
            | PodcastModel.creator.ilike(f"%{q}%")
        )

    results = []
    for content in (await db.execute(query)).scalars().all():
        await db.refresh(content, ["creator"])
        results.append(
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
        )
    return ListPodcastsResponse(
        results=results,
    )


@router.put("/podcast")
async def create_podcast(
    request: CreatePodcastRequest,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> Podcast:
    podcast = PodcastModel(
        creator_id=token.id,
        title=request.title,
        description=request.description,
        duration=0.0,
        cover_url=request.cover_url,
        audio_url=request.audio_url,
        status=PodcastStatus.Created,
    )
    db.add(podcast)
    await db.commit()
    await db.refresh(podcast)
    worker_queue.enqueue(tasks.handle_podcast, podcast.id, job_timeout=3600)
    return await get_podcast(podcast.id, db)


@router.get("/podcast/{podcast_id}")
async def get_podcast(
    podcast_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> Podcast:
    result = await db.execute(select(PodcastModel).where(PodcastModel.id == podcast_id))
    podcast = result.scalar()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    await db.refresh(podcast, ["creator"])
    return Podcast(
        id=podcast.id,
        title=podcast.title,
        description=podcast.description,
        creator_name=podcast.creator.name,
        published_at=podcast.published_at,
        duration=podcast.duration,
        cover_url=podcast.cover_url,
        audio_url=podcast.audio_url,
    )


@router.put("/podcast/{podcast_id}")
async def update_podcast(
    podcast_id: UUID,
    request: UpdatePodcastRequest,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> Podcast:
    result = await db.execute(select(PodcastModel).where(PodcastModel.id == podcast_id))
    podcast = result.scalar()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    if podcast.creator_id != token.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for attr in request.model_fields_set:
        if getattr(request, attr) is not None:
            setattr(podcast, attr, getattr(request, attr))

    await db.commit()
    await db.refresh(podcast)

    return await get_podcast(podcast.id, db)


@router.delete("/podcast/{podcast_id}")
async def delete_podcast(
    podcast_id: UUID,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(PodcastModel).where(PodcastModel.id == podcast_id))
    podcast = result.scalar()
    if not podcast:
        raise HTTPException(status_code=404, detail="Podcast not found")
    if podcast.creator_id != token.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(podcast)
    await db.commit()


@router.get("/podclips")
async def list_podclips(
    q: str = "",
    min_duration: int = 0,
    max_duration: int = 360000,
    offset: int = 0,
    limit: int = 10,
    podcast_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
) -> ListPodclipsResponse:
    query = (
        select(PodclipModel)
        .where(
            PodclipModel.duration >= min_duration,
            PodclipModel.duration <= max_duration,
        )
        .order_by(PodclipModel.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    if q:
        query = query.where(
            PodclipModel.title.ilike(f"%{q}%")
            | PodclipModel.description.ilike(f"%{q}%")
        )
    if podcast_id is not None:
        query = query.where(PodclipModel.podcast_id == podcast_id)

    results = []
    for content in (await db.execute(query)).scalars().all():
        results.append(
            Podclip(
                id=content.id,
                title=content.title,
                description=content.description,
                audio_url=content.audio_url,
                duration=content.duration,
                start_time=content.start_time,
                end_time=content.end_time,
                podcast=await get_podcast(content.podcast_id, db),
            )
        )
    return ListPodclipsResponse(
        results=results,
    )


@router.get("/podclip/{podclip_id}")
async def get_podclip(
    podclip_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> Podclip:
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")
    return Podclip(
        id=podclip.id,
        title=podclip.title,
        description=podclip.description,
        audio_url=podclip.audio_url,
        duration=podclip.duration,
        start_time=podclip.start_time,
        end_time=podclip.end_time,
        podcast=await get_podcast(podclip.podcast_id, db),
    )


@router.put("/podclip/{podclip_id}")
async def update_podclip(
    podclip_id: UUID,
    request: UpdatePodclipRequest,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> Podclip:
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")
    if podclip.podcast.creator_id != token.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    for attr in request.model_fields_set:
        if getattr(request, attr) is not None:
            setattr(podclip, attr, getattr(request, attr))

    await db.commit()
    await db.refresh(podclip)

    return await get_podclip(podclip.id, db)


@router.delete("/podclip/{podclip_id}")
async def delete_podclip(
    podclip_id: UUID,
    token: TokenData = Depends(decode_creator_token),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")
    if podclip.podcast.creator_id != token.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(podclip)
    await db.commit()


@router.post("/podclip/{podclip_id}/report/skipped")
async def skip_podclip(
    podclip_id: UUID,
    skip_time: float,
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")
    event = SkipEvent(
        user_id=token.id,
        podcast_id=podclip.podcast_id,
        podclip_id=podclip_id,
        skip_time=skip_time,
    )
    db.add(event)
    await db.commit()


@router.post("/podclip/{podclip_id}/report/tipped")
async def tip_podclip(
    podclip_id: UUID,
    amount: int,
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")

    # Send the tip
    await db.refresh(podclip, ["podcast"])
    payment = Payment(
        user_id=token.id,
        creator_id=podclip.podcast.creator_id,
        amount=amount,
        payment_hash="NOT_PAID",  # TODO: Actually send the payment.
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    # Log the tip event
    event = TipEvent(
        user_id=token.id,
        podcast_id=podclip.podcast_id,
        podclip_id=podclip_id,
        amount=amount,
        payment_id=payment.id,
    )
    db.add(event)
    await db.commit()


@router.post("/podclip/{podclip_id}/report/played")
async def play_podclip(
    podclip_id: UUID,
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PodclipModel).where(PodclipModel.id == podclip_id))
    podclip = result.scalar()
    if not podclip:
        raise HTTPException(status_code=404, detail="Podclip not found")

    # Send the payment
    await db.refresh(podclip, ["podcast"])
    payment = Payment(
        user_id=token.id,
        creator_id=podclip.podcast.creator_id,
        amount=int(podclip.duration),  # 1 sat per second
        payment_hash="NOT_PAID",  # TODO: Actually send the payment.
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    # Log the play event
    event = PlayEvent(
        user_id=token.id,
        podcast_id=podclip.podcast_id,
        podclip_id=podclip_id,
        payment_id=payment.id,
    )
    db.add(event)
    await db.commit()


@router.get("/playlist")
async def playlist(
    seconds: int,
    token: TokenData = Depends(decode_user_token),
    db: AsyncSession = Depends(get_db),
) -> MakePlaylistResponse:
    recent_plays = (
        (
            await db.execute(
                select(PlayEvent)
                .where(PlayEvent.user_id == token.id)
                .order_by(PlayEvent.created_at.desc())
                .limit(10)
            )
        )
        .scalars()
        .all()
    )
    cf = ContentFilter()
    for play in recent_plays:
        await db.refresh(play, ["podclip"])
        cf.add(play.podclip)
    if recent_plays:
        # User has recent plays, get content-based recommendations.
        query = """
        WITH target_podclips AS (
            SELECT
                *
            FROM podclip
            WHERE podclip.id = ANY(:values)
        ), cross_scores AS (
            SELECT
                podclip.id AS podclip_id, l1_distance(podclip.embedding, target_podclips.embedding) AS score
            FROM podclip
            CROSS JOIN target_podclips
            WHERE podclip.id != target_podclips.id
        ), podclip_ranking AS (
            SELECT 
                podclip_id,
                MIN(cross_scores.score) AS score
            FROM cross_scores
            GROUP BY podclip_id
        )
        
        SELECT podclip_id, score FROM podclip_ranking ORDER BY score ASC LIMIT 100
        """
        result = await db.execute(text(query), {"values": [x.podclip_id for x in recent_plays]})
        result = result.fetchall()
        if not result:
            return MakePlaylistResponse(duration=0, results=[])
        
        select_ids = [podclip_id for podclip_id, _ in result]

        result = await db.execute(
            select(PodclipModel)
            .options(selectinload(PodclipModel.podcast).selectinload(PodcastModel.creator))
            .where(PodclipModel.id.in_(select_ids))
        )
        podclips = result.scalars().all() # Sort to match selected_podclip_ids
        podclips = list(sorted(podclips, key=lambda x: select_ids.index(x.id)))
        print(podclips[:10])

    else:
        # No recent plays, just get the most popular podcasts.
        count = (
            select(func.count(PlayEvent.id))
            .where(PlayEvent.podclip_id == PodclipModel.id)
            .scalar_subquery()
            .label("count")
        )
        result = await db.execute(
            select(PodclipModel, count)
            .options(selectinload(PodclipModel.podcast).selectinload(PodcastModel.creator))
            .order_by(count.desc()).limit(20)
        )
        podclips = result.scalars().all()

    results = []
    duration = 0
    for podclip in podclips:
        if not cf.okay(podclip):
            continue
        print(podclip.podcast)
        results.append(
            Podclip(
                id=podclip.id,
                title=podclip.title,
                description=podclip.description,
                audio_url=podclip.audio_url,
                duration=podclip.duration,
                start_time=podclip.start_time,
                end_time=podclip.end_time,
                podcast=Podcast(
                    id=podclip.podcast.id,
                    title=podclip.podcast.title,
                    description=podclip.podcast.description,
                    creator_name=podclip.podcast.creator.name,
                    published_at=podclip.podcast.published_at,
                    duration=podclip.podcast.duration,
                    cover_url=podclip.podcast.cover_url,
                    audio_url=podclip.podcast.audio_url,
                ),
            )
        )
        cf.add(podclip)
        duration += podclip.duration
        if duration >= seconds:
            break
    return MakePlaylistResponse(
        duration=duration,
        results=results,
    )


@router.get("/presign_url")
async def presign_url(
    kind: Literal["audio", "image"],
) -> PresignedUrlResponse:
    """Generate a presigned URL for uploading a file to S3.

    Warning: Very insecure, do not use in production.
    """
    bucket_name = config.AWS_S3_BUCKET
    object_key = f"{generate_uuid()}.{'mp3' if kind == 'audio' else 'jpg'}"

    session = boto3.Session(
        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
        region_name="us-east-1",
    )
    s3_client = session.client("s3", config=BotocoreConfig(signature_version="s3v4"))
    presigned_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": bucket_name,
            "Key": object_key,
        },
        ExpiresIn=3600,
    )
    return PresignedUrlResponse(
        file_url=f"https://{bucket_name}.s3.amazonaws.com/{object_key}",
        presigned_url=presigned_url,
    )
