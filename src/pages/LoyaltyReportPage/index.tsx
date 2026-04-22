// =============================================================================
// FILE: src/pages/LoyaltyReportPage/index.tsx
// Báo cáo thành viên — ghép API thật, thay thế toàn bộ mock data
// API: GET /market/loyaltyReport/summary
// =============================================================================

import React, { useEffect, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";
import Icon from "components/icon";
import { urlsApi } from "configs/urls";
import "./index.scss";

// ── Types ──────────────────────────────────────────────────────────────────
interface MonthlyRetention {
  month: string;
  loyaltyCount: number;
  totalCount: number;
}

interface SegmentClv {
  segmentName: string;
  avgTotalEarn: number;
}

interface ReportSummary {
  totalMembers: number;
  avgClv: number;
  retentionRate: number;
  avgPurchaseFrequencyDays: number;
  retentionChart: MonthlyRetention[];
  clvBySegment: SegmentClv[];
}

// ── Segment color map ─────────────────────────────────────────────────────
const SEGMENT_COLORS: Record<string, string> = {
  "Kim Cương": "#06B6D4",
  "Vàng":      "#F59E0B",
  "Bạc":       "#94A3B8",
  "Đồng":      "#D97706",
};
function segmentColor(name: string): string {
  for (const [k, v] of Object.entries(SEGMENT_COLORS)) {
    if (name?.includes(k)) return v;
  }
  return "#6366F1";
}

// ── Format helpers ────────────────────────────────────────────────────────
function fmtClv(v: number): string {
  if (!v) return "0";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString("vi-VN");
}

// ── Retention Line Chart (SVG) ─────────────────────────────────────────────
function RetentionChart({ data }: { data: MonthlyRetention[] }) {
  if (!data || data.length === 0) return (
    <div className="lrp-chart-empty">Chưa có dữ liệu</div>
  );

  const W = 500, H = 180, PAD_L = 44, PAD_B = 22, PAD_T = 10, PAD_R = 10;
  const maxVal = Math.max(...data.map(d => Math.max(d.loyaltyCount, d.totalCount)), 1);
  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];

  const xPos = (i: number) => PAD_L + (i / (data.length - 1)) * (W - PAD_L - PAD_R);
  const yPos = (v: number) => PAD_T + (1 - v / maxVal) * (H - PAD_T - PAD_B);

  const loyaltyPts = data.map((d, i) => `${xPos(i)},${yPos(d.loyaltyCount)}`).join(" ");
  const totalPts   = data.map((d, i) => `${xPos(i)},${yPos(d.totalCount)}`).join(" ");

  // Fill area under loyalty line
  const areaLoyalty = [
    `${xPos(0)},${H - PAD_B}`,
    ...data.map((d, i) => `${xPos(i)},${yPos(d.loyaltyCount)}`),
    `${xPos(data.length - 1)},${H - PAD_B}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {/* Grid lines + Y labels */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD_L} y1={yPos(v)} x2={W - PAD_R} y2={yPos(v)}
            stroke="#E5E7EB" strokeWidth={0.6} />
          <text x={PAD_L - 4} y={yPos(v) + 3.5} textAnchor="end"
            style={{ fontSize: 8, fill: "#9CA3AF" }}>
            {v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
          </text>
        </g>
      ))}

      {/* Area fill loyalty */}
      <polygon points={areaLoyalty} fill="rgba(249,115,22,0.08)" />

      {/* Lines */}
      <polyline points={totalPts} fill="none"
        stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="5 3" />
      <polyline points={loyaltyPts} fill="none"
        stroke="#F97316" strokeWidth={2} />

      {/* Dots loyalty */}
      {data.map((d, i) => (
        <circle key={i} cx={xPos(i)} cy={yPos(d.loyaltyCount)}
          r={3} fill="#F97316" stroke="#fff" strokeWidth={1.2} />
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={d.month} x={xPos(i)} y={H - 4}
          textAnchor="middle" style={{ fontSize: 9, fill: "#9CA3AF" }}>
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ── CLV Bar Chart ─────────────────────────────────────────────────────────
function ClvChart({ data }: { data: SegmentClv[] }) {
  if (!data || data.length === 0) return (
    <div className="lrp-chart-empty">Chưa có dữ liệu</div>
  );
  const maxClv = Math.max(...data.map(d => d.avgTotalEarn), 1);

  return (
    <div className="lrp-clv-list">
      {data.map((c, i) => {
        const pct = Math.round((c.avgTotalEarn / maxClv) * 100);
        const color = segmentColor(c.segmentName);
        return (
          <div className="lrp-clv-row" key={i}>
            <div className="lrp-clv-tier">{c.segmentName ?? "—"}</div>
            <div className="lrp-clv-bar-wrap">
              <div className="lrp-clv-bar"
                style={{ width: `${pct}%`, background: color }} />
            </div>
            <div className="lrp-clv-val">{fmtClv(c.avgTotalEarn)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── RFM Types ─────────────────────────────────────────────────────────────
interface RfmCell { r: number; f: number; count: number; avgMonetary: number; }
interface RfmSegment {
  key: string;
  name: string;
  color: string;
  count: number;
  description: string;
}
interface RfmReport {
  matrix: RfmCell[];   // 25 cells (R 1..5 × F 1..5) — avgMonetary = M
  segments: RfmSegment[];
  totalCustomers: number;
}

// RFM segment — tên chuẩn ngành bán lẻ
const RFM_SEGMENT_META: Record<string, { name: string; color: string; description: string }> = {
  champions:         { name: "Champions",             color: "#10B981", description: "Mua gần đây, thường xuyên, giá trị cao" },
  loyal:             { name: "Khách trung thành",     color: "#3B82F6", description: "Mua thường xuyên, giá trị khá" },
  potential_loyalty: { name: "Tiềm năng trung thành", color: "#06B6D4", description: "Mua gần đây, tần suất đang tăng" },
  new_customer:      { name: "Khách mới",             color: "#8B5CF6", description: "Mua gần đây, ít giao dịch" },
  promising:         { name: "Có triển vọng",         color: "#A78BFA", description: "Mua gần đây, giá trị trung bình" },
  need_attention:    { name: "Cần chú ý",             color: "#F59E0B", description: "Đang giảm tần suất mua" },
  about_to_sleep:    { name: "Sắp ngủ đông",          color: "#F97316", description: "Đã lâu không quay lại" },
  at_risk:           { name: "Nguy cơ rời bỏ",        color: "#EF4444", description: "Từng mua nhiều nhưng lâu không quay lại" },
  cant_lose:         { name: "Không thể để mất",      color: "#DC2626", description: "Khách giá trị cao đang rời đi" },
  hibernating:       { name: "Ngủ đông",              color: "#6B7280", description: "Đã lâu không tương tác, giá trị thấp" },
  lost:              { name: "Đã mất",                color: "#4B5563", description: "Không còn hoạt động" },
};

// Mapping 25 cell → segment key (R x F) — cell layout R:row, F:col
function segmentOfCell(r: number, f: number): string {
  if (r >= 4 && f >= 4) return "champions";
  if (r >= 3 && f >= 4) return "loyal";
  if (r >= 4 && f === 3) return "potential_loyalty";
  if (r === 5 && f <= 2) return "new_customer";
  if (r === 4 && f <= 2) return "promising";
  if (r === 3 && f === 3) return "need_attention";
  if (r === 3 && f <= 2) return "about_to_sleep";
  if (r === 2 && f >= 4) return "at_risk";
  if (r === 1 && f >= 4) return "cant_lose";
  if (r === 2 && f <= 3) return "hibernating";
  return "lost";
}

// ── RFM Heatmap ───────────────────────────────────────────────────────────
function RfmHeatmap({ matrix, onCellClick }: {
  matrix: RfmCell[];
  onCellClick?: (c: RfmCell) => void;
}) {
  const byKey = new Map<string, RfmCell>();
  matrix.forEach(c => byKey.set(`${c.r}-${c.f}`, c));
  const maxCount = Math.max(...matrix.map(c => c.count), 1);

  const cells: React.ReactElement[] = [];
  for (let r = 5; r >= 1; r--) {
    for (let f = 1; f <= 5; f++) {
      const cell = byKey.get(`${r}-${f}`) ?? { r, f, count: 0, avgMonetary: 0 };
      const segKey = segmentOfCell(r, f);
      const meta = RFM_SEGMENT_META[segKey];
      const opacity = 0.25 + 0.75 * (cell.count / maxCount);
      cells.push(
        <div
          key={`${r}-${f}`}
          className="rfm-cell"
          style={{ background: meta.color, opacity: cell.count > 0 ? opacity : 0.12 }}
          onClick={() => cell.count > 0 && onCellClick?.(cell)}
          title={`R=${r} F=${f} — ${meta.name}\n${cell.count.toLocaleString("vi-VN")} khách\nM trung bình: ${fmtClv(cell.avgMonetary)}`}
        >
          <span className="rfm-cell-count">{cell.count > 0 ? cell.count.toLocaleString("vi-VN") : ""}</span>
        </div>
      );
    }
  }

  return (
    <div className="rfm-heatmap-wrap">
      <div className="rfm-heatmap">
        <div className="rfm-axis-y">R (Recency)<br/>gần đây ↑</div>
        <div className="rfm-grid">{cells}</div>
      </div>
      <div className="rfm-axis-x">F (Frequency) — tần suất mua →</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LoyaltyReportPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Báo cáo thành viên";

  const [activeTab, setActiveTab] = useState<"overview" | "rfm">("overview");

  const [data, setData]       = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // RFM state
  const [rfmData, setRfmData] = useState<RfmReport | null>(null);
  const [rfmLoading, setRfmLoading] = useState(false);
  const [rfmError, setRfmError] = useState<string | null>(null);
  const [rfmLoaded, setRfmLoaded] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(urlsApi.ma.loyaltyReportSummary, {
          signal: ctrl.signal,
          method: "GET",
        }).then(r => r.json());

        if (res?.code === 0) {
          setData(res.result);
        } else {
          setError(res?.message ?? "Không thể tải báo cáo");
        }
      } catch (e: unknown) {
        if (e?.name !== "AbortError") setError("Lỗi kết nối máy chủ");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // Lazy-load RFM khi bấm tab RFM lần đầu
  useEffect(() => {
    if (activeTab !== "rfm" || rfmLoaded) return;
    const ctrl = new AbortController();
    (async () => {
      setRfmLoading(true);
      setRfmError(null);
      try {
        const res = await fetch(urlsApi.ma.loyaltyReportRfm, {
          signal: ctrl.signal,
          method: "GET",
        }).then(r => r.json());

        if (res?.code === 0) {
          setRfmData(res.result);
        } else {
          setRfmError(res?.message ?? "Không thể tải RFM");
        }
      } catch (e: unknown) {
        if (e?.name !== "AbortError") setRfmError("Lỗi kết nối máy chủ");
      } finally {
        setRfmLoading(false);
        setRfmLoaded(true);
      }
    })();
    return () => ctrl.abort();
  }, [activeTab, rfmLoaded]);

  // ── Stat cards ──────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Tổng thành viên loyalty",
      value: isLoading ? "..." : data ? data.totalMembers.toLocaleString("vi-VN") : "—",
      color: "purple",
    },
    {
      label: "CLV trung bình",
      value: isLoading ? "..." : data ? fmtClv(data.avgClv) : "—",
      color: "green",
    },
    {
      label: "Tỷ lệ giữ chân",
      value: isLoading ? "..." : data ? `${data.retentionRate}%` : "—",
      color: "blue",
    },
    {
      label: "Tần suất mua TB",
      value: isLoading ? "..." : data ? `${data.avgPurchaseFrequencyDays} ngày` : "—",
      color: "orange",
    },
  ];

  return (
    <div className="page-content lrp-page">
      <HeaderTabMenu
        title="Báo cáo thành viên"
        titleBack="Khách hàng thành viên"
        onBackProps={onBackProps}
      />

      {/* Tab nav */}
      <div className="lrp-tab-nav">
        <button
          className={`lrp-tab-btn${activeTab === "overview" ? " active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Tổng quan
        </button>
        <button
          className={`lrp-tab-btn${activeTab === "rfm" ? " active" : ""}`}
          onClick={() => setActiveTab("rfm")}
        >
          Phân tích RFM
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stat cards */}
          <div className="promo-stats-grid">
            {stats.map(s => (
              <div key={s.label} className={`promo-stat-card promo-stat-card--${s.color}`}>
                <div className="promo-stat-card__body">
                  <div className="promo-stat-card__content">
                    <p className="promo-stat-card__label">{s.label}</p>
                    <p className={`promo-stat-card__value${isLoading ? " lrp-skeleton" : ""}`}>
                      {s.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="lrp-error">
              <Icon name="CloseCircle" style={{ width: 20 }} />
              <span>{error}</span>
              <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
          )}

          <div className="mcp-charts-row">
            <div className="mcp-chart-card">
              <div className="mcp-chart-title">Tỷ lệ Giữ Chân — Loyalty vs Non-Loyalty</div>
              <div className="mcp-chart-subtitle">
                Số lượng khách hàng theo tháng — {new Date().getFullYear()}
              </div>

              {isLoading ? (
                <div className="lrp-chart-skeleton" />
              ) : (
                <RetentionChart data={data?.retentionChart ?? []} />
              )}

              <div className="mcp-chart-legend">
                <span style={{ color: "#F97316" }}>● Loyalty</span>
                <span style={{ color: "#3B82F6" }}>● Tổng giao dịch</span>
              </div>
            </div>

            <div className="mcp-chart-card">
              <div className="mcp-chart-title">CLV trung bình theo hạng</div>
              <div className="mcp-chart-subtitle">Điểm tích lũy trung bình (avg total_earn)</div>

              {isLoading ? (
                <div className="lrp-chart-skeleton" />
              ) : (
                <ClvChart data={data?.clvBySegment ?? []} />
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "rfm" && (
        <div className="lrp-rfm-section">
          {rfmError && (
            <div className="lrp-error">
              <Icon name="CloseCircle" style={{ width: 20 }} />
              <span>{rfmError}</span>
              <button onClick={() => { setRfmLoaded(false); }}>Thử lại</button>
            </div>
          )}

          {rfmLoading && <div className="lrp-chart-skeleton" style={{ height: 300 }} />}

          {!rfmLoading && !rfmError && rfmData && (
            <div className="mcp-charts-row">
              <div className="mcp-chart-card">
                <div className="mcp-chart-title">Ma trận RFM (R × F) — tô theo số lượng</div>
                <div className="mcp-chart-subtitle">
                  {rfmData.totalCustomers.toLocaleString("vi-VN")} khách — M (giá trị trung bình) hiển thị khi hover
                </div>
                <RfmHeatmap matrix={rfmData.matrix} />
              </div>

              <div className="mcp-chart-card">
                <div className="mcp-chart-title">Phân khúc tự động ({rfmData.segments.length})</div>
                <div className="mcp-chart-subtitle">Mỗi phân khúc = 1 nhóm ô trên ma trận</div>
                <div className="rfm-seg-list">
                  {rfmData.segments.map(s => {
                    const meta = RFM_SEGMENT_META[s.key];
                    return (
                      <div key={s.key} className="rfm-seg-item">
                        <span className="rfm-seg-dot" style={{ background: meta?.color ?? s.color }} />
                        <div className="rfm-seg-body">
                          <div className="rfm-seg-name">
                            {meta?.name ?? s.name}
                            <span className="rfm-seg-count">{s.count.toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="rfm-seg-desc">{meta?.description ?? s.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
