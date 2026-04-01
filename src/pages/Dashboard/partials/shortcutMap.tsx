import React from "react";
import Icon from "components/icon";
import urls from "configs/urls";
import { IShortcut, ShortcutKey } from "model/dashboard/DashboardModel";

/**
 * Map từ ShortcutKey → metadata hiển thị (title, path, icon, background)
 * Đây là nguồn sự thật duy nhất về link của mỗi shortcut
 */
export const SHORTCUT_MAP: Record<ShortcutKey, IShortcut> = {
  POS: {
    title: "Tạo đơn",
    path: urls.create_sale_add,
    icon: <Icon name="PlusCircleFill" />,
    background: "#1890ff",
    target: "_blank",
  },
  CUSTOMER: {
    title: "Khách hàng",
    path: urls.customer_list,
    icon: <Icon name="PeopleFill" />,
    background: "#13c2c2",
    target: "",
  },
  WAREHOUSE: {
    title: "Kho hàng",
    path: urls.inventory,
    icon: <Icon name="Archive" />,
    background: "#52c41a",
    target: "",
  },
  FINANCE: {
    title: "Tài chính",
    path: urls.finance_management_cashbook,
    icon: <Icon name="Wallet2" />,
    background: "#722ed1",
    target: "",
  },
  INVOICE: {
    title: "Hóa đơn",
    path: urls.sale_invoice,
    icon: <Icon name="Receipt" />,
    background: "#eb2f96",
    target: "",
  },
  TASK: {
    title: "Công việc",
    path: urls.middle_work,
    icon: <Icon name="ClipboardCheck" />,
    background: "#fa8c16",
    target: "",
  },
  PROMO_REPORT: {
    title: "KM",
    path: urls.promotional_report,
    icon: <Icon name="Tags" />,
    background: "#f5222d",
    target: "",
  },
};

/**
 * Chuyển danh sách key → danh sách IShortcut để render
 */
export function resolveShortcuts(keys: ShortcutKey[]): IShortcut[] {
  return keys
    .map((k) => SHORTCUT_MAP[k])
    .filter(Boolean); // bỏ qua key không hợp lệ
}