# BACKEND TASK — Promotion (CTKM) hoàn toàn không track per invoice → báo cáo SAI

**Discovered:** 2026-04-13 — `test-promo-tracking-deep.mjs`
**Severity:** 🔴 **CRITICAL** — Không có audit trail cho CTKM, mọi báo cáo hiệu quả khuyến mãi đều SAI hoặc giả lập
**Module:** `cloud-market-master` + `cloud-sales-master`

> ⚠️ **DOC GỘP CHUNG**: Đã merge full architecture + audit log + budget + alerting + reporting endpoints vào [`BACKEND-TASK-voucher-design-flaw.md`](BACKEND-TASK-voucher-design-flaw.md) (section "🏗️ UNIFIED ARCHITECTURE"). BE team đọc doc voucher đó để có toàn bộ design — doc này chỉ giữ phần hard evidence cho promotion riêng.

**Endpoints affected:**
- `GET /sales/invoice/get?id=X` — thiếu `promotionId`
- `GET /market/promotion/get?id=X` — `usedCount` không tăng
- ❌ Không có endpoint `/promotion/report`, `/promotion/usage`, `/promotion/by-invoice`...

---

## Mô tả bug

### Background

CRM hỗ trợ 2 cơ chế giảm giá:
1. **Voucher** (coupon code KH nhập tay) — đã có 2 bugs document trong `BACKEND-TASK-voucher-design-flaw.md`
2. **Promotion / CTKM** (chương trình khuyến mãi tự động apply theo điều kiện)

Cả 2 đều **không có audit trail** giữa invoice và promo/voucher. Riêng CTKM thì TỆ HƠN voucher: voucher ít ra có `sum-used`, CTKM thì `usedCount` luôn = 0.

### Triệu chứng

```
1. Tạo promo PROBE-100k (100k fix, minAmount=200k, status=1 active)
2. /check-eligible với cart 300k → trả promo này, discountAmount=100k (ĐÚNG)
3. Tạo invoice 300k → BE accept fee=200k, discount=100k
4. GET /invoice/get?id=4083 → response KHÔNG có field promotionId/promoId
5. GET /promotion/get?id=137 → usedCount = 0 (KHÔNG tăng)
6. Tạo sale 2 KHÔNG gọi check-eligible nhưng cùng discount=100k → usedCount vẫn = 0
   → BE không guess, đơn giản là không bao giờ track
```

### Hard evidence (E2E 2026-04-13)

```bash
# Invoice detail keys sau sale có promo
GET /sales/invoice/get?id=4083
→ result.invoice keys: [id, invoiceCode, invoiceType, amountCard, amount,
                        discount, vatAmount, fee, paid, debt, paymentType,
                        status, receiptDate, ..., paymentFundId]
                        ❌ KHÔNG có: promotionId, promoId, appliedPromotionId

# Promo detail trước/sau sale
GET /market/promotion/get?id=137
{ ...usedCount: 0 }       ← Trước sale
{ ...usedCount: 0 }       ← Sau sale (KHÔNG tăng)

# 9 endpoints báo cáo đều 404
GET /market/promotion/report                       → 404
GET /market/promotion/statistics                   → 404
GET /market/promotion/usage?id=137                 → 404
GET /market/promotion/usage-by-invoice?invoiceId=X → 404
GET /market/promotion/get-revenue?id=137           → 404
GET /market/promotion/dashboard                    → 404
GET /market/promotion/by-invoice?invoiceId=X       → 404
GET /market/promotion-usage/list                   → 404
GET /market/promotion-usage/get?promotionId=137    → 404
```

### Promo entity full fields (từ list API)

```
id, name, startTime, endTime, applyType, minAmount, perAmount,
promotionType, discount, discountType, status, employeeId, branchId,
bsnId, mode, budget, usedCount, input, output, businessRuleId, slug, fixedPrice
```

→ Chỉ có `usedCount` (luôn 0) và `budget` (config). Không có:
- `usedAmount` — tổng tiền đã chi cho discount này
- `totalRevenue` — doanh thu các đơn dùng promo này
- `orderCount` — số đơn áp dụng
- `lastUsedAt` — lần gần nhất sử dụng

### Trang FE Dashboard CTKM hiện đang dùng MOCK

[`src/pages/PromoReport/PromotionDashboard/index.tsx`](src/pages/PromoReport/PromotionDashboard/index.tsx) — comment trong code xác nhận đây là MOCK:

```
- Stat cards: "Doanh thu từ KM", "Đơn áp dụng KM", "Tỷ lệ chuyển đổi", "Chi phí KM"
- Bar chart: Doanh thu theo tháng
- Channel breakdown: Flash Sale, Mã giảm giá, Combo, Sinh nhật, Theo mùa
- Table: Top chương trình theo lượt dùng / doanh thu / ROI
```

Tất cả đều là số CỨNG. Manager xem báo cáo không có giá trị thật.

## Impact

| Stakeholder | Hậu quả |
|---|---|
| **Marketing manager** | Không biết campaign nào hiệu quả → ra quyết định mù |
| **Kế toán** | Không reconcile được "tổng discount CTKM tháng X" — chỉ có discount cộng dồn không phân loại |
| **CFO / Owner** | Không tính được ROI marketing, chi tiêu khuyến mãi không kiểm soát |
| **Compliance / Audit** | Không có evidence chứng minh discount nào áp dụng cho đơn nào → audit fail |
| **Refund flow** | Cancel/return invoice không reverse usage stats (vì không có usage stats) |
| **Budget enforcement** | Field `budget` trong promo entity vô nghĩa nếu không track usedAmount |

### Câu hỏi business KHÔNG thể trả lời

| Câu hỏi | Hiện trạng |
|---|---|
| Promo X có bao nhiêu đơn áp dụng? | ❌ usedCount luôn 0 |
| Promo X tốn bao nhiêu tiền discount? | ❌ Không track |
| Đơn HD004083 dùng promo nào? | ❌ Invoice không có promoId |
| Conversion rate (eligible → applied → bought)? | ❌ Không track eligible/applied |
| ROI campaign? | ❌ Không track revenue per promo |
| Hôm nay tổng giảm CTKM bao nhiêu? | ❌ Không có aggregate |
| Promo X đã vượt budget chưa? | ❌ Không track usedAmount |

## Action BE

### Phase 1 (CRITICAL): Schema mới `promotion_usage`

```sql
CREATE TABLE promotion_usage (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  promotion_id BIGINT NOT NULL,
  invoice_id BIGINT NOT NULL,
  customer_id BIGINT,
  discount_amount BIGINT NOT NULL,    -- số tiền giảm thực tế cho đơn này
  order_amount BIGINT NOT NULL,       -- subtotal trước giảm
  applied_at DATETIME NOT NULL,
  reverted_at DATETIME NULL,           -- nếu return/cancel invoice
  FOREIGN KEY (promotion_id) REFERENCES promotion(id),
  FOREIGN KEY (invoice_id) REFERENCES invoice(id),
  INDEX idx_promo_date (promotion_id, applied_at),
  INDEX idx_invoice (invoice_id)
);
```

### Phase 2 (CRITICAL): Mở rộng `/sales/invoice/create`

Thêm field `promotionId` (optional) vào request:

```json
{
  "id": 4083,
  "fee": 200000,
  "amount": 300000,
  "discount": 100000,
  "promotionId": 137,    ← THÊM
  ...
}
```

BE handler tại invoice/create:
```java
public Invoice create(InvoiceRequest req) {
  Invoice inv = saveInvoice(req);

  if (req.getPromotionId() != null) {
    Promotion p = promoRepo.findById(req.getPromotionId());
    // Re-validate (race-safe)
    validateEligible(p, req.getAmount(), req.getCustomerId());

    // Track usage
    promotionUsageRepo.save(new PromotionUsage(
      p.getId(), inv.getId(), req.getCustomerId(),
      req.getDiscount(), req.getAmount(), now()
    ));

    // Update budget enforcement
    if (p.getBudget() > 0) {
      long usedAmount = promotionUsageRepo.sumDiscountByPromotion(p.getId());
      if (usedAmount + req.getDiscount() > p.getBudget()) {
        throw "CTKM đã vượt ngân sách";
      }
    }
  }

  return inv;
}
```

### Phase 3 (HIGH): Reverse khi cancel/return

```java
public void confirmReturn(long returnInvoiceId) {
  Invoice ret = repo.findById(returnInvoiceId);
  Invoice orig = repo.findById(ret.getReferId());

  // Existing: restock + cashbook
  ...

  // NEW: revert promotion usage nếu có
  PromotionUsage usage = promotionUsageRepo.findByInvoiceId(orig.getId());
  if (usage != null) {
    usage.setRevertedAt(now());
    promotionUsageRepo.save(usage);
  }
}
```

### Phase 4 (CRITICAL): Endpoints báo cáo mới

```
GET /market/promotion/usage?promotionId=X
  → Liệt kê tất cả invoice đã áp dụng promo X (có pagination)
  → Response: { items: [{ invoiceId, invoiceCode, customerId, discount, appliedAt, reverted }], total }

GET /market/promotion/stats?promotionId=X&fromDate=&toDate=
  → Aggregate statistics cho 1 promo
  → Response: {
      orderCount: 50, totalDiscount: 5000000, totalRevenue: 50000000,
      avgOrderValue: 1000000, conversionRate: 0.65, lastUsedAt: "..."
    }

GET /market/promotion/dashboard?fromDate=&toDate=
  → Tổng quan toàn bộ CTKM trong khoảng thời gian
  → Response: {
      totalCampaigns, activeCampaigns, expiredCampaigns,
      totalDiscount, totalRevenueWithPromo, totalOrders,
      topPromotions: [{ id, name, orderCount, discount, revenue, roi }]
    }

GET /market/promotion/by-invoice?invoiceId=X
  → Trả promo đã áp dụng cho 1 invoice cụ thể (audit)
```

### Phase 5 (MEDIUM): Mở rộng promo entity

Thêm computed fields trong response của `/promotion/get` và `/promotion/list`:
```
{
  ...existing fields...,
  usedCount: 50,           ← compute từ promotion_usage
  usedAmount: 5000000,     ← SUM(discount_amount) WHERE reverted_at IS NULL
  totalRevenue: 50000000,  ← SUM(order_amount) tương tự
  remainingBudget: 5000000 ← budget - usedAmount
}
```

### Phase 6 (FE): Update FE để gửi promotionId

[`src/pages/CounterSales/index.tsx:343-365`](src/pages/CounterSales/index.tsx#L343-L365) — thêm `promotionId` vào body invoice/create:

```typescript
await InvoiceService.create({
  id: invoiceId, fee, paid, debt, amount, discount,
  ...(appliedPromo?.id ? { promotionId: appliedPromo.id } : {}),
  ...
});
```

[`src/pages/PromoReport/PromotionDashboard/index.tsx`](src/pages/PromoReport/PromotionDashboard/index.tsx) — thay MOCK data bằng call thật tới `/market/promotion/dashboard`.

## Migration

- Backfill `promotion_usage` cho các invoice cũ có `discount > 0` — best-effort match với promo cùng thời gian/value (có thể không chính xác)
- Hoặc reset all stats và bắt đầu track từ ngày BE deploy fix

## Re-test sau fix

```bash
node tests/test-promo-tracking-deep.mjs
# Hiện tại: tất cả tracking fields = 0
# Sau fix: invoice.promotionId, promo.usedCount, /promotion/usage, /promotion/stats đều có data
```

Verify nhanh:
```bash
# 1. Tạo promo P, sale với promotionId=P.id, discount=X
# 2. GET /invoice/get → promotionId == P.id
# 3. GET /promotion/get?id=P → usedCount=1, usedAmount=X
# 4. GET /promotion/usage?promotionId=P → có entry invoice
# 5. Cancel invoice → promotion_usage.reverted_at != null, usedCount giảm
```

## Liên quan

- `BACKEND-TASK-voucher-design-flaw.md` — voucher có vấn đề tương tự (tracking + tracking timing)
- Cả 2 nên fix cùng lúc theo cùng pattern (table `*_usage` + endpoint stats)
