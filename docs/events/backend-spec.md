# Backend Spec — Event Management Module

**Mục đích**: Tài liệu này mô tả chi tiết API, schema, và integration contract cho Backend để hiện thực hoá phân hệ **Quản lý Sự kiện (Events)** mà Frontend prototype đã build trong nhánh `community-hub`.

**Đối tượng đọc**: Backend team (Claude Code CLI hoặc dev BE) — dùng file này làm briefing đủ-để-implement mà không cần xem code FE.

**Ngày tạo**: 2026-04-15
**Phiên bản FE tham chiếu**: `src/pages/CommunityHub/Events/` + `src/pages/ShareEventPage/` (community-hub branch)

---

## 🎯 Tóm tắt nghiệp vụ

Phễu bán của Community Hub:

```
Public (anon) → đăng ký event → lead trong Marketing
                                        ↓
                            Admin confirm + issue vé
                                        ↓
                            ┌───────────┴───────────┐
                            ↓                       ↓
                      Vé miễn phí             Vé có giá
                   (QR code + check-in)       (Tạo Order → Sales)
                            ↓                       ↓
                            └───────┬───────────────┘
                                    ↓
                          Convert → Customer (Member)
                                    ↓
                          Bán thêm dịch vụ / gói
                              (Sales service)
```

**Key insight**: Registration = **lead** (chưa phải customer). Chỉ khi "convert" mới trở thành customer trong `CustomerService`.

---

## 🏗️ Phân chia service (IMPORTANT — đọc kỹ)

| Domain | Service | Rationale |
|---|---|---|
| **Event CRUD** (event, registration, free ticket) | **Marketing / Community service** | Event là công cụ marketing funnel top. Mọi thao tác với lead (pending/confirmed/checked_in) nằm ở đây. |
| **Paid ticket → Order** | **Sales service** (hiện có) | Khi event có giá vé, tạo `sale_order` trong Sales service, link `registration_id`. Dùng flow thanh toán có sẵn. |
| **Convert to member** | **Customer service** (hiện có) | Gọi `CustomerService.addOther()` để tạo customer record. Cập nhật `registration.converted_to_customer_id`. |
| **Sell membership / service sau event** | **Sales service** | Re-use flow bán dịch vụ hiện có, dùng `customer_id` vừa convert. |

### Quy tắc ranh giới
- Marketing service **KHÔNG** được tạo customer trực tiếp — phải gọi Customer service
- Sales service **KHÔNG** quản lý registration — chỉ tạo order khi được Marketing gọi
- Registration luôn là **1 bản ghi duy nhất** ở Marketing, các service khác link tới qua `registration_id`

### Outbox / event bus (khuyến nghị)
Khi registration thay đổi trạng thái, publish domain event để các service khác react:

- `event.registration.created` → (Marketing → Analytics/CRM tracking)
- `event.registration.confirmed` → (Marketing → Notification: gửi email/SMS vé)
- `event.registration.converted_to_member` → (Marketing → CRM/Loyalty: tặng điểm welcome)

Nếu chưa có event bus, dùng direct HTTP calls tạm thời.

---

## 📦 Database schema

### Table: `marketing_events`

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | BIGINT PK | auto-increment | |
| `tenant_id` | BIGINT | NOT NULL, indexed | multi-tenant isolation |
| `slug` | VARCHAR(80) | UNIQUE per tenant | URL-safe, dùng cho public share link |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NOT NULL | plain text, dùng cho SEO + preview |
| `content_html` | MEDIUMTEXT | | HTML từ RebornEditor |
| `cover_image_url` | VARCHAR(500) | | S3/CDN URL |
| `start_date` | DATETIME | NOT NULL | |
| `end_date` | DATETIME | NOT NULL | |
| `registration_open_date` | DATETIME | NOT NULL | |
| `registration_close_date` | DATETIME | NOT NULL | |
| `venue_name` | VARCHAR(255) | | NULL nếu online |
| `venue_address` | VARCHAR(500) | | |
| `venue_city` | VARCHAR(100) | | |
| `venue_map_url` | VARCHAR(500) | | Google Maps |
| `venue_is_online` | BOOLEAN | default false | |
| `venue_online_url` | VARCHAR(500) | | Zoom/Meet link |
| `contact_name` | VARCHAR(255) | NOT NULL | |
| `contact_phone` | VARCHAR(30) | NOT NULL | |
| `contact_email` | VARCHAR(255) | | |
| `contact_role` | VARCHAR(100) | | |
| `max_attendees` | INT | NULL = không giới hạn | |
| `ticket_price` | DECIMAL(12,0) | default 0 | VND, 0 = miễn phí |
| `status` | ENUM | `draft`, `published`, `ongoing`, `ended`, `cancelled` | **ongoing** và **ended** nên compute tại query time dựa trên thời gian hiện tại, không cần persist |
| `published_at` | DATETIME | | |
| `category` | VARCHAR(50) | | workshop, hội thảo, lớp học, networking, training, khác |
| `tags` | JSON | | array of strings |
| `created_by` | BIGINT FK → users | | |
| `created_at` | DATETIME | NOT NULL | |
| `updated_at` | DATETIME | NOT NULL | |
| `deleted_at` | DATETIME | NULL | soft delete |

**Indexes**:
- `(tenant_id, status, start_date)` — list events
- `(tenant_id, slug)` UNIQUE — public lookup
- `(tenant_id, created_at DESC)` — default sort

---

### Table: `marketing_event_registrations`

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | BIGINT PK | | |
| `tenant_id` | BIGINT | NOT NULL, indexed | |
| `event_id` | BIGINT FK → marketing_events | NOT NULL | |
| `event_slug` | VARCHAR(80) | | denormalized cho query nhanh |
| `full_name` | VARCHAR(255) | NOT NULL | |
| `phone` | VARCHAR(30) | NOT NULL | |
| `email` | VARCHAR(255) | | |
| `company` | VARCHAR(255) | | |
| `note` | TEXT | | |
| `status` | ENUM | `pending`, `confirmed`, `checked_in`, `cancelled`, `no_show` | default `pending` |
| `ticket_code` | VARCHAR(50) | UNIQUE nullable | sinh khi confirm |
| `ticket_qr_url` | VARCHAR(500) | | QR code image URL |
| `order_id` | BIGINT FK → sale_orders | NULL | **LINK SANG SALES** — chỉ có khi paid ticket |
| `converted_to_customer_id` | BIGINT FK → customers | NULL | **LINK SANG CUSTOMER** — khi đã convert |
| `converted_at` | DATETIME | | |
| `confirmed_at` | DATETIME | | |
| `checked_in_at` | DATETIME | | |
| `source` | ENUM | `public_portal`, `manual`, `import`, `api` | |
| `utm_source` | VARCHAR(100) | | |
| `utm_campaign` | VARCHAR(100) | | |
| `utm_medium` | VARCHAR(100) | | |
| `created_at` | DATETIME | NOT NULL | aka `registered_at` |
| `updated_at` | DATETIME | NOT NULL | |
| `deleted_at` | DATETIME | NULL | |

**Indexes**:
- `(tenant_id, event_id, status)` — list registrants of an event
- `(tenant_id, phone)` — dedupe check + customer lookup
- `(ticket_code)` UNIQUE — QR check-in scan
- `(order_id)` — sync từ Sales
- `(converted_to_customer_id)` — sync từ Customer

**Dedupe rule**: Nếu cùng event + cùng phone đăng ký 2 lần → **reject** với lỗi 409, không ghi đè. UI public hiển thị "Bạn đã đăng ký rồi" và cho xem ticket code.

---

## 🔌 API Endpoints

Prefix: `/marketing/events` (hoặc tuỳ BE quyết định, FE sẽ config URL base).

### 🔓 Public endpoints (KHÔNG cần auth)

#### `GET /marketing/events/public/:slug`

**Purpose**: Lấy thông tin event để hiển thị trang public (`/share_event?slug=xxx`).

**Response 200**:
```json
{
  "id": 123,
  "slug": "workshop-yoga-abcd",
  "title": "Workshop Yoga cho người mới bắt đầu",
  "description": "Buổi hướng dẫn 3 giờ...",
  "contentHtml": "<h2>Nội dung</h2>...",
  "coverImageUrl": "https://cdn.../cover.jpg",
  "startDate": "2026-04-29T08:00:00Z",
  "endDate": "2026-04-29T11:00:00Z",
  "registrationOpenDate": "2026-04-12T00:00:00Z",
  "registrationCloseDate": "2026-04-28T23:00:00Z",
  "venue": {
    "name": "Home FitPro Thảo Điền",
    "address": "12 Thảo Điền, Q.2",
    "city": "TP.HCM",
    "isOnline": false,
    "onlineUrl": null
  },
  "contactPerson": {
    "name": "Nguyễn Thu Hà",
    "phone": "0971234567",
    "email": "ha@reborn.vn",
    "role": "HLV trưởng"
  },
  "maxAttendees": 30,
  "currentAttendees": 12,
  "ticketPrice": 150000,
  "category": "workshop",
  "tags": ["yoga", "beginner"],
  "status": "published"
}
```

**Response 404**: Không tìm thấy slug hoặc event có status = `draft`/`cancelled`/`ended`.

**Quan trọng**:
- CHỈ trả về event có status `published` hoặc `ongoing`
- `currentAttendees` = count(registrations) where status != 'cancelled'
- **Không được** trả về thông tin PII của registrants, `created_by`, internal metadata

---

#### `POST /marketing/events/public/:slug/register`

**Purpose**: Nhận đăng ký công khai từ portal.

**Request body**:
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321",
  "email": "a@example.com",
  "company": "ABC Co.",
  "note": "Câu hỏi về chương trình",
  "utmSource": "facebook",
  "utmCampaign": "yoga-workshop-apr",
  "utmMedium": "social"
}
```

**Validation**:
- `fullName` required, ≥ 2 ký tự
- `phone` required, regex VN phone (09xx, 08xx, 07xx, 03xx, 05xx) × 10 số
- `email` optional, nếu có phải đúng format
- Rate limit: **5 requests / phút / IP** (anti-spam)
- Kiểm tra event hợp lệ:
  - Status ∈ `published`/`ongoing`
  - `now >= registration_open_date`
  - `now <= registration_close_date`
  - Nếu `max_attendees` khác NULL: `current_count < max_attendees`
- Dedupe: same `event_id + phone` → 409

**Response 201**:
```json
{
  "ok": true,
  "registration": {
    "id": 456,
    "eventId": 123,
    "status": "pending",
    "registeredAt": "2026-04-15T10:30:00Z",
    "confirmationMessage": "BTC sẽ liên hệ xác nhận sớm nhất"
  }
}
```

**Response 400/409/429**:
```json
{ "ok": false, "error": "EVENT_FULL | REGISTRATION_CLOSED | DUPLICATE_PHONE | INVALID_INPUT | RATE_LIMIT" }
```

**Side effects**:
- Publish `event.registration.created` domain event
- (Optional) Auto-send email/SMS xác nhận đã nhận đăng ký

---

### 🔒 Authenticated endpoints (cần JWT + tenant_id)

#### `GET /marketing/events`

List events cho admin CRM.

**Query params**:
- `status`: `all | draft | published | ongoing | ended | cancelled`
- `q`: search theo title/description/tags
- `category`
- `page`, `limit` (default 20)
- `sort`: `start_date_desc | start_date_asc | created_desc`

**Response**:
```json
{
  "items": [ /* event objects tương tự public GET */ ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "stats": {
    "total": 42,
    "draft": 5,
    "published": 20,
    "ongoing": 3,
    "ended": 12,
    "cancelled": 2,
    "totalRegistrations": 580
  }
}
```

---

#### `POST /marketing/events`

Create event.

**Request body**: giống schema `marketing_events` columns, + field `status: "draft" | "published"` (chỉ 2 giá trị cho phép khi tạo).

**Validation**:
- Title required, 3-255 chars
- `end_date > start_date`
- `registration_close_date > registration_open_date`
- Nếu `venue_is_online = true`: `venue_online_url` required
- Nếu `venue_is_online = false`: `venue_name + venue_address` required
- Slug auto-generate từ title (backend làm, không trust FE)

**Response 201**: Full event object với `id`, `slug`, `created_at`.

---

#### `PATCH /marketing/events/:id`

Update event. Partial update — chỉ field nào truyền thì update.

**Validation**: Không cho đổi slug. Không cho chuyển từ `cancelled`/`ended` sang `published`.

**Response 200**: Full event object.

---

#### `POST /marketing/events/:id/publish`

Shortcut: chuyển status `draft → published`, set `published_at = now()`.

#### `POST /marketing/events/:id/unpublish`

Chuyển status `published → draft` (không cho unpublish nếu đã có registration — warning, cần confirm).

#### `POST /marketing/events/:id/cancel`

Chuyển status → `cancelled`. Gửi notification huỷ event cho tất cả registrant.

#### `DELETE /marketing/events/:id`

Soft delete. Chỉ cho xoá event `draft` hoặc không có registration. Nếu có registration → block, trả lỗi với suggestion "Hãy cancel thay vì delete".

---

#### `GET /marketing/events/:id/registrations`

List registrants của 1 event.

**Query params**:
- `status`: filter
- `q`: search name/phone/email
- `page`, `limit`
- `converted`: `true | false | all` — filter theo converted_to_customer

**Response**:
```json
{
  "items": [
    {
      "id": 456,
      "fullName": "Nguyễn Văn A",
      "phone": "0987654321",
      "email": "a@example.com",
      "company": "ABC Co.",
      "note": "...",
      "status": "confirmed",
      "ticketCode": "WORKSHOP-XYZ123",
      "ticketQrUrl": "https://cdn.../qr-xyz123.png",
      "orderId": null,
      "convertedToCustomerId": null,
      "source": "public_portal",
      "utmSource": "facebook",
      "registeredAt": "2026-04-15T10:30:00Z",
      "confirmedAt": "2026-04-15T14:00:00Z"
    }
  ],
  "total": 12,
  "stats": {
    "pending": 3,
    "confirmed": 5,
    "checkedIn": 2,
    "cancelled": 1,
    "noShow": 1,
    "convertedCount": 2,
    "fillRate": 0.4,
    "conversionRate": 0.17
  }
}
```

---

#### `PATCH /marketing/events/:id/registrations/:regId`

Update registration — chủ yếu đổi status.

**Request body**:
```json
{ "status": "confirmed" }
```

**Side effects khi status = `confirmed`**:
- Sinh `ticket_code` (format: `{EVENT_SLUG_8_CHARS}-{RANDOM_6_CHARS}`)
- Sinh QR code image (có thể lazy-gen khi GET)
- Set `confirmed_at = now()`
- Publish `event.registration.confirmed` → notification service gửi email/SMS vé
- **Nếu event có `ticket_price > 0`**: auto-tạo `sale_order` qua Sales service (xem section dưới)

**Side effects khi status = `checked_in`**:
- Set `checked_in_at = now()`
- Publish `event.registration.checked_in`

---

#### `POST /marketing/events/:id/registrations/:regId/issue-ticket`

Alias cho `PATCH ... { status: "confirmed" }` — đổi tên dễ hiểu hơn, và dùng khi UI click nút "Phát hành vé".

Nếu `event.ticket_price > 0`:
1. Gọi `SalesService.createOrder({ customerPhone, customerName, items: [{ name: event.title, price: ticket_price }], orderType: "event_ticket", refId: regId })`
2. Nhận về `order_id` + `payment_url`
3. Lưu `order_id` vào registration
4. Response bao gồm `paymentUrl` để FE redirect user tới trang thanh toán

Nếu free:
- Chỉ set confirmed + sinh ticket code ngay

**Response**:
```json
{
  "ok": true,
  "registration": { /* updated obj */ },
  "paymentUrl": "https://.../pay/order-789" // nếu paid
}
```

---

#### `POST /marketing/events/:id/registrations/:regId/convert-to-member`

**Hand-off sang Customer service** — tạo customer mới từ registration.

**Request body** (optional overrides):
```json
{
  "customerType": "individual",
  "membershipTierId": null,
  "additionalInfo": { "source": "event-yoga-workshop" }
}
```

**Logic**:
1. Check `registration.converted_to_customer_id` — nếu đã có, trả về existing
2. Check phone existence trong `customers` table:
   - Nếu đã có → **link** registration vào customer cũ (không tạo mới)
   - Nếu chưa → gọi `CustomerService.addOther({ name, phone, email, company, source: "event" })`
3. Cập nhật `registration.converted_to_customer_id = customer.id` + `converted_at = now()`
4. Publish `event.registration.converted_to_member`

**Response**:
```json
{
  "ok": true,
  "customerId": 789,
  "isNewCustomer": true,
  "registration": { /* updated */ }
}
```

---

#### `POST /marketing/events/:id/registrations/import`

Bulk import từ CSV/Excel (manual nhập từ ngoài hệ thống, vd BTC gom từ Google Form trước đó).

**Request**: multipart/form-data với file Excel.
**Response**: `{ imported: 12, failed: 2, errors: [...] }`

---

#### `POST /marketing/events/public/:slug/check-ticket`

Check-in tại sự kiện — scan QR code.

**Request body**:
```json
{ "ticketCode": "WORKSHOP-XYZ123" }
```

**Response**:
```json
{
  "ok": true,
  "registration": {
    "fullName": "Nguyễn Văn A",
    "status": "checked_in",
    "checkedInAt": "2026-04-29T07:55:00Z"
  }
}
```

Hoặc lỗi: `INVALID_CODE | ALREADY_CHECKED_IN | CANCELLED`.

**Auth**: endpoint này NÊN yêu cầu auth (staff tại event) — dùng một short-lived staff token hoặc scoped API key.

---

## 🔗 Integration với Sales service

Khi event có paid ticket + user confirm đăng ký, Marketing gọi Sales service:

### Request (Marketing → Sales)

```http
POST /sales/orders
Authorization: Bearer {internal-service-token}

{
  "tenantId": 1,
  "orderType": "event_ticket",
  "customerInfo": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "a@example.com"
  },
  "items": [
    {
      "name": "Vé Workshop Yoga 29/04",
      "sku": "EVT-WORKSHOP-YOGA-APR29",
      "quantity": 1,
      "unitPrice": 150000,
      "refType": "event_ticket",
      "refId": "registration:456"
    }
  ],
  "metadata": {
    "sourceService": "marketing",
    "sourceModule": "events",
    "eventId": 123,
    "registrationId": 456
  }
}
```

### Response (Sales → Marketing)

```json
{
  "orderId": 789,
  "orderCode": "SO-2026-00789",
  "totalAmount": 150000,
  "paymentStatus": "pending",
  "paymentUrl": "https://pay.reborn.vn/order/789"
}
```

Marketing lưu `order_id` vào `registration.order_id`.

### Webhook từ Sales khi thanh toán xong

```http
POST /marketing/webhooks/sales-order-paid
Authorization: Bearer {internal-service-token}

{
  "orderId": 789,
  "refType": "event_ticket",
  "refId": "registration:456",
  "paidAt": "2026-04-15T15:00:00Z"
}
```

Marketing handle:
1. Tìm registration qua `refId` hoặc `order_id`
2. Set status → `confirmed`
3. Sinh ticket code + QR
4. Gửi email vé

---

## 🔗 Integration với Customer service

Khi convert registration → member, Marketing gọi:

### Request (Marketing → Customer)

```http
POST /customers/add-other
Authorization: Bearer {internal-service-token}

{
  "tenantId": 1,
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "email": "a@example.com",
  "company": "ABC Co.",
  "source": "event",
  "metadata": {
    "sourceService": "marketing",
    "sourceModule": "events",
    "eventId": 123,
    "registrationId": 456
  }
}
```

### Response

```json
{
  "customerId": 789,
  "isNew": true
}
```

---

## 🔐 Permission codes (RBAC)

Theo pattern đã thiết lập trong tax module:

| Code | Mô tả |
|---|---|
| `EVENTS_VIEW` | Xem list + detail event |
| `EVENTS_CREATE` | Tạo event mới |
| `EVENTS_EDIT` | Sửa event |
| `EVENTS_DELETE` | Xoá event |
| `EVENTS_PUBLISH` | Công bố / ẩn event |
| `EVENTS_VIEW_REGISTRATIONS` | Xem danh sách người đăng ký |
| `EVENTS_MANAGE_REGISTRATIONS` | Đổi trạng thái, phát hành vé |
| `EVENTS_CONVERT_TO_MEMBER` | Chuyển thành hội viên (gate an toàn vì tạo customer record) |
| `EVENTS_EXPORT` | Xuất CSV danh sách đăng ký |

---

## 🧪 Test cases BE cần cover

### Unit tests
- Slug generation: unique, URL-safe, handle duplicate titles
- Validation: invalid date ranges, missing required fields
- Dedupe: same phone + same event → reject
- Status transition: không cho `cancelled → published`
- Ticket code format + uniqueness

### Integration tests
- Public register → create pending → admin confirm → free event: check ticket issued
- Public register → admin confirm → paid event: check order created via Sales mock
- Convert to member: check CustomerService called, registration linked
- Rate limit public register
- Event full: reject đăng ký thứ (maxAttendees + 1)
- Registration window closed: reject
- Delete event with registrations: rejected with helpful error

### Security tests
- Public endpoint không trả PII
- Auth required cho admin endpoints
- Tenant isolation (user A không thấy event tenant B)
- XSS trong `content_html`: sanitize server-side (dùng `DOMPurify` hoặc tương đương)
- SQL injection trong search `q`

---

## 📝 Migration plan

1. **Phase 1 — BE schema + CRUD endpoints**:
   - Tạo 2 bảng `marketing_events` + `marketing_event_registrations`
   - Endpoint `GET/POST/PATCH/DELETE /marketing/events`
   - Endpoint list registrations + update status (chưa cần integration)
   - FE vẫn dùng localStorage — test song song

2. **Phase 2 — Public endpoints**:
   - `GET /marketing/events/public/:slug`
   - `POST /marketing/events/public/:slug/register`
   - FE ShareEventPage switch từ `eventStorage` sang API call
   - FE EventFormPage + EventListPage chuyển sang API

3. **Phase 3 — Sales integration**:
   - `POST /sales/orders` với `orderType: "event_ticket"`
   - Webhook `sales-order-paid` từ Sales về Marketing
   - Test flow paid ticket

4. **Phase 4 — Customer integration**:
   - `POST /customers/add-other` từ Marketing
   - Convert registration endpoint wire vào
   - Check phone dedupe ở Customer side

5. **Phase 5 — QR check-in + staff tool**:
   - Sinh QR code thực (dùng `qrcode` npm lib hoặc tương đương)
   - Staff check-in endpoint với scoped auth
   - (Optional) Mobile PWA scanner cho BTC

---

## 🔌 FE → BE switch guide

Khi BE sẵn sàng, FE chỉ cần thay `src/pages/CommunityHub/Events/storage.ts` từ localStorage sang fetch API. Signature các method giữ nguyên:

```ts
// Trước (localStorage)
eventStorage.listEvents() → EventEntity[]

// Sau (API)
eventStorage.listEvents() → fetch("/marketing/events").then(r => r.json().items)
```

FE components (EventListPage, EventFormPage, EventDetailPage, ShareEventPage) **KHÔNG cần sửa** — chỉ đổi một file.

---

## 📋 Deliverables checklist cho BE

- [ ] Migration tạo 2 bảng với đầy đủ index
- [ ] Model/Entity + Repository
- [ ] Service layer với logic validation + dedupe + status transition
- [ ] Controller với 15 endpoints (4 public + 11 authenticated)
- [ ] Integration contract với Sales (tạo order + nhận webhook)
- [ ] Integration contract với Customer (add-other)
- [ ] Permission codes + middleware
- [ ] Rate limiting cho public register
- [ ] XSS sanitization cho `content_html`
- [ ] Unit + integration tests ≥ 80% coverage
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Dev environment seed data (ít nhất 3 events mẫu)

---

## ❓ Điểm cần làm rõ với stakeholder

1. **Slug customization**: Cho phép user sửa slug không hay auto-gen only?
2. **Payment flow**: Dùng payment provider nào (VNPay/Momo/Stripe)? Cần Sales team confirm.
3. **Email/SMS template**: Template xác nhận đăng ký + ticket code cần design
4. **QR format**: Embed URL vào QR hay chỉ ticket code?
5. **Check-in offline mode**: Có cần support offline check-in rồi sync sau không?
6. **Ticket refund**: Policy khi user huỷ đăng ký sau thanh toán?
7. **Multi-ticket per registration**: Cho phép 1 người đăng ký nhiều vé 1 lần không?
8. **Seat selection**: Nếu có chỗ ngồi cụ thể?
9. **Waiting list**: Khi event full, có auto-thêm waitlist không?
10. **Analytics**: Cần track mở link, click CTA không? (GA4 / Mixpanel)

---

## 📂 Frontend artifacts tham khảo

Khi implement BE, có thể xem code FE để hiểu shape + flow mong đợi:

- Types: [src/pages/CommunityHub/Events/types.ts](../../src/pages/CommunityHub/Events/types.ts)
- Storage (mock): [src/pages/CommunityHub/Events/storage.ts](../../src/pages/CommunityHub/Events/storage.ts) — đây chính là signature API mà BE nên theo
- Mock data: [src/mocks/community-hub/events.ts](../../src/mocks/community-hub/events.ts)
- UI admin: [src/pages/CommunityHub/Events/](../../src/pages/CommunityHub/Events/)
- UI public: [src/pages/ShareEventPage/index.tsx](../../src/pages/ShareEventPage/index.tsx)
