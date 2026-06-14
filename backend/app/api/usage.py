from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import current_user
from app.core.ratelimit import get_db
from app.models import User
from app.schemas.api import UsageOut
from app.services.usage import daily_summary, get_tier

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("", response_model=UsageOut)
async def usage(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)) -> UsageOut:
    tier = await get_tier(db, user.id)
    return UsageOut(**(await daily_summary(db, user.id, tier)))
