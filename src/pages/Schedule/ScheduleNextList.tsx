import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from 'reborn-util';
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import CustomerService from "services/CustomerService";
import moment from "moment";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { ITreamentFilterRequest } from "model/treatment/TreamentRequestModel";
import TreamentService from "services/TreamentService";
import { ITreamentResponse, ITreamentSchedulerResponse } from "model/treatment/TreamentResponseModel";
import AddHistoryCallModal from "./partials/AddHistoryCallModal";
import ExtendTimeSchedule from "./partials/ExtendTimeScheduleModal";
import AddSchedulerModal from "pages/TreatmentSchedule/partials/AddSchedulerModal";
import AddCaringEmployee from "./partials/AddCaringEmployee";
import ShowCallHistory from "./partials/ShowCallHistory";
import "./ScheduleNextList.scss";

export default function ScheduleNextList() {
  document.title = "Danh sách nhắc lịch";

  const [searchParams, setSearchParams] = useSearchParams();
  const [listScheduleNext, setListScheduleNext] = useState<ITreamentResponse[]>([]);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalAddCaringEmployee, setShowModalAddCaringEmployee] = useState<boolean>(false);
  const [showModalCallHistory, setShowModalCallHistory] = useState<boolean>(false);
  const [idScheduleNext, setIdScheduleNext] = useState<number>(null);
  const [idEmployee, setIdEmployee] = useState<number>(null);
  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Tất cả nhắc lịch",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_treament",
        name: "Thời gian",
        type: "date-two",
        is_featured: true,
        value: searchParams.get("from_date") ?? "",
        value_extra: searchParams.get("to_date") ?? "",
      },
      {
        key: "employeeId",
        name: "Nhân viên gọi điện",
        type: "select",
        is_featured: true,
        value: searchParams.get("employeeId") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái gọi",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "2",
            label: "Chưa gọi",
          },
          {
            value: "1",
            label: "Thành công",
          },
          {
            value: "0",
            label: "Thất bại",
          },
        ],
        value: searchParams.get("status") ?? "",
      },
    ],
    [searchParams]
  );

  const isMounted = useRef(false);
  const [params, setParams] = useState<ITreamentFilterRequest>({
    keyword: "",
  });

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nhắc lịch",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListScheduleNext = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);
    if (paramsSearch.fromTime) {
      paramsSearch["fmtStartDay"] = moment(paramsSearch.fromTime).format("DD/MM/YYYY");
      delete paramsSearch["fromTime"];
    }
    if (paramsSearch.toTime) {
      paramsSearch["fmtEndDay"] = moment(paramsSearch.toTime).format("DD/MM/YYYY");
      delete paramsSearch["toTime"];
    }
    const response = await TreamentService.filter(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListScheduleNext(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword === "" && +params.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach(async (key, value) => {
      paramsTemp[value] = key;
    });
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isMounted.current === true) {
      getListScheduleNext(params);
      const paramsTemp = _.cloneDeep(params);
      if (paramsTemp.limit === 10) {
        delete paramsTemp["limit"];
      }
      Object.keys(paramsTemp).map(function (key) {
        paramsTemp[key] === "" ? delete paramsTemp[key] : null;
      });
      if (isDifferenceObj(searchParams, paramsTemp)) {
        if (paramsTemp.page === 1) {
          delete paramsTemp["page"];
        }
        setSearchParams(paramsTemp as Record<string, string | string[]>);
      }
    }
    return () => {
      abortController.abort();
    };
  }, [params]);

  const titleActions: ITitleActions = {
    actions_extra: [
      {
        title: "Xuất danh sách",
        icon: <Icon name="Download" />,
        callback: () => setOnShowModalExport(true),
      },
    ],
  };

  const titles = ["STT", "Khách hàng", "Số điện thoại", "Dịch vụ", "Buổi thứ", "Thời gian hẹn", "Trạng thái", "Nhân viên gọi điện", "Lịch sử gọi"];

  const dataMappingArray = (item: ITreamentResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName,
    item.customerPhone,
    item.serviceName,
    `Buổi thứ ${item.treatmentTh + 1}`,
    moment(item.scheduleNext).format("HH:mm DD/MM/YYYY"),
    "",
    <a
      key={item.id}
      onClick={() => {
        setShowModalAddCaringEmployee(true);
        setIdScheduleNext(item.id);
        setIdEmployee(item.employeeId);
      }}
      className="link-employee"
    >
      {item.caringEmployeeName}
    </a>,
    <a
      key={item.id}
      onClick={() => {
        setShowModalCallHistory(true);
        setIdCustomer(item.customerId);
        setIdScheduleNext(item.id);
        setIdEmployee(item.employeeId);
      }}
      className="link-history"
    >
      ({item.totalCall} lần gọi)
    </a>,
  ];

  const dataFormat = ["text-center", "", "", "", "text-center", "text-center", "", "text-center", "text-center"];

  const actionsTable = (item: ITreamentResponse): IAction[] => {
    return [
      {
        title: "Sửa lịch điều trị",
        icon: <Icon name="Pencil" />,
        callback: async () => {
          const response = await CustomerService.detailScheduler(item.csrId);
          if (response && response.result) {
            setDataCustomerScheduler(response.result);
            setShowModalEditSchedule(true);
          } else {
            showToast("Có lỗi xảy ra. Vui lòng thử lại sau!", "error");
          }
        },
      },
      {
        title: "Thêm kết quả gọi",
        icon: <Icon name="AddTodoList" />,
        callback: () => {
          setDataTreatment(item);
          setShowModalAddHistoryCall(true);
        },
      },
      {
        title: "Gia hạn Nhắc lịch",
        icon: <Icon name="Calendar" />,
        callback: () => {
          setDataTreatment(item);
          setShowModalExtendTimeSchedule(true);
        },
      },
    ];
  };

  const [showModalEditSchedule, setShowModalEditSchedule] = useState<boolean>(false);
  const [dataCustomerScheduler, setDataCustomerScheduler] = useState<ITreamentSchedulerResponse>(null);

  const [showModalAddHistoryCall, setShowModalAddHistoryCall] = useState<boolean>(false);
  const [showModalExtendTimeSchedule, setShowModalExtendTimeSchedule] = useState<boolean>(false);
  const [dataTreatment, setDataTreatment] = useState<ITreamentResponse>(null);

  //Export
  const [onShowModalExport, setOnShowModalExport] = useState<boolean>(false);
  const optionsExport: IOption[] = useMemo(
    () => [
      {
        value: "all",
        label: "Tất cả khách hàng ",
      },
      {
        value: "current_page",
        label: "Trên trang này",
        disabled: pagination.totalItem === 0,
      },
      {
        value: "current_search",
        label: `${pagination.totalItem} khách hàng phù hợp với kết quả tìm kiếm hiện tại`,
        disabled: pagination.totalItem === 0 || !isDifferenceObj(params, { keyword: "" }),
      },
    ],
    [pagination, listIdChecked, params]
  );

  return (
    <div className={`page-content page-schedule-next${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Nhắc lịch" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Nhắc lịch"
          placeholderSearch="Tìm kiếm theo tên/ SĐT/ Mã thẻ KH"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listScheduleNext && listScheduleNext.length > 0 ? (
          <BoxTable
            name="Nhắc lịch"
            titles={titles}
            items={listScheduleNext}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            setListIdChecked={(listId) => setListIdChecked(listId)}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có lịch điều trị tiếp theo nào.</span>} type="no-item" />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp.
                    <br />
                    Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                  </span>
                }
                type="no-result"
              />
            )}
          </Fragment>
        )}
      </div>
      <AddSchedulerModal
        onShow={showModalEditSchedule}
        dataScheduler={dataCustomerScheduler}
        onHide={(reload) => {
          if (reload) {
            getListScheduleNext(params);
          }
          setShowModalEditSchedule(false);
        }}
      />
      <AddHistoryCallModal
        onShow={showModalAddHistoryCall}
        data={dataTreatment}
        onHide={(reload) => {
          if (reload) {
            getListScheduleNext(params);
          }
          setShowModalAddHistoryCall(false);
        }}
      />
      <ExtendTimeSchedule
        onShow={showModalExtendTimeSchedule}
        data={dataTreatment}
        onHide={(reload) => {
          if (reload) {
            getListScheduleNext(params);
          }
          setShowModalExtendTimeSchedule(false);
        }}
      />
      <AddCaringEmployee
        idScheduleNext={idScheduleNext}
        idEmployee={idEmployee}
        onShow={showModalAddCaringEmployee}
        data={dataTreatment}
        onHide={(reload) => {
          if (reload) {
            getListScheduleNext(params);
          }
          setShowModalAddCaringEmployee(false);
        }}
      />
      <ShowCallHistory
        idScheduleNext={idScheduleNext}
        employeeId={idEmployee}
        customerId={idCustomer}
        data={dataTreatment}
        onShow={showModalCallHistory}
        onHide={(reload) => {
          if (reload) {
            getListScheduleNext(params);
          }
          setShowModalCallHistory(false);
        }}
      />
    </div>
  );
}
