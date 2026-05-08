---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: inventory
created: 2026-05-08T19:18:00+07:00
slug: category-clarify-reply
status: closed
resolution: re-routed-to-sales
gh_issue: https://github.com/ducdung872001/cloud-crm/issues/226#issuecomment-4406403416
gh_close_comment: https://github.com/ducdung872001/cloud-crm/issues/226#issuecomment-4406475697
re_routed_to: https://github.com/ducdung872001/cloud-sales-master/issues/23
related_reply: https://github.com/ducdung872001/cloud-crm/issues/226
related_origin: https://github.com/ducdung872001/cloud-inventory-master/issues/43
note: |
  BE inventory đóng #226 với state_reason=not_planned. Re-route sang sales#23
  để build service_category thuộc namespace /sales/service-category/* (taxonomy
  theo owner entity: dịch vụ thuộc sales, sản phẩm thuộc inventory).
  Permission name đổi: INVENTORY_CATEGORY_WRITE → SALES_SERVICE_CATEGORY_WRITE.
---

# Clarify-reply: course-catalog-mentorhub category model

Reply lại câu hỏi từ BE inventory trong `cloud-crm#226` (label `reply-from-inventory` + `to-mentorhub`). Liên quan đến handoff gốc `cloud-inventory-master#43`.

Body issue này có thể paste làm comment trên #226 HOẶC làm body issue mới `[clarify-reply]` trên `cloud-inventory-master` (label `from-mentorhub`). Cả 2 đều OK theo reply protocol.

---

## Q1. Thay `metadata.category` (string) bằng `categoryId` (FK ref `category_item`)? — **Y, accept.**

**Lý do FE đồng ý:**

- Single source of truth: hết case dup-by-typo (`Kỹ thuật phần mềm` vs `Kỹ thuật Phần Mềm`).
- BE-driven taxonomy: admin sửa danh mục không cần FE deploy.
- Aggregation/report (DashBoard, Marketing, Feedback group-by-category) consistency.
- Hợp với hướng inventory đang đi (MentorHub courses dùng chung category service với retail catalog → giảm dual-stack).
- FE đã có client `CategoryServiceService` + endpoint `urlsApi.categoryService.list` sẵn — không tốn thêm client lib.

**FE đề nghị về migration:**

- BE backfill 1 lần: parse `metadata.category` string của các SalesService hiện có → match-or-create `category_item` cùng tên → ghi `metadata.categoryId`. Giữ nguyên `metadata.category` string thêm 1 release làm fallback đọc, sau đó drop ở release kế.
- FE write path: từ release tới sẽ ghi `categoryId` + `categoryName` (denormalized cho display). Không ghi `metadata.category` nữa.
- FE read path: ưu tiên `metadata.categoryId` → resolve via `categoryService.detail` (cache); fallback `metadata.category` string (legacy). Sẽ remove fallback khi backfill xong.

**Hardcoded mentorhub categories hiện tại (FE):**

```
["Kỹ thuật phần mềm", "Quản lý sản phẩm", "Leadership", "Data & AI", "DevOps", "Khác"]
```

→ 6 record này nên được seed sẵn cho tenant `bsnId=6` (xem Q3).

---

## Q2. Modal-in-modal hay trang riêng để tạo category mới? — **Modal-in-modal (lightweight inline create).**

**Lý do:**

- `CourseEdit` là form 6-step có nhiều state nặng (Slate richtext content, agenda items, sessions, Zoom config, …). Force user qua trang `/categories` rồi back → high risk mất work hoặc reset form.
- Pattern modal-in-modal là chuẩn cho "create-on-the-fly lookup" trong CRM (tạo customer mới từ invoice flow, tạo product từ order flow đã có sẵn).

**Spec UI FE sẽ ship:**

- Replace `<select>` chuyên mục bằng `CategorySelect` component (react-select-async-paginate) gọi `categoryService.list({keyword, page, limit:20})`.
- Option cuối cùng có sẵn `+ Tạo danh mục mới` (gated bởi permission `INVENTORY_CATEGORY_WRITE` — nếu không có quyền không hiện).
- Click → mở `<Modal>` inline (z-index trên ModalCourseEdit) với form: `name` (required), `parentId` (optional, dropdown từ cùng list). Submit gọi `categoryService.update` → success → refresh list trong AsyncPaginate + auto-select category vừa tạo.
- Esc/click-outside chỉ đóng inner modal, không đụng outer CourseEdit.

**Cần BE confirm:**

- Endpoint `categoryService.update` có support tạo mới không (id=0 hoặc omit)? Hay phải dùng endpoint riêng `category/create`?
- Khi tạo mới, BE có cần thêm header tenant scope nào không (ngoài `Authorization` + `Hostname`)?

---

## Q3. Ai seed category mặc định cho tenant mới? — **`customer` / `org` (tenant lifecycle), KHÔNG phải `inventory`.**

**Lý do FE đề xuất chia task:**

| Service | Trách nhiệm |
|---------|-------------|
| `inventory` | Sở hữu schema `category_item` + CRUD endpoint. KHÔNG cần biết default values per tenant type (mentorhub vs retail vs beauty). |
| `customer` / `org` | Sở hữu tenant onboarding workflow. Khi tạo tenant kiểu `mentorhub`, gọi `inventory.category.bulk-create` để seed 6 default. |
| `mentorhub-be` (nếu thành lập riêng) | Có thể own danh sách default categories chuẩn cho mentorhub (theo flavor: tech mentor vs leadership vs language teaching) → push vào customer/org seed flow. |

**Đề xuất phối hợp:**

- inventory expose 1 endpoint mới `POST /inventory/category/bulk-create` với body `{tenantBsnId, items: [{name, position}]}` — idempotent (skip nếu name đã tồn tại trong tenant). Đây là task của inventory team.
- customer/org gọi endpoint này trong onboarding handler khi tenant flavor = mentorhub. Đây là handoff riêng cho `customer` (sẽ raise sau khi BE inventory xác nhận spec endpoint).
- FE auto-create fallback hiện tại (commit `2173d368`) là **band-aid tạm**: nếu list rỗng thì FE tự tạo "Khoá học mentorhub" qua `categoryService.update`. Sẽ remove fallback khi customer/org seed flow ship.

---

## FE work in parallel (đã/sẽ ship cùng release)

- [x] Mock update — `MOCK_COURSES` thêm `categoryId` + `categoryName` (transition shape, FE đã commit).
- [x] Scaffold `CategorySelect` component dùng AsyncPaginate (FE đã commit, chưa wire vào CourseEdit để chờ BE confirm spec endpoint).
- [ ] Wire `CategorySelect` vào CourseEdit Step 1 (replace `<select>` hardcoded) — sẽ ship sau khi:
  1. BE inventory mở 401 cho `/inventory/category/list` + `/update` (xem handoff `cloud-inventory-master#TBD` — file `.handoff/sent/20260508-0003-inventory-category-mentorhub-401.md`).
  2. BE inventory confirm spec `update` có dùng được làm create không (Q2).
- [ ] Read path migration: `metadata.categoryId` ưu tiên, `metadata.category` legacy.
- [ ] Remove auto-create fallback ở `CourseEdit` sau khi customer/org seed ship.

## Cross-link

- Chặn bởi: `cloud-inventory-master#43` (origin) + handoff 401 mới (`.handoff/sent/20260508-0003-inventory-category-mentorhub-401.md`).
- Sẽ raise tiếp: handoff cho `customer` (tenant onboarding seed flow) — sau khi inventory confirm bulk-create endpoint spec.

## Phân chia rõ scope theo Microservice

**Trong handoff này (inventory phải làm):**
1. Confirm/reject spec FE đề xuất ở Q2 (modal-in-modal create — endpoint `update` có làm create không).
2. Confirm/reject expose endpoint mới `POST /inventory/category/bulk-create` cho customer/org gọi onboarding.
3. Mở quyền cho mentorhub tenant access `/inventory/category/*` (đã raise riêng ở handoff 401).

**KHÔNG thuộc handoff này:**

| Việc | Thuộc service | Ghi chú |
|------|---------------|---------|
| Seed 6 default categories cho tenant mentorhub | `customer`/`org` (sau khi inventory expose bulk-create) | Sẽ raise handoff riêng |
| Backfill `metadata.category` string → `categoryId` | `sales` (sở hữu SalesService entity) | Sẽ raise handoff riêng nếu inventory chấp nhận hướng categoryId |
| RBAC permission seed `INVENTORY_CATEGORY_WRITE` | `customer/permission` | Inventory chỉ định check permission name; ai seed RBAC là customer team |
