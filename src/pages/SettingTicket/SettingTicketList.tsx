import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import TicketCategoryList from "./partials/TicketCategory/TicketCategoryList";
import TicketProcList from "./partials/TicketProc/TicketProcList";
import QRManagement from "./partials/QRManagement/QRManagement";
import "./SettingTicketList.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";

export default function SettingTicketList() {
  document.title = "Cài đặt hỗ trợ";

  const [tab, setTab] = useState<string>("");
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    // {
    //   title: "Quy trình xử lý hỗ trợ",
    //   is_tab: "tab_one",
    // },
    {
      title: "Danh mục hỗ trợ",
      is_tab: "tab_two",
      icon: "SupportCategory",
      backgroundColor: "#E6F1FB",
      strokeColor: "rgb(24, 95, 165)",
      des: "Quản lý các danh mục và phân loại yêu cầu khách hàng theo từng nhóm vấn đề"
    },
    {
      title: "Quản lý QR Code",
      is_tab: "tab_three",
      icon: "QRManagement",
      backgroundColor: "#FAEEDA",
      strokeColor: "rgb(133, 79, 11)",
      des: "Tạo và quản lý mã QR cho sản phẩm, chương trình khuyến mãi hoặc điểm tích lũy"
    },
  ];

  return (
    <div className="page-setting-ticket">
      {!isDetail && <TitleAction title="Cài đặt hỗ trợ" />}
        <div className="d-flex flex-column">
          {!isDetail && (
            <TabMenuList
              listTab={listTab}
              onClick={(item) => {
                  setTab(item.tab);
                  setIsDetail(true);
              }}
            />
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
      isDetail && tab === "tab_two" ? (
        <TicketCategoryList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : (
        isDetail && (
          <QRManagement
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
