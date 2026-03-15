export const ProductLabel = {
  new: {
    label: "Mới",
    color: "success"
  },
  hot: {
    label: "Bán chạy",
    color: "error"
  },
  sale: {
    label: "Khuyến mãi",
    color: "warning"
  }
}

export const PRODUCT_DETAIL_CONFIG = [
  { key: "showImage", label: "Hiển thị hình ảnh sản phẩm", defaultValue: true },
  { key: "showUnit", label: "Hiển thị đơn vị tính", defaultValue: true },
  { key: "showDesc", label: "Hiển thị mô tả chi tiết", defaultValue: true },
  { key: "showSalePrice", label: "Hiển thị giá khuyến mãi", defaultValue: false },
  { key: "showCost", label: "Hiển thị giá sỉ", defaultValue: false },
  { key: "showInventory", label: "Hiển thị số lượng tồn kho", defaultValue: true },
  { key: "showBarcode", label: "Hiển thị mã vạch / barcode", defaultValue: false },
  { key: "showCategory", label: "Hiển thị danh mục / nhóm", defaultValue: true },
  { key: "showSoldCount", label: "Hiển thị số lượng đã bán", defaultValue: true },
  { key: "autoHideOutOfStock", label: "Tự động ẩn sản phẩm hết hàng", defaultValue: true },
];

export const MOCK_PRODUCT_CATEGORIES = [
  { id: 1, name: "Thực phẩm", position: 1, status: 1, productCount: 12 },
  { id: 2, name: "Đồ uống", position: 2, status: 1, productCount: 8 },
  { id: 3, name: "Dược phẩm", position: 3, status: 1, productCount: 5 },
  { id: 4, name: "Mỹ phẩm", position: 4, status: 0, productCount: 3 },
  { id: 5, name: "Đồ gia dụng", position: 5, status: 1, productCount: 20 },
  { id: 6, name: "Điện tử", position: 6, status: 1, productCount: 15 },
  { id: 7, name: "Thời trang", position: 7, status: 0, productCount: 7 },
  { id: 8, name: "Văn phòng phẩm", position: 8, status: 1, productCount: 9 },
  { id: 9, name: "Thể thao", position: 9, status: 1, productCount: 6 },
  { id: 10, name: "Đồ chơi", position: 10, status: 0, productCount: 4 },
];

// assets/mock/WarehouseBook.ts

export interface IWarehouseBook {
  id: number;
  code: string;                   // mã phiếu
  type: "import" | "export" | "transfer" | "adjust" | "return_from_supplier" | "return_to_customer";
  productId: number;
  productName: string;
  productCode: string;            // SKU
  quantity: number;               // biến động SL (+/-)
  unitName: string;
  warehouseFrom?: string;         // kho nguồn (chuyển kho)
  warehouseTo?: string;           // kho đích (chuyển kho)
  warehouseName: string;          // kho thực hiện
  stockBefore: number;            // tồn trước
  stockAfter: number;             // tồn sau
  createdBy: string;              // người thực hiện
  createdAt: string;
  status: 0 | 1;                  // 0: hủy, 1: hoàn thành
  // Đối tác
  partnerName?: string;
  partnerType?: "supplier" | "customer";
  // Ref tài chính — link thay thế cho text cũ
  refFinancial?: { code: string; url?: string };
  // Nhập kho
  batchNo?: string;               // số lô
  expiryDate?: string;            // hạn dùng
  // Chuyển kho
  transferStatus?: "in_transit" | "received";
  approver?: string;              // người phê duyệt
  // Điều chỉnh
  stockSystem?: number;           // tồn hệ thống trước điều chỉnh
  stockActual?: number;           // tồn thực tế sau kiểm đếm
  adjustReason?: string;          // lý do điều chỉnh
  // Hoàn trả (NCC + KH)
  returnReason?: string;
  // Hoàn xuất KH
  warehouseReturn?: string;       // kho nhập lại
  condition?: "usable" | "damaged"; // tình trạng hàng
}

export const MOCK_WAREHOUSE_BOOK: IWarehouseBook[] = [
  // ── NHẬP KHO ──────────────────────────────────────────────
  {
    id: 1, code: "NK001", type: "import",
    productId: 1, productName: "Thuốc trị sẹo", productCode: "SP-SCAR-01",
    quantity: 100, unitName: "Hộp",
    warehouseName: "Kho trung tâm",
    stockBefore: 50, stockAfter: 150,
    batchNo: "LOT-2026-01", expiryDate: "2028-01-01",
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-05 08:30", status: 1,
    partnerName: "NCC Minh Anh", partnerType: "supplier",
    refFinancial: { code: "HD-NK-001", url: "/product-import/HD-NK-001" },
  },
  {
    id: 2, code: "NK002", type: "import",
    productId: 5, productName: "Vitamin C 1000mg", productCode: "SP-VTC-05",
    quantity: 200, unitName: "Hộp",
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 30, stockAfter: 230,
    batchNo: "LOT-2026-02", expiryDate: "2027-06-30",
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-10 08:00", status: 1,
    partnerName: "NCC Pharma Plus", partnerType: "supplier",
    refFinancial: { code: "HD-NK-002", url: "/product-import/HD-NK-002" },
  },
  {
    id: 3, code: "NK003", type: "import",
    productId: 8, productName: "Cồn y tế 70%", productCode: "SP-CON-08",
    quantity: 300, unitName: "Chai",
    warehouseName: "Kho trung tâm",
    stockBefore: 100, stockAfter: 400,
    batchNo: "LOT-2026-03", expiryDate: "2029-12-31",
    createdBy: "Lê Văn Cường", createdAt: "2026-01-20 08:00", status: 1,
    partnerName: "NCC Hóa chất Bắc Việt", partnerType: "supplier",
    refFinancial: { code: "HD-NK-003", url: "/product-import/HD-NK-003" },
  },

  // ── XUẤT KHO ──────────────────────────────────────────────
  {
    id: 4, code: "XK001", type: "export",
    productId: 2, productName: "Găng tay y tế", productCode: "SP-GT-02",
    quantity: -30, unitName: "Hộp",
    warehouseName: "Kho trung tâm",
    stockBefore: 200, stockAfter: 170,
    createdBy: "Trần Thị Bình", createdAt: "2026-01-06 09:15", status: 1,
    partnerName: "Phòng khám Đa khoa Bình Minh", partnerType: "customer",
    refFinancial: { code: "HD-XK-001", url: "/sell/HD-XK-001" },
  },
  {
    id: 5, code: "XK002", type: "export",
    productId: 1, productName: "Thuốc trị sẹo", productCode: "SP-SCAR-01",
    quantity: -20, unitName: "Hộp",
    warehouseName: "Kho trung tâm",
    stockBefore: 150, stockAfter: 130,
    createdBy: "Trần Thị Bình", createdAt: "2026-01-12 11:30", status: 1,
    partnerName: "Đại lý Minh Phương", partnerType: "customer",
    refFinancial: { code: "HD-XK-002", url: "/sell/HD-XK-002" },
  },
  {
    id: 6, code: "XK003", type: "export",
    productId: 3, productName: "Khẩu trang N95", productCode: "SP-KT-03",
    quantity: -100, unitName: "Cái",
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 250, stockAfter: 150,
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-15 13:00", status: 0,
    partnerName: "Trường THPT Lê Lợi", partnerType: "customer",
    refFinancial: { code: "HD-XK-003", url: "/sell/HD-XK-003" },
  },

  // ── CHUYỂN KHO ────────────────────────────────────────────
  {
    id: 7, code: "CK001", type: "transfer",
    productId: 3, productName: "Khẩu trang N95", productCode: "SP-KT-03",
    quantity: -50, unitName: "Cái",
    warehouseFrom: "Kho trung tâm", warehouseTo: "Kho chi nhánh 1",
    warehouseName: "Kho trung tâm",
    stockBefore: 300, stockAfter: 250,
    createdBy: "Lê Văn Cường", createdAt: "2026-01-07 10:00", status: 1,
    transferStatus: "received",
    approver: "Giám đốc Hoàng Minh",
  },
  {
    id: 8, code: "CK002", type: "transfer",
    productId: 5, productName: "Vitamin C 1000mg", productCode: "SP-VTC-05",
    quantity: -80, unitName: "Hộp",
    warehouseFrom: "Kho chi nhánh 1", warehouseTo: "Kho chi nhánh 2",
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 230, stockAfter: 150,
    createdBy: "Trần Thị Bình", createdAt: "2026-01-18 10:30", status: 1,
    transferStatus: "in_transit",
    approver: "Trưởng kho Nguyễn Hà",
  },

  // ── ĐIỀU CHỈNH ────────────────────────────────────────────
  {
    id: 9, code: "DC001", type: "adjust",
    productId: 7, productName: "Oxy già 3%", productCode: "SP-OXY-07",
    quantity: 10, unitName: "Chai",
    warehouseName: "Kho trung tâm",
    stockBefore: 60, stockAfter: 70,
    stockSystem: 60, stockActual: 70,
    adjustReason: "Tìm thấy hàng thừa sau kiểm kê tháng 1",
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-16 15:00", status: 1,
    approver: "Trưởng kho Nguyễn Hà",
    refFinancial: { code: "KK-2026-01", url: "/stock-audit/KK-2026-01" },
  },
  {
    id: 10, code: "DC002", type: "adjust",
    productId: 2, productName: "Găng tay y tế", productCode: "SP-GT-02",
    quantity: -10, unitName: "Hộp",
    warehouseName: "Kho trung tâm",
    stockBefore: 170, stockAfter: 160,
    stockSystem: 170, stockActual: 160,
    adjustReason: "Hàng bị hư hỏng, ẩm mốc sau kiểm kê",
    createdBy: "Lê Văn Cường", createdAt: "2026-01-26 14:30", status: 1,
    approver: "Giám đốc Hoàng Minh",
    refFinancial: { code: "KK-2026-02", url: "/stock-audit/KK-2026-02" },
  },

  // ── HOÀN NHẬP — NCC ───────────────────────────────────────
  {
    id: 11, code: "HN001", type: "return_from_supplier",
    productId: 4, productName: "Nước muối sinh lý", productCode: "SP-NM-04",
    quantity: -5, unitName: "Chai",
    warehouseName: "Kho trung tâm",
    stockBefore: 80, stockAfter: 75,
    returnReason: "Hàng sai quy cách, lô bị lỗi in nhãn",
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-08 14:00", status: 1,
    partnerName: "NCC Minh Anh", partnerType: "supplier",
    refFinancial: { code: "HD-NK-001", url: "/product-import/HD-NK-001" },
  },
  {
    id: 12, code: "HN002", type: "return_from_supplier",
    productId: 6, productName: "Băng dính y tế", productCode: "SP-BD-06",
    quantity: -15, unitName: "Cuộn",
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 170, stockAfter: 155,
    returnReason: "Hàng bị ẩm, không đảm bảo chất lượng",
    createdBy: "Lê Văn Cường", createdAt: "2026-01-14 09:00", status: 1,
    partnerName: "NCC Y tế Bắc Nam", partnerType: "supplier",
    refFinancial: { code: "HD-NK-004", url: "/product-import/HD-NK-004" },
  },

  // ── HOÀN XUẤT — KH ────────────────────────────────────────
  {
    id: 13, code: "HX001", type: "return_to_customer",
    productId: 1, productName: "Thuốc trị sẹo", productCode: "SP-SCAR-01",
    quantity: 5, unitName: "Hộp",
    warehouseName: "Kho trung tâm",
    stockBefore: 130, stockAfter: 135,
    returnReason: "Khách nhận sai sản phẩm so với đơn hàng",
    warehouseReturn: "Kho trung tâm",
    condition: "usable",
    createdBy: "Trần Thị Bình", createdAt: "2026-01-22 10:00", status: 1,
    partnerName: "Phòng khám Đa khoa Bình Minh", partnerType: "customer",
    refFinancial: { code: "HD-XK-001", url: "/sell/HD-XK-001" },
  },
  {
    id: 14, code: "HX002", type: "return_to_customer",
    productId: 9, productName: "Paracetamol 500mg", productCode: "SP-PAR-09",
    quantity: 10, unitName: "Vỉ",
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 600, stockAfter: 610,
    returnReason: "Sản phẩm bị lỗi, khách hàng phản ánh",
    warehouseReturn: "Kho chi nhánh 2",
    condition: "damaged",
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-28 11:00", status: 1,
    partnerName: "Nhà thuốc Sức Khỏe Vàng", partnerType: "customer",
    refFinancial: { code: "HD-XK-005", url: "/sell/HD-XK-005" },
  },
];

// assets/mock/InventoryData.ts

export interface IStockItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;
  currentStock: number;   // tồn hiện tại
  avgCost: number;        // giá vốn bình quân
  warehouseId: number;
  warehouseName: string;
}

export interface IImportOrder {
  id: number;
  code: string;
  supplierName: string;
  warehouseName: string;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  status: 0 | 1 | 2; // 0: nháp, 1: hoàn thành, 2: hủy
  items: IImportOrderItem[];
}

export interface IImportOrderItem {
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;
  quantity: number;
  priceUnit: number;
  totalAmount: number;
  stockBefore: number;
  stockAfter: number;
}

export interface IExportOrder {
  id: number;
  code: string;
  customerName: string;
  warehouseName: string;
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  status: 0 | 1 | 2;
  items: IExportOrderItem[];
}

export interface IExportOrderItem {
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;
  quantity: number;
  priceUnit: number;        // giá bán
  avgCost: number;          // giá vốn tại thời điểm xuất
  totalAmount: number;
  stockBefore: number;
  stockAfter: number;
}

export interface IStockCheckItem {
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;
  systemStock: number;   // tồn hệ thống
  actualStock: number;   // tồn thực tế
  difference: number;    // chênh lệch
  avgCost: number;
  diffAmount: number;    // giá trị chênh lệch
}

// =====================
// MOCK DATA
// =====================
export const MOCK_STOCK: IStockItem[] = [
  { id: 1, productId: 1, productName: "Thuốc trị sẹo", productCode: "PRODUCT01", unitName: "Hộp", currentStock: 130, avgCost: 145000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 2, productId: 2, productName: "Găng tay y tế", productCode: "PRODUCT02", unitName: "Hộp", currentStock: 160, avgCost: 75000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 3, productId: 3, productName: "Khẩu trang N95", productCode: "PRODUCT03", unitName: "Cái", currentStock: 150, avgCost: 23000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 4, productId: 4, productName: "Nước muối sinh lý", productCode: "PRODUCT04", unitName: "Chai", currentStock: 275, avgCost: 14000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 5, productId: 5, productName: "Vitamin C 1000mg", productCode: "PRODUCT05", unitName: "Hộp", currentStock: 150, avgCost: 118000, warehouseId: 2, warehouseName: "Kho chi nhánh 1" },
  { id: 6, productId: 6, productName: "Băng dính y tế", productCode: "PRODUCT06", unitName: "Cuộn", currentStock: 130, avgCost: 19000, warehouseId: 2, warehouseName: "Kho chi nhánh 2" },
  { id: 7, productId: 7, productName: "Oxy già 3%", productCode: "PRODUCT07", unitName: "Chai", currentStock: 70, avgCost: 17000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 8, productId: 8, productName: "Cồn y tế 70%", productCode: "PRODUCT08", unitName: "Chai", currentStock: 250, avgCost: 21000, warehouseId: 1, warehouseName: "Kho trung tâm" },
  { id: 9, productId: 9, productName: "Paracetamol 500mg", productCode: "PRODUCT09", unitName: "Vỉ", currentStock: 600, avgCost: 7500, warehouseId: 2, warehouseName: "Kho chi nhánh 2" },
  { id: 10, productId: 10, productName: "Dầu gió xanh", productCode: "PRODUCT10", unitName: "Lọ", currentStock: 165, avgCost: 33000, warehouseId: 2, warehouseName: "Kho chi nhánh 1" },
];

export const MOCK_IMPORT_ORDERS: IImportOrder[] = [
  {
    id: 1, code: "PNK001", supplierName: "NCC Minh Anh",
    warehouseName: "Kho trung tâm", totalAmount: 15000000,
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-05 08:30", status: 1,
    items: [
      { productId: 1, productName: "Thuốc trị sẹo", productCode: "PRODUCT01", unitName: "Hộp", quantity: 100, priceUnit: 150000, totalAmount: 15000000, stockBefore: 50, stockAfter: 150 },
    ],
  },
  {
    id: 2, code: "PNK002", supplierName: "NCC Phúc Khang",
    warehouseName: "Kho chi nhánh 1", totalAmount: 24000000,
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-10 08:00", status: 1,
    items: [
      { productId: 5, productName: "Vitamin C 1000mg", productCode: "PRODUCT05", unitName: "Hộp", quantity: 200, priceUnit: 120000, totalAmount: 24000000, stockBefore: 30, stockAfter: 230 },
    ],
  },
  {
    id: 3, code: "PNK003", supplierName: "NCC Bình Dương",
    warehouseName: "Kho chi nhánh 2", totalAmount: 3000000,
    createdBy: "Lê Văn Cường", createdAt: "2026-01-14 09:00", status: 1,
    items: [
      { productId: 6, productName: "Băng dính y tế", productCode: "PRODUCT06", unitName: "Cuộn", quantity: 150, priceUnit: 20000, totalAmount: 3000000, stockBefore: 20, stockAfter: 170 },
    ],
  },
  {
    id: 4, code: "PNK004", supplierName: "NCC Minh Anh",
    warehouseName: "Kho trung tâm", totalAmount: 6600000,
    createdBy: "Lê Văn Cường", createdAt: "2026-01-20 08:00", status: 1,
    items: [
      { productId: 8, productName: "Cồn y tế 70%", productCode: "PRODUCT08", unitName: "Chai", quantity: 300, priceUnit: 22000, totalAmount: 6600000, stockBefore: 100, stockAfter: 400 },
    ],
  },
  {
    id: 5, code: "PNK005", supplierName: "NCC Hoàng Long",
    warehouseName: "Kho chi nhánh 2", totalAmount: 4000000,
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-23 08:30", status: 1,
    items: [
      { productId: 9, productName: "Paracetamol 500mg", productCode: "PRODUCT09", unitName: "Vỉ", quantity: 500, priceUnit: 8000, totalAmount: 4000000, stockBefore: 200, stockAfter: 700 },
    ],
  },
  {
    id: 6, code: "PNK006", supplierName: "NCC Phúc Khang",
    warehouseName: "Kho chi nhánh 1", totalAmount: 4200000,
    createdBy: "Nguyễn Văn An", createdAt: "2026-01-29 08:00", status: 1,
    items: [
      { productId: 10, productName: "Dầu gió xanh", productCode: "PRODUCT10", unitName: "Lọ", quantity: 120, priceUnit: 35000, totalAmount: 4200000, stockBefore: 40, stockAfter: 160 },
    ],
  },
  {
    id: 7, code: "PNK007", supplierName: "NCC Bình Dương",
    warehouseName: "Kho trung tâm", totalAmount: 3000000,
    createdBy: "Phạm Thị Dung", createdAt: "2026-02-03 08:30", status: 1,
    items: [
      { productId: 4, productName: "Nước muối sinh lý", productCode: "PRODUCT04", unitName: "Chai", quantity: 200, priceUnit: 15000, totalAmount: 3000000, stockBefore: 75, stockAfter: 275 },
    ],
  },
  {
    id: 8, code: "PNK008", supplierName: "NCC Minh Anh",
    warehouseName: "Kho trung tâm", totalAmount: 7500000,
    createdBy: "Lê Văn Cường", createdAt: "2026-02-10 09:00", status: 0, // nháp
    items: [
      { productId: 2, productName: "Găng tay y tế", productCode: "PRODUCT02", unitName: "Hộp", quantity: 100, priceUnit: 75000, totalAmount: 7500000, stockBefore: 160, stockAfter: 260 },
      { productId: 3, productName: "Khẩu trang N95", productCode: "PRODUCT03", unitName: "Cái", quantity: 200, priceUnit: 0, totalAmount: 0, stockBefore: 150, stockAfter: 350 },
    ],
  },
];

export const MOCK_EXPORT_ORDERS: IExportOrder[] = [
  {
    id: 1, code: "PXK001", customerName: "KH Trần Văn B",
    warehouseName: "Kho trung tâm", totalAmount: 2400000,
    createdBy: "Trần Thị Bình", createdAt: "2026-01-06 09:15", status: 1,
    items: [
      { productId: 2, productName: "Găng tay y tế", productCode: "PRODUCT02", unitName: "Hộp", quantity: 30, priceUnit: 80000, avgCost: 75000, totalAmount: 2400000, stockBefore: 200, stockAfter: 170 },
    ],
  },
  {
    id: 2, code: "PXK002", customerName: "Đại lý C",
    warehouseName: "Kho trung tâm", totalAmount: 3000000,
    createdBy: "Trần Thị Bình", createdAt: "2026-01-12 11:30", status: 1,
    items: [
      { productId: 1, productName: "Thuốc trị sẹo", productCode: "PRODUCT01", unitName: "Hộp", quantity: 20, priceUnit: 150000, avgCost: 145000, totalAmount: 3000000, stockBefore: 150, stockAfter: 130 },
    ],
  },
  {
    id: 3, code: "PXK003", customerName: "KH Lê Thị C",
    warehouseName: "Kho chi nhánh 2", totalAmount: 800000,
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-30 11:00", status: 2, // hủy
    items: [
      { productId: 6, productName: "Băng dính y tế", productCode: "PRODUCT06", unitName: "Cuộn", quantity: 40, priceUnit: 20000, avgCost: 19000, totalAmount: 800000, stockBefore: 170, stockAfter: 130 },
    ],
  },
  {
    id: 4, code: "PXK004", customerName: "KH Phạm Văn D",
    warehouseName: "Kho chi nhánh 2", totalAmount: 800000,
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-25 10:00", status: 1,
    items: [
      { productId: 9, productName: "Paracetamol 500mg", productCode: "PRODUCT09", unitName: "Vỉ", quantity: 100, priceUnit: 8000, avgCost: 7500, totalAmount: 800000, stockBefore: 700, stockAfter: 600 },
    ],
  },
  {
    id: 5, code: "PXK005", customerName: "Đại lý E",
    warehouseName: "Kho trung tâm", totalAmount: 1100000,
    createdBy: "Phạm Thị Dung", createdAt: "2026-01-22 09:30", status: 1,
    items: [
      { productId: 8, productName: "Cồn y tế 70%", productCode: "PRODUCT08", unitName: "Chai", quantity: 50, priceUnit: 22000, avgCost: 21000, totalAmount: 1100000, stockBefore: 400, stockAfter: 350 },
    ],
  },
];

export const MOCK_STOCK_CHECK: IStockCheckItem[] = [
  { productId: 1, productName: "Thuốc trị sẹo", productCode: "PRODUCT01", unitName: "Hộp", systemStock: 130, actualStock: 128, difference: -2, avgCost: 145000, diffAmount: -290000 },
  { productId: 2, productName: "Găng tay y tế", productCode: "PRODUCT02", unitName: "Hộp", systemStock: 160, actualStock: 160, difference: 0, avgCost: 75000, diffAmount: 0 },
  { productId: 3, productName: "Khẩu trang N95", productCode: "PRODUCT03", unitName: "Cái", systemStock: 150, actualStock: 155, difference: 5, avgCost: 23000, diffAmount: 115000 },
  { productId: 4, productName: "Nước muối sinh lý", productCode: "PRODUCT04", unitName: "Chai", systemStock: 275, actualStock: 270, difference: -5, avgCost: 14000, diffAmount: -70000 },
  { productId: 5, productName: "Vitamin C 1000mg", productCode: "PRODUCT05", unitName: "Hộp", systemStock: 150, actualStock: 150, difference: 0, avgCost: 118000, diffAmount: 0 },
  { productId: 6, productName: "Băng dính y tế", productCode: "PRODUCT06", unitName: "Cuộn", systemStock: 130, actualStock: 132, difference: 2, avgCost: 19000, diffAmount: 38000 },
  { productId: 7, productName: "Oxy già 3%", productCode: "PRODUCT07", unitName: "Chai", systemStock: 70, actualStock: 68, difference: -2, avgCost: 17000, diffAmount: -34000 },
  { productId: 8, productName: "Cồn y tế 70%", productCode: "PRODUCT08", unitName: "Chai", systemStock: 250, actualStock: 250, difference: 0, avgCost: 21000, diffAmount: 0 },
  { productId: 9, productName: "Paracetamol 500mg", productCode: "PRODUCT09", unitName: "Vỉ", systemStock: 600, actualStock: 595, difference: -5, avgCost: 7500, diffAmount: -37500 },
  { productId: 10, productName: "Dầu gió xanh", productCode: "PRODUCT10", unitName: "Lọ", systemStock: 165, actualStock: 167, difference: 2, avgCost: 33000, diffAmount: 66000 },
];