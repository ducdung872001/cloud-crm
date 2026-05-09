> Handoff từ FE mentorhub — branch `reborn-mentorhub`.
> Source: `.handoff/sent/20260509-0925-sales-mentorhub-seed-category-item.md`


# Seed default `category-item` cho tenant MentorHub `bsnId=6`

## Bối cảnh (Why)

Endpoint `GET /sales/category-item/list` (CategoryItemResource.java) đã ship per cloud-sales-master#23 — verified return 200:

```json
{ "code": 0, "message": "OK", "result": { "total": 0, "page": 1, "items": [], "loadMoreAble": false, "preLoadAble": null } }
```

Nhưng tenant `bsnId=6` (mentorhub) chưa có record nào → FE bootstrap useEffect ở `CourseEdit/index.tsx` (resolve default categoryId qua keyword "mentorhub") không match → set saveError "Chưa có category mặc định cho mentorhub — liên hệ admin" → user không publish được khoá học.

FE đã thử fallback auto-create qua `POST /sales/category-item/update` ở client side, nhưng cách này không scalable cho 6+ tenant cần seed cùng lúc và không idempotent. BE đã expose endpoint `POST /sales/category-item/bulk-create` (idempotent, designed cho onboarding tenant) — cần BE/ops chạy seed bằng endpoint này.

## Việc cần làm — SALES microservice

### 1. Seed 6 default `category-item` cho `bsn_id=6`

Body call `POST /sales/category-item/bulk-create`:

```json
{
  "items": [
    { "name": "Kỹ thuật phần mềm", "position": 0 },
    { "name": "Quản lý sản phẩm",  "position": 1 },
    { "name": "Leadership",         "position": 2 },
    { "name": "Data & AI",          "position": 3 },
    { "name": "DevOps",             "position": 4 },
    { "name": "Khác",               "position": 5 }
  ]
}
```

Header tenant scope theo cơ chế hiện tại (Hostname + Authorization của employee mentorhub `bsnId=6`).

Mỗi record cần các field default:
- `bsn_id = 6`
- `parent_id = 0` (root level)
- `level = 1` (per spec list endpoint default level=2 → seed level=1 root để hiển thị)
- `active = 1`
- `type = 1` (default theo spec list endpoint)

### 2. Lựa chọn ai chạy seed

Đề xuất 2 option, BE sales team quyết định:

**Option A — Chạy 1 lần thủ công (recommended cho mentorhub hiện tại):**
- DevOps/BE chạy curl/Postman với token admin của tenant bsnId=6.
- Đơn giản, không tốn dev time. Hợp với scope chỉ 1 tenant mentorhub.

**Option B — Auto-seed lúc onboarding tenant (longer term):**
- Customer/org service nhận event `tenant_created(flavor=mentorhub)` → call sales `bulk-create` với 6 default items.
- Cần handoff thêm cho `customer/org` team (có thể raise sau).
- Hợp với multi-tenant scale khi có thêm mentorhub tenants.

### 3. Acceptance criteria

- [ ] `GET /sales/category-item/list?keyword=&page=1&limit=20` với token employee mentorhub `bsnId=6` trả 6 items đúng tên/position trên.
- [ ] `GET /sales/category-item/list?keyword=mentorhub&page=1&limit=1` không nhất thiết match (vì tên không chứa "mentorhub" — FE sẽ điều chỉnh keyword search hoặc bỏ filter).
- [ ] `POST bulk-create` chạy lần 2 với cùng body không tạo duplicate (idempotent verify).
- [ ] FE smoke `/crm/mh/courses/new` → không còn alert đỏ "Chưa có category mặc định cho mentorhub", publish khoá học thành công.

### 4. FE follow-up sau khi seed xong

- Update `DEFAULT_CATEGORY_KEYWORD` ở `CourseEdit/index.tsx`: keyword "mentorhub" → đổi sang lấy item đầu tiên trong list (vì 6 default items không chứa từ "mentorhub" trong name).
- Hoặc đổi cách bootstrap: list không filter, lấy item đầu tiên (`level=1, type=1, active=1, bsn_id=6`).
- FE-side change này nhỏ, sẽ ship cùng turn khi BE confirm seed xong.

## Phân chia rõ scope theo Microservice

**Trong handoff này (sales-master):**

- [ ] Chạy seed `bulk-create` 6 items cho `bsn_id=6` (Option A) HOẶC implement listener `tenant_created` (Option B).
- [ ] Document curl/script đã chạy trong PR description để team khác replicate cho tenant mới.

**KHÔNG thuộc handoff này:**

| Việc | Service phụ trách | Ghi chú |
|------|-------------------|---------|
| Auto-seed onboarding cho tenant mentorhub mới | `customer`/`org` (tenant lifecycle) | Raise handoff riêng nếu chọn Option B |
| RBAC permission `SALES_SERVICE_CATEGORY_WRITE` cho mentorhub employee | `customer/permission` | Để user có thể tạo category mới qua CategorySelect modal |
| Backfill `metadata.categoryId` cho 5 sample courses (handoff sales#24) | `sales-master` (nội bộ) | Sau khi seed xong, update `service.category_id` cho 5 record sample courses |

## File FE liên quan (chỉ tham chiếu)

- Bootstrap call: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/CourseEdit/index.tsx (search `ServiceCategoryService.list`)
- Service client: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/services/ServiceCategoryService.ts
- URL config: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/urls.ts (search `salesServiceCategory`)
- Default categories list (FE mock — đồng bộ với seed): https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/mocks/mentorhub/index.ts (search `MENTORHUB_DEFAULT_CATEGORIES`)

## Cross-link

- `cloud-sales-master#23` — origin handoff: ship `category-item` resource (DONE)
- `cloud-sales-master#24` — seed 5 sample courses (cũng cần BE seed, related work)
- Bug doc FE side: page `/crm/mh/courses/new` show alert đỏ — sẽ resolve sau khi seed xong

## Liên hệ

- FE owner: mentorhub branch maintainer
- Khi seed xong, BE comment trên cloud-crm với labels `reply-from-sales` + `to-mentorhub` để FE smoke-test.
