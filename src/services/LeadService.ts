// ═══════════════════════════════════════════════════════════════════════
// Lead Service
// Banking "Lead" ↔ retail /adminapi/customer/list_paid
// Tái sử dụng toàn bộ API, chỉ đổi tên concept
// ═══════════════════════════════════════════════════════════════════════
import { apiGet, apiPost, apiDelete } from "configs/apiClient";
import { urlsApi } from "configs/urls";

export interface ILeadFilter {
  page?: number;
  limit?: number;
  keyword?: string;
  customerSourceId?: number;
  employeeId?: number;
  /** hot=1, warm=2, cold=3 */
  status?: number;
  /** product type filter, maps to customerGroupId or custom field */
  productType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ILeadCreate {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerGroupId?: number;   // maps to product type (Vay/Thẻ/TK/Banca)
  customerSourceId?: number;  // Web/App/Referral/Telesale/Chi nhánh
  employeeId?: number;        // RM phụ trách
  note?: string;
  /** Giá trị ước tính khoản vay/sản phẩm */
  estimatedValue?: number;
  deadline?: string;          // follow-up deadline
}

const LeadService = {
  /** Danh sách lead với filter, phân trang */
  list: (params?: ILeadFilter, signal?: AbortSignal) =>
    apiGet(urlsApi.lead.list, params, signal),

  /** Chi tiết 1 lead/KH */
  detail: (id: number) =>
    apiGet(urlsApi.lead.detail, { id }),

  /** Tạo mới hoặc cập nhật lead (id=null → create) */
  save: (body: ILeadCreate) =>
    apiPost(urlsApi.lead.create, body),

  /** Cập nhật 1 trường cụ thể (patch) */
  updateByField: (body: { id: number; fieldName: string; fieldValue: any }) =>
    apiPost(urlsApi.lead.updateByField, body),

  /** Xóa lead */
  delete: (id: number) =>
    apiDelete(urlsApi.lead.delete, { id }),

  /** Xem số điện thoại đầy đủ (khi bị che) */
  viewPhone: (id: number) =>
    apiGet(urlsApi.lead.viewPhone, { id }),

  /** Import lead từ file Excel/CSV */
  import: (body: { importType: string; fileName: string }) =>
    apiPost(urlsApi.lead.import, body),

  /** Danh sách nguồn lead (Web, App, Referral...) */
  sourceList: (params?: { page?: number; limit?: number }) =>
    apiGet(urlsApi.lead.sourceList, params),

  /** Lịch sử tương tác với lead/KH */
  exchangeList: (customerId: number, params?: { page?: number; limit?: number }) =>
    apiGet(urlsApi.lead.exchangeList, { customerId, ...params }),

  /** Thêm ghi chú / trao đổi với lead */
  addExchange: (body: { customerId: number; content: string; type?: string }) =>
    apiPost(urlsApi.lead.exchangeUpdate, body),

  /** Gửi SMS cho lead */
  sendSms: (body: { customerId: number; templateId?: number; content?: string }) =>
    apiPost(urlsApi.lead.sendSms, body),

  /** Gửi Email cho lead */
  sendEmail: (body: { customerId: number; templateId?: number; subject?: string; content?: string }) =>
    apiPost(urlsApi.lead.sendEmail, body),
};

export default LeadService;
