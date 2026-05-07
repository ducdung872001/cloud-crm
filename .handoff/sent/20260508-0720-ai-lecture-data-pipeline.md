---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: ai
created: 2026-05-08T07:20:00+00:00
slug: lecture-data-pipeline
status: open
gh_issue: https://github.com/ducdung872001/cloud-ai-master/issues/2
---

# AI lecture pipeline — 3-stage orchestration (Whisper → Claude summarize → callback)  — replace integration#11

## Bối cảnh + lý do raise lại trên cloud-ai

Handoff gốc gửi `cloud-integration-master#11` (ai-lecture-data-pipeline) đã được integration **closed needs-realignment** (cloud-crm#222). Lý do BE integration đưa ra:

> AI provider abstraction + worker queue 3-stage + cost tracking AI = AI domain → `cloud-ai`. Integration chỉ giữ Zoom recording download + S3 upload (đã ship 90% qua #10).
>
> Đề xuất quy hoạch: cloud-ai consume Kafka topic `cloud-bpm-trigger` (filter `processCode=ai-lecture-pipeline`) thay vì cloud-integration tự xử lý. cloud-integration giữ recording download (Zoom webhook → Kafka publish), cloud-ai consume + orchestrate AI pipeline.

Raise lại trên `cloud-ai-master` với scope tách bạch.

## Cross-link

- **Phụ thuộc**: handoff `provider-key-store-mcp-host` (cloud-ai#1) — pipeline cần AI provider keys + MCP routing.
- **Upstream**: cloud-integration-master#10 (Zoom recording download — đã ship). Integration publish Kafka event `cloud-bpm-trigger` với `processCode=ai-lecture-pipeline` khi recording.completed → cloud-ai consume.
- **Downstream**: 4 callback endpoint mentorhub-be expose: `/sales/internal/session/{review,lecture-summary,next-prep,content-metric}` (sales chưa ship — mock 200 OK trong giai đoạn đầu).
- **Replaces**: cloud-integration-master#11 (closed needs-realignment).

## Spec scope

### Pipeline orchestration

3-stage state machine, run async với worker queue (Kafka consumer hoặc cloud-ai internal queue):

```
[trigger]                  [stage 1]              [stage 2]                [stage 3]
recording.completed event  whisper transcribe     claude summarize         callback dispatch
(via cloud-bpm-trigger) ─→ (audio→text+timestamps)─→ (text→insights+JSON)─→ (POST sales callbacks)
```

**Bảng `ai_pipeline_run`:**
| Field | Type | Note |
|---|---|---|
| id | string PK | `PR-<uuid8>` |
| tenant_id, mentor_id | string |  |
| session_id | string | mentorhub session FK |
| recording_url | string | S3/CDN URL từ integration upload |
| status | enum | `pending` `transcribing` `summarizing` `dispatching` `completed` `failed` |
| current_stage | enum nullable | `whisper` `claude` `callback` |
| transcript_storage_key | string nullable |  |
| transcript_text | text nullable | (or stored separately) |
| insight_json | jsonb nullable | structured output Claude |
| error | jsonb nullable | { stage, message, retry_count } |
| retry_count | int default 0 |  |
| started_at, completed_at | timestamp |  |

### Endpoints

- `POST /ai/lecture-pipeline/trigger` — Manual trigger (cho test / re-run failed). Body: `{ sessionId, recordingUrl }`. Response: `{ runId, status }`.
- `GET /ai/lecture-pipeline/runs?sessionId=&status=` — list runs.
- `GET /ai/lecture-pipeline/runs/:id` — detail + downloadable transcript URL.
- `POST /ai/lecture-pipeline/runs/:id/retry` — retry từ failed stage.

### Kafka consumer (auto-trigger)

Subscribe topic `cloud-bpm-trigger`, filter:
```
{ processCode: "ai-lecture-pipeline", payload: { sessionId, mentorId, tenantId, recordingUrl } }
```

Tạo run mới, dispatch stage 1.

### Stage 1 — Whisper transcribe

- Provider: Groq Whisper (rẻ) hoặc OpenAI Whisper (fallback).
- Resolve key qua `/ai/provider-keys` (BYOK theo tenant; fallback `PLATFORM` key).
- Output: text + word-level timestamps, lưu `transcript_storage_key` (S3 path) + `transcript_text` (db cho query nhanh).
- Idempotency: nếu transcript_storage_key đã có với same recording_url checksum → skip.

### Stage 2 — Claude summarize

- Provider: Anthropic Claude (Sonnet/Haiku theo tier mentor).
- Prompt: lấy template `post-class-summary` từ prompt_manager.
- Input: transcript + course metadata.
- Output JSON schema:
  ```json
  {
    "summary": "...",
    "keyPoints": [{ "time": "12:34", "text": "..." }],
    "actionItems": ["..."],
    "qa": [{ "time": "...", "student": "...", "q": "...", "a": "..." }],
    "atRiskStudents": [{ "studentId": "...", "reason": "..." }]
  }
  ```
- Persist `insight_json`.

### Stage 3 — Callback dispatch

POST song song 4 endpoint của sales (mentorhub-be expose hiện tại):
- `/sales/internal/session/review` — gửi summary + sentiment
- `/sales/internal/session/lecture-summary` — gửi keyPoints + qa
- `/sales/internal/session/next-prep` — gợi ý buổi sau (Claude infer)
- `/sales/internal/session/content-metric` — engagement metric

Retry: exponential backoff (2s, 8s, 32s, 2m, 10m). Sau 5 lần fail → status=failed, alert admin qua `mcp_event` log.

### Cost tracking

Mỗi stage emit `mcp_event` (từ handoff #1) với cost_usd/vnd. Cron tổng hợp daily → `ai_budget_per_tenant`.

## File FE liên quan

Stub Phase 5+1 (mentorhub-be):
- AI gateway: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/ai-gateway.ts
- Whisper service: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/whisper.ts
- Claude service: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/claude.ts
- Per-student breakdown: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/per-student-breakdown.ts
- Prompts: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/prompts/

Sales callback endpoints (currently mocked, sales sẽ port sau):
- `https://mentorhub.uat.reborn.vn/sales/internal/session/*` (mock 200)

## Reply protocol

Reply phải đặt **2 label đồng thời** trên repo `ducdung872001/cloud-crm`:
- `reply-from-ai`
- `to-mentorhub`

## Tiêu chí done

- [ ] DB migration `ai_pipeline_run`
- [ ] 4 endpoint REST trigger/list/detail/retry
- [ ] Kafka consumer subscribe `cloud-bpm-trigger` với filter processCode
- [ ] 3-stage orchestration với retry/backoff
- [ ] Idempotency theo recording_url checksum (skip duplicate)
- [ ] Cost tracking emit `mcp_event` cho mỗi stage
- [ ] Integration test: trigger → assert run completed + 4 callback fired + insight_json valid
- [ ] Sales callback dispatch parallel (không block stage 3 nếu 1 callback fail — log riêng)
