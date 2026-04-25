/**
 * cleanup-test-events.mjs — Xoá tất cả event có title prefix "[TEST-BUG]" để
 * không để lại artifact trên DB khách hàng.
 */
import { createTestRunner } from "./helpers.mjs";

(async () => {
  const t = await createTestRunner("CLEANUP", "Cleanup TEST-BUG events");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/ch_events");
  await t.page.waitForTimeout(1500);

  // List events
  const list = await t.page.evaluate(async () => {
    const resp = await fetch("/bizapi/market/events/list?page=1&limit=200");
    return { status: resp.status, body: await resp.json().catch(() => null) };
  });

  const items = list.body?.result?.items ?? [];
  const testEvents = items.filter((e) => (e.title ?? "").startsWith("[TEST-BUG]"));
  t.log("🧹", `Found ${testEvents.length} test event(s) to delete`);

  for (const ev of testEvents) {
    const res = await t.page.evaluate(async (id) => {
      const resp = await fetch(`/bizapi/market/events/delete?id=${id}`, {
        method: "DELETE",
      });
      return { status: resp.status, body: await resp.json().catch(() => null) };
    }, ev.id);
    t.assert(
      `delete-${ev.id}`,
      res.status === 200,
      `${ev.title} (id=${ev.id}) → ${res.status} ${JSON.stringify(res.body).slice(0, 100)}`,
    );
  }

  await t.done();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
