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

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LoyaltyReportPage({ onBackProps }: { onBackProps: (v: boolean) => void }) {
  document.title = "Báo cáo thành viên";

  const [data, setData]       = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

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
      } catch (e: any) {
        if (e?.name !== "AbortError") setError("Lỗi kết nối máy chủ");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

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

      {/* Error state */}
      {error && (
        <div className="lrp-error">
          <Icon name="CloseCircle" style={{ width: 20 }} />
          <span>{error}</span>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      )}

      {/* Charts */}
      <div className="mcp-charts-row">
        {/* Retention chart */}
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

        {/* CLV by segment */}
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
    </div>
  );
}
