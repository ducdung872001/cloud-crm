import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

exportingInit(Highcharts);

export default function AccordingCustomerOccupation(props) {
  const { branchId } = props;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

  const [showOption, setShowOption] = useState<boolean>(false);
  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);

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
          format: "{point.name}",
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.sum} người</b> (chiếm: {point.y}%)',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [
          // {
          //   name: "Front-end",
          //   sum: 110,
          //   y: 61.04,
          // },
          // {
          //   name: "Back-end",
          //   sum: 30,
          //   y: 30.05,
          // },
          // {
          //   name: "Khác",
          //   sum: 60,
          //   y: 8.91,
          // },
        ],
      },
    ],
  });

  const handGetCustomerOccupation = async () => {
    const param = {
      branchId,
    };

    const response = await CustomerService.classifyCustCareer(param);

    if (response.code === 0) {
      const result = [...response.result.values];

      const total = result.reduce((sum, item) => sum + item.count, 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let remainingPercentage = 100;

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item) => {
        const percentage = (item.count / total) * 100;
        const roundedPercentage = Math.round(percentage);
        remainingPercentage -= roundedPercentage;
        return {
          name: item.name,
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
      showToast("Báo cáo theo nghề nghiệp khách hàng lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetCustomerOccupation();
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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_theo_nghề_nghiệp_khách_hàng`, // Tên file
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
    <div className="page__according__customer--according">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Theo nghề nghiệp khách hàng</h2>
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
