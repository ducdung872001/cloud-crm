const prefixAdmin = "/adminapi";
const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";
const prefixApi = "/api";
const prefixAuthenticator = "/authenticator";
const prefixSale = "/sale";
const prefixSystem = "/system";
const prefixCs = "/cs";
const prefixApplication = "/application";
const prefixHr = "/hr";
const prefixRebornVn = "https://reborn.vn/api";
const prefixOperation = "https://reborn.vn/operation";
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
    checkLogin: prefixAdmin + "/userLogin/list",
    detailTimeLogin: prefixAdmin + "/userLogin/daily/list",
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
    filter: prefixAdmin + "/customer/list_paid",
    listshared: prefixAdmin + "/customer/list_paid/shared",
    update: prefixAdmin + "/customer/update",
    telesaleCallList: prefixAdmin + "/telesaleCall/list",
    telesaleCallUpdate: prefixAdmin + "/telesaleCall/update",
    updateByField: prefixAdmin + "/customer/update/byField",
    delete: prefixAdmin + "/customer/delete",
    deleteAll: prefixAdmin + "/customer/delete",
    checkInProcess: prefixAdmin + "/customer/checkInProcess",
    link: prefixAdmin + "/customer/link_user",
    detail: prefixAdmin + "/customer/get",
    area: prefixRebornVn + "/area/child",

    // api lấy ra thông tin khách hàng dựa theo id
    listById: prefixAdmin + "/customer/list_by_id",
    // Cập nhập hàng loạt
    updateCustomerGroup: prefixAdmin + "/customer/update_batch/customer_group",
    updateOneRelationship: prefixAdmin + "/customer/update/relationship",
    updateCustomeRelationship: prefixAdmin + "/customer/update_batch/relationship",
    updateCustomerSource: prefixAdmin + "/customer/update_batch/customer_source",
    updateCustomerEmployee: prefixAdmin + "/customer/update_batch/employee",
    // Lịch điều trị
    updateScheduler: prefixAdmin + "/customerScheduler/update",
    filterScheduler: prefixAdmin + "/customerScheduler/list",
    cancelScheduler: prefixAdmin + "/customerScheduler/cancel",
    detailScheduler: prefixAdmin + "/customerScheduler/get",
    // Trao đổi
    customerExchangeList: prefixAdmin + "/customerExchange/list",
    customerExchangeUpdate: prefixAdmin + "/customerExchange/update",
    customerExchangeDelete: prefixAdmin + "/customerExchange/delete",
    // gửi sms, gửi email, gửi zalo
    customerSendSMS: prefixAdmin + "/customer/send/sms",
    customerSendEmail: prefixAdmin + "/customer/send/email",
    customerSendZalo: prefixAdmin + "/customer/send/zalo",

    parserSms: prefixAdmin + "/customer/send/sms/parser",
    parserEmail: prefixAdmin + "/customer/send/email/parser",
    parserZalo: prefixAdmin + "/customer/send/zalo/parser",
    // lấy số điện thoại khi bị che
    viewPhone: prefixAdmin + "/customer/get/phone",
    viewFullPhone: prefixAdmin + "/customer/get/phones",
    // lấy email khi bị che
    viewEmail: prefixAdmin + "/customer/get/email",

    addOther: prefixAdmin + "/customerViewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCustomerViewer: prefixAdmin + "/customerViewer/update",
    // lấy về danh sách người xem
    lstCustomerViewer: prefixAdmin + "/customerViewer/list",
    // xóa đi 1 người xem
    deleteCustomerViewer: prefixAdmin + "/customerViewer/delete",
    // thêm khách hàng vào chương trình MA
    addCustomerMA: prefixAdmin + "/maCustomer/insertList",
    // điền số lượng bản ghi muốn hiển thị
    numberFieldCustomer: prefixAdmin + "/customer/export/randomCustomers",
    // import khách hàng b2
    autoProcess: prefixAdmin + "/customer/import/autoProcess",
    // import khách hàng b3
    manualProcess: prefixAdmin + "/customer/import/manualProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/customer/import",
    // tương tác khách hàng
    customerReport: prefixAdmin + "/customerReport/summaryAction",
    // chi tiết tương tác khách hàng
    detailCustomerReport: prefixAdmin + "/customerReport/summaryAction/detail",
    // danh sách các file đã tải
    lstAttachments: prefixAdmin + "/customerExchange/attachment/list",
    // chi tiết tương tác từng khách hàng trong màn hình chi tiết khách hàng
    descCustomerReport: prefixAdmin + "/customerReport/action/list",
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
    filterTable: prefixAdmin + "/customerAttribute/listFilter",
    // lấy ra các trường, để tải dữ liệu mẫu về
    exAttributes: prefixAdmin + "/customer/export/attributes",
    // đoạn này tạo cơ hội cho khách hàng doanh nghiệp
    createOpportunity: prefixAdmin + "/opportunity/update",
    lstOpportunity: prefixAdmin + "/opportunity/list",
    deleteOpportunity: prefixAdmin + "/opportunity/delete",
    detailOpportunity: prefixAdmin + "/opportunity/get",

    // danh sách upload
    lstUpload: prefixAdmin + "/customerUpload/list",

    // api phân tích chân dung khách hàng
    classifyAge: prefixAdmin + "/api/v1/customer/classify/age",
    classifyGender: prefixAdmin + "/api/v1/customer/classify/gender",
    classifyIdentify: prefixAdmin + "/api/v1/customer/classify/identify",
    classifyTopRevenue: prefixAdmin + "/api/v1/customer/classify/topRevenue",
    classifyTopBought: prefixAdmin + "/api/v1/customer/classify/topBought",
    classifyTopValueInvoice: prefixAdmin + "/api/v1/customer/classify/topValueInvoice",
    classifyNotInteractDay: prefixAdmin + "/api/v1/customer/classify/notInteractDay",
    classifyTopInteract: prefixAdmin + "/api/v1/customer/classify/topInteract",
    classifyCampaignJoined: prefixAdmin + "/api/v1/customer/classify/campaignJoined",
    classifyCustType: prefixAdmin + "/api/v1/customer/classify/custType",
    classifyCustGroup: prefixAdmin + "/api/v1/customer/classify/custGroup",
    classifyCustSource: prefixAdmin + "/api/v1/customer/classify/custSource",
    classifyCustCareer: prefixAdmin + "/api/v1/customer/classify/custCareer",
    classifyCustArea: prefixAdmin + "/api/v1/customer/classify/custArea",
    classifyCustomerCard: prefixAdmin + "/api/v1/customer/classify/customerCard",
    classifyInteractTimes: prefixAdmin + "/api/v1/customer/classify/interactTimes",

    // gợi ý các sản phẩm/dịch vụ cho khách hàng
    serviceSuggestions: prefixAdmin + "/customerObject/list",
    // api khác để làm
    serviceSuggestionsv2: prefixAdmin + "/customerObject/getTop",

    // lấy ra các field động view nên chart
    fieldChart: prefixAdmin + "/customer/dashboard/fields",
    lstChartDynamicChart: prefixAdmin + "/customer/dashboard/list",
    updateChartDynamicChart: prefixAdmin + "/customer/dashboard/update",
    deleteChartDynamicChart: prefixAdmin + "/customer/dashboard/delete",
    detailChartDynamicChart: prefixAdmin + "/customer/dashboard/get",
    viewChartDynamicChart: prefixAdmin + "/customer/dashboard/fetchData",

    //export multi
    exportMulti: prefixAdmin + "/customer/export/multi",

    //create call tnex-athena
    loginAccountAthena: "https://api-athenaspear-prod.athenafs.io/api/v1/account/login",
    createCall: "https://api-athenaspear-prod.athenafs.io/api/v1/call-history/create-call",

    //lấy tài khoản tổng đài
    getAccountCall: prefixAdmin + "/employeeAgent/employeeId",
    reloadData: prefixAdmin + "/customer/moveToEs",

    // chia data khách hàng Tnex
    customerAssign: prefixAdmin + "/customer/assign",
  },

  // GHD api chống chế =))))))))))))
  payroll: {
    export: prefixAdmin + "/payroll/export",
  },

  partner: {
    list: prefixAdmin + "/businessPartner/list_paid",
    update: prefixAdmin + "/businessPartner/update",
    detail: prefixAdmin + "/businessPartner/get",
    delete: prefixAdmin + "/businessPartner/delete",
    downloadFile: prefixAdmin + "/businessPartner/import",
    // lấy số điện thoại khi bị che
    viewPhone: prefixAdmin + "/businessPartner/get/phone",
    // lấy email khi bị che
    viewEmail: prefixAdmin + "/businessPartner/get/email",

    numberFieldPartner: prefixAdmin + "/businessPartner/export/randomBusinessPartners",
    autoProcess: prefixAdmin + "/businessPartner/import/autoProcess",
    exAttributes: prefixAdmin + "/businessPartner/export/attributes",

    // lấy thuộc tính vào bảng filter
    filterTable: prefixAdmin + "/businessPartner/listFilter",

    // Trao đổi
    partnerExchangeList: prefixAdmin + "/businessPartnerExchange/list",
    partnerExchangeUpdate: prefixAdmin + "/businessPartnerExchange/update",
    partnerExchangeDelete: prefixAdmin + "/businessPartnerExchange/delete",
  },

  partnerExtraInfo: {
    list: prefixAdmin + "/businessPartnerExtraInfo/list",
  },

  partnerAttribute: {
    list: prefixAdmin + "/businessPartnerAttribute/list",
    update: prefixAdmin + "/businessPartnerAttribute/update",
    delete: prefixAdmin + "/businessPartnerAttribute/delete",
    listAll: prefixAdmin + "/businessPartnerAttribute/listAll",
    checkDuplicated: prefixAdmin + "/businessPartnerAttribute/checkDuplicated",
  },

  project: {
    list: prefixAdmin + "/workProject/list",
    update: prefixAdmin + "/workProject/update",
    detail: prefixAdmin + "/workProject/get",
    delete: prefixAdmin + "/workProject/delete",
  },

  projectReport: {
    report: prefixAdmin + "/cashbook/report",
  },

  // Khu vực quản lý vận hành ---
  space: {
    list: prefixOperation + "/space/list",
    update: prefixOperation + "/space/update",
    detail: prefixOperation + "/space/get",
    delete: prefixOperation + "/space/delete",
  },
  spaceType: {
    list: prefixOperation + "/spaceType/list",
    update: prefixOperation + "/spaceType/update",
    detail: prefixOperation + "/spaceType/get",
    delete: prefixOperation + "/spaceType/delete",
  },
  spaceCustomer: {
    list: prefixOperation + "/spaceCustomer/list",
    update: prefixOperation + "/spaceCustomer/update",
    detail: prefixOperation + "/spaceCustomer/get",
    delete: prefixOperation + "/spaceCustomer/delete",
  },
  ortherFee: {
    list: prefixOperation + "/otherFee/list",
    update: prefixOperation + "/otherFee/update",
    detail: prefixOperation + "/otherFee/get",
    delete: prefixOperation + "/otherFee/delete",
  },
  utilityReading: {
    list: prefixOperation + "/utilityReading/list",
    update: prefixOperation + "/utilityReading/update",
    detail: prefixOperation + "/utilityReading/get",
    delete: prefixOperation + "/utilityReading/delete",
  },
  managementFee: {
    list: prefixOperation + "/managementFee/list",
    update: prefixOperation + "/managementFee/update",
    detail: prefixOperation + "/managementFee/get",
    delete: prefixOperation + "/managementFee/delete",
  },
  vehicleRegistration: {
    list: prefixOperation + "/vehicleRegistration/list",
    update: prefixOperation + "/vehicleRegistration/update",
    detail: prefixOperation + "/vehicleRegistration/get",
    delete: prefixOperation + "/vehicleRegistration/delete",
  },
  vehicle: {
    list: prefixOperation + "/vehicle/list",
    update: prefixOperation + "/vehicle/update",
    detail: prefixOperation + "/vehicle/get",
    delete: prefixOperation + "/vehicle/delete",
  },
  building: {
    list: prefixOperation + "/building/list",
    update: prefixOperation + "/building/update",
    detail: prefixOperation + "/building/get",
    delete: prefixOperation + "/building/delete",
  },
  buildingFloor: {
    list: prefixOperation + "/buildingFloor/list",
    update: prefixOperation + "/buildingFloor/update",
    detail: prefixOperation + "/buildingFloor/get",
    delete: prefixOperation + "/buildingFloor/delete",
  },
  operationProject: {
    list: prefixOperation + "/project/list",
    update: prefixOperation + "/project/update",
    detail: prefixOperation + "/project/get",
    delete: prefixOperation + "/project/delete",
  },
  electricityMeter: {
    list: prefixOperation + "/electricMeter/list",
    update: prefixOperation + "/electricMeter/update",
    detail: prefixOperation + "/electricMeter/get",
    delete: prefixOperation + "/electricMeter/delete",
  },
  electricityRate: {
    list: prefixOperation + "/electricityRate/list",
    update: prefixOperation + "/electricityRate/update",
    detail: prefixOperation + "/electricityRate/get",
    delete: prefixOperation + "/electricityRate/delete",
  },
  waterRate: {
    list: prefixOperation + "/waterRate/list",
    update: prefixOperation + "/waterRate/update",
    detail: prefixOperation + "/waterRate/get",
    delete: prefixOperation + "/waterRate/delete",
  },
  managementFeeRate: {
    list: prefixOperation + "/managementFeeRate/list",
    update: prefixOperation + "/managementFeeRate/update",
    detail: prefixOperation + "/managementFeeRate/get",
    delete: prefixOperation + "/managementFeeRate/delete",
  },
  parkingFee: {
    list: prefixOperation + "/parkingFee/list",
    update: prefixOperation + "/parkingFee/update",
    detail: prefixOperation + "/parkingFee/get",
    delete: prefixOperation + "/parkingFee/delete",
  },
  //--- Khu vực quản lý vận hành

  historySend: {
    historySendSMS: prefixAdmin + "/customerSms/list",
    historySendEmail: prefixAdmin + "/customerEmail/list",
    historySendZalo: prefixAdmin + "/customerZalo/list",
  },
  sendSMS: {
    // thêm, sửa, xóa danh sách gửi sms
    listSMS: prefixAdmin + "/smsRequest/list",
    updateSMS: prefixAdmin + "/smsRequest/update",
    detailSMS: prefixAdmin + "/smsRequest/get",
    deleteSMS: prefixAdmin + "/smsRequest/delete",
    approveSMS: prefixAdmin + "/smsRequest/approve",
    cancelSMS: prefixAdmin + "/smsRequest/cancel",
  },
  sendEmail: {
    // thêm, sửa, xóa danh sách gửi email
    listEmail: prefixAdmin + "/emailRequest/list",
    updateEmail: prefixAdmin + "/emailRequest/update",
    detailEmail: prefixAdmin + "/emailRequest/get",
    deleteEmail: prefixAdmin + "/emailRequest/delete",
    approveEmail: prefixAdmin + "/emailRequest/approve",
    cancelEmail: prefixAdmin + "/emailRequest/cancel",
  },
  estimate: {
    takeEstimate: prefixAdmin + "/customer/estimate",
  },
  invoice: {
    list: prefixAdmin + "/invoice/list/v2",
    create: prefixAdmin + "/invoice/create",
    invoiceDetail: prefixAdmin + "/invoiceDetail/import",
    cardService: prefixAdmin + "/invoiceDetail/cardService",
    // Tạo hóa đơn bán hàng
    invoiceDetailCustomer: prefixAdmin + "/invoiceDetail/customer",
    // Xem chi tiết hóa đơn
    invoiceDetailList: prefixAdmin + "/invoiceDetail/list",
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
    addToInvoice: prefixAdmin + "/boughtService/update",
    delete: prefixAdmin + "/boughtService/delete",
    update: prefixAdmin + "/boughtService/update",
    detail: prefixAdmin + "/boughtService/get",
    getByCustomer: prefixAdmin + "/boughtService/getBoughtServiceByCustomerId",
  },
  boughtProduct: {
    list: prefixAdmin + "/boughtProduct/list",
    addToInvoice: prefixAdmin + "/boughtProduct/update",
    delete: prefixAdmin + "/boughtProduct/delete",
    update: prefixAdmin + "/boughtProduct/update",
    detail: prefixAdmin + "/boughtProduct/get",
    getByCustomer: prefixAdmin + "/boughtProduct/getBoughtProductByCustomerId",
  },
  boughtCard: {
    list: prefixAdmin + "/boughtCardService/list",
    listLoyaltyPoint: prefixAdmin + "/loyaltyPointLedger/list",
    add: prefixAdmin + "/boughtCardService/update",
    delete: prefixAdmin + "/boughtCardService/delete",
    update: prefixAdmin + "/boughtCardService/update/cardNumber",
    updateCustomerCard: prefixAdmin + "/boughtCard/update",
    listBoughtCardByCustomerId: prefixAdmin + "/boughtCardService/getBoughtCardServiceByCustomerId",
  },
  product: {
    filterWarehouse: prefixAdmin + "/product/in_warehouse",
    list: prefixAdmin + "/product/list",
    detail: prefixAdmin + "/product/get",
    update: prefixAdmin + "/product/update",
    updateContent: prefixAdmin + "/product/update/content",
    delete: prefixAdmin + "/product/delete",

    //danh sách sản phẩm của đối tác
    listShared: prefixAdmin + "/product/list/shared",
  },

  integration: {
    list: prefixAdmin + "/integrationPartner/list",
    update: prefixAdmin + "/integrationConfig/update",
    updateStatus: prefixAdmin + "/integrationLog/update/status",
    delete: prefixAdmin + "/integrationConfig/delete",
    logList: prefixAdmin + "/integrationLog/list",
  },

  productAttribute: {
    list: prefixAdmin + "/productAttribute/list",
    update: prefixAdmin + "/productAttribute/update",
    delete: prefixAdmin + "/productAttribute/delete",
    listAll: prefixAdmin + "/productAttribute/listAll",
    checkDuplicated: prefixAdmin + "/productAttribute/checkDuplicated",
  },

  productExtraInfo: {
    list: prefixAdmin + "/productExtraInfo/list",
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
    list: prefixAdmin + "/serviceAttribute/list",
    update: prefixAdmin + "/serviceAttribute/update",
    delete: prefixAdmin + "/serviceAttribute/delete",
    listAll: prefixAdmin + "/serviceAttribute/listAll",
    checkDuplicated: prefixAdmin + "/serviceAttribute/checkDuplicated",
  },

  serviceExtraInfo: {
    list: prefixAdmin + "/serviceExtraInfo/list",
  },

  employee: {
    list: prefixAdmin + "/employee/list",
    update: prefixAdmin + "/employee/update",
    detail: prefixAdmin + "/employee/get",
    delete: prefixAdmin + "/employee/delete",
    linkEmployeeUser: prefixAdmin + "/employee/link_user",
    init: prefixAdmin + "/employee/init",
    info: prefixAdmin + "/employee/info",
    takeRoles: prefixAdmin + "/employee/roles",
    listExTip: prefixAdmin + "/employee/listExTip",
    generateRandomPass: prefixAdmin + "/employee/random_pass",
    list_department: prefixAdmin + "/employee/list/department",
    updateToken: prefixAdmin + "/employee/update_token", //Cập nhật token của Outlook Mail
    checkEmailConnection: prefixAdmin + "/employee/check_email_connection",
    disconnectEmail: prefixAdmin + "/employee/disconnect_email",
    updateRole: prefixAdmin + "/roleEmployee/insert-batch",
    getListRoleEmployee: prefixAdmin + "/roleEmployee/list",
    deleteRole: prefixAdmin + "/roleEmployee/delete",
  },
  employeeAgent: {
    list: prefixAdmin + "/employeeAgent/list",
    update: prefixAdmin + "/employeeAgent/update",
    delete: prefixAdmin + "/employeeAgent/delete",
    listAthena: prefixAdmin + "/athena/account-info",
  },

  teamEmployee: {
    list: prefixAdmin + "/group/list",
    detail: prefixAdmin + "/group/get",
    update: prefixAdmin + "/group/update",
    delete: prefixAdmin + "/group/delete",

    listEmployee: prefixAdmin + "/groupEmployee/list",
    updateEmployee: prefixAdmin + "/groupEmployee/update",
    deleteEmployee: prefixAdmin + "/groupEmployee/delete",
  },

  treatment: {
    // đoạn api này cần xem lại chút
    filterSchedule: prefixAdmin + "/treatmentTime/list_schedule_next",
    filterByScheduler: prefixAdmin + "/treatmentTime/get_byscheduler",
    updateNext: prefixAdmin + "/treatmentTime/update_next",
    delete: prefixAdmin + "/treatmentTime/delete",
    updateCaringEmployee: prefixAdmin + "/treatmentTime/update_caring_employee",
    update: prefixAdmin + "/treatmentTime/update",
  },
  // lịch sử điều trị
  treatmentHistory: {
    list: prefixAdmin + "/treatmentHistory/list_all",
    update: prefixAdmin + "/treatmentHistory/update",
    detail: prefixAdmin + "/treatmentHistory/get",
    delete: prefixAdmin + "/treatmentHistory/delete",
    listByCustomer: prefixAdmin + "/treatmentHistory/list_by_customer",
  },
  // nhật ký điều trị
  diarySurgery: {
    list: prefixAdmin + "/diarySurgery/listAll",
    update: prefixAdmin + "/diarySurgery/update",
    detail: prefixAdmin + "/diarySurgery/get",
    delete: prefixAdmin + "/diarySurgery/delete",
  },
  // lịch trình tư vấn
  scheduleConsultant: {
    list: prefixAdmin + "/scheduleConsultant/list",
    update: prefixAdmin + "/scheduleConsultant/update",
    detail: prefixAdmin + "/scheduleConsultant/get",
    delete: prefixAdmin + "/scheduleConsultant/delete",
    updateKafka: prefixBpm + "/kafka/activate/receiveTask",
  },
  // lịch điều trị
  scheduleTreatment: {
    list: prefixAdmin + "/scheduleTreatment/list",
    update: prefixAdmin + "/scheduleTreatment/update",
    detail: prefixAdmin + "/scheduleTreatment/get",
    delete: prefixAdmin + "/scheduleTreatment/delete",
    updateKafka: prefixBpm + "/kafka/activateProcess",
  },
  // lịch chung (điều trị, tư vấn, công việc)
  scheduleCommon: {
    list: prefixAdmin + "/schedule/list",
    listRelatedToCustomer: prefixAdmin + "/schedule/list/by_customer",
  },
  // phòng điều trị
  treatmentRoom: {
    list: prefixAdmin + "/treatmentRoom/list",
    update: prefixAdmin + "/treatmentRoom/update",
    detail: prefixAdmin + "/treatmentRoom/get",
    delete: prefixAdmin + "/treatmentRoom/delete",
    checkTreatmentRoom: prefixAdmin + "/treatmentRoom/check",
  },
  crmCareHistory: {
    list: prefixAdmin + "/crmCareHistory/list",
    update: prefixAdmin + "/crmCareHistory/update",
    delete: prefixAdmin + "/crmCareHistory/delete",
  },
  timekeeping: {
    list: prefixAdmin + "/timekeeping/list",
    update: prefixAdmin + "/timekeeping/update",
    delete: prefixAdmin + "/timekeeping/delete",
  },
  cashbook: {
    list: prefixAdmin + "/cashbook/list",
    update: prefixAdmin + "/cashbook/update",
    delete: prefixAdmin + "/cashbook/delete",
    export: prefixAdmin + "/cashbook/export",
    detail: prefixAdmin + "/cashbook/get",
  },
  orderRequest: {
    list: prefixAdmin + "/order-request/list",
    listOne: prefixAdmin + "/order-request/list-one",
    update: prefixAdmin + "/order-request/update",
    updateAndInit: prefixAdmin + "/order-request/update-and-init",
    delete: prefixAdmin + "/order-request/delete-soft",
    export: prefixAdmin + "/order-request/export",
    detail: prefixAdmin + "/order-request/get",
  },
  //khu vực trải nghiệm khách hàng
  cxmSurvey: {
    list: prefixAdmin + "/cxmSurvey/list",
    update: prefixAdmin + "/cxmSurvey/update",
    delete: prefixAdmin + "/cxmSurvey/delete",
    detail: prefixAdmin + "/cxmSurvey/get",
  },
  cxmResponse: {
    list: prefixAdmin + "/cxmResponse/list",
    update: prefixAdmin + "/cxmResponse/update",
    delete: prefixAdmin + "/cxmResponse/delete",
    detail: prefixAdmin + "/cxmResponse/get",
  },
  cxmResponseDetail: {
    list: prefixAdmin + "/cxmResponseDetail/list",
    update: prefixAdmin + "/cxmResponseDetail/update",
    delete: prefixAdmin + "/cxmResponseDetail/delete",
    detail: prefixAdmin + "/cxmResponseDetail/get",
  },
  cxmQuestion: {
    list: prefixAdmin + "/cxmQuestion/list",
    update: prefixAdmin + "/cxmQuestion/update",
    delete: prefixAdmin + "/cxmQuestion/delete",
    detail: prefixAdmin + "/cxmQuestion/get",
  },
  cxmOption: {
    list: prefixAdmin + "/cxmOption/list",
    update: prefixAdmin + "/cxmOption/update",
    delete: prefixAdmin + "/cxmOption/delete",
    detail: prefixAdmin + "/cxmOption/get",
  },
  cxmQuestionCondition: {
    list: prefixAdmin + "/cxmQuestionCondition/list",
    update: prefixAdmin + "/cxmQuestionCondition/update",
    delete: prefixAdmin + "/cxmQuestionCondition/delete",
    detail: prefixAdmin + "/cxmQuestionCondition/get",
  },
  //khu vực trải nghiệm khách hàng
  warehouse: {
    list: prefixWarehouse + "/warehouse/list",
    //API lấy ra danh sách sản phẩm trong kho
    productList: prefixWarehouse + "/warehouse/product/list",
    //API lấy ra thông tin ngày hết hạn / sản xuất dựa trên số lô của sản phẩm
    infoExpiryDateProductionDate: prefixWarehouse + "/warehouse/get_mfg_expired_date",
  },
  earnings: {
    filter: prefixAdmin + "/earnings/admin/list",
  },
  paymentHistory: {
    filter: prefixAdmin + "/paymentHistory/list",
    update: prefixAdmin + "/paymentHistory/update",
    delete: prefixAdmin + "/paymentHistory/delete",
  },
  //! đoạn này bh check lại một chút dữ liệu tạo cũ
  crmCampaign: {
    list: prefixAdmin + "/crmCampaign/list",
    update: prefixAdmin + "/crmCampaign/update",
    delete: prefixAdmin + "/crmCampaign/delete",
  },
  // Quản lý chiến dịch
  campaign: {
    list: prefixAdmin + "/campaign/list",
    listViewSale: prefixAdmin + "/campaign/list/view_sale",
    update: prefixAdmin + "/campaign/update",
    updateStatus: prefixAdmin + "/campaign/update/status",
    detail: prefixAdmin + "/campaign/get",
    delete: prefixAdmin + "/campaign/delete",
    convertRate: prefixAdmin + "/opportunityProcess",
    listActionScore: prefixAdmin + "/api/v1/score/action",
    //Cài đặt điểm khách hàng
    updateStep3: prefixAdmin + "/api/v1/score/insertMulti",
    listDataStep3: prefixAdmin + "/api/v1/score/campaign",

    //Cài đặt điểm nhân viên
    updateStep4: prefixAdmin + "/campaign/sale-point-config/update",
    listDataScoreEmployee: prefixAdmin + "/campaign/sale-point-config/get",

    listSale: prefixAdmin + "/campaignSale/list",
    statisticApproach: prefixAdmin + "/campaignOpportunity/statisticApproach",
    statisticSale: prefixAdmin + "/campaignOpportunity/statisticSale",
    statisticConvertRate: prefixAdmin + "/campaignOpportunity/statisticConvertRate",

    exportResult: prefixAdmin + "/campaignOpportunity/exportResult",
    exportAction: prefixAdmin + "/campaignOpportunity/exportAction",
    exportCustomer: prefixAdmin + "/campaignOpportunity/exportCustomer",

    updateConfigSLA: prefixAdmin + "/campaign/sla-config",
  },
  campaignApproach: {
    list: prefixAdmin + "/campaignApproach/list",
    update: prefixAdmin + "/campaignApproach/update",
    detail: prefixAdmin + "/campaignApproach/get",
    delete: prefixAdmin + "/campaignApproach/delete",
    updateSLA: prefixAdmin + "/campaignApproach/update/sla",
    activityList: prefixAdmin + "/campaignActivity/list",
    updateActivity: prefixAdmin + "/campaignActivity/update",
    deleteActivity: prefixAdmin + "/campaignActivity/delete",
  },
  campaignPipeline: {
    list: prefixAdmin + "/campaignPipeline/list",
    update: prefixAdmin + "/campaignPipeline/update",
    detail: prefixAdmin + "/campaignPipeline/get",
    delete: prefixAdmin + "/campaignPipeline/delete",
  },
  // quản lý cơ hội
  campaignOpportunity: {
    list: prefixAdmin + "/campaignOpportunity/list",
    listViewSale: prefixAdmin + "/campaignOpportunity/list/view_sale",
    update: prefixAdmin + "/campaignOpportunity/update",
    updateBatch: prefixAdmin + "/campaignOpportunity/update/batch",
    detail: prefixAdmin + "/campaignOpportunity/get",
    delete: prefixAdmin + "/campaignOpportunity/delete",
    // Đổi người phụ trách cơ hội
    changeEmployee: prefixAdmin + "/campaignOpportunity/change/employee",
    // Chuyển đổi trạng thái cơ hội
    changeSale: prefixAdmin + "/campaignOpportunity/change/sale",
    // Thêm mới hoặc cập nhập xác suất cơ hội
    opportunityProcessUpdate: prefixAdmin + "/opportunityProcess/update",
    // Xóa 1 xác suất cơ hội
    opportunityProcessDelete: prefixAdmin + "/opportunityProcess/delete",

    opportunityExchange: prefixAdmin + "/opportunityExchange/list",
    // xóa 1 trao đổi trong công việc
    deleteOpportunityExchange: prefixAdmin + "/opportunityExchange/delete",
    // thêm mới 1 trao đổi công việc
    addOpportunityExchange: prefixAdmin + "/opportunityExchange/update",

    // chỉnh sửa 1 trao đổi công việc
    updateOpportunityExchange: prefixAdmin + "/opportunityExchange/get",
    listOpportunity: prefixAdmin + "/opportunity/list",

    //check cơ hội đủ điều kiện để kéo
    opportunityCheck: prefixAdmin + "/campaignOpportunity/check",

    //send email
    sendEmail: prefixAdmin + "/customer/campaign/send/email",

    //Đầu mối làm việc
    opportunityContact: prefixAdmin + "/opportunityContact/update",
    detailOpportunityContact: prefixAdmin + "/opportunityContact/detail",

    ///Eform thu thập thông tin
    opportunityEformUpdate: prefixAdmin + "/opportunityEform/update",
    opportunityEformDetail: prefixAdmin + "/opportunityEform/get/criteria",

    addOther: prefixAdmin + "/campaignOpportunityViewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCoyViewer: prefixAdmin + "/campaignOpportunityViewer/update",
    // lấy về danh sách người xem
    lstCoyViewer: prefixAdmin + "/campaignOpportunityViewer/list",
    // xóa đi 1 người xem
    deleteCoyViewer: prefixAdmin + "/campaignOpportunityViewer/delete",
  },

  saleflow: {
    list: prefixAdmin + "/saleflow/list",
    update: prefixAdmin + "/saleflow/update",
    detail: prefixAdmin + "/saleflow/get",
    delete: prefixAdmin + "/saleflow/delete",
    activityList: prefixAdmin + "/saleflowActivity/list",
    updateActivity: prefixAdmin + "/saleflowActivity/update",
    deleteActivity: prefixAdmin + "/saleflowActivity/delete",

    saleflowEformUpdate: prefixAdmin + "/saleflowEform/update",
    saleflowEformDetail: prefixAdmin + "/saleflowEform/get/criteria",
  },

  saleflowApproach: {
    list: prefixAdmin + "/saleflowApproach/list",
    update: prefixAdmin + "/saleflowApproach/update",
    detail: prefixAdmin + "/saleflowApproach/get",
    delete: prefixAdmin + "/saleflowApproach/delete",
    updateSLA: prefixAdmin + "/saleflowApproach/update/sla",
    activityList: prefixAdmin + "/saleflowActivity/list",
    updateActivity: prefixAdmin + "/saleflowActivity/update",
    deleteActivity: prefixAdmin + "/saleflowActivity/delete",

    updateSaleflowSale: prefixAdmin + "/saleflowSale/update",
    detailSaleflowSale: prefixAdmin + "/saleflowSale/get/byApproachId",
  },

  // quản lý bán hàng
  saleflowInvoice: {
    list: prefixAdmin + "/saleflowInvoice/list",
    update: prefixAdmin + "/saleflowInvoice/update",
    updateApproach: prefixAdmin + "/saleflowInvoice/update/approach",
    updateApproachSuccess: prefixAdmin + "/saleflowInvoice/update/success",
    updateApproachCancel: prefixAdmin + "/saleflowInvoice/update/cancel",
    detail: prefixAdmin + "/saleflowInvoice/get",
    delete: prefixAdmin + "/saleflowInvoice/delete",

    invoiceExchange: prefixAdmin + "/saleflowExchange/list",
    // xóa 1 trao đổi trong
    deleteInvoiceExchange: prefixAdmin + "/saleflowExchange/delete",
    // thêm mới 1 trao đổi
    addInvoiceExchange: prefixAdmin + "/saleflowExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateInvoiceExchange: prefixAdmin + "/saleflowExchange/get",
  },

  categoryService: {
    // Đoạn này là category của ông dịch vụ
    list: prefixAdmin + "/categoryItem/list",
    update: prefixAdmin + "/categoryItem/update",
    detail: prefixAdmin + "/categoryItem/get",
    delete: prefixAdmin + "/categoryItem/delete",
  },

  categoryProject: {
    list: prefixAdmin + "/projectType/list",
    update: prefixAdmin + "/projectType/update",
    detail: prefixAdmin + "/projectType/get",
    delete: prefixAdmin + "/projectType/delete",
  },

  category: {
    // Đoạn này là category của ông tài chính
    list: prefixAdmin + "/category/list",
    update: prefixAdmin + "/category/update",
    detail: prefixAdmin + "/category/get",
    delete: prefixAdmin + "/category/delete",
  },

  codeSequence: {
    list: prefixAdmin + "/codeSequence/list",
    update: prefixAdmin + "/codeSequence/update",
    detail: prefixAdmin + "/codeSequence/get",
    delete: prefixAdmin + "/codeSequence/delete",
    detailEntity: prefixAdmin + "/codeSequence/get/entity",
  },

  beautyBranch: {
    list: prefixAdmin + "/beautyBranch/list",
    childList: prefixAdmin + "/beautyBranch/child",
    detail: prefixAdmin + "/beautyBranch/get",
    update: prefixAdmin + "/beautyBranch/update",
    delete: prefixAdmin + "/beautyBranch/delete",
    getByBeauty: `${process.env.APP_AUTHENTICATOR_URL}/api/beautySalon/get_bydomain`,

    //tìm đối tác theo mã
    getBeautyBranchByCode: prefixAdmin + "/beautyBranch/get/byCode",

    // thay đổi trạng thái chi nhánh
    activate: prefixAdmin + "/beautyBranch/update/activate",
    unActivate: prefixAdmin + "/beautyBranch/update/deactivate",
  },

  organization: {
    list: prefixRebornVn + "/beautySalon/list",
    customerUploadList: prefixAdmin + "/customerUpload/list",
    customerUploadDelete: prefixAdmin + "/cleanData/uploadCustomer/delete",
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
    list: prefixAdmin + "/reportTemplate/list",
    update: prefixAdmin + "/reportTemplate/update",
    delete: prefixAdmin + "/reportTemplate/delete",
  },
  department: {
    list: prefixAdmin + "/department/list",
    update: prefixAdmin + "/department/update",
    detail: prefixAdmin + "/department/get",
    delete: prefixAdmin + "/department/delete",
    list_branch: prefixAdmin + "/department/list/branch",

    updateParent: prefixAdmin + "/department/update/parent",
  },
  role: {
    list: prefixAdmin + "/role/list",
    update: prefixAdmin + "/role/update",
    detail: prefixAdmin + "/role/get",
    delete: prefixAdmin + "/role/delete",
    list_branch: prefixAdmin + "/role/list/branch",

    updateParent: prefixAdmin + "/role/update/parent",
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
    list: prefixAdmin + "/card/list",
    update: prefixAdmin + "/card/update",
    delete: prefixAdmin + "/card/delete",
  },
  cardService: {
    list: prefixAdmin + "/cardService/list",
    update: prefixAdmin + "/cardService/update",
    detail: prefixAdmin + "/cardService/get",
    delete: prefixAdmin + "/cardService/delete",
  },
  contractCategory: {
    list: prefixAdmin + "/contractCategory/list",
    update: prefixAdmin + "/contractCategory/update",
    detail: prefixAdmin + "/contractCategory/get",
    delete: prefixAdmin + "/contractCategory/delete",
  },
  contractPipeline: {
    list: prefixAdmin + "/contractPipeline/list",
    update: prefixAdmin + "/contractPipeline/update",
    detail: prefixAdmin + "/contractPipeline/get",
    delete: prefixAdmin + "/contractPipeline/delete",
    contractSubPipelineUpdate: prefixAdmin + "/contractSubPipeline/update",
  },
  contractApproach: {
    list: prefixAdmin + "/contractApproach/list",
    update: prefixAdmin + "/contractApproach/update",
    detail: prefixAdmin + "/contractApproach/get",
    delete: prefixAdmin + "/contractApproach/delete",

    activityList: prefixAdmin + "/contractActivity/list",
    updateActivity: prefixAdmin + "/contractActivity/update",
    deleteActivity: prefixAdmin + "/contractActivity/delete",
  },

  contractPayment: {
    list: prefixAdmin + "/contractPayment/list",
    update: prefixAdmin + "/contractPayment/update",
    detail: prefixAdmin + "/contractPayment/get",
    delete: prefixAdmin + "/contractPayment/delete",
  },

  contractorPayment: {
    list: prefixAdmin + "/contractInvestorPayment/list",
    update: prefixAdmin + "/contractInvestorPayment/update",
    detail: prefixAdmin + "/contractInvestorPayment/get",
    delete: prefixAdmin + "/contractInvestorPayment/delete",
  },

  contractProgress: {
    list: prefixAdmin + "/contractProgress/list",
    update: prefixAdmin + "/contractProgress/update",
    detail: prefixAdmin + "/contractProgress/get",
    delete: prefixAdmin + "/contractProgress/delete",
  },

  contractEform: {
    list: prefixBpm + "/eform/list",
    update: prefixBpm + "/eform/update",
    detail: prefixBpm + "/eform/get",
    delete: prefixBpm + "/eform/delete",

    listEformExtraInfo: prefixAdmin + "/eformExtraInfo/list",
    updateEformExtraInfo: prefixAdmin + "/eformExtraInfo/update",
    updateEformExtraInfoPosition: prefixAdmin + "/eformExtraInfo/update/position",
    detailEformExtraInfo: prefixAdmin + "/eformExtraInfo/get",
    deleteEformExtraInfo: prefixAdmin + "/eformExtraInfo/delete",

    listEformAttribute: prefixAdmin + "/eformAttribute/list",
    updateEformAttribute: prefixAdmin + "/eformAttribute/update",
    detailEformAttribute: prefixAdmin + "/eformAttribute/get",
    deleteEformAttribute: prefixAdmin + "/eformAttribute/delete",
    listEformAttributeAll: prefixAdmin + "/eformAttribute/listAll",

    checkDuplicated: prefixAdmin + "/eformAttribute/checkDuplicated",
    contractEformUpdate: prefixAdmin + "/contractEform/update",
    contractEformDetail: prefixAdmin + "/contractEform/get/criteria",
  },

  manageDefaultProcesses: {
    list: prefixAdmin + "/process-permission/list",
    update: prefixAdmin + "/process-permission/update",
    detail: prefixAdmin + "/process-permission/get",
    delete: prefixAdmin + "/process-permission/delete",
  },

  contractAttachment: {
    list: prefixAdmin + "/attachment/list",
    update: prefixAdmin + "/attachment/update",
    detail: prefixAdmin + "/attachment/get",
    delete: prefixAdmin + "/attachment/delete",

    contractAttachmentList: prefixAdmin + "/contractAttachment/list",
    contractAttachmentUpdate: prefixAdmin + "/contractAttachment/update",
    contractAttachmentDetail: prefixAdmin + "/contractAttachment/get",
    contractAttachmentDelete: prefixAdmin + "/contractAttachment/delete",
  },

  contractGuarantee: {
    list: prefixAdmin + "/guarantee/list",
    update: prefixAdmin + "/guarantee/update",
    detail: prefixAdmin + "/guarantee/get",
    delete: prefixAdmin + "/guarantee/delete",

    guaranteeTypeList: prefixAdmin + "/guaranteeType/list",
    guaranteeTypeUpdate: prefixAdmin + "/guaranteeType/update",
    guaranteeTypeDelete: prefixAdmin + "/guaranteeType/delete",

    competencyList: prefixAdmin + "/competency/list",
    competencyUpdate: prefixAdmin + "/competency/update",
    competencyDelete: prefixAdmin + "/competency/delete",

    bankList: prefixAdmin + "/bank/list",
    bankUpdate: prefixAdmin + "/bank/update",
    bankDelete: prefixAdmin + "/bank/delete",

    exAttributes: prefixAdmin + "/guarantee/export/attributes",
    numberFieldGuarantee: prefixAdmin + "/guarantee/export/randomGuarantees",
    autoProcess: prefixAdmin + "/guarantee/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/guarantee/import",
  },

  contractWarranty: {
    list: prefixAdmin + "/contractWarranty/list",
    update: prefixAdmin + "/contractWarranty/update",
    detail: prefixAdmin + "/contractWarranty/get",
    delete: prefixAdmin + "/contractWarranty/delete",

    warrantyTypeList: prefixAdmin + "/contractWarrantyType/list",
    warrantyTypeUpdate: prefixAdmin + "/contractWarrantyType/update",
    warrantyTypeDelete: prefixAdmin + "/contractWarrantyType/delete",

    competencyList: prefixAdmin + "/competency/list",
    competencyUpdate: prefixAdmin + "/competency/update",
    competencyDelete: prefixAdmin + "/competency/delete",

    bankList: prefixAdmin + "/bank/list",
    bankUpdate: prefixAdmin + "/bank/update",
    bankDelete: prefixAdmin + "/bank/delete",

    exAttributes: prefixAdmin + "/contractWarranty/export/attributes",
    // numberFieldWarranty: prefixAdmin + "/contractWarranty/export/randomWarranty",
    numberFieldWarranty: prefixAdmin + "/contractWarranty/export/randomContractWarranty",
    autoProcess: prefixAdmin + "/contractWarranty/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contractWarranty/import",
  },

  guaranteeAttachment: {
    guaranteeAttachmentList: prefixAdmin + "/guaranteeAttachment/list",
    guaranteeAttachmentUpdate: prefixAdmin + "/guaranteeAttachment/update",
    guaranteeAttachmentDelete: prefixAdmin + "/guaranteeAttachment/delete",
  },

  warrantyAttachment: {
    warrantyAttachmentList: prefixAdmin + "/contractWarrantyAttachment/list",
    warrantyAttachmentUpdate: prefixAdmin + "/contractWarrantyAttachment/update",
    warrantyAttachmentDelete: prefixAdmin + "/contractWarrantyAttachment/delete",
  },

  znsTemplate: {
    list: prefixAdmin + "/znsTemplate/list",
    updateSync: prefixAdmin + "/znsTemplate/list/sync",
    detail: prefixAdmin + "/znsTemplate/get",
    delete: prefixAdmin + "/znsTemplate/delete",
    templateDetail: prefixAdmin + "/znsTemplate/refresh",
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
    list: prefixAdmin + "/contractStage/list",
    update: prefixAdmin + "/contractStage/update",
    detail: prefixAdmin + "/contractStage/get",
    delete: prefixAdmin + "/contractStage/delete",
  },
  rentalType: {
    list: prefixAdmin + "/rentalType/list",
    update: prefixAdmin + "/rentalType/update",
    detail: prefixAdmin + "/rentalType/get",
    delete: prefixAdmin + "/rentalType/delete",
  },
  contact: {
    list: prefixAdmin + "/contact/list",
    update: prefixAdmin + "/contact/update",
    detail: prefixAdmin + "/contact/get",
    delete: prefixAdmin + "/contact/delete",
    fieldTable: prefixAdmin + "/contactAttribute/listFilter",

    contactExchange: prefixAdmin + "/contactExchange/list",
    // xóa 1 trao đổi trong
    deleteContactExchange: prefixAdmin + "/contactExchange/delete",
    // thêm mới 1 trao đổi
    addContactExchange: prefixAdmin + "/contactExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContactExchange: prefixAdmin + "/contactExchange/get",

    exAttributes: prefixAdmin + "/contact/export/attributes",
    numberFieldContact: prefixAdmin + "/contact/export/randomContacts",
    autoProcess: prefixAdmin + "/contact/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contact/import",
  },
  contactPipeline: {
    list: prefixAdmin + "/contactPipeline/list",
    update: prefixAdmin + "/contactPipeline/update",
    detail: prefixAdmin + "/contactPipeline/get",
    delete: prefixAdmin + "/contactPipeline/delete",
  },
  contactStatus: {
    list: prefixAdmin + "/contactStatus/list",
    update: prefixAdmin + "/contactStatus/update",
    detail: prefixAdmin + "/contactStatus/get",
    delete: prefixAdmin + "/contactStatus/delete",
  },
  contactAttribute: {
    list: prefixAdmin + "/contactAttribute/list",
    update: prefixAdmin + "/contactAttribute/update",
    delete: prefixAdmin + "/contactAttribute/delete",
    listAll: prefixAdmin + "/contactAttribute/listAll",
    checkDuplicated: prefixAdmin + "/contactAttribute/checkDuplicated",
  },
  contactExtraInfo: {
    list: prefixAdmin + "/contactExtraInfo/list",
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
    updateAndInit: prefixAdmin + "/contract/update-and-init",
    delete: prefixAdmin + "/contract/delete",
    updateAlert: prefixAdmin + "/contract/update/alert",

    //cảnh báo hợp đồng chung cho tất cả
    contractAlertUpdate: prefixAdmin + "/contractAlert/update",
    contractAlertList: prefixAdmin + "/contractAlert/list",

    //cảnh báo bảo lãnh hợp đồng chung cho tất cả
    guaranteeAlertUpdate: prefixAdmin + "/guaranteeAlert/update",
    guaranteeAlertList: prefixAdmin + "/guaranteeAlert/list",

    //cảnh báo bảo hành hợp đồng chung cho tất cả
    warrantyAlertUpdate: prefixAdmin + "/contractWarrantyAlert/update",
    warrantyAlertList: prefixAdmin + "/contractWarrantyAlert/list",

    //cảnh báo hợp đồng riêng từng cái
    contractAlertSpecific: prefixAdmin + "/contract/update/alert",
    contractAlertListSpecific: prefixAdmin + "/contract/alert/get",

    detailAlert: prefixAdmin + "/contract",
    fieldTable: prefixAdmin + "/contractAttribute/listFilter",

    updateApproach: prefixAdmin + "/contract/update/approach",

    //list mã đề nghị
    listCodeSuggest: prefixAdmin + "/contractRequest/list",

    //list mã mặt hàng dịch vụ
    listCodeService: prefixAdmin + "/contract/products/select",

    //list nhà cung cấp
    listSupplier: prefixAdmin + "/contract/suppliers/select",

    //thêm hạng mục bàn giao
    updateHandover: prefixAdmin + "/contractItem/update",

    //thêm đợt bàn giao
    updateHandoverProgress: prefixAdmin + "/contractHandover/update",

    //danh sách đợt bàn giao
    listHandoverProgress: prefixAdmin + "/contractHandover/list",

    // xóa 1 đợt bàn giao
    deleteHandoverProgress: prefixAdmin + "/contractHandover/delete",

    //phụ lục hợp đồng
    contractAppendixList: prefixAdmin + "/contractAppendix/list",
    contractAppendixDelete: prefixAdmin + "/contractAppendix/delete",
    contractAppendixUpdate: prefixAdmin + "/contractAppendix/update",
    contractAppendixDetail: prefixAdmin + "/contractAppendix/get",

    contractExchange: prefixAdmin + "/contractExchange/list",
    // xóa 1 trao đổi trong
    deleteContractExchange: prefixAdmin + "/contractExchange/delete",
    // thêm mới 1 trao đổi
    addContractExchange: prefixAdmin + "/contractExchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContractExchange: prefixAdmin + "/contractExchange/get",
    // gửi báo giá
    sendQuote: prefixAdmin + "/contract/email-quote",

    // gửi hợp đồng mẫu
    sendContract: prefixAdmin + "/contract/email-contract",

    exAttributes: prefixAdmin + "/contract/export/attributes",
    numberFieldCustomer: prefixAdmin + "/contract/export/randomContracts",
    autoProcess: prefixAdmin + "/contract/import/autoProcess",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixAdmin + "/contract/import",

    //các biểu đồ thống kê
    reportContractStatus: prefixAdmin + "/contract/dashboard/byStatus",
    // reportContractStatus: prefixAdmin + "/contract/dashboard/byStatusV2", // API này Năng làm
    reportContractContract: prefixAdmin + "/contract/dashboard/dealValueByCustomer",
    reportNewContract: prefixAdmin + "/contract/dashboard/newByTime",
    // reportNewContract: prefixAdmin + "/contract/dashboard/newByTimeV2", // API này Năng làm

    //thay đổi các trạng thái liên quan đến hợp đồng
    updateStatus: prefixAdmin + "/contract/update/status",

    //lịch sử thay đổi hợp đồng
    logValues: prefixAdmin + "/contract/logValues",
  },
  customerGroup: {
    list: prefixAdmin + "/customerGroup/list",
    update: prefixAdmin + "/customerGroup/update",
    delete: prefixAdmin + "/customerGroup/delete",
  },
  customerSource: {
    list: prefixAdmin + "/customerSource/list",
    update: prefixAdmin + "/customerSource/update",
    delete: prefixAdmin + "/customerSource/delete",
  },
  customerMarketingLead: {
    list: prefixAdmin + "/marketingSource/list",
    update: prefixAdmin + "/marketingSource/update",
    delete: prefixAdmin + "/marketingSource/delete",
  },
  customerView: {
    list: prefixAdmin + "/customerView/list",
    update: prefixAdmin + "/customerView/update",
    delete: prefixAdmin + "/customerView/delete",
  },

  reportChart: {
    listReportArtifact: prefixAdmin + "/reportArtifact/list",
    listArtifactByDashboard: prefixAdmin + "/reportArtifact/list/byDashboard",
    listArtifactByEmployee: prefixAdmin + "/reportArtifact/list/byEmployee",
    updateReportArtifact: prefixAdmin + "/reportArtifact/update",
    deleteReportArtifact: prefixAdmin + "/reportArtifact/delete",

    listReportDashboard: prefixAdmin + "/reportDashboard/list",
    updateReportDashboard: prefixAdmin + "/reportDashboard/update",
    deleteReportDashboard: prefixAdmin + "/reportDashboard/delete",

    listReportRole: prefixAdmin + "/reportRole/list",
    updateReportRole: prefixAdmin + "/reportRole/update",
    deleteReportRole: prefixAdmin + "/reportRole/delete",

    updateReportConfig: prefixAdmin + "/reportConfig/update",
    deleteReportConfig: prefixAdmin + "/reportConfig/delete",
  },

  // Báo cáo bảo lãnh
  reportGuarantee: {
    statistical: prefixAdmin + "/guarantee/statistical",
  },
  // Báo cáo bảo hành
  reportContractWarranty: {
    statistical: prefixAdmin + "/contractWarranty/statistical",
  },
  // Báo cáo đối tác
  reportBussinessParner: {
    report: prefixAdmin + "/contract/report",
    // Chi tiết báo cáo đối tác
    reportDetail: prefixAdmin + "/contract/report/detail",
  },
  // Báo cáo khách hàng
  reportCustomer: {
    totalCurentCustomer: prefixAdmin + "/customer/dashboard/getTotal",
    totalContract: prefixAdmin + "/contract/total/dashboard",
    totalRevenue: prefixAdmin + "/contract/revenue/dashboard",
    externalOrnot: prefixAdmin + "/customer/dashboard/externalOrnot",
    relationShip: prefixAdmin + "/customer/dashboard/relationShip",
    pipeline: prefixAdmin + "/contract/dashboard/pipeline",
    notInTimePipeline: prefixAdmin + "/contract/dashboard/notInTime/pipeline",
    // Chi tiết tổng số khách hàng
    totalCurentCustomerDetail: prefixAdmin + "/customer/dashboard/getTotal/detail",
    // Chi tiết tổng số hợp đồng theo pipeline
    totalContractSignerDetail: prefixAdmin + "/contract/dashboard/notInTime/pipeline/detail",
    // Doanh thu còn phải thu trong kì
    revenueNotYetReceivedDetail: prefixAdmin + "/contract/dashboard/pipeline/detail",
  },
  // Báo cáo cơ hội
  reportOpportunity: {
    totalOpportunity: prefixAdmin + "/campaignOpportunity/total/dashboard",
    opportunityByDate: prefixAdmin + "/campaignOpportunity/totalByDate/dashboard",
    expectedRevenue: prefixAdmin + "/campaignOpportunity/totalExpectedRevenue/dashboard",
    totalByApproach: prefixAdmin + "/campaignOpportunity/totalByApproach/dashboard",

    //Chi tiết tổng số cơ hội
    totalOpportunityDetail: prefixAdmin + "/campaignOpportunity/total/dashboard/detail",
    //Chi tiết doanh thu dự kiến
    expectedRevenueDetail: prefixAdmin + "/campaignOpportunity/totalExpectedRevenue/dashboard/detail",
    //Chi tiết doanh ký hợp đồng
    contractRevenueDetail: prefixAdmin + "/contract/revenue/dashboard/detail",
  },

  customerField: {
    list: prefixAdmin + "/customerField/list",
    update: prefixAdmin + "/customerField/update",
    delete: prefixAdmin + "/customerField/delete",
  },
  customerAttribute: {
    list: prefixAdmin + "/customerAttribute/list",
    update: prefixAdmin + "/customerAttribute/update",
    delete: prefixAdmin + "/customerAttribute/delete",
    listAll: prefixAdmin + "/customerAttribute/listAll",
    checkDuplicated: prefixAdmin + "/customerAttribute/checkDuplicated",
  },
  customerExtraInfo: {
    list: prefixAdmin + "/customerExtraInfo/list",
  },
  contractAttribute: {
    list: prefixAdmin + "/contractAttribute/list",
    update: prefixAdmin + "/contractAttribute/update",
    delete: prefixAdmin + "/contractAttribute/delete",
    listAll: prefixAdmin + "/contractAttribute/listAll",
    checkDuplicated: prefixAdmin + "/contractAttribute/checkDuplicated",
  },
  contractExtraInfo: {
    list: prefixAdmin + "/contractExtraInfo/list",
  },

  guaranteeAttribute: {
    list: prefixAdmin + "/guaranteeAttribute/list",
    update: prefixAdmin + "/guaranteeAttribute/update",
    delete: prefixAdmin + "/guaranteeAttribute/delete",
    listAll: prefixAdmin + "/guaranteeAttribute/listAll",
    checkDuplicated: prefixAdmin + "/guaranteeAttribute/checkDuplicated",
  },
  warrantyAttribute: {
    list: prefixAdmin + "/contractWarrantyAttribute/list",
    update: prefixAdmin + "/contractWarrantyAttribute/update",
    delete: prefixAdmin + "/contractWarrantyAttribute/delete",
    listAll: prefixAdmin + "/contractWarrantyAttribute/listAll",
    checkDuplicated: prefixAdmin + "/contractWarrantyAttribute/checkDuplicated",
  },
  guaranteeExtraInfo: {
    list: prefixAdmin + "/guaranteeExtraInfo/list",
  },
  warrantyExtraInfo: {
    list: prefixAdmin + "/contractWarrantyExtraInfo/list",
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
    list: prefixAdmin + "/tipGroup/list",
    update: prefixAdmin + "/tipGroup/update",
    delete: prefixAdmin + "/tipGroup/delete",
    listTipGroupEmloyee: prefixAdmin + "/tipGroupEmployee/list",
    updateTipGroupEmloyee: prefixAdmin + "/tipGroupEmployee/update",
    deleteTipGroupEmloyee: prefixAdmin + "/tipGroupEmployee/delete",
  },
  tipUser: {
    list: prefixAdmin + "/tipUser/list",
    update: prefixAdmin + "/tipUser/update",
    delete: prefixAdmin + "/tipUser/delete",
  },
  tipUserConfig: {
    list: prefixAdmin + "/tipUserConfig/list",
    update: prefixAdmin + "/tipUserConfig/update",
    delete: prefixAdmin + "/tipUserConfig/delete",
  },
  tipGroupConfig: {
    list: prefixAdmin + "/tipGroupConfig/list",
    update: prefixAdmin + "/tipGroupConfig/update",
    delete: prefixAdmin + "/tipGroupConfig/delete",
  },
  setting: {
    list: prefixAdmin + "/setting/list",
    update: prefixAdmin + "/setting/update",
    delete: prefixAdmin + "/setting/delete",
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
    listFanpageDialog: prefixAdmin + "/fanpageDialog/list",
    //* Danh sách tin nhắn chat từ fanpage
    listFanpageChat: prefixAdmin + "/fanpageChat/list",
    //* Phản hồi (nhắn tin phản hồi người chat facebook)
    replyFanpageChat: prefixAdmin + "/fanpageChat/reply",
    //* Danh sách bình luận từ fanpage
    listFanpageComment: prefixAdmin + "/fanpageComment/list",
    //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
    replyFanpageComment: prefixAdmin + "/fanpageComment/reply",
    //* Gỡ 1 bình luận đã đăng
    deleteFanpageComment: prefixAdmin + "/fanpageComment/delete",
    //* Ẩn 1 bình luận trên fanpage
    hiddenFanpageComment: prefixAdmin + "/fanpageComment/hidden",
    //* Lấy thông tin bài đã đăng
    fanpagePost: prefixAdmin + "/fanpagePost/get",
    //* Gửi file đính kèm trong messenger
    fanpageChatSendAttachment: prefixAdmin + "/fanpageChat/send/attachment",
  },
  zaloOA: {
    //* kết nối zalo với crm
    connect: prefixAdmin + "/zaloOa/connect",
    //* Lấy danh sách zalo đã được kết nối
    list: prefixAdmin + "/zaloOa/list",
    //* Gỡ một zalo ra khỏi danh sách đã kết nối
    delete: prefixAdmin + "/zaloOa/remove",
    //* Lấy danh sách hội thoại chat
    listZaloFollower: prefixAdmin + "/zaloFollower/list",
    //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
    listZaloChat: prefixAdmin + "/zaloChat/list",
    //* Nhắn tin cho người dùng
    sendZaloChat: prefixAdmin + "/zaloChat/send",
    //* Gửi tin nhắn dạng link ảnh
    linkImageSendZaloChat: prefixAdmin + "/zaloChat/send/link_image",
    //* Gửi tin nhắn đính kèm file
    fileSendZaloChat: prefixAdmin + "/zaloChat/send/file",
    //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
    answerSendZaloChat: prefixAdmin + "/zaloChat/send/answer",
    //* Gỡ 1 tin nhắn chat
    deleteZaloChat: prefixAdmin + "/zaloChat/delete",
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
    getCustomer: prefixAdmin + "/ma/dashboard/customer/byStatus",
    // detail: "https://cloud.reborn.vn/market/article/get",
  },
  keywordData: {
    list: "https://cloud.reborn.vn/market/keywordData/list",
    update: "https://cloud.reborn.vn/market/keywordData/update",
    detail: "https://cloud.reborn.vn/market/keywordData/get",
    delete: "https://cloud.reborn.vn/market/keywordData/delete",
  },
  configCode: {
    list: prefixAdmin + "/globalConfig/list",
    update: prefixAdmin + "/globalConfig/update",
    detail: prefixAdmin + "/globalConfig/get",
    delete: prefixAdmin + "/globalConfig/delete",
  },
  placeholder: {
    contractWarranty: prefixAdmin + "/contractWarranty/placeholder", // placeholder Bảo hành
    guarantee: prefixAdmin + "/guarantee/placeholder", // placeholder Bảo lãnh
    contract: prefixAdmin + "/contract/placeholder", // placeholder Hợp đồng
    customer: prefixAdmin + "/customer/placeholder", // placeholder Khách hàng
    contact: prefixAdmin + "/contact/placeholder ", // placeholder Người liên hệ
  },
  partnerCall: {
    list: prefixAdmin + "/partnerCall/list",
    update: prefixAdmin + "/partnerCall/update",
    detail: prefixAdmin + "/partnerCall/get",
    delete: prefixAdmin + "/partnerCall/delete",
  },
  switchboard: {
    list: prefixAdmin + "/callConfig/list",
    update: prefixAdmin + "/callConfig/update",
    updateStatus: prefixAdmin + "/callConfig/update/status",
    detail: prefixAdmin + "/callConfig/get",
    delete: prefixAdmin + "/callConfig/delete",
  },
  templateSMS: {
    list: prefixAdmin + "/templateSms/list",
    update: prefixAdmin + "/templateSms/update",
    detail: prefixAdmin + "/templateSms/get",
    delete: prefixAdmin + "/templateSms/delete",
  },
  partnerSMS: {
    list: prefixAdmin + "/partnerSms/list",
    update: prefixAdmin + "/partnerSms/update",
    detail: prefixAdmin + "/partnerSms/get",
    delete: prefixAdmin + "/partnerSms/delete",
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
    list: prefixAdmin + "/templateCategory/list",
    update: prefixAdmin + "/templateCategory/update",
    detail: prefixAdmin + "/templateCategory/get",
    delete: prefixAdmin + "/templateCategory/delete",
  },
  templateZalo: {
    list: prefixAdmin + "/templateZalo/list",
    update: prefixAdmin + "/templateZalo/update",
    detail: prefixAdmin + "/templateZalo/get",
    delete: prefixAdmin + "/templateZalo/delete",
  },
  templateEmail: {
    list: prefixAdmin + "/templateEmail/list",
    update: prefixAdmin + "/templateEmail/update",
    detail: prefixAdmin + "/templateEmail/get",
    delete: prefixAdmin + "/templateEmail/delete",
  },
  partnerEmail: {
    list: prefixAdmin + "/partnerEmail/list",
    update: prefixAdmin + "/partnerEmail/update",
    detail: prefixAdmin + "/partnerEmail/get",
    delete: prefixAdmin + "/partnerEmail/delete",
  },
  emailConfig: {
    list: prefixAdmin + "/emailConfig/list",
    update: prefixAdmin + "/emailConfig/update",
    detail: prefixAdmin + "/emailConfig/get",
    delete: prefixAdmin + "/emailConfig/delete",

    //Kiểm tra Email nguồn
    checkEmail: prefixAdmin + "/email/testConnection",
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
    mailboxExchangeList: prefixAdmin + "/mailboxExchange/list",
    mailboxExchangeUpdate: prefixAdmin + "/mailboxExchange/update",
    mailboxExchangeDelete: prefixAdmin + "/mailboxExchange/delete",
  },
  warranty: {
    list: prefixAdmin + "/warranty/list",
    update: prefixAdmin + "/warranty/update",
    detail: prefixAdmin + "/warranty/get",
    delete: prefixAdmin + "/warranty/delete",
    collect: prefixAdmin + "/warranty/send/jssdk",
    overview: prefixAdmin + "/warranty/get/overview",
    viewer: prefixAdmin + "/warranty/viewer",
    updateStatus: prefixAdmin + "/warranty/update/status",
    warrantyExchangeUpdate: prefixAdmin + "/warrantyExchange/update",
    warrantyExchangeDelete: prefixAdmin + "/warrantyExchange/delete",
    warrantyExchangeList: prefixAdmin + "/warrantyExchange/list",
    warrantyProcess: prefixAdmin + "/warrantyProcess/update",
    resetTransferVotes: prefixAdmin + "/supportObject/reset",
  },
  warrantyCategory: {
    list: prefixAdmin + "/warrantyCategory/list",
    update: prefixAdmin + "/warrantyCategory/update",
    detail: prefixAdmin + "/warrantyCategory/get",
    delete: prefixAdmin + "/warrantyCategory/delete",
  },
  warrantyProc: {
    list: prefixAdmin + "/support/list",
    update: prefixAdmin + "/support/update",
    detail: prefixAdmin + "/support/get",
    delete: prefixAdmin + "/support/delete",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  warrantyStep: {
    list: prefixAdmin + "/warrantyStep/list",
    update: prefixAdmin + "/warrantyStep/update",
    detail: prefixAdmin + "/warrantyStep/get",
    delete: prefixAdmin + "/warrantyStep/delete",
  },
  ticket: {
    list: prefixAdmin + "/ticket/list",
    update: prefixAdmin + "/ticket/update",
    updateAndInit: prefixAdmin + "/ticket/update-and-init",
    collect: prefixAdmin + "/ticket/send/jssdk",
    detail: prefixAdmin + "/ticket/get",
    delete: prefixAdmin + "/ticket/delete",
    viewer: prefixAdmin + "/ticket/viewer",
    updateStatus: prefixAdmin + "/ticket/update/status",
    ticketExchangeList: prefixAdmin + "/ticketExchange/list",
    ticketExchangeUpdate: prefixAdmin + "/ticketExchange/update",
    ticketExchangeDelete: prefixAdmin + "/ticketExchange/delete",
    ticketProcess: prefixAdmin + "/ticketProcess/update",
    resetTransferVotes: prefixAdmin + "/supportObject/reset",
  },
  ticketCategory: {
    list: prefixAdmin + "/ticketCategory/list",
    update: prefixAdmin + "/ticketCategory/update",
    detail: prefixAdmin + "/ticketCategory/get",
    delete: prefixAdmin + "/ticketCategory/delete",
  },
  ticketProc: {
    list: prefixAdmin + "/support/list",
    update: prefixAdmin + "/support/update",
    detail: prefixAdmin + "/support/get",
    delete: prefixAdmin + "/support/delete",
  },
  supportCommon: {
    supportConfigLst: prefixAdmin + "/supportConfig/list",
    supportConfigUpdate: prefixAdmin + "/supportConfig/update",
    supportConfigDelete: prefixAdmin + "/supportConfig/delete",
    supportConfigDetail: prefixAdmin + "/supportConfig/get",

    updateStatusSupport: prefixAdmin + "/support/update/status",

    supportLinkLst: prefixAdmin + "/supportLink/list",
    supportLinkUpdate: prefixAdmin + "/supportLink/update",
    supportLinkDelete: prefixAdmin + "/supportLink/delete",

    supportObjectLst: prefixAdmin + "/supportObject/list",
    supportObjectUpdate: prefixAdmin + "/supportObject/update",
    supportObjectDelete: prefixAdmin + "/supportObject/delete",
    takeObject: prefixAdmin + "/supportObject/get/object",
    checkApproved: prefixAdmin + "/supportObject/checkApproved",

    supportLogLst: prefixAdmin + "/supportLog/list",
    supportLogUpdate: prefixAdmin + "/supportLog/update",
    supportLogDelete: prefixAdmin + "/supportLog/delete",

    // đoạn này là action confirm nút
    processDone: prefixAdmin + "/supportLog/processDone",
    processReceive: prefixAdmin + "/supportLog/receive",
    processRejected: prefixAdmin + "/supportLog/processRejected",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  ticketStep: {
    list: prefixAdmin + "/ticketStep/list",
    update: prefixAdmin + "/ticketStep/update",
    detail: prefixAdmin + "/ticketStep/get",
    delete: prefixAdmin + "/ticketStep/delete",
  },
  //API công việc
  workProject: {
    list: prefixAdmin + "/workProject/list",
    update: prefixAdmin + "/workProject/update",
    detail: prefixAdmin + "/workProject/get",
    delete: prefixAdmin + "/workProject/delete",
  },
  // workOrder: {
  //   list: prefixAdmin + "/workOrder/list",
  //   update: prefixAdmin + "/workOrder/update",
  //   detail: prefixAdmin + "/workOrder/get",
  //   delete: prefixAdmin + "/workOrder/delete",
  //   // Lấy thông tin người liên quan
  //   relatedPeople: prefixAdmin + "/workOrder/get/related_people",
  //   // cập nhật thông tin người tham gia trong công việc
  //   updateParticipant: prefixAdmin + "/workOrder/update/participant",
  //   // cập nhật thông tin khách hàng tham gia trong công việc
  //   updateCustomer: prefixAdmin + "/workOrder/update/customer",
  //   // cập nhật thông tin công việc liên quan
  //   updateOtherWorkOrder: prefixAdmin + "/workOrder/update/other_work_order",
  //   // Lấy danh sách công việc liên quan
  //   getOtherWorkOrder: prefixAdmin + "/workOrder/get/other_work_order",
  //   // Cập nhật tiến độ công việc
  //   updateWorkInprogress: prefixAdmin + "/workInprogress/update",
  //   // Lấy tiến độ công việc
  //   getWorkInprogress: prefixAdmin + "/workInprogress/get",
  //   // Lấy danh sách cập nhật tiến độ công việc
  //   getWorkInprogressList: prefixAdmin + "/workInprogress/list",
  //   // Cập nhật trạng thái công việc
  //   updateStatus: prefixAdmin + "/workOrder/update/status",
  //   // Lấy danh sách người giao việc
  //   employeeManagers: prefixAdmin + "/employee/managers",
  //   // Lấy danh sách người nhận việc
  //   employeeAssignees: prefixAdmin + "/employee/assignees",
  //   // danh sách trao đổi trong công việc
  //   workExchange: prefixAdmin + "/workExchange/list",
  //   // báo cáo công việc
  //   workReport: prefixAdmin + "/workOrder/report",
  //   // xóa 1 trao đổi trong công việc
  //   deleteWorkExchange: prefixAdmin + "/workExchange/delete",
  //   // thêm mới 1 trao đổi công việc
  //   addWorkExchange: prefixAdmin + "/workExchange/update",
  //   // chỉnh sửa 1 trao đổi công việc
  //   updateWorkExchange: prefixAdmin + "/workExchange/get",
  //   // cập nhật đánh giá chất lượng công việc
  //   updateRating: prefixAdmin + "/workOrder/update/review",
  //   // cập nhật mức độ ưu tiên công việc
  //   updatePriorityLevel: prefixAdmin + "/workOrder/update/priorityLevel",
  // },
  workOrder: {
    listBpmWorkOrder: prefixBpm + "/workOrder/list",
    list: prefixAdmin + "/workOrder/list",
    listV2: prefixAdmin + "/workOrder/listV2",
    groups: prefixAdmin + "/workOrder/groups",
    groupsV2: prefixAdmin + "/workOrder/groupsV2",
    update: prefixAdmin + "/workOrder/update",
    updateAndInit: prefixAdmin + "/workOrder/save-and-init-process",
    updateInitProcess: prefixAdmin + "/workOrder/update-init-process",
    updateEmployee: prefixAdmin + "/workOrder/update/employee",
    updatePause: prefixAdmin + "/workOrder/update/pause",
    listPause: prefixAdmin + "/workOrder/list/pause",
    updateReject: prefixAdmin + "/bpmForm/reject",
    detail: prefixAdmin + "/workOrder/get",
    delete: prefixAdmin + "/workOrder/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixAdmin + "/workOrder/get/related_people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixAdmin + "/workOrder/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixAdmin + "/workOrder/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixAdmin + "/workOrder/update/other_work_order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixAdmin + "/workOrder/get/other_work_order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixAdmin + "/workInprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixAdmin + "/workInprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixAdmin + "/workInprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixAdmin + "/workOrder/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixAdmin + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixAdmin + "/employee/assignees",
    // Lấy danh sách người nhận việc trong dự án
    projectEmployeeAssignees: prefixAdmin + "/workProject/getEmployees",
    // danh sách trao đổi trong công việc
    workExchange: prefixAdmin + "/workExchange/list",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixAdmin + "/workExchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixAdmin + "/workExchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixAdmin + "/workExchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixAdmin + "/workOrder/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixAdmin + "/workOrder/update/priorityLevel",
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
    // list: prefixAdmin + "/workOrder/list",
    list: prefixBpm + "/workOrder/list",
    update: prefixAdmin + "/workOrder/update",
    detail: prefixBpm + "/workOrder/get",
    // detail: prefixBpm + "/workOrder/get",
    updatePause: prefixAdmin + "/workOrder/update/pause",
    // listPause: prefixAdmin + "/workOrder/list/pause",
    listPause: prefixBpm + "/workOrder/list/pause",
    delete: prefixAdmin + "/workOrder/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixAdmin + "/workOrder/get/related_people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixAdmin + "/workOrder/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixAdmin + "/workOrder/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixAdmin + "/workOrder/update/other_work_order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixAdmin + "/workOrder/get/other_work_order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixSale + "/workInprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixSale + "/workInprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixSale + "/workInprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixAdmin + "/workOrder/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixSystem + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixSystem + "/employee/assignees",
    // danh sách trao đổi trong công việc
    workExchange: prefixSale + "/workExchange/list",
    // báo cáo công việc
    workReport: prefixAdmin + "/workOrder/report",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixSale + "/workExchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixSale + "/workExchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixSale + "/workExchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixAdmin + "/workOrder/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixAdmin + "/workOrder/update/priorityLevel",
    //exportOLA
    exportOLA: prefixAdmin + "/ola/export",
    //exportSLA
    exportSLA: prefixAdmin + "/sla/export",
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
    list: prefixAdmin + "/workType/list",
    update: prefixAdmin + "/workType/update",
    detail: prefixAdmin + "/workType/get",
    delete: prefixAdmin + "/workType/delete",
  },
  //API người danh sách người mua, bán
  objectSource: {
    list: prefixApi + "/objectSource/list",
  },
  //API quản trị phân hệ
  subsystemAdministration: {
    list: prefixAdmin + "/module/list",
    update: prefixAdmin + "/module/update",
    detail: prefixAdmin + "/module/get",
    delete: prefixAdmin + "/module/delete",
    // Thêm mới một tài nguyên vào phân hệ
    addModuleResource: prefixAdmin + "/moduleResource/add",
    // Xóa một tài nguyên hỏi phân hệ
    removeModuleResource: prefixAdmin + "/moduleResource/remove",
  },
  //API quản trị chúc năng
  functionalManagement: {
    list: prefixAdmin + "/resource/list",
    update: prefixAdmin + "/resource/update",
    detail: prefixAdmin + "/resource/get",
    delete: prefixAdmin + "/resource/delete",
    // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
    freeResource: prefixAdmin + "/resource/list_ex",
  },
  permission: {
    getPermissionResources: prefixAdmin + "/permission/resource",
    //API phân quyền theo phòng ban
    permissionDepartment: prefixAdmin + "/permission/info",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixAdmin + "/rolePermission/info",
    //API thêm quyền cho phòng ban
    permissionDepartmentAdd: prefixAdmin + "/permission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixAdmin + "/rolePermission/add",
    //API xóa quyền được cấp
    permissionDepartmentDelete: prefixAdmin + "/permission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixAdmin + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixAdmin + "/requestPermission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixAdmin + "/requestPermission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixAdmin + "/requestPermission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixAdmin + "/requestPermission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixAdmin + "/requestPermission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixAdmin + "/requestPermission/update/rejected ",
  },
  rolePermission: {
    getPermissionResources: prefixAdmin + "/permission/resource",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixAdmin + "/rolePermission/info",
    //API phân quyền theo gói
    packagePermission: prefixAdmin + "/packagePermission/info",
    //API thêm quyền cho nhóm quyền
    packagePermissionAdd: prefixAdmin + "/packagePermission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixAdmin + "/rolePermission/add",
    //API xóa quyền được cấp
    permissionRoleDelete: prefixAdmin + "/rolePermission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixAdmin + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixAdmin + "/requestPermission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixAdmin + "/requestPermission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixAdmin + "/requestPermission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixAdmin + "/requestPermission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixAdmin + "/requestPermission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixAdmin + "/requestPermission/update/rejected ",
  },
  //API tổng đài
  callCenter: {
    //* Tạo 1 cuộc gọi
    makeCall: prefixAdmin + "/callCenter/makeCall",
    //* Lấy danh sách lịch sử cuộc gọi
    getHistory: prefixAdmin + "/callCenter/getHistory",
    //* Lấy chi tiết lịch sử cuộc gọi
    getHistoryByCallId: prefixAdmin + "/callCenter/getHistoryByCallId",
    //* Chuyển một cuộc gọi sang máy khác
    transferCall: prefixAdmin + "/callCenter/transferCall",
    //* Thực hiện ngắt cuộc gọi
    hangupCall: prefixAdmin + "/callCenter/hangupCall",
    //* Tạo 1 cuộc gọi đọc mã OTP cho người đăng ký
    makeCallOTP: prefixAdmin + "/callCenter/makeCallOTP",
    //* Danh sách lịch sử cuộc gọi
    customerCallList: prefixAdmin + "/customerCall/list",
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
    list: prefixAdmin + "/kpiDatasource/list",
    update: prefixAdmin + "/kpiDatasource/update",
    delete: prefixAdmin + "/kpiDatasource/delete",
  },
  kpiGoal: {
    list: prefixAdmin + "/kpiGoal/list",
    update: prefixAdmin + "/kpiGoal/update",
    delete: prefixAdmin + "/kpiGoal/delete",
    detail: prefixAdmin + "/kpiGoal/get",
  },
  kpiTemplate: {
    list: prefixAdmin + "/kpiTemplate/list",
    update: prefixAdmin + "/kpiTemplate/update",
    delete: prefixAdmin + "/kpiTemplate/delete",
  },
  kpiTemplateGoal: {
    list: prefixAdmin + "/kpiTemplateGoal/list",
    update: prefixAdmin + "/kpiTemplateGoal/update",
    delete: prefixAdmin + "/kpiTemplateGoal/delete",
  },
  kpiSetup: {
    list: prefixAdmin + "/kpiSetup/list",
    update: prefixAdmin + "/kpiSetup/update/web",
    delete: prefixAdmin + "/kpiSetup/delete",
  },
  kpi: {
    list: prefixAdmin + "/kpi/list",
    update: prefixAdmin + "/kpi/update",
    delete: prefixAdmin + "/kpi/delete",

    checkKpiCampaign: prefixAdmin + "/kpiApply/get/byCampaignId",
    updateKpi: prefixAdmin + "/campaign/update/kpi",
    listEmployeeKpi: prefixAdmin + "/kpiObject/list",
    addEmployeeToKpi: prefixAdmin + "/kpiObject/get/byObject",
    listGoalKpiEmployee: prefixAdmin + "/kpiSetupObject/list/byKotId",
    saveKpiEmployee: prefixAdmin + "/kpiSetupObject/update/web",
    deleteEmployeeKpi: prefixAdmin + "/kpiObject/delete",

    //chỉ tiêu tương tác trong chiến dịch bán hàng
    addEmployeeToKpiContact: prefixAdmin + "/campaignSale/interaction/kpis",
    saveKpiContactEmployee: prefixAdmin + "/campaignSale/interaction/kpis",
    listEmployeeKpiContact: prefixAdmin + "/campaignSale/interaction/employee",
    deleteEmployeeKpiContact: prefixAdmin + "/campaignSale/interaction/kpis",
  },
  kpiApply: {
    list: prefixAdmin + "/kpiApply/list",
    update: prefixAdmin + "/kpiApply/update",
    delete: prefixAdmin + "/kpiApply/delete",
  },
  kpiObject: {
    list: prefixAdmin + "/kpiObject/list",
    update: prefixAdmin + "/kpiObject/update/web",
    delete: prefixAdmin + "/kpiObject/delete",
    detail: prefixAdmin + "/kpiObject/get",
    detailKpiEmployee: prefixAdmin + "/kpiObject/employee/result",
    exchangeList: prefixAdmin + "/kpiExchange/list",
    // xóa 1 trao đổi
    deleteKpiExchange: prefixAdmin + "/kpiExchange/delete",
    // thêm mới 1 trao đổi
    addKpiExchange: prefixAdmin + "/kpiExchange/update",

    // chỉnh sửa 1 trao đổi
    updateKpiExchange: prefixAdmin + "/kpiExchange/get",
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
  //lay danh sach voucher
  voucher: {
    list: prefixAdmin + "/promotion/list-active",
  },

  email: {
    list: prefixAdmin + "/outlookMail/list",
    detail: prefixAdmin + "/outlookMail/get",
    sendEmail: prefixAdmin + "/outlookMail/sendEmail",
    delete: prefixAdmin + "/outlookMail/delete",
    sendEmailConfirm: prefixAdmin + "/promotion/init-receive-task",

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
    listCustomer: prefixAdmin + "/maCustomer/customers",
    listCustomerByType: prefixAdmin + "/ma/customer/get",
    listCustomerByCareer: prefixAdmin + "/ma/statistic/custCareer",
    listCustomerByCustGroup: prefixAdmin + "/ma/statistic/custGroup",
    listCustomerByCustCard: prefixAdmin + "/ma/statistic/custCard",
    listCustomerByDate: prefixAdmin + "/ma/statistic/byDate",
    detailCustomer: prefixAdmin + "/maCustomer/result",
    deleteCustomer: prefixAdmin + "/maCustomer/delete",
    updateMapping: prefixAdmin + "/maMapping/update",
    detailMapping: prefixAdmin + "/maMapping/get",
  },

  // chiến dịch bán hàng
  campaignMarketing: {
    list: prefixAdmin + "/marketing/list",
    update: prefixAdmin + "/marketing/update",
    updateStatus: prefixAdmin + "/marketing/update/status",
    detail: prefixAdmin + "/marketing/get",
    delete: prefixAdmin + "/marketing/delete",
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
    listWorkflowCloud: prefixAdmin + "/workflowStatus/list",
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

    lstEform: prefixAdmin + "/bpm/list/eform",
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
  tenderPackage: {
    list: prefixApplication + "/tenderPackage/list",
    update: prefixApplication + "/tenderPackage/update",
    detail: prefixApplication + "/tenderPackage/get",
    delete: prefixApplication + "/tenderPackage/delete",

    listBiddingInvitation: prefixApplication + "/tenderInvitation/list",
    listContractor: prefixApplication + "/tenderInvitation/list_contractor",
    updateBidding: prefixApplication + "/tenderInvitation/update",
    cancelBidding: prefixApplication + "/tenderInvitation/cancel",
    detailBiddingInvitation: prefixApplication + "/tenderInvitation/get",
    updateBiddingStatus: prefixApplication + "/tenderInvitation/update/bidding_status",
    listSubmittedDocument: prefixApplication + "/submittedDocument/list",
    //Mở thầu
    openBidding: prefixApplication + "/tenderOpening/update",

    //Đánh giá hồ sơ dự thầu
    updateBatch: prefixApplication + "/documentEvaluation/updateBatch",

    //Gửi đánh giá cho thư ký tổng hợp
    submitReview: prefixApplication + "/submittedDocument/submit_review/update",

    //tổng hợp kết quả đánh giá hồ sơ kỹ thuật trên màn hình thư ký
    getResultDocumentEvaluation: prefixApplication + "/documentEvaluation/getResult",

    //tổng hợp kết quả đánh giá hồ sơ tài chính trên màn hình thư ký
    getResultFinanceEvaluation: prefixApplication + "/documentEvaluation/getFinances",

    //Gửi phản hồi kết quả đánh giá
    sendEvaluation: prefixApplication + "/documentEvaluation/sendEvaluation",

    ///Gửi tổng hợp yêu cầu làm rõ
    updateGeneralClarification: prefixApplication + "/generalClarification/update",
    listGeneralClarification: prefixApplication + "/generalClarification/list",

    //Gia hạn gói thầu
    extensionHistory: prefixApplication + "/extensionHistory/insert",
    detailExtensionRequest: prefixApplication + "/extensionRequest/get",
    listExtensionHistory: prefixApplication + "/extensionHistory/list",
  },
  grid: {
    list: prefixAdmin + "/artifactGridHeader/list",

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
    list: prefixAdmin + "/marketingBudget/list",
    update: prefixAdmin + "/marketingBudget/update",
    updateStatus: prefixAdmin + "/marketingBudget/update/status",
    detail: prefixAdmin + "/marketingBudget/get",
    delete: prefixAdmin + "/marketingBudget/delete",
  },

  //kênh MA
  marketingChannel: {
    list: prefixAdmin + "/marketingChannel/list",
    update: prefixAdmin + "/marketingChannel/update",
    detail: prefixAdmin + "/marketingChannel/get",
    delete: prefixAdmin + "/marketingChannel/delete",
  },

  //đo lường MA
  marketingMeasurement: {
    list: prefixAdmin + "/marketingMeasurement/list",
    update: prefixAdmin + "/marketingMeasurement/update",
    detail: prefixAdmin + "/marketingMeasurement/get",
    delete: prefixAdmin + "/marketingMeasurement/delete",
  },

  //đo lường MA
  marketingReport: {
    list: prefixAdmin + "/marketingReport/list",
    update: prefixAdmin + "/marketingReport/update",
    detail: prefixAdmin + "/marketingReport/get",
    delete: prefixAdmin + "/marketingReport/delete",
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
    lst: prefixAdmin + "/objectFeature/list",
    update: prefixAdmin + "/objectFeature/update",
    delete: prefixAdmin + "/objectFeature/delete",
    detail: prefixAdmin + "/objectFeature/detail",
  },

  // Khảo sát khách hàng
  surveyForm: {
    lst: prefixAdmin + "/surveyForm/list",
    update: prefixAdmin + "/surveyForm/update",
    delete: prefixAdmin + "/surveyForm/delete",
    detail: prefixAdmin + "/surveyForm/get",
    statistic: prefixAdmin + "/survey",
    submitVoc: "https://reborn.vn/log-capture/crm/survey",
  },

  //báo giá
  offer: {
    list: prefixAdmin + "/offer/list/v2",
    create: prefixAdmin + "/offer/create",
    offerDetail: prefixAdmin + "/offerDetail/import",
    cardService: prefixAdmin + "/offerDetail/cardService",
    // Tạo báo giá
    offerDetailCustomer: prefixAdmin + "/offerDetail/customer",
    // Xem chi tiết báo giá
    offerDetailList: prefixAdmin + "/offerDetail/list",
    // Hủy báo giá
    cancelOffer: prefixAdmin + "/offer/delete",
    // lấy danh sách thu tiền, chi tiền của khách
    debtOffer: prefixAdmin + "/offer/debt",
    // lưu tạm hóa đơn
    temporarilyOffer: prefixAdmin + "/offer/update/temp",
  },

  offerService: {
    addToInvoice: prefixAdmin + "/offerService/update",
    delete: prefixAdmin + "/offerService/delete",
    update: prefixAdmin + "/offerService/update",
    detail: prefixAdmin + "/offerService/get",
    getByCustomer: prefixAdmin + "/offerService/getBoughtServiceByCustomerId",
  },
  offerProduct: {
    list: prefixAdmin + "/offerProduct/list",
    addToInvoice: prefixAdmin + "/offerProduct/update",
    delete: prefixAdmin + "/offerProduct/delete",
    update: prefixAdmin + "/offerProduct/update",
    detail: prefixAdmin + "/offerProduct/get",
    getByCustomer: prefixAdmin + "/offerProduct/getBoughtProductByCustomerId",
  },
  offerCard: {
    list: prefixAdmin + "/offerCardService/list",
    add: prefixAdmin + "/offerCardService/update",
    delete: prefixAdmin + "/offerCardService/delete",
    update: prefixAdmin + "/offerCardService/update/cardNumber",
  },

  // fs
  fs: {
    lst: prefixAdmin + "/fs/list",
    update: prefixAdmin + "/fs/update",
    updateAndInit: prefixAdmin + "/fs/update-and-init",
    delete: prefixAdmin + "/fs/delete",
    detail: prefixAdmin + "/fs/get",
    cloneFs: prefixAdmin + "/fs/clone",
    updateStatus: prefixAdmin + "/fs/update/status",
    resetSignal: prefixAdmin + "/approvalObject/reset",
    // cấu hình form fs
    fsFormLst: prefixAdmin + "/fsForm/list",
    fsFormUpdate: prefixAdmin + "/fsForm/update",
    fsFormDelete: prefixAdmin + "/fsForm/delete",
    fsFormUpdatePostion: prefixAdmin + "/fsForm/update/position",
  },

  // quote
  quote: {
    lst: prefixAdmin + "/quote/list",
    update: prefixAdmin + "/quote/update",
    delete: prefixAdmin + "/quote/delete",
    cloneQuote: prefixAdmin + "/quote/clone",
    updateStatus: prefixAdmin + "/quote/update/status",
    resetSignal: prefixAdmin + "/approvalObject/reset",
    // cấu hình form quote
    quoteFormLst: prefixAdmin + "/quoteForm/list",
    quoteFormUpdate: prefixAdmin + "/quoteForm/update",
    quoteFormDelete: prefixAdmin + "/quoteForm/delete",
    quoteFormUpdatePostion: prefixAdmin + "/quoteForm/update/position",

    lstQuoteContract: prefixAdmin + "/contractQuote/list",
    updateQuoteContract: prefixAdmin + "/contractQuote/update",
    deleteQuoteContract: prefixAdmin + "/contractQuote/deleteByQuoteId",
  },

  /**
   * Lịch sử phê duyệt trên form
   */
  approvedObjectLog: {
    lst: prefixBpm + "/approvedObjectLog/list",
  },

  // cài đặt quy trình
  approval: {
    lst: prefixAdmin + "/approval/list",
    update: prefixAdmin + "/approval/update",
    delete: prefixAdmin + "/approval/delete",
    updateStatus: prefixAdmin + "/approval/update/status",
    //config
    lstConfig: prefixAdmin + "/approvalConfig/list",
    updateConfig: prefixAdmin + "/approvalConfig/update",
    deleteConfig: prefixAdmin + "/approvalConfig/delete",
    //link
    lstLink: prefixAdmin + "/approvalLink/list",
    updateLink: prefixAdmin + "/approvalLink/update",
    deleteLink: prefixAdmin + "/approvalLink/delete",
    //object
    lstObject: prefixAdmin + "/approvalObject/list",
    updateObject: prefixAdmin + "/approvalObject/update",
    deleteObject: prefixAdmin + "/approvalObject/delete",
    takeObject: prefixAdmin + "/approvalObject/get/object",
    checkApproved: prefixAdmin + "/approvalObject/checkApproved",
    //log
    lstLog: prefixAdmin + "/approvalLog/list",
    updateLog: prefixAdmin + "/approvalLog/update",
    deleteLog: prefixAdmin + "/approvalLog/delete",

    //alert
    updateAlert: prefixAdmin + "/approval/update/alertConfig",
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
    list: prefixAdmin + "/gift/list",
    update: prefixAdmin + "/gift/update",
    updateObjectId: prefixAdmin + "/gift/update_objectid",
    delete: prefixAdmin + "/gift/delete",
  },
  // đoạn này tạo ra mã qr code
  qrCode: {
    list: prefixAdmin + "/qrCode/list",
    update: prefixAdmin + "/qrCode/update",
    delete: prefixAdmin + "/qrCode/delete",
    detail: prefixAdmin + "/qrCode/get",
  },
  // cài đặt mẫu hợp đồng
  sheetQuoteForm: {
    list: prefixAdmin + "/sheet/list",
    update: prefixAdmin + "/sheet/update",
    delete: prefixAdmin + "/sheet/delete",
    detail: prefixAdmin + "/sheet/get",
  },
  sheetFieldQuoteForm: {
    list: prefixAdmin + "/sheetField/list",
    update: prefixAdmin + "/sheetField/update",
    updatePosition: prefixAdmin + "/sheetField/update/position",
    delete: prefixAdmin + "/sheetField/delete",
    detail: prefixAdmin + "/sheetField/get",
  },

  ///BPM

  common: {
    list: prefixAdmin + "/common/list",
    update: prefixAdmin + "/common/update",
    detail: prefixBpm + "/common/get",
    delete: prefixAdmin + "/common/delete",
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
    list: prefixAdmin + "/objectExtraInfo/list",
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

  schedule_next: "/schedule_next",
  schedule: "/schedule",
  timekeeping: "/timekeeping",
  cashbook: "/cashbook",
  cxmSurvey: "/cxm_survey",

  // Fanpage 
  fanpage: "/fanpage",
  total_chat: "/total_chat",

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
  earnings: "/earnings",
  payment_history: "/payment_history",
  customer_care: "/customer_care",
  crm_campaign: "/crm_campaign",
  finance_management: "/finance_management",
  finance_management_dashboard: "/finance_management/dashboard",
  finance_management_cashbook: "/finance_management/cashbook",
  finance_management_cashbook_template: "/finance_management/cashbook_template",
  finance_management_fund_management: "/finance_management/fund_management",
  finance_management_debt_management: "/finance_management/debt_management",
  finance_management_debt_transaction: "/finance_management/debt_transaction",
  finance_management_shift_inventory: "/finance_management/shift_inventory",
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
  invoiceVAT: "/invoiceVAT",
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
  dashboard_loyalty: "/dashboard_loyalty",
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

  // Cài đặt vận hành
  ortherFee: "/orther_fee",
  // utilityReading: "/utility_reading",
  electricityIndex: "/electricity_index",
  waterIndex: "/water_index",
  spaceCustomer: "/space_customer",
  managementFee: "/management_fee",
  vehicleRegistration: "/vehicle_registration",
  vehicle: "/vehicle",
  building: "/building",
  buildingFloor: "/building_floor",
  //quản lý nguyên vật liệu
  material: "/material",

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
  //Loại luật nghiệp vụ
  business_rule: "/bpm/business_rule",
  business_rule_config: "/bpm/business_rule_config/:id",
};

export default urls;
