# Part 02 — Hội viên & Profile 360°

## 1. Mục tiêu

Cung cấp **một hồ sơ khách hàng thống nhất** trên toàn chuỗi, hợp nhất dữ liệu từ Goldmem + MS Access + MS Excel + Supporter, dedupe theo SĐT, có khả năng merge cross-brand, đáp ứng tra cứu < 1s với 3M records.

## 2. Data model — Member entity

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `member_id` | UUID | ✅ | Primary key |
| `phone` | E.164 (string) | ✅ | **Unique trong scope** — natural key dedupe |
| `name` | string(120) | ✅ | Họ tên đầy đủ |
| `gender` | enum (M/F/O/null) | — | |
| `dob` | date | — | Dùng cho birthday bonus |
| `email` | email | — | |
| `national_id` | string(20) | — | CCCD/CMND — KYC nếu yêu cầu |
| `address` | string(500) | — | Free text |
| `province_id`, `district_id`, `ward_id` | FK | — | Cho phân tích địa lý |
| `home_brand_id` | FK brand | — | Brand đăng ký gốc (khi scope = per_brand) |
| `registered_store_id` | FK store | — | Store đăng ký gốc |
| `registered_channel` | enum (POS/Web/App/Import) | ✅ | |
| `registered_at` | timestamp | ✅ | |
| `card_number` | string(20) | — | Số thẻ vật lý (nếu in) |
| `barcode` | string(64) | ✅ | Auto-gen — quét tại quầy |
| `current_tier_id` | FK tier | ✅ | Cập nhật khi tier eval |
| `current_tier_since` | timestamp | ✅ | |
| `lifetime_points_earned` | bigint | ✅ | Cộng dồn — không bao giờ giảm, dùng tính tier |
| `current_points_balance` | bigint | ✅ | Cached — derive từ ledger, refresh hàng ngày |
| `status` | enum (active/inactive/blocked/merged) | ✅ | `merged` = đã gộp vào member_id khác |
| `merged_into_member_id` | FK self | — | Khi `status = merged` |
| `tags` | JSON array string | — | VIP, blacklist, fraud_suspect, ... |
| `external_refs` | JSON | — | `{goldmem_id, supporter_id, access_id, brand_b_id}` để truy ngược |
| `created_at`, `updated_at`, `deleted_at` | timestamp | ✅ | Audit |

## 3. Yêu cầu chi tiết

### UR-MBR-01 — Đăng ký hội viên qua POS (Must)

| | |
|---|---|
| **Actor** | Cashier (qua POS bên ngoài) hoặc Store Staff (qua admin) |
| **Mô tả** | KH cung cấp SĐT + Tên → tạo member ngay tại quầy. Bonus điểm chào mừng (cấu hình). |
| **Tiền điều kiện** | Phone chưa tồn tại trong scope |
| **Đầu vào** | `{phone, name, dob?, registered_store_id, registered_channel}` |
| **Đầu ra** | Member tạo, barcode gen, welcome points cộng (nếu enable) |
| **AC** | • Phone duplicate → trả lỗi 409 + thông tin member đã có (cho phép link)<br>• Barcode unique cross-chain<br>• Welcome bonus ghi ledger với reason `signup_bonus`<br>• Latency < 300 ms |

### UR-MBR-02 — Đăng ký qua web/app (Must)

| | |
|---|---|
| **Actor** | KHTV (self-service) |
| **Mô tả** | Form đăng ký online: phone + OTP. Sau OTP, nhập tên + email. KH chọn brand "home" nếu scope = per_brand. |
| **AC** | • OTP qua SMS hoặc Zalo OA<br>• Rate limit OTP 5 lần / 5 phút / IP<br>• Brand selector chỉ hiện khi scope ≠ chain_wide |

### UR-MBR-03 — Lookup KH < 1s với 3M records (Must)

| | |
|---|---|
| **Actor** | Cashier, CSKH, Marketing |
| **Mô tả** | Tra cứu KH theo: phone (full hoặc 4 số cuối), tên (fuzzy), card_number, barcode (scan), email, national_id. Hiển thị: tên, tier, balance, tổng chi tiêu năm, lần mua gần nhất, store thường xuyên. |
| **AC** | • Phone full match < 200 ms<br>• Phone partial (4 số cuối) < 500 ms — phân trang 50/page<br>• Barcode scan trả kết quả < 300 ms<br>• Search index: phone + name (n-gram) + barcode + card_number |

### UR-MBR-04 — Hồ sơ 360° (Must)

| | |
|---|---|
| **Actor** | CSKH, Marketing |
| **Mô tả** | Trang profile hiển thị: thông tin cơ bản, tier history, lifetime + current balance, lịch sử 50 giao dịch gần nhất, ticket khiếu nại đang mở, reward đã đổi, segment tag, store thường xuyên, sản phẩm hay mua. |
| **AC** | • Page load < 1.5 s<br>• Lịch sử giao dịch drill-down về đơn cụ thể<br>• Lịch sử ticket drill-down về ticket detail<br>• Inline edit thông tin (audit log) |

### UR-MBR-05 — Bulk import 3M KH (Must)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | Upload CSV/Excel — header chuẩn. Background job xử lý theo batch 10.000 records. Dedupe by phone: nếu trùng → update hoặc skip (cấu hình). Validate format trước khi import: phone, email, dob, points (số nguyên ≥ 0). Báo cáo: success count, error count, skip count, file lỗi để re-import. |
| **AC** | • Template CSV download được<br>• Background job với progress bar<br>• 3M records hoàn thành < 1 giờ<br>• File lỗi đầy đủ dòng + nguyên nhân<br>• Idempotent: chạy lại không tạo trùng<br>• Audit: ai import, file gì, khi nào, số dòng kết quả |
| **Lưu ý migration** | Khi import từ Goldmem/Access/Excel/Supporter, chạy ETL pipeline (xem `../06-analysis/data-migration-strategy.md`) trước, không upload trực tiếp |

### UR-MBR-06 — Dedupe & Merge cross-brand (Must)

| | |
|---|---|
| **Actor** | Tenant Admin, CSKH Supervisor |
| **Mô tả** | Khi 1 phone xuất hiện ở 2 brand → đề xuất merge. Khi merge: cộng dồn `lifetime_points_earned`, gộp ledger, gộp lịch sử ticket, giữ tier cao hơn, đánh dấu record kia `status=merged, merged_into_member_id=primary`. Có dry-run preview trước khi apply. |
| **AC** | • Dashboard "Trùng lặp" hiển thị candidate cặp + similarity score (phone match + name fuzzy)<br>• Bulk merge: chọn nhiều cặp cùng lúc<br>• Sau merge, lookup phone vẫn trả về primary member<br>• Audit log đầy đủ<br>• Có thể UNDO trong 30 ngày nếu sai |
| **Quy tắc** | Không tự động merge — luôn cần human approval; threshold similarity ≥ 0.95 mới hiện candidate |

### UR-MBR-07 — Phát hành thẻ ảo có barcode (Should)

| | |
|---|---|
| **Actor** | Cashier, CSKH, KHTV |
| **Mô tả** | Mỗi member có barcode (Code128) hoặc QR code unique. Hiển thị trên app/Zalo mini-app. In thẻ vật lý PDF — batch print N thẻ. |
| **AC** | • Barcode unique toàn chuỗi<br>• Scan tại POS → lookup < 1 s<br>• PDF template: tên, tier, barcode, ngày phát hành<br>• Batch print 500 thẻ < 30 s |

### UR-MBR-08 — Update thông tin KH (Must)

| | |
|---|---|
| **Actor** | CSKH, Store Manager, KHTV (self) |
| **Mô tả** | Sửa thông tin: tên, dob, email, address. Đổi phone phải xác thực OTP đến phone mới + audit. |
| **AC** | • Audit log: trường nào đổi, ai đổi, giá trị cũ → mới<br>• Đổi phone block 24h sau khi đổi (chống fraud)<br>• KH self-service: sửa thông tin qua app/web (phone đổi cần OTP) |

### UR-MBR-09 — Block / Unblock (Should)

| | |
|---|---|
| **Actor** | Tenant Admin, CSKH Supervisor |
| **Mô tả** | Block KH (fraud suspect, chargeback abuser). Khi block: không nhận điểm mới, không đổi quà, phone không lookup được tại POS (trả "không tìm thấy"). Unblock khôi phục. |
| **AC** | • Lý do block bắt buộc nhập<br>• Audit đầy đủ<br>• Notify CSKH khi KH bị block đăng nhập app |

### UR-MBR-10 — Soft delete & retention (Must, compliance)

| | |
|---|---|
| **Actor** | Tenant Admin |
| **Mô tả** | KH yêu cầu xoá (right-to-erasure NĐ 13/2023). Soft delete: anonymize PII (name → "Khách đã xoá", phone → hash, email → null), giữ ledger để kế toán + audit. Sau 5 năm hard delete. |
| **AC** | • Workflow: KH gửi yêu cầu → CSKH xác minh → Admin approve → 30 ngày grace → execute<br>• Notify KH qua email/SMS từng bước<br>• Ledger và tier history vẫn còn (anonymized) cho báo cáo aggregate<br>• Audit log execution |

## 4. Quy tắc nghiệp vụ

- **Phone là natural key** trong scope. Nếu scope = chain_wide → unique toàn chuỗi. Scope = per_brand → unique trong brand.
- **Không cho phép tạo member không có phone** (trừ Bulk import legacy có cờ `allow_missing_phone = true` cho data từ Goldmem cũ, generate placeholder phone `+84_placeholder_<uuid>`).
- **Barcode auto-gen** từ member_id, không cho user nhập tay (chống trùng).
- **Status transitions:** active ↔ inactive (manual), → blocked (manual), → merged (chỉ qua merge flow), → deleted (chỉ qua soft delete flow).
- **Birthday bonus** áp dụng đúng 1 lần/năm, kích hoạt khi KH phát sinh đơn trong tuần sinh nhật (±3 ngày).

## 5. Tham chiếu

- **Data migration chi tiết** (Goldmem → Reborn): [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md)
- **Cross-brand merge strategy:** [`../06-analysis/cross-brand-strategy.md`](../06-analysis/cross-brand-strategy.md)
- **PDPA compliance (right-to-erasure):** [`../06-analysis/compliance-pdpa.md`](../06-analysis/compliance-pdpa.md)
- **Backend spec:** [`../05-backend-tasks/customer/`](../05-backend-tasks/customer/)
