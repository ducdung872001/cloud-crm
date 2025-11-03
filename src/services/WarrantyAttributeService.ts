import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContractAttributeFilterRequest, IContractAttributeRequest } from "model/contractAttribute/ContractAttributeRequest";

export default {
  list: (params: IContractAttributeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyAttribute.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractAttributeRequest) => {
    return fetch(urlsApi.warrantyAttribute.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.warrantyAttribute.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  listAll: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyAttribute.listAll}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  checkDuplicated: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyAttribute.checkDuplicated}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
