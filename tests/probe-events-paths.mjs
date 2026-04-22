/**
 * Probe các endpoint path khác nhau để tìm đúng BE route cho events.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("EVT-PATHS", "Events Path Probe");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/ch_events");
  await t.page.waitForTimeout(1000);

  const body = {
    title: "Probe " + Date.now(),
    description: "probe",
    start_date: new Date(Date.now() + 86400000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    registration_open_date: new Date().toISOString(),
    registration_close_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    venue_is_online: true,
    venue_online_url: "https://zoom.us/j/1",
    contact_name: "X",
    contact_phone: "0912345678",
    status: "draft",
  };

  const paths = [
    // FE hiện tại
    ["POST", "/bizapi/market/events/create"],
    // Theo spec docs/events/backend-spec.md
    ["POST", "/bizapi/marketing/events"],
    ["POST", "/bizapi/marketing/events/create"],
    // REST style
    ["POST", "/bizapi/market/events"],
    // Thử không qua /bizapi
    ["POST", "/market/events/create"],
    ["POST", "/marketing/events"],
    // GET list
    ["GET", "/bizapi/market/events/list"],
    ["GET", "/bizapi/marketing/events"],
    ["GET", "/bizapi/market/events"],
  ];

  for (const [method, path] of paths) {
    const r = await t.page.evaluate(async ({ method, path, body }) => {
      try {
        const opts = {
          method,
          headers: { "Content-Type": "application/json" },
        };
        if (method === "POST") opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        const text = await res.text();
        return { status: res.status, body: text.slice(0, 300) };
      } catch (e) {
        return { error: e.message };
      }
    }, { method, path, body });
    console.log(`\n${method} ${path}  →  status=${r.status}`);
    console.log("  body:", (r.body || r.error || "").replace(/\n/g, " "));
  }

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
