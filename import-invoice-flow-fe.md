# Luồng Tạo Phiếu Nhập Kho Cho FE

Tài liệu này mô tả luồng FE cần gọi để:
- tạo phiếu nhập kho
- thêm dòng hàng nhập
- giữ phiếu ở trạng thái chờ duyệt
- duyệt phiếu để backend đẩy message lên Kafka

## Tổng quan

Trong backend hiện tại:
- Tạo phiếu nhập kho không đẩy Kafka ngay.
- Kafka chỉ được publish khi gọi API duyệt phiếu nhập.
- Phiếu vừa tạo sẽ ở trạng thái `STATUS_PENDING = 2`, có thể hiểu là "đang chờ duyệt".

Loại phiếu nhập hỗ trợ:
- `IV4`: Phiếu nhập kho
- `IV5`: Phiếu nhập tồn

Trạng thái liên quan:
- `2`: Đang chờ duyệt
- `1`: Đã hoàn thành
- `3`: Đã hủy

## Bước 1: Tạo phiếu nhập kho

API:
```http
POST /inventory/invoice/import/update
```

Body tối thiểu:
```json
{
  "invoiceType": "IV4",
  "inventoryId": 1,
  "businessPartnerId": 123
}
```

Body đầy đủ hơn:
```json
{
  "invoiceType": "IV4",
  "inventoryId": 1,
  "receiptDate": "2026-03-19T15:00:00",
  "receiptImage": "https://example.com/receipt.png",
  "businessPartnerId": 123
}
```

Field:
- `id`: để trống hoặc bỏ qua khi tạo mới
- `invoiceType`: khuyến nghị gửi `IV4`
- `inventoryId`: bắt buộc khi tạo mới
- `receiptDate`: không bắt buộc, nếu không gửi backend sẽ lấy thời gian hiện tại
- `receiptImage`: không bắt buộc
- `businessPartnerId`: không bắt buộc theo code hiện tại, nhưng nên gửi nếu có nhà cung cấp

Kết quả:
- Backend tạo `invoice`
- `status` mặc định là `2` = chờ duyệt
- FE cần lưu lại `invoice.id` để thêm dòng hàng

## Bước 2: Thêm dòng hàng nhập kho

API:
```http
POST /inventory/product_import/update
```

Body mẫu:
```json
{
  "invoiceId": 1001,
  "productId": 10,
  "variantId": 0,
  "unitId": 1,
  "quantity": 5,
  "mainCost": 20000,
  "batchNo": "BATCH-001",
  "mfgDate": "2026-03-01T00:00:00",
  "expiryDate": "2026-12-31T00:00:00"
}
```

Field đang được backend validate:
- `productId`: bắt buộc
- `unitId`: bắt buộc
- `quantity`: phải `>= 0`
- `mainCost`: phải `>= 0`
- `mfgDate`: nếu có nhập thì phải `<= now`
- `expiryDate`: bắt buộc và phải `>= now`

Field không bắt buộc:
- `id`
- `variantId`
- `batchNo`
- `preCost`
- `status`
- `inventoryId`

Lưu ý:
- `invoiceId` phải là id của phiếu nhập đã tạo ở bước 1
- FE có thể gọi API này nhiều lần để thêm nhiều dòng hàng cho cùng 1 phiếu nhập
- Khi cập nhật dòng hàng đã tồn tại, gửi thêm `id`

## Bước 3: Hiển thị trạng thái chờ duyệt

Sau khi tạo phiếu và thêm dòng hàng, FE có thể coi phiếu đang ở trạng thái "chờ đẩy Kafka" hoặc "chờ duyệt".

Thực tế theo backend:
- trạng thái này là `status = 2`
- chưa có message Kafka nào được publish ở bước này

API có thể dùng để lấy chi tiết:
```http
GET /inventory/invoice/import/get?id={invoiceId}
```

API có thể dùng để lấy danh sách:
```http
GET /inventory/invoice/import/list
```

## Bước 4: Duyệt phiếu nhập để đẩy Kafka

API:
```http
POST /inventory/invoice/import/approve?invoiceId=1001
```

Khi gọi API này:
- Backend kiểm tra phiếu nhập có đang `status = 2` hay không
- Backend kiểm tra phiếu nhập có ít nhất 1 dòng `product_import`
- Nếu Kafka import producer đang bật:
  - backend publish event import approved lên Kafka
  - sau đó update `invoice.status = 1`
- Nếu Kafka import producer đang tắt:
  - backend không publish Kafka
  - nhưng vẫn update `invoice.status = 1`

Nghĩa là:
- FE không nên hiểu `approve` là "chỉ đánh dấu đã duyệt"
- Trong code hiện tại, `approve` là bước trigger xử lý nhập kho và là bước có thể publish Kafka

## Bước 5: Hủy phiếu nhập

API:
```http
POST /inventory/invoice/import/cancel?invoiceId=1001
```

Hành vi:
- Nếu phiếu đang chờ duyệt: đổi trạng thái sang hủy
- Nếu phiếu đã hoàn thành và Kafka đang bật: backend publish sự kiện cancel

## Sequence FE nên dùng

Sequence khuyến nghị:
1. Gọi `POST /inventory/invoice/import/update` để tạo phiếu.
2. Lấy `invoiceId` từ response.
3. Gọi `POST /inventory/product_import/update` 1 hoặc nhiều lần để thêm dòng hàng.
4. Hiển thị phiếu ở trạng thái "Chờ duyệt".
5. Khi người dùng bấm "Duyệt", gọi `POST /inventory/invoice/import/approve?invoiceId=...`.
6. Reload chi tiết phiếu nhập.

## Khuyến nghị UI/UX cho FE

- Sau bước tạo phiếu, luôn lưu `invoiceId` vào state/page context.
- Không cho phép bấm "Duyệt" nếu chưa có dòng hàng.
- Khi approve thành công, reload lại detail để lấy `status` mới.
- Nếu muốn cho phép sửa phiếu, chỉ cho sửa khi `status = 2`.

## Ví dụ response mong đợi

Tạo phiếu thành công:
- response `result.id` là `invoiceId`
- response `result.status` thường là `2`

Duyệt phiếu thành công:
- response trả `1`
- sau đó `GET /invoice/import/get` sẽ thấy `status = 1`

## Ghi chú quan trọng

- Trong code hiện tại, "chờ đẩy Kafka" thực tế là "phiếu đang chờ duyệt".
- Kafka không được đẩy khi tạo phiếu.
- Kafka được đẩy khi approve phiếu nhập.
