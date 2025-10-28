import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { IWarehouseFilterRequest } from "model/warehouse/WarehouseRequestModel";
import { IWarehouseResponse } from "model/warehouse/WarehouseResponseModel";
import { showToast } from "utils/common";
import WarehouseService from "services/WarehouseService";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import { useSearchParams } from "react-router-dom";

export default function ProductInventoryList() {
  document.title = "Sản phẩm tồn kho";

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");

  const [searchParams, setSearchParams] = useSearchParams();

  const [listWarehouse, setListWarehouse] = useState<IWarehouseResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [params, setParams] = useState<IWarehouseFilterRequest>({
    keyword: "",
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "time",
          name: "Hạn dùng",
          type: "date-two",
          param_name: ["startDate", "toDate"],
          is_featured: true,
          value: searchParams.get("startDate") ?? "",
          value_extra: searchParams.get("toDate") ?? "",
          is_fmt_text: true,
        },
        ...(+checkUserRoot == 1
          ? [
              {
                key: "inventoryId",
                name: "Kho hàng",
                type: "select",
                is_featured: true,
                value: searchParams.get("inventoryId") ?? "",
              },
            ]
          : []),
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách sản phẩm tồn kho",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm tồn kho",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListWarehouse = async (paramsSearch: IWarehouseFilterRequest) => {
    setIsLoading(true);

    const response = await WarehouseService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListWarehouse(result.items);

      setPagination({
        ...pagination,
        page: +result.page,
        sizeLimit: params.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: +result.total,
        totalPage: Math.ceil(+result.total / +(params.limit ?? DataPaginationDefault.sizeLimit)),
      });

      if (+result.total === 0 && !params.keyword && +result.page === 1) {
        setIsNoItem(true);
      }
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    setParams((prevParams) => ({ ...prevParams, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isMounted.current === true) {
      getListWarehouse(params);
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

  const titles = ["STT", "Tên sản phẩm", "Số lô", "Hạn dùng", "Đơn vị tính", "Số lượng tồn kho", "Tên kho"];

  const dataFormat = ["text-center", "", "text-center", "text-center", "text-center", "text-right", ""];

  const dataMappingArray = (item: IWarehouseResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.productName,
    item.batchNo,
    moment(item.expiryDate).format("DD/MM/YYYY"),
    item.unitName,
    item.quantity,
    item.inventoryName,
  ];

  return (
    <div className={`page-content page-warehouse${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Sản phẩm tồn kho" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên sản phẩm, số lô"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listWarehouse && listWarehouse.length > 0 ? (
          <BoxTable
            name="Sản phẩm tồn kho"
            titles={titles}
            items={listWarehouse}
            isPagination={true}
            dataPagination={pagination}
            dataMappingArray={(item, index) => dataMappingArray(item, index)}
            dataFormat={dataFormat}
            striped={true}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Fragment>
            {isNoItem ? (
              <SystemNotification description={<span>Hiện tại chưa có sản phẩm tồn kho nào.</span>} type="no-item" />
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
