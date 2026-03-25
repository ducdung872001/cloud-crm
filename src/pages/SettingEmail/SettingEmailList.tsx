import React, { useState } from "react";
import HeaderTabMenu from "components/HeaderTabMenu/HeaderTabMenu";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
import PartnerEmailList from "./partials/PartnerEmail/PartnerEmailList";
import DeclareEmailList from "./partials/DeclareEmail/DeclareEmailList";
import TemplateEmailList from "./partials/TemplateEmail/TemplateEmailList";
import ConfigEmailList from "./partials/ConfigEmail/ConfigEmailList";
import { getPermissions } from "utils/common";
import "./SettingEmailList.scss";
import { getSearchParameters } from "reborn-util";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingEmailList(props: any) {
  document.title = "Cài đặt Email";

  const { onBackProps, titleBack } = props;

  const takeParamsUrl = getSearchParameters();
  const tabParamUrl = takeParamsUrl && takeParamsUrl?.tab;

  const [tab, setTab] = useState<string>(() => tabParamUrl ? tabParamUrl : "");
  const [isDetail, setIsDetail] = useState<boolean>(() => !!tabParamUrl);
  const [permissions] = useState(getPermissions());

  const groups = [
    {
      label: "CẤU HÌNH KỸ THUẬT",
      items: [
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Cấu hình Email",
          is_tab: "tab_one",
          icon: "EmailConfig",
          backgroundColor: "#E6F1FB",
          des: "Thiết lập máy chủ SMTP/API gửi email, xác thực tên miền và các thông số kết nối kỹ thuật.",
        } : null,
        permissions["PARTNER_EMAIL_VIEW"] == 1 ? {
          title: "Danh mục đối tác Email",
          is_tab: "tab_three",
          icon: "PartnerEmail",
          backgroundColor: "#E1F5EE",
          des: "Quản lý danh sách nhà cung cấp dịch vụ Email marketing tích hợp với hệ thống (SendGrid, Mailgun…).",
        } : null,
        {
          title: "Khai báo nguồn gửi Email",
          is_tab: "tab_four",
          icon: "SourceEmail",
          backgroundColor: "#EEEDFE",
          des: "Đăng ký địa chỉ email và tên hiển thị người gửi (From name / From address) để xác thực và tránh bị đánh dấu spam.",
        },
      ].filter(Boolean),
    },
    {
      label: "NỘI DUNG & MẪU EMAIL",
      items: [
        {
          title: "Chủ đề Email",
          is_tab: "tab_two",
          icon: "TopicEmail",
          backgroundColor: "#FAEEDA",
          des: "Phân loại email theo chủ đề như chào mừng, khuyến mãi, nhắc lịch để tổ chức chiến dịch rõ ràng hơn.",
        },
        {
          title: "Khai báo mẫu Email",
          is_tab: "tab_five",
          icon: "TemplateEmail",
          backgroundColor: "#FAECE7",
          des: "Tạo và quản lý các mẫu nội dung email có biến động (tên khách hàng, mã đơn hàng, link xác nhận…) dùng cho các chiến dịch gửi hàng loạt.",
        },
      ],
    },
  ];

  return (
    <div className="page-setting-email">
      {!isDetail && onBackProps ? (
        <HeaderTabMenu
          titleBack={titleBack || "Kênh liên lạc"}
          title="Cài đặt Email"
          onBackProps={onBackProps}
        />
      ) : !isDetail ? (
        <TitleAction title="Cài đặt Email" />
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
        <ConfigEmailList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_two" ? (
        <TemplateCategoryList titleProps="Cài đặt Email" nameProps="Chủ đề Email" typeProps="2"
          onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_three" ? (
        <PartnerEmailList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_four" ? (
        <DeclareEmailList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : (
        isDetail && (
          <TemplateEmailList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
        )
      )}
    </div>
  );
}