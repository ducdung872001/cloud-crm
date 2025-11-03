import Icon from "components/icon";
import React, { useContext, useEffect, useState } from "react";
import ChartCustomerJob from "./ChartCustomerJob";
import ChartCustomerType from "./ChartCustomerType";
import ChartActionByCustomerType from "./ChartActionByCustomerType";
import ChartActionDaily from "./ChartActionDaily";
import ChartActionCumulative from "./ChartActionCumulative";
import "./index.scss";
import SelectCustom from "components/selectCustom/selectCustom";
import EmployeeService from "services/EmployeeService";
import { IEmployeeFilterRequest } from "model/employee/EmployeeRequestModel";
import { ContextType, UserContext } from "contexts/userContext";
import ImageThirdGender from "assets/images/third-gender.png";
import { ICustomerFilterRequest } from "model/customer/CustomerRequestModel";
import CustomerService from "services/CustomerService";
import ChartOptNewDaily from "./ChartOptNewDaily";
import ReportOpportunityService from "services/ReportOpportunityService";
import { set } from "lodash";
import CampaignService from "services/CampaignService";
import ReportCustomerService from "services/ReportCustomerService";
import { formatCurrency } from "reborn-util";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import moment from "moment";
import WorkOrderService from "services/WorkOrderService";
import ReportOptDetailModal from "./DetailReportOptModal";
import DetailOptModal from "./DetailOptModal";

interface ICardItem {
  icon: any;
  name: string;
  value: string;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

type IReportCard = ICardItem[];

export default function ReportOpportunity() {
  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;
  const [keyTime, setKeyTime] = useState(null);

  // useEffect(() => {
  //   setDataEmployee({ value: dataInfoEmployee.id, label: name });
  // }, [dataInfoEmployee.id]);

  const [params, setParams] = useState({
    saleId: -1,
    customerId: -1,
    campaignId: -1,
    status: -1,
    startDate: "",
    endDate: "",
  });

  const [paramsSave, setParamsSave] = useState(null);
  let paramsReportOpportunity = JSON.parse(localStorage.getItem("paramsReportOpportunity"));
  useEffect(() => {
    if (
      paramsReportOpportunity?.dataEmployee ||
      paramsReportOpportunity?.dataCampaign ||
      paramsReportOpportunity?.detailCustomer ||
      paramsReportOpportunity?.detailTime
    ) {
      let newParams = {
        saleId: paramsReportOpportunity.dataEmployee?.value || -1,
        customerId: paramsReportOpportunity.detailCustomer?.value || -1,
        campaignId: paramsReportOpportunity.dataCampaign?.value || -1,
        startDate: paramsReportOpportunity.detailTime?.startDate || "",
        endDate: paramsReportOpportunity.detailTime?.endDate || "",
      };

      if (paramsReportOpportunity?.dataEmployee) {
        setDataEmployee(paramsReportOpportunity.dataEmployee);
      }
      if (paramsReportOpportunity?.dataCampaign) {
        setDataCampaign(paramsReportOpportunity.dataCampaign);
      }
      if (paramsReportOpportunity?.detailCustomer) {
        setDetailCustomer(paramsReportOpportunity.detailCustomer);
      }
      if (paramsReportOpportunity?.detailTime) {
        if (paramsReportOpportunity.detailTime?.defaultKey == "custom") {
          setKeyTime(paramsReportOpportunity.detailTime.defaultKey);
          takeFromTimeAndToTime(
            paramsReportOpportunity.detailTime.startDate,
            paramsReportOpportunity.detailTime.endDate,
            paramsReportOpportunity.detailTime.defaultKey
          );
        } else {
          setKeyTime(paramsReportOpportunity.detailTime.defaultKey);
        }
      }
      setParamsSave(newParams);
    }
  }, []);

  useEffect(() => {
    if (paramsSave) {
      setParams({
        ...params,
        ...(paramsSave.saleId ? { saleId: paramsSave.saleId } : {}),
        ...(paramsSave.customerId ? { customerId: paramsSave.customerId } : {}),
        ...(paramsSave.campaignId ? { campaignId: paramsSave.campaignId } : {}),
        ...(paramsSave.startDate ? { startDate: paramsSave.startDate } : {}),
        ...(paramsSave.endDate ? { endDate: paramsSave.endDate } : {}),
      });
    }
  }, [paramsSave]);

  const [dataPreview, setDataPreview] = useState([
    {
      key: "totalOpportunity",
      icon: <Icon name="Opportunity" />,
      name: "Tổng số cơ hội",
      value: "...",
      color: "total",
    },
    {
      key: "expectedRevenue",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu dự kiến",
      value: "...",
      color: "success",
      // rate: "90%",
    },
    {
      key: "totalRevenue",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu ký hợp đồng",
      value: "...",
      color: "today",
      // rate: "50%",
    },
    {
      key: "successOpportunity",
      icon: <Icon name="Opportunity" />,
      name: "Số cơ hội thành công",
      value: "...",
      color: "early",
      // rate: "40%",
    },
    {
      key: "failedOpportunity",
      icon: <Icon name="ReceiveEmail" />,
      name: "Số cơ hội thất bại",
      value: "...",
      color: "today",
      // rate: "50%",
    },
  ]);

  const fetchTotalOpportunity = async () => {
    const param = {
      ...params,
      status: -1,
    };
    const response = await ReportOpportunityService.totalOpportunity(param);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalOpportunity") {
            item.value = response.result;
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const fetchFailedOpportunity = async () => {
    const param = {
      ...params,
      status: 4,
    };
    const response = await ReportOpportunityService.totalOpportunity(param);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "failedOpportunity") {
            item.value = response.result;
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const fetchSuccessOpportunity = async () => {
    const param = {
      ...params,
      status: 2,
    };
    const response = await ReportOpportunityService.totalOpportunity(param);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "successOpportunity") {
            item.value = response.result;
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };
  const [listDate, setListDate] = useState([]);
  const [dataNewOpportunity, setDataNewOpportunity] = useState([]);
  const fetchOpportunityByDate = async () => {
    const param = {
      ...params,
      status: 0,
    };
    const response = await ReportOpportunityService.opportunityByDate(param);
    if (response.code === 0) {
      const listKey = Object.keys(response.result);
      if (listKey.length > 0) {
        const data = listKey.map((item) => {
          return {
            date: moment(item).format("DD/MM/YYYY"),
            value: response.result[item],
          };
        });
        const dataNew = listDate.map((item) => {
          if (data.find((i) => i.date === item)) {
            return data.find((i) => i.date === item).value;
          } else {
            return 0;
          }
        });
        setDataNewOpportunity(dataNew);
      } else {
        const dataNew = listDate.map((item) => {
          return 0;
        });
        setDataNewOpportunity(dataNew);
      }
    }
  };

  useEffect(() => {
    fetchOpportunityByDate();
    fetchOpportunitySuccessByDate();
  }, [listDate, params]);

  const [dataSuccessOpportunity, setDataSuccessOpportunity] = useState([]);
  const fetchOpportunitySuccessByDate = async () => {
    const param = {
      ...params,
      status: 2,
    };
    const response = await ReportOpportunityService.opportunityByDate(param);
    if (response.code === 0) {
      const listKey = Object.keys(response.result);
      if (listKey.length > 0) {
        const data = listKey.map((item) => {
          return {
            date: moment(item).format("DD/MM/YYYY"),
            value: response.result[item],
          };
        });
        const dataNew = listDate.map((item) => {
          if (data.find((i) => i.date === item)) {
            return data.find((i) => i.date === item).value;
          } else {
            return 0;
          }
        });
        setDataSuccessOpportunity(dataNew);
      } else {
        const dataNew = listDate.map((item) => {
          return 0;
        });
        setDataSuccessOpportunity(dataNew);
      }
    }
  };

  const formatToBillion = (num: number): string => {
    if (num >= 1_000_000_000) {
      const billion = num / 1_000_000_000;
      return `${billion.toFixed(2)} tỷ`;
    } else if (num >= 1_000_000) {
      const million = num / 1_000_000;
      return `${million.toFixed(2)} triệu`;
    } else {
      return formatCurrency(num).toString();
    }
  };

  const fetchExpectedRevenue = async () => {
    const response = await ReportOpportunityService.expectedRevenue(params);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "expectedRevenue") {
            item.value = formatToBillion(response.result);
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const [dataTotalByApproach, setDataTotalByApproach] = useState(null);
  const fetchtotalByApproach = async () => {
    const param = {
      ...params,
    };
    delete param.status;

    const response = await ReportOpportunityService.totalByApproach(param);
    if (response.code === 0) {
      setDataTotalByApproach(response.result);
    }
  };

  const fetchRevenue = async () => {
    const param = {
      ...params,
    };
    const response = await ReportCustomerService.totalRevenue(params);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalRevenue") {
            if (params.campaignId != -1) {
              item.value = "...";
              return item;
            } else {
              item.value = formatToBillion(response.result);
              return item;
            }
          } else {
            return item;
          }
        })
      );
    }
  };

  useEffect(() => {
    setDataPreview([
      {
        key: "totalOpportunity",
        icon: <Icon name="Opportunity" />,
        name: "Tổng số cơ hội",
        value: "...",
        color: "total",
      },
      {
        key: "expectedRevenue",
        icon: <Icon name="ReceiveMoney" />,
        name: "Doanh thu dự kiến",
        value: "...",
        color: "success",
        // rate: "90%",
      },
      {
        key: "totalRevenue",
        icon: <Icon name="ReceiveMoney" />,
        name: "Doanh thu ký hợp đồng",
        value: "...",
        color: "today",
        // rate: "50%",
      },
      {
        key: "successOpportunity",
        icon: <Icon name="Opportunity" />,
        name: "Số cơ hội thành công",
        value: "...",
        color: "early",
        // rate: "40%",
      },
      {
        key: "failedOpportunity",
        icon: <Icon name="ReceiveEmail" />,
        name: "Số cơ hội thất bại",
        value: "...",
        color: "today",
        // rate: "50%",
      },
    ]);
    fetchTotalOpportunity();
    fetchExpectedRevenue();
    fetchFailedOpportunity();
    fetchSuccessOpportunity();
    fetchRevenue();
    fetchtotalByApproach();
  }, [params]);

  const [dataEmployee, setDataEmployee] = useState(null);
  const [dataCampaign, setDataCampaign] = useState(null);
  const { dataBranch } = useContext(UserContext) as ContextType;
  // lấy người phụ trách
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const response = await WorkOrderService.employeeAssignees({
      name: search,
    });

    if (response.code === 0) {
      // const dataOption = response.result.filter((item) => item.id !== dataInfoEmployee.id);
      const dataOption = response.result;

      return {
        options: [
          { value: -2, label: "Chưa có nhân viên phụ trách", avatar: "" },
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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
    // const param: IEmployeeFilterRequest = {
    //   name: search,
    //   page: page,
    //   limit: 10,
    //   branchId: dataBranch.value,
    // };

    // const response = await EmployeeService.list(param);

    // if (response.code === 0) {
    //   const dataOption = response.result.items;

    //   return {
    //     options: [
    //       ...(dataOption.length > 0
    //         ? dataOption.map((item) => {
    //             return {
    //               value: item.id,
    //               label: item.name,
    //               avatar: item.avatar,
    //             };
    //           })
    //         : []),
    //     ],
    //     hasMore: response.result.loadMoreAble,
    //     additional: {
    //       page: page + 1,
    //     },
    //   };
    // }

    // return { options: [], hasMore: false };
  };

  const formatOptionLabelEmployee = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueEmployee = (e) => {
    if (e?.value) {
      setDataEmployee(e);
      setParams((prevParams) => ({ ...prevParams, saleId: e.value }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, dataEmployee: e }));
    } else {
      setDataEmployee(null);
      setParams((prevParams) => ({ ...prevParams, saleId: -1 }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, dataEmployee: null }));
    }
  };
  const handleChangeValueCampaign = (e) => {
    if (e?.value) {
      setDataCampaign(e);
      setParams((prevParams) => ({ ...prevParams, campaignId: e.value }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, dataCampaign: e }));
    } else {
      setDataCampaign(null);
      setParams((prevParams) => ({ ...prevParams, campaignId: -1 }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, dataCampaign: null }));
    }
  };
  // lấy chiến dịch
  //! đoạn này xử lý vấn đề lấy ra chiến dịch
  const loadedOptionCampaign = async (search, loadedOptions, { page }) => {
    const param: IEmployeeFilterRequest = {
      name: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CampaignService.list(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: item.name,
                  avatar: item.avatar,
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
  const formatOptionLabelCampaign = ({ label, avatar }) => {
    return <div className="selected--item">{label}</div>;
  };

  // khách hàng
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);

  //! đoạn này xử lý vấn đề lấy ra danh sách khách hàng
  const loadedOptionCustomer = async (search, loadedOptions, { page }) => {
    const param: ICustomerFilterRequest = {
      keyword: search,
      page: page,
      limit: 10,
      branchId: dataBranch.value,
    };

    const response = await CustomerService.filter(param);

    if (response.code === 0) {
      const dataOption = response.result.items;

      return {
        options: [
          ...(dataOption.length > 0
            ? dataOption.map((item) => {
                return {
                  value: item.id,
                  label: `${item.name} - ${item.phoneMasked}`,
                  avatar: item.avatar,
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

  const formatOptionLabelCustomer = ({ label, avatar }) => {
    return (
      <div className="selected--item">
        <div className="avatar">
          <img src={avatar || ImageThirdGender} alt={label} />
        </div>
        {label}
      </div>
    );
  };

  const handleChangeValueCustomer = (e) => {
    if (e?.value) {
      setDetailCustomer(e);
      setParams((prevParams) => ({ ...prevParams, customerId: e.value }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, detailCustomer: e }));
    } else {
      setDetailCustomer(null);
      setParams((prevParams) => ({ ...prevParams, customerId: -1 }));
      localStorage.setItem("paramsReportOpportunity", JSON.stringify({ ...paramsReportOpportunity, detailCustomer: null }));
    }
  };

  const [listDataByDate, setListDataByDate] = useState([]);

  const [timestampArray, setTimestampArray] = useState([]);

  const generateDateArray = (startDate, endDate) => {
    const start = moment(startDate, "DD-MM-YYYY").startOf("day").add(7, "hours").toDate();
    const end = moment(endDate, "DD-MM-YYYY").startOf("day").add(7, "hours").toDate();
    const dateArray = [];
    const timestamp_array = [];
    while (start <= end) {
      dateArray.push(moment(new Date(start)).format("DD/MM/YYYY"));
      timestamp_array.push(moment(new Date(start)).valueOf());
      start.setDate(start.getDate() + 1);
    }
    setTimestampArray(timestamp_array);
    return dateArray;
  };

  const takeFromTimeAndToTime = (fromTime, toTime, defaultKey) => {
    if (fromTime && toTime) {
      setKeyTime(defaultKey);
      setParams({ ...params, startDate: fromTime, endDate: toTime });
      const dateArray = generateDateArray(fromTime, toTime);
      setListDate(dateArray);
      const dateObject = dateArray.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
      }, {});

      setListDataByDate(dateObject);
      localStorage.setItem(
        "paramsReportOpportunity",
        JSON.stringify({
          ...paramsReportOpportunity,
          detailTime: {
            startDate: fromTime,
            endDate: toTime,
            defaultKey: defaultKey,
          },
        })
      );
    }
  };

  const [showModalDetail, setShowModalDetail] = useState(false);
  const [showDetailOpt, setShowDetailOpt] = useState(false);
  const [reportDetail, setReportDetail] = useState(null);
  const [itemDetail, setItemDetail] = useState(null);
  const [reportDetailTitle, setReportDetailTitle] = useState(null);

  return (
    <div className="report-opportunity">
      <div className="report_overview">
        {params.startDate && params.endDate ? (
          <h3 style={{ marginBottom: "1.5rem" }}>
            Báo cáo từ ngày {params.startDate} &rarr; {params.endDate}
          </h3>
        ) : null}
        <div className="report_overview--header">
          <div className="item-left">
            <div className="item">
              <SelectCustom
                id="saleId"
                name="saleId"
                label="Nhân viên phụ trách"
                options={[]}
                fill={true}
                value={dataEmployee}
                // required={true}
                isClearable={true}
                isShowDropdownIcon={dataEmployee?.value ? false : true}
                onChange={(e) => handleChangeValueEmployee(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder="Tất cả nhân viên"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionEmployee}
                formatOptionLabel={formatOptionLabelEmployee}
              />
            </div>
            <div className="item">
              <SelectCustom
                id="campaignId"
                name="campaignId"
                label="Chiến dịch"
                options={[]}
                fill={true}
                value={dataCampaign}
                // required={true}
                onChange={(e) => handleChangeValueCampaign(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                isClearable={true}
                isShowDropdownIcon={dataCampaign?.value ? false : true}
                placeholder="Tất cả chiến dịch"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionCampaign}
                formatOptionLabel={formatOptionLabelCampaign}
              />
            </div>
            <div className="item">
              <SelectCustom
                id="customerId"
                name="customerId"
                label="Khách hàng"
                options={[]}
                fill={true}
                value={detailCustomer}
                // required={true}
                isClearable={true}
                isShowDropdownIcon={detailCustomer?.value ? false : true}
                onChange={(e) => handleChangeValueCustomer(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder="Tất cả khách hàng"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionCustomer}
                formatOptionLabel={formatOptionLabelCustomer}
              />
            </div>
          </div>
          <div className="item-right">
            {/* <label htmlFor="#">Thời gian</label> */}
            <AdvancedDateFilter updateParams={takeFromTimeAndToTime} defaultKey={keyTime} />
          </div>
        </div>
        <div className="report_overview--list">
          <div className="box__view--total">
            {dataPreview.map((item: any, idx) => {
              return (
                <div
                  key={idx}
                  className={`item item__${item.color}`}
                  onClick={() => {
                    setReportDetail(item);
                    setShowModalDetail(true);
                  }}
                >
                  <div className={"un_active--icon"}>
                    <Icon name="CheckedCircle" />
                  </div>
                  <div className="__top">
                    {item.icon}
                    <span>{`${item.name} ${item.unit ? " (" + item.unit + ")" : ""}`}</span>
                  </div>
                  <div className="__bottom">{item.value}</div>
                  <div className="__rate">{item?.rate ? "(" + item.rate + ")" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="report_chart">
        {/* <ChartActionByCustomerType paramsProps={params} /> */}
        <ChartOptNewDaily paramsProps={params} dataNewOpportunity={dataNewOpportunity} listDate={listDate} timestampArray={timestampArray} />
        <ChartActionDaily paramsProps={params} dataSuccessOpportunity={dataSuccessOpportunity} listDate={listDate} timestampArray={timestampArray} />
      </div>
      {/* <div className="report_chart">
        <ChartActionCumulative classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div> */}
      <div className="report_chart">
        <ChartCustomerJob paramsProps={params} dataTotalByApproach={dataTotalByApproach} />
        {/* <ChartCustomerType paramsProps={params} /> */}
      </div>
      <ReportOptDetailModal
        onShow={showModalDetail}
        reportDetail={reportDetail}
        setShowDetailOpt={setShowDetailOpt}
        setItemDetail={setItemDetail}
        paramsFilter={params}
        onHide={() => {
          setShowModalDetail(false);
          setReportDetail(null);
        }}
      />
      <DetailOptModal
        onShow={showDetailOpt}
        itemDetail={itemDetail}
        onHide={() => {
          setShowDetailOpt(false);
          setItemDetail(null);
        }}
      />
    </div>
  );
}
