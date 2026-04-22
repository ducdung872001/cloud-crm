/**
 * probe-events-api.mjs — Thử POST /market/events/create với 2 payload (camelCase vs snake_case)
 * để xác định BE accept format nào.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("EVT-PROBE", "Events API Probe");
  const ok = await t.login();
  if (!ok) return t.done();

  const stamp = Date.now();

  // --- Payload snake_case ---
  const snake = {
    title: `Probe SNAKE ${stamp}`,
    description: "Probe test snake_case",
    content_html: "<p>probe</p>",
    start_date: new Date(Date.now() + 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    registration_open_date: new Date().toISOString(),
    registration_close_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue_name: "Probe Venue",
    venue_address: "Probe Addr",
    venue_city: "HCMC",
    venue_is_online: false,
    contact_name: "Probe",
    contact_phone: "0912345678",
    contact_email: "probe@test.com",
    max_attendees: 10,
    ticket_price: 0,
    category: "workshop",
    tags: ["probe", "snake"],
    status: "draft",
  };

  // --- Payload camelCase (flat) ---
  const camelFlat = {
    title: `Probe CAMEL-FLAT ${stamp}`,
    description: "Probe test camelCase flat",
    content: "<p>probe</p>",
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    venueName: "Probe Venue",
    venueAddress: "Probe Addr",
    venueCity: "HCMC",
    venueIsOnline: false,
    contactName: "Probe",
    contactPhone: "0912345678",
    contactEmail: "probe@test.com",
    maxAttendees: 10,
    ticketPrice: 0,
    category: "workshop",
    tags: ["probe", "camel-flat"],
    status: "draft",
  };

  // --- Payload camelCase nested (như FE hiện tại gửi) ---
  const camelNested = {
    title: `Probe CAMEL-NESTED ${stamp}`,
    description: "Probe test camelCase nested",
    content: "<p>probe</p>",
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue: { name: "Probe Venue", address: "Probe Addr", city: "HCMC", isOnline: false },
    contactPerson: { name: "Probe", phone: "0912345678", email: "probe@test.com", role: "" },
    maxAttendees: 10,
    ticketPrice: 0,
    category: "workshop",
    tags: ["probe", "camel-nested"],
    status: "draft",
    createdBy: "Probe",
  };

  // Navigate tới 1 page có config để /bizapi route đúng
  await t.goto("/ch_events");
  await t.page.waitForTimeout(1500);

  async function postAs(label, body) {
    const result = await t.page.evaluate(async ({ body }) => {
      try {
        const res = await fetch("/bizapi/market/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const text = await res.text();
        return { status: res.status, body: text };
      } catch (e) {
        return { error: e.message };
      }
    }, { body });
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  const r1 = await postAs("SNAKE", snake);
  const r2 = await postAs("CAMEL-FLAT", camelFlat);
  const r3 = await postAs("CAMEL-NESTED", camelNested);

  // Thử list
  const list = await t.page.evaluate(async () => {
    try {
      const res = await fetch("/bizapi/market/events/list?page=1&limit=20", { method: "GET" });
      return { status: res.status, body: await res.text() };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log("\n=== LIST ===");
  console.log(JSON.stringify(list, null, 2));

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
