import React, { useEffect, useRef, useState } from "react";
import Highcharts, { time } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
const chartColor = {
  total: "#015aa4",
  outDate: "rgb(254,106,53)", //chart-color-orange-dark
  success: "rgb(0,226,114)", //chart-color-green
  today: "rgb(254,181,106)", // chart-color-orange
  true: "rgb(110, 105, 211)", //chart-color-violet
  remaining: "rgb(84,79,197)", //chart-color-violet-darker
  average: "rgb(46,224,202)", //chart-color-coban
  early: "rgb(110, 105, 211)", //chart-color-violet
  stillValid: "rgb(226, 223, 10)",
};
export default function ChartJobOverview(props) {
  const { paramsProps } = props;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

  const [dataOverview, setDataOverview] = useState([]);

  const [chartData, setChartData] = useState({
    chart: {
      type: "column",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: ["Tổng số việc", "Đã hoàn thành", "Chưa hoàn thành"],
    },
    yAxis: {
      min: 0,
      title: {
        text: "Lượng công việc",
      },
      stackLabels: {
        enabled: true,
      },
    },
    legend: {
      align: "center",
      itemWidth: 172,
      // x: 10,
      verticalAlign: "bottom",
      // y: 100,
      // floating: true,
      backgroundColor: "white",
      // borderColor: "#CCC",
      // borderWidth: 1,
      shadow: false,
    },
    tooltip: {
      headerFormat: "<b>{point.x}</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>",
    },
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: true,
          format: "{point.percentage:.0f}%",
        },
      },
    },

    // tooltip: {
    //   headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    //   pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b>',
    // },

    series: [
      {
        name: "Chưa hoàn thành",
        data: [70, null, null],
        color: chartColor.remaining,
      },
      {
        name: "Hoàn thành quá hạn",
        data: [null, 10, null],
        color: chartColor.outDate,
      },
      {
        name: "Cần hoàn thành ngay",
        data: [null, null, 10],
        color: chartColor.today,
      },
      {
        name: "Đã hoàn thành",
        data: [50, null, null],
        color: chartColor.success,
      },

      {
        name: "Hoàn thành đúng hạn",
        data: [null, 40, null],
        color: chartColor.true,
      },

      {
        name: "Chưa tới hạn hoàn thành",
        data: [null, null, 60],
        color: chartColor.stillValid,
      },
    ],
  });

  const [params, setParams] = useState({
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (paramsProps) {
      setParams((prevParams) => ({ ...prevParams, startTime: paramsProps.startTime, endTime: paramsProps.endTime }));
    }
  }, [paramsProps]);

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, startTime: fromTime, endTime: toTime });
    }
  };

  const [showOption, setShowOption] = useState<boolean>(false);

  const lstOption = [
    {
      value: "image/png",
      label: "Tải về ảnh PNG",
    },
    {
      value: "image/jpeg",
      label: "Tải về ảnh JPEG",
    },
    {
      value: "application/pdf",
      label: "Tải tài liệu PDF",
    },
    {
      value: "excel",
      label: "Tải tài liệu excel",
    },
  ];

  const handleDownload = (valueOption) => {
    const chart = chartRef.current.chart;

    if (chart && valueOption !== "excel") {
      // Thay đổi tùy chọn xuất bản (exporting options) dựa trên option được chọn
      chart.update({
        exporting: {
          chartOptions: {
            chart: {
              backgroundColor: "white", // Màu nền khi xuất PDF
            },
          },
          scale: 3, // Tỉ lệ khi xuất PDF
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_tổng_quan_khách_hàng`, // Tên file
          type: valueOption.split("/")[1], // Lấy phần mở rộng từ MIME type
        },
      });

      // Sử dụng API của Highcharts để tải xuống
      chart.exportChart();
    } else {
      console.log("chạy vào file xuất định dạng excel !");
    }
  };

  return (
    <div className="card-box page__customer--overview chart-report__detail">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Tổng quan công việc</h2>
        <div
          ref={refOptionContainer}
          className={`icon__option--download ${showOption ? "active__option" : ""}`}
          onClick={() => setShowOption(!showOption)}
        >
          <Icon name="Bars" />

          {showOption && (
            <div className="lst__option" ref={refOption}>
              {lstOption.map((item, idx) => {
                return (
                  <div
                    key={idx}
                    className="item__option"
                    onClick={(e) => {
                      e && e.preventDefault();
                      handleDownload(item.value);
                      setShowOption(false);
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* <div className="report-filter">
          <div className="form-group">
            <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
          </div>
        </div> */}
      </div>

      <div className="chart__common">
        <HighchartsReact ref={chartRef} highcharts={Highcharts} allowChartUpdate={true} options={chartData} />
      </div>
    </div>
  );
}
