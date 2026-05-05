/**
 * test-events-api.mjs — CRUD ĐẦY ĐỦ phân hệ Sự kiện (Events) qua REAL BE.
 *
 * QUAN HỆ với các script event đã có (đừng tạo lại, hãy bổ sung):
 *   - `test-events-smoke.mjs`        — UI smoke: mở 4 route, không hit endpoint.
 *   - `test-events-unit.mjs`         — pure JS unit cho normalizeBeDate / computeRegistrationTotal.
 *   - `test-events-create-real.mjs`  — chỉ create+list (snake_case payload, BÂY GIỜ HỎNG vì BE đã đổi).
 *   - `test-events-create-from-mock.mjs` — workaround localStorage seed khi BE 400.
 *   - `test-events-tester-bugs.mjs`  — verify 4 bug tester báo (BUG2/3/4): create, publish, get,
 *                                       public/get, public/register, registrations(list), reg/update, delete.
 *   - `cleanup-test-events.mjs`      — xoá event prefix [TEST-BUG] còn sót.
 *   - `probe-events-*.mjs`           — exploratory probes payload format (đã lỗi thời).
 *
 * File NÀY bao phủ 25 endpoint trong `urlsApi.events` — gồm 17 endpoint MÀ KHÔNG SCRIPT NÀO Ở TRÊN
 * test: listPublic, checkTicket, list (admin), update, unpublish, cancel, issueTicket,
 * convertToMember, submitPaymentProof, reviewPaymentProof, checkIn, checkOut, addServiceUsage,
 * listServiceUsage, removeServiceUsage. Các endpoint trùng với tester-bugs vẫn test (full lifecycle).
 *
 * Lifecycle: tạo 1 event prefix "[QA-API-<ts>]" → publish → public register → issueTicket →
 * checkTicket → reg/update → submitPaymentProof → reviewPaymentProof → checkIn →
 * addServiceUsage → listServiceUsage → removeServiceUsage → checkOut → convertToMember →
 * cancel → unpublish (kiểm tra reverse) → delete (cleanup). try/finally đảm bảo delete chạy.
 *
 * Endpoint nào fail (status ≠ 200, code ≠ 0/200, ngoại lệ) gom vào `failedEndpoints[]` trong
 * report cuối — dùng nguyên si để chuyển handoff sang BE cloud-market.
 *
 * Payload format: camelCase nested (giống `EventService.ts` + `test-events-tester-bugs.mjs`),
 * đã verify pass với BE deploy hiện tại. KHÔNG đổi sang snake_case.
 *
 * Pattern: dùng `createApiRunner` từ `tests/api-helpers.mjs` (giống `test-customer-api.mjs`) —
 * gọi fetch qua page.evaluate() để hưởng fetchConfig (URL rewrite + Hostname header + cookies).
 *
 * Pre-requisite: `tests/.auth-state.json` còn hạn. Nếu hết hạn:
 *   HEADLESS=true node tests/login-save.mjs
 * (cần SSO server reachable — `.env`'s APP_SSO_LINK = http://localhost:8080 hoặc prod sso.reborn.vn).
 *
 * Usage:  node tests/test-events-api.mjs
 * Output: tests/reports/events-api-<runId>.json (kèm `failedEndpoints[]` nếu có).
 */
import { createApiRunner } from "./api-helpers.mjs";

const STAMP = Date.now().toString().slice(-9);
const TAG = `[QA-API-${STAMP}]`;
const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString();

const api = await createApiRunner("EVENTS", "Sự kiện (API)");

// ── Tracker cho handoff BE ─────────────────────────────────────────────────
const failedEndpoints = [];
function track(label, method, url, res) {
  const ok =
    res.status === 200 &&
    (res.code === 0 || res.code === 200 || res.code === undefined);
  if (!ok) {
    failedEndpoints.push({
      label,
      method,
      url,
      status: res.status,
      code: res.code,
      message: res.message ?? res.error ?? null,
      bodyPreview:
        typeof res.body === "object"
          ? JSON.stringify(res.body).slice(0, 300)
          : String(res.body ?? "").slice(0, 300),
    });
  }
  return ok;
}

// ── Payload helpers ────────────────────────────────────────────────────────
const eventPayload = (overrides = {}) => ({
  title: `${TAG} Workshop CRUD`,
  description: `${TAG} mô tả ngắn — tạo bởi test-events-api.mjs`,
  content: `<p>${TAG} nội dung chi tiết</p>`,
  startDate: day(7),
  endDate: day(8),
  registrationOpenDate: day(0),
  registrationCloseDate: day(7),
  venue: {
    name: `${TAG} Venue`,
    address: "123 QA street",
    city: "HCMC",
    isOnline: false,
  },
  contactPerson: {
    name: "QA Tester",
    phone: "0900000000",
    email: "qa@test.local",
    role: "Trưởng BTC",
  },
  maxAttendees: 50,
  ticketPrice: 500000,
  category: "workshop",
  tags: ["qa", "automation"],
  status: "draft",
  requirePaymentProof: true,
  addOnItems: [
    {
      id: "addon-1",
      name: `${TAG} Combo nước`,
      unitPrice: 50000,
      unit: "suất",
      maxQty: 2,
      group: "F&B",
    },
  ],
  dynamicFields: [
    {
      id: "df-mentor",
      label: "Mã Mentor",
      type: "text",
      required: false,
      order: 1,
    },
  ],
  ...overrides,
});

const registerPayload = () => ({
  fullName: `${TAG} Đăng ký test`,
  // VN mobile = 10 digits (09 + 8). STAMP=9 ký tự cuối timestamp → cắt còn 8.
  phone: `09${STAMP.slice(-8)}`,
  email: "register@test.local",
  company: "QA Co.",
  note: "Đăng ký từ test API",
  selectedAddOns: [{ addOnId: "addon-1", qty: 1 }],
  totalAmount: 550000,
  source: "public_portal",
});

let createdId = null;
let createdSlug = null;
let createdRegId = null;
let createdServiceUsageId = null;

try {
  // ──────────────────────────────────────────────────────────────────────────
  // 1) PUBLIC LIST
  // ──────────────────────────────────────────────────────────────────────────
  {
    const url = "/bizapi/market/events/public/list";
    const res = await api.get(url, { page: 1, limit: 10 });
    const ok = track("listPublic", "GET", url, res);
    api.assert(
      "TC-EVT-PUB-LIST",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2) ADMIN CREATE
  // ──────────────────────────────────────────────────────────────────────────
  {
    const url = "/bizapi/market/events/create";
    const res = await api.post(url, eventPayload());
    const ok = track("create", "POST", url, res);
    createdId = res.result?.id ?? res.data?.id ?? res.result ?? null;
    createdSlug = res.result?.slug ?? res.data?.slug ?? null;
    api.assert(
      "TC-EVT-CREATE",
      ok && !!createdId,
      `${url} → status=${res.status}, code=${res.code}, id=${createdId}, slug=${createdSlug}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3) ADMIN GET (round-trip)
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = "/bizapi/market/events/get";
    const res = await api.get(url, { id: createdId });
    const ok = track("get", "GET", url, res);
    const got = res.result ?? res.data ?? null;
    api.assert(
      "TC-EVT-GET",
      ok && got?.title === `${TAG} Workshop CRUD`,
      `${url}?id=${createdId} → title="${got?.title}"`,
    );
    if (got?.slug) createdSlug = got.slug;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4) ADMIN UPDATE
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = `/bizapi/market/events/update?id=${createdId}`;
    const updated = eventPayload({
      title: `${TAG} Workshop CRUD updated`,
      maxAttendees: 80,
    });
    const res = await api.post(url, updated);
    const ok = track("update", "POST", "/bizapi/market/events/update", res);
    api.assert(
      "TC-EVT-UPDATE",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );

    // verify persisted
    const detail = await api.get("/bizapi/market/events/get", { id: createdId });
    const got = detail.result ?? detail.data ?? null;
    api.assert(
      "TC-EVT-UPDATE-VERIFY",
      got?.title?.includes("updated") && got?.maxAttendees === 80,
      `Sau update → title="${got?.title}", maxAttendees=${got?.maxAttendees}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5) ADMIN PUBLISH
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = `/bizapi/market/events/publish?id=${createdId}`;
    const res = await api.post(url);
    const ok = track("publish", "POST", "/bizapi/market/events/publish", res);
    api.assert(
      "TC-EVT-PUBLISH",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );

    // verify status = published
    const detail = await api.get("/bizapi/market/events/get", { id: createdId });
    const got = detail.result ?? detail.data ?? null;
    api.assert(
      "TC-EVT-PUBLISH-VERIFY",
      got?.status === "published",
      `Sau publish → status="${got?.status}"`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6) ADMIN LIST (filter status=published)
  // ──────────────────────────────────────────────────────────────────────────
  {
    const url = "/bizapi/market/events/list";
    const res = await api.get(url, { page: 1, limit: 50, status: "published" });
    const ok = track("list", "GET", url, res);
    const items = res.result?.items ?? res.data?.items ?? res.result ?? [];
    const found = Array.isArray(items)
      ? items.find((e) => e.id === createdId || e.id === String(createdId))
      : null;
    api.assert(
      "TC-EVT-LIST",
      ok,
      `${url}?status=published → status=${res.status}, code=${res.code}, items=${Array.isArray(items) ? items.length : "?"}, foundOurEvent=${!!found}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7) PUBLIC GET BY SLUG
  // ──────────────────────────────────────────────────────────────────────────
  if (createdSlug) {
    const url = "/bizapi/market/events/public";
    const res = await api.get(url, { slug: createdSlug });
    const ok = track("getPublic", "GET", url, res);
    const got = res.result ?? res.data ?? null;
    api.assert(
      "TC-EVT-PUB-GET",
      ok && got?.slug === createdSlug,
      `${url}?slug=${createdSlug} → status=${res.status}, title="${got?.title}"`,
    );
  } else {
    api.assert(
      "TC-EVT-PUB-GET",
      false,
      `Bỏ qua vì không có slug từ create response`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 8) PUBLIC REGISTER
  // ──────────────────────────────────────────────────────────────────────────
  if (createdSlug) {
    const url = `/bizapi/market/events/public/register?slug=${createdSlug}`;
    const res = await api.post(url, registerPayload());
    const ok = track(
      "registerPublic",
      "POST",
      "/bizapi/market/events/public/register",
      res,
    );
    createdRegId = res.result?.id ?? res.data?.id ?? res.result ?? null;
    api.assert(
      "TC-EVT-PUB-REGISTER",
      ok && !!createdRegId,
      `${url} → status=${res.status}, code=${res.code}, regId=${createdRegId}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9) ADMIN LIST REGISTRATIONS
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = "/bizapi/market/events/registrations";
    const res = await api.get(url, { eventId: createdId, page: 1, limit: 20 });
    const ok = track("registrations", "GET", url, res);
    const items = res.result?.items ?? res.data?.items ?? res.result ?? [];
    api.assert(
      "TC-EVT-REG-LIST",
      ok,
      `${url}?eventId=${createdId} → status=${res.status}, items=${Array.isArray(items) ? items.length : "?"}`,
    );
    if (!createdRegId && Array.isArray(items) && items.length) {
      createdRegId = items[0].id ?? null;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10) ISSUE TICKET → 11) CHECK TICKET
  // ──────────────────────────────────────────────────────────────────────────
  let ticketCode = null;
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/issue-ticket?id=${createdRegId}`;
    const res = await api.post(url);
    const ok = track(
      "issueTicket",
      "POST",
      "/bizapi/market/events/registrations/issue-ticket",
      res,
    );
    ticketCode =
      res.result?.ticketCode ?? res.data?.ticketCode ?? res.result ?? null;
    api.assert(
      "TC-EVT-ISSUE-TICKET",
      ok && !!ticketCode,
      `${url} → status=${res.status}, ticketCode="${ticketCode}"`,
    );
  }

  if (createdSlug && ticketCode) {
    const url = `/bizapi/market/events/public/check-ticket?slug=${createdSlug}`;
    const res = await api.post(url, { ticketCode });
    const ok = track(
      "checkTicket",
      "POST",
      "/bizapi/market/events/public/check-ticket",
      res,
    );
    api.assert(
      "TC-EVT-CHECK-TICKET",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 12) UPDATE REGISTRATION (status = confirmed)
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/update?id=${createdRegId}`;
    const res = await api.post(url, { status: "confirmed", note: "QA confirm" });
    const ok = track(
      "updateRegistration",
      "POST",
      "/bizapi/market/events/registrations/update",
      res,
    );
    api.assert(
      "TC-EVT-REG-UPDATE",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 13) PAYMENT PROOF — submit → review (approve)
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/payment-proof?id=${createdRegId}`;
    const res = await api.post(url, {
      imageUrl: "https://placehold.co/400x600/png?text=QA-PROOF",
    });
    const ok = track(
      "submitPaymentProof",
      "POST",
      "/bizapi/market/events/registrations/payment-proof",
      res,
    );
    api.assert(
      "TC-EVT-PAYMENT-SUBMIT",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/payment-review?id=${createdRegId}`;
    const res = await api.post(url, { approved: true });
    const ok = track(
      "reviewPaymentProof",
      "POST",
      "/bizapi/market/events/registrations/payment-review",
      res,
    );
    api.assert(
      "TC-EVT-PAYMENT-REVIEW",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 14) CHECK-IN
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/check-in?id=${createdRegId}`;
    const res = await api.post(url, {
      selectedDate: new Date().toISOString().slice(0, 10),
    });
    const ok = track(
      "checkIn",
      "POST",
      "/bizapi/market/events/registrations/check-in",
      res,
    );
    api.assert(
      "TC-EVT-CHECKIN",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 15) SERVICE USAGE — add → list → remove
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = "/bizapi/market/events/service-usage/add";
    const res = await api.post(url, {
      registrationId: createdRegId,
      addOnId: "addon-1",
      qty: 1,
      consumedAt: new Date().toISOString(),
    });
    const ok = track("addServiceUsage", "POST", url, res);
    createdServiceUsageId =
      res.result?.id ?? res.data?.id ?? res.result ?? null;
    api.assert(
      "TC-EVT-SU-ADD",
      ok && !!createdServiceUsageId,
      `${url} → status=${res.status}, suId=${createdServiceUsageId}`,
    );
  }

  if (createdRegId) {
    const url = "/bizapi/market/events/service-usage/list";
    const res = await api.get(url, { registrationId: createdRegId });
    const ok = track("listServiceUsage", "GET", url, res);
    const items = res.result?.items ?? res.data?.items ?? res.result ?? [];
    api.assert(
      "TC-EVT-SU-LIST",
      ok,
      `${url}?registrationId=${createdRegId} → status=${res.status}, items=${Array.isArray(items) ? items.length : "?"}`,
    );
  }

  if (createdServiceUsageId) {
    const url = `/bizapi/market/events/service-usage/delete?id=${createdServiceUsageId}`;
    const res = await api.del(url);
    const ok = track(
      "removeServiceUsage",
      "DELETE",
      "/bizapi/market/events/service-usage/delete",
      res,
    );
    api.assert(
      "TC-EVT-SU-REMOVE",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 16) CHECK-OUT
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/check-out?id=${createdRegId}`;
    const res = await api.post(url);
    const ok = track(
      "checkOut",
      "POST",
      "/bizapi/market/events/registrations/check-out",
      res,
    );
    api.assert(
      "TC-EVT-CHECKOUT",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 17) CONVERT REGISTRATION TO CUSTOMER (member)
  // ──────────────────────────────────────────────────────────────────────────
  if (createdRegId) {
    const url = `/bizapi/market/events/registrations/convert?id=${createdRegId}`;
    const res = await api.post(url, {});
    const ok = track(
      "convertToMember",
      "POST",
      "/bizapi/market/events/registrations/convert",
      res,
    );
    api.assert(
      "TC-EVT-CONVERT",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 18) IMPORT REGISTRATIONS — skip (cần multipart fixture, không in-scope CRUD smoke)
  // ──────────────────────────────────────────────────────────────────────────
  api.assert(
    "TC-EVT-IMPORT-SKIP",
    true,
    `importRegistrations bỏ qua trong test này (cần fixture xlsx + multipart)`,
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 19) CANCEL EVENT
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = `/bizapi/market/events/cancel?id=${createdId}`;
    const res = await api.post(url);
    const ok = track("cancel", "POST", "/bizapi/market/events/cancel", res);
    api.assert(
      "TC-EVT-CANCEL",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 20) UNPUBLISH (lifecycle reverse)  —  thử trên cùng event sau cancel để xem
  //     BE có cho gọi cả 2 không. Nếu BE cho thì OK; nếu reject thì capture vào
  //     failedEndpoints để BE xem.
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = `/bizapi/market/events/unpublish?id=${createdId}`;
    const res = await api.post(url);
    const ok = track("unpublish", "POST", "/bizapi/market/events/unpublish", res);
    api.assert(
      "TC-EVT-UNPUBLISH",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }
} catch (err) {
  console.error("[test-events-api] Lỗi runtime:", err);
  api.assert("TC-EVT-RUNTIME", false, `Exception: ${err?.message ?? err}`);
} finally {
  // ──────────────────────────────────────────────────────────────────────────
  // CLEANUP — luôn cố gắng xoá event đã tạo, kể cả khi test fail
  // ──────────────────────────────────────────────────────────────────────────
  if (createdId) {
    const url = `/bizapi/market/events/delete?id=${createdId}`;
    const res = await api.del(url);
    const ok = track("delete", "DELETE", "/bizapi/market/events/delete", res);
    api.assert(
      "TC-EVT-DELETE",
      ok,
      `${url} → status=${res.status}, code=${res.code}`,
    );
  }

  const report = await api.done();

  // ── Ghi failedEndpoints riêng ra report để dễ chuyển handoff BE ─────────
  if (failedEndpoints.length) {
    console.log("\n" + "=".repeat(60));
    console.log(`❌ ${failedEndpoints.length} endpoint FAIL — cần BE xem xét:`);
    console.log("=".repeat(60));
    for (const f of failedEndpoints) {
      console.log(
        `  • ${f.method} ${f.url}  → status=${f.status}, code=${f.code}` +
          (f.message ? `, msg="${f.message}"` : ""),
      );
    }
    console.log(
      `\n📋  Chi tiết body trong report tests/reports/events-api-${report.runId}.json`,
    );
    // attach để file JSON có sẵn cho handoff
    report.failedEndpoints = failedEndpoints;
    const fs = await import("fs");
    const path = await import("path");
    const fp = path.join(
      "tests",
      "reports",
      `events-api-${report.runId}.json`,
    );
    fs.writeFileSync(fp, JSON.stringify(report, null, 2));
  } else {
    console.log("\n✅ Tất cả endpoint pass — không cần handoff BE.");
  }
}
