# [BE · `customer` + `sales` + `billing`] FitPro Phase 3.2 — B2B Wellness

**Microservices:** `customer` (corporate entity), `sales` (B2B package), `billing` (subscription billing)
**URD:** [Part 15 §5 UR-FITPRO-B2B](../../urd/part-15-fitpro-phygital-roadmap.md#ur-fitpro-b2b--b2b-wellness)

## 1. Mục tiêu

Khách hàng doanh nghiệp (DN) mua gói chăm sóc sức khỏe cho nhân viên. HR của DN có dashboard riêng xem kết quả tổng hợp (ẩn danh).

## 2. Schema

### `customer` service — thêm entity Corporate

```sql
CREATE TABLE corporate_customer (
  id VARCHAR(32) PRIMARY KEY,
  tenant_id VARCHAR(32) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  tax_code VARCHAR(32) UNIQUE,
  business_field VARCHAR(128),
  hq_address TEXT,
  hr_contact_name VARCHAR(255),
  hr_contact_phone VARCHAR(32),
  hr_contact_email VARCHAR(128),
  employee_count INT,
  contract_start_date DATE,
  contract_end_date DATE,
  billing_cycle VARCHAR(16),  -- monthly | quarterly | yearly
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mapping member ↔ corporate (1 member có thể thuộc nhiều DN trong đời, nhưng tại 1 thời điểm chỉ 1)
CREATE TABLE corporate_member_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_id VARCHAR(32) REFERENCES corporate_customer(id),
  member_id VARCHAR(32) NOT NULL,
  enrolled_at DATE,
  exited_at DATE,
  is_active BOOLEAN DEFAULT true
);
```

### `sales` service — B2B package

```sql
CREATE TABLE b2b_package (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255),
  corporate_id VARCHAR(32),
  seat_count INT NOT NULL,        -- số nhân viên cover
  price_per_seat_vnd BIGINT,
  total_vnd BIGINT,
  billing_cycle VARCHAR(16),
  features JSONB                  -- danh sách feature bật: MBG, EGIFT, Medlatec, ...
);
```

## 3. API

| Endpoint | Quyền | Mô tả |
|----------|-------|-------|
| `POST /bizapi/customer/corporates` | Admin | Tạo DN |
| `GET /bizapi/customer/corporates` | Master BO | List DN |
| `POST /bizapi/customer/corporates/:id/members` | HR | Thêm nhân viên vào gói |
| `GET /bizapi/sales/b2b/packages` | Master BO | List B2B packages |
| `POST /bizapi/sales/b2b/packages/:id/invoice` | Admin | Auto-generate invoice định kỳ |
| `GET /bizapi/customer/corporates/:id/dashboard` | HR | Dashboard kết quả tổng hợp (anonymized) |

## 4. HR Dashboard (anonymized)

- Tỷ lệ check-in 30 ngày qua.
- % nhân viên đạt target sức khỏe.
- Top 5 improvement metric (không tên cá nhân).
- Tổng buổi tập tháng.

## 5. Billing

- Cycle đầu: `billing` generate invoice theo `billing_cycle`.
- Payment gateway hỗ trợ chuyển khoản B2B (có VAT invoice).
- Nếu DN chậm trả > 15 ngày → freeze all member thuộc DN đó.
