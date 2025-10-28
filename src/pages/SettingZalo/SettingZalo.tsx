import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
// import TemplateEmailList from "./partials/TemplateEmail/TemplateEmailList";
import { getPermissions } from "utils/common";

import "./SettingZalo.scss";
import TemplateCategoryZalo from "./partials/TemplateCategoryZalo/TemplateCategoryZalo";
import TemplateZaloList from "./partials/TemplateZaloList/TemplateZaloList";

export default function SettingZalo() {
  document.title = "Cài đặt Zalo";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const menuCategoryZalo = [
    
    {
      title: "Chủ đề Zalo",
      is_tab: "tab_one",
    },
   
    {
      title: "Khai báo mẫu Zalo",
      is_tab: "tab_two",
    },
  ].filter((e) => e);

  return (
    <div className="page-content page-setting-zalo">
      {!isDetailCategory && <TitleAction title="Cài đặt Zalo" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryZalo.map((item, idx) => {
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
        <TemplateCategoryZalo
          titleProps="Cài đặt Zalo"
          nameProps="Chủ đề Zalo"
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      
      ) : (
        isDetailCategory && (
          <TemplateZaloList
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
