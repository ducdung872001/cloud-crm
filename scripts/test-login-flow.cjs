// End-to-end test: visit /crm/, follow SSO redirect, login, verify app renders.
const { chromium } = require("playwright");

const USERNAME = "0971234599";
const PASSWORD = "Reborn@12345";

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on("console", (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => pageErrors.push({ message: err.message, stack: err.stack }));
  page.on("requestfailed", (req) => requestFailures.push({ url: req.url(), failure: req.failure()?.errorText }));
  page.on("response", (resp) => {
    if (resp.status() >= 400) requestFailures.push({ url: resp.url(), status: resp.status() });
  });

  const log = (s) => console.log(s);

  log("→ Step 1: navigate to http://localhost:4000/crm/");
  await page.goto("http://localhost:4000/crm/", { waitUntil: "domcontentloaded", timeout: 60000 });
  log("  current URL: " + page.url());

  // Wait for SSO redirect
  await page.waitForTimeout(4000);
  log("  after 4s URL:  " + page.url());
  log("  title:         " + (await page.title().catch(() => "(n/a)")));

  // Find and fill login form on SSO page
  if (page.url().startsWith("http://localhost:8080")) {
    log("→ Step 2: SSO login page reached. Inspecting form fields…");

    // Log all input fields for diagnosis
    const inputs = await page.$$eval("input", (els) =>
      els.map((e) => ({ name: e.name, id: e.id, type: e.type, placeholder: e.placeholder }))
    );
    log("  inputs found: " + JSON.stringify(inputs));

    // Heuristic: pick first non-hidden text/tel input as username, password type as password
    const userInputSel = 'input[name="username"], input[name="phone"], input[type="tel"], input[type="text"]:not([type="hidden"])';
    const passInputSel = 'input[type="password"]';

    try {
      await page.waitForSelector(userInputSel, { timeout: 10000 });
      await page.fill(userInputSel, USERNAME);
      log("  filled username");
    } catch (e) {
      log("  ! could not fill username: " + e.message);
    }

    try {
      await page.fill(passInputSel, PASSWORD);
      log("  filled password");
    } catch (e) {
      log("  ! could not fill password: " + e.message);
    }

    // Submit — try button with text "Đăng nhập" or type=submit
    const submitBtn = await page.$('button[type="submit"]') || await page.$('button:has-text("Đăng nhập")') || await page.$("form button");
    if (submitBtn) {
      log("  clicking submit button…");
      await Promise.all([
        page.waitForLoadState("domcontentloaded", { timeout: 30000 }).catch(() => {}),
        submitBtn.click(),
      ]);
      await page.waitForTimeout(5000);
      log("  after submit URL: " + page.url());
    } else {
      log("  ! no submit button found; submitting form via Enter");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(5000);
      log("  after Enter URL: " + page.url());
    }
  }

  // Should now be back on localhost:4000
  await page.waitForTimeout(6000);
  log("→ Step 3: post-login URL: " + page.url());

  // Try navigating to courses
  log("→ Step 4: navigate to /crm/mh/courses");
  await page.goto("http://localhost:4000/crm/mh/courses", { waitUntil: "domcontentloaded", timeout: 30000 }).catch((e) => log("goto error: " + e.message));
  await page.waitForTimeout(5000);
  log("  URL: " + page.url());

  const cookies = await context.cookies();
  log("cookies: " + JSON.stringify(cookies.map((c) => ({ name: c.name, domain: c.domain, path: c.path, len: (c.value || "").length }))));

  const rootHTML = await page.evaluate(() => document.getElementById("root")?.innerHTML || "").catch(() => "");
  const bodyText = await page.evaluate(() => document.body?.innerText || "").catch(() => "");

  log("\n=== FINAL STATE ===");
  log("URL: " + page.url());
  log("Title: " + await page.title().catch(() => "(n/a)"));
  log("#root innerHTML length: " + rootHTML.length);
  log("body text (first 600 chars):");
  log(bodyText.slice(0, 600) || "(empty)");

  log("\n=== CONSOLE (" + consoleLogs.length + ") ===");
  for (const l of consoleLogs.slice(-25)) log(`[${l.type}] ${l.text}`.slice(0, 250));

  log("\n=== PAGE ERRORS (" + pageErrors.length + ") ===");
  for (const e of pageErrors) log(e.message);

  log("\n=== NETWORK ISSUES (" + requestFailures.length + ") ===");
  for (const r of requestFailures.slice(-30)) log(JSON.stringify(r));

  // Screenshot for visual
  await page.screenshot({ path: "d:/tmp/mentorhub-final.png", fullPage: true }).catch(() => {});
  log("\nScreenshot saved: d:/tmp/mentorhub-final.png");

  await browser.close();
})();
