#!/usr/bin/env node
/**
 * E2E TEST — Luồng Voucher / Coupon
 *
 * Scenarios:
 *   S1. Create voucher (FIX 50k, minOrder=200k, maxUses=3)
 *   S2. Apply với orderAmount < minOrder → reject
 *   S3. Apply với orderAmount ≥ minOrder → success, discountAmount=50k
 *   S4. Tạo đơn POS có dùng voucher → verify invoice.fee giảm đúng
 *   S5. Verify usedCount tăng từ 0 → 1 sau khi confirm sale (KEY)
 *   S6. Loop 3 sales → usedCount = 3
 *   S7. Apply lần 4 → BE phải reject (quota exhausted)
 *   S8. Voucher stats: count-by-status, sum-used reflect đúng
 *   S9. Cleanup: delete test voucher
 *
 * Chay: node tests/test-e2e-voucher-flow.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
const API_BASE = "https://biz.reborn.vn";
const HOSTNAME_HEADER = "kcn.reborn.vn";

const uiBugs = [];
const beBugs = [];
const findings = [];

function logBeBug(step, sev, desc, ev = "") {
  beBugs.push({ step, severity: sev, desc, evidence: ev });
  console.log(`  🔧 [BE-${sev}] ${step}: ${desc}${ev ? "\n     → " + ev : ""}`);
}
function logUiBug(step, sev, desc, ev = "") {
  uiBugs.push({ step, severity: sev, desc, evidence: ev });
  console.log(`  🐛 [UI-${sev}] ${step}: ${desc}${ev ? "\n     → " + ev : ""}`);
}
function note(step, msg) { findings.push({ step, msg }); console.log(`  📋 [NOTE] ${step}: ${msg}`); }

// ── API helpers ────────────────────────────────────────────────────────
async function headers(t) {
  const ck = await t.context.cookies();
  const tk = ck.find((c) => c.name === "token");
  return {
    Authorization: tk ? `Bearer ${tk.value}` : "",
    Hostname: HOSTNAME_HEADER, Accept: "application/json", "Content-Type": "application/json",
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

/** Tạo đơn POS với coupon discount đã apply */
async function createSaleWithCoupon(t, product, variant, qty, couponDiscount, label) {
  const unitPrice = Number(variant.price || 100000);
  const subtotal = unitPrice * qty;
  const finalAmount = subtotal - couponDiscount;

  const draft = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const inv = draft.body?.result?.invoice || draft.body?.result;
  if (!inv?.id) return null;

  const ins = await apiPost(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${inv.id}&paid=${finalAmount}&debt=0&fundId=1${couponDiscount > 0 ? `&loyaltyDiscount=${couponDiscount}` : ""}`,
    [{
      productId: Number(product.id), variantId: Number(variant.id),
      unitId: Number(variant.unitId), price: unitPrice, customerId: -1,
      quantity: qty, name: product.name, avatar: product.avatar || "",
      unitName: variant.unitName || "Cái", fee: subtotal,
    }]);
  if (ins.body?.code !== 0) {
    logBeBug(label, "HIGH", "insertBatch fail", JSON.stringify(ins.body).slice(0, 200));
    return null;
  }

  const conf = await apiPost(t, "/bizapi/sales/invoice/create", {
    id: inv.id,
    fee: finalAmount,        // total sau giảm
    paid: finalAmount,
    debt: 0,
    amount: subtotal,        // total trước giảm
    discount: couponDiscount,
    vatAmount: 0, amountCard: 0, paymentType: 1,
    invoiceType: "IV1", customerId: -1,
    branchId: Number(inv.branchId ?? -1), bsnId: Number(inv.bsnId ?? -1),
    receiptDate: new Date().toISOString().slice(0, 19),
    account: "[]", customerName: "",
  });
  if (conf.body?.code !== 0) {
    logBeBug(label, "HIGH", "invoice/create fail", JSON.stringify(conf.body).slice(0, 200));
    return null;
  }
  return {
    invoiceId: inv.id,
    invoiceCode: conf.body.result?.invoiceCode,
    subtotal, couponDiscount, finalAmount,
  };
}

// ────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-VOUCHER", `Voucher flow [${RID}]`);

  let voucherId = null;
  let voucherCode = null;

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.goto("/dashboard");
    await t.page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════════════════
    // SETUP — find product
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SETUP");
    console.log("═".repeat(70));

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=100");
    const candidates = (prodRes.body?.result?.items || [])
      .filter((p) => Number(p.stockQuantity || 0) >= 5)
      .filter((p) => {
        const pr = Number(p.originalPrice || p.promotionPrice || 0);
        return pr >= 50000 && pr <= 200000; // tránh giá quá thấp / quá cao
      })
      .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0));
    // Ưu tiên E2E SP, fallback bất kỳ
    const sample = candidates.find((p) => p.name?.includes("E2E SP")) || candidates[0];
    if (!sample) {
      logUiBug("SETUP", "CRITICAL", "Khong co SP phu hop");
      throw new Error("No product");
    }
    const pd = await apiGet(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pd.body?.result?.variants?.[0];
    const unitPrice = Number(variant?.price || 100000);
    console.log(`  Sample: [${sample.id}] ${sample.name} price=${unitPrice} stock=${sample.stockQuantity}`);

    // ═══════════════════════════════════════════════════════════════════
    // S1 — CREATE voucher (FIX 50k, minOrder=200k, maxUses=3)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S1 — CREATE voucher");
    console.log("═".repeat(70));

    voucherCode = `E2E${RID.toUpperCase()}`;
    const DISCOUNT = 50000;
    const MIN_ORDER = 200000;
    const MAX_USES = 3;

    const expiryDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const createBody = {
      id: 0,
      code: voucherCode,
      discountType: 2,        // 2 = fix VNĐ
      discountValue: DISCOUNT,
      minOrder: MIN_ORDER,
      maxUses: MAX_USES,
      expiryDate,
      description: `E2E test voucher ${RID}`,
      status: 1,              // ACTIVE từ đầu (status=0 là draft, BE reject apply)
    };
    console.log(`  Create body: ${JSON.stringify(createBody)}`);

    const create = await apiPost(t, "/bizapi/market/coupon/update", createBody);
    console.log(`  Response: status=${create.status}, code=${create.body?.code}`);
    console.log(`  Body: ${JSON.stringify(create.body).slice(0, 400)}`);
    t.assert("S1-01", create.body?.code === 0,
      `coupon/update create: code=${create.body?.code}`);
    if (create.body?.code !== 0) throw new Error("S1 blocked");

    voucherId = create.body?.result?.id;
    t.assert("S1-02", !!voucherId, `Voucher id=${voucherId}`);

    // ═══════════════════════════════════════════════════════════════════
    // S2 — Verify initial state via /coupon/get
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S2 — GET voucher detail (verify initial usedCount=0)");
    console.log("═".repeat(70));

    const get1 = await apiGet(t, `/bizapi/market/coupon/get?id=${voucherId}`);
    console.log(`  Body: ${JSON.stringify(get1.body).slice(0, 400)}`);
    const v1 = get1.body?.result || {};
    t.assert("S2-01", v1.code === voucherCode, `code=${v1.code}`);
    t.assert("S2-02", Number(v1.discountValue) === DISCOUNT,
      `discountValue=${v1.discountValue}`);
    t.assert("S2-03", Number(v1.minOrder) === MIN_ORDER,
      `minOrder=${v1.minOrder}`);
    t.assert("S2-04", Number(v1.maxUses) === MAX_USES,
      `maxUses=${v1.maxUses}`);

    const initialUsed = Number(v1.usedCount ?? v1.used ?? 0);
    t.assert("S2-05", initialUsed === 0,
      `Initial usedCount=${initialUsed}`);

    // ═══════════════════════════════════════════════════════════════════
    // S3 — Apply với orderAmount < minOrder → REJECT
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log(`  S3 — Apply voucher voi order < minOrder (${MIN_ORDER - 1}) → reject`);
    console.log("═".repeat(70));

    const lowOrder = MIN_ORDER - 1;
    const applyLow = await apiPost(t, "/bizapi/market/coupon/apply", {
      code: voucherCode, orderAmount: lowOrder,
    });
    console.log(`  Apply low: code=${applyLow.body?.code}, body=${JSON.stringify(applyLow.body).slice(0, 250)}`);
    t.assert("S3-01",
      applyLow.body?.code !== 0 || (applyLow.body?.result?.discountAmount ?? 0) === 0,
      `Apply ${lowOrder}đ < minOrder ${MIN_ORDER}đ phải reject hoặc discount=0: code=${applyLow.body?.code}, discount=${applyLow.body?.result?.discountAmount}`);

    // ═══════════════════════════════════════════════════════════════════
    // S4 — Apply với orderAmount đủ → SUCCESS
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log(`  S4 — Apply voi order >= minOrder (${MIN_ORDER}) → success`);
    console.log("═".repeat(70));

    const okOrder = MIN_ORDER;
    const applyOk = await apiPost(t, "/bizapi/market/coupon/apply", {
      code: voucherCode, orderAmount: okOrder,
    });
    console.log(`  Apply OK: code=${applyOk.body?.code}, body=${JSON.stringify(applyOk.body).slice(0, 300)}`);
    t.assert("S4-01", applyOk.body?.code === 0,
      `coupon/apply success: code=${applyOk.body?.code}`);

    const r = applyOk.body?.result || {};
    t.assert("S4-02", Number(r.discountAmount) === DISCOUNT,
      `discountAmount=${r.discountAmount} (expected ${DISCOUNT})`);
    t.assert("S4-03", Number(r.finalAmount) === okOrder - DISCOUNT,
      `finalAmount=${r.finalAmount} (expected ${okOrder - DISCOUNT})`);

    // ═══════════════════════════════════════════════════════════════════
    // S5 — Tạo đơn POS thật với coupon → verify usedCount tăng
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S5 — Tao don POS voi coupon → verify usedCount +1");
    console.log("═".repeat(70));

    const QTY = 2;  // qty để total = 2 * 100k = 200k vừa đủ minOrder
    const sale1 = await createSaleWithCoupon(t, sample, variant, QTY, DISCOUNT, "S5");
    t.assert("S5-01", !!sale1,
      sale1 ? `Tao ${sale1.invoiceCode}: subtotal=${sale1.subtotal}, discount=${sale1.couponDiscount}, final=${sale1.finalAmount}` : "Fail");
    if (!sale1) throw new Error("S5 blocked");

    await new Promise((r) => setTimeout(r, 3000));

    // KEY TEST: usedCount tăng?
    const get2 = await apiGet(t, `/bizapi/market/coupon/get?id=${voucherId}`);
    const v2 = get2.body?.result || {};
    const usedAfter1 = Number(v2.usedCount ?? v2.used ?? 0);
    console.log(`  usedCount after sale 1: ${initialUsed} → ${usedAfter1}`);

    if (usedAfter1 === initialUsed + 1) {
      t.assert("S5-02", true, `usedCount tang +1: ${initialUsed} → ${usedAfter1}`);
      note("S5", "BE auto increment usedCount sau khi sale");
    } else {
      logUiBug("S5", "HIGH",
        `usedCount KHONG tang sau khi sale voi coupon (${initialUsed} → ${usedAfter1})`,
        "FE khong gui couponCode trong body invoice/create → BE khong biet coupon nao da dung. " +
        "FE bug: src/pages/CounterSales/index.tsx:343-365 thieu couponCode trong params.");
      t.assert("S5-02", false, `usedCount KHONG tang: van = ${usedAfter1}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S6 — Loop 3 sales → usedCount = 3 (test full quota)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S6 — Loop sales for full quota (3 lan)");
    console.log("═".repeat(70));

    // Đã dùng 1 lần (S5), cần thêm 2 lần nữa
    let salesCount = 1;
    for (let i = 2; i <= MAX_USES; i++) {
      const apply = await apiPost(t, "/bizapi/market/coupon/apply", {
        code: voucherCode, orderAmount: MIN_ORDER,
      });
      console.log(`  Apply ${i}: code=${apply.body?.code}, discount=${apply.body?.result?.discountAmount}`);
      if (apply.body?.code !== 0) {
        logBeBug("S6", "HIGH", `Apply lan ${i} reject mac du chua het quota`,
          JSON.stringify(apply.body).slice(0, 200));
        break;
      }
      const s = await createSaleWithCoupon(t, sample, variant, QTY, DISCOUNT, `S6-${i}`);
      if (s) salesCount++;
      await new Promise((r) => setTimeout(r, 1500));
    }

    await new Promise((r) => setTimeout(r, 3000));
    const get3 = await apiGet(t, `/bizapi/market/coupon/get?id=${voucherId}`);
    const usedAfter3 = Number(get3.body?.result?.usedCount ?? 0);
    console.log(`  usedCount after ${salesCount} sales: ${usedAfter3}`);
    t.assert("S6-01", salesCount === MAX_USES,
      `Tao duoc ${salesCount}/${MAX_USES} sales`);

    if (usedAfter3 === MAX_USES) {
      t.assert("S6-02", true, `usedCount = MAX_USES (${MAX_USES})`);
    } else {
      logBeBug("S6", "HIGH",
        `usedCount sai sau ${salesCount} sales: ${usedAfter3} (expected ${MAX_USES})`);
      t.assert("S6-02", false, `usedCount=${usedAfter3} ≠ ${MAX_USES}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S7 — Apply lần thứ MAX+1 → BE phải REJECT (quota exhausted)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log(`  S7 — Apply lan ${MAX_USES + 1} → expect reject (quota exhausted)`);
    console.log("═".repeat(70));

    const applyOver = await apiPost(t, "/bizapi/market/coupon/apply", {
      code: voucherCode, orderAmount: MIN_ORDER,
    });
    console.log(`  Apply over: code=${applyOver.body?.code}, message="${applyOver.body?.message}"`);

    const isRejected = applyOver.body?.code !== 0
      || (applyOver.body?.result?.discountAmount ?? 0) === 0
      || /het|quota|exceed|max|vuot/i.test(applyOver.body?.message || "");

    if (isRejected) {
      t.assert("S7-01", true,
        `Quota exhausted reject: code=${applyOver.body?.code}, msg="${applyOver.body?.message}"`);
    } else {
      logBeBug("S7", "CRITICAL",
        `BE KHONG enforce quota: voucher da dung ${MAX_USES}/${MAX_USES} nhung van apply duoc`,
        JSON.stringify(applyOver.body).slice(0, 250));
      t.assert("S7-01", false, "BE khong reject quota exhausted");
    }

    // ═══════════════════════════════════════════════════════════════════
    // S8 — Voucher stats endpoints
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S8 — Verify voucher stats");
    console.log("═".repeat(70));

    const cbsActive = await apiGet(t, "/bizapi/market/coupon/count-by-status?status=1");
    console.log(`  count-by-status?status=1 (active): ${JSON.stringify(cbsActive.body).slice(0, 200)}`);
    t.assert("S8-01", cbsActive.body?.code === 0,
      `count-by-status active: code=${cbsActive.body?.code}`);

    const sumUsed = await apiGet(t, "/bizapi/market/coupon/sum-used");
    console.log(`  sum-used: ${JSON.stringify(sumUsed.body).slice(0, 200)}`);
    t.assert("S8-02", sumUsed.body?.code === 0,
      `sum-used: code=${sumUsed.body?.code}`);

    // Check voucher trong list
    const list = await apiGet(t, `/bizapi/market/coupon/list?page=1&limit=50&keyword=${voucherCode}`);
    const items = list.body?.result?.items || [];
    const ours = items.find((x) => x.code === voucherCode);
    if (ours) {
      console.log(`  Voucher in list: usedCount=${ours.usedCount}, maxUses=${ours.maxUses}`);
      t.assert("S8-03", Number(ours.usedCount) === Number(ours.maxUses),
        `Voucher list: usedCount=${ours.usedCount} == maxUses=${ours.maxUses} (đã hết)`);
    } else {
      logUiBug("S8", "MEDIUM", `Voucher ${voucherCode} khong tim thay trong list`);
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
  } finally {
    // ═══════════════════════════════════════════════════════════════════
    // S9 — Cleanup: delete test voucher
    // ═══════════════════════════════════════════════════════════════════
    if (voucherId) {
      console.log("\n" + "═".repeat(70));
      console.log("  S9 — Cleanup");
      console.log("═".repeat(70));
      // Try delete endpoint
      const del = await apiPost(t, `/bizapi/market/coupon/delete?id=${voucherId}`, {});
      console.log(`  delete?id=${voucherId}: code=${del.body?.code}`);
      // Also try update with status=0 nếu delete fail
      if (del.body?.code !== 0) {
        const disable = await apiPost(t, "/bizapi/market/coupon/update", {
          id: voucherId, code: voucherCode, status: 0, discountType: 2,
          discountValue: 50000, minOrder: 200000, maxUses: 3,
        });
        console.log(`  Disable: code=${disable.body?.code}`);
      }
    }
  }

  // ── REPORT ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(70));
  console.log("  BUG REPORT");
  console.log("═".repeat(70));
  console.log(`\n🐛 UI BUGS (${uiBugs.length}):`);
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n📋 FINDINGS:`);
  findings.forEach((f, i) => console.log(`  ${i + 1}. [${f.step}] ${f.msg}`));

  await t.done();
  const crit = beBugs.filter((b) => ["HIGH", "CRITICAL"].includes(b.severity)).length
             + uiBugs.filter((b) => ["HIGH", "CRITICAL", "BLOCKER"].includes(b.severity)).length;
  process.exit(crit > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
