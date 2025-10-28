import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  connect: (params) => {
    return fetch(`${urlsApi.connectGmail.connect}${convertParamsToString(params)}`, {
      method: "POST",
    }).then((res) => res.json());
  },
  checkConnect: (params) => {
    return fetch(`${urlsApi.connectGmail.checkConnect}${convertParamsToString(params)}`, {
      method: "POST",
    }).then((res) => res.json());
  },
};
