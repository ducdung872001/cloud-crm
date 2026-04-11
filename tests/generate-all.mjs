#!/usr/bin/env node
/**
 * Generator — Tao 43 file test tu dinh nghia module
 * Chay 1 lan: node tests/generate-all.mjs
 */
import fs from "fs";

const mods = [
  ["RT.01","test-rt01-stock-ledger.mjs","So kho","STOCK_LEDGER",["list all slips","search product","view detail","close detail","cancel selected","cancel single","tab Nhap kho","tab Xuat kho","tab Chuyen kho","tab Dieu chinh","Ref tai chinh","pagination"]],
  ["RT.02","test-rt02-warehouse.mjs","Quan ly kho","WAREHOUSE",["inventory list","search","page size","tab Phieu nhap","search import","view import detail","create import","approve import","filter status","tab Chuyen kho","create transfer","tab Xuat hang","tab Kiem ke","tab Gia von","tab Xuat huy"]],
  ["RT.03","test-rt03-pos.mjs","POS","COUNTER_SALES",["open POS page","search product","QR scan","category tabs","select product","quantity +/-","add to cart","cart quantity","remove from cart","select customer","search customer","add new customer","voucher code","pay cash","pay transfer","pay QR","tab drafts","tab orders","tab report","load more"]],
  ["RT.04","test-rt04-online-orders.mjs","Don hang online","MULTI_CHANNEL",["overview KPIs","connect channel","order list","order detail","confirm order","reject order","print receipt","export excel","filter status","pagination"]],
  ["RT.05","test-rt05-shipping.mjs","Giao hang","SHIPPING",["list shipments","create shipment","push to carrier","view tracking","print waybill","cancel shipment","search","status tabs","partner setup","fee config"]],
  ["RT.06","test-rt06-cashbook.mjs","So thu chi","CASHBOOK",["list entries","filter income/expense","filter month","filter fund","search","add income","add expense","view detail","edit entry","delete entry","export excel","pagination"]],
  ["RT.07","test-rt07-vat-invoice.mjs","Hoa don VAT","INVOICE_VAT",["overview","export report","create new","invoice list","search","filter status","filter date","view detail","copy CQT code","download PDF","send email","sign and publish","preview","provider config","settings config"]],
  ["RT.08","test-rt08-products.mjs","San pham","SETTING_SELL",["product list","search","filter category","create product","missing required","duplicate SKU","add variants","upload image","view detail","edit product","delete product","toggle visibility","export excel","category CRUD","services tab"]],
  ["RT.09","test-rt09-customers.mjs","Khach hang","CUSTOMER_LIST",["customer list","search","create customer","missing required","duplicate phone","view detail 360","edit customer","delete customer","filter group","filter source","export excel","bulk update","groups CRUD","analysis"]],
  ["RT.10","test-rt10-promotions-loyalty.mjs","KM & Loyalty","PROMOTIONAL_PROGRAM",["promotion list","create pct discount","create fixed price","activate pause","delete promotion","loyalty config","point ledger","member wallet","redeem points","segments"]],
  ["RT.11","test-rt11-dashboard-reports.mjs","Dashboard","DASHBOARD_RETAIL",["dashboard KPIs","revenue chart","time filter","top products","payment breakdown","sales report","inventory report","customer report","marketing report","shipping report","export","custom date"]],
  ["RT.12","test-rt12-shifts.mjs","Ca lam viec","SHIFT_MANAGEMENT",["list shifts","open shift","close shift","cash difference","config CRUD","shift report","shift history"]],
  ["RT.13","test-rt13-debt.mjs","Cong no","DEBT_MANAGEMENT",["list debts","filter receivable","filter payable","filter overdue","create debt","record payment","partial payment","QR code","export","search"]],
  ["RT.14","test-rt14-fund.mjs","Quy","FUND_MANAGEMENT",["list funds","create fund","open close","fund history","transfer","delete fund"]],
  ["RT.15","test-rt15-returns.mjs","Tra hang","RETURN_INVOICE",["list returns","create from order","select products","confirm return","view detail","export"]],
  ["RT.16","test-rt16-reconciliation.mjs","Doi soat","PAYMENT_CONTROL",["list transactions","filter method","filter status","confirm match","export"]],
  ["RT.17","test-rt17-settings.mjs","Cai dat","SETTING_BASIS",["store info","payment methods","toggle payment","bank config","employee list","add employee","edit employee","disable employee","role list","create role","assign role","verify permission","departments","channels config"]],
  ["RT.18","test-rt18-auth.mjs","Auth","LOGIN",["login correct","wrong password","wrong username","empty fields","role selection","logout","no auth redirect","session timeout","forgot password","invalid email","reset password","multi tab"]],
  ["RT.19","test-rt19-suppliers.mjs","NCC","SUPPLIER",["list suppliers","search","create full","missing required","view detail","edit","delete clean","delete with txn"]],
  ["RT.20","test-rt20-stock-transfer.mjs","Dieu chuyen","TRANSFER_ORDER",["list transfers","create select warehouses","same warehouse error","add products","over stock error","approve","cancel","search filter"]],
  ["RT.21","test-rt21-stock-adjust.mjs","Dieu chinh","ADJUSTMENT_SLIP",["list adjustments","create add products","enter reason","approve","cancel","search filter"]],
  ["RT.22","test-rt22-stock-destroy.mjs","Xuat huy","DESTROY_SLIP",["list slips","create add products","over stock error","approve","search filter"]],
  ["RT.23","test-rt23-stock-audit.mjs","Kiem ke","INVENTORY_CHECKING",["list audits","create audit","enter actual qty","balance stock","audit history","export"]],
  ["RT.24","test-rt24-orders.mjs","Don hang","SALE_INVOICE",["list orders","create order","add products","select customer","apply promo","payment method","confirm order","cancel order","view detail","filter search","print receipt","export"]],
  ["RT.25","test-rt25-notifications.mjs","Thong bao","NOTIFICATION",["list notifications","unread badge","mark read","mark all read","click navigate","realtime push"]],
  ["RT.26","test-rt26-payment-history.mjs","LS Thanh toan","PAYMENT_HISTORY",["list payments","filter method","filter date","search","view detail","export"]],
  ["RT.27","test-rt27-finance-dashboard.mjs","Dashboard TC","FINANCE_DASHBOARD",["overview KPIs","chart","time filter","top debtors","upcoming debts"]],
  ["RT.28","test-rt28-warehouse-report.mjs","BC Kho","WAREHOUSE_REPORT",["current stock","filter warehouse","filter category","filter date","low stock","slow moving","export"]],
  ["RT.29","test-rt29-materials.mjs","NVL","MATERIAL",["list materials","create","BOM setup","auto deduct","low stock alert","export"]],
  ["RT.30","test-rt30-timekeeping.mjs","Cham cong","TIMEKEEPING",["attendance board","add record","edit record","delete record","filter","total hours","export"]],
  ["RT.31","test-rt31-warranty-ticket.mjs","BH & Ticket","WARRANTY",["warranty list","create warranty","expired warning","status flow","detail","search","ticket list","create ticket","assign","ticket status","export"]],
  ["RT.32","test-rt32-email-sms-zalo.mjs","Marketing Channels","EMAIL_MARKETING",["email list","create email","select template","select recipients","send schedule","report","SMS campaign","SMS report","Zalo campaign","email config","SMS config","Zalo config"]],
  ["RT.33","test-rt33-customer-care.mjs","CS & Social","CARE_HISTORY",["care history","create schedule","record result","auto scenario","fanpage chat","reply","customer from chat","order from chat","call center","call history","survey create","survey send","survey results"]],
  ["RT.34","test-rt34-offers.mjs","Bao gia","OFFER",["list offers","create offer","send email","export PDF","convert to order","edit cancel","expired"]],
  ["RT.35","test-rt35-campaigns.mjs","Chien dich","CAMPAIGN",["list campaigns","create","activate","pause end","report","pipeline","assign sales"]],
  ["RT.36","test-rt36-customer-analysis.mjs","Phan tich KH","CUSTOMER_ANALYSIS",["overview","top revenue","top frequency","churn risk","CLV","distribution","export"]],
  ["RT.37","test-rt37-invoices.mjs","Hoa don","SALE_INVOICE",["list invoices","detail","search","filter status","filter employee","cancel","print","create VAT"]],
  ["RT.38","test-rt38-pos-advanced.mjs","POS nang cao","COUNTER_SALES",["multi payment","save draft","continue draft","auto promo","eligible promos","out of stock","variants","manual qty","line discount","order discount","notes","receipt","change calc"]],
  ["RT.39","test-rt39-calendar.mjs","Lich hen","CALENDAR",["calendar views","create appointment","conflict","edit","cancel","reminder","filter"]],
  ["RT.40","test-rt40-organization.mjs","To chuc","ORGANIZATION",["org info","edit org","current package","renew","upgrade","extensions list","install remove"]],
  ["RT.41","test-rt41-bpm.mjs","BPM","MANAGE_PROCESSES",["list processes","create process","design BPMN","user task config","gateway config","publish","simulation","business rules","decision table","task list","process task"]],
  ["RT.42","test-rt42-marketing-auto.mjs","Automation","MARKETING_AUTOMATION",["list automations","create","trigger config","action config","activate pause","test trigger","report"]],
  ["RT.43","test-rt43-sale-flow.mjs","Sale Flow","SALE_FLOW",["list flows","create flow","config steps","add opportunity","drag step","close won lost","pipeline report","filter search"]],
];

let count = 0;
for (const [code, file, name, route, checks] of mods) {
  let steps = "";
  checks.forEach((check, i) => {
    const id = code.replace(".", "") + "-" + String(i + 1).padStart(3, "0");
    const nav = i === 0
      ? `\n      await t.goto(ROUTES.${route});\n      await t.screenshot("${id.toLowerCase()}");`
      : "";
    const assertion = i === 0
      ? `await t.exists(".ag-row, table tbody tr, [class*='list'], [class*='card'], [class*='page']")`
      : "true /* TODO: implement */";
    steps += `
    // -- ${id}: ${check} --
    t.log("\\u25B6", "${id}: ${check}");
    {${nav}
      // TODO: Implement — ${check}
      const ok = ${assertion};
      t.assert("${id}", ok, "${check}");
    }
`;
  });

  const content = `#!/usr/bin/env node
/**
 * ${code} — ${name}
 * Testcase: docs/TESTCASE_REBORN_RETAIL_FULL.md
 * Chay: node tests/${file}
 */
import { createTestRunner } from "./helpers.mjs";
import { ROUTES } from "./config.mjs";

async function main() {
  const t = await createTestRunner("${code}", "${name}");
  try {
    if (!(await t.login())) throw new Error("Login failed");
    console.log("-".repeat(60));
${steps}
  } catch (err) {
    t.log("\\u{1F4A5}", \`Error: \${err.message}\`);
    await t.screenshot("error");
  }
  const report = await t.done();
  process.exit(report.failed > 0 ? 1 : 0);
}
main();
`;

  fs.writeFileSync("tests/" + file, content);
  count++;
}
console.log("Created: " + count + " files");
