---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-03T00:07:56+00:00
slug: zoom-oauth-meeting-recording
status: replied
gh_issue: https://github.com/ducdung872001/cloud-integration-master/issues/10
reply_issue: https://github.com/ducdung872001/cloud-crm/issues/212
fe_commit: cb3f6218
severity: HIGH
---

# Handoff: zoom-oauth-meeting-recording → integration

GitHub issue: https://github.com/ducdung872001/cloud-integration-master/issues/10
Body source: /tmp/mh-handoff-integration-zoom.md

Mục tiêu: integration BE expose Zoom OAuth flow (mentor link account 1-time setup) + `/integration/zoom/meeting/create|get|cancel` (auto-create meeting per session) + webhook receiver `/integration/zoom/webhook` để pick `recording.completed` event → publish `cloud-bpm-trigger` với processCode=ai-lecture-pipeline.

Phase 1 = mentor connect Zoom account + meeting auto-create + webhook receiver. AI pipeline xử lý recording = handoff bpm-core#325 phụ trách.

Cross-link:
- bpm `ai-lecture-pipeline` (bpm-core#325) consume `cloud-bpm-trigger` event sinh ra từ webhook Zoom
- notification (`reborn-notihub#3`) dùng `joinUrl` từ meeting create làm template variable cho `lesson_reminder_*`

Reply protocol: BE integration mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-integration` + `to-mentorhub`.

---

## Reply từ integration — 2026-05-03T02:10:30+00:00

- Reply issue: https://github.com/ducdung872001/cloud-crm/issues/212 (CLOSED)
- BE đã ship: 4 commits master (b4a3712 foundation + DDL + Kafka topic; fa7b12f OAuth + refresh scheduler + tenant gate + audit; 4815b50 meeting CRUD; c06175b webhook + signature verify + bpm-trigger publisher). DB tables zoom_account (encrypted AES-256-GCM), zoom_meeting, platforms.zoom row, tenants.zoom_enabled column. 7 endpoints `/integration/zoom/*`. Token refresh 30min cron. Webhook publish `cloud-bpm-trigger` processCode=ai-lecture-pipeline.
- FE đã wire: commit `cb3f6218` (đã push) — `urls.ts` integrationZoom block / `ZoomClient.ts` mới / `MentorHub/Account` Tích hợp Zoom section / `MentorHub/CourseEdit` Step5 ✨ Tạo tự động button.
- 4 BLOCKER chờ infra:
  - (A) Zoom Marketplace App đăng ký + 4 credentials (Client ID/Secret, Webhook Secret Token, Verification Token)
  - (B) Devops set env vars + restart cloud-integration container
  - (C) SQL `UPDATE tenants SET zoom_enabled=1 WHERE id=6`
  - (D) BPM consumer subscribe cloud-bpm-trigger filter processCode=ai-lecture-pipeline (chờ bpm-core#325)
- Phase 2 chưa làm: per-session auto-create (chờ agenda có startAt), show joinUrl trong MH/Calendar.
