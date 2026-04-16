// Public page cho sự kiện — không cần đăng nhập.
// URL: /share_event?slug={slug}
//
// Prototype: đọc localStorage. BE thật sẽ gọi public endpoint
//   GET /marketing/events/public/{slug}
//   POST /marketing/events/public/{slug}/register

import React, { useEffect, useMemo, useState } from "react";
import { eventStorage } from "@/pages/CommunityHub/Events/storage";
import type { EventEntity, SelectedAddOn, PaymentProof } from "@/pages/CommunityHub/Events/types";
import DynamicFieldsRenderer from "@/pages/CommunityHub/Events/components/DynamicFieldsRenderer";
import AddOnItemsSelector from "@/pages/CommunityHub/Events/components/AddOnItemsSelector";
import PaymentProofUpload from "@/pages/CommunityHub/Events/components/PaymentProofUpload";

const THEME = {
  primary: "#00C9A7",
  primaryDark: "#0B2E2A",
  primarySoft: "#E4F7F3",
  accent: "#FF8A3C",
  danger: "#E85D4B",
  warning: "#F5A623",
  success: "#22C55E",
  textMain: "#1A2B28",
  textMuted: "#6B8A85",
  border: "#D9E0DE",
  bg: "#F5F9F8",
};

function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}/${d.getFullYear()}`;
}

export default function ShareEventPage() {
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [submitted, setSubmitted] = useState<{
    ticketCode?: string;
    registrationId?: string;
  } | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    note: "",
  });
  // ── CHUNG: Mở rộng state ──
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { slug, heroStyle } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      slug: params.get("slug") ?? "",
      heroStyle: (params.get("layout") ?? "card") as "card" | "cover",
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }
    const e = eventStorage.getEventBySlug(slug);
    if (!e || (e.status !== "published" && e.status !== "ongoing")) {
      setNotFound(true);
    } else {
      setEvent(e);
      document.title = `${e.title} — Đăng ký ngay`;
    }
  }, [slug]);

  if (notFound) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: 20,
        }}
      >
        <div style={{ fontSize: 60 }}>🔍</div>
        <h1 style={{ color: THEME.primaryDark, marginTop: 10 }}>
          Không tìm thấy sự kiện
        </h1>
        <p style={{ color: THEME.textMuted, fontSize: 14 }}>
          Sự kiện có thể đã bị ẩn, xoá hoặc link không đúng.
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: THEME.textMuted }}>Đang tải…</div>
      </div>
    );
  }

  const now = new Date();
  const regOpen = new Date(event.registrationOpenDate);
  const regClose = new Date(event.registrationCloseDate);
  const regNotYet = now < regOpen;
  const regClosed = now > regClose;
  const registrations = eventStorage.listRegistrationsByEvent(event.id);
  const activeCount = registrations.filter((r) => r.status !== "cancelled").length;
  const isFull = !!event.maxAttendees && activeCount >= event.maxAttendees;
  const canRegister = !regNotYet && !regClosed && !isFull;

  // ── Tính tổng tiền ──
  const ticketPrice = event.ticketPrice ?? 0;
  const addOnSubtotal = selectedAddOns.reduce((sum, s) => {
    const item = (event.addOnItems ?? []).find((i) => i.id === s.addOnId);
    return sum + (item ? item.unitPrice * s.qty : 0);
  }, 0);
  const grandTotal = ticketPrice + addOnSubtotal;

  const handleSubmit = () => {
    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!form.phone.trim() || form.phone.replace(/[^\d]/g, "").length < 9) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    // Validate multi-day selection
    if (event.selectableDates?.length && selectedDates.length === 0) {
      setError("Vui lòng chọn ít nhất 1 ngày tham gia");
      return;
    }
    // Validate dynamic required fields
    if (event.dynamicFields?.length) {
      for (const f of event.dynamicFields) {
        if (f.required && !(dynamicValues[f.id] ?? "").trim()) {
          setError(`Vui lòng điền "${f.label}"`);
          return;
        }
      }
    }
    // Validate payment proof
    if (event.requirePaymentProof && grandTotal > 0 && !paymentProofUrl) {
      setError("Vui lòng upload bằng chứng thanh toán");
      return;
    }

    setSubmitting(true);
    const paymentProof: PaymentProof | undefined =
      paymentProofUrl
        ? {
            imageUrl: paymentProofUrl,
            submittedAt: new Date().toISOString(),
            status: "submitted",
          }
        : undefined;

    const result = eventStorage.registerForEvent(event.slug, {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      company: form.company.trim() || undefined,
      note: form.note.trim() || undefined,
      source: "public_portal",
      dynamicFieldValues: Object.keys(dynamicValues).length ? dynamicValues : undefined,
      selectedAddOns: selectedAddOns.length ? selectedAddOns : undefined,
      totalAmount: grandTotal || undefined,
      selectedDates: selectedDates.length ? selectedDates : undefined,
      paymentProof,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Đăng ký thất bại");
      return;
    }
    setSubmitted({
      registrationId: result.registration?.id,
      ticketCode: result.registration?.ticketCode,
    });
    setShowRegisterForm(false);
    window.scrollTo(0, 0);
  };

  const hasGallery = (event.galleryImageUrls ?? []).length > 0;
  const hasDynamicFields = (event.dynamicFields ?? []).length > 0;
  const hasAddOns = (event.addOnItems ?? []).length > 0;
  const hasMultiDay = (event.selectableDates ?? []).length > 0;
  const needsPayment = event.requirePaymentProof && grandTotal > 0;

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.textMain }}>
      {/* Top brand bar */}
      <div
        style={{
          background: THEME.primaryDark,
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌱</span>
          <strong>Reborn Community Hub</strong>
        </div>
        <span style={{ fontSize: 11, opacity: 0.7 }}>Sự kiện công khai</span>
      </div>

      {heroStyle === "cover" ? (
        /* ── Layout A: ảnh cover full-width, text overlay ── */
        <div
          style={{
            background: event.coverImageUrl
              ? `linear-gradient(180deg, rgba(11,46,42,0.45), rgba(11,46,42,0.85)), url(${event.coverImageUrl}) center/cover`
              : `linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.primary})`,
            color: "#fff",
            padding: "60px 20px 80px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {event.category && (
              <span style={{ display: "inline-block", padding: "4px 14px", background: "rgba(255,255,255,0.25)", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                {event.category}
              </span>
            )}
            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.2, color: "#fff" }}>{event.title}</h1>
            <p style={{ fontSize: 16, marginTop: 12, opacity: 0.95 }}>{event.description}</p>
            <div style={{ marginTop: 20, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", fontSize: 13 }}>
              <div>🕐 {formatDateTime(event.startDate)}</div>
              <div>📍 {event.venue.isOnline ? "Online" : event.venue.name}</div>
              <div>💰 {event.ticketPrice ? `${formatVND(event.ticketPrice)} đ` : "Miễn phí"}</div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Layout B (mặc định): ảnh + title card nền solid ── */
        <div
          style={{
            background: THEME.primaryDark,
            color: "#fff",
            padding: "28px 20px 32px",
            textAlign: "center",
          }}
        >
          {event.coverImageUrl && (
            <div style={{ maxWidth: 800, margin: "0 auto 20px" }}>
              <img
                src={event.coverImageUrl}
                alt={event.title}
                style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12, display: "block" }}
              />
            </div>
          )}
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {event.category && (
              <span style={{ display: "inline-block", padding: "4px 14px", background: "rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                {event.category}
              </span>
            )}
            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.2, color: "#fff" }}>{event.title}</h1>
            <p style={{ fontSize: 15, marginTop: 10, opacity: 0.85 }}>{event.description}</p>
            <div style={{ marginTop: 16, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", fontSize: 13, opacity: 0.9 }}>
              <div>🕐 {formatDateTime(event.startDate)}</div>
              <div>📍 {event.venue.isOnline ? "Online" : event.venue.name}</div>
              <div>💰 {event.ticketPrice ? `${formatVND(event.ticketPrice)} đ` : "Miễn phí"}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto 40px", padding: "20px 20px 0" }}>
        {/* ── Gallery ảnh hoạt động ── */}
        {hasGallery && (
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              marginBottom: 16,
              paddingBottom: 6,
            }}
          >
            {event.galleryImageUrls!.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Hoạt động ${i + 1}`}
                style={{
                  height: 140,
                  borderRadius: 10,
                  objectFit: "cover",
                  border: `2px solid #fff`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* Registration success banner */}
        {submitted && (
          <div
            style={{
              background: "#F0FDF4",
              border: `2px solid ${THEME.success}`,
              borderRadius: 12,
              padding: 24,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 48 }}>🎉</div>
            <h2 style={{ color: "#15803D", margin: "10px 0" }}>
              Đăng ký thành công!
            </h2>
            <p style={{ color: "#14532D", fontSize: 14 }}>
              Chúng tôi đã ghi nhận đăng ký của bạn. BTC sẽ liên hệ xác nhận
              trong thời gian sớm nhất.
            </p>
            <div
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "8px 16px",
                background: "#fff",
                borderRadius: 8,
                fontSize: 11,
                color: THEME.textMuted,
              }}
            >
              Mã đăng ký:{" "}
              <code style={{ color: THEME.primaryDark, fontWeight: 700 }}>
                {submitted.registrationId}
              </code>
            </div>
          </div>
        )}

        {/* CTA card */}
        {!submitted && (
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              marginBottom: 20,
              boxShadow: "0 4px 16px rgba(11,46,42,0.08)",
              textAlign: "center",
            }}
          >
            {!canRegister ? (
              <>
                <div
                  style={{
                    fontSize: 14,
                    color: THEME.warning,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {regNotYet
                    ? `⏰ Mở đăng ký vào ${formatDateTime(event.registrationOpenDate)}`
                    : regClosed
                    ? "⛔ Đã hết hạn đăng ký"
                    : "🚫 Sự kiện đã đủ chỗ"}
                </div>
                <p style={{ fontSize: 12, color: THEME.textMuted }}>
                  Vui lòng theo dõi kênh của BTC để cập nhật thông tin
                </p>
              </>
            ) : showRegisterForm ? (
              <div style={{ textAlign: "left" }}>
                <h3 style={{ margin: "0 0 14px 0", color: THEME.primaryDark }}>
                  Điền thông tin đăng ký
                </h3>
                {error && (
                  <div
                    style={{
                      background: "#FEF2F2",
                      borderLeft: `4px solid ${THEME.danger}`,
                      padding: "8px 12px",
                      borderRadius: 6,
                      color: "#991B1B",
                      marginBottom: 10,
                      fontSize: 13,
                    }}
                  >
                    ⚠ {error}
                  </div>
                )}

                {/* ── 1. Chọn ngày tham gia (multi-day) ── */}
                {hasMultiDay && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark, marginBottom: 6 }}>
                      Chọn ngày tham gia <span style={{ color: THEME.danger }}>*</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {event.selectableDates!.map((d) => {
                        const active = selectedDates.includes(d);
                        return (
                          <button
                            key={d}
                            onClick={() =>
                              setSelectedDates((prev) =>
                                active ? prev.filter((x) => x !== d) : [...prev, d],
                              )
                            }
                            style={{
                              padding: "8px 14px",
                              borderRadius: 8,
                              border: `1.5px solid ${active ? THEME.primary : THEME.border}`,
                              background: active ? THEME.primarySoft : "#fff",
                              color: active ? THEME.primaryDark : THEME.textMain,
                              fontWeight: active ? 700 : 400,
                              cursor: "pointer",
                              fontSize: 13,
                            }}
                          >
                            {active ? "✓ " : ""}{d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── 2. Thông tin cá nhân ── */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <FieldP label="Họ tên" required>
                    <input
                      style={inputStyle}
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="Nguyễn Văn A"
                    />
                  </FieldP>
                  <FieldP label="Số điện thoại" required>
                    <input
                      style={inputStyle}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="09xxxxxxxx"
                    />
                  </FieldP>
                  <FieldP label="Email">
                    <input
                      style={inputStyle}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="you@example.com"
                    />
                  </FieldP>
                  <FieldP label="Công ty / tổ chức">
                    <input
                      style={inputStyle}
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                    />
                  </FieldP>
                </div>
                <FieldP label="Ghi chú">
                  <textarea
                    style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Câu hỏi hoặc thông tin thêm..."
                  />
                </FieldP>

                {/* ── 3. Trường tùy biến (dynamic fields) ── */}
                {hasDynamicFields && (
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark, marginBottom: 8 }}>
                      Thông tin bổ sung
                    </div>
                    <DynamicFieldsRenderer
                      fields={event.dynamicFields!}
                      values={dynamicValues}
                      onChange={setDynamicValues}
                    />
                  </div>
                )}

                {/* ── 4. Sản phẩm/dịch vụ bổ sung ── */}
                {hasAddOns && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark, marginBottom: 8 }}>
                      Sản phẩm / dịch vụ bổ sung
                    </div>
                    <AddOnItemsSelector
                      items={event.addOnItems!}
                      selected={selectedAddOns}
                      onChange={setSelectedAddOns}
                    />
                  </div>
                )}

                {/* ── 5. Tổng tiền thanh toán ── */}
                {grandTotal > 0 && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: 14,
                      background: THEME.primarySoft,
                      borderRadius: 8,
                      border: `1px solid ${THEME.primary}`,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark, marginBottom: 6 }}>
                      Tổng tiền thanh toán
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {ticketPrice > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span>Vé tham gia</span>
                          <span>{formatVND(ticketPrice)} đ</span>
                        </div>
                      )}
                      {selectedAddOns.map((s) => {
                        const item = (event.addOnItems ?? []).find((i) => i.id === s.addOnId);
                        if (!item) return null;
                        return (
                          <div key={s.addOnId} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: THEME.textMuted }}>
                            <span>{item.name} x{s.qty}</span>
                            <span>{formatVND(item.unitPrice * s.qty)} đ</span>
                          </div>
                        );
                      })}
                      <div
                        style={{
                          borderTop: `1px solid ${THEME.primary}`,
                          paddingTop: 6,
                          marginTop: 4,
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 15,
                          fontWeight: 800,
                          color: THEME.primaryDark,
                        }}
                      >
                        <span>Tổng cộng</span>
                        <span>{formatVND(grandTotal)} VND</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 6. Upload bằng chứng thanh toán ── */}
                {needsPayment && (
                  <div style={{ marginTop: 14 }}>
                    <PaymentProofUpload
                      imageUrl={paymentProofUrl}
                      onChange={setPaymentProofUrl}
                    />
                  </div>
                )}

                {/* ── Actions ── */}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => {
                      setShowRegisterForm(false);
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: "#fff",
                      color: THEME.textMuted,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      flex: 2,
                      padding: 12,
                      background: THEME.primary,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {submitting ? "Đang gửi..." : "✓ Gửi đăng ký"}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: THEME.textMuted,
                    marginTop: 10,
                    textAlign: "center",
                  }}
                >
                  Bằng việc đăng ký, bạn đồng ý để BTC liên hệ bạn qua SĐT /
                  email cung cấp.
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 10 }}>
                  {event.maxAttendees
                    ? `Còn ${event.maxAttendees - activeCount}/${event.maxAttendees} chỗ`
                    : "Đang mở đăng ký"}
                </div>
                <button
                  onClick={() => setShowRegisterForm(true)}
                  style={{
                    padding: "14px 40px",
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,201,167,0.3)",
                  }}
                >
                  🎟️ Đăng ký tham gia ngay
                </button>
                <p style={{ fontSize: 11, color: THEME.textMuted, marginTop: 10 }}>
                  Hạn đăng ký: {formatDateTime(event.registrationCloseDate)}
                </p>
              </>
            )}
          </div>
        )}

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 16,
          }}
        >
          <Card>
            <h3 style={{ margin: "0 0 12px 0", color: THEME.primaryDark }}>
              📝 Nội dung chi tiết
            </h3>
            <div
              style={{ fontSize: 14, lineHeight: 1.65, color: THEME.textMain }}
              dangerouslySetInnerHTML={{ __html: event.content || "<em>(Chưa có)</em>" }}
            />
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card>
              <h4 style={{ margin: "0 0 8px 0", color: THEME.primaryDark, fontSize: 14 }}>
                📍 Địa điểm
              </h4>
              {event.venue.isOnline ? (
                <>
                  <div style={{ fontSize: 12, color: THEME.textMuted }}>Online</div>
                  <div style={{ fontSize: 11, color: THEME.primary, marginTop: 4 }}>
                    Link sẽ gửi sau khi xác nhận đăng ký
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{event.venue.name}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                    {event.venue.address}
                  </div>
                </>
              )}
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 8px 0", color: THEME.primaryDark, fontSize: 14 }}>
                📞 Liên hệ
              </h4>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {event.contactPerson.name}
              </div>
              {event.contactPerson.role && (
                <div style={{ fontSize: 11, color: THEME.textMuted }}>
                  {event.contactPerson.role}
                </div>
              )}
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <a
                  href={`tel:${event.contactPerson.phone}`}
                  style={{ color: THEME.primary }}
                >
                  {event.contactPerson.phone}
                </a>
              </div>
              {event.contactPerson.email && (
                <div style={{ fontSize: 12 }}>
                  <a
                    href={`mailto:${event.contactPerson.email}`}
                    style={{ color: THEME.primary }}
                  >
                    {event.contactPerson.email}
                  </a>
                </div>
              )}
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 8px 0", color: THEME.primaryDark, fontSize: 14 }}>
                🕐 Thời gian
              </h4>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 4 }}>
                Bắt đầu
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {formatDateTime(event.startDate)}
              </div>
              <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 6, marginBottom: 4 }}>
                Kết thúc
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {formatDateTime(event.endDate)}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: 20,
          textAlign: "center",
          fontSize: 11,
          color: THEME.textMuted,
          borderTop: `1px solid ${THEME.border}`,
        }}
      >
        © Reborn Community Hub · Powered by{" "}
        <strong style={{ color: THEME.primary }}>Reborn CRM</strong>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  fontSize: 13,
  background: "#fff",
  color: THEME.textMain,
  outline: "none",
  boxSizing: "border-box",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: 16,
        border: `1px solid ${THEME.border}`,
      }}
    >
      {children}
    </div>
  );
}

function FieldP({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: THEME.primaryDark,
          marginBottom: 4,
        }}
      >
        {label}
        {required && <span style={{ color: THEME.danger }}> *</span>}
      </div>
      {children}
    </div>
  );
}
