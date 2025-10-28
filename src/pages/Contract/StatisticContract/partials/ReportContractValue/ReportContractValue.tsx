import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import { formatCurrency } from "reborn-util";
import ContractService from "services/ContractService";
import FilterContract from "../FilterContract/FilterContract";

exportingInit(Highcharts);

export default function ReportContractValue(props) {
  const { paramsTime } = props;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

  const [showOption, setShowOption] = useState<boolean>(false);
  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);

  const [params, setParams] = useState({
    fromTime: "",
    toTime: "",
  });

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
          format: "{point.sum}",
          style: {
            fontWeight: "bold",
          },
        },
      },
    },

    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">Tổng</span>: <b>{point.sum}đ</b>',
    },

    series: [
      {
        name: "",
        colorByPoint: true,
        data: [],
      },
    ],
  });

  const handGetContractValue = async (params) => {

    const response = await ContractService.reportContractValue(params);

    if (response.code === 0) {
      const result = response.result;

      const total = result.reduce((sum, item) => sum + item.totalDealValue, 0);
      // // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let remainingPercentage = 100;

      // Tính tỉ lệ phần trăm cho mỗi mục trong dữ liệu và làm tròn
      const changeResult = result.map((item) => {
        const percentage = (item.totalDealValue / total) * 100;
        const roundedPercentage = Math.round(percentage);
        remainingPercentage -= roundedPercentage;
        return {
          name: item.customerName,
          sum: formatCurrency(item.totalDealValue),
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
      showToast("Báo cáo theo top 5 khách hàng có doanh thu cao nhất lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetContractValue(params);
  }, [params]);

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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_top_khách_hàng_có_doanh_thu_cao_nhất`, // Tên file
          type: valueOption.split("/")[1], // Lấy phần mở rộng từ MIME type
        },
      });

      // Sử dụng API của Highcharts để tải xuống
      chart.exportChart();
    } else {
      console.log("chạy vào file xuất định dạng excel !");
    }
  };


  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  return (
    <div className="page__report_contract_value">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div className="title__common d-flex align-items-start">
          <h2 className="name-common">Giá trị hợp đồng theo khách hàng</h2>
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
        <div>
          <FilterContract updateParams={takeFromTimeAndToTime} />
        </div>
      </div>

      <div className="chart__common">
        <HighchartsReact highcharts={Highcharts} ref={chartRef} allowChartUpdate={true} options={chartData} />
      </div>
    </div>
  );
}
