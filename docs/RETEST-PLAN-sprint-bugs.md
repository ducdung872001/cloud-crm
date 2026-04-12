---
title: Re-test plan - Sprint bugs (Reborn Retail)
date: 2026-04-12
branch: reborn-retail
related: fix_bug_retail.md
---

# Re-test plan — Sprint bugs

> Mục đích: kiểm chứng các bug đã được fix (FE + BE) theo `fix_bug_retail.md`.
> Cột **Trạng thái code** là kết quả audit code hiện tại trên branch `reborn-retail` (working tree, chưa commit). Cột **Cần re-test** là việc tester / dev cần làm tay.
>
> Quy ước: ✅ FIXED · ⚠️ PARTIAL · ❌ NOT FIXED · 🔵 BE-FIX (cần re-test FE-side)

---

## 1) Tổng quan kết quả audit

| Bug | Module | Loại | Trạng thái code | Cần làm |
|-----|--------|------|----|---------|
| C.1.1 | POS qty input | FE | ✅ FIXED | Re-test UI |
| C.1.3 | Draft mất khách hàng | FE | ✅ FIXED | Re-test save/restore |
| C.1.5 | Báo cáo POS cột thừa | FE | ✅ FIXED | Re-test các range |
| C.1.6 | Biên lai sai tiền khách đưa | FE | ✅ FIXED | Re-test POS pay flow |
| C.1.7 | Phí ship nhầm tiền thối | FE | ✅ FIXED | Re-test ship + pay |
| C.3.9 | Số lượng trả hàng cứng = 1 | FE | ✅ FIXED | Re-test return modal |
| C.4.1 | Filter tab MultiChannel | FE | ✅ FIXED | Re-test mọi tab |
| C.1.4 | Detail HĐ thiếu thông tin KH | BOTH | ✅ FIXED (2026-04-12) — thêm loyaltyPoint + membershipTier vào InvoiceReceiptModal | Re-test sau khi BE deploy |
| C.3.4 | 2 phiếu trả cho cùng đơn | 🔵 BE | 🔵 BE done | Re-test BE-side |
| C.3.6 | Refund nhầm giá gốc | 🔵 BE | 🔵 BE done | Re-test BE-side |
| C.3.8 | Trả hàng không cộng kho | 🔵 BE | 🔵 BE done | Re-test BE-side + FE display tên SP |
| D.4.3 | Trả/đổi không cập nhật kho | 🔵 BE | 🔵 BE done | Re-test BE-side |
| E.1.1 | Search KH theo SĐT/email | 🔵 BE | 🔵 BE done | Re-test BE-side |
| D.1.1 | Quét QR ở Product list | FE | ✅ FIXED (2026-04-12) — extract BarcodeScanner shared component, wire vào ProductList | Re-test camera mobile/desktop |
| D.1.3 | Mã vạch biến thể mất sau lưu | FE | ✅ FIXED (2026-04-12) — sync c.barcode từ unit barcode khi submit | Re-test save+reload |
| D.1.5 | VAT chưa hiển thị | FE | ✅ FIXED | Re-test |
| D.4.2 | Tồn POS không nhất quán | BOTH | ❌ NOT FIXED — VariantModal không truyền warehouseId | Cần dev FE + có thể BE |
| D.5.1 | Popup chọn SP trong phiếu kiểm | FE | ✅ FIXED (2026-04-12) — sửa effect logic ChooseProduct.tsx | Re-test |
| C.5.2 | Vận chuyển không hiện tên KH | FE | ✅ FIXED | Re-test |
| C.5.3 | Lỗi vận chuyển generic | FE | ❌ NOT FIXED — không có error code mapping | Cần dev + BE confirm error codes |
| F.6.2 | Share QR thu nợ | FE | ✅ FIXED | Re-test |
| Invoice 404 | POST /sales/invoice/create | 🔵 BE | 🔵 BE đang fix | Re-test sau khi BE deploy |

---

## 2) Bằng chứng audit code (đã đọc file, code trên branch hiện tại)

### ✅ C.1.1 — POS qty input
- `src/pages/CounterSales/components/modals/VariantModal/index.tsx` dòng 76, 289–317:
  dùng `qtyInput` (string) khi typing, validate trên `onBlur`, clamp ≤ maxStock, toast khi vượt tồn.
- `src/pages/CounterSales/components/Cart/index.tsx` dòng 309–336: cùng pattern (`qtyDraft`), toast cảnh báo khi vượt tồn ở dòng 333.
- **Re-test cases:**
  1. Mở popup chọn SP → xoá số `1` → gõ `14` → ✅ giữ đúng `14` không nhảy thành max stock.
  2. Trong giỏ hàng: tồn 30, gõ `100` → blur → ✅ toast vượt tồn, qty bị cap về 30.
  3. Xoá hết input trong giỏ → blur → ✅ tự reset về 1.

### ✅ C.1.3 — Draft order giữ thông tin khách hàng
- `src/pages/CounterSales/components/DraftOrders/types.ts` dòng 17–19, 121–123: DraftOrder bao gồm `customerId`, `khachHang`, `customerPhone`; `mapRawToDraftOrder` đã extract.
- `DraftDetailPanel.tsx` dòng 40–44: `onContinue` truyền đầy đủ `customerId/customerName/customerPhone`.
- **Re-test cases:**
  1. Tạo đơn → chọn khách Nguyễn A có SĐT → lưu draft → reload trang.
  2. Mở danh sách draft → chọn lại đơn → ✅ tên + SĐT khách vẫn hiển thị ở giỏ.
  3. Tạo draft với khách vãng lai (không chọn) → ✅ không crash, hiển thị "Khách lẻ".

### ✅ C.1.5 — Báo cáo POS cột thừa
- `src/pages/CounterSales/components/Report/index.tsx` dòng 211–227: filter `d.time != null && d.time.trim() !== "" && d.time >= isoFrom && d.time <= isoTo` trước khi render chart.
- **Re-test cases:** lần lượt bấm các range *Hôm nay / 7 ngày / 30 ngày / Tháng này* → ✅ không có cột rỗng bên trái.

### ✅ C.1.6 + C.1.7 — Biên lai
- `src/pages/CounterSales/components/modals/ReceiptModal/index.tsx`:
  - Dòng 105–126: snapshot `cashGivenAmount`, dùng `displayCashGiven` cho dòng "Tiền khách đưa" (line 507).
  - Dòng 487–492: phí ship hiển thị riêng `+{fmt(lockedShippingFee)}`.
  - Dòng 117: `total = subtotal + tax − discount + lockedShippingFee` → tiền thối line 512 = `displayCashGiven − total` (đã trừ đúng phí ship).
- **Re-test cases:**
  1. Đơn 100k, khách đưa 150k → in biên lai → ✅ "Tiền khách đưa": 150.000, "Tiền thối": 50.000.
  2. Đơn 100k + ship 30k, khách đưa 150k → ✅ Phí ship: +30.000, Tiền thối: 20.000 (không phải 50.000).
  3. Đơn nợ một phần (paid < total) → ✅ không crash.

### ✅ C.3.9 — Số lượng trả hàng
- `src/pages/ReturnProduct/modals/CreateReturnModal/index.tsx` dòng 95–108 + 668/676: payload `lstBoughtProduct` map từ `r.qty` thực, không hardcode.
- **Re-test cases:**
  1. Trả 3 cái cùng lúc → submit → ✅ payload gửi qty=3 (check Network tab).
  2. Trả 2 SP khác nhau (qty 2 và qty 5) → ✅ mỗi item đúng qty.
  3. Mở chi tiết phiếu trả → ✅ qty hiển thị khớp.

### ✅ C.4.1 — Filter MultiChannel
- `src/pages/MultiChannelSales/MultiChannelOrders/MultiChannelOrders.tsx` dòng 394–401: tab → `TAB_STATUS_MAP[tabId]` → set vào params → trigger refetch.
- **Re-test cases:** click lần lượt các tab *Tất cả / Chờ xác nhận / Đang xử lý / Đã giao / Huỷ* → ✅ list reload đúng và URL/param có `status=...`.

---

## 3) Bug cần re-test sau khi BE đã fix (FE side OK, kiểm chứng end-to-end)

### 🔵 C.3.4 — Không cho tạo 2 phiếu trả cho cùng đơn
**Test:**
1. Đơn A đã có 1 phiếu trả CONFIRMED full số lượng → tạo phiếu trả mới cho đơn A → ✅ BE trả 400 `RETURN_QUANTITY_EXCEEDED`, FE phải show toast lỗi rõ ràng.
2. Đơn B trả 1 phần (3/5) → tạo phiếu trả mới 2 cái → ✅ thành công.
3. Đơn B trả thêm 3 cái nữa (vượt) → ✅ bị chặn.

### 🔵 C.3.6 — Refund đúng số tiền sau giảm
**Test:**
1. Đơn 4.000.000 + voucher giảm còn 3.663.000, khách đã thanh toán 3.663.000.
2. Trả full → ✅ refund = 3.663.000 (không phải 4.000.000).
3. Trả 1/2 → ✅ refund proportional.
4. Đơn có cả voucher + điểm loyalty → ✅ phân bổ đúng tỉ lệ.

### 🔵 C.3.8 + D.4.3 — Trả/đổi cập nhật tồn kho
**Test:**
1. Tồn SP X = 10, bán 3 (tồn còn 7) → trả 2 → ✅ tồn về 9.
2. Đổi: trả SP X (qty 2) lấy SP Y (qty 1) → ✅ X +2, Y −1, cùng warehouse.
3. Vào màn quản lý kho check số liệu khớp.
4. Re-test FE: tên SP trong phiếu trả phải hiển thị (không "—").

### 🔵 E.1.1 — Search KH theo SĐT/email
**Test:**
1. Trang khách hàng → search "0901234567" → ✅ ra đúng KH.
2. Search "abc@gmail.com" → ✅ ra đúng KH.
3. Search "Nguyễn" → ✅ filter theo tên (regression).
4. Combo: "0901" partial → ✅ vẫn match.

### ✅ C.1.4 — Invoice detail hiển thị thông tin KH (FIXED 2026-04-12)
**File chính:** [InvoiceReceiptModal.tsx](src/pages/CounterSales/components/modals/InvoiceReceiptModal/InvoiceReceiptModal.tsx) — modal chi tiết hoá đơn mở từ `SaleInvoiceList`.

**Thay đổi:**
1. [InvoiceResponse.ts](src/model/invoice/InvoiceResponse.ts): thêm `loyaltyPoint?: number` và `membershipTier?: string` vào `IInvoiceResponse`.
2. `ReceiptData` type bổ sung 2 field tương ứng.
3. `fetchReceipt` map từ API: `inv.loyaltyPoint`, `inv.membershipTier`.
4. Customer section render thêm:
   - Badge hạng thành viên (BRONZE→Đồng, SILVER→Bạc, GOLD→Vàng, PLATINUM→Bạch kim, DIAMOND→Kim cương, VIP) bên cạnh tên.
   - Dòng "Điểm tích luỹ: 1.500" (chỉ hiện khi > 0).
5. SCSS thêm `.rcpt-customer__tier` (badge pill) + `.rcpt-customer__loyalty`.

**Defensive:** Nếu BE không trả 2 field (HĐ vãng lai, BE chưa deploy) → ẩn không render. Khách `customerName === "Khách vãng lai" && !customerPhone` → ẩn cả block customer như cũ.

**Test case re-test:**
1. SaleInvoiceList → click HĐ có khách hạng GOLD, 1.500 điểm → ✅ thấy tên khách + badge "Vàng" + dòng "Điểm tích luỹ: 1.500".
2. HĐ vãng lai (no customerId) → ✅ block customer ẩn hoàn toàn.
3. HĐ có khách nhưng `loyaltyPoint=0` → ✅ ẩn dòng điểm tích luỹ.
4. HĐ có khách không có tier (membershipTier=null) → ✅ không hiện badge.
5. BE trả tier lạ (vd "PARTNER") → ✅ fallback hiển thị raw "PARTNER" thay vì throw.
6. In biên lai (Print) → ✅ tier + điểm tích luỹ cũng hiển thị trên bản in.

**Note:** [ShowModalDetailSaleInvoice.tsx:316](src/pages/Sell/SaleInvoiceList/partials/ShowModalDetailSaleInvoice.tsx#L316) là một print-receipt khác, dùng cho luồng khác (in receipt), chưa cập nhật loyalty/tier vì không phải view chi tiết KH chính. Nếu QA xác nhận cần có ở đây nữa, em sẽ thêm sau.

### 🔵 Invoice 404 (CRITICAL)
**Test sau khi BE deploy:**
1. Tạo HĐ mới qua POS → submit → ✅ không 404, có invoice id trả về.
2. Test với hostname header `kcn.reborn.vn` (nếu có proxy).
3. Test field `account: "[]"` được parse OK.

---

## 4) Bug **chưa fix** / cần dev thêm

### ✅ D.1.1 — Quét QR sản phẩm ở Product list (FIXED 2026-04-12)
**Phát hiện trong khi fix:** Codebase đã có sẵn `BarcodeScannerModal` inline trong [AddProductPage.tsx:198-311](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx) (cũ), dùng ZXing UMD load qua **CDN** (`@zxing/browser@0.1.5` từ jsdelivr). Pattern này hay vì zero bundle impact, không cần npm dep — em giữ nguyên approach.

**Thay đổi:**
1. **Tạo component dùng chung:**
   - [src/components/barcodeScanner/BarcodeScanner.tsx](src/components/barcodeScanner/BarcodeScanner.tsx) — extract toàn bộ logic ZXing UMD loader + camera scanner. Props: `onScan(code) → void`, `onClose() → void`, `title?: string`. Đã handle các error states (NotAllowed/NotFound, generic).
   - [src/components/barcodeScanner/BarcodeScanner.scss](src/components/barcodeScanner/BarcodeScanner.scss) — extract `.bs-overlay`, `.bs-modal`, `@keyframes bs-scan` từ AddProductPage.scss.
2. **AddProductPage** xoá inline `BarcodeScannerModal` + `loadZXingScript` + scss block (~140 dòng tsx + 140 dòng scss) → import shared component, đổi `<BarcodeScannerModal>` → `<BarcodeScanner>`.
3. **ProductList** thêm:
   - State `showCameraScanner`.
   - Nút 📷 "Quét bằng camera" cạnh input scan trong scan-modal.
   - Mount `<BarcodeScanner>` khi user bấm nút → quét xong → set scanInput + auto trigger `handleScanSearch(code)`.

**Note kỹ thuật:**
- ZXing UMD ~70KB gzipped, load lazy lần đầu cần quét. Cache browser sau đó.
- Hỗ trợ EAN-13, EAN-8, UPC-A/E, Code-39, Code-128, QR, Data Matrix qua `BrowserMultiFormatReader`.
- Hoạt động trên Chrome/Edge desktop + Android Chrome + iOS Safari (đã verify pattern hiện tại của AddProductPage).
- Nếu chặn quyền camera → hiển thị hướng dẫn rõ ràng tiếng Việt.

**Test case re-test:**
1. Trang `/product/list` → bấm "Quét QR" → modal mở → bấm 📷 → camera bật → chĩa vào barcode → ✅ tự fill mã + tìm.
2. Quét trúng SP → ✅ hiện thẻ "Tìm thấy" + nút "Xem SP".
3. Quét mã không có trong DB → ✅ hiện "Không tìm thấy" + nút "Tạo SP mới".
4. Từ chối quyền camera → ✅ hiện thông báo Việt: "Bạn chưa cấp quyền camera...".
5. Không có camera (desktop không webcam) → ✅ hiện "Không tìm thấy camera".
6. Mobile Chrome / Safari → ✅ camera back-facing được chọn (`facingMode: environment` mặc định của ZXing).
7. AddProductPage (luồng cũ) → vẫn quét được barcode cho từng unit (regression check).

### ✅ D.1.3 — Mã vạch biến thể không mất sau save (FIXED 2026-04-12)
**Root cause:**
- UI [AddProductPage.tsx:2028-2057](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx#L2028-L2057) chỉ cho user gõ/scan/sinh barcode ở **unit-level** (`c.variantPrices[i].barcode`), không có input cho variant-level (`c.barcode`).
- Submit ở [line 927 (trước fix)](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx#L927): `barcode: c.barcode || ""` → variant-level luôn rỗng.
- BE có thể chỉ persist `variant.barcode`, ignore `variantPrices[i].barcode` → reload mất.

**Fix:**
```ts
// AddProductPage.tsx submit (line ~927)
const fallbackBarcode = c.variantPrices?.find((u) => u.barcode)?.barcode || "";
return {
  ...
  barcode: c.barcode || fallbackBarcode,  // sync từ unit đầu tiên có barcode
  ...
  variantPrices: c.variantPrices.map((u) => ({ ..., barcode: u.barcode || "" })),
}
```
Vẫn giữ unit-level barcode trong `variantPrices[]` để BE nào hỗ trợ multi-unit barcode sẽ persist được; còn BE nào chỉ có variant-level cũng sẽ persist được giá trị fallback.

**Test case re-test:**
1. Tạo SP có biến thể (vd "Áo thun", màu Đỏ/Xanh, size M/L) → mỗi biến thể bấm nút "Sinh mã" → barcode sinh ngẫu nhiên → ✅ Save SP.
2. Mở lại SP từ list → ✅ barcode vẫn còn ở mỗi biến thể (không rỗng).
3. Đổi barcode 1 biến thể → save → reload → ✅ giá trị mới persist.
4. Tạo SP biến thể có nhiều unit (vd cái + thùng) → đặt barcode khác nhau cho mỗi unit → save → reload → ✅ ít nhất unit cơ bản giữ được barcode (BE phụ thuộc — nếu BE persist multi-unit thì cả 2 đều giữ).
5. SP không có biến thể (default) → vẫn save+reload OK.

**Cảnh báo BE:** Nếu BE chưa persist `variantPrices[].barcode`, các unit không phải unit cơ bản vẫn có thể mất barcode. Cần BE confirm hoặc test case 4.

### ✅ D.1.5 — VAT đã hiển thị
- [Cart/index.tsx:76](src/pages/CounterSales/components/Cart/index.tsx#L76): `taxAmount = items.reduce((sum, i) => sum + (i.taxRate ? Math.round(i.price * i.qty * i.taxRate / 100) : 0), 0)`.
- Lines 502–507 render row "Thuế suất" `+{formatVND(taxAmount)}` (chỉ hiện khi > 0).
- Line 93: total đã bao gồm `+ taxAmount`.
- **Re-test:** SP có VAT 10% → thêm vào giỏ → ✅ thấy dòng VAT, total cộng đúng. SP không VAT → ✅ ẩn dòng.

### ✅ C.5.2 — Vận chuyển hiện tên KH
- [AddShippingOrder.tsx:290-296](src/pages/ShipingManagement/AddShippingOrder/AddShippingOrder.tsx#L290-L296): khi load invoices, enrich `name = inv.customerName || enriched?.name || ""` và build label `${invoiceCode} — ${name}`.
- Lines 387–399: enrichment khi load detail.
- **Re-test:** chọn HĐ có khách → ✅ tên hiện ngay; HĐ không có khách → ✅ chỉ hiện mã.

### ✅ F.6.2 — Share QR thu nợ
- [Finance/DebtManagement/index.tsx:170-182](src/pages/Finance/DebtManagement/index.tsx#L170-L182): convert dataUrl → File blob, check `navigator.canShare({ files })`, gọi `navigator.share({ title, text, files })`.
- Lines 109–125: fallback Zalo / Facebook / Messenger links.
- Line 164: fallback download.
- **Re-test:** mobile Chrome → bấm Share → ✅ hiện app picker; desktop → ✅ fallback link.

### ⚠️ D.1.3 — Mã vạch biến thể: load OK, save có thể rớt unit barcode
**Evidence:**
- Load mapper [AddProductPage.tsx:630](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx#L630): fallback `u.barcode ?? u.barcodeCode ?? v.barcode ?? v.code ?? v.barcodeCode ?? ""` — OK.
- Variant mapper line 663 cũng OK.
- **Submit** [AddProductPage.tsx:927](src/pages/SettingSell/partials/Product/partials/AddProductPage.tsx#L927): chỉ gửi `barcode: c.barcode || ""` ở variant level. Nếu barcode chỉ tồn tại trong unit (lstUnit), có thể bị mất khi submit.
**Action:**
1. Dev trace: khi sinh barcode mới (auto-gen), gắn vào `variant.barcode` hay `unit.barcode`?
2. Nếu unit-level → cần sync lên variant trước khi submit, hoặc payload include `lstUnit[].barcode`.
3. Test reproduce: tạo SP biến thể → sinh barcode → save → reload chi tiết → check barcode còn không.

### ❌ D.4.2 — Tồn POS không nhất quán
**Evidence:**
- ProductGrid (list ngoài) đã truyền `warehouseId` xuống API stock.
- [VariantModal/index.tsx:82-85](src/pages/CounterSales/components/modals/VariantModal/index.tsx#L82-L85): gọi `useGetDetailProduct({ productId, enabled: open })` — **không truyền warehouseId**.
- `useGetDetailProduct` không có param `warehouseId`; `ProductService.detail(id)` chỉ nhận `id`.
- Kết quả: VariantModal hiển thị `stockQuantity` tổng tất cả kho.
**Action (cần phối hợp BE):**
1. BE: `GET product/detail` thêm param `inventoryId` → trả stock của kho đó.
2. FE: thêm prop `warehouseId` cho `VariantModal`, truyền xuyên `useGetDetailProduct` → `ProductService.detail(id, warehouseId)`.
3. `ProductGrid` (đã có `warehouseId` ở scope cha) truyền vào `<VariantModal>`.
**Estimate:** 2–3h FE sau khi BE xong (~1h).

### ✅ D.5.1 — Modal chọn SP trong phiếu kiểm (FIXED 2026-04-12)
**Tìm sai trước đây:** `AddExportOrderModal.tsx` / `AddImportOrderModal.tsx` thực ra là **file orphan 0 bytes** không được import ở đâu — không phải bug. Modal thực sự nằm trong trang AdjustmentSlip.

**Bug thật:** [ChooseProduct.tsx](src/pages/AdjustmentSlip/partials/AddAdjustmentSlip/partials/ChooseProduct/ChooseProduct.tsx) — popup "Chọn sản phẩm" trong phiếu kiểm `/adjustment_slip`.

**Root cause:**
1. `isLoading` init = `true` → modal chưa fetch đã hiển thị spinner; nếu effect không trigger fetch (do race), spinner kẹt vĩnh viễn.
2. Anti-pattern `useRef(false)` skip-first-mount khiến lần mount đầu tiên luôn return early. Logic dựa vào hai `useEffect` chạy đan xen rất mong manh.
3. Effect set inventoryId dùng `setParams({ ...params, ... })` với `params` là **stale closure** (không có trong deps). Mở modal lần 2 sau khi đổi warehouse có thể giữ inventoryId cũ hoặc keyword/page cũ.
4. Không reset state giữa các lần mở/đóng → list checked, keyword, page tích luỹ.

**Fix:**
- Init `isLoading: false`.
- Bỏ ref `isMounted` + effect skip-first-mount.
- Gộp 1 effect "khi `onShow` true hoặc đổi `inventory.value` → reset toàn bộ state + seed `params = { keyword:"", limit:10, page:1, inventoryId }`".
- Effect fetch chỉ chạy khi `onShow && params.inventoryId && params.limit > 0`.
- Bỏ import `useRef`, `cloneDeep` không còn dùng.
- ✓ tsc pass, ✓ eslint chỉ còn 2 warning pre-existing (`satId` unused, `getLstProduct` deps).

**Test case re-test:**
1. `/adjustment_slip` → tạo phiếu kiểm mới → chọn kho A → bấm "Thêm sản phẩm" → ✅ list SP của kho A hiện ngay (không kẹt spinner).
2. Đóng modal → đổi sang kho B → mở modal lại → ✅ list refresh đúng kho B.
3. Mở modal → gõ keyword → đóng → mở lại → ✅ keyword đã reset, list trở về trang 1.
4. Kho rỗng → ✅ hiện banner "Hiện tại {kho} chưa có sản phẩm" (không kẹt spinner).
5. Chọn vài SP → đóng → mở lại → ✅ checked list reset, dataProduct rỗng.

**Note dọn dẹp:** [AddImportOrderModal.tsx](src/pages/ProductImport/InventoryChecking/partials/AddImportOrderModal.tsx) và [AddExportOrderModal.tsx](src/pages/ProductImport/InventoryChecking/partials/AddExportOrderModal.tsx) là file orphan 0 bytes (grep toàn `src/` → 0 reference). Anh có thể xoá an toàn — em chưa xoá vì chờ anh confirm xem có phải placeholder cho feature sắp tới không.

### ❌ C.5.3 — Lỗi vận chuyển generic
**Evidence:** [ShippingService.ts](src/services/ShippingService.ts) chỉ wrap fetch, không map error. Toàn codebase grep `COD_LIMIT_EXCEEDED`, `UNSUPPORTED_LOCATION`, `INVOICE_ALREADY_SHIPPED` → 0 kết quả.
**Action:**
1. BE cung cấp danh sách error code chính thức (GHN/GHTK/...).
2. FE thêm `ERROR_MESSAGES` map trong `ShippingService.ts` hoặc `utils/shippingError.ts` → Việt hoá.
3. Wrapper handler: `ERROR_MESSAGES[error.code] ?? error.message ?? "Lỗi không xác định"`.
**Estimate:** ~1h sau khi có danh sách error code.

---

## 5) Checklist re-test (cho tester)

### Tester Ngọc
- [ ] C.1.1 — qty input POS (3 cases)
- [ ] C.1.3 — draft giữ KH (3 cases)
- [ ] C.1.6 — receipt tiền khách đưa
- [ ] C.1.7 — receipt phí ship + thối
- [ ] C.3.4 — 2 phiếu trả cùng đơn (BE)
- [ ] C.3.6 — refund sau giảm giá (BE)
- [ ] C.3.8 — trả hàng cộng kho (BE)
- [ ] C.3.9 — qty trả hàng
- [ ] D.4.2 — tồn POS nhất quán
- [ ] D.4.3 — đổi hàng cập nhật kho (BE)
- [ ] D.5.1 — popup chọn SP phiếu kiểm
- [ ] Invoice 404 — POST /sales/invoice/create

### Tester Linh
- [ ] C.1.5 — báo cáo POS các range
- [ ] C.4.1 — filter MultiChannel mọi tab
- [ ] D.1.1 — QR scan product (chờ dev fix)
- [ ] D.1.3 — mã vạch biến thể
- [ ] E.1.1 — search KH SĐT/email (BE)
- [ ] C.5.3 — lỗi vận chuyển
- [ ] F.6.2 — share QR thu nợ

---

## 6) Quy trình re-test khuyến nghị

1. **Smoke test FE batch đã fix** (C.1.1, C.1.3, C.1.5, C.1.6, C.1.7, C.3.9, C.4.1) — chạy trước, ~30 phút.
2. **End-to-end BE bugs** (C.3.4, C.3.6, C.3.8, D.4.3, E.1.1, Invoice 404) — chạy sau, cần dữ liệu thật.
3. **Bug chưa audit** (mục 4) — dev FE audit code trước, tester re-test sau.
4. **D.1.1 + C.1.4** — chờ dev FE implement xong rồi mới test.
