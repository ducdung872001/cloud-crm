import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./PromotionPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import PromotionalProgram from "@/pages/PromotionalProgram";
import PromoCode from "../PromoCode";
import PromotionBundle from "../PromotionBundle";
import PromotionDashboard from "../PromoReport/PromotionDashboard";
import FixedPricePage from "../FixedPricePage";

export default function PromotionPage() {
  document.title = "Khuyến mãi";

  const [tab, setTab] = useState<number>(null);
  const [isDetail, setIsDetail] = useState<boolean>(false);

  const listTab = [
    {
      title: "Chương trình khuyến mãi",
      icon: "PromotionMenu",
      strokeColor: "rgb(217, 119, 6)",
      backgroundColor: "#fef3c7",
      tab: 1,
      des: "Quản lý các chương trình giảm giá theo thời gian, sản phẩm, nhóm khách hàng"
    },
    {
      title: "Mã giảm giá",
      icon: "ProcessConfigMenu",
      strokeColor: "rgb(37, 99, 235)",
      backgroundColor: "#dbeafe",
      tab: 2,
      des: "Tạo mã coupon áp dụng trực tiếp khi thanh toán tại quầy hoặc đơn hàng online"
    },
    {
      title: "Combo khuyến mãi",
      icon: "LoyaltyMenu",
      strokeColor: "rgb(124, 58, 237)",
      backgroundColor: "#ede9fe",
      tab: 3,
      des: "Thiết lập các gói sản phẩm bán kèm với giá ưu đãi để tăng giá trị đơn hàng"
    },
    {
      title: "Đồng giá",
      icon: "Tag",
      strokeColor: "rgb(99, 102, 241)",
      backgroundColor: "#e0e7ff",
      tab: 5,
      des: "Bán nhiều sản phẩm cùng một mức giá cố định — Flash Sale đồng giá 99k, 199k..."
    },
    {
      title: "Báo cáo khuyến mãi",
      icon: "PromoReportMenu",
      strokeColor: "rgb(22, 163, 74)",
      backgroundColor: "#dcfce7",
      tab: 4,
      des: "Thống kê hiệu quả từng chương trình, mã giảm giá và doanh thu phát sinh"
    },
  ];

  return (
    <div className="page-content page-promotion">
      {!isDetail && <TitleAction title="Khuyến mãi" />}
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
        <PromotionalProgram
          onBackProps={(isBack) => { if (isBack) setIsDetail(false); }}
        />
      ) : null}

      {isDetail && tab === 2 ? (
        <PromoCode
          onBackProps={(isBack) => { if (isBack) setIsDetail(false); }}
        />
      ) : null}

      {isDetail && tab === 3 ? (
        <PromotionBundle
          onBackProps={(isBack) => { if (isBack) setIsDetail(false); }}
        />
      ) : null}

      {isDetail && tab === 5 ? (
        <FixedPricePage
          onBackProps={(isBack) => { if (isBack) setIsDetail(false); }}
        />
      ) : null}

      {isDetail && tab === 4 ? (
        <PromotionDashboard
          onBackProps={(isBack) => { if (isBack) setIsDetail(false); }}
        />
      ) : null}
    </div>
  );
}