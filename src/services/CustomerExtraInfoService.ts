import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  // list: (customerId: number, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.customerExtraInfo.list}?customerId=${customerId}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // }

  list: (customerId: number, custType: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.customerExtraInfo.list}?customerId=${customerId}&custType=${custType}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
