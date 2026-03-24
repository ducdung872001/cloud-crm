# Inventory Kafka Message Spec

## Mục tiêu

Tài liệu này mô tả message Kafka "đủ dữ liệu nhất" để service kho có thể nhận tin và điều chỉnh tồn kho an toàn, nhất quán, và mở rộng được cho toàn bộ các nghiệp vụ:

- `IMPORT`
- `SALE`
- `RETURN`
- `TRANSFER`
- `ADJUSTMENT`
- `DESTROY`

Tài liệu phân biệt rõ:

- `Schema khuyến nghị`: schema nên dùng để cover đủ 6 case
- `Trạng thái hiện tại của code`: những gì `cloud-inventory-new` đang consume/apply được ngay

## Điều kiện để kho cập nhật được

Để service kho nhận message và cập nhật dữ liệu, cần đồng thời thỏa các điều kiện sau:

1. Message được publish vào đúng topic mà consumer đang lắng nghe.
2. Consumer Kafka đang được bật.
3. `eventType` nằm trong nhóm event mà processor đang hỗ trợ.
4. Payload có đủ các field bắt buộc cho từng line tồn kho.
5. Dữ liệu line hợp lệ về mặt nghiệp vụ:
   - `productId > 0`
   - `warehouseId > 0` hoặc đủ cặp `fromWarehouseId/toWarehouseId` cho chuyển kho
   - `unitId > 0`
   - `variantId` đúng với sản phẩm nếu đang chạy theo tồn kho biến thể
   - `quantity != 0`

## Topic

### Ưu tiên resolve topic của publisher

Publisher hiện resolve theo thứ tự:

1. `app.inventory.kafka.topic`
2. `spring.kafka.topics.inventory-events`
3. `spring.kafka.topics.order-events`
4. `app.order.kafka.topic`
5. default: `inventory-transaction-events`

### Topic mặc định của consumer

Consumer hiện lắng nghe:

- `app.inventory.kafka.consumer.topic`
- default: `inventory-transaction-events`

### Khuyến nghị cấu hình

Nên cấu hình đồng nhất:

```properties
app.inventory.kafka.topic=inventory-transaction-events
app.inventory.kafka.consumer.topic=inventory-transaction-events
app.inventory.kafka.consumer.enabled=true
```

## Trạng thái hiện tại của code

Hiện tại `cloud-inventory-new` đang chạy theo hướng `consumer-only`:

- service kho nhận message từ Kafka
- tự consume và apply tồn kho
- không phụ thuộc producer nội bộ để vận hành các case Kafka

Các event type đang được processor support:

- `INVENTORY_IMPORT_APPROVED`
- `INVENTORY_IMPORT_CANCELLED`
- `INVENTORY_SALE_DONE`
- `INVENTORY_SALE_CANCELLED`
- `INVENTORY_SALE_APPROVED`
- `INVENTORY_RETURN_DONE`
- `INVENTORY_RETURN_CANCELLED`
- `INVENTORY_RETURN_APPROVED`
- `INVENTORY_TRANSFER_APPROVED`
- `INVENTORY_TRANSFER_CANCELLED`
- `INVENTORY_ADJUSTMENT_APPROVED`
- `INVENTORY_DESTROY_DONE`
- `INVENTORY_DESTROY_CANCELLED`
- `INVENTORY_DESTROY_APPROVED`

Khi nhận các event này, hệ thống sẽ cập nhật:

- `inventory_balance`
- `inventory_layer`
- `inventory_transaction`
- `transaction_log`

Hệ thống không update trực tiếp bảng `warehouse`.

## Schema khuyến nghị cho mọi nghiệp vụ

### Event level

```json
{
  "eventId": "2bde1b37-b566-4f5a-8f49-33544e58f4f0",
  "eventKey": "inventory:import:invoice:1001:approved",
  "eventType": "INVENTORY_IMPORT_APPROVED",
  "refType": "IMPORT",
  "aggregateType": "IMPORT_INVOICE",
  "aggregateId": 1001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 10,
  "actorName": "admin",
  "invoiceType": "IV4",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T16:30:00",
  "note": "Duyet phieu nhap kho",
  "items": []
}
```

### Item level

```json
{
  "lineId": 5001,
  "productId": 218,
  "variantId": 146,
  "unitId": 1,
  "quantity": 10,
  "baseQuantity": 10,
  "unitCost": 26600000,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "batchNo": "BATCH-001",
  "mfgDate": "2026-03-01T00:00:00",
  "expiryDate": "2027-03-01T00:00:00",
  "reason": null
}
```

## Ý nghĩa các field

### Event level

- `eventId`: id duy nhất của event
- `eventKey`: khóa idempotency, dùng để tránh apply trùng
- `eventType`: loại event kỹ thuật để consumer route đúng handler
- `refType`: loại nghiệp vụ tồn kho, nên thuộc một trong:
  - `IMPORT`
  - `SALE`
  - `RETURN`
  - `TRANSFER`
  - `ADJUSTMENT`
  - `DESTROY`
- `aggregateType`: loại chứng từ nguồn, ví dụ `IMPORT_INVOICE`, `SALE_INVOICE`, `STOCK_TRANSFER`
- `aggregateId`: id chứng từ nguồn
- `bsnId`: doanh nghiệp
- `warehouseId`: kho mặc định của event nếu line không override
- `fromWarehouseId`: kho xuất nguồn cho `TRANSFER`
- `toWarehouseId`: kho đích cho `TRANSFER`
- `actorId`: người thao tác
- `actorName`: tên người thao tác
- `invoiceType`: loại hóa đơn nguồn nếu có
- `invoiceStatus`: trạng thái chứng từ nguồn nếu có
- `occurredAt`: thời điểm phát sinh
- `note`: ghi chú nghiệp vụ

### Item level

- `lineId`: id dòng chứng từ
- `productId`: sản phẩm
- `variantId`: biến thể; nên luôn truyền nếu kho quản lý tồn theo biến thể
- `unitId`: đơn vị của dòng chứng từ
- `quantity`: số lượng biến động
- `baseQuantity`: số lượng quy đổi về đơn vị gốc, nên có để tránh mơ hồ
- `unitCost`: giá vốn / giá nhập để tạo layer
- `warehouseId`: kho áp dụng cho line
- `fromWarehouseId`: kho nguồn cho line chuyển kho
- `toWarehouseId`: kho đích cho line chuyển kho
- `batchNo`: lô hàng
- `mfgDate`: ngày sản xuất
- `expiryDate`: hạn dùng
- `reason`: lý do điều chỉnh/hủy hàng

## Field bắt buộc tối thiểu theo từng nghiệp vụ

### 1. IMPORT

Tối thiểu:

- `eventType`
- `refType=IMPORT`
- `aggregateId`
- `actorId`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`
- `items[].unitCost`
- `items[].warehouseId`

### 2. SALE

Tối thiểu:

- `eventType`
- `refType=SALE`
- `aggregateId`
- `actorId`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`
- `items[].warehouseId`

Khuyến nghị:

- `unitCost` có thể không bắt buộc nếu giá vốn được tính từ layer FIFO

### 3. RETURN

Phải phân biệt rõ:

- Khách trả hàng về kho: gần giống `IMPORT`
- Trả hàng nhà cung cấp: gần giống `SALE` hoặc `DESTROY` tùy nghiệp vụ

Tối thiểu:

- `refType=RETURN`
- `items[].warehouseId`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`

### 4. TRANSFER

Bắt buộc:

- `refType=TRANSFER`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`
- `items[].fromWarehouseId`
- `items[].toWarehouseId`

Khuyến nghị:

- xử lý thành 2 bút toán nội bộ:
  - xuất khỏi kho nguồn
  - nhập vào kho đích

### 5. ADJUSTMENT

Bắt buộc:

- `refType=ADJUSTMENT`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`
- `items[].warehouseId`
- `items[].reason`

### 6. DESTROY

Bắt buộc:

- `refType=DESTROY`
- `items[].productId`
- `items[].variantId`
- `items[].unitId`
- `items[].quantity`
- `items[].warehouseId`
- `items[].reason`

## Mẫu message hợp lệ nhất cho kho

Đây là mẫu payload nhiều thông tin nhất, dùng làm chuẩn chung. Khi chỉ cần một case cụ thể thì có thể bỏ các field không dùng, nhưng khuyến nghị hệ thống upstream vẫn nên giữ đủ schema này.

```json
{
  "eventId": "2bde1b37-b566-4f5a-8f49-33544e58f4f0",
  "eventKey": "inventory:import:invoice:1001:approved",
  "eventType": "INVENTORY_IMPORT_APPROVED",
  "refType": "IMPORT",
  "aggregateType": "IMPORT_INVOICE",
  "aggregateId": 1001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 10,
  "actorName": "admin",
  "invoiceType": "IV4",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T16:30:00",
  "note": "Duyet phieu nhap kho",
  "items": [
    {
      "lineId": 5001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 10,
      "baseQuantity": 10,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": "BATCH-001",
      "mfgDate": "2026-03-01T00:00:00",
      "expiryDate": "2027-03-01T00:00:00",
      "reason": null
    }
  ]
}
```

## Mapping sang posting nội bộ

Để service kho apply được chuẩn, mỗi item nên map được sang:

```json
{
  "productId": 218,
  "variantId": 146,
  "unitId": 1,
  "warehouseId": 2,
  "quantity": 10,
  "unitCost": 26600000
}
```

Với `TRANSFER`, nên map thành 2 line:

1. line âm cho `fromWarehouseId`
2. line dương cho `toWarehouseId`

## Trạng thái support hiện tại

### Đã support trong code hiện tại

- `IMPORT`
  - `INVENTORY_IMPORT_APPROVED`
  - `INVENTORY_IMPORT_CANCELLED`
- `SALE`
  - `INVENTORY_SALE_DONE`
  - `INVENTORY_SALE_CANCELLED`
  - `INVENTORY_SALE_APPROVED`
- `RETURN`
  - `INVENTORY_RETURN_DONE`
  - `INVENTORY_RETURN_CANCELLED`
  - `INVENTORY_RETURN_APPROVED`
- `TRANSFER`
  - `INVENTORY_TRANSFER_APPROVED`
  - `INVENTORY_TRANSFER_CANCELLED`
- `ADJUSTMENT`
  - `INVENTORY_ADJUSTMENT_APPROVED`
- `DESTROY`
  - `INVENTORY_DESTROY_DONE`
  - `INVENTORY_DESTROY_CANCELLED`
  - `INVENTORY_DESTROY_APPROVED`

Các event này hiện đều đi qua cùng một flow:

1. consumer nhận event Kafka
2. route theo `eventType`
3. map sang `InventoryPostingCommand`
4. cập nhật `inventory_balance`
5. cập nhật `inventory_layer`
6. ghi `inventory_transaction`
7. ghi `transaction_log` để chống apply trùng

### Lưu ý nghiệp vụ hiện tại

- `TRANSFER` được tách thành 2 bút toán:
  - trừ kho nguồn
  - cộng kho đích
- `ADJUSTMENT` dùng trực tiếp dấu của `quantity`
  - dương thì cộng
  - âm thì trừ
- một số nguồn upstream hiện có thể chưa mang `variantId`
  - trong trường hợp đó có thể gửi `variantId = 0`
  - kho sẽ xử lý theo key product-level tại `productId + variantId(=0) + warehouseId`
- nếu xuất vượt tồn, service kho sẽ chặn và throw lỗi

## Quy tắc sign quantity khuyến nghị

- `IMPORT`: `+quantity`
- `SALE`: `-quantity`
- `RETURN`:
  - khách trả hàng: `+quantity`
  - trả NCC: `-quantity`
- `TRANSFER`:
  - kho nguồn: `-quantity`
  - kho đích: `+quantity`
- `ADJUSTMENT`:
  - tăng tồn: `+quantity`
  - giảm tồn: `-quantity`
- `DESTROY`: `-quantity`

## Checklist để xác nhận kho sẽ cập nhật

Trước khi kết luận "kho sẽ nhận và điều chỉnh được", kiểm tra:

1. Topic publisher và consumer trùng nhau
2. Consumer enabled
3. `eventType` được processor hỗ trợ
4. `variantId` có mặt và đúng
5. `warehouseId` hoặc `fromWarehouseId/toWarehouseId` đầy đủ
6. `quantity != 0`
7. Nếu là nhập kho, có `unitCost`
8. `eventKey` chưa từng được xử lý

## Kết luận

Để kho điều chỉnh được "chắc chắn" và mở rộng được cho toàn bộ 6 nghiệp vụ, message Kafka nên dùng schema đầy đủ ở trên, trong đó ba field quan trọng nhất là:

- `refType`
- `variantId`
- `warehouseId` hoặc `fromWarehouseId/toWarehouseId`

Nếu thiếu các field này, hệ thống sẽ không thể xử lý đúng toàn bộ vòng đời tồn kho ở mức biến thể và mức kho.

## Payload mẫu cho từng case Kafka

### 1. IMPORT APPROVED

```json
{
  "eventId": "7f3b7cc6-0ff6-4aa8-bd29-8b4fd1b17d11",
  "eventKey": "inventory-import:1001:approved",
  "eventType": "INVENTORY_IMPORT_APPROVED",
  "refType": "IMPORT",
  "aggregateType": "IMPORT_INVOICE",
  "aggregateId": 1001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 10,
  "actorName": "admin",
  "invoiceType": "IV4",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:05:00",
  "note": "Duyet phieu nhap kho",
  "items": [
    {
      "lineId": 5001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 10,
      "baseQuantity": 10,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": "BATCH-001",
      "mfgDate": "2026-03-01T00:00:00",
      "expiryDate": "2027-03-01T00:00:00",
      "reason": null
    }
  ]
}
```

### 2. IMPORT CANCELLED

```json
{
  "eventId": "7f3b7cc6-0ff6-4aa8-bd29-8b4fd1b17d12",
  "eventKey": "inventory-import:1001:cancel",
  "eventType": "INVENTORY_IMPORT_CANCELLED",
  "refType": "IMPORT",
  "aggregateType": "IMPORT_INVOICE",
  "aggregateId": 1001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 10,
  "actorName": "admin",
  "invoiceType": "IV4",
  "invoiceStatus": 3,
  "occurredAt": "2026-03-17T17:06:00",
  "note": "Huy phieu nhap kho da duyet",
  "items": [
    {
      "lineId": 5001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 10,
      "baseQuantity": 10,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": "BATCH-001",
      "mfgDate": "2026-03-01T00:00:00",
      "expiryDate": "2027-03-01T00:00:00",
      "reason": null
    }
  ]
}
```

### 3. SALE DONE

Consumer đang support:

- `INVENTORY_SALE_DONE`
- `INVENTORY_SALE_APPROVED`

Payload mẫu:

```json
{
  "eventId": "b4e11ba0-c1aa-4e8f-8f4c-df15840ef001",
  "eventKey": "inventory-sale:2001:done",
  "eventType": "INVENTORY_SALE_DONE",
  "refType": "SALE",
  "aggregateType": "SALE_INVOICE",
  "aggregateId": 2001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 11,
  "actorName": "cashier",
  "invoiceType": "IV1",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:07:00",
  "note": "Ban hang xuat kho",
  "items": [
    {
      "lineId": 6001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 2,
      "baseQuantity": 2,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": null
    }
  ]
}
```

### 4. SALE CANCELLED

```json
{
  "eventId": "b4e11ba0-c1aa-4e8f-8f4c-df15840ef002",
  "eventKey": "inventory-sale:2001:cancel",
  "eventType": "INVENTORY_SALE_CANCELLED",
  "refType": "SALE",
  "aggregateType": "SALE_INVOICE",
  "aggregateId": 2001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 11,
  "actorName": "cashier",
  "invoiceType": "IV1",
  "invoiceStatus": 3,
  "occurredAt": "2026-03-17T17:08:00",
  "note": "Huy hoa don ban hang",
  "items": [
    {
      "lineId": 6001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 2,
      "baseQuantity": 2,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": null
    }
  ]
}
```

### 5. RETURN DONE

Consumer đang support:

- `INVENTORY_RETURN_DONE`
- `INVENTORY_RETURN_APPROVED`

Payload mẫu:

```json
{
  "eventId": "2b7af37e-9bd0-4d46-b8a0-f9f4c7d5c001",
  "eventKey": "inventory-return:3001:done",
  "eventType": "INVENTORY_RETURN_DONE",
  "refType": "RETURN",
  "aggregateType": "RETURN_INVOICE",
  "aggregateId": 3001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 12,
  "actorName": "staff",
  "invoiceType": "IV2",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:09:00",
  "note": "Khach tra hang ve kho",
  "items": [
    {
      "lineId": 7001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 1,
      "baseQuantity": 1,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Khach doi tra"
    }
  ]
}
```

### 6. RETURN CANCELLED

```json
{
  "eventId": "2b7af37e-9bd0-4d46-b8a0-f9f4c7d5c002",
  "eventKey": "inventory-return:3001:cancel",
  "eventType": "INVENTORY_RETURN_CANCELLED",
  "refType": "RETURN",
  "aggregateType": "RETURN_INVOICE",
  "aggregateId": 3001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 12,
  "actorName": "staff",
  "invoiceType": "IV2",
  "invoiceStatus": 3,
  "occurredAt": "2026-03-17T17:10:00",
  "note": "Huy phieu tra hang",
  "items": [
    {
      "lineId": 7001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 1,
      "baseQuantity": 1,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Khach doi tra"
    }
  ]
}
```

### 7. TRANSFER APPROVED

```json
{
  "eventId": "13344a8e-4f09-493c-bdf9-bd5300e87001",
  "eventKey": "inventory-transfer:4001:approved",
  "eventType": "INVENTORY_TRANSFER_APPROVED",
  "refType": "TRANSFER",
  "aggregateType": "STOCK_TRANSFER",
  "aggregateId": 4001,
  "bsnId": 1,
  "warehouseId": null,
  "fromWarehouseId": 2,
  "toWarehouseId": 3,
  "actorId": 13,
  "actorName": "warehouse-admin",
  "invoiceType": null,
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:11:00",
  "note": "Chuyen kho 2 sang kho 3",
  "items": [
    {
      "lineId": 8001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 3,
      "baseQuantity": 3,
      "unitCost": 26600000,
      "warehouseId": null,
      "fromWarehouseId": 2,
      "toWarehouseId": 3,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Dieu chuyen noi bo"
    }
  ]
}
```

### 8. TRANSFER CANCELLED

```json
{
  "eventId": "13344a8e-4f09-493c-bdf9-bd5300e87002",
  "eventKey": "inventory-transfer:4001:cancel",
  "eventType": "INVENTORY_TRANSFER_CANCELLED",
  "refType": "TRANSFER",
  "aggregateType": "STOCK_TRANSFER",
  "aggregateId": 4001,
  "bsnId": 1,
  "warehouseId": null,
  "fromWarehouseId": 2,
  "toWarehouseId": 3,
  "actorId": 13,
  "actorName": "warehouse-admin",
  "invoiceType": null,
  "invoiceStatus": 3,
  "occurredAt": "2026-03-17T17:12:00",
  "note": "Huy chuyen kho 2 sang kho 3",
  "items": [
    {
      "lineId": 8001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 3,
      "baseQuantity": 3,
      "unitCost": 26600000,
      "warehouseId": null,
      "fromWarehouseId": 2,
      "toWarehouseId": 3,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Dieu chuyen noi bo"
    }
  ]
}
```

### 9. ADJUSTMENT APPROVED

Lưu ý:

- code hiện tại support `ADJUSTMENT` ở kho
- nếu nguồn chưa có `variantId` thì có thể gửi `variantId = 0`

```json
{
  "eventId": "df5fe2ce-6b0d-4d27-bfc4-574b23de9001",
  "eventKey": "inventory-adjustment:5001:approved",
  "eventType": "INVENTORY_ADJUSTMENT_APPROVED",
  "refType": "ADJUSTMENT",
  "aggregateType": "STOCK_ADJUST",
  "aggregateId": 5001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 14,
  "actorName": "inventory-checker",
  "invoiceType": null,
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:13:00",
  "note": "Kiem ke chenhlech ton",
  "items": [
    {
      "lineId": 9001,
      "productId": 218,
      "variantId": 0,
      "unitId": 1,
      "quantity": -2,
      "baseQuantity": -2,
      "unitCost": 0,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Hong hoc mat mat"
    }
  ]
}
```

### 10. DESTROY DONE

Consumer đang support:

- `INVENTORY_DESTROY_DONE`
- `INVENTORY_DESTROY_APPROVED`

Payload mẫu:

```json
{
  "eventId": "6d64ef91-7bc0-49f8-bb27-6b61db10a001",
  "eventKey": "inventory-destroy:6001:done",
  "eventType": "INVENTORY_DESTROY_DONE",
  "refType": "DESTROY",
  "aggregateType": "DESTROY_INVOICE",
  "aggregateId": 6001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 15,
  "actorName": "warehouse-staff",
  "invoiceType": "IV6",
  "invoiceStatus": 1,
  "occurredAt": "2026-03-17T17:14:00",
  "note": "Xuat huy hang hong",
  "items": [
    {
      "lineId": 10001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 1,
      "baseQuantity": 1,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Hang hong khong the ban"
    }
  ]
}
```

### 11. DESTROY CANCELLED

```json
{
  "eventId": "6d64ef91-7bc0-49f8-bb27-6b61db10a002",
  "eventKey": "inventory-destroy:6001:cancel",
  "eventType": "INVENTORY_DESTROY_CANCELLED",
  "refType": "DESTROY",
  "aggregateType": "DESTROY_INVOICE",
  "aggregateId": 6001,
  "bsnId": 1,
  "warehouseId": 2,
  "fromWarehouseId": null,
  "toWarehouseId": null,
  "actorId": 15,
  "actorName": "warehouse-staff",
  "invoiceType": "IV6",
  "invoiceStatus": 3,
  "occurredAt": "2026-03-17T17:15:00",
  "note": "Huy phieu xuat huy",
  "items": [
    {
      "lineId": 10001,
      "productId": 218,
      "variantId": 146,
      "unitId": 1,
      "quantity": 1,
      "baseQuantity": 1,
      "unitCost": 26600000,
      "warehouseId": 2,
      "fromWarehouseId": null,
      "toWarehouseId": null,
      "batchNo": null,
      "mfgDate": null,
      "expiryDate": null,
      "reason": "Hang hong khong the ban"
    }
  ]
}
```
