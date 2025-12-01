import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import WarrantyCategoryList from "./partials/WarrantyCategory/WarrantyCategoryList";
import WarrantyProcList from "./partials/WarrantyProc/WarrantyProcList";
import "./SettingWarrantyList.scss";

export default function SettingWarrantyList() {
  document.title = "Cài đặt bảo hành";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    // {
    //   title: "Quy trình xử lý bảo hành",
    //   is_tab: "tab_one",
    // },
    {
      title: "Danh mục hỗ trợ bảo hành",
      is_tab: "tab_two",
    },
  ];

  return (
    <div className="page-content page-setting-warranty">
      {!isDetailCategory && <TitleAction title="Cài đặt bảo hành" />}
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
      {
      // isDetailCategory && tab === "tab_one" ? (
      //   <WarrantyProcList
      //     onBackProps={(isBack) => {
      //       if (isBack) {
      //         setIsDetailCategory(false);
      //       }
      //     }}
      //   />
      // ) : (
        isDetailCategory && (
          <WarrantyCategoryList
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetailCategory(false);
              }
            }}
          />
        // )
      )}
    </div>
  );
}
