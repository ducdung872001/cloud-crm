import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SettingOperate.scss";

import ProjectList from "./partials/ProjectList/ProjectList";
import ElectricityRateList from "./partials/ElectricityRateList/ElectricityRateList";
import WaterRateList from "./partials/WaterRateList/WaterRateList";
import ManagementFeeRateList from "./partials/ManagementFeeRateList/ManagementFeeRateList";
import ParkingFeeList from "./partials/ParkingFee/ParkingFeeList";
import BuildingList from "./partials/BuildingList/BuildingList";
import { useLocation } from "react-router-dom";
import SpaceTypeList from "./partials/SpaceTypeList/SpaceTypeList";
import ElectricityMeterList from "./partials/ElectricityMeterList/ElectricityMeterList";
import WaterMeterList from "./partials/WaterMeterList/WaterMeterList";

export default function SettingOperate() {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabSelect = params.get("tab_select");
    if (tabSelect) {
      setTab(tabSelect);
      setIsDetailCategory(true);
    }
  }, [location.search]);

  document.title = t(`pageSettingOperate.title`);

  const [tab, setTab] = useState<string>("");

  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: t(`pageSettingOperate.project`),
      is_tab: "tab_one",
    },
    {
      title: t(`pageSettingOperate.building`),
      is_tab: "tab_two",
    },
    {
      title: t(`pageSettingOperate.managementFeeRate`),
      is_tab: "tab_five",
    },
    {
      title: t(`pageSettingOperate.pakingFee`),
      is_tab: "tab_six",
    },
    {
      title: t(`pageSettingOperate.spaceType`),
      is_tab: "tab_seven",
    },
  ];
  const menuCategoryElectricity = [
    {
      title: t(`pageSettingOperate.electrictiyMeter`),
      is_tab: "tab_eight",
    },
    {
      title: t(`pageSettingOperate.waterMeter`),
      is_tab: "tab_nine",
    },
    {
      title: t(`pageSettingOperate.electricityRate`),
      is_tab: "tab_three",
    },
    {
      title: t(`pageSettingOperate.waterRate`),
      is_tab: "tab_four",
    },
    // {
    //   title: t(`pageSettingOperate.electricityIndex`),
    //   is_tab: "tab_10",
    // },
    // {
    //   title: t(`pageSettingOperate.waterIndex`),
    //   is_tab: "tab_11",
    // },
  ];

  return (
    <div className="page-content page-setting-basis">
      {!isDetailCategory && <h1>{t(`pageSettingOperate.title`)}</h1>}
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
      <div className="card-box d-flex flex-column">
        {!isDetailCategory && (
          <ul className="menu">
            {menuCategoryElectricity.map((item, idx) => {
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
      {isDetailCategory && tab === "tab_three" ? (
        <ElectricityRateList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_four" ? (
        <WaterRateList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <BuildingList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_one" ? (
        <ProjectList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_five" ? (
        <ManagementFeeRateList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_seven" ? (
        <SpaceTypeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_eight" ? (
        <ElectricityMeterList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_nine" ? (
        <WaterMeterList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <ParkingFeeList
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
