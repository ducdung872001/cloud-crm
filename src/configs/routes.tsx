import React, { Fragment } from "react";
import Icon from "components/icon";
import Dashboard from "pages/Dashboard/index";
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./urls";

import CustomerPersonList from "pages/CustomerPerson/CustomerPersonList";
import ContactList from "pages/Contact/ContactList";
import ScheduleNextList from "pages/Schedule/ScheduleNextList";
import TreatmentScheduleList from "pages/TreatmentSchedule/TreatmentScheduleList";
import TimeKeepingList from "pages/Timekeeping/TimekeepingList";
import CashBookList from "pages/CashBook/CashBookList";
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
import ZaloMarketting from "pages/ZaloMarketting/ZaloMarketting";
import SMSMarkettingList from "pages/SMSMarketting/SMSMarkettingList";
import EmailMarkettingList from "pages/EmailMarketting/EmailMarkettingList";
import SettingRoseList from "pages/SettingRose/SettingRoseList";
import SettingBasisList from "pages/SettingBasis/SettingBasisList";
import SettingTimekeepingList from "pages/SettingTimekeeping/SettingTimekeepingList";
import SettingCustomerList from "pages/SettingCustomer/SettingCustomerList";
import SettingSellList from "pages/SettingSell/SettingSellList";
import SettingCashBookList from "pages/SettingCashBook/SettingCashBookList";
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
import CreateReceipt from "pages/ProductImport/CreateReceipt/CreateReceipt";
// Quản lý tài chính
import FinanceManagement from "pages/Finance";
import FinanceDashboard from "pages/Finance/Dashboard";
import FinanceCashBook from "pages/Finance/CashBook";
import FinanceCashBookTemplate from "pages/Finance/CashBookTemplate";
import FinanceFundManagement from "pages/Finance/FundManagement";
import FinanceDebtManagement from "pages/Finance/DebtManagement";
import FinanceDebtTransaction from "pages/Finance/DebtTransaction";
import FinanceShiftInventory from "pages/Finance/ShiftInventory";
// Bán hàng
import CreateOrderSales from "pages/Sell/CreateOrderSales/CreateOrderSales";
import SaleInvoiceList from "pages/Sell/SaleInvoiceList/SaleInvoiceList";
import CustomerPayList from "pages/Sell/CustomerPayList/CustomerPayList";
// Lịch
import CalendarCommon from "pages/CalendarCommon/CalendarCommon";
// Chăm sóc khách hàng
import CallCenterList from "pages/CallCenter/CallCenterList";
// Kênh bán facebook
import SocialCrmFacebook from "pages/SocialCrmFacebook/SocialCrmFacebook";
// Kênh bán Zalo
import SocialCrmZalo from "pages/SocialCrmZalo/SocialCrmZalo";
// Phiếu điều chỉnh kho
import AdjustmentSlip from "pages/AdjustmentSlip/AdjustmentSlip";
// Thông tin tài khoản cá nhân
import SettingAccount from "pages/SettingAccount/SettingAccount";
import ReportCustomer from "pages/ReportCustomer/ReportCustomer";
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
import ViettelIntegration from "@/pages/ViettelIntegration/ViettelIntegration";
// Khảo sát khách hàng
import CustomerSurvey from "pages/CustomerSurvey";
import LoyaltyPointLedger from "pages/LoyaltyPointLedger";
import LoyaltyReward from "pages/LoyaltyReward";
import LoyaltySegment from "pages/LoyaltySegment";
import LoyaltyWallet from "pages/LoyaltyWallet";
// tạo đường link khảo sát
import LinkSurvey from "pages/LinkSurvey";
import SettingProcess from "pages/SettingProcess/SettingProcess";
import SaleFlowList from "pages/SaleFlow/SaleFlowList";
import CreateSaleflow from "pages/SaleFlow/CreateSaleFlow/CreateSaleFlow";
import ManagementSale from "pages/ManagementSale/ManagementSale";

// Phiếu điền chuyển kho
import TransferOrderForm from "pages/TransferOrderForm";
import DetailMarketingAutomation from "pages/MarketingAutomation/DetailMarketingAutomation";
import ManageDataSharing from "pages/ManageDataSharing/ManageDataSharing";
import SettingPartnerList from "pages/SettingPartner/SettingPartnerList";
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
import SettingCode from "pages/SettingCode/SettingCode";
import SettingIntegration from "pages/SettingIntegration/SettingIntegration";
import SettingDashboard from "pages/SettingDashboard/SettingDashboard";
import DetailProject from "pages/ProjectList/DetailProject/DetailProject";
import SettingPromotionList from "pages/SettingPromotion/SettingPromotionList";
import DetailPartner from "pages/PartnerList/DetailPartner/DetailPartner";
import CxmSurveyList from "pages/CxmSurvey/CxmSurveyList/CxmSurveyList";
import ProcessSimulation from "pages/ProcessSimulation/ProcessSimulation";
import BusinessProcessCreate from "pages/BPM/BusinessProcessCreate";
import CampaignListParent from "pages/Campaign/CampaignListParent";
import UserTaskList from "pages/UserTaskList";
import UploadDocument from "pages/BPM/UploadDocument/UploadDocument";
import OrderRequestList from "pages/OrderRequestList";
import MaterialList from "@/pages/ManagementMaterial/MaterialList";
import { useCookies } from "react-cookie";
import OrderTracking from "pages/OrderTracking";
import OrganizationList from "pages/Organization/OrganizationList";
import Package from "pages/Package";
import ExtensionList from "pages/Extension/ExtensionList";
import UserList from "pages/User/UserList";
import FieldMannagement from "pages/FieldManagement/FieldManagement";
import ManageDefaultProcesses from "pages/ManageDefaultProcesses";
import ManagerWork from "pages/ManagerWork";
import Fanpage from "pages/Fanpage";
import TotalChat from "pages/Fanpage/TotalChat";
import BusinessRule from "pages/BusinessRule";
import BusinessRuleConfig from "pages/BusinessRuleConfig";
import PaymentMethodList from "pages/PaymentMethod/PaymentMethod";
import CheckoutList from "pages/Checkout/Checkout";
import Overview from "pages/ManagementStaff/Overview";
import StaffManagement from "pages/ManagementStaff/ManagementStaff";
import ShiftReport from "pages/ManagementStaff/ShiftReport";
import ShiftConfig from "pages/ManagementStaff/ShiftConfig";
import OpenShift from "pages/ManagementStaff/OpenShift";
import CloseShift from "pages/ManagementStaff/CloseShift";
import MultiChannelSales from "@/pages/MultiChannelSales/MultiChannelSales";
import DashboardRetail from "pages/DashboardRetail";
import DashboardLoyalty from "@/pages/DashboardLoyalty";
import SettingPaymentMethod from "@/pages/SettingPaymentMethod";
import PromotionalProgram from "@/pages/PromotionalProgram";
import PromotionalReport from "@/pages/PromotionalReport";
import SettingLoyalty from "pages/SettingLoyalty/SettingLoyalty";
import InvoiceVATOverview from "@/pages/Sell/InvoiceVAT/index";
import ShippingList from "@/pages/ShipingManagement/ShippingList";
import ShippingFeeConfig from "@/pages/ShipingManagement/ShippingFeeConfig/ShippingFeeConfig";
import AddShippingOrder from "@/pages/ShipingManagement/AddShippingOrder/AddShippingOrder";
import ShippingPartnerSetup from "@/pages/ShipingManagement/ShippingPartnerSetup/ShippingPartnerSetup";
import ShippingReport from "@/pages/ShipingManagement/ShippingReport/ShippingReport";
import CustomerAndSupplier from "@/pages/CustomerAndSupplier";
import InventoryManagement from "@/pages/ProductImport/InventoryChecking";
import CounterSales from "@/pages/CounterSales";

const sourceDomain = getDomain(decodeURIComponent(document.location.href));

export const menu: IMenuItem[] = [
  {
    title: "dashboard", // bảng điều khiển
    path: urls.dashboard,
    icon: <Icon name="Home" />,
    code: "DASHBOARD",
  },
  {
    title: "selling", // Bán hàng & Đơn hàng
    path: urls.sell,
    icon: <Icon name="Sell" />,
    code: "MENU_SELL",
    children: [
      {
        title: "createSalesOrder", // Tạo đơn bán hàng
        path: urls.create_sale_add,
        icon: <Icon name="PlusCircleFill" />,
        code: "CREATE_SALE_ORDER",
      },
      {
        title: "salesInvoice", // Danh sách đơn hàng
        path: urls.sale_invoice,
        icon: <Icon name="Invoice" />,
        code: "SALE_INVOICE",
      },
      {
        title: "returnInvoice", // Khách trả hàng
        path: urls.customer_pay,
        icon: <Icon name="ReturnInvoice" />,
        code: "RETURN_INVOICE",
      },
      {
        title: "multiChannelSales", // Bán hàng đa kênh
        path: urls.multi_channel_sales,
        icon: <Icon name="ReturnInvoice" />,
        code: "",
      },
      {
        title: "shipping", // Giao hàng & Vận chuyển
        path: urls.shipping,
        icon: <Icon name="Invoice" />,
        code: "SALE_INVOICE",
      },
      // {
      //   title: "addShipping", // Tạo đơn vận chuyển
      //   path: urls.add_shipping,
      //   icon: <Icon name="Invoice" />,
      //   code: "SALE_INVOICE",
      // },
      // {
      //   title: "shippingPartner", // Quản lý đơn vị vận chuyển
      //   path: urls.shipping_parther,
      //   icon: <Icon name="Invoice" />,
      //   code: "SALE_INVOICE",
      // },
      // {
      //   title: "shippingFeeConfig", // Quản lý phí vận chuyển
      //   path: urls.shipping_fee_config,
      //   icon: <Icon name="Invoice" />,
      //   code: "SALE_INVOICE",
      // },
      {
        title: "fanpage", // Tương tác & Chốt đơn (Gộp Fanpage & Zalo)
        path: urls.fanpage,
        icon: <Icon name="FacebookFill" />,
        code: "FANPAGE",
      },
      // {
      //   title: "facebook",
      //   path: urls.social_facebook_crm,
      //   icon: <Icon name="FacebookFill" />,
      //   code: "",
      // },
      // {
      //   title: "zalo",
      //   path: urls.social_zalo_crm,
      //   icon: <Icon name="Zalo" />,
      // },
      // {
      //   title: "settingSalesChannel", // Cài đặt kênh bán
      //   path: urls.setting_social_crm,
      //   icon: <Icon name="SettingSocial" />,
      //   code: "MENU_SETUP_SOCIAL_CRM",
      // },
    ],
  },
  {
    title: "warehouse", // Hàng hóa & Kho
    path: urls.product_import,
    icon: <Icon name="ImportGoods" />,
    code: "MENU_INVENTORY", //Tài nguyên cho show kho hàng hay không
    children: [
      {
        title: "settingSales", // Cài đặt bán hàng
        path: urls.setting_sell,
        icon: <Icon name="SettingSell" />,
        code: "MENU_SETUP_SELL",
      },
      {
        title: "managementMaterial", // Quản lý nguyên vật liệu
        path: urls.material,
        icon: <Icon name="WarehouseManagement" />,
        code: "",
      },
      {
        title: "createPurchaseOrder", // Tạo phiếu nhập hàng
        path: urls.create_invoice_add,
        icon: <Icon name="ImportCoupon" />,
        code: "",
      },
      {
        title: "purchaseInvoice", // Hóa đơn nhập hàng
        path: urls.invoice_order,
        icon: <Icon name="ImportBill" />,
        code: "",
      },
      // {
      //   title: "createOutboundDelivery", // Tạo phiếu xuất kho
      //   path: urls.create_outbound_delivery,
      //   icon: <Icon name="ImportCoupon" />,
      //   code: "",
      // },
      // {
      //   title: "outboundInvoice", // Hóa đơn xuất kho
      //   path: urls.outbound_invoice,
      //   icon: <Icon name="ImportBill" />,
      //   code: "",
      // },
      {
        title: "soldProducts", // Sản phẩm đã bán
        path: urls.products_sold,
        icon: <Icon name="ProductsSold" />,
        code: "",
      },
      {
        title: "warehouseManagement", // Quản lý kho hàng
        path: urls.inventory,
        icon: <Icon name="WarehouseManagement" />,
        code: "INVENTORY",
      },
      {
        title: "warehouseChecking",
        path: urls.inventory_checking,
        icon: <Icon name="WarehouseManagement" />,
        code: "INVENTORY",
      },
      {
        title: "inventoryTransferDocument", // Phiếu điều chuyển kho
        path: urls.inventory_transfer_document,
        icon: <Icon name="WarehouseManagement" />,
        code: "INVENTORY",
      },
      {
        title: "stockAdjustmentVoucher", // Phiếu điều chỉnh kho
        path: urls.adjustment_slip,
        icon: <Icon name="File" />,
        code: "",
      },
    ],
  },
  {
    title: "customer", // Khách hàng & Đối tác
    path: urls.customer,
    icon: <Icon name="Customer" />,
    code: "CUSTOMER",
    children: [
      {
        title: "customerSegments", // Phân khúc khách hàng
        path: urls.customer_segment,
        icon: <Icon name="Profile" />,
      },
      // {
      //   title: "customerProfile", // Hồ sơ khách hàng
      //   path: urls.customer,
      //   icon: <Icon name="Profile" />,
      //   code: "CUSTOMER",
      // },
      {
        title: "customerList", // Danh sách khách hàng và NCC
        path: urls.customer_list,
        icon: <Icon name="Profile" />,
        code: "CUSTOMER",
      },
      // {
      //   title: "partnerProfile", // Hồ sơ đối tác
      //   path: urls.partner,
      //   icon: <Icon name="Profile" />,
      //   code: "PARTNER",
      // },
      {
        title: "debtManagement", // Quản lý công nợ
        path: urls.finance_management_debt_management,
        icon: <Icon name="Invoice" />,
        code: "",
      },
      {
        title: "settingCustomer", // Cài đặt khách hàng
        path: urls.setting_customer,
        icon: <Icon name="SettingCustomer" />,
        code: "MENU_SETUP_CUSTOMER",
      },
      {
        title: "settingPartner", // Cài đặt đối tác
        path: urls.setting_partner,
        icon: <Icon name="SettingCustomer" />,
        code: "",
      },
      {
        title: "reportCustomer", // Báo cáo khách hàng
        path: urls.report_customer,
        icon: <Icon name="Customer" />,
        code: "",
      },
    ],
  },
  {
    title: "financeManagement", // Tài chính & Thanh toán
    path: urls.finance_management,
    icon: <Icon name="CashBook" />,
    code: "",
    children: [
      {
        title: "financeDashboard", // Dashboard tài chính
        path: urls.finance_management_dashboard,
        icon: <Icon name="ReportFill" />,
        code: "",
      },
      {
        title: "financeCashbook", // Sổ thu chi (Trong Sổ thu chi có tạo Phiếu thu/chi - Gộp làm 1)
        path: urls.finance_management_cashbook,
        icon: <Icon name="CashBook" />,
        code: "",
      },
      // Thu tiền nhanh QR Pro - Bổ sung thêm Menu này
      // Đối soát ngân hàng - Chưa có
      // {
      //   title: "createFinanceTransaction", // Tạo phiếu thu/chi
      //   path: urls.finance_management_cashbook_template,
      //   icon: <Icon name="PlusCircleFill" />,
      //   code: "",
      // },
      {
        title: "invoiceVAT", // Xuất hóa đơn VAT
        path: urls.invoiceVAT,
        icon: <Icon name="File" />,
        code: "", //KPI_APPLY
      },
      {
        title: "fundManagement", // Quản lý quỹ
        path: urls.finance_management_fund_management,
        icon: <Icon name="MoneyFill" />,
        code: "",
      },
      {
        title: "createDebtTransaction", // Tạo giao dịch nợ
        path: urls.finance_management_debt_transaction,
        icon: <Icon name="PlusCircleFill" />,
        code: "",
      },
      {
        title: "endOfShiftInventory", // Kiểm kê cuối ca
        path: urls.finance_management_shift_inventory,
        icon: <Icon name="File" />,
        code: "",
      },
    ],
  },
  {
    title: "marketing", //Tiếp thị & Chăm sóc
    path: urls.maketing,
    icon: <Icon name="Marketing" />,
    code: "MARKETING",
    children: [
      {
        title: "promotionalProgram", // Chiến dịch khuyến mãi
        path: urls.promotional_program,
        icon: <Icon name="ManageOrder" />,
        code: "", //Tài nguyên cho show quản lý đặt hàng hay không
      },
      {
        title: "settingMarketing", // Cài đặt marketing
        path: urls.setting_marketing,
        icon: <Icon name="SettingSell" />,
        code: "",
      },
      // {
      //   title: "emailMarketing",
      //   path: urls.email_marketting,
      //   icon: <Icon name="EmailFill" />,
      //   code: "",
      // },
      // {
      //   title: "smsMarketing",
      //   path: urls.sms_marketting,
      //   icon: <Icon name="SMS" />,
      //   code: "",
      // },
      // {
      //   title: "zaloMarketing",
      //   path: urls.zalo_marketting,
      //   icon: <Icon name="Zalo" />,
      //   code: "",
      // },
      // {
      //   title: "marketingAutomation",
      //   path: urls.marketing_automation,
      //   icon: <Icon name="Marketing" />,
      //   code: "MA",
      // },
      {
        title: "dashboardLoyalty", // Dashboard khách hàng thân thiết
        path: urls.dashboard_loyalty,
        icon: <Icon name="ReportFill" />,
        code: "",
      },
      {
        title: "loyaltyPointLedger", // Nhật ký điểm hội viên
        path: urls.loyalty_point_ledger,
        icon: <Icon name="SettingCustomer" />,
        code: "",
      },
      {
        title: "loyaltyWallet", // Danh sách hội viên
        path: urls.loyalty_wallet,
        icon: <Icon name="SettingCustomer" />,
        code: "",
      },
      {
        title: "receiveTicket", // Tiếp nhận hỗ trợ
        path: urls.ticket,
        icon: <Icon name="ReceiveTicket" />,
        code: "TICKET",
      },
      {
        title: "customerServiceHotline", // Tổng đài CSKH
        path: urls.call_center,
        icon: <Icon name="CustomerSupport" />,
        code: "",
      },
      {
        title: "promotionalReport", // Báo cáo khuyến mãi
        path: urls.promotional_report,
        icon: <Icon name="Report" />,
        code: "",
      },
      // {
      //   title: "customerCareEmail", // Email CSKH
      //   path: urls.email,
      //   icon: <Icon name="EmailFill" />,
      //   code: "",
      // },
      // {
      //   title: "receiveWarranty", // Tiếp nhận bảo hành
      //   path: urls.warranty,
      //   icon: <Icon name="ReceiveWarranty" />,
      //   code: "WARRANTY",
      // },
      // {
      //   title: "receiveWarrantyProcess", // Tiếp nhận bảo hành
      //   path: urls.warranty_process,
      //   icon: <Icon name="ReceiveWarranty" />,
      //   code: "KANBAN_V2",
      // },
      // {
      //   title: "receiveTicketProcess", // Tiếp nhận hỗ trợ
      //   path: urls.ticket_process,
      //   icon: <Icon name="ReceiveTicket" />,
      //   code: "KANBAN_V2",
      // },
      // ...(sourceDomain == "rebornjsc.reborn.vn" || sourceDomain == "localhost"
      //   ? [
      //     {
      //       title: "feedbackEnhancement", // Góp ý cải tiến
      //       path: urls.feedback_customer,
      //       icon: <Icon name="Feedback" />,
      //       code: "",
      //     },
      //   ]
      //   : []),
      // {
      //   title: "customerSurvey", // Khảo sát khách hàng
      //   path: urls.customer_survey,
      //   icon: <Icon name="SpeakerNotes" />,
      //   code: "",
      // },
      // {
      //   title: "cxmSurvey", // Chiến dịch khảo sát
      //   path: urls.cxmSurvey,
      //   icon: <Icon name="Customer" />,
      //   code: "CXM_SURVEY",
      // },
      // {
      //   title: "settingWarranty", // Cài đặt bảo hành
      //   path: urls.setting_warranty,
      //   icon: <Icon name="SettingWarranty" />,
      //   code: "",
      // },
      {
        title: "settingLoyalty", // Cài đặt hạng hội viên
        path: urls.setting_loyalty,
        icon: <Icon name="SettingCustomer" />,
        code: "",
      },
      {
        title: "settingTicket", // Cài đặt hỗ trợ
        path: urls.setting_ticket,
        icon: <Icon name="SettingTicket" />,
        code: "",
      },
    ],
  },
  {
    title: "report", // Hệ thống báo cáo
    path: urls.report,
    icon: <Icon name="ReportFill" />,
    code: "MENU_REPORT",
    children: [
      {
        title: "reportRevenue", // Báo cáo Bán hàng
        path: urls.report_common,
        icon: <Icon name="Statistical" />,
        code: "",
      },
      {
        title: "stockedProducts", // Báo cáo Kho & Hàng bán (Hàng tồn, Kho, Đơn vị, Số lượng, Giá vốn, PP Giá vốn; Cảnh báo tồn dưới ngưỡng)
        path: urls.product_inventory,
        icon: <Icon name="ProductsStock" />,
        code: "",
      },
      {
        title: "cashbook", // Báo cáo Tài chính
        path: urls.cashbook,
        icon: <Icon name="CashBook" />,
        code: "CASHBOOK",
      },
      {
        title: "dashboardShipping", // Báo cáo vận chuyển
        path: urls.dashboard_shipping,
        icon: <Icon name="ReportFill" />,
        code: "",
      },
      {
        title: "settingCashbook", // Cài đặt tài chính
        path: urls.setting_cash_book,
        icon: <Icon name="SettingCashbook" />,
        code: "MENU_SETUP_CASHBOOK",
      },
    ],
  },
  {
    title: "bpm", // Quản lý quy trình
    path: urls.sell,
    icon: <Icon name="CashBook" />,
    code: "BPM",
    children: [
      {
        title: "manageProcesses",
        path: urls.manage_processes, //Danh sách quy trình > Tạo mới quy trình > Cấu hình quy trình (Nằm ở đây)
        code: "BPM",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "processSimulation",
        path: urls.process_simulation, //Mô phỏng quy trình
        code: "PROCESS_SIMULATION",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "objectManage", // Quản lý hồ sơ
        path: urls.object_manage,
        code: "OBJECT_MANAGE",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "userTaskList", // Xử lý hồ sơ
        path: urls.user_task_list,
        code: "WORK_MANAGEMENT",
        icon: <Icon name="ManageWork" />,
      },
      {
        title: "configBpm", // Cấu hình quy trình
        path: urls.config_bpm,
        icon: <Icon name="SettingJob" />,
        code: "",
      },
      {
        title: "manageDefaultProcesses",
        path: urls.manage_default_processes, //Danh sách quy trình > Tạo mới quy trình > Cấu hình quy trình (Nằm ở đây)
        code: "BPM",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "business_rule", // Loại luật nghiệp vụ
        path: urls.business_rule,
        icon: <Icon name="SettingJob" />,
        code: "",
      },
    ],
  },
  {
    title: "settings", // Cài đặt & Nhân sự
    path: urls.setting_common,
    icon: <Icon name="Settings" />,
    code: "",
    children: [
      {
        title: "settingBasis", // Cài đặt cơ sở
        path: urls.setting_basis,
        icon: <Icon name="Headquarters" />,
        code: "MENU_SETUP_BASIC",
      },
      {
        title: "settingPaymentMethod", // Cài đặt phương thức thanh toán
        path: urls.setting_payment_method,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "settingPersonal", // Cài đặt cá nhân
        path: urls.setting_account,
        icon: <Icon name="ContactCustomer" />,
        code: "",
      },
      {
        title: "settingEform", // Cài đặt biểu mẫu
        path: urls.setting_eform,
        icon: <Icon name="SettingSell" />,
        code: "",
      },
      {
        title: "settingSMS", // Cài đặt SMS
        path: urls.setting_sms,
        icon: <Icon name="SettingSMS" />,
        code: "MENU_SETUP_SMS",
      },
      {
        title: "settingEmail", // Cài đặt Email
        path: urls.setting_email,
        icon: <Icon name="SettingEmail" />,
        code: "MENU_SETUP_EMAIL",
      },
      {
        title: "settingZalo", //Cài đặt Zalo
        path: urls.setting_zalo,
        icon: <Icon name="Zalo" />,
        code: "",
      },
      {
        title: "settingSwitchboard", // Cài đặt tổng đài
        path: urls.setting_call,
        icon: <Icon name="SettingSMS" />,
        code: "MENU_SETUP_CALL",
      },
      {
        title: "settingApplication", // Cài đặt ứng dụng
        path: urls.install_app,
        icon: <Icon name="Download" />,
        code: "",
      },
      {
        title: "settingConfiguration", // Cài đặt danh mục
        path: urls.setting,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "viettelIntegration", // Tích hợp Viettel
        path: urls.viettel_integration,
        icon: <Icon name="Download" />,
        code: "",
      },
      {
        title: "settingPaymentMethod", // Phương thức thanh toán
        path: urls.payment_method,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "salesChannel", // Kênh thanh toán
        path: urls.sales_channel,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "overview",
        path: urls.overview_staff,
        icon: <Icon name="Settings" />,
        code: "",
      },
      // {
      //   title: "staff", // Bán hàng
      //   path: urls.staff,
      //   icon: <Icon name="CashPayment" />,
      //   code: "",
      // },
      {
        title: "reportShift",
        path: urls.report_shift,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "shiftConfig",
        path: urls.shift_config,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "openShift",
        path: urls.open_shift,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "closeShift",
        path: urls.close_shift,
        icon: <Icon name="Settings" />,
        code: "",
      },
      {
        title: "reportLogin", // Báo cáo đăng nhập
        path: urls.report_login,
        icon: <Icon name="Headquarters" />,
        code: "",
      },
      {
        title: "settingDashboard", // cài đặt Dashboard
        path: urls.setting_dashboard,
        icon: <Icon name="ReportFill" />,
        code: "",
      },
    ],
  },
  {
    title: "organizationalManagement",
    path: urls.organization,
    icon: <Icon name="Partner" />,
    code: "RESOURCE",
    children: [
      {
        title: "listOfOrganizations",
        path: urls.organization,
        icon: <Icon name="Partner" />,
        code: "ORGANIZATION_MANAGEMENT",
      },
      {
        title: "userAdministration",
        path: urls.user,
        icon: <Icon name="Customer" />,
        code: "RESOURCE",
      },
      {
        title: "servicePackageManagement",
        path: urls.package_manage,
        icon: <Icon name="Beauty" />,
        code: "RESOURCE",
      },
      {
        title: "renewalList",
        path: urls.extension_list,
        icon: <Icon name="Renewal" />,
        code: "RENEWAL_LIST",
      },
      {
        title: "fieldManagement",
        path: urls.field_management,
        icon: <Icon name="FieldMannagement" />,
        code: "FIELD_MANAGEMENT",
      },
      {
        title: "resourceManagement", // Quản trị tài nguyên
        path: urls.resource_management,
        icon: <Icon name="SettingJob" />,
        code: "RESOURCE",
      },
    ],
  },
];

export const routes: IRouter[] = [
  // Dashboard
  {
    path: "",
    // component: <Dashboard />,
    component: <DashboardRetail />,
  },
  {
    path: urls.dashboard,
    // component: <Dashboard />,
    component: (
      <Fragment>
        <DashboardRetail />
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
    component: <CustomerAndSupplier />,
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
  {
    path: urls.schedule,
    component: <TreatmentScheduleList />,
  },
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
    path: urls.report_customer,
    component: <ReportCustomer />,
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
    path: urls.setting_basis,
    component: <SettingBasisList />,
  },
  {
    path: urls.setting_payment_method,
    component: <SettingPaymentMethod />,
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
    path: urls.setting_partner,
    component: <SettingPartnerList />,
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
    component: <SettingLoyalty/>,
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
  // tạo phiếu nhập hàng
  {
    path: urls.create_invoice_add,
    component: <CreateReceipt />,
  },
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
  // quản lý kho hàng
  {
    path: urls.inventory,
    component: <InventoryList />,
  },
  {
    path: urls.inventory_checking,
    component: <InventoryManagement />,
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
    component: <PromotionalProgram />,
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
    path: urls.customer_pay,
    component: <CustomerPayList />,
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
  // quản lý vật tư
  {
    path: urls.material,
    component: <MaterialList />,
  },
  // thông tin cá nhân
  {
    path: urls.setting_account,
    component: <SettingAccount />,
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
    component: <ProcessedObjectList />,
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
    path: urls.payment_method,
    component: <PaymentMethodList />,
  },
  {
    path: urls.sales_channel,
    component: <CheckoutList />,
  },
  {
    path: urls.overview_staff,
    component: <Overview />,
  },
  {
    path: urls.staff,
    component: <StaffManagement />,
  },
  {
    path: urls.report_shift,
    component: <ShiftReport />,
  },
  {
    path: urls.shift_config,
    component: <ShiftConfig />,
  },
  {
    path: urls.open_shift,
    component: <OpenShift />,
  },
  {
    path: urls.close_shift,
    component: <CloseShift />,
  },
];
