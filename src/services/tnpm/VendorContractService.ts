import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IVendorContractFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IVendorContractRequest {{
  id?: number;
  [key: string]: any;
}}

const VendorContractService = {{
  list: (params?: IVendorContractFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.vendorContract.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.vendorContract.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IVendorContractRequest) => {{
    return fetch(tnpmUrls.vendorContract.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IVendorContractRequest) => {{
    return fetch(tnpmUrls.vendorContract.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.vendorContract.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default VendorContractService;
