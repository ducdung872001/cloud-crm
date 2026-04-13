#!/usr/bin/env node
/**
 * Verify dashboard hiển thị đúng số đơn hủy sau khi cancel
 *
 * Check 3 nguồn dữ liệu:
 *  1. /sales/invoice/tab-counts → cancelCount/cancelled count
 *  2. /sales/invoice/dashboard → cancelled stats hôm nay
 *  3. /sales/invoice/list (filter status=3 = cancelled) → list đơn hủy
 *
 * Flow:
 *  - Snapshot 3 source baseline
 *  - Tạo đơn + hủy (qua return flow như cancelInvoiceByReturn)
 *  - Snapshot lại
 *  - Verify: cancelCount +1, cancelAmount +X
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
const API_BASE = "https://biz.reborn.vn";

async function headers(t) {
  const ck = await t.context.cookies();
  const tk = ck.find((c) => c.name === "token");
  return {
    Authorization: tk ? `Bearer ${tk.value}` : "",
    Hostname: "kcn.reborn.vn", Accept: "application/json", "Content-Type": "application/json",
  };
}
async function apiGet(t, path) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  try {
    const r = await t.context.request.get(url, { headers: await headers(t) });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}
async function apiPost(t, path, body = {}) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  try {
    const r = await t.context.request.post(url, { headers: await headers(t), data: body });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function getSnapshot(t, branchId) {
  const snap = {};

  // 1. Tab counts (POS Orders status filter)
  const tc = await apiGet(t, `/bizapi/sales/invoice/tab-counts?branchId=${branchId}`);
  snap.tabCounts = tc.body?.result || {};
  snap._tabCountsRaw = JSON.stringify(snap.tabCounts).slice(0, 300);

  // 2. Sales invoice dashboard
  const dash = await apiGet(t, `/bizapi/sales/invoice/dashboard?branchId=${branchId}`);
  snap.dashboard = dash.body?.result || {};
  snap._dashRaw = JSON.stringify(snap.dashboard).slice(0, 400);

  // 3. Invoice list filter cancelled (status=3) hôm nay
  const today = todayISO();
  const list = await apiGet(t,
    `/bizapi/sales/invoice/list?page=1&limit=100&status=3&fromDate=${today}&toDate=${today}`);
  const items = list.body?.result?.items || [];
  snap.cancelledList = {
    count: items.length,
    total: items.reduce((s, x) => s + Number(x.fee || x.paid || 0), 0),
    items: items.slice(0, 3).map((x) => ({
      code: x.invoiceCode, status: x.status, fee: x.fee, type: x.invoiceType,
    })),
  };

  // 4. List ALL today để compare
  const listAll = await apiGet(t,
    `/bizapi/sales/invoice/list?page=1&limit=200&fromDate=${today}&toDate=${today}`);
  const allItems = listAll.body?.result?.items || [];
  const byStatus = {};
  allItems.forEach((x) => { const s = x.status; byStatus[s] = (byStatus[s] || 0) + 1; });
  snap.byStatus = byStatus;

  return snap;
}

function printSnap(label, s) {
  console.log(`\n  📸 ${label}:`);
  console.log(`     tab-counts: ${s._tabCountsRaw}`);
  console.log(`     dashboard: ${s._dashRaw}`);
  console.log(`     cancelled list (status=3 today): count=${s.cancelledList.count}, total=${s.cancelledList.total}`);
  console.log(`     all by status today: ${JSON.stringify(s.byStatus)}`);
  if (s.cancelledList.items.length > 0) {
    console.log(`     latest cancelled: ${JSON.stringify(s.cancelledList.items[0])}`);
  }
}

async function createSale(t, product, variant, qty) {
  const unitPrice = Number(variant.price || 100000);
  const total = unitPrice * qty;
  const draft = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const inv = draft.body?.result?.invoice || draft.body?.result;
  if (!inv?.id) return null;
  const ins = await apiPost(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${inv.id}&paid=${total}&debt=0&fundId=1`,
    [{
      productId: Number(product.id), variantId: Number(variant.id),
      unitId: Number(variant.unitId), price: unitPrice, customerId: -1,
      quantity: qty, name: product.name, avatar: product.avatar || "",
      unitName: variant.unitName || "Cái", fee: total,
    }]);
  if (ins.body?.code !== 0) return null;
  const conf = await apiPost(t, "/bizapi/sales/invoice/create", {
    id: inv.id, fee: total, paid: total, debt: 0, amount: total,
    discount: 0, vatAmount: 0, amountCard: 0, paymentType: 1,
    invoiceType: "IV1", customerId: -1,
    branchId: Number(inv.branchId ?? -1), bsnId: Number(inv.bsnId ?? -1),
    receiptDate: new Date().toISOString().slice(0, 19),
    account: "[]", customerName: "",
  });
  if (conf.body?.code !== 0) return null;
  return { invoiceId: inv.id, invoiceCode: conf.body.result?.invoiceCode, total };
}

async function cancelByReturn(t, invoiceId) {
  const r = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${invoiceId}`);
  const result = r.body?.result || {};
  const lstBP = result.lstBoughtProduct || [];
  if (lstBP.length === 0) return null;
  const totalRefund = lstBP.reduce(
    (s, p) => s + Number(p.price || 0) * Number(p.quantity ?? 0), 0);
  const body = {
    invoice: {
      referId: invoiceId, customerId: -1, amount: totalRefund, fee: totalRefund,
      paid: totalRefund, debt: 0, discount: 0, vatAmount: 0, paymentType: 1,
      reason: "Hủy đơn", refundMethod: 1, note: `E2E ${RID}`,
    },
    lstBoughtProduct: lstBP.map((p) => ({
      productId: Number(p.productId), variantId: Number(p.variantId),
      unitId: Number(p.unitId),
      quantity: Number(p.quantity ?? 0), qty: Number(p.quantity ?? 0),
      price: Number(p.price || 0),
      fee: Number(p.price || 0) * Number(p.quantity ?? 0),
      discount: 0, discountUnit: 2, inventoryId: p.inventoryId, name: p.name,
    })),
    lstService: [], lstCardService: [],
  };
  const cr = await apiPost(t, "/bizapi/sales/invoice/create/return", body);
  if (cr.body?.code !== 0) return null;
  const retId = cr.body.result?.id || cr.body.result?.invoice?.id;
  await apiPost(t, `/bizapi/sales/invoice/return/confirm?id=${retId}`, {});
  return { returnInvoiceId: retId, refundAmount: totalRefund };
}

async function main() {
  const t = await createTestRunner("CANCEL-DASH", `Cancel dashboard check [${RID}]`);
  const passed = []; const failed = [];

  function expect(name, cond, msg) {
    if (cond) { passed.push(name); console.log(`✅ ${name} — ${msg}`); }
    else { failed.push(name); console.log(`❌ ${name} — ${msg}`); }
  }

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.goto("/dashboard");
    await t.page.waitForTimeout(1500);

    const branchId = await t.page.evaluate(() => {
      try {
        const vb = JSON.parse(localStorage.getItem("valueBranch") || "{}");
        return Number(vb?.value) || null;
      } catch { return null; }
    });
    console.log(`branchId=${branchId}`);

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=100");
    const sample = (prodRes.body?.result?.items || [])
      .filter((p) => Number(p.stockQuantity || 0) >= 3)
      .filter((p) => Number(p.originalPrice || 0) > 0 && Number(p.originalPrice || 0) <= 200000)
      .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0))
      .find((p) => p.name?.includes("E2E SP"));
    if (!sample) throw new Error("No suitable product");
    const pd = await apiGet(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pd.body?.result?.variants?.[0];
    console.log(`Sample: [${sample.id}] ${sample.name} stock=${sample.stockQuantity}\n`);

    // ── BASELINE
    console.log("═".repeat(70));
    console.log("BASELINE (truoc khi tao + huy)");
    console.log("═".repeat(70));
    const base = await getSnapshot(t, branchId);
    printSnap("BASELINE", base);

    // ── Tạo đơn
    console.log("\n" + "═".repeat(70));
    console.log("TAO 1 DON IV1 + huy");
    console.log("═".repeat(70));
    const QTY = 2;
    const sale = await createSale(t, sample, variant, QTY);
    if (!sale) throw new Error("Create sale fail");
    console.log(`Tao ${sale.invoiceCode} (id=${sale.invoiceId}, total=${sale.total})`);

    await new Promise((r) => setTimeout(r, 2500));

    // Snapshot sau khi tạo (để biết IV1 mới đã vào dashboard chưa)
    const afterCreate = await getSnapshot(t, branchId);
    printSnap("SAU KHI TAO", afterCreate);

    // ── Hủy đơn
    console.log(`\n→ Cancel ${sale.invoiceId}`);
    const cancel = await cancelByReturn(t, sale.invoiceId);
    if (!cancel) throw new Error("Cancel fail");
    console.log(`Cancel OK: returnInvoiceId=${cancel.returnInvoiceId}, refund=${cancel.refundAmount}`);

    await new Promise((r) => setTimeout(r, 4000));

    // Snapshot cuối
    const afterCancel = await getSnapshot(t, branchId);
    printSnap("SAU KHI HUY", afterCancel);

    // ════════════════════════════════════════════════════════════════════
    // ASSERTIONS — verify dashboard updates correctly
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("VERDICT");
    console.log("═".repeat(70));

    // Test 1: tab-counts cancelled tăng +1 sau khi hủy
    const tcBaseCancelled = Number(base.tabCounts.cancelledCount ?? base.tabCounts.cancelled ?? base.tabCounts[3] ?? 0);
    const tcAfterCancelled = Number(afterCancel.tabCounts.cancelledCount ?? afterCancel.tabCounts.cancelled ?? afterCancel.tabCounts[3] ?? 0);
    const tcDelta = tcAfterCancelled - tcBaseCancelled;
    expect("T1-tab-counts-cancelled+1", tcDelta === 1,
      `tab-counts.cancelled: ${tcBaseCancelled} → ${tcAfterCancelled} (delta=${tcDelta}, expected +1)`);

    // Test 2: dashboard.totalCancelOrder tăng +1 (verify aggregate đồng bộ với list)
    // BE giữ IV1.status=1 (audit trail) — không filter client side bằng status field
    const dcBase = Number(base.dashboard.totalCancelOrder || 0);
    const dcAfter = Number(afterCancel.dashboard.totalCancelOrder || 0);
    expect("T2-dashboard-totalCancelOrder+1", dcAfter - dcBase === 1,
      `dashboard.totalCancelOrder: ${dcBase} → ${dcAfter} (delta=${dcAfter - dcBase}, expected +1)`);

    // Test 3: cancelled list count +1
    const lcDelta = afterCancel.cancelledList.count - base.cancelledList.count;
    expect("T3-cancelled-list-count+1", lcDelta === 1,
      `list filter status=3: ${base.cancelledList.count} → ${afterCancel.cancelledList.count} (delta=${lcDelta})`);

    // Test 4: cancelled list total +sale.total
    const ltDelta = afterCancel.cancelledList.total - base.cancelledList.total;
    expect("T4-cancelled-list-total", ltDelta === sale.total,
      `list total: delta=${ltDelta} (expected +${sale.total})`);

    // Test 5: latest cancelled item phải có code = sale.invoiceCode
    const latestCancelled = afterCancel.cancelledList.items[0];
    expect("T5-latest-is-our-invoice", latestCancelled?.code === sale.invoiceCode,
      `latest cancelled = ${latestCancelled?.code} (expected ${sale.invoiceCode})`);

    // Test 6: dashboard có cancelOrders / refund stat tăng (nếu BE expose)
    const dashCancelKeys = Object.keys(afterCancel.dashboard).filter((k) =>
      /cancel|refund|return/i.test(k)
    );
    if (dashCancelKeys.length > 0) {
      console.log(`\n  Dashboard có các field cancelled/refund: ${dashCancelKeys.join(", ")}`);
      dashCancelKeys.forEach((k) => {
        const bv = base.dashboard[k] ?? 0;
        const av = afterCancel.dashboard[k] ?? 0;
        console.log(`    ${k}: ${bv} → ${av} (delta=${av - bv})`);
      });
    } else {
      console.log("\n  ⚠️  Dashboard KHONG co field nao chua cancel/refund/return");
    }

    // Test 7: Returned tab-counts (returnCount) cũng tăng +1
    const rcBase = Number(base.tabCounts.returnCount ?? base.tabCounts.returned ?? 0);
    const rcAfter = Number(afterCancel.tabCounts.returnCount ?? afterCancel.tabCounts.returned ?? 0);
    if (rcBase !== undefined && rcAfter !== undefined) {
      const rcDelta = rcAfter - rcBase;
      console.log(`\n  Return count delta: ${rcBase} → ${rcAfter} (delta=${rcDelta})`);
      // Note: may or may not be tracked depending on BE
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    failed.push("FATAL");
  }

  console.log("\n" + "═".repeat(70));
  console.log(`SUMMARY: ${passed.length}/${passed.length + failed.length} passed`);
  if (failed.length > 0) {
    console.log(`FAILED: ${failed.join(", ")}`);
  }
  console.log("═".repeat(70));

  await t.done();
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
