export type WarehouseReportViewKey = "landing" | "xnt" | "cost" | "slow" | "history";


export const XNT_KPIS = [
  { label: "Tồn đầu kỳ", value: "2,412", valueClass: "b", delta: "Đầu tháng 3/2026", deltaClass: "neu" },
  { label: "Tổng nhập kỳ", value: "+1,840", valueClass: "g", delta: "↑ 12.4% so kỳ trước", deltaClass: "up" },
  { label: "Tổng xuất kỳ", value: "−1,620", valueClass: "r", delta: "Xuất bán + điều chuyển", deltaClass: "neu" },
  { label: "Tồn cuối kỳ", value: "2,632", valueClass: "", delta: "↑ 220 SL so đầu kỳ", deltaClass: "up" },
];

export const COST_KPIS = [
  { label: "Giá trị tồn kho", value: "2.41 tỷ", valueClass: "a", delta: "Giá vốn toàn kho hiện tại", deltaClass: "neu" },
  { label: "Giá vốn TB / đơn vị", value: "86.4K", valueClass: "b", delta: "Theo bình quân cuối kỳ", deltaClass: "neu" },
  { label: "Nhóm hàng giá vốn cao", value: "18", valueClass: "r", delta: "Cần kiểm soát nhập hàng", deltaClass: "dn" },
  { label: "Biên lợi nhuận gộp TB", value: "31.8%", valueClass: "g", delta: "↑ 1.9% so kỳ trước", deltaClass: "up" },
];

export const SLOW_KPIS = [
  { label: "SP chậm > 90 ngày", value: "34", valueClass: "r", delta: "↑ 8 SP so tháng trước", deltaClass: "dn" },
  { label: "Giá trị ứ đọng", value: "142.6M", valueClass: "a", delta: "5.9% tổng tồn kho", deltaClass: "dn" },
  { label: "Số ngày tồn TB", value: "127 ngày", valueClass: "", delta: "↑ 14 ngày so tháng trước", deltaClass: "dn" },
  { label: "Đang xử lý (KM)", value: "12", valueClass: "g", delta: "Trong chiến dịch giảm giá", deltaClass: "up" },
];

export const HISTORY_KPIS = [
  { label: "Tồn hiện tại", value: "220", valueClass: "b", delta: "Áo thun nam basic", deltaClass: "neu" },
  { label: "Đã nhập (tháng)", value: "+320", valueClass: "g", delta: "Kho hiện tại", deltaClass: "up" },
  { label: "Đã xuất (tháng)", value: "−245", valueClass: "r", delta: "Xuất bán tháng 3", deltaClass: "neu" },
  { label: "Giá vốn TB", value: "85K", valueClass: "", delta: "Giá bình quân hiện tại", deltaClass: "neu" },
];

export const XNT_TABLE_ROWS = [
  { product: "Áo thun nam basic", sku: "SP001", opening: "420", importQty: "+320", exportQty: "−245", closing: "495", warehouse: "Kho HN" },
  { product: "Giày thể thao nữ", sku: "SP089", opening: "168", importQty: "+150", exportQty: "−194", closing: "124", warehouse: "Kho HCM" },
  { product: "Balo thể thao", sku: "SP203", opening: "95", importQty: "+40", exportQty: "−18", closing: "117", warehouse: "Kho ĐN" },
  { product: "Váy hoa mùa hè", sku: "SP067", opening: "86", importQty: "+70", exportQty: "−148", closing: "8", warehouse: "Kho HCM" },
];

export const COST_TABLE_ROWS = [
  { product: "Giày thể thao nữ", sku: "SP089", quantity: "124", unitCost: "245,000đ", inventoryValue: "30.4M", avgPrice: "365,000đ", grossMargin: "32.9%" },
  { product: "Áo khoác lông vũ nữ", sku: "SP178", quantity: "95", unitCost: "300,000đ", inventoryValue: "28.5M", avgPrice: "480,000đ", grossMargin: "37.5%" },
  { product: "Đồng hồ unisex classic", sku: "SP241", quantity: "17", unitCost: "700,000đ", inventoryValue: "11.9M", avgPrice: "1,050,000đ", grossMargin: "33.3%" },
  { product: "Giày da nam công sở", sku: "SP258", quantity: "64", unitCost: "195,000đ", inventoryValue: "12.5M", avgPrice: "295,000đ", grossMargin: "33.9%" },
];

export const SLOW_TABLE_ROWS = [
  { product: "Giày sandal nữ đế bằng", sku: "SP141", group: "Giày dép", stock: "181", days: "214 ngày", lockedValue: "33.5M", lastOutDate: "12/08/2025", action: "Cần xử lý gấp", actionClass: "br" },
  { product: "Áo khoác lông vũ nữ", sku: "SP178", group: "Thời trang", stock: "95", days: "187 ngày", lockedValue: "28.5M", lastOutDate: "05/09/2025", action: "Cần xử lý gấp", actionClass: "br" },
  { product: "Balo thể thao đa năng", sku: "SP203", group: "Phụ kiện", stock: "42", days: "156 ngày", lockedValue: "12.6M", lastOutDate: "10/10/2025", action: "Khuyến mãi", actionClass: "bo" },
  { product: "Đầm dự tiệc sequin", sku: "SP219", group: "Thời trang", stock: "28", days: "143 ngày", lockedValue: "19.6M", lastOutDate: "24/10/2025", action: "Đang khuyến mãi", actionClass: "ba" },
];

export const HISTORY_TABLE_ROWS = [
  { date: "16/03/2026", type: "Xuất bán", typeClass: "bg", code: "DH-2026-1842", importQty: "—", exportQty: "−12", remain: "220", unitCost: "85,000đ", warehouse: "Kho HN" },
  { date: "15/03/2026", type: "Nhập hàng", typeClass: "bb", code: "NK-2026-0432", importQty: "+80", exportQty: "—", remain: "232", unitCost: "83,500đ", warehouse: "Kho HN" },
  { date: "15/03/2026", type: "Xuất bán", typeClass: "bg", code: "DH-2026-1831", importQty: "—", exportQty: "−25", remain: "152", unitCost: "85,000đ", warehouse: "Kho HCM" },
  { date: "13/03/2026", type: "Điều chuyển", typeClass: "bt", code: "DC-2026-0088", importQty: "+30", exportQty: "−30", remain: "195", unitCost: "85,000đ", warehouse: "HN → HCM" },
];
