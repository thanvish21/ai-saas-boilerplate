from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.ratelimit import get_db
from app.models import Subscription, User
from app.services import stripe_svc

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


async def _upsert_subscription(db: AsyncSession, customer_id: str, data: dict) -> None:
    user = (
        await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    ).scalar_one_or_none()
    if not user:
        return

    price_id = data.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
    tier = stripe_svc.tier_from_price(price_id).value
    status_ = data.get("status", "active")
    current_period_end = data.get("current_period_end")

    sub = (
        await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    ).scalar_one_or_none()
    if not sub:
        sub = Subscription(user_id=user.id)
        db.add(sub)

    sub.stripe_subscription_id = data.get("id")
    sub.stripe_price_id = price_id
    sub.tier = tier
    sub.status = status_
    sub.current_period_end = (
        datetime.fromtimestamp(current_period_end, tz=UTC) if current_period_end else None
    )
    await db.commit()


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
):
    payload = await request.body()
    if not stripe_signature:
        raise HTTPException(400, "missing stripe-signature header")
    try:
        event = stripe_svc.construct_event(payload, stripe_signature)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(400, f"invalid webhook signature: {e}") from e

    type_ = event["type"]
    data = event["data"]["object"]

    if type_ in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        await _upsert_subscription(db, data["customer"], data)
    elif type_ == "checkout.session.completed":
        sub_id = data.get("subscription")
        if sub_id:
            # The follow-on customer.subscription.created event will populate fields.
            pass

    return {"received": True}
