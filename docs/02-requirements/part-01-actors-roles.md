# Part 01 — Actor & Permission

## 1. Actor catalog

| Actor | Vai trò | Số lượng | Ví trí |
|---|---|---:|---|
| **BOD / Sponsor** | Xem dashboard tổng hợp, KPI chuỗi | ~5 | HO |
| **Tenant Admin** | Cấu hình hệ thống, scope, rule, phân quyền | ~3 | HO |
| **Marketing Manager** | Tạo campaign, segment KH, A/B test, xem RFM | ~10 | HO |
| **CSKH Supervisor** | Phê duyệt ticket khó, xem báo cáo SLA | ~5 | HO |
| **CSKH Agent** | Tiếp nhận, xử lý ticket, tra cứu KH 360° | ~30 | HO + miền |
| **Brand Manager** | Quản lý loyalty riêng brand (khi scope = per_brand) | 2 | Mỗi brand 1 |
| **Store Manager** | Quản lý cửa hàng, xem KPI store, override điểm | ~300 → 1.500 | Mỗi store |
| **Cashier / Store Staff** | Quét thẻ KH, xác nhận tích/tiêu điểm tại quầy | ~3.000 → 15.000 | Mỗi store 5–10 người |
| **System / Cron** | Job tự động: expire điểm, eval tier, gửi nhắc | — | Background |
| **External POS** | Hệ thống POS hiện có của khách, gửi webhook auto-earn | 300 → 1.500 endpoint | Mỗi store 1 POS server |
| **Khách hàng cuối (KHTV)** | Đăng ký, xem điểm, đổi quà, nhận thông báo | ~3M | Qua app/web/SMS |

## 2. Permission matrix (ma trận quyền)

Permission được tổ chức theo domain × hành động: `<domain>.<action>` — VD `loyalty.points.adjust`, `member.export`, `setting.scope.change`.

| Permission | Tenant Admin | Marketing Mgr | CSKH Sup | CSKH Agent | Brand Mgr | Store Mgr | Cashier |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hội viên** | | | | | | | |
| `member.view` | ✅ | ✅ | ✅ | ✅ | ✅ (own brand) | ✅ (own store) | ✅ (lookup only) |
| `member.create` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `member.edit` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `member.merge` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `member.export` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `member.bulk_import` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `member.delete` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Điểm** | | | | | | | |
| `points.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `points.earn` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (via POS only) |
| `points.consume` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (via POS only) |
| `points.adjust` (thủ công) | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Tier** | | | | | | | |
| `tier.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tier.config` | ✅ | ❌ | ❌ | ❌ | ✅ (own brand) | ❌ | ❌ |
| `tier.eval_dryrun` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `tier.eval_apply` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Thưởng** | | | | | | | |
| `reward.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `reward.config` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `reward.issue` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Campaign** | | | | | | | |
| `campaign.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `campaign.create` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `campaign.launch` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **CSKH** | | | | | | | |
| `ticket.view` | ✅ | ❌ | ✅ | ✅ (assigned) | ❌ | ✅ (own store) | ❌ |
| `ticket.create` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `ticket.resolve` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ticket.escalate` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Cấu hình** | | | | | | | |
| `setting.scope.change` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `setting.expiry.change` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `setting.earn_rule` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `setting.integration` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `setting.permission` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Báo cáo** | | | | | | | |
| `report.dashboard` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `report.rfm_clv` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `report.export` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| `report.audit_log` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

✅ = có quyền · ❌ = không có quyền · *(own brand/store)* = chỉ với dữ liệu thuộc phạm vi của mình

## 3. Use case top-level

```
                        ┌─────────────────────────────────────┐
                        │      Reborn Loyalty Platform        │
                        │                                     │
  ┌─────────┐           │  ┌───────────────────────────┐      │
  │  BOD    │──────────►│  │  Xem dashboard chuỗi      │      │
  └─────────┘           │  └───────────────────────────┘      │
                        │  ┌───────────────────────────┐      │
  ┌─────────┐           │  │  Cấu hình rule loyalty    │      │
  │ Admin   │──────────►│  │  Cấu hình scope           │      │
  └─────────┘           │  │  Quản lý quyền            │      │
                        │  └───────────────────────────┘      │
  ┌─────────┐           │  ┌───────────────────────────┐      │
  │Marketing│──────────►│  │  Tạo campaign             │      │
  └─────────┘           │  │  Xem RFM segment          │      │
                        │  └───────────────────────────┘      │
  ┌─────────┐           │  ┌───────────────────────────┐      │
  │ CSKH    │──────────►│  │  Tra cứu KH 360°          │      │
  └─────────┘           │  │  Xử lý ticket             │      │
                        │  └───────────────────────────┘      │
  ┌─────────┐           │  ┌───────────────────────────┐      │
  │ Cashier │──────────►│  │  Quét thẻ KH, xem điểm    │      │
  └─────────┘           │  └───────────────────────────┘      │
                        │  ┌───────────────────────────┐      │
  ┌─────────┐           │  │  Auto-earn (webhook)      │      │
  │External │──────────►│  │  Lookup KH (API)          │      │
  │  POS    │           │  └───────────────────────────┘      │
  └─────────┘           │  ┌───────────────────────────┐      │
                        │  │  Cron: expire points      │      │
  ┌─────────┐           │  │  Cron: tier evaluation    │      │
  │ System  │──────────►│  │  Cron: send notifications │      │
  └─────────┘           │  └───────────────────────────┘      │
                        └─────────────────────────────────────┘
```

## 4. Yêu cầu liên quan

| ID | Tên | Ưu tiên |
|---|---|---|
| UR-CFG-PERM-01 | Permission map quản lý qua giao diện admin, không cần code | M |
| UR-CFG-PERM-02 | Permission inherit: brand-level → store-level | S |
| UR-CFG-PERM-03 | Audit log mọi thay đổi permission | M |
| UR-CFG-PERM-04 | Cashier KHÔNG được adjust điểm thủ công — chỉ qua POS | M |
| UR-CFG-PERM-05 | Tenant Admin có thể impersonate user khác để debug (audit log) | C |

Chi tiết permission UI: [`part-11-settings-admin.md`](part-11-settings-admin.md).
