/**
 * verify-all-fixes.mjs — Rà toàn bộ fix tester báo + tìm lỗi BE khác.
 *
 * Kiểm tra:
 *  1. Employee list endpoint (bug tester #1 — doc chỉ có curl, không ghi triệu chứng).
 *  2. Product unit loading (bug #3) — UI load xong, không kẹt loading.
 *  3. Product category dropdown (bug #4) — options load + API ok.
 *  4. Quick-add member (bug #5) — branchId có trong body + BE nhận.
 *  5. Events API (bug #2) — re-confirm BE vẫn trả 400/403.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("VERIFY", "Verify All W-House Fixes");
  const ok = await t.login();
  if (!ok) return t.done();

  // ── 1. Bug tester #1: Employee list ────────────────────────────────────
  await t.goto("/setting_org");
  await t.page.waitForTimeout(2000);
  const empListResult = await t.page.evaluate(async () => {
    try {
      const res = await fetch("/customer/employee/list?name=&limit=10&page=1&branchId=336", { method: "GET" });
      return { status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e) { return { error: e.message }; }
  });
  console.log("\n=== Bug #1: Employee List ===");
  console.log("  status:", empListResult.status, "body:", empListResult.body);

  // Thử thêm branchId=330 như curl tester gốc
  const empList330 = await t.page.evaluate(async () => {
    try {
      const res = await fetch("/customer/employee/list?name=&limit=10&page=1&branchId=330", { method: "GET" });
      return { status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e) { return { error: e.message }; }
  });
  console.log("  branchId=330 status:", empList330.status, "body:", empList330.body);
  t.assert("BUG1-employee-list", empListResult.status === 200 || empList330.status === 200,
    `Employee list: branchId=336→${empListResult.status}, branchId=330→${empList330.status}`);

  // ── 2. Bug #3: Product unit loading ────────────────────────────────────
  await t.goto("/setting_sell");
  await t.page.waitForTimeout(2000);
  // Click vào "Đơn vị sản phẩm" trong sidebar setting
  const clickedUnit = await t.page.evaluate(() => {
    const els = [...document.querySelectorAll("a, button, div, span, li")];
    const el = els.find((e) => (e.innerText || "").trim() === "Đơn vị sản phẩm");
    if (el) { el.click(); return true; }
    return false;
  });
  if (clickedUnit) {
    await t.page.waitForTimeout(3000);
    // Check loading spinner + no-item state
    const unitState = await t.page.evaluate(() => ({
      hasLoading: !!document.querySelector('[class*="loading"], [class*="spinner"], .loader'),
      bodyText: (document.body.innerText || "").slice(0, 500),
    }));
    await t.screenshot("bug3-productunit");
    // Sau 3s, không nên còn loading mãi
    t.assert("BUG3-no-infinite-loading",
      !unitState.hasLoading || unitState.bodyText.includes("Chưa có dữ liệu") || unitState.bodyText.includes("Thêm mới"),
      unitState.hasLoading ? "Vẫn còn loading spinner — có thể kẹt" : "Loading đã dừng, page đã render");

    // API unit list qua fetch trực tiếp
    const unitApi = await t.page.evaluate(async () => {
      try {
        const res = await fetch("/bizapi/customer/unit/list?page=1&limit=10", { method: "GET" });
        return { status: res.status, body: (await res.text()).slice(0, 200) };
      } catch (e) { return { error: e.message }; }
    });
    console.log("\n=== Bug #3: Unit API ===", unitApi);
    t.assert("BUG3-unit-api", unitApi.status === 200,
      `/unit/list status=${unitApi.status}, body=${unitApi.body}`);
  } else {
    t.assert("BUG3-click-productunit", false, "Không tìm thấy menu 'Đơn vị sản phẩm' trong setting_sell");
  }

  // ── 3. Bug #4: Product category dropdown ──────────────────────────────
  await t.goto("/setting_sell");
  await t.page.waitForTimeout(1500);
  // Navigate "Thêm sản phẩm": thử /setting_sell/product/new hoặc click "Thêm mới"
  await t.page.goto(`${process.env.BASE_URL || "http://localhost:4000/crm"}/setting_sell?tab=product`).catch(() => {});
  await t.page.waitForTimeout(2000);

  const categoryApi = await t.page.evaluate(async () => {
    try {
      const res = await fetch("/bizapi/inventory/category/list?page=1&limit=100", { method: "GET" });
      const body = await res.text();
      let items = [];
      try {
        const json = JSON.parse(body);
        items = json.result?.items || json.result || [];
      } catch {}
      return { status: res.status, itemCount: Array.isArray(items) ? items.length : 0, sample: Array.isArray(items) ? items[0] : null };
    } catch (e) { return { error: e.message }; }
  });
  console.log("\n=== Bug #4: Category API ===", JSON.stringify(categoryApi).slice(0, 300));
  t.assert("BUG4-category-api", categoryApi.status === 200,
    `/category/list status=${categoryApi.status}, items=${categoryApi.itemCount}, sample-keys=${categoryApi.sample ? Object.keys(categoryApi.sample).join(",") : "n/a"}`);

  // ── 4. Bug #5: Quick-add member submit ──────────────────────────────
  const quickAddResult = await t.page.evaluate(async () => {
    // lấy branchId từ localStorage
    const raw = localStorage.getItem("valueBranch");
    let branchId;
    try { branchId = JSON.parse(raw || "{}")?.value; } catch {}
    const body = {
      name: `TEST Quick Add ${Date.now()}`,
      phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
      email: "",
      gender: "1",
      custType: 0,
      branchId,
      avatar: "", firstCall: "", height: "", weight: "", trademark: "", taxCode: "", careerId: 0,
    };
    try {
      const res = await fetch("/bizapi/customer/customer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { branchId, status: res.status, body: (await res.text()).slice(0, 300) };
    } catch (e) { return { branchId, error: e.message }; }
  });
  console.log("\n=== Bug #5: Quick-Add Member ===", quickAddResult);
  t.assert("BUG5-quickadd-branchId", quickAddResult.branchId != null,
    `branchId từ localStorage: ${quickAddResult.branchId}`);
  t.assert("BUG5-quickadd-api",
    quickAddResult.status === 200,
    `POST /customer/customer/update status=${quickAddResult.status}, body=${quickAddResult.body}`);

  // ── 5. Bug #2: Events API re-confirm ────────────────────────────────
  console.log("\n=== Bug #2: Events API (re-confirm) ===");
  const evtResults = await t.page.evaluate(async () => {
    const paths = [
      { method: "GET", url: "/bizapi/market/events/list?page=1&limit=5" },
      { method: "POST", url: "/bizapi/market/events/create", body: { title: "Probe", tenantId: 336 } },
    ];
    const out = [];
    for (const p of paths) {
      try {
        const opts = { method: p.method, headers: { "Content-Type": "application/json" } };
        if (p.body) opts.body = JSON.stringify(p.body);
        const res = await fetch(p.url, opts);
        out.push({ path: p.url, status: res.status, body: (await res.text()).slice(0, 200) });
      } catch (e) { out.push({ path: p.url, error: e.message }); }
    }
    return out;
  });
  for (const r of evtResults) {
    console.log("  ", r.path, "→", r.status, ":", r.body);
  }
  t.assert("BUG2-events-still-broken",
    evtResults.every((r) => r.status !== 200),
    "BE events vẫn broken (như trong backend-task docs)");

  // ── 6. Ngoài ra: probe thêm các endpoint có thể tester dùng ────────────
  console.log("\n=== Các API khác user 0898348348 gọi được ===");
  const probes = [
    "/bizapi/customer/customer/list_paid/basic?page=1&limit=5",
    "/bizapi/inventory/category/list?page=1&limit=5",
    "/bizapi/customer/unit/list?page=1&limit=5",
    "/bizapi/customer/employee/list?page=1&limit=5",
    "/bizapi/customer/branch/list?page=1&limit=5",
    "/bizapi/market/promotion/list?page=1&limit=5",
  ];
  const probeResults = await t.page.evaluate(async (urls) => {
    const out = [];
    for (const u of urls) {
      try {
        const res = await fetch(u, { method: "GET" });
        out.push({ url: u, status: res.status });
      } catch (e) { out.push({ url: u, error: e.message }); }
    }
    return out;
  }, probes);
  for (const r of probeResults) {
    console.log("  ", r.status, r.url);
  }

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
