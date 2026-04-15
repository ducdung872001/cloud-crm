# Part 04 — Routing & Navigation

## Executive Summary

Routing dùng `react-router-dom` v7 với **single file khai báo** `src/configs/routes.tsx` (1578 dòng). Mỗi route load lười (`React.lazy`) để Vite code-split theo route. Menu sidebar khai báo cùng file bằng cấu trúc `IMenuItem[]` gắn `code` (mã quyền) — hiển thị lọc theo `user.permissions`. Có **8 public route** bypass auth (share_promo, share_coupon, collect_ticket, collect_warranty, link_survey, upload_document, grid_form, login). Tất cả route authenticated render trong `LayoutPage`. Tổng ~100+ route và ~103 menu entry cho biến thể Retail.

## 1. Cấu trúc tổng thể

```
App.tsx
 └─ <Routes>
     ├─ /login                          → <Login/>
     ├─ /grid_form                      → <GridFormNew/>         (public)
     ├─ /link_survey                    → <LinkSurvey/>           (public)
     ├─ /upload_document                → <UploadDocument/>       (public)
     ├─ /collect_ticket                 → <CollectTicket/>        (public)
     ├─ /collect_warranty               → <CollectWarranty/>      (public)
     ├─ /share_promo                    → <SharePromoPage/>       (public)
     ├─ /share_coupon                   → <ShareCouponPage/>      (public)
     └─ /*                              → <LayoutPage/>           (khi isLogin)
                                           └─ <Routes> các route từ routes.tsx
```

## 2. Mô hình dữ liệu route

🟢 Từ `src/model/OtherModel.ts` (suy từ import trong `routes.tsx`):

```ts
export interface IRouter {
  path: string;             // '/create_sale_add'
  element: React.ReactNode; // <CreateOrderSales/> (lazy)
  code?: string;            // mã quyền RBAC, vd 'create_order_sale'
  children?: IRouter[];     // nếu có sub-route
}

export interface IMenuItem {
  name: string;             // i18n key hiển thị
  path?: string;            // route tương ứng
  icon?: string;            // icon material
  code?: string;            // mã quyền (match permissions)
  children?: IMenuItem[];
}
```

## 3. Khai báo route — pattern

🟢 Từ `src/configs/routes.tsx:1-120`:

```tsx
const Dashboard = React.lazy(() => import("pages/Dashboard/index"));
const CreateOrderSales = React.lazy(() => import("pages/Sell/CreateOrderSales/CreateOrderSales"));
const SaleInvoiceList = React.lazy(() => import("pages/Sell/SaleInvoiceList/SaleInvoiceList"));
const ImportInvoiceList = React.lazy(() => import("pages/ProductImport/ImportInvoiceList/ImportInvoiceList"));
const WarehouseListPage = React.lazy(() => import("pages/ProductImport/WarehouseList/WarehouseListPage"));
// ... ~160 import

export const routes: IRouter[] = [
  { path: "/", element: <Dashboard/>, code: "dashboard" },
  { path: "/create_sale_add", element: <CreateOrderSales/>, code: "create_order_sale" },
  { path: "/sale_invoice", element: <SaleInvoiceList/>, code: "view_order_sale" },
  { path: "/warehouse_list", element: <WarehouseListPage/>, code: "view_warehouse" },
  // ...
];
```

Mỗi `React.lazy()` tạo ra một chunk riêng → Vite tự chia file khi build, lần đầu truy cập mới tải.

## 4. Nhóm route chính (retail)

| Nhóm | Prefix path | Module page | Menu mẹ |
|------|-------------|-------------|---------|
| Dashboard | `/` | `Dashboard`, `FinanceDashboard` | — |
| POS bán hàng | `/create_sale_add`, `/sale_invoice`, `/customer_pay` | `pages/Sell/*` | Bán hàng |
| Kho hàng | `/import_invoice`, `/product_inventory`, `/inventory`, `/warehouse_list`, `/create_receipt`, `/adjustment_slip`, `/destroy_slip`, `/transfer_order_form` | `pages/ProductImport/*` | Kho |
| Mua hàng | `/purchase_order`, `/supplier`, … | `pages/Purchase/*` | Mua hàng |
| Tài chính | `/finance/*`, `/cash_book`, `/payment_history` | `pages/Finance/*`, `pages/CashBook/*` | Tài chính |
| Khách hàng | `/customer_person`, `/contact`, `/customer_survey`, `/customer_segment` | `pages/CustomerPerson/*` | Khách hàng |
| Loyalty | `/loyalty_point_ledger`, `/loyalty_reward`, `/loyalty_segment`, `/loyalty_wallet` | `pages/Loyalty*` | Khách hàng |
| CSKH | `/ticket`, `/warranty`, `/internal_mail`, `/feedback_customer`, `/call_center` | `pages/Ticket/*`, `pages/Warranty/*` | CSKH |
| Marketing | `/campaign`, `/marketing_automation`, `/sms_marketing`, `/email_marketing`, `/zalo_marketing` | `pages/*Marketing/*`, `pages/Campaign/*` | Marketing |
| Kênh bán | `/social_crm_facebook`, `/social_crm_zalo` | `pages/SocialCrm*` | Kênh bán |
| Vận chuyển | `/logistics/*` | `pages/Logistics/*` | Vận chuyển |
| Báo cáo | `/report_common`, `/report_customer`, `/report_customer_modern` | `pages/Report*` | Báo cáo |
| BPM | `/setting_process`, `/middle_work`, `/grid_form`, `/upload_document` | `pages/BPM/*`, `pages/MiddleWork/*` | Quy trình |
| Cài đặt | `/setting/*`, `/setting_account`, `/setting_org`, `/setting_sms`, … | `pages/Setting*/*` | Cài đặt |
| Hệ thống | `/install_application`, `/resource_management`, `/timekeeping` | `pages/*` | Hệ thống |

🟡 Khoảng **100+ route** tổng cộng. Xem file trực tiếp để tra cứu đầy đủ — file quá dài để in ở đây.

## 5. Menu sidebar

🟡 **Trung bình** — cấu trúc `IMenuItem[]` khai báo cuối `routes.tsx`. Sidebar render qua component `pages/layout/Sidebar` (suy luận).

Cơ chế lọc quyền:

```
for each item in menuList:
    if item.code in user.permissions (hoặc item.code undefined)
        render
        for each child in item.children:
            nếu child.code in permissions → render
```

Mã quyền (`code`) là key flat ví dụ `view_order_sale`, `create_order_sale`, `view_warehouse`, `adjust_stock`, … — backend trả về `permissions: string[]` trong `user/me` response 🟡.

## 6. Public route (bypass auth)

🟢 Từ `App.tsx:426-433`:

```tsx
{location.pathname == "/grid_form" && <Route path="/grid_form" element={<GridFormNew />} />}
{location.pathname == "/link_survey" && <Route path="/link_survey" element={<LinkSurvey />} />}
{location.pathname == "/upload_document" && <Route path="/upload_document" element={<UploadDocument />} />}
{location.pathname == "/collect_ticket" && <Route path="/collect_ticket" element={<CollectTicket />} />}
{location.pathname == "/collect_warranty" && <Route path="/collect_warranty" element={<CollectWarranty />} />}
{location.pathname == "/share_promo" && <Route path="/share_promo" element={<SharePromoPage />} />}
{location.pathname == "/share_coupon" && <Route path="/share_coupon" element={<ShareCouponPage />} />}
<Route path="/login" element={<Login />} />
```

Các URL này dùng cho khách không đăng nhập (nhận link survey, điền form công khai, share promo code…). Fetch interceptor nhận diện qua string `/public/` trong URL và **không** gắn header Authorization.

## 7. Layout wrapper

🟢 Tất cả route sau khi xác thực đều render trong `<LayoutPage/>` (file `src/pages/layout`). Layout gồm:

- **Header top**: logo, search, notification bell, user menu, choose-role, i18n switcher.
- **Sidebar trái**: menu theo permission, collapsible (state `isCollapsedSidebar` ở `UIContext`).
- **Main area**: `<Suspense fallback={<Loading/>}>` bọc `<Outlet/>` để chờ lazy chunk.
- **Modal layer**: toast, webrtc call income modal, modal payment, chatbot.

## 8. Navigation guard (pseudo code)

```tsx
// App.tsx useEffect
if (!cookies.token) {
  window.location.href = getAppSSOLink(window.location.href);
  return;
}
EmployeeService.takeRoles(cookies.token).then(roles => {
  if (roles.length > 1 && !takeSelectedRole) {
    setChooseRoleInit(true);
  } else {
    setIsLogin(true);
  }
});

// khi 401 (trong fetchConfig.response)
if (response.status === 401) {
   removeCookie('token'); removeCookie('user');
   localStorage.removeItem('permissions');
   // fallback: browser sẽ reload → App redirect lại SSO
}
```

Không có higher-order guard kiểu `<PrivateRoute>` — auth check là **global** ở `App.tsx`.

## 9. Deep link & Return URL

🟢 `App.tsx:59`:
```ts
const returnUrl = new URLSearchParams(location.search).get("returnUrl");
```

Khi bị SSO redirect, `returnUrl` được đính kèm → sau login thành công, SPA quay về đúng trang đó. Redirect mặc định: `/create_sale_add` (`defaultRedirectRef`).

## 10. Breadcrumbs & page title

Breadcrumb không chuẩn hoá — từng page tự render. Page title set qua `document.title = t('screen.xxx.title')` hoặc component `<PageHeader title={...}/>`.

## 11. Performance ghi chú

- **Lần đầu vào / (Dashboard)**: chỉ tải chunk Dashboard + vendor core. Kho, POS, BPM không tải.
- **Chuyển trang trong SPA**: tải thêm chunk mới (có loading), không full reload → POS giữ được ngữ cảnh.
- **Thời gian cold boot**: 🟡 ~3-5s cho HTTPS + SSO + user/me + permission load.
- **Nguy cơ dup chunk**: nếu nhiều page import cùng component lớn (ag-grid, slate) → Vite manual chunk để tách vendor.

## Tham chiếu

- Files:
  - `src/configs/routes.tsx`
  - `src/App.tsx`
  - `src/pages/layout/*`
  - `src/model/OtherModel.ts`
- Diagrams: `docs/sa/diagrams/04-routing-map.png` (chưa tạo).

---
*Hết Part 04. Xem tiếp [Part 05 — Component & Module](part-05-component-module.md).*
