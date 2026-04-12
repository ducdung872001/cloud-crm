#!/usr/bin/env node
/** Quick verify: GET /sales/invoice/get-for-vat?code=X — check BE đã populate customer info chưa */
import { createTestRunner } from "./helpers.mjs";

const API_BASE = "https://biz.reborn.vn";

async function getHeaders(t) {
  const cookies = await t.context.cookies();
  const tk = cookies.find((c) => c.name === "token");
  return {
    Authorization: `Bearer ${tk.value}`,
    Hostname: "kcn.reborn.vn",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function apiGet(t, path) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  const r = await t.context.request.get(url, { headers: await getHeaders(t) });
  let b = null; try { b = await r.json(); } catch { b = await r.text(); }
  return { status: r.status(), body: b };
}

const t = await createTestRunner("VAT-DBG", "VAT prefill verify");
await t.login();
await t.goto("/dashboard");
await t.page.waitForTimeout(1500);

// Lay 10 don IV1 gan nhat
const listRes = await apiGet(t, "/bizapi/sales/invoice/list?page=1&limit=10&invoiceTypes=[%22IV1%22]");
const items = listRes.body?.result?.items || [];
const realCust = items.filter((i) => Number(i.customerId) > 0).slice(0, 5);
console.log(`\nFound ${realCust.length} invoice voi KH that\n`);

let pass = 0, fail = 0;
for (const inv of realCust) {
  const code = inv.invoiceCode;
  const cid  = inv.customerId;
  const res  = await apiGet(t, `/bizapi/sales/invoice/get-for-vat?code=${encodeURIComponent(code)}`);
  const r    = res.body?.result || {};
  const ok   = !!(r.customerName && r.customerName !== "null");
  const sym  = ok ? "✅" : "❌";
  if (ok) pass++; else fail++;
  console.log(`${sym} ${code} (customerId=${cid})`);
  console.log(`    customerName    : ${r.customerName ?? "(null)"}`);
  console.log(`    customerPhone   : ${r.customerPhone ?? "(null)"}`);
  console.log(`    customerEmail   : ${r.customerEmail ?? "(null)"}`);
  console.log(`    customerAddress : ${r.customerAddress ?? "(null)"}`);
  console.log(`    taxCode         : ${r.taxCode ?? "(null)"}`);
}

console.log(`\n══════ VERDICT: ${pass}/${realCust.length} prefill OK ══════`);
if (fail === 0 && pass > 0) console.log(`✅ BE FIX OK — toan bo invoice da co customerName`);
else if (pass > 0) console.log(`⚠️  PARTIAL — ${fail} invoice van null`);
else console.log(`❌ BE FIX CHUA XONG — toan bo customerName van null`);

await t.done();
process.exit(fail > 0 ? 1 : 0);
