# GAP Analysis & Plan — FitPro

**Đối chiếu:** `REQUIREMENTS_fitpro.md` (yêu cầu mới) vs codebase hiện tại tại `/home/reborn/code/rox/reborn-fitpro/`.
**Ngày phân tích:** 2026-05-06.
**Người duyệt cần xác nhận:** anh chủ FitPro + Dũng.

> ⚠️ **Plan này chỉ là đề xuất.** Chưa thực hiện. Vui lòng review và duyệt trước khi triển khai.

---

## 1. Tổng quan hiện trạng

- Stack: **React 18 + TypeScript + Vite**, React Router 7, Context API (không Redux), AgGrid + Highcharts.
- Auth: **MSAL (Azure AD)** đã hoạt động cho admin; member auth chưa rõ.
- API: 8 microservices đã map trong `src/configs/urls.ts` (`customer`, `sales`, `billing`, `inventory`, `bpm`, `care`, `notification`, `integration`, …).
- **~43% các tính năng đang là mock data hoặc stub** (theo `docs/handoff/AUDIT_2026-05-03_CRUD_COVERAGE.md`).
- Phần legacy CRM (sale invoice, customer, invoice VAT) đã wired ~85%; **các module FitPro core (F2–F11) ~5–25%, đa số là alert stub**.

---

## 2. GAP Matrix theo từng yêu cầu

Ký hiệu trạng thái:
- 🟢 **HAVE** — đã wired, dùng được
- 🟡 **PARTIAL** — có UI/mock nhưng chưa nối API hoặc thiếu tính năng
- 🔴 **MISSING** — chưa có gì

| Req | Mô tả ngắn | Trạng thái | Ở đâu hiện tại | GAP cần lấp |
|---|---|---|---|---|
| **F1** Cây giới thiệu MLM |  |  |  |  |
| F1.1 | Signup phải under referrer | 🔴 | `src/pages/Login` không có signup | Build signup flow + referrer param |
| F1.2 | Link giới thiệu cá nhân | 🔴 | — | Generate code + landing page tracking |
| F1.3 | Tree downline | 🟡 | `/fp_network_tree` UI có, mock data | Nối API `customer.business_owner_node` |
| F1.4 | Quy tắc 7×7×7 config | 🟡 | Hardcoded trong validation FE | Đẩy rule vào `TenantConfig` |
| F1.5 | Cross-region | 🟡 | Tree không bind theo center | Confirm BE entity không bind location → hiện đang OK |
| **F2** Center / Coup / Home |  |  |  |  |
| F2.1 | 3 loại entity | 🔴 | Mock có `fitpro-stations.ts` (chỉ "station") | Thiết kế `location` entity với `type ∈ {home,center,coup}` |
| F2.2 | Owned vs Handover | 🔴 | — | Thêm field `ownership_model` + billing rule khác nhau |
| F2.3 | Camera stream về central | 🔴 | — | Cần khảo sát stack camera (Wyze? Dahua?) — out of FE scope, BE/integration |
| F2.4 | Đóng gói franchise kit | 🔴 | — | Build module "Open new center" wizard |
| **F3** 6 gói thành viên |  |  |  |  |
| F3.1 | 6 tiers (hiện 5) | 🟡 | `src/mocks/community-hub/membership-plans.ts` | Thêm Diamond + persist DB (hiện in-memory) |
| F3.2 | Plan content (sessions/drinks/exam/E-Gift) | 🟡 | UI có, không lưu | Map sang `inventory.product` + bundle items |
| F3.3 | Lifecycle intake → renewal | 🔴 | — | Build subscription state machine |
| F3.4 | Bán đa kênh (POS, online, B2B) | 🟡 | POS có UI tại `/counterSales` (state-only) | Wire POS → `sales.invoice`; build self-service + B2B bulk |
| **F4** Lộ trình 90 ngày |  |  |  |  |
| F4.1 | 5 phase | 🟡 | `/fp_journey` có timeline UI, mock | Persist phase trong DB; auto-transition theo ngày |
| F4.2 | Ghi nhận buổi tập | 🟡 | `/ch_checkin` UI search, mock | Wire BE; ghi nhận chỉ số chi tiết (calo, bài tập) |
| F4.3 | Kết nối Medlatec lab | 🔴 | — | Cần BE `integration.medlatec` (đã đặt slot module nhưng chưa build) |
| F4.4 | Báo cáo outcome 90 ngày | 🔴 | — | Auto-generate report job |
| F4.5 | App mobile member | 🔴 | Chưa thấy app riêng | **Build mobile app (RN/Flutter) hoặc PWA** — quyết định lớn |
| **F5** 2 luồng doanh thu |  |  |  |  |
| F5.1 | Direct revenue (POS → invoice) | 🟡 | `/sale_invoice`, `/invoice_vat` wired tốt | POS → invoice flow (hiện POS chưa tạo invoice thật); fix bug `InvoiceVATService.delete()` |
| F5.2a | Import Herbalife commission | 🔴 | — | Build import wizard (CSV/Excel) + ledger entry |
| F5.2b | Auto-distribute theo cây | 🔴 | — | Engine phân phối + audit log |
| F5.2c | Đối soát | 🔴 | — | Report tổng nhận vs tổng phân phối |
| F5.3 | Cấu hình % theo tier/sản phẩm | 🔴 | — | Settings page + rule engine |
| **F6** Home Fit |  |  |  |  |
| F6.1 | Tạo Home, mời thành viên | 🔴 | — | Entity `family_group` + invite flow |
| F6.2 | Streak/leaderboard nội bộ | 🔴 | — | Aggregation job + UI |
| F6.3 | App per-member, đua chung | 🔴 | — | Cần app member trước (xem F4.5) |
| **F7** Cộng đồng / case study |  |  |  |  |
| F7.1 | Trang case study public | 🔴 | — | Build CMS-lite cho case study |
| F7.2 | Submit + duyệt | 🔴 | — | Workflow approval (BPM có sẵn microservice — reuse) |
| F7.3 | Embed media | 🔴 | — | Storage + render |
| **F8** B2B / Doanh nghiệp |  |  |  |  |
| F8.1 | Corporate Account entity | 🔴 | — | Schema + CRUD page |
| F8.2 | Bulk enrollment | 🔴 | — | Upload Excel + batch create |
| F8.3 | Trial flow | 🔴 | — | Trial state + auto-convert/expire |
| F8.4 | HR dashboard | 🔴 | — | Per-corporate report |
| **F9** Cadence & gamification |  |  |  |  |
| F9.1 | Scheduled events D/W/M/Q/Y | 🔴 | — | Engine cron + content management |
| F9.2 | Streak/badge/leaderboard | 🔴 | — | Gamification module |
| F9.3 | Notification engine (push/Zalo/email) | 🟡 | `NotificationService.ts` có nhưng không có scheduled reminders | Mở rộng + tích hợp Zalo OA |
| **F10** VIP / Adorn / Lab |  |  |  |  |
| F10.1 | Chuyển VIP sang Adorn | 🔴 | — | Lead transfer flow |
| F10.2 | Track lead status | 🟡 | `care` microservice có CRM cơ bản | Cần workflow VIP-specific |
| F10.3 | Bán xét nghiệm | 🔴 | — | Add lab products vào catalog |
| **F11** Báo cáo |  |  |  |  |
| F11.1 | Dashboard HQ | 🔴 | `/ch_report_*` (6 page mock) | Wire aggregation BE |
| F11.2 | Per-center | 🔴 | — | Filter theo location |
| F11.3 | Per-BO | 🔴 | — | Filter theo node trong tree |
| F11.4 | Real-time mat usage | 🟡 | `/ch_accommodation` UI có | Wire WebSocket / polling |

### Tổng kết theo % wiring:

| Domain | % HAVE/PARTIAL | Note |
|---|---|---|
| F1 — Network tree | 30% | Có UI tốt, thiếu API |
| F2 — Centers | 5% | Gần như từ đầu |
| F3 — Packages | 40% | UI ổn, thiếu DB |
| F4 — 90-day journey | 25% | Timeline đẹp, mock |
| F5 — Revenue direct | 50% | Backbone CRM ổn |
| F5 — Revenue commission | 0% | Cần build mới hoàn toàn |
| F6 — Home Fit | 0% | — |
| F7 — Community feed | 0% | — |
| F8 — B2B | 0% | — |
| F9 — Cadence engine | 5% | Chỉ có Notification base |
| F10 — VIP / lab | 5% | — |
| F11 — Reports | 0% wired (mock có) | — |
| **Tổng (FitPro core)** | **~15–20%** | |

---

## 3. Plan lấp GAP — phân kỳ 4 phase

> **Nguyên tắc**: ưu tiên những gì pilot cần nhất để mở 1 center thật + đo doanh thu thật. Cộng đồng/B2B/gamification để sau khi có dữ liệu thực.

### Phase 0 — Foundation cleanup (1 tuần)
**Mục tiêu**: dọn nợ cũ + chuẩn bị schema chung.

| # | Việc | Ước lượng | Owner |
|---|---|---|---|
| 0.1 | Fix bug `InvoiceVATService.delete()` crash (`src/pages/Sell/InvoiceVAT/index.tsx:217`) | 0.5d | FE |
| 0.2 | Hoàn tất stub `Finance/CashBookTemplate`, `ShiftInventory`, `PaymentReconciliation` | 2d | FE+BE |
| 0.3 | Persist `MembershipPlanSettings` vào DB thật (hiện in-memory) | 1d | FE+BE |
| 0.4 | Wire 6 trang `/ch_report_*` từ mock sang aggregation API | 2d | FE+BE |
| 0.5 | Audit + thống nhất schema: `member`, `bo_node`, `location`, `package`, `subscription` | 1d | Architect |

**Exit**: backbone CRM 100% wired, không còn alert/mock ở backbone.

---

### Phase 1 — Pilot 1 center thật (3–4 tuần)

**Mục tiêu**: mở 1 center pilot (Hải Phòng), bán được gói thật, ghi nhận check-in thật, tracker được lộ trình 90 ngày.

| # | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| 1.1 | **F2** Entity `location` đa loại + CRUD (Owned/Handover) | 2d | 0.5 |
| 1.2 | **F1** Signup public với referrer link → tạo member + gắn under BO | 3d | 0.5 |
| 1.3 | **F1** Wire `/fp_network_tree` lên API thật (CRUD node, lazy load lớn) | 2d | 1.2 |
| 1.4 | **F3** 6 gói (thêm Diamond) → catalog `inventory.product` + UI `/ch_membership_plans` persist | 2d | 0.3 |
| 1.5 | **F3.4** POS `/counterSales`: cart → tạo invoice thật → trừ tồn gói | 3d | 1.4 |
| 1.6 | **F4.1+4.2** Journey 90-day persist; check-in `/ch_checkin` wire BE | 3d | 1.4 |
| 1.7 | **F4.5 quyết định**: build PWA member (1 tuần) hay bỏ qua, dùng Zalo OA + web link cho member? | (decide) | — |
| 1.8 | **F11.4** Mat usage realtime tại `/ch_accommodation` | 1d | 1.6 |
| 1.9 | **F9.3** Notification scheduled cơ bản: nhắc tập sáng, nhắc renewal D-7 | 2d | 1.6 |

**Exit**: 1 center pilot vận hành đầu cuối với data thật. Anh chủ + 1 coach ngồi 1 tuần thử nghiệm thấy đủ flow.

---

### Phase 2 — 2 luồng doanh thu hoàn chỉnh (2–3 tuần)

**Mục tiêu**: đo được tiền vào tới từng đồng, phân phối hoa hồng tự động.

| # | Việc | Ước lượng | Phụ thuộc |
|---|---|---|---|
| 2.1 | **F5.2a** Import wizard hoa hồng Herbalife (CSV/Excel mapper) | 3d | 1.3 |
| 2.2 | **F5.2b** Engine phân phối theo cây + audit log mọi giao dịch | 3d | 2.1 |
| 2.3 | **F5.2c** Báo cáo đối soát + cảnh báo lệch | 1d | 2.2 |
| 2.4 | **F5.3** Settings page % hoa hồng theo tier/sản phẩm | 2d | 2.1 |
| 2.5 | **F11.3** Per-BO dashboard: doanh thu nhánh, hoa hồng đã/sẽ nhận | 2d | 2.2 |
| 2.6 | **F11.1+11.2** Dashboard HQ + per-center (filter, drill-down) | 3d | 1.5+2.2 |

**Exit**: Anh chủ ngồi xem dashboard cuối tháng, thấy đủ tiền + đủ phân phối, không cần Excel.

---

### Phase 3 — Cộng đồng & nhân bản (3–4 tuần)

**Mục tiêu**: bật văn hóa cadence, mở Home Fit cho gia đình, sẵn sàng nhân bản coup.

| # | Việc | Ước lượng |
|---|---|---|
| 3.1 | **F6** Home Fit entity + invite flow + leaderboard nội bộ | 5d |
| 3.2 | **F9.1** Scheduled events engine D/W/M/Q/Y + content CMS đơn giản | 5d |
| 3.3 | **F9.2** Streak / badge / global leaderboard | 3d |
| 3.4 | **F7** Trang case study public + workflow duyệt | 4d |
| 3.5 | **F2.4** Wizard "Open new center" — đóng gói franchise kit (SOP, branding, lô) | 3d |

**Exit**: 3–5 Home Fit pilot chạy, 2–3 case study public, sẵn sàng mở coup vùng 2.

---

### Phase 4 — B2B & VIP / Lab (2–3 tuần)

**Mục tiêu**: mở kênh doanh nghiệp + chuẩn hóa flow VIP.

| # | Việc | Ước lượng |
|---|---|---|
| 4.1 | **F8.1+8.2** Corporate Account + bulk enrollment Excel | 4d |
| 4.2 | **F8.3** Trial flow 3/7 ngày + auto-convert | 2d |
| 4.3 | **F8.4** HR dashboard | 2d |
| 4.4 | **F10** VIP transfer Adorn + bán xét nghiệm + integrate Medlatec API | 5d |

**Exit**: 1 doanh nghiệp pilot bulk enroll 50+ nhân viên; 5 VIP đã qua flow Adorn thành công.

---

## 4. Tóm tắt timeline & nhân lực

| Phase | Thời lượng | FE-day | BE-day | Khác |
|---|---|---|---|---|
| 0 | 1 tuần | 4 | 3 | Architect 1 |
| 1 | 3–4 tuần | 12 | 10 | + 1 PWA decision |
| 2 | 2–3 tuần | 7 | 7 | |
| 3 | 3–4 tuần | 12 | 8 | + content writer |
| 4 | 2–3 tuần | 8 | 9 | + Medlatec contract |
| **Tổng** | **~12 tuần (3 tháng)** | **~43 FE-d** | **~37 BE-d** | |

Với 1 FE + 1 BE full-time, ước lượng **~3 tháng** là khả thi.
Nếu đẩy nhanh: 2 FE + 2 BE → **~7–8 tuần**.

---

## 5. Rủi ro & open decisions cần chốt trước khi start

| # | Decision | Tác động nếu không chốt |
|---|---|---|
| D1 | **F4.5**: Build app mobile (RN/Flutter ~1 tháng), PWA (~1 tuần), hay không có app? | Quyết định ngân sách + timeline lớn |
| D2 | **F2.3**: Camera stream — dùng giải pháp gì? Có nằm trong scope phần mềm không? | Có thể defer ra ngoài Reborn scope |
| D3 | **6 gói** chính thức (tên + giá + content) | Block F3 |
| D4 | **Format file Herbalife** + tần suất import | Block F5.2 |
| D5 | **Luật phân phối hoa hồng** chi tiết | Block F5.2b |
| D6 | **Quy tắc 7×7×7** cố định hay config? | Ảnh hưởng schema |
| D7 | **MentorHub có cần tích hợp ngược lại FitPro không** (cho mục F9.1 hằng tháng học cùng nhau)? | Cross-product API |
| D8 | **Hợp đồng Medlatec** đã có chưa? | Block F4.3 + F10.3 |

---

## 6. Đề xuất tiếp theo

1. **Anh chủ FitPro review** REQUIREMENTS_fitpro.md — confirm hoặc bổ sung.
2. **Chốt 8 decisions** ở mục 5 (đặc biệt D1, D3, D4, D5).
3. **Anh + Dũng** duyệt PLAN này; điều chỉnh thứ tự ưu tiên nếu cần.
4. Sau khi duyệt, mới bắt đầu **Phase 0** (1 tuần dọn nợ) — đây cũng là cách kiểm tra chất lượng team trước khi commit dài hạn.
