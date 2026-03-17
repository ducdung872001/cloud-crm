import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MemberCustomersPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import LoyaltyWallet from "../LoyaltyWallet";
import DashboardLoyalty from "../DashboardLoyalty";
import LoyaltyPointLedger from "../LoyaltyPointLedger";

export default function MemberCustomersPage() {
  document.title = "Khuyến mãi";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh sách thành viên",
      tab: 1,
    },

    {
      title: "Hạng thành viên",
      tab: 2,
    },
    {
      title: "Tích điểm",
      tab: 3,
    },
    {
      title: "Lịch sử điểm",
      tab: 4,
    },
    {
      title: "Đổi điểm",
      tab: 5,
    },
  ];

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Khách hàng thành viên" />}
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
        <LoyaltyWallet
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 4 ? (
        <LoyaltyPointLedger
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 3 ? (
        <DashboardLoyalty
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
