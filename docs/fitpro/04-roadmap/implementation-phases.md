# 04.2 — Implementation Phases (technical roadmap)

> Roadmap kỹ thuật chia 5 phase (P0 cleanup → P4 B2B/Lab), khớp với Business Roadmap. Tổng ~12 tuần với 1 FE + 1 BE full-time.

---

## 4.6. Nguyên tắc roadmap kỹ thuật

1. Ưu tiên những gì pilot Hà Nội cần nhất để mở 1 Center thật + đo doanh thu thật.
2. Cộng đồng / B2B / Gamification để sau khi có dữ liệu pilot thật.
3. Mỗi phase có **Exit gate rõ ràng**, không qua phase sau nếu Exit fail.

---

## Phase 0 — Foundation Cleanup (1 tuần)

**Mục tiêu**: dọn nợ cũ + chuẩn bị schema chung.

| # | Việc | Ước lượng | Owner |
|---|---|---|---|
| 0.1 | Fix bug `InvoiceVATService.delete()` crash (`src/pages/Sell/InvoiceVAT/index.tsx:217`) | 0,5d | FE |
| 0.2 | Hoàn tất stub `Finance/CashBookTemplate`, `ShiftInventory`, `PaymentReconciliation` | 2d | FE+BE |
| 0.3 | Persist `MembershipPlanSettings` vào DB thật (hiện in-memory) | 1d | FE+BE |
| 0.4 | Wire 6 trang `/ch_report_*` từ mock sang aggregation API | 2d | FE+BE |
| 0.5 | Audit + thống nhất schema: `member`, `bo_node`, `location`, `package`, `subscription` | 1d | Architect |

**Exit**: Backbone CRM 100% wired, không còn alert/mock ở backbone.

---

## Phase 1 — Pilot 1 Center thật (3–4 tuần)

**Mục tiêu**: Mở 1 Center pilot Hà Nội, bán gói thật, ghi nhận check-in thật, tracker lộ trình 90 ngày.

| # | Việc | Map req | Ước lượng |
|---|---|---|---|
| 1.1 | Entity `location` đa loại + CRUD (Owned/Handover) | F2.1, F2.2 | 2d |
| 1.2 | Signup public với referrer link → tạo member + gắn under BO | F1.1, F1.2 | 3d |
| 1.3 | Wire `/fp_network_tree` lên API thật (CRUD node, lazy load) | F1.3 | 2d |
| 1.4 | 5 tier gói → catalog `inventory.product` + UI `/ch_membership_plans` persist | F3.1, F3.2 | 2d |
| 1.5 | POS `/counterSales`: cart → invoice thật → trừ tồn gói | F3.4, F5.1 | 3d |
| 1.6 | Journey 90-day persist; check-in `/ch_checkin` wire BE | F4.1, F4.2 | 3d |
| 1.7 | **Quyết định D1**: build PWA member (~1 tuần) hay Zalo OA + web link? | F4.5 | (decide) |
| 1.8 | Mat usage realtime tại `/ch_accommodation` | F11.4 | 1d |
| 1.9 | Notification scheduled cơ bản: nhắc tập sáng, nhắc renewal D-7 | F9.3 | 2d |

**Exit**: 1 Center pilot vận hành đầu cuối với data thật. Anh chủ + 1 Coach ngồi 1 tuần thử nghiệm thấy đủ flow.

---

## Phase 2 — 2 luồng doanh thu hoàn chỉnh (2–3 tuần)

**Mục tiêu**: Đo được tiền vào tới từng đồng, phân phối hoa hồng tự động.

| # | Việc | Map req | Ước lượng |
|---|---|---|---|
| 2.1 | Import wizard hoa hồng HBL (CSV/Excel mapper) | F5.2a | 3d |
| 2.2 | Engine phân phối tham chiếu theo cây + audit log mọi giao dịch | F5.2b | 3d |
| 2.3 | Báo cáo đối soát + cảnh báo lệch | F5.2c | 1d |
| 2.4 | Settings page % hoa hồng theo tier/sản phẩm | F5.3 | 2d |
| 2.5 | Per-BO dashboard: doanh thu nhánh, hoa hồng đã/sẽ nhận | F11.3 | 2d |
| 2.6 | Dashboard HQ + per-Center (filter, drill-down) | F11.1, F11.2 | 3d |

**Exit**: Anh chủ ngồi xem dashboard cuối tháng, thấy đủ tiền + đủ phân phối, không cần Excel.

---

## Phase 3 — Cộng đồng & Nhân bản (3–4 tuần)

**Mục tiêu**: Bật văn hóa cadence, mở Home Fit cho gia đình, sẵn sàng nhân bản Center vùng 2.

| # | Việc | Map req | Ước lượng |
|---|---|---|---|
| 3.1 | Home Fit entity + invite flow + leaderboard nội bộ | F6 | 5d |
| 3.2 | Scheduled events engine D/W/M/Q/Y + content CMS đơn giản | F9.1 | 5d |
| 3.3 | Streak / Badge / Global leaderboard | F9.2 | 3d |
| 3.4 | Trang case study public + workflow duyệt (reuse BPM) | F7 | 4d |
| 3.5 | Wizard "Open new center" — đóng gói franchise kit | F2.4 | 3d |

**Exit**: 3–5 Home Fit pilot chạy, 2–3 case study public, sẵn sàng mở Center vùng 2.

---

## Phase 4 — B2B & VIP / Lab (2–3 tuần)

**Mục tiêu**: Mở kênh doanh nghiệp + chuẩn hóa flow VIP.

| # | Việc | Map req | Ước lượng |
|---|---|---|---|
| 4.1 | Corporate Account + bulk enrollment Excel | F8.1, F8.2 | 4d |
| 4.2 | Trial flow 3/7 ngày + auto-convert | F8.3 | 2d |
| 4.3 | HR dashboard | F8.4 | 2d |
| 4.4 | VIP transfer Adorn + bán xét nghiệm + integrate Medlatec API | F10 | 5d |

**Exit**: 1 doanh nghiệp pilot bulk enroll 50+ nhân viên; 5 VIP đã qua flow Adorn thành công.

---

## 4.7. Tóm tắt timeline & nhân lực

| Phase | Thời lượng | FE-day | BE-day | Khác |
|---|---|---:|---:|---|
| **0** | 1 tuần | 4 | 3 | Architect 1 |
| **1** | 3–4 tuần | 12 | 10 | + 1 PWA decision |
| **2** | 2–3 tuần | 7 | 7 | |
| **3** | 3–4 tuần | 12 | 8 | + content writer |
| **4** | 2–3 tuần | 8 | 9 | + Medlatec contract |
| **Tổng** | **~12 tuần (3 tháng)** | **~43 FE-d** | **~37 BE-d** | |

- **1 FE + 1 BE** full-time → ~3 tháng.
- **2 FE + 2 BE** → ~7–8 tuần.

---

## 4.8. Roadmap kỹ thuật khớp Roadmap kinh doanh

| Mốc kinh doanh | Yêu cầu công nghệ phải sẵn sàng |
|---|---|
| **T5/2026 Kickoff** | App MVP: Affiliate Mã A, Onboarding, POS Coach BASIC, Đo chỉ số đơn giản → **Phase 0 + Phase 1.1–1.5** |
| **T6/2026 C007 Hà Nội** | Contactless Check-in "Bíp", Coach Schedule, Streak v1, Coach Earnings → **Phase 1.6–1.9** |
| **T7–9/2026 Nhân bản Elite** | Family Account, HBL ID Link (read-only), Hall of Fame, SOP Knowledge Base → **Phase 2 + 3.1, 3.5** |
| **T10–12/2026 Bắc-Trung-Nam** | Multi-tenant Center, Cross-center booking, Inter-Coach payout → hardening **Phase 2** |
| **2027 Bùng nổ** | Genealogy Tree + auto-mint Mã N, Co-Founder Console, Big Data analytics, Medlatec integration → **Phase 3.4 + Phase 4** |
