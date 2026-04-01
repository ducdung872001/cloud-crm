import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface IPropertyUnitFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface IPropertyUnitRequest {{
  id?: number;
  [key: string]: any;
}}

const PropertyUnitService = {{
  list: (params?: IPropertyUnitFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.unit.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.unit.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: IPropertyUnitRequest) => {{
    return fetch(tnpmUrls.unit.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: IPropertyUnitRequest) => {{
    return fetch(tnpmUrls.unit.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.unit.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default PropertyUnitService;
