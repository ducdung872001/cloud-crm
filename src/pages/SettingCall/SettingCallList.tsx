import React, { useState } from "react";
import HeaderTabMenu from "components/HeaderTabMenu/HeaderTabMenu";
import TitleAction from "components/titleAction/titleAction";
import PartnerCallList from "./partials/PartnerCall/PartnerCallList";
import ConfigCallList from "./partials/ConfigCall/ConfigCallList";
import ConfigSwitchboardList from "./partials/ConfigSwitchboard/SwitchboardList";
import { getPermissions } from "utils/common";
import "./SettingCallList.scss";
import { getDomain } from "reborn-util";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingCallList(props: any) {
  document.title = "Cài đặt Tổng đài";

  const { onBackProps, titleBack } = props;

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const groups = [
    {
      label: "CẤU HÌNH KỸ THUẬT",
      items: [
        {
          title: "Cấu hình Tổng đài",
          is_tab: "tab_one",
          icon: "CallCenterConfig",
          backgroundColor: "#FAEEDA",
          des: "Thiết lập thông số kỹ thuật tổng đài như số đường dây, kịch bản IVR, giờ làm việc và phân luồng cuộc gọi đến.",
        },
        ...(sourceDomain === "rebornjsc.reborn.vn" ? [{
          title: "Đối tác Tổng đài",
          is_tab: "tab_two",
          icon: "PartnerSms",
          backgroundColor: "#E1F5EE",
          des: "Quản lý danh sách nhà cung cấp dịch vụ tổng đài tích hợp với hệ thống.",
        }] : []),
      ],
    },
    {
      label: "TÍCH HỢP",
      items: [
        {
          title: "Tích hợp Tổng đài",
          is_tab: "tab_three",
          icon: "CallCenterIntegration",
          backgroundColor: "#EEEDFE",
          des: "Kết nối hệ thống tổng đài với CRM để tự động ghi nhận cuộc gọi, hiển thị thông tin khách hàng và đồng bộ lịch sử liên lạc.",
        },
      ],
    },
  ];

  return (
    <div className="page-setting-call">
      {!isDetail && onBackProps ? (
        <HeaderTabMenu
          titleBack={titleBack || "Kênh liên lạc"}
          title="Cài đặt Tổng đài"
          onBackProps={onBackProps}
        />
      ) : !isDetail ? (
        <TitleAction title="Cài đặt Tổng đài" />
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
        <ConfigCallList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_two" ? (
        <PartnerCallList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : isDetail && tab === "tab_three" ? (
        <ConfigSwitchboardList onBackProps={(isBack: boolean) => { if (isBack) setIsDetail(false); }} />
      ) : null}
    </div>
  );
}