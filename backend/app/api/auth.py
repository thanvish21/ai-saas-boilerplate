from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import current_user
from app.core.ratelimit import get_db
from app.core.security import create_access_token
from app.models import Subscription, User
from app.schemas.api import TokenExchangeIn, TokenOut, UserOut
from app.services.usage import get_tier

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/exchange", response_model=TokenOut)
async def exchange(body: TokenExchangeIn, db: AsyncSession = Depends(get_db)) -> TokenOut:
    """Exchange a verified NextAuth identity for a backend JWT.

    The frontend's NextAuth flow already verified the OAuth identity; this
    endpoint upserts the user and mints a signed JWT for backend calls.
    """
    user = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if not user:
        user = User(
            email=body.email,
            name=body.name,
            image_url=body.image,
            provider=body.provider,
        )
        db.add(user)
        await db.flush()
        db.add(Subscription(user_id=user.id, tier="free", status="active"))
        await db.commit()
        await db.refresh(user)

    token = create_access_token(str(user.id), extra={"email": user.email})
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> UserOut:
    tier = await get_tier(db, user.id)
    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        image_url=user.image_url,
        tier=tier.value,
    )
