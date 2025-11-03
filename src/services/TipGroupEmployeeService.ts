// import { urlsApi } from "configs/urls";
// import { convertParamsToString } from "reborn-util";
// import { ITipGroupEmployeeFilterRequest, ITipGroupEmployeeRequest } from "model/tipGroupEmployee/TipGroupEmployeeRequestModel";

// export default {
//   list: (params: ITipGroupEmployeeFilterRequest, signal?: AbortSignal) => {
//     return fetch(`${urlsApi.tipGroupEmployee.list}${convertParamsToString(params)}`, {
//       signal,
//       method: "GET",
//     }).then((res) => res.json());
//   },
//   update: (body: ITipGroupEmployeeRequest) => {
//     return fetch(urlsApi.tipGroupEmployee.update, {
//       method: "POST",
//       body: JSON.stringify(body),
//     }).then((res) => res.json());
//   },
//   delete: (id: number) => {
//     return fetch(`${urlsApi.tipGroupEmployee.delete}?id=${id}`, {
//       method: "DELETE",
//     }).then((res) => res.json());
//   },
// };
