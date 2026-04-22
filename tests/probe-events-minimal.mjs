/**
 * Probe với body tối thiểu + log headers thật đang gửi để xem BE đang nhận gì.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("EVT-MIN", "Events Minimal Probe");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/ch_events");
  await t.page.waitForTimeout(1000);

  // Log headers đang được gửi
  t.page.on("request", (req) => {
    if (req.url().includes("/events/")) {
      console.log(`\n→ ${req.method()} ${req.url()}`);
      const h = req.headers();
      console.log("  headers:", JSON.stringify({
        auth: h.authorization ? "Bearer …" : "(none)",
        hostname: h.hostname,
        selectedrole: h.selectedrole,
        ct: h["content-type"],
      }));
      if (req.postData()) console.log("  body:", req.postData().slice(0, 400));
    }
  });

  const probes = [
    ["empty body", {}],
    ["just title", { title: "Probe" }],
    ["title + tenantId", { title: "Probe", tenantId: 336 }],
    ["title + tenant_id", { title: "Probe", tenant_id: 336 }],
    ["required core snake",
      {
        title: "Probe " + Date.now(),
        description: "desc",
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        registration_open_date: new Date().toISOString(),
        registration_close_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        venue_is_online: true,
        venue_online_url: "https://zoom.us/1",
        contact_name: "N",
        contact_phone: "0912345678",
      },
    ],
  ];

  for (const [label, body] of probes) {
    const r = await t.page.evaluate(async ({ body }) => {
      try {
        const res = await fetch("/bizapi/market/events/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        return { status: res.status, body: (await res.text()).slice(0, 400) };
      } catch (e) { return { error: e.message }; }
    }, { body });
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(r));
  }

  // Xem token payload để biết user có quyền gì
  const tokenInfo = await t.page.evaluate(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    const token = tokenCookie?.slice(6);
    if (!token) return { error: "no token cookie" };
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { user: payload.user, exp: payload.exp };
    } catch (e) { return { error: e.message }; }
  });
  console.log("\n=== TOKEN INFO ===");
  console.log(JSON.stringify(tokenInfo, null, 2));

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
