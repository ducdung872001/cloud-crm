# Part 02 — Kien truc Frontend

> Mo ta kien truc ung dung React SPA, cau truc thu muc,
> quan ly state, va chien luoc build/deploy.

---

## 1. Executive Summary

Frontend cua Reborn CRM la mot **Single Page Application (SPA)** xay dung tren
React 17 + TypeScript, build bang Vite 8. Ung dung phuc vu nhieu nganh doc
(tech, retail, spa, ...) tu cung mot codebase, phan biet qua domain-based
tenant routing va feature flag.

Diem noi bat:
- **Mono-repo frontend** — 1 repo duy nhat cho tat ca nganh va module.
- **90+ pages** — moi page la mot thu muc rieng voi component, service, model.
- **Context + localStorage** — quan ly state don gian, khong Redux.
- **Vite 8 HMR** — hot reload < 200ms, build production < 30s.

---

## 2. Technology Stack (Frontend)

| Thu vien        | Phien ban | Vai tro                        |
|-----------------|-----------|--------------------------------|
| React           | 17.x      | UI framework                   |
| TypeScript      | 4.x       | Type safety                    |
| Vite            | 8.x       | Build tool, dev server, HMR    |
| React Router    | 5.x       | Client-side routing            |
| ag-Grid         | 28+       | Data grid (danh sach, bao cao) |
| Highcharts      | 10+       | Bieu do dashboard              |
| Slate.js        | —         | Rich text editor               |
| bpmn-js         | —         | BPMN diagram editor            |
| i18next         | —         | Da ngon ngu                    |
| Azure MSAL      | 2.x       | SSO xac thuc Azure AD          |
| Firebase SDK    | 9.x       | Push notification              |

---

## 3. Cau truc thu muc

```
src/
├── pages/                          # ~90+ page modules
│   ├── ManagementOpportunity/      # Co hoi ban hang
│   │   ├── index.tsx               # Page component chinh
│   │   ├── components/             # Component rieng cua page
│   │   ├── services/               # API call cho page
│   │   ├── model/                  # TypeScript interface/type
│   │   └── configs/                # Cau hinh column, form field
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
│   ├── routes.tsx                  # 1912 dong — dinh nghia routing
│   ├── urls.ts                     # URL catalog (endpoint backend)
│   ├── menuSidebar.ts              # Cau hinh menu sidebar
│   └── permissions.ts              # Ma quyen (RBAC)
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
├── utils/                          # Tien ich dung chung
│   ├── formatDate.ts
│   ├── formatCurrency.ts
│   └── validation.ts
│
├── types/                          # TypeScript definitions
└── App.tsx                         # Root component
```

---

## 4. Quan ly State

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

Du lieu persist qua reload:
- `auth.json` — JWT token, refresh token, user info
- `tenantConfig` — cau hinh tenant (logo, ten, feature flag)
- `sidebarState` — trang thai dong/mo sidebar
- `gridColumnState` — trang thai cot ag-Grid (tuy chinh boi user)
- `locale` — ngon ngu hien tai (vi / en)

### 4.3. Tai sao khong dung Redux?

- Phan lon state la **server state** (fetch tu API, cache ngan)
- Context + localStorage du cho global state hien tai (~5 context)
- Giam do phuc tap va bundle size
- Neu can nang cap: co the chuyen sang Zustand hoac React Query

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

## 7. Cac quy tac phat trien

1. **Moi page la mot thu muc** — chua component, service, model, config rieng.
2. **Shared component chi dat trong `components/`** khi dung >= 2 page.
3. **Khong import truc tiep giua cac page** — giao tiep qua URL params hoac Context.
4. **TypeScript strict mode** — khong dung `any`, dinh nghia interface cho moi API response.
5. **Lazy loading** — moi page dung `React.lazy()` de giam initial bundle.

---

*Tiep theo: [Part 03 — Technology Stack chi tiet](part-03-tech-stack.md)*
