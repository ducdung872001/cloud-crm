import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
import PartnerEmailList from "./partials/PartnerEmail/PartnerEmailList";
import DeclareEmailList from "./partials/DeclareEmail/DeclareEmailList";
import TemplateEmailList from "./partials/TemplateEmail/TemplateEmailList";
import ConfigEmailList from "./partials/ConfigEmail/ConfigEmailList";
import { getPermissions } from "utils/common";

import "./SettingEmailList.scss";
import { getSearchParameters } from "reborn-util";

export default function SettingEmailList() {
  document.title = "Cài đặt Email";
  const takeParamsUrl = getSearchParameters();
  const tabParamUrl = takeParamsUrl && takeParamsUrl?.tab;

  const [tab, setTab] = useState<string>(() => {
    return tabParamUrl ? tabParamUrl : "";
  });

  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(() => {
    return tabParamUrl ? true : false;
  });
  const [permissions, setPermissions] = useState(getPermissions());

  const menuCategoryEmail = [
    permissions["GLOBAL_CONFIG_VIEW"] == 1
      ? {
          title: "Cấu hình Email",
          is_tab: "tab_one",
        }
      : null,
    permissions["PARTNER_EMAIL_VIEW"] == 1
      ? {
          title: "Danh mục đối tác Email",
          is_tab: "tab_three",
        }
      : null,
    {
      title: "Chủ đề Email",
      is_tab: "tab_two",
    },
    {
      title: "Khai báo nguồn gửi Email",
      is_tab: "tab_four",
    },
    {
      title: "Khai báo mẫu Email",
      is_tab: "tab_five",
    },
  ].filter((e) => e);

  return (
    <div className="page-content page-setting-email">
      {!isDetailCategory && <TitleAction title="Cài đặt Email" />}
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
        <ConfigEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <TemplateCategoryList
          titleProps="Cài đặt Email"
          nameProps="Chủ đề Email"
          typeProps="2"
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <PartnerEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_four" ? (
        <DeclareEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <TemplateEmailList
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
