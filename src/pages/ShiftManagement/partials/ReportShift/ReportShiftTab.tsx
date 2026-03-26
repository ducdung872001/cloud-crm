import React, { useEffect, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import Loading from "components/loading";
import ShiftService from "services/ShiftService";
import "./ReportShift.scss";

type ReportData = {
  // Panel trái
  totalCash: number;
  totalCard: number;
  totalQrMomo: number;
  totalTransfer: number;
  totalRevenue: number;
  // Panel phải
  employeeName: string;
  shiftName: string;
  timeRange: string;
  date: string;
  openingCash: number;
  totalSaleRevenue: number;
  actualCashCounted: number;
  cashDifference: number;
  diffNote: string;
};

type Props = {
  shiftId: number | null;
  branchId: number;
};

function fmtVND(n: number): string {
  return (n || 0).toLocaleString("vi-VN");
}
function fmtCompact(v: number): string {
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 1_000_000_000) return s + (a / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  if (a >= 1_000_000)     return s + (a / 1_000_000).toFixed(1).replace(/\.0$/, "")     + "M";
  if (a >= 1_000)         return s + (a / 1_000).toFixed(1).replace(/\.0$/, "")          + "K";
  return s + String(a);
}

export default function ShiftReportTab({ shiftId, branchId }: Props) {
  const [data, setData]       = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  useEffect(() => {
    if (!shiftId || shiftId <= 0) { setLoading(false); return; }
    setLoading(true);
    ShiftService.getCloseReport(shiftId)
      .then((res: any) => {
        const d = res?.result;
        if (!d) return;
        setData({
          totalCash:         d.totalCash         ?? 0,
          totalCard:         d.totalCard         ?? 0,
          totalQrMomo:       d.totalQrMomo       ?? 0,
          totalTransfer:     d.totalTransfer     ?? 0,
          totalRevenue:      d.totalRevenue      ?? 0,
          employeeName:      d.employeeName      ?? "—",
          shiftName:         d.shiftName         ?? "—",
          timeRange:         d.timeRange         ?? "—",
          date:              d.date              ?? new Date().toLocaleDateString("vi-VN"),
          openingCash:       d.openingCash       ?? 0,
          totalSaleRevenue:  d.totalSaleRevenue  ?? d.totalRevenue ?? 0,
          actualCashCounted: d.actualCashCounted ?? 0,
          cashDifference:    d.cashDifference    ?? 0,
          diffNote:          d.diffNote          ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [shiftId]);

  const handleSendReport = async () => {
    if (!shiftId || shiftId <= 0) return;
    setSending(true);
    try {
      await ShiftService.sendShiftReport(shiftId, branchId);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const diff = data?.cashDifference ?? 0;
  const hasDiff = diff !== 0;

  if (loading) return <div className="rsr-loading"><Loading /></div>;

  if (!data) return (
    <div className="rsr-empty">
      <Icon name="Document" />
      <p>Chưa có dữ liệu báo cáo cho ca này.</p>
    </div>
  );

  return (
    <div className="page-shift-report">
      <div className="rsr-layout">

        {/* ── Panel trái: tổng hợp doanh thu ── */}
        <div className="rsr-left">

          {/* Summary cards */}
          <div className="rsr-summary-cards">
            <div className="rsr-sum-card highlight">
              <div className="rsr-sum-label">Tổng doanh thu</div>
              <div className="rsr-sum-val text-success">{fmtCompact(data.totalRevenue)} VNĐ</div>
            </div>
            <div className="rsr-sum-card">
              <div className="rsr-sum-label">Tiền mặt</div>
              <div className="rsr-sum-val">{fmtCompact(data.totalCash)} VNĐ</div>
            </div>
            <div className="rsr-sum-card">
              <div className="rsr-sum-label">Thẻ ngân hàng</div>
              <div className="rsr-sum-val">{fmtCompact(data.totalCard)} VNĐ</div>
            </div>
            <div className="rsr-sum-card">
              <div className="rsr-sum-label">QR / Momo</div>
              <div className="rsr-sum-val">{fmtCompact(data.totalQrMomo)} VNĐ</div>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="rsr-breakdown">
            <div className="rsr-breakdown-title">Chi tiết thanh toán</div>
            {[
              { label: "Tiền mặt",      val: data.totalCash,     icon: "Cash",         cls: "cash" },
              { label: "Thẻ ngân hàng", val: data.totalCard,     icon: "CreditCard",   cls: "card" },
              { label: "QR / Momo",     val: data.totalQrMomo,   icon: "QrCode",       cls: "momo" },
              { label: "Chuyển khoản",  val: data.totalTransfer, icon: "ArrowSwapHorizontal", cls: "transfer" },
            ].map(row => (
              <div key={row.label} className={`rsr-row${row.val > 0 ? " has-val" : ""}`}>
                <div className="rsr-row-left">
                  <span className={`rsr-row-dot rsr-dot-${row.cls}`} />
                  <span className="rsr-row-label">{row.label}</span>
                </div>
                <span className="rsr-row-val">{fmtVND(row.val)} VNĐ</span>
              </div>
            ))}
            <div className="rsr-total-row">
              <span>Tổng doanh thu</span>
              <span className="text-success">{fmtVND(data.totalRevenue)} VNĐ</span>
            </div>
          </div>

          {/* Chênh lệch */}
          {hasDiff && (
            <div className={`rsr-diff-box${diff < 0 ? " minus" : " plus"}`}>
              <div className="rsr-diff-top">
                <div className="rsr-diff-left">
                  <Icon name="WarningCircle" />
                  <span>Chênh lệch {data.shiftName}</span>
                </div>
                <span className="rsr-diff-val">
                  {diff > 0 ? "+" : ""}{fmtVND(diff)} VNĐ
                </span>
              </div>
              {data.diffNote && (
                <div className="rsr-diff-note">
                  <Icon name="Document" />
                  <span>Lý do: {data.diffNote}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Panel phải: phiếu kết ca ── */}
        <div className="rsr-right">
          <div className="rsr-paper">
            <div className="rsr-paper-header">
              <div className="rsr-paper-logo">
                <Icon name="Checked" />
              </div>
              <div className="rsr-paper-title">BÁO CÁO KẾT CA</div>
              <div className={`rsr-paper-status${hasDiff ? " warning" : " ok"}`}>
                {hasDiff ? "Có chênh lệch" : "Cân bằng"}
              </div>
            </div>

            <div className="rsr-paper-section">
              <div className="rsr-paper-row">
                <span>Nhân viên</span><span>{data.employeeName}</span>
              </div>
              <div className="rsr-paper-row">
                <span>Ca làm</span><span>{data.shiftName}</span>
              </div>
              <div className="rsr-paper-row">
                <span>Khung giờ</span><span>{data.timeRange}</span>
              </div>
              <div className="rsr-paper-row">
                <span>Ngày</span><span>{data.date}</span>
              </div>
            </div>

            <div className="rsr-paper-divider" />

            <div className="rsr-paper-section">
              <div className="rsr-paper-row">
                <span>Tiền lẻ đầu ca</span>
                <span>{fmtVND(data.openingCash)} VNĐ</span>
              </div>
              <div className="rsr-paper-row">
                <span>Tổng doanh thu</span>
                <span>{fmtVND(data.totalSaleRevenue)} VNĐ</span>
              </div>
              <div className="rsr-paper-row text-primary">
                <span>Tiền mặt thực đếm</span>
                <span>{fmtVND(data.actualCashCounted)} VNĐ</span>
              </div>
              <div className={`rsr-paper-row rsr-diff-row${hasDiff ? (diff < 0 ? " minus" : " plus") : " zero"}`}>
                <span>Chênh lệch</span>
                <span>{diff > 0 ? "+" : ""}{fmtVND(diff)} VNĐ</span>
              </div>
            </div>

            <div className="rsr-paper-actions">
              <Button variant="outline" color="primary" onClick={() => window.print()}>
                <Icon name="Print" className="mr-8" />In báo cáo
              </Button>
              <Button
                color="primary"
                disabled={sending}
                onClick={handleSendReport}
                className={sent ? "btn-sent" : ""}
              >
                {sent
                  ? <><Icon name="Checked" className="mr-8" />Đã gửi!</>
                  : sending
                    ? "Đang gửi..."
                    : <><Icon name="Send" className="mr-8" />Gửi Quản lý</>
                }
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}