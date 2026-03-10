import React, { useState } from "react";
import "./index.scss";

const CHART_DATA = [8200000, 11500000, 9800000, 13200000, 10600000, 12800000, 14250000];
const CHART_LABELS = ["15/10", "16/10", "17/10", "18/10", "19/10", "20/10", "21/10"];

const TOP_PRODUCTS = [
  { rank: 1, icon: "🥛", name: "Sữa TH True Milk 1L", qty: "142 hộp đã bán", rev: "4,544,000 ₫", pct: 100 },
  { rank: 2, icon: "🥤", name: "Pepsi 330ml", qty: "218 lon đã bán", rev: "2,616,000 ₫", pct: 78 },
  { rank: 3, icon: "🍜", name: "Mì Hảo Hảo Tôm Chua", qty: "380 gói đã bán", rev: "1,710,000 ₫", pct: 62 },
  { rank: 4, icon: "🍵", name: "Trà xanh 0 độ 500ml", qty: "156 chai đã bán", rev: "1,560,000 ₫", pct: 45 },
  { rank: 5, icon: "🧻", name: "Giấy VS Bless You 10 cuộn", qty: "68 gói đã bán", rev: "2,856,000 ₫", pct: 32 },
];

const PAY_METHODS = [
  { emoji: "💵", val: "8,400,000 ₫", label: "Tiền mặt", pct: "59%" },
  { emoji: "📱", val: "3,850,000 ₫", label: "Chuyển khoản", pct: "27%" },
  { emoji: "📷", val: "2,000,000 ₫", label: "QR Pro", pct: "14%" },
  { emoji: "📊", val: "14,250,000 ₫", label: "Tổng doanh thu", pct: "100%", highlight: true },
];

const ORDER_SOURCES = [
  { icon: "🏪", label: "Tại quầy (Offline)", count: 24, pct: 57, color: "var(--lime)" },
  { icon: "🛍️", label: "Shopee", count: 12, pct: 28, color: "var(--orange)" },
  { icon: "🎵", label: "TikTok Shop", count: 6, pct: 14, color: "var(--purple)" },
];

const STAT_CARDS = [
  { icon: "💰", val: "14,250,000 ₫", label: "Doanh thu hôm nay", delta: "↑ +12.4% so hôm qua", up: true, cls: "sc-1" },
  { icon: "📋", val: "42 đơn", label: "Tổng đơn hàng", delta: "↑ +5 đơn so hôm qua", up: true, cls: "sc-2" },
  { icon: "🧾", val: "339,285 ₫", label: "Giá trị trung bình / đơn", delta: "↑ +8.1%", up: true, cls: "sc-3" },
  { icon: "🔄", val: "38 / 42", label: "Tỷ lệ hoàn thành đơn", delta: "↓ 4 đơn chưa xử lý", up: false, cls: "sc-4" },
];

const rankCls = (r: number) => ["r1", "r2", "r3", "rn"][Math.min(r - 1, 3)];

type Period = "today" | "7d" | "30d" | "month";

const Report: React.FC = () => {
  const [period, setPeriod] = useState<Period>("today");
  const max = Math.max(...CHART_DATA);

  return (
    <div className="report">
      {/* ── Toolbar ── */}
      <div className="report__toolbar">
        {(["today", "7d", "30d", "month"] as Period[]).map((p) => {
          const labels: Record<Period, string> = {
            today: "📅 Hôm nay",
            "7d": "7 ngày",
            "30d": "30 ngày",
            month: "Tháng này",
          };
          return (
            <button
              key={p}
              className={`btn ${period === p ? "btn--outline report__period--active" : "btn--ghost"} btn--sm`}
              onClick={() => setPeriod(p)}
            >
              {labels[p]}
            </button>
          );
        })}
        <input type="date" className="ff" defaultValue="2023-10-01" />
        <span className="report__arrow">→</span>
        <input type="date" className="ff" defaultValue="2023-10-21" />
        <button className="btn btn--lime btn--sm">📊 Xem báo cáo</button>
        <div className="report__toolbar-right">
          <button className="btn btn--outline btn--sm">📥 Xuất báo cáo</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="report__body">
        {/* Stat cards */}
        <div className="stats-grid">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-card__icon">{s.icon}</div>
              <div className="stat-card__val">{s.val}</div>
              <div className="stat-card__lbl">{s.label}</div>
              <span className={`stat-card__delta ${s.up ? "delta--up" : "delta--dn"}`}>{s.delta}</span>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="report-grid">
          {/* ── Chart ── */}
          <div className="r-card">
            <div className="r-card__title">
              <span>📈 Doanh thu 7 ngày gần đây</span>
              <select className="r-card__select">
                <option>Doanh thu</option>
                <option>Số đơn</option>
              </select>
            </div>
            <div className="chart-area">
              {CHART_DATA.map((v, i) => {
                const pct = Math.round((v / max) * 100);
                const isLast = i === CHART_DATA.length - 1;
                return (
                  <div key={i} className="chart-col">
                    <div className="chart-bar-wrap">
                      <div
                        className={`chart-bar${isLast ? " chart-bar--active" : ""}`}
                        style={{ height: `${pct}%` }}
                        data-tip={`${(v / 1_000_000).toFixed(1)}M ₫`}
                      />
                    </div>
                    <span className="chart-label">{CHART_LABELS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Top products ── */}
          <div className="r-card">
            <div className="r-card__title">🏆 Sản phẩm bán chạy</div>
            {TOP_PRODUCTS.map((p) => (
              <div key={p.rank} className="top-prod">
                <div className={`tp-rank ${rankCls(p.rank)}`}>{p.rank}</div>
                <div className="tp-icon">{p.icon}</div>
                <div className="tp-info">
                  <div className="tp-name">{p.name}</div>
                  <div className="tp-qty">{p.qty}</div>
                  <div className="tp-bar">
                    <div className="tp-bar__fill" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
                <div className="tp-rev">{p.rev}</div>
              </div>
            ))}
          </div>

          {/* ── Payment methods ── */}
          <div className="r-card">
            <div className="r-card__title">💳 Phương thức thanh toán</div>
            <div className="pay-method-grid">
              {PAY_METHODS.map((m) => (
                <div key={m.label} className={`pm-card${m.highlight ? " pm-card--highlight" : ""}`}>
                  <div className="pm-card__emoji">{m.emoji}</div>
                  <div className={`pm-card__val${m.highlight ? " pm-card__val--lime" : ""}`}>{m.val}</div>
                  <div className="pm-card__lbl">{m.label}</div>
                  <div className={`pm-card__pct${m.highlight ? " pm-card__pct--lime" : ""}`}>{m.pct}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Order sources ── */}
          <div className="r-card">
            <div className="r-card__title">📡 Nguồn đơn hàng</div>
            <div className="order-sources">
              {ORDER_SOURCES.map((s) => (
                <div key={s.label} className="src-row">
                  <span className="src-row__icon">{s.icon}</span>
                  <div className="src-row__info">
                    <div className="src-row__label">{s.label}</div>
                    <div className="src-row__bar">
                      <div className="src-row__bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                  <div className="src-row__count">{s.count} đơn</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* end report-grid */}
      </div>
      {/* end body */}
    </div>
  );
};

export default Report;
