import Icon from "components/icon";
import React, { useEffect, useState } from "react";
import ChartCustomerJob from "./ChartCustomerJob";
import ChartCustomerType from "./ChartCustomerType";
import ChartActionByCustomerType from "./ChartActionByCustomerType";
import ChartActionDaily from "./ChartActionDaily";
import ChartActionCumulative from "./ChartActionCumulative";
import moment from "moment";
import MarketingAutomationService from "services/MarketingAutomationService";

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

export default function ReportEmail({ dataCampaign }) {
  const startDateCampaign = dataCampaign?.startDate ? moment(dataCampaign.startDate).format("DD/MM/YYYY") : " ... ";
  const endDateCampaign = dataCampaign?.endDate ? moment(dataCampaign.endDate).format("DD/MM/YYYY") : " ... ";

  const [params, setParams] = useState({
    maId: dataCampaign?.id,
    type: "customer_email",
    // startTime: "",
    // endTime: "",
    status: "success",
  });
  const [dataPreview, setDataPreview] = useState<IReportCard>([
    {
      key: "totalEmail",
      icon: <Icon name="EmailFill" />,
      name: "Tổng số email đã gửi",
      value: "0",
      color: "total",
    },
    {
      key: "totalEmail",
      icon: <Icon name="SendEmail" />,
      name: "Gửi thành công",
      value: "0",
      color: "success",
      rate: "0%",
    },
    {
      key: "totalEmail",
      icon: <Icon name="ReceiveEmail" />,
      name: "Số email được mở",
      value: "0",
      color: "today",
      rate: "0%",
    },
    {
      key: "totalEmail",
      icon: <Icon name="Handover" />,
      name: "Số email được click",
      value: "0",
      color: "early",
      rate: "0%",
    },
  ]);

  const fetchData = async () => {
    // const response = await MarketingAutomationService.listCustomerByType(params);
    // const response = await MarketingAutomationService.listCustomerByCareer(params);
    // const response = await MarketingAutomationService.listCustomerByDate(params);
    // const response = await MarketingAutomationService.listCustomerByCustGroup(params);
    const response = await MarketingAutomationService.listCustomerByCustCard(params);
    if (response.code === 0) {
      // setDataPreview([
      //   {
      //     key: "revenue",
      //     icon: <Icon name="CalculatorMoney" />,
      //     name: "Doanh thu",
      //     value: response.result.totalRevenue || 0 + " đ",
      //     color: "total",
      //   },
      //   {
      //     key: "cost",
      //     icon: <Icon name="ChartMoney" />,
      //     name: "Chi phí",
      //     value: response.result.totalExpense || 0 + " đ",
      //     color: "today",
      //   },
      //   {
      //     key: "profit",
      //     icon: <Icon name="MoneyFill" />,
      //     name: "Lợi nhuận",
      //     value: response.result.profit || 0 + " đ",
      //     color: "success",
      //     // rate: "50%",
      //   },
      // ]);
      // setData(response.result);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params]);

  return (
    <div className="report-email">
      <div className="report_overview">
        <div className="report_overview--header">
          Tổng quan chiến dịch từ ngày {startDateCampaign} đến {endDateCampaign}
        </div>
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
