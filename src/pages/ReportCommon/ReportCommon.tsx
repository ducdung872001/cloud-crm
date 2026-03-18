import React, { useEffect, useState } from "react";
import moment from "moment";
import ReportRevenue from "./partials/ReportRevenue/ReportRevenue";
import "./ReportCommon.scss";

type RangeKey = "today" | "7days" | "thisMonth" | "lastMonth";

export default function ReportCommon() {
  document.title = "Báo cáo bán hàng";

  const [activeRange, setActiveRange] = useState<RangeKey>("today");
  const [params, setParams] = useState({
    fromTime: "",
    toTime: "",
  });

  useEffect(() => {
    switch (activeRange) {
      case "today":
        setParams({
          fromTime: moment().format("DD/MM/YYYY"),
          toTime: moment().format("DD/MM/YYYY"),
        });
        break;
      case "7days":
        setParams({
          fromTime: moment().subtract(6, "days").format("DD/MM/YYYY"),
          toTime: moment().format("DD/MM/YYYY"),
        });
        break;
      case "thisMonth":
        setParams({
          fromTime: moment().startOf("month").format("DD/MM/YYYY"),
          toTime: moment().endOf("month").format("DD/MM/YYYY"),
        });
        break;
      case "lastMonth":
        setParams({
          fromTime: moment().subtract(1, "month").startOf("month").format("DD/MM/YYYY"),
          toTime: moment().subtract(1, "month").endOf("month").format("DD/MM/YYYY"),
        });
        break;
    }
  }, [activeRange]);

  return (
    <div className="page-content page__report--common">
      <div className="report-common-shell">
        <div className="action-navigation">
          <div className="action-backup">
            <div className="report-heading">
              <h1 className="title-first title-first--static">Báo cáo bán hàng</h1>
            </div>
          </div>
          <div className="report-common-actions">
            <button className="btn" type="button">
              <span>⬇</span>
              Xuất Excel
            </button>
            <button className="btn btn-primary" type="button">
              <span>🖨</span>
              In báo cáo
            </button>
          </div>
        </div>

        <div className="report-content-shell">
          <div className="filter-bar">
            <span className="filter-label">Kỳ:</span>
            <div className="filter-group">
              <button className={`filter-btn${activeRange === "today" ? " active" : ""}`} onClick={() => setActiveRange("today")} type="button">
                Hôm nay
              </button>
              <button className={`filter-btn${activeRange === "7days" ? " active" : ""}`} onClick={() => setActiveRange("7days")} type="button">
                7 ngày
              </button>
              <button
                className={`filter-btn${activeRange === "thisMonth" ? " active" : ""}`}
                onClick={() => setActiveRange("thisMonth")}
                type="button"
              >
                Tháng này
              </button>
              <button
                className={`filter-btn${activeRange === "lastMonth" ? " active" : ""}`}
                onClick={() => setActiveRange("lastMonth")}
                type="button"
              >
                Tháng trước
              </button>
            </div>
            <div className="filter-separator"></div>
            <span className="filter-label">Chi nhánh:</span>
            <select className="filter-select" defaultValue="all-branch">
              <option value="all-branch">Tất cả chi nhánh</option>
            </select>
            <span className="filter-label">Kênh bán:</span>
            <select className="filter-select" defaultValue="all-channel">
              <option value="all-channel">Tất cả kênh</option>
            </select>
            <div className="filter-spacer"></div>
            <button className="btn btn-primary" type="button">
              Xem báo cáo
            </button>
          </div>

          <div className="report-stage">
            <ReportRevenue params={params} />
          </div>
        </div>
      </div>
    </div>
  );
}
