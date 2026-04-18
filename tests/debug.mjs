import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/hub",
  "/inbox",
  "/analytics",
  "/prompts",
  "/team",
  "/clients",
  "/settings",
  "/project/megamart/stage/1",
];

for (const r of ROUTES) {
  const errs = [];
  page.removeAllListeners("pageerror");
  page.removeAllListeners("console");
  page.on("pageerror", (err) => errs.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (t.includes("error occurred in")) {
        const m = t.match(/error occurred in the <([^>]+)>/);
        if (m) errs.push(`component-err:${m[1]}`);
      } else if (!t.includes("Consider adding")) {
        errs.push("console:" + t.slice(0, 200));
      }
    }
  });
  await page.goto("http://localhost:4000" + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  console.log(r.padEnd(40), errs.length ? errs.slice(0, 3) : "OK");
}

await browser.close();
