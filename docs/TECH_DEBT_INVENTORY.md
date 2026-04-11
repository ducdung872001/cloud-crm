# TECH DEBT — Phan he Kho (Inventory)

**Ngay phat hien:** 2026-04-11
**Phat hien boi:** Playwright auto test (test-inventory-full.mjs)
**Ket qua test:** 37/53 PASS (70%) | 16 FAIL

---

## CRITICAL — Can fix truoc khi ban giao

### TD-INV-001: Filter dropdown khong dong sach — che cac nut khac

**Mo ta:** Khi click filter "Kho hang" trong trang So kho (`/inventory`), dropdown mo ra. Sau khi bam Escape, dropdown dong nhung **overlay van con** — cac nut "Khoang thoi gian", "Xuat Excel" bi vo hieu hoa.

**Anh huong:** 6 trang: So kho, Phieu nhap, Ton kho SP, SP da ban, Don tam, Kiem ke
**So test fail:** 8 tests (SK-004, SK-005, SK-006, PN-002 x3, NK-003 x3)

**File lien quan:**
- Component filter dropdown chung (tim trong `components/`)
- Co the lien quan den z-index hoac event propagation

**De xuat fix:**
- Kiem tra component filter dropdown — dam bao `onClose` remove het overlay
- Hoac dung `pointer-events: none` cho overlay khi dropdown dong

**Muc do:** CRITICAL — Chuc nang loc bi hong → user khong loc duoc du lieu

---

### TD-INV-002: Modal "Them san pham" khong mo trong phieu nhap/dieu chinh

**Mo ta:** Click nut "Them san pham" trong:
- Tao phieu nhap (`/create_inventory`)
- Dieu chinh kho (`/adjustment_slip`)

→ Modal KHONG xuat hien

**Nguyen nhan:** Co the bi `modal-backdrop` tu modal "Chon vai tro" van con trong DOM, che mat click. Hoac modal chua duoc mount.

**File lien quan:**
- `src/pages/ProductImport/CreateReceipt/partials/AddProductImportModal/AddProductImportModal.tsx`
- Tim modal trigger logic trong CreateReceipt.tsx va AdjustmentSlip

**De xuat fix:**
- Kiem tra state `showAddProductModal` co duoc set = true khi click
- Kiem tra `.modal-backdrop` co bi orphan khong — neu co, cleanup khi navigate

**Muc do:** CRITICAL — Khong them duoc SP vao phieu → khong nhap/dieu chinh kho duoc

---

### TD-INV-003: API tao kho khong duoc goi

**Mo ta:** Modal "Them kho" mo, nhap ten, nut "Luu" enable, click → nhung KHONG co POST API nao duoc gui.

**File lien quan:**
- `src/pages/ProductImport/WarehouseList/WarehouseListPage.tsx` — tim handler submit cua modal
- Tim service call: `WarehouseService.create()` hoac tuong tu

**De xuat fix:**
- Debug: them `console.log` trong handler submit de kiem tra co duoc goi khong
- Kiem tra validate condition truoc khi goi API

**Muc do:** CRITICAL — Khong tao duoc kho moi

---

## HIGH — Fix som

### TD-INV-004: Trang san pham (`/setting_sell`) tab khong load noi dung

**Mo ta:** Click tab "Danh sach san pham" → tab duoc highlight nhung KHONG co noi dung (0 SP, khong co nut, khong co search).

**Nguyen nhan co the:**
- Tab click nhung component `ProductList` khong duoc render
- Hoac API lay danh sach SP fail (chua co SP nao)

**File lien quan:**
- `src/pages/SettingSell/SettingSellList.tsx` — logic render tab
- `src/pages/SettingSell/partials/Product/ProductList.tsx`

**De xuat fix:**
- Kiem tra API `GET /adminapi/product` co tra ve data khong
- Kiem tra tab state co dung khong (tabKey === "product_tab_one")

**Muc do:** HIGH — Khong quan ly duoc san pham

---

## MEDIUM — Fix khi co thoi gian

### TD-INV-005: Console warning "duplicate key" tren nhieu trang kho

**Mo ta:** 6 trang kho co React warning "Encountered two children with the same key".
**Trang:** So kho, Phieu nhap, Kiem ke, Ton kho SP, SP da ban, Don tam

**Nguyen nhan:** Component `BoxTable` hoac data API tra ve co ID trung.
**Da fix 1 phan:** 544/597 instances `key={index}` da duoc fix truoc do.

**De xuat:** Kiem tra data API — neu co ban ghi trung ID thi la loi data, khong phai loi FE.

**Muc do:** MEDIUM — Chi la warning, khong crash

---

### TD-INV-006: React-beautiful-dnd defaultProps deprecation

**Mo ta:** Trang Theo doi don (`/order_tracking`) co warning `defaultProps will be removed from memo components`.
**Nguyen nhan:** Thu vien `react-beautiful-dnd` da ngung phat trien.
**De xuat:** Nang cap hoac thay the bang `@hello-pangea/dnd` (fork chinh thuc).

**Muc do:** LOW — Chi la deprecation warning

---

### TD-INV-007: API error response dung `error` thay vi `message`

**Mo ta:** Backend tra ve `{ error: "ma kho da ton tai" }` thay vi `{ code: 1, message: "..." }`. Frontend check `response.message` → undefined → hien toast chung chung "Co loi xay ra" thay vi message cu the tu backend.

**Da fix:** `ModalAddWarehouse.tsx` — doc ca `response.message` va `response.error`

**Van de goc (toan he thong):** `apiPost` khong check HTTP status. Khi 400/500, van parse JSON nhung response format khac (`error` thay vi `message`). Moi component phai tu handle. Can thong nhat response format giua FE va BE.

**Muc do:** MEDIUM — anh huong UX (user khong biet loi gi)

---

## DA FIX

| # | Loi | File | Fix |
|---|-----|------|-----|
| 1 | Dashboard TC crash khi API 500 | `Finance/Dashboard/index.tsx` | Them `if (!data) return;` |
| 2 | Tour overlay che tat ca nut | `tests/helpers.mjs` | `dismissTour()` remove DOM elements |
| 3 | Modal backdrop "Chon vai tro" bi stuck | `tests/helpers.mjs` | Remove `.modal-backdrop` + `.page__choose--role` |
| 4 | SSO login mat session lien tuc | `tests/login-save.mjs` | Luu token, reuse cho moi lan test |

---

## CAU TRUC FILE LIEN QUAN

```
src/pages/ProductImport/
├── WarehouseList/WarehouseListPage.tsx      ← TD-INV-003 (tao kho)
├── CreateReceipt/CreateReceipt.tsx          ← TD-INV-002 (modal them SP)
├── Inventory/InventoryList.tsx             ← TD-INV-001 (filter dropdown)
├── InventoryChecking/index.tsx             ← TD-INV-005 (duplicate key)
├── ProductInventoryList/                   ← TD-INV-001
├── ProductSoldList/                        ← TD-INV-001
└── ImportInvoiceList/                      ← TD-INV-001

src/pages/SettingSell/
├── SettingSellList.tsx                     ← TD-INV-004 (tab render)
└── partials/Product/ProductList.tsx        ← TD-INV-004
```

---

## CACH CHAY LAI TEST

```bash
# Login 1 lan (chi can khi token het han — 1 ngay)
node tests/login-save.mjs

# Chay test phan he kho
node tests/test-inventory-full.mjs

# Xem report
cat tests/reports/inv-*.json | python -m json.tool
```

---

*Auto-generated tu ket qua test — 2026-04-11*
