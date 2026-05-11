# PHÂN TÍCH PHÂN BỔ CAPEX — Pricing Loyalty Platform

**Mục đích:** Trả lời 2 câu hỏi:
1. **Thông lệ phân bổ khấu hao CAPEX** cho phần mềm B2B bán cho doanh nghiệp vừa và nhỏ (SME / mid-market) là **bao nhiêu khách** thì hết?
2. Nếu áp dụng phân bổ tiêu chuẩn đó vào giá chào thì **pricing mới** của Reborn Loyalty sẽ thế nào?

**CAPEX đã bỏ ra:** ~11,7 tỷ (chi phí build platform, sunk cost)
**Ngày lập:** 23/04/2026 · **Phiên bản:** 1.0

> 🔒 **Tài liệu nội bộ** — phân tích tài chính / pricing strategy cho BOD. Không gửi khách.

---

## 1. KHÁI NIỆM — CAPEX ALLOCATION LÀ GÌ?

**CAPEX (Capital Expenditure)** trong SaaS = chi phí đã bỏ ra để xây dựng phần mềm (sunk cost). Theo chuẩn kế toán (VAS 04 / IFRS IAS 38), đây là **tài sản vô hình** — khấu hao theo thời gian sử dụng.

Trong pricing B2B SaaS, CAPEX được thu hồi qua doanh thu nhiều khách hàng theo 2 cách song song:

### 1.1. Phân bổ theo THỜI GIAN (Amortization — góc nhìn kế toán)
- Useful life thông thường: **5 năm** (phần mềm B2B VN chuẩn VAS)
- Range phổ biến: 3 – 10 năm tuỳ loại phần mềm
- Công thức: `Khấu hao/năm = CAPEX / useful_life`

### 1.2. Phân bổ theo SỐ KHÁCH (Unit Economics — góc nhìn pricing)
- Số khách kỳ vọng để hoàn vốn CAPEX
- Công thức: `CAPEX/customer = CAPEX / N_target_customers`
- Đây là con số quyết định **price floor** khi chào khách

Hai cách này phải **nhất quán**: trong useful life (VD 5 năm), Reborn phải bán đủ N khách để thu hồi CAPEX. Nếu không → lỗ vốn hoặc phải kéo dài recovery → margin âm.

---

## 2. THÔNG LỆ PHÂN BỔ — BENCHMARK NGÀNH

### 2.1. Theo phân khúc thị trường (ACV — Annual Contract Value)

| Phân khúc | ACV trung bình | Số khách để hoàn vốn CAPEX | Ví dụ |
|-----------|-----------------|------------------------------|-------|
| **Mass SaaS cho SME nhỏ** | < $10K / năm | 500 – 3.000 khách | Slack Free/SME, Canva SME, KiotViet SME |
| **Mid-market SaaS** | $10K – $50K / năm | **50 – 200 khách** | MISA AMIS, Base HRM, Bravo ERP |
| **Upper-mid / Vertical SaaS** ⭐ | **$50K – $200K / năm** | **15 – 30 khách** | Vertical (retail/loyalty/banking), Reborn Loyalty thuộc nhóm này |
| **Enterprise SaaS** | > $200K / năm | 5 – 15 khách | SAP, Oracle, SFDC Enterprise |
| **Niche vertical** | > $500K / năm | 3 – 10 khách | Core banking, Bloomberg Terminal |

### 2.2. Theo cách tiếp cận tài chính

| Approach | Số khách target | Phù hợp khi | Rủi ro |
|----------|-----------------|-------------|--------|
| **Aggressive (3-year payback)** | 10 – 15 khách | Có VC backing, thị trường nóng | Giá chào cao, khó thắng deal |
| **Balanced (5-year payback)** ⭐ | **15 – 25 khách** | **Bootstrap / scale-up giai đoạn mid** | Cân bằng — đề xuất cho Reborn |
| **Conservative (7-year payback)** | 25 – 40 khách | Công ty lớn, ổn định, market bão hoà | Margin mỏng, áp lực cash flow |
| **Mass adoption** | 100+ khách | Mass market SaaS | Chỉ phù hợp khi ACV thấp |

### 2.3. Đặc thù thị trường Việt Nam

| Phân khúc khách | ACV USD | ACV VND | Số khách recovery thường thấy |
|------------------|---------|---------|-------------------------------|
| SME ≤ 10 NV / ≤ 10 store | $500 – $5K | 12 – 120 triệu | 1.000 – 5.000 khách |
| SMB / Mid-small (10–50 NV) | $5K – $20K | 120 – 500 triệu | 200 – 800 khách |
| Mid-market (50–500 NV / store) | $20K – $80K | 500tr – 2 tỷ | **50 – 150 khách** |
| **Upper-mid market** ⭐ | **$80K – $200K** | **2 – 5 tỷ** | **15 – 30 khách** |
| Enterprise (500+ NV / 500+ store) | $200K+ | 5+ tỷ | 5 – 15 khách |

---

## 3. BỐI CẢNH REBORN LOYALTY — CHỌN N PHÙ HỢP

### 3.1. Phân tích phân khúc Reborn

| Tiêu chí | Giá trị |
|----------|---------|
| ACV gói STANDARD (năm 1) | 1.890 triệu VND ≈ $75K USD |
| ACV gói STANDARD (năm 2+) | 820 triệu ≈ $33K USD |
| ACV trung bình 3 năm | 1.177 triệu ≈ $47K USD |
| Phân khúc theo ACV | **Upper-mid market** (vertical retail) |
| Target khách | Chuỗi bán lẻ 100–1.500 store, 1M+ KHTV |

### 3.2. Quy mô thị trường Việt Nam (2026)

| Nhóm khách target | Số doanh nghiệp thị trường VN |
|-------------------|-------------------------------|
| Chuỗi siêu thị lớn (>100 store) | 15–20 (Winmart, BHX, Coopmart, LottE, AEON, Kingfoodmart...) |
| Chuỗi dược phẩm lớn (>50 điểm) | 10–15 (Pharmacity, Long Châu, An Khang, Trung Sơn...) |
| Chuỗi F&B / cà phê (>100 điểm) | 20–30 (Highlands, Phuc Long, The Coffee House, Trung Nguyên...) |
| Chuỗi thời trang / bán lẻ khác | 30–50 (Canifa, Elise, Juno, Giao Hàng Siêu Rẻ...) |
| **Tổng market target upper-mid** | **~75–115 doanh nghiệp** |

### 3.3. Số khách Reborn có thể thắng được (realistic)

- **Thị phần mục tiêu 3 năm đầu:** 5–10% thị trường = 5–10 khách
- **Thị phần mục tiêu 5 năm:** 10–20% = 10–25 khách
- **Thị phần mục tiêu 7 năm:** 15–30% = 15–35 khách

### 3.4. Đề xuất N = 15 khách (5 năm payback) ⭐

| Tiêu chí | Đánh giá |
|----------|----------|
| ACV gói Reborn phù hợp với bracket | Upper-mid ($50K–$200K) → 15–30 khách |
| Quy mô thị trường VN | 75–115 khách target → 15 khách = 13–20% thị phần khả thi |
| Bootstrap company (không có VC áp lực 3-year) | 5 năm payback hợp lý |
| Useful life phần mềm (VAS 5 năm) | Khớp với 5-year recovery |
| So với benchmark vertical SaaS | 15 khách là median cho upper-mid vertical |

→ **Kết luận: Reborn nên target phân bổ CAPEX cho 15 khách trong 5 năm.**

**Các tham chiếu khác:**
- Aggressive (nếu có VC + áp lực tăng trưởng): **N = 10**, 3-year payback
- Conservative (nếu thị trường khó hoặc cạnh tranh cao): **N = 20**, 7-year payback

---

## 4. CÔNG THỨC TÍNH GIÁ CHÀO THEO CAPEX ALLOCATION

### 4.1. Framework

```
Giá chào 3 năm (TCV) = Cost operational 3Y   
                     + CAPEX allocation        
                     + Margin target           
```

Trong đó:
- **Cost operational 3Y (STANDARD):** 3.035 triệu (đã tính ở §4 phân tích chính — impl + infra + personnel)
- **CAPEX allocation/khách:** 11.700 / N
- **Margin target:** % trên tổng (khuyến nghị 20–25% cho vertical SaaS)

### 4.2. Bảng CAPEX/khách theo các kịch bản N

| N (số khách hoàn vốn) | CAPEX/khách | Payback period | Rủi ro |
|------------------------|-------------|-----------------|--------|
| N = 10 (aggressive) | 1.170 triệu | 3–4 năm | Cao — giá chào cao, khó thắng deal |
| **N = 15 (balanced)** ⭐ | **780 triệu** | **5 năm** | **Trung bình — khuyến nghị** |
| N = 20 (conservative) | 585 triệu | 5–7 năm | Thấp — dễ thắng deal nhưng chậm thu hồi |
| N = 25 | 468 triệu | 6–8 năm | Thấp — chậm |
| N = 30 | 390 triệu | 7–10 năm | Rất thấp — phù hợp mass market |

### 4.3. Pricing tính lại — Gói STANDARD (margin target 20%)

```
Giá 3Y = (Cost ops + CAPEX allocation) / (1 − margin%)
       = (3.035 + CAPEX/N) / 0.80
```

| N | Cost ops 3Y | CAPEX/khách | Subtotal | Giá 3Y (margin 20%) | Giá/năm TB |
|---|-------------|-------------|----------|---------------------|------------|
| 10 | 3.035 | 1.170 | 4.205 | **5.256** | 1.752 |
| **15** ⭐ | **3.035** | **780** | **3.815** | **4.769** | **1.590** |
| 20 | 3.035 | 585 | 3.620 | 4.525 | 1.508 |
| 25 | 3.035 | 468 | 3.503 | 4.379 | 1.460 |
| 30 | 3.035 | 390 | 3.425 | 4.281 | 1.427 |

---

## 5. PRICING MỚI — REBORN v1.2 (CAPEX ALLOCATION TƯỜNG MINH, N=15)

### 5.1. Breakdown đề xuất theo năm — STANDARD

Áp dụng TCV 4.769 triệu cho 3 năm, phân bổ:

**Option A — Cân đối theo năm (flat distribution):**

| Năm | Doanh thu | Ghi chú |
|-----|-----------|---------|
| Năm 1 | 2.150 | 45% tổng (cao hơn nhờ impl) |
| Năm 2 | 1.310 | 27% |
| Năm 3 | 1.309 | 27% |
| **Tổng 3Y** | **4.769** | **100%** |

**Option B — Front-loaded (khuyến nghị — giống thông lệ B2B)** ⭐

| Năm | Doanh thu | Ghi chú |
|-----|-----------|---------|
| Năm 1 | 2.550 | 53% tổng — bao gồm impl + license + CAPEX chính |
| Năm 2 | 1.110 | 23% — subscription + maintenance |
| Năm 3 | 1.109 | 23% — subscription + maintenance |
| **Tổng 3Y** | **4.769** | **100%** |

### 5.2. Pricing mới cho 3 gói — N = 15, margin 20%

| Gói | Cost ops 3Y | CAPEX (N=15) | Subtotal | **Giá 3Y mới** | Giá Y1 | Giá Y2+ |
|-----|-------------|--------------|----------|------------------|--------|---------|
| STARTER | 1.840 | 450 (phân bổ nhẹ hơn, SME) | 2.290 | **2.863** | 1.425 | 720/năm |
| **STANDARD** ⭐ | **3.035** | **780** | **3.815** | **4.769** | **2.550** | **1.110/năm** |
| PREMIUM | 4.540 | 1.110 (cao hơn, enterprise-tier) | 5.650 | **7.063** | 3.820 | 1.620/năm |

*Ghi chú phân bổ CAPEX theo tier:* STARTER giảm 40% (khách SME giá thấp), PREMIUM tăng 40% (khách enterprise chịu được phân bổ cao hơn) so với STANDARD base 780tr. Weighted average vẫn ≈ 780tr × 15 = 11.700tr.

---

## 6. SO SÁNH PRICING — 3 PHIÊN BẢN

### 6.1. Bảng tổng hợp 3 phiên bản giá

| Gói | v1.0 (gốc) | v1.1 (giảm 20%) | **v1.2 (CAPEX đúng N=15)** |
|-----|-----------|------------------|------------------------------|
| STARTER Y1 | 890 | 712 | **1.425** (+60%) |
| STANDARD Y1 | 1.890 | 1.512 | **2.550** (+35%) |
| PREMIUM Y1 | 2.990 | 2.392 | **3.820** (+28%) |
| STANDARD 3Y TCV | 3.530 | 2.824 | **4.769** |

### 6.2. Implicit CAPEX allocation của từng phiên bản

| Phiên bản | Implicit CAPEX/khách | N thực tế để hoàn vốn | Payback |
|-----------|----------------------|-------------------------|---------|
| v1.0 (gốc) | ~688 tr | 17 khách | ~5,75 năm (với 3 khách/năm) |
| v1.1 (−20%) | ~0 – 280 tr (âm nhẹ) | 42+ khách | Không hòa vốn trong 10 năm (3 khách/năm) |
| **v1.2 (N=15)** ⭐ | **780 tr (tường minh)** | **15 khách** | **5 năm đảm bảo** |

### 6.3. Margin so sánh (3 năm)

| Phiên bản | STARTER | STANDARD | PREMIUM |
|-----------|---------|----------|---------|
| v1.0 | +2% | +14% | +16% |
| v1.1 | −23% | −7% | −5% |
| **v1.2** ⭐ | **+18%** | **+20%** | **+22%** |

---

## 7. PHÂN TÍCH ĐỘ NHẠY — THAY ĐỔI N

Giả sử Reborn muốn target margin 20% STANDARD, giá chào tương ứng với các N khác:

| N | Giá STANDARD Y1 | Giá 3Y TCV | % tăng vs v1.0 | Khả thi thị trường? |
|---|-----------------|-------------|-----------------|---------------------|
| 10 | 2.800 | 5.256 | +48% | Khó — chỉ deal chiến lược |
| 12 | 2.670 | 5.013 | +42% | Khó trung bình |
| **15** ⭐ | **2.550** | **4.769** | **+35%** | **Hợp lý** |
| 18 | 2.440 | 4.569 | +29% | Dễ thắng |
| 20 | 2.400 | 4.525 | +28% | Dễ thắng |
| 25 | 2.310 | 4.379 | +24% | Rất dễ thắng |
| 30 | 2.270 | 4.281 | +21% | Rất dễ thắng nhưng chậm thu hồi |

### Trade-off chính:

- **N nhỏ (10–12):** Giá cao → khó thắng deal → chậm recovery → rủi ro cao
- **N 15 (balanced):** Giá hợp lý → 13–20% thị phần → recovery 5 năm → **khuyến nghị**
- **N lớn (25–30):** Giá thấp → dễ thắng → nhưng CAPEX recovery chậm 7–10 năm

---

## 8. CHIẾN LƯỢC ÁP DỤNG THỰC TẾ

### 8.1. Vấn đề: Giá v1.2 CAPEX-đúng CAO HƠN v1.0 35%

Giá chuẩn CAPEX (2.550tr Y1) cao hơn giá gốc v1.0 (1.890tr Y1) tới **35%**, và cao hơn giá đang chào khách hiện tại v1.1 (1.512tr) tới **69%**.

Hậu quả:
- Khó thắng deal nếu khách so sánh với vendor khác
- Khách cảm thấy giá "vừa nâng vừa chào" → mất lòng tin

### 8.2. 3 phương án triển khai

#### Phương án 1 — Giữ pricing hiện tại, chấp nhận recovery dài

- Giữ v1.0 (3.530tr/khách 3Y) → recovery tại 17 khách, 5.75 năm
- v1.1 (2.824tr/khách 3Y) → recovery tại 42 khách, 8–9 năm
- **Không thay đổi gì về mặt chào khách, không áp lực sale**
- Kém hiệu quả tài chính nhưng thực tế khả thi

#### Phương án 2 — Chuyển dần sang v1.2 (N=15) theo lộ trình

| Thời điểm | Pricing | Target khách |
|-----------|---------|---------------|
| Q2/2026 (deal khách này) | v1.1 (đã chào, không rút lại) | Khách đầu tiên + case study |
| Q3–Q4/2026 | v1.0 (giá gốc không giảm) | 2–3 khách bán lẻ |
| 2027+ | v1.2 (CAPEX đúng, N=15) | 3–4 khách/năm, giá premium |

→ Dùng 1–2 khách đầu tiên để **đánh brand** (giá thấp), sau đó lên giá dần khi có case study.

#### Phương án 3 — Áp dụng v1.2 ngay, nhưng tách thành giá "premium" + gói "value"

- **Gói PREMIUM v1.2:** 3.820tr Y1 — với phân bổ CAPEX đúng, margin 22%
- **Gói STANDARD v1.0:** 1.890tr Y1 (giữ giá gốc, không giảm 20%)
- **Gói STARTER v1.0:** 890tr Y1 (làm loss leader)
- Khách có thể chọn — ai cần ML/Marketing Auto thì trả PREMIUM (hoàn vốn CAPEX nhanh từ gói này)

### 8.3. Khuyến nghị cuối cùng ⭐

**Với bài toán hiện tại của Reborn:**

1. **Deal khách chuỗi siêu thị này:** Giữ nguyên v1.1 (1.512tr) — đã chào, không rút. **Upsell add-ons aggressively** để kéo ARV thực tế lên ~2.000tr → giảm thiểu lỗ.

2. **Deal 2–3 khách tiếp theo trong 2026:** Quay về **v1.0 (giá gốc)**, thêm "ưu đãi early customer −10%" → giá thực tế 1.700tr Y1. Margin 3Y ~8–10%, hòa vốn ở 22–25 khách.

3. **Deal từ 2027 trở đi:** Chuyển sang **v1.2 (CAPEX-đúng, N=15)** với mức **giảm ưu đãi linh hoạt**:
   - Giá niêm yết công khai: **2.550tr Y1** (v1.2)
   - Deal size lớn (>3 tỷ TCV): có thể giảm 10–15%
   - Deal chiến lược: có thể giảm 20%
   - Giữ "giá thực" trung bình 2.100–2.300tr → margin 15–18% ổn định

4. **Target recovery:**
   - 15 khách STANDARD trong 5 năm (balanced)
   - Mix: 3 STARTER + 10 STANDARD + 2 PREMIUM (realistic cho VN)
   - CAPEX 11,7 tỷ / weighted ACV → recovery Q3–Q4/2030

---

## 9. TÓM TẮT NGẮN (Key Numbers)

| Metric | Giá trị |
|--------|---------|
| CAPEX Reborn đã đầu tư | **11,7 tỷ** |
| Phân bổ tiêu chuẩn ngành (vertical mid-market SaaS) | **15 khách / 5 năm** |
| CAPEX/khách nếu phân bổ N=15 | **780 triệu** |
| Giá STANDARD mới v1.2 (CAPEX đúng, margin 20%) | **Y1: 2.550tr  ·  3Y TCV: 4.769tr** |
| So với v1.0 hiện tại | **+35%** |
| So với v1.1 đã chào khách | **+69%** |
| Margin v1.2 STANDARD 3 năm | **+20%** (mục tiêu đạt) |
| Break-even v1.2 | **15 khách · 5 năm** (đúng target) |

---

*Tài liệu phân tích nội bộ — Reborn JSC — 23/04/2026.
Cập nhật khi thay đổi target phân khúc hoặc số tenant thực tế.*
