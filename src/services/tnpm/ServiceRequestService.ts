import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IServiceRequestFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IServiceRequestRequest {{
  id?: number;
  [key: string]: any;
}}

const ServiceRequestService = {{
  list: (params?: IServiceRequestFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.serviceRequest.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.serviceRequest.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IServiceRequestRequest) => {{
    return fetch(tnpmUrls.serviceRequest.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IServiceRequestRequest) => {{
    return fetch(tnpmUrls.serviceRequest.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.serviceRequest.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default ServiceRequestService;
