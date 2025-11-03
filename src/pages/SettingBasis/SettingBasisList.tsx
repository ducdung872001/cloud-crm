import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import BranchList from "./partials/BranchList/BranchList";
import EmployeeList from "./partials/EmployeeList/EmployeeList";
import TreatmentRoomList from "./partials/TreatmentRoom/TreatmentRoomList";
import DepartmentDirectoryList from "./partials/DepartmentDirectory/DepartmentDirectoryList";
import "./SettingBasisList.scss";
import TeamEmployeeList from "./partials/TeamEmployeeList/TeamEmployeeList";
import RoleDirectory from "./partials/RoleDirectory";

export default function SettingBasisList() {
  const { t } = useTranslation();

  document.title = t(`pageSettingBasis.title`);

  const isBeauty = localStorage.getItem("isBeauty");

  const [tab, setTab] = useState<string>("");

  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: t(`pageSettingBasis.listBranches`),
      is_tab: "tab_one",
    },
    {
      title: t(`pageSettingBasis.listDepartments`),
      is_tab: "tab_two",
    },
    {
      title: t(`pageSettingBasis.listRole`),
      is_tab: "tab_six",
    },
    {
      title: t(`pageSettingBasis.listEmployee`),
      is_tab: "tab_three",
    },
    {
      title: t(`pageSettingBasis.listTeam`),
      is_tab: "tab_five",
    },
    ...(isBeauty && isBeauty == "1"
      ? [
          {
            title: t(`pageSettingBasis.listTreatmentRooms`),
            is_tab: "tab_four",
          },
        ]
      : []),
  ];

  return (
    <div className="page-content page-setting-basis">
      {!isDetailCategory && <h1>{t(`pageSettingBasis.title`)}</h1>}
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
        <BranchList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <DepartmentDirectoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
          onNextPage={() => {
            setIsDetailCategory(true);
            setTab("tab_three");
          }}
        />
      ) : isDetailCategory && tab === "tab_six" ? (
        <RoleDirectory
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
          onNextPage={() => {
            setIsDetailCategory(true);
            setTab("tab_three");
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <EmployeeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_five" ? (
        <TeamEmployeeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <TreatmentRoomList
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
