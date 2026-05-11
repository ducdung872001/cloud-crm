# 03-Architecture — Solution Architecture Document (SAD)

Tài liệu **Kiến trúc Giải pháp** cho **Reborn Loyalty Platform**, viết theo IEEE 1471 / ISO/IEC 42010 + mô hình 4+1 View (Kruchten) + C4 model.

> **Khác biệt với SAD generic CRM:** Tập trung loyalty engine, data architecture cho 3M KH, integration với POS bên ngoài, multi-brand isolation, scalability cho peak 500 TPS. Phần SAD generic (POS hardware, kho, e-invoice) archive trong [`../_legacy/sa/`](../_legacy/sa/).

## Cấu trúc 11 phần

| Part | Tiêu đề | View / Chủ đề |
|---|---|---|
| [part-00](part-00-overview.md) | Tổng quan & đối tượng đọc | Intro, scope, drivers |
| [part-01](part-01-system-context.md) | System Context (C4 L1) | External actors, systems, boundaries |
| [part-02](part-02-loyalty-domain-model.md) | Loyalty Domain Model | DDD bounded context, aggregates |
| [part-03](part-03-data-architecture.md) | Data Architecture | Schema, partitioning, OLAP, retention |
| [part-04](part-04-microservices.md) | Microservices (C4 L2) | Container view, services, ownership |
| [part-05](part-05-api-integration.md) | API & Integration | REST, webhook, idempotency, security |
| [part-06](part-06-security.md) | Security | AuthN/AuthZ, OWASP, PII, secrets |
| [part-07](part-07-scalability-3m-customers.md) | Scalability cho 3M KH | Sizing, caching, queueing |
| [part-08](part-08-deployment.md) | Deployment | Environments, k8s, CI/CD, DR |
| [part-09](part-09-adr.md) | ADR — Quyết định kiến trúc | Trade-off đã chọn |
| [part-10](part-10-quality-attributes.md) | Quality Attributes & Risks | NFR trace, fitness functions |

## Quy ước

- **Mã ADR:** `ADR-<NN>`
- **Mức tự tin:** 🟢 Cao (có code/bằng chứng) · 🟡 Trung bình (suy luận) · 🔴 Thấp (giả định)
- **Reference code:** `[file.tsx:42](src/file.tsx#L42)`

## Mô hình 4+1 View

| View | Câu hỏi trả lời | Part liên quan |
|---|---|---|
| **Logical** | Hệ thống có những thành phần gì? | Part 02, 04 |
| **Process** | Runtime tương tác thế nào? | Part 05 |
| **Development** | Code tổ chức thế nào? | Part 04 |
| **Physical** | Triển khai ở đâu, như thế nào? | Part 08 |
| **Scenarios (+1)** | Use case tiêu biểu chạy thế nào? | Part 05 (sequence diagrams) |

## Phân biệt với URD và HDSD

| | URD | SAD | HDSD |
|---|---|---|---|
| **Trả lời** | Làm gì? | Xây thế nào? | Dùng thế nào? |
| **Người đọc** | BA, PO, QA, KH | Dev, Architect | User cuối |

Xem [`../02-requirements/`](../02-requirements/) và [`../09-userguides/`](../09-userguides/).
