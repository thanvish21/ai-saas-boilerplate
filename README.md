# AI SaaS Boilerplate

Production-shaped starter for an AI SaaS: Next.js 14 frontend, FastAPI backend, Postgres + Redis, Stripe subscriptions, NextAuth (Google + GitHub), and a streaming Claude chat.

## Architecture

```
                          ┌────────────────────────────┐
                          │        Browser             │
                          └─────────────┬──────────────┘
                                        │ HTTPS
                          ┌─────────────▼──────────────┐
                          │  Next.js 14 (App Router)   │
                          │  - NextAuth (Google/GH)    │
                          │  - Stripe Checkout/Portal  │
                          │  - SSE Chat UI             │
                          └──────┬───────────────┬─────┘
                                 │ REST/SSE      │ OAuth
                                 ▼               ▼
                          ┌────────────────────────────┐
                          │      FastAPI (async)       │
                          │  /auth /chat /usage /billing
                          │  JWT mw · Rate limit (tier)│
                          │  Stripe webhooks           │
                          └──┬──────────┬──────────┬───┘
                             │          │          │
                  ┌──────────▼──┐  ┌────▼────┐  ┌──▼──────────┐
                  │ PostgreSQL  │  │  Redis  │  │ Anthropic   │
                  │ users, subs │  │ ratelim │  │ claude-     │
                  │ usage, conv │  │ cache   │  │ sonnet-4-6  │
                  └─────────────┘  └─────────┘  └─────────────┘
```

## Tiers

| Tier | Price | Messages/day | Model |
|------|-------|--------------|-------|
| Free | $0    | 20           | claude-sonnet-4-6 |
| Pro  | $9/mo | 500          | claude-sonnet-4-6 |
| Team | $29/mo| 5000         | claude-sonnet-4-6 |

## Quick start

```bash
cp .env.example .env
# fill in Anthropic, Stripe, OAuth, NEXTAUTH_SECRET, JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000/docs

## Stack

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind, NextAuth.js, Stripe.js
- **Backend**  — FastAPI, SQLAlchemy 2 (async), Pydantic v2, asyncpg, Redis, Stripe, Anthropic SDK
- **Infra**    — Docker Compose (postgres, redis, backend, frontend), GitHub Actions CI

## Layout

```
.
├── backend/                FastAPI app
│   ├── app/
│   │   ├── api/            Routers: auth, chat, usage, billing, webhooks
│   │   ├── core/           config, security, deps, ratelimit
│   │   ├── db/             session, base
│   │   ├── models/         SQLAlchemy models
│   │   ├── schemas/        Pydantic models
│   │   └── services/       claude, stripe, usage
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               Next.js app
│   ├── src/
│   │   ├── app/            pages + route handlers
│   │   ├── components/     UI
│   │   ├── lib/            api client, auth, stripe
│   │   └── types/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

## Endpoints

- `POST /auth/exchange`      — exchange NextAuth session for backend JWT
- `GET  /auth/me`            — current user
- `POST /chat/stream`        — SSE stream from Claude
- `GET  /chat/conversations` — list conversations
- `GET  /usage`              — usage for current period
- `POST /billing/checkout`   — create Stripe Checkout session
- `POST /billing/portal`     — Stripe customer portal link
- `POST /webhooks/stripe`    — subscription lifecycle events

## Screenshots

> Drop screenshots into `frontend/public/screens/` and they'll render here.
>
> - Landing  — `frontend/public/screens/landing.png`
> - Pricing  — `frontend/public/screens/pricing.png`
> - Chat     — `frontend/public/screens/chat.png`
> - Billing  — `frontend/public/screens/billing.png`

## License

MIT
