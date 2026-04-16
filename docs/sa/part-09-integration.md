# Part 09 — Integration Architecture

> Mo ta kien truc tich hop voi cac he thong ben ngoai: SSO, e-invoice,
> kenh giao tiep (Zalo/Facebook/Email/VoIP), shipping, va webhook system.

---

## 1. Executive Summary

Reborn CRM tich hop **15+ he thong ben ngoai** thong qua service
**integration** (trung tam) va cac adapter chuyen biet. Authentication
dung SSO Reborn ket hop Azure AD va Firebase. E-invoice qua Viettel
S-Invoice. Kenh giao tiep da dang: Zalo OA, Facebook Fanpage, Email
SMTP/IMAP, VoIP/SIP. Webhook system ho tro outbound event voi retry
policy va signature verification.

---

## 2. Authentication — SSO Multi-provider

### 2.1. Flow tong quan

```
+----------+     +------------+     +-------------+     +-----------+
|  Browser |     | React SPA  |     | SSO Reborn  |     |  Backend  |
+----+-----+     +-----+------+     +------+------+     +-----+-----+
     |                  |                   |                   |
     | 1. Login click   |                   |                   |
     +----------------->|                   |                   |
     |                  | 2. Redirect SSO   |                   |
     |                  +------------------>|                   |
     |                  |                   | 3. User login     |
     |                  |                   |    (or Azure AD)  |
     |                  |                   |                   |
     |                  | 4. SSO cookie +   |                   |
     |                  |    auth code      |                   |
     |                  |<------------------+                   |
     |                  |                   |                   |
     |                  | 5. Exchange code  |                   |
     |                  |   for JWT token   +------------------>|
     |                  |                   |                   |
     |                  | 6. JWT token      |                   |
     |                  |<------------------------------------------+
     |                  |                   |                   |
```

### 2.2. Provider Matrix

| Provider      | Muc dich                    | Protocol       | Thu vien       |
|---------------|-----------------------------|----------------|----------------|
| SSO Reborn    | Login noi bo Reborn         | OAuth 2.0      | Custom SDK     |
| Azure AD      | Enterprise SSO (khach hang) | OIDC / MSAL    | @azure/msal    |
| Firebase Auth | Social login (Google, FB)   | Firebase SDK   | firebase/auth  |

### 2.3. Token Lifecycle

- Access token: JWT, TTL 15 phut
- Refresh token: opaque, TTL 7 ngay, rotate moi lan dung
- SSO cookie: HttpOnly, Secure, SameSite=Strict

---

## 3. Viettel Ecosystem

### 3.1. S-Invoice (Hoa don dien tu)

```
+-----------+     +-------------+     +---------------+
| billing   |     | integration |     | Viettel       |
| service   |     | service     |     | S-Invoice API |
+-----+-----+     +------+------+     +-------+-------+
      |                  |                     |
      | 1. invoice.created                     |
      +----------------->|                     |
      |                  | 2. Map to S-Invoice |
      |                  |    XML format       |
      |                  |                     |
      |                  | 3. POST /invoice    |
      |                  +-------------------->|
      |                  |                     |
      |                  | 4. Invoice number + |
      |                  |    PDF link         |
      |                  |<--------------------+
      |                  |                     |
      | 5. Update inv    |                     |
      |    with e-inv #  |                     |
      |<-----------------+                     |
```

- Moi invoice PAID tu dong phat hoa don dien tu
- Retry 3 lan neu Viettel API loi, sau do chuyen manual queue

### 3.2. eTax (Thue dien tu)

- Tao to khai thue (03/CNKD, 01/LPMB) tu du lieu finance service
- Xuat XML chuan Tong cuc Thue
- Upload qua API eTax hoac export file de nop thu cong

---

## 4. Communication Channels

### 4.1. Zalo OA

| Chuc nang         | API                        | Service     |
|-------------------|----------------------------|-------------|
| Gui tin nhan      | POST /message              | notify      |
| Nhan tin nhan     | Webhook callback           | integration |
| Quan ly follower  | GET /followers             | customer    |
| Template message  | POST /message/template     | notify      |

### 4.2. Facebook Fanpage

- Tich hop qua Facebook Graph API v18
- Webhook nhan comment + message -> tao ticket trong care service
- Tra loi truc tiep tu CRM (omnichannel inbox)

### 4.3. Email SMTP / IMAP

- Outbound: SMTP (Mailgun / SES) qua notify service
- Inbound: IMAP polling moi 60s -> parse email -> tao activity/ticket
- Template engine: Mustache voi merge fields tu customer data
- Tracking: pixel 1x1 cho open rate, redirect link cho click rate

### 4.4. VoIP / SIP

```
+----------+     +----------+     +-------------+     +----------+
| Browser  |     | React    |     | SIP Server  |     | PSTN     |
| (WebRTC) |     | (jssip)  |     | (Asterisk)  |     | Gateway  |
+----+-----+     +----+-----+     +------+------+     +----+-----+
     |                |                   |                  |
     | 1. Click call  |                   |                  |
     +--------------->|                   |                  |
     |                | 2. REGISTER       |                  |
     |                +------------------>|                  |
     |                | 3. INVITE         |                  |
     |                +------------------>|                  |
     |                |                   | 4. Route to PSTN |
     |                |                   +----------------->|
     |                |                   |                  |
     |                | 5. 200 OK (SDP)   |                  |
     |                |<------------------+                  |
     |                |                   |                  |
     | 6. RTP media   |                   |                  |
     |<===============|==================>|<================>|
     |                |                   |                  |
```

- Frontend dung **jssip** hoac **sip.js** lam SIP UA
- WebSocket transport (WSS) cho SIP signaling
- Media: WebRTC (SRTP encrypted)
- CDR (Call Detail Record) luu vao care service

---

## 5. Shipping Partners (Logistics)

Tich hop qua adapter pattern:

| Partner         | Chuc nang               | Protocol     |
|-----------------|-------------------------|--------------|
| GHN             | Tao don, track, huy     | REST API     |
| GHTK            | Tao don, track, COD     | REST API     |
| Viettel Post    | Tao don, track          | REST API     |
| J&T Express     | Tao don, track          | REST API     |

Moi partner co 1 adapter class implement chung `ShippingProvider`
interface. Logistics service chon adapter theo cau hinh tenant.

---

## 6. Webhook System

### 6.1. Outbound Events

Tenant co the dang ky webhook de nhan event tu CRM:

| Event                  | Payload              | Khi nao              |
|------------------------|----------------------|----------------------|
| customer.created       | Customer object      | Tao khach hang moi   |
| opportunity.won        | Opportunity + amount | Chot deal            |
| contract.signed        | Contract + signer    | Ky hop dong          |
| invoice.paid           | Invoice + payment    | Nhan thanh toan      |
| ticket.created         | Ticket object        | Tao ticket moi       |

### 6.2. Retry Policy

```
Lan 1: ngay lap tuc
Lan 2: sau 1 phut
Lan 3: sau 5 phut
Lan 4: sau 30 phut
Lan 5: sau 2 gio
--> Sau 5 lan: danh dau FAILED, gui email canh bao admin
```

### 6.3. Signature Verification

- Moi webhook request co header `X-Reborn-Signature`
- Signature = HMAC-SHA256(request_body, webhook_secret)
- Receiver verify bang secret duoc cung cap khi dang ky

---

## 7. API Gateway — fetchConfig Pattern

Frontend khong hardcode URL backend. Thay vao do:

```
1. Browser load app
2. App goi GET /api/config (hoac doc tu window.__CONFIG__)
3. Nhan duoc map: { sales: "https://sales.api.reborn.vn", ... }
4. apiHelper rewrite URL dua tren service prefix
```

Cho phep thay doi URL backend ma khong can rebuild frontend.
Hostname header (`X-Tenant-Id`) duoc attach tu dong boi interceptor
(xem Part 06).
