# 05.1 — GAP Analysis vs Community Hub

> Codebase hiện tại là nhánh `reborn-fitpro` cloned từ `community-hub`. Tài liệu này so sánh từng phân hệ FitPro yêu cầu với codebase hiện tại để biết "đã có / cần rework / cần build mới".

---

## 5.1. Trạng thái codebase tổng thể

| Domain | % HAVE/PARTIAL | Note |
|---|---:|---|
| F1 — Network tree | 30% | Có UI tốt, thiếu API |
| F2 — Centers | 5% | Gần như từ đầu |
| F3 — Packages | 40% | UI ổn, thiếu DB |
| F4 — 90-day journey | 25% | Timeline đẹp, mock |
| F5 — Revenue direct (POS) | 50% | Backbone CRM ổn |
| F5 — Revenue commission HBL | 0% | Cần build mới hoàn toàn |
| F6 — Home Fit | 0% | — |
| F7 — Community feed | 0% | — |
| F8 — B2B | 0% | — |
| F9 — Cadence engine | 5% | Chỉ có Notification base |
| F10 — VIP / Lab | 5% | — |
| F11 — Reports | 0% wired (mock có) | — |
| **Tổng (FitPro core)** | **~15–20%** | |

---

## 5.2. ✅ Tận dụng tốt — Rename + đổi tone (~60% reuse)

| Community Hub hiện tại | FitPro rebrand | Ghi chú |
|---|---|---|
| MembershipPlanSettings (Standard/Premium/VIP) | **FitPro Packages** (BASIC 80k/buổi → SUPER VIP 500k/buổi) | Giữ UI, đổi mock data + labels theo Pricing 5 tier |
| Checkin QR | **Check-in trạm liên thông** | Thêm cross-station card verification |
| QuickAddMember | Đăng ký khách mới vào phễu 90 ngày | Thêm field "gói 90 ngày" |
| Customer Care automation | Automation 90-day journey + nhắc gia hạn D-15 | Trigger nhắc 15 ngày trước hết hạn |
| Feedback 5 sao | Đánh giá sau buổi tập | Trigger sau check-out |
| Partners (KOL/KOC/PO) | **Business Owners** (4 profile) | Thêm profile type chọn |
| Reports (Revenue/Members/Check-in/Services) | Giữ — đổi context sang fitness | KPI labels |
| ServiceBooking 3 tabs | Đặt slot 6h–9h sáng cho thảm tập | Giới hạn time window |
| ServiceManagement (5 categories) | Catalog buổi tập + combo dinh dưỡng | Rebuild categories |
| DashboardCH | Dashboard trạm (fitness KPIs) | Đổi cards |

---

## 5.3. 🔄 Rework — Thay đổi ngữ nghĩa

| Community Hub | Thay bằng | Lý do |
|---|---|---|
| **Accommodation** (phòng nam/nữ, lưu trú) | **Station Layout** (sơ đồ thảm 3–7 hoặc 5–20, occupied/free) | FitPro không có lưu trú |
| **Courses** (PT lịch học) | **Training Programs** (giáo trình video chuẩn hóa) | Tự động hóa giáo trình — dạy ngay cả khi 0 khách |
| **Lễ tân** (cả ngày) | **Trạm FitPro 6–9h** | Khác giờ vận hành |
| **Kho & NVL** (full warehouse) | **Tắt toggle** (Herbalife hãng tự quản) | Chủ trạm không quản kho |
| **TenantConfig defaults** | Pre-set toggles phù hợp fitness | Thêm `vertical: 'fitpro'` flag |

---

## 5.4. ❌ Thiếu mới — Cần build (11 phân hệ)

> Map sang Requirements F1–F11. Chi tiết yêu cầu tại [02-scope/functional-scope.md](../02-scope/functional-scope.md).

| Req | Phân hệ | Ưu tiên | Trạng thái codebase |
|---|---|:---:|---|
| **F1** | Cây giới thiệu 7×7×7 | ⭐⭐⭐ | `/fp_network_tree` có UI, mock data — cần wire API |
| **F2** | Center / Inside / Home đa loại | ⭐⭐⭐ | Mock `fitpro-stations.ts` (1 type) — cần đa loại |
| **F3** | 5 tier (lifecycle persist) | ⭐⭐⭐ | UI có, in-memory |
| **F4** | 90-day Journey Tracker | ⭐⭐⭐ | `/fp_journey` mock timeline |
| **F5.1** | Direct revenue POS → Invoice | ⭐⭐⭐ | `/sale_invoice` wired ~85%; POS state-only |
| **F5.2** | HBL commission ledger + đối soát | ⭐⭐⭐ | Chưa có gì |
| **F6** | Home Fit family group | ⭐⭐ | Chưa có |
| **F7** | Case study public + duyệt BPM | ⭐⭐ | Chưa có |
| **F8** | B2B Corporate + bulk + trial | ⭐⭐ | Chưa có |
| **F9** | Cadence engine D/W/M/Q/Y + Streak | ⭐⭐ | Chỉ có Notification base |
| **F10** | VIP transfer Adorn + Medlatec | ⭐⭐ | Chưa có |
| **F11** | Reports HQ/Center/BO/Realtime | ⭐⭐⭐ | 6 page mock, chưa wire aggregation |

---

## 5.5. 🎨 UX/UI Rebranding

| Item | Community Hub | FitPro |
|---|---|---|
| Brand name | Community Hub | **FitPro** |
| Tagline | — | "Trạm sạc siêu xe con người MF7" |
| Primary color | (business blue) | **Teal #00c9a7** (sức khỏe) |
| Accent color | — | **Orange #ff8c42** (năng lượng) |
| Tone | Corporate | Energetic, health-focused, motivational |
| Hero / empty states | co-working imagery | thảm tập, bình shake, 6am sunrise |
| Sidebar icons | generic | thảm tập, bình shake, tim pulse, tree |
| Logo | CH wordmark | **F7** mark |

---

## 5.6. Pages hiện có trong codebase

17 page files under `src/pages/CommunityHub/`:

| File | Purpose | Trạng thái với FitPro |
|---|---|---|
| `Accommodation/` | Room & bed | 🔄 Rework → Station Layout |
| `Checkin/` | QR scan, member status | ✅ Reuse + cross-station |
| `Courses/` | Courses & clubs catalog | 🔄 Rework → Training Programs |
| `Feedback/` | Member feedback | ✅ Reuse |
| `MembershipPlanSettings/` | Tier-based plan config | ✅ Reuse, đổi mock 5 tier |
| `Partners/` | KOL/KOC/PO partners | 🔄 Rebrand → Business Owners (4 profile) |
| `QuickAddMember/` | Slide-in quick registration | ✅ Reuse + thêm 90D package field |
| `Reports/index` + 6 reports | Router hub for 6 reports | 🔄 Wire BE (đang mock) |
| `ServiceBooking/` | Sell card / deduct / booking | ✅ Reuse + giới hạn 6–9h |
| `ServiceManagement/` | Service catalog | 🔄 Rebuild 5 categories |
| `TenantConfig/` | Feature flags | 🔄 Add `vertical: 'fitpro'` |

---

## 5.7. Conflict cần reconcile giữa các nguồn

| Vấn đề | Nguồn A | Nguồn B | Giải pháp |
|---|---|---|---|
| **Số tier gói** | Meeting 06/05: 6 tier (+ Diamond) | Strategy 11/05: 5 tier (BASIC → SUPER VIP) | → BOD chốt 5 hay 6 (D3) |
| **Tên 3 không gian** | Meeting: Home/Center/Coup | Strategy: Home/Inside/Center | → Thống nhất Strategy (Home/Inside/Center) |
| **Cấu trúc giá** | GAP cũ: 2,4 triệu/gói 30 buổi | Strategy: 80k/buổi 5 tier | → Strategy mới chuẩn; gói 30/60/90 ngày = tier × 30/60/90 |
| **Triết lý vận hành** | Meeting: % theo khách | Strategy: Power vs Force, tần số Hawkins | → Cả 2 đều đúng, bổ trợ |
