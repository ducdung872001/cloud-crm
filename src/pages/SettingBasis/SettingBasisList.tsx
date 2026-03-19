import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import BranchList from "./partials/BranchList/BranchList";
import EmployeeList from "./partials/EmployeeList/EmployeeList";
import TreatmentRoomList from "./partials/TreatmentRoom/TreatmentRoomList";
import DepartmentDirectoryList from "./partials/DepartmentDirectory/DepartmentDirectoryList";
import "./SettingBasisList.scss";
import TeamEmployeeList from "./partials/TeamEmployeeList/TeamEmployeeList";
import RoleDirectory from "./partials/RoleDirectory";
import ManagementStore from "./partials/ManagementStore/ManagementStore";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingBasisList() {
  const { t } = useTranslation();

  document.title = t(`pageSettingBasis.title`);

  const isBeauty = localStorage.getItem("isBeauty");

  const [tab, setTab] = useState<string>("");

  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: t(`pageSettingBasis.listBranches`),
      is_tab: "tab_one",
      icon: "BranchList",
      backgroundColor: "#E6F1FB",
      strokeColor: "#185fa5",
      des: "Quản lý các chi nhánh, cửa hàng trực thuộc doanh nghiệp."
    },
    {
      title: t(`pageSettingBasis.listDepartments`),
      is_tab: "tab_two",
      icon: "Departmentist",
      backgroundColor: "#E1F5EE",
      strokeColor: "#0f6e56",
      des: "Thiết lập cơ cấu tổ chức, phân chia phòng ban theo bộ máy doanh nghiệp."
    },
    {
      title: t(`pageSettingBasis.listRole`),
      is_tab: "tab_six",
      icon: "PermissionGroupList",
      backgroundColor: "#EEEDFE",
      strokeColor: "#534ab7",
      des: "Cấu hình các nhóm quyền truy cập và phân quyền chức năng cho từng vai trò."
    },
    {
      title: t(`pageSettingBasis.listEmployee`),
      is_tab: "tab_three",
      icon: "EmployeeList",
      backgroundColor: "#FAEEDA",
      strokeColor: "#854f0b",
      des: "Xem và quản lý hồ sơ toàn bộ nhân viên trong hệ thống."
    },
    {
      title: t(`pageSettingBasis.listTeam`),
      is_tab: "tab_five",
      icon: "EmployeeGroup",
      backgroundColor: "#EAF3DE",
      strokeColor: "#3b6d11",
      des: "Gom nhóm nhân viên theo bộ phận, kỹ năng hoặc phạm vi công việc."
    },
    {
      title: t(`pageSettingBasis.managementStore`),
      is_tab: "tab_seven",
      icon: "StoreManagement",
      backgroundColor: "#FAECE7",
      strokeColor: "#993c1d",
      des: "Cấu hình thông tin, địa chỉ và hoạt động của từng cửa hàng."
    },
    // ...(isBeauty && isBeauty == "1"
    //   ? [
    //       {
    //         title: t(`pageSettingBasis.listTreatmentRooms`),
    //         is_tab: "tab_four",
    //       },
    //     ]
    //   : []),
  ];

  return (
    <div className="page-setting-basis">
      {!isDetail && <h1>{t(`pageSettingBasis.title`)}</h1>}
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
        <BranchList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <DepartmentDirectoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
          onNextPage={() => {
            setIsDetail(true);
            setTab("tab_three");
          }}
        />
      ) : isDetail && tab === "tab_six" ? (
        <RoleDirectory
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
          onNextPage={() => {
            setIsDetail(true);
            setTab("tab_three");
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <EmployeeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_five" ? (
        <TeamEmployeeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_seven" ? (
        <ManagementStore
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) :
      (
        isDetail && (
          <TreatmentRoomList
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
