/**
 * Deep BE probe — confirm các endpoint tester báo + check quickadd chi tiết.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("EVT-DEEP", "Deep BE Probe");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/dashboard");
  await t.page.waitForTimeout(1500);

  // Log mọi request đi biz.reborn.vn
  t.page.on("request", (req) => {
    const u = req.url();
    if (u.includes("biz.reborn.vn") || u.startsWith("http")) {
      // bỏ qua static assets
      if (u.endsWith(".js") || u.endsWith(".css") || u.endsWith(".svg")) return;
    }
  });

  const runProbes = async (label, probes) => {
    console.log(`\n═══ ${label} ═══`);
    const results = await t.page.evaluate(async (probes) => {
      const out = [];
      for (const p of probes) {
        try {
          const opts = { method: p.method, headers: { "Content-Type": "application/json" } };
          if (p.body) opts.body = JSON.stringify(p.body);
          const res = await fetch(p.url, opts);
          const text = await res.text();
          out.push({ url: p.url, method: p.method, status: res.status, body: text.slice(0, 200) });
        } catch (e) { out.push({ url: p.url, error: e.message }); }
      }
      return out;
    }, probes);
    for (const r of results) {
      console.log(`  ${r.method} ${r.url}`);
      console.log(`    → ${r.status}: ${r.body || r.error}`);
    }
    return results;
  };

  // ── Test 1: Employee list — khi truyền branchId vs không ─────────────
  await runProbes("Bug #1: Employee list w/ param variations", [
    { method: "GET", url: "/bizapi/customer/employee/list?page=1&limit=10" },
    { method: "GET", url: "/bizapi/customer/employee/list?page=1&limit=10&branchId=336" },
    { method: "GET", url: "/bizapi/customer/employee/list?page=1&limit=10&branchId=330" },
    { method: "GET", url: "/bizapi/customer/employee/list?page=1&limit=10&name=" },
    { method: "GET", url: "/bizapi/customer/employee/list?page=1&limit=10&branchId=336&name=" },
  ]);

  // ── Test 2: Quick-add member endpoint variations ─────────────────────
  const body = {
    name: `TEST QA ${Date.now()}`,
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
    gender: "1",
    custType: 0,
    branchId: 330,
    avatar: "", firstCall: "", height: "", weight: "", trademark: "", taxCode: "", careerId: 0,
  };
  await runProbes("Bug #5: Quickadd endpoint variations", [
    { method: "POST", url: "/bizapi/customer/customer/update", body },
    { method: "POST", url: "/customer/customer/update", body },
    { method: "POST", url: "https://biz.reborn.vn/customer/customer/update", body },
    { method: "POST", url: "/bizapi/customer/customer/create", body },
  ]);

  // ── Test 3: Events — xác nhận thêm ───────────────────────────────────
  await runProbes("Bug #2: Events endpoints", [
    { method: "GET", url: "/bizapi/market/events/list?page=1&limit=5" },
    { method: "POST", url: "/bizapi/market/events/create", body: { title: "Probe", description: "x", start_date: "2026-05-01T10:00:00Z", end_date: "2026-05-01T12:00:00Z", registration_open_date: "2026-04-22T00:00:00Z", registration_close_date: "2026-05-01T00:00:00Z", venue_is_online: true, venue_online_url: "https://zoom.us/1", contact_name: "X", contact_phone: "0912345678", status: "draft" } },
  ]);

  // ── Test 4: Category (danh mục sản phẩm) chi tiết ─────────────────────
  await runProbes("Bug #4: Category - check items", [
    { method: "GET", url: "/bizapi/inventory/category/list?page=1&limit=100" },
    { method: "GET", url: "/bizapi/inventory/category/list" },
  ]);

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
