import { urlsApi } from "configs/urls";
import { IProductImportRequest } from "model/productImport/ProductImportRequestModel"; // tạm thời cho work đã
import { IInvoiceDetailRequest } from "model/invoice/InvoiceRequestModel";

export default {
  detail: (invoiceId: number) => {
    return fetch(`${urlsApi.productImport.detail}?invoiceId=${invoiceId}`, {
      method: "GET",
    }).then((res) => res.json());
  },
  update: (body: IInvoiceDetailRequest) => {
    return fetch(urlsApi.productImport.update, {
      method: "POST",
      body: JSON.stringify(body),
    }).then((res) => res.json());
  },
  delete: (id: number) => {
    return fetch(`${urlsApi.productImport.delete}?id=${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  },
};
