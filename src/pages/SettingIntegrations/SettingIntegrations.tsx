import React, { useState } from "react";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import InstallApplication from "pages/SettingIntegration/InstallApplication/InstallApplication";
import IntegratedMonitoring from "pages/SettingIntegration/IntegratedMonitoring/IntegratedMonitoring";

/**
 * Menu cấp 1: "Tích hợp và kết nối"  →  /setting_integrations
 * Items cấp 2: Ứng dụng bên thứ ba | Giám sát tích hợp & webhook
 * [CH] Đã bỏ "Hệ sinh thái Viettel" — không liên quan Community Hub
 */
export default function SettingIntegrations() {
  document.title = "Tích hợp và kết nối";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const back = (isBack: boolean) => { if (isBack) setIsDetail(false); };

  const listTab = [
    {
      title: "Ứng dụng bên thứ ba",
      is_tab: "apps",
      icon: "AppListIntegrated",
      backgroundColor: "#E1F5EE",
      des: "Quản lý ứng dụng đã kết nối với hệ thống như TMĐT, kế toán, vận chuyển…",
    },
    {
      title: "Giám sát tích hợp & webhook",
      is_tab: "monitor",
      icon: "IntegratedMonitoring",
      backgroundColor: "#EAF3DE",
      des: "Theo dõi trạng thái kết nối, cảnh báo lỗi và cấu hình endpoint nhận sự kiện thời gian thực.",
    },
  ];

  return (
    <div className="page-setting-integrations">
      {!isDetail && <h1>Tích hợp &amp; kết nối</h1>}
      {!isDetail && (
        <TabMenuList
          listTab={listTab}
          onClick={(item: Record<string, unknown>) => { setTab(item.is_tab); setIsDetail(true); }}
        />
      )}

      {isDetail && tab === "apps"     && <InstallApplication  onBackProps={back} />}
      {isDetail && tab === "monitor"  && <IntegratedMonitoring onBackProps={back} />}
    </div>
  );
}
