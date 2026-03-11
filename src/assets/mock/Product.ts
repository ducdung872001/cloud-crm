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
  code: string;           // mã phiếu
  type: "import" | "export" | "transfer" | "adjust" | "return_from_supplier" | "return_to_customer"; // nhập/xuất/chuyển kho/điều chỉnh
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;       // số lượng
  unitName: string;       // đơn vị tính
  priceUnit: number;      // đơn giá
  totalAmount: number;    // thành tiền
  warehouseFrom?: string; // kho nguồn (dùng cho chuyển kho)
  warehouseTo?: string;   // kho đích
  warehouseName: string;  // kho thực hiện
  stockBefore: number;    // tồn trước
  stockAfter: number;     // tồn sau
  note?: string;
  createdBy: string;      // người thực hiện
  createdAt: string;      // ngày thực hiện
  status: 0 | 1;          // 0: hủy, 1: hoàn thành
  refCode?: string;
  partnerName?: string;
  partnerType?: "supplier" | "customer";
  returnReason?: string;
}

export const MOCK_WAREHOUSE_BOOK: IWarehouseBook[] = [
  {
    id: 1,
    code: "NK001",
    type: "return_to_customer",
    productId: 1,
    productName: "Thuốc trị sẹo",
    productCode: "PRODUCT01",
    quantity: 100,
    unitName: "Hộp",
    priceUnit: 150000,
    totalAmount: 15000000,
    warehouseName: "Kho trung tâm",
    stockBefore: 50,
    stockAfter: 150,
    note: "Nhập hàng từ nhà cung cấp A",
    createdBy: "Nguyễn Văn An",
    createdAt: "2026-01-05 08:30",
    status: 1,
    refCode: `NK010`,           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",
  },
  {
    id: 2,
    code: "XK001",
    type: "export",
    productId: 2,
    productName: "Găng tay y tế",
    productCode: "PRODUCT02",
    quantity: 30,
    unitName: "Hộp",
    priceUnit: 80000,
    totalAmount: 2400000,
    warehouseName: "Kho trung tâm",
    stockBefore: 200,
    stockAfter: 170,
    note: "Xuất bán cho khách hàng B",
    createdBy: "Trần Thị Bình",
    createdAt: "2026-01-06 09:15",
    status: 1,
    refCode: `NK002`,           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",
  },
  {
    id: 3,
    code: "CK001",
    type: "transfer",
    productId: 3,
    productName: "Khẩu trang N95",
    productCode: "PRODUCT03",
    quantity: 50,
    unitName: "Cái",
    priceUnit: 25000,
    totalAmount: 1250000,
    warehouseFrom: "Kho trung tâm",
    warehouseTo: "Kho chi nhánh 1",
    warehouseName: "Kho trung tâm",
    stockBefore: 300,
    stockAfter: 250,
    note: "Chuyển kho chi nhánh",
    createdBy: "Lê Văn Cường",
    createdAt: "2026-01-07 10:00",
    status: 1,
    refCode: `NK003`,           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",
  },
  {
    id: 4,
    code: "DC001",
    type: "return_from_supplier",
    productId: 4,
    productName: "Nước muối sinh lý",
    productCode: "PRODUCT04",
    quantity: -5,
    unitName: "Chai",
    priceUnit: 15000,
    totalAmount: -75000,
    warehouseName: "Kho trung tâm",
    stockBefore: 80,
    stockAfter: 75,
    note: "Điều chỉnh sau kiểm kê",
    createdBy: "Phạm Thị Dung",
    createdAt: "2026-01-08 14:00",
    status: 1,
    refCode: `NK004`,           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",
  },
  {
    id: 5,
    code: "NK002",
    type: "import",
    productId: 5,
    productName: "Vitamin C 1000mg",
    productCode: "PRODUCT05",
    quantity: 200,
    unitName: "Hộp",
    priceUnit: 120000,
    totalAmount: 24000000,
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 30,
    stockAfter: 230,
    note: "Nhập hàng tháng 1",
    createdBy: "Nguyễn Văn An",
    createdAt: "2026-01-10 08:00",
    status: 1,
    refCode: `NK005`,           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 6,
    code: "XK002",
    type: "export",
    productId: 1,
    productName: "Thuốc trị sẹo",
    productCode: "PRODUCT01",
    quantity: 20,
    unitName: "Hộp",
    priceUnit: 150000,
    totalAmount: 3000000,
    warehouseName: "Kho trung tâm",
    stockBefore: 150,
    stockAfter: 130,
    note: "Xuất cho đại lý C",
    createdBy: "Trần Thị Bình",
    createdAt: "2026-01-12 11:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 7,
    code: "NK003",
    type: "return_from_supplier",
    productId: 6,
    productName: "Băng dính y tế",
    productCode: "PRODUCT06",
    quantity: 150,
    unitName: "Cuộn",
    priceUnit: 20000,
    totalAmount: 3000000,
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 20,
    stockAfter: 170,
    note: "Nhập hàng bổ sung",
    createdBy: "Lê Văn Cường",
    createdAt: "2026-01-14 09:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 8,
    code: "XK003",
    type: "export",
    productId: 3,
    productName: "Khẩu trang N95",
    productCode: "PRODUCT03",
    quantity: 100,
    unitName: "Cái",
    priceUnit: 25000,
    totalAmount: 2500000,
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 250,
    stockAfter: 150,
    note: "Xuất bán lẻ",
    createdBy: "Phạm Thị Dung",
    createdAt: "2026-01-15 13:00",
    status: 0, // hủy
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 9,
    code: "DC002",
    type: "adjust",
    productId: 7,
    productName: "Oxy già 3%",
    productCode: "PRODUCT07",
    quantity: 10,
    unitName: "Chai",
    priceUnit: 18000,
    totalAmount: 180000,
    warehouseName: "Kho trung tâm",
    stockBefore: 60,
    stockAfter: 70,
    note: "Điều chỉnh tăng sau kiểm kê",
    createdBy: "Nguyễn Văn An",
    createdAt: "2026-01-16 15:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 10,
    code: "CK002",
    type: "transfer",
    productId: 5,
    productName: "Vitamin C 1000mg",
    productCode: "PRODUCT05",
    quantity: 80,
    unitName: "Hộp",
    priceUnit: 120000,
    totalAmount: 9600000,
    warehouseFrom: "Kho chi nhánh 1",
    warehouseTo: "Kho chi nhánh 2",
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 230,
    stockAfter: 150,
    createdBy: "Trần Thị Bình",
    createdAt: "2026-01-18 10:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 11,
    code: "NK004",
    type: "import",
    productId: 8,
    productName: "Cồn y tế 70%",
    productCode: "PRODUCT08",
    quantity: 300,
    unitName: "Chai",
    priceUnit: 22000,
    totalAmount: 6600000,
    warehouseName: "Kho trung tâm",
    stockBefore: 100,
    stockAfter: 400,
    note: "Nhập số lượng lớn",
    createdBy: "Lê Văn Cường",
    createdAt: "2026-01-20 08:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 12,
    code: "XK004",
    type: "export",
    productId: 8,
    productName: "Cồn y tế 70%",
    productCode: "PRODUCT08",
    quantity: 50,
    unitName: "Chai",
    priceUnit: 22000,
    totalAmount: 1100000,
    warehouseName: "Kho trung tâm",
    stockBefore: 400,
    stockAfter: 350,
    createdBy: "Phạm Thị Dung",
    createdAt: "2026-01-22 09:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 13,
    code: "NK005",
    type: "import",
    productId: 9,
    productName: "Paracetamol 500mg",
    productCode: "PRODUCT09",
    quantity: 500,
    unitName: "Vỉ",
    priceUnit: 8000,
    totalAmount: 4000000,
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 200,
    stockAfter: 700,
    note: "Nhập hàng tháng 1",
    createdBy: "Nguyễn Văn An",
    createdAt: "2026-01-23 08:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 14,
    code: "XK005",
    type: "export",
    productId: 9,
    productName: "Paracetamol 500mg",
    productCode: "PRODUCT09",
    quantity: 100,
    unitName: "Vỉ",
    priceUnit: 8000,
    totalAmount: 800000,
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 700,
    stockAfter: 600,
    createdBy: "Trần Thị Bình",
    createdAt: "2026-01-25 10:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 15,
    code: "DC003",
    type: "adjust",
    productId: 2,
    productName: "Găng tay y tế",
    productCode: "PRODUCT02",
    quantity: -10,
    unitName: "Hộp",
    priceUnit: 80000,
    totalAmount: -800000,
    warehouseName: "Kho trung tâm",
    stockBefore: 170,
    stockAfter: 160,
    note: "Hàng hư hỏng sau kiểm kê",
    createdBy: "Lê Văn Cường",
    createdAt: "2026-01-26 14:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 16,
    code: "CK003",
    type: "transfer",
    productId: 8,
    productName: "Cồn y tế 70%",
    productCode: "PRODUCT08",
    quantity: 100,
    unitName: "Chai",
    priceUnit: 22000,
    totalAmount: 2200000,
    warehouseFrom: "Kho trung tâm",
    warehouseTo: "Kho chi nhánh 2",
    warehouseName: "Kho trung tâm",
    stockBefore: 350,
    stockAfter: 250,
    createdBy: "Phạm Thị Dung",
    createdAt: "2026-01-28 09:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 17,
    code: "NK006",
    type: "import",
    productId: 10,
    productName: "Dầu gió xanh",
    productCode: "PRODUCT10",
    quantity: 120,
    unitName: "Lọ",
    priceUnit: 35000,
    totalAmount: 4200000,
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 40,
    stockAfter: 160,
    note: "Nhập hàng bổ sung tháng 1",
    createdBy: "Nguyễn Văn An",
    createdAt: "2026-01-29 08:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 18,
    code: "XK006",
    type: "export",
    productId: 6,
    productName: "Băng dính y tế",
    productCode: "PRODUCT06",
    quantity: 40,
    unitName: "Cuộn",
    priceUnit: 20000,
    totalAmount: 800000,
    warehouseName: "Kho chi nhánh 2",
    stockBefore: 170,
    stockAfter: 130,
    createdBy: "Trần Thị Bình",
    createdAt: "2026-01-30 11:00",
    status: 0, // hủy
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 19,
    code: "DC004",
    type: "adjust",
    productId: 10,
    productName: "Dầu gió xanh",
    productCode: "PRODUCT10",
    quantity: 5,
    unitName: "Lọ",
    priceUnit: 35000,
    totalAmount: 175000,
    warehouseName: "Kho chi nhánh 1",
    stockBefore: 160,
    stockAfter: 165,
    note: "Tìm thấy hàng thừa sau kiểm kê",
    createdBy: "Lê Văn Cường",
    createdAt: "2026-02-01 15:00",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

  },
  {
    id: 20,
    code: "NK007",
    type: "import",
    productId: 4,
    productName: "Nước muối sinh lý",
    productCode: "PRODUCT04",
    quantity: 200,
    unitName: "Chai",
    priceUnit: 15000,
    totalAmount: 3000000,
    warehouseName: "Kho trung tâm",
    stockBefore: 75,
    stockAfter: 275,
    note: "Nhập hàng tháng 2",
    createdBy: "Phạm Thị Dung",
    createdAt: "2026-02-03 08:30",
    status: 1,
    refCode: "NK001",           // mã phiếu gốc liên quan
    partnerName: "NCC Minh Anh",// tên NCC/KH
    partnerType: "supplier",    // supplier | customer

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