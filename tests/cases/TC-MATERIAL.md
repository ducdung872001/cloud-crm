# TC-MATERIAL — Nguyên vật liệu

Route: `/material` · Component: `MaterialList` · API: `/adminapi/material`
Điều kiện: tenant_config.warehouse_enabled = true

## TC-MATERIAL-001: Mở danh sách
- Kỳ vọng: Bảng có cột Tên NVL, Đơn vị, Tồn, Giá nhập BQ, Danh mục.

## TC-MATERIAL-002: Tạo NVL mới
- Bước: Thêm mới → Tên, Đơn vị, Danh mục, Giá nhập → Lưu
- Kỳ vọng: API POST code 0, record xuất hiện, round-trip đúng.

## TC-MATERIAL-003: Validate tên không rỗng, đơn vị bắt buộc
- Kỳ vọng: Error inline.

## TC-MATERIAL-004: Trùng tên NVL
- Kỳ vọng: Backend chặn hoặc cho phép — cần xác minh (ghi vào UNCERTAIN nếu khác kỳ vọng).

## TC-MATERIAL-005: Sửa NVL
- Kỳ vọng: PUT code 0, thay đổi hiển thị ngay.

## TC-MATERIAL-006: Xoá NVL
- Kỳ vọng: Nếu còn tồn kho > 0 hoặc đã dùng trong đơn → chặn xoá (safety). Ghi BACKEND-TASK nếu xoá cả khi có data.

## TC-MATERIAL-007: Import Excel NVL
- Kỳ vọng: Preview → OK → tạo batch.

## TC-MATERIAL-008: Export NVL
- Kỳ vọng: File khớp filter.

## TC-MATERIAL-009: Tìm kiếm / filter danh mục
- Kỳ vọng: Lọc đúng.

## TC-MATERIAL-010: Quản lý danh mục NVL
- Kỳ vọng: CRUD danh mục riêng, gán NVL vào danh mục.

**Cross-flow**: `TC-E2E-INVENTORY` — nhập/xuất NVL → kho → báo cáo.

**Script**: `node tests/test-material-crud.mjs`
