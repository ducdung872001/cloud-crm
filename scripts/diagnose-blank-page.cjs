// Launch headless chromium, load localhost:4000, capture all console/errors/network failures.
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on("console", (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
  });
  page.on("pageerror", (err) => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });
  page.on("requestfailed", (req) => {
    requestFailures.push({ url: req.url(), failure: req.failure()?.errorText });
  });
  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      requestFailures.push({ url: resp.url(), status: resp.status() });
    }
  });

  try {
    await page.goto("http://localhost:4000/crm/", { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) {
    console.log("GOTO_ERROR:", e.message);
  }

  // Wait a bit for async renders / redirects
  await page.waitForTimeout(8000);

  const url = page.url();
  const title = await page.title().catch(() => "(unavailable)");
  const bodyText = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  const rootHTML = await page.evaluate(() => document.getElementById("root")?.innerHTML || "").catch(() => "");
  const fullHTML = await page.content().catch(() => "");

  console.log("=== URL ===");
  console.log(url);
  console.log("=== TITLE ===");
  console.log(title);
  console.log("=== BODY TEXT (first 500) ===");
  console.log((bodyText || "(empty)").slice(0, 500));
  console.log("=== #root INNER HTML (first 2000) ===");
  console.log((rootHTML || "(empty)").slice(0, 2000));
  console.log("=== FULL HTML length ===");
  console.log(fullHTML.length);
  console.log("=== CONSOLE (" + consoleLogs.length + ") ===");
  for (const l of consoleLogs) {
    console.log(`[${l.type}] ${l.text}`);
    if (l.location?.url) console.log(`  @ ${l.location.url}:${l.location.lineNumber}`);
  }
  console.log("=== PAGE ERRORS (" + pageErrors.length + ") ===");
  for (const e of pageErrors) {
    console.log(e.message);
    if (e.stack) console.log(e.stack.split("\n").slice(0, 8).join("\n"));
    console.log("---");
  }
  console.log("=== NETWORK FAILURES (" + requestFailures.length + ") ===");
  for (const r of requestFailures) console.log(JSON.stringify(r));

  await browser.close();
})();
