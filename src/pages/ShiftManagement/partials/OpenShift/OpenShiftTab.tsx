import React, { useMemo, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import ShiftService from "services/ShiftService";
import { saveActiveShiftId } from "utils/ShiftStorage";
import "./OpenShift.scss";

type Props = {
  shiftConfigId: number;
  branchId: number;
  shiftName?: string;
  shiftTime?: string;
  defaultCash?: number;
  onShiftOpened?: (shiftId: number) => void;
};

const DENOMS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

function fmtVND(n: number): string {
  return n ? n.toLocaleString("vi-VN") : "0";
}

export default function OpenShiftTab({
  shiftConfigId, branchId,
  shiftName = "", shiftTime = "", defaultCash = 0,
  onShiftOpened,
}: Props) {
  const [mode, setMode]         = useState<"total" | "denom">("total");
  const [totalRaw, setTotalRaw] = useState<string>(defaultCash > 0 ? String(defaultCash) : "");
  const [counts, setCounts]     = useState<Record<number, number>>({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const totalAmount = mode === "total"
    ? (Number(totalRaw.replace(/\D/g, "")) || 0)
    : Object.entries(counts).reduce((s, [v, q]) => s + Number(v) * q, 0);

  const subtotals = useMemo(() =>
    Object.fromEntries(DENOMS.map(v => [v, (counts[v] || 0) * v])), [counts]);

  const displayTotal = totalRaw ? Number(totalRaw.replace(/\D/g, "")).toLocaleString("vi-VN") : "";

  const adjust = (val: number, delta: number) =>
    setCounts(p => ({ ...p, [val]: Math.max(0, (p[val] || 0) + delta) }));

  const handleConfirm = async () => {
    if (loading) return;
    if (totalAmount <= 0) { setError("Vui lòng nhập số tiền đầu ca."); return; }
    setLoading(true); setError("");
    try {
      const body = mode === "denom"
        ? { shiftConfigId, denominations: Object.entries(counts).filter(([, q]) => q > 0).map(([v, q]) => ({ denomination: Number(v), quantity: q })) }
        : { shiftConfigId, openingCash: totalAmount };
      const res = await ShiftService.openShift(branchId, body);
      const shiftId = res?.result?.id ?? res?.data?.id;
      if (shiftId) saveActiveShiftId(shiftId);
      onShiftOpened?.(shiftId ?? 0);
    } catch { onShiftOpened?.(0); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-open-shift">

      {/* Banner */}
      {(shiftName || shiftTime) && (
        <div className="os-banner">
          <div className="os-banner-left">
            <div className="os-banner-icon"><Icon name="Clock" /></div>
            <div>
              <div className="os-banner-name">{shiftName || "Ca làm việc"}</div>
              {shiftTime && <div className="os-banner-time">{shiftTime}</div>}
            </div>
          </div>
          <div className="os-banner-date">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </div>
        </div>
      )}

      {/* Mode tabs */}
      <div className="os-modes">
        <button className={`os-mode-btn${mode === "total" ? " active" : ""}`} onClick={() => setMode("total")}>
          <Icon name="Banknote" /><span>Nhập tổng tiền</span>
        </button>
        <button className={`os-mode-btn${mode === "denom" ? " active" : ""}`} onClick={() => setMode("denom")}>
          <Icon name="ListBullets" /><span>Nhập theo mệnh giá</span>
        </button>
      </div>

      {/* Content */}
      <div className="os-body">

        {mode === "total" && (
          <div className="os-total-mode">
            <p className="os-hint">Nhập tổng tiền mặt thực tế trong két để bắt đầu ca.</p>
            <div className="os-total-field">
              <label>Tiền mặt đầu ca</label>
              <div className={`os-total-input${error ? " error" : ""}`}>
                <input
                  type="text" inputMode="numeric" placeholder="0" value={displayTotal} autoFocus
                  onChange={e => { setTotalRaw(e.target.value.replace(/\D/g, "")); setError(""); }}
                />
                <span className="os-currency">VNĐ</span>
              </div>
              {error && <p className="os-error">{error}</p>}
              {defaultCash > 0 && (
                <button className="os-preset" onClick={() => { setTotalRaw(String(defaultCash)); setError(""); }}>
                  Dùng mặc định: {fmtVND(defaultCash)} VNĐ
                </button>
              )}
            </div>
          </div>
        )}

        {mode === "denom" && (
          <div className="os-denom-mode">
            <p className="os-hint">Đếm và nhập số tờ theo từng mệnh giá.</p>
            <div className="os-denom-table">
              <div className="os-denom-head">
                <span>Mệnh giá</span>
                <span>Số tờ</span>
                <span>Thành tiền</span>
              </div>
              {DENOMS.map(val => {
                const qty = counts[val] || 0;
                const sub = subtotals[val] || 0;
                return (
                  <div key={val} className={`os-denom-row${qty > 0 ? " active" : ""}`}>
                    <div className="os-denom-label">
                      <span className="val">{fmtVND(val)}</span>
                      <span className="unit">đ</span>
                    </div>
                    <div className="os-stepper">
                      <button onClick={() => adjust(val, -1)}>−</button>
                      <input
                        type="number" min={0} value={qty || ""} placeholder="0"
                        onChange={e => setCounts(p => ({ ...p, [val]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      />
                      <button onClick={() => adjust(val, 1)}>+</button>
                    </div>
                    <div className={`os-denom-sub${sub > 0 ? " active" : ""}`}>
                      {sub > 0 ? fmtVND(sub) + " đ" : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="os-footer">
        <div className="os-footer-total">
          <span className="os-footer-label">TỔNG TIỀN ĐẦU CA</span>
          <span className={`os-footer-amount${totalAmount > 0 ? " active" : ""}`}>
            {fmtVND(totalAmount)}<span className="u"> VNĐ</span>
          </span>
        </div>
        <Button color="primary" className="os-confirm-btn" disabled={loading || totalAmount <= 0} onClick={handleConfirm}>
          {loading
            ? <><Icon name="Spinner" className="mr-8 spin" />Đang xử lý...</>
            : <><Icon name="CheckCircle" className="mr-8" />Xác nhận vào ca</>}
        </Button>
      </div>

    </div>
  );
}