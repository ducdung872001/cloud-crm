import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  // list: (customerId: number, signal?: AbortSignal) => {
  //   return fetch(`${urlsApi.customerExtraInfo.list}?customerId=${customerId}`, {
  //     signal,
  //     method: "GET",
  //   }).then((res) => res.json());
  // }

  list: (partnerId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.partnerExtraInfo.list}?businessPartnerId=${partnerId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  }
};
