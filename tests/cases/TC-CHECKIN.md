# TC-CHECKIN — Check-in / Cửa vào

Route: `/ch_checkin` · Component: `CHCheckinPage` · API: `/adminapi/community/checkin` (phỏng đoán, xác minh trong test)

## TC-CHECKIN-001: Mở trang check-in
- Kỳ vọng: UI hiển thị ô tìm member (SDT/QR), danh sách member đã check-in hôm nay.

## TC-CHECKIN-002: Check-in bằng SDT
- Bước: Nhập SDT member → chọn từ gợi ý → Xác nhận
- Kỳ vọng: API POST checkin code 0, member xuất hiện ở danh sách hôm nay, timestamp chính xác.

## TC-CHECKIN-003: Chặn check-in trùng trong ngày (tuỳ config)
- Kỳ vọng: Nếu cấu hình không cho double check-in → toast cảnh báo, API báo lỗi.

## TC-CHECKIN-004: Check-in cho member đã hết hạn gói
- Kỳ vọng: Cảnh báo "Hết hạn", có thể chặn hoặc yêu cầu gia hạn.

## TC-CHECKIN-005: Check-out
- Bước: Click member trong danh sách → Check-out
- Kỳ vọng: Ghi nhận thời gian ra, tính thời lượng.

## TC-CHECKIN-006: Lọc theo ngày / gói
- Kỳ vọng: Filter đúng, API nhận params.

## TC-CHECKIN-007: Phân quyền
- Role không có quyền check-in → ẩn menu.

## Cross-flow
- `TC-E2E-CHECKIN`: Check-in → book dịch vụ → trừ quota → báo cáo.

**Script**: `node tests/test-checkin-crud.mjs`
