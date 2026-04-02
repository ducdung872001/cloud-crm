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
  tags?: string; // JSON array string
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
};

export default InventorySupplierService;
