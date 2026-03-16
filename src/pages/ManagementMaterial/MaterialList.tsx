import React, { Fragment, useState, useEffect, useRef, useMemo } from "react";
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
import { getPageOffset } from "reborn-util";

import "./MaterialList.scss";
import AddMaterialModal from "./partials/AddMaterialModal";
import MaterialDetailPanel from "./partials/MaterialDetailPanel";
import QuickStockInModal from "./partials/QuickStockInModal";
import { IMaterialResponse } from "@/model/material/MaterialResponseModel";
import { IMaterialFilterRequest } from "@/model/material/MaterialRequestModel";
import { MOCK_MATERIAL_LIST, MOCK_BOM_LIST, CATEGORY_BADGE_VARIANT } from "@/assets/mock/Material";
import { IBomResponse } from "@/model/material/BomModel";

type SegmentFilter = "all" | "in_stock" | "low" | "out";

// ── Self-contained BOM chip component ─────────────────────────
function MaterialBomChips({ boms }: { boms: IBomResponse[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (boms.length === 0) return null;

  if (boms.length === 1) {
    return (
      <div className="mat-bom-chips">
        <span className="mat-bom-chip">
          <Icon name="FileText" />
          {boms[0].code}
          <span className="mat-bom-chip__name">{boms[0].productName}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="mat-bom-chips">
      <div
        className="mat-bom-dropdown-wrap"
        ref={wrapRef}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`mat-bom-chip mat-bom-chip--multi${isOpen ? " active" : ""}`}
          onClick={() => setIsOpen((v) => !v)}
        >
          <Icon name="FileText" />
          {boms.length} công thức
          <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} />
        </span>
        {isOpen && (
          <div className="mat-bom-dropdown">
            {boms.map((bom) => (
              <div key={bom.id} className="mat-bom-dropdown__item">
                <span className="mat-bom-dropdown__code">{bom.code}</span>
                <span className="mat-bom-dropdown__name">{bom.productName}</span>
                <span className={`mat-bom-dropdown__status mat-bom-dropdown__status--${bom.status}`}>
                  {bom.status === "active" ? "Đang dùng" : bom.status === "draft" ? "Nháp" : "Dừng"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface MaterialListProps {
  onBackProps?: (isBack: boolean) => void;
}

export default function MaterialList({ onBackProps }: MaterialListProps = {}) {
  document.title = "Nguyên vật liệu";

  const isMounted = useRef(false);
  const [listMaterial, setListMaterial] = useState<IMaterialResponse[]>([]);
  const [dataMaterial, setDataMaterial] = useState<IMaterialResponse | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<IMaterialResponse | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [showQuickStockIn, setShowQuickStockIn] = useState<boolean>(false);
  const [quickStockInMaterial, setQuickStockInMaterial] = useState<IMaterialResponse | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
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

  const getListMaterial = (paramsSearch: IMaterialFilterRequest) => {
    setIsLoading(true);
    setTimeout(() => {
      let data = [...MOCK_MATERIAL_LIST];
      if (paramsSearch.name) {
        const q = paramsSearch.name.toLowerCase();
        data = data.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            (m.code ?? "").toLowerCase().includes(q)
        );
      }
      const total = data.length;
      const page = paramsSearch.page ?? 1;
      const limit = paramsSearch.limit ?? 10;
      const start = (page - 1) * limit;
      const paged = data.slice(start, start + limit);

      setListMaterial(paged);
      setPagination((prev) => ({
        ...prev,
        page,
        sizeLimit: limit,
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      }));
      setIsNoItem(total === 0 && !paramsSearch.name);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    setParams((prev) => ({ ...prev }));
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    getListMaterial(params);
  }, [params]);

  // Stats use all mock data (not paged) for accurate counts
  const allData = useMemo(() => {
    const q = (params.name ?? "").toLowerCase();
    if (!q) return MOCK_MATERIAL_LIST;
    return MOCK_MATERIAL_LIST.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.code ?? "").toLowerCase().includes(q)
    );
  }, [params.name]);

  // Build a lookup: materialId → BOMs that contain it
  const materialBomMap = useMemo(() => {
    const map: Record<number, IBomResponse[]> = {};
    MOCK_BOM_LIST.forEach((bom) => {
      bom.ingredients.forEach((ing) => {
        if (!map[ing.materialId]) map[ing.materialId] = [];
        map[ing.materialId].push(bom);
      });
    });
    return map;
  }, []);

  const stats = useMemo(() => {
    let inStock = 0, low = 0, out = 0;
    allData.forEach((m) => {
      if (m.stockStatus === "ok") inStock++;
      else if (m.stockStatus === "low") low++;
      else if (m.stockStatus === "out") out++;
    });
    const categories = new Set(allData.map((m) => m.categoryName).filter(Boolean));
    return { total: allData.length, inStock, low, out, categoryCount: categories.size };
  }, [allData]);

  const filteredList = useMemo(() => {
    if (segmentFilter === "all") return listMaterial;
    return listMaterial.filter((m) => {
      if (segmentFilter === "in_stock") return m.stockStatus === "ok";
      if (segmentFilter === "low") return m.stockStatus === "low";
      if (segmentFilter === "out") return m.stockStatus === "out";
      return true;
    });
  }, [listMaterial, segmentFilter]);

  const titleActions: ITitleActions = {
    actions_extra: [
      {
        title: "Xuất Excel",
        callback: () => {
          showToast("Tính năng xuất Excel đang được phát triển", "info");
        },
      },
    ],
    actions: [
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

  const titles = [
    "STT",
    "Mã NVL",
    "Tên NVL",
    "Danh mục",
    "Đơn vị",
    "Nhà cung cấp",
    "Đơn giá (VNĐ)",
    "Tồn kho",
    "Min / Max",
    "Mức tồn",
    "Trạng thái",
    "",
  ];

  const dataFormat = [
    "text-center",
    "",
    "",
    "",
    "text-center",
    "",
    "text-right",
    "text-center",
    "text-center",
    "",
    "text-center",
    "text-center",
  ];

  const dataMappingArray = (item: IMaterialResponse, index: number) => {
    const stt = getPageOffset(params) + index + 1;
    const unit = item.unitName ?? "—";
    const categoryVariant = CATEGORY_BADGE_VARIANT[item.categoryName ?? ""] ?? "secondary";
    const boms = materialBomMap[item.id] ?? [];
    const stockCurrent = item.stockCurrent ?? 0;
    const maxQty = item.maxQuantity ?? 0;
    const minQty = item.minQuantity ?? 0;
    const pct = maxQty > 0 ? Math.min(100, Math.round((stockCurrent / maxQty) * 100)) : 0;

    const barColor =
      item.stockStatus === "ok"
        ? "var(--success-color)"
        : item.stockStatus === "low"
        ? "var(--warning-color)"
        : "var(--error-color)";

    const stockClass =
      item.stockStatus === "ok"
        ? "sn-ok"
        : item.stockStatus === "low"
        ? "sn-warn"
        : "sn-low";

    const statusLabel =
      item.stockStatus === "ok"
        ? "Đủ hàng"
        : item.stockStatus === "low"
        ? "Sắp hết"
        : "Hết hàng";

    const statusVariant =
      item.stockStatus === "ok"
        ? "success"
        : item.stockStatus === "low"
        ? "warning"
        : "error";

    return [
      stt,
      <span key="cell-code" className="mat-cell__code-col">{item.code ?? "—"}</span>,
      <div key="cell-name" className="mat-cell">
        <div className="mat-cell__icon">
          <Image src={item.avatar} alt="" width="4rem" height="4rem" className="mat-cell__img" />
        </div>
        <div>
          <div className="mat-cell__name">{item.name}</div>
          <MaterialBomChips boms={boms} />
        </div>
      </div>,
      <Badge key="cell-cat" text={item.categoryName ?? "—"} variant={categoryVariant} />,
      unit,
      <span key="cell-sup" className="mat-cell__supplier">{item.supplier ?? "—"}</span>,
      <span key="cell-price" style={{ fontWeight: 700 }}>
        {item.price != null ? Number(item.price).toLocaleString("vi") : "—"}
      </span>,
      <span key="cell-stock" className={`stock-num ${stockClass}`}>
        {stockCurrent.toLocaleString("vi")} {unit}
      </span>,
      <span key="cell-minmax" style={{ fontSize: "1.2rem", color: "var(--extra-color-50)" }}>
        {minQty} / {maxQty}
      </span>,
      <div key="cell-bar" className="mat-stock-bar">
        <div className="mat-stock-bar__track">
          <div
            className="mat-stock-bar__fill"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <span className="mat-stock-bar__pct">{pct}%</span>
      </div>,
      <Badge key="cell-status" text={statusLabel} variant={statusVariant as any} />,
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
        title: "Sửa",
        icon: <Icon name="Edit" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) {
            setDataMaterial(item);
            setShowModalAdd(true);
          }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) showDialogConfirmDelete(item);
        },
      },
    ];
  };

  const onDelete = async (id: number) => {
    showToast("Xóa nguyên vật liệu thành công", "success");
    setListMaterial((prev) => prev.filter((m) => m.id !== id));
    if (detailMaterial?.id === id) setDetailMaterial(null);
    setShowDialog(false);
    setContentDialog(null);
  };

  const onDeleteAll = () => {
    const selectedIds = listIdChecked ?? [];
    if (!selectedIds.length) return;
    setListMaterial((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
    showToast(`Xóa thành công ${selectedIds.length} nguyên vật liệu`, "success");
    setListIdChecked([]);
    setDetailMaterial(null);
    setShowDialog(false);
    setContentDialog(null);
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
          Bạn có chắc chắn muốn xóa{" "}
          {item ? "nguyên vật liệu " : `${listIdChecked?.length ?? 0} nguyên vật liệu đã chọn`}
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
      {/* ── HEADER ── */}
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (
            <>
              <h1 className="title-first" onClick={() => onBackProps(true)} title="Quay lại">
                Nguyên vật liệu
              </h1>
              <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
              <h1 className="title-last">Danh sách nguyên vật liệu</h1>
            </>
          ) : (
            <h1 className="title-last" style={{ color: "var(--text-primary-color)" }}>
              Quản lý Nguyên vật liệu
            </h1>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="mat-stat-row">
        <div className="mat-stat-card">
          <div className="mat-stat-card__icon mat-stat-card__icon--blue">📦</div>
          <div>
            <div className="mat-stat-card__val">{stats.total}</div>
            <div className="mat-stat-card__lbl">Tổng NVL</div>
          </div>
        </div>
        <div className="mat-stat-card">
          <div className="mat-stat-card__icon mat-stat-card__icon--green">✅</div>
          <div>
            <div className="mat-stat-card__val mat-stat-card__val--green">{stats.inStock}</div>
            <div className="mat-stat-card__lbl">Đủ hàng</div>
          </div>
        </div>
        <div className="mat-stat-card">
          <div className="mat-stat-card__icon mat-stat-card__icon--amber">⚠️</div>
          <div>
            <div className="mat-stat-card__val mat-stat-card__val--amber">{stats.low}</div>
            <div className="mat-stat-card__lbl">Sắp hết</div>
          </div>
        </div>
        <div className="mat-stat-card">
          <div className="mat-stat-card__icon mat-stat-card__icon--teal">🗂️</div>
          <div>
            <div className="mat-stat-card__val">{stats.categoryCount}</div>
            <div className="mat-stat-card__lbl">Danh mục</div>
          </div>
        </div>
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
              Tất cả ({allData.length})
            </button>
            <button
              type="button"
              className={`material-list-segb ${segmentFilter === "in_stock" ? "active" : ""}`}
              onClick={() => setSegmentFilter("in_stock")}
            >
              Đủ hàng ({stats.inStock})
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
                {isNoItem ? (
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
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
