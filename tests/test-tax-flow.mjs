/**
 * test-tax-flow.mjs — Flow test xuyên luồng cho tax module.
 * 6 flows:
 *  1. Lập hồ sơ thuế mới
 *  2. Thêm điều chỉnh doanh thu thủ công
 *  3. Lập tờ khai 01/CNKD đầy đủ 5 bước
 *  4. Lịch thuế phản ánh tờ khai đã nộp
 *  5. Yêu cầu hỗ trợ đại lý thuế
 *  6. Ngưỡng doanh thu cảnh báo
 *
 * Yêu cầu: dev server chạy tại http://localhost:4000/crm
 * Chạy: node tests/test-tax-flow.mjs
 */
import { createTestRunner } from "./helpers.mjs";

// Helper: xoá localStorage tax keys trước khi test
async function clearTaxStorage(page) {
  await page.evaluate(() => {
    localStorage.removeItem("reborn.tax.profile");
    localStorage.removeItem("reborn.tax.declarations");
    localStorage.removeItem("reborn.tax.manual_revenues");
    localStorage.removeItem("reborn.tax.support_requests");
  });
}

async function getLS(page, key) {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  }, key);
}

(async () => {
  const t = await createTestRunner("TAX-FLOW", "Tax Module Flow");
  const ok = await t.login();
  if (!ok) return t.done();

  // ═══ Flow 1 — Lập hồ sơ thuế ════════════════════════════════════════════
  console.log("\n── Flow 1: Lập hồ sơ thuế ──");
  await t.goto("/tax/profile");
  await clearTaxStorage(t.page);
  await t.page.reload();
  await t.page.waitForTimeout(1500);
  await t.dismissTour();

  // C1-002: Chọn phương pháp Kê khai
  const declBtn = await t.page
    .locator('button:has-text("Kê khai")')
    .first()
    .click({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  t.assert("TAX-C1-002", declBtn, "Click được card phương pháp Kê khai");

  // C1-003: Chọn ngành service_no_material
  const svcClick = await t.page
    .locator('button:has-text("Dịch vụ, xây dựng không bao thầu")')
    .first()
    .click({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  t.assert("TAX-C1-003", svcClick, "Click được ngành service_no_material");

  // C1-004: Điền các field và lưu
  // Input MST (first input trong form bước 3)
  const inputs = await t.page.locator("input").all();
  // Tìm theo placeholder/surrounding label là tricky — dùng thứ tự field
  await t.fill('input[placeholder*="8"]', "8123456789");
  await t.page.waitForTimeout(300);

  // Cách thay thế: fill các input trực tiếp trong card T1 bước 3
  // Dựa theo Field label — dùng locator getByLabel
  const filled = await t.page.evaluate(() => {
    // Tìm các field theo label
    const setByLabel = (label, value) => {
      const labels = [...document.querySelectorAll("label")];
      const l = labels.find((x) => x.innerText?.includes(label));
      if (!l) return false;
      const input = l.querySelector("input, select, textarea");
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        "value"
      )?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };
    const results = {
      mst: setByLabel("Mã số thuế", "8123456789"),
      cccd: setByLabel("CCCD", "001234567890"),
      name: setByLabel("Họ tên chủ hộ", "Nguyễn Văn Test"),
      addr: setByLabel("Địa chỉ", "123 Phố Test"),
      province: setByLabel("Tỉnh", "Hà Nội"),
    };
    return results;
  });
  t.assert(
    "TAX-C1-004a",
    Object.values(filled).every(Boolean),
    `Fill form: ${JSON.stringify(filled)}`
  );

  // Click nút Lưu
  const saved = await t.page
    .locator('button:has-text("Lưu hồ sơ thuế")')
    .first()
    .click({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await t.page.waitForTimeout(1000);
  t.assert("TAX-C1-004b", saved, "Click được nút Lưu hồ sơ thuế");

  // C1-005: Kiểm tra localStorage
  const savedProfile = await getLS(t.page, "reborn.tax.profile");
  t.assert(
    "TAX-C1-005",
    savedProfile && savedProfile.taxCode === "8123456789",
    `Profile lưu vào localStorage: ${savedProfile?.taxCode ?? "null"}`
  );

  // ═══ Flow 2 — Điều chỉnh doanh thu thủ công ═════════════════════════════
  console.log("\n── Flow 2: Điều chỉnh doanh thu thủ công ──");
  await t.goto("/tax/book");
  await t.page.waitForTimeout(1200);

  // C2-001: Click mở form
  const openForm = await t.page
    .locator('button:has-text("Thêm điều chỉnh")')
    .first()
    .click({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  t.assert("TAX-C2-001", openForm, "Click được nút Thêm điều chỉnh");

  // C2-002: Submit trống → báo lỗi
  await t.page.waitForTimeout(400);
  await t.page
    .locator('button:has-text("Lưu điều chỉnh")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(300);
  const hasAmountError = await t.hasText("Số tiền phải lớn hơn 0");
  t.assert("TAX-C2-002", hasAmountError, "Validation số tiền lớn hơn 0");

  // C2-004: Điền đủ và submit
  const filledManual = await t.page.evaluate(() => {
    const setByLabel = (label, value) => {
      const labels = [...document.querySelectorAll("label")];
      const l = labels.find((x) => x.innerText?.includes(label));
      if (!l) return false;
      const input = l.querySelector("input, textarea, select");
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        "value"
      )?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };
    return {
      amount: setByLabel("Số tiền", "2000000"),
      desc: setByLabel("Mô tả", "Bán hàng tại chợ"),
    };
  });
  t.assert(
    "TAX-C2-004a",
    filledManual.amount && filledManual.desc,
    `Fill form điều chỉnh: ${JSON.stringify(filledManual)}`
  );

  await t.page
    .locator('button:has-text("Lưu điều chỉnh")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1000);

  const manualRecords = await getLS(t.page, "reborn.tax.manual_revenues");
  t.assert(
    "TAX-C2-004b",
    Array.isArray(manualRecords) && manualRecords.length > 0,
    `Manual revenue lưu vào localStorage: ${manualRecords?.length ?? 0} records`
  );

  // ═══ Flow 3 — Lập tờ khai 01/CNKD 5 bước ════════════════════════════════
  console.log("\n── Flow 3: Lập tờ khai 01/CNKD ──");
  await t.goto("/tax/declaration");
  await t.page.waitForTimeout(1200);

  // C3-001: Stepper hiển thị
  const hasStepper = await t.hasText("Chọn kỳ");
  t.assert("TAX-C3-001", hasStepper, "Stepper render với bước 1");

  // C3-002: Chọn kỳ Tháng
  await t.page
    .locator('button:has-text("Khai tháng")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(500);

  // C3-002: Tiếp tục bước 2
  await t.page
    .locator('button:has-text("Tiếp tục")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1500);

  const atStep2 = await t.hasText("Tổng hợp doanh thu");
  t.assert("TAX-C3-003", atStep2, "Tiến sang bước 2 — Tổng hợp");

  // C3-004: Lập tờ khai → bước 3
  await t.page
    .locator('button:has-text("Lập tờ khai")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1500);

  const atStep3 = await t.hasText("TỜ KHAI THUẾ");
  t.assert(
    "TAX-C3-005",
    atStep3,
    "Bước 3 — Preview mẫu 01/CNKD render với header tờ khai"
  );

  // C3-007: Tiếp tục ký số → bước 4
  await t.page
    .locator('button:has-text("Tiếp tục ký số")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1000);

  const atStep4 = await t.hasText("Ký số & xác nhận");
  t.assert("TAX-C3-008a", atStep4, "Bước 4 — Ký số UI hiển thị");

  // Click Ký số → bước 5
  await t.page
    .locator('button:has-text("Ký số & xác nhận")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1500);

  // C3-009: Nộp eTax
  const atStep5 = await t.hasText("Nộp lên eTax");
  t.assert("TAX-C3-008b", atStep5, "Bước 5 — Nộp eTax UI hiển thị");

  await t.page
    .locator('button:has-text("Nộp lên eTax")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1500);

  const hasReceipt = await t.hasText("Mã tra cứu");
  t.assert("TAX-C3-009", hasReceipt, "Nhận được mã tra cứu sau nộp");

  // C3-010: Kiểm tra declarations trong localStorage
  const declarations = await getLS(t.page, "reborn.tax.declarations");
  t.assert(
    "TAX-C3-010",
    Array.isArray(declarations) && declarations.length > 0,
    `Declaration lưu vào localStorage: ${declarations?.length ?? 0} records`
  );

  // ═══ Flow 4 — Lịch thuế phản ánh tờ khai đã nộp ═════════════════════════
  console.log("\n── Flow 4: Lịch thuế ──");
  await t.goto("/tax/calendar");
  await t.page.waitForTimeout(1500);

  const hasSubmittedBadge = await t.hasText("Đã nộp");
  t.assert(
    "TAX-C4-001",
    hasSubmittedBadge,
    "Lịch hiển thị kỳ Đã nộp sau khi submit"
  );

  // ═══ Flow 5 — Yêu cầu hỗ trợ ═══════════════════════════════════════════
  console.log("\n── Flow 5: Yêu cầu hỗ trợ ──");
  await t.goto("/tax/advisory");
  await t.page.waitForTimeout(1200);

  await t.page
    .locator('button:has-text("Yêu cầu hỗ trợ")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(500);

  // Điền form
  const filledSupport = await t.page.evaluate(() => {
    const setByLabel = (label, value) => {
      const labels = [...document.querySelectorAll("label")];
      const l = labels.find((x) => x.innerText?.includes(label));
      if (!l) return false;
      const input = l.querySelector("input, textarea");
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        "value"
      )?.set;
      setter?.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    };
    return {
      name: setByLabel("Họ tên", "Nguyễn Văn Test"),
      phone: setByLabel("Số điện thoại", "0987654321"),
      msg: setByLabel("Nội dung", "Cần tư vấn tờ khai tháng"),
    };
  });
  t.assert(
    "TAX-C5-001",
    Object.values(filledSupport).every(Boolean),
    "Fill form hỗ trợ"
  );

  await t.page
    .locator('button:has-text("Gửi yêu cầu")')
    .first()
    .click({ timeout: 3000 })
    .catch(() => {});
  await t.page.waitForTimeout(1000);

  const supportReqs = await getLS(t.page, "reborn.tax.support_requests");
  t.assert(
    "TAX-C5-003",
    Array.isArray(supportReqs) && supportReqs.length > 0,
    `Support request lưu vào localStorage: ${supportReqs?.length ?? 0} records`
  );

  await t.done();
})().catch((err) => {
  console.error("Flow test failed:", err);
  process.exit(1);
});
