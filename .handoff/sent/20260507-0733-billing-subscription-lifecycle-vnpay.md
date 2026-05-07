---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: billing
created: 2026-05-07T07:33:44+00:00
slug: subscription-lifecycle-vnpay
status: open
gh_issue: https://github.com/ducdung872001/cloud-billing-master/issues/13
---

# Port subscription lifecycle + invoice + VNPay payment từ FE stub xuống billing BE

## Bối cảnh (Why)

FE mentorhub vừa hoàn tất Phase 3 trong `backend-stubs/` — toàn bộ flow subscription/payment/lifecycle hiện chạy in-memory ở stub Express + tsx. Cần port logic này xuống `cloud-billing-master` để (1) persist Postgres, (2) chạy production-grade cron, (3) tích hợp VNPay sandbox/prod thật.

Mentorhub là FE mentorship platform: mentor đăng ký gói (Tập sự/Hành giả/Đệ tử/Sư phụ/Tông sư/Học viện), thanh toán theo cycle monthly/quarterly/semiannual/yearly, có trial 14 ngày + free tier vĩnh viễn. Mỗi mentor là 1 tenant; multi-tenant từ ngày 1.

Hiện FE consume stub qua `/api/v1/subscription/*` — khi billing BE sẵn sàng thay thế, FE chỉ đổi base URL.

## Yêu cầu cụ thể (What)

### 1) Plan registry (read-only — single source of truth)

`GET /billing/mentorhub/plans` → `{ plans: Plan[], cycles: CycleDiscount[] }`

Plan shape (6 tier):
```ts
type TenantTier = 'trial' | 'free' | 'starter' | 'pro' | 'master' | 'academy';

interface Plan {
  id: TenantTier;
  displayName: string;       // "Tập sự" | "Hành giả" | "Đệ tử" | ...
  tagline: string;
  monthlyPriceVND: number | null;   // null = TBD, FE hiện 'Liên hệ'
  isFree: boolean;
  isTrial: boolean;
  trialDays?: number;        // 14 cho 'trial'
  popular?: boolean;
  highlights: string[];
  quota: {
    aiEvaluationsPerMonth: number;          // -1 = unlimited
    perStudentBreakdownsPerMonth: number;
    zaloMessagesPerMonth: number;
    zoomCreditsPerMonth: number;
    storageGB: number;
    coursesLimit: number;
    studentsLimit: number;
    coMentorsPerCourse: number;
  };
  features: {
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
    mcpAccess: boolean;       // Master/Academy only
    streamingAi: boolean;     // Starter+
  };
  color: string;
}

interface CycleDiscount {
  cycle: 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
  months: number;
  discountPct: number;       // 0/5/10/20
  label: string; sublabel: string;
}
```

Source-of-truth FE đang dùng: shape + giá trị quota có ở file FE bên dưới. **Pricing số (`monthlyPriceVND`) hiện để null cho 4 tier paid** vì chưa chốt với CEO. BE deploy với cùng schema, để cột `monthly_price_vnd nullable`, admin update sau qua DB hoặc API.

### 2) Subscription per mentor

```
GET    /billing/mentorhub/subscription/:mentorId
POST   /billing/mentorhub/subscription/:mentorId/upgrade
POST   /billing/mentorhub/subscription/:mentorId/cancel-renewal
POST   /billing/mentorhub/subscription/:mentorId/resume-renewal
GET    /billing/mentorhub/subscription/:mentorId/invoices
```

Subscription shape:
```ts
interface Subscription {
  mentorId: string;
  tenantId: string;
  plan: TenantTier;
  status: 'trial' | 'active' | 'canceled_at_period_end' | 'expired' | 'past_due';
  cycle: BillingCycle;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingAt?: string | null;
  nextBillingAmountVND?: number;
  autoRenew: boolean;
  usage: {
    aiSessionsUsed: number;
    perStudentBreakdownsUsed: number;
    zaloSent: number;
    zoomCreditsUsed: number;
    storageUsedMB: number;
    coursesActive: number;
    studentsActive: number;
  };
}
```

Upgrade body: `{ plan: TenantTier, cycle: BillingCycle, paymentMethod: 'vnpay' | 'bank_transfer' | 'credit_card' | 'zalopay' }`. Block nếu plan `isFree | isTrial` hoặc `monthlyPriceVND == null`.

Upgrade response: `{ invoice: Invoice, paymentRedirectUrl: string }`.

### 3) Invoice + VNPay

```
POST   /billing/mentorhub/admin/invoice/:id/mark-paid     [admin only — bank-transfer manual confirm]
POST   /webhook/vnpay                                      [VNPay callback]
```

VNPay signing: HMAC-SHA512 với `VNPAY_HASH_SECRET`. Param sort theo key, encode value với encodeURIComponent + replace %20 → +. Verify webhook = recompute hash, so case-insensitive với `vnp_SecureHash`. Mock-mode (HASH_SECRET = 'MOCKSECRET') bypass verify để dev.

Cycle pricing: `total = round(monthlyVND * months * (1 - discountPct/100))`.

### 4) Lifecycle state machine + cron (BẮT BUỘC chạy phía BE)

Cron tick mỗi 15 phút (production: K8s CronJob hoặc Quartz job):

1. `trial` + `trialEndsAt < now` → emit `trial_expired` + `fallbackToFree(mentorId)`
2. `active` + `currentPeriodEnd < now` + `autoRenew=true` → emit `renewal_invoice_created` + tạo invoice pending + chuyển status sang `past_due` (chờ thanh toán)
3. `active` + `currentPeriodEnd < now` + `autoRenew=false` → emit `subscription_expired` + `fallbackToFree`
4. `active` + `daysLeft == 7` → emit `reminder_d7`
5. `past_due` + `daysSinceEnd >= 7` → emit `past_due_expired` + `fallbackToFree`

`fallbackToFree`: plan='free', status='expired', cycle='monthly', nextBilling=null, autoRenew=false, reset usage counters về 0 (giữ coursesActive/studentsActive).

Events publish sang **notification service** (`reborn-notihub`) qua message queue hoặc HTTP webhook. Schema event:
```json
{ "type": "trial_expired|renewal_invoice_created|subscription_expired|reminder_d7|past_due_expired",
  "mentorId": "...", "tenantId": "...",
  "invoiceId": "INV-..." /* optional */, "days": 7 /* optional */,
  "occurredAt": "ISO timestamp" }
```

### 5) DB schema gợi ý (postgres)

```sql
CREATE TABLE mentorhub_plan (
  id text PRIMARY KEY,                 -- 'trial' | 'free' | ...
  display_name text NOT NULL,
  monthly_price_vnd bigint,            -- nullable
  is_free boolean NOT NULL,
  is_trial boolean NOT NULL,
  trial_days int,
  quota jsonb NOT NULL,
  features jsonb NOT NULL,
  -- ...
  updated_at timestamptz NOT NULL
);

CREATE TABLE mentorhub_subscription (
  mentor_id text PRIMARY KEY,
  tenant_id text NOT NULL,
  plan_id text NOT NULL REFERENCES mentorhub_plan(id),
  status text NOT NULL,
  cycle text NOT NULL,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  next_billing_at timestamptz,
  next_billing_amount_vnd bigint,
  auto_renew boolean NOT NULL,
  usage jsonb NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE mentorhub_invoice (
  id text PRIMARY KEY,
  mentor_id text NOT NULL,
  plan_id text NOT NULL,
  cycle text NOT NULL,
  amount_vnd bigint NOT NULL,
  status text NOT NULL,                -- pending | paid | failed | refunded
  method text NOT NULL,                -- VNPay | Bank transfer | ZaloPay | Credit card
  issued_at date NOT NULL,
  period_label text NOT NULL,
  created_at timestamptz NOT NULL,
  paid_at timestamptz
);

CREATE INDEX ON mentorhub_subscription (status, current_period_end) WHERE status IN ('active','past_due');
CREATE INDEX ON mentorhub_subscription (status, trial_ends_at) WHERE status = 'trial';
```

## Ràng buộc & gợi ý

- **Multi-tenant**: tất cả query phải filter `tenant_id`. FE gửi `x-mentor-id` header (mock auth) — production sẽ là JWT, BE resolve `tenantId` từ mentor.
- **Idempotency**: cron tick phải idempotent — chạy lại không double invoice. Khoá bằng status transitions, không dựa trên timestamp tuyệt đối.
- **Currency**: pricing VND integer (không float). VNPay yêu cầu `vnp_Amount = amountVND * 100` (đơn vị xu).
- **Response envelope**: BE billing đang dùng `{ data, meta, error }` envelope chuẩn — FE sẽ adapt khi cutover.
- **Compat**: hiện FE/stub có legacy 4-plan PlanId ('trial'/'starter'/'pro'/'unlimited') trong `db/types.ts`. Mapper: `unlimited → master`. BE chỉ cần expose 6-tier mới; cutover FE sẽ remove legacy.

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 3 vừa commit (commit `e0054bb6`):

- Plan registry source: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/config/plans.ts
- Subscription routes: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/subscription.ts
- Lifecycle state machine: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/subscription-lifecycle.ts
- Cron tick: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/jobs/subscription-cron.ts
- VNPay sign + verify: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/vnpay.ts
- Quota middleware (cho test integration): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/middleware/quota.ts
- DB types đã port shape: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts
- FE mock data tham chiếu UI: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/mocks/subscription.ts

## Tiêu chí done

- [ ] DB migrations cho 3 bảng `mentorhub_plan`, `mentorhub_subscription`, `mentorhub_invoice` (kèm seed 6 plan từ `config/plans.ts`)
- [ ] 5 endpoint subscription + admin + VNPay webhook chạy được, response shape đúng spec trên
- [ ] Cron lifecycle tick chạy 15 phút/lần, idempotent, emit 5 event types
- [ ] VNPay signing pass test với sandbox account; mock-mode bypass khi `VNPAY_HASH_SECRET=MOCKSECRET`
- [ ] Event publish sang notification service (POST hoặc queue) — kèm spec event trên
- [ ] Postman / curl examples cho FE smoke-test cutover

---
**Reply protocol** (đặc thù mentorhub — đọc kỹ):

Khi xong, BE mở issue mới trên `ducdung872001/cloud-crm` với:
- **Title**: `[reply] subscription-lifecycle-vnpay — <status>`
- **Labels (PHẢI có cả 2)**:
  - `reply-from-billing`
  - `to-mentorhub` ← BẮT BUỘC, vì cloud-crm là repo dùng chung cho nhiều FE branch
- **Body**: link tới issue gốc này (`ducdung872001/cloud-billing-master#13`), tóm tắt thay đổi + commit SHA + breaking change (nếu có)

KHÔNG comment trực tiếp vào issue gốc — FE mentorhub chỉ poll issue OPEN có CẢ HAI label `reply-from-*` AND `to-mentorhub` trên `ducdung872001/cloud-crm`.

Lazy-create label nếu chưa có:
```bash
gh label create to-mentorhub --repo ducdung872001/cloud-crm --color FBCA04 --description "Reply gửi cho FE mentorhub" 2>/dev/null || true
gh label create reply-from-billing --repo ducdung872001/cloud-crm --color 1D76DB --description "Reply từ BE billing" 2>/dev/null || true
```
