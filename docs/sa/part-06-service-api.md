# Part 06 — Service & API Layer

> Mô tả lớp service frontend, pattern gọi API, cơ chế interceptor,
> và catalog URL endpoint backend.

---

## 1. Executive Summary

Frontend giao tiếp với backend qua **240+ service file** trong `src/services/`.
Tất cả API call đi qua `apiHelper.ts` — một Axios instance được cấu hình
interceptor tự động xử lý: JWT token injection, hostname-based URL rewriting,
refresh token, và error handling toàn cục. URL endpoint được tập trung
trong `urls.ts` để dễ quản lý và thay đổi.

---

## 2. apiHelper Pattern

### 2.1. Cấu trúc

```typescript
// src/services/apiHelper.ts

import axios from "axios";

const apiHelper = axios.create({
  baseURL: process.env.VITE_API_URL,    // https://api.reborn.vn
  timeout: 30000,                        // 30s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiHelper.interceptors.request.use((config) => {
  // 1. Attach JWT token
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 2. Attach tenant ID từ hostname
  const tenantId = getTenantFromHostname();
  config.headers["X-Tenant-Id"] = tenantId;

  // 3. URL rewriting (xem mục 3)
  config.url = rewriteUrl(config.url);

  return config;
});

// Response interceptor
apiHelper.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token
      await refreshToken();
      return apiHelper.request(error.config);
    }
    if (error.response?.status === 403) {
      // Redirect to /403
      redirectToForbidden();
    }
    return Promise.reject(error);
  }
);
```

### 2.2. Luồng Request

```
Component
  |
  v
Service function (contractService.getList)
  |
  v
apiHelper.get(urls.CONTRACT_LIST, { params })
  |
  v
Request Interceptor
  ├── Attach JWT token
  ├── Attach X-Tenant-Id
  └── Rewrite URL
  |
  v
Axios → HTTPS → API Gateway → Microservice
  |
  v
Response Interceptor
  ├── 200: return response.data
  ├── 401: refresh token → retry
  ├── 403: redirect /403
  └── 500: toast error message
  |
  v
Component nhận data
```

---

## 3. fetchConfig & URL Rewriting

### 3.1. URL Rewriting Logic

```typescript
// src/services/fetchConfig.ts

function rewriteUrl(url: string): string {
  // Pattern: /api/<service>/<path>
  // Rewrite thành: <service-base-url>/<path>

  const serviceMap = {
    "/api/customer":     "https://customer.api.reborn.vn",
    "/api/sales":        "https://sales.api.reborn.vn",
    "/api/contract":     "https://contract.api.reborn.vn",
    "/api/billing":      "https://billing.api.reborn.vn",
    "/api/inventory":    "https://inventory.api.reborn.vn",
    "/api/market":       "https://market.api.reborn.vn",
    "/api/care":         "https://care.api.reborn.vn",
    "/api/notification": "https://notification.api.reborn.vn",
    "/api/integration":  "https://integration.api.reborn.vn",
    "/api/logistics":    "https://logistics.api.reborn.vn",
    "/api/finance":      "https://finance.api.reborn.vn",
    "/api/operation":    "https://operation.api.reborn.vn",
  };

  // Match và rewrite
  for (const [prefix, baseUrl] of Object.entries(serviceMap)) {
    if (url.startsWith(prefix)) {
      return url.replace(prefix, baseUrl);
    }
  }
  return url;
}
```

### 3.2. Hostname Extraction

```
URL: https://techcorp.reborn.vn/crm/...

Extract:
  hostname = "techcorp.reborn.vn"
  tenantId = "techcorp"  (phần trước .reborn.vn)

Gửi kèm header:
  X-Tenant-Id: techcorp
```

---

## 4. Service File Pattern

### 4.1. Cấu trúc chuẩn

```typescript
// src/services/contractService.ts

import apiHelper from "./apiHelper";
import urls from "../configs/urls";
import { IContract, IContractFilter } from "../types/contract";

export const contractService = {
  getList: (params: IContractFilter) =>
    apiHelper.get(urls.CONTRACT_LIST, { params }),

  getById: (id: string) =>
    apiHelper.get(urls.CONTRACT_DETAIL.replace(":id", id)),

  create: (data: Partial<IContract>) =>
    apiHelper.post(urls.CONTRACT_CREATE, data),

  update: (id: string, data: Partial<IContract>) =>
    apiHelper.put(urls.CONTRACT_UPDATE.replace(":id", id), data),

  delete: (id: string) =>
    apiHelper.delete(urls.CONTRACT_DELETE.replace(":id", id)),

  approve: (id: string, data: { status: string; note: string }) =>
    apiHelper.post(urls.CONTRACT_APPROVE.replace(":id", id), data),

  exportExcel: (params: IContractFilter) =>
    apiHelper.get(urls.CONTRACT_EXPORT, { params, responseType: "blob" }),
};
```

### 4.2. Convention

- Mỗi domain có 1 service file chính: `<domain>Service.ts`
- CRUD: `getList`, `getById`, `create`, `update`, `delete`
- Action: `approve`, `reject`, `close`, `reopen`, `export`
- Return type: `Promise<ApiResponse<T>>`

---

## 5. URL Catalog (urls.ts)

```typescript
// src/configs/urls.ts — ~500+ endpoint

const urls = {
  // === Customer ===
  CUSTOMER_LIST:        "/api/customer/list",
  CUSTOMER_DETAIL:      "/api/customer/:id",
  CUSTOMER_CREATE:      "/api/customer/create",
  CUSTOMER_UPDATE:      "/api/customer/:id/update",
  CUSTOMER_DELETE:      "/api/customer/:id/delete",

  // === Contact ===
  CONTACT_LIST:         "/api/customer/contact/list",
  CONTACT_DETAIL:       "/api/customer/contact/:id",

  // === Opportunity ===
  OPPORTUNITY_LIST:     "/api/sales/opportunity/list",
  OPPORTUNITY_KANBAN:   "/api/sales/opportunity/kanban",

  // === Contract ===
  CONTRACT_LIST:        "/api/contract/list",
  CONTRACT_DETAIL:      "/api/contract/:id",
  CONTRACT_CREATE:      "/api/contract/create",
  CONTRACT_APPROVE:     "/api/contract/:id/approve",

  // === Invoice ===
  INVOICE_LIST:         "/api/sales/invoice/list",
  INVOICE_CREATE:       "/api/sales/invoice/create",

  // === Ticket ===
  TICKET_LIST:          "/api/care/ticket/list",
  TICKET_CREATE:        "/api/care/ticket/create",

  // === CashBook ===
  CASHBOOK_LIST:        "/api/billing/cashbook/list",
  CASHBOOK_CREATE:      "/api/billing/cashbook/create",

  // === Debt ===
  DEBT_LIST:            "/api/billing/debt/list",
  DEBT_AGING:           "/api/billing/debt/aging-report",

  // ... 400+ endpoint khác
};
```

---

## 6. Thống kê Service

| Microservice  | Số service file FE | Số endpoint | Domain                      |
|---------------|--------------------|-------------|-----------------------------|
| customer      | 25                 | 40+         | KH, liên hệ, đối tác        |
| sales         | 30                 | 50+         | Cơ hội, báo giá, hóa đơn    |
| contract      | 15                 | 25+         | Hợp đồng, phê duyệt         |
| billing       | 20                 | 35+         | Thu chi, công nợ, quỹ       |
| inventory     | 20                 | 30+         | Sản phẩm, kho               |
| market        | 18                 | 30+         | Campaign, voucher           |
| care          | 15                 | 25+         | Ticket, bảo hành            |
| notification  | 10                 | 15+         | Push, email, SMS            |
| integration   | 12                 | 20+         | Zalo, FB, VoIP              |
| logistics     | 8                  | 12+         | Vận chuyển                  |
| finance       | 10                 | 15+         | Hồ sơ tài chính             |
| operation     | 5                  | 8+          | TNPM specific               |
| **Tổng**      | **~188**           | **305+**    |                             |

> Tổng 240 file trong `src/services/` bao gồm cả helper, util, và config file.

---

## 7. Error Handling

```
API Error Response (backend):
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Mã số thuế không hợp lệ",
  "errors": [
    { "field": "taxCode", "message": "Phải có 10 hoặc 13 số" }
  ]
}

Frontend xử lý:
1. Global interceptor → hiện toast error (message)
2. Form-level → hiện lỗi dưới từng field (errors[])
3. 401 → refresh token hoặc redirect /login
4. 403 → redirect /403 (không có quyền)
5. 500 → toast "Lỗi hệ thống, vui lòng thử lại"
6. Network error → toast "Mất kết nối mạng"
```

---

*Tài liệu SA tiếp theo sẽ cover: API Gateway, Database Schema, Message Queue, v.v.*
