from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from octopod.core.auth import (
    Token,
    TokenData,
    TokenKind,
    create_token,
    decode_creator_token,
)
from octopod.database import get_db
from octopod.models import Creator, Payment, TipEvent
from octopod.core.creator.schema import (
    RegisterCreatorRequest,
    CreatorProfile,
    PaymentResponse,
)

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
    result = await db.execute(select(Payment).where(Payment.creator_id == token.id).order_by(Payment.created_at.desc()))
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
