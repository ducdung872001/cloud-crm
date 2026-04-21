// [CH] Community Hub - Mock combo data cho chế độ "Xem trước" giao diện
// Dùng khi tenant chưa có combo thật + user bấm nút Xem trước.
// KHÔNG ghi localStorage — không ô nhiễm dữ liệu tenant.

export interface IComboItem {
  id: number;
  name: string;
  products: string[];
  orig: string;      // Giá gốc (string đã format)
  sale: string;      // Giá sale
  pct: string;       // % tiết kiệm
  sold: number;
  status: "active" | "pending" | "expired";
}

export interface IComboStats {
  active: number;            // Combo đang bán
  soldThisMonth: number;     // Đã bán tháng này
  revenueVnd: string;        // Doanh thu (đã format)
  revenueTrendPct: number;   // +/- % so với tháng trước
  topComboName: string;      // Combo hiệu quả nhất
  topComboSold: number;
}

export const MOCK_COMBOS: IComboItem[] = [
  { id: -1001, name: "Combo Gia đình",    products: ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C"],             orig: "450.000", sale: "350.000", pct: "22%", sold: 78,  status: "active"  },
  { id: -1002, name: "Combo Tiết kiệm",   products: ["Sản phẩm X", "Sản phẩm Y"],                           orig: "280.000", sale: "220.000", pct: "21%", sold: 134, status: "active"  },
  { id: -1003, name: "Combo VIP Premium", products: ["SP Premium", "SP Gold", "SP Luxury", "SP Ultra"],     orig: "800.000", sale: "580.000", pct: "27%", sold: 45,  status: "active"  },
  { id: -1004, name: "Combo Mùa hè 2026", products: ["SP Mùa hè", "SP Phiên bản mới"],                      orig: "320.000", sale: "250.000", pct: "22%", sold: 0,   status: "pending" },
];

export const MOCK_COMBO_STATS: IComboStats = {
  active: 28,
  soldThisMonth: 1245,
  revenueVnd: "458tr",
  revenueTrendPct: 8,
  topComboName: "Gia đình",
  topComboSold: 850,
};
