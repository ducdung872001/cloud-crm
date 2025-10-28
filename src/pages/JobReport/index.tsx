import React from "react";
import ReportDaily from "./partials/ReportDaily/ReportDaily";
import ReportEmployeePerformance from "./partials/ReportEmployeePerformance/ReportEmployeePerformance";
import "./index.scss";

export default function JobReport() {
  document.title = "Báo cáo công việc";
  return (
    <div className="job-report">
      <ReportDaily />
      <ReportEmployeePerformance />
    </div>
  );
}
