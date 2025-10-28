import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import KpiDatasourceList from "./partials/KpiDatasourceList/KpiDatasourceList";
import KpiTemplateList from "./partials/KpiTemplateList/KpiTemplateList";
import KpiGoalList from "./partials/KpiGoalList/KpiGoalList";
import "./SettingKPIList.scss";

export default function SettingBasisList() {
  const { t } = useTranslation();

  document.title = t(`pageSettingKPI.title`);

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: t(`pageSettingKPI.kpiDataSource`),
      is_tab: "tab_one",
    },
    {
      title: t(`pageSettingKPI.kpiMetric`),
      is_tab: "tab_two",
    },
    {
      title: t(`pageSettingKPI.listTemplatesKPI`),
      is_tab: "tab_three",
    },
  ];

  return (
    <div className="page-content page-setting-basis">
      {!isDetailCategory && <h1>{t(`pageSettingKPI.title`)}</h1>}
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
        <KpiDatasourceList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <KpiGoalList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <KpiTemplateList
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
