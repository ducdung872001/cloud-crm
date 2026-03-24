import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MarketingCampaignPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import MarketingHistoryPage from "../MarketingHistory/MarketingHistoryPage";
import CampaignManagementPage from "../CampaignManagement/CampaignManagementPage";
import ContentTemplatePage from "../ContentTemplate/ContentTemplatePage";
import AudienceManagementPage from "../CampaignManagement/AudienceManagementPage";

export default function MarketingCampaignPage() {
  document.title = "Chiến dịch Marketing";

  const [tab, setTab] = useState<string>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      // Đây là OPERATIONAL — tạo & quản lý audience để TARGET campaigns.
      // Khác với "Phân khúc khách hàng" trong Phân tích KH (analytics/read-only).
      title: "Đối tượng chiến dịch",
      backgroundColor: "#EEEDFE",
      icon: "SegmentAnalysis",
      tab: "audience",
      des: "Tạo và quản lý nhóm đối tượng mục tiêu để gửi chiến dịch, bao gồm điều kiện lọc và thao tác tạo chiến dịch trực tiếp",
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
      des: "Quản lý thư viện template cho SMS, Email, Zalo — tái sử dụng khi tạo chiến dịch, tiết kiệm thời gian soạn nội dung",
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

      {isDetail && tab === "audience"   && <AudienceManagementPage {...backProps} />}
      {isDetail && tab === "campaigns"  && <CampaignManagementPage {...backProps} />}
      {isDetail && tab === "templates"  && <ContentTemplatePage    {...backProps} />}
      {isDetail && tab === "history"    && <MarketingHistoryPage   {...backProps} />}
    </div>
  );
}
