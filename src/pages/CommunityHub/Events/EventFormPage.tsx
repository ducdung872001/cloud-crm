// CH Events — Form tạo/sửa sự kiện với RebornEditor + cover image upload.
// Routes: /ch_events/create · /ch_events/:id/edit

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RebornEditor from "components/editor/reborn";
import DatePickerCustom from "components/datepickerCustom/datepickerCustom";
import { serialize } from "utils/editor";
import { uploadDocumentFormData } from "utils/document";
import { showToast } from "utils/common";
import { eventStorage } from "./storage";
import type { EventEntity, DynamicFieldDefinition, EventAddOnItem, EventVenue } from "./types";
import { THEME, formatVND } from "./shared";
import DynamicFieldsBuilder from "./components/DynamicFieldsBuilder";
// Yc 5/5: block-based editor cho trang sự kiện
import ContentBlocksBuilder from "./components/ContentBlocksBuilder";
import type { ContentBlock } from "./types";
import ServiceCatalogPicker from "./components/ServiceCatalogPicker";
import {
  dateToVNLocalString,
  vnLocalStringToDate,
  vnLocalToOffsetIso,
  isoToVNLocalString,
} from "./datetime";

// Form state dùng "YYYY-MM-DDTHH:mm" coi như giờ VN (Asia/Ho_Chi_Minh) —
// độc lập browser TZ. Adapter sang Date cho DatePickerCustom.
const localToDate = vnLocalStringToDate;
const dateToLocal = dateToVNLocalString;

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
  venueLatitude: string;
  venueLongitude: string;
  venueIsOnline: boolean;
  venueOnlineUrl: string;
  // Địa điểm phụ — danh sách động, mỗi cái kèm label (VD "Bãi đỗ xe", "Chỗ chờ")
  additionalVenues: Array<{
    label: string;
    name: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
  }>;
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
  bankName: string;
  bankHolder: string;
  bankAccountNumber: string;
  bankPhone: string;
  bankQrImageUrl: string; // QR ảnh upload (tenant chưa có VietQR)
  selectableDates: string[];
  // ── Yc 5/5 ──
  contentBlocks: ContentBlock[];
  isTest: boolean;
  commentsEnabled: boolean;
  commentsModerated: boolean;
  registrationFlows: ("guest" | "member_signup" | "member_login")[];
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
  venueLatitude: "",
  venueLongitude: "",
  venueIsOnline: false,
  venueOnlineUrl: "",
  additionalVenues: [],
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
  bankName: "",
  bankHolder: "",
  bankAccountNumber: "",
  bankPhone: "",
  bankQrImageUrl: "",
  selectableDates: [],
  contentBlocks: [],
  isTest: false,
  commentsEnabled: true,
  commentsModerated: false,
  registrationFlows: ["guest"],
};

// Convert ISO → "YYYY-MM-DDTHH:mm" giờ VN cho datetime-local input
const isoToLocal = isoToVNLocalString;

// "YYYY-MM-DDTHH:mm" giờ VN → ISO with explicit "+07:00" offset cho BE
const localToIso = vnLocalToOffsetIso;

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
    venueLatitude: e.venue.latitude != null ? String(e.venue.latitude) : "",
    venueLongitude: e.venue.longitude != null ? String(e.venue.longitude) : "",
    venueIsOnline: e.venue.isOnline ?? false,
    venueOnlineUrl: e.venue.onlineUrl ?? "",
    additionalVenues: (e.additionalVenues ?? []).map((v) => ({
      label: v.label ?? "",
      name: v.name ?? "",
      address: v.address ?? "",
      city: v.city ?? "",
      latitude: v.latitude != null ? String(v.latitude) : "",
      longitude: v.longitude != null ? String(v.longitude) : "",
    })),
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
    bankName: e.bankAccountOverride?.bank ?? "",
    bankHolder: e.bankAccountOverride?.holder ?? "",
    bankAccountNumber: e.bankAccountOverride?.accountNumber ?? "",
    bankPhone: e.bankAccountOverride?.phone ?? "",
    bankQrImageUrl: e.bankAccountOverride?.qrImageUrl ?? "",
    selectableDates: e.selectableDates ?? [],
    contentBlocks: e.contentBlocks ?? [],
    isTest: e.isTest ?? false,
    commentsEnabled: e.commentsEnabled !== false,
    commentsModerated: e.commentsModerated ?? false,
    registrationFlows: e.registrationFlows ?? ["guest"],
  };
}

export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);
  // editorKey để force remount RebornEditor khi load dữ liệu edit
  const [editorKey, setEditorKey] = useState(0);
  // editorInitialContent: snapshot HTML chỉ set 1 lần khi load → truyền vào
  // RebornEditor làm initialValue. KHÔNG dùng form.content (cập nhật mỗi keystroke)
  // vì RebornEditor có useEffect[initialValue] re-deserialize + Slate dùng dynamic
  // key → mọi keystroke remount Slate, mất cursor/scroll position.
  const [editorInitialContent, setEditorInitialContent] = useState<string>("");
  // Slug của event đang edit — phục vụ nút "Xem trước" mở trang public detail.
  const [previewSlug, setPreviewSlug] = useState<string>("");
  // Track form dirty bằng DOM event listener (input/change). KHÔNG dùng
  // useEffect[form] vì RebornEditor fire onChange ngay khi mount để normalize
  // HTML (round-trip serialize/deserialize) → setForm → tưởng dirty dù user
  // chưa gõ. DOM event với `isTrusted` chỉ fire khi user thực sự thao tác
  // (typing/select/checkbox/paste...). Programmatic state change → bỏ qua.
  const [isDirty, setIsDirty] = useState(false);
  const formWrapRef = useRef<HTMLDivElement | null>(null);
  // editorTouchedRef: false cho đến khi user thực sự gõ trong RebornEditor.
  // Mount-time onChange của Slate ghi đè form.content về rỗng (initialValueDelta
  // còn ở emptyParagraph trước khi useEffect[initialValue] deserialize HTML thật).
  const editorTouchedRef = useRef(false);
  // editorContentRef: nguồn chân lý duy nhất cho content khi submit. KHÔNG dùng
  // form.content vì Slate có thể fire onChange nhiều lần với các shape rỗng
  // khác nhau (`<p></p>`, `<p><br></p>`, `<p></p><p></p>`...) lúc mount/normalize
  // → khó detect chính xác để skip. Ref này chỉ update khi user touched + content
  // thật sự khác empty; submit đọc thẳng ref, không phụ thuộc form state.
  const editorContentRef = useRef("");

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        const e = await eventStorage.getEventAsync(id);
        if (e) {
          setForm(entityToForm(e));
          setEditorInitialContent(e.content || "");
          // Seed ref với content thật từ BE → submit có giá trị fallback đúng
          // ngay cả khi user không touch editor và Slate wipe form.content.
          editorContentRef.current = e.content || "";
          editorTouchedRef.current = false;
          setEditorKey((k) => k + 1);
          setPreviewSlug(e.slug || "");
        }
      })();
    }
  }, [id]);

  // Đánh dấu dirty khi user thực sự thao tác trong form (typing, select, paste,
  // tick checkbox, edit content...). isTrusted=true → event do user, không phải
  // do JS dispatch → đảm bảo việc load + editor normalize không trigger.
  // Đồng thời track editorTouched cho riêng RebornEditor (contenteditable).
  useEffect(() => {
    const wrap = formWrapRef.current;
    if (!wrap) return;
    const onUserInput = (e: Event) => {
      if (!e.isTrusted) return;
      setIsDirty(true);
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[contenteditable]")) {
        editorTouchedRef.current = true;
      }
    };
    wrap.addEventListener("input", onUserInput);
    wrap.addEventListener("change", onUserInput);
    return () => {
      wrap.removeEventListener("input", onUserInput);
      wrap.removeEventListener("change", onUserInput);
    };
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  // ── Inline validations (yc tester 2026-05-06) ─────────────────────────
  // Báo lỗi ngay khi nhập, không cần đợi bấm Lưu.
  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    const regOpen = form.registrationOpenDate ? new Date(form.registrationOpenDate) : null;
    const regClose = form.registrationCloseDate ? new Date(form.registrationCloseDate) : null;

    // Phần 3: Thời gian
    if (start && start < now) errs.startDate = "Ngày bắt đầu phải từ hôm nay trở đi";
    if (start && end && end <= start) errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (regOpen && start && regOpen >= start) errs.registrationOpenDate = "Ngày mở đăng ký phải trước ngày bắt đầu";
    if (regClose && regOpen && regClose <= regOpen) errs.registrationCloseDate = "Ngày đóng đăng ký phải sau ngày mở";
    else if (regClose && start && regClose >= start) errs.registrationCloseDate = "Ngày đóng đăng ký phải trước ngày bắt đầu";

    // Phần 4: Sự kiện online — link URL hợp lệ
    if (form.venueIsOnline && form.venueOnlineUrl.trim()) {
      try {
        const u = new URL(form.venueOnlineUrl.trim());
        if (!/^https?:$/.test(u.protocol)) errs.venueOnlineUrl = "Link phải bắt đầu bằng http(s)://";
      } catch {
        errs.venueOnlineUrl = "Link không hợp lệ. VD: https://zoom.us/j/...";
      }
    }

    // Phần 5: Người liên hệ
    if (form.contactPhone.trim() && !/^[+\d][\d\s\-.()]{6,}$/.test(form.contactPhone.trim())) {
      errs.contactPhone = "Số điện thoại chỉ chứa chữ số (có thể có +, -, dấu cách)";
    }
    if (form.contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      errs.contactEmail = "Email không đúng định dạng";
    }

    // Multi-day: ngày tham gia phải nằm trong [start, end]
    if (start && end) {
      form.selectableDates.forEach((d, i) => {
        if (!d) return;
        const dt = new Date(d);
        // selectableDates là yyyy-MM-dd → so sánh theo ngày
        const startDay = new Date(start); startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(end); endDay.setHours(23, 59, 59, 999);
        if (dt < startDay || dt > endDay) {
          errs[`selectableDates_${i}`] = "Ngày tham gia phải nằm trong khoảng bắt đầu – kết thúc";
        }
      });
    }

    return errs;
  }, [
    form.startDate,
    form.endDate,
    form.registrationOpenDate,
    form.registrationCloseDate,
    form.venueIsOnline,
    form.venueOnlineUrl,
    form.contactPhone,
    form.contactEmail,
    form.selectableDates,
  ]);

  // Refs để scroll-to-error khi save lỗi (yc tester 2026-05-06)
  const errorBannerRef = useRef<HTMLDivElement | null>(null);

  const handleContentChange = (descendants: any) => {
    const html = serialize({ children: descendants });
    // Detect mount-time empty wipe: Slate có thể fire onChange với rỗng
    // (`<p></p>`, `<p><br></p>`, `<p></p><p></p>`...) ở mount + lúc remount do
    // key đổi. Nếu html rỗng + ref đã có seed từ BE + user chưa touched → skip,
    // tránh mất content khi user chỉ sửa field khác.
    const stripped = html.replace(/\s/g, "");
    const isEmpty = !stripped || /^(<p[^>]*>(<br\s*\/?>)?<\/p>)+$/.test(stripped);
    if (isEmpty && !editorTouchedRef.current && editorContentRef.current) {
      return;
    }
    editorContentRef.current = html;
    setForm((f) => ({ ...f, content: html }));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    // Upload lên CDN reborn (https://reborn.vn/api/upload/file) → response.result.fileUrl.
    // Dùng FormData multipart thay vì JSON base64 để tránh payload quá lớn.
    setCoverUploading(true);
    uploadDocumentFormData(
      files[0],
      (data: any) => {
        const url = data?.fileUrl ?? data?.url;
        if (url) {
          update("coverImageUrl", url);
        } else {
          showToast("Upload thành công nhưng không nhận được URL", "error");
        }
        setCoverUploading(false);
      },
      () => {
        showToast("Có lỗi xảy ra trong quá trình upload ảnh", "error");
        setCoverUploading(false);
      },
    );
    e.target.value = "";
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    setQrUploading(true);
    uploadDocumentFormData(
      files[0],
      (data: any) => {
        const url = data?.fileUrl ?? data?.url;
        if (url) {
          update("bankQrImageUrl", url);
        } else {
          showToast("Upload thành công nhưng không nhận được URL", "error");
        }
        setQrUploading(false);
      },
      () => {
        showToast("Có lỗi xảy ra trong quá trình upload QR", "error");
        setQrUploading(false);
      },
    );
    e.target.value = "";
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
    // Dynamic fields — select phải có ít nhất 1 option
    for (const f of form.dynamicFields) {
      if (f.type === "select" && (!f.options || f.options.length === 0)) {
        return `Trường "${f.label || "(chưa đặt tên)"}" là kiểu "Chọn 1" nhưng chưa có tuỳ chọn nào. Vui lòng nhập các tuỳ chọn cách nhau bằng dấu phẩy.`;
      }
    }
    return null;
  };

  const handleSave = async (publish: boolean) => {
    // Block save khi còn lỗi inline (yc tester 2026-05-06)
    const inlineKeys = Object.keys(fieldErrors);
    if (inlineKeys.length > 0) {
      setError(`Còn ${inlineKeys.length} trường nhập sai. Vui lòng sửa các trường có dấu ⚠ rồi thử lại.`);
      // scroll lên banner lỗi (smooth) — fallback scrollTo(0,0)
      requestAnimationFrame(() => {
        if (errorBannerRef.current) {
          errorBannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      return;
    }
    const err = validate();
    if (err) {
      setError(err);
      requestAnimationFrame(() => {
        if (errorBannerRef.current) {
          errorBannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
      return;
    }
    setSaving(true);
    // editorContentRef là nguồn chân lý duy nhất: seed từ BE lúc load, chỉ
    // được ghi đè khi user thực sự gõ (input event isTrusted trong contenteditable).
    // Tránh hoàn toàn race với mount-time onChange của Slate.
    const safeContent = editorContentRef.current;
    const payload: Omit<EventEntity, "id" | "slug" | "createdAt" | "updatedAt"> = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: safeContent,
      coverImageUrl: form.coverImageUrl || undefined,
      startDate: localToIso(form.startDate),
      endDate: localToIso(form.endDate),
      registrationOpenDate: localToIso(form.registrationOpenDate),
      registrationCloseDate: localToIso(form.registrationCloseDate),
      venue: {
        name: form.venueName.trim(),
        address: form.venueAddress.trim(),
        city: form.venueCity.trim() || undefined,
        latitude: form.venueLatitude.trim() ? Number(form.venueLatitude.trim()) : undefined,
        longitude: form.venueLongitude.trim() ? Number(form.venueLongitude.trim()) : undefined,
        isOnline: form.venueIsOnline,
        onlineUrl: form.venueIsOnline ? form.venueOnlineUrl.trim() : undefined,
      },
      additionalVenues: form.additionalVenues.length
        ? (form.additionalVenues
            .map<EventVenue>((v) => ({
              label: v.label.trim() || undefined,
              name: v.name.trim(),
              address: v.address.trim(),
              city: v.city.trim() || undefined,
              latitude: v.latitude.trim() ? Number(v.latitude.trim()) : undefined,
              longitude: v.longitude.trim() ? Number(v.longitude.trim()) : undefined,
            }))
            .filter((v) => v.name || v.address))
        : undefined,
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
      // Bank account override — chỉ gửi khi requirePaymentProof bật + ít nhất số TK
      // Lưu bankAccountOverride nếu có bất kỳ field nào (số TK / QR ảnh) —
      // không phụ thuộc requirePaymentProof, để admin có thể chuẩn bị info
      // trước khi bật toggle thanh toán (yc tester 2026-05-06).
      bankAccountOverride: (form.bankAccountNumber.trim() || form.bankQrImageUrl.trim() || form.bankName.trim() || form.bankHolder.trim())
        ? {
            bank: form.bankName.trim(),
            holder: form.bankHolder.trim(),
            accountNumber: form.bankAccountNumber.trim(),
            phone: form.bankPhone.trim() || undefined,
            qrImageUrl: form.bankQrImageUrl.trim() || undefined,
          }
        : undefined,
      selectableDates: form.selectableDates.length ? form.selectableDates : undefined,
      // ── Yc 5/5 ──
      contentBlocks: form.contentBlocks.length ? form.contentBlocks : undefined,
      isTest: form.isTest || undefined,
      commentsEnabled: form.commentsEnabled,
      commentsModerated: form.commentsModerated || undefined,
      registrationFlows: form.registrationFlows.length ? form.registrationFlows : ["guest"],
    };

    try {
      if (isEdit && id) {
        await eventStorage.updateEventAsync(id, payload);
        setIsDirty(false); // tránh blocker chặn chính cú navigate sau save
        navigate(`/ch_events/${id}`);
      } else {
        const created = await eventStorage.createEventAsync(payload);
        setIsDirty(false);
        navigate(`/ch_events/${created.id}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Lưu thất bại: ${msg}`);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  };

  // ── Guard rời trang khi có thay đổi chưa lưu ─────────────────────────
  // App đang dùng BrowserRouter (không phải data router) → useBlocker không
  // dùng được. Workaround:
  // 1) Capture click vào <a> trên toàn document (sidebar / breadcrumb / Link) →
  //    confirm trước khi để default navigation chạy. Chỉ tác động khi isDirty.
  // 2) beforeunload cho đóng tab / refresh / gõ URL ngoài.
  // 3) Nút "← Danh sách sự kiện" của form là <button onClick={navigate}> nên
  //    không qua <a> — wrap riêng confirm bên trong onClick (ở phần JSX).
  const isDirtyRef = useRef(isDirty);
  useEffect(() => { isDirtyRef.current = isDirty; }, [isDirty]);

  useEffect(() => {
    const onAnchorClick = (e: MouseEvent) => {
      if (!isDirtyRef.current) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      // Bỏ qua link mở tab mới / có modifier / không có href / link external.
      if (anchor.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const ok = window.confirm(
        "Bạn có thay đổi chưa lưu. Rời khỏi trang sẽ mất các thay đổi này. Bạn có chắc muốn rời đi?",
      );
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onAnchorClick, true);
    return () => document.removeEventListener("click", onAnchorClick, true);
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Wrap navigate cho các nút trong form (button onClick={navigate}) — confirm
  // khi dirty rồi mới đi. Dùng cho "← Danh sách sự kiện".
  const navigateGuarded = (to: string) => {
    if (isDirty) {
      const ok = window.confirm(
        "Bạn có thay đổi chưa lưu. Rời khỏi trang sẽ mất các thay đổi này. Bạn có chắc muốn rời đi?",
      );
      if (!ok) return;
    }
    navigate(to);
  };

  return (
    <div ref={formWrapRef} style={{ padding: 20, background: THEME.bg, minHeight: "calc(100vh - 60px)" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <button
          onClick={() => navigateGuarded("/ch_events")}
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
        {isEdit && previewSlug && (
          <a
            href={`/crm/events/${encodeURIComponent(previewSlug)}`}
            target="_blank"
            rel="noreferrer"
            title={form.isTest
              ? "Mở trang public để preview & đăng ký thử (event TEST chỉ admin login mới truy cập được)"
              : "Mở trang public để xem trước & đăng ký thử"}
            style={{
              padding: "6px 12px",
              background: THEME.primarySoft,
              color: THEME.primaryDark,
              border: `1px solid ${THEME.primary}`,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            👁 Xem trước & đăng ký thử
          </a>
        )}
      </div>

      {error && (
        <div
          ref={errorBannerRef}
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
                initialValue={editorInitialContent}
                onChangeContent={handleContentChange}
                disableAutoScroll
                placeholder="Nội dung chi tiết sự kiện — có thể chèn ảnh, bảng, link..."
              />
            </div>
          </Section>

          <Section title="3. Thời gian">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Bắt đầu" required error={fieldErrors.startDate}>
                <DatePickerCustom
                  hasSelectTime
                  value={localToDate(form.startDate) ?? ""}
                  placeholder="dd/mm/yyyy hh:mm"
                  onChange={(v) => update("startDate", v instanceof Date ? dateToLocal(v) : "")}
                />
              </Field>
              <Field label="Kết thúc" required error={fieldErrors.endDate}>
                <DatePickerCustom
                  hasSelectTime
                  value={localToDate(form.endDate) ?? ""}
                  placeholder="dd/mm/yyyy hh:mm"
                  onChange={(v) => update("endDate", v instanceof Date ? dateToLocal(v) : "")}
                />
              </Field>
              <Field label="Mở đăng ký" required error={fieldErrors.registrationOpenDate}>
                <DatePickerCustom
                  hasSelectTime
                  value={localToDate(form.registrationOpenDate) ?? ""}
                  placeholder="dd/mm/yyyy hh:mm"
                  onChange={(v) => update("registrationOpenDate", v instanceof Date ? dateToLocal(v) : "")}
                />
              </Field>
              <Field label="Đóng đăng ký" required error={fieldErrors.registrationCloseDate}>
                <DatePickerCustom
                  hasSelectTime
                  value={localToDate(form.registrationCloseDate) ?? ""}
                  placeholder="dd/mm/yyyy hh:mm"
                  onChange={(v) => update("registrationCloseDate", v instanceof Date ? dateToLocal(v) : "")}
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
              <Field label="Link online (Zoom/Meet/…)" required error={fieldErrors.venueOnlineUrl}>
                <input
                  style={inputStyle}
                  type="url"
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

                {/* Map coordinates */}
                <div style={{
                  marginTop: 12, padding: 12,
                  background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: 6,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: THEME.primaryDark, marginBottom: 8 }}>
                    🗺️ Toạ độ Google Maps (để hiện bản đồ cho người đăng ký)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, alignItems: "flex-end" }}>
                    <div>
                      <label style={miniLabel}>Vĩ độ (latitude)</label>
                      <input
                        value={form.venueLatitude}
                        onChange={(e) => update("venueLatitude", e.target.value)}
                        placeholder="21.028511"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={miniLabel}>Kinh độ (longitude)</label>
                      <input
                        value={form.venueLongitude}
                        onChange={(e) => update("venueLongitude", e.target.value)}
                        placeholder="105.804817"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={miniLabel}>Dán URL Google Maps</label>
                      <input
                        placeholder="Dán link rồi nhấn ra ngoài để auto parse"
                        style={inputStyle}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (!v) return;
                          // Try parse @lat,lng từ URL Google Maps (vd: /@21.028,105.804,15z)
                          const m1 = v.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                          // Hoặc ?q=lat,lng
                          const m2 = v.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                          // Hoặc !3d..!4d..
                          const m3 = v.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                          const match = m1 || m3 || m2;
                          if (match) {
                            update("venueLatitude", match[1]);
                            update("venueLongitude", match[2]);
                            e.target.value = "";
                          } else {
                            alert("Không trích được toạ độ từ URL — vui lòng nhập thủ công lat/lng.");
                          }
                        }}
                      />
                    </div>
                  </div>

                  {(() => {
                    const lat = form.venueLatitude.trim();
                    const lng = form.venueLongitude.trim();
                    const ok = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
                    if (!ok) return (
                      <p style={{ fontSize: 11, color: THEME.textMuted, margin: "8px 0 0" }}>
                        💡 Tip: mở <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{ color: THEME.primary }}>Google Maps</a>,
                        chuột phải vào vị trí → bấm toạ độ (dạng 21.02, 105.80) → nó copy sẵn — paste vào 2 ô trên hoặc dán URL vào ô thứ 3.
                      </p>
                    );
                    return (
                      <div style={{ marginTop: 10 }}>
                        <iframe
                          title="Map preview"
                          src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                          style={{ border: 0, width: "100%", height: 220, borderRadius: 6 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Địa điểm phụ — bãi đỗ xe, chỗ chờ, lễ tân… */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: THEME.primaryDark }}>
                        📍 Địa điểm phụ
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                        Hướng dẫn chi tiết: bãi đỗ xe, chỗ chờ, quầy lễ tân, phòng họp... Mỗi địa điểm có map riêng trên trang public.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => update("additionalVenues", [
                        ...form.additionalVenues,
                        { label: "", name: "", address: "", city: "", latitude: "", longitude: "" },
                      ])}
                      style={{
                        padding: "6px 14px",
                        background: THEME.primary,
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Thêm địa điểm
                    </button>
                  </div>

                  {form.additionalVenues.length === 0 && (
                    <div style={{ padding: 12, background: THEME.bg, borderRadius: 6, border: `1px dashed ${THEME.border}`, fontSize: 12, color: THEME.textMuted, textAlign: "center" }}>
                      Chưa có địa điểm phụ nào. Bấm "+ Thêm địa điểm" để chỉ dẫn khách đến từng khu.
                    </div>
                  )}

                  {form.additionalVenues.map((av, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginTop: idx === 0 ? 0 : 10,
                        padding: 12,
                        background: "#fff",
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                        <input
                          style={{ ...inputStyle, flex: 1 }}
                          value={av.label}
                          placeholder="Nhãn (VD: Bãi đỗ xe / Chỗ chờ / Lễ tân)"
                          onChange={(e) => {
                            const next = [...form.additionalVenues];
                            next[idx] = { ...av, label: e.target.value };
                            update("additionalVenues", next);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = form.additionalVenues.filter((_, i) => i !== idx);
                            update("additionalVenues", next);
                          }}
                          style={{
                            padding: "8px 12px",
                            background: "#fff",
                            color: THEME.danger,
                            border: `1px solid ${THEME.danger}`,
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                          title="Xoá địa điểm"
                        >
                          🗑 Xoá
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 8 }}>
                        <input
                          style={inputStyle}
                          value={av.address}
                          placeholder="Địa chỉ"
                          onChange={(e) => {
                            const next = [...form.additionalVenues];
                            next[idx] = { ...av, address: e.target.value };
                            update("additionalVenues", next);
                          }}
                        />
                        <input
                          style={inputStyle}
                          value={av.city}
                          placeholder="Thành phố"
                          onChange={(e) => {
                            const next = [...form.additionalVenues];
                            next[idx] = { ...av, city: e.target.value };
                            update("additionalVenues", next);
                          }}
                        />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8 }}>
                        <input
                          style={inputStyle}
                          value={av.latitude}
                          placeholder="Vĩ độ"
                          onChange={(e) => {
                            const next = [...form.additionalVenues];
                            next[idx] = { ...av, latitude: e.target.value };
                            update("additionalVenues", next);
                          }}
                        />
                        <input
                          style={inputStyle}
                          value={av.longitude}
                          placeholder="Kinh độ"
                          onChange={(e) => {
                            const next = [...form.additionalVenues];
                            next[idx] = { ...av, longitude: e.target.value };
                            update("additionalVenues", next);
                          }}
                        />
                        <input
                          style={inputStyle}
                          placeholder="Dán URL Google Maps để auto parse toạ độ"
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (!v) return;
                            const m1 = v.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                            const m2 = v.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                            const m3 = v.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                            const match = m1 || m3 || m2;
                            if (match) {
                              const next = [...form.additionalVenues];
                              next[idx] = { ...av, latitude: match[1], longitude: match[2] };
                              update("additionalVenues", next);
                              e.target.value = "";
                            } else {
                              alert("Không trích được toạ độ từ URL — vui lòng nhập thủ công.");
                            }
                          }}
                        />
                      </div>
                      {av.latitude.trim() && av.longitude.trim() && !isNaN(Number(av.latitude)) && !isNaN(Number(av.longitude)) && (
                        <div style={{ marginTop: 8 }}>
                          <iframe
                            title={`Map ${idx}`}
                            src={`https://www.google.com/maps?q=${av.latitude},${av.longitude}&z=16&output=embed`}
                            style={{ border: 0, width: "100%", height: 160, borderRadius: 6 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      )}
                    </div>
                  ))}
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
              <Field label="Số điện thoại" required error={fieldErrors.contactPhone}>
                <input
                  style={inputStyle}
                  type="tel"
                  inputMode="tel"
                  value={form.contactPhone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^+\d\s\-.()]/g, "");
                    update("contactPhone", cleaned);
                  }}
                  placeholder="VD: 0987654321"
                />
              </Field>
              <Field label="Email" error={fieldErrors.contactEmail}>
                <input
                  style={inputStyle}
                  type="email"
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

            {/* Yc 5/5: 3 luồng đăng ký A/B/C */}
            <div style={{ marginTop: 16, padding: 12, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>
                🆔 Luồng đăng ký được phép
              </div>
              <p style={{ fontSize: 11, color: "#92400E", margin: "0 0 8px" }}>
                Tích các luồng mà sự kiện này cho phép. Nếu chỉ bật "Đăng ký nhanh" thì user không thấy switcher.
              </p>
              {([
                { key: "guest", label: "🎟️ Đăng ký nhanh — chỉ tên + SĐT (không cần mã)" },
                { key: "member_signup", label: "🆔 Cho phép đăng ký mã thành viên mới (admin duyệt)" },
                { key: "member_login", label: "🔑 Cho phép login bằng mã + mật khẩu (auto-fill)" },
              ] as const).map((flow) => {
                const checked = form.registrationFlows.includes(flow.key);
                return (
                  <label key={flow.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "3px 0" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...form.registrationFlows, flow.key]
                          : form.registrationFlows.filter((x) => x !== flow.key);
                        // Đảm bảo có ít nhất "guest"
                        setForm((f) => ({ ...f, registrationFlows: next.length ? next : ["guest"] }));
                      }}
                    />
                    {flow.label}
                  </label>
                );
              })}
            </div>
          </Section>

          {/* ── Yc 5/5: Section nội dung trang sự kiện block-based ── */}
          <Section title="6b. Nội dung trang sự kiện (kéo-thả block)">
            <p style={{ fontSize: 12, color: THEME.textMuted, margin: "0 0 8px" }}>
              Sắp xếp các block ảnh + chữ + banner + nhúng video. Nếu để trống, FE sẽ fallback dùng nội dung HTML ở section 2.
            </p>
            <ContentBlocksBuilder
              blocks={form.contentBlocks}
              onChange={(blocks) => setForm((f) => ({ ...f, contentBlocks: blocks }))}
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
              {!form.coverImageUrl && (coverUploading ? "Đang tải ảnh lên..." : "Chưa có ảnh")}
            </div>
            <label
              style={{
                display: "block",
                padding: "8px 14px",
                background: THEME.primarySoft,
                color: THEME.primaryDark,
                borderRadius: 6,
                textAlign: "center",
                cursor: coverUploading ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 600,
                opacity: coverUploading ? 0.6 : 1,
              }}
            >
              {coverUploading ? "⏳ Đang tải..." : "📤 Chọn ảnh"}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                disabled={coverUploading}
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

          {/* Yc 5/5: cờ test event + cấu hình bình luận */}
          <Section title="⚙️ Cờ hiển thị & bình luận">
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={form.isTest}
                onChange={(e) => update("isTest", e.target.checked)}
              />
              <span>
                <b>Đây là sự kiện TEST</b> — sẽ <u>ẩn khỏi public portal</u> dù status = published
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={form.commentsEnabled}
                onChange={(e) => update("commentsEnabled", e.target.checked)}
              />
              Cho phép bình luận dưới sự kiện
            </label>
            {form.commentsEnabled && (
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, paddingLeft: 22, color: THEME.textMuted }}>
                <input
                  type="checkbox"
                  checked={form.commentsModerated}
                  onChange={(e) => update("commentsModerated", e.target.checked)}
                />
                Bắt admin duyệt trước khi public
              </label>
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
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  // Upload từng file lên CDN reborn; BE trả về fileUrl → push vào gallery.
                  Array.from(files).forEach((file) => {
                    uploadDocumentFormData(
                      file,
                      (data: any) => {
                        const url = data?.fileUrl ?? data?.url;
                        if (url) {
                          setForm((f) => ({
                            ...f,
                            galleryImageUrls: [...f.galleryImageUrls, url],
                          }));
                        }
                      },
                      () => showToast("Có lỗi khi upload ảnh", "error"),
                    );
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

            {form.requirePaymentProof && (
              <div style={{
                marginTop: 12,
                padding: 12,
                background: THEME.bg,
                border: `1px solid ${THEME.border}`,
                borderRadius: 6,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}>
                <div style={{ gridColumn: "1 / -1", fontSize: 12, fontWeight: 600, color: THEME.primaryDark }}>
                  Thông tin chuyển khoản (hiển thị QR cho người đăng ký)
                </div>
                <div>
                  <label style={miniLabel}>Ngân hàng *</label>
                  <input
                    value={form.bankName}
                    onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                    placeholder="VD: VCB, TCB, MB..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={miniLabel}>Chủ tài khoản *</label>
                  <input
                    value={form.bankHolder}
                    onChange={e => setForm(f => ({ ...f, bankHolder: e.target.value }))}
                    placeholder="VD: NGUYEN VAN A"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={miniLabel}>Số tài khoản *</label>
                  <input
                    value={form.bankAccountNumber}
                    onChange={e => setForm(f => ({ ...f, bankAccountNumber: e.target.value }))}
                    placeholder="VD: 0123456789"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={miniLabel}>SĐT đối chiếu (không bắt buộc)</label>
                  <input
                    value={form.bankPhone}
                    onChange={e => setForm(f => ({ ...f, bankPhone: e.target.value }))}
                    placeholder="VD: 0987654321"
                    style={inputStyle}
                  />
                </div>
                <p style={{ gridColumn: "1 / -1", fontSize: 11, color: THEME.textMuted, margin: 0 }}>
                  Để trống → form đăng ký chỉ hiện upload biên lai, không có QR. Điền đủ 3 trường bắt buộc để FE tự sinh QR VietQR.
                </p>

                {/* Upload QR ảnh — cho tenant chưa dùng VietQR */}
                <div style={{ gridColumn: "1 / -1", marginTop: 6, paddingTop: 10, borderTop: `1px dashed ${THEME.border}` }}>
                  <label style={{ ...miniLabel, display: "block", marginBottom: 6 }}>
                    Mã QR ngân hàng (ảnh) — tuỳ chọn
                  </label>
                  <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px" }}>
                    Nếu tenant chưa dùng VietQR, upload ảnh QR thủ công ở đây. Khi có ảnh QR upload, hệ thống sẽ ưu tiên hiển thị QR này thay vì auto-gen.
                  </p>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    {(() => {
                      // Preview QR khớp với những gì user thấy trên ShareEventPage:
                      // ưu tiên ảnh upload, fallback auto-gen từ bank info qua qrserver.
                      const hasBank = !!(form.bankName.trim() && form.bankAccountNumber.trim());
                      const priceNum = parseInt(form.ticketPrice.replace(/[^\d]/g, ""), 10) || 0;
                      const autoPayload = hasBank
                        ? `${form.bankName.trim()}|${form.bankAccountNumber.trim()}|${priceNum || ""}|EVENT-${previewSlug || ""}`
                        : "";
                      const previewSrc = form.bankQrImageUrl
                        || (autoPayload ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(autoPayload)}` : "");
                      const isAuto = !form.bankQrImageUrl && !!previewSrc;
                      if (!previewSrc) return null;
                      return (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <img
                            src={previewSrc}
                            alt="QR ngân hàng"
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "contain",
                              border: `1px solid ${THEME.border}`,
                              borderRadius: 6,
                              background: "#fff",
                            }}
                          />
                          {isAuto && (
                            <span style={{ fontSize: 10, color: THEME.textMuted, fontStyle: "italic" }}>
                              (auto-gen từ thông tin TK)
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label
                        style={{
                          display: "inline-block",
                          padding: "8px 14px",
                          background: THEME.primary,
                          color: "#fff",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: qrUploading ? "wait" : "pointer",
                          opacity: qrUploading ? 0.6 : 1,
                          alignSelf: "flex-start",
                        }}
                      >
                        {qrUploading ? "Đang tải..." : form.bankQrImageUrl ? "Thay ảnh QR" : "Tải lên ảnh QR"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          disabled={qrUploading}
                          style={{ display: "none" }}
                        />
                      </label>
                      {form.bankQrImageUrl && (
                        <button
                          type="button"
                          onClick={() => update("bankQrImageUrl", "")}
                          style={{
                            padding: "6px 10px",
                            background: "#fff",
                            color: THEME.danger,
                            border: `1px solid ${THEME.danger}`,
                            borderRadius: 4,
                            fontSize: 11,
                            cursor: "pointer",
                            alignSelf: "flex-start",
                          }}
                        >
                          Xoá QR
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ── CHUNG: Multi-day dates ── */}
          <Section title="📅 Ngày tham gia (multi-day)">
            <p style={{ fontSize: 11, color: THEME.textMuted, margin: "0 0 8px" }}>
              Nếu sự kiện diễn ra nhiều ngày, liệt kê các ngày để khách chọn.
            </p>
            {form.selectableDates.map((d, i) => {
              const errKey = `selectableDates_${i}`;
              const err = fieldErrors[errKey];
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="date"
                      min={form.startDate ? form.startDate.slice(0, 10) : undefined}
                      max={form.endDate ? form.endDate.slice(0, 10) : undefined}
                      value={d}
                      onChange={(e) => {
                        const copy = [...form.selectableDates];
                        copy[i] = e.target.value;
                        setForm((f) => ({ ...f, selectableDates: copy }));
                      }}
                      style={{ ...inputStyle, flex: 1, borderColor: err ? THEME.danger : THEME.border }}
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
                  {err && <div style={{ fontSize: 11, color: THEME.danger, marginTop: 2, fontWeight: 600 }}>⚠ {err}</div>}
                </div>
              );
            })}
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

const miniLabel: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: THEME.textMuted,
  marginBottom: 3,
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
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: THEME.primaryDark, marginBottom: 4 }}>
        {label}
        {required && <span style={{ color: THEME.danger }}> *</span>}
      </div>
      {children}
      {error ? (
        <div style={{ fontSize: 11, color: THEME.danger, marginTop: 3, fontWeight: 600 }}>⚠ {error}</div>
      ) : hint ? (
        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>{hint}</div>
      ) : null}
    </div>
  );
}
