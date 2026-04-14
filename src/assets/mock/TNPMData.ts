// ============================================================
// TNPM CRM – MOCK DATA
// Dữ liệu mẫu cho toàn bộ phân hệ BĐS TNPM
// ============================================================

export const MOCK_PORTFOLIOS = [
  { id: 1, name: "Portfolio Hà Nội", code: "HN-PF01", ownerId: 1, projectCount: 5, totalArea: 125000, status: "active", createdAt: "2024-01-15" },
  { id: 2, name: "Portfolio TP.HCM", code: "HCM-PF01", ownerId: 2, projectCount: 3, totalArea: 85000, status: "active", createdAt: "2024-02-20" },
  { id: 3, name: "Portfolio Đà Nẵng", code: "DN-PF01", ownerId: 3, projectCount: 2, totalArea: 42000, status: "active", createdAt: "2024-03-10" },
];

export const MOCK_PROJECTS = [
  {
    id: 1, portfolioId: 1, code: "VCITY-001", name: "Vinhomes City Park", type: "apartment",
    typeName: "Chung cư", location: "Bắc Từ Liêm, Hà Nội", totalUnits: 480, occupiedUnits: 412,
    totalArea: 52000, status: "active", investorName: "Vinhomes Corp", managerName: "Nguyễn Văn An",
    phone: "0901234567", startDate: "2022-06-01", createdAt: "2022-05-15",
    occupancyRate: 85.8,
  },
  {
    id: 2, portfolioId: 1, code: "GOLD-001", name: "Goldmark City Office Tower A", type: "office",
    typeName: "Văn phòng", location: "Bắc Từ Liêm, Hà Nội", totalUnits: 120, occupiedUnits: 98,
    totalArea: 28000, status: "active", investorName: "BRG Group", managerName: "Trần Thị Bình",
    phone: "0902345678", startDate: "2023-01-01", createdAt: "2022-12-10",
    occupancyRate: 81.7,
  },
  {
    id: 3, portfolioId: 1, code: "VINH-IPC", name: "Khu Công Nghiệp Vinh Phúc", type: "industrial",
    typeName: "Khu công nghiệp", location: "Vĩnh Phúc", totalUnits: 85, occupiedUnits: 72,
    totalArea: 850000, status: "active", investorName: "VPH Investment", managerName: "Lê Minh Tú",
    phone: "0903456789", startDate: "2021-09-01", createdAt: "2021-08-20",
    occupancyRate: 84.7,
  },
  {
    id: 4, portfolioId: 2, code: "AEON-001", name: "AEON Mall Long Biên", type: "retail",
    typeName: "Trung tâm thương mại", location: "Long Biên, Hà Nội", totalUnits: 320, occupiedUnits: 288,
    totalArea: 72000, status: "active", investorName: "AEON Vietnam", managerName: "Phạm Thu Hà",
    phone: "0904567890", startDate: "2020-10-01", createdAt: "2020-09-15",
    occupancyRate: 90.0,
  },
  {
    id: 5, portfolioId: 2, code: "ECOPARK-001", name: "Ecopark Villa Zone", type: "villa",
    typeName: "Nhà thấp tầng", location: "Văn Giang, Hưng Yên", totalUnits: 156, occupiedUnits: 140,
    totalArea: 95000, status: "active", investorName: "Ecopark Corp", managerName: "Hoàng Đức Long",
    phone: "0905678901", startDate: "2023-03-01", createdAt: "2023-02-10",
    occupancyRate: 89.7,
  },
  {
    id: 6, portfolioId: 3, code: "HC-BADINH", name: "Khu Liên Cơ Quan HC Ba Đình", type: "government",
    typeName: "Hành chính công", location: "Ba Đình, Hà Nội", totalUnits: 12, occupiedUnits: 12,
    totalArea: 18000, status: "active", investorName: "UBND TP Hà Nội", managerName: "Trần Quản Lý DA",
    phone: "0243123456", startDate: "2023-01-01", createdAt: "2022-12-01",
    occupancyRate: 100,
  },
];

export const MOCK_UNITS = [
  // Chung cư VCITY-001
  { id: 1, projectId: 1, code: "A-1201", floor: 12, block: "A", area: 68.5, bedrooms: 2, bathrooms: 2, status: "occupied", unitType: "apartment", rentPrice: 15000000 },
  { id: 2, projectId: 1, code: "A-1202", floor: 12, block: "A", area: 92.0, bedrooms: 3, bathrooms: 2, status: "occupied", unitType: "apartment", rentPrice: 20000000 },
  { id: 3, projectId: 1, code: "B-0805", floor: 8, block: "B", area: 55.0, bedrooms: 1, bathrooms: 1, status: "available", unitType: "apartment", rentPrice: 10000000 },
  { id: 4, projectId: 1, code: "C-2301", floor: 23, block: "C", area: 120.0, bedrooms: 3, bathrooms: 3, status: "occupied", unitType: "apartment", rentPrice: 28000000 },
  // Văn phòng GOLD-001
  { id: 5, projectId: 2, code: "TA-0201", floor: 2, block: "Tower A", area: 250.0, bedrooms: 0, bathrooms: 2, status: "occupied", unitType: "office", rentPrice: 50000000 },
  { id: 6, projectId: 2, code: "TA-0501", floor: 5, block: "Tower A", area: 380.0, bedrooms: 0, bathrooms: 3, status: "occupied", unitType: "office", rentPrice: 76000000 },
  { id: 7, projectId: 2, code: "TA-0801", floor: 8, block: "Tower A", area: 500.0, bedrooms: 0, bathrooms: 4, status: "available", unitType: "office", rentPrice: 100000000 },
  // KCN
  { id: 8, projectId: 3, code: "F1-001", floor: 1, block: "F1", area: 5000, bedrooms: 0, bathrooms: 4, status: "occupied", unitType: "factory", rentPrice: 75000000 },
  { id: 9, projectId: 3, code: "F2-001", floor: 1, block: "F2", area: 8000, bedrooms: 0, bathrooms: 6, status: "available", unitType: "factory", rentPrice: 120000000 },
  // TTTM
  { id: 10, projectId: 4, code: "AEON-G001", floor: 0, block: "Ground", area: 120, bedrooms: 0, bathrooms: 1, status: "occupied", unitType: "retail_shop", rentPrice: 80000000 },
  { id: 11, projectId: 4, code: "AEON-G002", floor: 0, block: "Ground", area: 85, bedrooms: 0, bathrooms: 1, status: "occupied", unitType: "retail_shop", rentPrice: 55000000 },
  { id: 12, projectId: 4, code: "AEON-F1-001", floor: 1, block: "Floor 1", area: 200, bedrooms: 0, bathrooms: 2, status: "available", unitType: "retail_shop", rentPrice: 60000000 },
];

export const MOCK_CUSTOMERS = [
  { id: 1, code: "KH-001", type: "B2B", name: "Công ty TNHH ABC Technology", shortName: "ABC Tech", taxCode: "0123456789", address: "Cầu Giấy, Hà Nội", contactName: "Nguyễn Minh Tú", phone: "0901111111", email: "tu.nguyen@abctech.vn", status: "active", projectId: 2, unitId: 5 },
  { id: 2, code: "KH-002", type: "B2C", name: "Trần Văn Hùng", shortName: "Trần Văn Hùng", taxCode: null, address: "Đống Đa, Hà Nội", contactName: "Trần Văn Hùng", phone: "0902222222", email: "hung.tran@gmail.com", status: "active", projectId: 1, unitId: 1 },
  { id: 3, code: "KH-003", type: "B2B", name: "Samsung Electronics VN", shortName: "Samsung VN", taxCode: "0234567890", address: "Vĩnh Phúc", contactName: "Kim Jae Won", phone: "0903333333", email: "jaewon.kim@samsung.com", status: "active", projectId: 3, unitId: 8 },
  { id: 4, code: "KH-004", type: "B2B", name: "Công ty CP Thời Trang Việt", shortName: "Thời Trang Việt", taxCode: "0345678901", address: "Long Biên, Hà Nội", contactName: "Lê Thị Mai", phone: "0904444444", email: "mai.le@thoitrangviet.vn", status: "active", projectId: 4, unitId: 10 },
  { id: 5, code: "KH-005", type: "B2B", name: "Đại diện Khu Liên cơ quan HC", shortName: "KC Hành Chính", taxCode: "0456789012", address: "Ba Đình, Hà Nội", contactName: "Phạm Quốc Tuấn", phone: "0905555555", email: "tuan.pham@gov.vn", status: "active", projectId: null, unitId: null },
  { id: 6, code: "KH-006", type: "B2C", name: "Nguyễn Thị Hoa", shortName: "Nguyễn Thị Hoa", taxCode: null, address: "Văn Giang, Hưng Yên", contactName: "Nguyễn Thị Hoa", phone: "0906666666", email: "hoa.nguyen@gmail.com", status: "active", projectId: 5, unitId: null },
];

export const MOCK_LEASE_CONTRACTS = [
  {
    id: 1, code: "HD-THUE-001", customerId: 2, customerName: "Trần Văn Hùng", projectId: 1, unitId: 1, unitCode: "A-1201",
    contractType: "residential", startDate: "2024-01-01", endDate: "2025-12-31", rentAmount: 15000000,
    depositAmount: 30000000, paymentTerms: "monthly", reviewClause: 5, escalationRate: 0,
    status: "active", signedDate: "2023-12-20", note: "", attachments: [],
    // ── Deposit tracking
    depositPaid: true, depositPaidAt: "2023-12-22", depositPaidMethod: "bank_transfer",
    depositRefundable: true, depositRefundedAt: null, depositHeldBy: "Quỹ TK MSB",
    // ── Escalation (không tăng giá cho chung cư này)
    escalationSchedule: [],
    // ── Auto-renew
    autoRenew: true, renewalNoticeDays: 60, renewalStatus: "none", renewalNotifiedAt: null,
    // ── Extras
    camFee: 0, marketingLevy: 0, overtimeRate: 0,
  },
  {
    id: 2, code: "HD-THUE-002", customerId: 1, customerName: "Công ty TNHH ABC Technology", projectId: 2, unitId: 5, unitCode: "TA-0201",
    contractType: "office", startDate: "2024-03-01", endDate: "2027-02-28", rentAmount: 50000000,
    depositAmount: 150000000, paymentTerms: "quarterly", reviewClause: 3, escalationRate: 8,
    status: "active", signedDate: "2024-02-15", note: "Review giá mỗi 3 năm +8%. Điều hòa ngoài giờ 200k/giờ/tầng.", attachments: [],
    depositPaid: true, depositPaidAt: "2024-02-20", depositPaidMethod: "bank_transfer",
    depositRefundable: true, depositRefundedAt: null, depositHeldBy: "Quỹ TK MSB",
    escalationSchedule: [
      { period: 1, effectiveDate: "2024-03-01", rentAmount: 50000000, rate: 0, status: "applied", note: "Giá gốc ký HĐ" },
      { period: 2, effectiveDate: "2027-03-01", rentAmount: 54000000, rate: 8, status: "scheduled", note: "Tăng 8% sau 3 năm theo review clause" },
    ],
    autoRenew: true, renewalNoticeDays: 90, renewalStatus: "none", renewalNotifiedAt: null,
    camFee: 0, marketingLevy: 0, overtimeRate: 200000,
  },
  {
    id: 3, code: "HD-THUE-003", customerId: 3, customerName: "Samsung Electronics VN", projectId: 3, unitId: 8, unitCode: "F1-001",
    contractType: "industrial", startDate: "2023-06-01", endDate: "2028-05-31", rentAmount: 75000000,
    depositAmount: 450000000, paymentTerms: "quarterly", reviewClause: 5, escalationRate: 5,
    status: "active", signedDate: "2023-05-20", note: "Hợp đồng dài hạn 5 năm, CPI-linked escalation mỗi năm.", attachments: [],
    depositPaid: true, depositPaidAt: "2023-05-25", depositPaidMethod: "bank_transfer",
    depositRefundable: true, depositRefundedAt: null, depositHeldBy: "Quỹ TK MSB",
    escalationSchedule: [
      { period: 1, effectiveDate: "2023-06-01", rentAmount: 75000000, rate: 0, status: "applied", note: "Giá gốc" },
      { period: 2, effectiveDate: "2024-06-01", rentAmount: 78750000, rate: 5, status: "scheduled", note: "Tăng 5% năm 2" },
      { period: 3, effectiveDate: "2025-06-01", rentAmount: 82687500, rate: 5, status: "scheduled", note: "Tăng 5% năm 3" },
      { period: 4, effectiveDate: "2026-06-01", rentAmount: 86821875, rate: 5, status: "scheduled", note: "Tăng 5% năm 4" },
      { period: 5, effectiveDate: "2027-06-01", rentAmount: 91162969, rate: 5, status: "scheduled", note: "Tăng 5% năm 5" },
    ],
    autoRenew: true, renewalNoticeDays: 120, renewalStatus: "none", renewalNotifiedAt: null,
    camFee: 0, marketingLevy: 0, overtimeRate: 0,
  },
  {
    id: 4, code: "HD-THUE-004", customerId: 4, customerName: "Thời Trang Việt", projectId: 4, unitId: 10, unitCode: "AEON-G001",
    contractType: "retail", startDate: "2024-02-01", endDate: "2025-01-31", rentAmount: 80000000,
    depositAmount: 160000000, paymentTerms: "monthly", reviewClause: 1, escalationRate: 0,
    status: "active", signedDate: "2024-01-20", note: "Phí doanh thu: 8% turnover. CAM 15tr/tháng. Marketing levy 3%.", attachments: [],
    turnoverRentRate: 8,
    depositPaid: true, depositPaidAt: "2024-01-25", depositPaidMethod: "bank_transfer",
    depositRefundable: true, depositRefundedAt: null, depositHeldBy: "Quỹ TK MSB",
    escalationSchedule: [
      { period: 1, effectiveDate: "2024-02-01", rentAmount: 80000000, rate: 0, status: "applied", note: "Giá gốc 1 năm đầu" },
    ],
    autoRenew: false, renewalNoticeDays: 60, renewalStatus: "pending", renewalNotifiedAt: "2024-12-01",
    camFee: 15000000, marketingLevy: 3, overtimeRate: 0,
  },
];

export const MOCK_SERVICE_CONTRACTS = [
  { id: 1, code: "HD-DV-001", customerId: 2, projectId: 1, unitId: 1, unitCode: "A-1201", services: ["management_fee", "parking", "electricity", "water"], startDate: "2024-01-01", endDate: "2025-12-31", managementFee: 10000, parkingSlots: 1, parkingFee: 1200000, status: "active" },
  { id: 2, code: "HD-DV-002", customerId: 1, projectId: 2, unitId: 5, services: ["management_fee", "electricity", "water", "cleaning", "security"], startDate: "2024-03-01", endDate: "2027-02-28", managementFee: 8000, status: "active" },
  { id: 3, code: "HD-DV-003", customerId: 4, projectId: 4, unitId: 10, services: ["cam_fee", "marketing_levy", "utilities"], startDate: "2024-02-01", endDate: "2025-01-31", managementFee: 6000, camFee: 15000000, marketingLevy: 3, status: "active" },
];

export const MOCK_INVOICES = [
  { id: 1, code: "HD-2024-001", contractId: 1, customerId: 2, customerName: "Trần Văn Hùng", projectId: 1, period: "2024-03", dueDate: "2024-03-10", totalAmount: 26200000, paidAmount: 26200000, status: "paid", paidAt: "2024-03-08", items: [{ name: "Phí thuê", amount: 15000000 }, { name: "Phí quản lý", amount: 680000 }, { name: "Điện", amount: 8500000 }, { name: "Nước", amount: 520000 }, { name: "Gửi xe", amount: 1200000 }, { name: "Phí khác", amount: 300000 }] },
  { id: 2, code: "HD-2024-002", contractId: 2, customerId: 1, customerName: "ABC Technology", projectId: 2, period: "2024-Q1", dueDate: "2024-04-05", totalAmount: 165000000, paidAmount: 0, status: "overdue", paidAt: null, items: [{ name: "Phí thuê", amount: 150000000 }, { name: "Phí quản lý", amount: 10000000 }, { name: "Điện", amount: 5000000 }] },
  { id: 3, code: "HD-2024-003", contractId: 3, customerId: 3, customerName: "Samsung VN", projectId: 3, period: "2024-Q1", dueDate: "2024-04-01", totalAmount: 225000000, paidAmount: 225000000, status: "paid", paidAt: "2024-03-28", items: [{ name: "Phí thuê", amount: 225000000 }] },
  { id: 4, code: "HD-2024-004", contractId: 4, customerId: 4, customerName: "Thời Trang Việt", projectId: 4, period: "2024-03", dueDate: "2024-03-15", totalAmount: 105000000, paidAmount: 0, status: "pending", paidAt: null, items: [{ name: "Phí thuê cơ bản", amount: 80000000 }, { name: "CAM charges", amount: 15000000 }, { name: "Marketing levy", amount: 10000000 }] },
  { id: 5, code: "HD-2024-005", contractId: 1, customerId: 2, customerName: "Trần Văn Hùng", projectId: 1, period: "2024-04", dueDate: "2024-04-10", totalAmount: 26200000, paidAmount: 26200000, status: "paid", paidAt: "2024-04-09", items: [{ name: "Phí thuê", amount: 15000000 }, { name: "Phí quản lý", amount: 680000 }, { name: "Điện", amount: 8700000 }, { name: "Nước", amount: 520000 }, { name: "Gửi xe", amount: 1200000 }, { name: "Phí khác", amount: 100000 }] },
];

export const MOCK_VENDORS = [
  { id: 1, code: "NCC-001", name: "Công ty TNHH Bảo Trì Kỹ Thuật Việt", shortName: "KT Việt", taxCode: "0111222333", serviceTypes: ["maintenance", "elevator", "mep"], contactName: "Hoàng Văn Kỹ", phone: "0911111111", email: "ky.hoang@ktviet.vn", status: "active", rating: 4.5, contractCount: 8, blacklisted: false },
  { id: 2, code: "NCC-002", name: "Công ty Vệ Sinh Sạch Đẹp", shortName: "Sạch Đẹp", taxCode: "0222333444", serviceTypes: ["cleaning", "pest_control"], contactName: "Nguyễn Thị Sạch", phone: "0922222222", email: "sach.nguyen@sachdep.vn", status: "active", rating: 4.2, contractCount: 12, blacklisted: false },
  { id: 3, code: "NCC-003", name: "Cty CP An Ninh Bảo Vệ 24/7", shortName: "BV 24/7", taxCode: "0333444555", serviceTypes: ["security"], contactName: "Phạm An Toàn", phone: "0933333333", email: "antoan.pham@bv247.vn", status: "active", rating: 4.0, contractCount: 6, blacklisted: false },
  { id: 4, code: "NCC-004", name: "Otis Elevator Vietnam", shortName: "Otis VN", taxCode: "0444555666", serviceTypes: ["elevator", "escalator"], contactName: "James Lee", phone: "0944444444", email: "james.lee@otis.com", status: "active", rating: 4.8, contractCount: 15, blacklisted: false },
  { id: 5, code: "NCC-005", name: "Công ty PCCC Hà Nội", shortName: "PCCC HN", taxCode: "0555666777", serviceTypes: ["fire_protection", "fire_inspection"], contactName: "Trần Cứu Hỏa", phone: "0955555555", email: "cuuhoa.tran@pccchano.vn", status: "suspended", rating: 3.2, contractCount: 3, blacklisted: false },
];

export const MOCK_VENDOR_CONTRACTS = [
  { id: 1, vendorId: 1, vendorName: "KT Việt", projectId: 1, projectName: "Vinhomes City Park", serviceType: "maintenance", value: 240000000, startDate: "2024-01-01", endDate: "2024-12-31", slaDays: 2, status: "active", paymentTerms: "monthly" },
  { id: 2, vendorId: 2, vendorName: "Sạch Đẹp", projectId: 1, projectName: "Vinhomes City Park", serviceType: "cleaning", value: 180000000, startDate: "2024-01-01", endDate: "2024-12-31", slaDays: 1, status: "active", paymentTerms: "monthly" },
  { id: 3, vendorId: 3, vendorName: "BV 24/7", projectId: 2, projectName: "Goldmark Office", serviceType: "security", value: 360000000, startDate: "2024-01-01", endDate: "2024-12-31", slaDays: 0, status: "active", paymentTerms: "monthly" },
  { id: 4, vendorId: 4, vendorName: "Otis VN", projectId: 2, projectName: "Goldmark Office", serviceType: "elevator", value: 120000000, startDate: "2024-01-01", endDate: "2024-12-31", slaDays: 4, status: "active", paymentTerms: "quarterly" },
];

export const MOCK_VENDOR_INVOICES = [
  { id: 1, code: "NVAT-2024-001", vendorId: 1, vendorName: "KT Việt", vendorContractId: 1, projectId: 1, amount: 20000000, period: "2024-03", submittedAt: "2024-03-31", approvalStatus: "approved", paidAt: "2024-04-05", matchPO: true, matchAcceptance: true },
  { id: 2, code: "NVAT-2024-002", vendorId: 2, vendorName: "Sạch Đẹp", vendorContractId: 2, projectId: 1, amount: 15000000, period: "2024-03", submittedAt: "2024-03-31", approvalStatus: "pending", paidAt: null, matchPO: true, matchAcceptance: false },
  { id: 3, code: "NVAT-2024-003", vendorId: 3, vendorName: "BV 24/7", vendorContractId: 3, projectId: 2, amount: 30000000, period: "2024-03", submittedAt: "2024-03-30", approvalStatus: "approved", paidAt: "2024-04-03", matchPO: true, matchAcceptance: true },
];

export const MOCK_SERVICE_REQUESTS = [
  { id: 1, code: "SR-2024-001", projectId: 1, projectName: "Vinhomes City Park", customerId: 2, customerName: "Trần Văn Hùng", unitCode: "A-1201", category: "maintenance", priority: "high", title: "Rò rỉ nước toilet tầng 12", description: "Bồn rửa mặt phòng 12 bị rò rỉ, nước tràn sàn nhà vệ sinh.", status: "in_progress", assignedVendorId: 1, assignedVendorName: "KT Việt", assignedEmployeeName: "Hoàng Kỹ Thuật", createdAt: "2024-04-01 09:15:00", dueAt: "2024-04-02 09:15:00", completedAt: null },
  { id: 2, code: "SR-2024-002", projectId: 2, projectName: "Goldmark Office", customerId: 1, customerName: "ABC Technology", unitCode: "TA-0201", category: "electrical", priority: "urgent", title: "Mất điện phòng server", description: "Phòng chứa máy chủ tầng 2 bị mất điện đột ngột, không khởi động được CB.", status: "resolved", assignedVendorId: 1, assignedVendorName: "KT Việt", assignedEmployeeName: "Điện Kỹ Thuật", createdAt: "2024-04-02 14:30:00", dueAt: "2024-04-02 18:30:00", completedAt: "2024-04-02 16:45:00" },
  { id: 3, code: "SR-2024-003", projectId: 1, projectName: "Vinhomes City Park", customerId: 2, customerName: "Nguyễn Thị Hoa", unitCode: "B-0805", category: "elevator", priority: "medium", title: "Thang máy block B kêu cọ cọ", description: "Thang máy Block B khi di chuyển phát ra tiếng kêu bất thường.", status: "pending", assignedVendorId: 4, assignedVendorName: "Otis VN", assignedEmployeeName: null, createdAt: "2024-04-03 10:00:00", dueAt: "2024-04-05 10:00:00", completedAt: null },
  { id: 4, code: "SR-2024-004", projectId: 3, projectName: "KCN Vinh Phúc", customerId: 3, customerName: "Samsung VN", unitCode: "F1-001", category: "security", priority: "high", title: "Cổng barrier tự động hỏng", description: "Barrier cổng vào nhà máy không đóng mở được, xe ra vào khó khăn.", status: "pending", assignedVendorId: 3, assignedVendorName: "BV 24/7", assignedEmployeeName: null, createdAt: "2024-04-03 08:00:00", dueAt: "2024-04-04 08:00:00", completedAt: null },
];

export const MOCK_MAINTENANCE_PLANS = [
  { id: 1, code: "MP-2024-001", projectId: 1, projectName: "Vinhomes City Park", category: "elevator", title: "Bảo trì định kỳ thang máy Q2/2024", vendorId: 4, vendorName: "Otis VN", plannedDate: "2024-04-15", estimatedCost: 25000000, status: "scheduled", frequency: "quarterly" },
  { id: 2, code: "MP-2024-002", projectId: 1, projectName: "Vinhomes City Park", category: "fire_protection", title: "Kiểm tra hệ thống PCCC Q2/2024", vendorId: 5, vendorName: "PCCC HN", plannedDate: "2024-04-20", estimatedCost: 15000000, status: "scheduled", frequency: "semi-annual" },
  { id: 3, code: "MP-2024-003", projectId: 2, projectName: "Goldmark Office", category: "mep", title: "Bảo dưỡng hệ thống điện/nước/lạnh Q2", vendorId: 1, vendorName: "KT Việt", plannedDate: "2024-04-18", estimatedCost: 35000000, status: "in_progress", frequency: "quarterly" },
  { id: 4, code: "MP-2024-004", projectId: 3, projectName: "KCN Vinh Phúc", category: "electrical", title: "Kiểm tra tổng hệ thống điện nhà máy", vendorId: 1, vendorName: "KT Việt", plannedDate: "2024-05-05", estimatedCost: 50000000, status: "scheduled", frequency: "annual" },
];

export const MOCK_TURNOVER_REPORTS = [
  { id: 1, contractId: 4, customerId: 4, customerName: "Thời Trang Việt", unitCode: "AEON-G001", period: "2024-02", reportedRevenue: 650000000, calculatedFee: 52000000, status: "submitted", submittedAt: "2024-03-05", verifiedAt: "2024-03-08", note: "" },
  { id: 2, contractId: 4, customerId: 4, customerName: "Thời Trang Việt", unitCode: "AEON-G001", period: "2024-03", reportedRevenue: 720000000, calculatedFee: 57600000, status: "pending", submittedAt: null, verifiedAt: null, note: "" },
];

export const MOCK_PAYMENTS = [
  { id: 1, invoiceId: 1, code: "TT-2024-001", amount: 26200000, method: "bank_transfer", channel: "MSB Pay", txnRef: "MSB20240308001", paidAt: "2024-03-08 11:30:00", note: "Chuyển khoản MSB" },
  { id: 2, invoiceId: 3, code: "TT-2024-003", amount: 225000000, method: "bank_transfer", channel: "Vietcombank", txnRef: "VCB20240328001", paidAt: "2024-03-28 09:15:00", note: "" },
  { id: 3, invoiceId: 5, code: "TT-2024-005", amount: 26200000, method: "bank_transfer", channel: "MSB Pay", txnRef: "MSB20240409001", paidAt: "2024-04-09 14:20:00", note: "" },
];

// ─── DASHBOARD STATS ───────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  totalProjects: 5,
  totalUnits: 1161,
  occupiedUnits: 1010,
  occupancyRate: 87.0,
  totalRevenue_thisMonth: 680000000,
  totalRevenue_lastMonth: 645000000,
  revenueGrowth: 5.4,
  overdueInvoices: 2,
  overdueAmount: 270000000,
  pendingSR: 3,
  urgentSR: 1,
  vendorInvoicesPending: 1,
  maintenancePlanned: 4,
  recentPayments: 3,
};

export const MOCK_REVENUE_CHART = [
  { month: "T10/2023", revenue: 580000000, target: 600000000 },
  { month: "T11/2023", revenue: 612000000, target: 620000000 },
  { month: "T12/2023", revenue: 698000000, target: 670000000 },
  { month: "T01/2024", revenue: 620000000, target: 650000000 },
  { month: "T02/2024", revenue: 645000000, target: 655000000 },
  { month: "T03/2024", revenue: 680000000, target: 660000000 },
];

export const MOCK_SR_CHART = [
  { week: "T1/W1", total: 12, resolved: 11, pending: 1 },
  { week: "T1/W2", total: 15, resolved: 14, pending: 1 },
  { week: "T2/W1", total: 8, resolved: 8, pending: 0 },
  { week: "T2/W2", total: 18, resolved: 15, pending: 3 },
  { week: "T3/W1", total: 22, resolved: 19, pending: 3 },
  { week: "T3/W2", total: 14, resolved: 12, pending: 2 },
];

// ─── CONSTANTS / OPTIONS ────────────────────────────────────────────────────
export const PROJECT_TYPE_OPTIONS = [
  { value: "apartment", label: "Chung cư / Khu dân cư" },
  { value: "office", label: "Văn phòng cho thuê" },
  { value: "industrial", label: "Khu công nghiệp" },
  { value: "retail", label: "Trung tâm thương mại" },
  { value: "villa", label: "Nhà ở thấp tầng (Villa)" },
  { value: "government", label: "Khu liên cơ quan HC" },
  { value: "service", label: "Dịch vụ tiện ích đơn lẻ" },
];

export const SERVICE_REQUEST_CATEGORIES = [
  { value: "maintenance", label: "Bảo trì kỹ thuật" },
  { value: "electrical", label: "Điện" },
  { value: "plumbing", label: "Nước / Ống nước" },
  { value: "elevator", label: "Thang máy" },
  { value: "fire_protection", label: "PCCC" },
  { value: "security", label: "An ninh" },
  { value: "cleaning", label: "Vệ sinh" },
  { value: "air_conditioning", label: "Điều hòa" },
  { value: "pest_control", label: "Kiểm soát côn trùng" },
  { value: "other", label: "Khác" },
];

export const VENDOR_SERVICE_TYPES = [
  { value: "maintenance", label: "Bảo trì tổng hợp" },
  { value: "cleaning", label: "Vệ sinh" },
  { value: "security", label: "Bảo vệ / An ninh" },
  { value: "elevator", label: "Thang máy" },
  { value: "fire_protection", label: "PCCC" },
  { value: "mep", label: "Cơ điện lạnh (MEP)" },
  { value: "pest_control", label: "Diệt côn trùng" },
  { value: "landscaping", label: "Cây xanh / Cảnh quan" },
  { value: "electrical", label: "Điện" },
  { value: "plumbing", label: "Cấp thoát nước" },
];

export const STATUS_LABELS: Record<string, string> = {
  active: "Đang hoạt động",
  inactive: "Ngừng hoạt động",
  pending: "Chờ xử lý",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
  closed: "Đã đóng",
  paid: "Đã thanh toán",
  overdue: "Quá hạn",
  scheduled: "Đã lên lịch",
  cancelled: "Đã hủy",
  submitted: "Đã nộp",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  suspended: "Tạm dừng",
  available: "Còn trống",
  occupied: "Đang thuê",
};

export const STATUS_COLORS: Record<string, string> = {
  active: "#52c41a", inactive: "#d9d9d9", pending: "#faad14",
  in_progress: "#1890ff", resolved: "#52c41a", closed: "#8c8c8c",
  paid: "#52c41a", overdue: "#ff4d4f", scheduled: "#1890ff",
  cancelled: "#ff4d4f", submitted: "#1890ff", approved: "#52c41a",
  rejected: "#ff4d4f", suspended: "#faad14", available: "#52c41a",
  occupied: "#1890ff",
};

// ─── METER READINGS (Chỉ số điện/nước hàng tháng) ───────────────────────────
export const MOCK_METER_READINGS = [
  // Tháng 03/2024 - Dự án Vinhomes City Park
  { id: 1, projectId: 1, unitId: 1, unitCode: "A-1201", customerId: 2, customerName: "Trần Văn Hùng", period: "2024-03",
    waterPrev: 145, waterCurr: 162, waterUsed: 17, waterUnitPrice: 15000, waterAmount: 255000,
    electricPrev: 2340, electricCurr: 2512, electricUsed: 172, electricUnitPrice: 3500, electricAmount: 602000,
    managementFee: 685000, parkingFee: 1200000, otherFees: [{ name: "Phí dịch vụ thêm", amount: 50000 }],
    totalAmount: 2792000, status: "invoiced", inputBy: "Nguyễn Nhân Viên", inputAt: "2024-03-28 09:00" },
  { id: 2, projectId: 1, unitId: 2, unitCode: "A-1202", customerId: 2, customerName: "Lê Thị Bảo", period: "2024-03",
    waterPrev: 210, waterCurr: 231, waterUsed: 21, waterUnitPrice: 15000, waterAmount: 315000,
    electricPrev: 3120, electricCurr: 3345, electricUsed: 225, electricUnitPrice: 3500, electricAmount: 787500,
    managementFee: 920000, parkingFee: 2400000, otherFees: [],
    totalAmount: 4422500, status: "invoiced", inputBy: "Nguyễn Nhân Viên", inputAt: "2024-03-28 09:15" },
  { id: 3, projectId: 1, unitId: 4, unitCode: "C-2301", customerId: 2, customerName: "Phạm Đức Anh", period: "2024-03",
    waterPrev: 88, waterCurr: 101, waterUsed: 13, waterUnitPrice: 15000, waterAmount: 195000,
    electricPrev: 1890, electricCurr: 2054, electricUsed: 164, electricUnitPrice: 3500, electricAmount: 574000,
    managementFee: 1200000, parkingFee: 1200000, otherFees: [],
    totalAmount: 3169000, status: "invoiced", inputBy: "Nguyễn Nhân Viên", inputAt: "2024-03-28 09:30" },
  // Tháng 04/2024 - chưa nhập hết
  { id: 4, projectId: 1, unitId: 1, unitCode: "A-1201", customerId: 2, customerName: "Trần Văn Hùng", period: "2024-04",
    waterPrev: 162, waterCurr: 0, waterUsed: 0, waterUnitPrice: 15000, waterAmount: 0,
    electricPrev: 2512, electricCurr: 0, electricUsed: 0, electricUnitPrice: 3500, electricAmount: 0,
    managementFee: 685000, parkingFee: 1200000, otherFees: [],
    totalAmount: 0, status: "pending", inputBy: "", inputAt: "" },
  { id: 5, projectId: 1, unitId: 2, unitCode: "A-1202", customerId: 2, customerName: "Lê Thị Bảo", period: "2024-04",
    waterPrev: 231, waterCurr: 0, waterUsed: 0, waterUnitPrice: 15000, waterAmount: 0,
    electricPrev: 3345, electricCurr: 0, electricUsed: 0, electricUnitPrice: 3500, electricAmount: 0,
    managementFee: 920000, parkingFee: 2400000, otherFees: [],
    totalAmount: 0, status: "pending", inputBy: "", inputAt: "" },
  { id: 6, projectId: 1, unitId: 4, unitCode: "C-2301", customerId: 2, customerName: "Phạm Đức Anh", period: "2024-04",
    waterPrev: 101, waterCurr: 0, waterUsed: 0, waterUnitPrice: 15000, waterAmount: 0,
    electricPrev: 2054, electricCurr: 0, electricUsed: 0, electricUnitPrice: 3500, electricAmount: 0,
    managementFee: 1200000, parkingFee: 1200000, otherFees: [],
    totalAmount: 0, status: "pending", inputBy: "", inputAt: "" },
];

// Giá điện/nước mặc định theo dự án
export const MOCK_UTILITY_RATES = [
  {
    id: 1, projectId: 1, projectName: "Vinhomes City Park",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "active",
    // Điện
    electricFormula: "meter",       // meter | flat | tiered
    electricUnitPrice: 3500,        // đ/kWh (đơn giá đồng nhất)
    electricTiered: [               // Bậc thang (nếu electricFormula = "tiered")
      { from: 0, to: 50, price: 1678 },
      { from: 51, to: 100, price: 1734 },
      { from: 101, to: 200, price: 2014 },
      { from: 201, to: 300, price: 2536 },
      { from: 301, to: 400, price: 2834 },
      { from: 401, to: null, price: 2927 },
    ],
    electricSurcharge: 10,          // % phụ thu thêm (hao hụt đường dây, VAT...)
    // Nước
    waterFormula: "meter",          // meter | flat
    waterUnitPrice: 15000,          // đ/m³
    waterSurcharge: 0,
    // Phí quản lý
    mgmtFormula: "per_m2",          // per_m2 | flat_per_unit | pct_rent
    managementFeePerM2: 10000,      // đ/m²/tháng
    managementFeeFlat: 0,           // Nếu flat_per_unit
    managementFeePctRent: 0,        // Nếu % tiền thuê
    // Gửi xe
    parkingMotorbike: 200000,       // đ/xe máy/tháng
    parkingCar: 1200000,            // đ/ô tô/tháng
    // Ghi chú
    note: "Biểu giá áp dụng cho Vinhomes City Park từ 01/2024. Điện tính đơn giá đồng nhất 3.500đ/kWh (đã gộp phụ thu 10%).",
    updatedBy: "Nguyễn Quản Lý", updatedAt: "2023-12-15",
  },
  {
    id: 2, projectId: 2, projectName: "Goldmark City Office Tower A",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "active",
    electricFormula: "meter", electricUnitPrice: 3800,
    electricTiered: [], electricSurcharge: 8,
    waterFormula: "meter", waterUnitPrice: 18000, waterSurcharge: 0,
    mgmtFormula: "per_m2", managementFeePerM2: 8000, managementFeeFlat: 0, managementFeePctRent: 0,
    parkingMotorbike: 300000, parkingCar: 1500000,
    note: "Văn phòng hạng A – điện tính 3.800đ/kWh. Phí QL 8.000đ/m²/tháng.",
    updatedBy: "Nguyễn Quản Lý", updatedAt: "2023-12-15",
  },
  {
    id: 3, projectId: 3, projectName: "Khu Công Nghiệp Vinh Phúc",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "active",
    electricFormula: "meter", electricUnitPrice: 3200,
    electricTiered: [], electricSurcharge: 5,
    waterFormula: "meter", waterUnitPrice: 12000, waterSurcharge: 0,
    mgmtFormula: "per_m2", managementFeePerM2: 5000, managementFeeFlat: 0, managementFeePctRent: 0,
    parkingMotorbike: 150000, parkingCar: 800000,
    note: "KCN áp dụng giá điện công nghiệp. Phí QL 5.000đ/m²/tháng.",
    updatedBy: "Trần Vận Hành", updatedAt: "2023-12-20",
  },
];

// ─── DEBTS (Công nợ) ─────────────────────────────────────────────────────
// kind: "receivable" = phải thu (KH nợ TNPM), "payable" = phải trả (TNPM nợ NCC)
// status: "overdue" | "upcoming" | "open" | "paid"
export const MOCK_DEBTS = [
  // ── Phải thu (từ khách hàng) — dẫn xuất từ MOCK_INVOICES chưa thanh toán
  {
    id: 1, kind: "receivable", refType: "invoice", refId: 2, refCode: "HD-2024-002",
    counterpartyType: "customer", counterpartyId: 1, counterpartyName: "ABC Technology",
    projectId: 2, projectName: "Goldmark Office",
    originalAmount: 165000000, paidAmount: 0, amount: 165000000,
    dueDate: "2024-04-05", reminderDate: "2024-04-03", daysRemaining: -9,
    status: "overdue", note: "Khách đã được gửi nhắc nợ 2 lần",
    createdAt: "2024-03-25",
  },
  {
    id: 2, kind: "receivable", refType: "invoice", refId: 4, refCode: "HD-2024-004",
    counterpartyType: "customer", counterpartyId: 4, counterpartyName: "Thời Trang Việt",
    projectId: 4, projectName: "AEON Mall",
    originalAmount: 105000000, paidAmount: 0, amount: 105000000,
    dueDate: "2024-03-15", reminderDate: "2024-03-13", daysRemaining: -30,
    status: "overdue", note: "TTTM đang đàm phán lại điều khoản TT",
    createdAt: "2024-03-01",
  },
  {
    id: 3, kind: "receivable", refType: "invoice", refId: 101, refCode: "HD-2024-011",
    counterpartyType: "customer", counterpartyId: 2, counterpartyName: "Nguyễn Thị Hoa",
    projectId: 1, projectName: "Vinhomes City Park",
    originalAmount: 3420000, paidAmount: 1500000, amount: 1920000,
    dueDate: "2024-04-20", reminderDate: "2024-04-18", daysRemaining: 6,
    status: "upcoming", note: "Khách đã thu 1 phần bằng tiền mặt",
    createdAt: "2024-04-01",
  },
  {
    id: 4, kind: "receivable", refType: "invoice", refId: 102, refCode: "HD-2024-012",
    counterpartyType: "customer", counterpartyId: 5, counterpartyName: "Phạm Đức Anh",
    projectId: 1, projectName: "Vinhomes City Park",
    originalAmount: 3169000, paidAmount: 0, amount: 3169000,
    dueDate: "2024-04-25", reminderDate: "2024-04-23", daysRemaining: 11,
    status: "open", note: "",
    createdAt: "2024-04-05",
  },
  {
    id: 5, kind: "receivable", refType: "invoice", refId: 103, refCode: "HD-2024-013",
    counterpartyType: "customer", counterpartyId: 6, counterpartyName: "Công ty TNHH Minh Phát",
    projectId: 2, projectName: "Goldmark Office",
    originalAmount: 75000000, paidAmount: 0, amount: 75000000,
    dueDate: "2024-04-30", reminderDate: "2024-04-28", daysRemaining: 16,
    status: "open", note: "Phí thuê quý 2/2024",
    createdAt: "2024-04-01",
  },

  // ── Phải trả (tới NCC) — dẫn xuất từ MOCK_VENDOR_INVOICES chưa thanh toán
  {
    id: 6, kind: "payable", refType: "vendor_invoice", refId: 2, refCode: "NVAT-2024-002",
    counterpartyType: "vendor", counterpartyId: 2, counterpartyName: "Công ty Vệ Sinh Sạch Đẹp",
    projectId: 1, projectName: "Vinhomes City Park",
    originalAmount: 15000000, paidAmount: 0, amount: 15000000,
    dueDate: "2024-04-15", reminderDate: "2024-04-12", daysRemaining: 1,
    status: "upcoming", note: "Đang chờ biên bản nghiệm thu tháng 03",
    createdAt: "2024-03-31",
  },
  {
    id: 7, kind: "payable", refType: "vendor_invoice", refId: 201, refCode: "NVAT-2024-201",
    counterpartyType: "vendor", counterpartyId: 4, counterpartyName: "Otis Elevator Vietnam",
    projectId: 2, projectName: "Goldmark Office",
    originalAmount: 30000000, paidAmount: 0, amount: 30000000,
    dueDate: "2024-04-10", reminderDate: "2024-04-08", daysRemaining: -4,
    status: "overdue", note: "NCC đã gửi invoice & BB nghiệm thu đầy đủ",
    createdAt: "2024-03-28",
  },
];

// ─── DEBT TRANSACTIONS (Lịch sử ghi nhận / thu nợ) ────────────────────────
// type: "collect_debt" (thu nợ), "create_receivable" (tạo phải thu),
//       "pay_debt" (trả nợ NCC), "create_payable" (tạo phải trả)
export const MOCK_DEBT_TRANSACTIONS = [
  {
    id: 1, code: "TXN-2024-001", type: "collect_debt",
    debtId: 3, counterpartyName: "Nguyễn Thị Hoa", counterpartyType: "customer",
    amount: 1500000, paymentMethod: "cash", paymentMethodLabel: "Tiền mặt",
    fundName: "Quỹ tiền mặt VP chính", transDate: "2024-04-08",
    note: "Khách thanh toán một phần hóa đơn HD-2024-011",
    createdBy: "Lê Thu Ngân", createdAt: "2024-04-08 10:25",
  },
  {
    id: 2, code: "TXN-2024-002", type: "collect_debt",
    debtId: 3, counterpartyName: "Trần Văn Hùng", counterpartyType: "customer",
    amount: 26200000, paymentMethod: "bank_transfer", paymentMethodLabel: "Chuyển khoản",
    fundName: "TK MSB - TNPM chính", transDate: "2024-04-09",
    note: "Thanh toán HD-2024-005 qua MSB Pay",
    createdBy: "Hệ thống (MSB)", createdAt: "2024-04-09 14:20",
  },
  {
    id: 3, code: "TXN-2024-003", type: "pay_debt",
    debtId: 6, counterpartyName: "KT Việt", counterpartyType: "vendor",
    amount: 20000000, paymentMethod: "bank_transfer", paymentMethodLabel: "Chuyển khoản",
    fundName: "TK MSB - TNPM chính", transDate: "2024-04-05",
    note: "Thanh toán hợp đồng bảo trì NVAT-2024-001",
    createdBy: "Phạm Kế Toán", createdAt: "2024-04-05 16:00",
  },
  {
    id: 4, code: "TXN-2024-004", type: "pay_debt",
    debtId: 7, counterpartyName: "BV 24/7", counterpartyType: "vendor",
    amount: 30000000, paymentMethod: "bank_transfer", paymentMethodLabel: "Chuyển khoản",
    fundName: "TK MSB - TNPM chính", transDate: "2024-04-03",
    note: "Thanh toán bảo vệ T03/2024",
    createdBy: "Phạm Kế Toán", createdAt: "2024-04-03 09:45",
  },
  {
    id: 5, code: "TXN-2024-005", type: "create_receivable",
    debtId: 5, counterpartyName: "Công ty TNHH Minh Phát", counterpartyType: "customer",
    amount: 75000000, paymentMethod: "", paymentMethodLabel: "—",
    fundName: "—", transDate: "2024-04-01",
    note: "Ghi nhận công nợ phí thuê Q2/2024",
    createdBy: "Nguyễn Kế Toán", createdAt: "2024-04-01 08:00",
  },
];

// ─── PAYMENT METHODS (Phương thức thanh toán) ────────────────────────────
export const MOCK_PAYMENT_METHODS = [
  {
    id: 1, code: "cash", name: "Tiền mặt", type: "cash",
    enabled: true, isDefault: false,
    icon: "💵", description: "Thu trực tiếp tại quầy BQL",
    fundMapping: "Quỹ tiền mặt VP chính", fee: 0,
  },
  {
    id: 2, code: "bank_transfer", name: "Chuyển khoản ngân hàng", type: "bank",
    enabled: true, isDefault: true,
    icon: "🏦", description: "Chuyển khoản qua TK MSB - TNPM",
    fundMapping: "TK MSB - TNPM chính", fee: 0,
    bankInfo: { bankName: "MSB", accountNumber: "0123456789", accountName: "CTY TNPM ROX KEY" },
  },
  {
    id: 3, code: "msb_pay", name: "MSB Pay (QR động)", type: "gateway",
    enabled: true, isDefault: false,
    icon: "📱", description: "QR động sinh tự động kèm invoice_id, gạch nợ auto",
    fundMapping: "TK MSB - TNPM chính", fee: 0,
    gatewayId: 1,
  },
  {
    id: 4, code: "app_timi", name: "App Timi", type: "app",
    enabled: true, isDefault: false,
    icon: "📲", description: "Cư dân thanh toán qua app Timi → webhook gạch nợ",
    fundMapping: "TK MSB - TNPM chính", fee: 0,
    gatewayId: 2,
  },
  {
    id: 5, code: "vnpay", name: "VNPay", type: "gateway",
    enabled: false, isDefault: false,
    icon: "💳", description: "Chưa kích hoạt — dùng khi mở thêm kênh TT",
    fundMapping: "", fee: 1.1, gatewayId: 3,
  },
  {
    id: 6, code: "momo", name: "MoMo", type: "gateway",
    enabled: false, isDefault: false,
    icon: "🅼", description: "Chưa kích hoạt",
    fundMapping: "", fee: 1.5, gatewayId: 4,
  },
];

// ─── PAYMENT GATEWAYS (Cấu hình tích hợp cổng TT) ────────────────────────
export const MOCK_PAYMENT_GATEWAYS = [
  {
    id: 1, code: "msb_pay", name: "MSB Pay", provider: "Maritime Bank",
    status: "active", environment: "production",
    apiBaseUrl: "https://api.msb.com.vn/pay/v2",
    merchantId: "TNPM_ROX_01", apiKey: "msb_**********4821",
    webhookUrl: "https://tnpm.rox.vn/webhooks/msb-pay",
    autoReconcile: true, lastSyncAt: "2024-04-14 08:30:00",
    successRate: 98.5, avgResponseMs: 420,
    supportedFeatures: ["QR động", "VA Account", "Auto-debit", "Webhook"],
  },
  {
    id: 2, code: "app_timi", name: "App Timi", provider: "Timi JSC",
    status: "active", environment: "production",
    apiBaseUrl: "https://api.timi.vn/v1",
    merchantId: "TIMI_TNPM", apiKey: "tm_live_**********9e2f",
    webhookUrl: "https://tnpm.rox.vn/webhooks/timi",
    autoReconcile: true, lastSyncAt: "2024-04-14 08:32:00",
    successRate: 96.2, avgResponseMs: 680,
    supportedFeatures: ["QR tĩnh", "Push notification", "Gạch nợ auto"],
  },
  {
    id: 3, code: "vnpay", name: "VNPay", provider: "VNPAY JSC",
    status: "inactive", environment: "sandbox",
    apiBaseUrl: "https://sandbox.vnpayment.vn/paymentv2",
    merchantId: "", apiKey: "",
    webhookUrl: "",
    autoReconcile: false, lastSyncAt: null,
    successRate: 0, avgResponseMs: 0,
    supportedFeatures: ["QR", "ATM nội địa", "Visa/Master"],
  },
  {
    id: 4, code: "momo", name: "MoMo Business", provider: "MoMo",
    status: "inactive", environment: "sandbox",
    apiBaseUrl: "https://test-payment.momo.vn",
    merchantId: "", apiKey: "",
    webhookUrl: "",
    autoReconcile: false, lastSyncAt: null,
    successRate: 0, avgResponseMs: 0,
    supportedFeatures: ["QR tĩnh", "Deep link app"],
  },
];

// ─── PARTNERS (Đối tác — hợp tác/giới thiệu/tư vấn — KHÔNG phải NCC dịch vụ) ─
// type: "distributor" | "referrer" | "consultant" | "strategic" | "other"
export const MOCK_PARTNERS = [
  {
    id: 1, code: "DT-001", name: "Công ty CP Đầu Tư Bất Động Sản Phát Lộc",
    shortName: "BĐS Phát Lộc", type: "strategic",
    typeLabel: "Đối tác chiến lược",
    taxCode: "0100111222", businessField: "Đầu tư BĐS, môi giới",
    contactName: "Trần Thị Thanh Hương", contactTitle: "Phó TGĐ",
    phone: "0901234567", email: "huong.tran@phatloc.vn",
    address: "Tầng 15, Keangnam Landmark 72, Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier1", relationshipLevelLabel: "Tier 1 - Chủ đầu tư",
    status: "active", rating: 4.8,
    totalContracts: 5, activeContracts: 3, totalValue: 28500000000,
    lastInteractionAt: "2024-04-10",
    notes: "Chủ đầu tư 2 dự án lớn (Phát Lộc Tower, Phát Lộc Residence). Ký HĐ quản lý dài hạn.",
    createdAt: "2022-06-15", createdBy: "Nguyễn Văn A",
  },
  {
    id: 2, code: "DT-002", name: "Tập Đoàn ROX Key Holdings",
    shortName: "ROX Key", type: "strategic",
    typeLabel: "Đối tác chiến lược",
    taxCode: "0100222333", businessField: "Đầu tư, Phát triển BĐS & Dịch vụ",
    contactName: "Ngô Quang Anh", contactTitle: "Giám đốc Khối Vận hành",
    phone: "0909111222", email: "quanganh.ngo@roxkey.vn",
    address: "ROX Key Tower, 89 Láng Hạ, Ba Đình, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier1", relationshipLevelLabel: "Tier 1 - Công ty mẹ",
    status: "active", rating: 5.0,
    totalContracts: 12, activeContracts: 8, totalValue: 85000000000,
    lastInteractionAt: "2024-04-14",
    notes: "Công ty mẹ — sở hữu đa số các dự án TNPM đang quản lý. Không chịu phí QL.",
    createdAt: "2020-01-01", createdBy: "System",
  },
  {
    id: 3, code: "DT-003", name: "Công ty TNHH Môi Giới Sao Việt",
    shortName: "Sao Việt Broker", type: "referrer",
    typeLabel: "Đối tác giới thiệu khách",
    taxCode: "0100333444", businessField: "Môi giới BĐS, cho thuê văn phòng",
    contactName: "Lê Minh Sáng", contactTitle: "Giám đốc",
    phone: "0935123456", email: "sang.le@saoviet.com.vn",
    address: "Tầng 3, Goldmark City, Cầu Giấy, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier2", relationshipLevelLabel: "Tier 2 - Môi giới",
    status: "active", rating: 4.2,
    totalContracts: 8, activeContracts: 4, totalValue: 320000000,
    lastInteractionAt: "2024-04-08",
    notes: "Giới thiệu tenant cho Goldmark Office & Vinhomes. Hoa hồng 10% phí tháng đầu.",
    createdAt: "2023-03-20", createdBy: "Phạm Thu Hằng",
  },
  {
    id: 4, code: "DT-004", name: "Công ty TNHH Tư Vấn Đầu Tư KPMG VN",
    shortName: "KPMG VN", type: "consultant",
    typeLabel: "Đối tác tư vấn",
    taxCode: "0100444555", businessField: "Tư vấn pháp lý, thuế, audit",
    contactName: "David Nguyen", contactTitle: "Senior Manager",
    phone: "0908223344", email: "david.nguyen@kpmg.com.vn",
    address: "Tòa nhà Lotte Center, 54 Liễu Giai, Ba Đình, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier2", relationshipLevelLabel: "Tier 2 - Tư vấn",
    status: "active", rating: 4.6,
    totalContracts: 2, activeContracts: 2, totalValue: 480000000,
    lastInteractionAt: "2024-03-25",
    notes: "Tư vấn hợp đồng thuê với khách tenant lớn. Audit báo cáo tài chính hàng năm.",
    createdAt: "2022-11-10", createdBy: "Nguyễn Văn A",
  },
  {
    id: 5, code: "DT-005", name: "Công ty Phân Phối Thiết Bị Văn Phòng An Phát",
    shortName: "An Phát Office", type: "distributor",
    typeLabel: "Đối tác phân phối",
    taxCode: "0100555666", businessField: "Phân phối TBVP, đồ nội thất",
    contactName: "Vũ Anh Tuấn", contactTitle: "Trưởng phòng KD",
    phone: "0977889900", email: "tuan.vu@anphat.vn",
    address: "Số 45, KCN Sài Đồng, Long Biên, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier3", relationshipLevelLabel: "Tier 3 - Phân phối",
    status: "active", rating: 3.9,
    totalContracts: 3, activeContracts: 1, totalValue: 180000000,
    lastInteractionAt: "2024-02-18",
    notes: "Cung cấp thiết bị VP cho các dự án. Giảm giá 15% cho HĐ > 100tr.",
    createdAt: "2023-07-01", createdBy: "Lê Thị B",
  },
  {
    id: 6, code: "DT-006", name: "Savills Việt Nam",
    shortName: "Savills VN", type: "consultant",
    typeLabel: "Đối tác tư vấn",
    taxCode: "0100666777", businessField: "Tư vấn & môi giới BĐS",
    contactName: "Lisa Tran", contactTitle: "Associate Director",
    phone: "0906112233", email: "lisa.tran@savills.com.vn",
    address: "Tòa nhà Royal City, Thanh Xuân, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier2", relationshipLevelLabel: "Tier 2 - Tư vấn",
    status: "inactive", rating: 4.5,
    totalContracts: 1, activeContracts: 0, totalValue: 250000000,
    lastInteractionAt: "2023-11-20",
    notes: "HĐ tư vấn market research đã hết hạn 11/2023, chưa gia hạn.",
    createdAt: "2022-09-05", createdBy: "Nguyễn Văn A",
  },
  {
    id: 7, code: "DT-007", name: "Công ty TNHH Dịch Vụ Bảo Hiểm Bảo Việt",
    shortName: "Bảo Việt", type: "other",
    typeLabel: "Đối tác khác",
    taxCode: "0100777888", businessField: "Bảo hiểm phi nhân thọ, PCCC",
    contactName: "Nguyễn Thị Mai", contactTitle: "Trưởng phòng Key Account",
    phone: "0904556677", email: "mai.nguyen@baoviet.com.vn",
    address: "Số 35 Hai Bà Trưng, Hoàn Kiếm, Hà Nội",
    city: "Hà Nội",
    relationshipLevel: "tier2", relationshipLevelLabel: "Tier 2 - Dịch vụ",
    status: "active", rating: 4.3,
    totalContracts: 4, activeContracts: 4, totalValue: 450000000,
    lastInteractionAt: "2024-04-05",
    notes: "Cung cấp bảo hiểm cháy nổ, TNDS cho tất cả các tòa nhà TNPM quản lý.",
    createdAt: "2021-04-01", createdBy: "System",
  },
];

// ─── PARTNER CONTRACTS (Hợp đồng với đối tác) ────────────────────────────
// contractType: "strategic_cooperation" | "referral_commission" | "consultancy" | "distribution" | "service_purchase"
export const MOCK_PARTNER_CONTRACTS = [
  {
    id: 1, code: "HĐ-DT-2024-001", partnerId: 1, partnerName: "BĐS Phát Lộc",
    partnerType: "strategic", contractType: "strategic_cooperation",
    contractTypeLabel: "Hợp tác chiến lược",
    title: "Hợp đồng quản lý vận hành Phát Lộc Tower 2024-2026",
    description: "TNPM độc quyền quản lý vận hành tòa văn phòng Phát Lộc Tower 18 tầng",
    value: 18000000000, paymentTerms: "quarterly",
    startDate: "2024-01-01", endDate: "2026-12-31", signedDate: "2023-12-15",
    status: "active", autoRenew: true, renewalNotice: 90,
    signedBy: "Nguyễn Giám Đốc TNPM",
    partnerSigner: "Trần Thị Thanh Hương (Phó TGĐ BĐS Phát Lộc)",
    attachments: 3,
    note: "Auto-renew 12 tháng nếu không có thông báo trước 90 ngày.",
  },
  {
    id: 2, code: "HĐ-DT-2024-002", partnerId: 1, partnerName: "BĐS Phát Lộc",
    partnerType: "strategic", contractType: "strategic_cooperation",
    contractTypeLabel: "Hợp tác chiến lược",
    title: "Hợp đồng quản lý Phát Lộc Residence giai đoạn 1",
    description: "Quản lý khu dân cư 450 căn Phát Lộc Residence",
    value: 9500000000, paymentTerms: "monthly",
    startDate: "2024-03-01", endDate: "2027-02-28", signedDate: "2024-02-20",
    status: "active", autoRenew: true, renewalNotice: 60,
    signedBy: "Nguyễn Giám Đốc TNPM",
    partnerSigner: "Trần Thị Thanh Hương (Phó TGĐ BĐS Phát Lộc)",
    attachments: 5,
    note: "Phí quản lý thu theo căn hộ, phụ trợ các dịch vụ an ninh, vệ sinh.",
  },
  {
    id: 3, code: "HĐ-DT-2024-003", partnerId: 3, partnerName: "Sao Việt Broker",
    partnerType: "referrer", contractType: "referral_commission",
    contractTypeLabel: "Hợp tác giới thiệu",
    title: "Thỏa thuận hoa hồng giới thiệu khách thuê 2024",
    description: "Sao Việt giới thiệu khách thuê VP/TTTM cho TNPM, hưởng hoa hồng theo giá trị HĐ thuê thành công",
    value: 320000000, paymentTerms: "per_deal",
    startDate: "2024-01-01", endDate: "2024-12-31", signedDate: "2024-01-05",
    status: "active", autoRenew: false, renewalNotice: 30,
    signedBy: "Phạm Trưởng phòng Kinh doanh",
    partnerSigner: "Lê Minh Sáng (GĐ Sao Việt)",
    attachments: 2,
    note: "Hoa hồng 10% giá trị tháng đầu HĐ thuê. Hoa hồng thanh toán sau khi KH thanh toán đầy đủ.",
  },
  {
    id: 4, code: "HĐ-DT-2024-004", partnerId: 4, partnerName: "KPMG VN",
    partnerType: "consultant", contractType: "consultancy",
    contractTypeLabel: "Dịch vụ tư vấn",
    title: "Hợp đồng audit BCTC & tư vấn thuế 2024",
    description: "Audit báo cáo tài chính năm 2024 và tư vấn thuế thu nhập doanh nghiệp",
    value: 380000000, paymentTerms: "milestone",
    startDate: "2024-02-01", endDate: "2025-01-31", signedDate: "2024-01-28",
    status: "active", autoRenew: false, renewalNotice: 45,
    signedBy: "Trần Kế Toán Trưởng",
    partnerSigner: "David Nguyen (Sr Manager KPMG)",
    attachments: 1,
    note: "Thanh toán theo 4 milestone: ký HĐ 25%, giữa kỳ 25%, kết thúc audit 40%, báo cáo cuối 10%.",
  },
  {
    id: 5, code: "HĐ-DT-2024-005", partnerId: 4, partnerName: "KPMG VN",
    partnerType: "consultant", contractType: "consultancy",
    contractTypeLabel: "Dịch vụ tư vấn",
    title: "Tư vấn pháp lý hợp đồng thuê TTTM (ROX Mall)",
    description: "Tư vấn soạn thảo & rà soát HĐ thuê tenant cho ROX Mall",
    value: 100000000, paymentTerms: "onetime",
    startDate: "2024-03-10", endDate: "2024-06-30", signedDate: "2024-03-05",
    status: "active", autoRenew: false, renewalNotice: 0,
    signedBy: "Trần Kế Toán Trưởng",
    partnerSigner: "David Nguyen (Sr Manager KPMG)",
    attachments: 1,
    note: "Phí cố định 100tr, thanh toán 1 lần sau khi hoàn thành.",
  },
  {
    id: 6, code: "HĐ-DT-2024-006", partnerId: 5, partnerName: "An Phát Office",
    partnerType: "distributor", contractType: "distribution",
    contractTypeLabel: "Hợp đồng phân phối",
    title: "Khung thỏa thuận cung cấp thiết bị văn phòng",
    description: "An Phát cung cấp thiết bị VP, nội thất cho các dự án của TNPM với giá ưu đãi",
    value: 180000000, paymentTerms: "per_po",
    startDate: "2024-01-15", endDate: "2024-12-31", signedDate: "2024-01-10",
    status: "active", autoRenew: true, renewalNotice: 30,
    signedBy: "Lê Trưởng phòng Mua sắm",
    partnerSigner: "Vũ Anh Tuấn (TP KD An Phát)",
    attachments: 2,
    note: "Khung HĐ — mua theo PO từng lô. Chiết khấu 15% cho đơn > 100tr.",
  },
  {
    id: 7, code: "HĐ-DT-2024-007", partnerId: 7, partnerName: "Bảo Việt",
    partnerType: "other", contractType: "service_purchase",
    contractTypeLabel: "Mua dịch vụ",
    title: "Bảo hiểm cháy nổ & TNDS khối tòa nhà 2024",
    description: "Bảo hiểm hỏa hoạn + TNDS cho toàn bộ các tòa nhà TNPM đang quản lý",
    value: 450000000, paymentTerms: "annual",
    startDate: "2024-01-01", endDate: "2024-12-31", signedDate: "2023-12-28",
    status: "active", autoRenew: true, renewalNotice: 60,
    signedBy: "Nguyễn Giám Đốc TNPM",
    partnerSigner: "Nguyễn Thị Mai (Bảo Việt)",
    attachments: 4,
    note: "Phí bảo hiểm hàng năm, đóng 1 lần đầu năm.",
  },
  {
    id: 8, code: "HĐ-DT-2023-099", partnerId: 6, partnerName: "Savills VN",
    partnerType: "consultant", contractType: "consultancy",
    contractTypeLabel: "Dịch vụ tư vấn",
    title: "Market research báo cáo BĐS VP Hà Nội 2023",
    description: "Tư vấn & cung cấp báo cáo thị trường văn phòng cho thuê Hà Nội",
    value: 250000000, paymentTerms: "onetime",
    startDate: "2023-05-01", endDate: "2023-11-30", signedDate: "2023-04-20",
    status: "expired", autoRenew: false, renewalNotice: 0,
    signedBy: "Phạm Trưởng phòng Kinh doanh",
    partnerSigner: "Lisa Tran (Savills)",
    attachments: 1,
    note: "Đã hết hạn 30/11/2023, chưa gia hạn.",
  },
];

// ─── PORTFOLIO FINANCIALS (P&L theo dự án — tổng hợp cho Chủ ĐT) ──────────
// Doanh thu, chi phí, lợi nhuận theo dự án & tháng
export const MOCK_PROJECT_FINANCIALS = [
  {
    id: 1, projectId: 1, projectName: "Vinhomes City Park", projectType: "residential",
    owner: "Vinhomes JSC", ownerContact: "mr.hoang@vinhomes.vn",
    monthlyRevenue: 145000000,        // phí QL, điện, nước, parking
    monthlyOperatingCost: 82000000,   // vendor + NV + utilities
    monthlyProfit: 63000000,
    outstandingReceivable: 1920000,   // công nợ phải thu
    occupancyRate: 92.5, totalUnits: 450, occupiedUnits: 416,
    overduePct: 0.8,
    ytdRevenue: 412000000,            // lũy kế từ đầu năm
    ytdCost: 238000000,
    ytdProfit: 174000000,
    lastReportAt: "2024-04-05",
    status: "healthy",                // healthy | warning | critical
  },
  {
    id: 2, projectId: 2, projectName: "Goldmark Office", projectType: "office",
    owner: "BĐS Phát Lộc", ownerContact: "huong.tran@phatloc.vn",
    monthlyRevenue: 320000000,
    monthlyOperatingCost: 155000000,
    monthlyProfit: 165000000,
    outstandingReceivable: 240000000,
    occupancyRate: 88.0, totalUnits: 85, occupiedUnits: 75,
    overduePct: 15.2,
    ytdRevenue: 920000000,
    ytdCost: 465000000,
    ytdProfit: 455000000,
    lastReportAt: "2024-04-05",
    status: "warning",
  },
  {
    id: 3, projectId: 3, projectName: "KCN Vinh Phúc", projectType: "industrial",
    owner: "ROX Key Holdings", ownerContact: "quanganh.ngo@roxkey.vn",
    monthlyRevenue: 680000000,
    monthlyOperatingCost: 320000000,
    monthlyProfit: 360000000,
    outstandingReceivable: 75000000,
    occupancyRate: 95.5, totalUnits: 42, occupiedUnits: 40,
    overduePct: 1.2,
    ytdRevenue: 1920000000,
    ytdCost: 945000000,
    ytdProfit: 975000000,
    lastReportAt: "2024-04-05",
    status: "healthy",
  },
  {
    id: 4, projectId: 4, projectName: "AEON Mall Long Biên", projectType: "retail",
    owner: "AEON Vietnam", ownerContact: "director@aeon.vn",
    monthlyRevenue: 820000000,
    monthlyOperatingCost: 480000000,
    monthlyProfit: 340000000,
    outstandingReceivable: 105000000,
    occupancyRate: 94.0, totalUnits: 180, occupiedUnits: 169,
    overduePct: 8.5,
    ytdRevenue: 2350000000,
    ytdCost: 1420000000,
    ytdProfit: 930000000,
    lastReportAt: "2024-04-05",
    status: "warning",
  },
  {
    id: 5, projectId: 5, projectName: "Vinhomes Villa Green", projectType: "villa",
    owner: "Vinhomes JSC", ownerContact: "mr.hoang@vinhomes.vn",
    monthlyRevenue: 180000000,
    monthlyOperatingCost: 95000000,
    monthlyProfit: 85000000,
    outstandingReceivable: 0,
    occupancyRate: 100, totalUnits: 120, occupiedUnits: 120,
    overduePct: 0,
    ytdRevenue: 540000000,
    ytdCost: 275000000,
    ytdProfit: 265000000,
    lastReportAt: "2024-04-05",
    status: "healthy",
  },
  {
    id: 6, projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình", projectType: "government",
    owner: "UBND TP Hà Nội", ownerContact: "hcbadinh@hanoi.gov.vn",
    monthlyRevenue: 85000000,
    monthlyOperatingCost: 95000000,
    monthlyProfit: -10000000,         // lỗ nhẹ — ngân sách hc
    outstandingReceivable: 0,
    occupancyRate: 100, totalUnits: 12, occupiedUnits: 12,
    overduePct: 0,
    ytdRevenue: 255000000,
    ytdCost: 275000000,
    ytdProfit: -20000000,
    lastReportAt: "2024-04-05",
    status: "warning",
  },
];

// Revenue chart by project & month (6 tháng gần nhất)
export const MOCK_PORTFOLIO_REVENUE_CHART = [
  { month: "T11/2023", projects: { 1: 138000000, 2: 285000000, 3: 650000000, 4: 780000000, 5: 175000000, 6: 85000000 } },
  { month: "T12/2023", projects: { 1: 142000000, 2: 298000000, 3: 672000000, 4: 810000000, 5: 178000000, 6: 85000000 } },
  { month: "T01/2024", projects: { 1: 140000000, 2: 305000000, 3: 665000000, 4: 795000000, 5: 175000000, 6: 85000000 } },
  { month: "T02/2024", projects: { 1: 143000000, 2: 312000000, 3: 675000000, 4: 805000000, 5: 178000000, 6: 85000000 } },
  { month: "T03/2024", projects: { 1: 145000000, 2: 320000000, 3: 680000000, 4: 820000000, 5: 180000000, 6: 85000000 } },
  { month: "T04/2024", projects: { 1: 145000000, 2: 320000000, 3: 680000000, 4: 820000000, 5: 180000000, 6: 85000000 } },
];

// ─── B2G COMPLIANCE (Khu liên cơ quan HC — workflow thanh toán kho bạc) ───
// Ngân sách duyệt hàng năm cho dự án HC
export const MOCK_B2G_BUDGETS = [
  {
    id: 1, projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình",
    year: 2024, totalBudget: 1140000000,     // ngân sách duyệt cả năm
    usedBudget: 285000000,                    // đã sử dụng
    remainingBudget: 855000000,
    approvedBy: "UBND TP Hà Nội",
    approvalDoc: "QĐ-456/UBND-HN-2023",
    approvalDate: "2023-11-20",
    categories: [
      { code: "maintenance", label: "Bảo trì kỹ thuật", budget: 340000000, used: 85000000 },
      { code: "utilities", label: "Điện, nước, chiếu sáng", budget: 280000000, used: 72000000 },
      { code: "security", label: "Bảo vệ, an ninh", budget: 260000000, used: 65000000 },
      { code: "cleaning", label: "Vệ sinh, cảnh quan", budget: 180000000, used: 45000000 },
      { code: "admin", label: "Quản lý hành chính", budget: 80000000, used: 18000000 },
    ],
    status: "active",
    note: "Ngân sách vận hành khu HC Ba Đình năm 2024, duyệt theo QĐ UBND TP HN.",
  },
];

// Đề nghị thanh toán từ dự án B2G — workflow qua nhiều cấp trước khi chi kho bạc
export const MOCK_B2G_PAYMENTS = [
  {
    id: 1, code: "DNTT-2024-001", projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình",
    type: "vendor_payment", category: "maintenance",
    vendorName: "KT Việt", vendorId: 1,
    invoiceRef: "NVAT-2024-001",
    amount: 20000000, requestDate: "2024-04-01", dueDate: "2024-04-10",
    description: "Thanh toán HĐ bảo trì thang máy Q1/2024 (đã nghiệm thu BB-001/2024)",
    requestedBy: "Nguyễn Kỹ Thuật",
    workflow: [
      { step: 1, role: "QLDA", assignee: "Trần Quản Lý DA", status: "approved", actionAt: "2024-04-02 09:00", note: "Đã kiểm tra khối lượng, đồng ý" },
      { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: "approved", actionAt: "2024-04-03 14:30", note: "Số liệu khớp, phê duyệt" },
      { step: 3, role: "Giám đốc", assignee: "Ngô Giám Đốc", status: "approved", actionAt: "2024-04-04 10:15", note: "Đồng ý thanh toán" },
      { step: 4, role: "Kho bạc Nhà nước", assignee: "KBNN Ba Đình", status: "paid", actionAt: "2024-04-05 15:00", note: "Đã chuyển khoản NCC, UNC số 20240405-001" },
    ],
    status: "paid",
    paidAt: "2024-04-05",
    paymentRef: "UNC-20240405-001",
  },
  {
    id: 2, code: "DNTT-2024-002", projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình",
    type: "vendor_payment", category: "security",
    vendorName: "BV 24/7", vendorId: 3,
    invoiceRef: "NVAT-2024-010",
    amount: 30000000, requestDate: "2024-04-08", dueDate: "2024-04-18",
    description: "Thanh toán dịch vụ bảo vệ tháng 03/2024 (3 ca, 5 vị trí)",
    requestedBy: "Nguyễn Kỹ Thuật",
    workflow: [
      { step: 1, role: "QLDA", assignee: "Trần Quản Lý DA", status: "approved", actionAt: "2024-04-09 08:30", note: "Đồng ý" },
      { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: "approved", actionAt: "2024-04-10 11:00", note: "Đã đối chiếu, duyệt" },
      { step: 3, role: "Giám đốc", assignee: "Ngô Giám Đốc", status: "pending", actionAt: null, note: "" },
      { step: 4, role: "Kho bạc Nhà nước", assignee: "KBNN Ba Đình", status: "pending", actionAt: null, note: "" },
    ],
    status: "pending_director",
    paidAt: null,
    paymentRef: null,
  },
  {
    id: 3, code: "DNTT-2024-003", projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình",
    type: "utility", category: "utilities",
    vendorName: "EVN Hà Nội", vendorId: null,
    invoiceRef: "EVN-032024",
    amount: 25000000, requestDate: "2024-04-10", dueDate: "2024-04-20",
    description: "Thanh toán tiền điện tháng 03/2024 cho khu HC Ba Đình",
    requestedBy: "Trần Vận Hành",
    workflow: [
      { step: 1, role: "QLDA", assignee: "Trần Quản Lý DA", status: "approved", actionAt: "2024-04-10 16:00", note: "Có hóa đơn GTGT EVN" },
      { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: "pending", actionAt: null, note: "" },
      { step: 3, role: "Giám đốc", assignee: "Ngô Giám Đốc", status: "pending", actionAt: null, note: "" },
      { step: 4, role: "Kho bạc Nhà nước", assignee: "KBNN Ba Đình", status: "pending", actionAt: null, note: "" },
    ],
    status: "pending_accountant",
    paidAt: null,
    paymentRef: null,
  },
  {
    id: 4, code: "DNTT-2024-004", projectId: 6, projectName: "Khu Liên Cơ Quan HC Ba Đình",
    type: "vendor_payment", category: "cleaning",
    vendorName: "Sạch Đẹp", vendorId: 2,
    invoiceRef: "NVAT-2024-011",
    amount: 15000000, requestDate: "2024-04-12", dueDate: "2024-04-22",
    description: "Vệ sinh tháng 03/2024 cho khu liên cơ quan",
    requestedBy: "Nguyễn Kỹ Thuật",
    workflow: [
      { step: 1, role: "QLDA", assignee: "Trần Quản Lý DA", status: "pending", actionAt: null, note: "" },
      { step: 2, role: "Kế toán trưởng", assignee: "Phạm Kế Toán", status: "pending", actionAt: null, note: "" },
      { step: 3, role: "Giám đốc", assignee: "Ngô Giám Đốc", status: "pending", actionAt: null, note: "" },
      { step: 4, role: "Kho bạc Nhà nước", assignee: "KBNN Ba Đình", status: "pending", actionAt: null, note: "" },
    ],
    status: "pending_qlda",
    paidAt: null,
    paymentRef: null,
  },
];

// ─── CAM CHARGES (Phí khu vực chung — TTTM/Office) ────────────────────────
// Common Area Maintenance: phân bổ chi phí khu vực chung cho các tenant theo m²
// distributionMethod: "area_based" (theo m² thuê) | "revenue_based" (theo DT) | "fixed_split" (chia đều)
export const MOCK_CAM_CHARGES = [
  {
    id: 1, projectId: 4, projectName: "AEON Mall Long Biên",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "active",
    totalCommonAreaM2: 8500, totalLeasableAreaM2: 32000,
    totalMonthlyCostVND: 480000000,
    pricePerM2: 15000, // = 480tr / 32000m²
    distributionMethod: "area_based",
    includedItems: [
      { code: "cleaning_cam", label: "Vệ sinh khu vực chung", monthlyCost: 120000000 },
      { code: "security_cam", label: "An ninh khu vực chung", monthlyCost: 150000000 },
      { code: "electricity_common", label: "Điện chiếu sáng công cộng", monthlyCost: 85000000 },
      { code: "landscape", label: "Cảnh quan cây xanh", monthlyCost: 45000000 },
      { code: "maintenance_cam", label: "Bảo trì thang cuốn/thang máy", monthlyCost: 65000000 },
      { code: "marketing_levy", label: "Marketing TTTM (3% DT)", monthlyCost: 15000000 },
    ],
    note: "CAM TTTM AEON áp dụng cho toàn bộ tenant thuê mặt bằng. Marketing levy tính riêng 3% doanh thu mỗi tenant.",
    updatedBy: "Phạm Vận Hành", updatedAt: "2023-12-28",
  },
  {
    id: 2, projectId: 2, projectName: "Goldmark Office",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "active",
    totalCommonAreaM2: 1200, totalLeasableAreaM2: 18000,
    totalMonthlyCostVND: 144000000,
    pricePerM2: 8000,
    distributionMethod: "area_based",
    includedItems: [
      { code: "cleaning_cam", label: "Vệ sinh sảnh & hành lang", monthlyCost: 35000000 },
      { code: "security_cam", label: "Bảo vệ 24/7 + camera", monthlyCost: 55000000 },
      { code: "electricity_common", label: "Điện công cộng", monthlyCost: 32000000 },
      { code: "maintenance_cam", label: "Bảo trì thang máy", monthlyCost: 22000000 },
    ],
    note: "Office building — CAM tính vào phí quản lý theo m² thuê.",
    updatedBy: "Phạm Vận Hành", updatedAt: "2023-12-28",
  },
  {
    id: 3, projectId: 3, projectName: "Khu Công Nghiệp Vinh Phúc",
    effectiveFrom: "2024-01-01", effectiveTo: null, status: "draft",
    totalCommonAreaM2: 4500, totalLeasableAreaM2: 95000,
    totalMonthlyCostVND: 285000000,
    pricePerM2: 3000,
    distributionMethod: "area_based",
    includedItems: [
      { code: "road_maintenance", label: "Bảo trì đường nội bộ KCN", monthlyCost: 80000000 },
      { code: "security_cam", label: "An ninh cổng & tuần tra", monthlyCost: 95000000 },
      { code: "waste_treatment", label: "Xử lý rác thải KCN", monthlyCost: 60000000 },
      { code: "street_lighting", label: "Chiếu sáng nội khu", monthlyCost: 50000000 },
    ],
    note: "Nháp — chờ duyệt với Samsung & các tenant KCN.",
    updatedBy: "Trần Pháp Chế", updatedAt: "2024-03-15",
  },
];

// ─── NOTIFICATION TEMPLATES (Mẫu thông báo phí/nhắc nợ/gia hạn) ──────────
// variables: {customerName} {amount} {dueDate} {invoiceCode} {daysOverdue} {projectName}
export const MOCK_NOTIFICATION_TEMPLATES = [
  {
    id: 1, code: "TPL-FEE-MONTHLY", name: "Thông báo phí hàng tháng", category: "fee_notice",
    channels: ["sms", "email", "zalo"],
    subject: "[TNPM] Thông báo phí dịch vụ {projectName} kỳ {period}",
    content: "Kính gửi {customerName},\n\nTNPM xin thông báo hóa đơn phí dịch vụ tháng {period} của quý khách:\n• Mã HĐ: {invoiceCode}\n• Số tiền: {amount}\n• Hạn thanh toán: {dueDate}\n\nVui lòng thanh toán đúng hạn. Trân trọng!",
    smsContent: "TNPM: HĐ {invoiceCode} phí {amount}, hạn {dueDate}. Chi tiết: tnpm.vn/hd/{invoiceCode}",
    enabled: true, createdAt: "2024-01-15",
  },
  {
    id: 2, code: "TPL-DEBT-REMIND-1", name: "Nhắc nợ lần 1 (3 ngày trước hạn)", category: "debt_reminder",
    channels: ["sms", "email", "zalo", "push"],
    subject: "[TNPM] Nhắc thanh toán HĐ {invoiceCode} — còn {daysOverdue} ngày",
    content: "Kính gửi {customerName},\n\nHóa đơn {invoiceCode} trị giá {amount} sẽ đến hạn vào {dueDate} (còn {daysOverdue} ngày).\n\nVui lòng thanh toán trước hạn để tránh phí phạt. Cảm ơn!",
    smsContent: "TNPM nhắc: HĐ {invoiceCode} {amount} đến hạn {dueDate} (còn {daysOverdue}d). Thanh toán sớm!",
    enabled: true, createdAt: "2024-01-20",
  },
  {
    id: 3, code: "TPL-DEBT-OVERDUE-1", name: "Nhắc nợ quá hạn lần 1 (1-7 ngày)", category: "debt_overdue",
    channels: ["sms", "email", "zalo"],
    subject: "[TNPM] QUÁ HẠN: HĐ {invoiceCode} đã quá hạn {daysOverdue} ngày",
    content: "Kính gửi {customerName},\n\nHóa đơn {invoiceCode} trị giá {amount} đã QUÁ HẠN {daysOverdue} ngày.\n\nVui lòng thanh toán ngay để tránh áp dụng phí phạt chậm thanh toán. Liên hệ: 1900-xxxx.",
    smsContent: "[TNPM] HĐ {invoiceCode} {amount} quá hạn {daysOverdue}d. Thanh toán ngay để tránh phạt. LH 1900-xxxx",
    enabled: true, createdAt: "2024-01-20",
  },
  {
    id: 4, code: "TPL-DEBT-OVERDUE-2", name: "Nhắc nợ quá hạn lần 2 (8-30 ngày)", category: "debt_overdue",
    channels: ["sms", "email", "zalo"],
    subject: "[TNPM] QUÁ HẠN NGHIÊM TRỌNG: HĐ {invoiceCode}",
    content: "Kính gửi {customerName},\n\nHóa đơn {invoiceCode} trị giá {amount} đã QUÁ HẠN {daysOverdue} ngày.\n\nĐây là thông báo lần 2. Nếu không thanh toán trong 7 ngày tới, chúng tôi buộc phải áp dụng các biện pháp xử lý theo hợp đồng (tính lãi chậm thanh toán, tạm ngừng dịch vụ).\n\nLiên hệ ngay: 1900-xxxx",
    smsContent: "[TNPM] CẢNH BÁO: HĐ {invoiceCode} quá hạn {daysOverdue}d. TT ngay, nếu không sẽ áp dụng biện pháp.",
    enabled: true, createdAt: "2024-01-20",
  },
  {
    id: 5, code: "TPL-DEBT-OVERDUE-3", name: "Nhắc nợ cuối cùng (>30 ngày)", category: "debt_overdue",
    channels: ["email"],
    subject: "[TNPM] THÔNG BÁO CUỐI CÙNG — HĐ {invoiceCode}",
    content: "Kính gửi {customerName},\n\nĐây là thông báo cuối cùng về HĐ {invoiceCode} trị giá {amount} đã quá hạn {daysOverdue} ngày.\n\nNếu không thanh toán trong vòng 3 ngày, TNPM sẽ chính thức chuyển sang bộ phận pháp chế để xử lý theo đúng hợp đồng đã ký.\n\nLiên hệ khẩn: 0987-xxx-xxx",
    smsContent: "",
    enabled: true, createdAt: "2024-01-20",
  },
  {
    id: 6, code: "TPL-LEASE-RENEWAL", name: "Thông báo gia hạn HĐ thuê", category: "renewal",
    channels: ["email", "zalo"],
    subject: "[TNPM] Thông báo gia hạn HĐ thuê {invoiceCode}",
    content: "Kính gửi {customerName},\n\nHĐ thuê {invoiceCode} tại {projectName} sẽ hết hạn vào {dueDate} (còn {daysOverdue} ngày).\n\nĐể tiếp tục sử dụng dịch vụ, quý khách vui lòng liên hệ TNPM trước {daysOverdue} ngày để thỏa thuận gia hạn.\n\nLiên hệ: 024-xxxxxxx",
    smsContent: "",
    enabled: true, createdAt: "2024-02-01",
  },
  {
    id: 7, code: "TPL-SR-UPDATE", name: "Cập nhật tiến độ SR", category: "operational",
    channels: ["push", "zalo"],
    subject: "[TNPM] SR #{invoiceCode} đã được cập nhật",
    content: "Yêu cầu dịch vụ #{invoiceCode} của quý khách đã được xử lý. Vui lòng mở app TNPM để xem chi tiết.",
    smsContent: "",
    enabled: true, createdAt: "2024-02-10",
  },
];

// ─── NOTIFICATION SEGMENTS (Phân khúc khách hàng để gửi thông báo) ───────
export const MOCK_NOTIFICATION_SEGMENTS = [
  {
    id: 1, name: "KH còn nợ quá hạn 1-7 ngày", description: "Công nợ phải thu quá hạn dưới 1 tuần",
    filters: { debtStatus: "overdue", overdueDays: { min: 1, max: 7 }, customerType: "all" },
    estimatedCount: 3, lastUsedAt: "2024-04-10", createdBy: "Phạm Thu Ngân",
  },
  {
    id: 2, name: "KH nợ quá hạn >7 ngày (nghiêm trọng)", description: "Cần xử lý ngay, chuyển pháp chế sau 30 ngày",
    filters: { debtStatus: "overdue", overdueDays: { min: 8, max: 30 }, customerType: "all" },
    estimatedCount: 2, lastUsedAt: "2024-04-08", createdBy: "Phạm Thu Ngân",
  },
  {
    id: 3, name: "KH có HĐ sắp đến hạn (≤ 7 ngày)", description: "Nhắc đóng phí tháng hiện tại",
    filters: { debtStatus: "upcoming", dueDays: { min: 0, max: 7 }, customerType: "all" },
    estimatedCount: 5, lastUsedAt: "2024-04-01", createdBy: "Hệ thống",
  },
  {
    id: 4, name: "Tenant TTTM (ROX Mall + AEON)", description: "Chỉ tenant bán lẻ",
    filters: { projectType: "retail", customerType: "b2b" },
    estimatedCount: 180, lastUsedAt: "2024-03-15", createdBy: "Marketing Team",
  },
  {
    id: 5, name: "HĐ thuê sắp hết hạn trong 60 ngày", description: "Nhắc gia hạn",
    filters: { leaseStatus: "active", daysToExpire: { min: 0, max: 60 } },
    estimatedCount: 1, lastUsedAt: null, createdBy: "Phạm Thu Ngân",
  },
  {
    id: 6, name: "Tất cả cư dân Vinhomes City Park", description: "Segment chung cư",
    filters: { projectId: 1, customerType: "b2c" },
    estimatedCount: 412, lastUsedAt: "2024-03-30", createdBy: "BQL VCity",
  },
];

// ─── NOTIFICATION CAMPAIGNS / BROADCASTS ────────────────────────────────
// status: "draft" | "scheduled" | "sending" | "sent" | "failed"
export const MOCK_NOTIFICATION_CAMPAIGNS = [
  {
    id: 1, code: "CMP-2024-001", name: "Nhắc nợ quá hạn tháng 3 - lần 1",
    templateId: 3, templateName: "Nhắc nợ quá hạn lần 1 (1-7 ngày)",
    segmentId: 1, segmentName: "KH còn nợ quá hạn 1-7 ngày",
    channels: ["sms", "email", "zalo"],
    scheduleType: "once", scheduledAt: "2024-04-02 08:00:00",
    recurringRule: null,
    status: "sent",
    sentAt: "2024-04-02 08:00:12",
    recipientCount: 3, successCount: 3, failCount: 0, openCount: 2, clickCount: 1,
    createdBy: "Phạm Thu Ngân", createdAt: "2024-04-01 14:30",
    note: "Nhắc các KH có HĐ tháng 3 quá hạn",
  },
  {
    id: 2, code: "CMP-2024-002", name: "Nhắc nợ quá hạn nghiêm trọng",
    templateId: 4, templateName: "Nhắc nợ quá hạn lần 2 (8-30 ngày)",
    segmentId: 2, segmentName: "KH nợ quá hạn >7 ngày",
    channels: ["sms", "email", "zalo"],
    scheduleType: "once", scheduledAt: "2024-04-08 09:00:00",
    recurringRule: null,
    status: "sent",
    sentAt: "2024-04-08 09:00:05",
    recipientCount: 2, successCount: 2, failCount: 0, openCount: 2, clickCount: 0,
    createdBy: "Phạm Thu Ngân", createdAt: "2024-04-07 16:00",
    note: "AEON Thời Trang Việt & ABC Technology",
  },
  {
    id: 3, code: "CMP-2024-003", name: "Thông báo phí tháng 4 - toàn bộ VCity",
    templateId: 1, templateName: "Thông báo phí hàng tháng",
    segmentId: 6, segmentName: "Tất cả cư dân Vinhomes City Park",
    channels: ["sms", "zalo"],
    scheduleType: "recurring", scheduledAt: "2024-04-15 08:00:00",
    recurringRule: "Hàng tháng, ngày 15, lúc 08:00",
    status: "scheduled",
    sentAt: null,
    recipientCount: 412, successCount: 0, failCount: 0, openCount: 0, clickCount: 0,
    createdBy: "BQL VCity", createdAt: "2024-04-01 09:00",
    note: "Gửi thông báo phí định kỳ đầu tháng",
  },
  {
    id: 4, code: "CMP-2024-004", name: "Nhắc gia hạn HĐ thuê sắp hết",
    templateId: 6, templateName: "Thông báo gia hạn HĐ thuê",
    segmentId: 5, segmentName: "HĐ thuê sắp hết hạn trong 60 ngày",
    channels: ["email", "zalo"],
    scheduleType: "once", scheduledAt: "2024-04-16 10:00:00",
    recurringRule: null,
    status: "draft",
    sentAt: null,
    recipientCount: 1, successCount: 0, failCount: 0, openCount: 0, clickCount: 0,
    createdBy: "Phạm Thu Ngân", createdAt: "2024-04-13 11:20",
    note: "Thời Trang Việt - AEON expires 31/01/2025",
  },
];

// ─── AUTO RULES (Quy tắc tự động gửi thông báo) ──────────────────────────
// trigger: "debt_overdue_N_days" | "lease_expire_N_days" | "fee_due_N_days" | "sr_status_change"
export const MOCK_NOTIFICATION_RULES = [
  {
    id: 1, name: "Auto nhắc trước 3 ngày đến hạn", trigger: "fee_due_3_days",
    triggerLabel: "Khi HĐ còn 3 ngày đến hạn",
    templateId: 2, templateName: "Nhắc nợ lần 1 (3 ngày trước hạn)",
    channels: ["sms", "zalo"],
    enabled: true, lastRunAt: "2024-04-12 08:00",
    totalSent: 156, createdAt: "2024-02-01",
  },
  {
    id: 2, name: "Auto nhắc khi quá hạn 1 ngày", trigger: "debt_overdue_1_days",
    triggerLabel: "Khi công nợ vừa quá hạn 1 ngày",
    templateId: 3, templateName: "Nhắc nợ quá hạn lần 1",
    channels: ["sms", "email", "zalo"],
    enabled: true, lastRunAt: "2024-04-14 08:00",
    totalSent: 42, createdAt: "2024-02-01",
  },
  {
    id: 3, name: "Auto nhắc khi quá hạn 8 ngày", trigger: "debt_overdue_8_days",
    triggerLabel: "Khi công nợ quá hạn 8 ngày",
    templateId: 4, templateName: "Nhắc nợ quá hạn lần 2",
    channels: ["sms", "email"],
    enabled: true, lastRunAt: "2024-04-14 08:00",
    totalSent: 18, createdAt: "2024-02-01",
  },
  {
    id: 4, name: "Auto nhắc gia hạn trước 60 ngày", trigger: "lease_expire_60_days",
    triggerLabel: "Khi HĐ thuê còn 60 ngày hết hạn",
    templateId: 6, templateName: "Thông báo gia hạn HĐ thuê",
    channels: ["email", "zalo"],
    enabled: true, lastRunAt: "2024-04-10 08:00",
    totalSent: 4, createdAt: "2024-02-10",
  },
  {
    id: 5, name: "Auto nhắc cuối cùng quá hạn 30 ngày", trigger: "debt_overdue_30_days",
    triggerLabel: "Khi công nợ quá hạn 30 ngày",
    templateId: 5, templateName: "Nhắc nợ cuối cùng (>30 ngày)",
    channels: ["email"],
    enabled: false, lastRunAt: null,
    totalSent: 0, createdAt: "2024-03-01",
  },
];

// ─── NOTIFICATION HISTORY (Log lịch sử gửi) ──────────────────────────────
export const MOCK_NOTIFICATION_HISTORY = [
  {
    id: 1, campaignId: 1, campaignCode: "CMP-2024-001",
    recipientName: "ABC Technology", recipientContact: "contact@abctech.vn",
    channel: "email", templateName: "Nhắc nợ quá hạn lần 1",
    content: "[TNPM] QUÁ HẠN: HĐ HD-2024-002 đã quá hạn 9 ngày",
    status: "delivered", sentAt: "2024-04-02 08:00:15",
    openedAt: "2024-04-02 09:15:22", clickedAt: "2024-04-02 09:16:01",
  },
  {
    id: 2, campaignId: 1, campaignCode: "CMP-2024-001",
    recipientName: "ABC Technology", recipientContact: "0987654321",
    channel: "sms", templateName: "Nhắc nợ quá hạn lần 1",
    content: "[TNPM] HĐ HD-2024-002 165tr quá hạn 9d. Thanh toán ngay để tránh phạt.",
    status: "delivered", sentAt: "2024-04-02 08:00:18",
    openedAt: null, clickedAt: null,
  },
  {
    id: 3, campaignId: 1, campaignCode: "CMP-2024-001",
    recipientName: "Thời Trang Việt", recipientContact: "manager@thoitrangviet.vn",
    channel: "email", templateName: "Nhắc nợ quá hạn lần 1",
    content: "[TNPM] QUÁ HẠN: HĐ HD-2024-004",
    status: "delivered", sentAt: "2024-04-02 08:00:20",
    openedAt: "2024-04-02 11:03:45", clickedAt: null,
  },
  {
    id: 4, campaignId: 2, campaignCode: "CMP-2024-002",
    recipientName: "ABC Technology", recipientContact: "contact@abctech.vn",
    channel: "email", templateName: "Nhắc nợ quá hạn lần 2",
    content: "[TNPM] QUÁ HẠN NGHIÊM TRỌNG",
    status: "delivered", sentAt: "2024-04-08 09:00:10",
    openedAt: "2024-04-08 14:20:00", clickedAt: "2024-04-08 14:21:15",
  },
  {
    id: 5, campaignId: 2, campaignCode: "CMP-2024-002",
    recipientName: "Thời Trang Việt", recipientContact: "0923123123",
    channel: "zalo", templateName: "Nhắc nợ quá hạn lần 2",
    content: "[TNPM] CẢNH BÁO: HĐ HD-2024-004 quá hạn 23d",
    status: "delivered", sentAt: "2024-04-08 09:00:12",
    openedAt: "2024-04-08 09:05:33", clickedAt: null,
  },
];

// ─── FUNDS (Quỹ nhận tiền — phục vụ form ghi nhận thu nợ) ────────────────
export const MOCK_FUNDS = [
  { id: 1, name: "TK MSB - TNPM chính", type: "bank", balance: 12800000000, currency: "VND" },
  { id: 2, name: "Quỹ tiền mặt VP chính", type: "cash", balance: 45000000, currency: "VND" },
  { id: 3, name: "TK Vietcombank - Dự án Goldmark", type: "bank", balance: 3200000000, currency: "VND" },
  { id: 4, name: "TK BIDV - Dự án Vinhomes", type: "bank", balance: 2450000000, currency: "VND" },
];