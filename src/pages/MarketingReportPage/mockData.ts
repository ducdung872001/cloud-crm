export type ChannelReport = {
  channel: string;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  spend: number;
  revenue: number;
};

export type CampaignReport = {
  name: string;
  channel: string;
  owner: string;
  spend: number;
  leads: number;
  conversions: number;
  revenue: number;
  status: "running" | "optimized" | "paused";
};

export const CHANNEL_OPTIONS = [
  { value: "all", label: "Tất cả kênh" },
  { value: "facebook", label: "Facebook Ads" },
  { value: "zalo", label: "Zalo OA" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

export const VIEW_OPTIONS = [
  { value: "campaign", label: "Theo chiến dịch" },
  { value: "channel", label: "Theo kênh" },
];

export const LEAD_TREND = [
  { label: "T10", reach: 22000, leads: 350, conversions: 78 },
  { label: "T11", reach: 24800, leads: 394, conversions: 92 },
  { label: "T12", reach: 28600, leads: 430, conversions: 106 },
  { label: "T01", reach: 30100, leads: 468, conversions: 114 },
  { label: "T02", reach: 29400, leads: 452, conversions: 108 },
  { label: "T03", reach: 33200, leads: 510, conversions: 126 },
];

export const CHANNEL_REPORTS: ChannelReport[] = [
  { channel: "Facebook Ads", leads: 590, qualifiedLeads: 364, conversions: 146, spend: 86000000, revenue: 312000000 },
  { channel: "Zalo OA", leads: 280, qualifiedLeads: 166, conversions: 72, spend: 24000000, revenue: 118000000 },
  { channel: "Email", leads: 190, qualifiedLeads: 108, conversions: 48, spend: 12000000, revenue: 65000000 },
  { channel: "SMS", leads: 125, qualifiedLeads: 72, conversions: 31, spend: 8000000, revenue: 39000000 },
];

export const CAMPAIGN_REPORTS: CampaignReport[] = [
  { name: "Retarget quý I", channel: "Facebook Ads", owner: "Mai Anh", spend: 28500000, leads: 176, conversions: 54, revenue: 124000000, status: "running" },
  { name: "Tái kích hoạt hội viên", channel: "Zalo OA", owner: "Ngọc Trâm", spend: 11800000, leads: 102, conversions: 28, revenue: 49000000, status: "optimized" },
  { name: "Cross-sell serum", channel: "Email", owner: "Khánh Linh", spend: 7200000, leads: 68, conversions: 19, revenue: 32500000, status: "running" },
  { name: "Flash sale cuối tuần", channel: "SMS", owner: "Phương Vy", spend: 4800000, leads: 44, conversions: 11, revenue: 18600000, status: "paused" },
  { name: "Lookalike khách hàng VIP", channel: "Facebook Ads", owner: "Mai Anh", spend: 23900000, leads: 158, conversions: 47, revenue: 106900000, status: "optimized" },
];

export const CHANNEL_COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ec4899"];

export const STATUS_LABELS = {
  running: "Đang chạy",
  optimized: "Tối ưu tốt",
  paused: "Tạm dừng",
};

export const STATUS_COLORS = {
  running: "#2563eb",
  optimized: "#10b981",
  paused: "#64748b",
};
