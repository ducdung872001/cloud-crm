import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { formatCurrency } from "reborn-util";
import { useTranslation } from "react-i18next";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { IBeautyBranchResponse } from "model/beautyBranch/BeautyBranchResponseModel";
import { IReportCommonFilterRequest } from "model/report/ReportRequest";
import { IBeautyBranchFilterRequest } from "model/beautyBranch/BeautyBranchRequestModel";
import { IReportRevenueResponse } from "model/report/ReportResponse";
import Icon from "components/icon";
import SelectCustom from "components/selectCustom/selectCustom";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import ReportService from "services/ReportService";
import BeautyBranchService from "services/BeautyBranchService";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import "./DashboardReportRevenue.scss";
import ReportOpportunity from "pages/OpportunityList/partials/ReportOpportunity";
import ReportCustomer from "pages/CustomerPerson/partials/ReportCustomer";
import ReportPartner from "pages/PartnerList/partials/ReportPartner";
import ReportGuarantee from "pages/Contract/GuaranteeContract/ReportGuarantee";
import ReportWaranty from "pages/Contract/WarrantyContract/ReportWaranty";
import { stringify } from "uuid";

interface ReportRevenueProps {
  classNames?: string;
  preview?: boolean;
}

export default function DashboardReportRevenue(props: ReportRevenueProps) {
  const { classNames, preview } = props;

  const { t } = useTranslation();

  const { dataBranch } = useContext(UserContext) as ContextType;

  // const checkBranch = localStorage.getItem("valueBranch") || null;

  const [listRevenue, setListRevenue] = useState<IReportRevenueResponse[]>([]);

  const [valueBranch, setValueBranch] = useState(null);

  const [params, setParams] = useState<IReportCommonFilterRequest>({
    fromTime: "",
    toTime: "",
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

  // useEffect(() => {
  //   if (dataBranch) {
  //     setValueBranch(dataBranch);
  //     setParams({ ...params, branchId: dataBranch.value });
  //   }
  // }, [dataBranch]);

  const getRevenue = async (paramsSearch: IReportCommonFilterRequest, dataBranch) => {
    const params = {
      ...paramsSearch,
      branchId: dataBranch.value,
    };

    const response = await ReportService.revenue(params);

    if (response.code == 0) {
      const result = response.result;

      setListRevenue(result);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
  };

  useEffect(() => {
    if (params.fromTime && params.toTime && dataBranch) {
      getRevenue(params, dataBranch);
    }
  }, [params, dataBranch]);

  const [categoriesRevenue, setCategoriesRevenue] = useState([]);

  useEffect(() => {
    if (listRevenue) {
      const changeDate = listRevenue
        .map((item) => item.time)
        .map((el) => {
          return `<span style="color: #0070B3; text-transform: capitalize; font-size: 14px; line-height: 16px;">${moment(el).format(
            "dddd"
          )}</span><br /><i style="font-size: 12px; line-height: 14px;">${moment(el).format("DD/MM/yyyy")}</i>`;
        });

      setCategoriesRevenue(changeDate);
    }
  }, [listRevenue]);

  const [chartRevenue, setChartRevenue] = useState({
    chart: {
      type: "column",
      height: 600,
      style: {
        fontFamily: "Roboto",
      },
      margin: [40, 0, 120],
    },
    title: {
      text: "",
    },

    credits: {
      enabled: false,
    },
    xAxis: {
      useHtml: true,
      categories: categoriesRevenue,
      crosshair: true,
      labels: {
        style: {
          fontSize: "1.4rem",
        },
      },
    },
    yAxis: {
      lineWidth: 1,
      tickWidth: 0,
      title: {
        align: "high",
        offset: 0,
        text: "Triệu VNĐ",
        rotation: 0,
        y: -20,
        style: {
          color: "#015aa4",
          fontStyle: "italic",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      labels: {
        // formatter: () => {
        //   return => đoạn này tìm ra số lớn nhất trong 1 mảng trả về rồi fill dữ liệu vào đây để tính toán;
        // },
        style: {
          fontSize: "1.4rem",
        },
      },
      tickInterval: 25,
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding-right:2px">{series.name}: </td>' + '<td style="padding:0"><b>{point.y:.1f} triệu</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: t(`pageDashboard.realRevenue`),
        data: [],
        color: "#015aa4",
        visible: true,
      },
      {
        name: t(`pageDashboard.expense`),
        data: [],
        color: "#dc3545",
        visible: true,
      },
      {
        name: t(`pageDashboard.profit`),
        data: [],
        color: "#28a745",
        visible: true,
      },
      {
        name: t(`pageDashboard.payables`),
        data: [],
        color: "#e19147",
        visible: true,
      },
    ],
  });

  useEffect(() => {
    if (categoriesRevenue) {
      setChartRevenue({
        ...chartRevenue,
        xAxis: {
          ...chartRevenue.xAxis,
          categories: categoriesRevenue,
        },
      });
    }
  }, [categoriesRevenue]);

  const [totalSum, setTotalSum] = useState({
    revenue: 0,
    income: 0,
    expense: 0,
    debt: 0,
  });

  useEffect(() => {
    if (listRevenue && listRevenue.length > 0) {
      setChartRevenue({
        ...chartRevenue,
        series: [
          {
            ...chartRevenue.series[0],
            name: t(`pageDashboard.realRevenue`),
            data: [...listRevenue.map((item) => item.revenue / 1000000)],
          },
          {
            ...chartRevenue.series[1],
            name: t(`pageDashboard.expense`),
            data: [...listRevenue.map((item) => item.expense / 1000000)],
          },
          {
            ...chartRevenue.series[2],
            name: t(`pageDashboard.profit`),
            data: [...listRevenue.map((item) => item.income / 1000000)],
          },
          {
            ...chartRevenue.series[3],
            name: t(`pageDashboard.payables`),
            data: [...listRevenue.map((item) => item.debt / 1000000)],
          },
        ],
      });

      setTotalSum({
        revenue: listRevenue.map((item) => item.revenue).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        income: listRevenue.map((item) => item.income).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        expense: listRevenue.map((item) => item.expense).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        debt: listRevenue.map((item) => item.debt).reduce((accumulator, currentValue) => accumulator + currentValue, 0),
      });
    }
  }, [listRevenue]);

  const dataPreview = [
    {
      icon: <Icon name="MoneyFill" />,
      name: t(`pageDashboard.realRevenue`),
      totalMoney: totalSum.revenue,
      type: "revenue",
    },
    {
      icon: <Icon name="Expense" />,
      name: t(`pageDashboard.expense`),
      totalMoney: totalSum.expense,
      type: "expense",
    },
    {
      icon: <Icon name="ReceiveMoney" />,
      name: t(`pageDashboard.profit`),
      totalMoney: totalSum.income,
      type: "income",
    },
    {
      icon: <Icon name="Dollar" />,
      name: t(`pageDashboard.payables`),
      totalMoney: totalSum.debt,
      type: "debt",
    },
  ];

  const [activeIndexPrev, setActiveIndexPrev] = useState<number>(null);

  // đoạn này check xem click vào item: doanh thu, chi phí, ... để fill xuống biểu đồ
  const handClickPrev = (type, index) => {
    setActiveIndexPrev(index);

    if (index == activeIndexPrev) {
      type = "";
      setActiveIndexPrev(null);
    }

    switch (type) {
      case "revenue": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: true,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "expense": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: true,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "income": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: true,
            },
            {
              ...chartRevenue.series[3],
              visible: false,
            },
          ],
        });
        break;
      }

      case "debt": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: false,
            },
            {
              ...chartRevenue.series[1],
              visible: false,
            },
            {
              ...chartRevenue.series[2],
              visible: false,
            },
            {
              ...chartRevenue.series[3],
              visible: true,
            },
          ],
        });
        break;
      }

      case "": {
        setChartRevenue({
          ...chartRevenue,
          series: [
            {
              ...chartRevenue.series[0],
              visible: true,
            },
            {
              ...chartRevenue.series[1],
              visible: true,
            },
            {
              ...chartRevenue.series[2],
              visible: true,
            },
            {
              ...chartRevenue.series[3],
              visible: true,
            },
          ],
        });
        break;
      }
    }
  };

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
    }
  };

  const lstTitleHeader = [
    // {
    //   name: "Trang chủ",
    //   type: 1,
    // },
    {
      name: "Báo cáo cơ hội",
      type: 2,
    },
    {
      name: "Báo cáo khách hàng",
      type: 3,
    },
    {
      name: "Báo cáo đối tác",
      type: 4,
    },
    {
      name: "Báo cáo bảo lãnh",
      type: 5,
    },
    {
      name: "Báo cáo bảo hành",
      type: 6,
    },
  ];
  const [activeTitleHeader, setActiveTitleHeader] = useState(2);

  useEffect(() => {
    const activeTitleHeaderLocalStorage = localStorage.getItem("activeTitleHeaderDasboard");
    if (activeTitleHeaderLocalStorage) {
      setActiveTitleHeader(Number(activeTitleHeaderLocalStorage));
    } else {
      setActiveTitleHeader(2);
    }
  }, []);

  return (
    <>
      <div className="search__box--partner">
        <ul className="line__height--partner">
          {lstTitleHeader.map((item, idx) => {
            return (
              <li
                key={idx}
                className={`item-title ${activeTitleHeader === item.type ? "active__item--title" : ""}`}
                onClick={() => {
                  setActiveTitleHeader(item.type);
                  localStorage.setItem("activeTitleHeaderDasboard", item.type.toString()); // Lưu item.type vào localStorage
                }}
              >
                {item.name}
              </li>
            );
          })}
        </ul>
      </div>
      {activeTitleHeader === 1 ? (
        <div className={`${preview ? "" : "card-box"} report-revenue${classNames ? ` ${classNames}` : ""}`}>
          <div className="title d-flex align-items-start justify-content-between">
            <h2>{t(`pageDashboard.actualRevenueReport`)}</h2>
            <div className="report-filter">
              {/* <div className="form-group">
            <SelectCustom
              id="branchId"
              name="branchId"
              fill={true}
              required={true}
              options={[]}
              value={valueBranch}
              disabled={true}
              onChange={(e) => handleChangeValueBranch(e)}
              isAsyncPaginate={true}
              placeholder="Chọn chi nhánh"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadOptionBranch}
            />
          </div> */}
              <div className="form-group">
                <AdvancedDateFilter updateParams={takeFromTimeAndToTime} />
              </div>
            </div>
          </div>
          <div className="box__view--total">
            {dataPreview.map((item, idx) => {
              return (
                <div
                  key={idx}
                  className={`item item__${item.type}`}
                  onClick={() => {
                    handClickPrev(item.type, idx);
                  }}
                >
                  <div className={`${activeIndexPrev == idx ? "active__icon" : "un_active--icon"}`}>
                    <Icon name="CheckedCircle" />
                  </div>
                  <div className="__top">
                    {item.icon}
                    <span>{`${item.name} (VNĐ)`}</span>
                  </div>
                  <div className="__bottom">{formatCurrency(item.totalMoney || "0", ".", "")}</div>
                </div>
              );
            })}
          </div>
          <div className="chart-revenue">
            <HighchartsReact highcharts={Highcharts} allowChartUpdate={true} options={chartRevenue} />
          </div>
        </div>
      ) : activeTitleHeader === 2 ? (
        <>
          <ReportOpportunity />
        </>
      ) : activeTitleHeader === 3 ? (
        <>
          <ReportCustomer />
        </>
      ) : activeTitleHeader === 4 ? (
        <>
          <ReportPartner />
        </>
      ) : activeTitleHeader === 5 ? (
        <>
          <ReportGuarantee />
        </>
      ) : activeTitleHeader === 6 ? (
        <>
          <ReportWaranty />
        </>
      ) : null}
    </>
  );
}
