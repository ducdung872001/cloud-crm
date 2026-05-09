// Service category-item client — taxonomy cho `service` entity (khoá học MentorHub,
// dịch vụ làm đẹp, gói tư vấn, …). Owner: sales microservice.
//
// Lịch sử migration:
// - 2026-05-08: BE inventory close cloud-crm#226 + cloud-inventory-master#43,
//   re-route handoff sang cloud-sales-master#23 vì owner entity rule:
//   dịch vụ thuộc sales nên category-item cũng do sales sở hữu.
// - 2026-05-09: BE sales ship cloud-sales-master#23 — endpoints sống tại
//   /sales/category-item/* (resource: CategoryItemResource.java).
//
// list params: keyword, level (default 2), active (default -1), type (default 1), Pageable.
// update: insert nếu id null/0.
// bulk-create: idempotent — dùng cho onboarding tenant seed default categories.

import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export interface ServiceCategoryFilterRequest {
  keyword?: string;
  level?: number;
  active?: number;
  type?: number;
  page?: number;
  limit?: number;
}

export interface ServiceCategoryRequestModel {
  id?: number;
  name: string;
  parentId?: number;
  position?: number | string;
  active?: number | string;
  type?: number | string;
  level?: number;
  avatar?: string;
}

export interface ServiceCategoryBulkCreateItem {
  name: string;
  position?: number;
  parentId?: number;
}

export default {
  list: (params?: ServiceCategoryFilterRequest, signal?: AbortSignal) =>
    apiGet(urlsApi.salesServiceCategory.list, params as Record<string, unknown>, signal),

  get: (id: number) =>
    apiGet(urlsApi.salesServiceCategory.get, { id }),

  listById: (lstId: number[]) =>
    apiGet(urlsApi.salesServiceCategory.listById, { lstId }),

  update: (body: ServiceCategoryRequestModel) =>
    apiPost(urlsApi.salesServiceCategory.update, body as unknown as Record<string, unknown>),

  updatePositions: (items: { id: number; position: number }[]) =>
    apiPost(urlsApi.salesServiceCategory.updatePositions, items as unknown as Record<string, unknown>),

  delete: (id: number) =>
    apiDelete(`${urlsApi.salesServiceCategory.delete}?id=${id}`),

  bulkCreate: (items: ServiceCategoryBulkCreateItem[]) =>
    apiPost(urlsApi.salesServiceCategory.bulkCreate, { items } as unknown as Record<string, unknown>),
};
