# Part 01 — Kiến trúc tổng thể

> Mô tả kiến trúc toàn cảnh của Reborn CRM, từ góc nhìn người dùng đến
> hạ tầng kỹ thuật, áp dụng mô hình 4+1 Architectural View.

---

## 1. Context Diagram

Sơ đồ này cho thấy Reborn CRM tương tác với các actor và hệ thống bên ngoài như thế nào.

```
+------------------+     +------------------+     +------------------+
|   Sale / AM      |     |   Manager / CEO  |     |   CS / Support   |
|  (Nhân viên KD)  |     |  (Quản lý)       |     |  (CSKH)          |
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

  === Hệ thống bên ngoài ===

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

| Tầng          | Công nghệ                    | Phiên bản   | Ghi chú                        |
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

## 3. Mô hình 4+1 Architectural View

Áp dụng mô hình Philippe Kruchten để mô tả kiến trúc từ nhiều góc nhìn.

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

Các kịch bản nghiệp vụ chính của reborn-tech:

```
UC-01: Quản lý khách hàng B2B
  Actor: Sale / AM
  Flow:  Tạo lead → Qualify → Chuyển Opportunity
         → Gán Contact, Partner → Theo dõi lifecycle

UC-02: Sales Pipeline
  Actor: Sale / Manager
  Flow:  Opportunity → Tạo Quote → Phê duyệt →
         Ký Contract → Xuất Invoice → Thu tiền

UC-03: Project Delivery
  Actor: PM / Developer
  Flow:  Contract signed → Tạo Project → Assign task
         → Track milestone → Báo cáo tiến độ → Nghiệm thu

UC-04: Ticketing & Support
  Actor: CS / Support
  Flow:  KH gửi ticket → Phân loại → Assign →
         Xử lý → Phản hồi → Đóng ticket (SLA tracking)

UC-05: Marketing Campaign
  Actor: Marketing
  Flow:  Tạo campaign → Chọn segment → Gửi email/ZNS
         → Theo dõi conversion → Báo cáo ROI
```

### 3.2. Logical View (Domain Decomposition)

12 microservice được phân chia theo domain DDD:

```
+------------------------------------------------------------------+
|                        DOMAIN MAP                                |
+------------------------------------------------------------------+
|                                                                  |
|  CORE DOMAINS (giá trị kinh doanh chính)                        |
|  +------------+  +------------+  +------------+                  |
|  |  customer  |  |   sales    |  |  contract  |                  |
|  | KH, liên hệ|  | Pipeline,  |  | Hợp đồng,  |                  |
|  | đối tác,   |  | quote, IV  |  | phê duyệt  |                  |
|  | segment    |  | dashboard  |  | ký số      |                  |
|  +------------+  +------------+  +------------+                  |
|                                                                  |
|  SUPPORTING DOMAINS (hỗ trợ nghiệp vụ)                          |
|  +------------+  +------------+  +------------+  +------------+  |
|  |  billing   |  |  inventory |  |   market   |  |    care    |  |
|  | Thu chi,   |  | Kho, SP,   |  | Voucher,   |  | Ticket,    |  |
|  | công nợ,   |  | nhập xuất, |  | CTKM,      |  | bảo hành,  |  |
|  | quỹ, VAT   |  | stock      |  | campaign   |  | feedback   |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  GENERIC DOMAINS (hạ tầng dùng chung)                           |
|  +------------+  +------------+  +------------+  +------------+  |
|  |notification|  |integration |  |  logistics |  |  finance   |  |
|  | Push, SMS, |  | Zalo, FB,  |  | Vận chuyển,|  | Hồ sơ TC   |  |
|  | email, ZNS |  | VoIP, eIV  |  | shipping   |  | (banking)  |  |
|  +------------+  +------------+  +------------+  +------------+  |
|                                                                  |
|  +------------+                                                  |
|  | operation  |  * Chỉ dành cho nhánh reborn-tnpm                |
|  +------------+                                                  |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.3. Process View (Runtime Behavior)

#### 3.3.1. Luồng xử lý đồng bộ (Synchronous)

```
Browser ──HTTP──> API Gateway ──route──> Microservice ──SQL──> MySQL
                                              |
                                              +──cache──> Redis
                                              |
                                              <──response──
```

#### 3.3.2. Luồng xử lý bất đồng bộ (Asynchronous)

```
Microservice A                    RabbitMQ                Microservice B
     |                               |                        |
     |── publish(event) ────────────>|                        |
     |                               |── deliver(event) ─────>|
     |                               |                        |── xử lý
     |                               |                        |── update DB
     |                               |<── ack ────────────────|
```

Ví dụ: Khi `sales` tạo Invoice thành công → publish event `invoice.created`
→ `billing` tự động tạo phiếu thu tương ứng → `notification` gửi thông báo cho KH.

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
                                   | (n cấp)     |
                                   +-------------+
```

### 3.4. Development View (Code Organization)

```
cloud-crm/                          # Mono-repo frontend
├── src/
│   ├── pages/                      # ~80+ page modules
│   │   ├── ManagementOpportunity/  # Quản lý cơ hội
│   │   ├── Contact/                # Quản lý liên hệ
│   │   ├── Contract/               # Hợp đồng
│   │   ├── Ticket/                 # Ticket CSKH
│   │   ├── CashBook/              # Sổ thu chi
│   │   ├── Kpi/                   # Quản lý KPI
│   │   ├── BPM/                   # BPM workflow
│   │   ├── Campaign/              # Chiến dịch marketing
│   │   └── ...
│   ├── services/                   # API service layer (~100+ files)
│   ├── components/                 # Shared UI components
│   ├── configs/                    # Route, URL, auth config
│   ├── contexts/                   # React context (auth, theme)
│   ├── hooks/                      # Custom hooks
│   ├── utils/                      # Utility functions
│   └── types/                      # TypeScript definitions
├── docs/
│   ├── sa/                         # << Tài liệu này
│   ├── backend-tasks/              # Task phân theo microservice
│   └── userguides/                 # Hướng dẫn sử dụng
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
  1. Extract tenant từ hostname (tech-company-abc.reborn.vn)
     hoặc header X-Tenant-Id
  2. Validate JWT → extract userId, tenantId, roles
  3. Route đến microservice tương ứng

Microservice:
  4. Inject tenantId vào mọi query:
     SELECT * FROM invoice WHERE tenant_id = ? AND ...
  5. Row-level isolation — KHÔNG BAO GIỜ query không có tenant_id
```

### 4.2. B2B Workflow Complexity

Doanh nghiệp công nghệ có sales cycle dài (3-12 tháng), nhiều stakeholder,
và quy trình phê duyệt phức tạp:

```
Lead → Qualify → Opportunity → Quote → Negotiation
  → Contract (n cấp phê duyệt) → Project Delivery
  → Invoice (billing) → Payment → Renewal/Upsell
```

Hệ thống cần BPM engine linh hoạt để cấu hình workflow theo từng tenant
mà không cần thay đổi code.

### 4.3. Scalability Strategy

```
                     Hiện tại              Mục tiêu
Tenant               50+                   500+
Concurrent users     500                   5,000
Data/tenant          ~100K records         ~1M records
Response time (p95)  < 500ms               < 300ms

Chiến lược:
- Horizontal scale microservices (stateless)
- Redis cache cho hot data (danh mục, config, session)
- Read replica MySQL cho báo cáo nặng
- RabbitMQ để cắt tải xử lý async (email, notification, report)
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
              (2) Async Event (ưu tiên dùng cho cross-domain)

Quy tắc:
- Trong cùng domain: REST trực tiếp
- Cross-domain write: Outbox pattern + RabbitMQ
- Query cross-domain: REST + cache (Redis)
```

---

## 5. Ràng buộc và giới hạn (Constraints)

| Ràng buộc                         | Lý do                                         |
|-----------------------------------|-----------------------------------------------|
| React 17 (chưa lên 18)           | Ưu tiên ổn định, chưa migration                |
| MySQL (không NoSQL)              | Team quen thuộc, ACID cho tài chính            |
| Java Spring Boot                 | Hệ sinh thái mature, team có kinh nghiệm       |
| Row-level isolation (không DB/tenant) | Đơn giản hóa ops, dễ scale số tenant        |
| Backend trung lập ngành          | 1 codebase BE phục vụ nhiều ngành              |

---

## 6. Rủi ro kiến trúc và giảm thiểu

| Rủi ro                                  | Mức độ | Giảm thiểu                              |
|-----------------------------------------|--------|-----------------------------------------|
| Cross-tenant data leak                  | Cao    | Mandatory tenant_id filter, audit log   |
| Service coupling (n-n REST call)        | Trung bình | Outbox pattern, event-driven         |
| Single MySQL bottleneck                 | Trung bình | Read replica, partitioning, cache    |
| FE mono-repo build chậm                 | Thấp   | Vite 8 HMR, code splitting             |
| BPM config sai gây lỗi nghiệp vụ       | Trung bình | Validation layer, sandbox test mode  |

---

*Tiếp theo: [Part 02 — Chi tiết 12 Microservice](part-02-microservices.md)*
