// CH Events — Form tạo/sửa sự kiện với RebornEditor + cover image upload.
// Routes: /ch_events/create · /ch_events/:id/edit

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RebornEditor from "components/editor/reborn";
import { serialize } from "utils/editor";
import { eventStorage } from "./storage";
import type { EventEntity, DynamicFieldDefinition, EventAddOnItem } from "./types";
import { THEME, formatVND } from "./shared";
import DynamicFieldsBuilder from "./components/DynamicFieldsBuilder";
import ServiceCatalogPicker from "./components/ServiceCatalogPicker";

type FormState = {
  title: string;
  description: string;
  content: string;
  coverImageUrl: string;
  startDate: string; // datetime-local value
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueIsOnline: boolean;
  venueOnlineUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactRole: string;
  maxAttendees: string;
  ticketPrice: string;
  category: string;
  tags: string;
  // ── CHUNG: Mở rộng ──
  dynamicFields: DynamicFieldDefinition[];
  addOnItems: EventAddOnItem[];
  galleryImageUrls: string[];
  requirePaymentProof: boolean;
  selectableDates: string[];
};

const EMPTY: FormState = {
  title: "",
  description: "",
  content: "",
  coverImageUrl: "",
  startDate: "",
  endDate: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venueIsOnline: false,
  venueOnlineUrl: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactRole: "",
  maxAttendees: "",
  ticketPrice: "",
  category: "workshop",
  tags: "",
  dynamicFields: [],
  addOnItems: [],
  galleryImageUrls: [],
  requirePaymentProof: false,
  selectableDates: [],
};

// Convert ISO → "YYYY-MM-DDTHH:mm" cho datetime-local input
function isoToLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function localToIso(local: string): string {
  if (!local) return "";
  return new Date(local).toISOString();
}

function entityToForm(e: EventEntity): FormState {
  return {
    title: e.title,
    description: e.description,
    content: e.content,
    coverImageUrl: e.coverImageUrl ?? "",
    startDate: isoToLocal(e.startDate),
    endDate: isoToLocal(e.endDate),
    registrationOpenDate: isoToLocal(e.registrationOpenDate),
    registrationCloseDate: isoToLocal(e.registrationCloseDate),
    venueName: e.venue.name,
    venueAddress: e.venue.address,
    venueCity: e.venue.city ?? "",
    venueIsOnline: e.venue.isOnline ?? false,
    venueOnlineUrl: e.venue.onlineUrl ?? "",
    contactName: e.contactPerson.name,
    contactPhone: e.contactPerson.phone,
    contactEmail: e.contactPerson.email ?? "",
    contactRole: e.contactPerson.role ?? "",
    maxAttendees: e.maxAttendees ? String(e.maxAttendees) : "",
    ticketPrice: e.ticketPrice ? String(e.ticketPrice) : "",
    category: e.category ?? "workshop",
    tags: (e.tags ?? []).join(", "),
    dynamicFields: e.dynamicFields ?? [],
    addOnItems: e.addOnItems ?? [],
    galleryImageUrls: e.galleryImageUrls ?? [],
    requirePaymentProof: e.requirePaymentProof ?? false,
    selectableDates: e.selectableDates ?? [],
  };
}

export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // editorKey để force remount RebornEditor khi load dữ liệu edit
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (isEdit && id) {
      const e = eventStorage.getEvent(id);
      if (e) {
        setForm(entityToForm(e));
        setEditorKey((k) => k + 1);
      }
    }
  }, [id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const handleContentChange = (descendants: any) => {
    const html = serialize({ children: descendants });
    setForm((f) => ({ ...f, content: html }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Prototype: đọc file thành data URL. BE thật sẽ upload file rồi trả URL.
    const reader = new FileReader();
    reader.onload = () => {
      update("coverImageUrl", String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return "Vui lòng nhập tên sự kiện";
    if (!form.description.trim()) return "Vui lòng nhập mô tả ngắn";
    if (!form.startDate) return "Vui lòng chọn thời gian bắt đầu";
    if (!form.endDate) return "Vui lòng chọn thời gian kết thúc";
    if (new Date(form.endDate) <= new Date(form.startDate))
      return "Thời gian kết thúc phải sau thời gian bắt đầu";
    if (!form.registrationOpenDate || !form.registrationCloseDate)
      return "Vui lòng chọn thời gian mở/đóng đăng ký";
    if (new Date(form.registrationCloseDate) <= new Date(form.registrationOpenDate))
      return "Thời gian đóng đăng ký phải sau thời gian mở";
    if (!form.venueIsOnline) {
      if (!form.venueName.trim() || !form.venueAddress.trim())
        return "Vui lòng nhập địa điểm tổ chức";
    } else {
      if (!form.venueOnlineUrl.trim())
        return "Vui lòng nhập link online (Zoom/Meet...)";
    }
    if (!form.contactName.trim() || !form.contactPhone.trim())
      return "Vui lòng nhập thông tin người liên hệ";
    return null;
  };

  const handleSave = (publish: boolean) => {
    const err = validate();
    if (err) {
      setError(err);
      window.scrollTo(0, 0);
      return;
    }
    setSaving(true);
    const payload: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt"> = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content,
      coverImageUrl: form.coverImageUrl || undefined,
      startDate: localToIso(form.startDate),
      endDate: localToIso(form.endDate),
      registrationOpenDate: localToIso(form.registrationOpenDate),
      registrationCloseDate: localToIso(form.registrationCloseDate),
      venue: {
        name: form.venueName.trim(),
        address: form.venueAddress.trim(),
        city: form.venueCity.trim() || undefined,
        isOnline: form.venueIsOnline,
        onlineUrl: form.venueIsOnline ? form.venueOnlineUrl.trim() : undefined,
      },
      contactPerson: {
        name: form.contactName.trim(),
        phone: form.contactPhone.trim(),
        email: form.contactEmail.trim() || undefined,
        role: form.contactRole.trim() || undefined,
      },
      maxAttendees: form.maxAttendees
        ? parseInt(form.maxAttendees.replace(/[^\d]/g, ""), 10)
        : undefined,
      ticketPrice: form.ticketPrice
        ? parseInt(form.ticketPrice.replace(/[^\d]/g, ""), 10)
        : 0,
      category: form.category,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: publish ? "published" : "draft",
      publishedAt: publish ? new Date().toISOString() : undefined,
      createdBy: "Admin Demo",
      // ── CHUNG: Mở rộng ──
      dynamicFields: form.dynamicFields.length ? form.dynamicFields : undefined,
      addOnItems: form.addOnItems.length ? form.addOnItems : undefined,
      galleryImageUrls: form.galleryImageUrls.length ? form.galleryImageUrls : undefined,
      requirePaymentProof: form.requirePaymentProof || undefined,
      selectableDates: form.selectableDates.length ? form.selectableDates : undefined,
    };

    if (isEdit && id) {
      eventStorage.updateEvent(id, payload);
      navigate(`/ch_events/${id}`);
    } else {
      const created = eventStorage.createEvent(payload);
      navigate(`/ch_events/${created.id}`);
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => navigate("/ch_events")}
          style={{
            padding: "6px 12px",
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ← Danh sách sự kiện
        </button>
        <h2 style={{ margin: 0, color: THEME.primaryDark, flex: 1 }}>
          {isEdit ? "✏️ Sửa sự kiện" : "➕ Tạo sự kiện mới"}
        </h2>
      </div>

      {error && (
        <div
          style={{
            background: "#FEF2F2",
            borderLeft: `4px solid ${THEME.danger}`,
            padding: "10px 14px",
            borderRadius: 6,
            color: "#991B1B",
            marginBottom: 12,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Main column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Section title="1. Thông tin cơ bản">
            <Field label="Tên sự kiện" required>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="VD: Workshop Yoga cho người mới bắt đầu"
              />
            </Field>
            <Field label="Mô tả ngắn" required hint="Hiển thị ở card list + SEO">
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Mô tả ngắn gọn sự kiện trong 1-2 câu..."
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Danh mục">
                <select
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  <option value="workshop">Workshop</option>
                  <option value="hội thảo">Hội thảo</option>
                  <option value="lớp học">Lớp học</option>
                  <option value="networking">Networking</option>
                  <option value="training">Training</option>
                  <option value="khác">Khác</option>
                </select>
              </Field>
              <Field label="Tags (phân cách bằng dấu phẩy)">
                <input
                  style={inputStyle}
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="yoga, beginner, free"
                />
              </Field>
            </div>
          </Section>

          <Section title="2. Nội dung chi tiết">
            <div style={{ border: `1px solid ${THEME.border}`, borderRadius: 6, padding: 8 }}>
              <RebornEditor
                key={editorKey}
                name="event-content"
                fill={true}
                initialValue={form.content}
                onChangeContent={handleContentChange}
                placeholder="Nội dung chi tiết sự kiện — có thể chèn ảnh, bảng, link..."
              />
            </div>
          </Section>

          <Section title="3. Thời gian">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Bắt đầu" required>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                />
              </Field>
              <Field label="Kết thúc" required>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              </Field>
              <Field label="Mở đăng ký" required>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.registrationOpenDate}
                  onChange={(e) => update("registrationOpenDate", e.target.value)}
                />
              </Field>
              <Field label="Đóng đăng ký" required>
                <input
                  type="datetime-local"
                  style={inputStyle}
                  value={form.registrationCloseDate}
                  onChange={(e) => update("registrationCloseDate", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          <Section title="4. Địa điểm tổ chức">
            <label style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={form.venueIsOnline}
                onChange={(e) => update("venueIsOnline", e.target.checked)}
              />
              <span style={{ fontSize: 13, color: THEME.textMain }}>Sự kiện online</span>
            </label>
            {form.venueIsOnline ? (
              <Field label="Link online (Zoom/Meet/…)" required>
                <input
                  style={inputStyle}
                  value={form.venueOnlineUrl}
                  onChange={(e) => update("venueOnlineUrl", e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </Field>
            ) : (
              <>
                <Field label="Tên địa điểm" required>
                  <input
                    style={inputStyle}
                    value={form.venueName}
                    onChange={(e) => update("venueName", e.target.value)}
                    placeholder="VD: Home FitPro Thảo Điền"
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                  <Field label="Địa chỉ" required>
                    <input
                      style={inputStyle}
                      value={form.venueAddress}
                      onChange={(e) => update("venueAddress", e.target.value)}
                      placeholder="12 Thảo Điền, Q.2"
                    />
                  </Field>
                  <Field label="Thành phố">
                    <input
                      style={inputStyle}
                      value={form.venueCity}
                      onChange={(e) => update("venueCity", e.target.value)}
                      placeholder="TP.HCM"
                    />
                  </Field>
                </div>
              </>
            )}
          </Section>

          <Section title="5. Người liên hệ">
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <Field label="Họ tên" required>
                <input
                  style={inputStyle}
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                />
              </Field>
              <Field label="Vai trò">
                <input
                  style={inputStyle}
                  value={form.contactRole}
                  onChange={(e) => update("contactRole", e.target.value)}
                  placeholder="VD: Trưởng BTC"
                />
              </Field>
              <Field label="Số điện thoại" required>
                <input
                  style={inputStyle}
                  value={form.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  style={inputStyle}
                  value={form.contactEmail}
                  onChange={(e) => update("contactEmail", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* ── CHUNG: Section 6 — Trường tùy biến ── */}
          <Section title="6. Cấu hình form đăng ký">
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 8px" }}>
              Thêm trường tuỳ biến ngoài các trường mặc định (Họ tên, SĐT, Email, Công ty, Ghi chú).
            </p>
            <DynamicFieldsBuilder
              fields={form.dynamicFields}
              onChange={(fields) => setForm((f) => ({ ...f, dynamicFields: fields }))}
            />
          </Section>

          {/* ── CHUNG + ĐẶC THÙ: Section 7 — Sản phẩm/dịch vụ bổ sung ── */}
          <Section title="7. Sản phẩm / dịch vụ bổ sung">
            <AddOnTab
              items={form.addOnItems}
              onChange={(items) => setForm((f) => ({ ...f, addOnItems: items }))}
            />
          </Section>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Section title="🖼️ Ảnh cover">
            <div
              style={{
                aspectRatio: "16/9",
                background: form.coverImageUrl
                  ? `url(${form.coverImageUrl}) center/cover`
                  : THEME.primarySoft,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: THEME.textMuted,
                fontSize: 12,
                marginBottom: 10,
                border: `1px dashed ${THEME.border}`,
              }}
            >
              {!form.coverImageUrl && "Chưa có ảnh"}
            </div>
            <label
              style={{
                display: "block",
                padding: "8px 14px",
                background: THEME.primarySoft,
                color: THEME.primaryDark,
                borderRadius: 6,
                textAlign: "center",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              📤 Chọn ảnh
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCoverUpload}
              />
            </label>
            {form.coverImageUrl && (
              <button
                onClick={() => update("coverImageUrl", "")}
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: "6px 10px",
                  background: "#fff",
                  border: `1px solid ${THEME.danger}`,
                  color: THEME.danger,
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                Xoá ảnh
              </button>
            )}
          </Section>

          <Section title="🎟️ Vé & sức chứa">
            <Field label="Sức chứa tối đa" hint="Để trống = không giới hạn">
              <input
                type="number"
                style={inputStyle}
                value={form.maxAttendees}
                onChange={(e) => update("maxAttendees", e.target.value)}
                placeholder="VD: 50"
              />
            </Field>
            <Field label="Giá vé (VND)" hint="0 hoặc để trống = miễn phí">
              <input
                type="number"
                style={inputStyle}
                value={form.ticketPrice}
                onChange={(e) => update("ticketPrice", e.target.value)}
                placeholder="VD: 150000"
              />
              {form.ticketPrice && parseInt(form.ticketPrice, 10) > 0 && (
                <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 4 }}>
                  = {formatVND(parseInt(form.ticketPrice, 10))} đ
                </div>
              )}
            </Field>
          </Section>

          {/* ── CHUNG: Gallery ── */}
          <Section title="🖼️ Ảnh giới thiệu hoạt động">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {form.galleryImageUrls.map((url, i) => (
                <div
                  key={i}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 6,
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        galleryImageUrls: f.galleryImageUrls.filter((_, j) => j !== i),
                      }))
                    }
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: THEME.danger,
                      color: "#fff",
                      border: "none",
                      fontSize: 10,
                      cursor: "pointer",
                      lineHeight: "18px",
                      textAlign: "center",
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <label
              style={{
                display: "block",
                padding: "6px 10px",
                background: THEME.primarySoft,
                color: THEME.primaryDark,
                borderRadius: 6,
                textAlign: "center",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              + Thêm ảnh
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = () =>
                      setForm((f) => ({
                        ...f,
                        galleryImageUrls: [...f.galleryImageUrls, String(reader.result)],
                      }));
                    reader.readAsDataURL(file);
                  });
                  e.target.value = "";
                }}
              />
            </label>
          </Section>

          {/* ── CHUNG: Payment setting ── */}
          <Section title="💳 Thanh toán">
            <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
              <input
                type="checkbox"
                checked={form.requirePaymentProof}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requirePaymentProof: e.target.checked }))
                }
              />
              Yêu cầu upload bằng chứng thanh toán
            </label>
            <p style={{ fontSize: 11, color: THEME.textMuted, margin: "6px 0 0" }}>
              Khi bật, người đăng ký sẽ cần upload ảnh hoá đơn chuyển khoản.
            </p>
          </Section>

          {/* ── CHUNG: Multi-day dates ── */}
          <Section title="📅 Ngày tham gia (multi-day)">
            <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px" }}>
              Nếu sự kiện diễn ra nhiều ngày, liệt kê các ngày để khách chọn.
            </p>
            {form.selectableDates.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
                <input
                  type="date"
                  value={d}
                  onChange={(e) => {
                    const copy = [...form.selectableDates];
                    copy[i] = e.target.value;
                    setForm((f) => ({ ...f, selectableDates: copy }));
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      selectableDates: f.selectableDates.filter((_, j) => j !== i),
                    }))
                  }
                  style={{
                    width: 28,
                    height: 28,
                    border: `1px solid ${THEME.danger}`,
                    borderRadius: 4,
                    background: "#fff",
                    color: THEME.danger,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                setForm((f) => ({ ...f, selectableDates: [...f.selectableDates, ""] }))
              }
              style={{
                padding: "6px 12px",
                background: THEME.primarySoft,
                color: THEME.primaryDark,
                border: `1px dashed ${THEME.primary}`,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              + Thêm ngày
            </button>
          </Section>

          <Section title="💾 Lưu">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                width: "100%",
                padding: "12px",
                background: "#fff",
                color: THEME.primaryDark,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              💾 Lưu nháp
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                width: "100%",
                padding: "12px",
                background: THEME.primary,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              🚀 Lưu & công bố
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ── Add-on Tab: nhập tay + chọn từ catalog (ĐẶC THÙ) ──
function AddOnTab({
  items,
  onChange,
}: {
  items: EventAddOnItem[];
  onChange: (items: EventAddOnItem[]) => void;
}) {
  const [tab, setTab] = React.useState<"manual" | "catalog">("manual");

  const addManual = () => {
    const next: EventAddOnItem = {
      id: `addon-${Date.now()}`,
      name: "",
      unitPrice: 0,
      unit: "lần",
    };
    onChange([...items, next]);
  };

  const updateItem = (idx: number, patch: Partial<EventAddOnItem>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  // Catalog picker callback
  const handleCatalogToggle = (svcId: string, item: EventAddOnItem | null) => {
    if (item) {
      // Thêm nếu chưa có
      if (!items.find((i) => i.id === item.id)) onChange([...items, item]);
    } else {
      // Xoá
      onChange(items.filter((i) => i.id !== `svc-${svcId}`));
    }
  };

  const catalogIds = items.filter((i) => i.id.startsWith("svc-")).map((i) => i.id.replace("svc-", ""));

  return (
    <div>
      {/* Tab toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {(
          [
            { key: "manual" as const, label: "Nhập tay" },
            { key: "catalog" as const, label: "Từ danh mục DV" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "6px 14px",
              borderRadius: 16,
              border: `1px solid ${tab === t.key ? THEME.primary : THEME.border}`,
              background: tab === t.key ? THEME.primarySoft : "#fff",
              color: tab === t.key ? THEME.primaryDark : THEME.textMuted,
              fontSize: 12,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <div>
          {items
            .filter((i) => !i.id.startsWith("svc-"))
            .map((item, idx) => {
              const realIdx = items.indexOf(item);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 80px auto",
                    gap: 6,
                    marginBottom: 6,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(realIdx, { name: e.target.value })}
                    placeholder="Tên sản phẩm"
                    style={inputStyleInner}
                  />
                  <input
                    type="number"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(realIdx, { unitPrice: +e.target.value })}
                    placeholder="Giá (VND)"
                    style={inputStyleInner}
                  />
                  <input
                    value={item.unit}
                    onChange={(e) => updateItem(realIdx, { unit: e.target.value })}
                    placeholder="Đơn vị"
                    style={inputStyleInner}
                  />
                  <button
                    onClick={() => removeItem(realIdx)}
                    style={{
                      width: 28,
                      height: 28,
                      border: `1px solid ${THEME.danger}`,
                      borderRadius: 4,
                      background: "#fff",
                      color: THEME.danger,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          <button
            onClick={addManual}
            style={{
              padding: "6px 12px",
              background: THEME.primarySoft,
              color: THEME.primaryDark,
              border: `1px dashed ${THEME.primary}`,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            + Thêm sản phẩm
          </button>
        </div>
      )}

      {tab === "catalog" && (
        <ServiceCatalogPicker selectedIds={catalogIds} onToggle={handleCatalogToggle} />
      )}

      {/* Tổng add-on đã chọn */}
      {items.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: THEME.bg,
            borderRadius: 6,
            fontSize: 12,
            color: THEME.textMuted,
          }}
        >
          Đã cấu hình {items.length} sản phẩm/dịch vụ bổ sung
        </div>
      )}
    </div>
  );
}

const inputStyleInner: React.CSSProperties = {
  padding: "6px 8px",
  border: "1px solid #D9E0DE",
  borderRadius: 4,
  fontSize: 12,
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${THEME.border}`,
  borderRadius: 6,
  fontSize: 13,
  background: "#fff",
  color: THEME.textMain,
  outline: "none",
  boxSizing: "border-box",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: THEME.primaryDark,
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.primaryDark, marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: THEME.danger }}> *</span>}
      </div>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>{hint}</div>
      )}
    </div>
  );
}
