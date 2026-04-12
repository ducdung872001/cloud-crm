# Backend Task — Sprint Bug Fixes

**Ngay:** 2026-04-11
**Priority:** CRITICAL > HIGH > MEDIUM
**Assignee:** Backend team

---

## Muc luc

| # | Bug ID | Mo ta ngan | Priority |
|---|--------|-----------|----------|
| 1 | CRITICAL | POST /sales/invoice/create tra ve 404 | **CRITICAL** |
| 2 | C.1.4 | Chi tiet don hang thieu thong tin KH | HIGH |
| 3 | C.3.4 | Tao 2 phieu tra hang cho cung 1 don | HIGH |
| 4 | C.3.6 | Tra hang tra nham so tien goc thay vi gia sau giam | HIGH |
| 5 | C.3.8 | Sau tra hang khong cong ton kho | HIGH |
| 6 | D.1.4 | Nhan ban SP mat thong tin bien the | MEDIUM |
| 7 | D.4.2 | Ton kho POS chi hien khi nhap tu "Kho hang mau" | MEDIUM |
| 8 | D.4.3 | Tra hang / Doi hang khong cap nhat ton kho | HIGH |
| 9 | E.1.1 | Khong tim kiem duoc KH bang SDT va email | MEDIUM |

---

## 1. CRITICAL — POST /sales/invoice/create tra ve 404

**Priority:** CRITICAL
**API:** `POST /sales/invoice/create`

### Van de

Khi tao don hang moi, API tra ve 404 Not Found. Day la chuc nang core, block toan bo flow ban hang.

### Nguyen nhan can kiem tra

1. **Route registration** — Kiem tra route `/sales/invoice/create` da duoc dang ky chua trong router config
2. **Hostname routing middleware** — Kiem tra middleware xu ly hostname (vd: `kcn.reborn.vn`) co dang filter sai route khong
3. **Field deserialization** — Field `"account": "[]"` (string thay vi array) co the gay loi parse JSON truoc khi vao controller
4. **Enum validation** — `invoiceType: "IV1"` can duoc dinh nghia trong enum backend. Kiem tra bang enum hoac constant

### Logic can fix

```
1. Kiem tra route map: dam bao POST /sales/invoice/create ton tai
2. Kiem tra middleware order: hostname filter phai chay SAU route matching
3. Fix deserialization: account field nen accept ca "[]" (string) va [] (array)
4. Kiem tra InvoiceType enum co "IV1" khong, neu thieu thi them vao
```

### Curl verify

```bash
curl -X POST https://kcn.reborn.vn/api/sales/invoice/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "customerId": 1,
    "invoiceType": "IV1",
    "account": "[]",
    "items": [
      {
        "variantId": 1,
        "quantity": 1,
        "price": 100000,
        "discount": 0
      }
    ],
    "payments": [
      {
        "method": "CASH",
        "amount": 100000
      }
    ]
  }'

# Expected: 200 OK voi invoice data
# Actual: 404 Not Found
```

---

## 2. C.1.4 — Chi tiet don hang fix cung thong tin KH

**Priority:** HIGH
**API:** `GET /sales/invoice/{id}` hoac `GET /sales/orders/{id}/detail`

### Van de

Response chi tiet don hang thieu thong tin khach hang: so dien thoai, diem tich luy, hang thanh vien. FE khong hien thi duoc thong tin KH tren man hinh chi tiet don.

### Logic can fix

Them JOIN voi bang `customer` trong query lay chi tiet don hang:

```sql
SELECT
  i.*,
  c.phone AS customerPhone,
  c.loyalty_point AS loyaltyPoint,
  c.membership_tier AS membershipTier
FROM invoice i
LEFT JOIN customer c ON c.id = i.customer_id
WHERE i.id = :invoiceId
```

Them cac field vao response DTO:

```
- customerPhone: String
- loyaltyPoint: Integer (default 0)
- membershipTier: String (default null)
```

### Curl verify

```bash
curl -X GET https://kcn.reborn.vn/api/sales/invoice/{invoiceId} \
  -H "Authorization: Bearer {TOKEN}"

# Expected response nen co:
# "customerPhone": "0901234567",
# "loyaltyPoint": 150,
# "membershipTier": "SILVER"
```

---

## 3. C.3.4 — Tao 2 phieu tra hang cho cung 1 don

**Priority:** HIGH
**API:** `POST /sales/return`

### Van de

Co the tao nhieu phieu tra hang cho cung 1 don hang ma tong so luong tra vuot qua so luong da mua. Backend khong validate tong so luong da tra truoc do.

### Logic can fix

Truoc khi tao phieu tra moi, validate:

```sql
-- Lay tong SL da tra CONFIRMED cho tung invoice_item
SELECT
  ri.invoice_item_id,
  SUM(ri.quantity) AS total_returned
FROM return_item ri
JOIN return_order ro ON ro.id = ri.return_order_id
WHERE ri.invoice_item_id = :invoiceItemId
  AND ro.status = 'CONFIRMED'
GROUP BY ri.invoice_item_id
```

Validation logic:

```
for each item in request.items:
    totalReturned = query tong SL da tra (CONFIRMED) theo invoiceItemId
    originalQty = query SL da mua tu invoice_item
    if (totalReturned + item.quantity > originalQty):
        throw Error("So luong tra vuot qua so luong da mua. 
                      Da tra: {totalReturned}, Dang tra: {item.quantity}, 
                      Da mua: {originalQty}")
```

### Curl verify

```bash
# Buoc 1: Tra 1 phan
curl -X POST https://kcn.reborn.vn/api/sales/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "invoiceId": 1,
    "items": [{ "invoiceItemId": 10, "quantity": 2 }]
  }'
# Expected: 200 OK

# Buoc 2: Tra tiep vuot so luong da mua
curl -X POST https://kcn.reborn.vn/api/sales/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "invoiceId": 1,
    "items": [{ "invoiceItemId": 10, "quantity": 999 }]
  }'
# Expected: 400 Bad Request voi message "So luong tra vuot qua..."
```

---

## 4. C.3.6 — Tra hang tra nham so tien goc thay vi gia sau giam

**Priority:** HIGH
**API:** `POST /sales/return/confirm`

### Van de

Khi xac nhan tra hang, he thong tinh refund theo gia goc (originalPrice * qty) thay vi gia thuc te khach da tra (sau giam gia, voucher, etc). Khach duoc hoan nhieu hon so tien da tra.

### Logic can fix

**SAI:**
```
refundAmount = originalPrice * returnedQty
```

**DUNG:**
```
refundAmount = invoice.paidAmount * (returnedQty / totalQty)
```

Chi tiet:

```sql
-- Lay thong tin don hang goc
SELECT paid_amount, total_quantity FROM invoice WHERE id = :invoiceId

-- Tinh refund
refundAmount = (paidAmount / totalQty) * returnedQty
-- Lam tron xuong 0 dong le
refundAmount = FLOOR(refundAmount)
```

Luu y:
- `paidAmount` la so tien khach thuc tra (da tru giam gia, voucher)
- `totalQty` la tong SL tat ca item trong don
- Neu don co nhieu item voi gia khac nhau, tinh theo ty le `paidAmount` cua tung line item

### Curl verify

```bash
# Don hang: 3 SP, gia goc 300k, giam gia 10% -> paidAmount = 270k
# Tra 1 SP -> refund = 270000 * (1/3) = 90000

curl -X POST https://kcn.reborn.vn/api/sales/return/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{ "returnOrderId": 1 }'

# Expected: refundAmount = 90000 (KHONG PHAI 100000)
```

---

## 5. C.3.8 — Sau tra hang khong cong ton kho

**Priority:** HIGH
**Event:** `RETURN_CONFIRMED` -> `STOCK_IN`

### Van de

Sau khi xac nhan tra hang, ton kho khong duoc cong lai. San pham tra ve khong xuat hien trong kho.

### Logic can fix

Khi tra hang duoc confirm, phat Kafka event de cap nhat ton kho:

```java
// Trong ReturnOrderService.confirm()
after status = CONFIRMED:

KafkaEvent stockEvent = new KafkaEvent();
stockEvent.setEventType("STOCK_IN");
stockEvent.setRefType("RETURN");
stockEvent.setRefId(returnOrder.getId());
stockEvent.setWarehouseId(returnOrder.getWarehouseId()); // KHONG DUOC NULL
stockEvent.setItems(returnOrder.getItems().stream().map(item -> {
    StockItem si = new StockItem();
    si.setVariantId(item.getVariantId());
    si.setQuantity(item.getQuantity());
    return si;
}).collect(Collectors.toList()));

kafkaProducer.send("inventory.stock", stockEvent);
```

Kafka event format:

```json
{
  "eventType": "STOCK_IN",
  "refType": "RETURN",
  "refId": 123,
  "warehouseId": 1,
  "items": [
    { "variantId": 45, "quantity": 2 },
    { "variantId": 67, "quantity": 1 }
  ]
}
```

**Quan trong:**
- `warehouseId` KHONG duoc null. Neu return_order khong co warehouseId, lay tu invoice goc hoac dung default warehouse
- Consumer inventory service phai handle event `STOCK_IN` voi `refType = "RETURN"`

### Curl verify

```bash
# Buoc 1: Confirm tra hang
curl -X POST https://kcn.reborn.vn/api/sales/return/confirm \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{ "returnOrderId": 1 }'

# Buoc 2: Kiem tra ton kho cua variant da tra
curl -X GET "https://kcn.reborn.vn/api/inventory/stock?variantId=45&warehouseId=1" \
  -H "Authorization: Bearer {TOKEN}"

# Expected: quantity phai tang len sau khi tra hang
```

---

## 6. D.1.4 — Nhan ban SP mat thong tin bien the

**Priority:** MEDIUM
**API:** `POST /products/{id}/clone`

### Van de

Khi nhan ban (clone) san pham, cac bien the (variants) bi mat thong tin: gia ban, gia von, barcode, SKU, hinh anh, thuoc tinh.

### Logic can fix

Deep clone tat ca variant data:

```java
// Trong ProductService.clone()
Product cloned = new Product();
// ... copy product fields ...
cloned = productRepo.save(cloned);

for (Variant original : sourceProduct.getVariants()) {
    Variant clonedVariant = new Variant();
    clonedVariant.setProductId(cloned.getId());  // QUAN TRONG: dung cloned product id
    clonedVariant.setPrice(original.getPrice());
    clonedVariant.setCostPrice(original.getCostPrice());
    clonedVariant.setBarcode(null);  // hoac generate barcode moi
    clonedVariant.setSku(generateNewSku(original.getSku()));
    clonedVariant.setAttributes(deepCopy(original.getAttributes()));
    
    clonedVariant = variantRepo.save(clonedVariant);
    
    // Clone variant images
    for (VariantImage img : original.getImages()) {
        VariantImage clonedImg = new VariantImage();
        clonedImg.setVariantId(clonedVariant.getId());
        clonedImg.setImageUrl(img.getImageUrl());
        clonedImg.setSortOrder(img.getSortOrder());
        variantImageRepo.save(clonedImg);
    }
}
```

Checklist clone fields:

| Field | Clone | Ghi chu |
|-------|-------|---------|
| price | Co | Copy nguyen |
| costPrice | Co | Copy nguyen |
| barcode | Khong / Moi | Barcode phai unique, generate moi hoac de null |
| sku | Moi | Them suffix "-COPY" hoac generate moi |
| images | Co | Copy URL, tao record moi |
| attributes | Co | Deep copy JSON |
| productId | Moi | = cloned product id |

### Curl verify

```bash
# Clone san pham
curl -X POST https://kcn.reborn.vn/api/products/1/clone \
  -H "Authorization: Bearer {TOKEN}"

# Kiem tra san pham moi co du variant
curl -X GET https://kcn.reborn.vn/api/products/{clonedId} \
  -H "Authorization: Bearer {TOKEN}"

# Expected: variants[] phai co day du price, costPrice, sku, images, attributes
```

---

## 7. D.4.2 — Ton kho POS chi hien khi nhap tu "Kho hang mau"

**Priority:** MEDIUM
**API:** `GET /inventory/stock`

### Van de

Man hinh POS chi hien thi ton kho cua "Kho hang mau" (sample warehouse). Ton kho cua kho chinh (MAIN) khong duoc hien thi, dan den nhan vien ban hang tuong SP het hang.

### Logic can fix

Them filter warehouseId hoac warehouseType cho API:

```sql
-- Hien tai (sai): lay tat ca hoac chi lay kho mau
SELECT * FROM stock WHERE variant_id = :variantId

-- Can fix: filter theo warehouse type
SELECT s.variant_id, SUM(s.quantity) AS quantity
FROM stock s
JOIN warehouse w ON w.id = s.warehouse_id
WHERE s.variant_id IN (:variantIds)
  AND w.type = 'MAIN'           -- Chi lay kho chinh
  AND w.store_id = :storeId     -- Cua hang hien tai
GROUP BY s.variant_id
```

Them request param:

```
GET /inventory/stock?variantIds=1,2,3&warehouseType=MAIN
```

Hoac dung logic mac dinh: neu khong truyen warehouseId, tu dong lay kho MAIN cua store hien tai.

### Curl verify

```bash
# Lay ton kho voi filter MAIN warehouse
curl -X GET "https://kcn.reborn.vn/api/inventory/stock?variantIds=1,2,3&warehouseType=MAIN" \
  -H "Authorization: Bearer {TOKEN}"

# Expected: tra ve ton kho cua kho chinh, KHONG PHAI kho mau
```

---

## 8. D.4.3 — Tra hang / Doi hang khong cap nhat ton kho

**Priority:** HIGH
**Event:** `RETURN_CONFIRMED` / `EXCHANGE_CONFIRMED`

### Van de

Khi tra hang hoac doi hang duoc xac nhan, ton kho khong duoc cap nhat. San pham tra lai khong cong vao kho, san pham doi khong tru kho.

### Logic can fix

#### Tra hang (RETURN):

```java
@Transactional
public void confirmReturn(ReturnOrder returnOrder) {
    // ... update status ...
    
    // STOCK_IN: cong lai ton kho cho SP tra
    for (ReturnItem item : returnOrder.getItems()) {
        inventoryService.stockIn(
            returnOrder.getWarehouseId(),  // KHONG DUOC NULL
            item.getVariantId(),
            item.getQuantity(),
            "RETURN",
            returnOrder.getId()
        );
    }
}
```

#### Doi hang (EXCHANGE):

```java
@Transactional
public void confirmExchange(ExchangeOrder exchangeOrder) {
    // ... update status ...
    
    // STOCK_IN: cong lai SP khach tra
    for (ExchangeReturnItem item : exchangeOrder.getReturnItems()) {
        inventoryService.stockIn(
            exchangeOrder.getWarehouseId(),
            item.getVariantId(),
            item.getQuantity(),
            "EXCHANGE_IN",
            exchangeOrder.getId()
        );
    }
    
    // STOCK_OUT: tru SP khach nhan moi
    for (ExchangeNewItem item : exchangeOrder.getNewItems()) {
        inventoryService.stockOut(
            exchangeOrder.getWarehouseId(),
            item.getVariantId(),
            item.getQuantity(),
            "EXCHANGE_OUT",
            exchangeOrder.getId()
        );
    }
}
```

**Quan trong:**
- Dung `@Transactional` (atomic): neu STOCK_IN thanh cong ma STOCK_OUT fail thi rollback het
- `warehouseId` KHONG DUOC null — lay tu don hang goc neu khong co
- Ghi log inventory_transaction cho moi thay doi

### Curl verify

```bash
# Buoc 1: Confirm tra hang
curl -X POST https://kcn.reborn.vn/api/sales/return/confirm \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{ "returnOrderId": 1 }'

# Buoc 2: Confirm doi hang
curl -X POST https://kcn.reborn.vn/api/sales/exchange/confirm \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{ "exchangeOrderId": 1 }'

# Buoc 3: Kiem tra ton kho
curl -X GET "https://kcn.reborn.vn/api/inventory/stock?variantId=45" \
  -H "Authorization: Bearer {TOKEN}"

# Expected: ton kho thay doi tuong ung voi SL tra/doi
```

---

## 9. E.1.1 — Khong tim kiem duoc KH bang SDT va email

**Priority:** MEDIUM
**API:** `GET /customers?keyword=...`

### Van de

Tim kiem khach hang chi hoat dong voi ten (name). Khong tim duoc khi nhap so dien thoai hoac email.

### Logic can fix

Sua WHERE clause trong query:

```sql
-- Hien tai (sai):
WHERE LOWER(name) LIKE LOWER(:keyword)

-- Can fix:
WHERE LOWER(name) LIKE LOWER(:keyword)
   OR phone LIKE :keyword
   OR LOWER(email) LIKE LOWER(:keyword)
```

jOOQ:

```java
String kw = "%" + keyword.toLowerCase() + "%";

Condition searchCondition = DSL.or(
    CUSTOMER.NAME.lower().like(kw),
    CUSTOMER.PHONE.like("%" + keyword + "%"),
    CUSTOMER.EMAIL.lower().like(kw)
);

// Them vao query
selectFrom(CUSTOMER)
    .where(searchCondition)
    .orderBy(CUSTOMER.CREATED_AT.desc())
    .limit(pageSize)
    .offset(offset);
```

Luu y:
- Phone khong can `lower()` vi chi chua so
- Email can `lower()` vi co the luu HOA/thuong khac nhau
- Dam bao co index tren `phone` va `email` de khong cham query

```sql
-- Kiem tra index
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer(phone);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
```

### Curl verify

```bash
# Tim bang SDT
curl -X GET "https://kcn.reborn.vn/api/customers?keyword=0901234567" \
  -H "Authorization: Bearer {TOKEN}"

# Tim bang email
curl -X GET "https://kcn.reborn.vn/api/customers?keyword=test@gmail.com" \
  -H "Authorization: Bearer {TOKEN}"

# Expected: tra ve khach hang co SDT/email tuong ung
```

---

## Tom tat thu tu uu tien

### CRITICAL (fix ngay)
1. POST /sales/invoice/create tra ve 404 — Block toan bo flow ban hang

### HIGH (fix trong sprint)
2. C.3.8 + D.4.3 — Tra/doi hang khong cap nhat ton kho (2 bug lien quan, fix cung luc)
3. C.3.4 — Validate so luong tra hang
4. C.3.6 — Tinh sai refund amount
5. C.1.4 — Thieu thong tin KH trong chi tiet don

### MEDIUM (fix khi co the)
6. D.1.4 — Clone SP mat variant data
7. D.4.2 — POS hien sai ton kho
8. E.1.1 — Tim kiem KH bang SDT/email

---

## Ghi chu chung

- Moi fix can co unit test tuong ung
- Test tren staging truoc khi deploy production
- Cac bug lien quan ton kho (C.3.8, D.4.3) nen fix va test cung nhau
- Dam bao backward compatible: khong thay doi response structure, chi THEM field moi
