import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MarketingCampaignPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import MarketingHistoryPage from "../MarketingHistory/MarketingHistoryPage";
import CampaignManagementPage from "../CampaignManagement/CampaignManagementPage";
import ContentTemplatePage from "../ContentTemplate/ContentTemplatePage";
import CustomerSegmentBridge from "../CampaignManagement/CustomerSegmentBridge";

export default function MarketingCampaignPage() {
  document.title = "Chiến dịch Marketing";

  const [tab, setTab] = useState<string>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Phân khúc khách hàng",
      backgroundColor: "#EEEDFE",
      icon: "SegmentAnalysis",
      tab: "segments",
      des: "Tạo và quản lý nhóm khách hàng mục tiêu để gửi chiến dịch phù hợp từng nhóm",
    },
    {
      title: "Tạo & quản lý chiến dịch",
      backgroundColor: "#E6F1FB",
      icon: "CampaignHistory",
      tab: "campaigns",
      des: "Tạo chiến dịch đa kênh (SMS, Zalo, Email, App) trong một luồng duy nhất, nhắm đúng đối tượng",
    },
    {
      title: "Mẫu nội dung",
      backgroundColor: "#E1F5EE",
      icon: "EmailMenu",
      tab: "templates",
      des: "Quản lý thư viện template cho SMS, Email, Zalo — tái sử dụng khi tạo chiến dịch",
    },
    {
      title: "Lịch sử chiến dịch",
      backgroundColor: "#F1EFE8",
      icon: "PromoReportMenu",
      tab: "history",
      des: "Xem lại toàn bộ chiến dịch đã chạy, thống kê hiệu quả mở, click và doanh thu từng đợt",
    },
  ];

  const handleBack = () => setIsDetail(false);
  const backProps = { onBackProps: (v: boolean) => v && handleBack() };

  return (
    <div className="page-content page-marketing-campaign">
      {!isDetail && <TitleAction title="Chiến dịch Marketing" />}

      {!isDetail && (
        <TabMenuList
          listTab={listTab}
          onClick={(item) => {
            setTab(item.tab);
            setIsDetail(true);
          }}
        />
      )}

      {isDetail && tab === "segments" && <CustomerSegmentBridge {...backProps} />}
      {isDetail && tab === "campaigns" && <CampaignManagementPage {...backProps} />}
      {isDetail && tab === "templates" && <ContentTemplatePage {...backProps} />}
      {isDetail && tab === "history" && <MarketingHistoryPage {...backProps} />}
    </div>
  );
}
