import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import Icon from "components/icon";
import Loading from "components/loading";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Dialog, { IContentDialog } from "components/dialog/dialog";
import { showToast, getPermissions } from "utils/common";
import Badge from "components/badge/badge";
import { ExportExcel } from "exports/excel";
import "./style.scss";

// ─── Types ───────────────────────────────────────────────────────────────────

type BadgeVariant = "success" | "warning" | "error" | "transparent" | "primary" | "secondary" | "done" | "wait-collect";

/** Giá trị status trong bảng sinvoice_log */
type SinvoiceStatus = "ISSUED" | "PENDING" | "FAILED" | "CANCELLED" | string;

type StatusFilter = "all" | "ISSUED" | "PENDING" | "FAILED";

export interface SinvoiceLog {
  id:                 number;
  bsnId:              number;
  version:            number;
  parentId:           number | null;
  transactionUuid:    string;
  transactionId:      string;
  reservationCode:    string;
  supplierTaxCode:    string;
  invoiceNo:          string;
  invoiceType:        string;
  templateCode:       string;
  invoiceSeries:      string;
  invoiceIssuedDate:  number | null;  // Unix ms
  adjustmentType:     string;
  buyerTaxCode:       string;
  buyerName:          string;
  totalAmount:        number;
  currencyCode:       string;
  status:             SinvoiceStatus;
  rawRequestJson:     string;
  errorCode:          string | null;
  errorDescription:   string | null;
  createdAt:          string;
  updatedAt:          string;
  // parsed helpers (filled client-side)
  amountWithoutTax?:  number;
  taxAmount?:         number;
}

interface Props {
  onDataChanged?:    () => void;
  onGoToExport?:     () => void;
  onOpenDetail?:     (item: SinvoiceLog) => void;
  onRegisterExport?: (fn: () => void) => void;
  onCountsLoaded?:   (info: { total: number; pending: number; issued: number; failed: number; monthLabel: string }) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "Tất cả" },
  { key: "ISSUED",    label: "Đã phát hành" },
  { key: "PENDING",   label: "Chờ ký số" },
  { key: "FAILED",    label: "Lỗi / Hủy" },
];

const BADGE_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  ISSUED:    { text: "Đã phát hành",    variant: "success" },
  PENDING:   { text: "Chờ ký số",       variant: "warning" },
  FAILED:    { text: "Lỗi / Hủy",       variant: "error" },
  CANCELLED: { text: "Đã hủy",          variant: "error" },
};

const MONTHS: { label: string; value: string }[] = (() => {
  const result: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`,
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return result;
})();

const PAGE_SIZE = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => v?.toLocaleString("vi-VN") + "đ";

/** Chuyển Unix ms → dd/MM/yyyy */
const fmtDate = (ts: number | null | undefined): string => {
  if (!ts) return "—";
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
};

/** Parse rawRequestJson để lấy amountWithoutTax + taxAmount */
const parseSummarize = (raw: string | null): { amountWithoutTax: number; taxAmount: number } => {
  try {
    if (!raw) return { amountWithoutTax: 0, taxAmount: 0 };
    const obj = JSON.parse(raw);
    const si = obj?.summarizeInfo;
    return {
      amountWithoutTax: si?.totalAmountWithoutTax ?? 0,
      taxAmount:        si?.totalTaxAmount        ?? 0,
    };
  } catch {
    return { amountWithoutTax: 0, taxAmount: 0 };
  }
};

/** Enrich list với amountWithoutTax + taxAmount */
const enrichList = (items: SinvoiceLog[]): SinvoiceLog[] =>
  items.map(item => {
    const { amountWithoutTax, taxAmount } = parseSummarize(item.rawRequestJson);
    return { ...item, amountWithoutTax, taxAmount };
  });

/** Month string "2026-02" → fromDate "2026-02-01", toDate "2026-02-28" */
const monthToRange = (month: string): { fromDate: string; toDate: string } => {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return {
    fromDate: `${month}-01`,
    toDate:   `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

// ─── Service call ─────────────────────────────────────────────────────────────

interface FetchParams {
  keyword?:   string;
  status?:    string;
  fromDate?:  string;
  toDate?:    string;
  page:       number;
  size:       number;
}

const fetchSinvoiceLogs = async (
  params: FetchParams,
  signal?: AbortSignal
): Promise<{ items: SinvoiceLog[]; total: number }> => {
  const q = new URLSearchParams();
  q.set("page",  String(params.page - 1));   // API là 0-based
  q.set("size",  String(params.size));
  if (params.keyword)  q.set("keyword",  params.keyword);
  if (params.status)   q.set("status",   params.status);
  if (params.fromDate) q.set("fromDate", params.fromDate);
  if (params.toDate)   q.set("toDate",   params.toDate);

  const res = await fetch(`/bizapi/integration/sinvoice/log/list?${q.toString()}`, { signal });
  const json = await res.json();

  if (json.code !== 0) throw new Error(json.message || "Lỗi tải danh sách hóa đơn");

  const page = json.result;
  return {
    items: enrichList(page.items ?? page.content ?? []),
    total: page.total ?? page.totalElements ?? 0,
  };
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function InvoiceVATList({ onDataChanged, onGoToExport, onOpenDetail, onRegisterExport, onCountsLoaded }: Props) {
  const [list,           setList]           = useState<SinvoiceLog[]>([]);
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>("all");
  const [searchText,     setSearchText]     = useState("");
  const [selectedMonth,  setSelectedMonth]  = useState(MONTHS[0].value);
  const [page,           setPage]           = useState(1);
  const [totalItem,      setTotalItem]      = useState(0);
  const [counts,         setCounts]         = useState<Record<StatusFilter, number>>({ all: 0, ISSUED: 0, PENDING: 0, FAILED: 0 });
  const [isLoading,      setIsLoading]      = useState(true);
  const [showDialog,     setShowDialog]     = useState(false);
  const [contentDialog,  setContentDialog]  = useState<IContentDialog | null>(null);
  const [checkedIds,     setCheckedIds]     = useState<number[]>([]);

  const abortRef     = useRef<AbortController | null>(null);
  const searchTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPage = Math.max(1, Math.ceil(totalItem / PAGE_SIZE));

  // ── Fetch counts ───────────────────────────────────────────────────────────
  const fetchCounts = useCallback(async (month: string) => {
    const { fromDate, toDate } = monthToRange(month);
    try {
      // 2 requests song song: tất cả + ISSUED
      const [resAll, resIssued, resPending] = await Promise.allSettled([
        fetchSinvoiceLogs({ fromDate, toDate, page: 1, size: 1 }),
        fetchSinvoiceLogs({ fromDate, toDate, status: "ISSUED",  page: 1, size: 1 }),
        fetchSinvoiceLogs({ fromDate, toDate, status: "PENDING", page: 1, size: 1 }),
      ]);
      const total   = resAll.status     === "fulfilled" ? resAll.value.total     : 0;
      const issued  = resIssued.status  === "fulfilled" ? resIssued.value.total  : 0;
      const pending = resPending.status === "fulfilled" ? resPending.value.total : 0;
      const failed  = Math.max(0, total - issued - pending);

      setCounts({ all: total, ISSUED: issued, PENDING: pending, FAILED: failed });

      // Notify parent
      const [y, m] = month.split("-").map(Number);
      const monthLabel = `Tháng ${m}/${y}`;
      onCountsLoaded?.({ total, pending, issued, failed, monthLabel });
    } catch { /* silent */ }
  }, [onCountsLoaded]);

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const fetchList = useCallback(async (
    kw: string, status: StatusFilter, month: string, pg: number
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      const { fromDate, toDate } = monthToRange(month);
      const data = await fetchSinvoiceLogs({
        keyword:  kw   || undefined,
        status:   status === "all" ? undefined : status,
        fromDate, toDate,
        page: pg,
        size: PAGE_SIZE,
      }, abortRef.current.signal);
      setList(data.items);
      setTotalItem(data.total);
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast(e?.message || "Lỗi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + refetch on filter change
  useEffect(() => {
    fetchList(searchText, statusFilter, selectedMonth, page);
    fetchCounts(selectedMonth);
    return () => abortRef.current?.abort();
  }, [statusFilter, selectedMonth, page]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchList(searchText, statusFilter, selectedMonth, 1);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchText]);

  const [exportLoading, setExportLoading] = useState(false);

  const handleExportExcel = useCallback(async () => {
    setExportLoading(true);
    try {
      // Lấy toàn bộ danh sách (tối đa 5000 bản ghi) theo filter hiện tại
      const { fromDate, toDate } = monthToRange(selectedMonth);
      const allData = await fetchSinvoiceLogs({
        keyword:  searchText || undefined,
        status:   statusFilter === "all" ? undefined : statusFilter,
        fromDate, toDate,
        page: 1,
        size: 5000,
      });

      if (allData.items.length === 0) {
        showToast("Không có dữ liệu để xuất.", "error");
        return;
      }

      const statusLabel = (s: string) => {
        const m: Record<string, string> = {
          ISSUED:    "Đã phát hành",
          PENDING:   "Chờ ký số",
          FAILED:    "Lỗi / Hủy",
          CANCELLED: "Đã hủy",
        };
        return m[s] ?? s;
      };

      ExportExcel({
        title:        "DANH SÁCH HÓA ĐƠN VAT ĐIỆN TỬ",
        fileName:     `HoaDon_VAT_${selectedMonth}`,
        generateInfo: false,
        generateSign: false,
        header: [[
          "STT",
          "Số hóa đơn",
          "Ký hiệu",
          "Ngày xuất",
          "Người mua",
          "Mã số thuế",
          "Tiền hàng (VNĐ)",
          "Thuế GTGT (VNĐ)",
          "Tổng tiền (VNĐ)",
          "Trạng thái",
          "Mã giao dịch (UUID)",
        ]],
        data: allData.items.map((item, idx) => [
          idx + 1,
          item.invoiceNo   || "Đang xử lý",
          item.invoiceSeries || "",
          fmtDate(item.invoiceIssuedDate),
          item.buyerName   || "",
          item.buyerTaxCode || "Cá nhân",
          item.amountWithoutTax ?? 0,
          item.taxAmount        ?? 0,
          item.totalAmount      ?? 0,
          statusLabel(item.status),
          item.transactionUuid  || "",
        ]),
        columnsWidth: [6, 18, 12, 14, 30, 16, 18, 18, 18, 16, 38],
        formatExcel:  ["center", "left", "center", "center", "left", "center", "right", "right", "right", "center", "left"],
      });
    } catch (e: any) {
      showToast(e?.message || "Lỗi khi xuất Excel", "error");
    } finally {
      setExportLoading(false);
    }
  }, [searchText, statusFilter, selectedMonth]);

  // Đăng ký hàm export lên parent (để header button gọi được)
  useEffect(() => { onRegisterExport?.(handleExportExcel); }, [handleExportExcel]);

  // ── Pagination pages ───────────────────────────────────────────────────────
  const renderPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPage <= 7) {
      for (let i = 1; i <= totalPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3)              pages.push("...");
      for (let i = Math.max(2, page-1); i <= Math.min(totalPage-1, page+1); i++) pages.push(i);
      if (page < totalPage - 2)  pages.push("...");
      pages.push(totalPage);
    }
    return pages;
  };

  const handleStatusFilter = (key: StatusFilter) => { setStatusFilter(key); setPage(1); setCheckedIds([]); };
  const handleMonth = (v: string) => { setSelectedMonth(v); setPage(1); setCheckedIds([]); };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="tab-danh-sach">

      {/* Filter row */}
      <div className="tab-ds__filters">
        <div className="search-box-ds">
          <Icon name="Search" />
          <input
            placeholder="Số HĐ, tên KH, MST..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {searchText && (
            <button className="search-clear" onClick={() => setSearchText("")}>×</button>
          )}
        </div>

        <div className="month-select">
          <select value={selectedMonth} onChange={e => handleMonth(e.target.value)}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div className="status-filters">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              className={`status-filter-btn${statusFilter === f.key ? " active" : ""}${f.key === "FAILED" && statusFilter === f.key ? " active-error" : ""}`}
              onClick={() => handleStatusFilter(f.key)}
            >
              {f.key === "PENDING" && <Icon name="Clock" />}
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        <button className="btn-filter-adv">
          <Icon name="Filter" /> Bộ lọc nâng cao
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <SystemNotification
          type={searchText || statusFilter !== "all" ? "no-result" : "no-item"}
          description={<span>{searchText || statusFilter !== "all" ? "Không có dữ liệu trùng khớp." : "Hiện tại chưa có hóa đơn nào."}</span>}
        />
      ) : (
        <div className="invoice-table-wrap">
          <table className="invoice-table-ds">
            <thead>
              <tr>
                <th className="col-check">
                  <input
                    type="checkbox"
                    checked={checkedIds.length === list.length}
                    onChange={e => setCheckedIds(e.target.checked ? list.map(i => i.id) : [])}
                  />
                </th>
                <th>SỐ HÓA ĐƠN</th>
                <th>NGÀY XUẤT</th>
                <th>KHÁCH HÀNG / CÔNG TY</th>
                <th>MST</th>
                <th className="text-right">TIỀN HÀNG</th>
                <th className="text-right">THUẾ GTGT</th>
                <th className="text-right">TỔNG TIỀN</th>
                <th className="text-center">TRẠNG THÁI</th>
                <th className="text-center">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {list.map(item => {
                const badge = BADGE_MAP[item.status] ?? { text: item.status, variant: "wait-collect" as BadgeVariant };
                return (
                  <tr key={item.id} className={checkedIds.includes(item.id) ? "row-checked" : ""}>
                    <td className="col-check">
                      <input
                        type="checkbox"
                        checked={checkedIds.includes(item.id)}
                        onChange={e => setCheckedIds(e.target.checked
                          ? [...checkedIds, item.id]
                          : checkedIds.filter(id => id !== item.id)
                        )}
                      />
                    </td>
                    <td className="col-invoice-no">
                      <span className="invoice-no-text">{item.invoiceNo || <em className="pending-no">Đang xử lý</em>}</span>
                      {item.invoiceSeries && <span className="invoice-series">{item.invoiceSeries}</span>}
                    </td>
                    <td className="col-date">{fmtDate(item.invoiceIssuedDate)}</td>
                    <td className="col-customer">
                      <span className="customer-name-ds">{item.buyerName || "—"}</span>
                    </td>
                    <td className="col-taxcode">{item.buyerTaxCode || "Cá nhân"}</td>
                    <td className="text-right col-amount">
                      {item.amountWithoutTax ? fmt(item.amountWithoutTax) : "—"}
                    </td>
                    <td className="text-right col-vat">
                      <span className="vat-highlight">
                        {item.taxAmount ? fmt(item.taxAmount) : "—"}
                      </span>
                    </td>
                    <td className="text-right col-total">
                      <strong>{item.totalAmount ? fmt(item.totalAmount) : "—"}</strong>
                    </td>
                    <td className="text-center col-status">
                      <Badge text={badge.text} variant={badge.variant} />
                    </td>
                    <td className="text-center col-actions">
                      {item.status === "PENDING" && (
                        <button className="btn-sign">Ký số</button>
                      )}
                      {(item.status === "FAILED" || item.status === "CANCELLED") && (
                        <button className="btn-replace" onClick={() => showToast("Tính năng thay thế đang phát triển", "warning")}>
                          Thay thế
                        </button>
                      )}
                      {item.status === "ISSUED" && (
                        <>
                          <button className="btn-action-sm" onClick={() => showToast("Đang tải PDF...", "warning")}>PDF</button>
                          <button className="btn-action-sm" onClick={() => showToast("Đang gửi email...", "warning")}>Email</button>
                          <button className="btn-action-sm" onClick={() => onOpenDetail?.(item)}>Xem</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-row">
            <span className="pagination-info">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItem)} / {totalItem} hóa đơn
            </span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹ Trước</button>
              {renderPages().map((p, i) =>
                p === "..."
                  ? <span key={`dots-${i}`} className="page-dots">...</span>
                  : <button
                      key={p}
                      className={`page-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p as number)}
                    >{p}</button>
              )}
              <button className="page-btn" disabled={page === totalPage} onClick={() => setPage(page + 1)}>Sau ›</button>
            </div>
          </div>
        </div>
      )}

      <Dialog content={contentDialog} isOpen={showDialog} />
    </div>
  );
}
