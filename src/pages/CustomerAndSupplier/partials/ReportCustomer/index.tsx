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
import ReportCustomerService from "services/ReportCustomerService";
import { set } from "lodash";
import { formatCurrency } from "reborn-util";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import Loading from "components/loading";
import WorkOrderService from "services/WorkOrderService";
import DetailReportCusModal from "./DetailReportCusModal";

interface ICardItem {
  icon: any;
  name: string;
  value: any;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

export default function ReportCustomer() {
  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState({
    employeeId: -1,
    customerId: -1,
    status: -1,
    startDate: "",
    endDate: "",
  });
  const [paramsContract, setParamsContract] = useState({
    employeeId: -1,
    customerId: -1,
    status: -1,
    startDate: "",
    endDate: "",
    fromTime: "",
    toTime: "",
  });
  const [paramsExternalOrnot, setParamsExternalOrnot] = useState({
    employeeId: -1,
    customerId: -1,
    startDate: "",
    endDate: "",
  });

  const [dataPreview, setDataPreview] = useState<any>([
    // API: Khác
    {
      key: "totalCustomer",
      icon: <Icon name="Customer" />,
      name: "Số KH phát sinh hợp đồng",
      value: "...",
      color: "total",
      loading: true,
    },
    // "Hợp đồng đã ký" = Tổng tất cả (pipeline = "Thực hiện hợp đồng")
    {
      key: "totalContractSigned",
      icon: <Icon name="Pencil" />,
      name: "Hợp đồng đã ký",
      value: "...",
      color: "average",
      loading: true,
      // rate: "50%",
    },
    // "Hợp đồng đàm phán" = Tổng tất cả (pipeline = "Đàm phán và ký kết hợp đồng")
    {
      key: "totalContractDeal",
      icon: <Icon name="ManageOrder" />,
      name: "Hợp đồng đàm phán",
      value: "...",
      color: "early",
      loading: true,
      // rate: "40%",
    },
    // "Hợp đồng đã thanh lý" = Tổng tất cả (pipeline = "Thanh lý hợp đồng")
    {
      key: "totalContractTerminate",
      icon: <Icon name="ManageOrder" />,
      name: "Hợp đồng đã thanh lý",
      value: "0",
      color: "remaining",
      loading: true,
      // rate: "40%",
    },
    // "Doanh thu theo hợp đồng" = Tổng tất cả các totalDealValue (pipeline = "Thực hiện hợp đồng")
    {
      key: "totalRevenue",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu theo hợp đồng",
      value: "...",
      color: "success",
      loading: true,
      // rate: "50%",
    },
    // "Doanh thu nghiệm thu" = Tổng tất cả các totalDealValue (pipeline = "Thực hiện hợp đồng" và status = 1)
    {
      key: "revenueReceived",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu nghiệm thu",
      value: "...",
      color: "today",
      loading: true,
      // rate: "90%",
    },
    // "Doanh thu còn phải thu" = Tổng tất cả các totalDealValue (pipeline = "Thực hiện hợp đồng" và status != 1)
    {
      key: "revenueNotYetReceived",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu còn phải thu trong kỳ",
      value: "...",
      color: "out-date",
      loading: true,
      // rate: "90%",
    },
    // API: /contract/dashboard/notInTime/pipeline
    {
      key: "revenueTransfer",
      icon: <Icon name="ReceiveMoney" />,
      name: "Doanh thu chuyển tiếp",
      value: "--",
      color: "early",
      loading: false,
      // rate: "90%",
    },
  ]);

  const fetchDataPipelineCustomer = async () => {
    setDataPreview(
      dataPreview.map((item) => {
        if (item.key === "revenueTransfer" && item.key == "totalCustomer") {
          return item;
        } else {
          return { ...item, value: "--", loading: true };
        }
      })
    );
    let param = {
      ...params,
      // startDate: "",
      fromTime: params.startDate,
      toTime: params.endDate,
      // endDate: "",
      branchId: dataBranch.value,
    };
    const response = await ReportCustomerService.pipeline(param);
    if (response.code === 0) {
      // // totalContractSigned = Tổng luỹ kế của tất cả các total của các item có pipeline = "Thực hiện hợp đồng" trong mảng response.result
      // let totalContractSigned = 0;
      // // totalContractDeal = Tổng luỹ kế của tất cả các total của các item có pipeline = "Đàm phán và ký kết hợp đồng" trong mảng response.result
      // let totalContractDeal = 0;
      // // totalContractTerminate = Tổng luỹ kế của tất cả các total của các item có pipeline = "Thanh lý hợp đồng" trong mảng response.result
      // let totalContractTerminate = 0;
      // // revenueReceived = Tổng luỹ kế của tất cả các totalDealValue của các item có pipeline = "Thực hiện hợp đồng" và status = 1 trong mảng response.result
      // let revenueReceived = 0;
      // // revenueNotYetReceived = Tổng luỹ kế của tất cả các totalDealValue của các item có pipeline = "Thực hiện hợp đồng" và status != 1 trong mảng response.result
      // let revenueNotYetReceived = 0;
      // // totalRevenue = Tổng luỹ kế của tất cả các totalDealValue của các item có pipeline = "Thực hiện hợp đồng" trong mảng response.result
      // let totalRevenue = 0;

      // totalContractSigned = Tổng luỹ kế của tất cả các total của các item có pipeline = "Thực hiện hợp đồng" trong mảng response.result
      let totalContractSigned = 0;
      // totalContractDeal = Tổng luỹ kế của tất cả các / của các item có pipeline = "Đàm phán và ký kết hợp đồng" trong mảng response.result
      let totalContractDeal = 0;
      // totalContractTerminate = Tổng luỹ kế của tất cả các total của các item có pipeline = "Thanh lý hợp đồng" trong mảng response.result
      let totalContractTerminate = 0;

      //Doanh thu nghiệm thu = revenueReceived = Tổng luỹ kế của tất cả các totalDealValue của các item có pipeline = "Thực hiện hợp đồng" trong mảng response.result
      let revenueReceived = 0;
      //Doanh thu còn phải thu = revenueNotYetReceived = Tổng luỹ kế của tất cả các havePaidDealValue của các item có pipeline = "Thực hiện hợp đồng" và status == 1 || status == 2 trong mảng response.result
      let revenueNotYetReceived = 0;
      //Doanh thu theo hợp đồng = totalRevenue = Tổng luỹ kế của tất cả các notHavePaidDealValue của các item có pipeline = "Thực hiện hợp đồng" và notHavePaidDealValue > 0 trong mảng response.result
      let totalRevenue = 0;

      response.result.forEach((item) => {
        if (item.pipeline === "Thực hiện hợp đồng") {
          totalContractSigned = item.total;
          totalRevenue = item.totalDealValue;
          // revenueReceived += item.totalDealValue;
          if (item.status == 1 || item.status == 2) {
            revenueReceived += item.havePaidDealValue;
          }
          if (item.notHavePaidDealValue > 0) {
            revenueNotYetReceived += item.notHavePaidDealValue;
          }
        }
        if (item.pipeline === "Đàm phán và ký kết hợp đồng") {
          totalContractDeal = item.total;
        }
        if (item.pipeline === "Thanh lý hợp đồng") {
          totalContractTerminate = item.total;
        }
      });
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalContractSigned") {
            item.value = totalContractSigned;
            item.loading = false;
            return item;
          } else if (item.key === "totalContractDeal") {
            item.value = totalContractDeal;
            item.loading = false;
            return item;
          } else if (item.key === "totalContractTerminate") {
            item.value = totalContractTerminate;
            item.loading = false;
            return item;
          } else if (item.key === "revenueReceived") {
            item.value = formatToBillion(revenueReceived);
            item.loading = false;
            return item;
          } else if (item.key === "revenueNotYetReceived") {
            item.value = formatToBillion(revenueNotYetReceived);
            item.loading = false;
            return item;
          } else if (item.key === "totalRevenue") {
            item.value = formatToBillion(totalRevenue);
            item.loading = false;
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const fetchDataTotalCustomer = async () => {
    setDataPreview(
      dataPreview.map((item) => {
        if (item.key === "totalCustomer") {
          item.loading = true;
          item.value = "--";
          return item;
        } else {
          return item;
        }
      })
    );
    let param = {
      ...params,
      startDate: params.startDate,
      endDate: params.endDate,
      fromTime: params.startDate,
      toTime: params.endDate,
      branchId: dataBranch.value,
    };
    const response = await ReportCustomerService.totalCurentCustomer(param);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalCustomer") {
            item.value = response.result;
            item.loading = false;
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const fetchDataContract = async () => {
    setDataPreview(
      dataPreview.map((item) => {
        if (item.key === "totalContract") {
          item.loading = true;
          item.value = "--";
          return item;
        } else {
          return item;
        }
      })
    );
    const param = {
      ...paramsContract,
      status: -1,
    };
    const response = await ReportCustomerService.totalContract(param);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalContract") {
            item.value = response.result;
            item.loading = false;
            return item;
          } else {
            return item;
          }
        })
      );
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

  const fetchRevenue = async () => {
    const response = await ReportCustomerService.totalRevenue(paramsContract);
    if (response.code === 0) {
      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "totalRevenue") {
            item.value = formatToBillion(response.result);
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };
  const fetchNotInTimePipeline = async () => {
    let param = {
      ...params,
      startDate: params.startDate,
      endDate: params.endDate,
      fromTime: params.startDate,
      toTime: params.endDate,
      branchId: dataBranch.value,
    };
    const response = await ReportCustomerService.notInTimePipeline(param);
    if (response.code === 0) {
      // revenueTransfer = Tổng luỹ kế của tất cả các notHavePaidDealValue của các item có pipeline = "Thực hiện hợp đồng" và notHavePaidDealValue > 0 trong mảng response.result
      let revenueTransfer = 0;

      response.result.map((item) => {
        if (item.notHavePaidDealValue > 0) {
          revenueTransfer += item.notHavePaidDealValue;
        }
      });

      setDataPreview(
        dataPreview.map((item) => {
          if (item.key === "revenueTransfer") {
            item.value = formatToBillion(revenueTransfer);
            return item;
          } else {
            return item;
          }
        })
      );
    }
  };

  const [dataExternalOrnot, setDataExternalOrnot] = useState({
    internal: 0,
    external: 0,
  });
  const fetchDataExternalOrnot = async () => {
    const response = await ReportCustomerService.externalOrnot(paramsExternalOrnot);
    if (response.code === 0) {
      // Khách nội bộ
      // Khách ngoài
      setDataExternalOrnot({ internal: response?.result[0] ? response?.result[0] : 0, external: response?.result[1] ? response?.result[1] : 0 });
    }
  };

  const [dataRelationShip, setDataRelationShip] = useState({
    "Đã tư vấn": 0,
    "Đã tiếp cận": 0,
    "Đã đặt cọc": 0,
  });

  const fetchDataRelationShip = async () => {
    const response = await ReportCustomerService.relationShip(paramsExternalOrnot);
    if (response.code === 0) {
      setDataRelationShip(response.result);
    }
  };

  useEffect(() => {
    // setDataPreview([]);
    fetchDataPipelineCustomer();
    fetchDataTotalCustomer();
    fetchDataContract();
    // fetchRevenue();
    fetchNotInTimePipeline();
    // fetchDataExternalOrnot();
    // fetchDataRelationShip();
  }, [params]);

  const [dataEmployee, setDataEmployee] = useState(null);

  // useEffect(() => {
  //   setDataEmployee({ value: dataInfoEmployee.id, label: name });
  // }, [dataInfoEmployee.id]);

  const [checkFieldEmployee, setCheckFieldEmployee] = useState<boolean>(false);
  const { dataBranch } = useContext(UserContext) as ContextType;
  // lấy người phụ trách
  //! đoạn này xử lý vấn đề lấy ra danh sách nhân viên
  const loadedOptionEmployee = async (search, loadedOptions, { page }) => {
    const response = await WorkOrderService.employeeAssignees({
      name: search,
    });

    if (response.code === 0) {
      const dataOption = response.result.filter((item) => item.id !== dataInfoEmployee.id);

      return {
        options: [
          { value: dataInfoEmployee.id, label: "Chưa có nhân viên phụ trách", avatar: "" },
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

    return { options: [], hasMore: false };
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
      setCheckFieldEmployee(false);
      setDataEmployee(e);
      setParams({
        ...params,
        employeeId: e.value,
      });
      setParamsContract({
        ...paramsContract,
        employeeId: e.value,
      });
      setParamsExternalOrnot({
        ...paramsExternalOrnot,
        employeeId: e.value,
      });
    } else {
      // setCheckFieldEmployee(false);
      setDataEmployee(null);
      setParams({
        ...params,
        employeeId: -1,
      });
      setParamsContract({
        ...paramsContract,
        employeeId: -1,
      });
      setParamsExternalOrnot({
        ...paramsExternalOrnot,
        employeeId: -1,
      });
    }
  };

  // khách hàng
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState<boolean>(false);
  const [checkFieldCustomer, setCheckFieldCustomer] = useState<boolean>(false);

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
      setCheckFieldCustomer(false);
      setDetailCustomer(e);
      setParams({
        ...params,
        customerId: e.value,
      });
      setParamsContract({
        ...paramsContract,
        customerId: e.value,
      });
      setParamsExternalOrnot({
        ...paramsExternalOrnot,
        customerId: e.value,
      });
    } else {
      setDetailCustomer(null);
      setParams({
        ...params,
        customerId: -1,
      });
      setParamsContract({
        ...paramsContract,
        customerId: -1,
      });
      setParamsExternalOrnot({
        ...paramsExternalOrnot,
        customerId: -1,
      });
    }
  };

  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, startDate: fromTime, endDate: toTime });
      setParamsContract({ ...paramsContract, startDate: fromTime, endDate: toTime, fromTime: fromTime, toTime: toTime });
      setParamsExternalOrnot({ ...paramsExternalOrnot, startDate: fromTime, endDate: toTime });
    }
  };

  const [showModalDetail, setShowModalDetail] = useState(false);
  const [reportDetail, setReportDetail] = useState(null);

  return (
    <div className="report-customer">
      <div className="report_overview">
        <div className="report_overview--header">
          <div className="item-left">
            <div className="item">
              <SelectCustom
                id="employeeId"
                name="employeeId"
                label="Nhân viên"
                options={[]}
                fill={true}
                value={dataEmployee}
                required={true}
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
                error={checkFieldEmployee}
                message="Nhân viên không được bỏ trống"
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
                error={checkFieldCustomer}
                message="Khách hàng không được bỏ trống"
                // isLoading={data?.customerId ? isLoadingCustomer : null}
              />
            </div>
          </div>
          <div className="item-right">
            <AdvancedDateFilter updateParams={takeFromTimeAndToTime} defaultKey="startYearToNow" />
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
                  {item.loading ? (
                    <div className="__loading">
                      <Icon name="Loading" />
                    </div>
                  ) : (
                    <div className="__bottom">{item.value}</div>
                  )}

                  <div className="__rate">{item?.rate ? "(" + item.rate + ")" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* <div className="report_chart">
        <ChartCustomerJob paramsProps={params} dataRelationShip={dataRelationShip} />
        <ChartCustomerType paramsProps={params} dataExternalOrnot={dataExternalOrnot} />
      </div> */}
      {/* <div className="report_chart">
        <ChartActionByCustomerType classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionDaily classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionCumulative classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div> */}
      <DetailReportCusModal
        onShow={showModalDetail}
        reportDetail={reportDetail}
        paramsFilter={params}
        onHide={() => {
          setShowModalDetail(false);
          setReportDetail(null);
        }}
      />
    </div>
  );
}
