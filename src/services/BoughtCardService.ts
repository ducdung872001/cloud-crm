import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IBoughtCardFilterRequest, IBoughtCardRequest, IBoughtCardUpdateRequest } from "model/boughtCard/BoughtCardRequestModel";

export default {
  list: (params: IBoughtCardFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.boughtCard.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  add: (body: IBoughtCardRequest) => {
    return fetch(urlsApi.boughtCard.add, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.boughtCard.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  update: (body: IBoughtCardUpdateRequest) => {
    return fetch(`${urlsApi.boughtCard.update}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
