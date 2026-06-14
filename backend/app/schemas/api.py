from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str | None = None
    image_url: str | None = None
    tier: str = "free"

    class Config:
        from_attributes = True


class TokenExchangeIn(BaseModel):
    email: EmailStr
    name: str | None = None
    image: str | None = None
    provider: str = "credentials"


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatMessageIn(BaseModel):
    conversation_id: uuid.UUID | None = None
    content: str


class MessageOut(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UsageOut(BaseModel):
    tier: str
    messages_today: int
    daily_limit: int
    input_tokens: int
    output_tokens: int


class CheckoutIn(BaseModel):
    tier: str  # "pro" | "team"


class CheckoutOut(BaseModel):
    url: str


class PortalOut(BaseModel):
    url: str
