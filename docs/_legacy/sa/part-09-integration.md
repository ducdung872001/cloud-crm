# Part 09 — Integration với hệ thống thứ 3

> **Executive Summary**: Reborn Retail CRM kết nối với tối thiểu **11 nhóm hệ thống ngoại** — SSO, cổng thanh toán, hoá đơn điện tử, SMS, email, Zalo OA, Facebook, đơn vị vận chuyển, sàn marketplace, Firebase FCM, Microsoft 365. Hầu hết tích hợp **đi qua BE** (frontend chỉ gọi service nội bộ), trừ SSO (redirect), Firebase FCM (browser SDK), và MSAL (Microsoft — nếu còn dùng). Part này liệt kê contract quan sát được từ FE + best-practice cho BE adapter.

## 1. SSO — Reborn Authenticator

🟢 **Cao** — xác nhận từ `App.tsx` và `utils/navigate.ts`.

### Flow

```
[Browser]               [SPA crm.reborn.vn]       [SSO reborn.vn]
   │                          │                          │
   │  GET /crm/               │                          │
   ├────────────────────────► │                          │
   │                          │ check cookie.token      │
   │                          │ (no token)              │
   │                          │                          │
   │  302 redirect            │                          │
   │ ◄──────────────────────  │                          │
   │                          │                          │
   │  GET sso.reborn.vn/login?returnUrl=...              │
   ├─────────────────────────────────────────────────► │
   │                          │                          │
   │  form login → POST       │                          │
   ├─────────────────────────────────────────────────► │
   │                          │                          │
   │  Set-Cookie: token=...; domain=.reborn.vn           │
   │  302 returnUrl          │                          │
   │ ◄───────────────────────────────────────────────  │
   │                          │                          │
   │  GET /crm/              │                          │
   ├────────────────────────► │                          │
   │                          │ cookie.token OK         │
   │                          │ takeRoles()             │
   │                          │                          │
```

Cookie `token` và `user` được set **ở domain gốc** `.reborn.vn` nên mọi subdomain đều đọc được. SPA không cần xử lý OAuth callback — chỉ đọc cookie.

### Contract

- **Redirect**: `getAppSSOLink(returnUrl)` tạo URL có dạng `https://reborn.vn/login?returnUrl=<encoded>`.
- **Logout**: gọi `https://reborn.vn/logout` + xoá cookie local.
- **Token refresh**: 🔴 chưa rõ — nếu JWT có expiry, cần silent refresh.

## 2. Payment providers

🟡 **Trung bình** — suy luận từ tên service + common integration pattern VN.

| Provider | Loại | Flow FE quan sát |
|----------|------|------------------|
| **VNPay** | Cổng QR + thẻ | Redirect pattern |
| **Momo** | Ví điện tử | Redirect + callback |
| **ZaloPay** | Ví điện tử | Redirect + callback |
| **OnePay** | Cổng thẻ | Redirect |

### Pattern redirect chung

```
1. User bấm "Thanh toán qua VNPay" trên POS.
2. FE gọi POST /bizapi/sales/payment/create-vnpay { orderId, amount }.
3. BE gọi VNPay API → nhận paymentUrl.
4. BE trả về paymentUrl cho FE.
5. FE window.open(paymentUrl) → user nhập OTP → VNPay callback BE.
6. BE nhận callback, verify signature, update order.status = paid.
7. BE push FCM/websocket cho FE để refresh trạng thái.
```

**Idempotency key**: `orderId + attemptNo` để tránh double-charge khi retry.

## 3. E-invoice (hoá đơn điện tử VAT)

🟡 `BillingService` — gọi qua BE, FE không trực tiếp làm SOAP.

| Provider | Giao thức | Ghi chú |
|----------|-----------|---------|
| **VNPT Invoice** | SOAP + cert | TT78/TT32, phổ biến nhất VN |
| **M-Invoice** | REST | Viettel |
| **MISA MeInvoice** | REST | MISA |
| **FPT/EASYINVOICE** | REST | FPT |

### Flow

```
[POS]                [BE billing]             [VNPT Invoice]
  │                       │                           │
  │ POST /bizapi/billing/issue  { invoiceData }      │
  ├─────────────────────► │                           │
  │                       │ SOAP call (cert auth)    │
  │                       ├─────────────────────────► │
  │                       │                           │
  │                       │   invoiceNo + lookupCode │
  │                       │ ◄─────────────────────── │
  │                       │                           │
  │  { invoiceNo, url }  │                           │
  │ ◄─────────────────── │                           │
```

### Cert-based auth

BE giữ private cert trong vault / Kubernetes secret. FE không bao giờ đụng tới. Lookup code có thể in mã QR trên hoá đơn.

## 4. SMS gateway

🟡 Từ `NotificationService`.

| Provider | Brandname | API |
|----------|-----------|-----|
| **eSMS** | VI, có brandname | REST |
| **VietGuys** | Brandname | REST |
| **FPT SMS** | Brandname | REST |

### Contract chung

```
POST https://rest.esms.vn/MainService.svc/xml/SendMultipleMessage_V4_post_json
{
  "ApiKey": "...",
  "SecretKey": "...",
  "Phone": "0901234567",
  "Content": "Đơn hàng #123 đã xác nhận",
  "Brandname": "REBORN",
  "SmsType": "2"
}
```

Rate limit: ~10 msg/s per account. Cần queue ở BE nếu gửi bulk campaign.

## 5. Email

🟡 `EmailService` / `NotificationService`.

- **SMTP** (server nội bộ / Google Workspace) — cho transactional.
- **SendGrid / Mailgun / Amazon SES** — cho marketing bulk (🔴 chưa xác nhận).

### Pattern

- Template stored ở BE (DB) hoặc file template engine (Freemarker / Handlebars).
- Tracking: pixel + link rewriter → ghi vào `email_event` bảng.

## 6. Zalo OA

🟡 Zalo Official Account — gửi Zalo Notification Service (ZNS).

- **OAuth**: admin connect OA → BE lưu access_token, auto-refresh bằng refresh_token (7 ngày).
- **Template message**: phải đăng ký template trước qua Zalo Business.
- **Endpoint**: `https://business.openapi.zalo.me/message/template`.
- Phí: ~200-400 VND/msg.

## 7. Facebook

🟡 Facebook Page Messaging + Lead Ads.

- **Page messaging**: qua webhook Messenger → xử lý ở `/bizapi/care`.
- **Lead form**: webhook Facebook Leads → auto-create `Contact` / `Lead`.
- OAuth: page owner grant `pages_messaging`, `leads_retrieval`.

## 8. Shipping providers

🟢 `LogisticsService` — xác nhận từ service file.

| Provider | Tính năng | Pattern |
|----------|-----------|---------|
| **GHN** | Tạo đơn, tracking, COD | REST + webhook |
| **GHTK** | Tạo đơn, tracking | REST + webhook |
| **VNPost EMS** | Tạo đơn | REST |
| **J&T Express** | Tạo đơn | REST |
| **BEST, NinjaVan** | Optional | REST |

### Flow

```
1. POS tạo đơn → chọn đơn vị VC → FE POST /bizapi/logistics/create-shipment.
2. BE gọi GHN API → nhận trackingCode, label URL.
3. BE lưu shipment, trả label URL cho FE in.
4. GHN webhook đẩy status (đã lấy hàng, đang giao, hoàn tất) → /bizapi/logistics/webhook/ghn.
5. BE verify signature, update shipment.status + trigger notification cho KH.
```

### Tracking webhook contract

Mỗi provider khác format, BE cần **adapter pattern**:

```
interface ShippingAdapter {
  createShipment(order: Order): Promise<Shipment>;
  cancelShipment(shipmentId: string): Promise<void>;
  parseWebhook(body: unknown): ShipmentEvent;
}
```

## 9. Marketplace

🟡 `MarketplaceService`, `IntegrationService`.

| Sàn | Tính năng FE |
|-----|--------------|
| **Shopee** | Product sync, order pull, stock push |
| **Lazada** | Giống Shopee |
| **Tiki** | Giống |
| **TikTok Shop** | Mới, live commerce |

### Product sync

```
[CRM]                      [BE integration]              [Shopee]
  │                              │                          │
  │ mapping SKU → Shopee item   │                          │
  │                              │                          │
  │ POST /bizapi/integration/marketplace/sync               │
  ├────────────────────────────► │                          │
  │                              │ Shopee API call         │
  │                              ├────────────────────────► │
  │                              │                          │
```

### Order pull

🟡 BE cron pull mỗi vài phút (🔴 interval chưa xác nhận) hoặc Shopee push webhook → `/bizapi/integration/shopee/webhook`.

## 10. Firebase Cloud Messaging (FCM)

🟢 **Cao** — `App.tsx:45-50` + `firebase-messaging-sw.js`.

### Flow

```
1. FE lấy FCM token: getToken(messaging, { vapidKey }).
2. FE POST /bizapi/notification/register-device { token, userId, roleId }.
3. BE lưu mapping user → device token.
4. BE muốn push: POST https://fcm.googleapis.com/fcm/send với server key.
5. Browser nhận payload → service worker + onMessage listener.
6. UIContext.countUnread++.
```

### VAPID key

Khoá public embed trong FE, private ở BE. Rotate định kỳ.

## 11. Microsoft MSAL

🟢 `App.tsx` import `MsalProvider`, `PublicClientApplication`. Config ở `src/configs/authConfig.ts`.

**Mục đích**: tích hợp Microsoft 365 — gửi email qua Outlook, đồng bộ calendar, OneDrive upload — **không phải auth chính**.

⚠️ **Rủi ro**: nếu không còn dùng thì nên gỡ để giảm bundle size (MSAL ~150KB gzipped).

**Đề xuất**: kiểm tra có component nào còn gọi `useMsal()` không; nếu không → remove.

## 12. Outbound webhook (Reborn → khách)

🔴 **Thấp** — gợi ý best practice nếu BE cung cấp:

### Event suggestion

| Event | Payload |
|-------|---------|
| `order.created` | `{ orderId, customerId, total, items }` |
| `order.paid` | `{ orderId, paymentMethod, paidAt }` |
| `shipment.updated` | `{ shipmentId, status, location }` |
| `customer.created` | `{ customerId, phone, email }` |
| `invoice.issued` | `{ invoiceId, invoiceNo, url }` |

### HMAC signature

```
X-Reborn-Signature: sha256=<hex>
X-Reborn-Timestamp: 1700000000
X-Reborn-Event: order.created

hmac = HMAC-SHA256(secret, timestamp + "." + rawBody)
```

Khách verify: so `X-Reborn-Signature` == compute lại. Reject nếu `timestamp` lệch quá 5 phút.

## 13. Idempotency, Retry, DLQ

### Idempotency

- FE gửi `Idempotency-Key: <uuid>` header cho các POST tạo mới.
- BE lưu key + response 24h — trả lại cùng response nếu lặp.

### Retry

- Outbound webhook: exponential backoff (1s → 2s → 4s → 8s → 16s → 32s → 1min → 5min → 30min → 2h), tối đa 10 lần.
- SMS/ZNS: retry 3 lần nếu timeout.

### Dead letter queue

- Sau khi retry hết → push vào `dlq.<service>` topic, alert team ops.
- Có UI quản lý DLQ để manual re-process.

## 14. Tóm tắt trách nhiệm

| Tích hợp | FE trực tiếp | BE adapter |
|----------|--------------|------------|
| SSO | Redirect | Không |
| Payment | Open popup | Có |
| E-invoice | Không | Có |
| SMS | Không | Có |
| Email | Không | Có |
| Zalo OA | Không | Có |
| Facebook | Không | Có |
| Shipping | Không | Có |
| Marketplace | Không | Có |
| FCM | SDK browser | Server key |
| MSAL | SDK browser | Không (?) |

## Tham chiếu

- Files:
  - `src/configs/authConfig.ts`
  - `src/App.tsx`
  - `src/services/LogisticsService.ts`
  - `src/services/BillingService.ts`
  - `src/services/NotificationService.ts`
  - `src/services/MarketplaceService.ts`
- [Part 08 — Backend](part-08-backend-architecture.md)
- [Part 10 — Security](part-10-security.md)
- [ADR-06](part-13-adr.md#adr-06) SSO centralized

---
*Hết Part 09. Xem tiếp [Part 10 — Security](part-10-security.md).*
