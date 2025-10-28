import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingDashboard.scss";
import ChartList from "./ChartList/ChartList";
import ReportDashboard from "./ReportDashboard/ReportDashboard";
import { getDomain } from "reborn-util";
import CashbookReport from "pages/SettingReport/partials/Cashbook/Index";

export default function SettingDashboard() {
  document.title = "Cài đặt báo cáo";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Danh sách mẫu báo cáo Dashboard",
      is_tab: "tab_one",
    }, 
    ...(sourceDomain == "rebornjsc.reborn.vn" ?
     [
      {
        title: "Danh sách biểu đồ",
        is_tab: "tab_two",
      }
    ] : []), 
    {
      title: "Mẫu báo cáo tài chính",
      is_tab: "tab_three",
    }, 
  ];

  return (
    <div className="page-content page-setting-dashboard">
      {!isDetailCategory && <TitleAction title="Cài đặt báo cáo" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryCustomer.map((item, idx) => {
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
        <ReportDashboard
            onBackProps={(isBack) => {
            if (isBack) {
                setIsDetailCategory(false);
            }
            }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <ChartList
            onBackProps={(isBack) => {
            if (isBack) {
                setIsDetailCategory(false);
            }
            }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <CashbookReport
            onBackProps={(isBack) => {
            if (isBack) {
                setIsDetailCategory(false);
            }
            }}
        />
      ) :  null}
    </div>
  );
}
