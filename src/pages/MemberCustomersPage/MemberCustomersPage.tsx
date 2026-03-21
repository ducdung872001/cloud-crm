import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MemberCustomersPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import LoyaltyWallet from "../LoyaltyWallet";
import DashboardLoyalty from "../DashboardLoyalty";
import LoyaltyPointLedger from "../LoyaltyPointLedger";

export default function MemberCustomersPage() {
  document.title = "Khuyến mãi";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh sách thành viên",
      backgroundColor: "#EEEDFE",
      icon: "MemberCustomerList",
      tab: 1,
      des: "Quản lý toàn bộ hội viên, tìm kiếm và xem thông tin chi tiết từng thành viên"
    },

    {
      title: "Hạng thành viên",
      backgroundColor: "#FAEEDA",
      icon: "MembershipClass",
      tab: 2,
      des: "Phân loại hội viên theo hạng (Bạc, Vàng, Kim cương) với quyền lợi riêng mỗi hạng"
    },
    {
      title: "Tích điểm",
      backgroundColor: "#E1F5EE",
      icon: "AccumulatePoints",
      tab: 3,
      des: "Cấu hình quy tắc tích điểm theo đơn hàng, sản phẩm hoặc hành vi mua sắm"
    },
    {
      title: "Lịch sử điểm",
      backgroundColor: "#E6F1FB",
      icon: "PointsHistory",
      tab: 4,
      des: "Tra cứu toàn bộ lịch sử tích điểm, đổi điểm và biến động điểm của hội viên"
    },
    {
      title: "Đổi điểm",
      backgroundColor: "#FAECE7",
      icon: "ExchangePoints",
      tab: 5,
      des: "Thiết lập chương trình đổi điểm lấy quà, voucher hoặc ưu đãi cho hội viên"
    },
  ];

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Khách hàng thành viên" />}
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

      {isDetail && tab === 1 ? (
        <LoyaltyWallet
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 4 ? (
        <LoyaltyPointLedger
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === 3 ? (
        <DashboardLoyalty
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }
    </div>
  );
}
