# Dead Code Audit - Reborn Retail CRM

Danh sach code thua khong lien quan den Retail, phan loai theo do an toan khi xoa.

---

## TIER 1: XOA AN TOAN

> 13 service files BDS + 10 model directories + backup files: **DA XOA XONG**
> `PurchaseRequest/`, `kpiGoal/`: da xac nhan dang duoc dung (Campaign pages) — khong phai dead code
> `treatmentHistory.ts`: da xac nhan dang duoc dung (CustomerPerson, CustomerAndSupplier) — khong phai dead code

**Con lai — Component khong duoc import:**

| # | Component | Ghi chu |
|---|-----------|---------|
| 1 | `src/components/OmniCXMChat/` | 0 imports ngoai thu muc cua no (chi tu-reference) |

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

| Nhom | Trang thai | Con lai |
|------|-----------|---------|
| **TIER 1** (xoa an toan) | DA XOA gan het (13 services + 10 models) | 1 component (OmniCXMChat) |
| **TIER 2** (xoa pages non-retail) | CHUA XOA | ~19 page directories (~12 MB) |
| **TIER 3** (xem xet) | CHUA XOA | ~5 services + ~7 model dirs + 1 hook (~200 KB) |

---

## LUU Y QUAN TRONG

1. Khi xoa TIER 2, **phai xoa/comment routes tuong ung trong `src/configs/routes.tsx`** de tranh build error
2. Khi xoa TIER 2, **kiem tra `src/configs/urls.ts`** co URL constants nao chi dung boi pages bi xoa
3. **KHONG xoa** cac Settings pages dung chung (SettingSell, SettingCustomer, SettingLoyalty, etc.) - day la retail core
4. **KHONG xoa** cac components dung chung (kanbanBpm, kanbanCommon) vi chung duoc dung boi ca retail pages (OrderTracking, Warranty, Ticket)
5. Context `userContext.dataBeauty` nen duoc giu lai vi nam trong shared context - chi xoa khi refactor context
