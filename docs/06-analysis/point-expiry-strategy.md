# Point Expiry Strategy — So sánh 3 chế độ

## TL;DR

> 3 chế độ expire: `never`, `after_months` (N tháng kể từ ngày tích), `end_of_year` (cuối năm dương lịch). **Khuyến nghị: `after_months` với N=12.** Tạo natural breakage 20-30%, tránh liability tích lũy, push KH tiêu đều, đơn giản giao tiếp. `never` rủi ro kế toán dài hạn; `end_of_year` bị peak demand cuối năm (KH ồ ạt redeem 12/31).

## 1. So sánh 3 chế độ

| Tiêu chí | `never` | `after_months` (12) | `end_of_year` |
|---|---|---|---|
| **Cách hết hạn** | Không bao giờ | Sau N tháng từ ngày tích | 31/12 hàng năm |
| **Breakage rate** | < 5% | 20–30% | 15–25% |
| **Liability accumulating** | 🔴 Cao (tích lũy mãi) | 🟡 Stable | 🟡 Stable (reset annual) |
| **Customer experience** | 🟢 Trực quan, không lo | 🟡 Phải nhớ deadline | 🟢 Dễ nhớ (cuối năm) |
| **Behavioral push** | ⚪ Yếu | 🟢 Mạnh (FOMO trước hết hạn) | 🟢 Rất mạnh (peak 11-12) |
| **Operational complexity** | 🟢 Đơn giản | 🟡 Cron daily | 🟢 Cron 1 lần/năm |
| **Peak load** | — | Spread đều | 🔴 Peak cuối năm |
| **Compliance kế toán** | 🔴 Phải hold liability không xoá | 🟢 Recognize breakage | 🟢 Recognize breakage |
| **Phù hợp loại business** | Subscription/SaaS | **Retail/Grocery (RECOMMEND)** | B2B, airline tier |

## 2. Chi tiết từng chế độ

### 2.1. `never` — Không bao giờ hết hạn

**Cách hoạt động:** Mọi earn entry có `expires_at = NULL`. Không có cron expire.

**Pros:**
- KH thấy fair — đã tích là được giữ
- Trust cao
- Simple operations

**Cons:**
- **Liability bùng nổ** sau 3-5 năm: 3M KH × giữ trung bình 5K điểm = 15 tỷ điểm × 50đ = 750 tỷ liability!
- Kế toán không hài lòng (deferred revenue mãi không release)
- KH "tích đầy" → không có push tiêu → cycle ngừng → engagement giảm
- Khó campaign FOMO

**Ví dụ thực tế:**
- Starbucks Stars (USA pre-2022): never expire → liability bloat → buộc phải đổi sang 6 tháng expire → backlash KH

### 2.2. `after_months` — N tháng kể từ ngày tích (RECOMMENDED)

**Cách hoạt động:** Mỗi earn entry có `expires_at = created_at + N months`. Cron daily quét entries `expires_at < NOW()` chưa consumed → ghi entry `expire` ngược.

**N gợi ý:**
- N = 6: aggressive, tăng push tiêu, breakage cao (30-40%)
- **N = 12: balanced (RECOMMENDED cho siêu thị)**
- N = 18: lenient, breakage thấp (15-20%)
- N = 24: gần như never với heavy buyers

**Pros:**
- **FIFO push behavior**: KH tự push để tiêu trước khi expire → frequency tăng
- Liability stable (steady state)
- Breakage natural 20-30%
- FOMO reminder mạnh (30/14/7/1 ngày trước expire)

**Cons:**
- Phải educate KH (in receipt, SMS reminder)
- Cron daily cần đảm bảo timely
- Một số KH bị "mất điểm" → cần CSKH chuẩn bị xử lý

**Ví dụ:**
- Sephora Beauty Insider: 1 năm sliding
- Coopmart (VN): 12 tháng

### 2.3. `end_of_year` — Hết hạn 31/12

**Cách hoạt động:** Mọi điểm reset 0 vào 31/12 23:59:59. Cron 1 lần năm.

**Pros:**
- Simple cho KH (1 deadline duy nhất)
- Peak redemption Q4 → boost doanh thu tháng 11-12
- Breakage clear timing

**Cons:**
- **Demand peak khó dự đoán**: KH ồ ạt redeem 12/30-12/31 → stockout, server overload
- KH đăng ký tháng 12 bị thiệt (chỉ có 1 tháng)
- Khó cho heavy buyers nửa cuối năm (1.000 điểm đầu năm thì kịp; đầu tháng 12 đạt 5.000 điểm thì mất)

**Mitigation:** Pro-rate cho KH new (đăng ký Q4 → expire Q4 năm sau).

**Ví dụ:**
- Hilton Honors: end of year + 12 months rolling (hybrid)

## 3. Tác động P&L theo từng chế độ

Giả định baseline: 30 tỷ revenue/tháng, 28.8M điểm phát hành/năm, value 50đ/điểm.

| Metric | `never` | `after_months=12` | `end_of_year` |
|---|---|---|---|
| Year 1 redemption rate | 25% | 45% | 50% (peak Q4) |
| Year 1 breakage | 5% | 25% | 22% |
| Year 1 cost (after margin) | 270M | 486M | 540M |
| Year 1 liability accumulating | +2.16B 🔴 | 0 (stable) | 0 (reset) |
| Year 5 liability accumulated | **+10.8B 🚨** | Stable | Stable |
| Customer NPS impact | +3 | +1 | -2 (some lose) |
| Cron operational cost | 0 | low | low |
| **Risk profile** | High accounting risk | **Balanced** | Operational peak risk |

## 4. Cấu hình khuyến nghị cho dự án

```yaml
loyalty:
  expiry:
    mode: after_months
    duration_months: 12
    fifo_enabled: true                    # consume cũ trước
    reminder_days_before: [30, 14, 7, 1]  # notification trước expire
    grace_after_expire_days: 0            # không phục hồi điểm sau expire
  cron:
    expire_job: "0 2 * * *"  # 02:00 daily
    parallelism: 16 workers
    target_3M_in: < 30 minutes
```

## 5. Migration strategy khi đổi mode

### 5.1. `never` → `after_months`

- Risk: KH bất ngờ mất điểm → uproar
- Mitigation: announce trước 6 tháng, grandfather điểm cũ (giả định ngày tích = ngày migrate), gửi reminder mỗi tháng

### 5.2. `end_of_year` → `after_months`

- Smoother. Convert: điểm hiện tại expire theo distribution earned date thực
- 60 ngày notification, training CSKH

### 5.3. `after_months=12` → `after_months=6`

- Aggressive cut. Risk medium.
- Mitigation: announce 90 ngày, voucher đặc biệt cho điểm sắp expire ngay

> **Hard rule:** Trước khi đổi mode, **dry-run preview** số KH ảnh hưởng + tổng điểm expire trong 90 ngày tới. Hiển thị confirm dialog đỏ. Backup snapshot. Audit log.

## 6. Notification template

### 30 ngày trước hết hạn

```
Chào {name},
Bạn còn {expiring_points} điểm sẽ hết hạn vào {expires_at}.
Đổi quà ngay tại app: https://app.loyalty.brand-a.vn/rewards
hoặc dùng giảm trực tiếp tại quầy.
Số điểm hiện tại: {current_balance}
```

### 7 ngày trước

```
🔥 SẮP HẾT HẠN — {name},
{expiring_points} điểm hết hạn còn 7 ngày!
Top reward cho bạn:
- Voucher 100K (1.000 điểm)
- Quà tặng vật lý (2.000 điểm)
Đổi ngay: [link]
```

### 1 ngày trước

```
⏰ HÔM NAY là deadline,
{expiring_points} điểm sẽ mất vào lúc 23:59.
Tiêu ngay tại bất kỳ store nào!
```

## 7. KPI to monitor

| KPI | Target |
|---|---|
| % điểm redeemed before expiry | 60–80% |
| % điểm expired (breakage) | 20–35% |
| Notification open rate (30d reminder) | ≥ 30% |
| Redemption boost từ reminder | +15–25% |
| CSKH complaint về expire | < 0.1% of expirees |

## 8. Edge cases

### 8.1. Cấp điểm bonus 1 lần (welcome 500đ) — expire khi nào?

Theo same rule (12 tháng). Hoặc cho welcome bonus expire 6 tháng để push first purchase.

### 8.2. Tier-based expiry?

Có thể: Diamond không expire, Bronze 6 tháng. Cấu hình `expiry_by_tier` (advanced).

Đề xuất MVP: 1 rule cho cả chuỗi, refine sau.

### 8.3. KH bị block, sau unblock — điểm expire trong thời gian block?

Quy tắc: pause expiry trong thời gian block, restore khi unblock. Audit rõ.

### 8.4. Merge cross-brand — điểm 2 brand có expiry khác?

Giữ nguyên expiry per entry (FIFO). Member primary thấy tất cả entries với expiry tương ứng.

## 9. Tham chiếu

- URD points engine UR-PTS-07: [`../02-requirements/part-03-points-engine.md`](../02-requirements/part-03-points-engine.md)
- Loyalty economics breakage section: [`loyalty-economics.md#redemption-rate--breakage`](loyalty-economics.md)
- Industry: Bond Loyalty Report 2024, Starbucks 2022 expiry change case study
