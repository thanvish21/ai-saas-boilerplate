from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.core.config import settings
from app.core.deps import current_user
from app.core.ratelimit import enforce_rate_limit, get_db
from app.models import Conversation, Message, User
from app.schemas.api import ChatMessageIn, ConversationOut, MessageOut
from app.services.claude import stream_chat
from app.services.usage import get_tier, record_usage

router = APIRouter(prefix="/chat", tags=["chat"])


async def _get_or_create_conversation(
    db: AsyncSession, user: User, conversation_id: uuid.UUID | None
) -> Conversation:
    if conversation_id:
        conv = (
            await db.execute(
                select(Conversation).where(
                    Conversation.id == conversation_id, Conversation.user_id == user.id
                )
            )
        ).scalar_one_or_none()
        if not conv:
            raise HTTPException(404, "conversation not found")
        return conv
    conv = Conversation(user_id=user.id, title="New chat")
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.post("/stream")
async def chat_stream(
    body: ChatMessageIn,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
):
    tier = await get_tier(db, user.id)
    await enforce_rate_limit(str(user.id), tier)

    conv = await _get_or_create_conversation(db, user, body.conversation_id)

    db.add(Message(conversation_id=conv.id, role="user", content=body.content))
    await db.commit()

    history_rows = (
        await db.execute(
            select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at)
        )
    ).scalars().all()
    messages = [{"role": m.role, "content": m.content} for m in history_rows]

    async def event_gen():
        assistant_text: list[str] = []
        input_tokens = output_tokens = 0
        yield {"event": "conversation", "data": json.dumps({"id": str(conv.id)})}
        try:
            async for kind, payload in stream_chat(messages=messages):
                if kind == "text":
                    assistant_text.append(payload["delta"])
                    yield {"event": "delta", "data": json.dumps(payload)}
                elif kind == "usage":
                    input_tokens = payload["input_tokens"]
                    output_tokens = payload["output_tokens"]
                elif kind == "done":
                    yield {"event": "done", "data": "{}"}
        except Exception as e:  # noqa: BLE001
            yield {"event": "error", "data": json.dumps({"message": str(e)})}
            return

        full = "".join(assistant_text)
        db.add(Message(conversation_id=conv.id, role="assistant", content=full))
        await db.commit()
        await record_usage(db, user.id, settings.anthropic_model, input_tokens, output_tokens)

    return EventSourceResponse(event_gen())


@router.get("/conversations", response_model=list[ConversationOut])
async def list_conversations(
    user: User = Depends(current_user), db: AsyncSession = Depends(get_db)
) -> list[ConversationOut]:
    rows = (
        await db.execute(
            select(Conversation)
            .where(Conversation.user_id == user.id)
            .order_by(Conversation.updated_at.desc())
        )
    ).scalars().all()
    return [ConversationOut.model_validate(c) for c in rows]


@router.get("/conversations/{conv_id}/messages", response_model=list[MessageOut])
async def list_messages(
    conv_id: uuid.UUID,
    user: User = Depends(current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageOut]:
    conv = (
        await db.execute(
            select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not conv:
        raise HTTPException(404, "conversation not found")
    rows = (
        await db.execute(
            select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at)
        )
    ).scalars().all()
    return [MessageOut.model_validate(m) for m in rows]
