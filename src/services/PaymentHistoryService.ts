import { urlsApi } from "configs/urls";
import { IPaymentHistoryFilterRequest, IPaymentHistoryRequest } from "model/paymentHistory/PaymentHistoryRequestModel";
import { convertParamsToString } from "reborn-util";

export default {
  filter: (params: IPaymentHistoryFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.paymentHistory.filter}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IPaymentHistoryRequest) => {
    return fetch(urlsApi.paymentHistory.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.paymentHistory.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
