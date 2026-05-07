// [MH] CourseEdit — form tạo/sửa khoá học với validation, autosave, live preview, sticky actions
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Descendant } from "slate";
import RebornEditor from "components/editor/reborn";
import { UserContext, ContextType } from "contexts/userContext";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import ZoomClientForCourseEdit from "services/ZoomClient";
import FileService from "services/FileService";
import { apiGet, apiPost } from "services/apiHelper";
import { urlsApi } from "configs/urls";
import "../_shared/styles.scss";
import "./form.scss";

// Default category bootstrap cho mentorhub tenant (bsnId=6).
// Resolve dynamically qua /inventory/category/list?keyword=...
const DEFAULT_CATEGORY_KEYWORD = "mentorhub";
// BE require avatar non-empty; mentorhub chưa có upload UI → placeholder tạm.
const PLACEHOLDER_AVATAR = "https://placeholder.reborn.vn/course-default.png";

function parseSlateContent(s?: string | null): Descendant[] | null {
  if (!s) return null;
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed as Descendant[];
  } catch {
    /* not JSON, fall through */
  }
  return [{ type: "paragraph", children: [{ text: s }] }] as Descendant[];
}

type AgendaItem = { id: string; title: string; description: string; durationMin: number };

type FormData = {
  title: string;
  icon: string;
  avatar: string;
  description: string;
  category: string;
  content: Descendant[];
  agenda: AgendaItem[];
  sessions: number | "";
  capacity: number | "";
  startDate: string;
  price: number | "";
  originalPrice: number | "";
  zoomId: string;
  reminderZalo: boolean;
  reminderEmail: boolean;
  autoFeedback: boolean;
  autoRecording: boolean;
};

type Errors = Partial<Record<keyof FormData, string>>;

const CATEGORIES = ["Kỹ thuật phần mềm", "Quản lý sản phẩm", "Leadership", "Data & AI", "DevOps", "Khác"];
const ICONS = ["⎈", "∞", "◈", "⚡", "★", "✦", "◐", "▦", "❑", "☉"];
const EMPTY_RICH: Descendant[] = [{ type: "paragraph", children: [{ text: "" }] }] as Descendant[];
const PRICE_CHIPS: { label: string; value: number }[] = [
  { label: "Miễn phí", value: 0 },
  { label: "1M", value: 1_000_000 },
  { label: "2M", value: 2_000_000 },
  { label: "3M", value: 3_000_000 },
  { label: "5M", value: 5_000_000 },
];
const DRAFT_KEY = "mh:course-draft:v1";
const VND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
const DAYS_VN = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const newAgendaItem = (idx: number): AgendaItem => ({
  id: "AG-" + Math.random().toString(36).slice(2, 8),
  title: `Buổi ${idx + 1}`,
  description: "",
  durationMin: 120,
});

const defaultForm = (): FormData => ({
  title: "",
  icon: "⎈",
  avatar: "",
  description: "",
  category: CATEGORIES[0],
  content: EMPTY_RICH,
  agenda: [newAgendaItem(0), newAgendaItem(1), newAgendaItem(2)],
  sessions: "",
  capacity: 30,
  startDate: "",
  price: "",
  originalPrice: "",
  zoomId: "",
  reminderZalo: true,
  reminderEmail: true,
  autoFeedback: true,
  autoRecording: true,
});

export default function MHCourseEdit() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  document.title = (isEdit ? "Sửa" : "Tạo") + " khoá học · MentorHub";

  const ctx = useContext(UserContext) as ContextType;
  const supplierId = ctx?.idEmployee;

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1); // step xa nhất đã validated qua
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const formCardRef = useRef<HTMLDivElement>(null);
  const skipNextSaveRef = useRef(true); // chặn save lần đầu (mount)

  // Resolve default categoryId — bootstrap "Khoá học mentorhub" cho bsnId=6.
  // Nếu org chưa có category match keyword "mentorhub" → tự tạo để publish khoá
  // không bị chặn ở "Chưa có category mặc định cho mentorhub".
  useEffect(() => {
    apiGet(urlsApi.categoryService.list, {
      keyword: DEFAULT_CATEGORY_KEYWORD,
      page: 1,
      limit: 1,
    })
      .then((res: { result?: { items?: Array<{ id: number }> } }) => {
        const items = res?.result?.items || [];
        if (items.length > 0) {
          setResolvedCategoryId(items[0].id);
          return;
        }
        // Không tìm thấy → tự tạo
        return apiPost(urlsApi.categoryService.update, {
          name: "Khoá học mentorhub",
          avatar: "",
          parentId: 0,
          position: 0,
          active: 1,
          featured: 0,
        }).then((createRes: { result?: { id?: number } | number; code?: number }) => {
          const newId =
            typeof createRes?.result === "object"
              ? createRes.result?.id
              : typeof createRes?.result === "number"
              ? createRes.result
              : null;
          if (newId) setResolvedCategoryId(newId);
        });
      })
      .catch(() => {
        /* fallback null → save sẽ show error "Chưa có category mặc định" */
      });
  }, []);

  // Load existing course từ BE khi edit
  useEffect(() => {
    if (!isEdit || !id) return;
    const numId = Number(id);
    if (!Number.isFinite(numId) || numId <= 0) {
      // id không phải số (vd 'CRS-01' từ mock) → bỏ qua, dùng form mặc định
      setLoadingDetail(false);
      return;
    }
    setLoadingDetail(true);
    SalesServiceClient.get(numId)
      .then((res: { result?: SalesService }) => {
        const svc = res?.result;
        if (!svc) return;
        const meta = (svc.metadata as Record<string, unknown>) || {};
        const agendaFromMeta = Array.isArray(meta.agenda) ? (meta.agenda as AgendaItem[]) : null;
        const parsedContent = parseSlateContent(svc.content) ?? EMPTY_RICH;
        setForm({
          title: svc.name || "",
          icon: typeof meta.icon === "string" ? (meta.icon as string) : "⎈",
          avatar: svc.avatar || "",
          description: svc.intro || "",
          category: typeof meta.category === "string" ? (meta.category as string) : CATEGORIES[0],
          content: parsedContent,
          agenda: agendaFromMeta && agendaFromMeta.length > 0 ? agendaFromMeta : [newAgendaItem(0)],
          sessions: typeof meta.sessions === "number" ? (meta.sessions as number) : "",
          capacity: typeof meta.capacity === "number" ? (meta.capacity as number) : 30,
          startDate: typeof meta.startDate === "string" ? (meta.startDate as string) : "",
          price: typeof svc.price === "number" ? svc.price : "",
          originalPrice: typeof svc.retailPrice === "number" ? svc.retailPrice : "",
          zoomId: typeof meta.zoomId === "string" ? (meta.zoomId as string) : "",
          reminderZalo: meta.reminderZalo !== false,
          reminderEmail: meta.reminderEmail !== false,
          autoFeedback: meta.autoFeedback !== false,
          autoRecording: meta.autoRecording !== false,
        });
        // Form populated từ BE → bypass autosave-draft để khỏi đè lên BE state
        skipNextSaveRef.current = true;
        setMaxStep(6); // mở tất cả step khi edit existing
      })
      .catch(() => {
        setSaveError("Không tải được khoá — kiểm tra lại id");
      })
      .finally(() => setLoadingDetail(false));
  }, [isEdit, id]);

  // Khôi phục draft từ localStorage (chỉ khi tạo mới, không khi edit)
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { at: string; data: FormData };
      if (!parsed?.data?.title && !parsed?.data?.description) return;
      const at = new Date(parsed.at);
      const ago = Math.round((Date.now() - at.getTime()) / 60000);
      const agoStr = ago < 1 ? "vừa xong" : ago < 60 ? `${ago} phút trước` : `${Math.round(ago / 60)} giờ trước`;
      if (window.confirm(`Có bản nháp lưu ${agoStr} (${at.toLocaleString("vi-VN")}). Khôi phục?`)) {
        setForm(parsed.data);
        setDraftSavedAt(at);
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [isEdit]);

  // Auto-save draft (debounced) khi form thay đổi
  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    if (isEdit) return;
    const timer = setTimeout(() => {
      try {
        const at = new Date();
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: at.toISOString(), data: form }));
        setDraftSavedAt(at);
      } catch {
        /* quota exceeded */
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form, isEdit]);

  // Scroll lên đầu form khi đổi step
  useEffect(() => {
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Agenda helpers
  const updateAgenda = (idx: number, patch: Partial<AgendaItem>) => {
    setForm((p) => ({ ...p, agenda: p.agenda.map((a, i) => (i === idx ? { ...a, ...patch } : a)) }));
  };
  const addAgendaItem = () => {
    setForm((p) => ({ ...p, agenda: [...p.agenda, newAgendaItem(p.agenda.length)] }));
  };
  const removeAgendaItem = (idx: number) => {
    setForm((p) => ({ ...p, agenda: p.agenda.filter((_, i) => i !== idx) }));
  };
  const moveAgendaItem = (idx: number, dir: -1 | 1) => {
    setForm((p) => {
      const next = [...p.agenda];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return p;
      [next[idx], next[to]] = [next[to], next[idx]];
      return { ...p, agenda: next };
    });
  };

  const validateStep = (s: number): Errors => {
    const e: Errors = {};
    if (s === 1) {
      if (!form.title.trim()) e.title = "Nhập tên khoá học";
      else if (form.title.trim().length < 10) e.title = "Tên khoá quá ngắn (tối thiểu 10 ký tự)";
      if (!form.description.trim()) e.description = "Mô tả ngắn để học viên hiểu nội dung";
      else if (form.description.trim().length < 50)
        e.description = "Mô tả tối thiểu 50 ký tự (hiện " + form.description.trim().length + ")";
    }
    if (s === 2) {
      if (!form.agenda.length) e.agenda = "Cần ít nhất 1 buổi trong giáo trình";
      else if (form.agenda.some((a) => !a.title.trim())) e.agenda = "Mỗi buổi phải có tiêu đề";
    }
    if (s === 3) {
      if (!form.capacity || +form.capacity < 1) e.capacity = "Sĩ số ≥ 1";
      if (!form.startDate) e.startDate = "Chọn ngày bắt đầu";
      else if (new Date(form.startDate) < new Date(new Date().toDateString()))
        e.startDate = "Ngày bắt đầu phải trong tương lai";
    }
    if (s === 4) {
      if (form.price === "" || +form.price < 0) e.price = "Giá ≥ 0 (miễn phí nhập 0)";
      if (form.originalPrice !== "" && +form.originalPrice < +form.price)
        e.originalPrice = "Giá gốc phải ≥ giá bán";
    }
    if (s === 5) {
      if (!form.zoomId.trim()) e.zoomId = "Nhập Zoom Meeting ID (kết nối Zoom ở Cài đặt)";
      else if (!/^\d{3}-?\d{4}-?\d{4}$|^\d{10,11}$/.test(form.zoomId.replace(/\s/g, "")))
        e.zoomId = "Zoom ID không hợp lệ (ví dụ: 892-4731-0028)";
    }
    return e;
  };

  // Tổng số lỗi của toàn bộ form (cho progress bar)
  const overallProgress = useMemo(() => {
    let valid = 0;
    for (let s = 1; s <= 5; s++) if (Object.keys(validateStep(s)).length === 0) valid++;
    return Math.round((valid / 5) * 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      const ns = step + 1;
      setStep(ns);
      setMaxStep((m) => Math.max(m, ns));
    } else {
      // Scroll to first error
      setTimeout(() => {
        const el = formCardRef.current?.querySelector(".is-invalid, .mh-form__error");
        (el as HTMLElement | null)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    }
  };

  const goToStep = (target: number) => {
    if (target <= maxStep) setStep(target);
  };

  const submit = async (publish: boolean) => {
    const allErrors: Errors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
      ...validateStep(5),
    };
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      const keys = Object.keys(allErrors);
      const firstStep = keys.some((k) => ["title", "description"].includes(k))
        ? 1
        : keys.includes("agenda")
        ? 2
        : keys.some((k) => ["capacity", "startDate"].includes(k))
        ? 3
        : keys.some((k) => ["price", "originalPrice"].includes(k))
        ? 4
        : 5;
      setStep(firstStep);
      setMaxStep((m) => Math.max(m, firstStep));
      return;
    }

    if (!supplierId) {
      setSaveError("Chưa có session — đăng nhập lại để lưu khoá");
      return;
    }
    if (!resolvedCategoryId) {
      setSaveError("Chưa có category mặc định cho mentorhub — liên hệ admin");
      return;
    }

    setSaving(true);
    setSaveError(null);
    const numId = Number(id);
    const editingExisting = isEdit && Number.isFinite(numId) && numId > 0;

    const payload = {
      id: editingExisting ? numId : 0,
      name: form.title.trim(),
      intro: form.description.trim(),
      content: JSON.stringify(form.content),
      contentType: 0,
      avatar: form.avatar || PLACEHOLDER_AVATAR,
      type: "COURSE_LIVE",
      status: publish ? "ACTIVE" : "DRAFT",
      active: 1,
      supplierId,
      categoryId: resolvedCategoryId,
      price: form.price === "" ? 0 : Number(form.price),
      retailPrice: form.originalPrice === "" ? 0 : Number(form.originalPrice),
      metadata: {
        icon: form.icon,
        category: form.category,
        agenda: form.agenda,
        sessions: form.sessions === "" ? 0 : Number(form.sessions),
        sessionsDone: 0,
        capacity: form.capacity === "" ? 0 : Number(form.capacity),
        registered: 0,
        startDate: form.startDate,
        zoomId: form.zoomId,
        reminderZalo: form.reminderZalo,
        reminderEmail: form.reminderEmail,
        autoFeedback: form.autoFeedback,
        autoRecording: form.autoRecording,
      },
    };

    try {
      const res: { code?: number; message?: string; result?: { id?: number } } =
        await SalesServiceClient.update(payload as Partial<SalesService>);
      if (res?.code !== 0) {
        throw new Error(res?.message || "Lưu thất bại");
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* quota/private mode — ignore */
      }
      setSubmitted(true);
      setTimeout(() => navigate("/mh/courses"), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu thất bại";
      setSaveError(msg);
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    const numId = Number(id);
    if (!isEdit || !Number.isFinite(numId) || numId <= 0) return;
    if (!window.confirm("Lưu trữ khoá này? Khoá sẽ ẩn khỏi danh sách công khai (status=ARCHIVED) nhưng dữ liệu vẫn giữ lại.")) {
      return;
    }
    setArchiving(true);
    setSaveError(null);
    try {
      const res: { code?: number; message?: string } = await SalesServiceClient.archive(numId);
      if (res?.code !== 0) throw new Error(res?.message || "Lưu trữ thất bại");
      navigate("/mh/courses");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lưu trữ thất bại";
      setSaveError(msg);
      setArchiving(false);
    }
  };

  if (submitted) {
    return (
      <div className="mh">
        <div
          className="mh__card"
          style={{ textAlign: "center", padding: 60, maxWidth: 560, margin: "80px auto" }}
        >
          <div style={{ fontSize: 64, marginBottom: 16, color: "var(--mh-green)" }}>✓</div>
          <h2 style={{ marginBottom: 12 }}>Khoá học đã lưu</h2>
          <p style={{ color: "var(--mh-ink-soft)" }}>Đang chuyển về danh sách…</p>
        </div>
      </div>
    );
  }

  const steps = ["Thông tin", "Giáo trình", "Lịch & Sĩ số", "Định giá", "Tự động hoá", "Duyệt & Publish"];
  const totalAgendaMin = form.agenda.reduce((s, a) => s + (a.durationMin || 0), 0);
  const dateInfo = formatDateInfo(form.startDate);
  const discountPct =
    form.price !== "" &&
    form.originalPrice !== "" &&
    +form.originalPrice > +form.price &&
    +form.originalPrice > 0
      ? Math.round((1 - +form.price / +form.originalPrice) * 100)
      : 0;

  return (
    <div className="mh mh-course-edit">
      {/* Top bar: breadcrumb + save status */}
      <div className="mh-course-edit__topbar">
        <Link to="/mh/courses" className="mh-course-edit__back">
          ← Tất cả khoá học
        </Link>
        <div className="mh-course-edit__save-status" aria-live="polite">
          {draftSavedAt && !isEdit ? (
            <>
              <span className="mh-course-edit__save-dot" />
              Đã lưu nháp {timeAgo(draftSavedAt)}
            </>
          ) : isEdit ? (
            <span style={{ color: "var(--mh-ink-soft)" }}>Chế độ chỉnh sửa</span>
          ) : null}
        </div>
      </div>

      <div className="mh__hero" style={{ marginBottom: 20 }}>
        <div className="mh__kicker">{isEdit ? "SỬA KHOÁ" : "TẠO KHOÁ MỚI"}</div>
        <h1>
          {isEdit ? "Cập nhật khoá" : "Tạo khoá học"} <em>mới</em>
        </h1>
        <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
          Điền thông tin qua 6 bước. Có thể lưu nháp và publish sau.
        </p>
      </div>

      {/* Progress bar tổng thể */}
      <div className="mh-course-edit__progress">
        <div className="mh-course-edit__progress-head">
          <span className="mh__kicker" style={{ margin: 0 }}>
            HOÀN THÀNH
          </span>
          <span className="mh__mono" style={{ fontSize: 12, color: "var(--mh-ink-soft)" }}>
            {overallProgress}% · bước {step}/6
          </span>
        </div>
        <div className="mh__progress" style={{ height: 4 }}>
          <div className="mh__progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      <div className="mh-wizard" role="tablist" aria-label="Các bước tạo khoá học">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isDone = stepNum < step || (stepNum <= maxStep && stepNum !== step);
          const isLocked = stepNum > maxStep;
          return (
            <button
              key={label}
              role="tab"
              aria-current={isActive ? "step" : undefined}
              aria-disabled={isLocked || undefined}
              onClick={() => goToStep(stepNum)}
              disabled={isLocked}
              className={
                "mh-wizard__step" +
                (isActive ? " is-active" : "") +
                (isDone ? " is-done" : "") +
                (isLocked ? " is-locked" : "")
              }
              title={isLocked ? "Hoàn tất các bước trước để mở" : ""}
            >
              <span className="mh-wizard__num">{isDone && !isActive ? "✓" : stepNum}</span>
              <span className="mh-wizard__label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Layout 2 cột: form + live preview sticky */}
      <div className="mh-course-edit__layout">
        <div className="mh__card mh-form" ref={formCardRef}>
          {step === 1 && <Step1 form={form} errors={errors} set={set} />}
          {step === 2 && (
            <Step2
              form={form}
              errors={errors}
              set={set}
              totalAgendaMin={totalAgendaMin}
              updateAgenda={updateAgenda}
              addAgendaItem={addAgendaItem}
              removeAgendaItem={removeAgendaItem}
              moveAgendaItem={moveAgendaItem}
            />
          )}
          {step === 3 && (
            <Step3 form={form} errors={errors} set={set} totalAgendaMin={totalAgendaMin} dateInfo={dateInfo} setStep={setStep} />
          )}
          {step === 4 && <Step4 form={form} errors={errors} set={set} discountPct={discountPct} />}
          {step === 5 && (
            <Step5
              form={form}
              errors={errors}
              set={set}
              supplierId={supplierId}
              courseTitle={form.title}
              startDate={form.startDate}
              totalDurationMin={form.agenda.reduce((s, a) => s + (a.durationMin || 0), 0)}
            />
          )}
          {step === 6 && <Step6 form={form} discountPct={discountPct} totalAgendaMin={totalAgendaMin} dateInfo={dateInfo} />}
        </div>

        <aside className="mh-course-edit__preview" aria-label="Xem trước thẻ khoá học">
          <div className="mh__kicker" style={{ marginBottom: 10 }}>
            XEM TRƯỚC TRÊN MARKETPLACE
          </div>
          <CoursePreviewCard form={form} discountPct={discountPct} totalAgendaMin={totalAgendaMin} />
          <div className="mh-course-edit__preview-meta">
            {form.startDate && <div>📅 Bắt đầu: {dateInfo.long}</div>}
            <div>👥 Sĩ số tối đa: {form.capacity || "—"}</div>
            <div>⏱ Tổng thời lượng: {formatDuration(totalAgendaMin)}</div>
          </div>
        </aside>
      </div>

      {saveError && (
        <div
          className="mh__card"
          style={{
            background: "#fef2f2",
            borderColor: "#fecaca",
            color: "#991b1b",
            padding: 12,
            marginBottom: 12,
          }}
          role="alert"
        >
          ⚠ {saveError}
        </div>
      )}

      {/* Sticky action bar */}
      <div className="mh-course-edit__actionbar">
        <div className="mh-course-edit__actionbar-inner">
          <button
            className="mh__btn"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || saving || archiving}
          >
            ← Quay lại
          </button>
          <span className="mh-course-edit__actionbar-step">
            Bước {step}/6 · {steps[step - 1]}
            {loadingDetail ? " · Đang tải khoá…" : ""}
          </span>
          <div style={{ flex: 1 }} />
          {isEdit && Number.isFinite(Number(id)) && Number(id) > 0 && (
            <button
              type="button"
              className="mh__btn"
              onClick={handleArchive}
              disabled={saving || archiving}
              style={{ borderColor: "#fca5a5", color: "#991b1b" }}
            >
              {archiving ? "Đang lưu trữ…" : "Lưu trữ khoá"}
            </button>
          )}
          {step < 6 ? (
            <button
              className="mh__btn mh__btn--primary"
              onClick={next}
              disabled={saving || archiving}
            >
              Tiếp theo →
            </button>
          ) : (
            <>
              <button
                className="mh__btn"
                onClick={() => submit(false)}
                disabled={saving || archiving}
              >
                {saving ? "Đang lưu…" : "Lưu nháp"}
              </button>
              <button
                className="mh__btn mh__btn--primary"
                onClick={() => submit(true)}
                disabled={saving || archiving}
              >
                {saving ? "Đang publish…" : "Publish khoá học"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Step components
// ────────────────────────────────────────────────────────────────────────────

type StepCommon = {
  form: FormData;
  errors: Errors;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
};

function AvatarUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá 5MB — nén lại trước khi upload");
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    FileService.uploadFile({
      data: file,
      onProgress: (p: number) => setProgress(p),
      onSuccess: (result: { url?: string; src?: string } | string) => {
        const url =
          typeof result === "string"
            ? result
            : result?.url || result?.src || "";
        if (url) {
          onChange(url);
        } else {
          setError("Upload xong nhưng không nhận được URL");
        }
        setUploading(false);
      },
      onError: (err: { message?: string } | Error) => {
        setUploading(false);
        const msg = err instanceof Error ? err.message : err?.message || "Upload thất bại";
        setError(msg);
      },
    });
  };

  return (
    <div className="mh-form__row">
      <label className="mh-form__label">Ảnh đại diện khoá</label>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 12,
            background: value
              ? `url(${value}) center/cover`
              : "var(--mh-ivory-2)",
            border: "1px solid var(--mh-line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mh-ink-soft)",
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {!value && "Chưa có ảnh"}
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            className="mh__btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? `Đang upload ${Math.round(progress)}%…` : value ? "Đổi ảnh" : "Chọn ảnh từ máy"}
          </button>
          {value && !uploading && (
            <button
              type="button"
              className="mh__btn"
              style={{ marginLeft: 8, color: "#991b1b" }}
              onClick={() => onChange("")}
            >
              Xoá
            </button>
          )}
          <div className="mh-form__hint" style={{ marginTop: 6 }}>
            {error ? (
              <span className="mh-form__error">⚠ {error}</span>
            ) : (
              <span>Tỉ lệ 16:9, ≤5MB. Nếu để trống dùng ảnh placeholder.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({ form, errors, set }: StepCommon) {
  const tagLen = form.description.trim().length;
  const tagPct = Math.min(100, Math.round((tagLen / 50) * 100));
  const tagOk = tagLen >= 50;
  return (
    <>
      <h3>1. Thông tin cơ bản</h3>
      <AvatarUpload value={form.avatar} onChange={(url) => set("avatar", url)} />
      <div className="mh-form__row">
        <label className="mh-form__label" htmlFor="course-title">
          Tên khoá học <span className="mh-form__req">*</span>
        </label>
        <input
          id="course-title"
          className={"mh-form__input" + (errors.title ? " is-invalid" : "")}
          aria-invalid={!!errors.title}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="VD: Kiến trúc Microservices với Spring Boot"
          maxLength={120}
        />
        <div className="mh-form__hint">
          {errors.title ? (
            <span className="mh-form__error">⚠ {errors.title}</span>
          ) : (
            <span>{form.title.length}/120 ký tự</span>
          )}
        </div>
      </div>

      <div className="mh-form__grid-2 mh-form__grid-2--lopsided">
        <div className="mh-form__row">
          <label className="mh-form__label">Icon hiển thị</label>
          <div className="mh-icon-picker">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => set("icon", ic)}
                className={"mh-icon-picker__item" + (form.icon === ic ? " is-active" : "")}
                aria-pressed={form.icon === ic}
                aria-label={`Chọn icon ${ic}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div className="mh-form__row">
          <label className="mh-form__label" htmlFor="course-cat">
            Chuyên mục
          </label>
          <select
            id="course-cat"
            className="mh-form__input"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mh-form__row">
        <label className="mh-form__label" htmlFor="course-desc">
          Mô tả ngắn (tagline) <span className="mh-form__req">*</span>
        </label>
        <textarea
          id="course-desc"
          className={"mh-form__input mh-form__textarea" + (errors.description ? " is-invalid" : "")}
          aria-invalid={!!errors.description}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Học viên học được gì? Phù hợp cho ai? (hiển thị trên card, tối thiểu 50 ký tự)"
          maxLength={500}
        />
        {/* Tagline length progress */}
        <div className="mh-form__taglen">
          <div className="mh-form__taglen-bar">
            <div
              className={"mh-form__taglen-fill" + (tagOk ? " is-ok" : "")}
              style={{ width: `${tagPct}%` }}
            />
          </div>
          <span
            className={"mh-form__taglen-text" + (tagOk ? " is-ok" : "")}
            style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11 }}
          >
            {tagLen}/500 · min 50 {tagOk ? "✓" : ""}
          </span>
        </div>
        {errors.description && <div className="mh-form__error">⚠ {errors.description}</div>}
        <div className="mh-form__hint" style={{ marginTop: 6 }}>
          AI có thể viết dựa trên tên khoá.
        </div>
      </div>
    </>
  );
}

type Step2Props = StepCommon & {
  totalAgendaMin: number;
  updateAgenda: (idx: number, patch: Partial<AgendaItem>) => void;
  addAgendaItem: () => void;
  removeAgendaItem: (idx: number) => void;
  moveAgendaItem: (idx: number, dir: -1 | 1) => void;
};

function Step2({
  form,
  errors,
  set,
  totalAgendaMin,
  updateAgenda,
  addAgendaItem,
  removeAgendaItem,
  moveAgendaItem,
}: Step2Props) {
  return (
    <>
      <h3>2. Giáo trình chi tiết</h3>

      <div className="mh-form__row">
        <label className="mh-form__label">Nội dung chi tiết khoá học</label>
        <div className="mh-form__hint" style={{ marginTop: 0, marginBottom: 8 }}>
          Mô tả đầy đủ, mục tiêu học tập, yêu cầu đầu vào, lợi ích sau khoá. Hỗ trợ định dạng văn bản
          đậm/nghiêng/danh sách/link.
        </div>
        <div className="mh-form__editor-wrap">
          <RebornEditor
            name="courseContent"
            fill
            initialValue={form.content as unknown as string}
            onChangeContent={(value) => set("content", value)}
          />
        </div>
      </div>

      <div className="mh-form__row">
        <div className="mh-form__agenda-head">
          <label className="mh-form__label" style={{ marginBottom: 0 }}>
            Agenda buổi học <span className="mh-form__req">*</span>
          </label>
          <span className="mh-form__hint" style={{ marginTop: 0 }}>
            <strong>{form.agenda.length}</strong> buổi · tổng <strong>{formatDuration(totalAgendaMin)}</strong>
          </span>
        </div>
        {errors.agenda && <div className="mh-form__error" style={{ marginBottom: 10 }}>⚠ {errors.agenda}</div>}

        <div className="mh-agenda">
          {form.agenda.map((item, idx) => (
            <div key={item.id} className="mh-agenda__item">
              <div className="mh-agenda__num">{String(idx + 1).padStart(2, "0")}</div>
              <div className="mh-agenda__body">
                <input
                  className="mh-form__input"
                  value={item.title}
                  onChange={(e) => updateAgenda(idx, { title: e.target.value })}
                  placeholder="Tiêu đề buổi học"
                  style={{ marginBottom: 8, fontWeight: 500 }}
                />
                <textarea
                  className="mh-form__input mh-form__textarea"
                  value={item.description}
                  onChange={(e) => updateAgenda(idx, { description: e.target.value })}
                  placeholder="Nội dung buổi học, demo, homework… (tuỳ chọn)"
                  rows={2}
                  style={{ minHeight: 60 }}
                />
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
                  <label className="mh-form__hint" style={{ marginTop: 0 }}>
                    Thời lượng:
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={480}
                    value={item.durationMin}
                    onChange={(e) => updateAgenda(idx, { durationMin: +e.target.value })}
                    className="mh-form__input"
                    style={{ width: 90, padding: "6px 10px" }}
                  />
                  <span className="mh-form__hint" style={{ marginTop: 0 }}>
                    phút
                  </span>
                </div>
              </div>
              <div className="mh-agenda__actions">
                <button
                  type="button"
                  className="mh-agenda__btn"
                  onClick={() => moveAgendaItem(idx, -1)}
                  disabled={idx === 0}
                  title="Di chuyển lên"
                  aria-label="Di chuyển buổi học lên"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="mh-agenda__btn"
                  onClick={() => moveAgendaItem(idx, 1)}
                  disabled={idx === form.agenda.length - 1}
                  title="Di chuyển xuống"
                  aria-label="Di chuyển buổi học xuống"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="mh-agenda__btn mh-agenda__btn--danger"
                  onClick={() => removeAgendaItem(idx)}
                  disabled={form.agenda.length === 1}
                  title="Xoá buổi"
                  aria-label="Xoá buổi học"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="mh__btn" style={{ marginTop: 10 }} onClick={addAgendaItem}>
          + Thêm buổi học
        </button>
        <span className="mh-form__hint" style={{ marginLeft: 10 }}>
          Số buổi tự động cập nhật theo agenda
        </span>
      </div>
    </>
  );
}

type Step3Props = StepCommon & {
  totalAgendaMin: number;
  dateInfo: ReturnType<typeof formatDateInfo>;
  setStep: (s: number) => void;
};

function Step3({ form, errors, set, totalAgendaMin, dateInfo, setStep }: Step3Props) {
  return (
    <>
      <h3>3. Lịch học & Sĩ số</h3>
      <div className="mh-form__grid-2">
        <div className="mh-form__row">
          <label className="mh-form__label">Số buổi</label>
          <input
            type="number"
            className="mh-form__input"
            value={form.agenda.length}
            readOnly
            style={{ background: "var(--mh-ivory-2)" }}
            aria-readonly="true"
          />
          <div className="mh-form__hint">
            Tự động từ Agenda · tổng {formatDuration(totalAgendaMin)} (
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                setStep(2);
              }}
              className="mh-link"
            >
              sửa
            </Link>
            )
          </div>
        </div>
        <div className="mh-form__row">
          <label className="mh-form__label" htmlFor="course-cap">
            Sĩ số tối đa <span className="mh-form__req">*</span>
          </label>
          <input
            id="course-cap"
            type="number"
            min={1}
            max={1000}
            className={"mh-form__input" + (errors.capacity ? " is-invalid" : "")}
            aria-invalid={!!errors.capacity}
            value={form.capacity}
            onChange={(e) => set("capacity", e.target.value === "" ? "" : +e.target.value)}
            placeholder="30"
          />
          {errors.capacity && <div className="mh-form__error">⚠ {errors.capacity}</div>}
        </div>
      </div>
      <div className="mh-form__row">
        <label className="mh-form__label" htmlFor="course-start">
          Ngày bắt đầu <span className="mh-form__req">*</span>
        </label>
        <input
          id="course-start"
          type="date"
          className={"mh-form__input" + (errors.startDate ? " is-invalid" : "")}
          aria-invalid={!!errors.startDate}
          value={form.startDate}
          onChange={(e) => set("startDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.startDate ? (
          <div className="mh-form__error">⚠ {errors.startDate}</div>
        ) : form.startDate ? (
          <div className="mh-form__hint">📅 {dateInfo.long} · {dateInfo.relative}</div>
        ) : (
          <div className="mh-form__hint">Chọn ngày bắt đầu khoá học (phải trong tương lai)</div>
        )}
      </div>

      <div className="mh-form__row">
        <label className="mh-form__label">Xem nhanh agenda</label>
        <div className="mh-form__agenda-quick">
          {form.agenda.map((a, i) => (
            <div
              key={a.id}
              className="mh-form__agenda-quick-row"
              style={{ borderBottom: i < form.agenda.length - 1 ? "1px solid var(--mh-line)" : "none" }}
            >
              <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)", minWidth: 24 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{a.title}</span>
              <span className="mh__mono" style={{ fontSize: 11, color: "var(--mh-ink-soft)" }}>
                {a.durationMin}p
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

type Step4Props = StepCommon & { discountPct: number };

function Step4({ form, errors, set, discountPct }: Step4Props) {
  return (
    <>
      <h3>4. Định giá</h3>

      <div className="mh-form__chips" style={{ marginBottom: 16 }}>
        <span className="mh-form__hint" style={{ marginTop: 0, marginRight: 8 }}>
          Chọn nhanh:
        </span>
        {PRICE_CHIPS.map((c) => (
          <button
            key={c.label}
            type="button"
            className={"mh-form__chip" + (form.price === c.value ? " is-active" : "")}
            onClick={() => set("price", c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mh-form__grid-2">
        <div className="mh-form__row">
          <label className="mh-form__label" htmlFor="course-price">
            Giá bán <span className="mh-form__req">*</span>
          </label>
          <PriceInput
            id="course-price"
            value={form.price}
            onChange={(v) => set("price", v)}
            placeholder="2.400.000"
            invalid={!!errors.price}
          />
          {errors.price && <div className="mh-form__error">⚠ {errors.price}</div>}
        </div>
        <div className="mh-form__row">
          <label className="mh-form__label" htmlFor="course-orig">
            Giá gốc (gạch chéo)
          </label>
          <PriceInput
            id="course-orig"
            value={form.originalPrice}
            onChange={(v) => set("originalPrice", v)}
            placeholder="3.200.000"
            invalid={!!errors.originalPrice}
          />
          {errors.originalPrice ? (
            <div className="mh-form__error">⚠ {errors.originalPrice}</div>
          ) : discountPct > 0 ? (
            <div className="mh-form__hint" style={{ color: "var(--mh-green)" }}>
              ✓ Hiển thị giảm <strong>{discountPct}%</strong> trên thẻ
            </div>
          ) : (
            <div className="mh-form__hint">Tuỳ chọn — để trống nếu không khuyến mãi</div>
          )}
        </div>
      </div>

      <div className="mh__card mh__card--amber" style={{ marginTop: 16 }}>
        <div className="mh__kicker" style={{ color: "var(--mh-amber)" }}>
          ✦ GỢI Ý AI
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          Khoá {form.agenda.length} buổi cùng chuyên mục có giá trung bình <strong>2.1–2.8M₫</strong>. 15
          mentor khác đang bán khoảng giá này với NPS 4.7+.
        </p>
      </div>
    </>
  );
}

type Step5Props = StepCommon & {
  supplierId?: number;
  courseTitle: string;
  startDate: string;
  totalDurationMin: number;
};

function Step5({ form, errors, set, supplierId, courseTitle, startDate, totalDurationMin }: Step5Props) {
  const [creatingZoom, setCreatingZoom] = useState(false);
  const [zoomError, setZoomError] = useState<string | null>(null);
  const autoCreateZoom = async () => {
    if (!supplierId) {
      setZoomError("Chưa có session đăng nhập");
      return;
    }
    if (!startDate) {
      setZoomError("Đặt ngày bắt đầu (Bước 3) trước khi tạo Zoom");
      return;
    }
    if (!courseTitle.trim()) {
      setZoomError("Đặt tên khoá (Bước 1) trước khi tạo Zoom");
      return;
    }
    setCreatingZoom(true);
    setZoomError(null);
    try {
      const startAtIso = `${startDate}T19:00:00+07:00`; // 7pm VN default
      const res = await ZoomClientForCourseEdit.meetingCreate({
        mentorEmployeeId: supplierId,
        topic: courseTitle.trim(),
        agenda: `Tự động tạo từ MentorHub cho khoá: ${courseTitle.trim()}`,
        startAt: startAtIso,
        durationMin: Math.max(totalDurationMin, 60),
        settings: {
          autoRecord: "cloud",
          joinBeforeHost: true,
          muteOnEntry: true,
          waitingRoom: false,
        },
        metadataCourseId: 0, // placeholder, BE store metadata
        metadataSessionIndex: 0,
      });
      if (res?.code !== 0 || !res.result) {
        const msg = res?.message || "Không tạo được Zoom meeting";
        if (/403|forbidden|disabled|not.*linked/i.test(msg)) {
          setZoomError("Chưa kết nối Zoom — vào trang Tài khoản để link Zoom trước");
        } else {
          setZoomError(msg);
        }
        return;
      }
      set("zoomId", res.result.zoomMeetingId);
    } catch (err) {
      setZoomError(err instanceof Error ? err.message : "Lỗi mạng");
    } finally {
      setCreatingZoom(false);
    }
  };
  return (
    <>
      <h3>5. Tự động hoá &amp; Tích hợp</h3>
      <div className="mh-form__row">
        <label className="mh-form__label" htmlFor="course-zoom">
          Zoom Meeting ID <span className="mh-form__req">*</span>
        </label>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <input
            id="course-zoom"
            className={"mh-form__input" + (errors.zoomId ? " is-invalid" : "")}
            aria-invalid={!!errors.zoomId}
            value={form.zoomId}
            onChange={(e) => set("zoomId", e.target.value)}
            placeholder="892-4731-0028"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="mh__btn"
            onClick={autoCreateZoom}
            disabled={creatingZoom}
            title="Tạo Zoom meeting từ tài khoản đã kết nối"
            style={{ whiteSpace: "nowrap" }}
          >
            {creatingZoom ? "Đang tạo…" : "✨ Tạo tự động"}
          </button>
        </div>
        {errors.zoomId && <div className="mh-form__error">⚠ {errors.zoomId}</div>}
        {zoomError && (
          <div className="mh-form__error" style={{ background: "#fef3c7", color: "#92400e", padding: 8, borderRadius: 6, marginTop: 6 }}>
            ⚠ {zoomError}
          </div>
        )}
        <div className="mh-form__hint">
          Click <strong>Tạo tự động</strong> để hệ thống tạo Zoom meeting với recording cloud + auto-trigger AI summary sau buổi.
          Hoặc paste tay Zoom Meeting ID nếu đã có. Kết nối Zoom ở{" "}
          <Link to="/mh/account" className="mh-link">
            Tài khoản → Tích hợp Zoom
          </Link>
          .
        </div>
      </div>

      <div className="mh-form__row">
        <label className="mh-form__label">Nhắc học viên tự động</label>
        <div className="mh-form__toggle-list">
          <ToggleRow
            checked={form.reminderZalo}
            onChange={(v) => set("reminderZalo", v)}
            label="Gửi Zalo 24h và 30 phút trước buổi học"
            sub="Nhắc qua Zalo OA — cần kết nối ZNS"
          />
          <ToggleRow
            checked={form.reminderEmail}
            onChange={(v) => set("reminderEmail", v)}
            label="Gửi email 24h trước buổi học"
            sub="Email cá nhân hoá tên học viên + link Zoom"
          />
          <ToggleRow
            checked={form.autoFeedback}
            onChange={(v) => set("autoFeedback", v)}
            label="Gửi form đánh giá sau mỗi buổi"
            sub="Form ngắn 3 câu — NPS, nội dung, mentor"
          />
          <ToggleRow
            checked={form.autoRecording}
            onChange={(v) => set("autoRecording", v)}
            label="Tự động chuyển recording → AI meeting note"
            sub="Tóm tắt + action items gửi học viên trong 30 phút"
          />
        </div>
      </div>
    </>
  );
}

type Step6Props = {
  form: FormData;
  discountPct: number;
  totalAgendaMin: number;
  dateInfo: ReturnType<typeof formatDateInfo>;
};

function Step6({ form, discountPct, totalAgendaMin, dateInfo }: Step6Props) {
  return (
    <>
      <h3>6. Kiểm tra &amp; Publish</h3>
      <p className="mh-form__hint" style={{ marginBottom: 16 }}>
        Kiểm tra lần cuối thẻ khoá học sẽ hiển thị trên marketplace.
      </p>

      <div className="mh-form__review-card">
        <CoursePreviewCard form={form} discountPct={discountPct} totalAgendaMin={totalAgendaMin} large />
      </div>

      <div className="mh-form__review" style={{ marginTop: 18 }}>
        <ReviewRow label="Tên khoá" value={form.title} />
        <ReviewRow label="Chuyên mục" value={form.category} />
        <ReviewRow label="Số buổi" value={`${form.agenda.length} buổi · ${formatDuration(totalAgendaMin)}`} />
        <ReviewRow label="Sĩ số" value={`${form.capacity} học viên`} />
        <ReviewRow label="Bắt đầu" value={form.startDate ? `${dateInfo.long} · ${dateInfo.relative}` : "—"} />
        <ReviewRow
          label="Giá"
          value={
            form.price !== "" ? (
              <>
                {VND(+form.price)}₫
                {form.originalPrice !== "" && +form.originalPrice > +form.price ? (
                  <span style={{ color: "var(--mh-ink-soft)", marginLeft: 8, textDecoration: "line-through" }}>
                    {VND(+form.originalPrice)}₫
                  </span>
                ) : null}
                {discountPct > 0 ? (
                  <span className="mh__pill mh__pill--green" style={{ marginLeft: 8 }}>
                    -{discountPct}%
                  </span>
                ) : null}
              </>
            ) : (
              "—"
            )
          }
        />
        <ReviewRow label="Zoom ID" value={form.zoomId} />
        <ReviewRow
          label="Tự động hoá"
          value={
            [
              form.reminderZalo && "Zalo",
              form.reminderEmail && "Email",
              form.autoFeedback && "Feedback",
              form.autoRecording && "AI Note",
            ]
              .filter(Boolean)
              .join(" · ") || "Tắt hết"
          }
        />
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Reusable subcomponents
// ────────────────────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mh-form__review-row">
      <span className="mh-form__review-label">{label}</span>
      <span className="mh-form__review-value">
        {value || <em style={{ color: "var(--mh-red)" }}>Chưa nhập</em>}
      </span>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className={"mh-form__toggle-row" + (checked ? " is-on" : "")}>
      <span className="mh-form__toggle-text">
        <span className="mh-form__toggle-title">{label}</span>
        {sub && <span className="mh-form__toggle-sub">{sub}</span>}
      </span>
      <span className={"mh-form__switch" + (checked ? " is-on" : "")}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="mh-form__switch-knob" />
      </span>
    </label>
  );
}

function PriceInput({
  id,
  value,
  onChange,
  placeholder,
  invalid,
}: {
  id?: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const display = value === "" ? "" : VND(+value);
  return (
    <div className={"mh-form__price" + (invalid ? " is-invalid" : "")}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        className="mh-form__price-input"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          onChange(digits === "" ? "" : Math.min(+digits, 999_999_999));
        }}
        placeholder={placeholder}
        aria-invalid={invalid}
      />
      <span className="mh-form__price-suffix">₫</span>
    </div>
  );
}

function CoursePreviewCard({
  form,
  discountPct,
  totalAgendaMin,
  large = false,
}: {
  form: FormData;
  discountPct: number;
  totalAgendaMin: number;
  large?: boolean;
}) {
  const title = form.title || "Tên khoá học của bạn";
  const desc =
    form.description ||
    "Mô tả ngắn sẽ hiển thị ở đây. Hãy cho học viên biết họ sẽ học được gì sau khoá.";
  return (
    <div className={"mh-preview-card" + (large ? " is-large" : "")}>
      <div className="mh-preview-card__head">
        <div className="mh-preview-card__icon">{form.icon || "★"}</div>
        <span className="mh__pill mh__pill--upcoming">{form.category}</span>
      </div>
      <h4 className="mh-preview-card__title">{title}</h4>
      <p className="mh-preview-card__desc">{desc}</p>
      <div className="mh-preview-card__meta">
        <span>📚 {form.agenda.length} buổi</span>
        <span>⏱ {formatDuration(totalAgendaMin)}</span>
        <span>👥 {form.capacity || "—"} HV</span>
      </div>
      <div className="mh-preview-card__price">
        {form.price === "" ? (
          <span className="mh-preview-card__price-empty">Chưa định giá</span>
        ) : +form.price === 0 ? (
          <span className="mh-preview-card__price-free">Miễn phí</span>
        ) : (
          <>
            <span className="mh-preview-card__price-main">{VND(+form.price)}₫</span>
            {form.originalPrice !== "" && +form.originalPrice > +form.price ? (
              <span className="mh-preview-card__price-orig">{VND(+form.originalPrice)}₫</span>
            ) : null}
            {discountPct > 0 ? (
              <span className="mh__pill mh__pill--green">-{discountPct}%</span>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function formatDuration(totalMin: number): string {
  if (!totalMin) return "0 phút";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${h}h ${m}p`;
  if (h) return `${h}h`;
  return `${m}p`;
}

function formatDateInfo(iso: string): { long: string; relative: string } {
  if (!iso) return { long: "", relative: "" };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { long: "", relative: "" };
  const long = `${DAYS_VN[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  const today = new Date(new Date().toDateString());
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let relative = "";
  if (diff === 0) relative = "hôm nay";
  else if (diff === 1) relative = "ngày mai";
  else if (diff > 0) relative = `còn ${diff} ngày`;
  else relative = `đã qua ${-diff} ngày`;
  return { long, relative };
}

function timeAgo(at: Date): string {
  const sec = Math.round((Date.now() - at.getTime()) / 1000);
  if (sec < 5) return "vừa xong";
  if (sec < 60) return `${sec}s trước`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} phút trước`;
  return `${Math.round(min / 60)} giờ trước`;
}
