# Hướng dẫn FE sử dụng `product/update` để lưu avatar

Tài liệu này mô tả cách Frontend gọi API `product/update` của module `inventory-new` để lưu ảnh đại diện (`avatar`) trực tiếp, theo cách tương tự API `product-media`.

## 1. API áp dụng

API:

`POST /inventory/product/update`

Hỗ trợ 2 cách gọi:

- `application/json`: dùng khi không upload file avatar
- `multipart/form-data`: dùng khi cần upload avatar mới

Nếu FE cần lưu ảnh đại diện, nên dùng:

`multipart/form-data`

## 2. Nguyên tắc hoạt động của backend

- Nếu request có file upload, backend sẽ lấy file đầu tiên trong request để lưu vào `product.avatar`
- Giá trị lưu xuống DB là đường dẫn file upload đã được chuẩn hóa theo dạng:

`tmp/...` hoặc đường dẫn nội bộ tương đương do server trả về

- Các field text khác của sản phẩm vẫn được gửi cùng request `product/update`
- Nếu không có file upload, backend vẫn xử lý như luồng update sản phẩm thông thường

## 3. Các field FE cần gửi khi dùng `multipart/form-data`

### Field cơ bản

- `id`: `number`, không bắt buộc khi thêm mới, bắt buộc khi cập nhật
- `name`: `string`, không bắt buộc nếu chỉ cập nhật một phần
- `categoryId`: `number`, không bắt buộc
- `unitId`: `number`, không bắt buộc
- `status`: `number`, không bắt buộc
- `position`: `number`, không bắt buộc
- `type`: `string`, không bắt buộc
- `description`: `string`, không bắt buộc
- `productLine`: `string`, không bắt buộc
- `price`: `number`, không bắt buộc
- `pricePromo`: `number`, không bắt buộc
- `priceWholesale`: `number`, không bắt buộc
- `costPrice`: `number`, không bắt buộc
- `supplierId`: `number`, không bắt buộc
- `exchange`: `number`, không bắt buộc
- `otherUnits`: `string`, không bắt buộc

### Field avatar

- `avatar`: `File`, không bắt buộc nhưng nên dùng đúng tên này để FE dễ hiểu

Lưu ý:

- Backend hiện lấy file upload đầu tiên trong request làm avatar
- Vì vậy FE chỉ nên gửi 1 file avatar trong request này
- Không nên gửi kèm nhiều file trong `product/update`

### Field dạng danh sách/object

Các field JSON cần được `JSON.stringify(...)` trước khi append vào `FormData`:

- `variantGroups`
- `variants`

## 4. Ví dụ FE cập nhật sản phẩm kèm avatar

```js
const formData = new FormData();

formData.append("id", 123);
formData.append("name", "Áo thun cổ tròn");
formData.append("categoryId", 10);
formData.append("unitId", 2);
formData.append("status", 1);
formData.append("position", 0);
formData.append("type", "1");
formData.append("description", "Mô tả sản phẩm");
formData.append("productLine", "SKU-AT-001");
formData.append("price", 150000);
formData.append("pricePromo", 120000);
formData.append("priceWholesale", 130000);
formData.append("costPrice", 90000);
formData.append("supplierId", 5);
formData.append("exchange", 1);
formData.append("otherUnits", "");

if (avatarFile) {
  formData.append("avatar", avatarFile);
}

await axios.post("/inventory/product/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

## 5. Ví dụ FE thêm mới sản phẩm kèm avatar

```js
const formData = new FormData();

formData.append("name", "Giày thể thao");
formData.append("categoryId", 8);
formData.append("unitId", 1);
formData.append("status", 1);
formData.append("type", "1");
formData.append("price", 350000);

if (avatarFile) {
  formData.append("avatar", avatarFile);
}

await axios.post("/inventory/product/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

## 6. Ví dụ có biến thể

Khi có `variantGroups` hoặc `variants`, FE cần stringify trước khi append:

```js
const formData = new FormData();

formData.append("id", 123);
formData.append("name", "Áo polo");
formData.append("unitId", 1);
formData.append("price", 220000);

formData.append(
  "variantGroups",
  JSON.stringify([
    {
      id: 1,
      name: "Màu sắc",
      options: [
        { id: 11, label: "Đỏ" },
        { id: 12, label: "Xanh" }
      ]
    }
  ])
);

formData.append(
  "variants",
  JSON.stringify([
    {
      id: 1001,
      sku: "POLO-DO",
      optionValueIds: [11],
      price: 220000
    },
    {
      id: 1002,
      sku: "POLO-XANH",
      optionValueIds: [12],
      price: 225000
    }
  ])
);

if (avatarFile) {
  formData.append("avatar", avatarFile);
}

await axios.post("/inventory/product/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

## 7. Trường hợp chỉ đổi avatar

Nếu FE chỉ muốn đổi ảnh đại diện, có thể gửi tối thiểu:

```js
const formData = new FormData();
formData.append("id", 123);
formData.append("avatar", avatarFile);

await axios.post("/inventory/product/update", formData, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
```

Backend sẽ:

- tìm sản phẩm theo `id`
- lấy file upload đầu tiên
- cập nhật lại `product.avatar`
- giữ nguyên các field khác nếu FE không truyền

## 8. Response FE nhận được

API vẫn trả về object sản phẩm như luồng `product/update` hiện tại.

FE nên lấy:

- `data.id`: id sản phẩm
- `data.avatar`: đường dẫn avatar mới sau khi lưu

Ví dụ:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Áo thun cổ tròn",
    "avatar": "tmp/upload/abc123"
  }
}
```

## 9. Lưu ý quan trọng cho FE

- Nên dùng `multipart/form-data` khi có upload avatar
- Chỉ nên gửi 1 file avatar trong request `product/update`
- Các field mảng/object phải `JSON.stringify(...)` trước khi append
- Nếu không đổi avatar, FE có thể tiếp tục dùng request JSON như cũ
- Nếu chỉ cần quản lý gallery nhiều ảnh, vẫn dùng `product-media`
- `product/update` chỉ phù hợp cho ảnh đại diện của sản phẩm

## 10. Khuyến nghị flow FE

### Flow cập nhật đầy đủ sản phẩm + avatar

1. FE mở form chỉnh sửa sản phẩm
2. Người dùng thay đổi thông tin text
3. Người dùng chọn 1 ảnh đại diện mới
4. FE tạo `FormData`
5. FE append các field text
6. FE append file `avatar`
7. FE gọi `POST /inventory/product/update`
8. FE reload lại chi tiết sản phẩm

### Flow chỉ thay ảnh đại diện

1. FE tạo `FormData`
2. FE append `id`
3. FE append file `avatar`
4. FE gọi `POST /inventory/product/update`
5. FE cập nhật lại ảnh trên UI theo response mới

## 11. Kết luận

Frontend có thể dùng trực tiếp `POST /inventory/product/update` để:

- thêm mới sản phẩm kèm avatar
- cập nhật sản phẩm kèm avatar
- chỉ thay riêng avatar

Nếu cần quản lý nhiều ảnh chi tiết của sản phẩm, FE tiếp tục dùng nhóm API:

- `POST /inventory/product-media/update`
- `GET /inventory/product-media/list`
- `DELETE /inventory/product-media/delete`
