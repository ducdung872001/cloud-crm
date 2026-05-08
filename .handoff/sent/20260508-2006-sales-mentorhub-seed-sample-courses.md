---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-08T20:06:00+07:00
slug: mentorhub-seed-sample-courses
status: open
gh_issue: TBD (mở issue ở ducdung872001/cloud-sales-master, label from-mentorhub)
severity: MEDIUM
---

# Seed dữ liệu mẫu khoá học MentorHub cho tenant `bsnId=6`

## Bối cảnh (Why)

FE đã wire xong `MentorHub/Courses/index.tsx` gọi `GET /sales/service/list?type=COURSE_LIVE&supplierId={idEmployee}` (commit `f24f6f41` + handoff cũ `20260502-1138-sales-course-catalog-mentorhub-rerouted` đã ship). Hiện tại tenant mentorhub `bsnId=6` chưa có bất kỳ `service` record nào type `COURSE_LIVE` → page `/crm/mh/courses` hiển thị empty state "Chưa có khoá học nào".

Stakeholder demo + UAT sắp tới cần data sẵn để kiểm thử filter (Đang live / Sắp bắt đầu / Nháp / Đã kết thúc), Marketing page, Feedback page, Calendar page, public Portal pages — tất cả page này đều render từ `salesService.list` với filter status khác nhau.

## Việc cần BE sales làm

### 1. Migration / seed script

Thêm `V8__seed_mentorhub_sample_courses.sql` (hoặc tên tương tự theo convention sales) chèn 5 record vào `prod_clouddb_sales.service` với:

| Field | Giá trị |
|-------|---------|
| `bsn_id` | `6` (mentorhub tenant) |
| `type` | `COURSE_LIVE` |
| `supplier_id` | `54` (mentor mặc định — Hòa Phạm; xác nhận lại với customer team nếu khác) |
| `category_id` | NULL (chờ sales#23 ship `service_category` rồi update sau) |
| `category_name` | "Kỹ thuật phần mềm" / "DevOps" / "Leadership" (denorm cho display, sau sẽ replace bằng FK) |
| `active` | `1` |
| `content_type` | `0` |

### 2. Spec 5 record mẫu (mirror MOCK_COURSES của FE)

Để FE smoke-test filter UI cover đủ status, BE seed 5 khoá:

```yaml
- name: "Kiến trúc Microservices với Spring Boot & Kubernetes"
  intro: "Khoá học chuyên sâu về thiết kế và triển khai microservices với Spring Boot, K8s, service mesh."
  status: "ACTIVE"               # → FE map "live"
  price: 2400000
  retail_price: 3200000
  metadata:
    icon: "⎈"
    category: "Kỹ thuật phần mềm"
    sessions: 8
    sessionsDone: 4
    capacity: 30
    startDate: "2026-04-01"
    zoomId: "123-3456-1234"
    reminderZalo: true
    reminderEmail: true
    autoFeedback: true
    autoRecording: true
    agenda: [...12 items mô tả 8 buổi]    # tham khảo MOCK_COURSES.AGENDA shape

- name: "System Design Deep Dive cho Senior Engineers"
  intro: "Phân tích case study lớn (Netflix, Uber, WhatsApp) — tập trung trade-off CAP, sharding, caching."
  status: "ACTIVE"               # → FE map "upcoming" nếu sessionsDone=0
  price: 3500000
  retail_price: 3500000
  metadata:
    icon: "∞"
    category: "Kỹ thuật phần mềm"
    sessions: 12
    sessionsDone: 0
    capacity: 30
    startDate: "2026-06-01"
    ...

- name: "Domain-Driven Design căn bản"
  intro: "Aggregate, Entity, Value Object, Bounded Context — áp dụng DDD vào codebase Java/Spring."
  status: "ARCHIVED"             # → FE map "ended"
  price: 1800000
  retail_price: 1800000
  metadata:
    icon: "◈"
    category: "Kỹ thuật phần mềm"
    sessions: 8
    sessionsDone: 8
    capacity: 30
    startDate: "2026-02-01"
    ...

- name: "Event-Driven Architecture với Kafka"
  intro: "Producer/Consumer pattern, schema evolution, partition strategy, exactly-once semantics."
  status: "ACTIVE"
  price: 2100000
  retail_price: 2800000
  metadata:
    icon: "⚡"
    category: "DevOps"
    sessions: 6
    sessionsDone: 3
    capacity: 25
    startDate: "2026-04-15"
    ...

- name: "Leadership cho Engineering Managers mới"
  intro: "Từ tech lead lên engineering manager — feedback, 1-on-1, hiring, performance review."
  status: "DRAFT"                # → FE map "draft"
  price: 4200000
  retail_price: 4200000
  metadata:
    icon: "★"
    category: "Leadership"
    sessions: 10
    sessionsDone: 0
    capacity: 20
    startDate: NULL
    ...
```

Reference đầy đủ shape: [src/mocks/mentorhub/index.ts](https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/mocks/mentorhub/index.ts) — `MOCK_COURSES`. Mỗi record cần đồng bộ ít nhất `name`, `intro`, `status`, `price`, `retail_price`, `metadata.icon`, `metadata.category`, `metadata.sessions`, `metadata.sessionsDone`, `metadata.capacity`, `metadata.startDate`.

### 3. Seed thêm `service_attribute` + `bought_product` để Stats có data

Để page `/sales/order/list?serviceId=...` (FE dùng compute `registered` + `revenue` ở [Courses/index.tsx#L147-L153](https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/Courses/index.tsx#L147-L153)) có data, BE seed thêm:

- 5–30 `bought_product` record per khoá (random qty 1, price = service.price) gắn với customer giả.
- Customer giả: 10–30 record vào `prod_clouddb_customer.customer` với name + email + phone fake (nếu chưa có), `bsn_id=6`, `is_test=1` để dễ filter cleanup.
- (Optional) `feedback`/`nps` record để Feedback page có rating thật thay vì 0.

### 4. Idempotent guard

Migration chỉ chạy seed nếu `SELECT COUNT(*) FROM service WHERE bsn_id=6 AND type='COURSE_LIVE'` = 0 — tránh duplicate khi rerun.

### 5. Cleanup cho prod

Mark tất cả record seed bằng `metadata.is_seed = true` (hoặc cờ tương đương) để khi go-live có thể detect + remove cleanly. Document rõ trong PR description.

## Acceptance criteria

- [ ] `GET /sales/service/list?type=COURSE_LIVE&supplierId=54&bsnId=6` trả 5 items.
- [ ] FE page `/crm/mh/courses` show 5 khoá phân bổ qua các tab `Đang live` (2), `Sắp bắt đầu` (1), `Đã kết thúc` (1), `Nháp` (1).
- [ ] FE page `/crm/portal/mentors/MT-001` (public) hiển thị 4 khoá ACTIVE/ARCHIVED (loại DRAFT).
- [ ] `GET /sales/order/list?serviceId={id}` trả 5–30 record per khoá (cho stats counter).
- [ ] Re-run migration không tạo duplicate.
- [ ] PR document cách remove seed cho prod.

## File FE liên quan (chỉ tham chiếu, KHÔNG sửa)

- Catalog page: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/Courses/index.tsx
- Service client: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/services/SalesServiceClient.ts (xem `SalesService` type — list field metadata mong đợi)
- Mock reference: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/mocks/mentorhub/index.ts (MOCK_COURSES)
- URL config: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/configs/urls.ts (search `salesService`)
- Adapter mapping BE shape → UI: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/MentorHub/Courses/index.tsx (function `adaptService`)

## Phân chia rõ scope theo Microservice

**Trong handoff này (sales-master):**

- [ ] Migration seed 5 record `service` type=COURSE_LIVE cho `bsn_id=6`.
- [ ] Seed `bought_product` (5–30/khoá) để stats counter có data.
- [ ] Mark seed records bằng `metadata.is_seed=true` để dễ cleanup.

**KHÔNG thuộc handoff này (gửi handoff khác nếu cần):**

| Việc | Service phụ trách | Ghi chú |
|------|-------------------|---------|
| Seed `category_item` + RBAC permission `SALES_SERVICE_CATEGORY_*` | sales-master (đang làm ở handoff `cloud-sales-master#23`) | Sau khi #23 ship, update `service.category_id` cho 5 record này |
| Seed customer/student giả | customer-master | Có thể bundled trong handoff này nếu sales tự gen được fake customer; nếu không, raise riêng |
| Seed feedback/NPS records | care-master | Optional, không block nhưng improve demo data |
| Seed Zoom slot bookings | integration (Zoom pool) | Phase 6+, optional cho demo |

## Cross-link

- `cloud-sales-master#13` — V7 service catalog migration (đã ship, foundation cho seed này)
- `cloud-sales-master#23` — service_category (re-route từ inventory#43)
- Handoff cũ: `20260502-1138-sales-course-catalog-mentorhub-rerouted` (replied) — context FE đã wire vào sales

## Liên hệ

- FE owner: mentorhub branch maintainer
- Khi seed xong, BE comment trên cloud-crm với labels `reply-from-sales` + `to-mentorhub` để FE smoke-test.
