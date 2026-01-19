import React, { Fragment, useState, useEffect, useRef, useMemo, useContext } from "react";
import _ from "lodash";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { IBoughtProductFilterRequest } from "model/boughtProduct/BoughtProductRequestModel";
import { IBoughtProductResponse } from "model/boughtProduct/BoughtProductResponseModel";
import { showToast } from "utils/common";
import { isDifferenceObj, getPageOffset } from "reborn-util";
import BoughtProductService from "services/BoughtProductService";
import { ContextType, UserContext } from "contexts/userContext";

export default function ProductSoldList() {
  document.title = "Sản phẩm đã bán";

  const isMounted = useRef(false);
  const checkUserRoot = localStorage.getItem("user.root");
  const { dataBranch } = useContext(UserContext) as ContextType;
  const [searchParams, setSearchParams] = useSearchParams();
  const [listProductSold, setListProductSold] = useState<IBoughtProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<IBoughtProductFilterRequest>({
    keyword: "",
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "time_buy",
          name: "Ngày bán",
          type: "date-two",
          is_featured: true,
          value: searchParams.get("fromTime") ?? "",
          value_extra: searchParams.get("toTime") ?? "",
          is_fmt_text: true,
        },
        {
          key: "inventoryId",
          name: "Kho hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("inventoryId") ?? "",
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

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Danh sách sản phẩm đã bán",
      is_active: true,
    },
  ]);

  useEffect(() => {
    if (dataBranch) {
      setParams((prevParams) => ({ ...prevParams, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sản phẩm đã bán",
    isChooseSizeLimit: true,
    setPage: (page) => {
      setParams((prevParams) => ({ ...prevParams, page: page }));
    },
    chooseSizeLimit: (limit) => {
      setParams((prevParams) => ({ ...prevParams, limit: limit }));
    },
  });

  const abortController = new AbortController();

  const getListProductSold = async (paramsSearch: IBoughtProductFilterRequest) => {
    setIsLoading(true);

    const response = await BoughtProductService.list(paramsSearch, abortController.signal);

    if (response.code === 0) {
      const result = response.result;
      setListProductSold(result.items);

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
      getListProductSold(params);
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

  const titles = ["STT", "Mã hóa đơn", "Tên sản phẩm", "Tên khách hàng", "Số lô", "Ngày bán", "Đơn vị"];

  const dataFormat = ["text-center", "", "", "", "text-center", "", ""];

  const dataMappingArray = (item: IBoughtProductResponse, index: number) => [
    getPageOffset(params) + index + 1,
    item.invoiceCode,
    item.name,
    item.customerName,
    item.batchNo,
    item.receiptDate ? moment(item.receiptDate).format("DD/MM/YYYY") : "",
    item.unitName,
  ];

  return (
    <div className={`page-content page__product--sold${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Sản phẩm đã bán" />
      <div className="card-box d-flex flex-column">
        <SearchBox
          name="Tên sản phẩm"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />
        {!isLoading && listProductSold && listProductSold.length > 0 ? (
          <BoxTable
            name="Danh sách sản phẩm đã bán"
            titles={titles}
            items={listProductSold}
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
              <SystemNotification description={<span>Hiện tại chưa có sản phẩm đã bán nào.</span>} type="no-item" />
            ) : (
              <SystemNotification
                description={
                  <span>
                    Không có dữ liệu trùng khớp. <br />
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
