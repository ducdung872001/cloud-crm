// ============================================================
// TNPM CRM – URL Configuration
// Property Management Platform
// ============================================================

const tnpmUrls = {
  // Dashboard
  dashboard: "/dashboard",

  // 1. Portfolio & Dự án
  portfolioList: "/portfolios",
  projectList: "/projects",
  projectDetail: "/projects/:id",
  unitList: "/units",
  unitDetail: "/units/:id",

  // 2. Khách hàng (Tenant)
  customerList: "/customers",
  customerDetail: "/customers/:id",
  customerAdd: "/customers/add",

  // 3. Hợp đồng thuê (Lease Management)
  leaseContractList: "/lease-contracts",
  leaseContractAdd: "/lease-contracts/add",
  leaseContractDetail: "/lease-contracts/:id",

  // 4. Hợp đồng dịch vụ
  serviceContractList: "/service-contracts",

  // 5. Billing Engine – Hóa đơn
  billingList: "/billing",
  billingAdd: "/billing/add",
  billingDetail: "/billing/:id",

  // 6. Turnover Rent (TTTM)
  turnoverRentList: "/turnover-rent",

  // 7. Nhà cung cấp (Vendor Management)
  vendorList: "/vendors",
  vendorAdd: "/vendors/add",
  vendorDetail: "/vendors/:id",
  vendorContractList: "/vendor-contracts",
  vendorInvoiceList: "/vendor-invoices",

  // 8. Yêu cầu dịch vụ (Service Request)
  serviceRequestList: "/service-requests",
  serviceRequestDetail: "/service-requests/:id",

  // 9. Kế hoạch bảo trì
  maintenancePlanList: "/maintenance-plans",
  maintenancePlanDetail: "/maintenance-plans/:id",

  // 10. Báo cáo
  reportTNPM: "/reports",
  reportFinancial: "/reports/financial",
  reportOccupancy: "/reports/occupancy",
  reportOperations: "/reports/operations",
  reportVendor: "/reports/vendor",

  // 11. Cài đặt
  settings: "/settings",
  settingsBasis: "/settings/basis",
  settingsProject: "/settings/project",
  settingsEmployee: "/settings/employee",
  settingsBilling: "/settings/billing",
  settingsNotification: "/settings/notification",
  settingsIntegration: "/settings/integration",

  // System
  login: "/login",
  notFound: "/404",
};

export default tnpmUrls;
