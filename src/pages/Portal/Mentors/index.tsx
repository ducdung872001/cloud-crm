// Portal mentors list — public directory of mentors
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PortalLayout from "../_shared/PortalLayout";
import SalesServiceClient, { SalesService } from "services/SalesServiceClient";
import { apiGet } from "services/apiHelper";
import { urlsApi } from "configs/urls";

type RealMentor = {
  id: string;
  numericId: number;
  name: string;
  short: string;
  title: string;
  bio: string;
  avatarBg: string;
  courses: number;
  students: number;
  nps: number;
  tags: string[];
  verified: boolean;
};

function shortName(full: string): string {
  return full
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PALETTE_BG = ["#134E4A", "#B45309", "#166534", "#7C2D12", "#1E40AF", "#0F766E", "#991B1B"];

// Extended mentor directory — mock fallback (cho những mentor chưa có data thật)
const MENTORS = [
  { id: "MT-001", name: "Nguyễn Trọng Khoa", short: "NT", title: "Principal Engineer, Ex-Grab", bio: "12 năm kinh nghiệm hệ thống quy mô lớn. Dẫn dắt team 20+ engineers tại Grab Indonesia.", avatarBg: "#134E4A", courses: 3, students: 1240, nps: 4.92, tags: ["Microservices", "Distributed Systems", "K8s"], verified: true },
  { id: "MT-002", name: "Phạm Thu Hà", short: "PH", title: "Senior Product Manager · TPBank", bio: "10 năm product cho banking & fintech. Đã launch 12+ products phục vụ 5M users.", avatarBg: "#B45309", courses: 2, students: 450, nps: 4.88, tags: ["Product Strategy", "Fintech", "B2B SaaS"], verified: true },
  { id: "MT-003", name: "Vũ Hoàng Nam", short: "VN", title: "Staff Engineer · Shopee", bio: "Search & recommendation engines cho e-commerce. Ex-Google Singapore.", avatarBg: "#166534", courses: 4, students: 820, nps: 4.95, tags: ["Search", "ML", "E-commerce"], verified: true },
  { id: "MT-004", name: "Đặng Minh Tuấn", short: "ĐT", title: "Engineering Director · Momo", bio: "Xây dựng và mở rộng tech team từ 30 lên 180 kỹ sư trong 3 năm.", avatarBg: "#7C2D12", courses: 2, students: 340, nps: 4.79, tags: ["Leadership", "Engineering Management", "Hiring"], verified: true },
  { id: "MT-005", name: "Lê Thanh Hương", short: "LH", title: "Head of Data · VNG", bio: "Data platform cho 100M+ users. Spark, Kafka, dbt ở production scale.", avatarBg: "#1E40AF", courses: 3, students: 610, nps: 4.91, tags: ["Data Engineering", "Analytics", "MLOps"], verified: true },
  { id: "MT-006", name: "Trần Minh Quân", short: "TQ", title: "CTO · Seedstage Fintech", bio: "Đồng sáng lập 2 startup. Từng bootstrap từ 0 đến Series A với đội dev 5 người.", avatarBg: "#991B1B", courses: 1, students: 180, nps: 4.83, tags: ["Startup", "Full-stack", "Bootstrap"], verified: false },
  { id: "MT-007", name: "Hoàng Thu Trang", short: "HT", title: "UX Research Lead · Tiki", bio: "User research cho 15M+ người dùng Việt. Methodology + stakeholder management.", avatarBg: "#0F766E", courses: 2, students: 290, nps: 4.87, tags: ["UX Research", "Design Thinking", "UI/UX"], verified: true },
  { id: "MT-008", name: "Bùi Đức Năng", short: "BN", title: "Solution Architect · TNTech", bio: "Cloud migration, hybrid architecture, Azure & AWS certified pro.", avatarBg: "#0F766E", courses: 2, students: 225, nps: 4.76, tags: ["Cloud", "Architecture", "Azure"], verified: false },
];

const CATEGORIES = ["all", "Kỹ thuật", "Product", "Leadership", "Data", "Design"];

export default function PortalMentors() {
  document.title = "Mentors · MentorHub";
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("all");
  const [realMentors, setRealMentors] = useState<RealMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    let cancelled = false;
    async function load() {
      setLoading(true);
      // Step 1: fetch all active courses → extract unique supplierIds
      const svcRes = (await SalesServiceClient.list(
        { type: "COURSE_LIVE", status: "ACTIVE", page: 1, limit: 200 },
        ctrl.signal,
      ).catch(() => null)) as { result?: { items?: SalesService[] } | SalesService[] } | null;
      const result = svcRes?.result ?? [];
      const items: SalesService[] = Array.isArray(result)
        ? (result as SalesService[])
        : ((result as { items?: SalesService[] }).items ?? []);
      const supplierMap = new Map<number, { courseCount: number; studentCount: number }>();
      for (const s of items) {
        const sid = Number(s.supplierId);
        if (!sid || !Number.isFinite(sid) || sid <= 0) continue;
        const meta = (s.metadata as Record<string, unknown>) || {};
        const reg = Number(meta.registered ?? 0);
        const cur = supplierMap.get(sid) ?? { courseCount: 0, studentCount: 0 };
        supplierMap.set(sid, {
          courseCount: cur.courseCount + 1,
          studentCount: cur.studentCount + reg,
        });
      }
      // Step 2: fetch each unique employee profile (parallel)
      const ids = Array.from(supplierMap.keys());
      const profiles = await Promise.all(
        ids.map((id) =>
          apiGet(urlsApi.employee.detail, { id }, ctrl.signal).catch(() => null),
        ),
      );
      if (cancelled) return;
      const real: RealMentor[] = [];
      ids.forEach((id, i) => {
        const empWrap = profiles[i] as { result?: { id?: number; name?: string; title?: string; departmentName?: string; branchName?: string; avatar?: string } } | null;
        const emp = empWrap?.result;
        if (!emp || !emp.id) return;
        const stats = supplierMap.get(id)!;
        real.push({
          id: String(emp.id),
          numericId: id,
          name: emp.name || `Mentor #${id}`,
          short: shortName(emp.name || "M"),
          title: emp.title || emp.departmentName || "Mentor",
          bio: emp.title
            ? `${emp.title}${emp.branchName ? " · " + emp.branchName : ""}`
            : "Mentor đang xây dựng hồ sơ giới thiệu.",
          avatarBg: PALETTE_BG[i % PALETTE_BG.length],
          courses: stats.courseCount,
          students: stats.studentCount,
          nps: 0,
          tags: [],
          verified: false,
        });
      });
      setRealMentors(real);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, []);

  // Hiển thị: real mentors trước, mock list sau (cho marketing showcase)
  const combined = [...realMentors, ...MENTORS.filter((m) => !realMentors.some((r) => r.name === m.name))];

  const filtered = combined.filter((m) => {
    if (search && !(m.name + m.title + m.bio + m.tags.join(" ")).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PortalLayout>
      <section className="pt-hero" style={{ padding: "60px 0 40px" }}>
        <div className="pt-hero__eyebrow">✦ {loading ? "Đang tải" : `${combined.length}`} MENTOR ĐANG HOẠT ĐỘNG{realMentors.length > 0 && ` · ${realMentors.length} mentor thật`}</div>
        <h1 style={{ fontSize: 52 }}>
          Gặp những <em>chuyên gia</em> đứng sau mỗi khoá học.
        </h1>
        <p className="pt-hero__tag" style={{ marginTop: 20 }}>
          Mentor của MentorHub đều đang làm việc thực tế tại các công ty công nghệ hàng đầu Việt Nam — Grab, Shopee, VNG, Momo, TPBank, Tiki.
        </p>
      </section>

      <section className="pt-section" style={{ paddingTop: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍 Tìm mentor theo tên, công ty, chuyên môn…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pt-input"
            style={{ flex: 1, minWidth: 260 }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button key={c} className={"pt-filter" + (tag === c ? " is-active" : "")} onClick={() => setTag(c)}>
                {c === "all" ? "Tất cả" : c}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-grid">
          {filtered.map((m) => (
            <Link key={m.id} to={`/portal/mentors/${m.id}`} className="pt-ccard" style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: m.avatarBg, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 22, flexShrink: 0 }}>{m.short}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h3 style={{ fontSize: 20, margin: 0 }}>{m.name}</h3>
                    {m.verified && <span title="Đã xác thực" style={{ color: "var(--pt-teal)", fontSize: 16 }}>✓</span>}
                  </div>
                  <div className="pt-mono" style={{ fontSize: 12, color: "var(--pt-ink-soft)", marginTop: 4 }}>{m.title}</div>
                </div>
              </div>

              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--pt-ink-soft)", marginBottom: 16, minHeight: 66 }}>{m.bio}</p>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {m.tags.map((t) => (
                  <span key={t} style={{ padding: "3px 10px", background: "var(--pt-ivory-2)", borderRadius: 999, fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "var(--pt-ink-soft)" }}>{t}</span>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, paddingTop: 16, borderTop: "1px solid var(--pt-line)" }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: "var(--pt-teal)", lineHeight: 1 }}>{m.courses}</div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", marginTop: 4 }}>KHOÁ HỌC</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: "var(--pt-teal)", lineHeight: 1 }}>{m.students.toLocaleString()}</div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", marginTop: 4 }}>HỌC VIÊN</div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: "var(--pt-teal)", lineHeight: 1 }}>{m.nps}</div>
                  <div className="pt-mono" style={{ fontSize: 10, color: "var(--pt-ink-soft)", marginTop: 4 }}>★ NPS</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--pt-ink-soft)" }}>
            Không tìm thấy mentor phù hợp với "{search}"
          </div>
        )}
      </section>

      <section className="pt-section" style={{ textAlign: "center", paddingTop: 40 }}>
        <div className="pt-section__eyebrow">TRỞ THÀNH MENTOR</div>
        <h2 style={{ marginTop: 8, marginBottom: 16 }}>Bạn cũng là <em>chuyên gia</em>?</h2>
        <p style={{ color: "var(--pt-ink-soft)", fontSize: 17, maxWidth: 520, margin: "0 auto 28px" }}>
          Chia sẻ kinh nghiệm, kiếm thêm thu nhập, và xây dựng thương hiệu cá nhân.
        </p>
        <Link to="/login" className="pt-btn pt-btn--primary pt-btn--xl">Đăng ký làm Mentor →</Link>
      </section>
    </PortalLayout>
  );
}

export { MENTORS };
