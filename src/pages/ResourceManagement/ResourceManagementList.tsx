import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import FunctionalManagementList from "./partials/FunctionalManagement/FunctionalManagementList";
import SubsystemAdministrationList from "./partials/SubsystemAdministration/SubsystemAdministrationList";
import "./ResourceManagementList.scss";
import DataManagement from "./partials/DataManagement/DataManagement";

export default function ResourceManagementList() {
  document.title = "Quản trị tài nguyên";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Quản trị phân hệ",
      is_tab: "tab_one",
    },
    {
      title: "Quản trị chức năng",
      is_tab: "tab_two",
    },
    {
      title: "Quản trị dữ liệu",
      is_tab: "tab_three",
    },
  ];

  return (
    <div className="page-content page-resource-management">
      {!isDetailCategory && <TitleAction title="Quản trị tài nguyên" />}
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
        <SubsystemAdministrationList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <DataManagement
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <FunctionalManagementList
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
