# Reborn Retail CRM -- Documentation Index

> **Reborn Retail CRM** -- Hệ thống quản lý bán lẻ đa kênh (Cửa hàng bán lẻ / Chuỗi / Multi-channel POS).
> Phiên bản: cloud-ver2 | Tenant type: Store / Chain / Franchise.

---

## 1. Kinh doanh & Đề xuất

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Đề xuất giải pháp | [proposal/de-xuat-giai-phap-retail-crm.md](proposal/de-xuat-giai-phap-retail-crm.md) | Bài toán, giải pháp, phạm vi, lợi ích, roadmap triển khai |

---

## 2. Phân tích & Thiết kế (SA)

Tham chiếu: **IEEE 1471** (Architecture Description), **ISO/IEC 25010** (Quality Model).

| # | Tài liệu | Đường dẫn |
|---|---------|-----------|
| 00 | Tổng quan | [sa/part-00-tong-quan.md](sa/part-00-tong-quan.md) |
| 01 | Kiến trúc tổng thể | [sa/part-01-kien-truc-tong-the.md](sa/part-01-kien-truc-tong-the.md) |
| 02 | Frontend Architecture | [sa/part-02-frontend-architecture.md](sa/part-02-frontend-architecture.md) |
| 03 | Tech Stack | [sa/part-03-tech-stack.md](sa/part-03-tech-stack.md) |
| 04 | Routing & Navigation | [sa/part-04-routing-navigation.md](sa/part-04-routing-navigation.md) |
| 05 | Component & Module | [sa/part-05-component-module.md](sa/part-05-component-module.md) |
| 06 | Service & API | [sa/part-06-service-api.md](sa/part-06-service-api.md) |
| 07 | Data Architecture | [sa/part-07-data-architecture.md](sa/part-07-data-architecture.md) |
| 08 | Backend Architecture | [sa/part-08-backend-architecture.md](sa/part-08-backend-architecture.md) |
| 09 | Integration | [sa/part-09-integration.md](sa/part-09-integration.md) |
| 10 | Security | [sa/part-10-security.md](sa/part-10-security.md) |
| 11 | Cross-cutting Concerns | [sa/part-11-cross-cutting.md](sa/part-11-cross-cutting.md) |
| 12 | Deployment | [sa/part-12-deployment.md](sa/part-12-deployment.md) |
| 13 | ADR (Architecture Decision Records) | [sa/part-13-adr.md](sa/part-13-adr.md) |
| 14 | Quality & Risks | [sa/part-14-quality-risks.md](sa/part-14-quality-risks.md) |

---

## 3. Yêu cầu nghiệp vụ (URD)

Tham chiếu: **IEEE 830** (Software Requirements Specification).

| # | Tài liệu | Đường dẫn |
|---|---------|-----------|
| 00 | Giới thiệu | [urd/part-00-gioi-thieu.md](urd/part-00-gioi-thieu.md) |
| 01 | Truy cập & Phân quyền | [urd/part-01-truy-cap.md](urd/part-01-truy-cap.md) |
| 02 | POS Bán hàng | [urd/part-02-pos-ban-hang.md](urd/part-02-pos-ban-hang.md) |
| 03 | Khách hàng | [urd/part-03-khach-hang.md](urd/part-03-khach-hang.md) |
| 04 | Đơn hàng & Hoá đơn | [urd/part-04-don-hang-hoa-don.md](urd/part-04-don-hang-hoa-don.md) |
| 05 | Kho & Sản phẩm | [urd/part-05-kho-san-pham.md](urd/part-05-kho-san-pham.md) |
| 06 | Mua hàng NCC | [urd/part-06-mua-hang-ncc.md](urd/part-06-mua-hang-ncc.md) |
| 07 | Vận chuyển | [urd/part-07-van-chuyen.md](urd/part-07-van-chuyen.md) |
| 08 | Tài chính | [urd/part-08-tai-chinh.md](urd/part-08-tai-chinh.md) |
| 09 | Marketing & Khuyến mãi | [urd/part-09-marketing-khuyen-mai.md](urd/part-09-marketing-khuyen-mai.md) |
| 10 | Loyalty & Chăm sóc | [urd/part-10-loyalty-cham-soc.md](urd/part-10-loyalty-cham-soc.md) |
| 11 | Báo cáo & Phân tích | [urd/part-11-bao-cao-phan-tich.md](urd/part-11-bao-cao-phan-tich.md) |
| 12 | Cài đặt | [urd/part-12-cai-dat.md](urd/part-12-cai-dat.md) |
| 13 | BPM & Automation | [urd/part-13-bpm-automation.md](urd/part-13-bpm-automation.md) |
| 14 | NFR & Tích hợp | [urd/part-14-nfr-tich-hop.md](urd/part-14-nfr-tich-hop.md) |

---

## 4. API Documentation

Tham chiếu: **OpenAPI 3.0** (fka Swagger).

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Retail Core API | [api/retail-openapi.yaml](api/retail-openapi.yaml) | Sales, Inventory, Customer, Billing, Market (Promotions) |

> Loyalty API có spec riêng tại module Loyalty service.

---

## 5. Hướng dẫn sử dụng (HDSD)

| # | Tài liệu | Đường dẫn |
|---|---------|-----------|
| 01 | Bắt đầu | [userguides/part-01-bat-dau.md](userguides/part-01-bat-dau.md) |
| 02 | POS Bán hàng | [userguides/part-02-pos-ban-hang.md](userguides/part-02-pos-ban-hang.md) |
| 03 | Khách hàng | [userguides/part-03-khach-hang.md](userguides/part-03-khach-hang.md) |
| 04 | Đơn hàng & Hoá đơn | [userguides/part-04-don-hang-hoa-don.md](userguides/part-04-don-hang-hoa-don.md) |
| 05 | Kho & Sản phẩm | [userguides/part-05-kho-san-pham.md](userguides/part-05-kho-san-pham.md) |
| 06 | Mua hàng NCC | [userguides/part-06-mua-hang-ncc.md](userguides/part-06-mua-hang-ncc.md) |
| 07 | Vận chuyển | [userguides/part-07-van-chuyen.md](userguides/part-07-van-chuyen.md) |
| 08 | Tài chính | [userguides/part-08-tai-chinh.md](userguides/part-08-tai-chinh.md) |
| 09 | Marketing & Khuyến mãi | [userguides/part-09-marketing-khuyen-mai.md](userguides/part-09-marketing-khuyen-mai.md) |
| 10 | Loyalty & Chăm sóc | [userguides/part-10-loyalty-cham-soc.md](userguides/part-10-loyalty-cham-soc.md) |
| 11 | Báo cáo | [userguides/part-11-bao-cao.md](userguides/part-11-bao-cao.md) |
| 12 | Cài đặt | [userguides/part-12-cai-dat.md](userguides/part-12-cai-dat.md) |
| 13 | BPM Nâng cao | [userguides/part-13-bpm-nang-cao.md](userguides/part-13-bpm-nang-cao.md) |
| 14 | FAQ & Troubleshooting | [userguides/part-14-faq-troubleshooting.md](userguides/part-14-faq-troubleshooting.md) |

---

## 6. Kiểm thử (QA)

Tham chiếu: **ISTQB** (Foundation Level), **OWASP Testing Guide**.

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Test Suites (47 suites) | [TESTCASE_REBORN_RETAIL_FULL.md](TESTCASE_REBORN_RETAIL_FULL.md) | Full regression: CRUD, flow, edge-case, permission |
| Validation Audit | [VALIDATION_AUDIT.md](VALIDATION_AUDIT.md) | Form validation coverage cho 47+ forms |
| Bug Reports | [bugs/bug-report-tester.csv](bugs/bug-report-tester.csv) | Danh sách bug từ tester, trạng thái fix/retest |

---

## 7. Triển khai & Vận hành

Tham chiếu: **ITIL v4** (Service Management).

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Deployment Guide | deployment-guide.md | CI/CD, Docker, env config, rollback |
| Operations Runbook | operations-runbook.md | Monitoring, alerting, incident response, backup |

> *Planned -- chưa tạo file.*

---

## 8. Quản lý dự án

Tham chiếu: **PMBOK 7th** (Project Management).

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Risk Register | risk-register.md | Nhận diện rủi ro, mức độ, biện pháp |
| Acceptance Criteria | acceptance-criteria.md | Tiêu chí nghiệm thu theo module |
| Backend Tasks | [backend-tasks/](backend-tasks/) | Task breakdown cho 12 microservices |

Backend microservices:

| # | Service | Task folder |
|---|---------|-------------|
| 1 | Sales | [backend-tasks/sales/](backend-tasks/sales/) |
| 2 | Inventory | [backend-tasks/inventory/](backend-tasks/inventory/) |
| 3 | Customer | [backend-tasks/customer/](backend-tasks/customer/) |
| 4 | Billing | [backend-tasks/billing/](backend-tasks/billing/) |
| 5 | Market | [backend-tasks/market/](backend-tasks/market/) |
| 6 | Care | [backend-tasks/care/](backend-tasks/care/) |
| 7 | Contract | [backend-tasks/contract/](backend-tasks/contract/) |
| 8 | Finance | [backend-tasks/finance/](backend-tasks/finance/) |
| 9 | Logistics | [backend-tasks/logistics/](backend-tasks/logistics/) |
| 10 | Notification | [backend-tasks/notification/](backend-tasks/notification/) |
| 11 | Operation | [backend-tasks/operation/](backend-tasks/operation/) |
| 12 | Integration | [backend-tasks/integration/](backend-tasks/integration/) |

---

## 9. Code Quality

| Tài liệu | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Code Review Report | [CODE_REVIEW_REPORT.md](CODE_REVIEW_REPORT.md) | Kết quả review code toàn bộ frontend |
| Dead Code Audit | [DEAD_CODE_AUDIT.md](DEAD_CODE_AUDIT.md) | Unused imports, dead components, orphan files |
| Tech Debt Inventory | [TECH_DEBT_INVENTORY.md](TECH_DEBT_INVENTORY.md) | Nợ kỹ thuật cần xử lý, độ ưu tiên |
| Frontend Review | [FRONTEND_REVIEW_RESULT.md](FRONTEND_REVIEW_RESULT.md) | Đánh giá chất lượng frontend |
| Scan Results | [SCAN_RESULTS_SUMMARY.md](SCAN_RESULTS_SUMMARY.md) | Static analysis, dependency audit |

---

## Directory Tree

```
docs/
├── README.md                              # (this file)
├── proposal/
│   └── de-xuat-giai-phap-retail-crm.md
├── sa/                                    # Solution Architecture (15 parts)
│   ├── README.md
│   ├── part-00-tong-quan.md
│   ├── part-01 .. part-14
│   └── diagrams/
├── urd/                                   # User Requirements (15 parts)
│   ├── README.md
│   ├── part-00-gioi-thieu.md
│   ├── part-01 .. part-14
│   └── diagrams/
├── api/
│   └── retail-openapi.yaml                # OpenAPI 3.0 spec
├── userguides/                            # HDSD (14 parts)
│   ├── README.md
│   ├── part-01-bat-dau.md
│   ├── part-02 .. part-14
│   ├── images/
│   └── tooling/
├── TESTCASE_REBORN_RETAIL_FULL.md         # 47 test suites
├── VALIDATION_AUDIT.md
├── bugs/
│   └── bug-report-tester.csv
├── backend-tasks/                         # 12 microservices
│   ├── README.md
│   ├── sales/
│   ├── inventory/
│   ├── customer/
│   ├── billing/
│   ├── market/
│   ├── care/
│   ├── contract/
│   ├── finance/
│   ├── logistics/
│   ├── notification/
│   ├── operation/
│   └── integration/
├── CODE_REVIEW_REPORT.md
├── DEAD_CODE_AUDIT.md
├── TECH_DEBT_INVENTORY.md
├── FRONTEND_REVIEW_RESULT.md
└── SCAN_RESULTS_SUMMARY.md
```

---

## Standards & References

| Tiêu chuẩn | Phạm vi áp dụng | Ghi chú |
|------------|-----------------|---------|
| **IEEE 1471** | SA -- Architecture Description | Viewpoints, views, stakeholders |
| **IEEE 830** | URD -- Software Requirements | Functional & non-functional requirements |
| **OpenAPI 3.0** | API Documentation | RESTful API spec, Swagger-compatible |
| **ISTQB Foundation** | QA -- Test Design | Test levels, techniques, coverage |
| **OWASP Top 10** | Security Testing | XSS, injection, auth bypass |
| **PMBOK 7th** | Project Management | Risk, scope, schedule, quality |
| **ITIL v4** | Operations & Service Mgmt | Incident, change, release management |

---

*Generated: 2026-04-16 | Reborn Retail CRM -- cloud-ver2*
