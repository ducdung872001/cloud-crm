// UI theme tokens — tập trung màu/size/khoảng cách để dễ rebrand theo nhánh.
// Port sang nhánh khác: chỉ cần sửa file này (1 phút) là đổi toàn bộ look & feel.

export const taxTheme = {
  colors: {
    primary: "#00C9A7", // FitPro mint
    primaryDark: "#0B2E2A",
    primarySoft: "#E4F7F3",
    accent: "#FF8A3C",
    danger: "#E85D4B",
    warning: "#F5A623",
    success: "#22C55E",
    info: "#3B82F6",
    textMain: "#1A2B28",
    textMuted: "#6B8A85",
    border: "#D9E0DE",
    bg: "#F5F9F8",
    cardBg: "#FFFFFF",
    tableHeader: "#F1F7F5",
  },
  radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  font: {
    h1: 22,
    h2: 18,
    h3: 15,
    body: 13,
    small: 12,
    tiny: 11,
  },
  shadow: {
    sm: "0 1px 2px rgba(11, 46, 42, 0.06)",
    md: "0 4px 12px rgba(11, 46, 42, 0.08)",
  },
};

export type TaxTheme = typeof taxTheme;
