# Loyalty Economics — Phân tích kinh tế chương trình loyalty

## TL;DR

> Loyalty program ở siêu thị bán lẻ kiếm lời (hoặc lỗ) **không phải từ doanh thu thuần**, mà từ **chênh lệch giữa cost-per-point thực và perceived-value-per-point** + **breakage** (điểm hết hạn không tiêu). Với rate 1 điểm = 100đ giảm trực tiếp, cost thực ~50–70% (do margin), breakage 15–30%, redemption rate 30–60% — chương trình tốt có **incremental margin uplift 3–7%**. Nếu thiết kế sai (rate cao, không expire, không cap multiplier) — **có thể lỗ 1–3% margin**. Cần monthly P&L tracking, không "fire-and-forget".

## 1. Các khái niệm kinh tế cơ bản

### 1.1. Cost per point (CPP)

```
CPP = giá trị thực 1 điểm phải chi cho doanh nghiệp
    = redemption_rate × value_per_point × (1 − breakage_rate) × (1 − gross_margin_impact)
```

**Ví dụ:**
- Rate: 1 điểm = 100đ (redemption value)
- Redemption rate: 50% (50% điểm phát hành sẽ được tiêu)
- Breakage: 25% (25% điểm không bao giờ tiêu — đã tính trong redemption rate)
- Gross margin: 25% (siêu thị) → khi KH tiêu 100đ điểm, doanh nghiệp chỉ "thiệt" 75đ doanh thu, 25đ vẫn lãi cố định
- **CPP = 100 × 0.50 × (1 − 0) × 0.75 = 37.5đ/điểm**
- Tức 1 điểm thực sự tốn 37.5đ, không phải 100đ

### 1.2. Earn ratio

```
Earn ratio = đồng VND chi tiêu / điểm tích được
```

Ví dụ: 10.000đ = 1 điểm → earn_ratio = 10.000

### 1.3. Discount equivalent

```
Discount % = value_per_point / earn_ratio
           = 100 / 10.000 = 1%
```

→ Loyalty rate 1 điểm = 100đ / 10K mua = **giảm 1% effective** cho mọi KH dùng điểm.

### 1.4. Breakage

```
Breakage rate = % points expired_without_redemption / points_earned
```

Industry benchmark: **15–30% breakage** cho program siêu thị.

### 1.5. Liability

```
Outstanding liability = Σ(unredeemed_points) × value_per_point × expected_redemption_rate
```

Đây là khoản nợ doanh nghiệp đang gánh. Cần báo cáo cho kế toán hàng tháng. IFRS 15 + VAS yêu cầu deferred revenue cho loyalty.

## 2. P&L model cho khách hàng siêu thị (giả định baseline)

| Tham số | Giá trị | Nguồn |
|---|---|---|
| Doanh thu chuỗi (năm 2025) | 30 tỷ/tháng | Ước từ 300 store × 100M/store/tháng |
| Doanh thu năm | 360 tỷ | |
| Số txn năm | 54.7M (150K/ngày × 365) | Q&A |
| Avg order value | 6.580đ × 1.000 ≈ 6.580 (nhỏ?) | → ước lại |
| **Hiệu chỉnh AOV** | **65.800đ/đơn** | Hợp lý hơn cho siêu thị |
| **Tổng revenue/year** | **360 tỷ** | |
| Gross margin | 25% (siêu thị benchmark) | |
| Active members | 2.4M (80% of 3M) | |
| Engagement rate | 50% có tích điểm tháng | |

**Baseline (chưa có Reborn):**
- Marketing agency cost: ~1B/năm
- Goldmem/Access/Excel/Supporter operational cost: ~200M/năm (1-2 FTE thao tác)
- KH cross-brand recognition: ~0% (data tách)

### 2.1. Phương án A — Conservative (1 điểm = 50đ, expire 12 tháng)

| Hạng mục | Tính | Năm 1 |
|---|---|---|
| Points issued | 360 tỷ × 80% engagement / 10K = 28.8M điểm | 28.8M |
| Points value issued (gross) | × 50đ | 1.44B |
| Redemption rate (estimate) | 40% | |
| Points redeemed | 28.8M × 40% | 11.5M |
| Breakage | 60% | 17.3M điểm expire |
| Cost (after margin offset) | 11.5M × 50đ × 0.75 | 432M |
| Total CPP ratio | 432M / 28.8M điểm | 15đ/điểm |
| Effective discount % | 15đ / 12.500đ avg order × 1/8 điểm-per-order | ~0.12% |
| **Marketing agency thay thế** | | +1B |
| **Cross-brand upsell** (5% từ recognition) | 360B × 5% × margin 25% | +4.5B |
| **Net benefit** | -432M cost + 1B + 4.5B | **+5.07B/year** |

### 2.2. Phương án B — Aggressive (1 điểm = 100đ, không expire)

| Hạng mục | Năm 1 |
|---|---|
| Points issued | 28.8M |
| Points value issued (gross) | 2.88B |
| Redemption rate (no expire = higher) | 65% |
| Breakage | 35% |
| Cost (after margin) | 28.8M × 65% × 100đ × 0.75 = 1.4B |
| Liability accumulating | +35% × 100đ × 28.8M = 1.0B/năm tích luỹ |
| Cross-brand upsell | +4.5B |
| **Net** | -1.4B - liability + 1B agency + 4.5B = **+4.1B/year nhưng liability growing** |

### 2.3. Khuyến nghị: Phương án A+

| Cấu hình | Giá trị |
|---|---|
| Earn ratio | 1 điểm / 10.000đ chi tiêu |
| Value per point | 50đ (giảm trực tiếp tại quầy) |
| Expire | 12 tháng kể từ ngày tích (after_months mode) |
| Min spend | 50.000đ/đơn |
| Tier multiplier | 1.0× / 1.2× / 1.5× / 2.0× |
| Birthday bonus | × 3 trong tuần sinh nhật |
| Welcome bonus | 500 điểm (cap × 1 lifetime) |
| Redemption threshold | Min 500 điểm/lần |

**Lý do:**
- Earn ratio 1/10K + value 50đ → effective discount 0.5% — bền vững
- Expire 12 tháng → breakage tự nhiên 20-30% → cost thực thấp
- Multiplier có cap → không cho KH "farm" điểm
- Tier multiplier khuyến khích spend more

## 3. Redemption rate & Breakage

### 3.1. Industry benchmark

| Industry | Redemption rate | Breakage |
|---|---|---|
| Grocery / Supermarket | 30–50% | 20–35% |
| Coffee chain | 60–80% | 10–20% |
| Airline | 70–85% | 5–10% |
| Hotel | 50–70% | 15–25% |
| Department store | 40–60% | 20–30% |

→ Mục tiêu cho khách: **40–55% redemption, 20–30% breakage**.

### 3.2. Yếu tố ảnh hưởng

**Tăng redemption** (cost cao hơn):
- ✘ Catalog hấp dẫn (variety, value)
- ✘ Reminder notification trước expire
- ✘ Easy redemption flow (1-tap)
- ✘ Min redemption thấp (đổi sớm được)

**Giảm redemption / tăng breakage**:
- ✓ Threshold cao (cần 5K điểm mới đổi được — KH lười tích đủ)
- ✓ Expire ngắn
- ✓ Reward không hấp dẫn
- ✓ Min spend khi tiêu (ép phải mua thêm)

Trade-off: redemption thấp → cost thấp nhưng customer satisfaction giảm → churn risk.

## 4. Multiplier impact

Khi cấu hình `stack_multiplier = true`:
- Diamond tier × 2 + Birthday × 3 + Weekend campaign × 2 = **× 12 stacking!**
- Đơn 1M = bình thường 100 điểm = 5.000đ value = bừa
- Stack × 12 = 1.200 điểm = 60.000đ value → 6% effective discount → vượt margin (25% gross) → lỗ

**Khuyến nghị:** `stack_mode = single_highest` (default) hoặc cap `max_stack_factor = 4`.

## 5. Tier upgrade game-ification

Tier thúc đẩy KH chi thêm để upgrade:
- KH gần ngưỡng → "Push spending": campaign "Còn 500 điểm để lên Vàng"
- KH ở grace period → tự push để duy trì

**Behavioral economics:** KH có "tier-up motivation" mạnh hơn "+10% discount" (Loss aversion + goal gradient effect).

**ROI tier program:** Chi phí benefit upgrade (free ship, voucher) ~3-5% incremental cost. Nếu push được +10% AOV cho KH gần ngưỡng → ROI dương.

## 6. Liability accounting

Theo IFRS 15 / VAS:
- Khi phát hành điểm = recognise deferred revenue (= expected redemption × value)
- Khi điểm tiêu = release deferred → revenue
- Khi điểm expire = release deferred → other income

```
Phát hành 100 điểm × giá trị 50đ = liability 5.000đ
Expected redemption 50% → liability adjusted = 2.500đ
Khi KH tiêu 30 điểm → release 1.500đ revenue
Khi 20 điểm expire → release 1.000đ to "Other income"
```

**Báo cáo monthly** cho Finance: outstanding liability, breakage recognized, redemption recognized.

## 7. Sensitivity analysis

Biến động net benefit theo 3 tham số chính:

| Earn ratio | Value/point | Redemption rate | Net benefit (estimate) |
|---|---|---|---|
| 1/5K | 100đ | 50% | -2.1B (lỗ) |
| 1/10K | 100đ | 50% | +1.2B |
| 1/10K | 50đ | 50% | +4.5B |
| 1/20K | 50đ | 50% | +5.8B |
| 1/10K | 50đ | 30% (with expire) | +5.5B |
| 1/10K | 50đ | 80% (no expire) | +2.0B |

→ Sweet spot: **earn 1/10K, value 50đ, expire 12mo (redemption ~40%)** = +4.5B net.

## 8. KPI tracking & alerts

| KPI | Target | Alert if |
|---|---|---|
| Active member rate | ≥ 50% | < 40% |
| Redemption rate (12m rolling) | 35–55% | > 70% (cost up) hoặc < 25% (CX issue) |
| Breakage rate | 20–35% | < 10% (giving away) hoặc > 50% (đề đặt quá khó tiêu) |
| Liability ratio | < 2% of monthly revenue | > 5% |
| Cost-per-active-member | < 50K/year | > 100K |
| Incremental margin uplift | +3–7% | < +1% (program not working) |
| AOV uplift (member vs non-member) | +15–25% | < +10% |

## 9. Khuyến nghị triển khai

### Phase 1 (M1–M2): Setup conservative

- Earn ratio 1/10K
- Value 50đ
- Expire 12 tháng
- No stack multiplier
- Welcome 500 điểm × 1
- Tier 4 levels (Bronze/Silver/Gold/Diamond)

### Phase 2 (M3–M4): Tune based on data

- Đo redemption rate 60 ngày đầu
- Nếu > 60% → tăng earn ratio (1/15K) hoặc giảm value (40đ)
- Nếu < 30% → cải thiện catalog + reminder
- Bắt đầu campaign test với KH high CLV

### Phase 3 (M5–M6): Optimize

- A/B test multiplier policies
- Personalized reward based on RFM segment
- Birthday + tier-up campaigns
- Quarterly P&L review

## 10. Khi nào program FAIL?

Cảnh báo:
- ❌ Marketing tự ý launch "× 5 điểm" mà không pricing review → bleed margin
- ❌ Không expire → liability accumulating → kế toán flag
- ❌ Redemption catalog yếu → KH frustrated, churn cao hơn không có program
- ❌ Tech debt rule engine → không thể thay đổi rule nhanh → marketing thoát ra ngoài chương trình
- ❌ Cross-brand data leak → trust mất → KH opt-out

## 11. Tham chiếu

- URD points engine: [`../02-requirements/part-03-points-engine.md`](../02-requirements/part-03-points-engine.md)
- URD rewards: [`../02-requirements/part-05-rewards-redemption.md`](../02-requirements/part-05-rewards-redemption.md)
- Point expiry strategy: [`point-expiry-strategy.md`](point-expiry-strategy.md)
- RFM segmentation cho campaign: [`rfm-clv-model.md`](rfm-clv-model.md)
- Industry benchmark: Bond Loyalty Report 2024, Capgemini "Fixing the Cracks" 2023
