import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingLoyalty.scss";
import { getDomain } from "reborn-util";
import SettingLoyaltyList from "@/pages/SettingLoyaltyList";
import LoyaltySegment from "@/pages/LoyaltySegment";
import LoyaltyReward from "@/pages/LoyaltyReward";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import ExchangeRatePanel from "./ExchangeRatePanel";

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function SettingLoyalty({ onBackProps }: Props = {}) {
  document.title = "Cài đặt hệ thống tích điểm";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Quy tắc tích điểm",
      is_tab: "tab_one",
      des: "Thiết lập quy tắc tích điểm và ưu đãi cho chương trình khách hàng thân thiết",
      icon: "AccumulatePoints",
      backgroundColor: "#E1F5EE",
      strokeColor: "#27ae60",
    },
    {
      title: "Phần thưởng & Đổi điểm",
      is_tab: "tab_two",
      des: "Quản lý phần thưởng và thiết lập chương trình đổi điểm lấy quà, voucher cho hội viên",
      icon: "ExchangePoints",
      backgroundColor: "#FAECE7",
      strokeColor: "#e17055",
    },
    {
      title: "Tỷ lệ quy đổi điểm",
      is_tab: "tab_exchange",
      des: "Cấu hình 1 điểm tích lũy tương đương bao nhiêu VND khi khách thanh toán bằng điểm",
      icon: "PointsSettingMenu",
      backgroundColor: "#EEF2FF",
      strokeColor: "#6c5ce7",
    },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && (
        onBackProps
          ? <HeaderTabMenu title="Quy tắc tích điểm" titleBack="Khách hàng thành viên" onBackProps={onBackProps} />
          : <TitleAction title="Cài đặt hệ thống tích điểm" />
      )}
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
      ) : isDetail && tab === "tab_exchange" ? (
        <ExchangeRatePanel
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
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