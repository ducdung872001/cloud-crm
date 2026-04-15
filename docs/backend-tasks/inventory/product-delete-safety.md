# Backend Task: Xoa san pham + bien the an toan

## Muc tieu
Dam bao xoa san pham va bien the khong lam mat du lieu giao dich. Frontend da xu ly 2 luong, backend can validate lai (defense in depth).

## Nghiep vu

### 1. XOA SAN PHAM (DELETE /product/delete?id=X)

**Backend PHAI kiem tra truoc khi xoa:**

```
a. SP co ton tai? → 404 neu khong
b. SP co bien the nao co giao dich? (inventory_balance qty > 0, hoac inventory_transaction co record)
   → CO: reject { code: 1, message: "San pham da co giao dich. Chi co the ngung hoat dong." }
c. SP co don hang/phieu nhap/phieu xuat lien quan?
   → CO: reject tuong tu
d. SP co bien the nhung CHUA co giao dich?
   → Xoa cung SP + tat ca bien the (cascade delete)
e. SP khong co bien the, khong co GD?
   → Xoa cung
```

**Frontend da xu ly:**
- Goi DELETE → neu code=0 → xoa thanh cong
- Neu code!=0 → hien dialog "Ngung hoat dong?" → goi POST /product/updateStatus { id, status: 0 }

### 2. XOA BIEN THE (DELETE /product/variant/delete?productId=X&variantId=Y)

**Backend PHAI kiem tra:**

```
a. Bien the co giao dich? (inventory_balance, inventory_transaction, invoice_detail, order_detail)
   → CO: reject { code: 1, message: "Bien the da co giao dich. Chi co the ngung hoat dong." }
b. Bien the chua co GD?
   → Xoa cung
c. SP chi con 1 bien the va bien the do co GD?
   → reject (khong cho xoa bien the cuoi cung neu co GD)
```

**Frontend da xu ly (AddProductPage.tsx dong 1153-1166):**
- Goi DELETE → neu code=0 → reload detail
- Neu code!=0 → hien toast loi tu `res.error ?? res.message`

### 3. NGUNG HOAT DONG (POST /product/updateStatus)

**Request:**
```json
{ "id": 123, "status": 0 }
```

**Backend:**
- Status 0 = Ngung hoat dong
- SP status=0 KHONG hien trong POS, don hang moi
- SP status=0 VAN hien trong danh sach quan ly (de admin quan ly)
- Du lieu lich su GIU NGUYEN

**API da co:** `POST /inventory/product/update-status` (urlsApi.product.wUpdateStatus)

## Gia tri status

| Status | Y nghia | POS | Danh sach quan ly | Don hang moi |
|:------:|---------|:---:|:-----------------:|:------------:|
| 1 | Dang ban | Co | Co | Co |
| 2 | Tam dung | Khong | Co | Khong |
| 0 | Ngung hoat dong | Khong | Co | Khong |

## Frontend da thay doi

| File | Thay doi |
|------|----------|
| `ProductList.tsx` | `onHardDelete()` goi DELETE, neu reject → hien dialog "Ngung hoat dong". `onDeleteAll()` xu ly tung SP. `showDialogConfirmDelete()` hien so bien the |
| `AddProductPage.tsx` | Xoa bien the da doc `res.error ?? res.message` |

## Curl verify

```bash
# Xoa SP (backend kiem tra GD)
curl -X DELETE "$API/inventory/product/delete?id=123" \
  -H "Authorization: Bearer $TOKEN"

# Xoa bien the
curl -X DELETE "$API/inventory/product/variant/delete?productId=123&variantId=456" \
  -H "Authorization: Bearer $TOKEN"

# Ngung hoat dong SP
curl -X POST "$API/inventory/product/update-status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":123,"status":0}'
```
