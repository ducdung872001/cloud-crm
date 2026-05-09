---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-09T09:41:00+07:00
slug: mentorhub-course-price-zero
status: posted
gh_issue: https://github.com/ducdung872001/cloud-sales-master/issues/30
severity: HIGH
---

# Bug: tất cả khoá học MentorHub hiển thị giá `0đ` ở danh sách

## Triệu chứng

Page `/crm/mh/courses` (list khoá học) hiển thị **tất cả khoá đều `0đ`** ở góc dưới-trái mỗi card, kể cả:
- 5 khoá seed bởi V10 migration (cloud-sales-master#24, được spec với `price=2400000`/`3500000`/v.v. trong handoff gốc)
- Khoá user vừa tạo qua `/crm/mh/courses/new` (form nhập 333.333đ, preview hiển thị đúng, save thành công, nhưng list trả về 0đ)

## FE đang đọc field gì

`MentorHub/Courses/index.tsx` → hàm `adaptService()`:
```ts
price:         Number(svc.price ?? 0),
originalPrice: Number(svc.retailPrice ?? svc.price ?? 0),
```

`SalesService` type ở `services/SalesServiceClient.ts` khai báo cả `price`, `retail`, `retailPrice`, `cost` — FE chọn `price` + `retailPrice` theo convention V7+.

## FE đang ghi field gì

`CourseEdit/index.tsx` save body:
```ts
price:        form.price === "" ? 0 : Number(form.price),
retailPrice:  form.originalPrice === "" ? 0 : Number(form.originalPrice),
```

→ POST `/sales/service/update` với `{ price: 333333, retailPrice: 444444, ... }`.

CourseEdit load existing course:
```ts
price:         typeof svc.price === "number" ? svc.price : "",
originalPrice: typeof svc.retailPrice === "number" ? svc.retailPrice : "",
```

## Nghi vấn (BE confirm giúp)

Một trong các khả năng sau:

1. **Field name mismatch**: BE entity dùng `cost` (hoặc tên khác) cho selling price, không phải `price`. FE đang đọc nhầm field → fallback 0.
2. **Seed V10 không set price**: V10 migration chỉ set `name` + `status` + `metadata` + `supplier_id`, không insert price/retail_price columns → DB default 0. Spec handoff `cloud-sales-master#24` có yêu cầu rõ price/retail_price (mục Spec 5 record mẫu) — cần BE verify đã chèn đúng chưa.
3. **Update endpoint không persist**: `POST /sales/service/update` không map `price`/`retailPrice` từ request body sang entity column → BE persist 0 dù FE gửi đúng.
4. **JSON serialize convention khác**: BE returns price dưới dạng string `"333333"` thay vì number → FE check `typeof svc.price === "number"` ở CourseEdit fail → form set "". Nhưng list adapter dùng `Number(svc.price ?? 0)` thì vẫn parse được string → loại trừ trừ khi BE trả `null`.

## Test BE cần chạy

```bash
TOKEN=<mentorhub employee token bsnId=6>

# 1. List, dump 1 record + check price field
curl -s "https://biz.reborn.vn/sales/service/list?type=COURSE_LIVE&supplierId=54&page=1&limit=1" \
  -H "Authorization: Bearer $TOKEN" -H "hostname: kcn.reborn.vn" | jq '.result.items[0]'

# Expected: { ..., "price": 2400000, "retailPrice": 3200000, ... }
# Reality: ?

# 2. Update endpoint round-trip
curl -sX POST "https://biz.reborn.vn/sales/service/update" \
  -H "Authorization: Bearer $TOKEN" -H "hostname: kcn.reborn.vn" \
  -H "Content-Type: application/json" \
  -d '{"id": <existing-srv-id>, "price": 1234567, "retailPrice": 9876543, ...}'

# Sau đó GET lại, verify price=1234567, retailPrice=9876543 trả về.

# 3. Inspect V10 seed
SELECT id, uid, name, price, retail_price, cost FROM service
WHERE bsn_id=6 AND uid LIKE 'srv-mh-seed-%';
# Expected: 5 row, price + retail_price > 0 đúng theo spec handoff #24 (mục "Spec 5 record mẫu").
```

## Việc cần BE làm

- [ ] Verify 4 nghi vấn trên qua test script.
- [ ] Nếu (1) field name khác → confirm field name đúng để FE adapter đọc.
- [ ] Nếu (2) seed thiếu → patch V10 hoặc viết V11 update price cho 5 record seed.
- [ ] Nếu (3) update không persist → fix mapping ở `ServiceController.update` / `ServiceService.update`.
- [ ] Reply trên cloud-crm với labels `reply-from-sales` + `to-mentorhub` kèm root cause + fix.

## Phân chia rõ scope theo Microservice

**Trong handoff này (sales-master):**
- [ ] Debug + fix theo 4 nghi vấn trên.
- [ ] Đảm bảo round-trip price/retailPrice (write → persist → read) hoạt động.

**KHÔNG thuộc handoff này:**

| Việc | Service | Ghi chú |
|------|---------|---------|
| Seed enrollment data (counter `registered`/`revenue`) | sales-master | Đã escalate ở comment cloud-sales#24 — separate scope |
| Customer/student fake data | customer-master | Tách riêng nếu cần |
| Currency formatting (VND vs USD) | FE only | Hiện FE format `Intl.NumberFormat("vi-VN")` — không liên quan field price |

## File FE liên quan (chỉ tham chiếu)

- List adapter: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/Courses/index.tsx (search `adaptService`)
- Save body: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/CourseEdit/index.tsx (search `retailPrice:`)
- Type: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/services/SalesServiceClient.ts (`SalesService`)

## Cross-link

- `cloud-sales-master#24` — origin V10 seed (closed completed, nhưng price không hiển thị → suggest reopen hoặc tạo issue follow-up)
- `cloud-sales-master#23` — category-item resource
- Reply gốc cloud-crm#229
