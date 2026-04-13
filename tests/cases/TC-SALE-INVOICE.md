# TC-SALE-INVOICE — Danh sách đơn giao dịch

Route: `/sale_invoice` · Component: `SaleInvoiceList` · Permission: `SALE_INVOICE_VIEW` · API: `/adminapi/invoice`

## TC-SALE-INVOICE-001: Mở danh sách
- **Bước**: Menu "Giao dịch" → "Danh sách đơn"
- **Kỳ vọng**: API GET `/adminapi/invoice` code 0, bảng render cột: Mã đơn, Khách hàng, Tổng tiền, Trạng thái, Ngày tạo.

## TC-SALE-INVOICE-002: Filter theo trạng thái
- **Bước**: Chọn filter "Đã thanh toán" / "Chưa thanh toán" / "Huỷ"
- **Kỳ vọng**: API có param `status=...`, kết quả khớp.

## TC-SALE-INVOICE-003: Filter theo khoảng ngày
- **Bước**: Chọn "7 ngày gần đây" / range picker
- **Kỳ vọng**: API có param date chính xác (from/to dạng ISO hoặc epoch).

## TC-SALE-INVOICE-004: Tìm kiếm theo mã đơn / SDT
- **Bước**: Nhập mã đơn / SDT → Enter
- **Kỳ vọng**: Kết quả lọc đúng, không còn record không khớp.

## TC-SALE-INVOICE-005: Xem chi tiết đơn
- **Bước**: Click đơn bất kỳ
- **Kỳ vọng**: Hiện đủ: thông tin khách, sản phẩm/dịch vụ, số lượng, đơn giá, chiết khấu, VAT, tổng tiền, phương thức TT, trạng thái.

## TC-SALE-INVOICE-006: Huỷ đơn
- **Bước**: Mở đơn đã thanh toán → Huỷ → nhập lý do → Xác nhận
- **Kỳ vọng**:
  - API POST cancel code 0
  - Trạng thái chuyển "Đã huỷ"
  - Kho được cộng lại (nếu có sản phẩm)
  - Sổ thu chi sinh bút toán hoàn tiền
  - Dashboard cancel_count +1

## TC-SALE-INVOICE-007: In hoá đơn / Xuất PDF
- **Bước**: Click "In" trong chi tiết
- **Kỳ vọng**: Mở preview/tải file, nội dung khớp đơn.

## TC-SALE-INVOICE-008: Export danh sách
- **Bước**: Click Export
- **Kỳ vọng**: File Excel chứa đúng filter hiện tại.

## TC-SALE-INVOICE-009: Tổng tiền đồng nhất
- **Bước**: So sánh tổng trên list, chi tiết, API, PDF in
- **Kỳ vọng**: 4 nguồn bằng nhau (không lệch do làm tròn).

## TC-SALE-INVOICE-010: Phân quyền
- **Bước**: Role không có `SALE_INVOICE_VIEW`
- **Kỳ vọng**: Menu ẩn, route 403.

## Cross-flow
- `TC-E2E-POS-FINANCE`
- `TC-E2E-PROMOTION`

**Script**: `node tests/test-sale-invoice-crud.mjs`
