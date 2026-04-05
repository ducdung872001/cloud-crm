import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {

  SaleflowEformUpdate: (body: Record<string, unknown>) => {
    return fetch(urlsApi.saleflow.saleflowEformUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },


  SaleflowEformDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return fetch(`${urlsApi.saleflow.saleflowEformDetail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
