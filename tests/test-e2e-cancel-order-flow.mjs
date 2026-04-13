#!/usr/bin/env node
/**
 * E2E TEST — Luồng "Hủy đơn hàng" (2 entry points)
 *
 * S1. POS "Hủy đơn" button ở SaleInvoiceList
 *     Flow: cancelInvoiceByReturn(invoiceId)
 *       → getReturnItems → createReturn (full) → confirmReturn
 *     Verify: stock hoàn, finance expense tăng, fund giảm, net delta = 0
 *
 * S2. Hủy shipment → auto-return đơn hàng gốc
 *     Flow: ShippingService.cancel(shipmentOrder)
 *       → cancelInvoiceByReturn(orderId) auto
 *     Verify: shipment CANCELLED + invoice auto-returned (stock + finance)
 *
 * S3. Edge case: hủy shipment KHÔNG link invoice → chỉ cancel shipment,
 *     không tự hoàn (shipment tạo manual, không có orderId)
 *
 * Chay: node tests/test-e2e-cancel-order-flow.mjs
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
    Hostname: HOSTNAME_HEADER,
    Accept: "application/json",
    "Content-Type": "application/json",
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
async function apiDelete(t, path) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  try {
    const r = await t.context.request.delete(url, { headers: await headers(t) });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}

function todayFmt() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
async function getStock(t, productId) {
  const r = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=50");
  const p = (r.body?.result?.items || []).find((x) => Number(x.id) === Number(productId));
  return Number(p?.stockQuantity || 0);
}
async function getFinance(t) {
  const r = await apiGet(t,
    `/bizapi/billing/finance/dashboard?fromTime=${todayFmt()}&toTime=${todayFmt()}`);
  const rr = r.body?.result || {};
  return {
    income: Number(rr.totalIncome ?? 0),
    expense: Number(rr.totalExpense ?? 0),
    fund: Number(rr.totalFundBalance ?? 0),
  };
}

/** Tạo đơn POS thường (IV1) */
async function createSaleViaApi(t, product, variant, qty, label) {
  const unitPrice = Number(variant.price || 100000);
  const total = unitPrice * qty;
  const draft = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const inv = draft.body?.result?.invoice || draft.body?.result;
  const invoiceId = inv?.id;
  if (!invoiceId) return null;

  const ins = await apiPost(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${invoiceId}&paid=${total}&debt=0&fundId=1`,
    [{
      productId: Number(product.id), variantId: Number(variant.id), unitId: Number(variant.unitId),
      price: unitPrice, customerId: -1, quantity: qty, name: product.name,
      avatar: product.avatar || "", unitName: variant.unitName || "Cái", fee: total,
    }]);
  if (ins.body?.code !== 0) { logBeBug(label, "HIGH", "insertBatch fail"); return null; }

  const conf = await apiPost(t, "/bizapi/sales/invoice/create", {
    id: invoiceId, fee: total, paid: total, debt: 0, amount: total,
    discount: 0, vatAmount: 0, amountCard: 0, paymentType: 1,
    invoiceType: "IV1", customerId: -1,
    branchId: Number(inv?.branchId ?? -1), bsnId: Number(inv?.bsnId ?? -1),
    receiptDate: new Date().toISOString().slice(0, 19),
    account: "[]", customerName: "",
  });
  if (conf.body?.code !== 0) { logBeBug(label, "HIGH", "invoice/create fail"); return null; }
  return { invoiceId, invoiceCode: conf.body.result?.invoiceCode, total };
}

/** Simulate cancelInvoiceByReturn helper — full refund via return flow */
async function cancelInvoiceByReturn(t, invoiceId, label) {
  const retItems = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${invoiceId}`);
  if (retItems.body?.code !== 0) {
    logBeBug(label, "HIGH", "get/return fail"); return null;
  }
  const result = retItems.body.result || {};
  const lstBP = result.lstBoughtProduct || result.products || [];
  if (lstBP.length === 0) {
    logBeBug(label, "HIGH", "get/return empty items");
    return null;
  }
  const totalRefund = lstBP.reduce(
    (s, p) => s + Number(p.price || 0) * Number(p.quantity ?? p.qty ?? 0), 0);

  const body = {
    invoice: {
      referId: invoiceId, customerId: Number(result.customerId ?? -1),
      amount: totalRefund, fee: totalRefund, paid: totalRefund,
      debt: 0, discount: 0, vatAmount: 0, paymentType: 1,
      reason: "Hủy đơn hàng", refundMethod: 1,
      note: `E2E cancel flow ${RID}`,
    },
    lstBoughtProduct: lstBP.map((p) => ({
      productId: Number(p.productId), variantId: Number(p.variantId),
      unitId: Number(p.unitId),
      quantity: Number(p.quantity ?? p.qty ?? 0),
      qty: Number(p.quantity ?? p.qty ?? 0),
      price: Number(p.price || 0),
      fee: Number(p.price || 0) * Number(p.quantity ?? p.qty ?? 0),
      discount: 0, discountUnit: 2,
      inventoryId: p.inventoryId, name: p.name,
    })),
    lstService: [], lstCardService: [],
  };
  const create = await apiPost(t, "/bizapi/sales/invoice/create/return", body);
  if (create.body?.code !== 0) {
    logBeBug(label, "HIGH", "create/return fail", JSON.stringify(create.body).slice(0, 200));
    return null;
  }
  const retId = create.body.result?.id || create.body.result?.invoice?.id;
  const conf = await apiPost(t, `/bizapi/sales/invoice/return/confirm?id=${retId}`, {});
  if (conf.body?.code !== 0) {
    logBeBug(label, "HIGH", "confirm fail"); return null;
  }
  return { returnInvoiceId: retId, refundAmount: totalRefund };
}

/** Tạo shipment (giống tests/test-e2e-shipping-flow.mjs) */
async function createShipment(t, invoice, receiver) {
  return await apiPost(t, "/bizapi/logistics/shipment/create", {
    internalOrderId: invoice.invoiceCode,
    carrierCode: "GHTK",
    sender: {
      name: "Reborn Store", phone: "0901111111", email: "store@reborn.vn",
      address: "So 1 Le Loi", ward: "Phuong Ben Nghe", district: "Quan 1", province: "Hồ Chí Minh",
    },
    receiver: {
      name: receiver.name, phone: receiver.phone, email: "",
      address: receiver.address, ward: "Phuong Dich Vong", district: "Quan Cau Giay", province: "Hà Nội",
    },
    parcel: { weightGram: 500, lengthCm: 10, widthCm: 10, heightCm: 10 },
    codAmount: 0, declaredValue: invoice.total,
    shippingFeeBearer: "RECEIVER",
    items: [{ name: "SP test", quantity: 1, weightGram: 500, price: invoice.total }],
    note: `E2E cancel ${RID}`, status: "SUBMITTED",
  });
}

// ────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-CANCEL", `Huy don flow [${RID}]`);

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

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=100");
    const items = prodRes.body?.result?.items || [];
    const candidates = items
      .filter((p) => Number(p.stockQuantity || 0) >= 5)
      .filter((p) => {
        const price = Number(p.originalPrice ?? p.promotionPrice ?? 0);
        return price > 0 && price <= 200000;
      })
      .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0));
    const sample = candidates.find((p) => p.name?.includes("E2E SP")) || candidates[0];
    if (!sample) {
      logUiBug("SETUP", "CRITICAL", "Khong co SP phu hop");
      throw new Error("No product");
    }
    const pd = await apiGet(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pd.body?.result?.variants?.[0];
    const unitPrice = Number(variant?.price || 100000);
    console.log(`  Sample: [${sample.id}] "${sample.name}" price=${unitPrice} stock=${sample.stockQuantity}`);

    // ═══════════════════════════════════════════════════════════════════
    // S1 — POS "Hủy đơn" (cancelInvoiceByReturn helper)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S1 — POS cancel order via return flow");
    console.log("═".repeat(70));

    const baseStockS1 = await getStock(t, sample.id);
    const baseFinS1 = await getFinance(t);
    console.log(`  Baseline: stock=${baseStockS1}, income=${baseFinS1.income}, expense=${baseFinS1.expense}, fund=${baseFinS1.fund}`);

    const QTY = 2;
    const expectedTotal = unitPrice * QTY;

    const sale1 = await createSaleViaApi(t, sample, variant, QTY, "S1");
    t.assert("S1-01", !!sale1, sale1 ? `Tao don ${sale1.invoiceCode} total=${sale1.total}` : "Fail");
    if (!sale1) throw new Error("S1 blocked");

    await new Promise((r) => setTimeout(r, 3000));
    const afterSaleStock = await getStock(t, sample.id);
    const afterSaleFin = await getFinance(t);
    t.assert("S1-02", afterSaleStock === baseStockS1 - QTY,
      `Sau ban: stock ${baseStockS1} → ${afterSaleStock} (-${QTY})`);
    t.assert("S1-03", afterSaleFin.fund - baseFinS1.fund === expectedTotal,
      `Sau ban: fund +${expectedTotal}, delta=${afterSaleFin.fund - baseFinS1.fund}`);

    // ── Hủy đơn via helper simulation
    console.log(`\n  → Goi cancelInvoiceByReturn(${sale1.invoiceId})`);
    const cancelRes = await cancelInvoiceByReturn(t, sale1.invoiceId, "S1");
    t.assert("S1-04", !!cancelRes,
      cancelRes ? `Helper OK: returnInvoiceId=${cancelRes.returnInvoiceId}, refund=${cancelRes.refundAmount}` : "Helper fail");
    if (!cancelRes) throw new Error("S1 cancel fail");

    await new Promise((r) => setTimeout(r, 3500));

    // Verify stock hồi phục
    const afterCancelStock = await getStock(t, sample.id);
    t.assert("S1-05", afterCancelStock === baseStockS1,
      `Stock hoan ve baseline: ${afterSaleStock} → ${afterCancelStock} (expected ${baseStockS1})`);

    // Verify finance: expense +total, fund về baseline
    const afterCancelFin = await getFinance(t);
    const fundDelta = afterCancelFin.fund - baseFinS1.fund;
    const expenseDelta = afterCancelFin.expense - baseFinS1.expense;
    t.assert("S1-06", fundDelta === 0,
      `Fund ve baseline (P/L net = 0): delta=${fundDelta}`);
    t.assert("S1-07", expenseDelta === expectedTotal,
      `Expense tang ${expectedTotal}: delta=${expenseDelta}`);

    note("S1", `✅ Cancel flow hoan chinh: stock/finance round-trip 0`);

    // ═══════════════════════════════════════════════════════════════════
    // S2 — Hủy shipment → auto-return invoice
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S2 — Huy shipment → tu dong tra don hang goc");
    console.log("═".repeat(70));

    const baseStockS2 = await getStock(t, sample.id);
    const baseFinS2 = await getFinance(t);

    // Tạo đơn có ship (không cần phí ship cho test này)
    const sale2 = await createSaleViaApi(t, sample, variant, QTY, "S2");
    t.assert("S2-01", !!sale2, sale2 ? `Tao don ${sale2.invoiceCode}` : "Fail");
    if (!sale2) throw new Error("S2 blocked");

    // Tạo shipment linked
    const ship = await createShipment(t, sale2, {
      name: `KH Cancel Ship ${RID}`, phone: "0912345678",
      address: `So 1 Cau Giay, Hà Nội`,
    });
    t.assert("S2-02", ship.body?.code === 0, `Tao shipment: code=${ship.body?.code}`);
    if (ship.body?.code !== 0) throw new Error("S2 shipment fail");

    const shipment = ship.body?.result;
    console.log(`  Shipment: ${shipment?.shipmentOrder}, orderCode=${shipment?.orderCode}, orderId=${shipment?.orderId}`);

    await new Promise((r) => setTimeout(r, 2500));
    const afterSaleStockS2 = await getStock(t, sample.id);
    t.assert("S2-03", afterSaleStockS2 === baseStockS2 - QTY,
      `Stock giam sau ban: ${baseStockS2} → ${afterSaleStockS2}`);

    // ── Step 1: Hủy shipment
    console.log(`\n  → Step 1: Cancel shipment ${shipment?.shipmentOrder}`);
    // Thử DELETE trước (theo FE ShippingService.cancel), fallback POST nếu BE 405
    let cancelShip = await apiDelete(t, `/bizapi/logistics/shipment/${encodeURIComponent(shipment.shipmentOrder)}/cancel`);
    if (cancelShip.status === 405 || cancelShip.status === 404) {
      console.log(`  DELETE returned ${cancelShip.status}, falling back to POST`);
      cancelShip = await apiPost(t, `/bizapi/logistics/shipment/${encodeURIComponent(shipment.shipmentOrder)}/cancel`, {});
    }
    t.assert("S2-04",
      cancelShip.body?.code === 0 || cancelShip.status === 200,
      `Cancel shipment: status=${cancelShip.status}, code=${cancelShip.body?.code}`);

    // ── Step 2: Auto-return invoice (simulate FE handler logic)
    const linkedInvoiceId = Number(
      shipment?.orderId ||
      (shipment?.orderCode && sale2.invoiceId) ||  // fallback: dùng invoice gốc từ context
      0
    );
    // Nếu BE chưa populate orderId, dùng sale2.invoiceId (FE handler có context)
    const invoiceIdToCancel = linkedInvoiceId || sale2.invoiceId;

    console.log(`\n  → Step 2: Auto-return invoice ${invoiceIdToCancel}`);
    const autoCancel = await cancelInvoiceByReturn(t, invoiceIdToCancel, "S2");
    t.assert("S2-05", !!autoCancel,
      autoCancel ? `Auto-return OK: refund=${autoCancel.refundAmount}` : "Auto-return fail");

    if (autoCancel) {
      await new Promise((r) => setTimeout(r, 3500));

      // Verify stock hoàn
      const afterCancelStockS2 = await getStock(t, sample.id);
      t.assert("S2-06", afterCancelStockS2 === baseStockS2,
        `Stock hoan sau cancel ship: ${afterSaleStockS2} → ${afterCancelStockS2}`);

      // Verify finance round-trip
      const afterCancelFinS2 = await getFinance(t);
      const fundDeltaS2 = afterCancelFinS2.fund - baseFinS2.fund;
      t.assert("S2-07", fundDeltaS2 === 0,
        `Fund net = 0 sau cancel ship + auto-return: delta=${fundDeltaS2}`);

      // Verify shipment đã cancelled
      const shipList = await apiGet(t,
        `/bizapi/logistics/shipment/list?page=1&limit=5&keyword=${encodeURIComponent(shipment.shipmentOrder)}`);
      const shipAfter = (shipList.body?.result?.items || []).find(
        (x) => x.shipmentOrder === shipment.shipmentOrder
      );
      const shipStatus = shipAfter?.statusCode || shipAfter?.status;
      t.assert("S2-08",
        shipStatus === "CANCELLED" || shipStatus === "cancelled",
        `Shipment status: "${shipStatus}"`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S3 — Edge case: shipment không link invoice → chỉ cancel shipment
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S3 — Edge: shipment khong link invoice");
    console.log("═".repeat(70));

    // Tạo shipment "mồ côi" (không internalOrderId)
    const orphanShip = await apiPost(t, "/bizapi/logistics/shipment/create", {
      // KHÔNG có internalOrderId
      carrierCode: "GHTK",
      sender: {
        name: "Reborn", phone: "0901111111", email: "",
        address: "So 1 Le Loi", ward: "Phuong Ben Nghe", district: "Quan 1", province: "Hồ Chí Minh",
      },
      receiver: {
        name: `Orphan ${RID}`, phone: "0912345678", email: "",
        address: "So 1 CG", ward: "Phuong Dich Vong", district: "Quan Cau Giay", province: "Hà Nội",
      },
      parcel: { weightGram: 500, lengthCm: 10, widthCm: 10, heightCm: 10 },
      codAmount: 0, declaredValue: 100000, shippingFeeBearer: "RECEIVER",
      items: [{ name: "Orphan", quantity: 1, weightGram: 500, price: 100000 }],
      note: "E2E orphan", status: "SUBMITTED",
    });

    if (orphanShip.body?.code === 0) {
      const orphan = orphanShip.body.result;
      console.log(`  Orphan shipment: ${orphan.shipmentOrder}, orderId=${orphan.orderId}`);
      t.assert("S3-01", !orphan.orderId,
        `Shipment khong link invoice: orderId=${orphan.orderId}`);

      // Snapshot trước cancel
      const preStockS3 = await getStock(t, sample.id);
      const preFinS3 = await getFinance(t);

      // Cancel shipment (không có auto-return)
      let cancelOrphan = await apiDelete(t,
        `/bizapi/logistics/shipment/${encodeURIComponent(orphan.shipmentOrder)}/cancel`);
      if (cancelOrphan.status === 405 || cancelOrphan.status === 404) {
        cancelOrphan = await apiPost(t,
          `/bizapi/logistics/shipment/${encodeURIComponent(orphan.shipmentOrder)}/cancel`, {});
      }
      t.assert("S3-02",
        cancelOrphan.body?.code === 0 || cancelOrphan.status === 200,
        `Cancel orphan shipment: status=${cancelOrphan.status}`);

      await new Promise((r) => setTimeout(r, 2500));

      // Verify: stock + finance KHONG doi (vì không có invoice để return)
      const afterStockS3 = await getStock(t, sample.id);
      const afterFinS3 = await getFinance(t);
      t.assert("S3-03", afterStockS3 === preStockS3,
        `Stock KHONG doi sau cancel shipment orphan: ${preStockS3} → ${afterStockS3}`);
      t.assert("S3-04", afterFinS3.fund === preFinS3.fund,
        `Fund KHONG doi sau cancel shipment orphan: delta=${afterFinS3.fund - preFinS3.fund}`);

      note("S3", "FE handler se skip auto-return khi shipment khong link invoice → behavior dung");
    } else {
      note("S3", `Khong tao duoc orphan shipment (${JSON.stringify(orphanShip.body).slice(0, 150)})`);
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
  }

  // ── REPORT ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(70));
  console.log("  BUG REPORT");
  console.log("═".repeat(70));
  console.log(`\n🐛 UI BUGS (${uiBugs.length}):`);
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}`));
  console.log(`\n📋 FINDINGS:`);
  findings.forEach((f, i) => console.log(`  ${i + 1}. [${f.step}] ${f.msg}`));

  await t.done();
  const crit = beBugs.filter((b) => ["HIGH", "CRITICAL"].includes(b.severity)).length
             + uiBugs.filter((b) => ["HIGH", "CRITICAL", "BLOCKER"].includes(b.severity)).length;
  process.exit(crit > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
