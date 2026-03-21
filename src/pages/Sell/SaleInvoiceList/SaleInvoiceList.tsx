import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import _ from "lodash";
import { useSearchParams } from "react-router-dom";
import { DataPaginationDefault, PaginationProps } from "components/pagination/pagination";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { showToast } from "utils/common";
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
  // "shipping" maps to pending too since backend doesn't have a separate shipping status
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
    time:     item?.invoice?.createdTime
              ? moment(item.invoice.createdTime).format("DD/MM/YYYY · HH:mm")
              : "",
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

        // Update status counts from API response statusCounts field
        if (result.statusCounts) {
          // Backend: 1=done, 2=pending, 3=cancel
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
    const newParams: IInvoiceFilterRequest = {
      ...params,
      page,
    };
    // Chỉ gán nếu có giá trị thực — tránh gửi "undefined" hoặc chuỗi rỗng
    if (keyword?.trim())  newParams.keyword  = keyword.trim();
    else                  delete newParams.keyword;
    if (from?.trim())     newParams.fromDate = from.trim();
    else                  delete newParams.fromDate;
    if (to?.trim())       newParams.toDate   = to.trim();
    else                  delete newParams.toDate;
    if (statusInt > 0)    newParams.status   = statusInt;
    else                  delete newParams.status;

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
    if (urlFromDate) initParams.fromDate = urlFromDate;
    if (urlToDate)   initParams.toDate   = urlToDate;
    fetchList(initParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter change handlers ─────────────────────────────────────────────────
  const handleFilterChange = (f: typeof activeFilter) => {
    setActiveFilter(f);
    applyFilters(f, searchText, fromDate, toDate, 1);
  };

  const handleSearch = () => {
    applyFilters(activeFilter, searchText, fromDate, toDate, 1);
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    applyFilters(activeFilter, searchText, fromDate, toDate, nextPage, true);
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
      <OrderList
        onViewDetail={handleViewDetail}
        onViewReceipt={handleViewReceipt}
        onConfirm={handleConfirmOrder}
        listOrder={listSaleInvoice}
        // Filter props (controlled)
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchText={searchText}
        onSearchChange={setSearchText}
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
