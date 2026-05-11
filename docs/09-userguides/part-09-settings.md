# Part 09 — Cài đặt hệ thống (Admin)

> 🎯 **Đối tượng:** Tenant Admin. Marketing Manager có một phần quyền (earn rules, notification template).

## 1. Tổng quan trang Cài đặt

**Menu › Cài đặt**

8 tab chính:

| Tab | Nội dung |
|---|---|
| **Tổng quan** | Tenant info, branding, mode toggle |
| **Scope** | chain_wide / per_brand / per_store_group + transfer config |
| **Earn Rules** | Quy tắc tích điểm, scope, modifier, priority |
| **Tier** | Cấu hình hạng, threshold, multiplier, benefits |
| **Rewards** | Catalog quà (link sang [`part-04-rewards.md`](part-04-rewards.md)) |
| **Expiry** | Chế độ hết hạn điểm + notification timing |
| **Notification** | Template SMS/Zalo/Email cho 10 loại notification |
| **Integration** | API key, webhook, sandbox mode, request log |
| **Permission** | User & role management, custom role builder |
| **Audit** | Audit log viewer + export |

## 2. Tab Tổng quan

### 2.1. Tenant info

- Tên, logo, primary color
- Support email, phone
- Timezone (Asia/Ho_Chi_Minh)
- Locale (vi default, en optional)
- Currency (VND)

### 2.2. Mode toggle

3 mode:

| Mode | Modules hiển thị |
|---|---|
| `loyalty_only` | Chỉ Loyalty + Cài đặt |
| `loyalty_marketing` | + Campaign engine |
| `full_crm` | + CSKH ticket, warranty, feedback |

Đổi mode → menu/route/permission tự điều chỉnh. Không mất data.

⚠️ Đổi mode = audit log + reload browser.

## 3. Tab Scope

Đã mô tả ở [`part-07-cross-brand.md`](part-07-cross-brand.md).

## 4. Tab Earn Rules

Đã mô tả ở [`part-03-points-tier.md#4-cấu-hình-earn-rule`](part-03-points-tier.md).

## 5. Tab Tier

Đã mô tả ở [`part-03-points-tier.md#5-hạng-thành-viên-tier`](part-03-points-tier.md).

## 6. Tab Expiry

Đã mô tả ở [`part-03-points-tier.md#6-hạn-sử-dụng-điểm`](part-03-points-tier.md).

## 7. Tab Notification

### 7.1. Template management

10 loại notification:

| Loại | Trigger |
|---|---|
| `signup_welcome` | KH đăng ký mới |
| `points_earned` | Sau auto-earn |
| `points_expiring_soon` | 30/14/7/1 ngày trước expire |
| `points_expired` | Sau khi expire |
| `tier_upgraded` | Lên hạng |
| `tier_downgraded` | Xuống hạng (cuối grace) |
| `tier_grace_warning` | Vào grace period |
| `reward_redeemed` | Đổi reward thành công |
| `voucher_expiring` | 3 ngày trước voucher hết hạn |
| `campaign_announcement` | Campaign launch tới segment |
| `ticket_status_change` | Ticket update |

Mỗi loại có template per channel (SMS / Zalo / Email / Push).

### 7.2. Edit template

1. Chọn loại + channel
2. Edit nội dung:
   - Variables: `{name}, {points}, {tier}, {voucher_code}, {balance}, {expires_at}`
   - Multi-language (vi/en) — tab riêng
3. Preview với data thật
4. Test send: nhập 1 phone test → gửi thật
5. Save → audit log

🔴 **Email mandatory:** Footer phải có unsubscribe link `{unsubscribe_url}`.

### 7.3. Frequency cap

Setting global: tối đa 3 message/KH/tuần (cấu hình).

Mỗi loại có thể có cap riêng:
- `points_earned`: max 5/tuần (tránh spam KH mua nhiều)
- `campaign_announcement`: max 2/tuần
- `transactional` (signup, tier change): không cap

## 8. Tab Integration

### 8.1. API Keys

CRUD API key cho external POS/system:

1. **[+ New API Key]**:
   - Name (vd: "POS Brand A integration")
   - Scopes (multi-select): `lookup`, `auto_earn`, `consume`, `refund`
   - Rate limit: 1.000 req/min (default)
   - IP whitelist (optional): list CIDR
   - Expires_at: 1 năm (default), unlimited (avoid)
   - Sandbox: false (production)
2. Bấm **[Generate]**
3. ⚠️ Hiển thị key 1 lần duy nhất — copy ngay
4. Audit log

Mỗi key có:
- Status: active / revoked
- Last used: timestamp
- Usage stats: req/min trung bình

**Revoke key:** bấm **[Revoke]** → confirm → ngay lập tức 401.

### 8.2. Webhook subscriptions

Cấu hình webhook OUT cho external system:

1. **[+ New Webhook]**:
   - URL endpoint
   - Events selected: `points.earned`, `tier.changed`, `reward.redeemed`, ...
   - Secret (auto-gen, dùng HMAC sign payload)
2. **[Test ping]** — send 1 test event → check delivery
3. Save

Monitoring: delivery success rate, failed retries.

### 8.3. Sandbox mode

API key flag `is_sandbox = true`:
- Requests đi vào schema/table riêng
- Notification không gửi thật
- Reset data nightly
- Dashboard tách "Sandbox vs Production"

→ Cho POS team integrate trước go-live.

### 8.4. Request log

**Integration › Request Log**

Last 30 days:
- Filter by API key, endpoint, status, member, order_ref
- Click request → full body (PII redacted)
- Export cho debug specific issue

## 9. Tab Permission

### 9.1. User management

CRUD user:
- Email (link SSO)
- Roles (multi-select)
- Active/Disabled

### 9.2. Role management

Standard roles:
- Tenant Admin
- Marketing Manager
- CSKH Supervisor
- CSKH Agent
- Brand Manager (per brand)
- Store Manager (per store)
- Cashier (POS pass-through)

### 9.3. Custom role builder

Tạo role mới với permission cụ thể:
1. **[+ New Role]**
2. Name + description
3. Select permissions từ tree:
   - member.* (view, edit, create, merge, ...)
   - points.* (view, earn, consume, adjust, ...)
   - tier.*
   - reward.*
   - campaign.*
   - ticket.*
   - setting.*
   - report.*
4. Save

### 9.4. Scope assignment

User có thể được restrict scope:
- All brands
- Brand A only
- Store XYZ only

→ Engine enforce trong query.

## 10. Tab Audit

### 10.1. Audit log viewer

Filter:
- Actor (user)
- Action (action type)
- Resource (member, ledger, setting, ...)
- Period
- IP

Mỗi row hiển thị:
- Timestamp
- Actor
- Action
- Resource
- Before value (JSON)
- After value (JSON)
- Diff highlight

Bấm row → full detail.

🔴 **Audit log immutable** — không edit/delete được.

### 10.2. Export

Export CSV cho compliance review.

Retention 7 năm.

## 11. Backup & Export config

**Cài đặt › Tổng quan › Backup config**

Export toàn bộ config (rules, tier, reward catalog, templates, scope) → JSON file.

Import JSON → preview diff → apply (audit log).

Use case: copy config từ sandbox sang production, hoặc backup trước major change.

## 12. Maintenance mode

**Cài đặt › Tổng quan › Maintenance**

Toggle ON:
- API trả 503 với message tuỳ chỉnh
- UI hiển thị banner
- Whitelist IP (optional): Reborn ops team vẫn access

Dùng khi: hot fix critical, major migration window.

⚠️ Audit ai bật/tắt.

## 13. Tham chiếu

- URD settings: [`../02-requirements/part-11-settings-admin.md`](../02-requirements/part-11-settings-admin.md)
- Permission matrix: [`../02-requirements/part-01-actors-roles.md`](../02-requirements/part-01-actors-roles.md)
- Compliance: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
- Fraud (cap/approval): [`../06-analysis/fraud-prevention.md`](../06-analysis/fraud-prevention.md)
