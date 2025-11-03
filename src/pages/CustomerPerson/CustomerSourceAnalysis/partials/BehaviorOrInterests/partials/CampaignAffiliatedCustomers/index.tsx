import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";

exportingInit(Highcharts);

export default function CampaignAffiliatedCustomers(props) {
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
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.sum} khách hàng</b> (chiếm: {point.y}%)',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [
          // {
          //   name: "Trong 1 chiến dịch",
          //   y: 61.04,
          //   sum: 120,
          // },
          // {
          //   name: "Trong 2 chiến dịch",
          //   y: 9.47,
          //   sum: 60,
          // },
          // {
          //   name: "Trong 3 chiến dịch",
          //   y: 9.32,
          //   sum: 50,
          // },
          // {
          //   name: "Nhiều hơn 3 chiến dịch",
          //   y: 8.15,
          //   sum: 35,
          // },
          // {
          //   name: "Chưa từng có chiến dịch nào",
          //   y: 8.15,
          //   sum: 35,
          // },
        ],
      },
    ],
  });

  const handGetCampaignAffiliatedCustomers = async () => {
    const param = {
      branchId,
    };

    const response = await CustomerService.classifyCampaignJoined(param);

    if (response.code === 0) {
      const result = [...response.result.values];

      const total = result.reduce((sum, item) => sum + item.count, 0);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let remainingPercentage = 100;

      const replaceAllOccurrences = (inputString, targetCharacter, replacementCharacter) => {
        const regex = new RegExp(targetCharacter, "g");
        return inputString.replace(regex, replacementCharacter);
      };

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item) => {
        const percentage = (item.count / total) * 100;
        const roundedPercentage = Math.round(percentage);
        remainingPercentage -= roundedPercentage;
        return {
          name: replaceAllOccurrences(item.name, ">", "Nhiều hơn "),
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
      showToast("Báo cáo theo khách hàng thuộc về chiến dịch lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetCampaignAffiliatedCustomers();
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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_khách_hàng_thuộc_về_chiến_dịch`, // Tên file
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
    <div className="page__campaign__affiliated--customer">
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Khách hàng thuộc về chiến dịch</h2>
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
