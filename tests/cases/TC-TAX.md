# TC-TAX — Phân hệ Thuế HKD/CNKD

Module: `src/modules/tax/` · Routes: `/tax`, `/tax/profile`, `/tax/book`, `/tax/declaration`, `/tax/calendar`, `/tax/advisory` · Storage: `localStorage` keys `reborn.tax.*`

Tuân thủ: TT 40/2021/TT-BTC · NĐ 70/2025/NĐ-CP · NĐ 123/2020/NĐ-CP

---

## 🧮 Nhóm A — Unit test domain layer (Vitest)

Chạy: `npx vitest run src/modules/tax/domain/__tests__`

### A1 — TaxCalculator

- **TC-TAX-A1-001**: Nhóm `distribution` (1%+0.5%) — Doanh thu 100.000.000 → GTGT 1.000.000, TNCN 500.000, Tổng 1.500.000.
- **TC-TAX-A1-002**: Nhóm `service_no_material` (5%+2%) — Doanh thu 50.000.000 → GTGT 2.500.000, TNCN 1.000.000.
- **TC-TAX-A1-003**: Nhóm `production_transport` (3%+1.5%) — Doanh thu 200.000.000 → GTGT 6.000.000, TNCN 3.000.000.
- **TC-TAX-A1-004**: Nhóm `other_business` (2%+1%) — Doanh thu 10.000.000 → GTGT 200.000, TNCN 100.000.
- **TC-TAX-A1-005**: Nhóm `asset_lease` (0+5%) — Doanh thu 20.000.000 → GTGT 0, TNCN 1.000.000.
- **TC-TAX-A1-006**: Nhiều nhóm ngành trong 1 kỳ — breakdowns chứa đầy đủ từng nhóm, tổng đúng.
- **TC-TAX-A1-007**: Doanh thu không chịu thuế (`isTaxable=false`) — không tính vào total.
- **TC-TAX-A1-008**: Giao dịch ngoài khoảng kỳ — không tính.
- **TC-TAX-A1-009**: Kỳ rỗng (không giao dịch) — total=0, breakdowns có 1 dòng industryGroup của taxpayer với 0đ.
- **TC-TAX-A1-010**: Môn bài kỳ `year` — áp dụng theo bậc bandwidth.
- **TC-TAX-A1-011**: Môn bài kỳ `month/quarter` — = 0 (chỉ tính vào kỳ năm).

### A2 — calcLicenseFee (môn bài)

- **TC-TAX-A2-001**: DT 80tr → 0 (≤100tr miễn)
- **TC-TAX-A2-002**: DT 100tr → 0 (đúng ngưỡng vẫn miễn)
- **TC-TAX-A2-003**: DT 150tr → 300.000
- **TC-TAX-A2-004**: DT 300tr → 300.000 (biên trên của bậc)
- **TC-TAX-A2-005**: DT 400tr → 500.000
- **TC-TAX-A2-006**: DT 500tr → 500.000
- **TC-TAX-A2-007**: DT 600tr → 1.000.000
- **TC-TAX-A2-008**: DT 5 tỷ → 1.000.000

### A3 — ThresholdChecker

- **TC-TAX-A3-001**: DT 85tr → cảnh báo `near_exemption`
- **TC-TAX-A3-002**: DT 120tr → cảnh báo `crossed_exemption`
- **TC-TAX-A3-003**: DT 1.2 tỷ ngành `distribution`, usesCashRegister=false → `must_use_cash_register` (critical)
- **TC-TAX-A3-004**: DT 1.2 tỷ ngành `distribution`, usesCashRegister=true → KHÔNG có cảnh báo cash register
- **TC-TAX-A3-005**: DT 1.2 tỷ ngành `production_transport` → KHÔNG có cảnh báo cash register (không thuộc nhóm bắt buộc)
- **TC-TAX-A3-006**: DT 3.5 tỷ → cảnh báo `must_switch_to_declaration`
- **TC-TAX-A3-007**: DT 50tr → không cảnh báo nào

### A4 — DeclarationBuilder

- **TC-TAX-A4-001**: Build tạo declaration với formCode = `01/CNKD`, status = `draft`, có xmlPayload
- **TC-TAX-A4-002**: XML chứa MST, mã mẫu, kỳ khai, từng nhóm ngành
- **TC-TAX-A4-003**: Escape XML cho các ký tự đặc biệt (`&`, `<`, `>`, `"`) trong tên/địa chỉ
- **TC-TAX-A4-004**: Checkbox phương pháp map đúng (presumptive→HKDKhoan, declaration→HKDKeKhai…)
- **TC-TAX-A4-005**: ID declaration unique (chứa period.id + timestamp)

### A5 — DeadlineHelper

- **TC-TAX-A5-001**: `buildMonthPeriod(2026-03-15)` → id `month-2026-03`, start `2026-03-01`, end `2026-03-31`, due `2026-04-20`
- **TC-TAX-A5-002**: `buildQuarterPeriod(2026-05-10)` → id `quarter-2026-Q2`, start `2026-04-01`, end `2026-06-30`
- **TC-TAX-A5-003**: `buildYearPeriod(2026)` → start `2026-01-01`, end `2026-12-31`, due `2027-03-31`
- **TC-TAX-A5-004**: `daysUntilDue` — tính đúng số ngày dương/âm
- **TC-TAX-A5-005**: `buildYearCalendar` kỳ month → trả 12 kỳ
- **TC-TAX-A5-006**: `buildYearCalendar` kỳ quarter → trả 4 kỳ
- **TC-TAX-A5-007**: `buildYearCalendar` kỳ year → trả 1 kỳ
- **TC-TAX-A5-008**: `buildCurrentPeriod` dispatch đúng theo `taxpayer.periodKind`

---

## 🌐 Nhóm B — Smoke test UI (Playwright)

Chạy: `node tests/test-tax-smoke.mjs` (cần dev server http://localhost:4000)

- **TC-TAX-B-001**: Mở `/tax` — Dashboard render, không console error, thấy text "5 chỉ số sinh tồn" hoặc KpiTiles
- **TC-TAX-B-002**: Mở `/tax/profile` — Wizard render, 4 card phương pháp (Khoán/Kê khai/Từng lần/Khai thay)
- **TC-TAX-B-003**: Mở `/tax/book` — Sổ DT/CP render, có filter ngành + period buttons
- **TC-TAX-B-004**: Mở `/tax/declaration` — Wizard render, thấy stepper 5 bước
- **TC-TAX-B-005**: Mở `/tax/calendar` — Lịch render, thấy danh sách kỳ trong năm
- **TC-TAX-B-006**: Mở `/tax/advisory` — FAQ render, thấy ≥6 câu hỏi
- **TC-TAX-B-007**: Click tab "Hồ sơ thuế" từ Dashboard — navigate tới `/tax/profile` không full reload (SPA)
- **TC-TAX-B-008**: Console errors count = 0 trên tất cả trang

---

## 🔄 Nhóm C — Flow test xuyên luồng (Playwright)

Chạy: `node tests/test-tax-flow.mjs`

### Flow 1 — Lập hồ sơ thuế mới

- **TC-TAX-C1-001**: Vào `/tax/profile` khi chưa có hồ sơ → thấy form trống
- **TC-TAX-C1-002**: Chọn phương pháp "Kê khai" → card có border xanh
- **TC-TAX-C1-003**: Chọn ngành "service_no_material" → hiển thị 7% bên phải
- **TC-TAX-C1-004**: Điền MST, họ tên, CCCD, địa chỉ, tỉnh → Lưu
- **TC-TAX-C1-005**: Kiểm tra `localStorage.reborn.tax.profile` có dữ liệu vừa nhập
- **TC-TAX-C1-006**: Reload trang → form giữ dữ liệu (persistence OK)

### Flow 2 — Thêm điều chỉnh doanh thu thủ công

- **TC-TAX-C2-001**: Vào `/tax/book`, click "+ Thêm điều chỉnh doanh thu thủ công" → form xuất hiện
- **TC-TAX-C2-002**: Nhập số tiền trống → báo lỗi "Số tiền phải lớn hơn 0"
- **TC-TAX-C2-003**: Nhập mô tả trống → báo lỗi "Vui lòng nhập mô tả"
- **TC-TAX-C2-004**: Nhập đầy đủ → Lưu → hàng mới xuất hiện trong bảng với badge "Điều chỉnh tay" vàng
- **TC-TAX-C2-005**: Tổng doanh thu tăng bằng đúng số vừa nhập
- **TC-TAX-C2-006**: Click nút X để xoá → hàng biến mất, tổng giảm

### Flow 3 — Lập tờ khai 01/CNKD đầy đủ 5 bước

- **TC-TAX-C3-001**: Vào `/tax/declaration` → Stepper hiển thị bước 1 active
- **TC-TAX-C3-002**: Bước 1: chọn kỳ "Tháng" → label kỳ cập nhật, button "Tiếp tục" enable
- **TC-TAX-C3-003**: Bước 2: tổng hợp chạy, hiển thị 4 Stat (GD, DT, Thuế, Lợi nhuận)
- **TC-TAX-C3-004**: Bước 2: click "Lập tờ khai 01/CNKD" → tiến sang bước 3
- **TC-TAX-C3-005**: Bước 3: Preview render — thấy "TỜ KHAI THUẾ ĐỐI VỚI HỘ KINH DOANH", 4 checkbox phương pháp, bảng 4 nhóm ngành
- **TC-TAX-C3-006**: Bước 3: click "🖨️ In" → window.print() trigger
- **TC-TAX-C3-007**: Bước 3: click "Tiếp tục ký số" → bước 4
- **TC-TAX-C3-008**: Bước 4: click "Ký số & xác nhận" → loading, sau đó chuyển bước 5
- **TC-TAX-C3-009**: Bước 5: click "Nộp lên eTax Mobile" → hiển thị receipt code mock
- **TC-TAX-C3-010**: Declaration lưu vào `localStorage.reborn.tax.declarations`

### Flow 4 — Lịch thuế phản ánh tờ khai đã nộp

- **TC-TAX-C4-001**: Vào `/tax/calendar` sau Flow 3 → kỳ vừa nộp có badge "Đã nộp" xanh
- **TC-TAX-C4-002**: Kỳ chưa làm → badge "Chưa lập" neutral
- **TC-TAX-C4-003**: Click nút "Xem" trên kỳ đã nộp → navigate `/tax/declaration`

### Flow 5 — Yêu cầu hỗ trợ đại lý thuế

- **TC-TAX-C5-001**: Vào `/tax/advisory`, click "Yêu cầu hỗ trợ" → form xuất hiện, họ tên + SĐT prefilled từ profile
- **TC-TAX-C5-002**: Để trống họ tên → báo lỗi
- **TC-TAX-C5-003**: Điền đủ → submit → hiển thị success 4s, form tự đóng
- **TC-TAX-C5-004**: `localStorage.reborn.tax.support_requests` chứa 1 item

### Flow 6 — Ngưỡng doanh thu cảnh báo

- **TC-TAX-C6-001**: Profile ngành `distribution`, thêm manual revenue 1.2 tỷ → Dashboard hiện cảnh báo `must_use_cash_register` critical
- **TC-TAX-C6-002**: Profile ngành `other_business`, thêm manual revenue 3.5 tỷ → Dashboard hiện cảnh báo `must_switch_to_declaration` critical

---

## 📋 Nhóm D — Kịch bản manual (không auto)

Các điểm cần test bằng tay, khó auto:

- **TC-TAX-D-001**: Preview in ra giấy A4 — các chỉ tiêu không bị tràn, bảng không vỡ
- **TC-TAX-D-002**: XML payload đúng schema TCT khi có tài liệu thật (cần BE xác nhận)
- **TC-TAX-D-003**: Ký số thật bằng USB Token / VNPT-CA / FPT-CA SDK (phase 2)
- **TC-TAX-D-004**: Liên thông eTax thật lên Cổng TCT (phase 2, cần BE)
- **TC-TAX-D-005**: Đa người dùng cùng nhánh — localStorage không dùng được (cần BE thay)
- **TC-TAX-D-006**: Tờ khai bổ sung (sửa sai) — chưa có luồng, cần bổ sung sau
- **TC-TAX-D-007**: Mẫu 03/CNKD (thực tế) — chưa hỗ trợ, chờ spec
- **TC-TAX-D-008**: Mẫu 01/LPMB (môn bài riêng) — chưa có form riêng, chờ spec

---

## 🚦 Pass criteria

- Nhóm A (unit): 100% pass
- Nhóm B (smoke): 0 console error + tất cả route render
- Nhóm C (flow): tất cả bước hoạt động, persistence chính xác, tổng/cảnh báo phản ánh đúng
- Nhóm D (manual): ghi nhận trong `docs/taxes/test-findings.md` để confirm
