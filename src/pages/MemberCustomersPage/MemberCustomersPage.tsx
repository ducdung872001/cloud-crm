import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./MemberCustomersPage.scss";
import LoyaltyWallet from "../LoyaltyWallet";
import MembershipClass from "../MembershipClass/MembershipClass";
import LoyaltyPointLedger from "../LoyaltyPointLedger";
import LoyaltyReward from "../LoyaltyReward";
import ExchangePoints from "../ExchangePoints";
import SettingLoyaltyList from "../SettingLoyaltyList";
import Icon from "components/icon";

type TabKey =
  | "member_list"
  | "membership_class"
  | "points_history"
  | "loyalty_rules"
  | "rewards_exchange"
  | "loyalty_report"
  | null;

interface SectionCard {
  title: string;
  tab: TabKey;
  icon: string;
  des: string;
  backgroundColor: string;
  strokeColor?: string;
}

const SECTION_DATA: Array<{
  label: string;
  color: string;
  cards: SectionCard[];
}> = [
  {
    label: "Dữ liệu thành viên",
    color: "#EEEDFE",
    cards: [
      {
        title: "Danh sách thành viên",
        tab: "member_list",
        backgroundColor: "#EEEDFE",
        icon: "MemberCustomerList",
        des: "Quản lý toàn bộ hội viên, tìm kiếm và xem thông tin chi tiết từng thành viên",
      },
      {
        title: "Hạng thành viên",
        tab: "membership_class",
        backgroundColor: "#FAEEDA",
        icon: "MembershipClass",
        des: "Phân loại hội viên theo hạng (Bạc, Vàng, Kim cương) với quyền lợi riêng mỗi hạng",
      },
      {
        title: "Lịch sử điểm",
        tab: "points_history",
        backgroundColor: "#E6F1FB",
        icon: "PointsHistory",
        des: "Tra cứu toàn bộ lịch sử tích điểm, đổi điểm và biến động điểm của hội viên",
      },
    ],
  },
  {
    label: "Cấu hình chương trình",
    color: "#E1F5EE",
    cards: [
      {
        title: "Quy tắc tích điểm",
        tab: "loyalty_rules",
        backgroundColor: "#E1F5EE",
        icon: "AccumulatePoints",
        des: "Cấu hình quy tắc tích điểm theo đơn hàng, sản phẩm hoặc hành vi mua sắm",
      },
      {
        title: "Phần thưởng & Đổi điểm",
        tab: "rewards_exchange",
        backgroundColor: "#FAECE7",
        icon: "ExchangePoints",
        des: "Quản lý phần thưởng và thiết lập chương trình đổi điểm lấy quà, voucher cho hội viên",
      },
    ],
  },
  {
    label: "Phân tích & Báo cáo",
    color: "#FAECE7",
    cards: [
      {
        title: "Báo cáo thành viên",
        tab: "loyalty_report",
        backgroundColor: "#fef3c7",
        icon: "LoyaltyMenu",
        des: "Phân tích tỷ lệ giữ chân, giá trị vòng đời khách hàng và hiệu quả chương trình loyalty",
      },
    ],
  },
];

export default function MemberCustomersPage() {
  document.title = "Loyalty & Thành viên";

  const [tab, setTab] = useState<TabKey>(null);
  const [isDetail, setIsDetail] = useState(false);

  const handleBack = () => setIsDetail(false);

  const renderContent = () => {
    if (!isDetail) return null;

    const backProps = { onBackProps: (v: boolean) => v && handleBack() };

    switch (tab) {
      case "member_list":
        return <LoyaltyWallet {...backProps} />;
      case "membership_class":
        return <MembershipClass {...backProps} />;
      case "points_history":
        return <LoyaltyPointLedger {...backProps} />;
      case "loyalty_rules":
        return <SettingLoyaltyList {...backProps} />;
      case "rewards_exchange":
        return <RewardsExchangePage {...backProps} />;
      case "loyalty_report":
        return <LoyaltyReportPage {...backProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Loyalty & Thành viên" />}

      {!isDetail && (
        <div className="member-page-sections">
          {SECTION_DATA.map((section) => (
            <div key={section.label} className="member-section">
              <div className="member-section__header">
                <span
                  className="member-section__dot"
                  style={{ background: section.color }}
                />
                <span className="member-section__label">{section.label}</span>
              </div>
              <div className="member-section__grid">
                {section.cards.map((card) => (
                  <div
                    key={card.tab}
                    className="member-card"
                    style={{ borderLeft: `4px solid ${section.color}` }}
                    onClick={() => {
                      setTab(card.tab);
                      setIsDetail(true);
                    }}
                  >
                    <div
                      className="member-card__icon-wrap"
                      style={{ background: card.backgroundColor }}
                    >
                      <Icon iconName={card.icon} />
                    </div>
                    <div className="member-card__body">
                      <div className="member-card__title">{card.title}</div>
                      <div className="member-card__desc">{card.des}</div>
                    </div>
                    <div className="member-card__arrow">
                      <Icon iconName="RightArrow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {renderContent()}
    </div>
  );
}

/* ─── Inline placeholder pages for new sections ─── */

function RewardsExchangePage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Phần thưởng & Đổi điểm";
  return (
    <div className="page-content">
      <TitleAction
        title="Phần thưởng & Đổi điểm"
        breadcrumb={[{ title: "Loyalty & Thành viên", onClick: () => onBackProps(true) }]}
      />
      <RewardsExchangeContent />
    </div>
  );
}

function LoyaltyReportPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Báo cáo thành viên";
  return (
    <div className="page-content">
      <TitleAction
        title="Báo cáo thành viên"
        breadcrumb={[{ title: "Loyalty & Thành viên", onClick: () => onBackProps(true) }]}
      />
      <LoyaltyReportContent />
    </div>
  );
}

/* ─── Rewards & Exchange unified content ─── */

const MOCK_REWARDS = [
  { id: 1, type: "Voucher", name: "Voucher 50.000đ", points: 500, used: 45, total: 100, expiry: "31/03/2026", status: "active" },
  { id: 2, type: "Voucher", name: "Voucher 100.000đ", points: 900, used: 23, total: 50, expiry: "30/04/2026", status: "active" },
  { id: 3, type: "Dịch vụ", name: "Freeship 1 đơn", points: 200, used: 312, total: 999, expiry: "", status: "active" },
  { id: 4, type: "Voucher", name: "Giảm 10% đơn hàng", points: 300, used: 89, total: 200, expiry: "30/04/2026", status: "active" },
  { id: 5, type: "Quà tặng", name: "Quà tặng bí ẩn", points: 2000, used: 5, total: 20, expiry: "15/04/2026", status: "active" },
  { id: 6, type: "Hạng TV", name: "Tháng Gold miễn phí", points: 5000, used: 2, total: 10, expiry: "15/04/2026", status: "pending" },
];

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Voucher: { bg: "#FEF3C7", color: "#92400E" },
  "Dịch vụ": { bg: "#E6F1FB", color: "#1D4ED8" },
  "Quà tặng": { bg: "#FCE7F3", color: "#9D174D" },
  "Hạng TV": { bg: "#EDE9FE", color: "#5B21B6" },
};

function RewardsExchangeContent() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Voucher", points: "", description: "", total_limit: "", expiry: "" });

  const stats = {
    total: 6,
    redeemed_month: 476,
    points_used: 98200,
    rate: 68,
  };

  const handleSave = () => {
    alert("Đã lưu phần thưởng (demo)");
    setShowForm(false);
    setForm({ name: "", type: "Voucher", points: "", description: "", total_limit: "", expiry: "" });
  };

  return (
    <div className="rewards-exchange-content">
      {/* Stats row */}
      <div className="re-stats">
        {[
          { label: "Phần thưởng", value: stats.total, color: "#7C3AED", icon: "🎁" },
          { label: "Đã đổi tháng này", value: stats.redeemed_month.toLocaleString(), color: "#059669", icon: "✅" },
          { label: "Điểm đã tiêu", value: stats.points_used.toLocaleString(), color: "#D97706", icon: "⭐" },
          { label: "Tỷ lệ đổi điểm", value: `${stats.rate}%`, color: "#7C3AED", icon: "📊" },
        ].map((s) => (
          <div className="re-stat-card" key={s.label}>
            <div className="re-stat-card__icon">{s.icon}</div>
            <div>
              <div className="re-stat-card__label">{s.label}</div>
              <div className="re-stat-card__value" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="re-toolbar">
        <input className="re-search" placeholder="Tìm phần thưởng..." />
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Thêm phần thưởng
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="re-form-card">
          <div className="re-form-card__title">Thêm phần thưởng mới</div>
          <div className="re-form-row">
            <div className="re-form-field">
              <label>Tên phần thưởng *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Voucher 50.000đ" />
            </div>
            <div className="re-form-field">
              <label>Loại phần thưởng *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Voucher">Voucher giảm giá</option>
                <option value="Dịch vụ">Dịch vụ</option>
                <option value="Quà tặng">Quà tặng vật lý</option>
                <option value="Hạng TV">Nâng hạng thành viên</option>
              </select>
            </div>
            <div className="re-form-field">
              <label>Điểm cần đổi *</label>
              <input type="number" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} placeholder="VD: 500" />
            </div>
            <div className="re-form-field">
              <label>Giới hạn tổng</label>
              <input type="number" value={form.total_limit} onChange={e => setForm({ ...form, total_limit: e.target.value })} placeholder="Để trống = không giới hạn" />
            </div>
            <div className="re-form-field">
              <label>Ngày hết hạn</label>
              <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
            </div>
          </div>
          <div className="re-form-actions">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSave}>Lưu phần thưởng</button>
          </div>
        </div>
      )}

      {/* Rewards grid */}
      <div className="re-rewards-grid">
        {MOCK_REWARDS.map((r) => {
          const colorInfo = TYPE_COLORS[r.type] || { bg: "#F3F4F6", color: "#374151" };
          const pct = Math.round((r.used / (r.total || 1)) * 100);
          return (
            <div className="re-reward-card" key={r.id}>
              <div className="re-reward-card__header">
                <span className="re-reward-type" style={{ background: colorInfo.bg, color: colorInfo.color }}>{r.type}</span>
                <span className="re-reward-points">{r.points.toLocaleString()} <span>điểm</span></span>
              </div>
              <div className="re-reward-name">{r.name}</div>
              <div className="re-reward-progress">
                <div className="re-progress-bar">
                  <div className="re-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="re-progress-text">Đã đổi: {r.used}/{r.total || "∞"} ({pct}%)</span>
              </div>
              {r.expiry && <div className="re-reward-expiry">HSD: {r.expiry}</div>}
              <div className="re-reward-actions">
                <button className="btn-secondary btn-sm">Chỉnh sửa</button>
                <button className="btn-primary btn-sm">Xem chi tiết</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Loyalty Report Content ─── */

function LoyaltyReportContent() {
  const retentionData = [
    { month: "Jan", loyalty: 1300, nonLoyalty: 3200 },
    { month: "Feb", loyalty: 1450, nonLoyalty: 3100 },
    { month: "Mar", loyalty: 1400, nonLoyalty: 2950 },
    { month: "Apr", loyalty: 1600, nonLoyalty: 2700 },
    { month: "May", loyalty: 1700, nonLoyalty: 2550 },
    { month: "Jun", loyalty: 1850, nonLoyalty: 2350 },
    { month: "Jul", loyalty: 1900, nonLoyalty: 2150 },
    { month: "Aug", loyalty: 2050, nonLoyalty: 2050 },
    { month: "Sep", loyalty: 2100, nonLoyalty: 2200 },
    { month: "Oct", loyalty: 2300, nonLoyalty: 2100 },
    { month: "Nov", loyalty: 2450, nonLoyalty: 1950 },
    { month: "Dec", loyalty: 2650, nonLoyalty: 1780 },
  ];

  const clvData = [
    { tier: "Kim Cương", clv: 28500000, color: "#06B6D4" },
    { tier: "Vàng", clv: 12300000, color: "#F59E0B" },
    { tier: "Bạc", clv: 5800000, color: "#94A3B8" },
    { tier: "Đồng", clv: 1900000, color: "#D97706" },
  ];

  const maxRetention = Math.max(...retentionData.map(d => Math.max(d.loyalty, d.nonLoyalty)));

  return (
    <div className="loyalty-report-content">
      {/* KPI cards */}
      <div className="lr-kpi-row">
        {[
          { label: "Tổng thành viên loyalty", value: "5.200", change: "+12%", color: "#7C3AED" },
          { label: "CLV trung bình", value: "4.2M", change: "+7%", color: "#059669" },
          { label: "Tỷ lệ giữ chân", value: "87%", change: "+2%", color: "#2563EB" },
          { label: "Tần suất mua TB", value: "18 ngày", change: "-1 ngày", color: "#D97706" },
        ].map(k => (
          <div className="lr-kpi-card" key={k.label}>
            <div className="lr-kpi-label">{k.label}</div>
            <div className="lr-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="lr-kpi-change" style={{ color: k.change.startsWith("+") ? "#059669" : "#DC2626" }}>{k.change} so với tháng trước</div>
          </div>
        ))}
      </div>

      <div className="lr-charts-row">
        {/* Retention line chart (SVG) */}
        <div className="lr-chart-card">
          <div className="lr-chart-title">Tỷ lệ Giữ Chân Khách Hàng (Retention Rate)</div>
          <div className="lr-chart-subtitle">So sánh Thành Viên Loyalty vs Non-Loyalty năm 2025</div>
          <svg viewBox="0 0 520 200" style={{ width: "100%", height: 200 }}>
            {/* Grid lines */}
            {[0, 1000, 2000, 3000, 4000].map(v => {
              const y = 180 - (v / maxRetention) * 160;
              return <line key={v} x1={40} y1={y} x2={510} y2={y} stroke="#E5E7EB" strokeWidth={0.5} />;
            })}
            {/* Loyalty line */}
            <polyline
              fill="rgba(249,115,22,0.12)"
              stroke="#F97316"
              strokeWidth={2}
              points={retentionData.map((d, i) => {
                const x = 40 + (i / (retentionData.length - 1)) * 470;
                const y = 180 - (d.loyalty / maxRetention) * 160;
                return `${x},${y}`;
              }).join(" ")}
            />
            {/* Non-loyalty line */}
            <polyline
              fill="rgba(59,130,246,0.08)"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 3"
              points={retentionData.map((d, i) => {
                const x = 40 + (i / (retentionData.length - 1)) * 470;
                const y = 180 - (d.nonLoyalty / maxRetention) * 160;
                return `${x},${y}`;
              }).join(" ")}
            />
            {/* Month labels */}
            {retentionData.map((d, i) => (
              <text key={d.month} x={40 + (i / (retentionData.length - 1)) * 470} y={195} textAnchor="middle" fontSize={9} fill="#9CA3AF">{d.month}</text>
            ))}
          </svg>
          <div className="lr-chart-legend">
            <span style={{ color: "#F97316" }}>● Thành viên Loyalty</span>
            <span style={{ color: "#3B82F6" }}>● Thành viên Non-Loyalty</span>
          </div>
        </div>

        {/* CLV by tier */}
        <div className="lr-chart-card">
          <div className="lr-chart-title">CLV trung bình theo hạng thành viên</div>
          <div className="lr-chart-subtitle">Giá trị vòng đời khách hàng (CLV)</div>
          <div className="lr-clv-bars">
            {clvData.map(c => (
              <div className="lr-clv-row" key={c.tier}>
                <div className="lr-clv-tier">{c.tier}</div>
                <div className="lr-clv-bar-wrap">
                  <div
                    className="lr-clv-bar"
                    style={{
                      width: `${(c.clv / clvData[0].clv) * 100}%`,
                      background: c.color,
                    }}
                  />
                </div>
                <div className="lr-clv-val">{(c.clv / 1000000).toFixed(1)}M</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
