# Seed spec — `sales` service (TNPM)

## Datasets (4 master)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_INVOICES` | snapshot L154–159 | 5 | `invoice` |
| 2 | `MOCK_VENDOR_INVOICES` | snapshot L177–181 | 3 | `invoice` (type=vendor) hoặc `vendor_invoice` riêng |
| 3 | `MOCK_TURNOVER_REPORTS` | snapshot L197–200 | 2 | mới? (BE confirm — có thể `invoice` extension hoặc bảng `turnover_report`) |
| 4 | `MOCK_B2G_PAYMENTS` | snapshot L970–1046 | ~5 | `invoice` type=b2g hoặc bảng riêng |

## Shape tóm tắt

**Invoices (5 mẫu)** — kỳ phí cư dân/khách thuê. Line items array (phí thuê + phí quản lý + điện + nước + parking + phí khác). Status: paid/pending/overdue. Cross-ref `contractId`.

**Vendor invoices (3 mẫu)** — hoá đơn NCC nộp, có 3-way match (`matchPO, matchAcceptance`) + 4-step approval (`approvalStatus: pending/approved`). Workflow chạy qua `bpm`. Cross-ref `vendorId, vendorContractId`.

**Turnover reports (2 mẫu)** — báo cáo doanh thu retail tenant để tính phí thuê % (turnoverRentRate). Cross-ref `contractId`. Status: submitted/pending/verified.

**B2G payments (~5)** — đề nghị thanh toán dự án hành chính. Workflow qua nhiều cấp trước khi chi kho bạc.

## Schema notes

- `sales` service base path `/sales/invoice/*`.
- Vendor invoice workflow approval delegate sang `bpm` (4-step). FE chỉ submit + query status.
- Multi-tenant `bsn_id`.

## Cross-service deps

- `invoice.contractId` → contract
- `invoice.customerId` → customer
- `vendor_invoice.vendorId/vendorContractId` → customer + contract
- `turnover_report.contractId` → contract
- `B2G_payment.budgetId` → contract.B2G_budget

→ Dispatch SAU contract.

## Ready-to-dispatch body

```
service=sales
slug=seed-invoices-tnpm
goal="Seed invoices (cư dân + vendor + turnover + B2G) cho tenant <tnpm-tenant>"
scope="4 dataset (~15 records). Yêu cầu contract + customer đã seed."
```
