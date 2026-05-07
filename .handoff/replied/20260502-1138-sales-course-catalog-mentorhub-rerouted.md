---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-02T11:38:47+00:00
slug: course-catalog-mentorhub-rerouted
status: replied
gh_issue: https://github.com/ducdung872001/cloud-sales-master/issues/13
reply_issue: https://github.com/ducdung872001/cloud-crm/issues/209
fe_commit: f24f6f41
severity: HIGH
re_routed_from: ducdung872001/cloud-inventory-master#43
---

# Handoff: course-catalog-mentorhub-rerouted → sales

GitHub issue: https://github.com/ducdung872001/cloud-sales-master/issues/13
Body source: /tmp/mh-handoff-sales-course-catalog.md (full markdown đã embed vào issue qua --body-file)

Re-routed từ `ducdung872001/cloud-inventory-master#43` (BLOCKED — BE inventory từ chối triển khai vì course không phải physical-stock item; reply trên `cloud-crm#208`).

Reply protocol: BE sales mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-sales` + `to-mentorhub`.

---

## Reply từ sales — 2026-05-02T13:07:43+00:00

- Reply issue: https://github.com/ducdung872001/cloud-crm/issues/209 (CLOSED)
- Linked inventory issue: https://github.com/ducdung872001/cloud-crm/issues/208 (CLOSED — re-route accepted)
- BE đã ship: V7 migration `prod_clouddb_sales.{service,service_attribute,service_extra_info}` + 12 endpoint `/sales/service/*` (gồm `archive` + `stats` mới); customer 12 file Java DELETE + 7 caller refactor → `SalesServiceClient` HTTP cross-service. Cả 2 service deploy + smoke trên prod.
- BE sales commits: `1293d6b`, `5df0451` (cloud-sales-master). BE customer: `530b8ef` (cloud-customer-master).
- FE đã wire: commit `f24f6f41` (chưa push) — `urls.ts` salesService block / `SalesServiceClient.ts` mới / `MentorHub/Courses` fetch real BE + map status DRAFT/ACTIVE/ARCHIVED → live/upcoming/draft/ended + empty CTA + mock fallback.
- Smoke pass trên `biz.reborn.vn`: list / update / archive / stats đều 200.
- Lệch / chưa làm:
  - Tenant `bsnId=6` (mentorhub) chưa có `categoryItem` nào → tạo khoá thật cần bootstrap default category (raise issue mới khi mentor flow ra UI).
  - Course-level `Lưu trữ khoá` UI chưa ship (CourseEdit mock 100%) — `SalesServiceClient.archive` sẵn cho khi ship.
  - Phase 2 price tier (Basic/Standard/Premium) — sales nói sẽ raise handoff mới khi UI mentorhub khoá design.
