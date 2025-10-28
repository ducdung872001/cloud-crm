import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IProductFilterRequest, IProductRequest } from "model/product/ProductRequestModel";

export default {
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

  ///Danh sách sản phẩm của đối tác
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
};
