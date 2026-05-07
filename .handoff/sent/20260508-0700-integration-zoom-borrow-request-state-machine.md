---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-08T07:00:00+00:00
slug: zoom-borrow-request-state-machine
status: open
gh_issue: https://github.com/ducdung872001/cloud-integration-master/issues/14
---

# Zoom borrow request — peer-to-peer state machine + atomic auto-book

## Bối cảnh (Why)

Phase 6 đã ship Zoom credit pool (auto-pool flow: A publish account → C book free slot atomic). Phase 6.x bổ sung **mô hình thứ 2 — peer-to-peer borrow request** vì user feedback:

> "mentor A k có lịch giờ B, mentor C muốn mượn zoom giờ B để dạy và trả một phần credit cho người kia"

Auto-pool (pre-approval qua publish) không cover use case A muốn duyệt từng request, có thể negotiate (counter-offer), và slot không cần publish trước khi C đề xuất giờ.

FE đã ship route `/mh/zoom-pool` tab "Yêu cầu mượn" + "Đơn nhận" + "Đơn đã gửi" + URD doc đầy đủ. BE stub Phase 6.x đã commit ở mentorhub backend-stubs (`zoom-borrow.ts`).

## Cross-link

- **Phụ thuộc**: handoff `zoom-pool-accounts-slots` (#224 needs-realignment) — peer-borrow tái dùng `ZoomPoolAccount` + `ZoomSlot` schema. Nếu zoom-pool re-handoff bị defer thì peer-borrow cũng defer (cùng repo).
- **Không phụ thuộc cứng**: billing#15 (credit wallet) — peer-borrow chỉ orchestrate, không owner credit logic.
- **Notification**: cần event `zoom_borrow_request_received` cho mentor A (Zalo OA push). Handoff sau cho `notification`.

## Spec scope

### Entity mới `zoom_borrow_request`

| Field | Type | Note |
|---|---|---|
| id | string PK | `BRQ-<uuid8>` |
| from_tenant_id, from_mentor_id | string | C (borrower) |
| to_tenant_id, to_mentor_id | string | A (lender) |
| account_id | string nullable | FK `zoom_pool_account` nếu C chọn slot có sẵn |
| slot_id | string nullable | FK `zoom_slot` nếu C chọn slot có sẵn |
| proposed_starts_at, proposed_ends_at | timestamp | Giờ C đề xuất |
| course_title, reason, message | text nullable | Metadata C cung cấp |
| offered_credits | int | Credit C offer ban đầu |
| counter_credits | int nullable | A counter-offer credit |
| counter_starts_at, counter_ends_at | timestamp nullable | A counter-offer giờ |
| response_message | text nullable | A note khi reply |
| status | enum | `pending|approved|declined|expired|booked|cancelled` |
| expires_at | timestamp | TTL 24h từ createdAt |
| created_at, responded_at | timestamp |  |
| booking_id | string nullable | Set khi approve → auto-book |

Index: `(to_mentor_id, status, expires_at)` cho inbox query, `(from_mentor_id, status)` cho sent query.

### State machine

```
pending --A.approve--> booked  (auto-book + atomic credit transfer)
        --A.decline--> declined
        --A.counter--> pending (set counter_credits/counter_starts_at)
        --C.cancel--> cancelled
        --24h TTL--> expired
```

### Endpoints (8)

| Method | Path | Mục đích |
|---|---|---|
| POST | `/integration/zoom-borrow` | C tạo request — pre-check wallet đủ credit (gọi billing) |
| GET | `/integration/zoom-borrow/inbox?mentorId=` | A xem yêu cầu nhận |
| GET | `/integration/zoom-borrow/sent?mentorId=` | C xem yêu cầu đã gửi |
| GET | `/integration/zoom-borrow/:id` | Get detail (scope check both sides) |
| POST | `/integration/zoom-borrow/:id/approve` | A approve → ATOMIC: tạo slot ad-hoc nếu chưa có → bookSlot() → trừ credit C 100% offer (counter override nếu set) → cộng credit A 100% (peer earn rate) → update status booked + linked bookingId |
| POST | `/integration/zoom-borrow/:id/decline` | A từ chối, lưu response_message |
| POST | `/integration/zoom-borrow/:id/counter` | A counter-offer: set counter_credits/counter_starts_at, status vẫn pending |
| POST | `/integration/zoom-borrow/:id/cancel` | C huỷ pending |

### Cron tick

`expirePendingRequests()`: scan request status=pending && expires_at <= now → status=expired. Tick mỗi 15 phút.

### Atomic invariant cho approve

```
BEGIN;
  -- 1. Resolve effective values (counter takes priority)
  starts := COALESCE(counter_starts_at, proposed_starts_at)
  credits := COALESCE(counter_credits, offered_credits)

  -- 2. Ensure A có ZoomPoolAccount (private, earn 100%)
  IF account_id IS NULL THEN
    SELECT existing mentor account; ELSE create with contributor_earn_rate_pct=100
  END IF;

  -- 3. Tạo slot ad-hoc nếu slot_id NULL
  IF slot_id IS NULL THEN
    INSERT zoom_slot (status=free, starts, ends, account_id);
  END IF;

  -- 4. bookSlot() race-safe (reuse from #224)
  -- → trừ credit C, cộng earn cho A theo earn_rate_pct
  -- → set slot status=booked, link booking

  -- 5. Update request status=booked, response_message, booking_id
COMMIT;
```

Nếu credit C không đủ ở step 4 → throw `InsufficientCreditError 402`, **rollback toàn bộ transaction** (không tạo slot, không tạo account peer). Request giữ nguyên status=pending.

### Notification hook (separate handoff sau)

Event publish khi:
- Request created → `zoom_borrow_request_received` (recipient: A)
- Request approved/declined/countered → `zoom_borrow_request_responded` (recipient: C)
- Request expired → `zoom_borrow_request_expired` (recipient: cả hai)

Topic Kafka: `cloud-bpm-trigger` với `processCode=zoom-borrow-event` (theo BPM trigger pattern repo này).

## File FE liên quan (BE chỉ tham chiếu, KHÔNG sửa)

Stub Phase 6.x commit `7b65e197`:
- BE service: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/zoom-borrow.ts
- Routes (8 endpoint): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/zoom-pool.ts (search `/borrow`)
- Type: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search `ZoomBorrowRequest`)
- URD: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/docs/requirements/20260506/URD_ZOOM_POOL.md (section 2.2 + 3 state machine)
- FE pages live: https://mentorhub.uat.reborn.vn/crm/mh/zoom-pool (5 tab)

## Reply protocol

Reply phải đặt **2 label đồng thời** trên repo `ducdung872001/cloud-crm`:
- `reply-from-integration`
- `to-mentorhub`

Để skill `/handoff-in-ms` của FE mentorhub pick được (multi-FE filter).

## Tiêu chí done

- [ ] DB migration bảng `zoom_borrow_request` + index inbox/sent
- [ ] 8 endpoint REST với atomic approve transaction
- [ ] State machine valid: chỉ allow transition đã spec, reject còn lại 409
- [ ] Cron tick expire 15 phút
- [ ] Pre-check wallet đủ credit khi C tạo request (gọi billing — lazy nếu billing chưa ready, mock 200 OK)
- [ ] Audit log mọi state change vào `zoom_borrow_request_log` (compliance)
- [ ] Integration test: C tạo → A approve → assert slot booked + credit trừ + earn cộng + audit chain
