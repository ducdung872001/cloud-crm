import React from "react";
import TitleAction from "components/titleAction/titleAction";
import ShiftReportTab from "./ReportShiftTab";

export default function ShiftReportPage() {
  document.title = "Báo cáo Kết ca";

  return (
    <div className="page-content">
      <TitleAction title="Báo cáo Kết ca" />
      <ShiftReportTab />
    </div>
  );
}
