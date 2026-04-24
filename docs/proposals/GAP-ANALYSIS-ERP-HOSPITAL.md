# PHÂN TÍCH KHOẢNG CÁCH (GAP ANALYSIS)
## Giải pháp Reborn vs Chuẩn HIS/ERP Bệnh viện

**Phiên bản:** 1.0
**Ngày lập:** 23/04/2026
**Người lập:** Đội giải pháp Reborn
**Mục đích:** Đánh giá khả năng chuyển đổi nền tảng Reborn Cloud thành một giải pháp HIS (Hospital Information System) / ERP bệnh viện. Làm cơ sở cho báo giá, lộ trình phát triển và chiến lược thâm nhập thị trường y tế.

---

## 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

### 1.1. Kết luận nhanh

| Chỉ số | Giá trị |
|---|---|
| **Tổng số phân hệ chuẩn HIS** | 25 phân hệ |
| **Phân hệ đã có đầy đủ (>80%)** | 3 / 25 ≈ **12%** |
| **Phân hệ có một phần (30-80%)** | 6 / 25 ≈ **24%** |
| **Phân hệ chưa có hoặc chỉ có dạng sơ khai (<30%)** | 16 / 25 ≈ **64%** |
| **Mức độ sẵn sàng tổng thể (weighted)** | **≈ 22% chuẩn HIS** |
| **Mức độ EMR theo QĐ 130/QĐ-BYT** | **Dưới mức 1** |
| **Thời gian phát triển đủ dùng cho phòng khám nhỏ** | **4-6 tháng** |
| **Thời gian phát triển đủ dùng cho BV hạng II-III** | **12-18 tháng** |
| **Thời gian phát triển đủ dùng cho BV hạng I/TW** | **24-36 tháng** |

### 1.2. Nhận định chung

Reborn là **nền tảng CRM/ERP bán lẻ**, **không được thiết kế cho y tế**. Tuy nhiên, **các nền móng kỹ thuật** (tenant multi-branch, BPM, Call Center, Appointment/Ticket, DMS, RBAC, i18n, Loyalty) có thể **tái sử dụng được 30-40% effort** cho dự án HIS. Cụ thể:

**Điểm có thể tận dụng được:**
- **Quản trị tenant/multi-branch** → map sang multi-site bệnh viện/phòng khám.
- **BPM + form builder** → dùng xây workflow y khoa (hội chẩn, chuyển tuyến, xin giấy tờ).
- **Call Center (JsSIP/WebRTC)** → tổng đài chăm sóc bệnh nhân, hẹn lịch điện thoại.
- **Appointment/Booking + Queue trong CRM** → đăng ký khám, xếp lịch, số thứ tự.
- **DMS + Digital Signature stub** → lưu hồ sơ bệnh án điện tử (EMR) và ký số.
- **Marketing Automation** → nhắc lịch tái khám, nhắc uống thuốc, chăm sóc sau khám.
- **Loyalty + CRM 360** → chương trình khách hàng thân thiết của BV (rất ít BV VN có).
- **Finance, Cashbook, Reconcile** → tính viện phí, thu tiền, đối soát (tuy nhiên chưa theo chuẩn kế toán đơn vị sự nghiệp công TT 107/2017).
- **Kho hàng** → chuyển đổi sang Kho dược + Kho vật tư y tế.

**Điểm phải xây mới hoàn toàn:**
- EMR/EHR theo TT 46/2018/TT-BYT (hồ sơ bệnh án điện tử)
- Chỉ định + Kết quả CLS (LIS + RIS + PACS)
- Dược (Pharmacy, e-prescription, tương tác thuốc)
- Thanh toán BHYT (XML giám định theo QĐ 4210)
- Nội trú/Ngoại trú/Cấp cứu workflow y khoa
- Phòng mổ, Điều dưỡng, Dinh dưỡng
- Tích hợp thiết bị y tế (HL7 v2.x, DICOM)
- Các code chuẩn: ICD-10, ICD-9-CM, SNOMED CT, LOINC
- VNeID/CCCD + Sổ sức khoẻ điện tử
- Báo cáo Bộ Y tế / Sở Y tế

### 1.3. Khuyến nghị chiến lược

> **KHÔNG khuyến nghị** Reborn bán HIS cho BV hạng I/TW trong 24 tháng tới (quá rủi ro, không đủ kinh nghiệm y khoa).

> **KHUYẾN NGHỊ** Reborn **bắt đầu từ phân khúc Clinic SaaS** (phòng khám đa khoa/chuyên khoa/thẩm mỹ/nha khoa tư nhân có <20 bác sĩ, <50 giường, không liên kết BHYT), sau đó mở rộng dần lên BV hạng III.

> **Lý do:**
> 1. 30.000+ phòng khám tư VN, chỉ ~20% có HIS → thị trường rộng.
> 2. Yêu cầu pháp lý đơn giản hơn (không bắt buộc BHYT XML 4210, không bắt buộc EMR mức cao).
> 3. Ngân sách phù hợp với SaaS (500k - 3 triệu/tháng/phòng khám).
> 4. Reborn đã có sẵn ~60% tính năng cho phòng khám (booking, CRM, POS, loyalty, marketing, kho, tài chính cơ bản).
> 5. Có thể đạt MVP trong **4-6 tháng**, go-to-market ngay 2026.

---

## 2. PHẠM VI, PHƯƠNG PHÁP & CHUẨN THAM CHIẾU

### 2.1. Chuẩn tham chiếu

**Pháp lý Việt Nam (bắt buộc tuân thủ):**
- **TT 46/2018/TT-BYT** — Hồ sơ bệnh án điện tử (EMR).
- **TT 54/2017/TT-BYT** — Bộ tiêu chí CNTT y tế.
- **QĐ 130/QĐ-BYT** — 7 mức trưởng thành EMR.
- **QĐ 4210/QĐ-BYT** — Chuẩn XML giám định BHYT (XML 1-15).
- **QĐ 4750/QĐ-BYT** — Liên thông KCB toàn quốc.
- **QĐ 3725/QĐ-BYT** — Danh mục dùng chung.
- **QĐ 6858/QĐ-BYT** — 83 tiêu chí chất lượng bệnh viện.
- **TT 27/2021/TT-BYT** — Kê đơn thuốc điện tử.
- **NĐ 102/2018/NĐ-CP** — Quản lý nhà nước về CNTT y tế.
- **QĐ 06/QĐ-TTg** — Đề án 06, VNeID, Sổ sức khoẻ điện tử.
- **TT 107/2017/TT-BTC** — Kế toán đơn vị sự nghiệp công.
- **NĐ 60/2021/NĐ-CP** — Tự chủ tài chính đơn vị sự nghiệp công.

**Chuẩn quốc tế:**
- **HL7 v2.x, HL7 FHIR R4** — trao đổi dữ liệu y tế.
- **DICOM 3.0** — hình ảnh y khoa.
- **ICD-10** (WHO) — chẩn đoán bệnh.
- **ICD-9-CM** — thủ thuật/phẫu thuật.
- **SNOMED CT, LOINC** — thuật ngữ y khoa, xét nghiệm.
- **HIMSS EMRAM** — thang đánh giá EMR quốc tế.

**Sản phẩm benchmark:**
- **FPT.eHospital 2.0** (thị phần lớn nhất VN, >200 BV).
- **Viettel HIS**, **VNPT-HIS**, **Medisoft**, **PeterSoft**, **BKAV HIS**, **Onemes**, **Infomed**.
- **Quốc tế:** Epic, Cerner/Oracle Health, InterSystems TrakCare, Meditech.

### 2.2. Quy ước chấm điểm (giống file ERP)

✅ Có đầy đủ (≥80%) | 🟡 Có một phần (30-80%) | 🟠 Có cơ bản (10-30%) | ❌ Chưa có (<10%).

Mức ưu tiên: **M** Must-have | **S** Should-have | **C** Could-have.

---

## 3. BẢNG GAP ANALYSIS CHI TIẾT — 25 PHÂN HỆ HIS

### 3.1. Tiếp nhận & Đăng ký (Patient Registration & Appointment) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ | Ghi chú |
|---|---|---|---|
| Đăng ký hành chính BN (họ tên, CCCD, BHYT, địa chỉ) | 🟡 | 55% | Customer module đã có nhưng thiếu trường y tế (dị ứng, nhóm máu, BHYT) |
| Tra cứu BN cũ, merge hồ sơ trùng | 🟡 | 40% | Có Customer search nhưng chưa có MDM y khoa |
| Cấp mã BN (MRN) duy nhất | 🟠 | 25% | Cần chuẩn MRN theo format BYT |
| Đặt lịch khám online/offline | ✅ | 75% | Đã có Appointment/Booking logic qua CRM |
| Xếp hàng điện tử (Queue, kiosk, STT) | 🟠 | 20% | Chưa có module Queue chuyên biệt |
| Tích hợp VNeID, CCCD chip, đọc thẻ BHYT | ❌ | 0% | **Thiếu hoàn toàn** |
| Phân luồng khám sàng lọc | 🟠 | 20% | Workflow BPM có thể dựng nhưng chưa chuyên |
| **Tổng đánh giá phân hệ** | 🟡 | **34%** | |

**Effort bổ sung:** 3-4 PM. Tận dụng CRM + BPM có sẵn.

---

### 3.2. Khám ngoại trú (OPD) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Phiếu khám, tiền sử bệnh, dị ứng, thuốc đang dùng | ❌ | 5% |
| Vital Signs (HA, mạch, nhiệt độ, SpO2, BMI) | ❌ | 0% |
| Khám lâm sàng theo chuyên khoa | ❌ | 0% |
| Chẩn đoán ICD-10 (chính, phụ, kèm theo) | ❌ | 0% |
| Chỉ định CLS, thuốc, thủ thuật | ❌ | 0% |
| Hẹn tái khám, chuyển tuyến | 🟠 | 20% |
| **Tổng đánh giá phân hệ** | ❌ | **4%** |

**Effort:** 6-8 PM. **Xây mới hoàn toàn.**

---

### 3.3. Khám nội trú (IPD) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Admission, chọn khoa/phòng/giường | ❌ | 0% |
| Bệnh án nội trú, tờ điều trị hàng ngày | ❌ | 0% |
| Đi buồng (Doctor Round), y lệnh (Doctor Order) | ❌ | 0% |
| Hội chẩn, chuyển khoa | 🟠 | 15% (tận dụng BPM) |
| Ra viện (Discharge Summary) | ❌ | 0% |
| Theo dõi diễn biến bệnh (Progress Note) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **3%** |

**Effort:** 8-10 PM. **Xây mới.** IPD là phân hệ phức tạp nhất, cần BS/điều dưỡng co-design.

---

### 3.4. Cấp cứu (ER) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Triage theo ESI 1-5 | ❌ | 0% |
| Tiếp nhận nhanh (không cần hành chính đầy đủ) | ❌ | 0% |
| Theo dõi 24/7, bàn giao ca | 🟠 | 20% (tận dụng ShiftManagement) |
| Chuyển viện cấp cứu, ICU | ❌ | 0% |
| Tích hợp 115 | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **4%** |

**Effort:** 4-5 PM.

---

### 3.5. Hồ sơ bệnh án điện tử (EMR/EHR) — **M** (quan trọng nhất)

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| HSBA ĐT theo TT 46/2018/TT-BYT | ❌ | 0% |
| 7 mức EMR theo QĐ 130/QĐ-BYT | ❌ | 0% |
| Ký số bác sĩ, điều dưỡng | 🟠 | 15% |
| Lưu trữ không giấy (paperless) | 🟠 | 20% (tận dụng DMS) |
| Timeline y khoa theo BN | 🟠 | 20% (tận dụng CRM 360) |
| Template bệnh án theo chuyên khoa | ❌ | 0% |
| Tra cứu lịch sử KCB liên cơ sở | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **8%** |

**Effort:** 10-15 PM. **Đây là core của HIS**, bắt buộc đầu tư nặng.

---

### 3.6. Chỉ định & Kết quả CLS (LIS + RIS + PACS) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| **LIS** — Xét nghiệm, mã vạch ống mẫu, kết nối máy XN qua HL7 ASTM | ❌ | 0% |
| **RIS** — X-quang, CT, MRI, siêu âm | ❌ | 0% |
| **PACS** — DICOM viewer, modality worklist | ❌ | 0% |
| Kết quả tự động từ máy, BS duyệt/ký | ❌ | 0% |
| Giá trị tham chiếu, cảnh báo bất thường | ❌ | 0% |
| Trả kết quả qua app, SMS, email, QR | 🟠 | 20% (tận dụng Marketing channels) |
| **Tổng đánh giá phân hệ** | ❌ | **3%** |

**Effort:** 12-18 PM. Có thể **tích hợp với LIS/PACS có sẵn** (Mirth Connect middleware) thay vì tự xây.

---

### 3.7. Dược & Kho dược (Pharmacy) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Kê đơn điện tử (e-Prescription) theo TT 27/2021 | ❌ | 0% |
| Cổng Đơn thuốc quốc gia | ❌ | 0% |
| Cảnh báo tương tác thuốc, dị ứng, liều | ❌ | 0% |
| Kho dược: nhập-xuất-tồn theo lô, HSD, nhiệt độ | 🟡 | 50% (tận dụng Inventory có sẵn) |
| Tủ thuốc trực (Ward Stock) | ❌ | 0% |
| Cấp phát nội trú, ngoại trú | ❌ | 0% |
| Thuốc kiểm soát đặc biệt | ❌ | 0% |
| Dược lâm sàng | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **9%** |

**Effort:** 8-12 PM. Tận dụng WMS có sẵn cho phần kho.

---

### 3.8. Phòng mổ (OR) — **M** (nếu có PT)

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Đặt lịch mổ, phòng mổ, kíp mổ | 🟠 | 15% (tận dụng ResourceManagement + BPM) |
| Phiếu tiền mê, gây mê, biên bản PT | ❌ | 0% |
| Checklist an toàn PT (WHO) | ❌ | 0% |
| Vật tư, dụng cụ | 🟠 | 20% (tận dụng Inventory) |
| Hồi tỉnh (PACU) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **7%** |

**Effort:** 5-7 PM.

---

### 3.9. Viện phí (Hospital Billing) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Bảng giá DV theo TT 22/2023, TT 13/2023 | ❌ | 5% |
| Tạm ứng, hoàn ứng | 🟡 | 40% (tận dụng PaymentHistory) |
| Thanh toán nội trú/ngoại trú | 🟡 | 50% |
| Gói dịch vụ (Package, combo KSK, thai sản) | 🟡 | 55% (tận dụng Promotion/Offer) |
| Đồng chi trả BHYT | ❌ | 0% |
| Miễn giảm, từ thiện | 🟠 | 25% |
| HĐĐT y tế | 🟡 | 40% |
| QR, thẻ, CK, ví điện tử | ✅ | 75% |
| **Tổng đánh giá phân hệ** | 🟡 | **36%** |

**Effort:** 4-6 PM. Tận dụng mạnh mẽ Billing có sẵn.

---

### 3.10. Thanh toán BHYT (Health Insurance Claims) — **M (VN)** ⚠️ *Khó nhất*

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Cổng giám định BHYT (Hệ thống BHXH VN) | ❌ | 0% |
| XML 4210 (XML 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15) | ❌ | 0% |
| Chuẩn 4750 cho liên thông KCB | ❌ | 0% |
| Kiểm tra thông tuyến, mức hưởng, giấy CT | ❌ | 0% |
| Tra cứu lịch sử KCB BHYT | ❌ | 0% |
| Quyết toán BHYT hàng tháng/quý | ❌ | 0% |
| Phản hồi giám định, từ chối, điều chỉnh | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 6-10 PM. **Phân hệ khó nhất về mặt quy định.** Cần có chuyên gia BHYT và kinh nghiệm thực tế với cổng giám định BHXH VN.

> **Gợi ý chiến lược:** Phase 1 **không làm BHYT**, chỉ phục vụ phòng khám tư/thẩm mỹ không BHYT. Phase 2 mới làm BHYT khi đã có khách BV hạng III.

---

### 3.11. Quản lý giường bệnh (Bed Management) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Sơ đồ giường trực quan | ❌ | 0% |
| Trạng thái: trống, có BN, vệ sinh, cách ly | ❌ | 0% |
| Bed Occupancy Rate | ❌ | 0% |
| Chuyển giường, ghép giường | ❌ | 0% |
| Giường DV/BHYT/YC | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 3-4 PM.

---

### 3.12. Điều dưỡng (Nursing Care) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Kế hoạch chăm sóc (Care Plan) phân cấp 1-3 | ❌ | 0% |
| Phiếu chăm sóc điều dưỡng | ❌ | 0% |
| Medication Administration Record (MAR, 5 đúng) | ❌ | 0% |
| Theo dõi sinh hiệu theo ca | ❌ | 0% |
| Bàn giao ca (SBAR) | 🟠 | 15% |
| Phòng ngừa loét tỳ đè, té ngã | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **3%** |

**Effort:** 5-7 PM.

---

### 3.13. Dinh dưỡng (Nutrition & Dietary) — **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Thực đơn theo chế độ ăn bệnh lý | ❌ | 0% |
| Chỉ định suất ăn theo BN | ❌ | 0% |
| Kho thực phẩm, chế biến | 🟠 | 20% |
| Kết nối khoa DD – LS | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **5%** |

**Effort:** 2-3 PM.

---

### 3.14. Kho vật tư y tế & TTB — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| VTTH, vật tư thay thế | 🟡 | 55% |
| Hoá chất XN, sinh phẩm | 🟡 | 50% |
| TTBYT: lý lịch máy, bảo trì, hiệu chuẩn | 🟠 | 15% |
| Lô, HSD, số đăng ký lưu hành | 🟡 | 55% |
| Đấu thầu tập trung | ❌ | 0% |
| Cổng công khai giá TTBYT | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **30%** |

**Effort:** 3-4 PM. Tận dụng mạnh Inventory có sẵn.

---

### 3.15. Tiệt khuẩn (CSSD) — **C**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Quy trình tiệt khuẩn | ❌ | 0% |
| Mã vạch bộ DC, truy xuất | 🟠 | 20% |
| Kiểm soát chỉ thị SH/HH | ❌ | 0% |
| Lịch sử sử dụng trên BN | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **5%** |

**Effort:** 2-3 PM.

---

### 3.16. Báo cáo Bộ Y tế / Sở Y tế — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Thống kê BV (TT 20/2019, TT 37/2019) | ❌ | 0% |
| Báo cáo Cục QLKCB | ❌ | 0% |
| Báo cáo bệnh truyền nhiễm | ❌ | 0% |
| Tai biến, sự cố y khoa | ❌ | 0% |
| Kháng kháng sinh (AMR) | ❌ | 0% |
| Cổng DVC BYT | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 4-6 PM. Toàn bộ là biểu mẫu Bộ Y tế, có thể dùng lại report engine của Reborn.

---

### 3.17. Đặt lịch online & Telemedicine — **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| App BN, website đặt lịch | 🟡 | 40% |
| Khám từ xa video call (TT 49/2017, NĐ 96/2023) | 🟠 | 20% (tận dụng WebRTC) |
| Tư vấn online, kê đơn từ xa | ❌ | 0% |
| Hội chẩn liên viện | ❌ | 0% |
| Tích hợp Viettel Telehealth, VOV Bacsi24 | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **35%** |

**Effort:** 4-6 PM. WebRTC stack đã có (JsSIP), tận dụng tốt.

---

### 3.18. Định danh & Liên thông dữ liệu — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| VNeID, CCCD chip (Đề án 06) | ❌ | 0% |
| Sổ sức khoẻ điện tử (SSKĐT) | ❌ | 0% |
| HL7 v2.x, HL7 FHIR R4 | ❌ | 0% |
| DICOM | ❌ | 0% |
| ICD-10, ICD-9-CM, SNOMED CT, LOINC | ❌ | 0% |
| Liên thông KCB toàn quốc | ❌ | 0% |
| Liên thông đơn thuốc QG | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 8-10 PM. **Bắt buộc phải có** nếu muốn làm BV VN.

---

### 3.19. Mức EMR Bộ Y tế — **M (mục tiêu)**

| Mức EMR | Trạng thái hiện tại của Reborn |
|---|---|
| Mức 1 — Số hoá hành chính, viện phí | 🟠 Đang đạt ~30% |
| Mức 2 — Quản lý khoa CLS (LIS/RIS) | ❌ Chưa đạt |
| Mức 3 — CPOE, y lệnh điện tử | ❌ Chưa đạt |
| Mức 4 — PACS, kết quả CLS số | ❌ Chưa đạt |
| Mức 5 — CDSS | ❌ Chưa đạt |
| Mức 6 — Ký số bệnh án, paperless một phần | ❌ Chưa đạt |
| Mức 7 — Paperless hoàn toàn | ❌ Chưa đạt |

**Mục tiêu khuyến nghị:**
- Phase 1 (12 tháng): đạt **Mức 2** (Clinic SaaS + LIS nhẹ).
- Phase 2 (24 tháng): đạt **Mức 4**.
- Phase 3 (36 tháng): đạt **Mức 6** (đủ bán cho BV hạng II).

---

### 3.20. Tích hợp thiết bị y tế (Device Integration) — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Máy XN qua HL7/ASTM | ❌ | 0% |
| Máy CĐHA qua DICOM | ❌ | 0% |
| Monitor sinh hiệu | ❌ | 0% |
| Máy thở, gây mê | ❌ | 0% |
| Middleware (Mirth Connect, Rhapsody) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 5-8 PM (dùng Mirth Connect open-source).

---

### 3.21. Quản lý chất lượng BV — **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| 83 tiêu chí chất lượng BV (QĐ 6858) | ❌ | 0% |
| Sự cố y khoa, dược | 🟠 | 20% (tận dụng Ticket) |
| Kiểm soát nhiễm khuẩn (IPC) | ❌ | 0% |
| KPI lâm sàng | 🟠 | 20% |
| ISO 15189, JCI | ❌ | 0% |
| Khảo sát hài lòng BN/NV (QĐ 3869) | 🟡 | 60% (tận dụng Survey) |
| **Tổng đánh giá phân hệ** | 🟠 | **17%** |

**Effort:** 3-5 PM.

---

### 3.22. Nhân sự – Lương – Kế toán BV — **M**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| NV y tế, chứng chỉ hành nghề (CCHN) | 🟠 | 25% |
| Lịch trực, ca kíp (trực 24h, trực CK) | 🟡 | 55% (ShiftManagement tốt) |
| Phụ cấp đặc thù ngành y | ❌ | 0% |
| Kế toán đơn vị sự nghiệp công (TT 107/2017) hoặc DN (TT 200) | 🟡 | 40% |
| Tự chủ tài chính (NĐ 60/2021) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **24%** |

**Effort:** 5-7 PM.

---

### 3.23. Nghiên cứu khoa học & Đào tạo — **C**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Đề tài NCKH | ❌ | 0% |
| Dữ liệu nghiên cứu ẩn danh | ❌ | 0% |
| CME, thực hành lâm sàng | ❌ | 0% |
| Học viên, thực tập sinh | ❌ | 0% |
| **Tổng đánh giá phân hệ** | ❌ | **0%** |

**Effort:** 3-5 PM.

---

### 3.24. Tử vong & Lưu trữ HSBA — **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Quản lý nhà xác | ❌ | 0% |
| Giấy chứng tử (TT 24/2020) | ❌ | 0% |
| Lưu trữ HSBA | 🟠 | 25% (DMS có sẵn) |
| Số hoá HSBA cũ (scan, OCR) | 🟠 | 15% |
| **Tổng đánh giá phân hệ** | ❌ | **10%** |

**Effort:** 2-3 PM.

---

### 3.25. Portal Bệnh nhân (Patient Portal / Mobile App) — **S**

| Tính năng chuẩn | Trạng thái | Mức độ |
|---|---|---|
| Xem kết quả khám, CLS, đơn thuốc | ❌ | 0% |
| Đặt lịch, thanh toán online | 🟡 | 55% (đã có booking) |
| SSKĐT cá nhân | ❌ | 0% |
| Nhắc lịch uống thuốc, tái khám | 🟡 | 50% (tận dụng Marketing) |
| Thiết bị đeo (wearables) | ❌ | 0% |
| **Tổng đánh giá phân hệ** | 🟡 | **21%** |

**Effort:** 4-6 PM.

---

## 4. BẢNG TỔNG HỢP

| # | Phân hệ | Mức phủ | Ưu tiên | Effort (PM) | Phase đề xuất |
|---|---|---:|:---:|:---:|:---:|
| 1 | Tiếp nhận & Đăng ký | 34% | M | 3-4 | 1 |
| 2 | Khám ngoại trú (OPD) | 4% | M | 6-8 | 1 |
| 3 | Khám nội trú (IPD) | 3% | M | 8-10 | 2 |
| 4 | Cấp cứu (ER) | 4% | M | 4-5 | 2 |
| 5 | EMR/EHR | 8% | M | 10-15 | 1 |
| 6 | CLS (LIS+RIS+PACS) | 3% | M | 12-18 | 2 |
| 7 | Dược & Kho dược | 9% | M | 8-12 | 1 |
| 8 | Phòng mổ (OR) | 7% | M | 5-7 | 2 |
| 9 | Viện phí | 36% | M | 4-6 | 1 |
| 10 | Thanh toán BHYT | 0% | M | 6-10 | 3 (sau khi có khách BV công) |
| 11 | Quản lý giường bệnh | 0% | M | 3-4 | 2 |
| 12 | Điều dưỡng | 3% | M | 5-7 | 2 |
| 13 | Dinh dưỡng | 5% | S | 2-3 | 3 |
| 14 | Kho VTYT, TTB | 30% | M | 3-4 | 1 |
| 15 | Tiệt khuẩn (CSSD) | 5% | C | 2-3 | 3 |
| 16 | Báo cáo BYT/Sở Y tế | 0% | M | 4-6 | 2 |
| 17 | Telemedicine | 35% | S | 4-6 | 1 |
| 18 | Định danh, Liên thông dữ liệu | 0% | M | 8-10 | 2 |
| 19 | Mức EMR BYT (target) | 0% | M | (bao gồm trong các module khác) | 1-3 |
| 20 | Tích hợp thiết bị y tế | 0% | M | 5-8 | 2 |
| 21 | Quản lý chất lượng BV | 17% | S | 3-5 | 3 |
| 22 | HR, Lương, Kế toán BV | 24% | M | 5-7 | 1 |
| 23 | NCKH, Đào tạo | 0% | C | 3-5 | 3 |
| 24 | Tử vong, Lưu trữ HSBA | 10% | S | 2-3 | 3 |
| 25 | Portal BN / Mobile App | 21% | S | 4-6 | 2 |
| **Tổng** | | **~22%** | | **120-180 PM** | |

---

## 5. LỘ TRÌNH PHÁT TRIỂN HIS (ROADMAP)

### 5.1. Phase 1 — "Clinic SaaS" (6 tháng)

**Đối tượng:** Phòng khám đa khoa/chuyên khoa/thẩm mỹ/nha khoa tư nhân, không BHYT, <20 bác sĩ.

**Phân hệ xây mới:**
- Tiếp nhận & Đăng ký BN (có trường y tế)
- OPD (vital signs, ICD-10, chỉ định, kê đơn đơn giản)
- EMR cơ bản (template HSBA, timeline, ký số)
- Dược + Kho dược (tận dụng Inventory)
- Viện phí (tận dụng Billing)
- HR/chấm công cho bác sĩ (tận dụng Timekeeping)
- Telemedicine (tận dụng WebRTC)
- Patient Portal cơ bản (tận dụng CRM)

**Effort:** ~40 PM (5 người × 8 tháng).

**Output:** MVP Clinic SaaS, đạt EMR Mức 1-2.

**Go-to-Market:** Bán 500k - 5 triệu/tháng/phòng khám, cạnh tranh Easycare, Medpro, MedCare.

### 5.2. Phase 2 — "Small Hospital" (12 tháng sau Phase 1)

**Đối tượng:** Bệnh viện tư nhân hạng III (50-150 giường), bệnh viện thẩm mỹ, hoặc chuỗi phòng khám.

**Phân hệ bổ sung:**
- IPD (nội trú, bệnh án, y lệnh, discharge summary)
- Bed Management
- Điều dưỡng (MAR, care plan)
- OR (phòng mổ) nếu có PT
- ER (cấp cứu)
- LIS + RIS (tích hợp qua Mirth Connect)
- PACS viewer
- Định danh VNeID + liên thông cơ bản
- Báo cáo BYT/Sở Y tế
- Device integration (HL7 v2.x)
- Patient Mobile App

**Effort:** ~50 PM (6 người × 8 tháng).

**Output:** Đạt EMR Mức 3-4. Có thể bán cho BV tư nhân hạng III.

**Giá:** 1-3 tỷ/dự án BV hạng III (cạnh tranh với Medisoft, HSoft, BKAV).

### 5.3. Phase 3 — "Full HIS for Hạng II" (12 tháng sau Phase 2)

**Đối tượng:** BV tư nhân hạng II, BV công nếu có cơ hội.

**Phân hệ bổ sung:**
- Thanh toán BHYT XML 4210, cổng giám định
- Liên thông KCB 4750
- CDSS (decision support)
- CSSD, Dinh dưỡng
- Kế toán đơn vị SN công (TT 107)
- Quality Management (83 tiêu chí)
- NCKH, Đào tạo
- Paperless hoàn toàn (EMR Mức 6)

**Effort:** ~40 PM (5 người × 8 tháng).

**Output:** Đạt EMR Mức 5-6. Bán cho BV hạng II, giá 3-8 tỷ/dự án.

### 5.4. Tổng kết roadmap HIS

| Phase | Thời gian | Effort (PM) | Đối tượng | Mục tiêu EMR |
|---|---|---|---|---|
| 1 | 6 tháng | ~40 | Phòng khám tư | Mức 1-2 |
| 2 | 12 tháng | ~50 | BV hạng III | Mức 3-4 |
| 3 | 12 tháng | ~40 | BV hạng II | Mức 5-6 |
| **Tổng** | **30 tháng** | **~130 PM** | | **Mức 6** |

---

## 6. SO SÁNH VỚI ĐỐI THỦ HIS VN

| Tính năng | Reborn hiện tại | Reborn Phase 1 | FPT.eHospital | Viettel HIS | Medisoft | BKAV HIS |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Đối tượng chính | — | Phòng khám | BV hạng I-TW | BV hạng II-I | BV hạng III-II | BV hạng III-II |
| EMR Level | <1 | 1-2 | 4-6 | 4-5 | 3-4 | 3-4 |
| BHYT XML 4210 | ❌ | ❌ (P3) | ✅ | ✅ | ✅ | ✅ |
| LIS/RIS/PACS | ❌ | ❌ (P2) | ✅ | ✅ | ✅ | 🟡 |
| Cloud/SaaS | ✅ | ✅ | ❌ (on-prem) | 🟡 | ❌ | ❌ |
| Mobile App BN | 🟠 | ✅ | 🟡 | ✅ | 🟠 | 🟠 |
| CRM & Marketing cho BV | ✅✅ | ✅✅ | ❌ | 🟠 | ❌ | ❌ |
| Loyalty chương trình BN | ✅✅ | ✅✅ | ❌ | ❌ | ❌ | ❌ |
| Low-code BPM | ✅ | ✅ | ❌ | 🟠 | ❌ | ❌ |
| Call Center tích hợp | ✅✅ | ✅✅ | 🟠 | 🟡 | ❌ | ❌ |

> **Định vị khác biệt:** Reborn sẽ là **"Clinic CRM-HIS tích hợp Marketing & Loyalty"** — tập trung vào phân khúc phòng khám tư nhân hạng sang (thẩm mỹ, nha khoa, sản phụ khoa, da liễu, IVF) — nơi có nhu cầu Marketing/Loyalty cao và ngân sách tốt hơn BV công.

---

## 7. RỦI RO & KHUYẾN NGHỊ

### 7.1. Rủi ro chính

| # | Rủi ro | Mức độ | Mitigation |
|---|---|---|---|
| 1 | Không có kinh nghiệm y khoa trong team | Cao | Tuyển Product Manager/BA có background y tế; hợp tác với BS cố vấn |
| 2 | Pháp lý BHYT XML 4210 rất phức tạp | Rất cao | Delay Phase 3, trước tiên làm không-BHYT |
| 3 | Trách nhiệm pháp lý khi sai sót y khoa (missed allergy, wrong dose) | Rất cao | Không tự xây drug database, dùng provider (Vidal, FirstDatabank VN) |
| 4 | Tích hợp thiết bị y tế mỗi máy mỗi khác | Trung bình | Dùng Mirth Connect middleware |
| 5 | Chứng nhận EMR BYT có thể kéo dài | Trung bình | Làm song song với Phase 2 |
| 6 | Bán hàng BV cần relationship + đấu thầu | Cao | Hợp tác với System Integrator (FPT, CMC) cho BV công |

### 7.2. Khuyến nghị chiến lược

1. **KHÔNG** cạnh tranh trực diện với FPT.eHospital ở phân khúc BV hạng I-TW trong 24 tháng.
2. **TẬP TRUNG** phân khúc phòng khám tư nhân hạng sang (thẩm mỹ, nha khoa, sản phụ khoa, da liễu, IVF, clinic thể thao).
3. **GHÉP NỐI** với các Clinic Chain đang mở rộng (Vinmec Clinic, Hồng Ngọc Phúc Trường Minh, Medlatec, Diag, 115 Lotus, Hùng Vương Tư nhân...) để trở thành platform chuẩn.
4. **ĐẦU TƯ SỚM** vào compliance: giấy phép ISO 27001, HIPAA-like, ISO 13485 (nếu có thiết bị y tế).
5. **CO-DESIGN** với 2-3 BS chuyên khoa đầu ngành để tránh "engineer-only HIS" (lỗi thường gặp của HIS VN).

---

**Ngày lập:** 23/04/2026
**Người lập:** Đội giải pháp Reborn
**Tài liệu liên quan:**
- `docs/proposals/GAP-ANALYSIS-ERP-ENTERPRISE.md`
- `docs/proposals/PRICING-PROPOSAL.md`
