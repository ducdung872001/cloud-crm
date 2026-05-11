# Reborn Loyalty Platform — Tài liệu Dự án

> **Khách hàng:** Chuỗi siêu thị bán lẻ — 2 thương hiệu, ~300 cửa hàng (kế hoạch 1.000–1.500), ~3 triệu khách hàng thành viên, ~150.000 giao dịch/ngày (peak ~300.000).
> **Nhánh codebase:** `reborn-loyalty` · **Mục tiêu demo:** 24/04/2026 · **Cập nhật:** 11/05/2026

---

## 1. Mục đích bộ tài liệu

Bộ tài liệu này mô tả **toàn bộ vòng đời dự án** Reborn Loyalty cho khách hàng siêu thị bán lẻ: từ bài toán kinh doanh → yêu cầu nghiệp vụ → kiến trúc kỹ thuật → triển khai → vận hành. Tài liệu được tổ chức theo **chuẩn industry** (IEEE 830, IEEE 1471, OpenAPI 3.0, PMBOK, ITIL v4) và đánh số **10 nhóm chính + 3 folder phụ trợ** để dễ định vị.

| Bạn là... | Hãy đọc từ... |
|---|---|
| Khách hàng (BOD, sponsor) | `01-business/executive-summary.md` → `01-business/proposal/` |
| BA, PO | `02-requirements/` (URD loyalty-focused) |
| Architect, Tech Lead | `03-architecture/` → `06-analysis/` |
| Backend Dev | `05-backend-tasks/` + `04-api/loyalty-openapi.yaml` |
| QA Engineer | `07-testing/` |
| DevOps, SRE | `08-operations/` |
| End user (CSKH, Cashier, Manager) | `09-userguides/` |

---

## 2. Cấu trúc thư mục

```
docs/
├── README.md                     ← Bạn đang ở đây
│
├── 01-business/                  Bài toán kinh doanh, đề xuất giải pháp, báo giá
│   ├── executive-summary.md      Tóm tắt 2 trang cho BOD
│   ├── gap-analysis.md           Phân tích khoảng cách hiện trạng → đích
│   ├── proposal/                 Đề xuất giải pháp đầy đủ (10 phần)
│   ├── pricing/                  Báo giá + phân tích CAPEX/Margin (INTERNAL)
│   ├── survey/                   Khảo sát khách hàng
│   └── customer-requirements/    Ảnh chat yêu cầu + Q&A
│
├── 02-requirements/              URD — Yêu cầu nghiệp vụ (IEEE 830, loyalty-focused)
│   ├── part-00-introduction.md   Phạm vi, stakeholder, glossary, MoSCoW
│   ├── part-01-actors-roles.md   Actor, role, permission map
│   ├── part-02-membership-core.md      Hội viên: profile 360°, cross-brand
│   ├── part-03-points-engine.md  Tích/tiêu điểm, rule, hạn điểm
│   ├── part-04-membership-tiers.md     Hạng thành viên, đánh giá tự động
│   ├── part-05-rewards-redemption.md   Catalog quà, đổi thưởng
│   ├── part-06-promotions-campaigns.md Khuyến mãi, automation
│   ├── part-07-cross-brand-scope.md    Phạm vi: chain-wide / per-brand / per-group
│   ├── part-08-pos-integration.md      Tích hợp POS, webhook, idempotency
│   ├── part-09-cskh-feedback.md  Ticket khiếu nại, feedback, warranty
│   ├── part-10-analytics-reports.md    Dashboard, RFM, CLV, retention
│   ├── part-11-settings-admin.md Cấu hình, phân quyền, audit
│   └── part-12-nfr.md            Phi chức năng: 3M KH, 500 TPS, 99.5% uptime
│
├── 03-architecture/              SA — Kiến trúc kỹ thuật (IEEE 1471 + 4+1 View)
│   ├── part-00-overview.md
│   ├── part-01-system-context.md
│   ├── part-02-loyalty-domain-model.md
│   ├── part-03-data-architecture.md
│   ├── part-04-microservices.md
│   ├── part-05-api-integration.md
│   ├── part-06-security.md
│   ├── part-07-scalability-3m-customers.md
│   ├── part-08-deployment.md
│   ├── part-09-adr.md            Architecture Decision Records
│   └── part-10-quality-attributes.md
│
├── 04-api/                       OpenAPI 3.0 spec
│   └── loyalty-openapi.yaml
│
├── 05-backend-tasks/             Spec kỹ thuật BE theo microservice
│   ├── market/                   Loyalty engine (chính)
│   ├── customer/                 Customer 360°, cross-brand merge
│   ├── care/                     CSKH, ticket, warranty
│   ├── sales/                    POS integration touch points
│   └── inventory/                (nếu cần — chủ yếu read-only)
│
├── 06-analysis/                  PHÂN TÍCH CHUYÊN SÂU loyalty
│   ├── loyalty-economics.md      Cost-per-point, breakage, NPV, sensitivity
│   ├── rfm-clv-model.md          Phân khúc RFM, công thức CLV
│   ├── point-expiry-strategy.md  So sánh 3 chế độ hết hạn + tác động P&L
│   ├── cross-brand-strategy.md   Pool chung vs riêng, tỷ giá chuyển đổi
│   ├── data-migration-strategy.md  Goldmem/Access/Excel/Supporter → 1 nguồn
│   ├── fraud-prevention.md       Gian lận tích điểm, tài khoản ma, chargeback
│   ├── compliance-pdpa.md        NĐ 13/2023, audit, retention 3M KH
│   └── advanced-earn-rule-bpm-case-study.md  Case Loyalty Quest — earn rule nâng cao qua BPM Engine
│
├── 07-testing/                   QA — ISTQB
│   ├── test-strategy.md
│   ├── testcases-legacy-retail.md   (~51 suite — reference, cần lọc loyalty)
│   ├── validation-audit.md
│   ├── uncertain-bugs.md
│   └── bug-reports/              Bug report từ tester thực tế
│
├── 08-operations/                Triển khai & Vận hành (PMBOK + ITIL)
│   ├── deployment-guide.md
│   ├── data-migration-plan.md
│   ├── operations-runbook.md
│   ├── risk-register.md
│   └── acceptance-criteria.md    Tiêu chí nghiệm thu 3 phase
│
├── 09-userguides/                HDSD cho end user
│   ├── part-01-overview.md       Giới thiệu, đăng nhập
│   ├── part-02-membership.md     Quản lý hội viên, in thẻ
│   ├── part-03-points-tier.md    Tích/tiêu điểm, hạng
│   ├── part-04-rewards.md        Đổi thưởng
│   ├── part-05-promotions.md     Tạo campaign
│   ├── part-06-pos-cashier.md    Hướng dẫn thu ngân
│   ├── part-07-cross-brand.md    Cấu hình scope
│   ├── part-08-reports.md        Đọc dashboard, export
│   ├── part-09-settings.md       Cấu hình admin
│   └── part-10-faq.md
│
├── 10-code-quality/              Báo cáo chất lượng codebase
│   ├── code-review.md
│   ├── dead-code-audit.md
│   ├── frontend-review.md
│   ├── tech-debt-inventory.md
│   └── scan-results.md
│
├── _assets/                      File nguồn (PDF, PPTX, DOCX, XLSX, ảnh)
├── _scripts/                     Script regenerate (.mjs sinh PPTX/DOCX, etc.)
└── _legacy/                      Tài liệu cũ không thuộc bài toán loyalty
                                  (giữ để tham chiếu — POS bán lẻ generic, kho, vận chuyển, ...)
```

---

## 3. Chuẩn tham chiếu

| Nhóm tài liệu | Chuẩn áp dụng |
|---|---|
| `02-requirements/` | IEEE 830, ISO/IEC 29148 |
| `03-architecture/` | IEEE 1471 / ISO/IEC 42010, 4+1 View (Kruchten), C4 model |
| `04-api/` | OpenAPI 3.0 |
| `06-analysis/` | Industry benchmark loyalty (Smile.io, Capillary, LoyaltyOne) |
| `07-testing/` | ISTQB Foundation |
| `08-operations/` | PMBOK 7th, ITIL v4 |
| `03-architecture/part-06-security.md` | OWASP Top 10, NĐ 13/2023 (PDPA VN) |

---

## 4. Quy ước

- **Ngôn ngữ:** Tiếng Việt có dấu cho toàn bộ tài liệu. Thuật ngữ kỹ thuật loyalty giữ nguyên tiếng Anh (members, points, tier, redemption, breakage, RFM, CLV).
- **Mã yêu cầu:** `UR-LOY-<NN>` cho URD loyalty, `UR-MBR-<NN>` membership, `UR-POS-<NN>` POS integration, ...
- **Mã ADR:** `ADR-<NN>` cho mỗi quyết định kiến trúc.
- **Mức độ tự tin:** 🟢 Cao (có code/bằng chứng) · 🟡 Trung bình (suy luận hợp lý) · 🔴 Thấp (giả định, cần xác nhận).
- **Tham chiếu code:** dạng `[file.tsx:42](src/file.tsx#L42)` để click được trong IDE.
- **Sơ đồ:** dùng Mermaid khi có thể (render được trực tiếp trên GitHub), PNG export trong `diagrams/` cho đóng gói PDF.

---

## 5. Vòng đời tài liệu

| Trạng thái | Ý nghĩa | Vị trí |
|---|---|---|
| **Active** | Đang dùng cho dự án loyalty hiện tại | `01-` → `10-` folders |
| **Asset** | File nguồn không phải markdown | `_assets/` |
| **Script** | Code sinh ra tài liệu (tái chạy được) | `_scripts/` |
| **Legacy** | Tài liệu cũ, generic (POS, kho, vận chuyển, Spa) — giữ để tham chiếu | `_legacy/` |

---

## 6. Liên hệ

- **Đơn vị triển khai:** Reborn JSC — `ecosystem.reborn.vn`
- **Liên hệ:** `ceo@reborn.vn`
- **Codebase:** `cloud-crm/` nhánh `reborn-loyalty`
- **App demo:** `http://localhost:4000` (dev), `loyalty.reborn.vn` (staging — TBD)
