import { test, expect } from "@playwright/test";

const PHONE = "0971234599";
const PASSWORD = "Reborn@12345";
const CRM = process.env.LOCAL_CRM_URL || "http://localhost:4000";
const SSO = process.env.LOCAL_SSO_URL || "http://localhost:8080";

test("probe: local CRM login via local SSO (port 8080)", async ({ page }) => {
  test.setTimeout(120_000);

  const consoleLog: string[] = [];
  const navigationLog: string[] = [];
  const networkLog: { url: string; status: number; method: string; reqHeaders: any }[] = [];
  const failedLog: { url: string; status: number; method: string; body: string }[] = [];

  page.on("console", (msg) => consoleLog.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => consoleLog.push(`[pageerror] ${err.message}`));
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigationLog.push(frame.url());
  });
  page.on("response", async (resp) => {
    const url = resp.url();
    if (url.match(/\.(woff2?|ttf|css|svg|png|jpg|jpeg|ico|gif|js|map|json)(\?|$)/i)) return;
    const status = resp.status();
    const reqHeaders = resp.request().headers();
    if (url.includes("reborn.vn") || url.includes("localhost:8080") || url.includes("localhost:4000")) {
      networkLog.push({ url, status, method: resp.request().method(), reqHeaders });
    }
    if (status >= 400) {
      let body = "";
      try {
        body = (await resp.text()).substring(0, 300);
      } catch {}
      failedLog.push({ url, status, method: resp.request().method(), body });
    }

    if (url.includes("/employee/roles")) {
      try {
        const body = await resp.text();
        console.log(`\n===== ROLES RESPONSE BODY =====\n${body}\n`);
      } catch {}
    }
  });

  // 1. open CRM /crm/login (Router basename is /crm/) → expect redirect to local SSO
  console.log(`\n[goto] ${CRM}/crm/login`);
  await page.goto(`${CRM}/crm/login`, { waitUntil: "commit", timeout: 60_000 }).catch((e) => {
    console.log("goto error:", e.message);
  });

  // wait for SSO password field OR back at localhost:4000 with a token
  await page
    .waitForFunction(
      () => {
        const onSso = location.host.includes("localhost:8080") || location.hostname.includes("sso.");
        const hasPw = !!document.querySelector('input[type="password"]');
        return onSso && hasPw;
      },
      undefined,
      { timeout: 60_000 }
    )
    .catch(() => {});

  console.log("\n===== AFTER INITIAL LOAD =====");
  console.log("URL:", page.url());
  console.log("Title:", await page.title().catch(() => "?"));

  if (page.url().includes("localhost:8080") || page.url().includes("sso.")) {
    const pwInput = page.locator('input[type="password"]').first();
    const phoneInput = page.locator('input[type="text"], input[type="tel"], input[name*="phone" i]').first();

    await phoneInput.fill(PHONE);
    await pwInput.fill(PASSWORD);
    const submit = page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first();
    await submit.click();

    // wait until back at localhost:4000
    await page
      .waitForFunction(() => location.host.includes("localhost:4000"), undefined, { timeout: 30_000 })
      .catch(() => {});

    // wait for navigation away from /crm/login (means we got logged in & redirected to dashboard)
    await page
      .waitForFunction(() => !location.pathname.endsWith("/crm/login") && location.pathname !== "/crm/", undefined, {
        timeout: 30_000,
      })
      .catch(() => {});

    await page.waitForTimeout(6000);

    // role chooser modal
    const roleCard = page.locator('text="Ban giám đốc"').first();
    if (await roleCard.isVisible().catch(() => false)) {
      console.log("[role chooser] picking Ban giám đốc");
      await page.evaluate(() => {
        document.querySelectorAll(".tour-tooltip, [class*='tour' i]").forEach((el) => el.remove());
      });
      await roleCard.click({ force: true });
      const confirmBtn = page.locator('button:has-text("Xác nhận")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click({ force: true });
      }
      await page.waitForTimeout(10_000);
    }
  }

  console.log("\n===== AFTER LOGIN ATTEMPT =====");
  console.log("URL:", page.url());

  console.log("\n===== NAVIGATION HISTORY =====");
  navigationLog.forEach((u, i) => console.log(`${i}: ${u}`));

  console.log("\n===== ALL BE API CALLS =====");
  for (const n of networkLog) {
    if (n.url.includes("reborn.vn")) {
      const hn = n.reqHeaders["hostname"] || n.reqHeaders["Hostname"];
      console.log(`${n.status} ${n.method} ${n.url}${hn ? "  [Hostname:" + hn + "]" : ""}`);
    }
  }

  console.log("\n===== CONSOLE/PAGE ERRORS (first 60) =====");
  consoleLog.slice(0, 60).forEach((l) => console.log(l));

  console.log("\n===== COOKIES =====");
  const cookies = await page.context().cookies();
  cookies.forEach((c) => console.log(`  ${c.domain} ${c.name}=${c.value.substring(0, 30)}...`));

  console.log("\n===== FAILED (>=400) =====");
  failedLog.forEach((f) => {
    console.log(`${f.status} ${f.method} ${f.url}`);
    if (f.body) console.log(`   body: ${f.body.replace(/\s+/g, " ").substring(0, 200)}`);
  });

  console.log("\n===== PAGE TEXT (first 800 chars) =====");
  const bodyText = await page.locator("body").innerText().catch(() => "");
  console.log(bodyText.substring(0, 800));

  console.log("\n===== TOASTS =====");
  const toasts = await page.locator(".Toastify__toast, [class*='toast' i]").allInnerTexts().catch(() => []);
  toasts.forEach((t) => console.log("→", t));

  await page.screenshot({ path: "e2e-tests/test-results/local-login-final.png", fullPage: true });
  console.log("\nScreenshot: e2e-tests/test-results/local-login-final.png");

  // soft assert: we should be back on localhost:4000 and have a token cookie
  expect(page.url()).toContain("localhost:4000");
  const tokenCookie = cookies.find((c) => c.name === "token");
  expect(tokenCookie, "token cookie should exist after SSO login").toBeTruthy();
});
