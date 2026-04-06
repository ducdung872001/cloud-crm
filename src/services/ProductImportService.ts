import { apiDelete, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import { IProductImportRequest } from "model/productImport/ProductImportRequestModel"; // tạm thời cho work đã
import { IInvoiceDetailRequest } from "model/invoice/InvoiceRequestModel";

export default {
  list: (invoiceId: number) => {
    return fetch(`${urlsApi.productImport.list}?invoiceId=${invoiceId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  detail: (invoiceId: number) => {
    return fetch(`${urlsApi.productImport.detail}?invoiceId=${invoiceId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IInvoiceDetailRequest) => {
    return apiPost(urlsApi.productImport.update, body);
  },
  delete: (id: number) => {
    return apiDelete(`${urlsApi.productImport.delete}?id=${id}`);
  },
};
