# TC-MEMBERSHIP-PLAN — Gói thành viên

Route: `/ch_membership_plans` · Component: `CHMembershipPlanSettings`

## TC-MEMBERSHIP-PLAN-001: Mở danh sách gói
- Kỳ vọng: Bảng có Tên gói, Thời hạn, Giá, Quota dịch vụ, Trạng thái.

## TC-MEMBERSHIP-PLAN-002: Tạo gói mới
- Bước: Thêm → Tên, thời hạn (tháng), giá, danh sách dịch vụ + số lượt → Lưu
- Kỳ vọng: POST code 0, round-trip đủ field.

## TC-MEMBERSHIP-PLAN-003: Validate giá ≥ 0, thời hạn > 0
- Kỳ vọng: Error.

## TC-MEMBERSHIP-PLAN-004: Sửa gói
- Kỳ vọng: PUT code 0.

## TC-MEMBERSHIP-PLAN-005: Xoá gói
- Kỳ vọng: Nếu có member đang dùng → chặn; ngược lại cho phép.

## TC-MEMBERSHIP-PLAN-006: Quota dịch vụ liên kết đúng
- Kỳ vọng: Dịch vụ nằm trong danh mục `/setting_sell`.

**Cross-flow**: `TC-E2E-MEMBERSHIP`.

**Script**: `node tests/test-membership-plan-crud.mjs`
