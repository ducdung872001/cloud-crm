---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: notification
created: 2026-05-07T08:43:27+00:00
slug: pre-class-reminder-events
status: open
gh_issue: https://github.com/ducdung872001/reborn-notihub/issues/6
---

# Dispatch reminder + lifecycle events từ mentorhub xuống notihub

## Bối cảnh (Why)

FE mentorhub có 2 cron job phát events cần notification dispatch — hiện stub chỉ console.log, cần notihub nhận + dispatch ZNS / email / in-app:

1. **Pre-class reminder cron** (Phase 4): quét sessions sắp tới, emit reminder tại 3 mốc D-3 / D-1 / H-2 — gửi cho mentor và/hoặc students
2. **Subscription lifecycle cron** (Phase 3): emit 5 event types — trial_expired, renewal_invoice_created, subscription_expired, reminder_d7 (renewal), past_due_expired — gửi cho mentor

Mentorhub là FE mentorship platform multi-tenant; mentor đăng ký gói qua VNPay, dạy live qua Zoom + nhận học viên qua Zalo OA. Reminder buổi học trước giờ chạy là lifeline UX — quên là HV không kịp join.

## Yêu cầu cụ thể (What)

### A) Inbound endpoints — nhận event từ mentorhub-be cron

```
POST /notification/mentorhub/events
```

Body: 1 trong 2 envelope sau (BE notihub dispatch theo `type`):

#### A.1) Pre-class reminder

```json
{
  "type": "pre_class_reminder",
  "trigger": "D-3" | "D-1" | "H-2",
  "sessionId": "SES-...",
  "courseId": "CRS-...",
  "mentorId": "MT-...",
  "tenantId": "TENANT-...",
  "audience": "mentor" | "students" | "both",
  "scheduledAt": "ISO-8601",
  "minutesUntilStart": 4320,
  "occurredAt": "ISO-8601"
}
```

Audience rule:
- `D-3` → mentor only (chuẩn bị slide/talking points)
- `D-1` → both (mentor + tất cả students trong course)
- `H-2` → both (last-call)

Notihub cần resolve students từ courseId qua customer service (đã handoff song song — students được gắn vào course qua sales/customer).

#### A.2) Subscription lifecycle event

```json
{
  "type": "trial_expired" | "renewal_invoice_created" | "subscription_expired" | "reminder_d7" | "past_due_expired",
  "mentorId": "MT-...",
  "tenantId": "TENANT-...",
  "invoiceId": "INV-...",
  "days": 7,
  "occurredAt": "ISO-8601"
}
```

Audience: tất cả là mentor only.

### B) Channel routing + template

| Event | Channel chính | Channel fallback | Template ID gợi ý |
|---|---|---|---|
| pre_class_reminder D-3 mentor | in-app | email | `mh_pre_class_d3_mentor` |
| pre_class_reminder D-1 mentor | Zalo ZNS | email | `mh_pre_class_d1_mentor` |
| pre_class_reminder D-1 students | Zalo ZNS | email | `mh_pre_class_d1_student` |
| pre_class_reminder H-2 mentor | in-app + push (FCM) | Zalo ZNS | `mh_pre_class_h2_mentor` |
| pre_class_reminder H-2 students | Zalo ZNS + push | email | `mh_pre_class_h2_student` |
| trial_expired | email + Zalo ZNS | in-app | `mh_trial_expired` |
| renewal_invoice_created | email | Zalo ZNS | `mh_renewal_invoice` |
| subscription_expired | email + in-app | Zalo ZNS | `mh_sub_expired` |
| reminder_d7 (renewal) | email | Zalo ZNS | `mh_renewal_d7` |
| past_due_expired | email + in-app | — | `mh_past_due_expired` |

Template variables (tiếng Việt — notihub sẽ render):
- pre_class: `{courseName, sessionNumber, sessionTitle, scheduledAt, joinUrl, mentorName}`
- lifecycle: `{mentorName, planDisplayName, periodEnd, invoiceAmount, paymentUrl}`

ZNS template phải đăng ký trước với Zalo OA (đặc thù ZNS). FE mentorhub sẽ gửi spec template tách riêng nếu cần — current handoff chỉ nói event protocol.

### C) Idempotency

mentorhub-be cron tick 15 phút → gửi event cùng (sessionId, trigger) đúng 1 lần (đã có log `sentReminders` chặn duplicate phía mentorhub). Tuy nhiên notihub phải defensive: dedupe theo `(eventType, sessionId, trigger)` hoặc `(eventType, mentorId, occurredAt rounded 15min)` trong window 1h để bảo vệ khi mentorhub-be retry.

### D) Outbound endpoint — đọc lịch sử dispatch (tuỳ chọn, dễ hơn cho debug)

```
GET /notification/mentorhub/dispatches?mentorId=...&since=ISO
```

Response: `Dispatch[]` shape:
```ts
interface Dispatch {
  id: string;
  eventType: string;
  audience: 'mentor' | 'students' | 'both';
  channel: 'zns' | 'email' | 'fcm' | 'in_app';
  templateId: string;
  recipientCount: number;
  status: 'sent' | 'failed' | 'partial';
  sentAt: string;
  errorMessage?: string;
}
```

## Ràng buộc & gợi ý

- **Multi-tenant**: tất cả query/dispatch filter `tenant_id`. Notihub đã có khái niệm tenant riêng — re-use.
- **Channel preference per tenant**: tier Pro+ có thể custom branding → từ chối fallback email khi tenant tắt email channel. Đọc qua `customer` service tenant config.
- **Cost tracking**: ZNS có cost (~300đ/tin), notihub đã track per tenant → mentorhub-be cần API `GET /notification/mentorhub/usage?mentorId=&period=YYYY-MM` để hiển thị quota đã dùng.
- **In dev mode** (ZALO_OA_ACCESS_TOKEN rỗng): dispatch ZNS phải fallback console.log — không lỗi cứng (tránh chặn dev local).
- **Cross-link**:
  - billing handoff (`cloud-billing-master#13`) — subscription lifecycle bên đó là nguồn của event A.2
  - customer handoff (`cloud-customer-master#6`) — onboarding/custom-fields, không liên quan event này

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 3 + 4 (commit `fc53b6c9`):

- Pre-class reminder cron emit event: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/pre-class-reminder.ts
- Subscription lifecycle event: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/subscription-lifecycle.ts
- Cron tick (gộp 2 service): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/jobs/subscription-cron.ts
- Sent reminder log shape: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search `SentReminder`, `ReminderTrigger`, `LifecycleEvent`)

## Tiêu chí done

- [ ] Endpoint POST `/notification/mentorhub/events` parse 2 envelope (pre_class_reminder, lifecycle), validate
- [ ] Channel routing matrix đúng theo bảng trên (D-3 → mentor in-app, D-1 → both ZNS, H-2 → both ZNS+push, lifecycle → email primary)
- [ ] 10 template ID đăng ký với placeholder variables; ZNS template được register với Zalo OA
- [ ] Idempotency dedupe (eventType, sessionId, trigger) trong window 1h
- [ ] Endpoint GET `/notification/mentorhub/dispatches` để debug
- [ ] Endpoint GET `/notification/mentorhub/usage` cho quota tracking
- [ ] Postman / curl examples cho FE smoke-test cutover

---
**Reply protocol** (đặc thù mentorhub — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] pre-class-reminder-events — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-notification`
  - `to-mentorhub` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`ducdung872001/reborn-notihub#6`), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE mentorhub chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-mentorhub` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-mentorhub --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true
gh label create reply-from-notification --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE notification" 2>/dev/null || true
```
