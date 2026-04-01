import React, { useState } from "react";
import HeaderTabMenu from "components/HeaderTabMenu/HeaderTabMenu";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryZalo from "./partials/TemplateCategoryZalo/TemplateCategoryZalo";
import TemplateZaloList from "./partials/TemplateZaloList/TemplateZaloList";
import "./SettingZalo.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingZalo(props: any) {
  document.title = "Cài đặt Zalo";

  const { onBackProps, titleBack } = props;

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const groups = [
    {
      label: "NỘI DUNG & MẪU TIN NHẮN",
      items: [
        {
          title: "Chủ đề Zalo",
          is_tab: "tab_one",
          icon: "TopicZalo",
          backgroundColor: "#E1F5EE",
          des: "Phân loại tin nhắn Zalo OA theo chủ đề như chăm sóc, khuyến mãi, nhắc lịch hẹn để tổ chức chiến dịch rõ ràng và dễ quản lý hơn.",
        },
        {
          title: "Khai báo mẫu Zalo",
          is_tab: "tab_two",
          icon: "TemplateZalo",
          backgroundColor: "#E6F1FB",
          des: "Tạo và quản lý các mẫu tin nhắn Zalo OA có nội dung động (tên khách hàng, số điểm, mã đơn hàng…) dùng cho chiến dịch gửi hàng loạt qua Zalo OA.",
        },
      ],
    },
  ];

  return (
    <div className="page-setting-zalo">
      {!isDetail && onBackProps ? (
        <HeaderTabMenu
          titleBack={titleBack || "Kênh liên lạc"}
          title="Cài đặt Zalo"
          onBackProps={onBackProps}
        />
      ) : !isDetail ? (
        <TitleAction title="Cài đặt Zalo" />
      ) : null}

      <div className="d-flex flex-column">
        {!isDetail && (
          <TabMenuList
            groups={groups}
            onClick={(item: any) => { setTab(item.is_tab); setIsDetail(true); }}
          />
        )}
      </div>

      {isDetail && tab === "tab_one" ? (
        <TemplateCategoryZalo titleProps="Cài đặt Zalo" nameProps="Chủ đề Zalo"
          onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : (
        isDetail && (
          <TemplateZaloList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
        )
      )}
    </div>
  );
}