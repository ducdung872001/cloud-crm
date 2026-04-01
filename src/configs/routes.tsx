import React, { Fragment } from "react";
import Icon from "components/icon";
import DashboardOriginal from "pages/Dashboard/index";
const Dashboard = DashboardTNPM; // TNPM: override with BĐS dashboard
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./urls";

// ─── TNPM Page Imports ────────────────────────────────────────────────────
import PropertyUnitList from "pages/PropertyUnit/PropertyUnitList";
import ServiceContractList from "pages/ServiceContract/ServiceContractList";
import DashboardTNPM from "pages/DashboardTNPM/DashboardTNPM";
import PropertyProjectList from "pages/PropertyProject/PropertyProjectList";
import LeaseContractList from "pages/LeaseContract/LeaseContractList";
import BillingEngineList from "pages/BillingEngine/BillingEngineList";
import TurnoverRentList from "pages/TurnoverRent/TurnoverRentList";
import VendorManagementList from "pages/VendorManagement/VendorManagementList";
import VendorInvoiceList from "pages/VendorInvoice/VendorInvoiceList";
import ServiceRequestList from "pages/ServiceRequest/ServiceRequestList";
import MaintenancePlanList from "pages/MaintenancePlan/MaintenancePlanList";
import ReportTNPM from "pages/ReportTNPM/ReportTNPM";
// ─────────────────────────────────────────────────────────────────────────────

import CustomerPersonList from "pages/CustomerPerson/CustomerPersonList";
import ContactList from "pages/Contact/ContactList";
import ScheduleNextList from "pages/Schedule/ScheduleNextList";
// REMOVED: import TreatmentScheduleList from "pages/TreatmentSchedule/TreatmentScheduleList";
import TimeKeepingList from "pages/Timekeeping/TimekeepingList";
// TNPM_REMOVED: import CashBookList from "pages/CashBook/CashBookList";
import PaymentHistoryList from "pages/PaymentHistory/PaymentHistoryList";
import CrmCampaignList from "pages/CrmCampaign/CrmCampaignList";
import SettingList from "pages/Setting/SettingList";
import ReportCommon from "pages/ReportCommon/ReportCommon";
import InternalMailList from "pages/InternalMail/InternalMailList";
import DetailPersonList from "pages/CustomerPerson/partials/DetailPerson/DetailPersonList";
import WarrantyList from "pages/Warranty/WarrantyList";
import WarrantyListProcess from "pages/Warranty/WarrantyListProcess";
import CollectWarranty from "pages/Warranty/partials/CollectWarranty";
import TicketList from "pages/Ticket/TicketList";
import TicketListProcess from "pages/Ticket/TicketListProcess";
import CollectTicket from "pages/Ticket/partials/CollectTicket";
import SettingTicketList from "pages/SettingTicket/SettingTicketList";
import SettingWarrantyList from "pages/SettingWarranty/SettingWarrantyList";
import DetailWarranty from "pages/Warranty/partials/DetailWarranty/DetailWarranty";
import DetailTicket from "pages/Ticket/partials/DetailTicket/DetailTicket";
import SettingSMSList from "pages/SettingSMS/SettingSMSList";
import SettingCallList from "pages/SettingCall/SettingCallList";
import SettingEmailList from "pages/SettingEmail/SettingEmailList";
// REMOVED: import ZaloMarketting from "pages/ZaloMarketting/ZaloMarketting";
// REMOVED: import SMSMarkettingList from "pages/SMSMarketting/SMSMarkettingList";
// REMOVED: import EmailMarkettingList from "pages/EmailMarketting/EmailMarkettingList";
// REMOVED: import SettingRoseList from "pages/SettingRose/SettingRoseList";
import SettingBasisList from "pages/SettingBasis/SettingBasisList";
import SettingOrgList from "pages/SettingOrg/SettingOrgList";
import SettingAccountLanding from "pages/SettingAccountLanding/SettingAccountLanding";
import SettingChannels from "pages/SettingChannels/SettingChannels";
import SettingIntegrations from "pages/SettingIntegrations/SettingIntegrations";
// REMOVED: import SettingTimekeepingList from "pages/SettingTimekeeping/SettingTimekeepingList";
import SettingCustomerList from "pages/SettingCustomer/SettingCustomerList";
import SettingSellList from "pages/SettingSell/SettingSellList";
// REMOVED: import SettingCashBookList from "pages/SettingCashBook/SettingCashBookList";
import SettingMarketResearchList from "pages/SettingMarketResearch/SettingMarketResearchList";
import SettingMarketingList from "pages/SettingMarketing/SettingMarketingList";
import SettingWorkTypeList from "pages/SettingWork/SettingWorkTypeList";
import SetttingSocialCrmList from "pages/SetttingSocialCrm/SetttingSocialCrmList";
import SettingReportList from "pages/SettingReport/SettingReportList";
import MiddleWorkList from "pages/MiddleWork/MiddleWorkList";
import ResourceManagementList from "pages/ResourceManagement/ResourceManagementList";
import PublicConnectZalo from "pages/Public/PublicConnectZalo";
// Kho hàng
import ImportInvoiceList from "pages/ProductImport/ImportInvoiceList/ImportInvoiceList";
import ProductSoldList from "pages/ProductImport/ProductSoldList/ProductSoldList";
import ProductInventoryList from "pages/ProductImport/ProductInventoryList/ProductInventoryList";
import InventoryList from "pages/ProductImport/Inventory/InventoryList";
import WarehouseListPage from "pages/ProductImport/WarehouseList/WarehouseListPage";
import CreateReceipt from "pages/ProductImport/CreateReceipt/CreateReceipt";
// Quản lý tài chính
// TNPM_REMOVED: import FinanceManagement from "pages/Finance";
// REMOVED: import FinanceDashboard from "pages/Finance/Dashboard";
// REMOVED: import FinanceCashBook from "pages/Finance/CashBook";
// REMOVED: import FinanceCashBookTemplate from "pages/Finance/CashBookTemplate";
// REMOVED: import FinanceFundManagement from "pages/Finance/FundManagement";
// REMOVED: import FinanceDebtManagement from "pages/Finance/DebtManagement";
// REMOVED: import FinanceDebtTransaction from "pages/Finance/DebtTransaction";
// REMOVED: import FinanceShiftInventory from "pages/Finance/ShiftInventory";
// Bán hàng
import CreateOrderSales from "pages/Sell/CreateOrderSales/CreateOrderSales";
import SaleInvoiceList from "pages/Sell/SaleInvoiceList/SaleInvoiceList";
import CustomerPayList from "pages/Sell/CustomerPayList/CustomerPayList";
// Lịch
import CalendarCommon from "pages/CalendarCommon/CalendarCommon";
// Chăm sóc khách hàng
import CallCenterList from "pages/CallCenter/CallCenterList";
// Kênh bán facebook
// REMOVED: import SocialCrmFacebook from "pages/SocialCrmFacebook/SocialCrmFacebook";
// Kênh bán Zalo
// REMOVED: import SocialCrmZalo from "pages/SocialCrmZalo/SocialCrmZalo";
// Phiếu điều chỉnh kho
// REMOVED: import AdjustmentSlip from "pages/AdjustmentSlip/AdjustmentSlip";
// REMOVED: import DestroySlip from "pages/DestroySlip";
// Thông tin tài khoản cá nhân
import SettingAccount from "pages/SettingAccount/SettingAccount";
import ReportCustomer from "pages/ReportCustomer/ReportCustomer";
import ReportCustomerModern from "pages/ReportCustomerModern/ReportCustomerModern";
// Cài đặt ứng dụng
import InstallApplication from "pages/InstallApplication/InstallApplication";
import MarketingAutomation from "pages/MarketingAutomation/MarketingAutomation";
import SettingZalo from "pages/SettingZalo/SettingZalo";
import CreateCampaign from "pages/Campaign/partials/CreateCampaign/CreateCampaign";
import CustomerSegment from "pages/customerSegment";
import MarketingAutomationList from "pages/MarketingAutomation/MarketingAutomationList";
import CreateMarketingAutomation from "pages/MarketingAutomation/CreateMarketingAutomation/CreateMarketingAutomation";
// import EmailList from "pages/Email/EmailList";
import EmailList from "pages/Email/EmailListBackup";
import SettingContactList from "pages/SettingContact/SettingContactList";
import FeedbackCustomer from "pages/FeedbackCustomer/FeedbackCustomer";
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";
// REMOVED: import ViettelIntegration from "@/pages/ViettelIntegration/ViettelIntegration";
// Khảo sát khách hàng
// REMOVED: import CustomerSurvey from "pages/CustomerSurvey";
// REMOVED: import LoyaltyPointLedger from "pages/LoyaltyPointLedger";
// REMOVED: import LoyaltyReward from "pages/LoyaltyReward";
// REMOVED: import LoyaltySegment from "pages/LoyaltySegment";
// REMOVED: import LoyaltyWallet from "pages/LoyaltyWallet";
// tạo đường link khảo sát
import LinkSurvey from "pages/LinkSurvey";
import SettingProcess from "pages/SettingProcess/SettingProcess";
import SaleFlowList from "pages/SaleFlow/SaleFlowList";
import CreateSaleflow from "pages/SaleFlow/CreateSaleFlow/CreateSaleFlow";
import ManagementSale from "pages/ManagementSale/ManagementSale";
import NotificationList from "@/pages/NotificationList/NotificationList";
// Phiếu điền chuyển kho
import TransferOrderForm from "pages/TransferOrderForm";
import DetailMarketingAutomation from "pages/MarketingAutomation/DetailMarketingAutomation";
import ManageDataSharing from "pages/ManageDataSharing/ManageDataSharing";
import SettingPartnerList from "pages/SettingPartner/SettingPartnerList";
import SupplierPage from "pages/SupplierPage/SupplierPage";
import PartnerList from "pages/PartnerList/PartnerList";
import ReportLogin from "pages/ReportLogin/ReportLogin";
import BusinessProcessList from "pages/BPM/BusinessProcessList/BusinessProcessList";
import SettingBusinessProcess from "pages/BPM/SettingBusinessProcess/SettingBusinessProcess";
import ConfigBPM from "pages/ConfigBPM";
import ProcessedObjectList from "pages/SettingProcess/partials/ProcessedObjectList";
import CreateOrder from "pages/Order/createOrder";
import OrderInvoiceList from "pages/Order/orderInvoiceList";
import TemporaryOrderList from "pages/Order/temporaryOrderList";
import ManageOrder from "pages/ManagerOrder";
import SettingProjectList from "pages/SettingProject/SettingProjectList";
import ProjectList from "pages/ProjectList/ProjectList";
import IntegratedMonitoring from "pages/IntegratedMonitoring/IntegratedMonitoring";
// REMOVED: import SettingCode from "pages/SettingCode/SettingCode";
import SettingIntegration from "pages/SettingIntegration/SettingIntegration";
import SettingDashboard from "pages/SettingDashboard/SettingDashboard";
import DetailProjectCRM from "pages/ProjectList/DetailProject/DetailProject";
import SettingPromotionList from "pages/SettingPromotion/SettingPromotionList";
import DetailPartner from "pages/PartnerList/DetailPartner/DetailPartner";
// REMOVED: import CxmSurveyList from "pages/CxmSurvey/CxmSurveyList/CxmSurveyList";
import ProcessSimulation from "pages/ProcessSimulation/ProcessSimulation";
import BusinessProcessCreate from "pages/BPM/BusinessProcessCreate";
import CampaignListParent from "pages/Campaign/CampaignListParent";
import UserTaskList from "pages/UserTaskList";
import UploadDocument from "pages/BPM/UploadDocument/UploadDocument";
import OrderRequestList from "pages/OrderRequestList";
// REMOVED: import MaterialList from "@/pages/ManagementMaterial/MaterialList";
// REMOVED: import MaterialMenuPage from "@/pages/ManagementMaterial/MaterialMenuPage";
import { useCookies } from "react-cookie";
import OrderTracking from "pages/OrderTracking";
import OrganizationList from "pages/Organization/OrganizationList";
import Package from "pages/Package";
import ExtensionList from "pages/Extension/ExtensionList";
import UserList from "pages/User/UserList";
import FieldMannagement from "pages/FieldManagement/FieldManagement";
import ManageDefaultProcesses from "pages/ManageDefaultProcesses";
import ManagerWork from "pages/ManagerWork";
// TNPM_REMOVED: import Fanpage from "pages/Fanpage";
// TNPM_REMOVED: import TotalChat from "pages/Fanpage/TotalChat";
import BusinessRule from "pages/BusinessRule";
import BusinessRuleConfig from "pages/BusinessRuleConfig";
// REMOVED: import MultiChannelSales from "@/pages/MultiChannelSales/MultiChannelSales";
// REMOVED: import DashboardRetail from "pages/DashboardRetail";
// REMOVED: import DashboardLoyalty from "@/pages/DashboardLoyalty";
// REMOVED: import SettingPaymentMethod from "@/pages/SettingPaymentMethod";
// REMOVED: import PromotionalProgram from "@/pages/PromotionalProgram";
// REMOVED: import PromotionalReport from "@/pages/PromotionalReport";
// REMOVED: import SettingLoyalty from "pages/SettingLoyalty/SettingLoyalty";
// TNPM_REMOVED: import InvoiceVATOverview from "@/pages/Sell/InvoiceVAT/index";
// REMOVED: import ShippingList from "@/pages/ShipingManagement/ShippingList";
// REMOVED: import ShippingFeeConfig from "@/pages/ShipingManagement/ShippingFeeConfig/ShippingFeeConfig";
// REMOVED: import AddShippingOrder from "@/pages/ShipingManagement/AddShippingOrder/AddShippingOrder";
// REMOVED: import ShippingPartnerSetup from "@/pages/ShipingManagement/ShippingPartnerSetup/ShippingPartnerSetup";
// REMOVED: import ShippingReport from "@/pages/ShipingManagement/ShippingReport/ShippingReport";
import CustomerAndSupplier from "@/pages/CustomerAndSupplier";
// TNPM_REMOVED: import InventoryManagement from "@/pages/ProductImport/InventoryChecking";
// REMOVED: import CounterSales from "@/pages/CounterSales";
// REMOVED: import ShiftTabsPage from "@/pages/ShiftManagement/ShiftTabsPage";
// REMOVED: import ShiftConfigTabs from "@/pages/ShiftConfig/ShiftConfig";
// REMOVED: import WarehouseReport from "@/pages/WarehouseReport/WarehouseReport";
// REMOVED: import MarketingReportPage from "@/pages/MarketingReportPage/MarketingReportPage";
// REMOVED: import InventoryReportModern from "pages/InventoryReportModern/InventoryReportModern";
// REMOVED: import PromotionPage from "@/pages/PromotionPage/PromotionPage";
// REMOVED: import MemberCustomersPage from "@/pages/MemberCustomersPage/MemberCustomersPage";
// REMOVED: import CustomerCarePage from "@/pages/CustomerCarePage/CustomerCarePage";
// REMOVED: import MarketingCampaignPage from "@/pages/MarketingCampaignPage/MarketingCampaignPage";
// REMOVED: import CustomerAnalysisPage from "@/pages/CustomerAnalysisPage/CustomerAnalysisPage";
// REMOVED: import PaymentMethodList from "@/pages/PaymentMethod/PaymentMethod";
// REMOVED: import PaymentMethodPage from "@/pages/PaymentMethodPage/PaymentMethodPage";
// REMOVED: import FinanceContent from "@/pages/PaymentReconciliation";
// REMOVED: import ReturnProductPage from "@/pages/ReturnProduct";
// REMOVED: import Reconcile from "@/pages/Reconcile";
import TaskProcessPage from "@/pages/TaskProcessPage/TaskProcessPage";
// REMOVED: import FinanceCategoryManagement from "pages/Finance/CategoryManagement";

const sourceDomain = getDomain(decodeURIComponent(document.location.href));

export const menu: IMenuItem[] = [
  // ── 1. DASHBOARD ──────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: <Icon name="DashboardMenu" />,
    code: "DASHBOARD",
  },

  // ── 2. DANH MỤC BĐS ──────────────────────────────────────────────────────
  {
    title: "Danh mục BĐS",
    icon: <Icon name="CustomerMenu" />,
    code: "PROPERTY",
    children: [
      {
        title: "Dự án",
        path: "/projects",
        icon: <Icon name="CustomerMenu" />,
        code: "PROJECT_LIST",
      },
      {
        title: "Quản lý Unit",
        path: "/units",
        icon: <Icon name="CustomerMenu" />,
        code: "UNIT_LIST",
      },
    ],
  },

  // ── 3. KHÁCH HÀNG / TENANT ───────────────────────────────────────────────
  {
    title: "Khách hàng / Tenant",
    path: "/customer_person",
    icon: <Icon name="CustomersMenu" />,
    code: "CUSTOMER",
  },

  // ── 4. HỢP ĐỒNG ──────────────────────────────────────────────────────────
  {
    title: "Hợp đồng",
    icon: <Icon name="ContractMenu" />,
    code: "CONTRACT",
    children: [
      {
        title: "Hợp đồng thuê",
        path: "/lease-contracts",
        icon: <Icon name="ContractMenu" />,
        code: "LEASE_CONTRACT",
      },
      {
        title: "Hợp đồng DV",
        path: "/service-contracts",
        icon: <Icon name="ContractMenu" />,
        code: "SERVICE_CONTRACT",
      },
    ],
  },

  // ── 5. BILLING & TÀI CHÍNH ───────────────────────────────────────────────
  {
    title: "Billing & Tài chính",
    icon: <Icon name="FinanceMenu" />,
    code: "BILLING",
    children: [
      {
        title: "Hóa đơn",
        path: "/billing",
        icon: <Icon name="InvoiceMenu" />,
        code: "BILLING_LIST",
      },
      {
        title: "Turnover Rent",
        path: "/turnover-rent",
        icon: <Icon name="RevenueMenu" />,
        code: "TURNOVER_RENT",
      },
      {
        title: "Lịch sử thanh toán",
        path: "/payment_history",
        icon: <Icon name="CashbookMenu" />,
        code: "PAYMENT_HISTORY",
      },
    ],
  },

  // ── 6. NHÀ CUNG CẤP ──────────────────────────────────────────────────────
  {
    title: "Nhà cung cấp",
    icon: <Icon name="PartnerMenu" />,
    code: "VENDOR",
    children: [
      {
        title: "Danh sách NCC",
        path: "/vendors",
        icon: <Icon name="PartnerMenu" />,
        code: "VENDOR_LIST",
      },
      {
        title: "HĐ Nhà cung cấp",
        path: "/vendor-contracts",
        icon: <Icon name="ContractMenu" />,
        code: "VENDOR_CONTRACT",
      },
      {
        title: "Hóa đơn NCC",
        path: "/vendor-invoices",
        icon: <Icon name="InvoiceMenu" />,
        code: "VENDOR_INVOICE",
      },
    ],
  },

  // ── 7. VẬN HÀNH & KỸ THUẬT ───────────────────────────────────────────────
  {
    title: "Vận hành & Kỹ thuật",
    icon: <Icon name="TicketMenu" />,
    code: "OPERATIONS",
    children: [
      {
        title: "Yêu cầu Dịch vụ",
        path: "/service-requests",
        icon: <Icon name="TicketMenu" />,
        code: "SERVICE_REQUEST",
      },
      {
        title: "Kế hoạch Bảo trì",
        path: "/maintenance-plans",
        icon: <Icon name="CalendarMenu" />,
        code: "MAINTENANCE_PLAN",
      },
    ],
  },

  // ── 8. PHIẾU HỖ TRỢ ─────────────────────────────────────────────────────
  {
    title: "Phiếu hỗ trợ",
    path: "/ticket",
    icon: <Icon name="TicketMenu" />,
    code: "TICKET",
  },

  // ── 9. CÔNG VIỆC NỘI BỘ ──────────────────────────────────────────────────
  {
    title: "Công việc nội bộ",
    path: "/middle_work",
    icon: <Icon name="TaskMenu" />,
    code: "TASKS",
  },

  // ── 10. BÁO CÁO ──────────────────────────────────────────────────────────
  {
    title: "Báo cáo",
    path: "/reports",
    icon: <Icon name="ReportMenu" />,
    code: "REPORTS",
  },

  // ── 11. CÀI ĐẶT ──────────────────────────────────────────────────────────
  {
    title: "Cài đặt",
    path: "/setting",
    icon: <Icon name="SettingMenu" />,
    code: "SETTINGS",
  },
];


export const routes: IRouter[] = [
  // ─── Core ─────────────────────────────────────────────────────────────────
  { path: "/dashboard", component: <Dashboard /> },
  { path: "/", component: <Dashboard /> },

  // ─── Khách hàng ──────────────────────────────────────────────────────────
  { path: "/customer_person", component: <CustomerPersonList /> },
  { path: "/customer_person/:id", component: <DetailPersonList /> },

  // ─── TNPM: Dự án & Unit ─────────────────────────────────────────────────
  { path: "/projects", component: <PropertyProjectList /> },
  { path: "/units", component: <PropertyUnitList /> },

  // ─── TNPM: Hợp đồng ─────────────────────────────────────────────────────
  { path: "/lease-contracts", component: <LeaseContractList /> },
  { path: "/service-contracts", component: <ServiceContractList /> },

  // ─── TNPM: Billing ──────────────────────────────────────────────────────
  { path: "/billing", component: <BillingEngineList /> },
  { path: "/turnover-rent", component: <TurnoverRentList /> },

  // ─── TNPM: Vendor ───────────────────────────────────────────────────────
  { path: "/vendors", component: <VendorManagementList /> },
  { path: "/vendor-contracts", component: <VendorManagementList /> },
  { path: "/vendor-invoices", component: <VendorInvoiceList /> },

  // ─── TNPM: Vận hành ─────────────────────────────────────────────────────
  { path: "/service-requests", component: <ServiceRequestList /> },
  { path: "/maintenance-plans", component: <MaintenancePlanList /> },

  // ─── TNPM: Báo cáo ──────────────────────────────────────────────────────
  { path: "/reports", component: <ReportTNPM /> },

  // ─── Ticket & Support ────────────────────────────────────────────────────
  { path: "/ticket", component: <TicketList /> },
  { path: "/ticket/:id", component: <DetailTicket /> },
  { path: "/warranty", component: <WarrantyList /> },

  // ─── Công việc nội bộ ────────────────────────────────────────────────────
  { path: "/middle_work", component: <MiddleWorkList /> },
  { path: "/manager_work", component: <ManagerWork /> },
  { path: "/user_task_list", component: <UserTaskList /> },

  // ─── Lịch & Thông báo ────────────────────────────────────────────────────
  { path: "/schedule", component: <ScheduleNextList /> },
  { path: "/notification", component: <NotificationList /> },
  { path: "/payment_history", component: <PaymentHistoryList /> },

  // ─── CRM & Marketing ─────────────────────────────────────────────────────
  { path: "/crm_campaign", component: <CrmCampaignList /> },
  { path: "/contact", component: <ContactList /> },
  { path: "/partner", component: <PartnerList /> },
  { path: "/partner/:id", component: <DetailPartner /> },

  // ─── BPM ─────────────────────────────────────────────────────────────────
  { path: "/bpm", component: <BusinessProcessList /> },
  { path: "/bpm_create", component: <BusinessProcessCreate /> },
  { path: "/setting_process", component: <SettingProcess /> },

  // ─── Cài đặt ─────────────────────────────────────────────────────────────
  { path: "/setting", component: <SettingList /> },
  { path: "/setting_basis", component: <SettingBasisList /> },
  { path: "/setting_customer", component: <SettingCustomerList /> },
  { path: "/setting_ticket", component: <SettingTicketList /> },
  { path: "/setting_warranty", component: <SettingWarrantyList /> },
  { path: "/setting_sms", component: <SettingSMSList /> },
  { path: "/setting_call", component: <SettingCallList /> },
  { path: "/setting_email", component: <SettingEmailList /> },
  { path: "/setting_zalo", component: <SettingZalo /> },
  { path: "/setting_org", component: <SettingOrgList /> },
  { path: "/setting_marketing", component: <SettingMarketingList /> },
  { path: "/setting_work", component: <SettingWorkTypeList /> },
  { path: "/setting_project", component: <SettingProjectList /> },
  { path: "/setting_report", component: <SettingReportList /> },
  { path: "/setting_dashboard", component: <SettingDashboard /> },
  { path: "/setting_integration", component: <SettingIntegration /> },
  { path: "/setting_account", component: <SettingAccount /> },
  { path: "/setting_account_landing", component: <SettingAccountLanding /> },
  { path: "/setting_contact", component: <SettingContactList /> },
  { path: "/setting_partner", component: <SettingPartnerList /> },
  { path: "/resource_management", component: <ResourceManagementList /> },
  { path: "/project_list", component: <ProjectList /> },
  { path: "/project_list/:id", component: <DetailProjectCRM /> },
  { path: "/internal_mail", component: <InternalMailList /> },
  { path: "/report_common", component: <ReportCommon /> },
  { path: "/report_customer", component: <ReportCustomer /> },
  { path: "/report_login", component: <ReportLogin /> },
  { path: "/manage_data_sharing", component: <ManageDataSharing /> },
  { path: "/organization", component: <OrganizationList /> },
  { path: "/package", component: <Package /> },
  { path: "/extension", component: <ExtensionList /> },
  { path: "/user_list", component: <UserList /> },
  { path: "/field_management", component: <FieldMannagement /> },
  { path: "/manage_default_processes", component: <ManageDefaultProcesses /> },
  { path: "/business_rule", component: <BusinessRule /> },
  { path: "/business_rule_config/:id", component: <BusinessRuleConfig /> },
  { path: "/customer_segment", component: <CustomerSegment /> },
];
