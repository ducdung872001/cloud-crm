# Backend Task: Xoa don vi san pham an toan

## Muc tieu
Don vi tinh (Unit) dang duoc dung trong bien the san pham. Xoa DVT dang duoc tham chieu se lam mat rang buoc du lieu. Can validate 2 tang FE + BE.

## Nghiep vu

### DELETE /unit/delete?id=X

**Backend PHAI kiem tra truoc khi xoa:**

```
a. DVT co ton tai? → 404 neu khong
b. DVT co dang duoc dung trong bien the san pham (product_variant.unitId = X)?
   → CO: reject { code: 1, message: "Đơn vị đang được sử dụng trong biến thể sản phẩm. Chỉ có thể ngừng sử dụng." }
c. DVT co dang duoc dung trong san pham (product.unitId = X)?
   → CO: reject tuong tu
d. DVT co dang duoc dung trong phieu nhap/xuat/don hang (invoice_detail.unitId)?
   → CO: reject tuong tu
e. DVT khong co tham chieu nao?
   → Xoa cung (hard delete)
```

### POST /unit/update (status = 0)

- Cap nhat status = 0 (Ngung su dung)
- DVT status=0 KHONG hien trong dropdown chon DVT khi tao/sua SP
- DVT status=0 VAN hien trong danh sach quan ly
- SP dang dung DVT nay KHONG bi anh huong

## Frontend da xu ly

**File:** `src/pages/SettingSell/partials/ProductUnit/ProductUnitList.tsx`

**Logic:**
```
User click xoa DVT
  → Dialog: "Xoa DVT [Ten]?"
    → Click Xoa → goi DELETE /unit/delete?id=X
      → Backend code=0 → xoa thanh cong
      → Backend code=1 (dang duoc dung) → Toast warning
        → Dialog: "Khong the xoa. Chuyen Ngung su dung?"
          → Click "Ngung su dung" → POST /unit/update { id, status: 0 }
```

**Xoa hang loat:** Tung DVT — xoa duoc thi xoa, khong thi chuyen ngung su dung.

## Curl verify

```bash
# Xoa DVT (backend kiem tra tham chieu)
curl -X DELETE "$API/unit/delete?id=5" \
  -H "Authorization: Bearer $TOKEN"

# Ngung su dung DVT
curl -X POST "$API/unit/update" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":5,"status":0,"name":"Cái","position":0,"bsnId":1}'
```

## Query kiem tra tham chieu (goi y cho BE)

```sql
-- Check DVT co dang duoc dung trong san pham
SELECT COUNT(*) FROM product WHERE unit_id = :unitId;

-- Check DVT co dang duoc dung trong bien the
SELECT COUNT(*) FROM product_variant WHERE unit_id = :unitId;

-- Check DVT co trong chi tiet phieu/don hang
SELECT COUNT(*) FROM invoice_detail WHERE unit_id = :unitId;
SELECT COUNT(*) FROM order_detail WHERE unit_id = :unitId;

-- Neu bat ky count > 0 → reject xoa, chi cho ngung su dung
```
