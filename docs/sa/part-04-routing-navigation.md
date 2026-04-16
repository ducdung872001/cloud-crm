# Part 04 — Routing & Navigation

> Mo ta cach he thong frontend dinh tuyen URL, cau hinh menu sidebar,
> va ap dung phan quyen vao dieu huong.

---

## 1. Executive Summary

Routing cua Reborn CRM duoc dinh nghia trong file `routes.tsx` (1912 dong),
su dung React Router 5. He thong co **90+ page routes**, moi route duoc
bao ve boi permission check. Menu sidebar doc tu `menuSidebar.ts` va
loc theo quyen cua user hien tai. Tenant routing dua tren hostname
(subdomain) de xac dinh tenant context.

---

## 2. Domain-based Tenant Routing

```
Browser URL:
  https://techcorp.reborn.vn/crm/opportunity

Phan tich:
  ├── techcorp          → tenantId (extract tu subdomain)
  ├── reborn.vn         → platform domain
  ├── /crm              → app prefix
  └── /opportunity      → page route

Luong xu ly:
  1. Nginx nhan request, route tat ca *.reborn.vn → React SPA
  2. React App khoi dong, doc hostname → extract tenantId
  3. AuthContext luu tenantId, gui kem moi API call (header X-Tenant-Id)
  4. Menu sidebar va feature flag loc theo tenant config
```

---

## 3. routes.tsx — Cau truc

File `src/configs/routes.tsx` (1912 dong) dinh nghia toan bo route:

```
routes.tsx
│
├── Public Routes (khong can login)
│   ├── /login
│   ├── /forgot-password
│   ├── /register
│   └── /sso/callback
│
├── Protected Routes (can login + permission)
│   │
│   ├── /dashboard                    # Trang chu
│   │
│   ├── /customer/*                   # Module Khach hang
│   │   ├── /customer/list
│   │   ├── /customer/detail/:id
│   │   └── /customer/create
│   │
│   ├── /contact/*                    # Lien he
│   ├── /partner/*                    # Doi tac
│   │
│   ├── /opportunity/*                # Co hoi ban hang
│   │   ├── /opportunity/kanban
│   │   ├── /opportunity/list
│   │   └── /opportunity/detail/:id
│   │
│   ├── /quotation/*                  # Bao gia
│   ├── /contract/*                   # Hop dong
│   ├── /invoice/*                    # Hoa don
│   │
│   ├── /project/*                    # Du an
│   │   ├── /project/list
│   │   ├── /project/detail/:id
│   │   ├── /project/gantt/:id
│   │   └── /project/board/:id
│   │
│   ├── /ticket/*                     # Ticket ho tro
│   ├── /warranty/*                   # Bao hanh
│   │
│   ├── /campaign/*                   # Chien dich marketing
│   ├── /voucher/*                    # Khuyen mai
│   │
│   ├── /cashbook/*                   # So thu chi
│   ├── /debt/*                       # Cong no
│   ├── /fund/*                       # Quy
│   │
│   ├── /kpi/*                        # KPI
│   ├── /timesheet/*                  # Cham cong / timesheet
│   │
│   ├── /bpm/*                        # BPM workflow
│   │   ├── /bpm/designer
│   │   ├── /bpm/process-list
│   │   └── /bpm/approval
│   │
│   ├── /product/*                    # San pham / dich vu
│   ├── /inventory/*                  # Kho
│   │
│   ├── /report/*                     # Bao cao
│   │   ├── /report/sales
│   │   ├── /report/revenue
│   │   ├── /report/kpi
│   │   └── /report/custom
│   │
│   └── /setting/*                    # Cai dat
│       ├── /setting/user
│       ├── /setting/role
│       ├── /setting/tenant
│       ├── /setting/email-template
│       └── /setting/integration
│
└── Fallback
    └── /404                          # Not found page
```

---

## 4. Route Guard (Permission Check)

```
                 Request: /contract/list
                         |
                         v
               +-------------------+
               | ProtectedRoute    |
               | component         |
               +--------+----------+
                        |
               +--------v----------+
               | isAuthenticated?  |
               +--------+----------+
                   |           |
                  YES          NO → redirect /login
                   |
               +---v--------------+
               | hasPermission    |
               | ("contract.view")|
               +--------+---------+
                   |           |
                  YES          NO → redirect /403
                   |
               +---v--------------+
               | Render <Contract |
               |   ListPage />    |
               +-----------------+
```

Moi route dinh nghia truong `permission`:

```typescript
{
  path: "/contract/list",
  component: lazy(() => import("../pages/Contract/List")),
  permission: "contract.view",
  menuKey: "contract",
}
```

---

## 5. Menu Sidebar

### 5.1. Cau hinh (menuSidebar.ts)

```typescript
const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    key: "customer",
    label: "Khach hang",
    icon: <CustomerIcon />,
    children: [
      { key: "customer-list", label: "Danh sach KH", path: "/customer/list", permission: "customer.view" },
      { key: "contact-list", label: "Lien he", path: "/contact/list", permission: "contact.view" },
      { key: "partner-list", label: "Doi tac", path: "/partner/list", permission: "partner.view" },
    ],
  },
  // ... 15+ nhom menu
];
```

### 5.2. Permission-based Menu Filtering

```
menuItems
    |
    v
filterByPermission(menuItems, user.permissions)
    |
    v
filterByTenantFeature(menuItems, tenant.features)
    |
    v
Rendered sidebar (chi hien menu user co quyen)
```

- Neu user khong co quyen `contract.view`, menu "Hop dong" an hoan toan.
- Neu tenant khong bat feature `warranty`, menu "Bao hanh" bi an.

---

## 6. Navigation Patterns

### 6.1. Breadcrumb tu dong

```
Dashboard > Khach hang > Chi tiet > Techcorp JSC
```

Breadcrumb duoc generate tu route config, khong hardcode.

### 6.2. Quick Navigation

- **Sidebar click** — chuyen page chinh
- **Tab trong detail page** — Customer detail → tab Lien he / Co hoi / Hop dong
- **Action link** — Tu danh sach co hoi, click "Tao bao gia" → /quotation/create?opportunityId=xxx
- **Search bar** — Tim nhanh khach hang, co hoi, hop dong theo ten/ma

### 6.3. Deep Link

Moi entity co URL duy nhat, ho tro bookmark va share link:
```
/customer/detail/12345
/opportunity/detail/67890
/contract/detail/11111
```

---

## 7. Thong ke Route

| Nhom                | So route | Vi du                        |
|---------------------|----------|------------------------------|
| Customer & Contact  | 12       | /customer/*, /contact/*, /partner/* |
| Sales Pipeline      | 16       | /opportunity/*, /quotation/*, /contract/*, /invoice/* |
| Project & Task      | 10       | /project/*, /timesheet/*     |
| Ticketing           | 8        | /ticket/*, /warranty/*       |
| Marketing           | 8        | /campaign/*, /voucher/*      |
| Finance             | 10       | /cashbook/*, /debt/*, /fund/* |
| KPI & Report        | 8        | /kpi/*, /report/*            |
| BPM                 | 6        | /bpm/*                       |
| Settings            | 12       | /setting/*                   |
| **Tong**            | **90+**  |                              |

---

*Tiep theo: [Part 05 — Component & Module](part-05-component-module.md)*
