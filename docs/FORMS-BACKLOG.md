# Forms Backlog — Rà soát theo nghiệp vụ

Prototype mới dựng demo khung. Rà theo nghiệp vụ thực tế, dưới đây là các form còn thiếu phân theo domain. Mỗi mục: [**H/M/L**] mức độ ưu tiên.

---

## 1. Identity & Auth (6 form)

- [**H**] Login (email + password, SSO Google/Microsoft)
- [**H**] Forgot password / reset link
- [**M**] 2FA setup (TOTP QR + backup codes)
- [**M**] Profile edit (avatar, họ tên, phone, timezone, locale)
- [**M**] Change password
- [**L**] Active sessions / device log (revoke)

## 2. Organization & Workspace Settings (10 form)

- [**H**] Company info (logo, tên, MST, địa chỉ, currency mặc định)
- [**H**] API keys (Anthropic / OpenAI / Whisper keys, rotation, quota)
- [**H**] Integration config — Git (GitHub/GitLab PAT), Jira, Slack, Zalo, Gmail, Google Calendar
- [**M**] AI budget caps (per-project, per-month, alert threshold)
- [**M**] Webhook endpoints (CR sign, deploy done, CP approved)
- [**M**] Email templates (CR gửi KH, UAT invite, release note)
- [**M**] Notification rules matrix (ai nhận gì qua channel nào)
- [**L**] Audit log viewer (filter theo user/action/date)
- [**L**] Data retention policy + GDPR export
- [**L**] Billing / subscription

## 3. Team & Access (5 form)

- [**H**] Team list + invite member (email + role + project scope)
- [**H**] Role/permission editor (BA/SA/Dev/QA/PM/TechLead ma trận)
- [**M**] Deactivate / re-activate member
- [**M**] Workload balance view (giờ/người/project)
- [**L**] Skill tag / capacity planning

## 4. Client CRM (5 form)

- [**H**] Create client (tên, MST, industry, contact chính, địa chỉ)
- [**H**] Edit client
- [**H**] Contact person CRUD (mỗi client có nhiều contact)
- [**M**] Client portal invite (token + expiry)
- [**M**] Client signature config (digital signature, seal upload)

## 5. Project CRUD & Wizard (8 form)

- [**H**] **Create project wizard** (tên, client, code, start, deadline, budget, team assign, stack template, AI budget cap) — hiện chỉ toast
- [**H**] Edit project metadata
- [**M**] Archive / close project
- [**M**] Project-level settings (integrations riêng, env variables)
- [**M**] Duplicate project từ template
- [**M**] Import project (từ repo Git đã có)
- [**L**] Project template editor
- [**L**] Transfer project ownership

## 6. Stage 1 — Meeting / Audio / Transcript (6 form)

- [**H**] **Audio upload thật** (file picker + drag-drop + progress + resume) — hiện chỉ click toast
- [**H**] **In-browser audio record** (getUserMedia, waveform, pause/resume)
- [**M**] Schedule meeting form (integrate Google Calendar, attendee picker)
- [**M**] Manual meeting note entry (khi không có audio)
- [**M**] Transcript editor (sửa Whisper output, rename speaker)
- [**L**] Chunking / segment tag (cho audio dài > 1h)

## 7. Stage 2 — URD / Requirements (8 form)

- [**H**] **URD editor** (section-based, rich text, heading/bullet)
- [**H**] **Diff accept/reject inline** (hiện chỉ xem diff) — từng line hoặc từng section
- [**H**] Requirement CRUD (FR-xxx: title, priority, acceptance criteria, source)
- [**M**] Traceability matrix editor (FR ↔ meeting quote ↔ test case)
- [**M**] Export URD (chọn format docx/pdf, include/exclude sections)
- [**M**] Send to client form (to, cc, custom message, deadline review)
- [**M**] Client signature request (signature pad, legal disclaimer)
- [**L**] URD version compare (v1.0 ↔ v1.3 side-by-side)

## 8. Stage 3 — Prototype (6 form)

- [**H**] Regenerate prototype (prompt input, style guide upload, reference URLs)
- [**H**] **Feedback pin on preview** (click vào vùng → comment modal)
- [**M**] Feedback reply / resolve / reassign
- [**M**] Share link settings (expiry, password, view count limit)
- [**M**] Device viewport preset (mobile 375, tablet 768, desktop 1440, custom)
- [**L**] Version switcher (v1 ↔ v2 ↔ v3)

## 9. Stage 4 — Frontend + DevOps (7 form)

- [**H**] Tech stack template picker (Next.js + shadcn, Vite + Tailwind, Remix, Svelte...)
- [**H**] Repository config (Git URL, base branch, branch strategy)
- [**H**] **Tech Lead prompt editor + audit** — hiện có textarea nhưng chưa save/version
- [**M**] Env variables editor (per-env, secret mask)
- [**M**] Deploy config (staging URL, prod URL, CDN, domain)
- [**M**] Claude Code session launch form (model, max tokens, context budget)
- [**M**] Commit review + approve/reject

## 10. Stage 5 — Backend (6 form)

- [**H**] Tech stack (Spring Boot, Vert.x, NestJS, Go)
- [**H**] Database schema editor / migration manager
- [**H**] **API endpoint CRUD** (path, method, auth, params, response schema)
- [**M**] OpenAPI import/upload
- [**M**] Service/entity generator (từ schema → Java class)
- [**M**] Contract sync config (auto-pull interval FE↔BE)

## 11. Stage 6 — Test & QA (7 form)

- [**H**] **Test case CRUD** (TC-xxx: title, steps, expected, priority, linked FR)
- [**H**] **Bug report form** (title, severity, priority, module, repro steps, screenshots, assignee)
- [**H**] Test execution recorder (pass/fail, note, screenshot, duration)
- [**M**] Bug status kanban (new → fixing → retest → closed)
- [**M**] QA checklist template editor
- [**M**] Test plan creation (chọn TC + assign tester + deadline)
- [**L**] Test run comparison (run #1 vs #2)

## 12. Stage 7 — Handover (5 form)

- [**H**] Release note editor (version, changelog, known issues)
- [**H**] **UAT signoff form** (test case result + client digital signature)
- [**M**] User manual editor
- [**M**] Training deck upload + schedule training session
- [**M**] Production deployment confirmation (checklist + sign-off modal)

## 13. Change Request workflow (4 form)

- [**H**] **Create CR form** (title, description, session source, impact estimate auto/manual)
- [**H**] CR approval (PM sign + client sign via portal)
- [**M**] CR edit (khi còn pending)
- [**M**] CR link to URD update (auto propagate thay đổi)

## 14. Communication (4 form)

- [**M**] Email compose modal (to, cc, template, attachments)
- [**M**] Slack/Zalo message compose
- [**M**] Notification inbox preferences (per channel, per event type)
- [**L**] Broadcast announcement (to all team / per project)

## 15. Analytics & Reporting (3 form)

- [**M**] Filter panel (date range, project multi-select, stage, role)
- [**M**] Custom report builder (pick metrics + dimensions)
- [**L**] Export report (csv/pdf/xlsx, schedule delivery)

## 16. Prompt Library (4 form)

- [**M**] Prompt template CRUD (category, variables, sample output)
- [**M**] Prompt variable definition (type, default, required)
- [**M**] A/B test config (compare 2 prompt, metric)
- [**L**] Prompt version history (rollback)

## 17. Common UI patterns (6 form)

- [**H**] Confirm dialog chung (destructive actions) — chưa có
- [**H**] Filter panel chung cho list (Hub, Inbox, Sessions, Changes)
- [**H**] Global command palette (không chỉ project) — mở rộng ⌘K
- [**M**] Pagination / load more
- [**M**] Bulk action bar (select all → action)
- [**M**] Drawer / slide-over detail (thay cho navigate sang page riêng)

---

## Tổng kết

| Priority                   | Số form |
| -------------------------- | ------- |
| **H** (critical path MVP)  | **30**  |
| **M** (hoàn thiện feature) | **38**  |
| **L** (nice-to-have)       | **15**  |
| **Tổng**                   | **83**  |

Prototype hiện tại cover ~15% (chủ yếu view list + layout). Còn lại ~85% là form CRUD + workflow mà prototype cố ý bỏ qua để tập trung demo pipeline.

## Đề xuất thứ tự

**Sprint 1 — Unblock pipeline chính** (H priority, ~12 form):

1. Login/Auth cơ bản
2. Create project wizard
3. Audio upload + record (Stage 1)
4. URD editor + diff accept (Stage 2)
5. Regenerate prototype + feedback pin (Stage 3)
6. Create CR form

**Sprint 2 — Production-ready** (H+M, ~20 form): 7. Team/Client CRUD 8. Bug report + test case (Stage 6) 9. UAT signoff (Stage 7) 10. Tech stack + repo config (Stage 4-5) 11. API endpoint CRUD (Stage 5)

**Sprint 3 — Ecosystem** (M, ~20 form): 12. Integrations (Git/Jira/Slack) 13. Email + notification 14. Analytics filter + export 15. Prompt library
