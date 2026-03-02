import React from "react";
import Badge from "components/badge/badge";
import Icon from "components/icon";
import "./ShiftStatus.scss";

export default function ShiftStatus() {
  return (
    <div className="shift-management">
      <h3 className="sub-title mb-16">Trạng thái vận hành ca</h3>
      <div className="shift-list">
        <div className="shift-card-item active-shift mb-16">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="fw-700">Ca 2: Chiều (15:00 - 22:00)</h4>
              <p className="text-muted mt-4">Thu ngân: Nguyễn Dinh, Nguyễn Thông</p>
            </div>
            <span className="text-center">
              <Badge variant="success" text="Đang hoạt động" />
            </span>
          </div>

          <div className="shift-stats">
            <span>
              <Icon name="FileText" /> 82 đơn
            </span>
            <span>
              <Icon name="CreditCard" /> 5.3M VNĐ
            </span>
            <span className="text-primary">
              <Icon name="Clock" /> 04:32:15
            </span>
          </div>
        </div>

        <div className="shift-card-item disabled-shift">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="fw-700">Ca 1: Sáng (08:00 - 15:00)</h4>
              <p className="text-muted mt-4">Thu ngân: Nguyễn Hân, Nguyễn Dinh</p>
            </div>
            <span className="text-center">
              <Badge variant="done" text="Đã kết ca" />
            </span>
          </div>

          <div className="shift-stats">
            <span>
              <Icon name="FileText" /> 45 đơn
            </span>
            <span>
              <Icon name="CreditCard" /> 3.2M VNĐ
            </span>
            <span className="text-danger">
              <Icon name="WarningCircle" /> -50K chênh lệch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
