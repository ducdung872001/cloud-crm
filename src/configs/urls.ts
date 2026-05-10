// Đã migrate: toàn bộ endpoint /adminapi/* → biz.reborn.vn/customer/*.
const prefixCustomer = (process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn") + "/customer";
// WORKAROUND TẠM (test superadmin) — các endpoint /employee/*, /role/*, /permission/resource
// chưa được migrate sang biz.reborn.vn/customer. Trỏ tạm về cloud.reborn.vn/adminapi cho đến
// khi BE migrate xong. Cần revert lại prefixCustomer sau.
const prefixAdminLegacy = (process.env.APP_ADMIN_URL || "https://cloud.reborn.vn") + "/adminapi";
const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";
const prefixApi = "/api";
const prefixAuthenticator = "/authenticator";
const prefixSale = "/sale";
const prefixSystem = "/system";
const prefixCs = "/cs";
const prefixApplication = "/application";
const prefixHr = "/hr";
const prefixRebornVn = "https://reborn.vn/api";
const prefixNotification = "/notification";
const prefixFinance = "https://reborn.vn/finance";
const prefixWarehouse = "https://reborn.vn/warehouse";

console.log("process.env.APP_API_LOCAL", process.env.APP_API_LOCAL);

export const urlsApi = {
  // logout: prefixAuthenticator + "/user/logout",
  beautySalon: {
    list: prefixRebornVn + "/beautySalon/list",
    approve: prefixRebornVn + "/beautySalon/approve",
    delete: prefixRebornVn + "/beautySalon/delete",
  },
  businessRule: {
    list: prefixBpm + "/businessRule/list",
    update: prefixBpm + "/businessRule/update",
    updateActive: prefixBpm + "/businessRule/updateActive",
    detail: prefixBpm + "/businessRule/detail",
    delete: prefixBpm + "/businessRule/delete",
  },
  businessRuleItem: {
    list: prefixBpm + "/businessRuleItem/list",
    update: prefixBpm + "/businessRuleItem/update",
    updateActive: prefixBpm + "/businessRuleItem/updateActive",
    detail: prefixBpm + "/businessRuleItem/detail",
    delete: prefixBpm + "/businessRuleItem/delete",
  },
  decisionTableInput: {
    list: prefixBpm + "/decisionTableInput/list",
    update: prefixBpm + "/decisionTableInput/update",
    updateActive: prefixBpm + "/decisionTableInput/updateActive",
    detail: prefixBpm + "/decisionTableInput/detail",
    delete: prefixBpm + "/decisionTableInput/delete",
  },
  decisionTableOutput: {
    list: prefixBpm + "/decisionTableOutput/list",
    update: prefixBpm + "/decisionTableOutput/update",
    updateActive: prefixBpm + "/decisionTableOutput/updateActive",
    detail: prefixBpm + "/decisionTableOutput/detail",
    delete: prefixBpm + "/decisionTableOutput/delete",
  },
  user: {
    create: prefixAuthenticator + "/user/create",
    update: prefixAuthenticator + "/user/admin_update",
    profile: prefixAuthenticator + "/user/me",
    detail: prefixAuthenticator + "/user/get",
    basicInfo: prefixAuthenticator + "/user/basic_info",
    selectUsers: prefixAuthenticator + "/user/select",
    resetPass: prefixAuthenticator + "/user/reset_pass",
    changePass: prefixAuthenticator + "/user/change_pass",
    checkLogin: prefixCustomer + "/userLogin/list",
    detailTimeLogin: prefixCustomer + "/userLogin/daily/list",
    list: prefixAuthenticator + "/user/list",
    delete: prefixAuthenticator + "/user/delete",
    fcmDevice: prefixNotification + "/fcmDevice/update",
  },
  notificationHistory: {
    list: prefixNotification + "/notificationHistory/list",
    update: prefixNotification + "/notificationHistory/update",
    detail: prefixNotification + "/notificationHistory/get",
    delete: prefixNotification + "/notificationHistory/delete",

    updateUnread: prefixNotification + "/notificationHistory/update/unread",
    updateReadAll: prefixNotification + "/notificationHistory/update/readAll",
    countUnread: prefixNotification + "/notificationHistory/count",
  },

  customer: {
    filter: prefixCustomer + "/customer/list_paid/basic",
    listshared: prefixCustomer + "/customer/list_paid/basic/shared",
    update: prefixCustomer + "/customer/update",
    telesaleCallList: prefixCustomer + "/telesaleCall/list",
    telesaleCallUpdate: prefixCustomer + "/telesaleCall/update",
    updateByField: prefixCustomer + "/customer/update/byField",
    delete: prefixCustomer + "/customer/delete",
    deleteAll: prefixCustomer + "/customer/delete",
    checkInProcess: prefixCustomer + "/customer/checkInProcess",
    link: prefixCustomer + "/customer/link_user",
    detail: prefixCustomer + "/customer/get",
    area: prefixRebornVn + "/area/child",

    // api lấy ra thông tin khách hàng dựa theo id
    listById: prefixCustomer + "/customer/list_by_id",
    // Cập nhập hàng loạt
    updateCustomerGroup: prefixCustomer + "/customer/update_batch/customer_group",
    updateOneRelationship: prefixCustomer + "/customer/update/relationship",
    updateCustomeRelationship: prefixCustomer + "/customer/update_batch/relationship",
    updateCustomerSource: prefixCustomer + "/customer/update_batch/customer_source",
    updateCustomerEmployee: prefixCustomer + "/customer/update_batch/employee",
    // Lịch điều trị
    updateScheduler: prefixCustomer + "/customerScheduler/update",
    filterScheduler: prefixCustomer + "/customerScheduler/list",
    cancelScheduler: prefixCustomer + "/customerScheduler/cancel",
    detailScheduler: prefixCustomer + "/customerScheduler/get",
    // Trao đổi
    customerExchangeList: prefixCustomer + "/customerExchange/list",
    customerExchangeUpdate: prefixCustomer + "/customerExchange/update",
    customerExchangeDelete: prefixCustomer + "/customerExchange/delete",
    // gửi sms, gửi email, gửi zalo
    customerSendSMS: prefixCustomer + "/customer/send/sms",
    customerSendEmail: prefixCustomer + "/customer/send/email",
    customerSendZalo: prefixCustomer + "/customer/send/zalo",

    parserSms: prefixCustomer + "/customer/send/sms/parser",
    parserEmail: prefixCustomer + "/customer/send/email/parser",
    parserZalo: prefixCustomer + "/customer/send/zalo/parser",
    // lấy số điện thoại khi bị che
    viewPhone: prefixCustomer + "/customer/get/phone",
    viewFullPhone: prefixCustomer + "/customer/get/phones",
    // lấy email khi bị che
    viewEmail: prefixCustomer + "/customer/get/email",

    addOther: prefixCustomer + "/customerViewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCustomerViewer: prefixCustomer + "/customerViewer/update",
    // lấy về danh sách người xem
    lstCustomerViewer: prefixCustomer + "/customerViewer/list",
    // xóa đi 1 người xem
    deleteCustomerViewer: prefixCustomer + "/customerViewer/delete",
    // thêm khách hàng vào chương trình MA
    addCustomerMA: prefixCustomer + "/maCustomer/insertList",
    // điền số lượng bản ghi muốn hiển thị
    numberFieldCustomer: prefixCustomer + "/customer/export/randomCustomers",
    // import khách hàng b2
    autoProcess: prefixCustomer + "/customer/import/autoProcess",
    // import khách hàng b3
    manualProcess: prefixCustomer + "/customer/import/manualProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/customer/import",
    // tương tác khách hàng
    customerReport: prefixCustomer + "/customerReport/summaryAction",
    // chi tiết tương tác khách hàng
    detailCustomerReport: prefixCustomer + "/customerReport/summaryAction/detail",
    // danh sách các file đã tải
    lstAttachments: prefixCustomer + "/customerExchange/attachment/list",
    // chi tiết tương tác từng khách hàng trong màn hình chi tiết khách hàng
    descCustomerReport: prefixCustomer + "/customerReport/action/list",
    // khách hàng đã theo dõi tk zalo nào
    customerZaloOA: prefixCustomer + "/customer/zalo/oa",
    // đoạn này là api bộ lọc nâng cao
    filterAdvanced: prefixCustomer + "/filter-setting/list",
    createFilterAdvanced: prefixCustomer + "/filter-setting/update",
    deleteFilterAdvanced: prefixCustomer + "/filter-setting/delete",
    customerAttributes: prefixCustomer + "/filter-setting/customers/attributes",
    filterLstCustomer: prefixCustomer + "/filter-setting",
    // lấy thuộc tính để placeholder Email
    // businessPartner: prefixCustomer + "/businessPartner/attributes",
    // emailAttributes: prefixCustomer + "/businessPartner/attributes",
    // lấy thuộc tính vào bảng filter
    filterTable: prefixCustomer + "/customerAttribute/listFilter",
    // lấy ra các trường, để tải dữ liệu mẫu về
    exAttributes: prefixCustomer + "/customer/export/attributes",
    // đoạn này tạo cơ hội cho khách hàng doanh nghiệp
    createOpportunity: prefixCustomer + "/opportunity/update",
    lstOpportunity: prefixCustomer + "/opportunity/list",
    deleteOpportunity: prefixCustomer + "/opportunity/delete",
    detailOpportunity: prefixCustomer + "/opportunity/get",

    // danh sách upload
    lstUpload: prefixCustomer + "/customerUpload/list",

    // api phân tích chân dung khách hàng
    classifyAge: prefixCustomer + "/api/v1/customer/classify/age",
    classifyGender: prefixCustomer + "/api/v1/customer/classify/gender",
    classifyIdentify: prefixCustomer + "/api/v1/customer/classify/identify",
    classifyTopRevenue: prefixCustomer + "/api/v1/customer/classify/topRevenue",
    classifyTopBought: prefixCustomer + "/api/v1/customer/classify/topBought",
    classifyTopValueInvoice: prefixCustomer + "/api/v1/customer/classify/topValueInvoice",
    classifyNotInteractDay: prefixCustomer + "/api/v1/customer/classify/notInteractDay",
    classifyTopInteract: prefixCustomer + "/api/v1/customer/classify/topInteract",
    classifyCampaignJoined: prefixCustomer + "/api/v1/customer/classify/campaignJoined",
    classifyCustType: prefixCustomer + "/api/v1/customer/classify/custType",
    classifyCustGroup: prefixCustomer + "/api/v1/customer/classify/custGroup",
    classifyCustSource: prefixCustomer + "/api/v1/customer/classify/custSource",
    classifyCustCareer: prefixCustomer + "/api/v1/customer/classify/custCareer",
    classifyCustArea: prefixCustomer + "/api/v1/customer/classify/custArea",
    classifyCustomerCard: prefixCustomer + "/api/v1/customer/classify/customerCard",
    classifyInteractTimes: prefixCustomer + "/api/v1/customer/classify/interactTimes",

    // gợi ý các sản phẩm/dịch vụ cho khách hàng
    serviceSuggestions: prefixCustomer + "/customerObject/list",
    // api khác để làm
    serviceSuggestionsv2: prefixCustomer + "/customerObject/getTop",

    // lấy ra các field động view nên chart
    fieldChart: prefixCustomer + "/customer/dashboard/fields",
    lstChartDynamicChart: prefixCustomer + "/customer/dashboard/list",
    updateChartDynamicChart: prefixCustomer + "/customer/dashboard/update",
    deleteChartDynamicChart: prefixCustomer + "/customer/dashboard/delete",
    detailChartDynamicChart: prefixCustomer + "/customer/dashboard/get",
    viewChartDynamicChart: prefixCustomer + "/customer/dashboard/fetchData",

    //export multi
    exportMulti: prefixCustomer + "/customer/export/multi",

    //create call tnex-athena
    loginAccountAthena: "https://api-athenaspear-prod.athenafs.io/api/v1/account/login",
    createCall: "https://api-athenaspear-prod.athenafs.io/api/v1/call-history/create-call",

    //lấy tài khoản tổng đài
    getAccountCall: prefixCustomer + "/employeeAgent/employeeId",
    reloadData: prefixCustomer + "/customer/moveToEs",

    // chia data khách hàng Tnex
    customerAssign: prefixCustomer + "/customer/assign",
  },

  partner: {
    list: prefixCustomer + "/businessPartner/list_paid",
    update: prefixCustomer + "/businessPartner/update",
    detail: prefixCustomer + "/businessPartner/get",
    delete: prefixCustomer + "/businessPartner/delete",
    downloadFile: prefixCustomer + "/businessPartner/import",
    // lấy số điện thoại khi bị che
    viewPhone: prefixCustomer + "/businessPartner/get/phone",
    // lấy email khi bị che
    viewEmail: prefixCustomer + "/businessPartner/get/email",

    numberFieldPartner: prefixCustomer + "/businessPartner/export/randomBusinessPartners",
    autoProcess: prefixCustomer + "/businessPartner/import/autoProcess",
    exAttributes: prefixCustomer + "/businessPartner/export/attributes",

    // lấy thuộc tính vào bảng filter
    filterTable: prefixCustomer + "/businessPartner/listFilter",

    // Trao đổi
    partnerExchangeList: prefixCustomer + "/businessPartnerExchange/list",
    partnerExchangeUpdate: prefixCustomer + "/businessPartnerExchange/update",
    partnerExchangeDelete: prefixCustomer + "/businessPartnerExchange/delete",
  },

  partnerExtraInfo: {
    list: prefixCustomer + "/businessPartnerExtraInfo/list",
  },

  partnerAttribute: {
    list: prefixCustomer + "/businessPartnerAttribute/list",
    update: prefixCustomer + "/businessPartnerAttribute/update",
    delete: prefixCustomer + "/businessPartnerAttribute/delete",
    listAll: prefixCustomer + "/businessPartnerAttribute/listAll",
    checkDuplicated: prefixCustomer + "/businessPartnerAttribute/checkDuplicated",
  },

  project: {
    list: prefixCustomer + "/workProject/list",
    update: prefixCustomer + "/workProject/update",
    detail: prefixCustomer + "/workProject/get",
    delete: prefixCustomer + "/workProject/delete",
  },

  projectReport: {
    report: prefixCustomer + "/cashbook/report",
  },

  historySend: {
    historySendSMS: prefixCustomer + "/customerSms/list",
    historySendEmail: prefixCustomer + "/customerEmail/list",
    historySendZalo: prefixCustomer + "/customerZalo/list",
  },
  sendSMS: {
    // thêm, sửa, xóa danh sách gửi sms
    listSMS: prefixCustomer + "/smsRequest/list",
    updateSMS: prefixCustomer + "/smsRequest/update",
    detailSMS: prefixCustomer + "/smsRequest/get",
    deleteSMS: prefixCustomer + "/smsRequest/delete",
    approveSMS: prefixCustomer + "/smsRequest/approve",
    cancelSMS: prefixCustomer + "/smsRequest/cancel",
  },
  sendEmail: {
    // thêm, sửa, xóa danh sách gửi email
    listEmail: prefixCustomer + "/emailRequest/list",
    updateEmail: prefixCustomer + "/emailRequest/update",
    detailEmail: prefixCustomer + "/emailRequest/get",
    deleteEmail: prefixCustomer + "/emailRequest/delete",
    approveEmail: prefixCustomer + "/emailRequest/approve",
    cancelEmail: prefixCustomer + "/emailRequest/cancel",
  },
  estimate: {
    takeEstimate: prefixCustomer + "/customer/estimate",
  },
  invoice: {
    list: prefixCustomer + "/invoice/list/v2",
    create: prefixCustomer + "/invoice/create",
    invoiceDetail: prefixCustomer + "/invoiceDetail/import",
    cardService: prefixCustomer + "/invoiceDetail/cardService",
    // Tạo hóa đơn bán hàng
    invoiceDetailCustomer: prefixCustomer + "/invoiceDetail/customer",
    // Xem chi tiết hóa đơn
    invoiceDetailList: prefixCustomer + "/invoiceDetail/list",
    // Hủy hóa đơn
    cancelInvoice: prefixCustomer + "/invoice/delete",
    // vinh danh bán hàng
    sales: prefixCustomer + "/invoice/get/sales",
    // lấy danh sách thu tiền, chi tiền của khách
    debtInvoice: prefixCustomer + "/invoice/debt",
    // lưu tạm hóa đơn
    temporarilyInvoice: prefixCustomer + "/invoice/update/temp",
    // lịch sử tiêu dùng thẻ
    historyUseCard: prefixCustomer + "/invoice/using/card",
    // lấy mã hoá đơn
    invoiceCode: prefixCustomer + "/invoice/code",
  },
  boughtService: {
    addToInvoice: prefixCustomer + "/boughtService/update",
    delete: prefixCustomer + "/boughtService/delete",
    update: prefixCustomer + "/boughtService/update",
    detail: prefixCustomer + "/boughtService/get",
    getByCustomer: prefixCustomer + "/boughtService/getBoughtServiceByCustomerId",
  },
  boughtProduct: {
    list: prefixCustomer + "/boughtProduct/list",
    addToInvoice: prefixCustomer + "/boughtProduct/update",
    delete: prefixCustomer + "/boughtProduct/delete",
    update: prefixCustomer + "/boughtProduct/update",
    detail: prefixCustomer + "/boughtProduct/get",
    getByCustomer: prefixCustomer + "/boughtProduct/getBoughtProductByCustomerId",
  },
  boughtCard: {
    list: prefixCustomer + "/boughtCardService/list",
    listLoyaltyPoint: prefixCustomer + "/loyaltyPointLedger/list",
    add: prefixCustomer + "/boughtCardService/update",
    delete: prefixCustomer + "/boughtCardService/delete",
    update: prefixCustomer + "/boughtCardService/update/cardNumber",
    updateCustomerCard: prefixCustomer + "/boughtCard/update",
    listBoughtCardByCustomerId: prefixCustomer + "/boughtCardService/getBoughtCardServiceByCustomerId",
  },
  product: {
    filterWarehouse: prefixCustomer + "/product/in_warehouse",
    list: prefixCustomer + "/product/list",
    detail: prefixCustomer + "/product/get",
    update: prefixCustomer + "/product/update",
    updateContent: prefixCustomer + "/product/update/content",
    delete: prefixCustomer + "/product/delete",

    //danh sách sản phẩm của đối tác
    listShared: prefixCustomer + "/product/list/shared",
  },

  integration: {
    list: prefixCustomer + "/integrationPartner/list",
    update: prefixCustomer + "/integrationConfig/update",
    updateStatus: prefixCustomer + "/integrationLog/update/status",
    delete: prefixCustomer + "/integrationConfig/delete",
    logList: prefixCustomer + "/integrationLog/list",
  },

  productAttribute: {
    list: prefixCustomer + "/productAttribute/list",
    update: prefixCustomer + "/productAttribute/update",
    delete: prefixCustomer + "/productAttribute/delete",
    listAll: prefixCustomer + "/productAttribute/listAll",
    checkDuplicated: prefixCustomer + "/productAttribute/checkDuplicated",
  },

  productExtraInfo: {
    list: prefixCustomer + "/productExtraInfo/list",
  },

  productImport: {
    update: prefixWarehouse + "/product_import/update",
    detail: prefixWarehouse + "/product_import/detail",
    delete: prefixWarehouse + "/product_import/delete",
  },

  inventory: {
    list: prefixWarehouse + "/inventory/list",
    update: prefixWarehouse + "/inventory/update",
    delete: prefixWarehouse + "/inventory/delete",
    import: prefixWarehouse + "/inventory/import",
  },
  pom: {
    //định nghĩa pom cho sản phẩm, dịch vụ
    list: prefixCustomer + "/pom/list",
    update: prefixCustomer + "/pom/update",
    detail: prefixCustomer + "/pom/get",
    delete: prefixCustomer + "/pom/delete",
    // lấy danh sách pom trong phần bán hàng
    lstPomSales: prefixCustomer + "/pom/list/invoice",
  },
  service: {
    filter: prefixCustomer + "/service/list",
    update: prefixCustomer + "/service/update",
    updateContent: prefixCustomer + "/service/update/content",
    detail: prefixCustomer + "/service/get",
    delete: prefixCustomer + "/service/delete",

    //danh sách dịch vụ của đối tác
    listShared: prefixCustomer + "/service/list/shared",
  },
  serviceAttribute: {
    list: prefixCustomer + "/serviceAttribute/list",
    update: prefixCustomer + "/serviceAttribute/update",
    delete: prefixCustomer + "/serviceAttribute/delete",
    listAll: prefixCustomer + "/serviceAttribute/listAll",
    checkDuplicated: prefixCustomer + "/serviceAttribute/checkDuplicated",
  },

  serviceExtraInfo: {
    list: prefixCustomer + "/serviceExtraInfo/list",
  },

  employee: {
    list: prefixAdminLegacy + "/employee/list",
    update: prefixAdminLegacy + "/employee/update",
    detail: prefixAdminLegacy + "/employee/get",
    delete: prefixAdminLegacy + "/employee/delete",
    linkEmployeeUser: prefixAdminLegacy + "/employee/link_user",
    init: prefixAdminLegacy + "/employee/init",
    info: prefixAdminLegacy + "/employee/info",
    takeRoles: prefixAdminLegacy + "/employee/roles",
    listExTip: prefixAdminLegacy + "/employee/listExTip",
    generateRandomPass: prefixAdminLegacy + "/employee/random_pass",
    list_department: prefixAdminLegacy + "/employee/list/department",
    updateToken: prefixAdminLegacy + "/employee/update_token", //Cập nhật token của Outlook Mail
    checkEmailConnection: prefixAdminLegacy + "/employee/check_email_connection",
    disconnectEmail: prefixAdminLegacy + "/employee/disconnect_email",
    updateRole: prefixAdminLegacy + "/roleEmployee/insert-batch",
    getListRoleEmployee: prefixAdminLegacy + "/roleEmployee/list",
    deleteRole: prefixAdminLegacy + "/roleEmployee/delete",
  },
  employeeAgent: {
    list: prefixCustomer + "/employeeAgent/list",
    update: prefixCustomer + "/employeeAgent/update",
    delete: prefixCustomer + "/employeeAgent/delete",
    listAthena: prefixCustomer + "/athena/account-info",
  },

  teamEmployee: {
    list: prefixCustomer + "/group/list",
    detail: prefixCustomer + "/group/get",
    update: prefixCustomer + "/group/update",
    delete: prefixCustomer + "/group/delete",

    listEmployee: prefixCustomer + "/groupEmployee/list",
    updateEmployee: prefixCustomer + "/groupEmployee/update",
    deleteEmployee: prefixCustomer + "/groupEmployee/delete",
  },

  // lịch chung (điều trị, tư vấn, công việc)
  scheduleCommon: {
    list: prefixCustomer + "/schedule/list",
    listRelatedToCustomer: prefixCustomer + "/schedule/list/by_customer",
  },
  crmCareHistory: {
    list: prefixCustomer + "/crmCareHistory/list",
    update: prefixCustomer + "/crmCareHistory/update",
    delete: prefixCustomer + "/crmCareHistory/delete",
  },
  timekeeping: {
    list: prefixCustomer + "/timekeeping/list",
    update: prefixCustomer + "/timekeeping/update",
    delete: prefixCustomer + "/timekeeping/delete",
  },
  cashbook: {
    list: prefixCustomer + "/cashbook/list",
    update: prefixCustomer + "/cashbook/update",
    delete: prefixCustomer + "/cashbook/delete",
    export: prefixCustomer + "/cashbook/export",
    detail: prefixCustomer + "/cashbook/get",
  },
  orderRequest: {
    list: prefixCustomer + "/order-request/list",
    listOne: prefixCustomer + "/order-request/list-one",
    update: prefixCustomer + "/order-request/update",
    updateAndInit: prefixCustomer + "/order-request/update-and-init",
    delete: prefixCustomer + "/order-request/delete-soft",
    export: prefixCustomer + "/order-request/export",
    detail: prefixCustomer + "/order-request/get",
  },
  warehouse: {
    list: prefixWarehouse + "/warehouse/list",
    //API lấy ra danh sách sản phẩm trong kho
    productList: prefixWarehouse + "/warehouse/product/list",
    //API lấy ra thông tin ngày hết hạn / sản xuất dựa trên số lô của sản phẩm
    infoExpiryDateProductionDate: prefixWarehouse + "/warehouse/get_mfg_expired_date",
  },
  paymentHistory: {
    filter: prefixCustomer + "/paymentHistory/list",
    update: prefixCustomer + "/paymentHistory/update",
    delete: prefixCustomer + "/paymentHistory/delete",
  },
  //! đoạn này bh check lại một chút dữ liệu tạo cũ
  crmCampaign: {
    list: prefixCustomer + "/crmCampaign/list",
    update: prefixCustomer + "/crmCampaign/update",
    delete: prefixCustomer + "/crmCampaign/delete",
  },
  // Quản lý chiến dịch
  campaign: {
    list: prefixCustomer + "/campaign/list",
    listViewSale: prefixCustomer + "/campaign/list/view_sale",
    update: prefixCustomer + "/campaign/update",
    updateStatus: prefixCustomer + "/campaign/update/status",
    detail: prefixCustomer + "/campaign/get",
    delete: prefixCustomer + "/campaign/delete",
    convertRate: prefixCustomer + "/opportunityProcess",
    listActionScore: prefixCustomer + "/api/v1/score/action",
    //Cài đặt điểm khách hàng
    updateStep3: prefixCustomer + "/api/v1/score/insertMulti",
    listDataStep3: prefixCustomer + "/api/v1/score/campaign",

    //Cài đặt điểm nhân viên
    updateStep4: prefixCustomer + "/campaign/sale-point-config/update",
    listDataScoreEmployee: prefixCustomer + "/campaign/sale-point-config/get",

    listSale: prefixCustomer + "/campaignSale/list",
    statisticApproach: prefixCustomer + "/campaignOpportunity/statisticApproach",
    statisticSale: prefixCustomer + "/campaignOpportunity/statisticSale",
    statisticConvertRate: prefixCustomer + "/campaignOpportunity/statisticConvertRate",

    exportResult: prefixCustomer + "/campaignOpportunity/exportResult",
    exportAction: prefixCustomer + "/campaignOpportunity/exportAction",
    exportCustomer: prefixCustomer + "/campaignOpportunity/exportCustomer",

    updateConfigSLA: prefixCustomer + "/campaign/sla-config",
  },
  campaignApproach: {
    list: prefixCustomer + "/campaignApproach/list",
    update: prefixCustomer + "/campaignApproach/update",
    detail: prefixCustomer + "/campaignApproach/get",
    delete: prefixCustomer + "/campaignApproach/delete",
    updateSLA: prefixCustomer + "/campaignApproach/update/sla",
    activityList: prefixCustomer + "/campaignActivity/list",
    updateActivity: prefixCustomer + "/campaignActivity/update",
    deleteActivity: prefixCustomer + "/campaignActivity/delete",
  },
  campaignPipeline: {
    list: prefixCustomer + "/campaignPipeline/list",
    update: prefixCustomer + "/campaignPipeline/update",
    detail: prefixCustomer + "/campaignPipeline/get",
    delete: prefixCustomer + "/campaignPipeline/delete",
  },
  // quản lý cơ hội
  campaignOpportunity: {
    list: prefixCustomer + "/campaignOpportunity/list",
    listViewSale: prefixCustomer + "/campaignOpportunity/list/view_sale",
    update: prefixCustomer + "/campaignOpportunity/update",
    updateBatch: prefixCustomer + "/campaignOpportunity/update/batch",
    detail: prefixCustomer + "/campaignOpportunity/get",
    delete: prefixCustomer + "/campaignOpportunity/delete",
    // Đổi người phụ trách cơ hội
    changeEmployee: prefixCustomer + "/campaignOpportunity/change/employee",
    // Chuyển đổi trạng thái cơ hội
    changeSale: prefixCustomer + "/campaignOpportunity/change/sale",
    // Thêm mới hoặc cập nhập xác suất cơ hội
    opportunityProcessUpdate: prefixCustomer + "/opportunityProcess/update",
    // Xóa 1 xác suất cơ hội
    opportunityProcessDelete: prefixCustomer + "/opportunityProcess/delete",

    opportunityExchange: prefixCustomer + "/opportunityExchange/list",
    // xóa 1 trao đổi trong công việc
    deleteOpportunityExchange: prefixCustomer + "/opportunityExchange/delete",
    // thêm mới 1 trao đổi công việc
    addOpportunityExchange: prefixCustomer + "/opportunityExchange/update",

    // chỉnh sửa 1 trao đổi công việc
    updateOpportunityExchange: prefixCustomer + "/opportunityExchange/get",
    listOpportunity: prefixCustomer + "/opportunity/list",

    //check cơ hội đủ điều kiện để kéo
    opportunityCheck: prefixCustomer + "/campaignOpportunity/check",

    //send email
    sendEmail: prefixCustomer + "/customer/campaign/send/email",

    //Đầu mối làm việc
    opportunityContact: prefixCustomer + "/opportunityContact/update",
    detailOpportunityContact: prefixCustomer + "/opportunityContact/detail",

    ///Eform thu thập thông tin
    opportunityEformUpdate: prefixCustomer + "/opportunityEform/update",
    opportunityEformDetail: prefixCustomer + "/opportunityEform/get/criteria",

    addOther: prefixCustomer + "/campaignOpportunityViewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCoyViewer: prefixCustomer + "/campaignOpportunityViewer/update",
    // lấy về danh sách người xem
    lstCoyViewer: prefixCustomer + "/campaignOpportunityViewer/list",
    // xóa đi 1 người xem
    deleteCoyViewer: prefixCustomer + "/campaignOpportunityViewer/delete",
  },

  saleflow: {
    list: prefixCustomer + "/saleflow/list",
    update: prefixCustomer + "/saleflow/update",
    detail: prefixCustomer + "/saleflow/get",
    delete: prefixCustomer + "/saleflow/delete",
    activityList: prefixCustomer + "/saleflowActivity/list",
    updateActivity: prefixCustomer + "/saleflowActivity/update",
    deleteActivity: prefixCustomer + "/saleflowActivity/delete",

    saleflowEformUpdate: prefixCustomer + "/saleflowEform/update",
    saleflowEformDetail: prefixCustomer + "/saleflowEform/get/criteria",
  },

  saleflowApproach: {
    list: prefixCustomer + "/saleflowApproach/list",
    update: prefixCustomer + "/saleflowApproach/update",
    detail: prefixCustomer + "/saleflowApproach/get",
    delete: prefixCustomer + "/saleflowApproach/delete",
    updateSLA: prefixCustomer + "/saleflowApproach/update/sla",
    activityList: prefixCustomer + "/saleflowActivity/list",
    updateActivity: prefixCustomer + "/saleflowActivity/update",
    deleteActivity: prefixCustomer + "/saleflowActivity/delete",

    updateSaleflowSale: prefixCustomer + "/saleflowSale/update",
    detailSaleflowSale: prefixCustomer + "/saleflowSale/get/byApproachId",
  },

  // quản lý bán hàng
  saleflowInvoice: {
    list: prefixCustomer + "/saleflowInvoice/list",
    update: prefixCustomer + "/saleflowInvoice/update",
    updateApproach: prefixCustomer + "/saleflowInvoice/update/approach",
    updateApproachSuccess: prefixCustomer + "/saleflowInvoice/update/success",
    updateApproachCancel: prefixCustomer + "/saleflowInvoice/update/cancel",
    detail: prefixCustomer + "/saleflowInvoice/get",
    delete: prefixCustomer + "/saleflowInvoice/delete",

    invoiceExchange: prefixCustomer + "/saleflowExchange/list",
    // xóa 1 trao đổi trong
    deleteInvoiceExchange: prefixCustomer + "/saleflowExchange/delete",
    // thêm mới 1 trao đổi
    addInvoiceExchange: prefixCustomer + "/saleflowExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateInvoiceExchange: prefixCustomer + "/saleflowExchange/get",
  },

  categoryService: {
    // Đoạn này là category của ông dịch vụ
    list: prefixCustomer + "/categoryItem/list",
    update: prefixCustomer + "/categoryItem/update",
    detail: prefixCustomer + "/categoryItem/get",
    delete: prefixCustomer + "/categoryItem/delete",
  },

  categoryProject: {
    list: prefixCustomer + "/projectType/list",
    update: prefixCustomer + "/projectType/update",
    detail: prefixCustomer + "/projectType/get",
    delete: prefixCustomer + "/projectType/delete",
  },

  category: {
    // Đoạn này là category của ông tài chính
    list: prefixCustomer + "/category/list",
    update: prefixCustomer + "/category/update",
    detail: prefixCustomer + "/category/get",
    delete: prefixCustomer + "/category/delete",
  },

  codeSequence: {
    list: prefixCustomer + "/codeSequence/list",
    update: prefixCustomer + "/codeSequence/update",
    detail: prefixCustomer + "/codeSequence/get",
    delete: prefixCustomer + "/codeSequence/delete",
    detailEntity: prefixCustomer + "/codeSequence/get/entity",
  },

  beautyBranch: {
    list: prefixCustomer + "/beautyBranch/list",
    childList: prefixCustomer + "/beautyBranch/child",
    detail: prefixCustomer + "/beautyBranch/get",
    update: prefixCustomer + "/beautyBranch/update",
    delete: prefixCustomer + "/beautyBranch/delete",
    getByBeauty: `${process.env.APP_AUTHENTICATOR_URL}/api/beautySalon/get_bydomain`,

    //tìm đối tác theo mã
    getBeautyBranchByCode: prefixCustomer + "/beautyBranch/get/byCode",

    // thay đổi trạng thái chi nhánh
    activate: prefixCustomer + "/beautyBranch/update/activate",
    unActivate: prefixCustomer + "/beautyBranch/update/deactivate",
  },

  organization: {
    list: prefixRebornVn + "/beautySalon/list",
    customerUploadList: prefixCustomer + "/customerUpload/list",
    customerUploadDelete: prefixCustomer + "/cleanData/uploadCustomer/delete",
  },
  order: {
    list: prefixCustomer + "/order/list",
    detail: prefixCustomer + "/order/get",
    update: prefixCustomer + "/order/update",
    delete: prefixCustomer + "/order/delete",
  },

  unit: {
    list: prefixCustomer + "/unit/list",
    update: prefixCustomer + "/unit/update",
    delete: prefixCustomer + "/unit/delete",
  },
  reportTemplate: {
    list: prefixCustomer + "/reportTemplate/list",
    update: prefixCustomer + "/reportTemplate/update",
    delete: prefixCustomer + "/reportTemplate/delete",
  },
  department: {
    list: prefixCustomer + "/department/list",
    update: prefixCustomer + "/department/update",
    detail: prefixCustomer + "/department/get",
    delete: prefixCustomer + "/department/delete",
    list_branch: prefixCustomer + "/department/list/branch",

    updateParent: prefixCustomer + "/department/update/parent",
  },
  role: {
    list: prefixCustomer + "/role/list",
    update: prefixCustomer + "/role/update",
    detail: prefixCustomer + "/role/get",
    delete: prefixCustomer + "/role/delete",
    list_branch: prefixCustomer + "/role/list/branch",

    updateParent: prefixCustomer + "/role/update/parent",
  },
  productIdApi: {
    list: prefixRebornVn + "/product/list",
  },
  serviceIdApi: {
    list: prefixRebornVn + "/service/list",
  },
  cardServiceIdApi: {
    list: prefixRebornVn + "/cardService/list",
  },
  card: {
    list: prefixCustomer + "/card/list",
    update: prefixCustomer + "/card/update",
    delete: prefixCustomer + "/card/delete",
  },
  cardService: {
    list: prefixCustomer + "/cardService/list",
    update: prefixCustomer + "/cardService/update",
    detail: prefixCustomer + "/cardService/get",
    delete: prefixCustomer + "/cardService/delete",
  },
  contractCategory: {
    list: prefixCustomer + "/contractCategory/list",
    update: prefixCustomer + "/contractCategory/update",
    detail: prefixCustomer + "/contractCategory/get",
    delete: prefixCustomer + "/contractCategory/delete",
  },
  contractPipeline: {
    list: prefixCustomer + "/contractPipeline/list",
    update: prefixCustomer + "/contractPipeline/update",
    detail: prefixCustomer + "/contractPipeline/get",
    delete: prefixCustomer + "/contractPipeline/delete",
    contractSubPipelineUpdate: prefixCustomer + "/contractSubPipeline/update",
  },
  contractApproach: {
    list: prefixCustomer + "/contractApproach/list",
    update: prefixCustomer + "/contractApproach/update",
    detail: prefixCustomer + "/contractApproach/get",
    delete: prefixCustomer + "/contractApproach/delete",

    activityList: prefixCustomer + "/contractActivity/list",
    updateActivity: prefixCustomer + "/contractActivity/update",
    deleteActivity: prefixCustomer + "/contractActivity/delete",
  },

  contractPayment: {
    list: prefixCustomer + "/contractPayment/list",
    update: prefixCustomer + "/contractPayment/update",
    detail: prefixCustomer + "/contractPayment/get",
    delete: prefixCustomer + "/contractPayment/delete",
  },

  contractorPayment: {
    list: prefixCustomer + "/contractInvestorPayment/list",
    update: prefixCustomer + "/contractInvestorPayment/update",
    detail: prefixCustomer + "/contractInvestorPayment/get",
    delete: prefixCustomer + "/contractInvestorPayment/delete",
  },

  contractProgress: {
    list: prefixCustomer + "/contractProgress/list",
    update: prefixCustomer + "/contractProgress/update",
    detail: prefixCustomer + "/contractProgress/get",
    delete: prefixCustomer + "/contractProgress/delete",
  },

  contractEform: {
    list: prefixBpm + "/eform/list",
    update: prefixBpm + "/eform/update",
    detail: prefixBpm + "/eform/get",
    delete: prefixBpm + "/eform/delete",

    listEformExtraInfo: prefixCustomer + "/eformExtraInfo/list",
    updateEformExtraInfo: prefixCustomer + "/eformExtraInfo/update",
    updateEformExtraInfoPosition: prefixCustomer + "/eformExtraInfo/update/position",
    detailEformExtraInfo: prefixCustomer + "/eformExtraInfo/get",
    deleteEformExtraInfo: prefixCustomer + "/eformExtraInfo/delete",

    listEformAttribute: prefixCustomer + "/eformAttribute/list",
    updateEformAttribute: prefixCustomer + "/eformAttribute/update",
    detailEformAttribute: prefixCustomer + "/eformAttribute/get",
    deleteEformAttribute: prefixCustomer + "/eformAttribute/delete",
    listEformAttributeAll: prefixCustomer + "/eformAttribute/listAll",

    checkDuplicated: prefixCustomer + "/eformAttribute/checkDuplicated",
    contractEformUpdate: prefixCustomer + "/contractEform/update",
    contractEformDetail: prefixCustomer + "/contractEform/get/criteria",
  },

  manageDefaultProcesses: {
    list: prefixCustomer + "/process-permission/list",
    update: prefixCustomer + "/process-permission/update",
    detail: prefixCustomer + "/process-permission/get",
    delete: prefixCustomer + "/process-permission/delete",
  },

  contractAttachment: {
    list: prefixCustomer + "/attachment/list",
    update: prefixCustomer + "/attachment/update",
    detail: prefixCustomer + "/attachment/get",
    delete: prefixCustomer + "/attachment/delete",

    contractAttachmentList: prefixCustomer + "/contractAttachment/list",
    contractAttachmentUpdate: prefixCustomer + "/contractAttachment/update",
    contractAttachmentDetail: prefixCustomer + "/contractAttachment/get",
    contractAttachmentDelete: prefixCustomer + "/contractAttachment/delete",
  },

  contractGuarantee: {
    list: prefixCustomer + "/guarantee/list",
    update: prefixCustomer + "/guarantee/update",
    detail: prefixCustomer + "/guarantee/get",
    delete: prefixCustomer + "/guarantee/delete",

    guaranteeTypeList: prefixCustomer + "/guaranteeType/list",
    guaranteeTypeUpdate: prefixCustomer + "/guaranteeType/update",
    guaranteeTypeDelete: prefixCustomer + "/guaranteeType/delete",

    competencyList: prefixCustomer + "/competency/list",
    competencyUpdate: prefixCustomer + "/competency/update",
    competencyDelete: prefixCustomer + "/competency/delete",

    bankList: prefixCustomer + "/bank/list",
    bankUpdate: prefixCustomer + "/bank/update",
    bankDelete: prefixCustomer + "/bank/delete",

    exAttributes: prefixCustomer + "/guarantee/export/attributes",
    numberFieldGuarantee: prefixCustomer + "/guarantee/export/randomGuarantees",
    autoProcess: prefixCustomer + "/guarantee/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/guarantee/import",
  },

  contractWarranty: {
    list: prefixCustomer + "/contractWarranty/list",
    update: prefixCustomer + "/contractWarranty/update",
    detail: prefixCustomer + "/contractWarranty/get",
    delete: prefixCustomer + "/contractWarranty/delete",

    warrantyTypeList: prefixCustomer + "/contractWarrantyType/list",
    warrantyTypeUpdate: prefixCustomer + "/contractWarrantyType/update",
    warrantyTypeDelete: prefixCustomer + "/contractWarrantyType/delete",

    competencyList: prefixCustomer + "/competency/list",
    competencyUpdate: prefixCustomer + "/competency/update",
    competencyDelete: prefixCustomer + "/competency/delete",

    bankList: prefixCustomer + "/bank/list",
    bankUpdate: prefixCustomer + "/bank/update",
    bankDelete: prefixCustomer + "/bank/delete",

    exAttributes: prefixCustomer + "/contractWarranty/export/attributes",
    // numberFieldWarranty: prefixCustomer + "/contractWarranty/export/randomWarranty",
    numberFieldWarranty: prefixCustomer + "/contractWarranty/export/randomContractWarranty",
    autoProcess: prefixCustomer + "/contractWarranty/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contractWarranty/import",
  },

  guaranteeAttachment: {
    guaranteeAttachmentList: prefixCustomer + "/guaranteeAttachment/list",
    guaranteeAttachmentUpdate: prefixCustomer + "/guaranteeAttachment/update",
    guaranteeAttachmentDelete: prefixCustomer + "/guaranteeAttachment/delete",
  },

  warrantyAttachment: {
    warrantyAttachmentList: prefixCustomer + "/contractWarrantyAttachment/list",
    warrantyAttachmentUpdate: prefixCustomer + "/contractWarrantyAttachment/update",
    warrantyAttachmentDelete: prefixCustomer + "/contractWarrantyAttachment/delete",
  },

  znsTemplate: {
    list: prefixCustomer + "/znsTemplate/list",
    updateSync: prefixCustomer + "/znsTemplate/list/sync",
    detail: prefixCustomer + "/znsTemplate/get",
    delete: prefixCustomer + "/znsTemplate/delete",
    templateDetail: prefixCustomer + "/znsTemplate/refresh",
  },
  contractProduct: {
    list: prefixCustomer + "/project/list",
    update: prefixCustomer + "/project/update",
    detail: prefixCustomer + "/project/get",
    delete: prefixCustomer + "/project/delete",
    update_investor: prefixCustomer + "/investor/update",
    detail_investor: prefixCustomer + "/investor/get",
  },

  contractStage: {
    list: prefixCustomer + "/contractStage/list",
    update: prefixCustomer + "/contractStage/update",
    detail: prefixCustomer + "/contractStage/get",
    delete: prefixCustomer + "/contractStage/delete",
  },
  contact: {
    list: prefixCustomer + "/contact/list",
    update: prefixCustomer + "/contact/update",
    detail: prefixCustomer + "/contact/get",
    delete: prefixCustomer + "/contact/delete",
    fieldTable: prefixCustomer + "/contactAttribute/listFilter",

    contactExchange: prefixCustomer + "/contactExchange/list",
    // xóa 1 trao đổi trong
    deleteContactExchange: prefixCustomer + "/contactExchange/delete",
    // thêm mới 1 trao đổi
    addContactExchange: prefixCustomer + "/contactExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContactExchange: prefixCustomer + "/contactExchange/get",

    exAttributes: prefixCustomer + "/contact/export/attributes",
    numberFieldContact: prefixCustomer + "/contact/export/randomContacts",
    autoProcess: prefixCustomer + "/contact/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contact/import",
  },
  contactPipeline: {
    list: prefixCustomer + "/contactPipeline/list",
    update: prefixCustomer + "/contactPipeline/update",
    detail: prefixCustomer + "/contactPipeline/get",
    delete: prefixCustomer + "/contactPipeline/delete",
  },
  contactStatus: {
    list: prefixCustomer + "/contactStatus/list",
    update: prefixCustomer + "/contactStatus/update",
    detail: prefixCustomer + "/contactStatus/get",
    delete: prefixCustomer + "/contactStatus/delete",
  },
  contactAttribute: {
    list: prefixCustomer + "/contactAttribute/list",
    update: prefixCustomer + "/contactAttribute/update",
    delete: prefixCustomer + "/contactAttribute/delete",
    listAll: prefixCustomer + "/contactAttribute/listAll",
    checkDuplicated: prefixCustomer + "/contactAttribute/checkDuplicated",
  },
  contactExtraInfo: {
    list: prefixCustomer + "/contactExtraInfo/list",
  },

  position: {
    list: prefixCustomer + "/position/list",
    update: prefixCustomer + "/position/update",
    delete: prefixCustomer + "/position/delete",
  },
  contract: {
    list: prefixCustomer + "/contract/list",
    detail: prefixCustomer + "/contract/get",
    update: prefixCustomer + "/contract/update",
    updateAndInit: prefixCustomer + "/contract/update-and-init",
    delete: prefixCustomer + "/contract/delete",
    updateAlert: prefixCustomer + "/contract/update/alert",

    //cảnh báo hợp đồng chung cho tất cả
    contractAlertUpdate: prefixCustomer + "/contractAlert/update",
    contractAlertList: prefixCustomer + "/contractAlert/list",

    //cảnh báo bảo lãnh hợp đồng chung cho tất cả
    guaranteeAlertUpdate: prefixCustomer + "/guaranteeAlert/update",
    guaranteeAlertList: prefixCustomer + "/guaranteeAlert/list",

    //cảnh báo bảo hành hợp đồng chung cho tất cả
    warrantyAlertUpdate: prefixCustomer + "/contractWarrantyAlert/update",
    warrantyAlertList: prefixCustomer + "/contractWarrantyAlert/list",

    //cảnh báo hợp đồng riêng từng cái
    contractAlertSpecific: prefixCustomer + "/contract/update/alert",
    contractAlertListSpecific: prefixCustomer + "/contract/alert/get",

    detailAlert: prefixCustomer + "/contract",
    fieldTable: prefixCustomer + "/contractAttribute/listFilter",

    updateApproach: prefixCustomer + "/contract/update/approach",

    //list mã đề nghị
    listCodeSuggest: prefixCustomer + "/contractRequest/list",

    //list mã mặt hàng dịch vụ
    listCodeService: prefixCustomer + "/contract/products/select",

    //list nhà cung cấp
    listSupplier: prefixCustomer + "/contract/suppliers/select",

    //thêm hạng mục bàn giao
    updateHandover: prefixCustomer + "/contractItem/update",

    //thêm đợt bàn giao
    updateHandoverProgress: prefixCustomer + "/contractHandover/update",

    //danh sách đợt bàn giao
    listHandoverProgress: prefixCustomer + "/contractHandover/list",

    // xóa 1 đợt bàn giao
    deleteHandoverProgress: prefixCustomer + "/contractHandover/delete",

    //phụ lục hợp đồng
    contractAppendixList: prefixCustomer + "/contractAppendix/list",
    contractAppendixDelete: prefixCustomer + "/contractAppendix/delete",
    contractAppendixUpdate: prefixCustomer + "/contractAppendix/update",
    contractAppendixDetail: prefixCustomer + "/contractAppendix/get",

    contractExchange: prefixCustomer + "/contractExchange/list",
    // xóa 1 trao đổi trong
    deleteContractExchange: prefixCustomer + "/contractExchange/delete",
    // thêm mới 1 trao đổi
    addContractExchange: prefixCustomer + "/contractExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContractExchange: prefixCustomer + "/contractExchange/get",
    // gửi báo giá
    sendQuote: prefixCustomer + "/contract/email-quote",

    // gửi hợp đồng mẫu
    sendContract: prefixCustomer + "/contract/email-contract",

    exAttributes: prefixCustomer + "/contract/export/attributes",
    numberFieldCustomer: prefixCustomer + "/contract/export/randomContracts",
    autoProcess: prefixCustomer + "/contract/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contract/import",

    //các biểu đồ thống kê
    reportContractStatus: prefixCustomer + "/contract/dashboard/byStatus",
    // reportContractStatus: prefixCustomer + "/contract/dashboard/byStatusV2", // API này Năng làm
    reportContractContract: prefixCustomer + "/contract/dashboard/dealValueByCustomer",
    reportNewContract: prefixCustomer + "/contract/dashboard/newByTime",
    // reportNewContract: prefixCustomer + "/contract/dashboard/newByTimeV2", // API này Năng làm

    //thay đổi các trạng thái liên quan đến hợp đồng
    updateStatus: prefixCustomer + "/contract/update/status",

    //lịch sử thay đổi hợp đồng
    logValues: prefixCustomer + "/contract/logValues",
  },
  customerGroup: {
    list: prefixCustomer + "/customerGroup/list",
    update: prefixCustomer + "/customerGroup/update",
    delete: prefixCustomer + "/customerGroup/delete",
  },
  customerSource: {
    list: prefixCustomer + "/customerSource/list",
    update: prefixCustomer + "/customerSource/update",
    delete: prefixCustomer + "/customerSource/delete",
  },
  customerMarketingLead: {
    list: prefixCustomer + "/marketingSource/list",
    update: prefixCustomer + "/marketingSource/update",
    delete: prefixCustomer + "/marketingSource/delete",
  },
  customerView: {
    list: prefixCustomer + "/customerView/list",
    update: prefixCustomer + "/customerView/update",
    delete: prefixCustomer + "/customerView/delete",
  },

  reportChart: {
    listReportArtifact: prefixCustomer + "/reportArtifact/list",
    listArtifactByDashboard: prefixCustomer + "/reportArtifact/list/byDashboard",
    listArtifactByEmployee: prefixCustomer + "/reportArtifact/list/byEmployee",
    updateReportArtifact: prefixCustomer + "/reportArtifact/update",
    deleteReportArtifact: prefixCustomer + "/reportArtifact/delete",

    listReportDashboard: prefixCustomer + "/reportDashboard/list",
    updateReportDashboard: prefixCustomer + "/reportDashboard/update",
    deleteReportDashboard: prefixCustomer + "/reportDashboard/delete",

    listReportRole: prefixCustomer + "/reportRole/list",
    updateReportRole: prefixCustomer + "/reportRole/update",
    deleteReportRole: prefixCustomer + "/reportRole/delete",

    updateReportConfig: prefixCustomer + "/reportConfig/update",
    deleteReportConfig: prefixCustomer + "/reportConfig/delete",
  },

  // Báo cáo bảo lãnh
  reportGuarantee: {
    statistical: prefixCustomer + "/guarantee/statistical",
  },
  // Báo cáo bảo hành
  reportContractWarranty: {
    statistical: prefixCustomer + "/contractWarranty/statistical",
  },
  // Báo cáo đối tác
  reportBussinessParner: {
    report: prefixCustomer + "/contract/report",
    // Chi tiết báo cáo đối tác
    reportDetail: prefixCustomer + "/contract/report/detail",
  },
  // Báo cáo khách hàng
  reportCustomer: {
    totalCurentCustomer: prefixCustomer + "/customer/dashboard/getTotal",
    totalContract: prefixCustomer + "/contract/total/dashboard",
    totalRevenue: prefixCustomer + "/contract/revenue/dashboard",
    externalOrnot: prefixCustomer + "/customer/dashboard/externalOrnot",
    relationShip: prefixCustomer + "/customer/dashboard/relationShip",
    pipeline: prefixCustomer + "/contract/dashboard/pipeline",
    notInTimePipeline: prefixCustomer + "/contract/dashboard/notInTime/pipeline",
    // Chi tiết tổng số khách hàng
    totalCurentCustomerDetail: prefixCustomer + "/customer/dashboard/getTotal/detail",
    // Chi tiết tổng số hợp đồng theo pipeline
    totalContractSignerDetail: prefixCustomer + "/contract/dashboard/notInTime/pipeline/detail",
    // Doanh thu còn phải thu trong kì
    revenueNotYetReceivedDetail: prefixCustomer + "/contract/dashboard/pipeline/detail",
  },
  // Báo cáo cơ hội
  reportOpportunity: {
    totalOpportunity: prefixCustomer + "/campaignOpportunity/total/dashboard",
    opportunityByDate: prefixCustomer + "/campaignOpportunity/totalByDate/dashboard",
    expectedRevenue: prefixCustomer + "/campaignOpportunity/totalExpectedRevenue/dashboard",
    totalByApproach: prefixCustomer + "/campaignOpportunity/totalByApproach/dashboard",

    //Chi tiết tổng số cơ hội
    totalOpportunityDetail: prefixCustomer + "/campaignOpportunity/total/dashboard/detail",
    //Chi tiết doanh thu dự kiến
    expectedRevenueDetail: prefixCustomer + "/campaignOpportunity/totalExpectedRevenue/dashboard/detail",
    //Chi tiết doanh ký hợp đồng
    contractRevenueDetail: prefixCustomer + "/contract/revenue/dashboard/detail",
  },

  customerField: {
    list: prefixCustomer + "/customerField/list",
    update: prefixCustomer + "/customerField/update",
    delete: prefixCustomer + "/customerField/delete",
  },
  customerAttribute: {
    list: prefixCustomer + "/customerAttribute/list",
    update: prefixCustomer + "/customerAttribute/update",
    delete: prefixCustomer + "/customerAttribute/delete",
    listAll: prefixCustomer + "/customerAttribute/listAll",
    checkDuplicated: prefixCustomer + "/customerAttribute/checkDuplicated",
  },
  customerExtraInfo: {
    list: prefixCustomer + "/customerExtraInfo/list",
  },
  contractAttribute: {
    list: prefixCustomer + "/contractAttribute/list",
    update: prefixCustomer + "/contractAttribute/update",
    delete: prefixCustomer + "/contractAttribute/delete",
    listAll: prefixCustomer + "/contractAttribute/listAll",
    checkDuplicated: prefixCustomer + "/contractAttribute/checkDuplicated",
  },
  contractExtraInfo: {
    list: prefixCustomer + "/contractExtraInfo/list",
  },

  guaranteeAttribute: {
    list: prefixCustomer + "/guaranteeAttribute/list",
    update: prefixCustomer + "/guaranteeAttribute/update",
    delete: prefixCustomer + "/guaranteeAttribute/delete",
    listAll: prefixCustomer + "/guaranteeAttribute/listAll",
    checkDuplicated: prefixCustomer + "/guaranteeAttribute/checkDuplicated",
  },
  warrantyAttribute: {
    list: prefixCustomer + "/contractWarrantyAttribute/list",
    update: prefixCustomer + "/contractWarrantyAttribute/update",
    delete: prefixCustomer + "/contractWarrantyAttribute/delete",
    listAll: prefixCustomer + "/contractWarrantyAttribute/listAll",
    checkDuplicated: prefixCustomer + "/contractWarrantyAttribute/checkDuplicated",
  },
  guaranteeExtraInfo: {
    list: prefixCustomer + "/guaranteeExtraInfo/list",
  },
  warrantyExtraInfo: {
    list: prefixCustomer + "/contractWarrantyExtraInfo/list",
  },

  career: {
    list: prefixCustomer + "/career/list",
    update: prefixCustomer + "/career/update",
    delete: prefixCustomer + "/career/delete",
  },
  relationShip: {
    list: prefixCustomer + "/relationship/list",
    update: prefixCustomer + "/relationship/update",
    delete: prefixCustomer + "/relationship/delete",
  },
  tipGroup: {
    list: prefixCustomer + "/tipGroup/list",
    update: prefixCustomer + "/tipGroup/update",
    delete: prefixCustomer + "/tipGroup/delete",
    listTipGroupEmloyee: prefixCustomer + "/tipGroupEmployee/list",
    updateTipGroupEmloyee: prefixCustomer + "/tipGroupEmployee/update",
    deleteTipGroupEmloyee: prefixCustomer + "/tipGroupEmployee/delete",
  },
  tipUser: {
    list: prefixCustomer + "/tipUser/list",
    update: prefixCustomer + "/tipUser/update",
    delete: prefixCustomer + "/tipUser/delete",
  },
  tipUserConfig: {
    list: prefixCustomer + "/tipUserConfig/list",
    update: prefixCustomer + "/tipUserConfig/update",
    delete: prefixCustomer + "/tipUserConfig/delete",
  },
  tipGroupConfig: {
    list: prefixCustomer + "/tipGroupConfig/list",
    update: prefixCustomer + "/tipGroupConfig/update",
    delete: prefixCustomer + "/tipGroupConfig/delete",
  },
  setting: {
    list: prefixCustomer + "/setting/list",
    update: prefixCustomer + "/setting/update",
    delete: prefixCustomer + "/setting/delete",
  },
  connectGmail: {
    connect: "https://connect.reborn.vn/api/v1/google/access-token",
    checkConnect: "https://connect.reborn.vn/api/v1/google/gmails-link-bsn",
  },
  fanpageFacebook: {
    //* kết nối fanpage với crm
    connect: prefixCustomer + "/fanpage/connect",
    //* Lấy danh sách fanpage đã được kết nối
    list: prefixCustomer + "/fanpage/list",
    //* Chọn thêm 1 kết nối fanpage
    update: prefixCustomer + "/fanpage/update",
    //* gỡ fanpage ra khỏi kết nối
    delete: prefixCustomer + "/fanpage/remove",
    //* Lấy danh sách fanpage đã được kết nối
    listFanpage: prefixCustomer + "/fanpage/list",
    //* Lấy danh sách hội thoại chat
    listFanpageDialog: prefixCustomer + "/fanpageDialog/list",
    //* Danh sách tin nhắn chat từ fanpage
    listFanpageChat: prefixCustomer + "/fanpageChat/list",
    //* Phản hồi (nhắn tin phản hồi người chat facebook)
    replyFanpageChat: prefixCustomer + "/fanpageChat/reply",
    //* Danh sách bình luận từ fanpage
    listFanpageComment: prefixCustomer + "/fanpageComment/list",
    //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
    replyFanpageComment: prefixCustomer + "/fanpageComment/reply",
    //* Gỡ 1 bình luận đã đăng
    deleteFanpageComment: prefixCustomer + "/fanpageComment/delete",
    //* Ẩn 1 bình luận trên fanpage
    hiddenFanpageComment: prefixCustomer + "/fanpageComment/hidden",
    //* Lấy thông tin bài đã đăng
    fanpagePost: prefixCustomer + "/fanpagePost/get",
    //* Gửi file đính kèm trong messenger
    fanpageChatSendAttachment: prefixCustomer + "/fanpageChat/send/attachment",
  },
  zaloOA: {
    //* kết nối zalo với crm
    connect: prefixCustomer + "/zaloOa/connect",
    //* Lấy danh sách zalo đã được kết nối
    list: prefixCustomer + "/zaloOa/list",
    //* Gỡ một zalo ra khỏi danh sách đã kết nối
    delete: prefixCustomer + "/zaloOa/remove",
    //* Lấy danh sách hội thoại chat
    listZaloFollower: prefixCustomer + "/zaloFollower/list",
    //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
    listZaloChat: prefixCustomer + "/zaloChat/list",
    //* Nhắn tin cho người dùng
    sendZaloChat: prefixCustomer + "/zaloChat/send",
    //* Gửi tin nhắn dạng link ảnh
    linkImageSendZaloChat: prefixCustomer + "/zaloChat/send/link_image",
    //* Gửi tin nhắn đính kèm file
    fileSendZaloChat: prefixCustomer + "/zaloChat/send/file",
    //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
    answerSendZaloChat: prefixCustomer + "/zaloChat/send/answer",
    //* Gỡ 1 tin nhắn chat
    deleteZaloChat: prefixCustomer + "/zaloChat/delete",
  },
  image: {
    upload: "https://login.noron.vn/api/upload/image",
    // upload: "https://reborn.vn/api/upload/file",
    uploadReborn: prefixRebornVn + "/upload/file",
    uploadNoron: "https://login.noron.vn/api/upload/file",
    // uploadReborn: "http://localhost:8000/api/upload/file"
  },
  file: {
    upload: prefixRebornVn + "/upload/file",
  },
  video: {
    upload: "https://login.noron.vn/api/upload/file",
  },
  analysis: {
    list: "https://cloud.reborn.vn/market/article/list",
    detail: "https://cloud.reborn.vn/market/article/get",
  },
  reportMa: {
    getCustomer: prefixCustomer + "/ma/dashboard/customer/byStatus",
    // detail: "https://cloud.reborn.vn/market/article/get",
  },
  keywordData: {
    list: "https://cloud.reborn.vn/market/keywordData/list",
    update: "https://cloud.reborn.vn/market/keywordData/update",
    detail: "https://cloud.reborn.vn/market/keywordData/get",
    delete: "https://cloud.reborn.vn/market/keywordData/delete",
  },
  configCode: {
    list: prefixCustomer + "/globalConfig/list",
    update: prefixCustomer + "/globalConfig/update",
    detail: prefixCustomer + "/globalConfig/get",
    delete: prefixCustomer + "/globalConfig/delete",
  },
  placeholder: {
    contractWarranty: prefixCustomer + "/contractWarranty/placeholder", // placeholder Bảo hành
    guarantee: prefixCustomer + "/guarantee/placeholder", // placeholder Bảo lãnh
    contract: prefixCustomer + "/contract/placeholder", // placeholder Hợp đồng
    customer: prefixCustomer + "/customer/placeholder", // placeholder Khách hàng
    contact: prefixCustomer + "/contact/placeholder ", // placeholder Người liên hệ
  },
  partnerCall: {
    list: prefixCustomer + "/partnerCall/list",
    update: prefixCustomer + "/partnerCall/update",
    detail: prefixCustomer + "/partnerCall/get",
    delete: prefixCustomer + "/partnerCall/delete",
  },
  switchboard: {
    list: prefixCustomer + "/callConfig/list",
    update: prefixCustomer + "/callConfig/update",
    updateStatus: prefixCustomer + "/callConfig/update/status",
    detail: prefixCustomer + "/callConfig/get",
    delete: prefixCustomer + "/callConfig/delete",
  },
  templateSMS: {
    list: prefixCustomer + "/templateSms/list",
    update: prefixCustomer + "/templateSms/update",
    detail: prefixCustomer + "/templateSms/get",
    delete: prefixCustomer + "/templateSms/delete",
  },
  partnerSMS: {
    list: prefixCustomer + "/partnerSms/list",
    update: prefixCustomer + "/partnerSms/update",
    detail: prefixCustomer + "/partnerSms/get",
    delete: prefixCustomer + "/partnerSms/delete",
  },
  brandName: {
    list: prefixCustomer + "/brandname/list",
    update: prefixCustomer + "/brandname/update",
    detail: prefixCustomer + "/brandname/get",
    delete: prefixCustomer + "/brandname/delete",

    listWhiteList: prefixCustomer + "/whitelist/brandname/contact/list",
    updateWhiteList: prefixCustomer + "/whitelist/brandname/contact/update",
    deleteWhiteList: prefixCustomer + "/whitelist/brandname/contact/delete",
    changeStatusWhiteList: prefixCustomer + "/whitelist/brandname/update",
  },
  templateCategory: {
    list: prefixCustomer + "/templateCategory/list",
    update: prefixCustomer + "/templateCategory/update",
    detail: prefixCustomer + "/templateCategory/get",
    delete: prefixCustomer + "/templateCategory/delete",
  },
  templateZalo: {
    list: prefixCustomer + "/templateZalo/list",
    update: prefixCustomer + "/templateZalo/update",
    detail: prefixCustomer + "/templateZalo/get",
    delete: prefixCustomer + "/templateZalo/delete",
  },
  templateEmail: {
    list: prefixCustomer + "/templateEmail/list",
    update: prefixCustomer + "/templateEmail/update",
    detail: prefixCustomer + "/templateEmail/get",
    delete: prefixCustomer + "/templateEmail/delete",
  },
  partnerEmail: {
    list: prefixCustomer + "/partnerEmail/list",
    update: prefixCustomer + "/partnerEmail/update",
    detail: prefixCustomer + "/partnerEmail/get",
    delete: prefixCustomer + "/partnerEmail/delete",
  },
  emailConfig: {
    list: prefixCustomer + "/emailConfig/list",
    update: prefixCustomer + "/emailConfig/update",
    detail: prefixCustomer + "/emailConfig/get",
    delete: prefixCustomer + "/emailConfig/delete",

    //Kiểm tra Email nguồn
    checkEmail: prefixCustomer + "/email/testConnection",
  },
  industry: {
    list: "https://cloud.reborn.vn/market/industry/list",
    update: "https://cloud.reborn.vn/market/industry/update",
    detail: "https://cloud.reborn.vn/market/industry/get",
    delete: "https://cloud.reborn.vn/market/industry/delete",
  },
  mailBox: {
    list: prefixCustomer + "/mailbox/list",
    update: prefixCustomer + "/mailbox/update",
    detail: prefixCustomer + "/mailbox/get",
    delete: prefixCustomer + "/mailbox/delete",
    viewer: prefixCustomer + "/mailbox/viewer",
    updateViewer: prefixCustomer + "/mailbox/update/viewer",
    mailboxExchangeList: prefixCustomer + "/mailboxExchange/list",
    mailboxExchangeUpdate: prefixCustomer + "/mailboxExchange/update",
    mailboxExchangeDelete: prefixCustomer + "/mailboxExchange/delete",
  },
  warranty: {
    list: prefixCustomer + "/warranty/list",
    update: prefixCustomer + "/warranty/update",
    detail: prefixCustomer + "/warranty/get",
    delete: prefixCustomer + "/warranty/delete",
    collect: prefixCustomer + "/warranty/send/jssdk",
    overview: prefixCustomer + "/warranty/get/overview",
    viewer: prefixCustomer + "/warranty/viewer",
    updateStatus: prefixCustomer + "/warranty/update/status",
    warrantyExchangeUpdate: prefixCustomer + "/warrantyExchange/update",
    warrantyExchangeDelete: prefixCustomer + "/warrantyExchange/delete",
    warrantyExchangeList: prefixCustomer + "/warrantyExchange/list",
    warrantyProcess: prefixCustomer + "/warrantyProcess/update",
    resetTransferVotes: prefixCustomer + "/supportObject/reset",
  },
  warrantyCategory: {
    list: prefixCustomer + "/warrantyCategory/list",
    update: prefixCustomer + "/warrantyCategory/update",
    detail: prefixCustomer + "/warrantyCategory/get",
    delete: prefixCustomer + "/warrantyCategory/delete",
  },
  warrantyProc: {
    list: prefixCustomer + "/support/list",
    update: prefixCustomer + "/support/update",
    detail: prefixCustomer + "/support/get",
    delete: prefixCustomer + "/support/delete",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  warrantyStep: {
    list: prefixCustomer + "/warrantyStep/list",
    update: prefixCustomer + "/warrantyStep/update",
    detail: prefixCustomer + "/warrantyStep/get",
    delete: prefixCustomer + "/warrantyStep/delete",
  },
  ticket: {
    list: prefixCustomer + "/ticket/list",
    update: prefixCustomer + "/ticket/update",
    updateAndInit: prefixCustomer + "/ticket/update-and-init",
    collect: prefixCustomer + "/ticket/send/jssdk",
    detail: prefixCustomer + "/ticket/get",
    delete: prefixCustomer + "/ticket/delete",
    viewer: prefixCustomer + "/ticket/viewer",
    updateStatus: prefixCustomer + "/ticket/update/status",
    ticketExchangeList: prefixCustomer + "/ticketExchange/list",
    ticketExchangeUpdate: prefixCustomer + "/ticketExchange/update",
    ticketExchangeDelete: prefixCustomer + "/ticketExchange/delete",
    ticketProcess: prefixCustomer + "/ticketProcess/update",
    resetTransferVotes: prefixCustomer + "/supportObject/reset",
  },
  ticketCategory: {
    list: prefixCustomer + "/ticketCategory/list",
    update: prefixCustomer + "/ticketCategory/update",
    detail: prefixCustomer + "/ticketCategory/get",
    delete: prefixCustomer + "/ticketCategory/delete",
  },
  ticketProc: {
    list: prefixCustomer + "/support/list",
    update: prefixCustomer + "/support/update",
    detail: prefixCustomer + "/support/get",
    delete: prefixCustomer + "/support/delete",
  },
  supportCommon: {
    supportConfigLst: prefixCustomer + "/supportConfig/list",
    supportConfigUpdate: prefixCustomer + "/supportConfig/update",
    supportConfigDelete: prefixCustomer + "/supportConfig/delete",
    supportConfigDetail: prefixCustomer + "/supportConfig/get",

    updateStatusSupport: prefixCustomer + "/support/update/status",

    supportLinkLst: prefixCustomer + "/supportLink/list",
    supportLinkUpdate: prefixCustomer + "/supportLink/update",
    supportLinkDelete: prefixCustomer + "/supportLink/delete",

    supportObjectLst: prefixCustomer + "/supportObject/list",
    supportObjectUpdate: prefixCustomer + "/supportObject/update",
    supportObjectDelete: prefixCustomer + "/supportObject/delete",
    takeObject: prefixCustomer + "/supportObject/get/object",
    checkApproved: prefixCustomer + "/supportObject/checkApproved",

    supportLogLst: prefixCustomer + "/supportLog/list",
    supportLogUpdate: prefixCustomer + "/supportLog/update",
    supportLogDelete: prefixCustomer + "/supportLog/delete",

    // đoạn này là action confirm nút
    processDone: prefixCustomer + "/supportLog/processDone",
    processReceive: prefixCustomer + "/supportLog/receive",
    processRejected: prefixCustomer + "/supportLog/processRejected",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  ticketStep: {
    list: prefixCustomer + "/ticketStep/list",
    update: prefixCustomer + "/ticketStep/update",
    detail: prefixCustomer + "/ticketStep/get",
    delete: prefixCustomer + "/ticketStep/delete",
  },
  //API công việc
  workProject: {
    list: prefixCustomer + "/workProject/list",
    update: prefixCustomer + "/workProject/update",
    detail: prefixCustomer + "/workProject/get",
    delete: prefixCustomer + "/workProject/delete",
  },
  // workOrder: {
  //   list: prefixCustomer + "/workOrder/list",
  //   update: prefixCustomer + "/workOrder/update",
  //   detail: prefixCustomer + "/workOrder/get",
  //   delete: prefixCustomer + "/workOrder/delete",
  //   // Lấy thông tin người liên quan
  //   relatedPeople: prefixCustomer + "/workOrder/get/related_people",
  //   // cập nhật thông tin người tham gia trong công việc
  //   updateParticipant: prefixCustomer + "/workOrder/update/participant",
  //   // cập nhật thông tin khách hàng tham gia trong công việc
  //   updateCustomer: prefixCustomer + "/workOrder/update/customer",
  //   // cập nhật thông tin công việc liên quan
  //   updateOtherWorkOrder: prefixCustomer + "/workOrder/update/other_work_order",
  //   // Lấy danh sách công việc liên quan
  //   getOtherWorkOrder: prefixCustomer + "/workOrder/get/other_work_order",
  //   // Cập nhật tiến độ công việc
  //   updateWorkInprogress: prefixCustomer + "/workInprogress/update",
  //   // Lấy tiến độ công việc
  //   getWorkInprogress: prefixCustomer + "/workInprogress/get",
  //   // Lấy danh sách cập nhật tiến độ công việc
  //   getWorkInprogressList: prefixCustomer + "/workInprogress/list",
  //   // Cập nhật trạng thái công việc
  //   updateStatus: prefixCustomer + "/workOrder/update/status",
  //   // Lấy danh sách người giao việc
  //   employeeManagers: prefixCustomer + "/employee/managers",
  //   // Lấy danh sách người nhận việc
  //   employeeAssignees: prefixCustomer + "/employee/assignees",
  //   // danh sách trao đổi trong công việc
  //   workExchange: prefixCustomer + "/workExchange/list",
  //   // báo cáo công việc
  //   workReport: prefixCustomer + "/workOrder/report",
  //   // xóa 1 trao đổi trong công việc
  //   deleteWorkExchange: prefixCustomer + "/workExchange/delete",
  //   // thêm mới 1 trao đổi công việc
  //   addWorkExchange: prefixCustomer + "/workExchange/update",
  //   // chỉnh sửa 1 trao đổi công việc
  //   updateWorkExchange: prefixCustomer + "/workExchange/get",
  //   // cập nhật đánh giá chất lượng công việc
  //   updateRating: prefixCustomer + "/workOrder/update/review",
  //   // cập nhật mức độ ưu tiên công việc
  //   updatePriorityLevel: prefixCustomer + "/workOrder/update/priorityLevel",
  // },
  workOrder: {
    listBpmWorkOrder: prefixBpm + "/workOrder/list",
    list: prefixCustomer + "/workOrder/list",
    listV2: prefixCustomer + "/workOrder/listV2",
    groups: prefixCustomer + "/workOrder/groups",
    groupsV2: prefixCustomer + "/workOrder/groupsV2",
    update: prefixCustomer + "/workOrder/update",
    updateAndInit: prefixCustomer + "/workOrder/save-and-init-process",
    updateInitProcess: prefixCustomer + "/workOrder/update-init-process",
    updateEmployee: prefixCustomer + "/workOrder/update/employee",
    updatePause: prefixCustomer + "/workOrder/update/pause",
    listPause: prefixCustomer + "/workOrder/list/pause",
    updateReject: prefixCustomer + "/bpmForm/reject",
    detail: prefixCustomer + "/workOrder/get",
    delete: prefixCustomer + "/workOrder/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixCustomer + "/workOrder/get/related_people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixCustomer + "/workOrder/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixCustomer + "/workOrder/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixCustomer + "/workOrder/update/other_work_order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixCustomer + "/workOrder/get/other_work_order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixCustomer + "/workInprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixCustomer + "/workInprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixCustomer + "/workInprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixCustomer + "/workOrder/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixCustomer + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixCustomer + "/employee/assignees",
    // Lấy danh sách người nhận việc trong dự án
    projectEmployeeAssignees: prefixCustomer + "/workProject/getEmployees",
    // danh sách trao đổi trong công việc
    workExchange: prefixCustomer + "/workExchange/list",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixCustomer + "/workExchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixCustomer + "/workExchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixCustomer + "/workExchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixCustomer + "/workOrder/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixCustomer + "/workOrder/update/priorityLevel",
    //exportOLA
    exportOLA: prefixBpm + "/ola/export",
    //exportSLA
    exportSLA: prefixBpm + "/sla/export",
    // Giao công việc đàm phán, thương thảo hợp đồng mẫu
    assignNegotiationWork: prefixApplication + "/workAssignment",
    // Lấy thông tin chi tiết công việc đàm phán, thương thảo hợp đồng mẫu
    getNegotiationWork: prefixApplication + "/workAssignment",
    // Lưu công việc đàm phán, thương thảo hợp đồng mẫu
    saveNegotiationWork: prefixApplication + "/negotiationBidderDetail",
    // hoàn thành công việc đàm phán, thương thảo hợp đồng mẫu
    completeNegotiationWork: prefixApplication + "/negotiationBidderDetail/complete",
    // Thu hồi công việc
  },
  formCategory: {
    list: prefixBpm + "/bpmFormPopup/list",
    update: prefixBpm + "/bpmFormPopup/update",
    detail: prefixBpm + "/bpmFormPopup/get",
    delete: prefixBpm + "/bpmFormPopup/delete",
  },
  bpmReason: {
    list: prefixBpm + "/bpm/listReason",
    update: prefixBpm + "/bpm/updateReason",
    updateActive: prefixBpm + "/bpm/updateReason/active",
    detail: prefixBpm + "/bpm/getReason",
    delete: prefixBpm + "/bpm/deleteReason",
  },
  userTask: {
    // list: prefixCustomer + "/workOrder/list",
    list: prefixBpm + "/workOrder/list",
    update: prefixCustomer + "/workOrder/update",
    detail: prefixBpm + "/workOrder/get",
    // detail: prefixBpm + "/workOrder/get",
    updatePause: prefixCustomer + "/workOrder/update/pause",
    // listPause: prefixCustomer + "/workOrder/list/pause",
    listPause: prefixBpm + "/workOrder/list/pause",
    delete: prefixCustomer + "/workOrder/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixCustomer + "/workOrder/get/related_people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixCustomer + "/workOrder/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixCustomer + "/workOrder/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixCustomer + "/workOrder/update/other_work_order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixCustomer + "/workOrder/get/other_work_order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixSale + "/workInprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixSale + "/workInprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixSale + "/workInprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixCustomer + "/workOrder/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixSystem + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixSystem + "/employee/assignees",
    // danh sách trao đổi trong công việc
    workExchange: prefixSale + "/workExchange/list",
    // báo cáo công việc
    workReport: prefixCustomer + "/workOrder/report",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixSale + "/workExchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixSale + "/workExchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixSale + "/workExchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixCustomer + "/workOrder/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixCustomer + "/workOrder/update/priorityLevel",
    //exportOLA
    exportOLA: prefixCustomer + "/ola/export",
    //exportSLA
    exportSLA: prefixCustomer + "/sla/export",
  },
  bpmField: {
    list: prefixApplication + "/field/list",
    update: prefixApplication + "/field/update",
    updateStatus: prefixApplication + "/field/update/status",
    detail: prefixApplication + "/field/get",
    delete: prefixApplication + "/field/delete",
  },
  projectCatalog: {
    list: prefixApplication + "/projectCatalog/list",
    update: prefixApplication + "/projectCatalog/update",
    updateStatus: prefixApplication + "/projectCatalog/update/status",
    detail: prefixApplication + "/projectCatalog/get",
    delete: prefixApplication + "/projectCatalog/delete",
  },
  material: {
    list: prefixApplication + "/material/list",
    update: prefixApplication + "/material/update",
    updateStatus: prefixApplication + "/material/update/status",
    delete: prefixApplication + "/material/delete",
    detail: prefixApplication + "/material/get",
    upload: prefixApplication + "/material/upload",
  },
  businessCategory: {
    list: prefixApplication + "/businessCategory/list",
    update: prefixApplication + "/businessCategory/update",
    updateActive: prefixApplication + "/businessCategory/update/active",
    detail: prefixApplication + "/businessCategory/get",
    delete: prefixApplication + "/businessCategory/delete",
  },
  bpmInvestor: {
    list: prefixApplication + "/investor/list",
    update: prefixApplication + "/investor/update",
    updateStatus: prefixApplication + "/investor/update/status",
    detail: prefixApplication + "/investor/get",
    delete: prefixApplication + "/investor/delete",
  },
  supplier: {
    list: prefixApplication + "/organization/list",
    update: prefixApplication + "/organization/update",
    updateActive: prefixApplication + "/organization/update/active",
    detail: prefixApplication + "/organization/get",
    delete: prefixApplication + "/organization/delete",
    listContact: prefixApplication + "/contactOrg/list",
    deleteContact: prefixApplication + "/contactOrg/delete",
    detailContact: prefixApplication + "/contactOrg/get",
  },
  workCategory: {
    list: prefixApplication + "/workCategory/list",
    update: prefixApplication + "/workCategory/update",
    updateStatus: prefixApplication + "/workCategory/update/active",
    detail: prefixApplication + "/workCategory/get",
    delete: prefixApplication + "/workCategory/delete",
  },

  procurement: {
    list: prefixApplication + "/procurementType/list",
    update: prefixApplication + "/procurementType/update",
    updateStatus: prefixApplication + "/procurementType/update/status",
    detail: prefixApplication + "/procurementType/get",
    delete: prefixApplication + "/procurementType/delete",
  },
  workType: {
    list: prefixCustomer + "/workType/list",
    update: prefixCustomer + "/workType/update",
    detail: prefixCustomer + "/workType/get",
    delete: prefixCustomer + "/workType/delete",
  },
  //API người danh sách người mua, bán
  objectSource: {
    list: prefixApi + "/objectSource/list",
  },
  //API quản trị phân hệ
  subsystemAdministration: {
    list: prefixAdminLegacy + "/module/list",
    update: prefixAdminLegacy + "/module/update",
    detail: prefixAdminLegacy + "/module/get",
    delete: prefixAdminLegacy + "/module/delete",
    // Thêm mới một tài nguyên vào phân hệ
    addModuleResource: prefixAdminLegacy + "/moduleResource/add",
    // Xóa một tài nguyên hỏi phân hệ
    removeModuleResource: prefixAdminLegacy + "/moduleResource/remove",
  },
  //API quản trị chúc năng
  functionalManagement: {
    list: prefixAdminLegacy + "/resource/list",
    update: prefixAdminLegacy + "/resource/update",
    detail: prefixAdminLegacy + "/resource/get",
    delete: prefixAdminLegacy + "/resource/delete",
    // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
    freeResource: prefixAdminLegacy + "/resource/list_ex",
  },
  permission: {
    getPermissionResources: prefixAdminLegacy + "/permission/resource",
    //API phân quyền theo phòng ban
    permissionDepartment: prefixAdminLegacy + "/permission/info",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixAdminLegacy + "/rolePermission/info",
    //API thêm quyền cho phòng ban
    permissionDepartmentAdd: prefixAdminLegacy + "/permission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixAdminLegacy + "/rolePermission/add",
    //API xóa quyền được cấp
    permissionDepartmentDelete: prefixAdminLegacy + "/permission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixAdminLegacy + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixAdminLegacy + "/requestPermission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixAdminLegacy + "/requestPermission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixAdminLegacy + "/requestPermission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixAdminLegacy + "/requestPermission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixAdminLegacy + "/requestPermission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixAdminLegacy + "/requestPermission/update/rejected ",
  },
  rolePermission: {
    getPermissionResources: prefixAdminLegacy + "/permission/resource",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixAdminLegacy + "/rolePermission/info",
    //API phân quyền theo gói
    packagePermission: prefixAdminLegacy + "/packagePermission/info",
    //API thêm quyền cho nhóm quyền
    packagePermissionAdd: prefixAdminLegacy + "/packagePermission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixAdminLegacy + "/rolePermission/add",
    //API xóa quyền được cấp
    permissionRoleDelete: prefixAdminLegacy + "/rolePermission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixAdminLegacy + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixAdminLegacy + "/requestPermission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixAdminLegacy + "/requestPermission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixAdminLegacy + "/requestPermission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixAdminLegacy + "/requestPermission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixAdminLegacy + "/requestPermission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixAdminLegacy + "/requestPermission/update/rejected ",
  },
  //API tổng đài
  callCenter: {
    //* Tạo 1 cuộc gọi
    makeCall: prefixCustomer + "/callCenter/makeCall",
    //* Lấy danh sách lịch sử cuộc gọi
    getHistory: prefixCustomer + "/callCenter/getHistory",
    //* Lấy chi tiết lịch sử cuộc gọi
    getHistoryByCallId: prefixCustomer + "/callCenter/getHistoryByCallId",
    //* Chuyển một cuộc gọi sang máy khác
    transferCall: prefixCustomer + "/callCenter/transferCall",
    //* Thực hiện ngắt cuộc gọi
    hangupCall: prefixCustomer + "/callCenter/hangupCall",
    //* Tạo 1 cuộc gọi đọc mã OTP cho người đăng ký
    makeCallOTP: prefixCustomer + "/callCenter/makeCallOTP",
    //* Danh sách lịch sử cuộc gọi
    customerCallList: prefixCustomer + "/customerCall/list",
  },
  // Báo cáo
  report: {
    // báo cáo doanh thu
    revenue: prefixCustomer + "/cashbook/statistic",
    // báo cáo doanh thu nhân viên
    employee: prefixCustomer + "/invoice/employee/top",
    // báo cáo sản phẩm
    product: prefixCustomer + "/invoice/product/top",
    // báo cáo thẻ dịch vụ
    cardService: prefixCustomer + "/invoice/card-service/top",
    // báo cáo dịch vụ
    service: prefixCustomer + "/invoice/service/top",
    // báo cáo theo tỉnh, thành phố
    city: prefixCustomer + "/invoice/city/top",
    // báo cáo khách hàng
    customer: prefixCustomer + "/cashbook/statistic/customer",
  },
  // video hướng dẫn
  videoSupport: {
    list: prefixRebornVn + "/support/list",
  },
  // phiếu điều chỉnh kho
  adjustmentSlip: {
    temp: prefixWarehouse + "/stockAdjust/temp",
    createAdjSlip: prefixWarehouse + "/stockAdjust/create",
    addUpdatePro: prefixWarehouse + "/stockAdjustDetail/update",
    // duyệt phiếu điều chỉnh kho
    approved: prefixWarehouse + "/stockAdjust/approved",
    // từ chối điều chỉnh kho
    cancel: prefixWarehouse + "/stockAdjust/cancel",
    view: prefixWarehouse + "/stockAdjust/view",
    list: prefixWarehouse + "/stockAdjust/list",
    // lấy danh sách sản phẩm có trong kho
    warehouse: prefixWarehouse + "/warehouse/list",
    // xóa đi 1 sản phẩm
    deletePro: prefixWarehouse + "/stockAdjustDetail/delete",
  },
  kpiDatasource: {
    list: prefixCustomer + "/kpiDatasource/list",
    update: prefixCustomer + "/kpiDatasource/update",
    delete: prefixCustomer + "/kpiDatasource/delete",
  },
  kpiGoal: {
    list: prefixCustomer + "/kpiGoal/list",
    update: prefixCustomer + "/kpiGoal/update",
    delete: prefixCustomer + "/kpiGoal/delete",
    detail: prefixCustomer + "/kpiGoal/get",
  },
  kpiTemplate: {
    list: prefixCustomer + "/kpiTemplate/list",
    update: prefixCustomer + "/kpiTemplate/update",
    delete: prefixCustomer + "/kpiTemplate/delete",
  },
  kpiTemplateGoal: {
    list: prefixCustomer + "/kpiTemplateGoal/list",
    update: prefixCustomer + "/kpiTemplateGoal/update",
    delete: prefixCustomer + "/kpiTemplateGoal/delete",
  },
  kpiSetup: {
    list: prefixCustomer + "/kpiSetup/list",
    update: prefixCustomer + "/kpiSetup/update/web",
    delete: prefixCustomer + "/kpiSetup/delete",
  },
  kpi: {
    list: prefixCustomer + "/kpi/list",
    update: prefixCustomer + "/kpi/update",
    delete: prefixCustomer + "/kpi/delete",

    checkKpiCampaign: prefixCustomer + "/kpiApply/get/byCampaignId",
    updateKpi: prefixCustomer + "/campaign/update/kpi",
    listEmployeeKpi: prefixCustomer + "/kpiObject/list",
    addEmployeeToKpi: prefixCustomer + "/kpiObject/get/byObject",
    listGoalKpiEmployee: prefixCustomer + "/kpiSetupObject/list/byKotId",
    saveKpiEmployee: prefixCustomer + "/kpiSetupObject/update/web",
    deleteEmployeeKpi: prefixCustomer + "/kpiObject/delete",

    //chỉ tiêu tương tác trong chiến dịch bán hàng
    addEmployeeToKpiContact: prefixCustomer + "/campaignSale/interaction/kpis",
    saveKpiContactEmployee: prefixCustomer + "/campaignSale/interaction/kpis",
    listEmployeeKpiContact: prefixCustomer + "/campaignSale/interaction/employee",
    deleteEmployeeKpiContact: prefixCustomer + "/campaignSale/interaction/kpis",
  },
  kpiApply: {
    list: prefixCustomer + "/kpiApply/list",
    update: prefixCustomer + "/kpiApply/update",
    delete: prefixCustomer + "/kpiApply/delete",
  },
  kpiObject: {
    list: prefixCustomer + "/kpiObject/list",
    update: prefixCustomer + "/kpiObject/update/web",
    delete: prefixCustomer + "/kpiObject/delete",
    detail: prefixCustomer + "/kpiObject/get",
    detailKpiEmployee: prefixCustomer + "/kpiObject/employee/result",
    exchangeList: prefixCustomer + "/kpiExchange/list",
    // xóa 1 trao đổi
    deleteKpiExchange: prefixCustomer + "/kpiExchange/delete",
    // thêm mới 1 trao đổi
    addKpiExchange: prefixCustomer + "/kpiExchange/update",

    // chỉnh sửa 1 trao đổi
    updateKpiExchange: prefixCustomer + "/kpiExchange/get",
  },
  installApp: {
    list: prefixCustomer + "/app/list",
    update: prefixCustomer + "/app/update",
    delete: prefixCustomer + "/app/delete",
    detail: prefixCustomer + "/app/get",
    takeKey: prefixCustomer + "/app/get/key",
  },

  webhook: {
    list: prefixCustomer + "/webhook/list",
    update: prefixCustomer + "/webhook/update",
    delete: prefixCustomer + "/webhook/delete",
    detail: prefixCustomer + "/webhook/get",
  },

  //nguồn cấp dữ liệu
  dataSupplySource: {
    list: prefixCustomer + "/filter-setting/list",
  },
  //lay danh sach voucher
  voucher: {
    list: prefixCustomer + "/promotion/list-active",
  },

  email: {
    list: prefixCustomer + "/outlookMail/list",
    detail: prefixCustomer + "/outlookMail/get",
    sendEmail: prefixCustomer + "/outlookMail/sendEmail",
    delete: prefixCustomer + "/outlookMail/delete",
    sendEmailConfirm: prefixCustomer + "/promotion/init-receive-task",

    // call api email
    lstEmail: "https://connect.reborn.vn/api/v1/google/gmail/message/search",
    sendEmailNew: "https://connect.reborn.vn/api/v1/google/gmail/message/send",
    detailEmail: "https://connect.reborn.vn/api/v1/google/gmail/message/get-by-id",
    sendEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/send",
    lstEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/search",
    createEmailDraft: "https://connect.reborn.vn/api/v1/google/gmail/draft/create",
  },

  ma: {
    list: prefixCustomer + "/ma/list",
    update: prefixCustomer + "/ma/update",
    detail: prefixCustomer + "/ma/get",
    delete: prefixCustomer + "/ma/delete",
    addNode: prefixCustomer + "/ma/config-node/update",
    deleteNode: prefixCustomer + "/ma/node/delete",
    updateNode: prefixCustomer + "/ma/config/update",
    detailConfigMA: prefixCustomer + "/ma/config/get",
    updateStatus: prefixCustomer + "/ma/update/status",
    detailMA: prefixCustomer + "/ma/detail",
    updateConfigNode: prefixCustomer + "/ma/update-config",
    listCustomer: prefixCustomer + "/maCustomer/customers",
    listCustomerByType: prefixCustomer + "/ma/customer/get",
    listCustomerByCareer: prefixCustomer + "/ma/statistic/custCareer",
    listCustomerByCustGroup: prefixCustomer + "/ma/statistic/custGroup",
    listCustomerByCustCard: prefixCustomer + "/ma/statistic/custCard",
    listCustomerByDate: prefixCustomer + "/ma/statistic/byDate",
    detailCustomer: prefixCustomer + "/maCustomer/result",
    deleteCustomer: prefixCustomer + "/maCustomer/delete",
    updateMapping: prefixCustomer + "/maMapping/update",
    detailMapping: prefixCustomer + "/maMapping/get",
  },

  // chiến dịch bán hàng
  campaignMarketing: {
    list: prefixCustomer + "/marketing/list",
    update: prefixCustomer + "/marketing/update",
    updateStatus: prefixCustomer + "/marketing/update/status",
    detail: prefixCustomer + "/marketing/get",
    delete: prefixCustomer + "/marketing/delete",
  },

  //TODO: Start quy trình bpm
  businessProcess: {
    list: prefixBpm + "/businessProcess/list",
    clone: prefixBpm + "/businessProcess/clone",
    update: prefixBpm + "/businessProcess/update",
    get: prefixBpm + "/businessProcess/get",
    detail: prefixBpm + "/businessProcess/detail",
    delete: prefixBpm + "/businessProcess/delete",

    addNode: prefixBpm + "/businessProcess/configNode/update",
    deleteNode: prefixBpm + "/businessProcess/node/delete",

    updateLinkNode: prefixBpm + "/businessProcess/updateConfig",

    //lấy danh sách các bước
    listStep: prefixBpm + "/workflow/list",
    //thêm các bước
    updateStep: prefixBpm + "/workflow/update",
    //xoas các bước
    deleteStep: prefixBpm + "/workflow/delete",
    //lấy danh sách item workflow ở step
    listWorkflow: prefixBpm + "/workflowStatus/list",
    listWorkflowCloud: prefixCustomer + "/workflowStatus/list",
    deleteWorkflow: prefixBpm + "/workflowStatus/delete",

    //update sla
    updateSLA: prefixBpm + "/businessProcess/update/sla",

    //bpmaddNode
    bpmAddNode: prefixBpm + "/bpmConfigNode/update",
    bpmAddNameNode: prefixBpm + "/bpmConfigNode/update/name",
    bpmDeleteNode: prefixBpm + "/bpmConfigNode/delete",
    bpmListNode: prefixBpm + "/bpmConfigNode/list",
    bpmDetailNode: prefixBpm + "/bpmConfigNode/get",
    //bpmaddLinkNode
    bpmAddLinkNode: prefixBpm + "/bpmConfigLinkNode/update",
    bpmAddNameLinkNode: prefixBpm + "/bpmConfigLinkNode/update/name",
    bpmDeleteLinkNode: prefixBpm + "/bpmConfigLinkNode/delete",
    bpmAddLinkNodeConfig: prefixBpm + "/bpmConfigLinkNode/update/config",
    bpmGetLinkNode: prefixBpm + "/bpmConfigLinkNode/get",
    //save diagram
    saveDiagram: prefixBpm + "/businessProcess/update/config",
    //get diagram
    getDetailDiagram: prefixBpm + "/businessProcess/get",

    //Lấy về biến quy trình
    listVariableDeclare: prefixBpm + "/variableDeclare/list",
    updateVariableDeclare: prefixBpm + "/variableDeclare/update",
    detailVariableDeclare: prefixBpm + "/variableDeclare/get",
    deleteVariableDeclare: prefixBpm + "/variableDeclare/delete",

    //Lấy về giá trị biến quy trình
    listVariableInstance: prefixBpm + "/variableInstance/list",

    //Lấy về toàn bộ biến quy trình
    listVariableDeclareGlobal: prefixBpm + "/variableDeclare/list/global",

    //user task
    updateUserTask: prefixBpm + "/bpmForm/update",
    detailUserTask: prefixBpm + "/bpmForm/get",
    cloneUserTask: prefixBpm + "/userTask/clone",
    //clone form mapping
    cloneFormMapping: prefixBpm + "/formMapping/clone",
    //list trường trong form
    listBpmForm: prefixBpm + "/bpmForm/list",
    //Lấy về toàn bộ trường trong quy trình
    listBpmFormGlobal: prefixBpm + "/bpmForm/list/global",
    //Lấy về list giá trị form quy trình
    listBpmFormData: prefixBpm + "/bpmFormData/list",
    //Lấy về cụ thể giá trị form quy trình
    getBpmFormDataByNodeId: prefixBpm + "/bpmFormData/getByNodeId",
    //list trường trong form để mapping
    listBpmFormMapping: prefixBpm + "/bpmForm/list/mapping",
    //service task
    updateServiceTask: prefixBpm + "/serviceTask/update",
    detailServiceTask: prefixBpm + "/serviceTask/get",
    cloneServiceTask: prefixBpm + "/serviceTask/clone",
    //script task
    updateScriptTask: prefixBpm + "/scriptTask/update",
    detailScriptTask: prefixBpm + "/scriptTask/get",
    cloneScriptTask: prefixBpm + "/scriptTask/clone",
    //manual task
    updateManualTask: prefixBpm + "/manualTask/update",
    detailManualTask: prefixBpm + "/manualTask/get",
    cloneManualTask: prefixBpm + "/manualTask/clone",
    //business rule task
    updateBusinessRuleTask: prefixBpm + "/businessRuleTask/update",
    updateBusinessRuleTaskAdvance: prefixBpm + "/decisionTable/update",
    updateBusinessRuleTaskComplex: prefixBpm + "/bpmAssignmentRule/update",
    detailBusinessRuleTask: prefixBpm + "/businessRuleTask/get",
    updatePickMode: prefixBpm + "/decisionTable/update/pickMode",
    cloneBusinessRuleTask: prefixBpm + "/businessRuleTask/clone",
    detailBusinessRuleTaskAdvance: prefixBpm + "/decisionTable/get",
    detailBusinessRuleTaskComplex: prefixBpm + "/bpmAssignmentRule/get",
    checkType: prefixBpm + "/businessRuleTask/checkType",
    checkTypeOLA: prefixBpm + "/ola/checkType",
    //send task
    updateSendTask: prefixBpm + "/sendTask/update",
    detailSendTask: prefixBpm + "/sendTask/get",
    cloneSendTask: prefixBpm + "/sendTask/clone",
    //Message Intermediate Throw Event
    updateMessageIntermediateThrowEvent: prefixBpm + "/messageIntermediateThrowEvent/update",
    detailMessageIntermediateThrowEvent: prefixBpm + "/messageIntermediateThrowEvent/get",
    cloneMessageIntermediateThrowEvent: prefixBpm + "/messageIntermediateThrowEvent/clone",
    //Message Intermediate Catch Event
    updateMessageIntermediateCatchEvent: prefixBpm + "/messageIntermediateCatchEvent/update",
    detailMessageIntermediateCatchEvent: prefixBpm + "/messageIntermediateCatchEvent/get",
    cloneMessageIntermediateCatchEvent: prefixBpm + "/messageIntermediateCatchEvent/clone",
    //receive task
    updateReceiveTask: prefixBpm + "/receiveTask/update",
    detailReceiveTask: prefixBpm + "/receiveTask/get",
    cloneReceiveTask: prefixBpm + "/receiveTask/clone",
    //call activity
    updateCallActivityTask: prefixBpm + "/callActivity/update",
    detailCallActivityTask: prefixBpm + "/callActivity/get",
    cloneCallActivityTask: prefixBpm + "/callActivity/clone",
    //parallel gateway
    updateParallelGateway: prefixBpm + "/parallelGateway/update",
    detailParallelGateway: prefixBpm + "/parallelGateway/get",
    cloneParallelGateway: prefixBpm + "/parallelGateway/clone",
    //exclusive gateway
    updateExclusiveGateway: prefixBpm + "/exclusiveGateway/update",
    detailExclusiveGateway: prefixBpm + "/exclusiveGateway/get",
    cloneExclusiveGateway: prefixBpm + "/exclusiveGateway/clone",
    //inclusive gateway
    updateInclusiveGateway: prefixBpm + "/inclusiveGateway/update",
    detailInclusiveGateway: prefixBpm + "/inclusiveGateway/get",
    cloneInclusiveGateway: prefixBpm + "/inclusiveGateway/clone",
    //complex gateway
    updateComplexGateway: prefixBpm + "/complexGateway/update",
    detailComplexGateway: prefixBpm + "/complexGateway/get",
    cloneComplexGateway: prefixBpm + "/complexGateway/clone",
    //complex gateway
    updateSubprocess: prefixBpm + "/subprocess/update",
    detailSubprocess: prefixBpm + "/subprocess/get",
    cloneSubprocess: prefixBpm + "/subprocess/clone",
    //timer start event
    updateTimerStartEvent: prefixBpm + "/timerTask/update",
    detailTimerStartEvent: prefixBpm + "/timerTask/get",
    cloneTimerStartEvent: prefixBpm + "/timerTask/clone",
    //timer intermediate catch event
    updateTimerIntermediateCatchEvent: prefixBpm + "/timerIntermediate/update",
    detailTimerIntermediateCatchEvent: prefixBpm + "/timerTask/get",
    cloneTimerIntermediateCatchEvent: prefixBpm + "/timerTask/clone",
    //start event
    updateStartTaskEvent: prefixBpm + "/startTask/update",
    detailStartTaskEvent: prefixBpm + "/startTask/get",
    cloneStartTaskEvent: prefixBpm + "/startTask/clone",
    //message start event
    updateStartMessageEvent: prefixBpm + "/messageStartEvent/update",
    detailStartMessageEvent: prefixBpm + "/messageStartEvent/get",
    cloneStartMessageEvent: prefixBpm + "/messageStartEvent/clone",
    //end event
    updateEndTaskEvent: prefixBpm + "/endTask/update",
    detailEndTaskEvent: prefixBpm + "/endTask/get",
    cloneEndTaskEvent: prefixBpm + "/endTask/clone",

    //Escalation intermediate throw event
    updateEscalationIntermediateThrowEvent: prefixBpm + "/escalationThrowTask/update",
    detailEscalationIntermediateThrowEvent: prefixBpm + "/escalationThrowTask/get",
    cloneEscalationIntermediateThrowEvent: prefixBpm + "/escalationThrowTask/clone",

    //Escalation start event
    updateEscalationStartEvent: prefixBpm + "/escalationStartEventTask/update",
    detailEscalationStartEvent: prefixBpm + "/escalationStartEventTask/get",
    cloneEscalationStartEvent: prefixBpm + "/escalationStartEventTask/clone",

    //conditional catch intermediate
    updateConditionalCatchEventTask: prefixBpm + "/conditionalCatchEventTask/update",
    detailConditionalCatchEventTask: prefixBpm + "/conditionalCatchEventTask/get",

    //signal start event
    updateSignalStartEvent: prefixBpm + "/signalStartEvent/update",
    detailSignalStartEvent: prefixBpm + "/signalStartEvent/get",
    cloneSignalStartEvent: prefixBpm + "/signalStartEvent/clone",

    //signal end event
    updateSignalEndEvent: prefixBpm + "/signalEndEvent/update",
    detailSignalEndEvent: prefixBpm + "/signalEndEvent/get",
    cloneSignalEndEvent: prefixBpm + "/signalEndEvent/clone",

    //signal intermediate throw event
    updateSignalIntermediateThrowEvent: prefixBpm + "/signalThrowEvent/update",
    detailSignalIntermediateThrowEvent: prefixBpm + "/signalThrowEvent/get",
    cloneSignalIntermediateThrowEvent: prefixBpm + "/signalThrowEvent/clone",

    //signal intermediate catch event
    updateSignalIntermediateCatchEvent: prefixBpm + "/signalCatchEvent/update",
    detailSignalIntermediateCatchEvent: prefixBpm + "/signalCatchEvent/get",
    cloneSignalIntermediateCatchEvent: prefixBpm + "/signalCatchEvent/clone",

    //conditional start event
    updateConditionalStartEvent: prefixBpm + "/conditionalStartEventTask/update",
    detailConditionalStartEvent: prefixBpm + "/conditionalStartEventTask/get",

    //Compensation Intermediate throw event
    updateCompensationIntermediateThrowEvent: prefixBpm + "/compensationIntermediateThrowEvent/update",
    detailCompensationIntermediateThrowEvent: prefixBpm + "/compensationIntermediateThrowEvent/get",
    cloneCompensationIntermediateThrowEvent: prefixBpm + "/compensationIntermediateThrowEvent/clone",
    getCompensationRef: prefixBpm + "/bpmConfigNode/list/compensation",

    //Compensation End Event
    updateCompensationEndEvent: prefixBpm + "/compensationEndEvent/update",
    detailCompensationEndEvent: prefixBpm + "/compensationEndEvent/get",
    cloneCompensationEndEvent: prefixBpm + "/compensationEndEvent/clone",

    //Terminate end event
    updateTerminateEndEvent: prefixBpm + "/terminateEndEvent/update",
    detailTerminateEndEvent: prefixBpm + "/terminateEndEvent/get",
    cloneTerminateEndEvent: prefixBpm + "/terminateEndEvent/clone",

    //Error end event
    updateErrorEndEvent: prefixBpm + "/errorEndEvent/update",
    detailErrorEndEvent: prefixBpm + "/errorEndEvent/get",
    cloneErrorEndEvent: prefixBpm + "/errorEndEvent/clone",

    //error start event
    updateErrorStartEvent: prefixBpm + "/errorStartEvent/update",
    detailErrorStartEvent: prefixBpm + "/errorStartEvent/get",
    cloneErrorStartEvent: prefixBpm + "/errorStartEvent/clone",

    //link catch intermediate
    updateLinkCatchEventTask: prefixBpm + "/linkEvent/update",
    detailLinkCatchEventTask: prefixBpm + "/linkCatchEvent/get",

    //message end event
    updateEndMessageEvent: prefixBpm + "/messageEndEvent/update",
    detailEndMessageEvent: prefixBpm + "/messageEndEvent/get",
    cloneEndMessageEvent: prefixBpm + "/messageEndEvent/clone",
    //bpm participant
    updateBpmParticipant: prefixBpm + "/bpmParticipant/update",
    getBpmParticipant: prefixBpm + "/bpmParticipant/get",

    //Lấy về danh sách luồng tới
    listLinkTo: prefixBpm + "/bpmConfigLinkNode/list",

    //Lấy về danh sách luồng ra
    listLinkForm: prefixBpm + "/bpmConfigLinkNode/list/from",

    //handle task
    updateHandleTask: prefixBpm + "/bpmForm/activate",

    //handle task init
    updateHandleTaskInit: prefixBpm + "/bpmForm/init",

    //tạo ycms
    purchaseRequestApprove: prefixBpm + "/purchaseRequest/approve",

    //handle task lưu nháp
    updateHandleTaskDraft: prefixBpm + "/bpmForm/draft",

    //tạo ycms lưu nháp
    purchaseRequestDraft: prefixBpm + "/purchaseRequest/draft",

    //lấy về dữ liệu khởi tạo của form xử lý task
    getDataForm: prefixBpm + "/bpmEngine/form",

    //lấy về lịch sử đối tượng trong quy trình
    getProcessedObjectLog: prefixBpm + "/processedObjectLog/list",

    //Mô phỏng quy trình
    listBpmTrigger: prefixBpm + "/bpmTrigger/list",
    activeBpmTrigger: prefixBpm + "/bpmTrigger/activate",

    //lịch sử xử lý
    processedObjectLog: prefixBpm + "/processedObjectLog/list",
    processedObjectLogPage: prefixBpm + "/processedObjectLog/list/page",

    //OLA, SLA
    updateServiceLevel: prefixBpm + "/serviceLevel/update",
    listServiceLevel: prefixBpm + "/serviceLevel/list",
    updateHistoryOLA: prefixBpm + "/serviceLevelHistory/insert",
    listHistoryOLA: prefixBpm + "/serviceLevelHistory/getHistory",

    //Tiếp nhận xử lý
    receiveProcessedObjectLog: prefixBpm + "/processedObjectLog/receive",

    //Tạm dừng xử lý
    onholdProcessedObjectLog: prefixBpm + "/processedObjectLog/onhold",

    //Tiếp tục xử lý
    onContinue: prefixBpm + "/workOrder/update/continue",

    //Thu hồi công việc:
    onWorkRecall: prefixBpm + "/workOrder/recall",
    onCheckWorkResult: prefixBpm + "/workOrder/recall/checkResult",
    confirmWorkRecall: prefixBpm + "/workOrder/recall/confirm",

    //lấy về các node của một quy trình để debug
    debugListNodeProcess: prefixBpm + "/bpmConfigNode/list/children",

    //lấy về các node bắt đầu của một quy trình để debug
    debugListNodeStartProcess: prefixBpm + "/bpmConfigNode/list",

    //lấy về các link của một quy trình để debug
    debugListLinkNodeProcess: prefixBpm + "/bpmConfigLinkNode/list/children",
    // debugListLinkNodeProcess: prefixBpm + "/bpmConfigLinkNode/list/from",

    //lấy danh sách bước (node) để từ chối rồi quay lại
    listNodeHistory: prefixBpm + "/bpmConfigNode/list/history",

    //Thêm cột trong grid
    addArtifactGrid: prefixBpm + "/artifactGird/add",
    getArtifactGrid: prefixBpm + "/artifactGird/get",

    //Timer
    updateTimer: prefixBpm + "/bpmForm/update/timer",
    // getTimer: prefixBpm + "/bpmForm/get/timer",

    //Type
    updateType: prefixBpm + "/bpmForm/update/type",

    //Thêm artifact vào list để cấu hình
    updateArtifactMetadata: prefixBpm + "/artifactMetadata/update",
    listArtifactMetadata: prefixBpm + "/artifactMetadata/list",
    getArtifactMetadata: prefixBpm + "/artifactMetadata/get",
    deleteArtifactMetadata: prefixBpm + "/artifactMetadata/delete",

    //thêm cấu trúc hồ sơ
    updateBpmObject: prefixBpm + "/bpmObject/update",
    detailBpmObject: prefixBpm + "/bpmObject/getByProcessId",

    // show log lỗi của quy trình
    getErrorLogData: prefixBpm + "/findByCriteria",

    //export data process
    exportDataProcess: prefixBpm + "/businessProcess/exportExcel",

    //api lấy về link url để tải file
    getUrlExportDataProcess: prefixBpm + "/businessProcess/exportExcel/status",

    //import data process
    importDataProcess: prefixBpm + "/businessProcess/importExcel",

    // state
    listState: prefixBpm + "/stateMapping/list",
    createState: prefixBpm + "/stateMapping/update",
    updateState: prefixBpm + "/stateMapping/update",
    deleteState: prefixBpm + "/stateMapping/delete",
  },

  bpmForm: {
    lst: prefixBpm + "/bpmForm/list",
    update: prefixBpm + "/bpmForm/update",
    delete: prefixBpm + "/bpmForm/delete",
  },

  bpmFormProcess: {
    lst: prefixBpm + "/bpmFormProcess/list",
    update: prefixBpm + "/bpmFormProcess/update",
    detail: prefixBpm + "/bpmFormProcess/get",
    delete: prefixBpm + "/bpmFormProcess/delete",
  },

  bpmParticipant: {
    lst: prefixBpm + "/bpmParticipant/list",
    update: prefixBpm + "/bpmParticipant/update",
    detail: prefixBpm + "/bpmParticipant/get",
    delete: prefixBpm + "/bpmParticipant/delete",
  },

  bpmEformMapping: {
    lstSource: prefixBpm + "/eformMapping/list/source",
    update: prefixBpm + "/eformMapping/update",
    detail: prefixBpm + "/eformMapping/get",
    delete: prefixBpm + "/eformMapping/delete",

    lstEform: prefixCustomer + "/bpm/list/eform",
  },

  bpmFormMapping: {
    list: prefixBpm + "/formMapping/list",
    listSource: prefixBpm + "/formMapping/list/source",
    listTarget: prefixBpm + "/formMapping/list/target",
    update: prefixBpm + "/formMapping/update",
    detail: prefixBpm + "/formMapping/get",
    delete: prefixBpm + "/formMapping/delete",
  },

  rest: {
    callApi: prefixBpm + "/rest/call",
  },

  bpmFormArtifact: {
    lst: prefixBpm + "/bpmFormArtifact/list",
    detail: prefixBpm + "/bpmFormArtifact/get",
    update: prefixBpm + "/bpmFormArtifact/update",
    updatePosition: prefixBpm + "/bpmFormArtifact/update/position",
    updateConfig: prefixBpm + "/bpmFormArtifact/update/config",
    updateEform: prefixBpm + "/bpmFormArtifact/update/eform",
    delete: prefixBpm + "/bpmFormArtifact/delete",
  },

  // Các API liên quan tới quản lý tài liệu
  document: {
    lst: prefixBpm + "/document/list",
    update: prefixBpm + "/document/update",
    delete: prefixBpm + "/document/delete",
    detail: prefixBpm + "/document/detail",
    deleteByUrl: prefixBpm + "/document/delete/byUrl",
  },
  purchaseRequest: {
    list: prefixCs + "/purchase-request/list",
    listReport: prefixCs + "/report/purchase-request/list",
    update: prefixCs + "/purchase-request/update",
    collect: prefixCs + "/purchase-request/send/jssdk",
    detail: prefixCs + "/purchase-request/get",
    delete: prefixCs + "/purchase-request/delete",
    viewer: prefixCs + "/purchase-request/viewer",
    updateStatus: prefixCs + "/purchase-request/update/status",
    purchaseRequestExchangeList: prefixCs + "/purchase-requestExchange/list",
    purchaseRequestExchangeUpdate: prefixCs + "/purchase-requestExchange/update",
    purchaseRequestExchangeDelete: prefixCs + "/purchase-requestExchange/delete",
    purchaseRequestProcess: prefixCs + "/purchase-request/update/process",
    resetTransferVotes: prefixCs + "/supportObject/reset",
    statisticStatus: prefixCs + "/purchase-request/statistic/status",
    statisticStatusByDate: prefixCs + "/purchase-request/statistic/status/by-date",
    statisticList: prefixCs + "/purchase-request/list-statistic",
    purchaseCategory: prefixCs + "/product-category/list",
    purchaseProduct: prefixCs + "/product/list",
    paymentBill: prefixCs + "/purchase-request/getJson",
    contractInfo: prefixCs + "/renewal-offer/get-information-aggregate",
    renewalContract: prefixSale + "/renewalContract/initBusinessProcess",
    initReceiveTask: prefixCs + "/purchase-request/init-receive-task",
    updateCertificate: prefixCs + "/purchase-request/updateCertificate",
    getJssdk: prefixSale + "/contract-insurance/get/jssdk",
    getProductJssdk: prefixCs + "/product/get/jssdk",
  },
  managementAsked: {
    list: prefixApplication + "/clarificationRequest/list",
    update: prefixApplication + "/clarificationRequest/update",
    detail: prefixApplication + "/clarificationRequest/get",
    delete: prefixApplication + "/clarificationRequest/delete",

    //trả lời yêu cầu làm rõ
    replyAsked: prefixApplication + "/clarificationResponse/update",

    //chia yêu cầu làm rõ cho nhanh viên
    assignRequest: prefixApplication + "/clarificationRequest/assign",

    //lưu thông tin câu trả lời
    saveReply: prefixApplication + "/clarificationResponse/update",
    getDetailReply: prefixApplication + "/clarificationResponse/get",

    //lấy danh sách câu trả lời của 1 gói thầu
    getRepsonseList: prefixApplication + "/clarificationResponse/list",

    //gửi câu trả lời làm rõ
    insertRepsonse: prefixApplication + "/clarificationResponse/insert",
  },
  grid: {
    list: prefixCustomer + "/artifactGridHeader/list",

    //Thêm cột
    update: prefixBpm + "/artifactGridHeader/update",
    detail: prefixBpm + "/artifactGridHeader/get",
    delete: prefixBpm + "/artifactGridHeader/delete",

    //Thêm hàng
    updateRow: prefixBpm + "/artifactGrid/update",
    detailRow: prefixBpm + "/artifactGrid/get",
    deleteRow: prefixBpm + "/artifactGrid/delete",

    importFile: prefixBpm + "/upload/excelFile",

    //Thêm hàng
    updateComment: prefixBpm + "/artifactComment/update",
    listComment: prefixBpm + "/artifactComment/list",

    //Lấy lữ liệu upload
    getRowsUpload: prefixBpm + "/upload/getRows",
  },
  //TODO: End quy trình bpm

  //ngân sách marketing
  marketingBudget: {
    list: prefixCustomer + "/marketingBudget/list",
    update: prefixCustomer + "/marketingBudget/update",
    updateStatus: prefixCustomer + "/marketingBudget/update/status",
    detail: prefixCustomer + "/marketingBudget/get",
    delete: prefixCustomer + "/marketingBudget/delete",
  },

  //kênh MA
  marketingChannel: {
    list: prefixCustomer + "/marketingChannel/list",
    update: prefixCustomer + "/marketingChannel/update",
    detail: prefixCustomer + "/marketingChannel/get",
    delete: prefixCustomer + "/marketingChannel/delete",
  },

  //đo lường MA
  marketingMeasurement: {
    list: prefixCustomer + "/marketingMeasurement/list",
    update: prefixCustomer + "/marketingMeasurement/update",
    detail: prefixCustomer + "/marketingMeasurement/get",
    delete: prefixCustomer + "/marketingMeasurement/delete",
  },

  //đo lường MA
  marketingReport: {
    list: prefixCustomer + "/marketingReport/list",
    update: prefixCustomer + "/marketingReport/update",
    detail: prefixCustomer + "/marketingReport/get",
    delete: prefixCustomer + "/marketingReport/delete",
  },

  // tiếp nhận phản hồi
  feedback: {
    lst: prefixCustomer + "/feedback/list/all",
    update: prefixCustomer + "/feedback/update",
    delete: prefixCustomer + "/feedback/delete",
    changeStatus: prefixCustomer + "/feedback/update/status",
  },

  // chat bot
  chatbot: {
    lst: prefixCustomer + "/chatlog/list",
    update: prefixCustomer + "/chatgpt/chat",
  },

  objectFeature: {
    lst: prefixCustomer + "/objectFeature/list",
    update: prefixCustomer + "/objectFeature/update",
    delete: prefixCustomer + "/objectFeature/delete",
    detail: prefixCustomer + "/objectFeature/detail",
  },

  // Khảo sát khách hàng
  surveyForm: {
    lst: prefixCustomer + "/surveyForm/list",
    update: prefixCustomer + "/surveyForm/update",
    delete: prefixCustomer + "/surveyForm/delete",
    detail: prefixCustomer + "/surveyForm/get",
    statistic: prefixCustomer + "/survey",
    submitVoc: "https://reborn.vn/log-capture/crm/survey",
  },

  //báo giá
  offer: {
    list: prefixCustomer + "/offer/list/v2",
    create: prefixCustomer + "/offer/create",
    offerDetail: prefixCustomer + "/offerDetail/import",
    cardService: prefixCustomer + "/offerDetail/cardService",
    // Tạo báo giá
    offerDetailCustomer: prefixCustomer + "/offerDetail/customer",
    // Xem chi tiết báo giá
    offerDetailList: prefixCustomer + "/offerDetail/list",
    // Hủy báo giá
    cancelOffer: prefixCustomer + "/offer/delete",
    // lấy danh sách thu tiền, chi tiền của khách
    debtOffer: prefixCustomer + "/offer/debt",
    // lưu tạm hóa đơn
    temporarilyOffer: prefixCustomer + "/offer/update/temp",
  },

  offerService: {
    addToInvoice: prefixCustomer + "/offerService/update",
    delete: prefixCustomer + "/offerService/delete",
    update: prefixCustomer + "/offerService/update",
    detail: prefixCustomer + "/offerService/get",
    getByCustomer: prefixCustomer + "/offerService/getBoughtServiceByCustomerId",
  },
  offerProduct: {
    list: prefixCustomer + "/offerProduct/list",
    addToInvoice: prefixCustomer + "/offerProduct/update",
    delete: prefixCustomer + "/offerProduct/delete",
    update: prefixCustomer + "/offerProduct/update",
    detail: prefixCustomer + "/offerProduct/get",
    getByCustomer: prefixCustomer + "/offerProduct/getBoughtProductByCustomerId",
  },
  offerCard: {
    list: prefixCustomer + "/offerCardService/list",
    add: prefixCustomer + "/offerCardService/update",
    delete: prefixCustomer + "/offerCardService/delete",
    update: prefixCustomer + "/offerCardService/update/cardNumber",
  },

  // fs
  fs: {
    lst: prefixCustomer + "/fs/list",
    update: prefixCustomer + "/fs/update",
    updateAndInit: prefixCustomer + "/fs/update-and-init",
    delete: prefixCustomer + "/fs/delete",
    detail: prefixCustomer + "/fs/get",
    cloneFs: prefixCustomer + "/fs/clone",
    updateStatus: prefixCustomer + "/fs/update/status",
    resetSignal: prefixCustomer + "/approvalObject/reset",
    // cấu hình form fs
    fsFormLst: prefixCustomer + "/fsForm/list",
    fsFormUpdate: prefixCustomer + "/fsForm/update",
    fsFormDelete: prefixCustomer + "/fsForm/delete",
    fsFormUpdatePostion: prefixCustomer + "/fsForm/update/position",
  },

  // quote
  quote: {
    lst: prefixCustomer + "/quote/list",
    update: prefixCustomer + "/quote/update",
    delete: prefixCustomer + "/quote/delete",
    cloneQuote: prefixCustomer + "/quote/clone",
    updateStatus: prefixCustomer + "/quote/update/status",
    resetSignal: prefixCustomer + "/approvalObject/reset",
    // cấu hình form quote
    quoteFormLst: prefixCustomer + "/quoteForm/list",
    quoteFormUpdate: prefixCustomer + "/quoteForm/update",
    quoteFormDelete: prefixCustomer + "/quoteForm/delete",
    quoteFormUpdatePostion: prefixCustomer + "/quoteForm/update/position",

    lstQuoteContract: prefixCustomer + "/contractQuote/list",
    updateQuoteContract: prefixCustomer + "/contractQuote/update",
    deleteQuoteContract: prefixCustomer + "/contractQuote/deleteByQuoteId",
  },

  /**
   * Lịch sử phê duyệt trên form
   */
  approvedObjectLog: {
    lst: prefixBpm + "/approvedObjectLog/list",
  },

  // cài đặt quy trình
  approval: {
    lst: prefixCustomer + "/approval/list",
    update: prefixCustomer + "/approval/update",
    delete: prefixCustomer + "/approval/delete",
    updateStatus: prefixCustomer + "/approval/update/status",
    //config
    lstConfig: prefixCustomer + "/approvalConfig/list",
    updateConfig: prefixCustomer + "/approvalConfig/update",
    deleteConfig: prefixCustomer + "/approvalConfig/delete",
    //link
    lstLink: prefixCustomer + "/approvalLink/list",
    updateLink: prefixCustomer + "/approvalLink/update",
    deleteLink: prefixCustomer + "/approvalLink/delete",
    //object
    lstObject: prefixCustomer + "/approvalObject/list",
    updateObject: prefixCustomer + "/approvalObject/update",
    deleteObject: prefixCustomer + "/approvalObject/delete",
    takeObject: prefixCustomer + "/approvalObject/get/object",
    checkApproved: prefixCustomer + "/approvalObject/checkApproved",
    //log
    lstLog: prefixCustomer + "/approvalLog/list",
    updateLog: prefixCustomer + "/approvalLog/update",
    deleteLog: prefixCustomer + "/approvalLog/delete",

    //alert
    updateAlert: prefixCustomer + "/approval/update/alertConfig",
  },
  // đoạn này lấy ra danh sách các gói
  package: {
    list: prefixRebornVn + "/package/list",
    update: prefixRebornVn + "/package/update",
    updateStatus: prefixRebornVn + "/package/update/status",
    detail: prefixRebornVn + "/package/get",
    delete: prefixRebornVn + "/package/delete",
    addOrgApp: prefixRebornVn + "/orgApp/add",
    updateBill: prefixRebornVn + "/orgApp/update/bill",
    calcPrice: prefixRebornVn + "/orgApp/calc/priceRemaining",
    extend: prefixRebornVn + "/orgApp/extend",
    upgrade: prefixRebornVn + "/orgApp/upgrade",
  },

  field: {
    list: prefixRebornVn + "/field/list",
    update: prefixRebornVn + "/field/update",
    detail: prefixRebornVn + "/field/get",
    delete: prefixRebornVn + "/field/delete",
  },
  gift: {
    list: prefixCustomer + "/gift/list",
    update: prefixCustomer + "/gift/update",
    updateObjectId: prefixCustomer + "/gift/update_objectid",
    delete: prefixCustomer + "/gift/delete",
  },
  // đoạn này tạo ra mã qr code
  qrCode: {
    list: prefixCustomer + "/qrCode/list",
    update: prefixCustomer + "/qrCode/update",
    delete: prefixCustomer + "/qrCode/delete",
    detail: prefixCustomer + "/qrCode/get",
  },
  // cài đặt mẫu hợp đồng
  sheetQuoteForm: {
    list: prefixCustomer + "/sheet/list",
    update: prefixCustomer + "/sheet/update",
    delete: prefixCustomer + "/sheet/delete",
    detail: prefixCustomer + "/sheet/get",
  },
  sheetFieldQuoteForm: {
    list: prefixCustomer + "/sheetField/list",
    update: prefixCustomer + "/sheetField/update",
    updatePosition: prefixCustomer + "/sheetField/update/position",
    delete: prefixCustomer + "/sheetField/delete",
    detail: prefixCustomer + "/sheetField/get",
  },

  ///BPM

  common: {
    list: prefixCustomer + "/common/list",
    update: prefixCustomer + "/common/update",
    detail: prefixBpm + "/common/get",
    delete: prefixCustomer + "/common/delete",
  },

  processedObject: {
    lst: prefixBpm + "/processedObject/list",
    update: prefixBpm + "/processedObject/update",
    updateProcess: prefixBpm + "/processedObject/update/processId",
    updateProcessInstance: prefixBpm + "/processInstance/update",
    delete: prefixBpm + "/processedObject/delete",
    cloneQuote: prefixBpm + "/processedObject/clone",
    updateStatus: prefixBpm + "/processedObject/update/status",
    resetSignal: prefixBpm + "/approvalObject/reset",

    bpmStart: prefixBpm + "/bpm/start",
    bpmExecListNode: prefixBpm + "/bpm/exec/list/node",
    bpmProcess: prefixBpm + "/bpm/process",
    bpmArtifactData: prefixBpm + "/bpmArtifactData/getByBfatId",
    bpmParticipantProcesslog: prefixBpm + "/bpmParticipantProcesslog/list",
    processedObjectLog: prefixBpm + "/processedObjectLog/list",
  },

  objectGroup: {
    list: prefixBpm + "/objectGroup/list",
    update: prefixBpm + "/objectGroup/update",
    updateConfig: prefixBpm + "/objectGroup/update/config",
    detail: prefixBpm + "/objectGroup/get",
    delete: prefixBpm + "/objectGroup/delete",
  },

  objectAttribute: {
    list: prefixBpm + "/objectAttribute/list",
    update: prefixBpm + "/objectAttribute/update",
    detail: prefixBpm + "/objectAttribute/get",
    delete: prefixBpm + "/objectAttribute/delete",
    listAll: prefixBpm + "/objectAttribute/listAll",
    checkDuplicated: prefixBpm + "/objectAttribute/checkDuplicated",
    updatePosition: prefixBpm + "/objectAttribute/update/position",
  },
  objectExtraInfo: {
    list: prefixCustomer + "/objectExtraInfo/list",
  },

  //Tài chính ngân hàng
  netLoan: {
    lst: prefixFinance + "/netLoan/list",
    update: prefixFinance + "/netLoan/update",
    get: prefixFinance + "/netLoan/get",
    delete: prefixFinance + "/netLoan/delete",
  },
  netDeposit: {
    lst: prefixFinance + "/netDeposit/list",
    update: prefixFinance + "/netDeposit/update",
    get: prefixFinance + "/netDeposit/get",
    delete: prefixFinance + "/netDeposit/delete",
  },
  netServiceCharge: {
    lst: prefixFinance + "/netServiceCharge/list",
    update: prefixFinance + "/netServiceCharge/update",
    get: prefixFinance + "/netServiceCharge/get",
    delete: prefixFinance + "/netServiceCharge/delete",
  },
  productDemand: {
    lst: prefixFinance + "/productDemand/list",
    update: prefixFinance + "/productDemand/update",
    get: prefixFinance + "/productDemand/get",
    delete: prefixFinance + "/productDemand/delete",
  },
  briefFinancialReport: {
    lst: prefixFinance + "/briefFinancialReport/list",
    update: prefixFinance + "/briefFinancialReport/update",
    get: prefixFinance + "/briefFinancialReport/get",
    delete: prefixFinance + "/briefFinancialReport/delete",
  },
  fullFinancialReport: {
    lst: prefixFinance + "/fullFinancialReport/list",
    update: prefixFinance + "/fullFinancialReport/update",
    get: prefixFinance + "/fullFinancialReport/get",
    delete: prefixFinance + "/fullFinancialReport/delete",
  },
  loanInformation: {
    lst: prefixFinance + "/loanInformation/list",
    update: prefixFinance + "/loanInformation/update",
    get: prefixFinance + "/loanInformation/get",
    delete: prefixFinance + "/loanInformation/delete",
  },
  transactionInformation: {
    lst: prefixFinance + "/transactionInformation/list",
    update: prefixFinance + "/transactionInformation/update",
    get: prefixFinance + "/transactionInformation/get",
    delete: prefixFinance + "/transactionInformation/delete",
  },

  application: {
    lst: prefixRebornVn + "/orgApp/list",
    lstAll: prefixRebornVn + "/orgApp/list/all",
    confirmBill: prefixRebornVn + "/orgApp/payment/verify",
    update: prefixRebornVn + "/organization/update",
    detail: prefixRebornVn + "/beautySalon/get",
  },
};

export const urls = {
  dashboard: "/dashboard",
  manager_work: "/manager_work",
  //Lĩnh vực BĐS - Đầu mối liên hệ
  contact: "/contact",
  customer: "/customer",
  customer_sms: "/customer_sms",
  customer_segment: "/customer_segment",
  detail_person: "/detail_person/customerId/:id?/:type",

  //Đối tác
  partner: "/partner",
  detail_partner: "/detail_partner/partnerId/:id?",

  schedule: "/schedule",
  timekeeping: "/timekeeping",
  cashbook: "/cashbook",
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
  // đường dẫn bán hàng
  sell: "/sell",
  contract: "/contract",
  offer: "/offer",
  create_contract: "/create_contract",
  create_contract_xml: "/create_contract_xml",
  edit_contract: "/edit_contract/:id?",
  edit_contract_xml: "/edit_contract_xml/:id?",
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
  warranty_process: "/warranty_process",
  collect_warranty: "/collect_warranty",
  detail_warranty: "/detail_warranty/warrantyId/:id",
  setting_warranty: "/setting_warranty",
  ticket: "/ticket",
  ticket_process: "/ticket_process",
  collect_ticket: "/collect_ticket",
  detail_ticket: "/detail_ticket/ticketId/:id",
  setting_ticket: "/setting_ticket",
  setting_sms: "/setting_sms",
  setting_call: "/setting_call",
  setting_email: "/setting_email",
  setting_zalo: "/setting_zalo",
  sms_marketting: "/sms_marketting",
  email_marketting: "/email_marketting",
  zalo_marketting: "/zalo_marketting",
  send_email_confirm: "/send_email_confirm",
  voucher_confirm: "/voucher_confirm",
  // Setting
  setting_common: "/setting_common",
  setting_rose: "/setting_rose",
  setting_basis: "/setting_basis",
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
  order_request_list: "/order_request_list",
  order_tracking: "/order_tracking",
  // quản lý cơ hội
  management_opportunity: "/management_opportunity",
  management_opportunity_new: "/management_opportunity_new",
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
  marketing_automation_v2: "/marketing_automation_v2",
  marketing_automation: "/marketing_automation",
  create_marketing_automation: "/create_marketing_automation",
  create_marketing_automation_v2: "/create_marketing_automation_v2",
  edit_marketing_automation: "/edit_marketing_automation/:id?",
  edit_marketing_automation_v2: "/edit_marketing_automation_v2/:id?",
  marketing_automation_setting: "/marketing_automation_setting/:id",
  detail_marketing_automation: "/detail_marketing_automation/maId/:id?",

  //chiến dịch marketing
  campaign_marketing: "/campaign_marketing",

  // tiếp nhận phản hồi từ phía khách hàng
  feedback_customer: "/feedback_customer",

  // Đường dẫn nhiệm vụ BPM
  user_task_list: "/bpm/user_task_list",
  // Đường dẫn chi tiết nhiệm vụ BPM
  detail_user_task: "/bpm/user_task/detail_task/:id",

  // đoạn này dùng để test chức năng mới
  bpm: "/bpm",
  bpm_create: "/bpm/create/:id",
  manage_processes: "/manage_processes",
  manage_default_processes: "/manage_default_processes",
  process_simulation: "/process_simulation",
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
  // báo giá mới
  quoteNew: "/quoteNew",
  report_login: "/report_login",
  // Phiếu xuất kho
  create_outbound_delivery: "/create_outbound_delivery",
  outbound_invoice: "/outbound_invoice",
  inventory_transfer_document: "/inventory_transfer_document",

  //upload tài liệu bpm
  // Link cho phép tải tài liệu lên
  upload_document: "/upload_document",

  //Quản trị người dùng
  user: "/user",
  //Quản lý tổ chức
  organization: "/organization",
  //quản lý gói dịch vụ
  package_manage: "/package_manage",
  //danh sách gia hạn
  extension_list: "/extension_list",
  //quản lý lĩnh vực
  field_management: "/field_management",
  //quản lý ứng dụng (App + Edition catalog) — UC-12, UC-13
  app_management: "/app_management",
  app_edition_management: "/app_management/:appCode/edition",
  app_edition_whitelist: "/app_management/edition/:editionId/whitelist",
  //Loại luật nghiệp vụ
  business_rule: "/bpm/business_rule",
  business_rule_config: "/bpm/business_rule_config/:id",
};

export default urls;
