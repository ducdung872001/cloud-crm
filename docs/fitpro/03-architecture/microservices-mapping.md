# 03.4 — Microservices mapping

> Mapping 11 phân hệ FitPro (F1–F11) vào 12 microservice backend hiện có. Khi cần dispatch task BE, dùng [docs/handoff/MICROSERVICES.md](../../handoff/MICROSERVICES.md) làm registry.

---

## 3.16. Nguyên tắc mapping

1. **Ưu tiên gộp vào service hiện có** trước khi đề xuất service mới.
2. Chỉ tách service mới khi **khác domain đặc thù ngành** (ví dụ: `nutrition` cho FitPro vì các vertical khác không có ngành dinh dưỡng).
3. **App FitPro = sub-tenant** trong các BE đa-tenant — payload luôn mang nhãn `from-fitpro`.

---

## 3.17. Bảng mapping F1–F11 → Microservice

| Phân hệ | Microservice host | API base path | Ghi chú |
|---|---|---|---|
| **F1** Cây giới thiệu 7×7×7 | `customer` + `org` | `/customer/*` | Mã A007/N007 lưu trong `customer.business_owner_node` |
| **F2.1** 3 loại location (Home/Inside/Center) | `customer` | `/customer/department/*` hoặc entity riêng `/customer/location/*` | Field `type ∈ {home, inside, center}` + `ownership_model` |
| **F2.4** Wizard mở Center (franchise kit) | `bpm` (workflow) | `/bpm/process/*` | Process definition `open-new-center` |
| **F3** 5 tier gói + lifecycle | `inventory` (catalog) + `sales` (POS) | `/inventory/product/*`, `/sales/invoice/*` | Bundle items cho mỗi tier |
| **F4.1–4.2** Journey 90 ngày + check-in | `care` + `bpm` | `/care/*`, `/bpm/instance/*` | Phase auto-transition theo cron |
| **F4.3** Medlatec lab | `integration` | `/integration/medlatec/*` | API mới — cần ký hợp đồng |
| **F4.4** Báo cáo outcome | `analytics` (mới) | `/analytics/outcome/*` | Aggregation job hàng đêm |
| **F4.5** App mobile member | (Frontend mới) | — | PWA reuse cloud-crm hoặc native — xem D1 |
| **F5.1** Direct revenue (POS) | `sales` + `billing` | `/sales/invoice/*`, `/billing/cashbook/*` | Reuse 100% từ cloud-crm |
| **F5.2** HBL commission ledger | `billing` (passthrough only) | `/billing/ledger/*` | App không cầm tiền, chỉ ghi nhận đối soát |
| **F5.3** Cấu hình % commission | `customer` (settings) | `/customer/setting/commission/*` | Tenant-level config |
| **F6** Home Fit (gia đình) | `customer` (group) + `market` (gamification) | `/customer/family_group/*`, `/market/streak/*` | Family-account, multi-profile |
| **F7** Case study public | `market` (content) + `bpm` (workflow duyệt) | `/market/case-study/*`, `/bpm/process/*` | Approval workflow reuse BPM |
| **F8.1–8.2** Corporate Account + bulk enrollment | `customer` (B2B) | `/customer/corporate/*` | Bulk import Excel |
| **F8.3–8.4** Trial flow + HR dashboard | `customer` + `analytics` | `/customer/trial/*` | State machine trial → convert/expire |
| **F9.1** Cadence D/W/M/Q/Y | `notification` (cron) + `market` (content CMS) | `/notification/schedule/*`, `/market/content/*` | Engine scheduled events |
| **F9.2** Streak / Badge / Leaderboard | `market` (gamification) | `/market/gamification/*` | Aggregation job |
| **F9.3** Notification engine (push/Zalo/email) | `notification` | `/notification/dispatch/*` | Multi-channel preference |
| **F10.1–10.2** VIP transfer Adorn | `care` (ticket / lead transfer) | `/care/lead-transfer/*` | Workflow VIP-specific |
| **F10.3** Bán xét nghiệm | `inventory` (catalog) + `integration` (Medlatec) | `/inventory/product/*` | Lab products vào catalog |
| **F11** Reports | `analytics` (mới) | `/analytics/*` | Aggregation BE + dashboards |

---

## 3.18. Đề xuất service mới

| Service | Mục đích | Vì sao không gộp được? |
|---|---|---|
| **`nutrition`** ⭐ | Khuyến nghị bổ sung HBL theo cường độ vận động + chỉ số sức khỏe | Đặc thù ngành sức khỏe; không vertical nào khác cần |
| **`analytics`** ⭐ | Big Data Lifecycle, aggregation, dashboard, predictive upsell | Tách khỏi `customer` để không nặng monolith CRM |

→ Khuyến nghị **BOD duyệt 2 service mới** cho FitPro. Các phân hệ còn lại đều gộp được vào 12 service hiện có.

---

## 3.19. Stack hiện hữu — đa tenant ready

Đã có 12 microservice trong registry (xem [docs/handoff/MICROSERVICES.md](../../handoff/MICROSERVICES.md)):

| Service | Repo | Branch |
|---|---|---|
| `billing` | `cloud-billing-master` | master |
| `bpm` | `bpm-core` | **cloud** (không phải master) |
| `care` | `cloud-care-master` | master |
| `contract` | `cloud-contract-master` | master |
| `customer` | `cloud-customer-master` | master |
| `integration` | `cloud-integration-master` | master |
| `inventory` | `cloud-inventory-master` | master |
| `logistics` | `cloud-logistics-master` | master |
| `market` | `cloud-market-master` | master |
| `notification` | `reborn-notihub` | master |
| `operation` | `cloud-operation-master` | master |
| `sales` | `cloud-sales-master` | master |

> ⚠️ Multi-tenant note: mỗi BE phục vụ nhiều vertical FE (banking/retail/mentorhub/fitpro). Handoff PHẢI mang nhãn `from-fitpro` để BE biết reply về đâu. Reply từ BE phải có 2 label đồng thời: `reply-from-<service>` + `to-fitpro`.

---

## 3.20. Frontend mapping

| Module FE | Path trong cloud-crm | Trạng thái |
|---|---|---|
| Sidebar config | `src/configs/routes.tsx` | Reuse community-hub variant, **rebrand** sang FitPro |
| Pages FitPro | `src/pages/CommunityHub/` → rename `src/pages/FitPro/` | 17 page files, xem [05-current-state/gap-analysis.md](../05-current-state/gap-analysis.md) |
| Shared UI components | `src/components/tnpm/` | KpiCard, KpiRow, PageHeader, TabBar, ModalShell, StatusBadge, fmtMoney, daysUntil — reuse 100% |
| Mock data | `src/mocks/community-hub/` | 12 mock files — sẽ thay dần khi BE ready |
| TenantConfig | `src/configs/tenant.ts` | Thêm flag `vertical: 'fitpro'` |
