import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";


export default {
  list: (params?: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.chatbot.lst, params, signal);
  },
  update: (body) => {
    return apiPost(urlsApi.chatbot.update, body);
  },
//   delete: (id: number) => {
//     return fetch(`${urlsApi.feedback.delete}?id=${id}`, {
//       method: "DELETE",
//     }).then((res) => res.json());
//   },

};
