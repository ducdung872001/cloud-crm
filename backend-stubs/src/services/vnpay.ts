import { createHmac } from "node:crypto";
import { config } from "../config.js";

/**
 * VNPay redirect signing + webhook signature verify.
 *
 * VNPay docs: HMAC-SHA512 với HASH_SECRET. Tham số sort theo key, build
 * query string, KHÔNG include vnp_SecureHash + vnp_SecureHashType khi tính.
 *
 * Mock mode: nếu HASH_SECRET = "MOCKSECRET" (default), redirect URL vẫn build
 * + sign nhưng webhook handler sẽ accept mọi signature (DEV ONLY).
 */

const VNPAY_BASE = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND = "pay";
const VNPAY_LOCALE = "vn";
const VNPAY_CURR = "VND";

export interface BuildVnpayInput {
  invoiceId: string;
  amountVND: number;
  ipAddr?: string;
  orderInfo?: string;
}

export function buildVnpayUrl(input: BuildVnpayInput): string {
  const now = new Date();
  const createDate = formatYyyyMmDdHhMmSs(now);
  const expireDate = formatYyyyMmDdHhMmSs(new Date(now.getTime() + 15 * 60_000)); // 15 phút

  const params: Record<string, string> = {
    vnp_Version: VNPAY_VERSION,
    vnp_Command: VNPAY_COMMAND,
    vnp_TmnCode: config.vnpay.tmnCode,
    vnp_Amount: String(input.amountVND * 100), // VNPay yêu cầu nhân 100
    vnp_CurrCode: VNPAY_CURR,
    vnp_TxnRef: input.invoiceId,
    vnp_OrderInfo: input.orderInfo ?? `MentorHub invoice ${input.invoiceId}`,
    vnp_OrderType: "other",
    vnp_Locale: VNPAY_LOCALE,
    vnp_ReturnUrl: config.vnpay.returnUrl,
    vnp_IpAddr: input.ipAddr ?? "127.0.0.1",
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const signed = signParams(params, config.vnpay.hashSecret);
  return `${VNPAY_BASE}?${buildQuery(signed)}`;
}

/**
 * Verify chữ ký webhook trả về.
 * Trong dev mock (HASH_SECRET = "MOCKSECRET") → accept tất cả để test flow.
 */
export function verifyVnpaySignature(params: Record<string, string>): boolean {
  if (config.vnpay.hashSecret === "MOCKSECRET") return true; // DEV ONLY
  const provided = params.vnp_SecureHash ?? "";
  if (!provided) return false;
  const without = { ...params };
  delete without.vnp_SecureHash;
  delete without.vnp_SecureHashType;
  const expected = computeHmac(without, config.vnpay.hashSecret);
  return expected.toLowerCase() === provided.toLowerCase();
}

function signParams(params: Record<string, string>, secret: string): Record<string, string> {
  const hash = computeHmac(params, secret);
  return { ...params, vnp_SecureHash: hash };
}

function computeHmac(params: Record<string, string>, secret: string): string {
  const sorted = Object.keys(params).sort();
  const data = sorted
    .map((k) => `${k}=${encodeURIComponent(params[k]!).replace(/%20/g, "+")}`)
    .join("&");
  return createHmac("sha512", secret).update(data).digest("hex");
}

function buildQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k]!)}`)
    .join("&");
}

function formatYyyyMmDdHhMmSs(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}
