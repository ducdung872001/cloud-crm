import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IPaymentHistoryFilterRequest, IPaymentHistoryRequest } from "model/paymentHistory/PaymentHistoryRequestModel";


export default {
  filter: (params: IPaymentHistoryFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.paymentHistory.filter, params, signal);
  },
  update: (body: IPaymentHistoryRequest) => {
    return apiPost(urlsApi.paymentHistory.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.paymentHistory.delete}?id=${id}`);
  },
};
