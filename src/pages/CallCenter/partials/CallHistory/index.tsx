import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import Image from "components/image";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IFilterItem } from "model/OtherModel";
import { ICallHistoryProps } from "model/callCenter/PropsModel";
import { ICallCenterResponseModel } from "model/callCenter/CallCenterResponseModel";
import { ICallHistoryListFilterRequest } from "model/callCenter/CallCenterRequestModel";
import { showToast } from "utils/common";
import CallCenterService from "services/CallCenterService";
import AddManagementOpportunityModal from "pages/ManagementOpportunity/partials/AddManagementOpportunityModal";
import { ContextType, UserContext } from "contexts/userContext";

export default function CallHistory(props: ICallHistoryProps) {
  const { tab } = props;
  const checkUserRoot = localStorage.getItem("user.root");

  const isMounted = useRef(false);
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [listHistory, setListHistory] = useState<ICallCenterResponseModel[]>([]);
  const [showModalAddManagementOpportunity, setShowModalAddManagementOpportunity] = useState<boolean>(false);
  const [idCustomer, setIdCustomer] = useState<number>(null);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const [params, setParams] = useState<ICallHistoryListFilterRequest>({
    keyword: "",
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "time_buy",
          name: "Thời gian gọi gần nhất",
          type: "date-two",
          param_name: ["startDate", "endDate"],
          is_featured: true,
          value: searchParams.get("startDate") ?? "",
          value_extra: searchParams.get("endDate") ?? "",
          is_fmt_text: true,
        },
        // ...(+checkUserRoot == 1 ? [
        //     {
        //       key: "branchId",
        //       name: "Chi nhánh",
        //       type: "select",
        //       is_featured: true,
        //       value: searchParams.get("branchId") ?? "",
        //     },
        //   ] : []
        // ),
        {
          key: "employeeId",
          name: "Người phụ trách",
          type: "select",
          is_featured: true,
          value: searchParams.get("employeeId") ?? "",
        },
        {
          key: "customerId",
          name: "Khách hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("customerId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Cuộc gọi",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  useEffect(() => {
    if (tab && tab.status) {
      setParams({ ...params, callStatus: tab.status });
      setPagination({ ...pagination, name: tab.namePagination.replace("Tất cả", "") });
    } else {
      delete params?.callStatus;
      setParams({ ...params });
    }
  }, [tab]);

  const getListHistory = async (paramsSearch: ICallHistoryListFilterRequest) => {
    setIsLoading(true);

    const response = await CallCenterService.callHistoryList(paramsSearch);

    if (response.code === 0) {
      const result = response.result;
      setListHistory(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && params.keyword !== "" && +params.page === 1) {
        setIsNoItem(true);
      }
    } else if (response.code == 400) {
      setIsPermissions(true);
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
      getListHistory(params);
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
  }, [params]);

  const titles = ["STT", "Ảnh khách hàng", "Tên khách hàng", "Điện thoại", "Cuộc gọi", "Nhân viên chăm sóc", "Thời gian cuộc gọi", "Tạo cơ hội"];

  const dataFormat = ["text-center", "text-center", "", "text-center", "text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: ICallCenterResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    <Image key={item.id} src={item.customerAvatar} alt={item.customerName} />,
    item.customerName,
    item.phone,
    item.callStatus == 1 ? "Gọi đi" : item.callStatus == 2 ? "Gọi đến" : item.callStatus == 3 ? "Gọi đi lỡ" : "Gọi đến lỡ",
    item.employeeName,
    item.endTime ? getRealTimeCall(item.createdTime, item.endTime) : "",
    <span
      key={item.id}
      style={{ color: "var(--primary-color-90)", fontWeight: "500", cursor: "pointer" }}
      onClick={() => {
        setIdCustomer(item.id);
        setShowModalAddManagementOpportunity(true);
      }}
    >
      Tạo
    </span>,
  ];

  const getRealTimeCall = (start, end) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    let distance = Math.abs(endTime - startTime);
    const minutes = Math.floor(distance / 60000);
    distance -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);

    const result = `${minutes} phút - ${seconds} giây`;

    return (
      <div className="d-flex align-items-center flex-column view__time--call">
        <span className="time-end">{moment(end).format("DD/MM/YYYY HH:mm")}</span>
        <span className="total-item">{result}</span>
      </div>
    );
  };

  return (
    <Fragment>
      <SearchBox
        name={`${tab.namePagination}`}
        params={params}
        isFilter={true}
        listFilterItem={customerFilterList}
        placeholderSearch="Tìm kiếm theo tên, số điện thoại, email khách hàng"
        updateParams={(paramNew) => setParams(paramNew)}
      />
      {!isLoading && listHistory && listHistory.length > 0 ? (
        <BoxTable
          name={`${tab.namePagination}`}
          titles={titles}
          items={listHistory}
          isPagination={true}
          dataPagination={pagination}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          striped={true}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isPermissions ? (
            <SystemNotification type="no-permission" />
          ) : isNoItem ? (
            <SystemNotification description={<span>Hiện tại chưa có cuộc gọi nào.</span>} type="no-item" />
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
      <AddManagementOpportunityModal
        onShow={showModalAddManagementOpportunity}
        idCustomer={idCustomer}
        onHide={() => setShowModalAddManagementOpportunity(false)}
      />
    </Fragment>
  );
}
