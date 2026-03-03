import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

exportingInit(Highcharts);

export default function QuantityByAge(props) {
  const { branchId } = props;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

  const [showOption, setShowOption] = useState<boolean>(false);
  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);

  const [chartData, setChartData] = useState({
    chart: {
      type: "bar",
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
    },
    xAxis: {
      type: "category",
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      column: {
        colorByPoint: true,
      },
      series: {
        borderWidth: 0.3,
        dataLabels: {
          enabled: true,
          format: "{point.y:.1f}%",
          style: {
            fontWeight: "bold",
          },
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">Số lượng</span>: <b>{point.sum} người</b>',
    },

    series: [
      {
        name: "",
        data: [
          // { name: "Dưới 18 tuổi", y: 13.01, count: 10 },
          // { name: "18 - 25 tuổi", y: 63.01, count: 30 },
          // { name: "26 - 30 tuổi", y: 49.8, count: 25 },
          // { name: "31 - 35 tuổi", y: 39.8, count: 20 },
          // { name: "36 - 40 tuổi", y: 29.8, count: 15 },
          // { name: "41 - 45 tuổi", y: 19.8, count: 12 },
          // { name: "Trên 50 tuổi", y: 10.8, count: 8 },
        ],
      },
    ],
  });

  const handGetByAge = async () => {
    const parma = {
      branchId,
    };

    const response = await CustomerService.classifyAge(parma);

    if (response.code === 0) {
      const result = [...response.result.values];

      const total = result.reduce((sum, item) => sum + item.count, 0);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let remainingPercentage = 100;

      const changeNameResult = (name: string) => {
        if (name) {
          if (name.startsWith("<18")) {
            return "Dưới 18 tuổi";
          } else if (name.startsWith("18-25")) {
            return "18 - 25 tuổi";
          } else if (name.startsWith("26-30")) {
            return "26 - 30 tuổi";
          } else if (name.startsWith("31-35")) {
            return "31 - 35 tuổi";
          } else if (name.startsWith("36-40")) {
            return "36 - 40 tuổi";
          } else if (name.startsWith("41-45")) {
            return "41 - 45 tuổi";
          } else if (name.startsWith(">50")) {
            return "Trên 50 tuổi";
          }
        }

        return "";
      };

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item) => {
        const percentage = (item.count / total) * 100;
        const roundedPercentage = Math.round(percentage);
        remainingPercentage -= roundedPercentage;
        return {
          name: changeNameResult(item.name),
          sum: item.count,
          y: roundedPercentage,
        };
      });

      setChartData({
        ...chartData,
        series: [
          {
            ...chartData.series,
            data: changeResult,
          } as any,
        ],
      });
    } else {
      showToast("Báo cáo theo độ tuổi khách hàng lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetByAge();
  }, []);

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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_theo_độ_tuổi_khách_hàng`, // Tên file
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
    <div className="page__quantity__by--age">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Theo độ tuổi khách hàng</h2>
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
      </div>
      <div className="chart__common">
        <HighchartsReact highcharts={Highcharts} ref={chartRef} allowChartUpdate={true} options={chartData} />
      </div>
    </div>
  );
}
