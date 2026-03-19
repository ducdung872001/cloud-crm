export const XNT_TREND_DATA = {
  labels: Array.from({ length: 16 }, (_, index) => `${index + 1}/3`),
  importQty: [90, 120, 80, 150, 110, 200, 130, 95, 170, 140, 85, 210, 95, 140, 180, 90],
  exportQty: [70, 95, 110, 80, 130, 160, 105, 85, 140, 120, 75, 165, 80, 130, 145, 78],
};

export const XNT_WAREHOUSE_RATIO = [
  { name: "Kho HN", y: 48, color: "#1d4ed8" },
  { name: "Kho HCM", y: 32, color: "#60a5fa" },
  { name: "Kho ĐN", y: 20, color: "#bfdbfe" },
];

export const COST_GROUP_VALUES = [
  { name: "Thời trang", y: 1120, color: "#b45309" },
  { name: "Giày dép", y: 480, color: "#d97706" },
  { name: "Phụ kiện", y: 340, color: "#f59e0b" },
  { name: "Nội y", y: 280, color: "#fbbf24" },
  { name: "Khác", y: 190, color: "#fde68a" },
];

export const COST_PERIOD_VALUES = {
  labels: ["T10", "T11", "T12", "T1", "T2", "T3"],
  inventoryValue: [280, 295, 310, 290, 297, 342],
  costValue: [182, 191, 201, 188, 193, 222],
};

export const SLOW_DAYS_RATIO = [
  { name: "90–120 ngày", y: 15, color: "#fbbf24" },
  { name: "120–180 ngày", y: 12, color: "#f97316" },
  { name: ">180 ngày", y: 7, color: "#ef4444" },
];

export const SLOW_GROUP_VALUES = [
  { name: "Giày dép", y: 50, color: "#ef4444" },
  { name: "Thời trang", y: 42, color: "#f97316" },
  { name: "Phụ kiện", y: 22, color: "#fbbf24" },
  { name: "Nội y", y: 18, color: "#fde68a" },
  { name: "Đồng hồ", y: 11, color: "#d1fae5" },
];

export const HISTORY_STOCK_LINE = {
  labels: Array.from({ length: 16 }, (_, index) => `${index + 1}/3`),
  values: [145, 245, 232, 185, 165, 195, 177, 165, 152, 145, 195, 235, 215, 197, 232, 220],
};

export const HISTORY_WEEKLY_FLOW = {
  labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
  importQty: [80, 120, 60, 60],
  exportQty: [65, 95, 75, 10],
};
