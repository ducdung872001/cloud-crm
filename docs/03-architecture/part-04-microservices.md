# Part 04 — Microservices (C4 Level 2 Container View)

## 1. Service catalog

| Service | URL prefix | Ngôn ngữ | DB | Trách nhiệm |
|---|---|---|---|---|
| **market-service** | `/bizapi/market` | Java Spring Boot | PG `market_db` | Loyalty engine: points, ledger, tier, earn rules, rewards, campaigns |
| **customer-service** | `/bizapi/customer` | Java Spring Boot | PG `customer_db` | Member entity, profile 360°, dedupe, merge, bulk import |
| **care-service** | `/bizapi/care` | Java Spring Boot | PG `care_db` | Ticket workflow, warranty, feedback, NPS |
| **notification-service** | `/bizapi/notification` | Java/Go | Redis + PG `notification_db` | Email/SMS/Zalo OA outbound, template, throttle |
| **analytics-service** | `/bizapi/analytics` | Java + Python | ClickHouse | RFM, CLV, cohort, dashboard queries |
| **auth-service** | `/authenticator`, `/adminapi/auth` | Java | PG `auth_db` | JWT, API key mgmt, SSO bridge |
| **gateway** | `/` (catch-all) | Kong/Nginx | — | Rate limit, routing, TLS, header injection |
| **admin-frontend** | `/` (static SPA) | React 18 + Vite | — | Admin UI |
| **member-frontend** | `app.loyalty.reborn.vn` | React Native / Zalo Mini (TBD) | — | Member-facing app |

## 2. Service map

```
                          ┌───────────────┐
                          │  Admin SPA    │
                          └───────┬───────┘
                                  │
                                  │ REST/JSON
                                  ▼
   ┌──────────────────────────────────────────────────────┐
   │                  API GATEWAY                          │
   │       (rate limit, auth, routing by path)             │
   └────┬────────┬────────┬────────┬────────┬─────────────┘
        │        │        │        │        │
        ▼        ▼        ▼        ▼        ▼
   ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
   │ market ││customer││  care  ││notif.  ││analytic│
   │service ││service ││service ││service ││service │
   └───┬────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘
       │        │         │         │         │
       │   ┌────┴───┐     │         │         │
       │   │  PG    │     │         │         │
       │   │customer│     │         │         │
       │   │_db     │     │         │         │
       │   └────────┘     │         │         │
       │                  │         │         │
   ┌───┴────┐         ┌───┴────┐    │     ┌───┴────┐
   │   PG   │         │   PG   │    │     │ClickH. │
   │market  │         │ care   │    │     │        │
   │_db     │         │_db     │    │     └────────┘
   └────────┘         └────────┘    │
                                    │
                              ┌─────┴──────┐
                              │  Redis     │
                              │  (cache,   │
                              │   queue)   │
                              └────────────┘
                                    │
                              ┌─────┴──────┐
                              │  RabbitMQ  │
                              │  (DLQ,     │
                              │   events)  │
                              └────────────┘
```

## 3. Inter-service communication

### 3.1. Sync (REST internal)

| From → To | Endpoint | Khi nào |
|---|---|---|
| market → customer | `/internal/member/lookup` | Auto-earn cần lookup member |
| market → customer | `/internal/member/create` | Auto-create khi auto-earn phone mới |
| care → customer | `/internal/member/lookup` | Tra cứu KH khi tạo ticket |
| analytics → market (replica) | Direct SQL via PG read replica | Compute RFM, dashboard |
| admin-UI → market/customer/care/analytics | Various | Admin operations |

### 3.2. Async (events via RabbitMQ)

| Producer → Consumer | Event | Mục đích |
|---|---|---|
| market → notification | `PointsEarnedEvent` | Send SMS "+ X điểm" |
| market → notification | `TierUpgradedEvent` | Send "Chúc mừng lên hạng" |
| market → notification | `PointsExpiringEvent` | Pre-expire reminder |
| market → analytics | `LedgerEntryCreated` | CDC to ClickHouse |
| care → notification | `TicketStatusChanged` | Notify customer |
| customer → market | `MemberMerged` | Consolidate ledger |

### 3.3. Event topology

```
RabbitMQ exchanges:
├─ loyalty.events (topic exchange)
│   ├─ points.earned
│   ├─ points.redeemed
│   ├─ points.expired
│   ├─ tier.upgraded
│   ├─ tier.downgraded
│   ├─ reward.redeemed
│   ├─ campaign.applied
│   └─ member.merged
│
├─ care.events
│   ├─ ticket.created
│   ├─ ticket.assigned
│   └─ ticket.resolved
│
└─ notification.dlq (dead letter)
```

## 4. Service ownership & boundaries

| Service | Owns | Does NOT own |
|---|---|---|
| **market-service** | Points balance, ledger, tier state, earn rules, campaign rules, reward catalog, redemption | Member profile (only references member_id) |
| **customer-service** | Member entity, dedupe logic, bulk import, super-customer cross-brand | Points (calls market) |
| **care-service** | Ticket, warranty, NPS | Member (references), Points (references for compensation) |
| **notification-service** | Template, queue, delivery tracking | Business logic (only renders + sends) |
| **analytics-service** | RFM/CLV computation, materialized views | Real-time business state (read-only) |
| **auth-service** | User, role, permission, API key, JWT, SSO | Member auth (delegated, OTP-based) |

## 5. Anti-patterns avoided

| Anti-pattern | Cách tránh |
|---|---|
| **Distributed monolith** | Mỗi service own DB riêng; không cross-DB join |
| **Shared mutable state** | Domain events thay vì direct DB write từ ngoài |
| **Chatty cross-service calls** | Cache lookup result, denormalize key field vào event payload |
| **Tight coupling via shared lib** | Contract = OpenAPI/AsyncAPI; service riêng có version |
| **Big bang refactor** | Strangler pattern khi migrate phần legacy |

## 6. Deployment topology

```
Production (k8s):
├─ Namespace: loyalty-prod
│   ├─ market-service (3 replicas, HPA min=3 max=20)
│   ├─ customer-service (2 replicas, HPA min=2 max=10)
│   ├─ care-service (2 replicas)
│   ├─ notification-service (3 replicas — high throughput)
│   ├─ analytics-service (2 replicas)
│   ├─ auth-service (2 replicas)
│   └─ gateway (3 replicas + ingress)
│
├─ Stateful (dedicated nodes):
│   ├─ PostgreSQL primary + 2 replicas (1 sync + 1 async)
│   ├─ Redis Cluster (3 master + 3 replica)
│   ├─ ClickHouse cluster (2 shards × 2 replicas)
│   ├─ Elasticsearch (3 nodes)
│   └─ RabbitMQ cluster (3 nodes, mirrored queue)
│
└─ External:
    ├─ S3-compatible (MinIO or managed)
    └─ Egress: SMS Gateway, Zalo API, Email
```

## 7. Service-level objectives (SLO)

| Service | Availability | Latency P95 | Error rate |
|---|---|---|---|
| market | 99.9% | 500 ms | < 0.5% |
| customer | 99.9% | 300 ms | < 0.3% |
| care | 99.5% | 800 ms | < 1% |
| notification | 99.5% | 2 s (queue) | < 2% delivery fail |
| analytics | 99.0% | 3 s | < 1% |
| auth | 99.95% | 200 ms | < 0.2% |
| gateway | 99.99% | 50 ms | < 0.1% |

## 8. Reuse từ Reborn Platform

Reborn có sẵn các microservice common — Loyalty Platform reuse:
- **auth-service** (SSO): reuse, chỉ cấu hình realm mới
- **notification-service**: reuse, thêm template loyalty
- **BPM Engine** (`/bpmapi`): **REUSE BẮT BUỘC** cho advanced earn rule + workflow campaign nâng cao — xem §10
- **Audit service**: reuse cho centralized audit log

Custom mới:
- **market-service**: extension cho loyalty (kế thừa từ `cloud-market-master`, thêm fields/cron, BPM event publisher)
- **customer-service**: extension cho cross-brand dedupe
- **analytics-service**: mới hoàn toàn cho RFM/CLV

## 10. BPM Engine Integration cho Advanced Earn

### 10.1. Vai trò trong hệ thống

`market-service` (loyalty engine native) xử lý **80–90% earn flow** — auto-earn từ POS, simple rule, tier multiplier, expire. Reborn **BPM Engine** (`/bpmapi`) xử lý **10–20% advanced** — long-running, stateful, multi-step workflow (quest, family pool, B2B contract, journey-based, ...). Phân định chi tiết: xem [URD part-03 §1bis](../02-requirements/part-03-points-engine.md#1bis-hai-lớp-earn-rule--simple-vs-advanced).

### 10.2. Container view với BPM

```
                  ┌────────────────────────────────────────────┐
                  │           API Gateway                       │
                  └──┬────────┬───────────────┬───────────────┬─┘
                     │        │               │               │
                     ▼        ▼               ▼               ▼
              ┌─────────┐ ┌─────────┐  ┌──────────────┐ ┌──────────┐
              │ market- │ │customer-│  │ BPM Engine   │ │ care-svc │
              │ service │ │ service │  │  /bpmapi     │ └──────────┘
              └────┬────┘ └─────────┘  │              │
                   │                   │ - Studio UI  │
   ┌───────────────┴───────────────┐  │ - Runtime    │
   │ 1. Auto-earn flow (simple)    │  │ - Variables  │
   │    POS → market-svc           │  │   storage    │
   │    → ledger write             │  │ - Timer      │
   │    → publish event            │  │ - Gateway    │
   │                               │  └──────┬───────┘
   │                               │         │
   │                          ┌────┘         │
   │                          │              │ 3. BPM await event
   │                          ▼              │    process matched →
   │                  ┌───────────────┐      │    advance state
   │                  │   RabbitMQ    │──────┤
   │                  │ loyalty.events│      │
   │                  └───────────────┘      │
   │                                         │
   │  4. BPM decides award                   │
   │     callback /internal/loyalty/award ◄──┘
   │     → market-svc writes ledger
   │       entry (adjust_in, reason=bpm_*)
   └────────────────────────────────────────┘
```

### 10.3. Tích hợp: 3 contract chính

| Contract | Direction | Mô tả |
|---|---|---|
| **Event publish** | `market-service` → RabbitMQ → BPM | `LedgerEntryCreatedEvent` mỗi khi earn xảy ra. BPM correlate với running process instances |
| **Award callback** | BPM → `market-service` (REST) | `POST /internal/v1/loyalty/award` với idempotency_key, BPM trace |
| **Process query** | Admin UI → BPM API | List/inspect/terminate process instances |

### 10.4. Failure modes & isolation

| Failure | Impact | Recovery |
|---|---|---|
| BPM Engine down | Simple auto-earn TIẾP TỤC hoạt động (async hand-off); BPM events dồn DLQ | BPM up → drain DLQ, resume processes |
| market-service `/award` down | BPM process pause tại task gọi award, retry exp backoff | market up → BPM retry tự động |
| Workflow logic bug (infinite loop) | Process instances tích lũy memory BPM | Manual terminate qua admin UI, fix workflow, deploy version mới |
| Event payload schema breaking change | BPM consume fail | Versioned event schema, backward-compat 1 release |

### 10.5. Performance & scaling

- BPM Engine standalone deployment (k8s namespace `bpm-prod`)
- Sizing: 100K active process instances cùng lúc, ~10 TPS event ingestion
- Storage: process state trong BPM DB (PostgreSQL riêng `bpm_db`)
- Không impact OLTP `market_db`

### 10.6. Khi nào KHÔNG dùng BPM

- Simple multiplier (tier × 2, weekend × 2) — dùng modifier ở simple rule
- One-off bonus (welcome 500 điểm) — dùng signup_bonus trigger trực tiếp
- Transactional rollback (refund) — phải đồng bộ trong market-service, không async
- Latency critical < 100ms — BPM hand-off latency 200-500ms không phù hợp

> 📚 **Case study Loyalty Quest** (workflow 5-challenge, 30 ngày): [`../06-analysis/advanced-earn-rule-bpm-case-study.md`](../06-analysis/advanced-earn-rule-bpm-case-study.md)

## 11. Tham chiếu

- Domain model: [`part-02-loyalty-domain-model.md`](part-02-loyalty-domain-model.md)
- API contract: [`part-05-api-integration.md`](part-05-api-integration.md)
- Backend tasks chi tiết: [`../05-backend-tasks/`](../05-backend-tasks/)
- ADR microservice decisions: [`part-09-adr.md`](part-09-adr.md)
- ADR-16 BPM Engine cho advanced earn: [`part-09-adr.md#adr-16`](part-09-adr.md)
- URD Simple vs Advanced rule: [`../02-requirements/part-03-points-engine.md#1bis`](../02-requirements/part-03-points-engine.md)
