---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-11T16:00:00+07:00
slug: members-otp-firebase-sms
status: open
fe_branch: community-hub
priority: P2
related:
  - docs/handoff/20260508-1100-community-hub-member-flows.md (member signup/login flows)
blocking: user không tự đổi mật khẩu được — admin phải gọi điện cấp/báo thủ công
---

# Member OTP qua Firebase SMS — sender `reborn.vn`

## Mục tiêu

Cho user tự xác thực qua mã OTP gửi về SĐT đã đăng ký (Firebase Phone Auth /
Firebase Functions SMS, sender brandname **`reborn.vn`**). 2 use case:

1. **Quên mật khẩu / đặt lại** (luồng C — login by code).
2. **Verify SĐT khi đăng ký mã thành viên mới** (luồng B — confirm sở hữu SĐT
   trước khi admin duyệt, giảm spam request).

FE đã build sẵn UI 2 bước (request → nhập OTP → đặt pwd mới) ở
[`RegistrationFlowSwitcher.ForgotPasswordModal`](src/pages/CommunityHub/Events/components/RegistrationFlowSwitcher.tsx)
nhưng nút "Gửi OTP" / "Đặt mật khẩu mới" hiện **disabled** chờ BE.

## Yêu cầu nghiệp vụ

### A. Cấu hình Firebase

- Dùng Firebase project chung của Reborn (BE đã có credential cho `firebase` module —
  xem `cloud-notification-master` hoặc service tương đương).
- **Sender / brandname**: hiển thị `reborn.vn` trên đầu SMS. Nếu Firebase
  default sender không cho custom brand → fallback dùng gateway SMS khác đã có
  brandname `reborn.vn` đăng ký với nhà mạng VN.
- Nội dung SMS đề xuất (≤ 60 chars để tiết kiệm SMS unit):
  ```
  [reborn.vn] Ma OTP: {code}. Co hieu luc 5 phut. Khong chia se cho nguoi khac.
  ```

### B. OTP lifecycle

- **Mã**: 6 chữ số.
- **TTL**: 5 phút.
- **Rate limit**:
  - Mỗi SĐT: tối đa 3 request / 10 phút, 10 request / 24h.
  - Mỗi IP: tối đa 20 request / giờ.
  - Quá → 429 với `retryAfterSeconds`.
- **Verify retries**: tối đa 5 lần nhập sai → OTP bị huỷ, phải request lại.
- **Lưu**: BE lưu `otp_hash` (SHA-256), không lưu raw. Đối chiếu khi verify.

### C. Tenant scope

Resolve theo header `Hostname` (FE đã gửi qua `fetchConfig`). OTP namespace
riêng từng tenant — `5971-300` ở tenant A khác `5971-300` ở tenant B.

---

## Endpoints đề xuất

### 1. Forgot password — request OTP

```
POST /market/community-hub/members/forgot-password
  Auth: KHÔNG (public)
  Body: { memberCode: string, phoneOrEmail: string }
  Response (success):
    { code: 0, result: { otpId: string, maskedPhone: string, ttlSeconds: 300 } }
  Response (fail):
    - 404 / code≠0 + message="Mã không tồn tại"
    - 422 / message="SĐT/email không khớp với mã"
    - 429 / { code: ≠0, message: "Vượt giới hạn", retryAfterSeconds: 600 }
```

FE flow: user nhập memberCode + phone → BE verify memberCode + phone match →
gửi SMS → trả `otpId` (FE cầm vào step 2).

### 2. Verify OTP + set new password

```
POST /market/community-hub/members/set-password
  Auth: KHÔNG (public, gated bởi OTP)
  Body: { otpId: string, otpCode: string, newPassword: string }
  Response (success): { code: 0, result: { member: MemberEntity } }
  Response (fail):
    - 400 / "Mã OTP sai" (còn N lần thử) — kèm field `remainingAttempts`
    - 410 / "Mã OTP đã hết hạn"
    - 422 / "Mật khẩu yếu" (ít nhất 6 ký tự, không toàn số…)
```

Mật khẩu BE phải bcrypt/argon2 (ko lưu raw).

### 3. Signup verify SĐT (optional — luồng B)

```
POST /market/community-hub/members/signup-request/send-otp
  Auth: KHÔNG (public)
  Body: { phone: string }
  Response: { code: 0, result: { otpId: string, ttlSeconds: 300 } }

POST /market/community-hub/members/signup-request/create
  (đã có ở handoff 20260508-1100)
  Body thêm: { otpId?: string, otpCode?: string }
  Nếu BE muốn force verify SĐT trước khi tạo request → bắt buộc otpId/otpCode.
  Nếu không → giữ optional (admin duyệt sau).
```

FE sẽ điều chỉnh `MemberSignupForm` tích hợp OTP nếu BE bật require này. Hiện
tại có thể skip — admin vẫn duyệt thủ công.

---

## FE đã làm

- UI `ForgotPasswordModal` 2 bước (request OTP → verify + đổi pwd) — disabled
  chờ BE.
- `memberStorage.setPasswordAsync(memberCode, newPassword)` — gọi `MemberService.setPassword`,
  body theo handoff `{ memberCode, otpCode?, resetToken?, newPassword }`. Khi BE
  ready, FE chỉ cần đổi body sang `{ otpId, otpCode, newPassword }` cho khớp shape
  cuối + bật nút.
- `MemberService.forgotPassword({ memberCode, phoneOrEmail })` đã wrap sẵn.

### Sau khi BE deploy

FE sẽ:
1. Đổi shape body `setPassword` từ `{ memberCode, newPassword }` sang
   `{ otpId, otpCode, newPassword }` (response trả member, cập nhật state).
2. Bật `disabled={false}` cho 2 nút "Gửi OTP" + "Đặt mật khẩu mới" trong
   `ForgotPasswordModal`.
3. Thêm hiển thị `maskedPhone` ("đã gửi tới 09xx***272") + countdown TTL.
4. Smoke test trên `hub.reborn.vn`.

---

## Câu hỏi cần BE confirm

1. **Gateway SMS**: dùng Firebase Phone Auth (Google gateway), hay route qua
   provider VN đã có brandname `reborn.vn` (VT, Esms, FPT)? Khác nhau ở chi phí
   + khả năng custom sender.
2. **Phí**: ai trả phí SMS — Reborn central, hay charge từng tenant?
3. **Email fallback**: nếu user có email trong hồ sơ và không có SĐT (corner
   case), có gửi OTP qua email không? FE đã design field "SĐT hoặc email" để
   bao 2 case.
4. **Throttle response**: BE trả 429 với header `Retry-After` chuẩn HTTP, hay
   body `retryAfterSeconds`? FE đề xuất body để consistent với pattern cũ.

## Estimate

BE ~2-4h:
- Firebase Functions / SMS gateway integration (nếu chưa có).
- 3 endpoints (forgot-password, set-password, optional send-otp).
- OTP storage table + hash + rate limit.
- Bcrypt password column trên member entity (nếu chưa có).

## Test cases

1. User nhập đúng memberCode + SĐT match → BE gửi SMS có brandname `reborn.vn`
   + 6 số → user nhập OTP đúng → đổi pwd thành công → login bằng pwd mới OK.
2. User nhập sai SĐT (không khớp memberCode) → 422 "SĐT không khớp".
3. Spam 4 lần / 10 phút → lần 4 trả 429 + retryAfterSeconds.
4. OTP nhập sai 5 lần → BE huỷ OTP, FE quay về step 1 yêu cầu request mới.
5. OTP quá 5 phút → 410 "Hết hạn".
6. Tenant A request OTP cho `5971-300`, tenant B cũng có `5971-300` riêng →
   2 OTP độc lập, không lẫn.
