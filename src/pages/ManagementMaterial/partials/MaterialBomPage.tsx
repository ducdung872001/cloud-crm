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
function formatDateTime(raw?: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const dd   = String(d.getDate()).padStart(2, "0");
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh   = String(d.getHours()).padStart(2, "0");
    const min  = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch { return raw; }
}

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

  const C = {
    white:      "#ffffff",
    border:     "#e2e8f0",
    bgLight:    "#f8fafc",
    text:       "#1e293b",
    textMuted:  "#94a3b8",
    textSub:    "#64748b",
    primary:    "#015aa4",
    primaryBg:  "#eff6ff",
    primaryBdr: "#bfdbfe",
  } as const;

  return (
    <div style={{ height:"100%", overflowY:"auto", background:C.white,
      display:"flex", flexDirection:"column", borderLeft:`1px solid ${C.border}` }}>

      {/* Header */}
      <div style={{ padding:"1.6rem 1.8rem 1.2rem", position:"relative",
        borderBottom:`1px solid ${C.border}`, background:C.white }}>
        <button type="button" onClick={onClose} style={{
          position:"absolute", top:"1.2rem", right:"1.2rem",
          background:C.bgLight, border:`1px solid ${C.border}`,
          color:C.textSub, width:"2.8rem", height:"2.8rem",
          borderRadius:"50%", cursor:"pointer", fontSize:"1.4rem",
          display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

        <div style={{ fontFamily:"monospace", fontSize:"1.2rem",
          color:C.primary, fontWeight:700, marginBottom:"0.4rem" }}>{data.code}</div>
        <div style={{ fontSize:"1.5rem", fontWeight:700, color:C.text,
          marginBottom:"0.8rem", lineHeight:1.3, paddingRight:"3.5rem" }}>{data.productName}</div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.8rem" }}>
          <Badge text={STATUS_LABEL[data.status] ?? "—"} variant={STATUS_VARIANT[data.status] ?? "secondary"} />
          <span style={{ fontFamily:"monospace", fontSize:"1.1rem",
            background:C.bgLight, border:`1px solid ${C.border}`,
            padding:"0.2rem 0.7rem", borderRadius:"0.3rem",
            color:C.textSub, fontWeight:600 }}>{data.version}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, background:C.bgLight }}>
        {[
          { val:(data.outputQty ?? 0).toLocaleString("vi"), lbl:"Sản lượng/mẻ", color:C.text },
          { val:data.outputUnit || "—",                     lbl:"Đơn vị",       color:C.text },
          { val:String(data.ingredientCount ?? data.ingredients?.length ?? 0),
            lbl:"Nguyên liệu", color:C.primary },
        ].map((s, i, arr) => (
          <div key={i} style={{ flex:1, padding:"1.2rem 0.8rem", textAlign:"center",
            borderRight: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize:"1.8rem", fontWeight:800, color:s.color,
              lineHeight:1, marginBottom:"0.3rem" }}>{s.val}</div>
            <div style={{ fontSize:"1.05rem", color:C.textMuted, fontWeight:500 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Section label */}
      <div style={{ fontSize:"1.05rem", fontWeight:700, color:C.textMuted,
        textTransform:"uppercase", letterSpacing:"0.08em",
        padding:"1.2rem 1.6rem 0.6rem" }}>Danh sách nguyên liệu</div>

      {/* Ingredients */}
      <div style={{ flex:1, overflowY:"auto", padding:"0 1.2rem 0.8rem" }}>
        {isLoading ? <Loading /> : (data.ingredients?.length ?? 0) > 0 ? (
          data.ingredients!.map((ing, i) => (
            <div key={ing.materialId ?? i} style={{ display:"flex", alignItems:"center",
              gap:"1rem", padding:"0.9rem 0.4rem",
              borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:"2.4rem", height:"2.4rem", borderRadius:"50%",
                background:C.primaryBg, border:`1px solid ${C.primaryBdr}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"1.1rem", fontWeight:700, color:C.primary, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"1.3rem", fontWeight:600, color:C.text,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {ing.materialName}</div>
                {ing.materialCode && (
                  <div style={{ fontSize:"1.1rem", color:C.textMuted,
                    fontFamily:"monospace" }}>{ing.materialCode}</div>
                )}
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ fontSize:"1.4rem", fontWeight:700, color:C.primary }}>{ing.quantity}</div>
                <div style={{ fontSize:"1.1rem", color:C.textMuted }}>{ing.unitName}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign:"center", color:C.textMuted,
            padding:"2.4rem", fontSize:"1.3rem" }}>Chưa có nguyên liệu nào</div>
        )}
      </div>

      {/* Note */}
      {data.note && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:"0.6rem",
          margin:"0 1.6rem 0.8rem", padding:"0.8rem 1rem",
          background:C.bgLight, border:`1px solid ${C.border}`,
          borderRadius:"0.6rem", fontSize:"1.2rem", color:C.textSub }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"
            style={{ flexShrink:0, marginTop:"0.1rem" }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{data.note}</span>
        </div>
      )}

      {/* Dates */}
      <div style={{ display:"flex", gap:"1.2rem", flexWrap:"wrap",
        padding:"0 1.6rem 0.8rem", fontSize:"1.1rem", color:C.textMuted }}>
        {data.createdTime  && <span>Tạo: {formatDateTime(String(data.createdTime))}</span>}
        {data.updatedTime  && <span>Cập nhật: {formatDateTime(String(data.updatedTime))}</span>}
      </div>

      {/* Action */}
      <div style={{ padding:"1.2rem 1.6rem", borderTop:`1px solid ${C.border}`, marginTop:"auto" }}>
        <button onClick={() => onEdit(data)} style={{
          width:"100%", padding:"0.9rem", borderRadius:"0.6rem",
          border:`1.5px solid ${C.primary}`, background:C.white,
          color:C.primary, fontSize:"1.3rem", fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Chỉnh sửa
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