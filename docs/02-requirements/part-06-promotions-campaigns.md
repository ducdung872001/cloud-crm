# Part 06 — Khuyến mãi & Campaign

## 1. Mục tiêu

Cho phép Marketing tạo **chiến dịch nhắm vào segment KH cụ thể**, dùng đòn bẩy điểm + voucher + giảm giá để tăng doanh thu, retention, frequency. Tích hợp marketing automation: Email/SMS/Zalo OA gửi nội dung KH cá nhân hoá.

## 2. Phân loại

| Loại | Mục đích | Ví dụ |
|---|---|---|
| **Earn campaign** | Tăng tỷ lệ tích điểm | "Cuối tuần × 2 điểm" |
| **Burn campaign** | Khuyến khích tiêu điểm | "Đổi 1.000 điểm = voucher 200k (thường 1.500 điểm)" |
| **Re-engage campaign** | Đánh thức KH inactive | "Quay lại trong tháng — +500 điểm" |
| **Acquisition campaign** | Thu KH mới | "Đăng ký thành viên — +1.000 điểm welcome" |
| **Birthday campaign** | Cá nhân hoá theo dob | "Chúc mừng sinh nhật — × 3 điểm tuần này" |
| **Tier-up campaign** | Push KH gần ngưỡng tier | "Bạn cần 500 điểm nữa để lên Vàng — mua thêm tuần này × 2" |
| **Buy-X-Get-Y** | Cross-sell, clearance | "Mua 3 sữa tặng 1" |
| **Bundle discount** | Tăng giá trị giỏ | "Combo gia đình giảm 15%" |

## 3. Campaign entity

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `campaign_id` | UUID | PK |
| `campaign_code` | string(40) | |
| `name` | i18n | |
| `type` | enum | earn/burn/re_engage/acquisition/birthday/tier_up/bxgy/bundle |
| `target_segment_id` | FK | Segment KH target (NULL = all) |
| `eligible_scope` | FK | Brand/store-group/chain |
| `start_at`, `end_at` | timestamp | Hiệu lực |
| `rules_json` | JSON | Rule chi tiết (xem §4) |
| `budget_vnd` | bigint | Ngân sách campaign (cho cost cap) |
| `current_spend_vnd` | bigint | Cost đã sinh ra |
| `status` | enum | draft/scheduled/running/paused/ended/cancelled |
| `kpi_targets` | JSON | Mục tiêu: orders, revenue, redemption_count, ... |
| `notification_channels` | JSON | sms, zalo, email, push |
| `notification_template_id` | FK | Template message |
| `ab_test_group_id` | FK | Nếu A/B test |
| `created_by`, `approved_by` | FK user | |

## 4. Rules JSON example

```json
{
  "type": "earn",
  "multiplier": 2.0,
  "applicable_days_of_week": ["sat", "sun"],
  "applicable_hours": [10, 22],
  "min_order_amount": 200000,
  "max_bonus_points": 1000,
  "max_uses_per_member": 4,
  "categories": ["dairy", "snacks"],
  "stackable_with_birthday": false
}
```

```json
{
  "type": "bxgy",
  "buy": { "sku": "MILK-1L", "qty": 3 },
  "get": { "sku": "MILK-1L", "qty": 1, "discount_pct": 100 },
  "limit_per_order": 2
}
```

## 5. Yêu cầu

### UR-PROMO-01 — Tạo campaign (Must)

| | |
|---|---|
| **Actor** | Marketing Mgr, Brand Mgr |
| **Mô tả** | Wizard 5 bước: (1) chọn type, (2) chọn target segment, (3) cấu hình rules, (4) cấu hình notification, (5) review + schedule. Save draft mọi lúc. |
| **AC** | • Validate budget vs estimated cost (preview cost)<br>• Estimate reach: số KH target × % expected engagement<br>• 2-level approval nếu budget > 100M VND |

### UR-PROMO-02 — Segment KH (Must)

| | |
|---|---|
| **Mô tả** | Định nghĩa segment bằng filter rules: tier, last_order_days, lifetime_spend, RFM score, brand_active, dob (birthday), tags, location. Refresh count realtime khi config. |
| **AC** | • Save segment reusable<br>• Preview 100 KH đầu tiên<br>• Export Excel danh sách (admin only)<br>• Tính count < 5s với 3M base |
| **Phân tích sâu** | [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md) |

### UR-PROMO-03 — Schedule & launch (Must)

| | |
|---|---|
| **Mô tả** | Schedule campaign chạy tự động tại `start_at`. Auto-stop tại `end_at` hoặc khi `current_spend ≥ budget`. Pause/resume thủ công. |
| **AC** | • Cron 1 phút kiểm tra trigger<br>• Notification campaign launched cho admin team<br>• Audit log mỗi state change |

### UR-PROMO-04 — Apply rule khi giao dịch (Must)

| | |
|---|---|
| **Mô tả** | Engine evaluate active campaigns khi `auto-earn` hoặc `consume`. Match: scope + eligibility + applicable conditions. Áp dụng modifier vào kết quả. |
| **AC** | • Order eligibility check < 50 ms<br>• Match multiple campaigns: áp campaign priority cao nhất, hoặc stack nếu cả 2 cho phép<br>• Log applied_campaigns trong ledger metadata |

### UR-PROMO-05 — Notification automation (Must)

| | |
|---|---|
| **Mô tả** | Khi campaign launch: gửi message đến segment KH qua kênh cấu hình. Template hỗ trợ personalization: `{name}, {points_balance}, {tier}, {voucher_code}`. Throttle 100k message/giờ. |
| **AC** | • Template editor có preview với data thật<br>• Delivery report: sent/delivered/opened/clicked/failed<br>• Unsubscribe link bắt buộc trong email<br>• Compliance NĐ 91/2020 về spam |

### UR-PROMO-06 — A/B test (Should)

| | |
|---|---|
| **Mô tả** | Tạo 2 variants A/B của campaign. Split segment 50/50 (configurable). Sau campaign, dashboard so sánh: conversion rate, AOV, redemption rate per variant. Statistical significance ≥ 95%. |
| **AC** | • Bucketing deterministic theo `hash(member_id + campaign_id) mod 100`<br>• KH ở variant nào chỉ thấy notification của variant đó<br>• Báo cáo có p-value |

### UR-PROMO-07 — Campaign dashboard (Must)

| | |
|---|---|
| **Mô tả** | Live dashboard cho campaign đang chạy: số tiếp cận, số tương tác, doanh thu sinh ra, cost-to-date, ROI ước tính, top SKU ảnh hưởng. |
| **AC** | • Refresh mỗi 5 phút<br>• Drill-down theo store/brand/tier<br>• Export Excel |

### UR-PROMO-08 — Stack policy (Must)

| | |
|---|---|
| **Mô tả** | Khi 1 đơn match nhiều campaign + KH có tier multiplier + birthday: cấu hình `stack_mode`: `single_highest` (default) hoặc `multiplicative` (× chồng). Multiplicative có cap `max_stack_factor`. |
| **AC** | • UI cảnh báo khi cấu hình multiplicative không có cap<br>• Test case cụ thể: KH Diamond (× 2), birthday week (× 3), weekend campaign (× 2): single_highest → × 3, multiplicative no cap → × 12, multiplicative cap 4 → × 4 |

### UR-PROMO-08b — Advanced campaign workflow qua BPM (Should)

| | |
|---|---|
| **Actor** | Marketing Mgr (design qua BPM Studio), Tenant Admin (approve deploy) |
| **Mô tả** | Khi campaign có yêu cầu phức tạp ngoài khả năng của earn rule đơn giản (multi-challenge quest, journey-based, multi-event correlation, time-bound batch, approval gate) → dùng **Reborn BPM Engine** thay vì rule engine native. Marketing thiết kế BPMN diagram trong BPM Studio. Workflow versioned, deploy có approval. |
| **AC** | • Dropdown khi tạo campaign: "Simple rule" / "Advanced (BPM workflow)"<br>• Nếu chọn Advanced → link sang BPM Studio<br>• Workflow phải pass sandbox test trước production<br>• Dashboard campaign hiển thị process instances đang chạy<br>• Audit log mọi version deploy |
| **Case study** | [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md) — Loyalty Quest 5-challenge × 30 ngày |
| **Decision guide** | [URD part-03 §1bis](part-03-points-engine.md#1bis-hai-lớp-earn-rule--simple-vs-advanced) |

### UR-PROMO-09 — Re-engage trigger (Should)

| | |
|---|---|
| **Mô tả** | Auto campaign trigger khi KH chuyển từ active → inactive (no order in 60 days). Gửi voucher + push notification. |
| **AC** | • Trigger qua cron daily<br>• Cap: 1 KH chỉ nhận re-engage 1 lần/quý<br>• Track conversion: trong 14 ngày sau, có quay lại không |

### UR-PROMO-10 — Birthday automation (Must)

| | |
|---|---|
| **Mô tả** | KH có `dob`: 3 ngày trước sinh nhật, auto gửi message với voucher sinh nhật + thông báo × N điểm trong tuần. Áp dụng multiplier khi giao dịch trong week. |
| **AC** | • Cron daily<br>• Skip KH inactive (no order 12+ months) — giảm noise<br>• Báo cáo: % KH có dob, % engagement sau birthday msg |

### UR-PROMO-11 — Buy-X-Get-Y (Should)

| | |
|---|---|
| **Mô tả** | Rule mua N sản phẩm SKU X → tặng/giảm sản phẩm SKU Y. POS phải đọc rule và apply discount line tương ứng (thông qua API rule check). |
| **AC** | • POS integration cần read `/promotion/validate` trước thanh toán<br>• Cap số lần áp dụng/đơn |

### UR-PROMO-12 — Budget cap & alert (Must)

| | |
|---|---|
| **Mô tả** | Mỗi campaign có `budget_vnd`. Engine track `current_spend_vnd` cộng dồn cost mỗi giao dịch áp campaign. Khi spend ≥ 80% budget → email alert. Khi ≥ 100% → auto pause. |
| **AC** | • Alert real-time 80/95/100%<br>• Audit khi auto-pause<br>• Admin có thể tăng budget mid-flight (audit + approval) |

## 6. Quy tắc nghiệp vụ

- **Campaign không retroactive** — chỉ áp đơn từ `start_at` trở đi
- **Một KH 1 birthday/năm** — auto-detect dob.month/day, không gửi trùng nếu năm trước đã gửi
- **Inactive KH không nhận campaign push** — định nghĩa inactive = no order 180+ ngày + no app login 90+ ngày
- **Notification throttle global**: tối đa 3 message/KH/tuần — tránh spam dù có nhiều campaign
- **Voucher từ campaign acquisition KHÔNG dùng cho đơn đầu của thẻ tín dụng** (chống fraud — chargeback dễ)

## 7. Tham chiếu

- **RFM/CLV — input cho segmentation:** [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md)
- **Fraud trong campaign:** [`../06-analysis/fraud-prevention.md`](../06-analysis/fraud-prevention.md)
- **NĐ 91/2020 spam compliance:** [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
- **UserGuide tạo campaign:** [`../09-userguides/part-05-promotions.md`](../09-userguides/part-05-promotions.md)
