import { test, expect } from "@playwright/test";

const PHONE = "0971234599";
const PASSWORD = "Reborn@12345";

test("probe: login flow on tnpm.reborn.vn", async ({ page }) => {
  const consoleLog: string[] = [];
  const networkLog: { url: string; status: number; method: string; reqHeaders: any; respHeaders: any }[] = [];
  const navigationLog: string[] = [];

  page.on("console", (msg) => {
    consoleLog.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) {
      navigationLog.push(frame.url());
    }
  });
  const allFailedResp: { url: string; status: number; method: string; body: string; reqHeaders: any }[] = [];
  page.on("response", async (resp) => {
    const url = resp.url();
    const isAsset = url.match(/\.(woff2?|ttf|css|svg|png|jpg|jpeg|ico|gif|js|map)(\?|$)/i);
    if (isAsset) return;
    const status = resp.status();
    const reqHeaders = resp.request().headers();

    if (url.includes("reborn.vn")) {
      networkLog.push({
        url,
        status,
        method: resp.request().method(),
        reqHeaders,
        respHeaders: resp.headers(),
      });
    }

    if (status >= 400) {
      let body = "";
      try {
        body = (await resp.text()).substring(0, 500);
      } catch {}
      allFailedResp.push({ url, status, method: resp.request().method(), body, reqHeaders });
    }

    if (
      url.includes("/customer/employee/info") ||
      url.includes("/customer/employee/init") ||
      url.includes("/authenticator/user/me")
    ) {
      try {
        const body = (await resp.text()).substring(0, 800);
        console.log(`\n[BODY] ${resp.request().method()} ${url}\n${body}\n`);
      } catch {}
    }
  });

  await page.goto("https://tnpm.reborn.vn/crm/login", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  // Wait for either SSO password field or the page to settle on tnpm again
  await page
    .waitForFunction(
      () => location.hostname.includes("sso.reborn.vn") && !!document.querySelector('input[type="password"]'),
      undefined,
      { timeout: 30000 }
    )
    .catch(() => {});

  console.log("\n===== AFTER INITIAL LOAD =====");
  console.log("Current URL:", page.url());
  console.log("Title:", await page.title().catch(() => "?"));

  if (page.url().includes("sso.reborn.vn")) {
    const pwInput = page.locator('input[type="password"]').first();
    const phoneInput = page.locator('input[type="text"], input[type="tel"]').first();
    await phoneInput.fill(PHONE);
    await pwInput.fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

    // Wait until we leave SSO and arrive back at tnpm
    await page
      .waitForFunction(() => location.hostname.includes("tnpm.reborn.vn"), undefined, { timeout: 30000 })
      .catch(() => {});
    // Then give the SPA time to settle (call /me, /beautySalon, etc.)
    await page.waitForTimeout(8000);

    // If role-chooser modal is shown, pick the first role
    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      console.log("\n[role chooser visible — picking first role]");
      // Dismiss any product tour tooltip blocking the modal
      await page.evaluate(() => {
        document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
      });
      await roleCard.click({ force: true });
      const confirmBtn = page.locator('button:has-text("Xác nhận")').first();
      await confirmBtn.click({ force: true });
      await page.waitForTimeout(10000);
    }
  }

  console.log("\n===== AFTER LOGIN ATTEMPT =====");
  console.log("Current URL:", page.url());

  console.log("\n===== NAVIGATION HISTORY =====");
  navigationLog.forEach((u, i) => console.log(`${i}: ${u}`));

  console.log("\n===== CONSOLE LOG =====");
  consoleLog.forEach((l) => console.log(l));

  console.log("\n===== API CALLS =====");
  for (const n of networkLog) {
    console.log(`${n.status} ${n.method} ${n.url}`);
    if (n.reqHeaders["hostname"] || n.reqHeaders["Hostname"]) {
      console.log(`   ↳ Hostname header: ${n.reqHeaders["hostname"] || n.reqHeaders["Hostname"]}`);
    }
    if (n.reqHeaders["authorization"]) {
      console.log(`   ↳ Auth: present (${n.reqHeaders["authorization"].substring(0, 25)}...)`);
    }
    if (n.status >= 400 || n.url.includes("/profile") || n.url.includes("/employee") || n.url.includes("/login")) {
      try {
        const body = await (await fetch(n.url, {
          method: "HEAD",
        })).text().catch(() => "");
        // skip body fetch — just summarize
      } catch {}
    }
  }

  // capture cookies
  const cookies = await page.context().cookies();
  console.log("\n===== COOKIES =====");
  cookies
    .filter((c) => c.domain.includes("reborn.vn"))
    .forEach((c) => console.log(`${c.domain} ${c.name}=${c.value.substring(0, 30)}...`));

  console.log("\n===== ALL FAILED (>=400) RESPONSES =====");
  for (const f of allFailedResp) {
    console.log(`${f.status} ${f.method} ${f.url}`);
    if (f.reqHeaders["hostname"] || f.reqHeaders["Hostname"]) {
      console.log(`   ↳ Hostname: ${f.reqHeaders["hostname"] || f.reqHeaders["Hostname"]}`);
    }
    console.log(`   ↳ body: ${f.body.replace(/\s+/g, " ").substring(0, 300)}`);
  }

  console.log("\n===== PAGE TEXT (first 800 chars) =====");
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log(bodyText.substring(0, 800));

  console.log("\n===== TOASTS =====");
  const toasts = await page.locator(".Toastify__toast, [class*='toast' i]").allInnerTexts().catch(() => []);
  toasts.forEach((t) => console.log("→", t));

  // page screenshot to see toast / state
  await page.screenshot({ path: "e2e-tests/test-results/tnpm-login-final.png", fullPage: true });
  console.log("\nScreenshot: e2e-tests/test-results/tnpm-login-final.png");
});
