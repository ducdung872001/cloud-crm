import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params: Record<string, unknown>) => {
    return fetch(`${urlsApi.customer.area}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
