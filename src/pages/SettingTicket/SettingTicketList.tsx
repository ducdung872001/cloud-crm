import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TicketCategoryList from "./partials/TicketCategory/TicketCategoryList";
import TicketProcList from "./partials/TicketProc/TicketProcList";
import QRManagement from "./partials/QRManagement/QRManagement";
import "./SettingTicketList.scss";

export default function SettingTicketList() {
  document.title = "Cài đặt hỗ trợ";

  const [tab, setTab] = useState<string>("");
  const [isDetailCategory, setIsDetailCategory] = useState<boolean>(false);

  const menuCategorySMS = [
    // {
    //   title: "Quy trình xử lý hỗ trợ",
    //   is_tab: "tab_one",
    // },
    {
      title: "Danh mục hỗ trợ",
      is_tab: "tab_two",
    },
    {
      title: "Quản lý QR Code",
      is_tab: "tab_three",
    },
  ];

  return (
    <div className="page-content page-setting-ticket">
      {!isDetailCategory && <TitleAction title="Cài đặt hỗ trợ" />}
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
      //   <TicketProcList
      //     onBackProps={(isBack) => {
      //       if (isBack) {
      //         setIsDetailCategory(false);
      //       }
      //     }}
      //   />
      // ) : 
      isDetailCategory && tab === "tab_two" ? (
        <TicketCategoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetailCategory(false);
            }
          }}
        />
      ) : (
        isDetailCategory && (
          <QRManagement
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
