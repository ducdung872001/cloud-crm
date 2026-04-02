// ═══════════════════════════════════════════════════════════════════════
// Campaign Service  ↔  /adminapi/campaign/*
// ═══════════════════════════════════════════════════════════════════════
import { apiGet, apiPost, apiDelete } from "configs/apiClient";
import { urlsApi } from "configs/urls";

export const CampaignService = {
  list: (params?: { page?: number; limit?: number; status?: string; keyword?: string }, signal?: AbortSignal) =>
    apiGet(urlsApi.campaign.list, params, signal),

  listViewSale: (params?: { page?: number; limit?: number }, signal?: AbortSignal) =>
    apiGet(urlsApi.campaign.listViewSale, params, signal),

  detail: (id: number) =>
    apiGet(urlsApi.campaign.detail, { id }),

  save: (body: {
    id?: number;
    name: string;
    productType?: string;
    startDate?: string;
    endDate?: string;
    targetRevenue?: number;
    targetCustomers?: number;
    scope?: string;
    processKey?: string;
    description?: string;
    budget?: number;
  }) => apiPost(urlsApi.campaign.create, body),

  updateStatus: (body: { id: number; status: string }) =>
    apiPost(urlsApi.campaign.updateStatus, body),

  delete: (id: number) =>
    apiDelete(urlsApi.campaign.delete, { id }),

  /** Thống kê doanh số / KPI của chiến dịch */
  statisticSale: (campaignId: number) =>
    apiGet(urlsApi.campaign.statisticSale, { campaignId }),

  /** Danh sách RM trong chiến dịch + kết quả */
  listSale: (campaignId: number) =>
    apiGet(urlsApi.campaign.listSale, { campaignId }),
};

// ═══════════════════════════════════════════════════════════════════════
// Approval Service  ↔  /adminapi/approval/*
// ═══════════════════════════════════════════════════════════════════════
export const ApprovalService = {
  list: (params?: {
    page?: number;
    limit?: number;
    /** pending | reviewing | approved | rejected */
    status?: string;
    type?: string;
    employeeId?: number;
  }, signal?: AbortSignal) => apiGet(urlsApi.approval.list, params, signal),

  detail: (id: number) =>
    apiGet(urlsApi.approval.detail, { id }),

  create: (body: {
    customerId: number;
    type: string;
    value?: string;
    productType?: string;
    approvalLevel?: number;
    deadline?: string;
    reason: string;
    attachments?: string;
  }) => apiPost(urlsApi.approval.create, body),

  /** Phê duyệt hoặc từ chối */
  updateStatus: (body: {
    id: number;
    /** approved | rejected */
    status: string;
    note?: string;
  }) => apiPost(urlsApi.approval.updateStatus, body),

  delete: (id: number) =>
    apiDelete(urlsApi.approval.delete, { id }),
};

// ═══════════════════════════════════════════════════════════════════════
// Task Service  ↔  /bpmapi/workOrder/list  +  /adminapi/scheduleConsultant
// ═══════════════════════════════════════════════════════════════════════
export const TaskService = {
  /** Tasks/công việc (workOrder via BPM) */
  list: (params?: {
    page?: number;
    limit?: number;
    assigneeId?: number;
    /** open | done | overdue */
    status?: string;
    date?: string;
  }, signal?: AbortSignal) => apiGet(urlsApi.task.list, params, signal),

  detail: (id: number) =>
    apiGet(urlsApi.task.detail, { id }),

  save: (body: {
    id?: number;
    title: string;
    type?: string;
    /** high | medium | low */
    priority?: string;
    customerId?: number;
    opportunityId?: number;
    assigneeId?: number;
    dueDate?: string;
    dueTime?: string;
    note?: string;
  }) => apiPost(urlsApi.task.update, body),

  delete: (id: number) =>
    apiDelete(urlsApi.task.delete, { id }),

  /** Lịch hẹn tư vấn (scheduleConsultant) */
  schedList: (params?: {
    employeeId?: number;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }, signal?: AbortSignal) => apiGet(urlsApi.task.schedList, params, signal),

  schedSave: (body: {
    id?: number;
    customerId: number;
    employeeId?: number;
    scheduledDate: string;
    scheduledTime?: string;
    note?: string;
  }) => apiPost(urlsApi.task.schedUpdate, body),

  schedDelete: (id: number) =>
    apiDelete(urlsApi.task.schedDelete, { id }),

  /** Lịch chung (combines workOrder + scheduleConsultant) */
  schedCommon: (params?: { employeeId?: number; startDate?: string; endDate?: string }) =>
    apiGet(urlsApi.task.schedCommon, params),
};

// ═══════════════════════════════════════════════════════════════════════
// KPI Service  ↔  /adminapi/kpi/* + /adminapi/kpiObject/*
// ═══════════════════════════════════════════════════════════════════════
export const KpiService = {
  /** Danh sách KPI tháng */
  list: (params?: { page?: number; limit?: number; month?: number; year?: number; employeeId?: number }) =>
    apiGet(urlsApi.kpi.list, params),

  /** Kết quả KPI của nhân viên */
  employeeResult: (kpiObjectId: number) =>
    apiGet(urlsApi.kpi.objectResult, { kpiObjectId }),

  /** Danh sách KPI objects (tất cả nhân viên trong KPI) */
  objectList: (params?: { kpiId?: number; page?: number; limit?: number }) =>
    apiGet(urlsApi.kpi.objectList, params),

  /** Chi tiết KPI của 1 employee */
  objectDetail: (id: number) =>
    apiGet(urlsApi.kpi.objectDetail, { id }),

  /** Báo cáo cơ hội (funnel/pipeline stats) */
  reportOpportunity: (params?: { month?: number; year?: number; branchId?: number }) =>
    apiGet(urlsApi.kpi.reportOpportunity, params),
};

// ═══════════════════════════════════════════════════════════════════════
// NPS Service  ↔  /bizapi/care/customerSurvey/*
// ═══════════════════════════════════════════════════════════════════════
export const NpsService = {
  list: (params?: { page?: number; limit?: number; minScore?: number; maxScore?: number; employeeId?: number }) =>
    apiGet(urlsApi.nps.list, params),

  detail: (id: number) =>
    apiGet(urlsApi.nps.detail, { id }),

  send: (body: { customerIds: number[]; channel: string; message: string; scheduledAt?: string }) =>
    apiPost(urlsApi.nps.send, body),
};

// ═══════════════════════════════════════════════════════════════════════
// Notification Service  ↔  /bizapi/notification/firebaseDeliveryHistory
// ═══════════════════════════════════════════════════════════════════════
export const NotificationService = {
  list: (params?: { page?: number; limit?: number }) =>
    apiGet(urlsApi.notification.list, params),

  countUnread: () =>
    apiGet(urlsApi.notification.countUnread),

  markRead: (id: number) =>
    apiPost(urlsApi.notification.update, { id, isRead: true }),

  markReadAll: () =>
    apiPost(urlsApi.notification.readAll, {}),
};

// ═══════════════════════════════════════════════════════════════════════
// Employee Service  ↔  /authenticator/employee/*
// ═══════════════════════════════════════════════════════════════════════
export const EmployeeService = {
  list: (params?: { page?: number; limit?: number; keyword?: string }) =>
    apiGet(urlsApi.employee.list, params),
  info: () =>
    apiGet(urlsApi.employee.info),
  update: (body: Record<string, any>) =>
    apiPost(urlsApi.employee.update, body),
  delete: (id: number) =>
    apiDelete(urlsApi.employee.delete + "?id=" + id),
};

// ═══════════════════════════════════════════════════════════════════════
// BPM / Sales Process Service
// ═══════════════════════════════════════════════════════════════════════
export const BpmService = {
  listProcesses: (params?: { productType?: string }) =>
    apiGet(urlsApi.bpm.processList, params),

  detailProcess: (id: number) =>
    apiGet(urlsApi.bpm.processDetail, { id }),

  /** Save/deploy BPMN XML */
  deployProcess: (body: { processKey: string; xml: string; name?: string }) =>
    apiPost(urlsApi.bpm.deploy, body),

  /** Validate BPMN XML */
  validate: (body: { xml: string }) =>
    apiPost(urlsApi.bpm.validateBpmn, body),

  exportBpmn: (processKey: string) =>
    apiGet(urlsApi.bpm.exportBpmn, { processKey }),
};

// ═══════════════════════════════════════════════════════════════════════
// Dashboard Service  ↔  /bizapi/sales/invoice/dashboard
// ═══════════════════════════════════════════════════════════════════════
export const DashboardService = {
  summary: (params?: { month?: number; year?: number; branchId?: number }) =>
    apiGet(urlsApi.dashboard.summary, params),
};
