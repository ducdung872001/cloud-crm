import React, { useState } from "react";
import Cashbook from "./partials/Cashbook/Index";
import "./SettingReportList.scss";

export default function SettingBasisList() {
  document.title = "Mẫu báo cáo Tài chính";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Mẫu báo cáo tài chính",
      is_tab: "tab_one",
    },
  ];

  return (
    <div className="page-content page-setting-report">
      {!isDetailCategory && <h1>Cài đặt báo cáo</h1>}
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
        <Cashbook
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
