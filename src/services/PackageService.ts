import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  lst: (params?: any) => {
    return fetch(`${urlsApi.package.list}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  addOrgApp: (body) => {
    return fetch(urlsApi.package.addOrgApp, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateBill: (body) => {
    return fetch(urlsApi.package.updateBill, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  calcPrice: (body) => {
    return fetch(urlsApi.package.calcPrice, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
};
