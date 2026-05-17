const prefixAdmin = "/adminapi";
const prefixApi = "/api";
const prefixAuthenticator = "/authenticator";
const prefixBilling = "/billing";

export const urlsApi = {
  // logout: prefixAuthenticator + "/user/logout",
  user: {
    create: prefixAuthenticator + "/user/create",
    profile: prefixAuthenticator + "/user/me",
    detail: prefixAuthenticator + "/user/get",
    basicInfo: prefixAuthenticator + "/user/basic-info",
    selectUsers: prefixAuthenticator + "/user/select",
    resetPass: prefixAuthenticator + "/user/reset-pass",
    changePass: prefixAuthenticator + "/user/change-pass",
    checkLogin: prefixAdmin + "/user-login/list",
    detailTimeLogin: prefixAdmin + "/user-login/daily/list",
  },

  customer: {
    filter: prefixAdmin + "/customer/list-paid",
    listshared: prefixAdmin + "/customer/list-paid/shared",
    update: prefixAdmin + "/customer/update",
    telesaleCallList: prefixAdmin + "/telesale-call/list",
    telesaleCallUpdate: prefixAdmin + "/telesale-call/update",
    updateByField: prefixAdmin + "/customer/update/by-field",
    delete: prefixAdmin + "/customer/delete",
    deleteAll: prefixAdmin + "/customer/delete",
    checkInProcess: prefixAdmin + "/customer/check-in-process",
    link: prefixAdmin + "/customer/link-user",
    detail: prefixAdmin + "/customer/get",
    area: "https://reborn.vn/api/area/child",
    addOther: prefixAdmin + "/customer-viewer/update",
    // api lấy ra thông tin khách hàng dựa theo id
    listById: prefixAdmin + "/customer/list-by-id",
    // Cập nhập hàng loạt
    updateCustomerGroup: prefixAdmin + "/customer/update-batch/customer-group",
    updateOneRelationship: prefixAdmin + "/customer/update/relationship",
    updateCustomeRelationship: prefixAdmin + "/customer/update-batch/relationship",
    updateCustomerSource: prefixAdmin + "/customer/update-batch/customer-source",
    updateCustomerEmployee: prefixAdmin + "/customer/update-batch/employee",
    // Lịch điều trị
    updateScheduler: prefixAdmin + "/customer-scheduler/update",
    filterScheduler: prefixAdmin + "/customer-scheduler/list",
    cancelScheduler: prefixAdmin + "/customer-scheduler/cancel",
    detailScheduler: prefixAdmin + "/customer-scheduler/get",
    // Trao đổi
    customerExchangeList: prefixAdmin + "/customer-exchange/list",
    customerExchangeUpdate: prefixAdmin + "/customer-exchange/update",
    customerExchangeDelete: prefixAdmin + "/customer-exchange/delete",
    // gửi sms, gửi email, gửi zalo
    customerSendSMS: prefixAdmin + "/customer/send/sms",
    customerSendEmail: prefixAdmin + "/customer/send/email",
    customerSendZalo: prefixAdmin + "/customer/send/zalo",

    parserSms: prefixAdmin + "/customer/send/sms/parser",
    parserEmail: prefixAdmin + "/customer/send/email/parser",
    parserZalo: prefixAdmin + "/customer/send/zalo/parser",
    // lấy số điện thoại khi bị che
    viewPhone: prefixAdmin + "/customer/get/phone",
    // lấy email khi bị che
    viewEmail: prefixAdmin + "/customer/get/email",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCustomerViewer: prefixAdmin + "/customer-viewer/update",
    // lấy về danh sách người xem
    lstCustomerViewer: prefixAdmin + "/customer-viewer/list",
    // xóa đi 1 người xem
    deleteCustomerViewer: prefixAdmin + "/customer-viewer/delete",
    // thêm khách hàng vào chương trình MA
    addCustomerMA: prefixAdmin + "/ma-customer/insert-list",
    // điền số lượng bản ghi muốn hiển thị
    numberFieldCustomer: prefixAdmin + "/customer/export/random-customers",
    // import khách hàng b2
    autoProcess: prefixAdmin + "/customer/import/auto-process",
    // import khách hàng b3
    manualProcess: prefixAdmin + "/customer/import/manual-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/customer/import",
    // tương tác khách hàng
    customerReport: prefixAdmin + "/customer-report/summary-action",
    // chi tiết tương tác khách hàng
    detailCustomerReport: prefixAdmin + "/customer-report/summary-action/detail",
    // danh sách các file đã tải
    lstAttachments: prefixAdmin + "/customer-exchange/attachment/list",
    // chi tiết tương tác từng khách hàng trong màn hình chi tiết khách hàng
    descCustomerReport: prefixAdmin + "/customer-report/action/list",
    // khách hàng đã theo dõi tk zalo nào
    customerZaloOA: prefixAdmin + "/customer/zalo/oa",
    // đoạn này là api bộ lọc nâng cao
    filterAdvanced: prefixAdmin + "/filter-setting/list",
    createFilterAdvanced: prefixAdmin + "/filter-setting/update",
    deleteFilterAdvanced: prefixAdmin + "/filter-setting/delete",
    customerAttributes: prefixAdmin + "/filter-setting/customers/attributes",
    filterLstCustomer: prefixAdmin + "/filter-setting",
    // lấy thuộc tính để placeholder Email
    // businessPartner: prefixAdmin + "/businessPartner/attributes",
    // emailAttributes: prefixAdmin + "/businessPartner/attributes",
    // lấy thuộc tính vào bảng filter
    filterTable: prefixAdmin + "/customer-attribute/list-filter",
    // lấy ra các trường, để tải dữ liệu mẫu về
    exAttributes: prefixAdmin + "/customer/export/attributes",
    // đoạn này tạo cơ hội cho khách hàng doanh nghiệp
    createOpportunity: prefixAdmin + "/opportunity/update",
    lstOpportunity: prefixAdmin + "/opportunity/list",
    deleteOpportunity: prefixAdmin + "/opportunity/delete",
    detailOpportunity: prefixAdmin + "/opportunity/get",

    // danh sách upload
    lstUpload: prefixAdmin + "/customer-upload/list",

    // api phân tích chân dung khách hàng
    classifyAge: prefixAdmin + "/api/v1/customer/classify/age",
    classifyGender: prefixAdmin + "/api/v1/customer/classify/gender",
    classifyIdentify: prefixAdmin + "/api/v1/customer/classify/identify",
    classifyTopRevenue: prefixAdmin + "/api/v1/customer/classify/top-revenue",
    classifyTopBought: prefixAdmin + "/api/v1/customer/classify/top-bought",
    classifyTopValueInvoice: prefixAdmin + "/api/v1/customer/classify/top-value-invoice",
    classifyNotInteractDay: prefixAdmin + "/api/v1/customer/classify/not-interact-day",
    classifyTopInteract: prefixAdmin + "/api/v1/customer/classify/top-interact",
    classifyCampaignJoined: prefixAdmin + "/api/v1/customer/classify/campaign-joined",
    classifyCustType: prefixAdmin + "/api/v1/customer/classify/cust-type",
    classifyCustGroup: prefixAdmin + "/api/v1/customer/classify/cust-group",
    classifyCustSource: prefixAdmin + "/api/v1/customer/classify/cust-source",
    classifyCustCareer: prefixAdmin + "/api/v1/customer/classify/cust-career",
    classifyCustArea: prefixAdmin + "/api/v1/customer/classify/cust-area",
    classifyCustomerCard: prefixAdmin + "/api/v1/customer/classify/customer-card",
    classifyInteractTimes: prefixAdmin + "/api/v1/customer/classify/interact-times",

    // gợi ý các sản phẩm/dịch vụ cho khách hàng
    serviceSuggestions: prefixAdmin + "/customer-object/list",
    // api khác để làm
    serviceSuggestionsv2: prefixAdmin + "/customer-object/get-top",

    // lấy ra các field động view nên chart
    fieldChart: prefixAdmin + "/customer/dashboard/fields",
    lstChartDynamicChart: prefixAdmin + "/customer/dashboard/list",
    updateChartDynamicChart: prefixAdmin + "/customer/dashboard/update",
    deleteChartDynamicChart: prefixAdmin + "/customer/dashboard/delete",
    detailChartDynamicChart: prefixAdmin + "/customer/dashboard/get",
    viewChartDynamicChart: prefixAdmin + "/customer/dashboard/fetch-data",
  },

  partner: {
    list: prefixAdmin + "/business-partner/list-paid",
    update: prefixAdmin + "/business-partner/update",
    detail: prefixAdmin + "/business-partner/get",
    delete: prefixAdmin + "/business-partner/delete",
    downloadFile: prefixAdmin + "/business-partner/import",
    // lấy số điện thoại khi bị che
    viewPhone: prefixAdmin + "/business-partner/get/phone",
    // lấy email khi bị che
    viewEmail: prefixAdmin + "/business-partner/get/email",

    numberFieldPartner: prefixAdmin + "/business-partner/export/random-business-partners",
    autoProcess: prefixAdmin + "/business-partner/import/auto-process",
    exAttributes: prefixAdmin + "/business-partner/export/attributes",

    // lấy thuộc tính vào bảng filter
    filterTable: prefixAdmin + "/business-partner/list-filter",
  },

  partnerExtraInfo: {
    list: prefixAdmin + "/business-partner-extra-info/list",
  },

  partnerAttribute: {
    list: prefixAdmin + "/business-partner-attribute/list",
    update: prefixAdmin + "/business-partner-attribute/update",
    delete: prefixAdmin + "/business-partner-attribute/delete",
    listAll: prefixAdmin + "/business-partner-attribute/list-all",
    checkDuplicated: prefixAdmin + "/business-partner-attribute/check-duplicated",
  },

  project: {
    list: prefixAdmin + "/work-project/list",
    update: prefixAdmin + "/work-project/update",
    detail: prefixAdmin + "/work-project/get",
    delete: prefixAdmin + "/work-project/delete",
  },

  // Khu vực quản lý vận hành ---
  space: {
    list: prefixAdmin + "/space/list",
    update: prefixAdmin + "/space/update",
    detail: prefixAdmin + "/space/get",
    delete: prefixAdmin + "/space/delete",
  },
  spaceType: {
    list: prefixAdmin + "/space-type/list",
    update: prefixAdmin + "/space-type/update",
    detail: prefixAdmin + "/space-type/get",
    delete: prefixAdmin + "/space-type/delete",
  },
  spaceCustomer: {
    list: prefixAdmin + "/space-customer/list",
    update: prefixAdmin + "/space-customer/update",
    detail: prefixAdmin + "/space-customer/get",
    delete: prefixAdmin + "/space-customer/delete",
  },
  ortherFee: {
    list: prefixAdmin + "/other-fee/list",
    update: prefixAdmin + "/other-fee/update",
    detail: prefixAdmin + "/other-fee/get",
    delete: prefixAdmin + "/other-fee/delete",
  },
  utilityReading: {
    list: prefixAdmin + "/utility-reading/list",
    update: prefixAdmin + "/utility-reading/update",
    detail: prefixAdmin + "/utility-reading/get",
    delete: prefixAdmin + "/utility-reading/delete",
  },
  managementFee: {
    list: prefixAdmin + "/management-fee/list",
    update: prefixAdmin + "/management-fee/update",
    detail: prefixAdmin + "/management-fee/get",
    delete: prefixAdmin + "/management-fee/delete",
  },
  vehicleRegistration: {
    list: prefixAdmin + "/vehicle-registration/list",
    update: prefixAdmin + "/vehicle-registration/update",
    detail: prefixAdmin + "/vehicle-registration/get",
    delete: prefixAdmin + "/vehicle-registration/delete",
  },
  vehicle: {
    list: prefixAdmin + "/vehicle/list",
    update: prefixAdmin + "/vehicle/update",
    detail: prefixAdmin + "/vehicle/get",
    delete: prefixAdmin + "/vehicle/delete",
  },
  building: {
    list: prefixAdmin + "/building/list",
    update: prefixAdmin + "/building/update",
    detail: prefixAdmin + "/building/get",
    delete: prefixAdmin + "/building/delete",
  },
  buildingFloor: {
    list: prefixAdmin + "/building-floor/list",
    update: prefixAdmin + "/building-floor/update",
    detail: prefixAdmin + "/building-floor/get",
    delete: prefixAdmin + "/building-floor/delete",
  },
  operationProject: {
    list: prefixAdmin + "/project/list",
    update: prefixAdmin + "/project/update",
    detail: prefixAdmin + "/project/get",
    delete: prefixAdmin + "/project/delete",
  },
  electricityRate: {
    list: prefixAdmin + "/electricity-rate/list",
    update: prefixAdmin + "/electricity-rate/update",
    detail: prefixAdmin + "/electricity-rate/get",
    delete: prefixAdmin + "/electricity-rate/delete",
  },
  waterRate: {
    list: prefixAdmin + "/water-rate/list",
    update: prefixAdmin + "/water-rate/update",
    detail: prefixAdmin + "/water-rate/get",
    delete: prefixAdmin + "/water-rate/delete",
  },
  managementFeeRate: {
    list: prefixAdmin + "/management-fee-rate/list",
    update: prefixAdmin + "/management-fee-rate/update",
    detail: prefixAdmin + "/management-fee-rate/get",
    delete: prefixAdmin + "/management-fee-rate/delete",
  },
  parkingFee: {
    list: prefixAdmin + "/parking-fee/list",
    update: prefixAdmin + "/parking-fee/update",
    detail: prefixAdmin + "/parking-fee/get",
    delete: prefixAdmin + "/parking-fee/delete",
  },
  //--- Khu vực quản lý vận hành

  historySend: {
    historySendSMS: prefixAdmin + "/customer-sms/list",
    historySendEmail: prefixAdmin + "/customer-email/list",
    historySendZalo: prefixAdmin + "/customer-zalo/list",
  },
  sendSMS: {
    // thêm, sửa, xóa danh sách gửi sms
    listSMS: prefixAdmin + "/sms-request/list",
    updateSMS: prefixAdmin + "/sms-request/update",
    detailSMS: prefixAdmin + "/sms-request/get",
    deleteSMS: prefixAdmin + "/sms-request/delete",
    approveSMS: prefixAdmin + "/sms-request/approve",
    cancelSMS: prefixAdmin + "/sms-request/cancel",
  },
  sendEmail: {
    // thêm, sửa, xóa danh sách gửi email
    listEmail: prefixAdmin + "/email-request/list",
    updateEmail: prefixAdmin + "/email-request/update",
    detailEmail: prefixAdmin + "/email-request/get",
    deleteEmail: prefixAdmin + "/email-request/delete",
    approveEmail: prefixAdmin + "/email-request/approve",
    cancelEmail: prefixAdmin + "/email-request/cancel",
  },
  estimate: {
    takeEstimate: prefixAdmin + "/customer/estimate",
  },
  invoice: {
    list: prefixAdmin + "/invoice/list/v2",
    create: prefixAdmin + "/invoice/create",
    invoiceDetail: prefixAdmin + "/invoice-detail/import",
    cardService: prefixAdmin + "/invoice-detail/card-service",
    // Tạo hóa đơn bán hàng
    invoiceDetailCustomer: prefixAdmin + "/invoice-detail/customer",
    // Xem chi tiết hóa đơn
    invoiceDetailList: prefixAdmin + "/invoice-detail/list",
    // Hủy hóa đơn
    cancelInvoice: prefixAdmin + "/invoice/delete",
    // vinh danh bán hàng
    sales: prefixAdmin + "/invoice/get/sales",
    // lấy danh sách thu tiền, chi tiền của khách
    debtInvoice: prefixAdmin + "/invoice/debt",
    // lưu tạm hóa đơn
    temporarilyInvoice: prefixAdmin + "/invoice/update/temp",
    // lịch sử tiêu dùng thẻ
    historyUseCard: prefixAdmin + "/invoice/using/card",
    // lấy mã hoá đơn
    invoiceCode: prefixAdmin + "/invoice/code",
  },
  boughtService: {
    addToInvoice: prefixAdmin + "/bought-service/update",
    delete: prefixAdmin + "/bought-service/delete",
    update: prefixAdmin + "/bought-service/update",
    detail: prefixAdmin + "/bought-service/get",
    getByCustomer: prefixAdmin + "/bought-service/get-bought-service-by-customer-id",
  },
  boughtProduct: {
    list: prefixAdmin + "/bought-product/list",
    addToInvoice: prefixAdmin + "/bought-product/update",
    delete: prefixAdmin + "/bought-product/delete",
    update: prefixAdmin + "/bought-product/update",
    detail: prefixAdmin + "/bought-product/get",
    getByCustomer: prefixAdmin + "/bought-product/get-bought-product-by-customer-id",
  },
  boughtCard: {
    list: prefixAdmin + "/bought-card-service/list",
    add: prefixAdmin + "/bought-card-service/update",
    delete: prefixAdmin + "/bought-card-service/delete",
    update: prefixAdmin + "/bought-card-service/update/card-number",
  },
  product: {
    filterWarehouse: prefixAdmin + "/product/in-warehouse",
    list: prefixAdmin + "/product/list",
    detail: prefixAdmin + "/product/get",
    update: prefixAdmin + "/product/update",
    updateContent: prefixAdmin + "/product/update/content",
    delete: prefixAdmin + "/product/delete",

    //danh sách sản phẩm của đối tác
    listShared: prefixAdmin + "/product/list/shared",
  },

  integration: {
    list: prefixAdmin + "/integration-partner/list",
    update: prefixAdmin + "/integration-config/update",
    updateStatus: prefixAdmin + "/integration-log/update/status",
    delete: prefixAdmin + "/integration-config/delete",
    logList: prefixAdmin + "/integration-log/list",
  },

  productAttribute: {
    list: prefixAdmin + "/product-attribute/list",
    update: prefixAdmin + "/product-attribute/update",
    delete: prefixAdmin + "/product-attribute/delete",
    listAll: prefixAdmin + "/product-attribute/list-all",
    checkDuplicated: prefixAdmin + "/product-attribute/check-duplicated",
  },

  productExtraInfo: {
    list: prefixAdmin + "/product-extra-info/list",
  },

  productImport: {
    update: prefixAdmin + "/product-import/update",
    detail: prefixAdmin + "/product-import/detail",
    delete: prefixAdmin + "/product-import/delete",
  },

  inventory: {
    list: prefixAdmin + "/inventory/list",
    update: prefixAdmin + "/inventory/update",
    delete: prefixAdmin + "/inventory/delete",
    import: prefixAdmin + "/inventory/import",
  },
  pom: {
    //định nghĩa pom cho sản phẩm, dịch vụ
    list: prefixAdmin + "/pom/list",
    update: prefixAdmin + "/pom/update",
    detail: prefixAdmin + "/pom/get",
    delete: prefixAdmin + "/pom/delete",
    // lấy danh sách pom trong phần bán hàng
    lstPomSales: prefixAdmin + "/pom/list/invoice",
  },
  service: {
    filter: prefixAdmin + "/service/list",
    update: prefixAdmin + "/service/update",
    updateContent: prefixAdmin + "/service/update/content",
    detail: prefixAdmin + "/service/get",
    delete: prefixAdmin + "/service/delete",

    //danh sách dịch vụ của đối tác
    listShared: prefixAdmin + "/service/list/shared",
  },
  serviceAttribute: {
    list: prefixAdmin + "/service-attribute/list",
    update: prefixAdmin + "/service-attribute/update",
    delete: prefixAdmin + "/service-attribute/delete",
    listAll: prefixAdmin + "/service-attribute/list-all",
    checkDuplicated: prefixAdmin + "/service-attribute/check-duplicated",
  },

  serviceExtraInfo: {
    list: prefixAdmin + "/service-extra-info/list",
  },

  employee: {
    list: prefixAdmin + "/employee/list",
    update: prefixAdmin + "/employee/update",
    detail: prefixAdmin + "/employee/get",
    delete: prefixAdmin + "/employee/delete",
    linkEmployeeUser: prefixAdmin + "/employee/link-user",
    init: prefixAdmin + "/employee/init",
    info: prefixAdmin + "/employee/info",
    takeRoles: prefixAdmin + "/employee/roles",
    listExTip: prefixAdmin + "/employee/list-ex-tip",
    generateRandomPass: prefixAdmin + "/employee/random-pass",
    list_department: prefixAdmin + "/employee/list/department",
    updateToken: prefixAdmin + "/employee/update-token", //Cập nhật token của Outlook Mail
    checkEmailConnection: prefixAdmin + "/employee/check-email-connection",
    disconnectEmail: prefixAdmin + "/employee/disconnect-email",
  },
  employeeAgent: {
    list: prefixAdmin + "/employee-agent/list",
    update: prefixAdmin + "/employee-agent/update",
    delete: prefixAdmin + "/employee-agent/delete",
  },
  treatment: {
    // đoạn api này cần xem lại chút
    filterSchedule: prefixAdmin + "/treatment-time/list-schedule-next",
    filterByScheduler: prefixAdmin + "/treatment-time/get-byscheduler",
    updateNext: prefixAdmin + "/treatment-time/update-next",
    delete: prefixAdmin + "/treatment-time/delete",
    updateCaringEmployee: prefixAdmin + "/treatment-time/update-caring-employee",
    update: prefixAdmin + "/treatment-time/update",
  },
  // lịch sử điều trị
  treatmentHistory: {
    list: prefixAdmin + "/treatment-history/list-all",
    update: prefixAdmin + "/treatment-history/update",
    detail: prefixAdmin + "/treatment-history/get",
    delete: prefixAdmin + "/treatment-history/delete",
    listByCustomer: prefixAdmin + "/treatment-history/list-by-customer",
  },
  // nhật ký điều trị
  diarySurgery: {
    list: prefixAdmin + "/diary-surgery/list-all",
    update: prefixAdmin + "/diary-surgery/update",
    detail: prefixAdmin + "/diary-surgery/get",
    delete: prefixAdmin + "/diary-surgery/delete",
  },
  // lịch trình tư vấn
  scheduleConsultant: {
    list: prefixAdmin + "/schedule-consultant/list",
    update: prefixAdmin + "/schedule-consultant/update",
    detail: prefixAdmin + "/schedule-consultant/get",
    delete: prefixAdmin + "/schedule-consultant/delete",
  },
  // lịch điều trị
  scheduleTreatment: {
    list: prefixAdmin + "/schedule-treatment/list",
    update: prefixAdmin + "/schedule-treatment/update",
    detail: prefixAdmin + "/schedule-treatment/get",
    delete: prefixAdmin + "/schedule-treatment/delete",
  },
  // lịch chung (điều trị, tư vấn, công việc)
  scheduleCommon: {
    list: prefixAdmin + "/schedule/list",
    listRelatedToCustomer: prefixAdmin + "/schedule/list/by-customer",
  },
  crmCareHistory: {
    list: prefixAdmin + "/crm-care-history/list",
    update: prefixAdmin + "/crm-care-history/update",
    delete: prefixAdmin + "/crm-care-history/delete",
  },
  timekeeping: {
    list: prefixAdmin + "/timekeeping/list",
    update: prefixAdmin + "/timekeeping/update",
    delete: prefixAdmin + "/timekeeping/delete",
  },
  cashbook: {
    list: prefixBilling + "/cashbook/list",
    update: prefixBilling + "/cashbook/update",
    delete: prefixBilling + "/cashbook/delete",
    export: prefixBilling + "/cashbook/export",
    detail: prefixBilling + "/cashbook/get",
  },
  //khu vực trải nghiệm khách hàng
  cxmSurvey: {
    list: prefixAdmin + "/cxm-survey/list",
    update: prefixAdmin + "/cxm-survey/update",
    delete: prefixAdmin + "/cxm-survey/delete",
    detail: prefixAdmin + "/cxm-survey/get",
  },
  cxmResponse: {
    list: prefixAdmin + "/cxm-response/list",
    update: prefixAdmin + "/cxm-response/update",
    delete: prefixAdmin + "/cxm-response/delete",
    detail: prefixAdmin + "/cxm-response/get",
  },
  cxmResponseDetail: {
    list: prefixAdmin + "/cxm-response-detail/list",
    update: prefixAdmin + "/cxm-response-detail/update",
    delete: prefixAdmin + "/cxm-response-detail/delete",
    detail: prefixAdmin + "/cxm-response-detail/get",
  },
  cxmQuestion: {
    list: prefixAdmin + "/cxm-question/list",
    update: prefixAdmin + "/cxm-question/update",
    delete: prefixAdmin + "/cxm-question/delete",
    detail: prefixAdmin + "/cxm-question/get",
  },
  cxmOption: {
    list: prefixAdmin + "/cxm-option/list",
    update: prefixAdmin + "/cxm-option/update",
    delete: prefixAdmin + "/cxm-option/delete",
    detail: prefixAdmin + "/cxm-option/get",
  },
  cxmQuestionCondition: {
    list: prefixAdmin + "/cxm-question-condition/list",
    update: prefixAdmin + "/cxm-question-condition/update",
    delete: prefixAdmin + "/cxm-question-condition/delete",
    detail: prefixAdmin + "/cxm-question-condition/get",
  },
  //khu vực trải nghiệm khách hàng
  warehouse: {
    list: prefixAdmin + "/warehouse/list",
    //API lấy ra danh sách sản phẩm trong kho
    productList: prefixAdmin + "/warehouse/product/list",
    //API lấy ra thông tin ngày hết hạn / sản xuất dựa trên số lô của sản phẩm
    infoExpiryDateProductionDate: prefixAdmin + "/warehouse/get-mfg-expired-date",
  },
  earnings: {
    filter: prefixAdmin + "/earnings/admin/list",
  },
  paymentHistory: {
    filter: prefixAdmin + "/payment-history/list",
    update: prefixAdmin + "/payment-history/update",
    delete: prefixAdmin + "/payment-history/delete",
  },
  //! đoạn này bh check lại một chút dữ liệu tạo cũ
  crmCampaign: {
    list: prefixAdmin + "/crm-campaign/list",
    update: prefixAdmin + "/crm-campaign/update",
    delete: prefixAdmin + "/crm-campaign/delete",
  },
  // Quản lý chiến dịch
  campaign: {
    list: prefixAdmin + "/campaign/list",
    listViewSale: prefixAdmin + "/campaign/list/view-sale",
    update: prefixAdmin + "/campaign/update",
    updateStatus: prefixAdmin + "/campaign/update/status",
    detail: prefixAdmin + "/campaign/get",
    delete: prefixAdmin + "/campaign/delete",
    convertRate: prefixAdmin + "/opportunity-process",
    listActionScore: prefixAdmin + "/api/v1/score/action",
    //Cài đặt điểm khách hàng
    updateStep3: prefixAdmin + "/api/v1/score/insert-multi",
    listDataStep3: prefixAdmin + "/api/v1/score/campaign",

    //Cài đặt điểm nhân viên
    updateStep4: prefixAdmin + "/campaign/sale-point-config/update",
    listDataScoreEmployee: prefixAdmin + "/campaign/sale-point-config/get",

    listSale: prefixAdmin + "/campaign-sale/list",
    statisticApproach: prefixAdmin + "/campaign-opportunity/statistic-approach",
    statisticSale: prefixAdmin + "/campaign-opportunity/statistic-sale",
    statisticConvertRate: prefixAdmin + "/campaign-opportunity/statistic-convert-rate",

    exportResult: prefixAdmin + "/campaign-opportunity/export-result",
    exportAction: prefixAdmin + "/campaign-opportunity/export-action",
    exportCustomer: prefixAdmin + "/campaign-opportunity/export-customer",

    updateConfigSLA: prefixAdmin + "/campaign/sla-config",
  },
  campaignApproach: {
    list: prefixAdmin + "/campaign-approach/list",
    update: prefixAdmin + "/campaign-approach/update",
    detail: prefixAdmin + "/campaign-approach/get",
    delete: prefixAdmin + "/campaign-approach/delete",
    updateSLA: prefixAdmin + "/campaign-approach/update/sla",
    activityList: prefixAdmin + "/campaign-activity/list",
    updateActivity: prefixAdmin + "/campaign-activity/update",
    deleteActivity: prefixAdmin + "/campaign-activity/delete",
  },
  campaignPipeline: {
    list: prefixAdmin + "/campaign-pipeline/list",
    update: prefixAdmin + "/campaign-pipeline/update",
    detail: prefixAdmin + "/campaign-pipeline/get",
    delete: prefixAdmin + "/campaign-pipeline/delete",
  },
  // quản lý cơ hội
  campaignOpportunity: {
    list: prefixAdmin + "/campaign-opportunity/list",
    listViewSale: prefixAdmin + "/campaign-opportunity/list/view-sale",
    update: prefixAdmin + "/campaign-opportunity/update",
    updateBatch: prefixAdmin + "/campaign-opportunity/update/batch",
    detail: prefixAdmin + "/campaign-opportunity/get",
    delete: prefixAdmin + "/campaign-opportunity/delete",
    // Đổi người phụ trách cơ hội
    changeEmployee: prefixAdmin + "/campaign-opportunity/change/employee",
    // Thêm mới hoặc cập nhập xác suất cơ hội
    opportunityProcessUpdate: prefixAdmin + "/opportunity-process/update",
    // Xóa 1 xác suất cơ hội
    opportunityProcessDelete: prefixAdmin + "/opportunity-process/delete",

    opportunityExchange: prefixAdmin + "/opportunity-exchange/list",
    // xóa 1 trao đổi trong công việc
    deleteOpportunityExchange: prefixAdmin + "/opportunity-exchange/delete",
    // thêm mới 1 trao đổi công việc
    addOpportunityExchange: prefixAdmin + "/opportunity-exchange/update",

    // chỉnh sửa 1 trao đổi công việc
    updateOpportunityExchange: prefixAdmin + "/opportunity-exchange/get",
    listOpportunity: prefixAdmin + "/opportunity/list",

    //check cơ hội đủ điều kiện để kéo
    opportunityCheck: prefixAdmin + "/campaign-opportunity/check",

    //send email
    sendEmail: prefixAdmin + "/customer/campaign/send/email",

    //Đầu mối làm việc
    opportunityContact: prefixAdmin + "/opportunity-contact/update",
    detailOpportunityContact: prefixAdmin + "/opportunity-contact/detail",

    ///Eform thu thập thông tin
    opportunityEformUpdate: prefixAdmin + "/opportunity-eform/update",
    opportunityEformDetail: prefixAdmin + "/opportunity-eform/get/criteria",
  },

  saleflow: {
    list: prefixAdmin + "/saleflow/list",
    update: prefixAdmin + "/saleflow/update",
    detail: prefixAdmin + "/saleflow/get",
    delete: prefixAdmin + "/saleflow/delete",
    activityList: prefixAdmin + "/saleflow-activity/list",
    updateActivity: prefixAdmin + "/saleflow-activity/update",
    deleteActivity: prefixAdmin + "/saleflow-activity/delete",

    saleflowEformUpdate: prefixAdmin + "/saleflow-eform/update",
    saleflowEformDetail: prefixAdmin + "/saleflow-eform/get/criteria",
  },

  saleflowApproach: {
    list: prefixAdmin + "/saleflow-approach/list",
    update: prefixAdmin + "/saleflow-approach/update",
    detail: prefixAdmin + "/saleflow-approach/get",
    delete: prefixAdmin + "/saleflow-approach/delete",
    updateSLA: prefixAdmin + "/saleflow-approach/update/sla",
    activityList: prefixAdmin + "/saleflow-activity/list",
    updateActivity: prefixAdmin + "/saleflow-activity/update",
    deleteActivity: prefixAdmin + "/saleflow-activity/delete",

    updateSaleflowSale: prefixAdmin + "/saleflow-sale/update",
    detailSaleflowSale: prefixAdmin + "/saleflow-sale/get/by-approach-id",
  },

  // quản lý bán hàng
  saleflowInvoice: {
    list: prefixAdmin + "/saleflow-invoice/list",
    update: prefixAdmin + "/saleflow-invoice/update",
    updateApproach: prefixAdmin + "/saleflow-invoice/update/approach",
    updateApproachSuccess: prefixAdmin + "/saleflow-invoice/update/success",
    updateApproachCancel: prefixAdmin + "/saleflow-invoice/update/cancel",
    detail: prefixAdmin + "/saleflow-invoice/get",
    delete: prefixAdmin + "/saleflow-invoice/delete",

    invoiceExchange: prefixAdmin + "/saleflow-exchange/list",
    // xóa 1 trao đổi trong
    deleteInvoiceExchange: prefixAdmin + "/saleflow-exchange/delete",
    // thêm mới 1 trao đổi
    addInvoiceExchange: prefixAdmin + "/saleflow-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateInvoiceExchange: prefixAdmin + "/saleflow-exchange/get",
  },

  categoryService: {
    // Đoạn này là category của ông dịch vụ
    list: prefixAdmin + "/category-item/list",
    update: prefixAdmin + "/category-item/update",
    detail: prefixAdmin + "/category-item/get",
    delete: prefixAdmin + "/category-item/delete",
  },

  categoryProject: {
    list: prefixAdmin + "/project-type/list",
    update: prefixAdmin + "/project-type/update",
    detail: prefixAdmin + "/project-type/get",
    delete: prefixAdmin + "/project-type/delete",
  },

  category: {
    // Đoạn này là category của ông tài chính
    list: prefixAdmin + "/category/list",
    update: prefixAdmin + "/category/update",
    detail: prefixAdmin + "/category/get",
    delete: prefixAdmin + "/category/delete",
  },

  codeSequence: {
    list: prefixAdmin + "/code-sequence/list",
    update: prefixAdmin + "/code-sequence/update",
    detail: prefixAdmin + "/code-sequence/get",
    delete: prefixAdmin + "/code-sequence/delete",
    detailEntity: prefixAdmin + "/code-sequence/get/entity",
  },

  beautyBranch: {
    list: prefixAdmin + "/beauty-branch/list",
    childList: prefixAdmin + "/beauty-branch/child",
    detail: prefixAdmin + "/beauty-branch/get",
    update: prefixAdmin + "/beauty-branch/update",
    delete: prefixAdmin + "/beauty-branch/delete",
    getByBeauty: `${process.env.APP_AUTHENTICATOR_URL || "https://reborn.vn"}/api/beauty-salon/get-bydomain`,

    //tìm đối tác theo mã
    getBeautyBranchByCode: prefixAdmin + "/beauty-branch/get/by-code",

    // thay đổi trạng thái chi nhánh
    activate: prefixAdmin + "/beauty-branch/update/activate",
    unActivate: prefixAdmin + "/beauty-branch/update/deactivate",
  },

  organization: {
    list: "https://reborn.vn/api/beauty-salon/list",
    customerUploadList: prefixAdmin + "/customer-upload/list",
    customerUploadDelete: prefixAdmin + "/clean-data/upload-customer/delete",
  },
  order: {
    list: prefixAdmin + "/order/list",
    detail: prefixAdmin + "/order/get",
    update: prefixAdmin + "/order/update",
    delete: prefixAdmin + "/order/delete",
  },

  unit: {
    list: prefixAdmin + "/unit/list",
    update: prefixAdmin + "/unit/update",
    delete: prefixAdmin + "/unit/delete",
  },
  reportTemplate: {
    list: prefixAdmin + "/report-template/list",
    update: prefixAdmin + "/report-template/update",
    delete: prefixAdmin + "/report-template/delete",
  },
  department: {
    list: prefixAdmin + "/department/list",
    update: prefixAdmin + "/department/update",
    detail: prefixAdmin + "/department/get",
    delete: prefixAdmin + "/department/delete",
    list_branch: prefixAdmin + "/department/list/branch",

    updateParent: prefixAdmin + "/department/update/parent",
  },
  card: {
    list: prefixAdmin + "/card/list",
    update: prefixAdmin + "/card/update",
    delete: prefixAdmin + "/card/delete",
  },
  cardService: {
    list: prefixAdmin + "/card-service/list",
    update: prefixAdmin + "/card-service/update",
    detail: prefixAdmin + "/card-service/get",
    delete: prefixAdmin + "/card-service/delete",
  },
  contractCategory: {
    list: prefixAdmin + "/contract-category/list",
    update: prefixAdmin + "/contract-category/update",
    detail: prefixAdmin + "/contract-category/get",
    delete: prefixAdmin + "/contract-category/delete",
  },
  contractPipeline: {
    list: prefixAdmin + "/contract-pipeline/list",
    update: prefixAdmin + "/contract-pipeline/update",
    detail: prefixAdmin + "/contract-pipeline/get",
    delete: prefixAdmin + "/contract-pipeline/delete",
    contractSubPipelineUpdate: prefixAdmin + "/contract-sub-pipeline/update",
  },
  contractApproach: {
    list: prefixAdmin + "/contract-approach/list",
    update: prefixAdmin + "/contract-approach/update",
    detail: prefixAdmin + "/contract-approach/get",
    delete: prefixAdmin + "/contract-approach/delete",

    activityList: prefixAdmin + "/contract-activity/list",
    updateActivity: prefixAdmin + "/contract-activity/update",
    deleteActivity: prefixAdmin + "/contract-activity/delete",
  },

  contractPayment: {
    list: prefixAdmin + "/contract-payment/list",
    update: prefixAdmin + "/contract-payment/update",
    detail: prefixAdmin + "/contract-payment/get",
    delete: prefixAdmin + "/contract-payment/delete",
  },

  contractEform: {
    list: prefixAdmin + "/eform/list",
    update: prefixAdmin + "/eform/update",
    detail: prefixAdmin + "/eform/get",
    delete: prefixAdmin + "/eform/delete",

    listEformExtraInfo: prefixAdmin + "/eform-extra-info/list",
    updateEformExtraInfo: prefixAdmin + "/eform-extra-info/update",
    updateEformExtraInfoPosition: prefixAdmin + "/eform-extra-info/update/position",
    detailEformExtraInfo: prefixAdmin + "/eform-extra-info/get",
    deleteEformExtraInfo: prefixAdmin + "/eform-extra-info/delete",

    listEformAttribute: prefixAdmin + "/eform-attribute/list",
    updateEformAttribute: prefixAdmin + "/eform-attribute/update",
    detailEformAttribute: prefixAdmin + "/eform-attribute/get",
    deleteEformAttribute: prefixAdmin + "/eform-attribute/delete",
    listEformAttributeAll: prefixAdmin + "/eform-attribute/list-all",

    checkDuplicated: prefixAdmin + "/eform-attribute/check-duplicated",
    contractEformUpdate: prefixAdmin + "/contract-eform/update",
    contractEformDetail: prefixAdmin + "/contract-eform/get/criteria",
  },

  contractAttachment: {
    list: prefixAdmin + "/attachment/list",
    update: prefixAdmin + "/attachment/update",
    detail: prefixAdmin + "/attachment/get",
    delete: prefixAdmin + "/attachment/delete",

    contractAttachmentList: prefixAdmin + "/contract-attachment/list",
    contractAttachmentUpdate: prefixAdmin + "/contract-attachment/update",
    contractAttachmentDetail: prefixAdmin + "/contract-attachment/get",
    contractAttachmentDelete: prefixAdmin + "/contract-attachment/delete",
  },

  contractGuarantee: {
    list: prefixAdmin + "/guarantee/list",
    update: prefixAdmin + "/guarantee/update",
    detail: prefixAdmin + "/guarantee/get",
    delete: prefixAdmin + "/guarantee/delete",

    guaranteeTypeList: prefixAdmin + "/guarantee-type/list",
    guaranteeTypeUpdate: prefixAdmin + "/guarantee-type/update",
    guaranteeTypeDelete: prefixAdmin + "/guarantee-type/delete",

    competencyList: prefixAdmin + "/competency/list",
    competencyUpdate: prefixAdmin + "/competency/update",
    competencyDelete: prefixAdmin + "/competency/delete",

    bankList: prefixAdmin + "/bank/list",
    bankUpdate: prefixAdmin + "/bank/update",
    bankDelete: prefixAdmin + "/bank/delete",

    exAttributes: prefixAdmin + "/guarantee/export/attributes",
    numberFieldGuarantee: prefixAdmin + "/guarantee/export/random-guarantees",
    autoProcess: prefixAdmin + "/guarantee/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/guarantee/import",
  },

  contractWarranty: {
    list: prefixAdmin + "/contract-warranty/list",
    update: prefixAdmin + "/contract-warranty/update",
    detail: prefixAdmin + "/contract-warranty/get",
    delete: prefixAdmin + "/contract-warranty/delete",

    warrantyTypeList: prefixAdmin + "/contract-warranty-type/list",
    warrantyTypeUpdate: prefixAdmin + "/contract-warranty-type/update",
    warrantyTypeDelete: prefixAdmin + "/contract-warranty-type/delete",

    competencyList: prefixAdmin + "/competency/list",
    competencyUpdate: prefixAdmin + "/competency/update",
    competencyDelete: prefixAdmin + "/competency/delete",

    bankList: prefixAdmin + "/bank/list",
    bankUpdate: prefixAdmin + "/bank/update",
    bankDelete: prefixAdmin + "/bank/delete",

    exAttributes: prefixAdmin + "/contract-warranty/export/attributes",
    // numberFieldWarranty: prefixAdmin + "/contractWarranty/export/randomWarranty",
    numberFieldWarranty: prefixAdmin + "/contract-warranty/export/random-contract-warranty",
    autoProcess: prefixAdmin + "/contract-warranty/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contract-warranty/import",
  },

  guaranteeAttachment: {
    guaranteeAttachmentList: prefixAdmin + "/guarantee-attachment/list",
    guaranteeAttachmentUpdate: prefixAdmin + "/guarantee-attachment/update",
    guaranteeAttachmentDelete: prefixAdmin + "/guarantee-attachment/delete",
  },

  warrantyAttachment: {
    warrantyAttachmentList: prefixAdmin + "/contract-warranty-attachment/list",
    warrantyAttachmentUpdate: prefixAdmin + "/contract-warranty-attachment/update",
    warrantyAttachmentDelete: prefixAdmin + "/contract-warranty-attachment/delete",
  },

  znsTemplate: {
    list: prefixAdmin + "/zns-template/list",
    updateSync: prefixAdmin + "/zns-template/list/sync",
    detail: prefixAdmin + "/zns-template/get",
    delete: prefixAdmin + "/zns-template/delete",
    templateDetail: prefixAdmin + "/zns-template/refresh",
  },
  contractProduct: {
    list: prefixAdmin + "/project/list",
    update: prefixAdmin + "/project/update",
    detail: prefixAdmin + "/project/get",
    delete: prefixAdmin + "/project/delete",
    update_investor: prefixAdmin + "/investor/update",
    detail_investor: prefixAdmin + "/investor/get",
  },

  contractStage: {
    list: prefixAdmin + "/contract-stage/list",
    update: prefixAdmin + "/contract-stage/update",
    detail: prefixAdmin + "/contract-stage/get",
    delete: prefixAdmin + "/contract-stage/delete",
  },
  rentalType: {
    list: prefixAdmin + "/rental-type/list",
    update: prefixAdmin + "/rental-type/update",
    detail: prefixAdmin + "/rental-type/get",
    delete: prefixAdmin + "/rental-type/delete",
  },
  contact: {
    list: prefixAdmin + "/contact/list",
    update: prefixAdmin + "/contact/update",
    detail: prefixAdmin + "/contact/get",
    delete: prefixAdmin + "/contact/delete",
    fieldTable: prefixAdmin + "/contact-attribute/list-filter",

    contactExchange: prefixAdmin + "/contact-exchange/list",
    // xóa 1 trao đổi trong
    deleteContactExchange: prefixAdmin + "/contact-exchange/delete",
    // thêm mới 1 trao đổi
    addContactExchange: prefixAdmin + "/contact-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContactExchange: prefixAdmin + "/contact-exchange/get",

    exAttributes: prefixAdmin + "/contact/export/attributes",
    numberFieldContact: prefixAdmin + "/contact/export/random-contacts",
    autoProcess: prefixAdmin + "/contact/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contact/import",
  },
  contactPipeline: {
    list: prefixAdmin + "/contact-pipeline/list",
    update: prefixAdmin + "/contact-pipeline/update",
    detail: prefixAdmin + "/contact-pipeline/get",
    delete: prefixAdmin + "/contact-pipeline/delete",
  },
  contactStatus: {
    list: prefixAdmin + "/contact-status/list",
    update: prefixAdmin + "/contact-status/update",
    detail: prefixAdmin + "/contact-status/get",
    delete: prefixAdmin + "/contact-status/delete",
  },
  contactAttribute: {
    list: prefixAdmin + "/contact-attribute/list",
    update: prefixAdmin + "/contact-attribute/update",
    delete: prefixAdmin + "/contact-attribute/delete",
    listAll: prefixAdmin + "/contact-attribute/list-all",
    checkDuplicated: prefixAdmin + "/contact-attribute/check-duplicated",
  },
  contactExtraInfo: {
    list: prefixAdmin + "/contact-extra-info/list",
  },

  position: {
    list: prefixAdmin + "/position/list",
    update: prefixAdmin + "/position/update",
    delete: prefixAdmin + "/position/delete",
  },
  contract: {
    list: prefixAdmin + "/contract/list",
    detail: prefixAdmin + "/contract/get",
    update: prefixAdmin + "/contract/update",
    delete: prefixAdmin + "/contract/delete",
    updateAlert: prefixAdmin + "/contract/update/alert",

    //cảnh báo hợp đồng chung cho tất cả
    contractAlertUpdate: prefixAdmin + "/contract-alert/update",
    contractAlertList: prefixAdmin + "/contract-alert/list",

    //cảnh báo bảo lãnh hợp đồng chung cho tất cả
    guaranteeAlertUpdate: prefixAdmin + "/guarantee-alert/update",
    guaranteeAlertList: prefixAdmin + "/guarantee-alert/list",

    //cảnh báo bảo hành hợp đồng chung cho tất cả
    warrantyAlertUpdate: prefixAdmin + "/contract-warranty-alert/update",
    warrantyAlertList: prefixAdmin + "/contract-warranty-alert/list",

    detailAlert: prefixAdmin + "/contract",
    fieldTable: prefixAdmin + "/contract-attribute/list-filter",

    updateApproach: prefixAdmin + "/contract/update/approach",

    //list mã đề nghị
    listCodeSuggest: prefixAdmin + "/contract-request/list",

    //list mã mặt hàng dịch vụ
    listCodeService: prefixAdmin + "/contract/products/select",

    //list nhà cung cấp
    listSupplier: prefixAdmin + "/contract/suppliers/select",

    //thêm hạng mục bàn giao
    updateHandover: prefixAdmin + "/contract-item/update",

    //thêm đợt bàn giao
    updateHandoverProgress: prefixAdmin + "/contract-handover/update",

    //danh sách đợt bàn giao
    listHandoverProgress: prefixAdmin + "/contract-handover/list",

    // xóa 1 đợt bàn giao
    deleteHandoverProgress: prefixAdmin + "/contract-handover/delete",

    //phụ lục hợp đồng
    contractAppendixList: prefixAdmin + "/contract-appendix/list",
    contractAppendixDelete: prefixAdmin + "/contract-appendix/delete",
    contractAppendixUpdate: prefixAdmin + "/contract-appendix/update",
    contractAppendixDetail: prefixAdmin + "/contract-appendix/get",

    contractExchange: prefixAdmin + "/contract-exchange/list",
    // xóa 1 trao đổi trong
    deleteContractExchange: prefixAdmin + "/contract-exchange/delete",
    // thêm mới 1 trao đổi
    addContractExchange: prefixAdmin + "/contract-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContractExchange: prefixAdmin + "/contract-exchange/get",
    // gửi báo giá
    sendQuote: prefixAdmin + "/contract/email-quote",

    // gửi hợp đồng mẫu
    sendContract: prefixAdmin + "/contract/email-contract",

    exAttributes: prefixAdmin + "/contract/export/attributes",
    numberFieldCustomer: prefixAdmin + "/contract/export/random-contracts",
    autoProcess: prefixAdmin + "/contract/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contract/import",

    //các biểu đồ thống kê
    reportContractStatus: prefixAdmin + "/contract/dashboard/by-status",
    reportContractContract: prefixAdmin + "/contract/dashboard/deal-value-by-customer",
    reportNewContract: prefixAdmin + "/contract/dashboard/new-by-time",

    //thay đổi các trạng thái liên quan đến hợp đồng
    updateStatus: prefixAdmin + "/contract/update/status",

    //lịch sử thay đổi hợp đồng
    logValues: prefixAdmin + "/contract/log-values",
  },
  customerGroup: {
    list: prefixAdmin + "/customer-group/list",
    update: prefixAdmin + "/customer-group/update",
    delete: prefixAdmin + "/customer-group/delete",
  },
  customerSource: {
    list: prefixAdmin + "/customer-source/list",
    update: prefixAdmin + "/customer-source/update",
    delete: prefixAdmin + "/customer-source/delete",
  },
  customerView: {
    list: prefixAdmin + "/customer-view/list",
    update: prefixAdmin + "/customer-view/update",
    delete: prefixAdmin + "/customer-view/delete",
  },

  reportChart: {
    listReportArtifact: prefixAdmin + "/report-artifact/list",
    listArtifactByDashboard: prefixAdmin + "/report-artifact/list/by-dashboard",
    listArtifactByEmployee: prefixAdmin + "/report-artifact/list/by-employee",
    updateReportArtifact: prefixAdmin + "/report-artifact/update",
    deleteReportArtifact: prefixAdmin + "/report-artifact/delete",

    listReportDashboard: prefixAdmin + "/report-dashboard/list",
    updateReportDashboard: prefixAdmin + "/report-dashboard/update",
    deleteReportDashboard: prefixAdmin + "/report-dashboard/delete",

    listReportRole: prefixAdmin + "/report-role/list",
    updateReportRole: prefixAdmin + "/report-role/update",
    deleteReportRole: prefixAdmin + "/report-role/delete",

    updateReportConfig: prefixAdmin + "/report-config/update",
    deleteReportConfig: prefixAdmin + "/report-config/delete",
  },

  customerField: {
    list: prefixAdmin + "/customer-field/list",
    update: prefixAdmin + "/customer-field/update",
    delete: prefixAdmin + "/customer-field/delete",
  },
  customerAttribute: {
    list: prefixAdmin + "/customer-attribute/list",
    update: prefixAdmin + "/customer-attribute/update",
    delete: prefixAdmin + "/customer-attribute/delete",
    listAll: prefixAdmin + "/customer-attribute/list-all",
    checkDuplicated: prefixAdmin + "/customer-attribute/check-duplicated",
  },
  customerExtraInfo: {
    list: prefixAdmin + "/customer-extra-info/list",
  },
  contractAttribute: {
    list: prefixAdmin + "/contract-attribute/list",
    update: prefixAdmin + "/contract-attribute/update",
    delete: prefixAdmin + "/contract-attribute/delete",
    listAll: prefixAdmin + "/contract-attribute/list-all",
    checkDuplicated: prefixAdmin + "/contract-attribute/check-duplicated",
  },
  contractExtraInfo: {
    list: prefixAdmin + "/contract-extra-info/list",
  },

  guaranteeAttribute: {
    list: prefixAdmin + "/guarantee-attribute/list",
    update: prefixAdmin + "/guarantee-attribute/update",
    delete: prefixAdmin + "/guarantee-attribute/delete",
    listAll: prefixAdmin + "/guarantee-attribute/list-all",
    checkDuplicated: prefixAdmin + "/guarantee-attribute/check-duplicated",
  },
  warrantyAttribute: {
    list: prefixAdmin + "/contract-warranty-attribute/list",
    update: prefixAdmin + "/contract-warranty-attribute/update",
    delete: prefixAdmin + "/contract-warranty-attribute/delete",
    listAll: prefixAdmin + "/contract-warranty-attribute/list-all",
    checkDuplicated: prefixAdmin + "/contract-warranty-attribute/check-duplicated",
  },
  guaranteeExtraInfo: {
    list: prefixAdmin + "/guarantee-extra-info/list",
  },
  warrantyExtraInfo: {
    list: prefixAdmin + "/contract-warranty-extra-info/list",
  },

  career: {
    list: prefixAdmin + "/career/list",
    update: prefixAdmin + "/career/update",
    delete: prefixAdmin + "/career/delete",
  },
  relationShip: {
    list: prefixAdmin + "/relationship/list",
    update: prefixAdmin + "/relationship/update",
    delete: prefixAdmin + "/relationship/delete",
  },
  tipGroup: {
    list: prefixAdmin + "/tip-group/list",
    update: prefixAdmin + "/tip-group/update",
    delete: prefixAdmin + "/tip-group/delete",
    listTipGroupEmloyee: prefixAdmin + "/tip-group-employee/list",
    updateTipGroupEmloyee: prefixAdmin + "/tip-group-employee/update",
    deleteTipGroupEmloyee: prefixAdmin + "/tip-group-employee/delete",
  },
  tipUser: {
    list: prefixAdmin + "/tip-user/list",
    update: prefixAdmin + "/tip-user/update",
    delete: prefixAdmin + "/tip-user/delete",
  },
  tipUserConfig: {
    list: prefixAdmin + "/tip-user-config/list",
    update: prefixAdmin + "/tip-user-config/update",
    delete: prefixAdmin + "/tip-user-config/delete",
  },
  tipGroupConfig: {
    list: prefixAdmin + "/tip-group-config/list",
    update: prefixAdmin + "/tip-group-config/update",
    delete: prefixAdmin + "/tip-group-config/delete",
  },
  setting: {
    list: prefixAdmin + "/setting/list",
    update: prefixAdmin + "/setting/update",
  },
  connectGmail: {
    connect: "https://connect.reborn.vn/api/v1/google/access-token",
    checkConnect: "https://connect.reborn.vn/api/v1/google/gmails-link-bsn",
  },
  fanpageFacebook: {
    //* kết nối fanpage với crm
    connect: prefixAdmin + "/fanpage/connect",
    //* Lấy danh sách fanpage đã được kết nối
    list: prefixAdmin + "/fanpage/list",
    //* Chọn thêm 1 kết nối fanpage
    update: prefixAdmin + "/fanpage/update",
    //* gỡ fanpage ra khỏi kết nối
    delete: prefixAdmin + "/fanpage/remove",
    //* Lấy danh sách fanpage đã được kết nối
    listFanpage: prefixAdmin + "/fanpage/list",
    //* Lấy danh sách hội thoại chat
    listFanpageDialog: prefixAdmin + "/fanpage-dialog/list",
    //* Danh sách tin nhắn chat từ fanpage
    listFanpageChat: prefixAdmin + "/fanpage-chat/list",
    //* Phản hồi (nhắn tin phản hồi người chat facebook)
    replyFanpageChat: prefixAdmin + "/fanpage-chat/reply",
    //* Danh sách bình luận từ fanpage
    listFanpageComment: prefixAdmin + "/fanpage-comment/list",
    //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
    replyFanpageComment: prefixAdmin + "/fanpage-comment/reply",
    //* Gỡ 1 bình luận đã đăng
    deleteFanpageComment: prefixAdmin + "/fanpage-comment/delete",
    //* Ẩn 1 bình luận trên fanpage
    hiddenFanpageComment: prefixAdmin + "/fanpage-comment/hidden",
    //* Lấy thông tin bài đã đăng
    fanpagePost: prefixAdmin + "/fanpage-post/get",
    //* Gửi file đính kèm trong messenger
    fanpageChatSendAttachment: prefixAdmin + "/fanpage-chat/send/attachment",
  },
  zaloOA: {
    //* kết nối zalo với crm
    connect: prefixAdmin + "/zalo-oa/connect",
    //* Lấy danh sách zalo đã được kết nối
    list: prefixAdmin + "/zalo-oa/list",
    //* Gỡ một zalo ra khỏi danh sách đã kết nối
    delete: prefixAdmin + "/zalo-oa/remove",
    //* Lấy danh sách hội thoại chat
    listZaloFollower: prefixAdmin + "/zalo-follower/list",
    //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
    listZaloChat: prefixAdmin + "/zalo-chat/list",
    //* Nhắn tin cho người dùng
    sendZaloChat: prefixAdmin + "/zalo-chat/send",
    //* Gửi tin nhắn dạng link ảnh
    linkImageSendZaloChat: prefixAdmin + "/zalo-chat/send/link-image",
    //* Gửi tin nhắn đính kèm file
    fileSendZaloChat: prefixAdmin + "/zalo-chat/send/file",
    //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
    answerSendZaloChat: prefixAdmin + "/zalo-chat/send/answer",
    //* Gỡ 1 tin nhắn chat
    deleteZaloChat: prefixAdmin + "/zalo-chat/delete",
  },
  image: {
    upload: "https://login.noron.vn/api/upload/image",
    // upload: "https://reborn.vn/api/upload/file",
    uploadReborn: "https://reborn.vn/api/upload/file",
    uploadNoron: "https://login.noron.vn/api/upload/file",
    // uploadReborn: "http://localhost:8000/api/upload/file"
  },
  file: {
    upload: "https://reborn.vn/api/upload/file",
  },
  video: {
    upload: "https://login.noron.vn/api/upload/file",
  },
  analysis: {
    list: "https://cloud.reborn.vn/market/article/list",
    detail: "https://cloud.reborn.vn/market/article/get",
  },
  reportMa: {
    getCustomer: prefixAdmin + "/ma/dashboard/customer/by-status",
    // detail: "https://cloud.reborn.vn/market/article/get",
  },
  keywordData: {
    list: "https://cloud.reborn.vn/market/keyword-data/list",
    update: "https://cloud.reborn.vn/market/keyword-data/update",
    detail: "https://cloud.reborn.vn/market/keyword-data/get",
    delete: "https://cloud.reborn.vn/market/keyword-data/delete",
  },
  configCode: {
    list: prefixAdmin + "/global-config/list",
    update: prefixAdmin + "/global-config/update",
    detail: prefixAdmin + "/global-config/get",
    delete: prefixAdmin + "/global-config/delete",
  },
  placeholder: {
    guarantee: prefixAdmin + "/guarantee/placeholder", // placeholder Bảo lãnh
    contract: prefixAdmin + "/contract/placeholder", // placeholder Hợp đồng
    customer: prefixAdmin + "/customer/placeholder", // placeholder Khách hàng
    contact: prefixAdmin + "/contact/placeholder ", // placeholder Người liên hệ
  },
  partnerCall: {
    list: prefixAdmin + "/partner-call/list",
    update: prefixAdmin + "/partner-call/update",
    detail: prefixAdmin + "/partner-call/get",
    delete: prefixAdmin + "/partner-call/delete",
  },
  switchboard: {
    list: prefixAdmin + "/call-config/list",
    update: prefixAdmin + "/call-config/update",
    updateStatus: prefixAdmin + "/call-config/update/status",
    detail: prefixAdmin + "/call-config/get",
    delete: prefixAdmin + "/call-config/delete",
  },
  templateSMS: {
    list: prefixAdmin + "/template-sms/list",
    update: prefixAdmin + "/template-sms/update",
    detail: prefixAdmin + "/template-sms/get",
    delete: prefixAdmin + "/template-sms/delete",
  },
  partnerSMS: {
    list: prefixAdmin + "/partner-sms/list",
    update: prefixAdmin + "/partner-sms/update",
    detail: prefixAdmin + "/partner-sms/get",
    delete: prefixAdmin + "/partner-sms/delete",
  },
  brandName: {
    list: prefixAdmin + "/brandname/list",
    update: prefixAdmin + "/brandname/update",
    detail: prefixAdmin + "/brandname/get",
    delete: prefixAdmin + "/brandname/delete",

    listWhiteList: prefixAdmin + "/whitelist/brandname/contact/list",
    updateWhiteList: prefixAdmin + "/whitelist/brandname/contact/update",
    deleteWhiteList: prefixAdmin + "/whitelist/brandname/contact/delete",
    changeStatusWhiteList: prefixAdmin + "/whitelist/brandname/update",
  },
  templateCategory: {
    list: prefixAdmin + "/template-category/list",
    update: prefixAdmin + "/template-category/update",
    detail: prefixAdmin + "/template-category/get",
    delete: prefixAdmin + "/template-category/delete",
  },
  templateZalo: {
    list: prefixAdmin + "/template-zalo/list",
    update: prefixAdmin + "/template-zalo/update",
    detail: prefixAdmin + "/template-zalo/get",
    delete: prefixAdmin + "/template-zalo/delete",
  },
  templateEmail: {
    list: prefixAdmin + "/template-email/list",
    update: prefixAdmin + "/template-email/update",
    detail: prefixAdmin + "/template-email/get",
    delete: prefixAdmin + "/template-email/delete",
  },
  partnerEmail: {
    list: prefixAdmin + "/partner-email/list",
    update: prefixAdmin + "/partner-email/update",
    detail: prefixAdmin + "/partner-email/get",
    delete: prefixAdmin + "/partner-email/delete",
  },
  emailConfig: {
    list: prefixAdmin + "/email-config/list",
    update: prefixAdmin + "/email-config/update",
    detail: prefixAdmin + "/email-config/get",
    delete: prefixAdmin + "/email-config/delete",

    //Kiểm tra Email nguồn
    checkEmail: prefixAdmin + "/email/test-connection",
  },
  industry: {
    list: "https://cloud.reborn.vn/market/industry/list",
    update: "https://cloud.reborn.vn/market/industry/update",
    detail: "https://cloud.reborn.vn/market/industry/get",
    delete: "https://cloud.reborn.vn/market/industry/delete",
  },
  mailBox: {
    list: prefixAdmin + "/mailbox/list",
    update: prefixAdmin + "/mailbox/update",
    detail: prefixAdmin + "/mailbox/get",
    delete: prefixAdmin + "/mailbox/delete",
    viewer: prefixAdmin + "/mailbox/viewer",
    updateViewer: prefixAdmin + "/mailbox/update/viewer",
    mailboxExchangeList: prefixAdmin + "/mailbox-exchange/list",
    mailboxExchangeUpdate: prefixAdmin + "/mailbox-exchange/update",
    mailboxExchangeDelete: prefixAdmin + "/mailbox-exchange/delete",
  },
  warranty: {
    list: prefixAdmin + "/warranty/list",
    update: prefixAdmin + "/warranty/update",
    detail: prefixAdmin + "/warranty/get",
    delete: prefixAdmin + "/warranty/delete",
    overview: prefixAdmin + "/warranty/get/overview",
    viewer: prefixAdmin + "/warranty/viewer",
    updateStatus: prefixAdmin + "/warranty/update/status",
    warrantyExchangeUpdate: prefixAdmin + "/warranty-exchange/update",
    warrantyExchangeDelete: prefixAdmin + "/warranty-exchange/delete",
    warrantyExchangeList: prefixAdmin + "/warranty-exchange/list",
    warrantyProcess: prefixAdmin + "/warranty-process/update",
    resetTransferVotes: prefixAdmin + "/support-object/reset",
  },
  warrantyCategory: {
    list: prefixAdmin + "/warranty-category/list",
    update: prefixAdmin + "/warranty-category/update",
    detail: prefixAdmin + "/warranty-category/get",
    delete: prefixAdmin + "/warranty-category/delete",
  },
  warrantyProc: {
    list: prefixAdmin + "/support/list",
    update: prefixAdmin + "/support/update",
    detail: prefixAdmin + "/support/get",
    delete: prefixAdmin + "/support/delete",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  warrantyStep: {
    list: prefixAdmin + "/warranty-step/list",
    update: prefixAdmin + "/warranty-step/update",
    detail: prefixAdmin + "/warranty-step/get",
    delete: prefixAdmin + "/warranty-step/delete",
  },
  ticket: {
    list: prefixAdmin + "/ticket/list",
    update: prefixAdmin + "/ticket/update",
    detail: prefixAdmin + "/ticket/get",
    delete: prefixAdmin + "/ticket/delete",
    viewer: prefixAdmin + "/ticket/viewer",
    updateStatus: prefixAdmin + "/ticket/update/status",
    ticketExchangeList: prefixAdmin + "/ticket-exchange/list",
    ticketExchangeUpdate: prefixAdmin + "/ticket-exchange/update",
    ticketExchangeDelete: prefixAdmin + "/ticket-exchange/delete",
    ticketProcess: prefixAdmin + "/ticket-process/update",
    resetTransferVotes: prefixAdmin + "/support-object/reset",
  },
  ticketCategory: {
    list: prefixAdmin + "/ticket-category/list",
    update: prefixAdmin + "/ticket-category/update",
    detail: prefixAdmin + "/ticket-category/get",
    delete: prefixAdmin + "/ticket-category/delete",
  },
  ticketProc: {
    list: prefixAdmin + "/support/list",
    update: prefixAdmin + "/support/update",
    detail: prefixAdmin + "/support/get",
    delete: prefixAdmin + "/support/delete",
  },
  supportCommon: {
    supportConfigLst: prefixAdmin + "/support-config/list",
    supportConfigUpdate: prefixAdmin + "/support-config/update",
    supportConfigDelete: prefixAdmin + "/support-config/delete",
    supportConfigDetail: prefixAdmin + "/support-config/get",

    updateStatusSupport: prefixAdmin + "/support/update/status",

    supportLinkLst: prefixAdmin + "/support-link/list",
    supportLinkUpdate: prefixAdmin + "/support-link/update",
    supportLinkDelete: prefixAdmin + "/support-link/delete",

    supportObjectLst: prefixAdmin + "/support-object/list",
    supportObjectUpdate: prefixAdmin + "/support-object/update",
    supportObjectDelete: prefixAdmin + "/support-object/delete",
    takeObject: prefixAdmin + "/support-object/get/object",
    checkApproved: prefixAdmin + "/support-object/check-approved",

    supportLogLst: prefixAdmin + "/support-log/list",
    supportLogUpdate: prefixAdmin + "/support-log/update",
    supportLogDelete: prefixAdmin + "/support-log/delete",

    // đoạn này là action confirm nút
    processDone: prefixAdmin + "/support-log/process-done",
    processReceive: prefixAdmin + "/support-log/receive",
    processRejected: prefixAdmin + "/support-log/process-rejected",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  ticketStep: {
    list: prefixAdmin + "/ticket-step/list",
    update: prefixAdmin + "/ticket-step/update",
    detail: prefixAdmin + "/ticket-step/get",
    delete: prefixAdmin + "/ticket-step/delete",
  },
  //API công việc
  workProject: {
    list: prefixAdmin + "/work-project/list",
    update: prefixAdmin + "/work-project/update",
    detail: prefixAdmin + "/work-project/get",
    delete: prefixAdmin + "/work-project/delete",
  },
  workOrder: {
    list: prefixAdmin + "/work-order/list",
    update: prefixAdmin + "/work-order/update",
    detail: prefixAdmin + "/work-order/get",
    delete: prefixAdmin + "/work-order/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixAdmin + "/work-order/get/related-people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixAdmin + "/work-order/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixAdmin + "/work-order/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixAdmin + "/work-order/update/other-work-order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixAdmin + "/work-order/get/other-work-order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixAdmin + "/work-inprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixAdmin + "/work-inprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixAdmin + "/work-inprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixAdmin + "/work-order/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixAdmin + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixAdmin + "/employee/assignees",
    // danh sách trao đổi trong công việc
    workExchange: prefixAdmin + "/work-exchange/list",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixAdmin + "/work-exchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixAdmin + "/work-exchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixAdmin + "/work-exchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixAdmin + "/work-order/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixAdmin + "/work-order/update/priority-level",
  },
  workType: {
    list: prefixAdmin + "/work-type/list",
    update: prefixAdmin + "/work-type/update",
    detail: prefixAdmin + "/work-type/get",
    delete: prefixAdmin + "/work-type/delete",
  },
  //API người danh sách người mua, bán
  objectSource: {
    list: prefixApi + "/object-source/list",
  },
  //API quản trị phân hệ
  subsystemAdministration: {
    list: prefixAdmin + "/module/list",
    update: prefixAdmin + "/module/update",
    detail: prefixAdmin + "/module/get",
    delete: prefixAdmin + "/module/delete",
    // Thêm mới một tài nguyên vào phân hệ
    addModuleResource: prefixAdmin + "/module-resource/add",
    // Xóa một tài nguyên hỏi phân hệ
    removeModuleResource: prefixAdmin + "/module-resource/remove",
  },
  //API quản trị chúc năng
  functionalManagement: {
    list: prefixAdmin + "/resource/list",
    update: prefixAdmin + "/resource/update",
    detail: prefixAdmin + "/resource/get",
    delete: prefixAdmin + "/resource/delete",
    // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
    freeResource: prefixAdmin + "/resource/list-ex",
  },
  permission: {
    getPermissionResources: prefixAdmin + "/permission/resource",
    //API phân quyền theo phòng ban
    permissionDepartment: prefixAdmin + "/permission/info",
    //API thêm quyền cho phòng ban
    permissionDepartmentAdd: prefixAdmin + "/permission/add",
    //API xóa quyền được cấp
    permissionDepartmentDelete: prefixAdmin + "/permission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixAdmin + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixAdmin + "/request-permission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixAdmin + "/request-permission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixAdmin + "/request-permission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixAdmin + "/request-permission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixAdmin + "/request-permission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixAdmin + "/request-permission/update/rejected ",
  },
  //API tổng đài
  callCenter: {
    //* Tạo 1 cuộc gọi
    makeCall: prefixAdmin + "/call-center/make-call",
    //* Lấy danh sách lịch sử cuộc gọi
    getHistory: prefixAdmin + "/call-center/get-history",
    //* Lấy chi tiết lịch sử cuộc gọi
    getHistoryByCallId: prefixAdmin + "/call-center/get-history-by-call-id",
    //* Chuyển một cuộc gọi sang máy khác
    transferCall: prefixAdmin + "/call-center/transfer-call",
    //* Thực hiện ngắt cuộc gọi
    hangupCall: prefixAdmin + "/call-center/hangup-call",
    //* Tạo 1 cuộc gọi đọc mã OTP cho người đăng ký
    makeCallOTP: prefixAdmin + "/call-center/make-call-otp",
    //* Danh sách lịch sử cuộc gọi
    customerCallList: prefixAdmin + "/customer-call/list",
  },
  // Báo cáo
  report: {
    // báo cáo doanh thu
    revenue: prefixAdmin + "/cashbook/statistic",
    // báo cáo doanh thu nhân viên
    employee: prefixAdmin + "/invoice/employee/top",
    // báo cáo sản phẩm
    product: prefixAdmin + "/invoice/product/top",
    // báo cáo thẻ dịch vụ
    cardService: prefixAdmin + "/invoice/card-service/top",
    // báo cáo dịch vụ
    service: prefixAdmin + "/invoice/service/top",
    // báo cáo theo tỉnh, thành phố
    city: prefixAdmin + "/invoice/city/top",
    // báo cáo khách hàng
    customer: prefixAdmin + "/cashbook/statistic/customer",
  },
  // video hướng dẫn
  videoSupport: {
    list: "https://reborn.vn/api//support/list",
  },
  // phiếu điều chỉnh kho
  adjustmentSlip: {
    temp: prefixAdmin + "/stock-adjust/temp",
    createAdjSlip: prefixAdmin + "/stock-adjust/create",
    addUpdatePro: prefixAdmin + "/stock-adjust-detail/update",
    // duyệt phiếu điều chỉnh kho
    approved: prefixAdmin + "/stock-adjust/approved",
    // từ chối điều chỉnh kho
    cancel: prefixAdmin + "/stock-adjust/cancel",
    view: prefixAdmin + "/stock-adjust/view",
    list: prefixAdmin + "/stock-adjust/list",
    // lấy danh sách sản phẩm có trong kho
    warehouse: prefixAdmin + "/warehouse/list",
    // xóa đi 1 sản phẩm
    deletePro: prefixAdmin + "/stock-adjust-detail/delete",
  },
  kpiDatasource: {
    list: prefixAdmin + "/kpi-datasource/list",
    update: prefixAdmin + "/kpi-datasource/update",
    delete: prefixAdmin + "/kpi-datasource/delete",
  },
  kpiGoal: {
    list: prefixAdmin + "/kpi-goal/list",
    update: prefixAdmin + "/kpi-goal/update",
    delete: prefixAdmin + "/kpi-goal/delete",
    detail: prefixAdmin + "/kpi-goal/get",
  },
  kpiTemplate: {
    list: prefixAdmin + "/kpi-template/list",
    update: prefixAdmin + "/kpi-template/update",
    delete: prefixAdmin + "/kpi-template/delete",
  },
  kpiTemplateGoal: {
    list: prefixAdmin + "/kpi-template-goal/list",
    update: prefixAdmin + "/kpi-template-goal/update",
    delete: prefixAdmin + "/kpi-template-goal/delete",
  },
  kpiSetup: {
    list: prefixAdmin + "/kpi-setup/list",
    update: prefixAdmin + "/kpi-setup/update/web",
    delete: prefixAdmin + "/kpi-setup/delete",
  },
  kpi: {
    list: prefixAdmin + "/kpi/list",
    update: prefixAdmin + "/kpi/update",
    delete: prefixAdmin + "/kpi/delete",

    checkKpiCampaign: prefixAdmin + "/kpi-apply/get/by-campaign-id",
    updateKpi: prefixAdmin + "/campaign/update/kpi",
    listEmployeeKpi: prefixAdmin + "/kpi-object/list",
    addEmployeeToKpi: prefixAdmin + "/kpi-object/get/by-object",
    listGoalKpiEmployee: prefixAdmin + "/kpi-setup-object/list/by-kot-id",
    saveKpiEmployee: prefixAdmin + "/kpi-setup-object/update/web",
    deleteEmployeeKpi: prefixAdmin + "/kpi-object/delete",

    //chỉ tiêu tương tác trong chiến dịch bán hàng
    addEmployeeToKpiContact: prefixAdmin + "/campaign-sale/interaction/kpis",
    saveKpiContactEmployee: prefixAdmin + "/campaign-sale/interaction/kpis",
    listEmployeeKpiContact: prefixAdmin + "/campaign-sale/interaction/employee",
    deleteEmployeeKpiContact: prefixAdmin + "/campaign-sale/interaction/kpis",
  },
  kpiApply: {
    list: prefixAdmin + "/kpi-apply/list",
    update: prefixAdmin + "/kpi-apply/update",
    delete: prefixAdmin + "/kpi-apply/delete",
  },
  kpiObject: {
    list: prefixAdmin + "/kpi-object/list",
    update: prefixAdmin + "/kpi-object/update/web",
    delete: prefixAdmin + "/kpi-object/delete",
    detail: prefixAdmin + "/kpi-object/get",
    detailKpiEmployee: prefixAdmin + "/kpi-object/employee/result",
    exchangeList: prefixAdmin + "/kpi-exchange/list",
    // xóa 1 trao đổi
    deleteKpiExchange: prefixAdmin + "/kpi-exchange/delete",
    // thêm mới 1 trao đổi
    addKpiExchange: prefixAdmin + "/kpi-exchange/update",

    // chỉnh sửa 1 trao đổi
    updateKpiExchange: prefixAdmin + "/kpi-exchange/get",
  },
  installApp: {
    list: prefixAdmin + "/app/list",
    update: prefixAdmin + "/app/update",
    delete: prefixAdmin + "/app/delete",
    detail: prefixAdmin + "/app/get",
    takeKey: prefixAdmin + "/app/get/key",
  },

  webhook: {
    list: prefixAdmin + "/webhook/list",
    update: prefixAdmin + "/webhook/update",
    delete: prefixAdmin + "/webhook/delete",
    detail: prefixAdmin + "/webhook/get",
  },

  //nguồn cấp dữ liệu
  dataSupplySource: {
    list: prefixAdmin + "/filter-setting/list",
  },

  email: {
    list: prefixAdmin + "/outlook-mail/list",
    detail: prefixAdmin + "/outlook-mail/get",
    sendEmail: prefixAdmin + "/outlook-mail/send-email",
    delete: prefixAdmin + "/outlook-mail/delete",

    // call api email
    lstEmail: "https://connect.reborn.vn/api/v1/google/gmail/message/search",
    sendEmailNew: "https://connect.reborn.vn/api/v1/google/gmail/message/send",
    detailEmail: "https://connect.reborn.vn/api/v1/google/gmail/message/get-by-id",
    sendEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/send",
    lstEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/search",
    createEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/create",
  },

  ma: {
    list: prefixAdmin + "/ma/list",
    update: prefixAdmin + "/ma/update",
    detail: prefixAdmin + "/ma/get",
    delete: prefixAdmin + "/ma/delete",
    addNode: prefixAdmin + "/ma/config-node/update",
    deleteNode: prefixAdmin + "/ma/node/delete",
    updateNode: prefixAdmin + "/ma/config/update",
    detailConfigMA: prefixAdmin + "/ma/config/get",
    updateStatus: prefixAdmin + "/ma/update/status",
    detailMA: prefixAdmin + "/ma/detail",
    updateConfigNode: prefixAdmin + "/ma/update-config",
    listCustomer: prefixAdmin + "/ma-customer/customers",
    listCustomerByType: prefixAdmin + "/ma/customer/get",
    detailCustomer: prefixAdmin + "/ma-customer/result",
    deleteCustomer: prefixAdmin + "/ma-customer/delete",
  },

  //TODO: Start quy trình bpm
  businessProcess: {
    list: prefixAdmin + "/business-process/list",
    update: prefixAdmin + "/business-process/update",
    get: prefixAdmin + "/business-process/get",
    detail: prefixAdmin + "/business-process/detail",
    delete: prefixAdmin + "/business-process/delete",

    addNode: prefixAdmin + "/business-process/config-node/update",
    deleteNode: prefixAdmin + "/business-process/node/delete",

    updateLinkNode: prefixAdmin + "/business-process/update-config",
  },

  bpmForm: {
    lst: prefixAdmin + "/bpm-form/list",
    update: prefixAdmin + "/bpm-form/update",
    delete: prefixAdmin + "/bpm-form/delete",
  },

  bpmFormProcess: {
    lst: prefixAdmin + "/bpm-form-process/list",
    update: prefixAdmin + "/bpm-form-process/update",
    detail: prefixAdmin + "/bpm-form-process/get",
    delete: prefixAdmin + "/bpm-form-process/delete",
  },

  bpmParticipant: {
    lst: prefixAdmin + "/bpm-participant/list",
    update: prefixAdmin + "/bpm-participant/update",
    detail: prefixAdmin + "/bpm-participant/get",
    delete: prefixAdmin + "/bpm-participant/delete",
  },

  bpmEformMapping: {
    lstSource: prefixAdmin + "/eform-mapping/list/source",
    update: prefixAdmin + "/eform-mapping/update",
    detail: prefixAdmin + "/eform-mapping/get",
    delete: prefixAdmin + "/eform-mapping/delete",

    lstEform: prefixAdmin + "/bpm/list/eform",
  },

  bpmFormArtifact: {
    lst: prefixAdmin + "/bpm-form-artifact/list",
    detail: prefixAdmin + "/bpm-form-artifact/get",
    update: prefixAdmin + "/bpm-form-artifact/update",
    updatePosition: prefixAdmin + "/bpm-form-artifact/update/position",
    updateConfig: prefixAdmin + "/bpm-form-artifact/update/config",
    updateEform: prefixAdmin + "/bpm-form-artifact/update/eform",
    delete: prefixAdmin + "/bpm-form-artifact/delete",
  },
  //TODO: End quy trình bpm

  //ngân sách marketing
  marketingBudget: {
    list: prefixAdmin + "/marketing-budget/list",
    update: prefixAdmin + "/marketing-budget/update",
    updateStatus: prefixAdmin + "/marketing-budget/update/status",
    detail: prefixAdmin + "/marketing-budget/get",
    delete: prefixAdmin + "/marketing-budget/delete",
  },

  //kênh MA
  marketingChannel: {
    list: prefixAdmin + "/marketing-channel/list",
    update: prefixAdmin + "/marketing-channel/update",
    detail: prefixAdmin + "/marketing-channel/get",
    delete: prefixAdmin + "/marketing-channel/delete",
  },

  //đo lường MA
  marketingMeasurement: {
    list: prefixAdmin + "/marketing-measurement/list",
    update: prefixAdmin + "/marketing-measurement/update",
    detail: prefixAdmin + "/marketing-measurement/get",
    delete: prefixAdmin + "/marketing-measurement/delete",
  },

  //đo lường MA
  marketingReport: {
    list: prefixAdmin + "/marketing-report/list",
    update: prefixAdmin + "/marketing-report/update",
    detail: prefixAdmin + "/marketing-report/get",
    delete: prefixAdmin + "/marketing-report/delete",
  },

  // tiếp nhận phản hồi
  feedback: {
    lst: prefixAdmin + "/feedback/list/all",
    update: prefixAdmin + "/feedback/update",
    delete: prefixAdmin + "/feedback/delete",
    changeStatus: prefixAdmin + "/feedback/update/status",
  },

  // chat bot
  chatbot: {
    lst: prefixAdmin + "/chatlog/list",
    update: prefixAdmin + "/chatgpt/chat",
  },

  objectFeature: {
    lst: prefixAdmin + "/object-feature/list",
    update: prefixAdmin + "/object-feature/update",
    delete: prefixAdmin + "/object-feature/delete",
    detail: prefixAdmin + "/object-feature/detail",
  },

  // Khảo sát khách hàng
  surveyForm: {
    lst: prefixAdmin + "/survey-form/list",
    update: prefixAdmin + "/survey-form/update",
    delete: prefixAdmin + "/survey-form/delete",
    detail: prefixAdmin + "/survey-form/get",
    statistic: prefixAdmin + "/survey",
    submitVoc: "https://reborn.vn/log-capture/crm/survey",
  },

  //báo giá
  offer: {
    list: prefixAdmin + "/offer/list/v2",
    create: prefixAdmin + "/offer/create",
    offerDetail: prefixAdmin + "/offer-detail/import",
    cardService: prefixAdmin + "/offer-detail/card-service",
    // Tạo báo giá
    offerDetailCustomer: prefixAdmin + "/offer-detail/customer",
    // Xem chi tiết báo giá
    offerDetailList: prefixAdmin + "/offer-detail/list",
    // Hủy báo giá
    cancelOffer: prefixAdmin + "/offer/delete",
    // lấy danh sách thu tiền, chi tiền của khách
    debtOffer: prefixAdmin + "/offer/debt",
    // lưu tạm hóa đơn
    temporarilyOffer: prefixAdmin + "/offer/update/temp",
  },

  offerService: {
    addToInvoice: prefixAdmin + "/offer-service/update",
    delete: prefixAdmin + "/offer-service/delete",
    update: prefixAdmin + "/offer-service/update",
    detail: prefixAdmin + "/offer-service/get",
    getByCustomer: prefixAdmin + "/offer-service/get-bought-service-by-customer-id",
  },
  offerProduct: {
    list: prefixAdmin + "/offer-product/list",
    addToInvoice: prefixAdmin + "/offer-product/update",
    delete: prefixAdmin + "/offer-product/delete",
    update: prefixAdmin + "/offer-product/update",
    detail: prefixAdmin + "/offer-product/get",
    getByCustomer: prefixAdmin + "/offer-product/get-bought-product-by-customer-id",
  },
  offerCard: {
    list: prefixAdmin + "/offer-card-service/list",
    add: prefixAdmin + "/offer-card-service/update",
    delete: prefixAdmin + "/offer-card-service/delete",
    update: prefixAdmin + "/offer-card-service/update/card-number",
  },

  // fs
  fs: {
    lst: prefixAdmin + "/fs/list",
    update: prefixAdmin + "/fs/update",
    delete: prefixAdmin + "/fs/delete",
    detail: prefixAdmin + "/fs/get",
    cloneFs: prefixAdmin + "/fs/clone",
    updateStatus: prefixAdmin + "/fs/update/status",
    resetSignal: prefixAdmin + "/approval-object/reset",
    // cấu hình form fs
    fsFormLst: prefixAdmin + "/fs-form/list",
    fsFormUpdate: prefixAdmin + "/fs-form/update",
    fsFormDelete: prefixAdmin + "/fs-form/delete",
    fsFormUpdatePostion: prefixAdmin + "/fs-form/update/position",
  },

  // quote
  quote: {
    lst: prefixAdmin + "/quote/list",
    update: prefixAdmin + "/quote/update",
    delete: prefixAdmin + "/quote/delete",
    cloneQuote: prefixAdmin + "/quote/clone",
    updateStatus: prefixAdmin + "/quote/update/status",
    resetSignal: prefixAdmin + "/approval-object/reset",
    // cấu hình form quote
    quoteFormLst: prefixAdmin + "/quote-form/list",
    quoteFormUpdate: prefixAdmin + "/quote-form/update",
    quoteFormDelete: prefixAdmin + "/quote-form/delete",
    quoteFormUpdatePostion: prefixAdmin + "/quote-form/update/position",

    lstQuoteContract: prefixAdmin + "/contract-quote/list",
    updateQuoteContract: prefixAdmin + "/contract-quote/update",
    deleteQuoteContract: prefixAdmin + "/contract-quote/delete-by-quote-id",
  },

  // cài đặt quy trình
  approval: {
    lst: prefixAdmin + "/approval/list",
    update: prefixAdmin + "/approval/update",
    delete: prefixAdmin + "/approval/delete",
    updateStatus: prefixAdmin + "/approval/update/status",
    //config
    lstConfig: prefixAdmin + "/approval-config/list",
    updateConfig: prefixAdmin + "/approval-config/update",
    deleteConfig: prefixAdmin + "/approval-config/delete",
    //link
    lstLink: prefixAdmin + "/approval-link/list",
    updateLink: prefixAdmin + "/approval-link/update",
    deleteLink: prefixAdmin + "/approval-link/delete",
    //object
    lstObject: prefixAdmin + "/approval-object/list",
    updateObject: prefixAdmin + "/approval-object/update",
    deleteObject: prefixAdmin + "/approval-object/delete",
    takeObject: prefixAdmin + "/approval-object/get/object",
    checkApproved: prefixAdmin + "/approval-object/check-approved",
    //log
    lstLog: prefixAdmin + "/approval-log/list",
    updateLog: prefixAdmin + "/approval-log/update",
    deleteLog: prefixAdmin + "/approval-log/delete",

    //alert
    updateAlert: prefixAdmin + "/approval/update/alert-config",
  },
  // đoạn này lấy ra danh sách các gói
  package: {
    list: "https://reborn.vn/api/package/list",
    addOrgApp: "https://reborn.vn/api/org-app/add",
    updateBill: "https://reborn.vn/api/org-app/update/bill",
    calcPrice: "https://reborn.vn/api/org-app/calc/price-remaining",
  },
  gift: {
    list: prefixAdmin + "/gift/list",
    update: prefixAdmin + "/gift/update",
    updateObjectId: prefixAdmin + "/gift/update-objectid",
    delete: prefixAdmin + "/gift/delete",
  },
  // đoạn này tạo ra mã qr code
  qrCode: {
    list: prefixAdmin + "/qr-code/list",
    update: prefixAdmin + "/qr-code/update",
    delete: prefixAdmin + "/qr-code/delete",
    detail: prefixAdmin + "/qr-code/get",
  },
  // cài đặt mẫu hợp đồng
  sheetQuoteForm: {
    list: prefixAdmin + "/sheet/list",
    update: prefixAdmin + "/sheet/update",
    delete: prefixAdmin + "/sheet/delete",
    detail: prefixAdmin + "/sheet/get",
  },
  sheetFieldQuoteForm: {
    list: prefixAdmin + "/sheet-field/list",
    update: prefixAdmin + "/sheet-field/update",
    updatePosition: prefixAdmin + "/sheet-field/update/position",
    delete: prefixAdmin + "/sheet-field/delete",
    detail: prefixAdmin + "/sheet-field/get",
  },

  ///BPM

  artifact: {
    list: prefixAdmin + "/artifact/list",
    update: prefixAdmin + "/artifact/update",
    detail: prefixAdmin + "/artifact/get",
    delete: prefixAdmin + "/artifact/delete",
  },

  processedObject: {
    lst: prefixAdmin + "/processed-object/list",
    update: prefixAdmin + "/processed-object/update",
    updateProcess: prefixAdmin + "/processed-object/update/process-id",
    delete: prefixAdmin + "/processed-object/delete",
    cloneQuote: prefixAdmin + "/processed-object/clone",
    updateStatus: prefixAdmin + "/processed-object/update/status",
    resetSignal: prefixAdmin + "/approval-object/reset",

    bpmStart: prefixAdmin + "/bpm/start",
    bpmExecListNode: prefixAdmin + "/bpm/exec/list/node",
    bpmProcess: prefixAdmin + "/bpm/process",
    bpmArtifactData: prefixAdmin + "/bpm-artifact-data/get-by-bfat-id",
    bpmParticipantProcesslog: prefixAdmin + "/bpm-participant-processlog/list",
    processedObjectLog: prefixAdmin + "/processed-object-log/list",
  },

  objectGroup: {
    list: prefixAdmin + "/object-group/list",
    update: prefixAdmin + "/object-group/update",
    detail: prefixAdmin + "/object-group/get",
    delete: prefixAdmin + "/object-group/delete",
  },

  objectAttribute: {
    list: prefixAdmin + "/object-attribute/list",
    update: prefixAdmin + "/object-attribute/update",
    detail: prefixAdmin + "/object-attribute/get",
    delete: prefixAdmin + "/object-attribute/delete",
    listAll: prefixAdmin + "/object-attribute/list-all",
    checkDuplicated: prefixAdmin + "/object-attribute/check-duplicated",
    updatePosition: prefixAdmin + "/object-attribute/update/position",
  },
  objectExtraInfo: {
    list: prefixAdmin + "/object-extra-info/list",
  },

  //Tài chính ngân hàng
  netLoan: {
    lst: prefixAdmin + "/net-loan/list",
    update: prefixAdmin + "/net-loan/update",
    get: prefixAdmin + "/net-loan/get",
    delete: prefixAdmin + "/net-loan/delete",
  },
  netDeposit: {
    lst: prefixAdmin + "/net-deposit/list",
    update: prefixAdmin + "/net-deposit/update",
    get: prefixAdmin + "/net-deposit/get",
    delete: prefixAdmin + "/net-deposit/delete",
  },
  netServiceCharge: {
    lst: prefixAdmin + "/net-service-charge/list",
    update: prefixAdmin + "/net-service-charge/update",
    get: prefixAdmin + "/net-service-charge/get",
    delete: prefixAdmin + "/net-service-charge/delete",
  },
  productDemand: {
    lst: prefixAdmin + "/product-demand/list",
    update: prefixAdmin + "/product-demand/update",
    get: prefixAdmin + "/product-demand/get",
    delete: prefixAdmin + "/product-demand/delete",
  },
  briefFinancialReport: {
    lst: prefixAdmin + "/brief-financial-report/list",
    update: prefixAdmin + "/brief-financial-report/update",
    get: prefixAdmin + "/brief-financial-report/get",
    delete: prefixAdmin + "/brief-financial-report/delete",
  },
  fullFinancialReport: {
    lst: prefixAdmin + "/full-financial-report/list",
    update: prefixAdmin + "/full-financial-report/update",
    get: prefixAdmin + "/full-financial-report/get",
    delete: prefixAdmin + "/full-financial-report/delete",
  },
  loanInformation: {
    lst: prefixAdmin + "/loan-information/list",
    update: prefixAdmin + "/loan-information/update",
    get: prefixAdmin + "/loan-information/get",
    delete: prefixAdmin + "/loan-information/delete",
  },
  transactionInformation: {
    lst: prefixAdmin + "/transaction-information/list",
    update: prefixAdmin + "/transaction-information/update",
    get: prefixAdmin + "/transaction-information/get",
    delete: prefixAdmin + "/transaction-information/delete",
  },
};

export const urls = {
  dashboard: "/dashboard",
  //Lĩnh vực BĐS - Đầu mối liên hệ
  contact: "/contact",
  customer: "/customer",
  customer_sms: "/customer_sms",
  customer_segment: "/customer_segment",
  detail_person: "/detail_person/customerId/:id?/:type",

  //Đối tác
  partner: "/partner",
  detail_partner: "/detail_partner/partnerId/:id?",

  schedule_next: "/schedule_next",
  schedule: "/schedule",
  timekeeping: "/timekeeping",
  cashbook: "/cashbook",
  cxmSurvey: "/cxm_survey",
  // Đường dẫn đặt hàng
  order: "/order",
  // Đường dẫn quản lý đặt hàng
  manager_order: "/manager_order",
  // Đường dẫn quản lý đơn hàng
  order_invoice_list: "/order_invoice_list",
  // Đường dẫn quản lý đơn hàng
  temporary_order_list: "/temporary_order_list",
  //
  manage_data_sharing: "/manage_data_sharing",
  // đường dẫn nhập hàng
  product_import: "/product_import",
  // danh sách hóa đơn nhập hàng
  invoice_order: "/invoice_order",
  // tạo mới phiếu nhập
  create_invoice_add: "/create_invoice_add",
  // đường dẫn sản phẩm đã bán
  products_sold: "/products_sold",
  // đường dẫn sản phẩm tồn kho
  product_inventory: "/product_inventory",
  // đường dẫn quản lý kho hàng
  inventory: "/inventory",
  inventory_checking: "inventory_checking",
  // đường dẫn bán hàng
  sell: "/sell",
  contract: "/contract",
  offer: "/offer",
  create_contract: "/create_contract",
  edit_contract: "/edit_contract/:id?",
  detail_contract: "/detail_contract/contractId/:id?",
  detail_project: "/detail_project/projectId/:id?",

  //Hợp đồng bảo lãnh
  guarantee: "/guarantee",
  detail_guarantee: "/detail_guarantee/guaranteeId/:id?",

  //Bảo hành theo hợp đồng
  warrantyContract: "/warrantyContract",
  detail_warranty_contract: "/detail_warranty_contract/warrantyId/:id?",

  // đường dẫn tạo đơn bán
  create_sale_add: "/create_sale_add",
  // đường dẫn danh sách hóa đơn bán hàng
  sale_invoice: "/sale_invoice",
  // đường dẫn danh sách khách trả hàng
  customer_pay: "/customer_pay",
  //tạo báo giá
  create_offer_add: "/create_offer_add",
  report: "/report",
  earnings: "/earnings",
  payment_history: "/payment_history",
  customer_care: "/customer_care",
  crm_campaign: "/crm_campaign",
  setting: "/setting",
  tip: "/tip",
  tip_group: "/tip_group",
  tip_user_config: "/tip_user_config",
  tip_group_config: "/tip_group_config",
  personal: "/personal",
  internal_mail: "/internal_mail",
  kpi: "/kpi",
  kpiApply: "/kpi_apply",
  kpiObject: "/kpi_object",
  appointment_schedule: "/appointment_schedule",
  warranty: "/warranty",
  detail_warranty: "/detail_warranty/warrantyId/:id",
  setting_warranty: "/setting_warranty",
  ticket: "/ticket",
  detail_ticket: "/detail_ticket/ticketId/:id",
  setting_ticket: "/setting_ticket",
  setting_sms: "/setting_sms",
  setting_call: "/setting_call",
  setting_email: "/setting_email",
  setting_zalo: "/setting_zalo",
  sms_marketting: "/sms_marketting",
  email_marketting: "/email_marketting",
  zalo_marketting: "/zalo_marketting",
  // Setting
  setting_common: "/setting_common",
  setting_rose: "/setting_rose",
  setting_basis: "/setting_basis",
  setting_operate: "/setting_operate",
  setting_timekeeping: "/setting_timekeeping",
  setting_customer: "/setting_customer",
  setting_partner: "/setting_partner",
  setting_contact: "/setting_contact",
  setting_sell: "/setting_sell",
  //Cài đặt hợp đồng
  setting_contract: "/setting_contract",
  setting_eform: "/setting_eform",
  setting_process: "/setting_process",
  setting_quote_form: "/setting_quote_form",
  setting_cash_book: "/setting_cash_book",
  setting_market_research: "/setting_market_research",
  setting_marketing: "/setting_marketing",
  setting_work: "/setting_work",
  setting_project: "/setting_project",
  config_bpm: "/config_bpm",
  setting_dashboard: "/setting_dashboard",
  setting_report: "/setting_report",
  //Giám sát tích hợp
  integrated_monitoring: "/integrated_monitoring",
  //Cấu hình mã
  setting_code: "/setting_code",
  setting_social_crm: "/setting_social_crm",
  //dự án
  project: "/project",
  // Đường dẫn công việc
  middle_work: "/middle_work",
  // Đường dẫn chi tiết công việc
  detail_work: "middle_work/detail_work/:id",
  // đường dẫn maketing
  maketing: "/maketing",
  // đường dẫn public kết nối với zalo
  public_connect_zalo: "/public_connect_zalo",
  // đường dẫn quản trị tài nguyên
  resource_management: "/resource_management",
  // đường dẫn lịch sử điều trị
  treatment_history: "/treatment_history",
  // đường dẫn nhật ký điều trị
  diary_surgery: "/diary_surgery",
  // lịch
  calendar_common: "/calendar_common",
  // quy trình bán hàng
  sale_flow: "/sale_flow",
  create_sale_flow: "/create_sale_flow",
  edit_sale_flow: "/edit_sale_flow/:id?",
  // quản lý bán hàng
  management_sale: "/management_sale",
  // chiến dịch bán hàng
  sales_campaign: "/sales_campaign",
  create_sale_campaign: "/create_sale_campaign",
  edit_sale_campaign: "/edit_sale_campaign/:id?",
  // danh sách cơ hội
  opportunity_list: "/opportunity_list",
  // quản lý cơ hội
  management_opportunity: "/management_opportunity",
  // tổng đài
  call_center: "/call_center",
  //email
  email: "/email",
  // Kênh bán
  social_crm: "/social_crm",
  social_facebook_crm: "/social_facebook_crm",
  social_zalo_crm: "/social_zalo_crm",
  // báo cáo
  report_common: "/report_common",
  report_customer: "/report_customer",
  // điều chỉnh kho
  adjustment_slip: "/adjustment_slip",
  // thông tin cá nhân
  setting_account: "/setting_account",
  setting_kpi: "/setting_kpi",
  // cài đặt ứng dụng
  install_app: "/install_app",
  // thử nghiệm với marketing automation (cài đặt)
  marketing_automation: "/marketing_automation",
  create_marketing_automation: "/create_marketing_automation",
  edit_marketing_automation: "/edit_marketing_automation/:id?",
  marketing_automation_setting: "/marketing_automation_setting/:id",
  detail_marketing_automation: "/detail_marketing_automation/maId/:id?",

  //chiến dịch marketing
  campaign_marketing: "/campaign_marketing",

  // tiếp nhận phản hồi từ phía khách hàng
  feedback_customer: "/feedback_customer",

  // đoạn này dùng để test chức năng mới
  bpm: "/bpm",
  object_manage: "/object_manage",
  //cài đặt quy trình
  setting_business_process: "/setting_business_process/:id",

  test: "/test",

  // Khảo sát khách hàng
  customer_survey: "/customer_survey",

  // Link khảo sát
  link_survey: "/link_survey",

  // FS
  fs: "/fs",
  // báo giá
  quote: "/quote",
  report_login: "/report_login",
  // Phiếu xuất kho
  create_outbound_delivery: "/create_outbound_delivery",
  outbound_invoice: "/outbound_invoice",
  inventory_transfer_document: "/inventory_transfer_document",

  // Cài đặt vận hành
  ortherFee: "/orther_fee",
  utilityReading: "/utility_reading",
  spaceCustomer: "/space_customer",
  managementFee: "/management_fee",
  vehicleRegistration: "/vehicle_registration",
  vehicle: "/vehicle",
  building: "/building",
  buildingFloor: "/building_floor",
};

export default urls;
