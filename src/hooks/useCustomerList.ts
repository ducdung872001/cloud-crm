import { useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "@/utils/common";
import { DataPaginationDefault } from "@/components/pagination/pagination";
import CustomerService from "@/services/CustomerService";

interface IPagination {
  page: number;
  sizeLimit: number;
  totalItem: number;
  totalPage: number;
}

export interface ICustomerListParams {
  limit?: number;
  page?: number;
  [key: string]: unknown;
  keyword?: string;
}

interface UseCustomerListParams {
  params?: ICustomerListParams;
  enabled?: boolean; // ✅ mặc định true, truyền false để tắt
}

interface UseCustomerListReturn {
  listCustomer: any[];
  isLoading: boolean;
  isNoItem: boolean;
  isPermissions: boolean;
  pagination: IPagination;
  refetch: () => void;
}

const DEFAULT_PAGINATION: IPagination = {
  page: 1,
  sizeLimit: DataPaginationDefault.sizeLimit,
  totalItem: 0,
  totalPage: 0,
};

export function useCustomerList({
  params = {},
  enabled = true, // ✅ mặc định true, truyền false để tắt
}: UseCustomerListParams): UseCustomerListReturn {
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Lưu params vào ref — luôn đọc được giá trị mới nhất
  //    mà KHÔNG gây re-render hay trigger useEffect
  const paramsRef = useRef<ICustomerListParams>(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  const [listCustomer, setListCustomer] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(DEFAULT_PAGINATION);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (paramsSearch: ICustomerListParams, signal: AbortSignal) => {
    setIsLoading(true);
    setIsNoItem(false);

    try {
      const response = await CustomerService.filter(paramsSearch, signal);

      if (response.code === 0) {
        const result = response.result;
        const sizeLimit = paramsSearch.limit ?? DataPaginationDefault.sizeLimit;
        const totalPage = Math.ceil(+result.total / +sizeLimit);

        setListCustomer((prev) => (paramsSearch.page === 1 ? result.items : [...prev, ...result.items]));
        setPagination({
          page: +result.page,
          sizeLimit: sizeLimit,
          totalItem: +result.total,
          totalPage,
        });

        if (+result.total === 0 && +result.page === 1) {
          setIsNoItem(true);
        }
      } else if (response.code === 400) {
        setIsPermissions(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        console.log("Request was aborted");
      } else {
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Refetch ─────────────────────────────────────────────────────────────────

  const refetch = useCallback(() => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // ✅ Đọc params từ ref — luôn là giá trị mới nhất
    const paramsSearch: ICustomerListParams = {
      ...paramsRef.current,
    };

    fetchProducts(paramsSearch, controller.signal);
  }, [fetchProducts]);
  //  ^^^^^^^^^^^^^^^^^^^^^^^^^
  //  Bỏ params ra khỏi deps — đọc qua ref thay thế
  //  → refetch chỉ tạo lại khi categoryId thực sự thay đổi

  // ── Auto fetch khi categoryId thay đổi ─────────────────────────────────────

  useEffect(() => {
    if (!enabled) return; // ✅ guard: nếu không enabled thì không fetch
    refetch();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [params.page, params.keyword, params.limit, enabled]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi params và enabled — giá trị primitive (string/boolean)
  //  string/boolean so sánh bằng value, không bị lặp như object

  return {
    listCustomer,
    isLoading,
    isNoItem,
    isPermissions,
    pagination,
    refetch,
  };
}
