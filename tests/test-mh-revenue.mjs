import { chromium, devices } from "playwright";
import { existsSync } from "node:fs";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  ...devices["iPhone 13"],
  storageState: existsSync("tests/.auth-state-prod-mh.json") ? "tests/.auth-state-prod-mh.json" : undefined,
});
const page = await ctx.newPage();
const errors = [];
const apiCalls = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  const u = r.url();
  if (u.includes("/sales/order/revenue-summary") || u.includes("/sales/commission")) {
    apiCalls.push({ method: r.method(), url: u });
  }
});

const out = {};

for (const path of ["/mh/dashboard", "/mh/revenue"]) {
  await page.goto(`https://mentorhub.reborn.vn/crm${path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);
  const info = await page.evaluate(() => {
    const heroH1 = document.querySelector(".mh__hero h1")?.textContent || null;
    const kpiCount = document.querySelectorAll(".mh__kpi").length;
    const kpiValues = Array.from(document.querySelectorAll(".mh__kpi-value")).map((e) => e.textContent.trim());
    const sparklinePolylines = document.querySelectorAll(".mh__card svg polyline").length;
    const tables = document.querySelectorAll(".mh__table").length;
    return { heroH1, kpiCount, kpiValues, sparklinePolylines, tables };
  });
  out[path] = info;
  await page.screenshot({ path: `tests/screenshots/mh${path.replace(/\//g, "-")}.png`, fullPage: true });
}

console.log("API calls:", apiCalls);
console.log("Per-page:", out);
console.log("Page errors:", errors);

await browser.close();

let fail = 0;
for (const [p, info] of Object.entries(out)) {
  if (!info.heroH1) { console.log(`FAIL ${p}: hero h1 missing`); fail++; }
  if (info.kpiCount < 1) { console.log(`FAIL ${p}: no KPI`); fail++; }
}
if (errors.length) { console.log("FAIL: page errors", errors); fail++; }
if (apiCalls.length === 0) { console.log("WARN: revenue-summary API was not called (employeeId not set?)"); }
if (fail === 0) console.log("✓ MH Revenue + Dashboard OK");
else process.exit(1);
