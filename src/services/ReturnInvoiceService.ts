import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IReturnInvoiceListParams,
  IReturnInvoiceResponse,
  ICreateReturnRequest,
  ICreateExchangeRequest,
  IVariantDetail,
  VariantMap,
  mapApiToUi,
  enrichProductSummary,
  ReturnProduct,
} from "@/types/returnProduct";

export default {
  /** Danh sách phiếu trả / đổi hàng */
  list: (params?: IReturnInvoiceListParams, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /** Chi tiết 1 phiếu */
  detail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.detail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Tìm hóa đơn gốc theo mã để autofill form
   */
  findByCode: (invoiceCode: string, signal?: AbortSignal) => {
    const params = {
      invoiceCode: invoiceCode.trim(),
      invoiceTypes: JSON.stringify(["IV1"]),
      page: 0,
      limit: 1,
    };
    return fetch(`${urlsApi.invoice.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Lấy items còn được phép trả từ HĐ gốc
   */
  getReturnItems: (originalInvoiceId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.returnInvoice.getReturnItems}?id=${originalInvoiceId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /** Tạo phiếu trả hàng (IV2) */
  createReturn: (body: ICreateReturnRequest) => {
    return fetch(urlsApi.returnInvoice.createReturn, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  /** Tạo phiếu đổi hàng (IV11) */
  createExchange: (body: ICreateExchangeRequest) => {
    return fetch(urlsApi.returnInvoice.createExchange, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // ─── Inventory enrich ────────────────────────────────────────────────────────

  /**
   * Lấy chi tiết variant từ Inventory microservice theo danh sách ID.
   * GET /inventory/productVariant/list-detail?lstId=1,2,3
   *
   * Trả về VariantMap: { [variantId]: IVariantDetail }
   */
  fetchVariantDetails: async (
    variantIds: number[],
    signal?: AbortSignal
  ): Promise<VariantMap> => {
    if (variantIds.length === 0) return {};

    const uniqueIds = [...new Set(variantIds)];
    try {
      const res = await fetch(
        `${urlsApi.returnInvoice.variantListDetail}?lstId=${uniqueIds.join(",")}`,
        { signal, method: "GET" }
      );
      const json = await res.json();

      const list: IVariantDetail[] = json?.result ?? json?.data ?? [];
      return list.reduce((acc, v) => {
        acc[v.id] = v;
        return acc;
      }, {} as VariantMap);
    } catch {
      return {};
    }
  },

  /**
   * Wrapper tổng hợp:
   *  1. Gọi list API → lấy danh sách phiếu
   *  2. Collect tất cả variantId từ products trong response
   *  3. Gọi Inventory để lấy tên variant
   *  4. enrich productSummary cho từng phiếu
   *
   * Trả về ReturnProduct[] đã có productSummary đầy đủ.
   */
  listAndEnrich: async (
    params?: IReturnInvoiceListParams,
    signal?: AbortSignal
  ): Promise<{ items: ReturnProduct[]; total: number }> => {
    const res = await fetch(
      `${urlsApi.returnInvoice.list}${convertParamsToString(
        Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null))
      )}`,
      { signal, method: "GET" }
    ).then((r) => r.json());

    // Extract items từ response (hỗ trợ cả 2 cấu trúc)
    const rawItems: IReturnInvoiceResponse[] =
      res?.result?.items ??
      res?.result?.pagedLst?.items ??
      res?.result?.data ??
      [];

    const total: number =
      res?.result?.total ??
      res?.result?.pagedLst?.total ??
      0;

    if (rawItems.length === 0) return { items: [], total };

    // Collect tất cả variantId duy nhất trong batch này
    const allVariantIds: number[] = [];
    rawItems.forEach((item) => {
      (item.products ?? []).forEach((p) => {
        if (p.variantId) allVariantIds.push(p.variantId);
      });
    });

    // Fetch variant details 1 lần cho cả batch
    const variantMap = await (
      // eslint-disable-next-line no-async-promise-executor
      new ReturnInvoiceServiceClass().fetchVariantDetailsStatic(allVariantIds, signal)
    );

    // Map → UI type + enrich productSummary
    const items = rawItems.map((raw) =>
      enrichProductSummary(mapApiToUi(raw), raw, variantMap)
    );

    return { items, total };
  },
};

/**
 * Internal helper class để tái sử dụng fetchVariantDetails trong listAndEnrich
 * (tránh circular reference với default export object)
 */
class ReturnInvoiceServiceClass {
  async fetchVariantDetailsStatic(
    variantIds: number[],
    signal?: AbortSignal
  ): Promise<VariantMap> {
    if (variantIds.length === 0) return {};
    const uniqueIds = [...new Set(variantIds)];
    try {
      const res = await fetch(
        `${urlsApi.returnInvoice.variantListDetail}?lstId=${uniqueIds.join(",")}`,
        { signal, method: "GET" }
      );
      const json = await res.json();
      const list: IVariantDetail[] = json?.result ?? json?.data ?? [];
      return list.reduce((acc, v) => { acc[v.id] = v; return acc; }, {} as VariantMap);
    } catch {
      return {};
    }
  }
}