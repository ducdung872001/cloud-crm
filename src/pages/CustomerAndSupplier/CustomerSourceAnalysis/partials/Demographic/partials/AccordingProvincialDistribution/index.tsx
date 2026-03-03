import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { SystemNotification } from "components/systemNotification/systemNotification";

exportingInit(Highcharts);

export default function AccordingProvincialDistribution(props) {
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
          //   name: "Hà Nội",
          //   sum: 150,
          //   y: 51.04,
          // },
          // {
          //   name: "TP.Hồ Chí Minh",
          //   sum: 10,
          //   y: 30.05,
          // },
          // {
          //   name: "Đà Nẵng",
          //   sum: 20,
          //   y: 10.91,
          // },
          // {
          //   name: "Khác",
          //   sum: 30,
          //   y: 8.0,
          // },
        ],
      },
    ],
  });

  const [isNotication, setIsNotication] = useState<boolean>(false);

  const handGetProvincialDistribution = async () => {
    const param = {
      branchId,
    };

    const response = await CustomerService.classifyCustArea(param);

    if (response.code === 0) {
      const result = [...response.result.values];

      if (result.length === 0) {
        setIsNotication(true);
      } else {
        // tiếp tục xử lý nếu như mà có giá trị
      }
    } else {
      showToast("Báo cáo theo phân bố tỉnh thành lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetProvincialDistribution();
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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_theo_phân_bổ_tỉnh_thành`, // Tên file
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
    <div className="page__according__provincial--distribution">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Theo phân bố tỉnh thành</h2>
        <div
          ref={refOptionContainer}
          className={`icon__option--download ${showOption ? "active__option" : ""} ${isNotication ? "d-none" : ""}`}
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

      {isNotication ? (
        <SystemNotification description={<span>Hiện tại chưa có dữ liệu về phân bố theo tỉnh thành.</span>} type="no-item" />
      ) : (
        <div className="chart__common">
          <HighchartsReact highcharts={Highcharts} ref={chartRef} allowChartUpdate={true} options={chartData} />
        </div>
      )}
    </div>
  );
}
