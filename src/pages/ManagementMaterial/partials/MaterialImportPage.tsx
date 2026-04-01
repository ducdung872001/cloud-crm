import React, { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import SearchBox from "components/searchBox/searchBox";
import BoxTable from "components/boxTable/boxTable";
import TitleAction, { ITitleActions } from "components/titleAction/titleAction";
import Badge from "components/badge/badge";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { IAction, ISaveSearch } from "model/OtherModel";
import { showToast } from "utils/common";
import { getPageOffset } from "reborn-util";
import { IMaterialImportListItem, IMaterialImportDetail } from "@/model/material/MaterialImportModel";
import { MaterialImportService } from "@/services/MaterialService";
import CreateImportModal from "./CreateImportModal";
import ImportDetailPanel from "./ImportDetailPanel";
import "./MaterialImportPage.scss";

type ImportSegment = "all" | "pending" | "done" | "cancelled";

const SEGMENT_STATUS: Record<ImportSegment, number | undefined> = {
  all: undefined, pending: 1, done: 2, cancelled: 3,
};

interface Props { onBackProps?: (isBack: boolean) => void; }

export default function MaterialImportPage({ onBackProps }: Props) {
  document.title = "Nhập nguyên vật liệu";

  const abortRef = useRef<AbortController | null>(null);
  const [list, setList]             = useState<IMaterialImportListItem[]>([]);
  const [detailItem, setDetailItem] = useState<IMaterialImportListItem | null>(null);
  const [detailData, setDetailData] = useState<IMaterialImportDetail | null>(null);
  const [listIdChecked, setListIdChecked] = useState<number[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [contentDialog, setContentDialog] = useState<IContentDialog>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [segment, setSegment]       = useState<ImportSegment>("all");
  const [params, setParams]         = useState({ keyword: "", limit: 10, page: 1, status: undefined as number | undefined });
  const [listSaveSearch]            = useState<ISaveSearch[]>([{ key: "all", name: "Phiếu nhập", is_active: true }]);
  const [pagination, setPagination] = useState<PaginationProps>({
    ...DataPaginationDefault,
    name: "Phiếu nhập",
    isChooseSizeLimit: true,
    setPage: (page) => setParams((p) => ({ ...p, page })),
    chooseSizeLimit: (limit) => setParams((p) => ({ ...p, limit })),
  });

  // stats (computed from list mock since summary not implemented separately)
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0, cancelled: 0 });

  const fetchList = useCallback((p: typeof params) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    MaterialImportService.list({ status: p.status, keyword: p.keyword, page: p.page, limit: p.limit },
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

  useEffect(() => { fetchList(params); }, [params]);

  // Update stats from full list
  useEffect(() => {
    setStats({
      total:     list.length,
      pending:   list.filter((i) => i.status === 1).length,
      done:      list.filter((i) => i.status === 2).length,
      cancelled: list.filter((i) => i.status === 3).length,
    });
  }, [list]);

  // Load detail panel
  useEffect(() => {
    if (!detailItem) { setDetailData(null); return; }
    setIsLoadingDetail(true);
    MaterialImportService.get(detailItem.id)
      .then((res) => { if (res?.code === 0) setDetailData(res.result); })
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false));
  }, [detailItem]);

  const handleConfirm = (id: number) => {
    setContentDialog({
      color: "primary",
      isCentered: true,
      isLoading: true,
      title: "Xác nhận nhập tồn",
      message: "Xác nhận phiếu nhập này sẽ cập nhật tồn kho nguyên vật liệu. Bạn có chắc chắn?",
      cancelText: "Hủy",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Xác nhận",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await MaterialImportService.confirm(id);
        if (res?.code === 0) {
          showToast("Xác nhận nhập tồn thành công", "success");
          fetchList(params);
          if (detailItem?.id === id) setDetailItem(null);
        } else {
          showToast(res?.message ?? "Có lỗi xảy ra", "error");
        }
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const handleCancel = (id: number) => {
    setContentDialog({
      color: "error",
      isCentered: true,
      isLoading: true,
      title: "Hủy phiếu nhập",
      message: "Bạn có chắc chắn muốn hủy phiếu nhập này không?",
      cancelText: "Quay lại",
      cancelAction: () => { setShowDialog(false); setContentDialog(null); },
      defaultText: "Hủy phiếu",
      defaultAction: async () => {
        setShowDialog(false);
        const res = await MaterialImportService.cancel(id);
        if (res?.code === 0) {
          showToast("Hủy phiếu nhập thành công", "success");
          fetchList(params);
          if (detailItem?.id === id) setDetailItem(null);
        } else {
          showToast(res?.message ?? "Có lỗi xảy ra", "error");
        }
        setContentDialog(null);
      },
    });
    setShowDialog(true);
  };

  const titleActions: ITitleActions = {
    actions: [{
      title: "Tạo phiếu nhập",
      color: "primary",
      callback: () => setShowCreate(true),
    }],
  };

  const titles = ["STT", "Mã phiếu", "Kho nhập", "Nhà cung cấp", "Ngày nhập",
    "Số dòng NVL", "Tổng tiền", "Trạng thái", ""];
  const dataFormat = ["text-center", "", "", "", "text-center",
    "text-center", "text-right", "text-center", "text-center"];

  const statusBadge = (status: number) => {
    if (status === 1) return <Badge text="Chờ xác nhận" variant="warning" />;
    if (status === 2) return <Badge text="Hoàn thành" variant="success" />;
    if (status === 3) return <Badge text="Đã hủy" variant="secondary" />;
    return <Badge text="—" variant="secondary" />;
  };

  const dataMappingArray = (item: IMaterialImportListItem, index: number) => {
    const stt = getPageOffset(params) + index + 1;
    return [
      stt,
      <span key="code" className="import-code-col">{item.code}</span>,
      <span key="wh">{item.warehouseName ?? "—"}</span>,
      <span key="sup">{item.supplierName ?? "—"}</span>,
      <span key="date">{item.importDate ?? "—"}</span>,
      <span key="lines" style={{ fontWeight: 600, color: "var(--primary-color)" }}>
        {item.lineCount ?? 0} NVL
      </span>,
      <span key="amt" style={{ fontWeight: 700 }}>
        {(item.totalAmount ?? 0).toLocaleString("vi")} đ
      </span>,
      statusBadge(item.status),
      null,
    ];
  };

  const actionsTable = (item: IMaterialImportListItem): IAction[] => {
    const acts: IAction[] = [
      {
        title: "Xem chi tiết",
        icon: <Icon name="Eye" />,
        callback: () => setDetailItem(item),
      },
    ];
    if (item.status === 1) {
      acts.push({
        title: "Xác nhận nhập tồn",
        icon: <Icon name="CheckCircle" />,
        callback: () => handleConfirm(item.id),
      });
      acts.push({
        title: "Hủy phiếu",
        icon: <Icon name="XCircle" className="icon-error" />,
        callback: () => handleCancel(item.id),
      });
    }
    return acts;
  };

  return (
    <div className="page-content page-material-import">
      {/* ── HEADER ── */}
      <div className="action-navigation">
        <div className="action-backup">
          {onBackProps ? (
            <>
              <h1 className="title-first" onClick={() => onBackProps(true)}>Nguyên vật liệu</h1>
              <Icon name="ChevronRight" onClick={() => onBackProps(true)} />
              <h1 className="title-last">Nhập nguyên vật liệu</h1>
            </>
          ) : (
            <h1 className="title-last">Nhập nguyên vật liệu</h1>
          )}
        </div>
        <TitleAction title="" titleActions={titleActions} />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="mat-stat-row">
        {[
          { icon: "📋", val: stats.total,     lbl: "Tổng phiếu",      cls: "blue" },
          { icon: "✅", val: stats.done,       lbl: "Hoàn thành",      cls: "green" },
          { icon: "⏳", val: stats.pending,    lbl: "Chờ xác nhận",    cls: "amber" },
          { icon: "🚫", val: stats.cancelled,  lbl: "Đã hủy",          cls: "grey" },
        ].map((c, i) => (
          <div key={i} className="mat-stat-card">
            <div className={`mat-stat-card__icon mat-stat-card__icon--${c.cls}`}>{c.icon}</div>
            <div>
              <div className="mat-stat-card__val">{c.val}</div>
              <div className="mat-stat-card__lbl">{c.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-box">
        <SearchBox
          name="Phiếu nhập"
          params={params}
          isSaveSearch={true}
          listSaveSearch={listSaveSearch}
          updateParams={(p) => setParams(p)}
          placeholderSearch="Tìm mã phiếu nhập..."
        />

        <div className="material-list-toolbar">
          <div className="material-list-seg">
            {([
              { key: "all",       label: "Tất cả",        count: stats.total },
              { key: "done",      label: "Hoàn thành",    count: stats.done },
              { key: "pending",   label: "Chờ xác nhận",  count: stats.pending },
              { key: "cancelled", label: "Đã hủy",        count: stats.cancelled },
            ] as { key: ImportSegment; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`material-list-segb ${segment === tab.key ? "active" : ""}`}
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

        <div className="material-list-body">
          <div className={`material-list-table-wrap${detailItem ? " has-detail" : ""}`}>
            {!isLoading && list.length > 0 ? (
              <BoxTable
                name="Phiếu nhập"
                titles={titles}
                items={list}
                isPagination={true}
                dataPagination={pagination}
                dataMappingArray={dataMappingArray}
                dataFormat={dataFormat}
                isBulkAction={false}
                listIdChecked={listIdChecked}
                striped={true}
                setListIdChecked={setListIdChecked}
                actions={actionsTable}
                actionType="inline"
                onClickRow={(row: IMaterialImportListItem) => setDetailItem(row)}
              />
            ) : isLoading ? (
              <Loading />
            ) : (
              <SystemNotification
                description={<span>Chưa có phiếu nhập nào.<br />Hãy tạo phiếu nhập đầu tiên!</span>}
                type="no-item"
                titleButton="Tạo phiếu nhập"
                action={() => setShowCreate(true)}
              />
            )}
          </div>

          {/* ── DETAIL PANEL ── */}
          <div className={`material-list-detail-panel${detailItem ? "" : " hidden"}`}>
            {detailItem && (
              <ImportDetailPanel
                item={detailItem}
                detail={detailData}
                isLoading={isLoadingDetail}
                onClose={() => setDetailItem(null)}
                onConfirm={() => handleConfirm(detailItem.id)}
                onCancel={() => handleCancel(detailItem.id)}
              />
            )}
          </div>
        </div>
      </div>

      <CreateImportModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { fetchList(params); setShowCreate(false); }}
      />

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}