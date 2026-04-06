import { apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export default {
  generate: (body) => {
    return apiPost(`${urlsApi.qrCodePro.generate}`, body);
  },
  reconciliation: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${urlsApi.qrCodePro.reconciliation}?${query}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
