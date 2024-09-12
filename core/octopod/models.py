import struct
from enum import Enum
from random import randbytes
from time import time
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector  # type: ignore


def generate_uuid() -> UUID:
    """Ordered UUID with an embedded timestamp.

    6 bytes: Truncated unix timestamp, big-endian
    10 bytes: Random data
    """
    timestamp = time()
    return UUID(bytes=struct.pack("!Q", int(timestamp * 1000))[2:] + randbytes(10))


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(primary_key=True, default=generate_uuid)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.current_timestamp(),
    )
    deleted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class User(Base):

    __tablename__ = "user"

    first_name: Mapped[str] = mapped_column()
    last_name: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True)
    nwc_string: Mapped[str] = mapped_column()
    picture_url: Mapped[Optional[str]] = mapped_column()


class Creator(Base):

    __tablename__ = "creator"

    name: Mapped[str] = mapped_column(unique=True)
    email: Mapped[str] = mapped_column(unique=True)
    uma_address: Mapped[str] = mapped_column()


class PodcastStatus(str, Enum):
    Created = "created"  # Metadata was provided
    Processing = "processing"  # Exciting AI stuff is happening
    Ready = "ready"  # "Podclips" are ready for review
    Published = "published"  # Podcast is live
    Error = "error"  # Something went wrong


class Podcast(Base):

    __tablename__ = "podcast"

    creator_id: Mapped[UUID] = mapped_column(ForeignKey("creator.id"))
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    duration: Mapped[float] = mapped_column()
    cover_url: Mapped[Optional[str]] = mapped_column()
    audio_url: Mapped[str] = mapped_column()
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    status: Mapped[PodcastStatus] = mapped_column()

    creator: Mapped["Creator"] = relationship("Creator", backref="podcasts")


class Podclip(Base):

    __tablename__ = "podclip"

    podcast_id: Mapped[UUID] = mapped_column(ForeignKey("podcast.id"))
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    audio_url: Mapped[str] = mapped_column()
    duration: Mapped[int] = mapped_column()
    start_time: Mapped[float] = mapped_column()
    end_time: Mapped[float] = mapped_column()
    embedding: Mapped[List[float]] = mapped_column(Vector(1536))

    podcast: Mapped["Podcast"] = relationship("Podcast", backref="podclips")


class Payment(Base):

    __tablename__ = "payment"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    creator_id: Mapped[UUID] = mapped_column(ForeignKey("creator.id"))
    amount: Mapped[float] = mapped_column()
    payment_hash: Mapped[str] = mapped_column()

    user: Mapped["User"] = relationship("User", backref="payments")
    creator: Mapped["Creator"] = relationship("Creator", backref="payments")


class TipEvent(Base):

    __tablename__ = "tip_event"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    podcast_id: Mapped[UUID] = mapped_column(ForeignKey("podcast.id"))
    podclip_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("podclip.id"))
    payment_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("payment.id"))

    amount: Mapped[float] = mapped_column()

    user: Mapped["User"] = relationship("User", backref="tip_events")
    podcast: Mapped["Podcast"] = relationship("Podcast", backref="tip_events")
    podclip: Mapped[Optional["Podclip"]] = relationship("Podclip", backref="tip_events")
    payment: Mapped[Optional["Payment"]] = relationship("Payment", backref="tip_events")


class PlayEvent(Base):

    __tablename__ = "play_event"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    podcast_id: Mapped[UUID] = mapped_column(ForeignKey("podcast.id"))
    podclip_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("podclip.id"))
    payment_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("payment.id"))

    user: Mapped["User"] = relationship("User", backref="play_events")
    podcast: Mapped["Podcast"] = relationship("Podcast", backref="play_events")
    podclip: Mapped[Optional["Podclip"]] = relationship(
        "Podclip", backref="play_events"
    )
    payment: Mapped[Optional["Payment"]] = relationship(
        "Payment", backref="play_events"
    )


class SkipEvent(Base):

    __tablename__ = "skip_event"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("user.id"))
    podcast_id: Mapped[UUID] = mapped_column(ForeignKey("podcast.id"))
    podclip_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("podclip.id"))

    skip_time: Mapped[float] = mapped_column()

    user: Mapped["User"] = relationship("User", backref="skip_events")
    podcast: Mapped["Podcast"] = relationship("Podcast", backref="skip_events")
    podclip: Mapped[Optional["Podclip"]] = relationship(
        "Podclip", backref="skip_events"
    )
