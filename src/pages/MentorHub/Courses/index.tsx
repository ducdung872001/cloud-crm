// [MH] MentorHub - Danh sách khoá học của mentor
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext, ContextType } from "contexts/userContext";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import { MOCK_COURSES, MOCK_MENTOR } from "@/mocks/mentorhub";
import "../_shared/styles.scss";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

type UiStatus = "live" | "upcoming" | "draft" | "ended";

type UiCourse = {
  id: string | number;
  title: string;
  status: UiStatus;
  sessions: number;
  sessionsDone: number;
  price: number;
  originalPrice: number;
  registered: number;
  capacity: number;
  revenue: number;
  nps: number;
  icon: string;
  iconBg: string;
};

type Filter = "all" | UiStatus;

const ICON_PALETTE = [
  { icon: "⎈", bg: "linear-gradient(135deg, #134E4A, #0F766E)" },
  { icon: "∞", bg: "linear-gradient(135deg, #1E40AF, #3B82F6)" },
  { icon: "◈", bg: "linear-gradient(135deg, #374151, #6B7280)" },
  { icon: "⚡", bg: "linear-gradient(135deg, #B45309, #F59E0B)" },
  { icon: "★", bg: "linear-gradient(135deg, #0F766E, #5EEAD4)" },
];

function deriveUiStatus(svc: SalesService): UiStatus {
  if ((svc.status || "").toUpperCase() === "DRAFT" || svc.active === 0) return "draft";
  if ((svc.status || "").toUpperCase() === "ARCHIVED") return "ended";
  const m = (svc.metadata as Record<string, unknown>) || {};
  const done = Number(m.sessionsDone ?? 0);
  const total = Number(m.sessions ?? svc.total_time ?? 0);
  if (total > 0 && done >= total) return "ended";
  if (done === 0) return "upcoming";
  return "live";
}

function adaptService(svc: SalesService, idx: number): UiCourse {
  const m = (svc.metadata as Record<string, unknown>) || {};
  const palette = ICON_PALETTE[idx % ICON_PALETTE.length];
  return {
    id: svc.id ?? svc.uid ?? `srv-${idx}`,
    title: svc.name || "(chưa đặt tên)",
    status: deriveUiStatus(svc),
    sessions: Number(m.sessions ?? svc.total_time ?? 0),
    sessionsDone: Number(m.sessionsDone ?? 0),
    price: Number(svc.price ?? 0),
    originalPrice: Number(svc.retailPrice ?? svc.price ?? 0),
    registered: Number(m.registered ?? 0),
    capacity: Number(m.capacity ?? 0),
    revenue: Number(m.revenue ?? 0),
    nps: Number(m.nps ?? 0),
    icon: typeof m.icon === "string" ? (m.icon as string) : palette.icon,
    iconBg: typeof m.iconBg === "string" ? (m.iconBg as string) : palette.bg,
  };
}

export default function MentorHubCoursesPage() {
  document.title = "MentorHub · Khoá học";
  const ctx = useContext(UserContext) as ContextType;
  const employeeId = ctx?.idEmployee;

  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState(false);
  const [courses, setCourses] = useState<UiCourse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (!employeeId) {
      // Chưa có session — fall back mock để showcase trang vẫn render
      setCourses(MOCK_COURSES as unknown as UiCourse[]);
      setUsingMock(true);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    SalesServiceClient.list(
      { type: "COURSE_LIVE", supplierId: employeeId, page: 1, limit: 50 },
      ctrl.signal,
    )
      .then((res: { code?: number; result?: { items?: SalesService[] } | SalesService[] }) => {
        const result = res?.result ?? [];
        const items: SalesService[] = Array.isArray(result)
          ? (result as SalesService[])
          : ((result as { items?: SalesService[] }).items ?? []);
        if (items.length === 0) {
          // BE chưa có khoá nào — empty state, không fallback mock
          setCourses([]);
          setUsingMock(false);
        } else {
          setCourses(items.map(adaptService));
          setUsingMock(false);
        }
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        // API lỗi — fallback mock + báo banner
        setError(err.message || "Không tải được danh sách khoá học");
        setCourses(MOCK_COURSES as unknown as UiCourse[]);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [employeeId]);

  const list = courses ?? [];
  const filtered = filter === "all" ? list : list.filter((c) => c.status === filter);
  const liveCount = list.filter((c) => c.status === "live").length;

  // Trang public của mentor — danh sách khoá học khách thấy được
  const publicPath = `/crm/portal/mentors/${MOCK_MENTOR.id}`;
  const publicUrl = (typeof window !== "undefined" ? window.location.origin : "") + publicPath;

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mh">
      <div className="mh__hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div className="mh__kicker">QUẢN LÝ</div>
          <h1>Khoá học của <em>tôi</em></h1>
          <p style={{ color: "var(--mh-ink-soft)", marginTop: 8 }}>
            {loading ? "Đang tải…" : `${list.length} khoá · ${liveCount} đang diễn ra`}
            {usingMock && !loading ? " · Demo data" : ""}
          </p>
        </div>
        <Link to="/mh/courses/new" className="mh__btn mh__btn--primary">+ Tạo khoá mới</Link>
      </div>

      {error && (
        <div className="mh__card" style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b", marginBottom: 16, padding: 12 }}>
          ⚠ {error} — đang hiển thị dữ liệu demo.
        </div>
      )}

      {/* Public marketplace link — mentor hay quên URL public */}
      <div className="mh-public-link">
        <div className="mh-public-link__left">
          <span className="mh-public-link__kicker">TRANG PUBLIC</span>
          <a
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mh-public-link__url"
            title={publicUrl}
          >
            {publicPath}
          </a>
        </div>
        <div className="mh-public-link__right">
          <button type="button" className="mh-public-link__btn" onClick={copyPublicUrl}>
            {copied ? "✓ Đã copy" : "📋 Copy link"}
          </button>
          <a
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mh-public-link__btn mh-public-link__btn--primary"
          >
            Mở trang public ↗
          </a>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "live", "upcoming", "draft", "ended"] as Filter[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="mh__btn" style={filter === s ? { borderColor: "var(--mh-teal)", background: "var(--mh-ivory-2)" } : {}}>
            {s === "all" ? "Tất cả" : s === "live" ? "Đang live" : s === "upcoming" ? "Sắp bắt đầu" : s === "draft" ? "Nháp" : "Đã kết thúc"}
          </button>
        ))}
      </div>

      {!loading && list.length === 0 && !error && (
        <div className="mh__card" style={{ padding: 32, textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Chưa có khoá học nào</h3>
          <p style={{ color: "var(--mh-ink-soft)", marginBottom: 16 }}>
            Bắt đầu bằng cách tạo khoá đầu tiên — học viên sẽ thấy trên trang public của bạn.
          </p>
          <Link to="/mh/courses/new" className="mh__btn mh__btn--primary">+ Tạo khoá đầu tiên</Link>
        </div>
      )}

      <div className="mh__grid mh__grid--3" style={{ gap: 20 }}>
        {filtered.map((c) => (
          <div key={c.id} className="mh__card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: c.iconBg, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#fff", fontFamily: "'Fraunces', serif" }}>
              {c.icon}
            </div>
            <div style={{ padding: 20 }}>
              <span className={`mh__pill mh__pill--${c.status}`}>{c.status === "live" ? "● Đang live" : c.status === "upcoming" ? "Sắp bắt đầu" : c.status === "draft" ? "Nháp" : "Đã kết thúc"}</span>
              <h3 style={{ margin: "12px 0 16px", fontSize: 18 }}>{c.title}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--mh-ink-soft)", marginBottom: 10 }} className="mh__mono">
                <span>{c.sessionsDone}/{c.sessions} buổi</span>
                <span>{c.registered}/{c.capacity} HV</span>
                {c.nps > 0 && <span>NPS {c.nps}</span>}
              </div>
              <div className="mh__progress" style={{ marginBottom: 16 }}>
                <div className="mh__progress-fill" style={{ width: `${c.sessions > 0 ? (c.sessionsDone / c.sessions) * 100 : 0}%` }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="mh__mono" style={{ fontSize: 13, color: "var(--mh-teal)", fontWeight: 600 }}>{formatVND(c.revenue)}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mh__btn"
                    style={{ padding: "6px 10px", fontSize: 13 }}
                    title="Xem trên trang public"
                  >
                    ↗
                  </a>
                  <Link to={`/mh/courses/${c.id}/edit`} className="mh__btn" style={{ padding: "6px 14px", fontSize: 13 }}>Sửa</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
