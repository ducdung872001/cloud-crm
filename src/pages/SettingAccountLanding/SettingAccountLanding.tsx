import React, { useState } from "react";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import SettingAccount from "pages/SettingAccount/SettingAccount";
import ReportLogin from "pages/ReportLogin/ReportLogin";

/**
 * Menu cấp 1: "Tài khoản & bảo mật"  →  /setting_account
 * Items cấp 2: Thông tin cá nhân & đổi mật khẩu | Kết nối Gmail/Outlook |
 *              Thông tin gói dịch vụ | Nhật ký đăng nhập
 * 
 * Note: SettingAccount hiện có tất cả 3 mục đầu trong 1 trang cuộn
 * → card 1,2,3 đều vào SettingAccount, card 4 vào ReportLogin
 */
export default function SettingAccountLanding() {
  document.title = "Tài khoản & bảo mật";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Thông tin cá nhân & đổi mật khẩu",
      is_tab: "profile",
      icon: "PersonalMenu",
      backgroundColor: "#E6F1FB",
      des: "Xem và cập nhật họ tên, ngày sinh, số điện thoại, email và thay đổi mật khẩu.",
    },
    {
      title: "Kết nối Gmail / Outlook",
      is_tab: "connect",
      icon: "EmailMenu",
      backgroundColor: "#E1F5EE",
      des: "Liên kết tài khoản Gmail hoặc Outlook để gửi email trực tiếp từ CRM.",
    },
    {
      title: "Thông tin gói dịch vụ",
      is_tab: "package",
      icon: "IntegrationMenu",
      backgroundColor: "#EEEDFE",
      des: "Xem thông tin gói dịch vụ đang sử dụng và các gói liên quan.",
    },
    {
      title: "Nhật ký đăng nhập",
      is_tab: "login_log",
      icon: "LoginMenu",
      backgroundColor: "#FAEEDA",
      des: "Theo dõi lịch sử đăng nhập của nhân viên — thời gian, thiết bị và địa chỉ IP.",
    },
  ];

  return (
    <div className="page-setting-account-landing">
      {!isDetail && <h1>Tài khoản &amp; bảo mật</h1>}
      {!isDetail && (
        <TabMenuList
          listTab={listTab}
          onClick={(item: any) => { setTab(item.is_tab); setIsDetail(true); }}
        />
      )}

      {/* profile, connect, package → đều vào SettingAccount (trang cuộn 1 trang) */}
      {isDetail && (tab === "profile" || tab === "connect" || tab === "package") && (
        <SettingAccount onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />
      )}
      {isDetail && tab === "login_log" && (
        <ReportLogin onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />
      )}
    </div>
  );
}
