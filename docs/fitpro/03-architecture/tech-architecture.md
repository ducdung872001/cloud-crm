# 03.2 — Kiến trúc công nghệ

> Stack, module xương sống, điểm chạm công nghệ trong hành trình E2E.

---

## 3.6. Stack tổng thể

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend Web** | React 18 + TypeScript + Vite, React Router 7, Context API, AgGrid, Highcharts | Reuse `cloud-crm` base (community-hub variant) |
| **Frontend Mobile** | PWA hoặc React Native / Flutter | Quyết định lớn — xem [open-decisions](../05-current-state/open-decisions.md) D1 |
| **Auth** | MSAL (Azure AD) cho admin · OTP/Zalo cho member | Multi-tenant whitelist giai đoạn đầu |
| **Backend microservices** | 12 microservices (xem [microservices-mapping.md](microservices-mapping.md)) | Đa số dùng chung với các vertical khác (banking/retail/mentorhub) |
| **BPM engine** | `bpm-core` (nhánh `cloud`) | Cho onboarding workflow, duyệt nhượng quyền, intake 90 ngày |
| **Cloud** | Multi-tenant, mỗi Center = 1 tenant, mỗi Home = sub-tenant | Schema cần chịu 500 tenant + 10k sub-tenant |
| **Hardware integration** | Cân InBody, NFC "Bíp" check-in, máy đo VO2max, Medlatec Lab API | Via API hoặc CSV ingest |

---

## 3.7. 4 Module xương sống

### 3.7.1. Identity & Genealogy
Mã định danh trọn đời + cây bảo trợ tự động:

| Mã | Mục đích | Auto-mint |
|---|---|:---:|
| A007 | Mã cá nhân (Affiliate, giữ trọn đời) | Tạo khi signup |
| N007 | Mã "Nhà" | Khi 1 Elite có 7 Elite dọc F1-F7 |
| H/I/C007 | Mã không gian | Tạo khi mở Home/Inside/Center |

**Vai trò công nghệ**:
- Là **trọng tài khách quan** thay thế Excel + niềm tin → triệt tiêu 70% xung đột chính trị MLM.
- Affiliate deep-link tracking — Mã A là khóa join cho mọi attribution.
- Genealogy Tree clickable: hiển thị doanh thu, hoa hồng, level từng node.

### 3.7.2. Big Data Lifecycle
Capture mọi chỉ số → tài sản phi tuyến tính của Platform:

| Dữ liệu thu thập | Hành động kinh doanh |
|---|---|
| Chỉ số Before (cân, mỡ, VO2max, ngủ, stress) | Cá nhân hóa lộ trình → tăng conversion CHẠM → NHẬP |
| Streak hằng ngày | Trigger nhắc ca, mừng cột mốc, khuyến mãi recover |
| Ảnh trước/sau | Asset PR tự nhiên → giảm CAC marketing 30–50% |
| Tier mix (BASIC → SVIP) | Predictive upsell khi behavior chạm ngưỡng |
| Genealogy F1–F7 | Đo "độ chín" để cấp Mã N007 (tiêu chí khách quan) |
| Cross-center booking | Mở thị trường "gửi khách vạn dặm" |

→ Không có Big Data, mọi quyết định bằng cảm tính — chính là cách "nhóm dinh dưỡng" cũ vận hành.

### 3.7.3. Gamification Engine
Chuyển động cơ giữ chân từ "tiền bạc" sang "tâm lý":

- **Streak gãy = mất danh dự** (sĩ diện, không phải tiền) — cơ chế Duolingo, benchmark retention 30 ngày ~50%.
- **Bảng vàng Danh vọng** tự động: VIP lột xác xuất sắc, Elite/Coach thăng cấp, "Nhà" nhân bản nhanh, Co-Founder kiến tạo nhiều Center.
- **Leaderboard giữa các "Nhà"** — đẩy cạnh tranh ra cấp cộng đồng, retention thành responsibility tập thể.

→ Khác biệt 10× so với "nhóm dinh dưỡng" cũ (dựa vào áp lực doanh số + tình cảm cá nhân).

### 3.7.4. SaaS Billing & Franchise Console
Thu duy nhất 2 khoản — không bao giờ chạm các luồng tiền khác:

| Dòng thu | Đối tượng | Đặc tính |
|---|---|---|
| Phí nhượng quyền (one-time) | Chủ Center / Inside / Home khi mở mới | Setup fee, có hợp đồng nhượng quyền 5 năm |
| Phí SaaS recurring (hàng tháng) | Tất cả không gian đã mở | ARR ổn định — mở khóa định giá Tech |

---

## 3.8. Điểm chạm công nghệ trong hành trình E2E

| # | Chặng KH | Điểm chạm vật lý | Module công nghệ |
|---:|---|---|---|
| 1 | Discover | — | **Affiliate Tracking** (Mã A007 deep-link) |
| 2 | Reach Out | — | **Onboarding Funnel** + geo-locate Center gần nhất |
| 3 | First Touch | Center (C007) | **POS Module** (Coach nhận tiền trực tiếp) + **Identity (Mã A)** |
| 4 | Baseline | Center | **Body Index Capture** + Big Data ingest |
| 5 | Commit 90D | Center | **Package Sales** + **Contactless Check-in** (NFC/QR) |
| 6 | Transform | Center / Home | **Gamification Engine** + **Lesson Library** + **Coach Chat** |
| 7 | Aftermath | Center | **Before-After Comparison** + **Hall of Fame** + **Photo Vault** |
| 8 | Open HBL ID | Center | **HBL ID Link** (chỉ đọc cấu trúc tuyến để hiển thị "Nhà") |
| 9 | Bring Home | Home (H007) | **Family Account** + **Home Setup Workflow** + **Multi-profile** |
| 10 | Coach | Center | **Coach Scheduling** + **SOP Knowledge Base** + **Coach Earnings Dashboard** |
| 11 | Build Nhà | — | **Genealogy Tree** + **Auto-mint N007 logic** |
| 12 | Co-Founder | Center | **Center Operations BMS** + **Co-Founder Console** |

---

## 3.9. Nguyên tắc thép về App FitPro

> **App FitPro KHÔNG QUẢN LÝ:**
> - Tiền 80k check-in (Coach giữ trực tiếp).
> - Tiền gói tập 30/60/90 ngày (Coach/Elite giữ trực tiếp).
> - Tiền Setup vật chất (đối tác thầu giữ).
> - **Toàn bộ luồng tiền HBL 37% commission** (chảy thẳng vào tài khoản cá nhân NPP).
>
> **App FitPro CHỈ QUẢN LÝ:**
> - Phí nhượng quyền + Phí SaaS hàng tháng (FitPro Platform thu).
> - Phí 80k/buổi mà Coach sở tại được chia khi nhận khách "gửi vạn dặm" (Inter-Coach payout).

→ Đây vừa là **rào pháp lý** (tránh trung gian thanh toán đa cấp), vừa là **rào định vị** (App = SaaS thuần, không phải fintech).
