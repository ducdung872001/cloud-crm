# Part 07 — Data Architecture

> Mô tả chiến lược dữ liệu đa tầng (multi-tenant row-level isolation),
> ERD tổng quan, pattern soft-delete / audit, indexing, và storage tiers
> cho hệ thống B2B CRM phục vụ doanh nghiệp lớn / công ty tech.

---

## 1. Executive Summary

Reborn CRM sử dụng **MySQL** làm primary store với chiến lược
**row-level tenant isolation** — mỗi bản ghi đều có `tenant_id` và
`branch_id`. Dữ liệu được chia thành 11 entity group phù hợp 12
microservice. Pattern soft-delete (`deleted_at`), audit trail, và
indexing composite đảm bảo hiệu suất truy vấn ở quy mô lớn.
Storage chia 3 tầng: hot (MySQL), cache (Redis), cold (S3).

---

## 2. Multi-tenant Strategy

### 2.1. Row-level Isolation

```
                   +-----------+
                   | Request   |
                   | Hostname: |
                   | acme.crm  |
                   +-----+-----+
                         |
                         v
               +---------+---------+
               | Middleware: Resolve|
               | hostname -> tenant|
               +---+--------+------+
                   |        |
         tenant_id=42   branch_id=1
                   |        |
                   v        v
     +-------------+--------+--------------+
     | SELECT * FROM customer              |
     | WHERE tenant_id = 42                |
     |   AND branch_id = 1                 |
     |   AND deleted_at IS NULL            |
     +-------------------------------------+
```

Mỗi table kinh doanh đều có 3 cột bắt buộc:

| Column      | Type         | Mô tả                          |
|-------------|--------------|--------------------------------|
| tenant_id   | BIGINT NN    | ID tenant (công ty khách hàng) |
| branch_id   | BIGINT NN    | ID chi nhánh                   |
| deleted_at  | DATETIME NULL| Soft-delete timestamp           |

### 2.2. Shared Database, Separate Schema

Tất cả tenant dùng chung 1 MySQL instance, chung schema.
BE middleware **tự động inject** `tenant_id` vào mọi query —
developer không cần truyền tay.

---

## 3. ERD Overview — Entity Groups

```
+------------------+     +---------------------+     +------------------+
| TENANCY / ORG    |     | CUSTOMER / CONTACT  |     | SALES PIPELINE   |
| - tenant         |     | - company           |     | - lead           |
| - branch         |     | - contact           |     | - opportunity     |
| - department     |     | - company_hierarchy |     | - deal_stage      |
| - employee       |     | - contact_role      |     | - activity        |
| - role           |     | - segment           |     | - quotation       |
| - permission     |     +----------+----------+     +--------+---------+
+--------+---------+                |                          |
         |                          |    +---------------------+
         |                          v    v
         |              +-----------+----+----------+
         |              | CONTRACT                  |
         |              | - contract                |
         |              | - contract_line           |
         |              | - approval_chain          |
         |              | - e_sign_log              |
         |              +------------+--------------+
         |                           |
         v                           v
+--------+---------+     +-----------+-----------+
| FINANCE          |     | INVENTORY             |
| - invoice        |     | - warehouse           |
| - payment        |     | - product             |
| - receipt        |     | - stock_movement      |
| - tax_report     |     | - purchase_order      |
+------------------+     +-----------------------+

+------------------+     +------------------+     +------------------+
| MARKETING        |     | CARE             |     | BPM / WORKFLOW   |
| - campaign       |     | - ticket         |     | - process_def    |
| - email_template |     | - sla_config     |     | - task_instance  |
| - landing_page   |     | - feedback       |     | - dmn_rule       |
+------------------+     +------------------+     +------------------+

+------------------+
| INTEGRATION      |
| - webhook_config |
| - sync_log       |
| - api_key        |
+------------------+
```

---

## 4. B2B-specific Data Model

### 4.1. Company Hierarchy

```
company (id=1, parent_id=NULL)   -- Tập đoàn ABC
  |-- company (id=2, parent_id=1)  -- Công ty con A
  |     |-- company (id=3, parent_id=2)  -- Chi nhánh A1
  |-- company (id=4, parent_id=1)  -- Công ty con B
```

Dùng `parent_id` self-referencing để mô hình hóa tập đoàn — hỗ trợ
truy vấn tree bằng CTE (Common Table Expression).

### 4.2. Contact-Company Relation (N:N)

Một contact có thể liên kết nhiều company (ví dụ: cố vấn nhiều công ty).
Bảng trung gian `contact_company_role` lưu: contact_id, company_id,
role (Decision Maker / Influencer / User / Technical).

### 4.3. Opportunity — Contract — Invoice Chain

```
opportunity --> quotation --> contract --> invoice --> payment
     |              |             |            |
     v              v             v            v
  (won)        (accepted)    (signed)     (paid/partial)
```

Mỗi entity liên kết qua `source_type` + `source_id` để trace nguồn gốc
từ lead đến thu tiền.

---

## 5. Soft Delete & Audit Trail

### 5.1. Soft Delete

- Mỗi DELETE request chỉ set `deleted_at = NOW()`
- Query mặc định luôn có `WHERE deleted_at IS NULL`
- Cronjob purge bản ghi > 90 ngày (configurable per tenant)

### 5.2. Audit Log Table

| Column       | Type        | Mô tả                        |
|--------------|-------------|------------------------------|
| id           | BIGINT PK   | Auto-increment               |
| tenant_id    | BIGINT      | Tenant                       |
| user_id      | BIGINT      | Người thực hiện              |
| entity_type  | VARCHAR(64) | Ví dụ: "customer", "contract"|
| entity_id    | BIGINT      | ID bản ghi                   |
| action       | ENUM        | CREATE / UPDATE / DELETE      |
| old_value    | JSON        | Giá trị cũ (nullable)        |
| new_value    | JSON        | Giá trị mới                  |
| created_at   | DATETIME    | Thời điểm                    |

---

## 6. Indexing Strategy

| Loại Index            | Ví dụ                                     | Mục đích                       |
|-----------------------|-------------------------------------------|--------------------------------|
| Composite tenant      | `(tenant_id, branch_id, id)`              | Mọi query đều filter tenant    |
| Partial index         | `WHERE deleted_at IS NULL`                | Loại bỏ bản ghi đã xóa         |
| Full-text search      | `FULLTEXT(name, email, phone)` on contact | Tìm kiếm nhanh khách hàng      |
| Foreign key           | `customer_id` on opportunity              | JOIN performance               |
| Date range            | `(tenant_id, created_at)` on invoice      | Báo cáo theo kỳ                |

---

## 7. Storage Tiers

```
+------------------+     +------------------+     +------------------+
|   HOT — MySQL    |     |  CACHE — Redis   |     |   COLD — S3      |
|                  |     |                  |     |                  |
| - Transactional  |     | - Session        |     | - File upload    |
| - CRUD realtime  |     | - Permission set |     | - Report export  |
| - < 2 năm data   |     | - Rate limit     |     | - Audit log > 1y |
|                  |     | - Queue temp     |     | - Email archive  |
| TTL: unlimited   |     | TTL: 1h - 24h   |     | TTL: 3-7 năm     |
+------------------+     +------------------+     +------------------+
```

Data migration: Cronjob hàng tháng chuyển audit_log > 1 năm sang S3
(Parquet format), giữ summary row trong MySQL để báo cáo nhanh.

---

## 8. Database per Service vs Shared

Hiện tại: **shared database** — 12 microservice dùng chung 1 MySQL
instance với các table prefix riêng (vd: `sales_*`, `inv_*`, `fin_*`).
Lý do: đơn giản hóa join báo cáo cross-domain.

Roadmap: tách database cho các service có tải cao (notification, integration)
khi scale vượt 10K concurrent users.
