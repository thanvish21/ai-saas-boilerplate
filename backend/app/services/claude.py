from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from anthropic import AsyncAnthropic

from app.core.config import settings

_client: AsyncAnthropic | None = None


def get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def stream_chat(
    messages: list[dict[str, Any]],
    system: str | None = None,
    max_tokens: int = 1024,
) -> AsyncIterator[tuple[str, dict[str, Any]]]:
    """
    Yield (event_type, payload) tuples.
      event_type ∈ {"text", "usage", "done"}
      text payload:  {"delta": str}
      usage payload: {"input_tokens": int, "output_tokens": int}
    """
    client = get_client()
    kwargs: dict[str, Any] = {
        "model": settings.anthropic_model,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if system:
        kwargs["system"] = system

    input_tokens = 0
    output_tokens = 0

    async with client.messages.stream(**kwargs) as stream:
        async for text in stream.text_stream:
            yield "text", {"delta": text}
        final = await stream.get_final_message()
        input_tokens = final.usage.input_tokens
        output_tokens = final.usage.output_tokens

    yield "usage", {"input_tokens": input_tokens, "output_tokens": output_tokens}
    yield "done", {}
