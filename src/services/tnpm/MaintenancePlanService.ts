import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IMaintenancePlanFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IMaintenancePlanRequest {{
  id?: number;
  [key: string]: any;
}}

const MaintenancePlanService = {{
  list: (params?: IMaintenancePlanFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.maintenancePlan.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.maintenancePlan.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IMaintenancePlanRequest) => {{
    return fetch(tnpmUrls.maintenancePlan.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IMaintenancePlanRequest) => {{
    return fetch(tnpmUrls.maintenancePlan.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.maintenancePlan.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default MaintenancePlanService;
