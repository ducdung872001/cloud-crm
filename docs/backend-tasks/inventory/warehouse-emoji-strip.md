# BACKEND-TASK — Warehouse name strip Emoji

**Phát hiện**: `tests/test-crud-advanced.mjs` — case UH-05 (Emoji trong tên kho).

## Hiện trạng
- Input tên kho: `"Kho 🏭🔥💯 Test"`
- Sau khi lưu + reload list → emoji biến mất, chỉ còn text `"Kho  Test"`.
- API không báo lỗi, lưu thành công nhưng mất ký tự.

## Giả thuyết
1. Cột DB (MySQL) dùng `utf8` thay vì `utf8mb4` → không lưu được ký tự 4-byte (emoji).
2. Có sanitizer ở BE lược bỏ ký tự ngoài BMP.

## Tác động
- UX: user nhập có emoji, save thành công, reload mất → tưởng lỗi.
- Không ảnh hưởng chức năng core nhưng gây nghi ngờ chất lượng.

## Yêu cầu fix
1. **Nếu do DB**: migrate cột `warehouse.name` (và các cột text khác) sang `utf8mb4` + collation `utf8mb4_unicode_ci`.
2. **Nếu do sanitizer**: cho phép ký tự Unicode 4-byte trong field name.
3. **Nếu chính sách không cho emoji**: BE phải return error message rõ ràng thay vì lưu rồi strip silent.

## Liên quan
Có thể áp dụng cho các module khác (supplier, customer, department...). Cần kiểm tra đồng bộ.
