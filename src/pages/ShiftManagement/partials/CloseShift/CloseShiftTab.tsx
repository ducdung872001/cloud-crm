import React, { useEffect, useMemo, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import ShiftService from "services/ShiftService";
import { clearActiveShiftId } from "utils/ShiftStorage";
import "./CloseShift.scss";

type Props = {
  shiftId: number | null;
  branchId: number;
  onShiftClosed?: () => void;
};

const DENOMS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

function fmtVND(n: number): string { return n ? n.toLocaleString("vi-VN") : "0"; }
function fmtCompact(v: number): string {
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 1_000_000_000) return s + (a / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (a >= 1_000_000)     return s + (a / 1_000_000).toFixed(1).replace(/\.0$/, "")     + "M";
  if (a >= 1_000)         return s + (a / 1_000).toFixed(1).replace(/\.0$/, "")          + "K";
  return s + String(a);
}

export default function CloseShiftTab({ shiftId, branchId, onShiftClosed }: Props) {
  const [mode, setMode]         = useState<"total" | "denom">("total");
  const [totalRaw, setTotalRaw] = useState("");
  const [counts, setCounts]     = useState<Record<number, number>>({});
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const [summary, setSummary] = useState<{
    shiftName: string; timeRange: string; cashierName: string;
    openingCash: number; totalRevenue: number; totalOrders: number;
    currentCash: number; elapsedSeconds: number;
  } | null>(null);

  useEffect(() => {
    if (!branchId) return;
    ShiftService.getActiveDashboard(branchId)
      .then((res: any) => {
        const d = res?.result;
        if (!d) return;
        setSummary({
          shiftName:      d.shiftName      ?? "Ca làm việc",
          timeRange:      d.timeRange      ?? "—",
          cashierName:    d.cashierName    ?? "—",
          openingCash:    d.openingCash    ?? 0,
          totalRevenue:   d.totalRevenue   ?? 0,
          totalOrders:    d.totalOrders    ?? 0,
          currentCash:    d.currentCash    ?? 0,
          elapsedSeconds: d.elapsedSeconds ?? 0,
        });
        if (d.currentCash > 0) setTotalRaw(String(Math.round(d.currentCash)));
      })
      .catch(() => {});
  }, [branchId]);

  const closingAmount = mode === "total"
    ? (Number(totalRaw.replace(/\D/g, "")) || 0)
    : Object.entries(counts).reduce((s, [v, q]) => s + Number(v) * q, 0);

  const subtotals = useMemo(() =>
    Object.fromEntries(DENOMS.map(v => [v, (counts[v] || 0) * v])), [counts]);

  const displayTotal = totalRaw
    ? Number(totalRaw.replace(/\D/g, "")).toLocaleString("vi-VN") : "";

  const diff = summary ? closingAmount - summary.currentCash : 0;

  const elapsed = summary?.elapsedSeconds ?? 0;
  const elapsedText = `${Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) + " giờ " : ""}${Math.floor((elapsed % 3600) / 60)} phút`;

  const adjust = (val: number, delta: number) =>
    setCounts(p => ({ ...p, [val]: Math.max(0, (p[val] || 0) + delta) }));

  const handleConfirm = async () => {
    if (loading) return;
    if (closingAmount <= 0) { setError("Vui lòng nhập số tiền cuối ca."); return; }
    setLoading(true); setError("");
    try {
      if (shiftId && shiftId > 0) {
        const body = mode === "denom"
          ? { shiftId, note: note || undefined, denominations: Object.entries(counts).filter(([, q]) => q > 0).map(([v, q]) => ({ denomination: Number(v), quantity: q })) }
          : { shiftId, closingCash: closingAmount, note: note || undefined };
        const res = await ShiftService.closeShift(branchId, body);
        if (res?.result?.status === "CLOSED" || res?.result?.id || res?.data?.id) {
          clearActiveShiftId(); onShiftClosed?.(); return;
        }
      }
      clearActiveShiftId(); onShiftClosed?.();
    } catch { clearActiveShiftId(); onShiftClosed?.(); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-close-shift">

      {/* Summary banner */}
      {summary && (
        <div className="cs-banner">
          <div className="cs-banner-left">
            <div className="cs-banner-icon"><Icon name="Clock" /></div>
            <div>
              <div className="cs-banner-name">{summary.shiftName} · {summary.timeRange}</div>
              <div className="cs-banner-meta">{summary.cashierName} · Đã làm {elapsedText}</div>
            </div>
          </div>
          <div className="cs-banner-stats">
            <div className="cs-stat">
              <span className="cs-stat-label">Doanh thu</span>
              <span className="cs-stat-val text-success">{fmtCompact(summary.totalRevenue)} VNĐ</span>
            </div>
            <div className="cs-stat">
              <span className="cs-stat-label">Đơn hàng</span>
              <span className="cs-stat-val">{summary.totalOrders}</span>
            </div>
            <div className="cs-stat">
              <span className="cs-stat-label">Tiền đầu ca</span>
              <span className="cs-stat-val">{fmtCompact(summary.openingCash)} VNĐ</span>
            </div>
            <div className="cs-stat">
              <span className="cs-stat-label">Dự kiến cuối ca</span>
              <span className="cs-stat-val text-primary">{fmtCompact(summary.currentCash)} VNĐ</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="cs-modes">
        <button className={`cs-mode-btn${mode === "total" ? " active" : ""}`} onClick={() => setMode("total")}>
          <Icon name="Banknote" /><span>Nhập tổng tiền</span>
        </button>
        <button className={`cs-mode-btn${mode === "denom" ? " active" : ""}`} onClick={() => setMode("denom")}>
          <Icon name="ListBullets" /><span>Nhập theo mệnh giá</span>
        </button>
      </div>

      {/* Body */}
      <div className="cs-body">
        <p className="cs-hint">Kiểm đếm và nhập số tiền mặt thực tế trong két để kết thúc ca.</p>

        {mode === "total" && (
          <div className="cs-total-mode">
            <div className="cs-total-field">
              <label>Tiền mặt cuối ca</label>
              <div className={`cs-total-input${error ? " error" : ""}`}>
                <input
                  type="text" inputMode="numeric" placeholder="0"
                  value={displayTotal} autoFocus
                  onChange={e => { setTotalRaw(e.target.value.replace(/\D/g, "")); setError(""); }}
                />
                <span className="cs-currency">VNĐ</span>
              </div>
              {error && <p className="cs-error">{error}</p>}
            </div>
          </div>
        )}

        {mode === "denom" && (
          <div className="cs-denom-mode">
            <div className="cs-denom-table">
              <div className="cs-denom-head">
                <span>Mệnh giá</span>
                <span>Số tờ</span>
                <span>Thành tiền</span>
              </div>
              {DENOMS.map(val => {
                const qty = counts[val] || 0;
                const sub = subtotals[val] || 0;
                return (
                  <div key={val} className={`cs-denom-row${qty > 0 ? " active" : ""}`}>
                    <div className="cs-denom-label">
                      <span className="val">{fmtVND(val)}</span><span className="unit">đ</span>
                    </div>
                    <div className="cs-stepper">
                      <button onClick={() => adjust(val, -1)}>−</button>
                      <input type="number" min={0} value={qty || ""} placeholder="0"
                        onChange={e => setCounts(p => ({ ...p, [val]: Math.max(0, parseInt(e.target.value) || 0) }))} />
                      <button onClick={() => adjust(val, 1)}>+</button>
                    </div>
                    <div className={`cs-denom-sub${sub > 0 ? " active" : ""}`}>
                      {sub > 0 ? fmtVND(sub) + " đ" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chênh lệch + ghi chú */}
        {closingAmount > 0 && (
          <div className="cs-diff-row">
            <div className={`cs-diff-badge${diff > 0 ? " plus" : diff < 0 ? " minus" : " zero"}`}>
              <span className="cs-diff-label">Chênh lệch</span>
              <span className="cs-diff-val">
                {diff > 0 ? "+" : ""}{fmtVND(diff)} VNĐ
              </span>
            </div>
            {Math.abs(diff) > 0 && (
              <input
                className="cs-note-input"
                type="text"
                placeholder="Ghi chú lý do chênh lệch (tuỳ chọn)..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="cs-footer">
        <div className="cs-footer-total">
          <span className="cs-footer-label">TỔNG TIỀN HẾT CA</span>
          <span className={`cs-footer-amount${closingAmount > 0 ? " active" : ""}`}>
            {fmtVND(closingAmount)}<span className="u"> VNĐ</span>
          </span>
        </div>
        <Button color="destroy" className="cs-confirm-btn"
          disabled={loading || closingAmount <= 0} onClick={handleConfirm}>
          {loading
            ? <><Icon name="Spinner" className="mr-8 spin" />Đang xử lý...</>
            : <><Icon name="CloseSquare" className="mr-8" />Xác nhận kết thúc ca</>}
        </Button>
      </div>

    </div>
  );
}