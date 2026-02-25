import React from "react";
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
import EarningList from "pages/Earning/EarningList";
import CrmCampaignList from "pages/CrmCampaign/CrmCampaignList";
import SettingList from "pages/Setting/SettingList";
import ReportCommon from "pages/ReportCommon/ReportCommon";
import InternalMailList from "pages/InternalMail/InternalMailList";
import KpiList from "pages/Kpi/KpiList/KpiList";
import KpiApplyList from "pages/Kpi/KpiApplyList/KpiApplyList";
import KpiObjectList from "pages/Kpi/KpiObjectList/KpiObjectList";
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
import SettingContractList from "pages/SettingContract/SettingContractList";
import SettingCashBookList from "pages/SettingCashBook/SettingCashBookList";
import SettingMarketResearchList from "pages/SettingMarketResearch/SettingMarketResearchList";
import SettingMarketingList from "pages/SettingMarketing/SettingMarketingList";
import SetttingSocialCrmList from "pages/SetttingSocialCrm/SetttingSocialCrmList";
import SettingReportList from "pages/SettingReport/SettingReportList";
import ResourceManagementList from "pages/ResourceManagement/ResourceManagementList";
import PublicConnectZalo from "pages/Public/PublicConnectZalo";
// Lịch
import CalendarCommon from "pages/CalendarCommon/CalendarCommon";
// Quản lý cơ hội
import ManagementOpportunity from "pages/ManagementOpportunity/ManagementOpportunity";
// Chăm sóc khách hàng
import CallCenterList from "pages/CallCenter/CallCenterList";
// Kênh bán facebook
import SocialCrmFacebook from "pages/SocialCrmFacebook/SocialCrmFacebook";
// Kênh bán Zalo
import SocialCrmZalo from "pages/SocialCrmZalo/SocialCrmZalo";
// Thông tin tài khoản cá nhân
import SettingAccount from "pages/SettingAccount/SettingAccount";
import SettingKpiList from "pages/SettingKPI/SettingKPIList";
import ReportCustomer from "pages/ReportCustomer/ReportCustomer";
// Cài đặt ứng dụng
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
// test chức năng mới
import Test from "pages/Test";
import { getDomain } from "reborn-util";
import { getRootDomain } from "utils/common";

// Khảo sát khách hàng
import CustomerSurvey from "pages/CustomerSurvey";

// tạo đường link khảo sát
import LinkSurvey from "pages/LinkSurvey";

// Báo giá
import FsQuote from "pages/FsQuote";
import Quotations from "pages/Quotations";
import QuotationsNew from "pages/Quotations/index_New";
import SettingProcess from "pages/SettingProcess/SettingProcess";
import SaleFlowList from "pages/SaleFlow/SaleFlowList";
import CreateSaleflow from "pages/SaleFlow/CreateSaleFlow/CreateSaleFlow";
import ManagementSale from "pages/ManagementSale/ManagementSale";
import ContractEform from "pages/SettingContract/partials/ContractEform/ContractEform";

// Phiếu điền chuyển kho
import DetailMarketingAutomation from "pages/MarketingAutomation/DetailMarketingAutomation";
import ManageDataSharing from "pages/ManageDataSharing/ManageDataSharing";
import SettingPartnerList from "pages/SettingPartner/SettingPartnerList";
import PartnerList from "pages/PartnerList/PartnerList";
import ReportLogin from "pages/ReportLogin/ReportLogin";
// cài đặt mẫu báo giá
import SettingQuoteForm from "pages/SettingQuoteForm/SettingQuoteForm";
import CampaignMarketingList from "pages/CampaignMarketing/CampaignMarketingList";
import BusinessProcessList from "pages/BPM/BusinessProcessList/BusinessProcessList";
import SettingBusinessProcess from "pages/BPM/SettingBusinessProcess/SettingBusinessProcess";
import ConfigBPM from "pages/ConfigBPM";
import ProcessedObjectList from "pages/SettingProcess/partials/ProcessedObjectList";
import ManageOrder from "pages/ManagerOrder";
import IntegratedMonitoring from "pages/IntegratedMonitoring/IntegratedMonitoring";
import SettingCode from "pages/SettingCode/SettingCode";
import SettingIntegration from "pages/SettingIntegration/SettingIntegration";
import SettingDashboard from "pages/SettingDashboard/SettingDashboard";
import DetailPartner from "pages/PartnerList/DetailPartner/DetailPartner";
import SettingOperate from "pages/SettingOperate/SettingOperate";
import BuildingList from "pages/SettingOperate/partials/BuildingList/BuildingList";
import BuildingFloorList from "pages/SettingOperate/partials/BuildingFloorList/BuildingFloorList";
import CxmSurveyList from "pages/CxmSurvey/CxmSurveyList/CxmSurveyList";
import ProcessSimulation from "pages/ProcessSimulation/ProcessSimulation";
import BusinessProcessCreate from "pages/BPM/BusinessProcessCreate";
import CampaignListParent from "pages/Campaign/CampaignListParent";
import UserTaskList from "pages/UserTaskList";
import UploadDocument from "pages/BPM/UploadDocument/UploadDocument";
import Package from "pages/Package";
import ExtensionList from "pages/Extension/ExtensionList";
import UserList from "pages/User/UserList";
import FieldMannagement from "pages/FieldManagement/FieldManagement";
import ManageDefaultProcesses from "pages/ManageDefaultProcesses";
import ManagementOpportunityNew from "pages/ManagementOpportunityNew";
import ManagerWork from "pages/ManagerWork";
import BusinessRule from "pages/BusinessRule";
import BusinessRuleConfig from "pages/BusinessRuleConfig";
import OrganizationList from "pages/Organization/OrganizationList";

const sourceDomain = getDomain(decodeURIComponent(document.location.href));

// const checkSubdomainTNEX = sourceDomain.includes("tnex");

export const menu: IMenuItem[] = [
  {
    title: "dashboard", // Trang chủ
    path: urls.dashboard,
    icon: <Icon name="Home" />,
    code: "DASHBOARD",
  },
  {
    title: "managerWork", // Quản lý công việc
    path: urls.manager_work,
    icon: <Icon name="Job" />,
    code: "WORK_PROJECT",
  },
  {
    title: "personal", // Cá nhân
    path: urls.personal,
    icon: <Icon name="Person" />,
    code: "PERSONAL",
    children: [
      {
        title: "calendar", // Lịch
        path: urls.calendar_common,
        icon: <Icon name="CalendarFill" />,
        code: "CALENDAR",
      },
      {
        title: "internalMail", // Thư nội bộ
        path: urls.internal_mail,
        icon: <Icon name="EmailFill" />,
        code: "MAILBOX",
      },
      {
        title: "createKPIFramework", // Tạo bộ KPI
        path: urls.kpi,
        icon: <Icon name="KpiCustomer" />,
        code: "", //KPI_APPLY
      },
      {
        title: "createKPITask", // Tạo phiếu giao KPI
        path: urls.kpiApply,
        icon: <Icon name="KpiCustomer" />,
        code: "", //KPI_APPLY
      },
      {
        title: "kpiManagement", // Quản lý KPI
        path: urls.kpiObject,
        icon: <Icon name="KpiCustomer" />,
        code: "", //KPI_APPLY
      },
      {
        title: "settingKPI", // Cài đặt KPI
        path: urls.setting_kpi,
        icon: <Icon name="KpiCustomer" />,
        code: "",
      },
    ],
  },
  {
    title: "customer", // Khách hàng
    path: urls.customer,
    icon: <Icon name="Customer" />,
    code: "CUSTOMER",
    children: [
      {
        title: "customerSegments", // Phân khúc khách hàng
        path: urls.customer_segment,
        icon: <Icon name="Profile" />,
      },
      {
        title: "customerProfile", // Hồ sơ khách hàng
        path: urls.customer,
        icon: <Icon name="Profile" />,
        code: "CUSTOMER",
      },
      {
        title: "contactProfile", // Hồ sơ người liên hệ
        path: urls.contact,
        icon: <Icon name="Profile" />,
        code: "CUSTOMER",
      },
      {
        title: "partnerProfile", // Hồ sơ đối tác
        path: urls.partner,
        icon: <Icon name="Profile" />,
        code: "PARTNER",
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
        title: "settingContact", // Cài đặt người liên hệ
        path: urls.setting_contact,
        icon: <Icon name="SettingCustomer" />,
        code: "",
      },
    ],
  },
  {
    title: "marketing",
    path: urls.maketing,
    icon: <Icon name="Marketing" />,
    code: "MARKETING",
    children: [
      {
        title: "campaignMarketing",
        path: urls.campaign_marketing,
        icon: <Icon name="Marketing" />,
        code: "",
      },
      {
        title: "emailMarketing",
        path: urls.email_marketting,
        icon: <Icon name="EmailFill" />,
        code: "",
      },
      {
        title: "smsMarketing",
        path: urls.sms_marketting,
        icon: <Icon name="SMS" />,
        code: "",
      },
      {
        title: "zaloMarketing",
        path: urls.zalo_marketting,
        icon: <Icon name="Zalo" />,
        code: "",
      },
      {
        title: "marketingAutomation",
        path: urls.marketing_automation,
        icon: <Icon name="Marketing" />,
        code: "MA",
      },
      {
        title: "settingMarketing", // Cài đặt marketing
        path: urls.setting_marketing,
        icon: <Icon name="SettingSell" />,
        code: "",
      },
    ],
  },
  {
    title: "customerCare", // Chăm sóc khách hàng
    path: urls.customer_care,
    icon: <Icon name="CustomerCare" />,
    code: "CUSTOMER_CARE",
    children: [
      {
        title: "customerServiceHotline", // Tổng đài CSKH
        path: urls.call_center,
        icon: <Icon name="CustomerSupport" />,
        code: "",
      },
      {
        title: "customerCareEmail", // Email CSKH
        path: urls.email,
        icon: <Icon name="EmailFill" />,
        code: "",
      },
      {
        title: "receiveWarranty", // Tiếp nhận bảo hành
        path: urls.warranty,
        icon: <Icon name="ReceiveWarranty" />,
        code: "WARRANTY",
      },
      {
        title: "receiveWarrantyProcess", // Tiếp nhận bảo hành
        path: urls.warranty_process,
        icon: <Icon name="ReceiveWarranty" />,
        code: "KANBAN_V2",
      },
      {
        title: "receiveTicket", // Tiếp nhận hỗ trợ
        path: urls.ticket,
        icon: <Icon name="ReceiveTicket" />,
        code: "TICKET",
      },
      {
        title: "receiveTicketProcess", // Tiếp nhận hỗ trợ
        path: urls.ticket_process,
        icon: <Icon name="ReceiveTicket" />,
        code: "KANBAN_V2",
      },
      ...(sourceDomain == "rebornjsc.reborn.vn" || sourceDomain == "localhost"
        ? [
            {
              title: "feedbackEnhancement", // Góp ý cải tiến
              path: urls.feedback_customer,
              icon: <Icon name="Feedback" />,
              code: "",
            },
          ]
        : []),
      {
        title: "customerSurvey", // Khảo sát khách hàng
        path: urls.customer_survey,
        icon: <Icon name="SpeakerNotes" />,
        code: "",
      },
      {
        title: "cxmSurvey", // Chiến dịch khảo sát
        path: urls.cxmSurvey,
        icon: <Icon name="Customer" />,
        code: "CXM_SURVEY",
      },
      {
        title: "settingWarranty", // Cài đặt bảo hành
        path: urls.setting_warranty,
        icon: <Icon name="SettingWarranty" />,
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
    title: "report", // Báo cáo
    path: urls.report,
    icon: <Icon name="ReportFill" />,
    code: "MENU_REPORT",
    children: [
      {
        title: "cashbook", // Tài chính
        path: urls.cashbook,
        icon: <Icon name="CashBook" />,
        code: "CASHBOOK",
      },
      {
        title: "reportRevenue", // Doanh thu
        path: urls.report_common,
        icon: <Icon name="Statistical" />,
        code: "",
      },
      {
        title: "reportCustomer", // Khách hàng
        path: urls.report_customer,
        icon: <Icon name="Customer" />,
        code: "",
      },
      {
        title: "reportLogin", // Khách hàng
        path: urls.report_login,
        icon: <Icon name="Headquarters" />,
        code: "",
      },
      {
        title: "settingCashbook", // Cài đặt tài chính
        path: urls.setting_cash_book,
        icon: <Icon name="SettingCashbook" />,
        code: "MENU_SETUP_CASHBOOK",
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
  // {
  //   title: "organizationalManagement",
  //   path: urls.organization,
  //   icon: <Icon name="Partner" />,
  //   code: "RESOURCE",
  //   children: [
  //     {
  //       title: "listOfOrganizations",
  //       path: urls.organization,
  //       icon: <Icon name="Partner" />,
  //       code: "ORGANIZATION_MANAGEMENT",
  //     },
  //     {
  //       title: "userAdministration",
  //       path: urls.user,
  //       icon: <Icon name="Customer" />,
  //       code: "RESOURCE",
  //     },
  //     {
  //       title: "servicePackageManagement",
  //       path: urls.package_manage,
  //       icon: <Icon name="Beauty" />,
  //       code: "RESOURCE",
  //     },
  //     {
  //       title: "renewalList",
  //       path: urls.extension_list,
  //       icon: <Icon name="Renewal" />,
  //       code: "RENEWAL_LIST",
  //     },
  //     {
  //       title: "fieldManagement",
  //       path: urls.field_management,
  //       icon: <Icon name="FieldMannagement" />,
  //       code: "FIELD_MANAGEMENT",
  //     },
  //     {
  //       title: "resourceManagement", // Quản trị tài nguyên
  //       path: urls.resource_management,
  //       icon: <Icon name="SettingJob" />,
  //       code: "RESOURCE",
  //     },
  //   ],
  // },
  {
    title: "settings", // Cài đặt
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
        title: "manage_data_sharing", // Cài đặt chia sẻ dữ liệu
        path: urls.manage_data_sharing,
        icon: <Icon name="FileSharing" style={{ width: 35, height: 35, marginLeft: -5 }} />,
        code: "",
      },
    ],
  },
];

export const routes: IRouter[] = [
  // Dashboard
  {
    path: "",
    component: <Dashboard />,
  },
  {
    path: urls.dashboard,
    component: <Dashboard />,
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
    path: urls.cxmSurvey, // Thông tin khảo sát
    component: <CxmSurveyList />,
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
  {
    path: urls.management_opportunity,
    component: <ManagementOpportunity />,
  },
  {
    path: urls.management_opportunity_new,
    component: <ManagementOpportunityNew />,
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

  //
  {
    path: urls.earnings,
    component: <EarningList />,
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
    path: urls.kpi,
    component: <KpiList />,
  },
  {
    path: urls.kpiApply,
    component: <KpiApplyList />,
  },
  {
    path: urls.kpiObject,
    component: <KpiObjectList />,
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
    path: urls.setting_operate,
    component: <SettingOperate />,
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
    path: urls.setting_contract,
    component: <SettingContractList />,
  },
  {
    path: urls.setting_eform,
    component: <ContractEform />,
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
    path: urls.setting_marketing,
    component: <SettingMarketingList />,
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
  // thông tin cá nhân
  {
    path: urls.setting_account,
    component: <SettingAccount />,
  },
  //Cài đặt KPI
  {
    path: urls.setting_kpi,
    component: <SettingKpiList />,
  },
  // Cài đặt ứng dụng
  {
    path: urls.install_app,
    // component: <InstallApplication />,
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

  ///chiến dịch MA
  {
    path: urls.campaign_marketing,
    component: <CampaignMarketingList />,
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
    path: urls.fs,
    component: <FsQuote />,
  },
  {
    path: urls.quote,
    component: <Quotations />,
  },
  {
    path: urls.quoteNew,
    component: <QuotationsNew />,
  },
  {
    path: urls.setting_process,
    component: <SettingProcess />,
  },
  {
    path: urls.report_login,
    component: <ReportLogin />,
  },
  {
    path: urls.setting_quote_form,
    component: <SettingQuoteForm />,
  },
  {
    path: urls.building,
    component: <BuildingList />,
  },
  {
    path: urls.buildingFloor,
    component: <BuildingFloorList />,
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
    path: urls.test,
    component: <Test />,
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
];
