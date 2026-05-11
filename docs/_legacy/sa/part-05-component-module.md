# Part 05 — Component & Module

## Executive Summary

Frontend chia thành 3 tầng UI: **Layout** (trang bao), **Pages** (160+ module domain-specific), **Components** (78 shared). Các component cross-cutting như `boxTable`, `HeaderFilter`, `ButtonComponent`, `ModalConfirm`, `SlidePanel`, `attachmentUpload`, `RebornEditor` được tái sử dụng hàng chục tới hàng trăm lần. Naming convention khá nhất quán (`*List.tsx`, `Create*.tsx`, `*Service.ts`). Tuy nhiên boundary giữa page/component/service không phải lúc nào cũng rõ — có anti-pattern component lớn kiêm fetch, form không unified.

## 1. Phân loại component

| Nhóm | Vị trí | Số lượng | Mô tả |
|------|--------|---------|-------|
| Layout | `src/pages/layout/` | ~5 | LayoutPage, Sidebar, Header, Footer |
| Cross-cutting | `src/components/` | 78 | Button, Modal, Table, Drawer, Upload, Editor |
| Page (domain) | `src/pages/<Domain>/` | 160+ | Mỗi domain 1 folder |
| Sub-component | `src/pages/<Domain>/partials/` | nhiều | Component chỉ dùng nội bộ domain |
| Common | `src/pages/Common/` | ~20 | ChooseRole, FeedbackBox, ChatBot, … |

## 2. Component cross-cutting đáng chú ý

### 2.1. `components/boxTable`

🟢 Wrapper cho **ag-grid** thêm preset: pagination, filter tích hợp, export Excel, column picker, header VN. Được hầu như mọi trang `*List` sử dụng.

Props tiêu biểu:

```tsx
<BoxTable
  rowData={data}
  columnDefs={columns}
  pagination
  onRowClick={handleClick}
  onExport={handleExport}
  totalRecord={total}
  pageSize={20}
/>
```

### 2.2. `components/HeaderFilter`

Thanh filter trên cùng list page: text search, date range, multi-select status, branch, employee. Dispatch filter object ra cha qua callback `onChange`.

### 2.3. `components/ButtonComponent`

Button chuẩn với variants: `primary`, `secondary`, `danger`, `ghost`, `link`; loading spinner, icon trái/phải. Được dùng nhất quán hơn 2000 lần (🟡).

### 2.4. `components/ModalConfirm`

Dialog xác nhận (xoá, chốt đơn, huỷ phiếu). Props: `title`, `content`, `onConfirm`, `onCancel`, `loading`, `variant` (danger/info).

### 2.5. `components/SlidePanel`

Drawer phải cho các form chi tiết (tạo KH, sửa SP, chi tiết đơn). Tránh modal to chặn thao tác — cho phép nhiều panel xếp chồng.

### 2.6. `components/attachmentUpload`

Upload file đính kèm gọi API `APP_UPLOAD_URL`, trả URL, preview ảnh, support exif rotate (`exif-js`). Dùng trong Ticket, Warranty, Customer, Order.

### 2.7. `components/RebornEditor`

Rich text editor bọc **Slate 0.91**:
- `slate-react` cho binding.
- `slate-history` cho undo.
- `slate-html-serializer` để serialize ra HTML lưu DB.
- `dompurify` khi render HTML từ BE.
- Toolbar gồm bold, italic, link, image, bullet, color.

Dùng trong mô tả SP, email marketing, ticket reply, product description.

### 2.8. `components/ErrorBoundary`

Bọc toàn app trong `App.tsx`. Bắt lỗi render → hiển thị fallback UI + log (có thể bắn Firebase / Sentry — chưa quan sát thấy).

### 2.9. Component khác

- `components/icon` — icon wrapper.
- `components/Loading` — spinner full-page.
- `components/DatePickerCommon` — bọc `react-datepicker`.
- `components/SelectCommon` — bọc `react-select` có API async.
- `components/Tabs`, `components/Steps`, `components/Breadcrumb`.

## 3. Sơ đồ dependency (mô tả)

```
       ┌─────────────────────────────────────┐
       │   Pages (domain)                    │
       │   ┌────────┐ ┌────────┐ ┌────────┐  │
       │   │  Sell  │ │ ProdI. │ │Finance │  │
       │   └────┬───┘ └────┬───┘ └────┬───┘  │
       └────────┼──────────┼──────────┼──────┘
                ▼          ▼          ▼
       ┌─────────────────────────────────────┐
       │   Shared Components (78)            │
       │   BoxTable, HeaderFilter, Buttons,  │
       │   ModalConfirm, SlidePanel, Editor  │
       └────────┬────────────────────────────┘
                ▼
       ┌─────────────────────────────────────┐
       │   Hooks / Utils / Model / Context   │
       └────────┬────────────────────────────┘
                ▼
       ┌─────────────────────────────────────┐
       │   Services (Fetch-based API layer)  │
       └────────┬────────────────────────────┘
                ▼
       ┌─────────────────────────────────────┐
       │   fetchConfig.ts (interceptor)      │
       └─────────────────────────────────────┘
```

Nguyên tắc: dependency **1 chiều từ trên xuống**. Page có thể import component, hook, service; component **không** được import page hoặc service domain-specific. Trong thực tế có chỗ vi phạm — xem §7.

## 4. Naming convention

| Loại | Pattern | Ví dụ |
|------|---------|-------|
| Page list | `*List.tsx` | `SaleInvoiceList.tsx` |
| Page create | `Create*.tsx` | `CreateOrderSales.tsx` |
| Page detail | `Detail*.tsx` | `DetailWarranty.tsx` |
| Sub-component riêng domain | `partials/<Name>.tsx` | `Warranty/partials/CollectWarranty.tsx` |
| Service | `<Entity>Service.ts` | `CustomerService.ts` |
| Model | `<Entity>Model.ts` hoặc domain folder | `model/customer/*.ts` |
| Hook | `use*` | `useCustomerList.ts` |
| Context | `*Context` | `authContext.ts` |

## 5. Reusability patterns

### 5.1. Custom hook

Trong `src/hooks/`:

- `useDebounce` — delay input.
- `useCustomerList` — lấy danh sách khách với filter.
- `useGetDetailInvoice` — fetch chi tiết đơn.
- `useDashBoard` — data dashboard.
- `useShortcut` — phím tắt POS.
- `useOnboarding` — tour hướng dẫn.
- `useLA` / `useOmniCXM` — tích hợp LA / OmniCXM.
- `useReconciliationList` — đối soát.
- `useCustomerEnrich` — enrich thêm field.
- `useGetDetailProduct` — chi tiết SP.

Ngoài ra mỗi domain có hook riêng nội bộ.

### 5.2. Context providers

5 context (xem [Part 02 §4](part-02-frontend-architecture.md)). Các page dùng `useContext(UserContext)` để đọc user, language, permissions — không cần prop drilling.

### 5.3. HOC

Hầu như không dùng. Chỉ `ErrorBoundary` bọc toàn app.

### 5.4. Factory cho ag-grid columns

Pattern phổ biến:

```tsx
const getColumns = (t: TFunction): ColDef[] => [
  { field: "code", headerName: t("common.code"), width: 120 },
  { field: "total", headerName: t("sell.total"), valueFormatter: moneyFmt },
  ...
];
```

### 5.5. Service class tĩnh

Mỗi service là một **class với static method** — xem [Part 06 §3](part-06-service-api.md).

## 6. Module riêng đáng chú ý

- `src/modules/tax/` — **Phân hệ thuế HKD/CNKD** portable, đã lazy load trong `routes.tsx`:
  ```tsx
  const TaxModulePage = React.lazy(() => import("@/modules/tax/ui/TaxModule"));
  ```
  Là khối tự chứa — ui, service, model đóng kín trong `modules/tax/`. Đây là hướng đi **tốt**: `src/modules/` cho feature self-contained, thay cho chia đều theo `pages/`, `services/`, `model/`.

## 7. Anti-pattern quan sát

| Anti-pattern | Ví dụ | Hệ quả | Fix gợi ý |
|--------------|-------|--------|-----------|
| Page gọi `fetch()` trực tiếp | Một số trang setting | Bỏ qua interceptor | Bắt buộc qua service |
| Component lớn > 800 dòng | Một số `Create*.tsx` | Khó test, khó tái sử dụng | Tách partials |
| Inline style + SCSS trộn | Rải rác | Style chồng chéo | Chuẩn hoá design token |
| Duplicate hook | `fingerprintjs` + `@fingerprintjs/fingerprintjs` | Bundle dư | Chọn 1 |
| Form state tản mạn | `useState` từng field | Khó validate thống nhất | Dùng `react-hook-form` |
| `any` trong services | Một số file | Mất type safety | Strict gradually |

## 8. Test coverage

🔴 **Thấp** — không có thư mục `__tests__` / `*.test.tsx` / `vitest.config.ts`. Chỉ có `playwright` 1.59 ở devDep — suy luận dùng cho E2E chạy thủ công. Kiến nghị bổ sung ở [Part 14](part-14-quality-risks.md).

## Tham chiếu

- Files:
  - `src/components/*`
  - `src/pages/layout/*`
  - `src/pages/Common/*`
  - `src/hooks/*`
  - `src/modules/tax/*`

---
*Hết Part 05. Xem tiếp [Part 06 — Service layer & API](part-06-service-api.md).*
