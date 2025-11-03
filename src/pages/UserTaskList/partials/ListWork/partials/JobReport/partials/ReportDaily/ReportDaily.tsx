import React, { Fragment, useEffect, useState } from "react";
import Icon from "components/icon";
import HeaderReport from "../HeaderReport/HeaderReport";
import ChartJobEmployee from "../ChartJobEmployee/index";
import ChartRateJobEmployee from "../ChartRateJobEmployee/index";
import ChartJobOverview from "../ChartJobOverview/index";
import ChartJobType from "../ChartJobType/index";
import ChartMoneyForType from "../ChartMoneyForType/index";
import ChartMoneyForEmployee from "../ChartMoneyForEmployee/index";
import "./ReportDaily.scss";
import ChartJobProcess from "../ChartJobProcess";
import ChartJobRate from "../ChartJobRate";
interface ICardItem {
  icon: any;
  name: string;
  value: number;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
}
type IReportCard = ICardItem[];

export default function ReportDaily() {
  const title = "Báo cáo công việc của dự án T.ECO";
  const [fixWidth, setfixWidth] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setfixWidth(true);
    }, 1000);
  }, []);
  const dataPreview: IReportCard = [
    {
      icon: <Icon name="Job" />,
      name: "Tổng số công việc",
      value: 120,
      color: "total",
    },
    {
      icon: <Icon name="Job" />,
      name: "Đã hoàn thành",
      value: 50,
      color: "success",
    },
    {
      icon: <Icon name="Expense" />,
      name: "Còn lại",
      value: 70,
      color: "remaining",
    },
    {
      icon: <Icon name="ClockTime" />,
      name: "Trung bình",
      value: 10,
      color: "average",
      unit: "việc/ngày",
    },
  ];
  const dataStatusJob: IReportCard = [
    {
      icon: <Icon name="ClockTime" />,
      name: "Hoàn thành trước hạn",
      value: 5,
      color: "early",
    },
    {
      icon: <Icon name="CallPhone" />,
      name: "Hoàn thành đúng hạn",
      value: 40,
      color: "success",
    },
    {
      icon: <Icon name="ClockTime" />,
      name: "Hoàn thành quá hạn",
      value: 5,
      color: "out-date",
    },
    {
      icon: <Icon name="ClockTime" />,
      name: "Cần hoàn thành ngay",
      value: 10,
      color: "today",
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
        <div className="title-group">Số lượng công việc</div>
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
        <div className="title-group">Trạng thái công việc</div>
        <div className="box__view--total">
          {dataStatusJob.map((item, idx) => {
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
          ></div>
        </div>
        <div className="chart-report">
          {fixWidth && (
            <Fragment>
              <ChartJobRate classNames="chart-report__detail_two_colums" paramsProps={params} />
              <ChartJobProcess classNames="chart-report__detail_two_colums" paramsProps={params} />
              <ChartJobOverview paramsProps={params} />
              <ChartJobType paramsProps={params} />
              <ChartJobEmployee paramsProps={params} />
              <ChartRateJobEmployee paramsProps={params} />
              <ChartMoneyForType paramsProps={params} />
              <ChartMoneyForEmployee paramsProps={params} />
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
