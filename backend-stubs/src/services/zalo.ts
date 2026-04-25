import { config } from "../config.js";

/**
 * Zalo OA Message API wrapper.
 *
 * Zalo yêu cầu mỗi mẫu tin phải được ĐĂNG KÝ & DUYỆT trong OA console trước
 * khi dùng `message/transaction` endpoint. Xem docs/zalo-oa-templates.json.
 *
 * Template ID sẽ được Zalo cấp sau approval — hiện để placeholder.
 */

// Template IDs & metadata. Khi approval xong, điền templateId thực từ Zalo.
export const ZALO_TEMPLATES = {
  new_enrollment: { templateId: "TBD_ENROLL", name: "Học viên đăng ký khoá" },
  payment_received: { templateId: "TBD_PAYMENT", name: "Thanh toán học phí" },
  session_reminder: { templateId: "TBD_REMINDER", name: "Nhắc buổi học" },
  ai_note_ready: { templateId: "TBD_AINOTE", name: "AI note sẵn sàng" },
  new_5star_review: { templateId: "TBD_REVIEW", name: "Đánh giá 5 sao mới" },
  ticket_urgent: { templateId: "TBD_TICKET", name: "Ticket khẩn" },
  trial_ending: { templateId: "TBD_TRIAL", name: "Trial sắp hết hạn" },
} as const;

export type ZaloTemplateKey = keyof typeof ZALO_TEMPLATES;

export interface ZaloPushRequest {
  zaloUserId: string;
  template: ZaloTemplateKey | string;
  params: Record<string, unknown>;
}

export async function sendZaloPush(req: ZaloPushRequest): Promise<{ sent: boolean; messageId?: string; error?: string }> {
  if (!config.zalo.oaAccessToken) {
    console.log("[ZALO MOCK] Push:", req.template, "to", req.zaloUserId, req.params);
    return { sent: true, messageId: "MOCK-" + Date.now() };
  }

  // POST https://openapi.zalo.me/v3.0/oa/message/transaction
  // Headers: { access_token: config.zalo.oaAccessToken }
  // Body: { recipient: { user_id }, message: { attachment: { type: "template", payload: { ... } } } }
  // TODO: real impl
  return { sent: true, messageId: "TODO" };
}
