import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { IMaterialResponse, IMaterialSummaryResponse } from "@/model/material/MaterialResponseModel";
import { IMaterialFilterRequest } from "@/model/material/MaterialRequestModel";
import { CATEGORY_BADGE_VARIANT, MOCK_MATERIAL_LIST } from "@/assets/mock/Material";
import { IBomResponse } from "@/model/material/BomModel";
import MaterialService from "@/services/MaterialService";

type SegmentFilter = "all" | "in_stock" | "low" | "out";

// ── BOM chip component ────────────────────────────────────────
function MaterialBomChips({ boms }: { boms: IBomResponse[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!boms || boms.length === 0) return null;

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
      <div className="mat-bom-dropdown-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
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

  const abortRef = useRef<AbortController | null>(null);
  const [listMaterial, setListMaterial] = useState<IMaterialResponse[]>(MOCK_MATERIAL_LIST);
  const [summary, setSummary] = useState<IMaterialSummaryResponse>({
    total: MOCK_MATERIAL_LIST.length,
    inStock: MOCK_MATERIAL_LIST.filter((m) => m.stockStatus === "ok").length,
    low: MOCK_MATERIAL_LIST.filter((m) => m.stockStatus === "low").length,
    out: MOCK_MATERIAL_LIST.filter((m) => m.stockStatus === "out").length,
    categoryCount: new Set(MOCK_MATERIAL_LIST.map((m) => m.categoryName).filter(Boolean)).size,
  });
  const [dataMaterial, setDataMaterial] = useState<IMaterialResponse | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<IMaterialResponse | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [showQuickStockIn, setShowQuickStockIn] = useState(false);
  const [quickStockInMaterial, setQuickStockInMaterial] = useState<IMaterialResponse | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoItem, setIsNoItem] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [params, setParams] = useState<IMaterialFilterRequest>({ keyword: "", limit: 10, page: 1 });
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

  const fetchSummary = useCallback(() => {
    MaterialService.summary()
      .then((res) => { if (res?.code === 0 && res.result) setSummary(res.result); })
      .catch(() => {});
  }, []);

  const getListMaterial = useCallback((p: IMaterialFilterRequest) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    MaterialService.list(p, abortRef.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result) {
          const { items, total, page, size } = res.result;
          setListMaterial(items?.length > 0 ? items : []);
          setIsNoItem(!items?.length && !p.keyword);
          setPagination((prev) => ({
            ...prev,
            page: page ?? p.page,
            sizeLimit: size ?? p.limit,
            totalItem: total ?? 0,
            totalPage: Math.ceil((total ?? 0) / (size ?? p.limit ?? 10)),
          }));
        } else {
          // Fallback to mock for dev
          const mock = MOCK_MATERIAL_LIST;
          setListMaterial(mock);
          setPagination((prev) => ({ ...prev, totalItem: mock.length, totalPage: 1 }));
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          const mock = MOCK_MATERIAL_LIST;
          setListMaterial(mock);
          setPagination((prev) => ({ ...prev, totalItem: mock.length, totalPage: 1 }));
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchSummary();
    getListMaterial(params);
  }, []);

  useEffect(() => {
    getListMaterial(params);
  }, [params]);

  const filteredList = useMemo(() => {
    if (segmentFilter === "all") return listMaterial;
    return listMaterial.filter((m) => {
      if (segmentFilter === "in_stock") return m.stockStatus === "ok";
      if (segmentFilter === "low")      return m.stockStatus === "low";
      if (segmentFilter === "out")      return m.stockStatus === "out";
      return true;
    });
  }, [listMaterial, segmentFilter]);

  const titleActions: ITitleActions = {
    actions_extra: [
      { title: "Xuất Excel", callback: () => showToast("Tính năng xuất Excel đang được phát triển", "info") },
    ],
    actions: [
      {
        title: "Thêm nguyên liệu",
        color: "primary",
        callback: () => { setDataMaterial(null); setShowModalAdd(true); },
      },
    ],
  };

  const titles = ["STT", "Mã NVL", "Tên NVL", "Danh mục", "Đơn vị", "Nhà cung cấp",
    "Đơn giá (VNĐ)", "Tồn kho", "Min / Max", "Mức tồn", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "", "text-center", "", "text-right",
    "text-center", "text-center", "", "text-center", "text-center"];

  const dataMappingArray = (item: IMaterialResponse, index: number) => {
    const stt         = getPageOffset(params) + index + 1;
    const unit        = item.unitName ?? "—";
    const catVariant  = CATEGORY_BADGE_VARIANT[item.categoryName ?? ""] ?? "secondary";
    const stockCurrent = item.stockCurrent ?? 0;
    const maxQty      = item.maxQuantity  ?? 0;
    const minQty      = item.minQuantity  ?? 0;
    const pct         = maxQty > 0 ? Math.min(100, Math.round((stockCurrent / maxQty) * 100)) : 0;
    const barColor    = item.stockStatus === "ok" ? "var(--success-color)"
                      : item.stockStatus === "low" ? "var(--warning-color)" : "var(--error-color)";
    const stockClass  = item.stockStatus === "ok" ? "sn-ok"
                      : item.stockStatus === "low" ? "sn-warn" : "sn-low";
    const statusLabel = item.stockStatus === "ok" ? "Đủ hàng"
                      : item.stockStatus === "low" ? "Sắp hết" : "Hết hàng";
    const statusVariant = item.stockStatus === "ok" ? "success"
                        : item.stockStatus === "low" ? "warning" : "error";

    return [
      stt,
      <span key="code" className="mat-cell__code-col">{item.code ?? "—"}</span>,
      <div key="name" className="mat-cell">
        <div className="mat-cell__icon">
          <Image src={item.avatar} alt="" width="4rem" height="4rem" className="mat-cell__img" />
        </div>
        <div>
          <div className="mat-cell__name">{item.name}</div>
        </div>
      </div>,
      <Badge key="cat" text={item.categoryName ?? "—"} variant={catVariant} />,
      unit,
      <span key="sup" className="mat-cell__supplier">{item.supplierName ?? item.supplier ?? "—"}</span>,
      <span key="price" style={{ fontWeight: 700 }}>
        {item.price != null ? Number(item.price).toLocaleString("vi") : "—"}
      </span>,
      <span key="stock" className={`stock-num ${stockClass}`}>
        {stockCurrent.toLocaleString("vi")} {unit}
      </span>,
      <span key="minmax" style={{ fontSize: "1.2rem", color: "var(--extra-color-50)" }}>
        {minQty} / {maxQty}
      </span>,
      <div key="bar" className="mat-stock-bar">
        <div className="mat-stock-bar__track">
          <div className="mat-stock-bar__fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <span className="mat-stock-bar__pct">{pct}%</span>
      </div>,
      <Badge key="status" text={statusLabel} variant={statusVariant as any} />,
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
          if (!isChecked) { setQuickStockInMaterial(item); setShowQuickStockIn(true); }
        },
      },
      {
        title: "Sửa",
        icon: <Icon name="Edit" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => {
          if (!isChecked) { setDataMaterial(item); setShowModalAdd(true); }
        },
      },
      {
        title: "Xóa",
        icon: <Icon name="Trash" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) showDialogConfirmDelete(item); },
      },
    ];
  };

  const onDelete = async (id: number) => {
    const res = await MaterialService.delete(id);
    if (res?.code === 0) {
      showToast("Xóa nguyên vật liệu thành công", "success");
      if (detailMaterial?.id === id) setDetailMaterial(null);
      getListMaterial(params);
      fetchSummary();
    } else {
      showToast(res?.message ?? "Có lỗi xảy ra", "error");
    }
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
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: () => { if (item?.id) onDelete(item.id); },
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
              <h1 className="title-first" onClick={() => onBackProps(true)}>Nguyên vật liệu</h1>
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
        {[
          { icon: "📦", val: summary.total,         lbl: "Tổng NVL",   cls: "blue" },
          { icon: "✅", val: summary.inStock,        lbl: "Đủ hàng",    cls: "green" },
          { icon: "⚠️", val: summary.low,            lbl: "Sắp hết",    cls: "amber" },
          { icon: "🗂️", val: summary.categoryCount,  lbl: "Danh mục",   cls: "teal" },
        ].map((card, i) => (
          <div key={i} className="mat-stat-card">
            <div className={`mat-stat-card__icon mat-stat-card__icon--${card.cls}`}>{card.icon}</div>
            <div>
              <div className={`mat-stat-card__val${card.cls !== "blue" && card.cls !== "teal" ? ` mat-stat-card__val--${card.cls}` : ""}`}>
                {card.val}
              </div>
              <div className="mat-stat-card__lbl">{card.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-box material-list-card">
        <SearchBox
          name="Tên nguyên vật liệu"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(p) => setParams(p)}
          placeholderSearch="Tìm tên hoặc mã nguyên liệu..."
        />

        <div className="material-list-toolbar">
          <div className="material-list-seg">
            {([
              { key: "all",      label: "Tất cả",   count: summary.total },
              { key: "in_stock", label: "Đủ hàng",  count: summary.inStock },
              { key: "low",      label: "Sắp hết",  count: summary.low },
              { key: "out",      label: "Hết hàng", count: summary.out },
            ] as { key: SegmentFilter; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`material-list-segb ${segmentFilter === tab.key ? "active" : ""}`}
                onClick={() => setSegmentFilter(tab.key)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
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
                    description={<span>Hiện tại chưa có nguyên vật liệu nào.<br />Hãy thêm mới nguyên vật liệu đầu tiên nhé!</span>}
                    type="no-item"
                    titleButton="Thêm mới nguyên vật liệu"
                    action={() => { setDataMaterial(null); setShowModalAdd(true); }}
                  />
                ) : (
                  <SystemNotification
                    description={<span>Không có dữ liệu trùng khớp.<br />Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!</span>}
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
                onStockIn={() => { setQuickStockInMaterial(detailMaterial); setShowQuickStockIn(true); }}
                onEdit={() => { setDataMaterial(detailMaterial); setShowModalAdd(true); }}
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
          if (reload) { getListMaterial(params); fetchSummary(); }
          setShowModalAdd(false);
        }}
      />

      <QuickStockInModal
        isOpen={showQuickStockIn}
        material={quickStockInMaterial}
        onClose={() => { setShowQuickStockIn(false); setQuickStockInMaterial(null); }}
        onSuccess={() => { getListMaterial(params); fetchSummary(); }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}