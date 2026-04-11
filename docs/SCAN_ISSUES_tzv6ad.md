# Ket qua Auto Scan — 2026-04-11

**Run ID:** tzv6ad
**Pass:** 7 | **Fail:** 2 | **Total:** 9

---

## Cac trang co loi

| # | Trang | Route | Loai loi | Chi tiet |
|---|-------|-------|----------|----------|
| 1 | Dashboard TC | `/finance_management/dashboard` | API_ERROR | GET https://biz.reborn.vn/billing/finance/chart → 500 |
| 2 | Dashboard TC | `/finance_management/dashboard` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 500 (Internal Server Error) |
| 3 | Dashboard TC | `/finance_management/dashboard` | CONSOLE_ERROR | [Dashboard] TypeError: Cannot read properties of undefined (reading 'totalFundBalance')
    at http://localhost:4000/crm/src/pages/Finance/Dashboard/index.tsx:61:32 |
| 4 | Hoa don VAT | `/invoiceVAT` | API_ERROR | GET https://biz.reborn.vn/integration/sinvoice/query/usage-status → 500 |
| 5 | Hoa don VAT | `/invoiceVAT` | CONSOLE_ERROR | Failed to load resource: the server responded with a status of 500 (Internal Server Error) |

---

## Phan loai loi

### API_ERROR (2 loi)

- **Dashboard TC** (`/finance_management/dashboard`): GET https://biz.reborn.vn/billing/finance/chart → 500
- **Hoa don VAT** (`/invoiceVAT`): GET https://biz.reborn.vn/integration/sinvoice/query/usage-status → 500

### CONSOLE_ERROR (3 loi)

- **Dashboard TC** (`/finance_management/dashboard`): Failed to load resource: the server responded with a status of 500 (Internal Server Error)
- **Dashboard TC** (`/finance_management/dashboard`): [Dashboard] TypeError: Cannot read properties of undefined (reading 'totalFundBalance')
    at http://localhost:4000/crm/src/pages/Finance/Dashboard/index.tsx:61:32
- **Hoa don VAT** (`/invoiceVAT`): Failed to load resource: the server responded with a status of 500 (Internal Server Error)

