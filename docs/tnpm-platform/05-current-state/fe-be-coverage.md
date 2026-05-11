# 05. Trạng thái hiện tại của prototype

> Cập nhật: 2026-05-11. Nguồn: audit `docs/handoff/AUDIT_TNPM_API_INTEGRATION.md` + thống kê codebase.

## 1. Frontend đã build (FE prototype)

| Chỉ số | Giá trị |
|---|---:|
| Tổng LOC TNPM-specific | **15,589** |
| Pages/modules code | 12,308 |
| Config + routes | 628 |
| Mock data | 1,653 |
| Số trang nghiệp vụ | **22** |
| Menu items (routes.tsx) | 61 |
| Service classes | 11 |
| Test files | 21 |
| LOC trung bình/page | ~709 |

### Top module theo LOC
1. **SettingTNPM** — 1,577 LOC (5 file): CAM charges, payment methods, fee types, fee rates.
2. **DebtManagement** — 962 LOC (3 file).
3. **BillingEngine** — 865 LOC (2 file): billing + meter reading.

### Test coverage
- 14 smoke test file (~113 test case), 112/113 pass.
- 1 MSW integration test (~24 case).
- 6 Playwright E2E spec, ~30 step.
- Typecheck clean.

> Đây là **đầu vào quan trọng cho cost estimate**: prototype này đại diện ~35% effort FE (UI + state + mock data + test), nhưng **chưa wire BE thật** → khi build-from-scratch full, FE effort vẫn ≈ 24 MM (xem methodology).

## 2. Backend audit — Gap FE↔BE

Tổng **31 trang TNPM** đã audit:

| Trạng thái | Số trang | Mô tả |
|---|---:|---|
| ✅ WIRED real API | **1** | `PropertyProjectList.tsx` — POC, fallback MOCK nếu BE 401/500 |
| 🟡 BE READY, FE còn MOCK | **~12** | `PropertyUnitList`, `MeterReadingList`, `VendorManagementList`, `StaffScheduleList`, `PartnerList`, `FeeNotificationList`, `SettingPaymentMethods`, `DetailProject`, `TicketSettlementList`, `SettingTNPM` (partial), 2 setting page khác |
| 🟠 BE PARTIAL | **~8** | `LeaseContractList`, `ServiceContractList`, `BillingEngineList`, `VendorContractList`, `VendorInvoiceList`, `ServiceRequestList`, `ComplaintTicketList`, `PartnerContractList` |
| 🔴 BE MISSING | **~10** | `DashboardTNPM`, `TurnoverRentList`, `VendorKPIDashboard`, `MaintenancePlanList`, `PortfolioDashboardList`, `OwnerDashboard`, `B2GComplianceList`, `AuditLogList`, `ReportTNPM`, một số preview/legacy |

### Blocker P0 hiện tại
- **Permission**: test user `0971234599` (Hoà Phạm, KCN tenant, employee.id=54, isOwner=1) bị BE operation trả 400 *"Bạn không có quyền thực hiện thao tác này — Path: `/management/`, Action: VIEW"* → **mọi GET/list fail** dù `isOwner=1`.
- **Action**: Cần ops grant permission `/management/` (VIEW/ADD/UPDATE/DELETE) cho user/role trước khi wire tiếp.

### Operation BE — 23 resource cần dùng
- 18 resource đã có UI: project, building, buildingFloor, space, spaceType, spaceCustomer, electric/water meter+index+rate+fee, managementFee+rate, otherFee, ...
- 4 resource **chưa có UI**: `vehicle`, `vehicleRegistration`, `parkingFee`, `utilityReading` (aggregate) → cần FE bổ sung khi sẵn sàng.

## 3. Microservice ecosystem — Reuse vs Build new

### Tái sử dụng từ retail/master (12 service đang chạy theo `docs/handoff/MICROSERVICES.md`)
| Service | Reuse cho TNPM | Mức độ |
|---|---|---|
| `billing` | Cashbook, fund, debt, deposit ledger, reconciliation | CAO |
| `bpm` (branch `cloud`) | Workflow engine cho vendor invoice 3-way + B2G + lease auto-renew | CAO |
| `care` | Service Request + Complaint ticket | CAO |
| `contract` | Lease + service + vendor + partner contract base | CAO |
| `customer` | Cư dân + vendor master + employee + role/permission + schedule | CAO |
| `integration` | Payment gateway MSB/Timi/VNPay/MoMo + sInvoice + Zalo OA + webhook | CAO |
| `notification` | Email/SMS/Zalo/FCM + template + history | CAO |
| `sales` | Invoice phát hành định kỳ + deposit + vendor invoice | TRUNG |
| `market` | Loyalty/voucher/event (optional cho cư dân lâu năm) | THẤP |
| `inventory` | Kho vật tư bảo trì (optional) | THẤP |
| `logistics` | Gửi tài liệu pháp lý (optional) | THẤP |
| `finance` | (chỉ dùng cho aggregate finance) | THẤP |

### Cần build NEW (TNPM-specific)
1. **`operation` service domain mở rộng**: Maintenance Plan, vehicle/parking aggregate, utility reading aggregate.
2. **`vendor-service` full vòng đời** (extend customer + contract + sales + bpm).
3. **Lease nâng cao**: `lease_escalation_schedule`, deposit ledger, auto-renew (extend contract).
4. **CAM allocation** (NEW trong billing hoặc operation).
5. **Turnover Rent** (% doanh thu retail tenant) — NEW domain.
6. **B2G Compliance** — đề xuất extension operation hoặc microservice mới `cloud-b2g`.
7. **Audit Log** — append-only, retention 2 năm + S3 archive — consume Kafka topic `action-log`.
8. **Tenant Isolation Scan** — row-level security violation check.
9. **Owner Portal + Vendor Portal** — separate auth domain.
10. **Portfolio P&L + Vendor KPI Summary** — analytics aggregator.

## 4. Endpoint counting summary

| Tổng endpoint | REUSE | EXTEND | NEW |
|---:|---:|---:|---:|
| 152 | 34 (22%) | 24 (16%) | 94 (62%) |

> **62% NEW** — đây là số quan trọng nhất khi giải thích cost cho TNPM/TNTech. Spec gốc ghi 35/40/25 nhưng đếm dòng thực tế thấp hơn nhiều về REUSE.

## 5. Đánh giá maturity prototype hiện tại

| Aspect | Mức | Ghi chú |
|---|---|---|
| FE pages | 70% scope | 22/31 trang phổ biến nhất đã có UI prototype |
| FE wiring BE | 5% | 1/31 trang WIRED, còn lại MOCK |
| BE service domain | 35% | Hạ tầng có, domain TNPM-specific (lease/CAM/turnover/B2G) chưa có |
| Tests | 60% | 113 test case smoke + E2E cover golden path |
| Multi-tenant infra | 20% | Có ý tưởng, chưa implement RLS / schema-per-tenant |
| Integration MSB/Timi | 30% | Có generic gateway abstraction, chưa adapter live |
| Audit log | 15% | Có topic Kafka, chưa có compliance-service consume |
| Owner/Vendor Portal | 10% | Có UI preview, chưa có auth domain riêng |

**→ Khoảng cách prototype → production**: estimate **~120-145 MM direct labor** (xem [`../06-cost-estimate/`](../06-cost-estimate/README.md) để có con số chính xác).
