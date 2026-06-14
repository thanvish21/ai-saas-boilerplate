from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import current_user
from app.core.ratelimit import get_db
from app.core.tiers import Tier
from app.models import User
from app.schemas.api import CheckoutIn, CheckoutOut, PortalOut
from app.services import stripe_svc

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    body: CheckoutIn,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutOut:
    try:
        tier = Tier(body.tier)
    except ValueError as e:
        raise HTTPException(400, "invalid tier") from e
    if tier == Tier.FREE:
        raise HTTPException(400, "checkout is not required for the free tier")

    price_id = stripe_svc.price_for(tier)
    if not price_id:
        raise HTTPException(500, f"no Stripe price configured for tier '{tier}'")

    customer_id = await stripe_svc.create_or_get_customer(user.email, user.stripe_customer_id)
    if customer_id != user.stripe_customer_id:
        user.stripe_customer_id = customer_id
        await db.commit()

    url = await stripe_svc.create_checkout_session(
        customer_id=customer_id,
        price_id=price_id,
        success_url=f"{settings.app_url}/dashboard?checkout=success",
        cancel_url=f"{settings.app_url}/pricing?checkout=cancel",
    )
    return CheckoutOut(url=url)


@router.post("/portal", response_model=PortalOut)
async def portal(
    user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> PortalOut:
    if not user.stripe_customer_id:
        raise HTTPException(400, "no Stripe customer for this user yet")
    url = await stripe_svc.create_portal_session(
        user.stripe_customer_id, return_url=f"{settings.app_url}/dashboard"
    )
    return PortalOut(url=url)
