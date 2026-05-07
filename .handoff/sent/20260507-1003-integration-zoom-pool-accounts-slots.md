---
from: mentorhub
fe_repo: ducdung872001/cloud-crm
fe_branch: reborn-mentorhub
to: integration
created: 2026-05-07T10:03:58+00:00
slug: zoom-pool-accounts-slots
status: open
gh_issue: https://github.com/ducdung872001/cloud-integration-master/issues/13
---

# Quản lý Zoom pool accounts + slot scanner cho mentorhub credit pool USP

## Bối cảnh (Why)

FE mentorhub Phase 6 hoàn tất USP "Zoom credit pool" — mỗi tenant có credit, dùng credit book Zoom slot từ pool dùng chung. Pool gồm:
- **Platform accounts**: Reborn HQ tự nuôi (licensed)
- **Mentor contributor**: mentor Pro+ góp account của mình → earn 50% credit/booking
- **WIT volunteer**: cộng đồng WIT đóng góp tài khoản → earn 70% (USP cộng đồng)

Booking flow (mentorhub-be orchestrate): pick free slot → reserve → spend credit (gọi billing) → mark booked → notify owner contributor earn (gọi billing).

`integration` đã quản lý Zoom OAuth + 3rd-party credentials → pool account registry + slot scanner thuộc cùng category. Slot scanner cần gọi Zoom Calendar API real (Phase 6 stub mock 63 slots seed).

(Đầy đủ spec đã gửi trong issue ducdung872001/cloud-integration-master#13 — body đồng bộ. Audit local này chỉ giữ frontmatter + bối cảnh để lookup nhanh.)

## File FE liên quan (chỉ để BE tham chiếu, KHÔNG sửa)

Stub Phase 6 vừa commit (commit `04632e9a`):
- Zoom pool service: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/services/zoom-pool.ts
- Routes: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/routes/zoom-pool.ts
- Types: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/types.ts (search ZoomPoolAccount, ZoomSlot, ZoomBooking)
- Seed: https://github.com/ducdung872001/cloud-crm/blob/reborn-mentorhub/backend-stubs/src/db/store.ts (search zoomPoolAccounts, zoomSlots)

## Cross-link
- billing#15 (credit wallet): mentorhub-be orchestrate spend/refund booking
- integration#12 (MCP host + AI provider): cùng pattern encryption + health monitoring

## Tiêu chí done
- [ ] DB migrations 2 bảng account + slot với race-safe index
- [ ] 5 endpoint account CRUD + Zoom OAuth swap
- [ ] 4 endpoint slot transition atomic (reserve/release/confirm/cancel)
- [ ] Scanner cron 1m + 15m tick
- [ ] OAuth token encrypted + auto-refresh
- [ ] Postman / curl examples
