import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import moment from "moment";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import { IFilterItem, ISaveSearch } from "model/OtherModel";
import { IInventoryLedgerFilterRequest } from "model/inventory/InventoryRequestModel";
import { IInventoryLedgerResponse } from "model/inventory/InventoryResponseModel";
import { showToast } from "utils/common";
import { getPageOffset, isDifferenceObj } from "reborn-util";
import { useSearchParams } from "react-router-dom";
import InventoryService from "services/InventoryService";
import urls from "@/configs/urls";
import "./InventoryList.scss";

const REF_TYPE_TABS = [
  { label: "Tất cả", value: "" },
  { label: "Nhập kho", value: "IMPORT" },
  { label: "Xuất bán", value: "SALE" },
  { label: "Khách trả", value: "RETURN" },
  { label: "Chuyển kho", value: "TRANSFER" },
  { label: "Điều chỉnh", value: "ADJUSTMENT" },
  { label: "Xuất hủy", value: "DESTROY" },
];

const renderRefType = (item: IInventoryLedgerResponse) => {
  const colorMap = {
    IMPORT: "success",
    SALE: "error",
    RETURN: "warning",
    TRANSFER: "primary",
    ADJUSTMENT: "warning",
    DESTROY: "secondary",
  };

  const color = colorMap[item.refType] ?? "secondary";

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <span className={`status__item--signature status__item--signature-${color}`}>{item.refTypeName ?? item.refType ?? "—"}</span>
    </div>
  );
};

const renderStatus = (item: IInventoryLedgerResponse) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "0.9rem" }}>
    <span className={`status__item--signature status__item--signature-${item.status === 1 ? "success" : "secondary"}`}>
      {item.statusName ?? (item.status === 1 ? "Hoàn thành" : "—")}
    </span>
  </div>
);

const renderWarehouse = (item: IInventoryLedgerResponse) => {
  if (item.refType === "TRANSFER") {
    return (
      <span className="warehouse__transfer" style={{ minWidth: "120px" }}>
        {item.fromWarehouseName ?? "—"} → {item.toWarehouseName ?? "—"}
      </span>
    );
  }

  return <span style={{ minWidth: "120px" }}>{item.warehouseName ?? "—"}</span>;
};

const renderQuantity = (item: IInventoryLedgerResponse) => {
  const quantity = item.quantityChange ?? item.quantity ?? 0;
  const quantityText = quantity > 0 ? `+${quantity}` : quantity;

  return <span className={quantity > 0 ? "warehouse__qty--positive" : "warehouse__qty--negative"}>{quantityText} {item.unitName ?? ""}</span>;
};

export default function WarehouseBookList() {
  document.title = "Sổ kho";

  const isMounted = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [listWarehouseBook, setListWarehouseBook] = useState<IInventoryLedgerResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);

  const [params, setParams] = useState<{
    keyword: string;
    refType: string;
    warehouseId?: string;
    page: number;
    limit: number;
  }>({
    keyword: "",
    refType: "",
    warehouseId: "",
    limit: 10,
    page: 1,
  });

  const customerFilterList = useMemo(
    () =>
      [
        {
          key: "warehouseId",
          name: "Kho hàng",
          type: "select",
          is_featured: true,
          value: searchParams.get("warehouseId") ?? "",
        },
      ] as IFilterItem[],
    [searchParams]
  );

  const [listSaveSearch] = useState<ISaveSearch[]>([
    {
      key: "all",
      name: "Sổ kho",
      is_active: true,
    },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Sổ kho",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = new AbortController();

  const getListWarehouseBook = async (paramsSearch: typeof params) => {
    setIsLoading(true);

    const requestParams: IInventoryLedgerFilterRequest = {};

    if (paramsSearch.keyword) {
      requestParams.keyword = paramsSearch.keyword;
    }

    if (paramsSearch.refType) {
      requestParams.refType = paramsSearch.refType;
    }

    if (paramsSearch.warehouseId) {
      requestParams.warehouseId = +paramsSearch.warehouseId;
    }

    if (typeof paramsSearch.page === "number") {
      requestParams.page = Math.max(paramsSearch.page - 1, 0);
    }

    if (typeof paramsSearch.limit === "number") {
      requestParams.size = paramsSearch.limit;
    }

    const response = await InventoryService.ledgerList(requestParams, abortController.signal);

    if (response.code === 0 || response.status === 1) {
      const result = response.result ?? response.data ?? {};
      const items = result.items ?? result.content ?? result.data ?? [];
      const total = +(result.total ?? result.totalElements ?? items.length ?? 0);
      const currentPage = +(result.page ?? requestParams.page ?? 0) + 1;

      setListWarehouseBook(items);
      setPagination((prev) => ({
        ...prev,
        page: currentPage,
        sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
        totalItem: total,
        totalPage: Math.ceil(total / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
      }));
      setIsNoItem(total === 0 && currentPage === 1);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    const paramsTemp = _.cloneDeep(params);
    searchParams.forEach((value, key) => {
      paramsTemp[key] = value;
    });
    setParams((prev) => ({ ...prev, ...paramsTemp }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    getListWarehouseBook(params);

    const paramsTemp = _.cloneDeep(params);
    if (paramsTemp.limit === 10) {
      delete paramsTemp["limit"];
    }
    Object.keys(paramsTemp).forEach((key) => {
      if (paramsTemp[key] === "") {
        delete paramsTemp[key];
      }
    });

    if (isDifferenceObj(searchParams, paramsTemp)) {
      if (paramsTemp.page === 1) {
        delete paramsTemp["page"];
      }
      // Convert tất cả giá trị sang string trước khi set URL params
      const searchParamsObj: Record<string, string> = {};
      Object.keys(paramsTemp).forEach((key) => {
        if (paramsTemp[key] !== undefined && paramsTemp[key] !== null) {
          searchParamsObj[key] = String(paramsTemp[key]);
        }
      });
      setSearchParams(searchParamsObj);
    }

    return () => {
      abortController.abort();
    };
  }, [params]);

  // ── Sổ kho = nhật ký giao dịch (read-only) → không có button tạo mới ──────
  // Mọi thao tác tạo phiếu thực hiện tại menu "Quản lý kho"
  const titleActions: ITitleActions = { actions: [] };

  const titles = ["STT", "Mã chứng từ", "Loại chứng từ", "Thời gian", "Sản phẩm", "Đối tác", "Kho", "Biến động SL", "Tồn trước", "Tồn sau", "Người thực hiện", "Ref tài chính", "Trạng thái"];
  const dataFormat = ["text-center", "", "text-center", "text-center", "", "", "", "text-center", "text-center", "text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IInventoryLedgerResponse, index: number) => [
    getPageOffset(params) + index + 1,
    <span key={`code-${item.id}`} className="warehouse__code">{item.refCode ?? "—"}</span>,
    renderRefType(item),
    item.createdTime ? moment(item.createdTime).format("DD/MM/YYYY HH:mm") : "—",
    <div key={`product-${item.id}`}>
      <div className="warehouse__product-name">{item.productName ?? "—"}</div>
      <div className="warehouse__product-code">{item.variantSku ?? item.productSku ?? item.batchNo ?? ""}</div>
    </div>,
    item.partnerName ? (
      <div key={`partner-${item.id}`} style={{ minWidth: "120px" }}>
        <div className="warehouse__partner-name">{item.partnerName}</div>
        <div className="warehouse__partner-type">{item.partnerType ?? ""}</div>
      </div>
    ) : "—",
    renderWarehouse(item),
    renderQuantity(item),
    item.prevQuantity ?? 0,
    item.afterQuantity ?? 0,
    item.employeeName ?? "—",
    item.refFinanceCode ?? "—",
    renderStatus(item),
  ];

  return (
    <div className={`page-content page-warehouse-book${isNoItem ? " bg-white" : ""}`}>
      <TitleAction title="Sổ kho" titleActions={titleActions} />

      <div className="card-box d-flex flex-column">
        <div className="warehouse__tabs">
          {REF_TYPE_TABS.map((tab) => (
            <div
              key={tab.value}
              className={`warehouse__tab-item ${params.refType === tab.value ? "active" : ""}`}
              onClick={() => setParams((prev) => ({ ...prev, refType: tab.value, page: 1 }))}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <SearchBox
          name="Tên sản phẩm / mã chứng từ"
          params={params}
          isSaveSearch={false}
          listSaveSearch={listSaveSearch}
          isFilter={true}
          listFilterItem={customerFilterList}
          updateParams={(paramsNew) => setParams(paramsNew)}
        />

        {!isLoading && listWarehouseBook.length > 0 ? (
          <BoxTable
            name="Sổ kho"
            titles={titles}
            items={listWarehouseBook}
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
              <SystemNotification description={<span>Hiện tại chưa có dữ liệu sổ kho nào.</span>} type="no-item" />
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
