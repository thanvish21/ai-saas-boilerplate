from __future__ import annotations

from enum import StrEnum


class Tier(StrEnum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"


TIER_LIMITS: dict[Tier, dict[str, int]] = {
    Tier.FREE: {"messages_per_day": 20, "rpm": 10},
    Tier.PRO:  {"messages_per_day": 500, "rpm": 60},
    Tier.TEAM: {"messages_per_day": 5000, "rpm": 240},
}
