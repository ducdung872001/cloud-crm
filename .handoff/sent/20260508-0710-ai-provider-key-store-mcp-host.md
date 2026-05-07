---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: ai
created: 2026-05-08T07:10:00+00:00
slug: provider-key-store-mcp-host
status: open
gh_issue: https://github.com/ducdung872001/cloud-ai-master/issues/1
---

# AI provider key store (BYOK) + MCP host registry + telemetry — replace integration#12

## Bối cảnh (Why) + lý do raise lại trên cloud-ai

Handoff gốc gửi `cloud-integration-master#12` (mcp-host-ai-provider-gateway) đã được integration **closed needs-realignment** (cloud-crm#223). Lý do BE integration đưa ra:

> AI provider keys + MCP host = AI-specific concern, thuộc `cloud-ai`. cloud-integration không có infra encryption KMS, model registry, MCP-specific routing logic — build lại sẽ duplicate code.

Cluster đã register `cloud-ai` là service thứ 13 (commit `45951dc` trên cloud-integration-master). Raise lại trên `cloud-ai-master` với scope không đổi.

## Cross-link

- **Phụ thuộc**: không có (cloud-ai là cluster service mới, build standalone).
- **Consumer**: mentorhub-be Phase 5 AI gateway (`backend-stubs/src/services/ai-gateway.ts` + `mcp-client.ts`) — gọi cloud-ai để route heavy/tool-use task qua MCP.
- **Replaces**: cloud-integration-master#12 (closed needs-realignment).

## Spec scope

### 1. Provider key store (BYOK — Bring Your Own Key)

Per-tenant API key cho LLM provider; encrypt at rest qua KMS; mask trong response.

**Bảng `ai_provider_key`:**
| Field | Type | Note |
|---|---|---|
| id | string PK | `APK-<uuid8>` |
| tenant_id | string | `PLATFORM` = global default key |
| provider | enum | `anthropic` `openai` `groq` `gemini` `deepseek` |
| key_encrypted | bytea | KMS-wrapped |
| key_hint | string | Last 4 chars cho UI mask |
| label | string | Mentor đặt tên friendly |
| status | enum | `active` `disabled` `expired` |
| created_at, updated_at, last_tested_at | timestamp |  |
| last_test_status | enum | `ok` `auth_fail` `quota_exceeded` `network_error` |

**Endpoints (5):**
- `GET /ai/provider-keys?tenantId=` — list (key masked với hint)
- `POST /ai/provider-keys` — create (body có `key` plaintext, BE encrypt)
- `PATCH /ai/provider-keys/:id` — update label/status (KHÔNG cho update key, phải delete + create lại)
- `DELETE /ai/provider-keys/:id` — soft delete
- `POST /ai/provider-keys/:id/test` — gọi 1 ping nhỏ tới provider, trả về `last_test_status`

### 2. MCP host registry

Cluster-level registry cho Claude Code CLI làm MCP server. Mentor tier `master|academy` được route qua MCP cho heavy task.

**Bảng `mcp_host`:**
| Field | Type | Note |
|---|---|---|
| id | string PK | `MCP-<uuid8>` |
| label | string | "Tokyo-1", "Saigon-2" |
| endpoint | string | `wss://mcp-tokyo.reborn.vn:8443` |
| token_encrypted | bytea | KMS-wrapped MCP auth token |
| region | string | `ap-southeast-1` |
| concurrency_cap | int | Max session đồng thời |
| current_concurrency | int | Counter (decrement on event end) |
| allowed_tiers | string[] | `["master", "academy"]` |
| status | enum | `available` `busy` `circuit_open` `disabled` |
| circuit_open_until | timestamp nullable | TTL khi 3 fail liên tiếp |
| last_health_check_at | timestamp |  |
| created_at | timestamp |  |

**Endpoints (5):**
- `GET /ai/mcp-hosts` — list filtered by tier + region
- `POST /ai/mcp-hosts` — admin add host
- `PATCH /ai/mcp-hosts/:id` — admin update label/concurrency_cap/allowed_tiers
- `DELETE /ai/mcp-hosts/:id` — admin remove
- `POST /ai/mcp-hosts/:id/health-check` — manual trigger health probe

### 3. MCP event telemetry

Mỗi AI call qua MCP host emit event để track cost + circuit breaker.

**Bảng `mcp_event`:**
| Field | Type | Note |
|---|---|---|
| id | string PK | `MEV-<uuid8>` |
| tenant_id, mentor_id | string |  |
| host_id | string FK |  |
| step | enum | `whisper` `claude` `tool_call` `prompt_cache_hit` |
| model | string | `claude-haiku-4-5`, `claude-sonnet-4-6` |
| tokens_in, tokens_out, cache_read, cache_write | int |  |
| duration_ms | int |  |
| status | enum | `ok` `timeout` `auth_fail` `quota` `tool_error` |
| cost_usd, cost_vnd | numeric |  |
| created_at | timestamp |  |

**Endpoints (2):**
- `POST /ai/mcp-events` — bulk create (batch up to 100)
- `GET /ai/mcp-events?hostId=&since=&limit=` — pagination cho dashboard

Circuit breaker rule: nếu 3 event status=`timeout|auth_fail|tool_error` liên tiếp cùng host → `mcp_host.status = circuit_open`, `circuit_open_until = now + 60s`. Sau TTL retry health-check để re-open.

### 4. Model registry

**Bảng `ai_model_registry`** (seed once via migration):
| model_id | provider | tier | context_window | cost_per_1k_input_usd | cost_per_1k_output_usd | supports_vision | supports_tool_use | supports_streaming | min_tier_required |
|---|---|---|---|---|---|---|---|---|---|
| claude-opus-4-7 | anthropic | premium | 200000 | 0.015 | 0.075 | ✓ | ✓ | ✓ | master |
| claude-sonnet-4-6 | anthropic | standard | 200000 | 0.003 | 0.015 | ✓ | ✓ | ✓ | pro |
| claude-haiku-4-5 | anthropic | fast | 200000 | 0.0008 | 0.004 | ✓ | ✓ | ✓ | starter |
| ... | ... | | | | | | | | |

**Endpoint:** `GET /ai/models` — list filtered by tier eligibility.

## File FE liên quan

Stub Phase 5 commit `16c658d8`:
- AI gateway: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/ai-gateway.ts
- MCP client: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/mcp-client.ts
- Prompt manager: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/prompt-manager.ts
- Routes prompt: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/prompts.ts
- Models registry: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config/models.ts

## Reply protocol

Reply phải đặt **2 label đồng thời** trên repo `ducdung872001/cloud-crm`:
- `reply-from-ai`
- `to-mentorhub`

## Tiêu chí done

- [ ] 4 bảng migration (ai_provider_key, mcp_host, mcp_event, ai_model_registry) + seed model registry
- [ ] 12 endpoint REST (5 keys + 5 hosts + 2 events) + 1 GET models
- [ ] KMS encrypt/decrypt cho key + token
- [ ] Mask key trong response (chỉ trả `key_hint` last 4 chars)
- [ ] Circuit breaker logic: 3 fail → status=circuit_open 60s
- [ ] Tier-based filter cho `GET /ai/mcp-hosts` (chỉ trả host có `allowed_tiers` chứa tier mentor)
- [ ] Health-check job tick 5 phút cho mỗi host status=available
- [ ] Audit log key rotation (CREATE/DELETE keys → log immutable)
