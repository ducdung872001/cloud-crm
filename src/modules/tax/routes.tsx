// Routes export — mỗi nhánh sản phẩm chỉ cần spread TAX_ROUTES vào routes chính.
// Không import gì từ react-router trực tiếp để host app quyết định bọc trong Routes/Route.

import React from "react";
import { TAX_PERMISSIONS } from "./permissions";

const TaxModule = React.lazy(() => import("./ui/TaxModule"));

export interface TaxRouteDef {
  path: string;
  component: React.ReactNode;
  /** Permission code để host app check trước khi render (optional) */
  permission?: string;
}

export const TAX_ROUTES: TaxRouteDef[] = [
  { path: "/tax", component: <TaxModule />, permission: TAX_PERMISSIONS.VIEW },
  { path: "/tax/profile", component: <TaxModule />, permission: TAX_PERMISSIONS.VIEW },
  { path: "/tax/book", component: <TaxModule />, permission: TAX_PERMISSIONS.VIEW },
  { path: "/tax/declaration", component: <TaxModule />, permission: TAX_PERMISSIONS.DECLARE },
  { path: "/tax/license-fee", component: <TaxModule />, permission: TAX_PERMISSIONS.DECLARE },
  { path: "/tax/calendar", component: <TaxModule />, permission: TAX_PERMISSIONS.VIEW },
  { path: "/tax/advisory", component: <TaxModule />, permission: TAX_PERMISSIONS.VIEW },
];

// Menu definition — host app có thể dùng để thêm vào sidebar của nó.
// Mỗi entry gắn permission code để host filter theo quyền user.
export const TAX_MENU_ITEM = {
  title: "Thuế HKD",
  path: "/tax",
  icon: "🧾",
  code: TAX_PERMISSIONS.VIEW,
  children: [
    { title: "Tổng quan", path: "/tax", icon: "📊", code: TAX_PERMISSIONS.VIEW },
    { title: "Hồ sơ thuế", path: "/tax/profile", icon: "🪪", code: TAX_PERMISSIONS.VIEW },
    { title: "Sổ DT / CP", path: "/tax/book", icon: "📒", code: TAX_PERMISSIONS.VIEW },
    { title: "Lập tờ khai", path: "/tax/declaration", icon: "📝", code: TAX_PERMISSIONS.DECLARE },
    { title: "Môn bài", path: "/tax/license-fee", icon: "🏷️", code: TAX_PERMISSIONS.DECLARE },
    { title: "Lịch thuế", path: "/tax/calendar", icon: "🗓️", code: TAX_PERMISSIONS.VIEW },
    { title: "Tư vấn", path: "/tax/advisory", icon: "💡", code: TAX_PERMISSIONS.VIEW },
  ],
};
