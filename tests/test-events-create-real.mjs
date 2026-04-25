/**
 * test-events-create-real.mjs — Tạo 3 event MOCK thật vào DB qua API BE.
 *
 * BE market-service đã fix permission — /market/events/list + /create hoạt động.
 * Test này bypass UI form (mask datetime khó fill), gọi thẳng BE với payload snake_case
 * đã verify pass bằng curl.
 */
import { createTestRunner } from "./helpers.mjs";

const stamp = Date.now();

function iso(daysFromNow, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

const EVENTS = [
  {
    key: "yoga",
    payload: {
      title: `Workshop Yoga cho người mới bắt đầu (test ${stamp})`,
      description: "Buổi hướng dẫn 3 giờ cho người chưa từng tập yoga. Trải nghiệm 7 asana cơ bản + breathwork. Có quà tặng cho 20 người đăng ký đầu tiên.",
      content: "<h2>Nội dung buổi workshop</h2><ul><li>7 asana cơ bản</li><li>Kỹ thuật thở Pranayama</li><li>Thiền thư giãn 15 phút</li></ul>",
      cover_image_url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800",
      start_date: iso(14, 8),
      end_date: iso(14, 11),
      registration_open_date: iso(-3, 0),
      registration_close_date: iso(13, 23),
      venue_is_online: false,
      venue_name: "Home FitPro Thảo Điền",
      venue_address: "12 Thảo Điền, Q.2, TP.HCM",
      venue_city: "TP.HCM",
      contact_name: "Nguyễn Thu Hà",
      contact_phone: "0971234567",
      contact_email: "ha.nguyen@reborn.vn",
      contact_role: "HLV trưởng",
      max_attendees: 30,
      ticket_price: 150000,
      category: "workshop",
      tags: ["yoga", "workshop", "beginner"],
      status: "published",
    },
  },
  {
    key: "dinhduong",
    payload: {
      title: `Hội thảo Dinh dưỡng cho người tập thể thao (test ${stamp})`,
      description: "Chuyên gia dinh dưỡng chia sẻ phác đồ ăn uống tối ưu để tăng cơ/giảm mỡ. Miễn phí, giới hạn 50 người.",
      content: "<h2>Chương trình</h2><p>19:00 Welcome · 19:15 Macro &amp; Calo · 19:45 Thực đơn 7 ngày · 20:15 Q&amp;A</p>",
      cover_image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
      start_date: iso(21, 19),
      end_date: iso(21, 21),
      registration_open_date: iso(-1, 0),
      registration_close_date: iso(20, 23),
      venue_is_online: false,
      venue_name: "Co-Working FitPro Đống Đa",
      venue_address: "99 Láng Hạ, Đống Đa, Hà Nội",
      venue_city: "Hà Nội",
      contact_name: "Trần Minh Quân",
      contact_phone: "0988888888",
      contact_email: "quan.tran@reborn.vn",
      contact_role: "BTC",
      max_attendees: 50,
      ticket_price: 0,
      category: "hội thảo",
      tags: ["dinh-duong", "hoi-thao", "mien-phi"],
      status: "published",
    },
  },
  {
    key: "mindfulness",
    payload: {
      title: `Lớp Mindfulness cuối tuần miễn phí (test ${stamp})`,
      description: "Lớp thiền chánh niệm 90 phút mỗi sáng thứ 7, giới hạn 20 người.",
      content: "<p>Chi tiết sẽ được cập nhật thêm sau.</p>",
      start_date: iso(7, 7),
      end_date: iso(7, 8),
      registration_open_date: iso(-2, 0),
      registration_close_date: iso(6, 23),
      venue_is_online: true,
      venue_online_url: "https://zoom.us/j/0000000000",
      contact_name: "Lê Hoàng Anh",
      contact_phone: "0912345678",
      max_attendees: 20,
      ticket_price: 0,
      category: "lớp học",
      tags: ["mindfulness", "online"],
      status: "draft",
    },
  },
];

(async () => {
  const t = await createTestRunner("EVT-REAL", "Events REAL create via BE API");
  const ok = await t.login();
  if (!ok) return t.done();

  await t.goto("/ch_events");
  await t.page.waitForTimeout(1500);

  const created = [];
  for (const ev of EVENTS) {
    t.log("➡️", `Tạo ${ev.key}: ${ev.payload.title.slice(0, 55)}`);
    const res = await t.page.evaluate(async (payload) => {
      const resp = await fetch("/bizapi/market/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await resp.text();
      try { return { status: resp.status, body: JSON.parse(body) }; }
      catch { return { status: resp.status, body }; }
    }, ev.payload);

    const ok200 = res.status === 200 && res.body?.code === 0 && res.body?.result?.id;
    t.assert(`${ev.key}-create`, ok200,
      ok200 ? `id=${res.body.result.id}, slug=${res.body.result.slug}, status=${res.body.result.status}`
            : `FAIL status=${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);

    if (ok200) {
      created.push({
        key: ev.key,
        id: res.body.result.id,
        slug: res.body.result.slug,
        title: ev.payload.title,
        status: res.body.result.status,
      });
    }
  }

  // Verify list
  t.log("🔍", "Verify qua /events/list");
  const listRes = await t.page.evaluate(async () => {
    const resp = await fetch("/bizapi/market/events/list?page=1&limit=20");
    return { status: resp.status, body: await resp.json() };
  });
  const items = listRes.body?.result?.items || [];
  t.assert("LIST-api", listRes.status === 200 && listRes.body?.code === 0,
    `GET /events/list → ${listRes.status}, total=${listRes.body?.result?.total}, items=${items.length}`);

  for (const c of created) {
    const hit = items.find((x) => x.id === c.id);
    t.assert(`LIST-${c.key}`, !!hit,
      hit ? `"${c.title.slice(0, 40)}" trong DB (id=${c.id}, status=${hit.status})`
          : `"${c.title.slice(0, 40)}" KHÔNG thấy trong list`);
  }

  // Hiển thị qua UI /ch_events
  await t.goto("/ch_events");
  await t.page.waitForTimeout(3000);
  await t.screenshot("list-page-after-create");

  const uiCheck = await t.page.evaluate((titles) => {
    const body = document.body.innerText || "";
    return titles.map((title) => ({ title, visible: body.includes(title) }));
  }, created.map((c) => c.title));

  for (const c of uiCheck) {
    t.assert(`UI-${c.title.slice(0, 20)}`, c.visible,
      c.visible ? `Hiển thị trên /ch_events` : `Không hiển thị UI`);
  }

  t.log("📊", `Đã tạo thật vào DB: ${created.length}/${EVENTS.length}`);
  console.log(JSON.stringify(created, null, 2));

  await t.done();
})().catch((err) => { console.error(err); process.exit(1); });
