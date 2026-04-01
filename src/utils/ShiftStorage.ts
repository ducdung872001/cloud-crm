/**
 * ShiftStorage — quản lý shiftId hiện tại trong localStorage.
 *
 * Luồng:
 *   OpenShiftTab  → saveActiveShiftId(id)   khi mở ca thành công
 *   CloseShiftTab → clearActiveShiftId()    khi đóng ca thành công
 *   PaymentBill   → getActiveShiftId()      khi tạo đơn hàng
 */

const KEY = "reborn_active_shift_id";

/** Lưu shiftId khi mở ca thành công */
export function saveActiveShiftId(shiftId: number): void {
  if (shiftId > 0) {
    localStorage.setItem(KEY, String(shiftId));
  }
}

/** Đọc shiftId đang active (null nếu chưa vào ca) */
export function getActiveShiftId(): number | null {
  const v = localStorage.getItem(KEY);
  if (!v) return null;
  const n = Number(v);
  return isNaN(n) || n <= 0 ? null : n;
}

/** Xóa shiftId khi đóng ca */
export function clearActiveShiftId(): void {
  localStorage.removeItem(KEY);
}