import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import "./MemberCustomersPage.scss";
import TabMenuList from "@/components/TabMenuList/TabMenuList";
import LoyaltyWallet from "../LoyaltyWallet";
import MembershipClass from "../MembershipClass/MembershipClass";
import LoyaltyPointLedger from "../LoyaltyPointLedger";
import LoyaltyReward from "../LoyaltyReward";
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

export default function MemberCustomersPage() {
  document.title = "Loyalty & Thành viên";

  const [tab, setTab] = useState<TabKey>(null);
  const [isDetail, setIsDetail] = useState(false);

  // Flat list dùng TabMenuList — cùng pattern với tất cả hub pages khác.
  // Thứ tự có chủ đích: Dữ liệu thành viên → Cấu hình → Báo cáo.
  const listTab = [
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
    {
      title: "Báo cáo thành viên",
      tab: "loyalty_report",
      backgroundColor: "#fef3c7",
      icon: "LoyaltyMenu",
      des: "Phân tích tỷ lệ giữ chân, giá trị vòng đời khách hàng và hiệu quả chương trình loyalty",
    },
  ];

  const handleBack = (v: boolean) => v && setIsDetail(false);

  return (
    <div className="page-content">
      {!isDetail && <TitleAction title="Loyalty & Thành viên" />}

      {!isDetail && (
        <TabMenuList
          listTab={listTab}
          onClick={(item) => {
            setTab(item.tab as TabKey);
            setIsDetail(true);
          }}
        />
      )}

      {/* Existing pages — already have HeaderTabMenu internally */}
      {isDetail && tab === "member_list"      && <LoyaltyWallet       onBackProps={handleBack} />}
      {isDetail && tab === "membership_class" && <MembershipClass      onBackProps={handleBack} />}
      {isDetail && tab === "points_history"   && <LoyaltyPointLedger   onBackProps={handleBack} />}
      {isDetail && tab === "loyalty_rules"    && <SettingLoyaltyList   onBackProps={handleBack} />}

      {/* New pages — use HeaderTabMenu below */}
      {isDetail && tab === "rewards_exchange" && <RewardsExchangePage  onBackProps={handleBack} />}
      {isDetail && tab === "loyalty_report"   && <LoyaltyReportPage    onBackProps={handleBack} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Phần thưởng & Đổi điểm
───────────────────────────────────────────── */

const MOCK_REWARDS = [
  { id: 1, type: "Voucher",   name: "Voucher 50.000đ",      points: 500,  used: 45,  total: 100, expiry: "31/03/2026", status: "active"  },
  { id: 2, type: "Voucher",   name: "Voucher 100.000đ",     points: 900,  used: 23,  total: 50,  expiry: "30/04/2026", status: "active"  },
  { id: 3, type: "Dịch vụ",   name: "Freeship 1 đơn",       points: 200,  used: 312, total: 999, expiry: "",           status: "active"  },
  { id: 4, type: "Voucher",   name: "Giảm 10% đơn hàng",   points: 300,  used: 89,  total: 200, expiry: "30/04/2026", status: "active"  },
  { id: 5, type: "Quà tặng",  name: "Quà tặng bí ẩn",      points: 2000, used: 5,   total: 20,  expiry: "15/04/2026", status: "active"  },
  { id: 6, type: "Hạng TV",   name: "Tháng Gold miễn phí", points: 5000, used: 2,   total: 10,  expiry: "15/04/2026", status: "pending" },
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

  const titleActions = {
    actions: [{ title: "+ Thêm phần thưởng", color: "primary" as const, callback: () => setShowForm(true) }],
  };

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Phần thưởng & Đổi điểm"
        titleBack="Loyalty & Thành viên"
        titleActions={showForm ? undefined : titleActions}
        onBackProps={onBackProps}
      />

      {/* Stats */}
      <div className="promo-stats-grid">
        {[
          { label: "Phần thưởng",      value: "6",     color: "purple" },
          { label: "Đã đổi tháng này", value: "476",   color: "green"  },
          { label: "Điểm đã tiêu",     value: "98.200", color: "orange" },
          { label: "Tỷ lệ đổi điểm",  value: "68%",   color: "blue"   },
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

      {/* Add form */}
      {showForm && (
        <div className="mcp-form-card">
          <div className="mcp-form-card__title">Thêm phần thưởng mới</div>
          <div className="mcp-form-row">
            <div className="mcp-field">
              <label>Tên phần thưởng *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Voucher 50.000đ" />
            </div>
            <div className="mcp-field">
              <label>Loại</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Voucher">Voucher giảm giá</option>
                <option value="Dịch vụ">Dịch vụ</option>
                <option value="Quà tặng">Quà tặng vật lý</option>
                <option value="Hạng TV">Nâng hạng thành viên</option>
              </select>
            </div>
            <div className="mcp-field">
              <label>Điểm cần đổi *</label>
              <input type="number" value={form.points} onChange={e => setForm({ ...form, points: e.target.value })} placeholder="VD: 500" />
            </div>
            <div className="mcp-field">
              <label>Giới hạn tổng</label>
              <input type="number" value={form.total_limit} onChange={e => setForm({ ...form, total_limit: e.target.value })} placeholder="Không giới hạn nếu để trống" />
            </div>
            <div className="mcp-field">
              <label>Ngày hết hạn</label>
              <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} />
            </div>
          </div>
          <div className="mcp-form-actions">
            <button className="mcp-btn mcp-btn--secondary" onClick={() => setShowForm(false)}>Hủy</button>
            <button className="mcp-btn mcp-btn--primary" onClick={() => { alert("Đã lưu (demo)"); setShowForm(false); }}>Lưu phần thưởng</button>
          </div>
        </div>
      )}

      {/* Rewards grid */}
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
                <div className="mcp-progress-bar"><div className="mcp-progress-fill" style={{ width: `${pct}%` }} /></div>
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

/* ─────────────────────────────────────────────
   Báo cáo thành viên
───────────────────────────────────────────── */

const RETENTION_DATA = [
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

const CLV_DATA = [
  { tier: "Kim Cương", clv: 28500000, color: "#06B6D4" },
  { tier: "Vàng",      clv: 12300000, color: "#F59E0B" },
  { tier: "Bạc",       clv: 5800000,  color: "#94A3B8" },
  { tier: "Đồng",      clv: 1900000,  color: "#D97706" },
];

function LoyaltyReportPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Báo cáo thành viên";
  const maxR = Math.max(...RETENTION_DATA.map(d => Math.max(d.loyalty, d.nonLoyalty)));

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Báo cáo thành viên"
        titleBack="Loyalty & Thành viên"
        onBackProps={onBackProps}
      />

      {/* Stats */}
      <div className="promo-stats-grid">
        {[
          { label: "Tổng thành viên loyalty", value: "5.200", color: "purple" },
          { label: "CLV trung bình",           value: "4.2M",  color: "green"  },
          { label: "Tỷ lệ giữ chân",           value: "87%",   color: "blue"   },
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
        {/* Retention line chart */}
        <div className="mcp-chart-card">
          <div className="mcp-chart-title">Tỷ lệ Giữ Chân Khách Hàng (Retention Rate)</div>
          <div className="mcp-chart-subtitle">So sánh Loyalty vs Non-Loyalty — năm 2025</div>
          <svg viewBox="0 0 500 180" style={{ width: "100%", height: 180 }}>
            {[0, 1000, 2000, 3000, 4000].map(v => (
              <line key={v} x1={40} y1={170 - (v / maxR) * 150} x2={490} y2={170 - (v / maxR) * 150} stroke="#E5E7EB" strokeWidth={0.5} />
            ))}
            <polyline
              fill="rgba(249,115,22,0.1)" stroke="#F97316" strokeWidth={2}
              points={RETENTION_DATA.map((d, i) => `${40 + (i / (RETENTION_DATA.length - 1)) * 450},${170 - (d.loyalty / maxR) * 150}`).join(" ")}
            />
            <polyline
              fill="rgba(59,130,246,0.06)" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="5 3"
              points={RETENTION_DATA.map((d, i) => `${40 + (i / (RETENTION_DATA.length - 1)) * 450},${170 - (d.nonLoyalty / maxR) * 150}`).join(" ")}
            />
            {RETENTION_DATA.map((d, i) => (
              <text key={d.month} x={40 + (i / (RETENTION_DATA.length - 1)) * 450} y={178} textAnchor="middle" style={{ fontSize: 9, fill: "#9CA3AF" }}>{d.month}</text>
            ))}
          </svg>
          <div className="mcp-chart-legend">
            <span style={{ color: "#F97316" }}>● Loyalty</span>
            <span style={{ color: "#3B82F6" }}>● Non-Loyalty</span>
          </div>
        </div>

        {/* CLV by tier */}
        <div className="mcp-chart-card">
          <div className="mcp-chart-title">CLV trung bình theo hạng</div>
          <div className="mcp-chart-subtitle">Giá trị vòng đời khách hàng (CLV)</div>
          <div className="mcp-clv-list">
            {CLV_DATA.map(c => (
              <div className="mcp-clv-row" key={c.tier}>
                <div className="mcp-clv-tier">{c.tier}</div>
                <div className="mcp-clv-bar-wrap">
                  <div className="mcp-clv-bar" style={{ width: `${(c.clv / CLV_DATA[0].clv) * 100}%`, background: c.color }} />
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
