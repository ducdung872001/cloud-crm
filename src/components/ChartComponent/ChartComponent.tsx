import React, { ReactElement } from "react";
import "./ChartComponent.scss";
import BasicColumn from "./partials/BasicColumn";
import Column from "./partials/Column";
import DashboardCustomer from "./partials/DashboardCustomer/DashboardCustomer";
import DashboardInvoice from "./partials/DashboardInvoice/DashboardInvoice";
import DashboardReportRevenue from "./partials/DashboardReportRevenue/DashboardReportRevenue";
import LineChart from "./partials/LineChart";
import PieChart from "./partials/PieChart";
import StackedBar from "./partials/StackedBar";

interface ChartListProps {
  chartType?: string;
  className?: string;
  
}
export default function ChartComponent(props: ChartListProps) {
  const {
    chartType,
    className,

  } = props;

  const typeChart = (type) => {
    switch (type) {
        case "pie_chart":
          return <PieChart/>

        case "basic_column":
          return <BasicColumn/>

        case "column":
          return <Column/>
      
        case "line_chart":
          return <LineChart/>
        
        case "stacked_bar":
          return <StackedBar/>
        
        case "dashboard_invoice":
          return <DashboardInvoice/>

        case "dashboard_customer":
          return <DashboardCustomer/>

        case "dashboard_report_revenue":
          return <DashboardReportRevenue preview = {true}/>
        
        default:
            return "";
      }
  }

  return (
    <div
      className={`chart-list${className ? ` ${className}` : ""}`}
    >
        {typeChart(chartType)}
      
    </div>
  );
}
