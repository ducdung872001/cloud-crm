// Capture screenshots cho docs HDSD FitPro v0.6.
// Mục tiêu: chụp các màn chính cho 3 parts mới (Mạng lưới 7x7x7, Hành trình 90 ngày, FitPro Modules)
// + reshoot một số màn đã đổi tên/đổi route cho Part 02 (Trạm FitPro 6-9h), Part 07 (Business Owner), Part 08 (Báo cáo).
const { launch, ensureLoggedIn, shot, dismissModals, BASE_URL } = require("./session");

async function navAndShoot(page, slug, outFile, { wait = 2500, fullPage = false } = {}) {
  const url = BASE_URL + slug;
  console.log("[nav]", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => console.warn(" err", e.message));
  await page.waitForTimeout(wait);
  await dismissModals(page);
  await page.waitForTimeout(500);
  await shot(page, outFile, { fullPage });
}

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    // ── Dashboard & sidebar overview ─────────────────────────────
    await navAndShoot(page, "/dashboard", "images/part-01-bat-dau/10-dashboard-fitpro.png", { wait: 3500 });

    // ── Part 02 — Trạm FitPro 6-9h ───────────────────────────────
    await navAndShoot(page, "/create_sale_add", "images/part-02-tram-fitpro/01-ban-hang-tai-quay.png");
    await navAndShoot(page, "/ch_checkin", "images/part-02-tram-fitpro/02-checkin-tram.png");
    await navAndShoot(page, "/ch_services", "images/part-02-tram-fitpro/03-tru-buoi-tap.png");
    await navAndShoot(page, "/shift_management", "images/part-02-tram-fitpro/04-quan-ly-ca.png");

    // ── Part 07 — Business Owner & Phản hồi ──────────────────────
    await navAndShoot(page, "/ch_partners", "images/part-07-business-owner/01-business-owner-list.png");
    await navAndShoot(page, "/ch_feedback", "images/part-07-business-owner/02-danh-gia-phan-hoi.png");

    // ── Part 08 — Báo cáo (sub mới) ──────────────────────────────
    await navAndShoot(page, "/ch_report_revenue", "images/part-08-bao-cao/01-doanh-thu-tram.png");
    await navAndShoot(page, "/ch_report_members", "images/part-08-bao-cao/02-bao-cao-thanh-vien.png");
    await navAndShoot(page, "/ch_report_checkin", "images/part-08-bao-cao/03-luot-tap.png");
    await navAndShoot(page, "/ch_report_services", "images/part-08-bao-cao/04-goi-dich-vu.png");
    await navAndShoot(page, "/ch_report_partners", "images/part-08-bao-cao/05-business-owner-report.png");
    await navAndShoot(page, "/ch_report_finance", "images/part-08-bao-cao/06-tai-chinh-hoa-hong.png");

    // ── Part 13 — Mạng lưới 7×7×7 ────────────────────────────────
    await navAndShoot(page, "/fp_network_tree", "images/part-13-mang-luoi/01-mang-luoi-tong-quan.png", { wait: 3500 });
    await navAndShoot(page, "/fp_network_tree", "images/part-13-mang-luoi/02-mang-luoi-full.png", { wait: 3500, fullPage: true });

    // ── Part 14 — Hành trình 90 ngày ─────────────────────────────
    await navAndShoot(page, "/fp_journey", "images/part-14-hanh-trinh/01-hanh-trinh-tong-quan.png", { wait: 3500 });
    await navAndShoot(page, "/fp_journey", "images/part-14-hanh-trinh/02-hanh-trinh-full.png", { wait: 3500, fullPage: true });

    // ── Part 15 — FitPro Modules (9 submodules) ──────────────────
    await navAndShoot(page, "/fp_station_type", "images/part-15-fitpro-modules/01-cau-hinh-loai-tram.png");
    await navAndShoot(page, "/fp_cross_card", "images/part-15-fitpro-modules/02-the-lien-thong.png");
    await navAndShoot(page, "/fp_body_metrics", "images/part-15-fitpro-modules/03-chi-so-co-the.png");
    await navAndShoot(page, "/fp_sop", "images/part-15-fitpro-modules/04-tuan-thu-sop.png");
    await navAndShoot(page, "/fp_finder", "images/part-15-fitpro-modules/05-tim-tram-gan-nhat.png");
    await navAndShoot(page, "/fp_commission", "images/part-15-fitpro-modules/06-hoa-hong-he-thong.png");
    await navAndShoot(page, "/fp_funnel", "images/part-15-fitpro-modules/07-pheu-marketing.png");
    await navAndShoot(page, "/fp_tax", "images/part-15-fitpro-modules/08-khai-thue-tram.png");
    await navAndShoot(page, "/fp_mf7", "images/part-15-fitpro-modules/09-onboarding-mf7.png");

    // ── Cài đặt FitPro (tenant) — cho Part 11/12 ─────────────────
    await navAndShoot(page, "/ch_tenant_config", "images/part-11-cai-dat-co-ban/01-cau-hinh-fitpro.png");
    await navAndShoot(page, "/ch_membership_plans", "images/part-11-cai-dat-co-ban/02-goi-fitpro.png");

    console.log("DONE.");
  } catch (e) {
    console.error("ERR:", e.message);
    await shot(page, "images/_probe/99-err.png").catch(() => {});
  } finally {
    await browser.close();
  }
})();
