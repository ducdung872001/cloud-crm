# [customer] Seed 2 custom attributes cho tenant W-House: mentorCode + houseNumber

**Severity:** 🟢 LOW (chỉ seed data cho 1 tenant, không ảnh hưởng ngành khác)
**Service:** `cloud-customer-master`
**Phát hiện:** 2026-04-21, yêu cầu từ khách hàng W-House (nhánh community-hub)
**Context:** [docs/requirements/analysis.md](../../requirements/analysis.md) phân tích Excel Google Form đăng ký Squat Mentor

---

## Bối cảnh

Tenant `hub.reborn.vn` (W-House — community Mentor7) cần lưu **mã số mentor** và **số nhà** cho mỗi thành viên. Đây là 2 trường đặc thù của cộng đồng W-House, **không phải field chuẩn** của Customer entity.

Ví dụ dữ liệu từ Google Form:
- Họ tên: Bùi Thị Hồng Giang — **Mã**: 5021-255 → mentorCode = 5021, houseNumber = 255
- Họ tên: Nguyễn Hữu Hân — **Mã**: 6272, 315 → mentorCode = 6272, houseNumber = 315

FE đã có trang **quản lý Custom Attribute** sẵn tại `/setting_customer` → tab "Danh sách trường thông tin bổ sung". Endpoint BE đã hỗ trợ:

```
GET    /customer/customerAttribute/list
POST   /customer/customerAttribute/update  (create/update)
DELETE /customer/customerAttribute/delete
```

Task này chỉ cần **seed 2 attribute cho tenant W-House** (không phải implement endpoint mới).

## Việc cần làm

### Option A — Script seed chạy 1 lần (khuyến nghị)

Viết script idempotent chèn 2 record vào bảng `customer_attribute` cho `tenant_id = <hub.reborn.vn>`:

```sql
-- Kiểm tra tenant_id của hub.reborn.vn
SET @tenant_id = (SELECT id FROM tenant WHERE domain = 'hub.reborn.vn' LIMIT 1);

INSERT INTO customer_attribute
  (tenant_id, code, name, data_type, required, display_order, customer_type_id, created_at, updated_at)
VALUES
  (@tenant_id, 'mentorCode',  'Mã số Mentor', 'text', 0, 10, NULL, NOW(), NOW()),
  (@tenant_id, 'houseNumber', 'Số nhà',       'text', 0, 11, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), display_order = VALUES(display_order);
```

**Chú ý:** Schema thực tế của `customer_attribute` có thể khác — BE team confirm tên cột (`code`, `data_type`, `customer_type_id`, …) trước khi chạy. Dưới đây là **spec FE cần**:

| Field | Giá trị | Ý nghĩa |
|---|---|---|
| `code` | `mentorCode` | Key lập trình, unique trong tenant |
| `name` | `Mã số Mentor` | Nhãn hiển thị trên UI |
| `dataType` / `type` | `text` (string) | Kiểu dữ liệu |
| `required` | `false` | Không bắt buộc (một số người không phải Mentor7) |
| `displayOrder` | `10` | Thứ tự trên form |

Tương tự cho `houseNumber` — `name: "Số nhà"`, `displayOrder: 11`.

### Option B — Gọi API sau khi tenant provisioning

Nếu BE có sẵn **post-provisioning hook** (tenant setup script chạy sau khi tạo tenant), bổ sung 2 dòng vào hook cho loại tenant "community-hub":

```python
# pseudo-code
if tenant.industry == "community-hub":
    customer_attribute_service.upsert(tenant.id, {
        "code": "mentorCode",  "name": "Mã số Mentor", "dataType": "text", "displayOrder": 10
    })
    customer_attribute_service.upsert(tenant.id, {
        "code": "houseNumber", "name": "Số nhà",       "dataType": "text", "displayOrder": 11
    })
```

→ Tất cả tenant `community-hub` mới sẽ có sẵn 2 attribute này, không cần seed thủ công.

### Option C — Admin tự tạo qua UI (fallback)

Nếu không có script/hook, hướng dẫn admin W-House tạo qua UI:
1. Vào `/setting_customer` → tab "Danh sách trường thông tin bổ sung"
2. Bấm "Thêm mới" → nhập:
   - Tên trường: `Mã số Mentor`
   - Kiểu dữ liệu: `Văn bản`
   - Bắt buộc: Không
3. Lặp cho `Số nhà`

Option này không cần BE can thiệp, nhưng mỗi tenant community-hub mới phải tự làm lại → nên thay bằng A hoặc B về lâu dài.

## Liên quan Event Registration

Khi công khai form đăng ký event, FE đang gọi `POST /market/events/{slug}/register` có truyền `mentorCode` + `houseNumber`. Xem [market/events.md](../market/events.md) — Gap 5. BE market service cần:
1. Lookup `customer_attribute` theo `code` = `mentorCode` / `houseNumber` trong tenant hiện tại
2. INSERT / UPDATE `customer_attribute_value` (bảng mapping customer ↔ attribute) với giá trị nhận được

**Nếu BE không tìm thấy attribute** (chưa seed) → không crash, chỉ skip write + log warning. FE cũng hiển thị field ở form "luôn luôn" — nếu tenant không dùng Mentor, user để trống.

## Acceptance Criteria

- [ ] Tenant `hub.reborn.vn` có 2 record trong `customer_attribute`: `mentorCode`, `houseNumber`
- [ ] `GET /customer/customerAttribute/list` trả 2 attribute này khi login W-House
- [ ] `POST /market/events/{slug}/register` ghi được 2 attribute value vào customer (xem events.md Gap 5)
- [ ] Page `/setting_customer` → tab "Trường thông tin bổ sung" hiển thị 2 attribute, admin có thể xem/sửa/xoá
- [ ] Các tenant khác (retail / spa / tnpm / banking) KHÔNG bị ảnh hưởng — chỉ W-House có 2 attribute này

## Không được làm

- KHÔNG thêm `mentorCode` / `houseNumber` như **field cứng** trong bảng `customer` — phải đi qua Customer Attribute mechanism
- KHÔNG seed cho tenant khác (retail / spa / …) — chỉ `community-hub` industry
- KHÔNG đổi endpoint contract `/customer/customerAttribute/*`

## Reference

- FE setting page: [src/pages/SettingCustomer/partials/CustomerAttribute](../../../src/pages/SettingCustomer/partials/CustomerAttribute)
- FE URL map: [src/configs/urls.ts:1585-1591](../../../src/configs/urls.ts#L1585-L1591)
- Tài liệu gốc: [docs/requirements/analysis.md](../../requirements/analysis.md)
