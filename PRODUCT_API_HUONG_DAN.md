# Hướng Dẫn Sử Dụng API Sản Phẩm - Inventory New

Tài liệu này mô tả các API chính liên quan đến quản lý sản phẩm trong module `cloud-inventory-new`, theo logic hiện tại:

- `barcode` thuộc về `variant`
- ảnh thuộc về `variant`
- `product` không còn lưu ảnh riêng
- `product/update` hỗ trợ `partial update`
- API media hoạt động theo `variantId`

## 1. Nguyên tắc dữ liệu hiện tại

### Product

`product` dùng để lưu các thông tin chung như:

- `id`
- `name`
- `categoryId`
- `description`
- `position`
- `status`
- `type`

### Variant

`variant` dùng để lưu:

- `sku`
- `barcode`
- `price`
- `pricePromo`
- `costPrice`
- `supplierId`
- `unitId`
- `images`

### Ảnh sản phẩm

Ảnh hiện tại chỉ gắn với `variant`.

Trong DB, bảng `product_media` đang được dùng theo quy ước:

- `product_media.product_id = variant.id`

Điều này là quy ước nội bộ hiện tại để tránh sửa DB.

## 2. API cập nhật sản phẩm

### Endpoint

`POST /api/product/update`

### Mục đích

Tạo mới hoặc cập nhật sản phẩm.

### Quy tắc

- Nếu không có `id`: tạo mới sản phẩm
- Nếu có `id`: cập nhật sản phẩm
- Khi cập nhật:
  - chỉ cần `id` của product là đủ
  - field nào gửi lên thì mới cập nhật
  - field nào không gửi thì giữ nguyên

### Quy tắc cho `variants`

- Nếu `variant.id` đã có: cập nhật variant
- Nếu chưa có `variant.id`: tạo mới variant
- Với variant đã có:
  - chỉ gửi field cần cập nhật
- Với variant mới:
  - nên gửi tối thiểu:
    - `sku`
    - `barcode`
    - `price`

### Quy tắc cho `variantGroups`

- Nếu gửi `variantGroups`: hệ thống upsert theo từng group
- Nếu một group chỉ gửi `id` + `name`: chỉ cập nhật tên group
- Nếu gửi `options`: chỉ upsert các option được truyền vào
- Các option không gửi vào sẽ không tự động bị xóa

### Body đầy đủ mẫu

```json
{
  "id": 1001,
  "name": "Áo thun nam",
  "position": 1,
  "status": 1,
  "categoryId": 12,
  "exchange": 1,
  "otherUnits": "[]",
  "type": "1",
  "description": "Mô tả sản phẩm",
  "variantGroups": [
    {
      "id": 21,
      "name": "Màu sắc",
      "key": "mau-sac",
      "options": [
        {
          "id": 201,
          "label": "Đỏ"
        },
        {
          "label": "Xanh"
        }
      ]
    },
    {
      "id": 22,
      "name": "Kích thước",
      "options": [
        {
          "id": 301,
          "label": "M"
        },
        {
          "id": 302,
          "label": "L"
        }
      ]
    }
  ],
  "variants": [
    {
      "id": 5001,
      "label": "Đỏ / M",
      "sku": "TS-RED-M",
      "barcode": "8938505974191",
      "unitId": 1,
      "price": 199000,
      "pricePromo": 179000,
      "supplierId": 1,
      "costPrice": 120000,
      "quantity": 10,
      "images": [
        "/upload/product/ts-red-m-1.jpg",
        "/upload/product/ts-red-m-2.jpg"
      ],
      "optionValueIds": [201, 301],
      "attributes": [
        {
          "name": "Màu sắc",
          "value": "Đỏ"
        },
        {
          "name": "Kích thước",
          "value": "M"
        }
      ]
    },
    {
      "id": 5002,
      "label": "Xanh / L",
      "sku": "TS-BLUE-L",
      "barcode": "8938505974192",
      "unitId": 1,
      "price": 209000,
      "pricePromo": 189000,
      "supplierId": 1,
      "costPrice": 125000,
      "images": [
        "/upload/product/ts-blue-l-1.jpg",
        "/upload/product/ts-blue-l-2.jpg"
      ],
      "optionValueIds": [202, 302]
    }
  ]
}
```

### Ví dụ cập nhật tối thiểu

#### Chỉ đổi tên sản phẩm

```json
{
  "id": 1001,
  "name": "Tên mới"
}
```

#### Chỉ đổi giá một variant

```json
{
  "id": 1001,
  "variants": [
    {
      "id": 5001,
      "price": 219000
    }
  ]
}
```

#### Chỉ đổi barcode một variant

```json
{
  "id": 1001,
  "variants": [
    {
      "id": 5001,
      "barcode": "8938505974999"
    }
  ]
}
```

#### Chỉ cập nhật ảnh của một variant

```json
{
  "id": 1001,
  "variants": [
    {
      "id": 5001,
      "images": [
        "/upload/product/new-1.jpg",
        "/upload/product/new-2.jpg"
      ]
    }
  ]
}
```

#### Chỉ đổi tên một nhóm biến thể

```json
{
  "id": 1001,
  "variantGroups": [
    {
      "id": 21,
      "name": "Màu sắc mới"
    }
  ]
}
```

#### Chỉ thêm hoặc cập nhật option trong nhóm biến thể

```json
{
  "id": 1001,
  "variantGroups": [
    {
      "id": 21,
      "options": [
        {
          "id": 201,
          "label": "Đỏ đậm"
        },
        {
          "label": "Xám"
        }
      ]
    }
  ]
}
```

## 3. Quy tắc cập nhật ảnh trong `product/update`

Field:

```json
"images": [
  "/upload/product/a1.jpg",
  "/upload/product/a2.jpg"
]
```

### Hành vi

- Nếu không truyền `images`: giữ nguyên ảnh cũ
- Nếu truyền `images`: thay toàn bộ danh sách ảnh của variant bằng danh sách mới
- Nếu truyền `images: []`: xóa toàn bộ ảnh của variant đó

### Ví dụ

Ảnh cũ:

```json
[
  "/img/old-1.jpg",
  "/img/old-2.jpg",
  "/img/old-3.jpg"
]
```

Request:

```json
{
  "id": 1001,
  "variants": [
    {
      "id": 5001,
      "images": [
        "/img/old-2.jpg",
        "/img/new-1.jpg"
      ]
    }
  ]
}
```

Kết quả:

```json
[
  "/img/old-2.jpg",
  "/img/new-1.jpg"
]
```

## 4. API lấy chi tiết sản phẩm

### Endpoint

`GET /api/product/get?id={productId}`

### Ý nghĩa dữ liệu trả về

- `code` của product: lấy từ `barcode` của `default variant`
- `avatar` của product: lấy từ ảnh đầu tiên của `default variant`
- `variants[].barcode`: barcode riêng của từng variant
- `variants[].images`: danh sách ảnh của từng variant

## 5. API danh sách sản phẩm

### Endpoint

`GET /api/product/list`

### Một số query thường dùng

- `keyword`
- `status`
- `categoryId`
- `page`
- `limit`

### Ý nghĩa dữ liệu trả về

- `code`: barcode của default variant
- `avatar`: ảnh đầu tiên của default variant
- `sku`: SKU của default variant

## 6. API media theo variant

Các API dưới đây vẫn giữ path cũ là `product-media`, nhưng hiện tại hoạt động theo `variantId`.

## 6.1. Danh sách ảnh của variant

### Endpoint

`GET /api/product-media/list?variantId={variantId}`

### Ví dụ

```text
GET /api/product-media/list?variantId=5001
```

### Kết quả

Trả danh sách ảnh của variant theo thứ tự `position`.

## 6.2. Upload ảnh cho variant

### Endpoint

`POST /api/product-media/upload`

### Content-Type

`multipart/form-data`

### Form Data

- `variantId`: bắt buộc
- `file`: một hoặc nhiều file

### Ví dụ

```text
variantId=5001
file=<binary>
file=<binary>
```

### Hành vi

- Upload thêm ảnh cho variant
- Ảnh mới sẽ được thêm vào danh sách ảnh hiện tại

## 6.3. Cập nhật một ảnh của variant

### Endpoint

`POST /api/product-media/update`

### Content-Type

`multipart/form-data`

### Form Data

- `id`: id của media, nếu cập nhật media cũ
- `variantId`: bắt buộc
- `position`: vị trí ảnh
- `status`: trạng thái, mặc định là `1`
- `file`: file ảnh mới

### Ví dụ

```text
id=123
variantId=5001
position=1
status=1
file=<binary>
```

### Hành vi

- Nếu có `id`: cập nhật ảnh tương ứng
- Nếu không có `id`: thêm ảnh mới

## 6.4. Xóa ảnh của variant

### Endpoint

`DELETE /api/product-media/delete?variantId={variantId}&id={mediaId}`

### Ví dụ

```text
DELETE /api/product-media/delete?variantId=5001&id=123
```

### Hành vi

- Xóa ảnh khỏi variant
- Hệ thống sẽ tự chuẩn hóa lại `position`

## 7. Khi nào nên dùng `product/update`, khi nào nên dùng `product-media/*`

### Dùng `product/update` khi

- cần cập nhật đồng thời nhiều thông tin sản phẩm
- cần cập nhật variant cùng với giá, barcode, ảnh
- cần thay toàn bộ danh sách ảnh của variant theo một mảng chuẩn

### Dùng `product-media/*` khi

- cần upload từng ảnh riêng lẻ
- cần xóa từng ảnh riêng lẻ
- cần đổi vị trí ảnh
- cần thao tác ảnh theo kiểu UI upload media

## 8. Gợi ý sử dụng chuẩn cho frontend

### Trường hợp form chỉnh sửa sản phẩm tổng thể

Nên dùng:

- `GET /api/product/get`
- `POST /api/product/update`

Lý do:

- dễ đồng bộ toàn bộ dữ liệu product + variant
- dễ kiểm soát danh sách ảnh cuối cùng của từng variant

### Trường hợp UI thư viện ảnh riêng

Nên dùng:

- `GET /api/product-media/list?variantId=...`
- `POST /api/product-media/upload`
- `POST /api/product-media/update`
- `DELETE /api/product-media/delete`

## 9. Lưu ý quan trọng

- `barcode` hiện tại thuộc về `variant`, không dùng `product.code` để cập nhật nữa
- ảnh hiện tại thuộc về `variant`, không dùng ảnh ở cấp `product`
- với `product/update`, field không truyền lên sẽ không bị ảnh hưởng
- với `variants[].images`:
  - có truyền thì thay toàn bộ
  - không truyền thì giữ nguyên
- với `variantGroups`:
  - có truyền `options` thì upsert các option được gửi
  - không truyền `options` thì không đụng vào danh sách option cũ

## 10. Checklist request hợp lệ

### Update product tối thiểu

```json
{
  "id": 1001
}
```

### Update variant tối thiểu

```json
{
  "id": 1001,
  "variants": [
    {
      "id": 5001
    }
  ]
}
```

### Tạo mới variant tối thiểu

```json
{
  "id": 1001,
  "variants": [
    {
      "sku": "SKU-MOI",
      "barcode": "8938505000001",
      "price": 150000
    }
  ]
}
```

## 11. Khuyến nghị triển khai

Để tránh sai dữ liệu:

- luôn lấy dữ liệu mới nhất bằng `GET /api/product/get`
- khi chỉnh toàn bộ sản phẩm, nên submit lại theo `POST /api/product/update`
- khi chỉ thao tác ảnh riêng lẻ trong màn hình media, dùng `product-media/*`

