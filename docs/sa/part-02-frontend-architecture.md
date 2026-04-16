# Part 02 — Kiến trúc Frontend

> Mô tả kiến trúc ứng dụng React SPA, cấu trúc thư mục,
> quản lý state, và chiến lược build/deploy.

---

## 1. Executive Summary

Frontend của Reborn CRM là một **Single Page Application (SPA)** xây dựng trên
React 17 + TypeScript, build bằng Vite 8. Ứng dụng phục vụ nhiều ngành dọc
(tech, retail, spa, ...) từ cùng một codebase, phân biệt qua domain-based
tenant routing và feature flag.

Điểm nổi bật:
- **Mono-repo frontend** — 1 repo duy nhất cho tất cả ngành và module.
- **90+ pages** — mỗi page là một thư mục riêng với component, service, model.
- **Context + localStorage** — quản lý state đơn giản, không Redux.
- **Vite 8 HMR** — hot reload < 200ms, build production < 30s.

---

## 2. Technology Stack (Frontend)

| Thư viện        | Phiên bản | Vai trò                        |
|-----------------|-----------|--------------------------------|
| React           | 17.x      | UI framework                   |
| TypeScript      | 4.x       | Type safety                    |
| Vite            | 8.x       | Build tool, dev server, HMR    |
| React Router    | 5.x       | Client-side routing            |
| ag-Grid         | 28+       | Data grid (danh sách, báo cáo) |
| Highcharts      | 10+       | Biểu đồ dashboard              |
| Slate.js        | —         | Rich text editor               |
| bpmn-js         | —         | BPMN diagram editor            |
| i18next         | —         | Đa ngôn ngữ                    |
| Azure MSAL      | 2.x       | SSO xác thực Azure AD          |
| Firebase SDK    | 9.x       | Push notification              |

---

## 3. Cấu trúc thư mục

```
src/
├── pages/                          # ~90+ page modules
│   ├── ManagementOpportunity/      # Cơ hội bán hàng
│   │   ├── index.tsx               # Page component chính
│   │   ├── components/             # Component riêng của page
│   │   ├── services/               # API call cho page
│   │   ├── model/                  # TypeScript interface/type
│   │   └── configs/                # Cấu hình column, form field
│   ├── Contact/
│   ├── Contract/
│   ├── Ticket/
│   ├── CashBook/
│   ├── Kpi/
│   ├── BPM/
│   ├── Campaign/
│   └── ...
│
├── components/                     # Shared UI components
│   ├── CommonTable/                # Wrapper ag-Grid
│   ├── FormModal/                  # Modal form chung
│   ├── UploadFile/                 # Upload component
│   ├── RichTextEditor/             # Slate wrapper
│   └── ...
│
├── services/                       # API service layer (~240 files)
│   ├── apiHelper.ts                # Axios instance + interceptor
│   ├── fetchConfig.ts              # JWT, hostname, URL rewriting
│   └── <domain>Service.ts          # Service theo domain
│
├── configs/
│   ├── routes.tsx                  # 1912 dòng — định nghĩa routing
│   ├── urls.ts                     # URL catalog (endpoint backend)
│   ├── menuSidebar.ts              # Cấu hình menu sidebar
│   └── permissions.ts              # Mã quyền (RBAC)
│
├── contexts/                       # React Context providers
│   ├── AuthContext.tsx              # User, token, tenant
│   ├── ThemeContext.tsx             # Dark/light mode
│   └── AppContext.tsx               # Global app state
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts
│   ├── usePermission.ts
│   └── useFetch.ts
│
├── utils/                          # Tiện ích dùng chung
│   ├── formatDate.ts
│   ├── formatCurrency.ts
│   └── validation.ts
│
├── types/                          # TypeScript definitions
└── App.tsx                         # Root component
```

---

## 4. Quản lý State

### 4.1. React Context

```
AuthContext          ThemeContext         AppContext
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ user         │    │ theme        │    │ sidebarOpen  │
│ token (JWT)  │    │ locale       │    │ breadcrumb   │
│ tenantId     │    │ direction    │    │ notifications│
│ permissions  │    └──────────────┘    └──────────────┘
│ roles        │
└──────────────┘
```

### 4.2. localStorage

Dữ liệu persist qua reload:
- `auth.json` — JWT token, refresh token, user info
- `tenantConfig` — cấu hình tenant (logo, tên, feature flag)
- `sidebarState` — trạng thái đóng/mở sidebar
- `gridColumnState` — trạng thái cột ag-Grid (tùy chỉnh bởi user)
- `locale` — ngôn ngữ hiện tại (vi / en)

### 4.3. Tại sao không dùng Redux?

- Phần lớn state là **server state** (fetch từ API, cache ngắn)
- Context + localStorage đủ cho global state hiện tại (~5 context)
- Giảm độ phức tạp và bundle size
- Nếu cần nâng cấp: có thể chuyển sang Zustand hoặc React Query

---

## 5. Component Hierarchy

```
<App>
  <AuthProvider>
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Layout>
            <Sidebar />             ← menuSidebar.ts
            <Header />              ← breadcrumb, user menu
            <Content>
              <Routes />            ← routes.tsx (1912 lines)
                <PageModule />      ← Lazy-loaded page
                  <PageToolbar />   ← Filter, search, action buttons
                  <DataGrid />      ← ag-Grid table
                  <FormModal />     ← Create/Edit modal
            </Content>
          </Layout>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  </AuthProvider>
</App>
```

---

## 6. Build & Deploy

```
Development:
  npm run dev → Vite dev server (port 3000) → HMR < 200ms

Production:
  npm run build → Vite build → dist/ (~5MB gzipped)
    → Code splitting (lazy load per page)
    → Tree shaking (remove unused code)
    → Asset hashing (cache busting)

Deploy:
  dist/ → Nginx static server → CDN (CloudFront / Azure CDN)
  Nginx config:
    try_files $uri $uri/ /index.html  (SPA fallback)
```

---

## 7. Các quy tắc phát triển

1. **Mỗi page là một thư mục** — chứa component, service, model, config riêng.
2. **Shared component chỉ đặt trong `components/`** khi dùng >= 2 page.
3. **Không import trực tiếp giữa các page** — giao tiếp qua URL params hoặc Context.
4. **TypeScript strict mode** — không dùng `any`, định nghĩa interface cho mọi API response.
5. **Lazy loading** — mỗi page dùng `React.lazy()` để giảm initial bundle.

---

*Tiếp theo: [Part 03 — Technology Stack chi tiết](part-03-tech-stack.md)*
