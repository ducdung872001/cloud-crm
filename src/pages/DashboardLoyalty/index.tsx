import React from "react";
import RetentionRateChart from "./partials/RetentionRate";
import CLVChart from "./partials/CLVChart";
import LoyaltyPointsChart from "./partials/LoyaltyPointsChart";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

export default function DashboardLoyalty(props) {
  const { onBackProps } = props;
  return (
    <div>
      <HeaderTabMenu
        title="Tích điểm"
        titleBack="Khách hàng thành viên"
        onBackProps={onBackProps}
      />
      <RetentionRateChart />
      <CLVChart />
      <LoyaltyPointsChart />
    </div>
  );
}
