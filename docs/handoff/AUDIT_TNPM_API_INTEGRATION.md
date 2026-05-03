# Audit — TNPM FE × BE API integration status

**Ngày**: 2026-05-03
**Scope**: 31 trang TNPM list-page + dashboard + setting → so với 12 microservice BE
**Phương pháp**: Đọc page source, so với `tnpmUrls`, probe BE endpoint thật bằng Playwright + JWT thật.

---

## TL;DR

| Trạng thái | Số trang | Ý nghĩa |
|---|---|---|
| ✅ **BE READY + đã wire** | 1 | `PropertyProjectList` (POC) — gọi `operation/project/list`, fallback MOCK nếu fail |
| 🟡 **BE READY, chưa wire** | ~12 | URL đã đúng trong `tnpmUrls` (operation/sales/contract/care), nhưng page vẫn dùng `MOCK_*` |
| 🟠 **BE PARTIAL** | ~8 | Một phần endpoint exist, một phần custom (vd `vendorInvoice.approve`, `serviceRequest.assign` chưa confirm) |
| 🔴 **BE MISSING — cần handoff** | ~10 | Maintenance Plan, Turnover Rent, B2G Compliance, Audit Log, Portfolio, Vendor KPI Summary, Reports, Owner Dashboard, etc. |

**Blocker chung**: Test user `0971234599` (Hòa Phạm, KCN tenant) thiếu permission `/management/ VIEW` trên operation BE → mọi GET/list trả 400 `"Bạn không có quyền thực hiện thao tác này"`. Cần ops grant permission để test thật.

---

## Bảng chi tiết (31 trang)

| Trang | File | BE service | Endpoint convention | Status | Ghi chú |
|---|---|---|---|---|---|
| Dashboard TNPM | `DashboardTNPM.tsx` | aggregate nhiều | — | 🔴 dùng MOCK | Tổng hợp KPI từ 6 nguồn — sau khi các service sẵn sàng, FE aggregate phía client |
| Property Project | `PropertyProjectList.tsx` | `operation` | `/operation/project/{list,get,update,delete}` | ✅ **WIRED** (POC) | Fallback MOCK nếu 401/500 |
| Property Unit | `PropertyUnitList.tsx` | `operation` | `/operation/space/*` (BE gọi "space") | 🟡 ready, chưa wire | URL đã đúng trong `tnpmUrls.unit` |
| Lease Contract | `LeaseContractList.tsx` | `contract` | `/contract/contract/list?type=lease` | 🟠 partial | Convention `?type=lease` chưa confirm BE |
| Service Contract | `ServiceContractList.tsx` | `contract` | `/contract/contract/list?type=service` | 🟠 partial | Same |
| Billing Engine (Invoice) | `BillingEngineList.tsx` | `sales` | `/sales/invoice/*` | 🟠 partial | `generateBulk`, `recordPayment` chưa confirm |
| Meter Reading | `MeterReadingList.tsx` | `operation` | `/operation/electricIndex/*` + `/waterIndex/*` | 🟡 ready | Cần wire 2 entity riêng |
| Turnover Rent | `TurnoverRentList.tsx` | `sales`? | TBD | 🔴 MISSING | Domain mới — cần handoff sales hoặc operation |
| Vendor Management | `VendorManagementList.tsx` | `customer` | `/customer/vendor/*` | 🟡 ready | Vendor master = customer extension |
| Vendor KPI Dashboard | `VendorKPIDashboard.tsx` | analytics | `/customer/vendor/kpi-summary` (TBD) | 🔴 MISSING | Endpoint analytics mới |
| Vendor Contract | `VendorContractList.tsx` | `contract` | `/contract/contract/list?type=vendor` | 🟠 partial | |
| Vendor Invoice | `VendorInvoiceList.tsx` | `sales` + `bpm` | `/sales/vendorInvoice/*` + `bpm/process` | 🟠 partial | Approval workflow đi qua bpm |
| Service Request | `ServiceRequestList.tsx` | `care` | `/care/ticket/list?category=service_request` | 🟠 partial | Filter `category` chưa confirm |
| Maintenance Plan | `MaintenancePlanList.tsx` | `operation`? | `/operation/maintenancePlan/*` | 🔴 MISSING | Operation BE chưa có domain này (xem ERD) |
| Complaint Ticket | `ComplaintTicketList.tsx` | `care` | `/care/ticket/list?category=complaint` | 🟠 partial | |
| Staff Schedule | `StaffScheduleList.tsx` | `customer` | `/customer/schedule/*` | 🟡 ready | |
| Partner | `PartnerList.tsx` | `customer` | `/customer/partner/*` | 🟡 ready | |
| Partner Contract | `PartnerContractList.tsx` | `contract` | `/contract/contract/list?type=partner` | 🟠 partial | |
| Portfolio Dashboard | `PortfolioDashboardList.tsx` | analytics | aggregate | 🔴 MISSING | |
| Owner Dashboard | `OwnerDashboard.tsx` | analytics | aggregate | 🔴 MISSING | |
| B2G Compliance | `B2GComplianceList.tsx` | unknown | new domain | 🔴 MISSING | Domain pháp lý — cần handoff (operation extension hoặc microservice mới) |
| Audit Log | `AuditLogList.tsx` | `customer`? | TBD | 🔴 MISSING | Operation publish Kafka topic `action-log` — có thể tap vào |
| Fee Notification | `FeeNotificationList.tsx` | `notification` | `/notification/email/*` + `/zns/*` + template | 🟡 ready | Pending notification BE accept JWT (issue #4) |
| Report TNPM | `ReportTNPM.tsx` | aggregate | — | 🔴 MISSING | Custom analytics, có thể aggregate từ list endpoints |
| Setting TNPM | `SettingTNPM.tsx` | nhiều | — | 🟡 partial | Config payment gateway → integration; setting employee → customer |
| Setting Payment Methods | `PaymentReconciliation` | `integration` | `/integration/*` config | 🟡 ready | |
| Setting Project (cũ) | `setting_project` | legacy | — | — | Chưa rõ có dùng ở tnpm không |
| Detail Project | `DetailProject.tsx` | `operation` | `/operation/project/get` + `/building/list` + `/space/list` | 🟡 ready | |
| Tickets | `TicketSettlementList.tsx` | `care` | `/care/ticket/*` | 🟡 ready | |
| Middle Work | `middle_work` | legacy | — | — | |
| Vendor Portal Preview | `VendorPortalPreview.tsx` | preview-only | — | — | UI mockup, không cần BE |

---

## 23 endpoint operation BE cần dùng cho tnpm

Tất cả theo convention `/operation/<resource>/{list,get,update,delete}`:

| Resource | FE page sử dụng | Đã wire? |
|---|---|---|
| `project` | PropertyProjectList, DetailProject, Dashboard | ✅ POC |
| `building` | DetailProject | 🟡 |
| `buildingFloor` | DetailProject | 🟡 |
| `space` (≡ FE "unit") | PropertyUnitList, DetailProject, MeterReading | 🟡 |
| `spaceType` | AddEditUnitModal | 🟡 |
| `spaceCustomer` | LeaseContract (tenant history) | 🟡 |
| `electricMeter` | MeterReading setup | 🟡 |
| `meterSpace` | Map meter → space | 🟡 |
| `electricIndex` | MeterReading entry | 🟡 |
| `electricityRate` | Setting utility rates | 🟡 |
| `electricFee` | BillingEngine (compose invoice line) | 🟡 |
| `waterMeter` | Meter setup | 🟡 |
| `waterMeterSpace` | Map | 🟡 |
| `waterIndex` | MeterReading water | 🟡 |
| `waterRate` | Setting | 🟡 |
| `waterFee` | BillingEngine line | 🟡 |
| `managementFee` | BillingEngine line + Setting | 🟡 |
| `managementFeeRate` | Setting CAM | 🟡 |
| `otherFee` | BillingEngine extras | 🟡 |
| `vehicle` | Vehicle list (TBD page) | 🔴 chưa có UI |
| `vehicleRegistration` | Renewal flow (TBD) | 🔴 chưa có UI |
| `parkingFee` | Setting parking rate (TBD) | 🔴 chưa có UI |
| `utilityReading` | Aggregated meter reading (TBD) | 🔴 chưa có UI |

---

## Yêu cầu BE để unblock

### 1. Operation BE — grant permission `/management/` cho user tnpm tenant
- **Blocker hiện tại**: 400 "Bạn không có quyền thực hiện thao tác này! Path: /management/, Action: VIEW" cho mọi GET
- User test: `0971234599` (Hòa Phạm, employee.id=54, isOwner=1, KCN tenant). isOwner=1 nhưng vẫn fail permission check
- Cần ops/BE: grant `/management/` (VIEW/ADD/UPDATE/DELETE) hoặc clarify cơ chế provisioning quyền

### 2. Operation BE — bổ sung domain Maintenance Plan
- FE đang có `MaintenancePlanList`, không có entity tương ứng trong ERD `cloud-operation` (xem 7 domain hiện tại)
- Đề xuất: thêm bảng `maintenance_plan`, `maintenance_task`, `maintenance_history` + endpoint convention `/operation/maintenancePlan/{list,get,update,delete}`
- Quan hệ FK: `maintenance_plan.building_id`, `maintenance_plan.vendor_id` (cross-DB)

### 3. Sales BE — confirm Turnover Rent + Invoice generateBulk + Vendor Invoice approve
- `turnoverRent`: domain mới (% doanh thu mặt bằng bán lẻ trả về owner) — cần CRUD + verify workflow
- `invoice.generateBulk`: phát hành kỳ phí định kỳ cho nhiều cư dân — cần input (period, projectIds, lineConfig)
- `vendorInvoice.approve|reject`: workflow 4 cấp — confirm endpoint nằm ở sales hay phải đi qua bpm

### 4. Contract BE — confirm convention list filter `?type=lease|service|vendor|partner`
- FE giả định 1 entity `contract` với field `type` discriminator. Nếu BE tách 4 endpoint riêng (`/contract/leaseContract/list`, ...) thì FE cần đổi.

### 5. Care BE — confirm filter `?category=service_request|complaint` cho ticket
- FE muốn 1 endpoint, lọc client-side qua category. Nếu không có field `category` thì cần discuss model.

### 6. Custom analytics — Vendor KPI Summary, Portfolio P&L, Owner Dashboard
- Aggregate cross-service. Có thể:
  - (a) FE aggregate client-side từ list endpoints — đơn giản, ko cần BE mới
  - (b) BE thêm endpoint `/customer/vendor/kpi-summary`, `/sales/portfolio-pnl` v.v. — phức tạp, performant hơn

### 7. B2G Compliance — domain pháp lý mới
- Chưa nằm trong scope microservice nào. Đề xuất: tạo extension trên `operation` (vì gắn với property) hoặc microservice mới `cloud-b2g`.

### 8. Audit Log
- `operation` đã publish Kafka topic `action-log`. Cần consumer + endpoint query → có thể tạo trong microservice `customer` hoặc service mới.

---

## Bước tiếp theo

1. **Send handoff** cho operation BE: grant permission + maintenance plan + bsn_id mapping cho tnpm tenant
2. **Wire** 5 trang ưu tiên cao (operation domain): PropertyUnit, MeterReading (electricIndex+waterIndex), BillingEngine (3 fee endpoint), DetailProject, ManagementFee setting
3. **Send handoff** cho sales BE: turnoverRent + invoice generateBulk + vendorInvoice approve workflow
4. **Send handoff** cho contract BE: confirm list filter convention `?type=`
5. **Wire** vendor + partner + schedule (customer domain)
6. **Defer** B2G + Maintenance Plan + Audit Log + Reports đến khi BE cấp endpoint
