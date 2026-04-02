// ═══════════════════════════════════════════════════════════════════════
// CRM BANKING – API URL Config
// Mapping từ cloud-crm retail → banking, reuse toàn bộ backend endpoints
// Backend microservice: cloud-sales-master (bất biến theo ngành)
// ═══════════════════════════════════════════════════════════════════════

const prefixAdmin  = "/adminapi";
const prefixBiz    = "/bizapi";
const prefixBpm    = (process.env.APP_BPM_URL || "") + "/bpmapi";
const prefixAuth   = "/authenticator";
const prefixSales  = prefixBiz + "/sales";
const prefixCare   = prefixBiz + "/care";
const prefixNotif  = prefixBiz + "/notification";

export const urlsApi = {
  // ── AUTH ──────────────────────────────────────────────────────────────
  user: {
    profile:     prefixAuth + "/user/me",
    list:        prefixAuth + "/user/list",
    selectUsers: prefixAuth + "/user/select",
    changePass:  prefixAuth + "/user/change_pass",
  },

  // ── LEAD / KHÁCH HÀNG (retail: customer) ─────────────────────────────
  // Banking Lead Management ↔ /adminapi/customer/list_paid
  lead: {
    list:           prefixAdmin + "/customer/list_paid",         // GET  ?page=&limit=&keyword=&customerSourceId=&employeeId=
    detail:         prefixAdmin + "/customer/get",               // GET  ?id=
    create:         prefixAdmin + "/customer/update",            // POST (id null = create)
    update:         prefixAdmin + "/customer/update",            // POST
    delete:         prefixAdmin + "/customer/delete",            // DELETE ?id=
    updateByField:  prefixAdmin + "/customer/update/byField",    // POST  (patch single field)
    import:         prefixAdmin + "/customer/import/autoProcess",// POST  (file upload)
    downloadError:  prefixAdmin + "/customer/import",            // GET   /{id}/downloadError
    viewPhone:      prefixAdmin + "/customer/get/phone",         // GET  ?id=
    viewEmail:      prefixAdmin + "/customer/get/email",         // GET  ?id=
    sendSms:        prefixAdmin + "/customer/send/sms",          // POST
    sendEmail:      prefixAdmin + "/customer/send/email",        // POST
    sendZalo:       prefixAdmin + "/customer/send/zalo",         // POST
    // Customer 360 – exchanges (interaction history)
    exchangeList:   prefixAdmin + "/customerExchange/list",      // GET  ?customerId=&page=&limit=
    exchangeUpdate: prefixAdmin + "/customerExchange/update",    // POST
    exchangeDelete: prefixAdmin + "/customerExchange/delete",    // DELETE ?id=
    // Schedules (lịch hẹn gắn với KH)
    scheduleList:   prefixAdmin + "/customerScheduler/list",     // GET  ?customerId=
    scheduleUpdate: prefixAdmin + "/customerScheduler/update",   // POST
    scheduleCancel: prefixAdmin + "/customerScheduler/cancel",   // POST ?id=
    // Service suggestions → banking upsell signals
    suggestions:    prefixAdmin + "/customer/serviceSuggestions",// GET  ?customerId=
    // Sources (nguồn lead)
    sourceList:     prefixAdmin + "/customerSource/list",        // GET
    // Groups / segments
    groupList:      prefixAdmin + "/customerGroup/list",         // GET
  },

  // ── PIPELINE / CƠ HỘI (retail: campaignOpportunity) ──────────────────
  // Banking Pipeline ↔ /adminapi/campaignOpportunity/*
  pipeline: {
    list:           prefixAdmin + "/campaignOpportunity/list",          // GET  ?campaignId=&saleStatusId=&page=&limit=
    listViewSale:   prefixAdmin + "/campaignOpportunity/list/view_sale",// GET  (RM view)
    detail:         prefixAdmin + "/campaignOpportunity/get",           // GET  ?id=
    create:         prefixAdmin + "/campaignOpportunity/update",        // POST (id null = create)
    update:         prefixAdmin + "/campaignOpportunity/update",        // POST
    updateBatch:    prefixAdmin + "/campaignOpportunity/update/batch",  // POST
    delete:         prefixAdmin + "/campaignOpportunity/delete",        // DELETE ?id=
    changeEmployee: prefixAdmin + "/campaignOpportunity/change/employee",// POST
    changeSale:     prefixAdmin + "/campaignOpportunity/change/sale",   // POST (đổi stage)
    // Trao đổi trong cơ hội
    exchangeList:   prefixAdmin + "/opportunityExchange/list",          // GET  ?opportunityId=
    exchangeUpdate: prefixAdmin + "/opportunityExchange/update",        // POST
    exchangeDelete: prefixAdmin + "/opportunityExchange/delete",        // DELETE ?id=
    // Xác suất / process steps
    processUpdate:  prefixAdmin + "/opportunityProcess/update",         // POST
    processDelete:  prefixAdmin + "/opportunityProcess/delete",         // DELETE ?id=
    // Standalone opportunity (gắn với KH)
    oppCreate:      prefixAdmin + "/opportunity/update",                // POST
    oppList:        prefixAdmin + "/opportunity/list",                  // GET  ?customerId=
    oppDetail:      prefixAdmin + "/opportunity/get",                   // GET  ?id=
    oppDelete:      prefixAdmin + "/opportunity/delete",                // DELETE ?id=
  },

  // ── CAMPAIGNS (giống hệt retail) ─────────────────────────────────────
  campaign: {
    list:            prefixAdmin + "/campaign/list",                    // GET
    listViewSale:    prefixAdmin + "/campaign/list/view_sale",          // GET (RM only)
    detail:          prefixAdmin + "/campaign/get",                     // GET  ?id=
    create:          prefixAdmin + "/campaign/update",                  // POST
    update:          prefixAdmin + "/campaign/update",                  // POST
    updateStatus:    prefixAdmin + "/campaign/update/status",           // POST
    delete:          prefixAdmin + "/campaign/delete",                  // DELETE ?id=
    statisticSale:   prefixAdmin + "/campaignOpportunity/statisticSale",// GET
    exportResult:    prefixAdmin + "/campaignOpportunity/exportResult", // POST
    // KPI config
    updateKpi:       prefixAdmin + "/campaign/update/kpi",              // POST
    // Sales trong campaign
    listSale:        prefixAdmin + "/campaignSale/list",                // GET  ?campaignId=
  },

  // ── APPROVAL / PHÊ DUYỆT (retail: approval) ──────────────────────────
  // Banking hồ sơ phê duyệt ↔ /adminapi/approval/*
  approval: {
    list:         prefixAdmin + "/approval/list",          // GET  ?page=&limit=&status=&type=
    detail:       prefixAdmin + "/approval/get",           // (workOrder/get nếu BPM)
    create:       prefixAdmin + "/approval/update",        // POST
    update:       prefixAdmin + "/approval/update",        // POST
    updateStatus: prefixAdmin + "/approval/update/status", // POST {id, status: 'approved'|'rejected', note}
    delete:       prefixAdmin + "/approval/delete",        // DELETE ?id=
    // Config luồng duyệt
    configList:   prefixAdmin + "/approvalConfig/list",    // GET
    configUpdate: prefixAdmin + "/approvalConfig/update",  // POST
  },

  // ── TASKS / LỊCH HẸN (retail: workOrder via BPM) ────────────────────
  // Banking tasks ↔ /bpmapi/workOrder/list
  task: {
    list:    prefixBpm  + "/workOrder/list",     // GET  ?assigneeId=&status=&page=&limit=
    update:  prefixAdmin + "/workOrder/update",  // POST (create/update)
    detail:  prefixAdmin + "/workOrder/get",     // GET  ?id=
    delete:  prefixAdmin + "/workOrder/delete",  // DELETE ?id=
    // Lịch hẹn tư vấn (scheduleConsultant)
    schedList:   prefixAdmin + "/scheduleConsultant/list",   // GET  ?employeeId=&date=
    schedUpdate: prefixAdmin + "/scheduleConsultant/update", // POST
    schedDetail: prefixAdmin + "/scheduleConsultant/get",    // GET  ?id=
    schedDelete: prefixAdmin + "/scheduleConsultant/delete", // DELETE ?id=
    // Lịch chung (gộp tất cả)
    schedCommon: prefixAdmin + "/schedule/list",             // GET  ?employeeId=&startDate=&endDate=
  },

  // ── KPI (giống retail, dùng chung) ───────────────────────────────────
  kpi: {
    list:             prefixAdmin + "/kpi/list",              // GET  ?employeeId=&month=&year=
    update:           prefixAdmin + "/kpi/update",            // POST
    delete:           prefixAdmin + "/kpi/delete",            // DELETE
    // KPI object (kết quả nhân viên)
    objectList:       prefixAdmin + "/kpiObject/list",        // GET  ?kpiId=
    objectDetail:     prefixAdmin + "/kpiObject/get",         // GET  ?id=
    objectResult:     prefixAdmin + "/kpiObject/employee/result", // GET  ?kpiObjectId=
    // KPI Apply
    applyList:        prefixAdmin + "/kpiApply/list",         // GET  ?kpiId=
    applyUpdate:      prefixAdmin + "/kpiApply/update",       // POST
    // Goal
    goalList:         prefixAdmin + "/kpiGoal/list",          // GET
    goalUpdate:       prefixAdmin + "/kpiGoal/update",        // POST
    goalDetail:       prefixAdmin + "/kpiGoal/get",           // GET  ?id=
    // Report
    reportOpportunity: prefixAdmin + "/reportOpportunity/list", // GET
  },

  // ── NPS / SURVEY ─────────────────────────────────────────────────────
  nps: {
    list:   prefixCare + "/customerSurvey/list",   // GET  ?page=&limit=&score=
    detail: prefixCare + "/customerSurvey/get",    // GET  ?id=
    send:   prefixCare + "/customerSurvey/send",   // POST {customerIds, channel, message}
    update: prefixCare + "/customerSurvey/update", // POST
  },

  // ── SALES DOCS / TÀI LIỆU (retail: artifact/attachment) ─────────────
  docs: {
    list:    prefixAdmin + "/artifact/list",   // GET  ?type=&campaignId=
    detail:  prefixAdmin + "/artifact/get",    // GET  ?id=
    upload:  prefixAdmin + "/artifact/update", // POST (multipart)
    delete:  prefixAdmin + "/artifact/delete", // DELETE ?id=
    download:prefixAdmin + "/artifact/download",// GET  ?id=
  },

  // ── BPM / SALES PROCESS ──────────────────────────────────────────────
  bpm: {
    processList:   prefixBpm + "/process/list",          // GET  processes
    processDetail: prefixBpm + "/process/get",           // GET  ?id=
    processUpdate: prefixBpm + "/process/update",        // POST (deploy BPMN XML)
    processDelete: prefixBpm + "/process/delete",        // DELETE ?id=
    deploy:        prefixBpm + "/kafka/activateProcess", // POST  {processKey}
    validateBpmn:  prefixBpm + "/process/validate",      // POST  {xml}
    exportBpmn:    prefixBpm + "/process/export",        // GET   ?processKey=
  },

  // ── NOTIFICATIONS ────────────────────────────────────────────────────
  notification: {
    list:         prefixNotif + "/firebaseDeliveryHistory/list",         // GET
    update:       prefixNotif + "/firebaseDeliveryHistory/update",       // POST
    countUnread:  prefixNotif + "/firebaseDeliveryHistory/count",        // GET
    readAll:      prefixNotif + "/firebaseDeliveryHistory/update/readAll",// POST
  },

  // ── EMPLOYEE / RM ────────────────────────────────────────────────────
  employee: {
    list:   prefixAuth + "/employee/list",
    detail: prefixAuth + "/employee/get",
    info:   prefixAuth + "/employee/info",
    update: prefixAuth + "/employee/update",
    delete: prefixAuth + "/employee/delete",
  },

  // ── DASHBOARD (sales summary) ─────────────────────────────────────────
  dashboard: {
    summary: prefixSales + "/invoice/dashboard", // GET  ?month=&year=&branchId=
  },
};

// ── ORGANIZATION / HR ─────────────────────────────────────────────────
export const orgUrls = {
  department: {
    list:         "/adminapi/department/list",
    listBranch:   "/adminapi/department/list/branch",
    update:       "/adminapi/department/update",
    detail:       "/adminapi/department/get",
    delete:       "/adminapi/department/delete",
    updateParent: "/adminapi/department/update/parent",
  },
  employee: {
    list:           "/adminapi/employee/list",
    update:         "/adminapi/employee/update",
    detail:         "/adminapi/employee/get",
    delete:         "/adminapi/employee/delete",
    listDept:       "/adminapi/employee/list/department",
    linkUser:       "/adminapi/employee/link_user",
    info:           "/adminapi/employee/info",
    roles:          "/adminapi/employee/roles",
    updateRole:     "/adminapi/roleEmployee/insert-batch",
    listRoles:      "/adminapi/roleEmployee/list",
    deleteRole:     "/adminapi/roleEmployee/delete",
    randomPass:     "/adminapi/employee/random_pass",
  },
  role: {
    list:         "/adminapi/role/list",
    listBranch:   "/adminapi/role/list/branch",
    update:       "/adminapi/role/update",
    detail:       "/adminapi/role/get",
    delete:       "/adminapi/role/delete",
    updateParent: "/adminapi/role/update/parent",
  },
  permission: {
    resources:          "/adminapi/permission/resource",
    departmentInfo:     "/adminapi/permission/info",
    roleInfo:           "/adminapi/rolePermission/info",
    departmentAdd:      "/adminapi/permission/add",
    roleAdd:            "/adminapi/rolePermission/add",
    departmentRemove:   "/adminapi/permission/remove",
    roleRemove:         "/adminapi/rolePermission/remove",
  },
};

// ── INCENTIVE / HOA HỒNG ─────────────────────────────────────────────
export const incentiveUrls = {
  tipGroup: {
    list:                "/adminapi/tipGroup/list",
    update:              "/adminapi/tipGroup/update",
    delete:              "/adminapi/tipGroup/delete",
    listGroupEmployee:   "/adminapi/tipGroupEmployee/list",
    updateGroupEmployee: "/adminapi/tipGroupEmployee/update",
    deleteGroupEmployee: "/adminapi/tipGroupEmployee/delete",
  },
  tipUser: {
    list:   "/adminapi/tipUser/list",
    update: "/adminapi/tipUser/update",
    delete: "/adminapi/tipUser/delete",
  },
  tipUserConfig: {
    list:   "/adminapi/tipUserConfig/list",
    update: "/adminapi/tipUserConfig/update",
    delete: "/adminapi/tipUserConfig/delete",
  },
  tipGroupConfig: {
    list:   "/adminapi/tipGroupConfig/list",
    update: "/adminapi/tipGroupConfig/update",
    delete: "/adminapi/tipGroupConfig/delete",
  },
  // Payroll export
  payroll: {
    export: "/adminapi/payroll/export",
  },
  // Trigger payout when deal closes
  trigger: {
    calculate: "/adminapi/tipUser/calculate",
    history:   "/adminapi/tipUser/history",
  },
};

// ── SALES PROCESS (full BPM) ──────────────────────────────────────────
export const processUrls = {
  process: {
    list:     "/bpmapi/process/list",
    detail:   "/bpmapi/process/get",
    update:   "/bpmapi/process/update",
    delete:   "/bpmapi/process/delete",
    deploy:   "/bpmapi/kafka/activateProcess",
    validate: "/bpmapi/process/validate",
    export:   "/bpmapi/process/export",
    import:   "/bpmapi/process/import",
  },
  approval: {
    list:   "/adminapi/approvalConfig/list",
    update: "/adminapi/approvalConfig/update",
    delete: "/adminapi/approvalConfig/delete",
    detail: "/adminapi/approvalConfig/get",
  },
  permission: {
    list:   "/adminapi/process-permission/list",
    update: "/adminapi/process-permission/update",
    delete: "/adminapi/process-permission/delete",
  },
  configBpm: {
    componentList:  "/bpmapi/component/list",
    componentUpdate:"/bpmapi/component/update",
    componentDelete:"/bpmapi/component/delete",
    objectGroupList:"/bpmapi/objectGroup/list",
    objectGroupUpd: "/bpmapi/objectGroup/update",
    formCategoryList:"/bpmapi/formCategory/list",
    formCategoryUpd: "/bpmapi/formCategory/update",
  },

  // ── INCENTIVE / HOA HỒNG ────────────────────────────────────────────
  incentive: {
    // Nhóm hoa hồng (TipGroup)
    tipGroupList:      "/adminapi/tipGroup/list",
    tipGroupUpdate:    "/adminapi/tipGroup/update",
    tipGroupDelete:    "/adminapi/tipGroup/delete",
    // Thành viên nhóm (TipGroupEmployee)
    tipGroupEmpList:   "/adminapi/tipGroupEmployee/list",
    tipGroupEmpUpdate: "/adminapi/tipGroupEmployee/update",
    tipGroupEmpDelete: "/adminapi/tipGroupEmployee/delete",
    // Config HH nhóm (TipGroupConfig) - lịch sử chi trả theo nhóm
    tipGroupCfgList:   "/adminapi/tipGroupConfig/list",
    tipGroupCfgUpdate: "/adminapi/tipGroupConfig/update",
    tipGroupCfgDelete: "/adminapi/tipGroupConfig/delete",
    // Hoa hồng cá nhân (TipUser)
    tipUserList:       "/adminapi/tipUser/list",
    tipUserUpdate:     "/adminapi/tipUser/update",
    tipUserDelete:     "/adminapi/tipUser/delete",
    // Config HH cá nhân (TipUserConfig) - luật tier
    tipUserCfgList:    "/adminapi/tipUserConfig/list",
    tipUserCfgUpdate:  "/adminapi/tipUserConfig/update",
    tipUserCfgDelete:  "/adminapi/tipUserConfig/delete",
  },
};
