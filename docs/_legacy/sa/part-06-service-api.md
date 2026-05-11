# Part 06 — Service Layer & API

## Executive Summary

Tầng service gồm ~230 file `src/services/*Service.ts`, mỗi file là **class với static method** gọi API qua `fetch`. Toàn bộ request đi qua **fetch-intercept** cài ở `src/configs/fetchConfig.ts` — thêm header Authorization, Selectedrole, Hostname, rewrite URL theo prefix. Endpoint được tập trung trong `src/configs/urls.ts` (3600 dòng) với các prefix: `/api`, `/adminapi`, `/bizapi` (và các sub: `/sales`, `/inventory`, `/care`, `/billing`, `/logistics`, `/integration`, `/market`, `/notification`, `/finance` ⚠ banking only), `/bpmapi`, `/authenticator`. ⚠ Lưu ý: prefix `/warehouse` xuất hiện trong code là **legacy** — warehouse là sub-domain của `inventory`; cashbook/debt/fund/payment thuộc `billing` (không phải `sales` hay `finance`); loyalty thuộc `market` (không phải service riêng). Error 401 → xoá cookie, reload, trigger SSO flow. Mock data dưới `src/mocks/`.

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

const prefixSales        = prefixBiz + "/sales";        // POS, order, shift, invoice lifecycle
const prefixNotification = prefixBiz + "/notification"; // SMS, email, push, Zalo OA, FB
const prefixFinance      = prefixBiz + "/finance";      // ⚠ BANKING ONLY (Athena) — retail thường KHÔNG dùng
const prefixInventory    = prefixBiz + "/inventory";    // Stock + warehouse ops + PO + NCC
const prefixWarehouse    = prefixBiz + "/warehouse";    // ⚠ legacy — warehouse là sub-domain của inventory
const prefixCare         = prefixBiz + "/care";         // Ticket, warranty, feedback, CSKH
const prefixBilling      = prefixBiz + "/billing";      // cashbook, debt, fund, payment, VAT e-invoice TT78/NĐ123
const prefixLogistics    = prefixBiz + "/logistics";    // Shipping, COD, tracking
const prefixIntegration  = prefixBiz + "/integration";  // 3rd party connectors (marketplace, MSAL, payment, e-invoice, SMS/Email)
const prefixMarket       = prefixBiz + "/market";       // Campaign, voucher, promotion, LOYALTY, marketing automation

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
| `/bizapi/sales` | `APP_BIZ_URL` | sales | POS, order, shift, **invoice lifecycle (draft → confirm → cancel)** |
| `/bizapi/inventory` | `APP_BIZ_URL` | inventory | Tồn kho, stock movement, **warehouse ops, purchase order, NCC** |
| `/bizapi/warehouse` | `APP_BIZ_URL` | inventory (legacy prefix) | ⚠ Sub-domain của inventory — không phải service riêng |
| `/bizapi/care` | `APP_BIZ_URL` | care | Ticket, warranty, feedback, CSKH |
| `/bizapi/billing` | `APP_BIZ_URL` | billing | **Cashbook, debt, fund, payment, settlement**, VAT hoá đơn VN TT78/NĐ123 |
| `/bizapi/logistics` | `APP_BIZ_URL` | logistics | GHN/GHTK/VNPost, COD, tracking |
| `/bizapi/integration` | `APP_BIZ_URL` | integration | 3rd party connectors: marketplace sync, MSAL, payment, e-invoice, SMS/Email, shipping |
| `/bizapi/market` | `APP_BIZ_URL` | market | Campaign, voucher, promotion, **loyalty**, marketing automation |
| `/bizapi/notification` | `APP_BIZ_URL` | notification | Push, SMS, email, Zalo OA, FB |
| `/bizapi/finance` | `APP_BIZ_URL` | finance ⚠ banking only | Hồ sơ tài chính KH (Athena) — retail thường KHÔNG dùng, flag bug nếu xuất hiện |
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
| `WarehouseService.ts` | Kho — BE: `/bizapi/inventory` (warehouse là sub-domain) |
| `InventoryService.ts` | Tồn kho — BE: `/bizapi/inventory` |
| `ImportInvoiceService.ts` | Phiếu NK — BE: `/bizapi/inventory` |
| `TransferOrderService.ts` | Chuyển kho — BE: `/bizapi/inventory` |
| `AdjustmentSlipService.ts` | Phiếu điều chỉnh — BE: `/bizapi/inventory` |
| `CashBookService.ts` | Sổ quỹ — BE: `/bizapi/billing` (KHÔNG `/sales` hay `/finance`) |
| `DebtService.ts` | Công nợ KH + NCC — BE: `/bizapi/billing` |
| `FundService.ts` | Quỹ tiền — BE: `/bizapi/billing` |
| `FinanceService.ts` | ⚠ legacy tên — thực tế gọi `/bizapi/billing` (cashbook wrapper), KHÔNG phải banking Athena |
| `PaymentService.ts` | Thanh toán đa phương thức — BE: `/bizapi/billing` |
| `LogisticsService.ts` | Vận chuyển — BE: `/bizapi/logistics` |
| `BillingService.ts` | Hoá đơn điện tử VAT — BE: `/bizapi/billing` |
| `LoyaltyService.ts` | Loyalty: wallet, ledger, segment, reward, config — BE: `/bizapi/market/loyalty*`. Bổ sung 04/2026: `getConfig/saveConfig` (alias), `autoEarn` endpoint cho POS bên ngoài, `import` endpoint bulk import |
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
