import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICustomerGroupFilterRequest, ICustomerGroupRequest } from "model/customerGroup/CustomerGroupRequestModel";

export default {
  list: (params?: ICustomerGroupFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerGroup.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ICustomerGroupRequest) => {
    return fetch(urlsApi.customerGroup.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.customerGroup.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
