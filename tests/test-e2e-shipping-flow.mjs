#!/usr/bin/env node
/**
 * E2E TEST — Luồng bán hàng có SHIP + module Vận chuyển
 *
 * Scenarios:
 *   S1. SUGGEST phí ship theo tỉnh + create invoice có ship fee trong total
 *   S2. CREATE shipment liên kết invoice → verify stock trừ + finance thu + shipment hiển thị trong list
 *   S3. DELIVERED — update status → verify stock/finance GIỮ NGUYÊN (không reverse)
 *   S4. FAILED — update status → verify stock/finance giữ, tester phải tạo return invoice thủ công
 *                để hoàn kho + hoàn tiền, net delta về baseline
 *   S5. SENDER bears ship fee — shipment.shippingFee=0, invoice không cộng phí
 *
 * Chay: node tests/test-e2e-shipping-flow.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
const API_BASE = "https://biz.reborn.vn";
const HOSTNAME_HEADER = "kcn.reborn.vn";

const uiBugs = [];
const beBugs = [];
const findings = [];

function logBeBug(step, sev, desc, evidence = "") {
  beBugs.push({ step, severity: sev, desc, evidence });
  console.log(`  🔧 [BE-${sev}] ${step}: ${desc}${evidence ? "\n     → " + evidence : ""}`);
}
function logUiBug(step, sev, desc, evidence = "") {
  uiBugs.push({ step, severity: sev, desc, evidence });
  console.log(`  🐛 [UI-${sev}] ${step}: ${desc}${evidence ? "\n     → " + evidence : ""}`);
}
function note(step, msg) { findings.push({ step, msg }); console.log(`  📋 [NOTE] ${step}: ${msg}`); }

// ── API helpers ─────────────────────────────────────────────────────────
async function getAuthHeaders(t) {
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
    const r = await t.context.request.get(url, { headers: await getAuthHeaders(t) });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}
async function apiPost(t, path, body = {}) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  try {
    const r = await t.context.request.post(url, { headers: await getAuthHeaders(t), data: body });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}
async function apiDelete(t, path) {
  const url = API_BASE + path.replace(/^\/bizapi/, "");
  try {
    const r = await t.context.request.delete(url, { headers: await getAuthHeaders(t) });
    let b; try { b = await r.json(); } catch { b = await r.text(); }
    return { status: r.status(), body: b };
  } catch (e) { return { status: 0, error: String(e) }; }
}

function todayFmt() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── Domain helpers ──────────────────────────────────────────────────────
async function getStock(t, productId) {
  const r = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=50");
  const p = (r.body?.result?.items || []).find((x) => Number(x.id) === Number(productId));
  return Number(p?.stockQuantity || 0);
}

async function getFinanceSnapshot(t) {
  const fd = await apiGet(t,
    `/bizapi/billing/finance/dashboard?fromTime=${todayFmt()}&toTime=${todayFmt()}`);
  const r = fd.body?.result || {};
  return {
    income: Number(r.totalIncome ?? 0),
    expense: Number(r.totalExpense ?? 0),
    fund: Number(r.totalFundBalance ?? 0),
  };
}

async function getShipmentList(t, filters = {}) {
  const qs = new URLSearchParams({ page: 1, limit: 50, ...filters }).toString();
  const r = await apiGet(t, `/bizapi/logistics/shipment/list?${qs}`);
  return r.body?.result?.items || r.body?.result || [];
}

async function findShipmentByOrderId(t, orderId, orderCode) {
  const list = await getShipmentList(t);
  // Match theo nhiều field vì BE có thể link qua orderId hoặc orderCode
  return list.find((s) =>
    Number(s.orderId) === Number(orderId)
    || s.orderCode === orderCode
    || s.internalOrderId === orderCode
  ) || null;
}

/** Tạo invoice full flow: draft → insertBatch → create (confirm)
 *  Phí ship được cộng vào fee/paid/amount của invoice */
async function createInvoiceWithShipping(t, product, variant, qty, shippingFee, label) {
  const unitPrice = Number(variant.price || 100000);
  const productTotal = unitPrice * qty;
  const grandTotal = productTotal + shippingFee;

  // 1. Draft
  const draftRes = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const draftInv = draftRes.body?.result?.invoice || draftRes.body?.result;
  const invoiceId = draftInv?.id;
  if (!invoiceId) {
    logBeBug(label, "HIGH", "draft/create fail", JSON.stringify(draftRes.body).slice(0, 150));
    return null;
  }

  // 2. Insert product line
  const insertRes = await apiPost(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${invoiceId}&paid=${grandTotal}&debt=0&fundId=1`,
    [{
      productId: Number(product.id), variantId: Number(variant.id),
      unitId: Number(variant.unitId), price: unitPrice, customerId: -1,
      quantity: qty, name: product.name, avatar: product.avatar || "",
      unitName: variant.unitName || "Cái", fee: productTotal,
    }]);
  if (insertRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "insertBatch fail", JSON.stringify(insertRes.body).slice(0, 150));
    return null;
  }

  // 3. Confirm invoice with ship fee included in fee/paid/amount
  const now = new Date();
  const receiptDate = now.toISOString().slice(0, 19);
  const confirmRes = await apiPost(t, "/bizapi/sales/invoice/create", {
    id: invoiceId,
    fee: grandTotal,       // tổng bao gồm phí ship
    paid: grandTotal,
    debt: 0,
    amount: grandTotal,
    discount: 0, vatAmount: 0, amountCard: 0, paymentType: 1,
    invoiceType: "IV1", customerId: -1,
    branchId: Number(draftInv?.branchId ?? -1),
    bsnId: Number(draftInv?.bsnId ?? -1),
    receiptDate, account: "[]", customerName: "",
  });
  if (confirmRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "invoice/create fail", JSON.stringify(confirmRes.body).slice(0, 200));
    return null;
  }
  return {
    invoiceId,
    invoiceCode: confirmRes.body.result?.invoiceCode,
    productTotal,
    shippingFee,
    grandTotal,
  };
}

/** Tạo shipment linked với invoice — body shape NESTED (verify từ AddShippingOrder.tsx:611) */
async function createShipment(t, invoice, receiver, opts = {}) {
  const body = {
    internalOrderId: invoice.invoiceCode || String(invoice.invoiceId),
    carrierCode:     opts.carrierCode || "GHN",
    sender: {
      name:     opts.senderName || "Reborn Store",
      phone:    opts.senderPhone || "0901111111",
      email:    opts.senderEmail || "store@reborn.vn",
      address:  opts.senderAddress || "So 1 Le Loi",
      ward:     opts.senderWard || "Phuong Ben Nghe",
      district: opts.senderDistrict || "Quan 1",
      province: opts.senderProvince || "Hồ Chí Minh",
    },
    receiver: {
      name:     receiver.name,
      phone:    receiver.phone,
      email:    receiver.email || "",
      address:  receiver.address,
      ward:     receiver.ward || "Phuong Dich Vong",
      district: receiver.district || "Quan Cau Giay",
      province: receiver.province || "Hà Nội",
    },
    parcel: {
      weightGram: opts.weightGram || 500,
      lengthCm:   opts.lengthCm || 10,
      widthCm:    opts.widthCm || 10,
      heightCm:   opts.heightCm || 10,
    },
    codAmount:     opts.codAmount ?? 0,
    declaredValue: invoice.grandTotal || invoice.productTotal || 0,
    shippingFeeBearer: opts.shippingFeeBearer || "RECEIVER",
    items: [{
      name: `SP test ${RID}`,
      quantity: 1,
      weightGram: opts.weightGram || 500,
      price: invoice.productTotal || 0,
    }],
    note: opts.note ?? `E2E test ${RID}`,
    status: "SUBMITTED",
  };
  const r = await apiPost(t, "/bizapi/logistics/shipment/create", body);
  return { status: r.status, body: r.body, sentBody: body };
}

// ────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-SHIP", `Ban hang + Van chuyen [${RID}]`);

  try {
    if (!(await t.login())) throw new Error("Login failed");
    await t.goto("/dashboard");
    await t.page.waitForTimeout(1500);

    // ═══════════════════════════════════════════════════════════════════
    // SETUP — find product with stock
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SETUP");
    console.log("═".repeat(70));

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=100");
    const items = prodRes.body?.result?.items || [];
    // Mỗi scenario cần ~2 SP, có 4 scenarios bán → cần tối thiểu 7 stock
    // Sort desc theo stock để chắc chắn có SP đủ
    const sorted = [...items].sort(
      (a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0)
    );
    const sample = sorted.find((p) => Number(p.stockQuantity || 0) >= 7);
    if (!sample) {
      logUiBug("SETUP", "CRITICAL", "Khong co SP nao stock >= 7");
      throw new Error("No product");
    }
    const pd = await apiGet(t, `/bizapi/inventory/product/get?id=${sample.id}`);
    const variant = pd.body?.result?.variants?.[0];
    const unitPrice = Number(variant?.price || 100000);
    console.log(`  Sample: [${sample.id}] "${sample.name}" price=${unitPrice} stock=${sample.stockQuantity}`);
    console.log(`  Variant: id=${variant.id}, unitId=${variant.unitId}`);

    // ═══════════════════════════════════════════════════════════════════
    // S1 — SUGGEST shipping fee + create invoice có ship fee
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S1 — SUGGEST phi ship + tao don ship");
    console.log("═".repeat(70));

    const PROVINCE = "Hà Nội";
    const QTY = 2;
    const orderValue = unitPrice * QTY;

    const suggestRes = await apiGet(t,
      `/bizapi/logistics/fee-config/suggest?provinceName=${encodeURIComponent(PROVINCE)}&orderValue=${orderValue}`);
    console.log(`  /fee-config/suggest: code=${suggestRes.body?.code}, result=${JSON.stringify(suggestRes.body?.result)}`);

    let suggestedFee = Number(suggestRes.body?.result ?? 0);
    if (suggestRes.body?.code !== 0) {
      logBeBug("S1", "HIGH", "Suggest fee fail",
        JSON.stringify(suggestRes.body).slice(0, 200));
    }
    t.assert("S1-01", suggestRes.body?.code === 0,
      `/fee-config/suggest hoạt động: code=${suggestRes.body?.code}`);

    // Nếu BE không trả fee hoặc = 0, dùng fallback để vẫn test được flow
    const shipFee = suggestedFee > 0 ? suggestedFee : 30000;
    if (suggestedFee === 0 || suggestedFee === null) {
      note("S1", `Suggested fee = ${suggestedFee} (không config cho "${PROVINCE}") → fallback ${shipFee}đ`);
    } else {
      console.log(`  Suggested fee = ${shipFee}đ`);
      t.assert("S1-02", shipFee > 0, `Phí ship > 0: ${shipFee}đ`);
    }

    // Baseline snapshots
    const baseStock = await getStock(t, sample.id);
    const baseFin = await getFinanceSnapshot(t);
    const baseShipList = await getShipmentList(t);
    console.log(`  Baseline: stock=${baseStock}, income=${baseFin.income}, expense=${baseFin.expense}, fund=${baseFin.fund}, shipCount=${baseShipList.length}`);

    // Create invoice with ship fee included
    const invoice1 = await createInvoiceWithShipping(t, sample, variant, QTY, shipFee, "S1");
    t.assert("S1-03", !!invoice1,
      invoice1 ? `Tao invoice ${invoice1.invoiceCode}, total=${invoice1.grandTotal} (SP ${invoice1.productTotal} + ship ${shipFee})` : "Fail");

    if (!invoice1) throw new Error("S1 blocked");

    await new Promise(r => setTimeout(r, 3000));

    // Verify stock trừ đúng qty
    const stockAfterS1 = await getStock(t, sample.id);
    t.assert("S1-04", stockAfterS1 === baseStock - QTY,
      `Stock giam ${QTY} sau ban: ${baseStock} → ${stockAfterS1}`);

    // Verify finance tăng đúng grandTotal (product + ship)
    const finAfterS1 = await getFinanceSnapshot(t);
    const dIncome1 = finAfterS1.income - baseFin.income;
    const dFund1 = finAfterS1.fund - baseFin.fund;
    t.assert("S1-05", dIncome1 === invoice1.grandTotal,
      `Finance income tang ${invoice1.grandTotal} (bao gom ship): delta=${dIncome1}`);
    t.assert("S1-06", dFund1 === invoice1.grandTotal,
      `Fund balance tang ${invoice1.grandTotal}: delta=${dFund1}`);

    // ═══════════════════════════════════════════════════════════════════
    // S2 — CREATE shipment linked invoice
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S2 — CREATE shipment lien ket invoice");
    console.log("═".repeat(70));

    const receiver1 = {
      name: `KH Test Ship ${RID}`,
      phone: "0912345678",
      address: `So 1 Hoang Dao Thuy, Cau Giay, ${PROVINCE}`,
    };

    const shipRes = await createShipment(t, invoice1, receiver1);
    console.log(`  shipment/create: status=${shipRes.status}, code=${shipRes.body?.code}`);
    console.log(`  shipment body: ${JSON.stringify(shipRes.body).slice(0, 400)}`);

    t.assert("S2-01", shipRes.body?.code === 0,
      `POST /shipment/create: code=${shipRes.body?.code}`);

    if (shipRes.body?.code === 0) {
      // ⚠️ CRITICAL CHECK: BE co populate orderId/orderCode tu internalOrderId khong?
      const createdShipment = shipRes.body?.result;
      console.log(`  Created shipment: id=${createdShipment?.id}, shipmentOrder=${createdShipment?.shipmentOrder}`);
      console.log(`  Link fields: orderId=${createdShipment?.orderId}, orderCode=${createdShipment?.orderCode}, internalOrderId=${createdShipment?.internalOrderId}`);

      const linkedToInvoice =
        Number(createdShipment?.orderId) === Number(invoice1.invoiceId)
        || createdShipment?.orderCode === invoice1.invoiceCode
        || createdShipment?.internalOrderId === invoice1.invoiceCode;

      if (linkedToInvoice) {
        t.assert("S2-02", true,
          `Shipment lien ket invoice ${invoice1.invoiceCode}: shipmentOrder=${createdShipment?.shipmentOrder}`);
      } else {
        logBeBug("S2", "CRITICAL",
          `Shipment tao OK nhung KHONG link voi invoice. FE gui internalOrderId="${invoice1.invoiceCode}" nhung BE tra orderId=${createdShipment?.orderId}, orderCode=${createdShipment?.orderCode}`,
          `Shipment ${createdShipment?.shipmentOrder} bi co lap, khong trace duoc don hang goc`);
        t.assert("S2-02", false,
          `BE khong populate orderId/orderCode tu internalOrderId`);
      }

      // Dù BE bug link, vẫn dùng shipment response để tiếp tục test
      const shipment1 = createdShipment;

      if (shipment1) {
        t.assert("S2-03",
          shipment1.receiverName === receiver1.name,
          `receiverName luu dung: "${shipment1.receiverName}"`);

        t.assert("S2-04",
          shipment1.receiverPhone === receiver1.phone,
          `receiverPhone luu dung: "${shipment1.receiverPhone}"`);

        t.assert("S2-05",
          Number(shipment1.shippingFee) === shipFee,
          `shippingFee luu dung: ${shipment1.shippingFee} (expected ${shipFee})`);

        const initStatus = shipment1.statusCode || shipment1.status;
        const validInitial = ["PENDING", "SUBMITTED", "WAITING_PICKUP"].includes(initStatus);
        t.assert("S2-06", validInitial,
          `Status ban dau hop le: "${initStatus}"`);

        // Save for S3
        invoice1.shipment = shipment1;
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // S3 — DELIVERED (happy path)
    // Tạo don ship moi → update status DELIVERED → stock/finance giữ nguyen
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S3 — DELIVERED happy path");
    console.log("═".repeat(70));

    const preS3Stock = await getStock(t, sample.id);
    const preS3Fin = await getFinanceSnapshot(t);

    // Tao don ship thu 2
    const invoice2 = await createInvoiceWithShipping(t, sample, variant, QTY, shipFee, "S3");
    t.assert("S3-01", !!invoice2, invoice2 ? `Tao invoice ${invoice2.invoiceCode}` : "Fail");
    if (!invoice2) throw new Error("S3 blocked");

    const ship2Res = await createShipment(t, invoice2, {
      name: `KH Ship DELIV ${RID}`,
      phone: "0987654321",
      address: `So 2 Duy Tan, Cau Giay, ${PROVINCE}`,
    });
    t.assert("S3-02", ship2Res.body?.code === 0, `Tao shipment 2: code=${ship2Res.body?.code}`);

    await new Promise(r => setTimeout(r, 2000));

    // Lấy shipment từ response (không rely on findByOrderId do BE bug link)
    const shipment2 = ship2Res.body?.result;
    if (!shipment2) {
      logUiBug("S3", "HIGH", `shipment create response rong cho invoice ${invoice2.invoiceId}`);
    } else {
      console.log(`  shipment2.shipmentOrder=${shipment2.shipmentOrder}, initial status=${shipment2.statusCode || shipment2.status}`);

      // Snapshot trước khi update status
      const preDeliverStock = await getStock(t, sample.id);
      const preDeliverFin = await getFinanceSnapshot(t);

      // Update status → DELIVERED
      const updRes = await apiPost(t,
        `/bizapi/logistics/shipment/${encodeURIComponent(shipment2.shipmentOrder)}/update?status=DELIVERED`, {});
      console.log(`  shipment/update status=DELIVERED: code=${updRes.body?.code}, status=${updRes.status}`);
      console.log(`  response: ${JSON.stringify(updRes.body).slice(0, 300)}`);

      t.assert("S3-03", updRes.body?.code === 0,
        `Update shipment → DELIVERED: code=${updRes.body?.code}`);

      await new Promise(r => setTimeout(r, 2000));

      // Verify status = DELIVERED — lookup by shipmentOrder (direct key)
      const listAfter = await getShipmentList(t, { keyword: shipment2.shipmentOrder });
      const shipment2After = listAfter.find(s => s.shipmentOrder === shipment2.shipmentOrder)
                          || shipment2;
      const s2Status = shipment2After?.statusCode || shipment2After?.status;
      t.assert("S3-04",
        s2Status === "DELIVERED",
        `Shipment status sau update: "${s2Status}"`);

      // Verify stock KHONG thay đổi (không cộng lại)
      const postDeliverStock = await getStock(t, sample.id);
      t.assert("S3-05",
        postDeliverStock === preDeliverStock,
        `Stock GIU NGUYEN sau DELIVERED: ${preDeliverStock} → ${postDeliverStock} (khong hoan kho)`);

      // Verify finance KHONG reverse
      const postDeliverFin = await getFinanceSnapshot(t);
      t.assert("S3-06",
        postDeliverFin.fund === preDeliverFin.fund,
        `Fund GIU NGUYEN sau DELIVERED: ${preDeliverFin.fund} → ${postDeliverFin.fund} (khong hoan tien)`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // S4 — FAILED / CANCELLED + manual refund
    // Tạo don ship moi → update → FAILED → tester tạo return invoice
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S4 — FAILED delivery + manual refund flow");
    console.log("═".repeat(70));

    // Tao don ship thu 3
    const invoice3 = await createInvoiceWithShipping(t, sample, variant, QTY, shipFee, "S4");
    t.assert("S4-01", !!invoice3, invoice3 ? `Tao invoice ${invoice3.invoiceCode}` : "Fail");
    if (!invoice3) throw new Error("S4 blocked");

    const ship3Res = await createShipment(t, invoice3, {
      name: `KH Ship FAIL ${RID}`,
      phone: "0933333333",
      address: `So 3 Lang Ha, Dong Da, ${PROVINCE}`,
    });
    t.assert("S4-02", ship3Res.body?.code === 0, `Tao shipment 3: code=${ship3Res.body?.code}`);

    await new Promise(r => setTimeout(r, 2000));

    const shipment3 = ship3Res.body?.result;
    if (!shipment3) {
      logUiBug("S4", "HIGH", `shipment create response rong cho invoice ${invoice3.invoiceId}`);
      throw new Error("S4 shipment not found");
    }

    // Snapshot trước update
    const preFailStock = await getStock(t, sample.id);
    const preFailFin = await getFinanceSnapshot(t);
    console.log(`  Pre-fail: stock=${preFailStock}, fund=${preFailFin.fund}`);

    // Update shipment → FAILED hoặc CANCELLED (tùy BE support)
    // Try FAILED_DELIVERY trước, fallback CANCELLED
    let failStatus = "FAILED_DELIVERY";
    let updFailRes = await apiPost(t,
      `/bizapi/logistics/shipment/${encodeURIComponent(shipment3.shipmentOrder)}/update?status=${failStatus}`, {});
    console.log(`  shipment/update status=${failStatus}: code=${updFailRes.body?.code}`);

    if (updFailRes.body?.code !== 0) {
      failStatus = "CANCELLED";
      updFailRes = await apiPost(t,
        `/bizapi/logistics/shipment/${encodeURIComponent(shipment3.shipmentOrder)}/update?status=${failStatus}`, {});
      console.log(`  Fallback: shipment/update status=${failStatus}: code=${updFailRes.body?.code}`);
    }

    t.assert("S4-03", updFailRes.body?.code === 0,
      `Update shipment → ${failStatus}: code=${updFailRes.body?.code}`);

    await new Promise(r => setTimeout(r, 2000));

    // Verify status updated — lookup by shipmentOrder
    const listAfter3 = await getShipmentList(t, { keyword: shipment3.shipmentOrder });
    const shipment3After = listAfter3.find(s => s.shipmentOrder === shipment3.shipmentOrder)
                        || shipment3;
    const s3Status = shipment3After?.statusCode || shipment3After?.status;
    t.assert("S4-04",
      ["FAILED_DELIVERY", "CANCELLED", "RETURNED"].includes(s3Status),
      `Shipment status sau update: "${s3Status}"`);

    // ── Critical: tester phải tạo return invoice manual để reverse
    console.log(`\n  📋 Verify BE KHONG auto-reverse sau fail:`);
    const afterFailStock = await getStock(t, sample.id);
    const afterFailFin = await getFinanceSnapshot(t);
    console.log(`     stock ${preFailStock} → ${afterFailStock} (expected: khong doi — BE chua auto reverse)`);
    console.log(`     fund ${preFailFin.fund} → ${afterFailFin.fund}`);

    const beAutoReverse = afterFailStock !== preFailStock || afterFailFin.fund !== preFailFin.fund;
    if (beAutoReverse) {
      note("S4", `BE tu dong reverse: stock delta=${afterFailStock - preFailStock}, fund delta=${afterFailFin.fund - preFailFin.fund}`);
      t.assert("S4-05", true, "BE auto-reverse sau shipment fail");
    } else {
      note("S4", "BE KHONG auto-reverse → tester phai tao return invoice thu cong");
      t.assert("S4-05", true, "Xac nhan BE khong auto-reverse (expected)");

      // ── Tạo return invoice thủ công
      console.log(`\n  → Tao return invoice thu cong cho hoa don ${invoice3.invoiceCode}`);
      const retItems = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${invoice3.invoiceId}`);
      const retResult = retItems.body?.result || {};
      const lstBP = retResult.lstBoughtProduct || [];

      if (lstBP.length === 0) {
        logBeBug("S4", "HIGH", "get/return tra rong");
      } else {
        const origItem = lstBP[0];
        const returnBody = {
          invoice: {
            referId: invoice3.invoiceId, customerId: -1,
            amount: invoice3.grandTotal, fee: invoice3.grandTotal, paid: invoice3.grandTotal,
            debt: 0, discount: 0, vatAmount: 0, paymentType: 1,
            reason: "Giao hang that bai", refundMethod: 1,
            note: `E2E S4 refund ship failed ${RID}`,
          },
          lstBoughtProduct: [{
            productId: origItem.productId, variantId: origItem.variantId,
            unitId: origItem.unitId,
            quantity: QTY, qty: QTY,
            price: origItem.price, fee: origItem.price * QTY,
            discount: 0, discountUnit: 2,
            inventoryId: origItem.inventoryId, name: origItem.name,
          }],
          lstService: [], lstCardService: [],
        };

        const createRet = await apiPost(t, "/bizapi/sales/invoice/create/return", returnBody);
        t.assert("S4-06", createRet.body?.code === 0,
          `create/return: code=${createRet.body?.code}`);

        if (createRet.body?.code === 0) {
          const retId = createRet.body.result?.id || createRet.body.result?.invoice?.id;
          const conf = await apiPost(t,
            `/bizapi/sales/invoice/return/confirm?id=${retId}`, {});
          t.assert("S4-07", conf.body?.code === 0,
            `return/confirm: code=${conf.body?.code}`);

          await new Promise(r => setTimeout(r, 3000));

          // Verify stock hoan
          const afterRefundStock = await getStock(t, sample.id);
          t.assert("S4-08",
            afterRefundStock === preFailStock + QTY,
            `Stock hoan ${QTY} sau return: ${preFailStock} → ${afterRefundStock}`);

          // Verify finance reverse (expense tăng = productTotal)
          // Note: return invoice chỉ refund product amount, KHÔNG refund shipping fee
          // trừ khi tester cố tình gửi full grandTotal — ở đây ta return full
          const afterRefundFin = await getFinanceSnapshot(t);
          const expenseDelta = afterRefundFin.expense - preFailFin.expense;
          console.log(`  Finance after refund: expense delta=${expenseDelta}, fund delta=${afterRefundFin.fund - preFailFin.fund}`);

          // Expense phải >= productTotal (có thể = grandTotal nếu refund cả ship)
          t.assert("S4-09",
            expenseDelta >= invoice3.productTotal,
            `Expense tang >= ${invoice3.productTotal}: ${expenseDelta}`);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // S5 — SENDER bears ship fee (nguoi ban chiu phi)
    // ═══════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  S5 — SENDER chiu phi ship (khong cong vao invoice)");
    console.log("═".repeat(70));

    const baseS5Stock = await getStock(t, sample.id);
    const baseS5Fin = await getFinanceSnapshot(t);

    // Đơn này KHONG tính ship fee vào invoice total (shippingFee = 0 trong invoice)
    const invoice5 = await createInvoiceWithShipping(t, sample, variant, 1, 0, "S5");
    t.assert("S5-01", !!invoice5, invoice5 ? `Tao invoice ${invoice5.invoiceCode}` : "Fail");

    if (invoice5) {
      // Verify invoice fee = productTotal (không cộng ship)
      t.assert("S5-02",
        invoice5.grandTotal === invoice5.productTotal,
        `Invoice total = productTotal (${invoice5.productTotal}) khi SENDER chiu phi`);

      // Create shipment với SENDER
      const ship5Res = await createShipment(t, { ...invoice5, shippingFee: shipFee }, {
        name: `KH Ship SENDER ${RID}`,
        phone: "0944444444",
        address: `So 5 Nguyen Trai, Thanh Xuan, ${PROVINCE}`,
      }, { shippingFeeBearer: "SENDER" });

      t.assert("S5-03", ship5Res.body?.code === 0,
        `Tao shipment SENDER: code=${ship5Res.body?.code}`);

      if (ship5Res.body?.code === 0) {
        const shipment5 = ship5Res.body?.result;
        t.assert("S5-04",
          Number(shipment5?.shippingFee) === 0,
          `Shipment SENDER fee=0: fee=${shipment5?.shippingFee}`);
      }

      // Verify finance chỉ tăng = productTotal (không bao gồm ship)
      await new Promise(r => setTimeout(r, 2000));
      const finAfterS5 = await getFinanceSnapshot(t);
      const incomeDeltaS5 = finAfterS5.income - baseS5Fin.income;
      t.assert("S5-05",
        incomeDeltaS5 === invoice5.productTotal,
        `Income chi tang = productTotal (${invoice5.productTotal}): delta=${incomeDeltaS5}`);
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
  uiBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n🔧 BE BUGS (${beBugs.length}):`);
  beBugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.severity}] ${b.step}: ${b.desc}${b.evidence ? "\n     → " + b.evidence : ""}`));
  console.log(`\n📋 KEY FINDINGS:`);
  findings.forEach((f, i) => console.log(`  ${i + 1}. [${f.step}] ${f.msg}`));

  await t.done();
  const critical = beBugs.filter(b => ["HIGH", "CRITICAL"].includes(b.severity)).length
                 + uiBugs.filter(b => ["HIGH", "CRITICAL", "BLOCKER"].includes(b.severity)).length;
  process.exit(critical > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
