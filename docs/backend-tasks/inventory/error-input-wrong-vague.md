# BACKEND-TASK — Thông điệp lỗi "Input wrong" quá mơ hồ

**Phát hiện**: e2e `tests/test-e2e-product-import-pos.mjs` và `tests/test-customer-api.mjs`.

## Hiện trạng
Nhiều endpoint BE trả về `{ "error": "Input wrong" }` với HTTP 400 khi body request có vấn đề, mà không nói rõ **field nào** sai hoặc **tại sao**.

Ví dụ:
- `POST /adminapi/customer/update` với body tạo customer mới → `"Input wrong"` (không rõ thiếu field nào).
- `POST /inventory/invoice/import/update` với body nhập kho → `"Input wrong"` (thực ra FE gửi ngày sai format, nhưng BE không nói).

## Tác động
- **Debug hao thời gian**: FE/tester phải đoán + capture request để tìm ra field sai.
- **Silent bug**: FE có thể gửi request lỗi trong production mà chỉ thấy toast chung chung "Có lỗi xảy ra" → không tự phát hiện được.
- **E2E test flaky**: không biết bug thuộc FE hay BE khi chỉ có "Input wrong".

## Yêu cầu
1. Thay `"Input wrong"` bằng **response có cấu trúc**:
   ```json
   {
     "code": 400,
     "error": "Validation failed",
     "errors": [
       { "field": "receiptDate", "code": "INVALID_FORMAT", "message": "Expected yyyy-MM-dd'T'HH:mm:ss, got '2026-04-Mo1776...'" },
       { "field": "careerId", "code": "REQUIRED" }
     ]
   }
   ```
2. **HTTP status code đúng**: validation fail → 400; server error → 500. Hiện đang trộn lẫn.
3. Áp dụng cho tất cả endpoint `/update`, `/create`, `/import`, `/approve`.

## Ví dụ fix bắt được nhờ bug này
Sau khi thêm log + debug, phát hiện ra `formatDateCustom(d, "yyyy-MM-EEEEEETHH:mm:ss")` (FE bug) sinh ra chuỗi `"2026-04-Mo177606900000015:30:00"` vô nghĩa → BE trả "Input wrong". Nếu BE báo rõ `"receiptDate: INVALID_FORMAT"` thì fix được trong 30 giây thay vì 30 phút.
