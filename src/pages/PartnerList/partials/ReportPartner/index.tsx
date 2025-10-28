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
import ReportBussinessPartnerService from "services/ReportBussinessPartnerService";
import moment from "moment";
import PartnerService from "services/PartnerService";
import { formatCurrency } from "reborn-util";
import AdvancedDateFilter from "components/advancedDateFilter/advancedDateFilter";
import WorkOrderService from "services/WorkOrderService";
import DetailReportPartnerModal from "./DetailReportPartnerModal";

interface ICardItem {
  key: string;
  icon: any;
  name: string;
  value: string;
  color: "total" | "out-date" | "success" | "today" | "remaining" | "average" | "early";
  unit?: string;
  rate?: string;
}

type IReportCard = ICardItem[];

export default function ReportPartner() {
  const { name, dataInfoEmployee } = useContext(UserContext) as ContextType;

  const [params, setParams] = useState({
    employeeId: -1,
    businessPartnerId: -1,
    fromTime: "",
    toTime: "",
  });
  // useEffect(() => {
  //   setDataEmployee({ value: dataInfoEmployee.id, label: name });
  // }, [dataInfoEmployee.id]);
  // useEffect(() => {
  //   const currentDate = moment().format("DD/MM/yyyy");

  //   const fourteenDaysAgo = moment().subtract(14, "days").format("DD/MM/yyyy");

  //   setParams({ fromTime: fourteenDaysAgo, toTime: currentDate });
  // }, []);
  const [dataPreview, setDataPreview] = useState([
    {
      key: "contractBusinessPartner",
      icon: <Icon name="User" />,
      name: "Số ĐT phát sinh hợp đồng",
      value: "--",
      color: "total",
    },
    {
      key: "signedContact",
      icon: <Icon name="Pencil" />,
      name: "Số hợp đồng đã ký",
      value: "--",
      color: "success",
      // rate: "90%",
    },
    {
      key: "negotiatedContract",
      icon: <Icon name="ManageOrder" />,
      name: "Số hợp đồng đàm phán",
      value: "--",
      color: "today",
      // rate: "50%",
    },
    {
      key: "liquidationContract",
      icon: <Icon name="ManageOrder" />,
      name: "Số hợp đồng đã thanh lý",
      value: "--",
      color: "early",
      // rate: "40%",
    },
    {
      key: "costContract",
      icon: <Icon name="ReceiveMoney" />,
      name: "Chi phí theo hợp đồng",
      value: "--",
      color: "today",
      // rate: "50%",
    },
    {
      key: "paid",
      icon: <Icon name="ReceiveMoney" />,
      name: "Đã chi",
      value: "--",
      color: "success",
      // rate: "40%",
    },
    {
      key: "debt",
      icon: <Icon name="ReceiveMoney" />,
      name: "Còn phải chi trong kỳ",
      value: "--",
      color: "out-date",
      // rate: "40%",
    },
    {
      key: "transitionCost",
      icon: <Icon name="ReceiveMoney" />,
      name: "Chi phí chuyển tiếp",
      value: "--",
      color: "early",
      // rate: "40%",
    },
  ]);

  const formatToBillion = (num: number): string => {
    if (num >= 1_000_000_000) {
      const billion = num / 1_000_000_000;
      return `${billion.toFixed(2)} tỷ`;
    } else if (num >= 1_000_000) {
      const million = num / 1_000_000;
      return `${million.toFixed(2)} triệu`;
    } else {
      return formatCurrency(num, "", "").toString();
    }
  };

  const [data, setData] = useState(null);
  const fetchData = async () => {
    const response = await ReportBussinessPartnerService.reportBussinessParner(params);
    if (response.code === 0) {
      setData(response.result);
    }
  };
  useEffect(() => {
    fetchData();
  }, [params]);
  useEffect(() => {
    setDataPreview((prevState) =>
      prevState.map((item) => {
        if (data) {
          if (data[item.key] || data[item.key] == 0) {
            return { ...item, value: formatToBillion(data[item.key]) };
          }
        }
        return item;
      })
    );
  }, [data]);

  const [dataEmployee, setDataEmployee] = useState(null);
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
      setCheckFieldEmployee(false);
      setDataEmployee(e);
      setParams({
        ...params,
        employeeId: e.value,
      });
    } else {
      setDataEmployee(null);
      setParams({
        ...params,
        employeeId: -1,
      });
    }
    // setFormData({ ...formData, values: { ...formData?.values, employeeId: e.value } });
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

    const response = await PartnerService.list(param);

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
                  address: item.address,
                  phoneMasked: item.phoneMasked,
                  taxCode: item.taxCode,
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
        businessPartnerId: e.value,
      });
    } else {
      setDetailCustomer(null);
      setParams({
        ...params,
        businessPartnerId: -1,
      });
    }
  };
  const takeFromTimeAndToTime = (fromTime, toTime) => {
    if (fromTime && toTime) {
      setParams({ ...params, fromTime: fromTime, toTime: toTime });
      // setParamsContract({ ...paramsContract, startDate: fromTime, endDate: toTime, fromTime: fromTime, toTime: toTime });
      // setParamsExternalOrnot({ ...paramsExternalOrnot, startDate: fromTime, endDate: toTime });

      // const dateArray = generateDateArray(fromTime, toTime);
      // setListDate(dateArray);
      // const dateObject = dateArray.reduce((acc, date) => {
      //   acc[date] = 0;
      //   return acc;
      // }, {});

      // setListDataByDate(dateObject);
    }
  };

  const [showModalDetail, setShowModalDetail] = useState(false);
  const [reportDetail, setReportDetail] = useState(null);

  return (
    <div className="report-partner">
      <div className="report_overview">
        <div className="report_overview--header">
          {/* <div className="item">
            <SelectCustom
              id="employeeId"
              name="employeeId"
              label="Chiến dịch"
              options={[]}
              fill={true}
              value={dataEmployee}
              required={true}
              onChange={(e) => handleChangeValueEmployee(e)}
              isAsyncPaginate={true}
              isFormatOptionLabel={true}
              placeholder="Chọn chiến dịch"
              additional={{
                page: 1,
              }}
              loadOptionsPaginate={loadedOptionEmployee}
              formatOptionLabel={formatOptionLabelEmployee}
              error={checkFieldEmployee}
              message="Chiến dịch không được bỏ trống"
            />
          </div> */}
          <div className="item-left">
            <div className="item">
              <SelectCustom
                id="employeeId"
                name="employeeId"
                label="Nhân viên"
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
                error={checkFieldEmployee}
                message="Nhân viên không được bỏ trống"
              />
            </div>
            <div className="item">
              <SelectCustom
                id="customerId"
                name="customerId"
                label="Đối tác"
                options={[]}
                fill={true}
                value={detailCustomer}
                // required={true}
                isClearable={true}
                isShowDropdownIcon={detailCustomer?.value ? false : true}
                onChange={(e) => handleChangeValueCustomer(e)}
                isAsyncPaginate={true}
                isFormatOptionLabel={true}
                placeholder="Tất cả đối tác"
                additional={{
                  page: 1,
                }}
                loadOptionsPaginate={loadedOptionCustomer}
                formatOptionLabel={formatOptionLabelCustomer}
                error={checkFieldCustomer}
                message="Đối tác không được bỏ trống"
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
                    <span>{`${item.name} ${item?.unit ? " (" + item?.unit + ")" : ""}`}</span>
                  </div>
                  <div className="__bottom">{item.value}</div>
                  <div className="__rate">{item?.rate ? "(" + item?.rate + ")" : ""}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* <div className="report_chart">
        <ChartOptNewDaily paramsProps={params} />
        <ChartActionDaily paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartActionCumulative classNames="report_chart__detail_two_colums" paramsProps={params} />
      </div>
      <div className="report_chart">
        <ChartCustomerJob paramsProps={params} />
      </div> */}
      <DetailReportPartnerModal
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
