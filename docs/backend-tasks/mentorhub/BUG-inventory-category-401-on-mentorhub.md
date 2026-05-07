# BUG (BE): `/inventory/category/list` và `/inventory/category/update` trả 401 Unauthorized cho tài khoản đã đăng nhập

## Triệu chứng

Trên trang tạo khoá học MentorHub (`/crm/mh/courses/new`), FE cần resolve một category mặc định bằng cách gọi:

```
GET https://biz.reborn.vn/inventory/category/list?keyword=mentorhub&page=1&limit=1
```

→ Phản hồi **401 Unauthorized**.

Nếu danh sách rỗng, FE fallback tự tạo category bằng:

```
POST https://biz.reborn.vn/inventory/category/update
Body: { name: "Khoá học mentorhub", avatar: "", parentId: 0, position: 0, active: 1, featured: 0 }
```

→ Cũng **401 Unauthorized**.

Kết quả: nút "Publish khoá học" luôn báo lỗi đỏ "Chưa có category mặc định cho mentorhub — liên hệ admin", không thể publish.

## Bằng chứng

- Tài khoản đang đăng nhập bình thường (sidebar hiển thị "Hòa Phạm — 0971234599"); các API khác (`/customer/employee/info`, `/category-product/list?name=...`, …) cùng phiên đều trả 200.
- Header `Authorization: Bearer <token>` đã được gửi (đã verify bằng `src/configs/fetchConfig.ts:42-44`).
- Header `Hostname: kcn.reborn.vn` được set cứng (`fetchConfig.ts:57`).
- Header `Selectedrole: <departmentId>_<id>` cũng được gửi nếu có.
- Status code 401 đến từ BE — request đã chạm tới service.

## Khả năng nguyên nhân (BE cần xác minh)

1. Endpoint `/inventory/category/*` đang yêu cầu một permission/scope mà tài khoản mentorhub `bsnId=6` không có (so sánh với `/category-product/list` — endpoint khác, response 200 cùng tài khoản).
2. Filter theo `Hostname: kcn.reborn.vn` không map được sang `bsnId` của tenant mentorhub (`kcn` là tenant cũ — fix cứng tạm thời ở FE) → BE từ chối.
3. Service `inventory` chưa whitelist token loại "employee" của mentorhub, hoặc thiếu mapping role → endpoint.
4. Bug thật trong `CategoryController` của `inventory-service`: kiểm tra auth sai branch khi `keyword` được set.

## Test case BE cần verify

| # | Method | URL | Header | Expected |
|---|--------|-----|--------|---------|
| 1 | GET | `/inventory/category/list?keyword=mentorhub&page=1&limit=1` | `Authorization: Bearer <token-mentorhub>`, `Hostname: kcn.reborn.vn` | 200 + items[] (rỗng cũng được) |
| 2 | POST | `/inventory/category/update` body `{name:"Khoá học mentorhub", avatar:"", parentId:0, position:0, active:1, featured:0}` | như trên | 200 + result.id |
| 3 | GET | `/inventory/category/list` (không keyword) | như trên | 200 (đối chiếu test 1) |

## Đề xuất fix BE

- Trong `CategoryController` (`inventory-service`), verify rule check permission khớp với các endpoint anh em (`/category-product/list` đang OK) — có thể đang dùng strategy khác.
- Đảm bảo employee thuộc `bsnId=6` (mentorhub tenant) có quyền `INVENTORY_CATEGORY_READ` và `INVENTORY_CATEGORY_WRITE` mặc định, hoặc relax check khi action chỉ là list/lookup.
- Nếu intent là "category service phải scope theo bsnId qua Hostname header", cập nhật mapping `kcn.reborn.vn → bsnId(mentorhub)` hoặc dùng `bsnId` từ token thay vì Hostname header.

## Liên quan FE

- File ảnh hưởng: `src/pages/MentorHub/CourseEdit/index.tsx` (function bootstrap categoryId).
- FE đã add fallback: nếu list rỗng thì tự tạo bằng `categoryService.update`. Cả hai bước đều rớt 401 → bắt buộc BE phải mở quyền/sửa logic.

## Repro nhanh

1. Đăng nhập tenant mentorhub (`kcn.reborn.vn` hoặc đổi Hostname header).
2. Truy cập `/crm/mh/courses/new`.
3. Mở DevTools → Network.
4. Quan sát request `inventory/category/list` → 401.
5. Bấm "Publish khoá học" → request `inventory/category/update` → 401, alert đỏ "Chưa có category mặc định cho mentorhub".
