import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IServiceContractFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IServiceContractRequest {{
  id?: number;
  [key: string]: any;
}}

const ServiceContractService = {{
  list: (params?: IServiceContractFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.serviceContract.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.serviceContract.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IServiceContractRequest) => {{
    return fetch(tnpmUrls.serviceContract.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IServiceContractRequest) => {{
    return fetch(tnpmUrls.serviceContract.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.serviceContract.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default ServiceContractService;
