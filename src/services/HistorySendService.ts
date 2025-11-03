import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { ICustomerSMSFilterRequest } from "model/customerSMS/CustomerSMSRequestModel";
import { ICustomerEmailFilterRequest } from "model/customerEmail/CustomerEmailRequestModel";
import { ICustomerZaloFilterRequest } from "model/customerZalo/CustomerZaloRequestModel";

export default {
  historySendSMS: (params?: ICustomerSMSFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.historySend.historySendSMS}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  historySendEmail: (params?: ICustomerEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.historySend.historySendEmail}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  historySendZalo: (params?: ICustomerZaloFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.historySend.historySendZalo}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
