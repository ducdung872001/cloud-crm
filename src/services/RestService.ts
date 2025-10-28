import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

/**
 * Gọi về core để xử lý dưới core
 */
export default {
  post: (body) => {
    return fetch(urlsApi.rest.callApi, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
