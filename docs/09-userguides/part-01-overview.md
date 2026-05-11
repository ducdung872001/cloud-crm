# Part 01 — Giới thiệu & Đăng nhập

## 1. Reborn Loyalty Platform là gì?

Hệ thống loyalty thống nhất cho chuỗi siêu thị, giúp:
- Quản lý 3M+ hội viên trên 1 hồ sơ duy nhất
- Tích điểm tự động khi KH mua tại bất kỳ store nào
- Vận hành chương trình hạng thành viên, đổi thưởng, khuyến mãi
- Marketing automation thay agency ngoài
- Báo cáo phân tích RFM, CLV, retention

## 2. Đăng nhập

### 2.1. Truy cập

URL admin: `admin.loyalty.<brand>.vn` (sẽ cung cấp khi go-live)

### 2.2. Bước

1. Mở trình duyệt → nhập URL
2. Bấm **[Đăng nhập SSO]**
3. Nhập email công ty + mật khẩu (qua hệ SSO của Reborn / công ty)
4. Nếu lần đầu → chọn vai trò (nếu có nhiều)
5. Trang chính (Dashboard) hiển thị

### 2.3. Quên mật khẩu

Bấm "Quên mật khẩu" → nhập email → check hộp thư → bấm link → set mật khẩu mới.

### 2.4. Xác thực 2 yếu tố (2FA)

Khuyến nghị bật cho Admin và Marketing Manager:
1. Menu góc phải → **Cài đặt cá nhân**
2. Tab **Bảo mật** → bấm **Bật 2FA**
3. Quét QR bằng Google Authenticator / Authy
4. Nhập mã 6 số xác nhận

🟢 **Tip:** Backup recovery codes vào nơi an toàn (giấy, password manager).

## 3. Giao diện chính

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard      Hội viên    Điểm    Hạng    Quà    KM   ▼│ ← Top nav
├──────────────────────────────────────────────────────────────────┤
│       │                                                          │
│ ┌───┐ │   Trang hiện tại — nội dung chính                       │
│ │   │ │                                                          │
│ │SB │ │                                                          │
│ │   │ │                                                          │
│ └───┘ │                                                          │
│ Sidebar│                                                          │
│ ↓     │                                                          │
└──────────────────────────────────────────────────────────────────┘
```

### 3.1. Sidebar (menu trái) — theo role

**Tenant Admin** thấy đầy đủ:
- 📊 Dashboard (Executive, Operational, Analytics)
- 👥 Hội viên (List, Bulk import, Merge, Tag)
- 💎 Điểm & Hạng (Wallet, Ledger, Tier, Rules)
- 🎁 Đổi thưởng (Catalog, Redemptions, Voucher)
- 📢 Khuyến mãi (Campaigns, Segments, A/B test)
- 💬 CSKH (Tickets, Warranty, NPS)
- 📈 Báo cáo (RFM, CLV, Cohort, Liability)
- ⚙️ Cài đặt (Scope, Earn rules, Tier config, Integration, Permission, Audit)

**Marketing Manager** thấy: Dashboard, Hội viên, Điểm & Hạng (read), Khuyến mãi, Báo cáo.

**CSKH Agent** thấy: Hội viên (lookup), Điểm & Hạng (adjust nhỏ), CSKH (tickets).

**Cashier**: chỉ giao diện POS đơn giản tra cứu KH (qua POS pass-through).

### 3.2. Top navigation

- 🔍 Tìm kiếm nhanh: gõ phone/tên/order/ticket → kết quả
- 🔔 Bell notification: alerts hệ thống
- 👤 Account: profile, đổi mật khẩu, logout

### 3.3. Breadcrumb

Mỗi page có breadcrumb để định vị: `Hội viên › Profile › Nguyễn Văn A`.

## 4. Tìm kiếm nhanh

Top search bar — gõ:
- Phone (full hoặc 4 số cuối)
- Tên KH (fuzzy)
- Mã ticket (`TK-XXXXXX`)
- Order ref (`POS-...`)
- Member ID
- Voucher code

Kết quả gợi ý dropdown. Bấm Enter → trang search results đầy đủ.

## 5. Mỗi role thường làm gì

### 5.1. Cashier (trong cửa hàng)

- Quét thẻ KH / nhập phone tại POS
- Xem tên, hạng, số điểm hiển thị trên POS
- KH muốn dùng điểm → POS tự xử lý
- POS tự gửi data về loyalty sau khi thanh toán

→ Cashier **không cần truy cập admin web**. Tất cả qua POS bình thường.

### 5.2. Store Manager

- Xem dashboard riêng cho store
- Xem top KH thường xuyên
- Tạo ticket khi có khiếu nại
- Adjust điểm goodwill (cap)

### 5.3. CSKH Agent

- Tiếp nhận ticket từ KH (phone, email, walk-in)
- Tra cứu KH 360°: hạng, điểm, lịch sử mua, tickets cũ
- Cộng/trừ điểm goodwill (trong hạn cap)
- Resolve ticket theo workflow

### 5.4. Marketing Manager

- Tạo campaign (welcome, birthday, weekend boost, ...)
- Xây segment theo RFM
- A/B test
- Xem dashboard KPI hàng ngày

### 5.5. Tenant Admin

- Cấu hình rule tích điểm, tier, expiry, scope
- Quản lý reward catalog
- Phân quyền user
- Xem audit log
- Approve high-impact actions (bulk adjust, scope change)

## 6. Hỗ trợ

| Vấn đề | Cách giải quyết |
|---|---|
| Không đăng nhập được | Liên hệ IT công ty để reset SSO |
| Forgot 2FA | Liên hệ Tenant Admin → reset |
| Bug / Lỗi | Bấm 🐛 "Báo lỗi" góc phải, mô tả + screenshot |
| Cần training | Liên hệ Reborn support qua email `support@reborn.vn` |
| Câu hỏi thường gặp | Xem [Part 10 — FAQ](part-10-faq.md) |

## 7. Tham chiếu

- Permission matrix: [`../02-requirements/part-01-actors-roles.md`](../02-requirements/part-01-actors-roles.md)
