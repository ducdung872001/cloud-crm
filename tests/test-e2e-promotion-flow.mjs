#!/usr/bin/env node
/**
 * E2E TEST — Chương trình khuyến mãi (CTKM, mode=1 Trực tiếp)
 *
 * Scenarios:
 *   S1. Create 3 CTKM đang chạy (cùng hiệu lực):
 *       - P1: 10% off, minAmount=100k
 *       - P2: FIX 50k, minAmount=200k
 *       - P3: FIX 100k, minAmount=500k
 *   S2. Cart 200k → check-eligible → expect P1 + P2 (không P3)
 *   S3. Cart 500k → check-eligible → expect cả 3
 *   S4. Apply P2 (50k) cho cart 200k → verify discount = 50k
 *   S5. Apply P1 (10%) cho cart 500k → verify discount = 50k
 *   S6. Sale với promo applied → verify invoice fee giảm đúng
 *   S7. Edge: cart 100k (chỉ đủ P1) → P2/P3 phải ineligible với reason
 *   S8. Edge: promo EXPIRED → không xuất hiện trong eligible
 *   S9. Edge: promo chưa start → không xuất hiện
 *   S10. Apply 2 promo cùng lúc — destructive test (FE chỉ 1, nhưng test BE)
 *   S11. Stats: count-by-status, list active
 *
 * Chay: node tests/test-e2e-promotion-flow.mjs
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
async function H(t) {
  const ck = await t.context.cookies();
  const tk = ck.find((c) => c.name === "token");
  return {
    Authorization: tk ? `Bearer ${tk.value}` : "",
    Hostname: HOSTNAME_HEADER, Accept: "application/json", "Content-Type": "application/json",
  };
}
async function GET(t, p) {
  const r = await t.context.request.get(API_BASE + p.replace(/^\/bizapi/, ""), { headers: await H(t) });
  let b; try { b = await r.json(); } catch { b = await r.text(); }
  return { status: r.status(), body: b };
}
async function POST(t, p, body = {}) {
  const r = await t.context.request.post(API_BASE + p.replace(/^\/bizapi/, ""), { headers: await H(t), data: body });
  let b; try { b = await r.json(); } catch { b = await r.text(); }
  return { status: r.status(), body: b };
}
async function DELETE(t, p) {
  const r = await t.context.request.delete(API_BASE + p.replace(/^\/bizapi/, ""), { headers: await H(t) });
  let b; try { b = await r.json(); } catch { b = await r.text(); }
  return { status: r.status(), body: b };
}

function dateAdd(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 19);
}

async function createPromo(t, opts) {
  // Body shape giống FE form (AddPromotionalModal) — không có id/status/description
  const body = {
    name: opts.name,
    startTime: opts.startTime ?? dateAdd(-1),
    endTime: opts.endTime ?? dateAdd(7),
    promotionType: opts.promotionType ?? 1,    // 1 = Giảm giá
    discount: opts.discount,
    discountType: opts.discountType ?? 2,       // 1=%, 2=VND fix
    applyType: opts.applyType ?? 1,             // 1 = áp dụng cho đơn
    minAmount: opts.minAmount ?? undefined,
    budget: opts.budget ?? undefined,
    mode: opts.mode ?? 1,                       // 1 = Trực tiếp
  };
  const r = await POST(t, "/bizapi/market/promotion/update", body);
  // Promo mới có status=0 (chờ duyệt) → activate ngay status=1 (đang chạy)
  if (r.body?.code === 0 && r.body?.result?.id && opts.activate !== false) {
    const id = r.body.result.id;
    await POST(t, "/bizapi/market/promotion/update/status", { id, status: 1 });
  }
  return { ...r, sentBody: body };
}

/** Build cart payload đúng shape FE gửi (qty không phải quantity) */
function buildCart(orderAmount, productId, variantId, price, qty) {
  return {
    orderAmount,
    customerId: -1,
    cartItems: [{
      productId: Number(productId),
      variantId: Number(variantId),
      qty: Number(qty),
      price: Number(price),
    }],
  };
}

// ────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-PROMO", `Promotion CTKM [${RID}]`);
  const createdPromoIds = [];

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.goto("/dashboard");
    await t.page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════════════════
    // SETUP
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SETUP");
    console.log("═".repeat(70));

    const prods = await GET(t, "/bizapi/inventory/product/list?page=1&limit=100");
    const cands = (prods.body?.result?.items || [])
      .filter((p) => Number(p.stockQuantity || 0) >= 6)
      .filter((p) => {
        const pr = Number(p.originalPrice || p.promotionPrice || 0);
        return pr >= 50000 && pr <= 200000;
      })
      .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0));
    const sample = cands.find((p) => p.name?.includes("E2E SP")) || cands[0];
    if (!sample) throw new Error("No product");
    const pd = await GET(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pd.body?.result?.variants?.[0];
    const unitPrice = Number(variant?.price || 100000);
    console.log(`  Sample: [${sample.id}] ${sample.name} price=${unitPrice} stock=${sample.stockQuantity}`);

    // ═══════════════════════════════════════════════════════════════════
    // S1 — CREATE 3 promo cùng đang chạy
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S1 — CREATE 3 promo dang chay");
    console.log("═".repeat(70));

    // P1: 10% off, minAmount=100k
    const p1 = await createPromo(t, {
      name: `P1-10pct-${RID}`,
      discountType: 1,    // % percent
      discount: 10,
      minAmount: 100000,
    });
    console.log(`  P1: status=${p1.status}, code=${p1.body?.code}, body=${JSON.stringify(p1.body).slice(0, 300)}`);
    t.assert("S1-01", p1.body?.code === 0, `P1 created: code=${p1.body?.code}`);
    if (p1.body?.code === 0) createdPromoIds.push(p1.body.result?.id);

    // P2: FIX 50k, minAmount=200k
    const p2 = await createPromo(t, {
      name: `P2-50k-${RID}`,
      discountType: 2,    // VND fix
      discount: 50000,
      minAmount: 200000,
    });
    console.log(`  P2: code=${p2.body?.code}, id=${p2.body?.result?.id}`);
    t.assert("S1-02", p2.body?.code === 0, `P2 created: code=${p2.body?.code}`);
    if (p2.body?.code === 0) createdPromoIds.push(p2.body.result?.id);

    // P3: FIX 100k, minAmount=500k
    const p3 = await createPromo(t, {
      name: `P3-100k-${RID}`,
      discountType: 2,
      discount: 100000,
      minAmount: 500000,
    });
    console.log(`  P3: code=${p3.body?.code}, id=${p3.body?.result?.id}`);
    t.assert("S1-03", p3.body?.code === 0, `P3 created: code=${p3.body?.code}`);
    if (p3.body?.code === 0) createdPromoIds.push(p3.body.result?.id);

    if (createdPromoIds.length < 3) {
      logBeBug("S1", "CRITICAL", "Khong tao du 3 promo, abort test");
      throw new Error("Setup failed");
    }
    console.log(`  → Created promos: ${createdPromoIds.join(", ")}`);

    // ═══════════════════════════════════════════════════════════════════
    // S2 — CHECK ELIGIBLE cart 200k → expect P1 + P2
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S2 — Cart 200k → check-eligible (expect P1, P2; KHONG P3)");
    console.log("═".repeat(70));

    const cart200 = buildCart(200000, sample.id, variant.id, unitPrice, 2);
    const eligS2 = await POST(t, "/bizapi/market/promotion/check-eligible", cart200);
    console.log(`  Status=${eligS2.status}, code=${eligS2.body?.code}`);
    console.log(`  Body: ${JSON.stringify(eligS2.body).slice(0, 500)}`);

    if (eligS2.body?.code !== 0) {
      logBeBug("S2", "HIGH", "check-eligible fail",
        JSON.stringify(eligS2.body).slice(0, 200));
    }

    const result200 = eligS2.body?.result || {};
    const eligible200 = result200.eligible || result200.eligiblePromotions || [];
    const ineligible200 = result200.ineligible || result200.ineligiblePromotions || [];
    console.log(`  Eligible (${eligible200.length}): ${eligible200.map((p) => p.name).join(", ")}`);
    console.log(`  Ineligible (${ineligible200.length}): ${ineligible200.map((p) => p.name + " (" + (p.reason || p.message || "?") + ")").join(", ")}`);

    // Lọc chỉ promo của test này (theo RID)
    const myEligible200 = eligible200.filter((p) => p.name?.includes(RID));
    const myIneligible200 = ineligible200.filter((p) => p.name?.includes(RID));

    t.assert("S2-01", myEligible200.length === 2,
      `Cart 200k → 2 eligible promo: ${myEligible200.length} (${myEligible200.map((p) => p.name).join(", ")})`);

    const hasP1 = myEligible200.some((p) => p.name?.includes("P1-10pct"));
    const hasP2 = myEligible200.some((p) => p.name?.includes("P2-50k"));
    const hasP3InEligible = myEligible200.some((p) => p.name?.includes("P3-100k"));
    t.assert("S2-02", hasP1, "P1 (10%) trong eligible");
    t.assert("S2-03", hasP2, "P2 (50k) trong eligible");
    t.assert("S2-04", !hasP3InEligible, "P3 KHONG trong eligible (cart 200k < minAmount 500k)");

    // P3 phải ở ineligible với reason
    const p3Ineligible = myIneligible200.find((p) => p.name?.includes("P3-100k"));
    if (p3Ineligible) {
      t.assert("S2-05", true, `P3 ineligible: reason="${p3Ineligible.reason || p3Ineligible.message || "?"}"`);
    } else {
      logBeBug("S2", "MEDIUM", "P3 khong xuat hien trong ineligible array");
      t.assert("S2-05", false, "P3 missing from ineligible");
    }

    // Verify discountAmount tính sẵn của P1 (10% × 200k = 20k)
    const p1Result = myEligible200.find((p) => p.name?.includes("P1-10pct"));
    if (p1Result) {
      const expected = 200000 * 0.10;
      const actual = Number(p1Result.discountAmount || 0);
      console.log(`  P1 discountAmount: ${actual} (expected ${expected})`);
      t.assert("S2-06", actual === expected,
        `P1 discount = 10% × 200k = ${expected}: actual ${actual}`);
    }

    // P2 fix 50k
    const p2Result = myEligible200.find((p) => p.name?.includes("P2-50k"));
    if (p2Result) {
      t.assert("S2-07", Number(p2Result.discountAmount) === 50000,
        `P2 discount fix 50k: ${p2Result.discountAmount}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S3 — Cart 500k → expect cả 3 eligible
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S3 — Cart 500k → expect 3 promo");
    console.log("═".repeat(70));

    const cart500 = buildCart(500000, sample.id, variant.id, unitPrice, 5);
    const eligS3 = await POST(t, "/bizapi/market/promotion/check-eligible", cart500);
    const eligible500 = eligS3.body?.result?.eligible || eligS3.body?.result?.eligiblePromotions || [];
    const myEligible500 = eligible500.filter((p) => p.name?.includes(RID));
    console.log(`  Eligible: ${myEligible500.map((p) => `${p.name}(${p.discountAmount})`).join(", ")}`);

    t.assert("S3-01", myEligible500.length === 3,
      `Cart 500k → 3 promos eligible: ${myEligible500.length}`);

    // Verify discount của từng promo cho cart 500k
    const p1_500 = myEligible500.find((p) => p.name?.includes("P1-10pct"));
    const p2_500 = myEligible500.find((p) => p.name?.includes("P2-50k"));
    const p3_500 = myEligible500.find((p) => p.name?.includes("P3-100k"));

    if (p1_500) t.assert("S3-02", Number(p1_500.discountAmount) === 50000,
      `P1 (10%) cho 500k = 50k: ${p1_500.discountAmount}`);
    if (p2_500) t.assert("S3-03", Number(p2_500.discountAmount) === 50000,
      `P2 (50k fix) cho 500k = 50k: ${p2_500.discountAmount}`);
    if (p3_500) t.assert("S3-04", Number(p3_500.discountAmount) === 100000,
      `P3 (100k fix) cho 500k = 100k: ${p3_500.discountAmount}`);

    // ═══════════════════════════════════════════════════════════════════
    // S4 — User pick best promo cho cart 500k (P3 = 100k highest)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S4 — Pick best promo (P3) cho cart 500k → tao sale");
    console.log("═".repeat(70));

    if (p3_500) {
      const subtotal = 500000;
      const promoDiscount = Number(p3_500.discountAmount);
      const finalAmount = subtotal - promoDiscount;
      console.log(`  Subtotal=${subtotal}, P3 discount=${promoDiscount}, final=${finalAmount}`);

      // Tạo invoice
      const draft = await GET(t, "/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=");
      const inv = draft.body?.result?.invoice || draft.body?.result;
      const invoiceId = inv?.id;

      const ins = await POST(t,
        `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${invoiceId}&paid=${finalAmount}&debt=0&fundId=1&loyaltyDiscount=${promoDiscount}`,
        [{
          productId: Number(sample.id), variantId: Number(variant.id),
          unitId: Number(variant.unitId), price: unitPrice, customerId: -1,
          quantity: 5, name: sample.name, avatar: "", unitName: "Cái",
          fee: subtotal,
        }]);
      console.log(`  insertBatch: code=${ins.body?.code}`);

      const conf = await POST(t, "/bizapi/sales/invoice/create", {
        id: invoiceId, fee: finalAmount, paid: finalAmount, debt: 0,
        amount: subtotal, discount: promoDiscount, vatAmount: 0,
        amountCard: 0, paymentType: 1, invoiceType: "IV1", customerId: -1,
        branchId: Number(inv.branchId ?? -1), bsnId: Number(inv.bsnId ?? -1),
        receiptDate: new Date().toISOString().slice(0, 19),
        account: "[]", customerName: "",
      });
      console.log(`  invoice/create: code=${conf.body?.code}, invoiceCode=${conf.body?.result?.invoiceCode}`);

      t.assert("S4-01", conf.body?.code === 0,
        `Sale voi promo P3: ${conf.body?.result?.invoiceCode}`);
      if (conf.body?.code === 0) {
        const inv2 = conf.body.result;
        t.assert("S4-02", Number(inv2.fee) === finalAmount,
          `Invoice fee = ${finalAmount} (sau giam ${promoDiscount}): actual ${inv2.fee}`);
        t.assert("S4-03", Number(inv2.discount) === promoDiscount,
          `Invoice discount = ${promoDiscount}: actual ${inv2.discount}`);
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // S5 — Cart 100k (chỉ đủ P1) → P2/P3 phải ineligible với reason
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S5 — Cart 100k → chi P1 eligible, P2/P3 ineligible");
    console.log("═".repeat(70));

    const cart100 = buildCart(100000, sample.id, variant.id, unitPrice, 1);
    const eligS5 = await POST(t, "/bizapi/market/promotion/check-eligible", cart100);
    const elig5 = (eligS5.body?.result?.eligible || []).filter((p) => p.name?.includes(RID));
    const inelig5 = (eligS5.body?.result?.ineligible || []).filter((p) => p.name?.includes(RID));
    console.log(`  Eligible: ${elig5.map((p) => p.name).join(", ")}`);
    console.log(`  Ineligible: ${inelig5.map((p) => p.name + " (" + (p.reason || "?") + ")").join(", ")}`);

    t.assert("S5-01", elig5.length === 1 && elig5[0]?.name?.includes("P1"),
      `Cart 100k → chỉ P1 eligible: ${elig5.length}`);
    t.assert("S5-02", inelig5.length >= 2,
      `P2 + P3 trong ineligible: ${inelig5.length}`);

    // ═══════════════════════════════════════════════════════════════════
    // S6 — Promo EXPIRED — không xuất hiện trong eligible
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S6 — Promo EXPIRED → không trong eligible");
    console.log("═".repeat(70));

    const pExpired = await createPromo(t, {
      name: `EXPIRED-${RID}`,
      discountType: 2,
      discount: 30000,
      minAmount: 100000,
      startTime: dateAdd(-7),
      endTime: dateAdd(-1),    // hết hạn hôm qua
    });
    console.log(`  EXPIRED promo: code=${pExpired.body?.code}, id=${pExpired.body?.result?.id}`);
    if (pExpired.body?.code === 0) {
      createdPromoIds.push(pExpired.body.result?.id);

      const eligS6 = await POST(t, "/bizapi/market/promotion/check-eligible", cart200);
      const all6 = [
        ...(eligS6.body?.result?.eligible || []),
        ...(eligS6.body?.result?.ineligible || []),
      ];
      const expiredFound = all6.some((p) => p.name?.includes("EXPIRED-"));
      const expiredInEligible = (eligS6.body?.result?.eligible || []).some((p) => p.name?.includes("EXPIRED-"));

      t.assert("S6-01", !expiredInEligible,
        `Expired promo KHONG trong eligible (in any list: ${expiredFound})`);
    } else {
      // BE có thể reject create với endTime quá khứ
      note("S6", `BE reject tao promo expired: ${JSON.stringify(pExpired.body).slice(0, 200)}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S7 — Promo chưa bắt đầu (startTime tương lai)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S7 — Promo CHUA START → không trong eligible");
    console.log("═".repeat(70));

    const pFuture = await createPromo(t, {
      name: `FUTURE-${RID}`,
      discountType: 2,
      discount: 40000,
      minAmount: 100000,
      startTime: dateAdd(2),    // bắt đầu 2 ngày nữa
      endTime: dateAdd(10),
    });
    console.log(`  FUTURE promo: code=${pFuture.body?.code}, id=${pFuture.body?.result?.id}`);
    if (pFuture.body?.code === 0) {
      createdPromoIds.push(pFuture.body.result?.id);

      const eligS7 = await POST(t, "/bizapi/market/promotion/check-eligible", cart200);
      const futureInEligible = (eligS7.body?.result?.eligible || [])
        .some((p) => p.name?.includes("FUTURE-"));
      t.assert("S7-01", !futureInEligible,
        "Promo chua start KHONG trong eligible");
    }

    // ═══════════════════════════════════════════════════════════════════
    // S8 — Destructive: orderAmount âm + cart rỗng
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S8 — Destructive: orderAmount âm, cart rỗng");
    console.log("═".repeat(70));

    const eligNeg = await POST(t, "/bizapi/market/promotion/check-eligible", {
      orderAmount: -100000, customerId: -1, cartItems: [],
    });
    console.log(`  orderAmount=-100k: code=${eligNeg.body?.code}, result.eligible=${(eligNeg.body?.result?.eligible || []).length}`);
    const negEligibles = (eligNeg.body?.result?.eligible || []).filter((p) => p.name?.includes(RID));
    t.assert("S8-01", negEligibles.length === 0,
      `orderAmount âm KHONG return promo eligible: ${negEligibles.length}`);

    const eligEmpty = await POST(t, "/bizapi/market/promotion/check-eligible", {
      orderAmount: 0, customerId: -1, cartItems: [],
    });
    console.log(`  cart rỗng: code=${eligEmpty.body?.code}, result.eligible=${(eligEmpty.body?.result?.eligible || []).length}`);
    const emptyEligibles = (eligEmpty.body?.result?.eligible || []).filter((p) => p.name?.includes(RID));
    t.assert("S8-02", emptyEligibles.length === 0,
      `Cart rỗng KHONG return promo: ${emptyEligibles.length}`);

    // ═══════════════════════════════════════════════════════════════════
    // S9 — Stats endpoints
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S9 — Stats endpoints");
    console.log("═".repeat(70));

    const cbsActive = await GET(t, "/bizapi/market/promotion/count-by-status?status=1");
    console.log(`  count-by-status status=1 (active): ${JSON.stringify(cbsActive.body).slice(0, 200)}`);
    t.assert("S9-01", cbsActive.body?.code === 0,
      `count-by-status active OK: code=${cbsActive.body?.code}`);

    const cbsExpired = await GET(t, "/bizapi/market/promotion/count-by-status?status=2");
    console.log(`  count-by-status status=2 (expired): ${JSON.stringify(cbsExpired.body).slice(0, 200)}`);

    // List active promos
    const listActive = await GET(t, "/bizapi/market/promotion/list-active");
    const activeItems = listActive.body?.result?.items || listActive.body?.result || [];
    const ourActive = (Array.isArray(activeItems) ? activeItems : [])
      .filter((p) => p.name?.includes(RID))
      .filter((p) => !p.name?.includes("EXPIRED") && !p.name?.includes("FUTURE"));
    console.log(`  list-active: total ${Array.isArray(activeItems) ? activeItems.length : "?"}, ours ${ourActive.length}`);
    t.assert("S9-02", ourActive.length === 3,
      `list-active có 3 promo của test (P1, P2, P3): ${ourActive.length}`);

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
  } finally {
    // ═══════════════════════════════════════════════════════════════════
    // CLEANUP
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  CLEANUP");
    console.log("═".repeat(70));
    for (const id of createdPromoIds.filter(Boolean)) {
      const d = await DELETE(t, `/bizapi/market/promotion/delete?id=${id}`);
      console.log(`  Delete promo ${id}: code=${d.body?.code}`);
      if (d.body?.code !== 0) {
        // Fallback: disable
        await POST(t, "/bizapi/market/promotion/update/status", { id, status: 0 });
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
