# Seed spec — `billing` service (TNPM)

## Datasets (6 master)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_DEBTS` | snapshot L405–475 | ~10 | `debt` |
| 2 | `MOCK_DEBT_TRANSACTIONS` | snapshot L477–519 | ~7 | `debt_payment` |
| 3 | `MOCK_PAYMENTS` | snapshot L202–206 | 3 | `cashbook` (entry kind=in) |
| 4 | `MOCK_PAYMENT_METHODS` | snapshot L521–562 | ~6 | `payment_method` config |
| 5 | `MOCK_PROJECT_FINANCIALS` | snapshot L843–935 | ~6 | P&L view — có thể không seed, BE compute từ invoice + cashbook |
| 6 | `MOCK_FUNDS` | snapshot L1649–end | 4 | `fund` |

## Shape tóm tắt

**Debts** — công nợ phải trả/phải thu. Fields: `kind (payable/receivable), counterpartyType (vendor/customer), counterpartyId, refCode, projectId, originalAmount, amount, dueDate, status (current/upcoming/overdue), note`.

**Debt transactions** — giao dịch ghi nhận thanh toán/đối trừ công nợ.

**Payments (3 mẫu)** — phiếu thu/chi: `invoiceId, method (bank_transfer/cash), channel (MSB Pay/Vietcombank), txnRef, paidAt, amount, note`.

**Payment methods (~6)** — cấu hình các phương thức thanh toán có thể chọn khi thu phí (Tiền mặt, Chuyển khoản, MSB, VNPay…).

**Project financials (~6)** — P&L per-project, có thể KHÔNG cần seed (BE compute realtime từ invoice + cashbook + expense). Confirm với BE.

**Funds (4 mẫu)** — quỹ tiền/tài khoản ngân hàng: TK MSB chính, Quỹ tiền mặt VP, TK Vietcombank dự án Goldmark, TK BIDV dự án Vinhomes.

## Schema notes

- `billing` service base path `/billing/*`.
- Quan trọng: cashbook entry phát sinh khi (a) cư dân thanh toán invoice → in-entry, (b) vendor invoice approved → out-entry.
- Multi-tenant `bsn_id`.

## Cross-service deps

- `debt.counterpartyId (vendor)` → customer
- `debt.counterpartyId (customer)` → customer
- `debt.refCode` ↔ invoice (sales)
- `payment.invoiceId` → sales
- `payment_method` standalone
- `fund` standalone (chỉ ref project nếu fund dedicated cho project)

→ Dispatch SAU sales (vì debt + payment ref invoice).

## Ready-to-dispatch body

```
service=billing
slug=seed-debts-payments-tnpm
goal="Seed công nợ + cashbook + funds + payment methods cho tenant <tnpm-tenant>"
scope="6 dataset (~40 records). Yêu cầu sales + customer đã seed."
```
