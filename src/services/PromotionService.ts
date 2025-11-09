import {urlsApi} from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IPromotion } from "model/voucher/VoucherList";

//lay danh sách voucher
export default{
   list: (params: IPromotion, signal?: AbortSignal) => {
      return fetch(`${urlsApi.voucher.list}${convertParamsToString(params)}`, {
        signal,
        method: "GET",
      }).then((res) => res.json());
    },
};