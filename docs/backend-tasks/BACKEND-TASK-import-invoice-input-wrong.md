# BACKEND TASK — Cai thien error response cua endpoint phieu nhap kho

**Discovered:** 2026-04-12 — chay E2E test `tests/test-e2e-product-import-pos.mjs`
**Severity:** 🟡 MEDIUM (khong block flow nua sau khi FE da fix)
**Reproducer:** Playwright E2E

---

## Boi canh

Trong qua trinh chay E2E test luong "Tao SP → Nhap kho → Ban POS", phat hien endpoint `POST https://biz.reborn.vn/inventory/invoice/import/update` tra ve loi:

```
HTTP 400
Body: {"error":"Input wrong"}
```

**Nguyen nhan goc** (da fix FE-side 2026-04-12): `PaymentImportInvoices.tsx` gui sai format `receiptDate` do dung token date-fns sai (`"yyyy-MM-EEEEEETHH:mm:ss"` → ra string `"2026-04-TT08:30:45"` invalid). FE da sua thanh `"yyyy-MM-dd'T'HH:mm:ss"`. Bug pattern nay lan rong 13 file FE va da fix het.

→ Sau fix FE, request body gui dung format. Nhung BE van co 2 van de cua **error response design** can dev BE cai thien de tranh debug toi tuong lai:

---

## Cac van de BE can fix

### 1. Error message generic + thieu thong tin (CRITICAL — cho debug)

BE tra ve `{"error": "Input wrong"}` — khong cho biet:
- Field nao sai
- Ly do gi (format / required / out of range / ...)
- Stack trace location

**Hau qua:** FE va user khong the hieu can sua gi. Dev mat thoi gian doan. Su co kieu nay chi phat hien duoc khi co Playwright E2E + capture network — neu chay tay user chi thay "Input wrong" → bo cuoc.

**Action:** Tra ve structured error theo convention chung cua he thong:
```json
{
  "code": 1,
  "message": "Truong 'receiptDate' khong hop le. Format phai la ISO-8601 (yyyy-MM-dd'T'HH:mm:ss).",
  "field": "receiptDate"
}
```
Hoac neu nhieu loi:
```json
{
  "code": 1,
  "message": "Du lieu khong hop le",
  "errors": [
    { "field": "receiptDate", "message": "Format khong hop le" },
    { "field": "inventoryId", "message": "Khong tim thay kho" }
  ]
}
```

### 2. Convention `error` vs `message` khong nhat quan (MEDIUM)

BE hien dung key `error` cho field error message. Cac endpoint khac trong he thong dung `message` (dua tren `{code, result, message}` convention). FE co handler tu doc ca 2 (`response.message ?? response.error`) nhung do la workaround.

**Action:** Chuan hoa toan bo BE response theo 1 schema:
```ts
type ApiResponse<T> = {
  code: number;       // 0 = success, ≠0 = error
  message?: string;   // Vietnamese, user-facing
  result?: T;         // payload khi success
  errors?: { field: string; message: string }[];  // chi tiet validation
}
```

Hien tai van de nay da ghi nhan o **TD-INV-007** trong [TECH_DEBT_INVENTORY.md](../TECH_DEBT_INVENTORY.md#td-inv-007). File nay duplicate de nhan manh impact tu E2E test.

### 3. (Optional) Validate schema input voi `@Valid` / `@RequestBody` annotation

Neu BE dung Spring/Vert.x, them annotation validate dau vao se tu sinh structured error response thay vi catch generic "Input wrong":
- Spring: `@Valid` + `@NotNull` / `@Pattern` annotations + `@ExceptionHandler(MethodArgumentNotValidException)`
- Vert.x: schema validator middleware

---

## Re-test sau khi BE cai thien

Goi endpoint voi body sai cu phap (vd thieu `inventoryId`):
```bash
curl -X POST https://biz.reborn.vn/inventory/invoice/import/update \
  -H "Content-Type: application/json" \
  -d '{"invoiceType": "IV4", "receiptDate": "2026-04-12T08:30:45"}'
```
**Expected** sau fix:
```json
{
  "code": 1,
  "message": "Thieu truong bat buoc 'inventoryId'",
  "errors": [{ "field": "inventoryId", "message": "Bat buoc" }]
}
```

---

## Ghi chu

- FE bug `"yyyy-MM-EEEEEETHH:mm:ss"` da fix toan bo 13 file (2026-04-12). Pattern bug nay lan rong khap codebase, anh huong: nhap kho, AddProductImport, Warranty, Ticket, Setting, Loyalty program, Customer revenue (NetDeposit/Loan/ServiceCharge), XmlAddCustomer. Mot so flow co the da silent-fail tu lau ma user chua phat hien.
- Endpoint URL `https://biz.reborn.vn/inventory/invoice/import/update` (production host) — moi truong dev pass through.
