import React, { useContext, useEffect, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import Loading from "components/loading";
import ShiftService from "services/ShiftService";
import { UserContext, ContextType } from "contexts/userContext";
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
  const { dataBranch } = useContext(UserContext) as ContextType;
  const branchName = dataBranch?.label ?? "";

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

  const handlePrint = () => {
    if (!data) return;
    const win = window.open("", "_blank", "width=640,height=900");
    if (!win) return;

    const f = (n: number) => n.toLocaleString("vi-VN");
    const diffClass = diff < 0 ? "minus" : diff > 0 ? "plus" : "";
    const diffSign  = diff > 0 ? "+" : "";

    const rows = (label: string, val: string, cls = "") =>
      `<div class="row ${cls}"><span class="lbl">${label}</span><span class="val">${val}</span></div>`;

    const html = [
      "<!DOCTYPE html><html lang='vi'><head><meta charset='UTF-8'/>",
      "<title>Báo cáo kết ca</title><style>",
      "* { margin:0; padding:0; box-sizing:border-box; }",
      "body { font-family:Arial,sans-serif; font-size:13px; color:#000; padding:24px; max-width:400px; margin:0 auto; }",
      ".branch { font-size:15px; font-weight:900; text-align:center; text-transform:uppercase; margin-bottom:4px; }",
      ".title  { font-size:17px; font-weight:900; text-align:center; letter-spacing:2px; text-transform:uppercase; }",
      ".sub    { text-align:center; color:#555; margin-top:4px; margin-bottom:16px; font-size:12px; }",
      "hr      { border:none; border-top:1px solid #000; margin:14px 0; }",
      ".row    { display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #ddd; font-size:13px; }",
      ".lbl    { color:#555; }",
      ".val    { font-weight:600; }",
      ".total  { border-top:2px solid #000; border-bottom:2px solid #000; padding:8px 0; margin-top:4px; font-weight:800; font-size:14px; }",
      ".diff   { font-weight:700; font-size:14px; border-bottom:none; }",
      ".minus .val { color:#c00; }",
      ".plus  .val { color:#080; }",
      ".note   { font-style:italic; color:#555; font-size:12px; padding:4px 0; }",
      ".footer { display:flex; justify-content:space-between; margin-top:32px; padding-top:14px; border-top:1px dashed #999; font-size:11px; color:#555; }",
      "</style></head><body>",
      branchName ? `<div class="branch">${branchName}</div>` : "",
      `<div class="title">BÁO CÁO KẾT CA</div>`,
      `<div class="sub">${data.shiftName} · ${data.date}</div>`,
      "<hr/>",
      rows("Nhân viên",  data.employeeName),
      rows("Ca làm",     data.shiftName),
      rows("Thời gian",  data.timeRange),
      rows("Ngày",       data.date),
      "<hr/>",
      rows("Tiền lẻ đầu ca",  f(data.openingCash)       + " VNĐ"),
      rows("Tiền mặt",         f(data.totalCash)          + " VNĐ"),
      rows("Thẻ ngân hàng",    f(data.totalCard)          + " VNĐ"),
      rows("QR / Momo",        f(data.totalQrMomo)        + " VNĐ"),
      rows("Chuyển khoản",     f(data.totalTransfer)      + " VNĐ"),
      rows("Tổng doanh thu",   f(data.totalRevenue)       + " VNĐ", "total"),
      "<hr/>",
      rows("Tiền mặt thực đếm", `<span style="color:#1a56db">${f(data.actualCashCounted)} VNĐ</span>`),
      rows("Chênh lệch",       diffSign + f(diff) + " VNĐ", `diff ${diffClass}`),
      data.diffNote ? `<div class="note">Lý do: ${data.diffNote}</div>` : "",
      `<div class="footer">`,
      `  <span>Ngày in: ${new Date().toLocaleString("vi-VN")}</span>`,
      `  <span>Chữ ký: ___________</span>`,
      `</div>`,
      "</body></html>",
    ].join("\n");

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  };


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
              <Button variant="outline" color="primary" onClick={handlePrint}>
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