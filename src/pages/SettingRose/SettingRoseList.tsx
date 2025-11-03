import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TipGroupList from "./partials/TipGroup/TipGroupList";
import TipUser from "./partials/TipUser/TipUser";
import "./SettingRoseList.scss";

export default function SettingRoseList() {
  document.title = "Cài đặt hoa hồng";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategoryEmail = [
    {
      title: "Hoa hồng theo nhóm",
      is_tab: "tab_one",
    },
    {
      title: "Hoa hồng theo cá nhân",
      is_tab: "tab_two",
    },
  ];

  return (
    <div className="page-content page-setting-rose">
      {!isDetailCategory && <TitleAction title="Cài đặt hoa hồng" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryEmail.map((item, idx) => {
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
        <TipGroupList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <TipUser
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
