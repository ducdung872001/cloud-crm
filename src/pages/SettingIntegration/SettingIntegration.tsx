import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingIntegration.scss";
import InstallApplication from "./InstallApplication/InstallApplication";
import Webhook from "./Webhook/Webhook";
import IntegratedMonitoring from "./IntegratedMonitoring/IntegratedMonitoring";

export default function SettingIntegration() {
  document.title = "Cài đặt tích hợp";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Giám sát tích hợp",
      is_tab: "tab_three",
    }, 
    {
      title: "Danh sách ứng dụng",
      is_tab: "tab_one",
    }, 
    {
      title: "Danh sách webhook",
      is_tab: "tab_two",
    }, 
  ];

  return (
    <div className="page-content page-setting-integration">
      {!isDetailCategory && <TitleAction title="Cài đặt tích hợp" />}
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
        <InstallApplication
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <Webhook
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <IntegratedMonitoring
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
