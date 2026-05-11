# Part 11 — Cấu hình & Admin

## 1. Phạm vi

Tất cả config liên quan loyalty: scope, expiry, earn rules, tier definition, reward catalog, integration, permission, branding, notification template, audit log.

## 2. Yêu cầu

### UR-CFG-01 — Settings page tổ chức (Must)

| | |
|---|---|
| **Mô tả** | Trang `Cài đặt Loyalty` (`/setting_loyalty`) chia 8 tab: Tổng quan / Scope / Earn Rules / Tier / Rewards / Expiry / Notification / Integration. Mỗi tab có search + breadcrumb. Sticky save bar dưới cùng. |
| **AC** | • Load < 1 s<br>• Tab state persistent qua URL hash<br>• Dirty state warning khi rời tab chưa save |

### UR-CFG-02 — Tenant info (Must)

| | |
|---|---|
| **Mô tả** | Thông tin tenant: name, logo, primary_color, support_email, support_phone, timezone (default Asia/Ho_Chi_Minh), locale (vi default), currency (VND default). |
| **AC** | • Logo upload với crop tool<br>• Color picker<br>• Preview branding áp dụng |

### UR-CFG-03 — Module toggle / mode (Must)

| | |
|---|---|
| **Mô tả** | Chọn mode: `loyalty_only` (chỉ loyalty + cài đặt) / `loyalty_marketing` (+ campaign engine) / `full_crm` (+ CSKH ticket, warranty, feedback). Thay đổi mode ẩn/hiện menu, route, permission. |
| **AC** | • Chuyển mode không mất data<br>• Route ẩn trả 403 nếu access<br>• Reflect lên sidebar ngay sau reload<br>• Confirm dialog cảnh báo |

### UR-CFG-04 — Notification template (Must)

| | |
|---|---|
| **Mô tả** | CRUD template cho các loại notification: signup_welcome, points_earned, points_expiring_soon, points_expired, tier_upgraded, tier_downgraded, reward_redeemed, voucher_expiring, campaign_announcement, ticket_status_change. Mỗi loại có template cho từng channel (SMS/Zalo/email/push). Variables: `{name}, {points}, {tier}, {voucher_code}, {balance}, ...` |
| **AC** | • Preview với data thật<br>• Test send tới 1 phone test<br>• Multi-language (vi/en)<br>• Unsubscribe link mandatory cho email<br>• Audit history changes |

### UR-CFG-05 — Audit log (Must)

| | |
|---|---|
| **Mô tả** | Mọi thay đổi config + manual adjust ghi `audit_log`: actor_user_id, action, resource_type, resource_id, before_value, after_value, ip, user_agent, timestamp. Trang xem có search/filter. Retention: 7 năm cho compliance. |
| **AC** | • Search by user/action/period<br>• Export CSV<br>• Immutable — không sửa/xoá được<br>• Diff view before vs after |

### UR-CFG-06 — Multi-store mapping (Must)

| | |
|---|---|
| **Mô tả** | Quản lý cây tổ chức: brand → store_group → store. Store có địa chỉ, manager, contact, status. Bulk import store CSV. |
| **AC** | • Import CSV 1.500 store < 5 phút<br>• Validate brand_id thuộc tenant<br>• Cây có thể drag-drop reorder |

### UR-CFG-07 — User & permission (Must)

| | |
|---|---|
| **Mô tả** | CRUD user nội bộ. Assign role (Tenant Admin / Marketing Mgr / CSKH Sup / CSKH Agent / Brand Mgr / Store Mgr / Cashier). Custom role builder cho phép tạo role mới với set permission cụ thể. |
| **AC** | • User SSO link với hệ SSO trung tâm<br>• Permission diff trước khi save<br>• Audit log<br>• Bulk import từ Excel HR |

### UR-CFG-08 — Public branding (Should)

| | |
|---|---|
| **Mô tả** | Page member-facing (app, web) hiển thị tenant branding: logo, color, support info, terms link, privacy link. |
| **AC** | • Live preview<br>• Mobile + desktop preview |

### UR-CFG-09 — Backup & export config (Must)

| | |
|---|---|
| **Mô tả** | Export toàn bộ config (earn rules, tier, reward catalog, notification template) sang JSON. Import JSON để restore hoặc duplicate sang tenant khác (sandbox → prod). |
| **AC** | • Export 1-click<br>• Import có dry-run validation<br>• Versioned config snapshots (last 30) |

### UR-CFG-10 — Maintenance mode (Should)

| | |
|---|---|
| **Mô tả** | Bật maintenance mode → API trả 503 với message tuỳ chỉnh, UI hiển thị banner. Dùng khi deploy hot fix hoặc migration. |
| **AC** | • Toggle by Tenant Admin<br>• Audit who/when<br>• Whitelist IP có thể access (Reborn ops team) |

### UR-CFG-11 — Feature flags (Could)

| | |
|---|---|
| **Mô tả** | Bật/tắt tính năng experimental per tenant: AI churn prediction, advanced fraud detection, OCR receipt scan, ... |
| **AC** | • Default off cho stable features<br>• Audit |

### UR-CFG-12 — Compliance settings (Must)

| | |
|---|---|
| **Mô tả** | Cấu hình compliance: data retention period (5 years default per NĐ 13/2023), erasure workflow, consent management for marketing. |
| **AC** | • Cookie banner template<br>• Consent log per member<br>• Export "my data" feature cho KH |
| **Phân tích sâu** | [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md) |

## 3. Quy tắc nghiệp vụ

- **Config thay đổi không retroactive** — chỉ áp đơn từ moment save. Audit lưu both before/after.
- **2-level approval** cho: scope change, expiry mode change, đổi tỷ giá redemption, tier threshold change, batch manual adjust > 100 KH.
- **Maintenance mode** không tự bật/tắt theo schedule — luôn manual.

## 4. Tham chiếu

- **Permission matrix:** [`part-01-actors-roles.md#2-permission-matrix-ma-trận-quyền`](part-01-actors-roles.md)
- **HDSD admin:** [`../09-userguides/part-09-settings.md`](../09-userguides/part-09-settings.md)
- **Audit & compliance:** [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
