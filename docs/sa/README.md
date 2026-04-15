# Tài liệu Kiến trúc Giải pháp — Reborn Retail CRM

**Solution Architecture Document (SAD)** — mô tả kiến trúc kỹ thuật của hệ thống **Reborn Retail** (biến thể Cửa hàng bán lẻ / Chuỗi / Multi-channel POS), biên soạn ngược từ codebase branch `reborn-retail`.

> **Mục đích**: SAD là tài liệu **kỹ thuật** cho đội phát triển, vận hành, bảo trì. Khác với URD (mô tả *hệ thống làm gì*) và HDSD (hướng dẫn *người dùng thao tác*), SAD trả lời câu hỏi **"Hệ thống được xây thế nào?"**.

## Cấu trúc tài liệu

Tài liệu gồm **15 part** theo mô hình **4+1 View** (Kruchten) mở rộng + ADR + NFR:

| Part | Tiêu đề | View / Chủ đề |
|------|---------|---------------|
| [Part 00](part-00-tong-quan.md) | Tổng quan & Đối tượng đọc | Intro, scope, convention |
| [Part 01](part-01-kien-truc-tong-the.md) | Kiến trúc tổng thể | Context, 4+1 view, driver |
| [Part 02](part-02-frontend-architecture.md) | Kiến trúc Frontend | SPA, module structure, patterns |
| [Part 03](part-03-tech-stack.md) | Tech Stack | Library inventory, version matrix |
| [Part 04](part-04-routing-navigation.md) | Routing & Navigation | react-router, sidebar, lazy load |
| [Part 05](part-05-component-module.md) | Component & Module | Categorization, dependencies |
| [Part 06](part-06-service-api.md) | Service layer & API | fetchConfig, URL prefix, interceptor |
| [Part 07](part-07-data-architecture.md) | Data Architecture | Models, types, state mgmt |
| [Part 08](part-08-backend-architecture.md) | Backend (suy luận) | Microservices, bounded contexts |
| [Part 09](part-09-integration.md) | Integration | SSO, payment, e-invoice, 3rd party |
| [Part 10](part-10-security.md) | Bảo mật | AuthN/AuthZ, OWASP, secrets |
| [Part 11](part-11-cross-cutting.md) | Cross-cutting | Logging, error, i18n, perf |
| [Part 12](part-12-deployment.md) | Triển khai | Environment, scaling, DR |
| [Part 13](part-13-adr.md) | ADR — Quyết định kiến trúc | Trade-off đã chọn |
| [Part 14](part-14-quality-risks.md) | Quality attributes & Risks | Metric, NFR tracker, rủi ro |

## Quy ước

### Mã ADR

```
ADR-<NN> — Tên quyết định
```

Mỗi ADR có: Context, Decision, Consequences, Alternatives considered.

### Mức độ tự tin (Confidence)

Mỗi khẳng định được gắn nhãn:

- 🟢 **Cao** — có bằng chứng trực tiếp từ code / config trong repo này
- 🟡 **Trung bình** — suy luận hợp lý từ convention / comment
- 🔴 **Thấp** — phỏng đoán từ pattern ngành, cần BE xác nhận

### Reference format

```
[file: src/configs/fetchConfig.ts:42]
[file: src/services/CustomerService.ts:32]
```

### Ký hiệu sơ đồ

| Ký hiệu | Ý nghĩa |
|---------|---------|
| Hộp chữ nhật | Component / Service |
| Hộp tròn (cylinder) | Database / Storage |
| Mũi tên đậm | Đồng bộ (sync) |
| Mũi tên nét đứt | Bất đồng bộ (async) / event |
| 🌐 | External system |
| 👤 | Actor (user) |
| ⚙️ | Background job / cron |

## Phân biệt với URD và HDSD

| | URD | SAD | HDSD |
|---|---|---|---|
| **Trả lời** | Hệ thống làm gì? | Xây thế nào? | Dùng thế nào? |
| **Người đọc** | BA, PO, QA, KH | Dev, Architect | User cuối |
| **Format** | Requirement + AC | Diagram + ADR | Step-by-step |

Xem [docs/urd/](../urd/) và [docs/userguides/](../userguides/).
