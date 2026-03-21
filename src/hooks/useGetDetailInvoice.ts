import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/utils/common";
import InvoiceService from "@/services/InvoiceService";
import { formatCurrency } from "reborn-util";

interface UseGetDetailInvoiceParams {
  invoiceId: number;
  enabled?: boolean; // ✅ mặc định true, truyền false để tắt
}

interface UseGetDetailInvoiceReturn {
  isLoading: boolean;
  isNoItem: boolean;
  isPermissions: boolean;
  dataInvoice: any;
}

export function useGetDetailInvoice({
  invoiceId,
  enabled = true, // ✅ mặc định true, truyền false để tắt
}: UseGetDetailInvoiceParams): UseGetDetailInvoiceReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [dataInvoice, setDataInvoice] = useState<any>(null);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchInvoice = useCallback(async (id: number) => {
    setIsNoItem(false);

    try {
      const response = await InvoiceService.invoiceDetail({ id: id });

      if (response.code === 0) {
        const result = response.result;
        setDataInvoice(mappedDataInvoice(result)); // map dữ liệu API về đúng format UI cần
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
    if (!enabled || !invoiceId || invoiceId <= 0) return; // ✅ guard: nếu không enabled thì không fetch
    setIsLoading(true);
    fetchInvoice(invoiceId);

    // return () => {
    //   abortControllerRef.current?.abort();
    // };
  }, [invoiceId, enabled]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi params và enabled — giá trị primitive (string/boolean)
  //  string/boolean so sánh bằng value, không bị lặp như object

  return {
    isLoading,
    isNoItem,
    isPermissions,
    dataInvoice,
  };
}

// Đây là dữ liệu mẫu do API trả về trong response.result
const invoiceData = {
  services: null,
  products: [
    {
      invoiceId: 3188,
      bptId: 564,
      productId: 228,
      variantId: 171,
      productAvatar: "https://cloud-cdn.reborn.vn/reborn/2026/03/18/b69a3b61-b747-4666-8d8b-519f2fea6e7e-1773809046.jpg",
      name: "Mac dinh",
      qty: 1,
      price: 280000,
    },
  ],
  boughtCardServices: null,
  boughtCards: null,
  invoiceId: 3188,
  invoice: {
    id: 3188,
    invoiceCode: "HD003188",
    invoiceType: "IV1",
    amountCard: 0,
    amount: 280000,
    discount: 0,
    vatAmount: 0,
    fee: 280000,
    paid: 0,
    debt: 0,
    paymentType: 1,
    status: 1,
    receiptDate: "2026-03-19T22:29:55",
    createdTime: "2026-03-19T22:28:30",
    updatedTime: "2026-03-19T22:28:30",
    employeeId: 54,
    customerId: 4662739,
    branchId: 23,
    bsnId: 6,
    campaignId: 0,
  },
};

// Đây là dữ liệu mà tôi cần map vào dataInvoice để đưa vào UI, dựa trên invoiceData từ API
const MOCK_DETAIL_INVOICE = {
  id: 123,
  code: "#DH-20231021-0042",
  source: "offline",
  customer: { id: "1", name: "Nguyễn Thị Hoa", phone: "0901 234 567", points: 2450, tier: "Bạc", color: "#d97706", rank: "Bạc" },
  paymentMethod: "Tiền mặt",
  createdTime: "2023-10-21T09:45:00",
  status: "pending",
  items: [
    { icon: "🥛", name: "Sữa TH True Milk 1L", detail: "2 hộp × 32,000 ₫", total: "64,000 ₫" },
    { icon: "🍜", name: "Mì Hảo Hảo Tôm Chua", detail: "5 gói × 4,500 ₫", total: "22,500 ₫" },
    { icon: "🥤", name: "Pepsi 330ml", detail: "3 lon × 12,000 ₫", total: "36,000 ₫" },
  ],
  timeLine: [
    { icon: "✅", label: "Tạo đơn", done: true, active: false },
    { icon: "⏳", label: "Chờ xử lý", done: false, active: true },
    { icon: "🚚", label: "Đang giao", done: false, active: false },
    { icon: "✅", label: "Hoàn thành", done: false, active: false },
  ],
};
const mappedDataInvoice = (invoiceDataApi) => {
  return {
    id: invoiceDataApi.invoiceId,
    code: invoiceDataApi.invoice.invoiceCode,
    source: "offline", // Cần map từ invoiceType hoặc một trường nào đó trong invoiceDataApi
    customer: {
      id: invoiceDataApi.invoice.customerId,
      name: "Tên khách hàng", // Cần map từ một trường nào đó trong invoiceDataApi
      phone: "Số điện thoại", // Cần map từ một trường nào đó trong invoiceDataApi
      points: 0, // Cần map từ một trường nào đó trong invoiceDataApi
      tier: "", // Cần map từ một trường nào đó trong invoiceDataApi
      color: "#d97706", // Cần map từ một trường nào đó trong invoiceDataApi
      rank: "Bạc", // Cần map từ một trường nào đó trong invoiceDataApi
    },
    paymentMethod: invoiceDataApi.invoice.paymentType === 1 ? "Tiền mặt" : "Phương thức khác", // Cần map từ paymentType
    createdTime: invoiceDataApi.invoice.createdTime,
    status: invoiceDataApi.invoice.status === 1 ? "pending" : invoiceDataApi.invoice.status === 2 ? "success" : "cancelled", // Cần map từ status
    items: invoiceDataApi.products.map((product) => ({
      icon: "📦", // Cần map từ một trường nào đó trong product
      image: product?.productAvatar || "", // Cần map từ productAvatar
      name: product.name,
      detail: `${product.qty} × ${formatCurrency(product.price)}`, // Cần map từ qty và price
      total: `${product.qty * product.price}`, // Cần tính toán từ qty và price
    })),
    timeLine: [
      { icon: "✅", label: "Tạo đơn", done: true, active: false },
      { icon: "⏳", label: "Chờ xử lý", done: invoiceDataApi.invoice.status === 1, active: invoiceDataApi.invoice.status === 1 },
      { icon: "🚚", label: "Đang giao", done: invoiceDataApi.invoice.status === 2, active: invoiceDataApi.invoice.status === 2 },
      { icon: "✅", label: "Hoàn thành", done: invoiceDataApi.invoice.status === 2, active: invoiceDataApi.invoice.status === 2 },
    ],
  };
};
