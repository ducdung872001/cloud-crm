# TC-PROMOTION — Khuyến mãi & Voucher

Route: `/promotional_program` · Component: `PromotionalProgram` · API: `/adminapi/promotion`, `/adminapi/voucher`

## TC-PROMOTION-001: Mở danh sách chương trình
- Kỳ vọng: Bảng có Tên CT, Loại (voucher/flat/percent), Thời gian, Trạng thái.

## TC-PROMOTION-002: Tạo chương trình khuyến mãi %
- Bước: Thêm → Tên, loại %, mức 10%, thời gian, điều kiện (min order, sản phẩm áp dụng) → Lưu
- Kỳ vọng: POST code 0, chi tiết đúng round-trip.

## TC-PROMOTION-003: Tạo voucher code
- Bước: Thêm → Loại voucher → Mã code, giá trị cố định, số lượng, hạn sử dụng → Lưu
- Kỳ vọng: Code được sinh/nhận, trùng code → chặn.

## TC-PROMOTION-004: Validate thời gian (end > start)
- Kỳ vọng: Error nếu end ≤ start.

## TC-PROMOTION-005: Sửa chương trình đang chạy
- Kỳ vọng: Cho phép hoặc chặn (theo nghiệp vụ) — ghi chú vào UNCERTAIN nếu không rõ.

## TC-PROMOTION-006: Kích hoạt / Dừng
- Kỳ vọng: Trạng thái đổi, áp dụng tức thời trên POS.

## TC-PROMOTION-007: Xoá chương trình
- Kỳ vọng: Nếu đã có đơn dùng → chặn / cảnh báo.

## TC-PROMOTION-008: Filter theo trạng thái/loại
- Kỳ vọng: Lọc đúng.

**Cross-flow**: `TC-E2E-PROMOTION` — tạo voucher → áp dụng vào đơn POS → doanh thu thực đúng.

**Script**: `node tests/test-promotion-crud.mjs`
