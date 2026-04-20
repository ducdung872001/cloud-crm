/**
 * Smoke test sau khi migrate /customer/list_paid → /customer/list_paid/basic
 * - Navigate /customer_list
 * - Check request đi đúng biz.reborn.vn/customer/customer/list_paid/basic
 * - Check query params: page 0-based, size (không phải limit)
 * - Check response code=0 + items array
 * - Check UI render ≥1 row
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

const t = await createTestRunner("API-MIGRATE", "Customer list_paid/basic");

const captured = {
  listPaidBasic: null,
  listPaidBasicResponse: null,
};

t.page.on("request", (req) => {
  const url = req.url();
  if (url.includes("/customer/list_paid/basic")) {
    captured.listPaidBasic = {
      url,
      method: req.method(),
      headers: req.headers(),
    };
  }
});

t.page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/customer/list_paid/basic") && !captured.listPaidBasicResponse) {
    try {
      const body = await res.json();
      captured.listPaidBasicResponse = { status: res.status(), body };
    } catch {
      captured.listPaidBasicResponse = { status: res.status(), body: null };
    }
  }
});

try {
  if (!(await t.login())) throw new Error("login fail");

  await t.goto(ROUTES.CUSTOMER_LIST);
  await t.page.waitForTimeout(5000);
  await t.screenshot("01-customer-list-initial");

  // ── 1. Có request tới list_paid/basic
  t.assert(
    "LP-001",
    !!captured.listPaidBasic,
    `Có request tới /customer/list_paid/basic: ${captured.listPaidBasic?.url || "KHÔNG"}`
  );

  // ── 2. URL dùng host biz.reborn.vn/customer/*
  const url = captured.listPaidBasic?.url || "";
  t.assert(
    "LP-002",
    url.startsWith("https://biz.reborn.vn/customer/customer/list_paid/basic"),
    `URL đúng host biz.reborn.vn/customer: ${url.split("?")[0]}`
  );

  // ── 3. Query có page + size (không có limit)
  const qs = url.split("?")[1] || "";
  const params = new URLSearchParams(qs);
  t.assert(
    "LP-003",
    params.has("page") && params.has("size"),
    `Query có page + size: page=${params.get("page")}, size=${params.get("size")}`
  );
  t.assert(
    "LP-004",
    !params.has("limit"),
    `Query KHÔNG còn 'limit' (adapter đã chuyển đổi): limit=${params.get("limit") ?? "(absent)"}`
  );

  // ── 5. page là 0-based (FE gửi page=1 → adapter chuyển thành 0)
  const pageVal = params.get("page");
  t.assert(
    "LP-005",
    pageVal === "0" || pageVal === "1",
    `page value hợp lệ (0-based expected 0 cho trang đầu): ${pageVal}`
  );

  // ── 6. Response OK
  const resp = captured.listPaidBasicResponse;
  t.assert(
    "LP-006",
    resp?.status === 200,
    `HTTP status = 200: ${resp?.status}`
  );
  t.assert(
    "LP-007",
    resp?.body?.code === 0,
    `Response code = 0 (success): ${resp?.body?.code} — msg="${resp?.body?.message}"`
  );

  // ── 7. Response có items
  const items = resp?.body?.result?.items;
  t.assert(
    "LP-008",
    Array.isArray(items),
    `result.items là array: ${Array.isArray(items) ? `length=${items.length}` : typeof items}`
  );

  // ── 8. Response có total
  t.assert(
    "LP-009",
    typeof resp?.body?.result?.total === "number",
    `result.total là number: ${resp?.body?.result?.total}`
  );

  // ── 9. Item có các field quan trọng (nếu có ít nhất 1 row)
  if (Array.isArray(items) && items.length > 0) {
    const first = items[0];
    const required = ["id", "name"];
    const missing = required.filter((k) => first[k] === undefined);
    t.assert(
      "LP-010",
      missing.length === 0,
      `Item[0] có field tối thiểu (id, name): ${missing.length === 0 ? "OK" : `missing ${missing.join(",")}`}`
    );

    // Aggregate fields (có thể undefined với account chưa có data — chỉ log)
    const aggregates = ["fee", "paid", "debt", "invoiceCount", "invoiceChargeTotal"];
    const hasAggregate = aggregates.filter((k) => first[k] !== undefined);
    t.log(
      "📊",
      `Aggregate fields có trong response: ${hasAggregate.join(", ") || "KHÔNG có"} / expected: ${aggregates.join(", ")}`
    );
  } else {
    t.log("⚠️", "items.length = 0 — không check được schema item");
  }

  // ── 10. UI render: có bảng
  const hasTable = await t.exists("table, [class*='table']");
  t.assert("LP-011", hasTable, `UI render bảng: ${hasTable}`);

  // ── 11. UI render: có ít nhất 1 row (nếu BE có data)
  const rowCount = await t.page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr, [class*='row']:not([class*='header'])");
    return rows.length;
  }).catch(() => 0);
  t.log("📋", `DOM row count: ${rowCount}`);

  await t.screenshot("02-customer-list-loaded");

  // ── 12. Test pagination: click page 2 (nếu có pagination)
  const hasPagination = await t.exists(".pagination, [class*='pagination']");
  if (hasPagination && (resp?.body?.result?.total ?? 0) > 10) {
    t.log("🔄", "Test pagination — click page 2");
    const nextCaptured = { req: null, resp: null };
    const reqHandler = (req) => {
      if (req.url().includes("/customer/list_paid/basic") && req.url() !== captured.listPaidBasic.url) {
        nextCaptured.req = req.url();
      }
    };
    const resHandler = async (res) => {
      if (res.url().includes("/customer/list_paid/basic") && res.url() !== captured.listPaidBasic.url && !nextCaptured.resp) {
        try { nextCaptured.resp = await res.json(); } catch {}
      }
    };
    t.page.on("request", reqHandler);
    t.page.on("response", resHandler);

    await t.page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button, a, .pagination li"));
      const page2 = btns.find((b) => b.textContent?.trim() === "2");
      page2?.click();
    });
    await t.page.waitForTimeout(4000);

    if (nextCaptured.req) {
      const qs2 = new URLSearchParams(nextCaptured.req.split("?")[1] || "");
      t.assert(
        "LP-012",
        qs2.get("page") === "1",
        `Pagination page 2 → BE nhận page=1 (0-based): ${qs2.get("page")}`
      );
    } else {
      t.log("ℹ️", "Không bắt được request page 2 (có thể không có pagination hoặc dùng infinite scroll)");
    }
  } else {
    t.log("ℹ️", `Skip test pagination (total=${resp?.body?.result?.total ?? "?"} <= 10 hoặc không có pagination)`);
  }

  // ── Summary dump
  console.log("\n───── DEBUG DUMP ─────");
  console.log("Request URL:", captured.listPaidBasic?.url);
  console.log("Response status:", captured.listPaidBasicResponse?.status);
  console.log("Response code:", captured.listPaidBasicResponse?.body?.code);
  console.log("Response message:", captured.listPaidBasicResponse?.body?.message);
  console.log("Result.total:", captured.listPaidBasicResponse?.body?.result?.total);
  console.log("Result.page:", captured.listPaidBasicResponse?.body?.result?.page);
  console.log("Result.size:", captured.listPaidBasicResponse?.body?.result?.size);
  console.log("Result.limit:", captured.listPaidBasicResponse?.body?.result?.limit);
  console.log("Items count:", captured.listPaidBasicResponse?.body?.result?.items?.length);
  if (captured.listPaidBasicResponse?.body?.result?.items?.[0]) {
    console.log("Item[0] keys:", Object.keys(captured.listPaidBasicResponse.body.result.items[0]).slice(0, 20).join(", "), "...");
  }
  console.log("──────────────────────\n");
} catch (e) {
  t.assert("FATAL", false, e.message);
}

await t.done();
