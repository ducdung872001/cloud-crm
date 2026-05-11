# OPEX — Chi phí vận hành nền tảng công nghệ TNPM

> **Bổ sung cho [`README.md`](./README.md)** — phần này chỉ tính OPEX (chi phí thường niên), KHÔNG phải CAPEX (cost build đã có trong methodology + xlsx).
> **Currency**: VND, blended Vietnam 2026 rate.
> **Quy mô TNPM hiện tại chưa khoá** → chia thành **4 segment S/M/L/XL** để TNTech/TNPM tự match.

## 1. Phân biệt 2 nhóm OPEX

| Nhóm | Là gì | Ai gánh trong các mô hình thương mại |
|---|---|---|
| **A. Platform Operating Cost (PlatOps)** | Chi phí giữ platform chạy: cloud infra, license tool, DevOps/SRE, L1/L2/L3 support, annual maintenance/patch, DR, compliance audit | Tuỳ engagement model: **Reborn gánh** nếu SaaS managed, **TNPM gánh** nếu on-premise / self-host |
| **B. Pass-through Usage Cost** | Chi phí dùng dịch vụ ngoài, scale theo volume: MSB transaction fee, SMS, Email, Zalo OA, sInvoice, push noti FCM | **TNPM gánh** (hoặc charge xuống khách cuối) — không phụ thuộc engagement |

> Khi chào TNPM, cần **tách rõ** 2 nhóm để tránh hiểu lầm "cost cao đột biến khi peak season". Pass-through scale theo volume thực tế.

## 2. Định nghĩa 4 segment

Chiều phân biệt: số dự án × số đơn vị × invoice/tháng (đầu ra) × concurrent users (peak).

| Segment | # Projects | # Units (space) | # Customers | Invoices/tháng | Payment tx/tháng | Concurrent users (peak ngày mồng 1–8) | Mô tả thực tế |
|---|---:|---:|---:|---:|---:|---:|---|
| **S — Pilot** | 1–3 | ≤ 500 | ≤ 2,000 | ~1,000 | ~700 | ~50 | Triển khai thử nghiệm 1-2 dự án chung cư hoặc nhà thấp tầng |
| **M — Mid-scale** | 4–15 | 500–3,000 | 2k–15k | 3k–15k | 2k–10k | 100–300 | Quy mô TNPM năm đầu — vài VP + 1 KCN nhỏ + vài chung cư |
| **L — Large (likely TNPM ROX Key hiện tại)** | 15–50 | 3k–15k | 15k–60k | 20k–60k | 15k–45k | 400–1,000 | Toàn bộ portfolio TNPM ROX Key — 7 loại property, multi-site |
| **XL — Enterprise** | 50+ | 15k+ | 60k+ | 80k+ | 60k+ | 1,500+ | Khi platform mở cho 3rd-party CĐT (Vinhomes Asset Mgmt, Sun Group, etc.) qua white-label |

> TNPM hiện tại theo HLD nói "7+ loại BĐS, nhiều dự án" — đoán là **L (Large)** hoặc top-end của **M**. Cần confirm với TNPM trong buổi discovery để chốt.

## 3. Platform Operating Cost (PlatOps) — Breakdown 9 component

Tất cả đơn vị: **triệu VND/tháng** (M = mil VND/month).

| # | Component | S | M | L | XL | Note |
|---|---|---:|---:|---:|---:|---|
| 1 | **Cloud Infrastructure** (compute, DB, cache, ES, S3, network) | 25 | 80 | 250 | 700 | K8s managed (EKS/GKE/VKE), Postgres HA, Redis, ES cluster, RabbitMQ, S3 archive 2 năm |
| 2 | **Licenses & Tools** | 8 | 15 | 30 | 60 | Monitoring (Grafana Cloud nếu không self-host), Snyk, SonarCloud, Jira/Confluence, Figma |
| 3 | **DevOps / SRE team** (FTE × loaded rate) | 22.5 | 45 | 100 | 220 | S: 0.5 FTE share; M: 1 FTE; L: 2 FTE + on-call; XL: 4 FTE + SRE Lead |
| 4 | **Application Support L1/L2/L3** | 15 | 35 | 90 | 220 | S: 0.5 L1 + on-demand; M: 1 L1 + 0.5 L2; L: 2 L1 + 1 L2 + 0.5 L3; XL: 4 L1 + 2 L2 + 1 L3 |
| 5 | **Annual Maintenance & Evolution** | 100 | 110 | 130 | 160 | Bug fix, security patch, minor feature evolution. ≈ 15-20% cost build/năm chia 12 |
| 6 | **Backup & DR** | 5 | 15 | 45 | 120 | Daily backup 30d retention, cross-AZ replica, RTO 4h / RPO 1h |
| 7 | **Compliance & Security Audit** | 10 | 15 | 25 | 40 | Annual pentest (80-150M/round) + NHNN audit (50-100M/year) chia 12 |
| 8 | **Training & Docs** | 3 | 8 | 15 | 30 | Onboarding TNPM staff mới, refresh training, KB articles |
| 9 | **Vendor management buffer** (kafka cloud / ES upgrade / unforeseen) | 10 | 20 | 50 | 100 | 5-10% PlatOps subtotal làm buffer |
| | **TỔNG PlatOps / tháng** | **~199M** | **~343M** | **~735M** | **~1,650M** | |
| | **TỔNG PlatOps / năm** | **~2.39 tỷ** | **~4.12 tỷ** | **~8.82 tỷ** | **~19.80 tỷ** | |

> **Sanity check**: L segment ≈ 8.8 tỷ/năm PlatOps ≈ **108% cost build (8.16 tỷ)**. Đây hợp lý vì:
> - Annual maintenance 15-20% = 1.2-1.6 tỷ
> - DevOps/SRE + L1-L3 = ~2.3 tỷ
> - Cloud infra L = ~3 tỷ
> - Còn lại license, DR, compliance, training, buffer ≈ ~2 tỷ
> - **Tỉ lệ OPEX/CAPEX = 1:1** là chuẩn industry cho SaaS B2B enterprise sau khi qua giai đoạn ramp-up.

## 4. Pass-through Usage Cost (theo volume thực tế)

Đơn giá tham chiếu thị trường VN 2026:

| Loại | Đơn giá tham chiếu | Note |
|---|---|---|
| MSB Pay transaction fee | ~5,000đ flat (B2C) hoặc 10,000đ (B2B), hoặc 0.3% giá trị min 2,000 max 15,000 | TNPM negotiate trực tiếp với MSB |
| VNPay/MoMo transaction fee | ~2,000-5,000đ/tx (utility category) | Thấp hơn MSB nhưng UX kém hơn cho B2B |
| SMS OTP/Reminder | ~500-700đ/SMS (Viettel/VNPT) | Volume contract giảm còn 400đ |
| Email (SendGrid/Mailgun) | ~100đ/email | Volume scale |
| Zalo OA notification | ~500đ/noti | Cần Zalo OA verified |
| sInvoice (hoá đơn điện tử) | ~500-2,000đ/HĐ | Hilo/VNPT/Misa, volume-based |
| FCM push notification | Free (Google) | Chỉ tính infra send |

### Pass-through estimate / tháng (triệu VND)

| Component | S | M | L | XL | Giả định |
|---|---:|---:|---:|---:|---|
| MSB transaction fee | 4 | 60 | 175 | 480 | S: 700 tx × 5k; M: 10k × 6k blended; L: 35k × 5k; XL: 80k × 6k |
| SMS OTP + nhắc nợ | 3 | 35 | 180 | 600 | 5x invoice count × 600đ (OTP + 2-3 reminder + payment confirm + lease alert) |
| Email | 0.5 | 6 | 30 | 100 | 5x invoice × 100đ |
| Zalo OA | 0.5 | 7 | 25 | 75 | 1x invoice × 500đ (option) |
| sInvoice | 1 | 12 | 50 | 160 | invoice × 1000đ |
| **TỔNG Pass-through / tháng** | **~9M** | **~120M** | **~460M** | **~1,415M** | |
| **TỔNG Pass-through / năm** | **~108M** | **~1.44 tỷ** | **~5.52 tỷ** | **~16.98 tỷ** | |

> **Khuyến nghị**: Pass-through cost nên được **TNPM thu lại từ KH cuối** (phí thu hộ, phí dịch vụ thanh toán) — không gánh trên P&L vận hành. Tham chiếu: chung cư thường charge 0.5-1.5% phí giao dịch online, hoặc nhập thẳng vào đơn giá dịch vụ.

## 5. TỔNG OPEX (PlatOps + Pass-through) per segment

| Segment | PlatOps/năm | Pass-through/năm | **Tổng OPEX/năm** | Tổng OPEX/tháng |
|---|---:|---:|---:|---:|
| **S — Pilot** | 2.39 tỷ | 0.11 tỷ | **~2.50 tỷ** | ~208M |
| **M — Mid-scale** | 4.12 tỷ | 1.44 tỷ | **~5.56 tỷ** | ~463M |
| **L — Large (TNPM likely)** | 8.82 tỷ | 5.52 tỷ | **~14.34 tỷ** | ~1.20 tỷ |
| **XL — Enterprise** | 19.80 tỷ | 16.98 tỷ | **~36.78 tỷ** | ~3.07 tỷ |

## 6. Cost optimization levers (giảm OPEX khi cần)

### 6.1 Giảm Cloud Infra
- **Reserved Instance** (commit 1-3 năm): tiết kiệm 30-50%.
- **Spot instance** cho non-critical workload (batch invoice tháng): −60% cho phần đó.
- **Multi-tenant database share** thay vì schema-per-tenant cho tenant nhỏ: tiết kiệm DB cost.
- **Cold storage S3 Glacier** cho audit log > 6 tháng: −80% storage cost cho tier đó.

### 6.2 Giảm DevOps/Support
- **Outsource L1** cho đối tác chuyên nghiệp (~50-70% loaded cost so với in-house).
- **Self-service portal** cho TNPM staff (KB, ticket form) — giảm L1 ticket 30-40%.
- **Runbook + automation** (terraform, ansible, K8s operators) — giảm DevOps man-hours.

### 6.3 Giảm Pass-through
- **Channel mix optimization**: ưu tiên Zalo OA (500đ) thay vì SMS (600đ) khi KH có Zalo.
- **MSB volume contract**: negotiate xuống 3,000đ/tx hoặc % cap thấp.
- **sInvoice volume tier**: contract năm thay vì pay-per-use.
- **Push qua app Timi** miễn phí thay vì SMS reminder.

### 6.4 Industry benchmark
- **SaaS Property Management B2B** quốc tế: OPEX ≈ 40-60% ARR (annual recurring revenue).
- **Local custom build**: OPEX ≈ 80-120% cost build trong năm 1-2, giảm dần xuống 30-50% sau ổn định.
- **TNPM L segment 8.82 tỷ/năm PlatOps** ≈ 108% cost build — phù hợp giai đoạn 1-2 năm đầu. Sau khi ổn định (năm 3+) có thể giảm xuống ~60-70% (≈ 5.5-6 tỷ/năm) qua các lever ở mục 6.1-6.3.

## 7. Khuyến nghị cho Phương án Kinh doanh

### Khi chào TNPM theo SaaS managed model:
- Reborn host platform → Reborn gánh PlatOps → bill TNPM **subscription fee** = PlatOps × (1 + margin 25-40%).
- Pass-through transparent — Reborn lấy hộ TNPM, bill at-cost mỗi tháng (hoặc rebate volume discount).
- Ví dụ với L segment:
  - PlatOps cost Reborn = 8.82 tỷ/năm
  - Subscription bill TNPM = 8.82 × 1.35 = **~11.9 tỷ/năm** (≈ 990M/tháng)
  - Pass-through bill at-cost = ~5.52 tỷ/năm
  - **Tổng TNPM trả = ~17.4 tỷ/năm** cho operation năm 1-2.

### Khi chào TNPM theo on-premise / self-host model:
- TNPM tự gánh PlatOps + Pass-through.
- Reborn chỉ bill **annual maintenance** (15-20% cost build) ≈ **1.2-1.6 tỷ/năm**.
- Total TNPM gánh năm 1: **CAPEX 8.16 tỷ + OPEX self ~7.6 tỷ + Maintenance Reborn 1.5 tỷ ≈ 17.3 tỷ năm đầu**.
- Năm 2+ TNPM tiết kiệm hơn nhưng phải tự build DevOps team.

### Hybrid (khuyến nghị cho TNPM happy case)
- Reborn host 12-18 tháng đầu (managed) → TNPM trả subscription.
- Sau 18 tháng, TNPM có option migrate sang on-premise nếu muốn (Reborn hỗ trợ transition + bán annual maintenance).
- Risk minimize cho 2 bên: TNPM không phải build team ngay, Reborn có ARR cố định 12-18 tháng.

## 8. Lưu ý so với CAPEX

| | CAPEX (1 lần) | OPEX (hàng năm, L segment) |
|---|---:|---:|
| **Cost** | 8.16 tỷ | 8.82 tỷ PlatOps + 5.52 tỷ Pass-through |
| **Pricing chào TNPM** (margin 30-40%) | 10.6-11.4 tỷ | 11.5-12.3 tỷ PlatOps + at-cost Pass-through |
| **Cash flow Reborn** | Front-loaded, milestone billing | Recurring, monthly invoicing |
| **Risk Reborn** | Project delivery risk | Customer churn risk, infra cost overrun |

> **Total Cost of Ownership (TCO) 3 năm cho TNPM L segment, Reborn managed**:
> - Year 1: CAPEX 10.6 tỷ (chào TNPM) + 12 tháng SaaS ~17.4 tỷ = **~28 tỷ**
> - Year 2: 17.4 tỷ
> - Year 3: 17.4 tỷ
> - **TCO 3 năm ≈ 62.8 tỷ VND** — đây là số TNPM cần budget. Có thể so sánh với:
>   - Yardi Voyager 3 năm TCO: ~50-80 tỷ
>   - MRI Software: ~60-100 tỷ
>   - Local custom + self-operate: ~40-55 tỷ (rủi ro cao)

Số này cho buổi Reborn × TNTech align trước, **không chia sẻ với TNPM** cho đến khi 2 bên chốt pricing strategy.
