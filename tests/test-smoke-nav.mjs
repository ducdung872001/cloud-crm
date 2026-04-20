/**
 * test-smoke-nav.mjs — mở tất cả route chính, bắt console error + API status.
 * Dùng làm lưới an toàn phát hiện nhanh route bị crash / API 5xx.
 */
import { createTestRunner } from "./helpers.mjs";

const ROUTES = [
  // Dashboard
  ["SMK-DASH", "/dashboard", "Dashboard"],
  // Lễ tân
  ["SMK-POS", "/create_sale_add", "Bán hàng tại quầy"],
  ["SMK-CHECKIN", "/ch_checkin", "Check-in / Cửa vào"],
  ["SMK-SERVICES", "/ch_services", "Trừ quota dịch vụ"],
  ["SMK-SHIFT", "/shift_management", "Quản lý ca làm việc"],
  // Thành viên
  ["SMK-CUSTOMER", "/customer_list", "Danh sách thành viên"],
  ["SMK-SETTING-CUSTOMER", "/setting_customer", "Cài đặt thành viên"],
  // Giao dịch
  ["SMK-INVOICE", "/sale_invoice", "Danh sách đơn"],
  ["SMK-INVOICE-VAT", "/invoiceVAT", "Hoá đơn VAT"],
  // Lưu trú
  ["SMK-ACCOM", "/ch_accommodation", "Lưu trú"],
  // Tài chính
  ["SMK-FIN-DASH", "/finance_management/dashboard", "Tổng quan tài chính"],
  ["SMK-FIN-CASH", "/finance_management/cashbook", "Sổ thu chi"],
  ["SMK-FIN-FUND", "/finance_management/fund_management", "Quản lý quỹ"],
  ["SMK-FIN-CAT", "/finance_management/category_management", "Khoản mục"],
  ["SMK-FIN-DEBT", "/finance_management/debt_management", "Công nợ"],
  ["SMK-PAY-CTRL", "/payment_control", "Đối soát thanh toán"],
  // Đối tác / Phản hồi
  ["SMK-PARTNER", "/ch_partners", "Đối tác"],
  ["SMK-FEEDBACK", "/ch_feedback", "Phản hồi"],
  // Báo cáo
  ["SMK-REP-REV", "/ch_report_revenue", "Báo cáo doanh thu"],
  ["SMK-REP-MEM", "/ch_report_members", "Báo cáo thành viên"],
  ["SMK-REP-CHK", "/ch_report_checkin", "Báo cáo check-in"],
  ["SMK-REP-SVC", "/ch_report_services", "Báo cáo dịch vụ"],
  ["SMK-REP-PTN", "/ch_report_partners", "Báo cáo đối tác"],
  ["SMK-REP-FIN", "/ch_report_finance", "Báo cáo tài chính"],
  // Ưu đãi & chăm sóc
  ["SMK-PROMO", "/promotional_program", "Khuyến mãi & Voucher"],
  ["SMK-LOYALTY", "/member_list", "Tích điểm hội viên"],
  ["SMK-MKT", "/marketing_campaign", "Chiến dịch marketing"],
  ["SMK-CARE", "/customer_care_page", "Chăm sóc thành viên"],
  // Kho & NVL
  ["SMK-MATERIAL", "/material", "Nguyên vật liệu"],
  ["SMK-SUPPLIER", "/supplier", "Nhà cung cấp"],
  ["SMK-WAREHOUSE", "/warehouse", "Danh sách kho"],
  ["SMK-INVENTORY", "/inventory", "Sổ kho"],
  ["SMK-INV-CHK", "/inventory_checking", "Quản lý kho (kiểm kê)"],
  ["SMK-WH-REPORT", "/report_warehouse", "Báo cáo kho"],
  // Cài đặt
  ["SMK-TENANT", "/ch_tenant_config", "Cấu hình toàn cục"],
  ["SMK-SET-SELL", "/setting_sell", "Danh mục dịch vụ"],
  ["SMK-MEMB-PLAN", "/ch_membership_plans", "Gói thành viên"],
  ["SMK-SET-BASIS", "/setting_basis", "Vận hành cơ sở"],
  ["SMK-SET-ORG", "/setting_org", "Tổ chức & phân quyền"],
  ["SMK-SET-CHAN", "/setting_channels", "Kênh liên lạc"],
  ["SMK-SET-INTG", "/setting_integrations", "Tích hợp"],
  ["SMK-SET-ACC", "/setting_account", "Tài khoản & bảo mật"],
  ["SMK-SET-TICKET", "/setting_ticket", "Hỗ trợ thành viên"],
];

const t = await createTestRunner("SMOKE-NAV", "Smoke Navigation (all sidebar routes)");

const consoleErrors = [];
const failedApis = [];
t.page.on("console", (msg) => {
  if (msg.type() === "error") {
    const text = msg.text();
    // Bỏ qua warning không quan trọng
    if (/React Router|DevTools|Download the React|Warning/i.test(text)) return;
    consoleErrors.push(text.slice(0, 300));
  }
});
t.page.on("response", async (res) => {
  const url = res.url();
  if (!/\/(adminapi|bizapi|api|authenticator|bpmapi)\//.test(url)) return;
  if (res.status() >= 400) {
    failedApis.push({ status: res.status(), url: url.split("?")[0] });
  }
});
t.page.on("pageerror", (err) => consoleErrors.push(`PAGEERROR: ${err.message}`));

await t.login();

for (const [tcId, route, label] of ROUTES) {
  consoleErrors.length = 0;
  failedApis.length = 0;
  const apiCountBefore = 0; // local reset not needed

  let ok = true;
  let detail = label;
  try {
    await t.page.goto(`${t.page.url().split("/crm")[0]}/crm${route}`, {
      waitUntil: "load",
      timeout: 20000,
    });
    await t.page.waitForTimeout(2500);
    await t.dismissTour();

    // Nếu URL redirect ra khỏi /crm → chưa login / mất quyền
    if (!t.page.url().includes("/crm/")) {
      ok = false;
      detail = `${label} — bị redirect khỏi /crm (${t.page.url()})`;
    }
    if (consoleErrors.length > 0) {
      ok = false;
      detail = `${label} — ${consoleErrors.length} console error: ${consoleErrors[0]}`;
    }
    if (failedApis.length > 0) {
      const summary = failedApis.slice(0, 2).map((a) => `${a.status} ${a.url.split("/").slice(-2).join("/")}`).join("; ");
      ok = false;
      detail = `${label} — API lỗi: ${summary}`;
    }
  } catch (err) {
    ok = false;
    detail = `${label} — navigate error: ${err.message.slice(0, 120)}`;
  }

  t.assert(tcId, ok, detail);
  if (!ok) {
    await t.screenshot(`fail-${tcId.toLowerCase()}`);
  }
}

await t.done();
