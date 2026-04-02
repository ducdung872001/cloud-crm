import { useCallback, useEffect, useRef, useState } from "react";
import ProductService from "@/services/ProductService";
import { showToast } from "@/utils/common";
import { DataPaginationDefault } from "@/components/pagination/pagination";

interface IPagination {
  page: number;
  sizeLimit: number;
  totalItem: number;
  totalPage: number;
}

export interface IProductListParams {
  limit?: number;
  page?: number;
  categoryId?: string;
  warehouseId?: number;
  [key: string]: unknown;
}

interface UseProductListParams {
  categoryId: string;
  params?: IProductListParams;
}

interface UseProductListReturn {
  listProduct: any[];
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

export function useProductList({ categoryId, params = {} }: UseProductListParams): UseProductListReturn {
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ Lưu params vào ref — luôn đọc được giá trị mới nhất
  //    mà KHÔNG gây re-render hay trigger useEffect
  const paramsRef = useRef<IProductListParams>(params);
  useEffect(() => {
    paramsRef.current = params;
  });

  const [listProduct, setListProduct] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [pagination, setPagination] = useState<IPagination>(DEFAULT_PAGINATION);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (paramsSearch: IProductListParams, signal: AbortSignal) => {
    setIsLoading(true);
    setIsNoItem(false);

    try {
      const response = await ProductService.list(paramsSearch, signal);

      if (response.code === 0) {
        const result = response.result;
        const sizeLimit = paramsSearch.limit ?? DataPaginationDefault.sizeLimit;
        const totalPage = Math.ceil(+result.total / +sizeLimit);

        // Map raw API fields → UI fields used by ProductGrid
        const mapped = (result.items ?? []).map((p: any) => {
          const stock = p.stockQuantity ?? 0;
          const price = p.originalPrice ?? p.promotionPrice ?? 0;
          return {
            ...p,
            // Tồn kho: tổng tất cả biến thể từ backend (stockQuantity = SUM variant quantities)
            minQuantity: stock,
            // Giá hiển thị
            priceLabel: price > 0 ? price.toLocaleString("vi") + " ₫" : "—",
            // Ảnh
            avatar: p.avatar ?? null,
            // Icon fallback
            icon: "📦",
            // Cảnh báo tồn kho thấp (≤ 5)
            lowStock: stock > 0 && stock <= 5,
            // Đơn vị
            unitName: p.unitName ?? p.unit ?? "",
          };
        });

        setListProduct((prev) => (paramsSearch.page === 1 ? mapped : [...prev, ...mapped]));
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
    const paramsSearch: IProductListParams = {
      ...paramsRef.current,
      ...(categoryId ? { categoryId } : {}),
    };

    fetchProducts(paramsSearch, controller.signal);
  }, [categoryId, fetchProducts]);
  //  ^^^^^^^^^^^^^^^^^^^^^^^^^
  //  Bỏ params ra khỏi deps — đọc qua ref thay thế
  //  → refetch chỉ tạo lại khi categoryId thực sự thay đổi

  // ── Auto fetch khi categoryId thay đổi ─────────────────────────────────────

  useEffect(() => {
    refetch();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [categoryId, params]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi categoryId — giá trị primitive (string)
  //  string so sánh bằng value, không bị lặp như object

  return {
    listProduct,
    isLoading,
    isNoItem,
    isPermissions,
    pagination,
    refetch,
  };
}