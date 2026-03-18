import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

export default {
  // ── API cũ (adminapi) ──
  filterWarehouse: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.filterWarehouse}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  list: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  listById: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.listById}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IProductRequest) => {
    return fetch(urlsApi.product.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.product.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.product.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listShared: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.listShared}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  updateContent: (body: any) => {
    return fetch(urlsApi.product.updateContent, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // ── Warehouse API (tài liệu mới) ──
  wList: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.wList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Public APIs (không cần auth) ──
  publicList: (params?: IProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.publicList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  publicDetail: (id: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.publicDetail}?id=${id}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  publicCategoryList: (params?: { keyword?: string; status?: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.publicCategoryList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  publicMediaList: (params?: { productId: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.publicMediaList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  // ── Media APIs (cần auth) ──
  mediaList: (params?: { productId: number; limit?: number; offset?: number }, signal?: AbortSignal) => {
    return fetch(`${urlsApi.product.mediaList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  mediaUpdate: (body: { id?: number; productId: number; position?: number; status?: number; url: string }) => {
    return fetch(urlsApi.product.mediaUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  mediaDelete: (params: { productId: number; id: number }) => {
    return fetch(`${urlsApi.product.mediaDelete}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  mediaUpload: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("productId", String(productId));
    formData.append("file", file);
    return fetch(urlsApi.product.mediaUpload, {
      method: "POST",
      body: formData,
      headers: { "Content-Type": undefined }, // bỏ Content-Type để browser tự set boundary
    }).then((res) => res.json());
  },

  // ── Variant Groups ──
  variantGroupsUpdate: (body: { productId: number; variantGroups: { key: string; value: string[] }[] }) => {
    return fetch(urlsApi.product.variantGroupsUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  variantGroupsDelete: (params: { productId: number; key: string }) => {
    return fetch(`${urlsApi.product.variantGroupsDelete}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  // ── Specifications ──
  specificationsUpdate: (body: { productId: number; specifications: { key: string; value: string }[] }) => {
    return fetch(urlsApi.product.specificationsUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  specificationsDelete: (params: { productId: number; key: string }) => {
    return fetch(`${urlsApi.product.specificationsDelete}${convertParamsToString(params)}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  wDetail: (id: number) => {
    return fetch(`${urlsApi.product.wDetail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wUpdate: (body: IProductRequest) => {
    return fetch(urlsApi.product.wUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  wDelete: (id: number) => {
    return fetch(`${urlsApi.product.wDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  wDashboard: (signal?: AbortSignal) => {
    return fetch(urlsApi.product.wDashboard, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  wUpdateStatus: (body: { id: number; status: number }) => {
    return fetch(urlsApi.product.wUpdateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  wUpdatePrice: (body: { id: number; unitId?: number; priceRetail?: number; priceWholesale?: number; pricePromotion?: number; costPrice?: number }) => {
    return fetch(urlsApi.product.wUpdatePrice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  wUpdateInventory: (body: { id: number; trackInventory?: number; lowStockThreshold?: number }) => {
    return fetch(urlsApi.product.wUpdateInventory, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  wWebsiteSettingGet: (productId: number) => {
    return fetch(`${urlsApi.product.wWebsiteSettingGet}?productId=${productId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  wWebsiteSettingUpdate: (body: Record<string, any>) => {
    return fetch(urlsApi.product.wWebsiteSettingUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  wWebsiteToggle: (body: { productId: number; showOnWebsite: number }) => {
    return fetch(urlsApi.product.wWebsiteToggle, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
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
};
