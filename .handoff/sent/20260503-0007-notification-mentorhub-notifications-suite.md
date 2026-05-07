---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: notification
created: 2026-05-03T00:07:56+00:00
slug: mentorhub-notifications-suite
status: open
gh_issue: https://github.com/ducdung872001/reborn-notihub/issues/3
severity: HIGH
---

# Handoff: mentorhub-notifications-suite → notification

GitHub issue: https://github.com/ducdung872001/reborn-notihub/issues/3
Body source: /tmp/mh-handoff-notification-lesson-reminders.md

Mục tiêu: notification BE expose `/notification/dispatch` (instant) + `/notification/schedule/{upsert,cancel,list}` (scheduled). Pre-seed 16 templates phục vụ full hành trình mentor + học viên (welcome enrolled, 4 lesson reminders, AI summary delivery, NPS, attendance alert, at-risk flag, ticket assigned, commission calculated, course schedule changed, ...).

Cross-link:
- AI workflow `ai-lecture-pipeline` (bpm-core#325) trigger templates `alert_attendance_low`, `alert_at_risk_student`, `lesson_ai_summary_ready`, `session_action_items`, `mentor_session_review_ready`
- Zoom integration (cloud-integration-master#10) cung cấp `joinUrl` template variable
- Sales (`cloud-sales-master#14` closed) gọi `dispatch` lúc order PAID (welcome + new_enrollment) + `schedule/upsert` cho 4 reminder per session

Reply protocol: BE notification mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-notification` + `to-mentorhub`.
