import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

const websiteSettingUpdateUrls = {
  showOnWebsite: urlsApi.product.wWebsiteSettingUpdateShowOnWebsite,
  showImage: urlsApi.product.wWebsiteSettingUpdateShowImage,
  showUnit: urlsApi.product.wWebsiteSettingUpdateShowUnit,
  showDescription: urlsApi.product.wWebsiteSettingUpdateShowDescription,
  showPromotionPrice: urlsApi.product.wWebsiteSettingUpdateShowPromotionPrice,
  showWholesalePrice: urlsApi.product.wWebsiteSettingUpdateShowWholesalePrice,
  showInventory: urlsApi.product.wWebsiteSettingUpdateShowInventory,
  showBarcode: urlsApi.product.wWebsiteSettingUpdateShowBarcode,
  showVariant: urlsApi.product.wWebsiteSettingUpdateShowVariant,
  hideWhenOutOfStock: urlsApi.product.wWebsiteSettingUpdateHideWhenOutOfStock,
} as const;

export default {
  // ── API cũ (adminapi) ──
  topProduct: (signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.topProduct}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  /**
   * Top sản phẩm v2 — hỗ trợ sortBy: "qty" | "revenue"
   * cloud-sales tự gọi sang cloud-inventory để lấy tên variant
   */
  /**
   * GET /sales/invoice/topProduct/export?sortBy=qty|revenue
   * Xuất top sản phẩm bán chạy ra Base64 xlsx.
   */
  wExportTopProduct: (sortBy: "qty" | "revenue" = "qty", signal?: AbortSignal): Promise<string> => {
    return fetch(`${urlsApi.product.topProductExport}?sortBy=${sortBy}`, { method: "GET", signal })
      .then(async r => {
        const j = await r.json();
        if (j.code !== 0) throw new Error(j.message ?? "Xuất Excel thất bại");
        return j.result as string;
      });
  },

  topProductV2: (sortBy: "qty" | "revenue" = "qty", signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.topProductV2}?sortBy=${sortBy}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  filterWarehouse: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.filterWarehouse, params, signal);
  },
  list: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.list, params, signal);
  },
  listById: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.listById, params, signal);
  },
  update: (body: IProductRequest) => {
    return apiPost(urlsApi.product.update, body);
  },
  detail: (id: number, branchId?: number) => {
    const qs = branchId ? `?id=${id}&branchId=${branchId}` : `?id=${id}`;
    return fetch(`${urlsApi.product.detail}${qs}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.product.delete}?id=${id}`);
  },
  listShared: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.listShared, params, signal);
  },
  updateContent: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.product.updateContent, body);
  },

  // ── Warehouse API (tài liệu mới) ──
  wList: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    // convertParamsToString có thể drop các giá trị số 0 vì falsy
    // Build query string thủ công để đảm bảo các numeric filter được serialize đúng
    const base: Record<string, unknown> = {};
    if (params) {
      if (params.name !== undefined && params.name !== "") base.name = params.name;
      if (params.page !== undefined) base.page = params.page;
      if (params.limit !== undefined) base.limit = params.limit;
      if (params.warehouseId !== undefined) base.warehouseId = params.warehouseId;
      if (params.status !== undefined && params.status !== null) base.status = params.status;
      if (params.categoryId !== undefined) base.categoryId = params.categoryId;
      if (params.tagId !== undefined) base.tagId = params.tagId;
      if (params.isLowStock !== undefined) base.isLowStock = params.isLowStock;
      if (params.isWebsiteVisible !== undefined) base.isWebsiteVisible = params.isWebsiteVisible;
      if (params.isOutOfStock !== undefined) base.isOutOfStock = params.isOutOfStock;
    }
    const qs = Object.keys(base).length
      ? "?" + Object.entries(base).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&")
      : "";
    return fetch(`${urlsApi.product.wList}${qs}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Public APIs (không cần auth) ──
  publicList: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.publicList, params, signal);
  },
  publicDetail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.publicDetail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  publicCategoryList: (params?: { keyword?: string; status?: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.publicCategoryList, params, signal);
  },
  publicMediaList: (params?: { productId: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.publicMediaList, params, signal);
  },

  // ── Media APIs (cần auth) ──
  mediaList: (params?: { productId: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return apiGet(urlsApi.product.mediaList, params, signal);
  },
  mediaUpdate: (body: { id?: number; productId: number; position?: number; status?: number; url: string }) => {
    return apiPost(urlsApi.product.mediaUpdate, body);
  },
  mediaDelete: (params: { productId: number; id: number }) => {
    return apiDelete(`${urlsApi.product.mediaDelete}${convertParamsToString(params)}`);
  },
  mediaUpload: (params: { productId: number; file: File; id?: number; position?: number; status?: number }) => {
    const formData = new FormData();
    formData.append("productId", String(params.productId));
    if (params.id !== undefined) formData.append("id", String(params.id));
    if (params.position !== undefined) formData.append("position", String(params.position));
    if (params.status !== undefined) formData.append("status", String(params.status));
    formData.append("file", params.file);
    return fetch(urlsApi.product.mediaUpload, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },

  // ── Variant Groups ──
  variantGroupsUpdate: (body: { productId: number; variantGroups: { key: string; value: string[] }[] }) => {
    return apiPost(urlsApi.product.variantGroupsUpdate, body);
  },
  variantGroupsDelete: (params: { productId: number; key: string }) => {
    return apiDelete(`${urlsApi.product.variantGroupsDelete}${convertParamsToString(params)}`);
  },

  // ── Specifications ──
  specificationsUpdate: (body: { productId: number; specifications: { key: string; value: string }[] }) => {
    return apiPost(urlsApi.product.specificationsUpdate, body);
  },
  specificationsDelete: (params: { productId: number; key: string }) => {
    return apiDelete(`${urlsApi.product.specificationsDelete}${convertParamsToString(params)}`);
  },

  wDetail: (id: number) => {
    return fetch(`${urlsApi.product.wDetail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wUpdate: (body: IProductRequest) => {
    return apiPost(urlsApi.product.wUpdate, body);
  },
  wUpdateFormData: (formData: FormData) => {
    return fetch(urlsApi.product.wUpdate, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  },
  wDelete: (id: number) => {
    return apiDelete(`${urlsApi.product.wDelete}?id=${id}`);
  },
  wDeleteVariant: (productId: number, variantId: number) => {
    return apiDelete(`${urlsApi.product.variantDelete}?productId=${productId}&variantId=${variantId}`);
  },
  wDashboard: (signal?: AbortSignal) => {
    return apiGet(urlsApi.product.wDashboard, undefined, signal);
  },
  wUpdateStatus: (body: { id: number; status: number }) => {
    return apiPost(urlsApi.product.wUpdateStatus, body);
  },
  wUpdatePrice: (body: {
    id: number;
    unitId?: number;
    priceRetail?: number;
    priceWholesale?: number;
    pricePromotion?: number;
    costPrice?: number;
  }) => {
    return apiPost(urlsApi.product.wUpdatePrice, body);
  },
  wUpdateInventory: (body: { id: number; trackInventory?: number; lowStockThreshold?: number }) => {
    return apiPost(urlsApi.product.wUpdateInventory, body);
  },
  wWebsiteSettingGet: (productId: number) => {
    return fetch(`${urlsApi.product.wWebsiteSettingGet}?productId=${productId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wWebsiteSettingUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.product.wWebsiteSettingUpdate, body);
  },
  wWebsiteSettingUpdateField: (
    field: keyof typeof websiteSettingUpdateUrls,
    body: { productId: number; value: number }
  ) => {
    return apiPost(websiteSettingUpdateUrls[field], body);
  },
  wWebsiteSettingUpdateMany: (
    productId: number,
    values: Partial<Record<keyof typeof websiteSettingUpdateUrls, number>>
  ) => {
    const requests = Object.entries(values)
      .filter(([, value]) => value !== undefined)
      .map(([field, value]) =>
        apiPost(websiteSettingUpdateUrls[field as keyof typeof websiteSettingUpdateUrls], {
          productId,
          value: Number(value),
        })
      );
    return Promise.all(requests);
  },
  // ── Cài đặt mặc định toàn hệ thống ──
  wWebsiteSettingDefaultGet: () => {
    return apiGet(urlsApi.product.wWebsiteSettingDefaultGet);
  },
  wWebsiteSettingDefaultUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.product.wWebsiteSettingDefaultUpdate, body);
  },
  wWebsiteToggle: (body: { productId: number; value: number }) => {
    return apiPost(urlsApi.product.wWebsiteSettingUpdateShowOnWebsite, body);
  },
  wInventoryCurrent: (productId: number) => {
    return fetch(`${urlsApi.product.wInventoryCurrent}?productId=${productId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wScan: (code: string) => {
    return fetch(`${urlsApi.product.wScan}?code=${encodeURIComponent(code)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Content/Mô tả chi tiết (editor) ──
  wDescriptionGet: (productId: number) => {
    return fetch(`${urlsApi.product.wDescriptionGet}?productId=${productId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wDescriptionUpdate: (body: { productId: number; content: string; contentDelta: string }) => {
    return apiPost(urlsApi.product.wDescriptionUpdate, body);
  },

  // ── Tags ──
  wTagList: (keyword = "") => {
    return fetch(`${urlsApi.product.wTagList}?keyword=${encodeURIComponent(keyword)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wTagUpdate: (body: { productId: number; tagIds: number[] }) => {
    return apiPost(urlsApi.product.wTagUpdate, body);
  },
  wTagCreate: (body: { name: string; status?: number }) => {
    return fetch(urlsApi.product.wTagCreate, {
      method: "POST",
      body: JSON.stringify({ ...body, status: body.status ?? 1 }),
    }).then((res) => res.json());
  },

  // ── Export ──
  /**
   * GET /inventory/product/export
   * Xuất toàn bộ sản phẩm theo filter ra Base64 xlsx.
   * FE decode → Blob → download.
   */
  wExport: (params?: {
    keyword?: string;
    status?: number;
    categoryId?: number;
    warehouseId?: number;
  }, signal?: AbortSignal): Promise<string> => {
    const qs = new URLSearchParams();
    if (params?.keyword)     qs.set("keyword",     params.keyword);
    if (params?.status      !== undefined) qs.set("status",      String(params.status));
    if (params?.categoryId  !== undefined) qs.set("categoryId",  String(params.categoryId));
    if (params?.warehouseId !== undefined) qs.set("warehouseId", String(params.warehouseId));
    const url = `${urlsApi.product.wExport}${qs.toString() ? "?" + qs.toString() : ""}`;
    return fetch(url, { method: "GET", signal })
      .then(async (res) => {
        const json = await res.json();
        if (json.code !== 0) throw new Error(json.message ?? "Xuất Excel thất bại");
        return json.result as string; // Base64 string
      });
  },

  // ── Import ──
  wImportDownloadTemplate: () => {
    return fetch(urlsApi.product.wImportTemplate, { method: "GET" });
    // caller dùng .blob() → URL.createObjectURL để download
  },
  wImportUpload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(urlsApi.product.wImportUpload, {
      method: "POST",
      body: form,
      // KHÔNG set Content-Type — browser tự set boundary cho multipart
    }).then((res) => res.json());
  },
  wImportDownloadErrorFile: (sessionId: string) => {
    return fetch(`${urlsApi.product.wImportErrorFile}?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "GET",
    });
  },
  wImportConfirm: (body: { importSessionId: string }) => {
    return apiPost(urlsApi.product.wImportConfirm, body);
  },
  wImportCancel: (sessionId: string) => {
    return fetch(`${urlsApi.product.wImportCancel}?sessionId=${encodeURIComponent(sessionId)}`, {
      method: "POST",
    }).then((res) => res.json());
  },
};
