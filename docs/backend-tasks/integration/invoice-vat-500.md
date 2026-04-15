# BACKEND-TASK — Hoá đơn VAT 500

**Phát hiện**: `tests/test-smoke-nav.mjs` — route `/invoiceVAT` nhận 500 từ server khi load trang.

## Symptom
- Mở `/invoiceVAT` → console browser: `Failed to load resource: the server responded with a status of 500 (Internal Server Error)`
- Route vẫn render khung UI, nhưng không có dữ liệu.

## Cần BE điều tra
1. Endpoint nào trả 500? Xem Network tab của browser khi vào `/invoiceVAT` — tìm request `.../adminapi/...` hoặc `.../bizapi/...` trả 500.
2. Stacktrace BE — NPE? Query sai? Dữ liệu tenant rỗng không được xử lý?
3. Luôn phải trả 200 với list rỗng thay vì 500 khi không có record nào.

## Tác động
Trang Hoá đơn VAT không sử dụng được. Ưu tiên cao nếu có khách hàng đã dùng phân hệ này.
