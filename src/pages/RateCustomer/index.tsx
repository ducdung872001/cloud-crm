import React, { useState } from "react";
import Icon from "components/icon";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

import "./index.scss";

// Mock Data
const mockReviews = [
  { id: 1, customer: 'Nguyễn Thị Lan', stars: 5, comment: 'Sản phẩm rất tốt, giao hàng nhanh!', product: 'Sản phẩm A', date: '15/03/2026', status: 'published' },
  { id: 2, customer: 'Trần Văn Minh', stars: 4, comment: 'Chất lượng ổn, giá hợp lý.', product: 'Sản phẩm B', date: '14/03/2026', status: 'published' },
  { id: 3, customer: 'Lê Thị Hoa', stars: 2, comment: 'Sản phẩm không như mô tả.', product: 'Sản phẩm C', date: '13/03/2026', status: 'pending' },
  { id: 4, customer: 'Phạm Quốc Bảo', stars: 5, comment: 'Tuyệt vời! Sẽ mua lại.', product: 'Sản phẩm A', date: '12/03/2026', status: 'published' },
  { id: 5, customer: 'Hoàng Thị Mai', stars: 3, comment: 'Bình thường, không có gì đặc biệt.', product: 'Sản phẩm D', date: '11/03/2026', status: 'published' },
];

const dbStats = [
  { s: '5 ★', pct: 72, c: '#22c55e' },
  { s: '4 ★', pct: 15, c: '#86efac' },
  { s: '3 ★', pct: 8, c: '#f59e0b' },
  { s: '2 ★', pct: 3, c: '#fb923c' },
  { s: '1 ★', pct: 2, c: '#ef4444' }
];

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "orange" | "blue" | "green" | "purple" | "red" | "yellow";
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, icon, color, trend }) => (
  <div className={`promo-stat-card promo-stat-card--${color}`}>
    <div className="promo-stat-card__body">
      <div className="promo-stat-card__content">
        <p className="promo-stat-card__label">{title}</p>
        <p className="promo-stat-card__value">{value}</p>
        {sub && <p className="promo-stat-card__sub">{sub}</p>}
        {trend !== undefined && (
          <p className={`promo-stat-card__trend ${trend >= 0 ? "promo-stat-card__trend--up" : "promo-stat-card__trend--down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tháng trước
          </p>
        )}
      </div>
      <div className="promo-stat-card__icon">{icon}</div>
    </div>
  </div>
);

const Stars = ({ n }: { n: number }) => (
  <div className="rate-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className={`rate-star ${i <= n ? 'active' : ''}`}>★</span>
    ))}
  </div>
);

const CustomBadge = ({ status }: { status: string }) => {
  const map: any = {
    published: { l: 'published', c: 'rate-badge--published' },
    pending: { l: 'Chờ duyệt', c: 'rate-badge--pending' },
  };
  const { l, c } = map[status] || { l: status, c: 'rate-badge--default' };
  return <span className={`rate-badge ${c}`}>{l}</span>;
}

export default function RateCustomer(props: any) {
  document.title = "Đánh giá khách hàng";
  const { onBackProps } = props;

  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("all");

  const filteredReviews = mockReviews.filter((r) => {
    const matchSearch = search === "" || r.customer.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    const matchStar = starFilter === "all" || r.stars.toString() === starFilter || (starFilter === "3-" && r.stars <= 3);
    return matchSearch && matchStar;
  });

  return (
    <div className="rate-page page-content">
      <HeaderTabMenu
        title="Đánh giá khách hàng"
        titleBack="Chăm sóc khách hàng"
        titleActions={{ actions: [] }}
        onBackProps={onBackProps}
      />
      <div className="rate-page__header-spacer"></div>

      <div className="promo-stats-grid">
        <StatCard title="Tổng đánh giá" value="1.245" trend={8} icon={<Icon name="ChatText" fill="currentColor" />} color="orange" />
        <StatCard title="Điểm TB" value="4.6/5" icon={<Icon name="ChartLine" fill="currentColor" />} color="green" />
        <StatCard title="5 sao" value="72%" icon={<Icon name="Star" fill="currentColor" />} color="blue" />
        <StatCard title="Chờ duyệt" value="12" icon={<Icon name="Clock" fill="currentColor" />} color="purple" />
      </div>

      <div className="rate-main-grid">
        <div className="rate-list-card">
          <div className="rate-list-card__toolbar">
            <div className="promo-search-wrap">
              <svg className="promo-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Tìm đánh giá..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="promo-search-input"
              />
            </div>
            <select value={starFilter} onChange={(e) => setStarFilter(e.target.value)} className="promo-select">
              <option value="all">Tất cả sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3-">3 sao trở xuống</option>
            </select>
          </div>

          <div className="rate-list">
            {filteredReviews.map(r => (
              <div key={r.id} className="rate-item">
                <div className="rate-item__avatar">{r.customer.charAt(0)}</div>
                <div className="rate-item__content">
                  <div className="rate-item__header">
                    <div className="rate-item__header-left">
                      <p className="rate-item__name">{r.customer}</p>
                      <Stars n={r.stars} />
                    </div>
                    <div className="rate-item__header-right">
                      <CustomBadge status={r.status} />
                      <span className="rate-item__date">{r.date}</span>
                    </div>
                  </div>
                  <p className="rate-item__comment">{r.comment}</p>
                  <span className="rate-item__product">{r.product}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rate-summary-card">
          <h3 className="rate-summary-card__title">Phân bố đánh giá</h3>
          <div className="rate-progress-list">
            {dbStats.map(it => (
              <div key={it.s} className="rate-progress-item">
                <span className="rate-progress-item__label">{it.s}</span>
                <div className="rate-progress-item__bar-bg">
                  <div className="rate-progress-item__bar-fill" style={{ width: `${it.pct}%`, backgroundColor: it.c }}></div>
                </div>
                <span className="rate-progress-item__value" style={{ color: it.c }}>{it.pct}%</span>
              </div>
            ))}
          </div>

          <div className="rate-score-box">
            <p className="rate-score-box__number">4.6</p>
            <div className="rate-score-box__stars">
              <span className="active">★</span>
              <span className="active">★</span>
              <span className="active">★</span>
              <span className="active">★</span>
              <span className="active-half">★</span>
            </div>
            <p className="rate-score-box__label">Điểm trung bình</p>
          </div>
        </div>
      </div>
    </div>
  );
}
