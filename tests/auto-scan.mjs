#!/usr/bin/env node
/**
 * Auto Scanner — Reborn Retail CRM
 *
 * Tu dong truy cap tat ca routes, phat hien loi:
 * - Trang trang (blank page)
 * - API errors (4xx, 5xx)
 * - Console errors
 * - Missing elements
 * - Crash / timeout
 *
 * Chay: node tests/auto-scan.mjs
 * Chi 1 nhom: node tests/auto-scan.mjs --group pos
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG, ROUTES } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUN_ID = Date.now().toString(36).slice(-6);

// ── All scannable routes grouped ──
const SCAN_GROUPS = {
  auth: [
    { name: "Login page", route: "/login", noAuth: true },
  ],
  dashboard: [
    { name: "Dashboard", route: "/dashboard" },
  ],
  pos: [
    { name: "POS - Ban hang", route: "/create_sale_add" },
  ],
  orders: [
    { name: "Hoa don ban hang", route: "/sale_invoice" },
    { name: "Don hang", route: "/order" },
    { name: "Don tam", route: "/temporary_order_list" },
    { name: "Theo doi don", route: "/order_tracking" },
    { name: "Khach tra hang", route: "/return_invoice" },
  ],
  online: [
    { name: "Don hang da kenh", route: "/multi_channel_sales" },
  ],
  shipping: [
    { name: "Giao hang", route: "/shipping" },
    { name: "Doi tac van chuyen", route: "/shipping_parther" },
    { name: "Phi van chuyen", route: "/shipping_fee_config" },
    { name: "BC Van chuyen", route: "/dashboard_shipping" },
  ],
  inventory: [
    { name: "So kho", route: "/inventory" },
    { name: "Kho hang", route: "/warehouse" },
    { name: "Phieu nhap", route: "/invoice_order" },
    { name: "Dieu chinh kho", route: "/adjustment_slip" },
    { name: "Xuat huy", route: "/destroy_slip" },
    { name: "Chuyen kho", route: "/inventory_transfer_document" },
    { name: "Kiem ke", route: "/inventory_checking" },
    { name: "Ton kho SP", route: "/product_inventory" },
    { name: "SP da ban", route: "/products_sold" },
    { name: "Nguyen vat lieu", route: "/material" },
    { name: "BC Kho", route: "/report_warehouse" },
  ],
  customers: [
    { name: "DS Khach hang", route: "/customer_list" },
    { name: "KH Ca nhan", route: "/customer_person" },
    { name: "Nha cung cap", route: "/supplier_list" },
    { name: "Nguoi lien he", route: "/contact" },
    { name: "Phan tich KH", route: "/customer_analysis" },
    { name: "Cham soc KH", route: "/customer_care_page" },
  ],
  finance: [
    { name: "Dashboard TC", route: "/finance_management/dashboard" },
    { name: "So thu chi", route: "/finance_management/cashbook" },
    { name: "Mau phieu", route: "/finance_management/cashbook_template" },
    { name: "Quan ly quy", route: "/finance_management/fund_management" },
    { name: "Cong no", route: "/finance_management/debt_management" },
    { name: "Kiem ke ca", route: "/finance_management/shift_inventory" },
    { name: "Doi soat TT", route: "/payment_control" },
    { name: "LS Thanh toan", route: "/payment_history" },
    { name: "Hoa don VAT", route: "/invoiceVAT" },
  ],
  marketing: [
    { name: "Khuyen mai", route: "/promotional_program" },
    { name: "BC Khuyen mai", route: "/promotional_report" },
    { name: "Tich diem", route: "/loyalty_point_ledger" },
    { name: "Vi thanh vien", route: "/loyalty_wallet" },
    { name: "Doi thuong", route: "/loyaltyReward" },
    { name: "Phan hang TV", route: "/loyaltySegment" },
    { name: "Dashboard Loyalty", route: "/dashboard_loyalty" },
    { name: "Cai dat Loyalty", route: "/setting_loyalty" },
    { name: "DS Thanh vien", route: "/member_list" },
    { name: "Chien dich", route: "/campaign" },
    { name: "Marketing CD", route: "/marketing_campaign" },
  ],
  support: [
    { name: "Bao hanh", route: "/warranty" },
    { name: "Ticket", route: "/ticket" },
  ],
  communication: [
    { name: "Email Marketing", route: "/email_marketting" },
    { name: "SMS Marketing", route: "/sms_marketting" },
    { name: "Zalo Marketing", route: "/zalo_marketting" },
    { name: "Fanpage", route: "/fanpage" },
    { name: "Bao gia", route: "/offer" },
  ],
  shifts: [
    { name: "Ca lam viec", route: "/shift_management" },
    { name: "Cau hinh ca", route: "/shift_config" },
    { name: "Cham cong", route: "/timekeeping" },
  ],
  bpm: [
    { name: "Quy trinh", route: "/manage_processes" },
    { name: "Mo phong", route: "/process_simulation" },
    { name: "Cau hinh BPM", route: "/config_bpm" },
    { name: "Luat NV", route: "/bpm/business_rule" },
    { name: "Sale Flow", route: "/manage_sale_flow" },
    { name: "Automation", route: "/marketing_automation" },
  ],
  reports: [
    { name: "BC Doanh thu", route: "/report_common" },
    { name: "BC Khach hang", route: "/customer_report" },
    { name: "BC Ton kho", route: "/inventory_report_modern" },
    { name: "BC Marketing", route: "/marketing_report" },
  ],
  settings: [
    { name: "CD Chung", route: "/setting_basis" },
    { name: "CD To chuc", route: "/setting_org" },
    { name: "CD Ban hang", route: "/setting_sell" },
    { name: "CD Khach hang", route: "/setting_customer" },
    { name: "CD PTTT", route: "/setting_payment_method" },
    { name: "CD Kenh", route: "/setting_channels" },
    { name: "CD Email", route: "/setting_email" },
    { name: "CD SMS", route: "/setting_sms" },
    { name: "CD Zalo", route: "/setting_zalo" },
    { name: "CD Tich hop", route: "/setting_integrations" },
    { name: "CD Tai khoan", route: "/setting_account" },
    { name: "CD Ticket", route: "/setting_ticket" },
    { name: "CD Bao hanh", route: "/setting_warranty" },
  ],
  misc: [
    { name: "Thong bao", route: "/notification" },
    { name: "Lich", route: "/calendar" },
    { name: "To chuc", route: "/organization" },
    { name: "Goi DV", route: "/package_manage" },
    { name: "Truong TDN", route: "/field_management" },
  ],
};

// ── Main ──
async function main() {
  const args = process.argv.slice(2);
  const groupFilter = args.find(a => a.startsWith("--group="))?.split("=")[1]
    || args.find((a, i) => args[i - 1] === "--group");

  let routesToScan = [];
  if (groupFilter) {
    const group = SCAN_GROUPS[groupFilter];
    if (!group) {
      console.log("Groups:", Object.keys(SCAN_GROUPS).join(", "));
      process.exit(1);
    }
    routesToScan = group;
  } else {
    for (const [, routes] of Object.entries(SCAN_GROUPS)) {
      routesToScan.push(...routes);
    }
  }

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  AUTO SCANNER — Reborn Retail CRM`);
  console.log(`  Routes: ${routesToScan.length} | Run: ${RUN_ID}`);
  console.log(`${"=".repeat(70)}\n`);

  const browser = await chromium.launch({ headless: CONFIG.HEADLESS });
  const context = await browser.newContext({ viewport: CONFIG.VIEWPORT });
  const page = await context.newPage();

  // Collect all issues
  const issues = [];
  const consoleErrors = [];

  // Capture console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ text: msg.text(), url: page.url() });
    }
  });

  // ── Login via SSO ──
  console.log("\u{1F510} Dang nhap qua SSO...");
  await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);
  console.log(`   SSO URL: ${page.url().split("?")[0]}`);

  // Fill SSO form
  await page.fill('input[type="text"]', CONFIG.USERNAME).catch(() => {});
  await page.fill('input[type="password"]', CONFIG.PASSWORD).catch(() => {});
  await page.click('button.btn-submit-form, button[type="submit"]').catch(() => {});

  // Wait for redirect back to CRM
  console.log("   \u23F3 Cho redirect...");
  await page.waitForTimeout(8000);

  // Handle "Chon vai tro" modal
  try {
    await page.waitForSelector('text=Chọn vai trò', { timeout: 8000 });
    console.log("   \uD83D\uDC64 Chon vai tro → Xac nhan");
    await page.click('button:has-text("Xác nhận"), button:has-text("Xac nhan")').catch(() => {});
    await page.waitForTimeout(5000);
  } catch {
    await page.waitForTimeout(3000);
  }

  const loggedIn = page.url().includes("/crm/") || (await page.$('[class*="sidebar"], [class*="header"]')) !== null;
  if (!loggedIn) {
    console.log("\u274C Login FAILED. Dung lai.");
    await browser.close();
    process.exit(1);
  }
  console.log("\u2705 Dang nhap thanh cong\n");

  // ── Scan each route ──
  let passCount = 0;
  let failCount = 0;

  for (const { name, route, noAuth } of routesToScan) {
    consoleErrors.length = 0;
    const apiErrors = [];
    const pageIssues = [];

    // Capture API errors for this page
    const onResponse = (res) => {
      const status = res.status();
      if (status >= 400) {
        apiErrors.push({
          url: res.url().split("?")[0],
          method: res.request().method(),
          status,
        });
      }
    };
    page.on("response", onResponse);

    try {
      // Navigate
      await page.goto(`${CONFIG.BASE_URL}${route}`, {
        waitUntil: "load",
        timeout: 20000,
      });
      await page.waitForTimeout(3000);

      // Check 1: Blank page
      const bodyText = await page.evaluate(() => document.body?.innerText?.trim() || "");
      const bodyLen = bodyText.length;
      if (bodyLen < 20) {
        pageIssues.push({ type: "BLANK_PAGE", detail: `Body chi co ${bodyLen} ky tu` });
      }

      // Check 2: 404 page
      const has404 = await page.$(".page-404, [class*='404'], [class*='not-found']");
      const text404 = bodyText.includes("404") && bodyText.includes("not found");
      if (has404 || text404) {
        pageIssues.push({ type: "404_PAGE", detail: "Trang 404" });
      }

      // Check 3: Error boundary / crash
      const hasError = await page.$("[class*='error-boundary'], [class*='ErrorBoundary'], [class*='crash']");
      if (hasError) {
        pageIssues.push({ type: "CRASH", detail: "ErrorBoundary triggered" });
      }

      // Check 4: Redirected to login (session issue)
      if (page.url().includes("/login") && !noAuth) {
        pageIssues.push({ type: "AUTH_REDIRECT", detail: "Bi redirect ve login" });
      }

      // Check 5: API errors
      if (apiErrors.length > 0) {
        const unique = [...new Set(apiErrors.map(e => `${e.method} ${e.url} → ${e.status}`))];
        unique.forEach(e => {
          pageIssues.push({ type: "API_ERROR", detail: e });
        });
      }

      // Check 6: Console errors (filter noise)
      const realErrors = consoleErrors.filter(e =>
        !e.text.includes("favicon") &&
        !e.text.includes("ResizeObserver") &&
        !e.text.includes("net::ERR")
      );
      if (realErrors.length > 0) {
        realErrors.slice(0, 3).forEach(e => {
          pageIssues.push({ type: "CONSOLE_ERROR", detail: e.text.slice(0, 200) });
        });
      }

      // Check 7: Page has meaningful content
      const hasContent = await page.$(".ag-root, table, [class*='list'], [class*='card'], [class*='dashboard'], [class*='form'], [class*='chart'], canvas, [class*='content'], [class*='page']");
      if (!hasContent && bodyLen < 100 && !noAuth) {
        pageIssues.push({ type: "NO_CONTENT", detail: "Khong tim thay noi dung chinh" });
      }

    } catch (err) {
      pageIssues.push({ type: "TIMEOUT", detail: err.message.slice(0, 150) });
    }

    page.off("response", onResponse);

    // ── Report ──
    if (pageIssues.length === 0) {
      console.log(`  \u2705 ${name.padEnd(25)} ${route}`);
      passCount++;
    } else {
      console.log(`  \u274C ${name.padEnd(25)} ${route}`);
      pageIssues.forEach(issue => {
        console.log(`     \u{1F41B} [${issue.type}] ${issue.detail}`);
      });
      failCount++;
      issues.push({ name, route, issues: pageIssues });
    }

    // Screenshot for failed
    if (pageIssues.length > 0) {
      const ssName = route.replace(/\//g, "_").replace(/^_/, "");
      await page.screenshot({
        path: path.join(__dirname, "screenshots", `scan-${RUN_ID}-${ssName}.png`),
        fullPage: false,
      }).catch(() => {});
    }
  }

  await browser.close();

  // ── Summary ──
  console.log(`\n${"=".repeat(70)}`);
  console.log(`  KET QUA SCAN`);
  console.log(`${"=".repeat(70)}`);
  console.log(`  \u2705 Pass: ${passCount}`);
  console.log(`  \u274C Fail: ${failCount}`);
  console.log(`  Tong: ${passCount + failCount} routes`);

  // ── Save report ──
  const reportPath = path.join(__dirname, "reports", `auto-scan-${RUN_ID}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    runId: RUN_ID,
    timestamp: new Date().toISOString(),
    total: passCount + failCount,
    passed: passCount,
    failed: failCount,
    issues,
  }, null, 2));
  console.log(`\n  Report: ${reportPath}`);

  // ── Save issues for review ──
  if (issues.length > 0) {
    const reviewPath = path.join(__dirname, "..", "docs", `SCAN_ISSUES_${RUN_ID}.md`);
    let md = `# Ket qua Auto Scan — ${new Date().toISOString().split("T")[0]}\n\n`;
    md += `**Run ID:** ${RUN_ID}\n`;
    md += `**Pass:** ${passCount} | **Fail:** ${failCount} | **Total:** ${passCount + failCount}\n\n`;
    md += `---\n\n`;
    md += `## Cac trang co loi\n\n`;
    md += `| # | Trang | Route | Loai loi | Chi tiet |\n`;
    md += `|---|-------|-------|----------|----------|\n`;
    let idx = 1;
    for (const item of issues) {
      for (const issue of item.issues) {
        md += `| ${idx++} | ${item.name} | \`${item.route}\` | ${issue.type} | ${issue.detail.replace(/\|/g, "\\|")} |\n`;
      }
    }
    md += `\n---\n\n`;

    // Categorize issues
    const byType = {};
    for (const item of issues) {
      for (const issue of item.issues) {
        if (!byType[issue.type]) byType[issue.type] = [];
        byType[issue.type].push({ name: item.name, route: item.route, detail: issue.detail });
      }
    }

    md += `## Phan loai loi\n\n`;
    for (const [type, items] of Object.entries(byType)) {
      md += `### ${type} (${items.length} loi)\n\n`;
      items.forEach(i => {
        md += `- **${i.name}** (\`${i.route}\`): ${i.detail}\n`;
      });
      md += `\n`;
    }

    fs.writeFileSync(reviewPath, md);
    console.log(`  Issues: ${reviewPath}`);
  }

  console.log(`${"=".repeat(70)}\n`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
