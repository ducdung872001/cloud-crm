# Part 06 — Service Layer & API

## Executive Summary

Tầng service gồm ~230 file `src/services/*Service.ts`, mỗi file là **class với static method** gọi API qua `fetch`. Toàn bộ request đi qua **fetch-intercept** cài ở `src/configs/fetchConfig.ts` — thêm header Authorization, Selectedrole, Hostname, rewrite URL theo prefix. Endpoint được tập trung trong `src/configs/urls.ts` (3600 dòng) với các prefix: `/api`, `/adminapi`, `/bizapi` (và các sub: `/sales`, `/finance`, `/inventory`, `/warehouse`, `/care`, `/billing`, `/logistics`, `/integration`, `/market`, `/notification`), `/bpmapi`, `/authenticator`. Error 401 → xoá cookie, reload, trigger SSO flow. Mock data dưới `src/mocks/`.

## 1. Fetch interceptor

🟢 **Cao** — `src/configs/fetchConfig.ts`:

```ts
import fetchIntercept from "fetch-intercept";
import { getCookie } from "reborn-util";

const prefixAdmin = "/adminapi";
const prefixApi   = "/api";
const prefixBiz   = "/bizapi";

export default function RegisterFetch() {
  const [cookies, , removeCookie] = useCookies();

  return fetchIntercept.register({
    request(url, config) {
      config = config || {};
      config.headers = config.headers || {};
      const isFormDataBody = config.body instanceof FormData;
      const isPublic = url.includes("/public/");
      const token = getCookie("token");

      if (token && !isPublic) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      if (token && takeSelectedRole && !isPublic) {
        config.headers["Selectedrole"] = takeSelectedRole;
      }
      if (!config.headers.Accept) config.headers.Accept = "application/json";
      if (isFormDataBody) delete config.headers["Content-Type"];
      else if (!config.headers["Content-Type"]) config.headers["Content-Type"] = "application/json";

      config.headers["Hostname"] = "kcn.reborn.vn"; // ⚠ hardcode dev

      if (!url.startsWith("http")) {
        if (url.startsWith(prefixBiz)) {
          url = process.env.APP_BIZ_URL + url.replace(prefixBiz, "");
        } else if (url.startsWith(prefixAdmin) || url.startsWith(prefixApi)) {
          url = process.env.APP_API_URL + url;
        } else {
          url = process.env.APP_AUTHENTICATOR_URL + url;
        }
      }
      return [url, config];
    },
    response(response) {
      if (response.status === 401) {
        removeCookie("user", ...); removeCookie("token", ...);
        localStorage.removeItem("permissions");
      }
      return response;
    },
  });
}
```

**Đặc điểm quan trọng**:

1. **Rewrite URL theo prefix** — service chỉ cần viết path tương đối (`/bizapi/sales/invoice/create`); interceptor tự thay prefix bằng full base URL từ env var (`APP_BIZ_URL`, `APP_API_URL`, `APP_AUTHENTICATOR_URL`).
2. **Fallback**: URL không có prefix nào → ghép với `APP_AUTHENTICATOR_URL` (ví dụ `/user/me` sẽ trỏ `https://reborn.vn/user/me`).
3. **Public route bypass auth**: nếu URL chứa `/public/` thì không gắn `Authorization`.
4. **FormData**: không set `Content-Type` để browser tự thêm boundary cho multipart.
5. **Hostname header** gắn trên mọi request → tenancy routing BE (🟡).
6. **401 handler**: xoá cookie + localStorage permissions. Trang sau reload → `App.tsx` không có token → redirect SSO.

## 2. URL prefix routing

🟢 Từ `src/configs/urls.ts:1-28`:

```ts
const prefixAdmin        = "/adminapi";
const prefixBiz          = "/bizapi";
const prefixBpm          = process.env.APP_BPM_URL + "/bpmapi";
const prefixApi          = "/api";
const prefixAuthenticator= "/authenticator";

const prefixSales        = prefixBiz + "/sales";
const prefixNotification = prefixBiz + "/notification";
const prefixFinance      = prefixBiz + "/finance";
const prefixInventory    = prefixBiz + "/inventory";
const prefixWarehouse    = prefixBiz + "/warehouse";
const prefixCare         = prefixBiz + "/care";
const prefixBilling      = prefixBiz + "/billing";
const prefixLogistics    = prefixBiz + "/logistics";
const prefixIntegration  = prefixBiz + "/integration";
const prefixMarket       = prefixBiz + "/market";

// Các gateway ngoài
const prefixRebornVn     = (process.env.APP_AUTHENTICATOR_URL || "https://reborn.vn") + "/api";
const prefixCloudMarket  = (process.env.APP_API_URL || "https://cloud.reborn.vn") + "/market";
const prefixConnect      = process.env.APP_CONNECT_URL || "https://connect.reborn.vn";
const prefixUpload       = process.env.APP_UPLOAD_URL  || "https://login.noron.vn";
const prefixAthena       = process.env.APP_ATHENA_URL  || "https://api-athenaspear-prod.athenafs.io";
```

### Bảng ánh xạ prefix → dịch vụ suy luận

| Prefix | Base env | Dịch vụ suy luận | Domain |
|--------|---------|------------------|--------|
| `/adminapi` | `APP_ADMIN_URL` | Admin API (super admin) | Quản trị, config |
| `/api` | `APP_API_URL` | Main API | Dashboard, common |
| `/bizapi/sales` | `APP_BIZ_URL` | Sales service | POS, invoice, order |
| `/bizapi/finance` | `APP_BIZ_URL` | Finance service | Cashbook, debt, fund |
| `/bizapi/inventory` | `APP_BIZ_URL` | Inventory service | Tồn kho, stock movement |
| `/bizapi/warehouse` | `APP_BIZ_URL` | Warehouse service | Kho, transfer |
| `/bizapi/care` | `APP_BIZ_URL` | Customer care | Ticket, warranty, feedback |
| `/bizapi/billing` | `APP_BIZ_URL` | Billing / e-invoice | VAT, hoá đơn VN |
| `/bizapi/logistics` | `APP_BIZ_URL` | Logistics | GHN/GHTK/VNPost |
| `/bizapi/integration` | `APP_BIZ_URL` | Integration hub | Marketplace, webhook |
| `/bizapi/market` | `APP_BIZ_URL` | Market / campaign | Campaign, segment |
| `/bizapi/notification` | `APP_BIZ_URL` | Notification | Push, SMS, email |
| `/bpmapi` | `APP_BPM_URL` | BPM engine | Workflow, rule |
| `/authenticator` | `APP_AUTHENTICATOR_URL` | SSO / user / role | Auth |
| `/application` | `APP_AUTHENTICATOR_URL` | App metadata | Setting |
| Không prefix | `APP_AUTHENTICATOR_URL` | Fallback | Catch-all |

## 3. Service class pattern

Pattern chung: **class tĩnh, 1 method 1 endpoint, trả Promise**.

Ví dụ (minh hoạ theo convention quan sát):

```ts
// src/services/OrderSalesService.ts
import urls from "configs/urls";

export default class OrderSalesService {
  static async createOrder(payload: OrderCreateRequest) {
    const res = await fetch(urls.orderSales.create, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async getList(filter: OrderFilter) {
    const qs = new URLSearchParams(filter as any).toString();
    const res = await fetch(`${urls.orderSales.list}?${qs}`);
    return res.json();
  }

  static async getDetail(id: number) {
    const res = await fetch(urls.orderSales.detail + "?id=" + id);
    return res.json();
  }
}
```

Response shape (🟡 suy luận từ `handleGetRoles` trong `App.tsx`):

```ts
interface ApiResponse<T> {
  code: number;         // 0 = success
  message?: string;
  result: T;
  total?: number;
}
```

Code `0` = success. Khác `0` → hiển thị toast theo `message`. 401 bị chặn ở interceptor trước khi về service.

## 4. Service đáng chú ý (retail)

| File | Domain |
|------|--------|
| `OrderSalesService.ts` | Tạo/sửa/list đơn POS |
| `CustomerService.ts` | KH cá nhân |
| `ContactService.ts` | Liên hệ |
| `ProductService.ts` | Sản phẩm, biến thể |
| `WarehouseService.ts` | Kho |
| `InventoryService.ts` | Tồn kho |
| `ImportInvoiceService.ts` | Phiếu NK |
| `TransferOrderService.ts` | Chuyển kho |
| `AdjustmentSlipService.ts` | Phiếu điều chỉnh |
| `CashBookService.ts` | Sổ quỹ |
| `FinanceService.ts` | Tài chính |
| `LogisticsService.ts` | Vận chuyển |
| `BillingService.ts` | Hoá đơn điện tử |
| `LoyaltyService.ts` | Loyalty point |
| `CampaignService.ts` | Chiến dịch |
| `MarketingAutomationService.ts` | Automation |
| `NotificationService.ts` | FCM, in-app |
| `EmployeeService.ts` | Nhân viên + roles |
| `AuthService.ts` | Auth fallback |
| `BpmService.ts` | BPM engine |

Tổng ~230 file — xem `ls src/services/` để duyệt.

## 5. Error handling

### 5.1. Network error

```ts
try {
  const res = await SomeService.call(payload);
  if (res.code === 0) { /* ok */ }
  else showToast(res.message || "Lỗi không xác định", "error");
} catch (err) {
  showToast("Lỗi mạng", "error");
}
```

### 5.2. 401

Interceptor xoá cookie, reload thường xảy ra ở lần request kế tiếp hoặc user F5 — `App.tsx` lúc đó không còn token → redirect về SSO (`getAppSSOLink`).

### 5.3. 403

🟡 — UI hiển thị toast "Không có quyền", không redirect.

### 5.4. 500 / timeout

Không có retry tự động. Mỗi service tự quyết định. `fetch` không có timeout mặc định — **rủi ro**: request treo nếu BE chậm. Gợi ý thêm `AbortController` + timeout 30s chuẩn.

## 6. Authentication flow

🟢 Từ `App.tsx`:

```
[1] User mở https://tenant.reborn.vn/crm/
    │
    ▼
[2] App.tsx đọc cookie.token
    ├── Không có → redirect SSO với returnUrl
    │              (https://sso.reborn.vn?returnUrl=...)
    │
    └── Có → EmployeeService.takeRoles(token)
             ├── 1 role → setIsLogin(true)
             └── >1 role → show ChooseRole modal
                           → user chọn → setSelectedRole localStorage
                           → setIsLogin(true)
    │
    ▼
[3] LayoutPage render routes
    │
    ▼
[4] Mỗi request:
    Authorization: Bearer <token>
    Selectedrole: <dept_empId>
    Hostname: <tenant>.reborn.vn
```

### Role switching

`localStorage.SelectedRole` giữ giữa các session (không bắt chọn lại mỗi lần). Header `Selectedrole` đi kèm mọi request để BE áp `permissions` tương ứng role này.

## 7. MSAL (Microsoft)

🟢 `App.tsx` tạo `PublicClientApplication(msalConfig)` và bọc `<MsalProvider>`. Dùng cho **tích hợp Microsoft 365** (Outlook email, Teams, OneDrive) — không phải auth chính. Xem [Part 09](part-09-integration.md).

## 8. Firebase FCM

🟢 `App.tsx:45-50`: `firebase-messaging-sw.js` được Vite plugin tự viết replace env var. `onMessage` listener nhận push payload → hiển thị in-app, tăng `countUnread` trong `UIContext`.

## 9. WebRTC SIP (call center)

🟢 `App.tsx` import `useSTWebRTC` từ `webrtc/useSTWebRTC.ts`, cung cấp `callState`, `incomingNumber`, `makeCall`, `answer`, `hangup`, `transfer`. Dùng `sip.js` / `jssip` phía dưới (🟡 — chưa đọc file). Call income mở modal `WebRtcCallIncomeModal` + phát `ringtone` từ `assets/sounds/call_in_sound.wav`.

## 10. Mock data

`src/mocks/` chứa các file JSON / TS mock cho dev: sản phẩm mẫu, đơn hàng, dashboard. Hữu ích khi BE chưa sẵn. Không có cơ chế auto-toggle mock/real — dev tự swap import.

## 11. Retry & rate limit

🔴 **Thấp** — không thấy retry client-side, không thấy rate limit client. Rely vào BE. Gợi ý: chuẩn hoá qua thư viện `p-retry` hoặc tự viết `fetchWithRetry`.

## Tham chiếu

- Files:
  - `src/configs/fetchConfig.ts`
  - `src/configs/urls.ts`
  - `src/services/*Service.ts` (~230 file)
  - `src/App.tsx` (auth flow)
  - `src/mocks/*`
- Diagrams: `docs/sa/diagrams/06-service-layering.png` (chưa tạo)

---
*Hết Part 06. Xem tiếp [Part 07 — Data Architecture](part-07-data-architecture.md).*
