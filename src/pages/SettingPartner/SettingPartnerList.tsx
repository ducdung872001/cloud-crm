import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
// import CustomerAttributeList from "./partials/CustomerAttribute/CustomerAttributeList";
import "./SettingPartnerList.scss";
import PartnerAttributeList from "./PartnerAttributeList/PartnerAttributeList";

export default function SettingPartnerList() {
  document.title = "Cài đặt đối tác";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Định nghĩa trường thông tin bổ sung đối tác",
      is_tab: "tab_one",
    }, 
  ];

  return (
    <div className="page-content page-setting-partner">
      {!isDetailCategory && <TitleAction title="Cài đặt đối tác" />}
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
        <PartnerAttributeList
            onBackProps={(isBack) => {
            if (isBack) {
                setIsDetailCategory(false);
            }
            }}
        />
      ) 
      : null}
    </div>
  );
}
