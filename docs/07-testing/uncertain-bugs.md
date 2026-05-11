# Bugs Còn Mở — Cần Đánh Giá Thêm

**Cập nhật:** 2026-04-13

Các bug dưới đây chưa fix vì thiếu thông tin hoặc cần phối hợp FE+BE. Các bug sprint trước đã đóng đều được xác thực qua E2E test và không còn ở đây.

---

## 1. D.4.2 — Tồn POS không nhất quán khi chọn biến thể

- **Module:** FE — `VariantModal` trong `CounterSales`
- **Mô tả:** POS grid hiển thị tổng tồn kho đúng (chỉ cộng kho `is_selling=1` — đã verify qua `test-multi-warehouse-stock.mjs`), nhưng khi mở `VariantModal` chọn biến thể, số tồn hiển thị có thể khác (không filter theo warehouse bán).
- **Lý do không chắc:** `VariantModal` gọi `/inventoryBalance/variant/list` nhưng không truyền `warehouseId` → BE có thể trả tổng tất cả kho thay vì chỉ kho đang bán.
- **Cần:**
  - FE: truyền `warehouseId` (default = kho is_selling) vào params
  - Hoặc BE: endpoint này default đã filter `is_selling=1` giống `/product/list`?
- **Độ ưu tiên:** MEDIUM — ảnh hưởng quyết định bán cho khách khi hết stock ở biến thể cụ thể.

## 2. C.5.3 — Lỗi vận chuyển generic

- **Module:** FE — flow đơn vận chuyển
- **Mô tả:** Khi tạo đơn ship fail, FE chỉ hiển thị toast generic "Có lỗi xảy ra" mà không map thành text cụ thể (thiếu địa chỉ? thiếu phone? KH không có quyền? dịch vụ không hỗ trợ khu vực?).
- **Cần:**
  - BE cung cấp bảng error codes + message cho shipping module
  - FE map `errorCode` → text tiếng Việt cho người dùng
- **Độ ưu tiên:** MEDIUM — UX kém, người dùng không biết sửa thông tin gì.

---

## Đã loại bỏ

Các bug cũ đã đóng và không còn trong doc này:
- **C.1.4, C.3.8, D.1.1, F.6.2**: ✅ FIXED — verified qua retest
- **Sprint bugs C.x.x / D.x.x / E.x.x**: tổng cộng ~21/22 bug đã fix, còn 2 bug trên giữ lại ở đây
