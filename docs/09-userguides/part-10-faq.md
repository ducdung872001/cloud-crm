# Part 10 — FAQ & Troubleshooting

## 1. Câu hỏi thường gặp — Khách hàng (end user)

### Q: Tôi đăng ký rồi nhưng không nhận được điểm khi mua?

**A:** Kiểm tra:
1. Cashier có scan thẻ/nhập SĐT của bạn khi thanh toán không?
2. Đơn có đạt min spend (50.000đ) không?
3. SĐT trên thẻ có đúng không?

Nếu vẫn không có, gọi tổng đài CSKH (số trong app).

### Q: Điểm của tôi sắp hết hạn, có cách giữ lại không?

**A:** Tiêu điểm trước ngày hết hạn để giữ giá trị. Có 2 cách:
- Đổi voucher hoặc quà trong catalog app
- Dùng giảm trực tiếp tại quầy POS

Hệ thống gửi reminder 30/14/7/1 ngày trước hết hạn — không bị bất ngờ.

### Q: Tôi có thẻ ở cả Brand A và Brand B, điểm có dùng chung được không?

**A:** Tuỳ cấu hình. Hiện tại 2 brand có wallet riêng nhưng bạn có thể chuyển điểm A → B (hoặc ngược lại) qua app, tỷ giá 1:0.8 (chuyển 100 điểm A → nhận 80 điểm B).

### Q: Làm sao xoá tài khoản của tôi?

**A:** Trong app → Cài đặt → Bảo mật → Yêu cầu xoá tài khoản. Quy trình 30 ngày grace period (có thể restore bằng login). Theo NĐ 13/2023 — quyền của bạn.

### Q: Tại sao tôi bị xuống hạng?

**A:** Hạng được đánh giá lại cuối mỗi kỳ (tháng/quý/năm tuỳ cấu hình). Nếu chi tiêu trong kỳ không đạt ngưỡng duy trì → vào "ân hạn" 1 kỳ → cuối ân hạn vẫn không đạt → xuống hạng. Bạn nhận warning notification trước.

### Q: Voucher của tôi hết hạn, có gia hạn được không?

**A:** Không. Voucher có hạn rõ trên app. Tuy nhiên, điểm để đổi voucher vẫn còn — bạn có thể đổi voucher khác.

---

## 2. Câu hỏi từ Cashier / Store Staff

### Q: POS không kết nối được với Reborn?

**A:**
- Check internet store
- Restart POS terminal
- Nếu vẫn fail → POS chuyển chế độ offline (vẫn bán được, queue local). Khi mạng lên → sync auto.
- Báo Store Manager + Reborn support nếu kéo dài

### Q: KH nói tích điểm nhưng tôi không thấy trong POS?

**A:**
- Kiểm tra lại screen lookup: tên KH có đúng?
- Có thể delay 5-10 phút từ Reborn → app KH
- Nếu chắc chắn tích thiếu → tạo ticket CSKH

### Q: Có được tích điểm hộ KH không (KH không có thẻ)?

**A:** ❌ KHÔNG. Đây là fraud. KH phải có thẻ TV chính của họ. Khuyến khích KH đăng ký +500 điểm welcome.

### Q: KH đòi adjust điểm thủ công, tôi làm được không?

**A:** ❌ KHÔNG. Cashier không có quyền adjust. Chuyển cho Store Manager hoặc tạo ticket CSKH.

### Q: KH có 2 thẻ trùng phone — chọn cái nào?

**A:** Chọn thẻ KH thường dùng. Báo CSKH Sup để merge 2 thẻ.

---

## 3. Câu hỏi CSKH

### Q: KH khiếu nại không tích điểm đơn cũ, làm sao xác minh?

**A:**
1. Hỏi KH order_ref (trên bill cũ)
2. Profile KH → tab Ledger → filter date range
3. Search order_ref → có entry chưa
4. Nếu chưa có:
   - Check trong POS history (admin sales report) — KH có mua đơn này không?
   - Có mua nhưng POS không gửi event → adjust thủ công goodwill + tạo ticket fix POS integration
   - Không có mua (KH nhớ nhầm) → giải thích

### Q: Adjust điểm > cap của tôi, làm sao?

**A:** Nhập form như bình thường, hệ thống sẽ tự ra workflow approval cho Supervisor. Email/notification gửi Sup.

### Q: KH đòi merge 2 thẻ TV trùng phone?

**A:**
1. Vào profile cả 2 thẻ → confirm cùng KH (hỏi DOB, store đăng ký)
2. **Hội viên › Merge** → submit cặp
3. Supervisor approve
4. Sau merge → giải thích KH thẻ secondary đã link vào primary, balance gộp

### Q: KH chargeback đơn nhưng đã đổi quà → âm điểm?

**A:** Hệ thống auto handle: ledger ghi entry `refund` negative, balance đi âm. Block account đến khi KH thanh toán bù hoặc đồng thuận. Tạo ticket investigate. Nếu fraud confirmed → permanent block (UR-MBR-09).

---

## 4. Câu hỏi Marketing Manager

### Q: Tạo campaign nhưng segment chỉ có 100 KH, có nên launch?

**A:** Tuỳ. Min sample size cho A/B test thống kê có ý nghĩa: 1.000/variant. Cho non-A/B (1 variant cho all), 100 KH có thể OK nếu là segment VIP cao giá trị.

### Q: Campaign chạy nhưng conversion thấp?

**A:** Check:
- Notification có gửi đúng segment không? (xem delivery report)
- Open rate thấp → tiêu đề SMS chưa hấp dẫn
- Open rate cao nhưng conversion thấp → offer chưa đủ mạnh hoặc UX flow phức tạp
- Compare với baseline / control group

### Q: Đổi earn rule có hiệu ứng hồi tố không?

**A:** ❌ KHÔNG. Earn rule mới chỉ áp dụng cho đơn từ moment save trở đi. Đơn cũ giữ nguyên points đã tích.

### Q: Stack multiplier × 12 ảnh hưởng cost ra sao?

**A:** Lớn! Xem [`../06-analysis/loyalty-economics.md#multiplier-impact`](../06-analysis/loyalty-economics.md). Khuyến nghị: default `single_highest` hoặc cap `max_stack_factor = 4`.

---

## 5. Câu hỏi Tenant Admin

### Q: Đổi scope từ chain_wide → per_brand có safe không?

**A:** Cần cẩn thận:
1. **[Preview impact]** trước — số KH ảnh hưởng, phân bổ điểm sau split
2. BOD + Marketing approval
3. Announce KH 60-90 ngày
4. Backup snapshot trước apply
5. Có rollback trong 24h

Đọc [`part-07-cross-brand.md#3-đổi-scope-mid-flight-rare`](part-07-cross-brand.md).

### Q: Bulk import 3M KH lần đầu, làm sao?

**A:** ❌ KHÔNG upload CSV 3M trực tiếp qua UI. Cần ETL pipeline với Reborn migration team. Xem [`../06-analysis/data-migration-strategy.md`](../06-analysis/data-migration-strategy.md) — 8 tuần procedure.

### Q: Audit log nói có 1 admin adjust 50 KH trong 1 giờ → có phải fraud?

**A:** Pattern suspicious. Action:
1. Tạm pause user qua **Permission › Disable**
2. Investigate: lý do adjust, KH có liên quan nhau không, value lớn không?
3. Nếu xác nhận fraud → terminate + audit case
4. Update detection rule

### Q: API key của POS bị leak (commit lên GitHub public)?

**A:** Khẩn:
1. **Cài đặt › Integration › API Keys** → revoke key ngay
2. Tạo key mới với scope hạn chế + IP whitelist
3. Sync key mới cho POS team
4. Check request log: có gì abnormal từ key cũ?
5. Audit log incident, post-mortem

---

## 6. Troubleshooting kỹ thuật

### 6.1. API trả 401 INVALID_API_KEY

- Key bị revoke? Check trong settings
- Header sai format? Phải là `X-API-Key: rk_live_<value>`
- Timezone offset? Check `X-Reborn-Timestamp` ± 5 phút nếu signed

### 6.2. API trả 409 DUPLICATE_ORDER

- POS có gửi cùng `order_ref` 2 lần với khác `idempotency_key`
- Investigate POS: có double submit không?
- Có thể là retry bug — review POS error handling

### 6.3. API trả 429 RATE_LIMIT

- Vượt 1.000 req/min/key
- Check header `Retry-After` → retry sau N giây
- Nếu legitimate spike → request tăng limit qua Reborn support

### 6.4. Notification không gửi tới KH

Check:
1. KH có opt-in consent cho channel này không? (consent_log)
2. KH có vượt frequency cap 3 msg/tuần?
3. Gateway có lỗi? (notification service log)
4. KH có blocked không?

### 6.5. Dashboard load chậm > 5s

- Filter quá rộng (3 năm + all brands)? Hẹp lại
- ClickHouse cluster issue? Check ops team
- Browser cache? Hard refresh (Ctrl+Shift+R)

### 6.6. POS lookup KH chậm

- Internet store có ổn không?
- Reborn API health page: status.reborn.vn
- Phone có lỗi format không? Phải E.164 (+84...)

### 6.7. Tier không tự upgrade dù đủ điểm

- Check `lifetime_points_earned` (cộng dồn) vs threshold
- Có phải tier eval period chưa tới?
- Manual trigger: **Tier › Force re-evaluate this member**

### 6.8. Voucher báo "invalid" tại POS

Lý do thường gặp:
- Đã dùng (status = used)
- Đã hết hạn (sau valid_to)
- Đã cancelled (KH huỷ trong period)
- Order amount không đạt min của voucher
- Tier KH không eligible

POS hiển thị reason cụ thể.

---

## 7. Liên hệ hỗ trợ

| Mức | Cách liên hệ | SLA response |
|---|---|---|
| Câu hỏi thông thường | Email `support@reborn.vn` | Trong 8 giờ |
| Issue ảnh hưởng vận hành | Zalo group support | Trong 2 giờ |
| **P1 — Sự cố nghiêm trọng** (hệ thống down, ảnh hưởng > 50% giao dịch) | Hotline 24/7 (sẽ cung cấp khi go-live) | Trong 30 phút |
| Bug nhỏ / cải tiến | Issue tracker | Hàng tuần review |
| Đào tạo bổ sung | Email `support@reborn.vn` | Lên lịch trong 1 tuần |

## 8. Resources

- **Toàn bộ tài liệu:** `docs/` folder
- **API reference:** `04-api/loyalty-openapi.yaml` + Swagger UI tại `loyalty.brand.vn/api-docs`
- **Status page:** `status.reborn.vn` (TBD)
- **Bug report:** GitHub issues (internal)
- **Email Reborn:** `ceo@reborn.vn`, `support@reborn.vn`
