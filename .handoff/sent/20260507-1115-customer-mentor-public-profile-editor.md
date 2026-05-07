---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: customer
created: 2026-05-07T11:15:07+00:00
slug: mentor-public-profile-editor
status: open
gh_issue: https://github.com/ducdung872001/cloud-customer-master/issues/7
---

# Public mentor profile + slug-based editor mở rộng customer master

Đầy đủ spec trong issue ducdung872001/cloud-customer-master#7.

## Tóm tắt
- Public mentor profile entity superset legacy MENTORS shape (giữ name/short/title/avatarBg/tags/verified/coursesCount/studentsCount/nps + thêm headline/bio/links/testimonials/published)
- 6 endpoint: 2 public (by-slug + list) + 4 mentor-self (GET/PATCH/slug/published)
- Slug uniqueness platform-wide, regex validate, 409 dup, reserved blocklist
- Cache fields auto-refresh (coursesCount/studentsCount/nps)
- DB: 1 bảng với index slug + published+studentsCount

## Backward compat critical
FE Portal/Mentors + MentorDetail đang RENDER LIVE dựa các legacy field (name/short/title/avatarBg/tags/verified/coursesCount/studentsCount/nps) → KHÔNG drop/rename.

## File FE liên quan
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/mentor-profile.ts
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/mentor-profile.ts
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (PublicMentorProfile)
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/Portal/Mentors/index.tsx (FE đang chạy)
- https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/src/pages/Portal/MentorDetail/index.tsx

## Cross-link
- customer#6: onboarding + custom fields, cùng repo customer master
- sales#22: referral engine — profile có thể hiển thị mã referral mentor
