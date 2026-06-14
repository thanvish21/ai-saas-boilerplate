from __future__ import annotations

import time
from collections.abc import AsyncGenerator

import redis.asyncio as redis
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.tiers import TIER_LIMITS, Tier
from app.db.session import SessionLocal

_redis: redis.Redis | None = None


def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


async def enforce_rate_limit(user_id: str, tier: Tier) -> None:
    limits = TIER_LIMITS[tier]
    r = get_redis()
    now = int(time.time())
    minute_key = f"rl:{user_id}:{now // 60}"
    day_key = f"rl:{user_id}:day:{now // 86400}"

    pipe = r.pipeline()
    pipe.incr(minute_key)
    pipe.expire(minute_key, 65)
    pipe.incr(day_key)
    pipe.expire(day_key, 86405)
    minute_count, _, day_count, _ = await pipe.execute()

    if int(minute_count) > limits["rpm"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="rate limit exceeded (per-minute)",
        )
    if int(day_count) > limits["messages_per_day"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"daily quota exceeded ({limits['messages_per_day']} on tier {tier})",
        )
