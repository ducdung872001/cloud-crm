# Part 06 — Service & API Layer

> Mo ta lop service frontend, pattern goi API, co che interceptor,
> va catalog URL endpoint backend.

---

## 1. Executive Summary

Frontend giao tiep voi backend qua **240+ service file** trong `src/services/`.
Tat ca API call di qua `apiHelper.ts` — mot Axios instance duoc cau hinh
interceptor tu dong xu ly: JWT token injection, hostname-based URL rewriting,
refresh token, va error handling toan cuc. URL endpoint duoc tap trung
trong `urls.ts` de de quan ly va thay doi.

---

## 2. apiHelper Pattern

### 2.1. Cau truc

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

  // 2. Attach tenant ID tu hostname
  const tenantId = getTenantFromHostname();
  config.headers["X-Tenant-Id"] = tenantId;

  // 3. URL rewriting (xem muc 3)
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

### 2.2. Luong Request

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
Component nhan data
```

---

## 3. fetchConfig & URL Rewriting

### 3.1. URL Rewriting Logic

```typescript
// src/services/fetchConfig.ts

function rewriteUrl(url: string): string {
  // Pattern: /api/<service>/<path>
  // Rewrite thanh: <service-base-url>/<path>

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

  // Match va rewrite
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
  tenantId = "techcorp"  (phan truoc .reborn.vn)

Gui kem header:
  X-Tenant-Id: techcorp
```

---

## 4. Service File Pattern

### 4.1. Cau truc chuan

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

- Moi domain co 1 service file chinh: `<domain>Service.ts`
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

  // ... 400+ endpoint khac
};
```

---

## 6. Thong ke Service

| Microservice  | So service file FE | So endpoint | Domain                      |
|---------------|--------------------|-------------|-----------------------------|
| customer      | 25                 | 40+         | KH, lien he, doi tac        |
| sales         | 30                 | 50+         | Co hoi, bao gia, hoa don    |
| contract      | 15                 | 25+         | Hop dong, phe duyet         |
| billing       | 20                 | 35+         | Thu chi, cong no, quy       |
| inventory     | 20                 | 30+         | San pham, kho               |
| market        | 18                 | 30+         | Campaign, voucher           |
| care          | 15                 | 25+         | Ticket, bao hanh            |
| notification  | 10                 | 15+         | Push, email, SMS            |
| integration   | 12                 | 20+         | Zalo, FB, VoIP              |
| logistics     | 8                  | 12+         | Van chuyen                  |
| finance       | 10                 | 15+         | Ho so tai chinh             |
| operation     | 5                  | 8+          | TNPM specific               |
| **Tong**      | **~188**           | **305+**    |                             |

> Tong 240 file trong `src/services/` bao gom ca helper, util, va config file.

---

## 7. Error Handling

```
API Error Response (backend):
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Ma so thue khong hop le",
  "errors": [
    { "field": "taxCode", "message": "Phai co 10 hoac 13 so" }
  ]
}

Frontend xu ly:
1. Global interceptor → hien toast error (message)
2. Form-level → hien loi duoi tung field (errors[])
3. 401 → refresh token hoac redirect /login
4. 403 → redirect /403 (khong co quyen)
5. 500 → toast "Loi he thong, vui long thu lai"
6. Network error → toast "Mat ket noi mang"
```

---

*Tai lieu SA tiep theo se cover: API Gateway, Database Schema, Message Queue, v.v.*
