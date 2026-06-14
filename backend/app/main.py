from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, billing, chat, usage, webhooks
from app.core.config import settings
from app.db.base import Base  # noqa: F401 (register models)
from app.db.session import engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Dev convenience: create tables if they don't exist.
    # Production should use Alembic migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="AI SaaS Boilerplate API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(chat.router)
    app.include_router(usage.router)
    app.include_router(billing.router)
    app.include_router(webhooks.router)

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
