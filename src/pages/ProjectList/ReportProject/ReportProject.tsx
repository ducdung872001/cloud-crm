import React, { useEffect, useState } from "react";
import "./ReportProject.scss";
import Icon from "components/icon";
import ChartRevenue from "./patials/ChartRevenue";
import ChartCost from "./patials/ChartCost";
import ChartProfit from "./patials/ChartProfit";
import TableReport from "./patials/TableReport/TableReport";
import ProjectService from "services/ProjectService";
import { formatCurrency } from "reborn-util";

interface ICardItem {
  key: string;
  icon: any;
  name: string;
  value: string;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

type IReportCard = ICardItem[];

export default function ReportProject({ dataProjectReport }) {
  document.title = "Báo cáo dự án";
  // const dataPreview: IReportCard = [
  //   {
  //     icon: <Icon name="CalculatorMoney" />,
  //     name: "Doanh thu",
  //     value: "200.000.000 đ",
  //     color: "total",
  //   },
  //   {
  //     icon: <Icon name="ChartMoney" />,
  //     name: "Chi phí",
  //     value: "100.000.000 đ",
  //     color: "today",
  //   },
  //   {
  //     icon: <Icon name="MoneyFill" />,
  //     name: "Lợi nhuận",
  //     value: "100.000.000 đ",
  //     color: "success",
  //     rate: "50%",
  //   },
  // ];
  const [dataPreview, setDataPreview] = useState<IReportCard>([
    {
      key: "revenue",
      icon: <Icon name="CalculatorMoney" />,
      name: "Doanh thu",
      value: "...",
      color: "total",
    },
    {
      key: "cost",
      icon: <Icon name="ChartMoney" />,
      name: "Chi phí",
      value: "...",
      color: "today",
    },
    {
      key: "profit",
      icon: <Icon name="MoneyFill" />,
      name: "Lợi nhuận",
      value: "...",
      color: "success",
      // rate: "50%",
    },
  ]);

  const [params, setParams] = useState({
    projectId: dataProjectReport.id,
    startDay: "",
    endDay: "",
  });

  const fetchData = async () => {
    const response = await ProjectService.report(params);
    if (response.code === 0) {
      console.log("response.result>>>>", response.result);

      setDataPreview([
        {
          key: "revenue",
          icon: <Icon name="CalculatorMoney" />,
          name: "Doanh thu",
          value: formatCurrency(response.result.totalRevenue, ".", " đ") || 0 + " đ",
          color: "total",
        },
        {
          key: "cost",
          icon: <Icon name="ChartMoney" />,
          name: "Chi phí",
          value: formatCurrency(response.result.totalExpense, ".", " đ") || 0 + " đ",
          color: "today",
        },
        {
          key: "profit",
          icon: <Icon name="MoneyFill" />,
          name: "Lợi nhuận",
          value: formatCurrency(response.result.profit, ".", " đ") || 0 + " đ",
          color: "success",
          // rate: "50%",
        },
      ]);

      // setData(response.result);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  return (
    <div className="report-project-detail">
      <div className="report-project-detail_title">Báo cáo dự án {dataProjectReport.name}</div>
      <div className="report-project-detail_overview">
        <div className="report-project-detail_overview--header">Tổng quan</div>
        <div className="report-project-detail_overview--list">
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
                  <div className="__rate">{item?.rate ? "(" + item.rate + ")" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="report-project-detail_chart">
        <ChartRevenue paramsProps={params} />
        <ChartCost paramsProps={params} />
      </div>
      <div className="report-project-detail_chart">
        <ChartProfit classNames="report-project-detail_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report-project-detail_table">
        <TableReport dataProjectReport={dataProjectReport} />
      </div>
    </div>
  );
}
