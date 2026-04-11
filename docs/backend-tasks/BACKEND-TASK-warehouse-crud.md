# Backend Task: API CRUD Kho hang

## Muc tieu
Frontend da san sang goi API CRUD kho hang. Can backend tao cac endpoint tuong ung.

## Hien trang
- **GET** `/inventory/warehouse/list` — DA CO, hoat dong
- **POST** `/inventory/warehouse/create` — CHUA CO
- **POST** `/inventory/warehouse/update` — CHUA CO
- **DELETE** `/inventory/warehouse/delete/{id}` — CHUA CO

## Nghiep vu xoa kho (QUAN TRONG)

Frontend da xu ly 2 luong rieng biet:

### Luong 1: Kho TRANG (chua co giao dich nao)
```
User click "Xoa" → FE kiem tra ton kho (GET /warehouse/product/list)
  → Khong co SP → Dialog "Xoa vinh vien?"
    → User xac nhan → FE goi DELETE /warehouse/delete/{id}
      → BE xoa cung khoi DB
```

### Luong 2: Kho DA CO giao dich (co ton kho, phieu nhap/xuat, lich su)
```
User click "Xoa" → FE kiem tra ton kho
  → Co SP → Dialog "Kho da co giao dich, chi co the Ngung su dung"
    → User xac nhan → FE goi POST /warehouse/update { id, status: 0 }
      → BE doi status = 0 (Ngung su dung), GIU NGUYEN du lieu
```

### Backend PHAI rang buoc them (defense in depth):

**DELETE /warehouse/delete/{id}:**
```
1. Kiem tra kho co ton tai khong → 404 neu khong
2. Kiem tra ton kho (inventoryBalance) co record nao quantity > 0 khong
   → Co → tra { code: 1, message: "Kho đang có hàng tồn. Không thể xóa." }
3. Kiem tra co phieu nhap/xuat/chuyen kho trang thai "Cho duyet" khong
   → Co → tra { code: 1, message: "Kho đang có phiếu chưa xử lý." }
4. Kiem tra co BAT KY giao dich lich su nao khong (phieu da duyet trong qua khu)
   → Co → tra { code: 1, message: "Kho đã có lịch sử giao dịch. Chỉ có thể ngừng sử dụng." }
5. Tat ca deu khong → XOA CUNG khoi DB
```

**POST /warehouse/update (status = 0):**
```
1. Kiem tra kho co ton tai khong → 404 neu khong
2. Cap nhat status = 0 (Ngung su dung)
3. Kho status = 0 KHONG hien thi trong dropdown chon kho khi tao phieu
4. Kho status = 0 VAN hien thi trong danh sach kho (de admin quan ly)
5. Du lieu lich su GIU NGUYEN — khong xoa gi
```

## Chi tiet API

### 1. POST /inventory/warehouse/create

**Request:**
```json
{
  "name": "Ten kho",          // bat buoc
  "address": "Dia chi kho",   // tuy chon
  "code": "MA_KHO"            // tuy chon, tu dong tao neu trong
}
```

**Response thanh cong:**
```json
{
  "code": 0,
  "message": "Thêm kho thành công",
  "result": { "id": 123, "name": "Ten kho", "status": 1 }
}
```

### 2. POST /inventory/warehouse/update

**Request:**
```json
{
  "id": 123,                  // bat buoc
  "name": "Ten moi",          // tuy chon
  "address": "Dia chi moi",   // tuy chon
  "status": 0                 // 1 = Hoat dong, 0 = Ngung su dung
}
```

### 3. DELETE /inventory/warehouse/delete/{id}

**Response thanh cong (kho trang):**
```json
{ "code": 0, "message": "Đã xóa kho hàng" }
```

**Response tu choi (kho co giao dich):**
```json
{ "code": 1, "message": "Kho đã có lịch sử giao dịch. Chỉ có thể ngừng sử dụng." }
```

## Gia tri status

| Status | Y nghia | Hien trong DS kho | Hien trong dropdown chon kho |
|:------:|---------|:-----------------:|:----------------------------:|
| 1 | Dang hoat dong | Co | Co |
| 0 | Ngung su dung | Co (ghi ro trang thai) | **KHONG** |

## Curl verify

```bash
TOKEN="..."
API="https://biz.reborn.vn"

# Tao kho
curl -s -X POST "$API/inventory/warehouse/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kho Test","address":"Ha Noi"}' | python -m json.tool

# Ngung su dung kho (kho co giao dich)
curl -s -X POST "$API/inventory/warehouse/update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":123,"status":0}' | python -m json.tool

# Xoa cung kho (kho trang)
curl -s -X DELETE "$API/inventory/warehouse/delete/123" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
```

## Thay doi frontend da thuc hien

| File | Thay doi |
|------|----------|
| `src/configs/urls.ts` | Them `warehouse.create`, `.update`, `.delete` |
| `src/services/WarehouseService.ts` | Them `create()`, `update()`, `delete()`, `deactivate()` |
| `src/pages/ProductImport/WarehouseList/WarehouseListPage.tsx` | Logic xoa 2 luong: kho trang → xoa cung, kho co GD → ngung su dung. Dialog khac nhau cho tung truong hop |
