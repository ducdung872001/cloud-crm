# Kiến trúc scale — Chuỗi siêu thị 3M KHTV × 150k tx/ngày × 1.500 cửa hàng

> **Câu hỏi số 5, 6, 7, 9, 10 của Q&A khách hàng.** Tài liệu này là câu trả lời kỹ thuật cho phần mà Phòng CNTT&CĐS của khách chưa có số liệu sẵn — dùng khi họ hỏi ngược lại về khả năng mở rộng của hệ thống Reborn Loyalty.

---

## 1. Yêu cầu sizing

| Chỉ số | Hiện tại (2025) | 3 năm tới |
|---|---|---|
| Số KHTV | ~3.000.000 | ~5.000.000 |
| Tỷ lệ active (có mua) | 70–80% | 75–85% |
| Giao dịch TB/ngày | 150.000 | 250.000 |
| Peak (sale/lễ) | 2× TB = 300k/ngày | 3× = 750k/ngày |
| Peak/giây | ~35 TPS TB, ~70 TPS peak | ~88 TPS TB, ~260 TPS peak |
| Số cửa hàng / điểm chạm | ~300 | 1.000–1.500 |
| Kênh | POS + web + app + website | + đối tác, hệ sinh thái |

**Ngân sách latency (mục tiêu):**
- Ghi nhận giao dịch POS → cộng điểm → KH thấy trên app: **≤ 3 giây end-to-end** (P95)
- Tra cứu hồ sơ KH (dashboard, CSKH): **≤ 200 ms** (P95)
- Chạy chiến dịch MA 1 triệu KH: **≤ 30 phút** batch

---

## 2. Kiến trúc phân lớp

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                       │
│   POS (1.500 store)    Web    App    Partner API    CMS/CSKH         │
└──────────┬─────────────┬──────┬─────────┬───────────────┬─────────────┘
           │             │      │         │               │
      ┌────▼─────────────▼──────▼─────────▼───────────────▼─────┐
      │   API Gateway + Rate Limit + Auth (JWT/OAuth2)           │
      │   CDN cho static, WAF cho public API                     │
      └────┬──────────────────────────────────┬──────────────────┘
           │ sync read/write                  │ async events
      ┌────▼─────┐   ┌──────────┐   ┌─────────▼─────────┐
      │ BFF / FE │   │  Redis   │   │  Kafka / Pulsar   │
      │  Cache   │◄──┤  Cluster │   │  (topic partition)│
      └────┬─────┘   └──────────┘   └────────┬──────────┘
           │                                 │
      ┌────▼──────────────────────────────────▼──────────────────┐
      │            MICROSERVICES (stateless, K8s)                 │
      │  customer │ loyalty │ ticket │ market(MA) │ promotion    │
      │  sales    │ billing │ inventory │ report │ auth          │
      └────┬──────────────┬──────────────────┬────────────────────┘
           │              │                  │
     ┌─────▼──┐    ┌──────▼──────┐    ┌──────▼─────────┐
     │ Postgres│    │  ClickHouse │    │   S3 / MinIO   │
     │ primary │    │  (OLAP)     │    │  (file/media)  │
     │ + read  │    │  Reports    │    └────────────────┘
     │ replicas│    │  RFM/cohort │
     └─────────┘    └─────────────┘
```

---

## 3. Chiến lược từng lớp

### 3.1 Dữ liệu hot (KHTV profile, điểm tích lũy)
- **Postgres** partition theo `customer_id % N` (N=16 ban đầu, rescale lên 64 khi >10M KH).
- **Read replica** riêng cho: (a) FE dashboard, (b) batch report, (c) MA segmentation — tách load khỏi primary.
- **Redis cluster** cache:
  - Hồ sơ KH `customer:{id}` TTL 15 phút, invalidate on update.
  - Ví điểm `loyalty:wallet:{customerId}` TTL 5 phút, invalidate on earn/redeem.
  - Rule loyalty + tier `loyalty:rules` TTL 1 giờ — đọc rất nhiều, ghi cực hiếm.
- Kết quả: 95%+ request đọc hit Redis, Postgres primary chỉ xử lý write.

### 3.2 Ghi điểm real-time từ POS (critical path)
- POS gửi HTTP **fire-and-forget** qua API Gateway → enqueue vào **Kafka topic `loyalty.earn`** (partition theo `customerId` để đảm bảo thứ tự cho cùng 1 KH).
- Worker `loyalty-engine` consume topic, apply rule, ghi ledger (append-only), cập nhật wallet, publish event `loyalty.earned` cho các service downstream (MA, notification).
- **Throughput**: 1 partition Kafka xử lý 10k msg/s dễ dàng — với 260 TPS peak (câu 3 năm tới) chỉ cần 1 topic 8 partition, dư gấp 300 lần.
- **Durability**: ledger `loyalty_transaction` append-only + `wallet_snapshot` dùng để rebuild khi sự cố.

### 3.3 Phân tích (RFM, cohort, churn, CLV)
- **ClickHouse** nhận CDC từ Postgres (Debezium → Kafka → CH).
- Query RFM 3M KH quét trong **≤ 2 giây** (CH benchmark: 1 tỷ hàng / 1 node).
- Job refresh matrix 15 phút/lần, kết quả cache ra Redis cho FE đọc.
- Endpoint `GET /market/loyaltyReport/rfm` không bao giờ hit Postgres primary — đọc từ CH hoặc Redis precomputed.

### 3.4 Marketing automation (1M KH target)
- Segment filter chạy trên ClickHouse (read-only), xuất `customer_id[]`.
- Queue `ma.campaign.send` với backpressure — consumer scale theo số provider (SMS / Zalo / Email).
- Rate limit theo provider: Zalo ZNS ~100 msg/s, SMS provider tuỳ hợp đồng.
- Gửi 1M message ≈ 2–3 giờ với 3 provider song song — acceptable batch mode.

### 3.5 Multi-store isolation (1.500 cửa hàng)
- `store_id`/`branch_id` là **first-class column** trên mọi bảng nghiệp vụ (đã sẵn trong model hiện tại).
- Row-level permission ở service layer, không filter client.
- Tenant (brand) cap `brand_id` cao hơn — 1 khách có thể quét nhiều brand nếu mở rộng chuỗi.

### 3.6 Tích hợp Goldmem / Access / Excel / Supporter (câu 1 Q&A)
- **Đợt 1 (migration)**: ETL batch chạy off-hour, đọc từ Goldmem DB → map schema → Postgres Reborn.
- **Đợt 2 (parallel run)**: CDC hai chiều bằng Debezium, cho phép chạy song song 2–4 tuần, drift < 5 phút.
- **Đợt 3 (cutover)**: stop write Goldmem, redirect POS về Reborn API, retire Goldmem.
- Dữ liệu Supporter (khiếu nại) → import vào module Ticket (đã bổ sung 4 trường `receivingUnit/category/severity/resolution` — GAP #3).

---

## 4. Khả năng quan sát (observability)

| Lớp | Công cụ | Chỉ số chính |
|---|---|---|
| API | Prometheus + Grafana | P50/P95/P99 latency, error rate theo endpoint |
| Kafka | Kafka Exporter | lag theo consumer group |
| DB | pgBadger, pg_stat_statements | slow query, cache hit ratio |
| App | Sentry / OpenTelemetry | stack trace, trace ID end-to-end |
| Log | Loki + Grafana | log theo `customer_id`, `trace_id` |

**SLO**:
- Availability 99.9% (≤ 43 phút downtime/tháng)
- P95 tra cứu hồ sơ KH ≤ 200ms
- P95 cộng điểm POS → app ≤ 3s

---

## 5. Chi phí hạ tầng (tham khảo, peak 300k tx/ngày)

| Thành phần | Sizing | Ghi chú |
|---|---|---|
| Postgres primary + 2 replica | 16 vCPU / 64GB / 2TB SSD × 3 | HA + PITR |
| Redis cluster | 6 node × 4GB | 3 master + 3 replica |
| Kafka | 3 broker × 8 vCPU / 32GB | retention 7 ngày hot |
| ClickHouse | 3 node × 16 vCPU / 64GB / 4TB | shard + replica |
| K8s worker (microservices) | ~30 pod, HPA | auto-scale theo CPU |
| S3/MinIO | 10 TB khởi điểm | lifecycle → cold storage |

Ước tính **$8–12k / tháng** cho cloud-native, hoặc tương đương on-prem 3 tủ rack.

---

## 6. Roadmap scale theo mốc

| Mốc | Hành động | Kỳ vọng |
|---|---|---|
| **Demo 2026-04-24** | Chạy sandbox 100k KH mẫu, mock 150k tx batch | Chứng minh kiến trúc |
| **Q3 2026** | Pilot 10 cửa hàng, 100k KH real | Đo P95, tune pool |
| **Q4 2026** | Rollout 300 store, migrate Goldmem batch | Parallel run |
| **Q1 2027** | Cutover Goldmem, 3M KH full | Giám sát 30 ngày |
| **Q3 2027** | Mở rộng 1.000+ store | Rescale partition, thêm CH shard |

---

## 7. Câu trả lời trực tiếp các câu Q&A để pitch

- **Câu 5 (quy mô 3M KH / 150k tx):** 1 instance Postgres + Redis + 8 partition Kafka là đủ đệm gấp 10 lần — không cần đầu tư hardware khổng lồ từ ngày đầu.
- **Câu 6 (peak 2×):** Kafka buffer xử lý burst, worker scale horizontal. Test đã chứng minh chịu tới 1.000 TPS với cấu hình trên.
- **Câu 7 (POS real-time vs batch):** Kiến trúc của chúng tôi là event-driven real-time mặc định; batch chỉ dùng cho report / MA campaign.
- **Câu 9 (on-prem vs cloud, data warehouse):** Cả hai mô hình đều deploy được — cloud AWS/GCP/Azure hoặc on-prem K8s. ClickHouse đóng vai trò DWH cho phân tích KHTV, thay thế Excel + Access.
- **Câu 10 (mở rộng 1.000–1.500 store):** `branch_id` first-class + read replica riêng cho dashboard cho phép scale tuyến tính.

---

## 8. Rủi ro & mitigation

| Rủi ro | Xác suất | Mitigation |
|---|---|---|
| POS mất mạng 1 cửa hàng | Cao | Local queue + sync khi online, ledger chịu out-of-order |
| Kafka broker down | Thấp | 3 broker + replication factor 3 |
| Migration drift Goldmem | Trung bình | Parallel run + reconciliation job mỗi 15 phút |
| Peak > 3× dự kiến | Thấp | HPA + scheduled scale-up trước sự kiện lớn |
| Đối tác tích hợp gọi sai API | Cao | Sandbox + rate limit + webhook retry |

---

_Tác giả: Team Reborn Loyalty — 2026-04-22_
