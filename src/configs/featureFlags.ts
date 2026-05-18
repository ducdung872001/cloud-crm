export type FeatureMode = "enable" | "disable";

// Cảnh báo/chặn khi tài khoản hết hạn gói. Đổi sang "enable" để bật lại
// banner "Tài khoản đã hết hạn" và modal Gia hạn tự bật.
export const ACCOUNT_EXPIRY_CHECK: FeatureMode = "disable";
