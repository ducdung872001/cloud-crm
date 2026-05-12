---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-11T18:30:00+07:00
slug: portal-config-permission-update
status: open
fe_branch: community-hub
priority: P1
blocking: admin không lưu được cấu hình portal — banner ảnh & strip ảnh chạy ngang đầu trang
---

# Permission UPDATE thiếu trên `/community-hub/portal-config/`

## Triệu chứng

Admin tenant W-House (role admin chuẩn) mở `/crm/ch_events` → "⚙️ Cài đặt portal" → upload ảnh banner → BE trả lỗi permission:

```
Bạn không có quyền thực hiện thao tác này!
Path: /community-hub/portal-config/
Action: UPDATE
```

GET (đọc config) hoạt động bình thường. Chỉ UPDATE / upsert bị chặn.

Endpoint bị chặn:
```
POST /market/community-hub/portal-config/upsert
Body: { config: "<JSON-string>" }
```

## Nguyên nhân nghi ngờ

BE permission system (cloud-org / SERVICE_PERMISSION_CHECK_CONTRACT) chưa có
entry cho resource `/community-hub/portal-config/` action `UPDATE`, hoặc role
admin tenant chưa được grant.

Có thể vì:
- Endpoint `/portal-config/upsert` đã có từ lâu (yc tester 2026-05-06) nhưng
  permission table chỉ grant cho super-admin Reborn, không cho tenant admin.
- Hoặc BE gần đây đổi enforcement từ JWT-only → JWT + resource permission check.

## Test cases mong đợi (sau khi fix)

1. W-House Admin (role mặc định trong tenant) update portal-config → 200, config sync.
2. Member thường (role member) update → 403 (đúng — không cho).
3. Super admin Reborn → 200.
4. GET `/portal-config` cả 3 role đều OK (đã work hiện tại).

## Việc BE cần làm

1. Thêm permission entry trong cloud-org (hoặc service tương đương) cho:
   - Resource: `/community-hub/portal-config/`
   - Actions: `VIEW`, `UPDATE`
2. Grant action `UPDATE` cho role admin của tenant (`role_admin`, `role_owner`, hoặc tên tương đương).
3. Smoke test với account `ceo@reborn.vn` (admin W-House) trên `hub.reborn.vn`.

## FE đã làm

- Modal `PortalSettingsModal` upload + upsert qua [`portalSettings.setAsync`](src/pages/CommunityHub/Events/portalSettings.ts).
- Surface error message BE trả về (FE relay nguyên xi, không có toast custom).
- Vừa thêm field `topGallery: Array<{ url, linkUrl? }>` (yc Hiền Đỗ — strip ảnh chạy ngang đầu trang). Cùng endpoint upsert → cùng bị lỗi permission.

## FE workaround không khả thi

- Không cache LS — đã thống nhất pattern API-first không LS-shadow nữa (handoff `20260511-1130` recap).
- Admin master Reborn có thể update giúp tenant — nhưng W-House muốn tự quản lý, không phụ thuộc Reborn central.

## Estimate

BE ~10-15 phút: 1 migration permission entry + grant role.
