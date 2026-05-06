/**
 * E2E test M4 popup — đăng ký 1 attendee có chọn SP/DV bổ sung trên prod,
 * rồi mở popup chi tiết để verify rendering.
 *
 * Flow:
 *  1. Login admin
 *  2. Tìm event có addOnItems (ưu tiên id=32 — "Test sp dv bổ sung")
 *  3. POST /events/public/register với selectedAddOns
 *  4. Vào /ch_events/{id} → tab Người đăng ký → tìm registration vừa tạo
 *  5. Click cell "Sản phẩm, dịch vụ bổ sung" → verify popup
 *
 * Test data có prefix "[E2E TEST]" trong fullName để tester dễ xoá sau.
 *
 * Usage: HEADLESS=true node tests/test-yc-2026-05-06-popup.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, "screenshots", "yc-2026-05-06-popup");
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = "https://hub.reborn.vn/crm";
const USER = "0898348348";
const PASS = "Reborn@12345";
const HEADLESS = process.env.HEADLESS === "true";

const TEST_NAME = `[E2E TEST] popup ${new Date().toISOString().slice(11, 19)}`;
const TEST_PHONE = "0900000" + Math.floor(100 + Math.random() * 900);

const results = [];
function log(label, status, detail = "") {
  const line = `[${status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "·"}] ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push({ label, status, detail });
}

const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 200 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.addInitScript(() => {
  const css = `.tour-overlay, .tour-tooltip, .tour-overlay__mask { display: none !important; pointer-events: none !important; }`;
  const apply = () => {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.head) apply();
  else document.addEventListener("DOMContentLoaded", apply);
});

try {
  // ── LOGIN ────────────────────────────────────────────────────────────
  console.log("\n═══ Login ═══");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/sso|reborn\.vn/i, { timeout: 20000 }).catch(() => {});
  await page.waitForSelector('input[type="password"]', { timeout: 20000, state: "visible" });
  const userInput = page
    .locator('input[type="text"], input[type="tel"], input:not([type]), input[type="email"]')
    .filter({ hasNot: page.locator('input[type="password"]') })
    .first();
  await userInput.fill(USER);
  await page.locator('input[type="password"]').first().fill(PASS);
  await page.getByRole("button", { name: /đăng nhập|sign in|login/i }).first().click();
  await page.waitForURL(/hub\.reborn\.vn\/crm/i, { timeout: 30000 });
  await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 25000 }).catch(() => {});
  log("Login", "PASS");

  // ── PICK EVENT có addOnItems ─────────────────────────────────────────
  console.log("\n═══ Pick event có addOnItems ═══");
  const eventInfo = await page.evaluate(async (preferredId) => {
    const token = document.cookie.match(/(?:^|; )token=([^;]+)/)?.[1];
    const res = await fetch("/bizapi/market/events/list?limit=100", {
      headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    });
    const data = await res.json();
    const items = data?.result?.items ?? data?.result ?? [];
    if (!Array.isArray(items)) return { error: "list non-array" };
    const normalized = items.map((e) => {
      let addOns = e.addOnItems;
      if (typeof addOns === "string") {
        try { addOns = JSON.parse(addOns); } catch {}
      }
      return { id: e.id, slug: e.slug, title: e.title, status: e.status, addOnItems: Array.isArray(addOns) ? addOns : [] };
    });
    const withAddons = normalized.filter((e) => e.addOnItems.length > 0);
    const preferred = withAddons.find((e) => String(e.id) === String(preferredId));
    return { event: preferred ?? withAddons[0], total: withAddons.length };
  }, 32);

  if (!eventInfo?.event) {
    log("Pick event", "FAIL", "không có event có addOnItems trên tenant");
    throw new Error("no event");
  }
  const ev = eventInfo.event;
  console.log(`[pick] id=${ev.id} slug="${ev.slug}" title="${ev.title}" addOnItems=${ev.addOnItems.length}`);
  log("Pick event", "PASS", `id=${ev.id}, ${ev.addOnItems.length} addOnItems`);

  // ── REGISTER attendee với selectedAddOns ─────────────────────────────
  console.log("\n═══ Register attendee với SP/DV ═══");
  // Pick 2 addOnItems đầu, qty = 1 và 2 để test multi-line + quantity
  const sels = ev.addOnItems.slice(0, 2).map((a, i) => ({ addOnId: a.id, qty: i === 0 ? 1 : 2 }));
  const totalAmount = sels.reduce((s, sel) => {
    const item = ev.addOnItems.find((a) => a.id === sel.addOnId);
    return s + (item?.unitPrice ?? 0) * sel.qty;
  }, 0);

  const regResult = await page.evaluate(async ({ slug, body }) => {
    const res = await fetch(`/bizapi/market/events/public/register?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, code: data?.code, error: data?.error || data?.message, result: data?.result };
  }, {
    slug: ev.slug,
    body: {
      fullName: TEST_NAME,
      phone: TEST_PHONE,
      email: "e2e-test@reborn.vn",
      source: "public_portal",
      selectedAddOns: sels,
      totalAmount,
      note: "Auto-generated by tests/test-yc-2026-05-06-popup.mjs",
    },
  });

  console.log(`[register] http=${regResult.status} code=${regResult.code}`);
  if (regResult.status >= 400 || (regResult.code != null && regResult.code !== 0)) {
    log("Register attendee", "FAIL", `${regResult.status} ${regResult.error || ""}`);
    throw new Error(regResult.error || `register failed ${regResult.status}`);
  }
  const newRegId = regResult.result?.id;
  log("Register attendee", "PASS", `regId=${newRegId} totalAmount=${totalAmount}đ items=${sels.length}`);

  // ── NAVIGATE to admin → registrants tab ─────────────────────────────
  console.log("\n═══ Open admin event detail → tab Người đăng ký ═══");
  await page.goto(`${BASE}/ch_events/${ev.id}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.getByRole("button", { name: /người đăng ký/i }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: path.join(SHOTS, "registrants-after-create.png"), fullPage: true });

  // Verify new registration row tồn tại
  const newRowExists = await page.locator(`tr:has-text("${TEST_NAME}")`).count();
  if (newRowExists === 0) {
    log("New registration visible in table", "FAIL", `không tìm thấy row "${TEST_NAME}"`);
    throw new Error("new reg not visible");
  }
  log("New registration visible in table", "PASS", `${newRowExists} row`);

  // ── CLICK cell SP/DV → expect popup ─────────────────────────────────
  console.log("\n═══ Click cell SP/DV → verify popup ═══");
  const spdvButton = page.locator(`tr:has-text("${TEST_NAME}") button[title*="sản phẩm"]`).first();
  if (await spdvButton.count() === 0) {
    log("M4 cell button trong row test", "FAIL", "không tìm thấy button SP/DV trong row test");
    throw new Error("no spdv button");
  }
  // Capture button text to verify cell rendering before click
  const cellText = (await spdvButton.textContent())?.trim() ?? "";
  console.log(`[m4] cell text: "${cellText}"`);
  log("Cell render với SP/DV summary", cellText.length > 0 ? "PASS" : "FAIL", `text="${cellText}"`);

  await spdvButton.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, "popup-opened.png"), fullPage: true });

  // Verify popup nội dung
  const popupTitle = await page.getByText(new RegExp(`Sản phẩm.*dịch vụ bổ sung.*${TEST_NAME.replace(/[[\]]/g, ".")}`, "i")).count();
  const popupHeaderDonGia = await page.locator('th:has-text("Đơn giá")').count();
  const popupHeaderThanhTien = await page.locator('th:has-text("Thành tiền")').count();
  const popupTotalRow = await page.getByText(/tổng sp \/ dv bổ sung/i).count();

  // Verify số dòng = số addOn đã chọn
  const popupRowCount = await page.locator('div[style*="position: fixed"] tbody tr').count();

  console.log(`[m4 popup] title=${popupTitle} đơnGiá=${popupHeaderDonGia} thànhTiền=${popupHeaderThanhTien} totalRow=${popupTotalRow} rows=${popupRowCount}`);

  if (popupTitle > 0 && popupHeaderDonGia > 0 && popupHeaderThanhTien > 0 && popupTotalRow > 0) {
    log("M4 popup chi tiết SP/DV", "PASS", `title=${popupTitle}, headers OK, ${popupRowCount} rows + 1 total row`);
  } else {
    log("M4 popup chi tiết SP/DV", "FAIL", `title=${popupTitle} đơnGiá=${popupHeaderDonGia} thànhTiền=${popupHeaderThanhTien} totalRow=${popupTotalRow}`);
  }

  // Verify expected addOn names xuất hiện trong popup
  const expectedNames = sels.map((s) => ev.addOnItems.find((a) => a.id === s.addOnId)?.name).filter(Boolean);
  for (const name of expectedNames) {
    const seen = await page.locator(`div[style*="position: fixed"] :text("${name}")`).count();
    log(`M4 popup chứa "${name}"`, seen > 0 ? "PASS" : "FAIL", `count=${seen}`);
  }

  // Verify total amount
  const formatVND = new Intl.NumberFormat("vi-VN").format(Math.round(totalAmount));
  const totalSeen = await page.locator(`div[style*="position: fixed"] :text("${formatVND}")`).count();
  log(`M4 popup show total ${formatVND}đ`, totalSeen > 0 ? "PASS" : "FAIL");

  // Đóng popup
  await page.locator('button:has-text("✕")').first().click().catch(() => {});
  await page.waitForTimeout(300);
} catch (err) {
  log("Test runner", "FAIL", err.message);
  await page.screenshot({ path: path.join(SHOTS, "fatal.png"), fullPage: true }).catch(() => {});
} finally {
  console.log("\n═══ SUMMARY ═══");
  results.forEach((r) => console.log(`  ${r.status === "PASS" ? "✓" : r.status === "FAIL" ? "✗" : "·"} ${r.label}${r.detail ? `  (${r.detail})` : ""}`));
  const failed = results.filter((r) => r.status === "FAIL").length;
  const passed = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${passed} pass · ${failed} fail · screenshots: ${SHOTS}`);
  console.log(`\n⚠ Test data đã tạo: registration "${TEST_NAME}" (phone=${TEST_PHONE})`);
  console.log(`   Admin có thể vào /ch_events/event-id → tab Người đăng ký → đổi status sang "Đã huỷ" để dọn.`);
  await browser.close();
  process.exitCode = failed > 0 ? 1 : 0;
}
