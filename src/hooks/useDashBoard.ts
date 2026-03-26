import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/utils/common";
import ProductService from "@/services/ProductService";
import DashBoardService from "@/services/DashBoardService";

interface UseGetDashBoardParams {
  enabled?: boolean; // ✅ mặc định true, truyền false để tắt
}
interface TopProduct {
  name: string;
  revenue: number;
  pct: number;
  color: string;
}

interface IDataRevenue {
  stats: IStats;
  listOrderByHour: number[];
}

interface UseGetDashBoardReturn {
  isLoading: boolean;
  isNoItem: boolean;
  isPermissions: boolean;
  dataTopProduct: TopProduct[] | [];
  dataRevenue: IDataRevenue;
}

export interface IStats {
  totalRevenue: number;
  totalOrder: number;
  totalCancelOrder: number;
  todayRevenue: number;
  todayOrder: number;
}

const defaultRevenueData: IDataRevenue = {
  stats: {
    totalRevenue: 0,
    totalOrder: 0,
    totalCancelOrder: 0,
    todayRevenue: 0,
    todayOrder: 0,
  },
  listOrderByHour: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export function useDashBoard({
  enabled = true, // ✅ mặc định true, truyền false để tắt
}: UseGetDashBoardParams): UseGetDashBoardReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [dataTopProduct, setDataTopProduct] = useState<TopProduct[]>([]);
  const [dataRevenue, setDataRevenue] = useState<IDataRevenue>(defaultRevenueData);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchTopProducts = useCallback(async () => {
    setIsNoItem(false);

    try {
      const response = await ProductService.topProduct();

      if (response.code === 0) {
        const result = response.result;
        setDataTopProduct(mapToTopProduct(result)); // map API về đúng format rồi set vào state
        setIsNoItem(false);
      } else if (response.code === 400) {
        setIsPermissions(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
    } catch (error) {
      if (error?.name === "AbortError") {
        console.log("Request was aborted");
      } else {
        showToast(error?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRevenue = useCallback(async () => {
    setIsNoItem(false);

    try {
      const response = await DashBoardService.detail();

      if (response.code === 0) {
        const result = response.result;
        setDataRevenue(mapToRevenueDetail(result)); // map API về đúng format rồi set vào state
        setIsNoItem(false);
      } else if (response.code === 400) {
        setIsPermissions(true);
      } else {
        showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
      setIsLoading(false);
    } catch (error) {
      if (error?.name === "AbortError") {
        console.log("Request was aborted");
      } else {
        showToast(error?.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Refetch ─────────────────────────────────────────────────────────────────

  //  ^^^^^^^^^^^^^^^^^^^^^^^^^
  //  Bỏ params ra khỏi deps — đọc qua ref thay thế
  //  → refetch chỉ tạo lại khi categoryId thực sự thay đổi

  // ── Auto fetch khi categoryId thay đổi ─────────────────────────────────────

  useEffect(() => {
    if (!enabled) return; // ✅ guard: nếu không enabled thì không fetch
    setIsLoading(true);
    fetchTopProducts();
    fetchRevenue();

    // return () => {
    //   abortControllerRef.current?.abort();
    // };
  }, [enabled]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi params và enabled — giá trị primitive (string/boolean)
  //  string/boolean so sánh bằng value, không bị lặp như object

  return {
    isLoading,
    isNoItem,
    isPermissions,
    dataTopProduct,
    dataRevenue,
  };
}

// Đây là dữ liệu giả định API trả về, bạn có thể thay bằng response thật từ API
const sampleProductDetail = [
  {
    productId: 262,
    productName: "SP test 2",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 303,
    variantName: "Mac dinh",
    totalQty: 101,
    totalRevenue: null,
  },
  {
    productId: 218,
    productName: "Sony Xperia 1 VI",
    avatar: null,
    unitId: null,
    unitName: "Lọ",
    variantId: 149,
    variantName: "Xanh Rêu / 16 GB / 512 GB",
    totalQty: 8,
    totalRevenue: null,
  },
  {
    productId: 223,
    productName: "xúc xích",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 166,
    variantName: "Mac dinh",
    totalQty: 7,
    totalRevenue: null,
  },
  {
    productId: 219,
    productName: "Trà nhân trần",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 180,
    variantName: "Mac dinh",
    totalQty: 7,
    totalRevenue: null,
  },
  {
    productId: 233,
    productName: "Túi Tote Canvas",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 176,
    variantName: "Mac dinh",
    totalQty: 5,
    totalRevenue: null,
  },
  {
    productId: null,
    productName: null,
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: null,
    variantName: null,
    totalQty: 3,
    totalRevenue: null,
  },
  {
    productId: 224,
    productName: "Áo Polo Nam CoolMax",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 167,
    variantName: "Mac dinh",
    totalQty: 3,
    totalRevenue: null,
  },
  {
    productId: 228,
    productName: "Quần Jogger Unisex",
    avatar: null,
    unitId: null,
    unitName: null,
    variantId: 171,
    variantName: "Mac dinh",
    totalQty: 3,
    totalRevenue: null,
  },
  {
    productId: 217,
    productName: "Asus ROG Phone 8 Pro",
    avatar: null,
    unitId: null,
    unitName: "Lọ",
    variantId: 141,
    variantName: "Đen Nhám / 24 GB / 1 TB",
    totalQty: 3,
    totalRevenue: null,
  },
  {
    productId: 218,
    productName: "Sony Xperia 1 VI",
    avatar: null,
    unitId: null,
    unitName: "Lọ",
    variantId: 153,
    variantName: "Đen / 16 GB / 512 GB",
    totalQty: 2,
    totalRevenue: null,
  },
];

// Đây là dữ liệu cần đổ ra UI
const topProducts = [
  { name: "Modern Wifi 350", revenue: "10 N", pct: 85.6, color: "#47B5AC" },
  { name: "Sim Viettel 350", revenue: "9,8 N", pct: 61.5, color: "#47B5AC" },
  { name: "Modern Wifi 350", revenue: "9,7 N", pct: 59.3, color: "#47B5AC" },
  { name: "Modern Wifi 350", revenue: "8,5 N", pct: 57.7, color: "#47B5AC" },
];

// Đây là hàm để nhận đầu vào là dữ liệu giống như sampleProductDetail và trả về dữ liệu đã được map sang đúng format của topProducts để dễ đổ ra UI
function mapToTopProduct(detail): any {
  if (!detail || detail.length === 0) return [];

  // Tính max để vẽ thanh bar tương đối (tránh bar vượt 100%)
  const maxQty     = Math.max(...detail.map((i) => i.totalQty     ?? 0), 1);
  const maxRevenue = Math.max(...detail.map((i) => i.totalRevenue ?? 0), 1);

  return detail.map((item) => ({
    name:       (item.productName ?? "Sản phẩm không tên") + (item.variantName ? ` (${item.variantName})` : ""),
    revenue:    item.totalRevenue ?? null,
    qty:        item.totalQty    ?? 0,
    pctQty:     Math.round(((item.totalQty     ?? 0) / maxQty)     * 100),
    pctRevenue: Math.round(((item.totalRevenue ?? 0) / maxRevenue) * 100),
    color:      "#47B5AC",
  }));
}

// Đây là dữ liệu giả định API trả về khi fetchRevenue
const sampleRevenueDetail = {
  totalRevenue: 361651200,
  totalOrder: 16,
  totalCancelOrder: 4,
  todayRevenue: 30990000,
  todayOrder: 1,
  orderByHour: [
    {
      hour: 0,
      totalOrder: 1,
    },
    {
      hour: 1,
      totalOrder: 0,
    },
    {
      hour: 2,
      totalOrder: 0,
    },
    {
      hour: 3,
      totalOrder: 0,
    },
    {
      hour: 4,
      totalOrder: 0,
    },
    {
      hour: 5,
      totalOrder: 0,
    },
    {
      hour: 6,
      totalOrder: 0,
    },
    {
      hour: 7,
      totalOrder: 0,
    },
    {
      hour: 8,
      totalOrder: 0,
    },
    {
      hour: 9,
      totalOrder: 0,
    },
    {
      hour: 10,
      totalOrder: 0,
    },
    {
      hour: 11,
      totalOrder: 0,
    },
    {
      hour: 12,
      totalOrder: 0,
    },
    {
      hour: 13,
      totalOrder: 0,
    },
    {
      hour: 14,
      totalOrder: 0,
    },
    {
      hour: 15,
      totalOrder: 0,
    },
    {
      hour: 16,
      totalOrder: 0,
    },
    {
      hour: 17,
      totalOrder: 0,
    },
    {
      hour: 18,
      totalOrder: 0,
    },
    {
      hour: 19,
      totalOrder: 0,
    },
    {
      hour: 20,
      totalOrder: 0,
    },
    {
      hour: 21,
      totalOrder: 0,
    },
    {
      hour: 22,
      totalOrder: 0,
    },
    {
      hour: 23,
      totalOrder: 0,
    },
  ],
};

// Đây là hàm để nhận đầu vào là dữ liệu giống như sampleRevenueDetail và trả về dữ liệu đã được map sang đúng format của dataRevenue để dễ đổ ra UI
function mapToRevenueDetail(detail): IDataRevenue {
  if (!detail) return defaultRevenueData;
  return {
    stats: {
      totalRevenue: detail.totalRevenue || 0,
      totalOrder: detail.totalOrder || 0,
      totalCancelOrder: detail.totalCancelOrder || 0,
      todayRevenue: detail.todayRevenue || 0,
      todayOrder: detail.todayOrder || 0,
    },
    listOrderByHour: detail.orderByHour
      ? detail.orderByHour.map((item) => item.totalOrder)
      : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };
}