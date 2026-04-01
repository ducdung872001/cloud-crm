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
  },
  {
    id: 2, code: "HD-THUE-002", customerId: 1, customerName: "Công ty TNHH ABC Technology", projectId: 2, unitId: 5, unitCode: "TA-0201",
    contractType: "office", startDate: "2024-03-01", endDate: "2027-02-28", rentAmount: 50000000,
    depositAmount: 150000000, paymentTerms: "quarterly", reviewClause: 3, escalationRate: 8,
    status: "active", signedDate: "2024-02-15", note: "Review giá mỗi 3 năm +8%", attachments: [],
  },
  {
    id: 3, code: "HD-THUE-003", customerId: 3, customerName: "Samsung Electronics VN", projectId: 3, unitId: 8, unitCode: "F1-001",
    contractType: "industrial", startDate: "2023-06-01", endDate: "2028-05-31", rentAmount: 75000000,
    depositAmount: 450000000, paymentTerms: "quarterly", reviewClause: 5, escalationRate: 5,
    status: "active", signedDate: "2023-05-20", note: "Hợp đồng dài hạn 5 năm", attachments: [],
  },
  {
    id: 4, code: "HD-THUE-004", customerId: 4, customerName: "Thời Trang Việt", projectId: 4, unitId: 10, unitCode: "AEON-G001",
    contractType: "retail", startDate: "2024-02-01", endDate: "2025-01-31", rentAmount: 80000000,
    depositAmount: 160000000, paymentTerms: "monthly", reviewClause: 1, escalationRate: 0,
    status: "active", signedDate: "2024-01-20", note: "Phí doanh thu: 8% turnover", attachments: [],
    turnoverRentRate: 8,
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
