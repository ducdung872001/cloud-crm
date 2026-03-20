import React, { useState, useCallback, useEffect, useRef } from "react";
import "./index.scss";
import { ReturnProduct, IReturnInvoiceListParams, mapApiToUi } from "@/types/returnProduct";
import ReturnStats from "./components/ReturnStats";
import ReturnTable from "./components/ReturnTable";
import CreateReturnModal from "./modals/CreateReturnModal";
import ReturnDetailModal from "./modals/ReturnDetailModal";
import ReturnTopbar from "./components/ReturnTopbar";
import ReturnInvoiceService from "@/services/ReturnInvoiceService";

const PAGE_SIZE = 20;

const ReturnProductPage: React.FC = () => {
  // ── Data state ──────────────────────────────────────────────────────────────
  const [data, setData] = useState<ReturnProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterType, setFilterType] = useState("");        // "" | "return" | "exchange"
  const [filterStatus, setFilterStatus] = useState("");    // "" | "pending" | "done" | "cancel"
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReturnProduct | null>(null);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── API call ────────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (currentPage = 0) => {
      setLoading(true);
      const abortCtrl = new AbortController();

      try {
        // Map UI filter values → API params
        const returnTypeNum =
          filterType === "return" ? 1 : filterType === "exchange" ? 2 : undefined;

        const statusNum =
          filterStatus === "done"
            ? 1
            : filterStatus === "pending"
            ? 2
            : filterStatus === "cancel"
            ? 3
            : undefined;

        const params: IReturnInvoiceListParams = {
          returnType: returnTypeNum,
          status: statusNum,
          invoiceCode: search.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: currentPage,
          size: PAGE_SIZE,
        };

        const res = await ReturnInvoiceService.list(params, abortCtrl.signal);

        if (res?.result?.data) {
          const mapped = res.result.data.map(mapApiToUi);
          setData(currentPage === 0 ? mapped : (prev) => [...prev, ...mapped]);
          setTotal(res.result.total ?? 0);
        }
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

  // Reset về trang 0 khi filter thay đổi
  useEffect(() => {
    setPage(0);
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus, fromDate, toDate]);

  // Debounce search input
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      // fetchData sẽ được gọi qua effect khi search thay đổi
    }, 400);
  }, []);

  // Trigger fetch khi search state đổi (sau debounce)
  useEffect(() => {
    fetchData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleViewDetail = useCallback((item: ReturnProduct) => {
    setSelectedItem(item);
    setDetailOpen(true);
  }, []);

  /**
   * Callback sau khi tạo phiếu thành công:
   * Prepend item mới lên đầu danh sách (optimistic update)
   * và tăng counter thống kê.
   */
  const handleCreate = useCallback((newItem: ReturnProduct) => {
    setData((prev) => [newItem, ...prev]);
    setTotal((t) => t + 1);
    setCreateOpen(false);
  }, []);

  // ── Stats: tính từ data hiện có trong trang ──────────────────────────────────
  // (Với production: nên có API riêng trả summary, hoặc dùng total từ API)

  return (
    <div className="return-product">
      <div className="return-product__main">
        <ReturnTopbar onCreateClick={() => setCreateOpen(true)} />

        <div className="return-product__content">
          <div className="return-product__inner">
            {/* Stats — tính từ data đang load */}
            <ReturnStats data={data} totalFromApi={total} />

            {/* Table + filters */}
            <ReturnTable
              data={data}
              filterType={filterType}
              filterStatus={filterStatus}
              search={search}
              loading={loading}
              total={total}
              onFilterType={(v) => { setFilterType(v); }}
              onFilterStatus={(v) => { setFilterStatus(v); }}
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

      {/* Modal tạo phiếu */}
      <CreateReturnModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
        totalExisting={total}
      />

      {/* Modal chi tiết */}
      <ReturnDetailModal
        open={detailOpen}
        item={selectedItem}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default ReturnProductPage;