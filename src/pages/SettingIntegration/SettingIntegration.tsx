import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingIntegration.scss";
import InstallApplication from "./InstallApplication/InstallApplication";
import Webhook from "./Webhook/Webhook";
import IntegratedMonitoring from "./IntegratedMonitoring/IntegratedMonitoring";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingIntegration() {
  document.title = "Cài đặt tích hợp";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Giám sát tích hợp",
      is_tab: "tab_three",
      icon: "IntegratedMonitoring",
      backgroundColor: "#EAF3DE",
      strokeColor: "rgb(59, 109, 17)",
      des: "Theo dõi trạng thái hoạt động của các kết nối tích hợp, cảnh báo lỗi và lịch sử đồng bộ dữ liệu."
    }, 
    {
      title: "Danh sách ứng dụng",
      is_tab: "tab_one",
      icon: "AppListIntegrated",
      backgroundColor: "#E6F1FB",
      strokeColor: "rgb(24, 95, 165)",
      des: "Quản lý các ứng dụng và dịch vụ bên thứ ba đã kết nối với hệ thống như TMĐT, kế toán, vận chuyển…"
    }, 
    {
      title: "Danh sách webhook",
      is_tab: "tab_two",
      icon: "WebhookList",
      backgroundColor: "#EEEDFE",
      strokeColor: "rgb(83, 74, 183)",
      des: "Cấu hình các endpoint nhận sự kiện từ hệ thống (đơn hàng mới, cập nhật KH…) để đồng bộ dữ liệu với hệ thống ngoài theo thời gian thực."
    }, 
  ];

  return (
    <div className="page-setting-integration">
      {!isDetail && <TitleAction title="Cài đặt tích hợp" />}
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTab}
                onClick={(item) => {
                    setTab(item.is_tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>
      
      {isDetail && tab === "tab_one" ? (
        <InstallApplication
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <Webhook
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <IntegratedMonitoring
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) :  null}
    </div>
  );
}
