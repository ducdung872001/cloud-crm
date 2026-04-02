# CRM Banking – Sales Management Platform

Phiên bản CRM dành cho lĩnh vực **Banking**, chuyển đổi từ cloud-crm (Retail) với UX/UI dark navy banking theme.

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **SCSS** (CSS custom properties, BEM)
- Font: **Be Vietnam Pro**

## Cài đặt & Chạy

```bash
# 1. Copy env
cp .env.example .env.local
# Điền đúng API URLs trong .env.local

# 2. Cài dependencies
npm install

# 3. Chạy dev server
npm run dev
# → http://localhost:4000/crm/
```

## Cấu trúc dự án

```
src/
├── App.tsx                  ← Auth guard + page router
├── contexts/AppContext.tsx  ← isAuthenticated, login/logout, toast, modal
├── configs/
│   ├── apiClient.ts         ← fetch interceptor (Bearer token, URL routing)
│   ├── urls.ts              ← tất cả API endpoints
│   └── mockData.ts          ← fallback data khi API chưa có
├── services/
│   ├── LeadService.ts
│   ├── PipelineService.ts
│   └── index.ts             ← Campaign, Approval, Task, KPI, NPS, BPM, Employee...
├── pages/
│   ├── Login/               ← Form đăng nhập + /authenticator/user/login
│   ├── Dashboard/           ← KPI tổng quan + real API
│   ├── LeadManagement/      ← Quản lý Lead + CRUD
│   ├── Pipeline/            ← Kanban 5 giai đoạn
│   ├── Campaigns/           ← Chiến dịch bán hàng
│   ├── SalesProcess/        ← BPMN Designer + 6 sub-pages admin
│   ├── OrgManagement/       ← Chi nhánh / Nhân viên / Phân quyền
│   ├── Incentive/           ← Hoa hồng nhóm + cá nhân + lịch sử + config
│   ├── SharedPages.tsx      ← Tasks, Approval, KPI, NPS, Customer360, SalesDocs
│   └── AllModals.tsx        ← 23 modals với full API integration
└── styles/
    ├── _variables.scss      ← Design tokens (navy, accent, gold...)
    ├── _common.scss         ← Utility classes
    └── main.scss
```

## Luồng Authentication

1. Chưa đăng nhập → redirect tới `<Login>`
2. Login thành công → lưu `token` vào cookie, load permissions từ `/adminapi/permission/resource`
3. Refresh page → kiểm tra cookie `token`, nếu còn hợp lệ → vào thẳng app
4. Logout → xóa cookie + localStorage → về Login

## API Mapping

| Module | Endpoint |
|---|---|
| Auth | `POST /authenticator/user/login` |
| Lead | `GET/POST /adminapi/customer/*` |
| Pipeline | `GET/POST /adminapi/campaignOpportunity/*` |
| Campaign | `GET/POST /adminapi/campaign/*` |
| Approval | `GET/POST /adminapi/approval/*` |
| Task | `GET/POST /bpmapi/workOrder/*` |
| KPI | `GET /adminapi/kpi/*` |
| NPS | `GET/POST /bizapi/care/customerSurvey/*` |
| Employee | `GET/POST/DELETE /adminapi/employee/*` |
| Department | `GET/POST/DELETE /adminapi/department/*` |
| Role/Permission | `GET/POST /adminapi/role/*`, `/adminapi/rolePermission/*` |
| BPM Process | `GET/POST /bpmapi/process/*` |
| Incentive (Group) | `GET/POST/DELETE /adminapi/tipGroup/*`, `/tipGroupEmployee/*`, `/tipGroupConfig/*` |
| Incentive (User) | `GET/POST/DELETE /adminapi/tipUser/*`, `/tipUserConfig/*` |
| Dashboard | `GET /bizapi/sales/invoice/dashboard` |
