import Icon from "components/icon";
import React, { useState } from "react";
import ChartCustomerJob from "./ChartCustomerJob";
import ChartCustomerType from "./ChartCustomerType";
import ChartActionByCustomerType from "./ChartActionByCustomerType";
import ChartActionDaily from "./ChartActionDaily";
import ChartActionCumulative from "./ChartActionCumulative";

interface ICardItem {
  icon: any;
  name: string;
  value: string;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

type IReportCard = ICardItem[];

export default function ReportZalo() {
  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
  });
  const dataPreview: IReportCard = [
    {
      icon: <Icon name="EmailFill" />,
      name: "Tổng số tin nhắn đã gửi",
      value: "1100",
      color: "total",
    },
    {
      icon: <Icon name="SendEmail" />,
      name: "Gửi thành công",
      value: "1000",
      color: "success",
      rate: "90%",
    },
    // {
    //   icon: <Icon name="ReceiveEmail" />,
    //   name: "Số tin được mở",
    //   value: "500",
    //   color: "today",
    //   rate: "50%",
    // },
    {
      icon: <Icon name="Handover" />,
      name: "Số tin nhắn được mở",
      value: "400",
      color: "early",
      rate: "40%",
    },
  ];
  return (
    <div className="report-email">
      <div className="report_overview">
        <div className="report_overview--header">Tổng quan chiến dịch từ ngày 01/08/2024 đến 05/08/2024</div>
        <div className="report_overview--list">
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
      <div className="report_chart">
        <ChartCustomerJob paramsProps={params} />
        <ChartCustomerType paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionByCustomerType classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionDaily classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionCumulative classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
    </div>
  );
}
