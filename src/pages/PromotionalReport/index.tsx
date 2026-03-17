import React from "react";
import PromotionDashboard from "./partials/PromotionDashboard";

export default function PromotionalReport(props) {
  const { onBackProps } = props;
  return (
    <div>
      <PromotionDashboard 
        onBackProps={onBackProps}
      />
    </div>
  );
}
