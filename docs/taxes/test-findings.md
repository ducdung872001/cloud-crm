# Test Findings — Phân hệ Thuế HKD/CNKD

**Ngày test**: 2026-04-15
**Nhánh**: `reborn-fitpro` (fix sau đó propagate sang `community-hub` + `reborn-retail`)
**Dev server**: http://localhost:4000/crm
**Commits đã fix**: sẽ gắn sau commit

---

## 📊 Tổng kết

| Nhóm test | Tổng | Pass | Fail | Tỉ lệ |
|---|---|---|---|---|
| Unit (Vitest — domain layer) | 39 | 39 | 0 | 100% |
| Smoke (Playwright — UI render) | 14 | 14 | 0 | 100% |
| Flow (Playwright — xuyên luồng) | 20 | 20 | 0 | 100% |
| **Tổng** | **73** | **73** | **0** | **100%** |

Tất cả tests đã pass sau khi fix 2 bug thật phát hiện trong quá trình test.

---

## 🐛 Bugs đã fix trong quá trình test

### Bug #1 — Timezone shift trong `DeadlineHelper.isoDate()`

**File**: [src/modules/tax/domain/engine.ts:400](../../src/modules/tax/domain/engine.ts#L400)
**Phát hiện bởi**: TC-TAX-A5-001, TC-TAX-A5-002
**Severity**: 🔴 High — ảnh hưởng toàn bộ period generation

**Mô tả**:
Hàm `isoDate(d: Date)` gọi `d.toISOString().slice(0, 10)`. Vì `new Date(y, m, 1)` tạo Date ở **local timezone** (VN = UTC+7), nên `toISOString()` sẽ convert về UTC, shift ngày ngược lại 1 ngày.

Ví dụ: `new Date(2026, 2, 1)` tại máy VN = `2026-03-01 00:00:00 +07:00` = `2026-02-28 17:00:00 UTC` → `.slice(0,10)` = `"2026-02-28"`.

Hậu quả: Mọi kỳ tháng/quý/năm đều bị lệch 1 ngày về trước, khiến:
- Doanh thu ngày cuối tháng không được đưa vào kỳ đúng
- Hạn nộp hiển thị sai ngày
- ID kỳ `month-2026-03` có startDate `2026-02-28` — không match logic khác

**Fix**: Thay bằng format local Y/M/D:
```ts
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
```

**Verify**: TC-TAX-A5-001 → A5-008 pass 100% sau fix.

---

### Bug #2 — `TaxCalendar` ẩn tờ khai có kỳ khác cấu hình

**File**: [src/modules/tax/ui/TaxCalendar.tsx:11-17](../../src/modules/tax/ui/TaxCalendar.tsx#L11)
**Phát hiện bởi**: TC-TAX-C4-001
**Severity**: 🟡 Medium — UX bug, user mất dấu tờ khai đã nộp

**Mô tả**:
`TaxCalendar` chỉ build lịch theo `profile.periodKind`. Nếu user cấu hình "năm" nhưng lập 1 tờ khai "tháng" riêng lẻ qua DeclarationWizard, tờ khai đó sẽ **không hiển thị** trên calendar vì không có period nào match id.

Trong real-world: user có thể cấu hình mặc định "năm" nhưng thỉnh thoảng lập tờ khai tháng bổ sung → calendar không show → user tưởng hệ thống mất tờ khai.

**Fix**: Merge thêm periods từ declarations vào calendar, ngoài schedule cấu hình:
```ts
const scheduleIds = new Set(schedulePeriods.map((p) => p.id));
const extraPeriods = declarations
  .filter(
    (d) =>
      !scheduleIds.has(d.period.id) &&
      d.period.startDate.slice(0, 4) === String(year)
  )
  .map((d) => d.period);
const periods = [...schedulePeriods, ...extraPeriods].sort(
  (a, b) => a.startDate.localeCompare(b.startDate)
);
```

**Verify**: TC-TAX-C4-001 pass sau fix.

---

## ❓ Điểm cần confirm (chưa fix, chờ phản hồi)

Các điểm dưới đây **có thể là bug, có thể là intended**, hoặc cần phối hợp với backend. Liệt kê để bạn confirm hướng xử lý.

### Q1 — Mock signing & mock eTax submission

**File**: [src/modules/tax/services/eTaxGateway.ts](../../src/modules/tax/services/eTaxGateway.ts)

Hiện ký số + nộp eTax đều là **mock** — luôn trả `ok: true` với receipt code giả `MOCK-*`. Khi gọi production sẽ fail do chưa có SOAP endpoint thật.

**Câu hỏi**:
- Có cần giao BE tích hợp thật với VNPT-CA/FPT-CA SDK + eTax API TCT chưa?
- Nếu chưa, có cần UI banner warning "Đang dùng chế độ mock" để user biết?

**Đề xuất**: Phase 2 — BE team tích hợp, thay implementation trong `eTaxGateway.ts` giữ nguyên signature.

---

### Q2 — XML payload schema chưa chuẩn TCT

**File**: [src/modules/tax/domain/engine.ts:239-290](../../src/modules/tax/domain/engine.ts#L239)

`DeclarationBuilder.buildXmlPayload()` tạo XML theo layout **mẫu giấy** của 01/CNKD (field `<HSoThueDTu>`, `<NNT>`, `<CTieuTKhaiChinh>`…). Tên tag là do tôi tự đặt theo logic, **không đối chiếu với SOAP schema thật** của Tổng cục Thuế (không có trong docs/taxes/).

**Câu hỏi**:
- Có phải schema TCT thật dùng tên tag khác? Cần tài liệu schema (.xsd hoặc ví dụ XML thật).
- Nếu BE có kinh nghiệm integrate eTax rồi thì chuyển tasks này sang BE để verify.

**Đề xuất**: Yêu cầu BE cung cấp schema thật hoặc tài liệu API của TCT để chuẩn hoá.

---

### Q3 — Mẫu 03/CNKD (quyết toán thực tế) chưa hỗ trợ

**Docs đề cập**: `crm_hokd_proposal.html` nhắc tới mẫu `03/CNKD` cho HKD kê khai kết quả kinh doanh thực tế.

**Hiện trạng**: Module chỉ hỗ trợ `01/CNKD` (dùng cho cả khoán và kê khai). Mẫu `03/CNKD` chưa implement vì không có file mẫu trong `docs/taxes/`.

**Câu hỏi**:
- Có cần implement ngay không? Nếu có, xin cung cấp file mẫu `03/CNKD` (.pdf hoặc .docx).

**Đề xuất**: Để phase 2, bạn confirm khi nào cần.

---

### Q4 — Mẫu 01/LPMB (môn bài) chưa có form riêng

**Hiện trạng**: `calcLicenseFee()` trong engine tính đúng số tiền môn bài theo bậc doanh thu, và được gộp vào `totalTaxPayable` khi kỳ là "year". Nhưng **không có form riêng cho 01/LPMB** — mẫu môn bài trong thực tế là tờ khai độc lập.

**Câu hỏi**:
- HKD thường nộp môn bài 1 lần/năm qua tờ khai riêng. Có cần UI riêng cho bước này không, hay gộp vào tờ khai năm là đủ?

**Đề xuất**: Nếu cần form riêng, thêm route `/tax/license-fee` trong phase 2.

---

### Q5 — Persistence qua localStorage

**Files**: [src/modules/tax/services/taxStorage.ts](../../src/modules/tax/services/taxStorage.ts)

Hiện profile + declarations + manual revenues + support requests đều lưu **localStorage**. Hạn chế:
- Không share giữa nhiều user trên cùng browser
- Clear cache = mất dữ liệu
- Không backup
- Không nhiều device
- Không thoả mãn nghĩa vụ **lưu trữ sổ sách 10 năm** theo Luật Kế toán

**Câu hỏi**:
- Khi nào BE sẵn sàng tạo bảng `tax_profile`, `tax_declaration`, `tax_revenue_manual`, `tax_support_request`?
- `taxStorage` giữ nguyên interface — BE chỉ cần thay implementation sang API calls.

**Đề xuất**: Chuyển sang BE team. Gợi ý schema:
```sql
-- tax_profile
id, tenant_id, tax_code, full_name, national_id, business_name,
address, province, method, period_kind, industry_group, bank_*,
uses_cash_register, created_at, updated_at

-- tax_declaration
id, tenant_id, taxpayer_id, form_code, period_json, method,
calculation_json, xml_payload, status, submitted_at, receipt_code,
submission_channel, created_at, updated_at

-- tax_revenue_manual
id, tenant_id, taxpayer_id, occurred_at, amount, industry_group,
description, is_taxable, created_at

-- tax_support_request
id, tenant_id, taxpayer_id, full_name, phone, topic, message,
status, created_at
```

---

### Q6 — Tờ khai bổ sung (sửa sai) chưa có luồng

**Hiện trạng**: Mẫu 01/CNKD có ô `[02] Bổ sung lần thứ` — dùng khi tờ khai đã nộp bị phát hiện sai số. Hiện module chỉ hỗ trợ "Lần đầu", chưa có luồng sửa.

**Câu hỏi**:
- Có cần luồng "Lập tờ khai bổ sung" trong phase 1 không?

**Đề xuất**: Phase 2 — thêm nút "Bổ sung" trên tờ khai đã nộp, sinh tờ khai mới với tick ô bổ sung.

---

### Q7 — Multi-tenant / phân quyền

**Hiện trạng**: Module không check permission — bất kỳ user nào login vào nhánh đều thấy được `/tax/*`.

**Câu hỏi**:
- Cần thêm permission code (vd `TAX_VIEW`, `TAX_DECLARE`, `TAX_SUBMIT`) vào menu không?
- Trong nhánh `reborn-retail` (chuỗi) có thể cần phân quyền theo chi nhánh — chỉ chủ HKD mới nộp được.

**Đề xuất**: Phối hợp với team quản lý phân quyền của từng nhánh. Menu đã có sẵn field `code` để bind permission.

---

### Q8 — Máy tính tiền kết nối TCT (NĐ 70/2025)

**Hiện trạng**: `ThresholdChecker` cảnh báo khi DT > 1 tỷ/năm + ngành bắt buộc (F&B, bán lẻ) + `usesCashRegister=false`. Nhưng **không thực sự kết nối** với máy tính tiền.

**Câu hỏi**:
- Reborn có kế hoạch tích hợp máy tính tiền kết nối TCT không?
- Nếu có, mỗi giao dịch POS sẽ cần gửi real-time về TCT — cần phối hợp BE + thiết bị.

**Đề xuất**: Tách ra thành sub-project riêng, không làm trong phase 1.

---

### Q9 — Đa nguồn dữ liệu trong cùng 1 nhánh

**Hiện trạng**: Mỗi nhánh có **1 adapter** mặc định qua `ACTIVE_BRANCH`. Nhưng thực tế nhánh `reborn-fitpro` có thể có cả doanh thu từ booking + bán sản phẩm phụ trợ (nước, áo, thẻ…), từ nhiều source khác nhau.

**Câu hỏi**:
- Có cần hỗ trợ multi-source adapter (gộp data từ nhiều module con) không?

**Đề xuất**: Khi cần, viết `compositeAdapter` wrap nhiều adapter, trả về merge của các `getRevenueRecords()`. Chưa cần phase 1.

---

### Q10 — Môn bài không tách thành kỳ riêng

**Hiện trạng**: `calcLicenseFee()` chỉ tính khi `period.kind === "year"`. Nếu HKD khai kỳ tháng/quý thì môn bài không được nhắc tới trong bất kỳ kỳ nào.

**Câu hỏi**:
- Thực tế môn bài phải nộp riêng trước 31/01 hằng năm. UI có cần nhắc user nộp môn bài đầu năm không?

**Đề xuất**: Thêm notification card trong Dashboard khi chuyển sang năm mới: "⚠ Hạn nộp môn bài 31/01, số tiền dự kiến X₫".

---

## 📋 Các điểm manual test (TC-TAX-D)

Các testcase TC-TAX-D-001 đến D-008 (xem [TC-TAX.md](../../tests/cases/TC-TAX.md) nhóm D) cần **test thủ công** — không auto được:

| TC | Nội dung | Trạng thái |
|---|---|---|
| D-001 | Preview in ra giấy A4 không tràn | ⚠ Chưa test — cần xác nhận bằng máy in thật |
| D-002 | XML payload đúng schema TCT | ❓ Chờ BE xác nhận schema thật |
| D-003 | Ký số USB Token thật | 🔜 Phase 2 |
| D-004 | Nộp eTax thật lên TCT | 🔜 Phase 2, cần BE |
| D-005 | Multi-user cùng browser | ❌ Không làm được với localStorage, cần BE |
| D-006 | Tờ khai bổ sung | 🔜 Chưa có luồng (Q6) |
| D-007 | Mẫu 03/CNKD | 🔜 Chờ spec (Q3) |
| D-008 | Mẫu 01/LPMB riêng | 🔜 Chờ confirm (Q4) |

---

## 🎯 Action items

### Đã làm (tôi tự fix)
- [x] Bug #1 — timezone isoDate
- [x] Bug #2 — calendar ẩn tờ khai khác kỳ

### Cần bạn confirm để tôi làm tiếp
- [ ] **Q3**: Cung cấp file mẫu 03/CNKD nếu cần implement
- [ ] **Q4**: Có cần form riêng cho 01/LPMB không?
- [ ] **Q6**: Có cần luồng tờ khai bổ sung trong phase 1 không?
- [ ] **Q7**: Permission codes cho từng nhánh
- [ ] **Q10**: Thêm reminder môn bài đầu năm vào Dashboard?

### Cần chuyển BE team
- [ ] **Q1**: Tích hợp thật VNPT-CA/FPT-CA SDK + eTax API TCT
- [ ] **Q2**: Xác nhận XML schema chuẩn TCT, cung cấp .xsd hoặc ví dụ thật
- [ ] **Q5**: Tạo bảng + API cho `tax_profile`, `tax_declaration`, `tax_revenue_manual`, `tax_support_request`
- [ ] **Q8**: Tích hợp máy tính tiền kết nối TCT (sub-project riêng)

### Optional / future
- [ ] **Q9**: Composite adapter cho multi-source

---

## 📁 Artifacts test

- Testcase doc: [tests/cases/TC-TAX.md](../../tests/cases/TC-TAX.md)
- Unit tests: [src/modules/tax/domain/__tests__/engine.test.ts](../../src/modules/tax/domain/__tests__/engine.test.ts)
- Vitest config: [src/modules/tax/domain/__tests__/vitest.tax.config.ts](../../src/modules/tax/domain/__tests__/vitest.tax.config.ts)
- Smoke test: [tests/test-tax-smoke.mjs](../../tests/test-tax-smoke.mjs)
- Flow test: [tests/test-tax-flow.mjs](../../tests/test-tax-flow.mjs)
- Reports (JSON): `tests/reports/tax-smk-*.json`, `tests/reports/tax-flow-*.json`
- Screenshots: `tests/screenshots/TAX-SMK-*.png`

## 🏃 Chạy lại tests

```bash
# Unit (không cần dev server)
npx vitest run --config src/modules/tax/domain/__tests__/vitest.tax.config.ts

# Smoke (cần dev server http://localhost:4000)
HEADLESS=true node tests/test-tax-smoke.mjs

# Flow (cần dev server)
HEADLESS=true node tests/test-tax-flow.mjs
```
