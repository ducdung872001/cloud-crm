// [CH] Community Hub - Phần chữ ký báo cáo (hiện khi in)
import React from "react";

export default function ReportSignature() {
  const today = new Date();
  const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

  return (
    <div className="report-signature">
      <div className="report-signature__date">{dateStr}</div>
      <div className="report-signature__grid">
        <div className="report-signature__col">
          <div className="report-signature__title">Người lập báo cáo</div>
          <div className="report-signature__hint">(Ký, ghi rõ họ tên)</div>
          <div className="report-signature__space" />
        </div>
        <div className="report-signature__col">
          <div className="report-signature__title">Kế toán trưởng</div>
          <div className="report-signature__hint">(Ký, ghi rõ họ tên)</div>
          <div className="report-signature__space" />
        </div>
        <div className="report-signature__col">
          <div className="report-signature__title">Giám đốc</div>
          <div className="report-signature__hint">(Ký, đóng dấu, ghi rõ họ tên)</div>
          <div className="report-signature__space" />
        </div>
      </div>
    </div>
  );
}
