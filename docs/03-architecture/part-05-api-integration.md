# Part 05 — API & Integration

## 1. API design principles

| Principle | Mô tả |
|---|---|
| **REST + JSON** | Standard, simple, mass adoption |
| **OpenAPI 3.0** | Contract-first, single source of truth |
| **Idempotency mandatory** | Mọi POST write có `idempotency_key` |
| **Versioning by URL** | `/v1/`, `/v2/` — không breaking change in-place |
| **Pagination cursor-based** | Cho list lớn (member list 3M) |
| **Error format consistent** | `{error_code, message, details}` RFC 7807 |
| **Rate limit by API key** | 1.000 req/min default, configurable per key |
| **Sandbox separate** | API key `is_sandbox` flag — data isolation |

## 2. API surface

> **URL Convention** — Auth dùng `https://reborn.vn/authenticator/*`. Mọi business endpoint dùng `https://biz.reborn.vn/<service>/*`. Endpoint dạng `/adminapi/*` cũ đã deprecated, migrate sang `biz.reborn.vn/<service>/*`. Service org chart/RBAC dùng `biz.reborn.vn/org/*` (pattern mentorhub).

### 2.1. Public-facing (member app/web) — `reborn.vn` + `biz.reborn.vn`

```
# Auth (host reborn.vn)
POST   https://reborn.vn/authenticator/otp/request           Yêu cầu OTP
POST   https://reborn.vn/authenticator/otp/verify            Verify + tạo session

# Business (host biz.reborn.vn)
GET    https://biz.reborn.vn/customer/me/profile
PATCH  https://biz.reborn.vn/customer/me/profile
GET    https://biz.reborn.vn/market/me/balance
GET    https://biz.reborn.vn/market/me/ledger?cursor=...     Lịch sử điểm
GET    https://biz.reborn.vn/market/me/tier
GET    https://biz.reborn.vn/market/rewards?tier=...         Browse catalog
POST   https://biz.reborn.vn/market/rewards/redeem           Đổi reward
GET    https://biz.reborn.vn/market/me/redemptions
GET    https://biz.reborn.vn/market/me/vouchers
POST   https://biz.reborn.vn/customer/me/data-export         GDPR export
POST   https://biz.reborn.vn/customer/me/deletion-request    Soft-delete
```

### 2.2. POS Integration (external system) — `biz.reborn.vn`

```
GET    https://biz.reborn.vn/customer/lookup?phone=...|barcode=...
POST   https://biz.reborn.vn/market/loyalty/autoEarn          ⭐ Quan trọng nhất
POST   https://biz.reborn.vn/market/loyalty/consume
POST   https://biz.reborn.vn/market/loyalty/refund
POST   https://biz.reborn.vn/market/voucher/validate
POST   https://biz.reborn.vn/market/voucher/redeem
GET    https://biz.reborn.vn/market/loyalty/active-promotions?store_id=...
```

### 2.3. Admin (internal) — `biz.reborn.vn`

```
# Customer 360°
GET    https://biz.reborn.vn/customer/list?filters=...&page=...
POST   https://biz.reborn.vn/customer/bulk-import
GET    https://biz.reborn.vn/customer/{id}/profile-360
POST   https://biz.reborn.vn/customer/merge

# Loyalty engine
GET    https://biz.reborn.vn/market/ledger?member_id=...
POST   https://biz.reborn.vn/market/points/manual-adjust
GET    https://biz.reborn.vn/market/tiers
POST   https://biz.reborn.vn/market/tiers/eval-dryrun
POST   https://biz.reborn.vn/market/tiers/eval-apply
GET    https://biz.reborn.vn/market/rewards
POST   https://biz.reborn.vn/market/rewards
GET    https://biz.reborn.vn/market/campaigns
POST   https://biz.reborn.vn/market/campaigns
POST   https://biz.reborn.vn/market/campaigns/{id}/launch

# CSKH
GET    https://biz.reborn.vn/care/tickets
PATCH  https://biz.reborn.vn/care/tickets/{id}

# Analytics
GET    https://biz.reborn.vn/analytics/dashboard/exec
GET    https://biz.reborn.vn/analytics/rfm

# Settings
GET    https://biz.reborn.vn/market/settings/*
PATCH  https://biz.reborn.vn/market/settings/*

# Audit & Permission (org-service)
GET    https://biz.reborn.vn/org/audit-logs
GET    https://biz.reborn.vn/org/users
POST   https://biz.reborn.vn/org/users
GET    https://biz.reborn.vn/org/roles
POST   https://biz.reborn.vn/org/roles
GET    https://biz.reborn.vn/org/permissions
GET    https://biz.reborn.vn/org/org-chart                   # cây tổ chức
PATCH  https://biz.reborn.vn/org/users/{id}/scope-assign
```

### 2.4. BPM Engine — `biz.reborn.vn/bpmapi`

```
# Workflow management
GET    https://biz.reborn.vn/bpmapi/process-definitions
POST   https://biz.reborn.vn/bpmapi/process-definitions/deploy
GET    https://biz.reborn.vn/bpmapi/process-instances?member_id=...
POST   https://biz.reborn.vn/bpmapi/process-instances/{id}/terminate

# Internal callback từ BPM tới market-service
POST   https://biz.reborn.vn/market/internal/v1/loyalty/award
POST   https://biz.reborn.vn/market/internal/v1/loyalty/award-bundle
```

OpenAPI 3.0 đầy đủ: [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)

## 3. Sequence diagrams — Core flows

### 3.1. Auto-earn (chi tiết)

```
External POS         API GW         market-svc       customer-svc      RabbitMQ      notification-svc
    │                  │                │                  │                │                │
    │ POST /autoEarn  │                │                  │                │                │
    ├─────────────────►│                │                  │                │                │
    │                  │ JWT/API key    │                  │                │                │
    │                  │ verify         │                  │                │                │
    │                  │ rate limit ✓   │                  │                │                │
    │                  ├───────────────►│                  │                │                │
    │                  │                │ Idempotency      │                │                │
    │                  │                │ check (Redis)    │                │                │
    │                  │                │  - HIT → return  │                │                │
    │                  │                │    cached resp   │                │                │
    │                  │                │                  │                │                │
    │                  │                │ Lookup member    │                │                │
    │                  │                ├─────────────────►│                │                │
    │                  │                │                  │ Find by phone  │                │
    │                  │                │                  │ or auto-create │                │
    │                  │                │◄─────────────────┤                │                │
    │                  │                │                  │                │                │
    │                  │                │ Apply earn rules │                │                │
    │                  │                │  + tier mult     │                │                │
    │                  │                │  + campaign mult │                │                │
    │                  │                │ = points         │                │                │
    │                  │                │                  │                │                │
    │                  │                │ TXN BEGIN        │                │                │
    │                  │                │  INS ledger      │                │                │
    │                  │                │  UPD member.bal  │                │                │
    │                  │                │  IF upgrade →    │                │                │
    │                  │                │   INS tier_hist  │                │                │
    │                  │                │ COMMIT           │                │                │
    │                  │                │                  │                │                │
    │                  │                │ Publish event    │                │                │
    │                  │                ├──────────────────┼───────────────►│                │
    │                  │                │                  │  PointsEarned  │                │
    │                  │                │                  │                ├───────────────►│
    │                  │                │                  │                │                │ Send SMS
    │                  │                │                  │                │                │ "+ 35 đ"
    │                  │                │                  │                │                │
    │                  │                │ Cache resp Redis │                │                │
    │                  │                │ Return           │                │                │
    │                  │◄───────────────┤                  │                │                │
    │ 200 OK           │                │                  │                │                │
    │ {points_earned}  │                │                  │                │                │
    │◄─────────────────┤                │                  │                │                │
    │                  │                │                  │                │                │
    │ Display msg      │                │                  │                │                │
    │ on POS           │                │                  │                │                │

Failure scenarios:
- API GW down → POS retry (idempotent OK)
- market-svc down → API GW return 503, POS push to DLQ
- DB lock → retry inside service with backoff
- Notification down → event in queue, retry when up
```

### 3.2. Cross-brand transfer (saga)

```
Member App         market-svc (brand A)       market-svc (brand B)
    │                  │                            │
    │ POST transfer   │                            │
    │ {from=A, to=B,  │                            │
    │  points=1000}   │                            │
    ├─────────────────►│                            │
    │                  │ Validate balance ≥ 1000   │
    │                  │ TXN: ledger transfer_out  │
    │                  │      member.bal -= 1000   │
    │                  │ COMMIT                    │
    │                  │                            │
    │                  │ Call brand B service      │
    │                  ├──────────────────────────►│
    │                  │  /transfer/credit         │
    │                  │  {transfer_id, member, 800│
    │                  │   (after ratio 1:0.8)}    │
    │                  │                            │
    │                  │                            │ TXN: ledger transfer_in
    │                  │                            │      member.bal_B += 800
    │                  │                            │ COMMIT
    │                  │◄──────────────────────────┤
    │                  │  200 OK                   │
    │                  │                            │
    │                  │ Mark transfer_id done    │
    │ 200 OK          │                            │
    │◄─────────────────┤                            │
    │                  │                            │

Compensation: nếu brand B fail → ghi ngược lại brand A
   ledger entry adjust_in 1000 với reference = transfer_failed
   → ghi rõ trong audit log + alert
```

## 4. Idempotency implementation

```
Client header:  Idempotency-Key: <UUID>

Server side:
1. Read header → key
2. Compute request_hash = sha256(method + path + body)
3. Lookup Redis: idempotency:<key>
   - HIT + same hash → return cached response
   - HIT + different hash → return 409 (replay attack)
   - MISS:
     - SETNX idempotency:<key> = "processing" TTL 30s
     - If SETNX fails → wait 100ms, retry (other instance processing)
     - Process request
     - SET idempotency:<key> = JSON(status, hash, body) TTL 24h
     - Return response
```

## 5. Webhook outbound (Reborn → external)

Reborn gửi events ra cho POS/partner systems:

| Event | Payload | When |
|---|---|---|
| `member.tier_changed` | `{member_id, old_tier, new_tier, reason}` | Sau tier upgrade/downgrade |
| `member.merged` | `{primary_member_id, merged_member_id}` | Sau cross-brand merge |
| `points.adjusted` | `{member_id, delta, new_balance, reason}` | Admin manual adjust |
| `voucher.issued` | `{member_id, voucher_code, valid_until}` | Sau redemption voucher |

**Security:**
- HMAC-SHA256 signature: `X-Reborn-Signature: sha256=<hex>`
- Timestamp tolerance: `X-Reborn-Timestamp` ± 5 phút
- Retry: 3 lần (1m, 5m, 30m) exp backoff
- DLQ sau 3 fail

**Subscriber config:**
- Admin tạo webhook subscription: URL, events selected, secret
- Manual test "ping" trước khi go-live

## 6. Rate limiting

| Tier | Limit | Áp dụng cho |
|---|---|---|
| Default | 1.000 req/min/key | Production API key |
| High volume | 5.000 req/min/key | Premium tenant |
| Sandbox | 100 req/min/key | Test environment |
| Public auth | 10 OTP/5 phút/phone | Anti-abuse |
| Bulk import | 1 job/hour/user | Avoid DB overload |

Implementation: Redis sliding window counter.

## 7. Error handling — RFC 7807 problem details

```json
{
  "type": "https://docs.reborn.vn/errors/insufficient-balance",
  "title": "Insufficient points balance",
  "status": 400,
  "code": "INSUFFICIENT_BALANCE",
  "detail": "Member ABC has 50 points, requested 100",
  "instance": "/v1/loyalty/consume",
  "context": {
    "member_id": "ABC",
    "available": 50,
    "requested": 100
  }
}
```

Error codes: xem [URD part-08 §5](../02-requirements/part-08-pos-integration.md#5-error-codes)

## 8. Tham chiếu

- OpenAPI spec: [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)
- Security details: [`part-06-security.md`](part-06-security.md)
- POS integration URD: [`../02-requirements/part-08-pos-integration.md`](../02-requirements/part-08-pos-integration.md)
- Backend implementation: [`../05-backend-tasks/`](../05-backend-tasks/)
