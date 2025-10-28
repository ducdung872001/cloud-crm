import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./SettingProjectList.scss";
import CategoryProject from "./partials/CategoryProject/CategoryProject";
import SettingWork from "./partials/SettingWork/SettingWork";

export default function SettingProjectList() {
  document.title = "Cài đặt dự án";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryCustomer = [
    {
      title: "Danh mục dự án",
      is_tab: "tab_one",
    }, 
    {
      title: "Cài đặt công việc",
      is_tab: "tab_two",
    }, 
  ];

  return (
    <div className="page-content page-setting-project">
      {!isDetailCategory && <TitleAction title="Cài đặt dự án" />}
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
        <CategoryProject
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <SettingWork
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
