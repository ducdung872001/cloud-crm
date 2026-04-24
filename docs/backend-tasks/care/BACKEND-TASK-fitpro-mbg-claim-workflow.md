# [BE · `care`] FitPro Phase 2.1 — MBG Claim Workflow & Rule Engine

**Microservice:** `care` (có sẵn — bảo vệ quyền lợi khách sau bán)
**URL prefix:** `/bizapi/care/mbg/*`
**URD:** [Part 15 §8.1 UR-FITPRO-MBG](../../urd/part-15-fitpro-phygital-roadmap.md#81-mapping-ur--microservice-v2--đã-được-ban-lãnh-đạo-duyệt-lại-2026-04-24)

## 1. Lý do nằm ở `care`

Quyết định 2026-04-24: **không** tạo microservice `guarantee` riêng. Phân tán MBG vào 2 service hiện có:
- **`care`** (file này) — claim lifecycle + rule engine + review workflow (domain: bảo vệ quyền lợi khách hàng sau bán).
- **`billing`** — quỹ MBG-Reserve + phiếu chi khi approved (xem [BACKEND-TASK-fitpro-mbg-refund-fund.md](../billing/BACKEND-TASK-fitpro-mbg-refund-fund.md)).

## 2. Schema (trong DB của `care`)

```sql
CREATE TYPE mbg_claim_status AS ENUM (
  'eligible', 'submitted', 'reviewing', 'approved', 'rejected', 'refunded'
);

-- Rule theo tenant (hoặc theo gói nếu cần override)
CREATE TABLE mbg_rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL,
  package_id VARCHAR(64) NULL,  -- NULL = rule toàn tenant; có giá trị = rule override cho gói
  threshold_weight_loss_pct DECIMAL(4,1) NOT NULL DEFAULT 3.0,
  threshold_body_fat_drop_pct DECIMAL(4,1) NOT NULL DEFAULT 2.0,
  threshold_bmi_drop DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  window_from_day INT NOT NULL DEFAULT 28,
  window_to_day INT NOT NULL DEFAULT 32,
  reserve_pct_of_package DECIMAL(4,1) NOT NULL DEFAULT 10.0, -- dùng cho billing tính % trích quỹ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, package_id)
);

CREATE TABLE mbg_claim (
  id VARCHAR(32) PRIMARY KEY,  -- MBG-xxx
  tenant_id VARCHAR(32) NOT NULL,
  member_id VARCHAR(32) NOT NULL,
  member_name VARCHAR(255),
  package_id VARCHAR(64) NOT NULL,
  package_name VARCHAR(255),
  package_price_vnd BIGINT NOT NULL,
  station_code VARCHAR(32),
  purchase_date DATE NOT NULL,
  claim_date TIMESTAMPTZ NULL,
  status mbg_claim_status NOT NULL DEFAULT 'eligible',

  baseline_weight_kg DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  baseline_body_fat_pct DECIMAL(4,1),
  current_body_fat_pct DECIMAL(4,1),
  baseline_bmi DECIMAL(4,1),
  current_bmi DECIMAL(4,1),

  member_reason TEXT,
  reviewer_note TEXT,
  reviewer_id VARCHAR(32),
  refund_amount_vnd BIGINT,
  refunded_at TIMESTAMPTZ,

  met_weight_target BOOLEAN,
  met_body_fat_target BOOLEAN,
  met_bmi_target BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mbg_claim_tenant_status ON mbg_claim (tenant_id, status);
CREATE INDEX idx_mbg_claim_member ON mbg_claim (member_id);
```

## 3. API contract (care/mbg/*)

### Rule management
| Method + Path | Quyền | Mô tả |
|---------------|-------|-------|
| `GET /bizapi/care/mbg/rule` | Master BO | Lấy rule tenant |
| `PUT /bizapi/care/mbg/rule` | Master BO | Cập nhật rule |
| `GET /bizapi/care/mbg/rule/package/:packageId` | Master BO | Rule override theo gói |

### Claim lifecycle
| Method + Path | Quyền | Mô tả |
|---------------|-------|-------|
| `GET /bizapi/care/mbg/claims?status=&stationCode=` | BO+ | List claim |
| `GET /bizapi/care/mbg/claims/:id` | BO+ | Chi tiết |
| `POST /bizapi/care/mbg/claims` | Member | Hội viên tự submit |
| `POST /bizapi/care/mbg/claims/:id/review` | Master BO | Body `{decision, note}` |
| `GET /bizapi/care/mbg/members/:memberId/eligibility` | BO+/Member | Check eligibility |

## 4. Event emit

Khi approve, `care` emit event cho `billing`:

```json
{
  "eventType": "care.mbg.refund_approved",
  "claimId": "MBG-003",
  "memberId": "M-0201",
  "amountVnd": 2400000,
  "reviewerId": "ADMIN-001",
  "at": "2026-04-24T21:30:00+07:00"
}
```

→ `billing` consume → tạo phiếu chi từ quỹ `MBG-Reserve` (xem task billing tương ứng).

## 5. Logic eligibility

```typescript
function evaluateEligibility(member, packageId, rule, metrics) {
  const daysSincePurchase = ...;
  if (daysSincePurchase < rule.windowFromDay || daysSincePurchase > rule.windowToDay) {
    return { eligible: false, reason: "Ngoài cửa sổ claim" };
  }
  const weightLossPct = ((metrics.baseline.weight - metrics.current.weight) / metrics.baseline.weight) * 100;
  const bfDrop = metrics.baseline.bodyFat - metrics.current.bodyFat;
  const bmiDrop = metrics.baseline.bmi - metrics.current.bmi;

  const metAny =
    weightLossPct >= rule.thresholdWeightLossPct ||
    bfDrop >= rule.thresholdBodyFatDropPct ||
    bmiDrop >= rule.thresholdBmiDrop;

  if (metAny) return { eligible: false, reason: "Đã đạt ít nhất 1 ngưỡng kết quả" };
  return { eligible: true, metrics };
}
```

## 6. Integration với services khác

| Nguồn data | Cách lấy |
|-----------|----------|
| Metrics baseline + current | Gọi `market` — bảng `body_metrics` (Medlatec integration đã có ở Part 15.3 HDSD) |
| Package info + price | Gọi `sales` hoặc `market` |
| Member info | Gọi `customer` |
| Phiếu chi hoàn tiền | Emit event → `billing` consume |

## 7. Test cases

| Test | Expected |
|------|----------|
| GET rule khi chưa setup | Trả default rule |
| PUT rule với threshold < 0 | 400 |
| POST claim nhưng member ngoài cửa sổ (day 10) | 400 "Ngoài cửa sổ claim" |
| POST claim + member đã đạt ngưỡng cân | 400 "Đã có kết quả" |
| POST review approve → emit event `care.mbg.refund_approved` + DB status=approved | ✅ billing nhận event |
| GET eligibility cho member không có metrics Medlatec | `eligible: false, reason: "Chưa có baseline"` |

## 8. Liên quan FE

- Page: [src/pages/CommunityHub/MoneyBackGuarantee/index.tsx](../../../src/pages/CommunityHub/MoneyBackGuarantee/index.tsx)
- Mock data: [src/mocks/community-hub/mbg.ts](../../../src/mocks/community-hub/mbg.ts)
- Route: `/fp_mbg`

## 9. Deadline

**3-4 tuần** (Phase 2). Song song với task `billing` về quỹ MBG-Reserve.
