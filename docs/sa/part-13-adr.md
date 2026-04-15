# Part 13 — Architecture Decision Records (ADR)

> **Executive Summary**: Part này thu thập các quyết định kiến trúc quan trọng đã (hoặc sẽ) áp dụng cho Reborn Retail CRM. Mỗi ADR gồm **Context / Decision / Consequences / Alternatives**. 15 ADR bao phủ lựa chọn framework FE (React + Vite), state management (Context API), routing (react-router v7), multi-tenant (Hostname header), editor (Slate), grid (ag-grid), HTTP client (fetch + interceptor), i18n (react-i18next), và convention code (service pattern, mock pattern, shared util package).

## Convention

```
ADR-NN — Tên quyết định
Status: Accepted / Superseded / Proposed
Date: YYYY-MM-DD
Deciders: <role>
```

- **Context**: vấn đề và ràng buộc.
- **Decision**: lựa chọn đã chốt.
- **Consequences**: hệ quả tốt + xấu.
- **Alternatives considered**: phương án khác + lý do loại.

---

## ADR-01 — Dùng React + TypeScript + Vite (không Next.js/Nuxt)

**Status**: Accepted
**Date**: 2023 (retro)

### Context

CRM admin có hàng trăm trang nghiệp vụ, yêu cầu tương tác cao, hot reload nhanh trong dev. Không cần SEO vì là admin nội bộ. Team quen với React.

### Decision

Dùng **React 18** + **TypeScript 4.5** + **Vite 7** build ra SPA static.

### Consequences

**Tốt**:
- Build time nhanh (~5-10s dev, ~2 phút prod so với Webpack 5 phút).
- HMR tức thì.
- Ecosystem React khổng lồ.
- TypeScript cho type safety trong codebase lớn.

**Xấu**:
- Không có SSR → FCP chậm hơn Next.js cho trang đầu.
- SEO yếu — không quan trọng cho CRM.
- Vite plugin ecosystem chưa phong phú bằng Webpack.

### Alternatives considered

- **Next.js**: SSR không cần, overhead không đáng. Loại.
- **Angular**: team không quen, learning curve cao.
- **Vue + Nuxt**: không có lý do mạnh để chuyển.

---

## ADR-02 — SPA over SSR cho CRM admin

**Status**: Accepted

### Context

CRM chạy sau đăng nhập, không ai share URL cho bot crawler. FCP không critical như marketing site.

### Decision

**SPA thuần**, build ra `dist/` static, serve qua CDN + S3.

### Consequences

**Tốt**: đơn giản deploy, rẻ, scale không giới hạn (CDN).
**Xấu**: trang đầu tiên tải chậm hơn (~3-5s) nếu bundle lớn.

### Alternatives

- **SSR (Next.js)**: thêm layer Node server, tăng chi phí vận hành.
- **SSG**: không phù hợp vì dữ liệu per-tenant động.

---

## ADR-03 — Context API thay vì Redux/Zustand

**Status**: Accepted

### Context

State toàn cục không quá phức tạp: user info, permissions, UI state (modal, toast), POS cart. Không cần time-travel debug.

### Decision

Dùng **React Context API** với 5 provider (`UserContext`, `UIContext`, `NotificationContext`, `PosContext`, `PermissionContext`).

### Consequences

**Tốt**:
- Không thêm dependency.
- API chuẩn React, dev mới onboard dễ.
- Đủ cho use case.

**Xấu**:
- Re-render lan khi value thay đổi → cần memo hợp lý.
- Không có middleware / time-travel.
- Dev tool yếu.

### Alternatives

- **Redux Toolkit**: boilerplate nhiều, overkill.
- **Zustand**: nhỏ gọn, có thể cân nhắc migrate nếu Context thành bottleneck.
- **Jotai / Recoil**: atom-based, khác paradigm.

---

## ADR-04 — Multi-tenant via `Hostname` header (soft isolation)

**Status**: Accepted (có rủi ro — xem [Part 10 §3](part-10-security.md))

### Context

1.000+ tenant cần cô lập dữ liệu. Subdomain per tenant (`<tenant>.reborn.vn`) đã có sẵn. SSO cookie set ở domain gốc.

### Decision

FE inject `Hostname: <tenant>.reborn.vn` header mọi request. BE resolve `tenantId` từ header, thêm filter row-level.

### Consequences

**Tốt**:
- Một codebase, một deployment — scale rẻ.
- Thêm tenant không cần deploy mới.
- Dev local dễ.

**Xấu**:
- **Rủi ro security**: nếu gateway không verify, user có thể spoof header.
- Shared infra failure ảnh hưởng tất cả tenant.
- Query không có tenant filter → data leak.

### Alternatives

- **Subdomain + schema-per-tenant**: isolation mạnh, nhưng migration và scale khó.
- **Database-per-tenant**: mạnh nhất, nhưng chi phí cao + phức tạp.
- **JWT claim** thay header: an toàn hơn nhưng đổi token khi switch tenant phức tạp.

---

## ADR-05 — URL prefix routing làm API gateway pattern

**Status**: Accepted

### Context

Nhiều microservices cần expose qua 1 entry point. Không muốn hardcode full URL trong FE.

### Decision

FE viết URL tương đối với prefix (`/bizapi/sales/invoice/create`). Interceptor rewrite thành full URL dựa env var. BE gateway route theo prefix.

### Consequences

**Tốt**: FE không cần biết BE topology. Đổi BE URL chỉ cần đổi env.
**Xấu**: prefix khó đổi vì lan khắp service code. Phải đặt đúng từ đầu.

### Alternatives

- **GraphQL gateway**: mạnh hơn nhưng overhead lớn.
- **BFF per client**: tốt nhưng nhiều service hơn.

---

## ADR-06 — SSO tập trung (không per-app auth)

**Status**: Accepted

### Context

User của Reborn dùng nhiều ứng dụng (CRM, POS, BPM, dashboard...). Yêu cầu **1 lần đăng nhập dùng mọi nơi**.

### Decision

Triển khai SSO tại `reborn.vn`. Mọi sub-app redirect về đây để login, nhận cookie tại `.reborn.vn`.

### Consequences

**Tốt**: UX tốt, bảo mật tập trung, policy một nơi.
**Xấu**: SSO xuống → mọi app xuống (SPOF). Cần HA.

### Alternatives

- **Per-app login**: UX tệ.
- **OAuth2 Authorization Server (Keycloak)**: chuẩn hơn, phức tạp hơn. Có thể migrate sau.

---

## ADR-07 — react-router-dom v6/v7 (không custom router)

**Status**: Accepted

### Context

Cần routing client-side với nested route, lazy load, guard.

### Decision

Dùng **react-router-dom 7.13**.

### Consequences

**Tốt**: chuẩn de-facto, doc phong phú, loader/action API mới mạnh.
**Xấu**: Breaking change giữa v5 → v6 → v7 từng gây đau.

### Alternatives

- **TanStack Router**: type-safe tốt, nhưng mới và cộng đồng nhỏ.
- **Wouter**: nhẹ nhưng thiếu tính năng.

---

## ADR-08 — Lazy load route cho performance

**Status**: Accepted

### Context

100+ route, mỗi route có thể dùng thư viện nặng (ag-grid, slate, bpmn-js). Load hết trong bundle chính → 10MB+ bundle.

### Decision

Mỗi route dùng `React.lazy(() => import("..."))` + `Suspense` fallback.

### Consequences

**Tốt**: bundle chính ~500KB, user chỉ tải trang họ vào.
**Xấu**: chuyển trang lần đầu có delay (~200-500ms tải chunk).

### Alternatives

- **Manual chunk config**: phức tạp hơn, ít linh hoạt.

---

## ADR-09 — react-i18next cho i18n

**Status**: Accepted

### Context

Cần hỗ trợ VI/EN (và mở rộng sau).

### Decision

Dùng **react-i18next 14** + namespace theo module.

### Consequences

**Tốt**: chuẩn React, plugin phong phú, hỗ trợ interpolation, plural, date.
**Xấu**: overhead load namespace; dev quên import namespace sẽ thấy key thô.

### Alternatives

- **FormatJS (react-intl)**: ICU format mạnh nhưng nặng hơn.
- **Lingui**: AOT compile tốt, nhưng ecosystem nhỏ.

---

## ADR-10 — Slate-based RebornEditor (không TinyMCE/CKEditor)

**Status**: Accepted

### Context

CRM cần rich text editor cho mô tả sản phẩm, template email, ghi chú chăm sóc KH. Yêu cầu: tuỳ biến cao, nhúng field động, tiếng Việt tốt.

### Decision

Tự xây **RebornEditor** trên **Slate 0.91**.

### Consequences

**Tốt**: full control, UI khớp brand, không license fee.
**Xấu**: maintain toàn bộ (toolbar, plugin, dán-copy, table, image)… chi phí dev cao.

### Alternatives

- **TinyMCE**: license commercial, UI khó tuỳ biến.
- **CKEditor 5**: mạnh, plugin đắt.
- **Lexical (Meta)**: mới, API lạ.
- **TipTap**: lên prosemirror, tốt — cân nhắc migrate nếu Slate không maintain.

---

## ADR-11 — ag-grid cho bảng lớn (không react-table)

**Status**: Accepted

### Context

Trang tồn kho, đơn hàng, danh sách KH có thể > 10.000 dòng. Cần virtual scroll, pin column, group, filter, export Excel.

### Decision

Dùng **ag-grid 30 Enterprise** cho trang bảng lớn; dùng bảng Ant Design / custom cho trang ít dòng.

### Consequences

**Tốt**: hiệu năng xuất sắc, tính năng đầy đủ, doc tốt.
**Xấu**: License Enterprise có phí; bundle ~800KB; API khác React convention.

### Alternatives

- **react-table v8 (TanStack Table)**: headless, cần tự làm UI — nhiều công.
- **MUI DataGrid Pro**: cũng trả phí, hiệu năng thua ag-grid.

---

## ADR-12 — Custom fetchConfig (không dùng axios)

**Status**: Accepted

### Context

Cần interceptor, header injection, URL rewrite. Không muốn thêm dependency nếu native `fetch` đủ.

### Decision

Dùng **`fetch` native** + **`fetch-intercept`** cho interceptor.

### Consequences

**Tốt**: nhẹ (~1KB), modern, không dùng XMLHttpRequest.
**Xấu**: `fetch` thiếu timeout native, cần AbortController thủ công; response không auto parse JSON.

### Alternatives

- **Axios**: API tiện, interceptor built-in, nhưng +15KB, dùng XHR cũ.
- **ky** (sindresorhus): fetch wrapper nhẹ, tốt — cân nhắc thay thế.

---

## ADR-13 — react-i18next namespace structure

**Status**: Accepted

### Context

Nếu dồn tất cả chuỗi vào 1 file, `common.json` sẽ > 5.000 key → lag load và dev khó maintain.

### Decision

Tách namespace theo module: `common`, `pos`, `inventory`, `finance`, `customer`, `bpm`, ...

### Consequences

**Tốt**: load lazy theo route; mỗi team quản namespace riêng; giảm conflict merge.
**Xấu**: cần nhớ import namespace; dễ quên fallback.

### Alternatives

- **Single file**: đơn giản nhưng không scale.

---

## ADR-14 — Mock data pattern (src/mocks/)

**Status**: Accepted

### Context

BE thường phát triển sau FE hoặc API chưa sẵn. Cần FE dev độc lập.

### Decision

Tạo thư mục `src/mocks/` chứa mock JSON/TS. Service có thể swap import giữa real và mock lúc dev.

### Consequences

**Tốt**: FE không block; test UI dễ.
**Xấu**: swap thủ công → dev quên commit lại mock = bug production.

### Alternatives

- **MSW (Mock Service Worker)**: chuyên nghiệp hơn, intercept fetch. **Khuyến nghị migrate** dần.

---

## ADR-15 — reborn-util package cho shared logic

**Status**: Accepted

### Context

Nhiều biến thể Reborn (Retail, Spa, F&B, Clinic...) dùng chung util: cookie, validate, format, regex VN.

### Decision

Tách thành package `reborn-util` riêng, publish nội bộ (npm private / git submodule).

### Consequences

**Tốt**: DRY xuyên repo.
**Xấu**: version drift; thay đổi trong util phải test nhiều app; release cycle phức tạp.

### Alternatives

- **Monorepo (Nx, Turborepo)**: tốt hơn về lâu dài, cần đầu tư lớn để chuyển đổi.
- **Copy-paste**: nhanh nhưng diverge.

---

## ADR log summary

| # | Decision | Status | Review date |
|---|----------|--------|-------------|
| 01 | React + TS + Vite | Accepted | 2026 |
| 02 | SPA over SSR | Accepted | 2026 |
| 03 | Context API | Accepted | 2026 (cân nhắc Zustand) |
| 04 | Hostname multi-tenant | Accepted ⚠️ | **Urgent review** — security |
| 05 | URL prefix gateway | Accepted | 2026 |
| 06 | Centralized SSO | Accepted | 2026 |
| 07 | react-router v7 | Accepted | 2026 |
| 08 | Lazy load route | Accepted | 2026 |
| 09 | react-i18next | Accepted | 2026 |
| 10 | Slate RebornEditor | Accepted | 2026 (cân nhắc TipTap) |
| 11 | ag-grid Enterprise | Accepted | 2026 |
| 12 | fetch + intercept | Accepted | 2026 (cân nhắc ky) |
| 13 | i18n namespace split | Accepted | 2026 |
| 14 | Mock pattern | Accepted | 2026 (migrate MSW) |
| 15 | reborn-util package | Accepted | 2026 (cân nhắc monorepo) |

## Tham chiếu

- [Part 01 — Kiến trúc tổng thể](part-01-kien-truc-tong-the.md)
- [Part 02 — Frontend Architecture](part-02-frontend-architecture.md)
- [Part 10 — Security](part-10-security.md)
- [Part 14 — Quality & Risks](part-14-quality-risks.md)

---
*Hết Part 13. Xem tiếp [Part 14 — Quality attributes & Risks](part-14-quality-risks.md).*
