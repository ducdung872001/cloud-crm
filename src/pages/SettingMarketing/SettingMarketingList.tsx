import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingMarketingList.scss";
import MarketingChannel from "./partials/MarketingChannel/MarketingChannel";
import ModalAddMarketingMeasurement from "./partials/MarketingMeasurement/partials/ModalAddMAMeasurement";
import MarketingMeasurement from "./partials/MarketingMeasurement/MarketingMeasurement";

export default function SettingMarketingList() {
  document.title = "Cài đặt Marketing";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuSetting = [
    {
      title: "Kênh Marketing",
      is_tab: "tab_one",
    },
    {
      title: "Đo lường Marketing",
      is_tab: "tab_two",
    },
         
  ];

  return (
    <div className="page-content page-setting-marketing">
      {!isDetailCategory && <TitleAction title="Cài đặt Marketing" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuSetting.map((item, idx) => {
              return (
                <li
                  key={idx}
                  className="menu__category"
                  onClick={(e) => {
                    e.preventDefault();
                    setTab(item.is_tab);
                    setIsDetailCategory(true);
                  }}
                >
                  {item.title}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isDetailCategory && tab === "tab_one" ? (
        <MarketingChannel
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <MarketingMeasurement
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) :  ([])}
    </div>
  );
}
