# Part 05 — Khuyến mãi & Campaign

## 1. Tổng quan campaign

Campaign = chiến dịch nhắm vào segment KH cụ thể, dùng đòn bẩy điểm/voucher/giảm giá để đạt mục tiêu (revenue, retention, frequency).

## 2. Loại campaign

| Loại | Mục đích | Khi dùng |
|---|---|---|
| **Earn campaign** | Tăng tỷ lệ tích điểm (× 2/3 điểm) | Cuối tuần, lễ, push frequency |
| **Burn campaign** | Khuyến khích tiêu điểm | Giảm liability cuối năm |
| **Re-engage** | Đánh thức KH sleeping | KH no order 60+ ngày |
| **Acquisition** | Thu KH mới (welcome bonus) | Launch brand mới, expo |
| **Birthday** | Cá nhân hoá sinh nhật | Tự động monthly |
| **Tier-up** | Push KH gần ngưỡng | Cuối kỳ eval |
| **Buy-X-Get-Y** | Cross-sell, clearance | SKU specific |
| **Bundle discount** | Tăng AOV | Combo |

## 3. Tạo campaign — Wizard 5 bước

**Menu › Khuyến mãi › Campaigns › [+ New]**

### Bước 1 — Chọn type

Chọn loại + tên campaign. Hệ thống suggest defaults theo loại.

### Bước 2 — Target segment

Có 2 cách:

**A. Chọn segment có sẵn**

Menu dropdown segments đã định nghĩa: "Champions", "At Risk", "Bronze inactive 30d", v.v.

**B. Build segment mới**

Bấm **[+ New segment]** → builder filter:
- Tier (multi-select)
- RFM persona (Champions, Loyal, At Risk, ...)
- Last order: > / < / between (ngày)
- Lifetime spend: > / < / between (VND)
- Total orders: > / <
- Brand active: Brand A only / Brand B only / both / either
- Tags: include / exclude
- DOB: birthday week, age range
- Location: province (multi-select)

Live count update: "Segment hiện có 23.450 thành viên".

🟢 **Tip:** Save segment reusable cho campaign sau.

### Bước 3 — Cấu hình rules

Theo type campaign, form rules khác nhau.

**Earn campaign:**
- Multiplier: 1.5× / 2× / 3×
- Apply on: amount-based earn rules
- Time window: days of week, hours, valid_from..to
- Min order amount: e.g., chỉ áp đơn ≥ 200k
- Max bonus points per order: cap 1.000 điểm
- Max uses per member: 4 lần campaign

**Burn campaign:**
- Discount on redemption: e.g., "Giảm 30% điểm cần"
- Reward whitelist: chỉ apply cho top 10 rewards

**Re-engage:**
- Voucher kèm: VC-100K
- Validity: 14 ngày sau khi KH receive
- Trigger condition: no order 60+ days

### Bước 4 — Notification

- Channels: SMS / Zalo / Email / Push (multi-select)
- Template: chọn từ library hoặc custom
- Personalization variables: `{name}, {tier}, {voucher_code}, {expiry}`
- Test send tới 1 KH thử

⚠️ **Frequency cap toàn cục:** Tối đa 3 message/KH/tuần — campaign này tự respect cap.

### Bước 5 — Schedule + Budget

- Start_at, end_at
- Budget cap (VND): tự pause khi reach
- Approval: 2-level nếu > 100M VND budget
- Preview estimated cost + reach

Bấm **[Schedule]** → status `scheduled`, chờ start_at để launch.

🔴 **Quan trọng:** Mỗi campaign đều có **estimated cost** dựa trên segment size + multiplier. Review kỹ trước approval.

## 4. Campaign đang chạy — Dashboard

**Menu › Khuyến mãi › Active**

Mỗi campaign card:
- Status: running / paused / scheduled
- Đã chạy: X ngày / Y ngày tổng
- Reach: thực tế / dự kiến
- Conversion: số KH có order trong campaign / total reach
- Revenue sinh ra
- Cost-to-date
- ROI ước tính

Bấm **[Detail]** → trang chi tiết:
- KPI breakdown by store/brand
- Top SKU bị ảnh hưởng
- A/B variants (nếu có)
- Notification delivery report

### 4.1. Pause / Resume / Cancel

- **Pause:** tạm dừng áp dụng rule (orders mới không hưởng campaign)
- **Resume:** tiếp tục
- **Cancel:** dừng hẳn (irreversible)

Audit log mọi action.

### 4.2. Tăng budget mid-flight

Bấm **[Edit budget]** → 2-level approval → audit log.

## 5. A/B test

### 5.1. Setup

Trong wizard, ở Bước 3:
- Toggle **[A/B test mode]**
- Define Variant A và Variant B (khác multiplier, voucher value, message, ...)
- Split: 50/50 (default) hoặc tuỳ chỉnh

### 5.2. Hash deterministic

KH được bucketed theo `hash(member_id + campaign_id) mod 100`. KH ở variant A chỉ nhận notification + rule A. Consistent suốt campaign.

### 5.3. Đọc kết quả

Sau campaign, dashboard so sánh:
- Reach A vs B
- Conversion rate A vs B
- AOV A vs B
- Revenue per recipient A vs B
- Statistical significance (p-value)

p-value < 0.05 → có ý nghĩa thống kê → variant tốt hơn deserves rollout.

🟢 **Tip:** Min sample size 1.000 KH/variant để có power thống kê.

## 6. Segment management

**Menu › Khuyến mãi › Segments**

List segments saved:
- Name
- Filter rules (preview)
- Current member count (refresh hourly)
- Last campaign sử dụng

Bấm vào → edit, duplicate, delete.

🟢 **Best practice:** Tạo segment template tái sử dụng cho campaign tương tự:
- "VIP — Diamond + Gold"
- "At Risk — was Gold, no order 45d"
- "New — registered last 30d, 0-1 orders"
- "Birthday — DOB this week"

## 6bis. Campaign nâng cao qua BPM Engine

Khi campaign vượt khả năng "Simple rule" (multi-challenge quest, journey-based, family pooling, B2B contract, time-bound batch end-of-period), chuyển sang **BPM workflow**.

### 6bis.1. Khi nào dùng BPM?

| Yêu cầu | Xử lý |
|---|---|
| Tích điểm tăng × 2 cuối tuần | ✅ Simple rule (multiplier + day filter) |
| KH mua đơn ≥ 500K được +200 điểm | ✅ Simple rule (min_spend + bonus) |
| Quest "5 challenge trong tháng → +5K bonus" | 🔄 **BPM workflow** |
| Family Plan "4 thành viên pool điểm → unlock benefit" | 🔄 **BPM workflow** |
| B2B "đơn > 50M cần Sales rep approve" | 🔄 **BPM workflow** |
| Journey "Discover app → Mua POS → Review → +bonus" | 🔄 **BPM workflow** |

Decision tree đầy đủ: [URD part-03 §1bis](../02-requirements/part-03-points-engine.md#1bis-hai-lớp-earn-rule--simple-vs-advanced).

### 6bis.2. Bước tạo campaign BPM

1. **Menu › Khuyến mãi › Campaigns › [+ New]**
2. Bước 1 — chọn type → chọn **"Advanced workflow (BPM)"**
3. Hệ thống mở **BPM Studio** (embedded hoặc tab mới)
4. Marketing/BA vẽ BPMN diagram:
   - Start event
   - Tasks (script tasks for logic, service tasks for award)
   - Gateways (decision points)
   - Timers (chờ cuối tháng)
   - End event
5. Define variables (challenges state, targets, awards)
6. Test trong sandbox: spawn 1 process instance với mock data → verify flow
7. Save + version tag (vd: `quest-may-2026-v1`)
8. Submit for Tenant Admin approval
9. Deploy production
10. Bulk enroll target segment (cron auto-spawn process instance cho mỗi KH)

### 6bis.3. Monitor BPM campaign

**Menu › Khuyến mãi › BPM Workflows**

- List workflow definitions (active versions)
- List active process instances (filter by member, workflow, state)
- Drill-down instance: BPMN diagram highlight current step + variable values + history
- Manual control: terminate instance, force-advance, retry failed task
- Metrics: completion rate, avg duration, failure rate

### 6bis.4. Versioning & A/B test

- Deploy v1 → 50% segment
- Deploy v2 (variant) → 50% còn lại
- Workflow nào perform tốt hơn → rollout 100% cho campaign tiếp theo

🟢 **Tip:** Bắt đầu với case đơn giản (quest 2-3 challenge) trước khi làm quest 5+. Learn từ data thật.

🔴 **Quan trọng:** BPM workflow versioned — process instances đang chạy với v1 sẽ chạy đến hết, KHÔNG migrate sang v2. Tránh state inconsistency.

📚 **Case study chi tiết:** [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md) — Loyalty Quest tháng 5 (5 challenge, 30 ngày).

## 7. Auto-trigger campaigns

Cron tự động trigger:
- **Birthday campaign**: 3 ngày trước sinh nhật KH, gửi voucher + multiplier × 3 trong week
- **Welcome series**: Day 0 (welcome), Day 7 (push 2nd order), Day 30 (review)
- **Re-engage**: KH chuyển active → inactive (60d no order) → send voucher
- **Tier downgrade warning**: KH enter grace → gửi "Bạn cần X điểm trong tháng tới"

Cấu hình ở **Cài đặt › Automation rules**.

## 8. Stack policy với promotion

Khi 1 đơn match nhiều campaign + tier multiplier + birthday:
- Default: `single_highest` (chỉ áp cao nhất)
- Optional: `multiplicative` với cap `max_stack_factor = 4`

⚠️ Test cẩn thận trước khi enable `multiplicative` — dễ bleed margin nếu cap không đúng.

## 9. Compliance khi gửi notification

🔴 **NĐ 91/2020 (anti-spam):**
- Gửi 7h–22h, không Chủ Nhật
- Frequency cap 3 msg/KH/tuần
- Opt-out link mandatory trong email
- Honor opt-out trong 24h

Hệ thống auto enforce — nhưng Marketing cần check segment có loại KH opt-out chưa.

Xem [`../06-analysis/compliance-pdpa.md#2-nđ-912020--chống-thư-rác-anti-spam`](../06-analysis/compliance-pdpa.md).

## 10. Tham chiếu

- URD campaign: [`../02-requirements/part-06-promotions-campaigns.md`](../02-requirements/part-06-promotions-campaigns.md)
- RFM segmentation: [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md)
- Loyalty economics (campaign ROI): [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
- Compliance: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
