import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./index.scss";
import ComponentList from "./ComponentList/ComponentList";
import ObjectGroupList from "./ObjectGroup";
import ObjectAttributeList from "./ObjectAttribute/ObjectAttributeList";
import FormCategory from "./FormCategory";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function ConfigBPM() {
  document.title = "Cấu hình quy trình";
  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh mục thành phần dùng chung",
      is_tab: "tab_one",
      icon: "FileMgmtMenu",
      strokeColor: "rgb(37, 99, 235)",
      backgroundColor: "#dbeafe",
      des: "Quản lý các thành phần, module tái sử dụng được dùng chung trong nhiều quy trình"
    },
    {
      title: "Danh mục loại đối tượng",
      is_tab: "tab_two",
      icon: "ProcessMenu",
      strokeColor: "rgb(217, 119, 6)",
      backgroundColor: "#fef3c7",
      des: "Phân loại các đối tượng xử lý trong quy trình như khách hàng, hợp đồng, yêu cầu"
    },
    // {
    //   title: "Định nghĩa các trường thông tin bổ sung đối tượng",
    //   is_tab: "tab_three",
    // },
    {
      title: "Danh mục biểu mẫu",
      is_tab: "tab_four",
      icon: "OrderListMenu",
      strokeColor: "rgb(22, 163, 74)",
      backgroundColor: "#dcfce7",
      des: "Quản lý các mẫu biểu, form nhập liệu được sử dụng trong từng bước của quy trình"
    },
  ];

  return (
    <div className="page-config-bpm">
      {!isDetail && <TitleAction title="Cấu hình quy trình" />}
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
        <ComponentList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_two" ? (
        <ObjectGroupList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_three" ? (
        <ObjectAttributeList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : isDetail && tab === "tab_four" ? (
        <FormCategory
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : (
        []
      )}
    </div>
  );
}
