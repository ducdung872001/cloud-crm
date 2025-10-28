import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { useOnClickOutside } from "utils/hookCustom";
import Icon from "components/icon";
import CustomerService from "services/CustomerService";
import { showToast } from "utils/common";
import ContractService from "services/ContractService";
import FilterAdvance from "./FilterAdvance/FilterAdvance";

exportingInit(Highcharts);

export default function ReportNewContract(props) {

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
        type: 'column'
    },
    title: {
        text: "",
      },
    subtitle: {},
    xAxis: {
        categories: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
        crosshair: true,
        accessibility: {
            // description: 'Countries'
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: '2024'
        }
    },
    tooltip: {
        // valueSuffix: ' (1000 MT)'
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [
        {
            name: 'Hợp đồng',
            // data: [50, 60, 70, 65, 80, 60, 79, 82, 75, 50, 60, 80]
            data: []
        },
    ]
  });

  const handGetNewContract = async (params) => {

    const param = {
      ...params,
      frequency: 'month'
    }
    const response = await ContractService.reportNewContract(param);

    if (response.code === 0) {
      const result = response.result;

      const monthList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

      if(result && result.length > 0){
        const newList = [];

        monthList.map(item => {
          const findMonth = result.filter(el => +el.signDate === +item) || [];
          if(findMonth.length > 0){
            newList.push({
              month: item,
              value: findMonth[0].total
            })
          } else {
            newList.push({
              month: item,
              value: 0
            })
          }
        })
        
        console.log('newList', newList);
        
        setChartData({
          ...chartData,
          series: [
            {
              ...chartData.series,
              data: newList.map(item => { return item.value}),
            } as any,
          ],
        });
      }
    
      
    } else {
      showToast("Báo cáo theo thông tin định danh lỗi. Vui lòng xem lại sau!", "error");
    }
  };

  useEffect(() => {
    handGetNewContract(params);
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

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  return (
    <div className="page__performance_contract">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <div className="title__common d-flex align-items-start">
          <h2 className="name-common">Báo cáo hợp đồng mới</h2>
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
          <FilterAdvance updateParams={takeFromTimeAndToTime} />
        </div>
      </div>

      <div className="chart__common">
        <HighchartsReact highcharts={Highcharts} ref={chartRef} allowChartUpdate={true} options={chartData} />
      </div>
    </div>
  );
}
