# TC-CUSTOMER — Thành viên (Member / Customer)

Route: `/customer_list` · Component: `CustomerAndSupplier` (type=customer) · Permission: `CUSTOMER_VIEW` · API prefix: `/adminapi/customer`

## TC-CUSTOMER-001: Mở danh sách thành viên
- **Mức**: Critical
- **Bước**: Truy cập menu "Thành viên" → "Thành viên"
- **Kỳ vọng**:
  - URL = `/customer_list`
  - API GET `/adminapi/customer` trả về code 0
  - Bảng render ≥ 0 dòng, header chứa ít nhất cột "Họ tên", "Số điện thoại"

## TC-CUSTOMER-002: Tạo thành viên mới (happy path)
- **Bước**: Click "Thêm mới" → điền Họ tên, SDT, Giới tính, Ngày sinh → Lưu
- **Kỳ vọng**:
  - API POST `/adminapi/customer` code 0
  - Toast thành công
  - Record mới xuất hiện ở đầu danh sách với đầy đủ thông tin
  - GET detail API trả đúng data vừa nhập (round-trip)

## TC-CUSTOMER-003: Validate các trường bắt buộc
- **Bước**: Click "Thêm mới" → bỏ trống Họ tên + SDT → Lưu
- **Kỳ vọng**: Hiển thị error inline cho từng field, không gọi API POST.

## TC-CUSTOMER-004: Validate định dạng SDT/Email
- **Bước**: Điền SDT "abc", Email "notanemail" → Lưu
- **Kỳ vọng**: Error inline "Số điện thoại không hợp lệ" / "Email không hợp lệ".

## TC-CUSTOMER-005: Chặn trùng SDT
- **Bước**: Tạo member với SDT đã tồn tại
- **Kỳ vọng**: API code ≠ 0 hoặc message "Số điện thoại đã tồn tại", không tạo duplicate.

## TC-CUSTOMER-006: Xem chi tiết thành viên
- **Bước**: Click dòng bất kỳ → xem trang chi tiết / modal
- **Kỳ vọng**: Tab thông tin, lịch sử check-in, dịch vụ đã dùng, điểm thưởng — tất cả load không lỗi.

## TC-CUSTOMER-007: Sửa thông tin thành viên
- **Bước**: Sửa → đổi Họ tên/SDT/Email → Lưu
- **Kỳ vọng**: PUT `/adminapi/customer` code 0, list + detail + API response đều thể hiện thay đổi.

## TC-CUSTOMER-008: Tìm kiếm theo tên/SDT
- **Bước**: Nhập từ khóa → Enter
- **Kỳ vọng**: Danh sách lọc đúng, API gửi query `keyword=...`.

## TC-CUSTOMER-009: Filter nâng cao (gói, giới tính, nguồn)
- **Bước**: Mở bộ lọc → chọn 2+ tiêu chí → Áp dụng
- **Kỳ vọng**: API nhận đủ params, kết quả chỉ gồm record thoả lọc.

## TC-CUSTOMER-010: Import Excel
- **Bước**: Click Import → chọn file mẫu → Upload
- **Kỳ vọng**: Preview lỗi/ổn, khi OK thì tạo batch record, API POST import code 0.

## TC-CUSTOMER-011: Export Excel
- **Bước**: Click Export
- **Kỳ vọng**: File tải về, data khớp filter hiện tại.

## TC-CUSTOMER-012: Xoá thành viên (mềm)
- **Bước**: Xoá record test → Xác nhận
- **Kỳ vọng**: DELETE code 0, record biến mất khỏi danh sách active, vẫn còn trong "đã xoá" nếu có.

## TC-CUSTOMER-013: Phân trang
- **Bước**: Chuyển trang 2, đổi page size
- **Kỳ vọng**: API gọi đúng `page` + `limit`, tổng count không đổi.

## TC-CUSTOMER-014: Phân quyền
- **Bước**: Đăng nhập bằng role không có `CUSTOMER_VIEW`
- **Kỳ vọng**: Menu ẩn / truy cập route trả 403 redirect.

## Cross-flow
- `TC-E2E-MEMBERSHIP`: Customer ↔ Gói thành viên ↔ Quota ↔ Check-in.
- `TC-E2E-POS-FINANCE`: Customer ↔ POS ↔ Công nợ.

**Script**: `node tests/test-customer-crud.mjs`
