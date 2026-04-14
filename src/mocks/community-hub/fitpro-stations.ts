// [FitPro] Mock data for Station Layout module
// Thay thế accommodation (phòng/giường) bằng trạm FitPro với thảm tập
// Home FitPro: 3-7 thảm | Co-working FitPro: 5-20 thảm

export type StationType = "home" | "coworking";
export type MatStatus = "available" | "occupied" | "maintenance";
export type MatSlot = "6-7h" | "7-8h" | "8-9h";

export interface IFitProMat {
  mat_no: number;
  status: MatStatus;
  // Nếu occupied thì có thông tin buổi tập hiện tại
  session?: {
    member_id: string;
    member_name: string;
    slot: MatSlot;
    program: string; // giáo trình đang chạy
    started_at: string; // ISO time
  } | null;
}

export interface IFitProStation {
  id: string;
  code: string;
  name: string;
  type: StationType;
  typeLabel: string;
  owner_name: string;         // chủ trạm BO
  owner_tier: number;         // 1|2|3 tầng trong MLM
  address: string;
  city: string;
  mats: IFitProMat[];
  total_mats: number;
  operating_hours: string;    // "6:00 - 9:00"
  opened_date: string;
  status: "active" | "setup" | "inactive";
  today_sessions: number;     // số buổi tập hôm nay
  month_revenue_vnd: number;
  parent_station_id?: string; // trạm cấp trên (tầng trên)
}

const makeMat = (n: number, status: MatStatus = "available", session: IFitProMat["session"] = null): IFitProMat => ({
  mat_no: n,
  status,
  session,
});

export const MOCK_FITPRO_STATIONS: IFitProStation[] = [
  {
    id: "ST-001",
    code: "FP-HN-001",
    name: "Trạm Nguyễn Văn A (Hà Đông)",
    type: "home",
    typeLabel: "Home FitPro",
    owner_name: "Nguyễn Văn A",
    owner_tier: 1,
    address: "Số 12 Ngõ 45, Nguyễn Trãi, Hà Đông",
    city: "Hà Nội",
    total_mats: 5,
    operating_hours: "6:00 - 9:00",
    opened_date: "2025-11-01",
    status: "active",
    today_sessions: 13,
    month_revenue_vnd: 45000000,
    mats: [
      makeMat(1, "occupied", { member_id: "M001", member_name: "Trần Thị Hương", slot: "6-7h", program: "Full Body Burn", started_at: "2026-04-15T06:15:00" }),
      makeMat(2, "occupied", { member_id: "M002", member_name: "Lê Văn Đức", slot: "6-7h", program: "Core Power", started_at: "2026-04-15T06:00:00" }),
      makeMat(3, "occupied", { member_id: "M003", member_name: "Phạm Thị Lan", slot: "6-7h", program: "Yoga Flow", started_at: "2026-04-15T06:05:00" }),
      makeMat(4, "available"),
      makeMat(5, "maintenance"),
    ],
  },
  {
    id: "ST-002",
    code: "FP-HN-002",
    name: "Trạm Cầu Giấy Co-Work",
    type: "coworking",
    typeLabel: "Co-Working FitPro",
    owner_name: "Trần Văn B",
    owner_tier: 1,
    address: "Tầng 2, Tòa Indochina, Cầu Giấy",
    city: "Hà Nội",
    total_mats: 12,
    operating_hours: "6:00 - 9:00",
    opened_date: "2025-09-15",
    status: "active",
    today_sessions: 34,
    month_revenue_vnd: 128000000,
    mats: Array.from({ length: 12 }, (_, i) => {
      const occupied = i < 8;
      return makeMat(
        i + 1,
        occupied ? "occupied" : i === 11 ? "maintenance" : "available",
        occupied
          ? {
              member_id: `M${100 + i}`,
              member_name: ["Nguyễn Minh", "Hoàng An", "Lý Thị Nga", "Vũ Đình", "Bùi Thảo", "Đặng Dũng", "Phạm Giang", "Trịnh Hà"][i],
              slot: (i < 4 ? "6-7h" : i < 7 ? "7-8h" : "8-9h") as MatSlot,
              program: ["Full Body Burn", "Core Power", "Yoga Flow", "HIIT", "Stretch & Recover"][i % 5],
              started_at: "2026-04-15T06:30:00",
            }
          : null
      );
    }),
  },
  {
    id: "ST-003",
    code: "FP-HCM-001",
    name: "Trạm Quận 1 Phạm Văn C",
    type: "home",
    typeLabel: "Home FitPro",
    owner_name: "Phạm Văn C",
    owner_tier: 2,
    parent_station_id: "ST-001",
    address: "48 Nguyễn Huệ, Q1",
    city: "TP.HCM",
    total_mats: 4,
    operating_hours: "6:00 - 9:00",
    opened_date: "2026-01-20",
    status: "active",
    today_sessions: 9,
    month_revenue_vnd: 32000000,
    mats: [
      makeMat(1, "occupied", { member_id: "M201", member_name: "Dương Thùy Linh", slot: "6-7h", program: "Yoga Flow", started_at: "2026-04-15T06:00:00" }),
      makeMat(2, "occupied", { member_id: "M202", member_name: "Lâm Quỳnh Anh", slot: "6-7h", program: "Stretch & Recover", started_at: "2026-04-15T06:10:00" }),
      makeMat(3, "available"),
      makeMat(4, "available"),
    ],
  },
  {
    id: "ST-004",
    code: "FP-DN-001",
    name: "Trạm Hải Châu Đà Nẵng",
    type: "coworking",
    typeLabel: "Co-Working FitPro",
    owner_name: "Lê Thị D",
    owner_tier: 2,
    parent_station_id: "ST-001",
    address: "120 Bạch Đằng, Hải Châu",
    city: "Đà Nẵng",
    total_mats: 10,
    operating_hours: "6:00 - 9:00",
    opened_date: "2025-12-10",
    status: "active",
    today_sessions: 22,
    month_revenue_vnd: 95000000,
    mats: Array.from({ length: 10 }, (_, i) => {
      const occupied = i < 6;
      return makeMat(
        i + 1,
        occupied ? "occupied" : "available",
        occupied
          ? {
              member_id: `M${300 + i}`,
              member_name: ["Trịnh Nam", "Hồ Lan", "Đoàn Khoa", "Mai Thu", "Võ Hưng", "Lâm Tuấn"][i],
              slot: (i < 3 ? "6-7h" : "7-8h") as MatSlot,
              program: ["Full Body Burn", "HIIT", "Core Power"][i % 3],
              started_at: "2026-04-15T06:20:00",
            }
          : null
      );
    }),
  },
  {
    id: "ST-005",
    code: "FP-HN-SETUP",
    name: "Trạm Thanh Xuân (đang setup)",
    type: "home",
    typeLabel: "Home FitPro",
    owner_name: "Bùi Văn E",
    owner_tier: 2,
    parent_station_id: "ST-001",
    address: "Chung cư Imperia, Thanh Xuân",
    city: "Hà Nội",
    total_mats: 5,
    operating_hours: "6:00 - 9:00",
    opened_date: "2026-04-20",
    status: "setup",
    today_sessions: 0,
    month_revenue_vnd: 0,
    mats: Array.from({ length: 5 }, (_, i) => makeMat(i + 1, "maintenance")),
  },
];

export const STATION_SUMMARY = {
  total: MOCK_FITPRO_STATIONS.length,
  active: MOCK_FITPRO_STATIONS.filter((s) => s.status === "active").length,
  setup: MOCK_FITPRO_STATIONS.filter((s) => s.status === "setup").length,
  total_mats: MOCK_FITPRO_STATIONS.reduce((a, s) => a + s.total_mats, 0),
  occupied_mats: MOCK_FITPRO_STATIONS.reduce(
    (a, s) => a + s.mats.filter((m) => m.status === "occupied").length,
    0
  ),
  today_sessions: MOCK_FITPRO_STATIONS.reduce((a, s) => a + s.today_sessions, 0),
  month_revenue: MOCK_FITPRO_STATIONS.reduce((a, s) => a + s.month_revenue_vnd, 0),
};
