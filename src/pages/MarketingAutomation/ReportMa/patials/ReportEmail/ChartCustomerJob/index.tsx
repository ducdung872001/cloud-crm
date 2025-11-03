import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Icon from "components/icon";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";

export default function ChartCustomerJob(props) {
  const { paramsProps } = props;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

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

  const [chartData, setChartData] = useState({
    chart: {
      type: "pie",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      announceNewData: {
        enabled: true,
      },
      point: {
        valueSuffix: "%",
      },
    },

    plotOptions: {
      pie: {
        allowPointSelect: true,
        borderWidth: 2,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          distance: 20,
          format: "<b>{point.name}</b><br>{point.text}<br>{point.percentage:.1f}%",
        },
      },
    },

    // tooltip: {
    //   headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
    //   pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b>',
    // },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [
          {
            name: "Kinh doanh tự do",
            y: 100,
            text: "100 email",
          },
          {
            name: "Nhân viên văn phòng",
            y: 100,
            text: "100 email",
          },
          {
            name: "Giảng viên",
            y: 200,
            text: "200 email",
          },
          {
            name: "Khác",
            y: 100,
            text: "100 email",
          },
        ],
      },
    ],
  });

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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_số_lượng_khách_hàng_theo_chiến_dịch`, // Tên file
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
    <div className="card-box page__customer--campaign chart-report__detail">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Phân bổ gửi email theo nghề nghiệp khách hàng</h2>
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
