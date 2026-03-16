import React from "react";
import SummaryCards from "./partials/SummaryCards";
import ShiftStatus from "./partials/ShiftStatus";
import StaffActive from "./partials/StaffActive";
import "./Overview.scss";

export default function OverviewTab() {
  return (
    <div className="page-overview">
      <div className="dashboard-body">
        <SummaryCards />

        <div className="dashboard-main-content mt-24">
          <div className="card-box">
            <div className="action-header">
              <div className="title__actions">
                <ul className="menu-list">
                  <li className="active">Ca làm việc & Nhân sự</li>
                </ul>
              </div>
            </div>

            <div className="dashboard-grid-layout p-24">
              <ShiftStatus />
              <StaffActive />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
