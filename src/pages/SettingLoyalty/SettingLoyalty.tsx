import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingLoyalty.scss";
import { getDomain } from "reborn-util";
import SettingLoyaltyList from "@/pages/SettingLoyaltyList";
import LoyaltySegment from "@/pages/LoyaltySegment";
import LoyaltyReward from "@/pages/LoyaltyReward";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingLoyalty() {
  document.title = "Cài đặt hệ thống tích điểm";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Cài đặt chương trình khách hàng thân thiết",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách phần thưởng",
      is_tab: "tab_two",
    },
    {
      title: "Cài đặt hạng hội viên",
      is_tab: "tab_three",
    },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && <TitleAction title="Cài đặt hệ thống tích điểm" />}
      <div className="d-flex flex-column">
        {!isDetail && (
          <TabMenuList
            listTab={listTab}
            onClick={(item) => {
                setTab(item.tab);
                setIsDetail(true);
            }}
          />
        )}
      </div>
      {isDetail && tab === "tab_one" ? (
        <SettingLoyaltyList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <LoyaltyReward
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <LoyaltySegment
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
