import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";
import { IContractFilterRequest, IContractRequest, IContractAlertRequest, IContractFieldFilterRequest } from "model/contract/ContractRequestModel";
import { IAutoProcessModalProps } from "model/customer/CustomerRequestModel";

export default {
  list: (params: IContractFilterRequest, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.list, params, signal);
  },
  detail: (id: number) => {
    return fetch(`${urlsApi.contract.detail}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IContractRequest) => {
    return apiPost(urlsApi.contract.update, body);
  },
  updateAndInit: (body: IContractRequest) => {
    return apiPost(urlsApi.contract.updateAndInit, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.contract.delete}?id=${id}`);
  },
  updateAlert: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.updateAlert, body);
  },
  detailAlert: (id: number) => {
    return fetch(`${urlsApi.contract.detailAlert}/${id}/alerts`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo hợp đồng chung cho tất cả
  contractAlertUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.contractAlertUpdate, body);
  },

  contractAlertList: () => {
    return fetch(`${urlsApi.contract.contractAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo bảo lãnh hợp đồng chung cho tất cả
  guaranteeAlertUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.guaranteeAlertUpdate, body);
  },

  guaranteeAlertList: () => {
    return fetch(`${urlsApi.contract.guaranteeAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo bảo hành hợp đồng chung cho tất cả
  warrantyAlertUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.warrantyAlertUpdate, body);
  },

  warrantyAlertList: () => {
    return fetch(`${urlsApi.contract.warrantyAlertList}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //cảnh báo hợp đồng riêng từng cái
  contractAlertSpecific: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.contractAlertSpecific, body);
  },

  contractAlertListSpecific: (params) => {
    return apiGet(urlsApi.contract.contractAlertListSpecific, params);
  },

  fieldTable: (params: IContractFieldFilterRequest) => {
    return apiGet(urlsApi.contract.fieldTable, params);
  },

  updateApproach: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.updateApproach, body);
  },

  //phụ lục hợp đồng
  contractAppendixList: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.contractAppendixList, params, signal);
  },
  contractAppendixDelete: (id: number) => {
    return apiDelete(`${urlsApi.contract.contractAppendixDelete}?id=${id}`);
  },
  contractAppendixUpdate: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.contractAppendixUpdate, body);
  },
  contractAppendixDetail: (id: number) => {
    return fetch(`${urlsApi.contract.contractAppendixDetail}?contractId=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  contractExchange: (params: Record<string, unknown>) => {
    return apiGet(urlsApi.contract.contractExchange, params);
  },
  // xóa đi 1 trao đổi
  deleteContractExchange: (id: number) => {
    return apiDelete(`${urlsApi.contract.deleteContractExchange}?id=${id}`);
  },
  // thêm mới trao đổi
  addContractExchange: (body) => {
    return apiPost(urlsApi.contract.addContractExchange, body);
  },

  // cập nhật lại trao đổi
  updateContractExchange: (id: number) => {
    return fetch(`${urlsApi.contract.updateContractExchange}?id=${id}`, {
      method: "GET",
    }).then((res) => res.json());
  },

  //gửi báo giá
  sendQuote: (body) => {
    return apiPost(`${urlsApi.contract.sendQuote}`, body);
  },

  //gửi hợp đồng mẫu
  sendContract: (body) => {
    return apiPost(`${urlsApi.contract.sendContract}`, body);
  },

  //list mã để nghị workit
  listCodeSuggest: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.listCodeSuggest, params, signal);
  },

  //list mã mặt hàng/dịch vụ workit
  listCodeService: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.listCodeService, params, signal);
  },

  //list nhà cung cấp workit
  listSupplier: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.listSupplier, params, signal);
  },

  //Thêm hạng mục bàn giao
  updateHandover: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.updateHandover, body);
  },

  //Thêm đợt bàn giao
  updateHandoverProgress: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.updateHandoverProgress, body);
  },

  //danh sách đợt bàn giao
  listHandoverProgress: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.listHandoverProgress, params, signal);
  },

  //Xoá đợt bàn giao
  deleteHandoverProgress: (id: number) => {
    return apiDelete(`${urlsApi.contract.deleteHandoverProgress}?id=${id}`);
  },

  ///lấy danh sách các trường chọn để import

  exAttributes: (params) => {
    return apiGet(urlsApi.contract.exAttributes, params);
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
    return apiPost(urlsApi.contract.autoProcess, body);
  },
  // download file lỗi
  downloadFile: (id: number) => {
    return fetch(`${urlsApi.contract.downloadFile}/${id}/downloadError`, {
      method: "GET",
    }).then((res) => res.arrayBuffer());
  },

  //Biểu đồ thống kê
  reportContractStatus: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.reportContractStatus, params, signal);
  },

  reportContractValue: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.reportContractContract, params, signal);
  },

  reportNewContract: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.reportNewContract, params, signal);
  },

  //Cập nhật các trạng thái liên quan đến hợp đồng
  updateStatus: (body: Record<string, unknown>) => {
    return apiPost(urlsApi.contract.updateStatus, body);
  },

  ///lịch sử thay đổi hợp đồng
  logValues: (params: Record<string, unknown>, signal?: AbortSignal) => {
    return apiGet(urlsApi.contract.logValues, params, signal);
  },
};
