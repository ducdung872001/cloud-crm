# BACKEND TASK — Phieu nhap kho: error response + stock ledger khong duoc tao

**Discovered:** 2026-04-12 — chay E2E test `tests/test-e2e-product-import-pos.mjs`
**Severity:** 🔴 **CRITICAL** — issue #3 block toan bo flow ban hang
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

### 3. 🔴 CRITICAL — Approve phieu nhap KHONG cap nhat ton kho

Endpoint `POST /inventory/invoice/import/approve?invoiceId=X` tra ve **HTTP 200, code:0, result:1** (success), nhung **KHONG tao stock ledger entry** va **KHONG tang ton kho**.

**Hard evidence (E2E test 2026-04-12):**
1. Tao SP moi (invoice id 3417) → Tao phieu nhap → Them SP qty=10 → Approve.
2. API approve tra:
   ```
   POST https://biz.reborn.vn/inventory/invoice/import/approve?invoiceId=3417
   HTTP 200
   Body: {"code":0,"message":"OK","result":1}
   ```
3. Phieu hien thi trong `/inventory_checking?tab=import` → tab "Hoan thanh" ✓
4. **Nhung trong `/inventory` (So kho) → tab "Nhap kho" → KHONG co ledger entry moi.** Top 5 ledger rows:
   ```
   1. #3408 | 09/04/2026 10:50 | +100 | Quan au cong so cap...     ← 3 ngay truoc, KHONG phai cua minh
   2. #3407 | 07/04/2026 16:41 | +500 | Bat an com...
   3. #3385 | 07/04/2026 16:35 | +400 | Bat an com...
   ```
   Khong co entry nao tu hom nay (12/04/2026) cho SP "E2E SP ia0q5".
5. **`/product_inventory` (Ton kho)** cung khong co SP nay (rows hien thi N/A name, khong khop SP test).
6. **POS `/create_sale_add`** khong tim thay SP (grid empty cho query SP nay).

**Hau qua:** Nguoi dung tao phieu nhap thanh cong, system bao "Da hoan thanh" nhung **ton kho khong tang**, **khong ban duoc** SP do tai POS. Toan bo flow nhap-ban kho doan duoi gay loi am tham.

**Action BE:**
1. Trace flow `POST /invoice/import/approve` trong `cloud-inventory-master` (hoac `cloud-sales-master` neu approve handler o do).
2. Verify rang sau khi approve, BE PHAI:
   - Insert ban ghi `inventory_transaction` voi type=STOCK_IN, refType=IMPORT, refId=invoiceId
   - Update `inventory_balance.quantity += imported_qty` cho (variantId, warehouseId)
   - Publish event `STOCK_CHANGED` neu co Kafka downstream
3. Verify `warehouseId` (= `inventoryId` cua phieu) duoc truyen dung. Pattern bug "warehouseId is null" da gap o module truoc.
4. Kiem tra co exception bi swallow trong service layer khong (try-catch tra success that 0 du processing fail).
5. Co the lien quan: variant moi tao co `unitId` null/missing → BE STOCK_IN insert fail validation foreign key → catch silently → tra code:0 nhung khong commit transaction.

**Reproducer SQL** (sau khi BE chay):
```sql
-- Sau approve invoice 3417, check ledger:
SELECT * FROM inventory_transaction WHERE ref_type='IMPORT' AND ref_id=3417;
-- Expected: 1 row, type=STOCK_IN, qty=10
-- Actual: 0 rows (bug)

-- Va inventory_balance:
SELECT * FROM inventory_balance WHERE variant_id=<variant_of_E2E_SP> AND warehouse_id=<Kho_hang_mau_id>;
-- Expected: quantity=10
-- Actual: row khong ton tai hoac quantity=0
```

### 4. (Optional) Validate schema input voi `@Valid` / `@RequestBody` annotation

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

## UI observation co the lien quan (chua confirm)

Khi mo modal "Them san pham" trong /create_inventory va chon variant cua SP moi tao, **field "Don vi tinh" tren UI khong hien thi noi dung gi** (label co the visible nhung dropdown trong rong / khong show value). Field nay duoc dinh nghia trong [AddProductImportModal.tsx:359-380](src/pages/ProductImport/CreateReceipt/partials/AddProductImportModal/AddProductImportModal.tsx#L359-L380):
```jsx
options={
  selectedVariant
    ? [{ value: selectedVariant.unitId, label: selectedVariant.unitName }]
    : []
}
value={formData?.values?.unitId ?? null}
```
Render `disabled=true` voi value tu `selectedVariant.unitId`.

**Hypothesis:** BE endpoint `GET /inventory/variant/list?productId=X` (hoac tuong tu) tra ve variant ma `baseUnit=null` va `unitId=null` cho variant cua SP moi tao → FE fallback `v.baseUnit ?? v.unitId ?? 0` → unitId = 0 → SelectCustom render empty → ma sau do approve invoice se fail tao stock_in transaction vi `variant.unit_id` null trong DB.

**Action BE de confirm:**
1. Truy van DB: `SELECT id, unit_id, base_unit FROM product_variant WHERE product_id = <id_SP_moi_tao>`. Co null khong?
2. Neu co: BE save product (`POST /inventory/product/update`) phai persist `variants[].unitId` (FE da gui dung field nay theo `body.variants[].unitId` trong [AddProductPage.tsx:927](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx#L927) — em da xac nhan FE gui).
