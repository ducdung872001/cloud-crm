---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: bpm
created: 2026-05-03T00:07:56+00:00
slug: ai-lecture-pipeline
status: withdrawn
gh_issue: https://github.com/ducdung872001/bpm-core/issues/325
re_routed_to: ducdung872001/cloud-integration-master (slug `ai-lecture-data-pipeline`)
withdrawn_reason: scope mismatch — AI lecture là data pipeline (auto, linear, no human task), không phải BPM workflow. BPM scope is human-task workflow (course approval, refund, onboarding).
severity: MEDIUM
---

# Handoff: ai-lecture-pipeline → bpm

GitHub issue: https://github.com/ducdung872001/bpm-core/issues/325
Body source: /tmp/mh-handoff-bpm-ai-lecture.md

Mục tiêu: bpm-core deploy workflow `ai-lecture-pipeline` 3 stage theo hành trình nghiệp vụ mentor sau buổi học:
- Stage A (Mentor Insight, ≤15min): sessionReview với attendance, sentiment, engagement, at-risk flagging → trigger care ticket + notification alert
- Stage B (Student Value, ≤30min): lectureSummary + actionItems → push tới students qua notification
- Stage C (Continuous Improvement, +2h): nextSessionPrep + content metrics aggregate

Triggered by `cloud-bpm-trigger` event với processCode=`ai-lecture-pipeline` từ Zoom webhook (handoff integration cloud-integration-master#10 phụ trách publish event).

Cross-link:
- integration (`cloud-integration-master#10`) produce trigger event
- notification (`reborn-notihub#3`) consume callback từ workflow gọi `dispatch` cho mentor + students
- care (Phase 2 follow-up) — Stage A at-risk → POST /care/ticket
- sales (Phase 2 follow-up) — 4 callback endpoints `/sales/internal/session/{review,lecture-summary,next-prep,content-metric}`

Reply protocol: BE bpm mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-bpm` + `to-mentorhub`.
