from __future__ import annotations

import stripe

from app.core.config import settings
from app.core.tiers import Tier

stripe.api_key = settings.stripe_secret_key


def price_for(tier: Tier) -> str | None:
    return {
        Tier.PRO: settings.stripe_price_pro,
        Tier.TEAM: settings.stripe_price_team,
    }.get(tier)


def tier_from_price(price_id: str | None) -> Tier:
    if price_id == settings.stripe_price_team:
        return Tier.TEAM
    if price_id == settings.stripe_price_pro:
        return Tier.PRO
    return Tier.FREE


async def create_or_get_customer(email: str, existing_id: str | None) -> str:
    if existing_id:
        return existing_id
    customer = await stripe.Customer.create_async(email=email)
    return customer.id


async def create_checkout_session(
    customer_id: str, price_id: str, success_url: str, cancel_url: str
) -> str:
    sess = await stripe.checkout.Session.create_async(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        allow_promotion_codes=True,
    )
    return sess.url


async def create_portal_session(customer_id: str, return_url: str) -> str:
    sess = await stripe.billing_portal.Session.create_async(
        customer=customer_id, return_url=return_url
    )
    return sess.url


def construct_event(payload: bytes, sig_header: str) -> stripe.Event:
    return stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
