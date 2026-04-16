# System Architecture — Reborn CRM (nhánh reborn-tech)

> Tài liệu kiến trúc hệ thống cho nền tảng CRM B2B phục vụ doanh nghiệp công nghệ/IT.
> Phiên bản: 1.0 | Cập nhật: 2026-04-16

---

## Đối tượng đọc

| Vai trò              | Mục đích                                          |
|----------------------|---------------------------------------------------|
| Developer            | Hiểu kiến trúc để implement đúng, không phá module khác |
| DevOps / SRE         | Hiểu infra, deployment topology, scaling strategy  |
| Tech Lead / Architect| Review thiết kế, ra quyết định kỹ thuật             |
| Product / Stakeholder| Nắm tổng quan hệ thống, phạm vi chức năng           |

---

## Mục lục 15 phần

| Phần | File                                  | Nội dung                                          | Trạng thái   |
|------|---------------------------------------|---------------------------------------------------|--------------|
| 00   | [part-00-tong-quan.md](part-00-tong-quan.md) | Tổng quan: mục đích, phạm vi, đối tượng         | Đã viết      |
| 01   | [part-01-kien-truc-tong-the.md](part-01-kien-truc-tong-the.md) | Kiến trúc tổng thể, Context Diagram, 4+1 View | Đã viết      |
| 02   | part-02-microservices.md              | Chi tiết 12 microservice, domain boundary         | Chưa viết    |
| 03   | part-03-du-lieu.md                    | Data architecture, schema strategy, multi-tenant isolation | Chưa viết |
| 04   | part-04-api-gateway.md                | API Gateway, routing, rate limiting, CORS          | Chưa viết    |
| 05   | part-05-xac-thuc-phan-quyen.md        | Auth flow (SSO/Azure MSAL/Firebase), RBAC, JWT     | Chưa viết    |
| 06   | part-06-frontend.md                   | React SPA architecture, routing, state management  | Chưa viết    |
| 07   | part-07-bpm-workflow.md               | BPM engine, business rule, approval workflow       | Chưa viết    |
| 08   | part-08-tich-hop.md                   | Integration: Zalo, Facebook, VoIP/SIP, eInvoice, shipping | Chưa viết |
| 09   | part-09-messaging-event.md            | RabbitMQ, event-driven, outbox pattern             | Chưa viết    |
| 10   | part-10-cache-performance.md          | Redis caching, performance optimization            | Chưa viết    |
| 11   | part-11-deployment.md                 | Deployment topology, CI/CD, environment            | Chưa viết    |
| 12   | part-12-monitoring-logging.md         | Observability, logging, alerting                   | Chưa viết    |
| 13   | part-13-bao-mat.md                    | Security architecture, data protection, compliance | Chưa viết    |
| 14   | part-14-adr.md                        | Architecture Decision Records                      | Chưa viết    |

---

## Quy ước

- **Ngôn ngữ**: Tiếng Việt, thuật ngữ kỹ thuật giữ nguyên tiếng Anh
- **Diagram**: ASCII art (có thể chuyển sang Mermaid/PlantUML sau)
- **Branch**: `reborn-tech` — B2B CRM cho doanh nghiệp công nghệ
- **Backend trung lập ngành**: backend dùng chung cho mọi ngành, không hardcode business rule

---

## Liên kết nhanh

- Backend microservices map: [../backend-tasks/README.md](../backend-tasks/README.md)
- Frontend review checklist: [../FRONTEND_REVIEW_CHECKLIST.md](../FRONTEND_REVIEW_CHECKLIST.md)
- Tech debt tracker: [../TECH_DEBT.md](../TECH_DEBT.md)
