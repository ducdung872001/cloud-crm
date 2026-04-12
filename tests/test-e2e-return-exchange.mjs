#!/usr/bin/env node
/**
 * E2E TEST — Luồng Đổi / Trả hàng
 *
 * 3 kịch bản:
 *   S1. Trả 1 PHẦN  — bán 3 SP → trả lại 1 SP → verify stock +1
 *   S2. Trả TOÀN BỘ (hủy đơn) — bán 2 SP → trả 2 SP → verify stock restored
 *   S3. ĐỔI hàng   — bán SP A qty=1 → đổi lấy SP B qty=1 → verify A +1, B -1
 *
 * QUAN TRỌNG: Sau mỗi scenario, verify `stockQuantity` (POS unfiltered)
 * quay về đúng lượng ban đầu cộng/trừ đúng delta.
 *
 * Approach:
 *  - Tạo đơn POS qua UI (re-use helpers từ VAT test)
 *  - Gọi return/exchange APIs trực tiếp qua Node-level request (nhanh + reliable)
 *  - Verify stock qua /inventory/product/list (đã confirm chỉ sum selling WH)
 *
 * Chay: node tests/test-e2e-return-exchange.mjs
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

// ── API helpers (Node-level, bypass CORS) ─────────────────────────────────
async function getAuthHeaders(t) {
  const cookies = await t.context.cookies();
  const tk = cookies.find((c) => c.name === "token");
  const headers = {
    "Hostname": HOSTNAME_HEADER,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  if (tk) headers["Authorization"] = `Bearer ${tk.value}`;
  return headers;
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

/** Get stockQuantity (POS unfiltered) cho 1 productId */
async function getStock(t, productId) {
  const r = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=50");
  const items = r.body?.result?.items || [];
  const p = items.find((x) => Number(x.id) === Number(productId));
  return Number(p?.stockQuantity || 0);
}

/** Tìm 2 sản phẩm có stock ≥ minStock — cần cho test đổi hàng (A → B) */
async function findTwoProducts(t, minStock) {
  const r = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=50");
  const items = r.body?.result?.items || [];
  const withStock = items.filter((p) => Number(p.stockQuantity || 0) >= minStock);
  return withStock.slice(0, 2);
}

// ── Direct API sale creation (avoid UI flakiness) ──────────────────────
/** Tạo đơn POS đầy đủ qua API — bypass UI.
 *  Returns { invoiceId, invoiceCode, origItem } or null on failure */
async function createSaleViaApi(t, product, variant, qty, label) {
  const unitPrice = Number(variant.price || product.originalPrice || product.promotionPrice || 100000);
  const total = unitPrice * qty;

  // 1. Create draft invoice
  const draftRes = await apiGet(t,
    `/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=`);
  const draftInv = draftRes.body?.result?.invoice || draftRes.body?.result;
  const invoiceId = draftInv?.id;
  if (!invoiceId) {
    logBeBug(label, "HIGH", "draft/create fail",
      JSON.stringify(draftRes.body).slice(0, 200));
    return null;
  }

  // 2. Insert bought_product
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
  const insertUrl = `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${invoiceId}&paid=${total}&debt=0&fundId=1`;
  const insertRes = await apiPost(t, insertUrl, boughtBody);
  if (insertRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "insertBatch fail",
      JSON.stringify(insertRes.body).slice(0, 200));
    return null;
  }
  const origItem = Array.isArray(insertRes.body?.result) ? insertRes.body.result[0] : null;

  // 3. Confirm payment via /invoice/create (this deducts stock via publishSaleInventoryEvent)
  const now = new Date();
  const receiptDate = now.toISOString().slice(0, 19);
  const createBody = {
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
  };
  const confirmRes = await apiPost(t, "/bizapi/sales/invoice/create", createBody);
  if (confirmRes.body?.code !== 0) {
    logBeBug(label, "HIGH", "invoice/create (confirm) fail",
      JSON.stringify(confirmRes.body).slice(0, 200));
    return null;
  }
  const invoiceCode = confirmRes.body?.result?.invoiceCode;
  return { invoiceId, invoiceCode, origItem };
}

/** Lấy variant + unitId cho 1 sản phẩm */
async function getVariant(t, productId) {
  const r = await apiGet(t, `/bizapi/inventory/product/get?id=${productId}`);
  const pd = r.body?.result;
  return pd?.variants?.[0] || null;
}

// ── UI helpers (kept for possible fallback) ──────────────────────────────
async function selectWalkInCustomer(t) {
  const custBox = await t.page.$('.cust-box, .cust-placeholder');
  if (!custBox) return false;
  await custBox.click({ force: true });
  await t.page.waitForTimeout(2000);
  // Click walk-in row (đầu tiên)
  const clicked = await t.page.evaluate(() => {
    const items = [...document.querySelectorAll('.customer-modal .cust-item')];
    const walkin = items.find((i) => i.innerText?.includes("Khách vãng lai"));
    if (walkin) { walkin.click(); return true; }
    return false;
  });
  await t.page.waitForTimeout(1500);
  return clicked;
}

/** Thêm 1 SP cụ thể vào cart với qty. Trả về true nếu ok */
async function addProductByName(t, productName, qty) {
  const search = await t.page.$('input[placeholder*="Tìm sản phẩm"], input[placeholder*="tìm sản phẩm"], input[placeholder*="SKU"]');
  if (!search) { logUiBug("ADD-PROD", "CRITICAL", "Khong tim thay search input POS"); return false; }
  await search.fill("");
  await t.page.waitForTimeout(500);
  await search.fill(productName);
  await t.page.waitForTimeout(2500);

  const cardClicked = await t.page.evaluate((name) => {
    const cards = [...document.querySelectorAll('.pg-card')].filter(c => c.offsetHeight > 0);
    const target = cards.find(c => c.innerText?.includes(name)
      && !c.classList.contains("pg-card--out")
      && !c.innerText?.includes("Hết hàng"));
    if (target) { target.click(); return target.innerText?.replace(/\s+/g, " ").slice(0, 60); }
    return null;
  }, productName);
  if (!cardClicked) { logUiBug("ADD-PROD", "HIGH", `Khong tim thay card "${productName}"`); return false; }
  await t.page.waitForTimeout(1500);

  // Handle variant modal if opens
  if (await t.exists('.variant-modal, .modal.show')) {
    await t.page.evaluate(() => {
      const groups = [...document.querySelectorAll('.variant-modal__group')];
      for (const g of groups) {
        const opts = [...g.querySelectorAll('.variant-opt:not(.variant-opt--unavailable):not(.variant-opt--selected)')];
        if (opts[0]) opts[0].click();
      }
    });
    await t.page.waitForTimeout(600);
    await t.page.evaluate(() => {
      const b = [...document.querySelectorAll('button')].find(x => x.innerText?.includes("Thêm vào giỏ") && !x.disabled);
      if (b) b.click();
    });
    await t.page.waitForTimeout(1500);
  }

  // Increase qty bằng cách click + btn
  if (qty > 1) {
    for (let i = 1; i < qty; i++) {
      await t.page.evaluate(() => {
        const qbs = [...document.querySelectorAll('.ci .qb')];
        const plus = qbs.find((b) => b.innerText?.trim() === "+");
        if (plus) plus.click();
      });
      await t.page.waitForTimeout(200);
    }
  }
  return true;
}

async function captureAllPOSTs(t) {
  const captured = [];
  const listener = async (res) => {
    if (res.request().method() === "POST") {
      try { captured.push({ url: res.url(), status: res.status(), body: await res.json() }); }
      catch { captured.push({ url: res.url(), status: res.status(), body: "(non-json)" }); }
    }
  };
  t.page.on("response", listener);
  return { captured, stop: () => t.page.off("response", listener) };
}

/** Full POS flow: pay-btn → PayModal → Tạo HĐ → ReceiptModal → Xác nhận TT
 *  Return { invoiceId, invoiceCode } or null on failure */
async function completePOSPayment(t) {
  const posts = await captureAllPOSTs(t);

  const payBtn = await t.page.$('.pay-btn:not([disabled])');
  if (!payBtn) { logUiBug("PAY", "CRITICAL", "Khong tim .pay-btn"); posts.stop(); return null; }
  await payBtn.click({ force: true });
  await t.page.waitForTimeout(3000);

  const taoHD = await t.page.$('button:has-text("Tạo hoá đơn"):not([disabled]), button:has-text("Tạo hóa đơn"):not([disabled])');
  if (taoHD) { await taoHD.click({ force: true }); await t.page.waitForTimeout(3500); }

  const xacNhan = await t.page.evaluate(() => {
    const b = [...document.querySelectorAll('.modal.show button, .receipt-modal button')]
      .find(x => x.innerText?.includes("Xác nhận thanh toán") && !x.disabled);
    if (b) { b.click(); return true; }
    return false;
  });
  await t.page.waitForTimeout(5000);
  posts.stop();

  // Close receipt modal
  await t.page.evaluate(() => {
    const b = [...document.querySelectorAll('.modal.show button')]
      .find(x => x.innerText?.includes("Đóng") || x.innerText?.includes("Hoàn tất") || x.innerText?.includes("mới"));
    if (b) b.click();
  }).catch(() => {});
  await t.page.waitForTimeout(1000);
  await t.page.keyboard.press("Escape").catch(() => {});

  if (!xacNhan) { logUiBug("PAY", "HIGH", "Khong click duoc Xac nhan thanh toan"); return null; }

  const createInv = posts.captured.find((r) => /invoice\/create(?!\/return|\/exchange)/i.test(r.url));
  if (createInv?.body?.code !== 0) {
    logUiBug("PAY", "HIGH", "invoice/create fail",
      JSON.stringify(createInv?.body || {}).slice(0, 200));
    return null;
  }
  return {
    invoiceId:   createInv.body.result?.id,
    invoiceCode: createInv.body.result?.invoiceCode,
  };
}

/** Tạo đơn đầy đủ: goto POS → chọn KH → thêm SP → thanh toán */
async function createFullSale(t, productName, qty, label) {
  await t.goto("/create_sale_add");
  await t.page.waitForTimeout(3500);
  // Make sure on POS tab
  await t.page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tb')];
    const pos = tabs.find(x => x.innerText?.includes("Bán hàng"));
    if (pos) pos.click();
  });
  await t.page.waitForTimeout(1500);

  const custOk = await selectWalkInCustomer(t);
  if (!custOk) { logUiBug(label, "HIGH", "Khong chon duoc KH vang lai"); return null; }

  const prodOk = await addProductByName(t, productName, qty);
  if (!prodOk) { logUiBug(label, "HIGH", `Khong them duoc "${productName}" (qty=${qty})`); return null; }

  await t.screenshot(`${label.toLowerCase()}-cart-ready`);
  const result = await completePOSPayment(t);
  if (result) {
    note(label, `Tao don ${result.invoiceCode} (id=${result.invoiceId}) — ${productName} x${qty}`);
  }
  return result;
}

// ────────────────────────────────────────────────────────────────────────────
async function main() {
  const t = await createTestRunner("E2E-RETURN", `Doi Tra hang [${RID}]`);

  try {
    if (!(await t.login())) throw new Error("Login failed");

    // ════════════════════════════════════════════════════════════════════
    // SETUP — tìm 2 sản phẩm đủ stock cho cả 3 scenarios
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SETUP — Tim SP du stock");
    console.log("═".repeat(70));

    // Total stock cần: S1(3) + S2(2) + S3(1) = 6 cho SP A
    //                  S3(1) cho SP B
    const products = await findTwoProducts(t, 2);
    if (products.length < 2) {
      logUiBug("SETUP", "CRITICAL",
        `Can it nhat 2 SP co stock ≥ 2. Hien tai: ${products.length}`);
      throw new Error("Not enough products");
    }
    const prodA = products[0];
    const prodB = products[1];
    const stockA0 = Number(prodA.stockQuantity);
    const stockB0 = Number(prodB.stockQuantity);
    console.log(`  ✓ Product A: [${prodA.id}] "${prodA.name}" — stock=${stockA0}`);
    console.log(`  ✓ Product B: [${prodB.id}] "${prodB.name}" — stock=${stockB0}`);

    // Load variants (cần unitId để insertBatch)
    const variantA = await getVariant(t, prodA.id);
    const variantB = await getVariant(t, prodB.id);
    if (!variantA || !variantB) {
      logUiBug("SETUP", "CRITICAL", "Khong lay duoc variant cho prodA/prodB");
      throw new Error("Missing variants");
    }
    console.log(`    Variant A: id=${variantA.id}, unitId=${variantA.unitId}, price=${variantA.price}`);
    console.log(`    Variant B: id=${variantB.id}, unitId=${variantB.unitId}, price=${variantB.price}`);

    if (stockA0 < 6) {
      note("SETUP", `Stock SP A chi ${stockA0} (<6) — sẽ giảm qty ban tương ứng`);
    }

    // Dynamic qty
    const qtyS1 = Math.min(3, Math.max(2, Math.floor(stockA0 / 3))); // Trả 1 phần: cần ≥2
    const qtyS2 = Math.min(2, Math.max(1, Math.floor(stockA0 / 4))); // Trả toàn bộ
    const qtyS3 = 1;                                                  // Đổi
    console.log(`  Qty: S1=${qtyS1}, S2=${qtyS2}, S3=${qtyS3}`);

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO 1 — TRẢ 1 PHẦN
    // Bán qtyS1 → trả lại 1 → verify stock hồi phục +1
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 1 — TRẢ 1 PHẦN (ban " + qtyS1 + " tra 1)");
    console.log("═".repeat(70));

    if (qtyS1 < 2) {
      note("S1", `SKIP: can qty>=2 de tra 1 phan, co ${qtyS1}`);
    } else {
      const before = await getStock(t, prodA.id);
      console.log(`  [S1.1] Baseline stock A = ${before}`);

      const sale1 = await createSaleViaApi(t, prodA, variantA, qtyS1, "S1");
      t.assert("S1-01", !!sale1, sale1
        ? `Ban ${qtyS1}x "${prodA.name}" → ${sale1.invoiceCode}`
        : "Tao don S1 fail");

      if (sale1) {
        await new Promise(r => setTimeout(r, 2000));
        const afterSale = await getStock(t, prodA.id);
        console.log(`  [S1.2] Sau khi ban: stock = ${afterSale} (expected = ${before - qtyS1})`);
        t.assert("S1-02", afterSale === before - qtyS1,
          `Stock giam ${qtyS1} sau ban: ${before} → ${afterSale}`);

        // Get return items từ BE
        const retItemsRes = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${sale1.invoiceId}`);
        console.log(`  [S1.3] get/return: status=${retItemsRes.status}, code=${retItemsRes.body?.code}`);
        const retResult = retItemsRes.body?.result || {};
        const lstBP = retResult.lstBoughtProduct || retResult.products || [];
        console.log(`         lstBoughtProduct count=${lstBP.length}`);
        if (lstBP.length === 0) {
          logBeBug("S1", "HIGH", "get/return tra lstBoughtProduct rong",
            JSON.stringify(retItemsRes.body).slice(0, 250));
        } else {
          const origItem = lstBP[0];
          console.log(`         orig item: productId=${origItem.productId}, variantId=${origItem.variantId}, qty=${origItem.quantity ?? origItem.qty}, price=${origItem.price}, inventoryId=${origItem.inventoryId}`);

          const RETURN_QTY = 1;
          const returnBody = {
            invoice: {
              referId:     sale1.invoiceId,
              customerId:  retResult.customerId ?? -1,
              amount:      origItem.price * RETURN_QTY,
              fee:         origItem.price * RETURN_QTY,
              paid:        origItem.price * RETURN_QTY,
              debt:        0,
              discount:    0,
              vatAmount:   0,
              paymentType: 1,
              reason:      "Sản phẩm bị lỗi / hư hỏng",
              refundMethod: 1,
              note:        `E2E partial return ${RID}`,
            },
            lstBoughtProduct: [{
              productId:    origItem.productId,
              variantId:    origItem.variantId,
              unitId:       origItem.unitId,
              quantity:     RETURN_QTY,
              qty:          RETURN_QTY,
              price:        origItem.price,
              fee:          origItem.price * RETURN_QTY,
              discount:     0,
              discountUnit: 2,
              inventoryId:  origItem.inventoryId,
              name:         origItem.name,
            }],
            lstService:     [],
            lstCardService: [],
          };

          const createRet = await apiPost(t, "/bizapi/sales/invoice/create/return", returnBody);
          console.log(`  [S1.4] create/return: status=${createRet.status}, code=${createRet.body?.code}`);
          if (createRet.body?.code !== 0) {
            logBeBug("S1", "HIGH", "create/return fail",
              JSON.stringify(createRet.body).slice(0, 300));
          } else {
            const retInvoiceId = createRet.body.result?.id || createRet.body.result?.invoice?.id;
            console.log(`         → return invoice id=${retInvoiceId}`);

            // Confirm the return (pending → done)
            const confRes = await apiPost(t,
              `/bizapi/sales/invoice/return/confirm?id=${retInvoiceId}`, {});
            console.log(`  [S1.5] return/confirm: status=${confRes.status}, code=${confRes.body?.code}`);
            if (confRes.body?.code !== 0) {
              logBeBug("S1", "HIGH", "return/confirm fail",
                JSON.stringify(confRes.body).slice(0, 250));
            } else {
              t.assert("S1-03", true, `Tra hang thanh cong: phieu ${retInvoiceId}`);

              // ⚠️ CRITICAL: verify stock tăng lại đúng RETURN_QTY
              await new Promise(r => setTimeout(r, 3000));
              const afterReturn = await getStock(t, prodA.id);
              const expectedAfter = afterSale + RETURN_QTY;
              console.log(`  [S1.6] Sau khi tra: stock = ${afterReturn} (expected = ${expectedAfter})`);
              if (afterReturn === expectedAfter) {
                t.assert("S1-04", true,
                  `✅ Stock TANG +${RETURN_QTY} sau tra hang: ${afterSale} → ${afterReturn}`);
              } else if (afterReturn === afterSale) {
                logBeBug("S1", "CRITICAL",
                  `Stock KHONG tang sau tra hang: van = ${afterSale} (expected ${expectedAfter})`,
                  "BE khong re-stock khi confirm return");
                t.assert("S1-04", false, `BUG: stock khong hoi phuc`);
              } else {
                logBeBug("S1", "HIGH",
                  `Stock thay doi sai: ${afterSale} → ${afterReturn}, expected ${expectedAfter}`);
                t.assert("S1-04", false, `Delta sai: ${afterReturn - afterSale}`);
              }
            }
          }
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO 2 — TRẢ TOÀN BỘ (HỦY ĐƠN)
    // Bán qtyS2 → trả hết qtyS2 → verify stock full restored
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 2 — TRẢ TOÀN BỘ = HUY DON (ban " + qtyS2 + " tra " + qtyS2 + ")");
    console.log("═".repeat(70));

    if (qtyS2 < 1) {
      note("S2", `SKIP: khong du stock`);
    } else {
      const before = await getStock(t, prodA.id);
      console.log(`  [S2.1] Baseline stock A = ${before}`);

      const sale2 = await createSaleViaApi(t, prodA, variantA, qtyS2, "S2");
      t.assert("S2-01", !!sale2, sale2
        ? `Ban ${qtyS2}x "${prodA.name}" → ${sale2.invoiceCode}`
        : "Tao don S2 fail");

      if (sale2) {
        await new Promise(r => setTimeout(r, 2000));
        const afterSale = await getStock(t, prodA.id);
        t.assert("S2-02", afterSale === before - qtyS2,
          `Stock giam ${qtyS2}: ${before} → ${afterSale}`);

        const retItemsRes = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${sale2.invoiceId}`);
        const retResult = retItemsRes.body?.result || {};
        const lstBP = retResult.lstBoughtProduct || retResult.products || [];

        if (lstBP.length > 0) {
          const origItem = lstBP[0];
          const FULL_QTY = Number(origItem.quantity ?? origItem.qty ?? qtyS2);

          const returnBody = {
            invoice: {
              referId:     sale2.invoiceId,
              customerId:  retResult.customerId ?? -1,
              amount:      origItem.price * FULL_QTY,
              fee:         origItem.price * FULL_QTY,
              paid:        origItem.price * FULL_QTY,
              debt: 0, discount: 0, vatAmount: 0,
              paymentType: 1,
              reason: "Khách hàng đổi ý",
              refundMethod: 1,
              note: `E2E full return / cancel ${RID}`,
            },
            lstBoughtProduct: [{
              productId:    origItem.productId,
              variantId:    origItem.variantId,
              unitId:       origItem.unitId,
              quantity:     FULL_QTY,
              qty:          FULL_QTY,
              price:        origItem.price,
              fee:          origItem.price * FULL_QTY,
              discount: 0, discountUnit: 2,
              inventoryId:  origItem.inventoryId,
              name:         origItem.name,
            }],
            lstService: [], lstCardService: [],
          };

          const createRet = await apiPost(t, "/bizapi/sales/invoice/create/return", returnBody);
          console.log(`  [S2.3] create/return: code=${createRet.body?.code}`);
          if (createRet.body?.code !== 0) {
            logBeBug("S2", "HIGH", "create/return (full) fail",
              JSON.stringify(createRet.body).slice(0, 250));
          } else {
            const retId = createRet.body.result?.id || createRet.body.result?.invoice?.id;
            const conf = await apiPost(t,
              `/bizapi/sales/invoice/return/confirm?id=${retId}`, {});
            console.log(`  [S2.4] confirm: code=${conf.body?.code}`);
            if (conf.body?.code === 0) {
              t.assert("S2-03", true, `Huy don (tra toan bo) thanh cong: phieu ${retId}`);

              // ⚠️ CRITICAL: stock phai quay ve baseline (full restored)
              await new Promise(r => setTimeout(r, 3000));
              const afterReturn = await getStock(t, prodA.id);
              console.log(`  [S2.5] Sau huy don: stock = ${afterReturn} (expected = ${before})`);
              if (afterReturn === before) {
                t.assert("S2-04", true,
                  `✅ Stock QUAY VE baseline sau huy don: ${before} (full restored)`);
              } else {
                logBeBug("S2", "CRITICAL",
                  `Stock khong quay ve baseline sau huy don: ${afterReturn} ≠ ${before}`);
                t.assert("S2-04", false, `BUG: stock net delta = ${afterReturn - before}`);
              }
            } else {
              logBeBug("S2", "HIGH", "confirm full return fail",
                JSON.stringify(conf.body).slice(0, 200));
            }
          }
        } else {
          logBeBug("S2", "HIGH", "get/return tra rong cho don moi ban",
            JSON.stringify(retItemsRes.body).slice(0, 250));
        }
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // SCENARIO 3 — ĐỔI HÀNG (SP A → SP B)
    // Bán 1x A → đổi lấy 1x B → verify: A +1, B -1
    // ════════════════════════════════════════════════════════════════════
    console.log("\n" + "═".repeat(70));
    console.log("  SCENARIO 3 — DOI HANG (A → B)");
    console.log("═".repeat(70));

    // Refresh baselines (stock đã thay đổi sau S1, S2)
    const beforeA = await getStock(t, prodA.id);
    const beforeB = await getStock(t, prodB.id);
    console.log(`  [S3.0] Baseline A=${beforeA}, B=${beforeB}`);

    if (beforeA < 1 || beforeB < 1) {
      note("S3", `SKIP: het stock (A=${beforeA}, B=${beforeB})`);
    } else {
      const sale3 = await createSaleViaApi(t, prodA, variantA, 1, "S3");
      t.assert("S3-01", !!sale3, sale3
        ? `Ban 1x "${prodA.name}" → ${sale3.invoiceCode}`
        : "Tao don S3 fail");

      if (sale3) {
        await new Promise(r => setTimeout(r, 2000));
        const afterSaleA = await getStock(t, prodA.id);
        t.assert("S3-02", afterSaleA === beforeA - 1,
          `Stock A giam 1: ${beforeA} → ${afterSaleA}`);

        const retItemsRes = await apiGet(t, `/bizapi/sales/invoice/get/return?id=${sale3.invoiceId}`);
        const retResult = retItemsRes.body?.result || {};
        const lstBP = retResult.lstBoughtProduct || retResult.products || [];

        // Cần variant của prodB (SP đổi mới)
        const prodBDetail = await apiGet(t, `/bizapi/inventory/product/get?id=${prodB.id}`);
        const prodBVariant = prodBDetail.body?.result?.variants?.[0];

        if (lstBP.length > 0 && prodBVariant) {
          const origItem = lstBP[0];
          const priceA = origItem.price;
          const priceB = Number(prodBVariant.price || prodB.originalPrice || prodB.promotionPrice || 100000);
          const diff = priceB - priceA;

          console.log(`  [S3.3] Exchange: tra A (price=${priceA}) <-> doi B (price=${priceB}), diff=${diff}`);

          const exchangeBody = {
            invoice: {
              referId:     sale3.invoiceId,
              customerId:  retResult.customerId ?? -1,
              amount:      priceA,
              fee:         priceA,
              paid:        priceA,
              debt:        0,
              discount:    0,
              vatAmount:   0,
              paymentType: 1,
              reason:      "Không đúng mô tả / sai sản phẩm",
              refundMethod: 1,
              note:        `E2E exchange ${RID}`,
            },
            // SP TRẢ lại (cũ) → key "lstBoughtProduct" theo convention BE
            lstBoughtProduct: [{
              productId:    origItem.productId,
              variantId:    origItem.variantId,
              unitId:       origItem.unitId,
              quantity:     1, qty: 1,
              price:        priceA,
              fee:          priceA,
              discount: 0, discountUnit: 2,
              inventoryId:  origItem.inventoryId,
              name:         origItem.name,
            }],
            lstService: [], lstCardService: [],
            // Đơn ĐỔI MỚI (nested)
            exchangeInvoice: {
              customerId:  retResult.customerId ?? -1,
              amount:      priceB,
              fee:         priceB,
              paid:        Math.max(diff, 0),
              debt:        0,
              discount:    0,
              vatAmount:   0,
              paymentType: 1,
            },
            // SP ĐỔI MỚI
            lstExchangeProduct: [{
              productId:    Number(prodB.id),
              variantId:    Number(prodBVariant.id),
              unitId:       Number(prodBVariant.unitId),
              quantity:     1, qty: 1,
              price:        priceB,
              fee:          priceB,
              discount: 0, discountUnit: 2,
              inventoryId:  origItem.inventoryId,
              name:         prodB.name,
            }],
          };

          const createEx = await apiPost(t, "/bizapi/sales/invoice/create/exchange", exchangeBody);
          console.log(`  [S3.4] create/exchange: status=${createEx.status}, code=${createEx.body?.code}`);
          if (createEx.body?.code !== 0) {
            logBeBug("S3", "HIGH", "create/exchange fail",
              JSON.stringify(createEx.body).slice(0, 300));
          } else {
            const exId = createEx.body.result?.id || createEx.body.result?.invoice?.id;
            const conf = await apiPost(t,
              `/bizapi/sales/invoice/return/confirm?id=${exId}`, {});
            console.log(`  [S3.5] confirm: code=${conf.body?.code}`);
            if (conf.body?.code === 0) {
              t.assert("S3-03", true, `Doi hang thanh cong: phieu ${exId}`);

              // ⚠️ CRITICAL: A +1 (return), B -1 (new sale)
              await new Promise(r => setTimeout(r, 3000));
              const afterExA = await getStock(t, prodA.id);
              const afterExB = await getStock(t, prodB.id);
              console.log(`  [S3.6] After exchange: A=${afterExA} (expected=${beforeA}), B=${afterExB} (expected=${beforeB - 1})`);

              const aOk = afterExA === beforeA;
              const bOk = afterExB === beforeB - 1;

              if (aOk && bOk) {
                t.assert("S3-04", true,
                  `✅ Exchange đúng stock: A quay ve ${beforeA}, B giam còn ${afterExB}`);
              } else {
                if (!aOk) logBeBug("S3", "HIGH",
                  `Stock A sai sau doi: ${afterExA} ≠ ${beforeA} (expected quay ve baseline)`);
                if (!bOk) logBeBug("S3", "HIGH",
                  `Stock B sai sau doi: ${afterExB} ≠ ${beforeB - 1} (expected -1)`);
                t.assert("S3-04", false, `Exchange stock sai: A delta=${afterExA - beforeA}, B delta=${afterExB - beforeB}`);
              }
            } else {
              logBeBug("S3", "HIGH", "confirm exchange fail",
                JSON.stringify(conf.body).slice(0, 200));
            }
          }
        } else {
          logBeBug("S3", "HIGH",
            `Khong co item tra hoac variant B: lstBP=${lstBP.length}, prodBVariant=${!!prodBVariant}`);
        }
      }
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
    await t.page.screenshot({ path: `tests/screenshots/return-fatal-${RID}.png` }).catch(() => {});
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
                 + uiBugs.filter(b => b.severity === "HIGH" || b.severity === "CRITICAL" || b.severity === "BLOCKER").length;
  process.exit(critical > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
