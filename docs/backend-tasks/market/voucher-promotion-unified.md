# BACKEND TASK — Voucher + Promotion: Design flaw tracking (làm chung 1 lần)

> ✅ **[PARTIAL RESOLVED 2026-04-15]** — `cloud-sales-master` phần đã **FIXED + verified**: `POST /sales/invoice/create` nhận `couponCode` + `promotionId`, ghi `voucher_usage` / `promotion_usage`, auto increment `usedCount` sau sale. Verified bằng `test-e2e-voucher-flow.mjs` 20/20 PASS + `test-e2e-promotion-flow.mjs` 26/26 PASS. Xem [sales/resolved/invoice-create-voucher-promotion-fields.md](../sales/resolved/invoice-create-voucher-promotion-fields.md).
>
> Phần còn lại của design (reverse flow khi cancel, reports endpoints, audit log, budget, alerting) thuộc `cloud-market-master` — chưa verify đầy đủ, giữ ở đây làm tài liệu reference.

**Discovered:** 2026-04-13 — E2E `test-e2e-voucher-flow.mjs` + `test-voucher-edge-cases.mjs` + `test-e2e-promotion-flow.mjs` + `test-promo-tracking-deep.mjs`
**Severity:** 🔴 **CRITICAL** — Sai số liệu khuyến mãi, có thể bị abuse, không có audit trail
**Module:** `cloud-market-master` + `cloud-sales-master`

> ⚠️ **Doc liên quan**: [`BACKEND-TASK-promotion-tracking-missing.md`](BACKEND-TASK-promotion-tracking-missing.md) — Promotion (CTKM) cũng có cùng vấn đề tracking. **BE team nên fix CẢ HAI cùng lúc theo cùng pattern** (table `*_usage`, mở rộng invoice/create với `couponCode`+`promotionId`, endpoint stats mới). Phần cuối doc này có **Unified architecture** cho cả 2.

**Endpoints affected:**
- `POST /market/coupon/apply` — incrementing usedCount sai timing
- `POST /sales/invoice/create` — không link với voucher / promotion
- `GET /market/promotion/get` — usedCount luôn 0
- 9 endpoints báo cáo CTKM đều 404 (xem doc promotion)

---

## Bug 1 (HIGH) — `usedCount` tăng ngay khi APPLY (không đợi sale)

### Triệu chứng

```
1. Tạo voucher mới (maxUses=5)
2. Gọi POST /market/coupon/apply 5 lần liên tiếp (không có sale theo sau)
3. usedCount = 5 → quota EXHAUSTED
```

Voucher đã hết quota mặc dù **không có giao dịch nào thực sự xảy ra**.

### Hard evidence (P3)

```
voucher EDG30RRSQ (maxUses=5): usedCount baseline = 0
Apply 1: discount=30000 (chỉ check)
Apply 2: discount=30000 (chỉ check)
Apply 3: discount=30000 (chỉ check)
GET /coupon/get?id=X → usedCount = 3
```

### Tác động

| Threat | Hậu quả |
|---|---|
| **DDOS quota** | Bot/competitor spam `/coupon/apply` → đốt sạch voucher trong vài giây |
| **UX kém** | Khách thử voucher trong cart (chưa quyết định) → bị trừ lượt → khi muốn mua thật thì hết |
| **Mất tiền marketing** | Voucher bị "dùng" mà không tạo ra giao dịch / doanh thu thực |
| **Audit không chính xác** | usedCount không phản ánh số lần thực sự sử dụng |

---

## Bug 2 (CRITICAL) — Sale KHÔNG link với voucher cụ thể

### Triệu chứng

```
1. Tạo 2 voucher v1 và v2 cùng discountValue=50000
2. Tạo invoice với discount=50000 (FE không gửi couponCode)
3. v1.usedCount = 0, v2.usedCount = 0  ← KHÔNG cái nào được tracked
```

### Hard evidence (P2)

```
v1 EDG10RRSQ (50k): usedCount 0 → 0
v2 EDG20RRSQ (50k): usedCount 0 → 0
Sale HD004079 với discount=50000 → KHÔNG voucher nào tăng usedCount
```

### Root cause

- FE chỉ gọi `/coupon/apply` để get discount value, **không gửi couponCode lên `/invoice/create`** (xem `src/pages/CounterSales/index.tsx:343-365`)
- BE `/invoice/create` không có field `couponCode` trong request → không biết invoice nào dùng voucher nào
- Không có bảng liên kết `coupon_usage` (invoiceId, couponId, customerId, discount, redeemedAt)
- BE đang track usedCount qua `/coupon/apply` call — không phải qua sale thực

### Tác động

| Stakeholder | Hậu quả |
|---|---|
| **Marketing** | Không đo được conversion rate (apply → buy), không biết voucher nào hiệu quả |
| **Kế toán** | Không reconcile được discount với invoice — số liệu khuyến mãi sai |
| **Báo cáo** | Tab "Voucher đã dùng" không trace được đơn hàng nào |
| **Refund flow** | Khi cancel/return invoice, voucher không được hoàn quota → user mất voucher oan |
| **Audit** | Không có trail để chứng minh "voucher X được dùng cho đơn Y bởi KH Z" |

---

## Hiện trạng test (test-voucher-edge-cases.mjs P1-P8)

| Test | Kết quả | Ghi chú |
|---|---|---|
| P1: Sale không voucher → voucher khác không tăng | ✅ | Không có cross-contamination |
| **P2: 2 voucher cùng value → sale với value đó** | ❌ | **Bug 2 — không link** |
| **P3: Apply không sale → usedCount tăng** | ❌ | **Bug 1 — DDOS quota** |
| P4: Race 5 parallel apply, quota=3 | ✅ | Bug 1 "side effect" — apply trừ quota nên race-safe |
| P5: discount > orderAmount → cap final=0 | ✅ | OK |
| P6: orderAmount=0 → reject | ✅ | OK |
| P7: orderAmount âm → reject | ✅ | OK |
| P8: Voucher expired → reject | ✅ | OK |

---

## Action BE — Refactor design voucher redemption

### Phase 1: Tách "validate" và "redeem"

**`POST /market/coupon/apply` chỉ VALIDATE**, không trừ quota:

```java
// pseudo
public CouponApplyResponse apply(String code, long orderAmount) {
  Coupon c = repo.findByCode(code);
  if (c == null || c.getStatus() != 1) throw "Voucher không hợp lệ";
  if (c.getExpiryDate().before(now())) throw "Voucher đã hết hạn";
  if (orderAmount < c.getMinOrder()) throw "Đơn tối thiểu " + c.getMinOrder();
  if (c.getUsedCount() >= c.getMaxUses()) throw "Voucher đã hết lượt";
  // ❌ KHÔNG ++usedCount ở đây
  return computeDiscount(c, orderAmount);
}
```

### Phase 2: REDEEM tại invoice/create

**`POST /sales/invoice/create`** thêm support field `couponCode`:

```json
{
  "id": 4080,
  "fee": 150000,
  "amount": 200000,
  "discount": 50000,
  "couponCode": "REBORN50K",   ← THÊM
  ...
}
```

BE handler tại invoice/create:

```java
// pseudo
public Invoice create(InvoiceRequest req) {
  Invoice inv = saveInvoice(req);

  if (req.getCouponCode() != null) {
    // Re-validate voucher (race-safe with DB lock)
    Coupon c = repo.findByCodeForUpdate(req.getCouponCode());
    if (c.getUsedCount() >= c.getMaxUses())
      throw "Voucher đã hết quota";  // race-safe

    // REDEEM: increment + tạo bản ghi liên kết
    c.setUsedCount(c.getUsedCount() + 1);
    repo.save(c);
    couponUsageRepo.save(new CouponUsage(
      c.getId(), inv.getId(), req.getCustomerId(), req.getDiscount(), now()
    ));
  }

  return inv;
}
```

### Phase 3: Reverse khi cancel/return

Khi `POST /sales/invoice/return/confirm` → check nếu invoice gốc có `coupon_usage` → giảm `usedCount` lại:

```java
public void confirmReturn(long returnInvoiceId) {
  Invoice ret = repo.findById(returnInvoiceId);
  Invoice orig = repo.findById(ret.getReferId());

  // Existing logic: restock + cashbook expense
  ...

  // NEW: hoàn voucher quota nếu đơn gốc có dùng
  CouponUsage usage = couponUsageRepo.findByInvoiceId(orig.getId());
  if (usage != null) {
    Coupon c = couponRepo.findById(usage.getCouponId());
    c.setUsedCount(c.getUsedCount() - 1);
    couponRepo.save(c);
    couponUsageRepo.delete(usage);  // hoặc mark refunded
  }
}
```

### Phase 4: Schema mới

```sql
CREATE TABLE coupon_usage (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_id BIGINT NOT NULL,
  invoice_id BIGINT NOT NULL,
  customer_id BIGINT,
  discount_amount BIGINT NOT NULL,
  redeemed_at DATETIME NOT NULL,
  refunded_at DATETIME NULL,
  FOREIGN KEY (coupon_id) REFERENCES coupon(id),
  FOREIGN KEY (invoice_id) REFERENCES invoice(id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_coupon (coupon_id)
);
```

### Migration

- Backfill `coupon_usage` cho các invoice cũ có `discount > 0` (nếu match được với voucher cùng value và cùng date) — best-effort
- Hoặc reset usedCount của tất cả voucher hiện có (vì data đã sai do bug 1)

---

## FE thay đổi sau BE fix

[`src/pages/CounterSales/index.tsx:343-365`](src/pages/CounterSales/index.tsx#L343-L365) — thêm `couponCode` vào body invoice/create:

```typescript
await InvoiceService.create({
  id: invoiceId,
  fee, paid, debt, amount, discount,
  ...(couponDiscount > 0 && voucher?.code ? { couponCode: voucher.code } : {}),
  ...
});
```

Cần lưu thêm `voucher.code` vào state khi user apply (hiện chỉ lưu `couponDiscount` value).

---

## Re-test

```bash
node tests/test-voucher-edge-cases.mjs
# Hiện tại: 2 bugs (P2 critical, P3 high)
# Sau BE fix: 0 bugs
```

Verify nhanh:
```bash
# 1. Tạo voucher quota=5
# 2. Apply 5 lần (không sale) → usedCount phải = 0 (bug 1 fix)
# 3. Tạo 2 voucher cùng value, sale 1 lần với discount value đó + couponCode = X
# 4. Voucher X.usedCount = 1, voucher còn lại = 0 (bug 2 fix)
# 5. Cancel invoice → voucher X.usedCount = 0 (phase 3)
```

---

## 🏗️ UNIFIED ARCHITECTURE — Voucher + Promotion (làm chung)

**BE team nên implement cùng pattern cho cả Voucher và Promotion** để consistency và dễ maintain. 2 entity, cùng mô hình tracking.

### Schema mới (chung pattern, 2 bảng)

```sql
-- VOUCHER USAGE
CREATE TABLE coupon_usage (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  coupon_id       BIGINT NOT NULL,
  invoice_id      BIGINT NOT NULL,
  customer_id     BIGINT,
  discount_amount BIGINT NOT NULL,    -- số tiền giảm thực tế
  order_amount    BIGINT NOT NULL,    -- subtotal trước giảm (audit)
  applied_at      DATETIME NOT NULL,
  reverted_at     DATETIME NULL,      -- nếu return/cancel invoice
  FOREIGN KEY (coupon_id) REFERENCES coupon(id),
  FOREIGN KEY (invoice_id) REFERENCES invoice(id),
  UNIQUE KEY uq_invoice (invoice_id), -- 1 invoice = 1 voucher max
  INDEX idx_coupon_date (coupon_id, applied_at)
);

-- PROMOTION USAGE
CREATE TABLE promotion_usage (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  promotion_id    BIGINT NOT NULL,
  invoice_id      BIGINT NOT NULL,
  customer_id     BIGINT,
  discount_amount BIGINT NOT NULL,
  order_amount    BIGINT NOT NULL,
  applied_at      DATETIME NOT NULL,
  reverted_at     DATETIME NULL,
  FOREIGN KEY (promotion_id) REFERENCES promotion(id),
  FOREIGN KEY (invoice_id) REFERENCES invoice(id),
  UNIQUE KEY uq_invoice (invoice_id), -- 1 invoice = 1 promo max
  INDEX idx_promo_date (promotion_id, applied_at)
);
```

**Note**: 1 invoice có thể dùng đồng thời 1 voucher + 1 promotion (UNIQUE KEY chỉ trên từng bảng riêng).

### `POST /sales/invoice/create` mở rộng request

```json
{
  "id": 4083,
  "fee": 200000,        // = amount - discount
  "amount": 300000,     // subtotal
  "discount": 100000,   // tổng discount = couponDiscount + promoDiscount
  "couponCode": "REBORN50K",       ← NEW (optional)
  "couponDiscount": 50000,         ← NEW (split discount)
  "promotionId": 137,              ← NEW (optional)
  "promoDiscount": 50000,          ← NEW (split discount)
  ...
}
```

BE handler:
```java
public Invoice create(InvoiceRequest req) {
  Invoice inv = saveInvoice(req);

  // 1. Voucher tracking
  if (req.getCouponCode() != null) {
    Coupon c = couponRepo.findByCodeForUpdate(req.getCouponCode());
    validateVoucher(c, req.getAmount());     // re-check race-safe
    couponUsageRepo.save(new CouponUsage(
      c.getId(), inv.getId(), req.getCustomerId(),
      req.getCouponDiscount(), req.getAmount(), now()
    ));
    // usedCount tự derive từ COUNT(coupon_usage WHERE reverted_at IS NULL)
  }

  // 2. Promotion tracking (giống pattern voucher)
  if (req.getPromotionId() != null) {
    Promotion p = promoRepo.findByIdForUpdate(req.getPromotionId());
    validatePromotion(p, req.getAmount(), req.getCustomerId());
    // Budget enforcement
    if (p.getBudget() > 0) {
      long used = promotionUsageRepo.sumDiscountByPromotion(p.getId());
      if (used + req.getPromoDiscount() > p.getBudget())
        throw "CTKM đã vượt ngân sách";
    }
    promotionUsageRepo.save(new PromotionUsage(
      p.getId(), inv.getId(), req.getCustomerId(),
      req.getPromoDiscount(), req.getAmount(), now()
    ));
  }

  return inv;
}
```

### Reverse khi cancel/return (chung pattern)

```java
public void confirmReturn(long returnInvoiceId) {
  Invoice ret = repo.findById(returnInvoiceId);
  Invoice orig = repo.findById(ret.getReferId());

  // Existing: restock + cashbook chi
  ...

  // NEW: revert voucher
  CouponUsage cu = couponUsageRepo.findByInvoiceId(orig.getId());
  if (cu != null) {
    cu.setRevertedAt(now());
    couponUsageRepo.save(cu);
  }

  // NEW: revert promotion
  PromotionUsage pu = promotionUsageRepo.findByInvoiceId(orig.getId());
  if (pu != null) {
    pu.setRevertedAt(now());
    promotionUsageRepo.save(pu);
  }
}
```

### Endpoints stats mới (cùng pattern cho cả 2)

| Endpoint | Mục đích |
|---|---|
| `GET /market/coupon/usage?couponId=X` | List invoices đã dùng voucher X |
| `GET /market/coupon/stats?couponId=X&fromDate=&toDate=` | Aggregate cho 1 voucher |
| `GET /market/coupon/dashboard` | Tổng quan tất cả voucher |
| `GET /market/promotion/usage?promotionId=X` | Tương tự cho promotion |
| `GET /market/promotion/stats?promotionId=X&fromDate=&toDate=` | Tương tự |
| `GET /market/promotion/dashboard` | Tương tự |

Response shape (consistent giữa coupon và promotion):
```json
// /usage
{
  "items": [
    { "invoiceId": 4083, "invoiceCode": "HD004083",
      "customerId": -1, "discount": 100000, "orderAmount": 300000,
      "appliedAt": "2026-04-13T10:00:00", "reverted": false }
  ],
  "total": 50
}

// /stats
{
  "orderCount": 50,
  "totalDiscount": 5000000,
  "totalOrderValue": 50000000,
  "avgOrderValue": 1000000,
  "lastUsedAt": "2026-04-13T..."
}

// /dashboard
{
  "totalCampaigns": 12, "active": 5, "expired": 7,
  "totalDiscount": 50000000, "totalOrders": 500,
  "topCampaigns": [{ id, name, orderCount, discount, revenue, roi }]
}
```

### Bug 1 fix bonus (apply chỉ là validate)

`POST /market/coupon/apply` chỉ **VALIDATE**, không trừ quota:

```java
public CouponApplyResponse apply(String code, long orderAmount) {
  Coupon c = repo.findByCode(code);
  if (c == null || c.getStatus() != 1) throw "Voucher không hợp lệ";
  if (c.getExpiryDate().before(now())) throw "Voucher đã hết hạn";
  if (orderAmount < c.getMinOrder()) throw "Đơn tối thiểu " + c.getMinOrder();

  // Quota check dựa trên coupon_usage (race-safe sẽ check lại tại invoice/create)
  long used = couponUsageRepo.countByCouponId(c.getId());  // EXCLUDE reverted
  if (used >= c.getMaxUses()) throw "Voucher đã hết lượt";

  // ❌ KHÔNG ++usedCount, KHÔNG insert anything ở đây
  return computeDiscount(c, orderAmount);
}
```

### Migration

- **Voucher**: backfill `coupon_usage` từ invoice cũ có `discount > 0` (best-effort match). Hoặc reset `usedCount` = 0 và bắt đầu track từ ngày deploy.
- **Promotion**: tương tự — không có cách backfill chính xác vì không có audit trail cũ. Reset hết và tracking từ deploy date.

### FE changes sau BE deploy

FE cần update đồng thời 3 chỗ (đã prepare patch sẵn, chờ BE):

1. **`src/pages/CounterSales/index.tsx:343-365`** — body `invoice/create` thêm `couponCode`, `couponDiscount`, `promotionId`, `promoDiscount` từ state
2. **`src/pages/CounterSales/components/Cart/index.tsx`** — lưu `voucher.code` vào state khi user apply (hiện chỉ lưu `couponDiscount` value)
3. **`src/pages/PromoReport/PromotionDashboard/index.tsx`** — replace MOCK data bằng call thật tới `/promotion/dashboard`

---

## 📊 BÁO CÁO THỐNG KÊ — Endpoints chi tiết để phục vụ dashboard / business

Mục tiêu: trả lời đầy đủ các câu hỏi truy vết và đo lường hiệu quả marketing.

### Câu hỏi business cần trả lời được sau fix

| # | Câu hỏi | Endpoint trả lời |
|---|---|---|
| 1 | Voucher X / Promo X có bao nhiêu đơn dùng? | `/usage?id=X&page=1` |
| 2 | Voucher X / Promo X tốn bao nhiêu tiền discount? | `/stats?id=X` → `totalDiscount` |
| 3 | Voucher X / Promo X mang về bao nhiêu doanh thu? | `/stats?id=X` → `totalOrderValue` |
| 4 | ROI (Revenue/Discount) của 1 campaign? | `/stats?id=X` → `roi` (compute server-side) |
| 5 | Đơn HD004083 dùng promo/voucher nào? | `/by-invoice?invoiceId=X` |
| 6 | Hôm nay tổng tiền giảm CTKM/voucher bao nhiêu? | `/dashboard?fromDate=today&toDate=today` |
| 7 | Top 5 promo hiệu quả nhất tháng này? | `/dashboard?fromDate=&toDate=` → `topCampaigns` |
| 8 | Conversion rate (apply → buy) của voucher? | `/stats?id=X` → `applyCount` vs `usedCount` (cần track apply log riêng) |
| 9 | Phân loại doanh thu theo promotionType (Flash Sale / Combo / Đồng giá)? | `/dashboard` → `byType: {}` |
| 10 | Voucher X đã vượt budget chưa? | `/get?id=X` → `usedAmount` vs `budget` |
| 11 | Customer Y đã dùng promo nào? | `/usage?customerId=Y` |
| 12 | Có bị áp dụng discount âm/sai không? | Audit log query |

### Endpoint suite đầy đủ

#### Cho VOUCHER (`cloud-market-master`)

```
GET  /market/coupon/list                           # CRUD list (đã có)
GET  /market/coupon/get?id=X                       # detail (đã có, mở rộng response)
POST /market/coupon/update                         # CRUD (đã có)
POST /market/coupon/apply                          # validate only (đã có, fix Bug 1)

# ============= MỚI =============
GET  /market/coupon/usage?couponId=X
       &page=1&size=20&customerId=&fromDate=&toDate=
   → List invoice usage records, filter linh hoạt

GET  /market/coupon/stats?couponId=X
       &fromDate=&toDate=
   → { orderCount, totalDiscount, totalOrderValue, avgOrderValue,
       roi, lastUsedAt, applyCount?, conversionRate? }

GET  /market/coupon/dashboard?fromDate=&toDate=&branchId=
   → {
       totalCoupons, active, expired, draft,
       totalDiscount, totalOrders, totalRevenueWithCoupon,
       byStatus: {0: count, 1: count, 2: count},
       topCoupons: [{id, code, name, orderCount, discount, revenue, roi}],
       chartByDay: [{date: "yyyy-MM-dd", discount, orderCount}]
     }

GET  /market/coupon/by-invoice?invoiceId=X
   → Voucher đã áp dụng cho 1 invoice (audit) hoặc null
   → { couponId, couponCode, discount, appliedAt, reverted }
```

#### Cho PROMOTION (`cloud-market-master`) — mirror voucher

```
GET  /market/promotion/list                        # đã có
GET  /market/promotion/get?id=X                    # đã có, mở rộng response
POST /market/promotion/update                      # đã có
POST /market/promotion/check-eligible              # đã có

# ============= MỚI =============
GET  /market/promotion/usage?promotionId=X&...     # giống coupon/usage
GET  /market/promotion/stats?promotionId=X&...     # giống coupon/stats
GET  /market/promotion/dashboard?fromDate=&...     # giống coupon/dashboard
GET  /market/promotion/by-invoice?invoiceId=X      # giống coupon/by-invoice
```

#### Combined cross-entity (cho audit + finance)

```
GET  /market/discount-summary/by-invoice?invoiceId=X
   → Tổng hợp tất cả discount sources cho 1 invoice (1 query → audit ngon)
   → {
       invoiceId, invoiceCode, totalDiscount,
       coupon:    { id, code, discount, appliedAt },
       promotion: { id, name, discount, appliedAt },
       loyalty:   { points, value }     # loyalty point redemption
     }

GET  /market/discount-summary/dashboard?fromDate=&toDate=&branchId=
   → Tổng quan TẤT CẢ nguồn discount trong khoảng thời gian
   → {
       totalDiscount,
       byCoupon:    { count, totalDiscount },
       byPromotion: { count, totalDiscount },
       byLoyalty:   { count, totalDiscount },
       net: revenue - totalDiscount
     }
```

→ Endpoint `discount-summary` cực kỳ hữu ích cho **kế toán** và **CFO** — 1 nguồn duy nhất để xem mọi loại giảm giá đã thực hiện.

---

## 📝 AUDIT LOG — Trail chi tiết để truy vết khi có dispute

### Mục đích

Khi có dispute (KH khiếu nại sai discount, kế toán nghi ngờ data, audit nội bộ), cần truy được:
- Ai (employee) đã apply voucher/promo cho đơn nào?
- Lúc nào (timestamp chính xác)?
- Số tiền order trước/sau khi apply?
- Voucher/promo đó có hợp lệ tại thời điểm đó không (snapshot config)?
- Có ai sửa/xóa voucher/promo sau đó không (configuration history)?

### Schema audit log

```sql
-- Audit log cho mọi action liên quan voucher/promo
CREATE TABLE marketing_audit_log (
  id              BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type     VARCHAR(20) NOT NULL,    -- 'COUPON' | 'PROMOTION'
  entity_id       BIGINT NOT NULL,
  action          VARCHAR(30) NOT NULL,    -- xem enum bên dưới
  invoice_id      BIGINT NULL,             -- nếu action liên quan sale
  customer_id     BIGINT NULL,
  employee_id     BIGINT NOT NULL,         -- người thực hiện
  branch_id       BIGINT,
  bsn_id          BIGINT,
  request_payload TEXT,                    -- JSON snapshot input (KH gõ gì)
  entity_snapshot TEXT,                    -- JSON snapshot config tại thời điểm action
  result_code     INT,                     -- 0=success, !=0=fail (lý do)
  result_message  VARCHAR(500),
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  created_at      DATETIME NOT NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_invoice (invoice_id),
  INDEX idx_employee_date (employee_id, created_at),
  INDEX idx_action_date (action, created_at)
);

-- Action enum
-- CREATE      — tạo voucher/promo mới
-- UPDATE      — sửa config
-- DELETE      — xóa
-- ACTIVATE    — đổi status 0→1
-- DEACTIVATE  — đổi status 1→0/3
-- APPLY       — gọi /apply (validate)
-- APPLY_FAIL  — apply bị reject (hết hạn / không đủ minOrder / hết quota)
-- REDEEM      — invoice/create thành công với promo/voucher → tạo usage record
-- REDEEM_FAIL — race condition fail tại invoice/create
-- REVERT      — return/cancel invoice → revert usage
```

### Khi nào ghi audit log

| Action | Trigger | Note |
|---|---|---|
| `CREATE` | `POST /coupon/update` (id null) | Snapshot full payload |
| `UPDATE` | `POST /coupon/update` (id != null) | Snapshot before + after diff |
| `DELETE` | `DELETE /coupon/delete` | |
| `ACTIVATE/DEACTIVATE` | `POST /coupon/update/status` | Lưu old + new status |
| `APPLY` | `POST /coupon/apply` (success) | Lưu code, orderAmount, discountReturned |
| `APPLY_FAIL` | `POST /coupon/apply` (rejected) | Lưu lý do reject |
| `REDEEM` | `POST /invoice/create` có couponCode | Snapshot voucher config tại thời điểm này |
| `REDEEM_FAIL` | invoice/create reject promo (race) | Lưu lý do |
| `REVERT` | `POST /return/confirm` | Lưu invoiceId gốc + return invoice |

### Endpoints audit query

```
GET /market/audit/voucher?couponId=X&page=1&size=50&action=&fromDate=&toDate=
GET /market/audit/promotion?promotionId=X&...
GET /market/audit/by-invoice?invoiceId=X
   → Tất cả action ảnh hưởng đến invoice X (apply, redeem, revert)

GET /market/audit/by-employee?employeeId=Y&fromDate=&toDate=
   → Lịch sử thao tác CTKM/voucher của nhân viên Y (cho HR/audit)

GET /market/audit/suspicious?fromDate=&toDate=
   → Phát hiện anomaly: nhiều APPLY_FAIL liên tục, REDEEM của voucher đã xóa,
     discount > orderAmount, etc.
```

### Response shape audit query

```json
{
  "items": [
    {
      "id": 12345,
      "entityType": "COUPON",
      "entityId": 137,
      "action": "REDEEM",
      "invoiceId": 4083,
      "customerId": -1,
      "employeeId": 54,
      "employeeName": "Nguyễn Văn A",
      "branchId": 23,
      "branchName": "Viettel Store",
      "requestPayload": "{\"code\":\"REBORN50K\",\"orderAmount\":300000}",
      "entitySnapshot": "{\"code\":\"REBORN50K\",\"discount\":50000,\"minOrder\":200000,\"maxUses\":5,\"usedCount\":2}",
      "resultCode": 0,
      "resultMessage": "OK",
      "ipAddress": "192.168.1.10",
      "createdAt": "2026-04-13T16:30:00"
    }
  ],
  "total": 50, "page": 1
}
```

### Retention policy

- Audit log giữ **tối thiểu 2 năm** (theo quy định kế toán VN)
- Có thể partition table theo tháng để tăng performance query
- Backup riêng audit log ra cold storage sau 1 năm

---

## 🔒 BUDGET ENFORCEMENT — Hiện không hoạt động

### Vấn đề hiện tại

`promotion.budget` field tồn tại trong schema nhưng **không được enforce** vì không có `usedAmount` để so sánh. Marketing có thể đốt tiền không giới hạn.

### Fix

Trong `invoice/create` handler (đã có ở Phase 1), thêm check budget:

```java
if (req.getPromotionId() != null) {
  Promotion p = promoRepo.findByIdForUpdate(req.getPromotionId());

  if (p.getBudget() > 0) {
    // SUM discount đã usedAmount trước đó (excluded reverted)
    long usedAmount = promotionUsageRepo.sumActiveDiscountByPromotion(p.getId());
    if (usedAmount + req.getPromoDiscount() > p.getBudget()) {
      throw "CTKM '" + p.getName() + "' đã vượt ngân sách " + p.getBudget()
          + " (đã chi " + usedAmount + ")";
    }
  }

  // ... save usage
}
```

### Endpoint check budget remaining

```
GET /market/promotion/budget?promotionId=X
→ {
    budget: 5000000,
    usedAmount: 3500000,
    remaining: 1500000,
    percentUsed: 70
  }
```

FE hiển thị progress bar "Đã dùng 70% ngân sách" trong list promo.

---

## 🚨 ALERTING — Cảnh báo bất thường

Sau khi có audit log, BE nên có job định kỳ phát hiện:

1. **Apply spam attack**: > 100 `APPLY_FAIL` cùng 1 voucher trong 1 phút từ cùng IP
2. **Voucher bị abuse**: 1 customer redeem cùng 1 voucher > N lần (nếu có rule "1 KH 1 lần")
3. **Discount > orderAmount**: phát hiện đơn discount > 80% giá trị đơn (suspicious)
4. **Promo đã expire vẫn redeem**: race condition giữa `apply` và `create` — cần alert
5. **Budget gần hết**: promo dùng > 90% budget → thông báo manager

Endpoint:
```
GET /market/alert/list?status=open&severity=high
POST /market/alert/{id}/resolve
```

---

## Re-test sau fix

```bash
# Voucher
node tests/test-e2e-voucher-flow.mjs           # happy path
node tests/test-voucher-edge-cases.mjs         # 2 bugs sẽ fix

# Promotion
node tests/test-e2e-promotion-flow.mjs         # happy path
node tests/test-promo-tracking-deep.mjs        # tất cả tracking phải có data

# Cross-entity audit (cần viết test mới)
node tests/test-e2e-discount-audit.mjs         # TODO sau khi BE deploy
```

Expected sau fix toàn bộ:

| Verification | Trước | Sau |
|---|---|---|
| `voucher.usedCount` tăng theo invoice (không apply alone) | ❌ | ✅ |
| `promotion.usedCount` tăng theo invoice | ❌ (luôn 0) | ✅ |
| `/coupon/usage`, `/promotion/usage` list invoices | ❌ 404 | ✅ |
| `/coupon/dashboard`, `/promotion/dashboard` real data | ❌ Mock FE | ✅ Real |
| `/coupon/by-invoice`, `/promotion/by-invoice` audit | ❌ 404 | ✅ |
| `/discount-summary/*` cross-entity | ❌ Không có | ✅ |
| Cancel invoice → revert usage + count giảm | ❌ Không track | ✅ |
| Budget enforcement | ❌ Vô nghĩa | ✅ Reject khi vượt |
| Audit log tracking 9 actions | ❌ Không có | ✅ |
| Alert anomaly | ❌ Không có | ✅ |

## Migration plan

1. **Schema migration** (zero-downtime nếu add column, table mới thì OK):
   - Tạo `coupon_usage`, `promotion_usage`, `marketing_audit_log`
   - Add columns: invoice request DTO mở rộng (backward-compat: optional)

2. **Code deploy**:
   - Deploy BE với feature flag `ENABLE_USAGE_TRACKING=false` ban đầu
   - Smoke test trên staging
   - Bật flag → bắt đầu track từ đó

3. **Backfill** (best-effort, optional):
   - Voucher: scan invoice cũ có discount > 0 → match với coupon cùng value và cùng date range → tạo usage records (chỉ ~70-80% chính xác)
   - Promotion: tương tự, có thể lower hơn vì không có lookup field
   - **Hoặc** chấp nhận lost data → reset all counters và bắt đầu từ deploy date (recommend)

4. **FE deploy** (sau khi BE OK):
   - Update CounterSales/index.tsx body có couponCode + promotionId + couponDiscount + promoDiscount
   - Update Cart/index.tsx lưu voucher.code state
   - Replace PromotionDashboard MOCK data
   - Tạo trang `/audit/marketing` mới để xem audit log (optional Phase 2)

5. **Verify**:
   - Chạy test suite voucher + promo + audit
   - Manual check: tạo 1 sale với voucher → query `/coupon/usage` → có bản ghi
   - Manual check: cancel sale → `coupon_usage.reverted_at` set + `usedCount` giảm
