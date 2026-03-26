/**
 * useCustomerEnrich
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook/utility tái sử dụng để enrich thông tin khách hàng mở rộng từ
 * /adminapi/customer/list_by_id cho bất kỳ danh sách nào có customerId.
 *
 * Vấn đề giải quyết:
 *   Các API bán hàng (sales) chỉ trả về customerId nhưng KHÔNG trả về
 *   customerName / customerPhone. Cần gọi sang adminapi để lấy tên + SĐT.
 *
 * Cách dùng:
 *   const { customerMap, enrichList } = useCustomerEnrich();
 *
 *   // Sau khi lấy được danh sách invoice:
 *   const customerIds = items.map(i => i.customerId).filter(Boolean);
 *   await enrichList(customerIds);
 *
 *   // Lấy thông tin khách:
 *   const info = customerMap[customerId]; // { name, phone, avatar, ... }
 *
 * Hoặc dùng hàm static (không cần hook):
 *   const map = await fetchCustomerMap([1, 2, 3]);
 */

import { useState, useCallback, useRef } from "react";
import CustomerService from "@/services/CustomerService";

// ── Kiểu dữ liệu trả về cho mỗi khách hàng ──────────────────────────────────

export interface ICustomerInfo {
  id: number;
  name: string;
  phone?: string;
  phoneMasked?: string;
  email?: string;
  avatar?: string;
  code?: string;
  /** Tên rút gọn – chữ cái đầu tiên để hiển thị avatar text */
  initial: string;
}

/** Map customerId → ICustomerInfo */
export type CustomerMap = Record<number, ICustomerInfo>;

// ── Helper: chuyển response item → ICustomerInfo ─────────────────────────────

function toCustomerInfo(raw: any): ICustomerInfo {
  return {
    id: raw.id,
    name: raw.name ?? raw.contactName ?? "Khách vãng lai",
    phone: raw.phoneUnmasked ?? raw.phone ?? "",
    phoneMasked: raw.phoneMasked ?? "",
    email: raw.email ?? "",
    avatar: raw.avatar ?? "",
    code: raw.code ?? "",
    initial: (raw.name ?? raw.contactName ?? "K").charAt(0).toUpperCase(),
  };
}

// ── Static helper: dùng khi không cần React state ────────────────────────────

/**
 * Batch-fetch thông tin khách hàng theo danh sách ID.
 * Tự động bỏ qua ID null/0, dedup, và trả về map.
 *
 * @param ids  - Mảng customerId (có thể chứa null/undefined/0)
 * @param signal - AbortSignal tuỳ chọn
 * @returns    CustomerMap  (id → ICustomerInfo), hoặc {} nếu không có ID hợp lệ
 */
export async function fetchCustomerMap(
  ids: (number | null | undefined)[],
  signal?: AbortSignal
): Promise<CustomerMap> {
  // Lọc ID hợp lệ (>0), dedup
  const validIds = [...new Set(ids.filter((id): id is number => !!id && id > 0))];
  if (validIds.length === 0) return {};

  try {
    const response = await CustomerService.listById(
      {
        lstId: validIds.join(","),
        limit: validIds.length,
        page: 1,
      },
      signal
    );

    if (response.code !== 0 || !response.result?.items) return {};

    const map: CustomerMap = {};
    for (const item of response.result.items as any[]) {
      map[item.id] = toCustomerInfo(item);
    }
    return map;
  } catch (err: any) {
    if (err?.name === "AbortError") return {};
    console.warn("[useCustomerEnrich] fetchCustomerMap error:", err);
    return {};
  }
}

// ── React Hook ────────────────────────────────────────────────────────────────

interface UseCustomerEnrichReturn {
  /** Map customerId → ICustomerInfo, được cập nhật sau mỗi lần enrichList */
  customerMap: CustomerMap;
  /**
   * Batch-fetch và merge vào customerMap.
   * Gọi sau khi lấy được danh sách cần enrich.
   */
  enrichList: (ids: (number | null | undefined)[], signal?: AbortSignal) => Promise<void>;
  /** Lấy ICustomerInfo theo id, fallback về giá trị mặc định nếu chưa có */
  getCustomer: (id: number | null | undefined, fallbackName?: string) => ICustomerInfo;
  /** Reset map về rỗng */
  reset: () => void;
}

const DEFAULT_CUSTOMER: ICustomerInfo = {
  id: 0,
  name: "Khách vãng lai",
  phone: "",
  initial: "K",
};

export function useCustomerEnrich(): UseCustomerEnrichReturn {
  const [customerMap, setCustomerMap] = useState<CustomerMap>({});
  // Dùng ref để tránh fetchCustomerMap gọi lại không cần thiết
  const mapRef = useRef<CustomerMap>({});

  const enrichList = useCallback(
    async (ids: (number | null | undefined)[], signal?: AbortSignal) => {
      // Chỉ fetch những ID chưa có trong cache
      const missing = ids.filter(
        (id): id is number => !!id && id > 0 && !mapRef.current[id]
      );

      if (missing.length === 0) return;

      const fetched = await fetchCustomerMap(missing, signal);
      if (Object.keys(fetched).length === 0) return;

      mapRef.current = { ...mapRef.current, ...fetched };
      setCustomerMap({ ...mapRef.current });
    },
    []
  );

  const getCustomer = useCallback(
    (id: number | null | undefined, fallbackName = "Khách vãng lai"): ICustomerInfo => {
      if (!id || id <= 0) return { ...DEFAULT_CUSTOMER, name: fallbackName };
      return (
        mapRef.current[id] ?? {
          ...DEFAULT_CUSTOMER,
          id,
          name: fallbackName,
        }
      );
    },
    []
  );

  const reset = useCallback(() => {
    mapRef.current = {};
    setCustomerMap({});
  }, []);

  return { customerMap, enrichList, getCustomer, reset };
}
