import React, { useState } from "react";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

// SMS
import ConfigSMSList from "pages/SettingSMS/partials/ConfigSMS/ConfigSMSList";
import PartnerSMSList from "pages/SettingSMS/partials/PartnerSMS/PartnerSMSList";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
import BrandNameList from "pages/SettingSMS/partials/BrandName/BrandNameList";
import TemplateSMSList from "pages/SettingSMS/partials/TemplateSMS/TemplateSMSList";

// Email
import ConfigEmailList from "pages/SettingEmail/partials/ConfigEmail/ConfigEmailList";
import PartnerEmailList from "pages/SettingEmail/partials/PartnerEmail/PartnerEmailList";
import DeclareEmailList from "pages/SettingEmail/partials/DeclareEmail/DeclareEmailList";
import TemplateEmailList from "pages/SettingEmail/partials/TemplateEmail/TemplateEmailList";

// Zalo
import TemplateCategoryZalo from "pages/SettingZalo/partials/TemplateCategoryZalo/TemplateCategoryZalo";
import TemplateZaloList from "pages/SettingZalo/partials/TemplateZaloList/TemplateZaloList";

// Tổng đài
import ConfigCallList from "pages/SettingCall/partials/ConfigCall/ConfigCallList";
import PartnerCallList from "pages/SettingCall/partials/PartnerCall/PartnerCallList";
import ConfigSwitchboardList from "pages/SettingCall/partials/ConfigSwitchboard/SwitchboardList";

import { getPermissions } from "utils/common";
import { getDomain } from "reborn-util";

/**
 * Menu cấp 1: "Kênh liên lạc khách hàng"  →  /setting_channels
 * 
 * Nhãn nhóm = kênh (SMS / Email / Zalo / Tổng đài)
 * Item trong nhóm = chức năng cụ thể → render inline (không navigate)
 * 
 * Breadcrumb khi vào item: "Kênh liên lạc > [tên item]"
 */
export default function SettingChannels() {
  document.title = "Kênh liên lạc";

  const [tab, setTab] = useState<string>("");
  const [tabLabel, setTabLabel] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [permissions] = useState(getPermissions());
  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const groups = [
    {
      label: "SMS (Cấu hình - đối tác - chủ đề - mẫu)",
      items: [
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Cấu hình SMS",
          is_tab: "sms_config",
          icon: "SmsConfig",
          backgroundColor: "#E6F1FB",
          des: "Kết nối nhà cung cấp SMS, nhập API key và cấu hình thông số kỹ thuật gửi tin.",
        } : null,
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Danh mục đối tác SMS",
          is_tab: "sms_partner",
          icon: "PartnerSms",
          backgroundColor: "#E1F5EE",
          des: "Quản lý danh sách nhà cung cấp dịch vụ SMS tích hợp với hệ thống.",
        } : null,
        {
          title: "Chủ đề SMS",
          is_tab: "sms_topic",
          icon: "TopicSms",
          backgroundColor: "#FAEEDA",
          des: "Phân loại tin nhắn theo chủ đề để quản lý chiến dịch rõ ràng hơn.",
        },
        {
          title: "Khai báo Brandname",
          is_tab: "sms_brand",
          icon: "DeclarationBrandName",
          backgroundColor: "#EEEDFE",
          des: "Đăng ký tên thương hiệu hiển thị thay số điện thoại khi gửi SMS.",
        },
        {
          title: "Mẫu tin nhắn SMS",
          is_tab: "sms_template",
          icon: "DeclarationTemplateSms",
          backgroundColor: "#EAF3DE",
          des: "Tạo và quản lý các mẫu nội dung SMS có biến động dùng cho chiến dịch hàng loạt.",
        },
      ].filter(Boolean),
    },
    {
      label: "Email (SMTP - đối tác - chủ đề - mẫu)",
      items: [
        permissions["GLOBAL_CONFIG_VIEW"] == 1 ? {
          title: "Cấu hình Email",
          is_tab: "email_config",
          icon: "EmailConfig",
          backgroundColor: "#E6F1FB",
          des: "Thiết lập máy chủ SMTP/API gửi email, xác thực tên miền.",
        } : null,
        permissions["PARTNER_EMAIL_VIEW"] == 1 ? {
          title: "Danh mục đối tác Email",
          is_tab: "email_partner",
          icon: "PartnerEmail",
          backgroundColor: "#E1F5EE",
          des: "Quản lý nhà cung cấp dịch vụ Email marketing (SendGrid, Mailgun…).",
        } : null,
        {
          title: "Chủ đề Email",
          is_tab: "email_topic",
          icon: "TopicEmail",
          backgroundColor: "#FAEEDA",
          des: "Phân loại email theo chủ đề để tổ chức chiến dịch rõ ràng hơn.",
        },
        {
          title: "Khai báo nguồn gửi Email",
          is_tab: "email_source",
          icon: "SourceEmail",
          backgroundColor: "#EEEDFE",
          des: "Đăng ký địa chỉ và tên hiển thị người gửi (From name / From address).",
        },
        {
          title: "Mẫu Email",
          is_tab: "email_template",
          icon: "TemplateEmail",
          backgroundColor: "#FAECE7",
          des: "Tạo và quản lý các mẫu nội dung email có biến động cho chiến dịch hàng loạt.",
        },
      ].filter(Boolean),
    },
    {
      label: "Zalo OA (Chủ đề - mẫu tin)",
      items: [
        {
          title: "Chủ đề Zalo",
          is_tab: "zalo_topic",
          icon: "TopicZalo",
          backgroundColor: "#E1F5EE",
          des: "Phân loại tin nhắn Zalo OA theo chủ đề để tổ chức chiến dịch rõ ràng.",
        },
        {
          title: "Mẫu tin nhắn Zalo",
          is_tab: "zalo_template",
          icon: "TemplateZalo",
          backgroundColor: "#E6F1FB",
          des: "Tạo và quản lý mẫu tin nhắn Zalo OA có nội dung động cho chiến dịch hàng loạt.",
        },
      ],
    },
    {
      label: "Tổng đài (SIP config - IVR - tích hợp)",
      items: [
        {
          title: "Cấu hình Tổng đài",
          is_tab: "call_config",
          icon: "CallCenterConfig",
          backgroundColor: "#FAEEDA",
          des: "Thiết lập số đường dây, kịch bản IVR, giờ làm việc và phân luồng cuộc gọi đến.",
        },
        ...(sourceDomain === "rebornjsc.reborn.vn" ? [{
          title: "Đối tác Tổng đài",
          is_tab: "call_partner",
          icon: "PartnerSms",
          backgroundColor: "#E1F5EE",
          des: "Quản lý nhà cung cấp dịch vụ tổng đài tích hợp với hệ thống.",
        }] : []),
        {
          title: "Tích hợp Tổng đài",
          is_tab: "call_integration",
          icon: "CallCenterIntegration",
          backgroundColor: "#EEEDFE",
          des: "Kết nối tổng đài với CRM để tự động ghi nhận cuộc gọi và đồng bộ lịch sử.",
        },
      ],
    },
  ];

  const back = () => { setIsDetail(false); setTab(""); setTabLabel(""); };

  return (
    <div className="page-setting-channels">
      {!isDetail && <h1>Kênh liên lạc</h1>}
      {!isDetail && (
        <TabMenuList
          groups={groups}
          onClick={(item: any) => {
            setTab(item.is_tab);
            setTabLabel(item.title);
            setIsDetail(true);
          }}
        />
      )}

      {/* Breadcrumb khi vào item */}
      {isDetail && (
        <HeaderTabMenu
          title={tabLabel}
          titleBack="Kênh liên lạc"
          onBackProps={back}
        />
      )}

      {/* ── SMS ── */}
      {isDetail && tab === "sms_config"   && <ConfigSMSList      onBackProps={back} />}
      {isDetail && tab === "sms_partner"  && <PartnerSMSList     onBackProps={back} />}
      {isDetail && tab === "sms_topic"    && <TemplateCategoryList titleProps="Kênh liên lạc" nameProps="Chủ đề SMS" typeProps="1" onBackProps={back} />}
      {isDetail && tab === "sms_brand"    && <BrandNameList       onBackProps={back} />}
      {isDetail && tab === "sms_template" && <TemplateSMSList     onBackProps={back} />}

      {/* ── Email ── */}
      {isDetail && tab === "email_config"   && <ConfigEmailList   onBackProps={back} />}
      {isDetail && tab === "email_partner"  && <PartnerEmailList  onBackProps={back} />}
      {isDetail && tab === "email_topic"    && <TemplateCategoryList titleProps="Kênh liên lạc" nameProps="Chủ đề Email" typeProps="2" onBackProps={back} />}
      {isDetail && tab === "email_source"   && <DeclareEmailList  onBackProps={back} />}
      {isDetail && tab === "email_template" && <TemplateEmailList onBackProps={back} />}

      {/* ── Zalo ── */}
      {isDetail && tab === "zalo_topic"    && <TemplateCategoryZalo titleProps="Kênh liên lạc" nameProps="Chủ đề Zalo" onBackProps={back} />}
      {isDetail && tab === "zalo_template" && <TemplateZaloList     onBackProps={back} />}

      {/* ── Tổng đài ── */}
      {isDetail && tab === "call_config"      && <ConfigCallList        onBackProps={back} />}
      {isDetail && tab === "call_partner"     && <PartnerCallList       onBackProps={back} />}
      {isDetail && tab === "call_integration" && <ConfigSwitchboardList onBackProps={back} />}
    </div>
  );
}