import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./ShiftTabsPage.scss";
import OpenShiftTab from "./partials/OpenShift/OpenShiftTab";
import CloseShiftTab from "./partials/CloseShift/CloseShiftTab";
import ShiftReportTab from "./partials/ReportShift/ReportShiftTab";
import OverviewTab from "./partials/ReportOverview/OverviewTab";

type TabKey = "open" | "close" | "report" | "overview";

export default function ShiftTabsPage() {
  document.title = "Quản lý ca";

  const [tab, setTab] = useState<TabKey>("open");

  return (
    <div className="page-content page-shift-tabs">
      <TitleAction title="Quản lý ca" />

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={tab === "open" ? "active" : ""} onClick={() => setTab("open")}>
                Vào ca
              </li>
              <li className={tab === "close" ? "active" : ""} onClick={() => setTab("close")}>
                Đóng ca
              </li>
              <li className={tab === "report" ? "active" : ""} onClick={() => setTab("report")}>
                Báo cáo kết ca
              </li>
              <li className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>
                Báo cáo tổng quan
              </li>
            </ul>
          </div>
        </div>

        <div className="tab-body">
          {tab === "open" && <OpenShiftTab />}
          {tab === "close" && <CloseShiftTab />}
          {tab === "report" && <ShiftReportTab />}
          {tab === "overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
