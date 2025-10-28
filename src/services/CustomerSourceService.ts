import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICustomerSourceFilterRequest, ICustomerSourceRequest } from "model/customerSource/CustomerSourceRequest";

export default {
  list: (params?: ICustomerSourceFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerSource.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICustomerSourceRequest) => {
    return fetch(urlsApi.customerSource.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.customerSource.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
