# Tóm tắt — Phần FitPro

**Nguồn:** `Vincom Center 3.m4a` — đoạn `00:00:00 → ~00:40:50`
**Người tham gia:** Anh chủ hệ thống FitPro/FitClub (Herbalife) + Dũng (Reborn, công nghệ) + một số thành viên khác.

---

## 1. Bối cảnh & định vị sản phẩm

- **FitPro / FitClub** là hệ thống chuỗi trung tâm sức khỏe — đang chạy thực tế nhưng **chưa có công nghệ chuẩn hóa**, mỗi chỗ làm một kiểu, chất lượng không đồng đều.
- Reborn vào với vai trò **làm công nghệ + cố vấn vận hành**. Định vị Reborn = "công ty công nghệ + soft", phần cứng/cơ sở vật chất do bên anh tự lo.
- Ưu điểm cạnh tranh khi có công nghệ: **chuẩn hóa quy trình**, **đóng gói nhân bản**, có "chiến lý" giữ chân khách hàng — kể cả Herbalife rút thì khách vẫn ở lại.

## 2. Cấu trúc 3 lớp mô hình

| Lớp | Mô tả | Cách thu tiền |
|---|---|---|
| **Home Fit** | Đơn vị nhỏ nhất = 1 gia đình tập tại nhà, mời người thân (cả ở nước ngoài) vào nhóm vận động chung qua app. Mỗi người 1 link giới thiệu, mọi thành viên phải under 1 người giới thiệu | App cấp miễn phí (ban đầu); thu gián tiếp qua doanh thu Herbalife khi họ mua sản phẩm |
| **Center / FitClub** | Trung tâm tập luyện thực tế, ~100–200m². Có 6 gói từ cơ bản → diamond. Khách đến tập 80k/lần | (a) Phí dịch vụ công nghệ cố định/tháng cho center handover; (b) % doanh thu phát sinh; (c) phí setup |
| **Coup (vệ tinh)** | Center nhỏ ~60–70m² mở quanh center chính, theo cụm vùng (Hải Dương → Hưng Yên → Hải Phòng…) | Tương tự center, dạng franchise nhẹ |

## 3. Hai luồng tiền

1. **Luồng 1 — Trực tiếp từ hệ thống FitPro:** phí buổi tập, phí dịch vụ công nghệ, sản phẩm ngoài Herbalife.
2. **Luồng 2 — Gián tiếp từ Herbalife:** Khi khách mua sản phẩm Herbalife, hoa hồng (~7,3%) chảy về **một tài khoản cá nhân duy nhất** (Herbalife không có API). Cần cơ chế trong hệ thống FitPro để **ghi nhận → phân phối** lại cho đúng người trong nhánh.

## 4. Quy trình khách hàng

- Khách vào với **ID FitPro trước** (chưa cần Herbalife).
- Khi khách phát sinh nhu cầu mở **Home Fit ở nhà** → mới cấp ID Herbalife under người giới thiệu của họ.
- Onboarding chuẩn: kiểm tra sức khỏe → xét nghiệm → nhóm tương tác → **lộ trình 90 ngày chuyển hóa** → upsell gói VIP có 4-book/bác sĩ.
- VIP/cao cấp được giao về team Adorn (đối tác) phụ trách.

## 5. Văn hóa & tần suất hoạt động

> Nhịp **hằng ngày – hằng tuần – hằng tháng – hằng quý – hằng năm** áp vào từng gia đình:
> - Hằng ngày: chia sẻ đức / vận động
> - Hằng tuần: đào tạo, sinh hoạt văn hóa gia đình
> - Hằng tháng: học cùng nhau (hao tinh)
> - Hằng quý: trường dân (đi xa cùng nhau)
> - Hằng năm: trường lịch (du lịch cùng nhau)

→ Đây là **văn hóa cốt lõi** cần bake vào sản phẩm, là khác biệt so với gym/club thông thường.

## 6. Tệp khách hàng B2B mở rộng

- **Khỏe để làm việc** — vào doanh nghiệp, CEO. Thay vì ngân sách du lịch/teambuilding, công ty mua gói FitPro cho nhân viên (mỗi nhân viên = một gia đình).
- 3 ngày / 7 ngày free trial cho CEO + gia đình họ.
- Cộng đồng "Hồ Phát" có **hàng nghìn chuyên gia/CEO** sẵn để tiếp cận.

## 7. Yêu cầu công nghệ Dũng cần làm

1. **App ghi nhận tập luyện:** thời lượng, bài tập, đánh giá, lộ trình kỳ.
2. **Quản trị thành viên đa cấp:** cây giới thiệu (luôn under), nhìn được toàn bộ chỉ số.
3. **Cơ chế tracking & phân phối doanh thu Herbalife** (luồng 2).
4. **Quản lý center / coup / handover:** thu phí cố định, theo doanh thu, theo CCV.
5. **Đóng gói SOP**: bộ chuẩn quy trình + cơ sở vật chất + branding để bất kỳ ai mở center mới chỉ việc copy.
6. **Lộ trình chăm sóc 90 ngày + nhắc nhở định kỳ + kết nối lab xét nghiệm**.
7. **Trang cộng đồng / mạng xã hội nhỏ:** chia sẻ case study, lan toả chuyện thực tế.

## 8. Roadmap đã chốt sơ bộ

1. Anh (chủ FitPro) **chốt nghiệp vụ end-to-end** + ước lượng doanh thu/luồng tiền/tài sản số.
2. Dũng nhận → **mapping sang công nghệ** → ốp ra final list.
3. Đầu tháng tới: triển khai một **điểm pilot** (Hải Phòng / chi nhánh sẵn).
4. Mô hình hợp tác: Reborn lo phần mềm + chiến lược, FitPro lo cơ sở vật chất + cộng đồng. **Không lương cứng** cho coach/leader → họ ăn % theo khách hàng (giảm áp lực skill out).

## 9. Open issues / cần làm rõ

- Cách đo "tên khu" (chỉ số đóng góp cá nhân) để chia % công bằng.
- Có nên cho **hệ thống Sopline khác** vào không? → Giai đoạn đầu **đóng**, chỉ mở khi mô hình đã chứng minh.
- Camera/dữ liệu vận hành ở center coup phải lấy về central (cây của mình giữ).
