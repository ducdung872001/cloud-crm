# Seed spec — `operation` service (TNPM) ⭐ CORE

> Service CORE nhất cho tnpm. Dispatch trước các service khác (operation cung cấp projectId/unitId mà customer/contract/sales/care reference).

## Datasets (6 master + 1 enum)

| # | Dataset | Source | Records | Maps to BE table |
|---|---|---|---|---|
| 1 | `MOCK_PORTFOLIOS` | snapshot L6–10 | 3 | mới? (BE confirm có entity portfolio chưa) |
| 2 | `MOCK_PROJECTS` | snapshot L12–55 | 6 | `project` |
| 3 | `MOCK_UNITS` | snapshot L57–74 | 12 | `space` (operation entity) |
| 4 | `MOCK_METER_READINGS` | snapshot L310–344 | 6 | `electric_index` + `water_index` + `utility_reading` |
| 5 | `MOCK_UTILITY_RATES` | snapshot L346–403 | ~10 | `electricity_rate` + `water_rate` + `management_fee_rate` |
| 6 | `MOCK_CAM_CHARGES` | snapshot L1048–1101 | ~5 | `other_fee` (CAM allocation) |
| 7 | `PROJECT_TYPE_OPTIONS` (enum) | snapshot L245–253 | 7 | `space_type` |

## Shape tóm tắt

**Portfolios** — gom nhiều project của 1 chủ đầu tư/owner. Có thể chưa có entity tương đương trong `operation` — BE confirm hoặc tạo mới (`portfolio` parent table).

**Projects (6 mẫu):**
- VCITY-001 Vinhomes City Park (apartment, 480 units, 85.8% occupancy)
- GOLD-001 Goldmark City Office Tower A (office, 120 units)
- VINH-IPC KCN Vinh Phúc (industrial, 85 units)
- AEON-001 AEON Mall Long Biên (retail, 320 units)
- ECOPARK-001 Ecopark Villa Zone (villa, 156 units)
- HC-BADINH Khu Liên Cơ Quan HC Ba Đình (government, 12 units)

**Units (12 mẫu)** — đại diện các loại space: apartment (A-1201, A-1202, B-0805, C-2301), office (TA-0201, TA-0501, TA-0801), factory (F1-001, F2-001), retail_shop (AEON-G001, G002, F1-001).

**Meter readings + Utility rates** — chỉ số điện/nước hàng tháng + biểu giá lũy tiến. Cross-ref projectId, unitId.

**CAM charges** — chi phí Common Area Maintenance phân bổ cho từng tenant theo m² hoặc revenue share.

## Schema notes (theo ERD operation)

- 23 bảng trong `prod_clouddb_operation` (xem [SERVICE_OVERVIEW.md](https://github.com/ducdung872001/cloud-operation-master/blob/master/docs/SERVICE_OVERVIEW.md)).
- Pattern CRUD: `/operation/<resource>/{list,get,update,delete}`, response envelope `DfResponse<T>`.
- Multi-tenant: `bsn_id` lấy từ JWT.
- Auth check: gọi `biz.reborn.vn/customer/employee/permission/checker` (sau migration org → `biz.reborn.vn/org/employee/permission/checker`).

## Ready-to-dispatch body

```
service=operation
slug=seed-projects-units-tnpm
goal="Seed 6 projects + 12 units + portfolios cho tenant <tnpm-tenant>"
scope="Master entities chỉ — meter/rate/CAM sẽ handoff riêng nếu cần"
```
