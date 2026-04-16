# GAP Analysis: Loyalty cho chuỗi siêu thị bán lẻ

## 1. YÊU CẦU KHÁCH HÀNG (từ chat)

| Yếu tố | Chi tiết |
|---------|----------|
| Ngành | Chuỗi siêu thị bán lẻ |
| Quy mô | 2 brand, >300 cửa hàng, ~3 triệu khách hàng |
| Pain point | Data 2 brand không đồng bộ |
| Nhu cầu trước mắt | Hệ thống Loyalty thống nhất cho chuỗi |
| Nhu cầu lâu dài | Kho data tập trung |
| Đặc thù | Mô hình cửa hàng vs siêu thị khác nhau (quy mô, số lượng SP) |
| Yêu cầu kỹ thuật | Set loyalty linh hoạt chung hoặc riêng từng cửa hàng/đại lý |

## 2. HỆ THỐNG HIỆN TẠI — ĐÃ CÓ GÌ

### Đã có đầy đủ (✅)
- **Loyalty Wallet**: DS hội viên, số dư điểm, xuất Excel
- **Point Ledger**: Lịch sử tích/tiêu điểm, export
- **Membership Tiers**: 4 hạng (Bronze/Silver/Gold/Diamond), cấu hình điểm thăng hạng
- **Point Rules**: Chương trình tích điểm, cấu hình tỷ lệ tích
- **Rewards Catalog**: Voucher, Dịch vụ, Quà tặng, Thăng hạng
- **Point Exchange**: Đổi điểm, cấu hình tỷ giá quy đổi
- **Promotions**: Chương trình KM, giảm giá, flash sale, combo, giá cố định
- **Coupons**: Mã giảm giá, giới hạn sử dụng, hạn dùng
- **POS Integration**: Hiển thị điểm + đổi điểm tại quầy thanh toán
- **Dashboard**: CLV, retention rate, biểu đồ điểm
- **API layer**: Đầy đủ CRUD cho loyalty program, wallet, ledger, reward, segment

### Có nhưng chưa đủ cho siêu thị (⚠️)
- Multi-tenant: hardcoded hostname, chưa switch động
- Branch-level loyalty: chỉ có tenant-level, chưa per-branch

### Chưa có — cần bổ sung (❌)
- Tự động thăng/hạ hạng theo chu kỳ
- Hạn sử dụng điểm (point expiry)
- Tích điểm tự động khi thanh toán đơn hàng
- Đồng bộ hội viên cross-brand (2 brand → 1 hệ thống)
- Cấu hình loyalty riêng per branch/brand
- RFM segmentation + phân tích hành vi mua
- Import hội viên hàng loạt (3 triệu khách)
- Thẻ hội viên barcode/QR (tra cứu nhanh tại quầy)
- Chương trình giới thiệu bạn (referral)
- Giao tiếp hội viên (SMS/Email/Zalo thông báo điểm, KM)
- Dashboard tổng hợp multi-brand

## 3. GAP ANALYSIS — ĐỐI CHIẾU ĐẶC THÙ SIÊU THỊ BÁN LẺ

### Bài toán Loyalty chuỗi siêu thị khác gì so với retail nhỏ/spa?

| Đặc thù siêu thị | Hiện tại | GAP |
|-------------------|----------|-----|
| **Tần suất mua cao** (hàng tuần) → tích điểm volume lớn | Tích điểm thủ công / API | Cần auto-earn khi order paid |
| **Giỏ hàng lớn** (50-100 SKU/bill) → tích điểm theo tổng hoá đơn | Tích điểm cấu hình đơn giản | Cần rule: tích theo category, brand, min spend |
| **Multi-brand** (2 thương hiệu) → điểm dùng chung hay riêng? | Single tenant | Cần cross-brand point pool + brand-specific rules |
| **300+ cửa hàng** → cấu hình loyalty per store group | Tenant-level only | Cần branch group + inheritance |
| **3 triệu khách** → performance, bulk import | Chưa có bulk import | Cần import CSV + dedupe by phone |
| **Thẻ vật lý/barcode** tại quầy | Chưa có | Cần member card + barcode lookup |
| **Hạng thành viên tự động** lên/xuống theo năm | Hạng manual | Cần auto tier evaluation periodic |
| **Điểm có hạn** (hết năm mất điểm) | Chưa có | Cần point expiry rules |
| **KM đặc thù siêu thị**: mua 3 tặng 1, combo, giá sốc cuối tuần | Có promotion cơ bản | Cần enhance: buy-X-get-Y, time-based |

## 4. PHƯƠNG ÁN LẤP GAP — ƯU TIÊN CHO DEMO

### P0 — Must-have cho demo (tuần này)

**4.1. Bật lại menu Loyalty (đang bị comment out)**
- Routes: uncomment loyalty_wallet, dashboard_loyalty, loyalty_point_ledger, setting_loyalty
- Điều chỉnh label/icon phù hợp siêu thị bán lẻ

**4.2. Dashboard Loyalty nâng cao cho siêu thị**
- Tổng hội viên, tổng điểm lưu hành, điểm đã đổi
- Phân bổ hạng thành viên (pie chart)
- Top stores by member count
- Biểu đồ tích điểm theo thời gian

**4.3. Cấu hình Loyalty per Brand/Store Group**
- Thêm UI: chọn áp dụng "Toàn chuỗi" / "Theo brand" / "Theo nhóm cửa hàng"
- Rules inheritance: brand → store group → store

**4.4. Tích điểm tự động khi thanh toán**
- Rule engine: amount → points (VD: 10,000đ = 1 điểm)
- Configurable per category, brand, min spend threshold
- POS hook: sau khi order paid → auto earn points

**4.5. Point Expiry (điểm có hạn)**
- Config: điểm hết hạn sau X tháng / cuối năm
- Hiển thị "điểm sắp hết hạn" trên wallet
- Notification trước khi điểm hết hạn

**4.6. Auto Tier Evaluation (thăng/hạ hạng tự động)**
- Config: đánh giá theo chu kỳ (tháng/quý/năm)
- Metric: tổng chi tiêu / tổng điểm tích trong kỳ
- Tự động upgrade/downgrade + notification

### P1 — Nice-to-have cho demo

**4.7. Member Card / Barcode**
- Sinh barcode/QR cho mỗi hội viên
- Tra cứu nhanh tại quầy bằng scan
- Hiển thị thẻ trên app/web

**4.8. Bulk Member Import**
- Import CSV: name, phone, email, points, tier
- Dedupe by phone
- Map từ hệ thống cũ 2 brand → merge

**4.9. Cross-brand Member Consolidation**
- Lookup by phone across brands
- Merge duplicate profiles
- Unified point balance

### P2 — Roadmap (sau demo)

**4.10. RFM Segmentation**
**4.11. Referral Program**
**4.12. Advanced Promotions (buy-X-get-Y)**
**4.13. SMS/Email/Zalo member communication**
**4.14. Data Platform integration**

## 5. THỨ TỰ TRIỂN KHAI FE

| Step | Việc | Ước lượng |
|------|------|-----------|
| 1 | Bật menu + điều chỉnh routes cho retail | 30 phút |
| 2 | Dashboard Loyalty nâng cao | 2 giờ |
| 3 | Point Rules: tích điểm theo hoá đơn | 2 giờ |
| 4 | Point Expiry config + hiển thị | 1.5 giờ |
| 5 | Auto Tier Evaluation config | 1.5 giờ |
| 6 | Brand/Store Group loyalty scope | 2 giờ |
| 7 | Member Card barcode | 1 giờ |
| 8 | Bulk Import UI | 1.5 giờ |
| 9 | Cross-brand merge UI | 2 giờ |
