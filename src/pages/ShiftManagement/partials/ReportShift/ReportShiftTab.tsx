import React from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import "./ReportShift.scss";

export default function ShiftReportTab() {
  const reportData = {
    cash: "3,200,000",
    card: "2,100,000",
    momo: "1,800,000",
    transfer: "1,400,000",
    total: "8,500,000",
    difference: "-50,000",
    reason: "Trả lại tiền thừa khách - Thu ngân: Nguyễn Hân",
  };

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
                    <span>Tiền mặt</span> <strong className="text-success">{reportData.cash} VNĐ</strong>
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

            <div className="card-box warning-box mt-2">
              <div className="p-24 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-8 warning-left">
                  <Icon name="WarningCircle" className="icon-error warning-icon" />
                  <span className="fw-700 text-danger shift-diff-label">Chênh lệch Ca Sáng</span>
                </div>
                <strong className="text-danger">{reportData.difference} VNĐ</strong>
              </div>
              <div className="reason-area p-24 pt-0">
                <p className="p-16 bg-light-error text-muted rounded-8">Lý do: {reportData.reason}</p>
              </div>
            </div>
          </div>

          <div className="report-preview-sticky">
            <div className="z-report-paper">
              <div className="paper-header">
                <h4>BÁO CÁO KẾT CA</h4>
              </div>
              <div className="paper-body">
                <div className="info-line">
                  <span>Tên NV:</span> <span>Nguyễn Hân</span>
                </div>
                <div className="info-line">
                  <span>Ca làm:</span> <span>Ca Sáng</span>
                </div>
                <div className="info-line">
                  <span>Thời gian:</span> <span>08:00 - 15:00</span>
                </div>
                <div className="info-line mb-16">
                  <span>Ngày:</span> <span>24/05/2024</span>
                </div>
                <hr />
                <div className="info-line mt-16">
                  <span>Tiền lẻ đầu ca:</span> <span>1,000,000 VNĐ</span>
                </div>
                <div className="info-line">
                  <span>Tổng doanh thu:</span> <span>3,200,000 VNĐ</span>
                </div>
                <div className="info-line text-primary">
                  <span>Tiền mặt thực đếm:</span> <span>3,150,000 VNĐ</span>
                </div>
                <div className="info-line text-danger fw-700">
                  <span>Chênh lệch:</span> <span>-50,000 VNĐ</span>
                </div>
              </div>

              <div className="paper-footer mt-24">
                <div className="content-footer">
                  <Button variant="outline" color="primary" className="w-100">
                    In báo cáo
                  </Button>
                  <Button color="primary" className="w-100">
                    Gửi Quản lý
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
