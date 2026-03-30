import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingLoyalty.scss";
import { getDomain } from "reborn-util";
import SettingLoyaltyList from "@/pages/SettingLoyaltyList";
import LoyaltySegment from "@/pages/LoyaltySegment";
import LoyaltyReward from "@/pages/LoyaltyReward";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import ExchangeRatePanel from "./ExchangeRatePanel";

export default function SettingLoyalty() {
  document.title = "Cài đặt hệ thống tích điểm";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));
  const checkSubdomainTNEX = sourceDomain.includes("tnex");

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Cài đặt tên quy tắc tích điểm",
      is_tab: "tab_one",
      des: "Thiết lập quy tắc tích điểm và ưu đãi cho chương trình khách hàng thân thiết"
    },
    {
      title: "Danh sách phần thưởng",
      is_tab: "tab_two",
      des: "Quản lý các phần thưởng, quà tặng và voucher dùng để đổi điểm cho hội viên"
    },
    {
      title: "Tỷ lệ quy đổi điểm",
      is_tab: "tab_exchange",
      des: "Cấu hình 1 điểm tích lũy tương đương bao nhiêu VND khi khách thanh toán bằng điểm"
    },
    // {
    //   title: "Cài đặt hạng hội viên",
    //   is_tab: "tab_three",
    //   des: "Định nghĩa các hạng thành viên, ngưỡng điểm thăng hạng và quyền lợi tương ứng"
    // },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && <TitleAction title="Cài đặt hệ thống tích điểm" />}
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