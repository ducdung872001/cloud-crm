# Part 01 — Kien truc tong the

> Mo ta kien truc toan canh cua Reborn CRM, tu goc nhin nguoi dung den
> ha tang ky thuat, ap dung mo hinh 4+1 Architectural View.

---

## 1. Context Diagram

So do nay cho thay Reborn CRM tuong tac voi cac actor va he thong ben ngoai nhu the nao.

```
+------------------+     +------------------+     +------------------+
|   Sale / AM      |     |   Manager / CEO  |     |   CS / Support   |
|  (Nhan vien KD)  |     |  (Quan ly)       |     |  (CSKH)          |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +----------+-------------+-------------+----------+
                    |                           |
                    v                           v
         +-------------------+       +--------------------+
         |   Web Browser     |       |   Mobile Browser   |
         +--------+----------+       +--------+-----------+
                  |                           |
                  +------------+--------------+
                               |
                               v
                  +------------+-------------+
                  |     React SPA (Vite)     |
                  |   app.reborn.vn/:tenant  |
                  +------------+-------------+
                               |
                               | HTTPS + JWT
                               v
                  +------------+-------------+
                  |      API Gateway         |
                  |   (Nginx / Spring GW)    |
                  |   Hostname routing       |
                  |   + Rate limiting        |
                  +---+----+----+----+---+---+
                      |    |    |    |   |
          +-----------+    |    |    |   +-----------+
          |                |    |    |               |
          v                v    v    v               v
   +------+-----+   +-----+----+----+-----+   +----+-------+
   |   sales    |   | customer | billing  |   | notification|
   +------------+   +----------+----------+   +-------------+
   |  inventory |   | contract | market   |   | integration |
   +------------+   +----------+----------+   +-------------+
   |  logistics |   |   care   | finance  |   |  operation  |
   +------------+   +----------+----------+   +-------------+
          |                |    |    |               |
          +-------+--------+----+----+-------+-------+
                  |                          |
          +-------+-------+         +-------+-------+
          |    MySQL      |         |    Redis      |
          | (per-service  |         |  (cache +     |
          |  schema)      |         |   session)    |
          +---------------+         +---------------+
                  |
          +-------+-------+         +---------------+
          |   RabbitMQ    |         |  File Storage |
          | (event bus)   |         |  (S3 / MinIO) |
          +---------------+         +---------------+

  === He thong ben ngoai ===

  +-------------+  +----------+  +---------+  +------------+
  | Zalo OA/ZNS |  | Facebook |  | VoIP/SIP|  | eInvoice   |
  | (messaging) |  | Messenger|  | (call)  |  | (Viettel)  |
  +-------------+  +----------+  +---------+  +------------+
  +-------------+  +----------+  +---------+
  | Azure AD    |  | Firebase |  | SMTP    |
  | (SSO/MSAL)  |  | (push)   |  | (email) |
  +-------------+  +----------+  +---------+
```

---

## 2. Technology Stack

| Tang          | Cong nghe                    | Phien ban   | Ghi chu                        |
|---------------|------------------------------|-------------|--------------------------------|
| Frontend      | React + TypeScript           | React 17    | SPA, Vite 8 build              |
| API Gateway   | Nginx / Spring Cloud Gateway | —           | Hostname-based routing         |
| Backend       | Java Spring Boot             | 2.x / 3.x  | 12 microservices               |
| Database      | MySQL                        | 8.x         | Row-level tenant isolation     |
| Cache         | Redis                        | 7.x         | Session, cache, rate limit     |
| Message Queue | RabbitMQ                     | 3.x         | Event-driven, outbox pattern   |
| Auth          | SSO Reborn + Azure MSAL      | —           | JWT, RBAC                      |
| Push          | Firebase Cloud Messaging     | —           | Mobile + web push              |
| File Storage  | S3-compatible / MinIO        | —           | Upload, attachment             |

---

## 3. Mo hinh 4+1 Architectural View

Ap dung mo hinh Philippe Kruchten de mo ta kien truc tu nhieu goc nhin.

```
                    +-------------------+
                    |   Use-Case View   |
                    | (Scenarios / B2B  |
                    |  CRM workflows)   |
                    +---------+---------+
                              |
              +---------------+---------------+
              |                               |
    +---------+---------+           +---------+---------+
    |   Logical View    |           |   Process View    |
    | (Domain modules,  |           | (Runtime, async   |
    |  microservices)   |           |  messaging, BPM)  |
    +---------+---------+           +---------+---------+
              |                               |
              +---------------+---------------+
                              |
                    +---------+---------+
                    | Development View  |
                    | (Code structure,  |
                    |  build, CI/CD)    |
                    +---------+---------+
                              |
                    +---------+---------+
                    |  Physical View    |
                    | (Deployment,      |
                    |  infrastructure)  |
                    +-------------------+
```

### 3.1. Use-Case View (Scenarios)

Cac kich ban nghiep vu chinh cua reborn-tech:

```
UC-01: Quan ly khach hang B2B
  Actor: Sale / AM
  Flow:  Tao lead → Qualify → Chuyen Opportunity
         → Gan Contact, Partner → Theo doi lifecycle

UC-02: Sales Pipeline
  Actor: Sale / Manager
  Flow:  Opportunity → Tao Quote → Phe duyet →
         Ky Contract → Xuat Invoice → Thu tien

UC-03: Project Delivery
  Actor: PM / Developer
  Flow:  Contract signed → Tao Project → Assign task
         → Track milestone → Bao cao tien do → Nghiem thu

UC-04: Ticketing & Support
  Actor: CS / Support
  Flow:  KH gui ticket → Phan loai → Assign →
         Xu ly → Phan hoi → Dong ticket (SLA tracking)

UC-05: Marketing Campaign
  Actor: Marketing
  Flow:  Tao campaign → Chon segment → Gui email/ZNS
         → Theo doi conversion → Bao cao ROI
```

### 3.2. Logical View (Domain Decomposition)

12 microservice duoc phan chia theo domain DDD:

```
+------------------------------------------------------------------+
|                        DOMAIN MAP                                |
+------------------------------------------------------------------+
|                                                                  |
|  CORE DOMAINS (gia tri kinh doanh chinh)                        |
|  +------------+  +------------+  +------------+                  |
|  |  customer  |  |   sales    |  |  contract  |                  |
|  | KH, lien he|  | Pipeline,  |  | Hop dong,  |                  |
|  | doi tac,   |  | quote, IV  |  | phe duyet  |                  |
|  | segment    |  | dashboard  |  | ky so      |                  |
|  +------------+  +------------+  +------------+                  |
|                                                                  |
|  SUPPORTING DOMAINS (ho tro nghiep vu)                          |
|  +------------+  +------------+  +------------+  +------------+  |
|  |  billing   |  |  inventory |  |   market   |  |    care    |  |
|  | Thu chi,   |  | Kho, SP,   |  | Voucher,   |  | Ticket,    |  |
|  | cong no,   |  | nhap xuat, |  | CTKM,      |  | bao hanh,  |  |
|  | quy, VAT   |  | stock      |  | campaign   |  | feedback   |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  GENERIC DOMAINS (ha tang dung chung)                           |
|  +------------+  +------------+  +------------+  +------------+  |
|  |notification|  |integration |  |  logistics |  |  finance   |  |
|  | Push, SMS, |  | Zalo, FB,  |  | Van chuyen,|  | Ho so TC   |  |
|  | email, ZNS |  | VoIP, eIV  |  | shipping   |  | (banking)  |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  +------------+                                                  |
|  | operation  |  * Chi danh cho nhanh reborn-tnpm                |
|  +------------+                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.3. Process View (Runtime Behavior)

#### 3.3.1. Luong xu ly dong bo (Synchronous)

```
Browser ──HTTP──> API Gateway ──route──> Microservice ──SQL──> MySQL
                                              |
                                              +──cache──> Redis
                                              |
                                              <──response──
```

#### 3.3.2. Luong xu ly bat dong bo (Asynchronous)

```
Microservice A                    RabbitMQ                Microservice B
     |                               |                        |
     |── publish(event) ────────────>|                        |
     |                               |── deliver(event) ─────>|
     |                               |                        |── xu ly
     |                               |                        |── update DB
     |                               |<── ack ────────────────|
```

Vi du: Khi `sales` tao Invoice thanh cong → publish event `invoice.created`
→ `billing` tu dong tao phieu thu tuong ung → `notification` gui thong bao cho KH.

#### 3.3.3. BPM Workflow Engine

```
Trigger (user action / timer / event)
     |
     v
+----+-----+     +-------------+     +-----------+
| Business |---->| Decision    |---->| Action     |
| Rule     |     | Table       |     | (API call, |
| Evaluate |     | (if/then)   |     |  assign,   |
+----------+     +-------------+     |  notify)   |
                                     +-----------+
                                          |
                                          v
                                   +------+------+
                                   | Approval    |
                                   | Flow        |
                                   | (n cap)     |
                                   +-------------+
```

### 3.4. Development View (Code Organization)

```
cloud-crm/                          # Mono-repo frontend
├── src/
│   ├── pages/                      # ~80+ page modules
│   │   ├── ManagementOpportunity/  # Quan ly co hoi
│   │   ├── Contact/                # Quan ly lien he
│   │   ├── Contract/               # Hop dong
│   │   ├── Ticket/                 # Ticket CSKH
│   │   ├── CashBook/              # So thu chi
│   │   ├── Kpi/                   # Quan ly KPI
│   │   ├── BPM/                   # BPM workflow
│   │   ├── Campaign/              # Chien dich marketing
│   │   └── ...
│   ├── services/                   # API service layer (~100+ files)
│   ├── components/                 # Shared UI components
│   ├── configs/                    # Route, URL, auth config
│   ├── contexts/                   # React context (auth, theme)
│   ├── hooks/                      # Custom hooks
│   ├── utils/                      # Utility functions
│   └── types/                      # TypeScript definitions
├── docs/
│   ├── sa/                         # << Tai lieu nay
│   ├── backend-tasks/              # Task phan theo microservice
│   └── userguides/                 # Huong dan su dung
└── tests/                          # Playwright E2E tests
```

### 3.5. Physical View (Deployment)

```
                    +------------------+
                    |   CDN / DNS      |
                    | *.reborn.vn      |
                    +--------+---------+
                             |
                    +--------+---------+
                    |   Load Balancer  |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------+---------+         +---------+---------+
    |  Web Server (FE)  |         |  API Gateway      |
    |  Nginx + React    |         |  Spring Cloud GW  |
    |  static build     |         |  / Nginx proxy    |
    +-------------------+         +---------+---------+
                                            |
                          +-----------------+------------------+
                          |                 |                  |
                   +------+------+   +------+------+   +------+------+
                   | Service     |   | Service     |   | Service     |
                   | Instance 1  |   | Instance 2  |   | Instance N  |
                   | (sales,     |   | (customer,  |   | (billing,   |
                   |  contract)  |   |  care)      |   |  market)    |
                   +------+------+   +------+------+   +------+------+
                          |                 |                  |
              +-----------+-----------------+------------------+
              |                    |                    |
     +--------+-------+  +--------+-------+  +---------+------+
     |  MySQL Cluster  |  |  Redis Cluster  |  | RabbitMQ Cluster|
     |  (primary +     |  |  (master +      |  | (3-node HA)    |
     |   replicas)     |  |   replicas)     |  |                |
     +-----------------+  +-----------------+  +----------------+
```

---

## 4. Key Architecture Drivers

### 4.1. Multi-tenant Isolation

```
Request:  GET /sales/invoice/list
Header:   X-Tenant-Id: tech-company-abc
          Authorization: Bearer <JWT>

API Gateway:
  1. Extract tenant tu hostname (tech-company-abc.reborn.vn)
     hoac header X-Tenant-Id
  2. Validate JWT → extract userId, tenantId, roles
  3. Route den microservice tuong ung

Microservice:
  4. Inject tenantId vao moi query:
     SELECT * FROM invoice WHERE tenant_id = ? AND ...
  5. Row-level isolation — KHONG BAO GIO query khong co tenant_id
```

### 4.2. B2B Workflow Complexity

Doanh nghiep cong nghe co sales cycle dai (3-12 thang), nhieu stakeholder,
va quy trinh phe duyet phuc tap:

```
Lead → Qualify → Opportunity → Quote → Negotiation
  → Contract (n cap phe duyet) → Project Delivery
  → Invoice (billing) → Payment → Renewal/Upsell
```

He thong can BPM engine linh hoat de cau hinh workflow theo tung tenant
ma khong can thay doi code.

### 4.3. Scalability Strategy

```
                     Hien tai              Muc tieu
Tenant               50+                   500+
Concurrent users     500                   5,000
Data/tenant          ~100K records         ~1M records
Response time (p95)  < 500ms               < 300ms

Chien luoc:
- Horizontal scale microservices (stateless)
- Redis cache cho hot data (danh muc, config, session)
- Read replica MySQL cho bao cao nang
- RabbitMQ de cat tai xu ly async (email, notification, report)
- CDN cho static assets (React build)
```

### 4.4. Cross-service Communication

```
+----------+                              +----------+
| Service A|  (1) Synchronous REST/gRPC   | Service B|
|          | ────────────────────────────> |          |
+----------+                              +----------+

+----------+     +-----------+            +----------+
| Service A|     | RabbitMQ  |            | Service B|
|          | ──> | Exchange  | ────────>  |          |
+----------+     +-----------+            +----------+
              (2) Async Event (uu tien dung cho cross-domain)

Quy tac:
- Trong cung domain: REST truc tiep
- Cross-domain write: Outbox pattern + RabbitMQ
- Query cross-domain: REST + cache (Redis)
```

---

## 5. Rang buoc va gioi han (Constraints)

| Rang buoc                         | Ly do                                         |
|-----------------------------------|-----------------------------------------------|
| React 17 (chua len 18)           | Uu tien on dinh, chua migration                |
| MySQL (khong NoSQL)              | Team quen thuoc, ACID cho tai chinh            |
| Java Spring Boot                 | He sinh thai mature, team co kinh nghiem       |
| Row-level isolation (khong DB/tenant) | Don gian hoa ops, de scale so tenant        |
| Backend trung lap nganh          | 1 codebase BE phuc vu nhieu nganh              |

---

## 6. Rui ro kien truc va giam thieu

| Rui ro                                  | Muc do | Giam thieu                              |
|-----------------------------------------|--------|-----------------------------------------|
| Cross-tenant data leak                  | Cao    | Mandatory tenant_id filter, audit log   |
| Service coupling (n-n REST call)        | Trung binh | Outbox pattern, event-driven         |
| Single MySQL bottleneck                 | Trung binh | Read replica, partitioning, cache    |
| FE mono-repo build cham                 | Thap   | Vite 8 HMR, code splitting             |
| BPM config sai gay loi nghiep vu       | Trung binh | Validation layer, sandbox test mode  |

---

*Tiep theo: [Part 02 — Chi tiet 12 Microservice](part-02-microservices.md)*
