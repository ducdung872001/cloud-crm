import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ICustomerSMSFilterRequest } from "model/customerSMS/CustomerSMSRequestModel";
import { ICustomerEmailFilterRequest } from "model/customerEmail/CustomerEmailRequestModel";
import { ICustomerZaloFilterRequest } from "model/customerZalo/CustomerZaloRequestModel";

export default {
  historySendSMS: (params?: ICustomerSMSFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.historySend.historySendSMS, params, signal);
  },
  historySendEmail: (params?: ICustomerEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.historySend.historySendEmail, params, signal);
  },
  historySendZalo: (params?: ICustomerZaloFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.historySend.historySendZalo, params, signal);
  },
};
