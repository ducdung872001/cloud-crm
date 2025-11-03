import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IUnitFilterRequest, IUnitRequest } from "model/unit/UnitRequestModel";

export default {
  list: (params: IUnitFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.material.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IUnitRequest) => {
    return fetch(urlsApi.material.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.material.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateStatus: (body: any) => {
    return fetch(urlsApi.material.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id?: number, code?: string) => {
    if (id) {
      return fetch(`${urlsApi.material.detail}?id=${id}`, {
        method: "GET",
      }).then((res) => res.json());
    } else {
      return fetch(`${urlsApi.material.detail}?code=${code}`, {
        method: "GET",
      }).then((res) => res.json());
    }
  },

  importExcel: (body: any) => {
    return fetch(urlsApi.material.upload, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
