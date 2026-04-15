// Routes export — mỗi nhánh sản phẩm chỉ cần spread TAX_ROUTES vào routes chính.
// Không import gì từ react-router trực tiếp để host app quyết định bọc trong Routes/Route.

import React from "react";

const TaxModule = React.lazy(() => import("./ui/TaxModule"));

export interface TaxRouteDef {
  path: string;
  component: React.ReactNode;
}

export const TAX_ROUTES: TaxRouteDef[] = [
  { path: "/tax", component: <TaxModule /> },
  { path: "/tax/profile", component: <TaxModule /> },
  { path: "/tax/book", component: <TaxModule /> },
  { path: "/tax/declaration", component: <TaxModule /> },
  { path: "/tax/calendar", component: <TaxModule /> },
  { path: "/tax/advisory", component: <TaxModule /> },
];

// Menu definition — host app có thể dùng để thêm vào sidebar của nó.
export const TAX_MENU_ITEM = {
  title: "Thuế HKD",
  path: "/tax",
  icon: "🧾",
  code: "TAX",
  children: [
    { title: "Tổng quan", path: "/tax", icon: "📊" },
    { title: "Hồ sơ thuế", path: "/tax/profile", icon: "🪪" },
    { title: "Sổ DT / CP", path: "/tax/book", icon: "📒" },
    { title: "Lập tờ khai", path: "/tax/declaration", icon: "📝" },
    { title: "Lịch thuế", path: "/tax/calendar", icon: "🗓️" },
    { title: "Tư vấn", path: "/tax/advisory", icon: "💡" },
  ],
};
