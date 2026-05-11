# Requirements — FitPro (rút từ buổi họp 2026-05-06)

**Nguồn:** `Vincom Center 3.m4a` + `SUMMARY_fitpro.md`
**Phạm vi:** Chỉ phần FitPro (00:00 – 40:50). MentorHub là sản phẩm riêng, không cover ở đây.

---

## 0. Bối cảnh & ràng buộc nền

| Mã | Ràng buộc | Ý nghĩa thiết kế |
|---|---|---|
| C1 | Herbalife **không có public API** — hoa hồng đổ về 1 tài khoản cá nhân tổng | Phải có cơ chế import/đối soát thủ công + phân phối nội bộ |
| C2 | Reborn **chỉ làm phần mềm + cố vấn**; cơ sở vật chất do FitPro lo | Sản phẩm là SaaS, không quản tài sản vật lý |
| C3 | Pilot 1 điểm tại **Hải Phòng** (hoặc chi nhánh sẵn) trước khi nhân bản | Phải multi-tenant từ đầu |
| C4 | Văn hóa cộng đồng là **USP**, không phải tính năng phụ | Cadence (D/W/M/Q/Y) phải bake vào core, không bolt-on |
| C5 | Không trả lương cứng cho coach/leader → **ăn % theo khách** | Cần module commission tracking từ ngày 1 |
| C6 | Giai đoạn đầu **đóng** với hệ thống Sopline khác | Whitelist tenant, không federation |

---

## 1. Personas

| ID | Persona | Vai trò chính trong hệ thống |
|---|---|---|
| P1 | **Member (khách tập)** | Tập tại center hoặc tại nhà, xem lộ trình, nhận nhắc nhở |
| P2 | **Coach / Trainer** | Hướng dẫn buổi tập, ghi nhận chỉ số, chăm sóc pre/post-class |
| P3 | **Leader / BO (Business Owner)** | Mở center hoặc home, có downline, ăn % doanh thu nhánh |
| P4 | **Center Manager** | Vận hành 1 location: lịch, mat layout, doanh thu, KPI |
| P5 | **Admin hệ thống (FitPro HQ)** | Cấu hình gói, giá, quy trình; xem báo cáo toàn chuỗi |
| P6 | **CEO / HR doanh nghiệp B2B** | Mua bulk cho nhân viên, theo dõi sử dụng |
| P7 | **Đối tác Adorn / Lab** | Nhận lead VIP, trả kết quả xét nghiệm về |

---

## 2. Functional Requirements

### F1 — Phân cấp thành viên & cây giới thiệu (MLM)
- **F1.1** Mọi member phải **under 1 referrer** khi đăng ký. Không có signup "lẻ".
- **F1.2** Mỗi BO có 1 **link giới thiệu duy nhất**; ai click link → tự động gắn vào nhánh.
- **F1.3** Hiển thị **cây downline** dạng tree, nhìn được role, doanh thu, hoa hồng từng node.
- **F1.4** Quy tắc 7×7×7 (3 tier, mỗi tier max 7 con) đang là rule cứng — cần config được.
- **F1.5** Member có thể **ở nước ngoài** vẫn join được nhánh (cross-region, không bind theo center).

### F2 — Quản lý Center / Coup / Home
- **F2.1** 3 loại location entity:
  - **Home Fit**: 1 gia đình, không kinh doanh, miễn phí app
  - **Center**: 100–200m², có 6 gói, có doanh thu trực tiếp
  - **Coup**: 60–70m², vệ tinh quanh center chính, theo cụm vùng
- **F2.2** 2 cơ chế hợp tác center:
  - **Owned**: FitPro tự mở
  - **Handover**: bên thứ 3 mở, dùng công nghệ FitPro, trả phí dịch vụ
- **F2.3** Camera & dữ liệu vận hành ở mọi center phải **stream về central** (FitPro HQ giữ).
- **F2.4** Khi mở center mới: cấp đồng bộ **cơ sở vật chất chuẩn + branding + SOP + lô (logo) + phần mềm** (đóng gói franchise).

### F3 — Gói thành viên (6 tiers)
- **F3.1** 6 gói từ Cơ bản → Diamond. Hiện tại codebase có 5 (Cơ bản, Plus, Pro, VIP, Super VIP) → cần thêm Diamond hoặc map lại.
- **F3.2** Mỗi gói gồm: số buổi tập, số drink, supplement, exam, E-Gift, thời hạn (mặc định 90 ngày).
- **F3.3** Lifecycle: intake → đang dùng → sắp hết (D-7) → renewal / churn.
- **F3.4** Bán được tại: Center (POS), online (member self-service), B2B bulk (corporate).

### F4 — Lộ trình 90 ngày & ghi nhận tập luyện
- **F4.1** 5 phase chuẩn: **intake → baseline → execution → re-test → outcome**, tổng 90 ngày.
- **F4.2** Mỗi buổi tập ghi nhận: thời lượng, bài tập, calo, đánh giá coach.
- **F4.3** Kết nối **lab xét nghiệm (Medlatec)** — đặt lịch baseline + re-test, kết quả trả về app.
- **F4.4** Sau 90 ngày tự sinh **báo cáo outcome + đề xuất gia hạn**.
- **F4.5** App mobile cho member: xem buổi đã tập, chỉ số, lộ trình, nhắc nhở.

### F5 — 2 luồng doanh thu
- **F5.1 (Direct)** Mọi giao dịch tại center (gói tập, đồ uống, dịch vụ) → invoice trong `sales` microservice → đối soát trong `billing.cashbook`.
- **F5.2 (Indirect — Herbalife)**
  - Import hoa hồng Herbalife (file/manual) vào hệ thống dưới 1 tài khoản tổng.
  - **Phân phối tự động** xuống đúng người trong nhánh theo cây giới thiệu.
  - Báo cáo đối soát: tổng nhận được vs tổng đã phân phối.
- **F5.3** % chia hoa hồng cấu hình được theo tier / theo loại sản phẩm.

### F6 — Home Fit (gia đình)
- **F6.1** 1 BO tạo 1 Home Fit, mời người thân vào (kể cả khác địa lý).
- **F6.2** Đua streak / leaderboard nội bộ trong nhóm gia đình.
- **F6.3** Mỗi thành viên Home có app riêng nhưng đua chung trên cùng nhóm.

### F7 — Cộng đồng & case study
- **F7.1** Trang **case study public** (mạng xã hội nhỏ) chia sẻ câu chuyện thay đổi sức khỏe.
- **F7.2** Member có thể submit case của mình; coach/admin duyệt trước khi public.
- **F7.3** Embed video, ảnh trước-sau, chỉ số thay đổi.

### F8 — B2B / Doanh nghiệp
- **F8.1** Entity **Corporate Account**: company info, HR contact, ngân sách năm.
- **F8.2** **Bulk enrollment**: HR upload danh sách nhân viên → tạo member account hàng loạt → mỗi nhân viên là 1 gia đình con trong nhánh corporate.
- **F8.3** **Trial flow** cho CEO + gia đình: 3 ngày / 7 ngày miễn phí, sau đó nurture lên gói trả phí.
- **F8.4** Dashboard cho HR: số nhân viên đang dùng, tần suất tập, ngân sách còn lại.

### F9 — Cadence & gamification (Hằng ngày–Tuần–Tháng–Quý–Năm)
- **F9.1** Engine **scheduled events** theo nhịp văn hóa, áp tự động cho mỗi gia đình:
  - Hằng ngày: nhắc tập, gửi quote/đức ngắn
  - Hằng tuần: chia sẻ văn hóa gia đình (post + reminder)
  - Hằng tháng: học cùng nhau (link sang MentorHub?)
  - Hằng quý: trường dân (event off-line, hệ thống chỉ track đăng ký)
  - Hằng năm: trường lịch (du lịch — track booking)
- **F9.2** Streak counter, badge, leaderboard trong Home Fit + giữa các center.
- **F9.3** Notification engine: push, Zalo OA, email theo preference.

### F10 — Quy trình khách hàng VIP
- **F10.1** Sau onboarding, member đủ tiêu chí (mua gói VIP+) → **chuyển đối tác Adorn** xử lý 4-book / bác sĩ.
- **F10.2** Tracking lead trạng thái với Adorn (referred → contacted → closed).
- **F10.3** Kết nối lab Medlatec: gói xét nghiệm bán thêm cho VIP.

### F11 — Báo cáo & đo lường
- **F11.1** Dashboard HQ: GMV, member count, retention, NPS, doanh thu/center, hoa hồng đã phân phối.
- **F11.2** Per-center: doanh thu, lịch dày, KPI coach, churn member.
- **F11.3** Per-BO: downline tree health, hoa hồng nhận, doanh thu nhánh.
- **F11.4** Real-time: số mat đang sử dụng / center.

---

## 3. Non-Functional Requirements

| ID | Yêu cầu | Note |
|---|---|---|
| N1 | Multi-tenant từ ngày 1 | Mỗi vùng/franchise có thể là 1 tenant |
| N2 | Mobile-first cho member, web-first cho admin/coach | App member ưu tiên iOS+Android |
| N3 | Offline-friendly tại center (mạng yếu vẫn ghi check-in được) | Local cache + sync |
| N4 | Audit log cho mọi giao dịch tài chính | Compliance + đối soát |
| N5 | Vietnamese i18n + sẵn sàng English (cho member nước ngoài) | F1.5 cross-region |
| N6 | SSO Azure AD cho admin nội bộ; OTP/Zalo cho member | Hiện đã có MSAL |
| N7 | Tích hợp Zalo OA gửi thông báo (vượt rào Zalo cá nhân) | Reuse từ MentorHub |

---

## 4. Mô hình giá / dòng tiền

```
Doanh thu vào HQ:
├─ Phí setup center (1 lần, khi mở)
├─ Phí dịch vụ phần mềm (cố định/tháng/center)
├─ % doanh thu center (variable)
├─ Bán gói tập trực tiếp (POS)
├─ B2B contract (corporate)
└─ Hoa hồng Herbalife (passthrough — phân phối lại)

Chi từ HQ:
├─ Hoa hồng cho BO theo tier
├─ Lương HQ (Reborn + ops)
├─ Cost vận hành công nghệ
└─ Marketing / event cộng đồng
```

---

## 5. Out of scope (đã chốt là KHÔNG làm)

- ❌ Quản lý dòng tiền của Herbalife (chỉ ghi nhận + phân phối phần đã chảy về tài khoản FitPro).
- ❌ Federation với Sopline khác (giai đoạn đầu).
- ❌ Tài sản vật lý (camera hardware, biển hiệu, equipment) — FitPro lo.
- ❌ Build phần mềm cho Herbalife / không thay thế hệ thống Herbalife.

---

## 6. Open issues cần FitPro confirm trước khi build

1. **Tên 6 gói chính thức** + giá + quyền lợi chi tiết (hiện codebase chỉ có 5).
2. **Công thức tính "tên khu"** (chỉ số đóng góp BO) để chia % công bằng.
3. **Quy tắc 7×7×7** có cố định hay config theo tenant?
4. **Format file hoa hồng Herbalife** import (CSV/Excel?) + tần suất.
5. **Luật phân phối hoa hồng**: chia đều, theo % cố định, hay theo công thức bậc thang?
6. **Trial B2B**: 3 hay 7 ngày? Có conversion goal cụ thể không?
7. **Lab Medlatec** đã có hợp đồng API chưa, hay cần ký mới?
8. **Branding chuẩn**: bộ assets (logo, mockup) đã có chưa để gắn vào franchise kit?
