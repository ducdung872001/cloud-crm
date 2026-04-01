import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ManagementStore from "./partials/ManagementStore/ManagementStore";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import ShiftConfigTabs from "@/pages/ShiftConfig/ShiftConfig";
import PaymentMethodPage from "@/pages/PaymentMethodPage/PaymentMethodPage";
import SettingList from "pages/Setting/SettingList";
import "./SettingBasisList.scss";

/**
 * Menu cấp 1: "Vận hành cửa hàng"  →  /setting_basis
 * Items cấp 2: Quản lý cửa hàng | Phương thức thanh toán | Ca làm việc | Cấu hình chung
 */
export default function SettingBasisList() {
  const { t } = useTranslation();
  document.title = "Vận hành cửa hàng";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Quản lý cửa hàng",
      is_tab: "store",
      icon: "StoreManagement",
      backgroundColor: "#FAECE7",
      des: "Cấu hình thông tin, địa chỉ và hoạt động của từng cửa hàng / chi nhánh.",
    },
    {
      title: "Phương thức thanh toán",
      is_tab: "payment",
      icon: "PaymentMethodMenu",
      backgroundColor: "#E1F5EE",
      des: "Định nghĩa và lựa chọn phương thức thanh toán khả dụng trên hệ thống.",
    },
    {
      title: "Ca làm việc & phân công nhân viên",
      is_tab: "shift",
      icon: "OpenShiftMenu",
      backgroundColor: "#E6F1FB",
      des: "Thiết lập ca làm việc, giờ bắt đầu/kết thúc và phân công nhân viên theo ca.",
    },
    {
      title: "Cấu hình chung",
      is_tab: "config",
      icon: "GeneralConfigMenu",
      backgroundColor: "#FAEEDA",
      des: "Quản lý các tham số cấu hình hệ thống dạng key-value dùng chung toàn hệ thống.",
    },
  ];

  return (
    <div className="page-setting-basis">
      {!isDetail && <h1>Vận hành cửa hàng</h1>}
      {!isDetail && (
        <TabMenuList
          listTab={listTab}
          onClick={(item: any) => { setTab(item.is_tab); setIsDetail(true); }}
        />
      )}

      {isDetail && tab === "store"   && <ManagementStore   onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
      {isDetail && tab === "payment" && <PaymentMethodPage onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
      {isDetail && tab === "shift"   && <ShiftConfigTabs   onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
      {isDetail && tab === "config"  && <SettingList       onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
    </div>
  );
}