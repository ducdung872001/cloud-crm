# Seed spec — `care` service (TNPM)

## Datasets (2 master + 1 enum)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_SERVICE_REQUESTS` | snapshot L183–188 | 4 | `ticket` (extension fields) |
| 2 | `MOCK_MAINTENANCE_PLANS` | snapshot L190–195 | 4 | mới? hoặc `ticket` type=maintenance |
| 3 | `MOCK_COMPLAINT_TICKETS` | snapshot L1473–1563 | ~7 | `ticket` type=complaint |
| 4 | `SERVICE_REQUEST_CATEGORIES` (enum) | snapshot L255–266 | 10 | lookup |

## Shape tóm tắt

**Service requests (4 mẫu)** — yêu cầu dịch vụ từ cư dân:
- SR-2024-001: Rò rỉ nước toilet (in_progress, assigned KT Việt)
- SR-2024-002: Mất điện phòng server (resolved, KT Việt)
- SR-2024-003: Thang máy block B kêu cọ (pending, Otis VN)
- SR-2024-004: Cổng barrier hỏng (pending, BV 24/7)

Fields: `code, projectId/projectName, customerId/customerName, unitCode, category, priority (urgent/high/medium/low), title, description, status (pending/in_progress/resolved/closed), assignedVendorId, assignedEmployeeName, createdAt, dueAt, completedAt`.

**Maintenance plans (4 mẫu)** — kế hoạch bảo trì định kỳ:
- MP-2024-001: Bảo trì thang máy Q2 (Otis VN, quarterly)
- MP-2024-002: Kiểm tra PCCC Q2 (PCCC HN, semi-annual)
- MP-2024-003: Bảo dưỡng MEP (KT Việt, quarterly)
- MP-2024-004: Kiểm tra điện nhà máy (KT Việt, annual)

Fields: `code, projectId, category, title, vendorId, plannedDate, estimatedCost, status, frequency (monthly/quarterly/semi-annual/annual)`.

**Complaint tickets (~7)** — khiếu nại từ cư dân (khác SR — không gắn vendor, chỉ ghi nhận VOC).

**SR categories enum (10):** maintenance / electrical / plumbing / elevator / fire_protection / security / cleaning / air_conditioning / pest_control / other.

## Schema notes

- `care` service base path `/care/ticket/*`. SR + maintenance + complaint đều có thể map về `ticket` với `ticket_type` discriminator.
- Multi-tenant `bsn_id`.
- Workflow approval SR (chuyển vendor xử lý) delegate sang `bpm`.

## Cross-service deps

- `SR.customerId, unitCode` → customer + operation
- `SR.assignedVendorId` → customer
- `maintenance.vendorId` → customer
- `maintenance.projectId` → operation
- `complaint.customerId` → customer

→ Dispatch SAU customer + operation.

## Ready-to-dispatch body

```
service=care
slug=seed-sr-maintenance-tnpm
goal="Seed service requests + maintenance plans + complaint tickets cho tenant <tnpm-tenant>"
scope="3 dataset (~15 records) + enum 10 SR categories. Yêu cầu customer + operation đã seed."
```
