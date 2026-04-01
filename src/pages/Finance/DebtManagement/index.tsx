import React, {
  useState, useCallback, useEffect, useRef, useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import urls from "configs/urls";
import { urlsApi } from "configs/urls";
import { QRCodeCanvas } from "qrcode.react";
import QrCodeProService from "@/services/QrCodeProService";
import {
  FinanceBadge,
  FinancePageShell,
  FinanceStatCard,
  formatCurrency,
  formatDate,
} from "../shared";
import DebtManagementService, {
  IDebtItem,
  IDebtSummary,
} from "services/DebtManagementService";
import DebtReportService, {
  IDebtReportResponse,
  IDebtReportParams,
  IAgingBucket,
  IMonthlyPoint,
  ITopDebtor,
} from "services/DebtReportService";
import { IFundListItem } from "services/FundManagementService";
import { showToast } from "@/utils/common";
import "./index.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

type DebtKindFilter = "all" | "receivable" | "payable" | "overdue";
type ReportTab = "manage" | "report";
type ReportPeriod = "30d" | "3m" | "6m" | "12m";

const FILTER_OPTIONS = [
  { value: "all"         as DebtKindFilter, label: "Tất cả" },
  { value: "receivable"  as DebtKindFilter, label: "Phải thu (KH)" },
  { value: "payable"     as DebtKindFilter, label: "Phải trả (NCC)" },
  { value: "overdue"     as DebtKindFilter, label: "Quá hạn" },
];

const PERIOD_OPTIONS: { value: ReportPeriod; label: string; days: number }[] = [
  { value: "30d",  label: "30 ngày",  days: 30  },
  { value: "3m",   label: "3 tháng",  days: 90  },
  { value: "6m",   label: "6 tháng",  days: 180 },
  { value: "12m",  label: "12 tháng", days: 365 },
];

const AGING_COLORS = ["#1D9E75", "#5DCAA5", "#EF9F27", "#D85A30", "#E24B4A"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysLabel(daysRemaining: number | undefined) {
  if (daysRemaining === undefined || daysRemaining === null)
    return { text: "—", className: "" };
  if (daysRemaining < 0)
    return { text: `Quá ${Math.abs(daysRemaining)} ngày`, className: "debt-days--overdue" };
  if (daysRemaining === 0)
    return { text: "Hôm nay", className: "debt-days--today" };
  if (daysRemaining <= 10)
    return { text: `Còn ${daysRemaining} ngày`, className: "debt-days--warning" };
  return { text: `Còn ${daysRemaining} ngày`, className: "debt-days--ok" };
}

function getStatusBadge(status: string): {
  label: string;
  tone: "success" | "danger" | "warning" | "neutral";
} {
  switch (status) {
    case "overdue":  return { label: "Quá hạn",       tone: "danger"  };
    case "upcoming": return { label: "Sắp đến hạn",   tone: "warning" };
    case "paid":     return { label: "Đã thanh toán", tone: "success" };
    default:         return { label: "Còn hạn",        tone: "neutral" };
  }
}

function parseVnd(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}
function fmtVndInput(n: number): string {
  return n > 0 ? n.toLocaleString("vi") : "";
}

function periodToDates(period: ReportPeriod): { fromTime: string; toTime: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - PERIOD_OPTIONS.find((p) => p.value === period)!.days);
  return { fromTime: fmt(from), toTime: fmt(to) };
}

function getQrDataUrl(canvasEl: HTMLCanvasElement | null): string | null {
  if (!canvasEl) return null;
  return canvasEl.toDataURL("image/png");
}
function downloadQr(dataUrl: string, name: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `qr-thu-no-${name}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── ShareSheet ───────────────────────────────────────────────────────────────

interface ShareSheetProps {
  dataUrl: string;
  debtName: string;
  amount: number;
  onClose: () => void;
}

function ShareSheet({ dataUrl, debtName, amount, onClose }: ShareSheetProps) {
  const text = encodeURIComponent(
    `Vui lòng quét mã QR để thanh toán ${amount.toLocaleString("vi")} VND cho ${debtName}`
  );
  const channels = [
    { id: "zalo", label: "Zalo", icon: "💬", color: "#0068ff",
      onClick: () => window.open(`https://zalo.me/share?text=${text}`, "_blank", "noopener") },
    { id: "copy", label: "Sao chép", icon: "🔗", color: "#5c7282",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(`QR Thu nợ - ${debtName}: ${amount.toLocaleString("vi")} VND`);
          showToast("Đã sao chép nội dung", "success");
        } catch { showToast("Trình duyệt không hỗ trợ copy", "error"); }
      } },
    { id: "download", label: "Tải ảnh QR", icon: "⬇️", color: "#133042",
      onClick: () => { downloadQr(dataUrl, debtName); showToast("Đã tải ảnh QR", "success"); } },
  ];

  return (
    <div className="share-sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-sheet">
        <div className="share-sheet__header">
          <span>Chia sẻ mã QR thu nợ</span>
          <button type="button" onClick={onClose} className="share-sheet__close">✕</button>
        </div>
        <div className="share-sheet__preview">
          <img src={dataUrl} alt="QR thu nợ" className="share-sheet__qr-img" />
          <div className="share-sheet__amount">{amount.toLocaleString("vi")} VND</div>
          <div className="share-sheet__name">{debtName}</div>
        </div>
        <div className="share-sheet__channels">
          {channels.map((ch) => (
            <button key={ch.id} type="button" className="share-sheet__channel-btn"
              onClick={ch.onClick} style={{ "--ch-color": ch.color } as React.CSSProperties}>
              <span className="share-sheet__channel-icon">{ch.icon}</span>
              <span className="share-sheet__channel-label">{ch.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PayModal ─────────────────────────────────────────────────────────────────

interface PayModalProps {
  debt: IDebtItem;
  funds: IFundListItem[];
  onClose: () => void;
  onSuccess: (debtId: number, remaining: number) => void;
}

function PayModal({ debt, funds, onClose, onSuccess }: PayModalProps) {
  const [amountStr, setAmountStr] = useState(fmtVndInput(debt.amount));
  const [amount, setAmount]       = useState(debt.amount);
  const [fundId, setFundId]       = useState<number>(funds[0]?.id ?? 0);
  const [note, setNote]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handlePay() {
    if (!fundId)     { showToast("Vui lòng chọn quỹ nhận tiền", "error"); return; }
    if (amount <= 0) { showToast("Số tiền phải lớn hơn 0", "error"); return; }
    if (amount > debt.amount + 0.01) {
      showToast(`Số tiền vượt quá nợ còn lại (${formatCurrency(debt.amount)})`, "error"); return;
    }
    setSubmitting(true);
    try {
      const res = await DebtManagementService.pay({ debtId: debt.id, amount, fundId, note: note.trim() || undefined });
      const remaining = typeof res === "number" ? res : 0;
      showToast(remaining <= 0
        ? "✓ Gạch nợ thành công! Đã thu đủ."
        : `✓ Đã thu ${formatCurrency(amount)}. Còn lại: ${formatCurrency(remaining)}`, "success");
      onSuccess(debt.id, remaining);
      onClose();
    } catch (e: any) {
      showToast(e?.message ?? "Có lỗi xảy ra khi thu tiền", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="finance-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="finance-modal__content debt-pay-modal">
        <div className="finance-panel__title">
          <h3>Xác nhận thu tiền</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>Đóng</button>
        </div>
        <div className="finance-summary-list">
          <div className="finance-summary-list__item">
            <span>Đối tượng</span><strong>{debt.name}</strong>
          </div>
          <div className="finance-summary-list__item">
            <span>Còn nợ</span>
            <strong className="debt-amount-highlight">{formatCurrency(debt.amount)}</strong>
          </div>
        </div>
        <div className="debt-pay-form">
          <div className="debt-pay-form__field">
            <label>Số tiền thu lần này</label>
            <div className="debt-pay-form__input-row">
              <input type="text" className="finance-input" value={amountStr}
                onChange={(e) => { const raw = parseVnd(e.target.value); setAmount(raw); setAmountStr(fmtVndInput(raw)); }}
                placeholder="Nhập số tiền..." autoFocus />
              <button type="button" className="debt-pay-form__full-btn"
                onClick={() => { setAmount(debt.amount); setAmountStr(fmtVndInput(debt.amount)); }}>
                Thu đủ
              </button>
            </div>
          </div>
          <div className="debt-pay-form__field">
            <label>Quỹ nhận tiền</label>
            {funds.length === 0 ? (
              <p className="debt-pay-form__no-fund">Chưa có quỹ nào. Vui lòng tạo quỹ trong Quản lý quỹ.</p>
            ) : (
              <select className="finance-filter-select debt-pay-form__select"
                value={fundId} onChange={(e) => setFundId(Number(e.target.value))}>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} — {formatCurrency(f.balance)}</option>
                ))}
              </select>
            )}
          </div>
          <div className="debt-pay-form__field">
            <label>Ghi chú (tuỳ chọn)</label>
            <input type="text" className="finance-input" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách chuyển khoản qua app ngân hàng..." />
          </div>
        </div>
        <div className="debt-modal-actions">
          <button type="button" className="finance-action-btn finance-action-btn--outline" onClick={onClose}>Huỷ</button>
          <button type="button" className="finance-action-btn finance-action-btn--success"
            onClick={handlePay} disabled={submitting || funds.length === 0}>
            {submitting ? "Đang xử lý..." : "✓ Xác nhận thu tiền"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QRModal ──────────────────────────────────────────────────────────────────

interface QRModalProps {
  debt: IDebtItem;
  funds: IFundListItem[];
  onClose: () => void;
  onPaid: (id: number, remaining: number) => void;
}

function QRModal({ debt, funds, onClose, onPaid }: QRModalProps) {
  const [qrCode, setQrCode]             = useState<string | null>(null);
  const [qrLoading, setQrLoading]       = useState(true);
  const [qrError, setQrError]           = useState(false);
  const [showPayModal, setShowPayModal]  = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [qrDataUrl, setQrDataUrl]       = useState<string | null>(null);
  const canvasRef                       = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setQrLoading(true); setQrError(false);
    QrCodeProService.generate({ content: "THU NO " + debt.id, orderId: debt.id, amount: debt.amount })
      .then((res) => {
        if (cancelled) return;
        if (res.code === 0 && res?.result?.qrCode) setQrCode(res.result.qrCode);
        else setQrError(true);
      })
      .catch(() => { if (!cancelled) setQrError(true); })
      .finally(() => { if (!cancelled) setQrLoading(false); });
    return () => { cancelled = true; };
  }, [debt.id, debt.amount]);

  const handleQrRef = useCallback((node: any) => {
    const el: HTMLCanvasElement | null = node?.canvas ?? node ?? null;
    if (el) { canvasRef.current = el; try { setQrDataUrl(el.toDataURL("image/png")); } catch {} }
  }, []);

  function handleShare() {
    let url = qrDataUrl;
    if (!url) {
      const el = canvasRef.current ?? (document.querySelector(".debt-qr-canvas canvas") as HTMLCanvasElement | null);
      url = getQrDataUrl(el);
      if (url) setQrDataUrl(url);
    }
    if (!url) { showToast("Không lấy được ảnh QR", "error"); return; }
    setShowShareSheet(true);
  }

  if (showPayModal) {
    return <PayModal debt={debt} funds={funds} onClose={() => setShowPayModal(false)}
      onSuccess={(id, remaining) => { onPaid(id, remaining); onClose(); }} />;
  }

  return (
    <div className="finance-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="finance-modal__content debt-qr-modal">
        <div className="finance-panel__title">
          <h3>QR Thu nợ</h3>
          <button type="button" className="fund-close-btn" onClick={onClose}>Đóng</button>
        </div>
        <div className="finance-summary-list">
          <div className="finance-summary-list__item"><span>Đối tượng</span><strong>{debt.name}</strong></div>
          <div className="finance-summary-list__item">
            <span>Số tiền còn nợ</span>
            <strong className="debt-amount-highlight">{formatCurrency(debt.amount)}</strong>
          </div>
          <div className="finance-summary-list__item"><span>Hạn thanh toán</span><strong>{formatDate(debt.dueDate)}</strong></div>
        </div>
        <div className="debt-qr-box">
          <p className="debt-qr-label">Quét mã QR để thanh toán</p>
          {qrLoading && <div className="debt-qr-loading">Đang tạo mã QR...</div>}
          {!qrLoading && qrError && <div className="debt-qr-error">Không tạo được mã QR.<br />Vui lòng thử lại.</div>}
          {!qrLoading && !qrError && qrCode && (
            <div className="debt-qr-canvas">
              <QRCodeCanvas ref={handleQrRef as any} value={qrCode} size={200} level="M"
                includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
            </div>
          )}
          <p className="debt-qr-amount">{formatCurrency(debt.amount)}</p>
        </div>
        <div className="debt-modal-actions">
          <button type="button" className="finance-action-btn finance-action-btn--primary"
            onClick={handleShare} disabled={qrLoading || qrError}>
            📤 Chia sẻ mã QR
          </button>
          <button type="button" className="finance-action-btn finance-action-btn--success"
            onClick={() => setShowPayModal(true)}>
            ✓ Xác nhận đã thu tiền
          </button>
        </div>
      </div>
      {showShareSheet && qrDataUrl && (
        <ShareSheet dataUrl={qrDataUrl} debtName={debt.name} amount={debt.amount}
          onClose={() => setShowShareSheet(false)} />
      )}
    </div>
  );
}

// ─── Report Tab — Aging bars ──────────────────────────────────────────────────

function AgingSection({ data }: { data: IAgingBucket[] }) {
  const maxAmt = Math.max(...data.map((b) => b.amount), 1);
  return (
    <div className="debt-report-card">
      <div className="debt-report-card__title">Phân tích tuổi nợ</div>
      <div className="debt-report-card__sub">Phân nhóm khoản nợ theo số ngày chưa thanh toán</div>
      <div className="debt-aging-header">
        <span>Nhóm</span><span></span><span>Số tiền</span><span>Số khoản</span>
      </div>
      {data.map((b, i) => (
        <div key={b.key} className="debt-aging-row">
          <span className="debt-aging-row__label">{b.label}</span>
          <div className="debt-aging-row__bar-wrap">
            <div className="debt-aging-row__bar"
              style={{ width: `${(b.amount / maxAmt) * 100}%`, background: AGING_COLORS[i] }} />
          </div>
          <span className="debt-aging-row__amt">{formatCurrency(b.amount)}</span>
          <span className="debt-aging-row__count">{b.count} khoản</span>
        </div>
      ))}
    </div>
  );
}

// ─── Report Tab — Donut chart (SVG) ──────────────────────────────────────────

function DonutChart({ slices }: { slices: Array<{ label: string; pct: number; color: string }> }) {
  const r = 45, cx = 60, cy = 60;
  const paths: JSX.Element[] = [];

  // Lọc slice có pct > 0 và normalize về tổng 100
  const validSlices = slices.filter((s) => s.pct > 0);
  const total = validSlices.reduce((sum, s) => sum + s.pct, 0);
  if (total <= 0) return null;

  // Trường hợp đặc biệt: chỉ có 1 slice (hoặc 1 slice chiếm ~100%)
  // SVG arc không thể vẽ đường tròn 360° → dùng 2 circle thay thế
  const dominantIdx = validSlices.findIndex((s) => (s.pct / total) >= 0.999);
  if (dominantIdx >= 0) {
    return (
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx={cx} cy={cy} r={r} fill={validSlices[dominantIdx].color} />
        <circle cx={cx} cy={cy} r={28} fill="#fff" />
      </svg>
    );
  }

  let cumAngle = -90;
  validSlices.forEach((s, i) => {
    const angle    = (s.pct / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad   = ((cumAngle + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;

    paths.push(
      <path key={i}
        d={`M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`}
        fill={s.color} stroke="#fff" strokeWidth="1.5" />
    );
    cumAngle += angle;
  });

  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      {paths}
      <circle cx={cx} cy={cy} r={28} fill="#fff" />
    </svg>
  );
}

// ─── Report Tab — Monthly trend bars ─────────────────────────────────────────

function MonthlyTrend({ data }: { data: IMonthlyPoint[] }) {
  const maxVal = Math.max(...data.flatMap((p) => [p.debt, p.paid]), 1);
  const BAR_H  = 80;
  return (
    <div className="debt-report-card">
      <div className="debt-report-card__title">Xu hướng công nợ theo tháng</div>
      <div className="debt-report-card__sub">Nợ phát sinh vs đã thu (6 tháng gần nhất)</div>
      <div className="debt-trend-chart">
        {data.map((p) => (
          <div key={p.key} className="debt-trend-col">
            <div className="debt-trend-bars">
              <div className="debt-trend-bar debt-trend-bar--debt"
                style={{ height: `${(p.debt / maxVal) * BAR_H}px` }}
                title={`Nợ: ${formatCurrency(p.debt)}`} />
              <div className="debt-trend-bar debt-trend-bar--paid"
                style={{ height: `${(p.paid / maxVal) * BAR_H}px` }}
                title={`Đã thu: ${formatCurrency(p.paid)}`} />
            </div>
            <span className="debt-trend-label">{p.label}</span>
          </div>
        ))}
      </div>
      <div className="debt-trend-legend">
        <span><i className="debt-legend-dot" style={{ background: "#D85A30" }} />Nợ phát sinh</span>
        <span><i className="debt-legend-dot" style={{ background: "#1D9E75" }} />Đã thu</span>
      </div>
    </div>
  );
}

// ─── Report Tab — Top debtors ─────────────────────────────────────────────────

function TopDebtors({ data }: { data: ITopDebtor[] }) {
  const maxDebt = Math.max(...data.map((d) => d.totalDebt), 1);
  return (
    <div className="debt-report-card">
      <div className="debt-report-card__title">Top đối tượng nợ nhiều nhất</div>
      <div className="debt-report-card__sub">Phải thu khách hàng — sắp xếp theo tổng nợ</div>
      {data.map((d, i) => (
        <div key={d.customerId} className="debt-top-row">
          <span className="debt-top-rank">{i + 1}</span>
          <div className="debt-top-info">
            <span className="debt-top-name">{d.customerName}</span>
            <span className="debt-top-meta">{d.invoiceCount} hóa đơn · {d.latestDate}</span>
          </div>
          <div className="debt-top-bar-wrap">
            <div className="debt-top-bar" style={{ width: `${(d.totalDebt / maxDebt) * 100}%` }} />
          </div>
          <span className="debt-top-amt">{formatCurrency(d.totalDebt)}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="debt-empty-hint">Không có dữ liệu trong kỳ này.</p>
      )}
    </div>
  );
}

// ─── Report Tab — Main ────────────────────────────────────────────────────────

function DebtReportTab() {
  const [period, setPeriod]     = useState<ReportPeriod>("3m");
  const [report, setReport]     = useState<IDebtReportResponse | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const loadReport = useCallback(async (p: ReportPeriod) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError("");
    try {
      const params = periodToDates(p);
      const data = await DebtReportService.getDebtReport(params, ctrl.signal);
      setReport(data);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError("Không tải được báo cáo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport(period);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const summary = report?.summary;
  const donutSlices = useMemo(() => {
    if (!summary?.statusBreakdown) return [];
    const colorMap: Record<string, string> = { ontime: "#1D9E75", upcoming: "#EF9F27", overdue: "#E24B4A" };
    return summary.statusBreakdown.map((s) => ({
      label: s.label, pct: s.pct, color: colorMap[s.key] ?? "#ccc",
    }));
  }, [summary]);

  return (
    <div className="debt-report-section">
      {/* Period filter */}
      <div className="debt-report-filter">
        <span className="debt-report-filter__label">Kỳ báo cáo:</span>
        {PERIOD_OPTIONS.map((opt) => (
          <button key={opt.value} type="button"
            className={`debt-period-btn ${period === opt.value ? "debt-period-btn--active" : ""}`}
            onClick={() => setPeriod(opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="debt-report-skeleton">
          {[1, 2, 3].map((i) => <div key={i} className="debt-skeleton-row" />)}
        </div>
      )}

      {error && !loading && (
        <div className="debt-report-error">
          {error}
          <button type="button" className="debt-retry-btn" onClick={() => loadReport(period)}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && report && (
        <>
          {/* KPI row */}
          <div className="finance-grid">
            <div className="finance-grid__span-3">
              <FinanceStatCard label="Tổng nợ phải thu"
                value={formatCurrency(summary?.totalReceivable ?? 0)} tone="success" />
            </div>
            <div className="finance-grid__span-3">
              <FinanceStatCard label="Nợ quá hạn"
                value={formatCurrency(summary?.overdueAmount ?? 0)} tone="danger" />
            </div>
            <div className="finance-grid__span-3">
              <FinanceStatCard label="Tỷ lệ thu hồi"
                value={`${summary?.collectionRate ?? 0}%`} tone="warning" />
            </div>
            <div className="finance-grid__span-3">
              <FinanceStatCard label="Số khoản quá hạn"
                value={String(summary?.overdueCount ?? 0)} tone="neutral" />
            </div>

            {/* Donut + Aging row */}
            <div className="finance-grid__span-5">
              <div className="debt-report-card">
                <div className="debt-report-card__title">Cơ cấu công nợ</div>
                <div className="debt-report-card__sub">Phân bổ theo trạng thái hiện tại</div>
                <div className="debt-donut-wrap">
                  <DonutChart slices={donutSlices} />
                  <div className="debt-donut-legend">
                    {donutSlices.map((s) => (
                      <div key={s.label} className="debt-donut-legend-item">
                        <i className="debt-legend-dot" style={{ background: s.color }} />
                        <span>{s.label}</span>
                        <strong>{s.pct}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="finance-grid__span-7">
              <AgingSection data={report.aging ?? []} />
            </div>

            {/* Monthly trend */}
            <div className="finance-grid__span-12">
              <MonthlyTrend data={report.monthlyTrend ?? []} />
            </div>

            {/* Top debtors */}
            <div className="finance-grid__span-12">
              <TopDebtors data={report.topDebtors ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceDebtManagement() {
  document.title = "Quản lý công nợ";
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState<ReportTab>("manage");
  const [filter, setFilter]             = useState<DebtKindFilter>("all");
  const [debts, setDebts]               = useState<IDebtItem[]>([]);
  const [summary, setSummary]           = useState<IDebtSummary>({
    totalReceivable: 0, totalPayable: 0, totalCounterparty: 0,
  });
  const [loading, setLoading]           = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<IDebtItem | null>(null);
  const [funds, setFunds]               = useState<IFundListItem[]>([]);
  const abortRef                        = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch(urlsApi.fund.overview, { method: "GET" })
      .then((r) => r.json())
      .then((res) => { if (res.code === 0) setFunds(res.result?.funds ?? []); })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async (kindFilter: DebtKindFilter) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await DebtManagementService.list(
        { kind: kindFilter === "all" ? undefined : kindFilter }, ctrl.signal
      );
      setDebts(res.items ?? []);
      if (res.summary) setSummary(res.summary);
    } catch { /* ignore abort */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "manage") loadData(filter);
    return () => abortRef.current?.abort();
  }, [filter, loadData, activeTab]);

  function handlePaid(id: number, remaining: number) {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        if (remaining <= 0) return { ...d, status: "paid" as const, amount: 0 };
        return { ...d, amount: remaining };
      })
    );
    loadData(filter);
  }

  const visibleDebts = debts.filter((d) => d.status !== "paid");

  return (
    <FinancePageShell title="Quản lý công nợ">
      {/* Header */}
      <div className="finance-screen-header">
        <h1>Quản lý công nợ</h1>
        {activeTab === "manage" && (
          <button className="finance-action-btn finance-action-btn--primary"
            onClick={() => navigate(urls.finance_management_debt_transaction)}>
            + Tạo giao dịch nợ
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="debt-tab-bar">
        <button
          className={`debt-tab ${activeTab === "manage" ? "debt-tab--active" : ""}`}
          onClick={() => setActiveTab("manage")}>
          Danh sách công nợ
        </button>
        <button
          className={`debt-tab ${activeTab === "report" ? "debt-tab--active" : ""}`}
          onClick={() => setActiveTab("report")}>
          Báo cáo công nợ
        </button>
      </div>

      {/* ── Tab: Quản lý ── */}
      {activeTab === "manage" && (
        <>
          {/* KPI */}
          <div className="finance-grid">
            <div className="finance-grid__span-4">
              <FinanceStatCard label="Tổng nợ phải thu"
                value={formatCurrency(summary.totalReceivable)} tone="success" />
            </div>
            <div className="finance-grid__span-4">
              <FinanceStatCard label="Tổng nợ phải trả"
                value={formatCurrency(summary.totalPayable)} tone="danger" />
            </div>
            <div className="finance-grid__span-4">
              <FinanceStatCard label="Số đối tượng còn nợ"
                value={String(summary.totalCounterparty)} tone="warning" />
            </div>

            {/* Table */}
            <div className="finance-grid__span-12">
              <section className="finance-panel">
                <div className="debt-filter-row">
                  <select value={filter}
                    onChange={(e) => setFilter(e.target.value as DebtKindFilter)}
                    className="finance-filter-select">
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className="debt-record-count">{visibleDebts.length} bản ghi</span>
                </div>

                {loading ? (
                  <div className="debt-loading">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="debt-skeleton-row" />)}
                  </div>
                ) : visibleDebts.length === 0 ? (
                  <div className="debt-empty">
                    <p>Không có công nợ nào phù hợp với bộ lọc.</p>
                  </div>
                ) : (
                  <table className="finance-table debt-table">
                    <thead>
                      <tr>
                        <th>Đối tượng</th><th>Loại</th><th>Số nợ</th>
                        <th>Hạn thanh toán</th><th>Thời hạn nợ</th>
                        <th>Trạng thái</th><th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDebts.map((item) => {
                        const badge = getStatusBadge(item.status);
                        const days  = getDaysLabel(item.daysRemaining);
                        return (
                          <tr key={item.id}>
                            <td className="debt-name">{item.name}</td>
                            <td className="debt-kind">{item.kind === "receivable" ? "Phải thu" : "Phải trả"}</td>
                            <td className="debt-amount">{formatCurrency(item.amount)}</td>
                            <td className="debt-due">{formatDate(item.dueDate)}</td>
                            <td>
                              <span className={`debt-days ${days.className}`}>{days.text}</span>
                            </td>
                            <td><FinanceBadge tone={badge.tone}>{badge.label}</FinanceBadge></td>
                            <td>
                              {item.kind === "receivable" ? (
                                <button className="finance-action-btn finance-action-btn--success-sm"
                                  onClick={() => setSelectedDebt(item)}>
                                  QR Thu nợ
                                </button>
                              ) : (
                                <button className="finance-action-btn finance-action-btn--outline"
                                  onClick={() => navigate(urls.finance_management_debt_transaction)}>
                                  Thanh toán
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </section>
            </div>
          </div>

          {selectedDebt && (
            <QRModal debt={selectedDebt} funds={funds}
              onClose={() => setSelectedDebt(null)} onPaid={handlePaid} />
          )}
        </>
      )}

      {/* ── Tab: Báo cáo ── */}
      {activeTab === "report" && <DebtReportTab />}
    </FinancePageShell>
  );
}