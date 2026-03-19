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
      backgroundColor: "#E6F1FB",
      strokeColor: "#185fa5",
      icon: "ReceiveTicketCSKH",
      des: "Tiếp nhận và xử lý yêu cầu hỗ trợ từ khách hàng qua nhiều kênh liên lạc"
    },

    {
      title: "Lịch sử chăm sóc",
      tab: 2,
      backgroundColor: "#E1F5EE",
      strokeColor: "#0f6e56",
      icon: "CareHistory",
      des: "Xem lại toàn bộ tương tác, cuộc gọi và lịch sử chăm sóc của từng khách hàng"
    },
    {
      title: "Cuộc gọi CSKH",
      tab: 3,
      backgroundColor: "#FAEEDA",
      strokeColor: "#854f0b",
      icon: "CallCenter",
      des: "Quản lý các cuộc gọi chăm sóc khách hàng, ghi chú và phân loại kết quả"
    },
    {
      title: "Đánh giá khách hàng",
      tab: 4,
      backgroundColor: "#EAF3DE",
      strokeColor: "#3b6d11",
      icon: "RateCustomer",
      des: "Thu thập và phân tích phản hồi, đánh giá mức độ hài lòng của khách hàng"
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
