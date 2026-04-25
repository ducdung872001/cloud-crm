/**
 * test-events-tester-bugs.mjs — Verify 4 bug tester báo (Google Doc 2026-04-24)
 * sau khi BE deploy `cloud-market-master`.
 *
 * Bug 1: Stats Sự kiện > Chi tiết sai (FE-only fix, đã verify qua unit test).
 * Bug 2: Cột Add-on / Tổng tiền / Vé / Hội viên chưa hiển thị
 *        → Verify selectedAddOns + totalAmount persist qua API; ticketCode
 *          auto-issue khi confirm.
 * Bug 3: Upload QR ngân hàng + bank info
 *        → Verify bankAccountOverride.qrImageUrl persist + return trên public.
 * Bug 4: Thời gian lưu data sai so với input
 *        → Verify datetime round-trip — FE gửi UTC ISO với Z, FE đọc lại
 *          phải hiển thị đúng giờ local input (sau normalizeBeDate).
 *
 * Hits prod BE qua dev server proxy: http://localhost:4000/crm → /bizapi/* → https://biz.reborn.vn
 *
 * Run: node tests/test-events-tester-bugs.mjs
 */
import { createTestRunner } from "./helpers.mjs";

// Helper: chuyển local datetime → UTC ISO (giống FE EventFormPage.localToIso)
function localToIso(localStr) {
  return new Date(localStr).toISOString();
}

// Helper: chuyển BE date về Date đáng tin (giống FE normalizeBeDate)
function safeDate(s) {
  if (!s || typeof s !== "string") return null;
  if (/[Zz]$|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
  if (!/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) return new Date(s);
  return new Date(s.replace(" ", "T") + "Z");
}

(async () => {
  const t = await createTestRunner("EVT-BUGS", "Events tester bugs verify (BE deployed)");
  const ok = await t.login();
  if (!ok) return t.done();

  // Nav để page context có /bizapi base + cookies
  await t.goto("/ch_events");
  await t.page.waitForTimeout(1500);

  const stamp = Date.now();
  const stampIso = new Date(stamp).toISOString();

  // FE-style local datetime input (như user gõ trên datetime picker)
  // Lấy giờ local + 7 ngày nữa để event chưa kết thúc
  function localPlusDays(days, hour, min = 0) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, min, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Datetime input giống FE (datetime-local format, no TZ marker — local time)
  const startLocal = localPlusDays(7, 14, 30); // 14:30 local 7 ngày sau
  const endLocal = localPlusDays(7, 17, 0);
  // regOpen từ 30 ngày trước để ra ngoài mọi side-effect timezone window edge-case
  const regOpenLocal = localPlusDays(-30, 0);
  const regCloseLocal = localPlusDays(6, 23, 59);

  // Convert sang UTC ISO để gửi BE (giống FE localToIso)
  const startUtc = localToIso(startLocal);
  const endUtc = localToIso(endLocal);

  t.log("📝", `Local input start: ${startLocal} → UTC ISO: ${startUtc}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 1 — Tạo event với add-ons + bankAccountOverride.qrImageUrl
  // ════════════════════════════════════════════════════════════════════
  const QR_URL = "https://reborn.vn/uploads/test-qr-" + stamp + ".png";

  const createPayload = {
    title: `[TEST-BUG] Workshop — ${stamp}`,
    description: "Test event để verify 4 bug tester báo sau BE deploy.",
    content: "<p>Test content</p>",
    startDate: startUtc,
    endDate: endUtc,
    registrationOpenDate: localToIso(regOpenLocal),
    registrationCloseDate: localToIso(regCloseLocal),
    venue: { name: "Test Venue", address: "Test Address", city: "TP.HCM", isOnline: false },
    contactPerson: { name: "Test Admin", phone: "0900000000", email: "test@reborn.vn" },
    maxAttendees: 50,
    ticketPrice: 200000,
    category: "workshop",
    tags: ["test-bug", "verify"],
    status: "published",
    addOnItems: [
      { id: "ad-kit", name: "Bộ kit yoga", unitPrice: 50000, unit: "bộ" },
      { id: "ad-snack", name: "Ăn nhẹ", unitPrice: 30000, unit: "suất" },
    ],
    requirePaymentProof: true,
    bankAccountOverride: {
      bank: "VCB",
      holder: "NGUYEN VAN TEST",
      accountNumber: "0123456789",
      phone: "0987654321",
      qrImageUrl: QR_URL,
    },
  };

  t.log("➡️", "STEP 1 — Tạo event qua POST /events/create");
  const createRes = await t.page.evaluate(async (payload) => {
    const resp = await fetch("/bizapi/market/events/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, createPayload);

  const created = createRes.body?.result;
  t.assert(
    "STEP1-create",
    createRes.status === 200 && createRes.body?.code === 0 && created?.id,
    created
      ? `id=${created.id}, slug=${created.slug}`
      : `FAIL status=${createRes.status}: ${JSON.stringify(createRes.body).slice(0, 300)}`,
  );

  if (!created?.id) return t.done();

  const eventId = created.id;
  const eventSlug = created.slug;

  // BE create bỏ qua status payload → mặc định "draft". Phải gọi publish riêng.
  t.log("➡️", "STEP 1b — Publish event để public endpoint thấy");
  const publishRes = await t.page.evaluate(async (id) => {
    const resp = await fetch(`/bizapi/market/events/publish?id=${id}`, { method: "POST" });
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, eventId);
  t.assert(
    "STEP1b-publish",
    publishRes.status === 200 && publishRes.body?.code === 0,
    `publish status=${publishRes.status}, body=${JSON.stringify(publishRes.body).slice(0, 200)}`,
  );

  // ════════════════════════════════════════════════════════════════════
  // STEP 2 — Verify Bug 4 (timezone): GET event và so sánh datetime
  // ════════════════════════════════════════════════════════════════════
  t.log("➡️", "STEP 2 — Verify timezone round-trip (Bug 4)");
  const getEventRes = await t.page.evaluate(async (id) => {
    const resp = await fetch(`/bizapi/market/events/get?id=${id}`);
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, eventId);

  const gotEvent = getEventRes.body?.result;
  if (!gotEvent) {
    t.assert("STEP2-fetch", false, `GET event fail: ${JSON.stringify(getEventRes).slice(0, 300)}`);
  } else {
    // Parse startDate đã normalize → so với startUtc gốc
    const beStartRaw = gotEvent.startDate ?? gotEvent.start_date;
    const beStart = safeDate(beStartRaw);
    const sentStart = new Date(startUtc);
    const diffMs = beStart ? Math.abs(beStart.getTime() - sentStart.getTime()) : Number.MAX_SAFE_INTEGER;

    t.assert(
      "BUG4-startDate-roundtrip",
      diffMs < 60000, // <1 phút sai số (BE có thể strip ms hoặc seconds)
      `sent=${startUtc} | BE raw="${beStartRaw}" | parsed=${beStart?.toISOString()} | diff=${diffMs}ms`,
    );

    const beEndRaw = gotEvent.endDate ?? gotEvent.end_date;
    const beEnd = safeDate(beEndRaw);
    const sentEnd = new Date(endUtc);
    const diffEnd = beEnd ? Math.abs(beEnd.getTime() - sentEnd.getTime()) : Number.MAX_SAFE_INTEGER;
    t.assert(
      "BUG4-endDate-roundtrip",
      diffEnd < 60000,
      `sent=${endUtc} | BE raw="${beEndRaw}" | diff=${diffEnd}ms`,
    );

    // Verify giờ local hiển thị đúng input (ví dụ user gõ 14:30 → đọc lại phải 14:30)
    const expectedHour = parseInt(startLocal.slice(11, 13), 10);
    const expectedMin = parseInt(startLocal.slice(14, 16), 10);
    const beStartHour = beStart?.getHours();
    const beStartMin = beStart?.getMinutes();
    t.assert(
      "BUG4-display-hour",
      beStartHour === expectedHour && beStartMin === expectedMin,
      `Local input ${expectedHour}:${expectedMin} ↔ BE-parsed local ${beStartHour}:${beStartMin}`,
    );

    // ════════════════════════════════════════════════════════════════
    // STEP 3 — Verify Bug 3 (QR + bank info): bankAccountOverride.qrImageUrl
    // ════════════════════════════════════════════════════════════════
    t.log("➡️", "STEP 3 — Verify bankAccountOverride.qrImageUrl persist (Bug 3)");
    let bank = gotEvent.bankAccountOverride ?? gotEvent.bank_account_override;
    if (typeof bank === "string") {
      try { bank = JSON.parse(bank); } catch {}
    }
    t.assert(
      "BUG3-bank-exists",
      bank && typeof bank === "object",
      `bankAccountOverride: ${JSON.stringify(bank).slice(0, 200)}`,
    );
    t.assert(
      "BUG3-qrImageUrl-persist",
      bank?.qrImageUrl === QR_URL,
      `Sent="${QR_URL}" | BE return="${bank?.qrImageUrl ?? "(none)"}"`,
    );
    t.assert(
      "BUG3-bank-info-persist",
      bank?.bank === "VCB" && bank?.accountNumber === "0123456789",
      `bank=${bank?.bank} | accountNumber=${bank?.accountNumber} | holder=${bank?.holder}`,
    );

    // Verify public endpoint cũng trả qrImageUrl (critical cho share page)
    t.log("➡️", "STEP 3b — Verify GET /events/public trả qrImageUrl");
    const publicRes = await t.page.evaluate(async (slug) => {
      const resp = await fetch(`/bizapi/market/events/public?slug=${encodeURIComponent(slug)}`);
      return { status: resp.status, body: await resp.json().catch(() => null) };
    }, eventSlug);
    let publicBank = publicRes.body?.result?.bankAccountOverride ?? publicRes.body?.result?.bank_account_override;
    if (typeof publicBank === "string") {
      try { publicBank = JSON.parse(publicBank); } catch {}
    }
    t.assert(
      "BUG3-qrImageUrl-public",
      publicBank?.qrImageUrl === QR_URL,
      `Public endpoint qrImageUrl=${publicBank?.qrImageUrl ?? "(none)"}`,
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 3c — Diagnostic: dump status + datetime của event sau create
  // ════════════════════════════════════════════════════════════════════
  t.log("🔬", "STEP 3c — Diagnostic dump event status + datetime");
  if (gotEvent) {
    const debugInfo = {
      status: gotEvent.status,
      startDate: gotEvent.startDate ?? gotEvent.start_date,
      endDate: gotEvent.endDate ?? gotEvent.end_date,
      registrationOpenDate: gotEvent.registrationOpenDate ?? gotEvent.registration_open_date,
      registrationCloseDate: gotEvent.registrationCloseDate ?? gotEvent.registration_close_date,
    };
    console.log("    [admin-get]", JSON.stringify(debugInfo));
  }

  // GET public TRƯỚC khi register để biết public endpoint có thấy event không
  const pubGetRes = await t.page.evaluate(async (slug) => {
    const resp = await fetch(`/bizapi/market/events/public?slug=${encodeURIComponent(slug)}`);
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, eventSlug);
  const publicEvent = pubGetRes.body?.result;
  t.assert(
    "STEP3c-public-get",
    pubGetRes.status === 200 && pubGetRes.body?.code === 0 && publicEvent?.id,
    publicEvent
      ? `Public endpoint thấy event id=${publicEvent.id}, status=${publicEvent.status}, regOpen=${publicEvent.registrationOpenDate ?? publicEvent.registration_open_date}, regClose=${publicEvent.registrationCloseDate ?? publicEvent.registration_close_date}`
      : `Public endpoint KHÔNG thấy event: ${JSON.stringify(pubGetRes.body).slice(0, 200)}`,
  );

  // ════════════════════════════════════════════════════════════════════
  // STEP 4 — Public-register với totalAmount + selectedAddOns
  // ════════════════════════════════════════════════════════════════════
  t.log("➡️", "STEP 4 — Public register với totalAmount + selectedAddOns (Bug 2)");

  // ticket 200k + (kit ×2) 100k + (snack ×3) 90k = 390k
  const expectedTotal = 200000 + 2 * 50000 + 3 * 30000;

  const regPayload = {
    fullName: `Tester Verify ${stamp}`,
    phone: `0901${String(stamp).slice(-6)}`,
    email: `tester+${stamp}@reborn.vn`,
    source: "public_portal",
    totalAmount: expectedTotal,
    selectedAddOns: [
      { addOnId: "ad-kit", qty: 2 },
      { addOnId: "ad-snack", qty: 3 },
    ],
  };

  const regRes = await t.page.evaluate(async ({ slug, body }) => {
    const resp = await fetch(`/bizapi/market/events/public/register?slug=${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, { slug: eventSlug, body: regPayload });

  const regId = regRes.body?.result?.id;
  t.assert(
    "STEP4-register",
    regRes.status === 200 && regRes.body?.code === 0 && regId,
    regId
      ? `regId=${regId}, status=${regRes.body.result.status}`
      : `FAIL: ${JSON.stringify(regRes.body).slice(0, 300)}`,
  );

  if (!regId) {
    await t.done();
    return;
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 5 — Verify Bug 2: totalAmount + selectedAddOns persist qua list
  // ════════════════════════════════════════════════════════════════════
  t.log("➡️", "STEP 5 — Verify totalAmount + selectedAddOns persist (Bug 2)");
  const listRegs = await t.page.evaluate(async (id) => {
    const resp = await fetch(`/bizapi/market/events/registrations?eventId=${id}`);
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, eventId);

  const items = listRegs.body?.result?.items ?? listRegs.body?.result ?? [];
  const itemsArr = Array.isArray(items) ? items : (items.items ?? []);
  const myReg = itemsArr.find((r) => r.id === regId);

  t.assert(
    "BUG2-reg-in-list",
    !!myReg,
    myReg ? `Tìm thấy reg id=${regId}` : `KHÔNG thấy reg trong list (${itemsArr.length} items)`,
  );

  if (myReg) {
    // totalAmount
    const beTotal = myReg.totalAmount ?? myReg.total_amount;
    t.assert(
      "BUG2-totalAmount-persist",
      beTotal === expectedTotal,
      `Sent ${expectedTotal} | BE return ${beTotal}`,
    );

    // selectedAddOns — BE có thể trả JSON string (double-encoded) hoặc array.
    // Loop parse tối đa 2 lần để xử lý cả 2 trường hợp.
    let beAddOns = myReg.selectedAddOns ?? myReg.selected_add_ons;
    const rawAddOnsRepr = typeof beAddOns === "string" ? beAddOns : JSON.stringify(beAddOns);
    for (let i = 0; i < 2 && typeof beAddOns === "string"; i++) {
      try { beAddOns = JSON.parse(beAddOns); } catch { break; }
    }
    const has2Items = Array.isArray(beAddOns) && beAddOns.length === 2;
    const hasKit = Array.isArray(beAddOns) && beAddOns.some((a) => a.addOnId === "ad-kit" && Number(a.qty) === 2);
    const hasSnack = Array.isArray(beAddOns) && beAddOns.some((a) => a.addOnId === "ad-snack" && Number(a.qty) === 3);
    t.assert(
      "BUG2-selectedAddOns-persist",
      has2Items && hasKit && hasSnack,
      `BE raw=${rawAddOnsRepr.slice(0, 150)} | parsed=${JSON.stringify(beAddOns).slice(0, 150)}`,
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 6 — Verify ticketCode auto-issue khi confirm (Bug 2 phần "Vé")
  // ════════════════════════════════════════════════════════════════════
  t.log("➡️", "STEP 6 — Update status=confirmed → verify ticketCode auto-issue");
  const updateRes = await t.page.evaluate(async ({ regId }) => {
    const resp = await fetch(`/bizapi/market/events/registrations/update?id=${regId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, { regId });

  t.assert(
    "STEP6-update-status",
    updateRes.status === 200,
    `Update response status=${updateRes.status}`,
  );

  // GET lại reg và check ticketCode + confirmedAt
  const reFetch = await t.page.evaluate(async (id) => {
    const resp = await fetch(`/bizapi/market/events/registrations?eventId=${id}`);
    return { status: resp.status, body: await resp.json().catch(() => null) };
  }, eventId);
  const reItems = reFetch.body?.result?.items ?? reFetch.body?.result ?? [];
  const reItemsArr = Array.isArray(reItems) ? reItems : (reItems.items ?? []);
  const updatedReg = reItemsArr.find((r) => r.id === regId);

  if (updatedReg) {
    t.assert(
      "BUG2-ticketCode-auto-issue",
      typeof updatedReg.ticketCode === "string" && updatedReg.ticketCode.length > 3,
      `ticketCode after confirm = "${updatedReg.ticketCode ?? "(null)"}"`,
    );
    t.assert(
      "BUG2-confirmedAt-set",
      !!(updatedReg.confirmedAt ?? updatedReg.confirmed_at),
      `confirmedAt = "${updatedReg.confirmedAt ?? updatedReg.confirmed_at ?? "(null)"}"`,
    );
    t.assert(
      "BUG2-status-confirmed",
      updatedReg.status === "confirmed",
      `status = "${updatedReg.status}"`,
    );
  } else {
    t.assert("BUG2-refetch", false, "Không tìm lại được reg sau update");
  }

  // ════════════════════════════════════════════════════════════════════
  // STEP 7 — Verify Bug 1: Stats khớp với data thật
  // ════════════════════════════════════════════════════════════════════
  // FE-only fix — không cần API endpoint. Verify gián tiếp: nếu STEP 5 + 6
  // đều OK thì stats trong UI sẽ tự đúng. Skip API call.
  t.log("ℹ️", "Bug 1 (Stats) là FE-only fix — đã verify qua unit test.");

  // ════════════════════════════════════════════════════════════════════
  // CLEANUP — xoá event test (best-effort, không assert)
  // ════════════════════════════════════════════════════════════════════
  await t.page.evaluate(async (id) => {
    try {
      await fetch(`/bizapi/market/events/delete?id=${id}`, { method: "DELETE" });
    } catch {}
  }, eventId);

  await t.done();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
