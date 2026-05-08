// Service category client — taxonomy cho `service` entity (khoá học MentorHub,
// dịch vụ làm đẹp, gói tư vấn, …). Owner: sales microservice.
//
// Lịch sử migration:
// - 2026-05-08: BE inventory close cloud-crm#226 + cloud-inventory-master#43,
//   re-route handoff sang cloud-sales-master#23 vì owner entity rule:
//   dịch vụ thuộc sales nên service_category cũng do sales sở hữu.
//
// Status: endpoint /sales/category/* đang chờ sales ship #23. Trong lúc đó
// FE call có thể trả 404 — caller phải check `code !== 0` để xử lý.

import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export interface ServiceCategoryFilterRequest {
  keyword?: string;
  page?: number;
  limit?: number;
  active?: number;
}

export interface ServiceCategoryRequestModel {
  id?: number;
  name: string;
  parentId?: number;
  position?: number | string;
  active?: number | string;
  avatar?: string;
}

export default {
  list: (params?: ServiceCategoryFilterRequest, signal?: AbortSignal) =>
    apiGet(urlsApi.salesServiceCategory.list, params as Record<string, unknown>, signal),

  get: (id: number) =>
    apiGet(`${urlsApi.salesServiceCategory.get}`, { id }),

  update: (body: ServiceCategoryRequestModel) =>
    apiPost(urlsApi.salesServiceCategory.update, body as unknown as Record<string, unknown>),

  delete: (id: number) =>
    apiDelete(`${urlsApi.salesServiceCategory.delete}?id=${id}`),
};
