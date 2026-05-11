# Part 08 — Dashboard & Báo cáo

## 1. Executive Dashboard

**Menu › Dashboard › Executive**

Trang single-glance cho BOD/Sponsor. Refresh 5 phút.

```
┌─────────────────────────────────────────────────────────┐
│ Reborn Loyalty — Executive Summary    [📅 Last 30 days▼]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Active Members          New Members        Engagement  │
│  2.45M ↑ +1.2% MoM       45K ↑ +3.5%        52% ↑ +2pp  │
│                                                         │
│  Points Earned           Points Redeemed    Liability   │
│  2.4M today              1.2M today         1.8B VND    │
│                                                         │
│  ────────────────────────────────────────────────────── │
│                                                         │
│  [Chart] Points earned/redeemed trend 30 days           │
│                                                         │
│  ────────────────────────────────────────────────────── │
│                                                         │
│  Tier Distribution      Top 5 Stores by KH active       │
│  Bronze:    62%         1. STORE-A-001  45K active     │
│  Silver:    24%         2. STORE-A-005  38K           │
│  Gold:      11%         3. STORE-B-012  35K           │
│  Diamond:   3%          ...                            │
│                                                         │
│  ⚠️ Alerts: 2 campaigns over budget · 3 SLA at risk    │
└─────────────────────────────────────────────────────────┘
```

Filter: brand, period (today / 7d / 30d / 90d / 1y / custom).

Bấm vào metric → drill-down chi tiết.

Export PNG/PDF cho meeting.

## 2. Operational Dashboard

**Menu › Dashboard › Operational**

Chi tiết hơn cho Marketing + Brand Manager. Refresh 5 phút.

Sections:
- Daily transactions (count, avg amount, by hour heatmap)
- Daily points (earn vs redeem)
- Active campaigns (status, KPI, ROI)
- Tier movements today (upgrades, downgrades, grace entries)
- CSKH backlog (open tickets, SLA at risk)
- Notification delivery (sent, delivered, opened, clicked, failed)
- API health (auto-earn requests/min, error rate, P95 latency)

## 3. Báo cáo phân tích chuyên sâu

### 3.1. RFM Analytics

**Menu › Báo cáo › RFM**

Heatmap 5×5 Recency × Frequency, cell color = total Monetary.

```
F=5  [50K KH] [80K]  [120K] [200K] [Champions 150K]
F=4  [30K]   [50K]   [80K]  [110K] [At Risk 70K]
F=3  [20K]   [35K]   [50K]  [65K]  [Loyal 90K]
F=2  [15K]   [25K]   [35K]  [Potential 60K] [...]
F=1  [Lost   [Hibern.][Promising][New     [...]
      300K]   200K]   150K]    100K]
       R=1     R=2     R=3      R=4       R=5
```

Click cell → list KH → export hoặc trigger campaign.

11 personas auto-tagged. Tag áp dụng vào member.tags daily.

### 3.2. CLV (Customer Lifetime Value)

**Menu › Báo cáo › CLV**

- Distribution (histogram by CLV bucket)
- Top 100 KH by predicted CLV
- CLV by tier (avg, median)
- CLV trend over months

Click KH → trang profile với CLV breakdown.

### 3.3. Cohort retention

**Menu › Báo cáo › Cohort**

Matrix rows = signup month, cols = month-since-signup, cell = % active.

```
Cohort     M0   M1   M2   M3   M6   M12
2026-01    100% 70%  55%  48%  35%  25%
2026-02    100% 72%  58%  50%  38%  —
2026-03    100% 75%  62%  53%  —    —
2026-04    100% 78%  65%  —    —    —
```

Cohort cải thiện qua thời gian = onboarding tốt hơn.

Compare 2 cohorts side-by-side: chọn 2 row → **[Compare]**.

### 3.4. Liability report (Finance)

**Menu › Báo cáo › Liability**

Monthly:
- Outstanding points (chưa redeem)
- Outstanding liability VND (= outstanding × redemption_rate × value)
- Aging analysis: điểm phát hành 0-3m, 3-6m, 6-12m
- Breakage recognized this month
- Redemption recognized this month

Sign-off workflow: Finance reviewer → Finance approver → archive (không edit).

🔴 **Lưu ý kế toán:** Báo cáo này phục vụ IFRS 15 / VAS deferred revenue. Cần sign-off chính thức.

### 3.5. Campaign report

**Menu › Báo cáo › Campaigns**

List all campaigns + KPI:
- Reach
- Conversion rate
- Revenue
- Cost
- Incremental margin (so với baseline / control group)
- ROI

Filter status, period.

### 3.6. Per-store / Per-brand drill-down

Mọi báo cáo có filter:
- Brand: All / Brand A / Brand B
- Store: All / specific store / group
- Period: predefined / custom

Selection persistent qua session.

## 4. Export

| Format | Khi nào |
|---|---|
| Excel (.xlsx) | Default — KH thân thuộc |
| CSV | Cho data analyst, automation |
| PDF | Cho meeting, archive |
| PNG | Cho slide presentation |

Export > 50k rows → background job → email khi sẵn.

⚠️ Permission `report.export` cần thiết. Audit log cho export > 10k.

## 5. Scheduled email reports (Phase 2)

Cấu hình tự gửi báo cáo định kỳ:

**Menu › Báo cáo › Schedules**

1. Chọn báo cáo + filter
2. Schedule: daily 8h / weekly Mon / monthly 1st
3. Recipients: email list
4. Format: PDF / Excel
5. Save → tự gửi đúng giờ

## 6. API read-only cho BI tool

Cho khách hàng tự build BI (Tableau, PowerBI):

**Menu › Cài đặt › Integration › API Keys**

Tạo API key với scope `report.read` → expose endpoint:
- `/v1/reports/members?period=...`
- `/v1/reports/transactions?...`
- `/v1/reports/rfm-scores`

Rate limit + pagination. Audit usage.

## 7. KPI dashboard standard cho từng role

### 7.1. BOD weekly

- Active members trend
- Revenue impact loyalty
- Cross-brand penetration
- NPS

### 7.2. Marketing daily

- Campaign performance running
- Notification delivery
- Segment growth
- Top RFM cell

### 7.3. Operations daily

- API health
- DLQ size
- Notification fail rate
- Cron job status

### 7.4. Finance monthly

- Liability outstanding
- Cost incurred (redemption + campaign)
- Breakage recognized

## 8. Tham chiếu

- URD analytics: [`../02-requirements/part-10-analytics-reports.md`](../02-requirements/part-10-analytics-reports.md)
- RFM/CLV deep-dive: [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md)
- Loyalty economics: [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
