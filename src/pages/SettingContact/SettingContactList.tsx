import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
// import PositionList from "pages/SettingCustomer/partials/Position/PositionList";
import PositionList from "pages/SettingContract/partials/Position/PositionList";
import ContactPipelineList from "./ContactPipeline/ContactPipelineList";
import "./SettingContactList.scss";
import ContactAttributeList from "./ContactAttribute/ContactAttributeList";

export default function SettingContactList() {
  document.title = "Cài đặt người liên hệ";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Chức vụ người liên hệ",
      is_tab: "tab_one",
    },
    {
      title: "Định nghĩa trường thông tin bổ sung người liên hệ",
      is_tab: "tab_two",
    },
    {
      title: "Danh mục loại liên hệ",
      is_tab: "tab_three",
    },    
  ];

  return (
    <div className="page-content page-setting-customer">
      {!isDetailCategory && <TitleAction title="Cài đặt người liên hệ" />}
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
        <PositionList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <ContactAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <ContactPipelineList
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
