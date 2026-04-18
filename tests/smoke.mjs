import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:4000";
const OUT = resolve("tests/screenshots");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: "00-login", path: "/login" },
  { name: "01-forgot", path: "/forgot-password" },
  { name: "02-reset", path: "/reset-password" },
  { name: "03-hub", path: "/hub" },
  { name: "04-inbox", path: "/inbox" },
  { name: "05-analytics", path: "/analytics" },
  { name: "06-prompts", path: "/prompts" },
  { name: "07-team", path: "/team" },
  { name: "08-clients", path: "/clients" },
  { name: "09-settings", path: "/settings" },
  { name: "10-stage-1", path: "/project/megamart/stage/1" },
  { name: "11-stage-2", path: "/project/megamart/stage/2" },
  { name: "12-stage-3", path: "/project/megamart/stage/3" },
  { name: "13-stage-4", path: "/project/megamart/stage/4" },
  { name: "14-stage-5", path: "/project/megamart/stage/5" },
  { name: "15-stage-6", path: "/project/megamart/stage/6" },
  { name: "16-stage-7", path: "/project/megamart/stage/7" },
  { name: "17-sessions", path: "/project/megamart/sessions" },
  { name: "18-changes", path: "/project/megamart/changes" },
  { name: "19-deliverables", path: "/project/megamart/deliverables" },
  { name: "20-notfound", path: "/this-does-not-exist" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const results = [];

for (const r of ROUTES) {
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];

  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.removeAllListeners("requestfailed");
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));
  page.on("requestfailed", (req) => failedRequests.push(req.url()));

  const resp = await page.goto(BASE + r.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const info = await page.evaluate(() => ({
    mounted: (document.getElementById("root")?.children.length ?? 0) > 0,
    title: document.querySelector("h1.title, .auth-title")?.textContent?.trim() ?? null,
    buttons: document.querySelectorAll("button").length,
    modals: document.querySelectorAll(".modal").length,
  }));

  await page.screenshot({ path: `${OUT}/${r.name}.png`, fullPage: true });

  results.push({
    route: r.path,
    name: r.name,
    status: resp?.status() ?? 0,
    mounted: info.mounted,
    title: info.title,
    buttons: info.buttons,
    pageErrors,
    consoleErrors,
    failedRequests,
  });
}

await browser.close();

let totalErr = 0;
let totalConsoleErr = 0;
console.log("=".repeat(80));
console.log("SMOKE REPORT — 21 routes × 103 forms");
console.log("=".repeat(80));
for (const r of results) {
  const ok = r.pageErrors.length === 0 && r.failedRequests.length === 0;
  totalErr += r.pageErrors.length;
  totalConsoleErr += r.consoleErrors.length;
  const badge = ok ? (r.consoleErrors.length ? "⚠" : "✓") : "✗";
  console.log(
    `${badge} ${r.route.padEnd(38)} ${r.status} mount=${r.mounted ? "Y" : "N"} btns=${String(r.buttons).padStart(3)}  "${r.title ?? ""}"`
  );
  if (r.pageErrors.length) console.log("  PAGE ERR:", r.pageErrors);
  if (r.consoleErrors.length) console.log("  CONSOLE:", r.consoleErrors.slice(0, 2));
}

console.log("");
console.log(`TOTAL: ${totalErr} page errors, ${totalConsoleErr} console errors`);
process.exit(totalErr > 0 ? 1 : 0);
