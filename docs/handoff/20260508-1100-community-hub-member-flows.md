---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-08T11:00:00+07:00
slug: community-hub-member-flows
status: open
fe_branch: community-hub
fe_commit: ed7d1ad0
priority: P2
blocking: trang public ShareEventPage tab "Đăng ký tham gia" — luồng B/C (member_signup, member_login)
---

# Community Hub — Member signup & login flows (luồng B + C)

## Bối cảnh

Trên trang public `/crm/events/:slug` (ShareEventPage), khi admin event tick
nhiều luồng đăng ký, user thấy switcher 3 tab:

- **A. `guest`** — đăng ký nhanh, chỉ tên + SĐT. Đã wire qua
  `POST /market/events/public/register` ✓.
- **B. `member_signup`** — user nhập tên/SĐT/email/công việc → gửi yêu cầu cấp
  mã thành viên. Admin duyệt sau → cấp memberCode dạng `STT-nhóm` (vd `5971-300`).
  **Hiện localStorage prototype**, chưa có BE.
- **C. `member_login`** — user nhập memberCode + mật khẩu → verify → auto-fill
  form đăng ký với hồ sơ thành viên đã lưu. **Hiện localStorage prototype, mật
  khẩu lưu raw trong `reborn.ch_member_pwd`** (không production-ready), chưa có BE.

Tester đã hỏi "sao bấm 'Tôi muốn đăng ký mã thành viên mới' mà không thấy gọi
API" — đúng vậy, FE chỉ ghi LocalStorage. Cần BE để 2 luồng B/C hoạt động
cross-browser + an toàn.

## Source code FE liên quan

- Switcher UI: `src/pages/CommunityHub/Events/components/RegistrationFlowSwitcher.tsx`
- Storage prototype: `src/pages/CommunityHub/Members/storage.ts`
- Types: `src/pages/CommunityHub/Members/types.ts`
- Code utils (sinh memberCode): `src/pages/CommunityHub/Members/codeUtils.ts`

---

## BE-1. Member signup request (luồng B)

### User flow
1. User chọn tab "🆔 Tôi muốn đăng ký mã thành viên mới".
2. Nhập tên *, SĐT *, email (optional), công việc (optional) → submit.
3. BE tạo signup request status `pending`, trả về `requestId`.
4. FE hiện confirm "✓ Yêu cầu cấp mã đã gửi. BTC sẽ liên hệ qua SĐT… Mã yêu cầu: …".
5. Admin (W-House) sau đó duyệt request → BE tạo MemberEntity với memberCode mới
   được sinh theo quy tắc `${STT-cá-nhân}-${nhóm}` (xem `codeUtils.ts`).
6. (Optional) BE gửi SMS/email cho user thông báo memberCode chính thức.

### Đề xuất API

```
POST /market/community-hub/members/signup-request/create
  Body: {
    fullName: string,
    phone: string,
    email?: string,
    occupation?: string,
    fromEventId?: string,        // ID event user đang đăng ký (FE hiện có context)
    fromRegistrationId?: string, // nếu user đã đăng ký event đó dạng guest trước
  }
  Response: { code: 0, result: MemberSignupRequest }

GET /market/community-hub/members/signup-request/list
  Query: ?status=pending|approved|rejected&page=1&limit=50
  Auth: admin (Authorization Bearer + Hostname tenant)
  Response: { code: 0, result: { items: MemberSignupRequest[], total: number } }

POST /market/community-hub/members/signup-request/approve?id={reqId}
  Body: { /* optional override fullName, phone, email, occupation */ }
  Auth: admin
  Action: tạo MemberEntity (BE sinh memberCode theo chính sách),
          set request.status=approved, request.issuedMemberCode=<new>,
          (optional) gửi SMS thông báo.
  Response: { code: 0, result: MemberEntity }

POST /market/community-hub/members/signup-request/reject?id={reqId}
  Body: { reason: string }
  Auth: admin
  Response: { code: 0, result: MemberSignupRequest }
```

### Schema `MemberSignupRequest`
Khớp với `src/pages/CommunityHub/Members/types.ts:82-98`:

```ts
{
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string;
  fromEventId?: string;
  fromRegistrationId?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;       // ISO
  rejectReason?: string;
  issuedMemberCode?: string; // chỉ có khi status=approved
  createdAt: string;         // ISO
}
```

### Tenant scope
- Resolve theo header `Hostname` (FE đã gửi qua `fetchConfig.ts` — luôn là
  hostname tenant như `hub.reborn.vn`). Mỗi tenant có signup-request namespace
  riêng.
- Public endpoint create: KHÔNG cần auth (visitor chưa có account).
- List/approve/reject: yêu cầu admin token (W-House Admin role).

### Validate
- `phone`: bắt buộc, ≥ 9 chữ số. Format VN.
- `fullName`: bắt buộc, ≤ 100 ký tự.
- Anti-spam: dùng `phone` làm dedup key — nếu đã có request `pending` cùng SĐT
  trong cùng tenant ngày hôm nay → trả 409 hoặc trả luôn request cũ thay vì
  tạo mới (tránh user spam-click).

---

## BE-2. Member login by code (luồng C)

### User flow
1. User chọn tab "🔑 Đã có mã thành viên".
2. Nhập memberCode (vd `5971-300`) + mật khẩu → submit.
3. BE verify: memberCode tồn tại trong tenant + password match.
4. FE auto-fill form đăng ký event với fullName/phone/email từ MemberEntity.
5. User submit form đăng ký event như luồng A nhưng có `memberCode` trong payload.

### Đề xuất API

```
POST /market/community-hub/members/login-by-code
  Body: { memberCode: string, password: string }
  Auth: KHÔNG (public — login flow), nhưng gửi Hostname để tenant scope.
  Response (success): { code: 0, result: { member: MemberEntity, token?: string } }
  Response (fail):    { code: <non-zero>, message: "Mã không tồn tại" | "Sai mật khẩu" | "Mã chưa được cấp mật khẩu" }

POST /market/community-hub/members/set-password
  Body: { memberCode: string, otpCode: string, newPassword: string }
  Hoặc: { resetToken: string, newPassword: string }   // dùng SMS OTP / email link
  Auth: KHÔNG (user setup mật khẩu lần đầu hoặc reset).

POST /market/community-hub/members/forgot-password
  Body: { memberCode: string, phoneOrEmail: string }
  Auth: KHÔNG.
  Action: gửi OTP/SMS hoặc email reset link.
  Response: { code: 0, message: "OTP đã gửi" }
```

### Bảo mật
- **Mật khẩu BE phải hash (bcrypt/argon2).** FE prototype hiện lưu raw — bug
  bảo mật, MUST không lên production.
- Rate limit `login-by-code`: ví dụ 5 lần / 15 phút / IP. Quá → 429.
- Nếu BE muốn FE giữ session thay vì gọi API mỗi lần thì trả `token` (JWT)
  scope chỉ cho member portal, expire ngắn (~1h).

### Schema `MemberEntity`
Khớp `types.ts:47-79`. BE chỉ cần trả các trường:

```ts
{
  id: string;
  memberCode: string;       // canonical "${personalSeq}-${groupSeq}"
  identity: { personalSeq: string, groupSeq: string, rank: string };
  masterCode?: string | null;
  roleCodes: MemberRoleCode[];
  fullName: string;
  phone: string;
  email?: string;
  occupation?: string;
  avatarUrl?: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  passwordSet: boolean;
  lastLoginAt?: string;     // ISO; BE update mỗi lần login thành công
  // [updated 2026-05-11] đã align với BE: active|suspended|graduated|inactive.
  // BE reply 20260508-1130 ban đầu báo FE = "active|inactive|blocked" — đã không
  // còn đúng từ commit trước; types.ts hiện match BE 100%.
  status: "active" | "suspended" | "graduated" | "inactive";
  joinedAt: string;
  source?: "event_signup" | "manual" | "import" | "api";
  createdAt: string;
  updatedAt: string;
}
```

---

## BE-3. Public events register payload — gắn memberCode

Khi user submit form đăng ký event qua luồng B (signupReqId) hoặc C (memberCode),
FE đã gửi kèm trong body của `POST /market/events/public/register` (xem
`ShareEventPage.tsx` line ~404):

```js
{
  // … các field hiện tại …
  flow: "guest" | "member_signup" | "member_login",
  memberCode: string | undefined,           // luồng C
  memberSignupStatus: "requested" | undefined, // luồng B
}
```

### Yêu cầu BE
- Nếu `flow=member_login` + `memberCode` hợp lệ → link `EventRegistration.memberId`
  với MemberEntity tương ứng. Trả về registration có `memberCode` field.
- Nếu `flow=member_signup` → set `EventRegistration.signupRequestId` (nếu schema
  có), để admin xem registration list thấy "User này đang chờ cấp mã".
- Nếu `flow=guest` → giữ nguyên flow hiện tại, không cần thay đổi.

---

## Mapping FE → BE endpoint

| FE function (storage.ts) | Hiện tại | BE endpoint cần wire |
|---|---|---|
| `createRequest` | localStorage write | `POST /community-hub/members/signup-request/create` |
| `listRequests` (admin tab) | localStorage read | `GET /community-hub/members/signup-request/list` |
| `approveRequest` | localStorage update + `create()` | `POST /community-hub/members/signup-request/approve` |
| `rejectRequest` | localStorage update | `POST /community-hub/members/signup-request/reject` |
| `loginByCode` | check `reborn.ch_member_pwd` | `POST /community-hub/members/login-by-code` |
| `getByCode` | localStorage scan | (BE handle qua login response — FE không cần endpoint riêng) |

## FE side — chờ BE

Khi BE deploy + cấp endpoint, FE sẽ:

1. Thêm method tương ứng vào `EventService` hoặc tạo `MemberService` mới
   (`src/services/MemberService.ts`).
2. Sửa `memberStorage.createRequest`, `loginByCode`, `approveRequest`,
   `rejectRequest` sang pattern API-first / LS-fallback (tham khảo
   `eventStorage` đã làm cho events + comments).
3. Thông báo lại BE để confirm shape match + smoke test.

FE giữ nguyên prototype LS hiện tại cho đến khi BE ready — admin máy A và máy B
sẽ thấy data khác nhau cho 2 luồng này. Đã ghi note trong UI.

## Priority & timeline

- **BE-1 (signup request CRUD)**: P2. Tester chưa block hard ở luồng này nhưng
  khi tenant W-House tổ chức event thực tế, user nhấn "đăng ký mã mới" mà chỉ
  ghi LS thì admin máy khác không duyệt được — hỏng nghiệp vụ.
- **BE-2 (login by code)**: P2-P3. Cần đi kèm BE-1 (member chỉ tạo qua approve).
- **BE-3 (link memberCode vào registration)**: P3. Cosmetic, để admin tab
  registrations thấy được nguồn user.

Đề xuất thứ tự: BE-1 → BE-3 → BE-2 (set-password + login flow).
