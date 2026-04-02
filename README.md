# CRM Banking – Sales Management

Phiên bản CRM dành cho lĩnh vực **Banking**, xây dựng trên codebase cloud-crm (Retail) và được tùy chỉnh UX/UI theo prototype Banking dark navy theme.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **SCSS** (BEM methodology, CSS custom properties)
- **React Router DOM v7**
- **React Toastify**

## Cài đặt & Chạy

```bash
# Install dependencies
npm install
# hoặc
yarn install

# Dev server (port 3000)
npm run dev

# Build production
npm run build
```

## Cấu trúc thư mục

```
src/
├── App.tsx                    # Root component, page routing
├── main.tsx                   # Entry point
├── components/
│   ├── header/                # Top header bar
│   ├── sidebar/               # Navigation sidebar
│   ├── modal/                 # Reusable Modal wrapper
│   └── toast/                 # Toast notification
├── configs/
│   └── mockData.ts            # Mock data cho dev/demo
├── contexts/
│   └── AppContext.tsx         # Global state (user, page, modal, toast)
├── pages/
│   ├── Dashboard/             # Sales Dashboard
│   ├── LeadManagement/        # Quản lý Lead
│   ├── Pipeline/              # Pipeline Kanban 5 stages
│   ├── Campaigns/             # Chiến dịch bán hàng
│   ├── SalesProcess/          # BPMN 2.0 quy trình bán
│   ├── SharedPages.tsx        # SalesDocs, Customer360, Tasks, Approval, KPI, NPS
│   └── AllModals.tsx          # Tất cả 23 modal dialogs
└── styles/
    ├── _variables.scss        # Design tokens (colors, spacing, radius)
    ├── _common.scss           # Global components (cards, tables, buttons...)
    ├── _modal-form.scss       # Modal & form styles
    └── main.scss              # Entry point
```

## Các phân hệ (Modules)

| Module | Mô tả |
|--------|-------|
| **Dashboard** | KPI tổng quan, Pipeline mini, Customer 360 quick, Leaderboard RM |
| **Lead Management** | Danh sách lead, filter hot/warm/cold, tạo & import lead |
| **Pipeline** | Kanban 5 giai đoạn: Tiếp cận → Tư vấn → Hồ sơ → Thẩm định → Chốt HĐ |
| **Chiến dịch** | Quản lý campaign Banking, KPI tracker, tài liệu theo chiến dịch |
| **Quy trình bán** | BPMN 2.0 editor cho Vay MN, Thẻ TD, Banca, Vay DN |
| **Tài liệu** | Script tư vấn, bảng phí, brochure, mẫu biểu |
| **Customer 360°** | Hồ sơ KH toàn diện, sản phẩm, cảnh báo & cơ hội |
| **Tasks & Lịch hẹn** | Danh sách task hôm nay/ngày mai, mini calendar, nhắc nhở |
| **Phê duyệt** | Workflow phê duyệt hồ sơ: RM → Credit → BLĐ |
| **Báo cáo KPI** | KPI progress, leaderboard, biểu đồ doanh số |
| **NPS & Chăm sóc** | NPS score, phản hồi KH, gửi khảo sát |

## Design System

Theme: **Dark Navy Banking**
- Primary: `#0A1628` (navy), `#112240` (navy-mid)
- Accent: `#2196F3` (blue), `#42A5F5` (bright)
- Status: `#00C896` (success), `#FF9500` (warning), `#FF4757` (danger), `#F5A623` (gold)
- Font: **Be Vietnam Pro**

## Mở rộng (Roadmap)

Các tính năng có thể phát triển tiếp:
- [ ] Tích hợp real API từ `cloud-sales-master` microservice
- [ ] Core Banking Sync (T24) thực tế
- [ ] Highcharts cho biểu đồ nâng cao
- [ ] bpmn-js cho BPMN editor thực tế
- [ ] React Big Calendar cho lịch hẹn
- [ ] Tích hợp Firebase notifications
