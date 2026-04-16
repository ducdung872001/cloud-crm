# System Architecture — Reborn CRM (nhanh reborn-tech)

> Tai lieu kien truc he thong cho nen tang CRM B2B phuc vu doanh nghiep cong nghe/IT.
> Phien ban: 1.0 | Cap nhat: 2026-04-16

---

## Doi tuong doc

| Vai tro              | Muc dich                                          |
|----------------------|---------------------------------------------------|
| Developer            | Hieu kien truc de implement dung, khong pha module khac |
| DevOps / SRE         | Hieu infra, deployment topology, scaling strategy  |
| Tech Lead / Architect| Review thiet ke, ra quyet dinh ky thuat             |
| Product / Stakeholder| Nam tong quan he thong, pham vi chuc nang           |

---

## Muc luc 15 phan

| Phan | File                                  | Noi dung                                          | Trang thai   |
|------|---------------------------------------|---------------------------------------------------|--------------|
| 00   | [part-00-tong-quan.md](part-00-tong-quan.md) | Tong quan: muc dich, pham vi, doi tuong         | Da viet      |
| 01   | [part-01-kien-truc-tong-the.md](part-01-kien-truc-tong-the.md) | Kien truc tong the, Context Diagram, 4+1 View | Da viet      |
| 02   | part-02-microservices.md              | Chi tiet 12 microservice, domain boundary         | Chua viet    |
| 03   | part-03-du-lieu.md                    | Data architecture, schema strategy, multi-tenant isolation | Chua viet |
| 04   | part-04-api-gateway.md                | API Gateway, routing, rate limiting, CORS          | Chua viet    |
| 05   | part-05-xac-thuc-phan-quyen.md        | Auth flow (SSO/Azure MSAL/Firebase), RBAC, JWT     | Chua viet    |
| 06   | part-06-frontend.md                   | React SPA architecture, routing, state management  | Chua viet    |
| 07   | part-07-bpm-workflow.md               | BPM engine, business rule, approval workflow       | Chua viet    |
| 08   | part-08-tich-hop.md                   | Integration: Zalo, Facebook, VoIP/SIP, eInvoice, shipping | Chua viet |
| 09   | part-09-messaging-event.md            | RabbitMQ, event-driven, outbox pattern             | Chua viet    |
| 10   | part-10-cache-performance.md          | Redis caching, performance optimization            | Chua viet    |
| 11   | part-11-deployment.md                 | Deployment topology, CI/CD, environment            | Chua viet    |
| 12   | part-12-monitoring-logging.md         | Observability, logging, alerting                   | Chua viet    |
| 13   | part-13-bao-mat.md                    | Security architecture, data protection, compliance | Chua viet    |
| 14   | part-14-adr.md                        | Architecture Decision Records                      | Chua viet    |

---

## Quy uoc

- **Ngon ngu**: Tieng Viet, thuat ngu ky thuat giu nguyen tieng Anh
- **Diagram**: ASCII art (co the chuyen sang Mermaid/PlantUML sau)
- **Branch**: `reborn-tech` — B2B CRM cho doanh nghiep cong nghe
- **Backend trung lap nganh**: backend dung chung cho moi nganh, khong hardcode business rule

---

## Lien ket nhanh

- Backend microservices map: [../backend-tasks/README.md](../backend-tasks/README.md)
- Frontend review checklist: [../FRONTEND_REVIEW_CHECKLIST.md](../FRONTEND_REVIEW_CHECKLIST.md)
- Tech debt tracker: [../TECH_DEBT.md](../TECH_DEBT.md)
