# API Cập Nhật Dòng Nhập Kho

## Mục đích

API này dùng để tạo mới hoặc cập nhật một dòng hàng trong phiếu nhập kho.

Lưu ý quan trọng:

- API này chỉ tạo hoặc sửa dữ liệu dòng nhập kho
- API này chưa cộng tồn kho ngay
- Sau khi hoàn tất các dòng nhập, cần gọi API duyệt phiếu nhập để hệ thống cập nhật tồn kho thực tế

## Endpoint

- Method: `POST`
- URL: `/inventory/product_import/update`

## Quyền truy cập

- Cần đăng nhập
- Cần quyền trên nhóm `/product_import/`
- Khi tạo mới: quyền `ADD`
- Khi cập nhật: quyền `UPDATE`

## Request body

API nhận JSON theo model `ProductImport`

### Các trường chính

- `id`: ID dòng nhập kho
- `productId`: ID sản phẩm
- `variantId`: ID biến thể sản phẩm
- `batchNo`: số lô
- `unitId`: ID đơn vị tính
- `quantity`: số lượng nhập
- `mainCost`: giá nhập chính
- `preCost`: giá nhập trước đó hoặc giá tham chiếu
- `mfgDate`: ngày sản xuất
- `expiryDate`: hạn dùng
- `invoiceId`: ID phiếu nhập kho

## Ý nghĩa từng trường

- `id`
  - Không có hoặc `<= 0`: tạo mới dòng nhập kho
  - Có và `> 0`: cập nhật dòng nhập kho hiện có

- `productId`
  - Bắt buộc
  - Phải lớn hơn `0`

- `variantId`
  - Không bắt buộc
  - Dùng khi sản phẩm có biến thể

- `batchNo`
  - Không bắt buộc
  - Dùng để lưu số lô của hàng nhập

- `unitId`
  - Bắt buộc
  - Phải lớn hơn `0`

- `quantity`
  - Bắt buộc
  - Phải lớn hơn `0`

- `mainCost`
  - Bắt buộc
  - Phải lớn hơn hoặc bằng `0`

- `preCost`
  - Không bắt buộc

- `mfgDate`
  - Không bắt buộc
  - Nếu có thì phải nhỏ hơn hoặc bằng thời điểm hiện tại

- `expiryDate`
  - Bắt buộc
  - Phải lớn hơn hoặc bằng thời điểm hiện tại

- `invoiceId`
  - Bắt buộc khi tạo mới
  - Dùng để xác định dòng nhập thuộc phiếu nhập nào

## Rule xử lý

API sẽ kiểm tra các điều kiện sau:

- `invoiceId` phải tồn tại
- `invoice` phải thuộc đúng doanh nghiệp hiện tại
- `invoice` phải là phiếu nhập kho
- Chỉ được tạo, sửa, xóa khi phiếu nhập đang ở trạng thái `chờ duyệt`

## Cách hoạt động

### Trường hợp 1: Tạo mới

Khi `id` không có hoặc `<= 0`:

1. Kiểm tra `invoiceId`
2. Xác thực phiếu nhập thuộc đúng doanh nghiệp
3. Kiểm tra phiếu nhập đang ở trạng thái chờ duyệt
4. Tự lấy `inventoryId` từ phiếu nhập
5. Tự set `status` của dòng nhập là `PENDING`
6. Thêm dòng hàng vào bảng `product_import`

### Trường hợp 2: Cập nhật

Khi `id > 0`:

1. Lấy dòng nhập kho hiện tại theo `id`
2. Lấy `invoiceId` từ dòng hiện tại
3. Kiểm tra phiếu nhập vẫn đang chờ duyệt
4. Cập nhật lại các trường dữ liệu
5. Giữ logic liên kết với phiếu nhập gốc

## Ví dụ tạo mới

```http
POST /inventory/product_import/update
Content-Type: application/json
```

```json
{
  "productId": 101,
  "variantId": 0,
  "batchNo": "LO-202603",
  "unitId": 2,
  "quantity": 50,
  "mainCost": 120000,
  "preCost": 110000,
  "mfgDate": "2026-03-01T00:00:00",
  "expiryDate": "2026-12-31T00:00:00",
  "invoiceId": 9001
}
```

## Ví dụ cập nhật

```http
POST /inventory/product_import/update
Content-Type: application/json
```

```json
{
  "id": 15,
  "productId": 101,
  "variantId": 0,
  "batchNo": "LO-202603-A",
  "unitId": 2,
  "quantity": 60,
  "mainCost": 125000,
  "preCost": 115000,
  "mfgDate": "2026-03-01T00:00:00",
  "expiryDate": "2026-12-31T00:00:00"
}
```

## Ví dụ response

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "id": 15,
    "productId": 101,
    "variantId": 0,
    "batchNo": "LO-202603-A",
    "unitId": 2,
    "quantity": 60,
    "mainCost": 125000,
    "preCost": 115000,
    "mfgDate": "2026-03-01T00:00:00",
    "expiryDate": "2026-12-31T00:00:00",
    "invoiceId": 9001,
    "status": 1
  }
}
```

## API liên quan

### 1. Lấy danh sách dòng nhập kho

- `GET /inventory/product_import/list`

### 2. Lấy chi tiết một dòng nhập kho

- `GET /inventory/product_import/get?id=...`

### 3. Xóa dòng nhập kho

- `DELETE /inventory/product_import/delete?id=...`

### 4. Duyệt phiếu nhập

- `POST /inventory/product_import/approve?invoiceId=...`

Đây là bước làm phát sinh cập nhật tồn kho thực tế.

### 5. Hủy phiếu nhập

- `POST /inventory/product_import/cancel?invoiceId=...`

Nếu phiếu đã được duyệt, hệ thống sẽ xử lý luồng hủy tương ứng.

## Luồng sử dụng khuyến nghị

### Luồng nhập kho chuẩn

1. Tạo phiếu nhập kho
2. Gọi `product_import/update` để thêm từng dòng hàng
3. Có thể tiếp tục gọi `product_import/update` để sửa từng dòng
4. Kiểm tra lại bằng `product_import/list`
5. Gọi `product_import/approve` để duyệt phiếu
6. Sau khi duyệt, tồn kho mới được cập nhật

## Các lỗi có thể gặp

- `Thiếu invoiceId của phiếu nhập`
- `Phiếu nhập không tồn tại`
- `Phiếu nhập không thuộc doanh nghiệp hiện tại`
- `Invoice hiện tại không phải phiếu nhập kho`
- `Chỉ được chỉnh sửa phiếu nhập đang chờ duyệt`

## Ghi chú thêm

- `batchNo` hiện đã được lưu ở dòng nhập kho
- `expiryDate` hiện đã được lưu ở dòng nhập kho
- Tuy nhiên nếu muốn hiển thị tồn kho theo lô và hạn dùng ở màn tồn kho, cần có API hoặc cấu trúc dữ liệu tồn kho theo lô riêng, vì bảng snapshot tồn hiện tại không tách theo lô

