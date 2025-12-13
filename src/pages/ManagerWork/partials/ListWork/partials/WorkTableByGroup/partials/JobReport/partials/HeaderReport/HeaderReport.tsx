import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import Icon from "components/icon";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import React, { useState } from "react";

export default function HeaderReport({ dataPreview, title, takeFromTimeAndToTime, params, setParams }) {
  return (
    <div className={"header-report"}>
      <div className="title d-flex align-items-start justify-content-between">
        <h2>{title}</h2>
        <div className="report-filter">
          <div className="form-group">
            <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
          </div>
        </div>
      </div>
    </div>
  );
}
