import React from "react";
import RetentionRateChart from "./partials/RetentionRate";
import CLVChart from "./partials/CLVChart";
import LoyaltyPointsChart from "./partials/LoyaltyPointsChart";

export default function DashboardLoyalty() {
  return (
    <div>
      <RetentionRateChart />
      <CLVChart />
      <LoyaltyPointsChart />
    </div>
  );
}
