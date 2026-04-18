import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (err) => errs.push("PAGE: " + err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") {
    const t = msg.text();
    if (!t.includes("Consider adding") && !t.includes("error occurred in")) errs.push("CONSOLE: " + t.slice(0, 400));
  }
});

for (const n of [1, 2, 3]) {
  errs.length = 0;
  await page.goto(`http://localhost:4000/project/megamart/stage/${n}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const mounted = await page.evaluate(() => (document.getElementById("root")?.children.length ?? 0) > 0 && !!document.querySelector("h1.title"));
  console.log(`stage/${n}: mounted=${mounted}, errs=${errs.length}`);
  errs.forEach((e) => console.log("  " + e));
}
await browser.close();
