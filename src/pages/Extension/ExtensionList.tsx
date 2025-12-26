import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Tippy from "@tippyjs/react";
import TitleAction from "components/titleAction/titleAction";
import Icon from "components/icon";
import BoxTable from "components/boxTable/boxTable";
import { isDifferenceObj, showToast } from "utils/common";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Loading from "components/loading";
import { IAction, ISaveSearch } from "model/OtherModel";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { useSearchParams } from "react-router-dom";
import _ from "lodash";
import moment from "moment";
import { getPageOffset } from "reborn-util";
import ApplicationService from "services/ApplicationService";
import Badge from "components/badge/badge";
import ViewBill from "./partials/ViewBill";

import "./ExtensionList.scss";
import { AnyGridOptions } from "ag-grid-community";

export default function ExtensionList() {
  document.title = "Danh sách gia hạn";

  const [searchParams, setSearchParams] = useSearchParams();
  const [listApp, setListApp] = useState<AnyGridOptions[]>([]);
  const [dataApp, setDataApp] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [viewBill, setViewBill] = useState<boolean>(false);
  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách gia hạn",
      is_active: true,
    },
  ]);

  const isMounted = useRef(false);

  const [params, setParams] = useState<any>({
    beautySalonName: "",
    status: -1,
  });

  const defaultFilterList: any = useMemo(
    () => [
      {
        key: "createdTime",
        name: "Khoảng thời gian",
        type: "date-two",
        param_name: ["fromDate", "toDate"],
        is_featured: true,
        value: searchParams.get("fromDate") ?? "",
        value_extra: searchParams.get("toDate") ?? "",
        is_fmt_text: true,
      },
      {
        key: "code",
        name: "Tên ứng dụng",
        type: "select",
        list: [
          { value: "crm", label: "CRM" },
          { value: "cms", label: "CMS" },
          { value: "web", label: "WEB" },
          { value: "app", label: "APP" },
          { value: "market", label: "Market" },
        ],
        is_featured: true,
        value: searchParams.get("code") ?? "",
      },
      {
        key: "packageId",
        name: "Loại gói",
        type: "select",
        is_featured: true,
        value: searchParams.get("packageId") ?? "",
      },
      {
        key: "status",
        name: "Trạng thái",
        type: "select",
        list: [
          { value: "-1", label: "Tất cả" },
          { value: "0", label: "Chưa thanh toán" },
          { value: "1", label: "Đã thanh toán" },
          { value: "2", label: "Chờ xác nhận" },
          { value: "3", label: "Thất bại" },
        ],
        is_featured: true,
        value: searchParams.get("status") ?? "",
        disabledDelete: true,
      },
    ],
    [searchParams, params]
  );

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "mục gia hạn",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListApplication = async (paramsSearch: any) => {
    setIsLoading(true);
    const response = await ApplicationService.listAll(paramsSearch, abortController.signal);
    if (response.code === 0) {
      const result = response.result;
      setListApp(result.items);
      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });
      if (+result.total === 0 && +result.page === 1) {
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
      getListApplication(params);
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

  const titles = ["STT", "Tên tổ chức", "Số điện thoại", "Tên ứng dụng", "Loại gói", "Ngày gia hạn", "Trạng thái"];

  const dataFormat = ["text-center", "", "text-center", "", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: any, index: number) => [
    getPageOffset(params) + index + 1,
    item.beautySalonName,
    item.phone,
    item.code,
    item.packageName,
    item.startDate ? moment(item.startDate).format("DD/MM/YYYY") : "",
    <Badge
      key={item.id}
      text={`${!item.status ? "Chưa thanh toán" : item.status === 1 ? "Đã thanh toán" : item.status === 2 ? "Chờ thanh toán" : "Thất bại"}`}
      variant={`${!item.status ? "secondary" : item.status === 1 ? "success" : item.status === 2 ? "warning" : "error"}`}
    />,
  ];

  const actionsTable = (item: any): IAction[] => {
    return [
      {
        title: "Xem hóa đơn",
        icon: <Icon name="Eye" />,
        callback: () => {
          setDataApp(item);
          setViewBill(true);
        },
      },
    ];
  };

  return (
    <div className={`page-content page-extension${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Danh sách gia hạn" />
      <div className="card-box d-flex flex-column">
        <div className="action__header--extension">
          <Tippy content="Làm mới">
            <div className="icon-reload" onClick={() => getListApplication(params)}>
              <Icon name="ImpactHistory" />
            </div>
          </Tippy>

          <SearchBox
            name={"theo tên tổ chức"}
            params={params}
            isSaveSearch={true}
            listSaveSearch={listSaveSearch}
            updateParams={(paramsNew) => setParams(paramsNew)}
            isFilter={true}
            listFilterItem={defaultFilterList}
          />
        </div>
        {!isLoading && listApp && listApp.length > 0 ? (
          <BoxTable
            name="Danh sách gia hạn"
            titles={titles}
            items={listApp}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            isBulkAction={true}
            striped={true}
            actions={actionsTable}
            actionType="inline"
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {!isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có danh sách gia hạn nào.</span>} type="no-item" />
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
      <ViewBill
        onShow={viewBill}
        data={dataApp}
        onHide={(reload) => {
          if (reload) {
            getListApplication(params);
          }

          setViewBill(false);
        }}
      />
    </div>
  );
}
