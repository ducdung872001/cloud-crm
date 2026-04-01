import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IVendorInvoiceFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IVendorInvoiceRequest {{
  id?: number;
  [key: string]: any;
}}

const VendorInvoiceService = {{
  list: (params?: IVendorInvoiceFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.vendorInvoice.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.vendorInvoice.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IVendorInvoiceRequest) => {{
    return fetch(tnpmUrls.vendorInvoice.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IVendorInvoiceRequest) => {{
    return fetch(tnpmUrls.vendorInvoice.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.vendorInvoice.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default VendorInvoiceService;
