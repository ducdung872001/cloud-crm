import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CustomerAnalysisPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import CustomerChurn from "@/pages/CustomerChurn/index";
import CustomerSegment from "../customerSegment";
import CustomerValue from "../CustomerValue";

export default function CustomerAnalysisPage() {
  document.title = "Phân tích khách hàng";
  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Phân khúc khách hàng",
      tab: 1,
      des: "Phân loại khách hàng theo nhóm hành vi, độ tuổi, khu vực hoặc giá trị mua sắm"
    },

    {
      title: "Giá trị khách hàng",
      tab: 2,
      des: "Đánh giá giá trị vòng đời, doanh thu và tiềm năng của từng khách hàng"
    },
    {
      title: "Khách hàng rời bỏ",
      tab: 3,
      des: "Phát hiện và phân tích khách hàng có nguy cơ rời bỏ để kịp thời giữ chân"
    },
  ];

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
        <CustomerSegment
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === 2 ? (
        <CustomerValue
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === 3 ? (
        <CustomerChurn
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
