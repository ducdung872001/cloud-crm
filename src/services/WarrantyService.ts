import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  IWarrantyFilterRequest,
  IWarrantyRequestModel,
  IWarrantyProcessRequestModel,
  IWarrantyStatusRequestModel,
  IWarrantyExchangeUpdateRequestModel,
  IWarrantyExchangeFilterRequestModel,
} from "model/warranty/WarrantyRequestModel";

export default {
  list: (params?: IWarrantyFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warranty.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IWarrantyRequestModel) => {
    return fetch(urlsApi.warranty.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warranty.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.warranty.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  warrantyProcessUpdate: (body: IWarrantyProcessRequestModel) => {
    return fetch(urlsApi.warranty.warrantyProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateStatus: (body: IWarrantyStatusRequestModel) => {
    return fetch(urlsApi.warranty.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  warrantyExchangeList: (params?: IWarrantyExchangeFilterRequestModel, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warranty.warrantyExchangeList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  warrantyExchangeUpdate: (body: IWarrantyExchangeUpdateRequestModel) => {
    return fetch(urlsApi.warranty.warrantyExchangeUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  warrantyExchangeDelete: (id: number) => {
    return fetch(`${urlsApi.warranty.warrantyExchangeDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  resetTransferVotes: (params: any) => {
    return fetch(`${urlsApi.warranty.resetTransferVotes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  collect: (body: IWarrantyRequestModel, params?: any) => {
    return fetch(`${urlsApi.warranty.collect}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
