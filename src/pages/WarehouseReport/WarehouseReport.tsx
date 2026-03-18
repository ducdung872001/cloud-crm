import React, { Fragment, useMemo, useState } from "react";
import Icon from "components/icon";
import "./WarehouseReport.scss";
import { LANDING_REPORTS, type WarehouseReportViewKey } from "./mockData";
import WarehouseReportLanding from "./components/WarehouseReportLanding";
import WarehouseReportXntView from "./components/WarehouseReportXntView";
import WarehouseReportCostView from "./components/WarehouseReportCostView";
import WarehouseReportSlowView from "./components/WarehouseReportSlowView";
import WarehouseReportHistoryView from "./components/WarehouseReportHistoryView";

export default function WarehouseReport() {
  document.title = "Báo cáo kho";

  const [currentView, setCurrentView] = useState<WarehouseReportViewKey>("landing");
  const currentTitle = useMemo(() => {
    if (currentView === "landing") {
      return "";
    }

    return LANDING_REPORTS.find((item) => item.key === currentView)?.title ?? "";
  }, [currentView]);

  return (
    <Fragment>
      <div className="page-content page-warehouse-report">
        <div className="action-navigation">
          <div className="action-backup">
            <h1
              className={`title-first${currentView === "landing" ? " title-first--static" : ""}`}
              onClick={() => setCurrentView("landing")}
              title={currentView === "landing" ? "Báo cáo kho" : "Quay lại báo cáo kho"}
            >
              Báo cáo kho
            </h1>
            {currentView !== "landing" ? (
              <Fragment>
                <Icon name="ChevronRight" onClick={() => setCurrentView("landing")} />
                <h1 className="title-last">{currentTitle}</h1>
              </Fragment>
            ) : null}
          </div>
        </div>

        {currentView === "landing" ? <WarehouseReportLanding onSelect={setCurrentView} /> : null}
        {currentView === "xnt" ? <WarehouseReportXntView /> : null}
        {currentView === "cost" ? <WarehouseReportCostView /> : null}
        {currentView === "slow" ? <WarehouseReportSlowView /> : null}
        {currentView === "history" ? <WarehouseReportHistoryView /> : null}
      </div>
    </Fragment>
  );
}
