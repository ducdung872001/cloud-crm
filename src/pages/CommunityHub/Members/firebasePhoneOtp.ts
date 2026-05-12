// Firebase Phone OTP helper — dùng cho 2 flow community-hub:
//   1. User self-reset password (ForgotPasswordModal)
//   2. Register OTP-first (MemberSignupForm Phase 2)
//
// BE đã chốt 2026-05-12: FE gọi Firebase SDK trực tiếp (Google host) để gửi/verify
// OTP, KHÔNG qua BE. Sau khi verify xong → FE gửi idToken lên Market endpoint,
// Market call Auth internal /firebase/verify-id-token để verify offline qua
// Google JWKS cache.
//
// Caveat: brandname SMS là Firebase default (số máy Google), KHÔNG có "reborn.vn".
// Trade-off chấp nhận để khỏi tích hợp SMS gateway VN riêng — yc Hiền Đỗ 2026-05-11.

import { firebaseAuth, isFirebasePhoneAuthAvailable } from "configs/firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

/** Chuẩn hoá SĐT VN → format E.164 (+84...) cho Firebase. */
export function toE164VN(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("84")) return "+" + cleaned;
  if (cleaned.startsWith("0")) return "+84" + cleaned.slice(1);
  return "+84" + cleaned;
}

/** Validate SĐT VN cơ bản. */
export function isValidVNPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 9 && digits.length <= 12;
}

/** Track verifier đã tạo theo containerId — Firebase báo lỗi
 *  "reCAPTCHA has already been rendered in this element" nếu mount lần 2.
 *  Clear instance cũ + DOM element trước khi tạo mới (fix re-click "Gửi OTP"
 *  hoặc component re-render). */
const verifierRegistry = new Map<string, RecaptchaVerifier>();

/** Tạo invisible RecaptchaVerifier mount vào element id. Element này phải tồn tại
 *  trong DOM khi gọi sendOtp. Tự động clear verifier + DOM cũ nếu mount trùng. */
export function createRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!firebaseAuth) {
    throw new Error(
      "Firebase chưa cấu hình — kiểm tra biến môi trường VITE_FIREBASE_API_KEY / VITE_FIREBASE_PROJECT_ID / VITE_FIREBASE_APP_ID.",
    );
  }
  // Cleanup verifier cũ (nếu user retry hoặc dev StrictMode re-mount).
  const old = verifierRegistry.get(containerId);
  if (old) {
    try { old.clear(); } catch { /* ignore */ }
    verifierRegistry.delete(containerId);
  }
  // Cleanup DOM element — Firebase iframe có thể vẫn còn trong DOM dù verifier
  // đã clear, làm new RecaptchaVerifier báo "already rendered".
  const el = typeof document !== "undefined" ? document.getElementById(containerId) : null;
  if (el) el.innerHTML = "";

  const verifier = new RecaptchaVerifier(containerId, { size: "invisible" }, firebaseAuth);
  verifierRegistry.set(containerId, verifier);
  return verifier;
}

/** Dọn verifier khi component unmount (optional, dùng trong useEffect cleanup). */
export function clearRecaptchaVerifier(containerId: string): void {
  const v = verifierRegistry.get(containerId);
  if (v) {
    try { v.clear(); } catch { /* ignore */ }
    verifierRegistry.delete(containerId);
  }
  const el = typeof document !== "undefined" ? document.getElementById(containerId) : null;
  if (el) el.innerHTML = "";
}

/** Gửi SMS OTP qua Firebase. Trả về `ConfirmationResult` để dùng cho `confirm()` sau. */
export async function sendPhoneOtp(
  phoneE164: string,
  verifier: RecaptchaVerifier,
): Promise<ConfirmationResult> {
  if (!firebaseAuth) {
    throw new Error("Firebase chưa cấu hình.");
  }
  return signInWithPhoneNumber(firebaseAuth, phoneE164, verifier);
}

/** Verify OTP user nhập + lấy idToken Firebase. */
export async function verifyOtpAndGetIdToken(
  confirmation: ConfirmationResult,
  otpCode: string,
): Promise<string> {
  const cred = await confirmation.confirm(otpCode);
  const user = cred.user;
  if (!user) throw new Error("Firebase không trả về user sau verify");
  return user.getIdToken();
}

export { isFirebasePhoneAuthAvailable };
