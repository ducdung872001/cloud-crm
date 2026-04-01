import {{ urlsApi, tnpmUrls }} from "configs/urls";
import {{ convertParamsToString }} from "reborn-util";

export interface ITurnoverRentFilter {{
  keyword?: string;
  page?: number;
  size?: number;
  [key: string]: any;
}}

export interface ITurnoverRentRequest {{
  id?: number;
  [key: string]: any;
}}

const TurnoverRentService = {{
  list: (params?: ITurnoverRentFilter, signal?: AbortSignal) => {{
    return fetch(`${{tnpmUrls.turnoverRent.list}}${{convertParamsToString(params)}}`, {{
      signal, method: "GET",
    }}).then((res) => res.json());
  }},

  detail: (id: number) => {{
    return fetch(`${{tnpmUrls.turnoverRent.detail}}?id=${{id}}`, {{
      method: "GET",
    }}).then((res) => res.json());
  }},

  create: (body: ITurnoverRentRequest) => {{
    return fetch(tnpmUrls.turnoverRent.create, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  update: (body: ITurnoverRentRequest) => {{
    return fetch(tnpmUrls.turnoverRent.update, {{
      method: "POST",
      body: JSON.stringify(body),
    }}).then((res) => res.json());
  }},

  delete: (id: number) => {{
    return fetch(`${{tnpmUrls.turnoverRent.delete}}?id=${{id}}`, {{
      method: "DELETE",
    }}).then((res) => res.json());
  }},
}};

export default TurnoverRentService;
