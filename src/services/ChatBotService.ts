import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export default {
  list: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.chatbot.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body) => {
    return fetch(urlsApi.chatbot.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
//   delete: (id: number) => {
//     return fetch(`${urlsApi.feedback.delete}?id=${id}`, {
//       method: "DELETE",
//     }).then((res) => res.json());
//   },

};
