import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";
import { ICustomerResponse } from "model/customer/CustomerResponseModel";
import moment from "moment";
import { ICustomerSchedulerFilterRequest } from "model/customer/CustomerRequestModel";
import { ITreamentFilterRequest } from "model/treatment/TreamentRequestModel";
import TreamentService from "services/TreamentService";
import { ITreamentSchedulerResponse } from "model/treatment/TreamentResponseModel";
import AddSchedulerModal from "pages/TreatmentSchedule/partials/AddSchedulerModal";
import Badge from "components/badge/badge";
import CustomerService from "services/CustomerService";
import ServiceTreatment from "./partials/ServiceTreatment";
import "./TreatmentScheduleList.scss";
// file này sau có thể bỏ

export default function TreatmentScheduleList() {
  document.title = "Danh sách lịch điều trị";
  const [searchParams, setSearchParams] = useSearchParams();
  const [listTreamentSchedule, setListTreamentSchedule] = useState<ICustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [showModalServiceTreatment, setShowModalServiceTreatment] = useState<boolean>(false);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Tất cả lịch điều trị",
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
        key: "status",
        name: "Trạng thái",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "-1",
            label: "Tất cả",
          },
          {
            value: "1",
            label: "Đã thực hiện",
          },
          {
            value: "2",
            label: "Chưa thực hiện",
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
    name: "lịch điều trị",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListTreamentSchedule = async (paramsSearch: ICustomerSchedulerFilterRequest) => {
    setIsLoading(true);
    const response = await CustomerService.filterScheduler(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListTreamentSchedule(result.items);
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
      getListTreamentSchedule(params);
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
    actions: [
      {
        title: "Thêm mới",
        callback: () => {
          setDataScheduler(null);
          setShowModalSchedule(true);
        },
      },
    ],
  };

  const titles = ["STT", "Khách hàng", "Nội dung làm (dự kiến)", "Thời gian hẹn", "Lưu ý", "Trạng thái", "Thực hiện"];

  const dataMappingArray = (item: ITreamentSchedulerResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.customerName,
    item.content,
    moment(item.scheduleDate).format("HH:mm DD/MM/YYYY"),
    item.note,
    item.status == 2 ? <Badge key={`treament-schedule-${item.id}`} text="Chưa có lịch điều trị" variant="error" /> : "",
    <a
      key={index}
      onClick={() => {
        setDataScheduler(item);
        setShowModalServiceTreatment(true);
      }}
      className="link-treament-schedule"
    >
      {item.serviceCount} dịch vụ
    </a>,
  ];

  const dataFormat = ["text-center", "", "", "text-center", "", "text-center", "text-center"];

  const actionsTable = (item: ITreamentSchedulerResponse): IAction[] => {
    return [
      {
        title: "Sửa lịch điều trị",
        icon: <Icon name="Pencil" />,
        callback: () => {
          setDataScheduler(item);
          setShowModalSchedule(true);
        },
      },
    ];
  };

  const [showModalSchedule, setShowModalSchedule] = useState<boolean>(false);
  const [dataScheduler, setDataScheduler] = useState<ITreamentSchedulerResponse>(null);

  return (
    <div className={`page-content page-schedule-next${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Lịch điều trị" titleActions={titleActions} />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Lịch điều trị"
          placeholderSearch="Tìm kiếm theo tên/ SĐT"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listTreamentSchedule && listTreamentSchedule.length > 0 ? (
          <BoxTable
            name="Lịch điều trị"
            titles={titles}
            items={listTreamentSchedule}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification
                description={
                  <span>
                    Hiện tại chưa có lịch điều trị nào. <br />
                    Hãy thêm mới lịch điều trị đầu tiên nhé!
                  </span>
                }
                type="no-item"
                titleButton="Thêm mới lịch điều trị"
                action={() => {
                  setDataScheduler(null);
                  setShowModalSchedule(true);
                }}
              />
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
        onShow={showModalSchedule}
        dataScheduler={dataScheduler}
        onHide={(reload) => {
          if (reload) {
            getListTreamentSchedule(params);
          }
          setShowModalSchedule(false);
        }}
      />
      <ServiceTreatment
        onShow={showModalServiceTreatment}
        data={dataScheduler}
        onHide={(reload) => {
          if (reload) {
            getListTreamentSchedule(params);
          }
          setShowModalServiceTreatment(false);
        }}
      />
    </div>
  );
}
