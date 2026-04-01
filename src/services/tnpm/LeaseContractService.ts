import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface ILeaseContractFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface ILeaseContractRequest {{
  id?: number;
  [key: string]: any;
}}

const LeaseContractService = {{
  list: (params?: ILeaseContractFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.leaseContract.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.leaseContract.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: ILeaseContractRequest) => {{
    return fetch(tnpmUrls.leaseContract.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: ILeaseContractRequest) => {{
    return fetch(tnpmUrls.leaseContract.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.leaseContract.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default LeaseContractService;
