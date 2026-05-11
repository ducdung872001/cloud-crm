# ✅ [RESOLVED 2026-04-15] BACKEND TASK — `/shift/close` tính `cashDifference` sai công thức

> **Status**: ✅ **FIXED** — verified 2026-04-15 bởi `test-e2e-shift-flow.mjs` (20/20 PASS, S6-04 = `cashDifference = 0` khi đếm khớp). BE đã áp công thức đúng: `expectedCash = openingCash + totalCashSales - totalCashRefunds`.

**Discovered:** 2026-04-13 — E2E test `test-e2e-shift-flow.mjs` (S6-04)
**Severity:** 🔴 **CRITICAL** — Báo cáo ca sai, kế toán nghi ngờ cashier gian lận mặc dù đếm đúng
**Module:** `cloud-sales-master`
**Endpoints:**
- `POST /sales/shift/close?branchId={X}` — response có `cashDifference` sai
- `GET /sales/shift/close-report?shiftId={X}` — report trả về `cashDifference` sai (cùng root cause)

---

## Mô tả bug

Khi close ca với `closingCash` đếm khớp chính xác (openingCash + totalCashSales), BE báo `cashDifference > 0` (thừa tiền) trong khi thực tế **cashier đếm hoàn toàn đúng, không lệch đồng nào**.

### Công thức SAI (hiện tại)

```
expectedCash    = openingCash  (không cộng doanh thu tiền mặt)
cashDifference  = closingCash - openingCash
```

### Công thức ĐÚNG (cần sửa)

```
expectedCash    = openingCash + totalCashSales - totalCashRefunds
cashDifference  = closingCash - expectedCash
```

## Hard evidence (E2E 2026-04-13, test `test-e2e-shift-flow.mjs`)

### Setup
- Ca 1 (shiftId=13) với `openingCash = 10,000,000`
- Bán 3 đơn × 100k qua `/sales/invoice/create` có `shiftId=13` + refund 1 đơn 100k
- Tổng bán tiền mặt trong ca test: 300k
- Ca đã có sẵn 800k doanh thu từ trước → **totalCashSales = 1,100,000**

### Request

```http
POST /sales/shift/close?branchId=23
{
  "shiftId": 13,
  "closingCash": 11100000,
  "note": "E2E test"
}
```

`closingCash = 11,100,000` được tính từ chính `/shift/active-dashboard.currentCash` (BE tự báo đây là giá trị expected).

### Response (BUG)

```json
{
  "code": 0,
  "result": {
    "id": 13,
    "shiftCode": "CA-1774500296902",
    "openingCash": 10000000,
    "closingCash": 11100000,
    "expectedCash": 10000000,        ← ❌ SAI
    "cashDifference": 1100000,       ← ❌ SAI (báo thừa 1.1tr)
    "status": "CLOSED"
  }
}
```

### Close-report cũng sai cùng cách

```http
GET /sales/shift/close-report?shiftId=13
```

```json
{
  "totalCash":          1100000,      ← ĐÚNG (doanh thu cash ca)
  "totalRevenue":       1100000,      ← ĐÚNG
  "openingCash":        10000000,     ← ĐÚNG
  "actualCashCounted":  11100000,     ← ĐÚNG (user đếm)
  "cashDifference":     1100000,      ← ❌ SAI (phải là 0)
  "diffNote":           "E2E test"
}
```

### Trong khi `/active-dashboard` lại tính ĐÚNG

```http
GET /sales/shift/active-dashboard?branchId=23
```

```json
{
  "openingCash":    10000000,
  "totalCashSales": 1100000,
  "currentCash":    11100000,   ← ĐÚNG: openingCash + totalCashSales
  "cashDifference": 0           ← ĐÚNG (trước close)
}
```

→ **Bug chỉ ở endpoint `/shift/close` (calc) và `/shift/close-report` (đọc lại từ DB sau khi lưu sai).** `active-dashboard` dùng công thức đúng.

## Impact

| Stakeholder | Hậu quả |
|---|---|
| **Cashier** | Bị nghi ngờ thừa/thiếu tiền trong khi thực tế đếm chính xác |
| **Kế toán / chủ cửa hàng** | Số chênh lệch ca sai → audit sổ sách loạn |
| **Báo cáo tổng quan** | `/shift/general-report.cashDifference` cũng có thể sai theo |
| **KPI nhân viên** | Đánh giá sai hiệu quả cashier dựa trên số dư ca |

Nghiêm trọng nhất là **UNDERCOUNT khi có refund**: giả sử refund = 500k bằng tiền mặt, BE trừ 500k vào quỹ → expected giảm, nhưng nếu BE cũng tính sai ở chiều này thì cashier bị báo "thiếu tiền".

## Action BE

### Fix 1: Sửa công thức trong `/shift/close` handler

```java
// pseudo — trong ShiftService.close()
long totalCashSales    = queryTotalCashSales(shiftId);     // SUM từ invoice IV1 có shiftId và paymentType=1
long totalCashRefunds  = queryTotalCashRefunds(shiftId);   // SUM từ invoice IV2 có shiftId và refundMethod=1 (tiền mặt)
long expectedCash      = shift.getOpeningCash() + totalCashSales - totalCashRefunds;
long cashDifference    = request.getClosingCash() - expectedCash;

shift.setExpectedCash(expectedCash);
shift.setClosingCash(request.getClosingCash());
shift.setCashDifference(cashDifference);
shift.setStatus(CLOSED);
```

### Fix 2: Đồng bộ lại `/shift/close-report`

Response endpoint này đọc từ DB → chỉ cần Fix 1 là auto đúng. Nhưng verify thêm: nếu BE compute lại ở close-report, cần dùng cùng công thức.

### Fix 3: Verify `/shift/general-report.cashDifference`

Endpoint tổng quan có field `cashDifference` — chắc chắn aggregate từ các shift. Sau Fix 1, các shift đã close có giá trị đúng nên aggregate cũng đúng.

### Edge cases

1. **Refund tiền mặt**: `totalCashRefunds` phải được tính — nếu không, BE sẽ thừa tiền
2. **Non-cash payment** (thẻ, QR, transfer): KHÔNG được cộng vào `expectedCash` (vì không vào két tiền mặt)
3. **Ca có nhiều cashier**: `totalCashSales` vẫn aggregate toàn ca, không split theo user
4. **Shift đã close** nhưng data sai sẵn: có thể cần migration update `expected_cash` và `cash_difference` cho các record cũ

## Re-test

```bash
node tests/test-e2e-shift-flow.mjs
# Hiện tại:      17/19 PASS (S3-04 matching logic + S6-04 bug)
# Sau BE fix:    19/19 (S6-04 sẽ PASS)
```

Verify nhanh:
```bash
# Open ca với openingCash = 5,000,000
# Bán 2 đơn × 100k cash (totalCashSales = 200,000)
# Close với closingCash = 5,200,000 (đếm đúng)
# Expected response: expectedCash=5,200,000, cashDifference=0
```

## Files FE liên quan (chỉ tham khảo)

- `src/services/ShiftService.ts:14` — `close: POST /sales/shift/close`
- `src/services/ShiftService.ts:15` — `closeReport: GET /sales/shift/close-report`
- `src/pages/ShiftManagement/partials/CloseShift/CloseShiftTab.tsx:33-37` — FE đọc `cashDifference` từ close-report để hiển thị
- `src/pages/ShiftManagement/partials/ReportShift/ReportShiftTab.tsx:9-26` — Shape DTO
