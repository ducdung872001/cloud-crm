# API Bật Tắt Hiển Thị Sản Phẩm Trên Website

## Mục đích

API này dùng để bật hoặc tắt trạng thái hiển thị sản phẩm trên website.

Trường dữ liệu được cập nhật là:

- `show_on_website` của bảng `product`

Khi sản phẩm được bật hiển thị, các API public dành cho website có thể lấy ra sản phẩm đó.
Khi sản phẩm bị tắt hiển thị, sản phẩm sẽ không còn xuất hiện trong danh sách public.

## API chính sử dụng

- Method: `POST`
- Endpoint: `/inventory/product/update/website-toggle`

## Yêu cầu

- Cần đăng nhập
- Cần quyền `UPDATE` với nhóm `/product/`

## Request body

API nhận body kiểu JSON.

Ví dụ:

```json
{
  "productId": 101,
  "showOnWebsite": 1
}
```

## Ý nghĩa dữ liệu

- `productId`: ID sản phẩm cần cập nhật
- `showOnWebsite`:
  - `1`: hiển thị sản phẩm trên website
  - `0`: ẩn sản phẩm khỏi website

## Ví dụ sử dụng

### 1. Bật hiển thị sản phẩm trên website

```http
POST /inventory/product/update/website-toggle
Content-Type: application/json
```

```json
{
  "productId": 101,
  "showOnWebsite": 1
}
```

Ví dụ response:

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "id": 101,
    "showOnWebsite": 1
  }
}
```

### 2. Tắt hiển thị sản phẩm trên website

```http
POST /inventory/product/update/website-toggle
Content-Type: application/json
```

```json
{
  "productId": 101,
  "showOnWebsite": 0
}
```

Ví dụ response:

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "id": 101,
    "showOnWebsite": 0
  }
}
```

## API kiểm tra trạng thái hiển thị hiện tại

Nếu cần đọc cấu hình hiện tại của sản phẩm, dùng:

- Method: `GET`
- Endpoint: `/inventory/product/website-setting/get`

Ví dụ:

```http
GET /inventory/product/website-setting/get?productId=101
```

Response sẽ chứa `showOnWebsite` cùng các cấu hình website khác của sản phẩm.

## API cập nhật cấu hình website đầy đủ

Nếu cần cập nhật nhiều cấu hình website cùng lúc, dùng:

- Method: `POST`
- Endpoint: `/inventory/product/website-setting/update`

API này phù hợp khi ngoài `showOnWebsite` bạn còn cần cập nhật thêm:

- hiển thị hình ảnh
- hiển thị đơn vị
- hiển thị mô tả
- hiển thị giá khuyến mãi
- hiển thị tồn kho
- ẩn khi hết hàng

## Liên hệ với API public

Các API public lấy sản phẩm hiển thị trên website chỉ lấy những sản phẩm có:

- `show_on_website = 1`

Ví dụ API public:

- `GET /inventory/public/product/list`
- `GET /inventory/public/product/get`

Nói ngắn gọn:

- Muốn sản phẩm xuất hiện ở website: gọi `update/website-toggle` với `showOnWebsite = 1`
- Muốn sản phẩm biến mất khỏi website: gọi `update/website-toggle` với `showOnWebsite = 0`

## Quy trình khuyến nghị

### Khi muốn đưa sản phẩm lên website

1. Tạo hoặc cập nhật đầy đủ thông tin sản phẩm
2. Upload ảnh sản phẩm nếu cần
3. Gọi API:

```json
{
  "productId": 101,
  "showOnWebsite": 1
}
```

4. Kiểm tra lại bằng API public `product/list`

### Khi muốn ẩn sản phẩm khỏi website

1. Gọi API:

```json
{
  "productId": 101,
  "showOnWebsite": 0
}
```

2. Kiểm tra lại bằng API public `product/list`

## Lưu ý

- API này chỉ bật hoặc tắt khả năng hiển thị trên website
- API này không xóa sản phẩm
- API này không thay đổi giá, tồn kho hay trạng thái kinh doanh
- Nếu sản phẩm không xuất hiện ở website dù đã bật `showOnWebsite = 1`, cần kiểm tra thêm:
  - sản phẩm có đúng dữ liệu public cần thiết hay không
  - điều kiện lọc ở API public
  - trạng thái tồn kho hoặc cấu hình ẩn khi hết hàng nếu frontend đang áp thêm rule

