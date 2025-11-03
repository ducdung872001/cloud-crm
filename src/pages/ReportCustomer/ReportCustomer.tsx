import React, { Fragment, useState } from "react";
import CustomerGrowth from "./partials/CustomerGrowth";
import CustomerOverview from "./partials/CustomerOverview";
import TopCampaignsCustomer from "./partials/TopCampaignsCustomer";
import CustomerDistribution from "./partials/CustomerDistribution";
import NumberCustomerCampaign from "./partials/NumberCustomerCampaign";
import ReportInteractCustomer from "./partials/ReportInteractCustomer";
import ReportInteractCustomerTable from "./partials/ReportInteractCustomerTable";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import "./ReportCustomer.scss";

export default function ReportCustomer() {
  document.title = "Báo cáo khách hàng";

  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
  });

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, startTime: fromTime, endTime: toTime });
    }
  };

  // console.log("params : ", params);

  return (
    <div className="page-content page__report--customer">
      <div>
        <Fragment>
          <div className="card-box choose__time--report">
            <div className="__left">
              <h2 className="name-common">Chọn thời gian</h2>
            </div>
            <div className="__right">
              <div className="form-group">
                <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
              </div>
            </div>
          </div>
          <ReportInteractCustomer paramsProps={params} />
          <CustomerGrowth paramsProps={params} />
          <CustomerOverview paramsProps={params} />
          <div className="box__merge--campaign">
            <div className="chart__pie">
              <NumberCustomerCampaign paramsProps={params} />
            </div>
            <div className="chart__top">
              <TopCampaignsCustomer paramsProps={params} />
            </div>
          </div>
          <CustomerDistribution paramsProps={params} />
          <ReportInteractCustomerTable />
        </Fragment>
      </div>
    </div>
  );
}
