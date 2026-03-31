import React, { Fragment, useState, useEffect, useCallback, useRef } from "react";
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
import {
  IProductionOrderListItem,
  IProductionOrderSummary,
} from "@/model/material/ProductionOrderModel";
import { ProductionOrderService } from "@/services/MaterialService";
import CreateProductionOrderModal from "./CreateProductionOrderModal";
import ProductionOrderDetailPanel from "./ProductionOrderDetailPanel";
import "./ProductionOrderPage.scss";

type POSegment = "all" | "draft" | "inProcess" | "done" | "cancelled";
const SEG_STATUS: Record<POSegment, number | undefined> = {
  all: undefined, draft: 1, inProcess: 2, done: 3, cancelled: 4,
};
const STATUS_CFG: Record<number, { label: string; variant: "success" | "warning" | "secondary" | "error" }> = {
  1: { label: "Nháp",           variant: "secondary" },
  2: { label: "Đang sản xuất",  variant: "warning"   },
  3: { label: "Hoàn thành",     variant: "success"   },
  4: { label: "Đã hủy",         variant: "error"     },
};

function formatDate(raw?: string | object): string {
  if (!raw) return "—";
  try {
    const d = new Date(String(raw));
    if (isNaN(d.getTime())) return String(raw);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  } catch { return String(raw); }
}

interface Props { onBackProps?: (isBack: boolean) => void; }

export default function ProductionOrderPage({ onBackProps }: Props) {
  document.title = "Lệnh sản xuất";
  const abortRef = useRef<AbortController | null>(null);
  const [list,       setList]       = useState<IProductionOrderListItem[]>([]);
  const [detail,     setDetail]     = useState<IProductionOrderListItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [segment,    setSegment]    = useState<POSegment>("all");
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [summary, setSummary] = useState<IProductionOrderSummary>({ total:0, draft:0, inProcess:0, done:0, cancelled:0 });
  const [params, setParams] = useState({ keyword:"", limit:10, page:1, status: undefined as number|undefined });
  const [listSaveSearch] = useState<ISaveSearch[]>([{ key:"all", name:"Lệnh sản xuất", is_active:true }]);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault, name:"Lệnh sản xuất", isChooseSizeLimit:true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit })),
  });

  const fetchSummary = useCallback(() => {
    ProductionOrderService.summary()
      .then((res) => { if (res?.code === 0 && res.result) setSummary(res.result); })
      .catch(() => {});
  }, []);

  const fetchList = useCallback((p: typeof params) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    ProductionOrderService.list({ status:p.status, keyword:p.keyword, page:p.page, limit:p.limit }, abortRef.current.signal)
      .then((res) => {
        if (res?.code === 0 && res.result) {
          const { items, total, page, size } = res.result;
          setList(items ?? []);
          setPagination((prev) => ({ ...prev, page: page ?? p.page, sizeLimit: size ?? p.limit,
            totalItem: total ?? 0, totalPage: Math.ceil((total ?? 0) / (size ?? p.limit)) }));
        } else setList([]);
      })
      .catch((err) => { if (err?.name !== "AbortError") setList([]); })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchSummary(); fetchList(params); }, []);
  useEffect(() => { fetchList(params); }, [params]);

  const handleRefresh = () => { fetchList(params); fetchSummary(); };

  const handleCancel = (item: IProductionOrderListItem) => {
    setContentDialog({
      color: "error", isCentered: true, isLoading: true,
      title: "Hủy lệnh sản xuất",
      message: (<Fragment>Hủy lệnh <strong>{item.code}</strong>? Hành động này không thể hoàn tác.</Fragment>),
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận hủy",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await ProductionOrderService.cancel(item.id, "Hủy từ danh sách");
        if (res?.code === 0) { showToast("Đã hủy lệnh sản xuất", "success"); if (detail?.id === item.id) setDetail(null); handleRefresh(); }
        else showToast(res?.message ?? "Có lỗi xảy ra", "error");
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const titles = ["STT","Mã lệnh","Thành phẩm","Số mẻ","Sản lượng","Ngày SX","Trạng thái",""];
  const dataFormat = ["text-center","","","text-center","text-center","text-center","text-center","text-center"];

  const dataMappingArray = (item: IProductionOrderListItem, idx: number) => {
    const cfg = STATUS_CFG[item.status] ?? { label:"—", variant:"secondary" as const };
    return [
      (params.page - 1) * params.limit + idx + 1,
      <span key="c" style={{ fontFamily:"monospace", color:"#015aa4", fontWeight:700, fontSize:"1.2rem" }}>{item.code}</span>,
      <div key="n"><div style={{ fontWeight:600, color:"#1e293b" }}>{item.productName}</div>
        {item.productSku && <div style={{ fontSize:"1.1rem", color:"#94a3b8", fontFamily:"monospace" }}>{item.productSku}</div>}</div>,
      <span key="b">{item.plannedQty}</span>,
      <span key="o" style={{ fontWeight:600 }}>{(item.totalOutputQty??0).toLocaleString("vi")} {item.outputUnit??""}</span>,
      <span key="d">{formatDate(item.plannedDate)}</span>,
      <Badge key="s" text={cfg.label} variant={cfg.variant} />,
      null,
    ];
  };

  const actionsTable = (item: IProductionOrderListItem): IAction[] => {
    const isChecked = listIdChecked.length > 0;
    return [
      { title:"Chi tiết", icon:<Icon name="Eye" className={isChecked?"icon-disabled":""} />, disabled:isChecked, callback:() => { if (!isChecked) setDetail(item); } },
      ...((item.status===1||item.status===2) ? [{ title:"Hủy lệnh", icon:<Icon name="XCircle" className={isChecked?"icon-disabled":"icon-error"} />, disabled:isChecked, callback:() => { if (!isChecked) handleCancel(item); } }] : []),
    ];
  };

  const statCards = [
    { val:summary.total,     lbl:"Tổng lệnh",    color:"#015aa4", bg:"#eff6ff", bdr:"#bfdbfe" },
    { val:summary.draft,     lbl:"Nháp",          color:"#6b7280", bg:"#f9fafb", bdr:"#e5e7eb" },
    { val:summary.inProcess, lbl:"Đang sản xuất", color:"#ea580c", bg:"#fff7ed", bdr:"#fed7aa" },
    { val:summary.done,      lbl:"Hoàn thành",    color:"#16a34a", bg:"#f0fdf4", bdr:"#bbf7d0" },
  ];

  return (
    <div className="page-content page-production-order">
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (<>
            <h1 className="title-first" onClick={() => onBackProps(true)}>Nguyên vật liệu</h1>
            <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
            <h1 className="title-last">Lệnh sản xuất</h1>
          </>) : <h1 className="title-last">Lệnh sản xuất</h1>}
        </div>
        <Button type="button" color="primary" onClick={() => setShowCreate(true)}>+ Tạo lệnh sản xuất</Button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.2rem", marginBottom:"2rem" }}>
        {statCards.map((c,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"1.2rem", background:"#fff", border:"1px solid #e2e8f0", borderRadius:"1rem", padding:"1.4rem 1.8rem" }}>
            <div style={{ width:"4.4rem", height:"4.4rem", borderRadius:"0.8rem", background:c.bg, border:`1px solid ${c.bdr}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", fontWeight:800, color:c.color, flexShrink:0 }}>{c.val}</div>
            <div>
              <div style={{ fontSize:"2rem", fontWeight:800, color:c.color, lineHeight:1 }}>{c.val}</div>
              <div style={{ fontSize:"1.2rem", color:"#94a3b8", marginTop:"0.2rem" }}>{c.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-box">
        <SearchBox name="Lệnh sản xuất" params={params} isSaveSearch listSaveSearch={listSaveSearch}
          updateParams={(p) => setParams(p)} placeholderSearch="Tìm mã lệnh, tên thành phẩm..." />

        <div style={{ display:"flex", gap:"0.4rem", padding:"1rem 1.6rem 0", borderBottom:"1px solid #e2e8f0" }}>
          {([
            { key:"all",       lbl:"Tất cả",        cnt:summary.total     },
            { key:"draft",     lbl:"Nháp",          cnt:summary.draft     },
            { key:"inProcess", lbl:"Đang sản xuất", cnt:summary.inProcess },
            { key:"done",      lbl:"Hoàn thành",    cnt:summary.done      },
            { key:"cancelled", lbl:"Đã hủy",        cnt:summary.cancelled },
          ] as {key:POSegment;lbl:string;cnt:number}[]).map((tab) => (
            <button key={tab.key} type="button"
              onClick={() => { setSegment(tab.key); setParams((p) => ({ ...p, page:1, status:SEG_STATUS[tab.key] })); }}
              style={{ padding:"0.7rem 1.4rem", border:"none", background:"transparent", cursor:"pointer",
                fontSize:"1.3rem", fontWeight:segment===tab.key?700:400,
                color:segment===tab.key?"#015aa4":"#64748b",
                borderBottom:segment===tab.key?"2.5px solid #015aa4":"2.5px solid transparent" }}>
              {tab.lbl} ({tab.cnt})
            </button>
          ))}
        </div>

        <div style={{ display:"flex" }}>
          <div style={{ flex:1, minWidth:0 }}>
            {isLoading ? <Loading /> : list.length > 0 ? (
              <BoxTable name="Lệnh sản xuất" titles={titles} items={list}
                isPagination dataPagination={pagination}
                dataMappingArray={dataMappingArray} dataFormat={dataFormat}
                isBulkAction={false} listIdChecked={listIdChecked} striped
                setListIdChecked={setListIdChecked} actions={actionsTable} actionType="inline"
                onClickRow={(row: IProductionOrderListItem) => setDetail(row)} />
            ) : (
              <SystemNotification type="no-item"
                description={<span>Chưa có lệnh sản xuất nào.<br />Hãy tạo lệnh đầu tiên!</span>}
                titleButton="Tạo lệnh sản xuất" action={() => setShowCreate(true)} />
            )}
          </div>
          {detail && (
            <div style={{ width:"38rem", flexShrink:0, maxHeight:"calc(100vh - 200px)", overflowY:"auto" }}>
              <ProductionOrderDetailPanel order={detail} onClose={() => setDetail(null)} onRefresh={handleRefresh} />
            </div>
          )}
        </div>
      </div>

      <CreateProductionOrderModal isOpen={showCreate} onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); handleRefresh(); }} />
      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}