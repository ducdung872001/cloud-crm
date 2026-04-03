# Dead Code Audit - Reborn Retail CRM

Danh sach code thua khong lien quan den Retail, phan loai theo do an toan khi xoa.

---

## TIER 1: XOA AN TOAN - Services khong duoc import o bat ky dau (0 references)

**13 service files + model tuong ung** - Hoan toan khong duoc dung:

| # | Service File | Linh vuc |
|---|-------------|----------|
| 1 | `src/services/ElectricityMeterService.ts` | Quan ly dien (BDS) |
| 2 | `src/services/ElectricityRateService.ts` | Gia dien (BDS) |
| 3 | `src/services/WaterRateService.ts` | Gia nuoc (BDS) |
| 4 | `src/services/UtilityReadingService.ts` | Doc chi so dien nuoc (BDS) |
| 5 | `src/services/RentalTypeService.ts` | Loai cho thue (BDS) |
| 6 | `src/services/VehicleService.ts` | Quan ly xe (BDS) |
| 7 | `src/services/VehicleRegistrationService.ts` | Dang ky xe (BDS) |
| 8 | `src/services/ParkingFeeService.ts` | Phi gui xe (BDS) |
| 9 | `src/services/EarningsService.ts` | Thu nhap (BDS) |
| 10 | `src/services/ContractorPaymentService.ts` | Thanh toan nha thau (BDS) |
| 11 | `src/services/ManagementFeeService.ts` | Phi quan ly (BDS) |
| 12 | `src/services/ManagementFeeRateService.ts` | Muc phi quan ly (BDS) |
| 13 | `src/services/OrtherFeeService.ts` | Phi khac (BDS) |

**Model directories khong duoc import (0 references):**

| # | Model Directory |
|---|----------------|
| 1 | `src/model/earnings/` |
| 2 | `src/model/rentalType/` |
| 3 | `src/model/diarySurgery/` |
| 4 | `src/model/contractApproach/` |
| 5 | `src/model/contractProduct/` |
| 6 | `src/model/PurchaseRequest/` |
| 7 | `src/model/kpiApply/` |
| 8 | `src/model/kpiDatasource/` |
| 9 | `src/model/kpiGoal/` |
| 10 | `src/model/kpiObject/` |
| 11 | `src/model/kpiTemplate/` |
| 12 | `src/model/kpiTemplateGoal/` |

**Component khong duoc import:**

| # | Component |
|---|-----------|
| 1 | `src/components/OmniCXMChat/` (0 imports ngoai thu muc cua no) |

**Export khong dung cho retail:**

| # | File |
|---|------|
| 1 | `src/exports/treatmentHistory.ts` (beauty/spa domain) |

---

## TIER 2: XOA CO DIEU KIEN - Pages non-retail (can xoa route tuong ung trong routes.tsx)

**Nhom BPM/Workflow (~12MB):**

| # | Page Directory | Size | Mo ta |
|---|---------------|------|-------|
| 1 | `src/pages/BPM/` | 8.0 MB | Business Process Management |
| 2 | `src/pages/BusinessRule/` | 26 KB | Business Rules |
| 3 | `src/pages/BusinessRuleConfig/` | 134 KB | Business Rules Config |
| 4 | `src/pages/ConfigBPM/` | 256 KB | BPM Configuration |
| 5 | `src/pages/HandleTask/` | 5 KB | BPM Task Handler |
| 6 | `src/pages/MiddleWork/` | 1.1 MB | Workflow Middleware |
| 7 | `src/pages/ManagerWork/` | 646 KB | Work/Project Manager |
| 8 | `src/pages/UserTaskList/` | 1.4 MB | User Task List |
| 9 | `src/pages/TaskProcessPage/` | 5 KB | Task Processing |
| 10 | `src/pages/ProcessSimulation/` | 21 KB | Process Simulation |
| 11 | `src/pages/ManageDefaultProcesses/` | 33 KB | Default Processes |
| 12 | `src/pages/ManageDataSharing/` | 57 KB | Data Sharing |
| 13 | `src/pages/SettingProcess/` | - | Process Settings |

**Nhom Project Management (~380KB):**

| # | Page Directory | Size |
|---|---------------|------|
| 1 | `src/pages/ProjectList/` | 322 KB |
| 2 | `src/pages/SettingProject/` | 58 KB |

**Nhom HR/Timekeeping:**

| # | Page Directory | Size |
|---|---------------|------|
| 1 | `src/pages/Timekeeping/` | 4 KB |
| 2 | `src/pages/SettingTimekeeping/` | 1 KB |

**Nhom Treatment/Beauty (~59KB):**

| # | Page Directory | Size |
|---|---------------|------|
| 1 | `src/pages/TreatmentSchedule/` | 59 KB |

**Nhom khac:**

| # | Page Directory | Size | Mo ta |
|---|---------------|------|-------|
| 1 | `src/pages/FieldManagement/` | 22 KB | Quan ly vung/lanh tho |
| 2 | `src/pages/IntegratedMonitoring/` | 13 KB | Giam sat he thong |

---

## TIER 3: CAN XEM XET - Co su dung nhung khong phai retail core

**Services dung boi non-retail pages:**

| Service | Dung boi | Ghi chu |
|---------|----------|---------|
| `ProjectRealtyService.ts` | BPM dynamic lookups | Xoa cung BPM |
| `BuildingService.ts` | CxmSurvey | Chi 1 page dung |
| `SpaceService.ts` | CxmSurvey | Chi 1 page dung |
| `BuildingFloorService.ts` | 1 import | Gan nhu unused |
| `SpaceTypeService.ts` | 2 imports | Gan nhu unused |

**Model directories co it reference (1-2 pages):**

| Model | References | Ghi chu |
|-------|-----------|---------|
| `src/model/kpiSetup/` | 1 page | KPI setup |
| `src/model/kpi/` | 2 pages | KPI |
| `src/model/scheduleTreatment/` | 1 page | Treatment |
| `src/model/scheduleConsultant/` | 1 page | Consultant |
| `src/model/treatmentHistory/` | 2 pages | Treatment |
| `src/model/treatmentRoom/` | 3 pages | Treatment |
| `src/model/estimate/` | 4 pages | Estimate/Quote |

**Hook:**

| Hook | Ghi chu |
|------|---------|
| `src/hooks/useLA.ts` | Chi dung boi BPM pages (OLA/SLA) |

---

## TONG KET

| Nhom | So luong files/dirs | Kich thuoc uoc tinh |
|------|-------------------|-------------------|
| **TIER 1** (xoa an toan) | ~13 services + ~12 model dirs + 1 component + 1 export | ~500 KB |
| **TIER 2** (xoa pages non-retail) | ~19 page directories | ~12 MB |
| **TIER 3** (xem xet) | ~5 services + ~7 model dirs + 1 hook | ~200 KB |
| **TONG** | ~60 items | **~13 MB** |

---

## LUU Y QUAN TRONG

1. Khi xoa TIER 2, **phai xoa/comment routes tuong ung trong `src/configs/routes.tsx`** de tranh build error
2. Khi xoa TIER 2, **kiem tra `src/configs/urls.ts`** co URL constants nao chi dung boi pages bi xoa
3. **KHONG xoa** cac Settings pages dung chung (SettingSell, SettingCustomer, SettingLoyalty, etc.) - day la retail core
4. **KHONG xoa** cac components dung chung (kanbanBpm, kanbanCommon) vi chung duoc dung boi ca retail pages (OrderTracking, Warranty, Ticket)
5. Context `userContext.dataBeauty` nen duoc giu lai vi nam trong shared context - chi xoa khi refactor context
