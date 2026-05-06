/**
 * E2E test cho yc tester 2026-05-06 — verify M1/M3/M4 trên prod.
 *
 * M1: /crm/events (public) — kicker "Cộng đồng · Sự kiện · Kết nối" ẩn khi tenant
 *     đã upload banner (W-HOUSE). Test default tenant: kicker visible.
 * M3: /crm/ch_events/32 — tab "Người đăng ký" không crash (event có addOnItems).
 * M4: cột "Sản phẩm, dịch vụ bổ sung" tồn tại + click cell mở popup chi tiết.
 *
 * Usage: node tests/test-yc-2026-05-06.mjs
 *   env: HEADLESS=true (default headed cho debug; CI nên set true)
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, "screenshots", "yc-2026-05-06");
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = "https://hub.reborn.vn/crm";
const USER = "0898348348";
const PASS = "Reborn@12345";
const HEADLESS = process.env.HEADLESS === "true";

const results = [];
function log(label, status, detail = "") {
  const line = `[${status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "·"}] ${label}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push({ label, status, detail });
}

const browser = await chromium.launch({ headless: HEADLESS, slowMo: HEADLESS ? 0 : 300 });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

// Track unhandled console errors / page errors during tests
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(`[pageerror] ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`[console.error] ${msg.text()}`);
});

try {
  // ═══ M1 (PUBLIC) — kiểm tra trước khi login ═══════════════════════════
  console.log("\n═══ M1: Public events page kicker ═══");
  await page.goto(`${BASE}/events`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: path.join(SHOTS, "m1-public-events.png"), fullPage: true });

  const kickerCount = await page.locator(".pe-hero__kicker").count();
  const bannerCount = await page.locator(".pe-banner-img-wrap img").count();

  if (bannerCount > 0) {
    if (kickerCount === 0) {
      log("M1 (banner uploaded → kicker hidden)", "PASS", `banner=${bannerCount}, kicker=${kickerCount}`);
    } else {
      log("M1 (banner uploaded → kicker hidden)", "FAIL", `banner present nhưng kicker vẫn render (${kickerCount})`);
    }
  } else {
    if (kickerCount === 1) {
      log("M1 (no banner → kicker visible — default tenant)", "PASS", "đúng default behavior");
    } else {
      log("M1 (default kicker)", "FAIL", `expected 1 kicker, got ${kickerCount}`);
    }
  }

  // ═══ LOGIN qua SSO ═══════════════════════════════════════════════════
  console.log("\n═══ Login qua SSO ═══");
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/sso|auth|login|reborn\.vn/i, { timeout: 20000 }).catch(() => {});
  console.log(`[login] đã redirect tới: ${page.url()}`);

  // SSO page là SPA — chờ network idle + chờ password input thực sự render
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForSelector('input[type="password"]', { timeout: 20000, state: "visible" });

  // Tìm input username — placeholder có thể đa dạng
  const userInput = page
    .locator('input[type="text"], input[type="tel"], input:not([type]), input[type="email"]')
    .filter({ hasNot: page.locator('input[type="password"]') })
    .first();
  const passInput = page.locator('input[type="password"]').first();

  await userInput.fill(USER);
  await passInput.fill(PASS);
  await page.screenshot({ path: path.join(SHOTS, "login-form-filled.png"), fullPage: true });
  await page.getByRole("button", { name: /đăng nhập|sign in|login/i }).first().click();

  // Chờ về app
  await page.waitForURL(/hub\.reborn\.vn\/crm/i, { timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => !!localStorage.getItem("permissions"), null, { timeout: 25000 }).catch(() => {});
  console.log(`[login] đã về app: ${page.url()}`);
  log("Login SSO", "PASS", page.url());

  // Tắt onboarding tour (chặn UI test)
  await page.evaluate(() => {
    const uid = JSON.parse(localStorage.getItem("user.root") || "0") || 0;
    const now = new Date().toISOString();
    ["login", "shift", "pos", "barcode_print", "events", "members"].forEach((t) => {
      localStorage.setItem(`reborn_onboarding_${uid}_${t}`, now);
      localStorage.setItem(`reborn_onboarding_0_${t}`, now);
    });
  });
  // Bấm "Bỏ qua" trên tour overlay nếu còn — backup cho localStorage marker
  const skipBtn = page.getByRole("button", { name: /^bỏ qua$/i }).first();
  if (await skipBtn.count() > 0) {
    await skipBtn.click({ force: true }).catch(() => {});
  }
  // Inject CSS ẩn tour overlay áp cho mọi page load tiếp theo
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
  // Inject style ngay cho page hiện tại
  await page.addStyleTag({
    content: `.tour-overlay, .tour-tooltip, .tour-overlay__mask { display: none !important; pointer-events: none !important; }`,
  }).catch(() => {});
  await page.screenshot({ path: path.join(SHOTS, "after-login.png"), fullPage: true });

  // ═══ M3 — Tab Người đăng ký KHÔNG crash trên event có addOnItems ═══
  console.log("\n═══ M3: tìm event có addOnItems → test tab Người đăng ký ═══");
  consoleErrors.length = 0;

  // Pick event qua API list — chọn event có addOnItems (mục 7 SP/DV bổ sung)
  const eventInfo = await page.evaluate(async () => {
    const token = document.cookie.match(/(?:^|; )token=([^;]+)/)?.[1];
    const res = await fetch("/bizapi/market/events/list?limit=100", {
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();
    const items = data?.result?.items ?? data?.result ?? [];
    if (!Array.isArray(items)) return { error: "list trả về non-array", raw: data };
    const candidates = items.map((e) => {
      let addOns = e.addOnItems;
      if (typeof addOns === "string") {
        try { addOns = JSON.parse(addOns); } catch {}
      }
      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        status: e.status,
        addOnCount: Array.isArray(addOns) ? addOns.length : 0,
      };
    });
    const withAddons = candidates.filter((c) => c.addOnCount > 0);
    return {
      total: candidates.length,
      withAddons,
      withoutAddons: candidates.filter((c) => c.addOnCount === 0).slice(0, 3),
    };
  });
  console.log(`[m3] events list: total=${eventInfo.total}, with addOnItems=${eventInfo.withAddons?.length ?? 0}`);
  if (eventInfo.withAddons) eventInfo.withAddons.forEach((e) => console.log(`     id=${e.id} title="${e.title}" addOns=${e.addOnCount}`));

  const targetEvent = eventInfo.withAddons?.[0];
  if (!targetEvent) {
    log("M3 (find event with addOnItems)", "WARN", "không có event nào có addOnItems trên tenant này — không reproduce được scenario");
  } else {
    await page.goto(`${BASE}/ch_events/${targetEvent.id}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.screenshot({ path: path.join(SHOTS, "m3-event-detail.png"), fullPage: true });

    const registrantsTab = page.getByRole("button", { name: /người đăng ký/i }).first();
    if (await registrantsTab.count() === 0) {
      log("M3 (tab Người đăng ký)", "FAIL", `không thấy tab — event ${targetEvent.id} có thể bị lỗi load`);
    } else {
    await registrantsTab.click();
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await page.screenshot({ path: path.join(SHOTS, "m3-registrants-tab.png"), fullPage: true });

    const errorBoundary = await page.getByText(/đã xảy ra lỗi/i).count();
    const tableExists = await page.locator("table").count();
    const cardTitle = await page.getByText(/danh sách người đăng ký/i).count();

    if (errorBoundary > 0) {
      log("M3 (no crash on registrants tab)", "FAIL", "ErrorBoundary hiển thị 'Đã xảy ra lỗi'");
    } else if (tableExists > 0 || cardTitle > 0) {
      log("M3 (no crash on registrants tab)", "PASS", `card="${cardTitle}", tables=${tableExists}`);
    } else {
      log("M3 (no crash on registrants tab)", "WARN", "không thấy ErrorBoundary nhưng cũng không thấy table — có thể không có đăng ký nào");
    }

    // ═══ M4 — Cột "Sản phẩm, dịch vụ bổ sung" + popup ═══
    console.log("\n═══ M4: Cột SP/DV bổ sung ═══");
    const colHeader = await page.getByRole("columnheader", { name: /sản phẩm.*dịch vụ bổ sung/i }).count();
    const colHeaderAlt = await page.locator('th:has-text("Sản phẩm, dịch vụ bổ sung")').count();
    const colCount = colHeader + colHeaderAlt;

    if (colCount > 0) {
      log("M4 (column header tồn tại)", "PASS", `count=${colCount}`);

      // Click cell trong cột đó nếu có data
      const cellButton = page.locator('button[title*="sản phẩm"], button[title*="dịch vụ"]').first();
      if (await cellButton.count() > 0) {
        await cellButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SHOTS, "m4-popup.png"), fullPage: true });

        const popupTitle = await page.getByText(/sản phẩm \/ dịch vụ bổ sung/i).count();
        const popupTable = await page.locator('th:has-text("Đơn giá"), th:has-text("Thành tiền")').count();

        if (popupTitle > 0 && popupTable > 0) {
          log("M4 (click cell mở popup chi tiết)", "PASS", "popup có title + bảng đơn giá/thành tiền");
        } else {
          log("M4 (click cell mở popup chi tiết)", "FAIL", `popupTitle=${popupTitle}, popupTable=${popupTable}`);
        }
      } else {
        log("M4 (click cell)", "WARN", "không có registration nào với SP/DV → không click test được. Header đã verify.");
      }
    } else {
      log("M4 (column header)", "FAIL", "không thấy cột 'Sản phẩm, dịch vụ bổ sung'");
    }
    }
  }

  if (consoleErrors.length > 0) {
    console.log("\n[console errors during M3/M4]");
    consoleErrors.forEach((e) => console.log("  " + e));
  }
} catch (err) {
  log("Test runner", "FAIL", err.message);
  await page.screenshot({ path: path.join(SHOTS, "fatal.png"), fullPage: true }).catch(() => {});
} finally {
  console.log("\n═══ SUMMARY ═══");
  results.forEach((r) => console.log(`  ${r.status === "PASS" ? "✓" : r.status === "FAIL" ? "✗" : "·"} ${r.label}${r.detail ? `  (${r.detail})` : ""}`));
  const failed = results.filter((r) => r.status === "FAIL").length;
  const passed = results.filter((r) => r.status === "PASS").length;
  console.log(`\n${passed} pass · ${failed} fail · screenshots: ${SHOTS}`);
  await browser.close();
  process.exitCode = failed > 0 ? 1 : 0;
}
