# Executive Summary — Reborn Loyalty Platform

> **2 trang cho BOD.** Đầy đủ chi tiết: xem [`proposal/proposal-loyalty-banle.md`](proposal/proposal-loyalty-banle.md).

---

## 1. Bài toán

Khách hàng vận hành chuỗi siêu thị bán lẻ **2 thương hiệu, ~300 cửa hàng** (kế hoạch 1.000–1.500 trong 1–3 năm), phục vụ **~3 triệu khách hàng thành viên (KHTV)** với **~150.000 giao dịch/ngày** (peak lễ ~300.000). Hệ thống loyalty hiện chạy rời rạc trên **4 công cụ**: Goldmem (KHTV + lịch sử), MS Access (quyền lợi), MS Excel (dashboard thủ công), Supporter (khiếu nại).

**4 vấn đề cốt lõi:**

| # | Vấn đề | Tác động kinh doanh |
|---|---|---|
| 1 | Dữ liệu rải rác 4 công cụ, liên kết thủ công | Mất 5–15 phút/lần tra cứu 1 KH ở 3–4 nơi; sai sót cao |
| 2 | 2 brand loyalty độc lập, không nhận diện KH chéo | Mất doanh thu upsell ước tính 5–8% / năm |
| 3 | Marketing thuê agency ngoài | Chi phí ~500M–1.5B/năm + mất quyền chủ động nội dung |
| 4 | Không có dashboard hợp nhất | BOD ra quyết định bằng cảm tính, không dữ liệu thời gian thực |

## 2. Giải pháp

**Reborn Loyalty Platform** — nền tảng loyalty tập trung **API-first, multi-brand native**, hợp nhất 4 công cụ thành 1 nguồn duy nhất. **Không thay thế POS** — tích hợp qua REST API, POS hiện tại giữ nguyên.

**5 đặc trưng nổi bật:**

| Đặc trưng | Khả năng |
|---|---|
| **Hợp nhất 360°** | 1 hồ sơ KH duy nhất cho mọi điểm chạm (POS, web, app, CSKH, marketing) |
| **Cross-brand native** | Tích điểm ở Brand A, đổi quà ở Brand B (cấu hình bật/tắt + tỷ giá) |
| **Tự động hoá** | Tích điểm, thăng hạng, hết hạn, gửi thông báo — tất cả bằng rule engine |
| **Scale 3M KH + 500 TPS** | Kiến trúc đã chứng minh chịu peak gấp đôi, latency P95 < 500 ms |
| **Marketing automation nội bộ** | Email/SMS/Zalo OA tự vận hành — thay thế agency |

## 3. ROI tóm tắt

| Hạng mục | Năm 1 | Năm 2 | Năm 3 |
|---|---:|---:|---:|
| **Chi phí Reborn (CAPEX + OPEX)** | ~900M | ~600M | ~600M |
| **Tiết kiệm agency marketing** | +400M | +800M | +1.000M |
| **Tăng upsell cross-brand** (5% × revenue) | +1.500M | +2.500M | +4.000M |
| **Giảm thao tác thủ công CSKH** | +200M | +300M | +400M |
| **Net** | **+1.200M** | **+3.000M** | **+4.800M** |
| **Payback period** | ~9 tháng | | |

*Giả định: doanh thu chuỗi ~30 tỷ/tháng, 5% uplift từ cross-brand recognition + targeted campaign. Chi tiết sensitivity: xem [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md).*

## 4. Lộ trình 6 tháng + đồng hành 3 năm

```
Phase 1 (M1–M2): Nền tảng + Migration
  - Khảo sát Goldmem/Access/Excel/Supporter, mapping schema
  - Deploy platform, import 3M KH, dedupe cross-brand
  - Pilot 5–10 store Brand A
  → Milestone: 3M KHTV đã import, POS pilot tích điểm realtime

Phase 2 (M3–M4): Chạy song song + Rollout
  - Tích hợp POS Brand B, rollout đến 300 store
  - Bật cross-brand points
  - Đối soát số liệu hàng ngày với hệ cũ
  → Milestone: Toàn chuỗi chạy 1 hệ, hệ cũ chuyển archive

Phase 3 (M5–M6): Marketing Automation + Tối ưu
  - Bật Email/SMS/Zalo OA tự vận hành (thay agency)
  - Dashboard RFM, CLV, churn prediction
  - Training team IT khách tự vận hành
  → Milestone: Bàn giao + bảo hành 6 tháng

Năm 2–3: Mở rộng
  500–800 → 1.000–1.500 điểm bán, tích hợp ví điện tử, đối tác
```

## 5. Rủi ro chính & cách kiểm soát

| Rủi ro | Mức độ | Phương án kiểm soát |
|---|---|---|
| Data Goldmem/Access không đủ chất lượng (thiếu SĐT, trùng lặp) | 🔴 Cao | ETL pipeline có module data quality, preview trước import, dry-run merge |
| POS API của 2 brand khác nhau | 🟡 Vừa | Tầng adapter, mapper riêng mỗi brand; pilot 5–10 store trước khi rollout |
| Khách quen với Excel — không dùng dashboard mới | 🟡 Vừa | Training 2 buổi, export Excel mọi báo cáo, song song 1 tháng |
| Peak lễ 300K txn/ngày gây nghẽn | 🟡 Vừa | Load test 500 TPS trước rollout, có queue đệm, auto-scale |
| KH cũ thắc mắc về điểm bị mất khi merge cross-brand | 🟢 Thấp | Chính sách: không giảm điểm khi merge, audit log, hotline 24/7 trong tuần cutover |

Đầy đủ: xem [`../08-operations/risk-register.md`](../08-operations/risk-register.md).

## 6. Cam kết

| Cam kết | Mức |
|---|---|
| **Uptime** | ≥ 99.5% (không tính bảo trì) |
| **API latency P95** | < 500 ms cho auto-earn, < 1 s cho lookup |
| **Bảo hành** | 6 tháng sau nghiệm thu, fix bug miễn phí |
| **SLA hỗ trợ** | P1: < 30 phút 24/7 · P2: < 2 giờ giờ hành chính |
| **Quyền sở hữu data** | Khách hàng sở hữu 100%, export bất kỳ lúc nào |

---

**Liên hệ Reborn JSC:** `ceo@reborn.vn` · `ecosystem.reborn.vn`
