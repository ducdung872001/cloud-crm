import { apiDelete, apiGet, apiPost } from "services/apiHelper";
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
    return apiGet(urlsApi.warranty.list, params, signal);
  },
  update: (body: IWarrantyRequestModel) => {
    return apiPost(urlsApi.warranty.update, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.warranty.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.warranty.delete}?id=${id}`);
  },
  warrantyProcessUpdate: (body: IWarrantyProcessRequestModel) => {
    return apiPost(urlsApi.warranty.warrantyProcess, body);
  },
  updateStatus: (body: IWarrantyStatusRequestModel) => {
    return apiPost(urlsApi.warranty.updateStatus, body);
  },
  warrantyExchangeList: (params?: IWarrantyExchangeFilterRequestModel, signal?: AbortSignal) => {
    return apiGet(urlsApi.warranty.warrantyExchangeList, params, signal);
  },
  warrantyExchangeUpdate: (body: IWarrantyExchangeUpdateRequestModel) => {
    return apiPost(urlsApi.warranty.warrantyExchangeUpdate, body);
  },
  warrantyExchangeDelete: (id: number) => {
    return apiDelete(`${urlsApi.warranty.warrantyExchangeDelete}?id=${id}`);
  },
  resetTransferVotes: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.warranty.resetTransferVotes, params);
  },
  collect: (body: IWarrantyRequestModel, params?: Record<string, unknown>) => {
    return apiPost(`${urlsApi.warranty.collect}${convertParamsToString(params)}`, body);
  },
};
