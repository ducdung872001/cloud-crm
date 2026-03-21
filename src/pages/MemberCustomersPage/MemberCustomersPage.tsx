import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MemberCustomersPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import LoyaltyWallet from "../LoyaltyWallet";
import DashboardLoyalty from "../DashboardLoyalty";
import LoyaltyPointLedger from "../LoyaltyPointLedger";
import MembershipClass from "../MembershipClass/MembershipClass";
import LoyaltyReward from "../LoyaltyReward";
import SettingLoyaltyList from "../SettingLoyaltyList";
import CustomerLoyaltyPointLedger from "../SettingCustomer/partials/CustomerLoyaltyPointLedger";

export default function MemberCustomersPage() {
  document.title = "Khuyến mãi";

  const [tab, setTab] = useState(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Danh sách thành viên",
      backgroundColor: "#EEEDFE",
      icon: "MemberCustomerList",
      tab: 'member_list',
      des: "Quản lý toàn bộ hội viên, tìm kiếm và xem thông tin chi tiết từng thành viên"
    },

    {
      title: "Hạng thành viên",
      backgroundColor: "#FAEEDA",
      icon: "MembershipClass",
      tab: "membership_class",
      des: "Phân loại hội viên theo hạng (Bạc, Vàng, Kim cương) với quyền lợi riêng mỗi hạng"
    },
    {
      title: "Tích điểm",
      backgroundColor: "#E1F5EE",
      icon: "AccumulatePoints",
      tab: "accumulate_points",
      des: "Cấu hình quy tắc tích điểm theo đơn hàng, sản phẩm hoặc hành vi mua sắm"
    },
    {
      title: "Lịch sử điểm",
      backgroundColor: "#E6F1FB",
      icon: "PointsHistory",
      tab: "points_history",
      des: "Tra cứu toàn bộ lịch sử tích điểm, đổi điểm và biến động điểm của hội viên"
    },
    {
      title: "Đổi điểm",
      backgroundColor: "#FAECE7",
      icon: "ExchangePoints",
      tab: "exchange_points",
      des: "Thiết lập chương trình đổi điểm lấy quà, voucher hoặc ưu đãi cho hội viên"
    },
    {
      title: "Lịch sử điểm tích lũy của khách hàng",
      icon: "PointsHistory",
      backgroundColor: "#F1EFE8",
      is_tab: "points_history_ledger",
      des: "Tra cứu toàn bộ lịch sử cộng/trừ điểm, đổi thưởng của từng khách hàng theo thời gian."
    },
    {
      title: "Chương trình khách hàng thân thiết",
      backgroundColor: "#fef3c7",
      icon: "LoyaltyCustomerProgram",
      tab: "loyalty_program",
      des: "Thiết lập quy tắc tích điểm và ưu đãi cho chương trình loyalty"
    },
    {
      title: "Danh sách phần thưởng",
      backgroundColor: "#fce7f3",
      strokeColor: "rgb(219, 39, 119)",
      tab: "list_of_rewards",
      icon: "PromotionMenu",
      des: "Quản lý các phần thưởng, quà tặng và voucher dùng để đổi điểm cho hội viên"
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

      {isDetail && tab === "member_list" ? (
        <LoyaltyWallet
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === "membership_class" ? (
        <MembershipClass
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === "points_history" ? (
        <LoyaltyPointLedger
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

      {isDetail && tab === "accumulate_points" ? (
        <DashboardLoyalty
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null }

    {isDetail && tab === "loyalty_program" ? (
        <SettingLoyaltyList
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}
      {isDetail && tab === "list_of_rewards" ? (
        <LoyaltyReward
          onBackProps={(isBack) => {
            if (isBack) {
              setIsDetail(false);
            }
          }}
        />
      ) : null}

      {isDetail && tab === "points_history_ledger" ? (
        <CustomerLoyaltyPointLedger
            onBackProps={(isBack) => {
              if (isBack) {
                setIsDetail(false);
              }
            }}
          />
      ) : null}
    </div>
  );
}
