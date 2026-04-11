#!/usr/bin/env node
/**
 * Test Runner — Reborn Retail CRM
 *
 * Chay tat ca hoac tung module test.
 *
 * Usage:
 *   node tests/run.mjs                    # Chay TAT CA
 *   node tests/run.mjs RT.03             # Chay 1 module
 *   node tests/run.mjs RT.03 RT.09       # Chay nhieu module
 *   node tests/run.mjs --list            # Liet ke tat ca module
 *   node tests/run.mjs --failed-only     # Chi chay module da fail lan truoc
 *   HEADLESS=true node tests/run.mjs     # Chay an (khong mo browser)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── All test modules ──
const MODULES = [
  { code: "RT.01", file: "test-rt01-stock-ledger.mjs", name: "So kho" },
  { code: "RT.02", file: "test-rt02-warehouse.mjs", name: "Quan ly kho" },
  { code: "RT.03", file: "test-rt03-pos.mjs", name: "Ban hang tai quay (POS)" },
  { code: "RT.04", file: "test-rt04-online-orders.mjs", name: "Don hang online" },
  { code: "RT.05", file: "test-rt05-shipping.mjs", name: "Giao hang & Van chuyen" },
  { code: "RT.06", file: "test-rt06-cashbook.mjs", name: "So thu chi" },
  { code: "RT.07", file: "test-rt07-vat-invoice.mjs", name: "Hoa don VAT" },
  { code: "RT.08", file: "test-rt08-products.mjs", name: "San pham & Dich vu" },
  { code: "RT.09", file: "test-rt09-customers.mjs", name: "Khach hang" },
  { code: "RT.10", file: "test-rt10-promotions-loyalty.mjs", name: "Khuyen mai & Loyalty" },
  { code: "RT.11", file: "test-rt11-dashboard-reports.mjs", name: "Dashboard & Bao cao" },
  { code: "RT.12", file: "test-rt12-shifts.mjs", name: "Ca lam viec" },
  { code: "RT.13", file: "test-rt13-debt.mjs", name: "Cong no" },
  { code: "RT.14", file: "test-rt14-fund.mjs", name: "Quan ly quy" },
  { code: "RT.15", file: "test-rt15-returns.mjs", name: "Khach tra hang" },
  { code: "RT.16", file: "test-rt16-reconciliation.mjs", name: "Doi soat thanh toan" },
  { code: "RT.17", file: "test-rt17-settings.mjs", name: "Cai dat he thong" },
  { code: "RT.18", file: "test-rt18-auth.mjs", name: "Dang nhap / Dang xuat" },
  { code: "RT.19", file: "test-rt19-suppliers.mjs", name: "Nha cung cap" },
  { code: "RT.20", file: "test-rt20-stock-transfer.mjs", name: "Dieu chuyen kho" },
  { code: "RT.21", file: "test-rt21-stock-adjust.mjs", name: "Dieu chinh kho" },
  { code: "RT.22", file: "test-rt22-stock-destroy.mjs", name: "Xuat huy" },
  { code: "RT.23", file: "test-rt23-stock-audit.mjs", name: "Kiem ke kho" },
  { code: "RT.24", file: "test-rt24-orders.mjs", name: "Don hang" },
  { code: "RT.25", file: "test-rt25-notifications.mjs", name: "Thong bao" },
  { code: "RT.26", file: "test-rt26-payment-history.mjs", name: "Lich su thanh toan" },
  { code: "RT.27", file: "test-rt27-finance-dashboard.mjs", name: "Dashboard tai chinh" },
  { code: "RT.28", file: "test-rt28-warehouse-report.mjs", name: "Bao cao kho" },
  { code: "RT.29", file: "test-rt29-materials.mjs", name: "Nguyen vat lieu" },
  { code: "RT.30", file: "test-rt30-timekeeping.mjs", name: "Cham cong" },
  { code: "RT.31", file: "test-rt31-warranty-ticket.mjs", name: "Bao hanh & Ticket" },
  { code: "RT.32", file: "test-rt32-email-sms-zalo.mjs", name: "Email/SMS/Zalo Marketing" },
  { code: "RT.33", file: "test-rt33-customer-care.mjs", name: "Cham soc KH & Social CRM" },
  { code: "RT.34", file: "test-rt34-offers.mjs", name: "Bao gia" },
  { code: "RT.35", file: "test-rt35-campaigns.mjs", name: "Chien dich Marketing" },
  { code: "RT.36", file: "test-rt36-customer-analysis.mjs", name: "Phan tich KH" },
  { code: "RT.37", file: "test-rt37-invoices.mjs", name: "Hoa don ban hang" },
  { code: "RT.38", file: "test-rt38-pos-advanced.mjs", name: "POS nang cao" },
  { code: "RT.39", file: "test-rt39-calendar.mjs", name: "Lich hen" },
  { code: "RT.40", file: "test-rt40-organization.mjs", name: "To chuc & Goi DV" },
  { code: "RT.41", file: "test-rt41-bpm.mjs", name: "Quy trinh (BPM)" },
  { code: "RT.42", file: "test-rt42-marketing-auto.mjs", name: "Marketing Automation" },
  { code: "RT.43", file: "test-rt43-sale-flow.mjs", name: "Quy trinh ban (Sale Flow)" },
];

// ── Parse args ──
const args = process.argv.slice(2);

if (args.includes("--list")) {
  console.log("\n\uD83D\uDCCB  Danh sach 43 module test:\n");
  MODULES.forEach((m, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${m.code.padEnd(6)} ${m.name.padEnd(30)} → ${m.file}`);
  });
  console.log(`\nChay: node tests/run.mjs RT.03 RT.09`);
  process.exit(0);
}

// Filter modules
let selected = MODULES;
const codeArgs = args.filter((a) => a.startsWith("RT."));
if (codeArgs.length > 0) {
  selected = MODULES.filter((m) => codeArgs.includes(m.code));
}

// ── Run tests ──
console.log(`\n${"=".repeat(60)}`);
console.log(`  REBORN RETAIL CRM — Test Suite`);
console.log(`  Modules: ${selected.length}/${MODULES.length}`);
console.log(`  ${new Date().toISOString()}`);
console.log(`${"=".repeat(60)}\n`);

const summary = [];

for (const mod of selected) {
  const filePath = path.join(__dirname, mod.file);
  if (!fs.existsSync(filePath)) {
    console.log(`\u26A0\uFE0F  [${mod.code}] File khong ton tai: ${mod.file}\n`);
    summary.push({ ...mod, status: "SKIP", passed: 0, failed: 0, total: 0 });
    continue;
  }

  try {
    console.log(`\n${"─".repeat(60)}`);
    execSync(`node ${filePath}`, {
      stdio: "inherit",
      timeout: 300000, // 5 min per module
      env: { ...process.env },
    });
    summary.push({ ...mod, status: "DONE" });
  } catch (err) {
    summary.push({ ...mod, status: "FAIL", error: err.message?.slice(0, 100) });
  }
}

// ── Summary ──
console.log(`\n${"=".repeat(60)}`);
console.log(`  TONG KET`);
console.log(`${"=".repeat(60)}`);
summary.forEach((s) => {
  const icon = s.status === "DONE" ? "\u2705" : s.status === "SKIP" ? "\u26A0\uFE0F" : "\u274C";
  console.log(`  ${icon} ${s.code.padEnd(6)} ${s.name}`);
});
console.log(`${"=".repeat(60)}`);

const failCount = summary.filter((s) => s.status === "FAIL").length;
process.exit(failCount > 0 ? 1 : 0);
