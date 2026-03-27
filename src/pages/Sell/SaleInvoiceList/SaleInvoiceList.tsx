import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { showToast, toApiDateFormat, formatDisplayDate } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import InvoiceService from "services/InvoiceService";
import "./SaleInvoiceList.scss";
import OrderList, { StatusCounts } from "@/pages/CounterSales/components/OrderList";
import { Order } from "@/pages/CounterSales/types";
import Button from "@/components/button/button";
import OrderDetailModal from "@/pages/CounterSales/components/modals/OrderDetailModal";
import InvoiceReceiptModal from "@/pages/CounterSales/components/modals/InvoiceReceiptModal/InvoiceReceiptModal";
import { useCustomerEnrich, CustomerMap } from "@/hooks/useCustomerEnrich";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TO_INT: Record<string, number> = {
  all: -1, pending: 2, success: 1, cancelled: 3, shipping: 2,
};

type ActiveFilter = "all" | "pending" | "shipping" | "success" | "cancelled";

// ── Helper: map 1 invoice item → Order ────────────────────────────────────────
// customerId nằm trong item.invoice.customerId (không phải item.customerId root)

function mapItemToOrder(item: any, customerMap: CustomerMap): Order {
  const customerId: number = item?.invoice?.customerId ?? item?.customerId ?? 0;
  const enriched = customerId > 0 ? customerMap[customerId] : null;

  const name =
    (enriched?.name && enriched.name !== "Khách vãng lai" ? enriched.name : null)
    ?? item?.invoice?.customerName
    ?? "Khách vãng lai";

  const phone =
    enriched?.phone || enriched?.phoneMasked
    || item?.invoice?.customerPhone || item?.customerPhone || "";

  const inv = item.invoice;
  const status = inv.status === 1 ? "success" : inv.status === 2 ? "pending" : "cancelled";
  const statusLabel = inv.status === 1 ? "Hoàn thành" : inv.status === 2 ? "Chờ xử lý" : "Đã hủy";

  const itemNames = [...(item.products || []), ...(item.services || [])]
    .map((p: any) => {
      const base = p.productName || p.name || "";
      const variant = p.name && p.name !== p.productName ? p.name : "";
      return variant ? `${base} (${variant})` : base;
    })
    .filter(Boolean)
    .join(", ") || "—";

  return {
    id: item.invoiceId,
    code: inv.invoiceCode,
    source: "offline",
    sourceLabel: "Bán hàng tại quầy",
    status,
    statusLabel,
    time: formatDisplayDate(inv.createdTime, true),
    customer: {
      id: customerId,
      name,
      phone,
      initial: name.charAt(0).toUpperCase(),
      points: item.customerPoints ?? 0,
      tier: item.customerTier ?? "",
      color: "#2563eb",
    },
    items: itemNames,
    total: inv.fee,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SaleInvoiceList() {
  document.title = "Danh sách đơn hàng";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const isMounted = useRef(false);

  // customerMap: STATE từ hook – thay đổi sau enrichList → trigger re-map
  const { customerMap, enrichList } = useCustomerEnrich();

  // ── State ──────────────────────────────────────────────────────────────────
  const [invoiceId, setInvoiceId]                   = useState<number | null>(null);
  const [orderDetailModalOpen, setOrderDetailOpen]  = useState(false);
  const [receiptInvoiceId, setReceiptInvoiceId]     = useState<number | null>(null);
  const [receiptModalOpen, setReceiptModalOpen]     = useState(false);
  const [searchParams]                              = useSearchParams();
  const [listSaleInvoice, setListSaleInvoice]       = useState<Order[]>([]);
  const [isLoading, setIsLoading]                   = useState(true);
  const [isNoItem, setIsNoItem]                     = useState(false);
  const [totalItem, setTotalItem]                   = useState(0);
  const [currentPage, setCurrentPage]               = useState(1);
  const [totalPage, setTotalPage]                   = useState(1);
  const [isExporting, setIsExporting]               = useState(false);
  const [statusCounts, setStatusCounts]             = useState<StatusCounts>({
    all: 0, pending: 0, success: 0, cancelled: 0,
  });
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [searchText, setSearchText]     = useState("");
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");
  const [params, setParams]             = useState<IInvoiceFilterRequest>({
    invoiceTypes: JSON.stringify(["IV1", "IV3"]),
    limit: 10,
    page: 1,
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const rawItemsRef    = useRef<any[]>([]);
  const abortRef       = useRef<AbortController | null>(null);
  const enrichAbortRef = useRef<AbortController | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync branchId vào params ───────────────────────────────────────────────
  useEffect(() => {
    if (dataBranch) setParams(p => ({ ...p, branchId: dataBranch.value }));
  }, [dataBranch]);

  // ── Re-map list khi customerMap cập nhật (sau enrichList hoàn tất) ─────────
  useEffect(() => {
    if (rawItemsRef.current.length === 0) return;
    setListSaleInvoice(rawItemsRef.current.map(i => mapItemToOrder(i, customerMap)));
  }, [customerMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchList = async (p: IInvoiceFilterRequest, append = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await InvoiceService.list(p, abortRef.current.signal);
      if (response.code !== 0) {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
        return;
      }

      const { pagedLst, statusCounts: sc } = response.result;
      const rawItems: any[] = pagedLst.items ?? [];

      // Lưu raw để re-map sau khi enrich xong
      rawItemsRef.current = append ? [...rawItemsRef.current, ...rawItems] : rawItems;

      // Render ngay (tên KH có thể tạm là "Khách vãng lai" trước khi enrich)
      const mapped = rawItems.map(i => mapItemToOrder(i, customerMap));
      setListSaleInvoice(append ? prev => [...prev, ...mapped] : mapped);

      setTotalItem(+pagedLst.total);
      setCurrentPage(+pagedLst.page);
      setTotalPage(Math.ceil(+pagedLst.total / +(p.limit ?? 10)));
      setIsNoItem(+pagedLst.total === 0 && +pagedLst.page === 1);

      if (sc) {
        const done    = Number(sc[1] ?? 0);
        const pending = Number(sc[2] ?? 0);
        const cancel  = Number(sc[3] ?? 0);
        setStatusCounts({ all: done + pending + cancel, success: done, pending, cancelled: cancel });
      }

      // Batch-enrich tên KH từ /adminapi/customer/list_by_id
      const ids = rawItems
        .map(i => i?.invoice?.customerId ?? i?.customerId ?? 0)
        .filter(id => id > 0);

      if (ids.length > 0) {
        enrichAbortRef.current?.abort();
        enrichAbortRef.current = new AbortController();
        enrichList(ids, enrichAbortRef.current.signal);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") showToast("Lỗi tải danh sách đơn hàng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filter builder ─────────────────────────────────────────────────────────
  const applyFilters = useCallback((
    filter: ActiveFilter, keyword: string,
    from: string, to: string, page: number, append = false,
  ) => {
    const statusInt = STATUS_TO_INT[filter] ?? -1;
    const p: IInvoiceFilterRequest = { ...params, page };

    if (keyword?.trim()) p.invoiceCode = keyword.trim(); else delete p.invoiceCode;
    if (from?.trim())    p.fromDate    = toApiDateFormat(from.trim()); else delete p.fromDate;
    if (to?.trim())      p.toDate      = toApiDateFormat(to.trim());   else delete p.toDate;
    if (statusInt > 0)   p.status      = statusInt;                    else delete p.status;
    delete p.keyword;

    setParams(p);
    fetchList(p, append);
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effects: initial load ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    applyFilters(activeFilter, searchText, fromDate, toDate, 1);
  }, [dataBranch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fd = searchParams.get("fromDate") || "";
    const td = searchParams.get("toDate")   || "";
    if (fd) setFromDate(fd);
    if (td) setToDate(td);
    const init: IInvoiceFilterRequest = { ...params };
    if (fd) init.fromDate = toApiDateFormat(fd);
    if (td) init.toDate   = toApiDateFormat(td);
    fetchList(init);

    // Hỗ trợ mở trực tiếp chi tiết đơn từ Global Search:
    // navigate(`/crm/sale_invoice?openInvoice=3384`)
    const openId = searchParams.get("openInvoice");
    if (openId) {
      const numId = parseInt(openId, 10);
      if (!isNaN(numId)) {
        setInvoiceId(numId);
        setOrderDetailOpen(true);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFilterChange = (f: ActiveFilter) => {
    setActiveFilter(f);
    applyFilters(f, searchText, fromDate, toDate, 1);
  };

  const handleSearchTextChange = (v: string) => {
    setSearchText(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(
      () => applyFilters(activeFilter, v, fromDate, toDate, 1), 400
    );
  };

  const handleLoadMore = () =>
    applyFilters(activeFilter, searchText, fromDate, toDate, currentPage + 1, true);

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await InvoiceService.exportExcel(params);
      showToast("Xuất Excel thành công", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Xuất Excel thất bại. Vui lòng thử lại", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetail   = useCallback((id: number | null) => { setInvoiceId(id); setOrderDetailOpen(true); }, []);
  const handleConfirmOrder = useCallback(() => setOrderDetailOpen(false), []);
  const handleViewReceipt  = useCallback((id: number | null) => { setReceiptInvoiceId(id); setReceiptModalOpen(true); }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="sale-invoice-list">
      <OrderList
        listOrder={listSaleInvoice}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchText={searchText}
        onSearchChange={handleSearchTextChange}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearch={() => applyFilters(activeFilter, searchText, fromDate, toDate, 1)}
        statusCounts={statusCounts}
        totalItem={totalItem}
        onExport={handleExportExcel}
        isExporting={isExporting}
        onViewDetail={handleViewDetail}
        onViewReceipt={handleViewReceipt}
        onConfirm={handleConfirmOrder}
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
        onClose={() => { setInvoiceId(null); setOrderDetailOpen(false); }}
        onPrint={() => {
          setOrderDetailOpen(false);
          setReceiptInvoiceId(invoiceId);
          setReceiptModalOpen(true);
        }}
        invoiceId={invoiceId ?? -1}
        onConfirm={handleConfirmOrder}
      />

      <InvoiceReceiptModal
        open={receiptModalOpen}
        invoiceId={receiptInvoiceId}
        onClose={() => { setReceiptInvoiceId(null); setReceiptModalOpen(false); }}
      />
    </div>
  );
}