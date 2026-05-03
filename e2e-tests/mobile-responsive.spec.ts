import { test } from "@playwright/test";

const PHONE = "0971234599";
const PASSWORD = "Reborn@12345";

// Emulate iPhone 14 dimensions but keep chromium engine (no webkit installed)
test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
});

const pagesToCheck = [
  "/crm/units",
  "/crm/projects",
  "/crm/lease-contracts",
  "/crm/billing",
  "/crm/vendors",
  "/crm/dashboard",
];

test("mobile responsive screenshot tour", async ({ page, context }) => {
  // Login first
  await page.goto("https://tnpm.reborn.vn/crm/units", { waitUntil: "domcontentloaded" });
  await page
    .waitForFunction(() => location.hostname.includes("sso.reborn.vn") && !!document.querySelector('input[type="password"]'), undefined, { timeout: 30000 })
    .catch(() => {});

  if (page.url().includes("sso.reborn.vn")) {
    await page.locator('input[type="text"], input[type="tel"]').first().fill(PHONE);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForFunction(() => location.hostname.includes("tnpm.reborn.vn"), undefined, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(8000);

    // dismiss tour + pick role if needed
    await page.evaluate(() => {
      document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
    });
    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      await roleCard.click({ force: true });
      await page.locator('button:has-text("Xác nhận")').first().click({ force: true });
      await page.waitForTimeout(8000);
    }
  }

  for (const path of pagesToCheck) {
    await page.goto(`https://tnpm.reborn.vn${path}`, { waitUntil: "domcontentloaded" }).catch(() => {});
    await page.waitForTimeout(4000);
    // dismiss tour if appears
    await page.evaluate(() => {
      document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
    });
    const fname = `e2e-tests/test-results/mobile-${path.replace(/[\/]/g, "-")}.png`;
    await page.screenshot({ path: fname, fullPage: true });
    console.log("📱", path, "→", fname);

    // detect horizontal overflow
    const overflow = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
      bodyW: document.body.scrollWidth,
    }));
    if (overflow.docW > overflow.winW + 1) {
      console.log(`   ⚠️  HORIZONTAL OVERFLOW: scrollWidth=${overflow.docW} winWidth=${overflow.winW}`);
    } else {
      console.log(`   ✓ no overflow (${overflow.docW} ≤ ${overflow.winW})`);
    }
  }
});
