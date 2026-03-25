import React, { useState } from "react";
import HeaderTabMenu from "components/HeaderTabMenu/HeaderTabMenu";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
import PartnerSMSList from "./partials/PartnerSMS/PartnerSMSList";
import BrandNameList from "./partials/BrandName/BrandNameList";
import TemplateSMSList from "./partials/TemplateSMS/TemplateSMSList";
import ConfigSMSList from "./partials/ConfigSMS/ConfigSMSList";
import { getPermissions } from "utils/common";
import "./SettingSMSList.scss";
import WhiteList from "./partials/WhiteList/WhiteList";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingSMSList(props: any) {
  document.title = "Cài đặt SMS";

  // onBackProps: khi render inline từ SettingChannels → hiện breadcrumb
  // khi truy cập trực tiếp qua route /setting_sms → không có onBackProps → hiện TitleAction bình thường
  const { onBackProps, titleBack } = props;

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [permissions] = useState(getPermissions());

  const groups = [
    {
      label: "CẤU HÌNH KỸ THUẬT",
      items: [
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Cấu hình SMS",
          is_tab: "tab_one",
          backgroundColor: "#E6F1FB",
          icon: "SmsConfig",
          des: "Kết nối nhà cung cấp SMS, nhập API key và cấu hình thông số kỹ thuật gửi tin.",
        } : null,
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Danh mục đối tác SMS",
          is_tab: "tab_three",
          backgroundColor: "#E1F5EE",
          icon: "PartnerSms",
          des: "Quản lý danh sách nhà cung cấp dịch vụ SMS tích hợp với hệ thống.",
        } : null,
        {
          title: "Khai báo Brandname",
          is_tab: "tab_four",
          backgroundColor: "#EEEDFE",
          icon: "DeclarationBrandName",
          des: "Đăng ký tên thương hiệu (Brandname) hiển thị thay số điện thoại khi gửi SMS đến khách hàng.",
        },
      ].filter(Boolean),
    },
    {
      label: "NỘI DUNG & MẪU TIN",
      items: [
        {
          title: "Chủ đề SMS",
          is_tab: "tab_two",
          backgroundColor: "#FAEEDA",
          icon: "TopicSms",
          des: "Phân loại tin nhắn theo chủ đề như chăm sóc, khuyến mãi, nhắc hẹn để quản lý chiến dịch rõ ràng hơn.",
        },
        {
          title: "Khai báo mẫu tin nhắn SMS",
          is_tab: "tab_five",
          backgroundColor: "#EAF3DE",
          icon: "DeclarationTemplateSms",
          des: "Tạo và quản lý các mẫu nội dung tin nhắn SMS có biến động (tên KH, số điểm, mã OTP...) dùng cho các chiến dịch gửi hàng loạt.",
        },
      ],
    },
  ];

  const handleBack = () => { if (onBackProps) onBackProps(true); };

  return (
    <div className="page-setting-sms">
      {!isDetail && onBackProps ? (
        <HeaderTabMenu
          titleBack={titleBack || "Kênh liên lạc"}
          title="Cài đặt SMS"
          onBackProps={onBackProps}
        />
      ) : !isDetail ? (
        <TitleAction title="Cài đặt SMS" />
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
        <ConfigSMSList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_two" ? (
        <TemplateCategoryList titleProps="Cài đặt SMS" nameProps="Chủ đề SMS" typeProps="1"
          onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_three" ? (
        <PartnerSMSList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_four" ? (
        <BrandNameList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_six" ? (
        <WhiteList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : (
        isDetail && (
          <TemplateSMSList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
        )
      )}
    </div>
  );
}