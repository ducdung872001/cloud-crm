import React from "react";
import Icon from "components/icon";
import Dashboard from "pages/Dashboard/index";
import { IMenuItem, IRouter } from "model/OtherModel";
import urls from "./urls";

import SettingAccount from "pages/SettingAccount/SettingAccount";
import OrganizationList from "pages/Organization/OrganizationList";
import Package from "pages/Package";
import ExtensionList from "pages/Extension/ExtensionList";
import UserList from "pages/User/UserList";
import FieldMannagement from "pages/FieldManagement/FieldManagement";
import ResourceManagementList from "pages/ResourceManagement/ResourceManagementList";
import AppList from "pages/AppManagement/AppList";
import AppEditionList from "pages/AppManagement/AppEditionList";
import AppEditionWhitelist from "pages/AppManagement/AppEditionWhitelist";

// Menu cho Reborn Super Admin (console quản trị nền tảng).
// Bố cục: 4 entry points vận hành hằng ngày (Tổ chức / Người dùng / Gói / Gia hạn)
// để cấp 1 — 1-click; gom 2 mục cấu hình master data (Lĩnh vực / Tài nguyên)
// vào group "Cấu hình hệ thống"; cài đặt cá nhân tách dưới cùng.
export const menu: IMenuItem[] = [
  {
    title: "dashboard",
    path: urls.dashboard,
    icon: <Icon name="Home" />,
    code: "DASHBOARD",
  },
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
    title: "appManagement",
    path: urls.app_management,
    icon: <Icon name="SettingJob" />,
    code: "", // placeholder — sau khi BE Platform deploy + seed permission "APP_MANAGEMENT_VIEW" thì set lại
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
    title: "systemConfiguration",
    path: urls.field_management,
    icon: <Icon name="SettingJob" />,
    code: "RESOURCE",
    children: [
      {
        title: "fieldManagement",
        path: urls.field_management,
        icon: <Icon name="FieldMannagement" />,
        code: "FIELD_MANAGEMENT",
      },
      {
        title: "resourceManagement",
        path: urls.resource_management,
        icon: <Icon name="SettingJob" />,
        code: "RESOURCE",
      },
    ],
  },
  {
    title: "settingPersonal",
    path: urls.setting_account,
    icon: <Icon name="ContactCustomer" />,
    code: "",
  },
];

export const routes: IRouter[] = [
  {
    path: "",
    component: <Dashboard />,
  },
  {
    path: urls.dashboard,
    component: <Dashboard />,
  },
  {
    path: urls.setting_account,
    component: <SettingAccount />,
  },
  {
    path: urls.organization,
    component: <OrganizationList />,
  },
  {
    path: urls.user,
    component: <UserList />,
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
    path: urls.resource_management,
    component: <ResourceManagementList />,
  },
  {
    path: urls.app_management,
    component: <AppList />,
  },
  {
    path: urls.app_edition_management,
    component: <AppEditionList />,
  },
  {
    path: urls.app_edition_whitelist,
    component: <AppEditionWhitelist />,
  },
];
