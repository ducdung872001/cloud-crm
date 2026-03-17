import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./PromotionPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import PromotionalProgram from "@/pages/PromotionalProgram";
import PromotionDashboard from "../PromotionalReport/partials/PromotionDashboard";

export default function PromotionPage() {
  document.title = "Khuyến mãi";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Chương trình khuyến mãi",
      icon: "PromotionMenu",
      tab: 1,
    },

    {
      title: "Mã giảm giá",
      icon: "ProcessConfigMenu",
      tab: 2,
    },
    {
      title: "Combo khuyến mãi",
      icon: "LoyaltyMenu",
      tab: 3,
    },
    {
      title: "Báo cáo khuyến mãi",
      icon: "PromoReportMenu",
      tab: 4,
    },
  ];

  return (
    <div className="page-content page-promotion">
      {!isDetail && <TitleAction title="Khuyến mãi" />}
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

      {isDetail && tab === 1 ? (
        <PromotionalProgram
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 4 ? (
        <PromotionDashboard
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }
    </div>
  );
}
