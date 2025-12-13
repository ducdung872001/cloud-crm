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
import WorkOrderService from "services/WorkOrderService";
import ProjectService from "services/ProjectService";
interface ICardItem {
  key: string;
  icon: any;
  name: string;
  value: number;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
}
type IReportCard = ICardItem[];

export default function ReportDaily({ idProject }) {
  const title = "Báo cáo công việc " + idProject;
  const [fixWidth, setfixWidth] = useState(false);
  useEffect(() => {
    fetchData();
    setTimeout(() => {
      setfixWidth(true);
    }, 1000);
  }, []);
  //     totalWork; //Tổng số công việc
  //     completedWork; //Đã hoàn thành
  //     remainingWork; //Còn lại
  //     averageWorkPerDay; //Trung bình
  const [dataPreview, setDataPreview] = useState<IReportCard>([
    {
      key: "totalWork",
      icon: <Icon name="Job" />,
      name: "Tổng số công việc",
      value: 0,
      color: "total",
    },
    {
      key: "completedWork",
      icon: <Icon name="Job" />,
      name: "Đã hoàn thành",
      value: 0,
      color: "success",
    },
    {
      key: "remainingWork",
      icon: <Icon name="Expense" />,
      name: "Còn lại",
      value: 0,
      color: "remaining",
    },
    {
      key: "averageWorkPerDay",
      icon: <Icon name="ClockTime" />,
      name: "Trung bình",
      value: 0,
      color: "average",
      unit: "việc/ngày",
    },
  ]);
  //     completedBeforeDeadline; //Hoàn thành trước hạn
  //     completedOnTime; //Hoàn thành đúng hạn
  //     completedAfterDeadline; //Hoàn thành quá hạn
  //     urgentWork; //Cần hoàn thành ngay
  const [dataStatusJob, setDataStatusJob] = useState<IReportCard>([
    {
      key: "completedBeforeDeadline",
      icon: <Icon name="ClockTime" />,
      name: "Hoàn thành trước hạn",
      value: 0,
      color: "early",
    },
    {
      key: "completedOnTime",
      icon: <Icon name="CallPhone" />,
      name: "Hoàn thành đúng hạn",
      value: 0,
      color: "success",
    },
    {
      key: "completedAfterDeadline",
      icon: <Icon name="ClockTime" />,
      name: "Hoàn thành quá hạn",
      value: 0,
      color: "out-date",
    },
    {
      key: "urgentWork",
      icon: <Icon name="ClockTime" />,
      name: "Cần hoàn thành ngay",
      value: 0,
      color: "today",
    },
  ]);
  const [isShowChart, setIsShowChart] = useState(false);
  // const [params, setParams] = useState({
  //   startTime: "",
  //   endTime: "",
  // });

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      // setParams({ ...params, startDate: fromTime, endDate: toTime });
    }
  };

  const [params, setParams] = useState({
    startDate: "01/01/2020",
    endDate: "31/12/2025",
    projectId: idProject,
  });

  //     totalWork; //Tổng số công việc
  //     completedWork; //Đã hoàn thành
  //     remainingWork; //Còn lại
  //     averageWorkPerDay; //Trung bình

  //     completedBeforeDeadline; //Hoàn thành trước hạn
  //     completedOnTime; //Hoàn thành đúng hạn
  //     completedAfterDeadline; //Hoàn thành quá hạn
  //     urgentWork; //Cần hoàn thành ngay

  //     completedWork;          // công việc hoàn thành
  //     remainingWork;          // ông việc chua hoàn thành
  //     workloadCompletion;      // workload hoàn thành
  //     workloadRemaining;      // workload chua hoàn thành
  //     timeCompletion;          // thời gian hoàn thành
  //     timeRemaining;          // thời gian chua hoàn thành

  //     compeletionOntimePercentage;  //tỷ lệ hoan thành công việc đúng han / tổng số công viec da hoan thanh
  //     compeletionAfterDeadlinePercentage; //tỷ lệ hoàn thành công viec quá hạn / tổng số cv đã hoàn thành

  //     workUnfinishedPercentage; //tỷ lệ cv chưa tới hạn hoàn thành/công việc chưa hoàn thành
  //     urgentWorkPercentage;  //tỷ lệ cv cần hoàn thành ngay / cv chưa hoàn thành

  //    List<WorkTypePercentage> workTypePercentages; //theo loai cong viec
  //    List<EmployeeWorkReportResponse> employeeWorkReports; //theo nhan vien

  const [dataProjectProcess, setDataProjectProcess] = useState({});
  const fetchData = async () => {
    const response = await WorkOrderService.workReport(params);
    if (response.code === 0) {
      console.log("response.result>>>>", response.result);
      setDataPreview([
        {
          key: "totalWork",
          icon: <Icon name="Job" />,
          name: "Tổng số công việc",
          value: response.result.totalWork || 0,
          color: "total",
        },
        {
          key: "completedWork",
          icon: <Icon name="Job" />,
          name: "Đã hoàn thành",
          value: response.result.completedWork || 0,
          color: "success",
        },
        {
          key: "remainingWork",
          icon: <Icon name="Expense" />,
          name: "Còn lại",
          value: response.result.remainingWork || 0,
          color: "remaining",
        },
        {
          key: "averageWorkPerDay",
          icon: <Icon name="ClockTime" />,
          name: "Trung bình",
          value: response.result.averageWorkPerDay || 0,
          color: "average",
          unit: "việc/ngày",
        },
      ]);
      setDataStatusJob([
        {
          key: "completedBeforeDeadline",
          icon: <Icon name="ClockTime" />,
          name: "Hoàn thành trước hạn",
          value: response.result.completedBeforeDeadline || 0,
          color: "early",
        },
        {
          key: "completedOnTime",
          icon: <Icon name="CallPhone" />,
          name: "Hoàn thành đúng hạn",
          value: response.result.completedOnTime || 0,
          color: "success",
        },
        {
          key: "completedAfterDeadline",
          icon: <Icon name="ClockTime" />,
          name: "Hoàn thành quá hạn",
          value: response.result.completedAfterDeadline || 0,
          color: "out-date",
        },
        {
          key: "urgentWork",
          icon: <Icon name="ClockTime" />,
          name: "Cần hoàn thành ngay",
          value: response.result.urgentWork || 0,
          color: "today",
        },
      ]);
      //     completedWork;          // công việc hoàn thành
      //     remainingWork;          // ông việc chua hoàn thành
      //     workloadCompletion;      // workload hoàn thành
      //     workloadRemaining;      // workload chua hoàn thành
      //     timeCompletion;          // thời gian hoàn thành
      //     timeRemaining;          // thời gian chua hoàn thành
      setDataProjectProcess({
        completedWork: response.result.completedWork || 0,
        remainingWork: response.result.remainingWork || 0,
        workloadCompletion: response.result.workloadCompletion || 0,
        workloadRemaining: response.result.workloadRemaining || 0,
        timeCompletion: response.result.timeCompletion || 0,
        timeRemaining: response.result.timeRemaining || 0,
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [params, idProject]);

  return (
    <div className="report-daily">
      {/* <HeaderReport dataPreview={dataPreview} title={title} takeFromTimeAndToTime={takeFromTimeAndToTime} params={params} setParams={setParams} /> */}
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
              <ChartJobRate classNames="chart-report__detail_two_colums" paramsProps={params} dataProjectProcess={dataProjectProcess} />
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
