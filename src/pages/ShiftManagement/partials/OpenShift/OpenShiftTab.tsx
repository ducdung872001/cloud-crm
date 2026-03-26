import React, { useMemo, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import ShiftService from "services/ShiftService";
import "./OpenShift.scss";

type Props = {
  shiftConfigId: number;
  branchId: number;
  shiftName?: string;     // tên ca từ NotOpenShiftTab
  shiftTime?: string;     // khung giờ từ NotOpenShiftTab
  defaultCash?: number;   // tiền lẻ mặc định để pre-fill
  onShiftOpened?: (shiftId: number) => void;
};

const DENOMS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

// Format số có dấu phân cách hàng nghìn
function formatVND(n: number): string {
  if (!n) return "0";
  return n.toLocaleString("vi-VN");
}

// Parse chuỗi có dấu phân cách → số
function parseAmount(s: string): number {
  return Number(s.replace(/\./g, "").replace(/,/g, "")) || 0;
}

export default function OpenShiftTab({
  shiftConfigId, branchId,
  shiftName = "", shiftTime = "", defaultCash = 0,
  onShiftOpened,
}: Props) {
  const [mode, setMode]           = useState<"total" | "denom">("total");
  const [totalRaw, setTotalRaw]   = useState<string>(defaultCash > 0 ? String(defaultCash) : "");
  const [counts, setCounts]       = useState<Record<number, number>>({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Tổng tiền theo mode
  const totalAmount = mode === "total"
    ? parseAmount(totalRaw)
    : Object.entries(counts).reduce((s, [v, q]) => s + Number(v) * q, 0);

  const denomSubtotals = useMemo(() =>
    Object.fromEntries(DENOMS.map((v) => [v, (counts[v] || 0) * v])),
    [counts]
  );

  const handleTotalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ giữ chữ số
    const raw = e.target.value.replace(/\D/g, "");
    setTotalRaw(raw);
    setError("");
  };

  // Hiển thị có dấu phân cách trong input
  const displayTotal = totalRaw ? Number(totalRaw).toLocaleString("vi-VN") : "";

  const handleConfirm = async () => {
    if (loading) return;
    if (totalAmount <= 0) { setError("Vui lòng nhập số tiền đầu ca."); return; }
    setLoading(true); setError("");
    try {
      const body = mode === "denom"
        ? {
            shiftConfigId,
            denominations: Object.entries(counts)
              .filter(([, q]) => q > 0)
              .map(([v, q]) => ({ denomination: Number(v), quantity: q })),
          }
        : { shiftConfigId, openingCash: totalAmount };

      const res = await ShiftService.openShift(branchId, body);
      const shiftId = res?.result?.id ?? res?.data?.id;
      onShiftOpened?.(shiftId ?? 0);
    } catch (e) {
      console.error("Lỗi mở ca:", e);
      onShiftOpened?.(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-open-shift">

      {/* Context banner — tên ca + khung giờ */}
      {(shiftName || shiftTime) && (
        <div className="open-shift-context">
          <div className="ctx-left">
            <span className="ctx-icon"><Icon name="Clock" /></span>
            <div>
              <div className="ctx-name">{shiftName || "Ca làm việc"}</div>
              {shiftTime && <div className="ctx-time">{shiftTime}</div>}
            </div>
          </div>
          <div className="ctx-right">
            <span className="ctx-date">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* Mode switcher */}
      <div className="open-shift-modes">
        <button className={`mode-btn${mode === "total" ? " active" : ""}`} onClick={() => setMode("total")}>
          <Icon name="Banknote" />
          <span>Nhập tổng tiền</span>
        </button>
        <button className={`mode-btn${mode === "denom" ? " active" : ""}`} onClick={() => setMode("denom")}>
          <Icon name="ListBullets" />
          <span>Nhập theo mệnh giá</span>
        </button>
      </div>

      <div className="open-shift-content">

        {/* Mode 1: Nhập tổng */}
        {mode === "total" && (
          <div className="total-mode">
            <p className="hint-text">Nhập tổng số tiền mặt thực tế có trong két để bắt đầu ca.</p>

            <div className="amount-input-group">
              <label>Tiền mặt đầu ca</label>
              <div className={`amount-input-wrap${error ? " has-error" : ""}`}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={displayTotal}
                  onChange={handleTotalInput}
                  autoFocus
                />
                <span className="currency-badge">VNĐ</span>
              </div>
              {error && <p className="error-msg">{error}</p>}
              {defaultCash > 0 && (
                <button
                  className="preset-btn"
                  onClick={() => { setTotalRaw(String(defaultCash)); setError(""); }}
                >
                  Dùng mặc định: {formatVND(defaultCash)} VNĐ
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Nhập mệnh giá */}
        {mode === "denom" && (
          <div className="denom-mode">
            <p className="hint-text">Đếm và nhập số tờ theo từng mệnh giá.</p>
            <div className="denom-table">
              <div className="denom-header">
                <span>Mệnh giá</span>
                <span>Số tờ</span>
                <span>Thành tiền</span>
              </div>
              {DENOMS.map((val) => (
                <div key={val} className={`denom-row${(counts[val] || 0) > 0 ? " has-value" : ""}`}>
                  <span className="denom-val">{formatVND(val)} đ</span>
                  <div className="denom-stepper">
                    <button onClick={() => setCounts((p) => ({ ...p, [val]: Math.max(0, (p[val] || 0) - 1) }))}>−</button>
                    <input
                      type="number"
                      min={0}
                      value={counts[val] || ""}
                      placeholder="0"
                      onChange={(e) => setCounts((p) => ({ ...p, [val]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    />
                    <button onClick={() => setCounts((p) => ({ ...p, [val]: (p[val] || 0) + 1 }))}>+</button>
                  </div>
                  <span className={`denom-subtotal${denomSubtotals[val] > 0 ? " active" : ""}`}>
                    {denomSubtotals[val] > 0 ? `= ${formatVND(denomSubtotals[val])} đ` : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer sticky */}
      <div className="open-shift-footer">
        <div className="footer-total">
          <span className="footer-label">TỔNG TIỀN ĐẦU CA</span>
          <span className={`footer-amount${totalAmount > 0 ? " has-value" : ""}`}>
            {formatVND(totalAmount)} <span className="unit">VNĐ</span>
          </span>
        </div>
        <Button
          color="primary"
          className="btn-confirm"
          disabled={loading || totalAmount <= 0}
          onClick={handleConfirm}
        >
          {loading
            ? <><Icon name="Spinner" className="mr-8 spin" />Đang xử lý...</>
            : <><Icon name="CheckCircle" className="mr-8" />Xác nhận vào ca</>
          }
        </Button>
      </div>

    </div>
  );
}