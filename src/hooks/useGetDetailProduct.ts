import { useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "@/utils/common";
import { DataPaginationDefault } from "@/components/pagination/pagination";
import CustomerService from "@/services/CustomerService";
import ProductService from "@/services/ProductService";

export interface VariantOption {
  id: string;
  label: string;
}

export interface VariantGroup {
  id: string;
  label: string; // vd: "Màu sắc", "RAM", "ROM"
  options: VariantOption[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  // map groupId → optionId
  combination: Record<string, string>;
}

export interface VariantProduct {
  id: string;
  name: string;
  image?: string;
  icon?: string;
  unit: string;
  variantGroups: VariantGroup[];
  variants: ProductVariant[];
}

interface UseGetVariantParams {
  productId: number;
  enabled?: boolean; // ✅ mặc định true, truyền false để tắt
}

interface UseGetVariantReturn {
  isLoading: boolean;
  isNoItem: boolean;
  isPermissions: boolean;
  dataProduct: VariantProduct | null;
}

export function useGetDetailProduct({
  productId,
  enabled = true, // ✅ mặc định true, truyền false để tắt
}: UseGetVariantParams): UseGetVariantReturn {
  console.log("productId in useGetVariant>>>", productId);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [dataProduct, setDataProduct] = useState<VariantProduct>(null);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (id: number) => {
    setIsNoItem(false);

    try {
      const response = await ProductService.detail(id);

      if (response.code === 0) {
        const result = response.result;
        console.log("result.fetchProducts1111111", result); // log kết quả đã map
        console.log("result.fetchProducts", mapToVariantProduct(result)); // log kết quả đã map
        setDataProduct(mapToVariantProduct(result)); // map API về đúng format rồi set vào state
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
        showToast("Có lỗi xảy ra. Vui lòng thử lại sau", "error");
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
    console.log("productId in useGetVariant", productId);
    if (!enabled) return; // ✅ guard: nếu không enabled thì không fetch
    setIsLoading(true);
    fetchProducts(productId);

    // return () => {
    //   abortControllerRef.current?.abort();
    // };
  }, [productId, enabled]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi params và enabled — giá trị primitive (string/boolean)
  //  string/boolean so sánh bằng value, không bị lặp như object

  return {
    isLoading,
    isNoItem,
    isPermissions,
    dataProduct,
  };
}

// đây là dữ liệu mẫu của API trả về khi gọi detail product, dùng để test UI trước khi API hoàn thiện

const sampleProductDetail = {
  id: 218,
  name: "Sony Xperia 1 VI",
  image: "",
  salePrice: 27300000,
  originalPrice: null,
  promotionPrice: null,
  discountType: "VND",
  totalSold: 0,
  voted: 0,
  reviewCount: 0,
  goodsType: 1,
  supplier: null,
  description: "Jsdanfkasfjosf",
  stockQuantity: 0,
  variantCount: 9,
  variantGroupCount: 3,
  variantGroups: [
    {
      id: 41,
      name: "Màu sắc",
      variantCount: 8,
      quantity: 0,
      options: [
        {
          id: 106,
          label: "Xanh Rêu",
          variantCount: 4,
          quantity: 0,
        },
        {
          id: 107,
          label: "Đen",
          variantCount: 4,
          quantity: 0,
        },
        {
          id: 108,
          label: "Đỏ",
          variantCount: 0,
          quantity: 0,
        },
      ],
    },
    {
      id: 42,
      name: "RAM",
      variantCount: 8,
      quantity: 0,
      options: [
        {
          id: 109,
          label: "12 GB",
          variantCount: 4,
          quantity: 0,
        },
        {
          id: 110,
          label: "16 GB",
          variantCount: 4,
          quantity: 0,
        },
      ],
    },
    {
      id: 43,
      name: "Bộ nhớ",
      variantCount: 8,
      quantity: 0,
      options: [
        {
          id: 111,
          label: "256 GB",
          variantCount: 4,
          quantity: 0,
        },
        {
          id: 112,
          label: "512 GB",
          variantCount: 4,
          quantity: 0,
        },
      ],
    },
  ],
  variants: [
    {
      id: 164,
      label: "SONY",
      sku: "SONY",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 28500000,
      promotionPrice: 27300000,
      optionValueIds: [],
      selectedOptions: [],
    },
    {
      id: 153,
      label: "Đen / 16 GB / 512 GB",
      sku: "S1V-BLACK-16-512",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 31000000,
      promotionPrice: 27300000,
      optionValueIds: [107, 110, 112],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 107,
          label: "Đen",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 110,
          label: "16 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 112,
          label: "512 GB",
        },
      ],
    },
    {
      id: 152,
      label: "Đen / 16 GB / 256 GB",
      sku: "S1V-BLACK-16-256",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 29500000,
      promotionPrice: 27300000,
      optionValueIds: [107, 110, 111],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 107,
          label: "Đen",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 110,
          label: "16 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 111,
          label: "256 GB",
        },
      ],
    },
    {
      id: 151,
      label: "Đen / 12 GB / 512 GB",
      sku: "S1V-BLACK-12-512",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 30000000,
      promotionPrice: 27300000,
      optionValueIds: [107, 109, 112],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 107,
          label: "Đen",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 109,
          label: "12 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 112,
          label: "512 GB",
        },
      ],
    },
    {
      id: 150,
      label: "Đen / 12 GB / 256 GB",
      sku: "S1V-BLACK-12-256",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 28500000,
      promotionPrice: 27300000,
      optionValueIds: [107, 109, 111],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 107,
          label: "Đen",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 109,
          label: "12 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 111,
          label: "256 GB",
        },
      ],
    },
    {
      id: 149,
      label: "Xanh Rêu / 16 GB / 512 GB",
      sku: "S1V-GREEN-16-512",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 31000000,
      promotionPrice: 27300000,
      optionValueIds: [106, 110, 112],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 106,
          label: "Xanh Rêu",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 110,
          label: "16 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 112,
          label: "512 GB",
        },
      ],
    },
    {
      id: 148,
      label: "Xanh Rêu / 16 GB / 256 GB",
      sku: "S1V-GREEN-16-256",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 29500000,
      promotionPrice: 27300000,
      optionValueIds: [106, 110, 111],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 106,
          label: "Xanh Rêu",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 110,
          label: "16 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 111,
          label: "256 GB",
        },
      ],
    },
    {
      id: 147,
      label: "Xanh Rêu / 12 GB / 512 GB",
      sku: "S1V-GREEN-12-512",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 30000000,
      promotionPrice: 27300000,
      optionValueIds: [106, 109, 112],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 106,
          label: "Xanh Rêu",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 109,
          label: "12 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 112,
          label: "512 GB",
        },
      ],
    },
    {
      id: 146,
      label: "Xanh Rêu / 12 GB / 256 GB",
      sku: "S1V-GREEN-12-256",
      quantity: 0,
      unitId: 1,
      unitName: "Lọ",
      price: 28500000,
      promotionPrice: 27300000,
      optionValueIds: [106, 109, 111],
      selectedOptions: [
        {
          groupId: 41,
          groupName: "Màu sắc",
          optionValueId: 106,
          label: "Xanh Rêu",
        },
        {
          groupId: 42,
          groupName: "RAM",
          optionValueId: 109,
          label: "12 GB",
        },
        {
          groupId: 43,
          groupName: "Bộ nhớ",
          optionValueId: 111,
          label: "256 GB",
        },
      ],
    },
  ],
  specifications: [],
};

// Đây là dữ liệu cần đổ ra UI
const MOCK_IPHONE: VariantProduct = {
  id: "iphone14",
  name: "iPhone 14",
  icon: "📱",
  unit: "chiếc",
  variantGroups: [
    {
      id: "color",
      label: "Màu sắc",
      options: [
        { id: "pink", label: "Hồng" },
        { id: "black", label: "Đen" },
        { id: "white", label: "Trắng" },
        { id: "blue", label: "Xanh" },
      ],
    },
    {
      id: "ram",
      label: "RAM",
      options: [
        { id: "ram6", label: "6 GB" },
        { id: "ram8", label: "8 GB" },
        { id: "ram16", label: "16 GB" },
      ],
    },
    {
      id: "rom",
      label: "Bộ nhớ",
      options: [
        { id: "rom128", label: "128 GB" },
        { id: "rom256", label: "256 GB" },
        { id: "rom512", label: "512 GB" },
      ],
    },
  ],
  variants: [
    { id: "v1", sku: "IP14-PK-R6-128", price: 22990000, stock: 5, combination: { color: "pink", ram: "ram6", rom: "rom128" } },
    { id: "v2", sku: "IP14-PK-R8-128", price: 24990000, stock: 3, combination: { color: "pink", ram: "ram8", rom: "rom128" } },
    { id: "v3", sku: "IP14-PK-R8-256", price: 27990000, stock: 8, combination: { color: "pink", ram: "ram8", rom: "rom256" } },
    { id: "v4", sku: "IP14-PK-R16-256", price: 30990000, stock: 2, combination: { color: "pink", ram: "ram16", rom: "rom256" } },
    { id: "v5", sku: "IP14-PK-R16-512", price: 35990000, stock: 0, combination: { color: "pink", ram: "ram16", rom: "rom512" } },
    { id: "v6", sku: "IP14-BK-R6-128", price: 22990000, stock: 10, combination: { color: "black", ram: "ram6", rom: "rom128" } },
    { id: "v7", sku: "IP14-BK-R8-256", price: 27990000, stock: 6, combination: { color: "black", ram: "ram8", rom: "rom256" } },
    { id: "v8", sku: "IP14-BK-R16-512", price: 35990000, stock: 4, combination: { color: "black", ram: "ram16", rom: "rom512" } },
    { id: "v9", sku: "IP14-WH-R8-128", price: 24990000, stock: 7, combination: { color: "white", ram: "ram8", rom: "rom128" } },
    { id: "v10", sku: "IP14-BL-R16-256", price: 30990000, stock: 0, combination: { color: "blue", ram: "ram16", rom: "rom256" } },
  ],
};

// Đây là hàm để nhận đầu vào là dữ liệu giống như sampleProductDetail và trả về dữ liệu đã được map sang đúng format của VariantProduct để dễ đổ ra UI
function mapToVariantProduct(detail): VariantProduct {
  return {
    id: String(detail.id),
    name: detail.name,
    icon: detail?.icon || "📦",
    unit: detail.unitName,
    variantGroups: detail.variantGroups.map((vg) => ({
      id: String(vg.id),
      label: vg.name,
      options: vg.options.map((opt) => ({
        id: String(opt.id),
        label: opt.label,
      })),
    })),
    variants: detail.variants.map((v) => ({
      id: String(v.id),
      sku: v.sku,
      price: v.price,
      // stock: v?.quantity ?? 0, // giả sử API mới có thêm trường quantity để biết chính xác tồn kho từng biến thể
      stock: 100, // giả sử API mới có thêm trường quantity để biết chính xác tồn kho từng biến thể
      combination: v.selectedOptions.reduce((acc, opt) => {
        acc[String(opt.groupId)] = String(opt.optionValueId);
        return acc;
      }, {}),
    })),
  };
}
