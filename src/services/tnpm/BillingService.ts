import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IBillingFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IBillingRequest {{
  id?: number;
  [key: string]: any;
}}

const BillingService = {{
  list: (params?: IBillingFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.billing.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.billing.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IBillingRequest) => {{
    return fetch(tnpmUrls.billing.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IBillingRequest) => {{
    return fetch(tnpmUrls.billing.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.billing.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default BillingService;
