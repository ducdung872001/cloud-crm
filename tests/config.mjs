/**
 * Test Configuration — Reborn Retail CRM
 *
 * Cau hinh chung cho tat ca test scripts.
 * Thay doi o day se anh huong toan bo test suite.
 */

export const CONFIG = {
  // ── Server ──
  BASE_URL: process.env.BASE_URL || "http://localhost:4000",

  // ── Credentials ──
  USERNAME: process.env.TEST_USER || "admin",
  PASSWORD: process.env.TEST_PASS || "admin123",

  // ── Timeouts (ms) ──
  NAVIGATION_TIMEOUT: 15000,
  ACTION_TIMEOUT: 5000,
  MODAL_TIMEOUT: 3000,
  API_TIMEOUT: 10000,

  // ── Browser ──
  HEADLESS: process.env.HEADLESS === "true",
  VIEWPORT: { width: 1440, height: 900 },
  SLOW_MO: parseInt(process.env.SLOW_MO || "0"),

  // ── Paths ──
  SCREENSHOTS_DIR: "tests/screenshots",
  REPORTS_DIR: "tests/reports",
};

/**
 * Routes — Duong dan cac trang chinh
 * Cap nhat neu route thay doi
 */
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",

  // RT.01-02: Kho
  STOCK_LEDGER: "/inventory",
  WAREHOUSE: "/warehouse",
  INVENTORY_CHECKING: "/inventory_checking",
  CREATE_INVENTORY: "/create_inventory",
  IMPORT_INVOICE: "/invoice_order",
  ADJUSTMENT_SLIP: "/adjustment_slip",
  DESTROY_SLIP: "/destroy_slip",
  TRANSFER_ORDER: "/inventory_transfer_document",
  WAREHOUSE_REPORT: "/report_warehouse",

  // RT.03: POS
  COUNTER_SALES: "/create_sale_add",

  // RT.04: Don hang online
  MULTI_CHANNEL: "/multi_channel_sales",

  // RT.05: Van chuyen
  SHIPPING: "/shipping",
  ADD_SHIPPING: "/add_shipping",
  SHIPPING_PARTNER: "/shipping_parther",
  SHIPPING_FEE: "/shipping_fee_config",
  SHIPPING_REPORT: "/dashboard_shipping",

  // RT.06: Thu chi
  CASHBOOK: "/finance_management/cashbook",
  CASHBOOK_TEMPLATE: "/finance_management/cashbook_template",

  // RT.07: Hoa don VAT
  INVOICE_VAT: "/invoiceVAT",

  // RT.08: San pham
  SETTING_SELL: "/setting_sell",
  PRODUCT_INVENTORY: "/product_inventory",
  PRODUCTS_SOLD: "/products_sold",

  // RT.09: Khach hang
  CUSTOMER_LIST: "/customer_list",
  CUSTOMER_PERSON: "/customer_person",
  DETAIL_PERSON: "/detail_person",
  SETTING_CUSTOMER: "/setting_customer",

  // RT.10: Khuyen mai & Loyalty
  PROMOTIONAL_PROGRAM: "/promotional_program",
  LOYALTY_POINT_LEDGER: "/loyalty_point_ledger",
  LOYALTY_WALLET: "/loyalty_wallet",
  LOYALTY_REWARD: "/loyaltyReward",
  LOYALTY_SEGMENT: "/loyaltySegment",
  SETTING_LOYALTY: "/setting_loyalty",
  DASHBOARD_LOYALTY: "/dashboard_loyalty",

  // RT.11: Dashboard & Bao cao
  DASHBOARD_RETAIL: "/dashboard",
  REPORT_COMMON: "/report_common",
  REPORT_CUSTOMER: "/customer_report",
  INVENTORY_REPORT: "/inventory_report_modern",
  MARKETING_REPORT: "/marketing_report",

  // RT.12: Ca lam viec
  SHIFT_MANAGEMENT: "/shift_management",
  SHIFT_CONFIG: "/shift_config",
  SHIFT_INVENTORY: "/finance_management/shift_inventory",

  // RT.13: Cong no
  DEBT_MANAGEMENT: "/finance_management/debt_management",

  // RT.14: Quy
  FUND_MANAGEMENT: "/finance_management/fund_management",

  // RT.15: Tra hang
  RETURN_INVOICE: "/return_invoice",

  // RT.16: Doi soat
  PAYMENT_CONTROL: "/payment_control",

  // RT.17: Cai dat
  SETTING_BASIS: "/setting_basis",
  SETTING_ORG: "/setting_org",
  SETTING_PAYMENT: "/setting_payment_method",
  SETTING_CHANNELS: "/setting_channels",
  SETTING_EMAIL: "/setting_email",
  SETTING_SMS: "/setting_sms",
  SETTING_ZALO: "/setting_zalo",
  SETTING_INTEGRATIONS: "/setting_integrations",
  SETTING_ACCOUNT: "/setting_account",

  // RT.19: NCC
  SUPPLIER: "/supplier_list",

  // RT.24: Don hang
  SALE_INVOICE: "/sale_invoice",
  ORDER: "/order",
  ORDER_TRACKING: "/order_tracking",

  // RT.25: Thong bao
  NOTIFICATION: "/notification",

  // RT.26: Lich su thanh toan
  PAYMENT_HISTORY: "/payment_history",

  // RT.27: Dashboard tai chinh
  FINANCE_DASHBOARD: "/finance_management/dashboard",

  // RT.29: Nguyen vat lieu
  MATERIAL: "/material",

  // RT.30: Cham cong
  TIMEKEEPING: "/timekeeping",

  // RT.31: Bao hanh & Ticket
  WARRANTY: "/warranty",
  TICKET: "/ticket",

  // RT.32-33: Marketing & CRM
  EMAIL_MARKETING: "/email_marketting",
  SMS_MARKETING: "/sms_marketting",
  ZALO_MARKETING: "/zalo_marketting",
  FANPAGE: "/fanpage",
  CARE_HISTORY: "/care_history",

  // RT.34: Bao gia
  OFFER: "/offer",

  // RT.35: Chien dich
  CAMPAIGN: "/campaign",
  MARKETING_CAMPAIGN: "/marketing_campaign",

  // RT.36: Phan tich KH
  CUSTOMER_ANALYSIS: "/customer_analysis",

  // RT.39: Lich hen
  CALENDAR: "/calendar",

  // RT.40: To chuc
  ORGANIZATION: "/organization",
  PACKAGE: "/package_manage",

  // RT.41: BPM
  MANAGE_PROCESSES: "/manage_processes",
  PROCESS_SIMULATION: "/process_simulation",
  CONFIG_BPM: "/config_bpm",
  BUSINESS_RULE: "/bpm/business_rule",

  // RT.42: Marketing Automation
  MARKETING_AUTOMATION: "/marketing_automation",

  // RT.43: Sale Flow
  SALE_FLOW: "/manage_sale_flow",
};
