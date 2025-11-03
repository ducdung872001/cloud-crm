import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICardServiceFilterRequest, ICardServiceRequest } from "model/cardService/CardServiceRequestModel";

export default {
  list: (params?: ICardServiceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.cardService.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICardServiceRequest) => {
    return fetch(urlsApi.cardService.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.cardService.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.cardService.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
