# Part 01 — Kiến trúc tổng thể

## Executive Summary

Reborn Retail CRM là một **SPA đa tenant** (React 18 + TypeScript + Vite) gọi tới một tập **microservices** backend qua **API gateway** theo kiểu URL-prefix routing. Multi-tenancy thực hiện bằng header `Hostname` + SSO token trên cookie. Tài liệu mô tả theo mô hình **4+1 View** (Kruchten): Logical, Process, Development, Physical, Scenarios. Biến thể Retail tập trung vào POS, tồn kho đa kho, vận chuyển và marketplace — cùng codebase với các biến thể khác nhưng khác menu/route active.

## 1. Mô hình 4+1 View (tổng quan)

```
                    ┌───────────────────┐
                    │    SCENARIOS      │
                    │  (Use case: bán   │
                    │  hàng POS, NK,    │
                    │  chuyển kho...)   │
                    └─────────┬─────────┘
                              │
        ┌─────────────┬───────┴───────┬──────────────┐
        │             │               │              │
   ┌────▼─────┐ ┌─────▼──────┐ ┌──────▼───────┐ ┌────▼──────┐
   │ LOGICAL  │ │  PROCESS   │ │ DEVELOPMENT  │ │ PHYSICAL  │
   │          │ │            │ │              │ │           │
   │ Bounded  │ │ Luồng gọi  │ │ Module,      │ │ Deploy,   │
   │ context, │ │ API, state │ │ thư mục src/ │ │ env, CDN, │
   │ domain   │ │ machine    │ │ ADR, build   │ │ scale     │
   └──────────┘ └────────────┘ └──────────────┘ └───────────┘
```

| View | Trọng tâm | Chi tiết ở Part |
|------|-----------|-----------------|
| **Logical** | Bounded context, domain model, actor | Part 01, 07, 08 |
| **Process** | Runtime flow, service call, queue | Part 06, 08, 09 |
| **Development** | `src/` folder, module, build | Part 02, 03, 04, 05 |
| **Physical** | Node, server, env, CDN | Part 12 |
| **Scenarios** | Use case khớp kiến trúc | Part 01 (§5), Part 14 |

Tham chiếu sơ đồ tổng thể: `docs/sa/diagrams/01-logical-view.png` (cần bổ sung — chưa tạo).

## 2. Context Diagram (C4 level 1)

```
           ┌───────────────┐
           │  POS Staff    │
           │ (thu ngân,    │
           │  nhân viên    │
           │  bán hàng)    │
           └───────┬───────┘
                   │
                   │ Browser / PWA
                   │ (Chrome, Edge)
                   ▼
 ┌──────────────────────────────────────┐     ┌──────────────┐
 │        REBORN RETAIL CRM             │◄───►│  SSO Reborn  │
 │        (SPA + Microservices)         │     │  reborn.vn   │
 └──────────────┬───────────────────────┘     └──────────────┘
                │
   ┌────────────┼─────────────────────────────────────┐
   │            │            │          │             │
   ▼            ▼            ▼          ▼             ▼
┌──────┐  ┌───────────┐  ┌────────┐  ┌──────┐   ┌──────────┐
│Cổng  │  │Hoá đơn    │  │Logistics│  │Zalo/ │   │Marketplace│
│thanh │  │điện tử    │  │(GHN,    │  │SMS/  │   │(Shopee,  │
│toán  │  │(VNPay,    │  │GHTK,    │  │Email │   │Lazada,   │
│      │  │VNPT,      │  │VNPost)  │  │/FB)  │   │TikTok)   │
│      │  │M-Invoice) │  │         │  │      │   │          │
└──────┘  └───────────┘  └────────┘  └──────┘   └──────────┘
```

Chi tiết interface ngoại xem [Part 09](part-09-integration.md).

## 3. Architectural Drivers → Decisions

| Driver (NFR) | Quyết định kiến trúc | ADR liên quan |
|--------------|----------------------|---------------|
| POS ≤ 500ms tạo đơn | SPA giữ giỏ hàng local, chỉ POST lúc chốt | ADR-03 Client state |
| 1.000+ tenant cô lập | Header `Hostname` + tenantId column (🟡) | ADR-05 Multi-tenant |
| Maintainability | Vite code-split per route + lazy import | ADR-01 Vite |
| Scale peak giờ | Stateless API + queue cho heavy job (🔴) | ADR-07 Queue |
| AuthN/AuthZ tập trung | SSO OAuth2 qua `authenticator` (🟢) | ADR-02 SSO |
| i18n VI/EN | react-i18next + locale file tĩnh | ADR-04 i18n |
| Bảng lớn (SKU, hoá đơn) | ag-grid 30 với virtual scroll | ADR-06 ag-grid |
| BPM tuỳ biến | Tách `/bpmapi` + reactflow + bpmn-js | ADR-08 BPM |

## 4. Chiến lược Multi-Tenant (frontend view)

🟢 **Cao** — quan sát trực tiếp từ `src/configs/fetchConfig.ts`.

Frontend **không** giải quyết tenant bằng subdomain SPA; thay vào đó fetch interceptor **hard-inject** header `Hostname` vào mọi request:

```ts
// src/configs/fetchConfig.ts:42
config.headers["Hostname"] = "kcn.reborn.vn"; // hoặc location.hostname
```

Cơ chế:

1. User đăng nhập tại SSO `reborn.vn` → nhận `token` cookie + `user` cookie tại domain gốc.
2. Browser vào `https://<tenant>.reborn.vn/crm/…` — SPA đọc `location.hostname`.
3. Fetch interceptor set `Hostname: <tenant>.reborn.vn` trên *mọi* request.
4. Backend dùng `Hostname` để resolve `tenantId` và thêm row-level filter vào query (🟡 — suy luận).
5. Tenant data cô lập ở DB bằng column `tenantId`, không tách schema (🔴 — cần BE xác nhận).

> ⚠️ **Lưu ý**: code hiện tại đang hardcode `"kcn.reborn.vn"` dùng cho dev local — comment tại dòng 40 cho thấy đúng path là `location.hostname || ""`. Trước khi release phải bật lại.

## 5. Ranh giới Client-Server

```
  CLIENT (Browser)                          SERVER (Cloud)
┌──────────────────┐      HTTPS          ┌──────────────────┐
│  React SPA       │ ◄─── JSON ────────► │  API Gateway     │
│  + Vite bundle   │                     │  (prefix route)  │
│  + Static assets │      (CDN)          └────────┬─────────┘
│  + Service worker│                              │
│  (Firebase FCM)  │                              ▼
│                  │                     ┌──────────────────┐
│  Local state:    │                     │  N Microservices │
│  - Context API   │                     │  (logical split) │
│  - localStorage  │                     └────────┬─────────┘
│  - Cookie token  │                              │
└──────────────────┘                              ▼
                                         ┌──────────────────┐
                                         │ DB, Cache, Queue │
                                         └──────────────────┘
```

Ranh giới rõ ràng:

- **Client**: render UI, giữ state form và giỏ hàng, gọi API, xử lý lỗi 401 (logout), hiển thị toast.
- **Server**: business logic, persistence, authZ sâu, tích hợp bên thứ 3, schedule job.
- **Không dùng SSR**: toàn bộ Vite build ra static + client-only rendering (`base: "/crm/"` trong `vite.config.ts`).

## 6. Tech Stack (summary)

> Chi tiết version & purpose xem [Part 03](part-03-tech-stack.md).

| Lớp | Công nghệ chính | Ghi chú |
|-----|-----------------|---------|
| Runtime | React 18.3.1 | `package.json` |
| Ngôn ngữ | TypeScript 4.5 | `tsconfig.json` |
| Build | Vite 7.x + plugin SVGR | Migrate từ Webpack |
| Routing | react-router-dom 7.13 | Lazy route |
| State | Context API (5 context) | Không dùng Redux |
| HTTP | fetch + `fetch-intercept` | Không dùng axios |
| Bảng | ag-grid 30 | Cho trang nhiều cột |
| i18n | react-i18next 14 | VI/EN |
| Auth | Cookie token + MSAL | SSO + Microsoft |
| Push | Firebase 9 FCM | Service worker |
| BPM | reactflow 11 + bpmn-js 17 | Vẽ quy trình |
| Editor | Slate 0.91 | RebornEditor |

## 7. Scenario minh hoạ — Tạo đơn bán POS

1. Nhân viên truy cập `/create_sale_add` → React lazy load module Sell.
2. User chọn khách + quét SKU → local state (`useState`) cập nhật giỏ hàng, **không** gọi BE.
3. Gọi `GET /bizapi/inventory/stock/check` để check tồn tại thời điểm chốt.
4. Submit → `POST /bizapi/sales/invoice/create` với JSON payload (`OrderSalesService`).
5. Backend trả `orderNo` + `invoiceId` → SPA điều hướng tới trang in A5/K80.
6. Trigger async (🟡): Marketplace sync, loyalty point, notification Zalo.

## 8. Nguyên lý thiết kế

- **Stateless frontend ngoài cookie** — refresh tab vẫn login, nhờ cookie `token` tại root domain.
- **Fat client, thin service** — logic form / validate / format ở client. BE chỉ validate lại.
- **Module boundary theo domain** — `src/pages/Sell/`, `src/pages/ProductImport/`, `src/pages/Finance/`.
- **Lazy loading** — mỗi route là một `React.lazy()` để tách bundle.
- **Convention over configuration** — naming: `*Service.ts`, `*List.tsx`, `*Form.tsx`, `Create*.tsx`.

## 9. Rủi ro kiến trúc chính

| Rủi ro | Mức | Giảm thiểu |
|--------|-----|------------|
| Hardcode `Hostname` đi prod | 🔴 | CI kiểm tra trước build prod |
| 5 context đan nhau → perf | 🟡 | Tách provider, memo hợp lý |
| Thư viện cũ (React 18 + TS 4.5 + ag-grid 30) | 🟡 | Lộ trình upgrade |
| Không có test tự động | 🔴 | Bổ sung vitest + playwright |
| Bundle lớn do Slate + ag-grid + bpmn-js | 🟡 | Code split + dynamic import |

## Tham chiếu

- Files:
  - `src/configs/fetchConfig.ts`
  - `src/configs/routes.tsx`
  - `src/configs/urls.ts`
  - `src/App.tsx`
  - `vite.config.ts`
  - `package.json`
- Diagrams: `docs/sa/diagrams/01-logical-view.png` (chưa tạo)

---
*Hết Part 01. Xem tiếp [Part 02 — Frontend Architecture](part-02-frontend-architecture.md).*
