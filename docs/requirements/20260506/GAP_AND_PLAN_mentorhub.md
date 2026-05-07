# GAP Analysis & Plan — MentorHub

**Đối chiếu:** `REQUIREMENTS_mentorhub.md` (yêu cầu mới sau buổi 2026-05-06) vs codebase hiện tại tại `/home/reborn/code/rox/reborn-mentorhub/`.
**Ngày phân tích:** 2026-05-07.
**Người duyệt cần xác nhận:** anh chủ + Dũng.

> ⚠️ **Plan này chỉ là đề xuất.** Chưa thực hiện. Vui lòng review và duyệt trước khi triển khai.
> ⚠️ **Deadline gấp:** demo 2026-05-08 (mai), commercial 2026-06-01 (~3.5 tuần) — Phase 0 đặt riêng cho demo, các phase tiếp ở chế độ tăng tốc.

---

## 1. Tổng quan hiện trạng

### Stack
- **Frontend**: React 18.3 + TypeScript + Vite 7, SCSS modules namespace `mh-*`, design system riêng (Fraunces + Geist).
- **Routing**: React Router với lazy loading + Suspense (`src/configs/routes.tsx`), prefix `/mh/*`.
- **State**: Context API (UserContext), không Redux.
- **Auth**: MSAL (Azure AD) cho admin Reborn; mentor/student auth chưa rõ kế hoạch.
- **Backend stubs**: `backend-stubs/` đã có Claude + Whisper integration, multi-provider gateway, usage tracking.

### Pages đã có (dưới `/mh/*`)
Dashboard, Courses, CourseEdit (5-step wizard), **SessionReview** (AI Meeting Notes — flagship), LiveSession (Live Assistant), Students, CRM, Tickets, Chat, Feedback (NPS), Revenue, Marketing, Calendar, Settings (có SubscriptionSection), Account.

Phụ trợ: Admin/Usage (Claude + Whisper cost tracking), Portal/Home (marketing landing có testimonial).

### Mini App Zalo
Pages khung: Home, Today, Students, Tickets, More — đăng ký trong routes nhưng đa phần chưa wire.

### Microservice config (`src/configs/urls.ts`)
Có `integrationZoom`, `integration/*` (zoom, email, sinvoice). Endpoints BE: `/api/v1/zoom/*`, `/integration/*`.

### Mock data
Tập trung tại `src/mocks/mentorhub/index.ts` (MOCK_MENTOR, MOCK_STUDENTS, MOCK_COURSES) + `src/mocks/subscription.ts` (plan: trial / starter / pro / unlimited).

### Backend stubs đáng chú ý
- `backend-stubs/src/services/claude.ts` — request/response shape, model picking (Haiku 4.5 vs Sonnet 4.6), prompt cache đã đặt sẵn nhưng chưa enable.
- `backend-stubs/src/services/whisper.ts` — switch Groq → OpenAI theo API key.
- `backend-stubs/src/db/types.ts` — `UsageLog` entity với tokensIn/Out, costUSD/VND.
- `backend-stubs/src/routes/usage.ts` — quota per plan (trial=5, pro=20, unlimited=100 aiSessions).
- `backend-stubs/src/jobs/transcribe.ts` — log mỗi call vào `db.usageLogs`.

### Tài liệu kèm
- `docs/mentorhub-api.openapi.yaml` (OpenAPI spec đang định nghĩa).
- `docs/zalo-integration-{guide,strategy}.md` + `docs/zalo-mini-app-registration.md` + `docs/zalo-oa-templates.json` — Zalo phân tích đã có.

---

## 2. GAP Matrix theo từng yêu cầu

Ký hiệu: 🟢 HAVE | 🟡 PARTIAL | 🔴 MISSING

| Req | Mô tả ngắn | Trạng thái | Ở đâu hiện tại | GAP cần lấp |
|---|---|---|---|---|
| **F1 — Pre-class flow** | | **35%** | | |
| F1.1 | Landing đăng ký + thu profile | 🟡 | `Courses/`, `CourseEdit/` có 5-step wizard | Tách form public landing; custom field |
| F1.2 | Profile học viên thống nhất xuyên buổi | 🟡 | `Students/` có roster, MOCK | Wire BE; merge cross-course |
| F1.3 | Pre-class checklist | 🔴 | — | Xây từ đầu (entity + UI + auto-rules) |
| F1.4 | Auto-reminder D-3/D-1/H-2 | 🔴 | — | Cron + multi-channel send |
| F1.5 | Pre-class digest cho mentor | 🔴 | Calendar có capacity/registered count | Trang aggregation riêng |
| F1.6 | Track tương tác pre-class | 🔴 | — | Event tracking + đổ vào profile |
| **F2 — Post-class flow** | | **40%** | | |
| F2.1 | Auto-record Zoom | 🟡 | Zoom OAuth có | Webhook `recording.completed` chưa wire |
| F2.2 | Transcribe transcript | 🟡 | `backend-stubs/src/services/whisper.ts` (Groq/OpenAI) | Ghép vào pipeline real-time, speaker diarization |
| F2.3 | AI breakdown từng học viên | 🟡 | `SessionReview/` có UI Q&A + summary mock | Prompt riêng per-student, persist DB |
| F2.4 | Auto-generate nhận xét cá nhân hoá | 🟡 | Mock skeleton trong `SessionReview` | Prompt + review/auto toggle theo gói |
| F2.5 | Phát hành qua Zalo OA | 🔴 | `Chat/` có UI 2 chiều mock | Wire ZNS template, outbound |
| F2.6 | Two-way reply | 🔴 | — | Inbound webhook + thread match |
| F2.7 | Per-student post-class digest | 🔴 | — | Trang student timeline |
| F2.8 | Mentor post-class cockpit | 🔴 | — | Bulk action thread chưa xử lý |
| **F3 — Tích hợp Zoom** | | **40%** | | |
| F3.1a | OAuth user-level | 🟢 | `services/zoomApi.ts:28-77`, Settings UI | Polish callback UX |
| F3.1b | List meeting + create meeting | 🔴 | — | Wire endpoint; gắn `meeting_id` vào session |
| F3.1c | Webhook meeting.ended/recording.completed | 🔴 | — | BE endpoint + signature verify |
| F3.2 | Server-to-server OAuth (Academy) | 🔴 | — | Phase sau, khi có Academy account |
| F3.3 | Enterprise pool + SDK embed | 🔴 | — | Phase muộn, gắn với F4 commercial |
| **F4 — Zoom credit pool** | | **0%** | | Toàn bộ phải xây |
| F4.1 | Wallet credit per mentor | 🔴 | — | Entity `mentor_credit_wallet` |
| F4.2 | Engine cấu hình rule (rate, earn, swap, tier discount) | 🔴 | — | Settings page + rule schema |
| F4.3 | Pool scanner slot rảnh | 🔴 | — | Cron quét calendar + matching |
| F4.4 | Booking flow auto-pick account | 🔴 | — | Allocation algorithm |
| F4.5 | Audit log credit | 🔴 | — | Reuse pattern audit của fitpro |
| F4.6 | Onboard pool ngoài (WIT) | 🔴 | — | Invite flow + verify |
| **F5 — Zalo OA 2 chiều** | | **25%** | | |
| F5.1 | Connect Zalo OA + verify | 🔴 | `docs/zalo-integration-guide.md` đã phân tích | Đăng ký OA + verify (action item D3) |
| F5.2 | Template manager ZNS | 🟡 | `docs/zalo-oa-templates.json` có sẵn template draft | UI quản lý + variable |
| F5.3 | Outbound queue + rate-limit | 🔴 | — | Queue worker |
| F5.4 | Inbound webhook + match thread | 🔴 | `Chat/` UI có | Webhook BE + dispatcher |
| F5.5 | Fallback Email/SMS | 🟡 | `NotificationService` cơ bản | Mở rộng + cấu hình per tenant |
| F5.6 | Opt-out / consent | 🔴 | — | Entity + UI |
| **F6 — AI pipeline** | | **35%** | | |
| F6.1 | Multi-provider gateway | 🟡 | `backend-stubs/src/{config,services/{claude,whisper}}.ts` | Mở rộng: Gemini, DeepSeek, fallback chain |
| F6.2 | Claude Code CLI as MCP | 🔴 | — | **Mới hoàn toàn** — host setup + MCP gateway |
| F6.3 | Model registry config file | 🔴 | Hard-code trong `claude.ts:92-96` | Tách sang YAML/JSON |
| F6.4 | Prompt template manager | 🔴 | Prompt hard-code | Entity + versioning + UI |
| F6.5 | Quota & usage tracking | 🟡 | `db/types.ts:80-93` UsageLog + `routes/usage.ts:11-16` plan quotas | Mở rộng token-level (không chỉ session count); enforce real-time |
| F6.6 | Streaming response | 🔴 | — | SSE / WS + UI streaming |
| F6.7 | Prompt caching Anthropic | 🟡 | `claude.ts:56` đã đặt comment `cache_control` | Enable + đo hiệu quả |
| F6.8 | Fallback chain | 🔴 | — | Logic try-next-provider |
| **F7 — Mentor & student** | | **60%** | | |
| F7.1 | Multi-tenant | 🟡 | UserContext có; tenant model chưa rõ | Confirm BE entity tenant + RBAC |
| F7.2 | Role-based access | 🟡 | Admin route có; mentor/student/TA chưa rõ | Permission matrix |
| F7.3 | Student master cross-course | 🟡 | `MOCK_STUDENTS` flat list | Schema + merge logic |
| F7.4 | Mentor onboarding wizard | 🟡 | `Account/` có Zoom connect flow | Mở rộng: Zalo + first course + first student |
| F7.5 | Student onboarding | 🔴 | — | Public link → portal student |
| F7.6 | Permission matrix chi tiết | 🔴 | — | Rule engine + UI |
| **F8 — Course / content** | | **35%** | | |
| F8.1 | Course entity | 🟡 | `MOCK_COURSES` + CRUD UI | Wire BE + persist |
| F8.2 | Session entity | 🟡 | `SessionReview/` có | Schema chuẩn (time, meeting_id, recording_url, transcript_id) |
| F8.3 | Material upload + version | 🔴 | "Click Tạo tự động Zoom" UI có | Storage S3-compatible + versioning |
| F8.4 | Content access control | 🔴 | — | Auth guard per content + expiry |
| F8.5 | Embed external content (Notion/Drive/video) | 🔴 | — | OEmbed / iframe whitelist |
| **F9 — Subscription & quota** | | **40%** | | |
| F9.1 | Trial | 🟡 | `mocks/subscription.ts` có type 'trial' | State machine + expiry |
| F9.2 | Free Tier | 🔴 | — | Thêm vào registry; quota nhỏ |
| F9.3 | Tier subscription + quota nhiều bậc | 🟡 | 4 plan mock | Định nghĩa registry chính thức (chờ D1+D2) |
| F9.4 | Add-on packs | 🔴 | — | Catalog + add-to-subscription |
| F9.5 | Academy / Enterprise | 🔴 | — | Multi-user tenant + custom contract |
| F9.6 | Lifecycle + auto-renew | 🟡 | UI Settings có SubscriptionSection | Cron renew + reminder D-7 |
| F9.7 | Payment gateway | 🔴 | — | VNPay + MoMo + Stripe (giai đoạn 2) |
| F9.8 | Quota enforcement real-time | 🟡 | `usage.ts` có quota check | Block + upsell UX |
| **F10 — Mentor profile & marketing** | | **35%** | | |
| F10.1 | Public mentor profile page | 🟡 | `Portal/Home/` có testimonials | Profile editor + public route |
| F10.2 | Referral / affiliate | 🟡 | `Marketing/` có referral UI | Wire + rule hoa hồng |
| F10.3 | Course marketplace | 🔴 | — | Phase muộn |
| F10.4 | Custom domain Academy | 🔴 | — | DNS + tenant routing |
| **F11 — Reporting & analytics** | | **45%** | | |
| F11.1 | Mentor dashboard GMV/NPS/retention | 🟡 | `Dashboard/` UI + `Revenue/` | Wire BE aggregation |
| F11.2 | Per-course report | 🔴 | — | Aggregation + UI filter |
| F11.3 | Per-student journey | 🔴 | — | Timeline + warmth score |
| F11.4 | HQ admin dashboard | 🟡 | `Admin/Usage/` cost tracking | Mở rộng MRR / churn / pool utilization |
| F11.5 | Real-time live dashboard | 🟡 | `LiveSession/` Live Assistant | Wire WebSocket + sentiment |
| **F12 — Tích hợp khác** | | **30%** | | |
| F12.1 | Email | 🟡 | `integration/email` config có | Wire UI + template |
| F12.2 | SMS | 🔴 | — | Provider chọn (eSMS / VNPT) |
| F12.3 | Calendar 2-way | 🔴 | `Calendar/` UI có | OAuth Google + Outlook |
| F12.4 | Zalo Mini App | 🟡 | Pages khung | Wire BE + auth Zalo |
| F12.5 | Webhook out | 🔴 | — | Subscription model + signing |
| F12.6 | Public API + key | 🔴 | — | Phase muộn |

### Tổng kết theo % wiring

| Domain | % HAVE/PARTIAL | Mức ưu tiên (theo spec) |
|---|---|---|
| F1 — Pre-class | 35% | **Cao** (1 trong 2 lớp giá trị) |
| F2 — Post-class | 40% | **Tối cao** (lớp được nhấn mạnh nhất) |
| F3 — Zoom | 40% | **Tối cao** (gắn với F2) |
| F4 — Credit pool | 0% | Trung (USP nhưng không cần MVP) |
| F5 — Zalo OA | 25% | **Tối cao** (gắn với F2.5–2.6) |
| F6 — AI pipeline | 35% | **Tối cao** (gắn với F2.3–2.4) |
| F7 — Mentor/student | 60% | Cao |
| F8 — Course/content | 35% | Cao |
| F9 — Subscription | 40% | **Cao** (block commercial T6) |
| F10 — Mentor marketing | 35% | Trung |
| F11 — Reporting | 45% | Trung |
| F12 — Khác | 30% | Trung |
| **Tổng MentorHub core** | **~35%** | |

---

## 3. Plan lấp GAP — phân kỳ phase (siết theo deadline commercial 2026-06-01)

> **Nguyên tắc**: ưu tiên flow đầu cuối **F2 + F3 + F5 + F6** (post-class loop chính) cho MVP commercial. F4 credit pool và F8 course materials đẩy sau commercial. F1 pre-class giữ ở mức tối thiểu cho MVP.

### Phase 0 — Sẵn sàng demo Thứ 6 (1 ngày — **HÔM NAY 2026-05-07**)

**Mục tiêu**: bản demo mai chạy mượt, kể được câu chuyện 2 lớp giá trị + USP.

| # | Việc | Ước lượng | Owner |
|---|---|---|---|
| 0.1 | Smoke test toàn bộ route `/mh/*`, fix lỗi runtime / blank page | 2h | FE |
| 0.2 | Polish SessionReview demo: 1 buổi mẫu data đẹp (mentor + 5 học viên + transcript fake) | 2h | FE |
| 0.3 | Polish Dashboard: KPI demo có số đáng tin | 1h | FE |
| 0.4 | Demo flow script: kịch bản 5 phút (pre → live → post → Zalo notify → reply) | 1h | PO |
| 0.5 | Backup video walkthrough phòng lỗi mạng / Zoom | 1h | FE+PO |

**Exit**: kịch bản demo + bản chạy được + video backup.

---

### Phase 1 — Foundation cleanup + decisions (1 tuần — 2026-05-09 → 05-15)

**Mục tiêu**: dọn nợ cũ, chốt decisions D1–D9, chuẩn bị schema chung. Song song chuẩn bị UAT.

| # | Việc | Ước lượng |
|---|---|---|
| 1.1 | Audit + thống nhất schema: `tenant`, `mentor`, `student`, `course`, `session`, `subscription`, `usage_log`, `credit_wallet` | 1d |
| 1.2 | Tách model registry sang `backend-stubs/src/config/models.yaml` (cost, context, capability, tier) | 0.5d |
| 1.3 | Tách prompt sang `backend-stubs/src/prompts/*.ts` versioned | 0.5d |
| 1.4 | Wire `Admin/Usage` từ mock → query thật từ `usage_log` | 1d |
| 1.5 | Persist `mocks/subscription.ts` → DB thật, định nghĩa registry plans (chờ D1) | 1d |
| 1.6 | Quota enforcement real-time middleware (block khi quota vượt) | 1d |
| 1.7 | UAT environment setup (subdomain `uat.mentorhub.vn`, seed data) | 1d |
| 1.8 | Decisions D1–D9 chốt với anh chủ (đặc biệt D1 tier name + giá, D3 Zalo OA verify, D4 MCP host) | song song |

**Exit**: schema chuẩn, model registry, decisions chốt, UAT có dữ liệu seed.

---

### Phase 2 — Post-class loop đầu cuối (2 tuần — 2026-05-16 → 05-29) ★ CORE

**Mục tiêu**: vòng F2 + F3 + F5 + F6 chạy thật trên 1 buổi học mẫu — đây là chứng minh value chính.

| # | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| 2.1 | **F3.1b** Wire BE: list/create Zoom meeting, gắn `meeting_id` vào session | 1.5d | 1.1 |
| 2.2 | **F3.1c** Webhook BE: `meeting.ended` + `recording.completed` (Zoom signature verify) | 1.5d | 2.1 |
| 2.3 | **F2.1+2.2** Pipeline: nhận record → push job transcribe Whisper (Groq primary, OpenAI fallback) | 2d | 2.2 |
| 2.4 | **F6.1+6.7** Provider gateway hoàn chỉnh: enable Anthropic prompt cache, fallback chain, streaming | 2d | 1.2+1.3 |
| 2.5 | **F2.3** Prompt + pipeline: AI breakdown từng học viên từ transcript (per-student summary, engagement score, Q&A extracted) | 2d | 2.3+2.4 |
| 2.6 | **F2.4** Prompt + UI nhận xét cá nhân hoá; toggle "auto-send / review-then-send" theo gói | 2d | 2.5 |
| 2.7 | **F5.1+5.3** Outbound Zalo ZNS: connect OA, queue worker, rate-limit (chờ D3 OA verify) | 2d | D3 |
| 2.8 | **F5.4** Inbound webhook Zalo: nhận reply → match `student_id` → push vào `Chat/` thread | 1.5d | 2.7 |
| 2.9 | **F2.7** Per-student post-class digest UI (timeline học viên) | 1d | 2.5 |
| 2.10 | **F2.8** Mentor post-class cockpit (bulk action thread chưa xử lý) | 1.5d | 2.8 |

**Exit**: 1 lớp pilot (mentor thật, 5–10 học viên, buổi Zoom thật) → record → AI breakdown → Zalo gửi → student reply → mentor xử lý. End-to-end thật.

---

### Phase 3 — Subscription + payment + UAT mở rộng (1 tuần — 2026-05-30 → 06-05)

**Mục tiêu**: thu được tiền thật, sẵn sàng commercial early-T6.

| # | Việc | Ước lượng |
|---|---|---|
| 3.1 | **F9.3** Define + persist plan registry (theo D1) | 1d |
| 3.2 | **F9.6** Subscription lifecycle state machine + cron renew + reminder D-7 | 1d |
| 3.3 | **F9.7** Tích hợp **VNPay** (primary) + chuyển khoản manual confirm | 2d |
| 3.4 | **F9.1** Trial flow + auto-expire | 0.5d |
| 3.5 | **F9.2** Free tier với quota giới hạn | 0.5d |
| 3.6 | **F9.8** Quota enforcement UX (paywall + upsell) | 1d |
| 3.7 | UAT với 3–5 mentor pilot, thu feedback, fix critical | 1d |

**Exit**: Mentor đầu tiên đăng ký + trả tiền thật + dùng được core flow.

---

### Phase 4 — Pre-class flow + onboarding hoàn chỉnh (1 tuần — 2026-06-06 → 06-12)

**Mục tiêu**: hoàn thiện vòng F1 cho UX mentor + student mượt mà.

| # | Việc | Ước lượng |
|---|---|---|
| 4.1 | **F1.1+1.2** Public landing đăng ký + custom field + profile thống nhất | 2d |
| 4.2 | **F1.3** Pre-class checklist (entity + UI + auto-rules) | 1.5d |
| 4.3 | **F1.4** Auto-reminder cron D-3/D-1/H-2 | 1d |
| 4.4 | **F1.5** Pre-class digest cho mentor | 1d |
| 4.5 | **F7.4+7.5** Onboarding wizard mentor (Zoom→Zalo→first course→invite student) + onboarding student qua link | 1.5d |

**Exit**: Mentor mới signup → 30 phút sau đã có lớp đầu chạy được.

---

### Phase 5 — AI pipeline nâng cao (MCP) (1 tuần — 2026-06-13 → 06-19)

**Mục tiêu**: cắm Claude Code CLI as MCP cho task heavy + tool-use.

| # | Việc | Ước lượng |
|---|---|---|
| 5.1 | **F6.2** MCP host setup: 1 máy local cài Claude Code CLI, expose MCP socket; gateway BE detect routing | 2d |
| 5.2 | **F6.2** MCP fallback: API token Claude khi MCP host down | 1d |
| 5.3 | **F6.4** Prompt template manager UI (CRUD + version) | 2d |
| 5.4 | **F6.6** Streaming response UI (SessionReview + LiveSession) | 1d |
| 5.5 | **F11.4** HQ admin dashboard mở rộng: MRR / churn / cost vs revenue per AI provider | 1d |

**Exit**: Heavy task (transcript dài, tool-use phức tạp) chạy qua MCP CLI; admin xem được P&L per AI provider.

---

### Phase 6 — Zoom credit pool (USP) (2 tuần — 2026-06-20 → 07-03)

**Mục tiêu**: mở USP credit pool, bootstrap WIT community.

| # | Việc | Ước lượng |
|---|---|---|
| 6.1 | **F4.1** Wallet credit + entity + audit log | 1.5d |
| 6.2 | **F4.2** Engine cấu hình rule (rate, earn, swap, tier discount) — admin settings page | 2d |
| 6.3 | **F4.3** Pool scanner: cron quét calendar Zoom đã connect → mark slot rảnh | 2d |
| 6.4 | **F4.4** Booking flow auto-pick account + trừ credit | 2d |
| 6.5 | **F4.5** Audit log đầy đủ + report đối soát | 1d |
| 6.6 | **F4.6** Onboard pool ngoài: invite WIT community, verify Zoom connect, earn rate riêng | 2d |
| 6.7 | **F3.2** Server-to-server OAuth cho Academy (gắn với pool) | 1.5d |

**Exit**: 50+ tài khoản Zoom trong pool (gồm mentor MentorHub + WIT volunteer); 1 tuần test luân chuyển slot không xung đột.

---

### Phase 7 — Course content + marketing + analytics (2–3 tuần — 2026-07-04 → 07-24)

**Mục tiêu**: T7 scale — đẩy mạnh phân phối.

| # | Việc | Ước lượng |
|---|---|---|
| 7.1 | **F8.3** Material upload + version (S3-compatible storage) | 2d |
| 7.2 | **F8.4** Content access control + expiry | 1d |
| 7.3 | **F8.5** Embed external content (OEmbed / iframe whitelist Notion/Drive/Loom) | 1d |
| 7.4 | **F10.1** Public mentor profile page editor | 2d |
| 7.5 | **F10.2** Referral / affiliate engine + rule hoa hồng | 2d |
| 7.6 | **F11.2+11.3** Per-course + per-student journey reports | 3d |
| 7.7 | **F12.3** Calendar 2-way sync (Google + Outlook) | 2d |
| 7.8 | **F12.4** Zalo Mini App wire BE đầy đủ | 2d |
| 7.9 | **F11.5** Live dashboard real-time WebSocket + sentiment | 1.5d |

**Exit**: scale-ready, có thể onboard 100+ mentor tháng đó.

---

## 4. Tóm tắt timeline & nhân lực

| Phase | Khoảng | FE-day | BE-day | DevOps | Decisions block |
|---|---|---|---|---|---|
| 0 | 1 ngày | 1 | 0 | 0 | — |
| 1 | 1 tuần | 3 | 4 | 1 | D1, D3, D4 |
| 2 ★ | 2 tuần | 6 | 9 | 1 | D3, D5, D6 |
| 3 | 1 tuần | 3 | 4 | 0 | D1, D8 |
| 4 | 1 tuần | 4 | 3 | 0 | — |
| 5 | 1 tuần | 2 | 5 | 1 | D4 |
| 6 | 2 tuần | 4 | 9 | 1 | D5 |
| 7 | 2–3 tuần | 8 | 8 | 1 | — |
| **Tổng** | **~11–12 tuần (≈3 tháng)** | **~31 FE-d** | **~42 BE-d** | **5 DevOps-d** | |

**Phân bổ lực lượng đề xuất:**
- **1 FE + 1.5 BE + 0.5 DevOps full-time** → ~12 tuần đúng plan (commercial 2026-06-01 còn gấp, có thể chỉ kịp Phase 2 + Phase 3 minimal — coi như "soft launch" với pilot mentor).
- **2 FE + 2 BE + 1 DevOps** → ~7 tuần, hit commercial T6 đầy đủ.

**Khuyến nghị (cá nhân)**: với resource hiện tại nên **soft launch 2026-06-01** (chỉ Phase 0–3) với 5–10 mentor pilot trả tiền thật, rồi **commercial mở rộng 2026-07-01** sau khi xong Phase 4+5 + một phần Phase 6. F4 credit pool đẩy hẳn sang T7+.

---

## 5. Rủi ro & open decisions cần chốt trước Phase 2

Bốn rủi ro lớn nhất:

| # | Rủi ro | Mitigation |
|---|---|---|
| R1 | **Zalo OA chưa verify được kịp 2026-05-15** — block toàn bộ F2.5+5.x và demo cuối Phase 2 | Action D3 chốt sớm; backup: dùng email + SMS tạm cho post-class notify, Zalo bật sau |
| R2 | **MCP host setup phức tạp / scale ngang khó** | Phase 5 đẩy sau commercial; MVP dùng API token Claude, MCP là enhancement |
| R3 | **Chi phí AI vượt revenue** ở mentor free / trial | Quota enforcement F6.5 phải ngày 1; cap token cứng cho free tier |
| R4 | **Resource thực tế không đủ** để hit Phase 2 trong 2 tuần | Cắt F2.7+2.8 (digest + cockpit) sang Phase 4; giữ minimum F2.1–2.6 |

**Open decisions** (tham chiếu mục 6 REQUIREMENTS):
- **D1**: Tier name + giá + content (block Phase 1.5 + Phase 3.1).
- **D2**: Quota mỗi tier (block Phase 3.6 paywall UX).
- **D3**: Zalo OA verify status (block Phase 2.7+2.8).
- **D4**: MCP host architecture (block Phase 5).
- **D5**: Default credit Zoom rate (block Phase 6.2).
- **D6**: AI cost passthrough chính sách (block Phase 1.6 + 3.6).
- **D7**: Branding strategy (block F10.4).
- **D8**: Trial cần thẻ tín dụng không (block Phase 3.4 funnel).
- **D9**: Privacy policy + ToS (block commercial T6).
- **D10**: API expose cho FitPro (defer).

---

## 6. Đề xuất tiếp theo

1. **HÔM NAY 2026-05-07** — chạy Phase 0 (1 ngày) để demo mai mượt.
2. **Trong 24h tới** — anh chủ chốt nhanh **D1, D3** (2 quyết định block nhất).
3. **2026-05-09 (sau demo)** — review GAP_AND_PLAN này, điều chỉnh ưu tiên / cắt scope nếu cần.
4. **Sau khi duyệt** — bắt đầu Phase 1 (1 tuần dọn nợ + đợi remaining decisions).
5. **Khuyến nghị target soft commercial 2026-06-01** với Phase 0–3 hoàn chỉnh; commercial mở rộng 2026-07-01 với Phase 4–5; full feature T7+ với Phase 6–7.

---

> **Người duyệt:** [ ] anh chủ — [ ] Dũng — [ ] Reborn HQ
> **Ngày duyệt:** \_\_\_\_\_\_\_\_\_\_
> **Phase được approve để start ngay:** \_\_\_\_\_\_\_\_\_\_
