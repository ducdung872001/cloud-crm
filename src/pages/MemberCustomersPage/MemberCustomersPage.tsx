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
import SettingLoyalty from "../SettingLoyalty/SettingLoyalty";
import LoyaltyReportPage from "@/pages/LoyaltyReportPage";

type TabKey =
  | "member_list"
  | "membership_class"
  | "points_history"
  | "loyalty_rules"
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
      { tab: "loyalty_rules", icon: "AccumulatePoints", title: "Quy tắc tích điểm", bg: "#E1F5EE", des: "Cấu hình quy tắc, phần thưởng và tỷ lệ quy đổi điểm cho chương trình hội viên" },
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

  const [tab, setTab]                         = useState<TabKey>(null);
  const [isDetail, setIsDetail]               = useState(false);
  const [initialCustomerId, setInitialCustomerId] = useState<number | null>(null);

  const handleBack = (v: boolean) => v && setIsDetail(false);

  // Gọi từ LoyaltyWallet khi user bấm vào điểm của một thành viên
  // → chuyển sang tab "Lịch sử điểm" và pre-filter theo customerId đó
  const handleViewHistory = (customerId: number) => {
    setInitialCustomerId(customerId);
    setTab("points_history");
    setIsDetail(true);
  };

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
      {isDetail && tab === "member_list"      && <LoyaltyWallet      onBackProps={handleBack} onViewHistory={handleViewHistory} />}
      {isDetail && tab === "membership_class" && <MembershipClass     onBackProps={handleBack} />}
      {isDetail && tab === "points_history"   && <LoyaltyPointLedger  onBackProps={(v) => { setInitialCustomerId(null); handleBack(v); }} initialCustomerId={initialCustomerId} />}
      {isDetail && tab === "loyalty_rules"    && <SettingLoyalty      onBackProps={handleBack} />}
      {isDetail && tab === "loyalty_report"   && <LoyaltyReportPage   onBackProps={handleBack} />}
    </div>
  );
}