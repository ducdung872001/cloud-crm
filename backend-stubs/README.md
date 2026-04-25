# MentorHub BE Stubs

Node + Express + Zod stubs cho API MentorHub. Đủ cho FE dev độc lập, đồng thời
là bộ khung để BE team port sang stack production (NestJS / Spring Boot / Go).

## Run

```bash
cd backend-stubs
yarn install
yarn dev                  # watch mode, port 8080
```

FE dev:

```bash
# Set APP_API_URL=http://localhost:8080 trong .env.devlocal
# Hoặc để rỗng + dùng Vite proxy (đã setup)
yarn dev                  # ở root project
```

## Endpoints

Xem `docs/mentorhub-api.openapi.yaml` ở root project.

Nhóm endpoint:

- `/api/v1/zoom/*` — OAuth + webhook recording
- `/api/v1/meeting-notes/*` — AI pipeline (transcribe + summary)
- `/api/v1/subscription/*` — Plans, upgrade, cancel, billing
- `/api/v1/usage/*` — Per-mentor quota & cost tracking
- `/api/v1/admin/*` — Reborn internal monitoring
- `/api/v1/zalo/*` — Zalo OA push + OAuth + Mini App session

## Cấu trúc

```
src/
  server.ts           # entry + middleware
  config.ts           # env vars
  db/                 # in-memory store (replace SQL when BE real)
  middleware/         # auth, error handler
  routes/
    zoom.ts
    meeting-notes.ts
    subscription.ts
    usage.ts
    admin.ts
    zalo.ts
  services/
    whisper.ts        # Groq/OpenAI Whisper wrapper
    claude.ts         # Anthropic API wrapper (Haiku/Sonnet)
    vnpay.ts          # VNPay checkout
    zalo.ts           # Zalo OA Message API
  jobs/
    transcribe.ts     # queued: download recording → chunk → whisper → merge
    summarize.ts      # queued: transcript → claude → JSON notes
    push-notifier.ts  # queued: dispatch Zalo OA push
  schemas/            # zod validators (matches OpenAPI)
  mocks/              # fake data for dev
```

## Environment variables

```bash
PORT=8080
NODE_ENV=development

# External APIs
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_WEBHOOK_SECRET_TOKEN=
ZOOM_REDIRECT_URI=http://localhost:8080/api/v1/zoom/oauth/callback

GROQ_API_KEY=              # for Whisper large-v3-turbo (recommend, rẻ 10x)
OPENAI_API_KEY=            # fallback Whisper
ANTHROPIC_API_KEY=         # Claude Haiku/Sonnet

VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_RETURN_URL=http://localhost:4000/crm/mh/settings?section=subscription

ZALO_OA_ACCESS_TOKEN=
ZALO_OA_WEBHOOK_SECRET=
ZALO_APP_ID=
ZALO_APP_SECRET=

# Storage
S3_BUCKET=mentorhub-recordings
S3_ACCESS_KEY=
S3_SECRET_KEY=

# DB (khi migrate khỏi in-memory)
DATABASE_URL=postgres://...
```

## Production migration path

Khi BE team sẵn sàng, port theo priority:

1. **DB layer** (in-memory → Postgres + Prisma/TypeORM). Schema đã định nghĩa rõ
   trong `src/db/types.ts`.
2. **Auth middleware** thực sự (hiện mock `mentorId=1`). Xem `src/middleware/auth.ts`.
3. **Job queue** thay setTimeout bằng BullMQ/Sidekiq/Temporal cho transcribe +
   summarize + push notification.
4. **Storage** thay local filesystem bằng S3/Wasabi cho recording + transcript.
5. **Payment** thay mock VNPay response bằng thật qua VNPay SDK.
