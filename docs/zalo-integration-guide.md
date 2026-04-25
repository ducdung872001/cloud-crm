# Zalo Integration — Step-by-step Guide

Hướng dẫn triển khai tích hợp Zalo vào MentorHub, bao gồm: Zalo OA, Zalo
Developer App, Zalo Mini App, OAuth Login, Webhook.

**Thời gian ước tính:** 5-7 ngày làm việc (bao gồm chờ Zalo duyệt OA 1-2 tuần).

> Doc này dùng chung với [Zalo Strategy](./zalo-integration-strategy.md) và
> [OA Templates](./zalo-oa-templates.json).

---

## 0. Chuẩn bị

### Tài khoản & giấy tờ

- [ ] **Tài khoản Zalo cá nhân** (sẽ làm admin OA)
- [ ] **Giấy phép kinh doanh Reborn JSC** (bản scan)
- [ ] **CCCD/CMND** người đại diện pháp lý
- [ ] **Số tài khoản ngân hàng công ty** (cho verification)
- [ ] **Domain đã verified**: `mentorhub.vn` và `api.mentorhub.vn` (sau sẽ whitelist)
- [ ] **Hình ảnh:** Logo 200x200px + cover 1200x628px theo brand guidelines

### Công cụ

- [ ] `curl` hoặc Postman để test API
- [ ] ngrok (để expose local webhook khi dev)
- [ ] Zalo app trên điện thoại (để test OA + Mini App)

---

## 1. Đăng ký Zalo Official Account (OA)

**Mục tiêu:** OA "MentorHub · Học cùng chuyên gia" để gửi push + chatbot.

### 1.1 Tạo OA

1. Vào https://oa.zalo.me → Đăng nhập bằng Zalo cá nhân
2. Click **"Tạo Official Account"**
3. Chọn loại: **"Doanh nghiệp"**
4. Điền thông tin:
   - Tên OA: `MentorHub · Học cùng chuyên gia`
   - Category: `Giáo dục > Đào tạo trực tuyến`
   - Mô tả: "Nền tảng đào tạo 1:1 từ các chuyên gia hàng đầu Việt Nam"
   - Logo + cover (upload)
5. Submit → Zalo gửi xác nhận qua Zalo chat của admin

### 1.2 Xác minh doanh nghiệp (để unlock Transaction Message)

OA mới chỉ có "Broadcast Message" (gửi cho follower chung). Muốn gửi
**Transaction Message** (push cá nhân theo user_id) cần **xác minh doanh
nghiệp**:

1. Vào OA Console → **Cài đặt → Xác minh**
2. Upload: Giấy phép KD + CCCD đại diện + CMND người quản lý
3. Chờ Zalo review 3-5 ngày làm việc
4. Sau khi duyệt, OA có badge ✓ xanh + unlock transaction API

### 1.3 Lấy Access Token

1. Vào **Cài đặt → API → Access Token**
2. Click **"Tạo App để lấy access token"**
3. App được tạo trong `developers.zalo.me` (xem bước 2)
4. Copy `ACCESS_TOKEN` → lưu vào `.env`:

```bash
ZALO_OA_ACCESS_TOKEN=xxxxxxxxxxxx
```

**Chú ý:** Access token hết hạn sau 90 ngày. Phải refresh bằng `refresh_token`.
BE cần job cron daily refresh token, lưu DB.

---

## 2. Tạo Zalo Developer App (cho OAuth + Mini App)

**Mục tiêu:** App ID để mentor login bằng Zalo và nhúng Mini App.

### 2.1 Tạo app

1. Vào https://developers.zalo.me → Đăng nhập
2. **Tạo ứng dụng** → Loại: **"Social"**
3. Điền:
   - App Name: `MentorHub`
   - Category: `Education`
   - Description
   - Logo + cover
4. Ghi lại:

```bash
ZALO_APP_ID=1234567890123
ZALO_APP_SECRET=xxxxxxxxxxxxxxxxxx
```

### 2.2 Cấu hình OAuth

1. Trong app → **Đăng nhập → Thiết lập**
2. **Callback URL:**
   ```
   https://api.mentorhub.vn/api/v1/zalo/oauth/callback
   http://localhost:8080/api/v1/zalo/oauth/callback   (dev)
   ```
3. **Permission yêu cầu:**
   - `id` (required)
   - `name` (required)
   - `picture` (để hiển thị avatar)
   - `phone` (optional, cần app duyệt mới được)

### 2.3 Link với OA (để gọi Transaction Message)

1. Trong app → **Dịch vụ → Kết nối OA**
2. Chọn OA "MentorHub · Học cùng chuyên gia" vừa tạo
3. Cấp quyền: `oa.message`, `oa.message.transaction`

---

## 3. Đăng ký Zalo Mini App

**Mục tiêu:** Mini App chạy trong Zalo, không cần App Store.

### 3.1 Tạo Mini App

1. Trong Zalo Developer App → **Dịch vụ → Mini Program → Tạo mới**
2. Điền:
   - Name: `MentorHub`
   - Intro: "Quản lý khoá học, học viên, lịch giảng dạy ngay trong Zalo"
   - Icon 180x180px
   - Giới thiệu media (screenshot Mini App)

### 3.2 Cấu hình

1. **Entry URL:** `https://mini.mentorhub.vn` (domain production cho Mini App)
2. **Whitelist domain** (domain mà Mini App gọi API):
   ```
   https://api.mentorhub.vn
   https://img.vietqr.io
   https://img.youtube.com (nếu embed)
   ```
3. **Scope**:
   - `scope.userInfo`
   - `scope.userPhonenumber`
   - `scope.openProfile`

### 3.3 Build Mini App

Trong repo FE hiện tại (React), build riêng:

```bash
# package.json script
"build:zalo-mini": "vite build --mode zalo-mini --outDir dist-zalo"

# Deploy dist-zalo/ lên https://mini.mentorhub.vn
```

Dùng `zmp-sdk` thay placeholder hiện tại:

```bash
yarn add zmp-sdk
```

Trong `src/pages/Zalo/_shared/zmpSdk.ts`, thay dòng:

```ts
const realSdk: ZmpSdk = mockSdk; // TODO
```

bằng:

```ts
import { getUserInfo, openShareSheet, openUrl, ... } from "zmp-sdk/apis";
const realSdk: ZmpSdk = { getUserInfo, openShareSheet, openUrl, ... };
```

### 3.4 Submit duyệt

1. Zalo Developer Console → **Mini Program → Phát hành**
2. Upload version (production URL + manifest)
3. Chờ Zalo review **3-7 ngày**
4. Sau duyệt → app public tại `zalo.me/s/{APP_ID}/mentorhub`

---

## 4. Cấu hình Webhook OA

**Mục tiêu:** BE nhận event khi user follow/unfollow OA + chat với OA.

### 4.1 Tạo endpoint BE

Đã có trong `backend-stubs/src/routes/zalo.ts` — `POST /webhook/zalo`.

Khi deploy production, URL sẽ là:
```
https://api.mentorhub.vn/webhook/zalo
```

### 4.2 Đăng ký với Zalo

1. Zalo OA Console → **API → Webhook**
2. **Webhook URL:** `https://api.mentorhub.vn/webhook/zalo`
3. **Secret Token:** Zalo generate → lưu:

```bash
ZALO_OA_WEBHOOK_SECRET=xxxxxxxxxxxx
```

4. Chọn events subscribe:
   - `user_send_text` (chatbot)
   - `follow` / `unfollow`
   - `user_send_image` (nếu support)

### 4.3 Verify signature (security)

Trong `routes/zalo.ts`, webhook handler phải verify HMAC-SHA256:

```ts
import crypto from "node:crypto";

function verifyZaloSignature(req: Request): boolean {
  const signature = req.headers["x-zevent-signature"] as string;
  const expected = crypto
    .createHmac("sha256", config.zalo.webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return signature === `mac=${expected}`;
}
```

---

## 5. Đăng ký & duyệt Transaction Message Templates

**Mục tiêu:** 7 mẫu tin push (xem `zalo-oa-templates.json`).

### 5.1 Submit từng template

Với mỗi template trong `zalo-oa-templates.json`:

1. OA Console → **Tin nhắn → Tin giao dịch → Tạo mẫu**
2. Copy nội dung `template` từ JSON
3. Paste vào Zalo UI
4. Điền:
   - **Tên mẫu:** `displayName` (vd "Học viên mới đăng ký khoá")
   - **Use case:** mô tả khi nào gửi
   - **Preview:** dùng `preview` string
5. Submit → chờ Zalo review **2-5 ngày**

### 5.2 Sau khi duyệt

Zalo cấp `template_id` dạng `abc123def456...`. Update vào file:

```json
{
  "key": "new_enrollment",
  "templateId": "abc123def456"  // <- từ TBD_NEW_ENROLLMENT
}
```

### 5.3 Gọi API gửi

```bash
curl -X POST https://openapi.zalo.me/v3.0/oa/message/transaction \
  -H "access_token: $ZALO_OA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": { "user_id": "USER_ZALO_ID" },
    "message": {
      "template_id": "abc123def456",
      "template_data": {
        "studentName": "Phạm Thu Hà",
        "courseName": "Microservices",
        "registered": 23,
        "capacity": 30,
        "studentCompany": "TPBank",
        "detailUrl": "https://zalo.me/s/APP_ID/mentorhub?screen=students"
      }
    }
  }'
```

---

## 6. Zalo Login flow (OAuth 2.0)

### 6.1 Flow tổng quan

```
Mentor click "Đăng nhập với Zalo"
  ↓
FE gọi GET /api/v1/zalo/oauth/login
  ↓
BE redirect → https://oauth.zaloapp.com/v4/permission?app_id=...&redirect_uri=...
  ↓
Mentor authorize trong Zalo app
  ↓
Zalo redirect → https://api.mentorhub.vn/api/v1/zalo/oauth/callback?code=XXX
  ↓
BE exchange code → access_token
  ↓
BE GET https://graph.zalo.me/v2.0/me?access_token=XXX → lấy profile
  ↓
BE tạo hoặc link mentor account với Zalo user_id
  ↓
BE redirect về FE với session cookie
```

### 6.2 Code sample

Đã có stub trong `backend-stubs/src/routes/zalo.ts`. Real impl:

```ts
// Exchange code → access_token
const tokenRes = await fetch("https://oauth.zaloapp.com/v4/access_token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded", secret_key: config.zalo.appSecret },
  body: new URLSearchParams({ app_id: config.zalo.appId, code, grant_type: "authorization_code" }),
});
const { access_token } = await tokenRes.json();

// Get profile
const profileRes = await fetch(`https://graph.zalo.me/v2.0/me?access_token=${access_token}&fields=id,name,picture,phone`);
const profile = await profileRes.json();
```

---

## 7. ZaloPay payment gateway

### 7.1 Đăng ký merchant

1. Vào https://merchant.zalopay.vn → Đăng ký merchant
2. Cần: GPKD, MST, tài khoản ngân hàng
3. Sau verify → cấp `APP_ID`, `KEY1`, `KEY2`

### 7.2 Sandbox test

Docs: https://docs.zalopay.vn/v2/general/overview.html

Integrate trong `services/zalopay.ts` (chưa có — thêm nếu cần):

```ts
// POST https://sb-openapi.zalopay.vn/v2/create
// body: { app_id, app_user, amount, app_trans_id, embed_data, item, description, bank_code, mac }
```

---

## 8. Testing checklist

Local dev:
- [ ] ngrok expose `localhost:8080` → nhập URL ngrok làm webhook tạm
- [ ] Gọi test endpoint `POST /webhook/zalo` với payload mẫu Zalo cung cấp
- [ ] Test OAuth flow end-to-end với Zalo sandbox account
- [ ] Test push message đến Zalo user của mình

Production rollout:
- [ ] Sau khi Zalo duyệt OA + 7 templates + Mini App
- [ ] Smoke test từng kênh với 1 mentor nội bộ trước
- [ ] Monitor rate: 500 tin/tháng đủ cho mentor đầu tiên không?
- [ ] Set up alerting khi webhook fail
- [ ] Rollback plan: fallback SMS/email nếu Zalo down

---

## 9. Timeline triển khai (đề xuất)

| Tuần | Task | Dependencies |
|---|---|---|
| 1 | Đăng ký OA + submit verify doanh nghiệp | GPKD scan ready |
| 1-2 | Chờ verify OA (3-5 ngày) + tạo Developer App + submit 7 templates | Verify OA xong |
| 2 | Dev BE Zalo endpoints + webhook + OAuth | App ID ready |
| 3 | Dev Mini App (submit Zalo duyệt trong khi dev) | Template duyệt xong |
| 4 | Chờ Mini App approval + hardening + beta test với 5 mentor | Tất cả ở trên |
| 5 | Public release | Approved |

Tổng **~5 tuần** từ zero đến production, trong đó **2 tuần chờ Zalo review**.

---

## 10. Cost estimate

| Hạng mục | Chi phí |
|---|---|
| Tạo OA | Free |
| Verify doanh nghiệp | Free |
| 500 tin transaction/tháng | Free |
| Tin vượt | 300đ/tin × (số mentor × số event/tháng) |
| Mini App | Free |
| ZaloPay phí giao dịch | 1.5% |
| OAuth Login | Free |

Ví dụ: 1000 mentor × 30 tin/tháng = 30k tin → 29,500 tin vượt → **8.85M VND/tháng** cho Zalo push.
Có thể scale xuống bằng cách chỉ push event quan trọng (skip "AI note ready" nếu mentor đang online web).

---

## Tham khảo

- Zalo OA Platform: https://developers.zalo.me/docs/api/official-account-api
- Zalo Mini App: https://mini.zalo.me/documents/
- Zalo Social (Login): https://developers.zalo.me/docs/api/social-api
- ZaloPay: https://docs.zalopay.vn/v2/
- Rate limits: https://developers.zalo.me/docs/api/official-account-api/rate-limit
- OA Pricing: https://oa.zalo.me/product/pricing

---

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `40003 access_token_invalid` | Token hết hạn hoặc sai | Refresh qua `/oauth/access_token` với `refresh_token` |
| `40119 Template not found` | Template chưa duyệt hoặc sai ID | Check OA Console, đảm bảo status = `approved` |
| `40101 Recipient not in OA` | User chưa kết bạn OA | Send lời mời kết bạn OA trước |
| `40120 Rate limit exceeded` | Vượt 500 tin/tháng free | Upgrade OA package hoặc giảm tần suất |
| Mini App blank screen | Whitelist domain thiếu | Add domain vào Mini Program settings |
| Webhook không nhận | Firewall chặn hoặc URL sai | Test bằng `curl` từ ngoài, check Zalo console logs |

---

## Changelog

- **2026-04-24** · v1: Initial guide
