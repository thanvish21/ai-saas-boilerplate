from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tiers import TIER_LIMITS, Tier
from app.models import Subscription, UsageLog


async def get_tier(db: AsyncSession, user_id: uuid.UUID) -> Tier:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = result.scalar_one_or_none()
    if not sub or sub.status not in {"active", "trialing"}:
        return Tier.FREE
    try:
        return Tier(sub.tier)
    except ValueError:
        return Tier.FREE


async def record_usage(
    db: AsyncSession,
    user_id: uuid.UUID,
    model: str,
    input_tokens: int,
    output_tokens: int,
) -> None:
    db.add(
        UsageLog(
            user_id=user_id,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
        )
    )
    await db.commit()


async def daily_summary(db: AsyncSession, user_id: uuid.UUID, tier: Tier) -> dict[str, int | str]:
    since = datetime.now(UTC) - timedelta(days=1)
    q = select(
        func.count(UsageLog.id),
        func.coalesce(func.sum(UsageLog.input_tokens), 0),
        func.coalesce(func.sum(UsageLog.output_tokens), 0),
    ).where(UsageLog.user_id == user_id, UsageLog.created_at >= since)
    count, input_t, output_t = (await db.execute(q)).one()
    return {
        "tier": tier.value,
        "messages_today": int(count),
        "daily_limit": TIER_LIMITS[tier]["messages_per_day"],
        "input_tokens": int(input_t),
        "output_tokens": int(output_t),
    }
