# TC-SETTING-SELL — Danh mục dịch vụ / sản phẩm

Route: `/setting_sell` · Component: `SettingSellList` · Permission: `MENU_SETUP_SELL_VIEW`

## TC-SETTING-SELL-001: Mở trang
- Kỳ vọng: Tabs dịch vụ/sản phẩm/combo/danh mục.

## TC-SETTING-SELL-002: Tạo dịch vụ
- Bước: Thêm dịch vụ → Tên, giá, đơn vị, danh mục → Lưu
- Kỳ vọng: POST code 0, round-trip đúng.

## TC-SETTING-SELL-003: Tạo combo
- Kỳ vọng: Combo gồm ≥ 2 dịch vụ/sản phẩm con, tính giá đúng.

## TC-SETTING-SELL-004: Sửa / Xoá
- Kỳ vọng: PUT/DELETE code 0. Xoá có safety check nếu đã dùng trong đơn.

## TC-SETTING-SELL-005: Upload ảnh dịch vụ
- Kỳ vọng: Ảnh hiển thị, URL lưu đúng.

## TC-SETTING-SELL-006: Quản lý danh mục riêng
- Kỳ vọng: CRUD danh mục, gán dịch vụ vào danh mục.

**Script**: `node tests/test-setting-sell-crud.mjs`
