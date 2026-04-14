# Tài liệu Kiến trúc Giải pháp — Reborn CRM

**Solution Architecture Document (SAD)** — tài liệu kỹ thuật mô tả kiến trúc tổng thể và chi tiết của hệ thống Reborn CRM (biến thể Cửa hàng / Spa / Cộng đồng).

> **Trạng thái:** Bản thảo (Draft) — biên soạn ngược từ codebase frontend + best practice cho stack tương đương. Các phần được đánh dấu rõ mức độ tự tin.

## Mục đích tài liệu

SAD trả lời câu hỏi **"Hệ thống được xây như thế nào?"** từ góc độ kỹ thuật, bổ sung cho:
- **HDSD** (`docs/userguides/`) — *"dùng thế nào?"* (góc nhìn người dùng cuối)
- **URD** (`docs/urd/`) — *"phải làm được gì?"* (góc nhìn yêu cầu nghiệp vụ)

## Cấu trúc tài liệu

| Part | Tiêu đề | Tự tin | Mô tả ngắn |
|------|---------|:------:|------------|
| [Part 00](part-00-tong-quan.md) | Tổng quan & Đối tượng đọc | 🟢 | Mục đích, scope, độc giả, conventions |
| [Part 01](part-01-kien-truc-tong-the.md) | Kiến trúc tổng thể (4+1 views) | 🟢 | Logical / Process / Development / Deployment / Scenario |
| [Part 02](part-02-frontend-architecture.md) | Frontend Architecture | 🟢 | React + TypeScript + Vite, structure, patterns |
| [Part 03](part-03-tech-stack.md) | Tech Stack & Dependencies | 🟢 | Toàn bộ thư viện + lý do dùng |
| [Part 04](part-04-routing-navigation.md) | Routing & Navigation | 🟢 | react-router, sidebar config, lazy load, tenant variants |
| [Part 05](part-05-component-module.md) | Component & Module Architecture | 🟢 | 167 page modules, 78 components, contexts, hooks |
| [Part 06](part-06-service-api.md) | Service Layer & API Contract | 🟡 | 240 service files, fetch interceptor, conventions |
| [Part 07](part-07-data-architecture.md) | Data Architecture | 🟡 | ERD, multi-tenant, soft delete, audit trail |
| [Part 08](part-08-backend-architecture.md) | Backend Architecture (suy luận) | 🔴 | Microservices, bounded contexts, gateway pattern |
| [Part 09](part-09-integration.md) | Integration Architecture | 🟡 | SSO, payment, e-invoice, SMS/email, webhook |
| [Part 10](part-10-security.md) | Security Architecture | 🟡 | AuthN/AuthZ, tenant isolation, encryption, OWASP |
| [Part 11](part-11-cross-cutting.md) | Cross-cutting Concerns | 🟡 | Logging, monitoring, error handling, i18n, config |
| [Part 12](part-12-deployment.md) | Deployment & Infrastructure | 🔴 | Environments, CI/CD, network, DR |
| [Part 13](part-13-adr.md) | Architectural Decisions (ADRs) | 🟢🟡 | 18 quyết định kiến trúc quan trọng |
| [Part 14](part-14-quality-risks.md) | Performance, Quality, Risks | 🟡 | NFR mapping, test strategy, risk register |

## Quy ước

### Mức độ tự tin

| Ký hiệu | Ý nghĩa |
|---------|---------|
| 🟢 **Cao** | Quan sát trực tiếp từ source code đang chạy. Có thể trích dẫn file/dòng cụ thể |
| 🟡 **Trung bình** | Suy luận từ frontend / model / service interface. Có thể đúng về bản chất nhưng chi tiết cần backend xác nhận |
| 🔴 **Thấp** | Suy luận theo best practice cho stack tương tự. Đội backend / DevOps cần xác nhận hoặc thay bằng thông tin thực tế |

Mỗi mục có mức độ ≠ 🟢 sẽ có **box cảnh báo** ở đầu nội dung.

### Mã định danh ADR

`ADR-NN` — Architectural Decision Record số NN. Format theo Michael Nygard:
- **Trạng thái** (Proposed / Accepted / Deprecated / Superseded by)
- **Bối cảnh** (Context)
- **Quyết định** (Decision)
- **Hậu quả** (Consequences)

### Đối tượng đọc

| Vai trò | Sử dụng SAD để |
|---------|----------------|
| **Tech Lead / Architect** | Hiểu toàn bộ kiến trúc, ra quyết định nâng cấp |
| **Senior Developer** | Onboarding, hiểu lý do design pattern |
| **DevOps / SRE** | Cấu hình hạ tầng, monitoring, troubleshoot |
| **Security Reviewer** | Audit bảo mật, kiểm tra threat model |
| **Đối tác triển khai** | Hiểu để build add-on / tích hợp |

### Tài liệu liên quan

- HDSD: `docs/userguides/HDSD-full-final.md`
- URD: `docs/urd/URD-full.md`
- Codebase: thư mục root của repository này

## Lịch sử phiên bản

| Phiên bản | Ngày | Người soạn | Mô tả |
|-----------|------|------------|-------|
| 0.1 (Draft) | 2026-04-14 | Reborn (reverse-engineered) | Bản thảo đầu tiên, biên soạn ngược |
