/**
 * test-events-unit.mjs — Unit test cho 2 helper FE đã thêm để fix bug tester báo:
 *
 *   1) normalizeBeDate(s) — append "Z" cho naive ISO không có TZ marker
 *      → fix bug "Thời gian lưu data sai so với input" (tester item #4).
 *      Source: src/pages/CommunityHub/Events/storage.ts
 *
 *   2) computeRegistrationTotal(r, event) — fallback compute totalAmount
 *      khi BE không trả → fix cột "Tổng tiền" hiển thị "—" (tester item #2).
 *      Source: src/pages/CommunityHub/Events/shared.ts
 *
 * Pattern: re-implement function logic trong test này (đồng bộ với source).
 * Lý do: source là TypeScript có React/service imports — import thẳng trong
 * Node ESM sẽ fail. Khi đổi logic ở source nhớ đồng bộ ở đây.
 *
 * Run: node tests/test-events-unit.mjs
 */
import assert from "node:assert/strict";

// ════════════════════════════════════════════════════════════════════════
// FUNCTIONS UNDER TEST — đồng bộ verbatim với source (.ts)
// ════════════════════════════════════════════════════════════════════════

/** normalizeBeDate — append "Z" nếu BE trả naive ISO không có TZ marker. */
function normalizeBeDate(s) {
  if (!s || typeof s !== "string") return s;
  if (/[Zz]$|[+-]\d{2}:?\d{2}$/.test(s)) return s;
  if (!/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) return s;
  return s.replace(" ", "T") + "Z";
}

/** computeRegistrationTotal — fallback compute từ ticketPrice + Σ(addOn × qty). */
function computeRegistrationTotal(r, event) {
  if (typeof r.totalAmount === "number" && r.totalAmount > 0) return r.totalAmount;
  const ticket = event.ticketPrice ?? 0;
  const addons = (r.selectedAddOns ?? []).reduce((acc, sel) => {
    const item = (event.addOnItems ?? []).find((i) => i.id === sel.addOnId);
    return acc + (item ? item.unitPrice * sel.qty : 0);
  }, 0);
  return ticket + addons;
}

// ════════════════════════════════════════════════════════════════════════
// TESTS
// ════════════════════════════════════════════════════════════════════════
const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
    console.log(`✅  ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
    console.log(`❌  ${name}\n    ${e.message}`);
  }
}

// ── normalizeBeDate ──
test("normalizeBeDate: ISO với Z giữ nguyên", () => {
  assert.equal(
    normalizeBeDate("2026-04-25T07:00:00.000Z"),
    "2026-04-25T07:00:00.000Z",
  );
});

test("normalizeBeDate: ISO với offset +07:00 giữ nguyên", () => {
  assert.equal(
    normalizeBeDate("2026-04-25T14:00:00+07:00"),
    "2026-04-25T14:00:00+07:00",
  );
});

test("normalizeBeDate: ISO với offset -0500 giữ nguyên", () => {
  assert.equal(
    normalizeBeDate("2026-04-25T02:00:00-0500"),
    "2026-04-25T02:00:00-0500",
  );
});

test("normalizeBeDate: naive ISO không TZ → append Z", () => {
  assert.equal(
    normalizeBeDate("2026-04-25T07:00:00"),
    "2026-04-25T07:00:00Z",
  );
});

test("normalizeBeDate: naive ISO có ms không TZ → append Z", () => {
  assert.equal(
    normalizeBeDate("2026-04-25T07:00:00.123"),
    "2026-04-25T07:00:00.123Z",
  );
});

test("normalizeBeDate: SQL format 'YYYY-MM-DD HH:mm:ss' → T + Z", () => {
  assert.equal(
    normalizeBeDate("2026-04-25 07:00:00"),
    "2026-04-25T07:00:00Z",
  );
});

test("normalizeBeDate: empty / null / undefined → trả nguyên", () => {
  assert.equal(normalizeBeDate(""), "");
  assert.equal(normalizeBeDate(null), null);
  assert.equal(normalizeBeDate(undefined), undefined);
});

test("normalizeBeDate: non-string (number) → giữ nguyên", () => {
  assert.equal(normalizeBeDate(12345), 12345);
});

test("normalizeBeDate: chuỗi không phải datetime → giữ nguyên", () => {
  assert.equal(normalizeBeDate("hello"), "hello");
  assert.equal(normalizeBeDate("2026-04-25"), "2026-04-25"); // chỉ date không time
});

test("normalizeBeDate: round-trip với new Date() — naive được fix", () => {
  // Bug repro: BE trả "2026-04-25T07:00:00" → JS coi là local time → giờ lệch.
  // Sau fix: thành "2026-04-25T07:00:00Z" → JS parse UTC → format đúng.
  const fixed = normalizeBeDate("2026-04-25T07:00:00");
  const d = new Date(fixed);
  assert.equal(d.getUTCHours(), 7, "UTC giờ phải = 7 sau khi fix");
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 3); // April = index 3
  assert.equal(d.getUTCDate(), 25);
});

// ── computeRegistrationTotal ──
const sampleEvent = {
  ticketPrice: 100000,
  addOnItems: [
    { id: "ad-1", name: "Bộ kit yoga", unitPrice: 50000, unit: "bộ" },
    { id: "ad-2", name: "Ăn nhẹ", unitPrice: 30000, unit: "suất" },
  ],
};

test("computeRegistrationTotal: dùng totalAmount nếu BE đã trả", () => {
  const r = { totalAmount: 999999, selectedAddOns: [] };
  assert.equal(computeRegistrationTotal(r, sampleEvent), 999999);
});

test("computeRegistrationTotal: BE trả 0 → fallback compute (vì 0 không hợp lệ)", () => {
  const r = { totalAmount: 0, selectedAddOns: [{ addOnId: "ad-1", qty: 2 }] };
  // ticket 100k + 2 × 50k = 200k
  assert.equal(computeRegistrationTotal(r, sampleEvent), 200000);
});

test("computeRegistrationTotal: BE thiếu totalAmount → compute từ ticket + addons", () => {
  const r = {
    selectedAddOns: [
      { addOnId: "ad-1", qty: 2 }, // 2 × 50k = 100k
      { addOnId: "ad-2", qty: 3 }, // 3 × 30k = 90k
    ],
  };
  // ticket 100k + 100k + 90k = 290k
  assert.equal(computeRegistrationTotal(r, sampleEvent), 290000);
});

test("computeRegistrationTotal: chỉ ticket, không add-on → trả ticketPrice", () => {
  const r = { selectedAddOns: [] };
  assert.equal(computeRegistrationTotal(r, sampleEvent), 100000);
});

test("computeRegistrationTotal: addon ID không match → bỏ qua, không crash", () => {
  const r = { selectedAddOns: [{ addOnId: "ad-unknown", qty: 5 }] };
  assert.equal(computeRegistrationTotal(r, sampleEvent), 100000);
});

test("computeRegistrationTotal: event miễn phí (không ticketPrice) + có add-on", () => {
  const freeEvent = { addOnItems: sampleEvent.addOnItems };
  const r = { selectedAddOns: [{ addOnId: "ad-1", qty: 1 }] };
  assert.equal(computeRegistrationTotal(r, freeEvent), 50000);
});

test("computeRegistrationTotal: event miễn phí + không add-on → 0", () => {
  const r = { selectedAddOns: [] };
  assert.equal(computeRegistrationTotal(r, {}), 0);
});

test("computeRegistrationTotal: undefined selectedAddOns → ok không crash", () => {
  const r = {};
  assert.equal(computeRegistrationTotal(r, sampleEvent), 100000);
});

// ── Tổng kết ──
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log("\n" + "=".repeat(60));
console.log(`Unit test: ${passed}/${results.length} passed, ${failed} failed`);
console.log("=".repeat(60));

if (failed > 0) {
  console.log("\nFailed cases:");
  results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.err}`));
  process.exit(1);
}
process.exit(0);
