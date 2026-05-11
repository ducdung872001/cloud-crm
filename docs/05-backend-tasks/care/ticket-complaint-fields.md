# BACKEND TASK — Care: Mở rộng Ticket thành quản lý khiếu nại (thay Supporter)

**Discovered:** 2026-04-22 — Q&A khách hàng chuỗi siêu thị (GAP #3)
**Severity:** 🟠 HIGH (demo 2026-04-24)
**Module:** `cloud-care` (hoặc service chứa Ticket hiện tại)
**Prefix:** `/customer/ticket/*`
**FE consumer:** [src/pages/Ticket/partials/AddEditTicketModal/AddTicketModal.tsx](../../../src/pages/Ticket/partials/AddEditTicketModal/AddTicketModal.tsx) + [TicketList.tsx](../../../src/pages/Ticket/TicketList.tsx)

---

## BỐI CẢNH

Q&A câu 1 liệt kê Supporter với các trường: **họ tên, sđt, lịch sử mua hàng, nội dung khiếu nại, đơn vị khiếu nại, tính chất khiếu nại, mức độ khiếu nại, thời gian tạo khiếu nại, kết quả giải quyết**.

Ticket hiện có: `customerName, customerPhone, content, startDate, status` — thiếu **đơn vị tiếp nhận, tính chất, mức độ, kết quả giải quyết**.

---

## PHẦN 1: Schema — thêm 4 columns vào bảng `ticket`

```sql
ALTER TABLE ticket
  ADD COLUMN receiving_unit_id    BIGINT NULL,
  ADD COLUMN complaint_category   VARCHAR(32) NULL,
  ADD COLUMN severity             VARCHAR(16) NULL,
  ADD COLUMN resolution           TEXT NULL;

CREATE INDEX idx_ticket_severity ON ticket(severity);
CREATE INDEX idx_ticket_receiving_unit ON ticket(receiving_unit_id);
```

**Domain values** (hard-coded, không cần bảng master riêng — FE đã fix):

| Field | Values |
|---|---|
| `complaint_category` | `product` / `service` / `delivery` / `price` / `other` |
| `severity` | `low` / `medium` / `high` / `critical` |

`receiving_unit_id` tham chiếu `branch.id` (hoặc `store.id` — tuỳ schema) — chính là chi nhánh/siêu thị tiếp nhận khiếu nại (không nhất thiết là nơi xảy ra sự cố).

---

## PHẦN 2: API update

### Extend `POST /customer/ticket/update`

Thêm vào body:
```json
{
  "receivingUnitId": 12,
  "complaintCategory": "product",
  "severity": "high",
  "resolution": "Đã hoàn tiền 100% và tặng voucher 200k"
}
```

4 trường đều **optional** — ticket thông thường (không phải khiếu nại) sẽ để null.

### Extend `GET /customer/ticket/list` + `/customer/ticket/get`

Bổ sung vào response item:
```json
{
  "receivingUnitId": 12,
  "receivingUnitName": "Siêu thị Thủ Đức",
  "complaintCategory": "product",
  "complaintCategoryName": "Chất lượng sản phẩm",
  "severity": "high",
  "severityName": "Cao",
  "resolution": "Đã hoàn tiền 100% và tặng voucher 200k"
}
```

BE resolve ra `*Name` cho FE hiển thị (hoặc FE tự map — hiện FE đã có fallback map).

---

## PHẦN 3: Filter & Search

Endpoint `POST /customer/ticket/list` chấp nhận thêm filter params:

| Param | Kiểu | Ý nghĩa |
|---|---|---|
| `severity` | string | Lọc theo mức độ (có thể multi: `high,critical`) |
| `complaintCategory` | string | Lọc theo tính chất |
| `receivingUnitId` | number | Lọc theo đơn vị tiếp nhận |
| `isComplaint` | boolean | `true` = chỉ lấy ticket có `severity IS NOT NULL` |

---

## PHẦN 4: Dashboard / Report

Thêm endpoint `GET /customer/ticket/dashboard/complaint`:

```json
{
  "code": 0,
  "result": {
    "totalComplaints":       1234,
    "bySeverity":  [ { "key": "critical", "count": 12 }, ... ],
    "byCategory":  [ { "key": "product",  "count": 450 }, ... ],
    "byUnit":      [ { "unitId": 12, "unitName": "ST Thủ Đức", "count": 88 }, ... ],
    "resolutionRate": 87.5,
    "avgResolutionDays": 2.4
  }
}
```

---

## PHẦN 5: Migration dữ liệu Supporter

Khi khách cutover Supporter → Reborn, cần migration script:

```sql
INSERT INTO ticket (
  customer_id, customer_name, customer_phone,
  content, start_date, status,
  receiving_unit_id, complaint_category, severity, resolution,
  created_at
)
SELECT
  s.customer_id, s.name, s.phone,
  s.complaint_content, s.created_at,
  CASE s.result WHEN 'resolved' THEN 2 ELSE 1 END,
  /* map `s.receiving_store_id` → `branch.id` */
  bmap.branch_id,
  /* map `s.type` → complaint_category */
  CASE s.type
    WHEN 'San pham'  THEN 'product'
    WHEN 'Phuc vu'   THEN 'service'
    WHEN 'Giao nhan' THEN 'delivery'
    WHEN 'Gia'       THEN 'price'
    ELSE 'other'
  END,
  /* map `s.level` → severity */
  CASE s.level
    WHEN 'Nghiem trong' THEN 'critical'
    WHEN 'Cao'          THEN 'high'
    WHEN 'Trung binh'   THEN 'medium'
    ELSE 'low'
  END,
  s.resolution_notes,
  s.created_at
FROM supporter_legacy s
LEFT JOIN branch_map bmap ON bmap.supporter_store_id = s.receiving_store_id;
```

Migration mapping table `branch_map` cần làm riêng theo tenant — đối tác config trực tiếp.

---

## PHẦN 6: Test cases

| TC | Hành động | Expected |
|---|---|---|
| TC-01 | Tạo ticket không khiếu nại (4 field null) | OK, list không có badge mức độ |
| TC-02 | Tạo ticket khiếu nại đủ 4 field | OK, detail hiển thị block "Thông tin khiếu nại" |
| TC-03 | Filter list `severity=critical` | Chỉ trả ticket `severity='critical'` |
| TC-04 | Migration 10.000 record Supporter | 10.000 ticket insert, 4 trường đầy đủ |
| TC-05 | Dashboard gọi trước/sau khi thêm complaint | Số liệu realtime (không cache cũ) |
