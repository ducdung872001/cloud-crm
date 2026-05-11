# Kế hoạch Di chuyển Dữ liệu — Reborn Loyalty (Siêu thị)

> Import 3 triệu khách hàng từ 2 hệ thống loyalty hiện tại (Thương hiệu A & Thương hiệu B) vào hệ thống Reborn Loyalty thống nhất.

---

## 1. Tổng quan các giai đoạn

| Giai đoạn | Mô tả | Số lượng | Thời gian |
|---|---|---|---|
| **Phase 1 — Chuẩn bị** | Phân tích dữ liệu nguồn, mapping field, xây tool import | — | Tuần 1–2 |
| **Phase 2 — Pilot** | Import thử 1.000 record, kiểm tra kết quả | 1.000 | Tuần 3 |
| **Phase 3 — Full Migration** | Import toàn bộ 3 triệu khách hàng | 3.000.000 | Tuần 4–5 |

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Phase 1    │────▶│  Phase 2    │────▶│  Phase 3        │
│  Chuẩn bị   │     │  Pilot 1K   │     │  Full 3M        │
│  2 tuần      │     │  1 tuần     │     │  2 tuần          │
└─────────────┘     └─────────────┘     └─────────────────┘
```

---

## 2. Data Mapping

### 2.1 Thương hiệu A → Reborn Loyalty

| Trường nguồn (Brand A) | Trường đích (Reborn) | Ghi chú |
|---|---|---|
| `ho_ten` | `name` | Chuẩn hoá viết hoa chữ cái đầu |
| `sdt` | `phone` | Chuẩn hoá 84xxx → 0xxx |
| `email_kh` | `email` | Lowercase, trim |
| `diem_tich_luy` | `points` | Giữ nguyên giá trị |
| `loai_the` | `tier` | Mapping: `thuong` → STANDARD, `bac` → SILVER, `vang` → GOLD, `kim_cuong` → DIAMOND |
| — | `brand` | Gán cố định: `BRAND_A` |
| `ma_ch` | `store_id` | Mapping theo bảng đối chiếu mã cửa hàng |
| `ngay_tao` | `created_at` | Format: yyyy-MM-dd |
| `ngay_gd_cuoi` | `last_transaction_date` | Format: yyyy-MM-dd |

### 2.2 Thương hiệu B → Reborn Loyalty

| Trường nguồn (Brand B) | Trường đích (Reborn) | Ghi chú |
|---|---|---|
| `customer_name` | `name` | Chuẩn hoá viết hoa chữ cái đầu |
| `phone_number` | `phone` | Chuẩn hoá +84 → 0 |
| `cust_email` | `email` | Lowercase, trim |
| `loyalty_points` | `points` | Quy đổi tỷ lệ 1:1 |
| `membership_level` | `tier` | Mapping: `basic` → STANDARD, `silver` → SILVER, `gold` → GOLD, `platinum` → DIAMOND |
| — | `brand` | Gán cố định: `BRAND_B` |
| `branch_code` | `store_id` | Mapping theo bảng đối chiếu mã cửa hàng |
| `register_date` | `created_at` | Format: yyyy-MM-dd |
| `last_visit` | `last_transaction_date` | Format: yyyy-MM-dd |

---

## 3. CSV Format Specification

File CSV đầu vào cho tool import phải tuân theo format sau:

```
name,phone,email,points,tier,brand,store_id,created_at,last_transaction_date
```

### 3.1 Mô tả các cột

| Cột | Kiểu dữ liệu | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|---|
| `name` | String (max 200) | Có | Họ tên khách hàng | `Nguyễn Văn An` |
| `phone` | String (10 số) | Có | SĐT bắt đầu bằng 0 | `0912345678` |
| `email` | String (max 255) | Không | Email, lowercase | `an.nguyen@email.com` |
| `points` | Integer >= 0 | Có | Điểm tích luỹ hiện tại | `15000` |
| `tier` | Enum | Có | STANDARD / SILVER / GOLD / DIAMOND | `GOLD` |
| `brand` | String | Có | Mã thương hiệu | `BRAND_A` |
| `store_id` | String (max 20) | Có | Mã cửa hàng đăng ký | `ST001` |
| `created_at` | Date (yyyy-MM-dd) | Không | Ngày tạo tài khoản | `2023-01-15` |
| `last_transaction_date` | Date (yyyy-MM-dd) | Không | Ngày giao dịch cuối | `2024-12-20` |

### 3.2 Ví dụ file CSV

```csv
name,phone,email,points,tier,brand,store_id,created_at,last_transaction_date
Nguyễn Văn An,0912345678,an.nguyen@email.com,15000,GOLD,BRAND_A,ST001,2023-01-15,2024-12-20
Trần Thị Bình,0987654321,,5000,STANDARD,BRAND_B,ST042,2024-03-10,2025-01-05
Lê Hoàng Cường,0909123456,cuong.le@gmail.com,82000,DIAMOND,BRAND_A,ST015,2021-06-22,2025-02-14
```

### 3.3 Encoding & format

- **Encoding:** UTF-8 with BOM (hỗ trợ tiếng Việt)
- **Delimiter:** dấu phẩy `,`
- **Quote:** Giá trị chứa dấu phẩy phải bọc trong `""`
- **Line ending:** `\n` hoặc `\r\n`
- **Kích thước file tối đa:** 500 MB / file, chia nhỏ nếu lớn hơn

---

## 4. Chiến lược Khử trùng (Deduplication)

### 4.1 Quy tắc matching

Xác định trùng lặp dựa trên **số điện thoại** (primary key tự nhiên):

```
Bước 1: Chuẩn hoá SĐT → format 0xxxxxxxxx (10 số)
Bước 2: GROUP BY phone
Bước 3: Nếu 1 phone xuất hiện ở cả Brand A & Brand B → merge
```

### 4.2 Chiến lược merge

Khi 1 khách hàng có tài khoản ở cả 2 thương hiệu:

| Trường | Quy tắc merge |
|---|---|
| `name` | Lấy tên dài hơn (nhiều thông tin hơn) |
| `phone` | Giữ nguyên (key matching) |
| `email` | Lấy giá trị không null, ưu tiên Brand A |
| `points` | **Cộng dồn** điểm cả 2 brand |
| `tier` | Lấy hạng **cao hơn** |
| `brand` | Gán `BOTH` |
| `store_id` | Lấy store có giao dịch gần nhất |
| `created_at` | Lấy ngày **sớm hơn** |
| `last_transaction_date` | Lấy ngày **mới hơn** |

### 4.3 Ước tính trùng lặp

Dựa trên phân tích sơ bộ:

| Metric | Giá trị |
|---|---|
| Tổng record Brand A | ~1.800.000 |
| Tổng record Brand B | ~1.200.000 |
| Ước tính trùng (cùng SĐT) | ~200.000 – 300.000 |
| Record sau merge | ~2.700.000 – 2.800.000 |

---

## 5. Validation Rules

### 5.1 Quy tắc validate từng record

```python
# Pseudo-code
def validate_record(row):
    errors = []

    # Phone: bắt buộc, 10 số, bắt đầu bằng 0
    if not re.match(r'^0\d{9}$', row.phone):
        errors.append('INVALID_PHONE')

    # Name: bắt buộc, tối thiểu 2 ký tự
    if not row.name or len(row.name.strip()) < 2:
        errors.append('INVALID_NAME')

    # Points: số nguyên >= 0
    if row.points < 0:
        errors.append('NEGATIVE_POINTS')

    # Tier: phải thuộc enum
    if row.tier not in ['STANDARD', 'SILVER', 'GOLD', 'DIAMOND']:
        errors.append('INVALID_TIER')

    # Store: phải tồn tại trong master data
    if row.store_id not in valid_store_ids:
        errors.append('INVALID_STORE')

    # Email: nếu có, phải đúng format
    if row.email and not is_valid_email(row.email):
        errors.append('INVALID_EMAIL')

    return errors
```

### 5.2 Tier Mapping chi tiết

| Brand A (`loai_the`) | Brand B (`membership_level`) | Reborn (`tier`) |
|---|---|---|
| `thuong` | `basic` | STANDARD |
| `bac` | `silver` | SILVER |
| `vang` | `gold` | GOLD |
| `kim_cuong` | `platinum` | DIAMOND |

### 5.3 Xử lý lỗi

| Loại lỗi | Hành động |
|---|---|
| SĐT sai format | Ghi log, bỏ qua record, xử lý thủ công sau |
| Thiếu name | Gán `"Khách hàng"` + 4 số cuối SĐT |
| Points âm | Gán points = 0 |
| Tier không mapping được | Gán STANDARD |
| Store không tồn tại | Gán store mặc định của brand |
| Email sai format | Xoá email, giữ các trường khác |

---

## 6. Rollback Plan

### 6.1 Trước khi import

```bash
# Snapshot toàn bộ DB trước migration
mysqldump -u root -p \
  --single-transaction \
  --routines --triggers \
  reborn_loyalty > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Ghi lại số lượng record hiện tại
mysql -e "SELECT COUNT(*) as total FROM customer;" reborn_loyalty > pre_count.txt
```

### 6.2 Quy trình rollback

```bash
# Bước 1: Dừng tất cả service
sudo systemctl stop reborn-customer reborn-market

# Bước 2: Restore database
mysql -u root -p reborn_loyalty < backup_pre_migration_<timestamp>.sql

# Bước 3: Verify
mysql -e "SELECT COUNT(*) FROM customer;" reborn_loyalty
# So sánh với pre_count.txt

# Bước 4: Khởi động lại service
sudo systemctl start reborn-customer reborn-market

# Bước 5: Health check
curl http://localhost:8082/actuator/health
```

### 6.3 Rollback từng batch

Nếu import theo batch, có thể rollback batch cụ thể:

```sql
-- Mỗi batch có migration_batch_id
DELETE FROM customer WHERE migration_batch_id = 'BATCH_20260416_001';
DELETE FROM customer_points_log WHERE migration_batch_id = 'BATCH_20260416_001';
```

---

## 7. Timeline chi tiết

| Tuần | Công việc | Người thực hiện | Output |
|---|---|---|---|
| **Tuần 1** | Nhận data export từ Brand A & B | Đội vận hành | 2 file raw data |
| **Tuần 1** | Phân tích cấu trúc, data quality | Data engineer | Báo cáo chất lượng dữ liệu |
| **Tuần 2** | Xây tool import + validation | Dev backend | Script import, unit test |
| **Tuần 2** | Tạo mapping table cửa hàng | Đội vận hành + Dev | Store mapping CSV |
| **Tuần 3** | **Pilot:** import 500 Brand A + 500 Brand B | Dev + QA | 1.000 record trong hệ thống |
| **Tuần 3** | Kiểm tra pilot: search, tích điểm, đổi thưởng | QA | Báo cáo test pilot |
| **Tuần 3** | Fix issue từ pilot (nếu có) | Dev | Patch script |
| **Tuần 4** | **Full migration** Brand A (1.8M) | Dev + Ops | Batch import, ~4–6 giờ |
| **Tuần 4** | Verify Brand A, fix lỗi | QA + Dev | Báo cáo verify |
| **Tuần 5** | **Full migration** Brand B (1.2M) + merge duplicate | Dev + Ops | Batch import, ~3–4 giờ |
| **Tuần 5** | Verify toàn bộ, báo cáo final | QA | Báo cáo migration hoàn tất |

---

## 8. Tiêu chí thành công (Success Criteria)

### 8.1 Metrics bắt buộc

| Tiêu chí | Ngưỡng chấp nhận |
|---|---|
| Tổng record import thành công | >= 99% tổng record nguồn |
| Tỷ lệ lỗi | < 1% |
| Trùng SĐT sau import | 0 (không có duplicate phone) |
| Tổng điểm sau merge | = Tổng điểm Brand A + Tổng điểm Brand B |
| Thời gian import toàn bộ | < 10 giờ |

### 8.2 Kiểm tra chức năng sau migration

- [ ] Tìm kiếm khách hàng theo SĐT — hiển thị đúng thông tin
- [ ] Tìm kiếm theo tên — kết quả chính xác
- [ ] Tích điểm cho khách đã import — điểm cộng đúng
- [ ] Đổi thưởng — trừ điểm đúng
- [ ] Xem lịch sử — không có giao dịch ảo
- [ ] Khách trùng 2 brand — hiển thị brand = BOTH, điểm = tổng 2 bên
- [ ] Hạng thẻ mapping đúng theo quy tắc

---

## 9. Post-Migration Verification Queries

### 9.1 Kiểm tra tổng số

```sql
-- Tổng khách sau import
SELECT COUNT(*) AS total_customers FROM customer;

-- Phân bổ theo brand
SELECT brand, COUNT(*) AS count
FROM customer
GROUP BY brand;

-- Phân bổ theo tier
SELECT tier, COUNT(*) AS count
FROM customer
GROUP BY tier
ORDER BY FIELD(tier, 'STANDARD', 'SILVER', 'GOLD', 'DIAMOND');
```

### 9.2 Kiểm tra trùng lặp

```sql
-- SĐT trùng (phải = 0)
SELECT phone, COUNT(*) AS cnt
FROM customer
GROUP BY phone
HAVING cnt > 1;

-- Email trùng (cho phép nhiều null, nhưng email thực không được trùng)
SELECT email, COUNT(*) AS cnt
FROM customer
WHERE email IS NOT NULL AND email != ''
GROUP BY email
HAVING cnt > 1;
```

### 9.3 Kiểm tra tổng điểm

```sql
-- So sánh tổng điểm với nguồn
SELECT brand, SUM(points) AS total_points
FROM customer
GROUP BY brand;

-- Khách có điểm âm (phải = 0)
SELECT COUNT(*) FROM customer WHERE points < 0;
```

### 9.4 Kiểm tra dữ liệu merge

```sql
-- Khách thuộc cả 2 brand (sau merge)
SELECT COUNT(*) AS merged_customers
FROM customer
WHERE brand = 'BOTH';

-- Verify merge: lấy mẫu 10 khách merge, kiểm tra thủ công
SELECT id, name, phone, points, tier, brand, store_id
FROM customer
WHERE brand = 'BOTH'
ORDER BY RAND()
LIMIT 10;
```

### 9.5 Kiểm tra data quality

```sql
-- SĐT sai format
SELECT COUNT(*) FROM customer
WHERE phone NOT REGEXP '^0[0-9]{9}$';

-- Tier không hợp lệ
SELECT COUNT(*) FROM customer
WHERE tier NOT IN ('STANDARD', 'SILVER', 'GOLD', 'DIAMOND');

-- Store không tồn tại trong master data
SELECT c.store_id, COUNT(*) AS orphan_count
FROM customer c
LEFT JOIN store s ON c.store_id = s.id
WHERE s.id IS NULL
GROUP BY c.store_id;

-- Record thiếu tên
SELECT COUNT(*) FROM customer
WHERE name IS NULL OR TRIM(name) = '';
```

### 9.6 Script tổng hợp báo cáo migration

```sql
SELECT
  'Tổng khách hàng' AS metric, COUNT(*) AS value FROM customer
UNION ALL
SELECT 'Brand A', COUNT(*) FROM customer WHERE brand = 'BRAND_A'
UNION ALL
SELECT 'Brand B', COUNT(*) FROM customer WHERE brand = 'BRAND_B'
UNION ALL
SELECT 'Cả 2 brand (merged)', COUNT(*) FROM customer WHERE brand = 'BOTH'
UNION ALL
SELECT 'SĐT trùng', COUNT(*) FROM (
  SELECT phone FROM customer GROUP BY phone HAVING COUNT(*) > 1
) dup
UNION ALL
SELECT 'Tổng điểm', SUM(points) FROM customer
UNION ALL
SELECT 'Điểm âm', COUNT(*) FROM customer WHERE points < 0
UNION ALL
SELECT 'SĐT sai format', COUNT(*) FROM customer WHERE phone NOT REGEXP '^0[0-9]{9}$';
```

---

## Phụ lục: Checklist Migration

- [ ] Nhận file export từ Brand A
- [ ] Nhận file export từ Brand B
- [ ] Phân tích data quality, báo cáo
- [ ] Hoàn tất mapping table (field + store)
- [ ] Tool import đã unit test pass
- [ ] Backup DB trước pilot
- [ ] Pilot 1.000 record thành công
- [ ] QA verify pilot OK
- [ ] Backup DB trước full migration
- [ ] Full import Brand A xong
- [ ] Full import Brand B xong
- [ ] Dedup/merge hoàn tất
- [ ] Verification queries pass hết
- [ ] Stakeholder sign-off
