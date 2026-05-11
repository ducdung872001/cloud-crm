# BACKEND TASK — Customer: Change log hồ sơ KHTV (audit trail từng trường)

**Discovered:** 2026-04-22 — Q&A khách hàng chuỗi siêu thị (GAP #2)
**Severity:** 🟠 HIGH (demo 2026-04-24)
**Module:** `cloud-customer`
**Prefix:** `/customer/customerChangeLog/*`
**FE consumer:** Tab mới "Lịch sử chỉnh sửa" trên hồ sơ khách hàng ([src/pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerChangeLog/CustomerChangeLog.tsx](../../../src/pages/CustomerPerson/partials/DetailPerson/partials/ListDetailTab/partials/CustomerChangeLog/CustomerChangeLog.tsx))

---

## BỐI CẢNH

Q&A câu 1: Goldmem hiện lưu "**lịch sử thay đổi thông tin KHTV**". Khi cutover, Reborn CRM phải ghi nhận đầy đủ audit trail cho mọi thay đổi trên hồ sơ KH — ai sửa, trường nào, giá trị cũ/mới, vào lúc nào, từ nguồn nào (tự KH qua app, nhân viên, import, API đối tác).

---

## PHẦN 1: Schema

```sql
CREATE TABLE customer_change_log (
  id           BIGSERIAL PRIMARY KEY,
  customer_id  BIGINT NOT NULL,
  field        VARCHAR(64) NOT NULL,     -- "name", "phone", "primaryBranchId", ...
  field_label  VARCHAR(128),             -- Tên hiển thị (optional, FE có map mặc định)
  old_value    TEXT,
  new_value    TEXT,
  updated_by_id  BIGINT,                 -- user_id (NULL nếu là KH tự cập nhật)
  updated_by_name VARCHAR(255) NOT NULL, -- Tên hiển thị người sửa (snapshot)
  source       VARCHAR(16) NOT NULL,     -- self | staff | import | api | system
  ref_id       VARCHAR(64),              -- batch_id cho import, request_id cho api...
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  INDEX idx_ccl_customer_time (customer_id, created_at DESC),
  INDEX idx_ccl_field (field),
  INDEX idx_ccl_source (source)
);
```

**Partition** theo `created_at` (month) nếu dự kiến >10M rows/năm — 3M KH × 4 sửa/năm = 12M rows/năm.

---

## PHẦN 2: Ghi log (write-path)

Mỗi khi `/customer/update` hoặc `/customer/update/byField` được gọi, service phải:

1. **So sánh** payload với bản ghi hiện tại (field-level diff).
2. Với mỗi trường có thay đổi, insert 1 row vào `customer_change_log`:
   - `source` suy từ `request.principal.type` (khách tự cập nhật qua app → `self`, staff → `staff`, import endpoint → `import`, OAuth client → `api`, cron/system job → `system`)
   - `updated_by_name` lấy từ session user hoặc `"Hệ thống"` nếu là cron
3. Viết log **trong cùng transaction** với update để không drift.

**Các trường cần log tối thiểu** (do FE mapping sẵn label):
`name, phone, email, address, gender, dateOfBirth, primaryBranchId, branchId, identityCardNumber, employeeId, customerGroup, customerSource, note`.

Các trường khác cũng log nhưng FE sẽ hiển thị key gốc.

**Không log:** các trường bảo mật (password hash, OTP seed) — nếu có.

---

## PHẦN 3: API read

### `GET /customer/customerChangeLog/list`

Query params:
- `customerId` (required, number)
- `page` (default 1)
- `limit` (default 20, max 100)
- `field` (optional, filter theo 1 field)
- `source` (optional)
- `fromDate`, `toDate` (optional ISO)

Response:
```json
{
  "code": 0,
  "result": {
    "items": [
      {
        "id": 12345,
        "field": "primaryBranchId",
        "fieldLabel": "Siêu thị đăng ký",
        "oldValue": "Siêu thị Q1",
        "newValue": "Siêu thị Thủ Đức",
        "updatedBy": "Nguyễn Văn A",
        "updatedAt": "2026-04-21T10:15:00+07",
        "source": "staff"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**Lưu ý:**
- `oldValue`/`newValue` đã được resolve ra tên hiển thị khi value là FK (branchId → branchName). Nếu chưa resolve được (data đã bị xoá), để giữ ID dạng `#123`.
- `fieldLabel` có thể null nếu BE không có bảng dịch; FE sẽ tự mapping cho các trường phổ biến.

---

## PHẦN 4: Test cases

| TC | Hành động | Expected log entry |
|---|---|---|
| TC-01 | Staff đổi tên KH | 1 row `field=name, source=staff, updatedBy=<staff>` |
| TC-02 | KH đổi SĐT qua app | 1 row `field=phone, source=self` |
| TC-03 | Import 1.000 KH update địa chỉ | 1.000 rows `source=import, ref_id=<batchId>` |
| TC-04 | Update không thay đổi giá trị | 0 row (do diff = empty) |
| TC-05 | Đổi siêu thị đăng ký (`primaryBranchId`) | 1 row — `oldValue/newValue` là **tên siêu thị**, không phải id |
| TC-06 | Cron job system flag KH churn | 1 row `source=system, updatedBy="Hệ thống"` |

---

## PHẦN 5: Retention

- Mặc định giữ **5 năm** (tuân thủ luật bảo vệ dữ liệu cá nhân).
- Sau 5 năm: cron job archive sang S3 Glacier và xóa khỏi bảng nóng.
- Không xoá khi KH yêu cầu `GDPR erasure` — thay bằng pseudonymization: set `new_value = "[đã xoá]"` nhưng giữ audit trail.
