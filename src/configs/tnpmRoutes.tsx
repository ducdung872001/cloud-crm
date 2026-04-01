import React, { Fragment } from "react";
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./tnpmUrls";

// ─── Page Imports ──────────────────────────────────────────────────────────
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

// Reuse existing pages from cloud-crm that are still relevant
import CustomerPersonList from "pages/CustomerPerson/CustomerPersonList";
import DetailPersonList from "pages/CustomerPerson/partials/DetailPerson/DetailPersonList";
import TicketList from "pages/Ticket/TicketList";
import SettingBasisList from "pages/SettingBasis/SettingBasisList";
import SettingAccount from "pages/SettingAccount/SettingAccount";
import NotificationList from "pages/NotificationList/NotificationList";
import MiddleWorkList from "pages/MiddleWork/MiddleWorkList";
import BusinessProcessList from "pages/BPM/BusinessProcessList/BusinessProcessList";
import UserTaskList from "pages/UserTaskList";
import NotFoundPage from "pages/404";

// ─── MENU (Sidebar navigation) ──────────────────────────────────────────────
export const menu: IMenuItem[] = [
  // ── 1. DASHBOARD ──────────────────────────────────────────────────────────
  {
    title: "Dashboard",
    path: urls.dashboard,
    icon: "🏙️",
    code: "DASHBOARD",
  },

  // ── 2. PORTFOLIO & DỰ ÁN ─────────────────────────────────────────────────
  {
    title: "Danh mục BĐS",
    icon: "🏢",
    code: "PROPERTY",
    children: [
      {
        title: "Danh sách Dự án",
        path: urls.projectList,
        icon: "🏗️",
        code: "PROJECT_LIST",
      },
      {
        title: "Quản lý Unit",
        path: urls.unitList,
        icon: "🏠",
        code: "UNIT_LIST",
      },
    ],
  },

  // ── 3. KHÁCH HÀNG (TENANT) ────────────────────────────────────────────────
  {
    title: "Khách hàng / Tenant",
    path: urls.customerList,
    icon: "👥",
    code: "CUSTOMER",
  },

  // ── 4. HỢP ĐỒNG ──────────────────────────────────────────────────────────
  {
    title: "Hợp đồng",
    icon: "📄",
    code: "CONTRACT",
    children: [
      {
        title: "Hợp đồng thuê",
        path: urls.leaseContractList,
        icon: "📋",
        code: "LEASE_CONTRACT",
      },
      {
        title: "Hợp đồng DV",
        path: urls.serviceContractList,
        icon: "📝",
        code: "SERVICE_CONTRACT",
      },
    ],
  },

  // ── 5. BILLING & TÀI CHÍNH ───────────────────────────────────────────────
  {
    title: "Billing & Tài chính",
    icon: "💳",
    code: "BILLING",
    children: [
      {
        title: "Hóa đơn",
        path: urls.billingList,
        icon: "💳",
        code: "BILLING_LIST",
      },
      {
        title: "Turnover Rent",
        path: urls.turnoverRentList,
        icon: "📊",
        code: "TURNOVER_RENT",
      },
    ],
  },

  // ── 6. NHÀ CUNG CẤP (VENDOR) ─────────────────────────────────────────────
  {
    title: "Nhà cung cấp",
    icon: "🏭",
    code: "VENDOR",
    children: [
      {
        title: "Danh sách NCC",
        path: urls.vendorList,
        icon: "🏭",
        code: "VENDOR_LIST",
      },
      {
        title: "HĐ Nhà cung cấp",
        path: urls.vendorContractList,
        icon: "📄",
        code: "VENDOR_CONTRACT",
      },
      {
        title: "Hóa đơn NCC",
        path: urls.vendorInvoiceList,
        icon: "🧾",
        code: "VENDOR_INVOICE",
      },
    ],
  },

  // ── 7. VẬN HÀNH & KỸ THUẬT ───────────────────────────────────────────────
  {
    title: "Vận hành & Kỹ thuật",
    icon: "🔧",
    code: "OPERATIONS",
    children: [
      {
        title: "Yêu cầu Dịch vụ",
        path: urls.serviceRequestList,
        icon: "🔧",
        code: "SERVICE_REQUEST",
      },
      {
        title: "Kế hoạch Bảo trì",
        path: urls.maintenancePlanList,
        icon: "📅",
        code: "MAINTENANCE_PLAN",
      },
    ],
  },

  // ── 8. YÊU CẦU HỖ TRỢ (TICKET) ──────────────────────────────────────────
  {
    title: "Phiếu hỗ trợ",
    path: "/tickets",
    icon: "🎫",
    code: "TICKET",
  },

  // ── 9. CÔNG VIỆC NỘI BỘ ─────────────────────────────────────────────────
  {
    title: "Công việc nội bộ",
    path: "/tasks",
    icon: "✅",
    code: "TASKS",
  },

  // ── 10. BÁO CÁO ──────────────────────────────────────────────────────────
  {
    title: "Báo cáo",
    path: urls.reportTNPM,
    icon: "📊",
    code: "REPORTS",
  },

  // ── 11. CÀI ĐẶT ──────────────────────────────────────────────────────────
  {
    title: "Cài đặt",
    path: urls.settings,
    icon: "⚙️",
    code: "SETTINGS",
  },
];

// ─── ROUTES ─────────────────────────────────────────────────────────────────
export const routes: IRouter[] = [
  // Dashboard
  { path: urls.dashboard, component: DashboardTNPM },
  { path: "/", component: DashboardTNPM },

  // Property
  { path: urls.projectList, component: PropertyProjectList },
  { path: urls.unitList, component: PropertyProjectList }, // will be replaced when UnitList is built

  // Customers
  { path: urls.customerList, component: CustomerPersonList },
  { path: "/customers/:id", component: DetailPersonList },

  // Contracts
  { path: urls.leaseContractList, component: LeaseContractList },
  { path: urls.serviceContractList, component: LeaseContractList }, // placeholder

  // Billing
  { path: urls.billingList, component: BillingEngineList },
  { path: urls.turnoverRentList, component: TurnoverRentList },

  // Vendor
  { path: urls.vendorList, component: VendorManagementList },
  { path: urls.vendorContractList, component: VendorManagementList }, // placeholder
  { path: urls.vendorInvoiceList, component: VendorInvoiceList },

  // Operations
  { path: urls.serviceRequestList, component: ServiceRequestList },
  { path: urls.maintenancePlanList, component: MaintenancePlanList },

  // Tickets & Tasks
  { path: "/tickets", component: TicketList },
  { path: "/tasks", component: UserTaskList },

  // Reports
  { path: urls.reportTNPM, component: ReportTNPM },

  // Settings
  { path: urls.settings, component: SettingBasisList },
  { path: urls.settingsBasis, component: SettingBasisList },
  { path: "/account", component: SettingAccount },
  { path: "/notifications", component: NotificationList },

  // BPM
  { path: "/bpm", component: BusinessProcessList },

  // 404
  { path: "*", component: NotFoundPage },
];

export default routes;
