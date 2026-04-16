# Part 08 — Backend Architecture

> Mo ta kien truc 12 microservice, bounded context, giao tiep dong bo /
> bat dong bo, BPM engine, va contract service cho B2B CRM enterprise.

---

## 1. Executive Summary

Backend gom **12 microservice** xay tren **Java Spring Boot**, giao tiep
qua REST (sync) va RabbitMQ (async). Moi service co bounded context ro rang,
API prefix rieng, va co the scale doc lap. BPM engine (Camunda/Flowable)
xu ly workflow phuc tap nhu phe duyet hop dong, approval chain nhieu cap.

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

Su dung cho thao tac can response ngay lap tuc:

| Caller      | Callee     | Endpoint                 | Muc dich                   |
|-------------|------------|--------------------------|----------------------------|
| sales       | customer   | GET /api/customer/{id}   | Lay thong tin cong ty      |
| contract    | billing    | POST /api/billing/invoice | Tao invoice tu contract    |
| care        | customer   | GET /api/customer/search | Tim khach hang theo ticket |
| billing     | finance    | POST /api/finance/entry  | Ghi but toan ke toan       |

Convention: su dung **Feign Client** voi circuit breaker (Resilience4j).
Timeout mac dinh 5s, retry 2 lan.

### 4.2. Asynchronous — RabbitMQ Events

Su dung cho thao tac khong can response ngay, hoac fan-out nhieu consumer:

| Exchange           | Routing Key              | Publisher  | Consumer(s)           |
|--------------------|--------------------------|------------|-----------------------|
| crm.sales          | opportunity.won          | sales      | contract, notify      |
| crm.contract       | contract.signed          | contract   | billing, notify       |
| crm.billing        | invoice.paid             | billing    | finance, notify       |
| crm.customer       | company.created          | customer   | market, sales         |
| crm.care           | ticket.escalated         | care       | notify, operation     |
| crm.integration    | webhook.received         | integration| tuong ung service     |

Message format chuan:

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

Service **operation** tich hop BPM engine (Camunda / Flowable) de xu ly:

- Phe duyet hop dong nhieu cap (Manager -> Director -> CEO)
- Quy trinh onboarding khach hang B2B
- Ticket escalation tu care -> sales -> management

```
+--------+     +----------+     +----------+     +---------+
| Start  | --> | AM Tao   | --> | Manager  | --> | Director|
|        |     | Contract |     | Duyet    |     | Duyet   |
+--------+     +----------+     +----+-----+     +----+----+
                                     |                |
                                  Reject           Reject
                                     |                |
                                     v                v
                                +----------+     +----------+
                                | AM Sua   |     | AM Sua   |
                                | Lai      |     | Lai      |
                                +----------+     +----------+
```

### 5.2. Business Rules (DMN)

DMN decision table ap dung cho:

| Rule                      | Input               | Output              |
|---------------------------|----------------------|---------------------|
| Approval level            | Contract value       | Required approvers  |
| Discount limit            | Customer tier + qty  | Max discount %      |
| SLA priority              | Customer tier        | Response time (h)   |
| Lead scoring              | Company size + source| Score 0-100         |

---

## 6. Contract Service — Chi tiet

### 6.1. Lifecycle

```
DRAFT --> REVIEW --> APPROVED --> SENT --> SIGNED --> ACTIVE --> EXPIRED
  |         |          |                     |          |
  v         v          v                     v          v
CANCELLED  REJECTED  REJECTED             VOIDED    RENEWED
```

### 6.2. Approval Chain

- Cau hinh dong theo `contract_value` threshold
- Moi cap phe duyet co deadline (SLA)
- Neu het han -> tu dong escalate len cap tren
- Luu toan bo lich su phe duyet trong `approval_log`

### 6.3. eSign Integration

- Tich hop eSign provider qua webhook callback
- Luu `e_sign_log`: signer, timestamp, IP, certificate hash
- Sau ky -> tu dong chuyen trang thai SIGNED, phat event `contract.signed`

---

## 7. Common Backend Patterns

| Pattern              | Implementation                              |
|----------------------|---------------------------------------------|
| Tenant Middleware    | Filter inject tenant_id tu Hostname header  |
| Base Entity          | id, tenant_id, branch_id, created/updated_at|
| Pagination           | Page + size + sort, max 200 records/page    |
| Error Response       | `{ code, message, details }` chuan hoa      |
| Health Check         | `/actuator/health` — MySQL, Redis, RabbitMQ |
| API Versioning       | URL prefix: /api/v1/... (hien tai v1)       |
| Request Validation   | Bean Validation (JSR 380) + custom validator|
| Logging              | Structured JSON, correlation-id per request |

---

## 8. Scalability

- Moi service chay **2+ instance** phia sau load balancer
- Stateless design — session luu Redis, khong luu local
- RabbitMQ consumer co the scale horizontal (competing consumers)
- Database connection pooling: HikariCP, max 20 conn/service
- Roadmap: tach DB cho notification + integration khi > 10K CCU
