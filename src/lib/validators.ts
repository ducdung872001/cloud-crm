import { z } from "zod";

// ============ Common messages (Vietnamese) ============
export const msg = {
  required: "Không được để trống",
  email: "Email không hợp lệ",
  url: "URL không hợp lệ (phải có http:// hoặc https://)",
  min: (n: number) => `Tối thiểu ${n} ký tự`,
  max: (n: number) => `Tối đa ${n} ký tự`,
  numberMin: (n: number) => `Giá trị tối thiểu là ${n}`,
  numberMax: (n: number) => `Giá trị tối đa là ${n}`,
  pattern: "Định dạng không hợp lệ",
  mismatch: "Không khớp",
  weakPassword: "Mật khẩu tối thiểu 8 ký tự, có chữ và số",
  phone: "Số điện thoại không hợp lệ",
  upperCode: "Phải viết HOA, chữ cái + số + dấu gạch ngang",
  otp: "Mã OTP phải gồm 6 chữ số",
  futureDate: "Ngày phải ở tương lai",
};

// ============ Reusable schemas ============
export const emailSchema = z.string().trim().min(1, msg.required).email(msg.email);

export const passwordSchema = z
  .string()
  .min(8, msg.weakPassword)
  .regex(/[a-zA-Z]/, msg.weakPassword)
  .regex(/[0-9]/, msg.weakPassword);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s+().-]{8,20}$/, msg.phone)
  .optional()
  .or(z.literal(""));

export const urlSchema = z.string().trim().url(msg.url).optional().or(z.literal(""));

export const requiredUrl = z.string().trim().url(msg.url);

export const requiredString = (label = msg.required) => z.string().trim().min(1, label);

export const projectCode = z
  .string()
  .trim()
  .min(3, msg.min(3))
  .max(40, msg.max(40))
  .regex(/^[A-Z0-9-]+$/, msg.upperCode);

export const otpSchema = z.string().regex(/^\d{6}$/, msg.otp);

export const positiveNumber = (max?: number) =>
  z.coerce
    .number({ error: "Phải là số" })
    .min(0, msg.numberMin(0))
    .max(max ?? Number.MAX_SAFE_INTEGER, max ? msg.numberMax(max) : "");

export const taxIdSchema = z
  .string()
  .trim()
  .regex(/^[\d-]{10,20}$/, "MST không hợp lệ (10–20 chữ số)")
  .optional()
  .or(z.literal(""));

export const dateSchema = z.string().trim().min(1, msg.required);

export const futureDateSchema = z
  .string()
  .trim()
  .min(1, msg.required)
  .refine((v) => new Date(v) > new Date(), msg.futureDate);

// ============ Cross-field helpers ============

// Cross-field match helper — dùng với .superRefine trên object schema
export function requireMatch<T extends Record<string, unknown>>(a: keyof T, b: keyof T, message = msg.mismatch) {
  return (data: T, ctx: z.RefinementCtx) => {
    if (data[a] !== data[b]) {
      ctx.addIssue({
        code: "custom",
        message,
        path: [b as string],
      });
    }
  };
}
