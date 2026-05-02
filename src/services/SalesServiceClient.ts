import { apiDelete, apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";

export type SalesServiceListParams = {
  categoryId?: number;
  parentId?: number;
  name?: string;
  active?: number;
  hostname?: string;
  type?: string;
  supplierId?: number;
  status?: string;
  page?: number;
  limit?: number;
};

export type SalesService = {
  id: number;
  uid?: string;
  category_id?: number;
  categoryName?: string | null;
  avatar?: string;
  name?: string;
  code?: string;
  intro?: string;
  content?: string;
  content_type?: number;
  cost?: number;
  price?: number;
  discount?: number;
  retail?: number;
  retailPrice?: number;
  total_time?: number;
  is_combo?: number;
  parent_id?: number;
  position?: number;
  featured?: number;
  active?: number;
  bsn_id?: number;
  // V7 additive (mentorhub course-catalog)
  type?: string;
  status?: string;
  supplierId?: number;
  metadata?: Record<string, unknown> | null;
};

export default {
  list: (params?: SalesServiceListParams, signal?: AbortSignal) =>
    apiGet(urlsApi.salesService.list, params, signal),
  get: (id: number, signal?: AbortSignal) =>
    apiGet(urlsApi.salesService.get, { id }, signal),
  update: (body: Partial<SalesService>) => apiPost(urlsApi.salesService.update, body),
  // V7: archive set status=ARCHIVED, không hard-delete
  archive: (id: number) => apiPost(`${urlsApi.salesService.archive}?id=${id}`, {}),
  // V7: best-effort aggregate; hiện trả null cho registered/sessionsDone/revenue/nps
  // → FE compute client-side qua sales/customer/care nếu cần.
  stats: (id: number, signal?: AbortSignal) =>
    apiGet(urlsApi.salesService.stats, { id }, signal),
  delete: (id: number) => apiDelete(urlsApi.salesService.delete, { id }),
  updateAvatar: (id: number, avatar: string) =>
    apiPost(urlsApi.salesService.updateAvatar, { id, avatar }),
  updateContent: (id: number, content: string) =>
    apiPost(urlsApi.salesService.updateContent, { id, content }),
  listByParent: (params?: Record<string, unknown>, signal?: AbortSignal) =>
    apiGet(urlsApi.salesService.listByParent, params, signal),
  listById: (lstId: number[], signal?: AbortSignal) =>
    apiGet(urlsApi.salesService.listById, { lstId }, signal),
};
