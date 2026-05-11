# 02.4 — Functional Scope (11 phân hệ)

> 11 phân hệ chức năng (F1–F11) — tổng hợp từ Requirements 06/05/2026 + slide PPTX gốc.

---

## F1 — Phân cấp thành viên & cây giới thiệu (MLM 7×7×7)

| ID | Yêu cầu | Ghi chú |
|---|---|---|
| F1.1 | Mọi member phải **under 1 referrer** khi đăng ký. Không có signup "lẻ" | Bắt buộc |
| F1.2 | Mỗi BO có **link giới thiệu duy nhất**; click link → tự gắn vào nhánh | Affiliate Mã A007 |
| F1.3 | Hiển thị **cây downline** dạng tree: role, doanh thu, hoa hồng từng node | UI lazy-load lớn |
| F1.4 | Quy tắc **7×7×7** (3 tier, max 7 con/tier) — cần config được theo tenant | Đẩy vào TenantConfig |
| F1.5 | Member **ở nước ngoài** vẫn join được nhánh (cross-region, không bind center) | Entity không bind location |

→ **Mã N007** auto-mint khi 1 Elite có đủ 7 Elite F1–F7 liền nhau.

---

## F2 — Quản lý Center / Inside / Home

| ID | Yêu cầu |
|---|---|
| F2.1 | 3 loại location entity: **Home (H007)** / **Inside (I007)** / **Center (C007)** |
| F2.2 | 2 cơ chế hợp tác Center: **Owned** (FitPro tự mở) / **Handover** (bên thứ 3 dùng công nghệ FitPro, trả phí dịch vụ) |
| F2.3 | Camera & dữ liệu vận hành stream về central (FitPro HQ giữ) |
| F2.4 | Wizard "Open new center" — đóng gói franchise kit (SOP + branding + lô + phần mềm) |

---

## F3 — Catalog gói sản phẩm (5 tier)

| ID | Yêu cầu |
|---|---|
| F3.1 | **5 tier** chính: BASIC / PLUS / PRO / VIP / SUPER VIP (chi tiết tại [03-architecture/business-model.md](../03-architecture/business-model.md)) |
| F3.2 | Mỗi tier gồm: giá/buổi, sản phẩm HBL kèm theo, công dụng nổi bật, quyền lợi đặc biệt |
| F3.3 | Lifecycle: intake → đang dùng → sắp hết (D-7, D-15) → renewal / churn |
| F3.4 | Bán đa kênh: Center (POS), online (member self-service), B2B bulk (corporate) |

> **Note**: Yêu cầu meeting 06/05 nêu 6 tier (thêm Diamond) nhưng bảng giá chiến lược 11/05 chốt 5 tier. Cần BOD xác nhận — xem [05-current-state/open-decisions.md](../05-current-state/open-decisions.md) D3.

---

## F4 — Lộ trình 90 ngày & ghi nhận tập luyện

| ID | Yêu cầu |
|---|---|
| F4.1 | 5 phase chuẩn: **intake → baseline → execution → re-test → outcome** (90 ngày) |
| F4.2 | Mỗi buổi tập ghi nhận: thời lượng, bài tập, calo, đánh giá Coach |
| F4.3 | Kết nối **Medlatec** — đặt lịch baseline + re-test, kết quả trả về app |
| F4.4 | Auto-sinh **báo cáo outcome + đề xuất gia hạn** vào D85 |
| F4.5 | **App mobile cho member** — quyết định lớn: build native (RN/Flutter ~1 tháng) hay PWA (~1 tuần)? → [open-decisions](../05-current-state/open-decisions.md) D1 |

---

## F5 — 2 luồng doanh thu

| ID | Yêu cầu |
|---|---|
| **F5.1** | **Luồng 1 (Direct)** — Mọi giao dịch tại Center → invoice trong `sales` microservice → đối soát trong `billing.cashbook` |
| **F5.2a** | **Luồng 2 (HBL)** — Import hoa hồng HBL (file CSV/Excel) vào hệ thống dưới 1 tài khoản tổng |
| **F5.2b** | **Auto-distribute** xuống đúng người trong nhánh theo cây giới thiệu — engine + audit log |
| **F5.2c** | Báo cáo đối soát: tổng nhận vs tổng phân phối, cảnh báo lệch |
| **F5.3** | Cấu hình % chia hoa hồng theo tier / theo loại sản phẩm |

> Chi tiết Dual Cash-Flow → [03-architecture/business-model.md](../03-architecture/business-model.md).

---

## F6 — Home Fit (gia đình)

| ID | Yêu cầu |
|---|---|
| F6.1 | 1 BO tạo 1 Home, mời người thân vào (kể cả khác địa lý) |
| F6.2 | Đua **streak / leaderboard** nội bộ trong nhóm gia đình |
| F6.3 | Mỗi thành viên Home có app riêng nhưng đua chung trên cùng nhóm |

---

## F7 — Cộng đồng & case study

| ID | Yêu cầu |
|---|---|
| F7.1 | Trang **case study public** (mạng xã hội nhỏ) chia sẻ câu chuyện lột xác |
| F7.2 | Member submit case → coach/admin duyệt (reuse BPM microservice) |
| F7.3 | Embed video, ảnh trước-sau, chỉ số thay đổi |

---

## F8 — B2B / Doanh nghiệp

| ID | Yêu cầu |
|---|---|
| F8.1 | Entity **Corporate Account**: company info, HR contact, ngân sách năm |
| F8.2 | **Bulk enrollment**: HR upload Excel danh sách → tạo member hàng loạt → mỗi nhân viên = 1 gia đình con |
| F8.3 | **Trial flow** 3 ngày / 7 ngày miễn phí cho CEO + gia đình; auto-convert/expire |
| F8.4 | Dashboard HR: nhân viên đang dùng, tần suất tập, ngân sách còn |

---

## F9 — Cadence & Gamification (nhịp văn hóa)

| ID | Yêu cầu | Cadence |
|---|---|---|
| F9.1a | Daily — nhắc tập, gửi quote/đức ngắn | Hằng ngày |
| F9.1b | Weekly — chia sẻ văn hóa gia đình | Hằng tuần |
| F9.1c | Monthly — học cùng nhau (link MentorHub nếu tích hợp) | Hằng tháng |
| F9.1d | Quarterly — trường dân (event offline) | Hằng quý |
| F9.1e | Yearly — trường lịch (du lịch chung) | Hằng năm |
| F9.2 | **Streak** counter + **Badge** + **Leaderboard** trong Home Fit + giữa các Center |
| F9.3 | **Notification engine**: push, Zalo OA, email theo preference |

---

## F10 — VIP / Adorn / Lab

| ID | Yêu cầu |
|---|---|
| F10.1 | Sau onboarding, member đủ tiêu chí gói VIP+ → chuyển Adorn xử lý 4-book / bác sĩ |
| F10.2 | Track lead trạng thái với Adorn (referred → contacted → closed) |
| F10.3 | Kết nối Medlatec: bán gói xét nghiệm thêm cho VIP |

---

## F11 — Báo cáo & đo lường

| ID | Yêu cầu |
|---|---|
| F11.1 | **Dashboard HQ**: GMV, member count, retention, NPS, doanh thu/Center, hoa hồng đã phân phối |
| F11.2 | **Per-Center**: doanh thu, lịch dày, KPI Coach, churn member |
| F11.3 | **Per-BO**: cây downline health, hoa hồng nhận, doanh thu nhánh |
| F11.4 | **Real-time**: số mat đang sử dụng / Center |

---

## Yêu cầu phi chức năng (NFR)

| ID | Yêu cầu | Ghi chú |
|---|---|---|
| N1 | Multi-tenant từ ngày 1 | Mỗi vùng/franchise có thể là 1 tenant |
| N2 | Mobile-first cho member, web-first cho admin/coach | iOS+Android |
| N3 | Offline-friendly tại Center (mạng yếu vẫn ghi check-in) | Local cache + sync |
| N4 | Audit log mọi giao dịch tài chính | Compliance + đối soát |
| N5 | Vietnamese i18n + sẵn sàng English (cho member nước ngoài) | F1.5 cross-region |
| N6 | SSO Azure AD cho admin nội bộ; OTP/Zalo cho member | Đã có MSAL |
| N7 | Tích hợp Zalo OA gửi thông báo | Reuse từ MentorHub |
