import React, { Fragment, useEffect, useState } from "react";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IReportRevenueResponse } from "model/report/ReportResponse";
import { IReportCommonProps } from "model/report/PropsModel";
import Icon from "components/icon";
import Loading from "components/loading";
import ReportService from "services/ReportService";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";
import "./ReportRevenue.scss";

export default function ReportRevenue(props: IReportCommonProps) {
  const { params, callback } = props;

  const [listRevenue, setListRevenue] = useState<IReportRevenueResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRevenue = async (paramsSearch: IReportCommonFilterRequest) => {
    setIsLoading(true);

    const response = await ReportService.revenue(paramsSearch);

    if (response.code == 0) {
      const result = response.result;

      setListRevenue(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.fromTime && params.toTime) {
      getRevenue(params);
    }
  }, [params]);

  const [categoriesRevenue, setCategoriesRevenue] = useState([]);

  useEffect(() => {
    if (listRevenue) {
      const changeDate = listRevenue
        .map((item) => item.time)
        .map((el) => {
          return `<span style="color: #0070B3; text-transform: capitalize; font-size: 14px; line-height: 16px;">${moment(el).format(
            "dddd"
          )}</span><br /><i style="font-size: 12px; line-height: 14px;">${moment(el).format("DD/MM/yyyy")}</i>`;
        });

      setCategoriesRevenue(changeDate);
    }
    callback(listRevenue);
  }, [listRevenue]);

  const [chartRevenue, setChartRevenue] = useState({
    chart: {
      type: "column",
      height: 600,
      style: {
        fontFamily: "Roboto",
      },
      margin: [40, 0, 120],
    },
    title: {
      text: "",
    },

    credits: {
      enabled: false,
    },
    xAxis: {
      useHtml: true,
      categories: [],
      crosshair: true,
      labels: {
        style: {
          fontSize: "1.4rem",
        },
      },
    },
    yAxis: {
      lineWidth: 1,
      tickWidth: 0,
      title: {
        align: "high",
        offset: 0,
        text: "Triệu VNĐ",
        rotation: 0,
        y: -20,
        style: {
          color: "#015aa4",
          fontStyle: "italic",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      labels: {
        // formatter: () => {
        //   return => đoạn này tìm ra số lớn nhất trong 1 mảng trả về rồi fill dữ liệu vào đây để tính toán;
        // },
        style: {
          fontSize: "1.4rem",
        },
      },
      tickInterval: 25,
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding-right:2px">{series.name}: </td>' + '<td style="padding:0"><b>{point.y:.1f} triệu</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Doanh thu",
        data: [],
        color: "#015aa4",
        visible: true,
      },
      {
        name: "Chi phí",
        data: [],
        color: "#dc3545",
        visible: true,
      },
      {
        name: "Lợi nhuận",
        data: [],
        color: "#28a745",
        visible: true,
      },
      {
        name: "Công nợ",
        data: [],
        color: "#e19147",
        visible: true,
      },
    ],
  });

  useEffect(() => {
    if (categoriesRevenue) {
      setChartRevenue({
        ...chartRevenue,
        xAxis: {
          ...chartRevenue.xAxis,
          categories: categoriesRevenue,
        },
      });
    }
  }, [categoriesRevenue]);

  const [totalSum, setTotalSum] = useState({
    revenue: 0,
    income: 0,
    expense: 0,
    debt: 0,
  });

  useEffect(() => {
    if (listRevenue && listRevenue.length > 0) {
      setChartRevenue({
        ...chartRevenue,
        series: [
          {
            ...chartRevenue.series[0],
            data: [...listRevenue.map((item) => item.revenue / 1000000)],
          },
          {
            ...chartRevenue.series[1],
            data: [...listRevenue.map((item) => item.expense / 1000000)],
          },
          {
            ...chartRevenue.series[2],
            data: [...listRevenue.map((item) => item.income / 1000000)],
          },
          {
            ...chartRevenue.series[3],
            data: [...listRevenue.map((item) => item.debt / 1000000)],
          },
        ],
      });

      setTotalSum({
        revenue: listRevenue.map((item) => item.revenue).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        income: listRevenue.map((item) => item.income).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        expense: listRevenue.map((item) => item.expense).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        debt: listRevenue.map((item) => item.debt).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      });
    }
  }, [listRevenue]);

  const dataPreview = [
    {
      icon: <Icon name="MoneyFill" />,
      name: "Doanh thu",
      totalMoney: totalSum.revenue,
      type: "revenue",
    },
    {
      icon: <Icon name="Expense" />,
      name: "Chi phí",
      totalMoney: totalSum.expense,
      type: "expense",
    },
    {
      icon: <Icon name="ReceiveMoney" />,
      name: "Lợi nhuận",
      totalMoney: totalSum.income,
      type: "income",
    },
    {
      icon: <Icon name="Dollar" />,
      name: "Công nợ",
      totalMoney: totalSum.debt,
      type: "debt",
    },
  ];

  const [activeIndexPrev, setActiveIndexPrev] = useState<number>(null);

  // đoạn này check xem click vào item: doanh thu, chi phí, ... để fill xuống biểu đồ
  const handClickPrev = (type, index) => {
    setActiveIndexPrev(index);

    if (index == activeIndexPrev) {
      type = "";
      setActiveIndexPrev(null);
    }

    switch (type) {
      case "revenue": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: true,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "expense": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: true,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "income": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: true,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "debt": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: true,
            },
          ],
        });
        break;
      }

      case "": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: true,
            },
            {
              ...chartRevenue.series[1],
              visible: true,
            },
            {
              ...chartRevenue.series[2],
              visible: true,
            },
            {
              ...chartRevenue.series[3],
              visible: true,
            },
          ],
        });
        break;
      }
    }
  };

  return (
    <div className="page__report--revenue">
      {!isLoading && listRevenue && listRevenue.length > 0 ? (
        <Fragment>
          <div className="box__view--total">
            {dataPreview.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`item item__${item.type}`}
                  onClick={() => {
                    handClickPrev(item.type, idx);
                  }}
                >
                  <div className={`${activeIndexPrev == idx ? "active__icon" : "un_active--icon"}`}>
                    <Icon name="CheckedCircle" />
                  </div>
                  <div className="__top">
                    {item.icon}
                    <span>{`${item.name} (VNĐ)`}</span>
                  </div>
                  <div className="__bottom">{formatCurrency(item.totalMoney || "0", ".", "")}</div>
                </div>
              );
            })}
          </div>
          <div className="chart-revenue">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartRevenue} />
          </div>
        </Fragment>
      ) : isLoading ? (
        <Loading />
      ) : (
        <SystemNotification description={<span>Hiện tại bạn chưa có doanh thu nào!</span>} type="no-item" />
      )}
    </div>
  );
}
