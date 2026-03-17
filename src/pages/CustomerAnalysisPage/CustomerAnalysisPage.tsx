import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./CustomerAnalysisPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function CustomerAnalysisPage() {
  document.title = "Phân tích khách hàng";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Phân khúc khách hàng",
      tab: 1,
    },

    {
      title: "Giá trị khách hàng",
      tab: 2,
    },
    {
      title: "Khách hàng rời bỏ",
      tab: 3,
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

      {/* {isDetail && tab === 1 ? (
        <SMSMarkettingList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null} */}

    </div>
  );
}
