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

// Menu cho Reborn Super Admin (console quản trị nền tảng)
export const menu: IMenuItem[] = [
  {
    title: "dashboard",
    path: urls.dashboard,
    icon: <Icon name="Home" />,
    code: "DASHBOARD",
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
        title: "resourceManagement",
        path: urls.resource_management,
        icon: <Icon name="SettingJob" />,
        code: "RESOURCE",
      },
    ],
  },
  {
    title: "settings",
    path: urls.setting_account,
    icon: <Icon name="Settings" />,
    code: "",
    children: [
      {
        title: "settingPersonal",
        path: urls.setting_account,
        icon: <Icon name="ContactCustomer" />,
        code: "",
      },
    ],
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
];
