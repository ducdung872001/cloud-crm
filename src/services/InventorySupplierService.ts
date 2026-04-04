import { urlsApi } from "configs/urls";
import { convertParamsToString } from "reborn-util";

export interface ISupplierFilterParams {
  keyword?: string;
  groupId?: number;
  isActive?: number; // -1 = all, 1 = active, 0 = inactive
  page?: number;
  limit?: number;
}

export interface ISupplierUpsertRequest {
  id?: number;
  code?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  provinceId?: number;
  provinceName?: string;
  taxCode?: string;
  contactPerson?: string;
  website?: string;
  groupId?: number;
  groupName?: string;
  tags?: string;
  note?: string;
  avatar?: string;
}

export interface ISupplierItem {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  provinceId: number;
  provinceName: string;
  taxCode: string;
  contactPerson: string;
  website: string;
  groupId: number;
  groupName: string;
  tags: string;
  note: string;
  avatar: string;
  debt: number;
  totalPurchase: number;
  isActive: boolean;
  createdTime: string;
  updatedTime: string;
}

export interface ISupplierSummary {
  total: number;
  active: number;
  hasDebt: number;
  overdueDebt: number;
  totalDebt: number;
}

const InventorySupplierService = {
  list: (params?: ISupplierFilterParams, signal?: AbortSignal) => {
    return fetch(
      `${urlsApi.inventorySupplier.list}${convertParamsToString(params)}`,
      { method: "GET", signal }
    ).then((r) => r.json());
  },

  summary: (signal?: AbortSignal) => {
    return fetch(urlsApi.inventorySupplier.summary, {
      method: "GET",
      signal,
    }).then((r) => r.json());
  },

  get: (id: number) => {
    return fetch(`${urlsApi.inventorySupplier.get}?id=${id}`, {
      method: "GET",
    }).then((r) => r.json());
  },

  update: (body: ISupplierUpsertRequest) => {
    return fetch(urlsApi.inventorySupplier.update, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },

  delete: (id: number) => {
    return fetch(`${urlsApi.inventorySupplier.delete}?id=${id}`, {
      method: "DELETE",
    }).then((r) => r.json());
  },

  updateActive: (id: number, isActive: boolean) => {
    return fetch(
      `${urlsApi.inventorySupplier.updateActive}?id=${id}&isActive=${isActive ? 1 : 0}`,
      { method: "POST" }
    ).then((r) => r.json());
  },

  /**
   * Xuất danh sách NCC ra file Excel (.xlsx) — server-side.
   * Backend trả Base64 string → decode → download.
   * Params: keyword, groupId, isActive (không truyền page/limit).
   */
  exportExcel: async (
    params?: Omit<ISupplierFilterParams, "page" | "limit">,
    signal?: AbortSignal
  ): Promise<void> => {
    const res = await fetch(
      `${urlsApi.inventorySupplier.export}${convertParamsToString(params)}`,
      { method: "GET", signal }
    );

    const json = await res.json();
    if (!res.ok || json.code !== 0) {
      throw new Error(json.message || `Export thất bại (HTTP ${res.status})`);
    }

    const base64: string = json.result;
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    a.download = `DanhSachNhaCungCap_${dd}${mm}${yyyy}.xlsx`;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export default InventorySupplierService;