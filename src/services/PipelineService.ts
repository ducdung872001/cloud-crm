// ═══════════════════════════════════════════════════════════════════════
// Pipeline Service
// Banking "Pipeline / Cơ hội" ↔ retail /adminapi/campaignOpportunity
// ═══════════════════════════════════════════════════════════════════════
import { apiGet, apiPost, apiDelete } from "configs/apiClient";
import { urlsApi } from "configs/urls";

export interface IPipelineFilter {
  page?: number;
  limit?: number;
  campaignId?: number;
  /** stage: approach | consult | proposal | appraisal | closing */
  saleStatusId?: number;
  employeeId?: number;
  productType?: string;
  keyword?: string;
}

export interface IDealCreate {
  id?: number;
  customerId: number;
  campaignId?: number;
  /** Banking stages mapped to saleStatus IDs configured in backend */
  saleStatusId?: number;
  estimatedValue?: number;
  probability?: number;  // 0-100
  employeeId?: number;
  expectedCloseDate?: string;
  note?: string;
  productType?: string;
}

export interface IStageChange {
  id: number;
  saleStatusId: number;
  note?: string;
}

const PipelineService = {
  /** Danh sách deals/cơ hội theo stage, campaign, RM */
  list: (params?: IPipelineFilter, signal?: AbortSignal) =>
    apiGet(urlsApi.pipeline.list, params, signal),

  /** View dành cho RM (chỉ thấy deals của mình) */
  listViewSale: (params?: IPipelineFilter, signal?: AbortSignal) =>
    apiGet(urlsApi.pipeline.listViewSale, params, signal),

  /** Chi tiết 1 cơ hội */
  detail: (id: number) =>
    apiGet(urlsApi.pipeline.detail, { id }),

  /** Tạo mới hoặc cập nhật cơ hội */
  save: (body: IDealCreate) =>
    apiPost(urlsApi.pipeline.create, body),

  /** Xóa cơ hội */
  delete: (id: number) =>
    apiDelete(urlsApi.pipeline.delete, { id }),

  /** Chuyển stage (Tiếp cận → Tư vấn → Hồ sơ → Thẩm định → Chốt) */
  changeStage: (body: IStageChange) =>
    apiPost(urlsApi.pipeline.changeSale, body),

  /** Đổi RM phụ trách cơ hội */
  changeEmployee: (body: { id: number; employeeId: number }) =>
    apiPost(urlsApi.pipeline.changeEmployee, body),

  /** Lịch sử trao đổi trong cơ hội */
  exchangeList: (opportunityId: number) =>
    apiGet(urlsApi.pipeline.exchangeList, { opportunityId }),

  /** Thêm trao đổi/ghi chú vào cơ hội */
  addExchange: (body: { opportunityId: number; content: string }) =>
    apiPost(urlsApi.pipeline.exchangeUpdate, body),

  /** Xóa trao đổi */
  deleteExchange: (id: number) =>
    apiDelete(urlsApi.pipeline.exchangeDelete, { id }),

  /** Cập nhật xác suất cho 1 bước */
  updateProcess: (body: { opportunityId: number; processId: number; probability: number }) =>
    apiPost(urlsApi.pipeline.processUpdate, body),
};

export default PipelineService;
