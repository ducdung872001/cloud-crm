import React, { useEffect, useState } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import ShiftService from "services/ShiftService";
import "./ReportShift.scss";

// Mock data — giữ nguyên khi API chưa hoạt động
const MOCK_REPORT = {
  cash: "3,200,000",
  card: "2,100,000",
  momo: "1,800,000",
  transfer: "1,400,000",
  total: "8,500,000",
  difference: "-50,000",
  reason: "Trả lại tiền thừa khách - Thu ngân: Nguyễn Hân",
  employeeName: "Nguyễn Hân",
  shiftName: "Ca Sáng",
  timeRange: "08:00 - 15:00",
  date: "24/05/2024",
  openingCash: "1,000,000",
  totalSaleRevenue: "3,200,000",
  actualCashCounted: "3,150,000",
  diffShiftLabel: "Chênh lệch Ca Sáng",
};

type Props = {
  shiftId: number | null;
  branchId: number;
};

export default function ShiftReportTab({ shiftId, branchId }: Props) {
  const [reportData, setReportData] = useState(MOCK_REPORT);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!shiftId || shiftId <= 0) return; // mock mode
    ShiftService.getCloseReport(shiftId)
      .then((res) => {
        const d = res?.result;
        if (!d) return; // API rỗng → giữ mock
        setReportData({
          cash: formatNum(d.totalCash ?? 0),
          card: formatNum(d.totalCard ?? 0),
          momo: formatNum(d.totalQrMomo ?? 0),
          transfer: formatNum(d.totalTransfer ?? 0),
          total: formatNum(d.totalRevenue ?? 0),
          difference: formatNum(d.cashDifference ?? 0),
          reason: d.diffNote ?? "",
          employeeName: d.employeeName ?? MOCK_REPORT.employeeName,
          shiftName: d.shiftName ?? MOCK_REPORT.shiftName,
          timeRange: d.timeRange ?? MOCK_REPORT.timeRange,
          date: d.date ?? MOCK_REPORT.date,
          openingCash: formatNum(d.openingCash ?? 0),
          totalSaleRevenue: formatNum(d.totalSaleRevenue ?? 0),
          actualCashCounted: formatNum(d.actualCashCounted ?? 0),
          diffShiftLabel: `Chênh lệch ${d.shiftName ?? "Ca"}`,
        });
      })
      .catch(() => {
        // Lỗi mạng → giữ mock
      });
  }, [shiftId]);

  const handleSendReport = async () => {
    if (!shiftId || shiftId <= 0) {
      alert("Chưa có ca thực (đang demo), không thể gửi báo cáo.");
      return;
    }
    setSending(true);
    try {
      const res = await ShiftService.sendShiftReport(shiftId, branchId);
      const msg = res?.result ?? "Đã gửi báo cáo kết ca thành công!";
      alert(msg);
    } catch (e) {
      alert("Gửi báo cáo thất bại, vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const hasDiff = reportData.difference && reportData.difference !== "0" && reportData.difference !== "-";

  return (
    <div className="page-shift-report">
      <div className="dashboard-body">
        <div className="report-grid-layout mt-24">
          <div className="report-main-info">
            <div className="card-box mb-24">
              <div className="action-header border-none">
                <h3 className="fw-700">Tổng hợp ca hôm nay</h3>
              </div>
              <div className="p-24 pt-0">
                <ul className="revenue-list">
                  <li>
                    <span>Tiền mặt</span>{" "}
                    <strong className="text-success">{reportData.cash} VNĐ</strong>
                  </li>
                  <li>
                    <span>Thẻ ngân hàng</span> <strong>{reportData.card} VNĐ</strong>
                  </li>
                  <li>
                    <span>QR/Momo</span> <strong>{reportData.momo} VNĐ</strong>
                  </li>
                  <li className="last-child">
                    <span>Chuyển khoản</span> <strong>{reportData.transfer} VNĐ</strong>
                  </li>
                  <li className="total-row mt-16 pt-16">
                    <span className="fw-700">Tổng doanh thu</span>
                    <strong className="text-success fs-20">{reportData.total} VNĐ</strong>
                  </li>
                </ul>
              </div>
            </div>

            {hasDiff && (
              <div className="card-box warning-box mt-2">
                <div className="p-24 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-8 warning-left">
                    <Icon name="WarningCircle" className="icon-error warning-icon" />
                    <span className="fw-700 text-danger shift-diff-label">
                      {reportData.diffShiftLabel}
                    </span>
                  </div>
                  <strong className="text-danger">{reportData.difference} VNĐ</strong>
                </div>
                {reportData.reason && (
                  <div className="reason-area p-24 pt-0">
                    <p className="p-16 bg-light-error text-muted rounded-8">
                      Lý do: {reportData.reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="report-preview-sticky">
            <div className="z-report-paper">
              <div className="paper-header">
                <h4>BÁO CÁO KẾT CA</h4>
              </div>
              <div className="paper-body">
                <div className="info-line">
                  <span>Tên NV:</span> <span>{reportData.employeeName}</span>
                </div>
                <div className="info-line">
                  <span>Ca làm:</span> <span>{reportData.shiftName}</span>
                </div>
                <div className="info-line">
                  <span>Thời gian:</span> <span>{reportData.timeRange}</span>
                </div>
                <div className="info-line mb-16">
                  <span>Ngày:</span> <span>{reportData.date}</span>
                </div>
                <hr />
                <div className="info-line mt-16">
                  <span>Tiền lẻ đầu ca:</span> <span>{reportData.openingCash} VNĐ</span>
                </div>
                <div className="info-line">
                  <span>Tổng doanh thu:</span> <span>{reportData.totalSaleRevenue} VNĐ</span>
                </div>
                <div className="info-line text-primary">
                  <span>Tiền mặt thực đếm:</span>{" "}
                  <span>{reportData.actualCashCounted} VNĐ</span>
                </div>
                <div className="info-line text-danger fw-700">
                  <span>Chênh lệch:</span> <span>{reportData.difference} VNĐ</span>
                </div>
              </div>

              <div className="paper-footer mt-24">
                <div className="content-footer">
                  <Button
                    variant="outline"
                    color="primary"
                    className="w-100"
                    onClick={() => window.print()}
                  >
                    In báo cáo
                  </Button>
                  <Button
                    color="primary"
                    className="w-100"
                    disabled={sending}
                    onClick={handleSendReport}
                  >
                    {sending ? "Đang gửi..." : "Gửi Quản lý"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNum(v: number): string {
  return v.toLocaleString("vi-VN");
}