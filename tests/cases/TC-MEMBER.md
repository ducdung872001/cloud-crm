# TC-MEMBER — Testcases Quan ly Thanh vien

## TC-MEMBER-001: Tao thanh vien moi

| | |
|---|---|
| **Module** | Thanh vien (Member) |
| **Muc do** | Critical |
| **Dieu kien** | Da dang nhap voi quyen Admin/Tiep tan |

**Buoc thuc hien:**
1. Truy cap menu "Thanh vien"
2. Click nut "Them moi"
3. Dien thong tin: Ho ten, SDT, Email, Gioi tinh, Ngay sinh
4. Chon goi thanh vien (Basic/Standard/Premium)
5. Click "Luu"

**Ket qua mong doi:**
- Thanh vien moi xuat hien trong danh sach
- API POST /adminapi/customer tao thanh cong (code: 0)
- Toast "Them thanh vien thanh cong"

**Script tu dong:** `node tests/test-member-crud.mjs` (Test 1)

---

## TC-MEMBER-002: Xem chi tiet thanh vien

| | |
|---|---|
| **Module** | Thanh vien (Member) |
| **Muc do** | High |
| **Dieu kien** | Co it nhat 1 thanh vien trong he thong |

**Buoc thuc hien:**
1. Truy cap danh sach thanh vien
2. Click vao ten thanh vien bat ky

**Ket qua mong doi:**
- Trang chi tiet hien thi day du: thong tin ca nhan, goi thanh vien, lich su check-in, dich vu da dung
- API GET /adminapi/customer/{id} tra ve du lieu dung

**Script tu dong:** `node tests/test-member-crud.mjs` (Test 2)

---

## TC-MEMBER-003: Cap nhat thong tin thanh vien

| | |
|---|---|
| **Module** | Thanh vien (Member) |
| **Muc do** | High |
| **Dieu kien** | Co it nhat 1 thanh vien trong he thong |

**Buoc thuc hien:**
1. Mo chi tiet thanh vien
2. Click "Sua"
3. Thay doi SDT hoac Email
4. Click "Luu"

**Ket qua mong doi:**
- Thong tin duoc cap nhat thanh cong
- API PUT /adminapi/customer tra ve code: 0
- Toast "Cap nhat thanh cong"

**Script tu dong:** `node tests/test-member-crud.mjs` (Test 3)

---

## TC-MEMBER-004: Xoa thanh vien

| | |
|---|---|
| **Module** | Thanh vien (Member) |
| **Muc do** | Medium |
| **Dieu kien** | Co thanh vien test (khong phai du lieu that) |

**Buoc thuc hien:**
1. Chon thanh vien trong danh sach
2. Click "Xoa"
3. Xac nhan xoa

**Ket qua mong doi:**
- Thanh vien bi xoa khoi danh sach
- API DELETE /adminapi/customer/{id} tra ve code: 0

**Script tu dong:** `node tests/test-member-crud.mjs` (Test 4)

---

## TC-MEMBER-005: Tim kiem thanh vien

| | |
|---|---|
| **Module** | Thanh vien (Member) |
| **Muc do** | High |
| **Dieu kien** | Co du lieu thanh vien |

**Buoc thuc hien:**
1. Nhap ten hoac SDT vao o tim kiem
2. Nhan Enter hoac click tim kiem

**Ket qua mong doi:**
- Danh sach loc dung theo keyword
- API GET /adminapi/customer?keyword=... tra ve ket qua phu hop

**Script tu dong:** `node tests/test-member-crud.mjs` (Test 5)
