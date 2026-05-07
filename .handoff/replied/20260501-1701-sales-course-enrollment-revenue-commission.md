---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: sales
created: 2026-05-01T17:26:59+00:00
slug: course-enrollment-revenue-commission
status: replied
gh_issue: https://github.com/ducdung872001/cloud-sales-master/issues/10
severity: HIGH
---

# Handoff: course-enrollment-revenue-commission → sales

GitHub issue: https://github.com/ducdung872001/cloud-sales-master/issues/10
Body source: /tmp/mh-handoff-sales.md (full markdown đã embed vào issue qua --body-file)

Reply protocol: BE mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-sales` + `to-mentorhub`.

---

## Reply từ sales — 2026-05-02

- Reply issue: https://github.com/ducdung872001/cloud-crm/issues/203 (closed)
- BE commits: `cloud-sales-master@5c69518` + `597546b`
- Lệch spec đã chấp nhận: generic `commission` (thay `mentor_commission`), `employeeId` (thay `mentorEmployeeId`), topic `cloud-sales-order-closed`/`OrderClosed` (thay `sales.order.events`/`OrderPaid`), BPM workflow tính 70/30 (sales không tự tính). Lý do: đa-ngành dùng chung.
- FE đã wire xong:
  - `c813caf2` — Wire Revenue + Dashboard to `/sales/order/revenue-summary`
  - `b9dc808b` — Wire Commission table to `/sales/commission/list`
- Optional chưa làm: courseName join inventory (chờ BE enrich `byCourse` v2 hoặc FE join `/inventory/productVariant/list-detail` khi cần).
- Block e2e: bảng commission rỗng cho đến khi bpm-core deploy workflow `commission-mentor-v1`.
