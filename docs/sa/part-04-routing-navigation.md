# Part 04 — Routing & Navigation

> Mô tả cách hệ thống frontend định tuyến URL, cấu hình menu sidebar,
> và áp dụng phân quyền vào điều hướng.

---

## 1. Executive Summary

Routing của Reborn CRM được định nghĩa trong file `routes.tsx` (1912 dòng),
sử dụng React Router 5. Hệ thống có **90+ page routes**, mỗi route được
bảo vệ bởi permission check. Menu sidebar đọc từ `menuSidebar.ts` và
lọc theo quyền của user hiện tại. Tenant routing dựa trên hostname
(subdomain) để xác định tenant context.

---

## 2. Domain-based Tenant Routing

```
Browser URL:
  https://techcorp.reborn.vn/crm/opportunity

Phân tích:
  ├── techcorp          → tenantId (extract từ subdomain)
  ├── reborn.vn         → platform domain
  ├── /crm              → app prefix
  └── /opportunity      → page route

Luồng xử lý:
  1. Nginx nhận request, route tất cả *.reborn.vn → React SPA
  2. React App khởi động, đọc hostname → extract tenantId
  3. AuthContext lưu tenantId, gửi kèm mọi API call (header X-Tenant-Id)
  4. Menu sidebar và feature flag lọc theo tenant config
```

---

## 3. routes.tsx — Cấu trúc

File `src/configs/routes.tsx` (1912 dòng) định nghĩa toàn bộ route:

```
routes.tsx
│
├── Public Routes (không cần login)
│   ├── /login
│   ├── /forgot-password
│   ├── /register
│   └── /sso/callback
│
├── Protected Routes (cần login + permission)
│   │
│   ├── /dashboard                    # Trang chủ
│   │
│   ├── /customer/*                   # Module Khách hàng
│   │   ├── /customer/list
│   │   ├── /customer/detail/:id
│   │   └── /customer/create
│   │
│   ├── /contact/*                    # Liên hệ
│   ├── /partner/*                    # Đối tác
│   │
│   ├── /opportunity/*                # Cơ hội bán hàng
│   │   ├── /opportunity/kanban
│   │   ├── /opportunity/list
│   │   └── /opportunity/detail/:id
│   │
│   ├── /quotation/*                  # Báo giá
│   ├── /contract/*                   # Hợp đồng
│   ├── /invoice/*                    # Hóa đơn
│   │
│   ├── /project/*                    # Dự án
│   │   ├── /project/list
│   │   ├── /project/detail/:id
│   │   ├── /project/gantt/:id
│   │   └── /project/board/:id
│   │
│   ├── /ticket/*                     # Ticket hỗ trợ
│   ├── /warranty/*                   # Bảo hành
│   │
│   ├── /campaign/*                   # Chiến dịch marketing
│   ├── /voucher/*                    # Khuyến mại
│   │
│   ├── /cashbook/*                   # Sổ thu chi
│   ├── /debt/*                       # Công nợ
│   ├── /fund/*                       # Quỹ
│   │
│   ├── /kpi/*                        # KPI
│   ├── /timesheet/*                  # Chấm công / timesheet
│   │
│   ├── /bpm/*                        # BPM workflow
│   │   ├── /bpm/designer
│   │   ├── /bpm/process-list
│   │   └── /bpm/approval
│   │
│   ├── /product/*                    # Sản phẩm / dịch vụ
│   ├── /inventory/*                  # Kho
│   │
│   ├── /report/*                     # Báo cáo
│   │   ├── /report/sales
│   │   ├── /report/revenue
│   │   ├── /report/kpi
│   │   └── /report/custom
│   │
│   └── /setting/*                    # Cài đặt
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

Mỗi route định nghĩa trường `permission`:

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

### 5.1. Cấu hình (menuSidebar.ts)

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
    label: "Khách hàng",
    icon: <CustomerIcon />,
    children: [
      { key: "customer-list", label: "Danh sách KH", path: "/customer/list", permission: "customer.view" },
      { key: "contact-list", label: "Liên hệ", path: "/contact/list", permission: "contact.view" },
      { key: "partner-list", label: "Đối tác", path: "/partner/list", permission: "partner.view" },
    ],
  },
  // ... 15+ nhóm menu
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
Rendered sidebar (chỉ hiện menu user có quyền)
```

- Nếu user không có quyền `contract.view`, menu "Hợp đồng" ẩn hoàn toàn.
- Nếu tenant không bật feature `warranty`, menu "Bảo hành" bị ẩn.

---

## 6. Navigation Patterns

### 6.1. Breadcrumb tự động

```
Dashboard > Khách hàng > Chi tiết > Techcorp JSC
```

Breadcrumb được generate từ route config, không hardcode.

### 6.2. Quick Navigation

- **Sidebar click** — chuyển page chính
- **Tab trong detail page** — Customer detail → tab Liên hệ / Cơ hội / Hợp đồng
- **Action link** — Từ danh sách cơ hội, click "Tạo báo giá" → /quotation/create?opportunityId=xxx
- **Search bar** — Tìm nhanh khách hàng, cơ hội, hợp đồng theo tên/mã

### 6.3. Deep Link

Mỗi entity có URL duy nhất, hỗ trợ bookmark và share link:
```
/customer/detail/12345
/opportunity/detail/67890
/contract/detail/11111
```

---

## 7. Thống kê Route

| Nhóm                | Số route | Ví dụ                        |
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
| **Tổng**            | **90+**  |                              |

---

*Tiếp theo: [Part 05 — Component & Module](part-05-component-module.md)*
