import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
// import TemplateEmailList from "./partials/TemplateEmail/TemplateEmailList";
import { getPermissions } from "utils/common";

import "./SettingZalo.scss";
import TemplateCategoryZalo from "./partials/TemplateCategoryZalo/TemplateCategoryZalo";
import TemplateZaloList from "./partials/TemplateZaloList/TemplateZaloList";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingZalo() {
  document.title = "Cài đặt Zalo";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const listTab = [
    {
      title: "Chủ đề Zalo",
      is_tab: "tab_one",
      icon: "TopicZalo",
      backgroundColor: "#E1F5EE",
      des: "Phân loại tin nhắn Zalo OA theo chủ đề như chăm sóc, khuyến mãi, nhắc lịch hẹn để tổ chức chiến dịch rõ ràng và dễ quản lý hơn."
    },
   
    {
      title: "Khai báo mẫu Zalo",
      is_tab: "tab_two",
      icon: "TemplateZalo",
      backgroundColor: "#E6F1FB",
      des: "Tạo và quản lý các mẫu tin nhắn Zalo OA có nội dung động (tên khách hàng, số điểm, mã đơn hàng…) dùng cho chiến dịch gửi hàng loạt qua Zalo OA."
    },
  ].filter((e) => e);

  return (
    <div className="page-setting-zalo">
      {!isDetail && <TitleAction title="Cài đặt Zalo" />}
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
        <TemplateCategoryZalo
          titleProps="Cài đặt Zalo"
          nameProps="Chủ đề Zalo"
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      
      ) : (
        isDetail && (
          <TemplateZaloList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
        )
      )}
    </div>
  );
}
