#!/usr/bin/env node
/**
 * VOUCHER EDGE CASES — tìm bug ẩn
 *
 * P1. Sale KHONG dung voucher → usedCount cua voucher co tang khong?
 *     (verify BE thuc su track voucher hay chi guess theo discount value)
 *
 * P2. 2 voucher cung discountValue → sale with that discount → voucher nao tang?
 *     (verify BE link sale với voucher cụ thể, không phải random match)
 *
 * P3. Apply voucher nhung KHONG complete sale → usedCount co tang khong?
 *     (apply chi de check, khong chot don)
 *
 * P4. Race condition quota: 5 apply song song khi con 3 luot → bao nhieu thanh cong?
 *
 * P5. Discount > orderAmount → final amount am?
 *
 * P6. Apply voi orderAmount = 0 → BE handle?
 */
import { createTestRunner } from "./helpers.mjs";

const RID = Date.now().toString(36).slice(-5);
const API_BASE = "https://biz.reborn.vn";

async function H(t) {
  const ck = await t.context.cookies();
  const tk = ck.find((c) => c.name === "token");
  return {
    Authorization: tk ? `Bearer ${tk.value}` : "",
    Hostname: "kcn.reborn.vn", Accept: "application/json", "Content-Type": "application/json",
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

async function createVoucher(t, code, discountValue, minOrder, maxUses) {
  const expiryDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const r = await POST(t, "/bizapi/market/coupon/update", {
    id: 0, code, discountType: 2, discountValue, minOrder, maxUses,
    expiryDate, status: 1, description: `Edge test ${RID}`,
  });
  return r.body?.result?.id || null;
}

async function getUsedCount(t, id) {
  const r = await GET(t, `/bizapi/market/coupon/get?id=${id}`);
  return Number(r.body?.result?.usedCount ?? 0);
}

async function createSale(t, product, variant, qty, discount = 0) {
  const unitPrice = Number(variant.price || 100000);
  const subtotal = unitPrice * qty;
  const final = subtotal - discount;
  const draft = await GET(t, "/bizapi/sales/invoice/draft/create?customerId=-1&customerName=&customerPhone=");
  const inv = draft.body?.result?.invoice || draft.body?.result;
  if (!inv?.id) return null;
  const ins = await POST(t,
    `/bizapi/sales/boughtProduct/insertBatch?invoiceId=${inv.id}&paid=${final}&debt=0&fundId=1${discount > 0 ? `&loyaltyDiscount=${discount}` : ""}`,
    [{
      productId: Number(product.id), variantId: Number(variant.id),
      unitId: Number(variant.unitId), price: unitPrice, customerId: -1,
      quantity: qty, name: product.name, avatar: "", unitName: "Cái", fee: subtotal,
    }]);
  if (ins.body?.code !== 0) return null;
  const conf = await POST(t, "/bizapi/sales/invoice/create", {
    id: inv.id, fee: final, paid: final, debt: 0, amount: subtotal,
    discount, vatAmount: 0, amountCard: 0, paymentType: 1,
    invoiceType: "IV1", customerId: -1,
    branchId: Number(inv.branchId ?? -1), bsnId: Number(inv.bsnId ?? -1),
    receiptDate: new Date().toISOString().slice(0, 19),
    account: "[]", customerName: "",
  });
  return conf.body?.code === 0 ? { invoiceId: inv.id, code: conf.body.result?.invoiceCode } : null;
}

const findings = [];
function find(p, msg) { findings.push({ p, msg }); console.log(`  📋 ${p}: ${msg}`); }
const bugs = [];
function bug(p, sev, desc) { bugs.push({ p, sev, desc }); console.log(`  🔴 [${sev}] ${p}: ${desc}`); }

const t = await createTestRunner("VOUCHER-EDGE", `Voucher edge cases [${RID}]`);

let createdVoucherIds = [];

try {
  await t.login();
  await t.goto("/dashboard");
  await t.page.waitForTimeout(1500);

  // SETUP
  const prods = await GET(t, "/bizapi/inventory/product/list?page=1&limit=100");
  const cands = (prods.body?.result?.items || [])
    .filter((p) => Number(p.stockQuantity || 0) >= 6)
    .filter((p) => Number(p.originalPrice || p.promotionPrice || 0) > 0 && Number(p.originalPrice || 0) <= 200000)
    .sort((a, b) => Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0));
  const sample = cands.find((p) => p.name?.includes("E2E SP")) || cands[0];
  if (!sample) throw new Error("No product");
  const pd = await GET(t, `/bizapi/inventory/product/get?id=${sample.id}`);
  const variant = pd.body?.result?.variants?.[0];
  console.log(`Sample: [${sample.id}] ${sample.name} stock=${sample.stockQuantity}\n`);

  // ════════════════════════════════════════════════════════════════════
  // P1 — Sale KHONG voucher → voucher cũ co bi auto-increment khong?
  // ════════════════════════════════════════════════════════════════════
  console.log("═".repeat(70));
  console.log("P1 — Sale KHONG voucher: voucher khac co bi tang usedCount?");
  console.log("═".repeat(70));

  const v1Id = await createVoucher(t, `EDG1${RID.toUpperCase()}`, 50000, 200000, 5);
  createdVoucherIds.push(v1Id);
  console.log(`Tao voucher 1: id=${v1Id}, value=50k`);

  const v1Before = await getUsedCount(t, v1Id);
  console.log(`v1 usedCount baseline: ${v1Before}`);

  // Sale KHONG dung voucher (discount=0)
  const sale = await createSale(t, sample, variant, 2, 0);
  console.log(`Sale ${sale?.code}: discount=0 (NO voucher used)`);
  await new Promise((r) => setTimeout(r, 2500));

  const v1After = await getUsedCount(t, v1Id);
  console.log(`v1 usedCount after sale: ${v1After}`);

  if (v1After === v1Before) {
    find("P1", "✅ DUNG: Sale khong voucher → voucher khac KHONG tang usedCount");
  } else {
    bug("P1", "CRITICAL", `Voucher v1 (id=${v1Id}) tu tang usedCount mac du sale khong dung voucher: ${v1Before} → ${v1After}`);
  }

  // ════════════════════════════════════════════════════════════════════
  // P2 — 2 voucher cùng discountValue → sale với value đó → voucher nào tăng?
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P2 — 2 voucher cung discountValue → BE phan biet duoc khong?");
  console.log("═".repeat(70));

  const v2Id = await createVoucher(t, `EDG2${RID.toUpperCase()}`, 50000, 200000, 5);
  createdVoucherIds.push(v2Id);
  console.log(`Tao voucher 2: id=${v2Id}, value=50k (cùng value với v1)`);

  const v1Pre = await getUsedCount(t, v1Id);
  const v2Pre = await getUsedCount(t, v2Id);
  console.log(`Pre: v1=${v1Pre}, v2=${v2Pre}`);

  // Sale với discount=50000 (KHÔNG specify voucher nào)
  const sale2 = await createSale(t, sample, variant, 2, 50000);
  console.log(`Sale ${sale2?.code}: discount=50000 (FE không gửi couponCode)`);
  await new Promise((r) => setTimeout(r, 2500));

  const v1Post = await getUsedCount(t, v1Id);
  const v2Post = await getUsedCount(t, v2Id);
  console.log(`Post: v1=${v1Post} (delta=${v1Post - v1Pre}), v2=${v2Post} (delta=${v2Post - v2Pre})`);

  const v1Inc = v1Post > v1Pre;
  const v2Inc = v2Post > v2Pre;
  if (v1Inc && v2Inc) {
    bug("P2", "CRITICAL", "CẢ 2 voucher đều tăng usedCount → BE đếm 2 lần / nhân đôi quota usage");
  } else if (v1Inc || v2Inc) {
    bug("P2", "HIGH", `BE tự chọn voucher để increment (v1=${v1Inc}, v2=${v2Inc}) — không deterministic, abuser có thể exploit`);
  } else {
    find("P2", "Cả 2 voucher đều KHÔNG tăng → BE không track qua discount value (cần điều tra cách BE link)");
  }

  // ════════════════════════════════════════════════════════════════════
  // P3 — Apply voucher nhung KHONG sale → usedCount co tang?
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P3 — Apply voucher nhung KHONG complete sale");
  console.log("═".repeat(70));

  const v3Id = await createVoucher(t, `EDG3${RID.toUpperCase()}`, 30000, 100000, 5);
  createdVoucherIds.push(v3Id);
  const v3Code = `EDG3${RID.toUpperCase()}`;
  const v3Pre = await getUsedCount(t, v3Id);

  // Apply voucher 3 lần liên tiếp KHÔNG có sale theo sau
  for (let i = 1; i <= 3; i++) {
    const r = await POST(t, "/bizapi/market/coupon/apply", { code: v3Code, orderAmount: 200000 });
    console.log(`Apply ${i}: discount=${r.body?.result?.discountAmount}`);
  }
  await new Promise((r) => setTimeout(r, 2000));
  const v3Post = await getUsedCount(t, v3Id);
  console.log(`v3 usedCount: ${v3Pre} → ${v3Post}`);

  if (v3Post === v3Pre) {
    find("P3", "✅ DUNG: Apply alone không tăng usedCount (chỉ tăng khi sale confirm)");
  } else {
    bug("P3", "MEDIUM",
      `Apply alone đã tăng usedCount: ${v3Pre} → ${v3Post}. User chỉ thử voucher mà bị trừ quota → có thể abuse để DDOS quota`);
  }

  // ════════════════════════════════════════════════════════════════════
  // P4 — Race condition: 5 apply song song khi quota = 3
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P4 — Race condition: 5 apply song song, quota=3");
  console.log("═".repeat(70));

  const v4Id = await createVoucher(t, `EDG4${RID.toUpperCase()}`, 20000, 100000, 3);
  createdVoucherIds.push(v4Id);
  const v4Code = `EDG4${RID.toUpperCase()}`;

  // 5 apply song song (Promise.all)
  const parallelApplies = await Promise.all(
    Array.from({ length: 5 }, () =>
      POST(t, "/bizapi/market/coupon/apply", { code: v4Code, orderAmount: 200000 })
    )
  );
  const successCount = parallelApplies.filter((r) => r.body?.code === 0).length;
  console.log(`5 parallel apply: ${successCount} success / ${5 - successCount} reject`);
  parallelApplies.forEach((r, i) =>
    console.log(`  ${i + 1}: code=${r.body?.code}, discount=${r.body?.result?.discountAmount}`)
  );

  // BE check theo apply (chỉ check, chưa redeem) → tất cả 5 đều phải success
  // Nếu BE check theo redeem (đã trừ quota khi apply) → chỉ 3 success
  if (successCount === 5) {
    find("P4", "Apply chỉ là check (không trừ quota) — race-safe nếu redeem ở step sale");
  } else if (successCount === 3) {
    find("P4", "Apply trừ quota ngay → chính xác 3, race condition handled");
  } else {
    bug("P4", "MEDIUM",
      `Race condition: ${successCount}/5 success (expected 3 hoặc 5 deterministic)`);
  }

  // ════════════════════════════════════════════════════════════════════
  // P5 — discount > orderAmount → final âm?
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P5 — discount > orderAmount → BE handle the nao");
  console.log("═".repeat(70));

  const v5Id = await createVoucher(t, `EDG5${RID.toUpperCase()}`, 500000, 100000, 5);  // discount 500k, minOrder 100k
  createdVoucherIds.push(v5Id);
  const v5Code = `EDG5${RID.toUpperCase()}`;

  // Apply với order = 200k → discount 500k (lớn hơn order)
  const r5 = await POST(t, "/bizapi/market/coupon/apply", { code: v5Code, orderAmount: 200000 });
  console.log(`Apply ${v5Code} với order=200k: discount=${r5.body?.result?.discountAmount}, final=${r5.body?.result?.finalAmount}`);

  if (r5.body?.code === 0) {
    const final = Number(r5.body.result?.finalAmount);
    if (final < 0) {
      bug("P5", "HIGH", `BE cho phép final amount AM: ${final} (BE phải cap discount tại order amount hoặc reject)`);
    } else if (final === 0) {
      find("P5", "✅ BE cap discount tại orderAmount (final = 0)");
    } else {
      find("P5", `BE giữ discount (final=${final}, có thể clamp client-side)`);
    }
  } else {
    find("P5", `BE reject discount > order: ${JSON.stringify(r5.body).slice(0, 150)}`);
  }

  // ════════════════════════════════════════════════════════════════════
  // P6 — orderAmount = 0
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P6 — Apply voi orderAmount = 0");
  console.log("═".repeat(70));

  const r6 = await POST(t, "/bizapi/market/coupon/apply", { code: v5Code, orderAmount: 0 });
  console.log(`Apply order=0: code=${r6.body?.code}, body=${JSON.stringify(r6.body).slice(0, 200)}`);

  if (r6.body?.code === 0) {
    bug("P6", "MEDIUM", "BE cho phép apply với orderAmount=0 — không hợp lệ về nghiệp vụ");
  } else {
    find("P6", "BE reject orderAmount=0 (đúng nghiệp vụ)");
  }

  // ════════════════════════════════════════════════════════════════════
  // P7 — orderAmount âm
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P7 — Apply voi orderAmount AM");
  console.log("═".repeat(70));

  const r7 = await POST(t, "/bizapi/market/coupon/apply", { code: v5Code, orderAmount: -100000 });
  console.log(`Apply order=-100k: code=${r7.body?.code}, body=${JSON.stringify(r7.body).slice(0, 200)}`);

  if (r7.body?.code === 0) {
    bug("P7", "HIGH", "BE cho phép apply với orderAmount AM — security/data integrity issue");
  } else {
    find("P7", "BE reject orderAmount âm");
  }

  // ════════════════════════════════════════════════════════════════════
  // P8 — Voucher hết hạn (expiryDate quá khứ)
  // ════════════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(70));
  console.log("P8 — Voucher EXPIRED (expiryDate qua khu)");
  console.log("═".repeat(70));

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const v8 = await POST(t, "/bizapi/market/coupon/update", {
    id: 0, code: `EDG8${RID.toUpperCase()}`, discountType: 2, discountValue: 30000,
    minOrder: 100000, maxUses: 5, expiryDate: yesterday, status: 1,
    description: "Expired test",
  });
  if (v8.body?.code === 0) {
    createdVoucherIds.push(v8.body.result?.id);
    const r8 = await POST(t, "/bizapi/market/coupon/apply",
      { code: `EDG8${RID.toUpperCase()}`, orderAmount: 200000 });
    console.log(`Apply expired voucher: code=${r8.body?.code}, body=${JSON.stringify(r8.body).slice(0, 200)}`);

    if (r8.body?.code === 0) {
      bug("P8", "HIGH", "BE cho phép apply voucher đã hết hạn (expiryDate quá khứ)");
    } else {
      find("P8", "✅ BE reject voucher expired");
    }
  } else {
    find("P8", `BE reject create voucher với expiryDate quá khứ: ${JSON.stringify(v8.body).slice(0, 150)}`);
  }

} catch (e) {
  console.log(`\n💥 FATAL: ${e.message}`);
} finally {
  // Cleanup all test vouchers
  console.log("\n" + "═".repeat(70));
  console.log("CLEANUP");
  console.log("═".repeat(70));
  for (const id of createdVoucherIds.filter(Boolean)) {
    await POST(t, "/bizapi/market/coupon/update", {
      id, code: `CLEANUP${id}`, status: 0, discountType: 2, discountValue: 0,
      minOrder: 0, maxUses: 0, expiryDate: "2026-04-13",
    });
  }
  console.log(`Disabled ${createdVoucherIds.length} test vouchers`);
}

console.log("\n" + "═".repeat(70));
console.log(`SUMMARY — ${bugs.length} bugs, ${findings.length} findings`);
console.log("═".repeat(70));
console.log(`\n🔴 BUGS PHAT HIEN (${bugs.length}):`);
bugs.forEach((b, i) => console.log(`  ${i + 1}. [${b.sev}] ${b.p}: ${b.desc}`));
console.log(`\n📋 FINDINGS:`);
findings.forEach((f, i) => console.log(`  ${i + 1}. ${f.p}: ${f.msg}`));

await t.done();
process.exit(bugs.filter((b) => ["HIGH", "CRITICAL"].includes(b.sev)).length > 0 ? 1 : 0);
