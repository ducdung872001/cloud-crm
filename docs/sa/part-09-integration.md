# Part 09 — Integration Architecture

> Mô tả kiến trúc tích hợp với các hệ thống bên ngoài: SSO, e-invoice,
> kênh giao tiếp (Zalo/Facebook/Email/VoIP), shipping, và webhook system.

---

## 1. Executive Summary

Reborn CRM tích hợp **15+ hệ thống bên ngoài** thông qua service
**integration** (trung tâm) và các adapter chuyên biệt. Authentication
dùng SSO Reborn kết hợp Azure AD và Firebase. E-invoice qua Viettel
S-Invoice. Kênh giao tiếp đa dạng: Zalo OA, Facebook Fanpage, Email
SMTP/IMAP, VoIP/SIP. Webhook system hỗ trợ outbound event với retry
policy và signature verification.

---

## 2. Authentication — SSO Multi-provider

### 2.1. Flow tổng quan

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

| Provider      | Mục đích                    | Protocol       | Thư viện       |
|---------------|-----------------------------|----------------|----------------|
| SSO Reborn    | Login nội bộ Reborn         | OAuth 2.0      | Custom SDK     |
| Azure AD      | Enterprise SSO (khách hàng) | OIDC / MSAL    | @azure/msal    |
| Firebase Auth | Social login (Google, FB)   | Firebase SDK   | firebase/auth  |

### 2.3. Token Lifecycle

- Access token: JWT, TTL 15 phút
- Refresh token: opaque, TTL 7 ngày, rotate mỗi lần dùng
- SSO cookie: HttpOnly, Secure, SameSite=Strict

---

## 3. Viettel Ecosystem

### 3.1. S-Invoice (Hóa đơn điện tử)

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

- Mỗi invoice PAID tự động phát hóa đơn điện tử
- Retry 3 lần nếu Viettel API lỗi, sau đó chuyển manual queue

### 3.2. eTax (Thuế điện tử)

- Tạo tờ khai thuế (03/CNKD, 01/LPMB) từ dữ liệu finance service
- Xuất XML chuẩn Tổng cục Thuế
- Upload qua API eTax hoặc export file để nộp thủ công

---

## 4. Communication Channels

### 4.1. Zalo OA

| Chức năng         | API                        | Service     |
|-------------------|----------------------------|-------------|
| Gửi tin nhắn      | POST /message              | notify      |
| Nhận tin nhắn     | Webhook callback           | integration |
| Quản lý follower  | GET /followers             | customer    |
| Template message  | POST /message/template     | notify      |

### 4.2. Facebook Fanpage

- Tích hợp qua Facebook Graph API v18
- Webhook nhận comment + message -> tạo ticket trong care service
- Trả lời trực tiếp từ CRM (omnichannel inbox)

### 4.3. Email SMTP / IMAP

- Outbound: SMTP (Mailgun / SES) qua notify service
- Inbound: IMAP polling mỗi 60s -> parse email -> tạo activity/ticket
- Template engine: Mustache với merge fields từ customer data
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

- Frontend dùng **jssip** hoặc **sip.js** làm SIP UA
- WebSocket transport (WSS) cho SIP signaling
- Media: WebRTC (SRTP encrypted)
- CDR (Call Detail Record) lưu vào care service

---

## 5. Shipping Partners (Logistics)

Tích hợp qua adapter pattern:

| Partner         | Chức năng               | Protocol     |
|-----------------|-------------------------|--------------|
| GHN             | Tạo đơn, track, hủy     | REST API     |
| GHTK            | Tạo đơn, track, COD     | REST API     |
| Viettel Post    | Tạo đơn, track          | REST API     |
| J&T Express     | Tạo đơn, track          | REST API     |

Mỗi partner có 1 adapter class implement chung `ShippingProvider`
interface. Logistics service chọn adapter theo cấu hình tenant.

---

## 6. Webhook System

### 6.1. Outbound Events

Tenant có thể đăng ký webhook để nhận event từ CRM:

| Event                  | Payload              | Khi nào              |
|------------------------|----------------------|----------------------|
| customer.created       | Customer object      | Tạo khách hàng mới   |
| opportunity.won        | Opportunity + amount | Chốt deal            |
| contract.signed        | Contract + signer    | Ký hợp đồng          |
| invoice.paid           | Invoice + payment    | Nhận thanh toán      |
| ticket.created         | Ticket object        | Tạo ticket mới       |

### 6.2. Retry Policy

```
Lần 1: ngay lập tức
Lần 2: sau 1 phút
Lần 3: sau 5 phút
Lần 4: sau 30 phút
Lần 5: sau 2 giờ
--> Sau 5 lần: đánh dấu FAILED, gửi email cảnh báo admin
```

### 6.3. Signature Verification

- Mỗi webhook request có header `X-Reborn-Signature`
- Signature = HMAC-SHA256(request_body, webhook_secret)
- Receiver verify bằng secret được cung cấp khi đăng ký

---

## 7. API Gateway — fetchConfig Pattern

Frontend không hardcode URL backend. Thay vào đó:

```
1. Browser load app
2. App gọi GET /api/config (hoặc đọc từ window.__CONFIG__)
3. Nhận được map: { sales: "https://sales.api.reborn.vn", ... }
4. apiHelper rewrite URL dựa trên service prefix
```

Cho phép thay đổi URL backend mà không cần rebuild frontend.
Hostname header (`X-Tenant-Id`) được attach tự động bởi interceptor
(xem Part 06).
