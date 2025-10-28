import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContractAttributeFilterRequest, IContractAttributeRequest } from "model/contractAttribute/ContractAttributeRequest";

export default {
  list: (params: IContractAttributeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractAttributeRequest) => {
    return fetch(urlsApi.contractAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contractAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractAttribute.listAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contractAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
