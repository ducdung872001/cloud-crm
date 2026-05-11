// Quản lý template thông báo cho 10 loại event loyalty
// Phục vụ UR-CFG-04 — Notification template (URD part-11)
import React, { useEffect, useMemo, useState } from "react";
import HeaderTabMenu from "@/components/HeaderTabMenu/HeaderTabMenu";

type Channel = "sms" | "zalo" | "email" | "push";
type EventType =
  | "signup_welcome"
  | "points_earned"
  | "points_expiring_soon"
  | "points_expired"
  | "tier_upgraded"
  | "tier_downgraded"
  | "tier_grace_warning"
  | "reward_redeemed"
  | "voucher_expiring"
  | "campaign_announcement"
  | "ticket_status_change";

interface NotificationTemplate {
  eventType: EventType;
  channels: Record<Channel, { enabled: boolean; subject?: string; body: string }>;
  active: boolean;
  updatedAt: string;
}

const EVENT_META: Record<EventType, { label: string; description: string; defaultPriority: "high" | "normal" }> = {
  signup_welcome: {
    label: "Đăng ký hội viên mới",
    description: "Gửi khi KH hoàn tất đăng ký + welcome bonus",
    defaultPriority: "high",
  },
  points_earned: {
    label: "Tích điểm thành công",
    description: "Gửi sau mỗi giao dịch auto-earn (có thể throttle)",
    defaultPriority: "normal",
  },
  points_expiring_soon: {
    label: "Sắp hết hạn điểm",
    description: "Nhắc 30 / 14 / 7 / 1 ngày trước khi điểm hết hạn",
    defaultPriority: "high",
  },
  points_expired: {
    label: "Đã hết hạn điểm",
    description: "Thông báo sau khi điểm bị trừ do hết hạn",
    defaultPriority: "normal",
  },
  tier_upgraded: {
    label: "Lên hạng",
    description: "Chúc mừng KH khi lên hạng",
    defaultPriority: "high",
  },
  tier_downgraded: {
    label: "Xuống hạng",
    description: "Thông báo khi KH xuống hạng (sau grace period)",
    defaultPriority: "normal",
  },
  tier_grace_warning: {
    label: "Vào grace period",
    description: "Cảnh báo KH cần thêm X điểm để duy trì hạng",
    defaultPriority: "high",
  },
  reward_redeemed: {
    label: "Đổi quà thành công",
    description: "Voucher code + hướng dẫn sử dụng",
    defaultPriority: "high",
  },
  voucher_expiring: {
    label: "Voucher sắp hết hạn",
    description: "Nhắc trước 3 ngày voucher hết hạn",
    defaultPriority: "normal",
  },
  campaign_announcement: {
    label: "Campaign mới",
    description: "Thông báo campaign tới segment KH target",
    defaultPriority: "normal",
  },
  ticket_status_change: {
    label: "Trạng thái ticket thay đổi",
    description: "Thông báo KH khi CSKH cập nhật ticket",
    defaultPriority: "normal",
  },
};

const CHANNEL_META: Record<Channel, { label: string; icon: string; color: string }> = {
  sms: { label: "SMS", icon: "📱", color: "#3B82F6" },
  zalo: { label: "Zalo OA", icon: "💙", color: "#0084FF" },
  email: { label: "Email", icon: "✉️", color: "#6366F1" },
  push: { label: "Push App", icon: "🔔", color: "#F59E0B" },
};

const DEFAULT_VARIABLES = [
  "{name}",
  "{phone}",
  "{points}",
  "{balance}",
  "{tier}",
  "{voucher_code}",
  "{expires_at}",
  "{order_ref}",
  "{store_name}",
  "{brand_name}",
  "{unsubscribe_url}",
];

const SAMPLE_TEMPLATES: Record<EventType, NotificationTemplate> = Object.keys(EVENT_META).reduce(
  (acc, key) => {
    const k = key as EventType;
    acc[k] = {
      eventType: k,
      active: true,
      updatedAt: "2026-05-10T10:00:00+07:00",
      channels: {
        sms: { enabled: true, body: getDefaultBody(k, "sms") },
        zalo: { enabled: true, body: getDefaultBody(k, "zalo") },
        email: { enabled: false, subject: getDefaultSubject(k), body: getDefaultBody(k, "email") },
        push: { enabled: true, body: getDefaultBody(k, "push") },
      },
    };
    return acc;
  },
  {} as Record<EventType, NotificationTemplate>,
);

function getDefaultSubject(t: EventType): string {
  const map: Record<EventType, string> = {
    signup_welcome: "🎉 Chào mừng bạn đến với chương trình thành viên",
    points_earned: "+{points} điểm vừa được cộng vào tài khoản",
    points_expiring_soon: "⏰ {points} điểm sắp hết hạn",
    points_expired: "Điểm đã hết hạn",
    tier_upgraded: "🏆 Chúc mừng bạn lên hạng {tier}",
    tier_downgraded: "Hạng thành viên đã cập nhật",
    tier_grace_warning: "Hành động cần làm để duy trì hạng {tier}",
    reward_redeemed: "🎁 Mã đổi thưởng của bạn: {voucher_code}",
    voucher_expiring: "Voucher {voucher_code} sắp hết hạn",
    campaign_announcement: "Ưu đãi đặc biệt dành cho bạn",
    ticket_status_change: "Cập nhật yêu cầu hỗ trợ #{order_ref}",
  };
  return map[t];
}

function getDefaultBody(t: EventType, c: Channel): string {
  const sms: Record<EventType, string> = {
    signup_welcome: "Chao {name}! Ban da dang ky thanh cong. +500 diem chao mung. So du: {balance}d.",
    points_earned: "+{points}d (tu don {order_ref}). So du: {balance}d. Cam on {name}!",
    points_expiring_soon: "{name} oi, {points}d sap het han {expires_at}. Doi qua ngay!",
    points_expired: "{points}d cua ban da het han. So du moi: {balance}d.",
    tier_upgraded: "Chuc mung {name}! Ban da len hang {tier}. Xem quyen loi tai app.",
    tier_downgraded: "Hang thanh vien cap nhat: {tier}. Tich them de len hang.",
    tier_grace_warning: "{name} can them {points}d trong thang nay de duy tri hang {tier}.",
    reward_redeemed: "Ma voucher: {voucher_code}. Hieu luc den {expires_at}. Cam on {name}!",
    voucher_expiring: "Voucher {voucher_code} het han {expires_at}. Dung ngay!",
    campaign_announcement: "Uu dai dac biet danh cho {name}: tich x2 cuoi tuan tai {brand_name}.",
    ticket_status_change: "Yeu cau ho tro {order_ref} cap nhat. Xem chi tiet tai app.",
  };

  const email: Record<EventType, string> = {
    signup_welcome:
      "Xin chào {name},\n\nCảm ơn bạn đã đăng ký thành viên. Chúng tôi đã cộng 500 điểm chào mừng vào tài khoản của bạn.\n\nSố dư hiện tại: {balance}đ\nHạng thành viên: {tier}\n\nTrân trọng,\n{brand_name}\n\n— Huỷ đăng ký: {unsubscribe_url}",
    points_earned:
      "Xin chào {name},\n\nBạn vừa tích thêm {points} điểm từ đơn {order_ref} tại {store_name}.\n\nSố dư mới: {balance} điểm\nHạng: {tier}\n\n— {brand_name}",
    points_expiring_soon:
      "Xin chào {name},\n\nBạn còn {points} điểm sẽ hết hạn vào {expires_at}.\n\nĐổi quà ngay tại app/website hoặc dùng trực tiếp tại quầy thanh toán.\n\n— {brand_name}\n— Huỷ đăng ký: {unsubscribe_url}",
    points_expired:
      "Xin chào {name},\n\n{points} điểm của bạn đã hết hạn vào {expires_at}.\n\nSố dư hiện tại: {balance} điểm\n\n— {brand_name}",
    tier_upgraded:
      "🏆 Chúc mừng {name}!\n\nBạn đã lên hạng {tier}. Quyền lợi mới đã được kích hoạt.\n\n— {brand_name}",
    tier_downgraded:
      "Xin chào {name},\n\nHạng thành viên của bạn đã được cập nhật về {tier} theo quy tắc đánh giá định kỳ.\n\n— {brand_name}",
    tier_grace_warning:
      "Xin chào {name},\n\nBạn cần thêm {points} điểm trong tháng này để duy trì hạng {tier}.\n\n— {brand_name}",
    reward_redeemed:
      "Xin chào {name},\n\nMã đổi thưởng của bạn: {voucher_code}\nHiệu lực đến: {expires_at}\n\nXuất trình mã khi thanh toán hoặc nhập vào website.\n\n— {brand_name}",
    voucher_expiring:
      "Xin chào {name},\n\nVoucher {voucher_code} sẽ hết hạn vào {expires_at}. Hãy sử dụng sớm!\n\n— {brand_name}",
    campaign_announcement:
      "Xin chào {name},\n\nƯu đãi đặc biệt dành cho bạn — tích điểm × 2 cuối tuần tại {brand_name}.\n\n— Huỷ đăng ký: {unsubscribe_url}",
    ticket_status_change:
      "Xin chào {name},\n\nYêu cầu hỗ trợ #{order_ref} của bạn đã có cập nhật. Vui lòng xem chi tiết tại app.\n\n— {brand_name}",
  };

  if (c === "email") return email[t];
  if (c === "sms") return sms[t];
  // zalo/push — dùng SMS làm baseline rút gọn
  return sms[t];
}

interface Props {
  onBackProps?: (v: boolean) => void;
}

export default function NotificationTemplateConfig({ onBackProps }: Props) {
  const [templates, setTemplates] = useState<Record<EventType, NotificationTemplate>>(SAMPLE_TEMPLATES);
  const [selectedEvent, setSelectedEvent] = useState<EventType>("points_earned");
  const [activeChannel, setActiveChannel] = useState<Channel>("sms");
  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Cấu hình thông báo";
  }, []);

  const selected = templates[selectedEvent];
  const channelData = selected.channels[activeChannel];

  const handleUpdateBody = (newBody: string) => {
    setTemplates((prev) => ({
      ...prev,
      [selectedEvent]: {
        ...prev[selectedEvent],
        channels: {
          ...prev[selectedEvent].channels,
          [activeChannel]: { ...prev[selectedEvent].channels[activeChannel], body: newBody },
        },
      },
    }));
  };

  const handleUpdateSubject = (newSubject: string) => {
    setTemplates((prev) => ({
      ...prev,
      [selectedEvent]: {
        ...prev[selectedEvent],
        channels: {
          ...prev[selectedEvent].channels,
          [activeChannel]: { ...prev[selectedEvent].channels[activeChannel], subject: newSubject },
        },
      },
    }));
  };

  const handleToggleChannel = () => {
    setTemplates((prev) => ({
      ...prev,
      [selectedEvent]: {
        ...prev[selectedEvent],
        channels: {
          ...prev[selectedEvent].channels,
          [activeChannel]: { ...prev[selectedEvent].channels[activeChannel], enabled: !channelData.enabled },
        },
      },
    }));
  };

  const handleInsertVariable = (variable: string) => {
    handleUpdateBody(channelData.body + variable);
  };

  const handleTestSend = async () => {
    if (!testPhone.match(/^\+?\d{9,12}$/)) {
      setTestResult("Số điện thoại không hợp lệ. Định dạng: +84... hoặc 09...");
      return;
    }
    setTestResult("⏳ Đang gửi test...");
    setTimeout(() => {
      setTestResult(
        `✅ Đã gửi tin test qua ${CHANNEL_META[activeChannel].label} đến ${testPhone}. Kiểm tra inbox/hộp thư.`,
      );
    }, 1000);
  };

  const preview = useMemo(() => {
    return channelData.body
      .replace(/{name}/g, "Nguyễn Văn A")
      .replace(/{phone}/g, "0901234567")
      .replace(/{points}/g, "350")
      .replace(/{balance}/g, "1.500")
      .replace(/{tier}/g, "Vàng")
      .replace(/{voucher_code}/g, "VC50K-2026")
      .replace(/{expires_at}/g, "31/05/2026")
      .replace(/{order_ref}/g, "POS-A001-001")
      .replace(/{store_name}/g, "Siêu thị Q1")
      .replace(/{brand_name}/g, "Brand A")
      .replace(/{unsubscribe_url}/g, "https://...");
  }, [channelData.body]);

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#F5F9F8" }}>
      {onBackProps && (
        <HeaderTabMenu
          title="Cấu hình thông báo gửi KH"
          titleBack="Cấu hình Loyalty"
          onBackProps={onBackProps}
        />
      )}

      <div style={{ display: "flex", padding: "20px 24px", gap: 16 }}>
        {/* Left: Event list */}
        <div
          style={{
            width: 280,
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            padding: 12,
            height: "fit-content",
          }}
        >
          <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 8, padding: "0 8px" }}>Loại thông báo</div>
          {(Object.keys(EVENT_META) as EventType[]).map((evt) => {
            const meta = EVENT_META[evt];
            const tpl = templates[evt];
            const activeChannels = Object.values(tpl.channels).filter((c) => c.enabled).length;
            return (
              <button
                key={evt}
                onClick={() => setSelectedEvent(evt)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: selectedEvent === evt ? "#F0F9FF" : "transparent",
                  border: "none",
                  borderRadius: 8,
                  textAlign: "left",
                  cursor: "pointer",
                  marginBottom: 2,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: selectedEvent === evt ? 600 : 500,
                      color: selectedEvent === evt ? "#0E7490" : "#1E293B",
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748B",
                      background: "#F1F5F9",
                      padding: "2px 6px",
                      borderRadius: 10,
                    }}
                  >
                    {activeChannels}/4
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Editor */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{EVENT_META[selectedEvent].label}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{EVENT_META[selectedEvent].description}</div>
            </div>

            {/* Channel tabs */}
            <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E2E8F0", marginBottom: 16 }}>
              {(Object.keys(CHANNEL_META) as Channel[]).map((c) => {
                const cmeta = CHANNEL_META[c];
                const isActive = activeChannel === c;
                const isEnabled = selected.channels[c].enabled;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveChannel(c)}
                    style={{
                      padding: "10px 16px",
                      background: "transparent",
                      border: "none",
                      borderBottom: isActive ? `2px solid ${cmeta.color}` : "2px solid transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? cmeta.color : "#64748B",
                      opacity: isEnabled ? 1 : 0.5,
                    }}
                  >
                    {cmeta.icon} {cmeta.label}
                    {!isEnabled && " (tắt)"}
                  </button>
                );
              })}
            </div>

            {/* Enable toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: channelData.enabled ? "#ECFDF5" : "#FEF2F2",
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 13, color: channelData.enabled ? "#065F46" : "#991B1B" }}>
                {channelData.enabled
                  ? `✓ Gửi ${CHANNEL_META[activeChannel].label} cho event này`
                  : `✗ Tắt ${CHANNEL_META[activeChannel].label} cho event này`}
              </span>
              <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={channelData.enabled}
                  onChange={handleToggleChannel}
                  style={{ marginRight: 6 }}
                />
                <span style={{ fontSize: 12, fontWeight: 500 }}>Bật</span>
              </label>
            </div>

            {/* Subject (email only) */}
            {activeChannel === "email" && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 4, fontWeight: 600 }}>
                  Tiêu đề email
                </label>
                <input
                  value={channelData.subject || ""}
                  onChange={(e) => handleUpdateSubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #CBD5E1",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                />
              </div>
            )}

            {/* Body */}
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 4, fontWeight: 600 }}>
                Nội dung
              </label>
              <textarea
                value={channelData.body}
                onChange={(e) => handleUpdateBody(e.target.value)}
                rows={activeChannel === "email" ? 10 : 5}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #CBD5E1",
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "ui-monospace, monospace",
                  resize: "vertical",
                }}
              />
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, textAlign: "right" }}>
                {channelData.body.length} ký tự
                {activeChannel === "sms" && channelData.body.length > 160 && (
                  <span style={{ color: "#DC2626", marginLeft: 8 }}>⚠️ Vượt 160 ký tự — sẽ chia nhiều SMS</span>
                )}
              </div>
            </div>

            {/* Variables */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: 600 }}>Variables (nhấp để chèn)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEFAULT_VARIABLES.map((v) => (
                  <button
                    key={v}
                    onClick={() => handleInsertVariable(v)}
                    style={{
                      padding: "4px 10px",
                      background: "#EEF2FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#3730A3",
                      cursor: "pointer",
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Save bar */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #E2E8F0",
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => alert("Khôi phục template mặc định cho event này.")}
                style={{
                  padding: "8px 16px",
                  background: "#fff",
                  border: "1px solid #CBD5E1",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Khôi phục mặc định
              </button>
              <button
                onClick={() => alert("Đã lưu — audit log ghi nhận thay đổi.")}
                style={{
                  padding: "8px 20px",
                  background: "#0E7490",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Preview + Test */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #E2E8F0",
              padding: 20,
            }}
          >
            <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 12, fontSize: 14 }}>
              📱 Preview & Test
            </div>
            <div
              style={{
                background: "#F8FAFC",
                border: "1px dashed #94A3B8",
                borderRadius: 8,
                padding: 14,
                marginBottom: 12,
                whiteSpace: "pre-wrap",
                fontSize: 13,
                color: "#1E293B",
                fontFamily: activeChannel === "sms" || activeChannel === "push" ? "ui-monospace, monospace" : "inherit",
              }}
            >
              {activeChannel === "email" && channelData.subject && (
                <div style={{ fontWeight: 700, marginBottom: 8, color: "#0F172A" }}>
                  {channelData.subject
                    .replace(/{name}/g, "Nguyễn Văn A")
                    .replace(/{points}/g, "350")
                    .replace(/{tier}/g, "Vàng")
                    .replace(/{voucher_code}/g, "VC50K-2026")
                    .replace(/{order_ref}/g, "POS-A001-001")}
                </div>
              )}
              {preview}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                placeholder="Phone test (vd: 0901234567)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  border: "1px solid #CBD5E1",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <button
                onClick={handleTestSend}
                disabled={!testPhone}
                style={{
                  padding: "8px 14px",
                  background: testPhone ? "#0E7490" : "#CBD5E1",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: testPhone ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Gửi test
              </button>
            </div>
            {testResult && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: testResult.startsWith("✅") ? "#ECFDF5" : "#FEF3C7",
                  borderRadius: 6,
                  fontSize: 12,
                  color: testResult.startsWith("✅") ? "#065F46" : "#92400E",
                }}
              >
                {testResult}
              </div>
            )}
          </div>

          {/* Compliance note */}
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: "#FEF9E7",
              border: "1px solid #FDE68A",
              borderRadius: 8,
              fontSize: 12,
              color: "#78350F",
            }}
          >
            <b>⚖️ Compliance (NĐ 91/2020):</b> Email phải có link <code>{"{unsubscribe_url}"}</code>. Gửi trong khung 7h–22h
            (Asia/HCM), không Chủ Nhật. Throttle tối đa 3 tin/KH/tuần (toàn hệ thống).
          </div>
        </div>
      </div>
    </div>
  );
}
