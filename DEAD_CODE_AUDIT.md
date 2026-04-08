# Dead Code Audit - Reborn Retail CRM

Danh sach code thua khong lien quan den Retail, phan loai theo do an toan khi xoa.

---

## TIER 1: DA XOA XONG

- 13 service files BDS
- 10 model directories (earnings, rentalType, diarySurgery, contractApproach, contractProduct, kpiApply, kpiDatasource, kpiObject, kpiTemplate, kpiTemplateGoal)
- Backup files
- Spa/Treatment: model (treatmentHistory, treatmentRoom, scheduleTreatment, scheduleConsultant, treatment), services (TreatmentHistoryService, TreatmentRoomService, ScheduleTreatmentService, ScheduleConsultantService, TreamentService), exports (treatmentHistory.ts)
- BDS services: SpaceCustomerService, OperationProjectService, TenderPackageService, 5 Tier 3 services
- BDS URLs: 16 endpoint blocks + prefixOperation + route URLs (configs/urls.ts + services/urls.ts)
- BDS pages: CxmSurvey
- BDS locales: pageSettingOperate section (vi.ts + en.ts)
- Non-retail pages: ManageDefaultProcesses, Schedule (ScheduleNextList)
- Non-retail models: PurchaseRequest (service file xoa, model xoa)
- Consultation modals: AddConsultationScheduleModal, ModalAddCustomerArrived
- Cleanup imports: CalendarCommon, CustomerPerson, CustomerAndSupplier, CallCenter, selectCommon.ts

**Con lai — Component khong duoc import:**

| # | Component | Ghi chu |
|---|-----------|---------|
| 1 | `src/components/OmniCXMChat/` | 0 imports ngoai thu muc cua no (chi tu-reference) |

---

## TIER 2: CHUA XOA - Pages non-retail (can xoa route tuong ung trong routes.tsx)

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
| 11 | `src/pages/ManageDataSharing/` | 57 KB | Data Sharing |
| 12 | `src/pages/SettingProcess/` | - | Process Settings |

> Luu y: `ManageDefaultProcesses` da xoa. Con lai ProjectRealtyService + PurchaseRequestService + TenderPackageService references trong BPM/UserTaskList — se clean khi xoa Tier 2.

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

**Nhom khac:**

| # | Page Directory | Size | Mo ta |
|---|---------------|------|-------|
| 1 | `src/pages/FieldManagement/` | 22 KB | Quan ly vung/lanh tho |
| 2 | `src/pages/IntegratedMonitoring/` | 13 KB | Giam sat he thong |

---

## TIER 3: CAN XEM XET

**Model directories co it reference (1-2 pages):**

| Model | References | Ghi chu |
|-------|-----------|---------|
| `src/model/kpiSetup/` | 1 page | KPI setup |
| `src/model/kpi/` | 2 pages | KPI |
| `src/model/estimate/` | 4 pages | Estimate/Quote |

**Hook:**

| Hook | Ghi chu |
|------|---------|
| `src/hooks/useLA.ts` | Chi dung boi BPM pages (OLA/SLA) |

---

## TONG KET

| Nhom | Trang thai | Con lai |
|------|-----------|---------|
| **TIER 1** (xoa an toan) | **DA XOA HET** | 1 component (OmniCXMChat) |
| **TIER 2** (xoa pages non-retail) | CHUA XOA | ~16 page directories (~12 MB) |
| **TIER 3** (xem xet) | CHUA XOA | ~3 model dirs + 1 hook |

---

## LUU Y QUAN TRONG

1. Khi xoa TIER 2, **phai xoa/comment routes tuong ung trong `src/configs/routes.tsx`** de tranh build error
2. Khi xoa TIER 2, **kiem tra `src/configs/urls.ts`** co URL constants nao chi dung boi pages bi xoa
3. **KHONG xoa** cac Settings pages dung chung (SettingSell, SettingCustomer, SettingLoyalty, etc.) - day la retail core
4. **KHONG xoa** cac components dung chung (kanbanBpm, kanbanCommon) vi chung duoc dung boi ca retail pages (OrderTracking, Warranty, Ticket)
5. Context `userContext.dataBeauty` nen duoc giu lai vi nam trong shared context - chi xoa khi refactor context
