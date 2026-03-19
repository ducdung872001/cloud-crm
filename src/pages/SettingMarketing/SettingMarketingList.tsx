import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingMarketingList.scss";
import MarketingChannel from "./partials/MarketingChannel/MarketingChannel";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingMarketingList() {
  document.title = "Cài đặt truyền thông";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Kênh truyền thông",
      is_tab: "tab_one",
      des: "Cấu hình và kết nối các kênh truyền thông như SMS, Email, Zalo, App"
    },
    {
      title: "Đo lường truyền thông",
      is_tab: "tab_two",
      des: "Theo dõi và phân tích hiệu quả các chiến dịch truyền thông, tỷ lệ tiếp cận và chuyển đổi"
    },
  ];

  return (
    <div className="page-content page-setting-marketing">
      {!isDetail && <TitleAction title="Cài đặt truyền thông" />}
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
      {isDetail && tab === "tab_one" ? (
        <MarketingChannel
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        null
      ) : (
        []
      )}
    </div>
  );
}
