import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

exportingInit(Highcharts);

export default function ReportContractPerformance(props) {
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
      pointFormat: '<b>{point.sum}</b> <span style="color:{point.color}">{point.text}</span>',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [
            {
              name: "Số lượng hợp đồng hoàn tất",
              sum: 50,
              y: 70.5,
              color: '#f39c12',
              text: 'hợp đồng'
            },
            {
              name: "Tỷ lệ hợp đồng thành công",
              sum: 65,
              y: 65,
              color: "#2ecc71" ,
              text: '%'
            },
            {
              name: "Thời gian trung bình hoàn tất hợp đồng",
              sum: 7,
              y: 50,
              color: "#3498db" ,
              text: 'ngày'
            },
          ],
      },
    ],
  });

  const handGetBasicInformation = async () => {
    const param = {
      branchId,
    };

    const response = await CustomerService.classifyIdentify(param);

    if (response.code === 0) {
      const result = [...response.result.values];

      const total = result.reduce((sum, item) => sum + item.count, 0);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let remainingPercentage = 100;

      const replaceAllOccurrences = (inputString, targetCharacter, replacementCharacter) => {
        const regex = new RegExp(targetCharacter, "g");
        return inputString.replace(regex, replacementCharacter);
      };

      const capitalizeFirstLetter = (name: string) => {
        const result = name.charAt(0).toUpperCase() + name.slice(1);
        return replaceAllOccurrences(result, "phone", "điện thoại");
      };

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item) => {
        const percentage = (item.count / total) * 100;
        const roundedPercentage = Math.round(percentage);
        remainingPercentage -= roundedPercentage;
        return {
          name: capitalizeFirstLetter(item.name),
          sum: item.count,
          y: roundedPercentage,
          color: item.name.startsWith("email") ? "#f39c12" : item.name.startsWith("phone") ? "#2ecc71" : "#3498db",
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
      showToast("Báo cáo theo thông tin định danh lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    // handGetBasicInformation();
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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_theo_thông_tin_định _danh`, // Tên file
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
    <div className="page__performance_contract">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Báo cáo hiệu suất hợp đồng</h2>
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
