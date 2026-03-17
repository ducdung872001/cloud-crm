import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MarketingCampaignPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import SMSMarkettingList from "../SMSMarketting/SMSMarkettingList";
import ZaloMarketting from "../ZaloMarketting/ZaloMarketting";
import EmailMarkettingList from "../EmailMarketting/EmailMarkettingList";

export default function MarketingCampaignPage() {
  document.title = "Chiến dịch Marketing";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "SMS Marketing",
      icon: "SmsMenu",
      tab: 1,
    },

    {
      title: "Zalo / OTT",
      icon: "ZaloMenu",
      tab: 2,
    },
    {
      title: "Email Marketing",
      icon: "EmailMenu",
      tab: 3,
    },
    {
      title: "Thông báo qua App",
      icon: "BellMenu",
      tab: 4,
    },
    {
      title: "Lịch sử chiến dịch",
      tab: 5,
    },
  ];

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Chiến dịch Marketing" />}
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
        <SMSMarkettingList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === 2 ? (
        <ZaloMarketting
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}
      
      {isDetail && tab === 3 ? (
        <EmailMarkettingList
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
