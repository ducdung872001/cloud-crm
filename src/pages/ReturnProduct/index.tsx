import React, { useState, useCallback, useEffect, useRef } from "react";
import "./index.scss";
import { ReturnProduct, IReturnInvoiceListParams } from "@/types/returnProduct";
import ReturnStats from "./components/ReturnStats";
import ReturnTable from "./components/ReturnTable";
import CreateReturnModal from "./modals/CreateReturnModal";
import ReturnDetailModal from "./modals/ReturnDetailModal";
import ReturnTopbar from "./components/ReturnTopbar";
import ReturnInvoiceService from "@/services/ReturnInvoiceService";

const PAGE_SIZE = 20;

/** Loại bỏ key có giá trị undefined/null — tránh "param=undefined" trên URL */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as Partial<T>;
}

/** Trả về fromDate/toDate dạng "dd/MM/yyyy" cho tháng N (0-indexed) năm Y */
function monthRange(year: number, month: number): { fromDate: string; toDate: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    fromDate: `01/${pad(month + 1)}/${year}`,
    toDate:   `${lastDay}/${pad(month + 1)}/${year}`,
  };
}

const ReturnProductPage: React.FC = () => {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [data,          setData]          = useState<ReturnProduct[]>([]);
  const [total,         setTotal]         = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState<number | undefined>(undefined);
  const [page,          setPage]          = useState(0);
  const [loading,       setLoading]       = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterType,   setFilterType]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search,       setSearch]       = useState("");
  const [fromDate,     setFromDate]     = useState("");
  const [toDate,       setToDate]       = useState("");

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [createOpen,    setCreateOpen]    = useState(false);
  const [detailOpen,    setDetailOpen]    = useState(false);
  const [selectedItem,  setSelectedItem]  = useState<ReturnProduct | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Fetch last month count (chỉ gọi 1 lần khi mount, không phụ thuộc filter) ──
  const fetchLastMonthCount = useCallback(async () => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const { fromDate: lmFrom, toDate: lmTo } = monthRange(lastYear, lastMonth);

    try {
      const res = await ReturnInvoiceService.list({
        fromDate: lmFrom,
        toDate:   lmTo,
        page: 0,
        size: 1, // Chỉ cần total, không cần items
      });

      const lmTotal =
        res?.result?.total ??
        res?.result?.pagedLst?.total ??
        null;

      if (lmTotal !== null) setLastMonthTotal(lmTotal);
    } catch {
      // Không ảnh hưởng UX chính nếu lỗi
    }
  }, []);

  useEffect(() => {
    fetchLastMonthCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Main data fetch với Inventory enrich ─────────────────────────────────────
  const fetchData = useCallback(
    async (currentPage = 0) => {
      setLoading(true);
      const abortCtrl = new AbortController();

      try {
        const returnTypeNum =
          filterType === "return" ? 1 : filterType === "exchange" ? 2 : undefined;
        const statusNum =
          filterStatus === "done"     ? 1
          : filterStatus === "pending"  ? 2
          : filterStatus === "cancel"   ? 3
          : undefined;

        const rawParams: IReturnInvoiceListParams = {
          returnType:  returnTypeNum,
          status:      statusNum,
          invoiceCode: search.trim() || undefined,
          fromDate:    fromDate || undefined,
          toDate:      toDate   || undefined,
          page:        currentPage,
          size:        PAGE_SIZE,
        };

        const params = stripUndefined(rawParams) as IReturnInvoiceListParams;

        // Dùng listAndEnrich thay vì list thuần — tự động enrich productSummary
        const { items, total: apiTotal } = await ReturnInvoiceService.listAndEnrich(
          params,
          abortCtrl.signal
        );

        setData(currentPage === 0 ? items : (prev) => [...prev, ...items]);
        setTotal(apiTotal);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("[ReturnProduct] fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [filterType, filterStatus, search, fromDate, toDate]
  );

  useEffect(() => {
    setPage(0);
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus, fromDate, toDate]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setPage(0), 400);
  }, []);

  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleViewDetail = useCallback((item: ReturnProduct) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  const handleCreate = useCallback((newItem: ReturnProduct) => {
    setData((prev) => [newItem, ...prev]);
    setTotal((t) => t + 1);
    setCreateOpen(false);
  }, []);

  return (
    <div className="return-product">
      <div className="return-product__main">
        <ReturnTopbar onCreateClick={() => setCreateOpen(true)} />

        <div className="return-product__content">
          <div className="return-product__inner">
            <ReturnStats
              data={data}
              totalFromApi={total}
              lastMonthTotal={lastMonthTotal}
            />

            <ReturnTable
              data={data}
              filterType={filterType}
              filterStatus={filterStatus}
              search={search}
              loading={loading}
              total={total}
              onFilterType={(v) => setFilterType(v)}
              onFilterStatus={(v) => setFilterStatus(v)}
              onSearch={handleSearch}
              onViewDetail={handleViewDetail}
              onCreateClick={() => setCreateOpen(true)}
              onLoadMore={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchData(nextPage);
              }}
            />
          </div>
        </div>
      </div>

      <CreateReturnModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        totalExisting={total}
      />

      <ReturnDetailModal
        open={detailOpen}
        item={selectedItem}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default ReturnProductPage;