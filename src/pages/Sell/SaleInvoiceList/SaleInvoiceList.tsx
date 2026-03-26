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
// ── [FIX] Import hook enrich thông tin khách hàng từ /adminapi ────────────────
import { useCustomerEnrich } from "@/hooks/useCustomerEnrich";

// Map frontend status string → backend integer
const STATUS_TO_INT: Record<string, number> = {
  all: -1,
  pending: 2,
  success: 1,
  cancelled: 3,
  shipping: 2,
};

export default function SaleInvoiceList() {
  document.title = "Danh sách đơn hàng";

  const { dataBranch } = useContext(UserContext) as ContextType;
  const isMounted = useRef(false);

  // ── [FIX] Khởi tạo hook enrich – sẽ batch-fetch tên KH sau mỗi lần load ──
  const { enrichList, getCustomer } = useCustomerEnrich();

  // ── Modal state ────────────────────────────────────────────────────────────
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [orderDetailModalOpen, setOrderDetailModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // ── List + loading state ───────────────────────────────────────────────────
  const [listSaleInvoice, setListSaleInvoice] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoItem, setIsNoItem] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  // ── Export state ───────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // ── Status counts from API response ───────────────────────────────────────
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0, pending: 0, success: 0, cancelled: 0,
  });

  // ── Filter state (owned here, passed down to OrderList) ───────────────────
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "shipping" | "success" | "cancelled">("all");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // ── [FIX] Map API item → Order, nhận thêm customerMap để enrich tên KH ────
  //
  //  Logic ưu tiên tên khách hàng (theo thứ tự):
  //    1. Tên lấy từ /adminapi/customer/list_by_id  (đầy đủ, chính xác nhất)
  //    2. invoice.customerName                      (nếu API sales có trả về)
  //    3. "Khách vãng lai"                          (fallback cuối)
  //
  const mapToOrder = useCallback(
    (item: any): Order => {
      // Tên KH từ adminapi (ưu tiên cao nhất)
      const enriched = item.customerId ? getCustomer(item.customerId) : null;
      const customerName =
        (enriched && enriched.name !== "Khách vãng lai" ? enriched.name : null)
        ?? item?.invoice?.customerName
        ?? null;

      const displayName = customerName || "Khách vãng lai";
      const displayPhone =
        enriched?.phone || enriched?.phoneMasked || item.customerPhone || "";

      return {
        id: item.invoiceId,
        code: item.invoice.invoiceCode,
        source: "offline",
        sourceLabel: "Bán hàng tại quầy",
        status:
          item.invoice.status === 1 ? "success"
          : item.invoice.status === 2 ? "pending"
          : "cancelled",
        statusLabel:
          item.invoice.status === 1 ? "Hoàn thành"
          : item.invoice.status === 2 ? "Chờ xử lý"
          : "Đã hủy",
        time: formatDisplayDate(item?.invoice?.createdTime, true),
        customer: {
          id: item.customerId,
          name: displayName,
          phone: displayPhone,
          initial: displayName.charAt(0).toUpperCase(),
          points: item.customerPoints ?? 0,
          tier: item.customerTier ?? "",
          color: "#2563eb",
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
      };
    },
    [getCustomer]
  );

  // ── Ref lưu raw items để re-map sau khi enrichList cập nhật customerMap ──
  const rawItemsRef = useRef<any[]>([]);
  const appendModeRef = useRef(false);

  // ── Fetch list ─────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  // AbortController riêng cho việc enrich KH
  const enrichAbortRef = useRef<AbortController | null>(null);

  const fetchList = async (p: IInvoiceFilterRequest, append = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await InvoiceService.list(p, abortRef.current.signal);

      if (response.code === 0) {
        const result = response.result;
        const rawItems: any[] = result.pagedLst.items ?? [];

        // Lưu raw items để re-map sau khi enrich xong
        if (append) {
          rawItemsRef.current = [...rawItemsRef.current, ...rawItems];
        } else {
          rawItemsRef.current = rawItems;
        }
        appendModeRef.current = append;

        // Map ngay với dữ liệu hiện có (có thể tên vẫn là "Khách vãng lai" tạm thời)
        const mapped: Order[] = rawItems.map(mapToOrder);
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
          const done = Number(sc[1] ?? 0);
          const pending = Number(sc[2] ?? 0);
          const cancel = Number(sc[3] ?? 0);
          setStatusCounts({
            all: done + pending + cancel,
            success: done,
            pending: pending,
            cancelled: cancel,
          });
        }

        // ── [FIX] Batch-enrich tên khách hàng từ adminapi ──────────────────
        // Chỉ enrich những item có customerId (>0) mà invoice.customerName trống
        const idsToEnrich = rawItems
          .filter(i => i.customerId > 0 && !i?.invoice?.customerName)
          .map(i => i.customerId);

        if (idsToEnrich.length > 0) {
          enrichAbortRef.current?.abort();
          enrichAbortRef.current = new AbortController();

          // enrichList tự dedup + cache – chỉ gọi API cho ID chưa có
          enrichList(idsToEnrich, enrichAbortRef.current.signal);
          // Re-map sẽ được trigger bởi useEffect bên dưới khi customerMap thay đổi
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

  // ── [FIX] Re-map toàn bộ list khi customerMap được cập nhật ──────────────
  // getCustomer thay đổi reference sau mỗi lần enrichList hoàn tất
  // → trigger lại mapToOrder với dữ liệu mới nhất
  useEffect(() => {
    if (rawItemsRef.current.length === 0) return;
    setListSaleInvoice(rawItemsRef.current.map(mapToOrder));
  }, [mapToOrder]); // mapToOrder phụ thuộc getCustomer → cập nhật khi customerMap thay đổi

  // ── Build params from filters and call fetch ───────────────────────────────
  const applyFilters = useCallback((
    filter: typeof activeFilter,
    keyword: string,
    from: string,
    to: string,
    page: number,
    append = false
  ) => {
    const statusInt = STATUS_TO_INT[filter] ?? -1;
    const newParams: IInvoiceFilterRequest = { ...params, page };

    if (keyword?.trim()) newParams.invoiceCode = keyword.trim();
    else delete newParams.invoiceCode;

    // Convert sang format dd/MM/yyyy mà backend expect
    if (from?.trim()) newParams.fromDate = toApiDateFormat(from.trim());
    else delete newParams.fromDate;

    if (to?.trim()) newParams.toDate = toApiDateFormat(to.trim());
    else delete newParams.toDate;

    if (statusInt > 0) newParams.status = statusInt;
    else delete newParams.status;

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
    const urlToDate = searchParams.get("toDate") || "";
    if (urlFromDate) setFromDate(urlFromDate);
    if (urlToDate) setToDate(urlToDate);
    const initParams: IInvoiceFilterRequest = { ...params };
    if (urlFromDate) initParams.fromDate = toApiDateFormat(urlFromDate);
    if (urlToDate) initParams.toDate = toApiDateFormat(urlToDate);
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
  const handleViewDetail = useCallback((id: number | null) => {
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
        onExport={handleExportExcel}
        isExporting={isExporting}
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