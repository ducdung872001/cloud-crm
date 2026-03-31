import React, { Fragment, useState, useMemo, useEffect, useRef, useCallback } from "react";
import Icon from "components/icon";
import Button from "components/button/button";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { IBomResponse, IBomSummaryResponse } from "@/model/material/BomModel";
import { BomService } from "@/services/MaterialService";
import AddBomModal from "./AddBomModal";
import "./MaterialBomPage.scss";

type BomSegment = "all" | "active" | "draft" | "inactive";

const SEGMENT_STATUS: Record<BomSegment, number | undefined> = {
  all: undefined, active: 1, draft: 2, inactive: 3,
};
const STATUS_LABEL: Record<number, string> = { 1: "Đang sử dụng", 2: "Bản nháp", 3: "Ngừng dùng" };
const STATUS_VARIANT: Record<number, "success" | "warning" | "secondary"> = {
  1: "success", 2: "warning", 3: "secondary",
};

// ── BOM Detail Panel ──────────────────────────────────────────
function BomDetailPanel({ bom, onClose, onEdit }: {
  bom: IBomResponse; onClose: () => void;
  onEdit: (b: IBomResponse) => void;
}) {
  const [fullData, setFullData] = useState<IBomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    BomService.get(bom.id)
      .then((res) => { if (res?.code === 0) setFullData(res.result); })
      .catch(() => setFullData(bom))
      .finally(() => setIsLoading(false));
  }, [bom.id]);

  const data = fullData ?? bom;

  return (
    <div className="bom-detail-panel">
      <div className="bom-detail-panel__header">
        <button type="button" className="bom-detail-panel__close" onClick={onClose}>✕</button>
        <div className="bom-detail-panel__code">{data.code}</div>
        <div className="bom-detail-panel__name">{data.productName}</div>
        <div className="bom-detail-panel__meta">
          <Badge text={STATUS_LABEL[data.status] ?? "—"} variant={STATUS_VARIANT[data.status] ?? "secondary"} />
          <span className="bom-detail-panel__ver">{data.version}</span>
        </div>
      </div>

      <div className="bom-detail-panel__qs">
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v">
            {(data.outputQty ?? 0).toLocaleString("vi")}
          </div>
          <div className="bom-detail-panel__qs-l">Sản lượng/mẻ</div>
        </div>
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v">{data.outputUnit ?? "—"}</div>
          <div className="bom-detail-panel__qs-l">Đơn vị</div>
        </div>
        <div className="bom-detail-panel__qs-i">
          <div className="bom-detail-panel__qs-v" style={{ color: "var(--primary-color)" }}>
            {data.ingredientCount ?? data.ingredients?.length ?? 0}
          </div>
          <div className="bom-detail-panel__qs-l">Nguyên liệu</div>
        </div>
      </div>

      <div className="bom-detail-panel__section-title">Danh sách nguyên liệu</div>

      {isLoading ? (
        <Loading />
      ) : (data.ingredients?.length ?? 0) > 0 ? (
        <div className="bom-detail-panel__ingredients">
          {data.ingredients!.map((ing, i) => (
            <div key={ing.materialId ?? i} className="bom-ing-row">
              <div className="bom-ing-row__idx">{i + 1}</div>
              <div className="bom-ing-row__body">
                <div className="bom-ing-row__name">{ing.materialName}</div>
                <div className="bom-ing-row__code">{ing.materialCode ?? ""}</div>
              </div>
              <div className="bom-ing-row__qty">
                <span className="bom-ing-row__qty-val">{ing.quantity}</span>
                <span className="bom-ing-row__qty-unit">{ing.unitName}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bom-detail-panel__empty">Chưa có nguyên liệu nào</div>
      )}

      {data.note && (
        <div className="bom-detail-panel__note">
          <Icon name="Info" /><span>{data.note}</span>
        </div>
      )}

      <div className="bom-detail-panel__dates">
        {data.createdTime && <span>Tạo: {data.createdTime}</span>}
        {data.updatedTime && <span>Cập nhật: {data.updatedTime}</span>}
      </div>

      <div className="bom-detail-panel__actions">
        <button className="bom-detail-panel__btn bom-detail-panel__btn--outline" onClick={() => onEdit(data)}>
          <Icon name="Edit" /> Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
interface Props { onBackProps?: (isBack: boolean) => void; }

export default function MaterialBomPage({ onBackProps }: Props) {
  document.title = "Công thức (BOM)";

  const abortRef = useRef<AbortController | null>(null);
  const [list, setList]             = useState<IBomResponse[]>([]);
  const [detailBom, setDetailBom]   = useState<IBomResponse | null>(null);
  const [editBom, setEditBom]       = useState<IBomResponse | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [segment, setSegment]       = useState<BomSegment>("all");
  const [params, setParams]         = useState({ keyword: "", limit: 10, page: 1, status: undefined as number | undefined });
  const [listSaveSearch]            = useState<ISaveSearch[]>([{ key: "all", name: "Công thức BOM", is_active: true }]);
  const [summary, setSummary]       = useState<IBomSummaryResponse>({ total: 0, active: 0, draft: 0, inactive: 0 });
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Công thức",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit })),
  });

  const fetchSummary = useCallback(() => {
    BomService.summary()
      .then((res) => { if (res?.code === 0 && res.result) setSummary(res.result); })
      .catch(() => {});
  }, []);

  const fetchList = useCallback((p: typeof params) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    BomService.list({ status: p.status, keyword: p.keyword, page: p.page, limit: p.limit },
      abortRef.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result) {
          const { items, total, page, size } = res.result;
          setList(items ?? []);
          setPagination((prev) => ({
            ...prev, page: page ?? p.page, sizeLimit: size ?? p.limit,
            totalItem: total ?? 0, totalPage: Math.ceil((total ?? 0) / (size ?? p.limit)),
          }));
        } else {
          setList([]);
        }
      })
      .catch((err) => { if (err?.name !== "AbortError") setList([]); })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchSummary(); fetchList(params); }, []);
  useEffect(() => { fetchList(params); }, [params]);

  const handleDelete = (item: IBomResponse) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: "Xóa công thức",
      message: (
        <Fragment>Bạn có chắc chắn muốn xóa công thức <strong>{item.productName}</strong>?</Fragment>
      ),
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xóa",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await BomService.delete(item.id);
        if (res?.code === 0) {
          showToast("Xóa công thức thành công", "success");
          if (detailBom?.id === item.id) setDetailBom(null);
          fetchList(params); fetchSummary();
        } else {
          showToast(res?.message ?? "Có lỗi xảy ra", "error");
        }
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const titles = ["STT", "Mã CT", "Tên thành phẩm", "Số NVL", "Sản lượng / mẻ", "Phiên bản", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "text-center", "text-center", "text-center", "text-center", "text-center"];

  const dataMappingArray = (item: IBomResponse, index: number) => {
    const stt = (params.page - 1) * params.limit + index + 1;
    return [
      stt,
      <span key="code" className="bom-code-col">{item.code}</span>,
      <div key="name" className="bom-name-cell">
        <div className="bom-name-cell__name">{item.productName}</div>
        {item.note && <div className="bom-name-cell__note">{item.note}</div>}
      </div>,
      <span key="ing" className="bom-ing-count">
        {item.ingredientCount ?? 0} NVL
      </span>,
      <span key="out">{(item.outputQty ?? 0).toLocaleString("vi")} {item.outputUnit ?? ""}</span>,
      <span key="ver" className="bom-ver-badge">{item.version}</span>,
      <Badge key="status" text={STATUS_LABEL[item.status] ?? "—"}
        variant={STATUS_VARIANT[item.status] ?? "secondary"} />,
      null,
    ];
  };

  const actionsTable = (item: IBomResponse): IAction[] => {
    const isChecked = listIdChecked?.length > 0;
    return [
      {
        title: "Chi tiết", icon: <Icon name="Eye" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) setDetailBom(item); },
      },
      {
        title: "Sửa", icon: <Icon name="Edit" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) { setEditBom(item); setShowAdd(true); } },
      },
      {
        title: "Ngừng dùng", icon: <Icon name="PauseCircle" className={isChecked ? "icon-disabled" : ""} />,
        disabled: isChecked || item.status === 3,
        callback: () => {
          if (!isChecked) {
            BomService.updateStatus(item.id, 3).then((res) => {
              if (res?.code === 0) { showToast("Đã ngừng sử dụng công thức", "success"); fetchList(params); }
            });
          }
        },
      },
      {
        title: "Xóa", icon: <Icon name="Trash" className={isChecked ? "icon-disabled" : "icon-error"} />,
        disabled: isChecked,
        callback: () => { if (!isChecked) handleDelete(item); },
      },
    ];
  };

  return (
    <div className="page-content page-bom-list">
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (
            <>
              <h1 className="title-first" onClick={() => onBackProps(true)}>Nguyên vật liệu</h1>
              <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
              <h1 className="title-last">Công thức (BOM)</h1>
            </>
          ) : (
            <h1 className="title-last">Công thức (BOM)</h1>
          )}
        </div>
        <Button type="button" color="primary"
          onClick={() => { setEditBom(null); setShowAdd(true); }}>
          Thêm công thức
        </Button>
      </div>

      {/* STAT CARDS */}
      <div className="bom-stat-row">
        {[
          { icon: "🧪", val: summary.total,    lbl: "Tổng công thức",   cls: "blue" },
          { icon: "✅", val: summary.active,   lbl: "Đang sử dụng",     cls: "green" },
          { icon: "📝", val: summary.draft,    lbl: "Bản nháp",         cls: "amber" },
          { icon: "🚫", val: summary.inactive, lbl: "Ngừng dùng",       cls: "grey" },
        ].map((c, i) => (
          <div key={i} className="bom-stat-card">
            <div className={`bom-stat-card__icon bom-stat-card__icon--${c.cls}`}>{c.icon}</div>
            <div>
              <div className="bom-stat-card__val">{c.val}</div>
              <div className="bom-stat-card__lbl">{c.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-box bom-list-card">
        <SearchBox
          name="Công thức BOM" params={params} isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(p) => setParams(p)}
          placeholderSearch="Tìm tên thành phẩm hoặc mã công thức..."
        />

        <div className="bom-list-toolbar">
          <div className="bom-list-seg">
            {([
              { key: "all",      label: "Tất cả",      count: summary.total },
              { key: "active",   label: "Đang dùng",   count: summary.active },
              { key: "draft",    label: "Bản nháp",    count: summary.draft },
              { key: "inactive", label: "Ngừng dùng",  count: summary.inactive },
            ] as { key: BomSegment; label: string; count: number }[]).map((tab) => (
              <button key={tab.key} type="button"
                className={`bom-list-segb ${segment === tab.key ? "active" : ""}`}
                onClick={() => {
                  setSegment(tab.key);
                  setParams((p) => ({ ...p, page: 1, status: SEGMENT_STATUS[tab.key] }));
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div className="bom-list-body">
          <div className={`bom-list-table-wrap${detailBom ? " has-detail" : ""}`}>
            {!isLoading && list.length > 0 ? (
              <BoxTable
                name="Công thức BOM" titles={titles} items={list}
                isPagination={true} dataPagination={pagination}
                dataMappingArray={dataMappingArray} dataFormat={dataFormat}
                isBulkAction={true} listIdChecked={listIdChecked}
                bulkActionItems={[{ title: "Xóa đã chọn", callback: () => showToast("Tính năng đang phát triển", "info") }]}
                striped={true} setListIdChecked={setListIdChecked}
                actions={actionsTable} actionType="inline"
                onClickRow={(row: IBomResponse) => setDetailBom(row)}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification
                description={<span>Chưa có công thức nào.<br />Hãy thêm công thức sản xuất đầu tiên!</span>}
                type="no-item" titleButton="Thêm công thức"
                action={() => { setEditBom(null); setShowAdd(true); }}
              />
            )}
          </div>

          <div className={`bom-list-detail-panel${detailBom ? "" : " hidden"}`}>
            {detailBom && (
              <BomDetailPanel
                bom={detailBom}
                onClose={() => setDetailBom(null)}
                onEdit={(b) => { setEditBom(b); setShowAdd(true); }}
              />
            )}
          </div>
        </div>
      </div>

      <AddBomModal
        isOpen={showAdd}
        data={editBom}
        onClose={() => { setShowAdd(false); setEditBom(null); }}
        onSuccess={() => {
          setShowAdd(false); setEditBom(null);
          fetchList(params); fetchSummary();
          if (detailBom) setDetailBom(null);
        }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}