import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICardFilterRequest, ICardRequest } from "model/card/CardRequestModel";

export default {
  list: (params: ICardFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.card.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICardRequest) => {
    return fetch(urlsApi.card.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.card.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
