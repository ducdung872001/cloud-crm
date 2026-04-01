import { urlsApi } from "configs/urls";
import { ShortcutKey } from "model/dashboard/DashboardModel";

interface ShortcutApiResponse {
  code: number;
  result: { shortcuts: ShortcutKey[] };
  message?: string;
}

const ShortcutService = {
  get: (): Promise<ShortcutApiResponse> => {
    return fetch(urlsApi.shortcut.get, {
      method: "GET",
    }).then((res) => res.json());
  },

  update: (shortcuts: ShortcutKey[]): Promise<ShortcutApiResponse> => {
    return fetch(urlsApi.shortcut.update, {
      method: "POST",
      body: JSON.stringify({ shortcuts }),
    }).then((res) => res.json());
  },
};

export default ShortcutService;