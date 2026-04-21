# BACKEND TASK — Market: Event Management (Sự kiện)

**Discovered:** 2026-04-16 — FE prototype hoàn thành, cần BE triển khai API  
**Severity:** 🟠 HIGH  
**Module:** `cloud-market-master`  
**Prefix:** `/bizapi/market/events/...`  
**FE spec:** `docs/events/backend-spec.md` (schema + endpoint cơ bản)  
**FE types:** `src/pages/CommunityHub/Events/types.ts`  
**FE service:** `src/services/EventService.ts`  
**FE URL config:** `src/configs/urls.ts` → `urlsApi.events.*`

---

## TỔNG QUAN

FE đã hoàn thành prototype dùng localStorage. Cần BE triển khai API để FE chuyển sang gọi thật.  
Backend spec cũ (`docs/events/backend-spec.md`) cover CRUD cơ bản. Task này bổ sung **6 nhóm tính năng mới** chưa có trong spec.

FE đã thiết kế storage.ts theo pattern **API-first, fallback localStorage** — mỗi method gọi API trước, nếu lỗi thì fallback. Khi BE deploy xong, FE tự chuyển sang dùng API.

---

## PHẦN 1: DB SCHEMA + ENDPOINTS CƠ BẢN

### Table: `marketing_events`

```sql
CREATE TABLE marketing_events (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id       BIGINT NOT NULL,
  slug            VARCHAR(80) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  content_html    MEDIUMTEXT COMMENT 'Nội dung chi tiết từ RebornEditor',
  cover_image_url VARCHAR(500) DEFAULT NULL,

  -- Thời gian
  start_date              DATETIME NOT NULL,
  end_date                DATETIME NOT NULL,
  registration_open_date  DATETIME NOT NULL,
  registration_close_date DATETIME NOT NULL,

  -- Địa điểm
  venue_name       VARCHAR(255),
  venue_address    VARCHAR(500),
  venue_city       VARCHAR(100),
  venue_map_url    VARCHAR(500),
  venue_is_online  TINYINT(1) DEFAULT 0,
  venue_online_url VARCHAR(500),

  -- Người liên hệ
  contact_name  VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  contact_role  VARCHAR(100),

  -- Sức chứa + giá vé
  max_attendees INT DEFAULT NULL COMMENT 'NULL = không giới hạn',
  ticket_price  DECIMAL(12,0) DEFAULT 0 COMMENT 'VND, 0 = miễn phí',

  -- Trạng thái (ongoing/ended được tính runtime từ start_date/end_date)
  status       ENUM('draft','published','ongoing','ended','cancelled') DEFAULT 'draft',
  published_at DATETIME DEFAULT NULL,

  -- Metadata
  category VARCHAR(50) DEFAULT NULL COMMENT 'workshop, hội thảo, lớp học, networking, training, khác',
  tags     JSON DEFAULT NULL COMMENT '["yoga","beginner"]',

  -- Mở rộng GAP (xem PHẦN 2-6 bên dưới)
  dynamic_fields       JSON DEFAULT NULL,
  add_on_items         JSON DEFAULT NULL,
  gallery_image_urls   JSON DEFAULT NULL,
  require_payment_proof TINYINT(1) DEFAULT 0,
  selectable_dates     JSON DEFAULT NULL,

  -- Audit
  created_by BIGINT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL COMMENT 'Soft delete',

  -- Indexes
  UNIQUE INDEX idx_tenant_slug (tenant_id, slug),
  INDEX idx_tenant_status_start (tenant_id, status, start_date),
  INDEX idx_tenant_created (tenant_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table: `marketing_event_registrations`

```sql
CREATE TABLE marketing_event_registrations (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  BIGINT NOT NULL,
  event_id   BIGINT NOT NULL,
  event_slug VARCHAR(80) NOT NULL COMMENT 'Denormalized để tra cứu nhanh',

  -- Thông tin người đăng ký
  full_name VARCHAR(100) NOT NULL,
  phone     VARCHAR(20) NOT NULL,
  email     VARCHAR(100) DEFAULT NULL,
  company   VARCHAR(200) DEFAULT NULL,
  note      TEXT DEFAULT NULL,

  -- Trạng thái
  status      ENUM('pending','confirmed','checked_in','cancelled','no_show') DEFAULT 'pending',
  ticket_code VARCHAR(50) DEFAULT NULL COMMENT 'Sinh khi confirmed, format: SLUG8-RANDOM6',
  ticket_qr_url VARCHAR(500) DEFAULT NULL,

  -- Liên kết Sales + Customer
  order_id                BIGINT DEFAULT NULL COMMENT 'FK → sale_orders (nếu có phí)',
  converted_to_customer_id BIGINT DEFAULT NULL COMMENT 'FK → customers',

  -- Timestamps trạng thái
  confirmed_at  DATETIME DEFAULT NULL,
  checked_in_at DATETIME DEFAULT NULL,
  converted_at  DATETIME DEFAULT NULL,

  -- Nguồn + UTM
  source       ENUM('public_portal','manual','import','api') DEFAULT 'public_portal',
  utm_source   VARCHAR(50) DEFAULT NULL,
  utm_campaign VARCHAR(50) DEFAULT NULL,
  utm_medium   VARCHAR(50) DEFAULT NULL,

  -- Mở rộng GAP (xem PHẦN 2-5 bên dưới)
  dynamic_field_values JSON DEFAULT NULL,
  selected_add_ons     JSON DEFAULT NULL,
  total_amount         DECIMAL(12,0) DEFAULT NULL,
  selected_dates       JSON DEFAULT NULL,

  -- Payment proof
  payment_proof_url           VARCHAR(500) DEFAULT NULL,
  payment_proof_status        ENUM('not_required','pending','submitted','approved','rejected') DEFAULT 'not_required',
  payment_proof_submitted_at  DATETIME DEFAULT NULL,
  payment_proof_reviewed_at   DATETIME DEFAULT NULL,
  payment_proof_reviewed_by   BIGINT DEFAULT NULL,
  payment_proof_reject_reason VARCHAR(500) DEFAULT NULL,

  -- Audit
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,

  -- Indexes
  INDEX idx_tenant_event_status (tenant_id, event_id, status),
  INDEX idx_tenant_phone (tenant_id, phone),
  UNIQUE INDEX idx_ticket_code (ticket_code),
  INDEX idx_order (order_id),
  INDEX idx_customer (converted_to_customer_id),
  FOREIGN KEY (event_id) REFERENCES marketing_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Dedupe rule
Cùng `event_id` + cùng `phone` → reject HTTP 409 `DUPLICATE_PHONE`

### Endpoints cần triển khai

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/events/public?slug={slug}` | Xem event công khai (no auth) |
| POST | `/events/public/register?slug={slug}` | Đăng ký (no auth) |
| POST | `/events/public/check-ticket?slug={slug}` | Check-in bằng mã vé |
| GET | `/events/list` | Danh sách events (admin) |
| GET | `/events/get?id={id}` | Chi tiết event (admin) |
| POST | `/events/create` | Tạo event |
| POST | `/events/update?id={id}` | Cập nhật event |
| DELETE | `/events/delete?id={id}` | Xoá event (soft delete) |
| POST | `/events/publish?id={id}` | Công bố event |
| POST | `/events/unpublish?id={id}` | Ẩn event |
| POST | `/events/cancel?id={id}` | Huỷ event |
| GET | `/events/registrations?eventId={id}` | DS người đăng ký |
| POST | `/events/registrations/update?id={regId}` | Cập nhật trạng thái |
| POST | `/events/registrations/issue-ticket?id={regId}` | Phát hành vé |
| POST | `/events/registrations/convert?id={regId}` | Chuyển thành hội viên |
| POST | `/events/registrations/import?eventId={id}` | Import CSV/Excel |

### Response format
```json
{ "code": 0, "result": { ... }, "message": "OK" }
```

---

## PHẦN 2: BỔ SUNG MỚI — Dynamic Fields (Trường tùy biến)

### Mô tả
Admin cấu hình trường tuỳ biến trên form đăng ký (VD: "Size áo", "Bữa ăn ưa thích", "Level kinh nghiệm").

### DB Schema
Thêm cột vào `marketing_events`:
```sql
ALTER TABLE marketing_events
  ADD COLUMN dynamic_fields JSON DEFAULT NULL
  COMMENT 'Cấu hình trường tùy biến [{id, label, type, required, options?, placeholder?, defaultValue?, order}]';
```

`type` enum: `text | textarea | number | select | checkbox | date | email | phone`

Thêm cột vào `marketing_event_registrations`:
```sql
ALTER TABLE marketing_event_registrations
  ADD COLUMN dynamic_field_values JSON DEFAULT NULL
  COMMENT 'Giá trị trường tùy biến {fieldId: value}';
```

### Validation (BE)
- Khi register: kiểm tra `required` fields trong `dynamic_fields` config của event → trả lỗi nếu thiếu
- `select` type: giá trị phải nằm trong `options` array
- Lưu dạng JSON object `{ "df-xxx": "L", "df-yyy": "true" }`

### Endpoints ảnh hưởng
- `POST /events/create` và `POST /events/update` — nhận thêm field `dynamicFields`
- `POST /events/public/register` — nhận thêm `dynamicFieldValues`, validate theo event config
- `GET /events/registrations` — trả thêm `dynamicFieldValues` cho mỗi registration

---

## PHẦN 3: BỔ SUNG MỚI — Add-on Items (Sản phẩm/dịch vụ bổ sung)

### Mô tả
Admin cấu hình sản phẩm/dịch vụ bán thêm khi đăng ký (VD: "Bữa trưa 65,000đ", "Massage 250,000đ"). Khách chọn + nhập số lượng. Tính tổng tiền.

### DB Schema
Thêm cột vào `marketing_events`:
```sql
ALTER TABLE marketing_events
  ADD COLUMN add_on_items JSON DEFAULT NULL
  COMMENT 'Danh sách SP/DV bổ sung [{id, name, description?, unitPrice, unit, maxQty?, imageUrl?}]';
```

Thêm cột vào `marketing_event_registrations`:
```sql
ALTER TABLE marketing_event_registrations
  ADD COLUMN selected_add_ons JSON DEFAULT NULL
  COMMENT 'SP/DV đã chọn [{addOnId, qty}]',
  ADD COLUMN total_amount DECIMAL(12,0) DEFAULT NULL
  COMMENT 'Tổng tiền (vé + add-on) VND';
```

### Logic (BE)
- Khi register: BE tự tính `totalAmount = ticketPrice + sum(addOn.unitPrice * qty)`
- Validate: qty ≤ maxQty (nếu có), addOnId phải tồn tại trong event config
- **KHÔNG tin totalAmount từ FE** — BE tự tính lại để tránh giả mạo

### Endpoints ảnh hưởng
- `POST /events/create`, `POST /events/update` — nhận `addOnItems`
- `POST /events/public/register` — nhận `selectedAddOns`, BE tính `totalAmount`
- `GET /events/registrations` — trả `selectedAddOns`, `totalAmount`

---

## PHẦN 4: BỔ SUNG MỚI — Payment Proof (Bằng chứng thanh toán)

### Mô tả
Khách upload ảnh hoá đơn chuyển khoản. Admin duyệt/từ chối.

### DB Schema
Thêm cột vào `marketing_events`:
```sql
ALTER TABLE marketing_events
  ADD COLUMN require_payment_proof TINYINT(1) DEFAULT 0
  COMMENT 'Bắt buộc upload bằng chứng thanh toán';
```

Thêm cột vào `marketing_event_registrations`:
```sql
ALTER TABLE marketing_event_registrations
  ADD COLUMN payment_proof_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN payment_proof_status ENUM('not_required','pending','submitted','approved','rejected') DEFAULT 'not_required',
  ADD COLUMN payment_proof_submitted_at DATETIME DEFAULT NULL,
  ADD COLUMN payment_proof_reviewed_at DATETIME DEFAULT NULL,
  ADD COLUMN payment_proof_reviewed_by BIGINT DEFAULT NULL,
  ADD COLUMN payment_proof_reject_reason VARCHAR(500) DEFAULT NULL;
```

### Endpoints MỚI

**POST `/events/registrations/payment-proof?id={regId}`**
- Request: `{ imageUrl: string }` (hoặc multipart upload)
- Logic: set `payment_proof_url`, `payment_proof_status = "submitted"`, `submitted_at = now()`
- Auth: có thể public (người đăng ký upload sau) hoặc admin
- Response: `{ code: 0, result: { registration } }`

**POST `/events/registrations/payment-review?id={regId}`**
- Request: `{ approved: boolean, rejectReason?: string }`
- Logic:
  - `approved = true` → status = "approved", reviewed_at = now()
  - `approved = false` → status = "rejected", reject_reason = ...
- Auth: admin (JWT + permission EVENTS_MANAGE_REGISTRATIONS)
- Response: `{ code: 0, result: { registration } }`

---

## PHẦN 5: BỔ SUNG MỚI — Check-in / Check-out nâng cao

### Mô tả
Giao diện check-in chuyên dụng cho ngày sự kiện. Hỗ trợ multi-day events (khách chọn ngày tham gia).

### DB Schema
Thêm cột vào `marketing_events`:
```sql
ALTER TABLE marketing_events
  ADD COLUMN selectable_dates JSON DEFAULT NULL
  COMMENT 'Danh sách ngày chọn cho event multi-day ["2026-04-29","2026-04-30"]';
```

Thêm cột vào `marketing_event_registrations`:
```sql
ALTER TABLE marketing_event_registrations
  ADD COLUMN selected_dates JSON DEFAULT NULL
  COMMENT 'Ngày đã chọn tham gia ["2026-04-29"]';
```

Tạo table mới:
```sql
CREATE TABLE marketing_event_checkins (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  registration_id BIGINT NOT NULL,
  checked_in_at DATETIME NOT NULL,
  checked_out_at DATETIME DEFAULT NULL,
  checked_in_by BIGINT DEFAULT NULL COMMENT 'admin user id',
  selected_date DATE DEFAULT NULL COMMENT 'ngày nào của event multi-day',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_reg (registration_id),
  INDEX idx_tenant_date (tenant_id, selected_date),
  FOREIGN KEY (registration_id) REFERENCES marketing_event_registrations(id)
);
```

### Endpoints MỚI

**POST `/events/registrations/check-in?id={regId}`**
- Request: `{ selectedDate?: "2026-04-29" }`
- Logic:
  - Insert row vào `marketing_event_checkins`
  - Update registration status = "checked_in", checked_in_at = now()
- Auth: admin
- Response: `{ code: 0, result: { registration, checkInRecord } }`

**POST `/events/registrations/check-out?id={regId}`**
- Logic: find last checkin record without checked_out_at, set checked_out_at = now()
- Auth: admin
- Response: `{ code: 0, result: { registration } }`

---

## PHẦN 6: BỔ SUNG MỚI — Gallery Images (Ảnh giới thiệu hoạt động)

### DB Schema
```sql
ALTER TABLE marketing_events
  ADD COLUMN gallery_image_urls JSON DEFAULT NULL
  COMMENT 'Danh sách URL ảnh giới thiệu hoạt động';
```

### Note
- Prototype FE dùng data URL. BE thật cần endpoint upload image (có thể dùng chung upload service hiện có)
- Trả `galleryImageUrls` trong response GET event

---

## PHẦN 7: BỔ SUNG MỚI — Service Usage Tracking (ĐẶC THÙ ngành)

### Mô tả
Tracking dịch vụ khách sử dụng trong event (fitness/spa). Đây là tính năng **đặc thù ngành** — có thể bỏ qua nếu deploy cho ngành khác.

### DB Schema
```sql
CREATE TABLE marketing_event_service_usage (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  registration_id BIGINT NOT NULL,
  service_id VARCHAR(50) NOT NULL COMMENT 'ID từ service catalog',
  service_name VARCHAR(255) NOT NULL COMMENT 'Denormalized',
  qty INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,0) NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by BIGINT DEFAULT NULL COMMENT 'admin user id',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_reg (registration_id),
  INDEX idx_tenant (tenant_id),
  FOREIGN KEY (registration_id) REFERENCES marketing_event_registrations(id)
);
```

### Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/events/service-usage/list?registrationId={id}` | DS dịch vụ đã dùng |
| POST | `/events/service-usage/add` | Ghi nhận sử dụng DV |
| DELETE | `/events/service-usage/delete?id={id}` | Xoá bản ghi |

**POST `/events/service-usage/add`** request:
```json
{
  "registrationId": "123",
  "serviceId": "SVC-20",
  "serviceName": "Massage 60 phút",
  "qty": 1,
  "unitPrice": 250000
}
```

---

## PHẦN 8: PERMISSIONS

Bổ sung vào permission system:

| Code | Mô tả |
|------|-------|
| EVENTS_VIEW | Xem danh sách + chi tiết event |
| EVENTS_CREATE | Tạo event |
| EVENTS_EDIT | Sửa event |
| EVENTS_DELETE | Xoá event |
| EVENTS_PUBLISH | Công bố / ẩn event |
| EVENTS_VIEW_REGISTRATIONS | Xem DS người đăng ký |
| EVENTS_MANAGE_REGISTRATIONS | Duyệt, phát vé, đổi trạng thái |
| EVENTS_MANAGE_PAYMENT | Duyệt/từ chối bằng chứng thanh toán |
| EVENTS_CHECKIN | Check-in/out tại sự kiện |
| EVENTS_CONVERT_TO_MEMBER | Chuyển thành hội viên |
| EVENTS_SERVICE_USAGE | Tracking dịch vụ sử dụng |
| EVENTS_EXPORT | Xuất dữ liệu |

---

## THỨ TỰ ƯU TIÊN TRIỂN KHAI

| Priority | Nhóm | Lý do |
|----------|-------|-------|
| P0 | Event CRUD + Registration cơ bản | Core flow, spec đã có |
| P0 | Permissions | Cần cho mọi endpoint authenticated |
| P1 | Dynamic Fields | Khách hàng yêu cầu trực tiếp |
| P1 | Add-on Items + Total Amount | Khách hàng yêu cầu trực tiếp |
| P1 | Payment Proof | Khách hàng yêu cầu trực tiếp |
| P1 | Check-in / Check-out + Multi-day | Khách hàng yêu cầu trực tiếp |
| P2 | Gallery Images | Nhỏ, chỉ thêm 1 JSON column |
| P2 | Service Usage Tracking | Đặc thù ngành, có thể làm sau |
| P2 | Import CSV/Excel | Nice to have |

---

## FE INTEGRATION NOTES

- FE service file: `src/services/EventService.ts` — đã map đầy đủ endpoint
- FE storage: `src/pages/CommunityHub/Events/storage.ts` — pattern API-first, fallback localStorage
- Khi BE deploy: FE tự detect API available và ngừng dùng localStorage
- Response format: `{ code: 0, result: {...} }` — FE unwrap qua `res.result`
- Auth: fetchConfig.ts tự inject JWT + Hostname header

---

## ADDENDUM 2026-04-21 — Yêu cầu mới từ khách hàng W-House

Khách hàng cung cấp 3 tài liệu (xem [docs/requirements/analysis.md](../../requirements/analysis.md)):
- `event.jpg` — QR + Google Maps + ảnh địa điểm
- `other.jpg` — Excel tổng hợp với multi-column header (add-ons grouped)
- Excel Google Form responses — đăng ký Squat Mentor (32 rows)

Phát sinh **5 gap mới** so với schema hiện tại. Chi tiết:

### Gap 1 — Venue coordinates + images tách riêng

**Hiện tại:** `venue_map_url` (share link string).
**Cần thêm:** `venue_latitude`, `venue_longitude`, `venue_images` để FE embed Google Maps iframe và gallery ảnh địa điểm riêng (tách khỏi `gallery_image_urls` là ảnh hoạt động).

```sql
ALTER TABLE marketing_events
  ADD COLUMN venue_latitude  DECIMAL(10, 7) DEFAULT NULL COMMENT 'Toạ độ lat (WGS84)',
  ADD COLUMN venue_longitude DECIMAL(10, 7) DEFAULT NULL COMMENT 'Toạ độ lng (WGS84)',
  ADD COLUMN venue_images    JSON DEFAULT NULL COMMENT '["url1","url2",...] ảnh địa điểm';
```

Response JSON extend `venue`:
```json
{
  "venue": {
    "name": "Vườn Thực Vật Hà Nội",
    "address": "...",
    "mapUrl": "https://goo.gl/...",
    "latitude": 21.0285,
    "longitude": 105.8542,
    "venueImages": ["https://.../cong-thuc-vat-1.jpg", "..."]
  }
}
```

### Gap 2 — Tenant-level bank account + per-event override

QR VietQR đã reuse endpoint billing có sẵn. Cần **nguồn tài khoản nhận tiền**:

**Default — tenant-level config** (bảng `tenant_config` hoặc `operation` microservice):
```json
{
  "bankAccount": {
    "holder": "Nguyễn Trọng Thế Anh",
    "phone": "0886699931",
    "bank": "VCB",
    "accountNumber": "1234567890"
  }
}
```

**Override per-event** (optional, nếu sự kiện có TK riêng):
```sql
ALTER TABLE marketing_events
  ADD COLUMN bank_account_override JSON DEFAULT NULL
  COMMENT '{"holder","bank","accountNumber","phone"} — override tenant default';
```

Logic FE/BE khi tạo QR: `event.bankAccountOverride ?? tenant.bankAccount`.

### Gap 3 — Add-on grouping (multi-level header cho Excel other.jpg)

**Hiện tại:** `add_on_items` JSON lưu array flat các add-on.
**Cần thêm:** Field `group` trong từng add-on để FE render **multi-level table header** khớp `other.jpg`:

```json
{
  "add_on_items": [
    { "id": "a1", "group": "Cư trú W-House 09/05", "name": "Ăn trưa",  "unitPrice": 50000, "unit": "suất" },
    { "id": "a2", "group": "Cư trú W-House 09/05", "name": "Ăn tối",   "unitPrice": 50000, "unit": "suất" },
    { "id": "a3", "group": "Cư trú W-House 09/05", "name": "Cư trú",   "unitPrice": 100000,"unit": "đêm"  },
    { "id": "a4", "group": "Cư trú W-House 09/05", "name": "Xe di chuyển", "unitPrice": 100000, "unit": "lượt" },
    { "id": "a5", "group": "Phí tham gia 10/05",   "name": "Phí tham gia", "unitPrice": 300000, "unit": "lần" },
    { "id": "a6", "group": "Phí tham gia 10/05",   "name": "Ăn full 7h-2h", "unitPrice": 100000, "unit": "suất" }
  ]
}
```

**Lưu ý BE:** `group` chỉ là metadata cho UI rendering, không cần bảng riêng. Validate `group` là string ≤100 ký tự.

### Gap 4 — Multiple payment proofs (Excel có "Ảnh bill 1-4")

**Hiện tại:** `EventRegistration.paymentProof` single object.
**Cần đổi thành:** `paymentProofs` array (tối đa 4 ảnh — theo Excel gốc).

```sql
ALTER TABLE marketing_event_registrations
  DROP COLUMN payment_proof_image_url,
  DROP COLUMN payment_proof_submitted_at,
  DROP COLUMN payment_proof_status,
  DROP COLUMN payment_proof_reviewed_at,
  DROP COLUMN payment_proof_reviewed_by,
  DROP COLUMN payment_proof_reject_reason,
  ADD COLUMN payment_proofs JSON DEFAULT NULL
    COMMENT '[{imageUrl, submittedAt, status, reviewedAt, reviewedBy, rejectReason}, ...] max 4';
```

**Backward compat:** Nếu DB đã deploy với cột single, migration:
```sql
UPDATE marketing_event_registrations
SET payment_proofs = JSON_ARRAY(JSON_OBJECT(
  'imageUrl', payment_proof_image_url,
  'submittedAt', payment_proof_submitted_at,
  'status', payment_proof_status,
  'reviewedAt', payment_proof_reviewed_at,
  'reviewedBy', payment_proof_reviewed_by,
  'rejectReason', payment_proof_reject_reason
))
WHERE payment_proof_image_url IS NOT NULL;
```

FE type update (tương ứng):
```ts
// EventRegistration
paymentProofs?: PaymentProof[];   // thay cho paymentProof?: PaymentProof
```

### Gap 5 — Pipeline register → auto-link customer (quan trọng)

Hiện tại `event_registration` có `converted_to_customer_id` nhưng chưa có flow auto-link. Cần bổ sung:

**Endpoint:** `POST /market/events/{slug}/register` — FE public registration form gửi về.

**Logic BE:**

```
1. Extract fullName, phone, customerGroupKey, mentorCode, houseNumber từ body.

2. Tìm customer theo (tenant_id, phone):
   a. Nếu tồn tại → customerId = đã có; UPDATE customer.name nếu đang trống;
      UPDATE customer_group nếu đang trống; UPDATE 2 attribute mentorCode+houseNumber nếu đang trống.
   b. Nếu không → INSERT customer mới với:
      - status = 'lead'
      - customer_group_id = lookup theo customerGroupKey
      - Sau đó INSERT 2 customer_attribute_value cho mentorCode + houseNumber.

3. INSERT event_registration:
   - event_id, customer_id (từ bước 2), selectedDates, selectedAddOns, dynamicFieldValues, paymentProofs
   - total_amount = event.ticket_price + sum(addOn.unitPrice × qty)
   - status = 'pending' hoặc 'confirmed' (tuỳ event.require_payment_proof)
   - ticket_code = gen nếu status='confirmed'

4. Response:
   {
     code: 0,
     result: {
       registration: {...},
       qrPayload: { qrDataUrl, amount, addInfo }  // để FE render QR ngay trên thank-you page
     }
   }
```

**Liên quan task khác:**
- Customer group `Mentor7 / Hậu master k01 / Khác / Thấu hiểu nội tâm` → cần seed hoặc admin tự tạo qua UI
- Customer attribute `mentorCode` + `houseNumber` → xem [customer/attribute-seed-mentor.md](../customer/attribute-seed-mentor.md)

### Updated acceptance criteria (bổ sung)

- [ ] Migration 5 gaps trên apply thành công
- [ ] `GET /market/events/{slug}` trả `venue.latitude/longitude/venueImages`, `bankAccountOverride`, add-ons có `group`
- [ ] `POST /market/events/{slug}/register` tự tạo/link customer theo SĐT, áp dụng customer_group + 2 custom attributes
- [ ] Tenant chỉ thấy events/registrations của mình (tenant isolation)
- [ ] QR VietQR generate nhận `accountNumber/accountName/amount/addInfo` từ flow mới
- [ ] `paymentProofs` accept tối đa 4 ảnh, mỗi ảnh có status riêng
