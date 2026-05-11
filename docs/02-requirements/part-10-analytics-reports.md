# Part 10 — Dashboard & Analytics

## 1. Mục tiêu

Cung cấp **insight thời gian thực** cho BOD, Marketing, Brand Manager để ra quyết định data-driven. Thay thế Excel manual hiện tại bằng dashboard tự động + RFM/CLV/cohort analysis chuyên sâu.

## 2. Phân lớp báo cáo

| Lớp | Đối tượng | Tần suất xem | Refresh |
|---|---|---|---|
| **L0 — Executive KPI** | BOD, Sponsor | Hàng ngày | 5 phút |
| **L1 — Operational Dashboard** | Marketing, Brand Mgr | Hàng giờ | 5 phút |
| **L2 — Analytical Deep-dive** | Marketing analyst | Hàng tuần | Hàng ngày |
| **L3 — Audit & Compliance** | Admin, Finance | Theo yêu cầu | Real-time |

## 3. KPI chính theo lớp

### L0 — Executive (top of tree)

| KPI | Công thức | Target year-1 |
|---|---|---|
| **Active members** | Members có ≥ 1 order trong 90 ngày | ≥ 2.4M (80% of 3M) |
| **Members growth** | New members month / total | ≥ 3%/tháng |
| **Engagement rate** | Members tích điểm tháng / total | ≥ 50% |
| **Redemption rate** | Points redeemed / earned (12m) | 30–60% |
| **Average tier distribution** | % mỗi tier | Bronze 60 / Silver 25 / Gold 12 / Diamond 3 |
| **Liability** | Tổng points × redemption_rate × value | Stable, kế toán hài lòng |
| **Cross-brand penetration** | Members có order ≥ 2 brand / total cross-eligible | ≥ 15% (year 2 target) |
| **CSKH NPS** | Avg score after resolve | ≥ 4.2 / 5 |

### L1 — Operational

- **Daily transactions:** total, by brand, by store, by hour
- **Daily points earned:** total, avg/order, top stores
- **Daily redemptions:** count, value
- **Campaign performance:** active campaigns, reach, conversion, cost-to-date, ROI
- **Tier movement:** upgrades/downgrades hôm nay
- **CSKH backlog:** open tickets, SLA at-risk

### L2 — Analytical

- **RFM segmentation** (Recency × Frequency × Monetary 5×5×5 = 125 cells; thường aggregate về 11 personas)
- **CLV** (predicted lifetime value)
- **Cohort retention** (members theo tháng đăng ký, % active sau 1/3/6/12 tháng)
- **Churn prediction** (signal: no order 60d, app uninstalled, opt-out)
- **Basket analysis** (SKU often bought together — input cho bundle promotion)
- **Channel attribution** (online vs offline vs app)

### L3 — Audit

- Ledger reconciliation reports
- Failed webhooks DLQ
- Admin actions audit (config changes, manual adjusts)
- API key usage

## 4. Yêu cầu

### UR-RPT-01 — Executive dashboard (Must)

| | |
|---|---|
| **Actor** | BOD, Tenant Admin, Marketing Mgr |
| **Mô tả** | 1 trang single-glance: hero metrics + xu hướng tuần/tháng + alert (red flag). Auto refresh. |
| **AC** | • Load < 2 s<br>• Mobile responsive<br>• Filter brand/store/period<br>• Export PNG/PDF cho meeting |

### UR-RPT-02 — RFM segmentation (Must)

| | |
|---|---|
| **Mô tả** | Engine tính RFM score cho mỗi KH: Recency (ngày từ order gần nhất → 1-5 score), Frequency (orders 12m → 1-5), Monetary (spend 12m → 1-5). Aggregate về 11 segments: Champions, Loyal, Potential Loyalist, New, Promising, Need Attention, About to Sleep, Can't Lose, At Risk, Hibernating, Lost. |
| **AC** | • Cron daily cập nhật score<br>• Heatmap RFM 5x5 visualization<br>• Click cell → list members<br>• Tag auto đính vào member.tags<br>• Input cho campaign targeting |
| **Phân tích sâu** | [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md) |

### UR-RPT-03 — CLV (Customer Lifetime Value) (Should)

| | |
|---|---|
| **Mô tả** | Predicted CLV = Avg Order Value × Purchase Frequency × Customer Lifespan (model BG/NBD + Gamma-Gamma hoặc đơn giản hoá). Hiển thị: top 100 KH by CLV, CLV distribution, CLV by tier. |
| **AC** | • Model retrain hàng tháng<br>• Confidence interval (P10, P50, P90)<br>• Drill-down per member |

### UR-RPT-04 — Cohort retention (Should)

| | |
|---|---|
| **Mô tả** | Cohort matrix: rows = tháng đăng ký, cols = month-since-signup, cell = % active. Cho phép compare cohort. |
| **AC** | • Hiển thị 12 cohort gần nhất<br>• Color heatmap<br>• Drill-down vào cohort cụ thể<br>• Compare 2 cohorts side-by-side |

### UR-RPT-05 — Campaign report (Must)

Xem [`part-06-promotions-campaigns.md#ur-promo-07-campaign-dashboard-must`](part-06-promotions-campaigns.md). Bổ sung:
- Compare current vs baseline (control group hoặc previous period)
- Incremental analysis: revenue tăng so với baseline / cost ≥ 3.0 mới ROI tốt

### UR-RPT-06 — Store/brand drill-down (Must)

| | |
|---|---|
| **Mô tả** | Mọi báo cáo có filter brand (NULL = all), store (NULL = all), period. Selection persistent trong session. |
| **AC** | • Multi-select brand/store<br>• Compare 2 stores side-by-side<br>• Top 10 / Bottom 10 lists |

### UR-RPT-07 — Liability report (Must, finance)

| | |
|---|---|
| **Mô tả** | Báo cáo monthly cho Finance: tổng outstanding points × redemption_rate × value = liability. Breakage forecast. Aging analysis (điểm phát hành theo year). |
| **AC** | • Cron monthly export<br>• Sign-off workflow Finance reviewer + approver<br>• Audit trail không sửa được sau approve |
| **Phân tích sâu** | [`../06-analysis/loyalty-economics.md#liability-breakage`](../06-analysis/loyalty-economics.md) |

### UR-RPT-08 — Export & API (Should)

| | |
|---|---|
| **Mô tả** | Mọi báo cáo có nút Export Excel/CSV. Cung cấp API read-only cho external BI (Tableau, PowerBI, Metabase) qua API key có scope `report.read`. |
| **AC** | • Export job background cho dataset lớn (> 50k rows)<br>• Email notification khi export sẵn<br>• API có rate limit + pagination |

### UR-RPT-09 — Scheduled email reports (Could)

| | |
|---|---|
| **Mô tả** | User chọn báo cáo + schedule (daily 8h, weekly Mon, monthly 1st). Hệ thống tự gửi email với PDF/Excel attachment. |
| **AC** | • Up to 10 schedules per user<br>• Failed delivery → notification |

### UR-RPT-10 — Custom report builder (Could)

| | |
|---|---|
| **Mô tả** | Drag-and-drop builder cho user tạo báo cáo tuỳ chỉnh: chọn metric, dimension, filter, viz type. Save & share. |
| **AC** | • Phase 2 feature — không phải MVP<br>• Sandbox first |

## 5. Data freshness & accuracy

| Metric | Latency | Source |
|---|---|---|
| Real-time KPI (active members, today orders) | < 5 phút | Redis cache + materialized view |
| RFM score | 24h | Cron daily batch |
| CLV prediction | 30 ngày | ML model monthly |
| Cohort | 24h | Cron daily |
| Liability | EOD | Cron daily |
| Audit logs | Real-time | Direct query |

## 6. Tham chiếu

- **RFM/CLV chi tiết:** [`../06-analysis/rfm-clv-model.md`](../06-analysis/rfm-clv-model.md)
- **Liability economics:** [`../06-analysis/loyalty-economics.md`](../06-analysis/loyalty-economics.md)
- **Data architecture (OLAP):** [`../03-architecture/part-03-data-architecture.md`](../03-architecture/part-03-data-architecture.md)
- **HDSD đọc dashboard:** [`../09-userguides/part-08-reports.md`](../09-userguides/part-08-reports.md)
