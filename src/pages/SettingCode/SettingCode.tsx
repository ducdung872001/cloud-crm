import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingCode.scss";
import CodeList from "./CodeList/CodeList";
// import CategoryProject from "./partials/CategoryProject/CategoryProject";
// import SettingWork from "./partials/SettingWork/SettingWork";

export default function SettingCode() {
  document.title = "Cài đặt mã";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Danh sách mã",
      is_tab: "tab_one",
    }, 
    // {
    //   title: "Cài đặt công việc",
    //   is_tab: "tab_two",
    // }, 
  ];

  return (
    <div className="page-content page-setting-code">
      {!isDetailCategory && <TitleAction title="Cài đặt mã" />}
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
        <CodeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (null
        // <SettingWork
        //   onBackProps={(isBack) => {
        //     if (isBack) {
        //       setIsDetailCategory(false);
        //     }
        //   }}
        // />
      ) :  null}
    </div>
  );
}
