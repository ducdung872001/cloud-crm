# BACKEND TASK — `return/confirm` không tạo cashbook entry chi (hoàn tiền)

**Discovered:** 2026-04-12 — E2E test `test-e2e-financial-flow.mjs`
**Status:** ✅ **RESOLVED 2026-04-13** — BE đã fix, re-test 21/21 PASS
**Severity:** 🔴 **HIGH / CRITICAL** — sai số liệu tài chính & kế toán
**Module:** `cloud-sales-master` + `cloud-billing-master`
**Endpoint:** `POST /sales/invoice/return/confirm?id={returnInvoiceId}`

---

## Mô tả bug

Khi khách hàng trả hàng:
1. ✅ FE gọi `POST /sales/invoice/create/return` → BE tạo invoice IV2 đúng (fee, paid, referId link đơn gốc)
2. ✅ FE gọi `POST /sales/invoice/return/confirm?id=X` → BE set status invoice → "done"
3. ✅ BE **có** restock sản phẩm vào kho (stock hồi phục đúng — verified bởi `test-e2e-return-exchange.mjs`)
4. ❌ **BE KHÔNG tạo entry cashbook chi** cho khoản hoàn tiền khách
5. ❌ **BE KHÔNG giảm `totalFundBalance`** (số dư quỹ không giảm)
6. ❌ **BE KHÔNG tăng `totalExpense`** trong finance dashboard

→ Dẫn tới **số liệu tài chính SAI NGHIÊM TRỌNG**:
- Kế toán không thấy khoản chi refund
- Tiền quỹ "ảo" — doanh nghiệp tưởng có tiền nhưng thực tế đã hoàn khách
- Sổ sách không cân (sau 1 chu kỳ bán+trả khép kín, P/L ≠ 0)

## Hard evidence (E2E 2026-04-12)

### Test setup
- Baseline snapshot tài chính
- Bán 1 đơn 200,000đ → verify
- Trả toàn bộ đơn đó → verify
- Cross-check finance dashboard ↔ cashbook

### Scenario A — BÁN 200,000đ (đúng nghiệp vụ ✅)

```
BASELINE                 → totalIncome=2,700,000  totalFundBalance=2,746,036,904
POST /invoice/create     → code=0, HD003935, fee=200000
SAU KHI BAN              → totalIncome=2,900,000  totalFundBalance=2,746,236,904

DELTA:
  totalIncome      +200,000 ✓
  totalFundBalance +200,000 ✓
  cashbook thu     +1 entry, amount=200,000 ✓
  invoice IV1      +1, total +200,000 ✓
  
  Cashbook entry mới (id=1688):
    type=1, amount=200000, invoiceId=3935
    note="Thu từ bán hàng - HĐ #3935 - Khách vãng lai #3935"
```

→ **Bán hàng hoạt động đúng 100%**: finance dashboard, cashbook, invoice list khớp.

### Scenario B — TRẢ TOÀN BỘ đơn 200,000đ (BUG ❌)

```
POST /invoice/create/return   → code=0, return invoice id=3937
POST /invoice/return/confirm  → code=0

Verify return invoice tồn tại:
GET /sales/invoice/get?id=3937
  → invoiceType=IV2, fee=200000, paid=200000, referId=3935, status=1 ✓

SAU KHI TRA HANG          → totalIncome=2,900,000  totalExpense=0  totalFundBalance=2,746,236,904

DELTA so với sau bán:
  totalIncome      +0      (đúng — không cộng thêm income khi trả)
  totalExpense     +0      ❌ EXPECTED +200,000 (phải ghi nhận chi refund)
  totalFundBalance +0      ❌ EXPECTED -200,000 (phải trừ tiền quỹ)
  cashbook chi     +0 entry ❌ EXPECTED +1 entry amount=200,000
  refund entries linked    +0 ❌ EXPECTED +1 (invoiceId=3937)
```

### Cross-check full cashbook history

Query `/billing/cashbook/list?page=1&limit=200` → 131 entries total, trong đó:
- **129 entries type=1** (thu từ bán hàng, đều có `invoiceId` link đơn IV1)
- **2 entries type=2** (chi) — **cả 2 đều là thao tác thủ công** (`invoiceId: null`):
  - `id=1561`: "Chi trả kem khách hàng ứng" 130,000đ
  - `id=1639`: "Chi thôi" 56,000đ

**KHÔNG CÓ entry cashbook chi nào** được tạo tự động khi return confirm — mặc dù đã có nhiều return invoices IV2 trong hệ thống (id 3905, 3909, 3919, 3937, ...).

### Scenario C — Consistency check (chu kỳ bán+trả khép kín)

Sau khi bán 200k rồi trả 200k, về mặt accounting, net delta phải = 0. Thực tế:

```
Net sau ban+tra:
  Fund balance   +200,000  ❌ Tiền quỹ bị phồng ảo (expected 0)
  Income         +200,000
  Expense        +0
  (Income-Expense) = +200,000  ❌ P/L lệch 200k (expected 0)
```

## Impact

| Stakeholder | Hậu quả |
|---|---|
| **Kế toán** | Không thấy khoản chi refund → không reconcile được với sổ quỹ thực tế |
| **Chủ cửa hàng** | Số dư quỹ trên dashboard cao hơn thực tế → quyết định tài chính sai |
| **Báo cáo thuế** | Doanh thu thuần (revenue - returns) không tính đúng |
| **Audit** | Sổ sách không cân, không có trail chi phí hoàn tiền |

## Action BE

### Fix chính: `return/confirm` handler phải tạo cashbook expense entry

Logic expected khi `POST /sales/invoice/return/confirm?id=X`:

```
1. Update invoice status IV2 → "done"
2. Restock inventory (đã làm ✓)
3. **NEW**: Insert cashbook entry:
   {
     type: 2,                    // chi
     amount: returnInvoice.fee,
     invoiceId: returnInvoice.id,
     categoryId: <refund_category_id>,  // hoặc tạo category "Hoàn tiền trả hàng"
     fundId: <same fund dùng lúc bán>,
     employeeId: currentUser.id,
     transDate: now,
     note: `Hoàn tiền trả hàng - HĐ #${returnInvoice.id} - ${customerName}`,
   }
4. **NEW**: Update fund balance: fund.balance -= returnInvoice.fee
5. Update totalExpense, totalFundBalance trong finance_dashboard aggregation
```

### Edge cases cần handle

1. **Return 1 phần**: cashbook chi = partial amount (không phải full invoice fee)
2. **Exchange** (đổi hàng): 
   - Nếu đơn mới đắt hơn → BE tạo cashbook thu cho chênh lệch (khách bù thêm)
   - Nếu đơn mới rẻ hơn → BE tạo cashbook chi cho chênh lệch (hoàn khách)
   - Nếu bằng nhau → không cần cashbook
3. **Refund method** (tiền mặt vs chuyển khoản): chọn đúng `fundId` theo payment method
4. **Idempotency**: nếu confirm gọi 2 lần, chỉ tạo 1 cashbook entry

## Re-test sau BE fix (2026-04-13) — ✅ 21/21 PASS

```bash
node tests/test-e2e-financial-flow.mjs
# Trước fix: 14/21 (6 fails: B-04, B-05, B-06, B-07, C-01, C-02)
# Sau fix:   21/21 — toàn bộ PASS strict
```

### Evidence sau fix

**Sau bán HD003947 (200,000đ):**
```
Finance dashboard: income=200000, expense=0, fundBalance=2746836904
Cashbook thu: count=1, sum=200000 — entry invoiceId=3947 ✓
```

**Sau trả toàn bộ (return invoice id=3949, referId=3947):**
```
Finance dashboard: income=200000, expense=200000, fundBalance=2746636904
Cashbook thu: count=1, sum=200000 (giữ nguyên)
Cashbook chi: count=1, sum=200000 — entry MỚI với invoiceId link return ✓
```

**Net chu kỳ bán+trả khép kín:**
```
Fund balance: 2,746,836,904 → 2,746,636,904 = ĐÚNG -200,000 (khớp amount refund)
Income:       +200,000
Expense:      +200,000
(Income - Expense) = 0  ✓  (P/L cân đối)
```

### Assertions chuyển từ FAIL → PASS

| # | Trước fix | Sau fix |
|---|---|---|
| B-04: Cashbook chi +1 entry | ❌ delta=0 | ✅ +1 |
| B-05: Cashbook chi sum +200k | ❌ delta=0 | ✅ +200,000 |
| B-06: Finance dashboard expense +200k | ❌ delta=0 | ✅ +200,000 |
| B-07: Fund balance -200k | ❌ delta=0 | ✅ -200,000 |
| C-01: Fund balance net chu kỳ = 0 | ❌ net=+200k ảo | ✅ net=0 |
| C-02: Income - Expense net = 0 | ❌ net=+200k | ✅ net=0 |
| C-04: Dashboard expense = Cashbook chi | ✅ (cả 2 = 0) | ✅ (cả 2 = 200k) |

Verify chi tiết:
```bash
# Check cashbook chi có entry mới invoiceId link return invoice
curl 'https://biz.reborn.vn/billing/cashbook/list?page=1&limit=50&type=2' \
  -H 'Authorization: Bearer <token>' -H 'Hostname: kcn.reborn.vn'
# Expected: có entry type=2, amount=200000, invoiceId=<returnInvoiceId>
```

## Files FE liên quan

- `src/services/ReturnInvoiceService.ts:76-79` — `confirmReturn` gọi `POST /sales/invoice/return/confirm?id=X`
- `src/pages/ReturnProduct/modals/ReturnDetailModal/index.tsx` — button "Xác nhận trả"
