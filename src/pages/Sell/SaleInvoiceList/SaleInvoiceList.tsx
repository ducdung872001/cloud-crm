import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { showToast, toApiDateFormat, formatDisplayDate } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import InvoiceService from "services/InvoiceService";
import "./SaleInvoiceList.scss";
import OrderList, { StatusCounts } from "@/pages/CounterSales/components/OrderList";
import { Order } from "@/pages/CounterSales/types";
import Button from "@/components/button/button";
import moment from "moment";
import OrderDetailModal from "@/pages/CounterSales/components/modals/OrderDetailModal";
import ReceiptModal from "@/pages/CounterSales/components/modals/ReceiptModal";

// Map frontend status string → backend integer
const STATUS_TO_INT: Record<string, number> = {
  all:       -1,
  pending:    2,
  success:    1,
  cancelled:  3,
  shipping:   2,
};

export default function SaleInvoiceList() {
  document.title = "Danh sách đơn hàng";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const isMounted = useRef(false);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [invoiceId,            setInvoiceId]            = useState<number | null>(null);
  const [receiptModalOpen,     setReceiptModalOpen]     = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [searchParams,         setSearchParams]         = useSearchParams();

  // ── List + loading state ───────────────────────────────────────────────────
  const [listSaleInvoice, setListSaleInvoice] = useState<Order[]>([]);
  const [isLoading,       setIsLoading]       = useState(true);
  const [isNoItem,        setIsNoItem]        = useState(false);
  const [totalItem,       setTotalItem]       = useState(0);
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalPage,       setTotalPage]       = useState(1);

  // ── Export state ───────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // ── Status counts from API response ───────────────────────────────────────
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0, pending: 0, success: 0, cancelled: 0,
  });

  // ── Filter state (owned here, passed down to OrderList) ───────────────────
  const [activeFilter,  setActiveFilter]  = useState<"all"|"pending"|"shipping"|"success"|"cancelled">("all");
  const [searchText,    setSearchText]    = useState("");
  const [fromDate,      setFromDate]      = useState("");
  const [toDate,        setToDate]        = useState("");

  const [params, setParams] = useState<IInvoiceFilterRequest>({
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (dataBranch) {
      setParams(p => ({ ...p, branchId: dataBranch.value }));
    }
  }, [dataBranch]);

  // ── Map API item → Order ───────────────────────────────────────────────────
  const mapToOrder = (item: any): Order => ({
    id:          item.invoiceId,
    code:        item.invoice.invoiceCode,
    source:      "offline",
    sourceLabel: "Bán hàng tại quầy",
    status:      item.invoice.status === 1 ? "success"
               : item.invoice.status === 2 ? "pending"
               : "cancelled",
    statusLabel: item.invoice.status === 1 ? "Hoàn thành"
               : item.invoice.status === 2 ? "Chờ xử lý"
               : "Đã hủy",
    time: formatDisplayDate(item?.invoice?.createdTime, true),
    customer: {
      id:      item.customerId,
      name:    item?.invoice?.customerName || "Khách vãng lai",
      phone:   item.customerPhone || "",
      initial: item?.invoice?.customerName
               ? item.invoice.customerName.charAt(0).toUpperCase()
               : "K",
      points:  item.customerPoints ?? 0,
      tier:    item.customerTier ?? "",
      color:   "#2563eb",
    },
    items: [...(item.products || []), ...(item.services || [])]
      .map((i: any) => {
        const productName = i.productName || i.name || "";
        const variantName = i.name && i.name !== i.productName ? i.name : "";
        return variantName ? `${productName} (${variantName})` : productName;
      })
      .filter(Boolean)
      .join(", ") || "—",
    total: item.invoice.fee,
  });

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);

  const fetchList = async (p: IInvoiceFilterRequest, append = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await InvoiceService.list(p, abortRef.current.signal);

      if (response.code === 0) {
        const result = response.result;
        const mapped: Order[] = result.pagedLst.items.map(mapToOrder);

        setListSaleInvoice(append ? prev => [...prev, ...mapped] : mapped);
        setTotalItem(+result.pagedLst.total);
        setCurrentPage(+result.pagedLst.page);
        setTotalPage(Math.ceil(+result.pagedLst.total / +(p.limit ?? 10)));

        if (+result.pagedLst.total === 0 && +result.pagedLst.page === 1) {
          setIsNoItem(true);
        } else {
          setIsNoItem(false);
        }

        if (result.statusCounts) {
          const sc = result.statusCounts;
          const done     = Number(sc[1] ?? 0);
          const pending  = Number(sc[2] ?? 0);
          const cancel   = Number(sc[3] ?? 0);
          setStatusCounts({
            all:       done + pending + cancel,
            success:   done,
            pending:   pending,
            cancelled: cancel,
          });
        }
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        showToast("Lỗi tải danh sách đơn hàng", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Build params from filters and call fetch ───────────────────────────────
  const applyFilters = useCallback((
    filter: typeof activeFilter,
    keyword: string,
    from: string,
    to:   string,
    page: number,
    append = false
  ) => {
    const statusInt = STATUS_TO_INT[filter] ?? -1;
    const newParams: IInvoiceFilterRequest = { ...params, page };

    if (keyword?.trim()) newParams.invoiceCode = keyword.trim();
    else                 delete newParams.invoiceCode;

    // Convert sang format dd/MM/yyyy mà backend expect
    if (from?.trim())    newParams.fromDate = toApiDateFormat(from.trim());
    else                 delete newParams.fromDate;

    if (to?.trim())      newParams.toDate   = toApiDateFormat(to.trim());
    else                 delete newParams.toDate;

    if (statusInt > 0)   newParams.status   = statusInt;
    else                 delete newParams.status;

    delete newParams.keyword;

    setParams(newParams);
    fetchList(newParams, append);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Initial load when branch loaded
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    applyFilters(activeFilter, searchText, fromDate, toDate, 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataBranch]);

  // First mount with URL params
  useEffect(() => {
    const urlFromDate = searchParams.get("fromDate") || "";
    const urlToDate   = searchParams.get("toDate")   || "";
    if (urlFromDate) setFromDate(urlFromDate);
    if (urlToDate)   setToDate(urlToDate);
    const initParams: IInvoiceFilterRequest = { ...params };
    if (urlFromDate) initParams.fromDate = toApiDateFormat(urlFromDate);
    if (urlToDate)   initParams.toDate   = toApiDateFormat(urlToDate);
    fetchList(initParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter change handlers ─────────────────────────────────────────────────
  const handleFilterChange = (f: typeof activeFilter) => {
    setActiveFilter(f);
    applyFilters(f, searchText, fromDate, toDate, 1);
  };

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchTextChange = (v: string) => {
    setSearchText(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      applyFilters(activeFilter, v, fromDate, toDate, 1);
    }, 400);
  };

  const handleSearch = () => {
    applyFilters(activeFilter, searchText, fromDate, toDate, 1);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    applyFilters(activeFilter, searchText, fromDate, toDate, nextPage, true);
  };

  // ── Export Excel ───────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Dùng bộ filter hiện tại (params đã có fromDate/toDate đúng format)
      await InvoiceService.exportExcel(params);
      showToast("Xuất Excel thành công", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Xuất Excel thất bại. Vui lòng thử lại", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const handleViewReceipt = useCallback(() => setReceiptModalOpen(true), []);
  const handleViewDetail  = useCallback((id: number | null) => {
    setInvoiceId(id);
    setOrderDetailModalOpen(true);
  }, []);
  const handleConfirmOrder = useCallback(() => setOrderDetailModalOpen(false), []);

  return (
    <div className="sale-invoice-list">

      {/* ── Toolbar: Xuất Excel ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 16px 4px",
        }}
      >
        <Button
          onClick={handleExportExcel}
          disabled={isExporting}
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            6,
            padding:        "6px 16px",
            borderRadius:   6,
            fontSize:       13,
            fontWeight:     500,
            backgroundColor: isExporting ? "#e5e7eb" : "#217346",
            color:           isExporting ? "#9ca3af" : "#fff",
            border:         "none",
            cursor:          isExporting ? "not-allowed" : "pointer",
            transition:     "background-color 0.2s",
          }}
        >
          {/* Excel icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 13h2l2 4 2-4h2" fill="none" stroke="white" strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isExporting ? "Đang xuất..." : "Xuất Excel"}
        </Button>
      </div>

      <OrderList
        onViewDetail={handleViewDetail}
        onViewReceipt={handleViewReceipt}
        onConfirm={handleConfirmOrder}
        listOrder={listSaleInvoice}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchText={searchText}
        onSearchChange={handleSearchTextChange}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearch={handleSearch}
        statusCounts={statusCounts}
        totalItem={totalItem}
      />

      {isLoading && (
        <div style={{ textAlign: "center", padding: "12px 0", color: "#9ca3af", fontSize: 13 }}>
          Đang tải...
        </div>
      )}

      {!isLoading && currentPage < totalPage && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <Button onClick={handleLoadMore}>
            Tải thêm ({totalItem - listSaleInvoice.length} đơn còn lại)
          </Button>
        </div>
      )}

      <OrderDetailModal
        open={orderDetailModalOpen}
        onClose={() => { setInvoiceId(null); setOrderDetailModalOpen(false); }}
        onPrint={() => { setOrderDetailModalOpen(false); setReceiptModalOpen(true); }}
        invoiceId={invoiceId ?? -1}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}
