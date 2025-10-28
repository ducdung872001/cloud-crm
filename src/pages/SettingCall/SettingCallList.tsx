import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import PartnerCallList from "./partials/PartnerCall/PartnerCallList";
import ConfigCallList from "./partials/ConfigCall/ConfigCallList";
import ConfigSwitchboardList from "./partials/ConfigSwitchboard/SwitchboardList";
import { getPermissions } from "utils/common";
import "./SettingCallList.scss";
import { getDomain } from "reborn-util";

export default function SettingCallList() {
  document.title = "Cài đặt Tổng đài";

  const sourceDomain = getDomain(decodeURIComponent(document.location.href));

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);
  const [permissions, setPermissions] = useState(getPermissions());

  const menuCategoryCall = [
    // permissions["GLOBAL_CONFIG_VIEW"] == 1
    //   ? {
    //     title: "Cấu hình Tổng đài",
    //     is_tab: "tab_one",
    //   }
    //   : null,

    {
      title: "Cấu hình Tổng đài",
      is_tab: "tab_one",
    },

    // permissions["GLOBAL_CONFIG_VIEW"] == 1
    //   ? {
    //     title: "Đối tác Tổng đài",
    //     is_tab: "tab_two",
    //   }
    //   : null,
    ...(sourceDomain == "rebornjsc.reborn.vn" ?
    [
      {
        title: "Đối tác Tổng đài",
        is_tab: "tab_two",
      }
    ] : []), 

    {
      title: "Tích hợp Tổng đài",
      is_tab: "tab_three",
    }
  ].filter((e) => e);

  return (
    <div className="page-content page-setting-call">
      {!isDetailCategory && <TitleAction title="Cài đặt Tổng đài" />}
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryCall.map((item, idx) => {
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
        <ConfigCallList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <PartnerCallList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <ConfigSwitchboardList
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
