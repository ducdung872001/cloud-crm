import { urlsApi } from "configs/urls";
import { IEarningsFilterRequest } from "model/earnings/EarningRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  filter: (params: IEarningsFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.earnings.filter}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
