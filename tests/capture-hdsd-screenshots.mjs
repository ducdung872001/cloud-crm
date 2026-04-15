#!/usr/bin/env node
// Capture HDSD screenshots — chụp ảnh tất cả các màn hình chính của Reborn Retail
// để điền vào docs/userguides/images/part-XX-<tên>/
//
// Yêu cầu:
//   1. Dev server chạy ở http://localhost:4000/crm
//   2. Đã chạy `node tests/login-save.mjs` để có tests/.auth-cookies.json
//
// Chạy: node tests/capture-hdsd-screenshots.mjs
//   hoặc: HEADLESS=true node tests/capture-hdsd-screenshots.mjs (nhanh hơn)
//
// Ảnh lưu tại: docs/userguides/images/part-XX-<tên>/
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG } from "./config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_ROOT = path.join(
  __dirname,
  "..",
  "docs",
  "userguides",
  "images"
);

// ═══════════════════════════════════════════════════════════════════════
// Danh sách màn hình cần chụp, gom theo part HDSD
// ═══════════════════════════════════════════════════════════════════════
const CAPTURES = [
  // Part 01 — Bắt đầu
  {
    part: "part-01-bat-dau",
    shots: [
      { name: "01-dashboard", url: "/dashboard", title: "Dashboard" },
      { name: "02-header", url: "/dashboard", title: "Header bar", crop: { x: 0, y: 0, width: 1440, height: 80 } },
      { name: "03-sidebar", url: "/dashboard", title: "Sidebar menu", crop: { x: 0, y: 80, width: 260, height: 820 } },
    ],
  },
  // Part 02 — POS bán hàng
  {
    part: "part-02-pos-ban-hang",
    shots: [
      { name: "01-shift-management", url: "/shift_management", title: "Quản lý ca" },
      { name: "02-pos-empty", url: "/create_sale_add", title: "POS màn hình trống" },
      { name: "03-counter-sales", url: "/counter_sales", title: "Counter sales" },
    ],
  },
  // Part 03 — Khách hàng
  {
    part: "part-03-khach-hang",
    shots: [
      { name: "01-customer-list", url: "/customer_list", title: "Danh sách khách" },
      { name: "02-customer-person", url: "/customer_person", title: "Khách cá nhân" },
      { name: "03-setting-customer", url: "/setting_customer", title: "Cấu hình KH" },
    ],
  },
  // Part 04 — Đơn hàng & HDĐT
  {
    part: "part-04-don-hang-hoa-don",
    shots: [
      { name: "01-sale-invoice", url: "/sale_invoice", title: "Đơn bán hàng" },
      { name: "02-invoice-vat", url: "/invoiceVAT", title: "HDĐT VAT" },
      { name: "03-return-invoice", url: "/return_invoice", title: "Trả hàng" },
      { name: "04-multi-channel", url: "/multi_channel_sales", title: "Đa kênh" },
    ],
  },
  // Part 05 — Kho & sản phẩm
  {
    part: "part-05-kho-san-pham",
    shots: [
      { name: "01-setting-sell", url: "/setting_sell", title: "Danh mục sản phẩm" },
      { name: "02-warehouse-list", url: "/warehouse", title: "Danh sách kho" },
      { name: "03-product-inventory", url: "/product_inventory", title: "Tồn kho" },
      { name: "04-inventory-check", url: "/inventory_checking", title: "Kiểm kê" },
      { name: "05-transfer", url: "/inventory_transfer_document", title: "Chuyển kho" },
      { name: "06-adjustment", url: "/adjustment_slip", title: "Điều chỉnh kho" },
    ],
  },
  // Part 06 — Mua hàng & NCC
  {
    part: "part-06-mua-hang-ncc",
    shots: [
      { name: "01-supplier-list", url: "/supplier_list", title: "Danh sách NCC" },
      { name: "02-import-invoice", url: "/invoice_order", title: "Phiếu nhập kho" },
    ],
  },
  // Part 07 — Vận chuyển
  {
    part: "part-07-van-chuyen",
    shots: [
      { name: "01-shipping", url: "/shipping", title: "Vận chuyển" },
      { name: "02-shipping-dashboard", url: "/dashboard_shipping", title: "Dashboard logistics" },
      { name: "03-shipping-fee", url: "/shipping_fee_config", title: "Cấu hình phí ship" },
    ],
  },
  // Part 08 — Tài chính
  {
    part: "part-08-tai-chinh",
    shots: [
      { name: "01-finance-dashboard", url: "/finance_management/dashboard", title: "Tổng quan tài chính" },
      { name: "02-cashbook", url: "/finance_management/cashbook", title: "Sổ thu chi" },
      { name: "03-fund", url: "/finance_management/fund_management", title: "Quỹ" },
      { name: "04-debt", url: "/finance_management/debt_management", title: "Công nợ" },
      { name: "05-payment-control", url: "/payment_control", title: "Đối soát thanh toán" },
    ],
  },
  // Part 09 — Marketing
  {
    part: "part-09-marketing-khuyen-mai",
    shots: [
      { name: "01-promotion", url: "/promotional_program", title: "Khuyến mãi" },
      { name: "02-campaign", url: "/marketing_campaign", title: "Chiến dịch marketing" },
      { name: "03-email-marketing", url: "/email_marketting", title: "Email marketing" },
      { name: "04-sms-marketing", url: "/sms_marketting", title: "SMS marketing" },
    ],
  },
  // Part 10 — Loyalty & chăm sóc
  {
    part: "part-10-loyalty-cham-soc",
    shots: [
      { name: "01-loyalty-reward", url: "/loyaltyReward", title: "Loyalty reward" },
      { name: "02-loyalty-ledger", url: "/loyalty_point_ledger", title: "Sổ điểm" },
      { name: "03-ticket-list", url: "/ticket", title: "Ticket hỗ trợ" },
      { name: "04-warranty-list", url: "/warranty", title: "Bảo hành" },
    ],
  },
  // Part 11 — Báo cáo
  {
    part: "part-11-bao-cao",
    shots: [
      { name: "01-report-common", url: "/report_common", title: "Báo cáo tổng hợp" },
      { name: "02-customer-report", url: "/customer_report", title: "Báo cáo khách hàng" },
      { name: "03-inventory-report", url: "/inventory_report_modern", title: "Báo cáo tồn kho" },
      { name: "04-marketing-report", url: "/marketing_report", title: "Báo cáo marketing" },
    ],
  },
  // Part 12 — Cài đặt
  {
    part: "part-12-cai-dat",
    shots: [
      { name: "01-setting-basis", url: "/setting_basis", title: "Cài đặt cơ bản" },
      { name: "02-setting-org", url: "/setting_org", title: "Tổ chức" },
      { name: "03-setting-account", url: "/setting_account", title: "Tài khoản" },
      { name: "04-setting-integrations", url: "/setting_integrations", title: "Tích hợp" },
    ],
  },
  // Part 13 — BPM
  {
    part: "part-13-bpm-nang-cao",
    shots: [
      { name: "01-manage-processes", url: "/manage_processes", title: "Quản lý quy trình" },
      { name: "02-business-rule", url: "/bpm/business_rule", title: "Business Rules" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════
async function loadCookies(context) {
  const cookieFile = path.join(__dirname, ".auth-cookies.json");
  if (!fs.existsSync(cookieFile)) {
    throw new Error(
      "Không tìm thấy .auth-cookies.json. Chạy: node tests/login-save.mjs"
    );
  }
  const cookies = JSON.parse(fs.readFileSync(cookieFile, "utf8"));
  const token = cookies.find((c) => c.name === "token");
  if (!token || token.expires * 1000 < Date.now()) {
    throw new Error("Token hết hạn. Chạy lại: node tests/login-save.mjs");
  }
  await context.addCookies(cookies);
}

async function dismissOverlays(page) {
  // Close tour + modal backdrop + welcome
  await page.evaluate(() => {
    // Click close buttons
    const btns = [...document.querySelectorAll("button")];
    for (const b of btns) {
      const t = (b.innerText || "").trim();
      if (t === "✕" || t === "×" || t === "Bỏ qua" || /skip/i.test(t)) {
        if (b.offsetHeight > 0) b.click();
      }
    }
    // Remove overlay masks
    const selectors = [
      '.tour-overlay', '[class*="tour-overlay"]',
      '.tour-tooltip', '[class*="tour-tooltip"]',
      '[class*="welcome-tour"]', '[class*="onboarding"]',
      '.modal-backdrop',
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    }
    // Welcome modal
    const modals = [...document.querySelectorAll('.modal, [role="dialog"]')];
    for (const m of modals) {
      const txt = m.innerText || "";
      if (txt.includes("Chào mừng đến Reborn CRM")) m.remove();
    }
    // Choose role modal
    const roleModal = document.querySelector('.modal.page__choose--role');
    if (roleModal) roleModal.remove();
  }).catch(() => {});
}

async function capturePart(page, part, shots) {
  const outDir = path.join(IMAGES_ROOT, part);
  fs.mkdirSync(outDir, { recursive: true });

  for (const shot of shots) {
    const url = `${CONFIG.BASE_URL}${shot.url}`;
    process.stdout.write(`  [${part}] ${shot.name}... `);
    try {
      await page.goto(url, { waitUntil: "load", timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await dismissOverlays(page);
      await page.waitForTimeout(500);

      const outPath = path.join(outDir, `${shot.name}.png`);
      if (shot.crop) {
        await page.screenshot({
          path: outPath,
          clip: shot.crop,
        });
      } else {
        await page.screenshot({ path: outPath, fullPage: false });
      }
      console.log("✓");
    } catch (err) {
      console.log(`✗ (${err.message})`);
    }
  }
}

async function main() {
  console.log("📸 HDSD Screenshot Capture — Reborn Retail");
  console.log(`   Base URL: ${CONFIG.BASE_URL}`);
  console.log(`   Headless: ${CONFIG.HEADLESS}`);
  console.log(`   Output:   ${IMAGES_ROOT}`);
  console.log();

  const browser = await chromium.launch({
    headless: CONFIG.HEADLESS,
  });
  const context = await browser.newContext({
    viewport: CONFIG.VIEWPORT,
  });
  await loadCookies(context);
  const page = await context.newPage();
  page.setDefaultTimeout(CONFIG.ACTION_TIMEOUT);

  // Warm up: navigate to dashboard to trigger role selection + dismiss tour
  console.log("🔥 Warm up...");
  await page.goto(`${CONFIG.BASE_URL}/dashboard`, { waitUntil: "load" }).catch(() => {});
  await page.waitForTimeout(4000);
  await dismissOverlays(page);
  await page.waitForTimeout(1000);
  await dismissOverlays(page);
  console.log();

  let totalShots = 0;
  let okCount = 0;
  for (const { part, shots } of CAPTURES) {
    console.log(`📁 ${part} (${shots.length} ảnh)`);
    const before = okCount;
    await capturePart(page, part, shots);
    totalShots += shots.length;
    // count files actually created
    const outDir = path.join(IMAGES_ROOT, part);
    if (fs.existsSync(outDir)) {
      const files = fs
        .readdirSync(outDir)
        .filter((f) => f.endsWith(".png"));
      okCount = before + files.length;
    }
    console.log();
  }

  await browser.close();

  console.log("═".repeat(60));
  console.log(`✅ Đã chụp ${okCount}/${totalShots} ảnh`);
  console.log(`📁 Xem tại: ${path.relative(process.cwd(), IMAGES_ROOT)}`);
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("❌ Capture failed:", err.message);
  process.exit(1);
});
