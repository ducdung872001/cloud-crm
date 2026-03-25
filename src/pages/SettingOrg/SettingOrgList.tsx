import React, { useState } from "react";
import DepartmentDirectoryList from "pages/SettingBasis/partials/DepartmentDirectory/DepartmentDirectoryList";
import RoleDirectory from "pages/SettingBasis/partials/RoleDirectory";
import TeamEmployeeList from "pages/SettingBasis/partials/TeamEmployeeList/TeamEmployeeList";
import EmployeeList from "pages/SettingBasis/partials/EmployeeList/EmployeeList";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

/**
 * Menu cấp 1: "Tổ chức & phân quyền"  →  /setting_org
 * Items cấp 2: Phòng ban | Nhóm quyền & vai trò | Nhóm nhân viên | Danh sách nhân viên
 */
export default function SettingOrgList() {
  document.title = "Tổ chức & phân quyền";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const groups = [
    {
      label: "PHÂN QUYỀN",
      items: [
        {
          title: "Phòng ban",
          is_tab: "dept",
          icon: "Departmentist",
          backgroundColor: "#E6F1FB",
          des: "Thiết lập cơ cấu tổ chức, phân chia phòng ban theo bộ máy doanh nghiệp.",
        },
        {
          title: "Nhóm quyền & vai trò",
          is_tab: "role",
          icon: "PermissionGroupList",
          backgroundColor: "#EEEDFE",
          des: "Cấu hình các nhóm quyền truy cập và phân quyền chức năng cho từng vai trò.",
        },
      ],
    },
    {
      label: "NHÂN VIÊN",
      items: [
        {
          title: "Nhóm nhân viên",
          is_tab: "team",
          icon: "EmployeeGroup",
          backgroundColor: "#FAEEDA",
          des: "Gom nhóm nhân viên theo bộ phận, kỹ năng hoặc phạm vi công việc.",
        },
        {
          title: "Danh sách nhân viên",
          is_tab: "employee",
          icon: "EmployeeList",
          backgroundColor: "#E1F5EE",
          des: "Xem và quản lý hồ sơ toàn bộ nhân viên trong hệ thống.",
        },
      ],
    },
  ];

  return (
    <div className="page-setting-org">
      {!isDetail && <h1>Tổ chức &amp; phân quyền</h1>}
      {!isDetail && (
        <TabMenuList
          groups={groups}
          onClick={(item: any) => { setTab(item.is_tab); setIsDetail(true); }}
        />
      )}

      {isDetail && tab === "dept"     && <DepartmentDirectoryList onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} onNextPage={() => { setTab("employee"); }} />}
      {isDetail && tab === "role"     && <RoleDirectory           onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} onNextPage={() => { setTab("employee"); }} />}
      {isDetail && tab === "team"     && <TeamEmployeeList        onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
      {isDetail && tab === "employee" && <EmployeeList            onBackProps={(b: boolean) => { if (b) setIsDetail(false); }} />}
    </div>
  );
}
