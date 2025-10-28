import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IRentalTyppeFilterRequest, IRentalTyppeRequest } from "model/rentalType/RentalTypeRequestModel";

export default {
  list: (params?: IRentalTyppeFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.rentalType.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IRentalTyppeRequest) => {
    return fetch(urlsApi.rentalType.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.rentalType.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.rentalType.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
