import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import KeywordIndustryList from "./partials/KeywordIndustry/KeywordIndustryList";
import KeywordDataList from "./partials/KeywordData/KeywordDataList";
import "./SettingMarketResearchList.scss";

export default function SettingMarketResearchList() {
  document.title = "Cài đặt nghiên cứu thị trường";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Danh sách lĩnh vực nghiên cứu",
      is_tab: "tab_one",
    },
    {
      title: "Danh sách từ khóa nghiên cứu",
      is_tab: "tab_two",
    },
  ];

  return (
    <div className="page-content page-setting-market">
      {!isDetailCategory && <TitleAction title="Cài đặt nghiên cứu thị trường" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategorySMS.map((item, idx) => {
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
        <KeywordIndustryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <KeywordDataList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
        )
      )}
    </div>
  );
}
