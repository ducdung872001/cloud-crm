import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CustomerCarePage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import CallCenterList from "../CallCenter/CallCenterList";
import TicketList from "../Ticket/TicketList";
import CareHistory from "../CareHistory";
import CareAutomationPage from "../CareAutomation/CareAutomationPage";

export default function CustomerCarePage() {
  document.title = "Chăm sóc khách hàng";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Phiếu hỗ trợ",
      tab: 1,
      backgroundColor: "#E6F1FB",
      icon: "ReceiveTicketCSKH",
      des: "Quản lý toàn bộ phiếu hỗ trợ từ khách hàng, theo dõi trạng thái xử lý và phân công bộ phận",
    },
    {
      title: "Lịch sử chăm sóc",
      tab: 2,
      backgroundColor: "#E1F5EE",
      icon: "CareHistory",
      des: "Xem lại toàn bộ tương tác, cuộc gọi và lịch sử chăm sóc của từng khách hàng",
    },
    {
      title: "Cuộc gọi CSKH",
      tab: 3,
      backgroundColor: "#FAEEDA",
      icon: "CallCenter",
      des: "Quản lý các cuộc gọi chăm sóc khách hàng, ghi chú và phân loại kết quả cuộc gọi",
    },
    {
      title: "Kịch bản chăm sóc",
      tab: 4,
      backgroundColor: "#EAF3DE",
      icon: "MarketingMenu",
      des: "Thiết lập kịch bản tự động: nhắc sinh nhật, follow-up sau mua, cảnh báo khách hàng VIP",
    },
  ];

  const handleBack = (isBack: boolean) => {
    if (isBack) setIsDetail(false);
  };

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
        <TicketList onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 2 ? (
        <CareHistory onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 3 ? (
        <CallCenterList onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 4 ? (
        <CareAutomationPage onBackProps={handleBack} />
      ) : null}
    </div>
  );
}
