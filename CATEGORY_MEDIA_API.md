# API Ảnh Danh Mục

## Mục đích

Bộ API này dùng để quản lý ảnh đại diện của danh mục.

Khác với `product-media`, mỗi danh mục chỉ có duy nhất `1` ảnh.
Ảnh được lưu trực tiếp vào cột `avatar` của bảng `category_item`.

## Thông tin chung

- Base URL: `/inventory`
- Nhóm endpoint: `category-media`
- Yêu cầu xác thực: Có
- Yêu cầu phân quyền:
  - `VIEW` với API lấy ảnh
  - `UPDATE` với API thêm/sửa ảnh
  - `DELETE` với API xóa ảnh

## Cấu trúc response

Các API trả về object dạng:

```json
{
  "categoryId": 12,
  "url": "/uploads/category/abc.jpg",
  "status": 1
}
```

Ý nghĩa các trường:

- `categoryId`: ID của danh mục
- `url`: đường dẫn ảnh hiện tại của danh mục
- `status`:
  - `1`: danh mục đang có ảnh
  - `0`: danh mục chưa có ảnh

## 1. Lấy ảnh danh mục

- Method: `GET`
- Endpoint: `/inventory/category-media/get`

### Query params

- `categoryId`: ID danh mục

### Ví dụ request

```http
GET /inventory/category-media/get?categoryId=12
```

### Ví dụ response

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "categoryId": 12,
    "url": "/uploads/category/abc.jpg",
    "status": 1
  }
}
```

## 2. Thêm hoặc cập nhật ảnh danh mục

- Method: `POST`
- Endpoint: `/inventory/category-media/update`
- Content-Type: `multipart/form-data`

### Form params

- `categoryId`: ID danh mục
- file upload: ảnh cần cập nhật

### Ghi chú

- Nếu upload nhiều file, hệ thống chỉ lấy file đầu tiên.
- API này dùng cho cả thêm mới và thay thế ảnh cũ.

### Ví dụ request

```http
POST /inventory/category-media/update?categoryId=12
Content-Type: multipart/form-data
```

### Ví dụ response

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "categoryId": 12,
    "url": "/uploads/category/new-image.jpg",
    "status": 1
  }
}
```

## 3. Upload ảnh danh mục

- Method: `POST`
- Endpoint: `/inventory/category-media/upload`
- Content-Type: `multipart/form-data`

### Form params

- `categoryId`: ID danh mục
- file upload: ảnh cần tải lên

### Ghi chú

- Chức năng thực tế tương tự API `update`
- Nếu danh mục đã có ảnh, ảnh cũ sẽ bị thay thế bằng ảnh mới
- Nếu upload nhiều file, hệ thống chỉ lấy file đầu tiên

### Ví dụ request

```http
POST /inventory/category-media/upload?categoryId=12
Content-Type: multipart/form-data
```

### Ví dụ response

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "categoryId": 12,
    "url": "/uploads/category/uploaded-image.jpg",
    "status": 1
  }
}
```

## 4. Xóa ảnh danh mục

- Method: `DELETE`
- Endpoint: `/inventory/category-media/delete`

### Query params

- `categoryId`: ID danh mục

### Ghi chú

- API này không xóa bản ghi danh mục
- Hệ thống chỉ xóa giá trị `avatar` của danh mục

### Ví dụ request

```http
DELETE /inventory/category-media/delete?categoryId=12
```

### Ví dụ response

```json
{
  "status": 1,
  "message": "success",
  "data": {
    "categoryId": 12,
    "url": null,
    "status": 0
  }
}
```

## Rule xử lý

- Danh mục phải tồn tại và thuộc đúng `bsnId` của người dùng đăng nhập
- Chỉ áp dụng cho danh mục loại `category`
- Mỗi danh mục chỉ lưu `1` ảnh
- Ảnh được lưu tại trường `category_item.avatar`

## Các lỗi có thể gặp

- `Danh mục không tồn tại`
- `Bạn chưa tải ảnh lên`

