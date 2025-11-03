import React, { useState } from "react";
import ApprovalList from "./partials/ApprovalList/ApprovalList";
import ProcessedObjectList from "./partials/ProcessedObjectList/index";
import "./SettingProcess.scss";

export default function SettingProcess() {
  document.title = "Cài đặt quy trình";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Quy trình phê duyệt",
      is_tab: "tab_one",
    },
    // {
    //   title: "Quản lý đối tượng",
    //   is_tab: "tab_two",
    // },
  ];

  return (
    <div className="page-content page-setting-process">
      {!isDetailCategory && <h1>Cài đặt quy trình</h1>}
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
      {isDetailCategory && tab === "tab_one" && (
        <ApprovalList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      )}

      {isDetailCategory && tab === "tab_two" && (
        <ProcessedObjectList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      )}
    </div>
  );
}
