import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import {
  ITreatmentRoomRequestModal,
  ITreatmentRoomFilterRequest,
  ICheckTreatmentRoomRequestModal,
} from "model/treatmentRoom/TreatmentRoomRequestModal";

export default {
  list: (params: ITreatmentRoomFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.treatmentRoom.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: ITreatmentRoomRequestModal) => {
    return fetch(urlsApi.treatmentRoom.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  checkTreatmentRoom: (body: ICheckTreatmentRoomRequestModal) => {
    return fetch(urlsApi.treatmentRoom.checkTreatmentRoom, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.treatmentRoom.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.treatmentRoom.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
