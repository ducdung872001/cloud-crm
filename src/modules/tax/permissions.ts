// Permission codes cho tax module — mỗi nhánh host có thể bind vào hệ thống
// phân quyền của mình. Mặc định allow-all cho đến khi host set checker.
//
// Usage trong host app:
//   import { setPermissionChecker, TAX_PERMISSIONS } from "@/modules/tax";
//   setPermissionChecker((code) => currentUser.permissions.includes(code));

export const TAX_PERMISSIONS = {
  /** Xem Dashboard + sổ DT/CP */
  VIEW: "TAX_VIEW",
  /** Sửa hồ sơ thuế T1 */
  EDIT_PROFILE: "TAX_EDIT_PROFILE",
  /** Thêm/xoá điều chỉnh doanh thu thủ công */
  EDIT_REVENUE: "TAX_EDIT_REVENUE",
  /** Lập tờ khai (01/CNKD, 03/CNKD, 01/LPMB) */
  DECLARE: "TAX_DECLARE",
  /** Ký số + nộp eTax */
  SUBMIT: "TAX_SUBMIT",
  /** Lập tờ khai bổ sung sửa sai */
  AMEND: "TAX_AMEND",
  /** Gửi yêu cầu hỗ trợ đại lý thuế */
  REQUEST_SUPPORT: "TAX_REQUEST_SUPPORT",
} as const;

export type TaxPermissionCode = (typeof TAX_PERMISSIONS)[keyof typeof TAX_PERMISSIONS];

export const TAX_PERMISSION_LABELS: Record<TaxPermissionCode, string> = {
  TAX_VIEW: "Xem phân hệ thuế",
  TAX_EDIT_PROFILE: "Sửa hồ sơ thuế",
  TAX_EDIT_REVENUE: "Điều chỉnh doanh thu thủ công",
  TAX_DECLARE: "Lập tờ khai thuế",
  TAX_SUBMIT: "Ký số & nộp eTax",
  TAX_AMEND: "Lập tờ khai bổ sung",
  TAX_REQUEST_SUPPORT: "Yêu cầu hỗ trợ tư vấn",
};

type PermissionChecker = (code: TaxPermissionCode) => boolean;

// Mặc định: allow-all (dev mode / chưa wire permission system).
let _checker: PermissionChecker = () => true;

export function setPermissionChecker(checker: PermissionChecker): void {
  _checker = checker;
}

export function can(code: TaxPermissionCode): boolean {
  return _checker(code);
}

/** React hook wrapper — rerender không tự động, nên dùng trong render trực tiếp. */
export function usePermission(code: TaxPermissionCode): boolean {
  return can(code);
}
