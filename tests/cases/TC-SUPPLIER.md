# TC-SUPPLIER — Nhà cung cấp

Route: `/supplier` · Component: `SupplierPage` · Permission: `CUSTOMER_VIEW` · API: `/adminapi/supplier`

## TC-SUPPLIER-001: Mở danh sách
- Kỳ vọng: Bảng có Tên NCC, SDT, Email, Địa chỉ, Công nợ.

## TC-SUPPLIER-002: Tạo mới
- Bước: Thêm → Tên, SDT, Email, Địa chỉ, Ghi chú → Lưu
- Kỳ vọng: POST code 0, round-trip đúng.

## TC-SUPPLIER-003: Validate bắt buộc
- Kỳ vọng: Tên + SDT bắt buộc.

## TC-SUPPLIER-004: Validate SDT/Email
- Kỳ vọng: Định dạng hợp lệ.

## TC-SUPPLIER-005: Sửa
- Kỳ vọng: PUT code 0, cập nhật ngay.

## TC-SUPPLIER-006: Xoá (safety)
- Kỳ vọng: Nếu có công nợ/đơn nhập → chặn xoá; ngược lại xoá được.

## TC-SUPPLIER-007: Tìm kiếm / lọc
- Kỳ vọng: Filter theo tên/SDT/công nợ.

## TC-SUPPLIER-008: Phân quyền
- Role không có `CUSTOMER_VIEW` → ẩn menu.

**Script**: `node tests/test-supplier-crud.mjs`
