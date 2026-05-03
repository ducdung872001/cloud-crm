import { test } from "@playwright/test";

test("probe operation BE endpoints with real JWT", async ({ page }) => {
  await page.goto("https://tnpm.reborn.vn/crm/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => location.hostname.includes("sso.reborn.vn") && !!document.querySelector('input[type="password"]'), undefined, { timeout: 30000 }).catch(() => {});

  if (page.url().includes("sso.reborn.vn")) {
    await page.locator('input[type="text"], input[type="tel"]').first().fill("0971234599");
    await page.locator('input[type="password"]').first().fill("Reborn@12345");
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForFunction(() => location.hostname.includes("tnpm.reborn.vn"), undefined, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(8000);
    await page.evaluate(() => document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove()));
    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      await roleCard.click({ force: true });
      await page.locator('button:has-text("Xác nhận")').first().click({ force: true });
      await page.waitForTimeout(8000);
    }
  }

  // Add request listener BEFORE final navigation so we catch dashboard's first auth call
  let captured: string | null = null;
  page.on("request", (req) => {
    const auth = req.headers()["authorization"] || req.headers()["Authorization"];
    if (auth && auth.startsWith("Bearer ") && !captured) captured = auth;
  });
  // Force a fresh page nav that triggers new API calls
  await page.goto("https://tnpm.reborn.vn/crm/units", { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(8000);
  const token = captured ? (captured as string).replace(/^Bearer /i, "") : "";
  console.log("Token captured:", !!token, "len:", token.length);
  if (!token) return;

  // Probe operation endpoints
  const endpoints = [
    "/operation/project/list?page=0&size=3",
    "/operation/space/list?page=0&size=3",
    "/operation/spaceType/list?page=0&size=3",
    "/operation/electricMeter/list?page=0&size=3",
    "/operation/electricIndex/list?page=0&size=3",
    "/operation/electricityRate/list?page=0&size=3",
    "/operation/managementFee/list?page=0&size=3",
    "/operation/managementFeeRate/list?page=0&size=3",
    "/operation/vehicle/list?page=0&size=3",
    "/operation/parkingFee/list?page=0&size=3",
    "/operation/utilityReading/list?page=0&size=3",
    "/operation/building/list?page=0&size=3",
    "/operation/buildingFloor/list?page=0&size=3",
  ];

  for (const ep of endpoints) {
    const result = await page.evaluate(
      async ({ url, tk }) => {
        const r = await fetch(`https://biz.reborn.vn${url}`, {
          headers: { Authorization: `Bearer ${tk}`, Hostname: "kcn.reborn.vn" },
        });
        const text = await r.text();
        return { status: r.status, body: text.substring(0, 400) };
      },
      { url: ep, tk: token }
    );
    console.log(`${result.status} ${ep}\n   ${result.body.replace(/\s+/g, " ").substring(0, 250)}\n`);
  }
});
