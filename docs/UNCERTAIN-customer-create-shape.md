# UNCERTAIN — Shape request để tạo Customer

**Phát hiện**: `tests/test-customer-api.mjs` khi gọi POST `/adminapi/customer/update` với `id=0` (tạo mới).

## Hiện trạng
- GET `/adminapi/customer/list_paid` → 200, code 0 ✅
- POST `/adminapi/customer/update` (create) → 400 `{"error":"Input wrong"}`
- Đã thử body gồm các field từ `ICustomerRequest` (`src/model/customer/CustomerRequestModel.ts`): name, phone, gender, birthday, custType, careerId, avatar, firstCall, height, weight, trademark, taxCode, customerExtraInfos. Vẫn fail.

## Cần confirm
1. **BE trả error message chi tiết hơn** thay vì `"Input wrong"` — ghi rõ field nào sai, kỳ vọng gì. Ít nhất trả về mảng `errors: [{field, code, message}]`.
2. Shape tối thiểu hợp lệ để tạo customer qua `/adminapi/customer/update` là gì?
   - Có `careerId` bắt buộc không? Nếu không có career nào trong hệ thống test thì truyền giá trị gì?
   - Có `custType` bắt buộc? Enum cho phép những giá trị nào?
   - `customerExtraInfos` có cần gửi theo schema đặc biệt?
   - `sourceId` / `cgpId` / `branchId` — bắt buộc hay optional?
3. Có endpoint tạo nhanh riêng không (`/customer/create`) hay dùng `/customer/update` với id=0 là chính thống?

## Tác động tạm thời
Test `test-customer-api.mjs` chỉ pass các case list/search. Các case 002/002B/007/012 bị block cho tới khi confirm shape.

## Workaround đề xuất
- **Cách 1**: Ghi lại body request thực từ UI (mở DevTools → Network khi bấm "Lưu" lúc thêm mới) và dùng nguyên xi làm template seed.
- **Cách 2**: BE mở debug log 1 request fail để trả rõ field nào sai.
