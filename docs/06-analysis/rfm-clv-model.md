# RFM & CLV — Mô hình phân khúc và dự báo giá trị KH

## TL;DR

> Với 3M KH, không thể "1 size fits all". RFM phân khúc KH theo 3 trục Recency/Frequency/Monetary → 5×5×5 = 125 cell → aggregate thành 11 personas. CLV dự báo giá trị KH dài hạn để **phân bổ marketing budget có ROI**. Áp dụng: Champions (5% top) deserve 80% retention budget; Hibernating (20%) cần re-engage cost thấp; Lost không spend nữa. Đây là **biggest leverage** của loyalty data — Excel không làm được, Reborn tự động cập nhật daily.

## 1. RFM scoring

### 1.1. Định nghĩa 3 trục

| Trục | Đo | Cách tính |
|---|---|---|
| **R**ecency | Ngày từ order gần nhất | Tính tới hôm nay |
| **F**requency | Số đơn 12 tháng gần nhất | COUNT(*) WHERE order_date >= NOW() - INTERVAL 12 MONTH |
| **M**onetary | Tổng chi tiêu 12 tháng | SUM(amount) cùng filter |

### 1.2. Scoring 1-5

Cho mỗi trục, chia KH thành 5 quintile (20% mỗi nhóm theo phân vị):

```
Recency quintile (smaller = better, recent buyer):
  Q1 (0-20%): 0-7 days   → R-score = 5 (best)
  Q2 (20-40%): 8-30 days → R-score = 4
  Q3 (40-60%): 31-60     → R-score = 3
  Q4 (60-80%): 61-180    → R-score = 2
  Q5 (80-100%): 180+     → R-score = 1 (worst)

Frequency quintile (larger = better):
  Q1 (top 20%): 30+ orders → F-score = 5
  Q2: 15-29   → F = 4
  Q3: 8-14    → F = 3
  Q4: 3-7     → F = 2
  Q5: 1-2     → F = 1

Monetary quintile (larger = better):
  Q1 (top 20%): 20M+ VND → M-score = 5
  Q2: 8-20M   → M = 4
  Q3: 3-8M    → M = 3
  Q4: 1-3M    → M = 2
  Q5: 0-1M    → M = 1
```

**Lưu ý:** Quintile threshold tính dynamic per period — refresh monthly để phân phối còn cân bằng khi KH grow.

### 1.3. Composite score

```
RFM = concatenate(R, F, M)
```

→ 5×5×5 = **125 unique cells**, từ `111` (worst) đến `555` (champion).

## 2. 11 personas (industry standard)

Aggregate 125 cells thành 11 segments có ý nghĩa hành động:

| Persona | Score range | % typical | Hành động marketing |
|---|---|---|---|
| **Champions** | R 4-5, F 4-5, M 4-5 | 5–10% | Reward, advocacy program, exclusive |
| **Loyal Customers** | R 3-5, F 3-5, M 3-5 (không Champions) | 15–20% | Upsell, recommend products, birthday |
| **Potential Loyalists** | R 4-5, F 1-3, M 1-3 | 10–15% | Engagement campaign, push để upgrade tier |
| **New Customers** | R 5, F 1, M 1-3 | 5–10% | Welcome series, 2nd order incentive |
| **Promising** | R 4, F 1, M 1 | 5–10% | Recommend complementary SKU |
| **Need Attention** | R 3, F 3, M 3 | 5–10% | Win-back voucher, survey |
| **About To Sleep** | R 2-3, F 1-2, M 1-2 | 8–12% | Re-engage campaign quan trọng |
| **At Risk** | R 1-2, F 3-5, M 3-5 | 5–10% | **High-value KH sắp churn — ưu tiên cao** |
| **Can't Lose** | R 1, F 4-5, M 4-5 | 1–3% | **Personal call/email từ Brand Mgr** |
| **Hibernating** | R 1-2, F 1-2, M 1-2 | 15–20% | Mass low-cost re-engage hoặc let go |
| **Lost** | R 1, F 1, M 1 | 10–15% | Minimal effort, có thể stop marketing |

## 3. Cách áp dụng tại Reborn

### 3.1. Cron daily

```sql
-- ClickHouse SQL
INSERT INTO rfm_scores
SELECT
  member_id,
  NOW() AS computed_at,
  ntile_recency_score AS r_score,
  ntile_freq_score AS f_score,
  ntile_monetary_score AS m_score,
  CONCAT(r_score, f_score, m_score) AS rfm_cell,
  assign_persona(r_score, f_score, m_score) AS persona,
  -- ...
FROM members_with_orders;
```

Sau cron → update `member.tags` với segment hiện tại.

### 3.2. Dashboard heatmap

```
Frequency
   ↑
   5  C   C   C   C   CH
   4  AR  AR  AR  L   L
   3  AR  NA  NA  L   L
   2  AS  AS  NA  PL  PL
   1  HB  HB  PR  N   N
      1   2   3   4   5  → Recency

CH = Champions, L = Loyal, PL = Potential Loyalist,
N = New, PR = Promising, NA = Need Attention,
AS = About to Sleep, AR = At Risk, C = Can't Lose,
HB = Hibernating
```

Click cell → list members → export → trigger campaign.

### 3.3. Trigger automation

| Persona change | Action |
|---|---|
| → At Risk | Auto-launch re-engage campaign với voucher hấp dẫn |
| → Champions | Add to "VIP list", priority CSKH support |
| → Hibernating | Tag, không spend marketing thêm |
| → Lost | Remove from active marketing list |

## 4. Customer Lifetime Value (CLV)

### 4.1. Đơn giản hoá: Historical CLV

```
Historical CLV = SUM(past_revenue) − SUM(past_marketing_cost_attributed)
```

Dùng cho retrospective analysis. Đơn giản, nhanh.

### 4.2. Predicted CLV (forward-looking)

#### Mô hình 1: Đơn giản

```
CLV = AOV × purchase_frequency × customer_lifespan_years × gross_margin
```

Ví dụ: AOV 100K × 24 đơn/năm × 5 năm × 25% margin = **3M VND CLV**.

#### Mô hình 2: BG/NBD + Gamma-Gamma (probabilistic)

Industry standard cho non-contractual settings (retail):

- **BG/NBD** (Beta-Geometric / Negative Binomial Distribution) — dự đoán số đơn future
- **Gamma-Gamma** — dự đoán avg monetary value

Inputs: Recency, Frequency, T (total observation time), Monetary

Output: `E[CLV | history]` với confidence interval.

Implementation: dùng package `lifetimes` (Python). Train monthly, score 3M customers < 30 phút.

### 4.3. CLV use cases

| Use case | CLV-based decision |
|---|---|
| Marketing budget allocation | Spend up to 30% × CLV trên KH retention |
| Tier benefit cost cap | Diamond benefit cost ≤ 3% × CLV |
| Acquisition cost target | CAC ≤ 25% × predicted CLV |
| CSKH SLA | High CLV → priority lane |
| Churn intervention | Save high-CLV at-risk first |

## 5. Cohort retention

Cohort = group of KH cùng đăng ký 1 tháng. Track retention rate over time:

| Cohort \ Month | 0 | 1 | 2 | 3 | 6 | 12 |
|---|---|---|---|---|---|---|
| 2026-01 | 100% | 70% | 55% | 48% | 35% | 25% |
| 2026-02 | 100% | 72% | 58% | 50% | 38% | — |
| 2026-03 | 100% | 75% | 62% | 53% | — | — |

**Cohort improving over time** = onboarding, product, marketing đang tốt hơn.

Hỗ trợ: A/B test welcome flow, đo cohort retention 90 ngày, decide rollout.

## 6. Churn prediction

### 6.1. Define churn

Cho siêu thị:
- **Churned** = no order trong 90+ ngày (cao hơn vì siêu thị mua thường xuyên)
- **At risk** = no order trong 45-89 ngày
- **Active** = order trong 45 ngày

### 6.2. Signals predicting churn

| Signal | Weight |
|---|---|
| Recency declining trend | High |
| Frequency declining trend | High |
| Last order significantly smaller | Medium |
| Stopped opening notifications | Medium |
| Stopped using app | Medium |
| 1 specific complaint not resolved | High |
| Competitor brand opens nearby | Low (external) |

### 6.3. Model

Simple: logistic regression / gradient boosting trên features RFM + delta + app usage.

Output: `P(churn next 90 days) ∈ [0, 1]`

→ Trigger intervention nếu P > 0.5.

## 7. Personalization opportunities

Với 3M KH × tích hợp loyalty + CSKH + analytics, có thể:

| Opportunity | Mechanism | ROI |
|---|---|---|
| Personalized reward catalog | RFM-based recommendation | +5–15% redemption |
| Birthday campaign | Trigger automated | +20-40% engagement during birthday week |
| Targeted re-engagement | At Risk persona | Save 10–20% of churn |
| Product recommendation | Basket analysis | +3–7% AOV |
| Time-of-day notification | Last login pattern | +30% open rate |
| Price elasticity per segment | Test by persona | +1–3% margin |

## 8. KPI cho RFM/CLV program

| KPI | Target |
|---|---|
| % KH segmented (have RFM score) | ≥ 95% of active |
| RFM refresh latency | < 24 hours |
| Champions retention rate | ≥ 95% YoY |
| At Risk → Active conversion (post intervention) | ≥ 30% |
| Avg CLV growth YoY | ≥ 10% |
| Cohort retention M12 | ≥ 25% (industry benchmark grocery) |

## 9. Implementation roadmap

**Phase 1 (M1-M2):** Compute RFM basic (no CLV yet), display heatmap, tag members.

**Phase 2 (M3-M4):** Predicted CLV simple model. Cohort dashboard. A/B test 1 campaign per persona.

**Phase 3 (M5-M6):** BG/NBD model. Churn prediction. Automated trigger campaigns.

**Year 2:** Real-time scoring, advanced ML, individualized rewards.

## 10. Tham chiếu

- URD analytics: [`../02-requirements/part-10-analytics-reports.md`](../02-requirements/part-10-analytics-reports.md)
- URD campaign segmentation: [`../02-requirements/part-06-promotions-campaigns.md#ur-promo-02-segment-kh-must`](../02-requirements/part-06-promotions-campaigns.md)
- SA data architecture (ClickHouse): [`../03-architecture/part-03-data-architecture.md#24-clickhouse-olap-layer`](../03-architecture/part-03-data-architecture.md)
- Industry: "Customer Centricity" by Peter Fader; `lifetimes` Python package
