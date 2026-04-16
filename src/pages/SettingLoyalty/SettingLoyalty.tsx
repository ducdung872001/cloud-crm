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
import PointExpiryConfig from "./PointExpiryConfig";
import AutoTierConfig from "./AutoTierConfig";
import LoyaltyScopeConfig from "./LoyaltyScopeConfig";

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function SettingLoyalty({ onBackProps }: Props = {}) {
  document.title = "Cấu hình Loyalty";

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
    {
      title: "Hạn sử dụng điểm",
      is_tab: "tab_expiry",
      des: "Cấu hình điểm hết hạn sau bao lâu — cuối năm, sau X tháng, hoặc không hết hạn",
      icon: "CalendarTime",
      backgroundColor: "#FFF7ED",
      strokeColor: "#F5A623",
    },
    {
      title: "Thăng / hạ hạng tự động",
      is_tab: "tab_tier_eval",
      des: "Tự động đánh giá và thay đổi hạng thành viên theo chu kỳ (tháng/quý/năm)",
      icon: "TrendUp",
      backgroundColor: "#ECFDF5",
      strokeColor: "#22C55E",
    },
    {
      title: "Phạm vi áp dụng",
      is_tab: "tab_scope",
      des: "Loyalty áp dụng toàn chuỗi, theo thương hiệu, hoặc theo nhóm cửa hàng",
      icon: "Branch",
      backgroundColor: "#EFF6FF",
      strokeColor: "#3B82F6",
    },
  ];

  return (
    <div className="page-setting-customer">
      {!isDetail && (
        onBackProps
          ? <HeaderTabMenu title="Cấu hình Loyalty" titleBack="Hội viên" onBackProps={onBackProps} />
          : <TitleAction title="Cấu hình Loyalty" />
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
      ) : isDetail && tab === "tab_expiry" ? (
        <PointExpiryConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_tier_eval" ? (
        <AutoTierConfig
          onBackProps={(isBack) => {
            if (isBack) setIsDetail(false);
          }}
        />
      ) : isDetail && tab === "tab_scope" ? (
        <LoyaltyScopeConfig
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