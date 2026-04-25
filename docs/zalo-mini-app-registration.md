# Zalo Mini App — Hướng dẫn đăng ký & publish

> Tài liệu tập trung **riêng** về quy trình đăng ký MentorHub lên Zalo Mini App
> Store. Kèm checklist, timeline, chi phí, troubleshooting.
>
> Cho các chủ đề khác: xem [zalo-integration-strategy.md](./zalo-integration-strategy.md)
> (chiến lược tích hợp) và [zalo-integration-guide.md](./zalo-integration-guide.md)
> (guide tổng: OA, OAuth, webhook, ZaloPay).
>
> Cập nhật: 2026-04-24 · Maintainer: Phan Đức Dũng

---

## TL;DR — 4 giai đoạn, 3-4 tuần, chi phí ~1tr/năm

```
[1] Chuẩn bị        ──┐
     ↓                │  ~1 tuần (song song)
[2] Tạo app          ─┘
     ↓
[3] Build + upload   ──── 2-3 ngày
     ↓
[4] Test + submit    ──── 1-2 tuần (bao gồm Zalo review)
     ↓
PUBLISHED @ zalo.me/s/{APP_ID}/mentorhub
```

Zalo **không thu phí** publish. Chi phí chính: domain + hosting.

---

## Giai đoạn 1 · Chuẩn bị giấy tờ + URL (1-2 ngày)

> Bắt buộc doanh nghiệp verified — Zalo không cho publish cá nhân.

### Checklist giấy tờ

- [ ] **Giấy phép kinh doanh Reborn JSC** (scan PDF, độ phân giải ≥300 DPI)
- [ ] **CMND/CCCD người đại diện pháp lý** (2 mặt)
- [ ] **Mã số thuế** Reborn JSC
- [ ] Người đại diện có **tài khoản Zalo active** ≥6 tháng (Zalo check để chống fake account)

### Checklist hạ tầng

- [ ] **Domain production** đã mua + trỏ DNS + có SSL (Let's Encrypt free):
  - `https://mini.mentorhub.vn` — host Mini App build
  - `https://api.mentorhub.vn` — BE API (hiện đang dev ở `localhost:8080`)
- [ ] **Privacy Policy** public tại: `https://mentorhub.vn/privacy`
- [ ] **Terms of Service** public tại: `https://mentorhub.vn/terms`

### Checklist assets

- [ ] **App icon** 180×180 px PNG, nền trong suốt, brand Reborn
- [ ] **App cover** 1200×628 px (cho Store listing)
- [ ] **3-5 screenshots Mini App** (size 1125×2436 hoặc 828×1792)
- [ ] **Demo video 30-60s** (optional nhưng tăng tỷ lệ duyệt)

### Action plan

Chưa có domain? Mua ngay tại:
- **Mắt Bão** (matbao.net) — `.vn` ~800k/năm
- **Namecheap** — `.com` ~$12/năm

Chưa có privacy/terms? Dùng template có sẵn:
- **Termly.io** — generator free, export HTML → host trên mentorhub.vn
- Hoặc copy template từ các mentor platform khác rồi custom

---

## Giai đoạn 2 · Tạo app trên Zalo Developer Console (1 ngày)

### 2.1 Đăng ký Developer account

1. Vào https://developers.zalo.me/
2. Đăng nhập bằng Zalo cá nhân của người đại diện
3. Click **"Trở thành Nhà phát triển"** → chọn **"Doanh nghiệp"**
4. Upload GPKD + điền info:
   ```
   Tên công ty:     Công ty Cổ phần Reborn JSC
   MST:             0313xxxxxxxx
   Địa chỉ:         Toà Metro Star, Thủ Đức, TP. HCM
   Email:           tech@reborn.vn
   Điện thoại:      (028) 3812 3456
   ```
5. Submit → **chờ Zalo verify 1-3 ngày làm việc**

### 2.2 Tạo Mini Program

> **Lưu ý:** Chọn loại **"Mini Program"**, KHÔNG phải "Social App".
> Social App = dùng để login/share từ web bên ngoài, không phải app trong Zalo.

1. Dashboard → **Tạo ứng dụng** → chọn **"Mini Program"**
2. Điền form:

   | Trường | Giá trị |
   |---|---|
   | Tên Mini App | MentorHub |
   | Category | Giáo dục & Đào tạo |
   | Mô tả ngắn (100 ký tự) | Quản lý khoá học cho mentor — ngay trong Zalo |
   | Mô tả dài | (3-5 câu, nhấn mạnh value: tạo khoá, nhận AI note, nhắc lịch cho HV, quản lý ticket — tất cả trong Zalo không cần cài app) |
   | Logo 180x180 | upload file icon đã chuẩn bị |

3. Click tạo → nhận **App ID** (13 chữ số) + **App Secret**

### 2.3 Lưu credentials vào `.env`

```bash
# .env (BE production)
ZALO_APP_ID=1234567890123
ZALO_APP_SECRET=xxxxxxxxxxxxxxxxxx
ZALO_WEBHOOK_SECRET=xxxxxxxxxxxxx
```

**CẢNH BÁO:** App Secret tuyệt đối **không commit vào git**. Lưu trong
secret manager (AWS Secrets Manager / Vault / GitHub Actions Secrets).

### 2.4 Cấu hình Mini Program

Trong app mới tạo → sidebar **Mini Program** → tab **"Cấu hình"**:

#### Tab "Thông tin cơ bản"
| Trường | Giá trị |
|---|---|
| Homepage URL | `https://mini.mentorhub.vn` |
| Privacy Policy URL | `https://mentorhub.vn/privacy` |
| Terms URL | `https://mentorhub.vn/terms` |
| Support email | `support@mentorhub.vn` |
| Support hotline | `(028) 3812 3456` |

#### Tab "Cấu hình Domain" — **QUAN TRỌNG NHẤT**

Mini App **chỉ được gọi các domain trong whitelist**. Gọi ngoài list = request bị Zalo block.

Thêm whitelist:
```
api.mentorhub.vn           # BE production
img.vietqr.io              # QR generator cho thanh toán
zoom.us                    # Join meeting
img.youtube.com            # Thumbnail video (nếu embed)
s3.ap-southeast-1.amazonaws.com  # Storage recording
fonts.googleapis.com       # Google Fonts
fonts.gstatic.com          # Google Fonts static
```

**Nếu thiếu 1 domain** → Zalo sẽ reject khi review, phải submit lại.

Maintain file [`docs/zalo-whitelist.md`](#) để track đầy đủ domain hiện dùng.

#### Tab "Quyền sử dụng"

Chỉ bật scope thật sự cần (Zalo khắt khe với permission không rõ lý do):
- [x] `scope.userInfo` — lấy tên + avatar mentor (onboarding)
- [x] `scope.userPhonenumber` — SĐT (để link với tài khoản cũ nếu có)
- [ ] `scope.userLocation` — **KHÔNG cần**, bỏ
- [ ] `scope.cameraAccess` — **KHÔNG cần** (Zoom xử lý riêng), bỏ

---

## Giai đoạn 3 · Build + upload Mini App (2-3 ngày)

### 3.1 Cài Zalo Mini App tools

**Cách A — ZMP CLI (recommended cho team dev):**
```bash
npm install -g zmp-cli
zmp login   # OAuth với Zalo developer account
```

**Cách B — ZMP Studio IDE (cho designer/PM demo):**
Tải tại https://mini.zalo.me/devtools

### 3.2 Config repo MentorHub cho Zalo build

Repo hiện đã có sẵn `src/pages/Zalo/*` (Home, Today, Tickets, Students, More).
Cần 3 thay đổi nhỏ:

#### Step A: Thêm build script

**`package.json`:**
```json
{
  "scripts": {
    "build:zalo": "vite build --mode zalo --outDir dist-zalo"
  }
}
```

#### Step B: Tạo `.env.zalo`

```bash
APP_ENV=zalo-production
APP_API_URL=https://api.mentorhub.vn
ZALO_APP_ID=1234567890123
```

#### Step C: Replace SDK placeholder bằng real zmp-sdk

```bash
yarn add zmp-sdk
```

Sửa [`src/pages/Zalo/_shared/zmpSdk.ts`](../src/pages/Zalo/_shared/zmpSdk.ts) dòng:
```ts
const realSdk: ZmpSdk = mockSdk; // TODO: import from "zmp-sdk/apis"
```
thành:
```ts
import { getUserInfo, openShareSheet, openUrl, requestNotification, closeApp } from "zmp-sdk/apis";
const realSdk: ZmpSdk = {
  getUserInfo, openShareSheet, openUrl, requestNotification, closeApp,
  isZaloApp: () => true,
  getPhoneNumber: async () => null,
  onBackPressed: () => {},
};
```

#### Step D: Tạo `app-config.json` ở root

```json
{
  "app": {
    "title": "MentorHub",
    "headerColor": "#0F766E",
    "textColor": "light",
    "statusBarStyle": "default",
    "hideIOSSafeAreaBottom": false,
    "actionBarHidden": false
  },
  "debug": false,
  "template": {
    "oaIDtoOpenInApp": "YOUR_OA_ID"
  },
  "listCSS": ["zmp-ui/zaui.css"],
  "listSyncJS": []
}
```

### 3.3 Build

```bash
yarn build:zalo
# → dist-zalo/ với file tối ưu cho Zalo container
```

Check size:
```bash
du -sh dist-zalo/
# Phải ≤4MB nếu dùng static upload mode
# Nếu ≥4MB → phải dùng URL hosting mode (3.5 cách B)
```

### 3.4 Deploy lên domain

**Option A — VPS tự quản:**
```bash
rsync -avz --delete dist-zalo/ user@mini.mentorhub.vn:/var/www/mini/
```

**Option B — Vercel / Cloudflare Pages (recommended cho MVP):**
```bash
# vercel.json
{ "buildCommand": "yarn build:zalo", "outputDirectory": "dist-zalo" }

vercel --prod
# Config custom domain mini.mentorhub.vn trong Vercel dashboard
```

### 3.5 Upload Mini App lên Zalo Developer

**Cách A — Static Zip Upload** (recommended cho MVP, ≤4MB):

1. `cd dist-zalo && zip -r ../mentorhub-mini-v0.1.zip .`
2. Developer Console → Mini Program → **Phiên bản → Upload**
3. Upload `.zip` + điền:
   ```
   Version number: 0.1.0
   Version note:   Initial release — home, today, tickets, students, more
   ```
4. Zalo tự deploy lên CDN họ → URL dạng `miniapp.zdn.vn/{APP_ID}/v0.1.0/`

**Cách B — URL Hosting Mode** (cho app lớn/SSR):

1. Developer Console → Mini Program → **Cấu hình**
2. Set **"Hosting mode" = URL**
3. Entry URL: `https://mini.mentorhub.vn`
4. Mỗi deploy chỉ cần push domain (CI/CD tự động) — không upload Zalo

---

## Giai đoạn 4 · Internal test + Submit review (1-2 tuần)

### 4.1 Test nội bộ qua QR

1. Developer Console → **Phiên bản → Bản dùng thử**
2. Zalo generate **QR code** + **Tester UUID**
3. Admin **thêm tester** (tối đa 20 người, điền Zalo ID hoặc SĐT)
4. Tester mở Zalo app trên điện thoại → **quét QR**
5. Mini App mở trong Zalo container

### 4.2 Test checklist

Chạy qua 5 màn + các action:

#### Home screen
- [ ] 4 KPI tiles hiển thị đúng số
- [ ] Next session card có countdown
- [ ] Nút "Mở phòng Zoom" mở app Zoom (không mở browser)
- [ ] Quick actions 4 ô navigate đúng
- [ ] "Chia sẻ khoá" mở Zalo native share sheet
- [ ] "Mở trên máy tính" mở browser ngoài Zalo

#### Hôm nay
- [ ] Session list hiển thị đủ
- [ ] Nút "Mở Zoom" hoạt động
- [ ] "Xem AI ghi chú" deep link sang web

#### Ticket
- [ ] List ticket hiển thị
- [ ] Click 1 ticket → mở chi tiết
- [ ] Soạn reply, gửi → toast xác nhận + ticket biến mất khỏi list

#### Students
- [ ] Search filter hoạt động
- [ ] Nút chat (Zalo bubble) mở Zalo chat với HV (qua SĐT)

#### More
- [ ] Subscription status card đúng info
- [ ] Nút "Nâng cấp" deep link web Settings → Gói đăng ký
- [ ] 6 deep link menu mở browser ngoài

#### General
- [ ] Bottom tab bar hoạt động mượt
- [ ] Không crash khi rotate screen
- [ ] Không lag khi scroll list dài
- [ ] Back button (swipe từ cạnh màn hình) không thoát đột ngột
- [ ] Status bar không bị đè lên UI (SafeArea)
- [ ] Font load đầy đủ, không FOUT

### 4.3 Fix lỗi thường gặp khi test

| Vấn đề | Giải pháp |
|---|---|
| Font không load | Add `fonts.googleapis.com` + `fonts.gstatic.com` vào whitelist |
| `navigator.clipboard` không work | Dùng `zmp-sdk/apis/copyToClipboard` thay thế |
| `window.open()` mở tab mới bên trong Zalo | Dùng `zmp.openUrl()` để mở external browser |
| SafeArea bị đè | Check `app-config.json` `hideIOSSafeAreaBottom: false` |
| Bundle >4MB | Code-splitting `/zalo/*` routes + xoá unused deps + compress images |

### 4.4 Submit review

Khi test nội bộ pass:

1. Developer Console → **Phiên bản → Gửi duyệt**
2. Điền form submit:
   ```
   Lý do gửi:         Publish lần đầu
   Version hiện tại:  0.1.0
   Changelog:         Initial release với 5 màn core cho mentor

   Ghi chú cho Zalo reviewer:
   "MentorHub là công cụ quản lý khoá học cho 10k mentor cá nhân VN.
   Mini App tối giản — cho việc thao tác nhanh (xem lịch, reply ticket,
   chia sẻ khoá). Chức năng nặng (tạo khoá, edit AI note, analytics)
   đẩy sang web tại mentorhub.vn. Lý do làm Mini App: mentor VN sống
   trong Zalo hằng ngày, giảm ma sát khi dùng tool mới."
   ```
3. Upload:
   - 3-5 screenshot
   - Demo video 30-60s (recommended, upload lên YouTube unlisted → paste link)
4. **Tick**: "Tôi xác nhận app tuân thủ Zalo Mini Program Terms"
5. Click **Gửi duyệt**

### 4.5 Zalo review (3-7 ngày làm việc)

Zalo sẽ kiểm tra:

**Kỹ thuật:**
- [ ] Whitelist đủ domain — gọi domain ngoài list = auto reject
- [ ] Permission chỉ xin những gì thật sự cần
- [ ] Không có console.error/warn
- [ ] Không có lỗi 500 từ BE

**UI/UX:**
- [ ] Tap target ≥44×44px
- [ ] Font size ≥12px
- [ ] Không có placeholder "lorem ipsum" hoặc "TODO"
- [ ] Không có link broken
- [ ] Có chức năng contact support (email/phone)

**Nội dung:**
- [ ] Không gambling, adult, medical advice, political
- [ ] Không spam / fake content
- [ ] Không copycat brand khác
- [ ] Privacy + Terms valid và match với scope xin

**Business:**
- [ ] Có giá trị thực — không phải chỉ redirect web (Zalo reject nếu Mini App chỉ là iframe web)
- [ ] Match với category đăng ký (Giáo dục)
- [ ] Có contact support trong app

### 4.6 Nếu reject

Zalo gửi feedback qua email + notification trong Developer Console. Thường:

| Feedback phổ biến | Cách fix |
|---|---|
| "Permission `userPhonenumber` không rõ lý do" | Thêm screen explain trong app: "Chúng tôi cần SĐT để link với tài khoản mentor cũ" |
| "Domain X.com không có trong whitelist" | Add vào whitelist + resubmit |
| "Nút Y dẫn đến trang 404" | Fix link + resubmit |
| "App chỉ là WebView của website" | Reduce dependency vào external URL + add native SDK usage (share, notification, copyToClipboard) |
| "Chưa có flow contact support" | Thêm More > Hỗ trợ với email + hotline |

Fix → submit lại → Zalo review thêm 2-5 ngày.

### 4.7 Publish

Sau khi duyệt → Developer Console → **Phiên bản → Phát hành**.

Mini App public tại:
```
https://zalo.me/s/1234567890123/mentorhub
```

User Zalo VN có thể:
- Tìm trong tab **"Khám phá"** → search "MentorHub"
- Copy link → paste vào chat Zalo → Zalo tự render rich card
- Quét QR

---

## Chi phí tổng

| Hạng mục | Chi phí / năm |
|---|---|
| Zalo Developer account | **Free** |
| Publish Mini App | **Free** |
| Domain `.vn` | ~800k |
| VPS hoặc Vercel (hosting Mini App) | 600k - free |
| SSL | Free (Let's Encrypt) |
| CDN (optional) | Free - 200k |
| **Tổng** | **~1.4-1.8tr/năm** |

So sánh:
- **Apple App Store:** $99/năm (~2.5tr) + review pipeline khắt khe
- **Google Play:** $25 one-time + phí maintain
- **Zalo Mini App:** ~1tr/năm, review tương đối dễ hơn Apple

---

## Timeline tổng

```
Week 1:
  Mon-Tue:   Chuẩn bị giấy tờ + mua domain + viết privacy/terms
  Wed:       Tạo Developer account, submit verify doanh nghiệp
  Thu-Fri:   (Song song) Thiết kế icon + screenshots

Week 2:
  Mon:       Zalo verify xong → tạo Mini Program app
  Tue-Thu:   Dev build dist-zalo/ + deploy lên mini.mentorhub.vn
  Fri:       Upload lên Zalo Developer

Week 3:
  Mon-Wed:   Internal test với 5-10 mentor nội bộ, fix bugs
  Thu:       Submit Zalo review
  Fri→:      Chờ Zalo review (3-7 ngày)

Week 4:
  Mon-Tue:   Nhận feedback Zalo (nếu có) → fix → submit lại
  Wed-Fri:   Chờ review lần 2 (2-5 ngày)

Week 5:
  Mon:       Zalo approve → Publish → live!
  Tue-Fri:   Monitor adoption, user feedback, iterate
```

**~5 tuần từ zero đến live.** Nếu giấy tờ + domain sẵn từ trước, có thể rút
xuống 3 tuần.

---

## Hành động NGAY hôm nay

**Critical path — làm ngay để không kéo dài timeline:**

1. **[1-2h]** Đi mua domain `mentorhub.vn` (Mắt Bão / Namecheap)
2. **[15 phút]** Scan GPKD Reborn JSC → PDF
3. **[15 phút]** Tạo Zalo Developer account → upload GPKD (Zalo sẽ xét 1-3 ngày trong khi mình làm việc khác)
4. **[1h]** Tạo privacy + terms từ template (Termly.io) → host trên mentorhub.vn
5. **[4-8h]** Thiết kế icon 180x180 + 3 screenshot từ Mini App prototype hiện tại

Trong tuần 1 này **đừng chờ 1 việc xong mới làm việc khác** — chạy song song
tối đa để không lãng phí thời gian Zalo verify.

---

## Troubleshooting thường gặp

### Q: Zalo verify doanh nghiệp bị treo >5 ngày
**A:** Email support@developers.zalo.me kèm mã app + giấy tờ đã upload. Thường do ảnh GPKD mờ hoặc thiếu dấu đỏ công ty. Upload lại bản scan rõ hơn.

### Q: Bundle build >4MB
**A:**
- Chạy `vite-bundle-visualizer` xem module nào nặng
- Code-split `/zalo/*` routes riêng với `React.lazy`
- Compress images: PNG → WebP, SVG sprite
- Xoá deps không dùng: `yarn why <package>` check
- Cuối cùng: chuyển sang URL Hosting mode (không giới hạn size)

### Q: Zalo reject "app chỉ là WebView"
**A:** Add thêm native SDK calls để chứng minh là Mini App:
- `zmp.openShareSheet()` thay vì `window.open()`
- `zmp.getUserInfo()` thay vì form nhập tên
- `zmp.requestNotification()` thay vì browser notification
- Bottom tab bar native style
- Không dùng `iframe`

### Q: Tester báo "không mở được Mini App"
**A:**
- Zalo app của tester phải version ≥24.01 (update từ store)
- Tester phải được add vào Tester list trong Developer Console
- QR code có hiệu lực chỉ 7 ngày — regenerate nếu cũ

### Q: Sau publish, không tìm thấy trong "Khám phá"
**A:** Mini App mới publish thường chưa index. Share trực tiếp link `zalo.me/s/{APP_ID}/mentorhub` cho user đầu tiên. Sau ~100 MAU, Zalo sẽ tự index.

---

## Tham khảo

- **Zalo Mini App docs:** https://mini.zalo.me/documents/
- **ZMP SDK reference:** https://mini.zalo.me/documents/api/
- **Developer Console:** https://developers.zalo.me/app
- **Review guidelines:** https://mini.zalo.me/documents/review-guide/
- **Sample apps:** https://mini.zalo.me/documents/sample-apps/
- **Community Discord:** https://discord.gg/zalo-mini-app (official)
- **Support email:** support@developers.zalo.me

---

## Changelog

- **2026-04-24** · v1: Initial registration guide (4 stages, timeline, troubleshooting)
