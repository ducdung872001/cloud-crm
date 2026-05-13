// MyRegistrationsModal — khách vãng lai self-service xem/sửa thông tin đăng ký
// đã submit cho 1 hoặc nhiều sự kiện trên hub.reborn.vn.
//
// Flow:
//   1. "phone"  → user nhập SĐT → Firebase sendPhoneOtp
//   2. "otp"    → user nhập 6 số → verify → idToken
//   3. "list"   → gọi GET /events/public/my-registrations với header X-Firebase-Id-Token
//   4. "edit"   → click "✏ Sửa" → form Lớp 1 → PUT /events/public/registrations/info
//
// Auth: dùng Firebase Phone OTP (idToken sinh từ project reborn-303801) —
// reuse helper firebasePhoneOtp.ts đã có. KHÔNG dùng JWT admin.
//
// Lớp 1 (only): sửa fullName / email / company / note / selectedDates.
// Mọi field khác (phone, dynamicValues, selectedAddOns, paymentProofUrl)
// readonly + show summary count, hint "liên hệ admin" — sẽ làm Lớp 2/3 sau.
//
// IMPORTANT: BE chưa deploy 2 endpoint (issue #23) — feature flag
// PUBLIC_MY_REGISTRATIONS_READY=false → entry button bị ẩn ở ShareEventPage.

import React, { useRef, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { THEME } from "../shared";
import {
  createRecaptchaVerifier,
  isFirebasePhoneAuthAvailable,
  isValidVNPhone,
  sendPhoneOtp,
  toE164VN,
  verifyOtpAndGetIdToken,
} from "../../Members/firebasePhoneOtp";
import PublicRegistrationService, {
  type MyRegistrationItem,
  type UpdateRegistrationInfoBody,
} from "services/PublicRegistrationService";
import { formatVNDate } from "../datetime";

type Step = "phone" | "otp" | "list" | "edit";

interface Props {
  /** Slug của event đang ở — dùng để highlight registration cùng event trong list. */
  currentEventSlug?: string;
  onClose: () => void;
  /** Callback sau khi user sửa thành công 1 registration — parent có thể refresh data. */
  onUpdated?: (regId: string) => void;
}

export default function MyRegistrationsModal({ currentEventSlug, onClose, onUpdated }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [idToken, setIdToken] = useState<string | null>(null);
  const [items, setItems] = useState<MyRegistrationItem[]>([]);
  const [editingReg, setEditingReg] = useState<MyRegistrationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // ── Step 1: gửi OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError(null);
    setInfo(null);
    if (!isValidVNPhone(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }
    if (!isFirebasePhoneAuthAvailable) {
      setError("Firebase chưa cấu hình — liên hệ admin.");
      return;
    }
    setLoading(true);
    try {
      const verifier = createRecaptchaVerifier("ch-myreg-recaptcha");
      const e164 = toE164VN(phone);
      const confirmation = await sendPhoneOtp(e164, verifier);
      confirmationRef.current = confirmation;
      setInfo(`Đã gửi OTP tới ${maskPhone(phone)}. Mã có hiệu lực 5 phút.`);
      setStep("otp");
    } catch (e: any) {
      setError(`Gửi OTP thất bại: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP → idToken → fetch list ────────────────────────────
  // Tách 2 try block: Firebase verify vs BE call — để báo lỗi chính xác cho
  // user (verify OTP fail khác hẳn với BE chưa deploy / lỗi mạng).
  const handleVerifyOtp = async () => {
    setError(null);
    if (!/^\d{6}$/.test(otp)) {
      setError("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    if (!confirmationRef.current) {
      setError("Phiên OTP hết hạn — gửi lại");
      setStep("phone");
      return;
    }
    setLoading(true);
    // (1) Firebase verify
    let token: string;
    try {
      token = await verifyOtpAndGetIdToken(confirmationRef.current, otp);
      setIdToken(token);
    } catch (e: any) {
      const msg = e?.message || String(e);
      setError(/auth\/invalid-verification-code/.test(msg) ? "Mã OTP không đúng" : `Xác minh OTP thất bại: ${msg}`);
      setLoading(false);
      return;
    }
    // (2) BE call — verify OK rồi, tới lấy list. Lỗi ở đây là network/BE.
    try {
      const res = await PublicRegistrationService.listMine(token);
      if (res?.code !== 0 && res?.code !== 200) {
        setError(res?.message || "Không tải được danh sách đăng ký");
        return;
      }
      // BE wrap DfResponse dùng `data`; FE handoff example viết `result` —
      // accept cả 2 để defensive.
      const list: MyRegistrationItem[] = res?.data ?? res?.result ?? [];
      setItems(list);
      setStep("list");
      if (list.length === 0) {
        setInfo("Không tìm thấy đăng ký nào với SĐT này. Kiểm tra lại số hoặc liên hệ admin.");
      } else {
        setInfo(`Tìm thấy ${list.length} đăng ký.`);
      }
    } catch (e: any) {
      const msg = e?.message || String(e);
      const isNetwork = e?.name === "TypeError" || /Failed to fetch|Network/i.test(msg);
      setError(
        isNetwork
          ? "Máy chủ chưa sẵn sàng cho tính năng này. Vui lòng thử lại sau hoặc liên hệ admin."
          : `Không tải được danh sách: ${msg}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 4 callback: sau khi edit thành công, refresh item trong list ────
  const handleEditDone = (updated: MyRegistrationItem) => {
    setItems((prev) => prev.map((it) => (it.regId === updated.regId ? updated : it)));
    setEditingReg(null);
    setStep("list");
    setInfo("✓ Cập nhật thông tin thành công.");
    onUpdated?.(updated.regId);
  };

  return (
    <div
      onClick={() => { if (!loading) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 10, padding: 20, width: 560, maxWidth: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: THEME.textMain }}>
            {step === "edit" ? "Sửa thông tin đăng ký" : "Tôi đã đăng ký — xem / sửa"}
          </h3>
          <button
            onClick={() => { if (!loading) onClose(); }}
            disabled={loading}
            aria-label="Đóng"
            style={{
              background: "transparent", border: "none", fontSize: 20, cursor: "pointer",
              color: THEME.textMuted, lineHeight: 1, padding: 0,
            }}
          >×</button>
        </div>

        {/* Progress dots — chỉ hiện ở step phone/otp */}
        {(step === "phone" || step === "otp") && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {(["phone", "otp"] as const).map((s, i) => {
              const order: Step[] = ["phone", "otp"];
              const active = order.indexOf(step) >= i;
              return (
                <React.Fragment key={s}>
                  {i > 0 && <div style={{ flex: 1, height: 1, background: active ? THEME.primary : THEME.border }} />}
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    background: active ? THEME.primary : THEME.border,
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                </React.Fragment>
              );
            })}
            <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: 4 }}>
              {step === "phone" ? "Xác minh SĐT" : "Nhập OTP"}
            </span>
          </div>
        )}

        {info && (
          <div style={{
            background: "#ECFDF5", border: "1px solid #BBF7D0", color: "#065F46",
            padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
          }}>{info}</div>
        )}
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
            padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
          }}>⚠ {error}</div>
        )}

        {/* ── Step 1: phone ──────────────────────────────────────────────── */}
        {step === "phone" && (
          <>
            <p style={{ fontSize: 13, color: THEME.textMuted, margin: "0 0 10px" }}>
              Nhập số điện thoại đã dùng khi đăng ký. Một số có thể dùng cho nhiều sự kiện —
              hệ thống sẽ trả về toàn bộ danh sách sau khi xác minh OTP.
            </p>
            <Field label="Số điện thoại đã đăng ký *">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                style={inp}
                autoFocus
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <button onClick={onClose} disabled={loading} style={btnGhost}>Huỷ</button>
              <button onClick={handleSendOtp} disabled={loading} style={btnPrimary(loading)}>
                {loading ? "Đang gửi..." : "Gửi OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: otp ────────────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <Field label="Mã OTP (6 số)">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                inputMode="numeric"
                style={{ ...inp, letterSpacing: 4, fontFamily: "monospace", fontSize: 16 }}
                autoFocus
              />
            </Field>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => setStep("phone")} disabled={loading} style={btnGhost}>← Quay lại</button>
              <button onClick={handleVerifyOtp} disabled={loading} style={btnPrimary(loading)}>
                {loading ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: list ───────────────────────────────────────────────── */}
        {step === "list" && (
          <RegistrationList
            items={items}
            currentEventSlug={currentEventSlug}
            onEdit={(reg) => { setEditingReg(reg); setStep("edit"); setError(null); setInfo(null); }}
            onClose={onClose}
          />
        )}

        {/* ── Step 4: edit ───────────────────────────────────────────────── */}
        {step === "edit" && editingReg && idToken && (
          <RegistrationEditForm
            registration={editingReg}
            idToken={idToken}
            onCancel={() => { setEditingReg(null); setStep("list"); setError(null); setInfo(null); }}
            onSaved={handleEditDone}
          />
        )}

        {/* Invisible recaptcha cho Firebase. */}
        <div id="ch-myreg-recaptcha" style={{ display: "none" }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RegistrationList — render danh sách registration sau OTP verify
// ─────────────────────────────────────────────────────────────────────────────
function RegistrationList({
  items, currentEventSlug, onEdit, onClose,
}: {
  items: MyRegistrationItem[];
  currentEventSlug?: string;
  onEdit: (r: MyRegistrationItem) => void;
  onClose: () => void;
}) {
  if (items.length === 0) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: THEME.textMuted, fontSize: 13 }}>
        Không tìm thấy đăng ký nào với SĐT này.
        <div style={{ marginTop: 12 }}>
          <button onClick={onClose} style={btnPrimary(false)}>Đóng</button>
        </div>
      </div>
    );
  }

  // Sort: current event lên trên, sau đó theo eventStartAt desc
  const sorted = [...items].sort((a, b) => {
    if (currentEventSlug) {
      if (a.eventSlug === currentEventSlug && b.eventSlug !== currentEventSlug) return -1;
      if (b.eventSlug === currentEventSlug && a.eventSlug !== currentEventSlug) return 1;
    }
    const ta = a.eventStartAt ? new Date(a.eventStartAt).getTime() : 0;
    const tb = b.eventStartAt ? new Date(b.eventStartAt).getTime() : 0;
    return tb - ta;
  });

  return (
    <div>
      <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 10px" }}>
        Bấm <b>✏ Sửa</b> để cập nhật họ tên / email / công ty / ghi chú / ngày tham gia.
        Sản phẩm bổ sung và minh chứng thanh toán phải liên hệ admin.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((r) => (
          <RegistrationCard
            key={r.regId}
            registration={r}
            isCurrent={!!currentEventSlug && r.eventSlug === currentEventSlug}
            onEdit={() => onEdit(r)}
          />
        ))}
      </div>
    </div>
  );
}

function RegistrationCard({
  registration: r, isCurrent, onEdit,
}: {
  registration: MyRegistrationItem;
  isCurrent: boolean;
  onEdit: () => void;
}) {
  const statusLabel = r.status === "checked_in" ? "Đã check-in"
    : r.status === "approved" ? "Đã duyệt"
    : r.status === "completed" ? "Hoàn thành"
    : r.status === "cancelled" ? "Đã huỷ"
    : "Chờ duyệt";
  const statusColor = r.status === "checked_in" ? "#3B82F6"
    : r.status === "approved" ? "#10B981"
    : r.status === "completed" ? "#6B7280"
    : r.status === "cancelled" ? "#EF4444"
    : "#F59E0B";

  return (
    <div
      style={{
        border: `1.5px solid ${isCurrent ? THEME.primary : THEME.border}`,
        background: isCurrent ? THEME.primarySoft : "#fff",
        borderRadius: 8,
        padding: 12,
        position: "relative",
      }}
    >
      {isCurrent && (
        <span style={{
          position: "absolute", top: 8, right: 8,
          fontSize: 10, padding: "2px 8px", borderRadius: 10,
          background: THEME.primary, color: "#fff", fontWeight: 700,
        }}>
          Sự kiện đang xem
        </span>
      )}

      <div style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain, marginBottom: 4, paddingRight: isCurrent ? 110 : 0 }}>
        {r.eventTitle}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", fontSize: 12, color: THEME.textMuted, marginBottom: 6 }}>
        {r.eventStartAt && (
          <span>📅 {formatVNDate(r.eventStartAt)}</span>
        )}
        <span style={{
          padding: "1px 8px", borderRadius: 10, background: statusColor, color: "#fff", fontWeight: 600, fontSize: 11,
        }}>{statusLabel}</span>
        {typeof r.totalAmount === "number" && r.totalAmount > 0 && (
          <span>💰 {new Intl.NumberFormat("vi-VN").format(r.totalAmount)}đ</span>
        )}
      </div>

      <div style={{ fontSize: 12, color: THEME.textMain, marginBottom: 8 }}>
        <b>{r.values.fullName}</b>
        {r.lockedSummary?.phone && <span style={{ color: THEME.textMuted }}> · {r.lockedSummary.phone}</span>}
        {r.values.selectedDates && r.values.selectedDates.length > 0 && (
          <div style={{ marginTop: 2 }}>
            <span style={{ color: THEME.textMuted }}>Ngày tham gia:</span>{" "}
            {r.values.selectedDates.map(formatVNDate).join(", ")}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {r.canEdit ? (
          <button onClick={onEdit} style={{
            padding: "6px 14px", background: THEME.primary, color: "#fff",
            border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600,
          }}>
            ✏ Sửa thông tin
          </button>
        ) : (
          <span style={{ fontSize: 12, color: THEME.textMuted, padding: "6px 0" }}>
            🔒 {r.canEditReason === "checked_in" ? "Đã check-in — không sửa được"
              : r.canEditReason === "event_ended" ? "Sự kiện đã kết thúc"
              : r.canEditReason === "cancelled" ? "Đã huỷ đăng ký"
              : "Không sửa được — liên hệ admin"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RegistrationEditForm — Lớp 1 fields only (handoff issue #23)
// ─────────────────────────────────────────────────────────────────────────────
function RegistrationEditForm({
  registration: r, idToken, onCancel, onSaved,
}: {
  registration: MyRegistrationItem;
  idToken: string;
  onCancel: () => void;
  onSaved: (updated: MyRegistrationItem) => void;
}) {
  const [fullName, setFullName] = useState(r.values.fullName ?? "");
  const [email, setEmail] = useState(r.values.email ?? "");
  const [company, setCompany] = useState(r.values.company ?? "");
  const [note, setNote] = useState(r.values.note ?? "");
  const [selectedDates, setSelectedDates] = useState<string[]>(r.values.selectedDates ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect xem có thay đổi gì để enable nút Save
  const dirty =
    fullName !== (r.values.fullName ?? "") ||
    email !== (r.values.email ?? "") ||
    company !== (r.values.company ?? "") ||
    note !== (r.values.note ?? "") ||
    JSON.stringify(selectedDates) !== JSON.stringify(r.values.selectedDates ?? []);

  const handleSave = async () => {
    setError(null);
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const body: UpdateRegistrationInfoBody = {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        note: note.trim() || undefined,
        selectedDates: selectedDates.length > 0 ? selectedDates : undefined,
      };
      const res = await PublicRegistrationService.updateInfo(String(r.regId), idToken, body);
      if (res?.code !== 0 && res?.code !== 200) {
        const code = res?.error || res?.code;
        const msg = code === "CHECKED_IN_LOCKED" ? "Đã check-in — không sửa được nữa"
          : code === "EVENT_ENDED" ? "Sự kiện đã kết thúc"
          : code === "NOT_OWNER" ? "SĐT không khớp đăng ký này"
          : code === "CANCELLED" ? "Đăng ký đã bị huỷ"
          : code === "INVALID_EMAIL" ? "Email không hợp lệ"
          : code === "INVALID_DATE" ? "Ngày tham gia không hợp lệ"
          : res?.message || "Lưu thất bại";
        setError(msg);
        return;
      }
      // DfResponse `data` envelope (BE reply issue #237).
      const updatedValues = res?.data?.values ?? res?.result?.values ?? body;
      onSaved({ ...r, values: { ...r.values, ...updatedValues } });
    } catch (e: any) {
      setError(e?.message || "Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ background: THEME.bg, padding: "8px 10px", borderRadius: 6, fontSize: 12, color: THEME.textMain, marginBottom: 12 }}>
        Sự kiện: <b>{r.eventTitle}</b>
      </div>

      {error && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B",
          padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
        }}>⚠ {error}</div>
      )}

      <Field label="Họ tên *">
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inp} maxLength={100} />
      </Field>
      <Field label="Email">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" style={inp} type="email" maxLength={200} />
      </Field>
      <Field label="Công ty">
        <input value={company} onChange={(e) => setCompany(e.target.value)} style={inp} maxLength={200} />
      </Field>
      <Field label="Ghi chú">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          style={{ ...inp, resize: "vertical", minHeight: 60, fontFamily: "inherit" }}
        />
      </Field>

      {r.values.selectedDates && r.values.selectedDates.length > 0 && (
        <Field label="Ngày tham gia">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {r.values.selectedDates.map((d) => {
              const checked = selectedDates.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDates((cur) => checked ? cur.filter((x) => x !== d) : [...cur, d])}
                  style={{
                    padding: "6px 12px",
                    border: `1.5px solid ${checked ? THEME.primary : THEME.border}`,
                    background: checked ? THEME.primary : "#fff",
                    color: checked ? "#fff" : THEME.textMain,
                    borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 600,
                  }}
                >
                  {formatVNDate(d)}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: THEME.textMuted, margin: "4px 0 0" }}>
            Chỉ bỏ chọn các ngày đã đăng ký. Thêm ngày mới phải liên hệ admin.
          </p>
        </Field>
      )}

      {/* Hint những gì không sửa được */}
      <div style={{
        background: "#FEF3C7", border: "1px solid #FDE68A", color: "#92400E",
        padding: "8px 12px", borderRadius: 6, fontSize: 12, margin: "12px 0",
      }}>
        🔒 <b>Không sửa được tại đây</b>: số điện thoại
        {r.lockedSummary?.dynamicValuesCount ? ` · ${r.lockedSummary.dynamicValuesCount} thông tin bổ sung` : ""}
        {r.lockedSummary?.selectedAddOnsCount ? ` · ${r.lockedSummary.selectedAddOnsCount} sản phẩm/dịch vụ bổ sung` : ""}
        {r.lockedSummary?.hasPaymentProof ? ` · minh chứng thanh toán` : ""}
        . Liên hệ admin để cập nhật.
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button onClick={onCancel} disabled={loading} style={btnGhost}>← Quay lại danh sách</button>
        <button
          onClick={handleSave}
          disabled={loading || !dirty}
          style={btnPrimary(loading || !dirty)}
          title={!dirty ? "Chưa có thay đổi nào" : undefined}
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: THEME.textMain, marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.length < 6) return phone;
  return digits.slice(0, 3) + "***" + digits.slice(-4);
}

const inp: React.CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnGhost: React.CSSProperties = {
  padding: "8px 14px",
  background: "#fff",
  color: THEME.textMain,
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
};

const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  padding: "8px 14px",
  background: disabled ? "#9CA3AF" : THEME.primary,
  color: "#fff",
  border: "none",
  borderRadius: 6,
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 13,
  fontWeight: 600,
  opacity: disabled ? 0.7 : 1,
});
