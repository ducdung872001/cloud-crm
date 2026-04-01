import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { IInvoiceFilterRequest } from "model/invoice/InvoiceRequestModel";
import { showToast, toApiDateFormat, formatDisplayDate } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";
import InvoiceService from "services/InvoiceService";
import DebtManagementService from "services/DebtManagementService";
import { IFundListItem } from "services/FundManagementService";
import { urlsApi } from "configs/urls";
import "./SaleInvoiceList.scss";
// TNPM: CounterSales removed
const OrderList = () => null;
type StatusCounts = Record<string, number>;
type Order = any;
import Button from "@/components/button/button";
const OrderDetailModal = () => null;
const InvoiceReceiptModal = () => null;
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
    note:  inv.note ?? "",
    debt:  inv.debt  ?? 0,
    paid:  inv.paid  ?? 0,
  };
}


// ─── QuickPayModal — Thu nợ nhanh từ danh sách đơn ───────────────────────────

function parseVnd(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}

interface QuickPayModalProps {
  debtInfo: { invoiceId: number; amount: number; name: string };
  funds: IFundListItem[];
  onClose: () => void;
  onSuccess: () => void;
}

function QuickPayModal({ debtInfo, funds, onClose, onSuccess }: QuickPayModalProps) {
  const [amountStr, setAmountStr]   = useState(debtInfo.amount.toLocaleString("vi"));
  const [amount, setAmount]         = useState(debtInfo.amount);
  const [fundId, setFundId]         = useState<number>(funds[0]?.id ?? 0);
  const [note, setNote]             = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fmtCurrency = (n: number) => n.toLocaleString("vi") + " VND";

  async function handlePay() {
    if (!fundId)     { showToast("Vui lòng chọn quỹ nhận tiền", "error"); return; }
    if (amount <= 0) { showToast("Số tiền phải lớn hơn 0", "error"); return; }
    if (amount > debtInfo.amount + 0.01) {
      showToast(`Số tiền vượt quá nợ còn lại (${fmtCurrency(debtInfo.amount)})`, "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await DebtManagementService.pay({
        invoiceId: debtInfo.invoiceId,  // lookup debt bằng invoiceId ở backend
        amount,
        fundId,
        note: note.trim() || undefined,
      });
      const remaining = typeof res === "number" ? res : 0;
      showToast(
        remaining <= 0
          ? "✓ Thu nợ thành công! Hóa đơn đã được gạch nợ."
          : `✓ Đã thu ${fmtCurrency(amount)}. Còn lại: ${fmtCurrency(remaining)}`,
        "success"
      );
      onSuccess();
    } catch (e: any) {
      showToast(e?.message ?? "Có lỗi xảy ra khi thu tiền", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: "1.2rem", padding: "2.4rem",
        width: "min(42rem, 95vw)", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.6rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700, color: "#133042" }}>Thu nợ</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.8rem", color: "#8a9eb0" }}>×</button>
        </div>

        {/* Info */}
        <div style={{ background: "#f8fbfd", borderRadius: "0.8rem", padding: "1.2rem 1.4rem", marginBottom: "1.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "1.3rem" }}>
            <span style={{ color: "#5c7282" }}>Khách hàng</span>
            <strong style={{ color: "#133042" }}>{debtInfo.name}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", fontSize: "1.3rem" }}>
            <span style={{ color: "#5c7282" }}>Còn nợ</span>
            <strong style={{ color: "#c62828" }}>{fmtCurrency(debtInfo.amount)}</strong>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "1.2rem", fontWeight: 600, color: "#5c7282" }}>Số tiền thu</label>
            <div style={{ display: "flex", gap: "0.8rem" }}>
              <input
                type="text"
                value={amountStr}
                onChange={(e) => {
                  const raw = parseVnd(e.target.value);
                  setAmount(raw);
                  setAmountStr(raw > 0 ? raw.toLocaleString("vi") : "");
                }}
                style={{
                  flex: 1, padding: "0.8rem 1.2rem", border: "1.5px solid #c9d9e4",
                  borderRadius: "0.7rem", fontSize: "1.35rem", fontFamily: "inherit",
                  color: "#133042", outline: "none",
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => { setAmount(debtInfo.amount); setAmountStr(debtInfo.amount.toLocaleString("vi")); }}
                style={{
                  padding: "0.7rem 1.2rem", border: "1.5px solid #c9d9e4", borderRadius: "0.7rem",
                  background: "#f0f6fa", color: "#133042", fontSize: "1.25rem", fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit",
                }}
              >
                Thu đủ
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "1.2rem", fontWeight: 600, color: "#5c7282" }}>Quỹ nhận tiền</label>
            {funds.length === 0 ? (
              <p style={{ margin: 0, fontSize: "1.25rem", color: "#c62828" }}>Chưa có quỹ nào.</p>
            ) : (
              <select
                value={fundId}
                onChange={(e) => setFundId(Number(e.target.value))}
                style={{
                  padding: "0.8rem 1.2rem", border: "1.5px solid #c9d9e4",
                  borderRadius: "0.7rem", fontSize: "1.3rem", fontFamily: "inherit",
                  color: "#133042", background: "#fff",
                }}
              >
                {funds.map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {fmtCurrency(f.balance)}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "1.2rem", fontWeight: 600, color: "#5c7282" }}>Ghi chú (tuỳ chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khách chuyển khoản ngân hàng..."
              style={{
                padding: "0.8rem 1.2rem", border: "1.5px solid #c9d9e4",
                borderRadius: "0.7rem", fontSize: "1.3rem", fontFamily: "inherit",
                color: "#133042", outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.9rem 2rem", border: "1.5px solid #c9d9e4", borderRadius: "0.8rem",
              background: "#fff", color: "#133042", fontSize: "1.3rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Huỷ
          </button>
          <button
            onClick={handlePay}
            disabled={submitting || funds.length === 0}
            style={{
              padding: "0.9rem 2rem", border: "none", borderRadius: "0.8rem",
              background: submitting ? "#9ca3af" : "#2e7d32", color: "#fff",
              fontSize: "1.3rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {submitting ? "Đang xử lý..." : "✓ Xác nhận thu tiền"}
          </button>
        </div>
      </div>
    </div>
  );
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
  const [quickPayDebt, setQuickPayDebt]             = useState<{ invoiceId: number; amount: number; name: string } | null>(null);
  const [funds, setFunds]                           = useState<IFundListItem[]>([]);
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

  // ── Load quỹ cho quick-pay ────────────────────────────────────────────────
  useEffect(() => {
    fetch(urlsApi.fund.overview, { method: "GET" })
      .then(r => r.json())
      .then(res => { if (res.code === 0) setFunds(res.result?.funds ?? []); })
      .catch(() => {});
  }, []);

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

    // Hỗ trợ mở trực tiếp chi tiết đơn từ Global Search
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
  const handleCollectDebt  = useCallback((order: Order) => {
    if (!order.debt || order.debt <= 0) return;
    setQuickPayDebt({ invoiceId: Number(order.id), amount: order.debt, name: order.customer.name });
  }, []);

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
        onCollectDebt={handleCollectDebt}
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

      {/* Quick Pay Modal — Thu nợ từ danh sách đơn hàng */}
      {quickPayDebt && (
        <QuickPayModal
          debtInfo={quickPayDebt}
          funds={funds}
          onClose={() => setQuickPayDebt(null)}
          onSuccess={() => {
            setQuickPayDebt(null);
            // Reload list để cập nhật badge nợ
            fetchList(params);
          }}
        />
      )}
    </div>
  );
}