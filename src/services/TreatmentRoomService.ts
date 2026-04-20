import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

import {
  ITreatmentRoomRequestModal,
  ITreatmentRoomFilterRequest,
  ICheckTreatmentRoomRequestModal,
} from "model/treatmentRoom/TreatmentRoomRequestModal";

export default {
  list: (params: ITreatmentRoomFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.treatmentRoom.list, params, signal);
  },
  update: (body: ITreatmentRoomRequestModal) => {
    return apiPost(urlsApi.treatmentRoom.update, body);
  },
  checkTreatmentRoom: (body: ICheckTreatmentRoomRequestModal) => {
    return apiPost(urlsApi.treatmentRoom.checkTreatmentRoom, body);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.treatmentRoom.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.treatmentRoom.delete}?id=${id}`);
  },
};
