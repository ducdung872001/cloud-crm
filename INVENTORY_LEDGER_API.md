# API Sổ Kho

## Mục đích

API này dùng để hiển thị màn hình sổ kho, tức lịch sử biến động xuất nhập tồn theo từng chứng từ.

Nguồn dữ liệu gốc:

- `inventory_transaction`

Các bảng liên quan được join thêm để hiển thị thông tin:

- `product`
- `product_variant`
- `unit`
- `warehouse`
- `product_import`
- `invoice`
- `stock_transfer`
- `stock_adjust`

Ngoài ra hệ thống còn enrich thêm tên nhân viên và tên đối tác ở tầng service.

## Danh sách API

### 1. Danh sách sổ kho

- Method: `GET`
- Endpoint: `/inventory/inventoryTransaction/ledger/list`

### 2. Chi tiết một dòng sổ kho

- Method: `GET`
- Endpoint: `/inventory/inventoryTransaction/ledger/get`

## 1. API danh sách sổ kho

### Endpoint

```http
GET /inventory/inventoryTransaction/ledger/list
```

### Query params

- `refType`: loại chứng từ
- `warehouseId`: ID kho
- `productId`: ID sản phẩm
- `keyword`: từ khóa tìm kiếm
- `page`, `size`: phân trang

### Giá trị `refType`

- để rỗng: tất cả
- `IMPORT`: nhập kho
- `SALE`: bán hàng
- `RETURN`: khách trả
- `TRANSFER`: chuyển kho
- `ADJUSTMENT`: điều chỉnh
- `DESTROY`: xuất hủy

### Ví dụ request

```http
GET /inventory/inventoryTransaction/ledger/list?refType=IMPORT&warehouseId=2&page=0&size=20
```

Hoặc:

```http
GET /inventory/inventoryTransaction/ledger/list?keyword=Khẩu trang
```

## 2. API chi tiết một dòng sổ kho

### Endpoint

```http
GET /inventory/inventoryTransaction/ledger/get?id=32
```

### Query params

- `id`: ID transaction trong bảng `inventory_transaction`

## Cấu trúc dữ liệu response

### Các trường chính

- `id`: ID transaction
- `refType`: loại chứng từ
- `refTypeName`: tên loại chứng từ
- `refId`: ID chứng từ nguồn
- `refCode`: mã chứng từ nguồn

- `createdTime`: thời gian tạo
- `updatedTime`: thời gian cập nhật

- `productId`: ID sản phẩm
- `productName`: tên sản phẩm
- `productSku`: mã sản phẩm
- `variantId`: ID biến thể
- `variantSku`: SKU biến thể

- `partnerId`: ID đối tác
- `partnerName`: tên đối tác
- `partnerType`: loại đối tác

- `warehouseId`: ID kho
- `warehouseName`: tên kho
- `fromWarehouseId`: kho nguồn
- `fromWarehouseName`: tên kho nguồn
- `toWarehouseId`: kho đích
- `toWarehouseName`: tên kho đích

- `quantity`: số lượng biến động
- `quantityChange`: alias hiển thị biến động số lượng
- `baseQuantity`: số lượng quy đổi
- `unitId`: ID đơn vị tính
- `unitName`: tên đơn vị tính
- `unitCost`: đơn giá

- `prevQuantity`: tồn trước
- `afterQuantity`: tồn sau

- `employeeId`: ID người thực hiện
- `employeeName`: tên người thực hiện

- `refFinanceId`: ID tham chiếu tài chính
- `refFinanceCode`: mã tham chiếu tài chính

- `status`: trạng thái
- `statusName`: tên trạng thái

- `batchNo`: số lô
- `expiryDate`: hạn dùng
- `reason`: lý do

## Nguồn dữ liệu của một số trường quan trọng

### Có thể join được

- `productName`: từ `product.name`
- `productSku`: từ `product.code`
- `variantSku`: từ `product_variant.sku`
- `unitName`: từ `unit.name`
- `warehouseName`: từ `warehouse.name`
- `batchNo`: từ `product_import.batch_no`
- `expiryDate`: từ `product_import.expiry_date`

### Được enrich thêm ở service

- `employeeName`
- `partnerName`

## Lưu ý quan trọng

### 1. `batchNo` và `expiryDate`

Hiện tại:

- `batchNo` lấy từ `product_import`
- `expiryDate` lấy từ `product_import`

Vì vậy:

- rõ nhất với chứng từ `IMPORT`
- các loại chứng từ khác có thể trả `null`

### 2. `unitName`

Hiện đã được join từ bảng `unit`, nên nếu `unit_id` có dữ liệu thì API sẽ trả được `unitName`.

### 3. `partnerName`

Không join trực tiếp trong SQL.
Tên đối tác được enrich thêm ở tầng service:

- `IMPORT` → nhà cung cấp
- `SALE`, `RETURN` → khách hàng

### 4. `fromWarehouseName`, `toWarehouseName`

Chỉ có giá trị với `TRANSFER`.

### 5. `reason`

Chủ yếu có giá trị với:

- `TRANSFER`
- `ADJUSTMENT`

## Ví dụ response item

```json
{
  "id": 32,
  "refType": "IMPORT",
  "refTypeName": "Nhập kho",
  "refId": 101,
  "refCode": "NK001",
  "createdTime": "2026-03-18T09:00:00",
  "updatedTime": "2026-03-18T09:05:00",
  "productId": 12,
  "productName": "Kem dưỡng da",
  "productSku": "PRODUCT12",
  "variantId": 0,
  "variantSku": null,
  "partnerId": 7,
  "partnerName": "Nhà cung cấp A",
  "partnerType": "Nhà cung cấp",
  "warehouseId": 2,
  "warehouseName": "Kho trung tâm",
  "fromWarehouseId": null,
  "fromWarehouseName": null,
  "toWarehouseId": null,
  "toWarehouseName": null,
  "quantity": 50.0,
  "quantityChange": 50.0,
  "baseQuantity": 50.0,
  "unitId": 3,
  "unitName": "Hộp",
  "unitCost": 120000.0,
  "prevQuantity": 100.0,
  "afterQuantity": 150.0,
  "employeeId": 15,
  "employeeName": "Nguyễn Văn A",
  "refFinanceId": 101,
  "refFinanceCode": "PNK-0001",
  "status": 1,
  "statusName": "Hoàn thành",
  "batchNo": "LO-202603",
  "expiryDate": "2026-12-31T00:00:00",
  "reason": null
}
```

## Quy tắc sử dụng theo tab

- Tab nhập kho:
  - `refType=IMPORT`
- Tab bán hàng:
  - `refType=SALE`
- Tab khách trả:
  - `refType=RETURN`
- Tab chuyển kho:
  - `refType=TRANSFER`
- Tab điều chỉnh:
  - `refType=ADJUSTMENT`
- Tab xuất hủy:
  - `refType=DESTROY`
- Tất cả:
  - để trống `refType`

## Kết luận

API sổ kho hiện đã đủ để hiển thị phần lớn thông tin cần thiết cho màn hình theo dõi biến động kho.

Các trường đã có thể lấy thêm sau cập nhật:

- `unitName`
- `batchNo`
- `expiryDate`

Những trường không có dữ liệu ở bảng nguồn tương ứng sẽ trả `null`.

