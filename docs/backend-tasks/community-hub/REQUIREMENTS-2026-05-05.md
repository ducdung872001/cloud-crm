# Community Hub — yc khách 5/5/2026 — Backend tasks

> Source: `docs/requirements/20260505/requirements_combined.docx` (gồm summary + đối chiếu Ngọc/Lợi).
> FE đã implement song song (branch `community-hub`). Doc này liệt kê **mọi việc BE cần làm** để khớp với FE.
> Mọi field FE đang dùng đều có chỗ trong schema dưới — BE chỉ cần persist + serve, không cần đổi shape.
>
> **Deadline khách giục**: sự kiện gần nhất 9/5/2026 (4 ngày). Ưu tiên các mục đánh dấu **[P0]**.

---

## 0. Kiến trúc tổng thể

Phân hệ Community Hub có 3 module con:
- **Events** — đã có cơ sở; bổ sung field theo doc dưới.
- **Members** ⭐ MỚI — toàn bộ schema mã định danh + lịch sử.
- **Comments** ⭐ MỚI — bình luận dưới sự kiện (kênh CSKH, giữ vĩnh viễn).

URL prefix gợi ý: `/adminapi/community-hub/...` (consistent với services khác). Có thể giữ
prefix `/adminapi/event/...` cho các endpoint event đã có; chỉ thêm subroute mới.

Tất cả endpoint BE cần:
- Auth: Bearer JWT (header `Authorization`)
- Tenant: header `Hostname` (đã sẵn có pattern)
- Response wrapper: `{ code: 0, result: {...}, message?: string }` (như existing)
- Datetime: ISO 8601 với timezone (`+07:00` hoặc `Z`); FE đã có `normalizeBeDate` cover cả naive ISO.

---

## 1. Events — bổ sung field [P0]

### 1.1 Schema bổ sung cho `events` table

| Field | Type | Default | Mô tả |
|---|---|---|---|
| `content_blocks` | `JSON` (string) hoặc `JSONB` | `null` | Mảng `ContentBlock[]` — admin kéo-thả ảnh + chữ. FE serialize bằng `JSON.stringify`. |
| `is_test` | `BOOLEAN` | `false` | Đánh dấu event test/nội bộ. **Public portal MUST exclude** dù `status=published`. |
| `comments_enabled` | `BOOLEAN` | `true` | Bật/tắt bình luận dưới sự kiện. |
| `comments_moderated` | `BOOLEAN` | `false` | Comment cần admin duyệt trước khi public. |
| `registration_flows` | `JSON` (array of strings) | `["guest"]` | Bật các luồng đăng ký: `guest` / `member_signup` / `member_login`. |

### 1.2 Shape `ContentBlock`

```ts
{
  id: string;          // unique trong event
  type: "text" | "image" | "image_text" | "gallery" | "banner_ad" | "embed" | "divider";
  order: number;
  text?: string;       // HTML đơn giản (chỉ inline tag: <b>, <i>, <a>, <br>, <ul>, <li>...)
  imageUrl?: string;   // 1 ảnh chính
  imageUrls?: string[]; // gallery
  imagePosition?: "top" | "bottom" | "left" | "right"; // image_text layout
  linkUrl?: string;
  linkLabel?: string;  // banner_ad CTA text
  embedUrl?: string;   // iframe src
  caption?: string;
}
```

BE **không cần parse** — chỉ store nguyên dạng JSON. FE tự render theo `type`.

### 1.3 Endpoint hiện có cần extend

- `GET /event/list_paid` (hoặc tên đã có): trả thêm 5 field trên trong mỗi item.
- `GET /event/get` / `GET /event/public/:slug`: trả 5 field.
- `POST /event/create` & `PUT /event/update`: nhận 5 field từ body.
- **Public list endpoint**: server-side filter `is_test = false` (FE cũng đang filter client-side, nhưng BE side phòng leak data).
- **Validation BE**:
  - `registration_flows`: chỉ chấp nhận giá trị trong `["guest", "member_signup", "member_login"]`. Mảng phải có ≥ 1 phần tử.
  - `content_blocks`: nếu non-empty, mỗi block phải có `id` unique và `type` hợp lệ.

### 1.4 EventRegistration — bổ sung field [P0]

`event_registrations` table thêm:

| Field | Type | Default | Mô tả |
|---|---|---|---|
| `flow` | `VARCHAR(20)` | `"guest"` | Luồng đăng ký: `"guest"` / `"member_signup"` / `"member_login"`. |
| `member_code` | `VARCHAR(40)` nullable | `null` | Mã định danh của user (chỉ flow `member_login`). VD `"5971-300"`. |
| `member_signup_status` | `VARCHAR(20)` nullable | `null` | Cho flow `member_signup`: `"requested"` ngay sau đăng ký; admin approve → `"approved"`; reject → `"rejected"`. |
| `issued_member_code` | `VARCHAR(40)` nullable | `null` | Mã được cấp khi admin approve member_signup (link sang `members` table). |

Khi reg flow = `member_login` thì BE cần **verify** `member_code` tồn tại + active ở thời điểm submit. Nếu invalid → trả 400.

---

## 2. Members module ⭐ MỚI [P0]

> Đây là phần CORE chiếm ~70% thời gian buổi họp 5/5. Yêu cầu khắt khe về cấu trúc mã.

### 2.1 Schema

#### `members`

| Field | Type | Note |
|---|---|---|
| `id` | UUID | PK |
| `personal_seq` | `VARCHAR(8)` | STT cá nhân, tăng dần. VD `"5971"`. **UNIQUE**. |
| `group_seq` | `INT` | STT nhóm (20 người/nhóm). |
| `rank` | `VARCHAR(2)` | 1 chữ số đầu của personal_seq (derived/cached). VD `"6"`. |
| `member_code` | `VARCHAR(40)` | Canonical = `"${personal_seq}-${group_seq}"`. **UNIQUE**, indexed. |
| `master_code` | `VARCHAR(40)` nullable | Trưởng nhóm: `"master-N"`. Nullable. **UNIQUE** khi non-null. |
| `full_name` | `VARCHAR(255)` | |
| `phone` | `VARCHAR(20)` | indexed |
| `email` | `VARCHAR(255)` nullable | |
| `occupation` | `VARCHAR(255)` nullable | "công việc hiện tại" — Ngọc note. |
| `avatar_url` | `TEXT` nullable | |
| `birthday` | `DATE` nullable | |
| `gender` | `VARCHAR(10)` nullable | `male` / `female` / `other` |
| `address` | `TEXT` nullable | |
| `password_hash` | `VARCHAR(255)` nullable | bcrypt khi admin set pwd |
| `password_set` | `BOOLEAN` | derived: `password_hash IS NOT NULL` |
| `last_login_at` | `TIMESTAMPTZ` nullable | |
| `status` | `VARCHAR(20)` | `active` / `suspended` / `graduated` / `inactive` |
| `joined_at` | `TIMESTAMPTZ` | |
| `source` | `VARCHAR(20)` | `event_signup` / `manual` / `import` / `api` |
| `created_at`, `updated_at` | `TIMESTAMPTZ` | |

**Quy tắc nghiệp vụ:**
- `personal_seq` cấp tự động bằng SEQUENCE / atomic counter, KHÔNG để FE chỉ định.
- `group_seq = ceil(personal_seq / 20)` (default rule). Nếu khách yêu cầu logic khác (vd theo chương trình) → BE override.
- KHÔNG phân nhóm theo địa lý — chỉ theo thứ tự thời gian gia nhập.
- Khi tạo member thứ 21 của 1 nhóm → tự khởi tạo nhóm mới.

#### `member_role_codes` (append-only)

Mã chức vụ / khoá học song song. **Không sửa cột cũ**, luôn tạo cột mới.

| Field | Type | Note |
|---|---|---|
| `id` | UUID | PK |
| `member_id` | UUID | FK → members |
| `code` | `VARCHAR(60)` | Mã đầy đủ. VD `"mentor-7"`, `"master-1"`, `"ngd-12"`. |
| `category` | `VARCHAR(20)` | `mentor` / `master` / `educator` / `course` / `other` |
| `label` | `VARCHAR(120)` | Tên hiển thị. VD "Mentor 7". |
| `issued_at` | `TIMESTAMPTZ` | |
| `issued_by` | `VARCHAR(100)` nullable | |
| `ref_event_id` | UUID nullable | |
| `ref_course_id` | UUID nullable | |

Lưu ý khách: 1 thành viên đời ~10 mã loại này là nhiều.

#### `member_groups`

| Field | Type | Note |
|---|---|---|
| `id` | UUID | PK |
| `group_seq` | `INT` | UNIQUE |
| `name` | `VARCHAR(120)` nullable | Admin label optional |
| `master_code` | `VARCHAR(40)` nullable | "master-N" |
| `leader_member_id` | UUID nullable | FK → members |
| `member_ids` | `JSON` array | (hoặc dùng join table `member_group_members`) |
| `created_at` | `TIMESTAMPTZ` | |
| `closed_at` | `TIMESTAMPTZ` nullable | khi đủ 20 người → đóng |

#### `member_signup_requests`

Yêu cầu cấp mã từ luồng B (đăng ký mã mới).

| Field | Type |
|---|---|
| `id` | UUID PK |
| `full_name` | `VARCHAR(255)` |
| `phone` | `VARCHAR(20)` |
| `email`, `occupation` | nullable |
| `from_event_id`, `from_registration_id` | UUID nullable |
| `status` | `pending` / `approved` / `rejected` |
| `reviewed_by`, `reviewed_at`, `reject_reason` | nullable |
| `issued_member_code` | `VARCHAR(40)` nullable | khi approve |
| `created_at` | `TIMESTAMPTZ` |

#### `member_history` (timeline)

Mọi sự kiện trong đời thành viên link về mã định danh.

| Field | Type |
|---|---|
| `id` | UUID PK |
| `member_id` | UUID FK |
| `member_code` | `VARCHAR(40)` (denorm cho query nhanh) |
| `kind` | enum: `event_checkin` / `service_used` / `product_bought` / `course_completed` / `role_issued` / `payment_in` / `debt_recorded` / `debt_settled` / `rating_given` / `note` |
| `title` | `VARCHAR(255)` |
| `description` | `TEXT` nullable |
| `amount_vnd` | `BIGINT` nullable |
| `rating` | `SMALLINT` nullable (1–5) |
| `ref_event_id`, `ref_registration_id`, `ref_service_id`, `ref_product_id` | UUID nullable |
| `variant` | `VARCHAR(120)` nullable | Size/màu cho `product_bought` |
| `ref_status` | `VARCHAR(60)` nullable | "đã đăng ký" / "đã mua" / "đã hủy" — Ngọc note |
| `occurred_at` | `TIMESTAMPTZ` |
| `created_at` | `TIMESTAMPTZ` |
| `created_by` | `VARCHAR(100)` nullable |

**Index gợi ý**: `(member_id, occurred_at DESC)` cho timeline; `(member_code)` cho lookup; partial index `WHERE kind='debt_recorded'` cho dashboard nợ.

### 2.2 Endpoints Members

| Method | Path | Note |
|---|---|---|
| `GET` | `/community-hub/members` | List, filter `keyword`, `status`, `group_seq`, `rank`, paginate. |
| `GET` | `/community-hub/members/{id}` | Detail, kèm `roleCodes[]` và stats tóm tắt. |
| `GET` | `/community-hub/members/by-code/{member_code}` | Lookup cho luồng C login. |
| `POST` | `/community-hub/members` | Tạo thủ công (admin). Body: full_name, phone, email, occupation, optional master_of_group. BE tự cấp `personal_seq`/`member_code`. |
| `PATCH` | `/community-hub/members/{id}` | Update profile / status. |
| `POST` | `/community-hub/members/{id}/password` | Admin set/reset pwd. Body: `{ password }`. BE bcrypt. |
| `POST` | `/community-hub/members/{id}/role-codes` | Append mã chức vụ. Body: `{ code, category, label, ref_event_id?, ref_course_id? }`. KHÔNG sửa cột cũ — luôn append. |
| `POST` | `/community-hub/members/login` | Luồng C. Body: `{ memberCode, password }`. Trả JWT/session + member object. **Yc 5/5: login bằng mã, không phải SĐT/email.** |
| `POST` | `/community-hub/members/forgot-password` | Giai đoạn đầu: chỉ ghi nhận yêu cầu, gửi notification cho admin để reset thủ công. **Yc 5/5: KHÔNG OTP tự động ở MVP** (xem câu hỏi mở mục 7). |

### 2.3 Endpoints Member Signup Requests (luồng B)

| Method | Path | Note |
|---|---|---|
| `GET` | `/community-hub/member-signup-requests` | List, filter `status`. |
| `POST` | `/community-hub/member-signup-requests` | User submit yêu cầu cấp mã. Public route (không cần auth). Optional `from_event_id`. |
| `POST` | `/community-hub/member-signup-requests/{id}/approve` | Admin approve → tạo `members` record + cập nhật `issued_member_code`. Trả member mới. |
| `POST` | `/community-hub/member-signup-requests/{id}/reject` | Body: `{ reason }`. |

### 2.4 Endpoints Member History

| Method | Path | Note |
|---|---|---|
| `GET` | `/community-hub/members/{id}/history` | Filter `kind`, `from_date`, `to_date`. Order DESC. Paginate. |
| `POST` | `/community-hub/members/{id}/history` | Append item. Body theo shape `MemberHistoryItem` (chỉ trừ `id` / `created_at`). |
| `GET` | `/community-hub/members/{id}/stats` | Trả `MemberStats`: totalEvents, totalSpent, totalDebt, totalServices, averageRating, memberSince. |

### 2.5 Auto-create history khi event-related action xảy ra

BE tự append `member_history` row khi:
- `event_registration` chuyển status sang `confirmed` (kèm `member_code` non-null) → kind=`event_checkin` (nếu đã check-in) hoặc `note` (đăng ký).
- `event_registration.payment_proof.status = approved` → kind=`payment_in`, `amount_vnd`=`total_amount`.
- Admin issue role code mới → kind=`role_issued`.
- Khoá học completed → kind=`course_completed`.
- Service usage tracked (đã có CheckinServiceTracker FE) → kind=`service_used`.

Để timeline luôn đầy đủ mà không cần FE viết.

---

## 3. Comments module ⭐ MỚI [P0]

> Yc 5/5: bình luận GIỮ VĨNH VIỄN, không trôi. Là kênh CSKH (khách hỏi → admin trả lời tại đây).

### 3.1 Schema `event_comments`

| Field | Type | Note |
|---|---|---|
| `id` | UUID PK | |
| `event_id` | UUID FK → events | indexed |
| `parent_id` | UUID nullable | reply 1 cấp |
| `author_name` | `VARCHAR(120)` | |
| `author_phone` | `VARCHAR(20)` nullable | để admin liên hệ lại |
| `author_member_code` | `VARCHAR(40)` nullable | nếu user login bằng mã |
| `author_role` | `VARCHAR(20)` | `guest` / `member` / `admin` / `moderator` |
| `content` | `TEXT` | plain text, BE **escape HTML** trước khi store hoặc khi serve |
| `created_at` | `TIMESTAMPTZ` | |
| `updated_at` | nullable | |
| `is_hidden` | `BOOLEAN` | default false. Admin ẩn nhưng KHÔNG xoá. |
| `hidden_reason` | `TEXT` nullable | |
| `status` | `VARCHAR(20)` | `pending` / `approved` / `rejected`. Default `approved` — nếu event có `comments_moderated=true` và author là `guest` thì FE submit với status=`pending`. |
| `reviewed_by`, `reviewed_at` | nullable | |

**Yc 5/5 quan trọng**: KHÔNG có endpoint `DELETE`. Chỉ có hide/unhide. Bảo đảm "giữ vĩnh viễn".

### 3.2 Endpoints

| Method | Path | Note |
|---|---|---|
| `GET` | `/community-hub/events/{event_id}/comments` | Public. Query params: `include_hidden=false` (default), `status=approved` (default). Sort by `created_at ASC`. |
| `POST` | `/community-hub/events/{event_id}/comments` | Public. Body: `{ parentId?, authorName, authorPhone?, authorMemberCode?, authorRole, content }`. Nếu `event.comments_moderated=true` AND `authorRole=guest` → BE tự set `status='pending'`. |
| `POST` | `/community-hub/comments/{id}/hide` | Admin. Body: `{ reason? }`. |
| `POST` | `/community-hub/comments/{id}/unhide` | Admin. |
| `POST` | `/community-hub/comments/{id}/approve` | Admin (chỉ khi moderated). |
| `POST` | `/community-hub/comments/{id}/reject` | Admin. |

### 3.3 Anti-spam (đề xuất phase 2, không phải P0)

- Rate limit POST cùng `author_phone` hoặc IP: 5 cmt / 10 phút.
- Honey pot field hoặc Cloudflare Turnstile.
- Phase 1: nếu event public traffic thấp thì bỏ qua, dựa moderation flag là đủ.

---

## 4. Dynamic Fields — `multi_select` [P1]

FE đã extend type `multi_select` cho field "size áo / màu áo / multi-choice" (yc 5/5).

- BE không cần đổi schema vì `dynamic_fields` đã store JSON.
- Khi user submit: `dynamicFieldValues[fieldId]` cho `multi_select` lưu dạng chuỗi `"opt1||opt2||opt3"` (delimiter `||`).
- BE giữ nguyên dạng đó trong `event_registrations.dynamic_field_values`.
- Báo cáo / export: cần tách `||` để liệt kê.

---

## 5. Reports / Báo cáo [P2 — phase sau]

Yc 5/5 mục 4: làm tổng thể trước, chi tiết sau. FE đã có khung reports nhưng cần BE-side aggregation.

### 5.1 Báo cáo theo sản phẩm / dịch vụ (Ngọc note rõ)

Cần endpoint mới:

```
GET /community-hub/reports/products?from_date=&to_date=
```

Trả mỗi product/service:
- Số người mua / đăng ký
- Số lượng tổng
- Variant breakdown (size, màu, multi_select option)
- Trạng thái breakdown: bao nhiêu "đã đăng ký", "đã mua", "đã hủy"

### 5.2 Báo cáo chi tiết từng sự kiện

Đã có export Excel ở FE `EventDetailPage.exportRegistrationsToExcel`. BE cần endpoint server-side gen file Excel với:
- Tất cả dynamic field columns
- Tất cả add-on columns (split theo group)
- Cột flow + memberCode
- Cột payment status

### 5.3 Báo cáo thành viên (Lợi note tách riêng)

```
GET /community-hub/reports/members?event_id=&from=&to=
```

Trả: list thành viên đã tham gia event(s) với lịch sử attended count, total spent, trạng thái nợ.

### 5.4 Báo cáo tổng thể tháng / nhóm / hạng

```
GET /community-hub/reports/overview?period=month|year&group_seq=&rank=
```

---

## 6. Migration & rollout

### Tuần này (đến 9/5) [P0]

1. Migrate `events` table với 5 cột mới (1.1) — DEFAULT thuận lợi để không cần backfill.
2. Migrate `event_registrations` với 4 cột mới (1.4) — DEFAULT cho cũ.
3. Tạo bảng `members`, `member_role_codes`, `member_groups`, `member_signup_requests`, `member_history` (mục 2.1).
4. Tạo bảng `event_comments` (mục 3.1).
5. Mở các endpoint:
   - **GET/POST** comments (mục 3.2) — FE đang fallback localStorage; ngay khi BE up, FE tự dùng API thay localStorage (cần bổ sung `EventCommentsService.ts` ở FE — TODO ngắn).
   - **POST `member-signup-requests`** + admin approve/reject — bổ sung CTA "Đăng ký mã thành viên" public.
   - **POST `members/login`** — luồng C login.
6. Thêm cron / job tự append `member_history` cho action có sẵn (registration confirm, payment approve…).

### Tuần kế (10/5–17/5) [P1]

7. Reports endpoints (mục 5).
8. Admin set password endpoint + UI.
9. Auto-promote: khi `event_registration.flow=member_login` → tự append `member_history` kind=`event_checkin` khi check-in.

### Sau đó [P2]

10. Anti-spam comments.
11. Forgot-password OTP tự động (giai đoạn đầu manual như yc khách 5/5).

---

## 7. Câu hỏi cần làm rõ với khách (gộp từ doc)

> FE đã ghi 7 câu trong `requirements_summary.md` mục 7. BE sẽ block tới khi có câu trả lời cho:

1. **Các đầu hạng còn lại của mã định danh** (ngoài đầu `6`) là gì? Mapping prefix → hạng chính thức? FE tạm derive `rank = personal_seq[0]` — nếu khách có rule khác (vd hạng `1` = thử nghiệm, hạng `7` = honour) cần trả lời.
2. **Format trưởng nhóm** chính xác: `master-N` hay `<member_code>-master-N` (đính kèm vào mã chính)? FE đang dùng cột riêng.
3. **Quên mật khẩu phase 2**: OTP SMS / email tự động hay vẫn manual qua admin?
4. **Bình luận**: cần moderation **mặc định** không, hay để admin từng event tự bật? FE để mặc định off, admin tự bật.
5. **Báo cáo export format**: web / PDF / Excel? FE đang Excel.
6. **Phân quyền nội bộ**: bao nhiêu role (admin, super-admin, mentor, master…)?
7. **Ghi nợ / tín dụng đen**: khách có muốn track? Có vấn đề pháp lý không? FE đã có schema (`MemberHistoryKind=debt_recorded/debt_settled`) nhưng UI ẩn cho đến khi khách confirm.
8. **"wit-house"** (Lợi note): tên đối tác / địa điểm / dự án nào?

---

## 8. Đối chiếu với deliverables FE

Branch `community-hub`, các file đã được FE thêm/sửa:

| Yc 5/5 | FE file | Status |
|---|---|---|
| Block-based content editor (mục 1) | [ContentBlocksBuilder.tsx](../../../src/pages/CommunityHub/Events/components/ContentBlocksBuilder.tsx) | ✅ Builder UI sẵn sàng |
| Block render public (mục 1) | [ContentBlocksRenderer.tsx](../../../src/pages/CommunityHub/Events/components/ContentBlocksRenderer.tsx) | ✅ Mounted ở [ShareEventPage](../../../src/pages/ShareEventPage/index.tsx) |
| 3 luồng đăng ký (mục 2) | [RegistrationFlowSwitcher.tsx](../../../src/pages/CommunityHub/Events/components/RegistrationFlowSwitcher.tsx) | ✅ Mounted ở ShareEventPage; admin chọn flows trong EventFormPage section 6 |
| Mã định danh + chức vụ (mục 3) | [Members/types.ts](../../../src/pages/CommunityHub/Members/types.ts), [codeUtils.ts](../../../src/pages/CommunityHub/Members/codeUtils.ts), [storage.ts](../../../src/pages/CommunityHub/Members/storage.ts) | ✅ Skeleton localStorage |
| Member admin list + duyệt yêu cầu | [MemberListPage.tsx](../../../src/pages/CommunityHub/Members/MemberListPage.tsx) | ✅ Route `/ch_members` |
| Member detail + timeline | [MemberDetailPage.tsx](../../../src/pages/CommunityHub/Members/MemberDetailPage.tsx) | ✅ Route `/ch_members/:id`, click tháng/ngày filter timeline (yc 3.3) |
| Bình luận (mục 1, kênh CSKH) | [EventComments.tsx](../../../src/pages/CommunityHub/Events/components/EventComments.tsx) | ✅ Mounted public + admin tab |
| `multi_select` field type (size áo / màu / món) | [DynamicFieldsBuilder.tsx](../../../src/pages/CommunityHub/Events/components/DynamicFieldsBuilder.tsx), [DynamicFieldsRenderer.tsx](../../../src/pages/CommunityHub/Events/components/DynamicFieldsRenderer.tsx) | ✅ Có quick-presets size/màu/món |
| Cờ test event | [EventFormPage.tsx](../../../src/pages/CommunityHub/Events/EventFormPage.tsx) sidebar "Cờ hiển thị" | ✅ Filter ở [PublicEvents](../../../src/pages/PublicEvents/index.tsx), [ShareEventPage](../../../src/pages/ShareEventPage/index.tsx), banner cảnh báo ở [EventDetailPage](../../../src/pages/CommunityHub/Events/EventDetailPage.tsx) |
| SĐT liên hệ trên trang | đã có sẵn `event.contactPerson.phone` | ✅ DONE từ trước |
| Login bằng mã (luồng C) | trong RegistrationFlowSwitcher → memberStorage.loginByCode | ✅ FE skeleton; BE cần endpoint `members/login` |

---

## 9. Service layer FE chuyển sang API khi BE sẵn sàng

Pattern hiện tại: `eventStorage.*Async()` gọi API, fallback localStorage. Members + Comments cũng theo pattern này. Khi BE up:

1. **Members**: thêm `MemberService.ts` ở `src/services/`. Update `Members/storage.ts` → gọi service trước, fallback localStorage.
2. **Comments**: thêm `EventCommentService.ts`. Update `EventComments.tsx`'s `eventCommentsStorage` → gọi service.
3. **Event extras**: `eventStorage` đã proxy sang API; chỉ cần BE trả thêm 5 field — FE auto pick up qua `normalizeEvent()` (đã spread `...e`).

Không cần FE đổi gì khi BE đã thêm field — các field mới sẽ tự `undefined` ở record cũ, FE đã handle.

---

**Tóm tắt deliverable BE [P0]**: 5 field events + 4 field event_registrations + 5 bảng members/comments + 4 endpoint groups (members CRUD, member-signup-requests, member-login, event-comments). Sau đó có thể demo end-to-end yc 5/5.
