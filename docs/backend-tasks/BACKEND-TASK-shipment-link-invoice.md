# BACKEND TASK — `/logistics/shipment/create` không link shipment với invoice

**Discovered:** 2026-04-13 — E2E test `test-e2e-shipping-flow.mjs` (S2-02, S2-05)
**Severity:** 🔴 **CRITICAL** — Shipment cô lập, không trace được đơn hàng gốc → không audit, không reverse khi fail
**Module:** `cloud-logistics-master`
**Endpoint:** `POST /logistics/shipment/create`

---

## Mô tả bug

### Bug 1 (CRITICAL): `internalOrderId` không được map vào `orderId` / `orderCode`

FE gửi body:
```json
{
  "internalOrderId": "HD003983",
  "carrierCode": "GHN",
  "sender": {...},
  "receiver": {...},
  ...
}
```

BE response:
```json
{
  "code": 0,
  "result": {
    "id": 1024,
    "shipmentOrder": "9p0YkAIxsoV",
    "carrierCode": "GHN",
    "carrierTrackingCode": "LHLH3P",
    "orderId": null,          ← ❌ PHẢI populate từ internalOrderId lookup
    "orderCode": null,        ← ❌
    "internalOrderId": undefined  ← ❌ không echo back
  }
}
```

→ Shipment được tạo và push lên GHN (có `carrierTrackingCode`) nhưng **không liên kết về invoice gốc** trong DB.

### Bug 2: `shippingFee` request không được persist

FE gửi `shippingFeeBearer: "RECEIVER"` ngầm ý receiver trả phí, và trong `declaredValue` bao gồm cả phí. Nhưng response:
```json
{
  "shippingFee": 0,     ← FE expected 15000 (fee đã suggest từ /fee-config)
  "carrierFee": null    ← có thể BE đang đợi tính từ GHN
}
```

Không rõ logic: `shippingFee` là FE-provided (phí FE charge khách) hay BE-computed (sau khi gọi GHN)?

## Hard evidence (E2E 2026-04-13)

### Setup
- Invoice HD003983 đã tạo với `fee = 215,000` (200k SP + 15k phí ship từ `/fee-config/suggest`)
- POST shipment/create với `internalOrderId: "HD003983"`

### Response
```
Created shipment: id=1024, shipmentOrder=9p0YkAIxsoV
Link fields: orderId=null, orderCode=null, internalOrderId=undefined
```

### Cross-check existing shipments trong DB
```bash
GET /logistics/shipment/list?limit=3
```
Sample record cũ:
```json
{
  "id": 1020,
  "shipmentOrder": "85xUZZUo0JZ",
  "orderId": null,       ← cùng vấn đề — không chỉ mới
  "orderCode": null,
  "carrierCode": "GHN",
  "carrierTrackingCode": "LHQ8XH"
}
```

→ **Bug tồn tại từ trước**, ảnh hưởng tất cả shipment trong DB hiện tại. Không có shipment nào đang link đúng về invoice.

## Impact

| Stakeholder | Hậu quả |
|---|---|
| **Cashier / POS user** | Không biết đơn đã tạo shipment hay chưa khi xem invoice detail |
| **Shipping operator** | Không biết shipment thuộc đơn bán nào → không thể báo KH, không biết SP gì |
| **Kế toán** | Khi shipment failed, không tra được invoice gốc để tạo return → phải thao tác thủ công tra chéo |
| **Báo cáo** | Không join được shipment với invoice để tính "doanh thu thực thu sau giao hàng" |
| **Audit** | Không có trail: Invoice → Shipment → Delivery status |

### Luồng nghiệp vụ bị block

1. POS tạo đơn ship → tạo shipment → **shipment không link về đơn**
2. Shipment failed → user mở shipment detail nhưng không có nút "xem đơn gốc" → phải copy tracking code search
3. User muốn tạo return invoice → không biết đơn nào → tra cứu thủ công qua ngày/khách

## Action BE

### Fix 1: Map `internalOrderId` → `orderCode` (+ lookup `orderId`)

Trong handler `POST /logistics/shipment/create`:

```java
// pseudo
String internalOrderId = request.getInternalOrderId();  // = invoice.invoiceCode
if (internalOrderId != null && !internalOrderId.isEmpty()) {
    // Option A: Lookup invoice via sales service
    Invoice invoice = salesClient.findByCode(internalOrderId);
    if (invoice != null) {
        shipment.setOrderId(invoice.getId());
        shipment.setOrderCode(invoice.getInvoiceCode());
    }
    // Option B: Lưu luôn internalOrderId nếu không lookup được
    shipment.setInternalOrderId(internalOrderId);  // expose back trong response
}
```

### Fix 2: Response echo đầy đủ các field link

DTO `ShipmentResponse` phải bao gồm:
- `orderId: Long`
- `orderCode: String`
- `internalOrderId: String` (echo lại)

### Fix 3: Clarify `shippingFee` semantic

Quy định rõ:
- `shippingFee`: phí FE charge khách (từ `/fee-config/suggest`) — **phải persist từ request**
- `carrierFee`: phí thực hãng vận chuyển tính (sau khi push sang GHN) — BE populate từ GHN response
- `platformShippingDiscountAmount`, `bsnShippingDiscountAmount`: giảm giá platform/store

Nếu hiện tại BE chỉ có 1 field `shippingFee` thì cần đồng bộ: FE-provided value phải được lưu, không ghi đè 0.

### Fix 4: Migration cho data cũ (optional)

Với ~44+ shipment hiện có `orderId: null`: có thể có script migration để lookup lại via sender info / tracking code match với invoice hiện tại, hoặc chấp nhận lost data cho shipment cũ và chỉ fix cho new records.

## Bug phụ FE (liên quan) — POS auto-create sai body shape

File: [src/pages/CounterSales/index.tsx:368-388](src/pages/CounterSales/index.tsx#L368-L388)

```javascript
// Current (WRONG): flat body
await fetch(urlsApi.shipping.create, {
  method: "POST",
  body: JSON.stringify({
    orderId: invoiceId,
    orderCode: String(invoiceId),
    receiverName, receiverPhone, receiverAddress,
    shippingFee, codAmount, ...
  }),
});
```

BE expect NESTED body (sender/receiver/parcel). FE cần refactor theo shape trong `IShipmentCreatePayload`:
```javascript
{
  internalOrderId: invoiceCode,
  carrierCode: "GHN",
  sender: { name, phone, address, ward, district, province },
  receiver: { name, phone, address, ward, district, province },
  parcel: { weightGram, lengthCm, widthCm, heightCm },
  codAmount, declaredValue, shippingFeeBearer,
  items: [...], note, status: "SUBMITTED"
}
```

Hiện tại POS auto-create đang fail silently qua try/catch — user không bao giờ thấy lỗi nhưng shipment cũng không tạo.

## Re-test

```bash
node tests/test-e2e-shipping-flow.mjs
# Hiện tại: 31/33 PASS (S2-02, S2-05 fail do bug)
# Sau BE fix: 33/33
```

Verify cụ thể:
```bash
# 1. Tạo invoice HD003999
# 2. POST shipment/create với internalOrderId="HD003999"
# 3. Expected response:
curl 'https://biz.reborn.vn/logistics/shipment/create' -X POST \
  -H 'Authorization: Bearer <token>' -H 'Hostname: kcn.reborn.vn' \
  -d '{"internalOrderId":"HD003999","carrierCode":"GHN",...}'
# → result.orderCode == "HD003999" (hoặc orderId != null)
# → result.shippingFee == fee FE gửi
```

## Files liên quan

- **FE gọi**: `src/pages/CounterSales/index.tsx:368-388` (POS auto-create, đang sai shape)
- **FE gọi**: `src/pages/ShipingManagement/AddShippingOrder/AddShippingOrder.tsx:611` (form manual, shape đúng)
- **FE service**: `src/services/ShippingService.ts:24-26` — `create()`
- **DTO**: `src/model/shipping/ShippingRequestModel.ts:31-50` — `IShippingOrderCreateRequest` (cũ, FLAT)
- **DTO mới**: `IShipmentCreatePayload` trong `AddShippingOrder.tsx` (NESTED, đúng shape BE)
