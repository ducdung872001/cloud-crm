import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CustomerCarePage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import CallCenterList from "../CallCenter/CallCenterList";
import TicketList from "../Ticket/TicketList";

export default function CustomerCarePage() {
  document.title = "Chăm sóc khách hàng";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Tiếp nhận hỗ trợ",
      tab: 1,
    },

    {
      title: "Lịch sử chăm sóc",
      tab: 2,
    },
    {
      title: "Cuộc gọi CSKH",
      tab: 3,
    },
    {
      title: "Đánh giá khách hàng",
      tab: 4,
    },
  ];

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Chăm sóc khách hàng" />}
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
        <TicketList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 3 ? (
        <CallCenterList
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
