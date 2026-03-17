import React, { useState } from "react";
import TitleAction from "components/titleAction/titleAction";
import "./ShiftTabsPage.scss";

import NotOpenShiftTab from "./partials/NotOpenShift/NotOpenShiftTab";
import OpenShiftTab from "./partials/OpenShift/OpenShiftTab";
import OrdersInShiftTab from "./partials/OrdersInShift/OrdersInShiftTab";
import OnShiftTab from "./partials/OnShift/OnShiftTab";
import CloseShiftTab from "./partials/CloseShift/CloseShiftTab";
import ShiftReportTab from "./partials/ReportShift/ReportShiftTab";
import OverviewTab from "./partials/ReportOverview/OverviewTab";

type TabKey = "preopen" | "open" | "orders" | "onshift" | "close" | "report" | "overview";

export default function ShiftTabsPage() {
  document.title = "Quản lý ca";

  const [tab, setTab] = useState<TabKey>("preopen");

  return (
    <div className="page-content page-shift-tabs">
      <TitleAction title="Quản lý ca" />

      <div className="card-box d-flex flex-column">
        <div className="action-header">
          <div className="title__actions">
            <ul className="menu-list">
              <li className={tab === "preopen" ? "active" : ""} onClick={() => setTab("preopen")}>
                Chưa vào ca
              </li>
              <li className={tab === "open" ? "active" : ""} onClick={() => setTab("open")}>
                Vào ca
              </li>
              <li className={tab === "onshift" ? "active" : ""} onClick={() => setTab("onshift")}>
                Đang ca
              </li>
              <li className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
                Đơn trong ca
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
          {tab === "preopen" && <NotOpenShiftTab />}
          {tab === "open" && <OpenShiftTab />}
          {tab === "orders" && <OrdersInShiftTab />}
          {tab === "onshift" && <OnShiftTab />}
          {tab === "close" && <CloseShiftTab />}
          {tab === "report" && <ShiftReportTab />}
          {tab === "overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
