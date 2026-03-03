import React, { useContext, useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import exportingInit from "highcharts/modules/exporting";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import CustomerService from "services/CustomerService";
import BeautyBranchService from "services/BeautyBranchService";
import { showToast } from "utils/common";
import { ICustomerReportProps } from "model/customer/CustomerRequestModel";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import Icon from "components/icon";
import Loading from "components/loading";
import { ContextType, UserContext } from "contexts/userContext";
import { useOnClickOutside } from "utils/hookCustom";

exportingInit(Highcharts);

interface ReportRevenueProps {
  classNames?: string;
  paramsProps: any;
}
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

export default function ChartActionByCustomerType(props: ReportRevenueProps) {
  const { classNames, paramsProps } = props;
  const { dataBranch } = useContext(UserContext) as ContextType;

  const chartRef = useRef(null);
  const refOption = useRef();
  const refOptionContainer = useRef();

  useOnClickOutside(refOption, () => setShowOption(false), ["box__option"]);

  const [listRevenue, setListRevenue] = useState([]);
  const [valueBranch, setValueBranch] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [params, setParams] = useState<ICustomerReportProps>({
    startTime: "",
    endTime: "",
  });

  //? đoạn này xử lý vấn đề call api lấy ra danh sách chi nhánh
  const loadOptionBranch = async (search, loadedOptions, { page }) => {
    const param: IBeautyBranchFilterRequest = {
      name: search,
      page: page,
      limit: 10,
    };
    const response = await BeautyBranchService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item: IBeautyBranchResponse) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })
            : []),
        ],
        hasMore: response.result.loadMoreAble,
        additional: {
          page: page + 1,
        },
      };
    }

    return { options: [], hasMore: false };
  };

  // thay đổi giá trị branch
  const handleChangeValueBranch = (e) => {
    setValueBranch(e);
  };

  useEffect(() => {
    if (paramsProps) {
      setParams((prevParams) => ({ ...prevParams, startTime: paramsProps.startTime, endTime: paramsProps.endTime }));
    }
  }, [paramsProps]);

  useEffect(() => {
    if (dataBranch) {
      setValueBranch(dataBranch);
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const getInteractCustomer = async (paramsSearch: ICustomerReportProps) => {
    setIsLoading(true);
    const response = await CustomerService.customerReport(paramsSearch);

    if (response.code == 0) {
      const result = response.result;
      console.log("result", result);

      setListRevenue(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (params.startTime && params.endTime) {
      getInteractCustomer(params);
    }
  }, [params, paramsProps]);

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
      categories: ["Nhóm thu nhập cao", "Nhóm thu nhập trung bình", "Nhóm thu nhập thấp", "Khác"],
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Lượng Email",
      },
      stackLabels: {
        enabled: true,
      },
    },
    tooltip: {
      valueSuffix: "",
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
        // stacking: "normal",
        dataLabels: {
          enabled: true,
          formatter: function () {
            if (this.y >= 1000000 || this.y <= -1000000) {
              return (this.y / 1000000).toFixed(1) + "M";
            }
            return this.y;
          },
        },
      },
    },
    series: [
      {
        name: "Số Email được click",
        data: [10, 10, 35, 40],
        color: chartColor.early,
      },
      {
        name: "Số Email được mở",
        data: [20, 30, 40, 50],
        color: chartColor.today,
      },
      {
        name: "Số Email đã gửi thành công",
        data: [40, 200, 50, 250],
        color: chartColor.success,
      },
    ],
    exporting: {
      allowHTML: true,
    },
  });
  // useEffect(() => {
  //   if (listRevenue && listRevenue.length > 0) {
  //     setChartData({
  //       ...chartData,
  //       xAxis: {
  //         ...chartData.xAxis,
  //         categories: listRevenue.map((item) => item.customer?.name),
  //       },
  //       series: [
  //         // {
  //         //   ...chartData.series[0],
  //         //   data: [...listRevenue.map((item) => item.numExchange)],
  //         // },
  //         // {
  //         //   ...chartData.series[1],
  //         //   data: [...listRevenue.map((item) => item.numInvoice)],
  //         // },
  //         // {
  //         //   ...chartData.series[2],
  //         //   data: [...listRevenue.map((item) => item.numEmail)],
  //         // },
  //         {
  //           ...chartData.series[3],
  //           data: [...listRevenue.map((item) => item.numSms)],
  //         },
  //         // {
  //         //   ...chartData.series[4],
  //         //   data: [...listRevenue.map((item) => item.numCall)],
  //         // },
  //       ],
  //     });
  //   }
  // }, [listRevenue]);

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
          filename: `${valueOption.startsWith("image") ? "Ảnh" : "Báo_cáo"}_tương_tác_khách_hàng`, // Tên file
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
    <div className={`card-box report-revenue${classNames ? ` ${classNames}` : ""}`}>
      <div className="title__common d-flex align-items-start">
        <h2 className="name-common">Tỉ lệ tương tác theo nhóm khách hàng</h2>
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
        <div className="report-filter">
          {/* <div className="form-group">
            <SelectCustom
              id="branchId"
              name="branchId"
              fill={true}
              required={true}
              options={[]}
              value={valueBranch}
              onChange={(e) => handleChangeValueBranch(e)}
              isAsyncPaginate={true}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionBranch}
            />
          </div> */}
          {/* <div className="form-group">
            <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
          </div> */}
        </div>
      </div>

      <div className="chart-revenue" id="chart-container">
        {isLoading ? <Loading /> : <HighchartsReact ref={chartRef} highcharts={Highcharts} allowChartUpdate={true} options={chartData} />}
      </div>
    </div>
  );
}
