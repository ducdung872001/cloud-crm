import { urlsApi } from "configs/urls";

export default {
  list: (warrantyId: number, signal?: AbortSignal) => {
    return fetch(`${urlsApi.warrantyExtraInfo.list}?contractWarrantyId=${warrantyId}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
