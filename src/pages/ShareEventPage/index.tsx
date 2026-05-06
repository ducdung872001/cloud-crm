// Public page cho sự kiện — không cần đăng nhập.
// URL: /share_event?slug={slug}
//
// Prototype: đọc localStorage. BE thật sẽ gọi public endpoint
//   GET /marketing/events/public/{slug}
//   POST /marketing/events/public/{slug}/register

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { eventStorage } from "@/pages/CommunityHub/Events/storage";
import type { EventEntity, SelectedAddOn, PaymentProof } from "@/pages/CommunityHub/Events/types";
import DynamicFieldsRenderer, { computeDynamicFieldsTotal } from "@/pages/CommunityHub/Events/components/DynamicFieldsRenderer";
import AddOnItemsSelector from "@/pages/CommunityHub/Events/components/AddOnItemsSelector";
import PaymentProofUpload from "@/pages/CommunityHub/Events/components/PaymentProofUpload";
import { formatVNDateTime } from "@/pages/CommunityHub/Events/datetime";
// Yc 5/5: bình luận + content blocks + 3 luồng đăng ký
import EventComments from "@/pages/CommunityHub/Events/components/EventComments";
import ContentBlocksRenderer from "@/pages/CommunityHub/Events/components/ContentBlocksRenderer";
import RegistrationFlowSwitcher, { type FlowReadyState } from "@/pages/CommunityHub/Events/components/RegistrationFlowSwitcher";

// Set SEO meta cho trang detail
function setEventSeo(e: EventEntity) {
  const title = `${e.title} — Đăng ký tham gia`;
  const desc = (e.description || "").slice(0, 180);
  document.title = title;
  const setMeta = (name: string, content: string, prop = false) => {
    const attr = prop ? "property" : "name";
    let m = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute(attr, name);
      document.head.appendChild(m);
    }
    m.setAttribute("content", content);
  };
  setMeta("description", desc);
  setMeta("og:title", title, true);
  setMeta("og:description", desc, true);
  setMeta("og:type", "event", true);
  if (e.coverImageUrl) setMeta("og:image", e.coverImageUrl, true);
  setMeta("og:url", window.location.href, true);
  setMeta("twitter:card", "summary_large_image");
}

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

const formatDateTime = formatVNDateTime;

export default function ShareEventPage() {
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [submitted, setSubmitted] = useState<{
    ticketCode?: string;
    registrationId?: string;
  } | null>(null);
  // Yc 5/5: 3 luồng đăng ký A/B/C — track flow user đang chọn để prefill + đính kèm khi submit
  const [flowState, setFlowState] = useState<FlowReadyState>({ flow: "guest" });
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

  const routeParams = useParams<{ slug?: string }>();
  const { slug, heroStyle } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    // Ưu tiên slug trong URL path (/events/:slug — SEO friendly)
    // Fallback query ?slug={slug} để backward compat với /share_event
    const slugFromPath = routeParams.slug ? decodeURIComponent(routeParams.slug) : "";
    return {
      slug: slugFromPath || params.get("slug") || "",
      heroStyle: (params.get("layout") ?? "card") as "card" | "cover",
    };
  }, [routeParams.slug]);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }
    (async () => {
      const e = await eventStorage.getEventBySlugAsync(slug);
      // Yc 5/5: ẩn event isTest khỏi public (kèm draft/cancelled như cũ)
      if (!e || (e.status !== "published" && e.status !== "ongoing") || e.isTest) {
        setNotFound(true);
      } else {
        setEvent(e);
        setEventSeo(e);
      }
    })();
  }, [slug]);

  // activeCount state + effect phải khai BEFORE early returns — tránh React error #310
  // (hooks order mismatch khi event từ null → object làm render path đi qua nhiều hook hơn).
  const [activeCount, setActiveCount] = useState(0);
  useEffect(() => {
    if (!event) return;
    (async () => {
      const regs = await eventStorage.listRegistrationsByEventAsync(event.id);
      setActiveCount(regs.filter((r) => r.status !== "cancelled").length);
    })();
  }, [event]);

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
  const isFull = !!event.maxAttendees && activeCount >= event.maxAttendees;
  const canRegister = !regNotYet && !regClosed && !isFull;

  // ── Tính tổng tiền ──
  const ticketPrice = event.ticketPrice ?? 0;
  const addOnSubtotal = selectedAddOns.reduce((sum, s) => {
    const item = (event.addOnItems ?? []).find((i) => i.id === s.addOnId);
    return sum + (item ? item.unitPrice * s.qty : 0);
  }, 0);
  const dynamicSubtotal = computeDynamicFieldsTotal(event.dynamicFields, dynamicValues);
  const grandTotal = ticketPrice + addOnSubtotal + dynamicSubtotal;

  const handleSubmit = async () => {
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
    // Validate payment proof — yêu cầu bất cứ khi nào admin tick requirePaymentProof
    if (event.requirePaymentProof && !paymentProofUrl) {
      setError("Vui lòng upload ảnh bằng chứng thanh toán");
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

    const result = await eventStorage.registerForEventAsync(event.slug, {
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
      // Yc 5/5: gửi kèm flow + memberCode cho BE phân biệt 3 luồng A/B/C
      flow: flowState.flow,
      memberCode: flowState.member?.memberCode,
      memberSignupStatus: flowState.flow === "member_signup" ? "requested" : undefined,
    } as any);
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
  // BE trả int 0/1 cho requirePaymentProof → coerce về boolean, tránh render thẳng số "0"
  // khi dùng trong pattern {needsPayment && <JSX />} (React render number literal 0).
  // Hiện upload bằng chứng BẤT CỨ KHI NÀO admin tick requirePaymentProof,
  // kể cả event giá 0 (phí ngoài, deposit, phí riêng cho từng tuỳ chọn...).
  // Hiện block thanh toán khi admin bật requirePaymentProof, HOẶC khi
  // grandTotal > 0 do user chọn addOn / dynamic field có phí (yc tester 2026-05-06).
  // Trước đây chỉ check requirePaymentProof → event miễn phí có addOn có phí
  // sẽ không thấy QR / upload biên lai.
  const needsPayment = !!event.requirePaymentProof || grandTotal > 0;

  // QR thanh toán — nếu admin có cấu hình bankAccountOverride
  // Ưu tiên QR ảnh upload (cho tenant chưa dùng VietQR), fallback sinh tự động.
  const bank = event.bankAccountOverride;
  const qrPayload = bank && bank.bank && bank.accountNumber
    ? `${bank.bank}|${bank.accountNumber}|${grandTotal || ""}|EVENT-${event.slug}`
    : null;
  const qrImgSrc = bank?.qrImageUrl
    ? bank.qrImageUrl
    : qrPayload
      ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}`
      : null;

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.textMain }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* ── Responsive grids & layout ── */
            .se-info-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
            @media (max-width: 900px) { .se-info-grid { grid-template-columns: 1fr; gap: 14px; } }
            .se-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            @media (max-width: 560px) { .se-form-grid { grid-template-columns: 1fr; gap: 10px; } }
            .se-container { max-width: 900px; margin: 0 auto 40px; padding: 20px 20px 0; }
            @media (max-width: 600px) { .se-container { margin: 0 auto 24px; padding: 14px 12px 0; } }
            .se-brand-bar { padding: 12px 20px; }
            @media (max-width: 480px) { .se-brand-bar { padding: 10px 14px; } }
            .se-hero-cover { padding: 60px 20px 80px; }
            @media (max-width: 600px) { .se-hero-cover { padding: 40px 14px 48px; } }
            .se-hero-default { padding: 28px 20px 32px; }
            @media (max-width: 600px) { .se-hero-default { padding: 20px 14px 24px; } }
            .se-hero-title { margin: 0; font-size: clamp(22px, 5.2vw, 32px); line-height: 1.2; color: #fff; }
            .se-hero-sub { font-size: clamp(13px, 2.5vw, 16px); margin-top: 10px; opacity: 0.9; }
            .se-meta-row { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; font-size: 13px; margin-top: 16px; }
            @media (max-width: 480px) { .se-meta-row { gap: 10px 14px; font-size: 12px; margin-top: 12px; } }
            .se-cta-card { padding: 24px; }
            @media (max-width: 480px) { .se-cta-card { padding: 16px; } }
            .se-content-header { padding: 18px 22px; gap: 14px; }
            @media (max-width: 480px) { .se-content-header { padding: 14px 16px; gap: 10px; } }
            .se-content-body { padding: 22px 24px 24px; }
            @media (max-width: 480px) { .se-content-body { padding: 16px 16px 18px; } }
            .se-qr-row { display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap; }
            @media (max-width: 520px) {
              .se-qr-row { justify-content: center; text-align: center; }
              .se-qr-row img { margin: 0 auto; }
            }
            /* Upload bằng chứng CK (cột trái) + QR người nhận (cột phải), responsive */
            .se-pay-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: stretch; }
            @media (max-width: 760px) { .se-pay-grid { grid-template-columns: 1fr; gap: 12px; } }
            .se-actions-row { display: flex; gap: 8px; margin-top: 14px; }
            @media (max-width: 380px) { .se-actions-row { flex-direction: column-reverse; } }
            .se-footer { padding: 20px; text-align: center; font-size: 11px; }
            @media (max-width: 480px) { .se-footer { padding: 16px 12px; } }
            .se-gallery-img { height: 140px; }
            @media (max-width: 480px) { .se-gallery-img { height: 100px !important; } }

            /* ── Prose (rich content from editor) ── */
            .event-prose { font-size: 15px; line-height: 1.78; color: ${THEME.textMain}; word-break: break-word; }
            @media (max-width: 480px) {
              .event-prose { font-size: 14px; line-height: 1.72; }
              .event-prose h1 { font-size: 22px !important; }
              .event-prose h2 { font-size: 18px !important; }
              .event-prose h3 { font-size: 16px !important; }
            }
            .event-prose > *:first-child { margin-top: 0; }
            .event-prose > *:last-child { margin-bottom: 0; }
            .event-prose h1, .event-prose h2, .event-prose h3, .event-prose h4 {
              color: ${THEME.primaryDark}; font-weight: 800; letter-spacing: -0.3px;
            }
            .event-prose h1 { font-size: 26px; margin: 22px 0 12px; }
            .event-prose h2 {
              font-size: 21px; margin: 22px 0 12px; padding-bottom: 6px;
              border-bottom: 2px solid ${THEME.primarySoft};
              position: relative;
            }
            .event-prose h2::before {
              content: ""; position: absolute; left: 0; bottom: -2px;
              width: 56px; height: 2px; background: ${THEME.primary};
            }
            .event-prose h3 { font-size: 17px; color: ${THEME.primary}; margin: 18px 0 8px; font-weight: 700; }
            .event-prose h4 { font-size: 15px; margin: 14px 0 6px; font-weight: 700; }
            .event-prose p { margin: 0 0 12px; }
            .event-prose strong, .event-prose b { color: ${THEME.primaryDark}; font-weight: 700; }
            .event-prose em, .event-prose i { color: ${THEME.textMuted}; }
            .event-prose a { color: ${THEME.primary}; text-decoration: underline; text-underline-offset: 3px; font-weight: 600; }
            .event-prose a:hover { color: ${THEME.primaryDark}; }
            .event-prose ul, .event-prose ol { padding-left: 22px; margin: 10px 0 14px; }
            .event-prose li { margin-bottom: 6px; line-height: 1.75; }
            .event-prose ul li::marker { color: ${THEME.primary}; }
            .event-prose ol li::marker { color: ${THEME.primary}; font-weight: 700; }
            .event-prose blockquote {
              border-left: 4px solid ${THEME.primary}; background: ${THEME.primarySoft};
              padding: 12px 16px; margin: 14px 0; border-radius: 0 8px 8px 0;
              color: ${THEME.primaryDark}; font-style: italic;
            }
            .event-prose blockquote p:last-child { margin-bottom: 0; }
            .event-prose hr { border: none; border-top: 1px dashed ${THEME.border}; margin: 22px 0; }
            .event-prose img {
              max-width: 100%; height: auto; border-radius: 10px; margin: 12px 0;
              box-shadow: 0 4px 16px rgba(11,46,42,0.1);
            }
            .event-prose code {
              background: ${THEME.primarySoft}; color: ${THEME.primaryDark};
              padding: 2px 7px; border-radius: 4px; font-size: 13px;
              font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            }
            .event-prose pre {
              background: ${THEME.primaryDark}; color: #fff; padding: 14px 16px;
              border-radius: 8px; overflow-x: auto; margin: 14px 0; font-size: 13px;
            }
            .event-prose pre code { background: transparent; color: inherit; padding: 0; }
            .event-prose table {
              width: 100%; border-collapse: collapse; margin: 14px 0;
              font-size: 14px; border-radius: 8px; overflow: hidden;
              border: 1px solid ${THEME.border};
            }
            .event-prose th, .event-prose td {
              border-bottom: 1px solid ${THEME.border}; padding: 10px 12px; text-align: left;
            }
            .event-prose th { background: ${THEME.primarySoft}; color: ${THEME.primaryDark}; font-weight: 700; }
            .event-prose tr:last-child td { border-bottom: none; }
          `,
        }}
      />
      {/* Top brand bar */}
      <div
        className="se-brand-bar"
        style={{
          background: THEME.primaryDark,
          color: "#fff",
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
          className="se-hero-cover"
          style={{
            background: event.coverImageUrl
              ? `linear-gradient(180deg, rgba(11,46,42,0.45), rgba(11,46,42,0.85)), url(${event.coverImageUrl}) center/cover`
              : `linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.primary})`,
            color: "#fff",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {event.category && (
              <span style={{ display: "inline-block", padding: "4px 14px", background: "rgba(255,255,255,0.25)", borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                {event.category}
              </span>
            )}
            <h1 className="se-hero-title">{event.title}</h1>
            <p className="se-hero-sub">{event.description}</p>
            <div className="se-meta-row">
              <div>🕐 {formatDateTime(event.startDate)}</div>
              <div>📍 {event.venue.isOnline ? "Online" : event.venue.name}</div>
              <div>💰 {event.ticketPrice ? `${formatVND(event.ticketPrice)} đ` : "Miễn phí"}</div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Layout B (mặc định): ảnh + title card nền solid ── */
        <div
          className="se-hero-default"
          style={{
            background: THEME.primaryDark,
            color: "#fff",
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
            <h1 className="se-hero-title">{event.title}</h1>
            <p className="se-hero-sub">{event.description}</p>
            <div className="se-meta-row">
              <div>🕐 {formatDateTime(event.startDate)}</div>
              <div>📍 {event.venue.isOnline ? "Online" : event.venue.name}</div>
              <div>💰 {event.ticketPrice ? `${formatVND(event.ticketPrice)} đ` : "Miễn phí"}</div>
            </div>
          </div>
        </div>
      )}

      <div className="se-container">
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
                className="se-gallery-img"
                style={{
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
            className="se-cta-card"
            style={{
              background: "#fff",
              borderRadius: 12,
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

                {/* Yc 5/5 mục 2: 3 luồng đăng ký — chỉ show khi event bật ≥ 2 luồng */}
                {(event.registrationFlows?.length ?? 0) > 1 && (
                  <RegistrationFlowSwitcher
                    enabledFlows={event.registrationFlows!}
                    onReady={(s) => {
                      setFlowState(s);
                      // Prefill form khi user login member-code (luồng C)
                      if (s.flow === "member_login" && s.member) {
                        setForm({
                          fullName: s.member.fullName,
                          phone: s.member.phone,
                          email: s.member.email ?? "",
                          company: s.member.occupation ?? "",
                          note: "",
                        });
                      }
                    }}
                  />
                )}
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
                <div className="se-form-grid">
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
                      {(event.dynamicFields ?? []).map((f) => {
                        const v = dynamicValues[f.id];
                        if (!v) return null;
                        let line: { name: string; price: number } | null = null;
                        if (f.type === "checkbox" && v === "true" && (f.price ?? 0) > 0) {
                          line = { name: f.label, price: f.price! };
                        } else if (f.type === "select" && f.optionPrices?.[v]) {
                          line = { name: `${f.label} — ${v}`, price: f.optionPrices[v] };
                        }
                        if (!line) return null;
                        return (
                          <div key={f.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: THEME.textMuted }}>
                            <span>{line.name}</span>
                            <span>{formatVND(line.price)} đ</span>
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

                {/* ── 6. Thanh toán: QR (bank) + Upload bằng chứng cạnh nhau ── */}
                {needsPayment && (
                  <div className="se-pay-grid" style={{ marginTop: 14 }}>
                    {/* Cột trái: Upload bằng chứng CK */}
                    <div>
                      <PaymentProofUpload
                        imageUrl={paymentProofUrl}
                        onChange={setPaymentProofUrl}
                      />
                      {!bank && (
                        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                          Nếu có phí phát sinh, vui lòng liên hệ BTC để nhận thông tin chuyển khoản trước khi upload biên lai.
                        </div>
                      )}
                    </div>

                    {/* Cột phải: QR + Thông tin TK người nhận (chỉ hiển thị khi có cấu hình) */}
                    {bank && (
                      <div
                        style={{
                          padding: 14,
                          background: "#fff",
                          borderRadius: 8,
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark, marginBottom: 10 }}>
                          💳 Quét mã chuyển khoản
                        </div>
                        <div className="se-qr-row">
                          {qrImgSrc && (
                            <img
                              src={qrImgSrc}
                              alt="QR chuyển khoản"
                              width={180}
                              height={180}
                              style={{ border: `1px solid ${THEME.border}`, borderRadius: 6, background: "#fff", objectFit: "contain" }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 180, fontSize: 13, lineHeight: 1.7 }}>
                            {bank.bank && <div><strong>Ngân hàng:</strong> {bank.bank}</div>}
                            {bank.holder && <div><strong>Chủ TK:</strong> {bank.holder}</div>}
                            {bank.accountNumber && (
                              <div>
                                <strong>Số TK:</strong>{" "}
                                <span style={{ fontFamily: "ui-monospace,monospace", fontWeight: 600 }}>
                                  {bank.accountNumber}
                                </span>
                              </div>
                            )}
                            {grandTotal > 0 && (
                              <div><strong>Số tiền:</strong>{" "}
                                <span style={{ color: THEME.accent, fontWeight: 700 }}>
                                  {formatVND(grandTotal)} đ
                                </span>
                              </div>
                            )}
                            <div style={{ marginTop: 6 }}>
                              <strong>Nội dung:</strong>{" "}
                              <span style={{ fontFamily: "ui-monospace,monospace" }}>
                                EVENT-{event.slug}
                              </span>
                            </div>
                            {bank.phone && (
                              <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 6 }}>
                                Hỗ trợ: {bank.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="se-actions-row">
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
        <div className="se-info-grid">
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              border: `1px solid ${THEME.border}`,
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(11,46,42,0.07)",
            }}
          >
            <div
              className="se-content-header"
              style={{
                background: `linear-gradient(135deg, ${THEME.primarySoft} 0%, #fff 85%)`,
                borderBottom: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${THEME.primary}, #00A68A)`,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: "0 6px 16px rgba(0,201,167,0.35)",
                  flexShrink: 0,
                }}
              >
                📝
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    color: THEME.primaryDark,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                    lineHeight: 1.3,
                  }}
                >
                  Nội dung chi tiết
                </h3>
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3, letterSpacing: 0.3 }}>
                  Thông tin chương trình & lịch trình sự kiện
                </div>
              </div>
            </div>
            {/* Yc 5/5: nếu admin đã cấu hình contentBlocks → render block layout, fallback content HTML */}
            {event.contentBlocks && event.contentBlocks.length > 0 ? (
              <div className="event-prose se-content-body">
                <ContentBlocksRenderer blocks={event.contentBlocks} />
              </div>
            ) : (
              <div
                className="event-prose se-content-body"
                dangerouslySetInnerHTML={{
                  __html:
                    event.content ||
                    `<em style="color:${THEME.textMuted}">(Chưa có nội dung)</em>`,
                }}
              />
            )}

            {/* Yc 5/5: bình luận (kênh CSKH, giữ vĩnh viễn) — chỉ render nếu admin bật */}
            {event.commentsEnabled !== false && (
              <div style={{ marginTop: 24 }}>
                <EventComments
                  eventId={event.id}
                  canPost
                  moderated={!!event.commentsModerated}
                />
              </div>
            )}
          </div>
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
                    {event.venue.city && <> · {event.venue.city}</>}
                  </div>
                  {(() => {
                    const lat = event.venue.latitude;
                    const lng = event.venue.longitude;
                    const hasCoords = lat != null && lng != null;
                    const mapQuery = hasCoords
                      ? `${lat},${lng}`
                      : encodeURIComponent(
                          [event.venue.name, event.venue.address, event.venue.city].filter(Boolean).join(", "),
                        );
                    return (
                      <div style={{ marginTop: 10 }}>
                        <iframe
                          title="Bản đồ địa điểm"
                          src={`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                          style={{ border: 0, width: "100%", height: 180, borderRadius: 8 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <a
                          href={
                            hasCoords
                              ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                              : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            marginTop: 8, padding: "6px 12px",
                            background: THEME.primary, color: "#fff",
                            borderRadius: 6, fontSize: 12, fontWeight: 600,
                            textDecoration: "none",
                          }}
                        >
                          🧭 Chỉ đường
                        </a>
                      </div>
                    );
                  })()}
                </>
              )}
            </Card>
            {(event.additionalVenues ?? []).length > 0 && (event.additionalVenues ?? []).map((av, i) => {
              const lat = av.latitude;
              const lng = av.longitude;
              const hasCoords = lat != null && lng != null;
              const mapQuery = hasCoords
                ? `${lat},${lng}`
                : encodeURIComponent([av.name, av.address, av.city].filter(Boolean).join(", "));
              return (
                <Card key={i}>
                  <h4 style={{ margin: "0 0 8px 0", color: THEME.primaryDark, fontSize: 14 }}>
                    🧭 {av.label || "Địa điểm phụ"}
                  </h4>
                  {av.name && (
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{av.name}</div>
                  )}
                  {(av.address || av.city) && (
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                      {av.address}
                      {av.city && <> · {av.city}</>}
                    </div>
                  )}
                  {(hasCoords || av.name || av.address) && (
                    <div style={{ marginTop: 10 }}>
                      <iframe
                        title={`Bản đồ ${av.label || i}`}
                        src={`https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`}
                        style={{ border: 0, width: "100%", height: 160, borderRadius: 8 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <a
                        href={
                          hasCoords
                            ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          marginTop: 8, padding: "6px 12px",
                          background: THEME.primary, color: "#fff",
                          borderRadius: 6, fontSize: 12, fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        🧭 Chỉ đường
                      </a>
                    </div>
                  )}
                </Card>
              );
            })}
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
        className="se-footer"
        style={{
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
