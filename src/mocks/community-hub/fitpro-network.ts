// [FitPro] Network Tree 7×7×7 — MLM hierarchy
// Công thức: 1 → 7 → 49 → 343 (triết lý MF7).
//
// Định danh bất biến trọn đời (xem docs/fitpro/03-architecture/business-model.md):
//   affiliate_code = A### → mỗi BO đăng ký App nhận 1 mã A, không đổi suốt đời.
//   house_code     = N### → auto-mint khi BO có đủ 7 Elite F1-F7 active liền nhau (Mã "Nhà").

export interface INetworkNode {
  id: string;
  name: string;
  affiliate_code: string;        // A007 — bất biến trọn đời, gắn link giới thiệu
  house_code?: string;           // N007 — auto-mint khi đủ 7 Elite downline
  role: "office" | "entrepreneur" | "trainer" | "ambassador";
  tier: 1 | 2 | 3;
  station_code: string;
  city: string;
  joined_date: string;
  stations_count: number;
  monthly_revenue_vnd: number;
  monthly_commission_vnd: number;
  status: "active" | "setup" | "inactive";
  parent_id: string | null;
  children_ids: string[];
}

// Top level (tầng 0) = Master BO — đã có 5 Elite F1, chưa đủ N007 (cần 7)
const master: INetworkNode = {
  id: "BO-MASTER",
  name: "Nguyễn Master (Bạn)",
  affiliate_code: "A007",
  role: "entrepreneur",
  tier: 1,
  station_code: "FP-HN-001",
  city: "Hà Nội",
  joined_date: "2025-06-01",
  stations_count: 1,
  monthly_revenue_vnd: 85000000,
  monthly_commission_vnd: 42000000,
  status: "active",
  parent_id: null,
  children_ids: ["BO-T1-001", "BO-T1-002", "BO-T1-003", "BO-T1-004", "BO-T1-005"],
};

// Tầng 1 — 5 trạm trực tiếp (mục tiêu 7)
const tier1: INetworkNode[] = [
  { id: "BO-T1-001", name: "Trần Thị B", affiliate_code: "A015", role: "entrepreneur", tier: 1, station_code: "FP-HN-002", city: "Hà Nội", joined_date: "2025-08-01", stations_count: 3, monthly_revenue_vnd: 128000000, monthly_commission_vnd: 64000000, status: "active", parent_id: "BO-MASTER", children_ids: ["BO-T2-001", "BO-T2-002", "BO-T2-003"] },
  { id: "BO-T1-002", name: "Lê Văn C", affiliate_code: "A028", role: "trainer", tier: 1, station_code: "FP-DN-001", city: "Đà Nẵng", joined_date: "2025-11-15", stations_count: 2, monthly_revenue_vnd: 95000000, monthly_commission_vnd: 28000000, status: "active", parent_id: "BO-MASTER", children_ids: ["BO-T2-004", "BO-T2-005"] },
  { id: "BO-T1-003", name: "Phạm Thị D", affiliate_code: "A041", role: "ambassador", tier: 1, station_code: "FP-NA-001", city: "Nghệ An", joined_date: "2025-12-01", stations_count: 1, monthly_revenue_vnd: 42000000, monthly_commission_vnd: 8500000, status: "active", parent_id: "BO-MASTER", children_ids: ["BO-T2-006"] },
  { id: "BO-T1-004", name: "Hoàng Văn E", affiliate_code: "A053", role: "office", tier: 1, station_code: "FP-HCM-001", city: "TP.HCM", joined_date: "2026-01-10", stations_count: 1, monthly_revenue_vnd: 32000000, monthly_commission_vnd: 4200000, status: "active", parent_id: "BO-MASTER", children_ids: [] },
  { id: "BO-T1-005", name: "Bùi Thị F", affiliate_code: "A067", role: "office", tier: 1, station_code: "FP-HN-SETUP", city: "Hà Nội", joined_date: "2026-04-01", stations_count: 0, monthly_revenue_vnd: 0, monthly_commission_vnd: 0, status: "setup", parent_id: "BO-MASTER", children_ids: [] },
];

// Tầng 2 — downline của tier 1
const tier2: INetworkNode[] = [
  { id: "BO-T2-001", name: "Vũ Minh G", affiliate_code: "A082", role: "trainer", tier: 2, station_code: "FP-HN-010", city: "Hà Nội", joined_date: "2025-10-20", stations_count: 1, monthly_revenue_vnd: 48000000, monthly_commission_vnd: 8500000, status: "active", parent_id: "BO-T1-001", children_ids: [] },
  { id: "BO-T2-002", name: "Đặng Hà H", affiliate_code: "A091", role: "office", tier: 2, station_code: "FP-HN-011", city: "Hà Nội", joined_date: "2025-11-01", stations_count: 1, monthly_revenue_vnd: 28000000, monthly_commission_vnd: 3800000, status: "active", parent_id: "BO-T1-001", children_ids: [] },
  { id: "BO-T2-003", name: "Ngô Văn I", affiliate_code: "A104", role: "entrepreneur", tier: 2, station_code: "FP-HP-001", city: "Hải Phòng", joined_date: "2026-01-05", stations_count: 1, monthly_revenue_vnd: 35000000, monthly_commission_vnd: 5200000, status: "active", parent_id: "BO-T1-001", children_ids: [] },
  { id: "BO-T2-004", name: "Mai Thanh J", affiliate_code: "A118", role: "office", tier: 2, station_code: "FP-DN-002", city: "Đà Nẵng", joined_date: "2026-02-15", stations_count: 1, monthly_revenue_vnd: 22000000, monthly_commission_vnd: 2800000, status: "active", parent_id: "BO-T1-002", children_ids: [] },
  { id: "BO-T2-005", name: "Tôn Nữ K", affiliate_code: "A125", role: "ambassador", tier: 2, station_code: "FP-HUE-001", city: "Huế", joined_date: "2026-03-01", stations_count: 1, monthly_revenue_vnd: 18000000, monthly_commission_vnd: 1500000, status: "active", parent_id: "BO-T1-002", children_ids: [] },
  { id: "BO-T2-006", name: "Lý Văn L", affiliate_code: "A134", role: "trainer", tier: 2, station_code: "FP-NA-002", city: "Nghệ An", joined_date: "2026-03-20", stations_count: 1, monthly_revenue_vnd: 15000000, monthly_commission_vnd: 1200000, status: "setup", parent_id: "BO-T1-003", children_ids: [] },
];

export const MOCK_NETWORK_NODES: INetworkNode[] = [master, ...tier1, ...tier2];

// Aggregate stats cho master view
export const NETWORK_SUMMARY = {
  total_bo: MOCK_NETWORK_NODES.length,
  tier1_count: tier1.length,
  tier1_max: 7,
  tier2_count: tier2.length,
  tier2_max: 49,
  tier3_count: 0,
  tier3_max: 343,
  total_stations: MOCK_NETWORK_NODES.reduce((a, n) => a + n.stations_count, 0),
  total_monthly_revenue: MOCK_NETWORK_NODES.reduce((a, n) => a + n.monthly_revenue_vnd, 0),
  // Hoa hồng master nhận từ cả hệ thống (5%/tầng × 3 tầng)
  master_total_commission: master.monthly_commission_vnd,
  progress_to_goal: Math.round(((tier1.length + tier2.length) / (7 + 49)) * 100),
};
