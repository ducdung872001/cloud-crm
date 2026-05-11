# Part 02 — Kiến trúc Frontend

## Executive Summary

Frontend là một **Single-Page Application** React 18 + TypeScript xây trên **Vite 7** (migrate từ Webpack). Cấu trúc theo domain với `src/pages/` chứa 160+ page module, `src/components/` chứa 78 shared component, `src/services/` chứa 230+ service class gọi API. State management dùng **Context API** (5 context) kết hợp local state + custom hook — **không** dùng Redux / Zustand / React Query. Routing qua `react-router-dom` v7 với `React.lazy()` cho mọi route. i18n qua `react-i18next` với 2 file flat locale (`vi.ts`, `en.ts`).

## 1. Mô hình tổng quát

```
┌─────────────────────────────────────────────────────┐
│              Vite Bundle (SPA)                      │
│                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐  │
│  │  Routes     │──▶│   Pages     │──▶│ Components│  │
│  │ (routes.tsx)│   │ (lazy load) │   │ (shared)  │  │
│  └─────────────┘   └──────┬──────┘   └───────────┘  │
│                           │                         │
│                           ▼                         │
│                    ┌─────────────┐                  │
│                    │  Services   │                  │
│                    │ (fetch API) │                  │
│                    └──────┬──────┘                  │
│                           │                         │
│           ┌───────────────┼────────────────┐        │
│           ▼               ▼                ▼        │
│     ┌──────────┐    ┌──────────┐     ┌──────────┐   │
│     │ Contexts │    │  Hooks   │     │  Utils   │   │
│     │ (5 file) │    │ (custom) │     │ (common) │   │
│     └──────────┘    └──────────┘     └──────────┘   │
└─────────────────────────────────────────────────────┘
```

## 2. Cấu trúc thư mục `src/`

```
src/
├── App.tsx                 # Entry: routes, contexts, auth check
├── main.tsx                # ReactDOM.render
├── configs/                # Cấu hình tĩnh
│   ├── routes.tsx          #  └─ Route declarations (1500+ dòng)
│   ├── urls.ts             #  └─ API endpoint constants (3600+ dòng)
│   ├── fetchConfig.ts      #  └─ Fetch interceptor
│   └── authConfig.ts       #  └─ MSAL config
├── pages/                  # 160+ page modules (mỗi module 1 domain)
│   ├── Sell/               #  ├─ POS: CreateOrderSales, SaleInvoiceList
│   ├── ProductImport/      #  ├─ NK, tồn, inventory, warehouse (gọi /bizapi/inventory)
│   ├── Finance/            #  ├─ CashBook, Debt, Fund (BE thuộc /bizapi/billing — KHÔNG /sales hay /finance)
│   ├── CustomerPerson/     #  ├─ KH cá nhân
│   ├── Warranty/, Ticket/  #  ├─ CSKH (gọi /bizapi/care)
│   └── …
├── components/             # 78 shared components
│   ├── boxTable/           #  ├─ Wrapper ag-grid
│   ├── HeaderFilter/       #  ├─ Filter bar
│   ├── ButtonComponent/    #  ├─ Button chuẩn
│   ├── SlidePanel/         #  ├─ Drawer phải
│   ├── RebornEditor/       #  ├─ Slate editor
│   └── …
├── services/               # 230+ API service classes
│   ├── CustomerService.ts
│   ├── OrderSalesService.ts
│   ├── WarehouseService.ts # FE class, BE đích là /bizapi/inventory (warehouse là sub-domain)
│   └── …
├── contexts/               # 5 React Context
│   ├── authContext.ts      #  ├─ User, role, token
│   ├── userContext.ts      #  ├─ Compose tất cả
│   ├── uiContext.ts        #  ├─ Sidebar, modal, feedback
│   ├── callContext.ts      #  ├─ WebRTC callstate
│   └── index.ts
├── hooks/                  # ~10 custom hook
│   ├── useDebounce.ts
│   ├── useCustomerList.ts
│   ├── useGetDetailInvoice.ts
│   └── …
├── model/                  # TypeScript model theo domain
│   ├── customer/, invoice/, product/, warehouse/, …
│   └── OtherModel.ts       #  └─ IRouter, IMenuItem chung
├── locales/                # i18n
│   ├── vi.ts, en.ts
│   └── i18n.ts
├── mocks/                  # Mock data tĩnh
├── utils/                  # Common helpers
├── assets/                 # Sounds, images, fonts
└── styles/                 # SCSS global
```

## 3. Biên giới module

Nguyên tắc: **page** thuộc 1 domain nghiệp vụ, **component** không biết domain, **service** chỉ biết API URL.

| Layer | Trách nhiệm | Không được |
|-------|-------------|------------|
| **Page** | Layout, state form, điều phối | Gọi fetch thẳng |
| **Component** | Render UI + prop | Biết URL API |
| **Service** | Fetch + parse + throw | Đụng DOM |
| **Hook** | Tái sử dụng logic | Có state riêng dài hạn |
| **Context** | State xuyên app | Giữ data nặng |
| **Util** | Pure function | Import component |

Trong thực tế ranh giới không chặt (nhiều page vẫn có `fetch(...)` inline) — coi là **anti-pattern cần refactor** (Part 14).

## 4. Quản lý state

### 4.1. Context API — 5 context

🟢 **Cao** — `src/contexts/`:

| Context | Nội dung | Scope |
|---------|----------|-------|
| `AuthContext` | id, username, role, token, permissions, valueLanguage | App-wide |
| `UIContext` | isCollapsedSidebar, modal payment, countUnread, notification payload | App-wide |
| `CallContext` | callState, incomingNumber, makeCall, answer, hangup | App-wide (WebRTC) |
| `UserContext` | Compose `{...user, ...authValue, ...uiValue, ...callValue}` | Convenience |
| `index.ts` | Re-export | — |

Toàn bộ khai báo trong `App.tsx`:

```tsx
<AuthContext.Provider value={authValue}>
  <UIContext.Provider value={uiValue}>
    <CallContext.Provider value={callValue}>
      <UserContext.Provider value={{...user, ...}}>
```

### 4.2. Local state

- Form state dùng `useState` + controlled input (không Formik, không react-hook-form trong `package.json`).
- Validate bằng thư viện tự chế `reborn-validation` 1.0.5 🟢.

### 4.3. Caching

- **Không** dùng SWR / React Query.
- Một vài data tĩnh (danh mục) load 1 lần rồi lưu `localStorage` hoặc `useRef`.
- Token lưu cookie để share với SSO domain gốc.

## 5. Routing

🟢 **Cao** — `src/configs/routes.tsx` (1578 dòng):

- Mảng `IRouter[]` export ra cho `App.tsx` map qua `<Route>`.
- Mỗi route: `path`, `element` (từ `React.lazy`), `permission code`, optional `children`.
- `Dashboard`, `CreateOrderSales`, `SaleInvoiceList`, `ImportInvoiceList`, `WarehouseListPage`, … đều `React.lazy(() => import(...))`.
- Menu sidebar dùng `IMenuItem[]` cùng trong `routes.tsx`, lọc theo `permissions` của user.

Chi tiết về routing/menu xem [Part 04](part-04-routing-navigation.md).

## 6. Form handling

- Input chuẩn là custom component (`InputText`, `SelectComponent`, `DatePicker` bọc `react-datepicker` 8).
- `react-number-format` cho tiền tệ.
- `react-text-mask` cho số điện thoại, CCCD.
- Validate qua `reborn-validation` + toast lỗi (`react-toastify`).
- Không có pattern form unified → mỗi page tự giữ state; bổ sung tính thống nhất là **tech debt** (Part 14).

## 7. i18n

🟢 **Cao** — `src/locales/`:

```
src/locales/
├── vi.ts       # Map key → chuỗi tiếng Việt (≈ 5k key)
├── en.ts       # Map key → chuỗi tiếng Anh
└── i18n.ts     # init i18next + react-i18next
```

Page dùng:

```tsx
const { t } = useTranslation();
return <h1>{t("screen.sell.createOrder.title")}</h1>;
```

Ngôn ngữ hiện tại lưu trong `AuthContext.valueLanguage` + localStorage, setter `setValueLanguage` thay đổi runtime không reload.

## 8. Build & Bundle

🟢 **Cao** — `vite.config.ts`:

| Config | Giá trị | Ghi chú |
|--------|---------|---------|
| `base` | `/crm/` | Sub-path deploy |
| Plugin | `@vitejs/plugin-react`, `vite-plugin-svgr` | JSX + SVG import |
| Plugin tự viết | `momentLocaleStrip` | Bỏ ~250KB locale moment |
| Env mode | `dev`, `uat`, `prod`, `devlocal`, `locallaptop` | `package.json` scripts |
| Env var | `APP_API_URL`, `APP_ADMIN_URL`, `APP_BPM_URL`, `APP_BIZ_URL`, `APP_AUTHENTICATOR_URL`, `APP_SSO_LINK`, `APP_DOMAIN`, … | Inject `process.env.*` |
| Code-split | Tự động per `React.lazy()` | Mỗi route 1 chunk |
| Service worker | `firebase-messaging-sw.js` có replace env | Push notification |

**Output**: SPA tĩnh gồm `index.html` + các chunk JS/CSS, deploy lên static host + reverse proxy / CDN (xem [Part 12](part-12-deployment.md)).

## 9. Entry flow

🟢 **Cao** — `src/App.tsx`:

```
main.tsx
   │
   ▼
<BrowserRouter>
   │
   ▼
<App>
   │ 1. Register fetch interceptor
   │ 2. useCookies() → đọc token
   │ 3. Nếu không token → redirect SSO (getAppSSOLink)
   │ 4. Nếu có token → load /user/me, lấy roles
   │ 5. Nếu >1 role → ChooseRole modal
   │ 6. setIsLogin(true)
   │ 7. render LayoutPage (routes match)
   │ 8. Listener FCM cho notification
   │ 9. Khởi tạo WebRTC hook (useSTWebRTC)
   └──────────────────────────────────────►
```

## 10. Patterns quan sát

- **Container/Presentational** một phần: `*List.tsx` vs `*ListView.tsx` vs `*Item.tsx`.
- **Slot pattern**: `<SlidePanel>` nhận `children`.
- **Factory columns** cho ag-grid: `getColumns(t)` → `ColDef[]`.
- **Upload pattern**: `attachmentUpload` component tái sử dụng cross-module.
- **Lazy SPA**: tất cả ngoài Login đều lazy.
- **HOC**: ít (chỉ `ErrorBoundary` bọc toàn app).

## Tham chiếu

- Files: `src/App.tsx`, `src/main.tsx`, `src/configs/routes.tsx`, `src/contexts/*`, `src/locales/*`, `vite.config.ts`.
- Diagrams: `docs/sa/diagrams/02-frontend-module.png` (chưa tạo).

---
*Hết Part 02. Xem tiếp [Part 03 — Tech Stack](part-03-tech-stack.md).*
