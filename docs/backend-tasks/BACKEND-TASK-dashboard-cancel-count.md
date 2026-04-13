# BACKEND TASK — Dashboard không count đơn hủy + filter status=3 không work

**Discovered:** 2026-04-13 — E2E test `test-e2e-cancel-dashboard-sync.mjs`
**Round 1 fix:** ✅ 2026-04-13 — BE đã fix các metric AGGREGATE (3/5)
**Round 2 cần:** ⚠️ Endpoint `/sales/invoice/list?status=3` vẫn trả rỗng (2/5 còn open)
**Severity:** 🟡 **MEDIUM** (giảm từ HIGH sau round 1) — Tab "Đã hủy" vẫn rỗng dù dashboard đã đúng
**Module:** `cloud-sales-master`

## Trạng thái fix (re-test 2026-04-13)

| # | Endpoint / Field | Trước fix | Sau round 1 | Trạng thái |
|---|---|---|---|---|
| 1 | `dashboard.totalCancelOrder` | ❌ không tăng | ✅ 31 → 32 sau hủy | **DONE** |
| 2 | `dashboard.todayOrder` | ❌ không giảm | ✅ 35 → 34 sau hủy | **DONE** |
| 3 | `dashboard.todayRevenue` | ❌ không trừ | ✅ 5,509,000 → 5,309,000 sau hủy | **DONE** |
| 4 | `tab-counts.cancelledCount` | ❌ thiếu field | ✅ có field, 10 → 11 sau hủy | **DONE** |
| 5 | `/invoice/list?status=3` | ❌ trả `[]` | ❌ vẫn trả `[]` | **CÒN OPEN** |
| 6 | `/invoice/list?fromDate=&toDate=` | ❌ filter không work | ❌ vẫn không lọc được | **CÒN OPEN** |

→ **Round 1 fix đã hoàn thành 4/6 metric AGGREGATE** (count + sum). Cần round 2 fix endpoint LIST chi tiết.

---

## Round 2 — Vấn đề còn lại

### List endpoint không trả cancelled invoices

```
GET /sales/invoice/list?page=1&limit=100&status=3&fromDate=2026-04-13&toDate=2026-04-13
→ result.items = []
```

Sau khi cancel HD004057 thành công (return invoice 4059 confirmed), endpoint list này phải trả ít nhất 1 entry (chính là HD004057). Hiện vẫn rỗng.

### Tác động UX

- ✅ Dashboard chính hiển thị "Đã hủy: 32" — **đúng số**
- ❌ Tab **"❌ Đã hủy"** trong POS Orders ([SaleInvoiceList](src/pages/Sell/SaleInvoiceList/SaleInvoiceList.tsx)) — **vẫn rỗng**
- ❌ User click filter "Đã hủy" → thấy 0 đơn → không drill-down được để xem chi tiết
- ❌ Không có cách audit list cancelled invoices từ UI

### Root cause khả năng

BE round 1 đã fix các **COUNT query** nhưng có thể là 2 SQL query khác nhau:

```sql
-- COUNT (đã fix ✓):
SELECT COUNT(*) FROM invoice i
WHERE i.invoice_type = 'IV1'
  AND EXISTS (SELECT 1 FROM invoice r WHERE r.invoice_type='IV2' AND r.refer_id=i.id AND r.status=1)

-- LIST (chưa fix ❌):
SELECT * FROM invoice WHERE status = 3 ...  -- vẫn dùng status=3 legacy
```

Hai query này không đồng bộ semantics. Cần BE update LIST query dùng cùng JOIN logic.

## Action BE round 2

### Fix duy nhất còn lại: Update `/invoice/list` khi `status=3`

```sql
-- Pseudo
SELECT i.* FROM invoice i
WHERE i.invoice_type = 'IV1'
  AND DATE(i.receipt_date) BETWEEN :from AND :to
  AND :status = 3       -- chỉ apply join khi filter cancelled
  AND EXISTS (
    SELECT 1 FROM invoice r
    WHERE r.invoice_type = 'IV2'
      AND r.refer_id = i.id
      AND r.status = 1   -- return đã confirmed
  )
ORDER BY i.receipt_date DESC
```

Hoặc nếu BE muốn giữ logic `status=3` cũ (legacy hard-cancel), thêm filter mới:
```
GET /invoice/list?cancelledViaReturn=true
```
→ FE gọi cách này khi user click tab "Đã hủy".

### Verify cùng lúc filter date

Cũng cần check `fromDate`/`toDate` filter trên list endpoint có hoạt động không:
```
GET /sales/invoice/list?page=1&limit=200&fromDate=2026-04-13&toDate=2026-04-13
→ Hiện trả empty (mặc dù có nhiều invoice IV1 hôm nay)
```

Có thể bị strip param hoặc compare format sai. Verify SQL có `WHERE DATE(receipt_date) BETWEEN :from AND :to` không.

## Re-test sau round 2

```bash
node tests/test-e2e-cancel-dashboard-sync.mjs
# Hiện tại sau round 1: 1/5 PASS (chỉ T1 — tab-counts cancelled)
# Sau round 2 fix: 5/5 PASS
```

Verify nhanh:
```bash
# 1. Tạo + hủy 1 đơn HD0040XX
# 2. GET /sales/invoice/list?status=3&fromDate=today&toDate=today
# Expected: result.items[0].invoiceCode === "HD0040XX"
```

---

## Endpoints affected (legacy reference)

- `GET /sales/invoice/dashboard` — ✅ FIXED round 1
- `GET /sales/invoice/tab-counts` — ✅ FIXED round 1
- `GET /sales/invoice/list?status=3` — ❌ **CÒN OPEN — round 2 cần fix**
- `GET /sales/invoice/list?fromDate=X&toDate=X` — ❌ **CÒN OPEN — round 2 cần fix**

---

## Mô tả bug

### Background — Cancel flow design

FE hiện cancel đơn POS bằng cách **tạo phiếu trả toàn bộ** (Return invoice IV2) thay vì update status đơn gốc:

```
1. POST /sales/invoice/create/return — tạo IV2 với referId = IV1.id
2. POST /sales/invoice/return/confirm?id=IV2 — BE hoàn stock + cashbook chi
3. ✓ Stock + Finance đã verify đúng (test-e2e-cancel-order-flow.mjs 16/16 PASS)
```

→ Đơn IV1 gốc vẫn giữ `status = 1` trong DB. Chỉ có IV2 mới sinh ra.

Đây là design ĐÚNG (giữ audit trail, không destructive update).

### Vấn đề

Dashboard và các endpoint thống kê đang **dùng `IV1.status = 3` làm điều kiện** count cancelled — nên không đếm được đơn đã cancel via return flow.

## Hard evidence (E2E 2026-04-13)

### Setup
- Tạo HD004053 (IV1, total=200,000)
- Cancel via return → IV2 = 4055 OK, stock hoàn 2, fund net=0
- 3 lần snapshot dashboard (trước tạo / sau tạo / sau hủy)

### Snapshot

```
BASELINE:
  /sales/invoice/dashboard:
    totalOrder: 580
    totalCancelOrder: 4
    todayRevenue: 7,054,000
    todayOrder: 43
  /sales/invoice/tab-counts:
    {"draftCount": 232, "orderCount": 43}    ← thiếu cancelledCount

SAU KHI TẠO HD004053:
  totalOrder: 582      (+2 — có thể đếm cả tạo nháp + confirm?)
  totalCancelOrder: 4  (giữ nguyên — đúng)
  todayOrder: 44       (+1 — đúng)

SAU KHI CANCEL (return invoice 4055 confirmed):
  totalOrder: 584      (+2 nữa — đếm thêm IV2?)
  totalCancelOrder: 4  ❌ (phải = 5)
  todayOrder: 44       ❌ (phải = 43, không đếm đơn đã hủy)
  todayRevenue: 7,254,000  ❌ (vẫn cộng 200k của HD004053 đã hủy)
```

### Bug 2: `/sales/invoice/list?status=3` trả rỗng

```
GET /sales/invoice/list?page=1&limit=100&status=3&fromDate=2026-04-13&toDate=2026-04-13
→ result.items = []
```

Mặc dù đã có 4 cancelled invoices từ trước (theo `totalCancelOrder=4`), filter `status=3` trả rỗng. Có thể:
- `status=3` query bị ignore
- Hoặc 4 cancelled cũ không phải `status=3` (BE count sai source khác)

### Bug 3: filter `fromDate`/`toDate` không hoạt động

```
GET /sales/invoice/list?page=1&limit=200&fromDate=2026-04-13&toDate=2026-04-13
→ items không có entry nào của hôm nay (mặc dù vừa tạo HD004053)
```

byStatus client-side tính ra `{}` (empty). Có thể filter date không lọc đúng.

## Impact

| Stakeholder | Hậu quả |
|---|---|
| **Manager xem dashboard** | Số đơn đã hủy luôn = 4 (cũ), không phản ánh thực tế |
| **Tab "Đã hủy" trong POS Orders** | Hoàn toàn rỗng → user nghĩ chưa có đơn nào bị hủy |
| **Báo cáo doanh thu hôm nay** | Cộng cả đơn đã hủy → sai số liệu |
| **Audit / kế toán** | Không có nguồn list cancelled invoices để đối chiếu |

## Action BE

### Fix 1 (recommend): JOIN IV1 ↔ IV2 trong dashboard query

```sql
-- pseudo: count đơn đã cancelled = đơn IV1 có IV2 referId trỏ về
SELECT COUNT(DISTINCT i.id) AS cancelled_count
FROM invoice i
WHERE i.invoice_type = 'IV1'
  AND i.status = 1  -- success (chưa update status)
  AND EXISTS (
    SELECT 1 FROM invoice r
    WHERE r.invoice_type = 'IV2'
      AND r.refer_id = i.id
      AND r.status = 1  -- return đã confirmed
      -- AND r.fee = i.fee  -- nếu muốn phân biệt FULL cancel vs partial return
  )
  AND DATE(i.receipt_date) = CURDATE()
```

Apply tương tự cho:
- `totalCancelOrder` trong `/invoice/dashboard`
- `cancelledCount` trong `/invoice/tab-counts` (thêm field này)
- `todayOrder` phải EXCLUDE cancelled (chỉ đếm IV1 không có IV2 full-return)
- `todayRevenue` phải SUBTRACT refund

### Fix 2: `/invoice/list?status=3` filter

Quyết định semantics:
- **Option A**: `status=3` = IV1 có hard status=3 (legacy) → backward compat
- **Option B**: `status=3` = IV1 có IV2 full-return → mới, đúng với cancel flow hiện tại
- **Option C**: thêm filter mới `?cancelled=true` → tách rời

Recommend B hoặc C.

### Fix 3: Filter `fromDate`/`toDate`

Verify SQL query có `WHERE DATE(receipt_date) BETWEEN :from AND :to` không. Có thể đang bị strip params hoặc compare sai format.

### Fix 4: tab-counts thêm `cancelledCount`

```json
{
  "draftCount": 232,
  "orderCount": 43,
  "cancelledCount": 5    ← THÊM
}
```

FE sẽ hiển thị badge "❌ Đã hủy (5)" trong tab filter.

## Re-test

```bash
node tests/test-e2e-cancel-dashboard-sync.mjs
# Hiện tại: 0/5 PASS
# Sau BE fix: 5/5 PASS
```

Verify nhanh sau fix:
```bash
# Tạo 1 đơn → hủy
# GET /sales/invoice/dashboard
# Expected: totalCancelOrder +1, todayOrder không tăng (hoặc tăng rồi giảm), todayRevenue đúng net

# GET /sales/invoice/tab-counts?branchId=23
# Expected: có field cancelledCount

# GET /sales/invoice/list?status=3&fromDate=today&toDate=today
# Expected: có entry HD vừa hủy
```

## Files FE liên quan

- `src/pages/Sell/SaleInvoiceList/SaleInvoiceList.tsx:290-341` — đọc statusCounts từ list response
- `src/pages/CounterSales/components/OrderList/index.tsx:53-58` — tab filter "❌ Đã hủy" hiện luôn 0
- `src/pages/CounterSales/index.tsx:79` — call `/invoice/tab-counts`
- `src/pages/Dashboard/index.tsx` — hiển thị `totalCancelOrder`
- `src/utils/cancelInvoiceFlow.ts` — helper cancel via return (mới, đã commit)
