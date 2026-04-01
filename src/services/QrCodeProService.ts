import { urlsApi } from "configs/urls";

export default {
  generate: (body) => {
    return fetch(`${urlsApi.qrCodePro.generate}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  reconciliation: () => {
    return fetch(`${urlsApi.qrCodePro.reconciliation}`, {
      method: "GET",
    }).then((res) => res.json());
  },
};
