import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IEmailFilterRequest, IEmailRequest } from "model/email/EmailRequestModel";

// Dịch vụ outlook mail, gmail
export default {
  list: (params: IEmailFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.email.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  lstEmail: (params: IEmailFilterRequest) => {
    return fetch(`${urlsApi.email.lstEmail}`, {
      method: "POST",
      body: JSON.stringify(params),
    }).then((res) => res.json());
  },
  // Xem chi tiết email
  detail: (id: number) => {
    return fetch(`${urlsApi.email.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // Gửi email
  sendEmail: (body: IEmailRequest) => {
    return fetch(urlsApi.email.sendEmail, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
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
    return fetch(`${urlsApi.email.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
