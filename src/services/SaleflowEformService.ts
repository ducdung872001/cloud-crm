import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {

  SaleflowEformUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.saleflow.saleflowEformUpdate, body);
  },


  SaleflowEformDetail: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.saleflow.saleflowEformDetail, params, signal);
  },
};
