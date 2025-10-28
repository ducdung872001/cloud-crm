import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TemplateCategoryList from "pages/TemplateCategory/TemplateCategoryList";
import PartnerSMSList from "./partials/PartnerSMS/PartnerSMSList";
import BrandNameList from "./partials/BrandName/BrandNameList";
import TemplateSMSList from "./partials/TemplateSMS/TemplateSMSList";
import ConfigSMSList from "./partials/ConfigSMS/ConfigSMSList";
import { getPermissions } from "utils/common";
import "./SettingSMSList.scss";
import WhiteList from "./partials/WhiteList/WhiteList";

export default function SettingSMSList() {
  document.title = "Cài đặt SMS";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const menuCategorySMS = [
    permissions["GLOBAL_CONFIG_VIEW"] == 1
      ? {
          title: "Cấu hình SMS",
          is_tab: "tab_one",
        }
      : null,

    permissions["GLOBAL_CONFIG_VIEW"] == 1
      ? {
          title: "Danh mục đối tác SMS",
          is_tab: "tab_three",
        }
      : null,
    {
      title: "Chủ đề SMS",
      is_tab: "tab_two",
    },
    {
      title: "Khai báo Brandname",
      is_tab: "tab_four",
    },
    {
      title: "Khai báo mẫu tin nhắn SMS",
      is_tab: "tab_five",
    },
    // {
    //   title: "Danh sách WhiteList",
    //   is_tab: "tab_six",
    // },
  ].filter((e) => e);

  return (
    <div className="page-content page-setting-sms">
      {!isDetailCategory && <TitleAction title="Cài đặt SMS" />}
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
        <ConfigSMSList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <TemplateCategoryList
          titleProps="Cài đặt SMS"
          nameProps="Chủ đề SMS"
          typeProps="1"
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <PartnerSMSList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_four" ? (
        <BrandNameList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_six" ? (
        <WhiteList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <TemplateSMSList
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
