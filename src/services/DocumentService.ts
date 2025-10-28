import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NDQ4OTc1MTEsInVzZXIiOiJ7XCJpZFwiOjE0NTksXCJ1c2VybmFtZVwiOlwiMDk3MTIzNDU5OVwiLFwibmFtZVwiOlwiSMOyYSBQaOG6oW1cIixcInJvbGVzXCI6W1wibW9kXCJdLFwibWFwQmVhdXR5U2Fsb25cIjp7XCJub25hbWUucmVib3JuLnZuXCI6NDMsXCJoYWx1aGFsdS5yZWJvcm4udm5cIjoyMzEsXCJiZW9zcGEucmVib3JuLnZuXCI6MjIxLFwiaGFpcnNhbG9uLnJlYm9ybi52blwiOjEyMyxcInJlYm9ybnRlc3QucmVib3JuLnZuXCI6NDIsXCJncmVlbnNwYS5yZWJvcm4udm5cIjo2LFwiYWRoYS5yZWJvcm4udm5cIjoyMjIsXCJlbnRlcnByaXNlLW5ldy5yZWJvcm4udm5cIjoyMzYsXCJsb2NhbGhvc3QxMTIucmVib3JuLnZuXCI6MjI5LFwiaHJoci5yZWJvcm4udm5cIjoyMjcsXCJiZXNwYS5yZWJvcm4udm5cIjoyMDAsXCJoZWhlaGUucmVib3JuLnZuXCI6MjI2fSxcInJlYm9ybkRvY3RvcklkXCI6MTQ1OSxcInJlYm9ybkJzbklkXCI6NixcImJyYW5jaElkXCI6MjN9In0.ZYxcNv6jZAMFuwR7eB___4aJP7xj31Ue9G8lOlvi0DQ";

export default {
  lst: (params?: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.document.lst}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
  update: (body: any) => {
    return fetch(urlsApi.document.update, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (nodeId: string, processId: number, potId: number, fieldName: string, workId: number, documentType: string) => {
    return fetch(
      `${urlsApi.document.detail}?nodeId=${nodeId}&processId=${processId}&workId=${workId}&potId=${potId}&fieldName=${fieldName}&documentType=${documentType}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.document.delete}?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  },
  deleteByUrl: (nodeId: string, processId: number, potId: number, fieldName: string, fileUrl: string, documentType: string) => {
    return fetch(
      `${urlsApi.document.deleteByUrl}?nodeId=${nodeId}&processId=${processId}&potId=${potId}&fieldName=${fieldName}&fileUrl=${fileUrl}&documentType=${documentType}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
  },
};
