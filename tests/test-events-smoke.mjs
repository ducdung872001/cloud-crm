import { createTestRunner } from "./helpers.mjs";

const ROUTES = [
  ["EVT-SMK-001", "/ch_events", "Event List", ["Quản lý sự kiện", "Tạo sự kiện"]],
  ["EVT-SMK-002", "/ch_events/create", "Event Form Create", ["Tạo sự kiện mới", "Thông tin cơ bản"]],
  ["EVT-SMK-003", "/ch_events/evt-seed-1", "Event Detail", ["Workshop Yoga", "Người đăng ký", "Chia sẻ"]],
  ["EVT-SMK-004", "/share_event?slug=workshop-yoga-cho-nguoi-moi-bat-dau-demo", "Public Share Page", ["Đăng ký tham gia", "Workshop Yoga"]],
];

(async () => {
  const t = await createTestRunner("EVT-SMK", "Events Module Smoke");
  const ok = await t.login();
  if (!ok) return t.done();

  const consoleErrors = [];
  t.page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!txt.includes("favicon") && !txt.includes("Failed to load resource") && !txt.toLowerCase().includes("websocket")) {
        consoleErrors.push(txt);
      }
    }
  });

  for (const [tc, route, label, expectedTexts] of ROUTES) {
    consoleErrors.length = 0;
    await t.goto(route);
    await t.page.waitForTimeout(2000);
    await t.screenshot(`${tc}-${label.replace(/\s+/g, "_")}`);
    let foundAny = false;
    for (const text of expectedTexts) {
      if (await t.hasText(text)) { foundAny = true; break; }
    }
    t.assert(`${tc}-render`, foundAny, `${label} render: [${expectedTexts.join(", ")}]`);
    t.assert(`${tc}-no-error`, consoleErrors.length === 0,
      consoleErrors.length === 0 ? `${label} clean` : `${label} có ${consoleErrors.length} console errors: ${consoleErrors.slice(0, 2).join(" | ")}`);
  }

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
