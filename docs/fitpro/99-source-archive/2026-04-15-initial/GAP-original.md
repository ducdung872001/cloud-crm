# FitPro vs Community Hub — GAP Analysis

**Version**: 1.0
**Date**: 2026-04-15
**Branch**: `reborn-fitpro` (cloned from `community-hub`)
**Sources**:
- [`docs/fitpro/Nội dung trao đổi dự án FitPro.docx`](./Nội%20dung%20trao%20đổi%20dự%20án%20FitPro.docx)
- [`docs/fitpro/FitPro.pptx`](./FitPro.pptx) (14 slides)
- Community Hub codebase survey (menu, pages, mocks, locales, TenantConfig)

---

## 1. Tóm tắt FitPro

### Mô hình kinh doanh
- **Chuỗi trạm sức khỏe MF7** — "Trạm sạc siêu xe con người" = fitness + dinh dưỡng (Herbalife/OLE) + xét nghiệm (Medlatec)
- **Chu kỳ trải nghiệm 90 ngày** — intake → baseline test → tập luyện → re-test → outcome
- **Vận hành 3 giờ vàng 6h–9h sáng** (không phải cả ngày như co-working)
- **Nhượng quyền phi chính thức đa cấp 3 tầng** công thức 7×7×7
  - 1 BO → **7 trạm trực tiếp** → **49 vệ tinh** → **343 bùng nổ**
  - Mục tiêu 2027: **10.000 trạm** toàn quốc
  - Hiện trạng: ~10 điểm rời rạc, ~100 thành viên

### 2 loại trạm
| Loại | Không gian | Sức chứa | Đặc điểm |
|---|---|---|---|
| **Home FitPro** | Phòng khách + bếp tại nhà | 3–7 thảm | 100% khách VIP là người thân quen, dùng chính không gian sống |
| **Co-Working FitPro** | Thuê mặt bằng (có thể convert từ yoga/spa vắng) | 5–20 thảm, 2–3 tập mỗi ca | Phân bổ chi phí siêu rẻ 2–3 triệu VND/người/tháng, đón khách vãng lai |

### 3 nguồn thu
1. **Bán lẻ sản phẩm**: mua sỉ → bán lẻ, ăn chênh lệch
2. **Chiết khấu chênh lệch đại lý**: cấp cao hưởng 50%, thấp hơn 25%
3. **Hoa hồng hệ thống**: 5%/tầng × tối đa 3 tầng
   - ⚠️ **Hãng tự tính và trả** — chủ trạm **không cần quản lý phần này**, chỉ view dashboard

### 5 gói sản phẩm (cấu trúc từ slide 9)
| Gói | Giá gợi ý | Nội dung |
|---|---|---|
| **Cơ bản** | 2.400.000 VND | 30 buổi tập + Trà năng lượng & Shake |
| **Plus** | — | + Cấp nước (Hydrate) |
| **Pro** | — | + Phục hồi cơ bắp |
| **VIP** | ~10.000.000 VND | + Bảo vệ xương khớp & tim mạch + Xét nghiệm y tế (gói khởi nghiệp chuẩn) |
| **Super VIP** | — | + Quà tặng E-Gift + full toàn bộ |

### 4 Business Owner types (từ slide 5)
| Profile | Vấn đề | Giải pháp FitPro |
|---|---|---|
| **Dân văn phòng** | Chán ngán 8 tiếng gò bó, kẹt xe | Tìm lối thoát sống đam mê, làm chủ quỹ thời gian |
| **Chủ doanh nghiệp** | Chôn vốn vào mặt bằng, chi phí cố định cao | Mô hình khởi nghiệp tinh gọn, đòn bẩy vốn mạnh mẽ |
| **Huấn luyện viên (PT/Yoga)** | Bán sức lấy tiền theo giờ, thu nhập bị giới hạn | Nhân bản thu nhập, tối ưu kết quả không phụ thuộc máy móc |
| **Đại sứ lối sống khỏe** | Muốn chăm sóc gia đình nhưng thiếu nguồn lực công cụ | Biến tổ ấm thành trung tâm sức khỏe, tạo dòng tiền từ giúp đỡ người khác |

### Lộ trình tài chính (từ slide 12)
| Giai đoạn | Quy mô | Thu nhập ước tính |
|---|---|---|
| 1 — Khởi nghiệp thần tốc | 1 → 7 trạm | 35–50 triệu/tháng |
| 2 — Sự nghiệp gia đình | 7 → 49 trạm (57 điểm) | ~100 triệu/tháng |
| 3 — Bùng nổ hệ thống | 49 × 7 = 343 (400 điểm) | **> 1 tỷ/tháng** |

### Triết lý MF7 (slide 13)
- **M** Mastery — Tư duy làm chủ (công việc kinh doanh, sức khỏe, vận mệnh)
- **F** Force — Đứng trên vai người khổng lồ (Herbalife, Medlatec — đối tác sẵn có)
- **Free** Tự do: sức khỏe, thời gian, tài chính, di chuyển
- **7** Lever — Đòn bẩy nhân bản ×7
- "Sử dụng **1% nỗ lực của 10.000 trạm** thay vì 100% nỗ lực của chính mình"

---

## 2. Community Hub codebase hiện có

### Menu cấu trúc (13 nhóm, `src/configs/routes.tsx`)
1. **Dashboard** (`/dashboard`)
2. **Lễ tân**: Create Sales Order / Check-in (`/ch_checkin`) / Service Deduction (`/ch_services`) / Shift Management
3. **Khách hàng**: Customer List / Customer Settings
4. **Giao dịch**: Sales Invoice / VAT Invoice
5. **Lưu trú**: (`/ch_accommodation`)
6. **Tài chính**: Finance Dashboard / Cashbook / Fund / Category / Debt / Payment Control
7. **Đối tác**: (`/ch_partners`)
8. **Phản hồi**: (`/ch_feedback`)
9. **Báo cáo**: Revenue / Members / Check-in / Services / Partners / Finance
10. **Tiếp thị & Chăm sóc**: Promotions / Loyalty / Campaigns / Customer Care
11. **Kho & NVL**: Materials / Suppliers / Warehouse / Inventory / Audits / Reports
12. **Cài đặt**: TenantConfig / Service Catalog / Membership Plans / Basis / Organization / Channels / Integrations / Account / Support

### CommunityHub pages (17 files under `src/pages/CommunityHub/`)
| File | Purpose |
|---|---|
| `Accommodation/` | Room & bed (nam/nữ), occupancy tracking |
| `Checkin/` | QR scan, member status on entry |
| `Courses/` | Courses & clubs catalog, instructor tracking |
| `Feedback/` | Member feedback/complaint, priority, resolution |
| `MembershipPlanSettings/` | Tier-based plan config (price, duration, quotas) |
| `Partners/` | KOL/KOC/PO partners, commission, referrals |
| `QuickAddMember/` | Slide-in quick registration form |
| `Reports/index` | Router hub for 6 reports |
| `Reports/ReportRevenue` | MRR, ARR, retention, churn |
| `Reports/ReportMembers` | Total/active/expired/expiring, LTV |
| `Reports/ReportCheckin` | Daily/weekly/monthly counts, peak hours |
| `Reports/ReportServices` | Usage metrics, quota utilization |
| `Reports/ReportPartners` | Partner sales, commissions, ranking |
| `Reports/ReportFinance` | Financial summary |
| `ServiceBooking/` | 3-tab: sell card / deduct quota / booking |
| `ServiceManagement/` | Service catalog editor (5 categories) |
| `TenantConfig/` | Feature flags (warehouse, membership, accommodation...) |

### Mock data (12 files under `src/mocks/community-hub/`)
accommodation, checkin, courses, dashboard, feedback, member-quota, membership-plans, navigation, partners, reports, service-catalog, services.

### TenantConfig toggles hiện có
`warehouse_enabled`, `warehouse_auto_deduct`, `einvoice_enabled`, `einvoice_auto_issue`, `einvoice_provider`, `membership_enabled`, `loyalty_enabled`, `multi_branch`, `shift_management`, `accommodation_enabled`.

**⚠️ Chưa có `vertical` / `industry` flag** — cần thêm khi rebrand.

---

## 3. GAP mapping chi tiết

### ✅ Tận dụng tốt (rename + đổi tone, ~60% reuse)

| Community Hub hiện tại | FitPro rebrand | Ghi chú |
|---|---|---|
| MembershipPlanSettings (Standard/Premium/VIP) | **FitPro Packages** (Cơ bản 2.4tr / Plus / Pro / VIP / Super VIP) | Giữ UI, đổi mock data + labels theo slide 9 |
| Checkin QR | **Check-in trạm liên thông** | Thêm cross-station card verification |
| QuickAddMember | Đăng ký khách mới vào phễu 90 ngày | Thêm field "gói 90 ngày" |
| Customer Care automation | Automation 90-day journey + nhắc gia hạn 15 ngày | HLD đã yêu cầu nhắc 15 ngày trước hết hạn |
| Feedback 5 sao | Đánh giá sau buổi tập | Trigger sau check-out |
| Partners (KOL/KOC/PO) | **Business Owners** (4 loại profile từ slide 5) | Thêm profile type chọn |
| Reports (Revenue/Members/Check-in/Services) | Giữ — đổi context sang fitness | KPI labels |
| ServiceBooking 3 tabs | Đặt slot 6h-9h sáng cho thảm tập | Giới hạn time window |
| ServiceManagement (5 categories) | Catalog buổi tập + combo dinh dưỡng | Rebuild categories |
| DashboardCH | Dashboard trạm (fitness KPIs) | Đổi cards |

### 🔄 Rework (semantic changes)

| Community Hub | Thay bằng | Lý do |
|---|---|---|
| **Accommodation** (phòng nam/nữ, lưu trú) | **Station Layout** (sơ đồ thảm 3-7 hoặc 5-20, trạng thái occupied/free) | FitPro không có lưu trú |
| **Courses** (PT lịch học) | **Training Programs** (giáo trình video chuẩn hóa) | Slide 6: "Tự động hóa giáo trình — dạy ngay cả khi 0 khách" |
| **Lễ tân** (cả ngày) | **Trạm FitPro 6-9h** | Khác giờ vận hành |
| **Kho & NVL** (full warehouse) | **Tắt toggle** (Herbalife hãng tự quản) | Chủ trạm không quản kho |
| **TenantConfig defaults** | Pre-set toggles phù hợp fitness | Thêm `vertical: 'fitpro'` flag |

### ❌ Thiếu mới — cần prototype (11 phân hệ)

| # | Phân hệ mới | Mục đích | Source | Ưu tiên |
|---|---|---|---|---|
| **F1** | **Network Tree 7×7×7** | Cây MLM 3 tầng: BO → trạm trực tiếp → vệ tinh → bùng nổ | Slide 11, docx §3 | ⭐⭐⭐ |
| **F2** | **Station Type (Home/Co-working)** | Config layout thảm, sức chứa, giờ mở | Slide 7 | ⭐⭐⭐ |
| **F3** | **90-day Journey Tracker** | Trải nghiệm 3 tháng: intake → baseline test → tập → re-test → outcome | Slide 8, docx §1 | ⭐⭐⭐ |
| **F4** | **Body Metrics Tracker + Medlatec** | Đo chỉ số sinh học, xét nghiệm máu | Slide 10, docx §C | ⭐⭐ |
| **F5** | **Cross-station Liên thông Card** | Thẻ dùng được ở 10.000 trạm | Docx §B | ⭐⭐⭐ |
| **F6** | **SOP Compliance Checker** | Giám sát chất lượng trạm con (chuẩn thương hiệu) | Docx §A | ⭐⭐ |
| **F7** | **Station Finder (nearest)** | Map/list tìm trạm gần nhất cho member | Docx §C | ⭐⭐ |
| **F8** | **Commission Cascade Dashboard** | View hoa hồng 5%/tầng (hãng trả, chỉ view) | Slide 2, docx §2 | ⭐⭐ |
| **F9** | **Marketing Funnel & Content** | Video giáo dục, bài viết, công cụ lan tỏa cho BO | Docx §D | ⭐⭐ |
| **F10** | **Tax Per Station** | Hộ kinh doanh khai thuế cho từng điểm | Docx §A | ⭐ |
| **F11** | **Triết lý MF7 Onboarding** | Giáo dục BO mới về 7×7×7, Master-Force-Free mindset | Slide 13 | ⭐ |

### 🎨 UX/UI rebranding

| Item | Community Hub | FitPro |
|---|---|---|
| Brand name | Community Hub | **FitPro** |
| Tagline | — | "Trạm sạc siêu xe con người MF7" |
| Primary color | (business blue) | **Teal #00c9a7** (sức khỏe) |
| Accent color | — | **Orange #ff8c42** (năng lượng) |
| Tone | Corporate | Energetic, health-focused, motivational |
| Hero / empty states | co-working imagery | fitness mats, shake bottles, 6am sunrise |
| Sidebar icons | generic | thảm tập, bình shake, tim pulse, tree |
| Logo | CH wordmark | **F7** mark |

---

## 4. Roadmap 3 Phase

| Phase | Scope | Effort | Cần user duyệt? |
|---|---|---|---|
| **Phase 1 — Rebrand core** | Brand text/color + menu labels + locale keys + TenantConfig defaults + sidebar item order + title | ~2h mechanical | No |
| **Phase 2 — Rework existing pages** | Accommodation → Station Layout, Courses → Training Programs, DashboardCH KPI relabel, Reception flow 6-9h, tắt Warehouse toggle, ServiceBooking time window | ~3-4h | No |
| **Phase 3 — Prototype 11 phân hệ mới** | F1–F11 với mock data, inline style, wire menu & routes, không gọi API thật | Lớn, ~8-10h | **YES — xin duyệt trước khi build BE** |

---

## 5. Phản hồi của user (2026-04-15)

> **"OK đi theo đề xuất qua toàn bộ các phần bạn phân tích"**

Xác nhận mặc định cho 6 câu hỏi:
1. ✅ Brand name: **FitPro** (không suffix)
2. ✅ Màu: **Teal #00c9a7 + Orange #ff8c42**
3. ✅ Logo: dùng **text mark "FitPro"** tạm, sau có thể thay
4. ✅ Accommodation: **xóa khỏi menu**, giữ code file (tắt toggle)
5. ✅ Courses → **Training Programs** (video library)
6. ✅ 11 phân hệ mới: build **tất cả** trong Phase 3, nhưng theo thứ tự ưu tiên ⭐⭐⭐ trước

---

## 6. Link tham chiếu

- [BACKEND_API_SPEC.md](../tnpm/BACKEND_API_SPEC.md) — kiến trúc microservice dùng chung cho mọi vertical. FitPro sẽ reuse hầu hết (customer, payment, notification, etc.) và mở rộng thêm các service đặc thù (network-tree, 90-day-journey, body-metrics).
- `src/components/tnpm/` — shared UI components sẽ được **tái sử dụng cho FitPro pages** (KpiCard, KpiRow, PageHeader, TabBar, ModalShell, StatusBadge, fmtMoney, daysUntil).
