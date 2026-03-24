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

/* ═══════════════════════════════════════════════════
   PHẦN THƯỞNG & ĐỔI ĐIỂM
═══════════════════════════════════════════════════ */

const MOCK_REWARDS = [
  { id: 1, type: "Voucher",   name: "Voucher 50.000đ",      points: 500,  used: 45,  total: 100, expiry: "31/03/2026" },
  { id: 2, type: "Voucher",   name: "Voucher 100.000đ",     points: 900,  used: 23,  total: 50,  expiry: "30/04/2026" },
  { id: 3, type: "Dịch vụ",  name: "Freeship 1 đơn",       points: 200,  used: 312, total: 999, expiry: ""           },
  { id: 4, type: "Voucher",   name: "Giảm 10% đơn hàng",   points: 300,  used: 89,  total: 200, expiry: "30/04/2026" },
  { id: 5, type: "Quà tặng", name: "Quà tặng bí ẩn",       points: 2000, used: 5,   total: 20,  expiry: "15/04/2026" },
  { id: 6, type: "Hạng TV",  name: "Tháng Gold miễn phí",  points: 5000, used: 2,   total: 10,  expiry: "15/04/2026" },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Voucher:    { bg: "#FEF3C7", color: "#92400E" },
  "Dịch vụ": { bg: "#E6F1FB", color: "#1D4ED8" },
  "Quà tặng": { bg: "#FCE7F3", color: "#9D174D" },
  "Hạng TV":  { bg: "#EDE9FE", color: "#5B21B6" },
};

function RewardsExchangePage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Phần thưởng & Đổi điểm";
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Voucher", points: "", total_limit: "", expiry: "" });

  const titleActions: ITitleActions = {
    actions: [{ title: "+ Thêm phần thưởng", color: "primary", callback: () => setShowForm(true) }],
  };

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Phần thưởng & Đổi điểm"
        titleBack="Khách hàng thành viên"
        titleActions={showForm ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        {[
          { label: "Phần thưởng",      value: String(MOCK_REWARDS.length), color: "purple" },
          { label: "Đã đổi tháng này", value: "476",                       color: "green"  },
          { label: "Điểm đã tiêu",     value: "98.200",                    color: "orange" },
          { label: "Tỷ lệ đổi điểm",  value: "68%",                       color: "blue"   },
        ].map(s => (
          <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
            <div className="promo-stat-card__body">
              <div className="promo-stat-card__content">
                <p className="promo-stat-card__label">{s.label}</p>
                <p className="promo-stat-card__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mcp-form-card">
          <div className="mcp-form-card__title">Thêm phần thưởng mới</div>
          <div className="mcp-form-row">
            {[
              { label: "Tên phần thưởng *", key: "name",        type: "text",   placeholder: "VD: Voucher 50.000đ" },
              { label: "Điểm cần đổi *",    key: "points",      type: "number", placeholder: "VD: 500" },
              { label: "Giới hạn tổng",     key: "total_limit", type: "number", placeholder: "Để trống = không giới hạn" },
              { label: "Ngày hết hạn",      key: "expiry",      type: "date",   placeholder: "" },
            ].map(f => (
              <div key={f.key} className="mcp-field">
                <label>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder} />
              </div>
            ))}
            <div className="mcp-field">
              <label>Loại</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Voucher</option><option>Dịch vụ</option>
                <option>Quà tặng</option><option>Hạng TV</option>
              </select>
            </div>
          </div>
          <div className="mcp-form-actions">
            <button className="mcp-btn mcp-btn--secondary" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="mcp-btn mcp-btn--primary"
              onClick={() => { alert("Đã lưu (demo)"); setShowForm(false); }}>
              Lưu phần thưởng
            </button>
          </div>
        </div>
      )}

      <div className="mcp-rewards-grid">
        {MOCK_REWARDS.map(r => {
          const cfg = TYPE_COLORS[r.type] || { bg: "#F3F4F6", color: "#374151" };
          const pct = Math.round((r.used / (r.total || 1)) * 100);
          return (
            <div className="mcp-reward-card" key={r.id}>
              <div className="mcp-reward-card__header">
                <span className="mcp-reward-type" style={{ background: cfg.bg, color: cfg.color }}>{r.type}</span>
                <span className="mcp-reward-points">{r.points.toLocaleString()} <span>điểm</span></span>
              </div>
              <div className="mcp-reward-name">{r.name}</div>
              <div className="mcp-progress-wrap">
                <div className="mcp-progress-bar">
                  <div className="mcp-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="mcp-progress-text">Đã đổi: {r.used}/{r.total || "∞"} ({pct}%)</span>
              </div>
              {r.expiry && <div className="mcp-reward-expiry">HSD: {r.expiry}</div>}
              <div className="mcp-reward-actions">
                <button className="mcp-btn mcp-btn--secondary mcp-btn--sm">Chỉnh sửa</button>
                <button className="mcp-btn mcp-btn--primary mcp-btn--sm">Xem chi tiết</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BÁO CÁO THÀNH VIÊN
═══════════════════════════════════════════════════ */

const RETENTION_DATA = [
  { m: "Jan", l: 1300, n: 3200 }, { m: "Feb", l: 1450, n: 3100 }, { m: "Mar", l: 1400, n: 2950 },
  { m: "Apr", l: 1600, n: 2700 }, { m: "May", l: 1700, n: 2550 }, { m: "Jun", l: 1850, n: 2350 },
  { m: "Jul", l: 1900, n: 2150 }, { m: "Aug", l: 2050, n: 2050 }, { m: "Sep", l: 2100, n: 2200 },
  { m: "Oct", l: 2300, n: 2100 }, { m: "Nov", l: 2450, n: 1950 }, { m: "Dec", l: 2650, n: 1780 },
];

const CLV_DATA = [
  { tier: "Kim Cương", clv: 28500000, color: "#06B6D4" },
  { tier: "Vàng",      clv: 12300000, color: "#F59E0B" },
  { tier: "Bạc",       clv:  5800000, color: "#94A3B8" },
  { tier: "Đồng",      clv:  1900000, color: "#D97706" },
];

function LoyaltyReportPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Báo cáo thành viên";
  const maxR = Math.max(...RETENTION_DATA.map(d => Math.max(d.l, d.n)));

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Báo cáo thành viên"
        titleBack="Khách hàng thành viên"
        onBackProps={onBackProps}
      />

      <div className="promo-stats-grid">
        {[
          { label: "Tổng thành viên loyalty", value: "5.200",   color: "purple" },
          { label: "CLV trung bình",           value: "4.2M",    color: "green"  },
          { label: "Tỷ lệ giữ chân",           value: "87%",     color: "blue"   },
          { label: "Tần suất mua TB",          value: "18 ngày", color: "orange" },
        ].map(s => (
          <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
            <div className="promo-stat-card__body">
              <div className="promo-stat-card__content">
                <p className="promo-stat-card__label">{s.label}</p>
                <p className="promo-stat-card__value">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mcp-charts-row">
        <div className="mcp-chart-card">
          <div className="mcp-chart-title">Tỷ lệ Giữ Chân — Loyalty vs Non-Loyalty</div>
          <div className="mcp-chart-subtitle">Số lượng khách hàng theo tháng — 2025</div>
          <svg viewBox="0 0 500 180" style={{ width: "100%", height: 180 }}>
            {[0, 1000, 2000, 3000].map(v => (
              <line key={v} x1={40} y1={170 - (v / maxR) * 150} x2={490}
                y2={170 - (v / maxR) * 150} stroke="#E5E7EB" strokeWidth={0.5} />
            ))}
            <polyline fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth={2}
              points={RETENTION_DATA.map((d, i) =>
                `${40 + (i / (RETENTION_DATA.length - 1)) * 450},${170 - (d.l / maxR) * 150}`
              ).join(" ")} />
            <polyline fill="none" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="5 3"
              points={RETENTION_DATA.map((d, i) =>
                `${40 + (i / (RETENTION_DATA.length - 1)) * 450},${170 - (d.n / maxR) * 150}`
              ).join(" ")} />
            {RETENTION_DATA.map((d, i) => (
              <text key={d.m} x={40 + (i / (RETENTION_DATA.length - 1)) * 450} y={178}
                textAnchor="middle" style={{ fontSize: 9, fill: "#9CA3AF" }}>{d.m}</text>
            ))}
          </svg>
          <div className="mcp-chart-legend">
            <span style={{ color: "#F97316" }}>● Loyalty</span>
            <span style={{ color: "#3B82F6" }}>● Non-Loyalty</span>
          </div>
        </div>

        <div className="mcp-chart-card">
          <div className="mcp-chart-title">CLV trung bình theo hạng</div>
          <div className="mcp-chart-subtitle">Giá trị vòng đời khách hàng</div>
          <div className="mcp-clv-list">
            {CLV_DATA.map(c => (
              <div className="mcp-clv-row" key={c.tier}>
                <div className="mcp-clv-tier">{c.tier}</div>
                <div className="mcp-clv-bar-wrap">
                  <div className="mcp-clv-bar"
                    style={{ width: `${(c.clv / CLV_DATA[0].clv) * 100}%`, background: c.color }} />
                </div>
                <div className="mcp-clv-val">{(c.clv / 1000000).toFixed(1)}M</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
