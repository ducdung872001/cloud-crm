# Seed spec — `customer` service (TNPM)

> Dispatch qua `/handoff-out-ms` với `service=customer`. Status: **1/6 đã handoff** (vendor — [#14](https://github.com/ducdung872001/cloud-customer-master/issues/14)).

## Datasets (5 master + 1 enum)

| # | Dataset | Source | Records | Status |
|---|---|---|---|---|
| 1 | `MOCK_VENDORS` | [snapshot L162–168](../mock-snapshot-tnpm.ts) | 5 | ✅ Dispatched #14 |
| 2 | `VENDOR_SERVICE_TYPES` (enum) | snapshot L268–279 | 10 (+2) | ✅ Dispatched #14 |
| 3 | `MOCK_CUSTOMERS` | snapshot L76–83 | 6 | chưa |
| 4 | `MOCK_PARTNERS` | snapshot L609–724 | ~10 | chưa |
| 5 | `MOCK_STAFF_SCHEDULES` | snapshot L1565–1647 | ~7 | chưa |
| 6 | `MOCK_AUDIT_LOGS` | snapshot L1345–1471 | ~10 | chưa (cân nhắc Kafka `log-capture` thay vì DB seed) |

## Shape tóm tắt

**Customers** — B2B/B2C khách thuê/cư dân. Fields: `code, type, name, shortName, taxCode, address, contactName, phone, email, status, projectId, unitId`. ProjectId/unitId là cross-ref operation.

**Partners** — đối tác vận hành/môi giới/nhà thầu phụ. Fields tương tự customer + `partnerType, commissionRate, contractCount`.

**Staff schedules** — lịch làm việc nhân viên BĐS (PM, kỹ thuật, kế toán toà nhà). Fields: `employeeId, projectId, shiftType, startTime, endTime, status, notes`.

**Audit logs** — log hành động user (login, create/update/delete, approve…). Service `customer` lưu hoặc forward sang Kafka `log-capture` để BI consume. Fields: `userId, action, entityType, entityId, timestamp, ip, payload`.

## Schema notes

- `customer` service hiện đang phải migrate sang `cloud-org` cho employee/department/role/permission (xem [project_org_microservice memory](../../../../memory/project_org_microservice.md)). Customer/partner/vendor giữ ở `customer`.
- Multi-tenant: gắn `bsn_id`.
- Audit log có thể không seed mà generate khi user thao tác — confirm với BE.

## Cross-service refs cần BE nhận

- `customers.projectId/unitId` → cần `operation` seed trước
- Không reference service khác cho vendors/partners/staff schedule

## Ready-to-dispatch body

Khi cần dispatch, dùng template tương tự #14:

```
service=customer
slug=seed-customers-partners-tnpm
goal="Seed customers + partners + staff schedules cho tenant <tnpm-tenant>"
scope="MOCK_CUSTOMERS (6) + MOCK_PARTNERS (~10) + MOCK_STAFF_SCHEDULES (~7). Vendor đã có Issue #14."
```
