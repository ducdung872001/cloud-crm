# Requirements — MentorHub (rút từ buổi họp 2026-05-06)

**Nguồn:** `Vincom Center 3.m4a` (đoạn 00:40:50–00:55:12) + `SUMMARY_mentorhub.md` (đã chỉnh ngày 2026-05-07).
**Phạm vi:** Chỉ phần MentorHub. FitPro là sản phẩm riêng, không cover ở đây (xem `reborn-fitpro/docs/requirements/20260506/REQUIREMENTS_fitpro.md`).
**Trạng thái:** v1.0 — chờ duyệt.

---

## 0. Bối cảnh & ràng buộc nền

| Mã | Ràng buộc | Ý nghĩa thiết kế |
|---|---|---|
| C1 | Tệp khách = mentor cá nhân, đa số xài **Zoom + Telegram rời rạc** | UX phải làm onboarding "không cần biết IT" |
| C2 | **Tất cả mentor (lớn lẫn nhỏ, kể cả Phạm Thành Long) đều qua SaaS chuẩn — không bypass / không self-host** | Differentiation đặt ở **tier gói**, không ở kiến trúc |
| C3 | Học viên 10 ngày sau **không nhớ kiến thức**, chỉ nhớ emotional touch | Sản phẩm phải làm tốt phần personalization, không bí ý nội dung |
| C4 | **Zoom cá nhân không thể gửi tin nhắn tự động** (Zalo Inc chặn) | Bắt buộc dùng **Zalo OA công ty** cho out-going message |
| C5 | Cộng đồng **WIT** có hàng nghìn người đang lãng phí Zoom → bootstrap pool sẵn | Credit pool phải **mở để invite vào** ngay từ MVP |
| C6 | Roadmap chốt: demo 2026-05-08, UAT tuần sau, commercial đầu T6 | Multi-tenant + billing phải sẵn từ ngày 1, không retro |
| C7 | Mentor có thể tự cắm course content (cao) vào và phân phối | Hệ thống không "khoá" nội dung, mentor giữ ownership |

---

## 1. Personas

| ID | Persona | Vai trò chính trong hệ thống |
|---|---|---|
| P1 | **Mentor / Master / Chuyên gia** | Chủ lớp — tạo khoá, dạy, theo dõi học viên, nhận tiền |
| P2 | **Học viên (Student)** | Đăng ký lớp, vào học, nhận tin nhắn cá nhân hoá, reply |
| P3 | **Co-mentor / Trợ giảng (TA)** | Hỗ trợ mentor chính — chấm bài, trả lời câu hỏi, không owner doanh thu |
| P4 | **Academy / Org account** | 1 đơn vị nhiều mentor (trung tâm, học viện) — billing tập trung, branding chung |
| P5 | **Admin SaaS (Reborn HQ)** | Quản trị tenant, plan, quota, support, vận hành Zoom credit pool |
| P6 | **Finance / Billing** | Đối soát thu/chi, payout cho mentor, trừ phí Zoom/AI |
| P7 | **Hệ thống tự động** | Cron jobs: gửi tin pre/post-class, gọi AI, tổng hợp credit, billing renewal |

---

## 2. Functional Requirements

### F1 — Pre-class flow (phần thịt trước)

- **F1.1** Mentor tạo lớp / buổi học → hệ thống generate **landing đăng ký** có form thu thập profile học viên (custom field cấu hình được).
- **F1.2** Mỗi học viên có **profile thống nhất xuyên buổi/khoá**: thông tin cơ bản, mục tiêu, lịch sử tương tác, tag/segment.
- **F1.3** **Pre-class checklist** cho từng học viên (tự động + tuỳ chỉnh): đã đọc tài liệu chưa, đã làm bài tập chưa, đã confirm tham dự chưa.
- **F1.4** **Auto-reminder** gửi qua Zalo OA / Email / SMS theo lịch (D-3, D-1, H-2).
- **F1.5** **Pre-class digest** cho mentor: 1 trang tổng hợp tất cả học viên (đã đăng ký, đã reply, câu hỏi pre-submitted, đặc biệt cần lưu ý) — **đây là "nút thắt"** mentor xem trước khi vào lớp.
- **F1.6** Ghi nhận tương tác pre-class (open mail, click link, reply) → đổ vào profile học viên.

### F2 — Post-class flow (phần thịt sau — TRỌNG TÂM)

- **F2.1** **Auto-record buổi học qua Zoom** (qua tích hợp F3) → upload + lưu trữ.
- **F2.2** **Transcribe** (speech-to-text) toàn bộ buổi → output có timestamp + speaker diarization.
- **F2.3** **AI breakdown từng học viên** từ transcript:
  - Mức độ tương tác (số lần phát biểu, câu hỏi, cảm xúc giọng).
  - Câu hỏi học viên đặt + đã được trả lời chưa.
  - Action items mentor giao cho học viên đó.
  - Highlight / quote đáng nhớ riêng học viên.
- **F2.4** **Auto-generate nhận xét cá nhân hoá** cho từng học viên — mẫu mở:
  - "Hôm nay bạn đã tương tác như thế này, chuyên gia nhận định bạn nên…"
  - "Bạn chưa tương tác lắm, có vướng gì không? Có câu hỏi gì không?"
  - Mentor có thể **review + edit** trước khi gửi (toggle "auto-send" / "review-then-send" theo gói).
- **F2.5** **Phát hành nhận xét qua Zalo OA công ty** (xem F5) — không qua Zalo cá nhân.
- **F2.6** **Two-way reply** — học viên reply → hệ thống nhận, gắn vào thread của học viên đó, push vào inbox mentor.
- **F2.7** **Per-student post-class digest** trong app: timeline buổi học của riêng học viên, nhận xét, tài liệu kèm.
- **F2.8** **Mentor post-class cockpit**: tất cả thread reply chưa xử lý của tất cả học viên hôm nay, bulk action.

### F3 — Tích hợp Zoom (làm từ tối thiểu → nâng cao)

> **Định hướng:** triển khai theo 3 mức, kích hoạt theo tier gói + theo deal commercial.

- **F3.1 — Mức cơ bản (MVP):** Zoom App Marketplace 3rd-party app
  - OAuth user-level (mentor connect tài khoản Zoom của họ).
  - List meeting đã có / sắp tới của mentor.
  - Create meeting từ MentorHub (gắn meeting_id vào lớp/buổi).
  - Webhook nhận event `meeting.ended`, `recording.completed` → trigger transcription.
- **F3.2 — Mức trung:** Server-to-server OAuth (account-level)
  - Cho phép Academy account kết nối tổng (1 tài khoản Zoom enterprise → nhiều mentor con).
  - Auto-record bật mặc định, retention policy cấu hình.
- **F3.3 — Mức nâng cao:** Zoom Enterprise pool + SDK
  - MentorHub deal Zoom enterprise license tổng → cấp slot xuống mentor (xem F4 credit pool).
  - Embed Zoom SDK in-app (mentor không cần rời MentorHub).
  - Real-time transcript streaming khi đang dạy (cho Live Assistant).

### F4 — Zoom credit pool (USP — cấu hình được toàn bộ)

> **Chi tiết flow & marketing pitch:** xem [URD_ZOOM_POOL.md](./URD_ZOOM_POOL.md) — bổ sung 2 mô hình (auto-pool + peer-borrow), state machine, screen mapping, target metric.

- **F4.1** **Wallet credit per mentor**: số dư credit, lịch sử cộng/trừ, soft-limit cảnh báo.
- **F4.2** **Engine cấu hình rule** (admin SaaS đặt — không hard-code):
  - **Conversion rate**: 1 phút meeting = X credit (theo loại tài khoản basic/pro/business/enterprise).
  - **Earn rate**: cho mượn slot Y phút = +Z credit.
  - **Swap rate**: đổi credit ↔ tiền mặt (cho mentor mua thêm hoặc cash-out).
  - **Tier discount**: gói cao hơn được earn-rate ưu đãi hơn.
  - **Idle bonus**: tài khoản ngồi không xài lâu → +credit khuyến khích share.
- **F4.3** **Pool scanner**: hệ thống scan slot rảnh trong tất cả tài khoản Zoom đã connect → matching demand-supply tự động.
- **F4.4** **Booking flow**: mentor đặt buổi → hệ thống tự chọn tài khoản Zoom phù hợp (ưu tiên của mentor đó, fallback sang pool) → trừ credit.
- **F4.5** **Audit log mọi giao dịch credit** (compliance).
- **F4.6** **Onboard pool ngoài**: invite cộng đồng WIT (và tương lai mở rộng) — họ connect Zoom rảnh → earn credit hoặc tiền.
- **F4.7** **Peer-to-peer borrow request** (mô hình bổ sung): mentor C đề xuất giờ + credit gửi mentor A; A approve/decline/counter; approve auto book + auto earn 100%. State machine + 24h TTL — chi tiết xem URD.

### F5 — Tích hợp Zalo OA (2 chiều)

- **F5.1** Connect Zalo OA của công ty (đã verify, có quyền send proactive message theo template ZNS).
- **F5.2** **Template manager**: mentor (hoặc admin) tạo template Zalo ZNS theo từng kịch bản (pre-reminder, post-feedback, follow-up). Hỗ trợ **personalization variables** (tên, tên lớp, link cá nhân).
- **F5.3** **Outbound queue** với rate-limit theo Zalo policy.
- **F5.4** **Inbound webhook**: học viên reply → match theo `student_id` → đổ vào thread MentorHub.
- **F5.5** **Fallback channel**: Email + SMS khi Zalo fail (cấu hình per tenant).
- **F5.6** **Opt-out / consent** management theo PDPL Việt Nam.

### F6 — AI pipeline (multi-provider, focus Claude)

> **Pattern reuse từ AIVhub**: code multi-provider gateway đã có sẵn trong `backend-stubs/src/services/{claude,whisper}.ts`. Cần mở rộng + chuẩn hoá.

- **F6.1** **Provider gateway** abstract — support song song:
  - **Anthropic Claude** (primary): Opus / Sonnet / Haiku — qua API token.
  - **OpenAI**: GPT-4 family — fallback hoặc user pick.
  - **Groq / DeepSeek / Gemini**: tuỳ option, đặc biệt cho transcription (Whisper qua Groq giá rẻ).
  - **Local / Ollama**: optional cho enterprise on-prem.
- **F6.2** **Claude Code CLI as MCP** — đường thứ 2 cho Claude:
  - 1 máy local cài Claude Code CLI → biến thành **MCP server** mở socket cho hệ thống gọi vào.
  - Dùng cho task heavy / cần tool-use phức tạp / cần local file access.
  - Có gateway MCP-aware trong backend chọn route giữa "API token Claude" vs "CLI MCP".
- **F6.3** **Model registry** (config file): metadata mỗi model — cost in/out per token, context window, capability tier (chat / vision / tool / streaming), tier gói được dùng.
- **F6.4** **Prompt template manager**: lưu prompt theo task (post-class summary, per-student remark, transcript Q&A extraction…), versioning.
- **F6.5** **Quota & usage tracking** per mentor / per tenant: số lần call, token in/out, cost USD/VND. Block khi vượt quota gói.
- **F6.6** **Streaming response** cho UX live (đặc biệt SessionReview, Live Assistant).
- **F6.7** **Prompt caching** (Anthropic ephemeral cache) cho system prompt + transcript dài → giảm cost.
- **F6.8** **Fallback chain**: provider chính fail → tự retry sang provider khác cùng tier.

### F7 — Quản lý mentor & học viên

- **F7.1** **Multi-tenant** đầy đủ: 1 mentor solo = 1 tenant; Academy = 1 tenant nhiều user (mentor, TA, admin).
- **F7.2** **Role-based access**: Mentor / TA / Org-Admin / Student / SaaS-Admin.
- **F7.3** **Student master**: 1 student có thể thuộc nhiều mentor / khoá → unique key per tenant nhưng có thể merge cross-tenant nếu opt-in.
- **F7.4** **Onboarding wizard mentor**: connect Zoom → connect Zalo (skip được) → tạo khoá đầu → invite student đầu.
- **F7.5** **Onboarding student**: 1 click qua link → optional tạo password / OTP → vào portal student.
- **F7.6** **Permission matrix** rõ ràng (ai thấy được data học viên nào, ai chỉnh được prompt/template, ai approve nhận xét trước khi gửi).

### F8 — Course / khoá học & nội dung

- **F8.1** **Course entity**: title, mentor owner, lịch buổi, gói bán, học viên đã đăng ký.
- **F8.2** **Session entity** (1 buổi = 1 session): time, Zoom meeting_id, recording, transcript, AI output.
- **F8.3** **Material upload**: tài liệu pre-class, post-class, slide, file đính kèm — versioning.
- **F8.4** **Content access control**: chỉ học viên đã đăng ký xem được; có expiry theo gói.
- **F8.5** **Mentor tự cắm course content cao** (như "Mentor có thể tự cắm course content (cao) vào" trong SUMMARY) — embed external content (Notion, Google Drive, video link) vào lớp.

### F9 — Subscription & quota (concept gói — không chốt giá tại thời điểm này)

> Định hướng dải gói (đặt tên theo ngữ cảnh giáo dục/mentor — gợi ý: Trial, Free Tier, Acolyte, Sage, Guru, Academy, Enterprise…). **Số liệu giá cụ thể CHỜ DECISION** — xem mục 6.

- **F9.1** **Trial**: dùng thử có thời hạn (ví dụ 7/14 ngày). Full feature, quota giới hạn.
- **F9.2** **Free Tier**: miễn phí vĩnh viễn, giới hạn (số khoá, số học viên/khoá, dung lượng record, không AI nâng cao, không Zalo OA hoặc giới hạn quota Zalo).
- **F9.3** **Subscription tháng / năm** nhiều bậc — quota theo:
  - Số khoá đồng thời / số học viên đang active
  - Dung lượng lưu record (GB)
  - Số phút Zoom credit kèm theo (nếu join pool MentorHub)
  - Số lượt AI evaluation / tháng
  - Số lượt gửi Zalo OA / tháng
  - Tính năng nâng cao: AI personalization full / two-way reply / co-mentor / branding…
- **F9.4** **Add-on packs**: Zoom credit pack, AI quota pack, Storage pack, Whitelabel/branding pack.
- **F9.5** **Academy / Enterprise**: multi-mentor, billing tập trung, SSO, custom branding, SLA.
- **F9.6** **Subscription lifecycle**: trial → active → past-due → suspended → cancelled. Auto-renew với reminder D-7.
- **F9.7** **Payment**: VNPay / MoMo / chuyển khoản / quốc tế (Stripe / PayPal cho Academy nước ngoài) — pluggable gateway.
- **F9.8** **Quota enforcement** real-time: vượt quota → block + upsell prompt.

### F10 — Mentor profile & marketing

- **F10.1** **Public mentor profile page**: bio, chuyên môn, lớp đang mở, testimonial, CTA đăng ký.
- **F10.2** **Referral / affiliate**: mentor mời mentor khác → hoa hồng / credit.
- **F10.3** **Course marketplace** (giai đoạn sau): catalog các lớp public, tìm kiếm theo chuyên môn.
- **F10.4** **Custom domain / subdomain** cho Academy.

### F11 — Reporting & analytics

- **F11.1** **Mentor dashboard**: GMV tháng, học viên active, NPS, retention, hours dạy, credit Zoom dùng.
- **F11.2** **Per-course report**: tỷ lệ tham dự, tỷ lệ tương tác, tỷ lệ làm bài tập, churn.
- **F11.3** **Per-student journey**: timeline từng học viên, mức độ engagement, điểm "warmth".
- **F11.4** **HQ admin dashboard** (Reborn): tổng GMV platform, MAU, MRR, churn theo gói, AI cost vs revenue, Zoom pool utilization.
- **F11.5** **Real-time live dashboard** (cho buổi đang chạy): số người attend, raise hand, chat sentiment.

### F12 — Tích hợp khác & extensibility

- **F12.1** **Email**: gửi/nhận, IMAP/OAuth (Gmail, Outlook), template — reuse pattern integration đã có.
- **F12.2** **SMS**: backup channel.
- **F12.3** **Calendar**: Google Calendar / Outlook 2-way sync (mentor + học viên).
- **F12.4** **Zalo Mini App** cho học viên (page/Today/Students/Tickets/More đã có khung).
- **F12.5** **Webhook out**: push event ra hệ thống bên ngoài (mentor có CRM riêng).
- **F12.6** **Public REST API + API key** cho developer mentor build thêm.

---

## 3. Non-Functional Requirements

| ID | Yêu cầu | Note |
|---|---|---|
| N1 | **Multi-tenant từ ngày 1** | Solo mentor = 1 tenant; Academy = nhiều user 1 tenant |
| N2 | **Mobile-first cho student**, web-first cho mentor | Student dùng Zalo Mini App + PWA + web link; mentor dùng web + tablet |
| N3 | **Multi-channel notification** | Zalo OA primary, fallback email/SMS, in-app |
| N4 | **Audit log đầy đủ** mọi giao dịch tài chính + AI call | Compliance + đối soát |
| N5 | **Vietnamese i18n + sẵn English** | Mentor tiếng Anh dạy học viên quốc tế |
| N6 | **SSO Azure AD** cho admin nội bộ Reborn; OTP/Zalo cho mentor + student | MSAL có sẵn |
| N7 | **Privacy & PDPL Vietnam**: opt-in, consent, right-to-delete | Học viên có quyền yêu cầu xoá data |
| N8 | **Encryption at rest** cho recording + transcript | KMS-managed |
| N9 | **Rate-limit per tenant**: AI call, Zalo send, Zoom create | Chống abuse |
| N10 | **Observability**: logs, metrics, traces; error tracking; cost tracking per AI call | OTEL ready |
| N11 | **Scale**: 1000 mentor đồng thời, 100 buổi đang chạy song song | Stateless services + queue cho heavy work |
| N12 | **Backup & DR** cho recording + transcript | RPO 24h, RTO 4h |

---

## 4. Mô hình dòng tiền (chưa chốt giá)

```
Doanh thu vào HQ:
├─ Subscription tháng/năm theo tier
├─ Add-on (Zoom credit pack, AI pack, Storage pack, Whitelabel)
├─ Commission từ marketplace (giai đoạn sau)
├─ Setup fee Academy
└─ Enterprise license (custom)

Chi từ HQ:
├─ Cost AI (Anthropic/OpenAI/Groq token)
├─ Cost Zoom enterprise license (cho pool)
├─ Cost storage record + bandwidth
├─ Cost Zalo ZNS per message
├─ Hoa hồng affiliate / referral mentor
├─ Lương Reborn ops
└─ Marketing
```

---

## 5. Out of scope (đã chốt là KHÔNG làm trong v1)

- ❌ Học viên tự tạo nội dung / lớp (chỉ mentor tạo).
- ❌ E-commerce ngoài giáo dục (bán hàng vật lý).
- ❌ Live streaming public (Twitch / YouTube live) — chỉ Zoom/Meet.
- ❌ Tự build hardware Zoom (camera, mic) — không scope phần cứng.
- ❌ Self-host on-prem cho mentor lớn — **chốt: tất cả qua SaaS**.

---

## 6. Open issues cần chốt trước khi build (hoặc song song MVP)

| # | Decision | Tác động nếu không chốt |
|---|---|---|
| D1 | **Tên + giá + content cụ thể của các tier gói** (mục 9) | Block billing + paywall |
| D2 | **Quota cụ thể** mỗi tier (số khoá, học viên, AI call, Zalo msg, Zoom credit) | Block enforcement |
| D3 | **Zalo OA công ty đã verify chưa?** Có ZNS template approval flow chưa? | Block F5 |
| D4 | **Cấu trúc MCP host** cho Claude Code CLI (1 máy / nhiều / scale ngang) | Block F6.2 |
| D5 | **Công thức credit Zoom default** (rate base, earn base, swap base) | Tạm hard-code, sau cấu hình |
| D6 | **Pricing AI cost passthrough**: gói SaaS bao gồm bao nhiêu AI token, vượt thì charge thế nào | Block F6.5 |
| D7 | **Branding chiến lược**: 1 brand "MentorHub" hay multi-brand cho Academy whitelabel? | Ảnh hưởng F10.4 + tenant model |
| D8 | **Mentor onboarding pricing**: trial cần thẻ tín dụng hay không? | Ảnh hưởng F9.1 + funnel conversion |
| D9 | **Privacy policy + ToS Việt Nam** đã có draft chưa? | Phải có trước commercial T6 |
| D10 | **Tích hợp ngược FitPro** (decision D7 bên fitpro): MentorHub có expose API cho FitPro F9.1 "hằng tháng học cùng nhau" không? | Cross-product, defer được |

---

## 7. Decisions đã chốt (2026-05-07)

> 10 decisions D1–D10 đã được anh chủ confirm theo default đề xuất ngày 2026-05-07. Sau đây là spec chi tiết để Phase 1+ không cần block.

### D1 — Tier name + giá (CHỐT)

5 tier + Trial, đặt tên Việt theo ngữ cảnh giáo dục/mentor:

| Tier | Tên | Giá tháng | Giá năm | Đối tượng |
|---|---|---|---|---|
| Trial | **Tập sự (Trial)** | 0đ | — | Dùng thử 14 ngày, không cần thẻ |
| Free | **Hành giả (Free)** | 0đ | 0đ | Vĩnh viễn, giới hạn cứng |
| Starter | **Đệ tử (Starter)** | 290.000đ | 2.900.000đ (~17% off) | Mentor cá nhân ≤2 lớp |
| Pro | **Sư phụ (Pro)** | 690.000đ | 6.900.000đ | Mentor full-time |
| Master | **Tông sư (Master)** | 1.490.000đ | 14.900.000đ | Mentor cao cấp + branding |
| Academy | **Học viện (Academy)** | từ 5.000.000đ (custom) | custom | Org nhiều mentor, SSO, whitelabel |

### D2 — Quota mỗi tier (CHỐT)

| Quota | Trial | Free | Starter | Pro | Master | Academy |
|---|---|---|---|---|---|---|
| Khoá đồng thời | ∞ | 1 | 3 | 10 | 30 | ∞ |
| Học viên active/khoá | 30 | 10 | 50 | 200 | 500 | ∞ |
| Record storage (GB) | 10 | 1 | 10 | 50 | 200 | 1TB+ |
| AI evaluation/tháng | 50 | 10 | 100 | 500 | 2000 | ∞ |
| Zoom credit kèm (phút) | 300 | 0 | 600 | 2400 | 6000 | custom |
| Zalo ZNS/tháng | 200 | 50 | 500 | 2500 | 10000 | custom |
| Two-way reply | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ |
| AI auto-send (no review) | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Co-mentor / TA | 0 | 0 | 1 | 3 | 10 | ∞ |
| Branding/whitelabel | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Custom domain | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| AI model access | Haiku/Groq | Haiku/Groq | + Sonnet | + Sonnet | + Opus | + Opus |

### D3 — Zalo OA (CHỐT, có Plan B)

- **Plan A**: đăng ký OA dưới Reborn tech, submit verify ngay tuần này (5–7 ngày làm việc), submit 4 ZNS template trước: `pre-reminder`, `post-feedback`, `follow-up`, `payment-reminder`.
- **Plan B nếu verify không kịp 2026-05-15**: tạm dùng email + SMS + Zalo cá nhân (manual) cho 2 tuần đầu commercial. Zalo OA bật khi xong.
- **Action owner**: cần chỉ định người làm step verify — sẽ hỏi sau Phase 0.

### D4 — MCP host architecture (CHỐT)

- **MVP**: 1 máy duy nhất ở văn phòng Reborn cài Claude Code CLI, expose MCP qua HTTP socket trên LAN/VPN.
- **BE gateway**: flag `MCP_ENDPOINT` env switch giữa "MCP local" (heavy task, batch) vs "Anthropic API token" (short prompt, streaming UX).
- **Use case lane MCP**: transcript >1h, tool-use phức tạp, batch eval >10 học viên cùng lúc, idle hour (off-peak).
- **Use case lane API**: live streaming response, lúc mentor đang xem kết quả real-time.
- **Phase scale sau**: 2-3 máy MCP với round-robin + health check.

### D5 — Default credit Zoom rate (CHỐT — admin override được)

| Rule | Default |
|---|---|
| 1 phút Zoom Pro | 1 credit |
| 1 phút Zoom Business | 1.2 credit |
| 1 phút Zoom Enterprise | 1.5 credit |
| Earn rate cho mượn | +20% bonus (60 phút Pro = +72 credit) |
| Swap với tiền | 1 credit = 100đ |
| Cap mua/tháng | 5000 credit |
| Idle bonus | +50 credit/tuần sau 7 ngày không xài, max 4 tuần |
| Tier discount earn | Master +10%, Academy +20% |

### D6 — AI cost passthrough (CHỐT)

- Bao gồm trong gói: AI quota theo tier (D2). Vượt quota → block tier thấp, charge add-on tier cao.
- **Add-on AI pack**: 100 AI evaluation = 200.000đ.
- **Markup**: cost cứng provider × 2.5× = giá bán (margin 60%).
- **Free + Trial**: chỉ Haiku / Groq (model rẻ); Sonnet/Opus từ Starter trở lên.
- **Show usage live**: dashboard mentor hiển thị "đã dùng X/Y" — transparent.

### D7 — Branding (CHỐT)

- **MVP**: 1 brand "MentorHub", subdomain `<mentor>.mentorhub.vn` (vd `phamthanhlong.mentorhub.vn`).
- **Phase 7**: custom domain + whitelabel logo cho Master + Academy.
- **Whitelabel sâu** (remove "Powered by MentorHub"): chỉ Academy.

### D8 — Trial credit card (CHỐT)

**KHÔNG yêu cầu thẻ** ở Trial 14 ngày. Conversion drive bằng email reminder D-7/D-1/D-day + offer giảm 30% năm đầu nếu pay trong 24h sau hết trial.

### D9 — Privacy policy + ToS (CHỐT, có deadline)

- Owner: legal Reborn (hoặc thuê luật sư ngoài, ~3–5tr).
- **Deadline: 2026-05-25** (1 tuần trước commercial).
- Nội dung quan trọng:
  - Recording: opt-in từ học viên (Zoom dialog) + retention 90 ngày default, mentor có thể extend.
  - Transcript + AI eval: học viên có quyền xoá data trong 30 ngày sau khoá.
  - Data residency: VN; có học viên nước ngoài thì notice.
  - AI provider passthrough: notice data qua Anthropic/OpenAI/Groq (US).

### D10 — API expose cho FitPro (CHỐT — DEFER)

Không build trong v1.0. FitPro F9.1 dùng iframe / deep link tạm. Public API mở sau Phase 7+ (khi có 50+ mentor và 5+ academy).
