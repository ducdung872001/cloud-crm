import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./index.scss";
import ComponentList from "./ComponentList/ComponentList";
import ObjectGroupList from "./ObjectGroup";
import ObjectAttributeList from "./ObjectAttribute/ObjectAttributeList";

export default function ConfigBPM() {
  document.title = "Cấu hình quy trình";
  const isBeauty = localStorage.getItem("isBeauty");

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    {
      title: "Danh mục thành phần dùng chung",
      is_tab: "tab_one",
    },
    {
      title: "Danh mục loại đối tượng",
      is_tab: "tab_two",
    },
    // {
    //   title: "Định nghĩa các trường thông tin bổ sung đối tượng",
    //   is_tab: "tab_three",
    // },
  ];

  return (
    <div className="page-content page-config-bpm">
      {!isDetailCategory && <TitleAction title="Cấu hình quy trình" />}
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
        <ComponentList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_two" ? (
        <ObjectGroupList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : isDetailCategory && tab === "tab_three" ? (
        <ObjectAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        []
      )}
    </div>
  );
}
