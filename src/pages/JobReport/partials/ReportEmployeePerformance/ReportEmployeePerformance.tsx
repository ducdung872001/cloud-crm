import React, { Fragment, useState } from "react";
import Icon from "components/icon";
import HeaderReport from "../HeaderReport/HeaderReport";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import ReportInteractCustomer from "pages/JobReport/partials/ReportInteractCustomer";
import CustomerGrowth from "pages/JobReport/partials/CustomerGrowth";
import CustomerOverview from "pages/JobReport/partials/CustomerOverview";
import NumberCustomerCampaign from "pages/JobReport/partials/NumberCustomerCampaign";
import TopCampaignsCustomer from "pages/JobReport/partials/TopCampaignsCustomer";
import ReportInteractCustomerTable from "pages/JobReport/partials/ReportInteractCustomerTable";
import "./ReportEmployeePerformance.scss";
interface ICardItem {
  icon: any;
  name: string;
  value: number;
  color: "blue" | "red" | "green" | "orange";
  unit?: string;
}
type IReportCard = ICardItem[];

export default function ReportEmployeePerformance() {
  const title = " Báo cáo hiệu suất nhân viên";
  const dataPreview: IReportCard = [
    {
      icon: <Icon name="Job" />,
      name: "Lượng việc hoàn thành",
      value: 120,
      color: "blue",
    },
    {
      icon: <Icon name="Expense" />,
      name: "Lượng việc còn lại",
      value: 34,
      color: "red",
    },
    {
      icon: <Icon name="CallPhone" />,
      name: "Số cuộc gọi/email",
      value: 230,
      color: "green",
    },
    {
      icon: <Icon name="ClockTime" />,
      name: "Thời gian làm việc",
      value: 8,
      color: "orange",
      unit: "h",
    },
  ];
  const [isShowChart, setIsShowChart] = useState(false);
  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
  });

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, startTime: fromTime, endTime: toTime });
    }
  };
  return (
    <div className="report-daily">
      <HeaderReport dataPreview={dataPreview} title={title} takeFromTimeAndToTime={takeFromTimeAndToTime} params={params} setParams={setParams} />
      <div className="report-daily--body">
        <div className="box__view--total">
          {dataPreview.map((item, idx) => {
            return (
              <div key={idx} className={`item item__${item.color}`}>
                <div className={"un_active--icon"}>
                  <Icon name="CheckedCircle" />
                </div>
                <div className="__top">
                  {item.icon}
                  <span>{`${item.name} ${item.unit ? " (" + item.unit + ")" : ""}`}</span>
                </div>
                <div className="__bottom">{item.value}</div>
              </div>
            );
          })}
        </div>
        <div className="drop-down">
          <div
            className="drop-down--text"
            onClick={() => {
              setIsShowChart(!isShowChart);
            }}
          >
            {isShowChart ? (
              <div>
                Thu gọn
                <div className="drop-down--icon">
                  <Icon name="CaretSimpleUp" />
                </div>
              </div>
            ) : (
              <div>
                Biểu đồ
                <div className="drop-down--icon">
                  <Icon name="CaretSimpleDown" />
                </div>
              </div>
            )}
          </div>
        </div>
        {isShowChart && (
          <div className="chart-report">
            <Fragment>
              <ReportInteractCustomer classNames="chart-report__detail_two_colums" paramsProps={params} />
              <CustomerGrowth paramsProps={params} />
              <NumberCustomerCampaign paramsProps={params} />
            </Fragment>
          </div>
        )}
        <div className="drop-down">
          <div
            className="drop-down--text"
            onClick={() => {
              setIsShowChart(!isShowChart);
            }}
          >
            {isShowChart ? (
              <div>
                Thu gọn
                <div className="drop-down--icon">
                  <Icon name="CaretSimpleUp" />
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
