// Mass capture for Parts 04–12 — one run covers all remaining URLs
const { launch, ensureLoggedIn, pickRoleIfAsked, shot, BASE_URL } = require("./session");
const path = require("path");
const fs = require("fs");

async function closeAll(page) {
  for (let i = 0; i < 4; i++) {
    let c = false;
    for (const t of ["Tôi đã hiểu", "Đã hiểu", "Bỏ qua", "Để sau", "Skip", "Hoàn tất"]) {
      const b = page.getByRole("button", { name: new RegExp(`^\\s*${t}\\s*$`, "i") });
      if ((await b.count().catch(() => 0)) > 0 && (await b.first().isVisible().catch(() => false))) {
        await b.first().click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(400); c = true;
      }
    }
    if (!c) break;
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function gotoShot(page, url, slug, partFolder, extraWait = 5000) {
  try {
    await page.goto(url, { timeout: 90000 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(extraWait);
    await pickRoleIfAsked(page);
    await closeAll(page);
    await page.waitForTimeout(1000);
    const dir = `images/${partFolder}`;
    fs.mkdirSync(path.resolve(__dirname, "..", dir), { recursive: true });
    await shot(page, `${dir}/${slug}.png`);
    await shot(page, `${dir}/${slug}-fullpage.png`, { fullPage: true });
  } catch (e) {
    console.error(`[err ${slug}]`, e.message);
  }
}

const CAPTURES = [
  // ═══ Part 04 — Giao dịch ═══
  { part: "part-04-giao-dich", slug: "A01-sale-invoice-list", url: "/sale_invoice" },
  { part: "part-04-giao-dich", slug: "A02-invoice-vat", url: "/invoiceVAT" },
  { part: "part-04-giao-dich", slug: "A03-order-tracking", url: "/order_tracking" },
  { part: "part-04-giao-dich", slug: "A04-return-invoice", url: "/return_invoice" },

  // ═══ Part 05 — Lưu trú ═══
  { part: "part-05-luu-tru", slug: "A01-accommodation-main", url: "/ch_accommodation" },

  // ═══ Part 06 — Tài chính & Thanh toán ═══
  { part: "part-06-tai-chinh", slug: "A01-finance-dashboard", url: "/finance_management/dashboard" },
  { part: "part-06-tai-chinh", slug: "A02-cashbook", url: "/finance_management/cashbook" },
  { part: "part-06-tai-chinh", slug: "A03-fund-management", url: "/finance_management/fund_management" },
  { part: "part-06-tai-chinh", slug: "A04-category-management", url: "/finance_management/category_management" },
  { part: "part-06-tai-chinh", slug: "A05-debt-management", url: "/finance_management/debt_management" },
  { part: "part-06-tai-chinh", slug: "A06-payment-control", url: "/payment_control" },

  // ═══ Part 07 — Đối tác & Phản hồi ═══
  { part: "part-07-doi-tac-phan-hoi", slug: "A01-partners", url: "/ch_partners" },
  { part: "part-07-doi-tac-phan-hoi", slug: "A02-feedback", url: "/ch_feedback" },

  // ═══ Part 08 — Báo cáo ═══
  { part: "part-08-bao-cao", slug: "A01-revenue", url: "/ch_report_revenue" },
  { part: "part-08-bao-cao", slug: "A02-members", url: "/ch_report_members" },
  { part: "part-08-bao-cao", slug: "A03-checkin", url: "/ch_report_checkin" },
  { part: "part-08-bao-cao", slug: "A04-services", url: "/ch_report_services" },
  { part: "part-08-bao-cao", slug: "A05-partners", url: "/ch_report_partners" },
  { part: "part-08-bao-cao", slug: "A06-finance", url: "/ch_report_finance" },

  // ═══ Part 09 — Ưu đãi & Chăm sóc ═══
  { part: "part-09-uu-dai-cham-soc", slug: "A01-promo-program", url: "/promotional_program" },
  { part: "part-09-uu-dai-cham-soc", slug: "A02-member-list", url: "/member_list" },
  { part: "part-09-uu-dai-cham-soc", slug: "A03-marketing-campaign", url: "/marketing_campaign" },
  { part: "part-09-uu-dai-cham-soc", slug: "A04-customer-care-page", url: "/customer_care_page" },

  // ═══ Part 10 — Kho & Nguyên vật liệu ═══
  { part: "part-10-kho", slug: "A01-material", url: "/material" },
  { part: "part-10-kho", slug: "A02-supplier", url: "/supplier" },
  { part: "part-10-kho", slug: "A03-warehouse-list", url: "/warehouse" },
  { part: "part-10-kho", slug: "A04-inventory", url: "/inventory" },
  { part: "part-10-kho", slug: "A05-inventory-checking", url: "/inventory_checking" },
  { part: "part-10-kho", slug: "A06-report-warehouse", url: "/report_warehouse" },

  // ═══ Part 11 — Cài đặt cơ bản ═══
  { part: "part-11-cai-dat-co-ban", slug: "A01-tenant-config", url: "/ch_tenant_config" },
  { part: "part-11-cai-dat-co-ban", slug: "A02-setting-sell", url: "/setting_sell" },
  { part: "part-11-cai-dat-co-ban", slug: "A03-membership-plans", url: "/ch_membership_plans" },
  { part: "part-11-cai-dat-co-ban", slug: "A04-setting-basis", url: "/setting_basis" },

  // ═══ Part 12 — Cài đặt nâng cao ═══
  { part: "part-12-cai-dat-nang-cao", slug: "A01-setting-org", url: "/setting_org" },
  { part: "part-12-cai-dat-nang-cao", slug: "A02-setting-channels", url: "/setting_channels" },
  { part: "part-12-cai-dat-nang-cao", slug: "A03-setting-integrations", url: "/setting_integrations" },
  { part: "part-12-cai-dat-nang-cao", slug: "A04-setting-account", url: "/setting_account" },
  { part: "part-12-cai-dat-nang-cao", slug: "A05-setting-ticket", url: "/setting_ticket" },
];

(async () => {
  const { browser, context, page } = await launch({ headless: true, viewport: { width: 1680, height: 1000 } });
  try {
    await ensureLoggedIn(page, context);

    for (const c of CAPTURES) {
      console.log(`\n[${c.part}] ${c.slug} -> ${c.url}`);
      await gotoShot(page, BASE_URL + c.url, c.slug, c.part);
    }

    console.log("\nALL MASS CAPTURES DONE");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await browser.close();
  }
})();
