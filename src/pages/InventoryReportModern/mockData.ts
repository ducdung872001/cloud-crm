export const GROUP_OPTIONS = [
  { value: "month", label: "Theo tháng" },
  { value: "week", label: "Theo tuần" },
  { value: "day", label: "Theo ngày" },
];

export const WAREHOUSE_OPTIONS = [
  { value: 0, label: "Tất cả kho" },
  { value: 1, label: "Kho trung tâm" },
  { value: 2, label: "Kho Hà Nội" },
  { value: 3, label: "Kho Đà Nẵng" },
  { value: 4, label: "Kho online" },
];

export const MOVEMENT_DATA = [
  { label: "T10", importQty: 1650, exportQty: 1240, adjustmentQty: 35, closingQty: 2015 },
  { label: "T11", importQty: 1820, exportQty: 1395, adjustmentQty: 28, closingQty: 2140 },
  { label: "T12", importQty: 2050, exportQty: 1625, adjustmentQty: 44, closingQty: 2278 },
  { label: "T01", importQty: 2180, exportQty: 1710, adjustmentQty: 32, closingQty: 2395 },
  { label: "T02", importQty: 1960, exportQty: 1540, adjustmentQty: 21, closingQty: 2460 },
  { label: "T03", importQty: 2240, exportQty: 1815, adjustmentQty: 39, closingQty: 2580 },
];

export const HEALTH_DATA = [
  { name: "Ổn định", y: 18, color: "#10b981" },
  { name: "Cần theo dõi", y: 9, color: "#f59e0b" },
  { name: "Sắp thiếu", y: 4, color: "#ef4444" },
];

export const WAREHOUSE_DATA = [
  { name: "Kho trung tâm", closingQty: 2640, stockValue: 1850000000 },
  { name: "Kho Hà Nội", closingQty: 980, stockValue: 620000000 },
  { name: "Kho Đà Nẵng", closingQty: 720, stockValue: 418000000 },
  { name: "Kho online", closingQty: 410, stockValue: 267000000 },
];

export const PRODUCT_ROWS = [
  { sku: "SP-001", productName: "Serum phục hồi da", warehouseName: "Kho trung tâm", closingQty: 420, availableQty: 388, stockValue: 264000000, turnoverDays: 21, status: "Ổn định", color: "#10b981" },
  { sku: "SP-014", productName: "Kem chống nắng SPF50", warehouseName: "Kho Hà Nội", closingQty: 82, availableQty: 70, stockValue: 45920000, turnoverDays: 46, status: "Cần theo dõi", color: "#f59e0b" },
  { sku: "SP-122", productName: "Tinh dầu trị liệu", warehouseName: "Kho online", closingQty: 24, availableQty: 18, stockValue: 12750000, turnoverDays: 65, status: "Sắp thiếu", color: "#ef4444" },
  { sku: "SP-075", productName: "Combo dưỡng ẩm chuyên sâu", warehouseName: "Kho trung tâm", closingQty: 138, availableQty: 125, stockValue: 103500000, turnoverDays: 34, status: "Ổn định", color: "#10b981" },
];

export const INVENTORY_KPIS = [
  { label: "Tổng nhập trong kỳ", value: "9.860", note: "Số lượng nhập kho" },
  { label: "Tổng xuất trong kỳ", value: "7.325", note: "Số lượng xuất kho" },
  { label: "Tồn cuối kỳ", value: "4.750", note: "Số lượng còn lại" },
  { label: "Giá trị tồn kho", value: 3155000000, note: "Giá vốn đang lưu kho", isCurrency: true },
  { label: "Cảnh báo dưới ngưỡng", value: "34", note: "SKU cần bổ sung" },
];
