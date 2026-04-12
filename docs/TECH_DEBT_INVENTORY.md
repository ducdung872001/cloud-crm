# TECH DEBT — Phan he Kho (Inventory)

**Ngay phat hien:** 2026-04-11
**Phat hien boi:** Playwright auto test (test-inventory-full.mjs)
**Ket qua test ban dau:** 37/53 PASS (70%) | 16 FAIL
**Lan audit gan nhat:** 2026-04-12

---

## CRITICAL — Can fix truoc khi ban giao

### TD-INV-001: Filter dropdown khong dong sach — che cac nut khac

**Tinh trang:** ❌ STILL BROKEN

**Mo ta:** Khi click filter "Kho hang" trong trang So kho (`/inventory`), dropdown mo ra. Sau khi bam Escape, dropdown dong nhung **overlay van con** — cac nut "Khoang thoi gian", "Xuat Excel" bi vo hieu hoa.

**Anh huong:** 6 trang: So kho, Phieu nhap, Ton kho SP, SP da ban, Don tam, Kiem ke
**So test fail:** 8 tests (SK-004, SK-005, SK-006, PN-002 x3, NK-003 x3)

**Audit 2026-04-12:**
- File: [src/components/filter/filter.tsx:64](src/components/filter/filter.tsx#L64) — `useOnClickOutside(refFilter, () => setShowPopoverFilter(false), [...exceptions])`
- Featured filter (lines 296–303): cung pattern, escape handler line 310–322 chi `setShowPopoverFilter(false)`, **khong reset overlay state**.
- Can debug runtime de xac dinh element nao bi stuck (overlay div, body class, z-index) → kho fix tu code reading thuan tuy.

**De xuat fix:**
- Reproduce lai trong dev → inspect DOM khi bug xay ra → tim element stuck.
- Hoac dung pointer-events: none cho overlay khi `!showPopoverFilter`.

**Muc do:** CRITICAL — Chuc nang loc bi hong → user khong loc duoc du lieu

---

## HIGH — Fix som

### TD-INV-002: Modal "Them san pham" khong mo trong phieu nhap/dieu chinh

**Tinh trang:** ⚠️ PARTIAL FIXED

**Audit 2026-04-12:**
- **Adjustment Slip (`/adjustment_slip`):** ✅ ĐÃ FIX qua [D.5.1 (2026-04-12)](RETEST-PLAN-sprint-bugs.md) — sua effect logic cua [ChooseProduct.tsx](src/pages/AdjustmentSlip/partials/AddAdjustmentSlip/partials/ChooseProduct/ChooseProduct.tsx). Reset state + seed inventoryId moi lan modal mo.
- **Create Receipt (`/create_inventory`):** ⚠️ Code reading cho thay [AddProductImportModal.tsx](src/pages/ProductImport/CreateReceipt/partials/AddProductImportModal/AddProductImportModal.tsx) duoc mount va render dung (lines 567–601). Modal logic trong file co ve OK. Co the bug da tu khoi sau cleanup khac, hoac van con bug runtime — **can re-test thuc te de xac nhan**.

**Action:**
- Re-test `/adjustment_slip` → "Them san pham" → ✅ confirm fix.
- Re-test `/create_inventory` → "Them san pham" → neu van bug, thu cleanup `.modal-backdrop` orphan hoac xem state `showAddProductModal`.

**Muc do:** HIGH

---

## MEDIUM — Fix khi co thoi gian

### TD-INV-006: React-beautiful-dnd defaultProps deprecation

**Tinh trang:** ❌ STILL BROKEN (chua migrate)

**Audit 2026-04-12:**
- [package.json:87](package.json#L87) van con `"react-beautiful-dnd": "^13.1.1"`.
- [src/pages/OrderTracking/partials/KanbanOrderTracking/index.tsx](src/pages/OrderTracking/partials/KanbanOrderTracking/index.tsx) va 2 file TaskItem khac van import `Draggable` tu library nay.
- Library da deprecated, khong nhan update React 18+.

**De xuat:** Migrate sang `@hello-pangea/dnd` (fork chinh thuc, drop-in API tuong thich). Estimate: 1-2h (chu yeu doi import + smoke test kanban).

**Muc do:** LOW — Chi la deprecation warning, chua crash. Lam khi co dot dependency bump.

---

### TD-INV-007: API error response dung `error` thay vi `message`

**Tinh trang:** ⚠️ PARTIAL FIXED (van con root cause)

**Audit 2026-04-12:**
- [ModalAddWarehouse.tsx:249](src/pages/ProductImport/WarehouseList/ModalAddWarehouse/ModalAddWarehouse.tsx#L249) ĐÃ check ca `response.message ?? response.error` → toast hien message dung cho luong tao kho.
- **Root cause toan he thong van con:** [src/services/apiHelper.ts:45-82](src/services/apiHelper.ts#L45-L82) **khong validate HTTP status** — chi `.then(res => res.json())`. 4xx/5xx van resolve thanh JSON. Moi component phai tu handle.

**De xuat fix dung cach:**
1. Sua `apiHelper.ts`: kiem tra `if (!res.ok) throw new ApiError(res.status, body)`.
2. Wrapper helper trich xuat message: `getErrorMessage(err) → err.message ?? err.error ?? "Loi khong xac dinh"`.
3. Anh huong: tat ca service callers — risk medium-high. Can rollout co kiem soat.

**Muc do:** MEDIUM — Anh huong UX nhung khong block ban giao. **Can lam phase rieng vi blast radius lon.**

---

## DA FIX

| # | Item | File | Fix / Verification | Ngay |
|---|------|------|--------------------|------|
| 1 | Dashboard TC crash khi API 500 | `Finance/Dashboard/index.tsx` | Them `if (!data) return;` | 2026-04-11 |
| 2 | Tour overlay che tat ca nut | `tests/helpers.mjs` | `dismissTour()` remove DOM elements | 2026-04-11 |
| 3 | Modal backdrop "Chon vai tro" bi stuck | `tests/helpers.mjs` | Remove `.modal-backdrop` + `.page__choose--role` | 2026-04-11 |
| 4 | SSO login mat session lien tuc | `tests/login-save.mjs` | Luu token, reuse cho moi lan test | 2026-04-11 |
| 5 | **TD-INV-003** API tao kho khong duoc goi | [ModalAddWarehouse.tsx:243](src/pages/ProductImport/WarehouseList/ModalAddWarehouse/ModalAddWarehouse.tsx#L243) | Verified: `InventoryService.update(body)` duoc goi dung trong submit handler. Khong phai bug — co the test ban dau bi modal-backdrop stuck (TD #3) gay nham. | 2026-04-12 |
| 6 | **TD-INV-004** SettingSell tab "Danh sach SP" khong load | [SettingSellList.tsx:141-148](src/pages/SettingSell/SettingSellList.tsx#L141-L148) | Verified: conditional render `{isDetail && tab === "product_tab_one" && <ProductList />}` hoat dong dung. Khong phai bug FE — co the do API rong hoac auto-test sai assertion. | 2026-04-12 |
| 7 | **TD-INV-005** React duplicate key warning | 4 files (xem chi tiet) | Da sua 5 instances cuoi cung `key={index}` → `key={field.name}` / `key={item.id}`. Grep `key=\{index\}` trong `src/pages/ProductImport/` → 0 ket qua. | 2026-04-12 |

**Files da fix TD-INV-005 (2026-04-12):**
- [ModalAddWarehouse.tsx:347-363](src/pages/ProductImport/WarehouseList/ModalAddWarehouse/ModalAddWarehouse.tsx#L347-L363) — 2 instances dung `field.name ?? field.label`
- [AddInventoryModal.tsx:234-240](src/pages/ProductImport/Inventory/partials/AddInventoryModal.tsx#L234-L240) — 1 instance
- [AddProductImportModal.tsx:587-596](src/pages/ProductImport/CreateReceipt/partials/AddProductImportModal/AddProductImportModal.tsx#L587-L596) — 1 instance
- [ImportInvoiceList.tsx:297](src/pages/ProductImport/ImportInvoiceList/ImportInvoiceList.tsx#L297) — 1 instance, dung `inv-${item.id}`

---

## CAU TRUC FILE LIEN QUAN

```
src/pages/ProductImport/
├── WarehouseList/WarehouseListPage.tsx      ← TD-INV-003 ✅
├── CreateReceipt/CreateReceipt.tsx          ← TD-INV-002 (partial)
├── Inventory/InventoryList.tsx              ← TD-INV-001
├── InventoryChecking/index.tsx
├── ProductInventoryList/                    ← TD-INV-001
├── ProductSoldList/                         ← TD-INV-001
└── ImportInvoiceList/                       ← TD-INV-001

src/pages/SettingSell/
├── SettingSellList.tsx                      ← TD-INV-004 ✅
└── partials/Product/ProductList.tsx
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

*Auto-generated tu ket qua test — 2026-04-11. Re-audited 2026-04-12.*
