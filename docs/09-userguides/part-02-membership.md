# Part 02 — Quản lý Hội viên

## 1. Tra cứu hội viên

### 1.1. Tìm nhanh

Top search → gõ phone hoặc tên → enter → kết quả gợi ý dropdown.

### 1.2. Trang Hội viên đầy đủ

**Menu › Hội viên › Danh sách**

| Field filter | Mô tả |
|---|---|
| Phone | Full hoặc 4 số cuối |
| Tên | Fuzzy match |
| Tier | Bronze/Silver/Gold/Diamond |
| Brand | Filter theo brand (nếu scope = per_brand) |
| Store đăng ký | Theo store gốc |
| Trạng thái | Active/Inactive/Blocked/Merged |
| Tag | Champions, At Risk, ... |
| Khoảng thời gian đăng ký | from..to |

Pagination 20/page. Sort by tên, tier, balance, registered_at.

### 1.3. Export

Bấm **[Xuất Excel]** → background job → email khi sẵn (cho dataset > 10k rows). Nhỏ hơn → tải trực tiếp.

⚠️ Export > 10k cần permission `member.export` cao + audit log.

## 2. Profile 360° của 1 KH

Bấm vào KH từ list → trang profile.

### 2.1. Layout

```
┌────────────────────────────────────────────────────────────────┐
│ NGUYỄN VĂN A    [📷]                       ⚙️ Edit │ Block │ ▼│
│ Phone: +84901234567   Tier: 💎 Gold (since 2025-08)            │
│ Email: a@example.com  Balance: 1,500 points (~75,000đ)         │
│ DOB: 1990-05-12       Lifetime earned: 25,400 points            │
├────────────────────────────────────────────────────────────────┤
│ Tab: [Overview] [Ledger] [Orders] [Tickets] [Rewards] [Tags]   │
├────────────────────────────────────────────────────────────────┤
│ Overview:                                                       │
│  - Store thường xuyên: STORE-A-001 (40% orders)                 │
│  - SP hay mua: sữa, snack, đồ tươi                             │
│  - Last order: 2026-05-08 (3 ngày trước)                       │
│  - Total spend 12m: 24.5M VND                                  │
│  - RFM segment: Loyal Customer                                  │
│  - Cross-brand: Có member ở Brand B (Silver, 800đ) [Xem]       │
└────────────────────────────────────────────────────────────────┘
```

### 2.2. Tab Ledger

Lịch sử biến động điểm full, sort mới nhất trước. Filter: entry_type, date range, store, scope.

Bấm vào entry → drill-down vào order/reward gốc.

### 2.3. Tab Orders

Lịch sử 50 đơn gần nhất (qua POS webhook). Bấm vào → chi tiết line items.

### 2.4. Tab Tickets

Mọi ticket KH này từng tạo (open + closed). Bấm vào → trang ticket detail.

### 2.5. Tab Rewards

Danh sách reward đã đổi. Status: issued / used / expired / cancelled.

### 2.6. Tab Tags

Tag thủ công (VIP, careful, prefer_zalo) + tag tự động (RFM segment, Champions, At Risk). Thêm/xoá tag.

## 3. Tạo hội viên mới (admin)

⚠️ **Thông thường:** KH tự đăng ký qua app/POS → admin không cần tạo thủ công.

Khi cần (rare cases):

**Menu › Hội viên › Tạo mới**

1. Nhập phone (verify nếu trùng)
2. Nhập tên, dob, email (optional)
3. Chọn brand & store đăng ký
4. Bấm **[Tạo]**
5. Hệ thống auto sinh barcode + welcome bonus (nếu cấu hình)

## 4. Bulk import hội viên

### 4.1. Khi nào dùng

- Initial migration từ Goldmem/Access/Excel (xem [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md))
- Import nhóm KH từ marketing event (vd: thu thập 500 KH từ hội chợ)

### 4.2. Bước

**Menu › Hội viên › Bulk import**

1. Bấm **[Tải template]** → download CSV với header chuẩn
2. Điền data vào CSV. Format:
   - `phone` (E.164, e.g., `+84901234567`) — bắt buộc
   - `name` — bắt buộc
   - `dob` (YYYY-MM-DD) — optional
   - `email` — optional
   - `tier_code` (bronze/silver/gold/diamond) — optional, default bronze
   - `initial_points` — optional, default 0
   - `home_brand_code` — optional, default config
3. Upload file
4. Hệ thống validate: hiển thị preview 100 row đầu + số lỗi
5. Sửa file nếu có lỗi → re-upload
6. Confirm → background job chạy
7. Email notification khi done với report:
   - Success count
   - Error count + lý do
   - Duplicate count (đã có phone → update)
   - File `errors.csv` để sửa và re-import

🟢 **Tip:** Test với 10 records trước khi bulk 10K+.

⚠️ **Lưu ý dedupe:** Phone duplicate → mặc định update non-NULL fields. Nếu muốn skip → chọn option "Skip duplicates" trước import.

🔴 **Lưu ý migration:** 3M KH import cần ETL pipeline riêng, không upload trực tiếp. Liên hệ Reborn migration team.

## 5. Merge hội viên trùng

### 5.1. Detect trùng

**Menu › Hội viên › Duplicates**

Dashboard hiển thị candidates: cặp KH có similarity ≥ 0.95.

### 5.2. Merge một cặp

1. Bấm vào cặp → trang compare side-by-side
2. Xem field nào khác nhau
3. Chọn member nào làm "primary" (giữ ID)
4. Bấm **[Merge]**
5. Confirm dialog
6. Sau merge:
   - Member secondary → status `merged`, `merged_into = primary_id`
   - Lookup phone → trả primary
   - Ledger gộp, lịch sử ticket gộp
   - Audit log

### 5.3. Bulk merge

Chọn nhiều cặp → bấm **[Merge selected]**.

⚠️ **Cần permission `member.merge`.** Mặc định chỉ Tenant Admin + CSKH Supervisor có.

🔴 **Undo merge:** Có thể UNDO trong 30 ngày nếu phát hiện sai. Sau 30 ngày → không thể.

## 6. Block / Unblock

Khi nghi ngờ fraud:

1. Vào profile KH → bấm **[⋯ More] › [Block]**
2. Chọn lý do (dropdown): fraud_suspect, chargeback_abuse, multiple_account, other
3. Nhập note bắt buộc
4. Confirm

KH bị block:
- POS lookup trả "không tìm thấy" (không lộ KH đã bị block)
- Không nhận điểm mới
- Không đổi quà được
- Audit log + notification cho Supervisor

**Unblock:** ngược lại, cần permission cao hơn.

## 7. Phát hành thẻ ảo + barcode

Mỗi member tự động có barcode khi tạo. Để in thẻ vật lý:

1. Vào profile KH → **[Tải thẻ PDF]**
2. PDF download, có thể in
3. Hoặc bulk print: **Hội viên › Bulk print cards** → chọn list → **[In]** → batch PDF

KH cũng có thể tự xem thẻ qua app (Zalo mini-app / web).

## 8. Right-to-erasure (xoá data theo NĐ 13/2023)

Khi KH yêu cầu xoá:

1. **Menu › Hội viên › Yêu cầu xoá**
2. Tạo yêu cầu mới với phone KH + bằng chứng (CCCD scan / email yêu cầu)
3. Workflow:
   - Pending review (CSKH Supervisor approve)
   - Notification gửi KH với link "Huỷ yêu cầu trong 7 ngày"
   - Sau 7 ngày → Grace period 30 ngày (KH có thể restore qua login)
   - Sau 30 ngày → Execute deletion (anonymize PII)
4. Audit log đầy đủ

Chi tiết: [`../06-analysis/compliance-pdpa.md#5-right-to-erasure-workflow`](../06-analysis/compliance-pdpa.md)

## 9. Tham chiếu

- URD membership: [`../02-requirements/part-02-membership-core.md`](../02-requirements/part-02-membership-core.md)
- Data migration strategy: [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)
- Cross-brand merge: [`part-07-cross-brand.md`](part-07-cross-brand.md)
- Compliance: [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
