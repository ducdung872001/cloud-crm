---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-07T09:10:36+00:00
slug: mcp-host-ai-provider-gateway
status: open
gh_issue: https://github.com/ducdung872001/cloud-integration-master/issues/12
---

# Manage MCP host + AI provider keys + health monitoring cho mentorhub

## Bối cảnh (Why)

FE mentorhub vừa hoàn tất Phase 5 trong `backend-stubs/`. AI gateway (services/ai-gateway.ts) hiện route giữa 2 backend:

1. **Anthropic API** trực tiếp (token-based) — fast UX, streaming, per-student breakdown
2. **MCP host** (Claude Code CLI exposed qua HTTP socket) — heavy task (transcript dài), tool-use (file/bash/web)

Hiện cấu hình MCP endpoint + provider keys hard-code trong `.env`. Production cần:
- Per-tenant key store (BYOK — bring-your-own-key cho Master/Academy tier)
- MCP host registry (1 hoặc nhiều host, chọn theo region/load)
- Health monitoring + circuit breaker telemetry → dashboard
- Provider key rotation không downtime

`integration` đang quản lý 3rd-party integration credentials (Email, Zoom, ZNS) — AI provider key + MCP endpoint thuộc cùng category. FE mentorhub cần `integration` BE expose 3 module:

## Yêu cầu cụ thể (What)

### A) AI provider key store (per tenant)

```
GET    /integration/mentorhub/ai-providers/:tenantId
PUT    /integration/mentorhub/ai-providers/:tenantId/:provider
DELETE /integration/mentorhub/ai-providers/:tenantId/:provider
GET    /integration/mentorhub/ai-providers/:tenantId/:provider/test  [auth: tenant admin]
```

Provider enum: `anthropic | openai | groq | gemini`

PUT body:
```json
{
  "apiKey": "sk-ant-...",
  "organizationId": "org-...",     // optional, chỉ OpenAI
  "baseUrl": "https://...",          // optional, custom endpoint
  "enabled": true
}
```

Response (KHÔNG echo apiKey, chỉ trả masked):
```json
{
  "tenantId": "TENANT-...",
  "provider": "anthropic",
  "keyMasked": "sk-ant-...XYZ",     // last 4 chars only
  "organizationId": "...",
  "baseUrl": "...",
  "enabled": true,
  "lastUsedAt": "ISO",
  "updatedAt": "ISO",
  "updatedBy": "mentorId"
}
```

GET `/test` endpoint: integration gọi thử provider (1 tiny request) → trả `{ ok: true, latencyMs }` hoặc `{ ok: false, error }`.

**Encrypt at rest**: apiKey phải được encrypt với KMS hoặc passphrase BE-level (không lưu plaintext trong DB).

### B) MCP host registry (cluster-level, không per-tenant)

```
GET    /integration/mentorhub/mcp-hosts
POST   /integration/mentorhub/mcp-hosts                    [auth: platform admin]
PATCH  /integration/mentorhub/mcp-hosts/:id                [auth: platform admin]
DELETE /integration/mentorhub/mcp-hosts/:id                [auth: platform admin]
GET    /integration/mentorhub/mcp-hosts/:id/health          [public auth]
```

MCP host shape:
```ts
interface McpHost {
  id: string;
  name: string;
  endpoint: string;          // https://mcp-host-1.internal:7000
  region: 'vn-north' | 'vn-south' | 'sg' | 'us-east';
  /** Concurrency cap — số request đồng thời tối đa */
  maxConcurrency: number;
  /** Tier nào được phép route qua host này. Mặc định ['master','academy'] */
  allowedTiers: string[];
  enabled: boolean;
  /** Auth token để mentorhub-be gửi kèm Bearer */
  authTokenMasked: string;   // chỉ last 4 chars
  lastHealthCheck?: {
    at: string;
    healthy: boolean;
    latencyMs: number;
  };
}
```

POST body khi tạo: kèm `authToken` plaintext (server encrypt + lưu masked).

### C) Health monitoring telemetry

mentorhub-be hiện có circuit breaker (3 fail liên tiếp → open 60s) trong stub. Production muốn telemetry tập trung:

```
POST /integration/mentorhub/mcp-events
GET  /integration/mentorhub/mcp-events?hostId=&since=ISO
```

Event shape (mentorhub-be POST sau mỗi MCP call):
```json
{
  "hostId": "...",
  "tenantId": "...",
  "mentorId": "...",
  "action": "invoke" | "health" | "circuit_open" | "circuit_close",
  "result": "success" | "failure" | "timeout",
  "durationMs": 12345,
  "errorMessage": "...",          // nếu failure
  "toolCallsCount": 3,             // nếu enableToolUse
  "occurredAt": "ISO"
}
```

GET trả lịch sử events có pagination (limit 100/page).

### D) DB schema gợi ý (postgres)

```sql
CREATE TABLE mentorhub_ai_provider_key (
  tenant_id text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('anthropic','openai','groq','gemini')),
  api_key_encrypted bytea NOT NULL,           -- AES-GCM hoặc tương đương
  organization_id text,
  base_url text,
  enabled boolean NOT NULL,
  last_used_at timestamptz,
  updated_at timestamptz NOT NULL,
  updated_by text NOT NULL,
  PRIMARY KEY (tenant_id, provider)
);

CREATE TABLE mentorhub_mcp_host (
  id text PRIMARY KEY,
  name text NOT NULL,
  endpoint text NOT NULL,
  region text NOT NULL,
  max_concurrency int NOT NULL,
  allowed_tiers jsonb NOT NULL,
  enabled boolean NOT NULL,
  auth_token_encrypted bytea NOT NULL,
  last_health_check jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE mentorhub_mcp_event (
  id bigserial PRIMARY KEY,
  host_id text REFERENCES mentorhub_mcp_host(id),
  tenant_id text,
  mentor_id text,
  action text NOT NULL,
  result text NOT NULL,
  duration_ms int,
  error_message text,
  tool_calls_count int,
  occurred_at timestamptz NOT NULL
);

CREATE INDEX ON mentorhub_mcp_event (host_id, occurred_at DESC);
CREATE INDEX ON mentorhub_mcp_event (tenant_id, occurred_at DESC);
```

## Ràng buộc & gợi ý

- **Multi-tenant**: AI provider key luôn gắn với tenant. MCP host là cluster-level (shared) → list public read; quản lý chỉ platform admin.
- **Encryption**: API key + auth token plaintext **chỉ tồn tại trong request**, lưu DB phải encrypted. Decrypt on-demand khi BE gọi provider.
- **BYOK fallback**: nếu tenant chưa set key của provider X → fall về key platform-level (env var). FE/BE mentorhub đang giả định flow này.
- **Health monitoring**: integration BE có thể tự cron health-check (60s/host) HOẶC mentorhub-be gửi telemetry → pick 1 model. Stub hiện làm cron client-side, sẵn sàng switch sang server-side nếu integration sẵn sàng.
- **Cross-link**: handoff song song
  - billing (`cloud-billing-master#13`) — cost tracking đã có usage_log; mentorhub-be P&L sẽ join tự lấy
  - customer (`cloud-customer-master#6`) — onboarding/custom-fields, không liên quan AI provider
  - notification (`reborn-notihub#6`) — reminder/lifecycle event dispatch, không liên quan AI provider

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 5 vừa commit (commit `16c658d8`):

- AI gateway routing logic: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/ai-gateway.ts
- MCP client + circuit breaker: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/mcp-client.ts
- Anthropic API client: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/anthropic-client.ts
- Model registry (provider metadata + cost): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config/models.ts
- mcp config (endpoint, token, timeoutMs): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config.ts
- Admin status route: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/admin.ts (search `mcpStatus`)

## Tiêu chí done

- [ ] DB migrations cho 3 bảng `mentorhub_ai_provider_key`, `mentorhub_mcp_host`, `mentorhub_mcp_event` với encryption at rest
- [ ] 4 endpoint provider key (CRUD + test) với apiKey masked trong response
- [ ] 5 endpoint MCP host registry (CRUD + health probe)
- [ ] 2 endpoint MCP events (POST telemetry + GET pagination)
- [ ] Encryption KMS / AES-GCM; key rotation procedure documented
- [ ] Postman / curl examples cho FE smoke-test cutover

---
**Reply protocol** (đặc thù mentorhub — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] mcp-host-ai-provider-gateway — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-integration`
  - `to-mentorhub` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`ducdung872001/cloud-integration-master#12`), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE mentorhub chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-mentorhub` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-mentorhub --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true
gh label create reply-from-integration --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE integration" 2>/dev/null || true
```
