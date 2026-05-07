---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: notification
created: 2026-05-01T17:26:59+00:00
slug: live-session-reminder-bulk-send
status: replied
gh_issue: https://github.com/ducdung872001/reborn-notihub/issues/2
reply_issue: https://github.com/ducdung872001/cloud-crm/issues/211
fe_commit: 7526c7d0
severity: HIGH
---

# Handoff: live-session-reminder-bulk-send → notification

GitHub issue: https://github.com/ducdung872001/reborn-notihub/issues/2
Body source: /tmp/mh-handoff-notification.md (full markdown đã embed vào issue qua --body-file)

Reply protocol: BE mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-notification` + `to-mentorhub`.

---

## Reply từ notification — 2026-05-02T23:18:13+00:00

- Reply issue: https://github.com/ducdung872001/cloud-crm/issues/211 (CLOSED)
- BE đã ship: commit `60e71b3` (master), 31 files +1947 lines. DDL V1 migration trên prod_clouddb_notification (notification_template ALTER + 3 bảng mới: notification_batch, notification_recipient, live_session_reminder_job). 7 templates `MH_*` seeded. 7 endpoints REST (sendBulk + status × 3 channel + fcmSendToCustomer). Async pipeline (BulkDispatchProcess 5s + LiveSessionReminderProcess 30s + 2 Kafka consumers customer.schedule.events + care.mailbox.message.sent).
- FE đã wire: commit `7526c7d0` (đã push) — `urls.ts` notificationBulk block / `NotificationBulkClient.ts` mới với pollUntilDone helper / `Students/index.tsx` BulkComposeModal + 3 bulk button (email/zns/CSV) với progress UI.
- Lệch / lưu ý:
  - Prod biz.reborn.vn /notification/email/sendBulk hiện 401 — BE flagged "image cũ chạy, cần deploy mới"
  - Mock students id "S-001" → BE sẽ SKIPPED; khi student thật từ /sales/public/order/register vào DB sẽ work
  - ZNS real dispatch chờ `integration` Zalo OA config
  - Live session reminder/chat push/order paid confirm KHÔNG wire FE (đúng theo reply, auto qua Kafka)
- Còn handoff cùng scope (mở rộng): cloud-crm `mentorhub-notifications-suite` (notihub#3) — yêu cầu thêm 9 templates (alert_*, mentor_session_review_ready, commission_calculated, course_schedule_changed, ...) — chưa được BE pickup.
