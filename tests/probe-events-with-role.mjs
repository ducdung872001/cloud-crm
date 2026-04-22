/**
 * Xác nhận: khi gửi header Selectedrole đầy đủ, events vẫn 403 → BE-side issue chứ không phải FE.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("EVT-ROLE", "Events with Selectedrole");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/dashboard");
  await t.page.waitForTimeout(1500);

  // Verify localStorage SelectedRole
  const ls = await t.page.evaluate(() => localStorage.getItem("SelectedRole"));
  console.log("\nSelectedRole in localStorage:", ls);

  // Log headers thực tế đang gửi khi page fetch
  t.page.on("request", (req) => {
    if (req.url().includes("/events/") || req.url().includes("/promotion/")) {
      const h = req.headers();
      console.log(`→ ${req.method()} ${req.url().slice(-60)}`);
      console.log(`  Selectedrole: ${h.selectedrole || "(missing!)"}`);
      console.log(`  Authorization: ${h.authorization ? "Bearer …" : "(missing!)"}`);
      console.log(`  Hostname: ${h.hostname || "(missing!)"}`);
    }
  });

  // Test events qua fetch interceptor FE
  const r1 = await t.page.evaluate(async () => {
    const res = await fetch("/bizapi/market/events/list?page=1&limit=5");
    return { status: res.status, body: (await res.text()).slice(0, 200) };
  });
  console.log("\n[via FE interceptor] /events/list:", r1);

  // Test events qua direct fetch với header rõ ràng
  const r2 = await t.page.evaluate(async (role) => {
    const token = (document.cookie.split(";").find((c) => c.trim().startsWith("token=")) || "").trim().slice(6);
    const res = await fetch("https://biz.reborn.vn/market/events/list?page=1&limit=5", {
      headers: {
        Authorization: `Bearer ${token}`,
        Hostname: "hub.reborn.vn",
        Selectedrole: role || "",
        Accept: "application/json",
      },
    });
    return { status: res.status, body: (await res.text()).slice(0, 200) };
  }, ls);
  console.log("\n[direct w/ Selectedrole] /events/list:", r2);

  // Thử /promotion/list (ref) — để so sánh perm mapping
  const r3 = await t.page.evaluate(async () => {
    const res = await fetch("/bizapi/market/promotion/list?page=1&limit=5");
    return { status: res.status, body: (await res.text()).slice(0, 200) };
  });
  console.log("\n[via FE] /promotion/list:", r3);

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
