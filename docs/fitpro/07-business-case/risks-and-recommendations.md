# 07.3 — Rủi ro & Khuyến nghị

> 7 rủi ro chính + 5 khuyến nghị BoD + 5 khuyến nghị Reborn JSC.

---

## 7.11. 7 Rủi ro chính

| # | Rủi ro | Mức độ | Khuyến nghị giảm thiểu |
|---:|---|:---:|---|
| 1 | **Pháp lý đa cấp** — Luồng 2 HBL bị soi xét vì có App công nghệ chồng lên | 🔴 Cao | Văn bản hóa cực rõ: App TUYỆT ĐỐI không can thiệp ví HBL, không thu hộ, không hiển thị hoa hồng. Có ý kiến tư vấn pháp lý độc lập trước launch |
| 2 | **Phụ thuộc HBL** — HBL thay chính sách commission / cắt tuyến → mất luồng 2 | 🔴 Cao | Đa dạng hóa nguồn dinh dưỡng dự phòng (chỉ kích hoạt khi cần); xây thương hiệu "F1 Sport" của FitPro song song để có quyền mặc cả |
| 3 | **Mâu thuẫn lợi ích Coach vs Center** — Coach giữ 80k/buổi nhưng Center chịu OpEx mặt bằng → Center owner có thể lỗ vận hành thuần | 🟡 Trung | Tinh chỉnh cơ chế chia phí mặt bằng/sản phẩm; đảm bảo Center owner sống chính bằng gói 30/60/90 + HBL chứ không phải buổi check-in. Xem [margin-and-valuation §6.13](../06-cost-estimate/margin-and-valuation.md) |
| 4 | **Tốc độ nhân bản SOP** — 500 Center trong 18 tháng là quá nhanh nếu SOP chưa chín | 🟡 Trung | T6–T9/2026 phải đạt Center lõi Hà Nội "as templated" 100% trước khi nhân bản; có Quality Audit từ HQ định kỳ |
| 5 | **App lỗi tại điểm chạm thanh toán** → mất uy tín thương hiệu | 🟡 Trung | Test E2E nghiêm túc; có fallback offline cho POS Coach |
| 6 | **Đứt gãy "tần số năng lượng"** — KPI doanh số len lỏi vào → quay về Force | 🟢 Thấp | Mr. Thắng & Mr. Linh là người gác cửa văn hóa — không can thiệp sự vụ nhưng có quyền veto truyền thông |
| 7 | **Saturation Bắc-Trung-Nam quá sớm** trước khi phủ tỉnh lẻ | 🟢 Thấp | Sau Q4/2026 ưu tiên tỉnh lẻ thay vì nhồi thêm Center tại HN/HCM |

---

## 7.12. 5 Khuyến nghị chiến lược cho BoD

### KN1 — Lock-in phí SaaS sớm với hợp đồng 5 năm
- Đề xuất: **5 triệu/Center/tháng + 200k/Home/tháng** trong hợp đồng nhượng quyền 5 năm.
- Mục đích: Bảo vệ định giá Tech ngay từ ngày 1, không cho cạnh tranh ép giá xuống.
- Kết quả: ARR predictable → bội số định giá cao.

### KN2 — Tạo "Founding 7" cho từng Center
- Bán trước slot Co-Founder (7 người/Center) với giá ưu đãi khi mở Center mới.
- Mục đích: Vừa huy động vốn nhân lực, vừa cam kết tinh thần.
- Kết quả: Mỗi Center mở ra đã có 7 người sống chết với nó → giảm rủi ro thất bại Center.

### KN3 — Xây Brand House FitPro F1 / Trà NRG độc lập
- Phát triển thương hiệu sản phẩm dinh dưỡng riêng của FitPro song song với HBL.
- Mục đích: Tạo đòn bẩy mặc cả với HBL về dài hạn.
- Kết quả: Nếu HBL thay chính sách commission, FitPro vẫn có brand backup.

### KN4 — Triển khai Medlatec sớm trong VIP/SVIP
- Biến chỉ số xét nghiệm thành "câu chuyện trước-sau" gây sốc.
- Mục đích: Chất liệu PR mạnh nhất — KH "trước: cholesterol 5,8 / sau: 4,2" hiệu quả hơn 1000 quảng cáo.
- Kết quả: Tăng conversion tier cao + viral marketing tự nhiên.

### KN5 — Pre-launch Mã A007 & N007 trước Kickoff T5/2026
- Để khi launch, App có data thật sẵn (avoid cold-start UX trống rỗng).
- Mục đích: Mã A007 = anh chủ Mr. Dũng A; N007 = Nhà đầu tiên của 7 Co-Founder gốc.
- Kết quả: Day-1 đã có Genealogy đẹp + cảm giác legacy có chiều sâu lịch sử.

---

## 7.13. 5 Khuyến nghị cho team công nghệ Reborn JSC

### KN-Tech1 — Ưu tiên Big Data Lifecycle ngay từ MVP
Đây là tài sản phi tuyến tính, không thể bù sau. Mọi event KH phát sinh phải được capture từ ngày 1, kể cả khi UI chưa hiển thị.

### KN-Tech2 — Tách rõ tenant model 3 cấp
- **FitPro Platform** (super-admin / HQ)
- **Center / Inside** (tenant)
- **Home** (sub-tenant)
- **Coach + Elite + Co-Founder** (user roles)

Schema cần chịu được **500 tenant + 10k sub-tenant** từ ngày đầu.

### KN-Tech3 — Genealogy Tree prototype sớm Q3/2026
Đây là tính năng phức tạp nhất:
- Mã A bất biến trọn đời.
- Mã N auto-mint logic phải bulletproof (không thể mint sai → tranh chấp chính trị).
- Cây 3 tier × 7 = 343 node — UI lazy-load.

Đừng để đến Phase 3 mới build — sẽ bị áp lực delivery.

### KN-Tech4 — Gamification engine không phải feature phụ
Đầu tư **tương đương 30% effort** vì là động cơ retention chính:
- Streak engine + nhắc nhở.
- Bảng vàng tự động cập nhật.
- Leaderboard multi-level (cá nhân / Nhà / Center / toàn quốc).

### KN-Tech5 — Chốt protocol hardware integration trước Center thứ 2
- NFC "Bíp" check-in.
- InBody scale ingest.
- VO2max device API.
- Medlatec Lab API.

Trước khi mở Center thứ 2, **chốt 1 protocol/API** chuẩn để tất cả Center sau đều dùng cùng. Đừng custom cho từng Center.

---

## 7.14. Tiến trình duyệt và launch

| Bước | Người duyệt | Trước khi… |
|---|---|---|
| 1. Duyệt 9 Open Decisions | BoD | Bắt đầu Phase 0 |
| 2. Duyệt 2 microservice mới (`nutrition`, `analytics`) | BoD + Reborn CTO | Bắt đầu Phase 1 |
| 3. Duyệt App mobile strategy (D1) | BoD | Bắt đầu Phase 1.7 |
| 4. Duyệt hợp đồng đối tác (Medlatec, Adorn) | BoD + Legal | Bắt đầu Phase 4 |
| 5. Duyệt branding final (logo, color, tagline) | BoD + Marketing | Phase 1 rebrand |
| 6. Duyệt pre-launch Mã A007/N007 + nhân vật khởi thủy | BoD | T5/2026 Kickoff |
| 7. Duyệt SOP Center mẫu Hà Nội | BoD | T6/2026 C007 |
| 8. Duyệt go-live multi-region | BoD | T10/2026 |

---

## 7.15. Câu hỏi quan trọng nhất BoD phải trả lời

> **"Trong 18 tháng tới, mọi quyết định kỹ thuật và kinh doanh sẽ được test bằng câu hỏi duy nhất: 'Hành động này có tăng tài sản công nghệ (Big Data + Genealogy + ARR) hay không?' Nếu không, từ chối — kể cả khi nó có vẻ tăng doanh thu trước mắt."**

Nếu BoD đồng ý với mệnh đề này, thì Vision 2027 sẽ thực thi được.
Nếu không, mô hình sẽ trượt về "nhóm dinh dưỡng có App" — định giá Retail, mất 5–7 lần bội số.
