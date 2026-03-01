import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
import _ from "lodash";
import Icon from "components/icon";
import Image from "components/image";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { BulkActionItemModel } from "components/bulkAction/bulkAction";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import ProductService from "services/ProductService";
import { getPageOffset } from "reborn-util";

import "./MaterialList.scss";
import AddMaterialModal from "./partials/AddMaterialModal";
import MaterialDetailPanel from "./partials/MaterialDetailPanel";
import QuickStockInModal from "./partials/QuickStockInModal";
import StockInModal from "./partials/StockInModal";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";
import { IMaterialFilterRequest } from "@/model/material/MaterialRequestModel";

type SegmentFilter = "all" | "in_stock" | "low" | "out";

function getMockStock(m: IMaterialResponse) {
  const threshold = m.minQuantity ?? 20;
  const current = ((m.id ?? 0) * 37 + 50) % 200;
  const pct = threshold > 0 ? Math.min(100, (current / threshold) * 100) : 100;
  const status: "ok" | "warn" | "low" | "out" =
    current <= 0 ? "out" : current <= threshold ? "low" : pct < 50 ? "warn" : "ok";
  return { current, threshold, pct, status };
}

const GROUP_BADGE_VARIANT: Record<number, "primary" | "success" | "warning" | "secondary"> = {
  1: "primary",
  2: "success",
  3: "warning",
  4: "secondary",
};

export default function MaterialList() {
  document.title = "Quản lý nguyên vật liệu";

  const isMounted = useRef(false);
  const [listMaterial, setListMaterial] = useState<IMaterialResponse[]>([]);
  const [dataMaterial, setDataMaterial] = useState<IMaterialResponse | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<IMaterialResponse | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showStockInModal, setShowStockInModal] = useState<boolean>(false);
  const [showQuickStockIn, setShowQuickStockIn] = useState<boolean>(false);
  const [quickStockInMaterial, setQuickStockInMaterial] = useState<IMaterialResponse | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [params, setParams] = useState<IMaterialFilterRequest>({
    name: "",
    limit: 10,
    page: 1,
  });

  const [listSaveSearch] = useState<ISaveSearch[]>([
    { key: "all", name: "Nguyên vật liệu", is_active: true },
  ]);

  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Nguyên vật liệu",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((prev) => ({ ...prev, page })),
    chooseSizeLimit: (limit) => setParams((prev) => ({ ...prev, limit })),
  });

  const abortController = useRef(new AbortController());

  const getListMaterial = async (paramsSearch: IMaterialFilterRequest) => {
    setIsLoading(true);
    try {
      const response = await ProductService.list(paramsSearch, abortController.current.signal);
      if (response?.code === 0) {
        const result = response.result;
        setListMaterial(result?.items ?? []);
        setPagination((prev) => ({
          ...prev,
          page: +(result?.page ?? 1),
          sizeLimit: paramsSearch.limit ?? DataPaginationDefault.sizeLimit,
          totalItem: +(result?.total ?? 0),
          totalPage: Math.ceil(+(result?.total ?? 0) / +(paramsSearch.limit ?? DataPaginationDefault.sizeLimit)),
        }));
        if (+(result?.total ?? 0) === 0 && !paramsSearch?.name && +(result?.page ?? 1) === 1) {
          setIsNoItem(true);
        }
      } else if (response?.code === 400) {
        setIsPermissions(true);
      } else if (response) {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setParams((prev) => ({ ...prev, ...params }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    abortController.current = new AbortController();
    getListMaterial(params);
    return () => {
      abortController.current?.abort();
    };
  }, [params]);

  const filteredList = useMemo(() => {
    if (segmentFilter === "all") return listMaterial;
    return listMaterial.filter((m) => {
      const { status } = getMockStock(m);
      if (segmentFilter === "in_stock") return status === "ok" || status === "warn";
      if (segmentFilter === "low") return status === "low";
      if (segmentFilter === "out") return status === "out";
      return true;
    });
  }, [listMaterial, segmentFilter]);

  const stats = useMemo(() => {
    let inStock = 0,
      low = 0,
      out = 0;
    listMaterial.forEach((m) => {
      const { status } = getMockStock(m);
      if (status === "ok" || status === "warn") inStock++;
      else if (status === "low") low++;
      else out++;
    });
    return {
      total: listMaterial.length,
      inStock,
      low,
      out,
      todayCount: 18,
    };
  }, [listMaterial]);

  const titleActions: ITitleActions = {
    actions: [
      {
        title: "Nhập tồn mới",
        color: "primary",
        callback: () => {
          setDataMaterial(null);
          setShowStockInModal(true);
        },
      },
      {
        title: "Thêm nguyên liệu",
        color: "primary",
        callback: () => {
          setDataMaterial(null);
          setShowModalAdd(true);
        },
      },
    ],
  };
 // tạm dựng mock up sau sửa theo api
  const titles = ["STT", "Tên nguyên vật liệu","Nhóm", "Đơn vị", "Tồn kho", "Ngưỡng cảnh báo", "Giá nhập gần nhất", "Nhập gần nhất","" ];

  const dataFormat = ["text-center", "", "", "text-center", "", "text-center", "text-right", "text-center", "text-center"];

  const dataMappingArray = (item: IMaterialResponse, index: number) => {
    const stt = getPageOffset(params) + index + 1;
    const stock = getMockStock(item);
    const unit = item.unitName ?? "kg";
    const categoryId = (item as IMaterialResponse & { categoryId?: number }).categoryId;
    const groupLabel = "Thuốc bôi da liễu";
    const badgeVariant = GROUP_BADGE_VARIANT[categoryId as number] ?? "secondary";
    const stockClass = stock.status === "ok" ? "sn-ok" : stock.status === "warn" ? "sn-warn" : "sn-low";
    const lastImportDate = "20/10/2023";

    return [
      stt,
      <div key="cell-name" className="mat-cell">
        <div className="mat-cell__icon" >
            <Image src={item.avatar} alt="" width="4rem" height="4rem" className="mat-cell__img" />
        </div>
        <div>
          <div className="mat-cell__name">{item.name}</div>
          <div className="mat-cell__code">{item.code ?? "—"}</div>
        </div>
      </div>,
      <Badge key="cell-group" text={groupLabel} variant={badgeVariant} />,
      unit,
      <div key="cell-stock" className="mini-bar">
        <span className={`stock-num ${stockClass}`}>
          {stock.current} {unit}
        </span>
        <div className="mini-bar__bar">
          <div
            className="mini-bar__fill"
            style={{
              width: `${Math.min(100, (stock.current / (stock.threshold || 1)) * 50)}%`,
              background: stock.status === "ok" ? "var(--success-color)" : stock.status === "warn" ? "var(--warning-color)" : "var(--error-color)",
            }}
          />
        </div>
      </div>,
      <span key="cell-threshold" style={{ color: stock.status === "low" || stock.status === "out" ? "var(--error-color)" : "var(--extra-color-50)", fontWeight: stock.status === "low" ? 700 : 400 }}>
        {stock.threshold} {unit}
        {(stock.status === "low" || stock.status === "out") && <Icon name="Warning" className="icon-warning" />}
      </span>,
      <span key="cell-price" style={{ fontWeight: 700 }}>
        {item.price != null ? `${Number(item.price).toLocaleString("vi")} ₫/${unit}` : "—"}
      </span>,
      <span key="cell-date" style={{ fontSize: "1.2rem", color: "var(--extra-color-50)" }}>
        {lastImportDate}
      </span>,
      null,
    ];
  };

  const actionsTable = (item: IMaterialResponse): IAction[] => {
    const isChecked = listIdChecked?.length > 0;
    return [
      {
        title: "Nhập tồn",
        icon: <Icon name="Download" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) {
            setQuickStockInMaterial(item);
            setShowQuickStockIn(true);
          }
        },
      },
      {
        title: "Chi tiết",
        icon: <Icon name="Eye" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) setDetailMaterial(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const response = await ProductService.delete(id);
    if (response.code === 0) {
      showToast("Xóa nguyên vật liệu thành công", "success");
      getListMaterial(params);
      if (detailMaterial?.id === id) setDetailMaterial(null);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
    }
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked ?? [];
    if (!selectedIds.length) return;
    Promise.all(
      selectedIds.map((id) => {
        const found = listMaterial.find((i) => i.id === id);
        return found ? ProductService.delete(found.id) : Promise.resolve(null);
      })
    ).then((results) => {
      const count = results.filter(Boolean)?.length ?? 0;
      if (count > 0) {
        showToast(`Xóa thành công ${count} nguyên vật liệu`, "success");
        getListMaterial(params);
        setListIdChecked([]);
        setDetailMaterial(null);
      } else {
        showToast("Không có nguyên vật liệu nào được xóa", "error");
      }
      setShowDialog(false);
      setContentDialog(null);
    });
  };

  const showDialogConfirmDelete = (item?: IMaterialResponse) => {
    setContentDialog({
      color: "error",
      className: "dialog-delete",
      isCentered: true,
      isLoading: true,
      title: "Xóa nguyên vật liệu",
      message: (
        <Fragment>
          Bạn có chắc chắn muốn xóa {item ? "nguyên vật liệu " : `${listIdChecked?.length ?? 0} nguyên vật liệu đã chọn`}
          {item ? <strong> {item.name}</strong> : ""}? Thao tác này không thể khôi phục.
        </Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => {
        setShowDialog(false);
        setContentDialog(null);
      },
      defaultText: "Xóa",
      defaultAction: () => {
        if (item?.id) onDelete(item.id);
        else if (listIdChecked?.length) onDeleteAll();
      },
    });
    setShowDialog(true);
  };

  const bulkActionList: BulkActionItemModel[] = [
    { title: "Xóa nguyên vật liệu", callback: () => showDialogConfirmDelete() },
  ];

  return (
    <div className={`page-content page-material-list${isNoItem ? " bg-white" : ""}`}>
      <div className="action-navigation">
        <div className="action-backup">
          <h1>Quản lý Nguyên vật liệu</h1>
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      <div className="card-box material-list-card">
        <SearchBox
          name="Tên nguyên vật liệu"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(paramsNew) => setParams(paramsNew)}
          placeholderSearch="Tìm tên hoặc mã nguyên liệu..."
        />

        <div className="material-list-toolbar">
          <div className="material-list-seg">
            <button
              type="button"
              className={`material-list-segb ${segmentFilter === "all" ? "active" : ""}`}
              onClick={() => setSegmentFilter("all")}
            >
              Tất cả ({listMaterial.length})
            </button>
            <button
              type="button"
              className={`material-list-segb ${segmentFilter === "in_stock" ? "active" : ""}`}
              onClick={() => setSegmentFilter("in_stock")}
            >
              Còn hàng ({stats.inStock})
            </button>
            <button
              type="button"
              className={`material-list-segb ${segmentFilter === "low" ? "active" : ""}`}
              onClick={() => setSegmentFilter("low")}
            >
              Sắp hết ({stats.low})
            </button>
            <button
              type="button"
              className={`material-list-segb ${segmentFilter === "out" ? "active" : ""}`}
              onClick={() => setSegmentFilter("out")}
            >
              Hết hàng ({stats.out})
            </button>
          </div>
        </div>

        <div className="material-list-body">
          <div className={`material-list-table-wrap${detailMaterial ? " has-detail" : ""}`}>
            {!isLoading && filteredList?.length > 0 ? (
              <BoxTable
                name="Nguyên vật liệu"
                titles={titles}
                items={filteredList}
                isPagination={true}
                dataPagination={pagination}
                dataMappingArray={dataMappingArray}
                dataFormat={dataFormat}
                isBulkAction={true}
                listIdChecked={listIdChecked}
                bulkActionItems={bulkActionList}
                striped={true}
                setListIdChecked={setListIdChecked}
                actions={actionsTable}
                actionType="inline"
                onClickRow={(row: IMaterialResponse) => setDetailMaterial(row)}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <Fragment>
                {isPermissions ? (
                  <SystemNotification type="no-permission" />
                ) : isNoItem ? (
                  <SystemNotification
                    description={
                      <span>
                        Hiện tại chưa có nguyên vật liệu nào.
                        <br />
                        Hãy thêm mới nguyên vật liệu đầu tiên nhé!
                      </span>
                    }
                    type="no-item"
                    titleButton="Thêm mới nguyên vật liệu"
                    action={() => {
                      setDataMaterial(null);
                      setShowModalAdd(true);
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

          <div className={`material-list-detail-panel${detailMaterial ? "" : " hidden"}`}>
            {detailMaterial && (
              <MaterialDetailPanel
                material={detailMaterial}
                onClose={() => setDetailMaterial(null)}
                onStockIn={() => {
                  setQuickStockInMaterial(detailMaterial);
                  setShowQuickStockIn(true);
                }}
                onEdit={() => {
                  setDataMaterial(detailMaterial);
                  setShowModalAdd(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <AddMaterialModal
        onShow={showModalAdd}
        data={dataMaterial}
        idMaterial={dataMaterial?.id ?? 0}
        onHide={(reload) => {
          if (reload) getListMaterial(params);
          setShowModalAdd(false);
          if (detailMaterial && dataMaterial?.id === detailMaterial.id) setDetailMaterial(dataMaterial);
        }}
      />
      <QuickStockInModal
        isOpen={showQuickStockIn}
        material={quickStockInMaterial}
        onClose={() => {
          setShowQuickStockIn(false);
          setQuickStockInMaterial(null);
        }}
        onSuccess={() => getListMaterial(params)}
      />
      <StockInModal
        isOpen={showStockInModal}
        materialList={listMaterial}
        initialMaterial={null}
        onClose={() => setShowStockInModal(false)}
        onSuccess={() => getListMaterial(params)}
      />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
