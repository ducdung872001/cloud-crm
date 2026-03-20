import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import PartnerCallList from "./partials/PartnerCall/PartnerCallList";
import ConfigCallList from "./partials/ConfigCall/ConfigCallList";
import ConfigSwitchboardList from "./partials/ConfigSwitchboard/SwitchboardList";
import { getPermissions } from "utils/common";
import "./SettingCallList.scss";
import { getDomain } from "reborn-util";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingCallList() {
  document.title = "Cài đặt Tổng đài";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const listTab = [
    // permissions["GLOBAL_CONFIG_VIEW"] == 1
    //   ? {
    //     title: "Cấu hình Tổng đài",
    //     is_tab: "tab_one",
    //   }
    //   : null,

    {
      title: "Cấu hình Tổng đài",
      is_tab: "tab_one",
      icon: "CallCenterConfig",
      backgroundColor: "#FAEEDA",
      strokeColor: "rgb(133, 79, 11)",
      des: "Thiết lập thông số kỹ thuật tổng đài như số đường dây, kịch bản IVR, giờ làm việc và phân luồng cuộc gọi đến."
    },

    // permissions["GLOBAL_CONFIG_VIEW"] == 1
    //   ? {
    //     title: "Đối tác Tổng đài",
    //     is_tab: "tab_two",
    //   }
    //   : null,
    ...(sourceDomain == "rebornjsc.reborn.vn" ?
    [
      {
        title: "Đối tác Tổng đài",
        is_tab: "tab_two",
      }
    ] : []), 

    {
      title: "Tích hợp Tổng đài",
      is_tab: "tab_three",
      icon: "CallCenterIntegration",
      backgroundColor: "#EEEDFE",
      strokeColor: "rgb(83, 74, 183)",
      des: "Kết nối hệ thống tổng đài với CRM để tự động ghi nhận cuộc gọi, hiển thị thông tin khách hàng và đồng bộ lịch sử liên lạc."
    }
  ].filter((e) => e);

  return (
    <div className="page-setting-call">
      {!isDetail && <TitleAction title="Cài đặt Tổng đài" />}
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
        <ConfigCallList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <PartnerCallList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <ConfigSwitchboardList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
