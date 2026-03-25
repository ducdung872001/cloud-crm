import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CustomerAnalysisPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import CustomerChurn from "@/pages/CustomerChurn/index";
import CustomerSegment from "../customerSegment";
import CustomerValue from "../CustomerValue";
import CustomerReview from "../CustomerReview";

export default function CustomerAnalysisPage() {
  document.title = "Phân tích khách hàng";
  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Phân khúc khách hàng",
      tab: 1,
      backgroundColor: "#EEEDFE",
      icon: "SegmentAnalysis",
      des: "Phân loại khách hàng theo nhóm hành vi, độ tuổi, khu vực hoặc giá trị mua sắm",
    },
    {
      title: "Giá trị khách hàng",
      tab: 2,
      backgroundColor: "#E1F5EE",
      icon: "CustomerValue",
      des: "Đánh giá giá trị vòng đời (CLV), doanh thu và tiềm năng của từng khách hàng",
    },
    {
      title: "Khách hàng rời bỏ",
      tab: 3,
      backgroundColor: "#FAECE7",
      icon: "CustomerLeave",
      des: "Phát hiện và phân tích khách hàng có nguy cơ rời bỏ để kịp thời giữ chân",
    },
    {
      title: "Đánh giá & phản hồi",
      tab: 4,
      backgroundColor: "#EAF3DE",
      icon: "RateCustomer",
      des: "Thu thập và phân tích phản hồi sản phẩm/dịch vụ, kiểm duyệt đánh giá trước khi hiển thị",
    },
  ];

  const handleBack = (isBack: boolean) => {
    if (isBack) setIsDetail(false);
  };

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Phân tích khách hàng" />}

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
        <CustomerSegment onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 2 ? (
        <CustomerValue onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 3 ? (
        <CustomerChurn onBackProps={handleBack} />
      ) : null}

      {isDetail && tab === 4 ? (
        <CustomerReview onBackProps={handleBack} />
      ) : null}
    </div>
  );
}
