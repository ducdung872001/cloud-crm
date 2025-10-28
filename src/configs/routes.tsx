import React from "react";
import Icon from "components/icon";
import Dashboard from "pages/Dashboard/index";
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./urls";

import CustomerPersonList from "pages/CustomerPerson/CustomerPersonList";
import ContactList from "pages/Contact/ContactList";
import ContractList from "pages/Contract/ContractList";
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
import TicketList from "pages/Ticket/TicketList";
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
import SettingContractList from "pages/SettingContract/SettingContractList";
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
// Bán hàng
import CreateOrderSales from "pages/Sell/CreateOrderSales/CreateOrderSales";
import SaleInvoiceList from "pages/Sell/SaleInvoiceList/SaleInvoiceList";
import CustomerPayList from "pages/Sell/CustomerPayList/CustomerPayList";
// Lịch sử điều trị
import TreatmentHistoryList from "pages/TreatmentHistory/TreatmentHistoryList";
// Nhật ký điều trị
import DiarySurgeryList from "pages/DiarySurgery/DiarySurgeryList";
// Lịch
import CalendarCommon from "pages/CalendarCommon/CalendarCommon";
// Quản lý chiến dịch
import CampaignList from "pages/Campaign/CampaignList";
// Quản lý cơ hội
import ManagementOpportunity from "pages/ManagementOpportunity/ManagementOpportunity";
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
import SettingKpiList from "pages/SettingKPI/SettingKPIList";
import ReportCustomer from "pages/ReportCustomer/ReportCustomer";
// Cài đặt ứng dụng
import InstallApplication from "pages/InstallApplication/InstallApplication";
import MarketingAutomation from "pages/MarketingAutomation/MarketingAutomation";
import SettingZalo from "pages/SettingZalo/SettingZalo";
import CreateContracts from "pages/Contract/CreateContracts/CreateContracts";
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
import CreateOffers from "pages/Offer/CreateOffers/CreateOffers";
import OfferList from "pages/Offer/OfferList/OfferList";
import FsQuote from "pages/FsQuote";
import Quotations from "pages/Quotations";
import SettingProcess from "pages/SettingProcess/SettingProcess";
import DetailContract from "pages/Contract/DetailContract/DetailContract";
import SaleFlowList from "pages/SaleFlow/SaleFlowList";
import CreateSaleflow from "pages/SaleFlow/CreateSaleFlow/CreateSaleFlow";
import ManagementSale from "pages/ManagementSale/ManagementSale";
import ContractEform from "pages/SettingContract/partials/ContractEform/ContractEform";

// Phiếu điền chuyển kho
import TransferOrderForm from "pages/TransferOrderForm";
import DetailMarketingAutomation from "pages/MarketingAutomation/DetailMarketingAutomation";
import ManageDataSharing from "pages/ManageDataSharing/ManageDataSharing";
import SettingPartnerList from "pages/SettingPartner/SettingPartnerList";
import GuaranteeContractList from "pages/Contract/GuaranteeContract/GuaranteeContract";
import PartnerList from "pages/PartnerList/PartnerList";
import ReportLogin from "pages/ReportLogin/ReportLogin";
// cài đặt mẫu báo giá
import SettingQuoteForm from "pages/SettingQuoteForm/SettingQuoteForm";
import DetailGuaranteeContract from "pages/Contract/GuaranteeContract/DetailGuaranteeContract/DetailGuaranteeContract";
import CampaignMarketingList from "pages/CampaignMarketing/CampaignMarketingList";
import BusinessProcessList from "pages/BPM/BusinessProcessList/BusinessProcessList";
import SettingBusinessProcess from "pages/BPM/SettingBusinessProcess/SettingBusinessProcess";
import ConfigBPM from "pages/ConfigBPM/ConfigBPM";
import ProcessedObjectList from "pages/SettingProcess/partials/ProcessedObjectList";
import CreateOrder from "pages/Order/createOrder";
import OrderInvoiceList from "pages/Order/orderInvoiceList";
import TemporaryOrderList from "pages/Order/temporaryOrderList";
import ManageOrder from "pages/ManagerOrder";
import SettingProjectList from "pages/SettingProject/SettingProjectList";
import ProjectList from "pages/ProjectList/ProjectList";
import IntegratedMonitoring from "pages/IntegratedMonitoring/IntegratedMonitoring";
import OpportunityList from "pages/OpportunityList/OpportunityList";
import SettingCode from "pages/SettingCode/SettingCode";
import SettingIntegration from "pages/SettingIntegration/SettingIntegration";
import SettingDashboard from "pages/SettingDashboard/SettingDashboard";
import DetailProject from "pages/ProjectList/DetailProject/DetailProject";
import SettingPromotionList from "pages/SettingPromotion/SettingPromotionList";
import WarrantyContract from "pages/Contract/WarrantyContract/WarrantyContract";
import DetailWarrantyContract from "pages/Contract/WarrantyContract/DetailWarrantyContract/DetailWarrantyContract";
import DetailPartner from "pages/PartnerList/DetailPartner/DetailPartner";
import SettingOperate from "pages/SettingOperate/SettingOperate";
import ManagementFeeList from "pages/OperateManagement/ManagementFee/ManagementFeeList";
import UtilityReadingList from "pages/OperateManagement/UtilityReading/UtilityReadingList";
import SpaceList from "pages/SettingOperate/partials/Space/SpaceList";
import VehicleRegistrationList from "pages/OperateManagement/VehicleRegistration/VehicleRegistrationList";
import VehicleList from "pages/OperateManagement/Vehicle/VehicleList";
import OrtherFeeList from "pages/OperateManagement/OrtherFee/OrtherFeeList";
import BuildingList from "pages/SettingOperate/partials/BuildingList/BuildingList";
import BuildingFloorList from "pages/SettingOperate/partials/BuildingFloorList/BuildingFloorList";
import SpaceCustomerList from "pages/OperateManagement/SpaceCustomer/SpaceCustomerList";
import CxmSurveyList from "pages/CxmSurvey/CxmSurveyList/CxmSurveyList";
import ElectricityIndexList from "pages/OperateManagement/ElectricityIndex/ElectricityIndexList";
import WaterIndexList from "pages/OperateManagement/WaterIndex/WaterIndexList";
import ProcessSimulation from "pages/ProcessSimulation/ProcessSimulation";
import BusinessProcessCreate from "pages/BPM/BusinessProcessCreate";
import CampaignListParent from "pages/Campaign/CampaignListParent";
import UserTaskList from "pages/UserTaskList";
import UploadDocument from "pages/BPM/UploadDocument/UploadDocument";

const isBeauty = localStorage.getItem("isBeauty");

const sourceDomain = getDomain(decodeURIComponent(document.location.href));

const rootDomain = getRootDomain(sourceDomain);
const checkSubdomainTNEX = sourceDomain.includes("tnex");
const checkSubdomainTNPM = sourceDomain.includes("tnpm") || sourceDomain.includes("localhost");
const checkSubdomainGREENSPA = sourceDomain.includes("greenspa");
// "tnex.reborn.vn"

export const menu: IMenuItem[] = [
  ...(!checkSubdomainTNEX
    ? [
        {
          title: "dashboard", // Trang chủ
          path: urls.dashboard,
          icon: <Icon name="Home" />,
          code: "DASHBOARD",
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
            // {
            //   title: "Tài liệu", // document
            //   path: urls.internal_mail,
            //   icon: <Icon name="DocumentFill" />,
            //   code: "DOCUMENT",
            // },
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
            // {
            //   title: "Chấm công",
            //   path: urls.internal_mail,
            //   icon: <Icon name="TimeKeeping" />,
            //   code: "TIMEKEEPING",
            // },
            // {
            //   title: "Hoa hồng",
            //   path: urls.internal_mail,
            //   icon: <Icon name="MoneyFill" />,
            //   code: "EARNINGS",
            // },
          ],
        },
        // {
        //   title: "job", // Công việc
        //   path: urls.middle_work,
        //   icon: <Icon name="Job" />,
        //   code: "WORK_ORDER",
        // },

        {
          title: sourceDomain === "hasedu.reborn.vn" ? "workManagement" : "project", // dự án
          path: urls.project,
          icon: <Icon name="Job" />,
          code: "WORK_PROJECT",
          children: [
            {
              title: "project", // dự án
              path: urls.project,
              icon: <Icon name="Job" />,
              code: "WORK_PROJECT",
            },
            {
              title: "job", // Công việc
              path: urls.middle_work,
              icon: <Icon name="Job" />,
              code: "WORK_ORDER",
            },
          ],
        },
      ]
    : []),
  // {
  //   title: "calendar", // Lịch
  //   path: urls.calendar_common,
  //   icon: <Icon name="CalendarFill" />,
  //   code: "CALENDAR",
  // },
  {
    title: sourceDomain === "hasedu.reborn.vn" ? "student" : "customer", // Khách hàng
    path: urls.customer,
    icon: <Icon name="Customer" />,
    code: "CUSTOMER",
    children: [
      {
        title: sourceDomain === "hasedu.reborn.vn" ? "studentProfile" : "customerProfile", // Hồ sơ khách hàng
        path: urls.customer,
        icon: <Icon name="Profile" />,
        code: "CUSTOMER",
      },

      ...(!checkSubdomainTNEX
        ? [
            {
              title: sourceDomain === "hasedu.reborn.vn" ? "parentProfile" : "contactProfile", // Hồ sơ người liên hệ
              path: urls.contact,
              icon: <Icon name="Profile" />,
              code: "CUSTOMER",
            },
            ...(isBeauty && isBeauty == "1"
              ? [
                  {
                    title: "treatmentHistory", // Lịch sử điều trị
                    path: urls.treatment_history,
                    icon: <Icon name="TraetmentHistory" />,
                    code: "TREATMENT_HISTORY",
                  },
                ]
              : []),
          ]
        : []),

      {
        title: "customerSegments", // Phân khúc khách hàng
        path: urls.customer_segment,
        icon: <Icon name="Profile" />,
      },
    ],
  },

  ...(!checkSubdomainTNEX
    ? [
        {
          title: sourceDomain === "hasedu.reborn.vn" ? "teacher" : "partner", // Đối tác
          path: urls.partner,
          icon: <Icon name="Customer" />,
          code: "PARTNER",
          children: [
            {
              title: sourceDomain === "hasedu.reborn.vn" ? "teacherProfile" : "partnerProfile", // Hồ sơ đối tác
              path: urls.partner,
              icon: <Icon name="Profile" />,
              code: "PARTNER",
            },
          ],
        },
        {
          title: "quote", // Báo giá
          path: urls.offer,
          icon: <Icon name="ReceiveMoney" />,
          code: "QUOTE",
          children: [
            // {
            //   title: "createQuote", // Tạo báo giá
            //   path: urls.create_offer_add,
            //   icon: <Icon name="PlusCircleFill" />,
            //   code: "",
            // },
            // {
            //   title: "listQuotations", // Danh sách báo giá
            //   path: urls.offer,
            //   icon: <Icon name="Invoice" />,
            //   code: "",
            // },
            {
              title: "listFS", // Danh sách FS
              path: urls.fs,
              icon: <Icon name="Invoice" />,
              code: "",
            },
            {
              title: "listQuotations", // Danh sách báo giá
              path: urls.quote,
              icon: <Icon name="Invoice" />,
              code: "",
            },
          ],
        },
        {
          title: "contract",
          path: urls.contract,
          icon: <Icon name="Sell" />,
          code: "CONTRACT",
          children: [
            {
              title: "createContract", // Tạo hợp đồng
              path: urls.create_contract,
              icon: <Icon name="PlusCircleFill" />,
              code: "",
            },
            {
              title: "listContract", // Danh sách hợp đồng
              path: urls.contract,
              icon: <Icon name="Invoice" />,
              code: "",
            },
            // ...(isBeauty && isBeauty == "1"
            //   ? [
            sourceDomain !== "hasedu.reborn.vn" && {
              title: "guaranteeContract", // Hợp đồng bảo lãnh
              path: urls.guarantee,
              icon: <Icon name="Invoice" />,
              code: "GUARANTEE",
            },
            {
              title: "listWarrantyContract", // Hợp đồng bảo hành
              path: urls.warrantyContract,
              icon: <Icon name="Invoice" />,
              code: "WARRANTY_CONTRACT",
            },
            //   ]
            // : []),
          ],
        },
        {
          title: "marketing",
          path: urls.maketing,
          icon: <Icon name="Marketing" />,
          code: "MARKETING",
          children: [
            // {
            //   title: "Tìm khách hàng",
            //   path: `https://${getDomain(location.href)}/market/article`,
            //   icon: <Icon name="Research" />,
            //   code: "",
            //   target: "_blank",
            // },
            // {
            //   title: "Chiến dịch Marketing",
            //   path: "",
            //   icon: <Icon name="Marketing" />,
            //   code: "",
            // },
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
            // {
            //   title: "Automation Marketing",
            //   path: "",
            //   icon: <Icon name="Automation" />,
            //   code: "",
            // },
            {
              title: "marketingAutomation",
              path: urls.marketing_automation,
              icon: <Icon name="Marketing" />,
              code: "MA",
            },

            {
              title: "campaignMarketing",
              path: urls.campaign_marketing,
              icon: <Icon name="Marketing" />,
              code: "",
            },
          ],
        },
        sourceDomain !== "hasedu.reborn.vn" && {
          title: "salesChannel", // Kênh bán
          path: urls.social_crm,
          icon: <Icon name="Social" />,
          code: "SOCIAL_CRM",
          children: [
            {
              title: "facebook",
              path: urls.social_facebook_crm,
              icon: <Icon name="FacebookFill" />,
              code: "",
            },
            {
              title: "zalo",
              path: urls.social_zalo_crm,
              icon: <Icon name="Zalo" />,
            },
          ],
        },
      ]
    : []),
  {
    title: "selling", // Bán hàng
    path: urls.sell,
    icon: <Icon name="Sell" />,
    code: "MENU_SELL",
    children: [
      // {
      //   title: "Quản lý hợp đồng",
      //   path: urls.contract,
      //   icon: <Icon name="Profile" />,
      //   code: "CUSTOMER",
      // },
      ...(!checkSubdomainTNEX
        ? [
            {
              title: "createSalesOrder", // Tạo đơn bán hàng
              path: urls.create_sale_add,
              icon: <Icon name="PlusCircleFill" />,
              code: "CREATE_SALE_ORDER",
            },
            {
              title: "salesInvoice", // Hóa đơn bán hàng
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
              title: "salesFlow", // Quy trình bán hàng
              path: urls.sale_flow,
              icon: <Icon name="SalesProcess" />,
              code: "SALE_FLOW",
            },
            {
              title: "invoicesManagement", // Quản lý bán hàng
              path: urls.management_sale,
              icon: <Icon name="ManageOpportunity" />,
              code: "INVOICE_MANAGEMENT",
            },
          ]
        : []),
      {
        title: "createOppotunity", // Tạo cơ hội
        path: urls.opportunity_list + "?isCreate=true",
        icon: <Icon name="PlusCircleFill" />,
        code: "",
      },
      {
        title: "salesCampaign", // Quản lý chiến dịch
        path: urls.sales_campaign,
        icon: <Icon name="Opportunity" />,
        code: "",
      },
      {
        title: "opportunityList", // danh sách cơ hội
        path: urls.opportunity_list,
        icon: <Icon name="Opportunity" />,
        code: "",
      },
      {
        title: "salesManagement", // Quản lý cơ hội
        path: urls.management_opportunity,
        icon: <Icon name="OpportunityManagement" />,
        code: "",
      },
      // {
      //   title: "Vinh danh bán hàng",
      //   path: "",
      //   icon: <Icon name="Winner" />,
      //   code: "",
      // }
    ],
  },

  {
    title: "userTaskManagement", // Nhiệm vụ
    path: urls.user_task_list,
    icon: <Icon name="ManageWork" />,
    code: "",
    children: [
      {
        title: "userTaskList",
        path: urls.user_task_list,
        icon: <Icon name="ManageWork" />,
        code: "WORK_MANAGEMENT",
      },
    ],
  },

  {
    title: "bpm", // Quản lý quy trình
    path: urls.sell,
    icon: <Icon name="CashBook" />,
    code: "MANAGE_PROCESSES",
    children: [
      {
        title: "manageProcesses",
        path: urls.manage_processes, //Danh sách quy trình > Tạo mới quy trình > Cấu hình quy trình (Nằm ở đây)
        code: "MANAGE_PROCESSES",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "processSimulation",
        path: urls.process_simulation, //Mô phỏng quy trình
        code: "PROCESS_SIMULATION",
        icon: <Icon name="CashBook" />,
      },
      {
        title: "objectManage", // Quản lý đối tượng
        path: urls.object_manage,
        code: "OBJECT_MANAGE",
        icon: <Icon name="CashBook" />,
      },
    ],
  },
  // {
  //   title: "bpm", // BPM
  //   path: urls.bpm,
  //   icon: <Icon name="CashBook" />,
  //   code: "BPM",
  //   children: [
  //     {
  //       title: "bpm", // Cài đặt cơ sở
  //       path: urls.bpm,
  //       icon: <Icon name="CashBook" />,
  //       code: "",
  //     },
  //     {
  //       title: "objectManage", // quản lý đối tượng
  //       path: urls.object_manage,
  //       icon: <Icon name="CashBook" />,
  //       code: "",
  //     },
  //   ],
  // },
  ...(!checkSubdomainTNEX
    ? [
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
              title: "receiveTicket", // Tiếp nhận hỗ trợ
              path: urls.ticket,
              icon: <Icon name="ReceiveTicket" />,
              code: "TICKET",
            },
            ...(isBeauty && isBeauty == "1"
              ? [
                  {
                    title: "medicalRecord", // Nhật ký điều trị
                    path: urls.diary_surgery,
                    icon: <Icon name="Postoperative" />,
                    code: "DIARY_SURGERY_VIEW",
                  },
                ]
              : []),
            ...(sourceDomain == "rebornjsc.reborn.vn"
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
          ],
        },
        sourceDomain !== "hasedu.reborn.vn" && {
          title: "manageOrder", // Quản lý đặt hàng
          path: urls.manager_order,
          icon: <Icon name="ManageOrder" />,
          code: "MANAGE_ORDER", //Tài nguyên cho show quản lý đặt hàng hay không
        },

        sourceDomain !== "hasedu.reborn.vn" && {
          title: "order", // Đặt hàng
          path: urls.product_import,
          icon: <Icon name="Cart" />,
          code: "ORDER", //Tài nguyên cho show đặt hàng hay không
          children: [
            {
              title: "createOrder", // Tạo đơn đặt hàng
              path: urls.order,
              icon: <Icon name="ImportCoupon" />,
              code: "",
            },
            {
              title: "orderInvoiceList", // Hóa đơn đặt hàng
              path: urls.order_invoice_list,
              icon: <Icon name="ImportBill" />,
              code: "",
            },
            {
              title: "temporaryOrderList", // Đơn đặt lưu tạm
              path: urls.temporary_order_list,
              icon: <Icon name="File" />,
              code: "",
            },
          ],
        },
        sourceDomain !== "hasedu.reborn.vn" && {
          title: "warehouse", // Kho hàng
          path: urls.product_import,
          icon: <Icon name="ImportGoods" />,
          code: "MENU_INVENTORY", //Tài nguyên cho show kho hàng hay không
          children: [
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
            // {
            //   title: "Trả hàng nhà cung cấp",
            //   path: "",
            //   icon: <Icon name="SupplierPayment" />,
            //   code: "",
            // },
            {
              title: "soldProducts", // Sản phẩm đã bán
              path: urls.products_sold,
              icon: <Icon name="ProductsSold" />,
              code: "",
            },
            {
              title: "stockedProducts", // Sản phẩm tồn kho
              path: urls.product_inventory,
              icon: <Icon name="ProductsStock" />,
              code: "",
            },
            {
              title: "warehouseManagement", // Quản lý kho hàng
              path: urls.inventory,
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
          title: "cashbook", // Tài chính
          path: urls.cashbook,
          icon: <Icon name="CashBook" />,
          code: "CASHBOOK",
        },
        {
          title: "report", // Báo cáo
          path: urls.report,
          icon: <Icon name="ReportFill" />,
          code: "MENU_REPORT",
          children: [
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
            // {
            //   title: "Chấm công",
            //   path: "",
            //   icon: <Icon name="SettingTimekeeping" />,
            //   code: "",
            // },
            // {
            //   title: "Hoa hồng",
            //   path: "",
            //   icon: <Icon name="Rose" />,
            //   code: "",
            // },
            // {
            //   title: "Lịch sử tác động",
            //   path: "",
            //   icon: <Icon name="ImpactHistory" />,
            //   code: "",
            // },
          ],
        },
      ]
    : []),
  ...(checkSubdomainTNPM || checkSubdomainGREENSPA
    ? [
        {
          title: "operate", // Quản lý vận hành
          path: "",
          icon: <Icon name="SettingCashbook" />,
          code: "OPERATION_MANAGEMENT",
          children: [
            {
              title: "spaceCustomer", // Khu vực/căn hộ
              path: urls.spaceCustomer,
              icon: <Icon name="Headquarters" />,
              code: "",
            },
            {
              title: "electricityIndex", // Chốt chỉ số điện từ bộ phận kĩ thuật
              path: urls.electricityIndex,
              icon: <Icon name="KpiCustomer" />,
              code: "",
            },
            {
              title: "waterIndex", // Chốt chỉ số nước từ bộ phận kĩ thuật
              path: urls.waterIndex,
              icon: <Icon name="KpiCustomer" />,
              code: "",
            },
            {
              title: "managementFee", // Phí quản lý
              path: urls.managementFee,
              icon: <Icon name="MoneyFill" />,
              code: "",
            },
            {
              title: "ortherFee", // Chi phí khác
              path: urls.ortherFee,
              icon: <Icon name="MoneyFill" />,
              code: "",
            },
            {
              title: "vehicleRegistration", // Phí đậu xe
              path: urls.vehicleRegistration,
              icon: <Icon name="Profile" />,
              code: "",
            },
            {
              title: "vehicle", // Đăng kí phương tiện
              path: urls.vehicle,
              icon: <Icon name="ImportGoods" />,
              code: "",
            },
          ],
        },
      ]
    : []),
  {
    title: "survey", // Trải nghiệm khách hàng
    // path: urls.cashbook,
    path: urls.cxmSurvey,
    icon: <Icon name="ManageOrder" />,
    code: "SURVEY_CUSTOMER",
    children: [
      {
        title: "cxmSurvey", // Danh sách chiến dịch khảo sát
        path: urls.cxmSurvey,
        icon: <Icon name="Customer" />,
        code: "SURVEY_CUSTOMER",
      },
      // {
      //   title: "cxmResponse", // Danh sách câu hỏi khảo sát
      //   path: urls.utilityReading,
      //   icon: <Icon name="KpiCustomer" />,
      //   code: "",
      // },
      // {
      //   title: "managementFee", // Phí quản lý
      //   path: urls.managementFee,
      //   icon: <Icon name="MoneyFill" />,
      //   code: "",
      // },
      // {
      //   title: "ortherFee", // Chi phí khác
      //   path: urls.ortherFee,
      //   icon: <Icon name="MoneyFill" />,
      //   code: "",
      // },
      // {
      //   title: "vehicleRegistration", // Phí đậu xe
      //   path: urls.vehicleRegistration,
      //   icon: <Icon name="Profile" />,
      //   code: "",
      // },
      // {
      //   title: "vehicle", // Đăng kí phương tiện
      //   path: urls.vehicle,
      //   icon: <Icon name="ImportGoods" />,
      //   code: "",
      // },
    ],
  },

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
      ...(!checkSubdomainTNEX
        ? [
            {
              title: "settingPersonal", // Cài đặt cá nhân
              path: urls.setting_account,
              icon: <Icon name="ContactCustomer" />,
              code: "",
            },
            {
              title: "settingKPI", // Cài đặt KPI
              path: urls.setting_kpi,
              icon: <Icon name="KpiCustomer" />,
              code: "",
            },
          ]
        : []),
      // {
      //   title: "Cài đặt chấm công",
      //   path: urls.setting_timekeeping,
      //   icon: <Icon name="SettingTimekeeping" />,
      //   code: "",
      // },
      {
        title: "settingCustomer", // Cài đặt khách hàng
        path: urls.setting_customer,
        icon: <Icon name="SettingCustomer" />,
        code: "MENU_SETUP_CUSTOMER",
      },
      ...(!checkSubdomainTNEX
        ? [
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
            {
              title: "settingSales", // Cài đặt bán hàng
              path: urls.setting_sell,
              icon: <Icon name="SettingSell" />,
              code: "MENU_SETUP_SELL",
            },
            {
              title: "settingMarketing", // Cài đặt marketing
              path: urls.setting_marketing,
              icon: <Icon name="SettingSell" />,
              code: "",
            },
            {
              title: "settingContract", // Cài đặt hợp đồng
              path: urls.setting_contract,
              icon: <Icon name="SettingSell" />,
              code: "",
            },
            {
              title: "settingEform", // Cài đặt biểu mẫu
              path: urls.setting_eform,
              icon: <Icon name="SettingSell" />,
              code: "",
            },
            {
              title: "settingProcess", // Cài đặt quy trình
              path: urls.setting_process,
              icon: <Icon name="SettingSell" />,
              code: "",
            },
            {
              title: "settingQuoteForm", // Cài đặt mẫu báo giá
              path: urls.setting_quote_form,
              icon: <Icon name="SettingSell" />,
              code: "",
            },
            // {
            //   title: "Cài đặt hoa hồng",
            //   path: urls.setting_rose,
            //   icon: <Icon name="SettingRose" />,
            //   code: "",
            // },
            {
              title: "settingCashbook", // Cài đặt tài chính
              path: urls.setting_cash_book,
              icon: <Icon name="SettingCashbook" />,
              code: "MENU_SETUP_CASHBOOK",
            },
            // {
            //   title: "Cài đặt tìm khách hàng",
            //   path: urls.setting_market_research,
            //   icon: <Icon name="SettingAnalytics" />,
            //   code: "",
            // },
            {
              title: "settingSalesChannel", // Cài đặt kênh bán
              path: urls.setting_social_crm,
              icon: <Icon name="SettingSocial" />,
              code: "MENU_SETUP_SOCIAL_CRM",
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
              title: "settingProject", // Cài đặt dự án
              path: urls.setting_project,
              icon: <Icon name="SettingJob" />,
              code: "",
            },
            // {
            //   title: "settingJob", // Cài đặt công việc
            //   path: urls.setting_work,
            //   icon: <Icon name="SettingJob" />,
            //   code: "",
            // },
            // {
            //   title: "settingReport",
            //   path: urls.setting_report,
            //   icon: <Icon name="ReportFill" />,
            //   code: "MENU_SETUP_REPORT",
            // },
            // {
            //   title: "integratedMonitoring", // Giám sát tích hợp
            //   path: urls.integrated_monitoring,
            //   icon: <Icon name="ReportFill" />,
            //   code: "",
            // },
            {
              title: "settingCode",
              path: urls.setting_code,
              icon: <Icon name="ReportFill" />,
              code: "",
            },
            {
              title: "configBpm", // cấu hình BPM
              path: urls.config_bpm,
              icon: <Icon name="SettingJob" />,
              code: "",
            },
            {
              title: "settingDashboard", // cài đặt Dashboard
              path: urls.setting_dashboard,
              icon: <Icon name="ReportFill" />,
              code: "",
            },
          ]
        : []),
      (checkSubdomainTNPM || checkSubdomainGREENSPA) && {
        title: "settingOperate", // Cài đặt vận hành
        path: urls.setting_operate,
        icon: <Icon name="Settings" />,
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
      ...(!checkSubdomainTNEX
        ? [
            {
              title: "manage_data_sharing", // Cài đặt chia sẻ dữ liệu
              path: urls.manage_data_sharing,
              icon: <Icon name="FileSharing" style={{ width: 35, height: 35, marginLeft: -5 }} />,
              code: "",
            },
            {
              title: "resourceManagement", // Quản trị tài nguyên
              path: urls.resource_management,
              icon: <Icon name="SettingJob" />,
              code: "RESOURCE",
            },
          ]
        : []),
    ],
  },

  // đoạn này dùng để test chức năng mới
  // {
  //   title: "BPM",
  //   path: urls.bpm,
  //   icon: <Icon name="CashBook" />,
  //   code: "",
  // },
  // {
  //   title: "Test",
  //   path: urls.test,
  //   icon: <Icon name="CashBook" />,
  //   code: "",
  // },
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
  // tạo hợp đồng
  {
    path: urls.create_contract,
    component: <CreateContracts />,
  },
  {
    path: urls.edit_contract,
    component: <CreateContracts />,
  },
  {
    path: urls.contract,
    component: <ContractList />,
  },
  {
    path: urls.warrantyContract,
    component: <WarrantyContract />,
  },
  {
    path: urls.guarantee,
    component: <GuaranteeContractList />,
  },

  {
    path: urls.detail_guarantee,
    component: <DetailGuaranteeContract />,
  },
  {
    path: urls.detail_warranty_contract,
    component: <DetailWarrantyContract />,
  },
  {
    path: urls.detail_contract,
    component: <DetailContract />,
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
    path: urls.opportunity_list,
    component: <OpportunityList />,
  },
  {
    path: urls.management_opportunity,
    component: <ManagementOpportunity />,
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
    path: urls.treatment_history,
    component: <TreatmentHistoryList />,
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
    path: urls.detail_ticket,
    component: <DetailTicket />,
  },
  {
    path: urls.diary_surgery,
    component: <DiarySurgeryList />,
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

  // tạo báo giá
  // {
  //   path: urls.create_offer_add,
  //   component: <CreateOffers />,
  // },
  // danh sách báo giá
  // {
  //   path: urls.offer,
  //   component: <OfferList />,
  // },
  // Setting
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
    path: urls.setting_sell,
    component: <SettingSellList />,
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
    path: urls.setting_project,
    component: <SettingProjectList />,
  },
  // {
  //   path: urls.setting_work,
  //   component: <SettingWorkTypeList />,
  // },
  {
    path: urls.config_bpm,
    component: <ConfigBPM />,
  },
  {
    path: urls.setting_dashboard,
    component: <SettingDashboard />,
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
  // tạo đơn bán hàng
  {
    path: urls.create_sale_add,
    component: <CreateOrderSales />,
  },
  // danh sách hóa đơn bán hàng
  {
    path: urls.sale_invoice,
    component: <SaleInvoiceList />,
  },
  // danh sách khách trả hàng
  {
    path: urls.customer_pay,
    component: <CustomerPayList />,
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
    path: urls.setting_quote_form,
    component: <SettingQuoteForm />,
  },

  //Cài đặt vận hành
  {
    path: urls.ortherFee,
    component: <OrtherFeeList />,
  },
  {
    path: urls.electricityIndex,
    component: <ElectricityIndexList />,
  },
  {
    path: urls.waterIndex,
    component: <WaterIndexList />,
  },
  {
    path: urls.spaceCustomer,
    component: <SpaceCustomerList />,
  },
  {
    path: urls.managementFee,
    component: <ManagementFeeList />,
  },
  {
    path: urls.vehicleRegistration,
    component: <VehicleRegistrationList />,
  },
  {
    path: urls.vehicle,
    component: <VehicleList />,
  },
  {
    path: urls.building,
    component: <BuildingList />,
  },
  {
    path: urls.buildingFloor,
    component: <BuildingFloorList />,
  },

  // đoạn này dùng để test chức năng mới
  // {
  //   path: urls.bpm,
  //   component: <BusinessProcessList />,
  // },
  {
    path: urls.manage_processes,
    component: <BusinessProcessList />,
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
];
