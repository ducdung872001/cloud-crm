import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import { ITitleActions } from "components/titleAction/titleAction";
import "./index.scss";

const MOCK_REVIEWS = [
  { id: 1, customer: "Nguyễn Thị Lan",  stars: 5, comment: "Sản phẩm rất tốt, giao hàng nhanh!", product: "Sản phẩm A", date: "15/03/2026", status: "published", sentiment: "positive" },
  { id: 2, customer: "Trần Văn Minh",   stars: 4, comment: "Chất lượng ổn, giá hợp lý.", product: "Sản phẩm B", date: "14/03/2026", status: "published", sentiment: "positive" },
  { id: 3, customer: "Lê Thị Hoa",      stars: 2, comment: "Sản phẩm không như mô tả.", product: "Sản phẩm C", date: "13/03/2026", status: "pending",   sentiment: "negative" },
  { id: 4, customer: "Phạm Quốc Bảo",  stars: 5, comment: "Tuyệt vời! Sẽ mua lại.", product: "Sản phẩm A", date: "12/03/2026", status: "published", sentiment: "positive" },
  { id: 5, customer: "Hoàng Thị Mai",   stars: 3, comment: "Bình thường, không có gì đặc biệt.", product: "Sản phẩm D", date: "11/03/2026", status: "published", sentiment: "neutral" },
  { id: 6, customer: "Đỗ Thanh Tùng",   stars: 1, comment: "Giao hàng quá chậm, dịch vụ kém.", product: "Sản phẩm B", date: "10/03/2026", status: "pending",   sentiment: "negative" },
  { id: 7, customer: "Vũ Thị Hằng",    stars: 5, comment: "Rất hài lòng, đóng gói cẩn thận.", product: "Sản phẩm E", date: "09/03/2026", status: "published", sentiment: "positive" },
  { id: 8, customer: "Ngô Minh Đức",   stars: 4, comment: "Tốt, sẽ giới thiệu bạn bè.", product: "Sản phẩm A", date: "08/03/2026", status: "published", sentiment: "positive" },
];

const DIST = [
  { label: "5 ★", pct: 72, color: "#22c55e" },
  { label: "4 ★", pct: 15, color: "#86efac" },
  { label: "3 ★", pct: 8,  color: "#f59e0b" },
  { label: "2 ★", pct: 3,  color: "#fb923c" },
  { label: "1 ★", pct: 2,  color: "#ef4444" },
];

const SENTIMENT_TREND = [
  { month: "T10", positive: 68, neutral: 20, negative: 12 },
  { month: "T11", positive: 71, neutral: 18, negative: 11 },
  { month: "T12", positive: 69, neutral: 19, negative: 12 },
  { month: "T1",  positive: 73, neutral: 17, negative: 10 },
  { month: "T2",  positive: 75, neutral: 16, negative:  9 },
  { month: "T3",  positive: 78, neutral: 14, negative:  8 },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="cr-stars">
      {[1,2,3,4,5].map(i => <span key={i} className={`cr-star ${i <= n ? "cr-star--on" : ""}`}>★</span>)}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "Đã đăng",   cls: "cr-badge--published" },
    pending:   { label: "Chờ duyệt", cls: "cr-badge--pending" },
  };
  const { label, cls } = map[status] || { label: status, cls: "" };
  return <span className={`cr-badge ${cls}`}>{label}</span>;
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const map: Record<string, { label: string; color: string }> = {
    positive: { label: "Tích cực",  color: "#16a34a" },
    neutral:  { label: "Trung lập", color: "#d97706" },
    negative: { label: "Tiêu cực",  color: "#dc2626" },
  };
  const { label, color } = map[sentiment] || { label: sentiment, color: "#9ca3af" };
  return <span className="cr-sentiment" style={{ color, background: color + "18" }}>{label}</span>;
}

export default function CustomerReview(props: { onBackProps?: (v: boolean) => void }) {
  document.title = "Đánh giá & phản hồi";
  const { onBackProps } = props;

  const [activeTab, setActiveTab]   = useState<"list" | "analytics">("list");
  const [search, setSearch]         = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [statusFilter, setStatus]   = useState("all");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText]   = useState("");

  const filtered = MOCK_REVIEWS.filter(r => {
    const matchSearch = !search || r.customer.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    const matchStar   = starFilter === "all" || r.stars.toString() === starFilter || (starFilter === "3-" && r.stars <= 3);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStar && matchStatus;
  });

  const pendingCount = MOCK_REVIEWS.filter(r => r.status === "pending").length;

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Đánh giá & phản hồi"
        titleBack="Phân tích khách hàng"
        onBackProps={onBackProps}
      />

      {/* Stats */}
      <div className="promo-stats-grid">
        {[
          { label: "Tổng đánh giá",  value: "1.245", color: "orange" },
          { label: "Điểm trung bình", value: "4.6/5",  color: "green"  },
          { label: "5 sao",           value: "72%",    color: "blue"   },
          { label: "Chờ duyệt",       value: String(pendingCount), color: "purple" },
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

      {/* Tabs */}
      <div className="cr-tabs">
        <button className={`cr-tab ${activeTab === "list" ? "cr-tab--active" : ""}`} onClick={() => setActiveTab("list")}>
          Danh sách đánh giá
        </button>
        <button className={`cr-tab ${activeTab === "analytics" ? "cr-tab--active" : ""}`} onClick={() => setActiveTab("analytics")}>
          Phân tích cảm xúc
        </button>
      </div>

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div>
          <div className="cr-filters">
            <div className="cr-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input placeholder="Tìm theo tên hoặc nội dung..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={starFilter} onChange={e => setStarFilter(e.target.value)}>
              <option value="all">Tất cả sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3-">3 sao trở xuống</option>
            </select>
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>

          <div className="cr-content-grid">
            <div className="cr-review-list">
              {filtered.length === 0
                ? <div className="cr-empty">Không tìm thấy đánh giá nào</div>
                : filtered.map(r => (
                  <div key={r.id} className={`cr-review-item ${r.status === "pending" ? "cr-review-item--pending" : ""}`}>
                    <div className="cr-review-item__avatar">{r.customer.charAt(0)}</div>
                    <div className="cr-review-item__body">
                      <div className="cr-review-item__header">
                        <div className="cr-review-item__meta">
                          <span className="cr-review-item__name">{r.customer}</span>
                          <Stars n={r.stars} />
                          <SentimentDot sentiment={r.sentiment} />
                        </div>
                        <div className="cr-review-item__right">
                          <StatusBadge status={r.status} />
                          <span className="cr-review-item__date">{r.date}</span>
                        </div>
                      </div>
                      <p className="cr-review-item__comment">{r.comment}</p>
                      <div className="cr-review-item__footer">
                        <span className="cr-review-item__product">📦 {r.product}</span>
                        <div className="cr-review-item__actions">
                          {r.status === "pending" && (
                            <button className="cr-btn cr-btn--approve" onClick={() => alert(`Đã duyệt đánh giá #${r.id} (demo)`)}>Duyệt đăng</button>
                          )}
                          <button className="cr-btn cr-btn--reply" onClick={() => { setReplyingId(replyingId === r.id ? null : r.id); setReplyText(""); }}>
                            {replyingId === r.id ? "Hủy" : "Phản hồi"}
                          </button>
                        </div>
                      </div>
                      {replyingId === r.id && (
                        <div className="cr-reply-box">
                          <textarea rows={2} placeholder="Nhập phản hồi..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                          <button className="cr-btn cr-btn--send" onClick={() => { alert(`Đã gửi phản hồi (demo)`); setReplyingId(null); setReplyText(""); }}>Gửi</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="cr-dist-card">
              <div className="cr-dist-card__title">Phân bố đánh giá</div>
              <div className="cr-dist-score">
                <div className="cr-dist-score__num">4.6</div>
                <div className="cr-dist-score__stars">★★★★★</div>
                <div className="cr-dist-score__sub">Điểm trung bình</div>
              </div>
              {DIST.map(d => (
                <div className="cr-dist-row" key={d.label}>
                  <span className="cr-dist-label">{d.label}</span>
                  <div className="cr-dist-bar"><div className="cr-dist-fill" style={{ width: `${d.pct}%`, background: d.color }} /></div>
                  <span className="cr-dist-pct" style={{ color: d.color }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <div className="cr-analytics-view">
          <div className="cr-sentiment-summary">
            {[
              { label: "Tích cực",  value: "78%", icon: "😊", color: "#16a34a", bg: "#f0fdf4" },
              { label: "Trung lập", value: "14%", icon: "😐", color: "#d97706", bg: "#fffbeb" },
              { label: "Tiêu cực",  value: "8%",  icon: "😞", color: "#dc2626", bg: "#fef2f2" },
            ].map(s => (
              <div key={s.label} className="cr-sentiment-card" style={{ borderLeft: `4px solid ${s.color}`, background: s.bg }}>
                <div className="cr-sentiment-card__icon">{s.icon}</div>
                <div>
                  <div className="cr-sentiment-card__val" style={{ color: s.color }}>{s.value}</div>
                  <div className="cr-sentiment-card__lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Xu hướng cảm xúc theo tháng</div>
            <div className="cr-chart-card__subtitle">% đánh giá tích cực / trung lập / tiêu cực</div>
            <div className="cr-stacked-chart">
              {SENTIMENT_TREND.map(d => (
                <div key={d.month} className="cr-stacked-col">
                  <div className="cr-stacked-bars">
                    <div className="cr-bar cr-bar--neg"     style={{ height: `${d.negative}%` }} />
                    <div className="cr-bar cr-bar--neutral" style={{ height: `${d.neutral}%`  }} />
                    <div className="cr-bar cr-bar--pos"     style={{ height: `${d.positive}%` }} />
                  </div>
                  <div className="cr-stacked-label">{d.month}</div>
                </div>
              ))}
            </div>
            <div className="cr-chart-legend">
              <span className="cr-legend-item cr-legend-item--pos">Tích cực</span>
              <span className="cr-legend-item cr-legend-item--neutral">Trung lập</span>
              <span className="cr-legend-item cr-legend-item--neg">Tiêu cực</span>
            </div>
          </div>

          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Từ khoá xuất hiện nhiều nhất</div>
            <div className="cr-keywords">
              {[
                { word: "giao hàng nhanh",   count: 89, s: "positive" },
                { word: "chất lượng tốt",    count: 76, s: "positive" },
                { word: "giá hợp lý",        count: 54, s: "positive" },
                { word: "đóng gói cẩn thận", count: 43, s: "positive" },
                { word: "giao chậm",         count: 31, s: "negative" },
                { word: "không như mô tả",   count: 18, s: "negative" },
                { word: "bình thường",       count: 24, s: "neutral"  },
                { word: "sẽ mua lại",        count: 67, s: "positive" },
              ].map(k => {
                const colorMap: Record<string, { color: string; bg: string; border: string }> = {
                  positive: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
                  negative: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
                  neutral:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                };
                const c = colorMap[k.s];
                return (
                  <span key={k.word} className="cr-keyword"
                    style={{ fontSize: `${Math.max(11, Math.min(16, 10 + k.count / 8))}px`, color: c.color, background: c.bg, borderColor: c.border }}>
                    {k.word} ({k.count})
                  </span>
                );
              })}
            </div>
          </div>

          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Điểm đánh giá theo sản phẩm</div>
            <table className="cr-product-table">
              <thead>
                <tr><th>Sản phẩm</th><th>Số đánh giá</th><th>Điểm TB</th><th>% Tích cực</th></tr>
              </thead>
              <tbody>
                {[
                  { name: "Sản phẩm A", count: 412, avg: 4.8, pos: 91 },
                  { name: "Sản phẩm B", count: 289, avg: 3.9, pos: 62 },
                  { name: "Sản phẩm C", count: 156, avg: 3.2, pos: 48 },
                  { name: "Sản phẩm D", count: 203, avg: 4.1, pos: 74 },
                  { name: "Sản phẩm E", count: 185, avg: 4.7, pos: 88 },
                ].map(p => (
                  <tr key={p.name}>
                    <td>{p.name}</td>
                    <td>{p.count}</td>
                    <td><span style={{ color: p.avg >= 4 ? "#16a34a" : p.avg >= 3 ? "#d97706" : "#dc2626", fontWeight: 600 }}>{p.avg} ★</span></td>
                    <td>
                      <div className="cr-mini-bar-wrap">
                        <div className="cr-mini-bar" style={{ width: `${p.pos}%`, background: p.pos >= 80 ? "#22c55e" : p.pos >= 60 ? "#f59e0b" : "#ef4444" }} />
                        <span>{p.pos}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
