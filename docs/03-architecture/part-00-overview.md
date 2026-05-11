# Part 00 — Tổng quan SA

## 1. Mục đích

Tài liệu **Solution Architecture Document (SAD)** mô tả kiến trúc kỹ thuật của **Reborn Loyalty Platform** cho chuỗi siêu thị 2 brand, 300+ store, 3M KH.

SAD trả lời:
- Hệ thống xây bằng công nghệ gì?
- Module/service tổ chức ra sao?
- Data chảy thế nào với 3M KH × 500 TPS peak?
- Tích hợp POS bên ngoài như thế nào?
- Đảm bảo bảo mật, hiệu năng, độ tin cậy ra sao?
- Triển khai, scale, recovery thế nào?
- Tại sao quyết định A thay vì B? (ADR)

SAD KHÔNG mô tả: nghiệp vụ chi tiết (xem [URD](../02-requirements/)), cách user thao tác (xem [HDSD](../09-userguides/)), hay phân tích kinh tế (xem [analysis](../06-analysis/)).

## 2. Phạm vi

### 2.1. In scope

- **Loyalty engine** (cốt lõi): points, tier, rewards, expire, campaign
- **Customer 360°**: member profile, merge cross-brand
- **API gateway** + integration với POS bên ngoài
- **Notification service**: SMS/Email/Zalo OA outbound
- **Analytics layer**: RFM, CLV, dashboard
- **Multi-tenant, multi-brand, multi-branch** architecture
- **Hạ tầng** đề xuất (cloud-agnostic + on-prem hybrid option)
- **Migration pipeline** từ Goldmem/Access/Excel/Supporter

### 2.2. Out of scope

- POS bán hàng (giữ nguyên hệ thống khách)
- Kho, mua hàng, vận chuyển — không thuộc loyalty
- e-invoice (TT78/NĐ123) — không thuộc loyalty
- BPM engine — chỉ tham chiếu cho automation đơn giản
- Hardware POS terminal — out of scope

## 3. Đối tượng đọc

| Đối tượng | Phần ưu tiên |
|---|---|
| Tech Lead / Architect | Tất cả part |
| Backend Dev (mới) | Part 01, 02, 04, 05 |
| Frontend Dev | Part 02 (domain), 05 (API) |
| DevOps / SRE | Part 04, 06, 07, 08 |
| Security Reviewer | Part 05, 06 |
| QA Lead | Part 10 |
| Đối tác tích hợp | Part 05 |
| PM | Part 00, 01, 10 |

## 4. Kiến trúc mức cao — 3 câu

> **Reborn Loyalty Platform** là **multi-tenant SaaS** xây trên **microservices** (Java Spring Boot), với **frontend SPA** (React 18 + Vite) gọi tới nhiều backend service qua **API gateway** (URL prefix routing). Tenant cô lập qua `tenant_id` + header `Hostname`, xác thực qua **SSO trung tâm Reborn** (OAuth/OIDC), phân quyền RBAC.
>
> Hệ thống nhận data từ **POS bên ngoài của khách** qua REST API với **idempotent webhook + dead letter queue**, xử lý tích/tiêu điểm trong **Loyalty Engine** với **append-only ledger** trên PostgreSQL, cache hot data trên Redis, async jobs qua RabbitMQ/Kafka.
>
> Dashboard và analytics chạy trên **read replica + materialized view + ClickHouse** (OLAP cho RFM/CLV/cohort), gửi notification qua **Email/SMS/Zalo OA** với throttle 100k/giờ.

## 5. Architectural Drivers

| Driver | Yêu cầu | Hậu quả kiến trúc |
|---|---|---|
| **3M KH × 500 TPS peak** | Latency P95 < 500ms cho auto-earn | Async queue, batch ledger, cache, horizontal scale |
| **Multi-brand isolation** | scope per_brand, không leak cross-brand | `scope_id` column ở mọi loyalty entity + row-level filter |
| **POS giữ nguyên** | Integration qua API, không phụ thuộc POS implementation | REST API + webhook + idempotency + DLQ |
| **Migration data 4 nguồn** | Goldmem/Access/Excel/Supporter → 1 nguồn | ETL pipeline + dedupe + dry-run |
| **Availability 99.5%** | RTO < 4h | Stateless services + replica + backup |
| **Audit & compliance** | NĐ 13/2023, audit 7 năm | Append-only ledger + audit_log immutable |
| **Marketing automation** | Throttle 100k msg/giờ, segment 3M KH | Queue đệm + worker pool + segment cache |
| **Cost-effective** | Budget < 1B/năm OPEX | Cloud cost optimization, đề xuất hybrid hosting |

## 6. Stack tổng quan

```
┌────────────────────────────────────────────────────────┐
│ CLIENT                                                  │
│  ├─ Admin SPA (React 18 + Vite + TypeScript)           │
│  ├─ Member App (TBD: React Native / Zalo Mini App)     │
│  └─ External POS — giữ nguyên hệ khách                 │
└──────────────────┬─────────────────────────────────────┘
                   │ HTTPS / REST / JSON
┌──────────────────┴─────────────────────────────────────┐
│ API GATEWAY — 2 hosts                                   │
│                                                         │
│  reborn.vn (legacy, chỉ auth)                          │
│  └─ /authenticator/*  → SSO, JWT, OAuth/OIDC           │
│                                                         │
│  biz.reborn.vn (business)                              │
│  ├─ /customer/*       → Member 360°, dedupe            │
│  ├─ /market/*         → Loyalty engine                 │
│  ├─ /care/*           → CSKH ticket, warranty          │
│  ├─ /notification/*   → SMS/Email/Zalo OA              │
│  ├─ /analytics/*      → RFM/CLV/cohort                 │
│  ├─ /org/*            → Org chart, RBAC, permission    │
│  ├─ /sales/*          → Reuse from platform            │
│  ├─ /inventory/*      → Reuse from platform            │
│  ├─ /billing/*        → Reuse from platform            │
│  └─ /bpmapi/*         → BPM Engine (advanced earn)     │
│                                                         │
│  Cross-cutting: Kong/Nginx — rate limit, JWT verify,    │
│  Hostname header injection                              │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────┴─────────────────────────────────────┐
│ MICROSERVICES (Java Spring Boot, stateless, k8s)        │
│  ├─ market-service       Loyalty engine (chính)         │
│  ├─ customer-service     Member entity, dedupe          │
│  ├─ care-service         Ticket, warranty               │
│  ├─ notification-service Email/SMS/Zalo OA              │
│  ├─ analytics-service    RFM/CLV/cohort batch           │
│  └─ auth-service         JWT, API key, SSO              │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────┴─────────────────────────────────────┐
│ DATA LAYER                                              │
│  ├─ PostgreSQL 14 (primary + 2 read replicas)           │
│  │   ├─ Sharded by tenant_id; ledger partitioned date   │
│  ├─ Redis Cluster (cache + session + rate limit)        │
│  ├─ ClickHouse (OLAP cho analytics)                     │
│  ├─ S3-compatible (object storage: avatar, attachment)  │
│  └─ Elasticsearch (search member by name/phone fuzzy)   │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────┴─────────────────────────────────────┐
│ MESSAGE QUEUE                                           │
│  ├─ RabbitMQ — webhook DLQ, notification queue          │
│  └─ Kafka (year 2 nếu cần event streaming bigger)       │
└────────────────────────────────────────────────────────┘
```

Chi tiết: [`part-04-microservices.md`](part-04-microservices.md) + [`part-03-data-architecture.md`](part-03-data-architecture.md).

## 7. Đối tượng đọc nhanh

| Câu hỏi | Đi đâu |
|---|---|
| Hệ thống có gì? | Part 01 + Part 04 |
| Domain loyalty mô hình hoá thế nào? | Part 02 |
| DB schema ra sao? | Part 03 |
| API contract? | Part 05 + [`../04-api/loyalty-openapi.yaml`](../04-api/loyalty-openapi.yaml) |
| 3M KH có chạy nổi không? | Part 07 |
| Triển khai thế nào? | Part 08 |
| Tại sao chọn PostgreSQL/RabbitMQ/...? | Part 09 (ADR) |
| Có rủi ro gì? | Part 10 + [`../08-operations/risk-register.md`](../08-operations/risk-register.md) |

## 8. Lịch sử

| Version | Ngày | Tác giả | Ghi chú |
|---|---|---|---|
| 0.1 | 2026-04-15 | Reborn | Draft kế thừa từ SAD reborn-retail |
| 1.0 | 2026-05-11 | Reborn | Rewrite loyalty-focused (11 parts) |
