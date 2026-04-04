import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/utils/common";
import QrCodeProService from "@/services/QrCodeProService";
import { DataPaginationDefault } from "@/components/pagination/pagination";

interface UseReconciliationParams {
  params?: { limit: number; page: number }; // nếu sau này có params nào cần theo dõi để refetch thì thêm vào đây, ví dụ: { limit, page }
  enabled?: boolean; // ✅ mặc định true, truyền false để tắt
}
export type BankStmt = {
  date: string;
  ref: string;
  desc: string;
  amount: number;
  type: "thu" | "chi";
  matched: boolean;
};

interface UseGetReconciliationReturn {
  isLoading: boolean;
  isNoItem: boolean;
  isPermissions: boolean;
  dataReconciliation: BankStmt[] | [];
  pagination?: {
    page: number;
    sizeLimit: number;
    totalItem: number;
    totalPage: number;
    loadMoreAble?: boolean;
  };
}

interface IPagination {
  page: number;
  sizeLimit: number;
  totalItem: number;
  totalPage: number;
  loadMoreAble?: boolean;
}

const DEFAULT_PAGINATION: IPagination = {
  page: 1,
  sizeLimit: DataPaginationDefault.sizeLimit,
  totalItem: 0,
  totalPage: 0,
};

export function useReconciliationList({
  params, // nếu sau này có params nào cần theo dõi để refetch thì thêm vào đây, ví dụ: { limit, page }
  enabled = true, // ✅ mặc định true, truyền false để tắt
}: UseReconciliationParams): UseGetReconciliationReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNoItem, setIsNoItem] = useState<boolean>(false);
  const [isPermissions, setIsPermissions] = useState<boolean>(false);
  const [dataReconciliation, setDataReconciliation] = useState<BankStmt[]>([]);
  const [pagination, setPagination] = useState<IPagination>(DEFAULT_PAGINATION);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const fetchReconciliation = useCallback(async () => {
    setIsNoItem(false);

    try {
      const response = await QrCodeProService.reconciliation(params);

      if (response.code === 0) {
        const result = response.result;
        setDataReconciliation(mapReconciliation(result.items)); // map API về đúng format rồi set vào state
        setPagination({
          page: result.page,
          sizeLimit: params?.limit || DataPaginationDefault.sizeLimit,
          totalItem: result?.total || 0,
          totalPage: result?.totalPage || result?.total ? Math.ceil(result.total / (params?.limit || DataPaginationDefault.sizeLimit)) : 0,
          loadMoreAble:
            result.page < (result.totalPage || result?.total ? Math.ceil(result.total / (params?.limit || DataPaginationDefault.sizeLimit)) : 0),
        });
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
  }, [params]);

  // ── Refetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return; // ✅ guard: nếu không enabled thì không fetch
    setIsLoading(true);
    fetchReconciliation();
    // return () => {
    //   abortControllerRef.current?.abort();
    // };
  }, [enabled, params]);
  //  ^^^^^^^^^^^
  //  Chỉ theo dõi params và enabled — giá trị primitive (string/boolean)
  //  string/boolean so sánh bằng value, không bị lặp như object

  return {
    isLoading,
    isNoItem,
    isPermissions,
    dataReconciliation,
    pagination,
  };
}

// Đây là dữ liệu giả định API trả về, bạn có thể thay bằng response thật từ API
// const sampleResponse = [
//   {
//     id: 2,
//     date: "21/03/2026 21:37:56",
//     referenceNumber: null,
//     bankContent: "VQR39fb857fee THANH TOAN DON HANG",
//     amount: 100000,
//     displayAmount: "+ 100.000 VND",
//     transType: "C",
//     result: "RECEIVED",
//     resultName: "Đã nhận",
//     canManualMatch: false,
//     orderId: "6",
//     transactionId: null,
//   },
//   {
//     id: 1,
//     date: "21/03/2026 21:33:25",
//     referenceNumber: null,
//     bankContent: "abc",
//     amount: 1000,
//     displayAmount: "+ 1.000 VND",
//     transType: "99999",
//     result: "RECEIVED",
//     resultName: "Đã nhận",
//     canManualMatch: false,
//     orderId: "7",
//     transactionId: null,
//   },
// ];

// Đây là dữ liệu cần đổ ra UI
// const MOCK_BANK_STMTS: BankStmt[] = [
//   { date: "16/03", ref: "FT26075123", desc: "TT don hang SO2318", amount: 31200000, type: "thu", matched: true },
//   { date: "16/03", ref: "FT26075234", desc: "KH Nguyen Lan chuyen khoan", amount: 8750000, type: "thu", matched: true },
//   { date: "15/03", ref: "FT26074345", desc: "CHUYEN TIEN LUONG T3/2026", amount: 28000000, type: "chi", matched: false },
//   { date: "15/03", ref: "FT26074456", desc: "VNPAY QR giao dich online", amount: 3500000, type: "thu", matched: true },
//   { date: "14/03", ref: "FT26073567", desc: "TT nha cung cap Minh Hoang", amount: 12500000, type: "chi", matched: false },
// ];

// Đây là hàm để nhận đầu vào là dữ liệu giống như sampleResponse và trả về dữ liệu đã được map sang đúng format của MOCK_BANK_STMTS để dễ đổ ra UI
function mapReconciliation(detail): any {
  if (!detail || detail.length === 0) return [];
  return detail.map((item) => ({
    date: item.date, // giữ nguyên định dạng ngày tháng như API trả về
    ref: item.referenceNumber || "N/A", // nếu referenceNumber null thì hiển thị "N/A"
    desc: item.bankContent,
    amount: item.amount,
    type: item.transType === "C" ? "thu" : "chi", // nếu transType là "C" thì loại là "thu", ngược lại là "chi"
    matched: !item.canManualMatch, // giữ nguyên giá trị canManualMatch để biết giao dịch đã được đối soát hay chưa
  }));
}
