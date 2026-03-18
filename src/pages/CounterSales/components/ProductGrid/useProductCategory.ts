import { useEffect, useRef, useState } from "react";
import { ICategoryServiceFilterRequest } from "@/model/categoryService/CategoryServiceRequestModel";
import CategoryServiceService from "@/services/CategoryServiceService";
import { showToast } from "@/utils/common";

interface CategoryItem {
  id: string;
  label: string;
}

interface UseProductCategoryReturn {
  categoryFiltered: CategoryItem[];
  isLoadingCategory: boolean;
  isPermissions: boolean;
}

const DEFAULT_PARAMS: ICategoryServiceFilterRequest = {
  limit: 200,
  page: 1,
  type: 2,
};

const ALL_CATEGORY: CategoryItem = { id: "", label: "⭐ Tất cả" };

export function useProductCategory(): UseProductCategoryReturn {
  const [categoryFiltered, setCategoryFiltered] = useState<CategoryItem[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState<boolean>(true);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);

  const fetchCategories = async (params: ICategoryServiceFilterRequest, signal: AbortSignal) => {
    setIsLoadingCategory(true);
    try {
      const response = await CategoryServiceService.list(params, signal);

      if (response.code === 0) {
        const items: CategoryItem[] = response.result.items.map((item) => ({
          id: item.groupId,
          label: item.groupName,
        }));
        setCategoryFiltered([ALL_CATEGORY, ...items]);
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
      setIsLoadingCategory(false);
    }
  };

  // ✅ Bỏ isMounted — fetch thẳng khi mount
  useEffect(() => {
    const abortController = new AbortController();
    fetchCategories(DEFAULT_PARAMS, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  return {
    categoryFiltered,
    isLoadingCategory,
    isPermissions,
  };
}
