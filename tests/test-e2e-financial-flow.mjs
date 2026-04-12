#!/usr/bin/env node
/**
 * E2E TEST — Luồng tài chính: Bán hàng → tăng tiền, Trả hàng → hoàn tiền
 *
 * Verify số liệu CHÍNH XÁC ở nhiều nguồn sau mỗi action:
 *   A. BÁN 1 ĐƠN X đồng → kiểm tra:
 *      - Finance dashboard: totalIncome +X, totalFundBalance +X
 *      - Cashbook: entry thu (type=1) mới với amount=X, invoiceId link đơn
 *      - Invoice list v2: có đơn IV1 mới
 *      - Sales report summary: revenue +X (optional)
 *
 *   B. TRẢ TOÀN BỘ đơn đó (X đồng) → kiểm tra:
 *      - Finance dashboard: totalExpense +X (chi refund)
 *      - Cashbook: entry chi (type=2) mới với amount=X
 *      - Invoice list v2: có đơn IV2 mới
 *
 * Consistency: số liệu phải khớp giữa Finance Dashboard vs Cashbook sum.
 *
 * Chay: node tests/test-e2e-financial-flow.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
const API_BASE = "https://biz.reborn.vn";
const HOSTNAME_HEADER = "kcn.reborn.vn";

const uiBugs = [];
const beBugs = [];
const findings = [];

function logBeBug(step, severity, desc, evidence = "") {
  beBugs.push({ step, severity, desc, evidence });
  console.log(`  🔧 [BE-${severity}] ${step}: ${desc}${evidence ? "\n     → " + evidence : ""}`);
}
function logUiBug(step, severity, desc, evidence = "") {
  uiBugs.push({ step, severity, desc, evidence });
  console.log(`  🐛 [UI-${severity}] ${step}: ${desc}${evidence ? "\n     → " + evidence : ""}`);
}
function note(step, msg) {
  findings.push({ step, msg });
  console.log(`  📋 [NOTE] ${step}: ${msg}`);
}

// ── API helpers ─────────────────────────────────────────────────────────
async function getAuthHeaders(t) {
  const cookies = await t.context.cookies();
  const tk = cookies.find((c) => c.name === "token");
  return {
    Authorization: tk ? `Bearer ${tk.value}` : "",
    Hostname: HOSTNAME_HEADER,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function apiGet(t, path) {
  const stripped = path.replace(/^\/bizapi/, "");
  const url = stripped.startsWith("http") ? stripped : API_BASE + stripped;
  try {
    const headers = await getAuthHeaders(t);
    const r = await t.context.request.get(url, { headers });
    let body = null; try { body = await r.json(); } catch { body = await r.text(); }
    return { status: r.status(), body };
  } catch (e) { return { status: 0, error: String(e) }; }
}

async function apiPost(t, path, body = {}) {
  const stripped = path.replace(/^\/bizapi/, "");
  const url = stripped.startsWith("http") ? stripped : API_BASE + stripped;
  try {
    const headers = await getAuthHeaders(t);
    const r = await t.context.request.post(url, { headers, data: body });
    let respBody = null; try { respBody = await r.json(); } catch { respBody = await r.text(); }
    return { status: r.status(), body: respBody };
  } catch (e) { return { status: 0, error: String(e) }; }
}

// ── Helpers domain ──────────────────────────────────────────────────────
function todayFmt() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Lấy snapshot tài chính từ nhiều nguồn để cross-verify */
async function getFinanceSnapshot(t, label = "") {
  const snapshot = { label, at: new Date().toISOString() };

  // Finance dashboard
  const fd = await apiGet(t,
    `/bizapi/billing/finance/dashboard?fromTime=${todayFmt()}&toTime=${todayFmt()}`);
  const fdR = fd.body?.result || {};
  snapshot.totalIncome      = Number(fdR.totalIncome      ?? 0);
  snapshot.totalExpense     = Number(fdR.totalExpense     ?? 0);
  snapshot.totalFundBalance = Number(fdR.totalFundBalance ?? 0);

  // Cashbook full list — path: result.cashbookResponse.items
  const cb = await apiGet(t, `/bizapi/billing/cashbook/list?page=1&limit=200`);
  const cbRoot = cb.body?.result?.cashbookResponse || {};
  const cbItems = cbRoot.items || [];
  snapshot.cashbookTotal = Number(cbRoot.total ?? 0);

  const todayStr = todayIso();
  const todayEntries = cbItems.filter((x) => (x.transDate || "").startsWith(todayStr));
  const todayIncome  = todayEntries.filter((x) => Number(x.type) === 1);
  const todayExpense = todayEntries.filter((x) => Number(x.type) === 2);
  snapshot.cashbookIncomeCount  = todayIncome.length;
  snapshot.cashbookIncomeSum    = todayIncome.reduce((s, x) => s + Number(x.amount || 0), 0);
  snapshot.cashbookExpenseCount = todayExpense.length;
  snapshot.cashbookExpenseSum   = todayExpense.reduce((s, x) => s + Number(x.amount || 0), 0);
  // BE trả sorted desc by transDate → lấy 3 entries đầu là mới nhất
  snapshot._cbInLatest  = todayIncome.slice(0, 3);
  snapshot._cbOutLatest = todayExpense.slice(0, 3);

  // Refund entries specifically — link với return invoice (invoiceId not null + type=2)
  const refundEntries = todayExpense.filter((x) => x.invoiceId);
  snapshot.refundEntriesCount = refundEntries.length;
  snapshot.refundEntriesSum   = refundEntries.reduce((s, x) => s + Number(x.amount || 0), 0);

  // Invoice list — /sales/invoice/list (legacy, only returns IV1)
  const ivAll = await apiGet(t, `/bizapi/sales/invoice/list?page=1&limit=200`);
  const ivItems = ivAll.body?.result?.items || [];
  const todayInvoices = ivItems.filter((x) => (x.receiptDate || "").startsWith(todayStr));
  snapshot.iv1Count = todayInvoices.filter((x) => x.invoiceType === "IV1").length;
  snapshot.iv1Total = todayInvoices
    .filter((x) => x.invoiceType === "IV1")
    .reduce((s, x) => s + Number(x.fee || x.paid || 0), 0);

  return snapshot;
}

/** Get invoice chi tiết (để verify return invoice tồn tại với type=IV2) */
async function getInvoiceDetail(t, id) {
  const r = await apiGet(t, `/bizapi/sales/invoice/get?id=${id}`);
  return r.body?.result?.invoice || r.body?.result || null;
}

function printSnapshot(label, s) {
  console.log(`\n  📸 ${label}:`);
  console.log(`     Finance dashboard: income=${s.totalIncome}, expense=${s.totalExpense}, fundBalance=${s.totalFundBalance}`);
  console.log(`     Cashbook thu (type=1): count=${s.cashbookIncomeCount}, sum=${s.cashbookIncomeSum}`);
  console.log(`     Cashbook chi (type=2): count=${s.cashbookExpenseCount}, sum=${s.cashbookExpenseSum}`);
  console.log(`     Invoice IV1 (ban):  count=${s.iv1Count}, total=${s.iv1Total}`);
  console.log(`     Invoice IV2 (tra):  count=${s.iv2Count}, total=${s.iv2Total}`);
}

/** Tạo đơn POS đầy đủ qua direct API */
async function createSaleViaApi(t, product, variant, qty, label) {
  const unitPrice = Number(variant.price || product.originalPrice || product.promotionPrice || 100000);
  const total = unitPrice * qty;

  const draftRes = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const draftInv = draftRes.body?.result?.invoice || draftRes.body?.result;
  const invoiceId = draftInv?.id;
  if (!invoiceId) {
    logBeBug(label, "HIGH", "draft/create fail",
      JSON.stringify(draftRes.body).slice(0, 200));
    return null;
  }

  const boughtBody = [{
    productId: Number(product.id),
    variantId: Number(variant.id),
    unitId:    Number(variant.unitId),
    price:     unitPrice,
    customerId: -1,
    quantity:  qty,
    name:      product.name,
    avatar:    product.avatar || "",
    unitName:  variant.unitName || variant.unit || "Cái",
    fee:       total,
  }];
  const insertRes = await apiPost(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${invoiceId}&paid=${total}&debt=0&fundId=1`,
    boughtBody);
  if (insertRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "insertBatch fail", JSON.stringify(insertRes.body).slice(0, 200));
    return null;
  }

  const now = new Date();
  const receiptDate = now.toISOString().slice(0, 19);
  const confirmRes = await apiPost(t, "/bizapi/sales/invoice/create", {
    id:          invoiceId,
    fee:         total,
    paid:        total,
    debt:        0,
    amount:      total,
    discount:    0,
    vatAmount:   0,
    amountCard:  0,
    paymentType: 1,
    invoiceType: draftInv?.invoiceType || "IV1",
    customerId:  -1,
    branchId:    Number(draftInv?.branchId ?? -1),
    bsnId:       Number(draftInv?.bsnId ?? -1),
    receiptDate,
    account:     "[]",
    customerName: "",
  });
  if (confirmRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "invoice/create fail",
      JSON.stringify(confirmRes.body).slice(0, 200));
    return null;
  }
  return {
    invoiceId,
    invoiceCode: confirmRes.body.result?.invoiceCode,
    total,
  };
}

// ────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-FIN", `Financial flow [${RID}]`);

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.goto("/dashboard");
    await t.page.waitForTimeout(2000);

    // ════════════════════════════════════════════════════════════════════
    // SETUP — tìm SP có stock
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SETUP");
    console.log("═".repeat(70));

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=30");
    const prodItems = prodRes.body?.result?.items || [];
    const sample = prodItems.find((p) => Number(p.stockQuantity || 0) >= 2);
    if (!sample) {
      logUiBug("SETUP", "CRITICAL", "Khong co SP nao stock >= 2");
      throw new Error("No product with stock");
    }
    const pdRes = await apiGet(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pdRes.body?.result?.variants?.[0];
    if (!variant) { logUiBug("SETUP", "CRITICAL", "Khong co variant"); throw new Error("No variant"); }
    const unitPrice = Number(variant.price || sample.originalPrice || 100000);
    const SALE_QTY  = 2;
    const SALE_AMT  = unitPrice * SALE_QTY;
    console.log(`  Sample: [${sample.id}] "${sample.name}" price=${unitPrice}, variant=${variant.id}`);
    console.log(`  SALE qty=${SALE_QTY} → amount=${SALE_AMT}`);

    // ════════════════════════════════════════════════════════════════════
    // BASELINE — snapshot trước khi làm gì
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  BASELINE (trước bán)");
    console.log("═".repeat(70));

    const base = await getFinanceSnapshot(t, "baseline");
    printSnapshot("BASELINE", base);

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO A — BÁN 1 ĐƠN
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO A — BAN 1 DON + verify tien tang");
    console.log("═".repeat(70));

    const sale = await createSaleViaApi(t, sample, variant, SALE_QTY, "A");
    t.assert("A-01", !!sale, sale
      ? `Tao don ${sale.invoiceCode} amount=${sale.total}`
      : "Tao don fail");
    if (!sale) throw new Error("Sale failed");

    // Wait BE process (cashbook entry auto-created async)
    await new Promise((r) => setTimeout(r, 4000));

    const afterSale = await getFinanceSnapshot(t, "after-sale");
    printSnapshot("SAU KHI BAN", afterSale);

    // Delta analysis
    const dIncome      = afterSale.totalIncome      - base.totalIncome;
    const dExpense     = afterSale.totalExpense     - base.totalExpense;
    const dFundBalance = afterSale.totalFundBalance - base.totalFundBalance;
    const dCbInCnt     = afterSale.cashbookIncomeCount - base.cashbookIncomeCount;
    const dCbInSum     = afterSale.cashbookIncomeSum   - base.cashbookIncomeSum;
    const dCbOutCnt    = afterSale.cashbookExpenseCount - base.cashbookExpenseCount;
    const dIv1Cnt      = afterSale.iv1Count - base.iv1Count;
    const dIv1Total    = afterSale.iv1Total - base.iv1Total;

    console.log(`\n  📊 DELTA sau khi ban ${SALE_AMT}đ:`);
    console.log(`     totalIncome:      +${dIncome}  (expected +${SALE_AMT})`);
    console.log(`     totalExpense:     +${dExpense}  (expected +0)`);
    console.log(`     totalFundBalance: +${dFundBalance}  (expected +${SALE_AMT})`);
    console.log(`     cashbookIn count: +${dCbInCnt}  (expected +1)`);
    console.log(`     cashbookIn sum:   +${dCbInSum}  (expected +${SALE_AMT})`);
    console.log(`     cashbookOut cnt:  +${dCbOutCnt}  (expected +0)`);
    console.log(`     invoice IV1 cnt:  +${dIv1Cnt}  (expected +1)`);
    console.log(`     invoice IV1 total: +${dIv1Total}  (expected +${SALE_AMT})`);

    // Assertions
    t.assert("A-02", dIv1Cnt === 1, `Invoice IV1 +1: ${dIv1Cnt}`);
    t.assert("A-03", dIv1Total === SALE_AMT,
      `Invoice IV1 total +${SALE_AMT}: ${dIv1Total}`);

    if (dIncome === SALE_AMT) {
      t.assert("A-04", true, `Finance dashboard income +${SALE_AMT} ✓`);
    } else {
      logBeBug("A", "HIGH",
        `Finance dashboard income KHONG tang dung: delta=${dIncome}, expected ${SALE_AMT}`,
        `base=${base.totalIncome}, after=${afterSale.totalIncome}`);
      t.assert("A-04", false, `Income delta sai: ${dIncome}`);
    }

    if (dCbInCnt === 1) {
      t.assert("A-05", true, `Cashbook entry thu +1 ✓`);
    } else {
      logBeBug("A", "HIGH",
        `Cashbook thu KHONG co entry moi: delta count=${dCbInCnt}`,
        `Latest: ${JSON.stringify(afterSale._cbInLatest?.[0] || {}).slice(0, 200)}`);
      t.assert("A-05", false, `Cashbook thu count sai: ${dCbInCnt}`);
    }

    if (dCbInSum === SALE_AMT) {
      t.assert("A-06", true, `Cashbook thu sum +${SALE_AMT} ✓`);
    } else {
      logBeBug("A", "HIGH",
        `Cashbook thu sum KHONG khop: delta=${dCbInSum}, expected ${SALE_AMT}`);
      t.assert("A-06", false, `Cashbook sum sai: ${dCbInSum}`);
    }

    // Check link cashbook ↔ invoice
    const latestCbIn = afterSale._cbInLatest?.[0];
    if (latestCbIn) {
      console.log(`  [A-DBG] Latest cashbook-in: invoiceId=${latestCbIn.invoiceId}, amount=${latestCbIn.amount}, fundId=${latestCbIn.fundId}, type=${latestCbIn.type}, note="${latestCbIn.note}"`);
      const linkOk = Number(latestCbIn.invoiceId) === Number(sale.invoiceId);
      t.assert("A-07", linkOk,
        linkOk
          ? `Cashbook link dung invoiceId=${sale.invoiceId}`
          : `Cashbook invoiceId=${latestCbIn.invoiceId} ≠ sale=${sale.invoiceId}`);
    }

    t.assert("A-08", dCbOutCnt === 0, `Bán khong tao cashbook chi: delta=${dCbOutCnt}`);

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO B — TRẢ TOÀN BỘ (REFUND)
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO B — TRA TOAN BO don vua ban + verify hoan tien");
    console.log("═".repeat(70));

    const retItemsRes = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${sale.invoiceId}`);
    const retResult = retItemsRes.body?.result || {};
    const lstBP = retResult.lstBoughtProduct || retResult.products || [];
    if (lstBP.length === 0) {
      logBeBug("B", "HIGH", "get/return tra rong cho don vua ban");
      throw new Error("B blocked: no return items");
    }
    const origItem = lstBP[0];
    const returnBody = {
      invoice: {
        referId:      sale.invoiceId,
        customerId:   retResult.customerId ?? -1,
        amount:       SALE_AMT,
        fee:          SALE_AMT,
        paid:         SALE_AMT,
        debt:         0,
        discount:     0,
        vatAmount:    0,
        paymentType:  1,
        reason:       "Khách hàng đổi ý",
        refundMethod: 1,
        note:         `E2E full refund ${RID}`,
      },
      lstBoughtProduct: [{
        productId:   origItem.productId,
        variantId:   origItem.variantId,
        unitId:      origItem.unitId,
        quantity:    SALE_QTY, qty: SALE_QTY,
        price:       origItem.price,
        fee:         origItem.price * SALE_QTY,
        discount: 0, discountUnit: 2,
        inventoryId: origItem.inventoryId,
        name:        origItem.name,
      }],
      lstService: [], lstCardService: [],
    };
    const createRet = await apiPost(t, "/bizapi/sales/invoice/create/return", returnBody);
    t.assert("B-01", createRet.body?.code === 0,
      `create/return: code=${createRet.body?.code}`);
    if (createRet.body?.code !== 0) {
      logBeBug("B", "HIGH", "create/return fail",
        JSON.stringify(createRet.body).slice(0, 200));
      throw new Error("B create return fail");
    }

    const retId = createRet.body.result?.id || createRet.body.result?.invoice?.id;
    const conf = await apiPost(t,
      `/bizapi/sales/invoice/return/confirm?id=${retId}`, {});
    t.assert("B-02", conf.body?.code === 0,
      `return/confirm: code=${conf.body?.code}`);
    if (conf.body?.code !== 0) {
      logBeBug("B", "HIGH", "confirm fail", JSON.stringify(conf.body).slice(0, 200));
      throw new Error("B confirm fail");
    }

    // Wait BE process cashbook expense entry
    await new Promise((r) => setTimeout(r, 4000));

    // Verify return invoice thực sự tồn tại với type IV2
    const retInvDetail = await getInvoiceDetail(t, retId);
    console.log(`  [B-DBG] Return invoice detail: id=${retInvDetail?.id}, type=${retInvDetail?.invoiceType}, fee=${retInvDetail?.fee}, referId=${retInvDetail?.referId}`);
    t.assert("B-03",
      retInvDetail?.invoiceType === "IV2" && Number(retInvDetail?.fee) === SALE_AMT,
      `Return invoice IV2 tao dung: id=${retId}, type=${retInvDetail?.invoiceType}, fee=${retInvDetail?.fee}`);

    const afterReturn = await getFinanceSnapshot(t, "after-return");
    printSnapshot("SAU KHI TRA HANG", afterReturn);

    const dIncome2      = afterReturn.totalIncome      - afterSale.totalIncome;
    const dExpense2     = afterReturn.totalExpense     - afterSale.totalExpense;
    const dFundBalance2 = afterReturn.totalFundBalance - afterSale.totalFundBalance;
    const dCbInCnt2     = afterReturn.cashbookIncomeCount  - afterSale.cashbookIncomeCount;
    const dCbOutCnt2    = afterReturn.cashbookExpenseCount - afterSale.cashbookExpenseCount;
    const dCbOutSum2    = afterReturn.cashbookExpenseSum   - afterSale.cashbookExpenseSum;
    const dRefundCnt    = afterReturn.refundEntriesCount   - afterSale.refundEntriesCount;

    console.log(`\n  📊 DELTA sau khi TRA ${SALE_AMT}đ:`);
    console.log(`     totalIncome:      ${dIncome2 >= 0 ? '+' : ''}${dIncome2}  (expected 0)`);
    console.log(`     totalExpense:     +${dExpense2}  (expected +${SALE_AMT})`);
    console.log(`     totalFundBalance: ${dFundBalance2 >= 0 ? '+' : ''}${dFundBalance2}  (expected -${SALE_AMT})`);
    console.log(`     cashbookIn count: +${dCbInCnt2}  (expected +0)`);
    console.log(`     cashbookOut cnt:  +${dCbOutCnt2}  (expected +1)`);
    console.log(`     cashbookOut sum:  +${dCbOutSum2}  (expected +${SALE_AMT})`);
    console.log(`     refund entries (link invoice): +${dRefundCnt}  (expected +1)`);

    if (dCbOutCnt2 === 1) {
      t.assert("B-04", true, `Cashbook chi +1 entry ✓`);
    } else {
      logBeBug("B", "HIGH",
        `Cashbook chi KHONG co entry moi: delta=${dCbOutCnt2}`,
        `Latest: ${JSON.stringify(afterReturn._cbOutLatest?.[0] || {}).slice(0, 200)}`);
      t.assert("B-04", false, `Cashbook chi count sai: ${dCbOutCnt2}`);
    }

    if (dCbOutSum2 === SALE_AMT) {
      t.assert("B-05", true, `Cashbook chi sum +${SALE_AMT} ✓`);
    } else {
      logBeBug("B", "HIGH",
        `Cashbook chi sum KHONG khop refund: delta=${dCbOutSum2}, expected ${SALE_AMT}`);
      t.assert("B-05", false, `Cashbook chi sum sai: ${dCbOutSum2}`);
    }

    if (dExpense2 === SALE_AMT) {
      t.assert("B-06", true, `Finance dashboard expense +${SALE_AMT} ✓`);
    } else {
      logBeBug("B", "HIGH",
        `Finance dashboard expense KHONG tang dung: delta=${dExpense2}, expected ${SALE_AMT}`);
      t.assert("B-06", false, `Expense delta sai: ${dExpense2}`);
    }

    if (dFundBalance2 === -SALE_AMT) {
      t.assert("B-07", true, `Fund balance GIAM -${SALE_AMT} ✓ (tien quy giam do hoan khach)`);
    } else {
      logBeBug("B", "HIGH",
        `Fund balance KHONG giam dung: delta=${dFundBalance2}, expected -${SALE_AMT}`);
      t.assert("B-07", false, `Fund balance delta sai: ${dFundBalance2}`);
    }

    t.assert("B-08", dCbInCnt2 === 0, `Tra hang khong tao cashbook thu: delta=${dCbInCnt2}`);

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO C — CONSISTENCY CHECK (end-to-end)
    // Sau ban+tra, net delta so voi baseline phai = 0 (hoan thanh toan chu ky)
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO C — CONSISTENCY (net delta phai = 0 sau ban+tra)");
    console.log("═".repeat(70));

    const netFund   = afterReturn.totalFundBalance - base.totalFundBalance;
    const netIncome = afterReturn.totalIncome      - base.totalIncome;
    const netExp    = afterReturn.totalExpense     - base.totalExpense;

    console.log(`  Net delta (ban + tra):`);
    console.log(`     Fund balance: ${netFund}  (expected 0 — tien quy tro ve)`);
    console.log(`     Income:       +${netIncome}  (giu nguyen accounting don ban)`);
    console.log(`     Expense:      +${netExp}  (giu nguyen accounting don tra)`);
    console.log(`     Income - Expense = ${netIncome - netExp}  (expected 0)`);

    t.assert("C-01", netFund === 0,
      netFund === 0
        ? `✅ Fund balance tro ve nguyen baseline (chu ky hoan thanh)`
        : `BUG: fund balance net = ${netFund} (expected 0)`);

    t.assert("C-02", netIncome - netExp === 0,
      netIncome - netExp === 0
        ? `✅ Income - Expense = 0 (net P/L chu ky = 0)`
        : `BUG: net income-expense = ${netIncome - netExp}`);

    // Consistency: dashboard income ↔ cashbook thu sum
    const dashIncomeDelta   = afterSale.totalIncome    - base.totalIncome;
    const cbIncomeDelta     = afterSale.cashbookIncomeSum - base.cashbookIncomeSum;
    t.assert("C-03", dashIncomeDelta === cbIncomeDelta,
      dashIncomeDelta === cbIncomeDelta
        ? `✅ Dashboard income delta (${dashIncomeDelta}) = Cashbook sum delta (${cbIncomeDelta})`
        : `Inconsistent: dashboard=${dashIncomeDelta}, cashbook=${cbIncomeDelta}`);

    const dashExpDelta    = afterReturn.totalExpense      - afterSale.totalExpense;
    const cbExpDelta      = afterReturn.cashbookExpenseSum - afterSale.cashbookExpenseSum;
    t.assert("C-04", dashExpDelta === cbExpDelta,
      dashExpDelta === cbExpDelta
        ? `✅ Dashboard expense delta (${dashExpDelta}) = Cashbook sum delta (${cbExpDelta})`
        : `Inconsistent: dashboard=${dashExpDelta}, cashbook=${cbExpDelta}`);

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
  }

  // ── BUG REPORT ──────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(70));
  console.log("  BUG REPORT");
  console.log("═".repeat(70));
  console.log(`\n🐛 UI BUGS (${uiBugs.length}):`);
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n📋 KEY FINDINGS:`);
  findings.forEach((f, i) => console.log(`  ${i + 1}. [${f.step}] ${f.msg}`));

  await t.done();
  const critical = beBugs.filter(b => b.severity === "HIGH" || b.severity === "CRITICAL").length
                 + uiBugs.filter(b => ["HIGH", "CRITICAL", "BLOCKER"].includes(b.severity)).length;
  process.exit(critical > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
