# Part 08 — Tích hợp POS

## 1. Nguyên tắc

> **POS hiện tại của khách hàng GIỮ NGUYÊN.** Reborn Loyalty chỉ nhận data sau khi thanh toán.

Đây là quyết định kiến trúc quan trọng nhất của dự án — tránh rủi ro làm gián đoạn 150K txn/ngày trong cutover. Tích hợp **API-first**, **idempotent**, **fault-tolerant** với dead letter queue.

## 2. Luồng tích hợp tổng thể

```
KH mua tại quầy
     │
     ▼
┌──────────────┐
│ POS hiện tại │  (giữ nguyên, không thay)
└──────┬───────┘
       │
       │  ① Trước thanh toán — Lookup KH (optional)
       │     GET /loyalty/member/lookup?phone=...
       │     → {member_id, name, tier, balance, available_rewards}
       │     POS hiển thị: tên KH, hạng, số điểm
       │
       │  ② KH muốn dùng điểm — Consume
       │     POST /loyaltyPointLedger/consume
       │     {member_id, points, order_ref, idempotency_key}
       │     → {points_consumed, discount_amount_vnd, new_balance}
       │
       │  ③ KH dùng voucher — Validate + Redeem
       │     POST /voucher/validate {code, order_amount}
       │     POST /voucher/redeem {code, order_ref}
       │
       │  ④ Thanh toán bình thường trên POS
       │
       │  ⑤ Sau khi đơn completed — Auto-earn
       │     POST /loyaltyPointLedger/autoEarn
       │     {phone, order_ref, amount, items[], store_id,
       │      idempotency_key, timestamp}
       │     → {points_earned, new_balance, tier, tier_changed?}
       │
       ▼
POS hiển thị: "Bạn tích 35 điểm. Số dư: 1,302 điểm. Hạng: Bạc"

Nếu đơn refund/cancel sau đó:
     ⑥ POST /loyaltyPointLedger/refund
        {order_ref, refund_amount}
        → engine rollback proportional
```

## 3. Yêu cầu

### UR-POS-01 — Lookup member API (Must)

| | |
|---|---|
| **Endpoint** | `GET https://biz.reborn.vn/customer/lookup` (hoặc `https://biz.reborn.vn/market/loyalty/member/lookup` cho lookup gắn balance) |
| **Auth** | API Key (header `X-API-Key`) |
| **Params** | `phone` (E.164) hoặc `barcode` hoặc `card_number` |
| **Response** | `{member_id, name, tier_code, tier_name, balance, available_rewards: [{id, name, points_required}], applicable_promotions: [...]}` |
| **AC** | • Latency P95 < 300 ms<br>• Phone partial (4 cuối): trả tối đa 5 candidates<br>• Member blocked: trả 404 (không lộ KH đã bị block)<br>• Rate limit: 1.000 req/min/API key |

### UR-POS-02 — Auto-earn webhook (Must)

| | |
|---|---|
| **Endpoint** | `POST https://biz.reborn.vn/market/loyalty/autoEarn` |
| **Body** | `{ "phone": "+84xxx", "order_ref": "POS-A001-202605110001", "amount": 350000, "items": [{"sku":"MILK-1L","qty":2,"unit_price":35000,"category":"dairy"}], "store_id": "STORE-001", "brand_id": "BRAND_A", "occurred_at": "2026-05-11T15:30:00+07:00", "idempotency_key": "uuid-here" }` |
| **Logic** | 1) Validate API key + store_id thuộc tenant. 2) Idempotent check: `(order_ref, brand_id)` đã có trong ledger → trả response cũ. 3) Lookup member by phone, tạo mới nếu chưa có (flag `auto_created = true`). 4) Áp earn rules + active campaigns + tier multiplier + min_spend. 5) Ghi ledger. 6) Check tier upgrade. 7) Trigger notification async. |
| **Response** | `{ "ok": true, "member_id": "...", "points_earned": 35, "new_balance": 1302, "tier": "silver", "tier_changed": false, "expires_at": "2027-05-11", "applied_rules": ["base_earn", "weekend_x2"] }` |
| **AC** | • Latency P95 < 500 ms<br>• Idempotent guaranteed by `(order_ref, brand_id)` unique constraint<br>• Min spend: nếu amount < threshold, trả 200 với `points_earned=0, reason="below_min_spend"`<br>• 500 TPS sustained<br>• Webhook retry 3 lần với exp backoff nếu Reborn down |

### UR-POS-03 — Consume points (Must)

| | |
|---|---|
| **Endpoint** | `POST https://biz.reborn.vn/market/loyalty/consume` |
| **Body** | `{member_id, points, order_ref, idempotency_key}` |
| **Logic** | 1) Validate balance ≥ points. 2) Tính discount = points × redemption_rate. 3) FIFO consume earn entries. 4) Ghi ledger redeem. 5) Trả discount amount để POS apply giảm giá. |
| **AC** | • Balance không đủ → 400 + message rõ<br>• Idempotent<br>• POS phải block submit cho tới khi nhận response OK |

### UR-POS-04 — Refund rollback (Must)

| | |
|---|---|
| **Endpoint** | `POST https://biz.reborn.vn/market/loyalty/refund` |
| **Body** | `{order_ref, refund_amount, full_refund: bool}` |
| **Logic** | Tìm earn entry của order_ref. Tính số điểm rollback = full → toàn bộ, partial → `earned × (refund_amount/order_amount)`. Ghi ledger `refund` (negative). Nếu KH đã tiêu thì balance đi âm — alert. |
| **AC** | • Idempotent<br>• Audit log đầy đủ<br>• Notification KH "Đơn refund, điểm bị trừ" |

### UR-POS-05 — Idempotency (Must)

| | |
|---|---|
| **Mô tả** | Mọi endpoint write có `idempotency_key` (UUID) trong header hoặc body. Engine cache key + response 24h. Cùng key → trả response cũ. Khác key cùng business id (order_ref) → coi là duplicate intent, trả 409. |
| **AC** | • Redis cache `idempotency:<key>` TTL 24h<br>• Unit test cụ thể cho 4 scenario: first call OK, retry same key OK, retry different key 409, expired key new call OK |

### UR-POS-06 — API Key management (Must)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | Generate/revoke API key per integration. Mỗi key có: name, scopes (lookup/earn/consume/refund), rate limit, IP whitelist (optional), expires_at. |
| **AC** | • Generate UI hiển thị 1 lần — admin tự copy lưu<br>• Key bị revoke → 401 ngay<br>• Audit usage: số request, last_used_at |

### UR-POS-07 — Webhook signing (Must)

| | |
|---|---|
| **Mô tả** | Reborn gửi webhook OUT về POS khi: tier.changed (KH lên hạng), points.adjusted (admin can thiệp). POS muốn validate gốc → HMAC-SHA256 với webhook secret. Header `X-Reborn-Signature`. |
| **AC** | • Documentation rõ cách verify<br>• Replay attack prevention: header `X-Reborn-Timestamp` ± 5 phút |

### UR-POS-08 — Dead letter queue (Must)

| | |
|---|---|
| **Mô tả** | Khi auto-earn fail (rule error, member create fail, DB transient): push request vào DLQ. Cron retry 3 lần với exp backoff (1m, 5m, 30m). Sau 3 lần fail → email alert + giữ DLQ entry để inspect. |
| **AC** | • DLQ UI cho admin xem entries failed<br>• Manual retry per entry<br>• Manual mark resolved (sau khi fix bug)<br>• Alert nếu DLQ size > 100 entries trong 1h |

### UR-POS-09 — Sandbox mode (Should)

| | |
|---|---|
| **Mô tả** | API key có flag `is_sandbox`. Sandbox requests đi vào schema/table riêng. Không ảnh hưởng production data. Dùng để POS team integrate trước go-live. |
| **AC** | • UI tách biệt: dashboard "Sandbox vs Production"<br>• Sandbox không gửi notification thật cho KH<br>• Reset sandbox data nightly |

### UR-POS-10 — Request log (Must)

| | |
|---|---|
| **Mô tả** | Mỗi request inbound: log `{api_key_id, endpoint, request_body (PII redacted), response_status, response_body, latency_ms, timestamp}`. Lưu 30 ngày. UI search/filter để debug. |
| **AC** | • Search by order_ref / member_id / time range<br>• Export logs cho 1 issue cụ thể<br>• Compliance: redact PII trừ khi role admin view |

## 4. Sequence diagram — Auto-earn

```
POS                Reborn API           Loyalty Engine      Member Service       Notification
 │                     │                       │                   │                  │
 │ POST autoEarn      │                       │                   │                  │
 ├────────────────────►│                       │                   │                  │
 │                     │ Validate API key      │                   │                  │
 │                     │ Check idempotency     │                   │                  │
 │                     ├──────────────────────►│                   │                  │
 │                     │                       │ Lookup/create     │                  │
 │                     │                       ├──────────────────►│                  │
 │                     │                       │◄──────────────────┤                  │
 │                     │                       │ Apply earn rules  │                  │
 │                     │                       │ Apply campaign    │                  │
 │                     │                       │ Apply tier mult.  │                  │
 │                     │                       │ Write ledger      │                  │
 │                     │                       │ Check tier upgrade│                  │
 │                     │                       │ Async notify      │                  │
 │                     │                       │ ──────────────────┼─────────────────►│
 │                     │◄──────────────────────┤                   │                  │
 │ 200 OK              │                       │                   │                  │
 │◄────────────────────┤                       │                   │                  │
 │                     │                       │                   │                  │
 │ Show: "+35 điểm"   │                       │                   │                  │ Send SMS
 │                     │                       │                   │                  │
```

## 5. Error codes

| HTTP | Code | Ý nghĩa | Recovery |
|---|---|---|---|
| 400 | `INVALID_PHONE` | Phone không hợp lệ | POS sửa input |
| 400 | `INSUFFICIENT_BALANCE` | Không đủ điểm | Hiển thị cho KH |
| 400 | `BELOW_MIN_SPEND` | Đơn dưới ngưỡng | Không hiển thị error, ghi log |
| 401 | `INVALID_API_KEY` | API key sai/revoked | Admin sync lại key |
| 403 | `STORE_NOT_IN_SCOPE` | store_id không thuộc API key | Check config |
| 404 | `MEMBER_NOT_FOUND` | KH không tồn tại + auto-create disabled | POS prompt tạo |
| 409 | `DUPLICATE_ORDER` | order_ref đã ghi với key khác | Investigate POS double-submit |
| 429 | `RATE_LIMIT` | Vượt 1.000 req/min | Retry sau header `Retry-After` |
| 500 | `INTERNAL_ERROR` | Lỗi server | Retry qua DLQ |
| 503 | `SERVICE_UNAVAILABLE` | Bảo trì / quá tải | Retry sau header `Retry-After` |

## 6. Tham chiếu

- **OpenAPI 3.0:** [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml)
- **Backend spec:** [`../05-backend-tasks/market/`](../05-backend-tasks/market/)
- **Architecture integration:** [`../03-architecture/part-05-api-integration.md`](../03-architecture/part-05-api-integration.md)
- **Fraud trong POS flow:** [`../06-analysis/fraud-prevention.md`](../06-analysis/fraud-prevention.md)
