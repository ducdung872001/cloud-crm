import { createTestRunner } from "./helpers.mjs";
const t = await createTestRunner("INSP-WH", "List warehouses");
await t.login();
await t.goto("/warehouse");
await t.page.waitForTimeout(3000);

const rows = await t.page.evaluate(() => {
  const out = [];
  const trs = [...document.querySelectorAll("table tbody tr")];
  for (const tr of trs) {
    const cells = [...tr.querySelectorAll("td")].map(td => td.innerText?.replace(/\s+/g, " ").trim());
    out.push(cells);
  }
  return out;
});
console.log(`Total rows: ${rows.length}`);
rows.slice(0, 30).forEach((r, i) => console.log(`  ${i + 1}. [${r.slice(0, 6).join(" | ")}]`));

await t.done();
