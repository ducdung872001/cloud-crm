# ✅ [RESOLVED 2026-04-15] BACKEND TASK — `/invoice/list?status=3` và filter date không hoạt động

> **Status**: ✅ **FIXED** — verified 2026-04-15 bởi `test-e2e-cancel-dashboard-sync.mjs` (5/5 PASS). T3 cancelled-list-count delta=+1, T4 cancelled-list-total delta=+200k, T5 latest cancelled = HD004131 đúng. Cả `status=3` filter và `fromDate/toDate` hoạt động chính xác.

**Discovered:** 2026-04-13 — E2E `test-e2e-cancel-dashboard-sync.mjs`
**Severity:** 🟡 **MEDIUM** — Tab "Đã hủy" trong POS Orders rỗng dù dashboard đã đúng
**Module:** `cloud-sales-master`
**Round 1 đã fix:** Dashboard aggregate (totalCancelOrder, todayOrder, todayRevenue, tab-counts.cancelledCount) — 4/6 metric.

---

## 2 vấn đề còn lại

### 1. `/invoice/list?status=3` trả rỗng

```
GET /sales/invoice/list?page=1&limit=100&status=3&fromDate=2026-04-13&toDate=2026-04-13
→ result.items = []
```

Sau khi cancel HD004057 thành công (IV2 refer đã confirm), list này phải trả HD004057. Hiện vẫn rỗng.

**Root cause (suy đoán):** BE round 1 đã fix `COUNT query` dùng JOIN IV1↔IV2, nhưng `LIST query` vẫn filter `WHERE i.status = 3` legacy — semantics không đồng bộ với flow cancel-via-return.

### 2. Filter `fromDate`/`toDate` trên list endpoint không lọc được

```
GET /sales/invoice/list?page=1&limit=200&fromDate=2026-04-13&toDate=2026-04-13
→ items rỗng dù có nhiều IV1 tạo trong ngày
```

Có thể bị strip param hoặc compare format sai.

---

## Background — Cancel flow

FE cancel đơn POS bằng cách tạo **phiếu trả toàn bộ** (IV2) thay vì update `IV1.status`:

```
1. POST /sales/invoice/create/return   — IV2 với referId = IV1.id
2. POST /sales/invoice/return/confirm  — BE hoàn stock + cashbook chi
```

IV1 gốc giữ `status = 1`. Đây là design đúng (giữ audit trail).

---

## Action BE

### Fix 1: `/invoice/list` khi `status=3`

Dùng cùng JOIN IV1↔IV2 logic như COUNT query đã fix round 1:

```sql
SELECT i.* FROM invoice i
WHERE i.invoice_type = 'IV1'
  AND DATE(i.receipt_date) BETWEEN :from AND :to
  AND :status = 3
  AND EXISTS (
    SELECT 1 FROM invoice r
    WHERE r.invoice_type = 'IV2'
      AND r.refer_id = i.id
      AND r.status = 1
  )
ORDER BY i.receipt_date DESC
```

Hoặc tách filter mới `?cancelledViaReturn=true` nếu muốn giữ semantics legacy.

### Fix 2: Verify filter `fromDate`/`toDate`

Check SQL có `WHERE DATE(receipt_date) BETWEEN :from AND :to` không. Có thể đang bị strip params hoặc compare sai format.

---

## Re-test

```bash
node tests/test-e2e-cancel-dashboard-sync.mjs
# Hiện: 1/5 PASS (chỉ tab-counts cancelled)
# Sau fix: 5/5 PASS
```

```bash
# Tạo + hủy 1 đơn HD0040XX
# GET /sales/invoice/list?status=3&fromDate=today&toDate=today
# Expected: result.items[0].invoiceCode === "HD0040XX"
```

---

## Files FE liên quan

- `src/pages/Sell/SaleInvoiceList/SaleInvoiceList.tsx` — đọc statusCounts + list
- `src/pages/CounterSales/components/OrderList/index.tsx` — tab filter "❌ Đã hủy"
- `src/utils/cancelInvoiceFlow.ts` — helper cancel via return
