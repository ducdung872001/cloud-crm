import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IEmailFilterRequest, IEmailRequest } from "model/email/EmailRequestModel";

// Dịch vụ outlook mail, gmail
export default {
  list: (params: IEmailFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.email.list, params, signal);
  },
  lstEmail: (params: IEmailFilterRequest) => {
    return apiPost(`${urlsApi.email.lstEmail}`, params);
  },
  // Xem chi tiết email
  detail: (id: number) => {
    return fetch(`${urlsApi.email.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Gửi email
  sendEmail: (body: IEmailRequest) => {
    return apiPost(urlsApi.email.sendEmail, body);
  },
  //gui thong tin voucher
  sendVoucher: (body: IEmailRequest, params: Record<string, unknown>) => {
    return apiPost(`${urlsApi.email.sendEmailConfirm}${convertParamsToString(params)}`, body);
  },
  //gui phieu uu dai
  sendEmailSale: (body: IEmailRequest, params: Record<string, unknown>) => {
    return apiPost(`${urlsApi.email.sendEmailConfirm}${convertParamsToString(params)}`, body);
  },
  // Gửi email mới với FormData (có file đính kèm)
  sendEmailNew: (body, id, takeResult) => {
    const formData = new FormData();
    formData.append("request", JSON.stringify(body));

    const xhr = new XMLHttpRequest();

    const url = `${urlsApi.email.sendEmailNew}?bsn-id=${id}`;

    xhr.open("POST", url, true);

    // Lắng nghe sự kiện khi yêu cầu hoàn thành
    xhr.onload = function () {
      if (xhr.status === 200) {
        takeResult(xhr.response);
      } else {
        takeResult(xhr.response);
      }
    };

    // Gửi formData
    xhr.send(formData);
  },
  // Xóa 1 email
  delete: (id: number) => {
    return apiDelete(`${urlsApi.email.delete}?id=${id}`);
  },
};
