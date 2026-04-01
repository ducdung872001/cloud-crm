import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import "./index.scss";
import { urlsApi } from "configs/urls";
import { ContextType, UserContext } from "contexts/userContext";
import { toApiDateFormat } from "utils/common";

// ─── Types matching PosSummaryResponse from BE ────────────────────────────────

interface StatCards {
  revenue:         number;
  orderCount:      number;
  doneCount:       number;
  cancelCount:     number;
  avgOrderValue:   number;
  revenueDeltaPct: number;  // % — dương = tăng
  orderDeltaCount: number;  // dương = tăng
}

interface DailyPoint {
  time:       string;  // "yyyy-MM-dd"
  revenue:    number;
  orderCount: number;
}

interface TopProduct {
  rank:         number;
  productName:  string;
  variantName?: string;  // tên biến thể — hiển thị phụ khi có
  avatar:       string;
  unitName:     string;
  totalQty:     number;
  totalRevenue: number;
  pctOfMax:     number;  // 0–100
}

interface PaymentBreakdown {
  type:   number;  // 0=Tổng, 1=Tiền mặt, 2=CK, 3=QR
  label:  string;
  amount: number;
  pct:    number;  // 0–100
}

interface OrderSource {
  channelName: string;
  orderCount:  number;
  revenue:     number;
  ratio:       number;  // 0–100 (% từ BE đã nhân 10 rồi chia)
}

interface PosSummaryData {
  statCards:        StatCards;
  dailySeries:      DailyPoint[];
  topProducts:      TopProduct[];
  paymentBreakdown: PaymentBreakdown[];
  orderSources:     OrderSource[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtVND = (n: number): string => {
  if (!n) return "0 ₫";
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}M ₫`;
  return `${Math.round(n).toLocaleString("vi-VN")} ₫`;
};

const fmtFull = (n: number): string =>
  `${Math.round(n).toLocaleString("vi-VN")} ₫`;

const fmtDate = (isoDate: string): string => {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length < 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;  // dd/MM
};

// Hôm nay theo format dd/MM/yyyy (API expect)
const todayStr = (): string => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

// Từ nAgo ngày trước đến hôm nay
const rangeFromNDaysAgo = (n: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (n - 1));
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return { from: fmt(from), to: fmt(to) };
};

// Đầu tháng đến hôm nay
const rangeThisMonth = (): { from: string; to: string } => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const dd = String(d.getDate()).padStart(2, "0");
  return { from: `01/${mm}/${yyyy}`, to: `${dd}/${mm}/${yyyy}` };
};

// Chuyển "dd/MM/yyyy" → "yyyy-MM-dd" cho HTML input[type=date]
const apiToInput = (s: string): string => {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : s;
};

// ─── Channel emoji map ───────────────────────────────────────────────────────
const CHANNEL_ICONS: Record<string, string> = {
  "Tại quầy (Offline)": "🏪",
  "Tại quầy (POS)":     "🏪",
  "Website bán hàng":   "🛒",
  "Fanpage / Zalo OA":  "💬",
  "Sàn thương mại điện tử": "🛍️",
};
const CHANNEL_COLORS = ["var(--lime)", "var(--orange)", "var(--blue)", "var(--purple)"];

// ─── Payment emoji map ────────────────────────────────────────────────────────
const PAY_EMOJI: Record<number, string> = {
  0: "📊", 1: "💵", 2: "📱", 3: "📷",
};

// ─── Rank class ───────────────────────────────────────────────────────────────
const rankCls = (r: number) => ["r1", "r2", "r3", "rn"][Math.min(r - 1, 3)];

// ─── Type ────────────────────────────────────────────────────────────────────
type Period = "today" | "7d" | "30d" | "month";

// ─── Skeleton placeholder ─────────────────────────────────────────────────────
const Skeleton: React.FC<{ h?: string; w?: string; rounded?: boolean }> = ({
  h = "2rem", w = "100%", rounded = false,
}) => (
  <div
    style={{
      height: h, width: w,
      borderRadius: rounded ? "9999px" : "0.6rem",
      background: "var(--border)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

// ─── Component ───────────────────────────────────────────────────────────────

const Report: React.FC = () => {
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [period,    setPeriod]    = useState<Period>("today");
  const [fromDate,  setFromDate]  = useState(todayStr());
  const [toDate,    setToDate]    = useState(todayStr());
  const [chartMode, setChartMode] = useState<"revenue" | "orders">("revenue");

  const [data,      setData]      = useState<PosSummaryData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async (from: string, to: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const branchId = dataBranch?.value ?? 0;
      const url = `${urlsApi.invoice.salesReport.posSummary}?fromTime=${encodeURIComponent(from)}&toTime=${encodeURIComponent(to)}&branchId=${branchId}`;
      const res  = await fetch(url, { signal: abortRef.current.signal });
      const json = await res.json();

      if (json.code === 0 && json.result) {
        setData(json.result as PosSummaryData);
      } else {
        setError(json.message ?? "Không thể tải báo cáo");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [dataBranch]);

  // Fetch khi mount + khi đổi branch
  useEffect(() => {
    fetchReport(fromDate, toDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataBranch]);

  // ── Period shortcuts ─────────────────────────────────────────────────────
  const handlePeriod = (p: Period) => {
    setPeriod(p);
    let from = todayStr();
    let to   = todayStr();
    if (p === "7d")    { const r = rangeFromNDaysAgo(7);  from = r.from; to = r.to; }
    if (p === "30d")   { const r = rangeFromNDaysAgo(30); from = r.from; to = r.to; }
    if (p === "month") { const r = rangeThisMonth();      from = r.from; to = r.to; }
    setFromDate(from);
    setToDate(to);
    fetchReport(from, to);
  };

  const handleApply = () => fetchReport(fromDate, toDate);

  const handleFromInput = (v: string) => setFromDate(toApiDateFormat(v));
  const handleToInput   = (v: string) => setToDate(toApiDateFormat(v));

  // ── Derived chart data ────────────────────────────────────────────────────
  const chartData   = data?.dailySeries ?? [];
  const chartValues = chartData.map(d => chartMode === "revenue" ? d.revenue : d.orderCount);
  const chartMax    = Math.max(...chartValues, 1);

  // ── StatCard shortcuts ────────────────────────────────────────────────────
  const sc = data?.statCards;
  const completionPct = sc && (sc.doneCount + sc.cancelCount) > 0
    ? Math.round(sc.doneCount / (sc.doneCount + sc.cancelCount) * 100)
    : 100;

  const STAT_CARDS = [
    {
      icon: "💰", cls: "sc-1",
      val: sc ? fmtFull(sc.revenue) : "—",
      label: "Doanh thu kỳ này",
      delta: sc
        ? (sc.revenueDeltaPct >= 0
          ? `↑ +${sc.revenueDeltaPct.toFixed(1)}% so kỳ trước`
          : `↓ ${sc.revenueDeltaPct.toFixed(1)}% so kỳ trước`)
        : "",
      up: sc ? sc.revenueDeltaPct >= 0 : true,
    },
    {
      icon: "📋", cls: "sc-2",
      val: sc ? `${sc.orderCount} đơn` : "—",
      label: "Tổng đơn hoàn thành",
      delta: sc
        ? (sc.orderDeltaCount >= 0
          ? `↑ +${sc.orderDeltaCount} đơn so kỳ trước`
          : `↓ ${Math.abs(sc.orderDeltaCount)} đơn so kỳ trước`)
        : "",
      up: sc ? sc.orderDeltaCount >= 0 : true,
    },
    {
      icon: "🧾", cls: "sc-3",
      val: sc ? fmtFull(sc.avgOrderValue) : "—",
      label: "Giá trị trung bình / đơn",
      delta: sc ? `Tổng ${sc.doneCount} đơn hoàn thành` : "",
      up: true,
    },
    {
      icon: "🔄", cls: "sc-4",
      val: sc ? `${sc.doneCount} / ${sc.doneCount + sc.cancelCount}` : "—",
      label: "Tỷ lệ hoàn thành đơn",
      delta: sc ? `↓ ${sc.cancelCount} đơn đã hủy` : "",
      up: sc ? sc.cancelCount === 0 : true,
    },
  ];

  // ── Separate tổng khỏi danh sách payment ─────────────────────────────────
  const paymentItems  = data?.paymentBreakdown.filter(p => p.type !== 0) ?? [];
  const paymentTotal  = data?.paymentBreakdown.find(p => p.type === 0);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="report">
      {/* ── Toolbar ── */}
      <div className="report__toolbar">
        {(["today", "7d", "30d", "month"] as Period[]).map((p) => {
          const labels: Record<Period, string> = {
            today: "📅 Hôm nay", "7d": "7 ngày", "30d": "30 ngày", month: "Tháng này",
          };
          return (
            <button
              key={p}
              className={`btn ${period === p ? "btn--outline report__period--active" : "btn--ghost"} btn--sm`}
              onClick={() => handlePeriod(p)}
            >
              {labels[p]}
            </button>
          );
        })}

        <input
          type="date"
          className="ff"
          value={apiToInput(fromDate)}
          onChange={e => handleFromInput(e.target.value)}
        />
        <span className="report__arrow">→</span>
        <input
          type="date"
          className="ff"
          value={apiToInput(toDate)}
          onChange={e => handleToInput(e.target.value)}
        />

        <button className="btn btn--lime btn--sm" onClick={handleApply} disabled={loading}>
          {loading ? "⏳ Đang tải..." : "📊 Xem báo cáo"}
        </button>

        <div className="report__toolbar-right">
          <button className="btn btn--outline btn--sm" style={{ opacity: 0.5, cursor: "not-allowed" }}>
            📥 Xuất báo cáo
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          margin: "12px 20px 0", padding: "10px 16px",
          background: "var(--red-l)", color: "var(--red)",
          borderRadius: "0.8rem", fontSize: 13, fontWeight: 600,
        }}>
          ⚠️ {error}
          <button
            onClick={handleApply}
            style={{ marginLeft: 12, textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="report__body">

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`stat-card ${s.cls}`}>
              <div className="stat-card__icon">{s.icon}</div>
              {loading ? (
                <>
                  <Skeleton h="2.8rem" w="70%" />
                  <div style={{ marginTop: 6 }}><Skeleton h="1.2rem" w="50%" /></div>
                  <div style={{ marginTop: 6 }}><Skeleton h="1.4rem" w="60%" rounded /></div>
                </>
              ) : (
                <>
                  <div className="stat-card__val">{s.val}</div>
                  <div className="stat-card__lbl">{s.label}</div>
                  {s.delta && (
                    <span className={`stat-card__delta ${s.up ? "delta--up" : "delta--dn"}`}>
                      {s.delta}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Report grid ── */}
        <div className="report-grid">

          {/* ── Biểu đồ cột doanh thu/đơn hàng ── */}
          <div className="r-card">
            <div className="r-card__title">
              <span>📈 {chartMode === "revenue" ? "Doanh thu" : "Số đơn"} theo ngày</span>
              <select
                className="r-card__select"
                value={chartMode}
                onChange={e => setChartMode(e.target.value as "revenue" | "orders")}
              >
                <option value="revenue">Doanh thu</option>
                <option value="orders">Số đơn</option>
              </select>
            </div>

            {loading ? (
              <div className="chart-area" style={{ alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Đang tải...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="chart-area" style={{ alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Chưa có dữ liệu trong kỳ này</div>
              </div>
            ) : (
              <div className="chart-area">
                {chartData.map((d, i) => {
                  const v   = chartValues[i];
                  const pct = Math.round((v / chartMax) * 100);
                  const isLast = i === chartData.length - 1;
                  const tip = chartMode === "revenue"
                    ? fmtVND(d.revenue)
                    : `${d.orderCount} đơn`;
                  return (
                    <div key={d.time} className="chart-col">
                      <div className="chart-bar-wrap">
                        <div
                          className={`chart-bar${isLast ? " chart-bar--active" : ""}`}
                          style={{ height: `${Math.max(pct, 2)}%` }}
                          data-tip={tip}
                        />
                      </div>
                      <span className="chart-label">{fmtDate(d.time)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Top sản phẩm bán chạy ── */}
          <div className="r-card">
            <div className="r-card__title">🏆 Sản phẩm bán chạy</div>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                  <Skeleton h="2.2rem" w="2.2rem" />
                  <div style={{ flex: 1 }}><Skeleton h="1.2rem" /></div>
                  <Skeleton h="1.4rem" w="6rem" />
                </div>
              ))
            ) : (data?.topProducts ?? []).length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
                Chưa có dữ liệu sản phẩm
              </div>
            ) : (
              (data?.topProducts ?? []).map((p) => (
                <div key={p.rank} className="top-prod">
                  <div className={`tp-rank ${rankCls(p.rank)}`}>{p.rank}</div>
                  <div className="tp-icon">
                    {p.avatar
                      ? <img src={p.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.3rem" }} />
                      : "📦"
                    }
                  </div>
                  <div className="tp-info">
                    <div className="tp-name">{p.productName || "Sản phẩm"}</div>
                    {p.variantName && (
                      <div className="tp-variant">{p.variantName}</div>
                    )}
                    <div className="tp-qty">
                      {p.totalQty.toLocaleString("vi-VN")} {p.unitName || "cái"} đã bán
                    </div>
                    <div className="tp-bar">
                      <div className="tp-bar__fill" style={{ width: `${p.pctOfMax}%` }} />
                    </div>
                  </div>
                  <div className="tp-rev">{fmtVND(p.totalRevenue)}</div>
                </div>
              ))
            )}
          </div>

          {/* ── Phương thức thanh toán ── */}
          <div className="r-card">
            <div className="r-card__title">💳 Phương thức thanh toán</div>
            {loading ? (
              <div className="pay-method-grid">
                {[1, 2, 3, 4].map(i => <div key={i} style={{ padding: 12 }}><Skeleton h="7rem" /></div>)}
              </div>
            ) : (
              <div className="pay-method-grid">
                {paymentItems.map((m) => (
                  <div key={m.type} className="pm-card">
                    <div className="pm-card__emoji">{PAY_EMOJI[m.type] ?? "💳"}</div>
                    <div className="pm-card__val">{fmtFull(m.amount)}</div>
                    <div className="pm-card__lbl">{m.label}</div>
                    <div className="pm-card__pct">{m.pct.toFixed(1)}%</div>
                  </div>
                ))}
                {/* Tổng doanh thu */}
                {paymentTotal && (
                  <div className="pm-card pm-card--highlight">
                    <div className="pm-card__emoji">{PAY_EMOJI[0]}</div>
                    <div className="pm-card__val pm-card__val--lime">{fmtFull(paymentTotal.amount)}</div>
                    <div className="pm-card__lbl">{paymentTotal.label}</div>
                    <div className="pm-card__pct pm-card__pct--lime">100%</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Nguồn đơn hàng ── */}
          <div className="r-card">
            <div className="r-card__title">📡 Nguồn đơn hàng</div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 10 }}><Skeleton h="5rem" /></div>
              ))
            ) : (data?.orderSources ?? []).length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>
                Chưa có dữ liệu
              </div>
            ) : (
              <div className="order-sources">
                {(data?.orderSources ?? []).map((s, idx) => (
                  <div key={s.channelName} className="src-row">
                    <span className="src-row__icon">
                      {CHANNEL_ICONS[s.channelName] ?? "📦"}
                    </span>
                    <div className="src-row__info">
                      <div className="src-row__label">{s.channelName}</div>
                      <div className="src-row__bar">
                        <div
                          className="src-row__bar-fill"
                          style={{
                            width: `${s.ratio}%`,
                            background: CHANNEL_COLORS[idx % CHANNEL_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                    <div className="src-row__count">{s.orderCount} đơn</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>{/* end report-grid */}
      </div>{/* end body */}
    </div>
  );
};

export default Report;