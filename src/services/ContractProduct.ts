import { urlsApi } from "configs/urls";
import { IContractProductFilterRequest, IContractProductRequest } from "model/contractProduct/ContractProductRequestModal";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: IContractProductFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractProduct.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractProductRequest) => {
    return fetch(urlsApi.contractProduct.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contractProduct.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractProduct.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  update_investor: (body: any) => {
    return fetch(urlsApi.contractProduct.update_investor, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  detail_investor: (id: number) => {
    return fetch(`${urlsApi.contractProduct.detail_investor}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

};
