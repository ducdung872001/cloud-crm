# Hướng dẫn FE sử dụng Product Media

Tài liệu này mô tả cách Frontend làm việc với phần ảnh sản phẩm trong inventory.

## 1. Upload hoặc cập nhật ảnh sản phẩm

API:

`POST /inventory/product-media/update`

Content-Type:

`multipart/form-data`

### Các field FE cần gửi

- `productId`: `number`, bắt buộc
- `file`: `File`, bắt buộc, có thể gửi nhiều field cùng tên `file`
- `position`: `number`, không bắt buộc, mặc định `0`
- `status`: `number`, không bắt buộc, mặc định `1`
- `id`: `number`, không bắt buộc

### Ý nghĩa field `id`

- Nếu không truyền `id`: backend sẽ thêm mới ảnh
- Nếu có truyền `id`: backend sẽ update bản ghi ảnh đầu tiên theo `id`
- Nếu gửi nhiều file và có `id`: file đầu tiên update theo `id`, các file sau sẽ được thêm mới

### Cách gửi nhiều ảnh

FE cần append nhiều lần cùng một key `file`.

Ví dụ:

```js
const formData = new FormData();
formData.append("productId", 123);
formData.append("position", 0);
formData.append("status", 1);

files.forEach((file) => {
  formData.append("file", file);
});

await axios.post("/inventory/product-media/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

### Ví dụ update 1 ảnh có sẵn

```js
const formData = new FormData();
formData.append("id", 10);
formData.append("productId", 123);
formData.append("position", 0);
formData.append("status", 1);
formData.append("file", file);

await axios.post("/inventory/product-media/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

## 2. Lấy danh sách ảnh của sản phẩm

API nội bộ:

`GET /inventory/product-media/list?productId={productId}&limit=20&offset=0`

API public:

`GET /inventory/public/product/media/list?productId={productId}&limit=20&offset=0`

### Response item

Mỗi phần tử trong danh sách có dạng:

```json
{
  "id": 1,
  "position": 0,
  "status": 1,
  "url": "tmp/upload/abc123"
}
```

### Các field trả về

- `id`: id bản ghi media
- `position`: vị trí sắp xếp
- `status`: trạng thái
- `url`: đường dẫn file đang lưu

### Ví dụ gọi API

```js
const res = await axios.get("/inventory/product-media/list", {
  params: {
    productId: 123,
    limit: 20,
    offset: 0
  }
});

const mediaList = res.data?.data || [];
```

## 3. Xóa ảnh

API:

`DELETE /inventory/product-media/delete?productId={productId}&id={mediaId}`

### Ví dụ gọi API

```js
await axios.delete("/inventory/product-media/delete", {
  params: {
    productId: 123,
    id: 10
  }
});
```

## 4. Flow FE nên dùng

### Flow upload nhiều ảnh

1. Người dùng chọn nhiều ảnh
2. FE tạo `FormData`
3. FE append `productId`, `position`, `status`
4. FE append nhiều lần key `file`
5. FE gọi `POST /inventory/product-media/update`
6. Sau khi upload xong, FE gọi lại API list để reload gallery

### Flow update 1 ảnh

1. FE biết `mediaId` của ảnh cần sửa
2. FE tạo `FormData`
3. FE append `id`, `productId`, `file`
4. FE gọi `POST /inventory/product-media/update`
5. FE gọi lại API list để lấy dữ liệu mới nhất

### Flow xóa ảnh

1. FE gọi `DELETE /inventory/product-media/delete`
2. FE gọi lại API list để reload gallery

## 5. Lưu ý quan trọng

Hiện tại trường `url` chưa phải URL public ổn định để FE gắn trực tiếp vào thẻ `<img />`.

`url` đang là đường dẫn file upload tạm trên server.

Điều đó có nghĩa là:

- FE có thể upload ảnh
- FE có thể lấy danh sách media
- FE có thể xóa media
- Nhưng chưa có endpoint public ổn định để browser render ảnh trực tiếp từ `url`

## 6. Kết luận hiện trạng

Backend hiện đã hỗ trợ:

- upload nhiều ảnh bằng `form-data`
- lấy danh sách media theo sản phẩm
- xóa media

Backend chưa hoàn thiện phần serve ảnh public. Nếu FE cần hiển thị ảnh trực tiếp trên UI production thì backend cần làm thêm một trong hai hướng:

- tạo API trả binary ảnh
- hoặc upload file lên storage cố định/CDN rồi lưu URL public vào DB
