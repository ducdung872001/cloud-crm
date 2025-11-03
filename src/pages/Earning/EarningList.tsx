import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Icon from "components/icon";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IAction, IFilterItem, IOption, ISaveSearch } from "model/OtherModel";
import { IEarningResponseModel } from "model/earnings/EarningResponseModel";
import { IEarningsFilterRequest } from "model/earnings/EarningRequestModel";
import { showToast } from "utils/common";
import { formatCurrency, isDifferenceObj, getPageOffset } from 'reborn-util';
import EarningsService from "services/EarningsService";

export default function EarningList() {
  document.title = "Theo dõi hoa hồng";

  const isMounted = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const [listEarning, setListEarning] = useState<IEarningResponseModel[]>([]);
  const [dataEarning, setDataEarning] = useState<IEarningResponseModel>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Theo dõi hoa hồng",
      is_active: true,
    },
  ]);

  const customerFilterList: IFilterItem[] = useMemo(
    () => [
      {
        key: "time_buy",
        name: "Chọn tháng",
        type: "date",
        is_featured: true,
        value: searchParams.get("from_date") ?? "",
        value_extra: searchParams.get("to_date") ?? "",
      },
      {
        key: "checkDebt",
        name: "Khách hàng",
        type: "select",
        is_featured: true,
        list: [
          {
            value: "1",
            label: "Phan Đức Dũng",
          },
        ],
        value: searchParams.get("checkDebt") ?? "",
      },
    ],
    [searchParams]
  );

  const [params, setParams] = useState<IEarningsFilterRequest>({});

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Theo dõi hoa hồng",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();
  const getListEarning = async (paramsSearch: IEarningsFilterRequest) => {
    setIsLoading(true);

    const response = await EarningsService.filter(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListEarning(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && +params.page === 1) {
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
      getListEarning(params);
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

  const titles = ["STT", "Ngày phát sinh", "Người thụ hưởng", "Số tiền", "Phần trăm hưởng", "Loại giao dịch", "Dịch vụ"];

  const dataMappingArray = (item: IEarningResponseModel, index: number) => [
    getPageOffset(params) + index + 1,
    item.transDate ? moment(item.transDate).format("DD/MM/YYYY") : "",
    item.recommenderPhone,
    formatCurrency(+item.amount, ","),
    item.sharePercent,
    item.type,
  ];

  const dataFormat = ["text-center", "text-center", "", "text-right", "text-center", "", ""];

  return (
    <div className={`page-content page-earning${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Theo dõi hoa hồng" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Theo dõi hoa hồng"
          placeholderSearch="Tìm kiếm theo tên khách hàng /tháng"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listEarning && listEarning.length > 0 ? (
          <BoxTable
            name="Theo dõi hoa hồng"
            titles={titles}
            items={listEarning}
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
            {!isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có theo dõi hoa hồng nào.</span>} type="no-item" />
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
    </div>
  );
}
