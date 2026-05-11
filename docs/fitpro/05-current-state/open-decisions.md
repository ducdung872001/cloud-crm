# 05.2 — Open Decisions cần BoD chốt

> 9 quyết định chính chưa được lock-in. Mỗi item liệt kê **nguồn yêu cầu, tác động nếu không chốt, khuyến nghị**.

---

## D1. App mobile member — Native vs PWA vs không?

| Phương án | Effort | Ưu | Nhược |
|---|---|---|---|
| **PWA** ⭐ Recommended | ~1 tuần | Reuse cloud-crm; offline cache; install icon trên home screen | Push notification iOS bị giới hạn |
| **React Native / Flutter** | ~1 tháng | Native UX, push notif đầy đủ | Codebase mới, maintain 2 stack |
| **Không app, dùng Zalo OA + web link** | 0 | Tiết kiệm | Member experience kém, không streak gây nghiện |

**Tác động nếu không chốt**: Block F4.5, F6.3, F9.2 (Streak/Leaderboard cần app). Ảnh hưởng timeline + ngân sách lớn.

**Khuyến nghị**: PWA cho launch, đánh giá lại sau 6 tháng dữ liệu user.

---

## D2. Camera & dữ liệu vận hành stream về central — phạm vi Reborn?

**Yêu cầu**: F2.3 đòi camera ở mọi Center stream về HQ.

**Câu hỏi**: Camera là **phần mềm Reborn build** hay **dùng giải pháp sẵn** (Wyze, Dahua, Hikvision API)?

**Khuyến nghị**: Out-of-scope phần mềm Reborn; đưa vào hợp đồng đối tác thi công Setup. Chỉ tích hợp ingest dữ liệu thống kê (số check-in từ camera) qua `integration` microservice.

---

## D3. 5 tier hay 6 tier (thêm Diamond)?

**Conflict**:
- Meeting 06/05/2026 → 6 tier (Cơ bản → Diamond)
- Strategy 11/05/2026 → 5 tier (BASIC 80k → SUPER VIP 500k)

**Khuyến nghị**: Chốt **5 tier** theo bảng giá chiến lược mới nhất (11/05). Diamond có thể thêm sau như "Lifetime/Founder edition" nếu cần positioning thượng lưu hơn nữa.

**Block**: F3 toàn bộ.

---

## D4. Format file Herbalife import + tần suất

**Yêu cầu**: F5.2a import commission HBL.

**Câu hỏi**:
- File CSV hay Excel?
- Tần suất: hàng tuần / tháng?
- Có cột nào bắt buộc / có ID NPP map sang Mã A FitPro?

**Khuyến nghị**: Cần BO trực tiếp xuất 1 file mẫu thật từ tài khoản HBL của họ → Reborn build mapper từ đó.

**Block**: F5.2.

---

## D5. Luật phân phối hoa hồng HBL

**Yêu cầu**: F5.2b engine phân phối.

**Câu hỏi**:
- Chia đều theo cây?
- Theo % cố định mỗi tầng?
- Theo công thức bậc thang (tổng doanh thu nhánh → tier hoa hồng)?

**Khuyến nghị**: Bắt đầu với % cố định cấu hình tại tenant (F5.3). Phức tạp hơn → upgrade rule engine sau.

**Block**: F5.2b.

---

## D6. Quy tắc 7×7×7 — cố định hay config?

**Yêu cầu**: F1.4.

**Câu hỏi**: Quy tắc bảo trợ (7 con/tier, 3 tier) là hardcode trong logic Mã N hay config được theo tenant?

**Khuyến nghị**: Config được — đẩy vào `customer.setting`. Tenant FitPro mặc định 7×7×7; tenant khác có thể set 5×5×5 hoặc khác.

---

## D7. MentorHub tích hợp ngược lại FitPro?

**Yêu cầu**: F9.1c (Hằng tháng học cùng nhau) có thể link sang MentorHub.

**Câu hỏi**: Có cross-product API giữa FitPro và MentorHub không? Member FitPro auto có account MentorHub?

**Khuyến nghị**: Giai đoạn 1 chưa cần — chỉ embed link đơn giản. Giai đoạn 2 nếu có demand thực sự → SSO cross-product.

---

## D8. Hợp đồng Medlatec đã ký chưa?

**Yêu cầu**: F4.3 + F10.3 cần Medlatec API.

**Câu hỏi**: Có sandbox API chưa? Đã có hợp đồng pricing chưa? Bao lâu ký được?

**Khuyến nghị**: Phase 4 mới cần — anh chủ FitPro chốt hợp đồng trong Q3/2026.

**Block**: F4.3, F10.3.

---

## D9. 2 microservice mới (`nutrition`, `analytics`)?

**Đề xuất**: Tách 2 service mới ra khỏi monolith CRM:

| Service | Lý do |
|---|---|
| **`nutrition`** | Đặc thù ngành sức khỏe, không vertical nào khác cần |
| **`analytics`** | Big Data Lifecycle + aggregation + predictive — không để nặng `customer` |

**Khuyến nghị**: BOD duyệt 2 service mới. Lập repo `cloud-nutrition-master` và `cloud-analytics-master` (master branch).

---

## Bảng ưu tiên chốt

| Mức ưu tiên | Decision | Block phase |
|---|---|---|
| 🔴 Phải chốt ngay Phase 0 | D3 (5/6 tier), D9 (services mới) | Phase 1 |
| 🟠 Trước Phase 1 | D1 (mobile), D6 (7×7×7 config) | Phase 1, 3 |
| 🟡 Trước Phase 2 | D4 (HBL format), D5 (luật phân phối) | Phase 2 |
| 🟢 Trước Phase 4 | D2 (camera), D7 (MentorHub), D8 (Medlatec) | Phase 4 |
