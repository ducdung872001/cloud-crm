# BACKEND TASK — Mở rộng `POST /sales/invoice/create` để link voucher + promotion

**Severity:** 🔴 **CRITICAL** — phần thuộc `cloud-sales-master` trong unified design
**Module:** `cloud-sales-master`
**Owner design:** `cloud-market-master` — xem [market/voucher-promotion-unified.md](../market/voucher-promotion-unified.md) cho kiến trúc đầy đủ (schema, reverse flow, reports, audit, budget, alerting).

---

## Bối cảnh

`cloud-market-master` owns voucher + promotion. Khi sale hoàn tất, phải tạo audit trail per invoice → cần sales-master ghi `voucher_usage` / `promotion_usage` ngay trong transaction của `/invoice/create`.

Bug gốc: hiện `/sales/invoice/create` **không nhận** `couponCode` / `promotionId` trong body → BE không biết invoice nào dùng voucher/CTKM nào → mọi báo cáo CTKM sai hoặc mock.

---

## Scope của sales-master

### 1. Accept 2 field mới trong request

```json
POST /sales/invoice/create
{
  ...existing fields,
  "couponCode":  "SALE50",     // optional — voucher đã apply
  "promotionId": 42             // optional — CTKM auto-applied
}
```

### 2. Ghi usage record trong transaction

Trong cùng DB transaction của `invoice/create`:

```java
@Transactional
public Invoice createInvoice(CreateInvoiceRequest req) {
    Invoice inv = persistInvoice(req);

    if (req.couponCode != null) {
        // Gọi sang market-master hoặc ghi thẳng nếu share DB
        voucherUsageService.record(inv.id, req.couponCode, req.discount);
    }
    if (req.promotionId != null) {
        promotionUsageService.record(inv.id, req.promotionId, req.discount);
    }
    return inv;
}
```

Chú ý: nếu `market-master` và `sales-master` không share DB, dùng outbox pattern hoặc sync HTTP call — **phải idempotent** (retry không double-count).

### 3. Reverse khi cancel via return (IV2 confirm)

Khi `POST /sales/invoice/return/confirm` xử lý IV2 trả toàn bộ, phải gọi:

```java
voucherUsageService.reverse(originalIv1Id, reason);
promotionUsageService.reverse(originalIv1Id, reason);
```

Để `usedCount` trong `voucher` / `promotion` giảm đúng, giữ đúng ngân sách.

---

## Checklist

- [ ] Thêm field `couponCode` + `promotionId` vào request DTO
- [ ] Validate: code/id tồn tại + còn hiệu lực + còn budget (call sang market-master check)
- [ ] Ghi usage trong transaction create invoice
- [ ] Reverse usage trong flow confirm IV2 full return
- [ ] Idempotent: retry không double-count
- [ ] E2E test `test-e2e-voucher-flow.mjs` + `test-e2e-promotion-flow.mjs` xanh

---

## Files FE liên quan

- `src/pages/CounterSales/index.tsx` — nơi build body `invoice/create`, cần push thêm `couponCode` + `promotionId`
- `src/pages/CounterSales/components/Cart/index.tsx` — state `couponDiscount`, `promoDiscount`
- `src/utils/cancelInvoiceFlow.ts` — helper cancel → BE sẽ tự reverse

## Cross-ref

- Kiến trúc đầy đủ: [market/voucher-promotion-unified.md](../market/voucher-promotion-unified.md)
- Schema `voucher_usage` / `promotion_usage` định nghĩa trong doc market
- Reports endpoint đầy đủ trong doc market
