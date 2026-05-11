# Uncertain Bugs — Cần Phối Hợp FE+BE Đánh Giá Thêm

> Gom 3 file `UNCERTAIN-*.md` cũ tại docs/ thành 1 nơi duy nhất. Các bug dưới đây thiếu thông tin hoặc cần BE confirm trước khi fix tránh fix sai.

---

## 1. Bug từ Tester report (UNCERTAIN_BUGS gốc)

### 1.1. C.1.4 — Sản phẩm bán chạy hiển thị sai giá (Báo cáo POS)

- **Mô tả**: Trong tab Báo cáo của Bán hàng tại quầy, một số sản phẩm bán chạy hiển thị giá `0 đ`.
- **Giả thuyết**:
  - BE trả `sellingPrice = 0` cho sản phẩm có nhiều biến thể (giá khác nhau).
  - FE dùng field sai để hiển thị giá.
- **Cần**: Kiểm tra API response của endpoint báo cáo sản phẩm bán chạy.

### 1.2. C.1.5 — Mục trống trong bug report
Tester chưa mô tả bug cụ thể.

### 1.3. C.3.8 — Tên sản phẩm không hiện trên phiếu trả hàng (detail modal)

- **Mô tả**: Trong `ReturnDetailModal`, sản phẩm hiện `–` thay vì tên.
- **Giả thuyết**: FE parse `productSummary` từ danh sách. Nếu BE không trả `products` array, FE enrich sẽ fail → hiện `–`.
- **Phụ thuộc**: Bug C.3.3 BE fix xong → FE tự hiện đúng.

### 1.4. D.1.1 — Quét mã QR chưa tìm được sản phẩm

- **Mô tả**: Trong danh sách sản phẩm, popup quét mã QR chưa hoạt động.
- **Giả thuyết**:
  - Camera API chưa được implement đầy đủ.
  - Sau khi scan, keyword tìm kiếm không được set đúng.
  - API search by barcode chưa hoạt động.
- **Cần**: Kiểm tra `QrScanModal` component và flow sau scan.

### 1.5. F.6.2 — QR Thu nợ không chia sẻ được

- **Mô tả**: Không share được QR qua Zalo/FB/Messenger.
- **Giả thuyết**:
  - Web Share API → chỉ hoạt động trên mobile browser.
  - Deep link → cần URL public, phụ thuộc BE.
  - Copy link hiện text thay vì URL.
- **Cần**: Kiểm tra share flow trong DebtManagement QR modal.

### 1.6. Mục trống — C.2 / C.6-C.9 / D.2-D.3 / D.5-D.6 / E.2-E.4 / F.1-F.5 / F.7 / G-J
Các mục này trong bug report không có mô tả bug cụ thể (chỉ có tiêu đề section). Có thể chưa test hoặc chưa phát hiện bug.

---

## 2. Customer create — shape request chưa rõ

**Phát hiện**: `tests/test-customer-api.mjs` khi gọi `POST /adminapi/customer/update` với `id=0` (tạo mới).

### Hiện trạng
- `GET /adminapi/customer/list_paid` → 200, code 0 ✅
- `POST /adminapi/customer/update` (create) → 400 `{"error":"Input wrong"}`
- Đã thử body gồm các field từ `ICustomerRequest` (`src/model/customer/CustomerRequestModel.ts`): `name`, `phone`, `gender`, `birthday`, `custType`, `careerId`, `avatar`, `firstCall`, `height`, `weight`, `trademark`, `taxCode`, `customerExtraInfos`. Vẫn fail.

### Cần BE confirm
1. **Trả error message chi tiết** thay vì `"Input wrong"` — ghi rõ field nào sai, kỳ vọng gì. Ít nhất `errors: [{field, code, message}]`.
2. Shape tối thiểu hợp lệ để tạo customer:
   - `careerId` bắt buộc? Nếu không có career nào trong hệ thống test thì truyền gì?
   - `custType` bắt buộc? Enum cho phép giá trị nào?
   - `customerExtraInfos` schema đặc biệt?
   - `sourceId` / `cgpId` / `branchId` — bắt buộc hay optional?
3. Có endpoint tạo nhanh riêng (`/customer/create`) hay dùng `/customer/update` với id=0 là chính thống?

### Tác động tạm thời
Test `test-customer-api.mjs` chỉ pass list/search. Các case 002/002B/007/012 bị block cho tới khi confirm shape.

### Workaround
- **Cách 1**: Ghi body request thực từ UI (DevTools → Network khi "Lưu") và dùng làm template seed.
- **Cách 2**: BE mở debug log 1 request fail để trả rõ field sai.

---

## 3. Payment Control phát sinh console error storm

**Phát hiện**: `tests/test-smoke-nav.mjs` ghi nhận route `/payment_control` tạo ra **464 console errors** trong một lần mở trang.

### Errors quan sát
```
Error fetching employee info: TypeError: Failed to fetch
```
(lặp lại hàng trăm lần)

### Giả thuyết
1. **Network retry loop**: `getDetailEmployeeInfo` trong [src/App.tsx:217](../../src/App.tsx#L217) không có backoff/retry cap; nếu bị rate-limit hoặc CORS thì chạy vô hạn.
2. **Component re-render storm**: `src/pages/Reconcile/index.tsx` dùng `useReconciliationList({ params, enabled: true })` với useEffect deps `[enabled, params]` ([src/hooks/useReconciliationList.ts:102](../../src/hooks/useReconciliationList.ts#L102)). Object `params` là useState nên reference stable — về lý thuyết OK — nhưng nếu `setParams` trong callback cha thì sinh vòng lặp.
3. **Transient network blip** lặp đi lặp lại do một component cha subscribe timer/interval chưa cleanup.

### Cần xác nhận
- Chạy app thủ công, mở DevTools → Network, vào `/payment_control`, xem có request lặp vô hạn không?
- Nếu có → tìm component/hook gốc.
- Nếu không (transient do test chạy nhiều tab song song) → giảm ưu tiên, chỉ cần fail-safe catch trong [src/App.tsx](../../src/App.tsx): sau N lần thất bại liên tiếp thì dừng, không spam console.

### Tác động
- UX: UI treo, DevTools log flood, khó debug.
- Khả năng cao là FE bug, nhưng cần repro thủ công trước khi fix.
