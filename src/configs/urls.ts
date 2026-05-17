// Đã migrate: toàn bộ endpoint /adminapi/* → biz.reborn.vn/customer/*.
const prefixCustomer = (process.env.APP_CUSTOMER_API_URL || "https://biz.reborn.vn") + "/customer";
const prefixBiz = "/bizapi";
// const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";
const prefixBpm = process.env.APP_BPM_URL + "/bpmapi";
// const prefixBPM = "https://bpm.reborn.vn/bpmapi";
const prefixApi = "/api";
const prefixAuthenticator = "/authenticator";
const prefixSale = "/sale";
const prefixSales = prefixBiz + "/sales";
const prefixSystem = "/system";
const prefixCs = "/cs";
const prefixApplication = "/application";
const prefixHr = "/hr";
const prefixRebornVn = (process.env.APP_AUTHENTICATOR_URL || "https://reborn.vn") + "/api";
const prefixCloudMarket = (process.env.APP_API_URL || "https://cloud.reborn.vn") + "/market";
const prefixConnect = process.env.APP_CONNECT_URL || "https://connect.reborn.vn";
const prefixUpload = process.env.APP_UPLOAD_URL || "https://login.noron.vn";
const prefixAthena = process.env.APP_ATHENA_URL || "https://api-athenaspear-prod.athenafs.io";
const prefixNotification = prefixBiz + "/notification";
const prefixFinance = prefixBiz + "/finance";
const prefixInventory = prefixBiz + "/inventory";
const prefixWarehouse = prefixBiz + "/warehouse";
const prefixCare = prefixBiz + "/care";
const prefixBilling = prefixBiz + "/billing";
const prefixLogistics = prefixBiz + "/logistics";
const prefixIntegration = prefixBiz + "/integration";
const prefixMarket = prefixBiz + "/market";

export const urlsApi = {
  // logout: prefixAuthenticator + "/user/logout",
  dashboard: {
    detail: prefixSales + "/invoice/dashboard",
  },
  shortcut: {
    get: prefixSales + "/user-shortcut/get",
    update: prefixSales + "/user-shortcut/update",
  },
  beautySalon: {
    list: prefixRebornVn + "/beauty-salon/list",
    approve: prefixRebornVn + "/beauty-salon/approve",
    delete: prefixRebornVn + "/beauty-salon/delete",
  },
  businessRule: {
    list: prefixBpm + "/business-rule/list",
    update: prefixBpm + "/business-rule/update",
    updateActive: prefixBpm + "/business-rule/update-active",
    detail: prefixBpm + "/business-rule/detail",
    delete: prefixBpm + "/business-rule/delete",
  },
  businessRuleItem: {
    list: prefixBpm + "/business-rule-item/list",
    update: prefixBpm + "/business-rule-item/update",
    updateActive: prefixBpm + "/business-rule-item/update-active",
    detail: prefixBpm + "/business-rule-item/detail",
    delete: prefixBpm + "/business-rule-item/delete",
  },
  decisionTableInput: {
    list: prefixBpm + "/decision-table-input/list",
    update: prefixBpm + "/decision-table-input/update",
    updateActive: prefixBpm + "/decision-table-input/update-active",
    detail: prefixBpm + "/decision-table-input/detail",
    delete: prefixBpm + "/decision-table-input/delete",
  },
  decisionTableOutput: {
    list: prefixBpm + "/decision-table-output/list",
    update: prefixBpm + "/decision-table-output/update",
    updateActive: prefixBpm + "/decision-table-output/update-active",
    detail: prefixBpm + "/decision-table-output/detail",
    delete: prefixBpm + "/decision-table-output/delete",
  },
  user: {
    create: prefixAuthenticator + "/user/create",
    update: prefixAuthenticator + "/user/admin-update",
    profile: prefixAuthenticator + "/user/me",
    detail: prefixAuthenticator + "/user/get",
    basicInfo: prefixAuthenticator + "/user/basic-info",
    selectUsers: prefixAuthenticator + "/user/select",
    resetPass: prefixAuthenticator + "/user/reset-pass",
    changePass: prefixAuthenticator + "/user/change-pass",
    checkLogin: prefixCustomer + "/user-login/list",
    detailTimeLogin: prefixCustomer + "/user-login/daily/list",
    list: prefixAuthenticator + "/user/list",
    delete: prefixAuthenticator + "/user/delete",
    fcmDevice: prefixNotification + "/fcm-device/update",
  },
  notificationHistory: {
    list: prefixNotification + "/firebase-delivery-history/list",
    update: prefixNotification + "/firebase-delivery-history/update",
    detail: prefixNotification + "/firebase-delivery-history/get",
    delete: prefixNotification + "/firebase-delivery-history/delete",

    updateUnread: prefixNotification + "/firebase-delivery-history/update/unread",
    updateReadAll: prefixNotification + "/firebase-delivery-history/update/read-all",
    countUnread: prefixNotification + "/firebase-delivery-history/count",
  },

  customer: {
    filter: prefixCustomer + "/customer/list-paid/basic",
    listshared: prefixCustomer + "/customer/list-paid/basic/shared",
    update: prefixCustomer + "/customer/update",
    telesaleCallList: prefixCare + "/telesale-call/list",
    telesaleCallUpdate: prefixCare + "/telesale-call/update",
    updateByField: prefixCustomer + "/customer/update/by-field",
    delete: prefixCustomer + "/customer/delete",
    deleteAll: prefixCustomer + "/customer/delete",
    checkInProcess: prefixCustomer + "/customer/check-in-process",
    link: prefixCustomer + "/customer/link-user",
    detail: prefixCustomer + "/customer/get",
    area: prefixRebornVn + "/area/child",

    // api lấy ra thông tin khách hàng dựa theo id
    listById: prefixCustomer + "/customer/list-by-id",
    // Cập nhập hàng loạt
    updateCustomerGroup: prefixCustomer + "/customer/update-batch/customer-group",
    updateOneRelationship: prefixCustomer + "/customer/update/relationship",
    updateCustomeRelationship: prefixCustomer + "/customer/update-batch/relationship",
    updateCustomerSource: prefixCustomer + "/customer/update-batch/customer-source",
    updateCustomerEmployee: prefixCustomer + "/customer/update-batch/employee",
    // Lịch điều trị
    updateScheduler: prefixCustomer + "/customer-scheduler/update",
    filterScheduler: prefixCustomer + "/customer-scheduler/list",
    cancelScheduler: prefixCustomer + "/customer-scheduler/cancel",
    detailScheduler: prefixCustomer + "/customer-scheduler/get",
    // Trao đổi
    customerExchangeList: prefixCustomer + "/customer-exchange/list",
    customerExchangeUpdate: prefixCustomer + "/customer-exchange/update",
    customerExchangeDelete: prefixCustomer + "/customer-exchange/delete",
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

    addOther: prefixCustomer + "/customer-viewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCustomerViewer: prefixCustomer + "/customer-viewer/update",
    // lấy về danh sách người xem
    lstCustomerViewer: prefixCustomer + "/customer-viewer/list",
    // xóa đi 1 người xem
    deleteCustomerViewer: prefixCustomer + "/customer-viewer/delete",
    // thêm khách hàng vào chương trình MA
    addCustomerMA: prefixCustomer + "/ma-customer/insert-list",
    // điền số lượng bản ghi muốn hiển thị
    numberFieldCustomer: prefixCustomer + "/customer/export/random-customers",
    // import khách hàng b2
    autoProcess: prefixCustomer + "/customer/import/auto-process",
    // import khách hàng b3
    manualProcess: prefixCustomer + "/customer/import/manual-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/customer/import",
    // tương tác khách hàng
    customerReport: prefixCustomer + "/customer-report/summary-action",
    // chi tiết tương tác khách hàng
    detailCustomerReport: prefixCustomer + "/customer-report/summary-action/detail",
    // danh sách các file đã tải
    lstAttachments: prefixCustomer + "/customer-exchange/attachment/list",
    // chi tiết tương tác từng khách hàng trong màn hình chi tiết khách hàng
    descCustomerReport: prefixCustomer + "/customer-report/action/list",
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
    filterTable: prefixCustomer + "/customer-attribute/list-filter",
    // lấy ra các trường, để tải dữ liệu mẫu về
    exAttributes: prefixCustomer + "/customer/export/attributes",
    // đoạn này tạo cơ hội cho khách hàng doanh nghiệp
    createOpportunity: prefixCustomer + "/opportunity/update",
    lstOpportunity: prefixCustomer + "/opportunity/list",
    deleteOpportunity: prefixCustomer + "/opportunity/delete",
    detailOpportunity: prefixCustomer + "/opportunity/get",

    // danh sách upload
    lstUpload: prefixCustomer + "/customer-upload/list",

    // Change-log hồ sơ KHTV — audit trail từng trường
    changeLog: prefixCustomer + "/customer-change-log/list",

    // api phân tích chân dung khách hàng
    classifyAge: prefixCustomer + "/api/v1/customer/classify/age",
    classifyGender: prefixCustomer + "/api/v1/customer/classify/gender",
    classifyIdentify: prefixCustomer + "/api/v1/customer/classify/identify",
    classifyTopRevenue: prefixCustomer + "/api/v1/customer/classify/top-revenue",
    classifyTopBought: prefixCustomer + "/api/v1/customer/classify/top-bought",
    classifyTopValueInvoice: prefixCustomer + "/api/v1/customer/classify/top-value-invoice",
    classifyNotInteractDay: prefixCustomer + "/api/v1/customer/classify/not-interact-day",
    classifyTopInteract: prefixCustomer + "/api/v1/customer/classify/top-interact",
    classifyCampaignJoined: prefixCustomer + "/api/v1/customer/classify/campaign-joined",
    classifyCustType: prefixCustomer + "/api/v1/customer/classify/cust-type",
    classifyCustGroup: prefixCustomer + "/api/v1/customer/classify/cust-group",
    classifyCustSource: prefixCustomer + "/api/v1/customer/classify/cust-source",
    classifyCustCareer: prefixCustomer + "/api/v1/customer/classify/cust-career",
    classifyCustArea: prefixCustomer + "/api/v1/customer/classify/cust-area",
    classifyCustomerCard: prefixCustomer + "/api/v1/customer/classify/customer-card",
    classifyInteractTimes: prefixCustomer + "/api/v1/customer/classify/interact-times",

    // gợi ý các sản phẩm/dịch vụ cho khách hàng
    serviceSuggestions: prefixCustomer + "/customer-object/list",
    // api khác để làm
    serviceSuggestionsv2: prefixCustomer + "/customer-object/get-top",

    // lấy ra các field động view nên chart
    fieldChart: prefixCustomer + "/customer/dashboard/fields",
    lstChartDynamicChart: prefixCustomer + "/customer/dashboard/list",
    updateChartDynamicChart: prefixCustomer + "/customer/dashboard/update",
    deleteChartDynamicChart: prefixCustomer + "/customer/dashboard/delete",
    detailChartDynamicChart: prefixCustomer + "/customer/dashboard/get",
    viewChartDynamicChart: prefixCustomer + "/customer/dashboard/fetch-data",

    //export multi
    exportMulti: prefixCustomer + "/customer/export/multi",

    //create call tnex-athena
    loginAccountAthena: prefixAthena + "/api/v1/account/login",
    createCall: prefixAthena + "/api/v1/call-history/create-call",

    //lấy tài khoản tổng đài
    getAccountCall: prefixCustomer + "/employee-agent/employee-id",
    reloadData: prefixCustomer + "/customer/move-to-es",

    // chia data khách hàng Tnex
    customerAssign: prefixCustomer + "/customer/assign",
  },

  careScenario: {
    list: prefixBiz + "/market/care-scenario/list",
    stats: prefixBiz + "/market/care-scenario/stats",
    get: prefixBiz + "/market/care-scenario/get",
    update: prefixBiz + "/market/care-scenario/update",
    toggleActive: prefixBiz + "/market/care-scenario/toggle-active",
    delete: prefixBiz + "/market/care-scenario/delete",
  },

  // GHD api chống chế =))))))))))))
  payroll: {
    export: prefixCustomer + "/payroll/export",
  },

  partner: {
    list: prefixCustomer + "/business-partner/list-paid",
    update: prefixCustomer + "/business-partner/update",
    detail: prefixCustomer + "/business-partner/get",
    delete: prefixCustomer + "/business-partner/delete",
    downloadFile: prefixCustomer + "/business-partner/import",
    // lấy số điện thoại khi bị che
    viewPhone: prefixCustomer + "/business-partner/get/phone",
    // lấy email khi bị che
    viewEmail: prefixCustomer + "/business-partner/get/email",

    numberFieldPartner: prefixCustomer + "/business-partner/export/random-business-partners",
    autoProcess: prefixCustomer + "/business-partner/import/auto-process",
    exAttributes: prefixCustomer + "/business-partner/export/attributes",

    // lấy thuộc tính vào bảng filter
    filterTable: prefixCustomer + "/business-partner/list-filter",

    // Trao đổi
    partnerExchangeList: prefixCustomer + "/business-partner-exchange/list",
    partnerExchangeUpdate: prefixCustomer + "/business-partner-exchange/update",
    partnerExchangeDelete: prefixCustomer + "/business-partner-exchange/delete",
  },

  partnerExtraInfo: {
    list: prefixCustomer + "/business-partner-extra-info/list",
  },

  partnerAttribute: {
    list: prefixCustomer + "/business-partner-attribute/list",
    update: prefixCustomer + "/business-partner-attribute/update",
    delete: prefixCustomer + "/business-partner-attribute/delete",
    listAll: prefixCustomer + "/business-partner-attribute/list-all",
    checkDuplicated: prefixCustomer + "/business-partner-attribute/check-duplicated",
  },

  project: {
    list: prefixCustomer + "/work-project/list",
    update: prefixCustomer + "/work-project/update",
    detail: prefixCustomer + "/work-project/get",
    delete: prefixCustomer + "/work-project/delete",
  },

  projectReport: {
    report: prefixCustomer + "/cashbook/report",
  },


  historySend: {
    historySendSMS: prefixCustomer + "/customer-sms/list",
    historySendEmail: prefixCustomer + "/customer-email/list",
    historySendZalo: prefixCustomer + "/customer-zalo/list",
  },
  sendSMS: {
    // thêm, sửa, xóa danh sách gửi sms
    listSMS: prefixCustomer + "/sms-request/list",
    updateSMS: prefixCustomer + "/sms-request/update",
    detailSMS: prefixCustomer + "/sms-request/get",
    deleteSMS: prefixCustomer + "/sms-request/delete",
    approveSMS: prefixCustomer + "/sms-request/approve",
    cancelSMS: prefixCustomer + "/sms-request/cancel",
  },
  sendEmail: {
    // thêm, sửa, xóa danh sách gửi email
    listEmail: prefixCustomer + "/email-request/list",
    updateEmail: prefixCustomer + "/email-request/update",
    detailEmail: prefixCustomer + "/email-request/get",
    deleteEmail: prefixCustomer + "/email-request/delete",
    approveEmail: prefixCustomer + "/email-request/approve",
    cancelEmail: prefixCustomer + "/email-request/cancel",
  },
  estimate: {
    takeEstimate: prefixCustomer + "/customer/estimate",
  },
  invoice: {
    createInvoice: prefixSales + "/invoice/draft/create",
    draftList: prefixSales + "/invoice/draft/list",
    draftListWithProducts: prefixSales + "/invoice/draft/list-with-products",
    draftDelete: prefixSales + "/invoice/draft/delete",
    list: prefixSales + "/invoice/list/v2",
    customerStats: prefixSales + "/invoice/customer-stats",
    export: prefixSales + "/invoice/export",
    tabCounts: prefixSales + "/invoice/tab-counts",
    create: prefixSales + "/invoice/create",
    invoiceDetail: prefixSales + "/invoice-detail/get",
    cardService: prefixSales + "/invoice-detail/card-service",
    // Tạo hóa đơn bán hàng
    invoiceDetailCustomer: prefixSales + "/invoice-detail/customer",
    // Xem chi tiết hóa đơn
    invoiceDetailList: prefixSales + "/invoice-detail/get",
    // Hủy hóa đơn
    cancelInvoice: prefixSales + "/invoice/delete",
    // vinh danh bán hàng
    sales: prefixSales + "/invoice/get/sales",
    // lấy danh sách thu tiền, chi tiền của khách
    debtInvoice: prefixSales + "/invoice/debt",
    // lưu tạm hóa đơn
    temporarilyInvoice: prefixSales + "/invoice/update/temp",
    // lịch sử tiêu dùng thẻ
    historyUseCard: prefixSales + "/invoice/using/card",
    // lấy mã hoá đơn
    invoiceCode: prefixSales + "/invoice/code",
    // Gửi biên lai qua email
    sendEmail: prefixSales + "/invoice/send-email",
    salesReport: {
      posSummary: prefixSales + "/report/pos-summary",
      summary: prefixSales + "/report/summary",
      dailySeries: prefixSales + "/report/daily-series",
      channelBreakdown: prefixSales + "/report/channel-breakdown",
      full: prefixSales + "/report/sales",
      debtSummary: prefixSales + "/report/debt-summary",
    },
  },
  // Hóa đơn VAT điện tử – tích hợp Viettel S-Invoice qua cloud-integration
  sinvoice: {
    previewDraft: prefixIntegration + "/sinvoice/query/preview-draft",
    createInvoice: prefixIntegration + "/sinvoice/invoice/create",
    sendEmailCustomer: prefixIntegration + "/sinvoice/ext/send-email-customer",
    allTemplates: prefixIntegration + "/sinvoice/ext/all-templates",
    searchInvoices: prefixIntegration + "/sinvoice/query/search",
    logList: prefixIntegration + "/sinvoice/log/list",
    logGet: prefixIntegration + "/sinvoice/log/get",
    adjustInvoice: prefixIntegration + "/sinvoice/invoice/adjust",
    configGet: prefixIntegration + "/sinvoice/config/get",
    configSave: prefixIntegration + "/sinvoice/config/save",
  },
  returnInvoice: {
    list: prefixSales + "/invoice/return-exchange/list",
    export: prefixSales + "/invoice/export",
    detail: prefixSales + "/invoice/get",
    getReturnItems: prefixSales + "/invoice/get/return",
    createReturn: prefixSales + "/invoice/create/return",
    createExchange: prefixSales + "/invoice/create/exchange",
    variantListDetail: prefixInventory + "/product-variant/list-detail", // ← THÊM DÒNG NÀY
    confirm: prefixSales + "/invoice/return/confirm",
  },
  invoiceImport: {
    update: prefixInventory + "/invoice/import/update",
    get: prefixInventory + "/invoice/import/get",
    list: prefixInventory + "/invoice/import/list",
    summary: prefixInventory + "/invoice/import/summary",
    approve: prefixInventory + "/invoice/import/approve",
    cancel: prefixInventory + "/invoice/import/cancel",
  },
  stockInitImport: {
    template: prefixInventory + "/stock-init/import/template",
    upload: prefixInventory + "/stock-init/import/upload",
    confirm: prefixInventory + "/stock-init/import/confirm",
    cancel: prefixInventory + "/stock-init/import/cancel",
  },
  shipping: {
    create: prefixLogistics + "/shipment/create",
    list: prefixLogistics + "/shipment/list",
    shipment: prefixLogistics + "/shipment",
    wards: prefixIntegration + "/address/wards",
    districts: prefixIntegration + "/address/districts",
    provinces: prefixIntegration + "/address/provinces",
  },

  // --- Quản lý đơn vị vận chuyển (Shipping Partner Setup) ---
  shippingPartner: {
    // Danh sách hãng VC + stats hôm nay — từ logistics service
    carrierList: prefixLogistics + "/carrier/list",
    // Trạng thái kết nối (isConnected, apiKeyMasked) — từ integration service
    carrierConfigs: prefixIntegration + "/carrier/configs",
    // Lưu API key/token kết nối hãng VC
    connect: prefixIntegration + "/carrier/connect",
    // Ngắt kết nối hãng VC
    disconnect: prefixIntegration + "/carrier/disconnect",
  },

  // --- Cấu hình phí vận chuyển nội bộ (ShippingFeeConfig) ---
  shippingFeeConfig: {
    // GET — lấy cấu hình hiện tại (regionFees + orderValueFees)
    get: prefixLogistics + "/fee-config",
    // POST — lưu toàn bộ cấu hình (replace all)
    save: prefixLogistics + "/fee-config/save",
    // GET — gợi ý phí ship khi tạo đơn: ?provinceName=...&orderValue=...
    suggest: prefixLogistics + "/fee-config/suggest",
  },
  boughtService: {
    addToInvoice: prefixCustomer + "/bought-service/update",
    delete: prefixCustomer + "/bought-service/delete",
    update: prefixCustomer + "/bought-service/update",
    detail: prefixCustomer + "/bought-service/get",
    getByCustomer: prefixCustomer + "/bought-service/get-bought-service-by-customer-id",
  },
  boughtProduct: {
    insert: prefixSales + "/bought-product/insert-batch",
    list: prefixCustomer + "/bought-product/list",
    addToInvoice: prefixCustomer + "/bought-product/update",
    delete: prefixCustomer + "/bought-product/delete",
    update: prefixCustomer + "/bought-product/update",
    detail: prefixCustomer + "/bought-product/get",
    getByCustomer: prefixCustomer + "/bought-product/get-bought-product-by-customer-id",
  },
  boughtCard: {
    list: prefixCustomer + "/bought-card-service/list",
    listLoyaltyPoint: prefixCustomer + "/loyalty-point-ledger/list",
    add: prefixCustomer + "/bought-card-service/update",
    delete: prefixCustomer + "/bought-card-service/delete",
    update: prefixCustomer + "/bought-card-service/update/card-number",
    updateCustomerCard: prefixCustomer + "/bought-card/update",
    listBoughtCardByCustomerId: prefixCustomer + "/bought-card-service/get-bought-card-service-by-customer-id",
  },
  product: {
    filterWarehouse: prefixWarehouse + "/product/in-warehouse",
    list: prefixInventory + "/product/list",
    topProduct: prefixSales + "/invoice/top-product",
    topProductV2: prefixSales + "/invoice/top-product/v2",
    topProductExport: prefixSales + "/invoice/top-product/export",
    detail: prefixInventory + "/product/get",
    update: prefixInventory + "/product/update",
    updateContent: prefixInventory + "/product/update/content",
    delete: prefixInventory + "/product/delete",

    //danh sách sản phẩm của đối tác
    listShared: prefixCustomer + "/product/list/shared",

    // ── Warehouse API (tài liệu mới) ──
    wList: prefixInventory + "/product/list",
    wDetail: prefixInventory + "/product/get",
    wUpdate: prefixInventory + "/product/update",
    wDelete: prefixInventory + "/product/delete",
    wDashboard: prefixInventory + "/product/dashboard/summary",
    wUpdateStatus: prefixInventory + "/product/update/status",
    wUpdatePrice: prefixInventory + "/product/update/price",
    wUpdateInventory: prefixInventory + "/product/update/inventory-setting",
    wWebsiteSettingGet: prefixInventory + "/product/website-setting/get",
    wWebsiteSettingUpdate: prefixInventory + "/product/website-setting/update",
    wWebsiteSettingUpdateShowOnWebsite: prefixInventory + "/product/website-setting/update/show-on-website",
    wWebsiteSettingUpdateShowImage: prefixInventory + "/product/website-setting/update/show-image",
    wWebsiteSettingUpdateShowUnit: prefixInventory + "/product/website-setting/update/show-unit",
    wWebsiteSettingUpdateShowDescription: prefixInventory + "/product/website-setting/update/show-description",
    wWebsiteSettingUpdateShowPromotionPrice: prefixInventory + "/product/website-setting/update/show-promotion-price",
    wWebsiteSettingUpdateShowWholesalePrice: prefixInventory + "/product/website-setting/update/show-wholesale-price",
    wWebsiteSettingUpdateShowInventory: prefixInventory + "/product/website-setting/update/show-inventory",
    wWebsiteSettingUpdateShowBarcode: prefixInventory + "/product/website-setting/update/show-barcode",
    wWebsiteSettingUpdateShowVariant: prefixInventory + "/product/website-setting/update/show-variant",
    wWebsiteSettingUpdateHideWhenOutOfStock: prefixInventory + "/product/website-setting/update/hide-when-out-of-stock",
    wWebsiteSettingDefaultGet: prefixInventory + "/product/website-setting/default",
    wWebsiteSettingDefaultUpdate: prefixInventory + "/product/website-setting/default/update",
    wWebsiteToggle: prefixInventory + "/product/update/website-toggle",
    wInventoryCurrent: prefixInventory + "/product/inventory/current",
    wScan: prefixInventory + "/product/scan",
    // ── Content (mô tả chi tiết dạng editor) ──
    wDescriptionGet: prefixInventory + "/product-description/get",
    wDescriptionUpdate: prefixInventory + "/product-description/update",
    // ── Tags ──
    wTagList: prefixInventory + "/product/tags/list",
    wTagUpdate: prefixInventory + "/product/tags/update",
    wTagCreate: prefixInventory + "/product-tag/update", // dùng lại endpoint tag CRUD
    // ── Import ──
    wExport: prefixInventory + "/product/export",
    wImportTemplate: prefixInventory + "/product/import/template",
    wImportUpload: prefixInventory + "/product/import/upload-file",
    wImportErrorFile: prefixInventory + "/product/import/error-file",
    wImportConfirm: prefixInventory + "/product/import/confirm",
    wImportCancel: prefixInventory + "/product/import/cancel",
    listById: prefixCustomer + "/product/list-by-id",
    publicList: prefixInventory + "/public/product/list",

    // ── Public APIs (không cần auth) ──
    publicDetail: prefixInventory + "/public/product/get",
    publicCategoryList: prefixInventory + "/public/product/category/list",
    publicMediaList: prefixInventory + "/public/product/media/list",

    // ── Media APIs (cần auth) ──
    mediaList: prefixInventory + "/product-media/list",
    mediaUpdate: prefixInventory + "/product-media/update",
    mediaDelete: prefixInventory + "/product-media/delete",
    mediaUpload: prefixInventory + "/product-media/upload",
    categoryMediaGet: prefixInventory + "/category-media/get",
    categoryMediaUpdate: prefixInventory + "/category-media/update",
    categoryMediaDelete: prefixInventory + "/category-media/delete",
    categoryMediaUpload: prefixInventory + "/category-media/upload",

    // ── Variant Groups ──
    variantGroupsUpdate: prefixInventory + "/product/variant-groups/update",
    variantGroupsDelete: prefixInventory + "/product/variant-groups/delete",
    variantDelete: prefixInventory + "/product/variant/delete",

    // ── Specifications ──
    specificationsUpdate: prefixInventory + "/product/specifications/update",
    specificationsDelete: prefixInventory + "/product/specifications/delete",
  },

  //warehouse
  stockTransfer: {
    list: prefixInventory + "/stock-transfer/list",
    get: prefixInventory + "/stock-transfer/get",
    update: prefixInventory + "/stock-transfer/update",
    delete: prefixInventory + "/stock-transfer/delete",
    approve: prefixInventory + "/stock-transfer/approve",
    cancel: prefixInventory + "/stock-transfer/cancel",
  },
  inventoryBalance: {
    stockProductList: prefixInventory + "/inventory-balance/stock-product/list",
    variantList: prefixInventory + "/inventory-balance/variant/list", // Tồn kho theo biến thể + đơn vị bán
    list: prefixInventory + "/inventory-balance/list",
    get: prefixInventory + "/inventory-balance/get",
  },
  stockTransferDetail: {
    list: prefixInventory + "/stock-transfer-detail/list",
    update: prefixInventory + "/stock-transfer-detail/update",
    delete: prefixInventory + "/stock-transfer-detail/delete",
  },

  integration: {
    list: prefixCustomer + "/integration-partner/list",
    update: prefixCustomer + "/integration-config/update",
    updateStatus: prefixCustomer + "/integration-log/update/status",
    delete: prefixCustomer + "/integration-config/delete",
    logList: prefixCustomer + "/integration-log/list",
  },

  productAttribute: {
    list: prefixCustomer + "/product-attribute/list",
    update: prefixCustomer + "/product-attribute/update",
    delete: prefixCustomer + "/product-attribute/delete",
    listAll: prefixCustomer + "/product-attribute/list-all",
    checkDuplicated: prefixCustomer + "/product-attribute/check-duplicated",
  },

  productExtraInfo: {
    list: prefixCustomer + "/product-extra-info/list",
  },

  productImport: {
    list: prefixInventory + "/product-import/list",
    update: prefixInventory + "/product-import/update",
    detail: prefixInventory + "/product-import/detail",
    delete: prefixInventory + "/product-import/delete",
    variantList: prefixInventory + "/product-variant/list",
  },

  inventory: {
    list: prefixInventory + "/warehouse/list",
    update: prefixInventory + "/warehouse/update",
    delete: prefixInventory + "/warehouse/delete",
    ledgerList: prefixInventory + "/inventory-transaction/ledger/list",
    ledgerDetail: prefixInventory + "/inventory-transaction/ledger/get",
    saleExportList: prefixInventory + "/inventory-transaction/sale/list",
    saleExportSummary: prefixInventory + "/inventory-transaction/sale/summary",
    destroyList: prefixInventory + "/inventory-transaction/destroy/list",
    destroyDetail: prefixInventory + "/inventory-transaction/destroy/get",
    destroySummary: prefixInventory + "/inventory-transaction/destroy/summary",
    costSummary: prefixInventory + "/inventory-balance/cost/summary",
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
    list: prefixCustomer + "/service-attribute/list",
    update: prefixCustomer + "/service-attribute/update",
    delete: prefixCustomer + "/service-attribute/delete",
    listAll: prefixCustomer + "/service-attribute/list-all",
    checkDuplicated: prefixCustomer + "/service-attribute/check-duplicated",
  },

  serviceExtraInfo: {
    list: prefixCustomer + "/service-extra-info/list",
  },

  employee: {
    list: prefixCustomer + "/employee/list",
    update: prefixCustomer + "/employee/update",
    detail: prefixCustomer + "/employee/get",
    delete: prefixCustomer + "/employee/delete",
    linkEmployeeUser: prefixCustomer + "/employee/link-user",
    init: prefixCustomer + "/employee/init",
    info: prefixCustomer + "/employee/info",
    takeRoles: prefixCustomer + "/employee/roles",
    listExTip: prefixCustomer + "/employee/list-ex-tip",
    generateRandomPass: prefixCustomer + "/employee/random-pass",
    list_department: prefixCustomer + "/employee/list/department",
    updateToken: prefixCustomer + "/employee/update-token", //Cập nhật token của Outlook Mail
    checkEmailConnection: prefixCustomer + "/employee/check-email-connection",
    disconnectEmail: prefixCustomer + "/employee/disconnect-email",
    updateRole: prefixCustomer + "/role-employee/insert-batch",
    getListRoleEmployee: prefixCustomer + "/role-employee/list",
    deleteRole: prefixCustomer + "/role-employee/delete",
  },
  employeeAgent: {
    list: prefixCustomer + "/employee-agent/list",
    update: prefixCustomer + "/employee-agent/update",
    delete: prefixCustomer + "/employee-agent/delete",
    listAthena: prefixCustomer + "/athena/account-info",
  },

  teamEmployee: {
    list: prefixCustomer + "/group/list",
    detail: prefixCustomer + "/group/get",
    update: prefixCustomer + "/group/update",
    delete: prefixCustomer + "/group/delete",

    listEmployee: prefixCustomer + "/group-employee/list",
    updateEmployee: prefixCustomer + "/group-employee/update",
    deleteEmployee: prefixCustomer + "/group-employee/delete",
  },

  scheduleCommon: {
    list: prefixCustomer + "/schedule/list",
    listRelatedToCustomer: prefixCustomer + "/schedule/list/by-customer",
  },
  crmCareHistory: {
    list: prefixCustomer + "/crm-care-history/list",
    update: prefixCustomer + "/crm-care-history/update",
    delete: prefixCustomer + "/crm-care-history/delete",
  },
  timekeeping: {
    list: prefixCustomer + "/timekeeping/list",
    update: prefixCustomer + "/timekeeping/update",
    delete: prefixCustomer + "/timekeeping/delete",
  },
  financeDashboard: {
    full: prefixBilling + "/finance/dashboard",
    chart: prefixBilling + "/finance/chart",
  },
  fund: {
    overview: prefixBilling + "/fund/overview",
    detail: prefixBilling + "/fund/detail",
    save: prefixBilling + "/fund/save",
    close: prefixBilling + "/fund/close",
    history: prefixBilling + "/fund/history", // endpoint mới — xem FundResource
  },
  debt: {
    list: prefixBilling + "/debt/list",
    detail: prefixBilling + "/debt/detail",
    save: prefixBilling + "/debt/save",
    pay: prefixBilling + "/debt/pay",
    markPaid: prefixBilling + "/debt/mark-paid",
    qr: prefixBilling + "/debt/qr",
    updateSchedule: prefixBilling + "/debt/update-schedule",
    customerTotal: prefixBilling + "/debt/customer-total",
    export:        prefixBilling + "/debt/export",
  },
  cashbook: {
    list: prefixBilling + "/cashbook/list",
    update: prefixBilling + "/cashbook/update",
    delete: prefixBilling + "/cashbook/delete",
    export: prefixBilling + "/cashbook/export",
    exportFile: prefixBilling + "/cashbook/export-file",
    exportSimple: prefixBilling + "/cashbook/export-simple",
    detail: prefixBilling + "/cashbook/get"
  },
  qrCodePro: {
    generate: prefixBilling + "/vietqr/api/generate-qr",
    reconciliation: prefixBilling + "/reconciliation/list",
  },
  orderRequest: {
    list: prefixSales + "/order-request/list",
    listOne: prefixSales + "/order-request/list-one",
    update: prefixSales + "/order-request/update",
    updateStatus: prefixSales + "/order-request/update-dynamic",
    confirm: prefixSales + "/order-request/confirm",
    updateAndInit: prefixSales + "/order-request/update-and-init",
    delete: prefixSales + "/order-request/delete-soft",
    export: prefixSales + "/order-request/export",
    detail: prefixSales + "/order-request/get",
  },
  //khu vực trải nghiệm khách hàng
  cxmSurvey: {
    list: prefixCustomer + "/cxm-survey/list",
    update: prefixCustomer + "/cxm-survey/update",
    delete: prefixCustomer + "/cxm-survey/delete",
    detail: prefixCustomer + "/cxm-survey/get",
  },
  cxmResponse: {
    list: prefixCustomer + "/cxm-response/list",
    update: prefixCustomer + "/cxm-response/update",
    delete: prefixCustomer + "/cxm-response/delete",
    detail: prefixCustomer + "/cxm-response/get",
  },
  cxmResponseDetail: {
    list: prefixCustomer + "/cxm-response-detail/list",
    update: prefixCustomer + "/cxm-response-detail/update",
    delete: prefixCustomer + "/cxm-response-detail/delete",
    detail: prefixCustomer + "/cxm-response-detail/get",
  },
  cxmQuestion: {
    list: prefixCustomer + "/cxm-question/list",
    update: prefixCustomer + "/cxm-question/update",
    delete: prefixCustomer + "/cxm-question/delete",
    detail: prefixCustomer + "/cxm-question/get",
  },
  cxmOption: {
    list: prefixCustomer + "/cxm-option/list",
    update: prefixCustomer + "/cxm-option/update",
    delete: prefixCustomer + "/cxm-option/delete",
    detail: prefixCustomer + "/cxm-option/get",
  },
  cxmQuestionCondition: {
    list: prefixCustomer + "/cxm-question-condition/list",
    update: prefixCustomer + "/cxm-question-condition/update",
    delete: prefixCustomer + "/cxm-question-condition/delete",
    detail: prefixCustomer + "/cxm-question-condition/get",
  },
  //khu vực trải nghiệm khách hàng
  warehouse: {
    list: prefixInventory + "/warehouse/list",
    create: prefixInventory + "/warehouse/create",
    update: prefixInventory + "/warehouse/update",
    delete: prefixInventory + "/warehouse/delete",
    //API lấy ra danh sách sản phẩm trong kho
    productList: prefixInventory + "/warehouse/product/list",
    //API lấy ra thông tin ngày hết hạn / sản xuất dựa trên số lô của sản phẩm
    infoExpiryDateProductionDate: prefixInventory + "/warehouse/get-mfg-expired-date",
  },
  earnings: {
    filter: prefixCustomer + "/earnings/admin/list",
  },
  paymentHistory: {
    filter: prefixCustomer + "/payment-history/list",
    update: prefixCustomer + "/payment-history/update",
    delete: prefixCustomer + "/payment-history/delete",
  },
  //! đoạn này bh check lại một chút dữ liệu tạo cũ
  crmCampaign: {
    list: prefixCustomer + "/crm-campaign/list",
    update: prefixCustomer + "/crm-campaign/update",
    delete: prefixCustomer + "/crm-campaign/delete",
  },
  // Quản lý chiến dịch
  campaign: {
    list: prefixCustomer + "/campaign/list",
    listViewSale: prefixCustomer + "/campaign/list/view-sale",
    update: prefixCustomer + "/campaign/update",
    updateStatus: prefixCustomer + "/campaign/update/status",
    detail: prefixCustomer + "/campaign/get",
    delete: prefixCustomer + "/campaign/delete",
    convertRate: prefixCustomer + "/opportunity-process",
    listActionScore: prefixCustomer + "/api/v1/score/action",
    //Cài đặt điểm khách hàng
    updateStep3: prefixCustomer + "/api/v1/score/insert-multi",
    listDataStep3: prefixCustomer + "/api/v1/score/campaign",

    //Cài đặt điểm nhân viên
    updateStep4: prefixCustomer + "/campaign/sale-point-config/update",
    listDataScoreEmployee: prefixCustomer + "/campaign/sale-point-config/get",

    listSale: prefixCustomer + "/campaign-sale/list",
    statisticApproach: prefixCustomer + "/campaign-opportunity/statistic-approach",
    statisticSale: prefixCustomer + "/campaign-opportunity/statistic-sale",
    statisticConvertRate: prefixCustomer + "/campaign-opportunity/statistic-convert-rate",

    exportResult: prefixCustomer + "/campaign-opportunity/export-result",
    exportAction: prefixCustomer + "/campaign-opportunity/export-action",
    exportCustomer: prefixCustomer + "/campaign-opportunity/export-customer",

    updateConfigSLA: prefixCustomer + "/campaign/sla-config",
  },
  campaignApproach: {
    list: prefixCustomer + "/campaign-approach/list",
    update: prefixCustomer + "/campaign-approach/update",
    detail: prefixCustomer + "/campaign-approach/get",
    delete: prefixCustomer + "/campaign-approach/delete",
    updateSLA: prefixCustomer + "/campaign-approach/update/sla",
    activityList: prefixCustomer + "/campaign-activity/list",
    updateActivity: prefixCustomer + "/campaign-activity/update",
    deleteActivity: prefixCustomer + "/campaign-activity/delete",
  },
  campaignPipeline: {
    list: prefixCustomer + "/campaign-pipeline/list",
    update: prefixCustomer + "/campaign-pipeline/update",
    detail: prefixCustomer + "/campaign-pipeline/get",
    delete: prefixCustomer + "/campaign-pipeline/delete",
  },
  // quản lý cơ hội
  campaignOpportunity: {
    list: prefixCustomer + "/campaign-opportunity/list",
    listViewSale: prefixCustomer + "/campaign-opportunity/list/view-sale",
    update: prefixCustomer + "/campaign-opportunity/update",
    updateBatch: prefixCustomer + "/campaign-opportunity/update/batch",
    detail: prefixCustomer + "/campaign-opportunity/get",
    delete: prefixCustomer + "/campaign-opportunity/delete",
    // Đổi người phụ trách cơ hội
    changeEmployee: prefixCustomer + "/campaign-opportunity/change/employee",
    // Chuyển đổi trạng thái cơ hội
    changeSale: prefixCustomer + "/campaign-opportunity/change/sale",
    // Thêm mới hoặc cập nhập xác suất cơ hội
    opportunityProcessUpdate: prefixCustomer + "/opportunity-process/update",
    // Xóa 1 xác suất cơ hội
    opportunityProcessDelete: prefixCustomer + "/opportunity-process/delete",

    opportunityExchange: prefixCustomer + "/opportunity-exchange/list",
    // xóa 1 trao đổi trong công việc
    deleteOpportunityExchange: prefixCustomer + "/opportunity-exchange/delete",
    // thêm mới 1 trao đổi công việc
    addOpportunityExchange: prefixCustomer + "/opportunity-exchange/update",

    // chỉnh sửa 1 trao đổi công việc
    updateOpportunityExchange: prefixCustomer + "/opportunity-exchange/get",
    listOpportunity: prefixCustomer + "/opportunity/list",

    //check cơ hội đủ điều kiện để kéo
    opportunityCheck: prefixCustomer + "/campaign-opportunity/check",

    //send email
    sendEmail: prefixCustomer + "/customer/campaign/send/email",

    //Đầu mối làm việc
    opportunityContact: prefixCustomer + "/opportunity-contact/update",
    detailOpportunityContact: prefixCustomer + "/opportunity-contact/detail",

    ///Eform thu thập thông tin
    opportunityEformUpdate: prefixCustomer + "/opportunity-eform/update",
    opportunityEformDetail: prefixCustomer + "/opportunity-eform/get/criteria",

    addOther: prefixCustomer + "/campaign-opportunity-viewer/update",
    // thêm mới nhiều người xem cho 1 khách hàng
    addCoyViewer: prefixCustomer + "/campaign-opportunity-viewer/update",
    // lấy về danh sách người xem
    lstCoyViewer: prefixCustomer + "/campaign-opportunity-viewer/list",
    // xóa đi 1 người xem
    deleteCoyViewer: prefixCustomer + "/campaign-opportunity-viewer/delete",
  },

  saleflow: {
    list: prefixCustomer + "/saleflow/list",
    update: prefixCustomer + "/saleflow/update",
    detail: prefixCustomer + "/saleflow/get",
    delete: prefixCustomer + "/saleflow/delete",
    activityList: prefixCustomer + "/saleflow-activity/list",
    updateActivity: prefixCustomer + "/saleflow-activity/update",
    deleteActivity: prefixCustomer + "/saleflow-activity/delete",

    saleflowEformUpdate: prefixCustomer + "/saleflow-eform/update",
    saleflowEformDetail: prefixCustomer + "/saleflow-eform/get/criteria",
  },

  saleflowApproach: {
    list: prefixCustomer + "/saleflow-approach/list",
    update: prefixCustomer + "/saleflow-approach/update",
    detail: prefixCustomer + "/saleflow-approach/get",
    delete: prefixCustomer + "/saleflow-approach/delete",
    updateSLA: prefixCustomer + "/saleflow-approach/update/sla",
    activityList: prefixCustomer + "/saleflow-activity/list",
    updateActivity: prefixCustomer + "/saleflow-activity/update",
    deleteActivity: prefixCustomer + "/saleflow-activity/delete",

    updateSaleflowSale: prefixCustomer + "/saleflow-sale/update",
    detailSaleflowSale: prefixCustomer + "/saleflow-sale/get/by-approach-id",
  },

  // quản lý bán hàng
  saleflowInvoice: {
    list: prefixCustomer + "/saleflow-invoice/list",
    update: prefixCustomer + "/saleflow-invoice/update",
    updateApproach: prefixCustomer + "/saleflow-invoice/update/approach",
    updateApproachSuccess: prefixCustomer + "/saleflow-invoice/update/success",
    updateApproachCancel: prefixCustomer + "/saleflow-invoice/update/cancel",
    detail: prefixCustomer + "/saleflow-invoice/get",
    delete: prefixCustomer + "/saleflow-invoice/delete",

    invoiceExchange: prefixCustomer + "/saleflow-exchange/list",
    // xóa 1 trao đổi trong
    deleteInvoiceExchange: prefixCustomer + "/saleflow-exchange/delete",
    // thêm mới 1 trao đổi
    addInvoiceExchange: prefixCustomer + "/saleflow-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateInvoiceExchange: prefixCustomer + "/saleflow-exchange/get",
  },

  categoryService: {
    list: prefixInventory + "/category/list",
    update: prefixInventory + "/category/update",
    updatePositions: prefixInventory + "/category/update-positions",
    detail: prefixInventory + "/category/get",
    delete: prefixInventory + "/category/delete",
  },

  categoryProject: {
    list: prefixCustomer + "/project-type/list",
    update: prefixCustomer + "/project-type/update",
    detail: prefixCustomer + "/project-type/get",
    delete: prefixCustomer + "/project-type/delete",
  },

  category: {
    // Đoạn này là category của ông tài chính
    list: prefixCustomer + "/category/list",
    update: prefixCustomer + "/category/update",
    detail: prefixCustomer + "/category/get",
    delete: prefixCustomer + "/category/delete",
  },

  codeSequence: {
    list: prefixCustomer + "/code-sequence/list",
    update: prefixCustomer + "/code-sequence/update",
    detail: prefixCustomer + "/code-sequence/get",
    delete: prefixCustomer + "/code-sequence/delete",
    detailEntity: prefixCustomer + "/code-sequence/get/entity",
  },

  beautyBranch: {
    list: prefixCustomer + "/beauty-branch/list",
    childList: prefixCustomer + "/beauty-branch/child",
    detail: prefixCustomer + "/beauty-branch/get",
    update: prefixCustomer + "/beauty-branch/update",
    delete: prefixCustomer + "/beauty-branch/delete",
    getByBeauty: `${process.env.APP_AUTHENTICATOR_URL}/api/beauty-salon/get-bydomain`,

    //tìm đối tác theo mã
    getBeautyBranchByCode: prefixCustomer + "/beauty-branch/get/by-code",

    // thay đổi trạng thái chi nhánh
    activate: prefixCustomer + "/beauty-branch/update/activate",
    unActivate: prefixCustomer + "/beauty-branch/update/deactivate",
  },

  organization: {
    list: prefixRebornVn + "/beauty-salon/list",
    customerUploadList: prefixCustomer + "/customer-upload/list",
    customerUploadDelete: prefixCustomer + "/clean-data/upload-customer/delete",
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

  unitExchange: {
    listByProduct: prefixInventory + "/unit-exchange/list-by-product",
    update: prefixInventory + "/unit-exchange/update",
    delete: prefixInventory + "/unit-exchange/delete",
  },
  reportTemplate: {
    list: prefixCustomer + "/report-template/list",
    update: prefixCustomer + "/report-template/update",
    delete: prefixCustomer + "/report-template/delete",
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
    list: prefixRebornVn + "/card-service/list",
  },
  card: {
    list: prefixCustomer + "/card/list",
    update: prefixCustomer + "/card/update",
    delete: prefixCustomer + "/card/delete",
  },
  cardService: {
    list: prefixCustomer + "/card-service/list",
    update: prefixCustomer + "/card-service/update",
    detail: prefixCustomer + "/card-service/get",
    delete: prefixCustomer + "/card-service/delete",
  },
  contractCategory: {
    list: prefixCustomer + "/contract-category/list",
    update: prefixCustomer + "/contract-category/update",
    detail: prefixCustomer + "/contract-category/get",
    delete: prefixCustomer + "/contract-category/delete",
  },
  contractPipeline: {
    list: prefixCustomer + "/contract-pipeline/list",
    update: prefixCustomer + "/contract-pipeline/update",
    detail: prefixCustomer + "/contract-pipeline/get",
    delete: prefixCustomer + "/contract-pipeline/delete",
    contractSubPipelineUpdate: prefixCustomer + "/contract-sub-pipeline/update",
  },
  contractApproach: {
    list: prefixCustomer + "/contract-approach/list",
    update: prefixCustomer + "/contract-approach/update",
    detail: prefixCustomer + "/contract-approach/get",
    delete: prefixCustomer + "/contract-approach/delete",

    activityList: prefixCustomer + "/contract-activity/list",
    updateActivity: prefixCustomer + "/contract-activity/update",
    deleteActivity: prefixCustomer + "/contract-activity/delete",
  },

  contractPayment: {
    list: prefixCustomer + "/contract-payment/list",
    update: prefixCustomer + "/contract-payment/update",
    detail: prefixCustomer + "/contract-payment/get",
    delete: prefixCustomer + "/contract-payment/delete",
  },

  contractorPayment: {
    list: prefixCustomer + "/contract-investor-payment/list",
    update: prefixCustomer + "/contract-investor-payment/update",
    detail: prefixCustomer + "/contract-investor-payment/get",
    delete: prefixCustomer + "/contract-investor-payment/delete",
  },

  contractProgress: {
    list: prefixCustomer + "/contract-progress/list",
    update: prefixCustomer + "/contract-progress/update",
    detail: prefixCustomer + "/contract-progress/get",
    delete: prefixCustomer + "/contract-progress/delete",
  },

  contractEform: {
    list: prefixBpm + "/eform/list",
    update: prefixBpm + "/eform/update",
    detail: prefixBpm + "/eform/get",
    delete: prefixBpm + "/eform/delete",

    listEformExtraInfo: prefixCustomer + "/eform-extra-info/list",
    updateEformExtraInfo: prefixCustomer + "/eform-extra-info/update",
    updateEformExtraInfoPosition: prefixCustomer + "/eform-extra-info/update/position",
    detailEformExtraInfo: prefixCustomer + "/eform-extra-info/get",
    deleteEformExtraInfo: prefixCustomer + "/eform-extra-info/delete",

    listEformAttribute: prefixCustomer + "/eform-attribute/list",
    updateEformAttribute: prefixCustomer + "/eform-attribute/update",
    detailEformAttribute: prefixCustomer + "/eform-attribute/get",
    deleteEformAttribute: prefixCustomer + "/eform-attribute/delete",
    listEformAttributeAll: prefixCustomer + "/eform-attribute/list-all",

    checkDuplicated: prefixCustomer + "/eform-attribute/check-duplicated",
    contractEformUpdate: prefixCustomer + "/contract-eform/update",
    contractEformDetail: prefixCustomer + "/contract-eform/get/criteria",
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

    contractAttachmentList: prefixCustomer + "/contract-attachment/list",
    contractAttachmentUpdate: prefixCustomer + "/contract-attachment/update",
    contractAttachmentDetail: prefixCustomer + "/contract-attachment/get",
    contractAttachmentDelete: prefixCustomer + "/contract-attachment/delete",
  },

  contractGuarantee: {
    list: prefixCustomer + "/guarantee/list",
    update: prefixCustomer + "/guarantee/update",
    detail: prefixCustomer + "/guarantee/get",
    delete: prefixCustomer + "/guarantee/delete",

    guaranteeTypeList: prefixCustomer + "/guarantee-type/list",
    guaranteeTypeUpdate: prefixCustomer + "/guarantee-type/update",
    guaranteeTypeDelete: prefixCustomer + "/guarantee-type/delete",

    competencyList: prefixCustomer + "/competency/list",
    competencyUpdate: prefixCustomer + "/competency/update",
    competencyDelete: prefixCustomer + "/competency/delete",

    bankList: prefixCustomer + "/bank/list",
    bankUpdate: prefixCustomer + "/bank/update",
    bankDelete: prefixCustomer + "/bank/delete",

    exAttributes: prefixCustomer + "/guarantee/export/attributes",
    numberFieldGuarantee: prefixCustomer + "/guarantee/export/random-guarantees",
    autoProcess: prefixCustomer + "/guarantee/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/guarantee/import",
  },

  contractWarranty: {
    list: prefixCustomer + "/contract-warranty/list",
    update: prefixCustomer + "/contract-warranty/update",
    detail: prefixCustomer + "/contract-warranty/get",
    delete: prefixCustomer + "/contract-warranty/delete",

    warrantyTypeList: prefixCustomer + "/contract-warranty-type/list",
    warrantyTypeUpdate: prefixCustomer + "/contract-warranty-type/update",
    warrantyTypeDelete: prefixCustomer + "/contract-warranty-type/delete",

    competencyList: prefixCustomer + "/competency/list",
    competencyUpdate: prefixCustomer + "/competency/update",
    competencyDelete: prefixCustomer + "/competency/delete",

    bankList: prefixCustomer + "/bank/list",
    bankUpdate: prefixCustomer + "/bank/update",
    bankDelete: prefixCustomer + "/bank/delete",

    exAttributes: prefixCustomer + "/contract-warranty/export/attributes",
    // numberFieldWarranty: prefixCustomer + "/contractWarranty/export/randomWarranty",
    numberFieldWarranty: prefixCustomer + "/contract-warranty/export/random-contract-warranty",
    autoProcess: prefixCustomer + "/contract-warranty/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contract-warranty/import",
  },

  guaranteeAttachment: {
    guaranteeAttachmentList: prefixCustomer + "/guarantee-attachment/list",
    guaranteeAttachmentUpdate: prefixCustomer + "/guarantee-attachment/update",
    guaranteeAttachmentDelete: prefixCustomer + "/guarantee-attachment/delete",
  },

  warrantyAttachment: {
    warrantyAttachmentList: prefixCustomer + "/contract-warranty-attachment/list",
    warrantyAttachmentUpdate: prefixCustomer + "/contract-warranty-attachment/update",
    warrantyAttachmentDelete: prefixCustomer + "/contract-warranty-attachment/delete",
  },

  znsTemplate: {
    list: prefixCustomer + "/zns-template/list",
    updateSync: prefixCustomer + "/zns-template/list/sync",
    detail: prefixCustomer + "/zns-template/get",
    delete: prefixCustomer + "/zns-template/delete",
    templateDetail: prefixCustomer + "/zns-template/refresh",
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
    list: prefixCustomer + "/contract-stage/list",
    update: prefixCustomer + "/contract-stage/update",
    detail: prefixCustomer + "/contract-stage/get",
    delete: prefixCustomer + "/contract-stage/delete",
  },
  rentalType: {
    list: prefixCustomer + "/rental-type/list",
    update: prefixCustomer + "/rental-type/update",
    detail: prefixCustomer + "/rental-type/get",
    delete: prefixCustomer + "/rental-type/delete",
  },
  contact: {
    list: prefixCustomer + "/contact/list",
    update: prefixCustomer + "/contact/update",
    detail: prefixCustomer + "/contact/get",
    delete: prefixCustomer + "/contact/delete",
    fieldTable: prefixCustomer + "/contact-attribute/list-filter",

    contactExchange: prefixCustomer + "/contact-exchange/list",
    // xóa 1 trao đổi trong
    deleteContactExchange: prefixCustomer + "/contact-exchange/delete",
    // thêm mới 1 trao đổi
    addContactExchange: prefixCustomer + "/contact-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContactExchange: prefixCustomer + "/contact-exchange/get",

    exAttributes: prefixCustomer + "/contact/export/attributes",
    numberFieldContact: prefixCustomer + "/contact/export/random-contacts",
    autoProcess: prefixCustomer + "/contact/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contact/import",
  },
  contactPipeline: {
    list: prefixCustomer + "/contact-pipeline/list",
    update: prefixCustomer + "/contact-pipeline/update",
    detail: prefixCustomer + "/contact-pipeline/get",
    delete: prefixCustomer + "/contact-pipeline/delete",
  },
  contactStatus: {
    list: prefixCustomer + "/contact-status/list",
    update: prefixCustomer + "/contact-status/update",
    detail: prefixCustomer + "/contact-status/get",
    delete: prefixCustomer + "/contact-status/delete",
  },
  contactAttribute: {
    list: prefixCustomer + "/contact-attribute/list",
    update: prefixCustomer + "/contact-attribute/update",
    delete: prefixCustomer + "/contact-attribute/delete",
    listAll: prefixCustomer + "/contact-attribute/list-all",
    checkDuplicated: prefixCustomer + "/contact-attribute/check-duplicated",
  },
  contactExtraInfo: {
    list: prefixCustomer + "/contact-extra-info/list",
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
    contractAlertUpdate: prefixCustomer + "/contract-alert/update",
    contractAlertList: prefixCustomer + "/contract-alert/list",

    //cảnh báo bảo lãnh hợp đồng chung cho tất cả
    guaranteeAlertUpdate: prefixCustomer + "/guarantee-alert/update",
    guaranteeAlertList: prefixCustomer + "/guarantee-alert/list",

    //cảnh báo bảo hành hợp đồng chung cho tất cả
    warrantyAlertUpdate: prefixCustomer + "/contract-warranty-alert/update",
    warrantyAlertList: prefixCustomer + "/contract-warranty-alert/list",

    //cảnh báo hợp đồng riêng từng cái
    contractAlertSpecific: prefixCustomer + "/contract/update/alert",
    contractAlertListSpecific: prefixCustomer + "/contract/alert/get",

    detailAlert: prefixCustomer + "/contract",
    fieldTable: prefixCustomer + "/contract-attribute/list-filter",

    updateApproach: prefixCustomer + "/contract/update/approach",

    //list mã đề nghị
    listCodeSuggest: prefixCustomer + "/contract-request/list",

    //list mã mặt hàng dịch vụ
    listCodeService: prefixCustomer + "/contract/products/select",

    //list nhà cung cấp
    listSupplier: prefixCustomer + "/contract/suppliers/select",

    //thêm hạng mục bàn giao
    updateHandover: prefixCustomer + "/contract-item/update",

    //thêm đợt bàn giao
    updateHandoverProgress: prefixCustomer + "/contract-handover/update",

    //danh sách đợt bàn giao
    listHandoverProgress: prefixCustomer + "/contract-handover/list",

    // xóa 1 đợt bàn giao
    deleteHandoverProgress: prefixCustomer + "/contract-handover/delete",

    //phụ lục hợp đồng
    contractAppendixList: prefixCustomer + "/contract-appendix/list",
    contractAppendixDelete: prefixCustomer + "/contract-appendix/delete",
    contractAppendixUpdate: prefixCustomer + "/contract-appendix/update",
    contractAppendixDetail: prefixCustomer + "/contract-appendix/get",

    contractExchange: prefixCustomer + "/contract-exchange/list",
    // xóa 1 trao đổi trong
    deleteContractExchange: prefixCustomer + "/contract-exchange/delete",
    // thêm mới 1 trao đổi
    addContractExchange: prefixCustomer + "/contract-exchange/update",
    // // chỉnh sửa 1 trao đổi
    updateContractExchange: prefixCustomer + "/contract-exchange/get",
    // gửi báo giá
    sendQuote: prefixCustomer + "/contract/email-quote",

    // gửi hợp đồng mẫu
    sendContract: prefixCustomer + "/contract/email-contract",

    exAttributes: prefixCustomer + "/contract/export/attributes",
    numberFieldCustomer: prefixCustomer + "/contract/export/random-contracts",
    autoProcess: prefixCustomer + "/contract/import/auto-process",
    // tải file lỗi trong quá trình upload
    downloadFile: prefixCustomer + "/contract/import",

    //các biểu đồ thống kê
    reportContractStatus: prefixCustomer + "/contract/dashboard/by-status",
    // reportContractStatus: prefixCustomer + "/contract/dashboard/byStatusV2", // API này Năng làm
    reportContractContract: prefixCustomer + "/contract/dashboard/deal-value-by-customer",
    reportNewContract: prefixCustomer + "/contract/dashboard/new-by-time",
    // reportNewContract: prefixCustomer + "/contract/dashboard/newByTimeV2", // API này Năng làm

    //thay đổi các trạng thái liên quan đến hợp đồng
    updateStatus: prefixCustomer + "/contract/update/status",

    //lịch sử thay đổi hợp đồng
    logValues: prefixCustomer + "/contract/log-values",
  },
  customerGroup: {
    list: prefixCustomer + "/customer-group/list",
    update: prefixCustomer + "/customer-group/update",
    delete: prefixCustomer + "/customer-group/delete",
  },
  customerSource: {
    list: prefixCustomer + "/customer-source/list",
    update: prefixCustomer + "/customer-source/update",
    delete: prefixCustomer + "/customer-source/delete",
  },
  customerMarketingLead: {
    list: prefixCustomer + "/marketing-source/list",
    update: prefixCustomer + "/marketing-source/update",
    delete: prefixCustomer + "/marketing-source/delete",
  },
  customerView: {
    list: prefixCustomer + "/customer-view/list",
    update: prefixCustomer + "/customer-view/update",
    delete: prefixCustomer + "/customer-view/delete",
  },

  reportChart: {
    listReportArtifact: prefixCustomer + "/report-artifact/list",
    listArtifactByDashboard: prefixCustomer + "/report-artifact/list/by-dashboard",
    listArtifactByEmployee: prefixCustomer + "/report-artifact/list/by-employee",
    updateReportArtifact: prefixCustomer + "/report-artifact/update",
    deleteReportArtifact: prefixCustomer + "/report-artifact/delete",

    listReportDashboard: prefixCustomer + "/report-dashboard/list",
    updateReportDashboard: prefixCustomer + "/report-dashboard/update",
    deleteReportDashboard: prefixCustomer + "/report-dashboard/delete",

    listReportRole: prefixCustomer + "/report-role/list",
    updateReportRole: prefixCustomer + "/report-role/update",
    deleteReportRole: prefixCustomer + "/report-role/delete",

    updateReportConfig: prefixCustomer + "/report-config/update",
    deleteReportConfig: prefixCustomer + "/report-config/delete",
  },

  // Báo cáo bảo lãnh
  reportGuarantee: {
    statistical: prefixCustomer + "/guarantee/statistical",
  },
  // Báo cáo bảo hành
  reportContractWarranty: {
    statistical: prefixCustomer + "/contract-warranty/statistical",
  },
  // Báo cáo đối tác
  reportBussinessParner: {
    report: prefixCustomer + "/contract/report",
    // Chi tiết báo cáo đối tác
    reportDetail: prefixCustomer + "/contract/report/detail",
  },
  // Báo cáo khách hàng
  reportCustomer: {
    totalCurentCustomer: prefixCustomer + "/customer/dashboard/get-total",
    totalContract: prefixCustomer + "/contract/total/dashboard",
    totalRevenue: prefixCustomer + "/contract/revenue/dashboard",
    externalOrnot: prefixCustomer + "/customer/dashboard/external-ornot",
    relationShip: prefixCustomer + "/customer/dashboard/relation-ship",
    pipeline: prefixCustomer + "/contract/dashboard/pipeline",
    notInTimePipeline: prefixCustomer + "/contract/dashboard/not-in-time/pipeline",
    // Chi tiết tổng số khách hàng
    totalCurentCustomerDetail: prefixCustomer + "/customer/dashboard/get-total/detail",
    // Chi tiết tổng số hợp đồng theo pipeline
    totalContractSignerDetail: prefixCustomer + "/contract/dashboard/not-in-time/pipeline/detail",
    // Doanh thu còn phải thu trong kì
    revenueNotYetReceivedDetail: prefixCustomer + "/contract/dashboard/pipeline/detail",
  },
  // Báo cáo cơ hội
  reportOpportunity: {
    totalOpportunity: prefixCustomer + "/campaign-opportunity/total/dashboard",
    opportunityByDate: prefixCustomer + "/campaign-opportunity/total-by-date/dashboard",
    expectedRevenue: prefixCustomer + "/campaign-opportunity/total-expected-revenue/dashboard",
    totalByApproach: prefixCustomer + "/campaign-opportunity/total-by-approach/dashboard",

    //Chi tiết tổng số cơ hội
    totalOpportunityDetail: prefixCustomer + "/campaign-opportunity/total/dashboard/detail",
    //Chi tiết doanh thu dự kiến
    expectedRevenueDetail: prefixCustomer + "/campaign-opportunity/total-expected-revenue/dashboard/detail",
    //Chi tiết doanh ký hợp đồng
    contractRevenueDetail: prefixCustomer + "/contract/revenue/dashboard/detail",
  },

  customerField: {
    list: prefixCustomer + "/customer-field/list",
    update: prefixCustomer + "/customer-field/update",
    delete: prefixCustomer + "/customer-field/delete",
  },
  customerAttribute: {
    list: prefixCustomer + "/customer-attribute/list",
    update: prefixCustomer + "/customer-attribute/update",
    delete: prefixCustomer + "/customer-attribute/delete",
    listAll: prefixCustomer + "/customer-attribute/list-all",
    checkDuplicated: prefixCustomer + "/customer-attribute/check-duplicated",
  },
  customerExtraInfo: {
    list: prefixCustomer + "/customer-extra-info/list",
  },
  contractAttribute: {
    list: prefixCustomer + "/contract-attribute/list",
    update: prefixCustomer + "/contract-attribute/update",
    delete: prefixCustomer + "/contract-attribute/delete",
    listAll: prefixCustomer + "/contract-attribute/list-all",
    checkDuplicated: prefixCustomer + "/contract-attribute/check-duplicated",
  },
  contractExtraInfo: {
    list: prefixCustomer + "/contract-extra-info/list",
  },

  guaranteeAttribute: {
    list: prefixCustomer + "/guarantee-attribute/list",
    update: prefixCustomer + "/guarantee-attribute/update",
    delete: prefixCustomer + "/guarantee-attribute/delete",
    listAll: prefixCustomer + "/guarantee-attribute/list-all",
    checkDuplicated: prefixCustomer + "/guarantee-attribute/check-duplicated",
  },
  warrantyAttribute: {
    list: prefixCustomer + "/contract-warranty-attribute/list",
    update: prefixCustomer + "/contract-warranty-attribute/update",
    delete: prefixCustomer + "/contract-warranty-attribute/delete",
    listAll: prefixCustomer + "/contract-warranty-attribute/list-all",
    checkDuplicated: prefixCustomer + "/contract-warranty-attribute/check-duplicated",
  },
  guaranteeExtraInfo: {
    list: prefixCustomer + "/guarantee-extra-info/list",
  },
  warrantyExtraInfo: {
    list: prefixCustomer + "/contract-warranty-extra-info/list",
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
    list: prefixCustomer + "/tip-group/list",
    update: prefixCustomer + "/tip-group/update",
    delete: prefixCustomer + "/tip-group/delete",
    listTipGroupEmloyee: prefixCustomer + "/tip-group-employee/list",
    updateTipGroupEmloyee: prefixCustomer + "/tip-group-employee/update",
    deleteTipGroupEmloyee: prefixCustomer + "/tip-group-employee/delete",
  },
  tipUser: {
    list: prefixCustomer + "/tip-user/list",
    update: prefixCustomer + "/tip-user/update",
    delete: prefixCustomer + "/tip-user/delete",
  },
  tipUserConfig: {
    list: prefixCustomer + "/tip-user-config/list",
    update: prefixCustomer + "/tip-user-config/update",
    delete: prefixCustomer + "/tip-user-config/delete",
  },
  tipGroupConfig: {
    list: prefixCustomer + "/tip-group-config/list",
    update: prefixCustomer + "/tip-group-config/update",
    delete: prefixCustomer + "/tip-group-config/delete",
  },
  setting: {
    list: prefixCustomer + "/setting/list",
    update: prefixCustomer + "/setting/update",
    delete: prefixCustomer + "/setting/delete",
  },
  connectGmail: {
    connect: prefixConnect + "/api/v1/google/access-token",
    checkConnect: prefixConnect + "/api/v1/google/gmails-link-bsn",
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
    listFanpageDialog: prefixCustomer + "/fanpage-dialog/list",
    //* Danh sách tin nhắn chat từ fanpage
    listFanpageChat: prefixCustomer + "/fanpage-chat/list",
    //* Phản hồi (nhắn tin phản hồi người chat facebook)
    replyFanpageChat: prefixCustomer + "/fanpage-chat/reply",
    //* Danh sách bình luận từ fanpage
    listFanpageComment: prefixCustomer + "/fanpage-comment/list",
    //* Phản hồi 1 bình luận từ 1 bình luận của khách hàng hoặc sửa lại bình luận đã phản hồi
    replyFanpageComment: prefixCustomer + "/fanpage-comment/reply",
    //* Gỡ 1 bình luận đã đăng
    deleteFanpageComment: prefixCustomer + "/fanpage-comment/delete",
    //* Ẩn 1 bình luận trên fanpage
    hiddenFanpageComment: prefixCustomer + "/fanpage-comment/hidden",
    //* Lấy thông tin bài đã đăng
    fanpagePost: prefixCustomer + "/fanpage-post/get",
    //* Gửi file đính kèm trong messenger
    fanpageChatSendAttachment: prefixCustomer + "/fanpage-chat/send/attachment",
  },
  zaloOA: {
    //* kết nối zalo với crm
    connect: prefixCustomer + "/zalo-oa/connect",
    //* Lấy danh sách zalo đã được kết nối
    list: prefixCustomer + "/zalo-oa/list",
    //* Gỡ một zalo ra khỏi danh sách đã kết nối
    delete: prefixCustomer + "/zalo-oa/remove",
    //* Lấy danh sách hội thoại chat
    listZaloFollower: prefixCustomer + "/zalo-follower/list",
    //* Danh sách tin nhắn chat từ người dùng tương tác với zalo
    listZaloChat: prefixCustomer + "/zalo-chat/list",
    //* Nhắn tin cho người dùng
    sendZaloChat: prefixCustomer + "/zalo-chat/send",
    //* Gửi tin nhắn dạng link ảnh
    linkImageSendZaloChat: prefixCustomer + "/zalo-chat/send/link-image",
    //* Gửi tin nhắn đính kèm file
    fileSendZaloChat: prefixCustomer + "/zalo-chat/send/file",
    //* Phản hồi lại 1 tin nhắn (trả lời 1 tin nhắn khác)
    answerSendZaloChat: prefixCustomer + "/zalo-chat/send/answer",
    //* Gỡ 1 tin nhắn chat
    deleteZaloChat: prefixCustomer + "/zalo-chat/delete",
  },
  image: {
    upload: prefixUpload + "/api/upload/image",
    // upload: "https://reborn.vn/api/upload/file",
    uploadReborn: prefixRebornVn + "/upload/file",
    uploadNoron: prefixUpload + "/api/upload/file",
    // uploadReborn: "http://localhost:8000/api/upload/file"
  },
  file: {
    upload: prefixRebornVn + "/upload/file",
  },
  video: {
    upload: prefixUpload + "/api/upload/file",
  },
  analysis: {
    list: prefixCloudMarket + "/article/list",
    detail: prefixCloudMarket + "/article/get",
  },
  reportMa: {
    getCustomer: prefixCustomer + "/ma/dashboard/customer/by-status",
    // detail: prefixCloudMarket + "/article/get",
  },
  keywordData: {
    list: prefixCloudMarket + "/keyword-data/list",
    update: prefixCloudMarket + "/keyword-data/update",
    detail: prefixCloudMarket + "/keyword-data/get",
    delete: prefixCloudMarket + "/keyword-data/delete",
  },
  configCode: {
    list: prefixCustomer + "/global-config/list",
    update: prefixCustomer + "/global-config/update",
    detail: prefixCustomer + "/global-config/get",
    delete: prefixCustomer + "/global-config/delete",
  },
  placeholder: {
    contractWarranty: prefixCustomer + "/contract-warranty/placeholder", // placeholder Bảo hành
    guarantee: prefixCustomer + "/guarantee/placeholder", // placeholder Bảo lãnh
    contract: prefixCustomer + "/contract/placeholder", // placeholder Hợp đồng
    customer: prefixCustomer + "/customer/placeholder", // placeholder Khách hàng
    contact: prefixCustomer + "/contact/placeholder ", // placeholder Người liên hệ
  },
  partnerCall: {
    list: prefixCustomer + "/partner-call/list",
    update: prefixCustomer + "/partner-call/update",
    detail: prefixCustomer + "/partner-call/get",
    delete: prefixCustomer + "/partner-call/delete",
  },
  switchboard: {
    list: prefixCustomer + "/call-config/list",
    update: prefixCustomer + "/call-config/update",
    updateStatus: prefixCustomer + "/call-config/update/status",
    detail: prefixCustomer + "/call-config/get",
    delete: prefixCustomer + "/call-config/delete",
  },
  templateSMS: {
    list: prefixCustomer + "/template-sms/list",
    update: prefixCustomer + "/template-sms/update",
    detail: prefixCustomer + "/template-sms/get",
    delete: prefixCustomer + "/template-sms/delete",
  },
  partnerSMS: {
    list: prefixCustomer + "/partner-sms/list",
    update: prefixCustomer + "/partner-sms/update",
    detail: prefixCustomer + "/partner-sms/get",
    delete: prefixCustomer + "/partner-sms/delete",
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
    list: prefixCustomer + "/template-category/list",
    update: prefixCustomer + "/template-category/update",
    detail: prefixCustomer + "/template-category/get",
    delete: prefixCustomer + "/template-category/delete",
  },
  templateZalo: {
    list: prefixCustomer + "/template-zalo/list",
    update: prefixCustomer + "/template-zalo/update",
    detail: prefixCustomer + "/template-zalo/get",
    delete: prefixCustomer + "/template-zalo/delete",
  },
  templateEmail: {
    list: prefixCustomer + "/template-email/list",
    update: prefixCustomer + "/template-email/update",
    detail: prefixCustomer + "/template-email/get",
    delete: prefixCustomer + "/template-email/delete",
  },
  partnerEmail: {
    list: prefixCustomer + "/partner-email/list",
    update: prefixCustomer + "/partner-email/update",
    detail: prefixCustomer + "/partner-email/get",
    delete: prefixCustomer + "/partner-email/delete",
  },
  emailConfig: {
    list: prefixCustomer + "/email-config/list",
    update: prefixCustomer + "/email-config/update",
    detail: prefixCustomer + "/email-config/get",
    delete: prefixCustomer + "/email-config/delete",

    //Kiểm tra Email nguồn
    checkEmail: prefixCustomer + "/email/test-connection",
  },
  industry: {
    list: prefixCloudMarket + "/industry/list",
    update: prefixCloudMarket + "/industry/update",
    detail: prefixCloudMarket + "/industry/get",
    delete: prefixCloudMarket + "/industry/delete",
  },
  mailBox: {
    list: prefixCustomer + "/mailbox/list",
    update: prefixCustomer + "/mailbox/update",
    detail: prefixCustomer + "/mailbox/get",
    delete: prefixCustomer + "/mailbox/delete",
    viewer: prefixCustomer + "/mailbox/viewer",
    updateViewer: prefixCustomer + "/mailbox/update/viewer",
    mailboxExchangeList: prefixCustomer + "/mailbox-exchange/list",
    mailboxExchangeUpdate: prefixCustomer + "/mailbox-exchange/update",
    mailboxExchangeDelete: prefixCustomer + "/mailbox-exchange/delete",
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
    warrantyExchangeUpdate: prefixCustomer + "/warranty-exchange/update",
    warrantyExchangeDelete: prefixCustomer + "/warranty-exchange/delete",
    warrantyExchangeList: prefixCustomer + "/warranty-exchange/list",
    warrantyProcess: prefixCustomer + "/warranty-process/update",
    resetTransferVotes: prefixCustomer + "/support-object/reset",
  },
  warrantyCategory: {
    list: prefixCustomer + "/warranty-category/list",
    update: prefixCustomer + "/warranty-category/update",
    detail: prefixCustomer + "/warranty-category/get",
    delete: prefixCustomer + "/warranty-category/delete",
  },
  warrantyProc: {
    list: prefixCustomer + "/support/list",
    update: prefixCustomer + "/support/update",
    detail: prefixCustomer + "/support/get",
    delete: prefixCustomer + "/support/delete",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  warrantyStep: {
    list: prefixCustomer + "/warranty-step/list",
    update: prefixCustomer + "/warranty-step/update",
    detail: prefixCustomer + "/warranty-step/get",
    delete: prefixCustomer + "/warranty-step/delete",
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
    ticketExchangeList: prefixCustomer + "/ticket-exchange/list",
    ticketExchangeUpdate: prefixCustomer + "/ticket-exchange/update",
    ticketExchangeDelete: prefixCustomer + "/ticket-exchange/delete",
    ticketProcess: prefixCustomer + "/ticket-process/update",
    resetTransferVotes: prefixCustomer + "/support-object/reset",
  },
  ticketCategory: {
    list: prefixCustomer + "/ticket-category/list",
    update: prefixCustomer + "/ticket-category/update",
    detail: prefixCustomer + "/ticket-category/get",
    delete: prefixCustomer + "/ticket-category/delete",
  },
  ticketProc: {
    list: prefixCustomer + "/support/list",
    update: prefixCustomer + "/support/update",
    detail: prefixCustomer + "/support/get",
    delete: prefixCustomer + "/support/delete",
  },
  supportCommon: {
    supportConfigLst: prefixCustomer + "/support-config/list",
    supportConfigUpdate: prefixCustomer + "/support-config/update",
    supportConfigDelete: prefixCustomer + "/support-config/delete",
    supportConfigDetail: prefixCustomer + "/support-config/get",

    updateStatusSupport: prefixCustomer + "/support/update/status",

    supportLinkLst: prefixCustomer + "/support-link/list",
    supportLinkUpdate: prefixCustomer + "/support-link/update",
    supportLinkDelete: prefixCustomer + "/support-link/delete",

    supportObjectLst: prefixCustomer + "/support-object/list",
    supportObjectUpdate: prefixCustomer + "/support-object/update",
    supportObjectDelete: prefixCustomer + "/support-object/delete",
    takeObject: prefixCustomer + "/support-object/get/object",
    checkApproved: prefixCustomer + "/support-object/check-approved",

    supportLogLst: prefixCustomer + "/support-log/list",
    supportLogUpdate: prefixCustomer + "/support-log/update",
    supportLogDelete: prefixCustomer + "/support-log/delete",

    // đoạn này là action confirm nút
    processDone: prefixCustomer + "/support-log/process-done",
    processReceive: prefixCustomer + "/support-log/receive",
    processRejected: prefixCustomer + "/support-log/process-rejected",
  },
  // đoạn này sau không dùng nữa bỏ hoặc thay thế cho ông khác
  ticketStep: {
    list: prefixCustomer + "/ticket-step/list",
    update: prefixCustomer + "/ticket-step/update",
    detail: prefixCustomer + "/ticket-step/get",
    delete: prefixCustomer + "/ticket-step/delete",
  },
  //API công việc
  workProject: {
    list: prefixCustomer + "/work-project/list",
    update: prefixCustomer + "/work-project/update",
    detail: prefixCustomer + "/work-project/get",
    delete: prefixCustomer + "/work-project/delete",
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
    listBpmWorkOrder: prefixBpm + "/work-order/list",
    list: prefixCustomer + "/work-order/list",
    listV2: prefixCustomer + "/work-order/list-v2",
    groups: prefixCustomer + "/work-order/groups",
    groupsV2: prefixCustomer + "/work-order/groups-v2",
    update: prefixCustomer + "/work-order/update",
    updateAndInit: prefixCustomer + "/work-order/save-and-init-process",
    updateInitProcess: prefixCustomer + "/work-order/update-init-process",
    updateEmployee: prefixCustomer + "/work-order/update/employee",
    updatePause: prefixCustomer + "/work-order/update/pause",
    listPause: prefixCustomer + "/work-order/list/pause",
    updateReject: prefixCustomer + "/bpm-form/reject",
    detail: prefixCustomer + "/work-order/get",
    delete: prefixCustomer + "/work-order/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixCustomer + "/work-order/get/related-people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixCustomer + "/work-order/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixCustomer + "/work-order/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixCustomer + "/work-order/update/other-work-order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixCustomer + "/work-order/get/other-work-order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixCustomer + "/work-inprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixCustomer + "/work-inprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixCustomer + "/work-inprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixCustomer + "/work-order/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixCustomer + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixCustomer + "/employee/assignees",
    // Lấy danh sách người nhận việc trong dự án
    projectEmployeeAssignees: prefixCustomer + "/work-project/get-employees",
    // danh sách trao đổi trong công việc
    workExchange: prefixCustomer + "/work-exchange/list",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixCustomer + "/work-exchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixCustomer + "/work-exchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixCustomer + "/work-exchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixCustomer + "/work-order/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixCustomer + "/work-order/update/priority-level",
    //exportOLA
    exportOLA: prefixBpm + "/ola/export",
    //exportSLA
    exportSLA: prefixBpm + "/sla/export",
    // Giao công việc đàm phán, thương thảo hợp đồng mẫu
    assignNegotiationWork: prefixApplication + "/work-assignment",
    // Lấy thông tin chi tiết công việc đàm phán, thương thảo hợp đồng mẫu
    getNegotiationWork: prefixApplication + "/work-assignment",
    // Lưu công việc đàm phán, thương thảo hợp đồng mẫu
    saveNegotiationWork: prefixApplication + "/negotiation-bidder-detail",
    // hoàn thành công việc đàm phán, thương thảo hợp đồng mẫu
    completeNegotiationWork: prefixApplication + "/negotiation-bidder-detail/complete",
    // Thu hồi công việc
  },
  formCategory: {
    list: prefixBpm + "/bpm-form-popup/list",
    update: prefixBpm + "/bpm-form-popup/update",
    detail: prefixBpm + "/bpm-form-popup/get",
    delete: prefixBpm + "/bpm-form-popup/delete",
  },
  bpmReason: {
    list: prefixBpm + "/bpm/list-reason",
    update: prefixBpm + "/bpm/update-reason",
    updateActive: prefixBpm + "/bpm/update-reason/active",
    detail: prefixBpm + "/bpm/get-reason",
    delete: prefixBpm + "/bpm/delete-reason",
  },
  userTask: {
    // list: prefixCustomer + "/workOrder/list",
    list: prefixBpm + "/work-order/list",
    update: prefixCustomer + "/work-order/update",
    detail: prefixBpm + "/work-order/get",
    // detail: prefixBpm + "/workOrder/get",
    updatePause: prefixCustomer + "/work-order/update/pause",
    // listPause: prefixCustomer + "/workOrder/list/pause",
    listPause: prefixBpm + "/work-order/list/pause",
    delete: prefixCustomer + "/work-order/delete",
    // Lấy thông tin người liên quan
    relatedPeople: prefixCustomer + "/work-order/get/related-people",
    // cập nhật thông tin người tham gia trong công việc
    updateParticipant: prefixCustomer + "/work-order/update/participant",
    // cập nhật thông tin khách hàng tham gia trong công việc
    updateCustomer: prefixCustomer + "/work-order/update/customer",
    // cập nhật thông tin công việc liên quan
    updateOtherWorkOrder: prefixCustomer + "/work-order/update/other-work-order",
    // Lấy danh sách công việc liên quan
    getOtherWorkOrder: prefixCustomer + "/work-order/get/other-work-order",
    // Cập nhật tiến độ công việc
    updateWorkInprogress: prefixSale + "/work-inprogress/update",
    // Lấy tiến độ công việc
    getWorkInprogress: prefixSale + "/work-inprogress/get",
    // Lấy danh sách cập nhật tiến độ công việc
    getWorkInprogressList: prefixSale + "/work-inprogress/list",
    // Cập nhật trạng thái công việc
    updateStatus: prefixCustomer + "/work-order/update/status",
    // Lấy danh sách người giao việc
    employeeManagers: prefixSystem + "/employee/managers",
    // Lấy danh sách người nhận việc
    employeeAssignees: prefixSystem + "/employee/assignees",
    // danh sách trao đổi trong công việc
    workExchange: prefixSale + "/work-exchange/list",
    // báo cáo công việc
    workReport: prefixCustomer + "/work-order/report",
    // xóa 1 trao đổi trong công việc
    deleteWorkExchange: prefixSale + "/work-exchange/delete",
    // thêm mới 1 trao đổi công việc
    addWorkExchange: prefixSale + "/work-exchange/update",
    // chỉnh sửa 1 trao đổi công việc
    updateWorkExchange: prefixSale + "/work-exchange/get",
    // cập nhật đánh giá chất lượng công việc
    updateRating: prefixCustomer + "/work-order/update/review",
    // cập nhật mức độ ưu tiên công việc
    updatePriorityLevel: prefixCustomer + "/work-order/update/priority-level",
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
    list: prefixApplication + "/project-catalog/list",
    update: prefixApplication + "/project-catalog/update",
    updateStatus: prefixApplication + "/project-catalog/update/status",
    detail: prefixApplication + "/project-catalog/get",
    delete: prefixApplication + "/project-catalog/delete",
  },
  material: {
    list: prefixApplication + "/material/list",
    update: prefixApplication + "/material/update",
    updateStatus: prefixApplication + "/material/update/status",
    delete: prefixApplication + "/material/delete",
    detail: prefixApplication + "/material/get",
    upload: prefixApplication + "/material/upload",
  },
  materialNvl: {
    list: prefixInventory + "/material/list",
    summary: prefixInventory + "/material/summary",
    get: prefixInventory + "/material/get",
    update: prefixInventory + "/material/update",
    delete: prefixInventory + "/material/delete",
    updateStatus: prefixInventory + "/material/update/status",
    importList: prefixInventory + "/material/import/list",
    importGet: prefixInventory + "/material/import/get",
    importCreate: prefixInventory + "/material/import/create",
    importConfirm: prefixInventory + "/material/import/excel/confirm",
    importCancel: prefixInventory + "/material/import/excel/cancel",
    bomList: prefixInventory + "/material/bom/list",
    bomSummary: prefixInventory + "/material/bom/summary",
    bomGet: prefixInventory + "/material/bom/get",
    bomUpdate: prefixInventory + "/material/bom/update",
    bomUpdateStatus: prefixInventory + "/material/bom/update/status",
    bomDelete: prefixInventory + "/material/bom/delete",
    export: prefixInventory + "/material/export",
    // ── Lệnh sản xuất ────────────────────────────────────────────
    productionList: prefixInventory + "/material/production/list",
    productionSummary: prefixInventory + "/material/production/summary",
    productionGet: prefixInventory + "/material/production/get",
    productionCreate: prefixInventory + "/material/production/create",
    productionStart: prefixInventory + "/material/production/start",
    productionConfirm: prefixInventory + "/material/production/confirm",
    productionCancel: prefixInventory + "/material/production/cancel",
  },
  businessCategory: {
    list: prefixApplication + "/business-category/list",
    update: prefixApplication + "/business-category/update",
    updateActive: prefixApplication + "/business-category/update/active",
    detail: prefixApplication + "/business-category/get",
    delete: prefixApplication + "/business-category/delete",
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
    listContact: prefixApplication + "/contact-org/list",
    deleteContact: prefixApplication + "/contact-org/delete",
    detailContact: prefixApplication + "/contact-org/get",
  },
  inventorySupplier: {
    list:         prefixInventory + "/supplier/list",
    summary:      prefixInventory + "/supplier/summary",
    get:          prefixInventory + "/supplier/get",
    update:       prefixInventory + "/supplier/update",
    delete:       prefixInventory + "/supplier/delete",
    updateActive: prefixInventory + "/supplier/update/active",
    export:       prefixInventory + "/supplier/export",
  },
  workCategory: {
    list: prefixApplication + "/work-category/list",
    update: prefixApplication + "/work-category/update",
    updateStatus: prefixApplication + "/work-category/update/active",
    detail: prefixApplication + "/work-category/get",
    delete: prefixApplication + "/work-category/delete",
  },

  procurement: {
    list: prefixApplication + "/procurement-type/list",
    update: prefixApplication + "/procurement-type/update",
    updateStatus: prefixApplication + "/procurement-type/update/status",
    detail: prefixApplication + "/procurement-type/get",
    delete: prefixApplication + "/procurement-type/delete",
  },
  workType: {
    list: prefixCustomer + "/work-type/list",
    update: prefixCustomer + "/work-type/update",
    detail: prefixCustomer + "/work-type/get",
    delete: prefixCustomer + "/work-type/delete",
  },
  //API người danh sách người mua, bán
  objectSource: {
    list: prefixApi + "/object-source/list",
  },
  //API quản trị phân hệ
  subsystemAdministration: {
    list: prefixCustomer + "/module/list",
    update: prefixCustomer + "/module/update",
    detail: prefixCustomer + "/module/get",
    delete: prefixCustomer + "/module/delete",
    // Thêm mới một tài nguyên vào phân hệ
    addModuleResource: prefixCustomer + "/module-resource/add",
    // Xóa một tài nguyên hỏi phân hệ
    removeModuleResource: prefixCustomer + "/module-resource/remove",
  },
  //API quản trị chúc năng
  functionalManagement: {
    list: prefixCustomer + "/resource/list",
    update: prefixCustomer + "/resource/update",
    detail: prefixCustomer + "/resource/get",
    delete: prefixCustomer + "/resource/delete",
    // lấy ra danh sách tài nguyên chưa thuộc phân hệ nào
    freeResource: prefixCustomer + "/resource/list-ex",
  },
  permission: {
    getPermissionResources: prefixCustomer + "/permission/resource",
    //API phân quyền theo phòng ban
    permissionDepartment: prefixCustomer + "/permission/info",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixCustomer + "/role-permission/info",
    //API thêm quyền cho phòng ban
    permissionDepartmentAdd: prefixCustomer + "/permission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixCustomer + "/role-permission/add",
    //API xóa quyền được cấp
    permissionDepartmentDelete: prefixCustomer + "/permission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixCustomer + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixCustomer + "/request-permission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixCustomer + "/request-permission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixCustomer + "/request-permission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixCustomer + "/request-permission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixCustomer + "/request-permission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixCustomer + "/request-permission/update/rejected ",
  },
  rolePermission: {
    getPermissionResources: prefixCustomer + "/permission/resource",
    //API phân quyền theo nhóm quyền
    rolePermission: prefixCustomer + "/role-permission/info",
    //API phân quyền theo gói
    packagePermission: prefixCustomer + "/package-permission/info",
    //API thêm quyền cho nhóm quyền
    packagePermissionAdd: prefixCustomer + "/package-permission/add",
    //API thêm quyền cho nhóm quyền
    permissionRoleAdd: prefixCustomer + "/role-permission/add",
    //API xóa quyền được cấp
    permissionRoleDelete: prefixCustomer + "/role-permission/remove",
    //API lấy danh sách quyền trước đó cho một đối tượng muốn sao chép
    permissionClone: prefixCustomer + "/permission/clone",

    //danh sách yêu cầu xin quyền truy cập (mình xin quyền)
    requestPermissionSource: prefixCustomer + "/request-permission/list/source",
    //gửi yêu cầu xin phê duyệt
    updateRequestPermission: prefixCustomer + "/request-permission/update",

    //xoá yêu cầu xin phê duyệt
    deleteRequestPermission: prefixCustomer + "/request-permission/delete",

    //danh sách cấp quyền truy cập (đối tác xin quyền)
    requestPermissionTarget: prefixCustomer + "/request-permission/list/target",

    //phê duyệt quyền truy cập
    updateApprovePermission: prefixCustomer + "/request-permission/update/approved ",

    //từ chối quyền truy cập
    updateRejectPermission: prefixCustomer + "/request-permission/update/rejected ",
  },
  //API tổng đài
  callCenter: {
    //* Tạo 1 cuộc gọi
    makeCall: prefixCustomer + "/call-center/make-call",
    //* Lấy danh sách lịch sử cuộc gọi
    getHistory: prefixCustomer + "/call-center/get-history",
    //* Lấy chi tiết lịch sử cuộc gọi
    getHistoryByCallId: prefixCustomer + "/call-center/get-history-by-call-id",
    //* Chuyển một cuộc gọi sang máy khác
    transferCall: prefixCustomer + "/call-center/transfer-call",
    //* Thực hiện ngắt cuộc gọi
    hangupCall: prefixCustomer + "/call-center/hangup-call",
    //* Tạo 1 cuộc gọi đọc mã OTP cho người đăng ký
    makeCallOTP: prefixCustomer + "/call-center/make-call-otp",
    //* Danh sách lịch sử cuộc gọi
    customerCallList: prefixCustomer + "/customer-call/list",
  },
  // Báo cáo tồn kho (inventory service)
  inventoryReport: {
    full: prefixInventory + "/report/stock",
    summary: prefixInventory + "/report/stock/summary",
    movement: prefixInventory + "/report/stock/movement",
    health: prefixInventory + "/report/stock/health",
    trend: prefixInventory + "/report/stock/trend",
    warehousePerf: prefixInventory + "/report/stock/warehouse-perf",
    productDetails: prefixInventory + "/report/stock/product-details",
    cost: prefixInventory + "/report/stock/cost", // Báo cáo Giá vốn
    slow: prefixInventory + "/report/stock/slow", // Báo cáo hàng chậm luân chuyển
    history: prefixInventory + "/report/stock/history", // Báo cáo lịch sử tồn kho
  },
  // Báo cáo bán hàng (sales service)
  salesReport: {
    full: prefixSales + "/report/sales", // API 4 — gộp 1 lần (khuyến nghị)
    summary: prefixSales + "/report/summary", // API 1 — chỉ 4 KPI card
    dailySeries: prefixSales + "/report/daily-series", // API 2 — biểu đồ cột    
    channelBreakdown: prefixSales + "/report/channel-breakdown", // API 3 — bảng kênh bán    
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
    temp: prefixInventory + "/stock-adjust/temp",
    createAdjSlip: prefixInventory + "/stock-adjust/create",
    addUpdatePro: prefixInventory + "/stock-adjust-detail/update",
    // duyệt phiếu điều chỉnh kho
    approved: prefixInventory + "/stock-adjust/approved",
    // từ chối điều chỉnh kho
    cancel: prefixInventory + "/stock-adjust/cancel",
    view: prefixInventory + "/stock-adjust/view",
    list: prefixInventory + "/stock-adjust/list",
    // lấy danh sách sản phẩm có trong kho
    productList: prefixInventory + "/inventory-balance/stock-product/list",
    // xóa đi 1 sản phẩm
    deletePro: prefixInventory + "/stock-adjust-detail/delete",
  },
  // Phiếu xuất hủy — dùng StockAdjust với adjustType = "DESTROY"
  destroySlip: {
    list: prefixInventory + "/stock-adjust/destroy/list",
    temp: prefixInventory + "/stock-adjust/destroy/temp",
    create: prefixInventory + "/stock-adjust/destroy/create",
    // Reuse stockAdjustDetail endpoints
    addUpdatePro: prefixInventory + "/stock-adjust-detail/update",
    deletePro: prefixInventory + "/stock-adjust-detail/delete",
    get: prefixInventory + "/stock-adjust/get",
    approved: prefixInventory + "/stock-adjust/approved",
    cancel: prefixInventory + "/stock-adjust/cancel",
    view: prefixInventory + "/stock-adjust/view",
  },
  kpiDatasource: {
    list: prefixCustomer + "/kpi-datasource/list",
    update: prefixCustomer + "/kpi-datasource/update",
    delete: prefixCustomer + "/kpi-datasource/delete",
  },
  kpiGoal: {
    list: prefixCustomer + "/kpi-goal/list",
    update: prefixCustomer + "/kpi-goal/update",
    delete: prefixCustomer + "/kpi-goal/delete",
    detail: prefixCustomer + "/kpi-goal/get",
  },
  kpiTemplate: {
    list: prefixCustomer + "/kpi-template/list",
    update: prefixCustomer + "/kpi-template/update",
    delete: prefixCustomer + "/kpi-template/delete",
  },
  kpiTemplateGoal: {
    list: prefixCustomer + "/kpi-template-goal/list",
    update: prefixCustomer + "/kpi-template-goal/update",
    delete: prefixCustomer + "/kpi-template-goal/delete",
  },
  kpiSetup: {
    list: prefixCustomer + "/kpi-setup/list",
    update: prefixCustomer + "/kpi-setup/update/web",
    delete: prefixCustomer + "/kpi-setup/delete",
  },
  kpi: {
    list: prefixCustomer + "/kpi/list",
    update: prefixCustomer + "/kpi/update",
    delete: prefixCustomer + "/kpi/delete",

    checkKpiCampaign: prefixCustomer + "/kpi-apply/get/by-campaign-id",
    updateKpi: prefixCustomer + "/campaign/update/kpi",
    listEmployeeKpi: prefixCustomer + "/kpi-object/list",
    addEmployeeToKpi: prefixCustomer + "/kpi-object/get/by-object",
    listGoalKpiEmployee: prefixCustomer + "/kpi-setup-object/list/by-kot-id",
    saveKpiEmployee: prefixCustomer + "/kpi-setup-object/update/web",
    deleteEmployeeKpi: prefixCustomer + "/kpi-object/delete",

    //chỉ tiêu tương tác trong chiến dịch bán hàng
    addEmployeeToKpiContact: prefixCustomer + "/campaign-sale/interaction/kpis",
    saveKpiContactEmployee: prefixCustomer + "/campaign-sale/interaction/kpis",
    listEmployeeKpiContact: prefixCustomer + "/campaign-sale/interaction/employee",
    deleteEmployeeKpiContact: prefixCustomer + "/campaign-sale/interaction/kpis",
  },
  kpiApply: {
    list: prefixCustomer + "/kpi-apply/list",
    update: prefixCustomer + "/kpi-apply/update",
    delete: prefixCustomer + "/kpi-apply/delete",
  },
  kpiObject: {
    list: prefixCustomer + "/kpi-object/list",
    update: prefixCustomer + "/kpi-object/update/web",
    delete: prefixCustomer + "/kpi-object/delete",
    detail: prefixCustomer + "/kpi-object/get",
    detailKpiEmployee: prefixCustomer + "/kpi-object/employee/result",
    exchangeList: prefixCustomer + "/kpi-exchange/list",
    // xóa 1 trao đổi
    deleteKpiExchange: prefixCustomer + "/kpi-exchange/delete",
    // thêm mới 1 trao đổi
    addKpiExchange: prefixCustomer + "/kpi-exchange/update",

    // chỉnh sửa 1 trao đổi
    updateKpiExchange: prefixCustomer + "/kpi-exchange/get",
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
  promotionalProgram: {
    list: prefixMarket + "/promotion/list",
    listActive: prefixMarket + "/promotion/list-active",
    get: prefixMarket + "/promotion/get",
    update: prefixMarket + "/promotion/update",
    delete: prefixMarket + "/promotion/delete",
    countByStatus: prefixMarket + "/promotion/count-by-status",
    updateStatus: prefixMarket + "/promotion/update/status",
    updateDmnSetting: prefixMarket + "/promotion/update/dmn-setting",
    share: prefixMarket + "/promotion/share",
  },
  fixedPricePromotion: {
    getProducts: prefixMarket + "/fixed-price/products",
    saveProducts: prefixMarket + "/fixed-price/products/save",
    activeEntries: prefixMarket + "/fixed-price/active-entries",
    deleteProduct: prefixMarket + "/fixed-price/product/delete",
  },
  couponProgram: {
    list: prefixMarket + "/coupon/list",
    get: prefixMarket + "/coupon/get",
    update: prefixMarket + "/coupon/update",
    delete: prefixMarket + "/coupon/delete",
    updateStatus: prefixMarket + "/coupon/update/status",
    countByStatus: prefixMarket + "/coupon/count-by-status",
    sumUsed: prefixMarket + "/coupon/sum-used",
    apply: prefixMarket + "/coupon/apply",
    share: prefixMarket + "/coupon/share",
  },
  email: {
    list: prefixCustomer + "/outlook-mail/list",
    detail: prefixCustomer + "/outlook-mail/get",
    sendEmail: prefixCustomer + "/outlook-mail/send-email",
    delete: prefixCustomer + "/outlook-mail/delete",
    sendEmailConfirm: prefixCustomer + "/promotion/init-receive-task",

    // call api email
    lstEmail: prefixConnect + "/api/v1/google/gmail/message/search",
    sendEmailNew: prefixConnect + "/api/v1/google/gmail/message/send",
    detailEmail: prefixConnect + "/api/v1/google/gmail/message/get-by-id",
    sendEmailDraft: prefixConnect + "/api/v1/google/gmail/draft/send",
    lstEmailDraft: prefixConnect + "/api/v1/google/gmail/draft/search",
    createEmailDraft: prefixConnect + "/api/v1/google/gmail/draft/create",
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
    listCustomer: prefixCustomer + "/ma-customer/customers",
    listCustomerByType: prefixCustomer + "/ma/customer/get",
    listCustomerByCareer: prefixCustomer + "/ma/statistic/cust-career",
    listCustomerByCustGroup: prefixCustomer + "/ma/statistic/cust-group",
    listCustomerByCustCard: prefixCustomer + "/ma/statistic/cust-card",
    listCustomerByDate: prefixCustomer + "/ma/statistic/by-date",
    detailCustomer: prefixCustomer + "/ma-customer/result",
    deleteCustomer: prefixCustomer + "/ma-customer/delete",
    updateMapping: prefixCustomer + "/ma-mapping/update",
    detailMapping: prefixCustomer + "/ma-mapping/get",
    //Quy tắc tích điểm
    listLoyaltyProgram: prefixBiz + "/market/loyalty-program/list",
    updateLoyaltyProgram: prefixBiz + "/market/loyalty-program/update",
    deleteLoyaltyProgram: prefixBiz + "/market/loyalty-program/delete",
    //Danh sách thành viên
    listLoyaltyPointLedger: prefixBiz + "/market/loyalty-point-ledger/list",
    updateLoyaltyPointLedger: prefixBiz + "/market/loyalty-point-ledger/update",
    deleteLoyaltyPointLedger: prefixBiz + "/market/loyalty-point-ledger/delete",
    //Danh sách đổi thưởng
    listLoyaltyReward: prefixBiz + "/market/loyalty-reward/list",
    getLoyaltyReward: prefixBiz + "/market/loyalty-reward/get",
    updateLoyaltyReward: prefixBiz + "/market/loyalty-reward/update",
    deleteLoyaltyReward: prefixBiz + "/market/loyalty-reward/delete",
    loyaltyReportSummary: prefixBiz + "/market/loyalty-report/summary",
    loyaltyReportRfm:     prefixBiz + "/market/loyalty-report/rfm",

    // GAP #4 — Referral / giới thiệu bạn bè
    referralList:   prefixBiz + "/market/referral/list",
    referralUpdate: prefixBiz + "/market/referral/update",
    referralRule:   prefixBiz + "/market/referral-rule/get",
    referralRuleUpdate: prefixBiz + "/market/referral-rule/update",
    referralStats:  prefixBiz + "/market/referral/stats",

    // GAP #7 — Gamification
    gamificationLeaderboard: prefixBiz + "/market/gamification/leaderboard",
    gamificationBadges:      prefixBiz + "/market/gamification/badges",
    gamificationCustomer:    prefixBiz + "/market/gamification/customer",
    //phân hạng hội viên
    listLoyaltySegment: prefixBiz + "/market/loyalty-segment/list",
    updateLoyaltySegment: prefixBiz + "/market/loyalty-segment/update",
    deleteLoyaltySegment: prefixBiz + "/market/loyalty-segment/delete",
    //ví hội viên
    listLoyaltyWallet: prefixBiz + "/market/loyalty-wallet/list",
    getWalletByCustomer: prefixBiz + "/market/loyalty-wallet/get-by-customer",
    promotionCheckEligible: prefixBiz + "/market/promotion/check-eligible",
    createLoyaltyWallet: prefixBiz + "/market/loyalty-wallet/update",
    fluctuatePoint: prefixBiz + "/market/loyalty-point-ledger/fluctuate-point",
    getLoyaltyConfig: prefixBiz + "/market/loyalty-config/get",
    updateLoyaltyConfig: prefixBiz + "/market/loyalty-config/update",
    consumePoint: prefixBiz + "/market/loyalty-point-ledger/consume-point",
    exportLoyaltyWallet:       prefixBiz + "/market/loyalty-wallet/export",
    exportLoyaltyPointLedger:  prefixBiz + "/market/loyalty-point-ledger/export",
  },

  //TODO: Start quy trình bpm
  businessProcess: {
    list: prefixBpm + "/business-process/list",
    clone: prefixBpm + "/business-process/clone",
    update: prefixBpm + "/business-process/update",
    get: prefixBpm + "/business-process/get",
    detail: prefixBpm + "/business-process/detail",
    delete: prefixBpm + "/business-process/delete",

    addNode: prefixBpm + "/business-process/config-node/update",
    deleteNode: prefixBpm + "/business-process/node/delete",

    updateLinkNode: prefixBpm + "/business-process/update-config",

    //lấy danh sách các bước
    listStep: prefixBpm + "/workflow/list",
    //thêm các bước
    updateStep: prefixBpm + "/workflow/update",
    //xoas các bước
    deleteStep: prefixBpm + "/workflow/delete",
    //lấy danh sách item workflow ở step
    listWorkflow: prefixBpm + "/workflow-status/list",
    listWorkflowCloud: prefixCustomer + "/workflow-status/list",
    deleteWorkflow: prefixBpm + "/workflow-status/delete",

    //update sla
    updateSLA: prefixBpm + "/business-process/update/sla",

    //bpmaddNode
    bpmAddNode: prefixBpm + "/bpm-config-node/update",
    bpmAddNameNode: prefixBpm + "/bpm-config-node/update/name",
    bpmDeleteNode: prefixBpm + "/bpm-config-node/delete",
    bpmListNode: prefixBpm + "/bpm-config-node/list",
    bpmDetailNode: prefixBpm + "/bpm-config-node/get",
    //bpmaddLinkNode
    bpmAddLinkNode: prefixBpm + "/bpm-config-link-node/update",
    bpmAddNameLinkNode: prefixBpm + "/bpm-config-link-node/update/name",
    bpmDeleteLinkNode: prefixBpm + "/bpm-config-link-node/delete",
    bpmAddLinkNodeConfig: prefixBpm + "/bpm-config-link-node/update/config",
    bpmGetLinkNode: prefixBpm + "/bpm-config-link-node/get",
    //save diagram
    saveDiagram: prefixBpm + "/business-process/update/config",
    //get diagram
    getDetailDiagram: prefixBpm + "/business-process/get",

    //Lấy về biến quy trình
    listVariableDeclare: prefixBpm + "/variable-declare/list",
    updateVariableDeclare: prefixBpm + "/variable-declare/update",
    detailVariableDeclare: prefixBpm + "/variable-declare/get",
    deleteVariableDeclare: prefixBpm + "/variable-declare/delete",

    //Lấy về giá trị biến quy trình
    listVariableInstance: prefixBpm + "/variable-instance/list",

    //Lấy về toàn bộ biến quy trình
    listVariableDeclareGlobal: prefixBpm + "/variable-declare/list/global",

    //user task
    updateUserTask: prefixBpm + "/bpm-form/update",
    detailUserTask: prefixBpm + "/bpm-form/get",
    cloneUserTask: prefixBpm + "/user-task/clone",
    //clone form mapping
    cloneFormMapping: prefixBpm + "/form-mapping/clone",
    //list trường trong form
    listBpmForm: prefixBpm + "/bpm-form/list",
    //Lấy về toàn bộ trường trong quy trình
    listBpmFormGlobal: prefixBpm + "/bpm-form/list/global",
    //Lấy về list giá trị form quy trình
    listBpmFormData: prefixBpm + "/bpm-form-data/list",
    //Lấy về cụ thể giá trị form quy trình
    getBpmFormDataByNodeId: prefixBpm + "/bpm-form-data/get-by-node-id",
    //list trường trong form để mapping
    listBpmFormMapping: prefixBpm + "/bpm-form/list/mapping",
    //service task
    updateServiceTask: prefixBpm + "/service-task/update",
    detailServiceTask: prefixBpm + "/service-task/get",
    cloneServiceTask: prefixBpm + "/service-task/clone",
    //script task
    updateScriptTask: prefixBpm + "/script-task/update",
    detailScriptTask: prefixBpm + "/script-task/get",
    cloneScriptTask: prefixBpm + "/script-task/clone",
    //manual task
    updateManualTask: prefixBpm + "/manual-task/update",
    detailManualTask: prefixBpm + "/manual-task/get",
    cloneManualTask: prefixBpm + "/manual-task/clone",
    //business rule task
    updateBusinessRuleTask: prefixBpm + "/business-rule-task/update",
    updateBusinessRuleTaskAdvance: prefixBpm + "/decision-table/update",
    updateBusinessRuleTaskComplex: prefixBpm + "/bpm-assignment-rule/update",
    detailBusinessRuleTask: prefixBpm + "/business-rule-task/get",
    updatePickMode: prefixBpm + "/decision-table/update/pick-mode",
    cloneBusinessRuleTask: prefixBpm + "/business-rule-task/clone",
    detailBusinessRuleTaskAdvance: prefixBpm + "/decision-table/get",
    detailBusinessRuleTaskComplex: prefixBpm + "/bpm-assignment-rule/get",
    checkType: prefixBpm + "/business-rule-task/check-type",
    checkTypeOLA: prefixBpm + "/ola/check-type",
    //send task
    updateSendTask: prefixBpm + "/send-task/update",
    detailSendTask: prefixBpm + "/send-task/get",
    cloneSendTask: prefixBpm + "/send-task/clone",
    //Message Intermediate Throw Event
    updateMessageIntermediateThrowEvent: prefixBpm + "/message-intermediate-throw-event/update",
    detailMessageIntermediateThrowEvent: prefixBpm + "/message-intermediate-throw-event/get",
    cloneMessageIntermediateThrowEvent: prefixBpm + "/message-intermediate-throw-event/clone",
    //Message Intermediate Catch Event
    updateMessageIntermediateCatchEvent: prefixBpm + "/message-intermediate-catch-event/update",
    detailMessageIntermediateCatchEvent: prefixBpm + "/message-intermediate-catch-event/get",
    cloneMessageIntermediateCatchEvent: prefixBpm + "/message-intermediate-catch-event/clone",
    //receive task
    updateReceiveTask: prefixBpm + "/receive-task/update",
    detailReceiveTask: prefixBpm + "/receive-task/get",
    cloneReceiveTask: prefixBpm + "/receive-task/clone",
    //call activity
    updateCallActivityTask: prefixBpm + "/call-activity/update",
    detailCallActivityTask: prefixBpm + "/call-activity/get",
    cloneCallActivityTask: prefixBpm + "/call-activity/clone",
    //parallel gateway
    updateParallelGateway: prefixBpm + "/parallel-gateway/update",
    detailParallelGateway: prefixBpm + "/parallel-gateway/get",
    cloneParallelGateway: prefixBpm + "/parallel-gateway/clone",
    //exclusive gateway
    updateExclusiveGateway: prefixBpm + "/exclusive-gateway/update",
    detailExclusiveGateway: prefixBpm + "/exclusive-gateway/get",
    cloneExclusiveGateway: prefixBpm + "/exclusive-gateway/clone",
    //inclusive gateway
    updateInclusiveGateway: prefixBpm + "/inclusive-gateway/update",
    detailInclusiveGateway: prefixBpm + "/inclusive-gateway/get",
    cloneInclusiveGateway: prefixBpm + "/inclusive-gateway/clone",
    //complex gateway
    updateComplexGateway: prefixBpm + "/complex-gateway/update",
    detailComplexGateway: prefixBpm + "/complex-gateway/get",
    cloneComplexGateway: prefixBpm + "/complex-gateway/clone",
    //complex gateway
    updateSubprocess: prefixBpm + "/subprocess/update",
    detailSubprocess: prefixBpm + "/subprocess/get",
    cloneSubprocess: prefixBpm + "/subprocess/clone",
    //timer start event
    updateTimerStartEvent: prefixBpm + "/timer-task/update",
    detailTimerStartEvent: prefixBpm + "/timer-task/get",
    cloneTimerStartEvent: prefixBpm + "/timer-task/clone",
    //timer intermediate catch event
    updateTimerIntermediateCatchEvent: prefixBpm + "/timer-intermediate/update",
    detailTimerIntermediateCatchEvent: prefixBpm + "/timer-task/get",
    cloneTimerIntermediateCatchEvent: prefixBpm + "/timer-task/clone",
    //start event
    updateStartTaskEvent: prefixBpm + "/start-task/update",
    detailStartTaskEvent: prefixBpm + "/start-task/get",
    cloneStartTaskEvent: prefixBpm + "/start-task/clone",
    //message start event
    updateStartMessageEvent: prefixBpm + "/message-start-event/update",
    detailStartMessageEvent: prefixBpm + "/message-start-event/get",
    cloneStartMessageEvent: prefixBpm + "/message-start-event/clone",
    //end event
    updateEndTaskEvent: prefixBpm + "/end-task/update",
    detailEndTaskEvent: prefixBpm + "/end-task/get",
    cloneEndTaskEvent: prefixBpm + "/end-task/clone",

    //Escalation intermediate throw event
    updateEscalationIntermediateThrowEvent: prefixBpm + "/escalation-throw-task/update",
    detailEscalationIntermediateThrowEvent: prefixBpm + "/escalation-throw-task/get",
    cloneEscalationIntermediateThrowEvent: prefixBpm + "/escalation-throw-task/clone",

    //Escalation start event
    updateEscalationStartEvent: prefixBpm + "/escalation-start-event-task/update",
    detailEscalationStartEvent: prefixBpm + "/escalation-start-event-task/get",
    cloneEscalationStartEvent: prefixBpm + "/escalation-start-event-task/clone",

    //conditional catch intermediate
    updateConditionalCatchEventTask: prefixBpm + "/conditional-catch-event-task/update",
    detailConditionalCatchEventTask: prefixBpm + "/conditional-catch-event-task/get",

    //signal start event
    updateSignalStartEvent: prefixBpm + "/signal-start-event/update",
    detailSignalStartEvent: prefixBpm + "/signal-start-event/get",
    cloneSignalStartEvent: prefixBpm + "/signal-start-event/clone",

    //signal end event
    updateSignalEndEvent: prefixBpm + "/signal-end-event/update",
    detailSignalEndEvent: prefixBpm + "/signal-end-event/get",
    cloneSignalEndEvent: prefixBpm + "/signal-end-event/clone",

    //signal intermediate throw event
    updateSignalIntermediateThrowEvent: prefixBpm + "/signal-throw-event/update",
    detailSignalIntermediateThrowEvent: prefixBpm + "/signal-throw-event/get",
    cloneSignalIntermediateThrowEvent: prefixBpm + "/signal-throw-event/clone",

    //signal intermediate catch event
    updateSignalIntermediateCatchEvent: prefixBpm + "/signal-catch-event/update",
    detailSignalIntermediateCatchEvent: prefixBpm + "/signal-catch-event/get",
    cloneSignalIntermediateCatchEvent: prefixBpm + "/signal-catch-event/clone",

    //conditional start event
    updateConditionalStartEvent: prefixBpm + "/conditional-start-event-task/update",
    detailConditionalStartEvent: prefixBpm + "/conditional-start-event-task/get",

    //Compensation Intermediate throw event
    updateCompensationIntermediateThrowEvent: prefixBpm + "/compensation-intermediate-throw-event/update",
    detailCompensationIntermediateThrowEvent: prefixBpm + "/compensation-intermediate-throw-event/get",
    cloneCompensationIntermediateThrowEvent: prefixBpm + "/compensation-intermediate-throw-event/clone",
    getCompensationRef: prefixBpm + "/bpm-config-node/list/compensation",

    //Compensation End Event
    updateCompensationEndEvent: prefixBpm + "/compensation-end-event/update",
    detailCompensationEndEvent: prefixBpm + "/compensation-end-event/get",
    cloneCompensationEndEvent: prefixBpm + "/compensation-end-event/clone",

    //Terminate end event
    updateTerminateEndEvent: prefixBpm + "/terminate-end-event/update",
    detailTerminateEndEvent: prefixBpm + "/terminate-end-event/get",
    cloneTerminateEndEvent: prefixBpm + "/terminate-end-event/clone",

    //Error end event
    updateErrorEndEvent: prefixBpm + "/error-end-event/update",
    detailErrorEndEvent: prefixBpm + "/error-end-event/get",
    cloneErrorEndEvent: prefixBpm + "/error-end-event/clone",

    //error start event
    updateErrorStartEvent: prefixBpm + "/error-start-event/update",
    detailErrorStartEvent: prefixBpm + "/error-start-event/get",
    cloneErrorStartEvent: prefixBpm + "/error-start-event/clone",

    //link catch intermediate
    updateLinkCatchEventTask: prefixBpm + "/link-event/update",
    detailLinkCatchEventTask: prefixBpm + "/link-catch-event/get",

    //message end event
    updateEndMessageEvent: prefixBpm + "/message-end-event/update",
    detailEndMessageEvent: prefixBpm + "/message-end-event/get",
    cloneEndMessageEvent: prefixBpm + "/message-end-event/clone",
    //bpm participant
    updateBpmParticipant: prefixBpm + "/bpm-participant/update",
    getBpmParticipant: prefixBpm + "/bpm-participant/get",

    //Lấy về danh sách luồng tới
    listLinkTo: prefixBpm + "/bpm-config-link-node/list",

    //Lấy về danh sách luồng ra
    listLinkForm: prefixBpm + "/bpm-config-link-node/list/from",

    //handle task
    updateHandleTask: prefixBpm + "/bpm-form/activate",

    //handle task init
    updateHandleTaskInit: prefixBpm + "/bpm-form/init",

    //tạo ycms
    purchaseRequestApprove: prefixBpm + "/purchase-request/approve",

    //handle task lưu nháp
    updateHandleTaskDraft: prefixBpm + "/bpm-form/draft",

    //tạo ycms lưu nháp
    purchaseRequestDraft: prefixBpm + "/purchase-request/draft",

    //lấy về dữ liệu khởi tạo của form xử lý task
    getDataForm: prefixBpm + "/bpm-engine/form",

    //lấy về lịch sử đối tượng trong quy trình
    getProcessedObjectLog: prefixBpm + "/processed-object-log/list",

    //Mô phỏng quy trình
    listBpmTrigger: prefixBpm + "/bpm-trigger/list",
    activeBpmTrigger: prefixBpm + "/bpm-trigger/activate",

    //lịch sử xử lý
    processedObjectLog: prefixBpm + "/processed-object-log/list",
    processedObjectLogPage: prefixBpm + "/processed-object-log/list/page",

    //OLA, SLA
    updateServiceLevel: prefixBpm + "/service-level/update",
    listServiceLevel: prefixBpm + "/service-level/list",
    updateHistoryOLA: prefixBpm + "/service-level-history/insert",
    listHistoryOLA: prefixBpm + "/service-level-history/get-history",

    //Tiếp nhận xử lý
    receiveProcessedObjectLog: prefixBpm + "/processed-object-log/receive",

    //Tạm dừng xử lý
    onholdProcessedObjectLog: prefixBpm + "/processed-object-log/onhold",

    //Tiếp tục xử lý
    onContinue: prefixBpm + "/work-order/update/continue",

    //Thu hồi công việc:
    onWorkRecall: prefixBpm + "/work-order/recall",
    onCheckWorkResult: prefixBpm + "/work-order/recall/check-result",
    confirmWorkRecall: prefixBpm + "/work-order/recall/confirm",

    //lấy về các node của một quy trình để debug
    debugListNodeProcess: prefixBpm + "/bpm-config-node/list/children",

    //lấy về các node bắt đầu của một quy trình để debug
    debugListNodeStartProcess: prefixBpm + "/bpm-config-node/list",

    //lấy về các link của một quy trình để debug
    debugListLinkNodeProcess: prefixBpm + "/bpm-config-link-node/list/children",
    // debugListLinkNodeProcess: prefixBpm + "/bpmConfigLinkNode/list/from",

    //lấy danh sách bước (node) để từ chối rồi quay lại
    listNodeHistory: prefixBpm + "/bpm-config-node/list/history",

    //Thêm cột trong grid
    addArtifactGrid: prefixBpm + "/artifact-gird/add",
    getArtifactGrid: prefixBpm + "/artifact-gird/get",

    //Timer
    updateTimer: prefixBpm + "/bpm-form/update/timer",
    // getTimer: prefixBpm + "/bpmForm/get/timer",

    //Type
    updateType: prefixBpm + "/bpm-form/update/type",

    //Thêm artifact vào list để cấu hình
    updateArtifactMetadata: prefixBpm + "/artifact-metadata/update",
    listArtifactMetadata: prefixBpm + "/artifact-metadata/list",
    getArtifactMetadata: prefixBpm + "/artifact-metadata/get",
    deleteArtifactMetadata: prefixBpm + "/artifact-metadata/delete",

    //thêm cấu trúc hồ sơ
    updateBpmObject: prefixBpm + "/bpm-object/update",
    detailBpmObject: prefixBpm + "/bpm-object/get-by-process-id",

    // show log lỗi của quy trình
    getErrorLogData: prefixBpm + "/find-by-criteria",

    //export data process
    exportDataProcess: prefixBpm + "/business-process/export-excel",

    //api lấy về link url để tải file
    getUrlExportDataProcess: prefixBpm + "/business-process/export-excel/status",

    //import data process
    importDataProcess: prefixBpm + "/business-process/import-excel",

    // state
    listState: prefixBpm + "/state-mapping/list",
    createState: prefixBpm + "/state-mapping/update",
    updateState: prefixBpm + "/state-mapping/update",
    deleteState: prefixBpm + "/state-mapping/delete",
  },

  bpmForm: {
    lst: prefixBpm + "/bpm-form/list",
    update: prefixBpm + "/bpm-form/update",
    delete: prefixBpm + "/bpm-form/delete",
  },

  bpmFormProcess: {
    lst: prefixBpm + "/bpm-form-process/list",
    update: prefixBpm + "/bpm-form-process/update",
    detail: prefixBpm + "/bpm-form-process/get",
    delete: prefixBpm + "/bpm-form-process/delete",
  },

  bpmParticipant: {
    lst: prefixBpm + "/bpm-participant/list",
    update: prefixBpm + "/bpm-participant/update",
    detail: prefixBpm + "/bpm-participant/get",
    delete: prefixBpm + "/bpm-participant/delete",
  },

  bpmEformMapping: {
    lstSource: prefixBpm + "/eform-mapping/list/source",
    update: prefixBpm + "/eform-mapping/update",
    detail: prefixBpm + "/eform-mapping/get",
    delete: prefixBpm + "/eform-mapping/delete",

    lstEform: prefixCustomer + "/bpm/list/eform",
  },

  bpmFormMapping: {
    list: prefixBpm + "/form-mapping/list",
    listSource: prefixBpm + "/form-mapping/list/source",
    listTarget: prefixBpm + "/form-mapping/list/target",
    update: prefixBpm + "/form-mapping/update",
    detail: prefixBpm + "/form-mapping/get",
    delete: prefixBpm + "/form-mapping/delete",
  },

  rest: {
    callApi: prefixBpm + "/rest/call",
  },

  bpmFormArtifact: {
    lst: prefixBpm + "/bpm-form-artifact/list",
    detail: prefixBpm + "/bpm-form-artifact/get",
    update: prefixBpm + "/bpm-form-artifact/update",
    updatePosition: prefixBpm + "/bpm-form-artifact/update/position",
    updateConfig: prefixBpm + "/bpm-form-artifact/update/config",
    updateEform: prefixBpm + "/bpm-form-artifact/update/eform",
    delete: prefixBpm + "/bpm-form-artifact/delete",
  },

  // Các API liên quan tới quản lý tài liệu
  document: {
    lst: prefixBpm + "/document/list",
    update: prefixBpm + "/document/update",
    delete: prefixBpm + "/document/delete",
    detail: prefixBpm + "/document/detail",
    deleteByUrl: prefixBpm + "/document/delete/by-url",
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
    resetTransferVotes: prefixCs + "/support-object/reset",
    statisticStatus: prefixCs + "/purchase-request/statistic/status",
    statisticStatusByDate: prefixCs + "/purchase-request/statistic/status/by-date",
    statisticList: prefixCs + "/purchase-request/list-statistic",
    purchaseCategory: prefixCs + "/product-category/list",
    purchaseProduct: prefixCs + "/product/list",
    paymentBill: prefixCs + "/purchase-request/get-json",
    contractInfo: prefixCs + "/renewal-offer/get-information-aggregate",
    renewalContract: prefixSale + "/renewal-contract/init-business-process",
    initReceiveTask: prefixCs + "/purchase-request/init-receive-task",
    updateCertificate: prefixCs + "/purchase-request/update-certificate",
    getJssdk: prefixSale + "/contract-insurance/get/jssdk",
    getProductJssdk: prefixCs + "/product/get/jssdk",
  },
  managementAsked: {
    list: prefixApplication + "/clarification-request/list",
    update: prefixApplication + "/clarification-request/update",
    detail: prefixApplication + "/clarification-request/get",
    delete: prefixApplication + "/clarification-request/delete",

    //trả lời yêu cầu làm rõ
    replyAsked: prefixApplication + "/clarification-response/update",

    //chia yêu cầu làm rõ cho nhanh viên
    assignRequest: prefixApplication + "/clarification-request/assign",

    //lưu thông tin câu trả lời
    saveReply: prefixApplication + "/clarification-response/update",
    getDetailReply: prefixApplication + "/clarification-response/get",

    //lấy danh sách câu trả lời của 1 gói thầu
    getRepsonseList: prefixApplication + "/clarification-response/list",

    //gửi câu trả lời làm rõ
    insertRepsonse: prefixApplication + "/clarification-response/insert",
  },
  tenderPackage: {
    list: prefixApplication + "/tender-package/list",
    update: prefixApplication + "/tender-package/update",
    detail: prefixApplication + "/tender-package/get",
    delete: prefixApplication + "/tender-package/delete",

    listBiddingInvitation: prefixApplication + "/tender-invitation/list",
    listContractor: prefixApplication + "/tender-invitation/list-contractor",
    updateBidding: prefixApplication + "/tender-invitation/update",
    cancelBidding: prefixApplication + "/tender-invitation/cancel",
    detailBiddingInvitation: prefixApplication + "/tender-invitation/get",
    updateBiddingStatus: prefixApplication + "/tender-invitation/update/bidding-status",
    listSubmittedDocument: prefixApplication + "/submitted-document/list",
    //Mở thầu
    openBidding: prefixApplication + "/tender-opening/update",

    //Đánh giá hồ sơ dự thầu
    updateBatch: prefixApplication + "/document-evaluation/update-batch",

    //Gửi đánh giá cho thư ký tổng hợp
    submitReview: prefixApplication + "/submitted-document/submit-review/update",

    //tổng hợp kết quả đánh giá hồ sơ kỹ thuật trên màn hình thư ký
    getResultDocumentEvaluation: prefixApplication + "/document-evaluation/get-result",

    //tổng hợp kết quả đánh giá hồ sơ tài chính trên màn hình thư ký
    getResultFinanceEvaluation: prefixApplication + "/document-evaluation/get-finances",

    //Gửi phản hồi kết quả đánh giá
    sendEvaluation: prefixApplication + "/document-evaluation/send-evaluation",

    ///Gửi tổng hợp yêu cầu làm rõ
    updateGeneralClarification: prefixApplication + "/general-clarification/update",
    listGeneralClarification: prefixApplication + "/general-clarification/list",

    //Gia hạn gói thầu
    extensionHistory: prefixApplication + "/extension-history/insert",
    detailExtensionRequest: prefixApplication + "/extension-request/get",
    listExtensionHistory: prefixApplication + "/extension-history/list",
  },
  grid: {
    list: prefixCustomer + "/artifact-grid-header/list",

    //Thêm cột
    update: prefixBpm + "/artifact-grid-header/update",
    detail: prefixBpm + "/artifact-grid-header/get",
    delete: prefixBpm + "/artifact-grid-header/delete",

    //Thêm hàng
    updateRow: prefixBpm + "/artifact-grid/update",
    detailRow: prefixBpm + "/artifact-grid/get",
    deleteRow: prefixBpm + "/artifact-grid/delete",

    importFile: prefixBpm + "/upload/excel-file",

    //Thêm hàng
    updateComment: prefixBpm + "/artifact-comment/update",
    listComment: prefixBpm + "/artifact-comment/list",

    //Lấy lữ liệu upload
    getRowsUpload: prefixBpm + "/upload/get-rows",
  },
  //TODO: End quy trình bpm

  //ngân sách marketing
  marketingBudget: {
    list: prefixCustomer + "/marketing-budget/list",
    update: prefixCustomer + "/marketing-budget/update",
    updateStatus: prefixCustomer + "/marketing-budget/update/status",
    detail: prefixCustomer + "/marketing-budget/get",
    delete: prefixCustomer + "/marketing-budget/delete",
  },

  //kênh MA
  marketingChannel: {
    list: prefixCustomer + "/marketing-channel/list",
    update: prefixCustomer + "/marketing-channel/update",
    detail: prefixCustomer + "/marketing-channel/get",
    delete: prefixCustomer + "/marketing-channel/delete",
  },

  //đo lường MA
  marketingMeasurement: {
    list: prefixCustomer + "/marketing-measurement/list",
    update: prefixCustomer + "/marketing-measurement/update",
    detail: prefixCustomer + "/marketing-measurement/get",
    delete: prefixCustomer + "/marketing-measurement/delete",
  },

  //đo lường MA
  marketingReport: {
    list: prefixCustomer + "/marketing-report/list",
    update: prefixCustomer + "/marketing-report/update",
    detail: prefixCustomer + "/marketing-report/get",
    delete: prefixCustomer + "/marketing-report/delete",
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
    lst: prefixCustomer + "/object-feature/list",
    update: prefixCustomer + "/object-feature/update",
    delete: prefixCustomer + "/object-feature/delete",
    detail: prefixCustomer + "/object-feature/detail",
  },

  // Khảo sát khách hàng
  surveyForm: {
    lst: prefixCustomer + "/survey-form/list",
    update: prefixCustomer + "/survey-form/update",
    delete: prefixCustomer + "/survey-form/delete",
    detail: prefixCustomer + "/survey-form/get",
    statistic: prefixCustomer + "/survey",
    submitVoc: prefixRebornVn.replace("/api", "") + "/log-capture/crm/survey",
  },

  //báo giá
  offer: {
    list: prefixCustomer + "/offer/list/v2",
    create: prefixCustomer + "/offer/create",
    offerDetail: prefixCustomer + "/offer-detail/import",
    cardService: prefixCustomer + "/offer-detail/card-service",
    // Tạo báo giá
    offerDetailCustomer: prefixCustomer + "/offer-detail/customer",
    // Xem chi tiết báo giá
    offerDetailList: prefixCustomer + "/offer-detail/list",
    // Hủy báo giá
    cancelOffer: prefixCustomer + "/offer/delete",
    // lấy danh sách thu tiền, chi tiền của khách
    debtOffer: prefixCustomer + "/offer/debt",
    // lưu tạm hóa đơn
    temporarilyOffer: prefixCustomer + "/offer/update/temp",
  },

  offerService: {
    addToInvoice: prefixCustomer + "/offer-service/update",
    delete: prefixCustomer + "/offer-service/delete",
    update: prefixCustomer + "/offer-service/update",
    detail: prefixCustomer + "/offer-service/get",
    getByCustomer: prefixCustomer + "/offer-service/get-bought-service-by-customer-id",
  },
  offerProduct: {
    list: prefixCustomer + "/offer-product/list",
    addToInvoice: prefixCustomer + "/offer-product/update",
    delete: prefixCustomer + "/offer-product/delete",
    update: prefixCustomer + "/offer-product/update",
    detail: prefixCustomer + "/offer-product/get",
    getByCustomer: prefixCustomer + "/offer-product/get-bought-product-by-customer-id",
  },
  offerCard: {
    list: prefixCustomer + "/offer-card-service/list",
    add: prefixCustomer + "/offer-card-service/update",
    delete: prefixCustomer + "/offer-card-service/delete",
    update: prefixCustomer + "/offer-card-service/update/card-number",
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
    resetSignal: prefixCustomer + "/approval-object/reset",
    // cấu hình form fs
    fsFormLst: prefixCustomer + "/fs-form/list",
    fsFormUpdate: prefixCustomer + "/fs-form/update",
    fsFormDelete: prefixCustomer + "/fs-form/delete",
    fsFormUpdatePostion: prefixCustomer + "/fs-form/update/position",
  },

  // quote
  quote: {
    lst: prefixCustomer + "/quote/list",
    update: prefixCustomer + "/quote/update",
    delete: prefixCustomer + "/quote/delete",
    cloneQuote: prefixCustomer + "/quote/clone",
    updateStatus: prefixCustomer + "/quote/update/status",
    resetSignal: prefixCustomer + "/approval-object/reset",
    // cấu hình form quote
    quoteFormLst: prefixCustomer + "/quote-form/list",
    quoteFormUpdate: prefixCustomer + "/quote-form/update",
    quoteFormDelete: prefixCustomer + "/quote-form/delete",
    quoteFormUpdatePostion: prefixCustomer + "/quote-form/update/position",

    lstQuoteContract: prefixCustomer + "/contract-quote/list",
    updateQuoteContract: prefixCustomer + "/contract-quote/update",
    deleteQuoteContract: prefixCustomer + "/contract-quote/delete-by-quote-id",
  },

  /**
   * Lịch sử phê duyệt trên form
   */
  approvedObjectLog: {
    lst: prefixBpm + "/approved-object-log/list",
  },

  // cài đặt quy trình
  approval: {
    lst: prefixCustomer + "/approval/list",
    update: prefixCustomer + "/approval/update",
    delete: prefixCustomer + "/approval/delete",
    updateStatus: prefixCustomer + "/approval/update/status",
    //config
    lstConfig: prefixCustomer + "/approval-config/list",
    updateConfig: prefixCustomer + "/approval-config/update",
    deleteConfig: prefixCustomer + "/approval-config/delete",
    //link
    lstLink: prefixCustomer + "/approval-link/list",
    updateLink: prefixCustomer + "/approval-link/update",
    deleteLink: prefixCustomer + "/approval-link/delete",
    //object
    lstObject: prefixCustomer + "/approval-object/list",
    updateObject: prefixCustomer + "/approval-object/update",
    deleteObject: prefixCustomer + "/approval-object/delete",
    takeObject: prefixCustomer + "/approval-object/get/object",
    checkApproved: prefixCustomer + "/approval-object/check-approved",
    //log
    lstLog: prefixCustomer + "/approval-log/list",
    updateLog: prefixCustomer + "/approval-log/update",
    deleteLog: prefixCustomer + "/approval-log/delete",

    //alert
    updateAlert: prefixCustomer + "/approval/update/alert-config",
  },
  // đoạn này lấy ra danh sách các gói
  package: {
    list: prefixRebornVn + "/package/list",
    update: prefixRebornVn + "/package/update",
    updateStatus: prefixRebornVn + "/package/update/status",
    detail: prefixRebornVn + "/package/get",
    delete: prefixRebornVn + "/package/delete",
    addOrgApp: prefixRebornVn + "/org-app/add",
    updateBill: prefixRebornVn + "/org-app/update/bill",
    calcPrice: prefixRebornVn + "/org-app/calc/price-remaining",
    extend: prefixRebornVn + "/org-app/extend",
    upgrade: prefixRebornVn + "/org-app/upgrade",
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
    updateObjectId: prefixCustomer + "/gift/update-objectid",
    delete: prefixCustomer + "/gift/delete",
  },
  // đoạn này tạo ra mã qr code
  qrCode: {
    list: prefixCustomer + "/qr-code/list",
    update: prefixCustomer + "/qr-code/update",
    delete: prefixCustomer + "/qr-code/delete",
    detail: prefixCustomer + "/qr-code/get",
  },
  // cài đặt mẫu hợp đồng
  sheetQuoteForm: {
    list: prefixCustomer + "/sheet/list",
    update: prefixCustomer + "/sheet/update",
    delete: prefixCustomer + "/sheet/delete",
    detail: prefixCustomer + "/sheet/get",
  },
  sheetFieldQuoteForm: {
    list: prefixCustomer + "/sheet-field/list",
    update: prefixCustomer + "/sheet-field/update",
    updatePosition: prefixCustomer + "/sheet-field/update/position",
    delete: prefixCustomer + "/sheet-field/delete",
    detail: prefixCustomer + "/sheet-field/get",
  },

  ///BPM

  common: {
    list: prefixCustomer + "/common/list",
    update: prefixCustomer + "/common/update",
    detail: prefixBpm + "/common/get",
    delete: prefixCustomer + "/common/delete",
  },

  processedObject: {
    lst: prefixBpm + "/processed-object/list",
    update: prefixBpm + "/processed-object/update",
    updateProcess: prefixBpm + "/processed-object/update/process-id",
    updateProcessInstance: prefixBpm + "/process-instance/update",
    delete: prefixBpm + "/processed-object/delete",
    cloneQuote: prefixBpm + "/processed-object/clone",
    updateStatus: prefixBpm + "/processed-object/update/status",
    resetSignal: prefixBpm + "/approval-object/reset",

    bpmStart: prefixBpm + "/bpm/start",
    bpmExecListNode: prefixBpm + "/bpm/exec/list/node",
    bpmProcess: prefixBpm + "/bpm/process",
    bpmArtifactData: prefixBpm + "/bpm-artifact-data/get-by-bfat-id",
    bpmParticipantProcesslog: prefixBpm + "/bpm-participant-processlog/list",
    processedObjectLog: prefixBpm + "/processed-object-log/list",
  },

  objectGroup: {
    list: prefixBpm + "/object-group/list",
    update: prefixBpm + "/object-group/update",
    updateConfig: prefixBpm + "/object-group/update/config",
    detail: prefixBpm + "/object-group/get",
    delete: prefixBpm + "/object-group/delete",
  },

  objectAttribute: {
    list: prefixBpm + "/object-attribute/list",
    update: prefixBpm + "/object-attribute/update",
    detail: prefixBpm + "/object-attribute/get",
    delete: prefixBpm + "/object-attribute/delete",
    listAll: prefixBpm + "/object-attribute/list-all",
    checkDuplicated: prefixBpm + "/object-attribute/check-duplicated",
    updatePosition: prefixBpm + "/object-attribute/update/position",
  },
  objectExtraInfo: {
    list: prefixCustomer + "/object-extra-info/list",
  },

  //Tài chính ngân hàng
  netLoan: {
    lst: prefixFinance + "/net-loan/list",
    update: prefixFinance + "/net-loan/update",
    get: prefixFinance + "/net-loan/get",
    delete: prefixFinance + "/net-loan/delete",
  },
  netDeposit: {
    lst: prefixFinance + "/net-deposit/list",
    update: prefixFinance + "/net-deposit/update",
    get: prefixFinance + "/net-deposit/get",
    delete: prefixFinance + "/net-deposit/delete",
  },
  netServiceCharge: {
    lst: prefixFinance + "/net-service-charge/list",
    update: prefixFinance + "/net-service-charge/update",
    get: prefixFinance + "/net-service-charge/get",
    delete: prefixFinance + "/net-service-charge/delete",
  },
  productDemand: {
    lst: prefixFinance + "/product-demand/list",
    update: prefixFinance + "/product-demand/update",
    get: prefixFinance + "/product-demand/get",
    delete: prefixFinance + "/product-demand/delete",
  },
  briefFinancialReport: {
    lst: prefixFinance + "/brief-financial-report/list",
    update: prefixFinance + "/brief-financial-report/update",
    get: prefixFinance + "/brief-financial-report/get",
    delete: prefixFinance + "/brief-financial-report/delete",
  },
  fullFinancialReport: {
    lst: prefixFinance + "/full-financial-report/list",
    update: prefixFinance + "/full-financial-report/update",
    get: prefixFinance + "/full-financial-report/get",
    delete: prefixFinance + "/full-financial-report/delete",
  },
  loanInformation: {
    lst: prefixFinance + "/loan-information/list",
    update: prefixFinance + "/loan-information/update",
    get: prefixFinance + "/loan-information/get",
    delete: prefixFinance + "/loan-information/delete",
  },
  transactionInformation: {
    lst: prefixFinance + "/transaction-information/list",
    update: prefixFinance + "/transaction-information/update",
    get: prefixFinance + "/transaction-information/get",
    delete: prefixFinance + "/transaction-information/delete",
  },

  application: {
    lst: prefixRebornVn + "/org-app/list",
    lstAll: prefixRebornVn + "/org-app/list/all",
    confirmBill: prefixRebornVn + "/org-app/payment/verify",
    update: prefixRebornVn + "/organization/update",
    detail: prefixRebornVn + "/beauty-salon/get",
  },
};

export const urls = {
  dashboard: "/dashboard",
  notification: "/notification",
  manager_work: "/manager_work",
  //Lĩnh vực BĐS - Đầu mối liên hệ
  contact: "/contact",
  customer: "/customer",
  customer_list: "/customer_list",
  supplier_list: "/supplier",
  customer_sms: "/customer_sms",
  customer_segment: "/customer_segment",
  detail_person: "/detail_person/customerId/:id?/:type",

  //Đối tác
  partner: "/partner",
  detail_partner: "/detail_partner/partnerId/:id?",

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
  // đường dẫn danh sách kho hàng
  warehouse: "/warehouse",
  // sổ kho
  inventory: "/inventory",
  create_inventory: "/create_inventory",
  // đường dẫn sổ kho chi tiết theo kho
  inventory_detail: "/inventory-detail/:id",
  inventory_checking: "/inventory_checking",
  // báo cáo kho
  report_warehouse: "/report_warehouse",
  // đường dẫn bán hàng
  sell: "/sell",
  promotional_program: "/promotional_program",
  promotional_report: "/promotional_report",
  share_promo: "/share_promo",
  share_coupon: "/share_coupon",

  contract: "/contract",
  offer: "/offer",
  create_contract: "/create_contract",
  create_contract_xml: "/create_contract_xml",
  edit_contract: "/edit_contract/:id?",
  edit_contract_xml: "/edit_contract_xml/:id?",
  detail_contract: "/detail_contract/contractId/:id?",
  detail_project: "/detail_project/projectId/:id?",

  // đường dẫn tạo đơn bán
  create_sale_add: "/create_sale_add",
  // đường dẫn danh sách hóa đơn bán hàng
  sale_invoice: "/sale_invoice",
  // đường dẫn quản lý vận chuyển
  shipping: "/shipping",
  // đường dẫn quản lý phí vận chuyển
  shipping_fee_config: "/shipping_fee_config",
  // đường dẫn Thêm đơn vận chuyển
  add_shipping: "/add_shipping",
  // đường dẫn quản lý đơn vị vận chuyển
  shipping_parther: "/shipping_parther",
  // đường dẫn danh sách khách trả hàng
  // customer_pay: "/customer_pay",
  return_invoice: "/return_invoice",
  // bán hàng đa kênh
  multi_channel_sales: "/multi_channel_sales",
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
  finance_management_category_management: "/finance_management/category_management",
  finance_management_debt_transaction: "/finance_management/debt_transaction",
  finance_management_shift_inventory: "/finance_management/shift_inventory",
  payment_control: "/payment_control",
  setting: "/setting",
  viettel_integration: "/viettel_integration",
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
  setting_channels: "/setting_channels", // Landing page: Kênh liên lạc (SMS/Email/Zalo/Tổng đài)
  setting_integrations: "/setting_integrations", // Landing page: Tích hợp & kết nối
  sms_marketting: "/sms_marketting",
  email_marketting: "/email_marketting",
  zalo_marketting: "/zalo_marketting",
  send_email_confirm: "/send_email_confirm",
  voucher_confirm: "/voucher_confirm",
  // Setting
  setting_common: "/setting_common",
  setting_rose: "/setting_rose",
  setting_basis: "/setting_basis",
  setting_org: "/setting_org", // Tổ chức & phân quyền
  setting_payment_method: "/setting_payment_method",
  setting_operate: "/setting_operate",
  setting_timekeeping: "/setting_timekeeping",
  setting_customer: "/setting_customer",
  setting_partner: "/setting_partner",
  setting_contact: "/setting_contact",
  setting_loyalty: "/setting_loyalty",
  loyalty_point_ledger: "/loyalty_point_ledger",
  loyalty_wallet: "/loyalty_wallet",
  loyalty_integration: "/loyalty_integration",
  member_list: "/member_list",
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
  dashboard_shipping: "/dashboard_shipping",
  customer_report: "/customer_report",
  inventory_report: "/inventory_report",
  inventory_report_modern: "/inventory_report_modern",
  marketing_report: "/marketing_report",
  dashboard_loyalty: "/dashboard_loyalty",
  // Chương trình giới thiệu bạn bè (refer-a-friend)
  loyalty_referral: "/loyalty_referral",
  // Gamification — bảng xếp hạng, huy hiệu
  loyalty_leaderboard: "/loyalty_leaderboard",
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
  //chăm sóc khách hàng
  customer_care_page: "/customer_care_page",
  customer_analysis: "/customer_analysis",
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
  destroy_slip: "/destroy_slip",
  // thông tin cá nhân
  setting_account: "/setting_account",
  setting_kpi: "/setting_kpi",
  // cài đặt ứng dụng
  install_app: "/install_app",
  // thử nghiệm với marketing automation (cài đặt)
  marketing_automation_v2: "/marketing_automation_v2",
  marketing_automation: "/marketing_automation",
  marketing_campaign: "/marketing_campaign",
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

  //Quản lý thanh toán
  sales_channel: "/sales_channel",
  payment_mgt: "/payment_mgt",

  //Quản lý nhân viên
  shift_config: "/shift_config",
  shift_management: "/shift_management",
};

export default urls;