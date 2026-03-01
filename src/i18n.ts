import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        common: {
          seeMore: "See more",
        },
        sidebar: {
          dashboard: "Dashboard",

          personal: "Personal",
          // đoạn này là children của personal
          internalMail: "Internal mail",
          document: "Document",
          createKPIFramework: "Create KPIs",
          createKPITask: "Create KPI task",
          kpiManagement: "Manage KPI",
          project: "Project",
          workManagement: "Work Management",
          userTaskManagement: "User task management",
          // Quản lý công việc
          userTaskList: "User Task list",
          job: "Task",
          jobReport: "Task report",
          calendar: "Calendar",

          customer: "Customers",
          student: "Students",
          partner: "Partner",
          teacher: "Teacher",
          // đoạn này là children của customer
          customerProfile: "Customer profile",
          studentProfile: "Student profile",
          partnerProfile: "Partner profile",
          teacherProfile: "Teacher profile",
          contactProfile: "Contact Profile",
          parentProfile: "Parent profile",
          treatmentHistory: "Treatment history",
          customerSegments: "Customer Segmentation",

          quote: "Quote",
          listQuotationsNew: "Danh sách báo giá mới",
          // đoạn này là children của quote
          createQuote: "Create quote",
          listQuotations: "List quotations",
          listFS: "List fs",

          contract: "Contract",
          // đoạn này là children của contract
          createContract: "Create contract",
          createContractXML: "Create contract XML",
          listContract: "List contract",
          listWarranty: "List warranty",
          guaranteeContract: "List of guarantee",
          listWarrantyContract: "List of Warranty Contract",

          marketing: "Marketing",
          // đoạn này là children của marketing
          emailMarketing: "Email Marketing",
          smsMarketing: "SMS Marketing",
          zaloMarketing: "Zalo Marketing",
          marketingAutomation: "Marketing Automation",
          marketingAutomationV2: "Marketing Automation V2",
          campaignMarketing: "Marketing Campaign",

          salesChannel: "Sales channel",
          // đoạn này là children của sales channel
          facebook: "Facebook",
          zalo: "Zalo",

          selling: "Sales",
          opportunity: "Opportunities",
          provideService: "Provide service",
          // đoạn này là children của selling
          createSalesOrder: "Create sales order",
          salesInvoice: "Sales Invoice",
          returnInvoice: "Return Invoice",
          salesCampaign: "Sales Campaign",
          createOppotunity: "Create opportunity",
          opportunityList: "Opportunity List",
          orderRequestList: "Order request list",
          // salesManagement: "Opportunity Management",
          salesManagement: "Take care of the opportunity",
          salesFlow: "Sales Flow",
          invoicesManagement: "Sales Management",

          customerCare: "Customer Care",
          // đoạn này là children của customer care
          customerServiceHotline: "Customer service hotline",
          customerCareEmail: "Customer care email",
          receiveWarranty: "Receive warranty",
          receiveWarrantyProcess: "Receive warranty process",
          receiveTicket: "Receive ticket",
          receiveTicketProcess: "Receive ticket process",
          medicalRecord: "Medical record",
          feedbackEnhancement: "Feedback enhancement",
          customerSurvey: "Customer survey",

          warehouse: "Warehouse",
          // đoạn này là children của warehouse
          createPurchaseOrder: "Create purchase order",
          purchaseInvoice: "Purchase invoice",
          createOutboundDelivery: "Create outbound delivery",
          outboundInvoice: "Outbound invoice",
          soldProducts: "Sold products",
          stockedProducts: "Stocked products",
          warehouseManagement: "Warehouse management",
          inventoryTransferDocument: "Inventory transfer document",
          stockAdjustmentVoucher: "Stock adjustment voucher",
          managementMaterial: "Management material",

          cashbook: "Cash book",
          bpm: "Process Management",
          manageProcesses: "Manage processes",
          manageDefaultProcesses: "Setting default processes",
          business_rule: "Business rule",
          processSimulation: "Process simulation",
          objectManage: "Object Management",
          manage_data_sharing: "Manage data sharing",

          // Thông tin khảo sát
          survey: "Customer survey",
          cxmSurvey: "CXM survey",

          // Quản lý vận hành
          operate: "Operation Management",
          // utilityReading: "Utility Reading",
          electricityIndex: "Electricity Index",
          waterIndex: "Water Index",
          spaceCustomer: "Space",
          managementFee: "Management Fee",
          vehicleRegistration: "Vehicle Registration",
          vehicle: "Vehicle",
          ortherFee: "Orther Fee",

          report: "Report",
          // đoạn này là children của report
          reportRevenue: "Revenue",
          reportCustomer: "Customer",
          reportLogin: "Login",

          settings: "Settings",
          // đoạn này là children của settings
          // pricePackageManagement: "Price package management",
          settingBasis: "Setting basis",
          settingOperate: "Setting operate",
          settingPersonal: "Setting personal",
          settingKPI: "Setting kpi",
          settingCustomer: "Setting customer",
          settingPartner: "Setting partner",
          settingContact: "Setting contact",
          settingSales: "Setting sales",
          settingMarketing: "Setting Marketing",
          settingContract: "Setting contract",
          settingProcess: "Setting process",
          settingQuoteForm: "Setting quote form",
          settingCashbook: "Setting cashbook",
          settingSalesChannel: "Setting sales channel",
          settingWarranty: "Setting warranty",
          settingTicket: "Setting ticket",
          settingSwitchboard: "Setting switchboard",
          settingSMS: "Setting sms",
          settingEmail: "Setting email",
          settingZalo: "Setting zalo",
          settingJob: "Setting job",
          settingProject: "Setting project",
          managerWork: "Manage work",
          settingReport: "Setting report",
          integratedMonitoring: "Integrated monitoring",
          settingCode: "Setting code",
          configBpm: "Config BPM",
          settingDashboard: "Setting report",
          settingApplication: "Setting integrate",
          resourceManagement: "Resource management",
          organizationalManagement: "Organizational management",
          listOfOrganizations: "List of organizations",
          servicePackageManagement: "Service package management",
          renewalList: "Renewal list",
          userAdministration: "User administration",
          fieldManagement: "Field management",
          settingConfiguration: "Configuration settings",
        },
        pageDashboard: {
          title: "Dashboard",
          invoice: "Invoices",
          customer: "Customers",
          actualRevenueReport: "Net revenue report",
          realRevenue: "Net revenue",
          expense: "Expenses",
          profit: "Profit",
          payables: "Debt",
          topServices: "Top services",
          fastRetrieval: "Quick search",
          userManual: "User guide",
        },

        // đoạn là page setting basic
        pageSettingBasis: {
          title: "Setting basis",
          listBranches: "List branches",
          listDepartments: "List departments",
          listRole: "List Role",
          listTeam: "List team",
          listEmployee: "List employee",
          listTreatmentRooms: "List treatment rooms",
          managementStore: "Management store",
        },
        // đoạn là page setting operate
        pageSettingOperate: {
          title: "Setting operate",
          electricityRate: "Electricity rate",
          electricityIndex: "Electricity index",
          electrictiyMeter: "Electricity meter",
          // meterSpace: "Meter space",

          waterRate: "Water rate",
          waterMeter: "Water meter",
          waterIndex: "Water index",
          // meterSpace: "Meter space",

          building: "Building/Floor/Apartment",
          project: "List project",
          managementFeeRate: "Management fee rate",
          managementFee: "Management fee",
          pakingFee: "Parking fee",
          spaceType: "Space type",
        },

        pageSettingPersonal: {
          title: "Setting personal",
        },

        pageSettingKPI: {
          title: "Setting KPI",
          kpiDataSource: "KPI data source",
          kpiMetric: "KPI metric",
          listTemplatesKPI: "List templates KPI",
        },
      },
    },
    vi: {
      translation: {
        common: {
          seeMore: "Xem thêm",
        },
        sidebar: {
          dashboard: "Trang chủ",

          personal: "Cá nhân",
          // đoạn này là children của cá nhân
          internalMail: "Thư nội bộ",
          document: "Tài liệu",
          createKPIFramework: "Tạo bộ KPI",
          createKPITask: "Tạo phiếu giao KPI",
          kpiManagement: "Quản lý KPI",
          project: "Dự án",
          //Quản lý công việc BPM
          userTaskList: "Xử lý hồ sơ",
          workManagement: "Quản lý công việc",
          job: "Công việc",
          jobReport: "Báo cáo công việc",
          calendar: "Lịch",

          customer: "Khách hàng",
          student: "Quản lý hồ sơ học sinh",
          partner: "Đối tác",
          teacher: "Giáo viên",
          // đoạn này là children của khách hàng
          customerProfile: "Hồ sơ khách hàng",
          studentProfile: "Hồ sơ học sinh",
          partnerProfile: "Hồ sơ đối tác",
          teacherProfile: "Hồ sơ giáo viên",
          contactProfile: "Hồ sơ người liên hệ",
          parentProfile: "Hồ sơ phụ huynh",
          treatmentHistory: "Thực hiện dịch vụ",
          customerSegments: "Phân khúc khách hàng",

          quote: "Báo giá",
          // đoạn này là children của báo giá
          createQuote: "Tạo báo giá",
          listQuotations: "Danh sách báo giá",
          listQuotationsNew: "Danh sách báo giá mới",
          listFS: "Danh sách FS",

          contract: "Hợp đồng",
          // đoạn này là children của hợp đồng
          createContract: "Tạo hợp đồng",
          createContractXML: "Tạo hợp đồng XML",
          listContract: "Danh sách hợp đồng",
          listWarranty: "Danh sách bảo hành",
          guaranteeContract: "Danh sách bảo lãnh",
          listWarrantyContract: "Danh sách bảo hành",

          marketing: "Truyền thông",
          // đoạn này là children của marketing
          emailMarketing: "Truyền thông bằng Email",
          smsMarketing: "Truyền thông bằng SMS",
          zaloMarketing: "Truyền thông bằng Zalo",
          marketingAutomation: "Truyền thông theo kịch bản",
          marketingAutomationV2: "Truyền thông theo kịch bản V2",
          campaignMarketing: "Ngân sách truyền thông",

          salesChannel: "Kênh bán",
          // đoạn này là children của kênh bán
          facebook: "Tin nhắn Facebook",
          zalo: "Tin nhắn Zalo",

          selling: "Bán hàng",
          opportunity: "Cơ hội bán hàng",
          provideService: "Thực hiện dịch vụ",
          // đoạn này là children của bán hàng
          createSalesOrder: "Tạo đơn bán hàng",
          salesInvoice: "Hóa đơn bán hàng",
          returnInvoice: "Khách trả hàng",
          salesCampaign: "Quản lý chiến dịch",
          createOppotunity: "Tạo cơ hội",
          opportunityList: "Danh sách cơ hội",
          orderRequestList: "Yêu cầu mua hàng",
          salesManagement: "Chăm sóc cơ hội",
          salesManagementNew: "Chăm sóc cơ hội mới",
          salesFlow: "Quy trình bán hàng",
          invoicesManagement: "Quản lý bán hàng",

          customerCare: "Chăm sóc khách hàng",
          // đoạn này là children của chăm sóc khách hàng
          customerServiceHotline: "Tổng đài CSKH",
          receiveWarranty: "Tiếp nhận bảo hành",
          receiveWarrantyProcess: "Tiếp nhận bảo hành theo quy trình",
          receiveTicket: "Tiếp nhận hỗ trợ",
          receiveTicketProcess: "Tiếp nhận hỗ trợ theo quy trình",
          customerCareEmail: "Email CSKH",
          medicalRecord: "Nhật ký điều trị",
          feedbackEnhancement: "Góp ý cải tiến",
          customerSurvey: "Khảo sát khách hàng",

          // đoạn này là children của đặt hàng
          order: "Mua hàng",
          createOrder: "Tạo đơn đặt hàng",
          orderInvoiceList: "Hóa đơn đặt hàng",
          temporaryOrderList: "Đơn đặt lưu tạm",

          // đoạn này là children của quản lý đơn đặt hàng
          orderTracking: "Theo dõi đặt hàng",
          manageOrder: "Yêu cầu mua hàng",
          productList: "Thống kê sản phẩm",

          warehouse: "Kho hàng",
          // đoạn này là children của kho hàng
          createPurchaseOrder: "Tạo phiếu nhập hàng",
          purchaseInvoice: "Hóa đơn nhập hàng",
          createOutboundDelivery: "Tạo phiếu xuất kho",
          outboundInvoice: "Hóa đơn xuất kho",
          soldProducts: "Sản phẩm đã bán",
          stockedProducts: "Sản phẩm tồn kho",
          warehouseManagement: "Quản lý kho hàng",
          inventoryTransferDocument: "Phiếu điều chuyển kho",
          stockAdjustmentVoucher: "Phiếu điều chỉnh kho",
          managementMaterial: "Quản lý nguyên vật liệu",

          cashbook: "Tài chính",
          bpm: "Quản lý quy trình",
          manageProcesses: "Quản lý quy trình",
          manageDefaultProcesses: "Cài đặt quy trình mặc định",
          business_rule: "Luật nghiệp vụ",
          processSimulation: "Mô phỏng quy trình",
          objectManage: "Quản lý hồ sơ",
          manage_data_sharing: "Chia sẻ dữ liệu",
          cxmSurvey: "Chiến dịch khảo sát",

          // Quản lý vận hành
          operate: "Quản lý vận hành",
          // utilityReading: "Chỉ số điện/nước",
          electricityIndex: "Chỉ số điện",
          waterIndex: "Chỉ số nước",
          spaceCustomer: "Căn hộ/văn phòng",
          managementFee: "Phí quản lý",
          vehicleRegistration: "Phí đậu xe",
          vehicle: "Đăng kí phương tiện",
          ortherFee: "Chi phí khác",

          report: "Báo cáo",
          // đoạn này là children của báo cáo
          reportRevenue: "Doanh thu",
          reportCustomer: "Khách hàng",
          reportLogin: "Đăng nhập",

          settings: "Cài đặt",
          // đoạn này là children của cài đặt
          // pricePackageManagement: "Quản lý gói giá",
          settingBasis: "Cài đặt cơ sở",
          settingOperate: "Cài đặt vận hành",
          settingPersonal: "Cài đặt cá nhân",
          settingKPI: "Cài đặt KPI",
          settingCustomer: "Cài đặt khách hàng",
          settingPartner: "Cài đặt đối tác",
          settingContact: "Cài đặt người liên hệ",
          settingSales: "Cài đặt bán hàng",
          settingMarketing: "Cài đặt truyền thông",
          settingContract: "Cài đặt hợp đồng",
          settingEform: "Cài đặt biểu mẫu",
          settingProcess: "Cài đặt quy trình",
          settingQuoteForm: "Cài đặt mẫu báo giá",
          settingCashbook: "Cài đặt tài chính",
          settingSalesChannel: "Cài đặt kênh bán",
          settingWarranty: "Cài đặt bảo hành",
          settingTicket: "Cài đặt hỗ trợ",
          settingSwitchboard: "Cài đặt tổng đài",
          settingSMS: "Cài đặt SMS",
          settingEmail: "Cài đặt Email",
          settingZalo: "Cài đặt Zalo",
          settingJob: "Cài đặt công việc",
          settingProject: "Cài đặt dự án",
          managerWork: "Quản lý công việc",
          settingReport: "Cài đặt báo cáo",
          integratedMonitoring: "Giám sát tích hợp",
          settingCode: "Cài đặt mã",
          configBpm: "Cấu hình quy trình",
          settingDashboard: "Cài đặt báo cáo",
          settingApplication: "Cài đặt tích hợp",
          resourceManagement: "Quản trị tài nguyên",
          organizationalManagement: "Quản lý đại lý",
          listOfOrganizations: "Danh sách tổ chức",
          servicePackageManagement: "Quản lý gói dịch vụ",
          renewalList: "Danh sách gia hạn",
          userAdministration: "Quản trị người dùng",
          fieldManagement: "Quản lý lĩnh vực",
          settingConfiguration: "Cài đặt cấu hình chung",
        },
        pageDashboard: {
          title: "Trang chủ",
          invoice: "Hóa đơn",
          customer: "Khách hàng",
          actualRevenueReport: "Báo cáo doanh thu thực",
          realRevenue: "Doanh thu thực",
          expense: "Chi phí",
          profit: "Lợi nhuận",
          payables: "Công nợ",
          topServices: "Top dịch vụ",
          fastRetrieval: "Truy xuất nhanh",
          userManual: "Hướng dẫn sử dụng",
        },

        // đoạn là page cài đặt cơ sở
        pageSettingBasis: {
          title: "Cài đặt cơ sở",
          listBranches: "Danh sách chi nhánh",
          listDepartments: "Danh sách phòng ban",
          listRole: "Danh sách nhóm quyền",
          listEmployee: "Danh sách nhân viên",
          listTeam: "Danh sách nhóm nhân viên",
          listTreatmentRooms: "Danh sách phòng điều trị",
          managementStore: "Quản lý cửa hàng",
        },
        // đoạn này là page cài đặt vận hành
        pageSettingOperate: {
          title: "Cài đặt vận hành",

          electricityRate: "Đơn giá điện",
          electricityIndex: "Chỉ số điện",
          electrictiyMeter: "Danh mục công tơ điện",
          // meterSpace: "Cài đặt đồng hồ",

          waterRate: "Đơn giá nước",
          waterIndex: "Chỉ số nước",
          waterMeter: "Danh mục công tơ nước",
          // meterSpace: "Meter space",

          building: "Tòa nhà/Tầng/Căn hộ",
          project: "Danh sách dự án",
          managementFeeRate: "Biểu giá phí quản lý",
          managementFee: "Biểu phí kết xuất hàng tháng",
          pakingFee: "Biểu phí đỗ xe",
          spaceType: "Loại căn hộ",
        },

        pageSettingPersonal: {
          title: "Cài đặt cá nhân",
        },

        pageSettingKPI: {
          title: "Cài đặt KPI",
          kpiDataSource: "Nguồn cấp dữ liệu KPI",
          kpiMetric: "Chỉ tiêu KPI",
          listTemplatesKPI: "Danh sách mẫu KPI",
        },
      },
    },
  },
  lng: "vi",
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
