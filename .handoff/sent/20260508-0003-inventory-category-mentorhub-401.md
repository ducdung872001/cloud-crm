---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: inventory
created: 2026-05-08T00:03:00+07:00
slug: category-mentorhub-401
status: open
gh_issue: TBD (mở issue ở ducdung872001/cloud-inventory-master)
---

# `/inventory/category/list` & `/inventory/category/update` trả 401 cho tenant mentorhub

## Bối cảnh (Why)

FE MentorHub Phase 7 hoàn thành luồng "Tạo khoá học" (`/crm/mh/courses/new`). Khi user nhấn **Publish**, FE bootstrap categoryId mặc định cho khoá học MentorHub bằng 2 bước:

1. `GET /inventory/category/list?keyword=mentorhub&page=1&limit=1` — tìm category có sẵn.
2. Nếu rỗng → fallback `POST /inventory/category/update` với body `{name:"Khoá học mentorhub", avatar:"", parentId:0, position:0, active:1, featured:0}` để tạo mới.

Cả 2 request đều trả **401 Unauthorized** trong cùng một phiên đăng nhập đã hợp lệ → user không publish được khoá học.

## Triệu chứng

- Tài khoản mentorhub login bình thường, sidebar hiển thị tên user, các API khác cùng phiên trả 200 (vd. `/customer/employee/info`, `/customer/permission/resource`, `/category-product/list`).
- Header `Authorization: Bearer <token>` được gửi bởi `fetch-intercept` (FE đã verify ở `src/configs/fetchConfig.ts:42-44`).
- Header `Hostname: kcn.reborn.vn` (set cứng tạm thời cho mentorhub branch).
- Header `Selectedrole: <departmentId>_<id>` được gửi nếu `localStorage.SelectedRole` hợp lệ.
- BE phản hồi 401 → request đã chạm tới `inventory-service` nhưng filter auth từ chối.

## Endpoint bị lỗi

| Method | URL | Status |
|--------|-----|--------|
| GET | `/inventory/category/list?keyword=mentorhub&page=1&limit=1` | 401 |
| POST | `/inventory/category/update` (body category mới) | 401 |

So sánh: `GET /category-product/list?name=&page=1&limit=1000` (cũng đi qua prefix `/inventory` upstream nếu rebornBE route theo prefix khác) — **200 OK** cùng phiên.

## Khả năng nguyên nhân (BE xác minh)

1. `CategoryController` của `inventory-service` dùng strategy auth khác với `category-product`/anh em — yêu cầu permission scope mà role mặc định của employee mentorhub `bsnId=6` chưa có (vd. `INVENTORY_CATEGORY_READ`/`WRITE`).
2. Filter check tenant theo header `Hostname` — nếu BE map `kcn.reborn.vn → bsnId(kcn)` thay vì `bsnId(mentorhub)`, request bị reject. (Hostname đang fix cứng tạm — sẽ refactor sau khi BE confirm cơ chế đúng.)
3. Bug auth filter trong `inventory-service`: kiểm tra sai branch khi `keyword` query param có giá trị (test 200 không keyword, 401 có keyword).

## Việc cần làm — INVENTORY-SERVICE only

**Đây là handoff phạm vi inventory.** Các task dưới đây CHỈ thuộc trách nhiệm `inventory-service`. Không yêu cầu inventory team làm seed/migration/cron của tenant khác.

- [ ] Reproduce: gọi 2 endpoint trên với token mentorhub `bsnId=6`, header `Hostname: kcn.reborn.vn` → confirm 401.
- [ ] So sánh middleware/filter của `CategoryController` với `CategoryProductController` (đang OK) — đồng bộ rule auth.
- [ ] Mở quyền `INVENTORY_CATEGORY_READ` + `INVENTORY_CATEGORY_WRITE` mặc định cho role employee tenant mentorhub, hoặc relax check cho action list/lookup.
- [ ] Verify resolve `bsnId` từ token JWT thay vì dựa header Hostname (Hostname header không đáng tin trong dev/cross-domain).
- [ ] Test case BE (Postman/curl) thêm vào regression:
  - GET list keyword="mentorhub" → 200 + items[]
  - GET list (không keyword) → 200
  - POST update với body mentorhub → 200 + result.id
  - Permission denied case (token không hợp lệ) → 401 (giữ behavior cũ)

## KHÔNG thuộc handoff này (xác định để khỏi nhầm phạm vi)

| Task | Microservice phụ trách | Ghi chú |
|------|------------------------|---------|
| Seed category "Khoá học mentorhub" cho tenant mentorhub khi onboarding | `customer` hoặc `org` (tenant lifecycle) | Sau khi inventory mở quyền, có thể tách handoff riêng nếu muốn pre-seed. Hiện tại FE đã có fallback create on-the-fly. |
| Tự động gắn `bsnId=6` vào header request khi mentorhub tenant đăng nhập | `customer` (auth flow) | FE hiện set Hostname cứng = `kcn.reborn.vn` — task refactor sau khi BE thống nhất cơ chế multi-tenant. |
| Permission seed `INVENTORY_CATEGORY_*` vào role mentorhub | `customer/permission` (RBAC service) | Có thể chỉ cần inventory hardcode default + customer team sync role list, hoặc inventory service handle giúp lúc check. Inventory team quyết định cách phối hợp. |
| Tạo category-product / catalog cho khoá học | Không cần (khoá học MentorHub dùng `categoryService`, không phải `categoryProduct`) | Reference only |

## File FE liên quan (chỉ tham chiếu, không sửa)

- Bootstrap logic: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/CourseEdit/index.tsx (hàm `useEffect` resolve categoryId, sử dụng `apiGet` + `apiPost`)
- Fetch interceptor (cách FE set header auth): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/fetchConfig.ts
- URL config: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/urls.ts (search `categoryService`)
- Bug doc chi tiết hơn (FE side): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/docs/backend-tasks/mentorhub/BUG-inventory-category-401-on-mentorhub.md

## Cross-link

- mentorhub-be Phase 7 handoff: nếu service mentorhub-be quản lý course catalog, có thể tự maintain category cục bộ thay vì gọi `inventory/category` (decision sau).
- customer#7 (mentor public profile editor): độc lập, không phụ thuộc fix này.

## Tiêu chí done

- [ ] 2 endpoint trả 200 với token mentorhub trong môi trường dev (`biz.reborn.vn`).
- [ ] Postman collection / curl example đính kèm trong PR BE.
- [ ] Smoke test: FE `/crm/mh/courses/new` publish thành công, hết alert "Chưa có category mặc định cho mentorhub".
- [ ] Regression: tenant khác (vd. retail) không bị thay đổi quyền category ngoài ý muốn.

## Liên hệ

- FE owner: mentorhub branch maintainer
- Cần ETA → reply trực tiếp vào GH issue khi mở.
