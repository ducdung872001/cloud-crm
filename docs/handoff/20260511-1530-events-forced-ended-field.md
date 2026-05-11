---
from: reborn-hub (FE community-hub)
to: cloud-market-master (microservice /market/* — biz.reborn.vn)
created: 2026-05-11T15:30:00+07:00
slug: events-forced-ended-field
status: open
fe_branch: community-hub
priority: P3
blocking: không (FE gửi field, BE strip thì admin force-ended không persist)
---

# Thêm field `forced_ended` (BOOLEAN) cho events — admin ép cứng "đã kết thúc"

## Mục tiêu

Admin tích 1 checkbox trên form sửa event để ép coi event đã kết thúc, **song
song** với check `endDate` hiện có. Bỏ tick → mở lại (nếu ngày chưa qua).

Use case:
- Event huỷ giữa chừng nhưng không muốn dùng status "cancelled" (vì recap vẫn cần show).
- Test recap UI trước khi event thực sự kết thúc.
- Recover sau khi BE auto-set ended sai (corner case).

## Schema cần thêm

```sql
ALTER TABLE market_events ADD COLUMN forced_ended TINYINT(1) NOT NULL DEFAULT 0;
```

Hoặc BOOLEAN nếu DB hỗ trợ. Pattern y hệt `is_test` đã có.

## Việc BE cần làm

1. Migration thêm column (default false).
2. Whitelist `forcedEnded` (camelCase từ FE) / `forced_ended` (snake) trong update DTO. FE gửi `Boolean` hoặc `undefined`.
3. Trả về trong response get/list/public/get.
4. (Optional) Khi `forcedEnded=true`, có thể coi như status virtual "ended" trong public list filter — nhưng FE đã tự xử ở client (xem `liveStatus` trong [PublicEvents/index.tsx](src/pages/PublicEvents/index.tsx)).

## FE logic

`isEnded = forcedEnded || now > endDate || status in ("ended", "cancelled")`

Áp dụng tại:
- [src/pages/ShareEventPage/index.tsx](src/pages/ShareEventPage/index.tsx) — trang public detail.
- [src/pages/PublicEvents/index.tsx](src/pages/PublicEvents/index.tsx) — `liveStatus()` cho list page.

## Test cases

1. Tạo event endDate tương lai + tick "Ép cứng kết thúc" → list page hiện chip "ĐÃ KẾT THÚC", detail không cho đăng ký.
2. Bỏ tick → quay lại "Sắp tới" / "Đang diễn ra".
3. endDate qua + forcedEnded=false → vẫn ended (luồng cũ).
4. endDate qua + forcedEnded=true → ended (cả 2 đều true, vẫn ended).

## Estimate

BE ~10-15 phút: 1 migration + 1 whitelist + verify response.
