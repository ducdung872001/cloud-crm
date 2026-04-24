# [BE · `billing`] FitPro Phase 2.1 — MBG Reserve Fund & Refund Payout

**Microservice:** `billing` (có sẵn — mọi dòng tiền / thanh toán / kế toán đều ở đây)
**URL prefix:** `/bizapi/billing/funds/mbg/*`
**URD:** [Part 15 §8.1 UR-FITPRO-MBG](../../urd/part-15-fitpro-phygital-roadmap.md#81-mapping-ur--microservice-v2--đã-được-ban-lãnh-đạo-duyệt-lại-2026-04-24)

## 1. Lý do nằm ở `billing`

Quyết định 2026-04-24: phần tài chính của MBG gắn vào `billing` theo nguyên tắc "mọi thứ liên quan thanh toán/kế toán đều ở billing" (fund, cashbook, payment, debt). Phần claim workflow nằm ở `care` — xem [BACKEND-TASK-fitpro-mbg-claim-workflow.md](../care/BACKEND-TASK-fitpro-mbg-claim-workflow.md).

## 2. Scope

1. Tạo loại quỹ `MBG-Reserve` trong `fund_management`.
2. Auto trích % theo rule khi bán gói (subscribe event `sales.package_sold`).
3. Consume event `care.mbg.refund_approved` → tạo phiếu chi từ quỹ MBG-Reserve + hạch toán cashbook.
4. Dashboard số dư quỹ MBG + lịch sử chi refund.

## 3. Schema bổ sung (trong `billing`)

```sql
-- Fund: MBG-Reserve (một record cho mỗi tenant)
-- Dùng bảng fund hiện có, chỉ thêm constant code
INSERT INTO fund (tenant_id, code, name, type, balance_vnd) VALUES
  ('FITPRO', 'MBG-Reserve', 'Quỹ dự phòng Cam kết hoàn tiền (MBG)', 'reserve', 0);

-- Liên kết invoice ↔ MBG reserve allocation (tracking đóng góp quỹ)
CREATE TABLE mbg_reserve_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL,
  invoice_id VARCHAR(64) NOT NULL,
  member_id VARCHAR(32),
  package_id VARCHAR(64),
  package_price_vnd BIGINT,
  allocation_pct DECIMAL(4,1),    -- lấy từ care.mbg_rule.reserve_pct_of_package
  allocation_vnd BIGINT,
  allocated_at TIMESTAMPTZ DEFAULT now()
);

-- Lịch sử refund (payout từ quỹ MBG)
CREATE TABLE mbg_refund_payout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(32) NOT NULL,
  claim_id VARCHAR(32) NOT NULL,         -- từ care.mbg_claim.id
  member_id VARCHAR(32),
  amount_vnd BIGINT NOT NULL,
  cashbook_entry_id VARCHAR(64),         -- link sang cashbook entry
  status VARCHAR(16) DEFAULT 'pending',  -- pending | paid | failed
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);
```

## 4. Event flow

### 4.1. Auto trích quỹ khi bán gói FitPro

```
sales service emit:
  event: "sales.package_sold"
  payload: { invoiceId, memberId, packageId, packagePriceVnd, tenantId }

billing service subscribe →
  1. Gọi care/mbg/rule để lấy reserve_pct_of_package
  2. allocation = packagePriceVnd * pct / 100
  3. Ghi row vào mbg_reserve_allocation
  4. Update fund balance_vnd của quỹ MBG-Reserve (+= allocation)
  5. Ghi cashbook entry (loại: internal_transfer, target_fund: MBG-Reserve)
```

### 4.2. Auto chi khi MBG approved

```
care service emit:
  event: "care.mbg.refund_approved"
  payload: { claimId, memberId, amountVnd, reviewerId, at }

billing service subscribe →
  1. Check balance quỹ MBG-Reserve đủ không
  2. Tạo mbg_refund_payout (status=pending)
  3. Trigger payment (bank transfer hoặc manual) → cashbook entry
  4. Update balance_vnd -= amountVnd
  5. Update status=paid, paid_at=now
  6. Emit event "billing.mbg.refund_paid" để care update claim.status=refunded
```

## 5. API

| Method + Path | Quyền | Mô tả |
|---------------|-------|-------|
| `GET /bizapi/billing/funds/mbg/balance` | BO+ | Số dư quỹ MBG-Reserve hiện tại |
| `GET /bizapi/billing/funds/mbg/allocations?from=&to=` | Master BO | Lịch sử trích quỹ theo kỳ |
| `GET /bizapi/billing/funds/mbg/payouts?from=&to=` | Master BO | Lịch sử chi refund |
| `POST /bizapi/billing/funds/mbg/manual-topup` | Master BO | Master nạp thêm quỹ thủ công (nếu reserve pct không đủ) |

## 6. Test cases

| Test | Expected |
|------|----------|
| Event `sales.package_sold` với gói 2.4tr, rule reserve=10% | Allocation 240k vào quỹ MBG-Reserve |
| Event `care.mbg.refund_approved` với amount 2.4tr, balance đủ | Payout thành công, balance giảm 2.4tr, cashbook entry tạo |
| Event approved nhưng balance không đủ | Payout status=pending, emit alert cho Master BO |
| Master topup quỹ 10tr | Balance +10tr, cashbook entry loại income |

## 7. Dashboard (FE sẽ hiển thị)

FE page [src/pages/CommunityHub/MoneyBackGuarantee/index.tsx](../../../src/pages/CommunityHub/MoneyBackGuarantee/index.tsx) đang mock số dư. Sau khi BE live, gọi `GET /billing/funds/mbg/balance` để lấy số thật.

## 8. Deadline

**2-3 tuần** sau khi `care` ra API. Hai task phụ thuộc nhau qua event bus.
