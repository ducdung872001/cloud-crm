import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DraftOrder, RawInvoiceDetail, mapRawToDraftOrder } from "./../../types";
import { urlsApi } from "configs/urls";
import { showToast } from "utils/common";
import { ContextType, UserContext } from "contexts/userContext";

interface UseDraftOrdersOptions {
  /** Gọi sau khi xóa thành công — dùng để refresh badge ở CounterSales */
  onDeleted?: () => void;
}

export function useDraftOrders(options?: UseDraftOrdersOptions) {
  const { onDeleted } = options ?? {};
  const { dataBranch } = useContext(UserContext) as ContextType;

  const [query,      setQuery]      = useState("");
  const [list,       setList]       = useState<DraftOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // ── Fetch danh sách đơn tạm từ API ──────────────────────────────────────
  const fetchDrafts = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res  = await fetch(urlsApi.invoice.draftListWithProducts, {
        signal: abortRef.current.signal,
      });
      const json = await res.json();

      if (json.code === 0 && Array.isArray(json.result)) {
        const mapped: DraftOrder[] = (json.result as RawInvoiceDetail[])
          .map(mapRawToDraftOrder);
        setList(mapped);
        setSelectedId(prev =>
          prev && mapped.some(d => d.id === prev) ? prev : null
        );
      } else {
        if (json.code !== 0) {
          showToast(json.message ?? "Không thể tải đơn tạm", "error");
        }
        setList([]);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        showToast("Lỗi kết nối khi tải đơn tạm", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
    return () => abortRef.current?.abort();
  }, [fetchDrafts, dataBranch]);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.tenDon.toLowerCase().includes(q) ||
        d.khachHang.toLowerCase().includes(q) ||
        d.nhanVien.toLowerCase().includes(q)
    );
  }, [list, query]);

  const selected = useMemo(
    () => list.find((x) => x.id === selectedId) ?? null,
    [list, selectedId]
  );

  // ── Xóa đơn tạm ─────────────────────────────────────────────────────────
  const deleteDraft = useCallback(async (id: string) => {
    const draft = list.find(d => d.id === id);
    if (!draft) return;

    setDeleting(id);
    try {
      const res  = await fetch(
        `${urlsApi.invoice.draftDelete}?id=${draft.invoiceId}`,
        { method: "DELETE" }
      );
      const json = await res.json();

      if (json.code === 0) {
        // Cập nhật local list ngay lập tức (không chờ refetch)
        setList(prev => prev.filter(x => x.id !== id));
        setSelectedId(prev => prev === id ? null : prev);
        showToast("Đã xóa đơn tạm", "success");
        // Báo lên CounterSales để refresh badge trên Topbar
        onDeleted?.();
      } else {
        showToast(json.message ?? "Xóa đơn tạm thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa đơn tạm", "error");
    } finally {
      setDeleting(null);
    }
  }, [list, onDeleted]);

  const createDraft = useCallback(() => {
    showToast("Hãy thêm sản phẩm vào giỏ hàng và nhấn 'Lưu tạm' để tạo đơn tạm mới", "warning");
  }, []);

  return {
    query, setQuery,
    list, setList,
    filtered, loading, deleting,
    selectedId, setSelectedId,
    selected,
    createDraft, deleteDraft, fetchDrafts,
    stats: { totalDrafts: list.length },
  };
}