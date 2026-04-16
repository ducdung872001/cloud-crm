# Tai lieu Du an — Reborn Tech CRM (B2B)

> **Nhanh:** reborn-tech
> **Phien ban:** 1.0 | Cap nhat: 2026-04-16
> **Mo ta:** He thong CRM B2B danh cho doanh nghiep lon, tap trung nganh cong nghe / dich vu CNTT
> **Domain:** biz.reborn.vn

---

## Cay thu muc

```
docs/
├── README.md                          ← (file nay)
├── TECH_DEBT.md                       ← No ky thuat can tra
├── FRONTEND_REVIEW_CHECKLIST.md       ← Checklist review FE
├── TESTCASE_REBORN_TECH.md            ← Test case tong hop QA
│
├── proposal/
│   └── de-xuat-giai-phap-b2b-crm.md  ← De xuat giai phap kinh doanh
│
├── sa/                                ← System Architecture (15 phan)
│   ├── README.md
│   ├── part-00-tong-quan.md           ✅ Da viet
│   ├── part-01-kien-truc-tong-the.md  ✅ Da viet
│   └── part-02 → part-14             ⬜ Du kien
│
├── urd/                               ← User Requirements Document (15 phan)
│   ├── README.md
│   ├── part-00-gioi-thieu.md          ✅ Da viet
│   ├── part-01-quan-ly-khach-hang.md  ✅ Da viet
│   ├── part-02-quy-trinh-ban-hang.md  ✅ Da viet
│   └── part-03 → part-14             ⬜ Du kien
│
├── api/
│   └── b2b-crm-openapi.yaml          ← OpenAPI 3.0 spec
│
├── userguides/                        ← HDSD nguoi dung cuoi
│
├── backend-tasks/                     ← Task BE theo microservice
│   ├── README.md
│   ├── billing/
│   ├── care/
│   ├── contract/
│   ├── customer/
│   ├── finance/
│   ├── integration/
│   ├── inventory/
│   ├── logistics/
│   ├── market/
│   ├── notification/
│   ├── operation/
│   └── sales/
│
├── deployment-guide.md                ← Huong dan trien khai
└── operations-runbook.md              ← SLA & Van hanh
```

---

## 1. Kinh doanh

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| De xuat giai phap B2B CRM | [proposal/de-xuat-giai-phap-b2b-crm.md](proposal/de-xuat-giai-phap-b2b-crm.md) | Giai phap tong the, gia tri kinh doanh, chi phi, lo trinh |

---

## 2. System Architecture (SA)

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| SA Index | [sa/README.md](sa/README.md) | Muc luc 15 phan kien truc he thong |
| Part 00 — Tong quan | [sa/part-00-tong-quan.md](sa/part-00-tong-quan.md) | Muc dich, pham vi, doi tuong |
| Part 01 — Kien truc tong the | [sa/part-01-kien-truc-tong-the.md](sa/part-01-kien-truc-tong-the.md) | Context Diagram, 4+1 View |
| Part 02 → 14 | *(du kien)* | Microservices, Data, API GW, Auth, FE, BPM, Integration, Messaging, Cache, Deploy, Monitoring, Security, ADR |

**Tieu chuan:** IEEE 1471 — Recommended Practice for Architectural Description

**Tien do:** 3/15 phan da viet (bao gom README)

---

## 3. User Requirements Document (URD)

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| URD Index | [urd/README.md](urd/README.md) | Muc luc 15 phan yeu cau nguoi dung |
| Part 00 — Gioi thieu | [urd/part-00-gioi-thieu.md](urd/part-00-gioi-thieu.md) | Muc dich, pham vi, MoSCoW |
| Part 01 — Quan ly KH | [urd/part-01-quan-ly-khach-hang.md](urd/part-01-quan-ly-khach-hang.md) | UR-CUS-01 → 05 |
| Part 02 — Quy trinh ban hang | [urd/part-02-quy-trinh-ban-hang.md](urd/part-02-quy-trinh-ban-hang.md) | UR-SALE-01 → 05 |
| Part 03 → 14 | *(du kien)* | Project, Ticketing, BPM, Marketing, KPI, Finance, Report, Inventory, Auth, Settings, Integration, NFR |

**Tieu chuan:** IEEE 830 — Recommended Practice for Software Requirements Specifications

**Tien do:** 3/15 phan da viet (bao gom README)

---

## 4. API Documentation

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| OpenAPI 3.0 Spec | [api/b2b-crm-openapi.yaml](api/b2b-crm-openapi.yaml) | 20 endpoint chinh: Customer, Contact, Opportunity, Quotation, Contract, Sales, Billing, Ticket, BPM |

**Tieu chuan:** OpenAPI Specification 3.0.3

**Xac thuc:** Bearer JWT token + Header `Hostname` (multi-tenant routing)

**Base URL:** `https://biz.reborn.vn`

---

## 5. Huong dan Su dung (HDSD)

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| User Guides | [userguides/](userguides/) | Huong dan su dung end-user, chia theo chuc nang |

**Doi tuong:** Nhan vien kinh doanh, quan ly, ke toan tai doanh nghiep cong nghe

---

## 6. QA — Test Cases

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| Test Case tong hop | [TESTCASE_REBORN_TECH.md](TESTCASE_REBORN_TECH.md) | Kich ban kiem thu chuc nang, regression, smoke test |

**Phuong phap:** Manual test + Playwright automation

---

## 7. Trien khai (Deployment)

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| Deployment Guide | [deployment-guide.md](deployment-guide.md) | Dieu kien tien quyet, bien moi truong, build FE, 12 microservice, Docker, CI/CD, rollback |
| Operations Runbook | [operations-runbook.md](operations-runbook.md) | SLA 99.5%, monitoring, xu ly su co, backup, capacity planning |

---

## 8. Quan ly Du an

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| Risk Register | risk-register.md | *(du kien)* Dang ky rui ro du an |
| Acceptance Criteria | acceptance-criteria.md | *(du kien)* Tieu chi nghiem thu tung module |
| Backend Tasks | [backend-tasks/README.md](backend-tasks/README.md) | Task BE phan theo 12 microservice, quy uoc DDD boundary |

---

## 9. Code Quality

| Tai lieu | Duong dan | Mo ta |
|----------|-----------|-------|
| Tech Debt Tracker | [TECH_DEBT.md](TECH_DEBT.md) | Danh sach no ky thuat can tra |
| Frontend Review Checklist | [FRONTEND_REVIEW_CHECKLIST.md](FRONTEND_REVIEW_CHECKLIST.md) | Checklist review code React truoc khi merge |

---

## Bang tham chieu tieu chuan

| Nhom tai lieu | Tieu chuan ap dung | Phien ban | Ghi chu |
|---------------|-------------------|-----------|---------|
| System Architecture | IEEE 1471 | 2000 | Recommended Practice for Architectural Description of Software-Intensive Systems |
| User Requirements | IEEE 830 | 1998 (R2009) | Recommended Practice for Software Requirements Specifications |
| API | OpenAPI | 3.0.3 | Machine-readable REST API specification |
| Deployment | 12-Factor App | — | Methodology for SaaS application design |
| QA | ISO/IEC 29119 | 2022 | Software and systems engineering — Software testing |
| Security | OWASP Top 10 | 2021 | Web application security risks |

---

## Quy uoc chung

- **Ngon ngu:** Tieng Viet, thuat ngu ky thuat giu nguyen tieng Anh
- **Nhanh Git:** `reborn-tech` — B2B CRM cho doanh nghiep cong nghe/IT
- **Backend trung lap nganh:** code dung chung cho moi nganh, khong hardcode business rule
- **Diagram:** ASCII art hoac Mermaid
- **Encoding:** UTF-8, line ending LF
