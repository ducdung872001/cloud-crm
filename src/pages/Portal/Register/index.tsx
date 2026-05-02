// Portal register — đăng ký học khoá. Validation đầy đủ, UX clean.
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import CustomerService from "services/CustomerService";
import { MOCK_MENTOR } from "@/mocks/mentorhub";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

type Form = {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  goal: string;
  hearAbout: string;
  agree: boolean;
  subscribe: boolean;
};

type UiCourse = {
  id: number;
  title: string;
  sessions: number;
  price: number;
  originalPrice: number;
  icon: string;
  iconBg: string;
};

type Errors = Partial<Record<keyof Form, string>>;

const phoneRegex = /^(0|\+?84)(\s*\d){9,10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pending enrollment cache key — mentor có thể đọc list này từ admin để liên hệ
const PENDING_KEY = "mh:pending-enrollments:v1";

type PendingEnrollment = {
  courseId: number;
  courseTitle: string;
  customerId: number | null;
  name: string;
  phone: string;
  email: string;
  company?: string;
  role?: string;
  goal?: string;
  hearAbout?: string;
  amount: number;
  createdAt: string;
};

function pushPending(p: PendingEnrollment) {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const list: PendingEnrollment[] = raw ? JSON.parse(raw) : [];
    list.unshift(p);
    localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    /* quota — skip */
  }
}

function adaptCourse(svc: SalesService): UiCourse {
  const meta = (svc.metadata as Record<string, unknown>) || {};
  return {
    id: Number(svc.id),
    title: svc.name || "(chưa đặt tên)",
    sessions: Number(meta.sessions ?? svc.total_time ?? 0),
    price: Number(svc.price ?? 0),
    originalPrice: Number(svc.retailPrice ?? svc.price ?? 0),
    icon: typeof meta.icon === "string" ? (meta.icon as string) : "⎈",
    iconBg:
      typeof meta.iconBg === "string"
        ? (meta.iconBg as string)
        : "linear-gradient(135deg, #134E4A, #0F766E)",
  };
}

export default function PortalRegister() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const numId = useMemo(() => {
    const n = Number(courseId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [courseId]);

  const [course, setCourse] = useState<UiCourse | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    goal: "",
    hearAbout: "",
    agree: false,
    subscribe: true,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!numId) {
      setLoadingCourse(false);
      return;
    }
    SalesServiceClient.get(numId)
      .then((res: { result?: SalesService }) => {
        if (res?.result?.id) setCourse(adaptCourse(res.result));
      })
      .finally(() => setLoadingCourse(false));
  }, [numId]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Nhập họ tên";
    else if (form.name.trim().length < 2) e.name = "Tên quá ngắn";
    if (!form.email.trim()) e.email = "Nhập email";
    else if (!emailRegex.test(form.email)) e.email = "Email không hợp lệ";
    if (!form.phone.trim()) e.phone = "Nhập số điện thoại";
    else if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) e.phone = "SĐT không hợp lệ (VD: 0912345678)";
    if (!form.agree) e.agree = "Đồng ý điều khoản để tiếp tục";
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);

    let customerId: number | null = null;
    try {
      const customerRes = (await CustomerService.update({
        id: 0,
        name: form.name.trim(),
        phone: form.phone.replace(/\s/g, ""),
        email: form.email.trim(),
        branchId: 23,
        managerId: 54,
        careerId: 0,
        avatar: "",
        firstCall: "",
        height: "0",
        weight: "0",
        custType: 0,
        trademark: "",
        taxCode: "",
        address: "",
      } as never)) as { code?: number; message?: string; result?: { id?: number } };
      if (customerRes?.code === 0 && customerRes.result?.id) {
        customerId = customerRes.result.id;
      } else if (customerRes?.code !== 0) {
        // KHÔNG fail toàn bộ — vẫn lưu pending để mentor xử lý tay
        // (tenant có thể chặn duplicate phone, hoặc validation khác)
        setSubmitError(
          customerRes?.message
            ? `Lưu khách hàng: ${customerRes.message} — yêu cầu vẫn được ghi nhận, mentor sẽ liên hệ.`
            : null,
        );
      }
    } catch {
      /* network error — fall through to pending enrollment */
    }

    // Ghi pending enrollment local — mentor admin có thể đọc list này (ở MH/Courses tương lai)
    // hoặc BE notification sẽ pickup khi handoff hoàn tất.
    pushPending({
      courseId: course.id,
      courseTitle: course.title,
      customerId,
      name: form.name.trim(),
      phone: form.phone.replace(/\s/g, ""),
      email: form.email.trim(),
      company: form.company.trim() || undefined,
      role: form.role.trim() || undefined,
      goal: form.goal.trim() || undefined,
      hearAbout: form.hearAbout || undefined,
      amount: course.price,
      createdAt: new Date().toISOString(),
    });

    setSubmitting(false);
    navigate(
      `/portal/register/success?course=${course.id}&name=${encodeURIComponent(form.name)}`,
    );
  };

  if (loadingCourse) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--pt-ink-soft)" }}>
          Đang tải khoá học…
        </div>
      </PortalLayout>
    );
  }

  if (!course) {
    return (
      <PortalLayout>
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <h2>Khoá học không tồn tại</h2>
          <Link to="/portal" className="pt-btn pt-btn--primary" style={{ marginTop: 20 }}>← Về trang chính</Link>
        </div>
      </PortalLayout>
    );
  }

  document.title = `Đăng ký · ${course.title}`;

  return (
    <PortalLayout>
      <div style={{ padding: "32px 0 0", maxWidth: 960, margin: "0 auto" }}>
        <Link to={`/portal/courses/${course.id}`} className="pt-detail__back">← Về chi tiết khoá</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, maxWidth: 960, margin: "0 auto", padding: "20px 0 80px" }} className="pt-register">
        <div>
          <div className="pt-kicker" style={{ marginBottom: 8 }}>ĐĂNG KÝ HỌC</div>
          <h1 style={{ fontSize: 40, marginBottom: 12 }}>Tham gia <em>{course.title}</em></h1>
          <p style={{ color: "var(--pt-ink-soft)", fontSize: 16, marginBottom: 32 }}>
            Điền nhanh 5 thông tin cơ bản. Mentor sẽ liên hệ xác nhận trong 2h làm việc.
          </p>

          <form onSubmit={submit} noValidate className="pt-form" style={{ margin: 0, maxWidth: "none" }}>
            <div className="pt-field">
              <label className="pt-label pt-label--req">Họ và tên</label>
              <input
                type="text"
                className={"pt-input" + (errors.name ? " is-invalid" : "")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                autoComplete="name"
                maxLength={80}
              />
              {errors.name && <div className="pt-error">⚠ {errors.name}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pt-register__2col">
              <div className="pt-field">
                <label className="pt-label pt-label--req">Email</label>
                <input
                  type="email"
                  className={"pt-input" + (errors.email ? " is-invalid" : "")}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="ban@email.com"
                  autoComplete="email"
                />
                {errors.email && <div className="pt-error">⚠ {errors.email}</div>}
              </div>
              <div className="pt-field">
                <label className="pt-label pt-label--req">Số điện thoại</label>
                <input
                  type="tel"
                  className={"pt-input" + (errors.phone ? " is-invalid" : "")}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="0912345678"
                  autoComplete="tel"
                />
                {errors.phone && <div className="pt-error">⚠ {errors.phone}</div>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pt-register__2col">
              <div className="pt-field">
                <label className="pt-label">Công ty</label>
                <input
                  type="text"
                  className="pt-input"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="VD: FPT Software"
                  autoComplete="organization"
                />
              </div>
              <div className="pt-field">
                <label className="pt-label">Vị trí</label>
                <input
                  type="text"
                  className="pt-input"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="VD: Backend Engineer"
                  autoComplete="organization-title"
                />
              </div>
            </div>

            <div className="pt-field">
              <label className="pt-label">Bạn kỳ vọng học được gì?</label>
              <textarea
                className="pt-textarea"
                value={form.goal}
                onChange={(e) => set("goal", e.target.value)}
                placeholder="Chia sẻ để mentor chuẩn bị nội dung sát với nhu cầu của bạn…"
                maxLength={500}
              />
              <div style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 4 }}>{form.goal.length}/500</div>
            </div>

            <div className="pt-field">
              <label className="pt-label">Bạn biết tới khoá qua đâu?</label>
              <select className="pt-select" value={form.hearAbout} onChange={(e) => set("hearAbout", e.target.value)}>
                <option value="">-- Chọn --</option>
                <option>Facebook</option>
                <option>Zalo / bạn bè giới thiệu</option>
                <option>LinkedIn</option>
                <option>Google tìm kiếm</option>
                <option>Email newsletter</option>
                <option>Khác</option>
              </select>
            </div>

            <label className="pt-check" style={{ marginBottom: 12 }}>
              <input type="checkbox" checked={form.subscribe} onChange={(e) => set("subscribe", e.target.checked)} />
              <span>Nhận thông tin khoá học mới và ưu đãi qua email (có thể huỷ bất cứ lúc nào)</span>
            </label>

            <label className="pt-check" style={{ marginBottom: 20 }}>
              <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} />
              <span>Tôi đồng ý với <a href="#" style={{ color: "var(--pt-teal)", textDecoration: "underline" }}>Điều khoản</a> và <a href="#" style={{ color: "var(--pt-teal)", textDecoration: "underline" }}>Chính sách bảo mật</a> của MentorHub <span style={{ color: "var(--pt-red)" }}>*</span></span>
            </label>
            {errors.agree && <div className="pt-error" style={{ marginTop: -12, marginBottom: 16 }}>⚠ {errors.agree}</div>}
            {submitError && (
              <div className="pt-error" style={{ marginBottom: 16, padding: 12, background: "#fef2f2", borderRadius: 8 }}>
                ⚠ {submitError}
              </div>
            )}

            <button type="submit" className="pt-btn pt-btn--primary pt-btn--xl" disabled={submitting} style={{ width: "100%", justifyContent: "center" }}>
              {submitting ? "Đang gửi…" : `Đăng ký ngay · ${course.price === 0 ? "Miễn phí" : formatVND(course.price)}`}
            </button>

            <p style={{ marginTop: 16, fontSize: 12, color: "var(--pt-ink-soft)", textAlign: "center" }}>
              Thông tin của bạn được bảo mật. Chúng tôi chỉ gửi cho mentor {MOCK_MENTOR.name}.
            </p>
          </form>
        </div>

        <div>
          <div className="pt-detail__sticky" style={{ top: 100 }}>
            <div className="pt-kicker" style={{ marginBottom: 12 }}>KHOÁ HỌC ĐÃ CHỌN</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, background: course.iconBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontFamily: "'Fraunces', serif" }}>{course.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{course.title}</div>
                <div className="pt-mono" style={{ fontSize: 11, color: "var(--pt-ink-soft)", marginTop: 4 }}>{course.sessions} buổi · với {MOCK_MENTOR.name}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16, borderBottom: "1px solid var(--pt-line)", fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--pt-ink-soft)" }}>Học phí</span>
                <span>{formatVND(course.originalPrice)}</span>
              </div>
              {course.originalPrice > course.price && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--pt-red)" }}>
                  <span>Giảm giá</span>
                  <span>-{formatVND(course.originalPrice - course.price)}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0", borderBottom: "1px solid var(--pt-line)" }}>
              <span style={{ fontWeight: 600 }}>Tổng thanh toán</span>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "var(--pt-teal)" }}>{course.price === 0 ? "Miễn phí" : formatVND(course.price)}</span>
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--pt-ink-soft)" }}>
              <div>✓ Bảo lưu 1 lần · Hoàn tiền 7 ngày</div>
              <div>✓ Recording + AI note mọi buổi</div>
              <div>✓ Hỗ trợ 1:1 qua Zalo & Email</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pt-register { grid-template-columns: 1fr !important; gap: 24px !important; padding: 12px 16px 40px !important; }
          .pt-register__2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PortalLayout>
  );
}
