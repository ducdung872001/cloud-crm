import React, { Fragment } from "react";
import Icon from "components/icon";
const Dashboard = React.lazy(() => import("pages/Dashboard/index"));
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./urls";

const CustomerPersonList = React.lazy(() => import("pages/CustomerPerson/CustomerPersonList"));
const ContactList = React.lazy(() => import("pages/Contact/ContactList"));
const ScheduleNextList = React.lazy(() => import("pages/Schedule/ScheduleNextList"));
// Removed: TreatmentSchedule (non-retail beauty/spa)
const TimeKeepingList = React.lazy(() => import("pages/Timekeeping/TimekeepingList"));
const CashBookList = React.lazy(() => import("pages/CashBook/CashBookList"));
const PaymentHistoryList = React.lazy(() => import("pages/PaymentHistory/PaymentHistoryList"));
const CrmCampaignList = React.lazy(() => import("pages/CrmCampaign/CrmCampaignList"));
const SettingList = React.lazy(() => import("pages/Setting/SettingList"));
const ReportCommon = React.lazy(() => import("pages/ReportCommon/ReportCommon"));
const InternalMailList = React.lazy(() => import("pages/InternalMail/InternalMailList"));
const DetailPersonList = React.lazy(() => import("pages/CustomerPerson/partials/DetailPerson/DetailPersonList"));
const WarrantyList = React.lazy(() => import("pages/Warranty/WarrantyList"));
const WarrantyListProcess = React.lazy(() => import("pages/Warranty/WarrantyListProcess"));
const CollectWarranty = React.lazy(() => import("pages/Warranty/partials/CollectWarranty"));
const TicketList = React.lazy(() => import("pages/Ticket/TicketList"));
const TicketListProcess = React.lazy(() => import("pages/Ticket/TicketListProcess"));
const CollectTicket = React.lazy(() => import("pages/Ticket/partials/CollectTicket"));
const SettingTicketList = React.lazy(() => import("pages/SettingTicket/SettingTicketList"));
const SettingWarrantyList = React.lazy(() => import("pages/SettingWarranty/SettingWarrantyList"));
const DetailWarranty = React.lazy(() => import("pages/Warranty/partials/DetailWarranty/DetailWarranty"));
const DetailTicket = React.lazy(() => import("pages/Ticket/partials/DetailTicket/DetailTicket"));
const SettingSMSList = React.lazy(() => import("pages/SettingSMS/SettingSMSList"));
const SettingCallList = React.lazy(() => import("pages/SettingCall/SettingCallList"));
const SettingEmailList = React.lazy(() => import("pages/SettingEmail/SettingEmailList"));
const ZaloMarketting = React.lazy(() => import("pages/ZaloMarketting/ZaloMarketting"));
const SMSMarkettingList = React.lazy(() => import("pages/SMSMarketting/SMSMarkettingList"));
const EmailMarkettingList = React.lazy(() => import("pages/EmailMarketting/EmailMarkettingList"));
const SettingRoseList = React.lazy(() => import("pages/SettingRose/SettingRoseList"));
const SettingBasisList = React.lazy(() => import("pages/SettingBasis/SettingBasisList"));
const SettingOrgList = React.lazy(() => import("pages/SettingOrg/SettingOrgList"));
const SettingAccountLanding = React.lazy(() => import("pages/SettingAccountLanding/SettingAccountLanding"));
const SettingChannels = React.lazy(() => import("pages/SettingChannels/SettingChannels"));
const SettingIntegrations = React.lazy(() => import("pages/SettingIntegrations/SettingIntegrations"));
const SettingTimekeepingList = React.lazy(() => import("pages/SettingTimekeeping/SettingTimekeepingList"));
const SettingCustomerList = React.lazy(() => import("pages/SettingCustomer/SettingCustomerList"));
const SettingSellList = React.lazy(() => import("pages/SettingSell/SettingSellList"));
const SettingCashBookList = React.lazy(() => import("pages/SettingCashBook/SettingCashBookList"));
const SettingMarketResearchList = React.lazy(() => import("pages/SettingMarketResearch/SettingMarketResearchList"));
const SettingMarketingList = React.lazy(() => import("pages/SettingMarketing/SettingMarketingList"));
const SettingWorkTypeList = React.lazy(() => import("pages/SettingWork/SettingWorkTypeList"));
const SetttingSocialCrmList = React.lazy(() => import("pages/SetttingSocialCrm/SetttingSocialCrmList"));
const SettingReportList = React.lazy(() => import("pages/SettingReport/SettingReportList"));
const MiddleWorkList = React.lazy(() => import("pages/MiddleWork/MiddleWorkList"));
const ResourceManagementList = React.lazy(() => import("pages/ResourceManagement/ResourceManagementList"));
const PublicConnectZalo = React.lazy(() => import("pages/Public/PublicConnectZalo"));
// Kho hàng
const ImportInvoiceList = React.lazy(() => import("pages/ProductImport/ImportInvoiceList/ImportInvoiceList"));
const ProductSoldList = React.lazy(() => import("pages/ProductImport/ProductSoldList/ProductSoldList"));
const ProductInventoryList = React.lazy(() => import("pages/ProductImport/ProductInventoryList/ProductInventoryList"));
const InventoryList = React.lazy(() => import("pages/ProductImport/Inventory/InventoryList"));
const WarehouseListPage = React.lazy(() => import("pages/ProductImport/WarehouseList/WarehouseListPage"));
const CreateReceipt = React.lazy(() => import("pages/ProductImport/CreateReceipt/CreateReceipt"));
// Quản lý tài chính
const FinanceManagement = React.lazy(() => import("pages/Finance"));
const FinanceDashboard = React.lazy(() => import("pages/Finance/Dashboard"));
const FinanceCashBook = React.lazy(() => import("pages/Finance/CashBook"));
const FinanceCashBookTemplate = React.lazy(() => import("pages/Finance/CashBookTemplate"));
const FinanceFundManagement = React.lazy(() => import("pages/Finance/FundManagement"));
const FinanceDebtManagement = React.lazy(() => import("pages/Finance/DebtManagement"));
const FinanceDebtTransaction = React.lazy(() => import("pages/Finance/DebtTransaction"));
const FinanceShiftInventory = React.lazy(() => import("pages/Finance/ShiftInventory"));
// Bán hàng
const CreateOrderSales = React.lazy(() => import("pages/Sell/CreateOrderSales/CreateOrderSales"));
const SaleInvoiceList = React.lazy(() => import("pages/Sell/SaleInvoiceList/SaleInvoiceList"));
const CustomerPayList = React.lazy(() => import("pages/Sell/CustomerPayList/CustomerPayList"));
// Lịch
const CalendarCommon = React.lazy(() => import("pages/CalendarCommon/CalendarCommon"));
// Chăm sóc khách hàng
const CallCenterList = React.lazy(() => import("pages/CallCenter/CallCenterList"));
// Kênh bán facebook
const SocialCrmFacebook = React.lazy(() => import("pages/SocialCrmFacebook/SocialCrmFacebook"));
// Kênh bán Zalo
const SocialCrmZalo = React.lazy(() => import("pages/SocialCrmZalo/SocialCrmZalo"));
// Phiếu điều chỉnh kho
const AdjustmentSlip = React.lazy(() => import("pages/AdjustmentSlip/AdjustmentSlip"));
const DestroySlip = React.lazy(() => import("pages/DestroySlip"));
// Thông tin tài khoản cá nhân
const SettingAccount = React.lazy(() => import("pages/SettingAccount/SettingAccount"));
const ReportCustomer = React.lazy(() => import("pages/ReportCustomer/ReportCustomer"));
const ReportCustomerModern = React.lazy(() => import("pages/ReportCustomerModern/ReportCustomerModern"));
// Cài đặt ứng dụng
const InstallApplication = React.lazy(() => import("pages/InstallApplication/InstallApplication"));
const MarketingAutomation = React.lazy(() => import("pages/MarketingAutomation/MarketingAutomation"));
const SettingZalo = React.lazy(() => import("pages/SettingZalo/SettingZalo"));
const CreateCampaign = React.lazy(() => import("pages/Campaign/partials/CreateCampaign/CreateCampaign"));
const CustomerSegment = React.lazy(() => import("pages/customerSegment"));
const MarketingAutomationList = React.lazy(() => import("pages/MarketingAutomation/MarketingAutomationList"));
const CreateMarketingAutomation = React.lazy(() => import("pages/MarketingAutomation/CreateMarketingAutomation/CreateMarketingAutomation"));
const EmailList = React.lazy(() => import("pages/Email/EmailList"));
const SettingContactList = React.lazy(() => import("pages/SettingContact/SettingContactList"));
const FeedbackCustomer = React.lazy(() => import("pages/FeedbackCustomer/FeedbackCustomer"));
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";
const ViettelIntegration = React.lazy(() => import("@/pages/ViettelIntegration/ViettelIntegration"));
// Khảo sát khách hàng
const CustomerSurvey = React.lazy(() => import("pages/CustomerSurvey"));
const LoyaltyPointLedger = React.lazy(() => import("pages/LoyaltyPointLedger"));
const LoyaltyReward = React.lazy(() => import("pages/LoyaltyReward"));
const LoyaltySegment = React.lazy(() => import("pages/LoyaltySegment"));
const LoyaltyWallet = React.lazy(() => import("pages/LoyaltyWallet"));
// tạo đường link khảo sát
const LinkSurvey = React.lazy(() => import("pages/LinkSurvey"));
const SettingProcess = React.lazy(() => import("pages/SettingProcess/SettingProcess"));
const SaleFlowList = React.lazy(() => import("pages/SaleFlow/SaleFlowList"));
const CreateSaleflow = React.lazy(() => import("pages/SaleFlow/CreateSaleFlow/CreateSaleFlow"));
const ManagementSale = React.lazy(() => import("pages/ManagementSale/ManagementSale"));
const NotificationList = React.lazy(() => import("@/pages/NotificationList/NotificationList"));
// Phiếu điền chuyển kho
const TransferOrderForm = React.lazy(() => import("pages/TransferOrderForm"));
const DetailMarketingAutomation = React.lazy(() => import("pages/MarketingAutomation/DetailMarketingAutomation"));
const ManageDataSharing = React.lazy(() => import("pages/ManageDataSharing/ManageDataSharing"));
const SettingPartnerList = React.lazy(() => import("pages/SettingPartner/SettingPartnerList"));
const SupplierPage = React.lazy(() => import("pages/SupplierPage/SupplierPage"));
const PartnerList = React.lazy(() => import("pages/PartnerList/PartnerList"));
const ReportLogin = React.lazy(() => import("pages/ReportLogin/ReportLogin"));
const BusinessProcessList = React.lazy(() => import("pages/BPM/BusinessProcessList/BusinessProcessList"));
const SettingBusinessProcess = React.lazy(() => import("pages/BPM/SettingBusinessProcess/SettingBusinessProcess"));
const ConfigBPM = React.lazy(() => import("pages/ConfigBPM"));
const ProcessedObjectList = React.lazy(() => import("pages/SettingProcess/partials/ProcessedObjectList"));
const CreateOrder = React.lazy(() => import("pages/Order/createOrder"));
const OrderInvoiceList = React.lazy(() => import("pages/Order/orderInvoiceList"));
const TemporaryOrderList = React.lazy(() => import("pages/Order/temporaryOrderList"));
const ManageOrder = React.lazy(() => import("pages/ManagerOrder"));
const SettingProjectList = React.lazy(() => import("pages/SettingProject/SettingProjectList"));
const ProjectList = React.lazy(() => import("pages/ProjectList/ProjectList"));
const IntegratedMonitoring = React.lazy(() => import("pages/IntegratedMonitoring/IntegratedMonitoring"));
const SettingCode = React.lazy(() => import("pages/SettingCode/SettingCode"));
const SettingIntegration = React.lazy(() => import("pages/SettingIntegration/SettingIntegration"));
const SettingDashboard = React.lazy(() => import("pages/SettingDashboard/SettingDashboard"));
const DetailProject = React.lazy(() => import("pages/ProjectList/DetailProject/DetailProject"));
const SettingPromotionList = React.lazy(() => import("pages/SettingPromotion/SettingPromotionList"));
const DetailPartner = React.lazy(() => import("pages/PartnerList/DetailPartner/DetailPartner"));
const CxmSurveyList = React.lazy(() => import("pages/CxmSurvey/CxmSurveyList/CxmSurveyList"));
const ProcessSimulation = React.lazy(() => import("pages/ProcessSimulation/ProcessSimulation"));
const BusinessProcessCreate = React.lazy(() => import("pages/BPM/BusinessProcessCreate"));
const CampaignListParent = React.lazy(() => import("pages/Campaign/CampaignListParent"));
const UserTaskList = React.lazy(() => import("pages/UserTaskList"));
const UploadDocument = React.lazy(() => import("pages/BPM/UploadDocument/UploadDocument"));
const OrderRequestList = React.lazy(() => import("pages/OrderRequestList"));
const MaterialList = React.lazy(() => import("@/pages/ManagementMaterial/MaterialList"));
const MaterialMenuPage = React.lazy(() => import("@/pages/ManagementMaterial/MaterialMenuPage"));
import { useCookies } from "react-cookie";
const OrderTracking = React.lazy(() => import("pages/OrderTracking"));
const OrganizationList = React.lazy(() => import("pages/Organization/OrganizationList"));
const Package = React.lazy(() => import("pages/Package"));
const ExtensionList = React.lazy(() => import("pages/Extension/ExtensionList"));
const UserList = React.lazy(() => import("pages/User/UserList"));
const FieldMannagement = React.lazy(() => import("pages/FieldManagement/FieldManagement"));
const ManageDefaultProcesses = React.lazy(() => import("pages/ManageDefaultProcesses"));
const ManagerWork = React.lazy(() => import("pages/ManagerWork"));
const Fanpage = React.lazy(() => import("pages/Fanpage"));
const TotalChat = React.lazy(() => import("pages/Fanpage/TotalChat"));
const BusinessRule = React.lazy(() => import("pages/BusinessRule"));
const BusinessRuleConfig = React.lazy(() => import("pages/BusinessRuleConfig"));
const MultiChannelSales = React.lazy(() => import("@/pages/MultiChannelSales/MultiChannelSales"));
const DashboardCH = React.lazy(() => import("pages/DashboardCH"));
const DashboardLoyalty = React.lazy(() => import("@/pages/DashboardLoyalty"));
const SettingPaymentMethod = React.lazy(() => import("@/pages/SettingPaymentMethod"));
const PromotionalProgram = React.lazy(() => import("@/pages/PromotionalProgram"));
const PromotionalReport = React.lazy(() => import("@/pages/PromotionalReport"));
const SettingLoyalty = React.lazy(() => import("pages/SettingLoyalty/SettingLoyalty"));
const InvoiceVATOverview = React.lazy(() => import("@/pages/Sell/InvoiceVAT/index"));
const ShippingList = React.lazy(() => import("@/pages/ShipingManagement/ShippingList"));
const ShippingFeeConfig = React.lazy(() => import("@/pages/ShipingManagement/ShippingFeeConfig/ShippingFeeConfig"));
const AddShippingOrder = React.lazy(() => import("@/pages/ShipingManagement/AddShippingOrder/AddShippingOrder"));
const ShippingPartnerSetup = React.lazy(() => import("@/pages/ShipingManagement/ShippingPartnerSetup/ShippingPartnerSetup"));
const ShippingReport = React.lazy(() => import("@/pages/ShipingManagement/ShippingReport/ShippingReport"));
const CustomerAndSupplier = React.lazy(() => import("@/pages/CustomerAndSupplier"));
const InventoryManagement = React.lazy(() => import("@/pages/ProductImport/InventoryChecking"));
const CounterSales = React.lazy(() => import("@/pages/CounterSales"));
const ShiftTabsPage = React.lazy(() => import("@/pages/ShiftManagement/ShiftTabsPage"));
const ShiftConfigTabs = React.lazy(() => import("@/pages/ShiftConfig/ShiftConfig"));
const WarehouseReport = React.lazy(() => import("@/pages/WarehouseReport/WarehouseReport"));
const MarketingReportPage = React.lazy(() => import("@/pages/MarketingReportPage/MarketingReportPage"));
const InventoryReportModern = React.lazy(() => import("pages/InventoryReportModern/InventoryReportModern"));
const PromotionPage = React.lazy(() => import("@/pages/PromotionPage/PromotionPage"));
const MemberCustomersPage = React.lazy(() => import("@/pages/MemberCustomersPage/MemberCustomersPage"));
const CustomerCarePage = React.lazy(() => import("@/pages/CustomerCarePage/CustomerCarePage"));
const MarketingCampaignPage = React.lazy(() => import("@/pages/MarketingCampaignPage/MarketingCampaignPage"));
const CustomerAnalysisPage = React.lazy(() => import("@/pages/CustomerAnalysisPage/CustomerAnalysisPage"));
const PaymentMethodList = React.lazy(() => import("@/pages/PaymentMethod/PaymentMethod"));
const PaymentMethodPage = React.lazy(() => import("@/pages/PaymentMethodPage/PaymentMethodPage"));
const FinanceContent = React.lazy(() => import("@/pages/PaymentReconciliation"));
const ReturnProductPage = React.lazy(() => import("@/pages/ReturnProduct"));
const Reconcile = React.lazy(() => import("@/pages/Reconcile"));
const TaskProcessPage = React.lazy(() => import("@/pages/TaskProcessPage/TaskProcessPage"));
const FinanceCategoryManagement = React.lazy(() => import("pages/Finance/CategoryManagement"));
const sourceDomain = getDomain(decodeURIComponent(document.location.href));

// [CH] Community Hub pages
const CHCheckinPage = React.lazy(() => import("@/pages/CommunityHub/Checkin"));
const CHAccommodationPage = React.lazy(() => import("@/pages/CommunityHub/Accommodation"));
const CHServiceBookingPage = React.lazy(() => import("@/pages/CommunityHub/ServiceBooking"));
const CHCoursesPage = React.lazy(() => import("@/pages/CommunityHub/Courses"));
const CHPartnersPage = React.lazy(() => import("@/pages/CommunityHub/Partners"));
const CHFeedbackPage = React.lazy(() => import("@/pages/CommunityHub/Feedback"));
const CHReportRevenue = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportRevenue"));
const CHReportMembers = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportMembers"));
const CHReportCheckin = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportCheckin"));
const CHReportServices = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportServices"));
const CHReportPartners = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportPartners"));
const CHReportFinance = React.lazy(() => import("@/pages/CommunityHub/Reports/ReportFinance"));
const CHMembershipPlanSettings = React.lazy(() => import("@/pages/CommunityHub/MembershipPlanSettings"));
const CHServiceManagement = React.lazy(() => import("@/pages/CommunityHub/ServiceManagement"));
const CHTenantConfig = React.lazy(() => import("@/pages/CommunityHub/TenantConfig"));

// [CH] Community Hub - Menu chính
// Sắp xếp: dùng nhiều nhất ở trên → ít dùng ở dưới
export const menu: IMenuItem[] = [
  {
    title: "dashboard",
    path: urls.dashboard,
    icon: <Icon name="DashboardMenu" />,
    code: "DASHBOARD",
  },

  // ═══ DÙNG HÀNG NGÀY (Lễ tân / Bán hàng) ══════════════════════════════
  {
    title: "chReception", // Lễ tân
    path: urls.create_sale_add,
    icon: <Icon name="PosMenu" />,
    code: "",
    children: [
      { title: "createSalesOrder", path: urls.create_sale_add, icon: <Icon name="SaleOrderMenu" />, code: "CREATE_SALE_ORDER" },
      { title: "chCheckin", path: "/ch_checkin", icon: <Icon name="OverviewMenu" />, code: "" },
      { title: "chDeductQuota", path: "/ch_services", icon: <Icon name="EndShiftMenu" />, code: "" },
      { title: "shiftManagement", path: urls.shift_management, icon: <Icon name="ShiftReportMenu" />, code: "" },
    ],
  },
  {
    title: "customer", // Thành viên
    path: urls.customer,
    icon: <Icon name="CustomersMenu" />,
    code: "CUSTOMER",
    children: [
      { title: "customerList", path: urls.customer_list, icon: <Icon name="CustomerMenu" />, code: "CUSTOMER" },
      { title: "settingCustomer", path: urls.setting_customer, icon: <Icon name="CustomerSettingMenu" />, code: "MENU_SETUP_CUSTOMER" },
    ],
  },
  {
    title: "chOrders", // Giao dịch
    path: urls.sale_invoice,
    icon: <Icon name="OrderListMenu" />,
    code: "SALE_INVOICE",
    children: [
      { title: "salesInvoice", path: urls.sale_invoice, icon: <Icon name="OrderListMenu" />, code: "SALE_INVOICE" },
      { title: "invoiceVAT", path: urls.invoiceVAT, icon: <Icon name="VatInvoiceMenu" />, code: "" },
    ],
  },
  {
    title: "chAccommodation", // Lưu trú
    path: "/ch_accommodation",
    icon: <Icon name="WarehouseListMenu" />,
    code: "",
  },

  // ═══ DÙNG THƯỜNG XUYÊN (Tài chính / Cộng đồng) ═══════════════════════
  {
    title: "financeManagement", // Tài chính
    path: urls.finance_management,
    icon: <Icon name="FinanceMenu" />,
    code: "",
    children: [
      { title: "financeDashboard", path: urls.finance_management_dashboard, icon: <Icon name="FinanceInfoMenu" />, code: "" },
      { title: "financeCashbook", path: urls.finance_management_cashbook, icon: <Icon name="CashbookMenu" />, code: "" },
      { title: "fundManagement", path: urls.finance_management_fund_management, icon: <Icon name="FundMenu" />, code: "" },
      { title: "categoryManagement", path: urls.finance_management_category_management, icon: <Icon name="CashbookMenu" />, code: "" },
      { title: "debtManagement", path: urls.finance_management_debt_management, icon: <Icon name="DebtMenu" />, code: "" },
      { title: "paymentControl", path: urls.payment_control, icon: <Icon name="PaymentMethodMenu" />, code: "" },
    ],
  },
  {
    title: "chPartners", // Đối tác
    path: "/ch_partners",
    icon: <Icon name="PartnerMenu" />,
    code: "",
  },
  {
    title: "chFeedback", // Phản hồi
    path: "/ch_feedback",
    icon: <Icon name="SupportSettingMenu" />,
    code: "",
  },
  {
    title: "chReports", // Báo cáo
    path: "/ch_report_revenue",
    icon: <Icon name="SalesReportMenu" />,
    code: "",
    children: [
      { title: "chReportRevenue", path: "/ch_report_revenue", icon: <Icon name="FinanceInfoMenu" />, code: "" },
      { title: "chReportMembers", path: "/ch_report_members", icon: <Icon name="CustomerMenu" />, code: "" },
      { title: "chReportCheckin", path: "/ch_report_checkin", icon: <Icon name="OverviewMenu" />, code: "" },
      { title: "chReportServices", path: "/ch_report_services", icon: <Icon name="MemberListMenu" />, code: "" },
      { title: "chReportPartners", path: "/ch_report_partners", icon: <Icon name="PartnerMenu" />, code: "" },
      { title: "chReportFinance", path: "/ch_report_finance", icon: <Icon name="CashbookMenu" />, code: "" },
    ],
  },

  // ═══ TIẾP THỊ & CHĂM SÓC ════════════════════════════════════════════
  {
    title: "marketing", // Tiếp thị & Chăm sóc
    path: urls.maketing,
    icon: <Icon name="PromotionMenu" />,
    code: "MARKETING",
    children: [
      { title: "promotionalProgram", path: urls.promotional_program, icon: <Icon name="PromotionMenu" />, code: "" },       // Khuyến mãi & Voucher
      { title: "loyaltyPoints", path: urls.member_list, icon: <Icon name="LoyaltyMenu" />, code: "" },                      // Tích điểm hội viên (hub: DS TV + hạng + lịch sử + quy tắc + báo cáo)
      { title: "marketingCampaign", path: urls.marketing_campaign, icon: <Icon name="BroadcastMenu" />, code: "MA" },        // Chiến dịch marketing
      { title: "customerCare", path: urls.customer_care_page, icon: <Icon name="SupportMenu" />, code: "" },                 // Chăm sóc thành viên
    ],
  },

  // ═══ ÍT DÙNG (Kho / Cài đặt) ═════════════════════════════════════════
  {
    title: "warehouse", // Kho & Nguyên vật liệu
    path: urls.product_import,
    icon: <Icon name="InventoryMenu" />,
    code: "MENU_INVENTORY",
    children: [
      { title: "managementMaterial", path: urls.material, icon: <Icon name="MaterialsMenu" />, code: "" },
      { title: "supplierList", path: urls.supplier_list, icon: <Icon name="PartnerMenu" />, code: "CUSTOMER" },              // Nhà cung cấp
      { title: "warehouseList", path: urls.warehouse, icon: <Icon name="WarehouseListMenu" />, code: "" },
      { title: "warehouseManagement", path: urls.inventory, icon: <Icon name="LedgerMenu" />, code: "INVENTORY" },
      { title: "warehouseChecking", path: urls.inventory_checking, icon: <Icon name="AuditMenu" />, code: "INVENTORY" },
      { title: "reportWarhouse", path: urls.report_warehouse, icon: <Icon name="SalesReportMenu" />, code: "" },
    ],
  },

  // ═══ HỆ THỐNG ═════════════════════════════════════════════════════════
  {
    title: "settings", // Cài đặt
    path: urls.setting_common,
    icon: <Icon name="SettingsMenu" />,
    code: "",
    children: [
      // ── [CH] Cấu hình toàn cục (admin tenant) ────────────────────────
      {
        title: "chTenantConfig",
        path: "/ch_tenant_config",
        icon: <Icon name="GeneralConfigMenu" />,
        code: "",
      },
      // ── [CH] Dịch vụ & Gói thành viên ────────────────────────────────
      {
        title: "chServiceCatalogSetting", // Danh mục dịch vụ → trang SettingSell (sản phẩm/dịch vụ đầy đủ)
        path: urls.setting_sell,
        icon: <Icon name="ProductCategoryMenu" />,
        code: "MENU_SETUP_SELL",
      },
      {
        title: "chMembershipPlans", // Cấu hình gói thành viên
        path: "/ch_membership_plans",
        icon: <Icon name="LoyaltyMenu" />,
        code: "",
      },
      // ── NHÓM 1: Vận hành cơ sở ─────────────────────────────────────
      {
        title: "settingBasis", // Vận hành cửa hàng (cửa hàng, thanh toán, ca, cấu hình chung)
        path: urls.setting_basis,
        icon: <Icon name="BaseSettingsMenu" />,
        code: "MENU_SETUP_BASIC",
      },

      // ── NHÓM 2: Tổ chức & phân quyền ───────────────────────────────
      {
        title: "settingOrg", // Tổ chức & phân quyền (phòng ban, nhóm quyền, nhân viên)
        path: urls.setting_org,
        icon: <Icon name="PersonalMenu" />,
        code: "",
      },

      // ── NHÓM 2: Kênh liên lạc (1 trang / 4 tabs) ─────────────────
      {
        title: "multiChannelCommunication", // Kênh liên lạc khách hàng
        path: urls.setting_channels, // Landing page gộp 4 kênh
        icon: <Icon name="SmsMenu" />,
        code: "MENU_SETUP_SMS",
        // sub-tabs: SMS, Email, Zalo, Tổng đài
        // (Hiện tại giữ 4 route riêng để không breaking change,
        //  có thể gộp thành 1 page sau khi refactor)
      },
      // -- Giữ lại để routing hoạt động, ẩn khỏi menu chính --
      // settingSMS     → /setting_sms
      // settingEmail   → /setting_email
      // settingZalo    → /setting_zalo
      // settingCall    → /setting_call

      // ── NHÓM 3: Tích hợp & kết nối ───────────────────────────────
      {
        title: "settingIntegrations", // Viettel + Ứng dụng + Giám sát webhook
        path: urls.setting_integrations,
        icon: <Icon name="IntegrationViettelMenu" />,
        code: "",
      },

      // ── NHÓM 4: Tài khoản & bảo mật ──────────────────────────────
      {
        title: "settingPersonal", // Tài khoản & bảo mật (cá nhân, kết nối, gói DV, nhật ký)
        path: urls.setting_account,
        icon: <Icon name="PersonalMenu" />,
        code: "",
      },

      // ── NHÓM 5: Hỗ trợ khách hàng ────────────────────────────────
      {
        title: "settingTicket", // Cài đặt hỗ trợ & QR Code
        path: urls.setting_ticket,
        icon: <Icon name="SupportSettingMenu" />,
        code: "",
      },
    ],
  },
  // [CH] Giữ nguyên Cài đặt
];

export const routes: IRouter[] = [
  // [CH] Community Hub routes
  {
    path: "/ch_checkin",
    component: <CHCheckinPage />,
  },
  {
    path: "/ch_accommodation",
    component: <CHAccommodationPage />,
  },
  {
    path: "/ch_services",
    component: <CHServiceBookingPage />,
  },
  {
    path: "/ch_courses",
    component: <CHCoursesPage />,
  },
  {
    path: "/ch_partners",
    component: <CHPartnersPage />,
  },
  {
    path: "/ch_feedback",
    component: <CHFeedbackPage />,
  },
  { path: "/ch_report_revenue", component: <CHReportRevenue /> },
  { path: "/ch_report_members", component: <CHReportMembers /> },
  { path: "/ch_report_checkin", component: <CHReportCheckin /> },
  { path: "/ch_report_services", component: <CHReportServices /> },
  { path: "/ch_report_partners", component: <CHReportPartners /> },
  { path: "/ch_report_finance", component: <CHReportFinance /> },
  {
    path: "/ch_membership_plans",
    component: <CHMembershipPlanSettings />,
  },
  {
    path: "/ch_service_catalog",
    component: <CHServiceManagement />,
  },
  {
    path: "/ch_tenant_config",
    component: <CHTenantConfig />,
  },
  // Dashboard
  {
    path: "",
    component: <DashboardCH />,
  },
  {
    path: urls.notification,
    component: <NotificationList />,
  },
  {
    path: urls.dashboard,
    // component: <Dashboard />,
    component: (
      <Fragment>
        <DashboardCH />
        {/* <Dashboard /> */}
      </Fragment>
    ),
  },
  {
    path: urls.manager_work,
    component: <ManagerWork />,
  },
  {
    path: urls.customer,
    component: <CustomerPersonList />,
  },
  {
    path: urls.customer_list,
    component: <CustomerAndSupplier type="customer" />,
  },
  {
    path: urls.supplier_list,
    component: <SupplierPage />,
  },
  {
    path: urls.partner,
    component: <PartnerList />,
  },
  {
    path: urls.detail_partner,
    component: <DetailPartner />,
  },

  {
    path: urls.detail_person,
    component: <DetailPersonList />,
  },
  {
    path: urls.contact,
    component: <ContactList />,
  },
  {
    path: urls.detail_project,
    component: <DetailProject />,
  },
  {
    path: urls.schedule_next,
    component: <ScheduleNextList />,
  },
  // Removed: TreatmentSchedule (non-retail beauty/spa)
  {
    path: urls.timekeeping,
    component: <TimeKeepingList />,
  },
  {
    path: urls.cashbook,
    component: <CashBookList />,
  },
  {
    path: urls.finance_management,
    component: <FinanceManagement />,
  },
  {
    path: urls.finance_management_dashboard,
    component: <FinanceDashboard />,
  },
  {
    path: urls.finance_management_cashbook,
    component: <FinanceCashBook />,
  },
  {
    path: urls.finance_management_cashbook_template,
    component: <FinanceCashBookTemplate />,
  },
  {
    path: urls.finance_management_fund_management,
    component: <FinanceFundManagement />,
  },
  {
    path: urls.finance_management_category_management,
    component: <FinanceCategoryManagement />,
  },
  {
    path: urls.finance_management_debt_management,
    component: <FinanceDebtManagement />,
  },
  {
    path: urls.finance_management_debt_transaction,
    component: <FinanceDebtTransaction />,
  },
  {
    path: urls.finance_management_shift_inventory,
    component: <FinanceShiftInventory />,
  },
  {
    path: urls.cxmSurvey, // Thông tin khảo sát
    component: <CxmSurveyList />,
  },
  {
    path: urls.fanpage,
    component: <Fanpage />,
  },
  {
    path: urls.total_chat,
    component: <TotalChat />,
  },
  {
    path: urls.manage_data_sharing,
    component: <ManageDataSharing />,
  },
  // báo cáo chung
  {
    path: urls.report_common,
    component: <ReportCommon />,
  },
  // Báo cáo khách hàng
  {
    path: urls.customer_report,
    component: <ReportCustomerModern />,
  },
  {
    path: urls.report_customer,
    component: <ReportCustomer />,
  },
  {
    path: urls.inventory_report,
    component: <WarehouseReport />,
  },
  {
    path: urls.inventory_report_modern,
    component: <InventoryReportModern />,
  },
  {
    path: urls.marketing_report,
    component: <MarketingReportPage />,
  },
  {
    path: urls.sales_campaign,
    // component: <CampaignList />,
    component: <CampaignListParent />,
  },
  {
    path: urls.create_sale_campaign,
    component: <CreateCampaign />,
  },
  {
    path: urls.edit_sale_campaign,
    component: <CreateCampaign />,
  },
  //Quy trình bán hàng
  {
    path: urls.sale_flow,
    component: <SaleFlowList />,
  },
  {
    path: urls.create_sale_flow,
    component: <CreateSaleflow />,
  },
  {
    path: urls.edit_sale_flow,
    component: <CreateSaleflow />,
  },
  {
    path: urls.management_sale,
    component: <ManagementSale />,
  },
  {
    path: urls.payment_history,
    component: <PaymentHistoryList />,
  },
  {
    path: urls.crm_campaign,
    component: <CrmCampaignList />,
  },
  {
    path: urls.setting_social_crm,
    component: <SetttingSocialCrmList />,
  },
  {
    path: urls.setting,
    component: <SettingList />,
  },
  {
    path: urls.internal_mail,
    component: <InternalMailList />,
  },
  {
    path: urls.invoiceVAT,
    component: <InvoiceVATOverview />,
  },
  {
    path: urls.warranty,
    component: <WarrantyList />,
  },
  {
    path: urls.warranty_process,
    component: <WarrantyListProcess />,
  },
  {
    path: urls.collect_warranty,
    component: <CollectWarranty />,
  },
  {
    path: urls.detail_warranty,
    component: <DetailWarranty />,
  },
  {
    path: urls.setting_warranty,
    component: <SettingWarrantyList />,
  },
  {
    path: urls.ticket,
    component: <TicketList />,
  },
  {
    path: urls.ticket_process,
    component: <TicketListProcess />,
  },
  {
    path: urls.collect_ticket,
    component: <CollectTicket />,
  },
  {
    path: urls.detail_ticket,
    component: <DetailTicket />,
  },
  {
    path: urls.setting_ticket,
    component: <SettingTicketList />,
  },
  {
    path: urls.setting_call,
    component: <SettingCallList />,
  },
  {
    path: urls.setting_sms,
    component: <SettingSMSList />,
  },
  {
    path: urls.setting_email,
    component: <SettingEmailList />,
  },
  {
    path: urls.setting_zalo,
    component: <SettingZalo />,
  },
  {
    path: urls.sms_marketting,
    component: <SMSMarkettingList />,
  },
  {
    path: urls.email_marketting,
    component: <EmailMarkettingList />,
  },
  {
    path: urls.zalo_marketting,
    component: <ZaloMarketting />,
  },
  {
    path: urls.setting_rose,
    component: <SettingRoseList />,
  },
  {
    path: urls.setting_channels,
    component: <SettingChannels />,
  },
  {
    path: urls.setting_integrations,
    component: <SettingIntegrations />,
  },
  {
    path: urls.setting_org,
    component: <SettingOrgList />,
  },
  {
    path: urls.setting_basis,
    component: <SettingBasisList />,
  },
  {
    path: urls.setting_payment_method,
    // component: <SettingPaymentMethod />,
    component: <PaymentMethodPage />,
  },
  {
    path: urls.setting_timekeeping,
    component: <SettingTimekeepingList />,
  },
  {
    path: urls.setting_customer,
    component: <SettingCustomerList />,
  },
  {
    path: urls.setting_contact,
    component: <SettingContactList />,
  },
  {
    path: urls.loyalty_point_ledger,
    component: <LoyaltyPointLedger />,
  },
  {
    path: urls.setting_loyalty,
    component: <SettingLoyalty />,
  },
  {
    path: urls.member_list,
    component: <MemberCustomersPage />,
  },
  {
    path: urls.marketing_campaign,
    component: <MarketingCampaignPage />,
  },
  {
    path: urls.loyalty_wallet,
    component: <LoyaltyWallet />,
  },
  {
    path: urls.setting_sell,
    component: <SettingSellList />,
  },
  {
    path: urls.setting_cash_book,
    component: <SettingCashBookList />,
  },
  {
    path: urls.setting_market_research,
    component: <SettingMarketResearchList />,
  },
  {
    path: urls.viettel_integration,
    component: <ViettelIntegration />,
  },
  {
    path: urls.setting_marketing,
    component: <SettingMarketingList />,
  },
  {
    path: urls.setting_project,
    component: <SettingProjectList />,
  },
  {
    path: urls.config_bpm,
    component: <ConfigBPM />,
  },
  {
    path: urls.setting_dashboard,
    component: <SettingDashboard />,
  },
  {
    path: urls.dashboard_loyalty,
    component: <DashboardLoyalty />,
  },
  {
    path: urls.dashboard_shipping,
    component: <ShippingReport />,
  },
  {
    path: urls.project,
    component: <ProjectList />,
  },
  {
    path: urls.middle_work,
    component: <MiddleWorkList />,
  },
  {
    path: urls.setting_report,
    component: <SettingReportList />,
  },
  {
    path: urls.integrated_monitoring,
    component: <IntegratedMonitoring />,
  },
  {
    path: urls.setting_code,
    component: <SettingCode />,
  },
  {
    path: urls.public_connect_zalo,
    component: <PublicConnectZalo />,
  },
  {
    path: urls.resource_management,
    component: <ResourceManagementList />,
  },
  // Quản lý đơn đặt hàng
  {
    path: urls.manager_order,
    component: <ManageOrder />,
  },
  // Tạo đơn đặt hàng
  {
    path: urls.order,
    component: <CreateOrder />,
  },
  // Danh sách hóa đơn đặt hàng
  {
    path: urls.order_invoice_list,
    component: <OrderInvoiceList />,
  },
  // Danh sách đơn đặt hàng lưu tạm
  {
    path: urls.temporary_order_list,
    component: <TemporaryOrderList />,
  },
  // // tạo phiếu nhập hàng
  // {
  //   path: urls.create_invoice_add,
  //   component: <CreateReceipt />,
  // },
  // danh sách hóa đơn nhập hàng
  {
    path: urls.invoice_order,
    component: <ImportInvoiceList />,
  },
  // sản phẩm đã bán
  {
    path: urls.products_sold,
    component: <ProductSoldList />,
  },
  // sản phẩm tồn kho
  {
    path: urls.product_inventory,
    component: <ProductInventoryList />,
  },
  // danh sách kho hàng — gọi API /inventory/warehouse/list
  {
    path: urls.warehouse,
    component: <WarehouseListPage />,
  },

  // sổ kho chi tiết (mock) — /inventory-detail/:id
  {
    path: urls.inventory,
    component: <InventoryList />,
  },
  // tạo phiếu nhập kho
  {
    path: urls.create_inventory,
    component: <CreateReceipt />,
  },
  // {
  //   path: urls.inventory_detail,
  //   component: <InventoryList />,
  // },
  {
    path: urls.inventory_checking,
    component: <InventoryManagement />,
  },
  //báo cáo kho
  {
    path: urls.report_warehouse,
    component: <WarehouseReport />,
  },

  // tạo đơn bán hàng
  {
    path: urls.create_sale_add,
    // component: <CreateOrderSales />,
    component: <CounterSales />,
  },
  // Danh sách yêu cầu mua hàng
  {
    path: urls.order_tracking,
    component: <OrderTracking />,
  },
  {
    path: urls.promotional_program,
    // component: <PromotionalProgram />,
    component: <PromotionPage />,
  },
  {
    path: urls.promotional_report,
    component: <PromotionalReport />,
  },
  {
    path: urls.order_request_list,
    component: <OrderRequestList />,
  },

  // danh sách hóa đơn bán hàng
  {
    path: urls.sale_invoice,
    component: <SaleInvoiceList />,
  },

  // danh sách quản lý vận chuyển
  {
    path: urls.shipping,
    component: <ShippingList />,
  },
  // danh sách quản lý đơn vị vận chuyển
  {
    path: urls.shipping_parther,
    component: <ShippingPartnerSetup />,
  },
  // thêm mới vận chuyển
  {
    path: urls.add_shipping,
    component: <AddShippingOrder />,
  },
  // quản lý phí vận chuyển
  {
    path: urls.shipping_fee_config,
    component: <ShippingFeeConfig />,
  },
  // danh sách khách trả hàng
  {
    path: urls.return_invoice,
    component: <ReturnProductPage />,
  },
  // bán hàng đa kênh
  {
    path: urls.multi_channel_sales,
    component: <MultiChannelSales />,
  },
  // lịch
  {
    path: urls.calendar_common,
    component: <CalendarCommon />,
  },
  // Tổng đài
  {
    path: urls.call_center,
    component: <CallCenterList />,
  },
  //chăm sóc khách hàng
  {
    path: urls.customer_care_page,
    component: <CustomerCarePage />,
  },
  //phân tích khách hàng
  {
    path: urls.customer_analysis,
    component: <CustomerAnalysisPage />,
  },
  //email
  {
    path: urls.email,
    component: <EmailList />,
  },
  // Kênh facebook
  {
    path: urls.social_facebook_crm,
    component: <SocialCrmFacebook />,
  },

  // Kênh zalo
  {
    path: urls.social_zalo_crm,
    component: <SocialCrmZalo />,
  },
  // phiếu điều chỉnh kho
  {
    path: urls.adjustment_slip,
    component: <AdjustmentSlip />,
  },
  {
    path: urls.destroy_slip,
    component: <DestroySlip />,
  },
  // quản lý vật tư
  {
    path: urls.material,
    component: <MaterialMenuPage />,
  },
  // thông tin cá nhân
  {
    path: urls.setting_account,
    component: <SettingAccountLanding />,
  },
  // Cài đặt ứng dụng
  {
    path: urls.install_app,
    component: <SettingIntegration />,
  },
  {
    path: urls.marketing_automation,
    component: <MarketingAutomationList />,
  },
  {
    path: urls.detail_marketing_automation,
    component: <DetailMarketingAutomation />,
  },
  {
    path: urls.create_marketing_automation,
    component: <CreateMarketingAutomation />,
  },
  {
    path: urls.edit_marketing_automation,
    component: <CreateMarketingAutomation />,
  },
  {
    path: urls.marketing_automation_setting,
    component: <MarketingAutomation />,
  },
  {
    path: urls.customer_segment,
    component: <CustomerSegment />,
  },
  {
    path: urls.feedback_customer,
    component: <FeedbackCustomer />,
  },
  // khảo sát khách hàng
  {
    path: urls.customer_survey,
    component: <CustomerSurvey />,
  },
  // đường link khảo sát khách hàng
  {
    path: urls.link_survey,
    component: <LinkSurvey />,
  },
  {
    path: urls.setting_process,
    component: <SettingProcess />,
  },
  {
    path: urls.inventory_transfer_document,
    component: <TransferOrderForm />,
  },
  {
    path: urls.report_login,
    component: <ReportLogin />,
  },
  {
    path: urls.manage_processes,
    component: <BusinessProcessList />,
  },
  {
    path: urls.manage_default_processes,
    component: <ManageDefaultProcesses />,
  },
  {
    path: urls.business_rule,
    component: <BusinessRule />,
  },
  {
    path: urls.business_rule_config,
    component: <BusinessRuleConfig />,
  },
  {
    path: urls.process_simulation,
    component: <ProcessSimulation />,
  },
  {
    path: urls.object_manage,
    // component: <ProcessedObjectList />,
    component: <TaskProcessPage />
  },
  {
    path: urls.setting_business_process,
    component: <SettingBusinessProcess />,
  },
  {
    path: urls.bpm_create,
    component: <BusinessProcessCreate />,
  },
  {
    path: urls.user_task_list,
    component: <UserTaskList />,
  },

  {
    path: urls.upload_document,
    component: <UploadDocument />,
  },
  {
    path: urls.user,
    component: <UserList />,
  },
  {
    path: urls.organization,
    component: <OrganizationList />,
  },
  {
    path: urls.package_manage,
    component: <Package />,
  },
  {
    path: urls.extension_list,
    component: <ExtensionList />,
  },
  {
    path: urls.field_management,
    component: <FieldMannagement />,
  },
  {
    path: urls.shift_config,
    component: <ShiftConfigTabs />,
  },
  {
    path: urls.shift_management,
    component: <ShiftTabsPage />,
  },
  {
    path: urls.payment_mgt,
    component: <PaymentMethodList />,
  },
  {
    path: urls.payment_control,
    component: <Reconcile />,
  },
];