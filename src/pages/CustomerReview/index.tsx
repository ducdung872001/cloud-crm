import React, { useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import "./index.scss";

/* ─── Mock data ─── */
const MOCK_REVIEWS = [
  { id: 1, customer: "Nguyễn Thị Lan", stars: 5, comment: "Sản phẩm rất tốt, giao hàng nhanh!", product: "Sản phẩm A", date: "15/03/2026", status: "published", sentiment: "positive" },
  { id: 2, customer: "Trần Văn Minh", stars: 4, comment: "Chất lượng ổn, giá hợp lý.", product: "Sản phẩm B", date: "14/03/2026", status: "published", sentiment: "positive" },
  { id: 3, customer: "Lê Thị Hoa", stars: 2, comment: "Sản phẩm không như mô tả.", product: "Sản phẩm C", date: "13/03/2026", status: "pending", sentiment: "negative" },
  { id: 4, customer: "Phạm Quốc Bảo", stars: 5, comment: "Tuyệt vời! Sẽ mua lại.", product: "Sản phẩm A", date: "12/03/2026", status: "published", sentiment: "positive" },
  { id: 5, customer: "Hoàng Thị Mai", stars: 3, comment: "Bình thường, không có gì đặc biệt.", product: "Sản phẩm D", date: "11/03/2026", status: "published", sentiment: "neutral" },
  { id: 6, customer: "Đỗ Thanh Tùng", stars: 1, comment: "Giao hàng quá chậm, dịch vụ kém.", product: "Sản phẩm B", date: "10/03/2026", status: "pending", sentiment: "negative" },
  { id: 7, customer: "Vũ Thị Hằng", stars: 5, comment: "Rất hài lòng, đóng gói cẩn thận.", product: "Sản phẩm E", date: "09/03/2026", status: "published", sentiment: "positive" },
  { id: 8, customer: "Ngô Minh Đức", stars: 4, comment: "Tốt, sẽ giới thiệu bạn bè.", product: "Sản phẩm A", date: "08/03/2026", status: "published", sentiment: "positive" },
];

const DIST = [
  { label: "5 ★", pct: 72, color: "#22c55e" },
  { label: "4 ★", pct: 15, color: "#86efac" },
  { label: "3 ★", pct: 8, color: "#f59e0b" },
  { label: "2 ★", pct: 3, color: "#fb923c" },
  { label: "1 ★", pct: 2, color: "#ef4444" },
];

const SENTIMENT_TREND = [
  { month: "T10", positive: 68, neutral: 20, negative: 12 },
  { month: "T11", positive: 71, neutral: 18, negative: 11 },
  { month: "T12", positive: 69, neutral: 19, negative: 12 },
  { month: "T1", positive: 73, neutral: 17, negative: 10 },
  { month: "T2", positive: 75, neutral: 16, negative: 9 },
  { month: "T3", positive: 78, neutral: 14, negative: 8 },
];

/* ─── Sub-components ─── */

function Stars({ n }: { n: number }) {
  return (
    <div className="cr-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`cr-star ${i <= n ? "cr-star--on" : ""}`}>★</span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "Đã đăng", cls: "cr-badge--published" },
    pending: { label: "Chờ duyệt", cls: "cr-badge--pending" },
  };
  const { label, cls } = map[status] || { label: status, cls: "" };
  return <span className={`cr-badge ${cls}`}>{label}</span>;
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const map: Record<string, { label: string; color: string }> = {
    positive: { label: "Tích cực", color: "#16a34a" },
    neutral: { label: "Trung lập", color: "#d97706" },
    negative: { label: "Tiêu cực", color: "#dc2626" },
  };
  const { label, color } = map[sentiment] || { label: sentiment, color: "#9ca3af" };
  return (
    <span className="cr-sentiment" style={{ color, background: color + "18" }}>{label}</span>
  );
}

/* ─── Main page ─── */

export default function CustomerReview(props: { onBackProps?: (v: boolean) => void }) {
  document.title = "Đánh giá & phản hồi";
  const { onBackProps } = props;

  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = MOCK_REVIEWS.filter(r => {
    const matchSearch = !search || r.customer.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    const matchStar = starFilter === "all" || r.stars.toString() === starFilter || (starFilter === "3-" && r.stars <= 3);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStar && matchStatus;
  });

  const pendingCount = MOCK_REVIEWS.filter(r => r.status === "pending").length;

  const handlePublish = (id: number) => {
    alert(`Đã duyệt đánh giá #${id} (demo)`);
  };

  const handleReply = (id: number) => {
    if (replyText.trim()) {
      alert(`Phản hồi đánh giá #${id}: "${replyText}" (demo)`);
      setReplyingId(null);
      setReplyText("");
    }
  };

  /* ─── KPI row ─── */
  const kpis = [
    { label: "Tổng đánh giá", value: "1.245", change: "+8%", color: "#F97316" },
    { label: "Điểm TB", value: "4.6/5", change: "+0.2", color: "#16A34A" },
    { label: "5 sao", value: "72%", change: "+3%", color: "#2563EB" },
    { label: "Chờ duyệt", value: String(pendingCount), change: null, color: "#7C3AED" },
  ];

  return (
    <div className="page-content">
      <HeaderTabMenu
        title="Đánh giá & phản hồi"
        titleBack="Phân tích khách hàng"
        onBackProps={onBackProps}
      />

      {/* KPI row */}
      <div className="cr-kpis">
        {kpis.map(k => (
          <div className="cr-kpi-card" key={k.label}>
            <div className="cr-kpi-card__label">{k.label}</div>
            <div className="cr-kpi-card__value" style={{ color: k.color }}>{k.value}</div>
            {k.change && (
              <div className="cr-kpi-card__change" style={{ color: "#16a34a" }}>
                ↑ {k.change} so với tháng trước
              </div>
            )}
            {!k.change && k.label === "Chờ duyệt" && pendingCount > 0 && (
              <div className="cr-kpi-card__change" style={{ color: "#dc2626" }}>
                Cần xử lý
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="cr-tabs">
        <button
          className={`cr-tab ${activeTab === "list" ? "cr-tab--active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Danh sách đánh giá
        </button>
        <button
          className={`cr-tab ${activeTab === "analytics" ? "cr-tab--active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Phân tích cảm xúc
        </button>
      </div>

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div className="cr-list-view">
          {/* Filters */}
          <div className="cr-filters">
            <div className="cr-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                placeholder="Tìm theo tên hoặc nội dung..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select value={starFilter} onChange={e => setStarFilter(e.target.value)}>
              <option value="all">Tất cả sao</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3-">3 sao trở xuống</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã đăng</option>
              <option value="pending">Chờ duyệt</option>
            </select>
          </div>

          <div className="cr-content-grid">
            {/* Review list */}
            <div className="cr-review-list">
              {filtered.length === 0 ? (
                <div className="cr-empty">Không tìm thấy đánh giá nào</div>
              ) : (
                filtered.map(r => (
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
                            <button
                              className="cr-btn cr-btn--approve"
                              onClick={() => handlePublish(r.id)}
                            >
                              Duyệt đăng
                            </button>
                          )}
                          <button
                            className="cr-btn cr-btn--reply"
                            onClick={() => {
                              setReplyingId(replyingId === r.id ? null : r.id);
                              setReplyText("");
                            }}
                          >
                            {replyingId === r.id ? "Hủy" : "Phản hồi"}
                          </button>
                        </div>
                      </div>
                      {replyingId === r.id && (
                        <div className="cr-reply-box">
                          <textarea
                            rows={2}
                            placeholder="Nhập phản hồi của bạn..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                          />
                          <button className="cr-btn cr-btn--send" onClick={() => handleReply(r.id)}>
                            Gửi phản hồi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Distribution sidebar */}
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
                  <div className="cr-dist-bar">
                    <div className="cr-dist-fill" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
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
          {/* Sentiment summary */}
          <div className="cr-sentiment-summary">
            {[
              { label: "Tích cực", value: "78%", icon: "😊", color: "#16a34a", bg: "#f0fdf4" },
              { label: "Trung lập", value: "14%", icon: "😐", color: "#d97706", bg: "#fffbeb" },
              { label: "Tiêu cực", value: "8%", icon: "😞", color: "#dc2626", bg: "#fef2f2" },
            ].map(s => (
              <div className="cr-sentiment-card" key={s.label} style={{ borderLeft: `4px solid ${s.color}`, background: s.bg }}>
                <div className="cr-sentiment-card__icon">{s.icon}</div>
                <div>
                  <div className="cr-sentiment-card__val" style={{ color: s.color }}>{s.value}</div>
                  <div className="cr-sentiment-card__lbl">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sentiment trend chart */}
          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Xu hướng cảm xúc theo tháng</div>
            <div className="cr-chart-card__subtitle">% đánh giá tích cực / trung lập / tiêu cực</div>
            <div className="cr-stacked-chart">
              {SENTIMENT_TREND.map(d => (
                <div key={d.month} className="cr-stacked-col">
                  <div className="cr-stacked-bars">
                    <div title={`Tiêu cực: ${d.negative}%`} className="cr-bar cr-bar--neg" style={{ height: `${d.negative}%` }} />
                    <div title={`Trung lập: ${d.neutral}%`} className="cr-bar cr-bar--neutral" style={{ height: `${d.neutral}%` }} />
                    <div title={`Tích cực: ${d.positive}%`} className="cr-bar cr-bar--pos" style={{ height: `${d.positive}%` }} />
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

          {/* Top keywords */}
          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Từ khoá xuất hiện nhiều nhất</div>
            <div className="cr-keywords">
              {[
                { word: "giao hàng nhanh", count: 89, sentiment: "positive" },
                { word: "chất lượng tốt", count: 76, sentiment: "positive" },
                { word: "giá hợp lý", count: 54, sentiment: "positive" },
                { word: "đóng gói cẩn thận", count: 43, sentiment: "positive" },
                { word: "giao chậm", count: 31, sentiment: "negative" },
                { word: "không như mô tả", count: 18, sentiment: "negative" },
                { word: "bình thường", count: 24, sentiment: "neutral" },
                { word: "sẽ mua lại", count: 67, sentiment: "positive" },
              ].map(k => (
                <span
                  key={k.word}
                  className="cr-keyword"
                  style={{
                    fontSize: `${Math.max(11, Math.min(16, 10 + k.count / 8))}px`,
                    color: k.sentiment === "positive" ? "#16a34a" : k.sentiment === "negative" ? "#dc2626" : "#d97706",
                    background: k.sentiment === "positive" ? "#f0fdf4" : k.sentiment === "negative" ? "#fef2f2" : "#fffbeb",
                    borderColor: k.sentiment === "positive" ? "#bbf7d0" : k.sentiment === "negative" ? "#fecaca" : "#fde68a",
                  }}
                >
                  {k.word} ({k.count})
                </span>
              ))}
            </div>
          </div>

          {/* Product rating table */}
          <div className="cr-chart-card">
            <div className="cr-chart-card__title">Điểm đánh giá theo sản phẩm</div>
            <table className="cr-product-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số đánh giá</th>
                  <th>Điểm TB</th>
                  <th>% Tích cực</th>
                </tr>
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
                    <td>
                      <span style={{ color: p.avg >= 4 ? "#16a34a" : p.avg >= 3 ? "#d97706" : "#dc2626", fontWeight: 600 }}>
                        {p.avg} ★
                      </span>
                    </td>
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
