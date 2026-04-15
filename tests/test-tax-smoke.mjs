/**
 * test-tax-smoke.mjs — Smoke test cho phân hệ Thuế HKD/CNKD.
 * Navigate tất cả /tax/* routes, bắt console error, verify render cơ bản.
 *
 * Yêu cầu: dev server chạy tại http://localhost:4000/crm
 * Chạy: node tests/test-tax-smoke.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const TAX_ROUTES = [
  ["TAX-SMK-001", "/tax", "Dashboard", ["Tổng quan", "5 chỉ số", "Doanh thu"]],
  ["TAX-SMK-002", "/tax/profile", "Hồ sơ thuế", ["Hồ sơ thuế", "Khoán", "Kê khai"]],
  ["TAX-SMK-003", "/tax/book", "Sổ DT/CP", ["Sổ doanh thu", "Sổ chi phí"]],
  ["TAX-SMK-004", "/tax/declaration", "Declaration Wizard", ["Chọn kỳ", "Tổng hợp"]],
  ["TAX-SMK-005", "/tax/calendar", "Lịch thuế", ["Năm", "Hạn nộp"]],
  ["TAX-SMK-006", "/tax/advisory", "Tư vấn", ["Câu hỏi thường gặp", "FAQ", "Yêu cầu hỗ trợ"]],
];

(async () => {
  const t = await createTestRunner("TAX-SMK", "Tax Module Smoke");
  const ok = await t.login();
  if (!ok) return t.done();

  const consoleErrors = [];
  t.page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      // Bỏ qua các warning không liên quan
      if (
        !txt.includes("favicon") &&
        !txt.includes("Failed to load resource") &&
        !txt.toLowerCase().includes("websocket")
      ) {
        consoleErrors.push(txt);
      }
    }
  });

  for (const [tc, route, label, expectedTexts] of TAX_ROUTES) {
    consoleErrors.length = 0; // reset mỗi trang
    await t.goto(route);
    await t.page.waitForTimeout(1500);

    // Screenshot
    await t.screenshot(`${tc}-${label.replace(/\s+/g, "_")}`);

    // Kiểm tra render — ít nhất 1 trong các text phải xuất hiện
    let foundAny = false;
    for (const text of expectedTexts) {
      if (await t.hasText(text)) {
        foundAny = true;
        break;
      }
    }
    t.assert(
      `${tc}-render`,
      foundAny,
      `${label} render: tìm thấy text trong [${expectedTexts.join(", ")}]`
    );

    // Kiểm tra không có console error nghiêm trọng
    t.assert(
      `${tc}-no-error`,
      consoleErrors.length === 0,
      consoleErrors.length === 0
        ? `${label} không có console error`
        : `${label} có ${consoleErrors.length} console error: ${consoleErrors.slice(0, 2).join(" | ")}`
    );
  }

  // Test SPA navigation: click tab từ Dashboard sang Profile không reload
  await t.goto("/tax");
  await t.page.waitForTimeout(1000);
  const beforeUrl = t.page.url();
  // Click link "Hồ sơ thuế" trong tab nav
  const clickedTab = await t.page
    .locator('a[href="/tax/profile"], a[href*="/tax/profile"]')
    .first()
    .click({ timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await t.page.waitForTimeout(1500);
  const afterUrl = t.page.url();
  t.assert(
    "TAX-SMK-007-spa-nav",
    clickedTab && afterUrl.includes("/tax/profile"),
    `SPA navigation tab: ${beforeUrl} → ${afterUrl}`
  );

  await t.done();
})().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
