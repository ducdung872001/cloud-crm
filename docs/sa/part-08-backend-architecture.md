# Part 08 — Backend Architecture

> Mô tả kiến trúc 12 microservice, bounded context, giao tiếp đồng bộ /
> bất đồng bộ, BPM engine, và contract service cho B2B CRM enterprise.

---

## 1. Executive Summary

Backend gồm **12 microservice** xây trên **Java Spring Boot**, giao tiếp
qua REST (sync) và RabbitMQ (async). Mỗi service có bounded context rõ ràng,
API prefix riêng, và có thể scale độc lập. BPM engine (Camunda/Flowable)
xử lý workflow phức tạp như phê duyệt hợp đồng, approval chain nhiều cấp.

---

## 2. Microservice Catalog

| #  | Service       | API Prefix      | Bounded Context              | DB Tables Prefix |
|----|---------------|-----------------|------------------------------|------------------|
| 1  | sales         | /api/sales      | Lead, Opportunity, Deal      | sales_           |
| 2  | inventory     | /api/inventory  | Product, Warehouse, Stock    | inv_             |
| 3  | billing       | /api/billing    | Invoice, Payment, Receipt    | bill_            |
| 4  | market        | /api/market     | Campaign, Email, Landing     | mkt_             |
| 5  | customer      | /api/customer   | Company, Contact, Segment    | cust_            |
| 6  | notification  | /api/notify     | Email, SMS, Push, In-app     | noti_            |
| 7  | integration   | /api/integration| Webhook, Sync, API Key       | intg_            |
| 8  | care          | /api/care       | Ticket, SLA, Feedback        | care_            |
| 9  | logistics     | /api/logistics  | Shipping, Delivery, Partner  | logi_            |
| 10 | finance       | /api/finance    | Accounting, Tax, Budget      | fin_             |
| 11 | operation     | /api/operation  | BPM, Task, Approval, DMN     | ops_             |
| 12 | contract      | /api/contract   | Contract, eSign, Lifecycle   | ctr_             |

---

## 3. Service Topology

```
                          +------------------+
                          |   API Gateway    |
                          | (Spring Gateway) |
                          +--------+---------+
                                   |
            +----------+-----------+-----------+----------+
            |          |           |           |          |
            v          v           v           v          v
      +---------+ +---------+ +---------+ +---------+ +---------+
      |  sales  | |customer | |contract | | billing | |  care   |
      +---------+ +---------+ +---------+ +---------+ +---------+
            |          |           |           |          |
            +-----+----+-----------+----+------+----------+
                  |                     |
                  v                     v
      +-----------+--------+   +-------+-----------+
      |     MySQL          |   |    RabbitMQ       |
      | (shared instance)  |   | (event bus)       |
      +--------------------+   +-------------------+
                                        |
            +----------+----------------+----------+
            |          |                |          |
            v          v                v          v
      +---------+ +---------+   +-----------+ +----------+
      |  notify | |  market |   | operation | | finance  |
      +---------+ +---------+   +-----------+ +----------+
            |
            v
      +-----------+   +-----------+   +-----------+
      | logistics |   |integration|   | inventory |
      +-----------+   +-----------+   +-----------+
```

---

## 4. Inter-service Communication

### 4.1. Synchronous — REST

Sử dụng cho thao tác cần response ngay lập tức:

| Caller      | Callee     | Endpoint                 | Mục đích                   |
|-------------|------------|--------------------------|----------------------------|
| sales       | customer   | GET /api/customer/{id}   | Lấy thông tin công ty      |
| contract    | billing    | POST /api/billing/invoice | Tạo invoice từ contract    |
| care        | customer   | GET /api/customer/search | Tìm khách hàng theo ticket |
| billing     | finance    | POST /api/finance/entry  | Ghi bút toán kế toán       |

Convention: sử dụng **Feign Client** với circuit breaker (Resilience4j).
Timeout mặc định 5s, retry 2 lần.

### 4.2. Asynchronous — RabbitMQ Events

Sử dụng cho thao tác không cần response ngay, hoặc fan-out nhiều consumer:

| Exchange           | Routing Key              | Publisher  | Consumer(s)           |
|--------------------|--------------------------|------------|-----------------------|
| crm.sales          | opportunity.won          | sales      | contract, notify      |
| crm.contract       | contract.signed          | contract   | billing, notify       |
| crm.billing        | invoice.paid             | billing    | finance, notify       |
| crm.customer       | company.created          | customer   | market, sales         |
| crm.care           | ticket.escalated         | care       | notify, operation     |
| crm.integration    | webhook.received         | integration| tương ứng service     |

Message format chuẩn:

```json
{
  "eventId": "uuid-v4",
  "eventType": "contract.signed",
  "tenantId": 42,
  "branchId": 1,
  "payload": { "contractId": 1001, "signedBy": 55 },
  "timestamp": "2026-04-16T10:30:00Z"
}
```

---

## 5. BPM Engine Integration

### 5.1. Workflow (BPMN)

Service **operation** tích hợp BPM engine (Camunda / Flowable) để xử lý:

- Phê duyệt hợp đồng nhiều cấp (Manager -> Director -> CEO)
- Quy trình onboarding khách hàng B2B
- Ticket escalation từ care -> sales -> management

```
+--------+     +----------+     +----------+     +---------+
| Start  | --> | AM Tạo   | --> | Manager  | --> | Director|
|        |     | Contract |     | Duyệt    |     | Duyệt   |
+--------+     +----------+     +----+-----+     +----+----+
                                     |                |
                                  Reject           Reject
                                     |                |
                                     v                v
                                +----------+     +----------+
                                | AM Sửa   |     | AM Sửa   |
                                | Lại      |     | Lại      |
                                +----------+     +----------+
```

### 5.2. Business Rules (DMN)

DMN decision table áp dụng cho:

| Rule                      | Input               | Output              |
|---------------------------|----------------------|---------------------|
| Approval level            | Contract value       | Required approvers  |
| Discount limit            | Customer tier + qty  | Max discount %      |
| SLA priority              | Customer tier        | Response time (h)   |
| Lead scoring              | Company size + source| Score 0-100         |

---

## 6. Contract Service — Chi tiết

### 6.1. Lifecycle

```
DRAFT --> REVIEW --> APPROVED --> SENT --> SIGNED --> ACTIVE --> EXPIRED
  |         |          |                     |          |
  v         v          v                     v          v
CANCELLED  REJECTED  REJECTED             VOIDED    RENEWED
```

### 6.2. Approval Chain

- Cấu hình động theo `contract_value` threshold
- Mỗi cấp phê duyệt có deadline (SLA)
- Nếu hết hạn -> tự động escalate lên cấp trên
- Lưu toàn bộ lịch sử phê duyệt trong `approval_log`

### 6.3. eSign Integration

- Tích hợp eSign provider qua webhook callback
- Lưu `e_sign_log`: signer, timestamp, IP, certificate hash
- Sau ký -> tự động chuyển trạng thái SIGNED, phát event `contract.signed`

---

## 7. Common Backend Patterns

| Pattern              | Implementation                              |
|----------------------|---------------------------------------------|
| Tenant Middleware    | Filter inject tenant_id từ Hostname header  |
| Base Entity          | id, tenant_id, branch_id, created/updated_at|
| Pagination           | Page + size + sort, max 200 records/page    |
| Error Response       | `{ code, message, details }` chuẩn hóa      |
| Health Check         | `/actuator/health` — MySQL, Redis, RabbitMQ |
| API Versioning       | URL prefix: /api/v1/... (hiện tại v1)       |
| Request Validation   | Bean Validation (JSR 380) + custom validator|
| Logging              | Structured JSON, correlation-id per request |

---

## 8. Scalability

- Mỗi service chạy **2+ instance** phía sau load balancer
- Stateless design — session lưu Redis, không lưu local
- RabbitMQ consumer có thể scale horizontal (competing consumers)
- Database connection pooling: HikariCP, max 20 conn/service
- Roadmap: tách DB cho notification + integration khi > 10K CCU
