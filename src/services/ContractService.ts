import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContractFilterRequest, IContractRequest, IContractAlertRequest, IContractFieldFilterRequest } from "model/contract/ContractRequestModel";
import { IAutoProcessModalProps } from "model/customer/CustomerRequestModel";

export default {
  list: (params: IContractFilterRequest, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.list}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contract.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractRequest) => {
    return fetch(urlsApi.contract.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  updateAndInit: (body: IContractRequest) => {
    return fetch(urlsApi.contract.updateAndInit, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.contract.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  updateAlert: (body: any) => {
    return fetch(urlsApi.contract.updateAlert, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  detailAlert: (id: number) => {
    return fetch(`${urlsApi.contract.detailAlert}/${id}/alerts`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo hợp đồng chung cho tất cả
  contractAlertUpdate: (body: any) => {
    return fetch(urlsApi.contract.contractAlertUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  contractAlertList: () => {
    return fetch(`${urlsApi.contract.contractAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo bảo lãnh hợp đồng chung cho tất cả
  guaranteeAlertUpdate: (body: any) => {
    return fetch(urlsApi.contract.guaranteeAlertUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  guaranteeAlertList: () => {
    return fetch(`${urlsApi.contract.guaranteeAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo bảo hành hợp đồng chung cho tất cả
  warrantyAlertUpdate: (body: any) => {
    return fetch(urlsApi.contract.warrantyAlertUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  warrantyAlertList: () => {
    return fetch(`${urlsApi.contract.warrantyAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo hợp đồng riêng từng cái
  contractAlertSpecific: (body: any) => {
    return fetch(urlsApi.contract.contractAlertSpecific, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  contractAlertListSpecific: (params) => {
    return fetch(`${urlsApi.contract.contractAlertListSpecific}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  fieldTable: (params: IContractFieldFilterRequest) => {
    return fetch(`${urlsApi.contract.fieldTable}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  updateApproach: (body: any) => {
    return fetch(urlsApi.contract.updateApproach, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //phụ lục hợp đồng
  contractAppendixList: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.contractAppendixList}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
  contractAppendixDelete: (id: number) => {
    return fetch(`${urlsApi.contract.contractAppendixDelete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  contractAppendixUpdate: (body: any) => {
    return fetch(urlsApi.contract.contractAppendixUpdate, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  contractAppendixDetail: (id: number) => {
    return fetch(`${urlsApi.contract.contractAppendixDetail}?contractId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  contractExchange: (params: any) => {
    return fetch(`${urlsApi.contract.contractExchange}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  // xóa đi 1 trao đổi
  deleteContractExchange: (id: number) => {
    return fetch(`${urlsApi.contract.deleteContractExchange}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
  // thêm mới trao đổi
  addContractExchange: (body) => {
    return fetch(urlsApi.contract.addContractExchange, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  // cập nhật lại trao đổi
  updateContractExchange: (id: number) => {
    return fetch(`${urlsApi.contract.updateContractExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //gửi báo giá
  sendQuote: (body) => {
    return fetch(`${urlsApi.contract.sendQuote}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //gửi hợp đồng mẫu
  sendContract: (body) => {
    return fetch(`${urlsApi.contract.sendContract}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //list mã để nghị workit
  listCodeSuggest: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.listCodeSuggest}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //list mã mặt hàng/dịch vụ workit
  listCodeService: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.listCodeService}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //list nhà cung cấp workit
  listSupplier: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.listSupplier}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Thêm hạng mục bàn giao
  updateHandover: (body: any) => {
    return fetch(urlsApi.contract.updateHandover, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //Thêm đợt bàn giao
  updateHandoverProgress: (body: any) => {
    return fetch(urlsApi.contract.updateHandoverProgress, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  //danh sách đợt bàn giao
  listHandoverProgress: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.listHandoverProgress}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Xoá đợt bàn giao
  deleteHandoverProgress: (id: number) => {
    return fetch(`${urlsApi.contract.deleteHandoverProgress}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },

  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return fetch(`${urlsApi.contract.exAttributes}${convertParamsToString(params)}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  numberFieldCustomer: (body, params) => {
    return fetch(`${urlsApi.contract.numberFieldCustomer}${convertParamsToString(params)}`, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => {
      if (res.ok) {
        return res.arrayBuffer();
      } else {
        return res.json().then((error) => Promise.reject(error));
      }
    });
  },

  // import khách hàng b2
  autoProcess: (body: IAutoProcessModalProps) => {
    return fetch(urlsApi.contract.autoProcess, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contract.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  //Biểu đồ thống kê
  reportContractStatus: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.reportContractStatus}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  reportContractValue: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.reportContractContract}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  reportNewContract: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.reportNewContract}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },

  //Cập nhật các trạng thái liên quan đến hợp đồng
  updateStatus: (body: any) => {
    return fetch(urlsApi.contract.updateStatus, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },

  ///lịch sử thay đổi hợp đồng
  logValues: (params: any, signal?: AbortSignal) => {
    return fetch(`${urlsApi.contract.logValues}${convertParamsToString(params)}`, {
      signal,
      method: "GET",
    }).then((res) => res.json());
  },
};
