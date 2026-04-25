/**
 * test-events-create-from-mock.mjs — Tạo 3 sự kiện mẫu từ MOCK_EVENTS.
 *
 * LƯU Ý: BE `/market/events/create` hiện đang trả 400 "Input wrong" và
 * `/market/events/list` trả 403 (permission check map sai vào `/promotion/`).
 * Chi tiết: docs/backend-tasks/market/BACKEND-TASK-events-create-400-and-list-403.md
 *
 * Do BE hỏng, test này:
 *   1) CỐ GẮNG dùng UI form (bấm "Lưu & công bố") — ghi nhận error message FE hiển thị
 *      sau khi đã sửa storage.ts để không silently fallback.
 *   2) SEED localStorage trực tiếp với 3 event mẫu → verify hiện ra trong /ch_events list
 *      (đây là workaround khi BE chưa fix — ít nhất UI có data để demo).
 *
 * Usage: node tests/test-events-create-from-mock.mjs
 */
import { createTestRunner } from "./helpers.mjs";

function iso(daysFromNow, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const stamp = Date.now();

const MOCK_EVENTS = [
  {
    id: `evt-test-${stamp}-1`,
    slug: `workshop-yoga-test-${stamp}-1`,
    title: `Workshop Yoga cho người mới bắt đầu (test ${stamp})`,
    description: "Buổi hướng dẫn 3 giờ cho người chưa từng tập yoga. Trải nghiệm 7 asana cơ bản + breathwork.",
    content: "<h2>Nội dung buổi workshop</h2><p>7 asana cơ bản, kỹ thuật thở Pranayama, thiền thư giãn 15 phút.</p>",
    coverImageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
    startDate: iso(14, 8),
    endDate: iso(14, 11),
    registrationOpenDate: iso(-3, 0),
    registrationCloseDate: iso(13, 23),
    venue: {
      name: "Home FitPro Thảo Điền",
      address: "12 Thảo Điền, Q.2, TP.HCM",
      city: "TP.HCM",
      isOnline: false,
    },
    contactPerson: {
      name: "Nguyễn Thu Hà",
      phone: "0971234567",
      email: "ha.nguyen@reborn.vn",
      role: "HLV trưởng",
    },
    maxAttendees: 30,
    ticketPrice: 150000,
    status: "published",
    publishedAt: iso(-2, 10),
    tags: ["yoga", "workshop", "beginner"],
    category: "workshop",
    createdAt: iso(-5, 14),
    updatedAt: iso(-2, 10),
    createdBy: "W-House Admin",
  },
  {
    id: `evt-test-${stamp}-2`,
    slug: `hoi-thao-dinh-duong-test-${stamp}-2`,
    title: `Hội thảo Dinh dưỡng cho người tập thể thao (test ${stamp})`,
    description: "Chuyên gia dinh dưỡng chia sẻ phác đồ ăn uống tối ưu để tăng cơ/giảm mỡ. Miễn phí, giới hạn 50 người.",
    content: "<h2>Chương trình</h2><ul><li>19:00 — Welcome check-in</li><li>19:15 — Macro & Calo cơ bản</li><li>19:45 — Thực đơn 7 ngày</li><li>20:15 — Q&A</li></ul>",
    coverImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    startDate: iso(21, 19),
    endDate: iso(21, 21),
    registrationOpenDate: iso(-1, 0),
    registrationCloseDate: iso(20, 23),
    venue: {
      name: "Co-Working FitPro Đống Đa",
      address: "99 Láng Hạ, Đống Đa, Hà Nội",
      city: "Hà Nội",
      isOnline: false,
    },
    contactPerson: {
      name: "Trần Minh Quân",
      phone: "0988888888",
      email: "quan.tran@reborn.vn",
      role: "BTC",
    },
    maxAttendees: 50,
    ticketPrice: 0,
    status: "published",
    publishedAt: iso(-1, 9),
    tags: ["dinh-duong", "hoi-thao", "mien-phi"],
    category: "hội thảo",
    createdAt: iso(-4, 11),
    updatedAt: iso(-1, 9),
    createdBy: "W-House Admin",
  },
  {
    id: `evt-test-${stamp}-3`,
    slug: `mindfulness-online-test-${stamp}-3`,
    title: `Lớp Mindfulness cuối tuần miễn phí (test ${stamp})`,
    description: "Lớp thiền chánh niệm 90 phút mỗi sáng thứ 7, giới hạn 20 người.",
    content: "<p>Chi tiết sẽ được cập nhật thêm sau.</p>",
    startDate: iso(7, 7),
    endDate: iso(7, 8),
    registrationOpenDate: iso(-2, 0),
    registrationCloseDate: iso(6, 23),
    venue: {
      name: "Online",
      address: "Zoom",
      isOnline: true,
      onlineUrl: "https://zoom.us/j/0000000000",
    },
    contactPerson: {
      name: "Lê Hoàng Anh",
      phone: "0912345678",
    },
    maxAttendees: 20,
    ticketPrice: 0,
    status: "draft",
    tags: ["mindfulness", "online"],
    category: "lớp học",
    createdAt: iso(-1, 15),
    updatedAt: iso(-1, 15),
    createdBy: "W-House Admin",
  },
];

// ─── Fill form qua UI (thử 1 event để xác nhận error message rõ ràng) ───────
async function fillFormUI(t, ev) {
  const page = t.page;

  await page.fill('input[placeholder*="Workshop Yoga"]', ev.title);
  await page.fill('textarea[placeholder*="Mô tả ngắn gọn"]', ev.description);
  await page.selectOption('select', ev.category);
  await page.fill('input[placeholder*="yoga, beginner"]', (ev.tags || []).join(", "));

  // Editor — click + type. Nếu serialize không chạy đúng thì bỏ qua content.
  try {
    const editor = page.locator('[contenteditable="true"]').first();
    await editor.click({ timeout: 2000 });
    await page.keyboard.type(ev.description, { delay: 10 });
  } catch { /* editor optional */ }

  // DatePickerCustom masked input expects "dd/mm/yyyy hh:MM" (24h). Map sang dạng masked.
  const toMasked = (isoStr) => {
    const d = new Date(isoStr);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  // Sau khi replace datetime-local → DatePickerCustom, input là text mask.
  // Tìm 4 input masked bên trong Section "3. Thời gian".
  const sec3 = page.locator('xpath=//div[./div[starts-with(text(),"3. Thời gian")]]');
  const dt = sec3.locator('input[type="text"]').or(sec3.locator('input:not([type])'));
  const vals = [ev.startDate, ev.endDate, ev.registrationOpenDate, ev.registrationCloseDate].map(toMasked);
  for (let i = 0; i < 4; i++) {
    await dt.nth(i).click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(vals[i], { delay: 5 });
    await page.keyboard.press("Escape");
  }

  if (ev.venue.isOnline) {
    await page.click('input[type="checkbox"]');
    await page.waitForTimeout(200);
    await page.fill('input[placeholder*="zoom.us"]', ev.venue.onlineUrl);
  } else {
    // Selectors chuẩn xác: dùng placeholder exact của code hiện tại
    await page.fill('input[placeholder="VD: Home FitPro Thảo Điền"]', ev.venue.name);
    await page.fill('input[placeholder="12 Thảo Điền, Q.2"]', ev.venue.address);
    await page.fill('input[placeholder="TP.HCM"]', ev.venue.city || "");
  }

  // Section 5 — scope bằng XPath: div chứa immediate child div text "5. Người liên hệ"
  const sec5 = page.locator('xpath=//div[./div[starts-with(text(),"5. Người liên hệ")]]');
  const inputs5 = sec5.locator('input');
  await inputs5.nth(0).fill(ev.contactPerson.name);
  if (ev.contactPerson.role) await inputs5.nth(1).fill(ev.contactPerson.role);
  await inputs5.nth(2).fill(ev.contactPerson.phone);
  if (ev.contactPerson.email) await inputs5.nth(3).fill(ev.contactPerson.email);

  // Sidebar: sức chứa + giá vé
  if (ev.maxAttendees) await page.fill('input[placeholder="VD: 50"]', String(ev.maxAttendees));
  if (ev.ticketPrice !== undefined) await page.fill('input[placeholder="VD: 150000"]', String(ev.ticketPrice));
}

(async () => {
  const t = await createTestRunner("EVT-CREATE", "Events Create from MOCK");
  const ok = await t.login();
  if (!ok) return t.done();

  // ─── PHẦN 1: Thử UI form với event đầu tiên để confirm error message ───
  t.log("🎯", "Phần 1: Thử tạo qua UI để verify FE hiển thị lỗi BE rõ ràng");
  await t.goto("/ch_events/create");
  await t.page.waitForTimeout(1500);
  try {
    await fillFormUI(t, MOCK_EVENTS[0]);
    await t.screenshot("ui-filled");
    await t.clickText("Lưu & công bố", "button");
    await t.page.waitForTimeout(4000);

    // Check: FE phải hiển thị error "Input wrong" thay vì navigate ngầm
    const errorVisible = await t.page.evaluate(() => {
      const body = document.body.innerText || "";
      return body.includes("Lưu thất bại") || body.includes("Input wrong");
    });
    const stillOnCreate = t.page.url().includes("/ch_events/create");
    t.assert("UI-error-surfaced", errorVisible || stillOnCreate,
      errorVisible ? "FE hiển thị error message (Input wrong từ BE) — FIXED silent fallback"
                   : stillOnCreate ? "Còn ở page create (không navigate) — BE lỗi, FE không fallback ngầm"
                                   : "BẤT THƯỜNG: navigate sang detail page → FE có thể đã fallback localStorage");
    await t.screenshot("ui-after-save");
  } catch (err) {
    t.assert("UI-form-fill", false, `Fill UI lỗi: ${err.message}`);
  }

  // ─── PHẦN 2: Seed 3 event vào localStorage trực tiếp ───
  // Vì BE /market/events/create trả 400 "Input wrong" (BE bug),
  // data không vào DB được. Workaround: ghi vào localStorage để UI có data demo.
  t.log("🌱", "Phần 2: Seed 3 event vào localStorage (workaround BE hỏng)");
  await t.goto("/ch_events");
  await t.page.waitForTimeout(1500);

  const seedResult = await t.page.evaluate((events) => {
    const KEY = "reborn.events";
    const existing = JSON.parse(localStorage.getItem(KEY) || "[]");
    // Xoá trùng theo id trước khi thêm
    const existingIds = new Set(events.map((e) => e.id));
    const filtered = existing.filter((e) => !existingIds.has(e.id));
    const combined = [...events, ...filtered];
    localStorage.setItem(KEY, JSON.stringify(combined));
    return { seeded: events.length, total: combined.length };
  }, MOCK_EVENTS);
  t.log("💾", `Đã seed ${seedResult.seeded} event — tổng localStorage: ${seedResult.total}`);

  // Reload để UI đọc lại từ localStorage
  await t.page.reload({ waitUntil: "load" });
  await t.page.waitForTimeout(3000);
  await t.screenshot("list-after-seed");

  // ─── PHẦN 3: Verify 3 event hiển thị trong UI ───
  const uiCheck = await t.page.evaluate((titles) => {
    const body = document.body.innerText || "";
    return titles.map((title) => ({ title, visible: body.includes(title) }));
  }, MOCK_EVENTS.map((e) => e.title));

  for (const c of uiCheck) {
    t.assert(`UI-show-${c.title.slice(0, 30)}`, c.visible,
      c.visible ? `"${c.title.slice(0, 50)}" HIỂN THỊ trong list`
                : `"${c.title.slice(0, 50)}" KHÔNG thấy trong list`);
  }

  // ─── PHẦN 4: Verify qua localStorage ───
  const lsCheck = await t.page.evaluate((ids) => {
    const events = JSON.parse(localStorage.getItem("reborn.events") || "[]");
    return ids.map((id) => ({ id, found: !!events.find((e) => e.id === id) }));
  }, MOCK_EVENTS.map((e) => e.id));

  for (const c of lsCheck) {
    t.assert(`LS-${c.id}`, c.found, c.found ? "Có trong localStorage" : "Thiếu trong localStorage");
  }

  // ─── PHẦN 5: Thử API list lần nữa để re-confirm BE status ───
  const apiList = await t.page.evaluate(async () => {
    try {
      const res = await fetch("/bizapi/market/events/list?page=1&limit=20");
      return { status: res.status, body: (await res.text()).slice(0, 200) };
    } catch (e) { return { error: e.message }; }
  });
  t.log("🔌", `API /events/list status=${apiList.status}: ${apiList.body}`);
  t.assert("BE-list-still-broken",
    apiList.status === 403 || apiList.status === 404 || apiList.status >= 500,
    `BE list return ${apiList.status} — xác nhận BE chưa fix (xem docs/backend-tasks/market/)`);

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
