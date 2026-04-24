# [BE · `analytics` (MỚI)] FitPro Phase 3.3 — Data Insights

**URD:** [Part 15 §5 UR-FITPRO-DATA](../../urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-data--data-insights)

## 1. Mục tiêu

"Data is Black Gold" (PDF trang 7): tổng hợp dataset dinh dưỡng + vận động của toàn mạng lưới → dashboard analytics dài hạn + external API có phí cho đối tác khoa học.

## 2. Kiến trúc

- **Data warehouse** riêng (Postgres / ClickHouse / BigQuery tuỳ khối lượng).
- **ETL pipeline**: Kafka events từ các service → staging → warehouse.
- **Cache layer** cho dashboard (Redis materialized metrics).
- **External API gateway** với rate limit + quota + billing tích hợp.

## 3. Data sources

| Source service | Event/Table | Dùng cho |
|---------------|-------------|----------|
| `market` | Check-in events, body metrics, journey status | Compliance + retention analytics |
| `sales` | Invoice, order source_type | Revenue mix, LTV |
| `guarantee` | MBG claims | Product fit metric |
| `loyalty` | Gift assignments, claims | Engagement |
| `nutrition` | Recommendations, compliance | Food intake trend |
| `integration` | Medlatec data | Anonymized blood panel trends |

## 4. Endpoint chính

| Endpoint | Mô tả |
|----------|-------|
| `GET /bizapi/analytics/overview` | Dashboard tổng quan Master BO |
| `GET /bizapi/analytics/retention-cohort` | Cohort retention analysis |
| `GET /bizapi/analytics/nutrition-trends` | Xu hướng dinh dưỡng VN (ẩn danh) |
| `POST /bizapi/analytics/external/query` | External API cho đối tác (có rate limit + billing) |

## 5. Privacy

- PDPA compliance: hash PII trước khi push warehouse.
- Role-based access: Master BO xem tất cả; BO Tier 1 xem nhánh của mình; external partner chỉ truy cập aggregated API.
- Audit log mọi query.

## 6. Timeline

V1 "fake" — materialized view trong `sales` + `market` đủ dùng cho vài tháng đầu.
V2 tách service — khi lượng query > 1M/ngày hoặc cần external partner quota.
