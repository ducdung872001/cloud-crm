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
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingEmailList() {
  document.title = "Cài đặt Email";
  const takeParamsUrl = getSearchParameters();
  const tabParamUrl = takeParamsUrl && takeParamsUrl?.tab;

  const [tab, setTab] = useState<string>(() => {
    return tabParamUrl ? tabParamUrl : "";
  });

  const [isDetail, setIsDetail] = useState<boolean>(() => {
    return tabParamUrl ? true : false;
  });
  const [permissions, setPermissions] = useState(getPermissions());

  const listTab = [
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
    <div className="page-setting-email">
      {!isDetail && <TitleAction title="Cài đặt Email" />}
      <div className="d-flex flex-column">
        {!isDetail && (
            <TabMenuList
                listTab={listTab}
                onClick={(item) => {
                    setTab(item.is_tab);
                    setIsDetail(true);
                }}
            />
        )}
      </div>
  
      {isDetail && tab === "tab_one" ? (
        <ConfigEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <TemplateCategoryList
          titleProps="Cài đặt Email"
          nameProps="Chủ đề Email"
          typeProps="2"
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <PartnerEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_four" ? (
        <DeclareEmailList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : (
        isDetail && (
          <TemplateEmailList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
        )
      )}
    </div>
  );
}
