# Backend Bugs: Kho hang — Phat hien tu Playwright Test

**Ngay:** 2026-04-11
**Test script:** `node tests/test-warehouse-crud.mjs`
**Branch FE:** reborn-retail

---

## BUG 1: API GET /warehouse/list KHONG tra ve truong `code` (CRITICAL)

**Hien trang:**
- Frontend gui `code` khi tao/update kho (POST /warehouse/update body co `code: "ABC123"`)
- Backend luu thanh cong (response code=0)
- Nhung GET /warehouse/list tra ve `code: null` cho TAT CA kho
- Ket qua: Danh sach kho hien "—" o cot Ma kho, va khi mo Edit lai cung khong thay ma kho

**Chung minh:**
```
API Response tu /warehouse/list:
  id=61 name="Kho Trung Ma" code=NULL    ← vua tao voi code="AA123"
  id=32 name="Kho hang mau" code=NULL    ← da co code="123456" tu truoc
```

**Ket qua mong doi:**
```json
{
  "id": 32,
  "name": "Kho hàng mẫu",
  "code": "123456",        ← PHAI tra ve code
  "address": "Hà Nội",
  "status": 1
}
```

**Can fix:**
- SELECT query trong `WarehouseRepository.getWhereCondition()` hoac tuong duong phai include truong `code`
- Kiem tra entity Warehouse co mapping `code` column khong

**Curl verify:**
```bash
curl -s "https://biz.reborn.vn/inventory/warehouse/list?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool | grep code
```

---

## BUG 2: API POST /warehouse/update KHONG validate ma kho trung (HIGH)

**Hien trang:**
- Kho "Kho hang mau" da co code="123456"
- Tao kho moi voi code="123456" → API tra ve code=0 (thanh cong)
- 2 kho co cung ma kho → gay nham lan khi quet barcode/QR

**Chung minh:**
```
POST /warehouse/update { name: "Kho Trung Ma", code: "123456" }
→ Response: { code: 0 }    ← PHAI reject vi ma trung
```

**Ket qua mong doi:**
```json
{
  "code": 1,
  "message": "Mã kho đã tồn tại. Vui lòng nhập mã khác."
}
```

**Can fix:**
- Trong `WarehouseService.createWarehouse()` va `updateWarehouse()`:
  - Truoc khi luu, check `SELECT COUNT(*) FROM warehouse WHERE code = :code AND id != :id`
  - Neu count > 0 → reject voi message "Ma kho da ton tai"
- Cho phep code = null/empty (khong bat buoc)

---

## BUG 3: API POST /warehouse/update KHONG luu truong `code` (HIGH)

**Hien trang:**
- Gui body `{ id: 32, code: "ABC123" }` → response code=0
- Nhung GET /warehouse/list van tra code=null
- Co the backend **khong map truong `code`** khi update

**Can kiem tra:**
- Entity `Warehouse.java` co truong `code` va `@Column` annotation khong?
- `WarehouseRepository` co update truong `code` khong?
- `WarehouseService.updateWarehouse()` co set `warehouse.setCode(request.getCode())` khong?

---

## BUG 4: API GET /warehouse/list KHONG tra ve truong `code` khi Edit (MEDIUM)

Lien quan den BUG 1. Khi user mo modal Edit:
- Frontend lay data tu `listWarehouse` (response cua /warehouse/list)
- `data.code` = null vi API khong tra
- Modal hien o code rong
- User tuong chua nhap ma → nhap lai → mat ma cu

**Can fix cung BUG 1** — include `code` trong response list.

---

## TOM TAT

| # | Bug | Muc do | Fix |
|---|-----|--------|-----|
| 1 | /warehouse/list khong tra `code` | CRITICAL | Include `code` trong SELECT query |
| 2 | Khong validate ma kho trung | HIGH | Check unique truoc khi luu |
| 3 | /warehouse/update khong luu `code` | HIGH | Map truong code khi update entity |
| 4 | Edit modal khong hien ma kho | MEDIUM | Fix cung BUG 1 |

**Frontend da san sang** — chi can backend tra ve `code` dung la FE se hien thi.
