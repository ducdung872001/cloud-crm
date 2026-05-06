---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-06T03:55:00Z
slug: events-public-bsnid-filter
status: open
gh_issue: https://github.com/ducdung872001/cloud-market-master/issues/10
fe_branch: community-hub
fe_commit: 65c55221
priority: P0
deadline: 2026-05-09 (sự kiện gần nhất khách)
---

# Bug: API list events public chưa filter theo bsnId — leak events cross-tenant

## Tóm tắt

Endpoint `GET /market/events/public/list` đang trả về **toàn bộ events của
mọi tenant** thay vì chỉ events của tenant đang gọi. Tester báo trên prod
`https://hub.reborn.vn/crm/events` thấy events của các tenant khác lẫn
trong danh sách của W-HOUSE.

## Reproduce

1. Mở `https://hub.reborn.vn/crm/events` (không cần đăng nhập — đây là
   public portal page).
2. FE call `GET /market/events/public/list?limit=100`.
3. Response trả các events `published`/`ongoing` thuộc nhiều `bsnId` khác
   nhau, không chỉ bsnId của `hub.reborn.vn`.
4. UI render lẫn lộn → khách của W-HOUSE thấy event của tenant khác.

## Yêu cầu fix

Trong handler `/market/events/public/list`, **xác định `bsnId`** từ
hostname/origin của request (`hub.reborn.vn` → bsnId của W-HOUSE) và filter
`WHERE bsn_id = :detectedBsnId AND status IN ('published','ongoing') AND is_test = false`.

### Cách detect bsnId

Vì đây là endpoint public (không có Bearer token), không thể đọc bsnId từ
JWT. 2 phương án:

- **Phương án A — Hostname mapping** (recommend): BE giữ bảng
  `business_domain` map `host → bsn_id`. Public handler đọc `Host` header
  hoặc `Origin` → lookup → filter. Đây là cách `hub.reborn.vn` đã được
  routing tới bsnId W-HOUSE ở các phân hệ khác.
- **Phương án B — Query param `?bsnSlug=w-house`**: FE gửi kèm slug
  tenant. Đơn giản hơn nhưng FE phải biết slug — kém tự động.

→ Đề nghị làm **A** vì đã có infra mapping host → bsnId cho login flow.

## Liên quan

- Cùng scope với handoff [community-hub yc 5/5/2026](20260505-1142-community-hub-yc-2026-05-05.md)
  (issue #8) nhưng đây là bug riêng trên endpoint đã có, không phải feature
  mới — tách issue cho rõ owner và để release fix nhanh.
- Cũng chính là root cause khiến tester thấy "events lẫn lộn tenant" trong
  buổi UAT 5/5.

## Acceptance criteria

- [ ] `GET /market/events/public/list` từ `hub.reborn.vn` chỉ trả events
      của bsnId W-HOUSE.
- [ ] Test trên 2 tenant khác nhau (vd `hub.reborn.vn` vs tenant test): mỗi
      tenant chỉ thấy events của mình.
- [ ] Endpoint không yêu cầu auth (giữ nguyên public).
- [ ] Vẫn loại bỏ events `is_test=true` (đã hardcode bên FE nhưng nên
      filter cả ở BE để rò rỉ thấp hơn).

## FE side

FE đã sẵn sàng — không cần thay đổi gì. Khi BE fix xong, response sẽ tự
giảm về đúng tenant.

Endpoint FE đang gọi: `src/services/EventService.ts:14-16` →
`urlsApi.events.listPublic = prefixMarket + "/events/public/list"`.
