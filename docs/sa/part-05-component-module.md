# Part 05 — Component & Module

> Phan loai component, cau truc module, va bieu do phu thuoc
> giua cac thanh phan trong frontend Reborn CRM.

---

## 1. Executive Summary

Frontend chia component thanh 4 cap: **Shared UI** (dung chung toan app),
**Domain Page** (module nghiep vu), **Modal/Form** (popup nhap lieu),
va **Layout** (khung ung dung). Moi domain page tu quan ly component,
service, model rieng — giam coupling giua cac module.

---

## 2. Phan loai Component

### 2.1. Shared UI Components (`src/components/`)

Component dung lai >= 2 page, khong chua logic nghiep vu cu the.

| Component           | Muc dich                                     |
|---------------------|----------------------------------------------|
| CommonTable         | Wrapper ag-Grid: pagination, filter, export  |
| FormModal           | Modal form chung (create/edit)               |
| DetailDrawer        | Drawer hien thi chi tiet entity              |
| UploadFile          | Upload file (drag & drop, multi-file)        |
| RichTextEditor      | Slate.js wrapper                             |
| SearchSelect        | Dropdown tim kiem async (customer, contact)   |
| DateRangePicker     | Chon khoang ngay                             |
| StatusBadge         | Hien thi trang thai (mau sac theo config)    |
| PermissionGate      | An/hien component theo quyen                 |
| ConfirmDialog       | Dialog xac nhan xoa/huy                      |
| BreadcrumbAuto      | Breadcrumb tu dong tu route                  |
| KanbanBoard         | Kanban drag-drop (co hoi, ticket)            |
| GanttChart          | Bieu do Gantt (du an, milestone)             |
| TimelineView        | Timeline lich su tuong tac                   |
| ExportButton        | Xuat Excel/PDF/CSV                           |

### 2.2. Domain Page Modules (`src/pages/`)

Moi page module la mot thu muc doc lap:

```
src/pages/Contract/
├── index.tsx               # Entry point (React.lazy load)
├── ContractList.tsx         # Trang danh sach
├── ContractDetail.tsx       # Trang chi tiet
├── ContractCreate.tsx       # Form tao moi
├── components/
│   ├── ContractForm.tsx     # Form nhap lieu hop dong
│   ├── ContractTimeline.tsx # Timeline lich su
│   ├── ApprovalStatus.tsx   # Hien thi trang thai phe duyet
│   └── PaymentSchedule.tsx  # Lich thanh toan
├── services/
│   └── contractService.ts   # API call: getList, getById, create, update, delete
├── model/
│   └── contract.ts          # Interface: IContract, IContractFilter, IContractForm
└── configs/
    └── columns.ts           # ag-Grid column definitions
```

### 2.3. Modal & Form Components

| Pattern             | Su dung khi                                  |
|---------------------|----------------------------------------------|
| FormModal (shared)  | Form don gian (< 10 truong)                 |
| Dedicated Form      | Form phuc tap (> 10 truong, tab, step)       |
| Inline Edit         | Chinh sua nhanh tren danh sach (ag-Grid)     |
| Drawer Form         | Form + preview cung luc                      |

### 2.4. Layout Components

```
<AppLayout>
  ├── <Sidebar />           # Menu dieu huong
  ├── <Header />            # Breadcrumb, search, notification, user menu
  └── <Content>
        └── {children}      # Page module duoc render tai day
      </Content>
</AppLayout>
```

---

## 3. Module Dependency Graph

```
                         +------------------+
                         |    AppLayout     |
                         | (Sidebar,Header, |
                         |  Content)        |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |                           |
              +-----+------+             +-----+------+
              | AuthContext |             |ThemeContext |
              | (user,     |             | (theme,    |
              |  tenant,   |             |  locale)   |
              |  permission)|            +------------+
              +-----+------+
                    |
     +--------------+--------------+--------------+
     |              |              |              |
+----+----+   +----+----+   +----+----+   +-----+----+
| Customer|   |  Sales  |   | Project |   | Finance  |
| Module  |   |  Module |   | Module  |   | Module   |
+---------+   +---------+   +---------+   +----------+
     |              |              |              |
     |              |              |              |
     +-------+------+------+------+------+-------+
             |             |             |
       +-----+------+ +---+----+ +------+------+
       | CommonTable | |FormModal| |SearchSelect|
       | (ag-Grid)   | |(antd)  | |(async)     |
       +-------------+ +--------+ +------------+
             |
       +-----+------+
       | ag-Grid    |
       | Enterprise |
       +------------+
```

---

## 4. Quy tac Phu thuoc

### 4.1. Dependency Rules

```
  Layer 1: pages/*          CAN import tu → Layer 2, 3, 4
  Layer 2: components/*     CAN import tu → Layer 3, 4
  Layer 3: hooks/*, utils/* CAN import tu → Layer 4
  Layer 4: types/*, configs/* KHONG import tu cac layer khac

  CAM:
  - pages/A KHONG import tu pages/B
  - components/* KHONG import tu pages/*
```

### 4.2. Cross-module Communication

Khi page A can du lieu tu domain B:

```
Pattern 1: URL param
  /quotation/create?opportunityId=123
  → QuotationCreate doc opportunityId tu URL, fetch data tu API

Pattern 2: Shared service
  import { getCustomerById } from "services/customerService"
  → Bat ky page nao cung co the goi API customer

Pattern 3: Context (global state)
  const { user } = useAuth()
  → Moi page truy cap user/tenant/permission tu AuthContext
```

---

## 5. Thong ke Module

| Nhom Module           | So page | So component rieng | So service file |
|-----------------------|---------|-------------------|-----------------|
| Customer & Contact    | 8       | 12                | 6               |
| Sales (Opp/Quote/Con) | 12      | 20                | 10              |
| Project & Task        | 6       | 15                | 5               |
| Ticketing & Warranty  | 5       | 10                | 4               |
| Marketing & Campaign  | 5       | 8                 | 4               |
| Finance (Cash/Debt)   | 6       | 10                | 5               |
| KPI & Report          | 5       | 8                 | 4               |
| BPM Workflow          | 4       | 12                | 3               |
| Inventory & Product   | 5       | 8                 | 4               |
| Settings              | 8       | 15                | 6               |
| **Tong**              | **64+** | **118+**          | **51+**         |

> Ngoai ra con 70+ shared component trong `src/components/`.

---

## 6. Anti-patterns Can Tranh

1. **God Component** — Page component > 500 dong → tach thanh sub-component.
2. **Prop Drilling > 3 cap** — Dung Context hoac composition pattern.
3. **Business logic trong component** — Chuyen vao service hoac custom hook.
4. **Import cross-page** — KHONG `import X from pages/OtherModule`.
5. **Inline style** — Dung CSS module hoac styled-component.

---

*Tiep theo: [Part 06 — Service & API Layer](part-06-service-api.md)*
