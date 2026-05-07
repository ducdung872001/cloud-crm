---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-03T02:46:56+00:00
slug: ai-lecture-data-pipeline
status: open
gh_issue: https://github.com/ducdung872001/cloud-integration-master/issues/11
re_routed_from: ducdung872001/bpm-core#325 (closed/withdrawn — scope mismatch)
severity: MEDIUM
---

# Handoff: ai-lecture-data-pipeline → integration

GitHub issue: https://github.com/ducdung872001/cloud-integration-master/issues/11
Body source: /tmp/mh-handoff-integration-ai-lecture.md

Mục tiêu: integration BE owning Zoom (đã ship #10) tiếp tục xử lý recording → AI pipeline 3 stage:
- Stage A (Mentor Insight, ≤15min): transcript + sessionReview JSON (attendance, sentiment, engagement, at-risk, Q&A) → callback sales + notification alert mentor
- Stage B (Student Value, ≤30min): lectureSummary + actionItems → notification students
- Stage C (Continuous Improvement, +2h): nextSessionPrep + content metrics

REST adapter endpoints `/integration/ai/{transcribe, llm-call}` + worker queue + state table `lecture_pipeline_job`. Provider Whisper + Claude Sonnet 4.6.

Re-routed từ bpm-core#325 (đã close): BPM scope là human-task workflow, AI lecture là automated data pipeline → integration là single owner cho "Zoom + AI" trong external provider repo.

Cross-link:
- integration#10 (Zoom OAuth + meeting + webhook, closed) — produce trigger event này consume
- notification (notihub#2 closed) — pipeline gọi `/notification/dispatch` cho mentor + students
- care + sales callback endpoints Phase 2

Reply protocol: BE integration mở issue mới trên `ducdung872001/cloud-crm` với labels CẢ HAI `reply-from-integration` + `to-mentorhub`.
