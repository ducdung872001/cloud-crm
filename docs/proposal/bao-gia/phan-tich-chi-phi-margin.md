# PHÂN TÍCH TÀI CHÍNH — Loyalty Platform cho chuỗi siêu thị bán lẻ

**Mục đích:** So sánh tổng thể 2 phương án cho khách (Tự xây vs Mua Reborn) và xác định **margin thực tế của Reborn** ở 3 gói đã chào.

**Phạm vi tham chiếu:** 2 brand, ~300 store, 3M KHTV, 150K txn/ngày, migration 4 hệ thống (Goldmem/Access/Excel/Supporter).

**Ngày lập:** 23/04/2026 · **Phiên bản báo giá:** v1.1 (đã giảm 20%)

> ⚠️ **Tài liệu nội bộ** — không gửi khách. Dùng để BOD ra quyết định pricing + margin.

---

## 1. TÓM TẮT ĐIỀU HÀNH

| Phương án | Chi phí khách (3 năm) | Thời gian go-live | Rủi ro |
|-----------|------------------------|-------------------|--------|
| **Tự xây in-house** | **10 – 12 tỷ** | 18 – 24 tháng | Rất cao (delay, scope creep, thiếu kinh nghiệm retail) |
| **Mua Reborn STARTER** | ~1,5 tỷ | 3 – 4 tháng | Thấp — nhưng chỉ 1 brand, thiếu migration đủ |
| **Mua Reborn STANDARD** ⭐ | **~2,8 tỷ** | 6 tháng | Thấp — phù hợp nhất bài toán khách |
| **Mua Reborn PREMIUM** | ~4,3 tỷ | 6 – 8 tháng | Thấp — full Marketing Auto + ML |

**Margin Reborn (gói STANDARD, chào khách 1.512 triệu):**

| Chỉ số | Năm 1 | Năm 2 | Năm 3 | Trung bình 3 năm |
|---------|-------|-------|-------|------------------|
| Doanh thu | 1.512 | 656 | 656 | **2.824 triệu / 3 năm** |
| Chi phí Reborn | 950 | 450 | 450 | 1.850 triệu |
| **Lợi nhuận** | **562** | **206** | **206** | **974 triệu** |
| **Margin** | **37%** | **31%** | **31%** | **34%** |

---

## 2. PHƯƠNG ÁN A — TỰ XÂY IN-HOUSE

### 2.1. Team cần thiết (phạm vi tương đương STANDARD)

| Vai trò | Số người | Thời gian tham gia | Lương TB (triệu/tháng) |
|---------|----------|---------------------|------------------------|
| Tech Lead / Architect | 1 | 18 tháng | 60 |
| Senior Backend (Java/Spring) | 3 | 18 tháng | 40 |
| Senior Frontend (React) | 2 | 15 tháng | 35 |
| DBA / Data Engineer | 1 | 12 tháng (migration + tuning) | 35 |
| DevOps / SRE | 1 | 12 tháng | 40 |
| QA / Test Engineer | 1 | 15 tháng | 25 |
| Business Analyst | 1 | 12 tháng | 30 |
| Project Manager | 1 | 18 tháng | 45 |
| **Tổng FTE** | **11** | TB ~15 tháng | |

### 2.2. Chi phí chi tiết (triệu VND)

| Hạng mục | Chi phí | Ghi chú |
|----------|---------|---------|
| Tech Lead (18 tháng × 60) | 1.080 | |
| 3 BE × 18 tháng × 40 | 2.160 | |
| 2 FE × 15 tháng × 35 | 1.050 | |
| DBA × 12 tháng × 35 | 420 | |
| DevOps × 12 tháng × 40 | 480 | |
| QA × 15 tháng × 25 | 375 | |
| BA × 12 tháng × 30 | 360 | |
| PM × 18 tháng × 45 | 810 | |
| **Tổng lương** | **6.735** | |
| Overhead (văn phòng, thiết bị, BHXH, thuế, phúc lợi) 40% | 2.694 | |
| License dev tools (IDE, Jira, CI/CD, monitoring) | 150 | |
| Cloud dev/staging (18 tháng) | 360 | |
| Tư vấn bên ngoài (UX, security audit) | 250 | |
| **Chi phí kỹ thuật** | **10.189** | |
| Dự phòng rủi ro / scope creep (15%) | 1.528 | |
| **TỔNG CHI PHÍ TỰ XÂY** | **~11,7 tỷ** | Chưa tính cost chạy thử + hạ tầng production năm 1 |

### 2.3. Thời gian

- **Tháng 1–3:** Khảo sát, kiến trúc, UX design, POC
- **Tháng 4–9:** MVP core loyalty (hội viên, tích điểm, hạng, đổi thưởng)
- **Tháng 10–14:** Migration ETL + POS integration + CSKH module + Marketing automation
- **Tháng 15–18:** Testing, UAT, pilot 5-10 store
- **Tháng 19–24:** Rollout toàn chuỗi, hardening, đào tạo

**Thực tế tại VN:** 18 tháng là trường hợp lý tưởng, **trung vị 22–28 tháng** với các dự án tương tự do:
- Nhân sự retail-loyalty hiếm, tuyển dụng 3–6 tháng
- Scope creep khi stakeholder thay đổi yêu cầu
- Test/migration 3M KHTV edge cases nhiều

### 2.4. Rủi ro tự xây

| Rủi ro | Xác suất | Tác động |
|---------|----------|----------|
| Delay 6–12 tháng | Cao (60%) | +2–4 tỷ chi phí, lỡ cơ hội kinh doanh |
| Nhân sự nghỉ giữa chừng | Trung bình (40%) | Onboarding lại, chậm 2–3 tháng |
| Hiệu năng không đạt ở peak 300K txn/ngày | Trung bình (35%) | Refactor DB, cache, queue |
| Thiếu experience retail-specific edge cases | Cao (55%) | Rework features sau go-live |
| Chi phí đội > 30% ngân sách | Rất cao (70%) | ≥ 15 tỷ tổng thay vì 11,7 tỷ |

---

## 3. PHƯƠNG ÁN B — MUA REBORN (3 GÓI)

Chi tiết đã có trong [Bao-gia-Loyalty-Platform.docx](Bao-gia-Loyalty-Platform.docx). Tóm tắt 3 năm:

| Gói | Năm 1 | Năm 2 | Năm 3 | **3-year TCV** |
|-----|------:|------:|------:|----------------:|
| STARTER | 712 | 392 | 392 | **1.496 triệu** |
| STANDARD ⭐ | 1.512 | 656 | 656 | **2.824 triệu** |
| PREMIUM | 2.392 | 960 | 960 | **4.312 triệu** |

*Đơn vị: triệu VND, trước VAT, chưa tính scale pack khi mở rộng cửa hàng.*

**So sánh với tự xây (STANDARD):** 2,8 tỷ vs 11,7 tỷ → **khách tiết kiệm ~8,9 tỷ + 12–18 tháng thời gian**.

---

## 4. CHI PHÍ VẬN HÀNH SAAS — GÓC NHÌN REBORN

Giả định Reborn vận hành SaaS multi-tenant cho khách STANDARD. Tính **per-tenant** với 3 mức kinh tế quy mô (số tenant chia sẻ infra + team):

### 4.1. Chi phí hạ tầng (infrastructure) — hàng năm

| Hạng mục | Spec | Chi phí (triệu/năm) |
|----------|------|----------------------|
| Application servers (3 VM × 8 vCPU 32GB) | VNG/FPT Cloud VN | 120 |
| Database managed MySQL (16 vCPU, 64GB RAM, 2TB SSD, HA) | RDS-equivalent | 300 |
| Redis cache (2 nodes 8GB) | Managed | 60 |
| RabbitMQ cluster (2 nodes) | Self-hosted trên VM | 48 |
| Load balancer + NAT gateway | Managed | 36 |
| Object storage (backups + files, ~2TB) | S3-like | 36 |
| CDN + bandwidth (3M users traffic) | Cloudflare/BunnyCDN | 60 |
| Monitoring (Datadog / New Relic) | APM 5 hosts | 48 |
| DR / Backup site (warm standby) | Secondary region | 96 |
| SMS gateway base fee | Brandname + 50K SMS/tháng | 60 |
| Email service (SendGrid / SES) | 500K emails/tháng | 24 |
| **Tổng hạ tầng (dedicated, 1 tenant)** | | **888 / năm** |
| **Tổng hạ tầng (multi-tenant, 10 tenant chia sẻ)** | Giảm ~60% nhờ shared DB/Redis/monitoring | **~350 / năm / tenant** |

> Ghi chú: Nếu khách chọn **Dedicated (không chia sẻ)**, chi phí thực là 888tr/năm → Reborn thu 240tr hosting/năm **sẽ lỗ**. Thực tế Dedicated cộng thêm phụ phí trong gói PREMIUM (DR + Dedicated 72tr).

### 4.2. Chi phí nhân sự (personnel) — phân bổ mỗi tenant STANDARD

Team vận hành SaaS chung của Reborn:

| Vai trò | Số FTE cần cho 10 khách STANDARD | Lương (triệu/tháng) | Chi phí/năm |
|---------|------------------------------------|---------------------|-------------|
| DevOps / SRE | 2 | 40 | 960 |
| Support engineer L2 | 2 | 30 | 720 |
| DBA (part-time) | 1 | 35 | 420 |
| Customer Success Manager | 2 (mỗi CSM 5 khách) | 30 | 720 |
| Tech Lead (fix bug phức tạp, part-time) | 1 | 60 | 720 |
| **Tổng team lõi (trước overhead)** | 8 | | 3.540 |
| Overhead 35% (BHXH, office, tools, training) | | | 1.239 |
| **Tổng nhân sự vận hành** | | | **4.779 / năm cho 10 khách** |
| **Phân bổ 1 khách STANDARD** | | | **~480 / năm / khách** |

Nếu chỉ có 3-5 tenant (giai đoạn đầu): 4.779 / 5 = **~960tr/năm/khách** (cao, margin mỏng).

### 4.3. Chi phí implementation (one-time, năm 1)

Với từng khách mới, Reborn tốn công triển khai (đã có platform sẵn, chỉ cần customize + migration + integration):

| Hạng mục | Man-days | Chi phí (triệu, @2–2,5tr/day) |
|----------|----------|-------------------------------|
| Khảo sát + mapping 4 hệ thống (BA + Tech Lead) | 20 | 50 |
| ETL pipeline + dedupe + import 3M record | 60 | 120 |
| Tích hợp POS 2 brand (~300 store config) | 40 | 80 |
| Tích hợp Website + Mobile App | 25 | 50 |
| Module CSKH setup | 20 | 40 |
| Config rule điểm/hạng/hạn + Dashboard custom | 15 | 30 |
| QA + UAT + load test | 25 | 50 |
| Project Management (PM) | 30 × 2,5 | 75 |
| **Tổng impl labor** | | **495** |
| Contingency 10% | | 50 |
| **Tổng implementation cost / khách** | | **~545 / khách** |

### 4.4. Tổng chi phí Reborn (theo gói, multi-tenant ~10 khách)

| Hạng mục | STARTER | STANDARD | PREMIUM |
|----------|---------|----------|---------|
| **Năm 1: Implementation** | 280 | 545 | 820 |
| **Năm 1: Infrastructure** | 200 | 350 | 540 (dedicated) |
| **Năm 1: Personnel allocation** | 320 | 480 | 700 |
| **Tổng cost năm 1** | **800** | **1.375** | **2.060** |
| **Năm 2+: Infrastructure** | 200 | 350 | 540 |
| **Năm 2+: Personnel** | 320 | 480 | 700 |
| **Tổng cost năm 2+** | **520** | **830** | **1.240** |

---

## 5. MARGIN TÍNH TOÁN — THEO GÓI

### 5.1. Gói STARTER (712 triệu năm 1)

| Năm | Doanh thu | Cost | **Lợi nhuận** | **Margin** |
|-----|-----------|------|----------------|-------------|
| Năm 1 | 712 | 800 | **−88** | **−12%** ⚠️ |
| Năm 2 | 392 | 520 | **−128** | **−33%** ⚠️ |
| Năm 3 | 392 | 520 | **−128** | **−33%** ⚠️ |
| **3-year** | **1.496** | **1.840** | **−344** | **−23%** ⚠️ |

> 🚨 **Cảnh báo:** Gói STARTER sau giảm 20% đang **âm margin** ở giả định tenant thấp (3-5). Để hoà vốn cần:
> - Multi-tenant 15+ khách (phân bổ personnel giảm còn ~250tr/khách)
> - Hoặc đẩy giá STARTER về mức 850–900tr
> - Hoặc chỉ xem STARTER là **"loss leader"** — bán để lấy cửa vào rồi upsell STANDARD/PREMIUM

### 5.2. Gói STANDARD (1.512 triệu năm 1) — GÓI CHÍNH

| Năm | Doanh thu | Cost | **Lợi nhuận** | **Margin** |
|-----|-----------|------|----------------|-------------|
| Năm 1 | 1.512 | 1.375 | **137** | **9%** |
| Năm 2 | 656 | 830 | **−174** | **−27%** ⚠️ |
| Năm 3 | 656 | 830 | **−174** | **−27%** ⚠️ |
| **3-year** | **2.824** | **3.035** | **−211** | **−7%** ⚠️ |

> 🚨 **Gói STANDARD sau giảm 20% đang lỗ nhẹ 3 năm.** Phí năm 2+ (656tr) chưa đủ bù personnel + hosting (830tr).

**Cách cân bằng:**
1. **Multi-tenant 10+ khách**: phân bổ personnel giảm từ 480tr → ~300tr/khách → margin 3-year ~20%
2. **Bán kèm add-ons** (gamification, mini-app Zalo, ERP...) — mỗi add-on margin ~50% vì dùng template
3. **Nâng phí năm 2+** lên 800tr (thay vì 656tr) — cân bằng được
4. **Cam kết 3 năm giảm 15%** (đã có trong báo giá) — khách trả 2.400tr × 0.85 = 2.040tr trước, Reborn thu trước → lãi suất tiền mặt

### 5.3. Gói PREMIUM (2.392 triệu năm 1)

| Năm | Doanh thu | Cost | **Lợi nhuận** | **Margin** |
|-----|-----------|------|----------------|-------------|
| Năm 1 | 2.392 | 2.060 | **332** | **14%** |
| Năm 2 | 960 | 1.240 | **−280** | **−29%** ⚠️ |
| Năm 3 | 960 | 1.240 | **−280** | **−29%** ⚠️ |
| **3-year** | **4.312** | **4.540** | **−228** | **−5%** ⚠️ |

> **Tương tự STANDARD**. Giá giảm 20% đang ép margin quá mỏng nếu tenant ít. Premium cần:
> - 8+ khách cùng quy mô để phân bổ personnel
> - Bán thêm add-ons (mini-app Zalo 176tr, SDK 144tr, ISO consulting 144tr...) — mỗi add-on margin 40–60%

---

## 6. PHÂN TÍCH ĐỘ NHẠY — SỐ TENANT

**Câu hỏi:** Margin gói STANDARD thay đổi thế nào khi số tenant tăng/giảm?

| Số tenant chia sẻ | Personnel allocation / tenant | Cost năm 2+ (STD) | Doanh thu năm 2+ | Margin năm 2+ |
|-------------------|-------------------------------|-------------------|------------------|----------------|
| 2 (giai đoạn đầu) | 1.200 | 1.550 | 656 | **−58%** 🔴 |
| 3 | 800 | 1.150 | 656 | **−43%** 🔴 |
| 5 | 480 | 830 | 656 | **−27%** 🟡 |
| 7 | 340 | 690 | 656 | **−5%** 🟡 |
| 10 | 240 | 590 | 656 | **+10%** 🟢 |
| 15 | 160 | 510 | 656 | **+22%** 🟢 |
| 20 | 120 | 470 | 656 | **+28%** 🟢 |

**Break-even point:** ~8 tenant. Dưới mức này → lỗ năm 2+.

---

## 7. SO SÁNH DOANH THU / LỢI NHUẬN — 3 MÔ HÌNH BÁN

Với gói STANDARD, 3 mô hình pricing khác nhau:

| Mô hình | Năm 1 | Năm 2+ | 3-year Revenue | Ghi chú margin |
|---------|-------|--------|-----------------|----------------|
| **Milestone (mặc định)** | 1.512 | 656/năm | 2.824 | Margin ~34% nếu 10+ tenant |
| **One-time license + 18% maintenance** | 1.512 | 272 maint + 192 host = 464/năm | 2.440 | Maintenance lạc quan hơn nếu ít update |
| **Subscription SaaS (chia đều 5 năm)** | 730/năm | 730/năm | 3.650 (5 năm) | Margin cao hơn dài hạn nhờ lock-in |
| **Cam kết 3 năm (giảm 15% TCV)** | — | — | 2.400 | Tiền trước, giảm rủi ro, margin thực 29% |

---

## 8. ĐỀ XUẤT PRICING CHIẾN LƯỢC

### 8.1. Vấn đề hiện tại

Sau khi giảm 20% để cạnh tranh, các gói **margin mỏng hoặc âm** ở giai đoạn ít tenant (dưới 8 khách cùng quy mô). Rủi ro:
- Nếu chỉ bán được 2-3 khách đầu → Reborn lỗ ròng đáng kể
- Khó tái đầu tư vào product + team

### 8.2. 3 tuỳ chọn điều chỉnh

**Tuỳ chọn 1: Giữ nguyên giá đã giảm 20% — dùng cho khách chiến lược đầu tiên**
- Coi đây là "đầu tư thương hiệu" — có khách đầu tiên trong ngành bán lẻ lớn
- Margin thấp nhưng có case study, chứng minh sẵn sàng
- Chỉ áp dụng cho 1-2 khách lớn nhất

**Tuỳ chọn 2: Giảm 10% thay vì 20% — giá cân bằng hơn**
- STANDARD: 1.700tr (thay vì 1.512tr), margin năm 1 ~20%, 3-year margin ~18%
- Vẫn cạnh tranh so với vendor quốc tế (3.5-5 tỷ) và build in-house (11-12 tỷ)
- Khách cảm thấy đã được ưu đãi đáng kể

**Tuỳ chọn 3: Giữ giá giảm 20% nhưng tăng phí năm 2+**
- Năm 1 vẫn 1.512tr (dễ ký hợp đồng vì giá cạnh tranh)
- Năm 2+ tăng từ 656tr → 880tr (thay cho 820tr gốc)
- Sau 3 năm TCV: 3.272tr, margin ~22%
- Khó chịu hơn với khách vì cam kết dài

### 8.3. Khuyến nghị

**Với khách chuỗi siêu thị này (chiến lược):**
- Giữ gói STANDARD ở 1.512tr (đã giảm 20%)
- Upsell mạnh 3–5 add-ons: mini-app Zalo 176tr + SDK mobile 144tr + Marketing extensions
- Add-on margin cao ~50% (template sẵn) → bù được phần giảm 20% gốc
- Ước doanh thu thực tế sau upsell: **1.512tr + ~500tr add-ons = ~2.000tr năm 1**, margin quay lại 25-30%

**Với khách tiếp theo:**
- Giảm chỉ 10-12% mặc định
- Chỉ giảm 20% khi khách chiến lược / deal lớn

---

## 9. KẾT LUẬN SO SÁNH TỔNG THỂ

### 9.1. Cho khách hàng

| Tiêu chí | Tự xây | Reborn STANDARD |
|----------|--------|------------------|
| Chi phí 3 năm | 11–15 tỷ | 2,8 tỷ |
| Thời gian go-live | 18–24 tháng | 6 tháng |
| Rủi ro | Rất cao | Thấp |
| Tùy chỉnh | Tối đa | Cao (configurable) |
| Kiến thức retail-specific | Phải học | Đã có sẵn (20 tính năng) |
| **Kết luận** | Chỉ phù hợp khi có nhu cầu độc đáo, ngân sách dư, sẵn sàng 2 năm | **Phù hợp 95% khách bán lẻ** |

→ **Mua Reborn tiết kiệm ~70–80% chi phí + 3x nhanh hơn** so với tự xây.

### 9.2. Cho Reborn (nội bộ)

| Chỉ số | Giá trị |
|--------|---------|
| Chi phí build lại từ đầu (nếu phải) | ~11,7 tỷ + 18 tháng |
| Chi phí impl per-khách STANDARD | ~545 triệu (one-time) |
| Chi phí vận hành per-khách/năm | ~830 triệu (5-tenant) / ~590 triệu (10-tenant) |
| Doanh thu STANDARD năm 1 | 1.512 triệu |
| **Margin năm 1 (5-tenant)** | ~9% (cần upsell add-on để nâng lên 25–30%) |
| **Margin 3-year (10-tenant)** | ~25% |
| **Margin 3-year (sau upsell add-ons + cam kết 3 năm)** | ~30–35% |

### 9.3. Hành động đề xuất

1. **Với deal khách này:** Giữ giá 1.512tr, đẩy mạnh upsell add-ons để đạt margin thực tế 25–30%.
2. **Với các deal sau:** Mặc định giảm 10–12%, chỉ giảm sâu 20% khi chiến lược.
3. **Tuyển đủ 3–5 khách STANDARD** trong 12 tháng để đạt break-even tenant.
4. **Xem xét gói STARTER** là "loss leader" — đẩy khách lên STANDARD sau 6–12 tháng.
5. **Lock-in cam kết 3 năm** (đã giảm 15% TCV) ưu tiên hơn hợp đồng 1 năm — cash flow tốt, margin ổn.

---

---

## 10. SO SÁNH GIÁ GỐC (v1.0) vs GIẢM 20% (v1.1) — ĐIỂM HÒA VỐN

### 10.1. Giữ giá gốc v1.0 (không giảm 20%)

Giá gốc: STARTER 890tr / STANDARD 1.890tr / PREMIUM 2.990tr (năm 1).

**Margin theo gói (tenant = 10):**

| Gói | Y1 Revenue | Y1 Cost | Margin Y1 | Y2+ Rev | Y2+ Cost | Margin Y2+ | 3-year Margin |
|-----|-----------|---------|-----------|---------|----------|------------|----------------|
| STARTER | 890 | 800 | +11% | 490 | 520 | −6% | +2% |
| **STANDARD ⭐** | **1.890** | **1.375** | **+27%** | **820** | **830** | **−1%** | **+14%** |
| PREMIUM | 2.990 | 2.060 | +31% | 1.200 | 1.240 | −3% | +16% |

→ **Giá gốc có margin dương đáng kể ở năm 1** nhờ impl fee + license + cấu hình. Năm 2+ margin gần 0 (cần 10+ tenant để dương rõ).

### 10.2. Giá đã giảm 20% v1.1 (hiện tại)

| Gói | Y1 Margin | Y2+ Margin | 3-year Margin |
|-----|-----------|------------|----------------|
| STARTER | −12% | −33% | −23% ⚠️ |
| STANDARD ⭐ | +9% | −27% | −7% ⚠️ |
| PREMIUM | +14% | −29% | −5% ⚠️ |

### 10.3. So sánh chi tiết 2 pricing

| Tiêu chí | Giá GỐC v1.0 | Giảm 20% v1.1 | Chênh lệch |
|----------|---------------|----------------|-------------|
| Margin STANDARD Y1 | **+27%** | +9% | −18pp |
| Margin STANDARD Y2+ | −1% | −27% | −26pp |
| Margin STANDARD 3-year | **+14%** | −7% | −21pp |
| Lợi nhuận/khách STANDARD 3Y | +495 triệu | −211 triệu | −706 triệu/khách |
| Break-even tenant (Y2+) | **6 khách** | 8 khách | +2 khách |
| 3-year TCV/khách | 3.530 triệu | 2.824 triệu | −706 triệu |

### 10.4. Điểm hòa vốn ĐẦU TƯ PLATFORM (11,7 tỷ đã build)

**Giả định mô hình tài chính:**
- Chi phí đầu tư platform đã bỏ ra (sunk cost): **11,7 tỷ**
- Team chi phí cố định theo tenant bracket:
  - 1–5 khách: 2.400 tr/năm (4 FTE)
  - 6–10 khách: 3.800 tr/năm (6 FTE)
  - 11–15 khách: 5.000 tr/năm (8 FTE)
  - 16–20 khách: 6.400 tr/năm (10 FTE)
  - 21–25 khách: 7.500 tr/năm (12 FTE)
- Infra: 350 tr/năm/tenant (multi-tenant)
- Implementation: 545 tr one-time/tenant mới
- Giả định 0% churn, tất cả khách đều gói STANDARD

### 10.5. Kịch bản bán hàng — GIÁ GỐC v1.0

**Scenario A: 3 khách STANDARD mới / năm**

| Năm | Khách mới | Tổng active | Team | Infra | Impl | Doanh thu | Chi phí | Lãi năm | Luỹ kế | Số dư (−11,7 tỷ) |
|-----|-----------|-------------|------|-------|------|-----------|---------|---------|--------|-------------------|
| 1 | 3 | 3 | 2.400 | 1.050 | 1.635 | 5.670 | 5.085 | +585 | +585 | −11.115 |
| 2 | 3 | 6 | 3.800 | 2.100 | 1.635 | 8.130 | 7.535 | +595 | +1.180 | −10.520 |
| 3 | 3 | 9 | 3.800 | 3.150 | 1.635 | 10.590 | 8.585 | +2.005 | +3.185 | −8.515 |
| 4 | 3 | 12 | 5.000 | 4.200 | 1.635 | 13.050 | 10.835 | +2.215 | +5.400 | −6.300 |
| 5 | 3 | 15 | 5.000 | 5.250 | 1.635 | 15.510 | 11.885 | +3.625 | +9.025 | −2.675 |
| **6** | **3** | **18** | **6.400** | **6.300** | **1.635** | **17.970** | **14.335** | **+3.635** | **+12.660** | **+960** 🟢 |

→ **Break-even ≈ Năm 5 + 9 tháng  ·  ~17 khách cumulative**

**Scenario B: 5 khách STANDARD mới / năm** (aggressive sales)

| Năm | Khách mới | Tổng | Lãi năm | Luỹ kế | Số dư −11,7 tỷ |
|-----|-----------|------|---------|--------|-----------------|
| 1 | 5 | 5 | +1.135 | +1.135 | −10.565 |
| 2 | 5 | 10 | +2.215 | +3.350 | −8.350 |
| **3** | **5** | **15** | **+3.625** | **+6.975** | **−4.725** |
| **4** | **5** | **20** | **+5.125** | **+12.100** | **+400** 🟢 |

→ **Break-even ≈ Năm 3 + 11 tháng  ·  ~20 khách cumulative**

### 10.6. Kịch bản bán hàng — GIÁ GIẢM 20% v1.1

**Scenario A: 3 khách STANDARD / năm**

| Năm | Khách mới | Tổng | Doanh thu | Chi phí | Lãi năm | Luỹ kế | Số dư −11,7 tỷ |
|-----|-----------|------|-----------|---------|---------|--------|-----------------|
| 1 | 3 | 3 | 4.536 | 5.085 | −549 | −549 | −12.249 |
| 2 | 3 | 6 | 6.504 | 7.535 | −1.031 | −1.580 | −13.280 |
| 3 | 3 | 9 | 8.472 | 8.585 | −113 | −1.693 | −13.393 |
| 4 | 3 | 12 | 10.440 | 10.835 | −395 | −2.088 | −13.788 |
| 5 | 3 | 15 | 12.408 | 11.885 | +523 | −1.565 | −13.265 |
| 6 | 3 | 18 | 14.376 | 14.335 | +41 | −1.524 | −13.224 |
| 7 | 3 | 21 | 16.344 | 15.385 | +959 | −565 | −12.265 |
| 8 | 3 | 24 | 18.312 | 17.535 | +777 | +212 | −11.488 |

→ **KHÔNG hòa vốn trong 10 năm** với 3 khách/năm. Doanh thu thiếu hụt kinh niên. ⚠️

**Scenario B: 5 khách STANDARD / năm**

| Năm | Tổng khách | Lãi năm | Luỹ kế | Số dư −11,7 tỷ |
|-----|-----------|---------|--------|-----------------|
| 1 | 5 | +685 | +685 | −11.015 |
| 2 | 10 | +815 | +1.500 | −10.200 |
| 3 | 15 | +1.145 | +2.645 | −9.055 |
| 4 | 20 | +1.275 | +3.920 | −7.780 |
| 5 | 25 | +1.705 | +5.625 | −6.075 |
| 6 | 30 | +1.735 | +7.360 | −4.340 |
| 7 | 35 | +1.765 | +9.125 | −2.575 |
| 8 | 40 | +1.795 | +10.920 | −780 |
| **9** | **45** | **+2.050** | **+12.970** | **+1.270** 🟢 |

→ **Break-even ≈ Năm 8 + 5 tháng  ·  ~42 khách cumulative**

### 10.7. Bảng tổng hợp Break-even

| Pricing | Sales rate | Break-even (thời gian) | Break-even (số khách) |
|---------|-----------|------------------------|------------------------|
| **Giá GỐC v1.0** | 3 khách/năm | **5 năm 9 tháng** | ~17 khách |
| **Giá GỐC v1.0** | 5 khách/năm | **3 năm 11 tháng** | ~20 khách |
| **Giá GỐC v1.0** | 7 khách/năm | **2 năm 10 tháng** | ~20 khách |
| Giảm 20% v1.1 | 3 khách/năm | **Không hòa vốn** trong 10 năm ⚠️ | — |
| Giảm 20% v1.1 | 5 khách/năm | **8 năm 5 tháng** | ~42 khách |
| Giảm 20% v1.1 | 7 khách/năm | ~6 năm | ~42 khách |

### 10.8. Kết luận chiến lược pricing

**Nếu Reborn trở lại giá gốc v1.0:**
- Break-even đầu tư nhanh hơn **2–3 lần** (5–6 năm vs 8–10 năm)
- Margin STANDARD 3-year: **+14%** thay vì −7%
- Vẫn cạnh tranh vì rẻ hơn vendor quốc tế (3,5–5 tỷ) và tự xây (11,7 tỷ)
- Rủi ro: khách nhạy cảm với giá có thể chọn vendor khác

**Nếu giữ giảm 20% v1.1 (đã chào):**
- Chỉ nên dành cho **1–2 khách chiến lược** để mở thị trường bán lẻ
- Phải **tăng sales rate lên 5+ khách/năm** mới có cơ hội hòa vốn
- **BẮT BUỘC** upsell add-ons 30–50% doanh thu để kéo margin về +20%
- Đẩy mạnh cam kết 3 năm (giảm 15% tổng nhưng thu tiền trước)

**Đề xuất lộ trình pricing sắp tới:**

| Giai đoạn | Chính sách giá | Mục tiêu sales |
|-----------|----------------|----------------|
| 2026 Q2 (hiện tại — khách chuỗi siêu thị) | Giảm 20% (v1.1) để thắng deal chiến lược đầu tiên | 1 khách + case study |
| 2026 Q3–Q4 | Giảm 10% (mặc định) | 2–3 khách bán lẻ lớn |
| 2027+ | Giá gốc v1.0 (premium brand) | 4–5 khách/năm, break-even 2028-2029 |

---

*Tài liệu phân tích nội bộ — Reborn JSC — 23/04/2026.
Cập nhật khi có thay đổi pricing hoặc số tenant thực tế.*
