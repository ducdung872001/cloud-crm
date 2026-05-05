// Modal xem chi tiết 1 đăng ký — toàn bộ thông tin người đăng ký đã nhập:
// thông tin cá nhân, dynamic fields, add-on, multi-day, payment proof, check-in history.
import React from "react";
import type { EventEntity, EventRegistration } from "../types";
import { THEME, formatVND, computeRegistrationTotal } from "../shared";
import { formatVNDateTime } from "../datetime";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  checked_in: "Đã check-in",
  cancelled: "Đã huỷ",
  no_show: "Không đến",
};

const PAY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_required: { label: "Miễn phí", color: "#6B7280" },
  pending: { label: "Chưa upload", color: "#92400E" },
  submitted: { label: "Chờ duyệt", color: "#1E40AF" },
  approved: { label: "Đã duyệt", color: "#065F46" },
  rejected: { label: "Từ chối", color: "#991B1B" },
};

const formatDateTime = formatVNDateTime;

export default function RegistrationDetailModal({
  event,
  registration,
  onClose,
}: {
  event: EventEntity;
  registration: EventRegistration;
  onClose: () => void;
}) {
  const r = registration;
  const proofs: typeof r.paymentProofs =
    (r.paymentProofs && r.paymentProofs.length > 0)
      ? r.paymentProofs
      : (r.paymentProof ? [r.paymentProof] : []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(11,46,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          maxWidth: 720,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${THEME.primaryDark}, ${THEME.primary})`,
            color: "#fff",
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Chi tiết đăng ký · {event.title}
            </div>
            <h3 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>
              {r.fullName}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ✕ Đóng
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Meta line */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
            <Badge
              text={STATUS_LABELS[r.status] ?? r.status}
              color={THEME.primaryDark}
              bg={THEME.primarySoft}
            />
            {r.ticketCode && (
              <Badge text={`🎟️ ${r.ticketCode}`} color="#065F46" bg="#D1FAE5" />
            )}
            {r.convertedToCustomerId && (
              <Badge text="✓ Hội viên" color="#065F46" bg="#D1FAE5" />
            )}
            <Badge
              text={`Đăng ký lúc: ${formatDateTime(r.registeredAt)}`}
              color={THEME.textMuted}
              bg={THEME.bg}
            />
          </div>

          {/* 1. Thông tin cá nhân */}
          <Section title="👤 Thông tin cá nhân">
            <Row label="Họ tên" value={r.fullName} />
            <Row label="Số điện thoại" value={r.phone} />
            <Row label="Email" value={r.email} />
            <Row label="Công ty / tổ chức" value={r.company} />
            <Row label="Ghi chú" value={r.note} multiline />
            <Row label="Nguồn" value={r.source === "public_portal" ? "Đăng ký từ trang public" : r.source} />
            {r.utmSource && <Row label="UTM source" value={r.utmSource} />}
            {r.utmCampaign && <Row label="UTM campaign" value={r.utmCampaign} />}
          </Section>

          {/* 2. Ngày tham gia (multi-day) */}
          {r.selectedDates && r.selectedDates.length > 0 && (
            <Section title="📅 Ngày tham gia">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {r.selectedDates.map((d) => (
                  <Badge key={d} text={d} color={THEME.primaryDark} bg={THEME.primarySoft} />
                ))}
              </div>
            </Section>
          )}

          {/* 3. Trường tùy biến */}
          {r.dynamicFieldValues && Object.keys(r.dynamicFieldValues).length > 0 && (
            <Section title="📝 Thông tin bổ sung">
              {(event.dynamicFields ?? []).map((f) => {
                const v = r.dynamicFieldValues?.[f.id];
                if (v === undefined || v === null || String(v).trim() === "") return null;
                return <Row key={f.id} label={f.label} value={String(v)} multiline />;
              })}
            </Section>
          )}

          {/* 4. Add-on đã chọn */}
          {r.selectedAddOns && r.selectedAddOns.length > 0 && (
            <Section title="🛍️ Sản phẩm / dịch vụ bổ sung">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: THEME.bg, textAlign: "left" }}>
                    <th style={th}>Tên</th>
                    <th style={{ ...th, textAlign: "right" }}>Đơn giá</th>
                    <th style={{ ...th, textAlign: "center" }}>SL</th>
                    <th style={{ ...th, textAlign: "right" }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {r.selectedAddOns.map((s) => {
                    const item = (event.addOnItems ?? []).find((i) => i.id === s.addOnId);
                    const name = item?.name ?? s.addOnId;
                    const price = item?.unitPrice ?? 0;
                    return (
                      <tr key={s.addOnId} style={{ borderTop: `1px solid ${THEME.border}` }}>
                        <td style={td}>
                          {name}
                          {item?.group && (
                            <div style={{ fontSize: 10, color: THEME.textMuted }}>{item.group}</div>
                          )}
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>{formatVND(price)}đ</td>
                        <td style={{ ...td, textAlign: "center" }}>{s.qty}</td>
                        <td style={{ ...td, textAlign: "right", fontWeight: 700, color: THEME.primaryDark }}>
                          {formatVND(price * s.qty)}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>
          )}

          {/* 5. Tổng tiền (fallback compute từ ticket + add-ons nếu BE không trả) */}
          {(() => {
            const total = computeRegistrationTotal(r, event);
            if (total <= 0) return null;
            return (
              <Section title="💰 Tổng tiền">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: THEME.primarySoft,
                    borderRadius: 8,
                    border: `1px solid ${THEME.primary}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: THEME.primaryDark, fontWeight: 700 }}>
                    Tổng cộng
                  </span>
                  <span style={{ fontSize: 18, color: THEME.primaryDark, fontWeight: 800 }}>
                    {formatVND(total)} đ
                  </span>
                </div>
              </Section>
            );
          })()}

          {/* 6. Thanh toán */}
          {proofs.length > 0 && (
            <Section title="💳 Thanh toán">
              {proofs.map((p, i) => {
                const cfg = PAY_STATUS_LABELS[p.status] ?? PAY_STATUS_LABELS.pending;
                return (
                  <div
                    key={i}
                    style={{
                      marginTop: i === 0 ? 0 : 10,
                      padding: 12,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 8,
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <Badge text={cfg.label} color={cfg.color} bg="#fff" />
                      <span style={{ fontSize: 11, color: THEME.textMuted }}>
                        Upload: {formatDateTime(p.submittedAt)}
                      </span>
                    </div>
                    {p.imageUrl && (
                      <a href={p.imageUrl} target="_blank" rel="noreferrer">
                        <img
                          src={p.imageUrl}
                          alt={`Bằng chứng ${i + 1}`}
                          style={{ maxWidth: "100%", borderRadius: 6, border: `1px solid ${THEME.border}` }}
                        />
                      </a>
                    )}
                    {p.rejectReason && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "6px 10px",
                          background: "#FEE2E2",
                          color: "#991B1B",
                          fontSize: 12,
                          borderRadius: 4,
                        }}
                      >
                        Lý do từ chối: {p.rejectReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </Section>
          )}

          {/* 7. Check-in history */}
          {r.checkInOutRecords && r.checkInOutRecords.length > 0 && (
            <Section title="✅ Lịch sử check-in / check-out">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: THEME.bg, textAlign: "left" }}>
                    <th style={th}>Ngày</th>
                    <th style={th}>Check-in</th>
                    <th style={th}>Check-out</th>
                    <th style={th}>Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {r.checkInOutRecords.map((c, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${THEME.border}` }}>
                      <td style={td}>{c.selectedDate ?? "—"}</td>
                      <td style={td}>{formatDateTime(c.checkedInAt)}</td>
                      <td style={td}>{formatDateTime(c.checkedOutAt)}</td>
                      <td style={td}>{c.checkedInBy ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        style={{
          margin: "0 0 8px 0",
          fontSize: 13,
          color: THEME.primaryDark,
          fontWeight: 700,
          borderBottom: `1px solid ${THEME.border}`,
          paddingBottom: 6,
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  if (!value || !String(value).trim()) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: 8,
        padding: "4px 0",
        fontSize: 13,
        alignItems: multiline ? "flex-start" : "baseline",
      }}
    >
      <div style={{ color: THEME.textMuted, fontSize: 12 }}>{label}</div>
      <div
        style={{
          color: THEME.textMain,
          whiteSpace: multiline ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

const th: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: THEME.primaryDark,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const td: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 12,
  color: THEME.textMain,
  verticalAlign: "top",
};
