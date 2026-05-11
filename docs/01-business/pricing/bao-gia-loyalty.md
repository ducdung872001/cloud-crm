# BÁO GIÁ GIẢI PHÁP: Nền tảng Loyalty cho Chuỗi Siêu thị Bán lẻ

**Phiên bản:** 1.1 (pre-survey — đã áp dụng ưu đãi cạnh tranh, giảm 20% so với bảng giá chuẩn)
**Ngày:** 23/04/2026
**Khách hàng:** Chuỗi siêu thị bán lẻ 2 brand (~300 store, 3M KHTV)
**Đơn vị báo giá:** Reborn JSC — ceo@reborn.vn
**Hiệu lực:** 30 ngày kể từ ngày phát hành

> **Lưu ý sử dụng:** Báo giá này được lập trước khi quý khách gửi phiếu khảo sát chi tiết. Các con số dưới đây là **khung tham chiếu cho 3 gói chuẩn** + **các mô-đun tuỳ chọn**. Sau khi quý khách trả lời phiếu khảo sát, Reborn sẽ gửi **báo giá cá nhân hoá** dựa trên phạm vi thực tế. Mức giá thị trường đối chiếu dưới đây lấy từ các dự án loyalty bán lẻ quy mô 3 triệu KHTV + 300 cửa hàng trên thị trường Việt Nam và khu vực.

---

## 1. TÓM TẮT 3 GÓI CHUẨN

| Gói | Phù hợp khi | Phạm vi | Giá tham chiếu (VND) |
|-----|-------------|---------|----------------------|
| **STARTER** — Loyalty Core | Ngân sách < 1 tỷ, triển khai nhanh 3–4 tháng, 1 brand thí điểm trước | Hội viên + Tích điểm + Hạng + Đổi thưởng + API POS cho 1 brand (~150 store) | **712.000.000** (trọn gói năm 1) |
| **STANDARD** — Loyalty + Migration | Ngân sách 1.2–2 tỷ, triển khai 6 tháng, cả 2 brand, migration đủ 4 hệ thống cũ (Goldmem/Access/Excel/Supporter) | Tất cả STARTER + Migration đầy đủ + Cross-brand + Dashboard nâng cao + Training + SLA 99.5% | **1.512.000.000** (trọn gói năm 1) |
| **PREMIUM** — Loyalty + Marketing Auto | Ngân sách 2.4–4 tỷ, muốn thay thế agency marketing, sẵn sàng scale 1.500 store | Tất cả STANDARD + Marketing Automation (Email/SMS/Zalo OA/Push) + RFM/CLV/Churn ML + CSKH module + PoC 4 tuần | **2.392.000.000** (trọn gói năm 1) |

**Giá trên đã bao gồm**: Phần mềm + Triển khai + Migration + Đào tạo + Bảo hành 6 tháng. **Chưa bao gồm VAT 10%** và **chi phí hạ tầng** (nếu on-prem thì khách tự đầu tư server; nếu cloud thì Reborn tính riêng theo gói).

---

## 2. CHI TIẾT TỪNG GÓI

### 2.1. GÓI STARTER — 712 triệu VND

**Phạm vi bao phủ:**
- Triển khai cho **1 brand pilot** trước (chọn brand có data sạch nhất, ~150 store)
- Nền tảng Loyalty core: Hội viên, Tích điểm, Hạng, Hạn điểm, Đổi thưởng
- Import data KHTV từ 1 hệ thống cũ (Goldmem **hoặc** Access)
- API tích hợp POS qua `autoEarn` / `consumePoint`
- Admin dashboard cơ bản + API docs
- 1 webhook channel
- Cloud hosting do Reborn cung cấp (1 năm đầu miễn phí, năm 2 tính riêng 144tr/năm)
- Đào tạo 1 buổi: admin (10 người)
- SLA: 99.0% uptime, hỗ trợ 8×5

**Chi phí chi tiết:**

| Hạng mục | VND |
|---------|-----|
| License phần mềm (1 năm) | 224.000.000 |
| Triển khai & Cấu hình | 208.000.000 |
| Migration 1 hệ thống cũ (Goldmem HOẶC Access) | 112.000.000 |
| Tích hợp POS 1 brand (~150 store) | 104.000.000 |
| Đào tạo admin (1 buổi) | 24.000.000 |
| Bảo hành 6 tháng + hỗ trợ 8×5 | 40.000.000 |
| **Tổng cộng (trước VAT)** | **712.000.000** |

**Không bao gồm:** Migration brand thứ 2, cross-brand points, marketing automation, CSKH module, hạ tầng on-prem.

---

### 2.2. GÓI STANDARD — 1.512 triệu VND *(khuyến nghị cho bài toán khách)*

**Phạm vi bao phủ:**
- Triển khai **cả 2 brand**, ~300 cửa hàng
- **Migration đầy đủ 4 hệ thống cũ**: Goldmem + MS Access + MS Excel + Supporter → 1 hồ sơ KH 360°
- Nền tảng Loyalty đầy đủ: Core + Cross-brand + Referral + Leaderboard + Hạng linh hoạt
- Tích hợp POS + Website + Mobile App của cả 2 brand
- Dashboard + Báo cáo nâng cao (retention, CLV, xu hướng điểm, phân bổ hạng)
- 3 webhook channels (tích điểm / thăng hạng / đổi thưởng)
- Module CSKH (thay Supporter) — ghi nhận, phân luồng, theo dõi khiếu nại gắn với hồ sơ KHTV
- Cloud hosting do Reborn cung cấp (1 năm miễn phí, năm 2 tính 192tr/năm)
- Đào tạo 3 buổi: admin (10) + super-user (30) + end-user (50)
- SLA: 99.5% uptime, hỗ trợ 8×5 response < 4h, sự cố P1 24/7 < 30 phút

**Chi phí chi tiết:**

| Hạng mục | VND |
|---------|-----|
| License phần mềm (1 năm, multi-brand) | 416.000.000 |
| Triển khai & Cấu hình | 344.000.000 |
| Migration đầy đủ 4 hệ thống (Goldmem + Access + Excel + Supporter) + dedupe + merge | 256.000.000 |
| Tích hợp POS 2 brand (~300 store) | 184.000.000 |
| Tích hợp Website + Mobile App (2 brand) | 112.000.000 |
| Module CSKH (thay Supporter) | 72.000.000 |
| Dashboard + Báo cáo nâng cao | 56.000.000 |
| Đào tạo 3 buổi + tài liệu video | 40.000.000 |
| Bảo hành 6 tháng + hỗ trợ 8×5 + P1 24/7 | 32.000.000 |
| **Tổng cộng (trước VAT)** | **1.512.000.000** |

**Không bao gồm:** Marketing Automation nội bộ, ML phân khúc RFM nâng cao, PoC riêng, hạ tầng on-prem.

---

### 2.3. GÓI PREMIUM — 2.392 triệu VND

**Phạm vi bao phủ:**
- Tất cả STANDARD
- **Marketing Automation nội bộ** (Email, SMS, Push, Zalo OA) — giảm phụ thuộc agency ngoài
  - Trình soạn chiến dịch có sẵn template
  - Lập lịch gửi, A/B test subject/content
  - Hệ thống điều tiết tần suất (không spam)
  - Tracking open rate, click, conversion
  - Kịch bản automation đa bước (trigger-based)
- **Phân khúc khách hàng RFM + CLV + Churn Prediction** (ML nội bộ)
- **PoC 4 tuần** trên sample data trước khi ký hợp đồng chính thức
- Tích hợp chữ ký số / chứng chỉ bảo mật (ISO 27001 tham khảo)
- Cloud hosting dedicated + DR setup
- Đào tạo 5 buổi + 1 buổi workshop chiến dịch marketing
- SLA: 99.9% uptime, hỗ trợ 24×7 response < 1h

**Chi phí chi tiết:**

| Hạng mục | VND |
|---------|-----|
| License phần mềm (1 năm, multi-brand + ML) | 624.000.000 |
| Triển khai & Cấu hình | 408.000.000 |
| Migration đầy đủ 4 hệ thống + dedupe + merge | 256.000.000 |
| Tích hợp POS + Website + App 2 brand | 304.000.000 |
| Module CSKH + Call-center integration | 120.000.000 |
| Marketing Automation Engine (4 kênh) | 336.000.000 |
| RFM + CLV + Churn ML module | 152.000.000 |
| PoC 4 tuần (sample data) | 48.000.000 |
| DR + Dedicated Cloud (1 năm) | 72.000.000 |
| Đào tạo 5 buổi + workshop campaign | 48.000.000 |
| Bảo hành 6 tháng + SLA 24×7 | 24.000.000 |
| **Tổng cộng (trước VAT)** | **2.392.000.000** |

---

## 3. MÔ-ĐUN TUỲ CHỌN (ADD-ONS)

Áp dụng được cho bất kỳ gói nào — khách chọn thêm theo nhu cầu sau khi trả lời khảo sát.

| # | Mô-đun | Mô tả ngắn | Giá (VND) |
|---|--------|------------|-----------|
| 1 | Gamification Pack | Check-in, quay số may mắn, nhiệm vụ, thành tích | 120.000.000 |
| 2 | Referral 2-chiều nâng cao | Thưởng cả người mời + người được mời, leaderboard, bảng xếp hạng referral | 64.000.000 |
| 3 | Mini-app Zalo | Tra cứu điểm, đổi thưởng, đăng ký KHTV qua Zalo Mini App | 176.000.000 |
| 4 | Mini-app trên mobile app hiện có (Brand A + B) | SDK tích hợp cho iOS + Android, hiển thị thẻ & điểm trong app | 144.000.000 |
| 5 | Đổi điểm ra ví điện tử | Tích hợp VNPay / MoMo / ZaloPay để đổi điểm ra tiền ví | 128.000.000 |
| 6 | Voucher đối tác liên kết | Tích hợp API đối tác (CGV, Grab, Highlands...) để đổi voucher | 112.000.000 |
| 7 | SSO / LDAP integration | Đồng bộ user với Azure AD / Okta / Keycloak / OpenLDAP | 76.000.000 |
| 8 | Tích hợp ERP (Bravo, MISA, SAP) | Đồng bộ danh mục sản phẩm + công nợ KHTV | 104.000.000 |
| 9 | BI integration (Power BI / Tableau) | Data pipeline real-time sang BI tool của khách | 60.000.000 |
| 10 | ISO 27001 compliance consulting | Tư vấn đạt chứng chỉ, hỗ trợ audit | 144.000.000 |
| 11 | Tăng cường bảo mật (WAF, DDoS, SIEM) | Với gói Premium khuyến nghị | 176.000.000 |
| 12 | Migration hệ thống cũ bổ sung (ngoài 4) | Tính theo từng hệ thống | 64–120.000.000/hệ thống |
| 13 | Thêm ngôn ngữ giao diện | VD: Anh, Trung | 40.000.000/ngôn ngữ |
| 14 | Mở rộng cho cửa hàng mới (sau rollout) | Cấu hình + training theo batch 100 store | 48.000.000/batch 100 store |
| 15 | Dedicated customer success manager | 1 người phụ trách 1 khách, vận hành sau go-live | 192.000.000/năm |

---

## 4. CHI PHÍ VẬN HÀNH HÀNG NĂM (TỪ NĂM 2 TRỞ ĐI)

Sau khi kết thúc bảo hành 6 tháng, khách duy trì dịch vụ theo phí vận hành hàng năm.

| Hạng mục | STARTER | STANDARD | PREMIUM |
|----------|---------|----------|---------|
| License & cập nhật (năm 2+) | 184.000.000 | 352.000.000 | 496.000.000 |
| Cloud hosting (Reborn-managed) | 144.000.000 | 192.000.000 | 288.000.000 |
| Support & Maintenance | 64.000.000 | 112.000.000 | 176.000.000 |
| **Tổng phí năm 2 (trước VAT)** | **392.000.000** | **656.000.000** | **960.000.000** |

**Phí scale theo cửa hàng** (áp dụng khi chuỗi vượt quy mô đã ký):

| Quy mô | Phí thêm/năm |
|--------|--------------|
| 300 → 500 store | +120.000.000 |
| 500 → 800 store | +224.000.000 |
| 800 → 1.200 store | +336.000.000 |
| 1.200 → 1.500 store | +416.000.000 |

> Gói **Scale cam kết 3 năm** được **giảm 15%** — phù hợp khi khách muốn đồng hành dài hạn để triển khai kế hoạch mở rộng 1.500 điểm bán.

---

## 5. MÔ HÌNH HẠ TẦNG — 3 PHƯƠNG ÁN

### 5.1. Cloud Reborn-Managed *(khuyến nghị)*
- Reborn vận hành hạ tầng trên cloud VN (VNG / FPT / Viettel IDC)
- Khách trả phí hosting theo gói
- **Ưu điểm:** Deploy nhanh 2–3 tuần, không lo hạ tầng, scale đàn hồi
- **Chi phí hosting:** Đã tính trong báo giá hàng năm ở §4

### 5.2. Hybrid (App Cloud, DB On-Prem)
- Application layer trên cloud, Database tại server khách
- **Phù hợp khi:** Khách có yêu cầu tuân thủ về data nhưng không đủ IT để vận hành toàn bộ
- **Chi phí triển khai thêm:** +144.000.000
- **Chi phí hạ tầng hàng năm:** Khách tự đầu tư DB server (~150–250tr tuỳ cấu hình), Reborn báo giá cloud app layer riêng (~96tr/năm)

### 5.3. On-Premise Toàn bộ
- Deploy trên server nội bộ của khách
- **Phù hợp khi:** Khách có yêu cầu nghiêm ngặt về data residency, có Phòng CNTT&CĐS mạnh
- **Chi phí triển khai thêm:** +256.000.000 (công cài đặt, tối ưu, tập huấn DevOps)
- **Chi phí hạ tầng hàng năm:** Khách tự đầu tư server (~400–600tr ban đầu + 100tr/năm vận hành)
- **Yêu cầu khách cung cấp:** 3 server ứng dụng + 2 server DB + 1 server backup + giải pháp DR

---

## 6. MÔ HÌNH THANH TOÁN — 4 TUỲ CHỌN

| Mô hình | Năm 1 | Năm 2+ | Phù hợp khi |
|---------|-------|--------|-------------|
| **One-time license** | 100% trả trước | **Phí maintenance 18%/năm** trên giá trị hợp đồng năm 1 + cloud hosting (nếu có) | Khách có ngân sách CAPEX, muốn sở hữu license |
| **Subscription SaaS** | Chia 12 kỳ hàng tháng | Chia 12 kỳ hàng tháng | Khách muốn OPEX, không lock lâu dài |
| **Theo milestone** | 30% ký hợp đồng / 30% go-live pilot / 30% rollout / 10% nghiệm thu | Subscription hoặc tiếp tục milestone | Phổ biến nhất — cân bằng rủi ro 2 bên |
| **Theo cửa hàng** | Phí setup + phí theo số cửa hàng kích hoạt | Tương tự | Khi chuỗi mở rộng dần, chỉ trả tương ứng quy mô thực |

### 6.1. Chi tiết phí maintenance cho phương án One-time license

Khi chọn **One-time license**, từ năm 2 trở đi khách duy trì dịch vụ với **phí maintenance 18%/năm** trên giá trị hợp đồng năm 1. Phí này bao gồm: license cập nhật version mới, hỗ trợ kỹ thuật, hotfix bảo mật, backup định kỳ. **Cloud hosting tính riêng** nếu khách chọn Cloud Reborn-managed (xem §5).

| Gói | Giá trị hợp đồng năm 1 | Maintenance 18%/năm | Cloud hosting (nếu dùng) | Tổng năm 2+ |
|------|------------------------|---------------------|--------------------------|-------------|
| STARTER | 712.000.000 | 128.160.000 | 144.000.000 | **272.160.000** |
| STANDARD | 1.512.000.000 | 272.160.000 | 192.000.000 | **464.160.000** |
| PREMIUM | 2.392.000.000 | 430.560.000 | 288.000.000 | **718.560.000** |

> Nếu khách chọn On-Premise (không dùng cloud Reborn), chỉ trả phí maintenance 18% — cột cloud hosting bỏ qua.

---

## 7. KỊCH BẢN GIÁ THEO TRẢ LỜI KHẢO SÁT

Dưới đây là các khả năng khách trả lời khảo sát và gói tương ứng Reborn đề xuất. Mỗi dòng là 1 kịch bản độc lập.

### 7.1. Theo ngân sách

| Ngân sách khách trả lời | Gói đề xuất | Ghi chú |
|--------------------------|------------|---------|
| < 800 triệu | STARTER | Pilot 1 brand trước, mở rộng năm 2 |
| 0.8–1.2 tỷ | STANDARD tối giản | Giảm 1 số add-on, giữ core + migration + 2 brand |
| 1.2–2 tỷ | **STANDARD (khuyến nghị)** | Phù hợp nhất cho quy mô 300 store + 3M KHTV |
| 2–3 tỷ | **PREMIUM** | Thay thế agency marketing, PoC nghiêm túc |
| > 3 tỷ | PREMIUM + Add-ons | Thêm gamification, mini-app, ML nâng cao |

### 7.2. Theo timeline

| Timeline khách mong muốn | Gói phù hợp | Điều chỉnh |
|---------------------------|-------------|------------|
| 2–3 tháng go-live pilot | STARTER | Giới hạn 1 brand, 50 store pilot |
| 4 tháng go-live rollout toàn chuỗi | STANDARD | Rút gọn Phase 2 bằng tăng nhân sự triển khai (+15% chi phí) |
| 6 tháng go-live toàn chuỗi | **STANDARD chuẩn** | Lộ trình mặc định trong đề xuất |
| 9–12 tháng, không vội | PREMIUM | Bổ sung PoC 4 tuần, marketing automation hoàn chỉnh |

### 7.3. Theo mô hình hạ tầng

| Khách chọn | Ảnh hưởng | Chi phí biến động |
|------------|-----------|-------------------|
| Cloud Reborn-Managed | Mặc định — giá như báo | Không đổi |
| Hybrid | Thêm DB on-prem | +144tr triển khai, −24tr/năm cloud |
| On-Prem toàn bộ | Tự lo hạ tầng | +256tr triển khai, −144tr/năm cloud, khách +400–600tr server |

### 7.4. Theo số hệ thống cần tích hợp ngoài 4 hệ thống cơ bản

| Số hệ thống tích hợp thêm | Chi phí thêm |
|----------------------------|--------------|
| 0 (chỉ 4 hệ thống cơ bản) | Đã có trong gói STANDARD |
| 1 hệ thống thêm (VD: ERP Bravo) | +104tr |
| 2–3 hệ thống (+ POS phụ, BI, SSO) | +184–272tr |
| Tích hợp hệ sinh thái (VNPay, Grab, CGV...) | +112tr mỗi đối tác |

### 7.5. Theo kế hoạch mở rộng

| Số cửa hàng mục tiêu 3 năm | Phương án | Ghi chú |
|-----------------------------|-----------|---------|
| Giữ ~300 store | STANDARD + phí năm 2+ cố định | |
| Mở rộng 500–800 store | STANDARD + Scale pack | +120tr/năm từ năm 2 |
| Mở rộng 1.000–1.500 store *(scenario khách)* | **STANDARD/PREMIUM + cam kết 3 năm** | Giảm 15% tổng, bao phủ phí scale |

### 7.6. Theo yêu cầu marketing automation

| Khách chọn | Gói đề xuất |
|------------|-------------|
| Vẫn dùng agency ngoài, không cần auto | STARTER / STANDARD |
| Muốn thay thế agency từng phần | STANDARD + Add-on Marketing (336tr riêng) |
| Muốn thay hoàn toàn agency | **PREMIUM** (đã bao gồm) |

### 7.7. Theo yêu cầu bảo mật

| Khách yêu cầu | Phương án |
|--------------|-----------|
| Mặc định (TLS, audit log, RBAC) | Có trong mọi gói |
| ISO 27001 consulting | +144tr (add-on) |
| PCI-DSS (nếu lưu thẻ) | Tư vấn riêng — ước tính 200–280tr |
| WAF + DDoS + SIEM | +176tr |
| Yêu cầu data residency VN | Bắt buộc Cloud VN / On-prem (mặc định đã có) |

---

## 8. LỊCH THANH TOÁN ĐỀ XUẤT (MẪU CHO GÓI STANDARD)

| Milestone | % thanh toán | Số tiền (VND) | Thời điểm |
|-----------|--------------|----------------|-----------|
| Ký hợp đồng | 30% | 453.600.000 | T0 |
| Hoàn tất Phase 1 (pilot Brand A) | 30% | 453.600.000 | T2 (cuối tháng 2) |
| Hoàn tất Phase 2 (rollout 300 store) | 30% | 453.600.000 | T4 (cuối tháng 4) |
| Nghiệm thu cuối cùng | 10% | 151.200.000 | T6 (cuối tháng 6) |
| **Tổng** | **100%** | **1.512.000.000** | |

*VAT 10% tính trên từng đợt thanh toán.*

---

## 9. CAM KẾT & ĐIỀU KHOẢN

### 9.1. Cam kết chất lượng
- Bảo hành 6 tháng sau nghiệm thu — fix bug miễn phí
- Cam kết SLA theo gói đã chọn (99.0 / 99.5 / 99.9%)
- Hỗ trợ Zalo/Email/Hotline theo giờ cam kết
- Phạt vi phạm SLA: giảm 5% phí năm đó cho mỗi 0.1% uptime thiếu hụt (cap 30%)

### 9.2. Quyền sở hữu
- Khách hàng sở hữu **toàn bộ data** (hội viên, giao dịch, config)
- Data export bất kỳ lúc nào (CSV, API, SQL dump)
- Source code theo thoả thuận license (One-time license: khách có source code; SaaS: khách có quyền export data đầy đủ)

### 9.3. Điều kiện chấm dứt
- Khách có thể chấm dứt sau năm 1 với 60 ngày thông báo trước
- Reborn hỗ trợ transition đến nhà cung cấp khác (tối đa 3 tháng, phí riêng)

### 9.4. Điều khoản giá
- Báo giá này hiệu lực 30 ngày
- Phí năm 2+ có thể điều chỉnh tối đa 5%/năm theo CPI
- Ký hợp đồng 3 năm → **khoá giá năm 1, giảm 15% tổng trị giá**

---

## 10. SO SÁNH VỚI THỊ TRƯỜNG

### 10.1. Đối chiếu gói STANDARD với các nhà cung cấp khác

| Nhà cung cấp | Phạm vi tương đương | Giá tham chiếu (VND) | Điểm khác |
|---------------|---------------------|----------------------|-----------|
| **Reborn JSC (đề xuất)** | Full 2 brand, migration 4 hệ thống, 300 store | **1.512.000.000** | Dành riêng cho bài toán của khách, team Việt, có source, đã giảm 20% ưu đãi cạnh tranh |
| Vendor Enterprise nước ngoài (A) | Loyalty core multi-brand | 3.500.000.000–5.000.000.000 | Pricing USD, hỗ trợ qua email chậm, cần consultant ngoài |
| Vendor SaaS quốc tế (B) | Subscription theo MAU (Monthly Active Users) | ~ 2.800.000.000/năm (3M MAU) | Chi phí tăng theo quy mô, lock-in, data không lưu tại VN |
| Build in-house (team mới) | Tương đương phạm vi | 2.500.000.000–4.000.000.000 + 18–24 tháng | Rủi ro delay, thiếu kinh nghiệm retail, chi phí đội |
| Vendor VN khác (C, D, E) | Loyalty cơ bản, 1 brand | 600.000.000–1.200.000.000 | Thường thiếu migration + multi-brand + CSKH module |

**Kết luận:** Gói STANDARD của Reborn có lợi thế cạnh tranh mạnh ở **tỷ lệ chi phí / phạm vi** — đặc biệt với giá trị migration đầy đủ 4 hệ thống cũ mà ít vendor khác có.

### 10.2. Đối chiếu gói PREMIUM

| Gói | Phạm vi | Giá |
|-----|---------|-----|
| **Reborn PREMIUM** | Full + Marketing Automation + ML + PoC + SLA 24/7 | 2.392.000.000 |
| Vendor quốc tế tương đương | SFDC Marketing Cloud + Loyalty | 6.000.000.000+ (quy USD) |
| Build in-house | Cần team 12 người × 18 tháng | ~ 4.500.000.000 |

---

## 11. CÁC BƯỚC TIẾP THEO

1. **Quý khách điền Phiếu khảo sát** (file `Phieu-khao-sat-Loyalty.xlsx` gửi kèm)
2. Reborn nhận → phân tích → phản hồi **báo giá cá nhân hoá** trong **5 ngày làm việc**
3. Demo trực tiếp giải pháp (nếu chưa xem) — đặt lịch qua ceo@reborn.vn
4. Đề xuất PoC 4 tuần miễn phí (với khách cân nhắc gói PREMIUM)
5. Thương thảo hợp đồng & ký kết

---

**Reborn JSC**
Email: ceo@reborn.vn
Web: reborn.vn
Zalo/Hotline: (liên hệ sale đầu mối)

*Báo giá này được lập dựa trên thông tin khảo sát ban đầu (Q&A 04/2026) + đề xuất giải pháp Loyalty v1.1 (23/04/2026). Mọi điều chỉnh sẽ được ghi nhận qua phụ lục sau khi khách hoàn tất phiếu khảo sát.*
