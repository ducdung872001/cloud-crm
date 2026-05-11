# 04. Roadmap — 4 Phase × 20 tuần (ROLLOUT, không phải BUILD)

> Nguồn: [`../99-source-archive/TNPM_HLD_v2.pdf`](../99-source-archive/TNPM_HLD_v2.pdf) — section "Roadmap triển khai" + đối chiếu với [`../99-source-archive/CRM_Roadmap_v2_enhanced.xlsx`](../99-source-archive/CRM_Roadmap_v2_enhanced.xlsx).

> ## ⚠️ Lưu ý cốt lõi: Build vs Rollout
>
> **HLD roadmap 4 phase × 20 tuần KHÔNG phải thời gian xây platform.** Đây là **thời gian ROLLOUT liên tục cho 7 loại property + UAT** sau khi platform đã build xong và sẵn sàng deploy.
>
> | Giai đoạn | Mục đích | Timeline | Cost |
> |---|---|---|---|
> | **BUILD** (xây mới) | Xây toàn bộ feature Phase 1-3 + Portal + Integration **đầy đủ trước khi rollout** | **~6-9 tháng calendar** với team 9-11 người, hoặc 9-12 tháng với team 7 người | **~8.16 tỷ VND** (Standard) — xem [`../06-cost-estimate/`](../06-cost-estimate/README.md) |
> | **ROLLOUT (HLD)** | Deploy + UAT + tinh chỉnh cho từng nhóm property (B2C chung cư → VP+KCN → TTTM+B2G) | **20 tuần** theo HLD | OPEX, không tính trong cost build |
>
> Cost estimate trong [`../06-cost-estimate/`](../06-cost-estimate/README.md) tập trung **build effort** cho **toàn bộ feature Phase 1–3** + cross-cutting, KHÔNG phải effort của 4 phase rollout HLD.

## 1. Hai timeline song song

### 1.1 BUILD timeline (xây platform — KHÔNG có trong HLD)

```
Tháng:  1     2     3     4     5     6     7     8     9
        │====================  BUILD all features Phase 1-3 + Portal + Integration  ====================│
        │ Sprint plan, infra setup, IAM, multi-tenant                                                   │
        │ → Customer + Contract + Billing + Payment + Operations + Notification                         │
        │ → Vendor + Reports + Lease + CAM + Turnover + B2G + Compliance + Audit                        │
        │ → Portal Owner + Portal Vendor + Integration MSB/Timi/VNPay/MoMo                              │
        │ → System integration test, UAT internal, security review, pentest                             │
                                                                                                        ↑
                                                                                              Platform sẵn sàng rollout
```

- **Effort**: 143 man-month (xem [`../06-cost-estimate/methodology.md`](../06-cost-estimate/methodology.md))
- **Team gợi ý**: 9-11 người parallel → **6-9 tháng calendar**; team gọn 7 người → 9-12 tháng calendar.
- **Cost**: ~8.16 tỷ VND (Standard scenario).
- **Đầu ra**: Platform hoàn chỉnh — sẵn sàng deploy cho TẤT CẢ 7 loại property, không thiếu module nào.

### 1.2 ROLLOUT timeline (deploy + UAT — theo HLD)

Sau khi BUILD xong, platform được rollout dần cho từng loại property theo HLD:

```
Tuần:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20
       │====Phase 1 — Foundation============│
                                            │===Phase 2: Pmt+Vendor==│
                                                                      │====Phase 3 — Lease+Retail+B2G=====│
                                                                                                          │===Phase 4 — Optimize+Scale===│
```

- **Phase 1 (T1-T8)**: Rollout cho **Chung cư + Nhà thấp tầng** (B2C đơn giản nhất). MVP đi production.
- **Phase 2 (T8-T10)**: Rollout cho **Văn phòng + KCN**. Mở full vendor lifecycle + payment auto-debit.
- **Phase 3 (T11-T16)**: Rollout cho **TTTM + Khu HC B2G**. Bật turnover rent + workflow kho bạc.
- **Phase 4 (T17-T20)**: Optimize, AI debt (out-of-scope cost), portfolio dashboard hoàn chỉnh.

> Vì platform đã build xong trước rollout, "deliverable" của mỗi phase rollout là **dữ liệu thực được nạp, KH thực được onboard, UAT pass, go-live cho nhóm property tương ứng**, không phải code mới.

## 2. Phase 1 — Foundation (T1–T8)

**Mục tiêu**: MVP cho property B2C đơn giản (Chung cư, Nhà thấp tầng) đi production.

### Scope BE
- `iam-service`: tenant claim, RBAC, basic OAuth2/JWT.
- `portfolio-service`: 8 endpoint NEW (Portfolio → Project → Building → Floor → Space → Unit).
- `customer-service`: REUSE 6 + EXTEND 2.
- `contract-service`: service contract base (chưa làm lease).
- `billing-service`: fee types, rates, meter reading điện/nước, invoice batch cơ bản.
- `payment-service`: cash + bank transfer + debt ledger; MSB Pay + Timi webhook.
- `operations-service`: Service Request, ticket khiếu nại.
- `notification-service`: template SMS/Email cơ bản.

### Scope FE
~12 trang: `PropertyProjectList`, `PropertyUnitList`, `CustomerPersonList`, `ServiceContractList`, `BillingEngineList`, `MeterReadingList`, `DebtManagementList`, `DebtTransactionList`, `SettingPaymentMethods`, `ServiceRequestList`, `ComplaintTicketList`, `DashboardTNPM` (core).

### Deliverable
- MVP go-live cho 1-2 dự án chung cư pilot.
- Báo cáo P&L cơ bản per project.
- Audit log on.

### Effort estimate (xem [breakdown.md](../06-cost-estimate/breakdown.md))
~46 MM (man-month direct labor).

## 3. Phase 2 — Payment + Vendor (T8–T10... + extended 4-6 tuần)

**Mục tiêu**: Auto-debit + Vendor full vòng đời. Áp dụng cho Văn phòng, KCN.

### Scope BE
- `payment-service` full: auto-debit, gateway abstraction (VNPay/MoMo), webhook security đầy đủ.
- `vendor-service` (NEW toàn bộ 12 endpoint): vendor master, contract, KPI, **3-way match**, approval 4 bước.
- `notification-service`: campaign manual + template engine đầy đủ.
- `report-service`: báo cáo P&L per project + vendor list report.
- `partner-service`: REUSE.

### Scope FE
~6 trang: `VendorManagementList` (5-tab detail), `VendorContractList`, `VendorInvoiceList` (3-way match modal + 4-step workflow), `VendorKPIDashboard`, `PartnerList`, `PartnerContractList`, `FeeNotificationList`.

### Deliverable
- Go-live cho 1-2 site VP + 1 site KCN.
- Vendor portal preview (read-only).
- Báo cáo P&L per project hoàn chỉnh.

### Effort estimate
~30 MM.

## 4. Phase 3 — Lease + Retail + B2G (T11–T16)

**Mục tiêu**: Lease nâng cao, Turnover Rent (TTTM), B2G workflow.

### Scope BE
- `contract-service`: lease escalation schedule, deposit ledger, auto-renew notify/confirm.
- `billing-service`: CAM allocation engine, **Turnover Rent formula** (MAX(Base, %DT), Marketing Levy).
- `compliance-service` (NEW toàn bộ 10 endpoint): B2G workflow kho bạc 4 bước, ngân sách năm HC, audit log full, tenant isolation scan.
- `operations-service`: Maintenance Plan domain (mới — chưa có trong ERD operation).
- `notification-service`: auto rule engine (12 NEW endpoint).

### Scope FE
~10 trang: `LeaseContractList` (4-tab detail), `TurnoverRentList`, `SettingCAMCharges`, `B2GComplianceList` (4-step workflow), `MaintenancePlanList`, `AuditLogList`, `VendorPortalPreview` full (NCC submit invoice).

### Deliverable
- Go-live cho 1 TTTM + 1 khu HC B2G.
- POS integration prototype (optional, không tính cost mặc định).

### Effort estimate
~30 MM.

## 5. Phase 4 — Optimize + Scale (T17–T20) — **Out-of-scope cost ước tính**

**Mục tiêu**: AI, portfolio aggregate, Owner/Vendor portal full, mobile.

### Scope (chỉ liệt kê — không tính cost mặc định)
- Dashboard BI toàn portfolio (cross-project).
- **AI phân tích công nợ** — ML scoring (out-of-scope).
- Vendor KPI dashboard cross-vendor.
- Owner Portal full (CĐT self-service, có thể SSO/SAML).
- API mở cho CĐT tự kết nối hệ thống.
- Mobile app NCC đầy đủ.
- Mobile app cư dân Timi-like (out-of-scope).

Nếu TNPM xác nhận làm Phase 4 → cộng thêm ước tính:
- Portfolio aggregate + Owner Portal full + Vendor Portal full: **+25 MM** (đã reserve một phần trong cost mặc định).
- AI debt analytics: **+12 MM** (ML engineer + data pipeline) — cần data ≥ 6 tháng.
- Mobile cư dân Timi-like: **+18-25 MM**.

## 6. Critical path & dependency

```
T1 ──── T8 ──── T10 ──── T16 ──── T20
│       │       │        │        │
│       │       │        │        └─ Phase 4 (optional)
│       │       │        │
│       │       │        └─ TTTM + B2G ready
│       │       │
│       │       └─ VP + KCN ready
│       │
│       └─ MVP B2C ready (Chung cư pilot)
│
└─ Infra setup + IAM + multi-tenant chốt
```

**Dependency cứng**:
1. IAM + multi-tenant phải xong **trước T2** mới start được customer/contract.
2. `contract-service` base xong trước T3 mới start billing.
3. `payment-service` cơ bản xong trước T5 mới integrate MSB/Timi.
4. Permission grant ops `/management/ VIEW` cho test user phải xong **trước T1** (đang là blocker hiện tại).

## 7. Mốc thanh toán đề xuất (suggested billing milestone)

| Milestone | Mô tả | % cost |
|---|---|---:|
| M0 — Kick-off | Hợp đồng ký + initial PO | 15% |
| M1 — End Phase 1 (T8) | MVP go-live cho 1 site pilot, P&L cơ bản OK | 25% |
| M2 — End Phase 2 (T12) | VP + KCN go-live, vendor 3-way match production | 25% |
| M3 — End Phase 3 (T18) | TTTM + B2G go-live, turnover rent OK | 25% |
| M4 — Acceptance + 30 ngày warranty | UAT pass + warranty period | 10% |

> Billing milestone là **suggested** — cost estimate ở `06-cost-estimate/` chỉ tính tổng cost build, không bao gồm phí maintain hậu mãi (sẽ có annual support fee riêng).
