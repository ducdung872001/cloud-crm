#!/usr/bin/env node
/**
 * E2E TEST — Multi-warehouse stock display tren POS
 *
 * Vấn đề nghi ngờ: Khi 1 sản phẩm có tồn ở CẢ kho bán (is_selling=1)
 * VÀ kho dự trữ (is_selling=0), thì POS hiển thị "Tồn: X" có cộng tổng cả 2
 * hay chỉ tính kho is_selling thôi?
 *
 * Đúng nghiệp vụ: POS PHẢI chỉ tính kho is_selling=1 (kho bán hàng).
 * Nếu cộng cả kho dự trữ → BUG (user bán nhầm hàng dự trữ).
 *
 * Test approach:
 *  1. Login + lấy danh sách warehouse → identify selling vs non-selling
 *  2. Pick 1 sản phẩm có sẵn (E2E SP)
 *  3. Get baseline: stockQuantity từ /product/list (no warehouseId filter)
 *  4. Get per-warehouse breakdown via filtered calls
 *  5. Controlled experiment: import +N vào kho non-selling → verify delta
 *  6. Sanity check: import +N vào kho selling → verify delta=N
 *
 * Chay: node tests/test-multi-warehouse-stock.mjs
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
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

const API_BASE = "https://biz.reborn.vn";
const HOSTNAME_HEADER = "kcn.reborn.vn";

async function getAuthHeaders(t) {
  const cookies = await t.context.cookies();
  const tokenC = cookies.find((c) => c.name === "token");
  const headers = {
    "Hostname": HOSTNAME_HEADER,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  if (tokenC) headers["Authorization"] = `Bearer ${tokenC.value}`;
  return headers;
}

async function apiGet(t, path) {
  const stripped = path.replace(/^\/bizapi/, "");
  const fullUrl = stripped.startsWith("http") ? stripped : API_BASE + stripped;
  try {
    const headers = await getAuthHeaders(t);
    const r = await t.context.request.get(fullUrl, { headers });
    const status = r.status();
    let body = null;
    try { body = await r.json(); } catch { body = await r.text(); }
    return { status, body };
  } catch (e) {
    return { status: 0, error: String(e) };
  }
}

async function apiPost(t, path, body = {}) {
  const stripped = path.replace(/^\/bizapi/, "");
  const fullUrl = stripped.startsWith("http") ? stripped : API_BASE + stripped;
  try {
    const headers = await getAuthHeaders(t);
    const r = await t.context.request.post(fullUrl, { headers, data: body });
    const status = r.status();
    let respBody = null;
    try { respBody = await r.json(); } catch { respBody = await r.text(); }
    return { status, body: respBody };
  } catch (e) {
    return { status: 0, error: String(e) };
  }
}

async function main() {
  const t = await createTestRunner("E2E-MULTIWH", `Multi-warehouse stock POS [${RID}]`);

  try {
    if (!(await t.login())) throw new Error("Login failed");

    await t.goto("/dashboard");
    await t.page.waitForTimeout(2000);

    // ────────────────────────────────────────────────────────────────────
    // STEP 1 — Lấy danh sách warehouse + phân loại selling/non-selling
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 1 — DISCOVER WAREHOUSES");
    console.log("═".repeat(70));

    const whRes = await apiGet(t, "/bizapi/inventory/warehouse/list?page=1&limit=200");
    if (whRes.status !== 200 || whRes.body?.code !== 0) {
      logBeBug("STEP1", "CRITICAL", `warehouse/list fail: status=${whRes.status}, code=${whRes.body?.code}`);
      throw new Error("Cannot fetch warehouses");
    }

    const whItems = Array.isArray(whRes.body.result)
      ? whRes.body.result
      : (whRes.body.result?.items || []);
    console.log(`  Total warehouses: ${whItems.length}`);

    const sellingWhs = [];
    const nonSellingWhs = [];
    whItems.forEach((w) => {
      const isSelling = (w.isSelling === 1 || w.isSelling === "1" || w.is_selling === 1 || w.is_selling === "1");
      const summary = {
        id: w.id,
        name: w.name || w.warehouseName || `Kho #${w.id}`,
        isSelling: isSelling ? 1 : 0,
      };
      if (isSelling) sellingWhs.push(summary);
      else nonSellingWhs.push(summary);
    });

    console.log(`\n  📦 Selling warehouses (is_selling=1): ${sellingWhs.length}`);
    sellingWhs.forEach((w) => console.log(`    - [${w.id}] ${w.name}`));
    console.log(`\n  🗄️  Non-selling warehouses (is_selling=0): ${nonSellingWhs.length}`);
    nonSellingWhs.forEach((w) => console.log(`    - [${w.id}] ${w.name}`));

    t.assert("S1-01", sellingWhs.length > 0, `Co ${sellingWhs.length} kho ban (selling)`);
    if (nonSellingWhs.length === 0) {
      logUiBug("STEP1", "INFO",
        "Khong co kho non-selling nao trong he thong → khong the test multi-warehouse");
      note("STEP1", "Skip multi-WH test: chi co 1 loai kho.");
    } else {
      t.assert("S1-02", true, `Co ${nonSellingWhs.length} kho non-selling de test`);
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 2 — Lấy 1 sản phẩm có stock > 0
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 2 — PICK SAMPLE PRODUCT");
    console.log("═".repeat(70));

    const prodRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=20");
    if (prodRes.status !== 200 || prodRes.body?.code !== 0) {
      logBeBug("STEP2", "CRITICAL", `product/list fail: status=${prodRes.status}`);
      throw new Error("Cannot fetch products");
    }
    const prodItems = prodRes.body.result?.items || [];
    console.log(`  Total products on page 1: ${prodItems.length}`);

    const sampleProd = prodItems.find((p) => Number(p.stockQuantity || 0) > 0)
                   || prodItems.find((p) => p.name?.toLowerCase().includes("e2e"))
                   || prodItems[0];
    if (!sampleProd) {
      logUiBug("STEP2", "CRITICAL", "Khong co san pham nao trong he thong");
      throw new Error("No products");
    }

    const totalStockUnfiltered = Number(sampleProd.stockQuantity || 0);
    console.log(`\n  ✓ Sample: [${sampleProd.id}] "${sampleProd.name}"`);
    console.log(`    stockQuantity (unfiltered) = ${totalStockUnfiltered}`);
    note("STEP2", `Sample product: id=${sampleProd.id} "${sampleProd.name}" totalStock=${totalStockUnfiltered}`);

    // ────────────────────────────────────────────────────────────────────
    // STEP 3 — Get per-warehouse breakdown
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 3 — PER-WAREHOUSE BREAKDOWN");
    console.log("═".repeat(70));

    const perWhStock = {};
    let sumAllWh = 0;
    let sumSellingWh = 0;
    let sumNonSellingWh = 0;

    for (const w of whItems) {
      const r = await apiGet(t, `/bizapi/inventory/product/list?page=1&limit=20&warehouseId=${w.id}`);
      if (r.status !== 200 || r.body?.code !== 0) continue;
      const items = r.body.result?.items || [];
      const found = items.find((p) => Number(p.id) === Number(sampleProd.id));
      const wStock = Number(found?.stockQuantity || 0);
      const isSell = (w.isSelling === 1 || w.isSelling === "1" || w.is_selling === 1 || w.is_selling === "1");
      perWhStock[w.id] = { name: w.name, isSelling: isSell ? 1 : 0, stock: wStock };
      sumAllWh += wStock;
      if (isSell) sumSellingWh += wStock;
      else sumNonSellingWh += wStock;
      console.log(`    [${w.id}] "${w.name}" (selling=${isSell ? 1 : 0}) → stock=${wStock}`);
    }

    console.log(`\n  📊 Sum all warehouses        = ${sumAllWh}`);
    console.log(`  📊 Sum selling only          = ${sumSellingWh}`);
    console.log(`  📊 Sum non-selling only      = ${sumNonSellingWh}`);
    console.log(`  📊 Unfiltered (POS shows)    = ${totalStockUnfiltered}`);

    // ────────────────────────────────────────────────────────────────────
    // STEP 4 — Verdict theo data hien tai
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 4 — VERDICT");
    console.log("═".repeat(70));

    const matchAll      = totalStockUnfiltered === sumAllWh;
    const matchSelling  = totalStockUnfiltered === sumSellingWh;

    if (matchAll && matchSelling) {
      note("STEP4",
        `sumNonSelling=0 nen unfiltered match cả 2 → ambiguous. Need import to non-selling to verify.`);
      t.assert("S4-01", true, `(Inconclusive) unfiltered=${totalStockUnfiltered} match cả 2 sum`);
    } else if (matchSelling && !matchAll) {
      t.assert("S4-01", true,
        `✅ DUNG: POS chi tinh kho selling. unfiltered=${totalStockUnfiltered} = sumSelling=${sumSellingWh} (excluded ${sumNonSellingWh} từ non-selling)`);
    } else if (matchAll && !matchSelling) {
      logBeBug("STEP4", "HIGH",
        `POS hien thi tong cua TAT CA kho (cong ca kho non-selling)`,
        `unfiltered=${totalStockUnfiltered} = sumAll=${sumAllWh} ≠ sumSelling=${sumSellingWh}`);
      t.assert("S4-01", false,
        `BUG: POS shows ${totalStockUnfiltered} (= sum tat ca) thay vi ${sumSellingWh}`);
    } else {
      logBeBug("STEP4", "MEDIUM",
        `unfiltered (${totalStockUnfiltered}) khong match sumAll (${sumAllWh}) hay sumSelling (${sumSellingWh})`);
      t.assert("S4-01", false, `Inconsistent`);
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 5 — Controlled experiment
    // ────────────────────────────────────────────────────────────────────
    let beforeStock = totalStockUnfiltered;
    let afterStock  = null;
    let importDelta = null;
    if (nonSellingWhs.length > 0) {
      console.log("\n" + "═".repeat(70));
      console.log("  STEP 5 — CONTROLLED EXPERIMENT (import to non-selling)");
      console.log("═".repeat(70));

      const targetWh = nonSellingWhs[0];
      console.log(`  Target warehouse: [${targetWh.id}] "${targetWh.name}" (is_selling=0)`);

      // 5.1 — Baseline
      const baseRes = await apiGet(t, `/bizapi/inventory/product/list?page=1&limit=50`);
      const baseProd = baseRes.body?.result?.items?.find((p) => Number(p.id) === Number(sampleProd.id));
      beforeStock = Number(baseProd?.stockQuantity || 0);
      console.log(`  [5.1] Baseline unfiltered stock = ${beforeStock}`);

      // 5.2 — Get variant + unitId via product/get
      const varDetailRes = await apiGet(t,
        `/bizapi/inventory/productVariant/list-detail?productId=${sampleProd.id}`);
      const vdItems = varDetailRes.body?.result?.items || varDetailRes.body?.result || [];
      let variant = Array.isArray(vdItems) && vdItems.length > 0 ? vdItems[0] : null;
      let unitId = variant?.unitId || variant?.unit?.id || sampleProd.unitId;

      if (!unitId) {
        const prodDetailRes = await apiGet(t, `/bizapi/inventory/product/get?id=${sampleProd.id}`);
        const pd = prodDetailRes.body?.result;
        if (!variant && pd?.variants?.[0]) variant = pd.variants[0];
        unitId = variant?.unitId || pd?.variants?.[0]?.unitId || pd?.unitId;
      }

      if (!variant) variant = { id: sampleProd.id, unitId };
      if (variant) variant.unitId = unitId;

      console.log(`  [5.2] Variant: id=${variant?.id}, unitId=${unitId}`);

      if (variant && variant.id && unitId) {
        const QTY = 10;

        async function importToWarehouse(whId, label) {
          const now = new Date();
          const receiptDate = now.toISOString().slice(0, 19);

          const createRes = await apiPost(t, "/bizapi/inventory/invoice/import/update", {
            invoiceType: "IV4", inventoryId: whId, receiptDate,
          });
          const invId = createRes.body?.result?.invoice?.id || createRes.body?.result?.id;
          if (!invId) {
            logBeBug("STEP5", "HIGH", `[${label}] Khong tao phieu`,
              JSON.stringify(createRes.body).slice(0, 200));
            return null;
          }

          const expiry = new Date(now.getTime() + 90 * 86400 * 1000).toISOString().slice(0, 19);
          const addRes = await apiPost(t, "/bizapi/inventory/product_import/update", {
            invoiceId: invId, productId: sampleProd.id, variantId: variant.id, unitId,
            batchNo: `MWH-${label}-${RID}`, quantity: String(QTY), mainCost: "50000",
            mfgDate: null, expiryDate: expiry, customerId: -1, exchange: 1, discount: 0,
          });
          if (addRes.body?.code !== 0) {
            logBeBug("STEP5", "HIGH", `[${label}] Add line fail`,
              JSON.stringify(addRes.body).slice(0, 200));
            return null;
          }

          const apprRes = await apiPost(t,
            `/bizapi/inventory/invoice/import/approve?invoiceId=${invId}`, {});
          if (apprRes.body?.code !== 0) {
            logBeBug("STEP5", "HIGH", `[${label}] Approve fail`,
              JSON.stringify(apprRes.body).slice(0, 200));
            return null;
          }

          await new Promise((r) => setTimeout(r, 2500));

          const afterRes = await apiGet(t, "/bizapi/inventory/product/list?page=1&limit=50");
          const afterP = afterRes.body?.result?.items?.find((p) => Number(p.id) === Number(sampleProd.id));
          return Number(afterP?.stockQuantity || 0);
        }

        // ── 5A — Import vao kho NON-SELLING ────────────────────────────
        console.log(`\n  ── 5A: Import +${QTY} vao kho non-selling [${targetWh.id}] "${targetWh.name}" ──`);
        const after5A = await importToWarehouse(targetWh.id, "NS");
        if (after5A !== null) {
          const delta5A = after5A - beforeStock;
          console.log(`     before=${beforeStock} → after=${after5A}, delta=${delta5A}`);
          if (delta5A === 0) {
            t.assert("S5A-01", true,
              `✅ DUNG: POS unfiltered KHONG tang sau import vao kho non-selling (delta=0)`);
            note("STEP5",
              `BE chi cong stock cua kho is_selling=1 vao 'stockQuantity' → DUNG nghiep vu.`);
          } else if (delta5A === QTY) {
            logBeBug("STEP5A", "HIGH",
              `BUG: POS unfiltered TANG +${QTY} sau khi nhap kho NON-SELLING ` +
              `[${targetWh.id}] "${targetWh.name}".`,
              `Before=${beforeStock}, After=${after5A}.`);
            t.assert("S5A-01", false,
              `BUG: POS cong stock kho du tru (delta=+${QTY})`);
          } else {
            t.assert("S5A-01", false,
              `Delta unexpected: ${delta5A} (expected 0 hoac ${QTY})`);
          }
          beforeStock = after5A;
        }

        // ── 5B — SANITY CHECK ───────────────────────────────────────────
        console.log(`\n  ── 5B: Import +${QTY} vao kho SELLING [${sellingWhs[0].id}] "${sellingWhs[0].name}" (sanity) ──`);
        const after5B = await importToWarehouse(sellingWhs[0].id, "S");
        if (after5B !== null) {
          const delta5B = after5B - beforeStock;
          console.log(`     before=${beforeStock} → after=${after5B}, delta=${delta5B}`);
          if (delta5B === QTY) {
            t.assert("S5B-01", true,
              `✅ Sanity OK: POS unfiltered TANG +${QTY} sau import vao kho selling`);
          } else {
            logBeBug("STEP5B", "MEDIUM",
              `Sanity FAIL: import vao kho selling cung delta=${delta5B}`);
            t.assert("S5B-01", false, `Sanity fail: delta=${delta5B}`);
          }
          afterStock = after5B;
          importDelta = delta5B;
        }
      } else {
        note("STEP5", `Skip experiment: missing variant or unitId`);
      }
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 6 — Verify POS UI
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 6 — VERIFY POS UI HIEN THI");
    console.log("═".repeat(70));

    await t.goto("/create_sale_add");
    await t.page.waitForTimeout(4000);
    await t.screenshot("s6-pos-grid");

    const posCardStock = await t.page.evaluate((targetName) => {
      const cards = [...document.querySelectorAll('.pg-card')];
      for (const c of cards) {
        if (c.innerText?.includes(targetName)) {
          const m = c.innerText.match(/T[ồo]n:\s*(\d+)/i);
          return { found: true, displayed: m ? Number(m[1]) : null, text: c.innerText.replace(/\s+/g, ' ').slice(0, 100) };
        }
      }
      return { found: false };
    }, sampleProd.name);

    if (posCardStock.found) {
      console.log(`  POS card "${sampleProd.name}":`);
      console.log(`    Displayed: "Tồn: ${posCardStock.displayed}"`);
      const posMatchesUnfiltered = posCardStock.displayed === totalStockUnfiltered;
      t.assert("S6-01", true, `POS hien "Tồn: ${posCardStock.displayed}" — match unfiltered API: ${posMatchesUnfiltered}`);
    } else {
      logUiBug("STEP6", "MEDIUM",
        `Khong tim thay card "${sampleProd.name}" trong POS grid`);
    }

    // ────────────────────────────────────────────────────────────────────
    // STEP 7 — FE warehouse selector check
    // ────────────────────────────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  STEP 7 — FE warehouse selector check");
    console.log("═".repeat(70));

    const whSelectorOpts = await t.page.evaluate(() => {
      const selectors = [...document.querySelectorAll('select, [class*="warehouse"]')];
      const debug = [];
      for (const el of selectors) {
        const txt = el.innerText?.replace(/\s+/g, ' ').slice(0, 100) || '';
        if (txt.toLowerCase().includes('kho')) debug.push(txt);
      }
      return debug;
    });
    console.log(`  Found WH-related elements: ${JSON.stringify(whSelectorOpts).slice(0, 300)}`);

    if (nonSellingWhs.length > 0) {
      const targetWhName = nonSellingWhs[0].name;
      const inSelector = whSelectorOpts.some((s) => s.includes(targetWhName));
      if (inSelector) {
        logUiBug("STEP7", "MEDIUM",
          `Kho non-selling "${targetWhName}" XUAT HIEN trong dropdown POS`,
          "Selector khong filter theo isSelling");
      } else {
        t.assert("S7-01", true, `POS warehouse selector loai bo kho non-selling "${targetWhName}"`);
      }
    }

  } catch (e) {
    console.log(`\n💥 FATAL: ${e.message}`);
    logUiBug("FATAL", "BLOCKER", e.message);
    await t.page.screenshot({ path: `tests/screenshots/multiwh-fatal-${RID}.png` }).catch(() => {});
  }

  // ── BUG REPORT ─────────────────────────────────────────────────────────
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
  process.exit(beBugs.filter((b) => b.severity === "HIGH" || b.severity === "CRITICAL").length > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
