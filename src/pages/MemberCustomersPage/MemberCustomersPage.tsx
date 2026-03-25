import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import { ITitleActions } from "components/titleAction/titleAction";
import "./MemberCustomersPage.scss";
import LoyaltyWallet from "../LoyaltyWallet";
import MembershipClass from "../MembershipClass/MembershipClass";
import LoyaltyPointLedger from "../LoyaltyPointLedger";
import ExchangePoints from "../ExchangePoints";
import SettingLoyaltyList from "../SettingLoyaltyList";
import RewardsExchangePage from "@/pages/RewardsExchangePage";
import LoyaltyReportPage from "@/pages/LoyaltyReportPage";

type TabKey =
  | "member_list"
  | "membership_class"
  | "points_history"
  | "loyalty_rules"
  | "rewards_exchange"
  | "loyalty_report"
  | null;

// Layout 3 section — icon dùng prop "name" (đúng theo Icon component)
const SECTIONS = [
  {
    label: "DỮ LIỆU THÀNH VIÊN",
    cards: [
      { tab: "member_list",      icon: "MemberCustomerList", title: "Danh sách thành viên",  bg: "#EEEDFE", des: "Quản lý toàn bộ hội viên, tìm kiếm và xem thông tin chi tiết từng thành viên" },
      { tab: "membership_class", icon: "MembershipClass",    title: "Hạng thành viên",        bg: "#FAEEDA", des: "Phân loại hội viên theo hạng (Bạc, Vàng, Kim cương) với quyền lợi riêng mỗi hạng" },
      { tab: "points_history",   icon: "PointsHistory",      title: "Lịch sử điểm",           bg: "#E6F1FB", des: "Tra cứu toàn bộ lịch sử tích điểm, đổi điểm và biến động điểm của hội viên" },
    ],
  },
  {
    label: "CẤU HÌNH CHƯƠNG TRÌNH",
    cards: [
      { tab: "loyalty_rules",    icon: "AccumulatePoints",   title: "Quy tắc tích điểm",      bg: "#E1F5EE", des: "Cấu hình quy tắc tích điểm theo đơn hàng, sản phẩm hoặc hành vi mua sắm" },
      { tab: "rewards_exchange", icon: "ExchangePoints",     title: "Phần thưởng & Đổi điểm", bg: "#FAECE7", des: "Quản lý phần thưởng và thiết lập chương trình đổi điểm lấy quà, voucher cho hội viên" },
    ],
  },
  {
    label: "PHÂN TÍCH & BÁO CÁO",
    cards: [
      { tab: "loyalty_report",   icon: "LoyaltyMenu",        title: "Báo cáo thành viên",     bg: "#fef3c7", des: "Phân tích tỷ lệ giữ chân, giá trị vòng đời khách hàng và hiệu quả chương trình loyalty" },
    ],
  },
];

export default function MemberCustomersPage() {
  document.title = "Khách hàng thành viên";

  const [tab, setTab]           = useState<TabKey>(null);
  const [isDetail, setIsDetail] = useState(false);

  const handleBack = (v: boolean) => v && setIsDetail(false);

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Khách hàng thành viên" />}

      {/* ── Hub: layout 3 section ── */}
      {!isDetail && (
        <div className="mcp-hub">
          {SECTIONS.map(section => (
            <div key={section.label} className="mcp-section">
              <div className="mcp-section__header">
                <span className="mcp-section__dot" />
                <span className="mcp-section__label">{section.label}</span>
              </div>
              {/* Dùng class .menu và .item-menu từ TabMenuList.scss để giống hệt các hub khác */}
              <div className="menu">
                {section.cards.map(card => (
                  <div
                    key={card.tab}
                    className="item-menu"
                    onClick={() => { setTab(card.tab as TabKey); setIsDetail(true); }}
                  >
                    {/* prop đúng là "name" — Icon component: iconTypes[props.name] */}
                    <div className="item-icon" style={{ backgroundColor: card.bg }}>
                      <Icon name={card.icon} />
                    </div>
                    <div className="item-body">
                      <span style={{ fontSize: 14, fontWeight: "500" }}>{card.title}</span>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: "400" }}>{card.des}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail pages ── */}
      {isDetail && tab === "member_list"      && <LoyaltyWallet      onBackProps={handleBack} />}
      {isDetail && tab === "membership_class" && <MembershipClass     onBackProps={handleBack} />}
      {isDetail && tab === "points_history"   && <LoyaltyPointLedger  onBackProps={handleBack} />}
      {isDetail && tab === "loyalty_rules"    && <SettingLoyaltyList  onBackProps={handleBack} />}
      {isDetail && tab === "rewards_exchange" && <RewardsExchangePage onBackProps={handleBack} />}
      {isDetail && tab === "loyalty_report"   && <LoyaltyReportPage   onBackProps={handleBack} />}
    </div>
  );
}
