# Part 07 — Data Architecture

> Mo ta chien luoc du lieu da tang (multi-tenant row-level isolation),
> ERD tong quan, pattern soft-delete / audit, indexing, va storage tiers
> cho he thong B2B CRM phuc vu doanh nghiep lon / cong ty tech.

---

## 1. Executive Summary

Reborn CRM su dung **MySQL** lam primary store voi chien luoc
**row-level tenant isolation** — moi ban ghi deu co `tenant_id` va
`branch_id`. Du lieu duoc chia thanh 11 entity group phu hop 12
microservice. Pattern soft-delete (`deleted_at`), audit trail, va
indexing composite dam bao hieu suat truy van o quy mo lon.
Storage chia 3 tang: hot (MySQL), cache (Redis), cold (S3).

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

Moi table kinh doanh deu co 3 cot bat buoc:

| Column      | Type         | Mo ta                          |
|-------------|--------------|--------------------------------|
| tenant_id   | BIGINT NN    | ID tenant (cong ty khach hang) |
| branch_id   | BIGINT NN    | ID chi nhanh                   |
| deleted_at  | DATETIME NULL| Soft-delete timestamp           |

### 2.2. Shared Database, Separate Schema

Tat ca tenant dung chung 1 MySQL instance, chung schema.
BE middleware **tu dong inject** `tenant_id` vao moi query —
developer khong can truyen tay.

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
company (id=1, parent_id=NULL)   -- Tap doan ABC
  |-- company (id=2, parent_id=1)  -- Cong ty con A
  |     |-- company (id=3, parent_id=2)  -- Chi nhanh A1
  |-- company (id=4, parent_id=1)  -- Cong ty con B
```

Dung `parent_id` self-referencing de mo hinh hoa tap doan — ho tro
truy van tree bang CTE (Common Table Expression).

### 4.2. Contact-Company Relation (N:N)

Mot contact co the lien ket nhieu company (vi du: co van nhieu cong ty).
Bang trung gian `contact_company_role` luu: contact_id, company_id,
role (Decision Maker / Influencer / User / Technical).

### 4.3. Opportunity — Contract — Invoice Chain

```
opportunity --> quotation --> contract --> invoice --> payment
     |              |             |            |
     v              v             v            v
  (won)        (accepted)    (signed)     (paid/partial)
```

Moi entity lien ket qua `source_type` + `source_id` de trace nguon goc
tu lead den thu tien.

---

## 5. Soft Delete & Audit Trail

### 5.1. Soft Delete

- Moi DELETE request chi set `deleted_at = NOW()`
- Query mac dinh luon co `WHERE deleted_at IS NULL`
- Cronjob purge ban ghi > 90 ngay (configurable per tenant)

### 5.2. Audit Log Table

| Column       | Type        | Mo ta                        |
|--------------|-------------|------------------------------|
| id           | BIGINT PK   | Auto-increment               |
| tenant_id    | BIGINT      | Tenant                       |
| user_id      | BIGINT      | Nguoi thuc hien              |
| entity_type  | VARCHAR(64) | Vi du: "customer", "contract"|
| entity_id    | BIGINT      | ID ban ghi                   |
| action       | ENUM        | CREATE / UPDATE / DELETE      |
| old_value    | JSON        | Gia tri cu (nullable)        |
| new_value    | JSON        | Gia tri moi                  |
| created_at   | DATETIME    | Thoi diem                    |

---

## 6. Indexing Strategy

| Loai Index            | Vi du                                     | Muc dich                       |
|-----------------------|-------------------------------------------|--------------------------------|
| Composite tenant      | `(tenant_id, branch_id, id)`              | Moi query deu filter tenant    |
| Partial index         | `WHERE deleted_at IS NULL`                | Loai bo ban ghi da xoa         |
| Full-text search      | `FULLTEXT(name, email, phone)` on contact | Tim kiem nhanh khach hang      |
| Foreign key           | `customer_id` on opportunity              | JOIN performance               |
| Date range            | `(tenant_id, created_at)` on invoice      | Bao cao theo ky                |

---

## 7. Storage Tiers

```
+------------------+     +------------------+     +------------------+
|   HOT — MySQL    |     |  CACHE — Redis   |     |   COLD — S3      |
|                  |     |                  |     |                  |
| - Transactional  |     | - Session        |     | - File upload    |
| - CRUD realtime  |     | - Permission set |     | - Report export  |
| - < 2 nam data   |     | - Rate limit     |     | - Audit log > 1y |
|                  |     | - Queue temp     |     | - Email archive  |
| TTL: unlimited   |     | TTL: 1h - 24h   |     | TTL: 3-7 nam     |
+------------------+     +------------------+     +------------------+
```

Data migration: Cronjob hang thang chuyen audit_log > 1 nam sang S3
(Parquet format), giu summary row trong MySQL de bao cao nhanh.

---

## 8. Database per Service vs Shared

Hien tai: **shared database** — 12 microservice dung chung 1 MySQL
instance voi cac table prefix rieng (vd: `sales_*`, `inv_*`, `fin_*`).
Ly do: don gian hoa join bao cao cross-domain.

Roadmap: tach database cho cac service co tai cao (notification, integration)
khi scale vuot 10K concurrent users.
