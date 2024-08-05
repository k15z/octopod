from datetime import datetime
from typing import AsyncGenerator
from uuid import uuid4, UUID
from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from octopod.config import config


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.current_timestamp(),
    )
    soft_deleted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class Submission(Base):

    __tablename__ = "submission"

    audio_uri: Mapped[str] = mapped_column()
    duration: Mapped[float] = mapped_column()
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()

    runs: Mapped[list["Run"]] = relationship("Run", backref="submission")


class Run(Base):

    __tablename__ = "run"

    submission_id: Mapped[UUID] = mapped_column(ForeignKey("submission.id"))
    version: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column(
        comment="Current state (IN_QUEUE, TRANSCRIBE, ANALYZE, READY)"
    )
    progress: Mapped[float] = mapped_column(
        comment="Progress through the current state (0.0 to 1.0)"
    )

    segments: Mapped[list["Segment"]] = relationship("Segment", backref="run")
    highlights: Mapped[list["Highlight"]] = relationship("Highlight", backref="run")


class Segment(Base):

    __tablename__ = "segment"

    run_id: Mapped[UUID] = mapped_column(ForeignKey("run.id"))
    start_time: Mapped[float] = mapped_column()
    end_time: Mapped[float] = mapped_column()
    text: Mapped[str] = mapped_column()


class Highlight(Base):

    __tablename__ = "highlight"

    run_id: Mapped[UUID] = mapped_column(ForeignKey("run.id"))
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    start_time: Mapped[float] = mapped_column()
    end_time: Mapped[float] = mapped_column()
    text: Mapped[str] = mapped_column()


engine = create_async_engine(config.POSTGRES_DSN.unicode_string())
SessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()


async def initialize(drop=False):
    async with engine.begin() as conn:
        if drop:
            await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
