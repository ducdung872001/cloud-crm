# BACKEND TASK — `/inventoryBalance/stockProduct/list` tra "N/A" cho productName, batchNo, expiryDate

**Discovered:** 2026-04-12 — chay E2E test + direct API debug capture
**Severity:** 🔴 HIGH — Trang "San pham ton kho" (`/product_inventory`) hien hau het row la "N/A" → vo dung
**Module:** `cloud-inventory-master` (hoac module nao chua handler `/inventoryBalance/stockProduct/list`)

---

## Mo ta bug

Khi mo trang `/product_inventory` ("San pham ton kho") tren CRM, FE goi:
```
GET https://biz.reborn.vn/inventory/inventoryBalance/stockProduct/list?keyword=&page=1
```

BE tra ve **HTTP 200** voi 10 items, nhung **moi item co `productName`, `batchNo`, `expiryDate` la literal string `"N/A"`** thay vi du lieu that.

Ket qua: UI hien thi cot "Ten san pham" toan bo dong la `"N/A"` → nguoi dung KHONG biet dong nao la SP nao → khong su dung duoc trang nay.

## Hard evidence — API response THUC TE (capture 2026-04-12 15:57)

```json
{
  "code": 0,
  "message": "OK",
  "result": {
    "items": [
      {
        "inventoryBalanceId": 33,
        "productId": 289,
        "variantId": 377,
        "warehouseId": 32,
        "productName": "N/A",          ← BUG: phai la ten that cua product 289
        "batchNo": "N/A",              ← BUG
        "expiryDate": "N/A",           ← BUG
        "unitName": "Cái",
        "quantity": 45,
        "warehouseName": "Kho hàng mẫu",
        "updatedTime": "2026-04-02T18:53:26"
      },
      {
        "inventoryBalanceId": 27,
        "productId": 284,
        "variantId": 368,
        "warehouseId": 32,
        "productName": "N/A",
        "batchNo": "N/A",
        "expiryDate": "N/A",
        "unitName": "Cái",
        "quantity": 230,
        "warehouseName": "Kho hàng mẫu",
        "updatedTime": "2026-04-02T15:17:13"
      }
      // ... 8 items khac, tat ca productName/batchNo/expiryDate deu = "N/A"
    ],
    "total": ...,
    "page": 1
  }
}
```

**Quan sat quan trong:**
- BE da co `productId`, `variantId`, `warehouseId` → hoan toan co the JOIN bang `product` / `product_variant` de lay ten that.
- Cac field khac (`unitName`, `warehouseName`, `quantity`) van tra dung → BE biet cach JOIN voi `unit` va `warehouse` table. Chi thieu JOIN voi `product` va `product_variant`.
- BE return literal string `"N/A"` chu khong phai `null` → co ve la **hardcoded fallback** trong code, chu khong phai DB null gay ra.

## Reproducer

### Cach 1 — Manual via UI

1. Login CRM voi tai khoan co quyen kho.
2. Vao menu **Hang hoa & Kho** → **San pham ton kho** (URL: `/product_inventory`).
3. Quan sat: cot "Ten san pham" gan nhu toan bo dong la "N/A".

### Cach 2 — Curl

```bash
curl -X GET "https://biz.reborn.vn/inventory/inventoryBalance/stockProduct/list?keyword=&page=1" \
  -H "Cookie: token=<your_token>" \
  -H "Hostname: <your_hostname>" \
  -H "Accept: application/json" | jq '.result.items[0]'
```
**Expected:** `productName: "Ten SP that"`
**Actual:** `productName: "N/A"`

## Root cause (suy doan dua tren response)

Handler `stockProduct/list` co the:
1. **Khong JOIN** voi bang `product` / `product_variant` → khong lookup duoc ten → mac dinh "N/A"
2. **Hardcode** `"N/A"` literal trong response builder thay vi `null` (anti-pattern)
3. **Try-catch swallow** lookup error → fallback "N/A"

## Action BE

### Fix chinh

Sua handler endpoint `GET /inventory/inventoryBalance/stockProduct/list` de JOIN va tra dung:

```sql
SELECT
  ib.id              AS inventoryBalanceId,
  ib.product_id      AS productId,
  ib.variant_id      AS variantId,
  ib.warehouse_id    AS warehouseId,
  p.name             AS productName,        -- ← THEM JOIN p
  pv.batch_no        AS batchNo,            -- ← THEM JOIN pv
  pv.expiry_date     AS expiryDate,         -- ← THEM JOIN pv
  u.name             AS unitName,
  ib.quantity,
  w.name             AS warehouseName,
  ib.updated_time    AS updatedTime
FROM inventory_balance ib
LEFT JOIN product         p  ON p.id  = ib.product_id
LEFT JOIN product_variant pv ON pv.id = ib.variant_id
LEFT JOIN unit            u  ON u.id  = pv.unit_id   -- hoac ib.unit_id, tuy schema
LEFT JOIN warehouse       w  ON w.id  = ib.warehouse_id
WHERE ib.bsn_id = :bsnId
ORDER BY ib.updated_time DESC
LIMIT :limit OFFSET :offset;
```

(Schema thuc te co the khac — pls adapt ten cot/bang.)

### Convention

- Khi field that su khong co (vd `batchNo` cho SP khong quan ly theo lo) → tra `null`, KHONG tra string `"N/A"`. FE da handle null/undefined.
- Loai bo moi hardcode `"N/A"` trong response builder.

### Tang cuong (optional)

Tham khao response cua endpoint anh `/inventoryBalance/variant/list` ([InventoryService.ts:144-152](src/services/InventoryService.ts#L144-L152)) — endpoint do tra schema rich hon: them `productCode`, `sku`, `variantLabel`, `baseUnitName`, `sellingUnitName`, `sellingPrice`, `avgCost`, `stockStatus`. Co the bo sung cac field nay vao `stockProduct/list` de UI hien tot hon.

## Re-test sau khi BE fix

### FE side check

Mo `/product_inventory` → cac dong hien ten SP that (vd "Quan au cong so cao cap"), khong phai "N/A".

### Curl re-test

```bash
curl -X GET "https://biz.reborn.vn/inventory/inventoryBalance/stockProduct/list?keyword=&page=1" \
  -H "Cookie: token=<your_token>" -H "Hostname: <your_hostname>" | jq '.result.items[0].productName'
```
**Expected:** `"Quan au cong so cao cap"` (hoac ten SP that)
**Khong phai:** `"N/A"`

### E2E re-test

```bash
node tests/test-e2e-product-import-pos.mjs
```
Buoc S3-01c sau khi nhap kho → phai tim thay SP test trong /product_inventory. Hien tai test S3-01c FAIL vi BE tra "N/A".

## Anh huong khac

API endpoint nay duoc su dung trong:
- [ProductInventoryList.tsx](src/pages/ProductImport/ProductInventoryList/ProductInventoryList.tsx) — Trang chinh "San pham ton kho"
- Co the duoc dung trong report khac → BE check by grep `inventoryBalance/stockProduct/list`.

## Files lien quan FE (chi tham khao, KHONG can sua)

- [src/services/WarehouseService.ts:27-29](src/services/WarehouseService.ts#L27-L29) — `WarehouseService.listInternal` goi endpoint nay
- [src/model/warehouse/WarehouseResponseModel.ts:18-25](src/model/warehouse/WarehouseResponseModel.ts#L18-L25) — interface `IWarehouseList` declare cac field FE expect
- [src/pages/ProductImport/ProductInventoryList/ProductInventoryList.tsx:149-157](src/pages/ProductImport/ProductInventoryList/ProductInventoryList.tsx#L149-L157) — `dataMappingArray` render cac field
