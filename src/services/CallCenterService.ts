import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import { ITransferCallModel, IMakeCallOTPModel, ICallHistoryListFilterRequest } from "model/callCenter/CallCenterRequestModel";

export default {
  //* Tạo 1 cuộc gọi
  makeCall: (customerId?: number) => {
    return fetch(`${urlsApi.callCenter.makeCall}?customerId=${customerId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Lấy danh sách lịch sử cuộc gọi
  getHistory: (id?: number) => {
    return fetch(`${urlsApi.callCenter.getHistory}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Lấy chi tiết lịch sử cuộc gọi
  getHistoryByCallId: (callId?: number) => {
    return fetch(`${urlsApi.callCenter.getHistoryByCallId}?callId=${callId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Chuyển một cuộc gọi sang máy khác
  transferCall: (params?: ITransferCallModel) => {
    return apiGet(urlsApi.callCenter.transferCall, params);
  },
  //* Thực hiện ngắt cuộc gọi
  hangupCall: (customerId?: number) => {
    return fetch(`${urlsApi.callCenter.hangupCall}?customerId=${customerId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  //* Tạo 1 cuộc gọi đọc mã OTP cho người đăng ký
  makeCallOTP: (params?: IMakeCallOTPModel) => {
    return apiGet(urlsApi.callCenter.makeCallOTP, params);
  },
  //* Danh sách lịch sử cuộc gọi
  callHistoryList: (params?: ICallHistoryListFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.callCenter.customerCallList, params, signal);
  },
};
